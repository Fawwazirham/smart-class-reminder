// =====================
// DATA JADWAL
// =====================

// Travel time dalam menit (bisa diubah sesuai kondisi)
const TRAVEL_TIME = 20;
const PREP_TIME = 30; // waktu persiapan (mandi, sarapan, dll)

// Nama hari
const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Data jadwal (nanti bisa ditambah lewat form)
let jadwal = JSON.parse(localStorage.getItem("jadwal")) || [
    { matkul: "Algoritma & Pemrograman", hari: 3, jamMulai: "08:00", jamSelesai: "10:00", ruangan: "Lab Komputer A" },
    { matkul: "Matematika Diskrit",      hari: 2, jamMulai: "07:00", jamSelesai: "09:00", ruangan: "Gedung B R.201" },
    { matkul: "Fisika Dasar",            hari: 4, jamMulai: "10:00", jamSelesai: "12:00", ruangan: "Gedung C R.101" },
];


// =====================
// TAMPILKAN JAM & TANGGAL
// =====================

function updateJam() {
    const sekarang = new Date();

    // Format jam jadi HH:MM:SS
    const jam  = String(sekarang.getHours()).padStart(2, "0");
    const menit = String(sekarang.getMinutes()).padStart(2, "0");
    const detik = String(sekarang.getSeconds()).padStart(2, "0");

    document.getElementById("jam").textContent = `${jam}:${menit}:${detik}`;

    // Format tanggal
    const hari    = NAMA_HARI[sekarang.getDay()];
    const tanggal = sekarang.getDate();
    const bulan   = sekarang.getMonth() + 1; // bulan mulai dari 0
    const tahun   = sekarang.getFullYear();

    document.getElementById("tanggal").textContent = `${hari}, ${tanggal}/${bulan}/${tahun}`;
}

// Jalankan setiap 1 detik
setInterval(updateJam, 1000);
updateJam(); // panggil sekali langsung biar gak nunggu 1 detik

// =====================
// TAMPILKAN JADWAL HARI INI
// =====================

function tampilkanJadwalHariIni() {
    const sekarang = new Date();
    const hariIni = sekarang.getDay(); // 0=Minggu, 1=Senin, dst

    // Filter jadwal yang harinya sama dengan hari ini
    const jadwalHariIni = jadwal.filter(j => j.hari === hariIni);

    const listEl = document.getElementById("list-jadwal");

    // Kalau tidak ada jadwal hari ini
    if (jadwalHariIni.length === 0) {
        listEl.innerHTML = "<li>Tidak ada jadwal hari ini 🎉</li>";
        return;
    }

    // Urutkan berdasarkan jam mulai (paling pagi duluan)
    jadwalHariIni.sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

    // Tampilkan satu per satu
    listEl.innerHTML = "";
    jadwalHariIni.forEach(j => {
        const sudahLewat = cekSudahLewat(j.jamSelesai);
        const status = sudahLewat ? "✅" : "⏳";

        const li = document.createElement("li");
        li.textContent = `${status} ${j.jamMulai} - ${j.matkul} (${j.ruangan})`;

        // Kasih warna abu kalau sudah lewat
        if (sudahLewat) li.style.color = "#aaa";

        listEl.appendChild(li);
    });
}

// Fungsi bantu: cek apakah jam sudah lewat
function cekSudahLewat(jamSelesai) {
    const sekarang = new Date();
    const [jam, menit] = jamSelesai.split(":").map(Number);

    const selesai = new Date();
    selesai.setHours(jam, menit, 0);

    return sekarang > selesai;
}

// =====================
// ALGORITMA UTAMA
// =====================

function getKelasBerikutnya() {
    const sekarang = new Date();
    const hariIni = sekarang.getDay();

    // Filter jadwal hari ini yang belum selesai
    const jadwalHariIni = jadwal
        .filter(j => j.hari === hariIni)
        .filter(j => !cekSudahLewat(j.jamSelesai))
        .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

    // Kalau tidak ada kelas lagi hari ini
    if (jadwalHariIni.length === 0) return null;

    // Ambil kelas paling dekat
    return jadwalHariIni[0];
}

function hitungCountdown(kelas) {
    const sekarang = new Date();

    // Pecah jam mulai kelas jadi jam & menit
    const [jam, menit] = kelas.jamMulai.split(":").map(Number);

    // Waktu harus berangkat = jam kelas - travel time - prep time
    const waktuBerangkat = new Date();
    waktuBerangkat.setHours(jam, menit - TRAVEL_TIME - PREP_TIME, 0);

    // Selisih waktu sekarang vs waktu berangkat (dalam detik)
    const selisihMs = waktuBerangkat - sekarang;
    const selisihDetik = Math.floor(selisihMs / 1000);

    return selisihDetik;
}

function formatCountdown(totalDetik) {
    if (totalDetik <= 0) return "BERANGKAT SEKARANG! 🚨";

    const jam   = Math.floor(totalDetik / 3600);
    const menit = Math.floor((totalDetik % 3600) / 60);
    const detik = totalDetik % 60;

    return `${String(jam).padStart(2, "0")}:${String(menit).padStart(2, "0")}:${String(detik).padStart(2, "0")}`;
}

function updateKelasBerikutnya() {
    const kelas = getKelasBerikutnya();

    // Kalau tidak ada kelas
    if (!kelas) {
        document.getElementById("nama-matkul").textContent = "Tidak ada kelas lagi hari ini 🎉";
        document.getElementById("jam-matkul").textContent = "";
        document.getElementById("ruangan").textContent = "";
        document.getElementById("countdown").textContent = "-";
        return;
    }

    // Tampilkan info kelas
    document.getElementById("nama-matkul").textContent = kelas.matkul;
    document.getElementById("jam-matkul").textContent = `🕐 ${kelas.jamMulai} - ${kelas.jamSelesai}`;
    document.getElementById("ruangan").textContent = `📍 ${kelas.ruangan}`;

    // Hitung & tampilkan countdown
    const sisaDetik = hitungCountdown(kelas);
    document.getElementById("countdown").textContent = formatCountdown(sisaDetik);

    // Ganti warna countdown sesuai urgensi
    const countdownEl = document.getElementById("countdown");
    if (sisaDetik <= 0) {
        countdownEl.style.color = "#e74c3c"; // merah
    } else if (sisaDetik <= 1800) {          // kurang dari 30 menit
        countdownEl.style.color = "#e67e22"; // oranye
    } else {
        countdownEl.style.color = "#27ae60"; // hijau
    }
}

// =====================
// NOTIFIKASI & ALARM
// =====================

// Biar notifikasi tidak spam, kita track yang sudah dikirim
let notifTerkirim = {
    menit60: false,
    menit30: false,
    berangkat: false,
};

function resetNotifJikaKelasBaru(kelas) {
    // Kalau kelas berubah, reset tracker notifikasi
    if (notifTerkirim.kelasAktif !== kelas.matkul) {
        notifTerkirim = {
            menit60: false,
            menit30: false,
            berangkat: false,
            kelasAktif: kelas.matkul,
        };
    }
}

function bunyiAlarm(frekuensi = 440, durasi = 1) {
    // Bikin suara pakai Web Audio API — tidak perlu file mp3!
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = frekuensi; // tinggi nada
    oscillator.type = "sine";               // tipe gelombang suara

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durasi);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + durasi);
}

function kirimNotifikasi(judul, pesan, frekuensi, durasi) {
    // Notifikasi browser (pop-up sistem)
    if (Notification.permission === "granted") {
        new Notification(judul, {
            body: pesan,
            icon: "🎓"
        });
    }

    // Bunyi alarm
    bunyiAlarm(frekuensi, durasi);

    // Tampilkan juga di halaman sebagai banner
    tampilkanBanner(judul, pesan);
}

function tampilkanBanner(judul, pesan) {
    // Cek kalau banner sudah ada, hapus dulu
    const bannerLama = document.getElementById("banner-notif");
    if (bannerLama) bannerLama.remove();

    const banner = document.createElement("div");
    banner.id = "banner-notif";
    banner.innerHTML = `<strong>${judul}</strong><br>${pesan}`;
    banner.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #e74c3c;
        color: white;
        padding: 14px 24px;
        border-radius: 10px;
        font-size: 14px;
        text-align: center;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(banner);

    // Banner otomatis hilang setelah 5 detik
    setTimeout(() => banner.remove(), 5000);
}

function cekDanKirimNotifikasi(kelas, sisaDetik) {
    resetNotifJikaKelasBaru(kelas);

    const sisaMenit = Math.floor(sisaDetik / 60);

    // Notifikasi 60 menit sebelum berangkat
    if (sisaMenit <= 60 && sisaMenit > 59 && !notifTerkirim.menit60) {
        kirimNotifikasi(
            "⏰ Pengingat Kelas",
            `${kelas.matkul} mulai 1 jam lagi! Siap-siap ya.`,
            440, 1
        );
        notifTerkirim.menit60 = true;
    }

    // Notifikasi 30 menit sebelum berangkat
    if (sisaMenit <= 30 && sisaMenit > 29 && !notifTerkirim.menit30) {
        kirimNotifikasi(
            "🟠 Segera Bersiap!",
            `${kelas.matkul} dalam 30 menit! Waktunya bersiap.`,
            520, 1.5
        );
        notifTerkirim.menit30 = true;
    }

    // Notifikasi harus berangkat
    if (sisaDetik <= 0 && !notifTerkirim.berangkat) {
        kirimNotifikasi(
            "🚨 BERANGKAT SEKARANG!",
            `${kelas.matkul} di ${kelas.ruangan}. Jangan sampai telat!`,
            660, 2
        );
        notifTerkirim.berangkat = true;
    }
}

// Minta izin notifikasi browser saat halaman dibuka
function mintaIzinNotifikasi() {
    if (Notification.permission === "default") {
        Notification.requestPermission();
    }
}

mintaIzinNotifikasi();

function updateKelasBerikutnya() {
    const kelas = getKelasBerikutnya();

    if (!kelas) {
        document.getElementById("nama-matkul").textContent = "Tidak ada kelas lagi hari ini 🎉";
        document.getElementById("jam-matkul").textContent = "";
        document.getElementById("ruangan").textContent = "";
        document.getElementById("countdown").textContent = "-";
        return;
    }

    document.getElementById("nama-matkul").textContent = kelas.matkul;
    document.getElementById("jam-matkul").textContent = `🕐 ${kelas.jamMulai} - ${kelas.jamSelesai}`;
    document.getElementById("ruangan").textContent = `📍 ${kelas.ruangan}`;

    const sisaDetik = hitungCountdown(kelas);
    document.getElementById("countdown").textContent = formatCountdown(sisaDetik);

    const countdownEl = document.getElementById("countdown");
    if (sisaDetik <= 0) {
        countdownEl.style.color = "#e74c3c";
    } else if (sisaDetik <= 1800) {
        countdownEl.style.color = "#e67e22";
    } else {
        countdownEl.style.color = "#27ae60";
    }

    // ✅ Tambahan baru — cek dan kirim notifikasi
    cekDanKirimNotifikasi(kelas, sisaDetik);
}

// =====================
// FORM TAMBAH JADWAL
// =====================

function tambahJadwal() {
    // Ambil nilai dari form
    const matkul    = document.getElementById("input-matkul").value.trim();
    const hari      = Number(document.getElementById("input-hari").value);
    const jamMulai  = document.getElementById("input-jam-mulai").value;
    const jamSelesai = document.getElementById("input-jam-selesai").value;
    const ruangan   = document.getElementById("input-ruangan").value.trim();

    // Validasi — semua field harus diisi
    if (!matkul || !jamMulai || !jamSelesai || !ruangan) {
        alert("Semua field harus diisi ya!");
        return;
    }

    // Validasi — jam mulai harus sebelum jam selesai
    if (jamMulai >= jamSelesai) {
        alert("Jam mulai harus lebih awal dari jam selesai!");
        return;
    }

    // Buat objek jadwal baru
    const jadwalBaru = { matkul, hari, jamMulai, jamSelesai, ruangan };

    // Tambahkan ke array jadwal
    jadwal.push(jadwalBaru);

    // Simpan ke localStorage
    localStorage.setItem("jadwal", JSON.stringify(jadwal));

    // Reset form
    document.getElementById("input-matkul").value = "";
    document.getElementById("input-jam-mulai").value = "";
    document.getElementById("input-jam-selesai").value = "";
    document.getElementById("input-ruangan").value = "";

    // Update tampilan
    tampilkanJadwalHariIni();
    updateKelasBerikutnya();

    alert(`✅ "${matkul}" berhasil ditambahkan!`);
}

function hapusJadwal(index) {
    const konfirmasi = confirm(`Hapus "${jadwal[index].matkul}"?`);
    if (!konfirmasi) return;

    jadwal.splice(index, 1);
    localStorage.setItem("jadwal", JSON.stringify(jadwal));

    tampilkanJadwalHariIni();
    updateKelasBerikutnya();
}

function tampilkanJadwalHariIni() {
    const sekarang = new Date();
    const hariIni = sekarang.getDay();

    const jadwalHariIni = jadwal
        .filter(j => j.hari === hariIni)
        .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

    const listEl = document.getElementById("list-jadwal");

    if (jadwalHariIni.length === 0) {
        listEl.innerHTML = "<li>Tidak ada jadwal hari ini 🎉</li>";
        return;
    }

    listEl.innerHTML = "";
    jadwalHariIni.forEach(j => {
        // Cari index asli di array jadwal (bukan index filter)
        const indexAsli = jadwal.indexOf(j);
        const sudahLewat = cekSudahLewat(j.jamSelesai);
        const status = sudahLewat ? "✅" : "⏳";

        const li = document.createElement("li");
        li.style.cssText = "display:flex; justify-content:space-between; align-items:center;";
        li.innerHTML = `
            <span style="${sudahLewat ? 'color:#aaa' : ''}">
                ${status} ${j.jamMulai} - ${j.matkul} (${j.ruangan})
            </span>
            <button 
                onclick="hapusJadwal(${indexAsli})" 
                style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:16px;">
                🗑️
            </button>
        `;

        listEl.appendChild(li);
    });
}

// Jalankan semua fungsi
tampilkanJadwalHariIni();
updateKelasBerikutnya();

// Update setiap detik
setInterval(() => {
    updateKelasBerikutnya();
    tampilkanJadwalHariIni();
}, 1000);