import { getRequestsForView, approveRequest } from '../state.js';

function buildItemsSection(title, items = [], key) {
    const section = document.createElement('div');
    section.className = 'request-section';

    const heading = document.createElement('h4');
    heading.textContent = `${title} (${items.length})`;
    section.appendChild(heading);

    const list = document.createElement('ul');
    if (!items.length) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum item';
        list.appendChild(li);
    } else {
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item?.[key] || 'Sem titulo';
            list.appendChild(li);
        });
    }

    section.appendChild(list);
    return section;
}

function renderRequestsAccordion(list = getRequestsForView()) {
    const container = document.getElementById('requests-accordion');
    const badge = document.getElementById('requests-badge');
    if (!container) return;

    container.innerHTML = '';

    const pendingCount = list.filter(r => (r.status || 'pending') === 'pending').length;
    if (badge) badge.textContent = pendingCount;

    if (!list.length) {
        const empty = document.createElement('div');
        empty.className = 'request-empty';
        empty.textContent = 'Nenhuma requisicao.';
        container.appendChild(empty);
        return;
    }

    const sorted = [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    sorted.forEach(req => {
        const scriptsCount = req.scripts?.length || 0;
        const termsCount = req.terms?.length || 0;
        const toolsCount = req.tools?.length || 0;
        const statusLabel = req.status || 'pending';

        const card = document.createElement('div');
        card.className = 'request-card';

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'request-toggle';
        toggle.innerHTML = `
            <div class="request-meta">
                <span class="request-author">${req.createdBy || 'Desconhecido'}</span>
                <span class="request-date">${new Date(req.createdAt || Date.now()).toLocaleString()}</span>
            </div>
            <div class="request-counts">
                <span>${scriptsCount} scripts</span>
                <span>${termsCount} termos</span>
                <span>${toolsCount} ferramentas</span>
            </div>
            <div class="request-actions">
                <span class="status-chip ${statusLabel}">${statusLabel}</span>
                <i class="fas fa-chevron-down request-chevron"></i>
            </div>
        `;

        const body = document.createElement('div');
        body.className = 'request-body';
        body.appendChild(buildItemsSection('Scripts', req.scripts || [], 'title'));
        body.appendChild(buildItemsSection('Termos', req.terms || [], 'title'));
        body.appendChild(buildItemsSection('Ferramentas', req.tools || [], 'name'));

        const footer = document.createElement('div');
        footer.className = 'request-footer';

        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = 'btn btn-secondary btn-small';
        viewBtn.textContent = 'Ver detalhes';
        viewBtn.addEventListener('click', () => openRequestModal(req));

        const approveBtn = document.createElement('button');
        approveBtn.type = 'button';
        approveBtn.className = 'btn btn-small';
        approveBtn.textContent = 'Aprovar';
        approveBtn.disabled = statusLabel !== 'pending';
        approveBtn.addEventListener('click', async () => {
            if (req.status !== 'pending') return;
            if (confirm('Aprovar e publicar itens desta requisicao?')) {
                await approveRequest(req);
            }
        });

        footer.appendChild(viewBtn);
        footer.appendChild(approveBtn);
        body.appendChild(footer);

        toggle.addEventListener('click', () => {
            card.classList.toggle('open');
        });

        card.appendChild(toggle);
        card.appendChild(body);
        container.appendChild(card);
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
            li.textContent = item[section.key] || 'Sem titulo';
            list.appendChild(li);
        });
    });

    if (approveBtn) {
        approveBtn.disabled = req.status !== 'pending';
        approveBtn.onclick = async () => {
            if (req.status !== 'pending') return;
            if (confirm('Aprovar e publicar itens desta requisicao?')) {
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

    document.addEventListener('requestsUpdated', () => renderRequestsAccordion());
    renderRequestsAccordion();

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
            renderRequestsAccordion(filtered);
        });
    }

    const indicator = document.getElementById('requests-indicator');
    if (indicator) {
        indicator.addEventListener('click', () => {
            const pending = getRequestsForView().find(r => r.status === 'pending') || getRequestsForView()[0];
            if (pending) {
                openRequestModal(pending);
            } else {
                alert('Nenhuma requisicao para revisar.');
            }
        });
    }
}
