/* MODULO DE TERMOS COM VARIAVEIS "XXX" */

import { getTermsForView, addTerm, updateTerm, deleteTerm } from '../state.js';
import {
    addTermBtn,
    addTermModal,
    addTermForm,
    cancelTermBtn,
    termModalTitle,
    searchTermsInput,
    termsList,
    termOutput,
    termOutputTitle,
    copyTermOutputBtn,
    fillTermModal,
    fillTermForm,
    fillTermFields,
    cancelFillTermBtn
} from '../dom.js';

let isEditing = false;
let termToEditId = null;
let termToFill = null;

function normalizeVariables(rawNames, count) {
    const names = rawNames
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
    const finalNames = [];
    for (let i = 0; i < count; i++) {
        finalNames.push(names[i] || `Variavel ${i + 1}`);
    }
    return finalNames;
}

function parsePlaceholderCount(body) {
    return (body.match(/XXX/g) || []).length;
}

function buildTermPayload() {
    const title = document.getElementById('term-title').value;
    const body = document.getElementById('term-body').value;
    const variablesInput = document.getElementById('term-variables').value || '';
    const placeholderCount = parsePlaceholderCount(body);
    const variables = placeholderCount > 0 ? normalizeVariables(variablesInput, placeholderCount) : [];
    return { title, body, variables, isDeletable: true };
}

function openAddTermModal(term) {
    isEditing = !!term;
    termToEditId = term ? term.id : null;
    if (termModalTitle) termModalTitle.textContent = term ? 'Editar Termo' : 'Adicionar Termo';
    if (addTermForm) {
        addTermForm.reset();
        document.getElementById('term-title').value = term?.title || '';
        document.getElementById('term-body').value = term?.body || '';
        document.getElementById('term-variables').value = term?.variables?.join(', ') || '';
    }
    if (addTermModal) addTermModal.classList.add('visible');
}

function closeAddTermModal() {
    if (addTermModal) addTermModal.classList.remove('visible');
}

function renderTermList(list = getTermsForView()) {
    if (!termsList) return;
    termsList.innerHTML = '';
    const sorted = [...list].sort((a, b) => a.title.localeCompare(b.title));
    sorted.forEach(term => {
        const li = document.createElement('li');
        li.className = 'term-item';

        const info = document.createElement('div');
        info.className = 'term-info';
        const title = document.createElement('strong');
        title.textContent = term.title;
        const count = document.createElement('small');
        const variablesCount = term.variables?.length || parsePlaceholderCount(term.body);
        count.textContent = `${variablesCount} variavel(is)`;
        info.appendChild(title);
        info.appendChild(count);

        const actions = document.createElement('div');
        actions.className = 'term-actions';
        const fillBtn = document.createElement('button');
        fillBtn.className = 'btn btn-small';
        fillBtn.textContent = 'Preencher';
        fillBtn.addEventListener('click', () => openFillTermModal(term));

        actions.appendChild(fillBtn);

        if (term.isDeletable !== false) {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-small btn-secondary';
            editBtn.textContent = 'Editar';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openAddTermModal(term);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-small delete';
            deleteBtn.textContent = 'Remover';
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Tem certeza que deseja excluir o termo "${term.title}"?`)) {
                    await deleteTerm(term.id);
                }
            });
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
        }

        li.appendChild(info);
        li.appendChild(actions);

        termsList.appendChild(li);
    });
}

function replacePlaceholders(body, values) {
    let output = body;
    values.forEach(value => {
        output = output.replace('XXX', value || '');
    });
    return output;
}

function openFillTermModal(term) {
    termToFill = term;
    if (!fillTermFields) return;

    const placeholderCount = parsePlaceholderCount(term.body);
    const names = term.variables && term.variables.length ? term.variables : Array.from({ length: placeholderCount }, (_, i) => `Variavel ${i + 1}`);

    fillTermFields.innerHTML = '';
    names.forEach((name, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        const label = document.createElement('label');
        label.textContent = name;
        label.setAttribute('for', `term-var-${index}`);
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `term-var-${index}`;
        input.required = true;
        wrapper.appendChild(label);
        wrapper.appendChild(input);
        fillTermFields.appendChild(wrapper);
    });

    if (fillTermModal) fillTermModal.classList.add('visible');
}

function closeFillTermModal() {
    if (fillTermModal) fillTermModal.classList.remove('visible');
}

function setupSharedTermModals() {
    if (addTermForm) {
        addTermForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = buildTermPayload();
            if (isEditing) {
                await updateTerm(termToEditId, payload);
            } else {
                await addTerm(payload);
            }
            closeAddTermModal();
        });
    }
    if (cancelTermBtn) {
        cancelTermBtn.addEventListener('click', () => closeAddTermModal());
    }
    if (fillTermForm) {
        fillTermForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!termToFill) return;
            const values = Array.from(fillTermFields.querySelectorAll('input')).map(input => input.value);
            const placeholderCount = parsePlaceholderCount(termToFill.body);
            const paddedValues = [];
            for (let i = 0; i < placeholderCount; i++) {
                paddedValues.push(values[i] || '');
            }
            const finalText = replacePlaceholders(termToFill.body, paddedValues);

            if (termOutputTitle) termOutputTitle.textContent = termToFill.title;
            if (termOutput) termOutput.value = finalText;

            closeFillTermModal();
        });
    }
    if (cancelFillTermBtn) {
        cancelFillTermBtn.addEventListener('click', () => closeFillTermModal());
    }
    if (copyTermOutputBtn && termOutput) {
        copyTermOutputBtn.addEventListener('click', () => {
            if (!termOutput.value) return;
            copyTermOutputBtn.textContent = 'Copiado!';
            navigator.clipboard.writeText(termOutput.value).finally(() => {
                setTimeout(() => { copyTermOutputBtn.textContent = 'Copiar termo gerado'; }, 1500);
            });
        });
    }
}

// =========================
// Pagina do usuario
// =========================
export function initTermsModule() {
    if (document.querySelector('.admin-dashboard') || !document.getElementById('ferramentas-section')) return;

    document.addEventListener('termsUpdated', () => renderTermList());
    renderTermList();

    if (addTermBtn) addTermBtn.addEventListener('click', () => openAddTermModal());

    if (searchTermsInput) {
        searchTermsInput.addEventListener('keyup', () => {
            const term = searchTermsInput.value.toLowerCase();
            const filtered = getTermsForView().filter(item =>
                item.title.toLowerCase().includes(term) ||
                item.body.toLowerCase().includes(term)
            );
            renderTermList(filtered);
        });
    }

    setupSharedTermModals();
}

// =========================
// Painel do admin
// =========================
function renderAdminTermsTable(list = getTermsForView()) {
    const tbody = document.getElementById('terms-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="3">Nenhum termo cadastrado.</td>`;
        tbody.appendChild(tr);
        return;
    }

    const sorted = [...list].sort((a, b) => a.title.localeCompare(b.title));
    sorted.forEach(term => {
        const tr = document.createElement('tr');
        const variablesCount = term.variables?.length || parsePlaceholderCount(term.body);
        tr.innerHTML = `
            <td>${term.title}</td>
            <td>${variablesCount}</td>
            <td class="actions-cell">
                <button class="edit-term-btn" title="Editar termo"><i class="fas fa-pencil-alt"></i></button>
                <button class="delete-term-btn delete" title="Deletar termo"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tr.querySelector('.edit-term-btn').addEventListener('click', () => openAddTermModal(term));
        tr.querySelector('.delete-term-btn').addEventListener('click', async () => {
            if (confirm(`Deseja excluir o termo "${term.title}"?`)) {
                await deleteTerm(term.id);
            }
        });
        tbody.appendChild(tr);
    });
}

export function initAdminTermsModule() {
    if (!document.querySelector('.admin-dashboard')) return;

    document.addEventListener('termsUpdated', () => renderAdminTermsTable());
    renderAdminTermsTable();

    const adminSearchInput = document.getElementById('admin-search-terms');
    if (adminSearchInput) {
        adminSearchInput.addEventListener('keyup', () => {
            const term = adminSearchInput.value.toLowerCase();
            const filtered = getTermsForView().filter(item =>
                item.title.toLowerCase().includes(term) ||
                item.body.toLowerCase().includes(term)
            );
            renderAdminTermsTable(filtered);
        });
    }

    const addTermBtnAdmin = document.getElementById('add-term-btn');
    if (addTermBtnAdmin) addTermBtnAdmin.addEventListener('click', () => openAddTermModal());

    setupSharedTermModals();
}
