// URL base para o JSON Server
const API_URL = 'http://localhost:3000';

// Elementos DOM
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicators = document.querySelectorAll('.indicator');
const demoBtn = document.getElementById('loadDemoBtn');
const demoTopic = document.getElementById('demoTopic');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const forumContainer = document.getElementById('forumContainer');

// Controle da apresentação
let currentSlide = 1;
const totalSlides = 6;

// Função para carregar tópicos do fórum
async function loadForumTopics() {
  try {
    let url = `${API_URL}/topics`;
    
    // Aplicar ordenação se selecionada
    const sortValue = sortSelect.value;
    if (sortValue) {
      const [field, order] = sortValue.split('_');
      url += `?_sort=${field}&_order=${order}`;
    }
    
    const response = await fetch(url);
    const topics = await response.json();
    
    // Aplicar filtro de pesquisa se existir
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTopics = searchTerm 
      ? topics.filter(topic => 
          topic.title.toLowerCase().includes(searchTerm) || 
          topic.content.toLowerCase().includes(searchTerm) 
      )
      : topics;
    
    renderForumTopics(filteredTopics);
  } catch (error) {
    console.error('Erro ao carregar tópicos:', error);
    forumContainer.innerHTML = '<p>Erro ao carregar tópicos. Tente novamente mais tarde.</p>';
  }
}

// Função para renderizar tópicos no DOM
function renderForumTopics(topics) {
  if (!forumContainer) return;
  
  if (topics.length === 0) {
    forumContainer.innerHTML = '<p>Nenhum tópico encontrado.</p>';
    return;
  }
  
  forumContainer.innerHTML = topics.map(topic => `
    <div class="topic-card">
      <h3>${topic.title}</h3>
      <p class="topic-meta">Por ${topic.author} | ${topic.date} | ${topic.category}</p>
      <p class="topic-content">${topic.content}</p>
      <div class="topic-stats">
        <span><i class="fas fa-comment"></i> ${topic.comments} comentários</span>
        <span><i class="fas fa-heart"></i> ${topic.likes} curtidas</span>
      </div>
    </div>
  `).join('');
}

// Função para carregar dados de demonstração
async function loadDemoData() {
  try {
    const [topicsResponse, diarioResponse, comunidadeResponse] = await Promise.all([
      fetch(`${API_URL}/topics`),
      fetch(`${API_URL}/diario`),
      fetch(`${API_URL}/comunidade`)
    ]);
    
    const [topics, diario, comunidade] = await Promise.all([
      topicsResponse.json(),
      diarioResponse.json(),
      comunidadeResponse.json()
    ]);
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const resposta = comunidade[0].respostas[0];
    const entry = diario[0];

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
        <h4>${entry.titulo}</h4>
        <p class="meta">Postado em ${entry.data}</p>
        <p>${entry.conteudo}</p>
        <div class="resposta">
          <p><strong>${resposta.autor}:</strong> ${resposta.conteudo}</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar dados de demonstração:', error);
    demoTopic.innerHTML = '<p>Erro ao carregar demonstração.</p>';
  }
}

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

// Event Listeners
prevBtn?.addEventListener('click', () => {
  if (currentSlide > 1) goToSlide(currentSlide - 1);
});

nextBtn?.addEventListener('click', () => {
  if (currentSlide < totalSlides) goToSlide(currentSlide + 1);
});

indicators.forEach(indicator => {
  indicator.addEventListener('click', () => {
    const slideNumber = parseInt(indicator.dataset.slide);
    goToSlide(slideNumber);
  });
});

demoBtn?.addEventListener('click', loadDemoData);

searchInput?.addEventListener('input', loadForumTopics);
sortSelect?.addEventListener('change', loadForumTopics);

// Suporte a teclado
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && currentSlide > 1) {
    goToSlide(currentSlide - 1);
  } else if (e.key === 'ArrowRight' && currentSlide < totalSlides) {
    goToSlide(currentSlide + 1);
  }
});

// Inicialização
goToSlide(1);
if (forumContainer) loadForumTopics();