const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Load global styles
window.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  const cssPath = path.join(__dirname, 'styles', 'global.css');
  style.textContent = fs.readFileSync(cssPath, 'utf8');
  document.head.appendChild(style);
});

// Expose API to renderer
contextBridge.exposeInMainWorld('settings', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  saveApiKey: (key) => ipcRenderer.invoke('save-api-key', key)
});