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
