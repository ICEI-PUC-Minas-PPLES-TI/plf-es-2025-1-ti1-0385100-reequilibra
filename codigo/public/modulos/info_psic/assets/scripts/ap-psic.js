document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.container-psicologos')) {
        carregarLtsPsig();
    } else if (document.querySelector('.detalhes-container')) {
        carregarDtlPsig();
    }
});

function carregarLtsPsig() {
    let todosPsicologos = [];
    const inputBusca = document.getElementById('input-busca');
    const btnBusca = document.getElementById('btn-busca');
    const container = document.querySelector('.container-psicologos');

    fetch('http://localhost:3000/psicologos')
        .then(response => {
            return response.json();
        })
        .then(data => {
            todosPsicologos = data;
            exibirPsig(data);
            configCardsPsig();
        })
        .catch(error => {
            console.error('Erro:', error);
            container.innerHTML = '<div class="erro">Não foi possível carregar os psicólogos</div>';
        });

    btnBusca.addEventListener('click', buscarPsicologos);
    inputBusca.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') buscarPsicologos();
    });

    function buscarPsicologos() {
        const termo = inputBusca.value.toLowerCase().trim();
        const resultados = termo
            ? todosPsicologos.filter(p => p.area_atua.toLowerCase().includes(termo))
            : todosPsicologos;

        exibirPsig(resultados);
        configCardsPsig();
    }

    function exibirPsig(psicologos) {
        container.innerHTML = psicologos.map(p => `
        <div class="card-psicologo" data-id="${p.id}">
            <div class="detalhe-card"></div>
            <img src="${p.img}" alt="${p.nome}" class="foto-psicologo">
            <div class="card-psicologo-content">
                <h2 class="nome-psicologo">${p.nome}</h2>
                <p class="especialidade-psicologo">${p.area_atua}</p>
                <div class="avaliacao-container">
                    <i class="fas fa-star"></i>
                    <span class="avaliacao">${p.nota}</span>
                </div>
            </div>
        </div>
    `).join('');
    }

    function configCardsPsig() {
        document.querySelectorAll('.card-psicologo').forEach(card => {
            card.addEventListener('click', function () {
                const psicologoId = this.getAttribute('data-id');
                window.location.href = `dtlpsicologos.html?id=${psicologoId}`;
            });
        });
    }
}

function carregarDtlPsig() {
    const urlParams = new URLSearchParams(window.location.search);
    const psicologoId = urlParams.get('id');

    if (!psicologoId) {
        document.querySelector('.detalhes-container').innerHTML = '<p>Psicólogo não especificado</p>';
        return;
    }

    fetch('http://localhost:3000/psicologos')
        .then(response => {
            return response.json();
        })
        .then(data => {
            const psicologo = data.find(p => p.id == psicologoId);
            if (psicologo) {
                exibirDtlPsig(psicologo);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            document.querySelector('.detalhes-container').innerHTML = `
                <div class="erro">
                    <p>Não foi possível carregar os dados do psicólogo</p>
                </div>
            `;
        });
}

function exibirDtlPsig(psicologo) {
    const container = document.querySelector('.detalhes-container');

    container.innerHTML = `
            <div class="destaques-psic"></div>
            <div class="perfil-header">
                <img src="${psicologo.img}" alt="${psicologo.nome}" class="perfil-img">
                <div class="perfil-info">
                    <h1>${psicologo.nome}</h1>
                    <div class="especialidade-badge">${psicologo.area_atua}</div>
                    <div class="avaliacao-header">
                        <i class="fas fa-star"></i>
                        <span>${psicologo.nota}</span>
                    </div>
                </div>
            </div>

            <div class="descricao">${psicologo.descricao}</div>

            <div class="info-section">
                <h2>Agendar Consulta</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <i class="fas fa-id-card info-icon"></i>
                        <span>CRP: ${psicologo.crp}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-envelope info-icon"></i>
                        <span>${psicologo.email}</span>
                    </div>
                    <div class="info-item">
                        <i class="fab fa-whatsapp info-icon"></i>
                        <span>${psicologo.whatsapp}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt info-icon"></i>
                        <span>${psicologo.endereco} (${psicologo.local_atend})</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar-alt info-icon"></i>
                        <span>${psicologo.horarios}</span>
                    </div>
                </div>

                <button class="btn-agendar">Agendar Consulta</button>
            </div>
        </div>
    `;

    document.querySelector('.btn-agendar').addEventListener('click', function () {
        const numero = psicologo.whatsapp.replace(/\D/g, '');
        window.open(`https://wa.me/${numero}`);
    });
}