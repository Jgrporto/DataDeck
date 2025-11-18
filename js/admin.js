import { checkAuth } from './auth.js';
// Adiciona as novas funções de importação do state
import { setupListeners, getScriptsForView, getToolsForView, importScriptsLocally, importToolsLocally } from './state.js';
import { initAdminScriptsModule } from './modules/scripts.js';
import { initAdminToolsModule } from './modules/tools.js';
import { initAdminSettingsModule } from './modules/settings.js';

checkAuth();

function updateStats() {
    const statsCloudScriptsEl = document.getElementById('stats-cloud-scripts');
    const statsLocalScriptsEl = document.getElementById('stats-local-scripts');
    const statsCloudToolsEl = document.getElementById('stats-cloud-tools');

    const allScripts = getScriptsForView();
    const allTools = getToolsForView();

    const localScriptsCount = allScripts.filter(s => String(s.id).startsWith('local_')).length;
    const cloudScriptsCount = allScripts.length - localScriptsCount;
    const localToolsCount = allTools.filter(t => String(t.id).startsWith('local_')).length;
    const cloudToolsCount = allTools.length - localToolsCount;

    if (statsCloudScriptsEl) statsCloudScriptsEl.textContent = cloudScriptsCount;
    if (statsLocalScriptsEl) statsLocalScriptsEl.textContent = localScriptsCount;
    if (statsCloudToolsEl) statsCloudToolsEl.textContent = cloudToolsCount;
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


// ▼▼▼ NOVA FUNÇÃO UNIVERSAL DE IMPORTAÇÃO ▼▼▼
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
                    let toolsFound = 0;

                    // Verifica e importa SCRIPTS
                    if (data.scripts && Array.isArray(data.scripts)) {
                        importScriptsLocally(data.scripts);
                        scriptsFound = data.scripts.length;
                    }

                    // Verifica e importa FERRAMENTAS
                    if (data.tools && Array.isArray(data.tools)) {
                        importToolsLocally(data.tools);
                        toolsFound = data.tools.length;
                    }

                    alert(`Importação concluída!\n- ${scriptsFound} scripts adicionados localmente.\n- ${toolsFound} ferramentas adicionadas localmente.\n\nUse o botão "Sincronizar" para enviá-los para a nuvem.`);

                } catch (error) {
                    alert('Erro ao ler o arquivo. Verifique se é um arquivo .json válido.');
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
    initAdminToolsModule();
    initAdminSettingsModule();
    
    setupLogout();
    setupUniversalImporter(); // <-- Chama a nova função

    document.addEventListener('scriptsUpdated', updateStats);
    document.addEventListener('toolsUpdated', updateStats);
    
    setupListeners();
});