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
        navbar.classList.remove('active'); // ← ganti jadi nav
    }
});