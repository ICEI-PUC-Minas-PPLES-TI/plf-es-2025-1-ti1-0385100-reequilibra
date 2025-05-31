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
