let gameData = null;
let activityTypes = {};

const darkModeToggle = document.getElementById("darkModeToggle");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");
const addActivityBtn = document.getElementById("addActivityBtn");
const activityModal = document.getElementById("activityModal");
const closeActivityModal = document.getElementById("closeActivityModal");
const activityForm = document.getElementById("activityForm");
const activityTypes_elements = document.querySelectorAll(".activity-type");

async function fetchGameData() {
  try {
    const baseURL = "http://localhost:3000";

    const [
      usuarios,
      medalhas,
      tiposDeAtividade,
      missoesDiarias,
      lista_atividades,
      recompensas,
    ] = await Promise.all([
      fetch(`${baseURL}/usuarios`).then((res) => res.json()),
      fetch(`${baseURL}/medalhas`).then((res) => res.json()),
      fetch(`${baseURL}/tiposDeAtividade`).then((res) => res.json()),
      fetch(`${baseURL}/missoesDiarias`).then((res) => res.json()),
      fetch(`${baseURL}/lista_atividades`).then((res) => res.json()),
      fetch(`${baseURL}/recompensas`).then((res) => res.json()),
    ]);

    if (!usuarios[0]) throw new Error("Usuário não encontrado.");

    gameData = {
      user: {
        name: usuarios[0].nome,
        level: 1,
        xp: 0,
        currentLevelXP: 0,
        nextLevelXP: 500,
      },
      activities: lista_atividades || [],
      achievements: medalhas.map((m) => ({
        ...m,
        progresso: m.progresso || 0,
        conquistada: m.conquistada || false,
      })),
      rewards: recompensas || [],
      consecutiveDays: missoesDiarias.filter((m) => m.concluida).length,
    };

    // Preencher tipos de atividade
    activityTypes = {};
    const activitySelect = document.getElementById("activityType");
    if (activitySelect) {
      activitySelect.innerHTML =
        '<option value="">Selecione uma atividade</option>';
      tiposDeAtividade.forEach((item) => {
        activityTypes[item.id] = {
          name: item.nome,
          xp: item.xp,
          icon: item.icone,
        };
        activitySelect.innerHTML += `<option value="${item.id}">${item.nome} (${item.xp} XP)</option>`;
      });
    }

    loadGameData();
    updateUI();
    setupEventListeners();
    setupCalendar();
  } catch (error) {
    console.error("Erro ao carregar dados da API JSON Server:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetchGameData();
  document.getElementById("activityDate").value = new Date()
    .toISOString()
    .split("T")[0];
});

function setupEventListeners() {
  darkModeToggle.addEventListener("click", toggleDarkMode);

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSection = link.getAttribute("href").substring(1);
      showSection(targetSection);

      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  addActivityBtn.addEventListener("click", () => showModal());
  closeActivityModal.addEventListener("click", () => hideModal());

  activityModal.addEventListener("click", (e) => {
    if (e.target === activityModal) hideModal();
  });

  activityForm.addEventListener("submit", handleActivitySubmit);

  activityTypes_elements.forEach((element) => {
    element.addEventListener("click", () => {
      const activityType = element.dataset.type;
      document.getElementById("activityType").value = activityType;
      showModal();
    });
  });
}

function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  const icon = darkModeToggle.querySelector("i");
  icon.className = newTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

function loadGameData() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  darkModeToggle.querySelector("i").className =
    savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";

  const savedActivities = localStorage.getItem("activities");
  if (savedActivities) {
    gameData.activities = JSON.parse(savedActivities);
  }

  const savedUserData = localStorage.getItem("userData");
  if (savedUserData) {
    gameData.user = { ...gameData.user, ...JSON.parse(savedUserData) };
  }

  const savedAchievements = localStorage.getItem("achievements");
  if (savedAchievements) {
    gameData.achievements = JSON.parse(savedAchievements);
  }

  const savedRewards = localStorage.getItem("rewards");
  if (savedRewards) {
    gameData.rewards = JSON.parse(savedRewards);
  }

  calculateConsecutiveDays();
}

function saveGameData() {
  localStorage.setItem("activities", JSON.stringify(gameData.activities));
  localStorage.setItem("userData", JSON.stringify(gameData.user));
  localStorage.setItem("achievements", JSON.stringify(gameData.achievements));
  localStorage.setItem("rewards", JSON.stringify(gameData.rewards));
}

function showSection(sectionId) {
  sections.forEach((section) => section.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
}

function showModal() {
  activityModal.classList.add("active");
}

function hideModal() {
  activityModal.classList.remove("active");
  activityForm.reset();
  document.getElementById("activityDate").value = new Date()
    .toISOString()
    .split("T")[0];
}

function handleActivitySubmit(e) {
  e.preventDefault();

  const activityType = document.getElementById("activityType").value;
  const activityDate = document.getElementById("activityDate").value;
  const activityNotes = document.getElementById("activityNotes").value;

  if (!activityType || !activityDate) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  const alreadyExists = gameData.activities.some(
    (a) => a.date === activityDate && a.type === activityType
  );

  if (alreadyExists) {
    alert("Você já registrou esta atividade para esta data.");
    return;
  }

  const activity = {
    id: Date.now(),
    type: activityType,
    date: activityDate,
    notes: activityNotes,
    xp: activityTypes[activityType].xp,
  };

  gameData.activities.push(activity);
  gameData.user.xp += activity.xp;
  gameData.user.currentLevelXP += activity.xp;

  checkLevelUp();
  calculateConsecutiveDays();
  checkAchievements();
  checkRewardsProgress(activity);

  saveGameData();
  updateUI();
  hideModal();
  showNotification(`Atividade registrada! +${activity.xp} XP`);
}

function checkLevelUp() {
  while (gameData.user.currentLevelXP >= gameData.user.nextLevelXP) {
    gameData.user.currentLevelXP -= gameData.user.nextLevelXP;
    gameData.user.level++;
    gameData.user.nextLevelXP = gameData.user.level * 100;

    showNotification(
      `Parabéns! Você subiu para o nível ${gameData.user.level}!`
    );
  }
}

function checkAchievements() {
  gameData.achievements.forEach((achievement) => {
    if (achievement.conquistada || !achievement.objetivo) return;

    let count = 0;

    const typeMap = {
      terapeuta: "terapia",
      meditador: "meditacao",
      atleta: "exercicio",
      grato: "gratidao",
    };

    const nameKey = achievement.nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    for (const key in typeMap) {
      if (nameKey.includes(key)) {
        count = gameData.activities.filter(
          (a) => a.type === typeMap[key]
        ).length;
        break;
      }
    }

    if (nameKey.includes("escritor")) {
      count = (gameData.diario || []).filter((d) => d.userid === "1").length;
    }

    if (nameKey.includes("mestre")) {
      count = gameData.user.level;
    }

    achievement.progresso = count;

    if (count >= achievement.objetivo) {
      achievement.conquistada = true;
      showNotification(`Conquista desbloqueada: ${achievement.nome}!`);
    }
  });
}

function countDiarioEntries() {
  const diario = gameData.diario || [];
  return diario.filter((entry) => entry.userid === "1").length;
}

function unlockAchievement(id) {
  const ach = gameData.achievements.find((a) => a.id === id);
  if (ach && !ach.conquistada) {
    ach.conquistada = true;
    showNotification(`Conquista desbloqueada: ${ach.nome}!`);
  }
}

function checkRewardsProgress(activity) {
  gameData.rewards.forEach((r) => {
    if (r.completa) return;
    const match =
      r.tipo === activity.type ||
      (r.tipo === "diario" && activity.type === "gratidao");
    if (match) {
      r.completa = true;
      showNotification(`Recompensa completa: ${r.titulo}!`);
    }
  });
}

function calculateConsecutiveDays() {
  const dates = [...new Set(gameData.activities.map((a) => a.date))].sort(
    (a, b) => new Date(b) - new Date(a)
  );
  let count = 0;
  const today = new Date().toISOString().split("T")[0];

  if (dates[0] === today || dates[0] === getYesterday()) {
    count = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff =
        (new Date(dates[i - 1]) - new Date(dates[i])) / (1000 * 60 * 60 * 24);
      if (diff === 1) count++;
      else break;
    }
  }

  gameData.consecutiveDays = count;
}

function getYesterday() {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return y.toISOString().split("T")[0];
}

function updateUI() {
  document.getElementById("consecutiveDays").textContent =
    gameData.consecutiveDays;
  document.getElementById("totalXP").textContent =
    gameData.user.xp.toLocaleString();
  document.getElementById("achievements").textContent =
    gameData.achievements.filter((a) => a.conquistada).length;
  document.getElementById("currentLevel").textContent = gameData.user.level;
  document.getElementById("progressFill").style.width = `${
    (gameData.user.currentLevelXP / gameData.user.nextLevelXP) * 100
  }%`;
  document.getElementById("currentXP").textContent =
    gameData.user.currentLevelXP;
  document.getElementById("nextLevelXP").textContent =
    gameData.user.nextLevelXP;
  document.querySelector(".user-name").textContent = gameData.user.name;
  document.querySelector(
    ".user-level"
  ).textContent = `Nível ${gameData.user.level}`;
  updateTodayActivities();
  updateAchievements();
  updateRewardsUI();
  updateCalendar();
}

function updateTodayActivities() {
  const today = new Date().toISOString().split("T")[0];
  const activities = gameData.activities.filter((a) => a.date === today);
  const container = document.getElementById("todayActivities");

  if (!activities.length) {
    container.innerHTML =
      '<p style="text-align:center;">Nenhuma atividade registrada hoje.</p>';
    return;
  }

  container.innerHTML = activities
    .map((a) => {
      const info = activityTypes[a.type];
      return `<div class="activity-item">
        <div class="activity-info">
          <div class="activity-icon"><i class="${info.icon}"></i></div>
          <div>
            <h4>${info.name}</h4>
            ${a.notes ? `<p>${a.notes}</p>` : ""}
          </div>
        </div>
        <div class="activity-xp">+${a.xp} XP</div>
      </div>`;
    })
    .join("");
}
function updateAchievements() {
  const container = document.getElementById("achievementsList");

  container.innerHTML = gameData.achievements
    .map((achievement) => {
      const isUnlocked = achievement.conquistada;
      const progressBar = achievement.objetivo
        ? `
          <div class="achievement-progress-bar">
            <div class="progress-fill" style="width: ${
              (achievement.progresso / achievement.objetivo) * 100
            }%"></div>
          </div>
          <p class="progress-text">${achievement.progresso || 0} / ${
            achievement.objetivo
          }</p>
        `
        : "";

      return `
        <div class="achievement-card ${isUnlocked ? "unlocked" : ""}">
          <div class="achievement-icon">
            <i class="${achievement.icone}"></i>
          </div>
          <div class="achievement-info">
            <h4>${achievement.nome}</h4>
            <p>${achievement.descricao}</p>
            ${progressBar}
          </div>
        </div>
      `;
    })
    .join("");
}

function updateRewardsUI() {
  const container = document.getElementById("rewardsList");
  if (!container) return;

  container.innerHTML = gameData.rewards
    .map(
      (r) => `<div class="reward-card ${r.completa ? "completed" : ""}">
      <div class="reward-icon"><i class="${r.icone}"></i></div>
      <div class="reward-info">
        <h4>${r.titulo}</h4>
        <p>${r.descricao}</p>
        <span class="reward-points">${r.pontos} XP</span>
      </div>
    </div>`
    )
    .join("");
}

function setupCalendar() {
  document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
  });
}

let currentDate = new Date();

function updateCalendar() {
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  document.getElementById("currentMonth").textContent = `${
    monthNames[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

  const monthActivities = gameData.activities.filter((a) => {
    const d = new Date(a.date);
    return (
      d.getMonth() === currentDate.getMonth() &&
      d.getFullYear() === currentDate.getFullYear()
    );
  });

  let html = "";
  dayNames.forEach((d) => {
    html += `<div class="calendar-day" style="font-weight:bold;">${d}</div>`;
  });

  for (let i = 0; i < startDay; i++) {
    html += `<div class="calendar-day other-month"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasActivity = monthActivities.some((a) => a.date === date);
    html += `<div class="calendar-day ${
      hasActivity ? "has-activity" : ""
    }" data-date="${date}">
      ${day}${hasActivity ? '<div class="dot"></div>' : ""}
    </div>`;
  }

  const total = Math.ceil((daysInMonth + startDay) / 7) * 7;
  const rem = total - (daysInMonth + startDay);
  for (let i = 0; i < rem; i++) {
    html += `<div class="calendar-day other-month"></div>`;
  }

  document.getElementById("calendarGrid").innerHTML = html;

  document.querySelectorAll(".calendar-day[data-date]").forEach((el) => {
    el.addEventListener("click", () => {
      document.getElementById("activityDate").value = el.dataset.date;
      showModal();
    });
  });
}

function countType(type) {
  return gameData.activities.filter((a) => a.type === type).length;
}

function showNotification(msg) {
  const n = document.createElement("div");
  n.style.cssText = `
    position: fixed; top: 100px; right: 20px;
    background: var(--primary-green); color: white;
    padding: 1rem 1.5rem; border-radius: 8px; box-shadow: var(--shadow);
    z-index: 3000; transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  n.textContent = msg;
  document.body.appendChild(n);

  setTimeout(() => (n.style.transform = "translateX(0)"), 100);
  setTimeout(() => {
    n.style.transform = "translateX(100%)";
    setTimeout(() => document.body.removeChild(n), 300);
  }, 3000);
}
