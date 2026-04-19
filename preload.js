const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  addItem: (name, quantity) => ipcRenderer.invoke('add-item', name, quantity),
  getItems: () => ipcRenderer.invoke('get-items'),
  onSyncUpdate: (callback) => ipcRenderer.on('sync-update', () => callback())
});
