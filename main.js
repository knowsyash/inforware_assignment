const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dns = require('dns');
const { addItem, getUnsyncedItems, getAllItems, markItemAsSynced } = require('./database.js');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

async function syncData() {
  dns.lookup('google.com', async (err) => {
    if (err && err.code === 'ENOTFOUND') {
      console.log('Device is offline. Skipping sync...');
      return;
    }
    
    const unsyncedItems = getUnsyncedItems();
    if (unsyncedItems.length === 0) return;

    console.log(`Online: Syncing ${unsyncedItems.length} unsynced items...`);
    let syncedAny = false;
    for (const item of unsyncedItems) {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        
        if (response.ok) {
          markItemAsSynced(item.id);
          console.log(`Item #${item.id} synced successfully.`);
          syncedAny = true;
        }
      } catch (error) {
        console.error(`Error syncing item #${item.id}:`, error.message);
      }
    }
    if (syncedAny) {
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) win.webContents.send('sync-update');
      });
    }
  });
}

app.whenReady().then(() => {
  ipcMain.handle('add-item', (event, name, quantity) => addItem(name, quantity));
  ipcMain.handle('get-items', () => getAllItems());

  createWindow();

  setInterval(syncData, 15000);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
