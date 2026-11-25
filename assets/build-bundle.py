import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ORDER_LIST = [
    ("Mulai Belajar", "README.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/01-fundamental-system-analyst.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/02-sdlc-waterfall-agile.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/03-requirement-elicitation-stakeholder.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/04-process-modeling-flowchart-bpmn.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/05-uml-use-case-activity.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/06-uml-sequence-state-class.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/07-ui-screen-spec-field-mapping.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/08-data-modeling-erd-sql.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/09-api-integration-system-design.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/10-nfr-security-concurrency.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/11-impact-analysis-cr-migrasi-batch.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/12-dokumentasi-brd-srs-fsd.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/13-uat-testing-handover.md"),
    ("Kurikulum Utama (Bab 01-14)", "materi/14-capstone-project.md"),
    ("Studi Kasus NusaPOS & OrderHub", "studi-kasus/01-brd-nusapos.md"),
    ("Studi Kasus NusaPOS & OrderHub", "studi-kasus/02-srs-nusapos.md"),
    ("Studi Kasus NusaPOS & OrderHub", "studi-kasus/03-api-contract-nusapos.md"),
    ("Studi Kasus NusaPOS & OrderHub", "studi-kasus/04-uat-script-nusapos.md"),
    ("Template Dokumen Siap Pakai", "templates/template-brd.md"),
    ("Template Dokumen Siap Pakai", "templates/template-srs.md"),
    ("Template Dokumen Siap Pakai", "templates/template-fsd.md"),
    ("Template Dokumen Siap Pakai", "templates/template-use-case.md"),
    ("Template Dokumen Siap Pakai", "templates/template-screen-spec.md"),
    ("Template Dokumen Siap Pakai", "templates/template-cr-impact-analysis.md"),
    ("Template Dokumen Siap Pakai", "templates/template-uat.md"),
    ("Kunci Latihan & Pembahasan", "kunci-latihan/kunci-bab-01-04.md"),
    ("Kunci Latihan & Pembahasan", "kunci-latihan/kunci-bab-05-08.md"),
    ("Kunci Latihan & Pembahasan", "kunci-latihan/kunci-bab-09-13.md"),
    ("Kunci Latihan & Pembahasan", "kunci-latihan/kunci-capstone-ringkas.md"),
    ("Kesiapan Kerja & Karier", "kesiapan-kerja/panduan-portofolio-sa.md"),
    ("Kesiapan Kerja & Karier", "kesiapan-kerja/bank-soal-interview-live-case.md"),
    ("Kesiapan Kerja & Karier", "kesiapan-kerja/cheat-sheet-system-analyst.md"),
]


def main():
    docs = []
    for idx, (group, rel_path) in enumerate(ORDER_LIST):
        full = os.path.join(ROOT, rel_path.replace("/", os.sep))
        with open(full, "r", encoding="utf-8") as f:
            text = f.read()
        match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
        title = match.group(1).strip() if match else rel_path
        docs.append({
            "id": idx,
            "group": group,
            "path": rel_path,
            "title": title,
            "content": text,
        })

    out_path = os.path.join(ROOT, "assets", "docs-bundle.js")
    with open(out_path, "w", encoding="utf-8") as out:
        out.write("window.SA_DOCS = ")
        json.dump(docs, out, ensure_ascii=False)
        out.write(";\n")
    print(f"Bundled {len(docs)} docs -> {os.path.getsize(out_path)} bytes")


if __name__ == "__main__":
    main()
