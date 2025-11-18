/* CÓDIGO FINAL E COMPLETO PARA: js/modules/settings.js */

import {
    // Seletores do Painel de Usuário
    settingsPanel, closeSettingsBtn, profileBtn,
    userDarkModeToggle, userLogoutBtn,
    navbarProfilePic, sidebarProfilePic, profilePicInput,
    // Seletores do Painel de Admin
    darkModeToggle, factoryResetBtn, iframeUrlInput, saveIframeUrlBtn
} from '../dom.js';

// ==================================================================
// FUNÇÕES AUXILIARES (COMPARTILHADAS)
// ==================================================================

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Atualiza o estado dos interruptores em ambas as páginas
    const userToggle = document.getElementById('user-dark-mode-toggle');
    const adminToggle = document.getElementById('dark-mode-toggle');

    if (userToggle) userToggle.checked = (savedTheme === 'dark');
    if (adminToggle) adminToggle.checked = (savedTheme === 'dark');
}

// ==================================================================
// INICIALIZADOR PARA PÁGINA DE USUÁRIO (app.html)
// ==================================================================
export function initSettingsModule() {
    if (!document.getElementById('settings-panel')) return; // Só roda no app.html
    
    applySavedTheme();

    function loadProfilePicture() {
        const savedPic = localStorage.getItem('dataDeckProfilePic');
        if (savedPic) {
            if (navbarProfilePic) navbarProfilePic.src = savedPic;
            if (sidebarProfilePic) sidebarProfilePic.src = savedPic;
        }
    }
    loadProfilePicture();

    // Lógica para abrir/fechar o painel lateral
    if (profileBtn) profileBtn.addEventListener('click', () => settingsPanel.classList.toggle('open'));
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => settingsPanel.classList.remove('open'));
    document.addEventListener('click', (event) => {
        if (settingsPanel && profileBtn && settingsPanel.classList.contains('open') && 
            !settingsPanel.contains(event.target) && !profileBtn.contains(event.target)) {
            settingsPanel.classList.remove('open');
        }
    });

    // Lógica do Modo Escuro para usuário
    if (userDarkModeToggle) {
        userDarkModeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Lógica do Logout para usuário
    if (userLogoutBtn) {
        userLogoutBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja sair?')) {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }

    // Lógica para upload da foto de perfil
    if (sidebarProfilePic && profilePicInput) {
        sidebarProfilePic.parentElement.addEventListener('click', () => profilePicInput.click());
        profilePicInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageDataUrl = e.target.result;
                    localStorage.setItem('dataDeckProfilePic', imageDataUrl);
                    loadProfilePicture();
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

// ==================================================================
// INICIALIZADOR PARA O WIDGET DE ADMIN (admin.html)
// ==================================================================
export function initAdminSettingsModule() {
    if (!document.querySelector('.dashboard-side-col')) return; // Só roda no admin.html

    applySavedTheme();

    // Listener para o interruptor de Modo Escuro do admin
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Carrega e salva a URL do iframe
    const savedIframeUrl = localStorage.getItem('dataDeckIframeUrl');
    if (iframeUrlInput && savedIframeUrl) {
        iframeUrlInput.value = savedIframeUrl;
    }
    if (saveIframeUrlBtn) {
        saveIframeUrlBtn.addEventListener('click', () => {
            const newUrl = iframeUrlInput.value;
            if (newUrl) {
                localStorage.setItem('dataDeckIframeUrl', newUrl);
                alert('URL da página de análise foi salva!');
            }
        });
    }

    // Listener para o botão de Reset Geral
    if (factoryResetBtn) {
        factoryResetBtn.addEventListener('click', () => {
            if (confirm('ATENÇÃO! Certeza que deseja apagar os dados locais?')) {
                localStorage.clear();
                alert('Dados locais apagados.');
                location.reload();
            }
        });
    }
}