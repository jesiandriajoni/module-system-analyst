# User Acceptance Testing (UAT) Script & Business Sign-Off — NusaPOS & OrderHub (Fase 1)

> **Konteks Portofolio & Referensi Kurikulum:** Dokumen ini merupakan skrip pengujian penerimaan pengguna (*User Acceptance Testing*) resmi untuk rilis **Fase 1 NusaPOS & OrderHub**, mengacu pada [`template-uat.md`](../templates/template-uat.md) dan terlacak penuh ke [01-brd-nusapos.md](01-brd-nusapos.md), [02-srs-nusapos.md](02-srs-nusapos.md), serta [03-api-contract-nusapos.md](03-api-contract-nusapos.md).

---

## 1. Informasi Rilis & Lingkungan Uji (*Release & Environment Info*)

| Atribut | Detail |
| :--- | :--- |
| **Nama Sistem / Modul** | **NusaPOS & OrderHub — Fase 1 (POS In-Store & Online Self-Pickup)** |
| **Versi Aplikasi / Build Tag** | `v1.0.0-rc2` |
| **Lingkungan Uji (*Staging URL*)** | `https://staging.nusapos.internal` (API: `https://staging-api.nusakopi.internal`) |
| **Periode Pelaksanaan UAT** | `2026-11-24 s.d. 2026-11-27` |
| **Koordinator SA** | Tim System Analyst — NusaKopi Digital Transformation |
| **Perwakilan Bisnis (*UAT Lead*)** | Rina Kusumawati (Operational Lead) & Budi Santoso (Finance Lead) |

---

## 2. Prasyarat Data Uji & Akun Peran (*Test Data & Role Prerequisites*)

Seluruh data awal di bawah ini wajib tersedia pada lingkungan *Staging* sebelum sesi UAT dimulai:

| Kategori Prasyarat | Detail Data / Akun Uji | Catatan Kondisi Awal |
| :--- | :--- | :--- |
| **Akun Pengguna per Role (`STR-001`)** | `cashier_01` (`Cashier`), `barista_01` (`Kitchen/Barista`), `mgr_01` (`Branch Manager`, PIN `654321`), `cust_01` (`Customer`), `hq_admin_01` (`HQ Admin`) | Aktor cabang terikat ke `store_id = STR-001` (`Asia/Jakarta`). Tersedia pula cabang pembanding `STR-002` untuk uji anti-IDOR. |
| **Data Master Menu, Stok, & Promo** | `VAR-001` (Kopi Susu Aren Regular, `base_price = 28000`, `on_hand = 10`, `reserved = 0`), `VAR-002` (Kopi Susu Aren Large, `base_price = 34000`, `on_hand = 1`, `reserved = 0`), `VAR-005` (`base_price = 24000`, `on_hand = 10`, `reserved = 0`), Promo `KOPIPAGI10` (`10%`, kuota `50`, aktif). | Pajak PPN `11%`, pembulatan `HALF_UP` ke bilangan bulat Rupiah (`BIGINT`). |
| **Integrasi Sandbox & Scheduler** | Simulator `Payment Gateway (QRIS/VA)` aktif (mendukung header `X-Webhook-Signature` HMAC-SHA256); `ReleaseExpiredReservationsJob` aktif per 1 menit; `Notification Service` & `Accounting/ERP` Staging siap menerima payload. | Seluruh log aplikasi dan `audit_logs` dapat diperiksa oleh SA/QA pendamping UAT. |

---

## 3. Kriteria Kelulusan UAT (*UAT Exit Criteria*)

Rilis Fase 1 dinyatakan **Lulus UAT (*GO*)** hanya apabila seluruh syarat berikut terpenuhi:
1. `100%` skenario pengujian berprioritas **Critical / Must Have** (`UAT-01` s.d. `UAT-11`) berstatus `PASS`.
2. Tidak ada cacat terbuka (*Open Defect*) dengan tingkat keparahan **Blocker** maupun **Critical** (khususnya terkait pemotongan stok, idempotency webhook, otorisasi refund, atau selisih pembulatan/zona waktu rekonsiliasi).
3. Setiap cacat **Major/Minor** yang ditunda perbaikannya ke rilis tambalan telah memiliki *workaround* operasional dan disetujui tertulis pada Lembar Keputusan Akhir.

---

## 4. Tabel Skenario Pengujian UAT (*UAT Test Execution Matrix*)

| UAT ID | Ref FR / NFR / UC | Teknik Uji & Fokus | Skenario Pengujian | Langkah Eksekusi (*Step-by-Step*) | Data Uji | Hasil yang Diharapkan (*Expected Result*) | Hasil Aktual (*Actual Result*) | Status | Bukti |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `UAT-01` | `FR-01`, `NFR-03` / `UC-01` | EP — Autentikasi & Anti-IDOR | Login sukses `Cashier` serta penolakan akses lintas `store_id` dan menu admin pusat. | 1. Login sebagai `cashier_01` di POS (`POST /api/v1/auth/login`).<br>2. Coba akses rekonsiliasi cabang lain (`GET /api/v1/reconciliations/daily?store_id=STR-002&business_date=2026-11-25`).<br>3. Coba akses master promo `HQ Admin`. | Akun `cashier_01` (`STR-001`) | Login `200 OK` dengan JWT `store_id = STR-001`. Akses ke `STR-002` atau menu `HQ Admin` ditolak `403 Forbidden` (`ERR_UNAUTHORIZED_APPROVAL`) dan tercatat di `audit_logs`. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-02` | `FR-02`, `NFR-01` / `UC-02`, `UC-03` | EP — Katalog & Master | Tampilan katalog menu cabang `STR-001` dengan stok tersedia dan promo aktif. | 1. Buka layar `SCR-ORD-001` sebagai `cust_01`.<br>2. Pilih cabang `STR-001`.<br>3. Periksa harga, ketersediaan `VAR-001` & `VAR-002`, serta promo `KOPIPAGI10`. | `STR-001`, `VAR-001` (`10`), `VAR-002` (`1`) | `GET /api/v1/stores/STR-001/menu` membalas `200 OK`, `VAR-001` tampil `available_qty = 10`, `VAR-002` tampil `available_qty = 1`, dan seluruh harga dalam Rupiah bulat. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-03` | `FR-03`, `NFR-04` / `UC-02` | Happy Path — POS Tunai | Pembuatan & pelunasan pesanan `POS` tunai (`CASH`) di konter cabang. | 1. `cashier_01` buka `SCR-POS-002`, pilih `1` unit `VAR-001` (`28000`).<br>2. Pilih metode bayar `CASH` dan selesaikan transaksi. | `VAR-001` (`on_hand=10`), `CASH` | `POST /api/v1/orders` membalas `201 Created` dengan `orders.status = PAID`, `payments.status = PAID`, `on_hand_qty` berkurang menjadi `9` (`DEDUCT`), struk tercetak dalam jam `Asia/Jakarta`. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-04` | `FR-03`, `NFR-04` / `UC-03` | Happy Path — Online Checkout + `HALF_UP` | Checkout `ONLINE_PICKUP` dengan kode promo dan reservasi stok TTL 15 menit. | 1. `cust_01` di `SCR-ORD-002` pesan `2` unit `VAR-001` + `1` unit `VAR-005`, masukkan promo `KOPIPAGI10`, pilih `QRIS`.<br>2. Klik Checkout. | `VAR-001` qty `2`, `VAR-005` qty `1`, promo `KOPIPAGI10` | `201 Created`: `subtotal = 80000`, `discount = 8000`, `tax = 7920`, `total = 79920`; `status = PENDING_PAYMENT`; `expires_at` = `+15 menit`; `reserved_qty` bertambah dan mutasi `RESERVE` tercatat. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-05` | `FR-03`, `NFR-02` / `UC-02`, `UC-03` | BVA & Concurrency — Stok Batas `1` | Penolakan stok kurang dan pencegahan *overselling* paralel pada sisa stok `1`. | 1. `cust_01` coba pesan `2` unit `VAR-002` (sisa `1`).<br>2. Ubah qty ke `1`, lalu kirim bersamaan `cust_01` (Online) dan `cashier_01` (POS) terhadap `VAR-002`. | `VAR-002` (`on_hand=1`, `reserved=0`) | Qty `2` ditolak `409 ERR_INSUFFICIENT_STOCK`. Pada kiriman paralel qty `1`, tepat 1 transaksi sukses (`201`) dan 1 transaksi ditolak `409 ERR_INSUFFICIENT_STOCK` (`0% oversell`). | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-06` | `FR-04`, `NFR-02`, `NFR-03` / `UC-04` | EP + Idempotency — Webhook QRIS | Pelunasan via *signed webhook* QRIS, uji *double webhook* (idempotency), dan penolakan signature palsu. | 1. Kirim webhook signature palsu untuk order `UAT-04`.<br>2. Kirim webhook `SETTLED` valid (`external_tx_id = PG-QRIS-UAT-06`).<br>3. Kirim ulang webhook identik 1x lagi. | Order dari `UAT-04` (`PENDING_PAYMENT`) | Signature palsu ditolak `401`. Webhook valid pertama mengubah status ke `PAID`, memotong `on_hand_qty` & `reserved_qty` (`DEDUCT`), memicu WA/Email. Replay webhook ke-2 membalas `200 OK` (`idempotent_replay = true`) tanpa memotong stok ulang. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-07` | `FR-04`, `FR-06` / `UC-03`, `UC-04` | BVA — Batas TTL 15 Menit & Late Payment | Pelepasan otomatis `EXPIRED` setelah TTL 15 menit dan penolakan webhook terlambat (`15m + 10s`). | 1. `cust_01` buat order QRIS baru (`VAR-001` qty `1`) pada `T0`.<br>2. Tunggu hingga melewati `T0 + 15m` dan `ReleaseExpiredReservationsJob` berjalan.<br>3. Simulasikan webhook `SETTLED` masuk pada `T0 + 15m 10s`. | `VAR-001` qty `1`, TTL 15 menit | Setelah `15m`, order otomatis berstatus `EXPIRED`, `reserved_qty` dilepas (`RELEASE`). Webhook terlambat ditolak `410 Gone` (`ERR_RESERVATION_EXPIRED`), stok tidak dipotong, dan insiden *late payment* tercatat di `audit_logs`. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-08` | `FR-05` / `UC-05` | Happy Path & Negative — Dapur | Pemrosesan pesanan dapur hingga penyerahan dan penolakan transisi status ilegal. | 1. Coba pindahkan order `PENDING_PAYMENT` ke `PREPARING`.<br>2. Pada order `PAID` dari `UAT-06`, `barista_01` ubah `PAID -> PREPARING -> READY` di `SCR-KDS-001`.<br>3. `cashier_01` ubah `READY -> COMPLETED` di `SCR-POS-004`. | Order `PAID` (`UAT-06`) & 1 order `PENDING_PAYMENT` | Transisi `PENDING_PAYMENT -> PREPARING` ditolak `422 ERR_INVALID_STATE_TRANSITION`. Alur `PAID -> PREPARING -> READY` memicu notifikasi siap ambil, dan `cashier_01` berhasil menyelesaikan ke `COMPLETED`. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-09` | `FR-06` / `UC-03` | EP — Pembatalan Pra-Bayar | Pembatalan manual oleh pelanggan sebelum dibayar (`PENDING_PAYMENT -> CANCELLED`). | 1. `cust_01` buat order QRIS baru (`VAR-001` qty `1`).<br>2. Di layar `SCR-ORD-003`, klik "Batalkan Pesanan". | Order baru status `PENDING_PAYMENT` | `PATCH .../status` ke `CANCELLED` sukses (`200 OK`), `reserved_qty` berkurang `1`, dan mutasi `RELEASE` tercatat di `inventory_movements`. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-10` | `FR-07`, `NFR-03` / `UC-06` | BVA & Security — Void/Refund Approval | Penolakan approval oleh `Cashier` serta persetujuan resmi `Branch Manager` + pengembalian stok. | 1. `cashier_01` di `SCR-REF-001` ajukan `REQUEST` refund untuk order `UAT-03` (`PAID`/`COMPLETED`), lalu coba tembak `action = "APPROVE"` memakai token `cashier_01`.<br>2. Login `mgr_01` (`STR-001`), masukkan PIN `654321`, setujui dengan `restock_items = true`. | Order lunas `UAT-03`, PIN `654321` | Upaya `APPROVE` oleh `cashier_01` ditolak `403 ERR_UNAUTHORIZED_APPROVAL` + `audit_logs`. Approval `mgr_01` mengubah order ke `REFUNDED`, mengembalikan `on_hand_qty` (`REFUND_RETURN`), dan merekam `approved_by = mgr_01` di `refunds` & `audit_logs`. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |
| `UAT-11` | `FR-08`, `NFR-04` / `UC-06` | BVA — Cut-off Waktu UTC->WIB & ERP | Rekonsiliasi harian cabang `STR-001` pada batas tengah malam `23:55 WIB` vs `00:05 WIB` dan ekspor ERP. | 1. Buat 1 transaksi lunas pada `23:55 WIB` (`16:55Z`) hari H dan 1 transaksi pada `00:05 WIB` (`17:05Z` hari yang sama UTC).<br>2. `mgr_01` buka `SCR-REC-001` tanggal H, cocokkan kas fisik, dan klik Finalisasi (`POST /api/v1/reconciliations/daily`). | Transaksi `23:55 WIB` & `00:05 WIB` | Rekon tanggal H hanya menghitung transaksi `<= 23:59:59 WIB` (`16:59:59Z`); total POS, Online, Tunai, QRIS/VA, dan Refund bernilai tepat (`variance_amount = 0`); status `erp_sync_status` berubah menjadi `QUEUED_FOR_SYNC` / `SYNCED`. | `[Diisi saat eksekusi]` | `[Pass / Fail]` | `[link/img]` |

---

## 5. Catatan Temuan / Cacat (*Defect Log Ringkas*)

| Defect ID | Ref UAT ID | Severity (`Blocker/Critical/Major/Minor`) | Priority | Deskripsi Singkat Masalah | PIC Perbaikan | Status (`Open/Fixed/Retested/Closed`) |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `DEF-01` | `[Diisi saat UAT]` | `[—]` | `[—]` | `[Contoh jika ditemukan: Timestamp struk cetak POS belum dikonversi ke WIB]` | `[—]` | `[—]` |

---

## 6. Catatan Deviasi / Masalah Diketahui (*Known Issues & Workarounds*)

*(Diisi apabila selama pelaksanaan UAT terdapat temuan Minor yang disepakati bersama untuk diselesaikan pada patch pasca-Go-Live tanpa menghambat peluncuran Fase 1.)*

---

## 7. Lembar Keputusan Akhir & Sign-Off User Bisnis

Berdasarkan hasil eksekusi UAT (`UAT-01` s.d. `UAT-11`) dan tinjauan terhadap *Defect Log* di atas, perwakilan bisnis menyatakan keputusan kesiapan rilis **NusaPOS & OrderHub Fase 1** sebagai berikut:

- **Keputusan UAT:** `[ ] GO (Layak Rilis Produksi)` | `[ ] CONDITIONAL GO (Rilis dengan Syarat/Workaround)` | `[ ] NO-GO (Tunda Rilis)`
- **Catatan / Syarat Tambahan:** `[Diisi pada rapat Go/No-Go pasca-eksekusi seluruh skenario UAT.]`

| Peran | Nama | Status Persetujuan | Tanggal | Tanda Tangan |
| :--- | :--- | :---: | :--- | :--- |
| Operational / Store Lead | Rina Kusumawati | `[Approved / Rejected]` | `[YYYY-MM-DD]` | `[__________]` |
| Finance / Accounting Lead | Budi Santoso, S.E., Ak. | `[Approved / Rejected]` | `[YYYY-MM-DD]` | `[__________]` |
| System Analyst (UAT Coordinator) | Tim System Analyst | `[Verified]` | `[YYYY-MM-DD]` | `[__________]` |
| QA Lead | Nadya Putri | `[Verified]` | `[YYYY-MM-DD]` | `[__________]` |
