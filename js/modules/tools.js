/* CÓDIGO FINAL E COMPLETO PARA: js/modules/tools.js */

import { getToolsForView, addTool, updateTool, deleteTool } from '../state.js';
import { 
    addToolModal, addToolForm, cancelToolBtn, toolModalTitle, 
    toolIconInput, toolIconPreview 
} from '../dom.js';

let isEditingTool = false;
let toolToEditId = null;

// ==================================================================
// FUNÇÕES COMPARTILHADAS
// ==================================================================

function openAddToolModal() {
    isEditingTool = false;
    toolToEditId = null;
    if (toolModalTitle) toolModalTitle.textContent = 'Adicionar Nova Ferramenta';
    if (addToolForm) addToolForm.reset();
    if (toolIconPreview) {
        toolIconPreview.src = '';
        toolIconPreview.classList.add('hidden');
    }
    if (addToolModal) addToolModal.classList.add('visible');
}

function openEditToolModal(toolId) {
    const tool = getToolsForView().find(t => t.id === toolId);
    if (tool) {
        isEditingTool = true;
        toolToEditId = tool.id;
        if (toolModalTitle) toolModalTitle.textContent = 'Editar Ferramenta';
        document.getElementById('tool-name').value = tool.name;
        document.getElementById('tool-url').value = tool.url;
        document.getElementById('tool-description').value = tool.description;
        document.getElementById('tool-category').value = tool.category;
        
        if (toolIconPreview) {
            if (tool.icon && tool.icon.startsWith('data:image')) {
                toolIconPreview.src = tool.icon;
                toolIconPreview.classList.remove('hidden');
            } else {
                toolIconPreview.src = '';
                toolIconPreview.classList.add('hidden');
            }
        }
        if (addToolModal) addToolModal.classList.add('visible');
    }
}

function setupSharedToolModalLogic() {
    if (addToolForm) {
        addToolForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const toolData = {
                name: document.getElementById('tool-name').value,
                url: document.getElementById('tool-url').value,
                description: document.getElementById('tool-description').value,
                icon: toolIconPreview.src,
                category: document.getElementById('tool-category').value,
                isDeletable: true
            };

            if (isEditingTool) {
                await updateTool(toolToEditId, toolData);
            } else {
                await addTool(toolData);
            }
            if (addToolModal) addToolModal.classList.remove('visible');
        });
    }
    
    if (cancelToolBtn) {
        cancelToolBtn.addEventListener('click', () => {
            if (addToolModal) addToolModal.classList.remove('visible');
        });
    }

    if (toolIconInput) {
        toolIconInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && toolIconPreview) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    toolIconPreview.src = e.target.result;
                    toolIconPreview.classList.remove('hidden');
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

// ==================================================================
// LÓGICA PARA A PÁGINA DE USUÁRIO (app.html)
// ==================================================================

function renderUserToolsGrid() {
    const monitoringGrid = document.querySelector('#monitoramento-tools .tools-grid');
    if (!monitoringGrid) return;

    const tools = getToolsForView();
    const consultingGrid = document.querySelector('#consulta-tools .tools-grid');
    const serviceGrid = document.querySelector('#atendimento-tools .tools-grid');
    
    monitoringGrid.innerHTML = '';
    consultingGrid.innerHTML = '';
    serviceGrid.innerHTML = '';

    tools.sort((a,b) => a.name.localeCompare(b.name)).forEach(tool => {
        const toolCard = document.createElement('a');
        toolCard.className = 'tool-card';
        toolCard.href = tool.url;
        toolCard.target = '_blank';
        toolCard.rel = 'noopener noreferrer';
        
        const titleEl = document.createElement('h3');
        if (tool.icon) {
            const iconEl = document.createElement('img');
            iconEl.src = tool.icon;
            iconEl.className = 'tool-icon';
            iconEl.alt = '';
            titleEl.appendChild(iconEl);
        }
        titleEl.appendChild(document.createTextNode(' ' + tool.name));
        
        const descriptionEl = document.createElement('p');
        descriptionEl.textContent = tool.description;

        toolCard.appendChild(titleEl);
        toolCard.appendChild(descriptionEl);

        switch (tool.category) {
            case 'monitoramento': monitoringGrid.appendChild(toolCard); break;
            case 'consulta': consultingGrid.appendChild(toolCard); break;
            case 'atendimento': serviceGrid.appendChild(toolCard); break;
        }
    });
}

export function initToolsModule() {
    if (document.querySelector('.admin-dashboard') || !document.getElementById('ferramentas-section')) return;

    document.addEventListener('toolsUpdated', () => renderUserToolsGrid());
    renderUserToolsGrid();

    const addToolBtn = document.getElementById('add-tool-btn');
    if (addToolBtn) addToolBtn.addEventListener('click', openAddToolModal);
    
    setupSharedToolModalLogic();
}

// ==================================================================
// LÓGICA PARA O PAINEL DE ADMIN (admin.html)
// ==================================================================

function renderAdminToolsTable() {
    const toolsTableBody = document.getElementById('tools-table-body');
    if (!toolsTableBody) return;

    const toolsToRender = getToolsForView();
    toolsTableBody.innerHTML = '';

    if (toolsToRender.length === 0) {
        toolsTableBody.innerHTML = `<tr><td colspan="5">Nenhuma ferramenta encontrada.</td></tr>`;
        return;
    }

    toolsToRender.sort((a,b) => a.name.localeCompare(b.name)).forEach(tool => {
        const tr = document.createElement('tr');
        const isLocal = String(tool.id).startsWith('local_');
        tr.innerHTML = `
            <td>${tool.name}</td>
            <td>${tool.category}</td>
            <td>
                <span class="status-badge ${isLocal ? 'local' : 'nuvem'}">
                    ${isLocal ? 'Local' : 'Nuvem'}
                </span>
            </td>
            <td class="actions-cell">
                <button class="edit-btn" title="Editar Ferramenta"><i class="fas fa-pencil-alt"></i></button>
                <button class="delete-btn delete" title="Deletar Ferramenta"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;

        tr.querySelector('.edit-btn').addEventListener('click', () => openEditToolModal(tool.id));
        tr.querySelector('.delete-btn').addEventListener('click', async () => {
            if (confirm(`Tem certeza que deseja excluir a ferramenta "${tool.name}"?`)) {
                await deleteTool(tool.id);
            }
        });

        toolsTableBody.appendChild(tr);
    });
}

export function initAdminToolsModule() {
    if (!document.querySelector('.admin-dashboard')) return;
    
    document.addEventListener('toolsUpdated', () => renderAdminToolsTable());
    renderAdminToolsTable();

    const addToolBtn = document.getElementById('add-tool-btn');
    const adminSearchInput = document.getElementById('admin-search-tools');

    if (addToolBtn) addToolBtn.addEventListener('click', openAddToolModal);

    if (adminSearchInput) {
        adminSearchInput.addEventListener('keyup', () => {
            const searchTerm = adminSearchInput.value.toLowerCase();
            const filteredTools = getToolsForView().filter(tool => 
                tool.name.toLowerCase().includes(searchTerm)
            );
            renderAdminToolsTable(filteredTools);
        });
    }

    setupSharedToolModalLogic();
}