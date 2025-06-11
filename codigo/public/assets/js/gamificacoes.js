let gameData = null;
let activityTypes = {};

const darkModeToggle = document.getElementById("darkModeToggle");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");
const addActivityBtn = document.getElementById("addActivityBtn");
const activityModal = document.getElementById("activityModal");
const closeModal = document.getElementById("closeModal");
const activityForm = document.getElementById("activityForm");
const activityTypes_elements = document.querySelectorAll(".activity-type");

async function fetchGameData() {
  try {
    const response = await fetch("../../../db/db.json");
    const json = await response.json();

    gameData = {
      user: {
        name: json.usuarios[0].nome,
        level: 5,
        xp: 1250,
        currentLevelXP: 250,
        nextLevelXP: 500,
      },
      activities: json.lista_atividades || [],
      achievements: json.medalhas.map((m) => ({
        id: m.id,
        name: m.nome,
        description: m.descricao,
        icon: m.icone,
        unlocked: m.conquistada,
      })),
      consecutiveDays: json.missoesDiarias.filter((m) => m.concluida).length,
    };

    activityTypes = {};
    const activitySelect = document.getElementById("activityType");
    activitySelect.innerHTML =
      '<option value="">Selecione uma atividade</option>';
    json.tiposDeAtividade.forEach((item) => {
      activityTypes[item.id] = {
        name: item.nome,
        xp: item.xp,
        icon: item.icone,
      };
      activitySelect.innerHTML += `<option value="${item.id}">${item.nome} (${item.xp} XP)</option>`;
    });

    updateUI();
    setupEventListeners();
    setupCalendar();
  } catch (error) {
    console.error("Erro ao carregar db.json", error);
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
  closeModal.addEventListener("click", () => hideModal());
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

  const icon = darkModeToggle.querySelector("i");
  icon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";

  const savedActivities = localStorage.getItem("activities");
  if (savedActivities) {
    gameData.activities = JSON.parse(savedActivities);
  }

  const savedUserData = localStorage.getItem("userData");
  if (savedUserData) {
    gameData.user = { ...gameData.user, ...JSON.parse(savedUserData) };
  }

  calculateConsecutiveDays();
}

function saveGameData() {
  localStorage.setItem("activities", JSON.stringify(gameData.activities));
  localStorage.setItem("userData", JSON.stringify(gameData.user));
}

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.remove("active");
  });
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

  const formData = new FormData(activityForm);
  const activityType =
    formData.get("activityType") ||
    document.getElementById("activityType").value;
  const activityDate =
    formData.get("activityDate") ||
    document.getElementById("activityDate").value;
  const activityNotes =
    formData.get("activityNotes") ||
    document.getElementById("activityNotes").value;

  if (!activityType || !activityDate) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  const existingActivity = gameData.activities.find(
    (activity) =>
      activity.date === activityDate && activity.type === activityType
  );

  if (existingActivity) {
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

function calculateConsecutiveDays() {
  if (gameData.activities.length === 0) {
    gameData.consecutiveDays = 0;
    return;
  }

  const sortedActivities = gameData.activities
    .map((activity) => activity.date)
    .sort((a, b) => new Date(b) - new Date(a));

  const uniqueDates = [...new Set(sortedActivities)];

  let consecutiveDays = 0;
  const today = new Date().toISOString().split("T")[0];

  if (uniqueDates[0] === today || uniqueDates[0] === getYesterday()) {
    consecutiveDays = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i - 1]);
      const previousDate = new Date(uniqueDates[i]);
      const dayDifference =
        (currentDate - previousDate) / (1000 * 60 * 60 * 24);

      if (dayDifference === 1) {
        consecutiveDays++;
      } else {
        break;
      }
    }
  }

  gameData.consecutiveDays = consecutiveDays;
}

function getYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

function checkAchievements() {
  // First activity
  if (gameData.activities.length >= 1) {
    unlockAchievement(1);
  }

  if (gameData.consecutiveDays >= 7) {
    unlockAchievement(2);
  }

  const meditationCount = gameData.activities.filter(
    (a) => a.type === "meditacao"
  ).length;
  if (meditationCount >= 10) {
    unlockAchievement(3);
  }

  const exerciseCount = gameData.activities.filter(
    (a) => a.type === "exercicio"
  ).length;
  if (exerciseCount >= 20) {
    unlockAchievement(4);
  }

  const gratitudeCount = gameData.activities.filter(
    (a) => a.type === "gratidao"
  ).length;
  if (gratitudeCount >= 30) {
    unlockAchievement(5);
  }

  const therapyCount = gameData.activities.filter(
    (a) => a.type === "terapia"
  ).length;
  if (therapyCount >= 5) {
    unlockAchievement(6);
  }
}

function unlockAchievement(achievementId) {
  const achievement = gameData.achievements.find((a) => a.id === achievementId);
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    showNotification(`Conquista desbloqueada: ${achievement.name}!`);
  }
}

function updateUI() {
  document.getElementById("consecutiveDays").textContent =
    gameData.consecutiveDays;
  document.getElementById("totalXP").textContent =
    gameData.user.xp.toLocaleString();
  document.getElementById("achievements").textContent =
    gameData.achievements.filter((a) => a.unlocked).length;
  document.getElementById("currentLevel").textContent = gameData.user.level;

  const progressPercentage =
    (gameData.user.currentLevelXP / gameData.user.nextLevelXP) * 100;
  document.getElementById(
    "progressFill"
  ).style.width = `${progressPercentage}%`;
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

  updateCalendar();
}

function updateTodayActivities() {
  const today = new Date().toISOString().split("T")[0];
  const todayActivities = gameData.activities.filter(
    (activity) => activity.date === today
  );

  const container = document.getElementById("todayActivities");

  if (todayActivities.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Nenhuma atividade registrada hoje.</p>';
    return;
  }

  container.innerHTML = todayActivities
    .map((activity) => {
      const activityInfo = activityTypes[activity.type];
      return `
            <div class="activity-item">
                <div class="activity-info">
                    <div class="activity-icon">
                        <i class="${activityInfo.icon}"></i>
                    </div>
                    <div>
                        <h4>${activityInfo.name}</h4>
                        ${
                          activity.notes
                            ? `<p style="font-size: 0.9rem; color: var(--text-secondary);">${activity.notes}</p>`
                            : ""
                        }
                    </div>
                </div>
                <div class="activity-xp">+${activity.xp} XP</div>
            </div>
        `;
    })
    .join("");
}

function updateAchievements() {
  const container = document.getElementById("achievementsList");

  container.innerHTML = gameData.achievements
    .map(
      (achievement) => `
        <div class="achievement-card ${achievement.unlocked ? "unlocked" : ""}">
            <div class="achievement-icon ${
              achievement.unlocked ? "unlocked" : "locked"
            }">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-info">
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
            </div>
        </div>
    `
    )
    .join("");
}

let currentDate = new Date();

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

  document.getElementById("currentMonth").textContent = `${
    monthNames[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

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
  const startingDayOfWeek = firstDay.getDay();

  const monthActivities = gameData.activities.filter((activity) => {
    const activityDate = new Date(activity.date);
    return (
      activityDate.getMonth() === currentDate.getMonth() &&
      activityDate.getFullYear() === currentDate.getFullYear()
    );
  });


  let calendarHTML = "";

  dayNames.forEach((day) => {
    calendarHTML += `<div class="calendar-day" style="font-weight: 600; background: var(--primary-green); color: white;">${day}</div>`;
  });

  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevMonthDay = new Date(firstDay);
    prevMonthDay.setDate(prevMonthDay.getDate() - (startingDayOfWeek - i));
    calendarHTML += `<div class="calendar-day other-month">${prevMonthDay.getDate()}</div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasActivity = monthActivities.some(
      (activity) => activity.date === dateString
    );

    calendarHTML += `
            <div class="calendar-day ${
              hasActivity ? "has-activity" : ""
            }" data-date="${dateString}">
                ${day}
                ${
                  hasActivity
                    ? '<div style="width: 6px; height: 6px; background: white; border-radius: 50%; margin-top: 2px;"></div>'
                    : ""
                }
            </div>
        `;
  }

 
  const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
  const remainingCells = totalCells - (daysInMonth + startingDayOfWeek);

  for (let i = 1; i <= remainingCells; i++) {
    calendarHTML += `<div class="calendar-day other-month">${i}</div>`;
  }

  document.getElementById("calendarGrid").innerHTML = calendarHTML;


  document
    .querySelectorAll(".calendar-day[data-date]")
    .forEach((dayElement) => {
      dayElement.addEventListener("click", () => {
        const date = dayElement.dataset.date;
        document.getElementById("activityDate").value = date;
        showModal();
      });
    });
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-green);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
