import { getRequestsForView, approveRequest } from '../state.js';

function renderRequestsTable(list = getRequestsForView()) {
    const tbody = document.getElementById('requests-table-body');
    const badge = document.getElementById('requests-badge');
    if (!tbody) return;
    tbody.innerHTML = '';

    const pendingCount = list.filter(r => r.status === 'pending').length;
    if (badge) badge.textContent = pendingCount;

    if (list.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="4">Nenhuma requisição.</td>`;
        tbody.appendChild(tr);
        return;
    }

    const sorted = [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    sorted.forEach(req => {
        const scriptsCount = req.scripts?.length || 0;
        const termsCount = req.terms?.length || 0;
        const toolsCount = req.tools?.length || 0;
        const statusLabel = req.status || 'pending';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.createdBy || 'Desconhecido'}</td>
            <td>${new Date(req.createdAt || Date.now()).toLocaleString()}</td>
            <td>${scriptsCount} scripts / ${termsCount} termos / ${toolsCount} ferramentas</td>
            <td class="actions-cell">
                <span class="badge ${statusLabel}">${statusLabel}</span>
                <button class="view-request-btn" title="Ver detalhes"><i class="fas fa-eye"></i></button>
                <button class="approve-request-btn" title="Aprovar"><i class="fas fa-check"></i></button>
            </td>
        `;
        tr.querySelector('.view-request-btn').addEventListener('click', () => openRequestModal(req));
        tr.querySelector('.approve-request-btn').addEventListener('click', async () => {
            if (req.status !== 'pending') return;
            if (confirm('Aprovar e publicar itens desta requisição?')) {
                await approveRequest(req);
            }
        });
        tbody.appendChild(tr);
    });
}

function openRequestModal(req) {
    const modal = document.getElementById('request-modal');
    const info = document.getElementById('request-info');
    const list = document.getElementById('request-items-list');
    const approveBtn = document.getElementById('approve-request-btn');
    if (!modal || !info || !list) return;

    info.textContent = `${req.createdBy || 'Autor'} - ${new Date(req.createdAt || Date.now()).toLocaleString()}`;
    list.innerHTML = '';

    const sections = [
        { title: 'Scripts', items: req.scripts || [], key: 'title' },
        { title: 'Termos', items: req.terms || [], key: 'title' },
        { title: 'Ferramentas', items: req.tools || [], key: 'name' }
    ];

    sections.forEach(section => {
        const header = document.createElement('li');
        header.innerHTML = `<strong>${section.title} (${section.items.length})</strong>`;
        list.appendChild(header);
        section.items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item[section.key] || 'Sem título';
            list.appendChild(li);
        });
    });

    if (approveBtn) {
        approveBtn.disabled = req.status !== 'pending';
        approveBtn.onclick = async () => {
            if (req.status !== 'pending') return;
            if (confirm('Aprovar e publicar itens desta requisição?')) {
                await approveRequest(req);
                closeRequestModal();
            }
        };
    }

    modal.classList.add('visible');
}

export function closeRequestModal() {
    const modal = document.getElementById('request-modal');
    if (modal) modal.classList.remove('visible');
}

export function initAdminRequestsModule() {
    if (!document.querySelector('.admin-dashboard')) return;

    document.addEventListener('requestsUpdated', () => renderRequestsTable());
    renderRequestsTable();

    const closeBtn = document.getElementById('close-request-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeRequestModal);

    const searchInput = document.getElementById('admin-search-requests');
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const term = searchInput.value.toLowerCase();
            const filtered = getRequestsForView().filter(r =>
                (r.createdBy || '').toLowerCase().includes(term) ||
                (r.status || '').toLowerCase().includes(term)
            );
            renderRequestsTable(filtered);
        });
    }

    const indicator = document.getElementById('requests-indicator');
    if (indicator) {
        indicator.addEventListener('click', () => {
            const pending = getRequestsForView().find(r => r.status === 'pending') || getRequestsForView()[0];
            if (pending) {
                openRequestModal(pending);
            } else {
                alert('Nenhuma requisição para revisar.');
            }
        });
    }
}
