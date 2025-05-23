const textarea = document.getElementById('desabafo');
const contador = document.querySelector('.contador');
const enviarBtn = document.getElementById('enviar');
const lerBtn = document.getElementById('ler');
const desabafoExibido = document.getElementById('desabafoExibido');
const categoriaSelect = document.getElementById('categoria');

const CHAVE_SECRETA = 'chave-secreta'; // Mantenha essa chave em segurança na prática

// Carrega desabafos do localStorage ou inicia vazio
let desabafos = JSON.parse(localStorage.getItem('desabafos')) || [];

// Atualiza contador enquanto digita
textarea.addEventListener('input', () => {
    contador.textContent = `${textarea.value.length}/500`;
});

// Função para salvar desabafo criptografado no localStorage
function salvarDesabafo(texto, categoria) {
    if (!texto.trim() || !categoria) return false;

    const textoCriptografado = CryptoJS.AES.encrypt(texto, CHAVE_SECRETA).toString();

    desabafos.push({
        texto: textoCriptografado,
        categoria,
        data: new Date().toLocaleString()
    });

    localStorage.setItem('desabafos', JSON.stringify(desabafos));
    return true;
}

// Evento para enviar desabafo
enviarBtn.addEventListener('click', () => {
    const texto = textarea.value.trim();
    const categoria = categoriaSelect.value;

    if (!texto) {
        alert('Por favor, escreva seu desabafo.');
        return;
    }
    if (!categoria) {
        alert('Por favor, selecione uma categoria.');
        return;
    }

    if (salvarDesabafo(texto, categoria)) {
        alert('Desabafo enviado com sucesso! Obrigado por compartilhar.');

        // Limpa campos
        textarea.value = '';
        categoriaSelect.value = '';
        contador.textContent = '0/500';
    }
});

// Evento para ler desabafo aleatório
lerBtn.addEventListener('click', () => {
    if (desabafos.length === 0) {
        desabafoExibido.textContent = 'Nenhum desabafo disponível ainda.';
        return;
    }

    const aleatorio = desabafos[Math.floor(Math.random() * desabafos.length)];

    let textoDescriptografado;
    try {
        textoDescriptografado = CryptoJS.AES.decrypt(aleatorio.texto, CHAVE_SECRETA).toString(CryptoJS.enc.Utf8);
        if (!textoDescriptografado) textoDescriptografado = "(Erro ao descriptografar)";
    } catch {
        textoDescriptografado = "(Erro ao descriptografar)";
    }

    desabafoExibido.innerHTML = `
        <strong>${aleatorio.categoria}</strong>
        <p>"${textoDescriptografado}"</p>
        <small>${aleatorio.data || ''}</small>
    `;
});
