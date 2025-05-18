const { app, BrowserWindow } = require('electron');
const path = require('path');

const frontendUrl = 'http://localhost:5173';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    // Function to load the URL, with retries
    const loadUrlWithRetries = (url, retries = 5, delay = 2000) => {
        mainWindow.loadURL(url)
            .then(() => {
                console.log(`Successfully loaded URL: ${url}`);
                // Open the DevTools.
                mainWindow.webContents.openDevTools();
            })
            .catch((err) => {
                console.error(`Failed to load URL: ${url}, error: ${err}. Retries left: ${retries -1}`);
                if (retries > 0) {
                    setTimeout(() => {
                        loadUrlWithRetries(url, retries - 1, delay);
                    }, delay);
                } else {
                    console.error(`Failed to load URL ${url} after multiple retries.`);
                    // Optionally, load a local error page or show a dialog
                    // mainWindow.loadFile('path/to/error.html');
                }
            });
    };

    loadUrlWithRetries(frontendUrl);

    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // mainWindow = null; // This line would cause an error if mainWindow is const
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});