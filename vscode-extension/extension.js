const vscode = require('vscode')
const net = require('net')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const camo = require('./camo')

const SCHEME = 'vstagram'

const bridgePath = () =>
  process.env.VSC_BRIDGE ||
  (process.platform === 'win32'
    ? `\\\\.\\pipe\\visual-stagram-code-${os.userInfo().username}`
    : path.join(os.homedir(), '.visual-stagram-code.sock'))

const uriFor = (name) => vscode.Uri.from({ scheme: SCHEME, path: `/direct/${name}.py` })
const config = () => vscode.workspace.getConfiguration('visualStagram')

function activate(context) {
  let socket = null
  let retry = null
  let launched = false
  let state = { away: true, ok: false, threads: [], rows: [], pending: 0, canSend: false }
  let active = null
  let switchedAt = 0
  let lastPaged = 0
  let draftText = ''
  let draftSeed = ''
  const docs = new Map()
  const tops = new WeakMap()
  const counts = new WeakMap()
  let disposed = false

  const treeChanged = new vscode.EventEmitter()
  const docChanged = new vscode.EventEmitter()
  const say = (message) => socket?.write(JSON.stringify(message) + '\n')
  const status = () => vscode.commands.executeCommand('setContext', 'visualStagram.status', !socket ? 'offline' : state.away ? 'away' : 'ok')

  function startApp() {
    launched = true
    const custom = config().get('appPath')
    if (process.platform === 'darwin') {
      spawn('open', ['-g', '-a', custom || 'Visual Stagram Code', '--args', '--background'], { stdio: 'ignore' }).on('error', () => {})
    } else {
      const local = process.env.LOCALAPPDATA || ''
      const exe = [custom, path.join(local, 'Programs', 'visual-stagram-code', 'Visual Stagram Code.exe'), path.join(local, 'Programs', 'Visual Stagram Code', 'Visual Stagram Code.exe')].find(
        (p) => p && fs.existsSync(p),
      )
      if (exe) spawn(exe, ['--background'], { detached: true, stdio: 'ignore' }).unref()
    }
  }

  function connect() {
    clearTimeout(retry)
    const s = net.connect(bridgePath())
    let buffer = ''
    s.setEncoding('utf8')
    s.on('connect', () => {
      socket = s
      status()
    })
    s.on('data', (chunk) => {
      buffer += chunk
      for (let end; (end = buffer.indexOf('\n')) !== -1; ) {
        const text = buffer.slice(0, end)
        buffer = buffer.slice(end + 1)
        try {
          const message = JSON.parse(text)
          if (message.type === 'state') update(message)
        } catch {}
      }
    })
    s.on('error', () => {})
    s.on('close', () => {
      if (disposed) return
      socket = null
      update({ ...state, away: true, threads: [] })
      if (!launched) startApp()
      retry = setTimeout(connect, 2000)
    })
  }

  function update(next) {
    state = next
    status()
    treeChanged.fire()
    refresh()
  }

  function refresh() {
    if (active == null || state.away || Date.now() - switchedAt < 1200) return
    if (!draftText) draftSeed = `${active}:${state.rows.length}`
    const lines = camo(state.rows, config().get('camouflage'), { seed: draftSeed, text: draftText })
    const at = lines.findIndex((l) => l.kind === 'draft')
    if (state.pending) lines.splice(at, 0, { kind: 'note', indent: lines[at].indent, text: `${state.pending} attachment(s) ready, Enter sends` })
    const text = lines.map(camo.text).join('\n') + '\n'
    const uri = uriFor(active)
    if (docs.get(uri.toString())?.text === text) return
    docs.set(uri.toString(), { text, lines })
    docChanged.fire(uri)
  }

  const isUnread = (index) => state.unread?.[index] === true && state.threads[index] !== active
  const threadView = vscode.window.createTreeView('visualStagram.threads', {
    treeDataProvider: {
      onDidChangeTreeData: treeChanged.event,
      getChildren: () => state.threads.map((name, index) => ({ name, index })),
      getTreeItem({ name, index }) {
        const item = new vscode.TreeItem(name + '.py')
        item.resourceUri = uriFor(name)
        item.iconPath = vscode.ThemeIcon.File
        item.tooltip = name
        if (isUnread(index)) item.description = 'M'
        item.command = { command: 'visualStagram.open', title: 'Open', arguments: [index, name] }
        return item
      },
    },
  })
  // Unread count shows on the view and on the Explorer icon in the activity bar.
  treeChanged.event(() => {
    const n = state.threads.filter((_, i) => isUnread(i)).length
    threadView.badge = n ? { value: n, tooltip: `${n} pending change${n > 1 ? 's' : ''}` } : undefined
  })

  context.subscriptions.push(
    threadView,
    vscode.workspace.registerTextDocumentContentProvider(SCHEME, {
      onDidChange: docChanged.event,
      provideTextDocumentContent: (uri) => docs.get(uri.toString())?.text ?? '',
    }),
  )

  const bar = (color) =>
    vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      borderStyle: 'solid',
      borderWidth: '0 0 0 3px',
      borderColor: new vscode.ThemeColor(color),
      overviewRulerColor: new vscode.ThemeColor(color),
      overviewRulerLane: vscode.OverviewRulerLane.Left,
    })
  const bars = { recv: bar('editorGutter.modifiedBackground'), send: bar('editorGutter.addedBackground') }

  function decorate(editor) {
    const doc = docs.get(editor.document.uri.toString())
    if (!doc) return
    for (const kind of ['recv', 'send']) {
      const marked = (l) => l.kind === kind || (kind === 'send' && l.kind === 'draft')
      editor.setDecorations(bars[kind], doc.lines.flatMap((l, i) => (marked(l) ? [new vscode.Range(i, 0, i, 0)] : [])))
    }
  }
  const editorsOf = (document) => vscode.window.visibleTextEditors.filter((e) => e.document === document)
  const bottom = (editor) => editor.revealRange(new vscode.Range(editor.document.lineCount, 0, editor.document.lineCount, 0))

  context.subscriptions.push(
    bars.recv,
    bars.send,
    vscode.window.onDidChangeVisibleTextEditors((editors) => editors.forEach(decorate)),
    vscode.workspace.onDidChangeTextDocument(({ document }) => {
      if (document.uri.scheme !== SCHEME) return
      for (const editor of editorsOf(document)) {
        decorate(editor)
        const shown = editor.visibleRanges.at(-1)?.end.line ?? 0
        if (shown >= (counts.get(editor) ?? 0) - 3) bottom(editor)
        counts.set(editor, document.lineCount)
      }
    }),
    vscode.window.onDidChangeTextEditorVisibleRanges(({ textEditor, visibleRanges }) => {
      if (textEditor.document.uri.scheme !== SCHEME || !visibleRanges.length) return
      const top = visibleRanges[0].start.line
      const before = tops.get(textEditor)
      tops.set(textEditor, top)
      if (top === 0 && before > 0 && Date.now() - lastPaged > 1500) {
        lastPaged = Date.now()
        say({ type: 'page', dir: -1 })
      }
    }),
    vscode.languages.registerHoverProvider(
      { scheme: SCHEME },
      {
        provideHover(document, position) {
          const src = docs.get(document.uri.toString())?.lines[position.line]?.src
          if (src) return new vscode.Hover(new vscode.MarkdownString(`![](${src}|width=320)`))
        },
      },
    ),
    vscode.workspace.onDidChangeConfiguration((e) => e.affectsConfiguration('visualStagram.camouflage') && refresh()),
  )

  const command = (id, run) => context.subscriptions.push(vscode.commands.registerCommand(id, run))

  command('visualStagram.open', async (index, name) => {
    active = name
    switchedAt = Date.now()
    say({ type: 'open', index })
    const editor = await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(uriFor(name)), { preview: false })
    decorate(editor)
    bottom(editor)
    setTimeout(refresh, 1300)
  })
  command('visualStagram.send', () => {
    const box = vscode.window.createInputBox()
    box.placeholder = 'input()'
    if (state.pending) box.prompt = `${state.pending} attachment(s) ready`
    box.onDidChangeValue((value) => {
      draftText = value
      refresh()
    })
    box.onDidAccept(() => {
      say({ type: 'send', text: box.value })
      box.hide()
    })
    box.onDidHide(() => {
      draftText = ''
      refresh()
      box.dispose()
    })
    box.show()
  })
  command('visualStagram.attach', async () => {
    const picked = await vscode.window.showOpenDialog({ canSelectMany: true })
    if (!picked?.length) return
    const TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', heic: 'image/heic', mp4: 'video/mp4', mov: 'video/quicktime' }
    const files = await Promise.all(
      picked.map(async (uri) => ({
        name: path.basename(uri.fsPath),
        type: TYPES[path.extname(uri.fsPath).slice(1).toLowerCase()] ?? 'application/octet-stream',
        data: Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('base64'),
      })),
    )
    say({ type: 'attach', files })
  })
  command('visualStagram.older', () => say({ type: 'page', dir: -1 }))
  command('visualStagram.showApp', () => say({ type: 'show' }))
  command('visualStagram.retry', () => {
    launched = false
    connect()
  })
  command('visualStagram.camouflage', async () => {
    const pick = await vscode.window.showQuickPick(camo.LEVELS.map(String), { placeHolder: `Spaces: ${config().get('camouflage')}` })
    if (pick) config().update('camouflage', Number(pick), vscode.ConfigurationTarget.Global)
  })

  context.subscriptions.push({
    dispose() {
      disposed = true
      clearTimeout(retry)
      socket?.destroy()
    },
  })
  status()
  connect()
}

module.exports = { activate, deactivate() {} }
