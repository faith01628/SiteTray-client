// import fetch from 'node-fetch';

export async function fetchCopyHistory() {
    // Logic của fetchCopyHistory sử dụng fetch
}

// const userDataPath = app.getPath('userData');

// // Ví dụ về đường dẫn: C:\Users\<User>\AppData\Roaming\<Tên_ứng_dụng>
// console.log('Đường dẫn userData:', userDataPath);

import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

var menuZework = Menu.buildFromTemplate([
    {
        label: 'Copy',
        click: function (menuItem, browserWindow, event) {
            browserWindow.webContents.executeJavaScript(`
                (function() {
                    return window.getSelection().toString();
                })();
            `).then(selectedText => {
                if (selectedText) {
                    ipcMain.emit('copy-text', selectedText); // Emit an event with the selected text
                }
            });
        },
        role: 'copy'
    },
    {
        label: 'Paste',
        click: function () {
            console.log("Paste")
        },
        role: 'paste'
    },
    {
        label: 'Copy Image URL',
        click: async () => {
            const imageId = await mainWindow.webContents.executeJavaScript(`
          (function() {
            const target = document.elementFromPoint(${params.x}, ${params.y});
            return target ? target.id : null;
          })();
        `);
            if (imageId) {
                console.log('Clicked element ID:', imageId);
            } else {
                console.log('No element found under mouse pointer.');
            }
        }
    },
    {
        type: 'separator'
    },
    {
        label: 'Refresh Page',
        click: async () => {
            try {
                mainWindow.reload();
            } catch (error) {
                console.error('Error refreshing page:', error);
            }
        }
    },
    {
        label: 'History copy',
        click: async () => {
            const historyData = await fetchCopyHistory(); // Sử dụng fetchCopyHistory từ module đã import
            mainWindow.webContents.send('display-copy-history', historyData);
        }
    }
]);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 480,
        height: 790,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            webviewTag: true,
            preload: join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile(join(__dirname, 'view', 'login.html'));

    let clipboardData
    mainWindow.webContents.on('context-menu', (event, params) => {
        // console.log(params)

        if (params.selectionText) {
            clipboardData = params.selectionText;
        } else {
            clipboardData = '';
        }
        menuZework.popup(params);
    });
}

app.on("web-contents-created", (...[/* event */, webContents]) => {
    webContents.on("context-menu", (event, click) => {
        console.log(webContents.getType())
        if (webContents.getType() == "webview") {
            // set context menu in webview contextMenu({ window: contents, }); 
        }
        menuZework.popup(webContents);
    }, false);
});

app.whenReady().then(() => {
    createWindow();

    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ['default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data: *']
            }
        });
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('show-webview-context-menu', (event, { x, y }) => {
    const template = [
        { label: 'Reload', click: () => { event.sender.reload(); } },
        // Add other menu items as needed
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup(BrowserWindow.fromWebContents(event.sender), x, y);
});
