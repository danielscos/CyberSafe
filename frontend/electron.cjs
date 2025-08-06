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
    createWindow();
  } else {
    // production
    const cspPolicy = [
      "default-src 'self' data: blob:;",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline';",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
      "font-src 'self' https://fonts.gstatic.com;",
      "img-src 'self' data: blob:;",
      "connect-src 'self' http://127.0.0.1:8000 http://localhost:8000;",
    ].join(" ");

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [cspPolicy],
        },
      });
    });

    // Start backend in production
    startBackendAndCreateWindow();
  }
});

function startBackendAndCreateWindow() {
  const backendPath = path.join(
    process.resourcesPath,
    "app.asar.unpacked",
    "backend",
    "CyberSafeBackend",
  );

  console.log("=== BACKEND STARTUP DEBUG ===");
  console.log("Backend path:", backendPath);
  console.log("Backend exists:", require("fs").existsSync(backendPath));
  console.log("Process resources path:", process.resourcesPath);

  if (!require("fs").existsSync(backendPath)) {
    console.error("❌ Backend executable not found at:", backendPath);
    createWindow(); // Load anyway to show error
    return;
  }

  console.log("Starting backend process...");

  backendProcess = spawn(backendPath, [], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
    shell: false,
  });

  backendProcess.stdout.on("data", (data) => {
    console.log("Backend stdout:", data.toString());
  });

  backendProcess.stderr.on("data", (data) => {
    console.log("Backend stderr:", data.toString());
  });

  backendProcess.on("spawn", () => {
    console.log("✅ Backend process spawned successfully");
  });

  backendProcess.on("error", (err) => {
    console.error("❌ Backend spawn error:", err);
    createWindow(); // Load anyway
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(`❌ Backend exited with code ${code}, signal ${signal}`);
  });

  // Wait for backend to start before loading frontend
  setTimeout(() => {
    console.log("Loading frontend after backend startup delay...");
    createWindow();
  }, 3000);
}

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
