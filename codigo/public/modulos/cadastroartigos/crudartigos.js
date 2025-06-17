const apiUrl = 'http://localhost:3000/cad_artigos';


function displayMessage(mensagem, tipo = "warning") {
    const msg = document.getElementById('msg');
    msg.innerHTML = `
    <div class="alert alert-${tipo}">${mensagem}</div>`;
}

function readArtigo(processaDados) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => processaDados(data))
        .catch(error => {
            console.error('Erro ao ler artigos:', error);
            displayMessage("Erro ao ler artigos", "danger");
        });
}

function createArtigo(artigo, refreshFunction) {
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artigo),
    })
        .then(response => {
            if (!response.ok) throw new Error("Erro ao inserir artigo");
            return response.json();
        })
        .then(() => {
            displayMessage("Artigo inserido com sucesso", "success");
            if (refreshFunction) refreshFunction();
        })
        .catch(error => {
            console.error(error);
            displayMessage(error.message, "danger");
        });
}

function updateArtigo(id, artigo, refreshFunction) {
    fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artigo),
    })
        .then(response => response.json())
        .then(() => {
            displayMessage("Artigo alterado com sucesso", "success");
            if (refreshFunction) refreshFunction();
        })
        .catch(error => {
            console.error('Erro ao atualizar artigo:', error);
            displayMessage("Erro ao atualizar artigo", "danger");
        });
}

function deleteArtigo(id, refreshFunction) {
    fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
        .then(response => {
            if (response.status === 404) throw new Error("Artigo não encontrado.");
            return response.json();
        })

        .then(() => {
            displayMessage("Artigo removido com sucesso", "success");
            if (refreshFunction) refreshFunction();
        })
        .catch(error => {
            console.error('Erro ao remover artigo:', error);
            displayMessage(error.message, "danger");
        });
}

function exibeArtigos() {
    const tableArtigos = document.getElementById("table-artigos");
    tableArtigos.innerHTML = "";

    readArtigo(dados => {
        dados.forEach(artigo => {
            tableArtigos.innerHTML += `
            <tr>
                <td>${artigo.id}</td>
                <td>${artigo.titulo}</td>
                <td>${artigo.data}</td>
                <td>${artigo.autor}</td>
                <td>${artigo.categoria}</td>
                <td>${artigo.link}</td>
            </tr>`;
        });
    });
}

function init() {
    const formArtigo = document.getElementById("form-artigo");
    const btnInsert = document.getElementById("btnInsert");
    const btnUpdate = document.getElementById("btnUpdate");
    const btnDelete = document.getElementById("btnDelete");
    const btnClear = document.getElementById("btnClear");
    const gridArtigos = document.getElementById("grid-artigos");
    const msg = document.getElementById("msg");

    btnInsert.addEventListener('click', function () {
        if (!formArtigo.checkValidity()) {
            displayMessage("Preencha o formulário corretamente.");
            return;
        }

        const artigo = {
            titulo: document.getElementById('inputTitulo').value,
            data: document.getElementById('inputData').value,
            autor: document.getElementById('inputAutor').value,
            categoria: document.getElementById('inputCategoria').value,
            link: document.getElementById('inputLink').value
        };

        createArtigo(artigo, () => {
            exibeArtigos();
            formArtigo.reset();
        });
    });

    btnUpdate.addEventListener('click', function () {
        const campoId = document.getElementById("inputId").value;
        if (!campoId) {
            displayMessage("Selecione um artigo para alterar.");
            return;
        }

        const artigo = {
            titulo: document.getElementById('inputTitulo').value,
            data: document.getElementById('inputData').value,
            autor: document.getElementById('inputAutor').value,
            categoria: document.getElementById('inputCategoria').value,
            link: document.getElementById('inputLink').value
        };

        updateArtigo(campoId, artigo, () => {
            exibeArtigos();
            formArtigo.reset();
        });
    });

    btnDelete.addEventListener('click', function () {
        const campoId = document.getElementById('inputId').value;
        if (!campoId) {
            displayMessage("Selecione um artigo para excluir.");
            return;
        }

        deleteArtigo(campoId , () => {
            exibeArtigos();
            formArtigo.reset();
        });
    });

    btnClear.addEventListener('click', () => {
        formArtigo.reset();
    });

    const observer = new MutationObserver(() => {
        const alert = msg.getElementsByClassName("alert");
        if (alert.length) {
            setTimeout(() => alert[0].remove(), 5000);
        }
    });
    observer.observe(msg, { childList: true });


    gridArtigos.addEventListener('click', function (e) {
        if (e.target.tagName === "TD") {
            const linha = e.target.parentNode;
            const colunas = linha.querySelectorAll("td");

            document.getElementById('inputId').value = colunas[0].innerText;
            document.getElementById('inputTitulo').value = colunas[1].innerText;
            document.getElementById('inputData').value = colunas[2].innerText;
            document.getElementById('inputAutor').value = colunas[3].innerText;
            document.getElementById('inputCategoria').value = colunas[4].innerText;
            document.getElementById('inputLink').value = colunas[5].innerText;
        }
    });

    exibeArtigos();
}

window.addEventListener('DOMContentLoaded', init);
