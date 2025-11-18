document.addEventListener('DOMContentLoaded', () => {

    const users = {
    admin: {
        username: 'Admin',
        password: 'SYNC_MASTER_2025' // Recomendo usar a mesma senha da sincronização
    },
    user: {
        username: 'Suporte',
        password: '3200'
    }
};

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o envio do formulário

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    let userRole = null;
    let redirectPage = null;

    // Verifica se as credenciais correspondem ao admin
    if (usernameInput === users.admin.username && passwordInput === users.admin.password) {
        userRole = 'admin';
        redirectPage = 'admin.html'; // A nova página do admin
    } 
    // Se não for admin, verifica se corresponde ao usuário padrão
    else if (usernameInput === users.user.username && passwordInput === users.user.password) {
        userRole = 'user';
        redirectPage = 'app.html'; // A página do usuário padrão
    }

    // Se encontrou um papel válido (admin ou user)
    if (userRole) {
        errorMessage.textContent = '';
        
        // Salva o status do login E o nível de acesso
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userRole', userRole);
        
        // Redireciona para a página correta
        window.location.href = redirectPage;
    } else {
        // Se as credenciais não corresponderem a ninguém
        errorMessage.textContent = 'Usuário ou senha inválidos.';
    }
});
});
