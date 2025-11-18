/* CÓDIGO FINAL E COMPLETO PARA: js/dom.js */

// --- Seletores da Página de Usuário (app.html) ---
export const scriptListUl = document.getElementById('script-list-ul');
export const searchInput = document.getElementById('search-input');
export const displayArea = document.getElementById('script-display');
export const navScripts = document.getElementById('nav-scripts');
export const navAnalise = document.getElementById('nav-analise');
export const navFerramentas = document.getElementById('nav-ferramentas');
export const settingsPanel = document.getElementById('settings-panel');
export const closeSettingsBtn = document.getElementById('close-settings-btn');
export const pageSections = document.querySelectorAll('.page-section');
export const hamburgerBtn = document.getElementById('hamburger-btn');
export const menuOverlay = document.getElementById('menu-overlay');
export const anotacoesTextarea = document.getElementById('anotacoes-textarea');
export const copiarAnotacoesBtn = document.getElementById('copiar-anotacoes-btn');
export const limparAnotacoesBtn = document.getElementById('limpar-anotacoes-btn');
export const userDarkModeToggle = document.getElementById('user-dark-mode-toggle');
export const userLogoutBtn = document.getElementById('user-logout-btn');
export const profileBtn = document.getElementById('profile-btn');
export const navbarProfilePic = document.getElementById('navbar-profile-pic');
export const sidebarProfilePic = document.getElementById('sidebar-profile-pic');
export const profilePicInput = document.getElementById('profile-pic-input');
export const sidebarUsername = document.getElementById('sidebar-username');
export const addScriptPageBtn = document.getElementById('add-script-page-btn');
export const addToolBtn = document.getElementById('add-tool-btn');
export const exportBtn = document.getElementById('export-btn');
export const importBtn = document.getElementById('import-btn');
export const importFileInput = document.getElementById('import-file-input');

// --- Seletores dos Modais (Compartilhados) ---
export const addScriptModal = document.getElementById('add-script-modal');
export const addScriptForm = document.getElementById('add-script-form');
export const modalTitle = document.querySelector('#add-script-modal h2');
export const cancelBtn = document.getElementById('cancel-btn');
export const addToolModal = document.getElementById('add-tool-modal');
export const addToolForm = document.getElementById('add-tool-form');
export const cancelToolBtn = document.getElementById('cancel-tool-btn');
export const toolModalTitle = document.getElementById('tool-modal-title');
export const toolIconInput = document.getElementById('tool-icon-input');
export const toolIconPreview = document.getElementById('tool-icon-preview');

// --- Seletores do Painel de Admin (admin.html) ---
export const universalImportBtn = document.getElementById('universal-import-btn');
export const universalImportInput = document.getElementById('universal-import-input');
export const statsCloudScripts = document.getElementById('stats-cloud-scripts');
export const statsLocalScripts = document.getElementById('stats-local-scripts');
export const statsCloudTools = document.getElementById('stats-cloud-tools');
export const iframeUrlInput = document.getElementById('iframe-url-input');
export const saveIframeUrlBtn = document.getElementById('save-iframe-url-btn');
export const logoutBtn = document.getElementById('logout-btn');
export const darkModeToggle = document.getElementById('dark-mode-toggle');
export const factoryResetBtn = document.getElementById('factory-reset-btn');