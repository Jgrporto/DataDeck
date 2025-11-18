/* CÓDIGO COMPLETO PARA: js/firebaseService.js (com Listeners) */

// =======================================================
// ETAPA 1: CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE
// =======================================================

const firebaseConfig = {
  apiKey: "AIzaSyDGTlfQdFmQnKdNPODVGhOINnSxxCPHyEk",
  authDomain: "datadeckatend.firebaseapp.com",
  projectId: "datadeckatend",
  storageBucket: "datadeckatend.firebasestorage.app",
  messagingSenderId: "580889891934",
  appId: "1:580889891934:web:ba2f2de1f132f703d190cf",
  measurementId: "G-Q0NBGZVM1Z"
};

// Inicializa o Firebase com a sua configuração
firebase.initializeApp(firebaseConfig);

// Cria uma referência para o serviço do Firestore, nosso banco de dados
const db = firebase.firestore();


// =======================================================
// ETAPA 2: FUNÇÕES DO SERVIÇO
// =======================================================

// --- NOVAS FUNÇÕES DE "ESCUTA" EM TEMPO REAL ---

/**
 * Escuta por mudanças em tempo real na coleção de scripts.
 * @param {function} callback - Função a ser chamada com a nova lista de scripts.
 */
export function listenForScripts(callback) {
  db.collection('scripts').onSnapshot(snapshot => {
    const scripts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(scripts); // Envia a lista atualizada para quem estiver escutando
  });
}

/**
 * Escuta por mudanças em tempo real na coleção de ferramentas.
 * @param {function} callback - Função a ser chamada com a nova lista de ferramentas.
 */
export function listenForTools(callback) {
  db.collection('tools').onSnapshot(snapshot => {
    const tools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tools);
  });
}

/**
 * Escuta por mudanças em tempo real no documento de anotações.
 */
export function listenForNotes(callback) {
    db.collection('general').doc('notepad').onSnapshot(doc => {
        if (doc.exists) {
            callback(doc.data().content);
        } else {
            callback(""); // Retorna string vazia se não houver anotações
        }
    });
}


// --- FUNÇÕES DE ESCRITA (sem grandes alterações) ---

// Funções para os SCRIPTS
export async function saveScriptInDB(scriptData) {
  const docRef = await db.collection('scripts').add(scriptData);
  return docRef.id;
}
export async function updateScriptInDB(scriptId, scriptData) {
  await db.collection('scripts').doc(scriptId).update(scriptData);
}
export async function deleteScriptFromDB(scriptId) {
  await db.collection('scripts').doc(scriptId).delete();
}

// Funções para as FERRAMENTAS
export async function saveToolInDB(toolData) {
    const docRef = await db.collection('tools').add(toolData);
    return docRef.id;
}
export async function updateToolInDB(toolId, toolData) {
    await db.collection('tools').doc(toolId).update(toolData);
}
export async function deleteToolFromDB(toolId) {
    await db.collection('tools').doc(toolId).delete();
}

// Funções para ANOTAÇÕES
export async function saveNotesInDB(notes) {
    await db.collection('general').doc('notepad').set({ content: notes });
}
