const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('native', {
  badge: (count, image) => ipcRenderer.send('badge', count, image),
  onUpdate: (callback) => ipcRenderer.on('update', (_, state, info) => callback(state, info ?? {})),
  checkUpdate: () => ipcRenderer.send('update-check'),
  installUpdate: () => ipcRenderer.send('update-install'),
  openReleaseNotes: () => ipcRenderer.send('update-notes'),
  // The hidden Instagram page grabbed the keyboard / give the keyboard back to the editor window.
  onGuestFocus: (callback) => ipcRenderer.on('guest-focus', () => callback()),
  refocus: () => ipcRenderer.send('refocus'),
})
