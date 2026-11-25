/* ==========================================================================
   Modul Belajar System Analyst - Reader Application Logic
   Offline-capable Markdown renderer + Mermaid integration + Search + Progress
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_THEME = "sa_modul_theme_v1";
  const STORAGE_DONE = "sa_modul_done_v1";
  const STORAGE_CHECKS = "sa_modul_checks_v1";

  const docs = Array.isArray(window.SA_DOCS) ? window.SA_DOCS : [];
  const docMap = new Map(docs.map((d) => [d.path, d]));

  const els = {
    html: document.documentElement,
    announcer: document.getElementById("sr-announcer"),
    sidebar: document.getElementById("sidebar-nav"),
    sidebarBackdrop: document.getElementById("sidebar-backdrop"),
    menuToggle: document.getElementById("menu-toggle"),
    sidebarClose: document.getElementById("sidebar-close"),
    navGroups: document.getElementById("nav-groups"),
    progressCount: document.getElementById("progress-count"),
    progressFill: document.getElementById("progress-fill"),
    main: document.getElementById("main-content"),
    readerStatus: document.getElementById("reader-status"),
    articleShell: document.getElementById("article-shell"),
    docGroupLabel: document.getElementById("doc-group-label"),
    markCompleteBtn: document.getElementById("mark-complete-btn"),
    printBtn: document.getElementById("print-btn"),
    inlineTocBox: document.getElementById("inline-toc-box"),
    inlineTocList: document.getElementById("inline-toc-list"),
    asideTocList: document.getElementById("aside-toc-list"),
    markdownBody: document.getElementById("markdown-body"),
    prevLink: document.getElementById("prev-doc-link"),
    prevTitle: document.getElementById("prev-doc-title"),
    nextLink: document.getElementById("next-doc-link"),
    nextTitle: document.getElementById("next-doc-title"),
    backToTopBtn: document.getElementById("back-to-top-btn"),
    themeToggle: document.getElementById("theme-toggle"),
    themeLabel: document.getElementById("theme-label"),
    searchOpenBtn: document.getElementById("search-open-btn"),
    searchDialog: document.getElementById("search-dialog"),
    searchInput: document.getElementById("search-input"),
    searchCloseBtn: document.getElementById("search-close-btn"),
    searchResults: document.getElementById("search-results"),
  };

  let currentDoc = null;
  let lastFocusedBeforeDrawer = null;

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota errors in restricted browsing modes.
    }
  }

  function announce(msg) {
    if (!els.announcer) return;
    els.announcer.textContent = "";
    requestAnimationFrame(() => {
      els.announcer.textContent = msg;
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugify(text) {
    return String(text)
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function resolveRelativePath(baseDocPath, href) {
    if (!href) return href;
    if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
    if (href.startsWith("#")) return href;

    const [pathPart, hashPart] = href.split("#");
    const baseParts = baseDocPath.split("/");
    baseParts.pop();

    const relParts = pathPart.split("/");
    for (const part of relParts) {
      if (!part || part === ".") continue;
      if (part === "..") {
        if (baseParts.length > 0) baseParts.pop();
      } else {
        baseParts.push(part);
      }
    }
    const resolved = baseParts.join("/");
    if (docMap.has(resolved)) {
      return `#doc=${encodeURIComponent(resolved)}${hashPart ? `&section=${encodeURIComponent(hashPart)}` : ""}`;
    }
    return href;
  }

  function formatInline(raw, baseDocPath) {
    const codeTokens = [];
    let work = raw.replace(/`([^`]+)`/g, (_, code) => {
      const idx = codeTokens.length;
      codeTokens.push(`<code>${escapeHtml(code)}</code>`);
      return `\u0000CODE${idx}\u0000`;
    });

    const linkTokens = [];
    work = work.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const idx = linkTokens.length;
      const target = resolveRelativePath(baseDocPath, href.trim());
      const isExternal = /^https?:/i.test(target);
      const attrs = isExternal ? ` target="_blank" rel="noopener noreferrer"` : "";
      linkTokens.push(`<a href="${escapeHtml(target)}"${attrs}>${formatInlineBasic(label)}</a>`);
      return `\u0000LINK${idx}\u0000`;
    });

    work = formatInlineBasic(work);

    work = work.replace(/\u0000LINK(\d+)\u0000/g, (_, i) => linkTokens[Number(i)]);
    work = work.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => codeTokens[Number(i)]);
    return work;
  }

  function formatInlineBasic(text) {
    let s = escapeHtml(text);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return s;
  }

  function splitTableRow(line) {
    let trimmed = line.trim();
    if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
    if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
    return trimmed.split("|").map((cell) => cell.trim());
  }

  function isTableSeparator(line) {
    return /^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(line);
  }

  function renderMarkdown(md, docPath) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    const out = [];
    const headings = [];
    const usedSlugs = new Map();
    const savedChecks = loadJson(STORAGE_CHECKS, {});
    const docChecks = savedChecks[docPath] || {};
    let checkIdx = 0;
    let i = 0;

    function uniqueSlug(title) {
      const base = slugify(title) || "bagian";
      const count = usedSlugs.get(base) || 0;
      usedSlugs.set(base, count + 1);
      return count === 0 ? base : `${base}-${count}`;
    }

    while (i < lines.length) {
      const line = lines[i];

      // Fenced code or Mermaid block
      const fenceMatch = line.match(/^(`{3,4})(.*)$/);
      if (fenceMatch) {
        const fence = fenceMatch[1];
        const closeRe = new RegExp(`^\\s*${fence}\\s*$`);
        const lang = fenceMatch[2].trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !closeRe.test(lines[i])) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing fence
        const codeBody = codeLines.join("\n");

        if (lang.toLowerCase() === "mermaid") {
          const encoded = escapeHtml(codeBody);
          out.push(
            `<div class="mermaid-card" data-mermaid-src="${encoded}">` +
              `<div class="mermaid-card-bar">` +
                `<span>Diagram Alur / Model (Mermaid)</span>` +
                `<div class="mermaid-card-actions">` +
                  `<button type="button" class="copy-code-btn toggle-mermaid-zoom" aria-pressed="false">Ukuran Asli</button>` +
                  `<button type="button" class="copy-code-btn toggle-mermaid-src">Lihat Kode</button>` +
                  `<button type="button" class="copy-code-btn copy-mermaid-btn">Salin</button>` +
                `</div>` +
              `</div>` +
              `<div class="mermaid-scroll"><div class="mermaid-render"></div></div>` +
              `<pre class="mermaid-fallback" hidden><code>${encoded}</code></pre>` +
              `<div class="mermaid-note" hidden></div>` +
            `</div>`
          );
        } else {
          const label = lang ? lang.toUpperCase() : "TEKS";
          out.push(
            `<div class="code-block-wrap">` +
              `<div class="code-block-header">` +
                `<span>${escapeHtml(label)}</span>` +
                `<button type="button" class="copy-code-btn">Salin</button>` +
              `</div>` +
              `<pre><code>${escapeHtml(codeBody)}</code></pre>` +
            `</div>`
          );
        }
        continue;
      }

      // Blank line
      if (/^\s*$/.test(line)) {
        i++;
        continue;
      }

      // Horizontal rule
      if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
        out.push("<hr>");
        i++;
        continue;
      }

      // Headings
      const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (hMatch) {
        const level = hMatch[1].length;
        const rawTitle = hMatch[2].trim();
        const id = uniqueSlug(rawTitle);
        if (level === 2 || level === 3) {
          headings.push({ level, id, text: rawTitle.replace(/[*`]/g, "") });
        }
        out.push(`<h${level} id="${escapeHtml(id)}">${formatInline(rawTitle, docPath)}</h${level}>`);
        i++;
        continue;
      }

      // Blockquote
      if (/^\s*>\s?/.test(line)) {
        const bqLines = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          bqLines.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        const inner = renderMarkdown(bqLines.join("\n"), docPath).html;
        out.push(`<blockquote>${inner}</blockquote>`);
        continue;
      }

      // GFM Table
      if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
        const headers = splitTableRow(line);
        i += 2; // skip header & separator
        const rows = [];
        while (i < lines.length && lines[i].includes("|") && !/^\s*$/.test(lines[i])) {
          rows.push(splitTableRow(lines[i]));
          i++;
        }
        let html = `<div class="table-scroll"><table><thead><tr>`;
        for (const th of headers) {
          html += `<th>${formatInline(th, docPath)}</th>`;
        }
        html += `</tr></thead><tbody>`;
        for (const row of rows) {
          html += `<tr>`;
          for (let c = 0; c < headers.length; c++) {
            html += `<td>${formatInline(row[c] || "", docPath)}</td>`;
          }
          html += `</tr>`;
        }
        html += `</tbody></table></div>`;
        out.push(html);
        continue;
      }

      // Unordered or Ordered List
      const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
      const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (ulMatch || olMatch) {
        const isOrdered = Boolean(olMatch);
        const tag = isOrdered ? "ol" : "ul";
        const items = [];
        while (i < lines.length) {
          const curr = lines[i];
          const m = isOrdered
            ? curr.match(/^\s*\d+\.\s+(.*)$/)
            : curr.match(/^\s*[-*+]\s+(.*)$/);
          if (!m) break;
          let itemText = m[1];
          i++;
          // Continuation lines indented
          while (
            i < lines.length &&
            /^\s{2,}[^\s]/.test(lines[i]) &&
            !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) &&
            !/^```/.test(lines[i])
          ) {
            itemText += " " + lines[i].trim();
            i++;
          }
          const taskMatch = !isOrdered && itemText.match(/^\[( |x|X)\]\s+(.*)$/);
          if (taskMatch) {
            const idx = checkIdx++;
            const defaultChecked = taskMatch[1].toLowerCase() === "x";
            const checked = Object.prototype.hasOwnProperty.call(docChecks, idx)
              ? Boolean(docChecks[idx])
              : defaultChecked;
            items.push(
              `<li class="task-item"><label>` +
                `<input type="checkbox" class="checklist-box" data-check-idx="${idx}" ${checked ? "checked" : ""}>` +
                `<span>${formatInline(taskMatch[2], docPath)}</span>` +
              `</label></li>`
            );
          } else {
            items.push(`<li>${formatInline(itemText, docPath)}</li>`);
          }
        }
        out.push(`<${tag}>${items.join("")}</${tag}>`);
        continue;
      }

      // Paragraph
      const pLines = [];
      while (
        i < lines.length &&
        !/^\s*$/.test(lines[i]) &&
        !/^(#{1,4})\s+/.test(lines[i]) &&
        !/^(`{3,4})/.test(lines[i]) &&
        !/^\s*>\s?/.test(lines[i]) &&
        !/^\s*([-*_])\1{2,}\s*$/.test(lines[i]) &&
        !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) &&
        !(lines[i].includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
      ) {
        pLines.push(lines[i].trim());
        i++;
      }
      if (pLines.length > 0) {
        out.push(`<p>${formatInline(pLines.join(" "), docPath)}</p>`);
      }
    }

    return { html: out.join("\n"), headings };
  }

  function renderSidebar() {
    const doneMap = loadJson(STORAGE_DONE, {});
    const groups = [];
    const byGroup = new Map();

    for (const d of docs) {
      if (!byGroup.has(d.group)) {
        const arr = [];
        byGroup.set(d.group, arr);
        groups.push({ name: d.group, items: arr });
      }
      byGroup.get(d.group).push(d);
    }

    els.navGroups.innerHTML = groups
      .map((g) => {
        const itemsHtml = g.items
          .map((d) => {
            const isCurrent = currentDoc && currentDoc.path === d.path;
            const isDone = Boolean(doneMap[d.path]);
            const shortTitle = d.title.replace(/^Bab \d+\s+[-:]\s*/i, (m) => m);
            return (
              `<li>` +
                `<a href="#doc=${encodeURIComponent(d.path)}" class="nav-link" ${isCurrent ? 'aria-current="page"' : ""}>` +
                  `<span>${escapeHtml(shortTitle)}</span>` +
                  (isDone ? `<span class="nav-done-badge" title="Selesai dibaca">OK</span>` : "") +
                `</a>` +
              `</li>`
            );
          })
          .join("");
        return (
          `<section class="nav-group">` +
            `<h2 class="nav-group-title">${escapeHtml(g.name)}</h2>` +
            `<ul class="nav-list">${itemsHtml}</ul>` +
          `</section>`
        );
      })
      .join("");

    const doneCount = docs.filter((d) => Boolean(doneMap[d.path])).length;
    const pct = docs.length > 0 ? Math.round((doneCount / docs.length) * 100) : 0;
    els.progressCount.textContent = `${doneCount} / ${docs.length} selesai`;
    els.progressFill.style.width = `${pct}%`;
  }

  function renderToc(headings) {
    const itemsHtml =
      headings.length > 0
        ? headings
            .map(
              (h) =>
                `<li class="toc-level-${h.level}"><a href="#section=${encodeURIComponent(h.id)}" data-toc-id="${escapeHtml(h.id)}">${escapeHtml(h.text)}</a></li>`
            )
            .join("")
        : `<li><span class="loading-state">Tidak ada sub-bagian</span></li>`;

    els.asideTocList.innerHTML = itemsHtml;
    els.inlineTocList.innerHTML = itemsHtml;
  }

  function updateCompleteButton() {
    if (!currentDoc) return;
    const doneMap = loadJson(STORAGE_DONE, {});
    const isDone = Boolean(doneMap[currentDoc.path]);
    els.markCompleteBtn.setAttribute("aria-pressed", String(isDone));
    els.markCompleteBtn.textContent = isDone ? "Sudah Selesai" : "Tandai Selesai";
  }

  function renderPager() {
    if (!currentDoc) return;
    const idx = docs.findIndex((d) => d.path === currentDoc.path);
    const prev = idx > 0 ? docs[idx - 1] : null;
    const next = idx >= 0 && idx < docs.length - 1 ? docs[idx + 1] : null;

    if (prev) {
      els.prevLink.hidden = false;
      els.prevLink.href = `#doc=${encodeURIComponent(prev.path)}`;
      els.prevTitle.textContent = prev.title;
    } else {
      els.prevLink.hidden = true;
    }

    if (next) {
      els.nextLink.hidden = false;
      els.nextLink.href = `#doc=${encodeURIComponent(next.path)}`;
      els.nextTitle.textContent = next.title;
    } else {
      els.nextLink.hidden = true;
    }
  }

  async function renderMermaidDiagrams() {
    const cards = [...els.markdownBody.querySelectorAll(".mermaid-card")];
    if (cards.length === 0) return;

    const theme = els.html.getAttribute("data-theme") === "dark" ? "dark" : "neutral";

    if (typeof window.mermaid === "undefined") {
      for (const card of cards) {
        const pre = card.querySelector(".mermaid-fallback");
        const note = card.querySelector(".mermaid-note");
        const scroll = card.querySelector(".mermaid-scroll");
        if (pre) pre.hidden = false;
        if (scroll) scroll.hidden = true;
        if (note) {
          note.hidden = false;
          note.textContent = "Mermaid.js tidak termuat (mode offline atau CDN diblokir). Kode sumber diagram tetap tersedia di atas.";
        }
      }
      return;
    }

    window.mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      securityLevel: "loose",
      flowchart: { htmlLabels: true, curve: "basis" },
    });

    for (let idx = 0; idx < cards.length; idx++) {
      const card = cards[idx];
      const src = card.getAttribute("data-mermaid-src") || "";
      const target = card.querySelector(".mermaid-render");
      const fallback = card.querySelector(".mermaid-fallback");
      const note = card.querySelector(".mermaid-note");
      const scroll = card.querySelector(".mermaid-scroll");

      try {
        const renderId = `mmd_${Date.now()}_${idx}`;
        const { svg } = await window.mermaid.render(renderId, src);
        target.innerHTML = svg;
        scroll.hidden = false;
        fallback.hidden = true;
        note.hidden = true;
      } catch (err) {
        scroll.hidden = true;
        fallback.hidden = false;
        note.hidden = false;
        note.textContent = "Diagram tidak dapat dirender otomatis. Klik Lihat Kode / Salin untuk melihat sumber Mermaid.";
      }
    }
  }

  function showStatusError(title, message) {
    els.readerStatus.hidden = false;
    els.readerStatus.className = "reader-status is-error";
    els.readerStatus.innerHTML =
      `<h2>${escapeHtml(title)}</h2>` +
      `<p>${escapeHtml(message)}</p>` +
      `<button type="button" id="error-back-home" class="secondary-btn">Kembali ke Halaman Utama</button>`;
    const btn = document.getElementById("error-back-home");
    if (btn) {
      btn.addEventListener("click", () => {
        window.location.hash = "#doc=README.md";
      });
    }
  }

  function parseHash() {
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return { doc: "README.md", section: "" };
    const params = new URLSearchParams(raw);
    if (params.has("doc")) {
      return {
        doc: params.get("doc") || "README.md",
        section: params.get("section") || "",
      };
    }
    return { doc: currentDoc ? currentDoc.path : "README.md", section: raw };
  }

  async function loadDocument(path, sectionId) {
    if (docs.length === 0) {
      els.articleShell.hidden = true;
      showStatusError(
        "Data Modul Tidak Termuat",
        "Berkas assets/docs-bundle.js tidak ditemukan atau gagal dimuat. Pastikan folder assets berada di direktori yang sama dengan index.html."
      );
      return;
    }

    const doc = docMap.get(path);
    if (!doc) {
      els.articleShell.hidden = true;
      showStatusError(
        "Dokumen Tidak Ditemukan",
        `Halaman "${path}" tidak terdaftar di modul belajar ini.`
      );
      return;
    }

    els.readerStatus.hidden = true;
    els.articleShell.hidden = false;
    currentDoc = doc;
    document.title = `${doc.title} - Modul System Analyst`;
    els.docGroupLabel.textContent = doc.group;

    els.markdownBody.innerHTML = `<p class="loading-state">Memuat materi dan merender diagram...</p>`;
    const parsed = renderMarkdown(doc.content, doc.path);
    els.markdownBody.innerHTML = parsed.html;

    renderSidebar();
    renderToc(parsed.headings);
    updateCompleteButton();
    renderPager();
    announce(`Membuka ${doc.title}`);

    await renderMermaidDiagrams();

    if (sectionId) {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }

  function syncThemeMeta(isDark) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", isDark ? "#1D2321" : "#F2ECE1");
    }
  }

  function setTheme(nextTheme) {
    els.html.setAttribute("data-theme", nextTheme);
    saveJson(STORAGE_THEME, nextTheme);
    const isDark = nextTheme === "dark";
    els.themeToggle.setAttribute("aria-pressed", String(isDark));
    els.themeToggle.setAttribute("aria-label", isDark ? "Ubah ke mode terang" : "Ubah ke mode gelap");
    els.themeLabel.textContent = isDark ? "Mode Terang" : "Mode Gelap";
    syncThemeMeta(isDark);
    renderMermaidDiagrams();
  }

  function openDrawer() {
    lastFocusedBeforeDrawer = document.activeElement;
    els.sidebar.classList.add("is-open");
    els.sidebarBackdrop.hidden = false;
    els.menuToggle.setAttribute("aria-expanded", "true");
    els.sidebarClose.focus();
  }

  function closeDrawer() {
    els.sidebar.classList.remove("is-open");
    els.sidebarBackdrop.hidden = true;
    els.menuToggle.setAttribute("aria-expanded", "false");
    if (lastFocusedBeforeDrawer && typeof lastFocusedBeforeDrawer.focus === "function") {
      lastFocusedBeforeDrawer.focus();
    }
  }

  function runSearch(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      els.searchResults.innerHTML =
        `<div class="search-empty"><p>Ketik minimal 2 huruf untuk mencari di semua 33 dokumen modul.</p></div>`;
      return;
    }

    const hits = [];
    for (const d of docs) {
      const titleMatch = d.title.toLowerCase().indexOf(q);
      const bodyLower = d.content.toLowerCase();
      const bodyMatch = bodyLower.indexOf(q);
      if (titleMatch !== -1 || bodyMatch !== -1) {
        let snippet = "";
        if (bodyMatch !== -1) {
          const start = Math.max(0, bodyMatch - 55);
          const end = Math.min(d.content.length, bodyMatch + 115);
          snippet = (start > 0 ? "..." : "") + d.content.slice(start, end).replace(/\s+/g, " ") + (end < d.content.length ? "..." : "");
        } else {
          snippet = d.path;
        }
        hits.push({ doc: d, score: titleMatch !== -1 ? 2 : 1, snippet });
      }
    }

    hits.sort((a, b) => b.score - a.score || a.doc.id - b.doc.id);

    if (hits.length === 0) {
      els.searchResults.innerHTML =
        `<div class="search-empty">` +
          `<p>Tidak ada materi yang cocok dengan "${escapeHtml(query)}".</p>` +
          `<button type="button" id="reset-search-btn" class="secondary-btn">Reset Pencarian</button>` +
        `</div>`;
      const resetBtn = document.getElementById("reset-search-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          els.searchInput.value = "";
          els.searchInput.focus();
          runSearch("");
        });
      }
      return;
    }

    els.searchResults.innerHTML = hits
      .slice(0, 25)
      .map(
        (h) =>
          `<a href="#doc=${encodeURIComponent(h.doc.path)}" class="search-result-item">` +
            `<span class="search-result-group">${escapeHtml(h.doc.group)}</span>` +
            `<span class="search-result-title">${escapeHtml(h.doc.title)}</span>` +
            `<span class="search-result-snippet">${escapeHtml(h.snippet)}</span>` +
          `</a>`
      )
      .join("");
  }

  function bindEvents() {
    window.addEventListener("hashchange", () => {
      const { doc, section } = parseHash();
      if (currentDoc && currentDoc.path === doc && section) {
        const el = document.getElementById(section);
        if (el) {
          el.scrollIntoView({ behavior: "auto", block: "start" });
          return;
        }
      }
      loadDocument(doc, section);
    });

    els.themeToggle.addEventListener("click", () => {
      const curr = els.html.getAttribute("data-theme") === "dark" ? "dark" : "light";
      setTheme(curr === "dark" ? "light" : "dark");
    });

    els.markCompleteBtn.addEventListener("click", () => {
      if (!currentDoc) return;
      const doneMap = loadJson(STORAGE_DONE, {});
      doneMap[currentDoc.path] = !doneMap[currentDoc.path];
      saveJson(STORAGE_DONE, doneMap);
      updateCompleteButton();
      renderSidebar();
      announce(doneMap[currentDoc.path] ? "Bab ditandai selesai" : "Tanda selesai dihapus");
    });

    els.printBtn.addEventListener("click", () => {
      window.print();
    });

    if (els.backToTopBtn) {
      els.backToTopBtn.addEventListener("click", () => {
        window.scrollTo(0, 0);
        els.main.focus();
      });
    }

    els.menuToggle.addEventListener("click", openDrawer);
    els.sidebarClose.addEventListener("click", closeDrawer);
    els.sidebarBackdrop.addEventListener("click", closeDrawer);

    els.navGroups.addEventListener("click", (e) => {
      if (e.target.closest("a.nav-link") && els.sidebar.classList.contains("is-open")) {
        closeDrawer();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (els.sidebar.classList.contains("is-open")) {
        if (e.key === "Escape") {
          closeDrawer();
          return;
        }
        if (e.key === "Tab") {
          const focusables = [...els.sidebar.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')];
          if (focusables.length > 0) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (typeof els.searchDialog.showModal === "function") {
          els.searchDialog.showModal();
          els.searchInput.focus();
          runSearch(els.searchInput.value);
        }
      }
    });

    els.searchOpenBtn.addEventListener("click", () => {
      if (typeof els.searchDialog.showModal === "function") {
        els.searchDialog.showModal();
        els.searchInput.focus();
        runSearch(els.searchInput.value);
      }
    });

    els.searchCloseBtn.addEventListener("click", () => {
      els.searchDialog.close();
    });

    els.searchInput.addEventListener("input", () => {
      runSearch(els.searchInput.value);
    });

    els.searchResults.addEventListener("click", (e) => {
      if (e.target.closest("a.search-result-item")) {
        els.searchDialog.close();
      }
    });

    // Delegate clicks inside markdown body (checklist persistence, copy code, mermaid toggle)
    els.markdownBody.addEventListener("change", (e) => {
      const box = e.target.closest("input.checklist-box");
      if (!box || !currentDoc) return;
      const idx = box.getAttribute("data-check-idx");
      const all = loadJson(STORAGE_CHECKS, {});
      all[currentDoc.path] = all[currentDoc.path] || {};
      all[currentDoc.path][idx] = box.checked;
      saveJson(STORAGE_CHECKS, all);
    });

    els.markdownBody.addEventListener("click", async (e) => {
      const copyCodeBtn = e.target.closest(".code-block-header .copy-code-btn");
      if (copyCodeBtn) {
        const pre = copyCodeBtn.closest(".code-block-wrap")?.querySelector("pre code");
        if (pre && navigator.clipboard) {
          await navigator.clipboard.writeText(pre.textContent || "");
          copyCodeBtn.textContent = "Tersalin";
          setTimeout(() => {
            copyCodeBtn.textContent = "Salin";
          }, 1500);
        }
        return;
      }

      const toggleZoom = e.target.closest(".toggle-mermaid-zoom");
      if (toggleZoom) {
        const card = toggleZoom.closest(".mermaid-card");
        if (card) {
          const expanded = card.classList.toggle("is-expanded");
          toggleZoom.setAttribute("aria-pressed", String(expanded));
          toggleZoom.textContent = expanded ? "Pas Layar" : "Ukuran Asli";
        }
        return;
      }

      const toggleMmd = e.target.closest(".toggle-mermaid-src");
      if (toggleMmd) {
        const card = toggleMmd.closest(".mermaid-card");
        const pre = card?.querySelector(".mermaid-fallback");
        if (pre) {
          pre.hidden = !pre.hidden;
          toggleMmd.textContent = pre.hidden ? "Lihat Kode" : "Sembunyikan Kode";
        }
        return;
      }

      const copyMmd = e.target.closest(".copy-mermaid-btn");
      if (copyMmd) {
        const card = copyMmd.closest(".mermaid-card");
        const src = card?.getAttribute("data-mermaid-src") || "";
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(src);
          copyMmd.textContent = "Tersalin";
          setTimeout(() => {
            copyMmd.textContent = "Salin";
          }, 1500);
        }
      }
    });

    // Scroll-to-section inside inline/aside TOC
    function handleTocClick(e) {
      const link = e.target.closest("a[data-toc-id]");
      if (!link) return;
      e.preventDefault();
      const id = link.getAttribute("data-toc-id");
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }
      if (els.inlineTocBox.open && window.innerWidth < 1160) {
        els.inlineTocBox.open = false;
      }
    }
    els.asideTocList.addEventListener("click", handleTocClick);
    els.inlineTocList.addEventListener("click", handleTocClick);
  }

  function init() {
    const savedTheme = loadJson(STORAGE_THEME, "light");
    els.html.setAttribute("data-theme", savedTheme === "dark" ? "dark" : "light");
    const isDark = savedTheme === "dark";
    els.themeToggle.setAttribute("aria-pressed", String(isDark));
    els.themeToggle.setAttribute("aria-label", isDark ? "Ubah ke mode terang" : "Ubah ke mode gelap");
    els.themeLabel.textContent = isDark ? "Mode Terang" : "Mode Gelap";
    syncThemeMeta(isDark);

    bindEvents();
    const { doc, section } = parseHash();
    loadDocument(doc, section);
  }

  init();
})();
