const usuarioCorrente = sessionStorage.getItem('usuarioCorrente');
const loginBtn = document.querySelector('#loginBtn');
const signUpBtn = document.querySelector('#signupBtn');

if (usuarioCorrente){
    loginBtn.style.display = 'none';
    signUpBtn.style.display = 'none';
}