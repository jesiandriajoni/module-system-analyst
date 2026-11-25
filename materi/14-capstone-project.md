# Bab 14 — Capstone Project Mandiri: MedikaLink

> **Ringkasan Posisi Bab:** Di Bab 01–13, Anda belajar mengikuti jejak terstruktur *NusaPOS & OrderHub* yang batasannya sudah rapi. Di dunia kerja nyata, seorang System Analyst hampir tidak pernah menerima dokumen kebutuhan yang bersih. Anda akan masuk ke ruangan rapat berisi empat pemangku kepentingan yang saling bersilang pendapat, mendengar keluhan operasional yang tumpang-tindih, lalu harus merangkainya menjadi spesifikasi sistem yang aman, konsisten, dan siap dibangun. **MedikaLink** adalah ujian kelulusan mandiri Anda untuk membuktikan kesiapan di level **Junior hingga Mid System Analyst**.

---

## 1. Tujuan Belajar & Aturan Main Capstone

Setelah menuntaskan proyek *capstone* ini secara mandiri, Anda diharapkan mampu:

1. **Menggali dan mendamaikan kebutuhan yang kontradiktif** dari berbagai *stakeholder* bisnis, medis, farmasi, dan operasional kasir tanpa mengorbankan regulasi maupun integritas data.
2. **Mendeteksi kasus tepi tersembunyi (*hidden edge cases*)** sejak fase analisis—sebelum developer menulis satu baris kode pun.
3. **Menghasilkan paket artefak analisis sistem *end-to-end*** yang saling terhubung melalui **RTM (*Requirement Traceability Matrix*)** menggunakan standar [`../templates/`](../templates/template-brd.md).
4. **Mengevaluasi kualitas pekerjaan sendiri secara objektif** menggunakan rubrik skala **Junior vs Mid System Analyst**.

### Aturan Main Pengerjaan Mandiri
- **Kerjakan terlebih dahulu sebelum membuka kunci:** Jangan langsung membaca [`../kunci-latihan/kunci-capstone-ringkas.md`](../kunci-latihan/kunci-capstone-ringkas.md). Catat seluruh asumsi, pertanyaan terbuka (*open questions*), dan keputusan resolusi konflik Anda sendiri.
- **Gunakan template resmi:** Salin struktur dari folder [`../templates/`](../templates/template-brd.md) dan jadikan folder [`../studi-kasus/`](../studi-kasus/01-brd-nusapos.md) sebagai tolok ukur kedalaman penulisan, bukan untuk disalin mentah.
- **Fokus pada keterlacakan (*traceability*):** Setiap kode kebutuhan (`FR`, `NFR`) yang Anda tetapkan wajib muncul konsisten di Use Case, ERD, Screen Spec, API Contract, hingga skenario UAT.

---

## 2. Konteks Bisnis & Ekosistem Klinik **MedikaLink**

**PT MedikaPrima Nusantara** mengoperasikan jaringan **6 klinik rawat jalan multi-spesialis** yang tersebar di beberapa zona waktu Indonesia:
- 4 klinik di Jabodetabek & Bandung (`CLN-JKT-01`, `CLN-JKT-02`, `CLN-BGR-01`, `CLN-BDG-01` — zona waktu **`Asia/Jakarta` / WIB**).
- 2 klinik di Bali & Makassar (`CLN-DPS-01`, `CLN-MKS-01` — zona waktu **`Asia/Makassar` / WITA**).

### Profil Operasional Saat Ini (*As-Is*)
Setiap klinik memiliki layanan **Poli Umum, Poli Gigi, Poli Anak, Poli Penyakit Dalam, dan Poli Kandungan (Obgyn)** dengan total 42 dokter praktik, **1 unit Farmasi (Apotek) internal**, serta **meja Front-Office & Kasir**. Pasien terdiri dari tiga skema penjaminan pembayaran:
1. **Pasien Umum (*Self-Pay*):** Membayar penuh via Tunai, QRIS, atau Kartu Debit/EDC.
2. **Pasien Asuransi Swasta:** Ditanggung sebagian/penuh sesuai plafon polis, dengan potensi selisih tagihan (*excess*).
3. **Pasien BPJS Kesehatan:** Ditanggung paket layanan Fasilitas Kesehatan Tingkat Pertama (FKTP) / rujukan poli sesuai aturan formularium nasional, namun sering membeli obat tambahan atau suplemen di luar tanggungan BPJS secara mandiri.

Saat ini seluruh klinik masih menggunakan kombinasi formulir kertas, pesan WhatsApp manual untuk pendaftaran, aplikasi spreadsheet jadwal dokter, serta aplikasi kasir apotek yang terpisah dari catatan dokter. Akibatnya:
- Antrean ruang tunggu membludak pada jam sibuk pagi (07.30–11.00 waktu setempat).
- Sering terjadi bentrok antara pasien daftar online (*via* WhatsApp) dan pasien datang langsung (*walk-in*).
- Pasien sudah menunggu lama di apotek, baru diberi tahu bahwa obat yang diresepkan dokter stoknya kosong.
- Tim keuangan pusat kesulitan menutup laporan harian karena data transaksi klinik di Bali/Makassar tercampur dengan jam server Jakarta.

Manajemen memutuskan membangun sistem terpadu bernama **MedikaLink (Fase 1)** yang mencakup: **Manajemen Jadwal Dokter, Janji Temu & Antrean Multi-Klinik, Catatan Konsultasi/Rekam Medis Elektronik (RME) Dasar, Resep & Pengelolaan Stok Farmasi, serta Kasir/Penagihan & Rekonsiliasi Harian.**

---

## 3. Transkrip Wawancara 4 Stakeholder *(Mengandung Kontradiksi & Jebakan)*

Baca keempat transkrip hasil *elicitation workshop* di bawah ini dengan sangat teliti. Sebagai System Analyst, tugas pertama Anda adalah membedakan antara **fakta regulasi**, **keinginan bisnis yang sah**, **asumsi keliru**, dan **konflik kepentingan antar-unit**.

### Wawancara 1 — dr. Hendra Wijaya (Pemilik Klinik & Sponsor Proyek)
> *"Tujuan saya bangun MedikaLink ini jelas: utilisasi jam praktik dokter harus naik dan kebocoran pendapatan harus nol. Saya ingin pasien bisa booking jadwal dokter lewat aplikasi web/mobile, pilih poli dan klinik (`clinic_id`), lalu dapat nomor antrean pasti.*
>
> *Soal disiplin waktu, saya tidak mau dokter menunggu pasien yang tidak jelas. Kalau pasien online telat lebih dari 15 menit dari jam janjinya, langsung hanguskan saja statusnya dan masukkan pasien walk-in biar ruang periksa tidak kosong! Jangan kasih celah tawar-menawar.*
>
> *Satu lagi, supaya pelayanan cepat dan tidak saling lempar tanggung jawab di meja depan, saya ingin **semua staf front-office, kasir, dan perawat bisa melihat riwayat kunjungan dan catatan diagnosis pasien** begitu pasien menyebutkan NIK atau nomor rekam medisnya. Malam hari jam 22.00 saya juga ingin satu dashboard ringkasan omzet harian seluruh 6 klinik langsung jadi di HP saya."*

### Wawancara 2 — dr. Ratna Kusuma, Sp.PD (Kepala Komite Medis & Dokter Penanggung Jawab)
> *"Saya mendukung sistem antrean digital, tapi saya **menolak keras** usulan agar staf front-office atau kasir bisa membuka isi catatan klinis, keluhan, maupun kode diagnosis ICD-10 pasien! Itu melanggar sumpah kerahasiaan medis, Permenkes tentang Rekam Medis Elektronik, dan UU Pelindungan Data Pribadi (UU PDP). Admin dan kasir cukup melihat identitas dasar pasien, jadwal poli, daftar tindakan yang ditagihkan, dan total biaya—titik! Hanya dokter yang menangani dan tenaga medis berwenang di unit terkait yang boleh membuka rekam medis, dan setiap kali data itu dibuka harus tercatat siapa yang membuka.*
>
> *Lalu tolong pikirkan realita praktik dokter. Saya sering mengalami tindakan medis pasien sebelumnya lebih lama dari perkiraan, atau macet di perjalanan dari rumah sakit lain, sehingga baru mulai praktik telat 30 menit. Kalau sistem otomatis menghanguskan pasien hanya karena lewat 15 menit dari jam jadwal awal padahal dokternya sendiri belum masuk ruangan, pasien akan mengamuk di front-office!*
>
> *Juga bagaimana kalau dokter mendadak sakit atau ada operasi darurat sehingga harus cuti mendadak hari itu? Pasien yang sudah booking tidak boleh terbengkalai. Terakhir soal resep: kalau obat habis di apotek, **apoteker dilarang keras mengubah dosis atau mengganti zat aktif/jenis obat seenaknya** tanpa persetujuan dokter penulis resep. Paling jauh apoteker hanya boleh mengusulkan penggantian merek dagang dengan kandungan zat aktif dan kekuatan dosis yang identik, itu pun wajib ada persetujuan dan jejak persetujuannya."*

### Wawancara 3 — Apt. Budi Santoso, S.Farm (Kepala Unit Farmasi / Apotek)
> *"Masalah terbesar kami tiap hari adalah dokter menulis resep tanpa pernah tahu stok obat di lemari farmasi cabang itu masih ada atau kosong! Pasien sudah mengantre 40 menit di apotek, baru ketahuan amoksisilin merek tertentu habis. Kalau harus telepon atau lari ke ruang poli untuk minta ganti resep di tengah antrean panjang, farmasi lumpuh.*
>
> *Selain itu, tidak semua pasien menebus seluruh resep di klinik kami. Ada pasien umum yang uangnya pas-pasan sehingga **hanya mau menebus separuh obat** dulu (misal antibiotiknya saja, vitaminnya dibeli di luar—butuh salinan resep / copy resep), atau membatalkan item tertentu. Sistem lama memotong stok seluruh isi resep begitu dokter klik simpan, akibatnya stok di sistem minus terus saat pasien tidak jadi tebus!*
>
> *Hati-hati juga di jam sibuk: Poli Umum dan Poli Anak sering meresepkan obat sirup yang sama secara bersamaan ketika stok di cabang tersisa tinggal 2 botol. Dua resep masuk ke apotek, kasir menagih keduanya, lalu apoteker bingung karena botol fisiknya cuma 2."*

### Wawancara 4 — Siti Aminah (Koordinator Admin Front-Office & Kasir)
> *"Di lapangan tidak semudah hitungan aplikasi, Pak/Bu Analyst. Setiap pagi mulai jam 06.30, pasien lansia dan pasien BPJS sudah mengantre di depan pintu untuk mengambil nomor walk-in poli yang baru buka jam 08.00. Kalau semua slot jam praktik dokter diisi pasien booking online, pasien walk-in tidak kebagian tempat dan ribut di lobi. Sebaliknya kalau walk-in diberi nomor awal terus, pasien online yang sudah booking jauh-jauh hari protes karena harus menunggu belasan orang.*
>
> *Kemudian soal pembayaran: pasien BPJS itu tagihan poli dan obat formulariumnya ditanggung klaim paket BPJS (tidak bayar tunai di kasir), tetapi dokter kadang meresepkan obat tambahan di luar tanggungan BPJS yang harus dibayar sendiri oleh pasien pakai QRIS atau tunai! Jadi satu kunjungan bisa menghasilkan tagihan gabungan (*split billing*).*
>
> *Satu kendala lagi yang sering bikin tim keuangan marah: klinik di Denpasar (WITA) dan Makassar (WITA) sering tutup operasional jam 21.30 WITA, tapi laporan kasir kemarin selalu memasukkan transaksi jam 23.15 WITA ke hari berikutnya atau sebaliknya karena jam server terpusat ikut Jakarta. Tolong jangan sampai tutup buku kasir antar-cabang salah tanggal lagi."*

---

## 4. Tantangan Analisis: Kontradiksi & Kasus Tepi Tersembunyi

Sebelum mulai menggambar diagram atau menulis spesifikasi, Anda harus mengekstrak dan memecahkan **seluruh jebakan** yang tersembunyi di dalam empat wawancara di atas:

1. **Kontradiksi Antar-Stakeholder (Wajib Diputus dengan Alasan Hukum/Bisnis):**
   - Akses Rekam Medis: Pemilik Klinik ingin keterbukaan penuh untuk kecepatan layanan vs Kepala Medis melarang demi regulasi RME & UU PDP.
   - Aturan *No-Show* 15 Menit: Pemilik ingin hangus otomatis berbasis jam jadwal vs realita dokter sering terlambat praktik.
   - Otonomi Penggantian Obat: Pemilik/Farmasi ingin cepat saat obat kosong vs Kepala Medis melarang penggantian zat aktif tanpa persetujuan dokter.
   - Alokasi Slot Online vs Walk-In: Kepastian jadwal *online* vs kebiasaan pasien lansia/BPJS *walk-in* datang subuh.

2. **Kasus Tepi Tersembunyi (*Hidden Edge Cases* yang Sering Terlewat Junior SA):**
   - **Keterlambatan & Cuti Mendadak Dokter:** Bagaimana nasib antrean dan penghitung waktu *no-show* jika dokter telat, atau jika dokter batal praktik mendadak (*emergency leave*) ketika 15 pasien sudah berstatus `BOOKED`?
   - **Pasien Hadir Terlalu Awal:** Pasien *walk-in* datang jam 06.30 untuk jadwal poli 08.00, apakah langsung masuk status antrean periksa dan menggeser pasien *online* slot 08.00?
   - **Perebutan Stok Obat Terakhir (*Concurrency*) & Resep Tidak Ditebus:** Kapan tepatnya stok obat di-*reserve* vs di-*deduct* agar tidak terjadi *overselling* antar-poli sekaligus tidak menahan stok selamanya jika pasien kabur atau hanya menebus parsial?
   - **Penebusan Resep Parsial (*Partial Dispense*) & *Copy Resep*:** Bagaimana dampak ke status resep, pemotongan stok, salinan resep digital, dan nominal tagihan kasir?
   - **Split Billing (Penjamin BPJS/Asuransi + *Out-of-Pocket*):** Bagaimana satu kunjungan (`encounter/appointment`) menghasilkan dua komponen penagihan yang berbeda metode pelunasan dan rekonsiliasinya?
   - **Multi-Timezone (`Asia/Jakarta` vs `Asia/Makassar`):** Bagaimana penyimpanan timestamp jadwal praktik dokter, antrean harian, TTL reservasi, dan tanggal tutup buku (`daily_reconciliations`) per `clinic_id`?

---

## 5. Daftar 8 Deliverable Wajib (*Portfolio-Grade*)

Susunlah kedelapan artefak berikut untuk cakupan **Fase 1 MedikaLink**. Gunakan penamaan ID kanonik buatan Anda sendiri secara konsisten (misal `ML-FR-01`, `ML-NFR-01`, `ML-UC-01`, `SCR-ML-001`) agar mudah dilacak dari awal hingga akhir.

| No | Deliverable | Template / Referensi Acuan | Cakupan & Syarat Minimum yang Wajib Ada |
| :---: | :--- | :--- | :--- |
| **1** | **BRD Ringkas, Conflict Resolution Log, & RTM Awal** | [`../templates/template-brd.md`](../templates/template-brd.md) | Masalah bisnis, KPI terukur (*SMART*), *Scope* Fase 1 vs *Out-of-Scope*, **Tabel Resolusi Konflik 4 Stakeholder** (minimal 4 konflik lengkap dengan keputusan & dasar hukum/bisnis), dan kerangka **RTM**. |
| **2** | **BPMN 2.0 To-Be End-to-End** | [Bab 04 — Process Modeling](04-process-modeling-flowchart-bpmn.md) | Diagram alur lintas *swimlane* (`Pasien`, `Front-Office/Kasir`, `Dokter`, `Farmasi`, `Sistem/Payment Gateway`) dari pendaftaran (*online* & *walk-in*), *check-in*, konsultasi, penerbitan resep (termasuk cabang obat kosong), penebusan parsial, hingga pembayaran & penyerahan obat. |
| **3** | **SRS Ringkas, Use Case Spec (2 Inti), & State Machine** | [`../templates/template-srs.md`](../templates/template-srs.md), [`../templates/template-use-case.md`](../templates/template-use-case.md) | Daftar `FR` & `NFR` terukur (anti kata kabur IEEE 29148), **2 Use Case Specification lengkap** (1: Pendaftaran, Check-in, & Penanganan Keterlambatan/No-Show; 2: Peresepan Dokter, Validasi Stok Farmasi, & Penebusan Parsial), serta **State Machine (`stateDiagram-v2`)** siklus janji temu/antrean dan status resep. |
| **4** | **Data Modeling (ERD) & UI/Screen Specification** | [`../templates/template-screen-spec.md`](../templates/template-screen-spec.md), [Bab 08 — Data Modeling](08-data-modeling-erd-sql.md) | **ERD (`erDiagram`)** lengkap dengan pemisahan tabel `medical_records` vs `appointments/invoices`, tabel stok farmasi cabang, *snapshot* harga/dosis pada item resep, kolom *timezone* klinik, dan `audit_logs`. Sertakan **2 Screen Spec lengkap 5 State + Field-Level Mapping UI–API–DB** (layar input resep dokter dengan indikator stok & layar kasir *split billing* / tebus parsial). |
| **5** | **API Contract & NFR Keamanan/Privasi Rekam Medis** | [`../studi-kasus/03-api-contract-nusapos.md`](../studi-kasus/03-api-contract-nusapos.md), [Bab 09](09-api-integration-system-design.md), [Bab 10](10-nfr-security-concurrency.md) | Spesifikasi **5 endpoint REST inti** (method, path, payload, RBAC, `Idempotency-Key`, amplop error standar), **matriks hak akses data (*RBAC Field Visibility Matrix*)** untuk memblokir kebocoran diagnosis ICD-10 ke kasir/admin, serta aturan *audit logging* akses baca (*read audit*) rekam medis. |
| **6** | **FSD Modul Kritis: Reservasi Stok Obat & Penebusan Parsial** | [`../templates/template-fsd.md`](../templates/template-fsd.md) | **Sequence Diagram** sinkron-asinkron alur penulisan resep -> pengecekan & penguncian stok (`SELECT ... FOR UPDATE`) -> substitusi obat/tebus parsial -> pelunasan *split billing* (BPJS + QRIS/Tunai) -> pelepasan sisa reservasi item yang tidak ditebus. |
| **7** | **Change Request (CR) Impact Analysis & Batch Rekonsiliasi Multi-Timezone** | [`../templates/template-cr-impact-analysis.md`](../templates/template-cr-impact-analysis.md), [Bab 11](11-impact-analysis-cr-migrasi-batch.md) | Analisis dampak **6 lapisan sistem** untuk skenario CR Fase 2 (*misal: Integrasi Bridging BPJS Antrean Online / Rujukan atau Telekonsultasi Video*) beserta strategi *backward compatibility* & *rollback*, ditambah spesifikasi **batch rekonsiliasi harian** yang memisahkan hari bisnis `Asia/Jakarta` dan `Asia/Makassar` tanpa selisih pembulatan. |
| **8** | **UAT Script, EP/BVA Test Cases, & Go/No-Go Checklist** | [`../templates/template-uat.md`](../templates/template-uat.md), [Bab 13](13-uat-testing-handover.md) | Minimal **8 skenario UAT** dengan teknik **EP & BVA** (wajib mencakup batas 15 menit *no-show* saat dokter tepat waktu vs telat, batas stok obat tinggal 1, penebusan parsial, penolakan RBAC kasir mengakses RME, dan *cut-off* transaksi jam `23:55 WITA`), lengkap dengan *Exit Criteria* dan *Defect Triage Rule*. |

---

## 6. Rubrik Evaluasi Mandiri (Skala Junior vs Mid System Analyst)

Setelah menyelesaikan kedelapan deliverable, nilai hasil kerja Anda secara jujur menggunakan rubrik terukur di bawah ini. Jangan hanya memeriksa "apakah dokumennya ada", tetapi periksa **kedalaman penalaran dan ketahanan terhadap skenario gagal**.

| Deliverable | Belum Layak *(Perlu Revisi)* | Level Junior SA *(Lulus Dasar)* | Level Mid SA *(Siap Produksi & Kompetitif)* |
| :--- | :--- | :--- | :--- |
| **1. BRD & Conflict Resolution** | Hanya menyalin keinginan pemilik klinik tanpa mencatat pertentangan dengan dokter/farmasi/kasir. | Mencatat 4 konflik stakeholder dan memilih solusi kompromi dasar; KPI ada meski sebagian masih agak umum. | Menyertakan dasar regulasi/bisnis yang tegas per konflik, memisahkan *In-Scope* vs *Out-of-Scope* dengan tajam, KPI 100% *SMART*, dan RTM terhubung dari BRD sampai UAT. |
| **2. BPMN To-Be** | Diagram hanya berupa alur *happy path* satu kolom tanpa *swimlane* dan tanpa jalur kegagalan. | Memakai *swimlane* per aktor dan membedakan jalur *online* vs *walk-in*, serta menyertakan percabangan obat habis. | Menggambarkan *boundary/exception event* (dokter telat/cuti, obat habis -> persetujuan substitusi, tebus parsial, *split billing*), konsisten 100% dengan Use Case dan State Machine. |
| **3. SRS, Use Case, & State Machine** | Masih memakai kata kabur (*"sistem merespons cepat & aman"*); State Machine hilang atau transisi melompat bebas. | Spesifikasi mengikuti IEEE 29148; 2 Use Case memiliki *Main Flow* dan *Alternative Flow*; State Machine memuat status dasar janji temu. | Seluruh NFR terukur dengan angka + metode uji; *Exception Flow* menangani kegagalan DB/Gateway/dokter cuti; State Machine melarang transisi ilegal dan mengatur pergeseran timer *no-show* akibat keterlambatan dokter. |
| **4. ERD & Screen Spec** | Diagnosis medis disatukan di tabel `appointments` tanpa proteksi akses; layar hanya digambar wireframe tanpa aturan validasi. | Entitas utama dan relasi Crow's Foot benar; Screen Spec mencantumkan field dan validasi input dasar. | `medical_records` terpisah untuk isolasi RBAC, item resep menyimpan *snapshot* harga & dosis, kolom waktu memakai UTC + `clinic.timezone`; Screen Spec lengkap 5 state dan *mapping* UI–API–DB tanpa celah. |
| **5. API Contract & Privasi RME** | Endpoint memakai `GET` untuk ubah data, mengirim `total_price` dari klien, atau tidak membahas RBAC data medis. | Endpoint RESTful benar, status code standar (`200/201/400/403/409`), dan kasir diblokir dari endpoint rekam medis. | Menyertakan `Idempotency-Key`, amplop error seragam, *RBAC Field-Level Masking*, *immutable read-audit log* untuk akses RME, dan larangan menampilkan diagnosis di notifikasi WA/struk. |
| **6. FSD Modul Kritis** | Tidak menjelaskan cara mengatasi dua dokter meresepkan obat terakhir secara bersamaan. | Ada Sequence Diagram untuk proses resep hingga bayar dan penyebutan transaksi database. | Menjelaskan *pessimistic locking* (`SELECT ... FOR UPDATE`), jeda aman antara reservasi resep vs pelepasan stok item yang tidak ditebus (*partial dispense*), serta konsistensi *split billing*. |
| **7. CR Impact & Batch Multi-Timezone** | Analisis dampak hanya 1–2 baris (*"ubah API dan UI"*); lupa masalah perbedaan jam WIB vs WITA. | Mengisi seluruh 6 lapisan *Impact Analysis* dan menyebutkan perlunya konversi zona waktu cabang. | Menjelaskan strategi *backward compatibility* API/skema DB, rencana *backfill* & *rollback* aman, serta aturan SQL `AT TIME ZONE` per `clinic_id` pada rekonsiliasi harian tanpa selisih pembulatan. |
| **8. UAT & EP/BVA** | Skenario uji hanya menguji alur sukses (*"pasien daftar, periksa, bayar, selesai"*). | Menguji beberapa skenario negatif (obat habis, salah password) sesuai format template UAT. | Menerapkan EP & BVA presisi pada batas waktu 15 menit (dokter tepat waktu vs telat), stok batas 1, tebus parsial, uji *RBAC penetration* pada rekam medis, dan batas *cut-off* 23:55 WITA vs 00:05 WITA. |

### Cara Menilai Skor Kesiapan Anda
Berikan skor untuk tiap deliverable: **Belum Layak = 0 poin**, **Level Junior SA = 1 poin**, **Level Mid SA = 2 poin** (Skor maksimal = **16 poin**).
- **13–16 poin:** Siap melamar dan bersaing untuk posisi **Mid System Analyst** (atau *Strong Junior SA*) dengan portofolio yang solid.
- **8–12 poin:** Fondasi **Junior System Analyst** sudah kuat; pertajam bagian yang masih bernilai `1` (umumnya *concurrency*, *edge cases*, dan *multi-timezone*) sebelum mengirim lamaran.
- **< 8 poin:** Tinjau ulang bab terkait (terutama Bab 06, 08, 09, 10, dan 11), perbaiki artefak Anda, lalu bandingkan kembali dengan kunci referensi.

---

**Langkah Berikutnya:**
1. Setelah Anda menyelesaikan draf mandiri kedelapan deliverable di atas, bedah seluruh keputusan desain dan bandingkan jawaban Anda di [**Kunci Jawaban & Pembahasan Referensi Capstone: MedikaLink**](../kunci-latihan/kunci-capstone-ringkas.md).
2. Setelah proyek *capstone* Anda matang, kemas hasilnya menjadi portofolio profesional melalui [**Panduan Menyusun Portofolio System Analyst Siap Lamar**](../kesiapan-kerja/panduan-portofolio-sa.md).
3. Kembali ke [Bab 13 — UAT, Testing Collaboration, & Handover](13-uat-testing-handover.md) atau [Peta Kurikulum & Kamus Domain (`README.md`)](../README.md).
