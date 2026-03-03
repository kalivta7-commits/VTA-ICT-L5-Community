// ===== Theme Toggle =====
document.addEventListener("DOMContentLoaded", () => {

const toggleBtn = document.getElementById("themeToggle");

if (toggleBtn) {
toggleBtn.addEventListener("click", () => {
document.body.classList.toggle("light-theme");

  toggleBtn.textContent =
    document.body.classList.contains("light-theme") ? "☀️" : "🌙";
});

}

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll(
".fade-in, .fade-in-up, .fade-in-left, .fade-in-right, .reveal"
);

if (!revealElements.length) return;

const observer = new IntersectionObserver(
(entries, obs) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
entry.target.classList.add("active");
obs.unobserve(entry.target);
}
});
},
{
root: null,
threshold: 0.1,
rootMargin: "0px 0px -100px 0px",
}
);

revealElements.forEach((el) => observer.observe(el));
});
