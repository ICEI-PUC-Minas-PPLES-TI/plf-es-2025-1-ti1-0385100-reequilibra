document.addEventListener("DOMContentLoaded", () => {
  const formCadastro = document.getElementById("register-form");
  const formLogin = document.getElementById("login-form");

  // Cadastro de novo usuário
  if (formCadastro) {
    formCadastro.addEventListener("submit", (event) => {
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
        login,
        email,
        senha,
        tipo: "usuario",
      };

      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      // Verifica se login ou e-mail já existem
      const jaExiste = usuarios.find(
        (u) => u.login === login || u.email === email
      );

      if (jaExiste) {
        alert("Já existe um usuário com esse login ou e-mail.");
        return;
      }

      usuarios.push(novoUsuario);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));

      alert("Usuário salvo com sucesso!");
      window.location.href = "login.html"; // Redireciona para login
    });
  }

  // Login de usuário
  if (formLogin) {
    formLogin.addEventListener("submit", (event) => {
      event.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      const usuarioEncontrado = usuarios.find(
        (u) =>
          (u.login === username || u.email === username) && u.senha === password
      );

      if (usuarioEncontrado) {
        alert(
          `Login realizado com sucesso! Bem-vindo, ${usuarioEncontrado.nome}`
        );
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify(usuarioEncontrado)
        );
        window.location.href = "gamificacoes.html";
      } else {
        alert(
          "Usuário não encontrado. Verifique login e senha ou crie uma conta."
        );
      }
    });
  }
});
