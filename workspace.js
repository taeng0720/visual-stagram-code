const workspace = (() => {
  const node = typeof require !== 'undefined'
  const T = node ? require('./templates') : templates
  const R = node ? require('./roman') : roman

  const base = (p) => p.slice(p.lastIndexOf('/') + 1)
  const dir = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '')
  const join = (d, n) => (d ? d + '/' + n : n)
  const ext = (p) => {
    const name = base(p)
    const dot = name.lastIndexOf('.')
    return dot < 0 ? '' : name.slice(dot + 1).toLowerCase()
  }
  const under = (p, folder) => p === folder || p.startsWith(folder + '/')
  const rebase = (p, from, to) => (p === from ? to : p.startsWith(from + '/') ? to + p.slice(from.length) : p)
  const valid = (name) => /^[^/\\]+$/.test(name) && name !== '.' && name !== '..'
  const ancestors = (p) => p.split('/').map((_, i, parts) => parts.slice(0, i + 1).join('/'))

  const hash = (text) => {
    let h = 2166136261
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
    return h >>> 0
  }

  const stemOf = (words, style) => {
    if (!words.length) return ''
    if (/^\d/.test(words[0])) words.unshift('user')
    return T.styled(words.join('_'), style).slice(0, 48)
  }
  const idWords = (id) => id.toLowerCase().split(/[._]+/).filter(Boolean)

  const nameStem = (name, style) => stemOf(R.words(name), style)

  const chatStem = (ws, name, style) => {
    const { words, clean } = R.convert(name)
    if (clean) return stemOf(words, style)
    const members = ws.members?.[name] ?? []
    if (members.length >= 2) return stemOf([...idWords(members[0]), ...idWords(members[1])], style)
    const id = ws.ids?.[name]
    if (id) return stemOf(idWords(id), style)
    return stemOf(words, style)
  }

  const learn = (ws, { threads = [], current = -1, peer = null, rows = [], people = null } = {}) => {
    ws.ids ??= {}
    ws.members ??= {}
    let changed = false
    const set = (map, key, value) => {
      if (JSON.stringify(map[key]) === JSON.stringify(value)) return
      map[key] = value
      changed = true
    }
    if (people) {
      const byName = new Map()
      for (const p of people) {
        if (p.name && !byName.has(p.name)) byName.set(p.name, p.username)
        byName.set(p.username, p.username)
      }
      for (const name of threads) {
        const id = byName.get(name) ?? byName.get(name.replace(/님$/, ''))
        if (id) set(ws.ids, name, id)
      }
    }
    const name = threads[current]
    if (name) {
      const senders = [...new Set(rows.map((r) => r.who).filter(Boolean))]
      if (senders.length >= 2) set(ws.members, name, [...new Set([...(ws.members[name] ?? []), ...senders])].slice(0, 8))
      else if (peer && (!senders.length || senders[0] === peer) && !ws.members[name]) set(ws.ids, name, peer)
    }
    if (changed) renameAuto(ws)
    return changed
  }

  const englishName = (ws, name, folder) => {
    if (!/[가-힣ㄱ-ㅣ]/.test(name)) return name
    const dot = folder ? -1 : name.lastIndexOf('.')
    const [stem, tail] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, '']
    return (nameStem(stem, T.get(ws.template).style) || stem) + tail
  }

  const layout = (id) => {
    const t = T.get(id)
    const { folders, files } = T.files(t.id)
    return { template: t.id, root: t.root, folders, files, readme: 'README.md', inbox: t.inbox, expanded: ancestors(t.inbox) }
  }

  const NAME_RULE = 5
  const LAYOUT_RULE = 2
  const DEFAULT = () => ({ ...layout('python-backend'), threads: {}, seen: {}, custom: {}, ids: {}, members: {}, alarm: null, naming: 'name', sort: 'recent', rule: NAME_RULE, layoutRule: LAYOUT_RULE })

  // Instagram notifications live in one fixed chat-like file at the top of the chat folder ("00_notifications.py").
  const alarmName = (ws) => {
    const t = T.get(ws.template)
    return '00_' + T.styled('notifications', t.style) + '.' + t.chat
  }
  const ensureAlarm = (ws) => {
    if (ws.alarm && valid(base(ws.alarm)) && isFolder(ws, dir(ws.alarm)) && !ws.files.includes(ws.alarm) && threadAt(ws, ws.alarm) === undefined) return ws.alarm
    ws.alarm = null
    ws.alarm = free(ws, isFolder(ws, ws.inbox) ? ws.inbox : '', alarmName(ws))
    return ws.alarm
  }

  const parse = (json) => {
    const ws = DEFAULT()
    let saved = {}
    try {
      saved = JSON.parse(json) ?? {}
    } catch {}
    Object.assign(ws, saved)
    ws.template = T.get(ws.template).id
    ws.custom ??= {}
    ws.ids ??= {}
    ws.members ??= {}
    ws.edits ??= {}
    if (!ws.files.includes(ws.readme)) ws.files.push(ws.readme)
    if (saved.rule !== NAME_RULE) {
      ws.rule = NAME_RULE
      renameAuto(ws)
    }
    ensureAlarm(ws)
    if (saved.layoutRule !== LAYOUT_RULE) {
      ws.layoutRule = LAYOUT_RULE
      const { folders, files } = T.files(ws.template)
      for (const f of folders) if (!ws.folders.includes(f) && !taken(ws, f) && isFolder(ws, dir(f))) ws.folders.push(f)
      for (const f of files) if (!taken(ws, f) && isFolder(ws, dir(f))) ws.files.push(f)
    }
    return ws
  }

  const threadAt = (ws, p) => Object.keys(ws.threads).find((n) => ws.threads[n] === p)
  const isFolder = (ws, p) => p === '' || ws.folders.includes(p)
  const taken = (ws, p) => ws.folders.includes(p) || ws.files.includes(p) || threadAt(ws, p) !== undefined || (!!ws.alarm && ws.alarm === p)

  const free = (ws, folder, name) => {
    const dot = name.lastIndexOf('.')
    const [stem, tail] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, '']
    let p = join(folder, name)
    for (let i = 1; taken(ws, p); i++) p = join(folder, `${stem}_${i}${tail}`)
    return p
  }

  const fresh = (ws, name, folder = ws.inbox, extension = T.get(ws.template).chat) => {
    const t = T.get(ws.template)
    const stem = ws.naming === 'module' ? '' : chatStem(ws, name, t.style)
    if (stem) return free(ws, folder, `${stem}.${extension}`)
    const start = hash(name) % t.names.length
    for (let i = 0; i < t.names.length; i++) {
      const p = join(folder, `${t.names[(start + i) % t.names.length]}.${extension}`)
      if (!taken(ws, p)) return p
    }
    return free(ws, folder, `${t.names[start]}.${extension}`)
  }

  const renameAuto = (ws) => {
    const auto = Object.keys(ws.threads).filter((n) => !ws.custom[n])
    const was = Object.fromEntries(auto.map((n) => [n, ws.threads[n]]))
    for (const n of auto) ws.threads[n] = '\0'
    for (const n of auto) ws.threads[n] = fresh(ws, n, isFolder(ws, dir(was[n])) ? dir(was[n]) : ws.inbox, ext(was[n]) || undefined)
  }

  const apply = (ws, id) => {
    const old = ws.threads
    Object.assign(ws, layout(id), { threads: {}, edits: {} })
    const t = T.get(id)
    const names = Object.keys(old)
    for (const name of names.filter((n) => ws.custom[n])) ws.threads[name] = free(ws, ws.inbox, `${T.styled(T.stemOf(old[name]), t.style)}.${t.chat}`)
    for (const name of names.filter((n) => !ws.custom[n])) ws.threads[name] = fresh(ws, name)
    ws.alarm = null
    ensureAlarm(ws)
  }

  const signature = (lines = []) =>
    lines
      .filter((l) => !/active|활동/i.test(l))
      .join(' ')
      .replace(/·.*$/, '')
      .replace(/\d+\s*\S*/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  // flags[i] is Instagram's own unread mark for thread i (true / false), or null when it can't be read.
  // A thread Instagram shows as read (opened here, on the phone, or before the app was restarted) is never "new".
  const sync = (ws, threads, previews = [], active = null, flags = null) => {
    let changed = false
    if (ws.inbox && !ws.folders.includes(ws.inbox)) {
      ws.inbox = ''
      changed = true
    }
    threads.forEach((name, i) => {
      if (!ws.threads[name]) {
        ws.threads[name] = fresh(ws, name)
        changed = true
      }
      const sig = signature(previews[i])
      if (!sig) return
      const read = flags?.[i] === false
      if ((!(name in ws.seen) || name === active || read) && ws.seen[name] !== sig) {
        ws.seen[name] = sig
        changed = true
      }
    })
    return changed
  }

  const unread = (ws, threads, previews = [], flags = null) =>
    new Set(
      threads.filter((name, i) => {
        if (flags?.[i] === false) return false
        const sig = signature(previews[i])
        return !!sig && name in ws.seen && ws.seen[name] !== sig
      }),
    )

  const children = (ws, folder, threads) => {
    const inside = (p) => dir(p) === folder
    const sort = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    const folders = ws.folders.filter(inside).map((path) => ({ path, name: base(path), folder: true }))
    const files = ws.files.filter(inside).map((path) => ({ path, name: base(path) }))
    const chats = [...new Set(threads)].filter((n) => inside(ws.threads[n] ?? '\0')).map((n) => ({ path: ws.threads[n], name: base(ws.threads[n]), thread: n }))
    const alarm = ws.alarm && inside(ws.alarm) ? [{ path: ws.alarm, name: base(ws.alarm), alarm: true }] : []
    if (ws.sort === 'name') return [...folders.sort(sort), ...alarm, ...[...files, ...chats].sort(sort)]
    return [...folders.sort(sort), ...alarm, ...chats, ...files.sort(sort)]
  }

  const relocate = (ws, from, to) => {
    if (!to || from === to || !valid(base(to)) || under(to, from) || taken(ws, to) || !isFolder(ws, dir(to))) return null
    const thread = threadAt(ws, from)
    if (thread !== undefined && base(from) !== base(to)) ws.custom[thread] = true
    const r = (p) => rebase(p, from, to)
    ws.folders = ws.folders.map(r)
    ws.files = ws.files.map(r)
    for (const n in ws.threads) ws.threads[n] = r(ws.threads[n])
    if (ws.alarm) ws.alarm = r(ws.alarm)
    ws.expanded = ws.expanded.map(r)
    ws.inbox = r(ws.inbox)
    ws.readme = r(ws.readme)
    ws.edits = Object.fromEntries(Object.entries(ws.edits ?? {}).map(([p, lines]) => [r(p), lines]))
    return to
  }

  const move = (ws, from, folder) => relocate(ws, from, join(folder, base(from)))

  const create = (ws, p, folder) => {
    const parts = p.split('/').filter(Boolean)
    if (!parts.length || !parts.every(valid)) return null
    const full = parts.join('/')
    const parents = parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('/'))
    if (taken(ws, full) || parents.some((d) => !ws.folders.includes(d) && taken(ws, d))) return null
    for (const d of parents) if (!ws.folders.includes(d)) ws.folders.push(d)
    ;(folder ? ws.folders : ws.files).push(full)
    return full
  }

  const remove = (ws, p) => {
    if (p === ws.readme || p === ws.alarm || threadAt(ws, p) !== undefined) return false
    const gone = (q) => under(q, p)
    for (const q of Object.keys(ws.edits ?? {})) if (gone(q)) delete ws.edits[q]
    if (ws.files.includes(p)) {
      ws.files = ws.files.filter((f) => f !== p)
      return true
    }
    if (!ws.folders.includes(p)) return false
    ws.folders = ws.folders.filter((f) => !gone(f))
    ws.expanded = ws.expanded.filter((f) => !gone(f))
    const readme = gone(ws.readme)
    ws.files = ws.files.filter((f) => !gone(f))
    if (readme) ws.files.push((ws.readme = free(ws, '', base(ws.readme))))
    for (const n in ws.threads) if (gone(ws.threads[n])) ws.threads[n] = free(ws, '', base(ws.threads[n]))
    if (ws.alarm && gone(ws.alarm)) {
      const name = base(ws.alarm)
      ws.alarm = null
      ws.alarm = free(ws, '', name)
    }
    if (gone(ws.inbox)) ws.inbox = ''
    return true
  }

  const content = (ws, p) => ws.edits?.[p] ?? T.content(ws, p)
  const edit = (ws, p, lines) => {
    ws.edits ??= {}
    ws.edits[p] = lines
  }

  return { ensureAlarm, DEFAULT, parse, base, dir, join, ext, rebase, isFolder, threadAt, sync, unread, children, relocate, move, create, remove, content, apply, signature, renameAuto, nameStem, englishName, learn, edit }
})()

if (typeof module !== 'undefined') module.exports = workspace

if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert')
  const ws = workspace.parse(null)
  assert.strictEqual(workspace.parse('not json').root, 'backend-service')
  assert.strictEqual(workspace.parse('{"template":"gone"}').template, 'python-backend')

  assert(workspace.sync(ws, ['민수', '지영'], [['안녕 · 3m'], ['Active 2h ago']]))
  const a = ws.threads['민수']
  assert(a.startsWith('src/handlers/') && a.endsWith('.py') && !a.includes('민수'))
  assert.notStrictEqual(ws.threads['지영'], a)
  assert.strictEqual(workspace.unread(ws, ['민수', '지영'], [['안녕 · 4m'], ['Active 3h ago']]).size, 0)
  assert.deepStrictEqual([...workspace.unread(ws, ['민수'], [['뭐해? · 1m']])], ['민수'])
  workspace.sync(ws, ['민수'], [['뭐해? · 1m']], '민수')
  assert.strictEqual(workspace.unread(ws, ['민수'], [['뭐해? · 1m']]).size, 0)
  assert.strictEqual(workspace.unread(ws, ['민수'], [[]]).size, 0, 'a preview that has not loaded yet is not new')
  assert.strictEqual(workspace.unread(ws, ['민수'], [['또 왔어 · 1m']], [false]).size, 0, 'Instagram says read: not new')
  assert.strictEqual(workspace.unread(ws, ['민수'], [['또 왔어 · 1m']], [true]).size, 1)
  workspace.sync(ws, ['민수'], [['또 왔어 · 1m']], null, [false])
  assert.strictEqual(workspace.unread(ws, ['민수'], [['또 왔어 · 1m']]).size, 0, 'read elsewhere: remembered after restart')
  workspace.sync(ws, ['새친구'], [[]])
  assert(!('새친구' in ws.seen), 'no baseline until the preview loads')
  workspace.sync(ws, ['새친구'], [['안녕']])
  assert.strictEqual(workspace.unread(ws, ['새친구'], [['안녕']]).size, 0)

  assert.strictEqual(workspace.relocate(ws, a, 'src/handlers/friend_api.py'), 'src/handlers/friend_api.py')
  assert(ws.custom['민수'])
  assert.strictEqual(workspace.relocate(ws, 'src/handlers/friend_api.py', ws.threads['지영']), null)
  assert.strictEqual(workspace.relocate(ws, 'src', 'src/core/src'), null)

  const unity = JSON.parse(JSON.stringify(ws))
  workspace.apply(unity, 'unity')
  assert.strictEqual(unity.template, 'unity')
  assert.strictEqual(unity.threads['민수'], 'Assets/Scripts/Systems/FriendApi.cs')
  assert(unity.threads['지영'].startsWith('Assets/Scripts/Systems/') && unity.threads['지영'].endsWith('.cs'))
  assert(unity.files.includes('README.md') && unity.files.includes('Packages/manifest.json'))
  assert(unity.expanded.includes('Assets/Scripts/Systems'))
  workspace.apply(unity, 'flutter')
  assert.strictEqual(unity.threads['민수'], 'lib/widgets/friend_api.dart')

  assert.strictEqual(workspace.relocate(ws, 'src/handlers', 'src/routes'), 'src/routes')
  assert.strictEqual(ws.threads['민수'], 'src/routes/friend_api.py')
  assert.strictEqual(ws.inbox, 'src/routes')

  assert.strictEqual(workspace.move(ws, 'src/routes/friend_api.py', 'tests'), 'tests/friend_api.py')
  assert.strictEqual(workspace.move(ws, 'README.md', 'src'), 'src/README.md')
  assert.strictEqual(ws.readme, 'src/README.md')

  assert.strictEqual(workspace.create(ws, 'lib/utils/io.py', false), 'lib/utils/io.py')
  assert(ws.folders.includes('lib') && ws.folders.includes('lib/utils'))
  assert.strictEqual(workspace.create(ws, 'lib/utils/io.py', false), null)
  assert.strictEqual(workspace.create(ws, 'tests/friend_api.py/x', false), null)

  assert(!workspace.remove(ws, 'tests/friend_api.py'))
  assert(!workspace.remove(ws, 'src/README.md'))
  assert(workspace.remove(ws, 'src'))
  assert.strictEqual(ws.readme, 'README.md')
  assert(!ws.threads['지영'].includes('/'))
  assert.strictEqual(ws.inbox, '')

  const kids = workspace.children(ws, '', Object.keys(ws.threads))
  assert(kids.findIndex((k) => !k.folder) > kids.findLastIndex((k) => k.folder), 'folders first')
  assert(kids.some((k) => k.thread === '지영'))
  assert(workspace.content(ws, 'tests/test_x.py')[0].startsWith('import pytest'))
  workspace.create(ws, 'notes/a.py', false)
  workspace.edit(ws, 'notes/a.py', ['print("mine")'])
  assert.deepStrictEqual(workspace.content(ws, 'notes/a.py'), ['print("mine")'], 'edited content wins')
  workspace.relocate(ws, 'notes', 'scratch')
  assert.deepStrictEqual(workspace.content(ws, 'scratch/a.py'), ['print("mine")'], 'edits follow a rename')
  workspace.remove(ws, 'scratch')
  assert.strictEqual(ws.edits['scratch/a.py'], undefined, 'edits go with the file')

  const stem = workspace.nameStem
  assert.strictEqual(stem('김민수', 'snake'), 'kim_minsu')
  assert.strictEqual(stem('이지영', 'pascal'), 'LeeJiyoung')
  assert.strictEqual(stem('민수', 'snake'), 'minsu')
  assert.strictEqual(stem('study group 📚', 'camel'), 'studyGroup')
  assert.strictEqual(stem('minsu.kim_', 'snake'), 'minsu_kim')
  assert.strictEqual(stem('José', 'snake'), 'jose')
  assert.strictEqual(stem('1004', 'snake'), 'user_1004')
  assert.strictEqual(stem('🍀', 'snake'), '')
  assert.strictEqual(workspace.englishName(ws, '민수 친구.py'), 'minsu_friend.py')
  assert.strictEqual(workspace.englishName(ws, '우리 가족', true), 'our_family')
  assert.strictEqual(workspace.englishName(ws, 'notes.md'), 'notes.md')
  assert.strictEqual(stem('김민재님', 'pascal'), 'KimMinjae')
  assert.strictEqual(stem('Y0n 님', 'pascal'), 'Y0n')
  assert.strictEqual(stem('모두의 럼블', 'pascal'), 'EveryonesRumble')
  assert.strictEqual(stem('한결님', 'snake'), 'hangyeol')

  const old = workspace.parse(JSON.stringify({ threads: { 김민수: 'src/handlers/router.py', 이지영: 'tests/cache.py', 친구: 'src/handlers/mine.py' }, custom: { 친구: true }, seen: {} }))
  assert.deepStrictEqual(old.threads, { 김민수: 'src/handlers/kim_minsu.py', 이지영: 'tests/lee_jiyoung.py', 친구: 'src/handlers/mine.py' })
  assert.strictEqual(old.naming, 'name')
  const emoji = workspace.parse(null)
  workspace.sync(emoji, ['🍀'], [])
  assert(/^src\/handlers\/\w+\.py$/.test(emoji.threads['🍀']), 'falls back to a module name')

  const older = workspace.parse(JSON.stringify({ template: 'unity', folders: ['Assets', 'Assets/Scripts'], files: ['README.md', 'Assets/Scripts/Mine.cs'], threads: { 친구: 'Assets/Scripts/Friend.cs' }, custom: { 친구: true }, rule: 5 }))
  assert(older.files.includes('Assets/Audio/SFX/Jump.wav') && older.folders.includes('Assets/Audio/SFX'), 'old layouts get the new template files')
  assert(older.files.includes('Assets/Scripts/Mine.cs') && older.threads['친구'] === 'Assets/Scripts/Friend.cs', 'own files and chats stay')
  assert.strictEqual(new Set(older.files).size, older.files.length)

  const ids = workspace.parse(null)
  workspace.sync(ids, ['바다촌놈', 'ㅋㅍㅇV26', '배고파', '김민수님', '윙탄지팬클럽'], [])
  assert.strictEqual(ids.threads['바다촌놈'], 'src/handlers/sea_chonnom.py', 'best guess until the ID is known')
  assert(workspace.learn(ids, { threads: ['바다촌놈', 'ㅋㅍㅇV26', '김민수님'], people: [{ username: 'sea.boy_92', name: '바다촌놈' }, { username: 'kms', name: '김민수' }] }))
  assert.strictEqual(ids.threads['바다촌놈'], 'src/handlers/sea_boy_92.py', 'unconvertible name shows the ID')
  assert.strictEqual(ids.threads['김민수님'], 'src/handlers/kim_minsu.py', 'clean names keep the English name')
  workspace.learn(ids, { threads: ['ㅋㅍㅇV26'], current: 0, peer: 'kpo.v26', rows: [{ side: 'recv', who: 'kpo.v26' }] })
  assert.strictEqual(ids.threads['ㅋㅍㅇV26'], 'src/handlers/kpo_v26.py')
  workspace.learn(ids, { threads: ['윙탄지팬클럽'], current: 0, peer: 'aaa', rows: [{ side: 'recv', who: 'jiyoung.k' }, { side: 'recv', who: 'min_su' }] })
  assert.strictEqual(ids.threads['윙탄지팬클럽'], 'src/handlers/jiyoung_k_min_su.py', 'groups use member IDs')
  assert.strictEqual(ids.ids['윙탄지팬클럽'], undefined, 'a group never takes the header ID')
  assert.strictEqual(ids.threads['배고파'], 'src/handlers/hungry.py')
  ids.custom['바다촌놈'] = true
  workspace.learn(ids, { threads: ['바다촌놈'], people: [{ username: 'other', name: '바다촌놈' }] })
  assert.strictEqual(ids.threads['바다촌놈'], 'src/handlers/sea_boy_92.py', 'renamed by hand: left alone')

  const al = workspace.parse(null)
  assert.strictEqual(al.alarm, 'src/handlers/00_notifications.py', 'notifications file sits in the chat folder')
  workspace.sync(al, ['김민수'], [['안녕']])
  assert.strictEqual(workspace.children(al, 'src/handlers', ['김민수'])[0].name, '00_notifications.py', 'and on top of the chats')
  assert(!workspace.remove(al, al.alarm), 'cannot be deleted')
  assert.strictEqual(workspace.relocate(al, al.alarm, 'src/handlers/00_alerts.py'), 'src/handlers/00_alerts.py')
  assert.strictEqual(al.alarm, 'src/handlers/00_alerts.py', 'can be renamed')
  workspace.relocate(al, 'src/handlers', 'src/inbox')
  assert.strictEqual(al.alarm, 'src/inbox/00_alerts.py', 'follows its folder')
  workspace.remove(al, 'src')
  assert.strictEqual(al.alarm, '00_alerts.py', 'survives its folder being deleted')
  workspace.apply(al, 'unity')
  assert.strictEqual(al.alarm, 'Assets/Scripts/Systems/00_Notifications.cs', 'template change: new language, English name')
  assert.strictEqual(workspace.parse(JSON.stringify(al)).alarm, al.alarm, 'kept across restarts')

  const order = workspace.parse(null)
  workspace.sync(order, ['최수진', '김민수', 'aaa'], [])
  const listed = workspace.children(order, 'src/handlers', ['최수진', '김민수', 'aaa']).map((k) => k.name)
  assert.deepStrictEqual(listed, ['00_notifications.py', 'choi_sujin.py', 'kim_minsu.py', 'aaa.py', '__init__.py', 'base.py', 'registry.py'], 'recent first, like Instagram')
  order.sort = 'name'
  assert.deepStrictEqual(workspace.children(order, 'src/handlers', ['최수진', '김민수', 'aaa']).map((k) => k.name), ['00_notifications.py', '__init__.py', 'aaa.py', 'base.py', 'choi_sujin.py', 'kim_minsu.py', 'registry.py'])
  console.log('ok')
}
