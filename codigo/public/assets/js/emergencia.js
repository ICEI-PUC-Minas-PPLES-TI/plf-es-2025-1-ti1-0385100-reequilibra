document.addEventListener('DOMContentLoaded', function() {
    const emergencyBtn = document.getElementById('emergencyBtn');
    const emergencyPanel = document.getElementById('emergencyPanel');
    const closePanel = document.getElementById('closePanel');
    
    // Mostrar/ocultar painel
    emergencyBtn.addEventListener('click', function() {
        emergencyPanel.classList.toggle('visible');
        // Piscar o botão quando aberto
        if (emergencyPanel.classList.contains('visible')) {
            emergencyBtn.classList.add('pulsing');
        } else {
            emergencyBtn.classList.remove('pulsing');
        }
    });
    
    closePanel.addEventListener('click', function() {
        emergencyPanel.classList.remove('visible');
        emergencyBtn.classList.remove('pulsing');
    });
    
    // Opção de ligar para CVV
    document.getElementById('cvvOption').addEventListener('click', function() {
        showConfirmationModal(
            'Ligar para CVV', 
            'Você deseja ligar para o Centro de Valorização da Vida no número 188?',
            function() {
                // Simular ligação (em um app real, isso abriria o discador)
                alert('Ligando para o CVV: 188');
                // Fechar o painel após a ação
                emergencyPanel.classList.remove('visible');
                emergencyBtn.classList.remove('pulsing');
            }
        );
    });
    
    // Opção de ajuda profissional
    document.getElementById('psychologistOption').addEventListener('click', function() {
        showConfirmationModal(
            'Ajuda Profissional', 
            'Deseja conectar com um psicólogo ou psiquiatra agora?',
            function() {
                // Simular conexão com profissional
                alert('Conectando você com um profissional de saúde mental...');
                // Fechar o painel após a ação
                emergencyPanel.classList.remove('visible');
                emergencyBtn.classList.remove('pulsing');
            }
        );
    });
    
    // Função para mostrar modal de confirmação
    function showConfirmationModal(title, message, confirmAction) {
        const modal = document.getElementById('confirmationModal');
        const modalTitle = modal.querySelector('.modal-title');
        const modalMessage = modal.querySelector('.modal-message');
        const confirmBtn = modal.querySelector('.confirm-btn');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        // Remover listeners anteriores para evitar acumulação
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        const newConfirmBtn = modal.querySelector('.confirm-btn');
        
        newConfirmBtn.addEventListener('click', function() {
            confirmAction();
            modal.classList.remove('visible');
        });
        
        modal.classList.add('visible');
        
        // Fechar modal ao clicar no cancelar
        modal.querySelector('.cancel-btn').addEventListener('click', function() {
            modal.classList.remove('visible');
        });
    }
    
    // Função para carregar dados do JSON
    async function carregarDados() {
        try {
            const response = await fetch('../../../db/db.json');
            if (!response.ok) {
                throw new Error('Erro ao carregar os dados');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            showErrorModal('Erro ao carregar os dados. Por favor, tente novamente.');
            return { contatos: [], servicosDeSaude: [] };
        }
    }
    
    // Função para mostrar modal de erro
    function showErrorModal(message) {
        const modal = document.getElementById('confirmationModal');
        const modalTitle = modal.querySelector('.modal-title');
        const modalMessage = modal.querySelector('.modal-message');
        const confirmBtn = modal.querySelector('.confirm-btn');
        
        modalTitle.textContent = 'ERRO';
        modalMessage.textContent = message;
        confirmBtn.textContent = 'OK';
        
        // Remover listeners anteriores
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        modal.querySelector('.confirm-btn').addEventListener('click', function() {
            modal.classList.remove('visible');
        });
        
        // Esconder o botão cancelar
        modal.querySelector('.cancel-btn').style.display = 'none';
        
        modal.classList.add('visible');
    }
    
    // Opção de contatos
    document.getElementById('contactsOption').addEventListener('click', async function() {
        const contactsModal = document.getElementById('contactsModal');
        const contactsList = document.getElementById('contactsList');
        contactsList.innerHTML = '<div class="loading">Carregando...</div>';
        contactsModal.classList.add('visible');
        
        try {
            const dados = await carregarDados();
            contactsList.innerHTML = '';
            
            if (dados.contatos.length === 0) {
                contactsList.innerHTML = '<div class="no-contacts">Nenhum contato cadastrado</div>';
            } else {
                dados.contatos.forEach(contato => {
                    const contactItem = document.createElement('div');
                    contactItem.className = 'contact-item';
                    contactItem.innerHTML = `
                        <div class="contact-info">
                            <div class="contact-name">${contato.nome}</div>
                            <div class="contact-phone">${contato.telefone}</div>
                        </div>
                        <button class="contact-btn call" data-phone="${contato.telefone}" data-name="${contato.nome}">
                            <i class="fas fa-phone-alt"></i>
                        </button>
                    `;
                    contactsList.appendChild(contactItem);
                });
                
                // Adicionar eventos para os botões de ligação
                document.querySelectorAll('.contact-btn.call').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const phone = this.getAttribute('data-phone');
                        const name = this.getAttribute('data-name');
                        showConfirmationModal(
                            'Ligar para contato', 
                            `Você deseja ligar para ${name} no número ${phone}?`,
                            function() {
                                alert(`Ligando para ${name}: ${phone}`);
                            }
                        );
                    });
                });
            }
            
            // Adicionar evento para o botão de adicionar contato
            document.querySelector('.add-contact-btn').addEventListener('click', function() {
                showAddContactModal();
            });
            
        } catch (error) {
            contactsList.innerHTML = '<div class="error">Erro ao carregar contatos</div>';
        }
    });
    
    // Função para mostrar modal de adicionar contato
    function showAddContactModal() {
        const addContactModal = document.getElementById('addContactModal');
        addContactModal.classList.add('visible');
        
        // Limpar campos
        document.getElementById('contactName').value = '';
        document.getElementById('contactPhone').value = '';
        
        // Configurar botão de salvar
        const saveBtn = addContactModal.querySelector('.confirm-btn');
        saveBtn.addEventListener('click', function() {
            const name = document.getElementById('contactName').value.trim();
            const phone = document.getElementById('contactPhone').value.trim();
            
            if (!name || !phone) {
                showErrorModal('Por favor, preencha todos os campos.');
                return;
            }
            
            // Aqui você normalmente enviaria para um servidor
            // Simulando a adição local apenas para demonstração
            alert(`Contato ${name} (${phone}) adicionado com sucesso!`);
            addContactModal.classList.remove('visible');
        });
        
        // Configurar botão de cancelar
        addContactModal.querySelector('.cancel-btn').addEventListener('click', function() {
            addContactModal.classList.remove('visible');
        });
    }
    
    // Opção de serviços de saúde
    document.getElementById('servicesOption').addEventListener('click', async function() {
        const servicesModal = document.getElementById('servicesModal');
        const servicesList = document.getElementById('servicesList');
        servicesList.innerHTML = '<div class="loading">Carregando...</div>';
        servicesModal.classList.add('visible');
        
        try {
            const dados = await carregarDados();
            servicesList.innerHTML = '';
            
            if (dados.servicosDeSaude.length === 0) {
                servicesList.innerHTML = '<div class="no-services">Nenhum serviço de saúde encontrado</div>';
            } else {
                dados.servicosDeSaude.forEach(servico => {
                    const serviceItem = document.createElement('div');
                    serviceItem.className = 'service-item';
                    serviceItem.innerHTML = `
                        <div class="service-name">${servico.nome}</div>
                        <div class="service-type">${servico.tipo}</div>
                        <div class="service-address">${servico.endereco}</div>
                        <div class="service-phone">${servico.telefone}</div>
                        <div class="service-hours">${servico.horario}</div>
                        <div class="service-actions">
                            <button class="service-btn call" data-phone="${servico.telefone}" data-name="${servico.nome}">
                                <i class="fas fa-phone-alt"></i> Ligar
                            </button>
                            <button class="service-btn map" data-address="${servico.endereco}">
                                <i class="fas fa-map-marker-alt"></i> Mapa
                            </button>
                        </div>
                    `;
                    servicesList.appendChild(serviceItem);
                });
                
                // Adicionar eventos para os botões de ligação
                document.querySelectorAll('.service-btn.call').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const phone = this.getAttribute('data-phone');
                        const name = this.getAttribute('data-name');
                        showConfirmationModal(
                            'Ligar para serviço de saúde', 
                            `Você deseja ligar para ${name} no número ${phone}?`,
                            function() {
                                alert(`Ligando para ${name}: ${phone}`);
                            }
                        );
                    });
                });
                
                // Adicionar eventos para os botões de mapa (simulado)
                document.querySelectorAll('.service-btn.map').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const address = this.getAttribute('data-address');
                        showConfirmationModal(
                            'Abrir mapa', 
                            `Deseja abrir o mapa com a localização de ${address}?`,
                            function() {
                                alert(`Abrindo mapa para: ${address}\n\n(Em uma aplicação real, isso abriria o Google Maps ou similar)`);
                            }
                        );
                    });
                });
            }
            
        } catch (error) {
            servicesList.innerHTML = '<div class="error">Erro ao carregar serviços</div>';
        }
    });
    
    // Fechar modais ao clicar no fundo
    document.querySelectorAll('.neon-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('visible');
            }
        });
    });
    
    // Fechar modais com botão cancelar
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.neon-modal').forEach(modal => {
                modal.classList.remove('visible');
            });
        });
    });
    
    // Adicionar efeito de pulso ao botão de emergência em situações críticas
    function startEmergencyPulse() {
        emergencyBtn.classList.add('pulsing');
        // Vibração do dispositivo (se suportado)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }
    
    // Simular emergência (em uma aplicação real, isso seria acionado por um timer ou sensor)
    // setTimeout(startEmergencyPulse, 10000);
});