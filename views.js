const views = (() => {
  const $ = (id) => document.getElementById(id)
  const el = (tag, className, ...children) => {
    const node = document.createElement(tag)
    if (className) node.className = className
    node.append(...children.filter((c) => c != null && c !== false))
    return node
  }
  const isWin = () => document.body.classList.contains('win')
  const recent = () => listed()

  const EXTENSIONS = [
    { id: 'ms-python.python', name: 'Python', pub: 'Microsoft', desc: 'Python language support with extension access points for IntelliSense (Pylance), Debugging (Python Debugger), linting, formatting, refactoring, unit tests, and more.', abbr: 'Py', color: '#3572a5', installs: '161.9M', langs: ['python'] },
    { id: 'ms-python.vscode-pylance', name: 'Pylance', pub: 'Microsoft', desc: 'A performant, feature-rich language server for Python in VS Code', abbr: 'Pl', color: '#2b5b84', installs: '130.4M', langs: ['python'] },
    { id: 'ms-python.debugpy', name: 'Python Debugger', pub: 'Microsoft', desc: 'Python Debugger extension using debugpy.', abbr: 'Py', color: '#4b8bbe', installs: '78.1M', langs: ['python'] },
    { id: 'charliermarsh.ruff', name: 'Ruff', pub: 'Astral Software', desc: 'A Visual Studio Code extension with support for the Ruff linter and formatter.', abbr: 'Rf', color: '#d7ff64', fg: '#261230', installs: '4.2M', langs: ['python'] },
    { id: 'batisteo.vscode-django', name: 'Django', pub: 'Baptiste Darthenay', desc: 'Beautiful syntax and scoped snippets for perfectionists with deadlines', abbr: 'Dj', color: '#0c4b33', installs: '4.9M', templates: ['django'] },
    { id: 'ms-dotnettools.csharp', name: 'C#', pub: 'Microsoft', desc: 'Base language support for C#', abbr: 'C#', color: '#68217a', installs: '38.6M', langs: ['csharp'] },
    { id: 'ms-dotnettools.csdevkit', name: 'C# Dev Kit', pub: 'Microsoft', desc: 'Official C# extension from Microsoft', abbr: 'C#', color: '#512bd4', installs: '9.8M', langs: ['csharp'] },
    { id: 'visualstudiotoolsforunity.vstuc', name: 'Unity', pub: 'Microsoft', desc: 'Integrates Visual Studio Code for Unity', abbr: 'U', color: '#222c37', installs: '3.1M', templates: ['unity'] },
    { id: 'ms-vscode.cpptools', name: 'C/C++', pub: 'Microsoft', desc: 'C/C++ IntelliSense, debugging, and code browsing.', abbr: 'C', color: '#00599c', installs: '79.0M', langs: ['c', 'cpp'] },
    { id: 'ms-vscode.cmake-tools', name: 'CMake Tools', pub: 'Microsoft', desc: 'Extended CMake support in Visual Studio Code', abbr: 'CM', color: '#064f8c', installs: '27.7M', templates: ['cpp'] },
    { id: 'marus25.cortex-debug', name: 'Cortex-Debug', pub: 'marus25', desc: 'ARM Cortex-M GDB Debugger support for VSCode', abbr: 'Cx', color: '#0091bd', installs: '1.4M', templates: ['c'] },
    { id: 'vscjava.vscode-java-pack', name: 'Extension Pack for Java', pub: 'Microsoft', desc: 'Popular extensions for Java development that provides Java IntelliSense, debugging, testing, Maven/Gradle support, project management and more', abbr: 'J', color: '#e76f00', installs: '30.1M', langs: ['java'] },
    { id: 'vmware.vscode-boot-dev-pack', name: 'Spring Boot Extension Pack', pub: 'VMware', desc: 'A collection of extensions for developing Spring Boot applications', abbr: 'Sb', color: '#6db33f', installs: '6.4M', templates: ['spring'] },
    { id: 'dbaeumer.vscode-eslint', name: 'ESLint', pub: 'Microsoft', desc: 'Integrates ESLint JavaScript into VS Code.', abbr: 'ES', color: '#4b32c3', installs: '41.3M', langs: ['javascript', 'typescript'] },
    { id: 'bradlc.vscode-tailwindcss', name: 'Tailwind CSS IntelliSense', pub: 'Tailwind Labs', desc: 'Intelligent Tailwind CSS tooling for VS Code', abbr: 'Tw', color: '#0ea5e9', installs: '11.8M', templates: ['nextjs', 'react', 'laravel'] },
    { id: 'dsznajder.es7-react-js-snippets', name: 'ES7+ React/Redux/React-Native snippets', pub: 'dsznajder', desc: 'Extensions for React, React-Native and Redux in JS/TS with ES7+ syntax.', abbr: 'R', color: '#20232a', fg: '#61dafb', installs: '15.2M', templates: ['react', 'nextjs'] },
    { id: 'vue.volar', name: 'Vue - Official', pub: 'Vue', desc: 'Language Support for Vue', abbr: 'V', color: '#35495e', fg: '#41b883', installs: '8.1M', templates: ['vue'] },
    { id: 'prisma.prisma', name: 'Prisma', pub: 'Prisma', desc: 'Adds syntax highlighting, formatting, auto-completion, jump-to-definition and linting for .prisma files.', abbr: 'Pr', color: '#0c344b', installs: '4.6M', templates: ['node-backend'] },
    { id: 'golang.go', name: 'Go', pub: 'Go Team at Google', desc: 'Rich Go language support for Visual Studio Code', abbr: 'Go', color: '#00add8', installs: '13.2M', langs: ['go'] },
    { id: 'rust-lang.rust-analyzer', name: 'rust-analyzer', pub: 'The Rust Programming Language', desc: 'Rust language support for Visual Studio Code', abbr: 'Rs', color: '#000000', installs: '4.8M', langs: ['rust'] },
    { id: 'tamasfe.even-better-toml', name: 'Even Better TOML', pub: 'tamasfe', desc: 'Fully-featured TOML support', abbr: 'T', color: '#9c4221', installs: '5.4M', templates: ['rust', 'python-backend'] },
    { id: 'vadimcn.vscode-lldb', name: 'CodeLLDB', pub: 'Vadim Chugunov', desc: 'A native debugger powered by LLDB. Debug C++, Rust and other compiled languages.', abbr: 'LL', color: '#3c3c3c', installs: '3.7M', langs: ['rust'] },
    { id: 'fwcd.kotlin', name: 'Kotlin', pub: 'fwcd', desc: 'Kotlin language support for VSCode', abbr: 'K', color: '#7f52ff', installs: '2.9M', langs: ['kotlin'] },
    { id: 'swiftlang.swift-vscode', name: 'Swift', pub: 'Swift Server Work Group', desc: 'Swift Language Support for Visual Studio Code.', abbr: 'Sw', color: '#f05138', installs: '1.1M', langs: ['swift'] },
    { id: 'dart-code.dart-code', name: 'Dart', pub: 'Dart Code', desc: 'Dart language support and debugger for Visual Studio Code.', abbr: 'D', color: '#0175c2', installs: '9.6M', langs: ['dart'] },
    { id: 'dart-code.flutter', name: 'Flutter', pub: 'Dart Code', desc: 'Flutter support and debugger for Visual Studio Code.', abbr: 'Fl', color: '#02569b', installs: '9.4M', templates: ['flutter'] },
    { id: 'bmewburn.vscode-intelephense-client', name: 'PHP Intelephense', pub: 'Ben Mewburn', desc: 'PHP code intelligence for Visual Studio Code', abbr: 'Ph', color: '#777bb3', installs: '13.5M', langs: ['php'] },
    { id: 'shopify.ruby-lsp', name: 'Ruby LSP', pub: 'Shopify', desc: 'VS Code plugin for connecting with the Ruby LSP', abbr: 'Rb', color: '#cc342d', installs: '1.9M', langs: ['ruby'] },
    { id: 'sumneko.lua', name: 'Lua', pub: 'sumneko', desc: 'Lua Language Server coded by Lua', abbr: 'Lu', color: '#000080', installs: '6.2M', langs: ['lua'] },
    { id: 'ms-azuretools.vscode-docker', name: 'Docker', pub: 'Microsoft', desc: 'Makes it easy to create, manage, and debug containerized applications.', abbr: 'Dk', color: '#2496ed', installs: '42.4M', files: ['Dockerfile', 'docker-compose.yml'] },
    { id: 'eamodio.gitlens', name: 'GitLens — Git supercharged', pub: 'GitKraken', desc: 'Supercharge Git within VS Code — Visualize code authorship at a glance via Git blame annotations and CodeLens.', abbr: 'GL', color: '#212121', fg: '#7aa6da', installs: '37.8M', all: true },
    { id: 'esbenp.prettier-vscode', name: 'Prettier - Code formatter', pub: 'Prettier', desc: 'Code formatter using prettier', abbr: 'Pt', color: '#1a2b34', fg: '#f7b93e', installs: '50.6M', all: true },
    { id: 'editorconfig.editorconfig', name: 'EditorConfig for VS Code', pub: 'EditorConfig', desc: 'EditorConfig Support for Visual Studio Code', abbr: 'EC', color: '#444444', installs: '9.7M', all: true },
    { id: 'usernamehw.errorlens', name: 'Error Lens', pub: 'Alexander', desc: 'Improve highlighting of errors, warnings and other language diagnostics.', abbr: 'EL', color: '#c74e39', installs: '8.9M', all: true },
    { id: 'github.vscode-pull-request-github', name: 'GitHub Pull Requests', pub: 'GitHub', desc: 'Pull Request and Issue Provider for GitHub', abbr: 'GH', color: '#24292e', installs: '22.6M', all: true },
    { id: 'christian-kohler.path-intellisense', name: 'Path Intellisense', pub: 'Christian Kohler', desc: 'Visual Studio Code plugin that autocompletes filenames', abbr: 'Pa', color: '#2e7d32', installs: '13.1M', recommend: true },
    { id: 'redhat.vscode-yaml', name: 'YAML', pub: 'Red Hat', desc: 'YAML Language Support by Red Hat, with built-in Kubernetes syntax support', abbr: 'Y', color: '#cb171e', installs: '25.3M', recommend: true },
    { id: 'ms-vscode-remote.remote-containers', name: 'Dev Containers', pub: 'Microsoft', desc: 'Open any folder or repository inside a Docker container and take advantage of Visual Studio Code\'s full feature set.', abbr: 'DC', color: '#0e639c', installs: '27.4M', recommend: true },
  ]

  const usedLangs = () => {
    const set = new Set()
    for (const f of [...ws.files, ...Object.values(ws.threads)]) {
      const type = langs.of(f)
      if (type.code) set.add(type.id)
    }
    return set
  }
  const installed = () => {
    const used = usedLangs()
    const names = new Set(ws.files.map((f) => workspace.base(f)))
    return EXTENSIONS.filter((x) => x.all || x.langs?.some((l) => used.has(l)) || x.templates?.includes(ws.template) || x.files?.some((f) => names.has(f)))
  }

  function extIcon(x) {
    const box = el('div', 'ext-icon', x.abbr)
    box.style.background = x.color
    if (x.fg) box.style.color = x.fg
    return box
  }

  function drawExtensions() {
    const q = $('ext-search').value.trim().toLowerCase()
    const mine = installed()
    const hit = (x) => !q || x.name.toLowerCase().includes(q) || x.pub.toLowerCase().includes(q) || x.desc.toLowerCase().includes(q)
    const item = (x, isInstalled) => {
      const row = el(
        'div',
        'ext' + (opened.kind === 'page' && opened.id === 'ext:' + x.id ? ' active' : ''),
        extIcon(x),
        el(
          'div',
          'ext-text',
          el('div', 'ext-name', x.name, isInstalled ? null : el('small', '', '⤓ ' + x.installs)),
          el('div', 'ext-desc', x.desc),
          el('div', 'ext-pub', el('span', '', x.pub), isInstalled ? icon('gear') : el('span', '', 'Install')),
        ),
      )
      row.addEventListener('click', () => openPage('ext:' + x.id))
      return row
    }
    const shown = mine.filter(hit)
    $('ext-count').textContent = shown.length
    $('ext-installed').replaceChildren(...shown.map((x) => item(x, true)))
    $('ext-recommended').replaceChildren(...EXTENSIONS.filter((x) => !mine.includes(x) && hit(x)).slice(0, 6).map((x) => item(x, false)))
  }

  let changesKey = ''
  let announced = null
  let badged = -1
  const badgeCanvas = Object.assign(document.createElement('canvas'), { width: 32, height: 32 })
  function sendBadge(n) {
    if (n === badged) return
    badged = n
    const g = badgeCanvas.getContext('2d')
    g.clearRect(0, 0, 32, 32)
    if (n) {
      g.fillStyle = '#0078d4'
      g.beginPath()
      g.arc(16, 16, 15, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#fff'
      g.font = `bold ${n > 9 ? 16 : 20}px Segoe UI, sans-serif`
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillText(n > 9 ? '9+' : String(n), 16, 17)
    }
    window.native?.badge(n, badgeCanvas.toDataURL())
    $('bell').className = 'codicon codicon-' + (n ? 'bell-dot' : 'bell')
  }

  const toasts = el('div', 'toasts')
  document.body.append(toasts)
  let lastToast = null
  function toast(message, actions = [], source = 'Git') {
    lastToast = [message, actions, source]
    const close = icon('close')
    const box = el(
      'div',
      'toast',
      el('div', 'toast-main', icon('info', '#3794ff'), el('span', 'toast-text', message), close),
      el('div', 'toast-foot', el('span', 'toast-source', `Source: ${source}`), el('span', 'toast-actions', ...actions.map(([label, run]) => {
        const b = el('button', 'toast-button', label)
        b.addEventListener('click', () => {
          box.remove()
          run()
        })
        return b
      }))),
    )
    close.addEventListener('click', () => box.remove())
    toasts.replaceChildren(box)
    setTimeout(() => box.remove(), 10000)
  }
  function announce(names) {
    if (announced === null) {
      announced = new Set(names)
      return
    }
    const added = names.filter((n) => !announced.has(n) && n !== showing.thread)
    announced = new Set(names)
    if (!added.length) return
    const p = ws.threads[added[0]]
    toast(added.length === 1 ? `Incoming changes in ${workspace.base(p)}. Pull to update your working tree.` : `${added.length} files have incoming changes.`, [
      ['Show Changes', () => showView('scm')],
      ...(added.length === 1 ? [['Open File', () => openThread(added[0])]] : []),
    ])
  }

  function drawChanges() {
    const fresh = workspace.unread(ws, snap.threads, snap.previews)
    const names = recent().filter((n) => fresh.has(n) && ws.threads[n])
    sendBadge(names.length)
    if (snap.ok) announce(names)
    const key = JSON.stringify(names.map((n) => ws.threads[n]))
    if (key === changesKey) return
    if (pressing && $('changes').matches(':hover')) return setTimeout(drawChanges, 150)
    changesKey = key
    $('changes-count').textContent = names.length || ''
    const badge = $('scm-badge')
    badge.hidden = !names.length
    badge.textContent = names.length
    $('commit').classList.toggle('dim', !names.length)
    $('changes').replaceChildren(
      ...names.map((n) => {
        const p = ws.threads[n]
        const row = el('div', 'row', fileIcon(p), el('span', 'label', workspace.base(p)), el('span', 'dir', workspace.dir(p)), el('span', 'letter m', 'M'))
        row.style.paddingLeft = '20px'
        row.tabIndex = -1
        row.addEventListener('click', () => openThread(n))
        return row
      }),
    )
  }

  function commit() {
    const fresh = workspace.unread(ws, snap.threads, snap.previews)
    if (!fresh.size) return
    snap.threads.forEach((n, i) => fresh.has(n) && (ws.seen[n] = workspace.signature(snap.previews?.[i])))
    $('commit-message').value = ''
    save()
    drawTree()
    log('output', `[info] Committed ${fresh.size} file(s) to main`)
  }

  let searchTimer = null
  function drawSearch() {
    const raw = $('search-input').value.trim()
    const q = raw.toLowerCase()
    const results = $('search-results')
    if (!q) {
      $('search-summary').textContent = ''
      return results.replaceChildren()
    }
    const mark = (text) => {
      const at = text.toLowerCase().indexOf(q)
      if (at < 0) return [text]
      const start = Math.max(0, at - 24)
      return [(start ? '…' : '') + text.slice(start, at).trimStart(), el('mark', '', text.slice(at, at + q.length)), text.slice(at + q.length, at + q.length + 60)]
    }
    const groups = []
    for (const name of recent()) {
      const p = ws.threads[name]
      if (!p) continue
      const hits = []
      if (name === showing.thread) {
        const lang = langs.of(p).code ? langs.of(p).id : 'python'
        camo(snap.rows, 0, null, lang).forEach((l) => {
          const text = camo.text(l)
          if (l.kind !== 'code' && text.toLowerCase().includes(q)) hits.push({ text })
        })
      }
      if (hits.length || p.toLowerCase().includes(q) || name.toLowerCase().includes(q) || roman.words(name).join('').includes(q.replace(/[\s_]/g, ''))) groups.push({ path: p, hits, open: () => openThread(name) })
    }
    for (const f of ws.files) {
      if (f === ws.readme) continue
      const hits = (workspace.content(ws, f) ?? [])
        .map((text, line) => ({ text, line }))
        .filter((h) => h.text.toLowerCase().includes(q))
      if (hits.length || f.toLowerCase().includes(q)) groups.push({ path: f, hits, open: (line) => jump(f, line) })
    }
    const total = groups.reduce((n, g) => n + Math.max(g.hits.length, 1), 0)
    $('search-summary').textContent = groups.length ? `${total} result${total > 1 ? 's' : ''} in ${groups.length} file${groups.length > 1 ? 's' : ''}` : 'No results found. Review your settings for configured exclusions and check your gitignore files.'
    results.replaceChildren(
      ...groups.flatMap((g) => {
        const head = el('div', 'row', icon('chevron-down'), fileIcon(g.path), el('span', 'label', workspace.base(g.path)), el('span', 'dir', workspace.dir(g.path)), g.hits.length ? el('span', 'count-chip', String(g.hits.length)) : null)
        head.style.paddingLeft = '8px'
        head.addEventListener('click', () => g.open())
        return [
          head,
          ...g.hits.slice(0, 20).map((h) => {
            const row = el('div', 'row hit', ...mark(h.text.trim()))
            row.addEventListener('click', () => g.open(h.line))
            return row
          }),
        ]
      }),
    )
  }

  function jump(file, line) {
    reveal(workspace.dir(file))
    openFile(file)
    if (line == null) return
    requestAnimationFrame(() => {
      const target = document.querySelectorAll('#lines .line')[line]
      target?.scrollIntoView({ block: 'center' })
      target?.animate([{ background: '#264f78' }, { background: 'transparent' }], { duration: 1200 })
    })
  }

  let outlineKey = ''
  function drawOutline(force = false) {
    const box = $('outline')
    const open = !box.hidden
    $('outline-head').firstElementChild.className = 'codicon codicon-chevron-' + (open ? 'down' : 'right')
    $('outline-head').classList.toggle('collapsed', !open)
    $('outline-count').textContent = people?.length || ''
    if (!open) return
    if (people === null) loadPeople()
    const q = $('outline-filter').value.trim().toLowerCase()
    const key = `${people?.length}:${q}`
    if (!force && key === outlineKey) return
    outlineKey = key
    if (people === null) return $('outline-list').replaceChildren(el('div', 'row', icon('loading codicon-modifier-spin'), el('span', 'label', 'Loading symbols...')))
    const squash = q.replace(/[\s_]/g, '')
    const hit = (p) => !q || p.username.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || roman.words(p.name).join('').includes(squash)
    const found = people.filter(hit).sort((a, b) => (b.following && b.followers) - (a.following && a.followers))
    if (!found.length) return $('outline-list').replaceChildren(el('div', 'row', el('span', 'dir', people.length ? 'No symbols match.' : 'No symbols found.')))
    $('outline-list').replaceChildren(
      ...found.slice(0, 300).map((p) => {
        const row = el('div', 'row', icon('symbol-variable', '#75beff'), el('span', 'label', p.username), el('span', 'dir', p.name))
        row.tabIndex = -1
        row.title = `${p.username}  ${p.name}`
        row.addEventListener('click', () => openDm(p))
        return row
      }),
    )
  }
  $('outline-head').addEventListener('click', () => {
    $('outline').hidden = !$('outline').hidden
    drawOutline(true)
    if (!$('outline').hidden) $('outline-filter').focus()
  })
  $('outline-filter').addEventListener('input', () => drawOutline())

  function help() {
    return [
      ['', 'Go to File', 'Search files by name, including chat files'],
      ['@', 'Go to Symbol', 'Find a follower or following and open a DM'],
      ['>', 'Show and Run Commands', 'Command palette'],
    ].map(([prefix, label, desc]) => ({ icon: el('span', 'help-prefix', prefix || '…'), label, desc, run: () => setTimeout(() => openQuick(prefix)) }))
  }

  let viewName = 'explorer'
  function showView(name, toggle = false) {
    if (toggle && name === viewName && !sidebar.hidden) return toggleSidebar(false)
    viewName = name
    document.querySelectorAll('.sidebar .view').forEach((v) => (v.hidden = v.dataset.view !== name))
    document.querySelectorAll('.activitybar [data-view]').forEach((b) => b.classList.toggle('current', b.dataset.view === name))
    document.querySelectorAll('.activitybar [data-view]').forEach((b) => b.classList.remove('active'))
    toggleSidebar(true)
    if (name === 'search') $('search-input').focus()
    if (name === 'extensions') drawExtensions()
    if (name === 'scm') drawChanges()
  }

  const panel = $('panel')
  const body = $('panel-body')
  const buffers = { problems: [], output: [], debug: [], terminal: [], ports: [] }
  let tab = 'terminal'
  let cwd = ''
  const history = []
  let back = 0

  const shellName = () => (isWin() ? 'powershell' : 'zsh')
  const prompt = () =>
    isWin() ? `PS C:\\Users\\dev\\source\\${ws.root}${cwd ? '\\' + cwd.replaceAll('/', '\\') : ''}> ` : `dev@MacBook-Pro ${cwd ? workspace.base(cwd) : ws.root} % `

  function log(where, text, cls) {
    buffers[where].push([text, cls])
    if (buffers[where].length > 500) buffers[where].shift()
    if (!panel.hidden && tab === where) drawPanel()
  }

  function drawPanel() {
    document.querySelectorAll('.panel-tabs [data-panel]').forEach((b) => b.classList.toggle('on', b.dataset.panel === tab))
    $('shell-name').textContent = tab === 'terminal' ? shellName() : ''
    const lines = buffers[tab].map(([text, cls]) => el('div', cls ?? '', text))
    if (tab === 'problems' && !lines.length) lines.push(el('div', 'note', 'No problems have been detected in the workspace.'))
    if (tab === 'ports' && !lines.length) lines.push(el('div', 'note', 'No forwarded ports. Forward a port to access your running services locally.'))
    if (tab === 'debug' && !lines.length) lines.push(el('div', 'note', 'Start a debug session to see output here.'))
    if (tab === 'terminal') {
      const input = Object.assign(document.createElement('input'), { id: 'term-input', spellcheck: false, autocomplete: 'off' })
      input.addEventListener('keydown', onTerminalKey)
      lines.push(el('div', 'prompt-line', el('span', '', prompt()), input))
    }
    body.replaceChildren(...lines)
    body.scrollTop = body.scrollHeight
    if (tab === 'terminal') $('term-input').focus({ preventScroll: true })
  }

  function showPanel(which = tab, toggle = false) {
    if (toggle && !panel.hidden && which === tab) return hidePanel()
    tab = which
    panel.hidden = false
    $('toggle-panel').firstElementChild.className = 'codicon codicon-layout-panel'
    if (tab === 'terminal' && !buffers.terminal.length) greet()
    drawPanel()
  }
  function hidePanel() {
    panel.hidden = true
    $('toggle-panel').firstElementChild.className = 'codicon codicon-layout-panel-off'
    if (showing.thread) draft.focus()
  }

  function greet() {
    if (isWin()) {
      log('terminal', 'Windows PowerShell')
      log('terminal', 'Copyright (C) Microsoft Corporation. All rights reserved.')
      log('terminal', '')
      log('terminal', 'Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows')
      log('terminal', '')
    }
  }

  const RUNTIME = {
    python: ['Python 3.13.5', 'python', 'pytest'],
    csharp: ['8.0.404', 'dotnet', 'dotnet test'],
    cpp: ['cmake version 3.30.3', 'cmake', 'ctest'],
    c: ['arm-none-eabi-gcc 13.2.1', 'make', 'make test'],
    java: ['openjdk 21.0.4 2024-07-16 LTS', 'java', 'mvn test'],
    javascript: ['v22.18.0', 'node', 'npm test'],
    typescript: ['v22.18.0', 'node', 'npm test'],
    go: ['go version go1.23.2 windows/amd64', 'go', 'go test ./...'],
    rust: ['rustc 1.82.0 (f6e511eec 2024-10-15)', 'rustc', 'cargo test'],
    kotlin: ['Gradle 8.10.2', 'gradle', './gradlew test'],
    swift: ['Apple Swift version 6.0.2', 'swift', 'swift test'],
    dart: ['Flutter 3.24.3 • channel stable', 'flutter', 'flutter test'],
    php: ['PHP 8.3.12 (cli)', 'php', 'php artisan test'],
    ruby: ['ruby 3.3.0 (2023-12-25 revision 5124f9ac75)', 'ruby', 'bundle exec rspec'],
    lua: ['LOVE 11.5 (Mysterious Mysteries)', 'love', 'busted'],
  }
  const mainLang = () => langs.of('x.' + templates.get(ws.template).chat).id

  function testRun(where) {
    const files = ws.files.filter((f) => /(^|\/)(tests?|spec|__tests__)\//i.test(f) || /test/i.test(workspace.base(f))).slice(0, 6)
    const n = 12 + (camo.hash(ws.root) % 30)
    const ms = 400 + (camo.hash(ws.template) % 2000)
    for (const f of files) log(where, ` ✓ ${f}`, 'ok')
    log(where, '')
    log(where, `  ${n} passed in ${(ms / 1000).toFixed(2)}s`, 'ok')
  }

  function runCommand(line) {
    log('terminal', prompt() + line)
    const [cmd, ...args] = line.trim().split(/\s+/)
    const arg = args.join(' ')
    const notFound = () =>
      isWin()
        ? [`${cmd} : The term '${cmd}' is not recognized as the name of a cmdlet, function, script file, or operable program.`, 'Check the spelling of the name, or if a path was included, verify that the path is correct and try again.'].forEach((t) => log('terminal', t, 'err'))
        : log('terminal', `zsh: command not found: ${cmd}`, 'err')
    const lang = mainLang()
    const [version, bin, test] = RUNTIME[lang] ?? RUNTIME.python
    const resolve = (target) => {
      if (!target || target === '~') return ''
      const parts = (target.startsWith('/') ? [] : cwd.split('/').filter(Boolean))
      for (const part of target.replaceAll('\\', '/').split('/').filter(Boolean)) {
        if (part === '..') parts.pop()
        else if (part !== '.') parts.push(part)
      }
      return parts.join('/')
    }
    switch ((cmd ?? '').toLowerCase()) {
      case '':
        break
      case 'clear':
      case 'cls':
        buffers.terminal = []
        break
      case 'exit':
        hidePanel()
        break
      case 'help':
        log('terminal', 'Available: ls, cd, pwd, cat, git status, git log, git branch, echo, clear, exit, ' + test)
        break
      case 'pwd':
        log('terminal', isWin() ? `C:\\Users\\dev\\source\\${ws.root}${cwd ? '\\' + cwd.replaceAll('/', '\\') : ''}` : `/Users/dev/${ws.root}${cwd ? '/' + cwd : ''}`)
        break
      case 'ls':
      case 'dir':
      case 'gci': {
        const target = resolve(arg)
        if (!workspace.isFolder(ws, target)) return log('terminal', `ls: ${arg}: No such file or directory`, 'err')
        const kids = workspace.children(ws, target, listed())
        if (isWin()) {
          log('terminal', '')
          log('terminal', `    Directory: C:\\Users\\dev\\source\\${ws.root}${target ? '\\' + target.replaceAll('/', '\\') : ''}`)
          log('terminal', '')
          log('terminal', 'Mode                 LastWriteTime         Length Name')
          log('terminal', '----                 -------------         ------ ----')
          for (const k of kids) log('terminal', `${k.folder ? 'd----' : '-a---'}          2024-11-02  오후 3:14 ${k.folder ? '               ' : String(200 + (camo.hash(k.path) % 9000)).padStart(14, ' ') + ' '}${k.name}`)
          log('terminal', '')
        } else log('terminal', kids.map((k) => k.name + (k.folder ? '/' : '')).join('  '), 'info')
        break
      }
      case 'cd':
      case 'set-location': {
        const target = resolve(arg)
        if (workspace.isFolder(ws, target)) cwd = target
        else log('terminal', isWin() ? `cd : Cannot find path '${arg}' because it does not exist.` : `cd: no such file or directory: ${arg}`, 'err')
        break
      }
      case 'cat':
      case 'type':
      case 'get-content': {
        const target = resolve(arg)
        if (ws.files.includes(target) && target !== ws.readme) (workspace.content(ws, target) ?? ['(binary file)']).forEach((t) => log('terminal', t))
        else if (workspace.threadAt(ws, target) !== undefined) log('terminal', `cat: ${arg}: Permission denied`, 'err')
        else log('terminal', `cat: ${arg}: No such file or directory`, 'err')
        break
      }
      case 'echo':
      case 'write-output':
        log('terminal', arg.replace(/^["']|["']$/g, ''))
        break
      case 'git': {
        const sub = args[0]
        if (sub === 'status') {
          const fresh = workspace.unread(ws, snap.threads, snap.previews)
          const changed = recent().filter((n) => fresh.has(n) && ws.threads[n])
          log('terminal', 'On branch main')
          log('terminal', "Your branch is up to date with 'origin/main'.")
          log('terminal', '')
          if (!changed.length) log('terminal', 'nothing to commit, working tree clean')
          else {
            log('terminal', 'Changes not staged for commit:')
            log('terminal', '  (use "git add <file>..." to update what will be committed)')
            for (const n of changed) log('terminal', `\tmodified:   ${ws.threads[n]}`, 'err')
          }
        } else if (sub === 'log') {
          const msgs = ['fix: handle empty payload', 'refactor: extract service layer', 'feat: add pagination', 'chore: bump dependencies', 'test: cover edge cases', 'docs: update README']
          msgs.forEach((m, i) => {
            const sha = (camo.hash(ws.root + i) >>> 0).toString(16).padStart(8, '0').slice(0, 7)
            log('terminal', `${sha} ${i ? '' : '(HEAD -> main, origin/main) '}${m}`, i ? null : 'info')
          })
        } else if (sub === 'branch') log('terminal', '* main', 'ok')
        else if (sub === 'pull') log('terminal', 'Already up to date.')
        else log('terminal', `git: '${sub ?? ''}' is not a git command. See 'git --help'.`, 'err')
        break
      }
      default: {
        if (line.trim() === test || ['pytest', 'npm', 'yarn', 'pnpm', 'cargo', 'make', 'dotnet', 'mvn', 'flutter', 'bundle', 'busted', 'swift', 'ctest'].includes(cmd) && /test|spec/.test(line)) testRun('terminal')
        else if (/^(python3?|node|go|rustc|dotnet|java|cmake|flutter|php|ruby|love|swift|gradle)$/.test(cmd) && /^(-v|--version|version|-version)$/.test(args[0] ?? '')) log('terminal', version)
        else if (cmd === 'code') break
        else notFound()
      }
    }
  }

  function onTerminalKey(e) {
    const input = e.target
    if (e.isComposing) return
    if (e.key === 'Enter') {
      const line = input.value
      if (line.trim()) history.push(line)
      back = 0
      runCommand(line)
      drawPanel()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      back = Math.max(0, Math.min(history.length, back + (e.key === 'ArrowUp' ? 1 : -1)))
      input.value = back ? history[history.length - back] : ''
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      buffers.terminal = []
      drawPanel()
    } else if (e.key === 'Escape') {
      hidePanel()
    }
  }

  function runDebug() {
    const lang = mainLang()
    const [, bin] = RUNTIME[lang] ?? RUNTIME.python
    buffers.debug = []
    showPanel('debug')
    const port = { python: 8000, javascript: 3000, typescript: 3000, java: 8080, go: 8080, csharp: 5080, php: 8000, ruby: 3000, rust: 8080 }[lang]
    log('debug', `Launching ${bin} (${templates.get(ws.template).label})...`, 'info')
    if (port) {
      log('debug', `INFO:     Started server process [${12000 + (camo.hash(ws.root) % 9000)}]`)
      log('debug', 'INFO:     Waiting for application startup.')
      log('debug', 'INFO:     Application startup complete.')
      log('debug', `INFO:     Listening on http://127.0.0.1:${port} (Press CTRL+C to quit)`, 'ok')
      buffers.ports = [[`${port}    http://localhost:${port}    Auto Forwarded`]]
    } else {
      log('debug', 'Build succeeded.', 'ok')
      log('debug', 'Process started. Waiting for debugger to attach...')
    }
  }

  function createLaunch() {
    const p = ws.files.includes('.vscode/launch.json') ? '.vscode/launch.json' : workspace.create(ws, '.vscode/launch.json', false)
    if (!p) return
    reveal('.vscode')
    save()
    openFile(p)
  }

  const page = { key: null }
  function openPage(id) {
    opened = { kind: 'page', id }
    render()
    if (viewName === 'extensions') drawExtensions()
  }

  function setting(label, sub, desc, control) {
    return el('div', 'setting', el('b', '', label, el('span', '', sub)), el('p', '', desc), control)
  }
  function select(options, value, onChange) {
    const s = document.createElement('select')
    for (const [v, text] of options) s.append(Object.assign(document.createElement('option'), { value: v, textContent: text, selected: String(v) === String(value) }))
    s.addEventListener('change', () => onChange(s.value))
    return s
  }

  function renderPage(id, root) {
    const key = `${id}:${version}:${level}`
    if (page.key === key) return pageMeta(id)
    page.key = key
    if (id === 'watermark') {
      const rows = [['Show All Commands', 'Ctrl+Shift+P'], ['Go to File', 'Ctrl+P'], ['Find in Files', 'Ctrl+Shift+F'], ['Toggle Terminal', 'Ctrl+`'], ['Open Settings', 'Ctrl+,']]
      root.replaceChildren(el('div', 'watermark', ...rows.map(([label, keys]) => el('div', 'wm-row', el('span', '', label), el('span', '', ...keys.split('+').flatMap((k, i) => (i ? ['+', el('kbd', '', k)] : [el('kbd', '', k)])))))))
    } else if (id === 'settings') {
      const title = Object.assign(document.createElement('input'), { type: 'text', value: ws.root })
      title.addEventListener('change', () => {
        const name = title.value.trim()
        if (!name || name.includes('/')) return (title.value = ws.root)
        ws.root = name
        save()
        drawTree()
      })
      root.replaceChildren(
        el('h1', '', 'Settings'),
        el('p', 'muted', 'User'),
        el('h3', '', 'Commonly Used'),
        setting('Editor: ', 'Tab Size', 'How much surrounding code is mixed in between lines. 0 shows the lines only.', select(camo.LEVELS.map((l) => [l, String(l)]), level, (v) => setLevel(Number(v)))),
        setting('Files: ', 'Naming', 'How chat files are named.', select([['name', 'From contact name (falls back to the ID)'], ['module', 'Generic module names']], ws.naming ?? 'name', (v) => setChats({ naming: v }))),
        setting('Explorer: ', 'Sort Order', 'Order of chat files inside a folder.', select([['recent', 'Recent activity'], ['name', 'Name']], ws.sort ?? 'recent', (v) => setChats({ sort: v }))),
        el('h3', '', 'Workbench'),
        setting('Workbench: ', 'Project Template', 'Folder and file layout shown in the Explorer.', select(templates.LIST.map((t) => [t.id, t.label]), ws.template, (v) => useTemplate(v))),
        setting('Window: ', 'Title', 'Project name shown in the title bar and Explorer.', title),
      )
    } else if (id === 'shortcuts') {
      const rows = [
        ['Go to File', 'Ctrl+P'],
        ['Show All Commands', 'Ctrl+Shift+P'],
        ['Go to Symbol in Workspace', 'Ctrl+Shift+O'],
        ['Close Editor', 'Escape'],
        ['Toggle Primary Side Bar', 'Ctrl+B'],
        ['Switch Editor', 'Ctrl+Tab'],
        ['Next / Previous Editor', 'Ctrl+PageDown'],
        ['Open Editor 1-9', 'Alt+1'],
        ['Close Editor', 'Ctrl+W'],
        ['Reopen Closed Editor', 'Ctrl+Shift+T'],
        ['Go Back / Forward', 'Alt+←'],
        ['Go to Line', 'Ctrl+G'],
        ['Toggle Terminal', 'Ctrl+`'],
        ['Toggle Panel', 'Ctrl+J'],
        ['Show Explorer', 'Ctrl+Shift+E'],
        ['Show Search', 'Ctrl+Shift+F'],
        ['Show Source Control', 'Ctrl+Shift+G'],
        ['Show Run and Debug', 'Ctrl+Shift+D'],
        ['Show Extensions', 'Ctrl+Shift+X'],
        ['Open Settings', 'Ctrl+,'],
        ['New File', 'Ctrl+Alt+N'],
        ['Rename', 'F2'],
        ['Open File...', 'Ctrl+O'],
        ['Go to Definition', 'Ctrl+Click'],
      ]
      root.replaceChildren(
        el('h1', '', 'Keyboard Shortcuts'),
        el('p', 'muted', 'Default keybindings'),
        el('table', '', el('tr', '', el('th', '', 'Command'), el('th', '', 'Keybinding')), ...rows.map(([c, k]) => el('tr', '', el('td', '', c), el('td', '', ...k.split('+').flatMap((p, i) => (i ? ['+', el('kbd', '', p)] : [el('kbd', '', p)])))))),
      )
    } else if (id.startsWith('ext:')) {
      const x = EXTENSIONS.find((e) => 'ext:' + e.id === id)
      const mine = installed().includes(x)
      root.replaceChildren(
        el(
          'div',
          'ext-head',
          extIcon(x),
          el(
            'div',
            '',
            el('h1', '', x.name),
            el('div', 'muted', `${x.pub}  |  ⤓ ${x.installs}  |  ★★★★☆`),
            el('p', '', x.desc),
            el('div', 'buttons', ...(mine ? [el('button', '', 'Disable'), el('button', '', 'Uninstall')] : [el('button', '', 'Install')])),
          ),
        ),
        el('h3', '', 'Details'),
        el('p', '', x.desc),
        el('p', 'muted', `Identifier: ${x.id}`),
      )
    }
    return pageMeta(id)
  }
  function pageMeta(id) {
    if (id === 'watermark') return { title: '', icon: 'blank' }
    if (id === 'settings') return { title: 'Settings', icon: 'settings' }
    if (id === 'shortcuts') return { title: 'Keyboard Shortcuts', icon: 'keyboard' }
    const x = EXTENSIONS.find((e) => 'ext:' + e.id === id)
    return { title: `Extension: ${x?.name ?? ''}`, icon: 'extensions' }
  }

  const COMMANDS = () => [
    ['View: Show Explorer', () => showView('explorer'), 'Ctrl+Shift+E'],
    ['View: Show Search', () => showView('search'), 'Ctrl+Shift+F'],
    ['View: Show Source Control', () => showView('scm'), 'Ctrl+Shift+G'],
    ['View: Show Run and Debug', () => showView('debug'), 'Ctrl+Shift+D'],
    ['View: Show Extensions', () => showView('extensions'), 'Ctrl+Shift+X'],
    ['View: Toggle Terminal', () => showPanel('terminal', true), 'Ctrl+`'],
    ['View: Toggle Panel', () => (panel.hidden ? showPanel() : hidePanel()), 'Ctrl+J'],
    ['View: Toggle Primary Side Bar Visibility', () => toggleSidebar(), 'Ctrl+B'],
    ['View: Close Editor', () => closeTab(), 'Ctrl+W'],
    ['View: Reopen Closed Editor', reopenTab, 'Ctrl+Shift+T'],
    ['View: Open Next Editor', () => stepTab(1), 'Ctrl+PageDown'],
    ['View: Open Previous Editor', () => stepTab(-1), 'Ctrl+PageUp'],
    ['View: Quick Open Previous Recently Used Editor in Group', () => openSwitcher(1), 'Ctrl+Tab'],
    ['Go Back', goBack, 'Alt+←'],
    ['Go Forward', goForward, 'Alt+→'],
    ['Go to Line/Column...', () => setTimeout(() => openQuick(':')), 'Ctrl+G'],
    ['View: Show Problems', () => showPanel('problems')],
    ['View: Show Output', () => showPanel('output')],
    ['Preferences: Open Settings (UI)', () => openPage('settings'), 'Ctrl+,'],
    ['Preferences: Open Keyboard Shortcuts', () => openPage('shortcuts')],
    ['File: New File...', () => create(false), 'Ctrl+Alt+N'],
    ['File: New Folder...', () => create(true)],
    ['Go to Symbol in Workspace...', () => setTimeout(() => openQuick('@')), 'Ctrl+Shift+O'],
    ['View: Show Outline', () => {
      showView('explorer')
      $('outline').hidden = false
      drawOutline(true)
      $('outline-filter').focus()
    }],
    ['Debug: Start Debugging', runDebug, 'F5'],
    ['Git: Commit', commit],
    ['Developer: Toggle Preview', togglePreview],
    ...templates.LIST.map((t) => [`Project: Open Template (${t.label})`, () => useTemplate(t.id)]),
  ]
  function commands(q) {
    return COMMANDS()
      .filter(([label]) => !q || label.toLowerCase().includes(q))
      .map(([label, run, key]) => ({ icon: icon('blank'), label, desc: key ?? '', run }))
  }

  const MENUS = {
    edit: () => [
      ['Undo', () => document.execCommand('undo'), 'Ctrl+Z'],
      ['Redo', () => document.execCommand('redo'), 'Ctrl+Y'],
      null,
      ['Cut', () => document.execCommand('cut'), 'Ctrl+X'],
      ['Copy', () => document.execCommand('copy'), 'Ctrl+C'],
      ['Paste', () => navigator.clipboard?.readText().then((t) => document.execCommand('insertText', false, t)), 'Ctrl+V'],
      null,
      ['Find in Files', () => showView('search'), 'Ctrl+Shift+F'],
    ],
    selection: () => [['Select All', () => document.execCommand('selectAll'), 'Ctrl+A'], ['Expand Selection', () => {}, 'Shift+Alt+→'], ['Shrink Selection', () => {}, 'Shift+Alt+←']],
    view: () => [
      ['Command Palette...', () => openQuick('>'), 'Ctrl+Shift+P'],
      null,
      ['Explorer', () => showView('explorer'), 'Ctrl+Shift+E'],
      ['Search', () => showView('search'), 'Ctrl+Shift+F'],
      ['Source Control', () => showView('scm'), 'Ctrl+Shift+G'],
      ['Run', () => showView('debug'), 'Ctrl+Shift+D'],
      ['Extensions', () => showView('extensions'), 'Ctrl+Shift+X'],
      null,
      ['Problems', () => showPanel('problems'), 'Ctrl+Shift+M'],
      ['Output', () => showPanel('output'), 'Ctrl+Shift+U'],
      ['Debug Console', () => showPanel('debug'), 'Ctrl+Shift+Y'],
      ['Terminal', () => showPanel('terminal'), 'Ctrl+`'],
    ],
    go: () => [
      ['Back', goBack, 'Alt+←'],
      ['Forward', goForward, 'Alt+→'],
      null,
      ['Next Editor', () => stepTab(1), 'Ctrl+PageDown'],
      ['Previous Editor', () => stepTab(-1), 'Ctrl+PageUp'],
      ['Switch Editor...', () => openSwitcher(1), 'Ctrl+Tab'],
      null,
      ['Go to File...', () => openQuick(), 'Ctrl+P'],
      ['Go to Symbol in Workspace...', () => openQuick('@'), 'Ctrl+Shift+O'],
      ['Go to Line/Column...', () => openQuick(':'), 'Ctrl+G'],
    ],
    run: () => [['Start Debugging', runDebug, 'F5'], ['Run Without Debugging', runDebug, 'Ctrl+F5'], null, ['Open Configurations', createLaunch], ['Add Configuration...', createLaunch]],
    terminal: () => [['New Terminal', () => showPanel('terminal'), 'Ctrl+Shift+`'], ['Run Task...', () => { showPanel('terminal'); runCommand(RUNTIME[mainLang()]?.[2] ?? 'npm test'); drawPanel() }], ['Clear Terminal', () => { buffers.terminal = []; showPanel('terminal') }]],
    help: () => [['Show All Commands', () => openQuick('>'), 'Ctrl+Shift+P'], ['Keyboard Shortcuts Reference', () => openPage('shortcuts'), 'Ctrl+K Ctrl+R'], null, ['Get Started', () => openFile(ws.readme)]],
  }

  document.querySelectorAll('.menubar [data-menu]').forEach((button) =>
    button.addEventListener('mousedown', (e) => {
      e.stopPropagation()
      const wasOpen = button.classList.contains('open')
      hideMenu()
      if (wasOpen) return
      const r = button.getBoundingClientRect()
      showMenu(r.left, r.bottom + 2, MENUS[button.dataset.menu]())
      button.classList.add('open')
    }),
  )

  document.querySelectorAll('.activitybar [data-view]').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view, true)))
  const bottomMenu = (button, items) =>
    button.addEventListener('mousedown', (e) => {
      e.stopPropagation()
      if (!menu.hidden) return hideMenu()
      const r = button.getBoundingClientRect()
      showMenu(r.right + 4, r.top, items())
      const m = menu.getBoundingClientRect()
      menu.style.top = Math.max(4, r.bottom - m.height) + 'px'
    })
  bottomMenu($('accounts'), () => ['You are not signed in to any accounts', ['Backup and Sync Settings...', () => openPage('settings')]])
  bottomMenu($('manage'), () => [
    ['Command Palette...', () => openQuick('>'), 'Ctrl+Shift+P'],
    null,
    ['Settings', () => openPage('settings'), 'Ctrl+,'],
    ['Extensions', () => showView('extensions'), 'Ctrl+Shift+X'],
    ['Keyboard Shortcuts', () => openPage('shortcuts'), 'Ctrl+K Ctrl+S'],
    null,
    ['Check for Updates...', () => log('output', '[info] Visual Studio Code is up to date.')],
  ])

  $('bell-button').addEventListener('click', () => {
    if (toasts.children.length) return toasts.replaceChildren()
    if (badged > 0 && lastToast) return toast(...lastToast)
    toast('No new notifications', [], 'Notifications')
  })

  $('search-input').addEventListener('input', () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(drawSearch, 150)
  })
  $('search-input').addEventListener('keydown', (e) => e.key === 'Enter' && drawSearch())
  $('search-clear').addEventListener('click', () => {
    $('search-input').value = ''
    drawSearch()
  })
  $('ext-search').addEventListener('input', drawExtensions)
  $('commit').addEventListener('click', commit)
  $('commit-check').addEventListener('click', commit)
  $('commit-message').addEventListener('keydown', (e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && (e.preventDefault(), commit()))
  $('run-debug').addEventListener('click', runDebug)
  $('create-launch').addEventListener('click', createLaunch)
  $('show-configs').addEventListener('click', () => openQuick('>debug'))
  $('toggle-panel').addEventListener('click', () => (panel.hidden ? showPanel() : hidePanel()))
  $('close-panel').addEventListener('click', hidePanel)
  $('max-panel').addEventListener('click', () => panel.classList.toggle('max'))
  $('new-terminal').addEventListener('click', () => {
    buffers.terminal = []
    cwd = ''
    showPanel('terminal')
  })
  $('clear-panel').addEventListener('click', () => {
    buffers[tab] = []
    drawPanel()
  })
  $('problems-status').addEventListener('click', () => showPanel('problems', true))
  document.querySelectorAll('.panel-tabs [data-panel]').forEach((b) => b.addEventListener('click', () => showPanel(b.dataset.panel)))
  body.addEventListener('mouseup', () => tab === 'terminal' && !getSelection().toString() && $('term-input')?.focus())

  const openTabs = () => tabs.filter((k) => tabInfo(k))
  function stepTab(dir) {
    const list = openTabs()
    if (!list.length) return
    const at = list.indexOf(keyOf(opened))
    openKey(list[(at + dir + list.length) % list.length])
  }

  let switcher = null
  function openSwitcher(dir) {
    if (!switcher) {
      const items = mru.filter((k) => tabs.includes(k) && tabInfo(k))
      if (!items.length) return
      hideMenu()
      switcher = { items, index: 0 }
      quick.classList.add('switcher')
      quick.hidden = false
    }
    switcher.index = (switcher.index + dir + switcher.items.length) % switcher.items.length
    quickList.replaceChildren(
      ...switcher.items.map((k, i) => {
        const info = tabInfo(k)
        const row = el('div', 'item' + (i === switcher.index ? ' on' : ''), info.icon, el('span', '', info.label), el('span', 'dir', workspace.dir(info.title)))
        row.addEventListener('mousedown', (e) => {
          e.preventDefault()
          finishSwitcher(i)
        })
        return row
      }),
    )
    quickList.children[switcher.index]?.scrollIntoView({ block: 'nearest' })
  }
  function closeSwitcher() {
    switcher = null
    quick.classList.remove('switcher')
    quick.hidden = true
  }
  function finishSwitcher(i = switcher?.index) {
    if (!switcher) return
    const k = switcher.items[i]
    closeSwitcher()
    if (k) openKey(k)
  }
  addEventListener('keyup', (e) => switcher && (e.key === 'Control' || e.key === 'Meta') && finishSwitcher())
  addEventListener('blur', () => switcher && closeSwitcher())

  function gotoLine(q) {
    const lines = [...document.querySelectorAll('#lines .line, .code .line.input:not([hidden]), #after .line')]
    const n = parseInt(q, 10)
    if (!lines.length || opened.kind === 'page') return [{ icon: icon('info'), label: 'Open a text editor first to go to a line.' }]
    if (!(n >= 1 && n <= lines.length)) return [{ icon: icon('info'), label: `Current Line: 1. Type a line number between 1 and ${lines.length} to navigate to.` }]
    return [{
      icon: icon('symbol-number'),
      label: `Go to line ${n}.`,
      run() {
        const target = lines[n - 1]
        target.scrollIntoView({ block: 'center' })
        target.animate([{ background: '#264f78' }, { background: 'transparent' }], { duration: 1200 })
        if (target.classList.contains('input')) draft.focus()
      },
    }]
  }

  const suggest = el('div', 'suggest')
  suggest.hidden = true
  document.body.append(suggest)
  let sug = null
  const measure = document.createElement('canvas').getContext('2d')

  function mentionAt() {
    const caret = draft.selectionStart ?? draft.value.length
    const m = draft.value.slice(0, caret).match(/(^|\s)@([\w.가-힣ㄱ-ㅣ]*)$/)
    return m ? { start: caret - m[2].length - 1, caret, query: m[2].toLowerCase() } : null
  }
  function candidates(q) {
    const members = [...new Set([...(ws.members?.[showing.thread] ?? []), ...snap.rows.map((r) => r.who).filter(Boolean)])]
    const known = new Map((people ?? []).map((p) => [p.username, p]))
    const pool = [...members.map((u) => ({ username: u, name: known.get(u)?.name ?? '', member: true })), ...(people ?? []).filter((p) => !members.includes(p.username))]
    const squash = q.replace(/[\s_.]/g, '')
    const starts = (p) => p.username.toLowerCase().startsWith(q) || p.name.toLowerCase().startsWith(q)
    return pool
      .filter((p) => !q || p.username.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || roman.words(p.name).join('').includes(squash))
      .sort((a, b) => (b.member ? 1 : 0) - (a.member ? 1 : 0) || (starts(b) ? 1 : 0) - (starts(a) ? 1 : 0) || (b.following && b.followers ? 1 : 0) - (a.following && a.followers ? 1 : 0))
      .slice(0, 12)
  }
  function closeSuggest() {
    sug = null
    suggest.hidden = true
  }
  function drawSuggest() {
    const at = mentionAt()
    if (!at || !showing.thread || document.activeElement !== draft) return closeSuggest()
    if (people === null) loadPeople()
    const items = candidates(at.query)
    if (!items.length && people !== null) return closeSuggest()
    sug = { ...at, items, index: Math.min(sug?.index ?? 0, Math.max(items.length - 1, 0)) }
    const mark = (text) => {
      const i = at.query ? text.toLowerCase().indexOf(at.query) : -1
      return i < 0 ? [text] : [text.slice(0, i), el('b', '', text.slice(i, i + at.query.length)), text.slice(i + at.query.length)]
    }
    suggest.replaceChildren(
      ...(items.length
        ? items.map((p, i) => {
            const row = el('div', 'item' + (i === sug.index ? ' on' : ''), icon(p.member ? 'symbol-field' : 'symbol-variable', p.member ? '#ee9d28' : '#75beff'), el('span', '', ...mark(p.username)), el('span', 'detail', p.name))
            row.addEventListener('mousedown', (e) => {
              e.preventDefault()
              acceptSuggest(i)
            })
            return row
          })
        : [el('div', 'item', icon('loading codicon-modifier-spin'), el('span', '', 'Loading...'))]),
    )
    measure.font = getComputedStyle(draft).font
    const box = draft.getBoundingClientRect()
    const left = Math.min(box.left + measure.measureText(draft.value.slice(0, at.start)).width, innerWidth - 430)
    suggest.hidden = false
    const below = box.bottom + 2 + suggest.offsetHeight < innerHeight - 24
    suggest.style.left = Math.max(4, left) + 'px'
    suggest.style.top = (below ? box.bottom + 2 : box.top - suggest.offsetHeight - 2) + 'px'
    suggest.children[sug.index]?.scrollIntoView({ block: 'nearest' })
  }
  function acceptSuggest(i = sug?.index) {
    const p = sug?.items[i]
    if (!p) return closeSuggest()
    const { start, caret } = sug
    const insert = '@' + p.username + ' '
    draft.value = draft.value.slice(0, start) + insert + draft.value.slice(caret)
    draft.setSelectionRange(start + insert.length, start + insert.length)
    closeSuggest()
    draft.dispatchEvent(new Event('input'))
  }
  draft.addEventListener('input', () => setTimeout(drawSuggest))
  draft.addEventListener('click', drawSuggest)
  draft.addEventListener('blur', () => setTimeout(closeSuggest, 100))
  document.addEventListener(
    'keydown',
    (e) => {
      if (!sug || e.target !== draft || e.isComposing) return
      const keys = {
        ArrowDown: () => (sug.index = (sug.index + 1) % Math.max(sug.items.length, 1)),
        ArrowUp: () => (sug.index = (sug.index - 1 + sug.items.length) % Math.max(sug.items.length, 1)),
        Enter: () => acceptSuggest(),
        Tab: () => acceptSuggest(),
        Escape: () => closeSuggest(),
      }
      if (!keys[e.key]) return
      e.preventDefault()
      e.stopPropagation()
      keys[e.key]()
      if (sug) drawSuggest()
    },
    true,
  )

  addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey
    if (!mod && e.key === 'F5') {
      e.preventDefault()
      return runDebug()
    }
    if (switcher && e.key === 'Escape') {
      e.preventDefault()
      return closeSwitcher()
    }
    if (e.altKey && !mod && /^[1-9]$/.test(e.key)) {
      e.preventDefault()
      const k = openTabs()[Number(e.key) - 1]
      return k && openKey(k)
    }
    if (e.altKey && !mod && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      if (!isWin() && e.target instanceof HTMLInputElement) return
      e.preventDefault()
      return e.key === 'ArrowLeft' ? goBack() : goForward()
    }
    if (!mod) return
    if (e.key === 'Tab') {
      e.preventDefault()
      return openSwitcher(e.shiftKey ? -1 : 1)
    }
    if (e.key === 'PageDown' || e.key === 'PageUp') {
      e.preventDefault()
      return stepTab(e.key === 'PageDown' ? 1 : -1)
    }
    const key = e.key.toLowerCase()
    const views = { e: 'explorer', f: 'search', g: 'scm', d: 'debug', x: 'extensions' }
    if (e.code === 'Backquote') {
      e.preventDefault()
      showPanel('terminal', !e.shiftKey)
    } else if (key === 'j' && !e.shiftKey) {
      e.preventDefault()
      panel.hidden ? showPanel() : hidePanel()
    } else if (key === ',') {
      e.preventDefault()
      openPage('settings')
    } else if (e.shiftKey && views[key]) {
      e.preventDefault()
      showView(views[key])
    } else if (e.shiftKey && key === 'm') {
      e.preventDefault()
      showPanel('problems')
    } else if (e.shiftKey && key === 'u') {
      e.preventDefault()
      showPanel('output')
    } else if (key === 'w' && !e.shiftKey) {
      e.preventDefault()
      closeTab()
    } else if (key === 't' && e.shiftKey) {
      e.preventDefault()
      reopenTab()
    } else if (key === 'g' && !e.shiftKey) {
      e.preventDefault()
      openQuick(':')
    }
  })

  for (const x of installed().slice(0, 8)) log('output', `[info] Extension '${x.id}' activated`)

  return {
    refresh() {
      drawChanges()
      drawOutline()
      if (viewName === 'extensions') drawExtensions()
      if (viewName === 'search' && $('search-input').value) {
        clearTimeout(searchTimer)
        searchTimer = setTimeout(drawSearch, 300)
      }
    },
    page: renderPage,
    pageMeta,
    openPage,
    gotoLine,
    commands,
    help,
    show: showView,
  }
})()
