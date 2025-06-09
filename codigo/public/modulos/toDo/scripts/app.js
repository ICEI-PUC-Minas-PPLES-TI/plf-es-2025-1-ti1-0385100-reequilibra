document.getElementById("listaTarefas").innerHTML = "";

let tarefaSelecionada = null;

function listaTarefas() {
  const userid = "1";
  const url = `http://localhost:3000/toDo?userid=${userid}`;
  const listaContainer = document.getElementById("listaTarefas");

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      listaContainer.innerHTML = "";

      if (data.length === 0) {
        listaContainer.innerHTML =
          "<p class='text-muted'>Nenhuma tarefa encontrada.</p>";
        return;
      }

      data.forEach((tarefa) => {
        const card = document.createElement("div");
        card.classList.add("card", "mb-2", "shadow-sm", "p-2");
        card.style.cursor = "pointer";

        let statusColor = "#f8f9fa";
        if (tarefa.status === "1") statusColor = "#fff3cd";
        if (tarefa.status === "2") statusColor = "#ADD8E6";
        if (tarefa.status === "3") statusColor = "#d4edda";

        card.style.backgroundColor = statusColor;

        card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">${tarefa.titulo}</h5>
            <small class="text-muted">Status: ${
              tarefa.status === "1"
                ? "Pendente"
                : tarefa.status === "2"
                ? "Em Progresso"
                : "Concluído"
            }</small>
          </div>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-secondary" onclick="abrirModalEdicao('${
              tarefa.id
            }', '${tarefa.titulo}', ${tarefa.status})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deletaTarefa('${
              tarefa.id
            }')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;

        listaContainer.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Erro ao buscar tarefas:", error);
      listaContainer.innerHTML =
        "<p class='text-danger'>Erro ao carregar tarefas.</p>";
    });
}

function criaTarefa() {
  const userid = "1";
  const titulo = document.getElementById("tituloTarefa").value;
  const url = `http://localhost:3000/toDo`;
  if (titulo == "" || !titulo) {
    alert("Titulo está vazio!");
    return;
  }
  const novaTarefa = {
    titulo,
    status: "1",
    userid,
  };
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(novaTarefa),
  })
    .then((res) => res.json)
    .then((data) => {
      document.getElementById("tituloTarefa").value = "";
      listaTarefas();
    })
    .catch((erro) => {
      console.error(erro);
      alert("Erro ao adicionar tarefa!");
    });
}
function limpaCampos() {
  document.getElementById("tituloTarefa").value = "";
}
function deletaTarefa(id) {
  const url = `http://localhost:3000/toDo/${id}`;
  const confirmar = confirm("Voce quer deletar esta tarefa?");
  if (!confirmar) {
    return;
  }
  fetch(url, {
    method: "DELETE",
  })
    .then(() => listaTarefas())
    .catch((erro) => {
      alert("Erro ao excluir a tarefa!");
      console.log(erro);
    });
}
function abrirModalEdicao(id, titulo, status) {
  document.getElementById("editIdTarefa").value = id;
  document.getElementById("editTituloTarefa").value = titulo;
  document.getElementById("editStatusTarefa").value = status;

  const modal = new bootstrap.Modal(document.getElementById("modalEdicao"));
  modal.show();
}
function editarTarefa() {
  const id = document.getElementById("editIdTarefa").value;
  const url = `http://localhost:3000/toDo/${id}`;
  const novaTarefa = {
    id,
    titulo: document.getElementById("editTituloTarefa").value,
    status: document.getElementById("editStatusTarefa").value,
  };
  fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(novaTarefa),
  })
    .then(() => listaTarefas())
    .then(() => document.querySelector('[data-bs-dismiss="modal"]').click())
    .catch((erro) => {
      alert("Erro ao editar tarefa!");
      console.error(erro);
    });
}

window.addEventListener("DOMContentLoaded", () => {
  listaTarefas();
});
