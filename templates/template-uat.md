# User Acceptance Testing (UAT) Script & Business Sign-Off

> **Petunjuk Penggunaan Template:** UAT bukan pengujian teknis mencari *bug* sintaks (itu tugas QA di tahap SIT), melainkan pembuktian bersama **pengguna bisnis** bahwa sistem yang dibangun benar-benar memecahkan masalah bisnis, mematuhi aturan keuangan/operasional, dan siap dipakai di dunia nyata sebelum keputusan *Go-Live* diambil.

---

## 1. Informasi Rilis & Lingkungan Uji (*Release & Environment Info*)

| Atribut | Detail |
| :--- | :--- |
| **Nama Sistem / Modul** | `[misal: NusaPOS & OrderHub — Fase 1]` |
| **Versi Aplikasi / Build Tag** | `[misal: v1.0.0-rc2]` |
| **Lingkungan Uji (*Staging URL*)** | `[https://staging.example.internal]` |
| **Periode Pelaksanaan UAT** | `[YYYY-MM-DD s.d. YYYY-MM-DD]` |
| **Koordinator SA** | `[Nama System Analyst]` |
| **Perwakilan Bisnis (*UAT Lead*)** | `[Nama Operational / Finance Lead]` |

---

## 2. Prasyarat Data Uji & Akun Peran (*Test Data & Role Prerequisites*)

Pastikan seluruh data awal berikut tersedia di lingkungan *Staging* sebelum sesi UAT dimulai:

| Kategori Prasyarat | Detail Data / Akun Uji | Catatan Kondisi Awal |
| :--- | :--- | :--- |
| **Akun Pengguna per Role** | `cashier_01` (`Cashier`), `barista_01` (`Kitchen/Barista`), `mgr_01` (`Branch Manager`), `cust_01` (`Customer`) | Masing-masing terikat ke `store_id = STR-001` |
| **Data Master Menu & Stok** | Varian `VAR-001` (Stok awal `on_hand = 10`), Varian `VAR-002` (Stok awal `on_hand = 1` untuk uji batas stok) | Harga dalam Rupiah bulat, pajak & promo aktif |
| **Integrasi Sandbox** | Payment Gateway Sandbox aktif dengan endpoint simulasi callback QRIS/VA | Accounting/ERP staging siap menerima ekspor |

---

## 3. Kriteria Kelulusan UAT (*UAT Exit Criteria*)

Rilis dinyatakan **Lulus UAT (*Go*)** hanya apabila seluruh syarat berikut terpenuhi:
1. `100%` skenario prioritas **Critical / Must Have** (khususnya alur pembayaran, pemotongan stok, void/refund, dan rekonsiliasi) berstatus `PASS`.
2. Tidak ada cacat terbuka (*Open Defect*) dengan tingkat keparahan **Blocker** maupun **Critical**.
3. Setiap cacat berstatus **Major/Minor** yang ditunda perbaikannya telah memiliki *workaround* operasional dan disetujui tertulis oleh Business Owner.

---

## 4. Tabel Skenario Pengujian UAT (*UAT Test Execution Matrix*)

| UAT ID | Ref FR / UC | Skenario Pengujian | Langkah Eksekusi (*Step-by-Step*) | Data Uji | Hasil yang Diharapkan (*Expected Result*) | Hasil Aktual (*Actual Result*) | Status (`Pass/Fail/Blocked`) | Bukti (*Screenshot/ID*) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `UAT-01` | `FR-01` / `UC-01` | Login sukses & pembatasan akses peran | 1. Buka portal POS.<br>2. Login sebagai `cashier_01`.<br>3. Coba akses menu approval refund cabang. | Akun `cashier_01` | Login berhasil; menu approval refund tidak dapat diakses (`403` / tersembunyi). | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-02` | `FR-03` / `UC-03` | Checkout online & reservasi stok berhasil | 1. Login `cust_01`.<br>2. Pesan `VAR-001` sebanyak `2`.<br>3. Klik Checkout QRIS. | `VAR-001` (`on_hand=10`) | Order `PENDING_PAYMENT` terbentuk dengan `expires_at` +15 menit; `reserved_qty` menjadi `2`. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-03` | `FR-03` / `NFR-02` | Penolakan stok kurang (Boundary Test) | 1. Coba pesan `VAR-002` sebanyak `2` padahal stok tersedia `1`. | `VAR-002` (`available=1`) | Sistem menolak checkout dengan pesan stok tidak mencukupi (`ERR_INSUFFICIENT_STOCK`); stok tetap `1`. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-04` | `FR-04` / `UC-04` | Pembayaran QRIS & idempotency webhook | 1. Simulasikan bayar QRIS sukses.<br>2. Kirim ulang webhook dengan `external_tx_id` sama. | Order dari `UAT-02` | Status berubah ke `PAID`, `on_hand` berkurang `2`, notifikasi terkirim. Pengiriman ulang webhook tidak memotong stok dua kali. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-05` | `FR-07` / `UC-06` | Pengajuan & approval void/refund pasca-bayar | 1. `cashier_01` ajukan refund order `PAID`.<br>2. `mgr_01` setujui refund. | Order berstatus `PAID` | Status menjadi `REFUNDED`, tercatat di `refunds` dan `audit_logs` dengan ID `mgr_01`. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-06` | `FR-08` / `UC-06` | Rekonsiliasi harian cabang & waktu lokal | 1. Tutup hari cabang oleh `mgr_01`.<br>2. Bandingkan total tunai, QRIS, & refund. | Transaksi hari uji (`Asia/Jakarta`) | Angka pada `daily_reconciliations` cocok 100% tanpa selisih pembulatan; siap dikirim ke Accounting/ERP. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |

---

## 5. Catatan Temuan / Cacat (*Defect Log Ringkas*)

| Defect ID | Ref UAT ID | Severity (`Blocker/Critical/Major/Minor`) | Priority | Deskripsi Singkat Masalah | PIC Perbaikan | Status (`Open/Fixed/Retested/Closed`) |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `DEF-01` | `[UAT-XX]` | `[Major]` | `[High]` | `[Contoh: Timestamp di struk cetak masih tampil dalam UTC, belum dikonversi ke WIB]` | `[Backend/FE]` | `[Open / Closed]` |
| `DEF-02` | `[...]` | `[...]` | `[...]` | `[...]` | `[...]` | `[...]` |

---

## 6. Catatan Deviasi / Masalah Diketahui (*Known Issues & Workarounds*)

`[Tuliskan jika ada ketidaksesuaian minor yang disepakati bersama untuk dirilis dengan catatan dan rencana perbaikan di rilis tambalan (patch) berikutnya.]`

---

## 7. Lembar Keputusan Akhir & Sign-Off User Bisnis

Berdasarkan hasil eksekusi UAT dan tinjauan atas *Defect Log* di atas, perwakilan bisnis menyatakan keputusan rilis sebagai berikut:

- **Keputusan UAT:** `[ ] GO (Layak Rilis Produksi)` | `[ ] CONDITIONAL GO (Rilis dengan Syarat/Workaround)` | `[ ] NO-GO (Tunda Rilis)`
- **Catatan / Syarat Tambahan:** `[Tuliskan catatan jika memilih Conditional Go atau No-Go.]`

| Peran | Nama | Status Persetujuan | Tanggal | Tanda Tangan |
| :--- | :--- | :---: | :--- | :--- |
| Operational / Store Lead | `[Nama]` | `[Approved / Rejected]` | `[YYYY-MM-DD]` | `[__________]` |
| Finance / Accounting Lead | `[Nama]` | `[Approved / Rejected]` | `[YYYY-MM-DD]` | `[__________]` |
| System Analyst (UAT Coordinator) | `[Nama]` | `[Verified]` | `[YYYY-MM-DD]` | `[__________]` |
| QA Lead | `[Nama]` | `[Verified]` | `[YYYY-MM-DD]` | `[__________]` |
