const { app, BrowserWindow, session } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let backendProcess;
let mainWindow;

const isDev = !app.isPackaged;

app.whenReady().then(() => {
  if (isDev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": undefined,
          "X-Content-Security-Policy": undefined,
          "X-WebKit-CSP": undefined,
        },
      });
    });
  } else {
    // production
    const cspPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "font-src 'self' data:",
    ].join("; ");

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [cspPolicy],
        },
      });
    });
  }

  if (!isDev) {
    // only spawn backend in production
    const backendPath = path.join(
      process.resourcesPath,
      "app.asar.unpacked",
      "backend",
      "CyberSafeBackend",
    );
    backendProcess = spawn(backendPath, [], { stdio: "inherit" });
  }

  createWindow();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: !isDev, // disable web security in development
      allowRunningInsecureContent: isDev,
      experimentalFeatures: false,
    },
  });

  mainWindow.setTitle("CyberSafe");

  // Disable some DevTools features that cause warnings in development
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");

    // Open DevTools but with reduced warnings
    mainWindow.webContents.once("dom-ready", () => {
      mainWindow.webContents.openDevTools({
        mode: "detach",
      });
    });

    // Handle DevTools-related console messages
    mainWindow.webContents.on("console-message", (event, level, message) => {
      // Filter out known harmless DevTools warnings
      if (
        message.includes("Autofill.enable") ||
        message.includes("Autofill.setAddresses") ||
        message.includes("HTTP/1.1 4")
      ) {
        return;
      }
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });

  contents.setWindowOpenHandler(({ url }) => {
    // Allow opening external URLs in the default browser
    if (url.startsWith("http://") || url.startsWith("https://")) {
      require("electron").shell.openExternal(url);
    }
    return { action: "deny" };
  });
});
