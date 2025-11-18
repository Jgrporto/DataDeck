import { checkAuth } from './auth.js';
import { setupListeners, getScriptsForView, getTermsForView, getUsersForView, importScriptsLocally, importTermsLocally, importUsersLocally } from './state.js';
import { initAdminScriptsModule } from './modules/scripts.js';
import { initAdminTermsModule } from './modules/terms.js';
import { initAdminSettingsModule } from './modules/settings.js';
import { initAdminUsersModule } from './modules/users.js';

checkAuth();

function updateStats() {
    const statsCloudScriptsEl = document.getElementById('stats-cloud-scripts');
    const statsLocalScriptsEl = document.getElementById('stats-local-scripts');
    const statsTermsTotalEl = document.getElementById('stats-terms-total');
    const statsUsersTotalEl = document.getElementById('stats-users-total');

    const allScripts = getScriptsForView();
    const allTerms = getTermsForView();
    const allUsers = getUsersForView();

    const localScriptsCount = allScripts.filter(s => String(s.id).startsWith('local_')).length;
    const cloudScriptsCount = allScripts.length - localScriptsCount;

    if (statsCloudScriptsEl) statsCloudScriptsEl.textContent = cloudScriptsCount;
    if (statsLocalScriptsEl) statsLocalScriptsEl.textContent = localScriptsCount;
    if (statsTermsTotalEl) statsTermsTotalEl.textContent = allTerms.length;
    if (statsUsersTotalEl) statsUsersTotalEl.textContent = allUsers.length;
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja sair?')) {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
}

function setupUniversalImporter() {
    const importBtn = document.getElementById('universal-import-btn');
    const importInput = document.getElementById('universal-import-input');

    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());

        importInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    let scriptsFound = 0;
                    let termsFound = 0;
                    let usersFound = 0;

                    if (data.scripts && Array.isArray(data.scripts)) {
                        importScriptsLocally(data.scripts);
                        scriptsFound = data.scripts.length;
                    }

                    if (data.terms && Array.isArray(data.terms)) {
                        importTermsLocally(data.terms);
                        termsFound = data.terms.length;
                    }

                    // Verifica e importa USERS
                    if (data.users && Array.isArray(data.users)) {
                        importUsersLocally(data.users);
                        usersFound = data.users.length;
                    }

                    alert(`Importacao concluida!\n- ${scriptsFound} scripts adicionados localmente.\n- ${termsFound} termos adicionados localmente.\n- ${usersFound} logins adicionados localmente.\n\nUse o botao "Sincronizar" para envia-los para a nuvem.`);

                } catch (error) {
                    alert('Erro ao ler o arquivo. Verifique se e um arquivo .json valido.');
                    console.error("Erro ao importar:", error);
                }
            };
            reader.readAsText(file);
            importInput.value = '';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAdminScriptsModule();
    initAdminTermsModule();
    initAdminSettingsModule();
    initAdminUsersModule();
    
    setupLogout();
    setupUniversalImporter();

    document.addEventListener('scriptsUpdated', updateStats);
    document.addEventListener('termsUpdated', updateStats);
    document.addEventListener('usersUpdated', updateStats);
    
    setupListeners();
});
