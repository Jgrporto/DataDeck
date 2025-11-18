/* CÓDIGO FINAL E COMPLETO PARA: js/modules/scripts.js */

import { getScriptsForView, addScript, updateScript, deleteScript, importScriptsLocally, syncLocalDataToFirebase } from '../state.js';
import { scriptListUl, searchInput, displayArea, addScriptModal, addScriptForm, modalTitle, cancelBtn, exportBtn, importBtn, importFileInput } from '../dom.js';

let currentScriptId = null;
let isEditingScript = false;
let scriptToEditId = null;

// ==================================================================
// FUNÇÕES COMPARTILHADAS
// ==================================================================

function showScript(scriptId) {
    currentScriptId = scriptId;
    const script = getScriptsForView().find(s => s.id === scriptId);
    if(displayArea) {
        displayArea.innerHTML = '';
        if (script) {
            const titleEl = document.createElement('h3');
            titleEl.textContent = script.title;
            const descriptionEl = document.createElement('p');
            descriptionEl.textContent = script.description;
            const wrapperEl = document.createElement('div');
            wrapperEl.className = 'code-block-wrapper';
            const preEl = document.createElement('pre');
            const codeEl = document.createElement('code');
            codeEl.textContent = script.code;
            preEl.appendChild(codeEl);
            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copiar';
            copyBtn.className = 'btn copy-btn';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(script.code).then(() => {
                    copyBtn.textContent = 'Copiado!';
                    setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 2000);
                });
            });
            wrapperEl.appendChild(preEl);
            wrapperEl.appendChild(copyBtn);
            displayArea.appendChild(titleEl);
            displayArea.appendChild(descriptionEl);
            displayArea.appendChild(wrapperEl);
        }
    }
}

async function toggleFavorite(scriptId) {
    const script = getScriptsForView().find(s => s.id === scriptId);
    if (script) {
        await updateScript(script.id, { isFavorite: !script.isFavorite });
    }
}

function openAddScriptModal() {
    isEditingScript = false;
    scriptToEditId = null;
    if (modalTitle) modalTitle.textContent = 'Adicionar Novo Script';
    if (addScriptForm) addScriptForm.reset();
    if (addScriptModal) addScriptModal.classList.add('visible');
}

function openEditScriptModal(scriptId) {
    const script = getScriptsForView().find(s => s.id === scriptId);
    if (script) {
        isEditingScript = true;
        scriptToEditId = script.id;
        if (modalTitle) modalTitle.textContent = 'Editar Script';
        document.getElementById('script-title').value = script.title;
        document.getElementById('script-description').value = script.description;
        document.getElementById('script-code').value = script.code;
        if (addScriptModal) addScriptModal.classList.add('visible');
    }
}

function setupSharedModalLogic() {
    if (addScriptForm) {
        addScriptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('script-title').value;
            const description = document.getElementById('script-description').value;
            const code = document.getElementById('script-code').value;
            
            if (isEditingScript) {
                const isFavorite = getScriptsForView().find(s => s.id === scriptToEditId)?.isFavorite || false;
                const scriptData = { title, description, code, isDeletable: true, isFavorite };
                await updateScript(scriptToEditId, scriptData);
            } else {
                const newScript = { title, description, code, isDeletable: true, isFavorite: false };
                await addScript(newScript);
            }
            if(addScriptModal) addScriptModal.classList.remove('visible');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (addScriptModal) addScriptModal.classList.remove('visible');
        });
    }
}

// ==================================================================
// LÓGICA PARA A PÁGINA DE USUÁRIO (app.html)
// ==================================================================

function renderUserScriptList(scripts = getScriptsForView()) {
    if (!scriptListUl) return;
    const scriptsToRender = scripts;
    scriptListUl.innerHTML = '';
    
    scriptsToRender.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.title.localeCompare(b.title);
    }).forEach(script => {
        const li = document.createElement('li');
        li.className = 'script-item';
        li.addEventListener('click', () => showScript(script.id));
        
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        if (script.isFavorite) { favoriteBtn.classList.add('is-favorited'); }
        favoriteBtn.title = 'Marcar como favorito';
        const favoriteIcon = document.createElement('i');
        favoriteIcon.className = script.isFavorite ? 'fas fa-star favorited-star' : 'far fa-star';
        favoriteBtn.appendChild(favoriteIcon);
        favoriteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await toggleFavorite(script.id);
        });

        const titleSpan = document.createElement('span');
        titleSpan.className = 'script-item-title';
        titleSpan.textContent = script.title;

        li.appendChild(favoriteBtn);
        li.appendChild(titleSpan);

        if (String(script.id).startsWith('local_')) {
            const actionsWrapper = document.createElement('div');
            actionsWrapper.className = 'script-item-actions';
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.title = 'Editar Script Local';
            editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditScriptModal(script.id);
            });
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.title = 'Apagar Script Local';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Tem certeza que deseja apagar o script local "${script.title}"?`)) {
                    await deleteScript(script.id);
                }
            });
            actionsWrapper.appendChild(editBtn);
            actionsWrapper.appendChild(deleteBtn);
            li.appendChild(actionsWrapper);
        }
        scriptListUl.appendChild(li);
    });
}

export function initScriptsModule() { // Para app.html
    if (document.querySelector('.admin-dashboard')) return;
    if (!document.getElementById('script-library')) return;

    document.addEventListener('scriptsUpdated', () => renderUserScriptList());
    renderUserScriptList();

    const addScriptPageBtn = document.getElementById('add-script-page-btn');
    if (addScriptPageBtn) {
        addScriptPageBtn.addEventListener('click', openAddScriptModal);
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filtered = getScriptsForView().filter(s => s.title.toLowerCase().includes(searchTerm) || s.description.toLowerCase().includes(searchTerm));
            renderUserScriptList(filtered);
        });
    }
    
    if(exportBtn) {
        exportBtn.addEventListener('click', () => {
             const dataToExport = JSON.stringify(getScriptsForView(), null, 2);
             const dataBlob = new Blob([dataToExport], { type: 'application/json' });
             const downloadLink = document.createElement('a');
             downloadLink.href = URL.createObjectURL(dataBlob);
             downloadLink.download = `scripts_backup_${new Date().toISOString().split('T')[0]}.json`;
             document.body.appendChild(downloadLink);
             downloadLink.click();
             document.body.removeChild(downloadLink);
        });
    }

    if(importBtn && importFileInput) {
        importBtn.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (Array.isArray(importedData)) {
                        if (confirm(`Deseja importar ${importedData.length} script(s)? Eles serão salvos localmente.`)) {
                            importScriptsLocally(importedData);
                        }
                    } else { alert('Erro: Arquivo inválido.'); }
                } catch (error) { alert('Erro ao ler o arquivo.'); }
            };
            reader.readAsText(file);
            importFileInput.value = '';
        });
    }

    setupSharedModalLogic();
}

// ==================================================================
// LÓGICA PARA O PAINEL DE ADMIN (admin.html)
// ==================================================================

function renderAdminScriptsTable(scripts = getScriptsForView()) {
    const scriptsTableBody = document.getElementById('scripts-table-body');
    if (!scriptsTableBody) return;
    const scriptsToRender = scripts;
    const localScriptsCount = document.getElementById('local-scripts-count');
    scriptsTableBody.innerHTML = '';
    let localCount = 0;

    scriptsToRender.forEach(script => {
        if (String(script.id).startsWith('local_')) localCount++;
    });
    if (localScriptsCount) {
        localScriptsCount.textContent = localCount;
        localScriptsCount.style.display = localCount > 0 ? 'inline-block' : 'none';
    }
    if (scriptsToRender.length === 0) {
        scriptsTableBody.innerHTML = `<tr><td colspan="5">Nenhum script encontrado.</td></tr>`;
        return;
    }
    scriptsToRender.sort((a, b) => a.title.localeCompare(b.title)).forEach(script => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${script.title}</td>
            <td>${script.description.substring(0, 50) + (script.description.length > 50 ? '...' : '')}</td>
            <td>
                <span class="status-badge ${String(script.id).startsWith('local_') ? 'local' : 'nuvem'}">
                    ${String(script.id).startsWith('local_') ? 'Local' : 'Nuvem'}
                </span>
            </td>
            <td>
                <i class="${script.isFavorite ? 'fas fa-star' : 'far fa-star'}" 
                   style="color: ${script.isFavorite ? '#f1c40f' : '#bdc3c7'}; cursor: pointer;"
                   title="Favorito"></i>
            </td>
            <td class="actions-cell">
                <button class="edit-btn" title="Editar Script"><i class="fas fa-pencil-alt"></i></button>
                <button class="delete-btn delete" title="Deletar Script"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        
        tr.querySelector('i.fa-star').addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(script.id); });
        tr.querySelector('.edit-btn').addEventListener('click', () => openEditScriptModal(script.id));
        tr.querySelector('.delete-btn').addEventListener('click', async () => {
            if (confirm(`Tem certeza que deseja excluir o script "${script.title}"?`)) {
                await deleteScript(script.id);
            }
        });
        scriptsTableBody.appendChild(tr);
    });
}

export function initAdminScriptsModule() { // Para admin.html
    if (!document.querySelector('.admin-dashboard')) return;

    document.addEventListener('scriptsUpdated', () => renderAdminScriptsTable());
    renderAdminScriptsTable();

    const addScriptBtn = document.getElementById('add-script-btn');
    if (addScriptBtn) {
        addScriptBtn.addEventListener('click', openAddScriptModal);
    }
    
    const syncBtn = document.getElementById('sync-btn');
    const adminSearchInput = document.getElementById('admin-search-scripts');
    
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
             const password = prompt("Digite a senha mestre para sincronizar:");
             if (password === '3200') {
                 const itemsSynced = await syncLocalDataToFirebase();
                 if (itemsSynced > 0) {
                     alert(`${itemsSynced} item(ns) sincronizado(s) com sucesso!`);
                 } else {
                     alert('Nenhum item local para sincronizar.');
                 }
             } else if (password !== null) {
                 alert('Senha incorreta.');
             }
        });
    }
    if(adminSearchInput) {
        adminSearchInput.addEventListener('keyup', () => {
             const searchTerm = adminSearchInput.value.toLowerCase();
             const filteredScripts = getScriptsForView().filter(script => 
                (script.title.toLowerCase().includes(searchTerm) || 
                 script.description.toLowerCase().includes(searchTerm))
             );
             renderAdminScriptsTable(filteredScripts);
        });
    }
    
    
    setupSharedModalLogic();
}
