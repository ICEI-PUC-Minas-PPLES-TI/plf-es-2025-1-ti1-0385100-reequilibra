// Carrega elementos da página
document.addEventListener('DOMContentLoaded', () => {
  const listaMissoes = document.getElementById('lista-missoes');
  const botoesAtividades = document.querySelectorAll('.card button');
  const selectTempo = document.getElementById('tempo');
  const selectUsuario = document.getElementById('usuario');

  let missoes = [];
  let atividades = [];
  let usuarios = {};

  // Carrega dados da API JSON Server
  Promise.all([
    fetch('http://localhost:3000/missoes').then(res => res.json()),
    fetch('http://localhost:3000/atividades').then(res => res.json()),
    fetch('http://localhost:3000/usuarios').then(res => res.json())
  ]).then(([dadosMissoes, dadosAtividades, dadosUsuarios]) => {
    missoes = dadosMissoes.map(m => m.descricao);
    atividades = dadosAtividades;
    usuarios = Object.fromEntries(dadosUsuarios.map(u => [u.id, u]));

    // Preenche missões
    missoes.forEach(ms => {
      const li = document.createElement('li');
      li.textContent = ms;
      listaMissoes.appendChild(li);
    });

    // Atualiza visibilidade dos cards com base no usuário selecionado
    configurarAtividades();

    // Configura botões das atividades
    botoesAtividades.forEach(btn => {
      btn.addEventListener('click', function () {
        const card = this.parentElement;
        const atividadeId = card.getAttribute('data-atividade');
        const tempoSelecionado = selectTempo.value;
        const usuarioSelecionado = selectUsuario.value;

        const atividade = atividades.find(a => a.id === atividadeId);
        if (atividade && !atividade.disponivelPara.includes(usuarioSelecionado)) {
          alert(`❌ Esta atividade não está disponível para ${usuarios[usuarioSelecionado].nome}`);
          return;
        }

        iniciarAtividade(atividadeId, tempoSelecionado, usuarioSelecionado);
      });
    });

    // Atualiza atividades ao mudar usuário
    selectUsuario.addEventListener('change', configurarAtividades);
  });

  // Função para exibir/ocultar atividades por usuário
  function configurarAtividades() {
    const usuarioId = selectUsuario.value;
    document.querySelectorAll('.card').forEach(card => {
      const atividadeId = card.getAttribute('data-atividade');
      const atividade = atividades.find(a => a.id === atividadeId);
      card.style.display = atividade && atividade.disponivelPara.includes(usuarioId) ? 'block' : 'none';
    });
  }

  // Inicia atividade
  function iniciarAtividade(id, tempo, usuarioId) {
    const atividade = atividades.find(a => a.id === id);
    const usuario = usuarios[usuarioId];

    if (atividade) {
      alert(`🏁 Iniciando para ${usuario.nome}: ${atividade.nome}\n⏱ Duração: ${tempo} minutos`);
      console.log(`${usuario.nome} iniciou: ${atividade.nome} (${tempo} minutos)`);
    }
  }
});
