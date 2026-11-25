# Software Requirements Specification (SRS)
*(Mengacu pada struktur standar ISO/IEC/IEEE 29148)*

> **Petunjuk Penggunaan Template:** SRS menjembatani kebutuhan bisnis di BRD menjadi spesifikasi sistem yang **atomik, tidak ambigu, terukur, dan dapat diuji (*verifiable*)**. Hindari kata-kata kabur seperti *"cepat"*, *"ramah pengguna"*, *"fleksibel"*, atau *"segera"* tanpa angka dan aturan yang jelas.

---

## Kontrol Dokumen

| Atribut | Detail |
| :--- | :--- |
| **Nama Sistem** | `[Nama Sistem / Produk]` |
| **ID Dokumen** | `[misal: SRS-PROJ-001]` |
| **Versi** | `[misal: v1.0]` |
| **Tanggal** | `[YYYY-MM-DD]` |
| **Penulis (System Analyst)** | `[Nama SA]` |
| **Referensi BRD** | `[ID & Versi BRD terkait]` |
| **Status** | `[Draft / In Review / Baselined]` |

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
`[Jelaskan tujuan dokumen SRS ini dan siapa saja pembacanya: tim Engineering (Backend/Frontend), QA, UI/UX, Tech Lead, dan Product Manager.]`

### 1.2 Ruang Lingkup Sistem (*System Scope*)
`[Ringkas kapabilitas utama sistem perangkat lunak yang akan dibangun, termasuk modul yang masuk Fase 1 dan yang dikecualikan agar selaras dengan BRD.]`

### 1.3 Definisi, Akronim, & Singkatan

| Istilah / Akronim | Definisi dalam Konteks Sistem Ini |
| :--- | :--- |
| `[TTL]` | *Time To Live* — batas waktu berlakunya reservasi stok sebelum dilepas otomatis. |
| `[Idempotency]` | Sifat operasi di mana pemanggilan ulang dengan kunci yang sama menghasilkan efek sistem yang identik tanpa duplikasi data. |
| `[RBAC]` | *Role-Based Access Control* — pengaturan hak akses sistem berdasarkan peran pengguna. |

### 1.4 Referensi Dokumen
- `[BRD Proyek — ID & Tautan]`
- `[Standar UI/Design System Perusahaan]`
- `[Dokumentasi API Eksternal Pihak Ketiga]`

---

## 2. Deskripsi Umum (*Overall Description*)

### 2.1 Perspektif Produk & Konteks Sistem
`[Jelaskan posisi sistem dalam ekosistem perusahaan—apakah sistem baru (*greenfield*), pengganti sistem lama, atau perlu berintegrasi dengan sistem lain seperti Payment Gateway, ERP, dan Notification Service.]`

### 2.2 Ringkasan Fungsi Produk
- `[Fungsi 1: Manajemen pengguna & otorisasi berbasis peran]`
- `[Fungsi 2: Pengelolaan katalog, harga, & stok real-time per cabang]`
- `[Fungsi 3: Pemrosesan pesanan & integrasi pembayaran]`
- `[Fungsi 4: Pemenuhan operasional, pembatalan/refund, & rekonsiliasi]`

### 2.3 Karakteristik Pengguna (*Actors & User Classes*)

| Aktor | Tipe | Deskripsi Tanggung Jawab | Tingkat Keahlian Teknis |
| :--- | :--- | :--- | :--- |
| `[Aktor 1]` | Manusia | `[Deskripsi hak dan tugas utama]` | `[Rendah / Menengah / Tinggi]` |
| `[Aktor 2]` | Manusia | `[Deskripsi hak dan tugas utama]` | `[Rendah / Menengah / Tinggi]` |
| `[Sistem Eksternal]` | Sistem | `[Tujuan pertukaran data]` | `N/A (Integrasi API/Webhook)` |

### 2.4 Batasan Desain & Implementasi (*Constraints*)
- `[Contoh: Sistem wajib menggunakan zona waktu UTC untuk penyimpanan database dan menampilkan waktu lokal cabang.]`
- `[Contoh: Seluruh kalkulasi finansial tidak boleh menghasilkan selisih pembulatan antar-item dan total transaksi.]`

### 2.5 Asumsi & Dependensi
- `[Tuliskan asumsi teknis maupun operasional yang jika berubah akan memengaruhi spesifikasi di bawah.]`

---

## 3. Requirement Fungsional (*Functional Requirements*)

Setiap requirement wajib memiliki **ID unik**, **prioritas**, **aturan bisnis**, dan **kriteria penerimaan (*Acceptance Criteria*)** yang dapat diuji langsung oleh QA.

### `FR-01`: `[Judul Singkat Requirement Fungsional]`
- **Referensi Bisnis / Use Case:** `[BR-01 / UC-01]`
- **Prioritas (MoSCoW):** `[Must Have / Should Have / Could Have]`
- **Aktor Terlibat:** `[Sebutkan aktor]`
- **Deskripsi Kebutuhan:**
  `[Tuliskan pernyataan formal menggunakan pola: "Sistem HARUS [melakukan aksi X] ketika [kondisi Y], dengan [batasan Z]."]`
- **Aturan Bisnis (*Business Rules*):**
  1. `[BR-01.1: Aturan validasi atau perhitungan eksplisit.]`
  2. `[BR-01.2: Aturan izin akses atau kondisi pengecualian.]`
- **Acceptance Criteria (Format Gherkin):**
  ```gherkin
  Given [kondisi awal sistem dan data]
  When [aksi yang dilakukan pengguna atau sistem]
  Then [hasil yang diharapkan di UI, state data, dan respons sistem]
  ```

### `FR-02`: `[Judul Singkat Requirement Fungsional Berikutnya]`
*(Salin blok di atas untuk `FR-02`, `FR-03`, dan seterusnya.)*

---

## 4. Requirement Non-Fungsional (*Non-Functional Requirements*)

Requirement non-fungsional harus selalu menyertakan **metrik angka** dan **kondisi pengukuran**.

| ID NFR | Kategori | Spesifikasi Requirement Terukur | Metode Verifikasi |
| :--- | :--- | :--- | :--- |
| `NFR-01` | **Performa & Latensi** | `[Contoh: Endpoint pembuatan pesanan wajib merespons pada p95 <= 500 ms pada beban 150 RPS.]` | *Load Testing* (k6 / JMeter) |
| `NFR-02` | **Konkurensi & Integritas Data** | `[Contoh: Dua transaksi bersamaan atas item dengan sisa stok 1 tidak boleh menghasilkan stok negatif (0% oversell).]` | *Concurrency Test* |
| `NFR-03` | **Keamanan & Auditabilitas** | `[Contoh: Seluruh endpoint selain login/public menu wajib terautentikasi; perubahan data sensitif wajib tercatat di audit_logs.]` | *Security & Pen-Test* |
| `NFR-04` | **Ketersediaan & Retensi** | `[Contoh: Uptime >= 99,5% pada jam operasional; log audit disimpan minimal 5 tahun.]` | *Monitoring SLA & Backup Check* |

---

## 5. External Interface Requirements

### 5.1 Antarmuka Pengguna (*User Interfaces*)
`[Sebutkan daftar layar utama dan tautan ke dokumen UI/Screen Specification.]`

### 5.2 Antarmuka Perangkat Lunak & API (*Software / API Interfaces*)

| Sistem Eksternal | Arah Komunikasi | Protokol & Format | Mekanisme Keamanan & Keandalan |
| :--- | :--- | :--- | :--- |
| `[Payment Gateway]` | Dua arah (REST Request + Async Webhook) | HTTPS / JSON | HMAC-SHA256 Signature + Idempotency Key + Timeout 5s |
| `[Accounting / ERP]` | Keluar (Scheduled Batch / REST) | HTTPS / JSON atau CSV | API Key / OAuth2 + Retry dengan Exponential Backoff |
| `[Notification Service]` | Keluar (Async Queue / REST) | HTTPS / JSON | API Token + Dead Letter Queue untuk retry |

### 5.3 Antarmuka Perangkat Keras (*Hardware Interfaces*)
`[Jika relevan, misal: Printer struk thermal 58mm/80mm via USB/Bluetooth atau pemindai QR/Barcode di konter kasir.]`

---

## 6. Model & Diagram Sistem (*Supporting Models*)

Lampirkan atau tautkan model sistem yang menjadi referensi tunggal tim pengembang:
- **Process Model (BPMN / Flowchart):** `[Tautan atau diagram Mermaid]`
- **Use Case Diagram & Specification:** `[Tautan ke dokumen Use Case]`
- **State Machine Diagram (Siklus Status Entitas Kritis):** `[Diagram Mermaid stateDiagram-v2]`
- **Data Model (ERD):** `[Diagram Mermaid erDiagram]`

---

## 7. Requirement Traceability Matrix (RTM)

RTM memastikan tidak ada kebutuhan bisnis yang terlupa dan tidak ada fitur teknis yang dibangun tanpa dasar kebutuhan bisnis.

| Business Obj / BR | Functional / NFR ID | Use Case ID | Screen / API Endpoint | Entitas Database | Test Case / UAT ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BR-01` | `FR-03` | `UC-03` | `POST /api/v1/orders` | `orders`, `inventories` | `UAT-03` |
| `BR-02` | `FR-04`, `NFR-02` | `UC-04` | `POST /api/v1/webhooks/payments/qris` | `payments`, `orders` | `UAT-04` |
| `[...]` | `[...]` | `[...]` | `[...]` | `[...]` | `[...]` |
