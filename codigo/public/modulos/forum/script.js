// Função para carregar os dados do db.json
async function carregarDados() {
  try {
    const response = await fetch("../../../db/db.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao carregar db.json:", error);
    return null;
  }
}

// Função para exibir as comunidades na barra lateral
function exibirComunidades(comunidades) {
  const navLista = document.querySelector("nav ul");
  navLista.innerHTML = ""; // Limpa o conteúdo existente

  comunidades.forEach((comunidade) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#"; // Você pode adicionar links específicos para cada comunidade
    a.textContent = comunidade.nome;
    li.appendChild(a);
    navLista.appendChild(li);
  });
}

// Função para exibir a postagem principal
function exibirPostagens(posts) {
  const main = document.querySelector("main");
  main.innerHTML = ""; // Limpa o conteúdo existente

  if (!posts || posts.length === 0) {
    main.innerHTML = "<p>Nenhuma postagem encontrada nesta comunidade.</p>";
    return;
  }

  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    const titulo = document.createElement("h2");
    titulo.classList.add("post-title");
    titulo.textContent = post.conteudo; // Usando o conteúdo como título

    const autor = document.createElement("p");
    autor.classList.add("post-author");
    autor.textContent = `Autor: ${post.autor}`;

    const conteudo = document.createElement("p");
    conteudo.textContent = "Compartilhe suas estratégias..."; // Mensagem padrão

    postDiv.appendChild(titulo);
    postDiv.appendChild(autor);
    postDiv.appendChild(conteudo);

    main.appendChild(postDiv);
  });
}

// Função para exibir os posts de uma comunidade
function exibirComunidade(comunidade) {
  exibirPostagens(comunidade.posts);
}

// Função principal para inicializar a página
async function inicializar() {
  const data = await carregarDados();

  if (data) {
    exibirComunidades(data.comunidades);

    // Exibe os posts da primeira comunidade ao iniciar
    if (data.comunidades.length > 0) {
      exibirComunidade(data.comunidades[0]);

      // Adiciona event listeners para cada comunidade
      const navLinks = document.querySelectorAll("nav ul li a");
      navLinks.forEach((link, index) => {
        link.addEventListener("click", (event) => {
          event.preventDefault(); // Evita o comportamento padrão do link
          exibirComunidade(data.comunidades[index]);
        });
      });
    }
  }
}

// Chama a função inicializar quando a página carrega
window.onload = inicializar;

// Seleciona os elementos do DOM
const criarComunidadeBtn = document.getElementById("criar-comunidade-btn");
const modalCriarComunidade = document.getElementById("modal-criar-comunidade");
const closeCriarComunidade = document.getElementById("close-criar-comunidade");
const salvarComunidadeBtn = document.getElementById("salvar-comunidade-btn");
const nomeComunidadeInput = document.getElementById("nome-comunidade");
const descricaoComunidadeTextarea = document.getElementById(
  "descricao-comunidade"
);

const criarPostBtn = document.getElementById("criar-post-btn");
const modalCriarPost = document.getElementById("modal-criar-post");
const closeCriarPost = document.getElementById("close-criar-post");
const salvarPostBtn = document.getElementById("salvar-post-btn");
const conteudoPostTextarea = document.getElementById("conteudo-post");

// --- MODAL CRIAR COMUNIDADE ---

// Abre o modal de criar comunidade
criarComunidadeBtn.onclick = function () {
  modalCriarComunidade.style.display = "block";
};

// Fecha o modal de criar comunidade ao clicar no "x"
closeCriarComunidade.onclick = function () {
  modalCriarComunidade.style.display = "none";
};

// Fecha o modal ao clicar fora dele
window.onclick = function (event) {
  if (event.target == modalCriarComunidade) {
    modalCriarComunidade.style.display = "none";
  }
  if (event.target == modalCriarPost) {
    modalCriarPost.style.display = "none";
  }
};

// Salva a nova comunidade (AINDA NÃO SALVA NO db.json - FALTA BACKEND)
salvarComunidadeBtn.onclick = function () {
  const nome = nomeComunidadeInput.value;
  const descricao = descricaoComunidadeTextarea.value;
  if (nome && descricao) {
    // Aqui você faria a lógica para salvar a nova comunidade
    // (enviar para o servidor, atualizar o db.json, etc.)
    console.log("Nova comunidade:", { nome, descricao });
    alert(`Comunidade "${nome}" criada (simulação)!`);
    modalCriarComunidade.style.display = "none";
    nomeComunidadeInput.value = "";
    descricaoComunidadeTextarea.value = "";
    // Recarrega as comunidades na barra lateral
    carregarDados().then((data) => {
      if (data) {
        exibirComunidades(data.comunidades);
      }
    });
  } else {
    alert("Por favor, preencha todos os campos.");
  }
};

// --- MODAL CRIAR POST ---

// Abre o modal de criar post
criarPostBtn.onclick = function () {
  modalCriarPost.style.display = "block";
};

// Fecha o modal de criar post ao clicar no "x"
closeCriarPost.onclick = function () {
  modalCriarPost.style.display = "none";
};

// Salva o novo post (AINDA NÃO SALVA NO db.json - FALTA BACKEND)
salvarPostBtn.onclick = function () {
  const conteudo = conteudoPostTextarea.value;
  if (conteudo) {
    // Aqui você faria a lógica para salvar o novo post
    // (enviar para o servidor, atualizar o db.json, etc.)
    console.log("Novo post:", { conteudo });
    alert("Post criado (simulação)!");
    modalCriarPost.style.display = "none";
    conteudoPostTextarea.value = "";

    // Recarrega a postagem principal (exibe o novo post - simulação)
    carregarDados().then((data) => {
      if (data && data.comunidades.length > 0) {
        // Supondo que você quer adicionar o post à primeira comunidade
        const novaPostagem = {
          id: Date.now(), // Simulação de ID único (use algo melhor em produção)
          autor: "Você", // Ou pegue o nome do usuário logado
          dataHora: new Date().toISOString(),
          conteudo: conteudo,
          likes: 0,
          respostas: [],
        };
        data.comunidades[0].posts.push(novaPostagem);
        exibirPostagemPrincipal(novaPostagem);
      }
    });
  } else {
    alert("Por favor, escreva algo no post.");
  }
};
