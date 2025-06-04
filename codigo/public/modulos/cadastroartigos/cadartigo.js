const apiUrl = '/contatos';

function displayMessage(mensagem) {
    const msg = document.getElementById('msg');
    msg.innerHTML = '<div class="alert alert-warning">' + mensagem + '</div>';
}

function readContato(processaDados) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => processaDados(data))
        .catch(error => {
            console.error('Erro ao ler contatos:', error);
            displayMessage("Erro ao ler contatos");
        });
}

function createContato(contato, refreshFunction) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contato),
    })
    .then(response => response.json())
    .then(() => {
        displayMessage("Contato inserido com sucesso");
        if (refreshFunction) refreshFunction();
    })
    .catch(error => {
        console.error('Erro ao inserir contato:', error);
        displayMessage("Erro ao inserir contato");
    });
}

function updateContato(id, contato, refreshFunction) {
    fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contato),
    })
    .then(response => response.json())
    .then(() => {
        displayMessage("Contato alterado com sucesso");
        if (refreshFunction) refreshFunction();
    })
    .catch(error => {
        console.error('Erro ao atualizar contato:', error);
        displayMessage("Erro ao atualizar contato");
    });
}

function deleteContato(id, refreshFunction) {
    fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(() => {
        displayMessage("Contato removido com sucesso");
        if (refreshFunction) refreshFunction();
    })
    .catch(error => {
        console.error('Erro ao remover contato:', error);
        displayMessage("Erro ao remover contato");
    });
}

function exibeContatos() {
    const tableContatos = document.getElementById("table-contatos");
    tableContatos.innerHTML = "";

    readContato(dados => {
        for (let i = 0; i < dados.length; i++) {
            const contato = dados[i];    
            tableContatos.innerHTML += `<tr>
                <td scope="row">${contato.id}</td>
                <td>${contato.nome}</td>
                <td>${contato.telefone}</td>
                <td>${contato.email}</td>
                <td>${contato.cidade}</td>
                <td>${contato.categoria}</td>
                <td>${contato.website}</td>
            </tr>`;
        }
    });
}

function init() {
    const formContato = document.getElementById("form-contato");
    const btnInsert = document.getElementById("btnInsert");
    const btnUpdate = document.getElementById("btnUpdate");
    const btnDelete = document.getElementById("btnDelete");
    const btnClear = document.getElementById("btnClear");
    const msg = document.getElementById("msg");
    const gridContatos = document.getElementById("grid-contatos");

    btnInsert.addEventListener('click', function () {
        if (!formContato.checkValidity()) {
            displayMessage("Preencha o formulário corretamente.");
            return;
        }

        const contato = {
            nome: document.getElementById('inputNome').value,
            telefone: document.getElementById('inputTelefone').value,
            email: document.getElementById('inputEmail').value,
            cidade: document.getElementById('inputCidade').value,
            categoria: document.getElementById('inputCategoria').value,
            website: document.getElementById('inputSite').value
        };

        createContato(contato, exibeContatos);
        formContato.reset();
    });

    btnUpdate.addEventListener('click', function () {
        const campoId = document.getElementById("inputId").value;
        if (campoId === "") {
            displayMessage("Selecione antes um contato para ser alterado.");
            return;
        }

        const contato = {
            nome: document.getElementById('inputNome').value,
            telefone: document.getElementById('inputTelefone').value,
            email: document.getElementById('inputEmail').value,
            cidade: document.getElementById('inputCidade').value,
            categoria: document.getElementById('inputCategoria').value,
            website: document.getElementById('inputSite').value
        };

        updateContato(parseInt(campoId), contato, exibeContatos);
        formContato.reset();
    });

    btnDelete.addEventListener('click', function () {
        const campoId = document.getElementById('inputId').value;
        if (campoId === "") {
            displayMessage("Selecione um contato a ser excluído.");
            return;
        }

        deleteContato(campoId, exibeContatos);
        formContato.reset();
    });

    btnClear.addEventListener('click', function () {
        formContato.reset();
    });

    msg.addEventListener("DOMSubtreeModified", function (e) {
        if (e.target.innerHTML === "") return;
        setTimeout(() => {
            const alert = msg.getElementsByClassName("alert");
            if (alert.length) alert[0].remove();
        }, 5000);
    });

    gridContatos.addEventListener('click', function (e) {
        if (e.target.tagName === "TD") {
            const linhaContato = e.target.parentNode;
            const colunas = linhaContato.querySelectorAll("td");

            document.getElementById('inputId').value = colunas[0].innerText;
            document.getElementById('inputNome').value = colunas[1].innerText;
            document.getElementById('inputTelefone').value = colunas[2].innerText;
            document.getElementById('inputEmail').value = colunas[3].innerText;
            document.getElementById('inputCidade').value = colunas[4].innerText;
            document.getElementById('inputCategoria').value = colunas[5].innerText;
            document.getElementById('inputSite').value = colunas[6].innerText;
        }
    });

    exibeContatos();
}

window.addEventListener('DOMContentLoaded', init);
