/* CÓDIGO FINAL PARA: js/main.js (Página do Usuário) */

import { checkAuth } from './auth.js';
import { setupListeners } from './state.js';
import { initScriptsModule } from './modules/scripts.js';
import { initTermsModule } from './modules/terms.js';
import { initSettingsModule } from './modules/settings.js';
import { initAnalysisModule } from './modules/analysis.js';
import { initUserInterface } from './ui.js';

checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    console.log('Painel de Usuário (Real-Time) carregado!');
    
    // 1. Inicializa a interface e a navegação primeiro
    initUserInterface(); 
    
    // 2. Inicializa os módulos de cada seção
    initScriptsModule();
    initTermsModule();
    initSettingsModule();
    initAnalysisModule();

    // 3. Inicia a escuta por dados em tempo real do Firebase
    setupListeners();
    
    console.log('Painel de Usuário inicializado e escutando por mudanças.');
});
