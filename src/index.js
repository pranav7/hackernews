const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
require('dotenv').config();

// Initialize remote module
require('@electron/remote/main').initialize();

const { fetchComments } = require('./services/hn');
const { summarizeComments } = require('./services/mainOpenAI');

// Add IPC handler for summarization
ipcMain.handle('summarize-story', async (event, storyId) => {
  try {
    const comments = await fetchComments(storyId);
    return await summarizeComments(comments);
  } catch (error) {
    console.error('Error summarizing story:', error);
    throw error;
  }
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required for remote module
      enableRemoteModule: true,
      webSecurity: true
    },
  });

  // Enable remote module for this window
  require('@electron/remote/main').enable(mainWindow.webContents);

  // Handle new window creation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://news.ycombinator.com')) {
      // Allow HN links to open in the same window
      return { action: 'allow' };
    } else {
      // Open external links in new window
      const newWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: false
        }
      });
      newWindow.loadURL(url);
      return { action: 'deny' };
    }
  });

  // Load Hacker News
  mainWindow.loadURL('https://news.ycombinator.com');

  // Always open DevTools
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
