// Login tradicional com email e senha
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Para o protótipo, o login sempre será bem-sucedido e redirecionará para a dashboard.
    window.location.href = 'dashboard.html';
});

// A funcionalidade de login com o Google é removida no protótipo,
// pois requer um backend para o callback do OAuth.
document.getElementById('btnGoogleLogin').addEventListener('click', function (e) {
    e.preventDefault();
    alert('Funcionalidade de Login com Google desativada no protótipo.');
});
