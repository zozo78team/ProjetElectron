import { app, BrowserWindow, dialog, ipcMain, IpcMain, IpcMainEvent } from "electron";
import * as fs from "fs";
import * as path from "path";

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  // On fait la page 
  mainWindow = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // On récupère l'index pour le générer
  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  mainWindow.webContents.on("new-window", (event: Event, url, frameName, disposition, options, additionalFeatures) => {
    if (frameName === "modal") {
      // on ouvre la modal avec les dimensions
      Object.assign(options, {
        modal: true,
        parent: mainWindow,
        width: 300,
        titleBarStyle: "hidden",
        frame: true,
        height: 100
      });
      return new BrowserWindow(options);
    }
  })

  ipcMain.on("showFolderDialog", (event: IpcMainEvent) => {
    let fileSelectionPromise = dialog.showOpenDialog({properties: ["openFile", "openDirectory", "multiSelections"]});
    fileSelectionPromise.then(function(obj) {
        event.sender.send("selectedfolders", obj.filePaths);
        let cumfileslist = obj.filePaths.map((filePath, index)=>{
          return fs.readdirSync(filePath, {withFileTypes: true})
                   .filter(dirent=>!dirent.isDirectory())
                   .map(dirent=>filePath + "/" + dirent.name);
        }).reduce((filesacc, files) => {
            filesacc = filesacc.concat(files);
            return filesacc;
        }).every((absolutefilepath, index, array) => {
          let stats:fs.Stats = fs.statSync(absolutefilepath);
          event.sender.send("fileslist", path.basename(absolutefilepath), stats);
          return true;
        });
    });
  });

  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

// Option pour quitter la page.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
