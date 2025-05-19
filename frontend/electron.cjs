const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

const isDev = !app.isPackaged;

function createWindow () {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (isDev) {
    // Development: load Vite dev server
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // Production: load built React app
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  let backendPath;
  if (isDev) {
    backendPath = path.join(__dirname, 'backend', 'CyberSafeBackend');
  } else {
    // Use the unpacked path in production
    backendPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'CyberSafeBackend');
  }

  backendProcess = spawn(backendPath, [], { stdio: 'inherit' });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});