document.addEventListener('DOMContentLoaded', () => {
  const listaMissoes = document.getElementById('lista-missoes');
  const containerAtividades = document.querySelector('.atividades');
  const selectTempo = document.getElementById('tempo');
  const selectUsuario = document.getElementById('usuario');

  // Criar o temporizador visual
  const temporizador = document.createElement('div');
  temporizador.id = 'temporizador';
  temporizador.style.cssText = `
    display: none;
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    background: white;
    border: 3px solid #01AE7D;
    padding: 20px 40px;
    border-radius: 10px;
    z-index: 1000;
    color: #01AE7D;
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
  `;
  temporizador.textContent = '⏳ 00:00';
  document.body.appendChild(temporizador);

  const listaAtividadesConcluidas = document.createElement('div');
  listaAtividadesConcluidas.id = 'atividades-concluidas';
  listaAtividadesConcluidas.style.marginTop = '20px';
  document.querySelector('.container').appendChild(listaAtividadesConcluidas);

  let missoes = [];
  let atividades = [];
  let usuarios = {};

  // Carrega dados da API
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

  function preencherMissoes() {
    listaMissoes.innerHTML = '';
    missoes.forEach(ms => {
      const li = document.createElement('li');
      li.textContent = ms;
      listaMissoes.appendChild(li);
    });
  }

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

  function configurarEventos() {
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

    selectUsuario.addEventListener('change', () => {
      atualizarVisibilidadeAtividades();
      listarAtividadesConcluidas(selectUsuario.value);
    });
  }

  function atualizarVisibilidadeAtividades() {
    const usuarioId = selectUsuario.value;
    containerAtividades.querySelectorAll('.card').forEach(card => {
      const atividadeId = card.getAttribute('data-atividade');
      const atividade = atividades.find(a => a.id === atividadeId);
      card.style.display = atividade && atividade.disponivelPara.includes(usuarioId) ? 'block' : 'none';
    });
  }

  function iniciarAtividade(id, tempoMin, usuarioId) {
    const atividade = atividades.find(a => a.id === id);
    const usuario = usuarios[usuarioId];
    if (!atividade) return;

    const tempoSegundos = parseInt(tempoMin) * 60;
    let tempoRestante = tempoSegundos;

    temporizador.style.display = 'block';
    atualizarDisplay(tempoRestante);

    document.querySelectorAll('.card button').forEach(btn => btn.disabled = true);

    const intervalo = setInterval(() => {
      tempoRestante--;
      atualizarDisplay(tempoRestante);

      if (tempoRestante <= 0) {
        clearInterval(intervalo);
        temporizador.style.display = 'none';

        registrarAtividadeConcluida(usuarioId, id, tempoMin)
          .then(() => listarAtividadesConcluidas(usuarioId));

        alert(`✅ ${usuario.nome} concluiu a atividade: ${atividade.nome}`);
        document.querySelectorAll('.card button').forEach(btn => btn.disabled = false);
      }
    }, 1000);
  }

  function atualizarDisplay(segundos) {
    const min = String(Math.floor(segundos / 60)).padStart(2, '0');
    const sec = String(segundos % 60).padStart(2, '0');
    temporizador.textContent = `⏳ ${min}:${sec}`;
  }

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
      .then(res => {
        if (!res.ok) throw new Error('Erro ao registrar');
        return res.json();
      });
  }

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
          li.textContent = `${atividade ? atividade.nome : r.atividadeId} — ${r.tempo} min — ${new Date(r.data).toLocaleString()}`;
          ul.appendChild(li);
        });
        listaAtividadesConcluidas.appendChild(ul);
      });
  }
});
