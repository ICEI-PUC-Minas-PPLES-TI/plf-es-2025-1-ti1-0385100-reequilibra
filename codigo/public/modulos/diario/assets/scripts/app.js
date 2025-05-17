const btnSalvarDiario = document.getElementById('btnSalvarDiario');
let statusDiario = '';
let selectedDiario = '';
let diarioID = '';
let boolSelectedDiario = false;
const apiUrl = 'https://12d88d11-bf7c-4a60-adc6-de173aa536e8-00-2r4bfxqpkwg9l.kirk.replit.dev/diario';

btnSalvarDiario.addEventListener('click', function(event){
    event.preventDefault();
    const tituloDiario = document.getElementById('tituloDiario').value;
    const textoDiario = document.getElementById('textoDiario').value;
    const date = new Date();

    //gera o ID
    diarioID = Date.now();

        // Cria um objeto com os dados do contato
        let diarioObject = { 
            id: diarioID,
            userid: 1,
            data: date.toLocaleDateString('pt-BR'),
            titulo: tituloDiario,
            publico: false,
            status: statusDiario,
            conteudo: textoDiario,
            favorito: false };    

            createDiario(diarioObject, listaDiarios);

});




//CREATE
function createDiario(diarioObject, refreshFunction) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(diarioObject),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }
            return response.json(); // Converte a resposta para JSON
        })
        .then(data => {
            alert("Diário inserido com sucesso");

            if (refreshFunction) {
                // Atualiza a lista de diários e destaca o novo card
                refreshFunction()
                    .then(() => {
                        selecionaDiario(data.id);
                    });
            }
        })
        .catch(error => {
            console.error('Erro ao inserir diário via API REPLIT Server:', error);
            alert("Erro ao inserir diário");
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


function selecionaDiario(i){
    selectedDiario = i;

    console.log("ID do diário selecionado:", selectedDiario);

    allCards = document.querySelectorAll('#diario1 > div');
    allCards.forEach(cards => cards.classList.replace('bg-primary','bg-light'));

    let card = document.getElementById(`card${i}`);
    card.classList.replace('bg-light','bg-primary');

    }



    

    function deleteDiario(id, refreshFunction) {
        if (!id) {
            alert("Nenhum diário foi selecionado para exclusão.");
            return;
        }
    
        fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
        })
           .then(response => {
            if(!response.ok){
                console.log('Diário não encontrado');
                alert("Diário não encontrado");
                return;
            }
           })
            .then(response => response.json()) // Converte para JSON
            .then(data => {
                alert("Diário removido com sucesso");
    
                // Atualiza a lista de diários
                if (refreshFunction) {
                    refreshFunction();
                }
            })
            .catch(error => {
                console.error('Erro ao remover diário via API:', error);
                alert("Erro ao remover diário");
            });
    }
    
    
    
    



