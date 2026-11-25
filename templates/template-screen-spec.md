# UI / Screen Specification & Field-Level Mapping

> **Petunjuk Penggunaan Template:** Jangan hanya menyerahkan desain visual (*mockup*) ke tim Frontend tanpa spesifikasi perilaku. Dokumen ini memastikan tim UI/UX, Frontend, Backend, dan QA sepakat mengenai **5 state layar**, aturan validasi setiap input, pesan error ramah manusia, serta **keterlacakan penuh dari kolom UI hingga kolom database**.

---

## 1. Identitas Layar (*Screen Identity*)

| Atribut | Detail |
| :--- | :--- |
| **Screen ID** | `[misal: SCR-POS-002]` |
| **Nama Layar** | `[misal: Layar Checkout & Konfirmasi Pembayaran]` |
| **Platform / Target** | `[Web Responsive / Tablet POS / Mobile App]` |
| **Peran yang Berhak Mengakses (*RBAC*)** | `[misal: Cashier (khusus cabang miliknya) atau Customer]` |
| **Referensi Use Case / FR** | `[misal: UC-02, UC-03 / FR-03, FR-04]` |
| **Tautan Desain Visual (Figma)** | `[URL atau placeholder referensi desain]` |

---

## 2. Alur Navigasi (*Entry & Exit Points*)

- **Titik Masuk (*Entry Points*):**
  - `[Dari SCR-POS-001 (Katalog & Keranjang) setelah tombol "Lanjut Pembayaran" diklik.]`
- **Titik Keluar (*Exit Points*):**
  - **Sukses Bayar:** `[Arahkan ke SCR-POS-003 (Struk / Status Pesanan Aktif).]`
  - **Klik Kembali / Ubah Item:** `[Kembali ke SCR-POS-001 dengan isi keranjang tetap dipertahankan.]`
  - **Kedaluwarsa (`EXPIRED`):** `[Tampilkan banner waktu habis dan tombol "Pesan Ulang".]`

---

## 3. Sketsa Wireframe & Daftar Komponen UI

`[Tempelkan gambar/ASCII wireframe sederhana di bawah ini agar struktur elemen jelas meski tanpa Figma.]`

```text
+-------------------------------------------------------+
| [< Kembali]   Checkout — Cabang Sudirman (WIB)        |
+-------------------------------------------------------+
| Daftar Pesanan:                                       |
|  - Kopi Susu Aren (Large) x2   Rp 56.000              |
|    Catatan: Less sugar                                |
| [Kode Promo: ____________] [Terapkan]                 |
+-------------------------------------------------------+
| Ringkasan: Subtotal Rp 56.000 | Diskon Rp 0 | Total   |
| Pilih Pembayaran: (o) QRIS  ( ) Tunai (POS only)      |
| [         Buat Pesanan & Bayar (Rp 56.000)          ] |
+-------------------------------------------------------+
```

| ID Komponen | Tipe Komponen | Perilaku / Aturan Tampilan |
| :--- | :--- | :--- |
| `CMP-01` | Header Cabang | Menampilkan nama cabang dan jam operasional dalam zona waktu cabang (`Asia/Jakarta`). |
| `CMP-02` | Input Kode Promo | Huruf otomatis kapital (`UPPERCASE`), tombol "Terapkan" nonaktif jika input kosong. |
| `CMP-03` | Selector Metode Bayar | Opsi `Tunai` hanya tampil jika aktor adalah `Cashier` di kanal `POS`; tersembunyi untuk `Customer` online. |
| `CMP-04` | Tombol Submit Order | Memiliki perlindungan *double-click* (disabled saat proses request berjalan). |

---

## 4. Spesifikasi 5 State Layar (*Screen States*)

Setiap layar wajib mendefinisikan kelima kondisi berikut agar tidak ada *blank screen* atau kebingungan pengguna:

| State Layar | Kondisi Pemicu | Tampilan & Perilaku UI | Aksi yang Tersedia |
| :--- | :--- | :--- | :--- |
| **1. Initial** | Layar baru dibuka dengan data valid dari keranjang. | Tampilkan ringkasan item, pilihan metode bayar default, dan total harga terhitung. | Ubah promo, pilih metode bayar, klik Submit. |
| **2. Loading** | Menunggu respons API `GET menu` atau `POST /api/v1/orders`. | Tampilkan *skeleton loader* / *spinner* pada tombol submit; seluruh tombol mutasi berstatus `disabled`. | Tidak ada (mencegah *double submit*). |
| **3. Empty** | Keranjang kosong (misal pengguna membuka URL checkout langsung). | Tampilkan ilustrasi/pesan *"Keranjang Anda masih kosong"* + CTA kembali ke katalog menu. | Klik `"Lihat Menu Cabang"`. |
| **4. Error** | API mengembalikan `4xx/5xx` (misal `ERR_INSUFFICIENT_STOCK` atau jaringan putus). | Tampilkan *inline alert* merah menyoroti item yang stoknya kurang atau banner *"Koneksi bermasalah"*. | Klik `"Sesuaikan Keranjang"` atau `"Coba Lagi"`. |
| **5. Partial / Disabled** | Sebagian item habis, atau cabang tutup, atau promo tidak memenuhi minimum belanja. | Tombol submit utama nonaktif (`disabled`) dengan teks penjelasan alasan langsung di bawah tombol; item habis ditandai abu-abu. | Hapus item yang habis atau ganti kode promo. |

---

## 5. Tabel Validasi Input per Field

| Field ID | Label UI | Tipe Input | Wajib? | Format / Batasan Nilai | Kapan Divalidasi | Pesan Error ke Pengguna |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `FLD-01` | Kode Promo | `Text` | Opsional | Alfanumerik, 4–20 karakter, tanpa spasi | `On Blur` & `On Click Terapkan` | `"Kode promo hanya boleh huruf/angka 4–20 karakter."` |
| `FLD-02` | Catatan Item | `Textarea` | Opsional | Maksimal 120 karakter, sanitasi XSS/HTML tag | `On Change` & `On Submit` | `"Catatan maksimal 120 karakter."` |
| `FLD-03` | Metode Bayar | `Radio` | Wajib | `QRIS`, `VA`, atau `CASH` (khusus POS) | `On Submit` | `"Silakan pilih metode pembayaran terlebih dahulu."` |
| `FLD-04` | Nominal Tunai Diterima | `Currency (IDR)` | Wajib jika `CASH` | Bilangan bulat `>= total_amount` | `On Change` & `On Submit` | `"Nominal tunai tidak boleh kurang dari total tagihan."` |

---

## 6. Matriks Traceability (`UI Field <-> Validation <-> API Field <-> DB Column`)

Bagian ini adalah jembatan emas antara Frontend, Backend, dan Database untuk mencegah ketidakcocokan nama field atau tipe data.

| UI Field (`Label`) | Aturan Validasi Ringkas | API Endpoint & JSON Path | Tipe API | Target Tabel & Kolom DB | Tipe DB & Transformasi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Cabang Terpilih` | Wajib cabang aktif (`is_active = true`) | `POST /api/v1/orders` -> `$.store_id` | `string` | `orders.store_id` | `VARCHAR/UUID` (FK ke `stores.id`) |
| `Catatan Item` | Opsional, maks 120 char, trim whitespace | `POST /api/v1/orders` -> `$.items[].notes` | `string \| null` | `order_items.notes` | `VARCHAR(120)` |
| `Kode Promo` | Opsional, uppercase, validasi kuota & tanggal | `POST /api/v1/orders` -> `$.promo_code` | `string \| null` | `orders.promotion_id` | Lookup ke `promotions.code` -> simpan FK `promotion_id` |
| `Total Tagihan` | Read-only di UI; **dihitung ulang di server** | Response -> `$.data.total_amount` | `integer` | `orders.total_amount` | `BIGINT` (Rupiah utuh, pembulatan `HALF_UP`) |
| `Batas Waktu Bayar` | Tampil countdown lokal cabang | Response -> `$.data.expires_at` | `ISO-8601 UTC` | `orders.expires_at` | `TIMESTAMPTZ` (UTC di DB -> konversi `Asia/Jakarta` di UI) |

---

## 7. Catatan Aksesibilitas, Responsivitas, & Edge Cases UI

- **Keamanan Frontend:** Jangan pernah mempercayai nilai harga/diskon yang dikirim dari client; UI hanya mengirim `variant_id`, `qty`, dan `promo_code`, sedangkan backend menghitung harga dari master/cabang.
- **Timezone:** Seluruh stempel waktu dari API berformat UTC (`Z`) dan diformat ke zona waktu cabang (`WIB/WITA/WIT`) sebelum ditampilkan.
- **Double-Submit Guard:** Klien menghasilkan `Idempotency-Key` (UUID v4) baru untuk setiap keranjang baru dan mempertahankannya jika pengguna menekan "Coba Lagi" akibat jaringan terputus.
