const btnSalvarDiario = document.getElementById('btnSalvarDiario');
let statusDiario = '';
const apiUrl = 'https://12d88d11-bf7c-4a60-adc6-de173aa536e8-00-2r4bfxqpkwg9l.kirk.replit.dev/diario';

btnSalvarDiario.addEventListener('click', function(event){
    event.preventDefault();
    const tituloDiario = document.getElementById('tituloDiario').value;
    const textoDiario = document.getElementById('textoDiario').value;
    const date = new Date();


        // Cria um objeto com os dados do contato
        let diarioObject = { 
            userid: 1,
            data: date.toLocaleDateString('pt-BR'),
            titulo: tituloDiario,
            publico: false,
            status: statusDiario,
            conteudo: textoDiario,
            favorito: false };    

            createDiario(diarioObject, exibeDiarios);

});


//refresh
function exibeDiarios() {
    const listaDiarios = document.getElementById('listaDiarios');
}

//CREATE
function createDiario(diarioObject, refreshFunction) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(diarioObject),
    })
        .then(response => response.json())
        .then(data => {
            alert("Diario inserido com sucesso");
            if (refreshFunction)
                refreshFunction();
        })
        .catch(error => {
            console.error('Erro ao inserir diario via API JSONServer:', error);
            alert("Erro ao inserir diario");
        });
}

// ============== BOTÕES STATUS ================
function defStatusDiario(i){
    //resetar os botões
    const resetBtn = document.querySelectorAll('#btnStatus1, #btnStatus2, #btnStatus3, #btnStatus4, #btnStatus5');
    resetBtn.forEach(btn => btn.classList.replace('btn-success','btn-light')); 


    statusDiario = i;
    const btnStatus = document.getElementById(`btnStatus${i}`);

    btnStatus.classList.replace('btn-light','btn-success');
 

}


