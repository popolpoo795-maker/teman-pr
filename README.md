# Teman PR

Aplikasi planner PR berbasis React untuk mencatat tugas sekolah, mata pelajaran, prioritas, dan tenggat. Data tersimpan otomatis di LocalStorage browser pada perangkat yang digunakan.

## Fitur

- Tambah, edit, dan hapus tugas berdasarkan mata pelajaran.
- Prioritas Tinggi, Sedang, atau Rendah.
- Tandai tugas selesai atau aktif kembali.
- Countdown tenggat, penanda tugas segera jatuh tempo, dan status terlambat.
- Ringkasan progres, filter tugas, dan pencarian.
- Tampilan responsif untuk desktop dan layar kecil.
- Bisa dipasang sebagai aplikasi desktop dari browser yang mendukung PWA.
- Cache aplikasi membuat tampilan utama tetap bisa dibuka saat offline setelah kunjungan pertama.

## Menjalankan aplikasi

Persyaratan: Node.js 20.19+ atau 22.12+ dan npm.

1. Buka terminal di folder proyek ini.
2. Pasang dependensi:

   ```powershell
   npm.cmd install
   ```

3. Jalankan server pengembangan:

   ```powershell
   npm.cmd run dev
   ```

4. Buka alamat yang ditampilkan di terminal (biasanya `http://localhost:5173`).

Di PowerShell Windows, gunakan `npm.cmd` jika perintah `npm` diblokir karena PowerShell mencoba menjalankan `npm.ps1`. Cara ini tidak memerlukan perubahan Execution Policy. Di Command Prompt, `npm install` dan `npm run dev` juga bisa digunakan.

Untuk membuat versi produksi, jalankan `npm run build`. Hasilnya ada di folder `dist/`.

## Memasang Teman PR sebagai aplikasi

Setelah situs dipublikasikan melalui HTTPS, buka alamatnya di Chrome atau Edge. Pilih **Pasang aplikasi Teman PR** dari tombol di bagian atas jika tersedia, atau buka menu browser (⋮) lalu pilih **Install Teman PR / Pasang Teman PR**. Aplikasi akan terbuka di jendela tersendiri dan dapat dibuka dari Start Menu.

Catatan: daftar PR tetap tersimpan di LocalStorage browser/perangkat tersebut. Cache offline menyimpan berkas aplikasi, bukan menyinkronkan tugas ke akun atau perangkat lain.

## Menerbitkan gratis dengan GitHub Pages

Proyek ini sudah disiapkan untuk diterbitkan lewat GitHub Actions. Setiap push ke branch `main` akan membangun dan menerbitkan ulang situs secara otomatis.

1. Buat repository **public** di GitHub, misalnya bernama `teman-pr`. Untuk GitHub Free, repository Pages harus public. Jangan centang opsi untuk menambahkan README karena proyek ini sudah punya README.
2. Di PowerShell, buka folder proyek lalu jalankan perintah berikut. Ganti `USERNAME` dengan nama akun GitHub Anda, dan sesuaikan `teman-pr` jika nama repository berbeda:

   ```powershell
   git init
   git add .
   git commit -m "Deploy Teman PR"
   git branch -M main
   git remote add origin https://github.com/USERNAME/teman-pr.git
   git push -u origin main
   ```

3. Di halaman repository GitHub, buka **Settings → Pages**. Pada **Build and deployment → Source**, pilih **GitHub Actions**.
4. Buka tab **Actions** dan tunggu workflow “Deploy Teman PR to GitHub Pages” selesai. Alamat situs berbentuk `https://USERNAME.github.io/teman-pr/` dan juga tercantum di **Settings → Pages**.

Pastikan `node_modules/` tidak diunggah; folder itu sudah dikecualikan oleh `.gitignore`. Folder referensi `sources/` dan instruksi lokal `AGENTS.md` juga dikecualikan. Situs dan kode di repository public dapat dilihat siapa pun. Daftar PR tetap disimpan di LocalStorage browser masing-masing dan tidak tersinkron antar perangkat.

## Penyimpanan data

Setiap perubahan daftar tugas diserialisasi ke JSON dan disimpan pada key `teman-pr:homework:v1` di LocalStorage. Penyimpanan ini khusus untuk browser dan perangkat tersebut. Menghapus data situs/browser akan menghapus tugas yang tersimpan.
