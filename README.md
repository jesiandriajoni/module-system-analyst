# Modul Belajar System Analyst: Dari Dasar IT hingga Siap Kerja (Junior–Mid)

Selamat datang di **Modul Belajar System Analyst**. Kurikulum ini dirancang khusus untuk Anda yang sudah memahami dasar teknologi informasi dan alur aplikasi secara umum (web/mobile, database relasional dasar, dan konsep *client-server*), lalu ingin membangun fondasi metodologi, pemodelan, dokumentasi teknis, serta pola pikir analitis yang siap dipakai di dunia kerja sebagai **Junior hingga Mid-level System Analyst (SA)**.

Berbeda dari catatan teori yang terpotong-potong, seluruh modul ini mengikat teori ke dalam **satu studi kasus bisnis terpadu (*end-to-end*)** bernama **NusaPOS & OrderHub**. Dengan begitu, Anda tidak hanya mengerti cara menggambar diagram atau menulis spesifikasi, tetapi juga melihat langsung bagaimana keputusan di level bisnis (*BRD*) mengalir ke kebutuhan sistem (*SRS*), rancangan teknis (*FSD/API/ERD*), hingga skenario pengujian penerimaan pengguna (*UAT*).

---

## Cara Menggunakan Modul Ini

Agar proses belajar Anda terarah dan membentuk kebiasaan kerja seorang SA profesional, ikuti alur belajar berikut:

1. **Baca secara berurutan dari Bab 01 hingga Bab 14.** Bab awal membangun *mental model* dan cara komunikasi dengan *stakeholder* (pemangku kepentingan), bab tengah melatih pemodelan proses, perilaku, data, UI, dan API, sedangkan bab akhir membahas keandalan sistem, *Change Request*, dokumentasi resmi, UAT, dan proyek *capstone*.
2. **Jangan langsung menyalin artefak jadi.** Di akhir setiap bab (Bab 01–13), kerjakan terlebih dahulu soal pada bagian **Latihan Praktik** menggunakan file di folder [`templates/`](templates/template-brd.md). Setelah selesai mencoba, barulah bandingkan jawaban dan alasan desain Anda dengan pembahasan di folder [`kunci-latihan/`](kunci-latihan/kunci-bab-01-04.md).
3. **Gunakan `studi-kasus/` sebagai tolok ukur (*benchmark*).** Folder [`studi-kasus/`](studi-kasus/01-brd-nusapos.md) berisi contoh artefak nyata *NusaPOS & OrderHub* yang saling terhubung. Perhatikan bagaimana satu ID requirement (`FR-03`, `UC-03`, dst.) muncul konsisten dari dokumen bisnis sampai skrip pengujian.
4. **Kompatibilitas Diagram:** Seluruh diagram pada modul ini ditulis menggunakan sintaks **Mermaid** inti (`flowchart`, `sequenceDiagram`, `erDiagram`, `classDiagram`, `stateDiagram-v2`) agar dapat dirender langsung di GitHub, VS Code, maupun Obsidian tanpa plugin tambahan.

---

## Peta Kurikulum (14 Bab) & Struktur Direktori

### A. Materi Pembelajaran Utama (`materi/`)

| Bab | Topik & Fokus Kompetensi | Dokumen |
| :--- | :--- | :--- |
| **Bab 01** | **Fundamental System Analyst** — Peran SA vs BA/PM/Tech Lead, *system thinking*, peta artefak, kompetensi Junior vs Mid | [01-fundamental-system-analyst.md](materi/01-fundamental-system-analyst.md) |
| **Bab 02** | **SDLC: Waterfall, Agile/Scrum, & Hybrid** — Posisi dan deliverable SA di tiap fase SDLC & kolaborasi lintas tim | [02-sdlc-waterfall-agile.md](materi/02-sdlc-waterfall-agile.md) |
| **Bab 03** | **Requirement Elicitation, Stakeholder, & Komunikasi** — Power/Interest Grid, teknik wawancara, MoSCoW, User Story, MoM, RTM | [03-requirement-elicitation-stakeholder.md](materi/03-requirement-elicitation-stakeholder.md) |
| **Bab 04** | **Process Modeling: Flowchart & BPMN 2.0** — Analisis As-Is vs To-Be, gateway, swimlane, boundary event dalam Mermaid | [04-process-modeling-flowchart-bpmn.md](materi/04-process-modeling-flowchart-bpmn.md) |
| **Bab 05** | **UML Behavioral Part 1: Use Case & Activity Diagram** — Scope boundary, `<<include>>`/`<<extend>>`, Use Case Spec, Activity Diagram | [05-uml-use-case-activity.md](materi/05-uml-use-case-activity.md) |
| **Bab 06** | **UML Behavioral Part 2 & Structural: Sequence, State Machine, & Class** — Sequence async, `stateDiagram-v2`, Domain Class | [06-uml-sequence-state-class.md](materi/06-uml-sequence-state-class.md) |
| **Bab 07** | **UI/Screen Specification & Field-Level Mapping** — 5 state layar, validasi input, traceability UI–API–DB | [07-ui-screen-spec-field-mapping.md](materi/07-ui-screen-spec-field-mapping.md) |
| **Bab 08** | **Data Modeling (ERD) & SQL Wajib SA** — Crow's Foot ERD, normalisasi 1NF–3NF, snapshot harga, audit fields, SQL investigasi | [08-data-modeling-erd-sql.md](materi/08-data-modeling-erd-sql.md) |
| **Bab 09** | **API Contract, Integrasi Sistem, & System Design Dasar** — REST semantics, JSON envelope, RBAC, webhook, signature & idempotency | [09-api-integration-system-design.md](materi/09-api-integration-system-design.md) |
| **Bab 10** | **Non-Functional Requirements (NFR), Security, & Concurrency** — Latency p95, OWASP dasar, race condition, DB locking | [10-nfr-security-concurrency.md](materi/10-nfr-security-concurrency.md) |
| **Bab 11** | **Impact Analysis, Change Request (CR), Migrasi Data, & Batch/Reporting** — Dampak 6 lapis, backward compatibility, rekonsiliasi | [11-impact-analysis-cr-migrasi-batch.md](materi/11-impact-analysis-cr-migrasi-batch.md) |
| **Bab 12** | **Dokumentasi Standar Industri: BRD, SRS, & FSD** — Struktur ISO/IEC/IEEE 29148, penulisan requirement anti-ambigu, sign-off | [12-dokumentasi-brd-srs-fsd.md](materi/12-dokumentasi-brd-srs-fsd.md) |
| **Bab 13** | **UAT, Testing Collaboration, & Handover** — Equivalence Partitioning, BVA, UAT script, defect triage, Go/No-Go, PIR | [13-uat-testing-handover.md](materi/13-uat-testing-handover.md) |
| **Bab 14** | **Capstone Project Mandiri: MedikaLink** — Brief proyek klinik multi-dokter, kebutuhan kontradiktif, deliverable & rubrik penilaian | [14-capstone-project.md](materi/14-capstone-project.md) |

### B. Artefak Studi Kasus Terpadu (`studi-kasus/`)
Contoh dokumen jadi berstandar produksi untuk alur transaksi inti **NusaPOS & OrderHub**:
- [01-brd-nusapos.md](studi-kasus/01-brd-nusapos.md) — *Business Requirements Document*
- [02-srs-nusapos.md](studi-kasus/02-srs-nusapos.md) — *Software Requirements Specification*
- [03-api-contract-nusapos.md](studi-kasus/03-api-contract-nusapos.md) — *API & Webhook Integration Contract*
- [04-uat-script-nusapos.md](studi-kasus/04-uat-script-nusapos.md) — *User Acceptance Testing Script*

### C. Template Standar Industri Siap Pakai (`templates/`)
Template kosong terstruktur yang dapat langsung Anda salin untuk latihan maupun pekerjaan nyata:
- [template-brd.md](templates/template-brd.md) — Template *Business Requirements Document*
- [template-srs.md](templates/template-srs.md) — Template *Software Requirements Specification* (mengacu ISO/IEC/IEEE 29148)
- [template-fsd.md](templates/template-fsd.md) — Template *Functional Specification Document*
- [template-use-case.md](templates/template-use-case.md) — Template *Use Case Specification*
- [template-screen-spec.md](templates/template-screen-spec.md) — Template *UI/Screen Specification & Field Mapping*
- [template-cr-impact-analysis.md](templates/template-cr-impact-analysis.md) — Template *Change Request Impact Analysis*
- [template-uat.md](templates/template-uat.md) — Template *UAT Script & Business Sign-Off*

### D. Kunci Jawaban & Pembahasan (`kunci-latihan/`)
- [kunci-bab-01-04.md](kunci-latihan/kunci-bab-01-04.md) — Kunci & pembahasan Bab 01–04
- [kunci-bab-05-08.md](kunci-latihan/kunci-bab-05-08.md) — Kunci & pembahasan Bab 05–08
- [kunci-bab-09-13.md](kunci-latihan/kunci-bab-09-13.md) — Kunci & pembahasan Bab 09–13
- [kunci-capstone-ringkas.md](kunci-latihan/kunci-capstone-ringkas.md) — Solusi referensi ringkas proyek Capstone MedikaLink (Bab 14)

### E. Paket Kesiapan Kerja (`kesiapan-kerja/`)
- [panduan-portofolio-sa.md](kesiapan-kerja/panduan-portofolio-sa.md) — Cara menyusun portofolio SA dari studi kasus & capstone
- [bank-soal-interview-live-case.md](kesiapan-kerja/bank-soal-interview-live-case.md) — Bank soal wawancara teknis, perilaku, dan *live case* SA
- [cheat-sheet-system-analyst.md](kesiapan-kerja/cheat-sheet-system-analyst.md) — Lembar contekan cepat notasi, HTTP status, SQL, & checklist

---

## Kamus Domain Kanonik: **NusaPOS & OrderHub**

Bagian ini adalah **Single Source of Truth (Sumber Kebenaran Tunggal)** untuk seluruh bab materi (`01`–`13`), contoh dokumen di `studi-kasus/`, dan pembahasan di `kunci-latihan/`. Setiap nama entitas, status pesanan, kode kebutuhan, *endpoint* API, dan kode galat (*error code*) di bawah ini dikunci secara kanonik agar tidak terjadi inkonsistensi lintas dokumen.

### 1. Profil Bisnis & Batasan Ruang Lingkup
- **Perusahaan & Konteks:** **NusaKopi**, jaringan kedai kopi & ritel makanan cepat saji multi-cabang, membangun sistem terpadu **NusaPOS & OrderHub** untuk menyatukan kasir di toko (*Point of Sale / POS*) dengan pemesanan daring pelanggan dalam satu basis stok dan laporan keuangan yang konsisten.
- **Ruang Lingkup Fase 1 (Dimodelkan Penuh):**
  1. **POS In-Store Online-First:** Transaksi kasir langsung di cabang dengan koneksi terpusat (*real-time*) ke server pusat.
  2. **Online Self-Pickup:** Pemesanan pelanggan melalui web/aplikasi seluler untuk diambil sendiri (*self-pickup*) di cabang pilihan.
  3. **Alur Transaksi Inti (*Production-Grade*):** `Order (POS & Online Pickup) -> Stock Reservation -> Payment Webhook (QRIS/VA) -> Kitchen Fulfillment -> Void/Refund Approval -> Daily Reconciliation`.
  4. **Modul Master/Admin Pendukung:** Pengelolaan cabang (`stores`), menu/varian (`products`, `product_variants`), promo (`promotions`), serta pengguna/peran (`users`, `roles`) didokumentasikan pada level ringkasan terstruktur (aturan bisnis, entitas, dan endpoint utama).
- **Di Luar Ruang Lingkup Fase 1 (*Out-of-Scope* & Bahan Skenario Lanjutan):**
  1. **Delivery Kurir / Pihak Ketiga (3PL):** Sengaja dikeluarkan dari Fase 1 agar menjadi **studi kasus Change Request (CR) pada Bab 11** (penambahan aktor `Courier/3PL`, tabel `deliveries` & `customer_addresses`, serta status Fase 2 `OUT_FOR_DELIVERY` dan `DELIVERED` secara *backward-compatible*).
  2. **POS Offline Mode:** Pada Fase 1, kasir beroperasi secara *online-first*. Skenario gangguan jaringan dan sinkronisasi antrean lokal (*local sync queue* / *eventual consistency*) dibahas sebagai **kasus risiko arsitektur pada Bab 09–10** tanpa mengubah kontrak skema transaksi terpusat Fase 1.

---

### 2. Aktor Kanonik

| Aktor | Jenis | Peran & Tanggung Jawab Utama |
| :--- | :--- | :--- |
| `Customer` | Manusia (Eksternal) | Melihat katalog menu cabang, membuat pesanan *Online Self-Pickup*, membayar via QRIS/VA, memantau status, dan menerima notifikasi. |
| `Cashier` | Manusia (Internal Cabang) | Mengoperasikan POS cabang untuk pesanan *in-store*, memproses pembayaran tunai atau QRIS/VA, memverifikasi pengambilan pesanan *online*, dan mengajukan permintaan void/refund. |
| `Kitchen/Barista` | Manusia (Internal Cabang) | Melihat antrean pesanan yang sudah berstatus `PAID`, mengubah status pengerjaan ke `PREPARING` lalu `READY` saat pesanan siap diambil. |
| `Branch Manager` | Manusia (Internal Cabang) | Mengawasi operasional cabang, memberikan persetujuan (*approval*) atas permintaan void/refund pasca-bayar, melakukan penyesuaian stok/opname, dan memverifikasi rekonsiliasi harian cabang. |
| `HQ Admin` | Manusia (Internal Pusat) | Mengelola data master terpusat: cabang (`stores`), katalog produk & varian, harga per cabang, konfigurasi promo (`promotions`), dan manajemen akun/peran (`users`, `roles`). |
| `Payment Gateway (QRIS/VA)` | Sistem Eksternal | Membuat instruksi bayar dinamis (QRIS/Virtual Account) dan mengirimkan notifikasi status pembayaran secara asinkron melalui *signed webhook*. |
| `Accounting/ERP` | Sistem Eksternal | Menerima ringkasan data penjualan, pajak, diskon, refund, dan hasil rekonsiliasi harian cabang (`daily_reconciliations`) untuk pembukuan keuangan pusat. |
| `Notification Service` | Sistem Eksternal | Mengirimkan notifikasi status pesanan, bukti bayar, dan pemberitahuan siap ambil kepada pelanggan melalui WhatsApp (WA) atau Email. |

---

### 3. 14 Entitas Inti Kanonik

Seluruh desain basis data (*ERD*) pada Fase 1 menggunakan tepat **14 entitas inti** berikut:

| No | Nama Tabel | Fungsi Utama dalam Sistem |
| :---: | :--- | :--- |
| 1 | `stores` | Menyimpan data master cabang NusaKopi (kode cabang, nama, alamat, zona waktu operasional seperti `Asia/Jakarta`, status aktif). |
| 2 | `users` | Menyimpan akun pengguna internal (`Cashier`, `Kitchen/Barista`, `Branch Manager`, `HQ Admin`) dan pelanggan terdaftar (`Customer`) beserta penugasan cabang default. |
| 3 | `roles` | Menyimpan definisi peran untuk *Role-Based Access Control (RBAC)* beserta daftar izin akses (*permissions*) per modul/aksi. |
| 4 | `products` | Menyimpan data induk item menu (nama produk, kategori, deskripsi, status aktif) lintas cabang. |
| 5 | `product_variants` | Menyimpan varian SKU dari produk (misal ukuran *Regular/Large*, opsi *Hot/Iced*), harga dasar/per cabang, dan SKU unik. |
| 6 | `inventories` | Menyimpan posisi stok aktual dan stok yang sedang direservasi (*on_hand_qty*, *reserved_qty*) secara unik per kombinasi `store_id` + `variant_id`. |
| 7 | `inventory_movements` | Mencatat seluruh riwayat mutasi stok (*ledger*): `RESERVE`, `RELEASE`, `DEDUCT`, `RESTOCK`, `ADJUSTMENT`, dan `REFUND_RETURN` beserta referensi ID transaksi. |
| 8 | `orders` | Menyimpan header pesanan baik dari kanal `POS` maupun `ONLINE_PICKUP`, status pesanan, *snapshot* subtotal, diskon, pajak, total akhir, `store_id`, serta batas waktu reservasi (`expires_at`). |
| 9 | `order_items` | Menyimpan detail item dalam pesanan lengkap dengan **snapshot** nama produk, varian, harga satuan saat transaksi, kuantitas, dan catatan pelanggan (mencegah perubahan harga master memengaruhi histori). |
| 10 | `payments` | Menyimpan transaksi pembayaran per pesanan, metode (`CASH`, `QRIS`, `VA`), nominal bayar, `idempotency_key`, `external_tx_id`, status pembayaran, dan timestamp pelunasan. |
| 11 | `refunds` | Menyimpan pengajuan void/refund pasca-bayar, alasan, nominal pengembalian, status persetujuan (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `COMPLETED`), serta ID `Branch Manager` yang menyetujui. |
| 12 | `promotions` | Menyimpan aturan promosi/diskon (kode voucher, tipe persentase atau nominal tetap, minimum belanja, kuota, periode berlaku, dan aturan pembulatan). |
| 13 | `audit_logs` | Mencatat jejak audit (*immutable*) untuk aksi sensitif: perubahan harga/stok manual, persetujuan void/refund, kegagalan otorisasi, dan penutupan rekonsiliasi (`actor_id`, `action`, `entity`, `before_value`, `after_value`, `created_at`). |
| 14 | `daily_reconciliations` | Menyimpan hasil tutup buku harian per cabang per tanggal bisnis: total transaksi POS vs Online, total tunai vs QRIS/VA, total refund, selisih (*variance*), status sinkronisasi ke `Accounting/ERP`, dan penanda tangan `Branch Manager`. |

---

### 4. Status Order Fase 1 Kanonik (8 Status) & Aturan Transisi

Pada Fase 1 (*POS In-Store* & *Online Self-Pickup*), siklus hidup pesanan (`orders.status`) dibatasi secara ketat pada **8 status kanonik** berikut:

| Status Kanonik | Definisi Operasional | Transisi Sah Berikutnya |
| :--- | :--- | :--- |
| `PENDING_PAYMENT` | Pesanan terbentuk; stok sudah direservasi (untuk online checkout TTL 15 menit) menunggu konfirmasi bayar. | `PAID`, `CANCELLED`, `EXPIRED` |
| `PAID` | Pembayaran lunas terverifikasi (tunai oleh kasir atau webhook QRIS/VA valid); stok resmi dipotong (*deducted*); masuk antrean dapur. | `PREPARING`, `REFUNDED` |
| `PREPARING` | `Kitchen/Barista` mulai menyiapkan pesanan. | `READY`, `REFUNDED` |
| `READY` | Pesanan selesai diracik dan siap diambil pelanggan di konter cabang. | `COMPLETED`, `REFUNDED` |
| `COMPLETED` | Pesanan telah diserahkan kepada pelanggan (`Customer` atau via verifikasi `Cashier`). Status final sukses. | `REFUNDED` *(hanya melalui alur komplain/refund disetujui `Branch Manager`)* |
| `CANCELLED` | Pesanan dibatalkan sebelum dibayar (oleh `Customer` atau `Cashier`); reservasi stok dilepas kembali. Status final. | *(Terminal — tidak dapat bertransisi)* |
| `EXPIRED` | Batas waktu pembayaran/reservasi 15 menit terlampaui; scheduler otomatis melepas reservasi stok. Status final. | *(Terminal — tidak dapat bertransisi)* |
| `REFUNDED` | Pembayaran yang sudah berstatus `PAID` (atau setelahnya) dikembalikan penuh sesuai approval `Branch Manager`. Status final. | *(Terminal — tidak dapat bertransisi)* |

> **Catatan Ruang Lingkup Fase 2 (Bab 11):** Status tambahan `OUT_FOR_DELIVERY` dan `DELIVERED` **tidak ada di Fase 1**. Kedua status tersebut hanya diperkenalkan pada skenario *Change Request* pengiriman kurir 3PL di Bab 11. Setiap upaya transisi status yang tidak tercantum pada tabel di atas wajib ditolak sistem dengan kode galat `ERR_INVALID_STATE_TRANSITION`.

---

### 5. Aturan Bisnis Kanonik (Berlaku Lintas Bab)

1. **Granularitas Stok:** Stok dikelola unik per pasangan `store_id` + `variant_id` pada tabel `inventories`, di mana stok tersedia (*available stock*) dihitung sebagai `on_hand_qty - reserved_qty` dan tidak boleh bernilai negatif.
2. **Stock Reservation (TTL 15 Menit):** Setiap *checkout* pesanan online melakukan reservasi stok selama **15 menit** (`expires_at = created_at + 15 minutes`). Jika pembayaran tidak selesai hingga melewati TTL, *scheduler/batch job* secara otomatis mengubah status pesanan menjadi `EXPIRED`, melepas `reserved_qty`, dan mencatat entri `RELEASE` pada `inventory_movements`.
3. **Pembayaran Asinkron & Idempotency:** Konfirmasi pembayaran QRIS/VA diterima secara asinkron melalui webhook dari `Payment Gateway (QRIS/VA)` yang wajib memverifikasi tanda tangan digital (*HMAC signature*). Pemrosesan webhook harus bersifat *idempotent* (aman terhadap pengiriman ulang) menggunakan `idempotency_key` / `external_tx_id`; permintaan duplikat setelah sukses tidak boleh memotong stok dua kali atau mengubah status dua kali.
4. **Otorisasi Void/Refund Pasca-Bayar:** Pembatalan atau pengembalian dana pada pesanan yang sudah melewati tahap `PAID` wajib diajukan melalui alur `refunds` dan memperoleh persetujuan eksplisit `Branch Manager`. Setiap aksi pengajuan maupun persetujuan wajib terekam dalam `audit_logs`.
5. **Presisi Uang & Aturan Pembulatan:** Seluruh nilai uang disimpan dalam bilangan bulat Rupiah (`BIGINT`) atau `DECIMAL(15,2)` (pada *NusaPOS & OrderHub* dipakai bilangan bulat Rupiah `BIGINT` tanpa desimal sen untuk konsistensi kasir IDR). Perhitungan diskon dan pajak menggunakan pembulatan eksplisit (*HALF_UP* ke Rupiah terdekat) di tingkat subtotal transaksi agar tidak terjadi selisih pembulatan per item saat rekonsiliasi.
6. **Standar Zona Waktu:** Seluruh kolom *timestamp* (`created_at`, `updated_at`, `paid_at`, `expires_at`) wajib disimpan dalam **UTC** di basis data, dan dikonversi ke zona waktu cabang masing-masing (misalnya `Asia/Jakarta` / WIB) saat ditampilkan pada UI maupun dikelompokkan ke dalam tanggal bisnis `daily_reconciliations`.

---

### 6. Daftar Kode Requirement & Use Case Kanonik

ID berikut menjadi jangkar keterlacakan (*traceability*) dari Bab 03 hingga Bab 13 dan seluruh berkas `studi-kasus/`:

#### A. Functional Requirements (`FR-01` s.d. `FR-08`)

| ID | Nama Requirement | Aktor Terkait | Entitas & Endpoint Utama |
| :--- | :--- | :--- | :--- |
| `FR-01` | Autentikasi & Otorisasi Berbasis Peran (RBAC) | Semua Aktor Manusia | `users`, `roles`, `audit_logs` · `POST /api/v1/auth/login` |
| `FR-02` | Pengelolaan & Tampilan Katalog Menu Cabang beserta Stok Real-Time | `HQ Admin`, `Cashier`, `Customer` | `stores`, `products`, `product_variants`, `inventories`, `promotions` · `GET /api/v1/stores/{storeId}/menu` |
| `FR-03` | Pembuatan Pesanan POS & Online Self-Pickup dengan Validasi/Reservasi Stok | `Cashier`, `Customer` | `orders`, `order_items`, `inventories`, `inventory_movements`, `promotions` · `POST /api/v1/orders` |
| `FR-04` | Pemrosesan Pembayaran Tunai (POS) & Pembayaran Asinkron QRIS/VA via Webhook | `Cashier`, `Customer`, `Payment Gateway (QRIS/VA)` | `payments`, `orders`, `inventories`, `inventory_movements` · `POST /api/v1/webhooks/payments/qris` |
| `FR-05` | Pengelolaan Antrean Dapur & Transisi Status Pemenuhan Pesanan | `Kitchen/Barista`, `Cashier`, `Notification Service` | `orders`, `audit_logs` · `PATCH /api/v1/orders/{orderId}/status` |
| `FR-06` | Pembatalan Pra-Bayar & Pelepasan Otomatis Reservasi Kedaluwarsa (`EXPIRED`) | `Customer`, `Cashier`, Sistem Scheduler | `orders`, `inventories`, `inventory_movements` |
| `FR-07` | Pengajuan & Approval Void/Refund Pasca-Bayar dengan Jejak Audit | `Cashier`, `Branch Manager`, `Payment Gateway (QRIS/VA)` | `refunds`, `orders`, `payments`, `inventories`, `inventory_movements`, `audit_logs` · `POST /api/v1/orders/{orderId}/refunds` |
| `FR-08` | Rekonsiliasi Penjualan Harian Cabang & Ekspor ke Accounting/ERP | `Branch Manager`, `Accounting/ERP` | `daily_reconciliations`, `orders`, `payments`, `refunds`, `audit_logs` · `GET/POST /api/v1/reconciliations/daily` |

#### B. Non-Functional Requirements (`NFR-01` s.d. `NFR-04`)

| ID | Kategori | Target Terukur |
| :--- | :--- | :--- |
| `NFR-01` | Performa & Latensi | Waktu respons *p95* untuk tampilan katalog menu `<= 300 ms` dan pembuatan pesanan `<= 500 ms` pada beban puncak 150 *requests per second (RPS)* nasional. |
| `NFR-02` | Konkurensi & Konsistensi Data | Operasi pengurangan dan reservasi stok wajib berjalan dalam transaksi basis data atomik dengan penguncian (*row-level locking*) sehingga peluang *overselling* = 0%; webhook pembayaran wajib *idempotent*. |
| `NFR-03` | Keamanan & Auditabilitas | Komunikasi wajib HTTPS/TLS 1.2+, otorisasi RBAC terverifikasi per cabang (`store_id`), verifikasi *HMAC signature* pada seluruh webhook, *rate limiting* pada endpoint publik, serta pencatatan `audit_logs` yang *immutable* minimal 5 tahun. |
| `NFR-04` | Ketersediaan, Waktu, & Akurasi Finansial | Ketersediaan (*availability*) layanan transaksi inti `>= 99,5%` selama jam operasional (06.00–23.00 WIB); seluruh timestamp disimpan UTC dan direkonsiliasi dalam zona `Asia/Jakarta`; presisi kalkulasi uang Rupiah tanpa selisih pembulatan (*0 discrepancy*). |

#### C. Use Cases Inti (`UC-01` s.d. `UC-06`)

| ID | Nama Use Case | Aktor Primer | Referensi FR |
| :--- | :--- | :--- | :--- |
| `UC-01` | Login Pengguna & Validasi Hak Akses Cabang | `Cashier` / `Kitchen/Barista` / `Branch Manager` / `HQ Admin` / `Customer` | `FR-01` |
| `UC-02` | Pembuatan & Pembayaran Pesanan Kasir di Toko (POS In-Store) | `Cashier` | `FR-02`, `FR-03`, `FR-04` |
| `UC-03` | Pemesanan Online Self-Pickup & Reservasi Stok (TTL 15 Menit) | `Customer` | `FR-02`, `FR-03`, `FR-06` |
| `UC-04` | Konfirmasi Pembayaran Asinkron via Webhook QRIS/VA & Notifikasi | `Payment Gateway (QRIS/VA)` | `FR-04` |
| `UC-05` | Pemrosesan Pesanan oleh Dapur hingga Penyerahan Pelanggan | `Kitchen/Barista`, `Cashier` | `FR-05` |
| `UC-06` | Pengajuan Void/Refund dengan Approval Branch Manager & Rekonsiliasi Harian | `Cashier`, `Branch Manager` | `FR-07`, `FR-08` |

---

### 7. Konvensi API Kanonik & Kode Error Standar

#### A. Daftar Endpoint Kanonik Fase 1

| Endpoint | Method | Fungsi Utama | Aktor / Pemanggil |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | Autentikasi kredensial & penerbitan token akses berbasis peran (`roles`) | Semua Aktor Manusia |
| `/api/v1/stores/{storeId}/menu` | `GET` | Mengambil daftar produk, varian, harga, promo aktif, dan ketersediaan stok di cabang `storeId` | `Customer`, `Cashier` |
| `/api/v1/orders` | `POST` | Membuat pesanan baru (`POS` atau `ONLINE_PICKUP`), validasi promo, dan reservasi/potong stok | `Customer`, `Cashier` |
| `/api/v1/orders/{orderId}/status` | `PATCH` | Memindahkan status pesanan sesuai aturan transisi sah (`PREPARING`, `READY`, `COMPLETED`, `CANCELLED`) | `Kitchen/Barista`, `Cashier`, `Customer` |
| `/api/v1/webhooks/payments/qris` | `POST` | Menerima callback status pembayaran QRIS/VA bertanda tangan dan memproses secara *idempotent* | `Payment Gateway (QRIS/VA)` |
| `/api/v1/orders/{orderId}/refunds` | `POST` | Mengajukan atau mengeksekusi pengembalian dana pasca-bayar (memerlukan otorisasi `Branch Manager`) | `Cashier`, `Branch Manager` |
| `/api/v1/reconciliations/daily` | `GET` / `POST` | Mengambil ringkasan penjualan/pembayaran harian cabang dan memfinalisasi tutup buku harian ke ERP | `Branch Manager` |

#### B. Amplop Respons & Kode Error Standar

Seluruh respons galat (*error response*) API menggunakan format JSON yang seragam:

```json
{
  "success": false,
  "error": {
    "code": "ERR_INSUFFICIENT_STOCK",
    "message": "Stok varian Kopi Susu Aren (Large) di cabang tidak mencukupi.",
    "details": {
      "variant_id": "VAR-002",
      "requested_qty": 3,
      "available_qty": 1
    },
    "trace_id": "req-9f8e7d6c5b4a"
  }
}
```

| Kode Error Kanonik | HTTP Status | Kapan Dikembalikan |
| :--- | :---: | :--- |
| `ERR_INSUFFICIENT_STOCK` | `409 Conflict` | Permintaan pembuatan pesanan melebihi `on_hand_qty - reserved_qty` pada cabang terkait. |
| `ERR_INVALID_STATE_TRANSITION` | `422 Unprocessable Entity` | Upaya mengubah `orders.status` melompati atau melanggar matriks transisi sah (misal `EXPIRED` -> `PAID` atau `COMPLETED` -> `PREPARING`). |
| `ERR_DUPLICATE_IDEMPOTENCY` | `409 Conflict` / `200 OK` *(tergantung semantik retry)* | Pengiriman ulang request/webhook dengan `idempotency_key` atau `external_tx_id` yang sudah diproses (untuk webhook sukses, sistem mengembalikan `200 OK` *idempotent acknowledgement* tanpa memproses ulang; untuk mutasi klien dengan payload berbeda, mengembalikan `409`). |
| `ERR_UNAUTHORIZED_APPROVAL` | `403 Forbidden` | Pengguna selain `Branch Manager` mencoba menyetujui void/refund pasca-bayar, atau pengguna mengakses data cabang di luar wewenangnya. |
| `ERR_RESERVATION_EXPIRED` | `410 Gone` / `409 Conflict` | Pelanggan atau gateway mencoba melanjutkan pembayaran pada pesanan yang TTL reservasi 15 menitnya sudah kedaluwarsa (`EXPIRED`). |

---

## Siap Memulai?

Mulailah dari [**Bab 01 — Fundamental System Analyst**](materi/01-fundamental-system-analyst.md) untuk memahami peran strategis seorang System Analyst dan cara berpikir sistem sebelum menyentuh diagram dan dokumen teknis. Selamat belajar!
