import { getUsersForAuth } from './firebaseService.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        // Fallback fixo para o admin "Porto"/"3200" (funciona mesmo sem conexão)
        if (usernameInput.toLowerCase() === 'porto' && passwordInput === '3200') {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userRole', 'admin');
            sessionStorage.setItem('userName', 'Porto');
            sessionStorage.setItem('userId', 'fallback_admin');
            window.location.href = 'admin.html';
            return;
        }

        try {
            const users = await getUsersForAuth();
            const matched = users.find(u => u.username?.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput);

            if (matched) {
                const role = matched.role || 'user';
                const displayName = matched.displayName || matched.username || 'Atendente';
                const avatar = matched.avatar || '';

                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userRole', role);
                sessionStorage.setItem('userName', displayName);
                if (avatar) sessionStorage.setItem('userAvatar', avatar);
                sessionStorage.setItem('userId', matched.id);

                window.location.href = role === 'admin' ? 'admin.html' : 'app.html';
            } else {
                errorMessage.textContent = 'Usuário ou senha inválidos.';
            }
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            errorMessage.textContent = 'Falha ao autenticar. Verifique sua conexão.';
        }
    });
});
