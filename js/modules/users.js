/* Gestão de logins (admin) */
import { getUsersForView, addUser, updateUser, deleteUser } from '../state.js';

let isEditingUser = false;
let userToEditId = null;

function openUserModal(user) {
    isEditingUser = !!user;
    userToEditId = user ? user.id : null;
    const modal = document.getElementById('add-user-modal');
    const title = document.getElementById('user-modal-title');
    const form = document.getElementById('add-user-form');

    if (!modal || !form) return;

    if (title) title.textContent = isEditingUser ? 'Editar Login' : 'Adicionar Login';
    form.reset();

    document.getElementById('user-display-name').value = user?.displayName || '';
    document.getElementById('user-username').value = user?.username || '';
    document.getElementById('user-password').value = user?.password || '';
    document.getElementById('user-role').value = user?.role || 'user';
    document.getElementById('user-avatar').value = user?.avatar || '';

    modal.classList.add('visible');
}

function closeUserModal() {
    const modal = document.getElementById('add-user-modal');
    if (modal) modal.classList.remove('visible');
}

function renderUsersTable(list = getUsersForView()) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="4">Nenhum login cadastrado.</td>`;
        tbody.appendChild(tr);
        return;
    }

    const sorted = [...list].sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    sorted.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.displayName || '-'}</td>
            <td>${user.username}</td>
            <td>${user.role || 'user'}</td>
            <td class="actions-cell">
                <button class="edit-user-btn" title="Editar login"><i class="fas fa-pencil-alt"></i></button>
                <button class="delete-user-btn delete" title="Deletar login"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tr.querySelector('.edit-user-btn').addEventListener('click', () => openUserModal(user));
        tr.querySelector('.delete-user-btn').addEventListener('click', async () => {
            if (confirm(`Deseja excluir o login "${user.username}"?`)) {
                await deleteUser(user.id);
            }
        });
        tbody.appendChild(tr);
    });
}

export function initAdminUsersModule() {
    if (!document.querySelector('.admin-dashboard')) return;

    document.addEventListener('usersUpdated', () => renderUsersTable());
    renderUsersTable();

    const addBtn = document.getElementById('add-user-btn');
    const cancelBtn = document.getElementById('cancel-user-btn');
    const form = document.getElementById('add-user-form');
    const searchInput = document.getElementById('admin-search-users');

    if (addBtn) addBtn.addEventListener('click', () => openUserModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeUserModal());

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                displayName: document.getElementById('user-display-name').value,
                username: document.getElementById('user-username').value,
                password: document.getElementById('user-password').value,
                role: document.getElementById('user-role').value,
                avatar: document.getElementById('user-avatar').value,
                isDeletable: true
            };
            if (isEditingUser) {
                await updateUser(userToEditId, payload);
            } else {
                await addUser(payload);
            }
            closeUserModal();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const term = searchInput.value.toLowerCase();
            const filtered = getUsersForView().filter(u =>
                (u.displayName || '').toLowerCase().includes(term) ||
                (u.username || '').toLowerCase().includes(term)
            );
            renderUsersTable(filtered);
        });
    }
}
