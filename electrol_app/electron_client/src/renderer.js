// admin


document.getElementById('goto-about').addEventListener('click', () => {
    window.api.navigate('about.html');
});


const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const copyHistoryBox = document.createElement('div');
    copyHistoryBox.id = 'copyHistoryBox';
    copyHistoryBox.style.display = 'none';
    copyHistoryBox.classList.add('copy-history-box');

    document.body.appendChild(copyHistoryBox);

    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const isTextSelected = window.getSelection().toString().length > 0;
        if (isTextSelected) {
            ipcRenderer.send('show-webview-context-menu', { x: event.clientX, y: event.clientY });
        }
    });
});

