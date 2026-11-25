# Cheat Sheet System Analyst — Referensi Cepat Siap Kerja

> **Cara Pakai:** Simpan dokumen ini sebagai contekan cepat saat Anda menulis spesifikasi `SRS/FSD`, mengaudit kontrak API, menyelidiki bug data dengan SQL, maupun saat memimpin rapat *Impact Analysis* dan *Go/No-Go Release*.

---

## 1. Peta Pemilih Diagram: Pakai Diagram Apa & Kapan?

| Jenis Diagram (Mermaid) | Pertanyaan Utama yang Dijawab | Kapan Wajib Dipakai SA | Anti-Pattern yang Dihindari |
| :--- | :--- | :--- | :--- |
| **BPMN / Flowchart + Swimlane** (`flowchart TD/LR`) | *"Siapa melakukan apa, di urutan mana, dan lewat sistem apa?"* | Memetakan proses bisnis *As-Is* vs *To-Be* lintas aktor/departemen. | Menggambar *happy path* saja tanpa jalur gagal/pengecualian. |
| **Activity Diagram** (`flowchart TD`) | *"Bagaimana logika cabang/paralel di dalam satu fitur?"* | Mengurai alur satu *Use Case* kompleks dengan banyak kondisi `if/else`. | Mencampuradukkan level bisnis makro dengan detail query SQL. |
| **Sequence Diagram** (`sequenceDiagram`) | *"Pesan apa yang dikirim antar komponen secara kronologis?"* | FSD integrasi, alur API sinkron + *webhook* asinkron, *retry/timeout*. | Lupa blok `alt/else` untuk skenario timeout atau error `4xx/5xx`. |
| **State Machine** (`stateDiagram-v2`) | *"Status apa saja yang sah dan transisi mana yang terlarang?"* | Entitas berstatus ketat: `Order`, `Payment`, `Refund`, `Appointment`, `Resep`. | Membiarkan status berubah bebas tanpa aturan *guard* & status terminal. |
| **ERD Crow's Foot** (`erDiagram`) | *"Entitas data apa yang disimpan dan bagaimana kardinalitasnya?"* | Merancang skema database relasional, kunci unik, dan tabel *ledger/snapshot*. | Menyimpan daftar item dalam 1 kolom teks koma (*melanggar 1NF*) atau lupa *snapshot* harga. |

### Ringkasan Notasi Kardinalitas ERD (`erDiagram` Mermaid)
- `||--||` : **One-to-One wajib** (1 ke tepat 1, misal `users ||--|| user_profiles`)
- `||--o|` : **One-to-One opsional** (1 ke 0 atau 1, misal `appointments ||--o| medical_records`)
- `||--o{` : **One-to-Many opsional** (1 ke 0 atau banyak, misal `clinics ||--o{ appointments`)
- `||--|{` : **One-to-Many wajib** (1 ke minimal 1 atau banyak, misal `orders ||--|{ order_items`)
- `}o--o{` : **Many-to-Many** *(wajib dipecah menggunakan tabel penghubung / junction table di desain fisik!)*

---

## 2. REST API Semantics, HTTP Status Code, & Kontrak Aman

### 2.1 Aturan Method HTTP
| Method | Sifat | Kegunaan Standar | Aturan Wajib SA |
| :--- | :--- | :--- | :--- |
| `GET` | Aman (*Read-Only*) & *Idempotent* | Mengambil data / daftar / detail | **Dilarang keras** mengubah state DB atau membawa data sensitif di URL! |
| `POST` | Tidak *idempotent* secara bawaan | Membuat resource baru atau aksi kompleks | Wajib sertakan **`Idempotency-Key`** untuk transaksi bayar/order/klaim. |
| `PUT` | *Idempotent* | Mengganti seluruh isi resource | Kirim seluruh field; field yang hilang bisa tertimpa `NULL`. |
| `PATCH` | Parsial | Memperbarui sebagian field (misal `status`) | Validasi transisi status via State Machine sebelum simpan. |
| `DELETE` | *Idempotent* | Menghapus / menonaktifkan resource | Untuk data keuangan/medis gunakan **Soft Delete** (`is_active = false` / `CANCELLED`), jangan hapus fisik! |

### 2.2 HTTP Status Code Wajib Hafal SA
- **`200 OK`**: Request `GET`/`PATCH`/`PUT` sukses, **atau acknowledgement webhook duplikat yang idempotent**.
- **`201 Created`**: Resource baru (`order`, `appointment`, `refund`) berhasil dibuat via `POST`.
- **`400 Bad Request`**: Format JSON rusak, tipe data salah, atau validasi input field gagal (misal panjang teks `< 10` karakter).
- **`401 Unauthorized`**: Token login tidak ada, tidak valid, atau kedaluwarsa (*belum terautentikasi*).
- **`403 Forbidden`**: Sudah login, tetapi **peran/cabang tidak berhak** (misal Kasir mencoba akses RME atau approve refund — `ERR_UNAUTHORIZED_APPROVAL`).
- **`404 Not Found`**: ID resource tidak ada *(atau sengaja dipakai untuk menyembunyikan resource lintas tenant/IDOR)*.
- **`409 Conflict`**: Konflik state/data saat ini: stok kurang (`ERR_INSUFFICIENT_STOCK`), klaim kuota habis, atau payload beda pada `Idempotency-Key` yang sama.
- **`410 Gone`**: Resource/tiket reservasi sudah kedaluwarsa permanen (misal `ERR_RESERVATION_EXPIRED`).
- **`422 Unprocessable Entity`**: Format sintaks JSON benar, tetapi melanggar aturan logika bisnis / transisi State Machine (`ERR_INVALID_STATE_TRANSITION`).
- **`429 Too Many Requests`**: Melampaui batas *rate limiting*.
- **`500 / 502 / 504`**: Kesalahan internal server (`500`), respons rusak dari layanan hulu (`502`), atau *timeout* integrasi eksternal (`504`).

### 2.3 Amplop Error JSON Standar
Pastikan tidak pernah membocorkan pesan SQL mentah (`stack trace`) ke klien:
```json
{
  "success": false,
  "error": {
    "code": "ERR_INSUFFICIENT_STOCK",
    "message": "Pesan ramah pengguna dalam bahasa UI.",
    "details": { "variant_id": "VAR-002", "available_qty": 1 },
    "trace_id": "req-9f8e7d6c5b4a"
  }
}
```

---

## 3. Pola SQL Investigasi Produksi untuk System Analyst

Gunakan pola query baca (`SELECT`) berikut saat memverifikasi UAT atau menginvestigasi tiket anomali dari tim Support:

```sql
-- 1. Cek konsistensi stok fisik vs reservasi vs mutasi ledger
SELECT i.store_id, i.variant_id, i.on_hand_qty, i.reserved_qty,
       (i.on_hand_qty - i.reserved_qty) AS available_qty
FROM inventories i
WHERE (i.on_hand_qty - i.reserved_qty) < 0 OR i.reserved_qty < 0;

-- 2. Audit keterlambatan scheduler: cari pesanan PENDING_PAYMENT yang sudah lewat TTL
SELECT id, store_id, status, created_at, expires_at
FROM orders
WHERE status = 'PENDING_PAYMENT' AND expires_at < NOW();

-- 3. Deteksi indikasi duplikasi transaksi / idempotency anomali
SELECT external_tx_id, COUNT(*) AS jumlah
FROM payments
WHERE external_tx_id IS NOT NULL
GROUP BY external_tx_id
HAVING COUNT(*) > 1;

-- 4. Rekap harian lintas zona waktu cabang (Simpan UTC -> Kelompokkan per tanggal lokal)
SELECT c.code AS kode_cabang,
       DATE(inv.paid_at AT TIME ZONE c.timezone) AS tanggal_bisnis_lokal,
       SUM(inv.total_amount) AS total_omzet
FROM invoices inv
JOIN clinics c ON c.id = inv.clinic_id
WHERE inv.payment_status = 'PAID'
GROUP BY c.code, DATE(inv.paid_at AT TIME ZONE c.timezone);
```

---

## 4. Checklist Kualitas IEEE 29148 & Kata Terlarang (*Ambiguity Busters*)

Setiap requirement (`FR` / `NFR`) wajib memenuhi sifat **Atomic, Unambiguous, Consistent, Complete, Verifiable, & Traceable**.

| Kata Kabur *(Dilarang di SRS)* | Mengapa Berbahaya | Cara Menulis Ulang yang Terukur |
| :--- | :--- | :--- |
| *"Cepat" / "Instan"* | Dev mengira 3 detik, bisnis mengira 0,3 detik. | *"Waktu respons p95 `<= 300 ms` pada beban 150 RPS."* |
| *"User-friendly" / "Mudah"* | Subjektif, tidak bisa dibuatkan skenario uji QA. | *"Menyediakan 5 state layar, inline error per field, maksimal 3 klik untuk checkout."* |
| *"Fleksibel" / "Dinamis"* | Mengundang *over-engineering* atau salah asumsi skema. | *"Nilai persentase diskon dan periode aktif dapat diubah HQ Admin via tabel `promotions` tanpa deploy ulang."* |
| *"Aman"* | Terlalu luas; tim bisa lupa RBAC/enkripsi/audit. | *"Wajib TLS 1.2+, RBAC per `store_id`, HMAC signature webhook, dan `audit_logs` immutable 5 tahun."* |
| *"Dll." / "Dst." / "Jika diperlukan"* | Membuka celah ruang lingkup liar (*scope creep*). | Sebutkan daftar tertutup (*enumerated list*) secara eksplisit. |

---

## 5. Rumus Pengujian (EP & BVA) + Patokan Metrik NFR

### 5.1 Equivalence Partitioning (EP) & Boundary Value Analysis (BVA)
Untuk aturan rentang **`[MIN .. MAX]`** (misal panjang teks `10..250` atau kuantitas `1..10`):
- **EP (1 sampel per kelas):** 1 sampel tidak valid bawah (`< MIN`), 1 sampel valid tengah, 1 sampel tidak valid atas (`> MAX`).
- **BVA (titik perbatasan tempat bug `<` vs `<=` bersembunyi):** Uji **`MIN - 1`**, **`MIN`**, **`MAX`**, dan **`MAX + 1`**.
- **BVA Waktu TTL (misal `expires_at = 10:15:00Z`):** Wajib uji **`10:14:59Z`** (1 detik sebelum habis -> harus sukses), **`10:15:00Z`** (tepat batas -> sesuai aturan `<=` atau `<`), dan **`10:15:01Z`** (1 detik lewat -> harus `EXPIRED`).

### 5.2 Patokan Metrik Keandalan & Keuangan
- **Latensi API:** *p95* baca katalog `<= 300 ms`, *p95* transaksi tulis `<= 500 ms` *(lebih akurat daripada rata-rata/mean yang menyembunyikan kelambatan ekstrem)*.
- **Availability:** `99,5%` (downtime maks. ~3,6 jam/bulan) hingga `99,9%` (~43 menit/bulan).
- **Uang & Pembulatan:** Gunakan tipe integer unit terkecil (`BIGINT` Rupiah) atau `DECIMAL(15,2)` — **dilarang keras** memakai `FLOAT`/`DOUBLE` untuk nominal uang! Kunci aturan pembulatan (`HALF_UP` di level subtotal).
- **Waktu:** DB wajib **UTC (`TIMESTAMPTZ`)**; konversi ke zona lokal (`Asia/Jakarta`, `Asia/Makassar`) dilakukan pada lapisan presentasi & agregasi tanggal bisnis.

---

## 6. Checklist Cepat Impact Analysis & Keputusan Rilis Go/No-Go

### 6.1 Enam Lapisan Wajib Saat Ada Change Request (CR)
1. **UI/UX & Client** *(layar, 5 state, validasi, aplikasi versi lama)*
2. **Business Logic & State Machine** *(aturan baru, transisi status, RBAC)*
3. **API Contract** *(field opsional vs wajib, versioning, backward compatibility)*
4. **Database Schema & Data Eksisting** *(tabel/kolom baru nullable/default, backfill batch, index)*
5. **Integrasi Eksternal & Scheduler** *(timeout, retry, idempotency, cron TTL)*
6. **Reporting, Audit, & Rekonsiliasi** *(dampak tutup buku harian, pajak, ekspor ERP)*

### 6.2 Matriks Keputusan *Defect Triage* & *Go/No-Go*
| Kondisi Temuan Saat UAT | Keputusan Standar | Syarat Wajib |
| :--- | :---: | :--- |
| Ada 1+ defect **Blocker / Critical** terbuka (misal *oversell*, kebocoran RME, selisih finansial Rp 1, salah zona waktu tutup kasir). | **NO-GO** | Tunda rilis, perbaiki kode/data, dan wajib **retest** hingga lulus 100%. |
| Seluruh skenario *Must Have* lulus, `0` Blocker/Critical, hanya ada defect **Major/Minor** non-finansial dengan solusi sementara. | **CONDITIONAL GO** | Catat sebagai *Known Issue*, tulis *workaround* di Runbook Ops, jadwalkan *patch*, dan dapatkan **persetujuan tertulis Business Owner**. |
| `100%` skenario kritis `PASS`, `0` Blocker/Critical, monitoring & rollback siap. | **GO** | Lakukan serah terima (*Handover*) ke L1/L2 Support dan jadwalkan **PIR** (H+7 s.d. H+14). |

---

**Navigasi Terkait:**
- [Panduan Menyusun Portofolio System Analyst Siap Lamar](panduan-portofolio-sa.md)
- [Bank Soal Interview & Simulasi Live-Case System Analyst](bank-soal-interview-live-case.md)
- [Bab 14 — Capstone Project Mandiri: MedikaLink](../materi/14-capstone-project.md)
- [Peta Kurikulum & Kamus Domain (`README.md`)](../README.md)
