document.addEventListener('DOMContentLoaded', function() {
    // ========== FUNCIONALIDADE DE FÓRUNS ==========
    const forumCards = document.querySelectorAll('.forum-card');
    
    // Seleção de fóruns
    forumCards.forEach(card => {
      card.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove a seleção de todos os cards
        forumCards.forEach(c => c.classList.remove('active-forum'));
        
        // Adiciona seleção ao card clicado
        this.classList.add('active-forum');
      });
    });
  
    // ========== FUNCIONALIDADE DE MEMORIES ==========
    const btnAddMemory = document.getElementById('btnAddMemory');
    
    if (btnAddMemory) {
      btnAddMemory.addEventListener('click', function() {
        const caption = document.getElementById('memoryCaption').value;
        const fileInput = document.getElementById('memoryImage');
        
        // Validação simples
        if (!fileInput.files[0] && !caption) {
          alert('Adicione uma foto ou legenda');
          return;
        }
  
        // Simula o upload da imagem
        const imageUrl = fileInput.files[0] ? URL.createObjectURL(fileInput.files[0]) : 'https://via.placeholder.com/1200x400?text=New+Memory';
        
        // Cria o novo elemento de memory
        const memoryContainer = document.getElementById('memoriesContainer');
        const newMemory = document.createElement('div');
        newMemory.className = 'memory-item';
        newMemory.innerHTML = `
          <div class="memory-card bg-white shadow-sm">
            <img src="${imageUrl}" class="memory-img" alt="Memory">
            <div class="p-3">
              <p class="mb-2">${caption || 'Sem legenda'}</p>
              <small class="text-muted">Postado em: ${new Date().toLocaleDateString('pt-BR')}</small>
            </div>
          </div>
        `;
        
        // Adiciona no início do container
        memoryContainer.prepend(newMemory);
        
        // Limpa o formulário
        document.getElementById('memoryCaption').value = '';
        fileInput.value = '';
      });
    }
  });