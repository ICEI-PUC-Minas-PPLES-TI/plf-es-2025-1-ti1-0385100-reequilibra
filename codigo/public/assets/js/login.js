// Função para salvar novo usuário
function salvaLogin(event) {
  event.preventDefault();

  const nome = document.getElementById("txt_nome").value;
  const login = document.getElementById("txt_login").value;
  const email = document.getElementById("txt_email").value;
  const senha = document.getElementById("txt_senha").value;
  const senha2 = document.getElementById("txt_senha2").value;

  if (senha !== senha2) {
    alert("As senhas informadas não conferem.");
    return;
  }

  const novoUsuario = {
    id: Date.now().toString(),
    nome,
    email,
    senha,
    login,
    tipo: "usuario",
  };

  const usuariosSalvos = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuariosSalvos.push(novoUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuariosSalvos));

  alert("Usuário salvo com sucesso!");

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("registerModal")
  );
  modal.hide();

  document.getElementById("register-form").reset();
}

// Função para processar o formulário de login
function processaFormLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuarioEncontrado = usuarios.find(
    (u) =>
      (u.login === username || u.email === username) && u.senha === password
  );

  if (usuarioEncontrado) {
    alert(`Login realizado com sucesso! Bem-vindo, ${usuarioEncontrado.nome}`);
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));
    window.location.href = "gamificacoes.html";
  } else {
    alert("Usuário não encontrado. Verifique login e senha ou crie uma conta.");
  }
}

// Listeners
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("login-form")
    .addEventListener("submit", processaFormLogin);
  document.getElementById("btn_salvar").addEventListener("click", salvaLogin);
});
