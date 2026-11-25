# Panduan Menyusun Portofolio System Analyst Siap Lamar

> **Mengapa Portofolio System Analyst Berbeda?** Portofolio seorang UI/UX Designer dinilai dari keindahan visual layar, sedangkan portofolio Software Engineer dinilai dari kode yang berjalan. **Portofolio System Analyst dinilai dari kejernihan berpikir, ketajaman menangani konflik & risiko, konsistensi antar-artefak (*traceability*), dan kemampuan menerjemahkan masalah bisnis menjadi spesifikasi yang siap dieksekusi oleh tim teknis.**

Dokumen ini memandu Anda mengemas hasil pengerjaan **Capstone Project MedikaLink** ([Bab 14](../materi/14-capstone-project.md)) dan referensi latihan **NusaPOS & OrderHub** ([`studi-kasus/`](../studi-kasus/01-brd-nusapos.md)) menjadi portofolio profesional yang siap dilampirkan saat melamar posisi **Junior hingga Mid System Analyst**.

---

## 1. Memilih & Memposisikan Proyek Andalan

Jangan menumpuk 5 proyek dangkal yang hanya berisi 1 halaman BRD. Rekruter dan *Hiring Manager* (biasanya Lead SA, Product Manager, atau Engineering Manager) lebih menghargai **1–2 studi kasus mendalam *end-to-end*** yang membuktikan Anda menguasai seluruh siklus SDLC.

| Posisi Proyek di Portofolio | Sumber Bahan | Cara Memposisikannya Secara Jujur & Kuat |
| :--- | :--- | :--- |
| **Proyek Utama (*Flagship Case Study*)** | Hasil kerja mandiri Anda di [**Capstone MedikaLink**](../materi/14-capstone-project.md) | Sajikan sebagai proyek analisis lengkap: mulai dari resolusi konflik 4 stakeholder, BPMN To-Be, State Machine, ERD + privasi data medis, API Contract, FSD *concurrency* stok obat, hingga UAT EP/BVA. |
| **Proyek Pendukung (*Supporting / Domain Comparison*)** | Latihan terstruktur [**NusaPOS & OrderHub**](../studi-kasus/01-brd-nusapos.md) atau modifikasi CR Anda | Jangan menyalin mentah file `studi-kasus/` dan mengakuinya sebagai karya orisinal! Posisikan sebagai *latihan penguasaan domain ritel/POS*—fokuskan pada salah satu kontribusi analisis Anda, misalnya dokumen **Change Request Kurir 3PL (Bab 11)** atau **Audit Kontrak API & Webhook Idempotency**. |
| **Proyek Kerja/Magang Nyata** *(jika ada)* | Pengalaman kerja atau proyek kampus | Gunakan struktur yang sama, tetapi wajib disanitasi agar tidak melanggar *Non-Disclosure Agreement (NDA)*. |

---

## 2. Format *Storytelling* 4 Babak yang Memikat Hiring Manager

*Hiring Manager* hanya punya waktu **3–5 menit** saat menyaring portofolio pertama kali. Jangan langsung membuang pembaca ke dalam tabel SQL atau 40 baris kode JSON di halaman pertama! Bungkus setiap studi kasus Anda dengan kerangka narasi **4 Babak**:

1. **Babak 1 — Konteks Bisnis, Konflik, & Target KPI (*The Why*):**
   - Jelaskan masalah bisnis secara ringkas (maks. 2 paragraf), siapa aktor utamanya, serta **2–3 konflik atau kendala tersulit** yang Anda temukan (contoh di *MedikaLink*: pemisahan akses rekam medis vs tuntutan kecepatan kasir, serta klinik lintas zona waktu WIB/WITA).
   - Cantumkan metrik keberhasilan (*SMART KPI*), misalnya: *"Menekan penolakan resep di apotek karena stok kosong dari ~18% menjadi < 2%."*
2. **Babak 2 — Keputusan Analisis & Trade-Off (*The Thinking*):**
   - Inilah pembeda kandidat **Junior** dan **Mid**. Tunjukkan *mengapa* Anda memilih arsitektur A dibandingkan B (contoh: mengapa timer *no-show* 15 menit dihitung dari `MAX(scheduled_at, actual_session_start)`, mengapa `medical_records` dipisah dari tabel kasir, atau mengapa reservasi stok obat memakai TTL dan `SELECT ... FOR UPDATE`).
3. **Babak 3 — Peta Artefak & Keterlacakan (*The Blueprint*):**
   - Tampilkan **1 cuplikan RTM mini** yang membuktikan benang merah dari `BR-01 -> FR-03 -> UC-02 -> API -> Tabel DB -> UAT-03`.
   - Pajang visual utama: **BPMN To-Be**, **State Machine**, **ERD inti**, dan **1 contoh Sequence Diagram / Screen Spec + Mapping**. Tautkan dokumen lengkap (SRS, FSD, UAT Script) sebagai lampiran atau sub-halaman agar halaman utama tetap ringkas dan nyaman dibaca.
4. **Babak 4 — Validasi, Mitigasi Risiko, & Rencana Rilis (*The Proof*):**
   - Tunjukkan contoh **skenario uji batas (BVA/EP)**, matriks **RBAC Security**, dan skenario **Impact Analysis / Rollback**. Ini membuktikan Anda peduli sampai sistem benar-benar aman dipakai di *production*.

---

## 3. Memilih Platform & Struktur Direktori Portofolio

Sesuaikan media portofolio dengan proses rekrutmen perusahaan target:

### Opsi A: Repositori GitHub *(Sangat Disukai Tim Tech / Product-Led Company)*
Keunggulan GitHub adalah diagram Mermaid otomatis ter-render rapi dan rekruter dapat melihat kerapian struktur dokumen layaknya dokumentasi teknis sungguhan.

```text
system-analyst-portfolio/
├── README.md                          # Halaman muka: Profil singkat, daftar proyek, & ringkasan skill
├── 01-medikalink-clinic-system/       # Flagship Case Study (Capstone Mandiri)
│   ├── README.md                      # Ringkasan 4 Babak (Executive Summary + Cuplikan Diagram)
│   ├── 01-brd-conflict-log.md         # BRD & Resolusi Konflik 4 Stakeholder
│   ├── 02-bpmn-state-machine.md       # Diagram BPMN To-Be & State Machine
│   ├── 03-srs-use-case-spec.md        # SRS IEEE 29148 & 2 Use Case Spec
│   ├── 04-erd-screen-spec.md          # ERD & 2 Screen Spec (5 State + Field Mapping)
│   ├── 05-api-rbac-security.md        # Kontrak REST API, Error Envelope, & Privasi RME
│   ├── 06-fsd-stock-split-billing.md  # Sequence Diagram & Concurrency Reservasi Obat
│   ├── 07-cr-impact-batch-tz.md       # Impact Analysis 6 Lapis & Batch Rekonsiliasi WIB/WITA
│   └── 08-uat-ep-bva-script.md        # Skrip UAT + EP/BVA Test Matrix
└── 02-nusapos-cr-3pl-delivery/        # Supporting Case Study (Contoh Analisis CR & API)
    ├── README.md
    └── cr-impact-analysis-3pl.md
```

### Opsi B: Halaman Notion Publik *(Sangat Ramah HR & User Bisnis Non-Teknis)*
- Gunakan halaman utama sebagai **Executive Overview** (berisi 4 Babak *Storytelling* + gambar diagram yang sudah di-render).
- Simpan dokumen panjang (Use Case Spec lengkap, Tabel Field Mapping, UAT Matrix) di dalam **Toggle Block** atau **Sub-page** agar halaman utama tidak penuh teks rapat.

### Opsi C: Dokumen PDF Ringkas (`5–8 Halaman` untuk Lampiran Lamaran / Email)
Banyak sistem pelamaran kerja (*job portal* / email HRD) mewajibkan unggahan file PDF. Jangan melampirkan PDF setebal 60 halaman! Susun **Executive Case Study Deck (maksimal 8 halaman)**:
- **Halaman 1:** Profil Singkat, Ringkasan Kompetensi SA, & Peta Proyek.
- **Halaman 2:** *MedikaLink* — Latar Belakang Masalah, Konflik Stakeholder, & Keputusan Resolusi.
- **Halaman 3:** Diagram BPMN To-Be & State Machine Janji Temu/Resep (ekspor gambar resolusi tinggi).
- **Halaman 4:** Cuplikan ERD Inti + Aturan Privasi Data Medis (RBAC).
- **Halaman 5:** Cuplikan Screen Spec (5 State + Field Mapping) & Kontrak API Kritis (`Idempotency`, `Error Envelope`).
- **Halaman 6:** FSD *Concurrency* Reservasi Obat / Rekonsiliasi Multi-Timezone + Cuplikan UAT (EP/BVA).
- **Halaman 7:** Tabel RTM Ringkas & Tautan ke Repositori GitHub/Notion Lengkap.

---

## 4. Tips Teknis Memajang Diagram & Tabel Agar Profesional

1. **Hindari Diagram Teks Terpotong di PDF:** Jika mengeksport Mermaid ke PDF, render terlebih dahulu menjadi **SVG atau PNG resolusi tinggi (`>= 2x`)** lewat *Mermaid Live Editor* atau *VS Code Markdown Preview* agar tulisan di dalam diagram tidak pecah atau terpotong margin halaman.
2. **Jangan Buat Tabel RTM 15 Kolom dalam 1 Halaman Sempit:** Untuk tampilan portofolio di PDF atau web, tampilkan RTM dalam **6 kolom padat makna**: `ID FR | Referensi UC | Endpoint API | Entitas DB Utama | Layar (Screen ID) | Skenario UAT`.
3. **Sertakan "Before vs After" atau "Why Not Option B?":** Menambahkan kotak catatan singkat seperti *"Mengapa tidak langsung memotong stok obat saat dokter klik simpan?"* akan langsung menaikkan kelas Anda di mata pewawancara senior.

---

## 5. Etika & Keamanan Data (*Sanitasi Informasi Sensitif*)

Jika Anda memasukkan artefak dari proyek kerja nyata, magang, atau freelance ke dalam portofolio publik:
1. **Samarkan Nama Perusahaan & Klien:** Ganti nama asli dengan pseudonim yang profesional (misal *"PT Logistik Nusantara"*), dan jangan gunakan logo perusahaan tanpa izin tertulis.
2. **Hapus Seluruh Rahasia Teknis:** Jangan pernah menyertakan URL server internal/staging asli, alamat IP, *API key*, *HMAC secret*, skema token produksi, maupun data sampel pelanggan/pasien sungguhan (NIK, nomor telepon, email, nomor rekening). Gunakan data fiktif yang realistis (*synthetic data*).
3. **Fokus pada Pola Sistem, Bukan Rahasia Dagang:** Ceritakan arsitektur alur dan metode analisisnya, bukan formula komisi atau strategi harga rahasia milik klien.

---

## 6. Checklist Audit Portofolio Pra-Kirim Lamaran

Pastikan seluruh 12 poin di bawah ini terpenuhi sebelum Anda menekan tombol kirim lamaran:

- [ ] Halaman utama studi kasus dapat dipahami inti masalah dan solusinya dalam **waktu baca < 3 menit**.
- [ ] Terdapat bukti kemampuan menggali kebutuhan dan mendamaikan **konflik stakeholder** (bukan sekadar proyek fiktif tanpa kendala).
- [ ] Seluruh artefak terhubung konsisten lewat **ID Traceability** (`FR`, `UC`, `SCR`, `Endpoint`, `UAT`) tanpa ID yatim piatu.
- [ ] Tidak ada kata kabur pada requirement (`cepat`, `aman`, `mudah`, `fleksibel` sudah diganti angka/aturan spesifik).
- [ ] Minimal 1 diagram alur (**BPMN/Flowchart**), 1 perilaku (**Sequence / State Machine**), dan 1 struktur data (**ERD**) ter-render bersih tanpa teks bertumpuk.
- [ ] Terdapat minimal 1 contoh **Screen Spec (5 State + Field Mapping UI–API–DB)**.
- [ ] Terdapat minimal 1 pembahasan **keamanan/integritas data** (RBAC, IDOR, *Idempotency*, atau *Row-Level Locking*).
- [ ] Terdapat contoh skenario uji terstruktur (**EP / BVA**) dan bukan hanya skenario *happy path*.
- [ ] Tautan ke repositori GitHub / Notion sudah diuji dalam mode *Incognito* (tidak terkunci akses privat!).
- [ ] Berkas PDF (*jika dilampirkan*) berukuran ringan (`< 5 MB`), tipografi rapi, dan memiliki tautan aktif ke versi lengkap.
- [ ] Nol data rahasia perusahaan atau data pribadi nyata (*PII*) yang bocor.
- [ ] Anda sudah berlatih mempresentasikan proyek *MedikaLink* secara lisan dalam **5 menit** untuk persiapan wawancara.

---

**Langkah Berikutnya:**
- Latih cara menjawab pertanyaan tajam pewawancara dan simulasi *whiteboard* di [**Bank Soal Interview & Simulasi Live-Case System Analyst**](bank-soal-interview-live-case.md).
- Simpan [**Cheat Sheet System Analyst**](cheat-sheet-system-analyst.md) sebagai referensi cepat saat mengerjakan tes teknis maupun bekerja nanti.
- Kembali ke [Bab 14 — Capstone Project Mandiri: MedikaLink](../materi/14-capstone-project.md) atau [Peta Kurikulum (`README.md`)](../README.md).
