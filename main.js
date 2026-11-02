const { app, BrowserWindow, Menu, ipcMain, nativeTheme, nativeImage, shell } = require('electron')
const fs = require('fs')
const path = require('path')
const allowed = require('./allow')
const bridge = require('./bridge')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  return
}

const background = process.argv.includes('--background')

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
  ipcMain.on('badge', (event, count, image) => {
    if (event.sender !== win.webContents) return
    const n = Math.max(0, Number(count) || 0)
    if (process.platform === 'win32') win.setOverlayIcon(n && image ? nativeImage.createFromDataURL(String(image)) : null, n ? `${n} pending changes` : '')
    app.dock?.setBadge(n ? String(n) : '')
    if (n > badged && !win.isFocused()) win.flashFrame(true)
    badged = n
  })
  win.on('focus', () => win.flashFrame(false))
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
})

app.on('before-quit', () => (quitting = true))
app.on('window-all-closed', () => app.quit())
