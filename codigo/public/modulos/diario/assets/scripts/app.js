const btnSalvarDiario = document.getElementById('btnSalvarDiario');
let statusDiario = '';

btnSalvarDiario.addEventListener('click', function(event){
    event.preventDefault();
    const tituloDiario = document.getElementById('tituloDiario').value;
    const textoDiario = document.getElementById('textoDiario').value;


    document.getElementById('teste').innerHTML = ` Título ${tituloDiario}, Texto ${textoDiario}, Status ${statusDiario}`;
});

// ============== BOTÕES STATUS ================
function defStatusDiario(i){
    statusDiario = i;
}


