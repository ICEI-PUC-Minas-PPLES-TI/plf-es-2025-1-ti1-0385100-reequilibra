// Dados dos usuários
const usuarios = {
  admin: {
    nome: "Administrador do Sistema",
    tipo: "admin"
  },
  user: {
    nome: "Usuário Comum",
    tipo: "comum"
  },
  rommel: {
    nome: "Rommel",
    tipo: "comum"
  }
};

// Dados das atividades
const atividades = [
    {
      id: "respirar",
      nome: "Respiração Guiada",
      descricao: "4s inspirar, 7s segurar, 8s expirar",
      tempo: 3,
      disponivelPara: ["admin", "user", "rommel"]
    },
    {
      id: "desenhar",
      nome: "Desenho Livre",
      descricao: "Use cores para expressar sentimentos",
      tempo: 5,
      disponivelPara: ["admin", "user"]
    },
    {
      id: "musica",
      nome: "Música Relaxante",
      descricao: "Ondas do mar e pássaros",
      tempo: 5,
      disponivelPara: ["admin", "rommel"]
    },
   ];
  
    const missoes = [
    "Complete 1 respiração guiada",
    "Desenhe por 2 minutos",
    "Ouça música por 5 minutos"
  ];
  
  // Carrega elementos da página
  document.addEventListener('DOMContentLoaded', () => {
  const listaMissoes = document.getElementById('lista-missoes');
  const botoesAtividades = document.querySelectorAll('.card button');
  const selectTempo = document.getElementById('tempo');
  const selectUsuario = document.getElementById('usuario');
    // Preenche missões
    missoes.forEach(ms => {
      const li = document.createElement('li');
      li.textContent = ms;
      listaMissoes.appendChild(li);
    });
  
    // Configura botões de atividades
    botoesAtividades.forEach(btn => {
      btn.addEventListener('click', function() {
        const card = this.parentElement;
        const atividadeId = card.getAttribute('data-atividade');
        const tempoSelecionado = selectTempo.value;
        const usuarioSelecionado = selectUsuario.value; 
      
      // Verifica se a atividade está disponível para o usuário
      const atividade = atividades.find(a => a.id === atividadeId);
      if (atividade && !atividade.disponivelPara.includes(usuarioSelecionado)) {
        alert(`❌ Esta atividade não está disponível para ${usuarios[usuarioSelecionado].nome}`);
        return;
      }
        
        iniciarAtividade(atividadeId, tempoSelecionado, usuarioSelecionado);
      
    });
  });

  // Atualiza atividades quando muda usuário
  selectUsuario.addEventListener('change', function() {
    const usuarioId = this.value;
    document.querySelectorAll('.card').forEach(card => {
      const atividadeId = card.getAttribute('data-atividade');
      const atividade = atividades.find(a => a.id === atividadeId);
      
      // Mostra/oculta cards baseado na disponibilidade
      card.style.display = atividade.disponivelPara.includes(usuarioId) ? 'block' : 'none';
    });
  });
});

  
  // Função para iniciar atividades (adaptada para incluir usuário)
function iniciarAtividade(id, tempo, usuarioId) {
  const atividade = atividades.find(a => a.id === id);
  const usuario = usuarios[usuarioId];
  
  if (atividade) {
    alert(`🏁 Iniciando para ${usuario.nome}: ${atividade.nome}\n⏱ Duração: ${tempo} minutos`);
        
    // Exemplo: registrar no console (opcional)
    console.log(`${usuario.nome} iniciou: ${atividade.nome} (${tempo} minutos)`);
  }
}