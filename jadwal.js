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
const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const URUTAN_HARI = [1, 2, 3, 4, 5, 6, 0]; // Senin–Sabtu–Minggu
 
function getJadwal() {
    return JSON.parse(localStorage.getItem("jadwal")) || [];
}
 
function simpanJadwal(data) {
    localStorage.setItem("jadwal", JSON.stringify(data));
}

function showToast(pesan) {
    const toast = document.getElementById("toast");
    toast.textContent = pesan;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

function renderList() {
    const jadwal    = getJadwal();
    const container = document.getElementById("list-jadwal");
 
    if (jadwal.length === 0) {
        container.innerHTML = `<p class="jadwal-kosong"> Belum ada jadwal. Tambahkan jadwalmu di atas!</p>`;
        return;
    }
 
    let html = "";
 
    URUTAN_HARI.forEach(hariIdx => {
        const kelasHari = jadwal
            .map((k, i) => ({ ...k, _idx: i }))
            .filter(k => k.hari === hariIdx)
            .sort((a, b) => toMenit(a.jamMulai) - toMenit(b.jamMulai));
 
        if (kelasHari.length === 0) return;
 
        html += `<div class="hari-group">
            <p class="hari-label">${NAMA_HARI[hariIdx]}</p>`;
 
        kelasHari.forEach(k => {
            html += `
            <div class="jadwal-row">
                <div class="jadwal-row-info">
                    <p class="matkul">${k.matkul}</p>
                    <p class="detail"> ${k.jamMulai} – ${k.jamSelesai} &nbsp;|&nbsp; ${k.ruangan}</p>
                </div>
                <button class="tombol-hapus" onclick="hapusJadwal(${k._idx})">
                    <span class="material-icons" style="font-size:1rem">delete</span> Hapus
                </button>
            </div>`;
        });
 
        html += `</div>`;
    });
 
    container.innerHTML = html;
}

function hapusJadwal(idx) {
    const jadwal = getJadwal();
    const nama   = jadwal[idx]?.matkul || "Jadwal";
    jadwal.splice(idx, 1);
    simpanJadwal(jadwal);
    renderList();
    showToast(`"${nama}" dihapus`);
}

function toMenit(str) {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
}
 
document.getElementById("tombol-tambah").addEventListener("click", () => {
    const matkul     = document.getElementById("input-matkul").value.trim();
    const hari       = parseInt(document.getElementById("input-hari").value);
    const ruangan    = document.getElementById("input-ruangan").value.trim();
    const jamMulai   = document.getElementById("input-jam-mulai").value;
    const jamSelesai = document.getElementById("input-jam-selesai").value;
    const errEl      = document.getElementById("form-error");
 
    // Validasi
    if (!matkul) {
        errEl.textContent = "Nama mata kuliah tidak boleh kosong.";
        errEl.style.display = "block";
        return;
    }
    if (!jamMulai || !jamSelesai) {
        errEl.textContent = "Jam mulai dan jam selesai harus diisi.";
        errEl.style.display = "block";
        return;
    }
    if (toMenit(jamMulai) >= toMenit(jamSelesai)) {
        errEl.textContent = "Jam selesai harus lebih lambat dari jam mulai.";
        errEl.style.display = "block";
        return;
    }
    if (!ruangan) {
        errEl.textContent = "Ruangan tidak boleh kosong.";
        errEl.style.display = "block";
        return;
    }
 
    errEl.style.display = "none";
 
    const jadwal = getJadwal();
    jadwal.push({ matkul, hari, jamMulai, jamSelesai, ruangan });
    simpanJadwal(jadwal);
 
    // Reset form
    document.getElementById("input-matkul").value    = "";
    document.getElementById("input-ruangan").value   = "";
    document.getElementById("input-jam-mulai").value  = "";
    document.getElementById("input-jam-selesai").value = "";
 
    renderList();
    showToast(`"${matkul}" ditambahkan!`);
});

renderList();


