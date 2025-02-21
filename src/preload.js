// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Expose IPC functions to renderer
contextBridge.exposeInMainWorld('api', {
  summarizeStory: (storyId) => ipcRenderer.invoke('summarize-story', storyId)
});

// Handle links
window.addEventListener('DOMContentLoaded', async () => {
  document.querySelector("table > tbody > tr:first-child > td:first-child")?.classList.add("hnheader");

  const style = document.createElement('style');
  const cssPath = path.join(__dirname, 'styles', 'global.css');
  style.textContent = fs.readFileSync(cssPath, 'utf8');
  document.head.appendChild(style);

  const navbar = document.createElement('div');
  navbar.className = 'electron-navbar';

  const isHomePage = window.location.href === 'https://news.ycombinator.com/' ||
                    window.location.href === 'https://news.ycombinator.com';

  if (!isHomePage) {
    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.className = 'electron-back-button';
    backButton.onclick = () => window.history.back();
    navbar.appendChild(backButton);
  }

  document.body.prepend(navbar);

  const storyMatch = window.location.href.match(/item\?id=(\d+)/);
  if (storyMatch) {
    const storyId = storyMatch[1];

    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'comment-summary';
    summaryContainer.innerHTML = '<div class="summary-loading">Generating summary...</div>';

    const firstComment = document.querySelector('.comment-tree');
    if (firstComment) {
      firstComment.parentElement.insertBefore(summaryContainer, firstComment);

      try {
        console.log('trying to summarize story', storyId);
        const summary = await ipcRenderer.invoke('summarize-story', storyId);
        summaryContainer.innerHTML = `
          <h3>Comment Summary</h3>
          <p>${summary}</p>
        `;
      } catch (error) {
        summaryContainer.innerHTML = '<div class="summary-error">Failed to generate summary</div>';
        console.error('Summary generation failed:', error);
      }
    }
  }
});
