/* CÓDIGO FINAL E COMPLETO PARA: js/state.js (Lógica Simplificada) */

import * as firebaseService from './firebaseService.js';

// --- Cache Local de Dados (será atualizado em tempo real pela nuvem) ---
let scriptsData = [];
let toolsData = [];
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

// --- Funções de Adição (Agora sempre locais) ---
export async function addScript(scriptObject) {
    addScriptLocally(scriptObject);
}
export async function addTool(toolObject) {
    addToolLocally(toolObject);
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

// --- Funções de Anotações e Sincronização ---
export async function saveAnotacoes(notes) {
    await firebaseService.saveNotesInDB(notes);
}

export async function syncLocalDataToFirebase() {
    const localScripts = getLocalData('local_scripts');
    const localTools = getLocalData('local_tools');
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

    if (itemsSynced > 0) {
        localStorage.removeItem('local_scripts');
        localStorage.removeItem('local_tools');

        // AVISA A INTERFACE QUE A LISTA LOCAL MUDOU (FICOU VAZIA)
        // Isso força o redesenho da tabela e das estatísticas.
        document.dispatchEvent(new Event('scriptsUpdated'));
        document.dispatchEvent(new Event('toolsUpdated'));
    }
    return itemsSynced;
}