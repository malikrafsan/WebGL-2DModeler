# Tugas 1 IF3260 Grafika Komputer 
# 2D Web Based CAD (Computer-Aided Design)

## Spesifikasi
WebGL merupakan kakas dengan spesialisasi pada ranah grafika yang dapat dengan mudah
diintegrasikan pada web. Mahasiswa ditugaskan menggunakan WebGL murni untuk
mengimplementasikan web dengan fitur menggambar, mengedit, dan memvisualisasi sejumlah
model pada kanvas. Berikut daftar spesifikasi yang harus diperhatikan:
- Fungsi-fungsi WebGL yang tidak primitive harus dibuat sendiri. Dijelaskan pula secara
singkat dan seperlunya dalam readme
- Model yang harus diimplementasikan, beserta metode spesialnya:
  - Garis: Ubah panjang
  - Persegi: Ubah panjang sisi
  - Persegi panjang: Ubah panjang atau ubah lebar
  - Polygon: Penambahan dan penghapusan titik sudut
- Untuk setiap model, harus dapat dilakukan:
  - Transformasi geometri minimal 2 dari: translasi, dilatasi, rotasi, shear
  - Menggerakkan salah satu titik sudut dengan slider atau drag and drop
  - Mengubah warna salah satu atau semua titik sudut
  - Save sebuah model yang telah dibuat, format dibebaskan kepada mahasiswa,
  asal dapat di load kembali dan editable pada web yang diimplementasikan.
  Sediakan setidaknya 2 (dua) model yang siap untuk diload pada repo.
- Implementasikan minimal satu dari fitur lanjutan pada poin berikutnya. Pengerjaan lebih
dari satu fitur lanjutan dianggap bonus nilai. Daftar fitur di bawah juga sebatas saran,
mahasiswa dapat mengimplementasikan fitur selain ini dan asalkan didokumentasikan
dengan baik, dapat mengklaim sebagai fitur bonus untuk dinilai asisten:
- Contoh fitur lanjutan:
  - Implementasi algoritma untuk menggambar polygon sedemikian sehingga
  dengan urutan penambahan titik yang berubah pun, gambar akhir polygon tetap
  sama yang merupakan convex hull dari titik-titiknya.
  - Integrasi animation pada salah satu fitur yang ada
  - Fitur penguncian pada salah satu aspek, misalnya sudut suatu titik dalam
  polygon dapat dilock sehingga saat didrag atau dipindahkan, titik tersebut masih
  bersudut sama. Contoh lain penguncian keliling, luas, atau kesebangunan
  - Menghasilkan model baru hasil irisan atau union dari 2 mode

## Cara menjalankan program
  ```sh
  npm install
  npm run dev
  ./src/index.html  # unix based
  ```

## Contributors
- 13520057	Marcellus Michael Herman K
- 13520097	Angelica Winasta Sinisuka
- 13520105	Malik Akbar Hashemi Rafsanjani

