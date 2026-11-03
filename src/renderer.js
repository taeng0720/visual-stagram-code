const view = document.querySelector('webview')
const sidebar = document.querySelector('.sidebar')
const editor = document.querySelector('.editor')
const code = document.querySelector('.code')
const draft = document.getElementById('draft')
const tree = document.getElementById('tree')
const rootHeader = document.getElementById('root')
const menu = document.getElementById('menu')
const quick = document.getElementById('quick')
const quickInput = document.getElementById('quick-input')
const quickList = document.getElementById('quick-list')

document.body.classList.toggle('win', navigator.userAgentData.platform !== 'macOS')

const EMPTY = { ok: false, threads: [], previews: [], unread: [], rows: [], pending: 0, canSend: false }
const returning = localStorage.getItem('workspace') !== null
let ws = workspace.parse(localStorage.getItem('workspace'))
let snap = EMPTY
let path = null
let opened = null
let showing = { thread: null, file: null }
let shown = null
let current = null
let switching = null
let decoy = null
let selected = null
let pinned = false
let away = true
let readme = ''
let last = ''
let version = 0
let level = Number(localStorage.getItem('camouflage') ?? 2)
let draftSeed = ''
let editing = false
let openedAt = 0
let paging = null
let dm = null
let people = null
let peopleLoad = null

// Only trust Instagram's unread marks once we've seen one.
let trustFlags = localStorage.getItem('unreadFlags') === '1'
const unreadFlags = () => {
  if (!Array.isArray(snap.unread) || snap.unread.length !== snap.threads.length) return null
  if (!trustFlags && snap.unread.some(Boolean)) {
    trustFlags = true
    localStorage.setItem('unreadFlags', '1')
  }
  return trustFlags ? snap.unread : null
}
const freshThreads = () => workspace.unread(ws, snap.threads, snap.previews, unreadFlags())

const save = () => {
  localStorage.setItem('workspace', JSON.stringify(ws))
  version++
}

const span = (className, textContent) => Object.assign(document.createElement('span'), { className, textContent })
const line = (...tokens) => {
  const el = document.createElement('div')
  el.className = 'line'
  el.append(...tokens)
  return el
}

const highlight = (text, lang) => langs.tokens(text, lang).map(([kind, part]) => (kind ? span(kind, part) : part))

const picture = (src, [open, close], lang) => {
  const el = span('media', '')
  const img = Object.assign(new Image(), { loading: 'lazy', src })
  el.append(...highlight(open, lang), span('str', camo.quote(camo.file(src))), ...highlight(close, lang), img)
  return el
}
const codeLine = (l, lang) => {
  const el = codeLineOf(l, lang)
  if (l.who) el.dataset.who = l.who
  return el
}
const codeLineOf = (l, lang) => {
  if (l.kind === 'code') return line(...highlight(l.text, lang))
  if (l.kind === 'note') return line(l.indent, span('com', `${l.mark} ${l.text}`))
  const args = [l.text != null && span('str', camo.quote(l.text)), l.src && picture(l.src, l.open, lang)].filter(Boolean)
  const el = line(
    l.indent,
    ...highlight(l.pre, lang),
    ...args.flatMap((arg, i) => (i ? [', ', arg] : [arg])),
    ...highlight(l.post, lang),
    ...(l.media && !l.src ? [span('com', `  ${l.mark} media`)] : []),
  )
  el.classList.add(l.kind)
  return el
}

const markdown = (text) =>
  text
    .trimEnd()
    .split('\n')
    .map((l) => (/^#+ /.test(l) ? line(span('h', l)) : line(...l.split(/(`[^`]*`)/).map((part) => (part.startsWith('`') ? span('str', part) : part)))))

const icon = (name, color) => {
  const el = span('codicon codicon-' + name, '')
  if (color) el.style.color = color
  return el
}
const fileIcon = (p) => {
  const { char, color } = seti.icon(workspace.base(p), langs.vscode(p))
  const el = span('seti', char)
  el.style.color = color
  return el
}
const chatLang = (p) => {
  const type = langs.of(p)
  return type.code ? type.id : 'python'
}

const fallbackDecoy = () =>
  (decoy && ws.files.includes(decoy) && decoy) ||
  ws.files.find((f) => langs.of(f).code && !/(^|\/)(__init__\.py|mod\.rs)$/.test(f)) ||
  ws.readme
opened = { kind: 'file', path: returning ? fallbackDecoy() : ws.readme }

const quotes = () => document.querySelector('.line.input').classList.toggle('empty', !draft.value)
draft.addEventListener('input', () => {
  // Keep the draft on one line.
  if (/[\r\n]/.test(draft.value)) {
    const at = draft.selectionStart
    draft.value = draft.value.replace(/\r?\n/g, ' ')
    draft.setSelectionRange(at, at)
  }
  quotes()
})

const syncIcon = document.getElementById('sync-icon')
const setBusy = (progress, hide) => {
  editor.classList.toggle('busy', progress)
  editor.classList.toggle('loading', hide)
  syncIcon.classList.toggle('codicon-modifier-spin', progress)
}

const binaryNote = () => {
  const el = document.createElement('div')
  el.className = 'binary'
  el.append('The file is not displayed in the text editor because it is either binary or uses an unsupported text encoding. ', Object.assign(document.createElement('a'), { textContent: 'Open Anyway' }))
  return el
}

let editorKey = ''
let editingFile = null
let saveTimer = null
const linesBox = document.getElementById('lines')
function saveEdits() {
  clearTimeout(saveTimer)
  if (!editingFile) return
  const lines = linesBox.innerText.replace(/\n$/, '').split('\n')
  const before = workspace.content(ws, editingFile)
  if (JSON.stringify(lines) === JSON.stringify(before)) return
  workspace.edit(ws, editingFile, lines)
  editorKey = JSON.stringify([editingFile, lines, readme.length, langs.of(editingFile).id])
  localStorage.setItem('workspace', JSON.stringify(ws))
}
addEventListener('beforeunload', saveEdits)
linesBox.addEventListener('input', () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveEdits, 600)
})
linesBox.addEventListener('blur', () => {
  if (!editingFile) return
  saveEdits()
  editorKey = ''
  last = ''
  render()
})
linesBox.addEventListener('keydown', (e) => {
  if (!editingFile) return
  if (e.key === 'Tab') {
    e.preventDefault()
    document.execCommand('insertText', false, '    ')
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    saveEdits()
  }
})
linesBox.addEventListener('paste', (e) => {
  if (!editingFile) return
  e.preventDefault()
  document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
})

let tabs = JSON.parse(localStorage.getItem('tabs') ?? '[]')
let mru = [...tabs]
const closedTabs = []
const backStack = []
let forwardStack = []
let lastOpenedKey = null
let travelling = false
const keyOf = (o) => (o.kind === 'thread' ? 'thread:' + o.name : o.kind === 'page' ? 'page:' + o.id : o.kind === 'alarm' ? 'alarm:' : 'file:' + o.path)
const fromKey = (k) => {
  const at = k.indexOf(':')
  const kind = k.slice(0, at)
  const value = k.slice(at + 1)
  return kind === 'thread' ? { kind, name: value } : kind === 'page' ? { kind, id: value } : kind === 'alarm' ? { kind } : { kind: 'file', path: value }
}

function trackOpened() {
  const k = keyOf(opened)
  if (k === lastOpenedKey) return
  if (lastOpenedKey && !travelling) {
    backStack.push(lastOpenedKey)
    if (backStack.length > 50) backStack.shift()
    forwardStack = []
  }
  travelling = false
  lastOpenedKey = k
  if (k === 'page:watermark') return
  if (!tabs.includes(k)) tabs.push(k)
  mru = [k, ...mru.filter((x) => x !== k)]
}

function tabInfo(k) {
  const o = fromKey(k)
  if (o.kind === 'thread') {
    const p = ws.threads[o.name]
    return p ? { label: workspace.base(p), icon: fileIcon(p), title: p } : null
  }
  if (o.kind === 'file') return ws.files.includes(o.path) ? { label: workspace.base(o.path), icon: fileIcon(o.path), title: o.path } : null
  if (o.kind === 'alarm') return ws.alarm ? { label: workspace.base(ws.alarm), icon: fileIcon(ws.alarm), title: ws.alarm } : null
  if (o.id === 'watermark') return null
  const meta = views.pageMeta(o.id)
  return { label: meta.title, icon: icon(meta.icon), title: meta.title }
}

const tabStrip = document.getElementById('tab-strip')
let tabsKey = ''
function drawTabs() {
  tabs = tabs.filter((k) => tabInfo(k))
  const active = keyOf(opened)
  const fresh = freshThreads()
  const dirty = (k) => (k.startsWith('thread:') && fresh.has(k.slice(7))) || (k === 'alarm:' && alarmNew() > 0)
  const key = JSON.stringify([active, tabs.map((k) => [k, tabInfo(k).title, dirty(k)])])
  if (key === tabsKey) return
  if (pressing && tabStrip.matches(':hover')) return setTimeout(drawTabs, 150)
  tabsKey = key
  tabStrip.replaceChildren(
    ...tabs.map((k) => {
      const info = tabInfo(k)
      const close = icon('close')
      close.classList.add('tab-close')
      const el = document.createElement('div')
      el.className = 'tab' + (k === active ? ' active' : '') + (dirty(k) ? ' dirty' : '')
      el.title = dirty(k) ? `${info.title} • new messages` : info.title
      el.append(info.icon, span('tab-label', info.label), span('tab-dot', '●'), close)
      el.addEventListener('mousedown', (e) => {
        if (e.button !== 1) return
        e.preventDefault()
        closeTab(k)
      })
      el.addEventListener('click', (e) => (e.target === close ? closeTab(k) : openKey(k)))
      return el
    }),
  )
  tabStrip.querySelector('.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  localStorage.setItem('tabs', JSON.stringify(tabs))
}

function openKey(k) {
  const o = fromKey(k)
  if (o.kind === 'thread') return openThread(o.name)
  if (o.kind === 'page') return views.openPage(o.id)
  if (o.kind === 'alarm') return openAlarm()
  if (ws.files.includes(o.path)) {
    reveal(workspace.dir(o.path))
    openFile(o.path)
  }
}

function closeTab(k = keyOf(opened)) {
  const at = tabs.indexOf(k)
  if (at < 0) return
  tabs.splice(at, 1)
  mru = mru.filter((x) => x !== k)
  closedTabs.push(k)
  if (k === keyOf(opened)) {
    const next = mru.find((x) => tabs.includes(x))
    if (next) openKey(next)
    if (keyOf(opened) === k) {
      opened = { kind: 'page', id: 'watermark' }
      render()
    }
  }
  drawTabs()
}

const reopenTab = () => {
  const k = closedTabs.pop()
  if (k) openKey(k)
}

function travel(from, to) {
  const k = from.pop()
  if (!k) return
  to.push(keyOf(opened))
  travelling = true
  openKey(k)
  if (keyOf(opened) !== k) travelling = false
}
const goBack = () => (editor.classList.contains('raw') ? view.goBack() : travel(backStack, forwardStack))
const goForward = () => (editor.classList.contains('raw') ? view.goForward() : travel(forwardStack, backStack))

// Full chat list, collected by scrolling the inbox.
let catalog = []
try {
  catalog = JSON.parse(localStorage.getItem('catalog') ?? '[]').filter((t) => t && typeof t.name === 'string')
} catch {}
let crawledAt = Number(localStorage.getItem('crawledAt') ?? 0)
let guestBusy = null // { kind: 'crawl' | 'seek', promise, ... } while a script is scrolling Instagram's list
const known = (name) => snap.threads.includes(name) || catalog.some((t) => t.name === name)

// Chat order follows Instagram's inbox.
const liveOnTop = () => snap.threads.length > 0 && snap.atTop !== false
const listed = () => {
  const active = opened.kind === 'thread' ? opened.name : null
  const out = liveOnTop() ? [...snap.threads] : []
  const has = new Set(out)
  for (const t of catalog) if (!has.has(t.name)) out.push(t.name), has.add(t.name)
  for (const n of snap.threads) if (!has.has(n)) out.push(n), has.add(n)
  if (active && (snap.canSend || guestBusy) && !has.has(active)) out.push(active)
  return out
}
// Keep the saved order current: a chat that just got a message jumps to the top, like on Instagram.
function reorderCatalog() {
  if (!liveOnTop() || guestBusy) return
  const live = new Set(snap.threads)
  const next = [...snap.threads.map((name, i) => ({ name, preview: snap.previews?.[i] ?? [] })), ...catalog.filter((t) => !live.has(t.name))]
  if (next.map((t) => t.name).join('\n') === catalog.map((t) => t.name).join('\n')) return
  catalog = next
  localStorage.setItem('catalog', JSON.stringify(catalog))
}

async function stopCrawl() {
  if (guestBusy?.kind !== 'crawl') return
  await view.executeJavaScript('window.__vscStop = true').catch(() => {})
  await guestBusy?.promise
}

async function crawl(force = false) {
  if (guestBusy || dm || pinned || !snap.ok || !path?.startsWith('/direct')) return
  if (!force && Date.now() - crawledAt < 15 * 60 * 1000) return
  const job = view.executeJavaScript(GUEST.crawl).catch(() => null)
  guestBusy = { kind: 'crawl', promise: job, snap }
  render()
  const result = await job
  guestBusy = null
  if (result?.threads?.length) {
    const names = new Set(result.threads.map((t) => t.name))
    catalog = result.complete ? result.threads : [...result.threads, ...catalog.filter((t) => !names.has(t.name))]
    crawledAt = Date.now()
    localStorage.setItem('catalog', JSON.stringify(catalog))
    localStorage.setItem('crawledAt', crawledAt)
    if (force) views.notify(`Indexed ${catalog.length} chat files.`, [], 'Explorer')
  }
  last = ''
  setTimeout(poll, 50)
}
setInterval(() => crawl(), 60 * 1000)

async function seekThread(name) {
  await stopCrawl()
  const job = view.executeJavaScript(GUEST.seek(name)).catch(() => false)
  guestBusy = { kind: 'seek', name, promise: job }
  render()
  const ok = await job
  guestBusy = null
  openedAt = Date.now()
  if (!ok && opened.kind === 'thread' && opened.name === name) {
    views.notify(`Unable to open '${workspace.base(ws.threads[name] ?? name)}': the chat was not found in the inbox.`, [['Refresh Chat List', () => crawl(true)]], 'Explorer')
  }
  last = ''
  setTimeout(poll, 50)
}

// ---- Instagram notifications as a chat-like file ("00_notifications.py")
let alarms = null
try {
  alarms = JSON.parse(localStorage.getItem('alarms') ?? 'null')
} catch {}
let alarmSeen = Number(localStorage.getItem('alarmSeen') ?? 0) // seconds, newest item we have shown
let alarmToasted = Number(localStorage.getItem('alarmToasted') ?? 0)
let alarmBoundary = null // "last checked" line position, fixed while the file is open
let alarmLoad = null
const alarmChecked = () => Math.max(alarms?.lastChecked ?? 0, alarmSeen)
const alarmNewest = () => Math.max(0, ...(alarms?.stories ?? []).map((a) => a.at))
const alarmNew = () => (alarms?.stories ?? []).filter((a) => a.at > alarmChecked()).length

function loadAlarms() {
  let host = ''
  try {
    host = new URL(view.getURL()).hostname
  } catch {}
  if (alarmLoad || !/(^|\.)instagram\.com$/.test(host)) return alarmLoad
  alarmLoad = view
    .executeJavaScript(GUEST.alarms)
    .then((result) => {
      if (!result) return
      alarms = result
      localStorage.setItem('alarms', JSON.stringify(result))
      const newest = alarmNewest()
      const fresh = alarmNew()
      if (!alarmToasted) alarmToasted = newest
      else if (newest > alarmToasted && fresh && opened.kind !== 'alarm') {
        alarmToasted = newest
        views.notify(`${fresh} new notification${fresh > 1 ? 's' : ''} in ${workspace.base(ws.alarm)}.`, [['Open File', openAlarm]], 'Instagram')
      }
      localStorage.setItem('alarmToasted', alarmToasted)
      last = ''
      render()
    })
    .catch(() => {})
    .finally(() => (alarmLoad = null))
  return alarmLoad
}
setInterval(loadAlarms, 60 * 1000)

function openAlarm() {
  workspace.ensureAlarm(ws)
  alarmBoundary = alarmChecked()
  opened = { kind: 'alarm' }
  reveal(workspace.dir(ws.alarm))
  loadAlarms()
  render()
}

const when = (sec) => new Date(sec * 1000).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })
function alarmRows() {
  const list = [...(alarms?.stories ?? [])].sort((a, b) => a.at - b.at)
  const boundary = alarmBoundary ?? alarmChecked()
  const fresh = list.filter((a) => a.at > boundary).length
  const mark = { side: 'note', text: `──── last checked ${boundary ? when(boundary) : 'never'} · ${fresh ? fresh + ' new below' : 'no new notifications'} ────`, mark: true }
  const rows = []
  let prev = 0
  let marked = false
  for (const a of list) {
    if (!marked && a.at > boundary) {
      rows.push(mark)
      marked = true
    }
    if (a.at - prev > 3600) rows.push({ side: 'note', text: when(a.at) })
    prev = a.at
    rows.push({ side: 'recv', text: a.text, who: a.who, media: !!a.src, src: a.src })
  }
  if (!marked && list.length) rows.push(mark)
  return rows
}

function render() {
  if (dm) {
    setBusy(true, true)
    last = ''
    return
  }
  trackOpened()
  const nowAway = !path?.startsWith('/direct')
  if (away && !nowAway) pinned = false
  away = nowAway
  const raw = pinned || (!away && !snap.ok)
  const active = opened.kind === 'thread' ? opened.name : null
  // Previews line up with snap.threads only; other chats just need a file name.
  const synced = workspace.sync(ws, snap.threads, snap.previews, active, unreadFlags())
  if (synced | workspace.sync(ws, listed().filter((n) => !snap.threads.includes(n)), [], active)) save()
  if (snap.ok) reorderCatalog()
  if (snap.ok) {
    if (!peopleLoad) loadPeople()
    if (workspace.learn(ws, { threads: snap.threads, current: snap.current, peer: snap.peer, rows: snap.rows, people })) save()
  }

  if (snap.ok && !booted) {
    booted = true
    setTimeout(() => {
      loadAlarms()
      crawl()
    }, 3000)
  }

  const paged = !raw && opened.kind === 'page' ? opened.id : null
  const seeking = guestBusy?.kind === 'seek' && guestBusy.name === active
  const thread = !raw && active && (snap.canSend || seeking) ? active : null
  const alarm = !raw && opened.kind === 'alarm' ? workspace.ensureAlarm(ws) : null
  const file = raw || thread || paged || alarm ? null : opened.kind === 'file' && ws.files.includes(opened.path) ? opened.path : opened.kind === 'thread' ? fallbackDecoy() : ws.readme
  showing = { thread, file, alarm }
  if (!draft.value) draftSeed = `${thread}:${snap.rows.length}`
  const switched = !!switching && switching.rows === JSON.stringify(snap.rows) && Date.now() - switching.at < 1500
  if (!switched) switching = null
  const loading = !!thread && (seeking || switched || (!snap.rows.length && Date.now() - openedAt < 4000))
  const older = !!thread && !!paging && snap.rows.length === paging.count && Date.now() - paging.at < 2000
  if (!older) paging = null
  setBusy(loading || older || !path || !!guestBusy, loading)

  const alarmState = [alarms?.stories?.length ?? -1, alarmNewest(), alarmNew(), alarmBoundary, !!alarmLoad]
  const state = JSON.stringify([snap, raw, path, opened, thread, file, alarm, alarmState, catalog.length, !!guestBusy, loading, older, readme.length, level, draftSeed, version])
  if (state === last) return
  last = state

  if (!editing) drawTree()
  drawTabs()
  editor.classList.toggle('raw', raw)

  const pageEl = document.getElementById('page')
  pageEl.hidden = !paged
  if (paged) {
    const { title } = views.page(paged, pageEl)
    document.title = title ? `${title} - ${ws.root} - Visual Studio Code` : `${ws.root} - Visual Studio Code`
    document.querySelector('.breadcrumbs').replaceChildren(...(title ? [span('', title)] : []))
    return
  }

  const route = (path ?? '').split('/').filter(Boolean)
  const parts = raw ? [...route.slice(0, -1), (route.at(-1) || 'index') + '.py'] : (thread ? ws.threads[thread] : alarm ?? file).split('/')
  const name = parts.at(-1)
  const type = raw ? langs.of('index.py') : thread || alarm ? langs.code(chatLang(name)) : langs.of(name)
  document.getElementById('lang').textContent = type.label
  currentLang = type.id
  document.getElementById('version').hidden = type.id !== 'python'
  document.title = `${name} - ${ws.root} - Visual Studio Code`
  document.querySelector('.breadcrumbs').replaceChildren(...parts.flatMap((part, i) => (i ? [icon('chevron-right'), span('', part)] : [span('', part)])))
  if (raw) return

  const input = document.querySelector('.line.input')
  const linesEl = document.getElementById('lines')
  if (editingFile && editingFile !== file) saveEdits()
  const stick = code.scrollHeight - code.scrollTop - code.clientHeight < 40
  if (file) {
    const text = file === ws.readme ? null : workspace.content(ws, file)
    const editable = file !== ws.readme && text !== null && type.id !== 'markdown'
    const bodyKey = JSON.stringify([file, text, readme.length, type.id])
    const typingHere = document.activeElement === linesEl && editingFile === file
    if (bodyKey !== editorKey && !typingHere) {
      editorKey = bodyKey
      const body =
        file === ws.readme
          ? markdown(readme)
          : text === null
            ? [binaryNote()]
            : type.id === 'markdown'
              ? markdown(text.join('\n'))
              : text.map((l) => line(...highlight(l, type.id)))
      linesEl.replaceChildren(...body)
    }
    linesEl.contentEditable = editable ? 'true' : 'false'
    linesEl.classList.toggle('editing', editable)
    editingFile = editable ? file : null
    document.getElementById('after').replaceChildren()
    input.hidden = true
  } else if (alarm) {
    linesEl.contentEditable = 'false'
    linesEl.classList.remove('editing')
    editingFile = null
    if (alarms?.stories?.length) {
      alarmSeen = Math.max(alarmSeen, alarmNewest())
      localStorage.setItem('alarmSeen', alarmSeen)
    }
    const lines = camo(alarmRows(), level, null, type.id)
    const bodyKey = JSON.stringify(['alarm', lines.map(camo.text), type.id])
    if (bodyKey !== editorKey) {
      editorKey = bodyKey
      const empty = alarms ? 'no notifications' : 'loading notifications from Instagram...'
      linesEl.replaceChildren(
        ...(lines.some((l) => l.kind !== 'code') ? [] : [line(span('com', `${type.mark} ${empty}`))]),
        ...lines.map((l) => {
          const el = codeLine(l, type.id)
          if (l.kind === 'note' && l.text.startsWith('──── last checked')) el.classList.add('alarm-mark')
          return el
        }),
      )
    }
    document.getElementById('after').replaceChildren()
    input.hidden = true
  } else {
    linesEl.contentEditable = 'false'
    linesEl.classList.remove('editing')
    editingFile = null
    const rows = loading ? [] : snap.rows
    const lines = camo(rows, level, { seed: draftSeed }, type.id)
    const at = lines.findIndex((l) => l.kind === 'draft')
    const typing = lines[at]
    const bodyKey = JSON.stringify([thread, lines.map(camo.text), lines.map((l) => l.who ?? ''), snap.pending, loading, type.id])
    if (bodyKey === editorKey) {
      input.hidden = false
      if (stick) code.scrollTop = code.scrollHeight
      shown = 'thread:' + thread
      return
    }
    editorKey = bodyKey
    document.getElementById('lines').replaceChildren(
      ...(rows.length || loading ? [] : [line(span('com', `${type.mark} nothing read from this chat yet (the preview icon, top right, shows the real page)`))]),
      ...lines.slice(0, at).map((l) => codeLine(l, type.id)),
      ...(snap.pending ? [line(typing.indent, span('com', `${type.mark} ${snap.pending} attachment(s) ready, Enter sends`))] : []),
    )
    quotes()
    document.getElementById('draft-pre').replaceChildren(typing.indent, ...highlight(typing.pre, type.id))
    document.getElementById('draft-post').replaceChildren(...highlight(typing.post, type.id))
    document.getElementById('after').replaceChildren(...lines.slice(at + 1).map((l) => codeLine(l, type.id)))
    input.hidden = false
  }

  const now = thread ? 'thread:' + thread : alarm ? 'alarm' : 'file:' + file
  if (now !== shown && alarm) {
    const marker = linesEl.querySelector('.alarm-mark')
    if (marker && marker.nextElementSibling) marker.scrollIntoView({ block: 'center' })
    else code.scrollTop = code.scrollHeight
  } else if (now !== shown) {
    code.scrollTop = thread ? code.scrollHeight : 0
    if (thread && quick.hidden && !editing) draft.focus()
  } else if (stick && thread) {
    code.scrollTop = code.scrollHeight
  }
  shown = now
}

const rowFor = (p) => tree.querySelector(`.row[data-path="${CSS.escape(p)}"]`)
const makeRow = (iconEl, name, depth, folder) => {
  const row = document.createElement('div')
  row.className = 'row' + (folder ? ' folder' : '')
  row.tabIndex = -1
  row.setAttribute('role', 'treeitem')
  row.style.paddingLeft = 8 + depth * 8 + (folder ? 0 : 16) + 'px'
  row.append(iconEl, span('label', name))
  return row
}

let pressing = false
let treeKey = ''
let treeLater = false
addEventListener('pointerdown', () => (pressing = true), true)
const release = () => {
  pressing = false
  if (treeLater) setTimeout(drawTree)
}
addEventListener('pointerup', release, true)
addEventListener('pointercancel', release, true)
addEventListener('dragend', release, true)
addEventListener('blur', release)

function drawTree() {
  if (pressing) {
    treeLater = true
    return
  }
  treeLater = false
  document.getElementById('root-name').textContent = ws.root
  document.getElementById('workspace-name').textContent = ws.root
  const dirty = [...freshThreads()].map((n) => ws.threads[n])
  const currentPath = showing.thread ? ws.threads[showing.thread] : showing.alarm ?? showing.file
  const alarmFresh = alarmNew() > 0
  const entries = []
  const walk = (folder, depth) => {
    for (const entry of workspace.children(ws, folder, listed())) {
      const open = entry.folder && ws.expanded.includes(entry.path)
      const modified = entry.folder ? dirty.some((p) => p.startsWith(entry.path + '/')) : dirty.includes(entry.path)
      entries.push({ path: entry.path, name: entry.name, folder: !!entry.folder, open, depth, modified: !!(modified || (entry.alarm && alarmFresh) || (entry.folder && alarmFresh && ws.alarm?.startsWith(entry.path + '/'))), active: entry.path === currentPath })
      if (open) walk(entry.path, depth + 1)
    }
  }
  walk('', 0)
  const key = JSON.stringify(entries)
  if (key !== treeKey) {
    treeKey = key
    const focused = document.activeElement?.closest?.('#tree .row')?.dataset.path
    tree.replaceChildren(
      ...entries.map((entry) => {
        const row = makeRow(entry.folder ? icon(entry.open ? 'chevron-down' : 'chevron-right') : fileIcon(entry.name), entry.name, entry.depth, entry.folder)
        row.dataset.path = entry.path
        row.draggable = true
        row.classList.toggle('active', entry.active)
        row.classList.toggle('modified', !!entry.modified)
        if (entry.modified) row.append(span('badge', entry.folder ? '●' : 'M'))
        return row
      }),
    )
    if (focused) rowFor(focused)?.focus({ preventScroll: true })
  }
  if (typeof views !== 'undefined') views.refresh()
}
const redrawTree = () => {
  treeKey = ''
  drawTree()
}

function reveal(p) {
  if (!p) return
  const parts = p.split('/')
  for (let i = 1; i <= parts.length; i++) {
    const d = parts.slice(0, i).join('/')
    if (workspace.isFolder(ws, d) && !ws.expanded.includes(d)) ws.expanded.push(d)
  }
}

function openThread(name) {
  const i = guestBusy ? -1 : snap.threads.indexOf(name)
  if (i < 0 && !known(name)) return
  if (name !== current) switching = { rows: JSON.stringify(snap.rows), at: Date.now() }
  current = name
  openedAt = Date.now()
  opened = { kind: 'thread', name }
  if (i < 0) {
    seekThread(name)
    return render()
  }
  view.executeJavaScript(GUEST.open(i))
  render()
  setTimeout(poll, 150)
}

function openFile(p) {
  opened = { kind: 'file', path: p }
  if (p !== ws.readme) decoy = p
  render()
}

function openPath(p) {
  if (p === ws.alarm) return openAlarm()
  const name = workspace.threadAt(ws, p)
  name !== undefined ? openThread(name) : openFile(p)
}

const hide = () => openFile(fallbackDecoy())

const follow = (from, to) => {
  if (opened.kind === 'file') opened.path = workspace.rebase(opened.path, from, to)
  if (decoy) decoy = workspace.rebase(decoy, from, to)
  if (selected) selected = workspace.rebase(selected, from, to)
}

function ask(row, value, done) {
  editing = true
  row.draggable = false
  const label = row.querySelector('.label')
  const input = Object.assign(document.createElement('input'), { className: 'rename', value, spellcheck: false })
  label.replaceWith(input)
  input.focus()
  const dot = value.lastIndexOf('.')
  input.setSelectionRange(0, dot > 0 ? dot : value.length)
  let finished = false
  const finish = (result) => {
    if (finished) return
    finished = true
    editing = false
    input.replaceWith(label)
    done(result?.trim() || null)
    redrawTree()
    render()
  }
  input.addEventListener('keydown', (e) => {
    e.stopPropagation()
    if (e.isComposing) return
    if (e.key === 'Enter') finish(input.value)
    if (e.key === 'Escape') finish(null)
  })
  input.addEventListener('click', (e) => e.stopPropagation())
  input.addEventListener('blur', () => finish(input.value))
}

function create(folder, parent = selected) {
  parent = parent == null ? '' : workspace.isFolder(ws, parent) ? parent : workspace.dir(parent)
  if (!workspace.isFolder(ws, parent)) parent = ''
  reveal(parent)
  drawTree()
  const anchor = parent && rowFor(parent)
  const row = makeRow(folder ? icon('chevron-right') : fileIcon(''), '', parent ? parent.split('/').length : 0, folder)
  anchor ? anchor.after(row) : tree.prepend(row)
  row.scrollIntoView({ block: 'nearest' })
  ask(row, '', (name) => {
    const parts = name?.split('/').filter(Boolean) ?? []
    const english = parts.map((part, i) => workspace.englishName(ws, part, folder || i < parts.length - 1)).join('/')
    const p = english && workspace.create(ws, workspace.join(parent, english), folder)
    if (!p) return
    selected = p
    reveal(workspace.dir(p))
    save()
    if (!folder) openFile(p)
  })
}

function rename(p) {
  const row = rowFor(p)
  if (!row) return
  const before = workspace.base(p)
  ask(row, before, (typed) => {
    const name = typed && workspace.englishName(ws, typed, workspace.isFolder(ws, p))
    if (!name || name === before) return
    const to = workspace.relocate(ws, p, workspace.join(workspace.dir(p), name))
    if (!to) return
    follow(p, to)
    save()
  })
}

const deletable = (p) => p !== ws.readme && p !== ws.alarm && workspace.threadAt(ws, p) === undefined

function remove(p) {
  if (!deletable(p) || !confirm(`Are you sure you want to delete '${workspace.base(p)}'?`)) return
  if (!workspace.remove(ws, p)) return
  if (decoy && !ws.files.includes(decoy)) decoy = null
  selected = null
  save()
  drawTree()
  render()
}

function toggleFolder(p, open = !ws.expanded.includes(p)) {
  ws.expanded = ws.expanded.filter((f) => f !== p)
  if (open) ws.expanded.push(p)
  save()
  drawTree()
}

const rowOf = (e) => e.target.closest?.('.row[data-path]')

tree.addEventListener('click', (e) => {
  const row = rowOf(e)
  selected = row?.dataset.path ?? null
  if (!row) return
  if (workspace.isFolder(ws, selected)) toggleFolder(selected)
  else openPath(selected)
})

tree.addEventListener('keydown', (e) => {
  const row = rowOf(e)
  if (!row || editing) return
  const p = row.dataset.path
  const folder = workspace.isFolder(ws, p)
  const rows = [...tree.querySelectorAll('.row[data-path]')]
  const step = (n) => {
    const next = rows[rows.indexOf(row) + n]
    if (!next) return
    selected = next.dataset.path
    next.focus()
  }
  const keys = {
    F2: () => rename(p),
    Delete: () => remove(p),
    Enter: () => row.click(),
    ' ': () => row.click(),
    ArrowDown: () => step(1),
    ArrowUp: () => step(-1),
    ArrowRight: () => folder && toggleFolder(p, true),
    ArrowLeft: () => (folder && ws.expanded.includes(p) ? toggleFolder(p, false) : workspace.dir(p) && rowFor(workspace.dir(p))?.focus()),
  }
  const run = e.key === 'Backspace' && e.metaKey ? keys.Delete : keys[e.key]
  if (!run) return
  e.preventDefault()
  e.stopPropagation()
  run()
})

function showMenu(x, y, items) {
  menu.replaceChildren(
    ...items.map((item) => {
      if (!item) return document.createElement('hr')
      if (typeof item === 'string') return span('section', item)
      const [label, run, key, checked] = item
      const el = document.createElement('div')
      el.className = 'item' + (run ? '' : ' disabled')
      el.append(icon(checked ? 'check' : 'blank'), span('', label), span('key', key ?? ''))
      el.addEventListener('mousedown', (e) => e.preventDefault())
      el.addEventListener('click', () => {
        if (!run) return
        hideMenu()
        run()
      })
      return el
    }),
  )
  menu.hidden = false
  const r = menu.getBoundingClientRect()
  menu.style.left = Math.min(x, innerWidth - r.width - 4) + 'px'
  menu.style.top = Math.min(y, innerHeight - r.height - 4) + 'px'
}
const hideMenu = () => {
  menu.hidden = true
  document.querySelectorAll('.menubar button.open').forEach((el) => el.classList.remove('open'))
}
addEventListener('mousedown', (e) => menu.contains(e.target) || hideMenu())
addEventListener('blur', hideMenu)

tree.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  const row = rowOf(e)
  const p = row?.dataset.path ?? null
  selected = p
  row?.focus()
  const items = [['New File...', () => create(false, p)], ['New Folder...', () => create(true, p)]]
  if (row) {
    items.push(null, ['Rename...', () => rename(p), 'F2'])
    if (deletable(p)) items.push(['Delete', () => remove(p), 'Delete'])
  }
  showMenu(e.clientX, e.clientY, items)
})

const renameRoot = () =>
  ask(rootHeader, ws.root, (name) => {
    if (!name || name.includes('/')) return
    ws.root = name
    save()
  })
rootHeader.addEventListener('dblclick', (e) => e.target.closest('.actions, input') || renameRoot())
rootHeader.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  showMenu(e.clientX, e.clientY, [['New File...', () => create(false, '')], ['New Folder...', () => create(true, '')], null, ['Rename...', renameRoot]])
})
function useTemplate(id) {
  const t = templates.get(id)
  const ask = id === ws.template ? `Reset the explorer to '${t.label}'?` : `Open the '${t.label}' template?`
  if (!confirm(`${ask} Files and folders you added will be replaced. Chat files keep the names you gave them.`)) return
  workspace.apply(ws, id)
  decoy = null
  selected = null
  if (opened.kind === 'file') opened = { kind: 'file', path: fallbackDecoy() }
  save()
  drawTree()
  render()
}

function setChats(change) {
  const renaming = change.naming && change.naming !== ws.naming
  Object.assign(ws, change)
  if (renaming) workspace.renameAuto(ws)
  save()
  drawTree()
  render()
}

const fileMenu = () => [
  ['New File...', () => create(false), 'Ctrl+Alt+N'],
  ['New Folder...', () => create(true)],
  null,
  ['Go to File...', () => openQuick(), 'Ctrl+P'],
  ['Go to Symbol...', () => openQuick('@'), 'Ctrl+Shift+O'],
  ['Rename Project...', renameRoot],
  null,
  'Chat Files',
  ['Name After Contact', () => setChats({ naming: 'name' }), '', ws.naming !== 'module'],
  ['Generic Module Names', () => setChats({ naming: 'module' }), '', ws.naming === 'module'],
  ['Sort by Recent Activity', () => setChats({ sort: 'recent' }), '', ws.sort !== 'name'],
  ['Sort by Name', () => setChats({ sort: 'name' }), '', ws.sort === 'name'],
  null,
  'Open Template',
  ...templates.LIST.map((t) => [t.label, () => useTemplate(t.id), '', t.id === ws.template]),
]
const menuBelow = (button, items) => {
  const r = button.getBoundingClientRect()
  showMenu(r.left, r.bottom + 2, items)
}
document.getElementById('menu-file').addEventListener('mousedown', (e) => {
  e.stopPropagation()
  if (!menu.hidden) return hideMenu()
  menuBelow(e.currentTarget, fileMenu())
  e.currentTarget.classList.add('open')
})
document.getElementById('explorer-more').addEventListener('mousedown', (e) => {
  e.stopPropagation()
  menu.hidden ? menuBelow(e.currentTarget, fileMenu()) : hideMenu()
})

document.getElementById('new-file').addEventListener('click', () => create(false))
document.getElementById('new-folder').addEventListener('click', () => create(true))
document.getElementById('collapse').addEventListener('click', () => {
  ws.expanded = []
  save()
  drawTree()
})

let dragged = null
const dropFolder = (e) => {
  const row = rowOf(e)
  if (!row) return ''
  const p = row.dataset.path
  return workspace.isFolder(ws, p) ? p : workspace.dir(p)
}
const clearDrop = () => {
  tree.classList.remove('drop')
  tree.querySelectorAll('.drop').forEach((el) => el.classList.remove('drop'))
}
tree.addEventListener('dragstart', (e) => {
  const row = rowOf(e)
  if (!row) return
  dragged = row.dataset.path
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', dragged)
})
tree.addEventListener('dragover', (e) => {
  if (dragged == null) return
  e.preventDefault()
  const folder = dropFolder(e)
  clearDrop()
  ;(folder ? rowFor(folder) : tree)?.classList.add('drop')
})
tree.addEventListener('dragleave', (e) => tree.contains(e.relatedTarget) || clearDrop())
tree.addEventListener('drop', (e) => {
  if (dragged == null) return
  e.preventDefault()
  const folder = dropFolder(e)
  const to = workspace.move(ws, dragged, folder)
  if (to) {
    follow(dragged, to)
    reveal(folder)
    save()
  }
  dragged = null
  clearDrop()
  drawTree()
  render()
})
tree.addEventListener('dragend', () => {
  dragged = null
  clearDrop()
})

let picks = []
let pick = 0
function openQuick(prefix = '') {
  hideMenu()
  quick.hidden = false
  quickInput.value = typeof prefix === 'string' ? prefix : ''
  pick = 0
  drawQuick()
  quickInput.focus()
}
function closeQuick() {
  quick.hidden = true
  if (showing.thread) draft.focus()
}

function fileItems(q) {
  const fresh = freshThreads()
  const chats = [...new Set(listed())].map((thread, order) => ({ path: ws.threads[thread], thread, order }))
  const alarm = ws.alarm ? [{ path: ws.alarm, alarm: true, order: -1 }] : []
  const entries = [...alarm, ...chats, ...ws.files.map((p) => ({ path: p, order: Infinity }))].filter((entry) => entry.path)
  const recent = ws.sort !== 'name'
  // Match the file name first, then the real chat name / Instagram ID, then the folder path.
  const fields = (entry) =>
    entry.alarm
      ? [workspace.base(entry.path), '알람', '알림', 'notifications', 'alarm', 'activity', 'instagram', entry.path]
      : [workspace.base(entry.path), entry.thread, entry.thread !== undefined ? ws.ids?.[entry.thread] : null, entry.path]
  const tie = (a, b) => (recent && a.order - b.order) || a.path.localeCompare(b.path)
  return match.filter(q, entries, fields, tie).map(({ item: entry, hits }) => ({
    icon: fileIcon(entry.path),
    label: workspace.base(entry.path),
    hits,
    desc: workspace.dir(entry.path),
    badge: (entry.thread !== undefined && fresh.has(entry.thread)) || (entry.alarm && alarmNew() > 0) ? 'M' : '',
    run() {
      reveal(workspace.dir(entry.path))
      selected = entry.path
      save()
      entry.alarm ? openAlarm() : entry.thread !== undefined ? openThread(entry.thread) : openFile(entry.path)
    },
  }))
}

people = JSON.parse(localStorage.getItem('symbols') ?? 'null')
const loadPeople = () =>
  (peopleLoad ??= view
    .executeJavaScript(GUEST.people)
    .then((list) => {
      if (!list.length && people?.length) return
      people = list
      localStorage.setItem('symbols', JSON.stringify(list))
    })
    .catch(() => (people ??= []))
    .finally(() => quick.hidden || drawQuick()))

function peopleItems(q) {
  loadPeople()
  if (people === null) return [{ icon: icon('loading codicon-modifier-spin'), label: 'Loading symbols...' }]
  const mutual = (p) => (p.following && p.followers ? 0 : 1)
  const found = match.filter(q, people, (p) => [p.username, p.name], (a, b) => mutual(a) - mutual(b))
  if (!found.length) return [{ icon: icon('info'), label: people.length ? 'No matching symbols' : 'No symbols found' }]
  return found.map(({ item: p, hits }) => ({ icon: icon('symbol-variable', '#75beff'), label: p.username, hits, desc: p.name, run: () => openDm(p) }))
}

function drawQuick() {
  const value = quickInput.value
  const items = value.startsWith('@')
    ? peopleItems(value.slice(1).trim().toLowerCase())
    : value.startsWith('>')
      ? views.commands(value.slice(1).trim().toLowerCase())
      : value.startsWith('?')
        ? views.help()
        : value.startsWith(':')
          ? views.gotoLine(value.slice(1).trim())
          : fileItems(value.trim().toLowerCase())
  picks = items.slice(0, 80)
  if (!picks.length) picks = [{ icon: icon('info'), label: value.trim() ? 'No matching results' : 'No results' }]
  pick = Math.min(pick, Math.max(picks.length - 1, 0))
  quickList.replaceChildren(
    ...picks.map((item, i) => {
      const el = document.createElement('div')
      el.className = 'item' + (i === pick && item.run ? ' on' : '')
      el.title = item.desc ? `${item.label}  ${item.desc}` : item.label
      const label = span('label', '')
      label.append(...match.runs(item.label, item.hits).map((r) => (r.on ? span('hl', r.text) : r.text)))
      el.append(item.icon, label, span('dir', item.desc ?? ''), ...(item.badge ? [span('letter', item.badge)] : []))
      el.addEventListener('mousedown', (e) => {
        e.preventDefault()
        choose(item)
      })
      return el
    }),
  )
  quickList.children[pick]?.scrollIntoView({ block: 'nearest' })
}
function choose(item) {
  if (!item?.run) return
  closeQuick()
  item.run()
}

function openDm({ username, name }) {
  if (!/^[A-Za-z0-9._]+$/.test(username ?? '')) return
  dm = { username, name: name || username, at: Date.now(), clicked: false, landed: 0 }
  view.loadURL(`https://www.instagram.com/${username}/`)
  render()
}

async function stepDm(where) {
  if (!dm) return
  if (Date.now() - dm.at > 15000) {
    dm = null
    pinned = true
    return
  }
  if (!dm.clicked) {
    if (where?.replace(/\/$/, '') === '/' + dm.username && (await view.executeJavaScript(GUEST.message).catch(() => false))) dm.clicked = true
    return
  }
  if (!where?.startsWith('/direct/t/') || !snap.canSend) return
  dm.landed ||= Date.now()
  const name = snap.current >= 0 ? snap.threads[snap.current] : Date.now() - dm.landed > 2000 ? dm.name : null
  if (!name) return
  dm = null
  current = name
  openedAt = Date.now()
  opened = { kind: 'thread', name }
  workspace.sync(ws, listed(), snap.previews, name)
  reveal(workspace.dir(ws.threads[name]))
  save()
}
quickInput.addEventListener('input', () => {
  pick = 0
  drawQuick()
})
quickInput.addEventListener('keydown', (e) => {
  if (e.isComposing) return
  if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && picks.length) {
    e.preventDefault()
    pick = (pick + (e.key === 'ArrowDown' ? 1 : -1) + picks.length) % picks.length
    drawQuick()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (picks[pick]) choose(picks[pick])
  } else if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    closeQuick()
  }
})
quickInput.addEventListener('blur', () => (quick.hidden = true))
document.getElementById('command-center').addEventListener('click', openQuick)

let polling = false
let booted = false
async function poll() {
  if (polling || guestBusy?.kind === 'seek') return
  polling = true
  try {
    let where = null
    try {
      where = new URL(view.getURL()).pathname
    } catch {}
    let next = EMPTY
    if (where?.startsWith('/direct')) {
      try {
        next = await view.executeJavaScript(GUEST.scrape)
      } catch {
        return
      }
    }
    const frozen = guestBusy?.kind === 'crawl' ? guestBusy.snap : null
    snap =
      frozen && next.ok
        ? { ...next, threads: frozen.threads, previews: frozen.previews, unread: frozen.unread, current: frozen.current }
        : dm && !where?.startsWith('/direct')
          ? { ...next, threads: snap.threads, previews: snap.previews, unread: snap.unread }
          : next
    path = where
    await stepDm(where)
    render()
  } finally {
    polling = false
  }
}
setInterval(poll, 500)
fetch('../README.md')
  .then((res) => res.text())
  .then((text) => {
    readme = text
    poll()
  })

// Messages are sent one at a time in the background.
let sending = Promise.resolve()

// If the hidden page grabs focus, give it back to the input line (except while sending).
let guestFocusUntil = 0
let lastFocus = null
const allowGuestFocus = (ms) => (guestFocusUntil = Date.now() + ms)
document.addEventListener('focusin', (e) => e.target !== view && (lastFocus = e.target))
function keepTyping(force = false) {
  if (Date.now() < guestFocusUntil || editor.classList.contains('raw') || !menu.hidden) return
  const target = lastFocus && lastFocus !== draft && document.contains(lastFocus) && lastFocus.matches('input, textarea, [contenteditable="true"]') ? lastFocus : showing.thread && quick.hidden && !editing ? draft : null
  if (!target || (!force && document.activeElement === target)) return
  window.native?.refocus?.()
  resetInput(target)
}
view.addEventListener('focus', () => setTimeout(keepTyping))
window.native?.onGuestFocus?.(() => setTimeout(keepTyping))

// Re-attach the IME to a text box, same as clicking it.
function resetInput(el = draft) {
  if (composing) return
  const end = el.value?.length ?? 0
  el.blur()
  el.focus({ preventScroll: true })
  if (el.setSelectionRange) el.setSelectionRange(end, end)
}
let composing = false
draft.addEventListener('compositionstart', () => (composing = true))
draft.addEventListener('compositionend', () => {
  composing = false
  if (sentPrefix !== null) setTimeout(clearSent)
})

// Take the keyboard back from the webview (focusing the box alone is a no-op).
function reclaimKeyboard() {
  if (editor.classList.contains('raw') || !menu.hidden) return
  const active = document.activeElement
  const target = active && active !== view && active !== document.body ? active : showing.thread && quick.hidden && !editing ? draft : null
  if (!target) return
  const range = typeof target.selectionStart === 'number' ? [target.selectionStart, target.selectionEnd] : null
  view.focus()
  target.focus({ preventScroll: true })
  if (range) target.setSelectionRange(...range)
}

// Number of my bubbles in the open chat containing this text (-1 = unknown).
const normText = (s) => (s || '').replace(/\s+/g, ' ').trim()
async function mineCount(key) {
  if (!key) return -1
  const data = await view.executeJavaScript(GUEST.scrape).catch(() => null)
  return Array.isArray(data?.rows) ? data.rows.filter((r) => r.side === 'send' && normText(r.text).includes(key)).length : -1
}
const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms))

async function sendOnce(text) {
  allowGuestFocus(3000)
  let result
  try {
    result = await view.executeJavaScript(GUEST.send(text)).catch(() => 'fallback')
  } finally {
    guestFocusUntil = 0
  }
  if (result === 'clicked+focus' || result === 'fallback') reclaimKeyboard()
  if (result === 'clicked+focus') result = 'clicked'
  if (result === 'clicked') {
    result = 'typed'
    for (let i = 0; i < 20; i++) {
      if (!(await view.executeJavaScript(GUEST.pending).catch(() => true))) {
        result = 'sent'
        break
      }
      await sleepMs(50)
    }
  }
  return result
}

async function deliver(text) {
  const key = normText(text).slice(0, 30)
  const before = await mineCount(key)
  let result = await sendOnce(text)
  // Retry once if it never showed up in the chat.
  if (result === 'sent' && before >= 0) {
    let delivered = false
    for (let i = 0; i < 12 && !delivered; i++) {
      await sleepMs(200)
      delivered = (await mineCount(key)) > before
    }
    if (!delivered) result = await sendOnce(text)
  }
  if (result === 'nobox') {
    // Composer not loaded yet: put the text back.
    draft.value = draft.value ? `${text} ${draft.value}` : text
    quotes()
    return
  }
  if (result !== 'sent') {
    // Last resort: a real Enter key press.
    allowGuestFocus(3000)
    try {
      await view.executeJavaScript(GUEST.focus).catch(() => false)
      if (result === 'fallback' && text) await view.insertText(text)
      for (const type of ['keyDown', 'char', 'keyUp']) view.sendInputEvent({ type, keyCode: 'Enter' })
    } finally {
      guestFocusUntil = 0
      reclaimKeyboard()
    }
  }
  code.scrollTop = code.scrollHeight
  setTimeout(poll, 150)
}

// Enter: leave the box alone inside the key event, then remove just the sent part.
let sentPrefix = null
function clearSent() {
  if (sentPrefix === null || composing) return
  const value = draft.value
  const rest = value.startsWith(sentPrefix) ? value.slice(sentPrefix.length).replace(/^ +/, '') : value
  sentPrefix = null
  if (rest !== value) {
    draft.value = rest
    draft.dispatchEvent(new Event('input'))
  }
  if (document.activeElement === draft) resetInput(draft)
}
draft.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.isComposing) return
  e.preventDefault()
  const full = draft.value
  // A second Enter before the box was cleared: only the part after the previous message is new.
  const text = sentPrefix !== null && full.startsWith(sentPrefix) ? full.slice(sentPrefix.length).replace(/^ +/, '') : full
  if (!text.trim() && !snap.pending) return
  sentPrefix = full
  setTimeout(clearSent)
  views.remember(text)
  sending = sending.then(() => deliver(text)).catch(() => {})
})

const dataUrl = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
async function attach(files) {
  if (!showing.thread || !files.length) return
  const payload = await Promise.all(files.map(async (f) => ({ name: f.name || 'image.png', type: f.type, data: (await dataUrl(f)).split(',')[1] })))
  view.executeJavaScript(GUEST.attach(payload))
}
draft.addEventListener('paste', (e) => {
  if (!e.clipboardData.files.length) return
  e.preventDefault()
  attach([...e.clipboardData.files])
})
code.addEventListener('dragover', (e) => e.preventDefault())
code.addEventListener('drop', (e) => {
  e.preventDefault()
  attach([...e.dataTransfer.files])
})
code.addEventListener('click', (e) => {
  const who = (e.ctrlKey || e.metaKey) && e.target.closest('[data-who]')?.dataset.who
  if (who) return openDm({ username: who })
  getSelection().toString() || (showing.thread && draft.focus())
})

function highlightSender(who) {
  const lines = [...code.querySelectorAll(`[data-who="${CSS.escape(who)}"]`)]
  lines[0]?.scrollIntoView({ block: 'center' })
  for (const l of lines) l.animate([{ background: '#613214' }, { background: '#61321400' }], { duration: 2400 })
}

code.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  const who = showing.thread || showing.alarm ? e.target.closest('[data-who]')?.dataset.who : null
  const selection = getSelection().toString()
  const pasteInto = editingFile || document.activeElement === draft
  showMenu(e.clientX, e.clientY, [
    ['Go to Definition', who ? () => openDm({ username: who }) : null, 'F12'],
    ['Go to Type Definition', null],
    ['Go to References', who ? () => highlightSender(who) : null, 'Shift+F12'],
    ['Peek', null],
    null,
    ['Rename Symbol', null, 'F2'],
    ['Change All Occurrences', null, 'Ctrl+F2'],
    ['Format Document', editingFile ? () => {} : null, 'Shift+Alt+F'],
    ['Copy Symbol Name', who ? () => navigator.clipboard.writeText('@' + who) : null],
    null,
    ['Cut', editingFile && selection ? () => document.execCommand('cut') : null, 'Ctrl+X'],
    ['Copy', selection ? () => navigator.clipboard.writeText(selection) : null, 'Ctrl+C'],
    ['Paste', pasteInto ? () => navigator.clipboard.readText().then((t) => document.execCommand('insertText', false, t)) : null, 'Ctrl+V'],
    null,
    ['Command Palette...', () => openQuick('>'), 'Ctrl+Shift+P'],
  ])
})
const holdCtrl = (e) => document.body.classList.toggle('ctrl', e.ctrlKey || e.metaKey)
addEventListener('keydown', holdCtrl)
addEventListener('keyup', holdCtrl)
addEventListener('blur', () => document.body.classList.remove('ctrl'))

const toggleSidebar = (show = sidebar.hidden) => {
  sidebar.hidden = !show
  document.querySelector('.activitybar .current')?.classList.toggle('active', show)
}

addEventListener('keydown', (e) => {
  const mod = e.metaKey || e.ctrlKey
  const key = e.key.toLowerCase()
  const typing = (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) && e.target !== draft
  if (e.key === 'Escape' && !menu.hidden) return hideMenu()
  if (mod && e.shiftKey && key === 'o') {
    e.preventDefault()
    openQuick('@')
  } else if (mod && key === 'p') {
    e.preventDefault()
    openQuick(e.shiftKey ? '>' : '')
  } else if (mod && e.altKey && key === 'n' && !typing) {
    e.preventDefault()
    create(false)
  } else if (mod && key === 'b' && !typing) {
    e.preventDefault()
    toggleSidebar()
  } else if (mod && key === 'o') {
    e.preventDefault()
    if (showing.thread) {
      allowGuestFocus(20 * 1000)
      view.executeJavaScript(GUEST.pick, true)
    }
  } else if (e.key === 'Escape' && !e.isComposing && !typing && quick.hidden && (opened.kind === 'thread' || opened.kind === 'alarm')) {
    hide()
  }
})

let paged = 0
code.addEventListener(
  'wheel',
  (e) => {
    if (!showing.thread) return
    const up = e.deltaY < 0
    const atEnd = up ? code.scrollTop === 0 : code.scrollHeight - code.scrollTop - code.clientHeight < 2
    if (!atEnd || Date.now() - paged < 400) return
    paged = Date.now()
    if (up) paging = { count: snap.rows.length, at: paged }
    view.executeJavaScript(GUEST.page(up ? -1 : 1))
    render()
  },
  { passive: true },
)

document.querySelectorAll('[data-toggle-sidebar]').forEach((el) => el.addEventListener('click', () => toggleSidebar()))
const togglePreview = () => {
  pinned = !pinned
  render()
}
document.getElementById('raw').addEventListener('click', togglePreview)
const spaces = document.getElementById('spaces')
const setLevel = (next) => {
  level = next
  localStorage.setItem('camouflage', level)
  spaces.textContent = 'Spaces: ' + level
  render()
}
spaces.textContent = 'Spaces: ' + level
spaces.addEventListener('click', () => setLevel(camo.LEVELS[(camo.LEVELS.indexOf(level) + 1) % camo.LEVELS.length]))
document.getElementById('back').addEventListener('click', goBack)
document.getElementById('forward').addEventListener('click', goForward)

drawTree()

// The editor stage itself never scrolls.
const stage = document.querySelector('.stage')
stage.addEventListener('scroll', () => (stage.scrollTop || stage.scrollLeft) && stage.scrollTo(0, 0))

// ---- Editor feel: hover cards on message lines, live cursor position, current-line highlight.
let currentLang = 'python'
const SIGNATURE = {
  python: ['def print(*values: object, sep: str = " ", end: str = "\n") -> None', 'str'],
  c: ['int puts(const char *s)', 'char *'],
  cpp: ['std::ostream &operator<<(std::ostream &os, const std::string &s)', 'std::string'],
  csharp: ['void Console.WriteLine(string? value)', 'string'],
  java: ['void java.io.PrintStream.println(String x)', 'String'],
  javascript: ['console.log(...data: any[]): void', 'string'],
  typescript: ['console.log(...data: any[]): void', 'string'],
  go: ['func fmt.Println(a ...any) (n int, err error)', 'string'],
  rust: ['macro_rules! println', 'String'],
  kotlin: ['fun println(message: Any?): Unit', 'String'],
  swift: ['func print(_ items: Any..., separator: String = " ")', 'String'],
  dart: ['void print(Object? object)', 'String'],
  php: ['echo(string ...$expressions): void', 'string'],
  ruby: ['Kernel#puts(*objects) → nil', 'String'],
  lua: ['function print(...: any)', 'string'],
}
const hoverCard = Object.assign(document.createElement('div'), { className: 'hover-card', hidden: true })
document.body.append(hoverCard)
let hoverLine = null
let hoverTimer = null
const hideHover = () => {
  clearTimeout(hoverTimer)
  hoverLine = null
  hoverCard.hidden = true
}
function showHover(lineEl, x, y) {
  const [signature, type] = SIGNATURE[currentLang] ?? SIGNATURE.python
  const text = lineEl.textContent.trim()
  const quoted = lineEl.querySelector('.str')?.textContent ?? ''
  const who = lineEl.dataset.who
  const head = lineEl.classList.contains('send')
    ? `(variable) ${text.match(/([A-Za-z_$][\w$]*)\s*(?::[^=]+)?(?::=|=)/)?.[1] ?? 'reply'}: ${type}`
    : signature
  const body = lineEl.classList.contains('send') ? 'Sent by you.' : who ? `From @${who}.` : 'Received message.'
  hoverCard.replaceChildren(
    Object.assign(document.createElement('div'), { className: 'hover-code', textContent: head }),
    Object.assign(document.createElement('div'), { className: 'hover-body', textContent: `${body} ${Math.max(0, quoted.length - 2)} chars.` }),
    ...(who ? [Object.assign(document.createElement('div'), { className: 'hover-foot', textContent: 'Ctrl+Click to open the DM · Shift+F12 to show references' })] : []),
  )
  hoverCard.hidden = false
  const r = hoverCard.getBoundingClientRect()
  hoverCard.style.left = Math.max(4, Math.min(x, innerWidth - r.width - 8)) + 'px'
  hoverCard.style.top = (y - r.height - 12 > 40 ? y - r.height - 12 : y + 18) + 'px'
}
code.addEventListener('mousemove', (e) => {
  const lineEl = e.target.closest?.('#lines .line.recv, #lines .line.send, #after .line.recv, #after .line.send')
  if (e.target.closest?.('.media')) return hideHover()
  if (lineEl === hoverLine) return
  hideHover()
  if (!lineEl) return
  hoverLine = lineEl
  hoverTimer = setTimeout(() => showHover(lineEl, e.clientX, e.clientY), 600)
})
code.addEventListener('mouseleave', hideHover)
code.addEventListener('scroll', hideHover, { passive: true })
addEventListener('keydown', hideHover)

const cursorPos = document.getElementById('cursor-pos')
const allLines = () => [...code.querySelectorAll('#lines .line, .line.input:not([hidden]), #after .line')]
const markCurrent = (lineEl) => {
  code.querySelectorAll('.line.current').forEach((l) => l !== lineEl && l.classList.remove('current'))
  lineEl?.classList.add('current')
}
function updateCursor() {
  const sel = getSelection()
  let ln = 1
  let col = 1
  let picked = 0
  if (document.activeElement === draft) {
    const input = document.querySelector('.line.input')
    ln = allLines().indexOf(input) + 1
    col = document.getElementById('draft-pre').textContent.length + 2 + (draft.selectionStart ?? 0)
    picked = Math.abs((draft.selectionEnd ?? 0) - (draft.selectionStart ?? 0))
    markCurrent(input)
  } else if (sel.rangeCount && code.contains(sel.focusNode)) {
    const focus = sel.focusNode.nodeType === 1 ? sel.focusNode : sel.focusNode.parentElement
    const lineEl = focus?.closest('.line')
    if (lineEl) {
      ln = allLines().indexOf(lineEl) + 1
      const r = document.createRange()
      r.setStart(lineEl, 0)
      r.setEnd(sel.focusNode, sel.focusOffset)
      col = r.toString().length + 1
      markCurrent(lineEl)
    }
    picked = sel.toString().length
  } else return
  cursorPos.textContent = `Ln ${Math.max(ln, 1)}, Col ${col}${picked ? ` (${picked} selected)` : ''}`
}
document.addEventListener('selectionchange', updateCursor)
draft.addEventListener('input', updateCursor)
draft.addEventListener('focus', updateCursor)
cursorPos.addEventListener('click', () => openQuick(':'))
