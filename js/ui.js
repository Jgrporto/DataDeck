/* CÓDIGO FINAL PARA: js/ui.js */

import { navScripts, navAnalise, navTermos, pageSections } from './dom.js';

function showUserPage(pageId) {
    if (!pageSections) return;
    
    pageSections.forEach(section => {
        if (section) section.style.display = 'none';
    });
    const activePage = document.getElementById(pageId);
    if (activePage) activePage.style.display = 'block';
    
    const navLinks = [navScripts, navAnalise, navTermos];
    navLinks.forEach(link => {
        if (link) link.classList.remove('active-link');
    });
    
    switch (pageId) {
        case 'script-library':
            if (navScripts) navScripts.classList.add('active-link');
            break;
        case 'analise-section':
            if (navAnalise) navAnalise.classList.add('active-link');
            break;
        case 'termos-section':
            if (navTermos) navTermos.classList.add('active-link');
            break;
    }
}

export function initUserInterface() {
    if (document.querySelector('.admin-dashboard')) return;

    if (navScripts) navScripts.addEventListener('click', (e) => { e.preventDefault(); showUserPage('script-library'); });
    if (navAnalise) navAnalise.addEventListener('click', (e) => { e.preventDefault(); showUserPage('analise-section'); });
    if (navTermos) navTermos.addEventListener('click', (e) => { e.preventDefault(); showUserPage('termos-section'); });

    showUserPage('script-library');
}

export function initAdminInterface() {
    if (!document.querySelector('.admin-dashboard')) return;
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const tabId = button.dataset.tab;
            const contentToShow = document.getElementById(`tab-${tabId}`);
            if (contentToShow) contentToShow.classList.add('active');
        });
    });
}
