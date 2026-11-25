# Use Case Specification

> **Petunjuk Penggunaan Template:** Gunakan satu berkas atau satu bagian ini untuk setiap Use Case inti (`UC-XX`). Diagram Use Case (*oval dan garis*) hanya menunjukkan ruang lingkup; **Use Case Specification** inilah yang menjelaskan perilaku detail interaksi aktor dan sistem—termasuk cabang alternatif dan skenario kegagalan yang paling sering dilupakan pengembang.

---

## 1. Identitas & Metadata Use Case

| Atribut | Detail |
| :--- | :--- |
| **Use Case ID** | `[misal: UC-03]` |
| **Nama Use Case** | `[Gunakan frasa Kata Kerja + Objek, misal: Pemesanan Online Self-Pickup & Reservasi Stok]` |
| **Modul / Fitur** | `[misal: Order Management]` |
| **Referensi FR / BR** | `[misal: FR-03, FR-06, BR-01]` |
| **Prioritas** | `[Must Have / High]` |
| **Versi & Tanggal** | `[v1.0 — YYYY-MM-DD]` |

---

## 2. Aktor & Pemangku Kepentingan (*Actors & Stakeholders*)

- **Aktor Primer (*Primary Actor*):** `[Aktor yang memulai Use Case untuk mencapai suatu tujuan, misal: Customer]`
- **Aktor Sekunder (*Supporting Actors*):** `[Sistem eksternal atau aktor pendukung yang dimintai respons oleh sistem, misal: Payment Gateway (QRIS/VA), Notification Service]`
- **Stakeholders & Kepentingan:**
  - `[Pelanggan]`: `[Ingin memesan cepat tanpa kecewa stok habis di tengah jalan]`
  - `[Operasional Cabang]`: `[Ingin stok tidak tertahan selamanya oleh pesanan yang tidak dibayar]`

---

## 3. Kondisi Awal & Pemicu (*Preconditions & Trigger*)

- **Preconditions (*Prasyarat Sebelum Use Case Dimulai*):**
  1. `[Contoh: Pelanggan telah memilih cabang aktif (store_id) yang sedang berada dalam jam operasional.]`
  2. `[Contoh: Katalog menu dan stok cabang berhasil dimuat.]`
- **Trigger (*Pemicu Dimulainya Use Case*):**
  `[Aksi konkret yang memulai langkah pertama, misal: Customer menekan tombol "Checkout & Bayar" pada halaman keranjang belanja.]`

---

## 4. Alur Sukses Utama (*Main Success Scenario / Happy Path*)

Tuliskan interaksi bolak-balik antara **Aktor** dan **Sistem** secara berurutan dari langkah 1 hingga tujuan tercapai.

| Langkah | Aktor / Sistem | Deskripsi Aksi |
| :---: | :--- | :--- |
| `1` | **Aktor Primer** | `[Contoh: Customer memilih metode pembayaran (QRIS/VA), memasukkan kode promo opsional, lalu mengirim permintaan checkout.]` |
| `2` | **Sistem** | `[Contoh: Memvalidasi integritas input, keaktifan cabang, dan kelayakan promo (jika ada).]` |
| `3` | **Sistem** | `[Contoh: Membuka transaksi database dan mengunci baris stok per (store_id, variant_id), memverifikasi on_hand_qty - reserved_qty >= qty.]` |
| `4` | **Sistem** | `[Contoh: Menambah reserved_qty pada inventories, mencatat mutasi RESERVE di inventory_movements, menghitung subtotal/diskon/pajak, lalu menyimpan orders berstatus PENDING_PAYMENT dengan expires_at = NOW() + 15 menit.]` |
| `5` | **Sistem** | `[Contoh: Meminta pembuatan instruksi pembayaran dinamis ke Aktor Sekunder (Payment Gateway).]` |
| `6` | **Aktor Sekunder** | `[Contoh: Payment Gateway mengembalikan kode QRIS / nomor VA beserta referensi transaksi eksternal.]` |
| `7` | **Sistem** | `[Contoh: Menyimpan record awal pada payments dan menampilkan kode bayar beserta hitung mundur 15 menit kepada Customer.]` |

---

## 5. Alur Alternatif (*Alternative Flows*)

Cabang alur yang tetap merupakan perilaku bisnis yang **sah/wajar** (bukan error fatal). Gunakan nomor referensi langkah dari *Main Success Scenario* (misal `2a`, `4a`).

- **`1a.` Pelanggan tidak memasukkan kode promo:**
  1. `[Sistem melewati validasi promosi dan menetapkan nilai diskon = 0.]`
  2. `[Alur kembali ke langkah 3 pada Main Success Scenario.]`
- **`4a.` Pelanggan membatalkan pesanan secara manual sebelum membayar:**
  1. `[Pada langkah menunggu pembayaran, Customer menekan "Batalkan Pesanan".]`
  2. `[Sistem mengubah status pesanan menjadi CANCELLED, melepas reserved_qty, dan mencatat RELEASE pada inventory_movements.]`
  3. `[Use Case berakhir dengan kondisi batal.]`

---

## 6. Alur Pengecualian (*Exception Flows*)

Kondisi gagal teknis maupun pelanggaran aturan bisnis beserta cara sistem memulihkan diri (*recovery*) agar data tidak korup.

- **`E1` (pada Langkah 3) — Stok Cabang Tidak Mencukupi:**
  1. `[Sistem mendeteksi salah satu varian memiliki available stock < qty permintaan.]`
  2. `[Sistem melakukan ROLLBACK seluruh transaksi database (tidak ada stok yang tereservasi sebagian).]`
  3. `[Sistem mengembalikan error ERR_INSUFFICIENT_STOCK (HTTP 409) beserta daftar varian yang kurang.]`
  4. `[Use Case berakhir gagal; keranjang pelanggan tetap terjaga untuk disesuaikan.]`

- **`E2` (pada Langkah 5) — Payment Gateway Timeout atau Error `5xx`:**
  1. `[Sistem gagal menerima kode QRIS/VA setelah melewati batas timeout dan retry.]`
  2. `[Sistem membatalkan/melepas reservasi stok agar stok tidak terkunci sia-sia dan menandai transaksi gagal terbentuk.]`
  3. `[Sistem menampilkan pesan agar pelanggan mencoba ulang beberapa saat lagi.]`

- **`E3` (Pasca Langkah 7) — Batas Waktu Reservasi 15 Menit Terlampaui (`EXPIRED`):**
  1. `[Scheduler mendeteksi status masih PENDING_PAYMENT melewati expires_at.]`
  2. `[Sistem mengubah status order ke EXPIRED, melepas reserved_qty, dan mencatat RELEASE di inventory_movements.]`

---

## 7. Kondisi Akhir (*Postconditions*)

- **Success Postcondition (*Jika Alur Utama Berhasil*):**
  1. `[Pesanan tersimpan di tabel orders dengan status PENDING_PAYMENT dan snapshot harga di order_items.]`
  2. `[Stok di tabel inventories memiliki tambahan reserved_qty sebesar kuantitas pesanan dan tercatat di inventory_movements.]`
- **Minimal / Failure Guarantee (*Jika Gagal/Exception*):**
  1. `[Tidak ada pesanan menggantung atau reservasi stok yatim (orphan reservation); kondisi stok tetap konsisten (0% kebocoran).]`

---

## 8. Aturan Bisnis & Referensi Terkait (*Business Rules & Notes*)

- **Aturan Bisnis:**
  - `BR-01`: `[Reservasi stok wajib memakai penguncian baris (row-level locking) untuk mencegah overselling pada transaksi konkuren.]`
  - `BR-02`: `[TTL reservasi adalah 15 menit dalam UTC.]`
- **Referensi Layar UI:** `[Tautan ke Screen Spec terkait]`
- **Referensi NFR Khusus:** `[misal: NFR-01 latensi checkout <= 500 ms, NFR-02 zero oversell]`
