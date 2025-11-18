/* CÓDIGO FINAL E COMPLETO PARA: js/modules/analysis.js */

import { getAnotacoes, saveAnotacoes } from '../state.js';
import { anotacoesTextarea, copiarAnotacoesBtn, limparAnotacoesBtn } from '../dom.js';

export function initAnalysisModule() {
    // Esta função roda em ambas as páginas, mas os elementos só existem no app.html
    // e no admin.html (se a aba for renderizada)
    const iframe = document.getElementById('analise-iframe');
    const anotacoesTextareaEl = document.getElementById('anotacoes-textarea');
    const copiarAnotacoesBtnEl = document.getElementById('copiar-anotacoes-btn');
    const limparAnotacoesBtnEl = document.getElementById('limpar-anotacoes-btn');

    // Se não encontrar os elementos principais, não faz nada.
    if (!iframe && !anotacoesTextareaEl) return;

    // Pega a URL salva pelo admin; se não existir, usa a padrão.
    const savedUrl = localStorage.getItem('dataDeckIframeUrl') || 'https://falhas.emexinternet.com.br';
    
    if (iframe) {
        iframe.src = savedUrl;
    }

    // Listener para atualizar as anotações em tempo real
    if (anotacoesTextareaEl) {
        document.addEventListener('notesUpdated', () => {
            anotacoesTextareaEl.value = getAnotacoes();
        });
        // Seta o valor inicial
        anotacoesTextareaEl.value = getAnotacoes();

        anotacoesTextareaEl.addEventListener('keyup', async () => {
            await saveAnotacoes(anotacoesTextareaEl.value);
        });
    }

    if (copiarAnotacoesBtnEl) {
        copiarAnotacoesBtnEl.addEventListener('click', () => {
            if(anotacoesTextareaEl.value) {
                navigator.clipboard.writeText(anotacoesTextareaEl.value).then(() => {
                    const originalText = copiarAnotacoesBtnEl.innerHTML;
                    copiarAnotacoesBtnEl.innerHTML = 'Copiado!';
                    setTimeout(() => { copiarAnotacoesBtnEl.innerHTML = originalText; }, 2000);
                });
            }
        });
    }
    
    if (limparAnotacoesBtnEl) {
        limparAnotacoesBtnEl.addEventListener('click', async () => {
            if (anotacoesTextareaEl.value && confirm('Tem certeza que deseja limpar todas as anotações?')) {
                anotacoesTextareaEl.value = '';
                await saveAnotacoes('');
            }
        });
    }
}