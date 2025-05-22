const mensagens = [
    { texto: "Respire fundo. Você não está sozinho(a).", link: "" },
    { texto: "Ligue 188 para conversar com o CVV.", link: "https://www.cvv.org.br" }
];

document.getElementById("botaoEmergencia").addEventListener("click", () => {
    const mensagem = mensagens[Math.floor(Math.random() * mensagens.length)];
    alert(mensagem.texto);
    if (mensagem.link) window.open(mensagem.link, "_blank");
});
