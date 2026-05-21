//bagian navbar
//toggle class active
const navbar = document.querySelector('.navbar');
//ketika menu diklik
document.querySelector('.navbar-icons').
onclick = () => {
    navbar.classList.toggle('active');
}

//klik diluar sidebar untuk menghilangkan isi burger
const navbarIcons = document.querySelector('.navbar-icons');
const nav = document.querySelector('.nav');

document.addEventListener('click', function(e) {
    if(!navbarIcons.contains(e.target) && !nav.contains(e.target)) {
        navbar.classList.remove('active'); 
    }
});

//bagian bawah navbar
//selamat pagi, siang, dll
const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
function updateGreeting() {

    const jamSekarang = new Date().getHours();

    let sapaan = "";

    if (jamSekarang >= 0 && jamSekarang < 12) {
        sapaan = "Selamat Pagi";
    } else if (jamSekarang >= 12 && jamSekarang < 15) {
        sapaan = "Selamat Siang";
    } else if (jamSekarang >= 15 && jamSekarang < 18) {
        sapaan = "Selamat Sore";
    } else {
        sapaan = "Selamat Malam";
    }

    document.getElementById("greeting").textContent = sapaan;
}
updateGreeting();
setInterval(updateGreeting, 1000);

// jam
function updateJam() {

    const sekarang = new Date();

    const jam   = sekarang.getHours();
    const menit = sekarang.getMinutes();
    const detik = sekarang.getSeconds();

    const jamStr   = String(jam).padStart(2, "0");
    const menitStr = String(menit).padStart(2, "0");
    const detikStr = String(detik).padStart(2, "0");

    const waktu = jamStr + ":" + menitStr + ":" + detikStr;
    document.getElementById("jam").textContent = waktu;
}
updateJam(); 
setInterval(updateJam, 1000);

//tanggal
function updateTanggal() {

    const sekarang = new Date();

    const hari    = namaHari[sekarang.getDay()];    
    const tanggal = sekarang.getDate();              
    const bulan   = namaBulan[sekarang.getMonth()]; 
    const tahun   = sekarang.getFullYear();         

    const tglLengkap = hari + ", " + tanggal + " " + bulan + " " + tahun;

    document.getElementById("tanggal").textContent = tglLengkap;
}
updateTanggal();
setInterval(updateTanggal, 1000);

// data jadwal

function getJadwal() {
return jadwal = JSON.parse(localStorage.getItem("jadwal")) || [];
}

function getTravelTime() { return parseInt(localStorage.getItem("travelTime")) || 20; }
function getPrepTime()   { return parseInt(localStorage.getItem("prepTime"))   || 30; }

function toMenit(str) {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
}
 
function formatDurasi(totalDetik) {
    if (totalDetik < 0) totalDetik = 0;
    const h = Math.floor(totalDetik / 3600);
    const m = Math.floor((totalDetik % 3600) / 60);
    const s = totalDetik % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
 
function statusKelas(jamMulai, jamSelesai) {
    const now = new Date();
    const nowMenit = now.getHours() * 60 + now.getMinutes();
    const mulai   = toMenit(jamMulai);
    const selesai = toMenit(jamSelesai);
    if (nowMenit >= selesai) return "selesai";
    if (nowMenit >= mulai)   return "berlangsung";
    return "akan_datang";
}

// NOTIFIKASI BROWSER
if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}
 
function kirimNotifikasi(judul, isi) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification(judul, { body: isi });
}
 
// ALARM SUARA — Web Audio API
let audioCtx        = null;   // AudioContext aktif
let alarmInterval   = null;   // interval pengulang bunyi alarm
let alarmSedangBunyi = false; // status alarm
 
function getAudioCtx() {
    if (!audioCtx || audioCtx.state === "closed") {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}
 
// Mainkan satu set nada
function mainkanNada(pola) {
    try {
        const ctx = getAudioCtx();
        pola.forEach(({ f, t, d }) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = f;
            osc.type = "sine";
            gain.gain.setValueAtTime(0.45, ctx.currentTime + t);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);
            osc.start(ctx.currentTime + t);
            osc.stop(ctx.currentTime + t + d + 0.05);
        });
    } catch(e) { /* skip kalau Web Audio tidak tersedia */ }
}
 
const POLA_WARNING   = [{ f: 520, t: 0.0, d: 0.2 }, { f: 520, t: 0.3, d: 0.2 }];
const POLA_BERANGKAT = [{ f: 440, t: 0.0, d: 0.2 }, { f: 550, t: 0.25, d: 0.2 }, { f: 660, t: 0.5, d: 0.35 }];
 
// Mulai alarm — bunyi tiap 4 detik sampai dimatikan
function mulaiAlarm(tipe) {
    if (alarmSedangBunyi) return; // jangan dobel
    alarmSedangBunyi = true;
 
    const pola = tipe === "berangkat" ? POLA_BERANGKAT : POLA_WARNING;
    mainkanNada(pola);
    alarmInterval = setInterval(() => mainkanNada(pola), 4000);
 
    tampilTombolMatikanAlarm();
}
 
// Hentikan alarm — dipanggil tombol atau otomatis ganti kelas
function matikanAlarm() {
    if (!alarmSedangBunyi) return;
    alarmSedangBunyi = false;
    if (alarmInterval) { clearInterval(alarmInterval); alarmInterval = null; }
    sembunyikanTombolMatikanAlarm();
}

// TOMBOL MATIKAN ALARM — muncul/hilang di card countdown
function tampilTombolMatikanAlarm() {
    // Jangan buat dobel
    if (document.getElementById("btn-matikan-alarm")) return;
 
    const countdown = document.getElementById("countdown");
    if (!countdown) return;
 
    const btn = document.createElement("button");
    btn.id        = "btn-matikan-alarm";
    btn.innerHTML = `<span class="material-icons" style="font-size:1.1rem;vertical-align:middle;">volume_off</span> Matikan Alarm`;
    btn.onclick   = matikanAlarm;
 
    // Sisipkan setelah elemen countdown
    countdown.parentNode.insertBefore(btn, countdown.nextSibling);
}
 
function sembunyikanTombolMatikanAlarm() {
    const btn = document.getElementById("btn-matikan-alarm");
    if (btn) btn.remove();
}
 
// CEK & KIRIM NOTIF + ALARM
//
// Contoh kelas jam 10:00, prep=20, travel=10:
//   mulaiDetik      = 10:00 = 36000 detik
//   siapDetik       = 10:00 - (20+10)mnt = 09:30 = 34200 detik  alarm 2
//   berangkatDetik  = 10:00 - 10mnt      = 09:50 = 35400 detik  alarm 3
//   earlyDetik      = 10:00 - 50mnt      = 09:10 = 33000 detik  alarm 1
const notifTerkirim = new Set();
 
function cekDanKirimNotif(kelas, skrgDetik) {
    const travel = getTravelTime();
    const prep   = getPrepTime();
 
    const mulaiDetik     = toMenit(kelas.jamMulai) * 60;
    const earlyDetik     = mulaiDetik - 50 * 60;          // alarm 1: 50 menit sebelum kelas
    const siapDetik      = mulaiDetik - (prep + travel) * 60; // alarm 2: mulai siap-siap
    const berangkatDetik = mulaiDetik - travel * 60;       // alarm 3: berangkat!
 
    const k1 = `${kelas.matkul}-${kelas.jamMulai}-early`;
    const k2 = `${kelas.matkul}-${kelas.jamMulai}-siap`;
    const k3 = `${kelas.matkul}-${kelas.jamMulai}-berangkat`;
 
    // Alarm 1 — 50 menit sebelum kelas
    if (skrgDetik >= earlyDetik && skrgDetik < earlyDetik + 30 && !notifTerkirim.has(k1)) {
        notifTerkirim.add(k1);
        kirimNotifikasi(
            "50 Menit Sebelum Kelas",
            `${kelas.matkul} jam ${kelas.jamMulai}. Bersiaplah sebentar lagi!`
        );
        mulaiAlarm(POLA_PERINGATAN);
    }
 
    // Alarm 2 — waktunya mulai siap-siap (prep + travel sebelum kelas)
    if (skrgDetik >= siapDetik && skrgDetik < siapDetik + 30 && !notifTerkirim.has(k2)) {
        notifTerkirim.add(k2);
        kirimNotifikasi(
            "Waktunya Siap-Siap!",
            `${kelas.matkul} jam ${kelas.jamMulai}. Mulai mandi & bersiap sekarang!`
        );
        mulaiAlarm(POLA_PERINGATAN);
    }
 
    // Alarm 3 — waktunya berangkat (travel sebelum kelas)
    if (skrgDetik >= berangkatDetik && skrgDetik < berangkatDetik + 30 && !notifTerkirim.has(k3)) {
        notifTerkirim.add(k3);
        kirimNotifikasi(
            "Berangkat Sekarang!",
            `${kelas.matkul} jam ${kelas.jamMulai} di ${kelas.ruangan}. Jangan telat!`
        );
        mulaiAlarm(POLA_BERANGKAT);
    }
}

// kelas berikutnya, ini bagian tengah, yang card

let countdownInterval = null;
 
function tampilKelasBerikutnya() {
    const jadwal   = getJadwal();
    const now      = new Date();
    const hariIni  = now.getDay();
    const nowMenit = now.getHours() * 60 + now.getMinutes();
 
    const kelasHariIni = jadwal
        .filter(k => k.hari === hariIni && toMenit(k.jamSelesai) > nowMenit)
        .sort((a, b) => toMenit(a.jamMulai) - toMenit(b.jamMulai));
 
    const elNama      = document.getElementById("nama-matkul");
    const elJam       = document.getElementById("jam-kelas");
    const elRuangan   = document.getElementById("ruangan-kelas");
    const elCountdown = document.getElementById("countdown");
    const elTimer     = document.getElementById("countdown-timer");
    const elTulisan   = document.getElementById("tulisan-berangkat");
 
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
 
    if (kelasHariIni.length === 0) {
        elNama.textContent    = "Tidak ada kelas lagi hari ini! Horee! jangan lupa mengerjakan tugas!";
        elJam.textContent     = "";
        elRuangan.textContent = "";
        elCountdown.style.display = "none";
        return;
    }
 
    const kelas = kelasHariIni[0];
    elNama.textContent    = kelas.matkul;
    elJam.textContent     = `${kelas.jamMulai} – ${kelas.jamSelesai}`;
    elRuangan.textContent = `${kelas.ruangan}`;
    elCountdown.style.display = "flex";
 
    function tickCountdown() {
        const skrg      = new Date();
        const skrgDetik = skrg.getHours() * 3600 + skrg.getMinutes() * 60 + skrg.getSeconds();
        const mulaiDetik     = toMenit(kelas.jamMulai) * 60;
        const selesaiDetik   = toMenit(kelas.jamSelesai) * 60;
        const totalOffset    = (getTravelTime() + getPrepTime()) * 60;
        const berangkatDetik = mulaiDetik - (getTravelTime() * 60);
 
        const st = statusKelas(kelas.jamMulai, kelas.jamSelesai);
 
        if (st === "berlangsung") {
            elTulisan.textContent = "Kelas berlangsung, selesai dalam:";
            elTimer.textContent   = formatDurasi(selesaiDetik - skrgDetik);
            elTimer.className     = "countdown-timer";
            matikanAlarm();
            return;
        }
 
        const sisaBerangkat = berangkatDetik - skrgDetik;

        cekDanKirimNotif(kelas, sisaBerangkat);

        if (sisaBerangkat <= 0) {
            elTulisan.textContent = "Harus berangkat sekarang!";
            elTimer.textContent   = "BERANGKAT!";
            elTimer.className     = "countdown-timer merah";
        } else if (sisaBerangkat <= 30 * 60) {
            elTulisan.textContent = "Berangkat dalam:";
            elTimer.textContent   = formatDurasi(sisaBerangkat);
            elTimer.className     = "countdown-timer oranye";
        } else {
            elTulisan.textContent = "Berangkat dalam:";
            elTimer.textContent   = formatDurasi(sisaBerangkat);
            elTimer.className     = "countdown-timer";
        }
    }
 
    tickCountdown();
    countdownInterval = setInterval(tickCountdown, 1000);
}

//jadwal hari ni semua

function tampilJadwalHariIni() {
    const jadwal   = getJadwal();
    const now      = new Date();
    const hariIni  = now.getDay();
 
    const container = document.getElementById("jadwal-hari-ini");
    if (!container) return;
 
    const kelasHariIni = jadwal
        .filter(k => k.hari === hariIni)
        .sort((a, b) => toMenit(a.jamMulai) - toMenit(b.jamMulai));
 
    if (kelasHariIni.length === 0) {
        container.innerHTML = "";
        return;
    }
 
    let html = `<h3 class="sub-judul">Semua Kelas Hari Ini</h3>`;
 
    kelasHariIni.forEach(k => {
        const st = statusKelas(k.jamMulai, k.jamSelesai);
        let statusLabel, statusClass;
 
        if (st === "selesai") {
            statusLabel = "Kelas Telah Selesai, yeay!";
            statusClass = "status-selesai";
        } else if (st === "berlangsung") {
            statusLabel = "Sedang kelas";
            statusClass = "status-berlangsung";
        } else {
            statusLabel = "Akan Datang";
            statusClass = "status-akan";
        }
 
        html += `
        <div class="jadwal-item ${st === 'selesai' ? 'item-selesai' : ''}">
            <p class="matkul">${k.matkul}</p>
            <p class="detail">${k.jamMulai} – ${k.jamSelesai} &nbsp;|&nbsp; ${k.ruangan}</p>
            <p class="status ${statusClass}">${statusLabel}</p>
        </div>`;
    });
 
    container.innerHTML = html;
}

//jadwal besok
function tampilJadwalBesok() {
    const jadwal  = getJadwal();
    const now     = new Date();
    const besok   = (now.getDay() + 1) % 7;
 
    const container = document.getElementById("jadwal-besok");
    if (!container) return;
 
    const kelasBesok = jadwal
        .filter(k => k.hari === besok)
        .sort((a, b) => toMenit(a.jamMulai) - toMenit(b.jamMulai));
 
    if (kelasBesok.length === 0) {
        container.innerHTML = `<h3 class="sub-judul">Jadwal Besok (${namaHari[besok]})</h3>
        <p class="kosong-text">Tidak ada kelas besok</p>`;
        return;
    }
 
    let html = `<h3 class="sub-judul">Jadwal Besok (${namaHari[besok]})</h3>`;
 
    kelasBesok.forEach(k => {
        html += `
        <div class="jadwal-item item-besok">
            <p class="matkul">${k.matkul}</p>
            <p class="detail">${k.jamMulai} – ${k.jamSelesai} &nbsp;|&nbsp; ${k.ruangan}</p>
        </div>`;
    });
 
    container.innerHTML = html;
}

function refreshSemua() {
    tampilKelasBerikutnya();
    tampilJadwalHariIni();
    tampilJadwalBesok();
}
 
refreshSemua();
setInterval(() => {
    tampilJadwalHariIni();
    tampilJadwalBesok();
}, 60 * 1000);