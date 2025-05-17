document.addEventListener('DOMContentLoaded', function() {
    const emergencyBtn = document.getElementById('emergencyBtn');
    const emergencyPanel = document.getElementById('emergencyPanel');
    const closePanel = document.getElementById('closePanel');
    
    // Mostrar/ocultar painel
    emergencyBtn.addEventListener('click', function() {
        emergencyPanel.classList.toggle('visible');
    });
    
    closePanel.addEventListener('click', function() {
        emergencyPanel.classList.remove('visible');
    });
    
    // Opção de ligar para CVV
    document.getElementById('cvvOption').addEventListener('click', function() {
        alert('Ligando para o CVV: 188');
    });
    
    // Função para carregar dados do JSON
    async function carregarDados() {
        try {
            const response = await fetch('db.json');
            if (!response.ok) {
                throw new Error('Erro ao carregar os dados');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar os dados. Por favor, tente novamente.');
            return { contatos: [], servicosDeSaude: [] };
        }
    }
    
    // Opção de contatos
    document.getElementById('contactsOption').addEventListener('click', async function() {
        const contactsList = document.getElementById('contactsList');
        contactsList.innerHTML = '<div class="loading">Carregando...</div>';
        
        try {
            const dados = await carregarDados();
            contactsList.innerHTML = '';
            
            dados.contatos.forEach(contato => {
                const contactItem = document.createElement('div');
                contactItem.className = 'contact-item';
                contactItem.innerHTML = `
                    <div class="contact-info">
                        <div class="contact-name">${contato.nome}</div>
                        <div class="contact-phone">${contato.telefone}</div>
                    </div>
                    <button class="contact-btn call" onclick="alert('Ligando para ${contato.nome}: ${contato.telefone}')">
                        <i class="fas fa-phone-alt"></i>
                    </button>
                `;
                contactsList.appendChild(contactItem);
            });
            
            document.getElementById('contactsModal').classList.add('visible');
        } catch (error) {
            contactsList.innerHTML = '<div class="error">Erro ao carregar contatos</div>';
        }
    });
    
    // Opção de serviços de saúde
    document.getElementById('servicesOption').addEventListener('click', async function() {
        const servicesList = document.getElementById('servicesList');
        servicesList.innerHTML = '<div class="loading">Carregando...</div>';
        
        try {
            const dados = await carregarDados();
            servicesList.innerHTML = '';
            
            dados.servicosDeSaude.forEach(servico => {
                const serviceItem = document.createElement('div');
                serviceItem.className = 'service-item';
                serviceItem.innerHTML = `
                    <div class="service-name">${servico.nome}</div>
                    <div class="service-type">${servico.tipo}</div>
                    <div class="service-address">${servico.endereco}</div>
                    <div class="service-phone">${servico.telefone}</div>
                    <div class="service-hours">${servico.horario}</div>
                    <button class="service-btn call" onclick="alert('Ligando para ${servico.nome}: ${servico.telefone}')">
                        <i class="fas fa-phone-alt"></i> Ligar
                    </button>
                `;
                servicesList.appendChild(serviceItem);
            });
            
            document.getElementById('servicesModal').classList.add('visible');
        } catch (error) {
            servicesList.innerHTML = '<div class="error">Erro ao carregar serviços</div>';
        }
    });
    
    // Fechar modais
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.neon-modal').forEach(modal => {
                modal.classList.remove('visible');
            });
        });
    });
});