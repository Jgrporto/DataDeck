/* CÓDIGO FINAL E COMPLETO PARA: js/state.js (Lógica Simplificada) */

import * as firebaseService from './firebaseService.js';

// --- Cache Local de Dados (será atualizado em tempo real pela nuvem) ---
let scriptsData = [];
let toolsData = [];
let termsData = [];
let usersData = [];
let requestsData = [];
let anotacoesData = '';

// --- Funções Auxiliares para o localStorage ---
function getLocalData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}
function saveLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- Getters: Funções para a UI ler os dados (nuvem + local) ---
export const getScriptsForView = () => [...scriptsData, ...getLocalData('local_scripts')];
export const getToolsForView = () => [...toolsData, ...getLocalData('local_tools')];
export const getTermsForView = () => [...termsData, ...getLocalData('local_terms')];
export const getUsersForView = () => [...usersData, ...getLocalData('local_users')];
export const getRequestsForView = () => [...requestsData];
export const getAnotacoes = () => anotacoesData;

// --- Função de Setup dos Listeners ---
export function setupListeners() {
    firebaseService.listenForScripts(newScripts => {
        scriptsData = newScripts;
        document.dispatchEvent(new Event('scriptsUpdated'));
    });
    firebaseService.listenForTools(newTools => {
        toolsData = newTools;
        document.dispatchEvent(new Event('toolsUpdated'));
    });
    firebaseService.listenForTerms(newTerms => {
        termsData = newTerms;
        document.dispatchEvent(new Event('termsUpdated'));
    });
    firebaseService.listenForUsers(newUsers => {
        usersData = newUsers;
        document.dispatchEvent(new Event('usersUpdated'));
    });
    firebaseService.listenForRequests(newRequests => {
        requestsData = newRequests;
        document.dispatchEvent(new Event('requestsUpdated'));
    });
    firebaseService.listenForNotes(newNotes => {
        anotacoesData = newNotes;
        document.dispatchEvent(new Event('notesUpdated'));
    });
}

// --- FUNÇÕES DE AÇÃO ---

// --- Funções Locais Dedicadas ---
function addScriptLocally(scriptObject) {
    const localScripts = getLocalData('local_scripts');
    const newLocalScript = { ...scriptObject, id: `local_${Date.now()}` };
    localScripts.push(newLocalScript);
    saveLocalData('local_scripts', localScripts);
    document.dispatchEvent(new Event('scriptsUpdated'));
}
function addToolLocally(toolObject) {
    const localTools = getLocalData('local_tools');
    const newLocalTool = { ...toolObject, id: `local_${Date.now()}` };
    localTools.push(newLocalTool);
    saveLocalData('local_tools', localTools);
    document.dispatchEvent(new Event('toolsUpdated'));
}
function addTermLocally(termObject) {
    const localTerms = getLocalData('local_terms');
    const newLocalTerm = { ...termObject, id: `local_${Date.now()}` };
    localTerms.push(newLocalTerm);
    saveLocalData('local_terms', localTerms);
    document.dispatchEvent(new Event('termsUpdated'));
}
function addUserLocally(userObject) {
    const localUsers = getLocalData('local_users');
    const newLocalUser = { ...userObject, id: `local_${Date.now()}` };
    localUsers.push(newLocalUser);
    saveLocalData('local_users', localUsers);
    document.dispatchEvent(new Event('usersUpdated'));
}
export function getLocalDrafts() {
    return {
        scripts: getLocalData('local_scripts'),
        terms: getLocalData('local_terms'),
        tools: getLocalData('local_tools'),
        users: getLocalData('local_users')
    };
}

// --- Funções de Adição (Agora sempre locais) ---
export async function addScript(scriptObject) {
    addScriptLocally(scriptObject);
}
export async function addTool(toolObject) {
    addToolLocally(toolObject);
}
export async function addTerm(termObject) {
    addTermLocally(termObject);
}
export async function addUser(userObject) {
    addUserLocally(userObject);
}

export async function sendPublishRequest(requestPayload) {
    const prepared = {
        ...requestPayload,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    await firebaseService.saveRequestInDB(prepared);
}

// --- Função de Importação (Sempre local) ---
export function importScriptsLocally(scriptsToImport) {
    const localScripts = getLocalData('local_scripts');
    const timestamp = Date.now();
    scriptsToImport.forEach((script, index) => {
        const newLocalScript = {
            title: script.title || 'Sem título',
            description: script.description || '',
            code: script.code || '',
            isFavorite: script.isFavorite || false,
            isDeletable: true,
            id: `local_${timestamp}_${index}`
        };
        localScripts.push(newLocalScript);
    });
    saveLocalData('local_scripts', localScripts);
    document.dispatchEvent(new Event('scriptsUpdated'));
}

// ADICIONE ESTA FUNÇÃO em state.js
export function importToolsLocally(toolsToImport) {
    const localTools = getLocalData('local_tools');
    const timestamp = Date.now();
    toolsToImport.forEach((tool, index) => {
        const newLocalTool = {
            name: tool.name || 'Sem nome',
            description: tool.description || '',
            url: tool.url || '#',
            category: tool.category || 'geral',
            icon: tool.icon || '',
            isDeletable: true,
            id: `local_${timestamp}_${index}`
        };
        localTools.push(newLocalTool);
    });
    saveLocalData('local_tools', localTools);
    document.dispatchEvent(new Event('toolsUpdated'));
}
export function importTermsLocally(termsToImport) {
    const localTerms = getLocalData('local_terms');
    const timestamp = Date.now();
    termsToImport.forEach((term, index) => {
        const newLocalTerm = {
            title: term.title || 'Sem titulo',
            body: term.body || '',
            variables: Array.isArray(term.variables) ? term.variables : [],
            isDeletable: true,
            id: `local_${timestamp}_${index}`
        };
        localTerms.push(newLocalTerm);
    });
    saveLocalData('local_terms', localTerms);
    document.dispatchEvent(new Event('termsUpdated'));
}
export function importUsersLocally(usersToImport) {
    const localUsers = getLocalData('local_users');
    const timestamp = Date.now();
    usersToImport.forEach((user, index) => {
        const newLocalUser = {
            displayName: user.displayName || 'Usuário',
            username: user.username || `user${timestamp}_${index}`,
            password: user.password || '',
            role: user.role || 'user',
            isDeletable: true,
            id: `local_${timestamp}_${index}`
        };
        localUsers.push(newLocalUser);
    });
    saveLocalData('local_users', localUsers);
    document.dispatchEvent(new Event('usersUpdated'));
}

// --- Funções de Update (Inteligentes) ---
export async function updateScript(scriptId, scriptObject) {
    if (String(scriptId).startsWith('local_')) {
        const localScripts = getLocalData('local_scripts');
        const index = localScripts.findIndex(s => s.id === scriptId);
        if (index !== -1) {
            localScripts[index] = { ...localScripts[index], ...scriptObject };
            saveLocalData('local_scripts', localScripts);
            document.dispatchEvent(new Event('scriptsUpdated'));
        }
    } else {
        await firebaseService.updateScriptInDB(scriptId, scriptObject);
    }
}

export async function updateTool(toolId, toolObject) {
    if (String(toolId).startsWith('local_')) {
        const localTools = getLocalData('local_tools');
        const index = localTools.findIndex(t => t.id === toolId);
        if (index !== -1) {
            localTools[index] = { ...localTools[index], ...toolObject };
            saveLocalData('local_tools', localTools);
            document.dispatchEvent(new Event('toolsUpdated'));
        }
    } else {
        await firebaseService.updateToolInDB(toolId, toolObject);
    }
}
export async function updateTerm(termId, termObject) {
    if (String(termId).startsWith('local_')) {
        const localTerms = getLocalData('local_terms');
        const index = localTerms.findIndex(t => t.id === termId);
        if (index !== -1) {
            localTerms[index] = { ...localTerms[index], ...termObject };
            saveLocalData('local_terms', localTerms);
            document.dispatchEvent(new Event('termsUpdated'));
        }
    } else {
        await firebaseService.updateTermInDB(termId, termObject);
    }
}
export async function updateUser(userId, userObject) {
    if (String(userId).startsWith('local_')) {
        const localUsers = getLocalData('local_users');
        const index = localUsers.findIndex(u => u.id === userId);
        if (index !== -1) {
            localUsers[index] = { ...localUsers[index], ...userObject };
            saveLocalData('local_users', localUsers);
            document.dispatchEvent(new Event('usersUpdated'));
        }
    } else {
        await firebaseService.updateUserInDB(userId, userObject);
    }
}

// --- Funções de Deleção (Inteligentes) ---
export async function deleteScript(scriptId) {
    if (String(scriptId).startsWith('local_')) {
        let localScripts = getLocalData('local_scripts');
        localScripts = localScripts.filter(s => s.id !== scriptId);
        saveLocalData('local_scripts', localScripts);
        document.dispatchEvent(new Event('scriptsUpdated'));
    } else {
        await firebaseService.deleteScriptFromDB(scriptId);
    }
}

export async function deleteTool(toolId) {
    if (String(toolId).startsWith('local_')) {
        let localTools = getLocalData('local_tools');
        localTools = localTools.filter(t => t.id !== toolId);
        saveLocalData('local_tools', localTools);
        document.dispatchEvent(new Event('toolsUpdated'));
    } else {
        await firebaseService.deleteToolFromDB(toolId);
    }
}
export async function deleteTerm(termId) {
    if (String(termId).startsWith('local_')) {
        let localTerms = getLocalData('local_terms');
        localTerms = localTerms.filter(t => t.id !== termId);
        saveLocalData('local_terms', localTerms);
        document.dispatchEvent(new Event('termsUpdated'));
    } else {
        await firebaseService.deleteTermFromDB(termId);
    }
}
export async function deleteUser(userId) {
    if (String(userId).startsWith('local_')) {
        let localUsers = getLocalData('local_users');
        localUsers = localUsers.filter(u => u.id !== userId);
        saveLocalData('local_users', localUsers);
        document.dispatchEvent(new Event('usersUpdated'));
    } else {
        await firebaseService.deleteUserFromDB(userId);
    }
}

// Aprova e publica dados de uma requisicao
export async function approveRequest(request) {
    const { scripts = [], terms = [], tools = [], users = [] } = request;

    for (const script of scripts) {
        const { id, ...data } = script;
        await firebaseService.saveScriptInDB(data);
    }
    for (const term of terms) {
        const { id, ...data } = term;
        await firebaseService.saveTermInDB(data);
    }
    for (const tool of tools) {
        const { id, ...data } = tool;
        await firebaseService.saveToolInDB(data);
    }
    for (const user of users) {
        const { id, ...data } = user;
        await firebaseService.saveUserInDB(data);
    }

    await firebaseService.updateRequestInDB(request.id, { status: 'approved', processedAt: new Date().toISOString() });
}

// --- Funções de Anotações e Sincronização ---
export async function saveAnotacoes(notes) {
    await firebaseService.saveNotesInDB(notes);
}

export async function syncLocalDataToFirebase() {
    const localScripts = getLocalData('local_scripts');
    const localTools = getLocalData('local_tools');
    const localTerms = getLocalData('local_terms');
    const localUsers = getLocalData('local_users');
    let itemsSynced = 0;

    // Envia todos os scripts locais para o Firebase
    for (const script of localScripts) {
        const { id, ...scriptData } = script;
        await firebaseService.saveScriptInDB(scriptData);
        itemsSynced++;
    }
    // Envia todas as ferramentas locais para o Firebase
    for (const tool of localTools) {
        const { id, ...toolData } = tool;
        await firebaseService.saveToolInDB(toolData);
        itemsSynced++;
    }
    for (const term of localTerms) {
        const { id, ...termData } = term;
        await firebaseService.saveTermInDB(termData);
        itemsSynced++;
    }
    for (const user of localUsers) {
        const { id, ...userData } = user;
        await firebaseService.saveUserInDB(userData);
        itemsSynced++;
    }

    if (itemsSynced > 0) {
        localStorage.removeItem('local_scripts');
        localStorage.removeItem('local_tools');
        localStorage.removeItem('local_terms');
        localStorage.removeItem('local_users');

        // AVISA A INTERFACE QUE A LISTA LOCAL MUDOU (FICOU VAZIA)
        // Isso força o redesenho da tabela e das estatísticas.
        document.dispatchEvent(new Event('scriptsUpdated'));
        document.dispatchEvent(new Event('toolsUpdated'));
        document.dispatchEvent(new Event('termsUpdated'));
        document.dispatchEvent(new Event('usersUpdated'));
    }
    return itemsSynced;
}
