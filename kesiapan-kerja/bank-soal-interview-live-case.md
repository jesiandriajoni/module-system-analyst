# Bank Soal Interview & Simulasi Live-Case System Analyst (Junior–Mid)

> **Cara Berlatih Menggunakan Dokumen Ini:** Jangan menghafal kalimat jawaban secara kaku! Pewawancara senior tidak mencari definisi buku teks—mereka menguji **cara Anda berpikir terstruktur, mengklarifikasi asumsi, mendeteksi risiko yang tidak diucapkan, dan mengambil keputusan di tengah keterbatasan**. Bacalah pertanyaan, coba jawab lisan selama 2 menit, baru periksa poin kunci dan jebakan yang sering menggugurkan kandidat.

**Navigasi Cepat:**
- [Bagian 1: 16 Pertanyaan Interview Teknis & Behavioral](#bagian-1-16-pertanyaan-interview-teknis--behavioral)
  - [A. Fundamental, Elicitation, & Stakeholder (Q1–Q4)](#a-fundamental-elicitation--stakeholder-q1q4)
  - [B. Modeling, Data, & API (Q5–Q8)](#b-modeling-data--api-q5q8)
  - [C. NFR, Change Request, & UAT (Q9–Q12)](#c-nfr-change-request--uat-q9q12)
  - [D. Behavioral / Situational — Metode STAR (Q13–Q16)](#d-behavioral--situational--metode-star-q13q16)
- [Bagian 2: Kerangka Menjawab Live-Case dalam 30 Menit](#bagian-2-kerangka-menjawab-live-case-dalam-30-menit)
- [Bagian 3: 3 Simulasi Live-Case Interview Utuh](#bagian-3-3-simulasi-live-case-interview-utuh)

---

## Bagian 1: 16 Pertanyaan Interview Teknis & Behavioral

### A. Fundamental, Elicitation, & Stakeholder (Q1–Q4)

#### Q1. Apa perbedaan konkret antara System Analyst (SA), Business Analyst (BA), dan Product Manager (PM) dalam sebuah tim proyek?
- **Yang Diuji:** Pemahaman batas tanggung jawab kolaborasi agar tidak tumpang tindih atau pasif menunggu perintah.
- **Poin Jawaban Kunci:**
  - *Junior:* Menjelaskan fokus masing-masing: PM/BA berfokus pada *mengapa dan apa* nilai bisnis/prioritas produk (*roadmap*, KPI, BRD), sedangkan SA menerjemahkan kebutuhan bisnis tersebut menjadi **spesifikasi perilaku sistem yang rinci dan siap dibangun** (SRS/FSD, alur proses, aturan status, ERD, kontrak API, kasus tepi).
  - *Mid (+Nilai Tambah):* Menjelaskan bahwa di perusahaan kecil peran ini bisa beririsan, namun SA tetap menjadi **jembatan translasi dua arah**—menjaga tim bisnis dari solusi yang merusak integritas data, dan menjaga tim *engineering* dari asumsi bisnis yang keliru.
- **Jebakan (*Red Flag*):** Menjawab *"SA itu tugasnya bikin flowchart dan ngetes aplikasi saja"* (mengkerdilkan peran analitis SA).

#### Q2. Dua pemangku kepentingan senior (misal Pemilik Bisnis vs Kepala Operasional/Kepatuhan) memberi kebutuhan yang bertentangan. Bagaimana Anda menyelesaikannya?
- **Yang Diuji:** Kematangan komunikasi, keberanian berbasis data/regulasi, dan kemampuan negosiasi *trade-off*.
- **Poin Jawaban Kunci:**
  - Kumpulkan akar tujuan di balik permintaan masing-masing (pisahkan *solusi yang diminta* dari *masalah yang ingin diselesaikan*).
  - Cek batasan mutlak: regulasi hukum/keamanan (seperti UU PDP, audit keuangan) dan dampak integritas data tidak boleh dikompromikan.
  - Susun opsi beserta **dampak biaya, risiko, dan waktu** dalam matriks keputusan, fasilitasi rapat bersama untuk memilih opsi final, lalu dokumentasikan dalam *Conflict Resolution Log* & *Minutes of Meeting (MoM)* untuk *sign-off*. *(Anda bisa mengutip kasus konflik akses RME vs kecepatan kasir dari Capstone MedikaLink!)*
- **Jebakan:** *"Saya ikuti saja permintaan bos yang jabatannya paling tinggi."*

#### Q3. User berkata: *"Pokoknya sistemnya harus cepat, aman, dan fleksibel kalau nanti aturan diskon berubah."* Apa langkah Anda selanjutnya?
- **Yang Diuji:** Kepekaan terhadap *ambiguity* (standar IEEE 29148) dan kemampuan mengurai NFR/aturan bisnis tersembunyi.
- **Poin Jawaban Kunci:**
  - Identifikasi bahwa kata *"cepat, aman, fleksibel"* belum dapat diuji oleh QA (*unverifiable*).
  - Ajukan pertanyaan klarifikasi terukur: *"Cepat itu di halaman apa, pada beban berapa pengguna, dan target waktu respon berapa milidetik?"*, *"Aman maksudnya batas akses peran mana saja dan kepatuhan standar apa?"*, *"Fleksibel artinya parameter diskon mana yang berubah tiap minggu (persentase, kuota, produk) agar kita buatkan tabel konfigurasi, bukan hardcode?"*
- **Jebakan:** Langsung mencatat *"Sistem harus cepat dan fleksibel"* ke dalam dokumen SRS.

#### Q4. Di tengah sprint berjalan, sponsor meminta fitur besar baru ditambahkan tanpa mau menggeser tenggat rilis. Bagaimana sikap Anda?
- **Yang Diuji:** Kemampuan mengendalikan *scope creep* dan menerapkan proses *Change Request (CR)*.
- **Poin Jawaban Kunci:**
  - Tidak menolak mentah-mentah dengan emosi, namun juga tidak diam-diam menyisipkan fitur ke developer.
  - Lakukan **Impact Analysis 6 Lapisan** singkat (UI, logic, API, DB, integrasi, reporting/UAT) untuk menghitung dampak usaha dan risiko regresi.
  - Sajikan tiga pilihan objektif ke PM/Sponsor: (1) masukkan sebagai CR Fase 2 pasca-rilis, (2) tukar prioritas dengan fitur Fase 1 lain yang bernilai lebih rendah (*swap scope*), atau (3) tambah waktu/kapasitas rilis.
- **Jebakan:** *"Saya kerjakan saja dulu supaya klien senang, nanti tim dev lembur."*

---

### B. Modeling, Data, & API (Q5–Q8)

#### Q5. Kapan Anda memilih BPMN, Activity Diagram, Sequence Diagram, dan State Machine Diagram?
- **Yang Diuji:** Ketepatan memilih alat pemodelan sesuai audiens dan masalah, bukan menggambar semua diagram tanpa alasan.
- **Poin Jawaban Kunci:**
  - **BPMN (*Swimlane*):** Untuk memetakan alur bisnis *end-to-end* lintas peran manusia dan departemen (audiens: user bisnis + tim teknis).
  - **Activity Diagram:** Untuk mengurai logika cabang/paralel di dalam satu *use case* atau satu proses spesifik.
  - **Sequence Diagram:** Untuk melacak urutan pesan sinkron/asinkron antar komponen teknis (Client -> API -> DB -> Gateway -> Webhook).
  - **State Machine (`stateDiagram-v2`):** Wajib dipakai untuk entitas dengan **siklus status ketat** (misal `Order`, `Appointment`, `Refund`) guna mengunci transisi sah dan menolak transisi ilegal.
- **Jebakan:** Mengaku memakai Flowchart untuk menjelaskan kontrak *webhook* dan *race condition* antar-*service*.

#### Q6. Mengapa pada tabel `order_items` atau `prescription_items` kita wajib menyimpan *snapshot* nama dan harga item, padahal sudah ada `product_id` / `medicine_id`?
- **Yang Diuji:** Pemahaman integritas data historis, akuntansi, dan dampak mutasi data master.
- **Poin Jawaban Kunci:**
  - Harga dan nama produk/obat di tabel master dapat berubah kapan saja oleh admin. Jika tabel detail transaksi hanya mengandalkan `JOIN` ke harga master saat ini, seluruh struk masa lalu, nilai pajak, dan laporan rekonsiliasi keuangan masa lalu akan ikut berubah dan menjadi korup!
  - Menyimpan `unit_price_snapshot` dan `item_name_snapshot` saat transaksi terjadi menjamin histori finansial & audit tetap *immutable* (lihat [Bab 08](../materi/08-data-modeling-erd-sql.md)).
- **Jebakan:** Menganggap menyimpan *snapshot* harga adalah duplikasi data yang melanggar normalisasi 3NF. *(Catatan Mid SA: ini adalah denormalisasi yang disengaja dan wajib untuk data transaksi historis!)*

#### Q7. Jelaskan perbedaan `PUT` vs `PATCH`, serta mengapa `Idempotency-Key` dan verifikasi *signature* penting pada integrasi pembayaran?
- **Yang Diuji:** Literasi teknis kontrak API dan keamanan integrasi pihak ketiga.
- **Poin Jawaban Kunci:**
  - **`PUT`** mengganti keseluruhan representasi *resource*, sedangkan **`PATCH`** memperbarui sebagian atribut tertentu (misal hanya mengubah `status` pesanan via `PATCH /api/v1/orders/{id}/status`).
  - **`Idempotency-Key`:** Jaringan bisa putus saat klien menunggu respons, lalu aplikasi klien melakukan *retry*. Tanpa *idempotency key*, server bisa membuat dua tagihan atau memotong stok dua kali. Pada *webhook*, gateway juga sering mengirim event ulang jika server kita lambat membalas; sistem harus membalas `200 OK` tanpa memproses efek samping ganda.
  - **Verifikasi Signature (HMAC):** Memastikan *callback* benar-benar dikirim oleh *Payment Gateway* resmi, bukan penyerang yang memalsukan status `PAID` via Postman.
- **Jebakan:** Memakai `GET` untuk aksi ubah data atau mengembalikan error `500` ketika menerima *webhook* duplikat (yang justru memicu gateway mengirim ulang terus-menerus).

#### Q8. Bagaimana Anda menjelaskan konsep *Race Condition* dan *Row-Level Locking* stok kepada manajer operasional yang non-teknis?
- **Yang Diuji:** Kemampuan komunikasi translasi bisnis–teknis (salah satu keahlian paling mahal dari seorang SA).
- **Poin Jawaban Kunci:**
  - Gunakan analogi nyata: *"Bayangkan tinggal ada 1 botol obat/kopi di rak. Kasir A melihat di layar stok masih 1, dan di detik yang sama pelanggan online B juga melihat stok masih 1. Tanpa penguncian, sistem mengizinkan keduanya membayar, padahal barangnya cuma satu."*
  - Jelaskan solusinya tanpa jargon berlebihan: *"Kita terapkan sistem antrean kunci satu per satu di level database: siapa yang lebih dulu sampai di baris stok itu mengunci barang selama sepersekian detik hingga selesai dicatat; yang datang sepersekian detik berikutnya langsung diberitahu stok sudah habis agar tidak terjadi jual-lebih (oversell)."*
- **Jebakan:** Membacakan sintaks `SELECT ... FOR UPDATE` dan *isolation level* ke manajer bisnis tanpa menjelaskan dampak bisnisnya.

---

### C. NFR, Change Request, & UAT (Q9–Q12)

#### Q9. Sebutkan 3 kategori NFR terpenting untuk sistem transaksi keuangan/kesehatan dan cara menulisnya agar dapat diuji!
- **Yang Diuji:** Kemampuan merancang ketahanan sistem di luar fitur fungsional (*happy path*).
- **Poin Jawaban Kunci:**
  1. **Performa/Latensi:** Misal waktu respons *p95* `<= 500 ms` pada beban puncak `150 RPS` (diuji via *load test* k6/JMeter).
  2. **Konkurensi & Integritas Data:** Operasi stok atomik dengan `0% oversell` pada 50 permintaan paralel; presisi kalkulasi uang tanpa selisih pembulatan (*HALF_UP*).
  3. **Keamanan & Auditabilitas:** RBAC terisolasi per cabang/peran, TLS 1.2+, serta `audit_logs` *append-only* (retensi minimal 5 tahun; untuk medis mencakup audit akses baca RME).
- **Jebakan:** Menyebutkan keamanan hanya sebatas *"pakai username dan password"*.

#### Q10. Jika bisnis meminta penambahan fitur baru pada aplikasi yang sudah *live* (misal integrasi kurir 3PL), apa saja 6 lapisan yang Anda periksa dalam *Impact Analysis*?
- **Yang Diuji:** Kedalaman *system thinking* agar perubahan tidak mematahkan sistem yang sudah berjalan (lihat [Bab 11](../materi/11-impact-analysis-cr-migrasi-batch.md)).
- **Poin Jawaban Kunci:**
  1. **UI/UX & Client Apps** (layar baru, validasi input, kompatibilitas aplikasi mobile versi lama).
  2. **Business Logic & State Machine** (status baru seperti `OUT_FOR_DELIVERY`, aturan refund baru).
  3. **API Contract & Versioning** (field opsional vs wajib agar tidak *breaking change*).
  4. **Database Schema & Data Eksisting** (tabel baru, kolom *nullable/default*, strategi *backfill*).
  5. **Integrasi Eksternal & Batch/Scheduler** (API/webhook pihak ketiga, timeout, retry).
  6. **Reporting, Audit, & Rekonsiliasi** (format laporan keuangan, pajak, ekspor ERP).
- **Jebakan:** Hanya mengecek dampaknya di UI dan Database tanpa memikirkan klien lama (*backward compatibility*), laporan keuangan, dan prosedur *rollback*.

#### Q11. Saat UAT H-1 sebelum *Go-Live*, QA menemukan dua bug: (A) salah eja label tombol "Konfimasi" dan (B) selisih pembulatan pajak Rp 1 pada laporan ekspor ERP. Bagaimana keputusan Anda di rapat *Defect Triage*?
- **Yang Diuji:** Ketajaman membedakan *Severity* vs *Priority* dan keberanian mengambil keputusan **Go / Conditional Go / No-Go**.
- **Poin Jawaban Kunci:**
  - **Bug A (Typo Label):** *Severity Minor*, *Priority P3/P4* -> Tidak menghambat fungsi atau keuangan; layak **Conditional Go** dan dijadwalkan perbaikan pada *patch* pasca-rilis.
  - **Bug B (Selisih Rp 1 di Ekspor ERP):** *Severity Critical*, *Priority P1* -> **NO-GO (Blocker Rilis)**. Meski nilainya hanya Rp 1 per transaksi, pada ribuan transaksi per hari akan muncul selisih ribuan Rupiah yang menyebabkan rekonsiliasi akuntansi/ERP gagal ditutup. Wajib diperbaiki dan di-retest ulang sebelum *Go-Live*.
- **Jebakan:** Menganggap selisih Rp 1 itu sepele (*"cuma serupiah kok"*).

#### Q12. Bagaimana strategi migrasi data yang aman jika perubahan skema database harus dilakukan pada sistem yang beroperasi 24 jam?
- **Yang Diuji:** Kesadaran operasional (*zero-downtime deployment* & *rollback*).
- **Poin Jawaban Kunci:**
  - Hindari perubahan destruktif sekaligus (*rename/drop* kolom yang masih dipakai kode versi lama).
  - Gunakan pola bertahap (*expand-and-contract*): (1) tambah tabel/kolom baru secara *nullable* atau ber-default aman; (2) *backfill* data lama per batch kecil agar tidak mengunci tabel produksi; (3) deploy kode baru di balik *feature flag* pada 1 cabang *pilot* dulu; (4) siapkan kriteria & langkah *rollback* (matikan flag tanpa menghapus data baru).
- **Jebakan:** Menyarankan *"matikan saja server semalaman dan jalankan `ALTER TABLE` sekaligus `DROP COLUMN`"* tanpa rencana pemulihan.

---

### D. Behavioral / Situational — Metode STAR (Q13–Q16)

> **Tips Menjawab Pertanyaan Behavioral:** Gunakan pola **STAR (*Situation – Task – Action – Result*)**. Jika Anda belum punya pengalaman kerja SA formal, Anda **boleh** menggunakan pengalaman proyek *capstone*, magang, tugas akhir, atau pengalaman kerja IT sebelumnya (seperti QA/Developer/Support) selama menekankan peran analitis Anda.

#### Q13. Ceritakan pengalaman ketika developer salah memahami spesifikasi Anda sehingga hasil implementasinya melenceng dari harapan user. Apa yang Anda lakukan?
- **Yang Diuji:** Rasa kepemilikan (*ownership*), tidak saling menyalahkan, dan perbaikan proses dokumentasi.
- **Arah Jawaban Kuat:** Akui celah pada spesifikasi awal (misal tidak mencantumkan *exception flow* atau contoh JSON respons gagal), segera selaraskan ulang dengan dev + QA lewat *walkthrough* singkat, perbaiki dokumen FSD/Screen Spec dengan contoh data nyata, dan tambahkan mekanisme *3-Amigos Grooming* (PM/SA–Dev–QA) sebelum *coding* agar kejadian serupa tidak berulang.

#### Q14. Bagaimana Anda menghadapi *Business User* yang menolak menandatangani UAT karena di hari terakhir tiba-tiba merasa *"alurnya tidak sesuai bayangan saya"*?
- **Yang Diuji:** Keterampilan manajemen ekspektasi dan pemanfaatan *audit trail* dokumentasi.
- **Arah Jawaban Kuat:** Dengarkan keluhan spesifiknya dan pisahkan dua hal: apakah sistem melanggar kontrak `SRS/BRD` yang sudah disetujui (*Defect* yang wajib diperbaiki), atau merupakan keinginan baru di luar kesepakatan awal (*Change Request*). Tunjukkan bukti prototipe/BRD yang telah disepakati bersama; jika masuk kategori kebutuhan baru yang tidak menghalangi operasional dasar, tawarkan **Conditional Go** agar proyek rilis dulu sambil membawa perbaikan tersebut ke rilis cepat (*Sprint* berikutnya).

#### Q15. Ceritakan momen ketika Anda menemukan risiko atau *edge case* penting yang awalnya tidak disadari tim maupun klien.
- **Yang Diuji:** Proaktivitas dan insting analitis seorang SA.
- **Arah Jawaban Kuat:** Ceritakan skenario spesifik (misal perbedaan zona waktu WIB/WITA pada tutup kasir harian, atau skenario *late payment webhook* sesudah TTL 15 menit kedaluwarsa), bagaimana Anda membuktikannya lewat simulasi data/diagram, dan bagaimana solusi Anda menyelamatkan proyek dari bug produksi atau kebocoran finansial.

#### Q16. Anda ditugaskan menganalisis domain bisnis yang benar-benar baru (misal asuransi syariah atau logistik pelabuhan) dengan tenggat 1 minggu sebelum *kickoff*. Bagaimana cara Anda belajar cepat?
- **Yang Diuji:** Metodologi belajar mandiri dan struktur investigasi domain.
- **Arah Jawaban Kuat:** Mulai dari memahami **model bisnis & arus uang/dokumen utama**, pelajari regulasi wajib dan kamus istilah (*glossary*) domain tersebut, petakan aktor + proses *As-Is* yang paling menyakitkan, siapkan daftar pertanyaan terfokus sebelum rapat wawancara (bukan bertanya *"sistemnya mau kayak gimana?"*), lalu validasi pemahaman Anda lewat draf visual (Flowchart/Wireframe kasar) karena user jauh lebih cepat mengoreksi gambar daripada membaca 20 halaman teks.

---

## Bagian 2: Kerangka Menjawab *Live-Case* dalam 30 Menit

Pada interview level Junior–Mid, sering ada sesi **Live-Case / Whiteboard Design** selama 30–45 menit. Jangan langsung melompat menggambar tabel database di menit pertama! Ikuti kerangka **5 Langkah Senior SA** berikut sambil berpikir keras (*thinking out loud*):

1. **Menit 0–5 | Klarifikasi & Kunci Batasan (*Clarify & Scope*):** Ajukan 3–5 pertanyaan tajam (siapa aktornya, skala beban/pengguna, metode pembayaran/integrasi eksternal, aturan bisnis kritis, dan apa yang sengaja *out-of-scope* Fase 1).
2. **Menit 5–12 | Pemetaan Alur & Siklus Status (*Process & State Machine*):** Gambarkan alur utama lintas aktor (mulai dari pemicu hingga selesai), lalu kunci status entitas inti (`stateMachine`) agar tidak ada transisi ilegal.
3. **Menit 12–20 | Desain Data & Kontrak API (*ERD & API*):** Sebutkan entitas utama + relasi kuncinya (termasuk tabel mutasi/audit dan kolom *snapshot*), lalu rancang 2–3 endpoint kritis lengkap dengan `Idempotency` / kode error utama.
4. **Menit 20–26 | Kasus Tepi, Konkurensi, & Keamanan (*Edge Cases & NFR*):** Inilah poin penentu nilai *Mid SA*! Bahas secara proaktif: *race condition*, *timeout/retry*, zona waktu, dan *RBAC/privacy*.
5. **Menit 26–30 | Strategi Pengujian & Rilis (*EP/BVA & UAT*):** Tutup dengan 2–3 skenario uji batas kritis dan cara memastikan kesiapan *Go-Live*.

---

## Bagian 3: 3 Simulasi *Live-Case Interview* Utuh

### Live Case 1 (Level Junior–Mid): Sistem *Flash Sale* Voucher Terbatas
**Prompt Pewawancara:**
> *"Perusahaan ritel kami ingin membuat fitur klaim voucher diskon 50% tepat pukul 12.00 WIB. Hanya tersedia 100 kuota voucher, dan diperkirakan akan ada 10.000 pengguna yang menekan tombol 'Klaim' secara bersamaan di detik pertama. Setiap akun hanya boleh mengklaim maksimal 1 voucher. Jika tidak dipakai checkout dalam 30 menit, voucher hangus dan kuota kembali lagi. Tolong rancang analisis sistemnya."*

**Solusi Terstruktur ala Senior SA:**
1. **Klarifikasi & Scope:**
   - Apakah 100 kuota bersifat nasional atau per cabang? *(Asumsi: nasional di satu pool kuota).*
   - Apakah klaim berbayar atau gratis? *(Gratis, tetapi langsung terikat ke `user_id` tertentu).*
   - Apakah pengguna harus login? *(Wajib terautentikasi agar aturan "1 akun 1 voucher" dapat ditegakkan).*
2. **State Machine Voucher Klaim (`voucher_claims.status`):**
   - `CLAIMED` (kuota berkurang, TTL 30 menit berjalan) -> `APPLIED` (saat order masuk `PENDING_PAYMENT` / `PAID`) -> `REDEEMED` (order sukses `PAID`).
   - Dari `CLAIMED` bisa ke `EXPIRED` (lewat 30 menit tidak dipakai) atau `RELEASED` (jika order dibatalkan sebelum bayar), lalu kuota dikembalikan ke pool (*restored*).
3. **Desain Entitas & Endpoint Kritis:**
   - Tabel: `vouchers` (`id`, `total_quota`, `remaining_quota`, `starts_at`, `ends_at`), `voucher_claims` (`id`, `voucher_id`, `user_id`, `status`, `expires_at` — dengan **`UNIQUE (voucher_id, user_id)`** untuk mencegah 1 user dapat 2 voucher saat *double click*!).
   - Endpoint: `POST /api/v1/vouchers/{voucherId}/claim` (wajib *auth token* + *rate limiting* per user/IP).
4. **Penanganan Konkurensi & Edge Case (Kunci Nilai Tinggi!):**
   - **Mengatasi 10.000 RPS & Race Condition:** Jika 10.000 request langsung menghantam `SELECT ... FOR UPDATE` satu baris di DB relasional, koneksi DB akan macet (*lock contention*). Jelaskan opsi bertingkat: gunakan **Redis atomic decrement (`DECR` / Lua script)** atau antrean cepat di lapis cache sebagai gerbang kuota awal sebelum menulis ke DB, **atau** mekanisme *optimistic locking / conditional atomic update* (`UPDATE vouchers SET remaining_quota = remaining_quota - 1 WHERE id = ? AND remaining_quota > 0`) disertai indeks `UNIQUE (voucher_id, user_id)` di DB sebagai jaring pengaman terakhir!
   - **Zona Waktu:** Pastikan `starts_at` dan `expires_at` disimpan UTC dan tombol "Klaim" di klien tidak mengandalkan jam lokal HP pengguna (yang bisa dimanipulasi mundur/maju), melainkan divalidasi ketat oleh jam server!
   - **Kasus Tepi Checkout di Menit ke-29:** Jika user memakai voucher di menit ke-29 untuk order dengan TTL bayar 15 menit, kunci status klaim menjadi `LOCKED_FOR_PAYMENT` agar scheduler voucher 30 menit tidak menghanguskan voucher di tengah proses pembayaran order.
5. **Skenario Uji BVA/EP:**
   - Uji *concurrency*: 500 request paralel pada `remaining_quota = 5` -> tepat `5` sukses (`201`), `495` ditolak `409 ERR_QUOTA_EXHAUSTED`.
   - Uji 1 user kirim 2 request paralel bersamaan -> hanya 1 sukses, 1 ditolak `409 ERR_ALREADY_CLAIMED`.
   - Uji waktu klaim `11:59:59 WIB` (ditolak) vs `12:00:00 WIB` (diterima), serta pemakaian di `29m59s` vs `30m01s`.

---

### Live Case 2 (Level Mid): Fitur *Split Payment* & *Partial Refund* pada Marketplace Jasa
**Prompt Pewawancara:**
> *"Di platform jasa kebersihan rumah kami, pelanggan bisa membayar satu tagihan Rp 500.000 menggunakan gabungan Saldo Dompet Aplikasi (Rp 200.000) dan QRIS (Rp 300.000). Jika di lokasi ternyata pekerjaan tambahan batal sehingga ada pengembalian dana parsial sebesar Rp 150.000, bagaimana Anda merancang model data, alur pembayaran, dan aturan pengembalian dananya?"*

**Solusi Terstruktur ala Senior SA:**
1. **Klarifikasi & Scope:**
   - Prioritas sumber dana saat *partial refund*: mana yang dikembalikan lebih dulu—mengembalikan ke Saldo Dompet dulu atau proporsional, atau ke kanal bayar tunai/QRIS terakhir? *(Wajib dikunci bersama Finance/Legal; praktik umum: kembalikan ke Dompet internal terlebih dahulu karena instan & tanpa biaya transfer bank, atau proporsional sesuai kebijakan CS—yang terpenting aturan ini eksplisit dan konsisten).*
   - Apakah order baru dianggap `PAID` setelah *kedua* komponen bayar lunas? *(Ya!).*
2. **Alur Pembayaran Gabungan (*Two-Leg Payment*) & Jebakan Gagal Separuh:**
   - Jangan memotong Saldo Dompet permanen tanpa rencana pemulihan jika pembayaran QRIS gagal atau *expired*!
   - Pola aman: (1) **Hold/Reserve Saldo Dompet (`WALLET_HOLD`)** sebesar Rp 200.000 dalam transaksi DB atomik; (2) Terbitkan tagihan QRIS Rp 300.000 (`PENDING_PAYMENT`, TTL 15m); (3) Saat *webhook* QRIS sukses tiba secara *idempotent*, konfirmasi *hold* Dompet menjadi `DEDUCTED` dan ubah order menjadi `PAID`; (4) Jika QRIS gagal/*expired*, scheduler otomatis melepaskan `WALLET_HOLD` kembali ke saldo tersedia pelanggan (`WALLET_RELEASE`).
3. **Desain Data (1 Order -> Banyak `payment_legs` & `refunds`):**
   - Pisahkan header `orders` (`total_amount = 500000`) dari tabel anak **`payment_allocations` / `payments`** (1 baris untuk `WALLET` Rp 200.000, 1 baris untuk `QRIS` Rp 300.000, masing-masing punya `idempotency_key` dan status sendiri).
   - Tabel **`refunds`** dan **`refund_allocations`** mencatat dengan presisi dari `payment_id` mana dana Rp 150.000 dikembalikan, agar **total akumulasi refund tidak pernah melebihi `paid_amount`** (`SUM(refunded) + new_refund <= original_payment_amount`).
4. **Rekonsiliasi & Edge Case:**
   - Cek kondisi *race*: dua admin CS mengklik *partial refund* Rp 150.000 + Rp 400.000 secara bersamaan pada order Rp 500.000! Wajib gunakan `SELECT ... FOR UPDATE` pada baris `orders` saat menghitung sisa *refundable amount*.
   - Seluruh angka dalam `BIGINT` Rupiah (tanpa floating point) agar tidak ada selisih sen saat rekonsiliasi Finance.

---

### Live Case 3 (Level Mid): Integrasi Sistem Kasir Klinik dengan API Klaim Asuransi/BPJS yang Sering Lambat/Down
**Prompt Pewawancara:**
> *"Sistem kasir klinik kami harus memverifikasi status kepesertaan dan mengirim klaim ke API sistem Asuransi/BPJS pihak ketiga. Masalahnya, API pihak ketiga tersebut sering lambat (kadang merespons 15 detik) atau down 30 menit saat jam sibuk pagi. Bagaimana rancangan integrasi Anda agar antrean kasir klinik tidak ikut macet total?"*

**Solusi Terstruktur ala Senior SA:**
1. **Identifikasi Akar Masalah Arsitektur:**
   - Memanggil API pihak ketiga yang lambat secara **sinkron (*blocking*)** di tengah transaksi kasir akan membuat layar kasir *hang*, koneksi server habis (*thread exhaustion*), dan antrean pasien mengular di lobi.
2. **Pemisahan Alur Kritis (*Sync* vs *Async Decoupling*):**
   - **Tahap 1 — Cek Kepesertaan saat Pendaftaran/Check-in (Cepat dengan Timeout Ketat & Fallback):**
     - Panggil API verifikasi kepesertaan dengan **timeout ketat (misal `3 detik`)** dan simpan hasil verifikasi sementara (*short-lived cache* harian per nomor kartu).
     - Jika API pihak ketiga *timeout / 5xx* (*Circuit Breaker* terbuka), aktifkan **Mode Degradasi Terkontrol (*Graceful Degradation*)**: FO tetap bisa mendaftarkan pasien dengan verifikasi fisik kartu/aplikasi peserta oleh petugas (*manual override* + unggah bukti foto + status `VERIFICATION_PENDING_SYNC` dan tercatat di `audit_logs`) daripada menolak pasien sakit!
   - **Tahap 2 — Pengiriman Pengajuan Klaim Pasca-Layanan (100% Asinkron via Queue/Outbox):**
     - Saat kasir menyelesaikan kunjungan pasien, sistem menyimpan invoice berstatus `CLAIM_QUEUED` secara lokal dalam transaksi DB cepat (`< 200 ms`) bersama **Transactional Outbox / Message Queue**.
     - *Background Worker* mengirimkan klaim ke API eksternal di belakang layar dengan kebijakan **Exponential Backoff Retry** (misal coba ulang di detik ke-30, 2m, 10m, 30m) dan menyertakan **`Idempotency-Key` / `claim_reference_no`** agar percobaan ulang tidak menggandakan klaim.
3. **Pemantauan, Rekonsiliasi, & Operasional Support:**
   - Jika setelah batas maksimal *retry* (misal 5x) tetap gagal atau ditolak secara bisnis (*rejected*), pindahkan status ke `CLAIM_FAILED_NEEDS_REVIEW` dan tampilkan di **Dashboard Rekonsiliasi Admin Klaim** lengkap dengan pesan alasan penolakan agar bisa diperbaiki dan dikirim ulang (*manual re-trigger*).
   - Sediakan **Alerting** ke tim Ops/IT bila *error rate* API eksternal menembus ambang batas (misal `> 20%` dalam 5 menit).

---

**Langkah Berikutnya:**
- Simpan dan gunakan [**Cheat Sheet System Analyst**](cheat-sheet-system-analyst.md) sebagai lembar referensi cepat harian Anda.
- Pastikan portofolio *MedikaLink* Anda siap memukau pewawancara lewat [**Panduan Menyusun Portofolio System Analyst Siap Lamar**](panduan-portofolio-sa.md).
- Kembali ke [Peta Kurikulum & Kamus Domain (`README.md`)](../README.md).
