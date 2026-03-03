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

// ===== Tech Network Background =====

const canvas = document.getElementById("tech-bg");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let particles = [];

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 2;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.speedY = (Math.random() - 0.5) * 0.6;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }

  draw() {
    ctx.fillStyle = "rgba(155, 28, 49, 0.8)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 120; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = dx * dx + dy * dy;

      if (distance < 9000) {
        ctx.strokeStyle = "rgba(155, 28, 49, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animateBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  connectParticles();
  requestAnimationFrame(animateBackground);
}

initParticles();
animateBackground();
