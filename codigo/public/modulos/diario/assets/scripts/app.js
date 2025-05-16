const btnSalvarDiario = document.getElementById('btnSalvarDiario');
let statusDiario = '';

btnSalvarDiario.addEventListener('click', function(event){
    event.preventDefault();
    const tituloDiario = document.getElementById('tituloDiario').value;
    const textoDiario = document.getElementById('textoDiario').value;
    const date = new Date();

    listaDiarios(1, tituloDiario, textoDiario, statusDiario, date.toLocaleDateString('pt-BR'), date.toLocaleTimeString('pt-BR'));
});

// ============== BOTÕES STATUS ================
function defStatusDiario(i){
    //resetar os botões
    const resetBtn = document.querySelectorAll('#btnStatus1, #btnStatus2, #btnStatus3, #btnStatus4, #btnStatus5');
    resetBtn.forEach(btn => btn.classList.replace('btn-success','btn-light')); 


    statusDiario = i;
    const btnStatus = document.getElementById(`btnStatus${i}`);

    btnStatus.classList.replace('btn-light','btn-success');
 

}


