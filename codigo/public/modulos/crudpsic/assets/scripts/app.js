const API_URL = 'http://localhost:3000/psicologos';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('psicologoForm');
    const tabelaBody = document.getElementById('psicologosTableBody');
    const modal = document.getElementById('confirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const fotoInput = document.getElementById('foto');
    const fotoPreview = document.getElementById('fotoPreview');
    
    let psicologoEmEdicao = null;
    
    form.addEventListener('submit', handleSubmit);
    cancelDeleteBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', resetForm);
    fotoInput.addEventListener('change', handleFotoChange);
    
    carregarPsicologos();
    
    async function handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const dados = obterDadosFormulario(formData);
        
        if (!dados) return;
        
        try {
            if (psicologoEmEdicao) {
                await atualizarPsicologo(psicologoEmEdicao.id, dados);
            } else {
                await criarPsicologo(dados);
            }
            
            resetForm();
            await carregarPsicologos();
        } catch (error) {
            console.error('Erro ao salvar psicólogo(a):', error);
            alert('Ocorreu um erro ao salvar os dados.');
        }
    }
    
    function obterDadosFormulario(formData) {
        const dados = {
            nome: formData.get('nome').trim(),
            crp: formData.get('crp').trim(),
            email: formData.get('email').trim(),
            whatsapp: formData.get('whatsapp').trim(),
            area_atuacao: formData.get('area_atuacao').trim(),
            descricao: formData.get('descricao').trim(),
            local_atendimento: formData.get('local_atendimento'),
            cep: formData.get('cep').trim(),
            horarios: formData.get('horarios').trim(),
            img: 'https://randomuser.me/api/portraits/lego/5.jpg'
        };
        
        if (!dados.nome || !dados.crp || !dados.email || !dados.whatsapp || 
            !dados.area_atuacao || !dados.descricao || !dados.local_atendimento || !dados.horarios) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return null;
        }
        
        return dados;
    }
    
    function handleFotoChange(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                fotoPreview.innerHTML = `<img src="${event.target.result}" alt="Preview da foto">`;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }
    
    async function carregarPsicologos() {
        try {
            const response = await fetch(API_URL);
            const psicologos = await response.json();
            
            tabelaBody.innerHTML = '';
            
            psicologos.forEach(psicologo => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td><img src="${psicologo.img}" alt="${psicologo.nome}" class="psicologo-avatar"></td>
                    <td>${psicologo.nome}</td>
                    <td>${psicologo.crp}</td>
                    <td>${psicologo.area_atuacao}</td>
                    <td>${psicologo.local_atendimento}</td>
                    <td class="action-buttons">
                        <button data-id="${psicologo.id}" class="btn btn-edit btn-sm">Editar</button>
                        <button data-id="${psicologo.id}" class="btn btn-delete btn-sm">Excluir</button>
                    </td>
                `;
                
                row.querySelector('.btn-edit').addEventListener('click', () => editarPsicologo(psicologo.id));
                row.querySelector('.btn-delete').addEventListener('click', () => confirmarExclusao(psicologo.id));
                
                tabelaBody.appendChild(row);
            });
        } catch (error) {
            console.error('Erro ao carregar psicólogos:', error);
            alert('Ocorreu um erro ao carregar os dados.');
        }
    }
    
    async function editarPsicologo(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            const psicologo = await response.json();
            
            psicologoEmEdicao = psicologo;
            
            document.getElementById('psicologoId').value = psicologo.id;
            document.getElementById('nome').value = psicologo.nome;
            document.getElementById('crp').value = psicologo.crp;
            document.getElementById('email').value = psicologo.email;
            document.getElementById('whatsapp').value = psicologo.whatsapp;
            document.getElementById('area_atuacao').value = psicologo.area_atuacao;
            document.getElementById('descricao').value = psicologo.descricao;
            document.getElementById('local_atendimento').value = psicologo.local_atendimento;
            document.getElementById('cep').value = psicologo.cep || '';
            document.getElementById('horarios').value = psicologo.horarios;
            
            fotoPreview.innerHTML = `<img src="${psicologo.img}" alt="Foto atual">`;
            
            submitBtn.textContent = 'Atualizar';
            
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Erro ao editar psicólogo(a):', error);
            alert('Ocorreu um erro ao carregar os dados para edição.');
        }
    }
    
    function confirmarExclusao(id) {
        const nome = document.querySelector(`tr button[data-id="${id}"]`).parentElement.parentElement.querySelector('td:nth-child(2)').textContent;
        const crp = document.querySelector(`tr button[data-id="${id}"]`).parentElement.parentElement.querySelector('td:nth-child(3)').textContent;
        
        document.getElementById('confirmModalTitle').textContent = `Excluir ${nome}`;
        document.getElementById('confirmModalMessage').textContent = `Tem certeza que deseja excluir o psicólogo(a) ${nome} (CRP: ${crp})?`;
        
        confirmDeleteBtn.onclick = async () => {
            try {
                await deletarPsicologo(id);
                closeModal();
                await carregarPsicologos();
            } catch (error) {
                console.error('Erro ao excluir psicólogo(a):', error);
                alert('Ocorreu um erro ao excluir o psicólogo(a).');
            }
        };
        
        openModal();
    }
    
    async function criarPsicologo(dados) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao criar psicólogo(a)');
        }
    }
    
    async function atualizarPsicologo(id, dados) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao atualizar psicólogo(a)');
        }
    }
    
    async function deletarPsicologo(id) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao excluir psicólogo(a)');
        }
    }
    
    function openModal() {
        modal.style.display = 'flex';
    }
    
    function closeModal() {
        modal.style.display = 'none';
    }
    
    function resetForm() {
        form.reset();
        fotoPreview.innerHTML = '';
        psicologoEmEdicao = null;
        submitBtn.textContent = 'Cadastrar';
    }
});