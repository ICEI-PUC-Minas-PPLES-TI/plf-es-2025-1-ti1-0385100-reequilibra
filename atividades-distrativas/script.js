document.addEventListener('DOMContentLoaded', () => {
  const listaMissoes = document.getElementById('lista-missoes');
  const containerAtividades = document.querySelector('.atividades');
  const selectTempo = document.getElementById('tempo');
  const selectUsuario = document.getElementById('usuario');
  const listaAtividadesConcluidas = document.createElement('div');
  listaAtividadesConcluidas.id = 'atividades-concluidas';
  listaAtividadesConcluidas.style.marginTop = '20px';
  document.querySelector('.container').appendChild(listaAtividadesConcluidas);

  let missoes = [];
  let atividades = [];
  let usuarios = {};

  // Função para carregar os dados iniciais da API
  Promise.all([
    fetch('http://localhost:3000/missoes').then(res => res.json()),
    fetch('http://localhost:3000/atividades').then(res => res.json()),
    fetch('http://localhost:3000/usuarios').then(res => res.json())
  ]).then(([dadosMissoes, dadosAtividades, dadosUsuarios]) => {
    missoes = dadosMissoes.map(m => m.descricao);
    atividades = dadosAtividades;
    usuarios = Object.fromEntries(dadosUsuarios.map(u => [u.id, u]));

    preencherMissoes();
    criarCardsAtividades();
    configurarEventos();
    atualizarVisibilidadeAtividades();
    listarAtividadesConcluidas(selectUsuario.value);
  });

  // Preenche a lista de missões
  function preencherMissoes() {
    listaMissoes.innerHTML = '';
    missoes.forEach(ms => {
      const li = document.createElement('li');
      li.textContent = ms;
      listaMissoes.appendChild(li);
    });
  }

  // Cria cards dinamicamente das atividades (se quiser manter fixo no HTML, pode pular)
  function criarCardsAtividades() {
    containerAtividades.innerHTML = '';
    atividades.forEach(atividade => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-atividade', atividade.id);

      const h3 = document.createElement('h3');
      h3.textContent = atividade.nome;
      card.appendChild(h3);

      const p = document.createElement('p');
      p.textContent = atividade.descricao;
      card.appendChild(p);

      const btn = document.createElement('button');
      btn.textContent = 'Iniciar';
      card.appendChild(btn);

      containerAtividades.appendChild(card);
    });
  }

  // Configura eventos para botões e selects
  function configurarEventos() {
    // Botões Iniciar
    containerAtividades.querySelectorAll('button').forEach(btn => {
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

    // Mudança de usuário atualiza atividades e lista concluídas
    selectUsuario.addEventListener('change', () => {
      atualizarVisibilidadeAtividades();
      listarAtividadesConcluidas(selectUsuario.value);
    });
  }

  // Atualiza visibilidade dos cards baseado no usuário selecionado
  function atualizarVisibilidadeAtividades() {
    const usuarioId = selectUsuario.value;
    containerAtividades.querySelectorAll('.card').forEach(card => {
      const atividadeId = card.getAttribute('data-atividade');
      const atividade = atividades.find(a => a.id === atividadeId);
      card.style.display = atividade && atividade.disponivelPara.includes(usuarioId) ? 'block' : 'none';
    });
  }

  // Inicia uma atividade e registra no servidor
  function iniciarAtividade(id, tempo, usuarioId) {
    const atividade = atividades.find(a => a.id === id);
    const usuario = usuarios[usuarioId];

    if (atividade) {
      alert(`🏁 Iniciando para ${usuario.nome}: ${atividade.nome}\n⏱ Duração: ${tempo} minutos`);
      console.log(`${usuario.nome} iniciou: ${atividade.nome} (${tempo} minutos)`);

      registrarAtividadeConcluida(usuarioId, id, tempo)
        .then(() => listarAtividadesConcluidas(usuarioId));
    }
  }

  // Registra atividade concluída via POST
  function registrarAtividadeConcluida(usuarioId, atividadeId, tempo) {
    const registro = {
      usuarioId,
      atividadeId,
      tempo: Number(tempo),
      data: new Date().toISOString()
    };

    return fetch('http://localhost:3000/atividadesConcluidas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro)
    })
      .then(response => {
        if (!response.ok) throw new Error('Erro ao registrar atividade');
        return response.json();
      })
      .then(data => {
        alert(`✅ Atividade "${atividadeId}" registrada com sucesso para ${usuarioId}!`);
        console.log('Registro salvo:', data);
      })
      .catch(error => {
        alert('❌ Falha ao registrar atividade.');
        console.error(error);
      });
  }

  // Lista atividades concluídas do usuário na página
  function listarAtividadesConcluidas(usuarioId) {
    fetch(`http://localhost:3000/atividadesConcluidas?usuarioId=${usuarioId}`)
      .then(res => res.json())
      .then(registros => {
        listaAtividadesConcluidas.innerHTML = `<h2>✅ Atividades concluídas de ${usuarios[usuarioId].nome}:</h2>`;
        if (registros.length === 0) {
          listaAtividadesConcluidas.innerHTML += '<p>Nenhuma atividade concluída ainda.</p>';
          return;
        }

        const ul = document.createElement('ul');
        registros.forEach(r => {
          const atividade = atividades.find(a => a.id === r.atividadeId);
          const li = document.createElement('li');
          li.textContent = `${atividade ? atividade.nome : r.atividadeId} — ${r.tempo} min — em ${new Date(r.data).toLocaleString()}`;
          ul.appendChild(li);
        });

        listaAtividadesConcluidas.appendChild(ul);
      })
      .catch(err => {
        listaAtividadesConcluidas.innerHTML = '<p>Erro ao carregar atividades concluídas.</p>';
        console.error(err);
      });
  }
});
