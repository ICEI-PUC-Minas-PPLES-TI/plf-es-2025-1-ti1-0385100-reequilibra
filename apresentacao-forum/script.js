// Dados de exemplo do fórum
const forumData = {
    topics: [
        {
            id: "4827",
            title: "Como lidar com crises no trabalho?",
            content: "Dicas para controlar ansiedade no ambiente profissional.",
            author: "user123",
            date: "2025-05-15",
            category: "Ansiedade",
            comments: 3,
            likes: 8
        },
        {
            id: "4828",
            title: "Depressão e estudos",
            content: "Como manter o foco nos estudos quando se está deprimido?",
            author: "user789",
            date: "2025-05-14",
            category: "Depressão",
            comments: 5,
            likes: 12
        }
    ]
};

// Dados de exemplo para a demonstração interativa
const demoData = {
    diario: {
        titulo: "Dia produtivo no trabalho",
        conteudo: "Consegui finalizar um projeto importante e recebi elogios do meu chefe.",
        status: 2,
        data: "2025-04-22"
    },
    comunidade: {
        titulo: "Como lidar com crises no trabalho?",
        autor: "user123",
        respostas: [
            {
                autor: "user456",
                conteudo: "Recomendo técnicas de respiração."
            }
        ]
    }
};

// Controle da apresentação
let currentSlide = 1;
const totalSlides = 4;

// Elementos DOM
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicators = document.querySelectorAll('.indicator');
const demoBtn = document.getElementById('loadDemoBtn');
const demoTopic = document.getElementById('demoTopic');

// Função para mudar de slide
function goToSlide(slideNumber) {
    document.querySelector('.slide.active')?.classList.remove('active');
    document.querySelector('.indicator.active')?.classList.remove('active');

    document.getElementById(`slide${slideNumber}`)?.classList.add('active');
    document.querySelector(`.indicator[data-slide="${slideNumber}"]`)?.classList.add('active');

    currentSlide = slideNumber;

    prevBtn.disabled = slideNumber === 1;
    nextBtn.disabled = slideNumber === totalSlides;
}

// Navegação por botões
prevBtn?.addEventListener('click', () => {
    if (currentSlide > 1) {
        goToSlide(currentSlide - 1);
    }
});

nextBtn?.addEventListener('click', () => {
    if (currentSlide < totalSlides) {
        goToSlide(currentSlide + 1);
    }
});

// Navegação por indicadores
indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
        const slideNumber = parseInt(indicator.dataset.slide);
        goToSlide(slideNumber);
    });
});

// Demonstração interativa (único listener)
demoBtn?.addEventListener('click', () => {
    const randomTopic = forumData.topics[Math.floor(Math.random() * forumData.topics.length)];
    const resposta = demoData.comunidade.respostas[0];

    demoTopic.innerHTML = `
        <h4>${randomTopic.title}</h4>
        <p class="topic-meta">Por ${randomTopic.author} | ${randomTopic.date} | ${randomTopic.category}</p>
        <p class="topic-content">${randomTopic.content}</p>
        <div class="topic-stats">
            <span><i class="fas fa-comment"></i> ${randomTopic.comments} comentários</span>
            <span><i class="fas fa-heart"></i> ${randomTopic.likes} curtidas</span>
        </div>
        <hr />
        <div class="post-real">
            <h4>${demoData.comunidade.titulo}</h4>
            <p class="meta">Postado por ${demoData.comunidade.autor}</p>
            <p>${demoData.diario.conteudo}</p>
            <div class="resposta">
                <p><strong>${resposta.autor}:</strong> ${resposta.conteudo}</p>
            </div>
        </div>
    `;
});

// Inicialização do primeiro slide
goToSlide(1);

// Suporte a teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentSlide > 1) {
        goToSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight' && currentSlide < totalSlides) {
        goToSlide(currentSlide + 1);
    }
});
