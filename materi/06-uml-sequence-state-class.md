# Bab 06 — UML Behavioral Part 2 & Structural: Sequence, State Machine, & Class Diagram

> **Ringkasan Posisi Bab:** Use Case Diagram dan Use Case Specification (Bab 05) menjelaskan *apa* yang dilakukan aktor dan sistem secara naratif. Namun untuk membangun perangkat lunak yang tahan terhadap *race condition*, pengiriman ulang *webhook*, dan transisi status ilegal, tim pengembang membutuhkan cetak biru yang jauh lebih presisi. Bab ini membekali Anda tiga diagram pengunci arsitektur: **Sequence Diagram** (dimensi waktu & pesan API/DB), **State Machine Diagram** (siklus hidup 8 status order Fase 1), dan **Domain Class Diagram** (struktur objek domain sebelum menjadi tabel SQL).

---

## 1. Tujuan Belajar & Posisi di Alur Kerja SA

Setelah mempelajari bab ini, Anda diharapkan mampu:

1. Membaca dan merancang **Sequence Diagram** yang membedakan panggilan sinkron, panggilan asinkron/*webhook*, serta blok percabangan (`alt`/`else`), kondisi opsional (`opt`), dan pengulangan (`loop`).
2. Memodelkan mekanisme keandalan sistem nyata seperti *row-level locking*, *idempotency check*, dan penanganan *timeout* di dalam Sequence Diagram.
3. Membangun **State Machine Diagram (`stateDiagram-v2`)** yang mengunci **seluruh transisi status yang sah**, kondisi penjaga (*guard*), serta penolakan transisi ilegal (`ERR_INVALID_STATE_TRANSITION`).
4. Menyusun **Domain Class Diagram (`classDiagram`)** beserta atribut kunci, method konseptual, *multiplicity*, dan relasi komposisi/asosiasi sebagai jembatan langsung menuju *Entity Relationship Diagram (ERD)* pada Bab 08.

Dalam alur kerja SA, **Bab 06 adalah fase verifikasi logika teknis sebelum UI dan basis data dikunci**. Kesalahan di tingkat Sequence atau State Machine hampir selalu muncul sebagai *bug* paling mahal di produksi—seperti stok terpotong dua kali akibat *webhook* ganda atau pesanan yang sudah kedaluwarsa (`EXPIRED`) tiba-tiba berubah menjadi `PAID`.

---

## 2. Konsep Inti & Mental Model

### 2.1 Trio Pengunci Arsitektur: Waktu, Status, dan Struktur

Bayangkan sebuah bandara internasional:
- **Sequence Diagram** adalah **rekaman percakapan menara kontrol (*ATC*) dengan pilot detik demi detik**: siapa mengirim sinyal ke siapa, kapan menunggu balasan (*sync*), dan kapan cukup melepas pesan tanpa menahan jalur (*async*).
- **State Machine Diagram** adalah **papan aturan status penerbangan**: pesawat tidak boleh melompat dari *Scheduled* langsung ke *Landed* tanpa melewati *Boarding* dan *In-Flight*; begitu pula pesanan yang sudah *Cancelled* tidak boleh tiba-tiba berubah menjadi *Preparing*.
- **Domain Class Diagram** adalah **cetak biru komponen utama** (Pesawat, Tiket, Penumpang, Gerbang) beserta sifat dan aturan kepemilikannya (*satu pesanan memiliki satu atau banyak item pesanan*).

### 2.2 Sequence Diagram: Mengawal Dimensi Waktu & Interaksi Antar-Lapisan

Sequence Diagram dibaca **dari kiri ke kanan** (daftar komponen/aktor) dan **dari atas ke bawah** (urutan waktu). Elemen intinya meliputi:

1. **Lifeline & Activation Box:** Garis putus-putus vertikal menunjukkan rentang hidup objek/layanan, sedangkan kotak tipis di atasnya (`activate`/`deactivate`) menunjukkan kapan layanan tersebut sedang sibuk bekerja memproses pesan.
2. **Jenis Pesan:**
   - **Synchronous Call (`->>`):** Pengirim mengirim permintaan dan *menunggu* hingga penerima selesai memproses atau mengembalikan jawaban (contoh: UI memanggil `POST /api/v1/orders`).
   - **Return / Asynchronous Response (`-->>`):** Pengembalian hasil ke pemanggil atau pemberitahuan balik (contoh: respons JSON `201 Created`, atau *callback/webhook* terpisah dari `Payment Gateway (QRIS/VA)`).
3. **Combined Fragments (Blok Logika):**
   - **`alt` / `else`:** Percabangan eksklusif (if/else), misal stok cukup vs tidak cukup, atau *idempotency_key* sudah ada vs belum ada.
   - **`opt`:** Blok opsional (if tanpa else), misal hanya dijalankan jika pelanggan mengisi kode promo.
   - **`loop`:** Pengulangan, misal iterasi mengunci dan memvalidasi setiap item di keranjang belanja.

### 2.3 State Machine Diagram: Penjaga Integritas Siklus Hidup Entitas

Tidak semua tabel membutuhkan State Machine. Tabel referensi statis seperti `stores` atau `products` cukup memakai flag `is_active`. Sebaliknya, entitas transaksional yang melewati banyak aktor dan sistem eksternal—seperti **`orders`**, **`payments`**, dan **`refunds`**—**wajib** memiliki State Machine Diagram.

Format standar penulisan label pada panah transisi State Machine adalah:
`Event Trigger [Guard Condition] / Action`
- **Event Trigger:** Kejadian pemicu (misal *Webhook `PAID` diterima*).
- **[Guard Condition]:** Syarat yang harus bernilai benar saat kejadian berlangsung (misal `[status == PENDING_PAYMENT && now <= expires_at]`).
- **/ Action:** Efek samping yang langsung dijalankan sistem saat transisi terjadi (misal `/ deduct stock & log DEDUCT`).

### 2.4 Domain Class Diagram: Jembatan Pemodelan Objek ke Database

Domain Class Diagram memodelkan benda nyata di domain bisnis sebagai **Class** yang memiliki **Atribut** (data yang disimpan) dan **Operations/Methods** (perilaku atau tanggung jawab bisnisnya), lalu menghubungkannya lewat relasi:
- **Association (`-->` / `--`):** Hubungan umum antar-kelas (misal `Order` merujuk ke `Store`).
- **Composition (`*--`):** Kepemilikan kuat (*whole-part*). Jika induk dihancurkan, bagiannya tidak bermakna berdiri sendiri (contoh: `Order "1" *-- "1..*" OrderItem` — item pesanan tidak mungkin hidup tanpa header pesanan).
- **Aggregation (`o--`):** Kumpulan longgar; anggota tetap bisa hidup meski wadahnya dihapus (contoh: `Store "1" o-- "0..*" User` — akun staf tetap ada sebagai entitas meski dipindah cabang).

---

## 3. Standar Industri & Aturan Praktis

### 3.1 Konvensi Mermaid untuk Sequence, State Machine, dan Class Diagram

| Jenis Diagram | Deklarasi Mermaid | Praktik Penulisan Aman |
| :--- | :--- | :--- |
| **Sequence Diagram** | `sequenceDiagram` | Gunakan `autonumber` agar langkah mudah dirujuk saat review; deklarasikan `participant` dengan alias pendek lalu nama lengkap dalam tanda kutip (`participant PG as "Payment Gateway (QRIS/VA)"`). |
| **State Machine** | `stateDiagram-v2` | Gunakan `[*]` untuk *Initial State* dan *Final Terminal State*. Jangan mencampur simbol ilegal di nama state—pakai persis nama status kanonik (`PENDING_PAYMENT`, `PAID`, dst.). |
| **Class Diagram** | `classDiagram` | Definisikan atribut beserta visibilitas (`+` public / `-` private) dan tipe kanonik (`BIGINT`, `TIMESTAMPTZ`), serta tulis *multiplicity* eksplisit di kedua ujung garis (`"1"`, `"0..*"`, `"1..*"`). |

### 3.2 Aturan Emas Pencegahan Bug Konkurensi & State

1. **Sequence Harus Memperlihatkan Batas Transaksi & Idempotency:** Jangan menyembunyikan baris `BEGIN TX / Row Lock` atau pemeriksaan `idempotency_key` di balik kotak umum *"Proses Pembayaran"*. Justru bagian itulah yang mencegah dua kasir atau dua *webhook* memotong stok yang sama.
2. **State Machine Wajib Tertutup & Lengkap:** Untuk setiap status non-terminal, SA wajib dapat menjawab: *"Apa yang terjadi jika event yang tidak seharusnya datang di status ini?"* Jawabannya adalah **penolakan eksplisit (`ERR_INVALID_STATE_TRANSITION` / HTTP `422`)**, bukan membiarkan *developer* menimpa kolom `orders.status` secara membabi-buta.
3. **Konsistensi Mutlak 8 Status Fase 1:** Seluruh dokumentasi Fase 1 **dilarang** mencantumkan status pengiriman kurir (`OUT_FOR_DELIVERY` dan `DELIVERED`) di dalam State Machine Fase 1, karena kedua status tersebut adalah ruang lingkup *Change Request* Fase 2 pada Bab 11.

---

## 4. Praktik Studi Kasus *NusaPOS & OrderHub*

### 4.1 Sequence Diagram: Checkout Online Self-Pickup (`UC-03`) & Webhook QRIS Idempoten (`UC-04`)

Diagram di bawah menggambarkan dua fase waktu nyata: **(1) Pembuatan pesanan & reservasi stok 15 menit (`POST /api/v1/orders`)**, dan **(2) Kedatangan *signed webhook* asinkron dari `Payment Gateway (QRIS/VA)` (`POST /api/v1/webhooks/payments/qris`)** lengkap dengan perlindungan duplikat (*idempotency*) dan pencegahan kondisi balapan terhadap status `EXPIRED`.

```mermaid
sequenceDiagram
    autonumber
    participant C as "Customer"
    participant UI as "OrderHub Web/App"
    participant API as "Order & Payment Service"
    participant DB as "PostgreSQL DB"
    participant PG as "Payment Gateway (QRIS/VA)"
    participant NS as "Notification Service"

    Note over C,PG: Fase A — Checkout Online Self-Pickup (UC-03)
    C->>UI: Klik "Buat Pesanan & Bayar" (QRIS)
    UI->>API: POST /api/v1/orders (Idempotency-Key, store_id, items, promo_code)
    activate API

    opt promo_code diisi
        API->>DB: Validasi promotions (aktif UTC, kuota, min_spend)
        DB-->>API: Data promo valid / null
    end

    API->>DB: BEGIN TX & SELECT inventories FOR UPDATE (per store_id + variant_id)
    alt Stok Tersedia (on_hand_qty - reserved_qty >= qty)
        API->>DB: Update reserved_qty (+qty), Insert inventory_movements (RESERVE)
        API->>DB: Insert orders (PENDING_PAYMENT, expires_at=+15m UTC) & order_items (snapshot harga)
        API->>PG: Request Dynamic QRIS (order_id, total_amount BIGINT, expires_at)
        alt Gateway Sukses
            PG-->>API: 200 OK (qris_payload, external_tx_id)
            API->>DB: Insert payments (PENDING, idempotency_key, external_tx_id) & COMMIT
            API-->>UI: 201 Created (kode QRIS + expires_at UTC)
            UI-->>C: Tampilkan QRIS & hitung mundur (Asia/Jakarta)
        else Gateway Timeout / 5xx
            PG-->>API: Timeout / Error 502
            API->>DB: ROLLBACK TX (reservasi stok otomatis batal)
            API-->>UI: 503 Service Unavailable (pesan coba ulang)
            UI-->>C: Tampilkan banner gagal sementara
        end
    else Stok Tidak Cukup
        DB-->>API: available_qty < requested_qty
        API->>DB: ROLLBACK TX
        API-->>UI: 409 Conflict (ERR_INSUFFICIENT_STOCK)
        UI-->>C: Sorot item habis/kurang di keranjang
    end
    deactivate API

    Note over PG,NS: Fase B — Konfirmasi Webhook Asinkron Idempoten (UC-04)
    PG->>API: POST /api/v1/webhooks/payments/qris (HMAC Signature, external_tx_id, status=PAID)
    activate API
    API->>API: Verifikasi HMAC Signature

    alt Signature Tidak Valid
        API-->>PG: 401 Unauthorized / 403 Forbidden + Catat audit_logs
    else Signature Valid
        API->>DB: Cek payments berdasar external_tx_id / idempotency_key
        alt Sudah Pernah Diproses Sukses (Webhook Duplikat)
            API-->>PG: 200 OK (Idempotent Ack — tidak potong stok ulang)
        else Belum Diproses
            API->>DB: BEGIN TX & SELECT orders FOR UPDATE
            alt orders.status == PENDING_PAYMENT & now <= expires_at
                API->>DB: Update payments (PAID, paid_at UTC) & orders.status = PAID
                API->>DB: Update inventories (on_hand_qty -= qty, reserved_qty -= qty) + Insert DEDUCT
                API->>DB: COMMIT TX
                API-->>NS: Async Trigger (Kirim bukti bayar & info antrean ke Customer)
                API-->>PG: 200 OK (Processed)
            else orders.status == EXPIRED atau CANCELLED
                API->>DB: ROLLBACK & Catat Flag Rekonsiliasi (late payment)
                API-->>PG: 422 / 409 (ERR_INVALID_STATE_TRANSITION / ERR_RESERVATION_EXPIRED)
            end
        end
    end
    deactivate API
```

**Mengapa Detail Ini Krusial:**
- Perhatikan pada langkah `5` (`SELECT inventories FOR UPDATE`) dan `26` (`SELECT orders FOR UPDATE`): penguncian baris mencegah dua *request* bersamaan membaca `available_stock = 1` secara paralel.
- Perhatikan pada langkah `24–25`: jika jaringan membuat `Payment Gateway (QRIS/VA)` mengirim webhook yang sama 3 kali, sistem memeriksa `external_tx_id` / `idempotency_key` (langkah `24`), memproses satu kali saja, dan membalas `200 OK` *idempotent acknowledgement* pada kiriman ke-2 dan ke-3 (langkah `25`, sesuai `NFR-02` dan `README.md §7B`).
- Perhatikan pada langkah `32–33`: jika pelanggan membayar di detik ke-15:05 setelah *scheduler* menandai order menjadi `EXPIRED`, sistem **tidak boleh** memaksakan status menjadi `PAID` (karena stok sudah dilepas ke pelanggan lain), melainkan melakukan *rollback*, mencatat flag rekonsiliasi (langkah `32`), dan menolak transisi dengan `ERR_INVALID_STATE_TRANSITION` / `ERR_RESERVATION_EXPIRED` (langkah `33`).

---

### 4.2 State Machine Diagram (`stateDiagram-v2`): 8 Status Order Fase 1

Sesuai [`../README.md`](../README.md), siklus hidup `orders.status` pada Fase 1 dikunci ketat pada **tepat 8 status kanonik**: `PENDING_PAYMENT`, `PAID`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`, `EXPIRED`, dan `REFUNDED`.

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT : Buat Order (POS / Online Pickup) / RESERVE stok

    PENDING_PAYMENT --> PAID : Pembayaran Tunai atau Webhook QRIS valid [<= expires_at] / DEDUCT stok
    PENDING_PAYMENT --> CANCELLED : Dibatalkan Customer/Cashier / RELEASE stok
    PENDING_PAYMENT --> EXPIRED : Scheduler TTL 15 menit terlampaui / RELEASE stok

    PAID --> PREPARING : Kitchen/Barista mulai meracik
    PAID --> REFUNDED : Void/Refund disetujui Branch Manager / audit_logs

    PREPARING --> READY : Kitchen/Barista selesai menyiapkan
    PREPARING --> REFUNDED : Void/Refund disetujui Branch Manager / audit_logs

    READY --> COMPLETED : Pesanan diserahkan ke Customer (atau verifikasi Cashier)
    READY --> REFUNDED : Void/Refund disetujui Branch Manager / audit_logs

    COMPLETED --> REFUNDED : Komplain disetujui Branch Manager / audit_logs
    COMPLETED --> [*] : Selesai normal tanpa refund

    CANCELLED --> [*]
    EXPIRED --> [*]
    REFUNDED --> [*]
```

#### Matriks Validasi Transisi & Penolakan Transisi Ilegal

Untuk memastikan tim *Backend* dan *QA* memiliki panduan uji yang tidak ambigu, lengkapi *State Machine Diagram* dengan tabel penolakan transisi ilegal berikut:

| Upaya Transisi Ilegal | Skenario Pemicu di Dunia Nyata | Respons Sistem Wajib |
| :--- | :--- | :--- |
| `EXPIRED -> PAID` | Pelanggan mengirim transfer tepat setelah batas 15 menit habis dan scheduler sudah melepaskan reservasi stok. | Tolak transisi dengan **`ERR_RESERVATION_EXPIRED`** (`410 Gone` / `409 Conflict`) atau **`ERR_INVALID_STATE_TRANSITION`** (`422`); catat ke antrean rekonsiliasi dana. |
| `CANCELLED -> PAID` | Webhook terlambat masuk untuk pesanan yang sudah dibatalkan manual oleh kasir/pelanggan. | Tolak dengan **`ERR_INVALID_STATE_TRANSITION`** (`422`) + flag rekonsiliasi. |
| `PENDING_PAYMENT -> PREPARING` | `Kitchen/Barista` mencoba memproses pesanan yang belum lunas. | Tolak dengan **`ERR_INVALID_STATE_TRANSITION`** (`422`); antrean dapur hanya boleh menampilkan status `PAID`. |
| `PENDING_PAYMENT -> REFUNDED` | `Cashier` mencoba mengajukan refund pada order yang belum dibayar. | Tolak dengan **`ERR_INVALID_STATE_TRANSITION`** (`422`); seharusnya gunakan pembatalan pra-bayar (`CANCELLED`). |
| `COMPLETED -> PREPARING` | Staf menekan ulang status kembali ke dapur setelah pesanan selesai diserahkan. | Tolak dengan **`ERR_INVALID_STATE_TRANSITION`** (`422`). |
| `REFUNDED -> *` | Upaya apa pun mengubah pesanan yang sudah berstatus terminal `REFUNDED`. | Tolak dengan **`ERR_INVALID_STATE_TRANSITION`** (`422`). |

---

### 4.3 Domain Class Diagram (`classDiagram`): Model Objek Inti NusaPOS & OrderHub

Domain Class Diagram berikut memetakan seluruh **14 entitas inti kanonik** beserta atribut kunci, method bisnis konseptual, dan kardinalitasnya sebelum diterjemahkan ke skema tabel fisik di Bab 08.

```mermaid
classDiagram
    class Store {
        +UUID id
        +String code
        +String name
        +String timezone
        +Boolean is_active
        +isOpenAt(utcTime) Boolean
    }

    class Role {
        +UUID id
        +String name
        +JSON permissions
        +hasPermission(action) Boolean
    }

    class User {
        +UUID id
        +UUID default_store_id
        +UUID role_id
        +String full_name
        +Boolean is_active
        +belongsToStore(storeId) Boolean
    }

    class Product {
        +UUID id
        +String name
        +String category
        +Boolean is_active
    }

    class ProductVariant {
        +UUID id
        +UUID product_id
        +String sku
        +String variant_name
        +BIGINT base_price
        +Boolean is_active
    }

    class Inventory {
        +UUID id
        +UUID store_id
        +UUID variant_id
        +INT on_hand_qty
        +INT reserved_qty
        +availableQty() INT
        +reserve(qty) void
        +release(qty) void
        +deduct(qty) void
    }

    class InventoryMovement {
        +UUID id
        +UUID store_id
        +UUID variant_id
        +UUID order_id
        +String movement_type
        +INT qty_delta
        +TIMESTAMPTZ created_at
    }

    class Promotion {
        +UUID id
        +String code
        +String discount_type
        +BIGINT discount_value
        +BIGINT min_spend
        +INT quota_remaining
        +calculateDiscount(subtotal) BIGINT
    }

    class Order {
        +UUID id
        +UUID store_id
        +UUID customer_id
        +UUID cashier_id
        +UUID promotion_id
        +String channel
        +String status
        +BIGINT subtotal_amount
        +BIGINT discount_amount
        +BIGINT tax_amount
        +BIGINT total_amount
        +TIMESTAMPTZ expires_at
        +transitionTo(nextStatus) void
    }

    class OrderItem {
        +UUID id
        +UUID order_id
        +UUID variant_id
        +String product_name_snapshot
        +String variant_name_snapshot
        +BIGINT unit_price_snapshot
        +INT qty
        +String notes
    }

    class Payment {
        +UUID id
        +UUID order_id
        +String method
        +BIGINT amount
        +String idempotency_key
        +String external_tx_id
        +String status
        +TIMESTAMPTZ paid_at
        +markPaid(txId) void
    }

    class Refund {
        +UUID id
        +UUID order_id
        +UUID requested_by
        +UUID approved_by
        +BIGINT refund_amount
        +String status
        +String reason
        +approve(managerId) void
        +reject(managerId) void
    }

    class AuditLog {
        +UUID id
        +UUID actor_id
        +String action
        +String entity
        +UUID entity_id
        +JSON before_value
        +JSON after_value
        +TIMESTAMPTZ created_at
    }

    class DailyReconciliation {
        +UUID id
        +UUID store_id
        +DATE business_date
        +BIGINT total_pos_amount
        +BIGINT total_online_amount
        +BIGINT total_refund_amount
        +BIGINT variance_amount
        +UUID signed_by
        +String erp_sync_status
        +finalize(managerId) void
    }

    Role "1" <-- "0..*" User : memiliki
    Store "1" o-- "0..*" User : menugaskan
    Product "1" *-- "1..*" ProductVariant : memiliki varian
    Store "1" -- "0..*" Inventory : menyimpan stok
    ProductVariant "1" -- "0..*" Inventory : dihitung di
    Inventory "1" -- "0..*" InventoryMovement : mencatat mutasi
    Store "1" -- "0..*" Order : melayani
    Promotion "0..1" <-- "0..*" Order : diterapkan pada
    Order "1" *-- "1..*" OrderItem : berisi item
    ProductVariant "1" <-- "0..*" OrderItem : direferensikan
    Order "1" *-- "0..*" Payment : dibayar melalui
    Order "1" *-- "0..*" Refund : diajukan refund
    User "1" -- "0..*" AuditLog : memicu jejak
    Store "1" -- "0..*" DailyReconciliation : menutup buku
```

Perhatikan bagaimana relasi **`*--` (*Composition*)** digunakan pada `Order *-- OrderItem` dan `Product *-- ProductVariant`, sementara seluruh nama kolom dan entitas selaras tepat dengan [`../README.md`](../README.md) (misalnya `Order.store_id`, bukan `branch_id`).

---

## 5. Jebakan Umum (*Anti-Patterns*) Junior SA

1. **Sequence Diagram Tanpa Blok `alt` untuk Error & Timeout:** Sequence yang hanya menggambar skenario mulus (*happy path*) seolah `Payment Gateway (QRIS/VA)` selalu membalas 0,1 detik dan stok selalu cukup adalah bom waktu. Pastikan selalu memodelkan jalur gagal dan *rollback*.
2. **Meninggalkan Status Tanpa Transisi Keluar yang Jelas pada State Diagram:** Jika status `PENDING_PAYMENT` hanya memiliki panah ke `PAID` dan lupa panah ke `CANCELLED` dan `EXPIRED`, stok yang tereservasi akan terkunci permanen (*orphan reservation*) setiap kali pelanggan menutup halaman pembayaran.
3. **Menambahkan Status di Luar Ruang Lingkup (*Scope Creep*) ke State Machine:** Memasukkan `OUT_FOR_DELIVERY` ke dalam State Diagram Fase 1 padahal fitur kurir 3PL belum dikerjakan membuat *Backend* menanyakan tabel pengiriman yang belum ada di skema database.
4. **Melupakan *Snapshot* di Class `OrderItem`:** Jika `OrderItem` hanya menyimpan `variant_id` tanpa `unit_price_snapshot` dan `product_name_snapshot`, ketika `HQ Admin` menaikkan harga kopi bulan depan, laporan nota lama ikut berubah angka.

---

## 6. Checklist Verifikasi Mandiri

Pastikan setiap butir di bawah ini terjawab **"Ya"** sebelum melangkah ke Bab 07:

- [ ] Sequence Diagram yang saya buat menggunakan blok `alt`/`opt` untuk menangani *idempotency*, kegagalan jaringan/gateway, dan kekurangan stok.
- [ ] `stateDiagram-v2` saya memetakan tepat 8 status kanonik Fase 1 tanpa ada transisi buntu, lengkap dengan daftar penolakan transisi ilegal (`ERR_INVALID_STATE_TRANSITION`).
- [ ] Domain Class Diagram saya mencantumkan seluruh 14 entitas inti beserta *multiplicity* yang benar serta membedakan *Composition* dan *Association*.
- [ ] Tidak ada istilah kolom melenceng (tetap menggunakan `orders.store_id`, uang dalam `BIGINT`, dan timestamp UTC).

---

## 7. Latihan Praktik

Kerjakan keempat skenario berikut terlebih dahulu, lalu periksa pembahasan lengkapnya di [`../kunci-latihan/kunci-bab-05-08.md`](../kunci-latihan/kunci-bab-05-08.md).

1. **Skenario 1 (Investigasi Celah *Sequence Diagram*):** Seorang Junior SA membuat Sequence Diagram untuk *webhook* `POST /api/v1/webhooks/payments/qris` dengan urutan:
   - `Payment Gateway` mengirim webhook -> `API` langsung menjalankan `UPDATE orders SET status = 'PAID'` -> `API` mengurangi `on_hand_qty` -> `API` membalas `200 OK`.
   Temukan **4 celah keamanan/integritas data kritis** pada Sequence tersebut dan perbaiki urutannya sesuai aturan kanonik (`NFR-02`, `NFR-03`, `README.md`).
2. **Skenario 2 (Audit & Penambahan *State Machine* untuk Entitas `refunds`):** Pada [`../README.md`](../README.md), entitas `refunds` memiliki 4 status kanonik: `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, dan `COMPLETED`. Buatlah **`stateDiagram-v2`** untuk siklus hidup entitas `refunds` lengkap dengan *trigger*, *guard* otorisasi `Branch Manager`, jalur alternatif metode `CASH` vs `QRIS/VA`, serta kondisi penolakan jika `Cashier` mencoba menyetujui pengajuannya sendiri (`ERR_UNAUTHORIZED_APPROVAL`).
3. **Skenario 3 (Uji Ketahanan Transisi Status Order):** Tentukan apakah keenam transisi berikut **SAH** atau **ILEGAL** pada Fase 1 *NusaPOS & OrderHub*, dan tuliskan *HTTP Status* + *Kode Error Kanonik* jika ilegal:
   - (a) `PENDING_PAYMENT` -> `EXPIRED`
   - (b) `EXPIRED` -> `PENDING_PAYMENT` (pelanggan minta perpanjang timer di order yang sama)
   - (c) `READY` -> `REFUNDED`
   - (d) `COMPLETED` -> `REFUNDED`
   - (e) `PAID` -> `COMPLETED` (kasir langsung klik selesai tanpa melalui `PREPARING` dan `READY`)
   - (f) `READY` -> `OUT_FOR_DELIVERY`
4. **Skenario 4 (Relasi & Multiplicity Domain Class Diagram):** Tentukan jenis relasi (`Composition *--`, `Aggregation o--`, atau `Association -->`) dan *multiplicity* yang paling tepat antara pasangan kelas berikut beserta alasannya:
   - (a) `Order` dengan `OrderItem`
   - (b) `Product` dengan `ProductVariant`
   - (c) `Order` dengan `Promotion`
   - (d) `Order` dengan `Payment` (mengapa `0..*` atau `1..*`, bukan mutlak `1`?)

---

**Langkah Berikutnya:** Setelah mengunci interaksi API, siklus hidup status, dan model objek domain, lanjutkan ke [**Bab 07 — UI/Screen Specification & Field-Level Mapping**](07-ui-screen-spec-field-mapping.md) untuk menghubungkan spesifikasi layar UI hingga ke kolom JSON API dan kolom database.
