/* Configurações e painel do usuário/admin */

import {
    // Usuário (app.html)
    settingsPanel, closeSettingsBtn, profileBtn,
    userDarkModeToggle, userLogoutBtn,
    navbarProfilePic, sidebarProfilePic, profilePicInput, sidebarUsername, sendRequestBtn,
    // Admin (admin.html)
    darkModeToggle, factoryResetBtn, iframeUrlInput, saveIframeUrlBtn
} from '../dom.js';
import { getLocalDrafts, sendPublishRequest } from '../state.js';

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const userToggle = document.getElementById('user-dark-mode-toggle');
    const adminToggle = document.getElementById('dark-mode-toggle');
    if (userToggle) userToggle.checked = (savedTheme === 'dark');
    if (adminToggle) adminToggle.checked = (savedTheme === 'dark');
}

export function initSettingsModule() {
    if (!document.getElementById('settings-panel')) return;

    applySavedTheme();

    const sessionAvatar = sessionStorage.getItem('userAvatar');
    const savedPic = sessionAvatar || localStorage.getItem('dataDeckProfilePic');
    if (navbarProfilePic && savedPic) navbarProfilePic.src = savedPic;
    if (sidebarProfilePic && savedPic) sidebarProfilePic.src = savedPic;

    const savedUserName = sessionStorage.getItem('userName');
    if (savedUserName && sidebarUsername) sidebarUsername.textContent = savedUserName;

    if (profileBtn) profileBtn.addEventListener('click', () => settingsPanel.classList.toggle('open'));
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => settingsPanel.classList.remove('open'));
    document.addEventListener('click', (event) => {
        if (settingsPanel && profileBtn && settingsPanel.classList.contains('open') &&
            !settingsPanel.contains(event.target) && !profileBtn.contains(event.target)) {
            settingsPanel.classList.remove('open');
        }
    });

    if (userDarkModeToggle) {
        userDarkModeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    if (userLogoutBtn) {
        userLogoutBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja sair?')) {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }

    // Upload local ainda permitido para fallback, mas avatar oficial vem do admin
    if (sidebarProfilePic && profilePicInput) {
        sidebarProfilePic.parentElement.addEventListener('click', () => profilePicInput.click());
        profilePicInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageDataUrl = e.target.result;
                    localStorage.setItem('dataDeckProfilePic', imageDataUrl);
                    if (navbarProfilePic) navbarProfilePic.src = imageDataUrl;
                    if (sidebarProfilePic) sidebarProfilePic.src = imageDataUrl;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Botão que envia requisição de publicação para os admins
    if (sendRequestBtn) {
        sendRequestBtn.addEventListener('click', async () => {
            const drafts = getLocalDrafts();
            const totalItems = drafts.scripts.length + drafts.terms.length + drafts.tools.length;
            if (totalItems === 0) {
                alert('Nenhum item local para enviar.');
                return;
            }
            const createdBy = sessionStorage.getItem('userName') || 'Atendente';
            const createdById = sessionStorage.getItem('userId') || 'desconhecido';
            try {
                await sendPublishRequest({
                    createdBy,
                    createdById,
                    scripts: drafts.scripts,
                    terms: drafts.terms,
                    tools: drafts.tools
                });
                alert('Requisição enviada para aprovação do admin.');
            } catch (err) {
                console.error('Erro ao enviar requisição', err);
                alert('Falha ao enviar requisição. Tente novamente.');
            }
        });
    }
}

export function initAdminSettingsModule() {
    if (!document.querySelector('.dashboard-side-col')) return;

    applySavedTheme();

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

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
