document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initMobileMenu();
  initSmoothScroll();
  initSaibaMais();
  initHeaderScroll();
  initIntersectionAnimations();
  initHeroStatsCounter();
});
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector("i");
  const body = document.body;
  const currentTheme = localStorage.getItem("theme") || "light";

  body.setAttribute("data-theme", currentTheme);
  updateThemeIcon(themeIcon, currentTheme);

  themeToggle.addEventListener("click", () => {
    const newTheme =
      body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(themeIcon, newTheme);
  });
}

function updateThemeIcon(icon, theme) {
  icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}
function initMobileMenu() {
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");

  mobileToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    mobileToggle.classList.toggle("active");
  });
}
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        document.getElementById("navMenu").classList.remove("active");
        document.getElementById("mobileToggle").classList.remove("active");
      }
    });
  });
}
function initSaibaMais() {
  const saibaMaisBtn = document.getElementById("saibaMais");
  const aboutSection = document.getElementById("about");
  saibaMaisBtn.addEventListener("click", () => {
    aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
function initHeaderScroll() {
  const header = document.querySelector(".header");
  const body = document.body;

  window.addEventListener("scroll", () => {
    const theme = body.getAttribute("data-theme");
    const bg =
      theme === "dark"
        ? window.scrollY > 100
          ? "rgba(15,15,15,0.98)"
          : "rgba(15,15,15,0.95)"
        : window.scrollY > 100
        ? "rgba(255,255,255,0.98)"
        : "rgba(255,255,255,0.95)";
    header.style.background = bg;
  });
}
function initHeroStatsCounter() {
  const heroStats = document.querySelector(".hero-stats");
  if (!heroStats) return;

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target
            .querySelectorAll(".stat-number")
            .forEach((stat, index) => {
              const targets = [1000, 95, 24];
              animateCounter(stat, targets[index]);
            });
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statsObserver.observe(heroStats);
}

function animateCounter(element, target) {
  let current = 0;
  const increment = target / 100;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent =
      target === 95
        ? `${Math.floor(current)}%`
        : target === 1000
        ? `${Math.floor(current)}+`
        : current;
  }, 20);
}
