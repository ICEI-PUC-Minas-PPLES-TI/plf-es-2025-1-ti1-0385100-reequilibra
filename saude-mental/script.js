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
    // Esconde slide atual
    document.querySelector(`.slide.active`).classList.remove('active');
    document.querySelector(`.indicator.active`).classList.remove('active');
    
    // Mostra novo slide
    document.getElementById(`slide${slideNumber}`).classList.add('active');
    document.querySelector(`.indicator[data-slide="${slideNumber}"]`).classList.add('active');
    
    currentSlide = slideNumber;
    
    // Atualiza estado dos botões
    prevBtn.disabled = slideNumber === 1;
    nextBtn.disabled = slideNumber === totalSlides;
}

// Event listeners
prevBtn.addEventListener('click', () => {
    if (currentSlide > 1) {
        goToSlide(currentSlide - 1);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentSlide < totalSlides) {
        goToSlide(currentSlide + 1);
    }
});

// Navegação pelos indicadores
indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
        const slideNumber = parseInt(indicator.dataset.slide);
        goToSlide(slideNumber);
    });
});

// Demonstração interativa
demoBtn.addEventListener('click', () => {
    const randomTopic = forumData.topics[Math.floor(Math.random() * forumData.topics.length)];
    
    demoTopic.innerHTML = `
        <h4>${randomTopic.title}</h4>
        <p class="topic-meta">Por ${randomTopic.author} | ${randomTopic.date} | ${randomTopic.category}</p>
        <p class="topic-content">${randomTopic.content}</p>
        <div class="topic-stats">
            <span><i class="fas fa-comment"></i> ${randomTopic.comments} comentários</span>
            <span><i class="fas fa-heart"></i> ${randomTopic.likes} curtidas</span>
        </div>
    `;
});

// Inicialização
goToSlide(1);

// Teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentSlide > 1) {
        goToSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight' && currentSlide < totalSlides) {
        goToSlide(currentSlide + 1);
    }
});
