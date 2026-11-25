# Kunci Jawaban & Pembahasan Bernalar: Bab 09–13

> **Cara Menggunakan Kunci Ini:** Jangan hanya mencocokkan hasil akhir! Fokuslah pada **penalaran sistem, kepatuhan terhadap kontrak domain kanonik ([`../README.md`](../README.md)), dan alasan risiko bisnis/teknis** di balik setiap keputusan pada Bab 09–13.

**Navigasi Cepat:**
- [Kunci Bab 09 — API Contract, Integrasi Sistem, & System Design Dasar](#bab-09--api-contract-integrasi-sistem--system-design-dasar) ([Buka Bab 09](../materi/09-api-integration-system-design.md))
- [Kunci Bab 10 — Non-Functional Requirements (NFR), Security, & Concurrency](#bab-10--non-functional-requirements-nfr-security--concurrency) ([Buka Bab 10](../materi/10-nfr-security-concurrency.md))
- [Kunci Bab 11 — Impact Analysis, Change Request (CR), Migrasi Data, & Batch/Reporting](#bab-11--impact-analysis-cr-migrasi-batch) ([Buka Bab 11](../materi/11-impact-analysis-cr-migrasi-batch.md))
- [Kunci Bab 12 — Dokumentasi Standar Industri: BRD, SRS, & FSD](#bab-12--dokumentasi-standar-industri-brd-srs--fsd) ([Buka Bab 12](../materi/12-dokumentasi-brd-srs-fsd.md))
- [Kunci Bab 13 — UAT, Testing Collaboration, & Handover](#bab-13--uat-testing-collaboration--handover) ([Buka Bab 13](../materi/13-uat-testing-handover.md))
- [Kamus Domain Kanonik & Peta Kurikulum](../README.md)

---

## Bab 09 — API Contract, Integrasi Sistem, & System Design Dasar

*(Tautan soal: [Bab 09 §7 Latihan Praktik](../materi/09-api-integration-system-design.md#7-latihan-praktik))*

### Pembahasan Skenario 1: Audit Kontrak API Cacat

| No | Kesalahan Fatal pada Usulan | Alasan Bahaya | Perbaikan Kanonik (`README.md`) |
| :---: | :--- | :--- | :--- |
| **1** | Memakai HTTP Method **`GET`** (`/api/v1/createOrder`) untuk membuat pesanan. | Melanggar semantik REST: `GET` harus bersifat *safe & read-only*, dapat di-*cache* browser/proxy, dan parameter sensitif tercatat di log URL. | Gunakan **`POST /api/v1/orders`** dengan JSON request body. |
| **2** | Memakai parameter **`branch_id`** bukan **`store_id`**. | Inkonsistensi penamaan lintas lapisan (database menggunakan `orders.store_id`). | Gunakan **`store_id`** secara seragam di seluruh payload API dan DB. |
| **3** | Klien mengirim **`total=50000`** melalui query string. | Celah keamanan fatal ***price tampering***: penyerang bisa memodifikasi URL menjadi `total=100` dan membeli kopi seharga Rp 100! | Hapus `total` dari input klien. Klien hanya mengirim `variant_id`, `qty`, `promo_code`; server menghitung ulang semua harga dalam `BIGINT` Rupiah (`HALF_UP`). |
| **4** | Tidak mewajibkan header **`Idempotency-Key`**. | Jika koneksi terputus lalu klien mencoba ulang (*retry*), server akan menciptakan pesanan ganda dan mereservasi stok dua kali. | Wajibkan header `Idempotency-Key: <uuid-v4>` pada `POST /api/v1/orders`. |
| **5** | Mengembalikan **`HTTP 200 OK`** saat stok habis dan membocorkan pesan error mentah SQL (`duplicate key value violates unique constraint...`). | Membingungkan monitoring/klien (mengira transaksi sukses) dan membocorkan nama tabel/struktur database kepada penyerang (*information leakage*). | Kembalikan **`409 Conflict`** dengan amplop error standar (`success: false`, `error.code: "ERR_INSUFFICIENT_STOCK"`, pesan ramah pengguna, `details`, dan `trace_id`). |

---

### Pembahasan Skenario 2: Kontrak `PATCH /api/v1/orders/{orderId}/status`

- **Aturan RBAC & Transisi Status Fase 1 (`8` status kanonik):**
  - `Customer`: hanya boleh mengubah `PENDING_PAYMENT -> CANCELLED` untuk `order_id` miliknya sendiri (kanal `ONLINE_PICKUP`).
  - `Cashier`: boleh mengubah `PENDING_PAYMENT -> CANCELLED` (jika pelanggan batal bayar QRIS di konter) dan `READY -> COMPLETED` (saat menyerahkan pesanan ke pelanggan) pada `store_id` penugasannya.
  - `Kitchen/Barista`: boleh mengubah `PAID -> PREPARING` dan `PREPARING -> READY` pada `store_id` penugasannya.
  - *(Catatan: Transisi ke `PAID` dipicu oleh transaksi tunai di `POST /api/v1/orders` atau webhook `POST /api/v1/webhooks/payments/qris`; ke `EXPIRED` oleh scheduler; dan ke `REFUNDED` melalui `POST /api/v1/orders/{orderId}/refunds`.)*

**Request Body (Contoh `Kitchen/Barista` memindahkan ke `PREPARING`):**
```json
{
  "status": "PREPARING",
  "notes": "Mulai diracik oleh barista shift pagi"
}
```

**Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "order_id": "ORD-20261125-0042",
    "previous_status": "PAID",
    "status": "PREPARING",
    "updated_at": "2026-11-25T05:35:00Z"
  }
}
```

**Response Gagal Jika Mencoba Memindahkan `EXPIRED -> PREPARING` (`422 Unprocessable Entity`):**
```json
{
  "success": false,
  "error": {
    "code": "ERR_INVALID_STATE_TRANSITION",
    "message": "Status pesanan tidak dapat diubah dari EXPIRED ke PREPARING.",
    "details": {
      "order_id": "ORD-20261125-0042",
      "current_status": "EXPIRED",
      "requested_status": "PREPARING"
    },
    "trace_id": "req-7c8d9e0f1a2b"
  }
}
```

---

### Pembahasan Skenario 3: Analisis Skenario Webhook Ganda & Terlambat (`ORD-100`)

- **(a) Webhook Duplikat (`10:04:15Z`, `external_tx_id` sama):**
  - **HTTP Status Code:** **`200 OK`** (bukan `409` atau `500`, karena tujuan webhook adalah memberi sinyal ke `Payment Gateway` bahwa event ini sudah ditangani sehingga gateway berhenti mengirim ulang).
  - **Perilaku Stok & Status:** **Tidak ada perubahan** pada `inventories`, `inventory_movements`, `payments`, maupun `orders.status` (tetap `PAID`).
  - **Respons JSON:** `{"success": true, "data": {"order_id": "ORD-100", "status": "PAID", "idempotent_replay": true}}`.
- **(b) Webhook Terlambat Tiba (`10:17:00Z`, setelah `ORD-100` menjadi `EXPIRED` pada `10:15:30Z`):**
  - **Mengapa dilarang langsung mengubah ke `PAID` dan memotong stok?** Karena pada `10:15:30Z`, scheduler telah melepaskan `reserved_qty` (`RELEASE`). Dalam jeda 1,5 menit tersebut, stok fisik bisa saja sudah dibeli oleh pelanggan lain di toko! Jika webhook memaksa memotong stok lagi, akan terjadi **overselling (stok negatif)** yang melanggar `NFR-02`.
  - **Langkah Pengamanan Sistem:**
    1. Dalam transaksi DB yang mengunci baris `ORD-100`, deteksi bahwa `orders.status = 'EXPIRED'` (atau `NOW() > expires_at`).
    2. Jangan sentuh `inventories` dan jangan ubah `orders.status` ke `PAID`.
    3. Catat kejadian *late payment* ini ke tabel `payments` / `audit_logs` dengan penanda khusus (`NEEDS_REFUND_RECONCILIATION`) dan kirim alert ke tim Finance/Support agar dana pelanggan dikembalikan.
    4. Balas gateway dengan `410 Gone` / `409 Conflict` menggunakan kode error kanonik **`ERR_RESERVATION_EXPIRED`**.

---

### Pembahasan Skenario 4: Syarat Ketat *POS Offline Sync Queue*

Sebelum fitur *offline mode* disetujui masuk backlog fase mendatang, SA wajib mengunci **3 syarat arsitektur**:
1. **Pembatasan Metode Bayar (Hanya `CASH`):** Saat perangkat kasir berada dalam mode offline, opsi pembayaran `QRIS` dan `VA` dinamis wajib dinonaktifkan karena membutuhkan verifikasi *real-time* ke `Payment Gateway`.
2. **Idempotency Lokal (`client_order_id`):** Tablet kasir harus membangkitkan UUID unik lokal `client_order_id` dan `client_created_at` pada saat struk dicetak offline, lalu mengirimkannya sebagai `Idempotency-Key` ketika sinkronisasi ke server agar koneksi yang putus-nyambung tidak menggandakan pesanan di database pusat.
3. **Protokol Resolusi Konflik Stok (`Eventual Consistency`):** Karena stok bisa habis dibeli oleh `OrderHub` online saat cabang terputus internet, server tidak boleh menolak transaksi tunai yang uangnya sudah diterima kasir. Saat sinkronisasi mendeteksi `available_qty < qty`, transaksi tetap disimpan dengan flag konflik (`STOCK_CONFLICT_RECONCILE`) dan memicu notifikasi wajib kepada `Branch Manager` untuk melakukan penyesuaian stok opname (`ADJUSTMENT` di `inventory_movements`).

---

## Bab 10 — Non-Functional Requirements (NFR), Security, & Concurrency

*(Tautan soal: [Bab 10 §7 Latihan Praktik](../materi/10-nfr-security-concurrency.md#7-latihan-praktik))*

### Pembahasan Skenario 1: Menulis Ulang NFR Kabur Menjadi NFR Terukur

| Butir | Pernyataan Kabur Awal | Spesifikasi NFR Terukur (`NFR-01` s.d. `NFR-04`) | Metode Verifikasi QA/Ops |
| :---: | :--- | :--- | :--- |
| **(a)** | *"Aplikasi pemesanan harus sangat cepat saat jam makan siang."* | `NFR-01`: Pada beban puncak **150 RPS** nasional, waktu respons *p95* untuk `GET /api/v1/stores/{storeId}/menu` harus **`<= 300 ms`** dan `POST /api/v1/orders` harus **`<= 500 ms`**. | *Load Test* dengan k6/JMeter selama 15 menit pada lingkungan Staging berbeban 150 RPS. |
| **(b)** | *"Stok tidak boleh salah potong meskipun banyak orang memesan bareng."* | `NFR-02`: Seluruh operasi reservasi dan pengurangan stok pada `inventories` wajib berjalan di dalam **1 transaksi database atomik** dengan *row-level locking* (`SELECT ... FOR UPDATE`), menjamin **0% overselling** (`available_qty >= 0`). | *Concurrency Test* menembakkan 50 request paralel bersamaan ke 1 item bersisa stok `5` -> wajib hanya `5` yang `201 Created` dan `45` lainnya `409 ERR_INSUFFICIENT_STOCK`. |
| **(c)** | *"Data catatan audit keamanan tidak boleh hilang atau diubah."* | `NFR-03`: Seluruh aksi sensitif tercatat pada `audit_logs` yang bersifat ***immutable* (*append-only*, tanpa izin `UPDATE`/`DELETE` bagi seluruh peran aplikasi)** dengan masa retensi minimal **5 tahun**. | Audit hak akses DB (*role privileges*), uji percobaan `UPDATE`/`DELETE` `audit_logs` harus ditolak, dan verifikasi kebijakan arsip/backup 5 tahun. |
| **(d)** | *"Aplikasi kasir tidak boleh sering mati saat toko buka."* | `NFR-04`: Ketersediaan layanan transaksi inti (*availability*) wajib **`>= 99,5%`** selama jam operasional toko (**06.00–23.00 WIB / `Asia/Jakarta`**). | Pemantauan *uptime probe* setiap 1 menit selama jam operasional dan laporan SLA bulanan. |

---

### Pembahasan Skenario 2: Audit Celah Keamanan IDOR, RBAC, & XSS

| Butir | Nama Kerentanan | Kode HTTP & Error Kanonik | Aturan Perbaikan Spesifikasi |
| :---: | :--- | :--- | :--- |
| **(a)** | **IDOR (*Insecure Direct Object Reference* / Broken Access Control lintas `store_id`)** | `403 Forbidden` · **`ERR_UNAUTHORIZED_APPROVAL`** | Backend **dilarang** mempercayai `store_id` dari parameter URL untuk aktor tingkat cabang (`Cashier`, `Kitchen/Barista`, `Branch Manager`). Server wajib membandingkan `query.store_id === jwt.store_id` (kecuali `HQ Admin`). |
| **(b)** | **Broken Function-Level Authorization (Eskalasi Hak Akses RBAC)** | `403 Forbidden` · **`ERR_UNAUTHORIZED_APPROVAL`** | Menyembunyikan tombol di UI tidak cukup. Endpoint `POST /api/v1/orders/{orderId}/refunds` wajib mengecek `jwt.role === 'Branch Manager'` **dan** `jwt.store_id === orders.store_id` untuk `action = 'APPROVE'`, serta mencatat upaya ilegal ke `audit_logs`. |
| **(c)** | **Stored XSS (*Cross-Site Scripting*)** | `400 Bad Request` (jika karakter berbahaya ditolak) + *Safe Output Encoding* | Backend wajib melakukan sanitasi/validasi input `notes` (menolak atau men-strip tag HTML `<script>`, atribut `onerror=`), dan dashboard admin/KDS wajib merender teks sebagai *plain text* (auto-escape HTML), bukan `innerHTML` mentah. |

---

### Pembahasan Skenario 3: Investigasi *Deadlock* & Solusi Lock Ordering

- **Mengapa *Deadlock* Terjadi?**
  1. Thread A mengunci baris `VAR-001` (`SELECT ... FOR UPDATE`), lalu bersiap mengunci `VAR-002`.
  2. Pada milidetik yang sama, Thread B sudah lebih dulu mengunci baris `VAR-002`, lalu bersiap mengunci `VAR-001`.
  3. Thread A menunggu Thread B melepas `VAR-002`, sementara Thread B menunggu Thread A melepas `VAR-001`. Keduanya saling menunggu selamanya (*circular wait*) hingga PostgreSQL membatalkan salah satu transaksi dengan error `deadlock detected`.
- **Satu Aturan Desain Pencegah *Deadlock* 100%:**
  **Deterministic Lock Ordering:** Sebelum mengeksekusi query `SELECT ... FOR UPDATE` ke tabel `inventories`, backend **wajib mengurutkan daftar `variant_id` dalam keranjang secara menaik (`SORT ASC`)** (atau langsung menggunakan satu query `WHERE store_id = $1 AND variant_id = ANY($2) ORDER BY variant_id ASC FOR UPDATE`). Dengan demikian, baik Pelanggan A maupun B akan selalu mengunci `VAR-001` terlebih dahulu baru `VAR-002`—tidak akan pernah terjadi tunggu-menunggu melingkar!

---

### Pembahasan Skenario 4: Memisahkan Panggilan Eksternal dari Transaksi Lock Database

- **Mengapa Penempatan Langkah (3) & (4) di Dalam Transaksi Lock Sangat Berbahaya?**
  1. **Melanggar `NFR-02` (Lock Contention Cabang):** Panggilan HTTP ke `Payment Gateway` bisa memakan waktu 1–5 detik (atau bahkan timeout 5 detik saat gangguan jaringan). Selama 5 detik itu, baris `inventories` cabang `STR-001` terkunci sehingga kasir di toko fisik tidak bisa memproses pesanan tunai untuk item tersebut!
  2. **Melanggar `NFR-01` (Latensi p95):** Menambahkan panggilan sinkron ke `Notification Service` di jalur kritis memperpanjang waktu respons melebihi `500 ms` dan berisiko menggagalkan seluruh transaksi pesanan hanya gara-gara server WhatsApp sedang lambat.
- **Pemisahan Alur yang Lebih Aman:**
  1. *Tahap 1 (Transaksi DB Super Singkat < 20 ms):* Kunci baris `inventories` secara terurut, validasi stok & hitung harga, simpan `orders` (`PENDING_PAYMENT`), `inventories` (`reserved_qty`), `inventory_movements` (`RESERVE`), dan `payments` (`PENDING`), lalu langsung **`COMMIT`**.
  2. *Tahap 2 (Panggilan Gateway di Luar Lock):* Panggil API `Payment Gateway` untuk mendapatkan string QRIS dinamis dengan timeout ketat (`5s`), lalu perbarui `payments.qris_payload` (jika gagal/timeout, batalkan order/lepas reservasi dengan transaksi terpisah).
  3. *Tahap 3 (Asinkron di Latar Belakang):* Kirim tugas notifikasi `Notification Service` melalui *message queue* asinkron dengan retry & DLQ—jangan pernah di jalur respons utama `POST /api/v1/orders`.

---

## Bab 11 — Impact Analysis, Change Request (CR), Migrasi Data, & Batch/Reporting

*(Tautan soal: [Bab 11 §7 Latihan Praktik](../materi/11-impact-analysis-cr-migrasi-batch.md#7-latihan-praktik))*

### Pembahasan Skenario 1: Menangani *Scope Creep* Menjelang UAT Fase 1

Sebagai SA, gunakan kontrol **CR & 6-Layer Impact Analysis** untuk memisahkan kedua permintaan secara objektif:

1. **Voucher Diskon Persentase Maksimal Cap (misal 20% maks. Rp 15.000):**
   - *Evaluasi:* Lebih kecil ruang lingkupnya, namun **tetap wajib lewat prosedur CR** karena menyentuh skema `promotions` (tambah kolom `max_discount_amount BIGINT`), kalkulasi harga di `POST /api/v1/orders` (aturan pembulatan `HALF_UP`), layar admin `HQ Admin`, dan kasus uji UAT baru. Jika disisipkan 3 hari sebelum UAT tanpa menggeser jadwal atau tanpa re-test, risiko bug selisih harga sangat tinggi. Rekomendasi SA: **tawarkan masuk ke rilis tambalan (`v1.0.1` pasca-Go-Live) atau resmi tambah waktu sprint** jika wajib ada saat peluncuran.
2. **`CR-001` Delivery 3PL (Fase 2):**
   - *Evaluasi:* **Wajib ditolak dari Fase 1 (Deferred ke Fase 2)** menggunakan bukti dampak 6 lapisan:
     - *Lapisan 1 (UI):* Perlu layar pin alamat baru dan pelacakan kurir.
     - *Lapisan 2 (State Machine):* Menambah status baru **`OUT_FOR_DELIVERY`** dan **`DELIVERED`** khusus delivery.
     - *Lapisan 3 (API):* Tambah endpoint booking ongkir & webhook **`Courier/3PL`** ber-HMAC.
     - *Lapisan 4 (DB):* Menambah 2 tabel baru (**`customer_addresses`** dan **`deliveries`**) serta kolom `delivery_fee` di `orders`.
     - *Lapisan 5 (Integrasi):* Butuh kontrak sandbox & uji keandalan dengan mitra `Courier/3PL` (tidak mungkin selesai dalam 3 hari).
     - *Lapisan 6 (Reporting):* Memisahkan akuntansi ongkir vs omzet menu di `daily_reconciliations`.

---

### Pembahasan Skenario 2: Analisis Dampak Refund Ongkir pada `CR-001` (`DELIVERY_3PL`)

- **(a) Aturan Transisi Status `OUT_FOR_DELIVERY -> REFUNDED`:**
  Pada Fase 2 `CR-001`, status **`OUT_FOR_DELIVERY`** adalah status pasca-bayar (dana sudah `PAID`). Oleh karena itu, seperti halnya `PAID`, `PREPARING`, dan `READY`, state machine Fase 2 mengizinkan transisi **`OUT_FOR_DELIVERY -> REFUNDED`** **hanya** melalui persetujuan eksplisit `Branch Manager` di `POST /api/v1/orders/{orderId}/refunds` (tanpa perlu memaksa status berpura-pura menjadi `DELIVERED` atau `COMPLETED` karena minuman memang tidak pernah sampai utuh ke pelanggan). Selain itu, sistem harus mengirim permintaan pembatalan/update tiket ke `deliveries`.
- **(b) Dampak ke `refunds`, `inventory_movements`, & `daily_reconciliations`:**
  1. **`refunds`:** Nominal pengembalian adalah penuh **`Rp 92.000`** (`Rp 80.000` produk + `Rp 12.000` `delivery_fee`) jika kesalahan pengiriman/produk membuat pesanan gagal dinikmati pelanggan, dan wajib tercatat beserta `approved_by` di `audit_logs`.
  2. **`inventory_movements`:** `restock_items` bernilai **`false`**! Karena minuman sudah diracik dan tumpah di jalan, stok fisik bahan/cup di toko **tidak boleh** dikembalikan (`REFUND_RETURN`) ke `inventories.on_hand_qty` (jika dikembalikan, stok sistem akan tercatat lebih banyak dari fisik gudang).
  3. **`daily_reconciliations` & `Accounting/ERP`:** Memisahkan pengembalian produk (`Rp 80.000`) dan pengembalian/klaim ongkir kurir (`Rp 12.000`) sehingga bagian Finance dapat menagihkan klaim asuransi/kompensasi ke vendor `Courier/3PL` tanpa mengacaukan angka PPN penjualan kopi.

---

### Pembahasan Skenario 3: Strategi Migrasi Zero-Downtime & Rollback (2,5 Juta Baris)

- **Mengapa `ALTER TABLE orders ADD COLUMN ... NOT NULL` Tanpa `DEFAULT` Berbahaya?**
  1. Pada database produksi dengan 2,5 juta baris, perintah `NOT NULL` tanpa nilai `DEFAULT` akan langsung **gagal** karena baris lama tidak punya nilai, atau jika dipaksa pengisian massal secara sinkron dapat memicu *Access Exclusive Lock* yang menghentikan seluruh proses baca/tulis kasir di ratusan cabang selama migrasi berjalan!
  2. Selain itu, kode backend versi lama yang masih berjalan saat deployment bergilir (*rolling deploy*) akan error saat melakukan `INSERT` karena tidak menyertakan kolom baru tersebut.
- **Urutan Migrasi Aman (*Expand -> Migrate -> Contract*):**
  1. **Expand:** Tambahkan kolom baru sebagai **`NULL` atau dengan `DEFAULT` konstan yang ringan** (misal `ADD COLUMN order_channel_version VARCHAR(10) NOT NULL DEFAULT 'v1'`), dan buat tabel baru (`deliveries`, `customer_addresses`) tanpa menyentuh kolom eksisting.
  2. **Deploy Backend Backward-Compatible:** Deploy kode baru yang sudah menulis nilai `order_channel_version`, sambil tetap mengaktifkan fitur `CR-001` di balik **Feature Flag (`OFF`)**.
  3. **Backfill Bertahap (jika perlu nilai khusus):** Jalankan skrip pembaruan bertahap `5.000` baris per batch dengan jeda `100 ms` agar I/O database tetap sehat.
  4. **Aktifkan Pilot & Siapkan Rollback:** Nyalakan Feature Flag di 2 cabang pilot; jika terjadi *error 5xx > 1%* atau kegagalan webhook > 5% dalam 30 menit, **matikan Feature Flag** (rollback instan tanpa perlu `DROP COLUMN` atau `DROP TABLE`).

---

### Pembahasan Skenario 4: Debugging Konversi Waktu & Pembulatan `HALF_UP`

- **(a) Konversi Waktu `Asia/Jakarta` (`UTC+7`) -> UTC & Tanggal Bisnis `daily_reconciliations`:**
  1. **`2026-11-25 23:45:00 WIB` (`UTC+7`):**
     - Waktu UTC tersimpan di DB: `23:45 - 07:00` = **`2026-11-25T16:45:00Z`**.
     - Tanggal bisnis `daily_reconciliations` Jakarta: **`2026-11-25`** (karena masih sebelum `23:59:59 WIB`).
  2. **`2026-11-26 00:10:00 WIB` (`UTC+7`):**
     - Waktu UTC tersimpan di DB: `00:10 - 07:00` = **`2026-11-25T17:10:00Z`**. *(Perhatikan: di kalender UTC masih tanggal `25`, tetapi di Jakarta sudah lewat tengah malam tanggal `26`!)*
     - Tanggal bisnis `daily_reconciliations` Jakarta: **`2026-11-26`**.
- **(b) Kalkulasi Pajak `11%` & Pembulatan `HALF_UP` (`BIGINT` Rupiah):**
  - `subtotal` = `45.000`
  - `discount_amount` = `4.500`
  - Dasar pengenaan pajak (*net subtotal*) = `45.000 - 4.500 = 40.500`
  - `tax_amount` eksak = `40.500 × 11% = 4.455,0` -> karena bulat tepat, `tax_amount` = **`4.455`** (`BIGINT`).
  - *(Sebagai tambahan latihan konsep `HALF_UP`: jika misalnya dasar pengenaan pajak adalah `40.505`, maka `40.505 × 11% = 4.455,55`, dibulatkan `HALF_UP` menjadi `4.456`; sedangkan jika `40.495 × 11% = 4.454,45`, dibulatkan `HALF_UP` menjadi `4.454`.)*
  - Total akhir = `40.500 + 4.455 =` **`Rp 44.955`**.

---

## Bab 12 — Dokumentasi Standar Industri: BRD, SRS, & FSD

*(Tautan soal: [Bab 12 §7 Latihan Praktik](../materi/12-dokumentasi-brd-srs-fsd.md#7-latihan-praktik))*

### Pembahasan Skenario 1: Menyunting & Membersihkan Requirement Ambigu

- **Daftar Masalah & Kata Terlarang pada Draf `FR-X`:**
  1. **Tidak *Atomic*:** Menggabungkan pemesanan online (`FR-03`), pembayaran QRIS (`FR-04`), pembatalan (`FR-06`), dan refund (`FR-07`) dalam satu paragraf raksasa.
  2. **`"user-friendly"`:** Subjektif dan tidak dapat diuji (*non-verifiable*).
  3. **`"secara otomatis tanpa syarat"`:** Berbahaya! Konfirmasi pembayaran QRIS hanya boleh mengubah status ke `PAID` **dengan syarat** signature HMAC-SHA256 valid, `external_tx_id` belum pernah diproses, dan pesanan belum `EXPIRED`.
  4. **`"sangat cepat"`:** Tidak ada metrik angka (`NFR-01` mensyaratkan `p95 <= 500 ms` pada `150 RPS`).
  5. **`"dll"` & `"dengan mudah"`:** Terbuka pada tafsir tak terbatas (apakah penukaran barang atau pengembalian sebagian ikut masuk?).

- **Contoh Penulisan Ulang yang Benar (Disederhanakan ke Butir Atomik `FR-04` & `FR-07`):**
  - **`FR-04` (Pemrosesan Pembayaran Asinkron QRIS via Webhook):**
    *"Sistem **HARUS** menerima notifikasi pembayaran asinkron pada `POST /api/v1/webhooks/payments/qris` dari `Payment Gateway (QRIS/VA)`, memverifikasi tanda tangan `HMAC-SHA256` serta batas waktu `expires_at` (UTC), dan hanya mengubah status pesanan dari `PENDING_PAYMENT` menjadi `PAID` serta memotong `inventories.on_hand_qty` (`DEDUCT`) apabila transaksi belum pernah diproses sebelumnya (`idempotent` berdasarkan `external_tx_id`)."*
  - **`FR-07` (Pengajuan & Approval Void/Refund Pasca-Bayar):**
    *"Sistem **HARUS** menyediakan fungsi pengajuan void/refund pada `POST /api/v1/orders/{orderId}/refunds` khusus untuk pesanan berstatus `PAID`, `PREPARING`, `READY`, atau `COMPLETED`, yang hanya dapat dieksekusi menjadi `REFUNDED` setelah memperoleh persetujuan dan verifikasi PIN dari `Branch Manager` pada `store_id` yang sama."*
  - *(Target kecepatan dipisahkan ke **`NFR-01`** dengan angka terukur `p95 <= 500 ms` pada `150 RPS`.)*

---

### Pembahasan Skenario 2: Menentukan Dokumen yang Tepat (BRD vs SRS vs FSD)

| Kasus | Dokumen Tepat | Alasan Penentuan |
| :---: | :---: | :--- |
| **(a)** | **FSD** *(atau API Contract di dalamnya)* | Pertanyaan menyentuh nama field JSON persis (`promo_code`), tipe data, dan batas karakter input untuk implementasi kode oleh *Backend Engineer*. |
| **(b)** | **BRD** | Pertanyaan membahas justifikasi investasi bisnis, target KPI operasional (penurunan selisih kasir), dan batasan ruang lingkup bisnis Fase 1 untuk level eksekutif. |
| **(c)** | **SRS** | *Acceptance Criteria* Gherkin untuk `FR-06` dan metrik target `NFR-01` adalah kontrak perilaku formal sistem dan metrik pengujian yang hidup di dalam SRS (ISO/IEC/IEEE 29148). |
| **(d)** | **SRS** *(ditunjang FSD aturan kalkulasi)* | *Finance Lead* menandatangani baseline aturan fungsional/bisnis formal (pembulatan `HALF_UP` dan otorisasi `Branch Manager` pada `FR-07`/`FR-08`) di dokumen kontrak kebutuhan sistem (`SRS v1.0 Baselined`). |

---

### Pembahasan Skenario 3: Spesifikasi Lengkap `FR-06` (Standar ISO/IEC/IEEE 29148)

- **`FR-06`: Pembatalan Pra-Bayar & Pelepasan Otomatis Reservasi Kedaluwarsa (`EXPIRED`)**
- **Referensi Bisnis / Use Case:** `BR-01`, `UC-03`
- **Prioritas (MoSCoW):** Must Have
- **Aktor Terlibat:** `Customer`, `Cashier`, Sistem Scheduler (`ReleaseExpiredReservationsJob`)
- **Deskripsi Kebutuhan:**
  Sistem **HARUS** mengizinkan pembatalan manual menjadi `CANCELLED` pada pesanan yang masih berstatus `PENDING_PAYMENT`, serta mengeksekusi *batch job* otomatis setiap 1 menit untuk mengubah pesanan `PENDING_PAYMENT` yang telah melewati `expires_at` (`created_at + 15 menit` UTC) menjadi `EXPIRED`, sambil melepas seluruh `inventories.reserved_qty` secara atomik.
- **Aturan Bisnis (*Business Rules*):**
  1. `BR-06.1`: Pembatalan manual (`PATCH /api/v1/orders/{orderId}/status` -> `CANCELLED`) hanya sah dilakukan jika `orders.status = 'PENDING_PAYMENT'`. Jika pesanan sudah berstatus `PAID` atau setelahnya, sistem wajib menolak dengan `422 ERR_INVALID_STATE_TRANSITION` dan mengarahkan ke alur refund (`FR-07`).
  2. `BR-06.2`: Setiap pelepasan reservasi akibat `CANCELLED` maupun `EXPIRED` wajib mengurangi `inventories.reserved_qty` sebesar `order_items.qty` dan mencatat baris mutasi `RELEASE` pada `inventory_movements` di dalam satu transaksi database ACID.
  3. `BR-06.3`: Status `CANCELLED` dan `EXPIRED` bersifat final (*terminal*); tidak ada transisi lebih lanjut yang diizinkan dari kedua status tersebut.
- **Acceptance Criteria (Gherkin):**
  ```gherkin
  # Skenario 1: Pembatalan Manual Pra-Bayar
  Given pesanan ORD-010 berstatus PENDING_PAYMENT dengan reserved_qty VAR-001 sebanyak 2
  When Customer mengirim PATCH /api/v1/orders/ORD-010/status dengan status CANCELLED
  Then sistem mengembalikan HTTP 200 OK dengan status pesanan CANCELLED
  And reserved_qty pada inventories berkurang 2 dan tercatat mutasi RELEASE di inventory_movements

  # Skenario 2: Pelepasan Otomatis Kedaluwarsa TTL 15 Menit
  Given pesanan ORD-011 berstatus PENDING_PAYMENT memiliki expires_at = 2026-11-25T05:15:00Z
  When scheduler berjalan pada pukul 2026-11-25T05:15:05Z (melewati expires_at)
  Then sistem mengubah status ORD-011 menjadi EXPIRED dan melepas reserved_qty dengan mutasi RELEASE
  And jika Customer mencoba membatalkan manual setelahnya ke CANCELLED sistem menolak dengan 422 ERR_INVALID_STATE_TRANSITION
  ```

---

### Pembahasan Skenario 4: Audit RTM & Versioning Control Sebelum Sign-Off

- **(a) Tabel Tambahan di FSD Tanpa `FR` atau Referensi Kanonik:**
  Ini gejala **over-engineering / scope liar dari sisi teknis** (*gold plating*). SA wajib: (1) menginvestigasi dengan Tech Lead apakah tabel itu benar-benar dibutuhkan secara teknis (misal tabel teknis *idempotency_keys* internal) atau fitur tersembunyi tanpa izin bisnis; (2) jika itu fitur baru yang belum disetujui bisnis, hapus dari FSD Fase 1 atau ajukan ke *Product Manager* lewat mekanisme CR; jika memang murni infrastruktur pendukung `FR` yang ada, dokumentasikan keterkaitannya dengan jelas di bagian *Technical Design* FSD tanpa melanggar kontrak domain bisnis.
- **(b) Baris `FR-05` di RTM Belum Lengkap:**
  Dokumen **belum layak ditandatangani (`v1.0 Baselined`)** karena RTM belum utuh (*untraceable*). SA wajib melengkapi kolom *Endpoint API* dengan **`PATCH /api/v1/orders/{orderId}/status`** (beserta layar `SCR-KDS-001`), mencantumkan entitas **`orders`** dan **`audit_logs`**, serta menambahkan ID skenario uji **`UAT-04`** (atau ID skenario UAT dapur terkait) agar tim QA pasti mengujinya sebelum *Go-Live*.

---

## Bab 13 — UAT, Testing Collaboration, & Handover

*(Tautan soal: [Bab 13 §7 Latihan Praktik](../materi/13-uat-testing-handover.md#7-latihan-praktik))*

### Pembahasan Skenario 1: Perancangan Nilai Uji *Equivalence Partitioning* & *Boundary Value Analysis*

- **(a) Batas Waktu Reservasi Stok TTL 15 Menit (`expires_at = 2026-11-25T03:15:00Z`):**

| Teknik | Nilai Waktu Uji (UTC) | Kategori Partisi / Batas | Expected Result |
| :---: | :--- | :--- | :--- |
| **EP** | `03:05:00Z` | Partisi Valid (di dalam TTL 15 menit) | Webhook `SETTLED` diterima **`200 OK`**, status menjadi `PAID`, stok dipotong (`DEDUCT`). |
| **BVA** | `03:14:59Z` | Batas Atas Valid (1 detik sebelum kedaluwarsa) | Webhook `SETTLED` masih diterima **`200 OK`**, status menjadi `PAID`. |
| **BVA** | `03:15:00Z` | Tepat Titik Batas (`expires_at <= NOW()`) | Sesuai aturan scheduler `expires_at <= NOW()`, pesanan berhak ditransisikan menjadi `EXPIRED`. |
| **BVA** | `03:15:01Z` | 1 detik melewati batas TTL | Scheduler telah/wajib melepas stok (`EXPIRED`, `RELEASE`). Jika webhook tiba, wajib ditolak `410/409` **`ERR_RESERVATION_EXPIRED`** + flag rekonsiliasi *late payment*. |
| **EP** | `03:25:00Z` | Partisi Tidak Valid (jauh melewati batas) | Pesanan sudah `EXPIRED`; webhook ditolak **`ERR_RESERVATION_EXPIRED`**. |

- **(b) Validasi Panjang Catatan Tambahan Void/Refund (`FLD-R02`, Wajib 10–250 Karakter):**

| Teknik | Panjang Teks | Kategori | Expected Result |
| :---: | :---: | :--- | :--- |
| **EP** | `0` karakter (kosong) | Tidak Valid (Kosong) | Tombol submit *disabled* / error: `"Tuliskan penjelasan alasan minimal 10 karakter (maks. 250)."` |
| **BVA** | `9` karakter | Batas Bawah - 1 (Invalid) | Ditolak validasi UI & API (`400 Bad Request`). |
| **BVA** | `10` karakter | Batas Bawah Valid | Diterima sistem. |
| **EP** | `75` karakter | Partisi Valid Tengah | Diterima sistem dan tersimpan di `refunds.reason` / `audit_logs`. |
| **BVA** | `250` karakter | Batas Atas Valid | Diterima sistem tanpa terpotong. |
| **BVA** | `251` karakter | Batas Atas + 1 (Invalid) | Ditolak (input UI dibatasi / API mengembalikan `400 Bad Request`). |

---

### Pembahasan Skenario 2: Penulisan UAT Script (`UAT-07` & `UAT-08`)

| UAT ID | Ref FR / UC | Skenario Pengujian | Langkah Eksekusi (*Step-by-Step*) | Data Uji | Hasil yang Diharapkan (*Expected Result*) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `UAT-07` | `FR-06` / `UC-03` | Pembatalan manual pesanan `ONLINE_PICKUP` pra-bayar | 1. Login sebagai `cust_01`.<br>2. Checkout `VAR-001` qty `2` (stok awal `on_hand=10, reserved=0`) sehingga terbentuk order `PENDING_PAYMENT` (`reserved=2`).<br>3. Di `SCR-ORD-003`, klik **"Batalkan Pesanan"** dan konfirmasi. | `cust_01`, `VAR-001` (`STR-001`) | `PATCH /api/v1/orders/{orderId}/status` membalas `200 OK`; status pesanan menjadi `CANCELLED`; `inventories.reserved_qty` kembali ke `0` dan tabel `inventory_movements` mencatat 1 baris `RELEASE` sejumlah `2`. |
| `UAT-08` | `FR-07`, `NFR-03` / `UC-06` | Penolakan eksekusi refund langsung oleh `Cashier` tanpa approval `Branch Manager` | 1. Login sebagai `cashier_01` (`STR-001`).<br>2. Buka pesanan berstatus `PAID` di `SCR-REF-001`.<br>3. Pastikan tombol *"Setujui & Proses Refund"* tidak muncul di UI.<br>4. Uji via tool API/Postman dengan token `cashier_01` mengirim `POST /api/v1/orders/{orderId}/refunds` berisi `"action": "APPROVE"`. | `cashier_01`, order status `PAID` di `STR-001` | UI menyembunyikan panel approval (`CMP-R04`). Pemanggilan API langsung ditolak dengan `403 Forbidden` (`ERR_UNAUTHORIZED_APPROVAL`), status order tetap `PAID`, dan percobaan penolakan tercatat di `audit_logs`. |

---

### Pembahasan Skenario 3: Keputusan Defect Triage & Go/No-Go

| Temuan | Severity | Priority | Keputusan Rilis | Alasan Bisnis & Teknis |
| :---: | :---: | :---: | :---: | :--- |
| **Temuan A** (Selisih pembulatan Rp 1 karena *floor* vs `HALF_UP`) | **Critical** | **P1 (Urgent)** | **NO-GO (Tunda Rilis hingga Fix & Retest)** | Melanggar langsung aturan bisnis kanonik pembulatan `HALF_UP` dan `NFR-04` (**0 discrepancy**). Meskipun hanya Rp 1 per transaksi, dalam 10.000 transaksi per hari selisih ribuan Rupiah akan membuat `daily_reconciliations` gagal sinkron/ditolak oleh `Accounting/ERP`. |
| **Temuan B** (Perbedaan teks label *"Menunggu Pembayaran"* vs *"Selesaikan Pembayaran Anda"*) | **Minor** | **P4 (Low)** | **GO / Conditional Go** | Tidak mengganggu pemahaman pengguna, fungsi bisnis, maupun akurasi data. Dapat diperbaiki di rilis teks rutin berikutnya (*patch*). |
| **Temuan C** (Tidak ada *spinner* 1 detik saat klik *"Mulai Racik"*, namun status tetap sukses) | **Minor** | **P3 (Medium)** | **Conditional Go (dengan catatan Patch v1.0.1)** | Status akhir di database dan layar tetap akurat. Namun karena berpotensi memicu klik berulang pada jaringan lambat, berikan arahan sementara ke barista agar tidak menekan dua kali sambil dijadwalkan penambahan *loading state* pada *patch* minggu depan. |

---

### Pembahasan Skenario 4: Handover Runbook & Agenda Post-Implementation Review (PIR)

- **Jawaban SOP untuk Tim L1 Support (Handover Runbook):**
  1. **Keluhan Pesanan `EXPIRED` di Menit ke-16:** Support menjelaskan bahwa sistem mengunci reservasi stok tepat **15 menit** (`FR-06`) agar stok cabang tidak tertahan oleh keranjang yang ditinggalkan. Pelanggan cukup membuat pesanan ulang dari katalog (`SCR-ORD-001`). **Pengecualian:** jika pelanggan melampirkan bukti saldo e-wallet/bank sudah benar-benar terpotong pada detik kedaluwarsa, L1 Support mengecek flag *late payment* di dashboard admin/audit dan meneruskan tiket ke Finance untuk pengembalian dana manual/otomatis.
  2. **Keluhan Stok Fisik Tidak Cocok Karena `reserved_qty`:** Support menjelaskan bahwa stok tersedia adalah **`on_hand_qty - reserved_qty`**, sehingga stok di rak fisik yang masih dihitung sebagai `reserved_qty` sedang dipegang oleh pesanan `ONLINE_PICKUP` berstatus `PENDING_PAYMENT` yang belum kedaluwarsa (maks. 15 menit). Jika memang ada selisih fisik permanen setelah semua pesanan selesai, hanya `Branch Manager` yang berwenang melakukan penyesuaian (`ADJUSTMENT`) dan setiap koreksi tercatat di `audit_logs`.
- **3 Agenda Evaluasi untuk Rapat Post-Implementation Review (PIR):**
  1. **Evaluasi Kepatuhan NFR & KPI Bisnis:** Bandingkan performa produksi aktual (`p95 latency <= 500 ms`, `availability >= 99,5%`, jumlah `oversell = 0`, tingkat selisih rekonsiliasi ERP = `0`) terhadap target di BRD dan SRS.
  2. **Analisis Tren Tiket Support & Kebingungan UX:** Karena banyak pelanggan terlambat membayar di menit ke-16, evaluasi apakah timer hitung mundur `expires_at` (`Asia/Jakarta`) dan notifikasi pengingat di `SCR-ORD-003` sudah cukup menonjol, serta apakah kasir membutuhkan tampilan kolom `reserved_qty` yang lebih informatif di POS.
  3. **Tindak Lanjut Backlog & CR Fase 2:** Tutup daftar *Known Issues* dari Conditional Go (`v1.0.1`), lalu review kesiapan prioritas fase berikutnya (misal kajian `CR-001` dan mitigasi jaringan offline cabang).
