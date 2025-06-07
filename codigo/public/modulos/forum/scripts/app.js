// ========== CONFIGURAÇÃO DA API ==========
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

// ========== VERIFICAÇÃO DE CONEXÃO ==========
function checkServerConnection() {
  return fetch("/forums?_limit=1")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Servidor não responde")
      }
      return true
    })
    .catch((error) => {
      console.error("Erro de conexão com o servidor:", error)
      showErrorModal()
      return false
    })
}

function showErrorModal() {
  const errorModal = document.getElementById("errorModal")
  if (errorModal) {
    errorModal.style.display = "block"
  }
}

// ========== FUNÇÕES AUXILIARES ==========
function limpaCamposMemory() {
  document.getElementById("memoryCaption").value = ""
  document.getElementById("memoryImage").value = ""
  boolSelectedMemory = false
}

function limpaCamposForum() {
  document.getElementById("forumTitle").value = ""
  document.getElementById("forumContent").value = ""
  document.getElementById("forumAuthor").value = ""
  document.getElementById("forumIsHealthProfessional").checked = false
  boolSelectedForum = false
}

function noMemorySelected() {
  if (!boolSelectedMemory) {
    if (document.getElementById("btnAddMemory")) {
      document.getElementById("btnAddMemory").innerHTML = "Adicionar Memory"
    }

    const allCards = document.querySelectorAll(".memory-card")
    allCards.forEach((card) => card.classList.remove("selected-memory"))
  } else {
    if (document.getElementById("btnAddMemory")) {
      document.getElementById("btnAddMemory").innerHTML = "Atualizar Memory"
    }
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

  fetch("/memories", {
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
      if (data) {
        displayMessage("Memory inserido com sucesso", "success")

        if (refreshFunction) {
          refreshFunction().then(() => {
            selecionaMemory(data.id)
          })
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao inserir memory via API:", error)
      displayMessage("Erro ao inserir memory", "error")
    })
}

// READ MEMORIES
function listaMemories() {
  const memoriesContainer = document.getElementById("memoriesContainer")

  return fetch(`/memories?userId=${CURRENT_USER_ID}&_sort=createdAt&_order=desc`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao carregar memories")
      }
      return response.json()
    })
    .then((memories) => {
      renderMemories(memories)
      return memories
    })
    .catch((error) => {
      console.error("Erro ao carregar memories:", error)
      if (memoriesContainer) {
        memoriesContainer.innerHTML = `
          <div class="alert alert-warning text-center">
            <i class="bi bi-exclamation-triangle"></i>
            Erro ao carregar memories. Verifique se o servidor está rodando.
          </div>
        `
      }
      displayMessage("Erro ao carregar memories", "error")
    })
}

function renderMemories(memories) {
  const memoriesContainer = document.getElementById("memoriesContainer")
  if (!memoriesContainer) return

  memoriesContainer.innerHTML = ""

  if (memories.length === 0) {
    memoriesContainer.innerHTML = `
      <div class="alert alert-info text-center">
        <i class="bi bi-info-circle"></i>
        Nenhum memory encontrado. Adicione seu primeiro memory!
      </div>
    `
    return
  }

  memories.forEach((memory) => {
    const memoryDiv = document.createElement("div")
    memoryDiv.className = "memory-item"
    memoryDiv.innerHTML = `
      <div class="memory-card bg-white shadow-sm" id="cardMemory${memory.id}" onclick="selecionaMemory('${memory.id}')">
          <img src="${memory.imageUrl}" class="memory-img" alt="Memory" onerror="this.src='https://via.placeholder.com/1200x400?text=Imagem+não+encontrada'">
          <div class="p-3">
              <p class="mb-2">${memory.caption}</p>
              <small class="text-muted">Postado em: ${new Date(memory.createdAt).toLocaleDateString("pt-BR")}</small>
              <div class="mt-2">
                  <button class="btn btn-sm btn-outline-primary me-2" onclick="event.stopPropagation(); editMemory('${memory.id}')">
                      <i class="bi bi-pencil"></i> Editar
                  </button>
                  <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteMemory('${memory.id}', listaMemories)">
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
  fetch(`/memories/${id}`, {
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

  fetch(`/memories/${id}`, {
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

  fetch(`/memories/${id}`)
    .then((response) => response.json())
    .then((data) => {
      const selectedCaption = document.getElementById("memoryCaption")
      if (selectedCaption) {
        selectedCaption.value = data.caption
      }

      console.log("Caption do memory selecionado:", data.caption)
      selectedMemory = id
    })
    .catch((error) => {
      console.error("Erro ao buscar memory:", error)
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
  fetch(`/memories/${id}`)
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

  fetch("/forums", {
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
      if (data) {
        displayMessage("Fórum inserido com sucesso", "success")

        if (refreshFunction) {
          refreshFunction().then(() => {
            selecionaForum(data.id)
          })
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao inserir fórum via API:", error)
      displayMessage("Erro ao inserir fórum", "error")
    })
}

// READ FORUMS
function listaForums() {
  const forumsContainer = document.querySelector(".list-group")

  return fetch("/forums?_sort=createdAt&_order=desc")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao carregar fóruns")
      }
      return response.json()
    })
    .then((forums) => {
      renderForums(forums)
      return forums
    })
    .catch((error) => {
      console.error("Erro ao carregar fóruns:", error)
      if (forumsContainer) {
        forumsContainer.innerHTML = `
          <div class="alert alert-warning text-center">
            <i class="bi bi-exclamation-triangle"></i>
            Erro ao carregar fóruns. Verifique se o servidor está rodando.
          </div>
        `
      }
      displayMessage("Erro ao carregar fóruns", "error")
    })
}

function renderForums(forums) {
  const forumsContainer = document.querySelector(".list-group")
  if (!forumsContainer) return

  forumsContainer.innerHTML = ""

  if (forums.length === 0) {
    forumsContainer.innerHTML = `
      <div class="alert alert-info text-center">
        <i class="bi bi-info-circle"></i>
        Nenhum fórum encontrado. Crie o primeiro fórum!
      </div>
    `
    return
  }

  forums.forEach((forum, index) => {
    const forumDiv = document.createElement("div")
    forumDiv.className = `list-group-item list-group-item-action forum-card ${index === 0 ? "active-forum" : ""}`
    forumDiv.id = `cardForum${forum.id}`

    // Modificado para redirecionar ao clicar no fórum
    forumDiv.onclick = (event) => {
      // Não redireciona se clicou em botão
      if (event.target.closest("button")) return

      // Redireciona para a página de detalhes
      window.location.href = `forum-detalhes.html?id=${forum.id}`
    }

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
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="event.stopPropagation(); editForum('${forum.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteForum('${forum.id}', listaForums)">
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
  fetch(`/forums/${id}`, {
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

  fetch(`/forums/${id}`, {
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

function editForum(id) {
  fetch(`/forums/${id}`)
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

function selecionaForum(id) {
  boolSelectedForum = true
  console.log("ID do fórum selecionado:", id)
  selectedForum = id
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
  // Verifica conexão com o servidor primeiro
  checkServerConnection().then((isConnected) => {
    if (isConnected) {
      // Carrega dados iniciais apenas se conectado
      listaMemories()
      listaForums()
    }
  })

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

      // Gera o ID como STRING
      memoryID = Date.now().toString()

      // Para demonstração, vamos usar imagens placeholder ou converter para base64
      const imageUrl = "https://via.placeholder.com/1200x400?text=New+Memory"

      if (fileInput.files[0]) {
        // Converte a imagem para base64 para persistir no JSON
        const reader = new FileReader()
        reader.onload = (e) => {
          const memoryObject = {
            id: memoryID, // STRING
            userId: CURRENT_USER_ID,
            imageUrl: e.target.result, // Base64 da imagem
            caption: caption.trim() || "Sem legenda",
            createdAt: date.toISOString(),
          }

          if (!boolSelectedMemory) {
            createMemory(memoryObject, listaMemories)
          } else {
            updateMemory(selectedMemory, memoryObject, listaMemories)
          }
        }
        reader.readAsDataURL(fileInput.files[0])
      } else {
        // Sem imagem, apenas legenda
        const memoryObject = {
          id: memoryID, // STRING
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
      }
    })
  }

  // Event listener para criar fórum no modal
  const createForumBtn = document.getElementById("btnCreateForum")
  if (createForumBtn) {
    createForumBtn.addEventListener("click", () => {
      const title = document.getElementById("forumTitle").value
      const content = document.getElementById("forumContent").value
      const author = document.getElementById("forumAuthor").value
      const isHealthProfessional = document.getElementById("forumIsHealthProfessional").checked
      const date = new Date()

      if (!title.trim() || !content.trim() || !author.trim()) {
        displayMessage("Preencha todos os campos", "error")
        return
      }

      // Gera o ID como STRING
      forumID = Date.now().toString()

      const forumObject = {
        id: forumID, // STRING
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        createdAt: date.toISOString(),
        isHealthProfessional: isHealthProfessional,
        commentsCount: 0,
      }

      createForum(forumObject, listaForums)

      // Fecha o modal
      const modal = document.getElementById("novoForumModal")
      if (modal) {
        modal.style.display = "none"
      }
    })
  }

  // Inicializa estado dos memories
  noMemorySelected()

  console.log("Aplicação inicializada com sucesso!")
})
