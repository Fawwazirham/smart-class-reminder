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

// TOAST
function showToast(pesan) {
    const toast = document.getElementById("toast");
    toast.textContent = pesan;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}
 
// LOAD — isi input & info dari localStorage
function loadPengaturan() {
    const travel = parseInt(localStorage.getItem("travelTime")) || 0;
    const prep   = parseInt(localStorage.getItem("prepTime"))   || 0;
 
    document.getElementById("input-travel").value = travel;
    document.getElementById("input-prep").value   = prep;
 
    updatePreview(travel, prep);
    updateInfo(travel, prep);
}
 
// PREVIEW — update teks preview real-time
function updatePreview(travel, prep) {
    const total = travel + prep;
    document.getElementById("preview-total").textContent = total;
}
 
function updateInfo(travel, prep) {
    document.getElementById("info-travel").textContent = travel;
    document.getElementById("info-prep").textContent   = prep;
    document.getElementById("info-total").textContent  = travel + prep;
}
 
// Real-time preview saat input berubah
document.getElementById("input-travel").addEventListener("input", () => {
    const travel = parseInt(document.getElementById("input-travel").value) || 0;
    const prep   = parseInt(document.getElementById("input-prep").value)   || 0;
    updatePreview(travel, prep);
});
 
document.getElementById("input-prep").addEventListener("input", () => {
    const travel = parseInt(document.getElementById("input-travel").value) || 0;
    const prep   = parseInt(document.getElementById("input-prep").value)   || 0;
    updatePreview(travel, prep);
});
 
// SIMPAN
document.getElementById("btn-simpan").addEventListener("click", () => {
    const travel = parseInt(document.getElementById("input-travel").value);
    const prep   = parseInt(document.getElementById("input-prep").value);
 
    if (isNaN(travel) || travel < 0) {
        showToast("⚠️ Waktu perjalanan tidak valid!");
        return;
    }
    if (isNaN(prep) || prep < 0) {
        showToast("⚠️ Waktu persiapan tidak valid!");
        return;
    }
 
    localStorage.setItem("travelTime", travel);
    localStorage.setItem("prepTime",   prep);
 
    updateInfo(travel, prep);
    showToast("✅ Pengaturan disimpan!");
});
 

loadPengaturan();
 