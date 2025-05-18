document.addEventListener('DOMContentLoaded', function () {
  const emergencyBtn = document.getElementById('emergencyBtn');
  const emergencyPanel = document.getElementById('emergencyPanel');
  const closePanel = document.getElementById('closePanel');

  emergencyBtn.addEventListener('click', function () {
    emergencyPanel.classList.toggle('visible');
    emergencyBtn.classList.toggle('pulsing', emergencyPanel.classList.contains('visible'));
  });

  closePanel.addEventListener('click', function () {
    emergencyPanel.classList.remove('visible');
    emergencyBtn.classList.remove('pulsing');
  });

  document.getElementById('cvvOption').addEventListener('click', function () {
    showConfirmationModal(
      'Ligar para CVV',
      'Você deseja ligar para o Centro de Valorização da Vida no número 188?',
      function () {
window.location.href = "tel:188";
        emergencyPanel.classList.remove('visible');
        emergencyBtn.classList.remove('pulsing');
      }
    );
  });

  document.getElementById('psychologistOption').addEventListener('click', function () {
    showConfirmationModal(
      'Ajuda Profissional',
      'Deseja conectar com um psicólogo ou psiquiatra agora?',
      function () {
        alert('Conectando você com um profissional de saúde mental...');
        emergencyPanel.classList.remove('visible');
        emergencyBtn.classList.remove('pulsing');
      }
    );
  });

  function showConfirmationModal(title, message, confirmAction) {
    const modal = document.getElementById('confirmationModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalMessage = modal.querySelector('.modal-message');
    const confirmBtn = modal.querySelector('.confirm-btn');

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    const newConfirmBtn = modal.querySelector('.confirm-btn');

    newConfirmBtn.addEventListener('click', function () {
      confirmAction();
      modal.classList.remove('visible');
    });

    modal.classList.add('visible');

    modal.querySelector('.cancel-btn').addEventListener('click', function () {
      modal.classList.remove('visible');
    });
  }

  async function carregarDados() {
    try {
      const response = await fetch('../../../db/db.json');
      if (!response.ok) throw new Error('Erro ao carregar os dados');
      return await response.json();
    } catch (error) {
      console.error('Erro:', error);
      showErrorModal('Erro ao carregar os dados. Por favor, tente novamente.');
      return { contatos: [], servicosDeSaude: [] };
    }
  }

  function showErrorModal(message) {
    const modal = document.getElementById('confirmationModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalMessage = modal.querySelector('.modal-message');
    const confirmBtn = modal.querySelector('.confirm-btn');

    modalTitle.textContent = 'ERRO';
    modalMessage.textContent = message;
    confirmBtn.textContent = 'OK';

    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    modal.querySelector('.confirm-btn').addEventListener('click', function () {
      modal.classList.remove('visible');
    });

    modal.querySelector('.cancel-btn').style.display = 'none';
    modal.classList.add('visible');
  }

  document.getElementById('contactsOption').addEventListener('click', async function () {
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

        document.querySelectorAll('.contact-btn.call').forEach(btn => {
          btn.addEventListener('click', function () {
            const phone = this.getAttribute('data-phone');
            const name = this.getAttribute('data-name');
            showConfirmationModal(
              'Ligar para contato',
              `Você deseja ligar para ${name} no número ${phone}?`,
              function () {
                alert(`Ligando para ${name}: ${phone}`);
              }
            );
          });
        });
      }

      document.querySelector('.add-contact-btn').addEventListener('click', function () {
        showAddContactModal();
      });
    } catch (error) {
      contactsList.innerHTML = '<div class="error">Erro ao carregar contatos</div>';
    }
  });

  function showAddContactModal() {
    const addContactModal = document.getElementById('addContactModal');
    addContactModal.classList.add('visible');
    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';

    const saveBtn = addContactModal.querySelector('.confirm-btn');
    saveBtn.addEventListener('click', function () {
      const name = document.getElementById('contactName').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();

      if (!name || !phone) {
        showErrorModal('Por favor, preencha todos os campos.');
        return;
      }

      alert(`Contato ${name} (${phone}) adicionado com sucesso!`);
      addContactModal.classList.remove('visible');
    });

    addContactModal.querySelector('.cancel-btn').addEventListener('click', function () {
      addContactModal.classList.remove('visible');
    });
  }

  document.getElementById('servicesOption').addEventListener('click', async function () {
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

        document.querySelectorAll('.service-btn.call').forEach(btn => {
          btn.addEventListener('click', function () {
            const phone = this.getAttribute('data-phone');
            const name = this.getAttribute('data-name');
            showConfirmationModal(
              'Ligar para serviço de saúde',
              `Você deseja ligar para ${name} no número ${phone}?`,
              function () {
                alert(`Ligando para ${name}: ${phone}`);
              }
            );
          });
        });

      
        document.querySelectorAll('.service-btn.map').forEach(btn => {
          btn.addEventListener('click', function () {
            const address = this.getAttribute('data-address');
            
            abrirMapa(address);
          });
        });
      }
    } catch (error) {
      servicesList.innerHTML = '<div class="error">Erro ao carregar serviços</div>';
    }
  });

  document.querySelectorAll('.neon-modal').forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        this.classList.remove('visible');
      }
    });
  });

  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.neon-modal').forEach(modal => {
        modal.classList.remove('visible');
      });
    });
  });

  function startEmergencyPulse() {
    emergencyBtn.classList.add('pulsing');
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }
});

window.initMap = function () {};

window.initMap = function () {};

function abrirMapa(endereco) {
  const mapModal = document.getElementById('mapModal');
  const mapDiv = document.getElementById('googleMap');

  mapModal.classList.add('visible');

  setTimeout(() => {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: endereco }, function (results, status) {
      if (status === 'OK') {
        const location = results[0].geometry.location;

        const map = new google.maps.Map(mapDiv, {
          center: location,
          zoom: 16,
        });

        new google.maps.Marker({
          map,
          position: location,
          title: endereco,
        });

       
        setTimeout(() => {
          google.maps.event.trigger(map, 'resize');
          map.setCenter(location);
        }, 300);
      } else {
        alert('Não foi possível localizar o endereço: ' + status);
      }
    });
  }, 300); 

  mapModal.querySelector('.cancel-btn').addEventListener('click', () => {
    mapModal.classList.remove('visible');
    mapDiv.innerHTML = ''; 
  });
}

