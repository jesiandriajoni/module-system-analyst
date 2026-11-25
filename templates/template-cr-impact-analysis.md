# Change Request (CR) Impact Analysis

> **Petunjuk Penggunaan Template:** Di dunia kerja nyata, lebih dari separuh pekerjaan System Analyst adalah mengubah sistem yang sudah berjalan (*production*) tanpa merusaknya. Gunakan template ini setiap kali ada permintaan perubahan fitur, aturan bisnis, atau regulasi di tengah jalan atau pasca-rilis agar risiko tersembunyi di 6 lapisan sistem terdeteksi sebelum kode ditulis.

---

## 1. Identitas Change Request (CR)

| Atribut | Detail |
| :--- | :--- |
| **CR ID** | `[misal: CR-2026-011]` |
| **Judul Perubahan** | `[misal: Penambahan Layanan Pengiriman Kurir 3PL (Fase 2)]` |
| **Pengusul (*Requestor*)** | `[Nama & Departemen Pengusul]` |
| **Tanggal Pengajuan** | `[YYYY-MM-DD]` |
| **Target Rilis** | `[misal: Sprint 14 / Rilis v2.0]` |
| **Penulis Analisis (SA)** | `[Nama System Analyst]` |
| **Dokumen Baseline Terdampak** | `[BRD-PROJ-001, SRS-PROJ-001, API Contract v1.0]` |
| **Status CR** | `[Proposed / Under Impact Analysis / Approved by CAB / Rejected / Deferred]` |

---

## 2. Alasan Bisnis & Ringkasan Perubahan (*Before vs After*)

### 2.1 Latar Belakang & Nilai Bisnis
`[Jelaskan alasan bisnis perubahan ini dibutuhkan sekarang, kerugian jika ditunda, serta target KPI yang ingin dicapai.]`

### 2.2 Perbandingan Kondisi (*Before vs After*)

| Aspek | Kondisi Saat Ini (*Baseline / Before*) | Kondisi Target (*Proposed / After*) |
| :--- | :--- | :--- |
| **Aktor** | `[Hanya Customer, Cashier, Kitchen, dll.]` | `[Tambahan aktor eksternal Courier / 3PL]` |
| **Alur Status** | `[8 status Fase 1 berakhir di COMPLETED]` | `[Penambahan status OUT_FOR_DELIVERY dan DELIVERED khusus order DELIVERY]` |
| **Perhitungan Biaya** | `[Subtotal - Diskon + Pajak]` | `[Tambahan komponen ongkos kirim (delivery_fee) di luar subtotal produk]` |

---

## 3. Analisis Dampak 6 Lapisan Sistem (*6-Layer Impact Analysis*)

Periksa seluruh enam lapisan di bawah ini secara menyeluruh. Jika suatu lapisan tidak terdampak, tuliskan *"Tidak terdampak"* disertai alasan singkat—jangan dibiarkan kosong.

| Lapisan Sistem | Dampak Teridentifikasi | Komponen / Artefak Terdampak | Tingkat Risiko |
| :--- | :--- | :--- | :---: |
| **1. UI / UX & Client Apps** | `[Perubahan layar, input baru, validasi baru, atau penyesuaian state layar]` | `[misal: Layar Checkout, Screen Pelacakan Status]` | `[Tinggi/Sedang/Rendah]` |
| **2. Business Logic & State Machine** | `[Aturan bisnis baru, perubahan validasi, transisi status tambahan, otorisasi]` | `[misal: Order State Machine & aturan refund ongkir]` | `[Tinggi/Sedang/Rendah]` |
| **3. API Contract & Versioning** | `[Endpoint baru, penambahan field opsional/wajib pada payload request/response, kode error baru]` | `[misal: POST /api/v1/orders, Webhook 3PL baru]` | `[Tinggi/Sedang/Rendah]` |
| **4. Database Schema & Data Eksisting** | `[Tabel baru, kolom baru (nullable vs default), perubahan constraint/enum, dampak query eksisting]` | `[misal: Tabel deliveries, kolom order_type di orders]` | `[Tinggi/Sedang/Rendah]` |
| **5. Integrasi Eksternal & Batch/Scheduler** | `[Vendor/API eksternal baru, webhook baru, perubahan cron/scheduler job]` | `[misal: Integrasi API Kurir 3PL, job rekonsiliasi]` | `[Tinggi/Sedang/Rendah]` |
| **6. Reporting, Audit, & Rekonsiliasi** | `[Perubahan format laporan harian, ekspor ERP, pajak, atau aturan pembulatan]` | `[misal: daily_reconciliations & ekspor Accounting/ERP]` | `[Tinggi/Sedang/Rendah]` |

---

## 4. Analisis Kompatibilitas Mundur (*Backward Compatibility*)

`[Jelaskan bagaimana sistem memastikan pengguna lama, aplikasi mobile versi lama, atau data transaksi historis tetap berjalan normal selama dan setelah perubahan dirilis.]`

- **Kompatibilitas Data Historis:** `[Contoh: Seluruh baris orders lama otomatis diberi nilai default channel/order_type = 'ONLINE_PICKUP' atau 'POS' sehingga query laporan historis tidak rusak.]`
- **Kompatibilitas API & Klien Lama:** `[Contoh: Field baru pada request POST /api/v1/orders bersifat opsional dengan default 'ONLINE_PICKUP'; tidak menghapus field respons lama.]`
- **Kompatibilitas Integrasi:** `[Contoh: Ekspor ke Accounting/ERP menambahkan kolom baru di akhir atau melalui versi skema terkoordinasi.]`

---

## 5. Rencana Migrasi Data & Strategi Cutover / Rollback

### 5.1 Langkah Migrasi Data & Urutan Deployment
1. **Pra-Migrasi (Zero-Downtime Schema Change):** `[Contoh: Tambah tabel baru dan kolom nullable/default terlebih dahulu sebelum kode aplikasi baru diaktifkan.]`
2. **Backfill Data Eksisting:** `[Contoh: Jalankan script backfill secara bertahap per 5.000 baris untuk mengisi nilai default tanpa mengunci tabel produksi.]`
3. **Deployment & Feature Flag:** `[Contoh: Deploy backend, aktifkan toggle fitur baru di 1 cabang pilot terlebih dahulu.]`

### 5.2 Kriteria & Prosedur Rollback (Jika Terjadi Insiden Pasca-Rilis)
- **Pemicu Rollback:** `[Contoh: Error rate > 2%, mismatch data keuangan, atau kegagalan integrasi kritikal dalam 30 menit pertama.]`
- **Langkah Rollback:** `[Contoh: Matikan feature flag agar alur kembali ke perilaku Fase 1; pastikan skema DB tidak melakukan drop kolom destruktif sebelum rilis dinyatakan stabil 7 hari.]`

---

## 6. Risiko Teknis, Mitigasi, & Estimasi Usaha

### 6.1 Matriks Risiko CR

| Risiko | Dampak | Mitigasi |
| :--- | :---: | :--- |
| `[Contoh: Keterlambatan webhook dari mitra kurir menyebabkan status tertahan]` | Tinggi | `[Tambahkan mekanisme polling fallback setiap 10 menit dan dashboard manual override oleh Branch Manager]` |

### 6.2 Estimasi Usaha & Dampak Jadwal (*Effort & Timeline Impact*)

| Tim / Peran | Estimasi Effort (Man-Days) | Catatan Dampak ke Jadwal / Sprint Aktif |
| :--- | :---: | :--- |
| System Analyst (Update Spec & Test Scenarios) | `[X hari]` | `[...]` |
| Backend & Database Engineering | `[X hari]` | `[...]` |
| Frontend / Mobile Engineering | `[X hari]` | `[...]` |
| QA & UAT Bisnis | `[X hari]` | `[...]` |
| **Total Dampak Jadwal** | **`[Total X hari]`** | `[Apakah menggeser tanggal Go-Live atau masuk ke sprint berikutnya?]` |

---

## 7. Keputusan CAB / Product Manager & Persetujuan (*Sign-Off*)

- **Keputusan Akhir:** `[ ] Approved for Current Release` | `[ ] Approved for Next Phase / Backlog` | `[ ] Rejected` | `[ ] Need More Info`
- **Catatan Keputusan:** `[Tuliskan alasan keputusan atau syarat khusus sebelum eksekusi.]`

| Peran | Nama | Keputusan | Tanggal | Tanda Tangan |
| :--- | :--- | :---: | :--- | :--- |
| Product Manager / Business Owner | `[Nama]` | `[Approved / ...]` | `[YYYY-MM-DD]` | `[__________]` |
| Tech Lead / Architect | `[Nama]` | `[Approved / ...]` | `[YYYY-MM-DD]` | `[__________]` |
| QA Lead | `[Nama]` | `[Reviewed]` | `[YYYY-MM-DD]` | `[__________]` |
| System Analyst (Author) | `[Nama]` | `[Submitted]` | `[YYYY-MM-DD]` | `[__________]` |
