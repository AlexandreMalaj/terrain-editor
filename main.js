const { app, BrowserWindow } = require("electron");

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegrationInWorker: true,
            nodeIntegration: true
        }
    });

    win.webContents.openDevTools();
    win.loadFile("./out/index.html");
}

app.whenReady().then(createWindow);

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
