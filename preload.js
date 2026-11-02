const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('native', {
  badge: (count, image) => ipcRenderer.send('badge', count, image),
})
