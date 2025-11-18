// Substitua o conteúdo de js/auth.js por este

export function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userRole = sessionStorage.getItem('userRole');
    
    // Pega o nome da página atual (ex: "app.html" ou "admin.html")
    const currentPage = window.location.pathname.split('/').pop();

    // Se o usuário não está logado, manda para a tela de login
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return; // Para a execução
    }

    // Se o usuário está na página de admin, mas não tem o papel de admin
    if (currentPage === 'admin.html' && userRole !== 'admin') {
        alert('Acesso negado. Você não tem permissão para acessar esta página.');
        window.location.href = 'app.html'; // Redireciona para a página de usuário
        return;
    }

    // Se o usuário está na página de usuário, mas tem o papel de admin (opcional, mas bom para consistência)
    if (currentPage === 'app.html' && userRole === 'admin') {
        // Redireciona o admin para o painel correto, caso ele acesse a URL errada
        window.location.href = 'admin.html';
        return;
    }
}