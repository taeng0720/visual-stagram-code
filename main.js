const { app, BrowserWindow, Menu, ipcMain, nativeTheme, nativeImage, shell, webContents } = require('electron')
const fs = require('fs')
const path = require('path')
const allowed = require('./allow')
const bridge = require('./bridge')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  return
}

const background = process.argv.includes('--background')

// Must match the installer shortcut's AppUserModelID, otherwise Windows shows a second taskbar button
// next to the pinned one and the unread badge lands on the wrong icon.
if (process.platform === 'win32') app.setAppUserModelId('com.visualstagramcode.app')

nativeTheme.themeSource = 'dark'
app.userAgentFallback = app.userAgentFallback
  .replace(/Gecko\) .*?Chrome/, 'Gecko) Chrome')
  .replace(/ Electron\/\S+/, '')

const openExternal = (url) => {
  if (/^https?:/.test(url)) shell.openExternal(url)
}

let win
let guest
let editors = 0
let quitting = false
let idle

app.on('web-contents-created', (_, wc) => {
  if (wc.getType() !== 'webview') return
  guest = wc
  // Tell the editor when the hidden Instagram page takes the keyboard, so it can hand it back to the message line.
  wc.on('focus', () => win && !win.isDestroyed() && win.webContents.send('guest-focus'))
  wc.setWindowOpenHandler(({ url }) => {
    openExternal(url)
    return { action: 'deny' }
  })
  const guard = (e) => {
    if (!e.isMainFrame || allowed(e.url)) return
    e.preventDefault()
    openExternal(e.url)
  }
  wc.on('will-navigate', guard)
  wc.on('will-redirect', guard)
  const skipSavePrompt = (_, url) => {
    if (URL.canParse(url) && new URL(url).pathname.startsWith('/accounts/onetap')) wc.loadURL('https://www.instagram.com/direct/inbox/')
  }
  wc.on('did-navigate', skipSavePrompt)
  wc.on('did-navigate-in-page', skipSavePrompt)
})

async function editorIcon() {
  if (process.platform === 'darwin') {
    const bundle = ['/Applications/Visual Studio Code.app', path.join(app.getPath('home'), 'Applications/Visual Studio Code.app')].find((p) => fs.existsSync(p))
    return bundle ? nativeImage.createThumbnailFromPath(bundle, { width: 256, height: 256 }).catch(() => null) : null
  }
  const roots = [
    path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Microsoft VS Code'),
    path.join(process.env.ProgramFiles ?? '', 'Microsoft VS Code'),
    path.join(process.env['ProgramFiles(x86)'] ?? '', 'Microsoft VS Code'),
  ]
  const icons = roots
    .filter((root) => fs.existsSync(root))
    .flatMap((root) => [root, ...fs.readdirSync(root).map((d) => path.join(root, d))])
    .map((dir) => path.join(dir, 'resources', 'app', 'resources', 'win32', 'code.ico'))
    .filter((ico) => fs.existsSync(ico))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
  const image = icons.length ? nativeImage.createFromPath(icons[0]) : null
  return image && !image.isEmpty() ? image : null
}

const reveal = () => {
  app.dock?.show()
  win.show()
  win.focus()
}
app.on('second-instance', reveal)

app.whenReady().then(() => {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
      { role: 'editMenu' },
      { label: 'View', submenu: [{ role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] },
    ]),
  )
  if (background) app.dock?.hide()
  else if (!app.isPackaged) app.dock?.setIcon(path.join(__dirname, 'build/icon.png'))

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 720,
    minHeight: 400,
    show: !background,
    backgroundColor: '#1f1f1f',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 11 },
    titleBarOverlay: process.platform !== 'darwin' && { color: '#181818', symbolColor: '#cccccc', height: 35 },
    autoHideMenuBar: true,
    webPreferences: { webviewTag: true, backgroundThrottling: false, preload: path.join(__dirname, 'preload.js') },
  })
  let badged = 0
  let overlay = null
  const applyOverlay = () => {
    if (process.platform !== 'win32' || win.isDestroyed()) return
    win.setOverlayIcon(badged && overlay ? overlay : null, badged ? `${badged} new message${badged > 1 ? 's' : ''}` : '')
  }
  ipcMain.on('refocus', (event) => {
    if (event.sender !== win.webContents) return
    // Only when this window is the active one (never pull focus away from another app).
    const owner = webContents.getFocusedWebContents()
    if (win.isFocused() || (owner && owner === guest)) win.webContents.focus()
  })
  ipcMain.on('badge', (event, count, image) => {
    if (event.sender !== win.webContents) return
    const n = Math.max(0, Math.floor(Number(count)) || 0)
    const grew = n > badged
    badged = n
    overlay = n && typeof image === 'string' && image.startsWith('data:image/') ? nativeImage.createFromDataURL(image) : null
    applyOverlay()
    if (process.platform === 'linux') app.setBadgeCount(n)
    app.dock?.setBadge(n ? String(n) : '')
    if (grew && !win.isFocused()) win.flashFrame(true)
    if (!n) win.flashFrame(false)
  })
  // The taskbar button is recreated after hide/show, which drops the overlay.
  win.on('show', () => setTimeout(applyOverlay, 50))
  win.on('restore', applyOverlay)
  win.on('focus', () => win.flashFrame(false))
  // Send diagnostics (which way each message went, never its text) -> %APPDATA%\Visual Stagram Code\send.log
  const sendLog = path.join(app.getPath('userData'), 'send.log')
  win.webContents.on('console-message', (...args) => {
    const message = typeof args[0]?.message === 'string' ? args[0].message : args[2]
    if (typeof message !== 'string' || !message.startsWith('[vsc-send]')) return
    const owner = webContents.getFocusedWebContents()
    const line = `${new Date().toISOString()} ${message} keyboard=${owner ? owner.getType() : 'none'} winFocused=${win.isFocused()}\n`
    fs.promises.appendFile(sendLog, line).catch(() => {})
  })
  win.loadFile(path.join(__dirname, 'index.html'))
  editorIcon().then((image) => {
    if (!image) return
    if (process.platform === 'darwin') app.dock?.setIcon(image)
    else win.setIcon(image)
    const logo = image.resize({ width: 32, height: 32, quality: 'best' }).toDataURL()
    const apply = () => win.webContents.executeJavaScript(`document.querySelector('.menubar img').src = ${JSON.stringify(logo)}`).catch(() => {})
    win.webContents.on('did-finish-load', apply)
    if (!win.webContents.isLoading()) apply()
  })
  win.on('close', (e) => {
    if (quitting || !editors) return
    e.preventDefault()
    win.hide()
    app.dock?.hide()
  })

  const close = bridge({
    page: () => (guest && !guest.isDestroyed() ? guest : null),
    show: reveal,
    onClients(n) {
      editors = n
      clearTimeout(idle)
      if (!n && !win.isVisible()) idle = setTimeout(() => app.quit(), 30000)
    },
  })
  app.on('will-quit', close)
  if (background) idle = setTimeout(() => app.quit(), 60000)
  setupUpdates()
})
// Auto-update from GitHub Releases: the release only needs the installer .exe (or a .zip with it) — see updater.js.
// New versions download in the background; the editor shows a VS Code-style "Restart to Update" toast,
// and if you ignore it the update installs silently the next time the app quits.
function setupUpdates() {
  if (!app.isPackaged || process.platform !== 'win32') return
  const { createUpdater } = require('./updater')
  const { updateRepo } = require('./package.json')
  if (!updateRepo) return
  const updater = createUpdater({
    repo: updateRepo,
    version: app.getVersion(),
    fetch: globalThis.fetch,
    onState: (state, info) => !win.isDestroyed() && win.webContents.send('update', state, info),
  })
  const mine = (event) => event.sender === win.webContents
  ipcMain.on('update-check', (event) => mine(event) && updater.run({ manual: true }))
  ipcMain.on('update-notes', (event) => mine(event) && updater.found?.page && openExternal(updater.found.page))
  ipcMain.on('update-install', (event) => {
    if (!mine(event) || !updater.install({ relaunch: true })) return
    quitting = true
    app.quit()
  })
  app.on('will-quit', () => updater.pending && updater.install({ relaunch: false }))
  setTimeout(() => updater.run(), 10 * 1000)
  setInterval(() => updater.run(), 2 * 60 * 60 * 1000)
}

app.on('before-quit', () => (quitting = true))
app.on('window-all-closed', () => app.quit())
