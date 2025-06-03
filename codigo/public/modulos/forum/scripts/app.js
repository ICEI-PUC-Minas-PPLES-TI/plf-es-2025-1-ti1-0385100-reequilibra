// ========== CONFIGURAÇÃO DA API ==========
const apiUrl = "http://localhost:3001"
const CURRENT_USER_ID = 1

// ========== VARIÁVEIS GLOBAIS MEMORIES ==========
const btnAddMemory = document.getElementById("btnAddMemory")
let selectedMemory = ""
let memoryID = ""
let boolSelectedMemory = false

// ========== VARIÁVEIS GLOBAIS FORUMS ==========
let selectedForum = ""
let forumID = ""
let boolSelectedForum = false

// ========== FUNÇÕES AUXILIARES ==========
function limpaCamposMemory() {
  document.getElementById("memoryCaption").value = ""
  document.getElementById("memoryImage").value = ""
  boolSelectedMemory = false
}

function limpaCamposForum() {
  document.getElementById("forumTitle").value = ""
  document.getElementById("forumContent").value = ""
  boolSelectedForum = false
}

function noMemorySelected() {
  if (!boolSelectedMemory) {
    document.getElementById("btnAddMemory").innerHTML = "Adicionar Memory"

    const allCards = document.querySelectorAll(".memory-card")
    allCards.forEach((card) => card.classList.remove("selected-memory"))
  } else {
    document.getElementById("btnAddMemory").innerHTML = "Atualizar Memory"
  }
}

function displayMessage(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `alert alert-${type === "success" ? "success" : "danger"} position-fixed`
  notification.style.cssText = "top: 100px; right: 20px; z-index: 9999; min-width: 300px;"
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// ========== MEMORIES CRUD ==========

// CREATE MEMORY
function createMemory(memoryObject, refreshFunction) {
  limpaCamposMemory()

  fetch(`${apiUrl}/memories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(memoryObject),
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Erro ao inserir memory")
        displayMessage("Erro ao inserir memory", "error")
        return
      }
      return response.json()
    })
    .then((data) => {
      displayMessage("Memory inserido com sucesso", "success")

      if (refreshFunction) {
        refreshFunction().then(() => {
          selecionaMemory(data.id)
        })
      }
    })
    .catch((error) => {
      console.error("Erro ao inserir memory via API:", error)
      displayMessage("Erro ao inserir memory", "error")
    })
}

// READ MEMORIES
function listaMemories() {
  return fetch(`${apiUrl}/memories?userId=${CURRENT_USER_ID}&_sort=createdAt&_order=desc`)
    .then((response) => response.json())
    .then((memories) => {
      renderMemories(memories)
      return memories
    })
    .catch((error) => {
      console.error("Erro ao carregar memories:", error)
      displayMessage("Erro ao carregar memories", "error")
    })
}

function renderMemories(memories) {
  const memoriesContainer = document.getElementById("memoriesContainer")
  memoriesContainer.innerHTML = ""

  memories.forEach((memory) => {
    const memoryDiv = document.createElement("div")
    memoryDiv.className = "memory-item"
    memoryDiv.innerHTML = `
            <div class="memory-card bg-white shadow-sm" id="cardMemory${memory.id}" onclick="selecionaMemory(${memory.id})">
                <img src="${memory.imageUrl}" class="memory-img" alt="Memory" onerror="this.src='https://via.placeholder.com/1200x400?text=Imagem+não+encontrada'">
                <div class="p-3">
                    <p class="mb-2">${memory.caption}</p>
                    <small class="text-muted">Postado em: ${new Date(memory.createdAt).toLocaleDateString("pt-BR")}</small>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="event.stopPropagation(); editMemory(${memory.id})">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteMemory(${memory.id}, listaMemories)">
                            <i class="bi bi-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        `
    memoriesContainer.appendChild(memoryDiv)
  })
}

// UPDATE MEMORY
function updateMemory(id, memory, refreshFunction) {
  fetch(`${apiUrl}/memories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(memory),
  })
    .then((response) => response.json())
    .then((data) => {
      displayMessage("Memory alterado com sucesso", "success")
      if (refreshFunction) {
        boolSelectedMemory = true
        refreshFunction().then(() => {
          selecionaMemory(id)
          noMemorySelected()
        })
      }
    })
    .catch((error) => {
      console.error("Erro ao atualizar memory:", error)
      displayMessage("Erro ao atualizar memory", "error")
    })
}

// DELETE MEMORY
function deleteMemory(id, refreshFunction) {
  if (!id) {
    displayMessage("Nenhum memory foi selecionado para exclusão", "error")
    return
  }

  if (!confirm("Tem certeza que deseja excluir este memory?")) {
    return
  }

  fetch(`${apiUrl}/memories/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Memory não encontrado")
        displayMessage("Memory não encontrado", "error")
        return
      } else {
        displayMessage("Memory removido com sucesso", "success")
      }

      if (refreshFunction) {
        refreshFunction()
        limpaCamposMemory()
        noMemorySelected()
      }
    })
    .catch((error) => {
      console.error("Erro ao deletar memory:", error)
      displayMessage("Erro ao deletar memory", "error")
    })
}

function selecionaMemory(id) {
  boolSelectedMemory = true
  noMemorySelected()

  fetch(`${apiUrl}/memories/${id}`)
    .then((response) => response.json())
    .then((data) => {
      const selectedCaption = document.getElementById("memoryCaption")

      selectedCaption.value = data.caption

      console.log("Caption do memory selecionado:", selectedCaption.value)
      selectedMemory = id
    })

  console.log("ID do memory selecionado:", selectedMemory)

  const allCards = document.querySelectorAll(".memory-card")
  allCards.forEach((card) => card.classList.remove("selected-memory"))

  const card = document.getElementById(`cardMemory${id}`)
  if (card) {
    card.classList.add("selected-memory")
  }
}

function editMemory(id) {
  fetch(`${apiUrl}/memories/${id}`)
    .then((response) => response.json())
    .then((memory) => {
      const newCaption = prompt("Editar legenda:", memory.caption)
      if (newCaption !== null && newCaption.trim() !== memory.caption) {
        const updatedMemory = {
          ...memory,
          caption: newCaption.trim(),
        }

        updateMemory(id, updatedMemory, listaMemories)
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar memory:", error)
      displayMessage("Erro ao buscar memory", "error")
    })
}

// ========== FORUMS CRUD ==========

// CREATE FORUM
function createForum(forumObject, refreshFunction) {
  limpaCamposForum()

  fetch(`${apiUrl}/forums`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(forumObject),
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Erro ao inserir fórum")
        displayMessage("Erro ao inserir fórum", "error")
        return
      }
      return response.json()
    })
    .then((data) => {
      displayMessage("Fórum inserido com sucesso", "success")

      if (refreshFunction) {
        refreshFunction().then(() => {
          selecionaForum(data.id)
        })
      }
    })
    .catch((error) => {
      console.error("Erro ao inserir fórum via API:", error)
      displayMessage("Erro ao inserir fórum", "error")
    })
}

// READ FORUMS
function listaForums() {
  return fetch(`${apiUrl}/forums?_sort=createdAt&_order=desc`)
    .then((response) => response.json())
    .then((forums) => {
      renderForums(forums)
      return forums
    })
    .catch((error) => {
      console.error("Erro ao carregar fóruns:", error)
      displayMessage("Erro ao carregar fóruns", "error")
    })
}

function renderForums(forums) {
  const forumsContainer = document.querySelector(".list-group")
  forumsContainer.innerHTML = ""

  forums.forEach((forum, index) => {
    const forumDiv = document.createElement("div")
    forumDiv.className = `list-group-item list-group-item-action forum-card ${index === 0 ? "active-forum" : ""}`
    forumDiv.id = `cardForum${forum.id}`
    forumDiv.onclick = () => selecionaForum(forum.id)

    forumDiv.innerHTML = `
            <div class="d-flex justify-content-between">
                <h6 class="mb-1">${forum.title}</h6>
                <small class="text-muted">${getTimeAgo(forum.createdAt)}</small>
            </div>
            <p class="mb-1 small">${forum.content.substring(0, 100)}${forum.content.length > 100 ? "..." : ""}</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                    Postado por ${forum.author} 
                    ${forum.isHealthProfessional ? '<span class="badge bg-success ms-1">Profissional</span>' : ""}
                </small>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="event.stopPropagation(); editForum(${forum.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteForum(${forum.id}, listaForums)">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `
    forumsContainer.appendChild(forumDiv)
  })
}

// UPDATE FORUM
function updateForum(id, forum, refreshFunction) {
  fetch(`${apiUrl}/forums/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(forum),
  })
    .then((response) => response.json())
    .then((data) => {
      displayMessage("Fórum alterado com sucesso", "success")
      if (refreshFunction) {
        boolSelectedForum = true
        refreshFunction().then(() => {
          selecionaForum(id)
        })
      }
    })
    .catch((error) => {
      console.error("Erro ao atualizar fórum:", error)
      displayMessage("Erro ao atualizar fórum", "error")
    })
}

// DELETE FORUM
function deleteForum(id, refreshFunction) {
  if (!id) {
    displayMessage("Nenhum fórum foi selecionado para exclusão", "error")
    return
  }

  if (!confirm("Tem certeza que deseja excluir este fórum?")) {
    return
  }

  fetch(`${apiUrl}/forums/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Fórum não encontrado")
        displayMessage("Fórum não encontrado", "error")
        return
      } else {
        displayMessage("Fórum removido com sucesso", "success")
      }

      if (refreshFunction) {
        refreshFunction()
        limpaCamposForum()
      }
    })
    .catch((error) => {
      console.error("Erro ao deletar fórum:", error)
      displayMessage("Erro ao deletar fórum", "error")
    })
}

function selecionaForum(id) {
  boolSelectedForum = true

  fetch(`${apiUrl}/forums/${id}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Fórum selecionado:", data.title)
      selectedForum = id
    })

  console.log("ID do fórum selecionado:", selectedForum)

  const allCards = document.querySelectorAll(".forum-card")
  allCards.forEach((card) => card.classList.remove("active-forum"))

  const card = document.getElementById(`cardForum${id}`)
  if (card) {
    card.classList.add("active-forum")
  }
}

function editForum(id) {
  fetch(`${apiUrl}/forums/${id}`)
    .then((response) => response.json())
    .then((forum) => {
      const newTitle = prompt("Editar título:", forum.title)
      if (newTitle !== null && newTitle.trim() !== forum.title) {
        const newContent = prompt("Editar conteúdo:", forum.content)
        if (newContent !== null) {
          const updatedForum = {
            ...forum,
            title: newTitle.trim(),
            content: newContent.trim(),
          }

          updateForum(id, updatedForum, listaForums)
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar fórum:", error)
      displayMessage("Erro ao buscar fórum", "error")
    })
}

// ========== FUNÇÕES AUXILIARES ==========
function getTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return "há 1 dia"
  if (diffDays < 7) return `há ${diffDays} dias`
  if (diffDays < 14) return "há 1 semana"
  return `há ${Math.floor(diffDays / 7)} semanas`
}

// ========== EVENT LISTENERS ==========
document.addEventListener("DOMContentLoaded", () => {
  // Carrega dados iniciais
  listaMemories()
  listaForums()

  // Event listener para adicionar memory
  if (btnAddMemory) {
    btnAddMemory.addEventListener("click", (event) => {
      event.preventDefault()
      const caption = document.getElementById("memoryCaption").value
      const fileInput = document.getElementById("memoryImage")
      const date = new Date()

      if (!fileInput.files[0] && !caption.trim()) {
        displayMessage("Adicione uma foto ou legenda", "error")
        return
      }

      // Gera o ID
      memoryID = Date.now()

      let imageUrl = "https://via.placeholder.com/1200x400?text=New+Memory"
      if (fileInput.files[0]) {
        imageUrl = URL.createObjectURL(fileInput.files[0])
      }

      // Cria um objeto com os dados do memory
      const memoryObject = {
        id: memoryID,
        userId: CURRENT_USER_ID,
        imageUrl: imageUrl,
        caption: caption.trim() || "Sem legenda",
        createdAt: date.toISOString(),
      }

      if (!boolSelectedMemory) {
        createMemory(memoryObject, listaMemories)
      } else {
        updateMemory(selectedMemory, memoryObject, listaMemories)
      }
    })
  }

  // Event listener para criar fórum no modal
  const createForumBtn = document.querySelector("#novoForumModal .btn-custom")
  if (createForumBtn) {
    createForumBtn.addEventListener("click", () => {
      const title = document.getElementById("forumTitle").value
      const content = document.getElementById("forumContent").value
      const date = new Date()

      if (!title.trim() || !content.trim()) {
        displayMessage("Preencha todos os campos", "error")
        return
      }

      // Gera o ID
      forumID = Date.now()

      const forumObject = {
        id: forumID,
        title: title.trim(),
        content: content.trim(),
        author: "Usuario Atual",
        createdAt: date.toISOString(),
        isHealthProfessional: false,
        replies: 0,
      }

      createForum(forumObject, listaForums)

      // Fecha o modal
      const modal = window.bootstrap.Modal.getInstance(document.getElementById("novoForumModal"))
      modal.hide()
    })
  }

  // Inicializa estado dos memories
  noMemorySelected()

  console.log("Aplicação inicializada com sucesso!")
})
