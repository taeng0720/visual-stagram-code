function scrape() {
  const CLICKABLE = 'a, [role="link"], [role="button"], [role="listitem"]'
  const box = (el) => el.getBoundingClientRect()
  const visible = (el) => box(el).width > 2 && box(el).height > 2

  const composer = document.querySelector('[role="textbox"][contenteditable="true"]')

  let scroller = null
  if (composer) {
    const c = box(composer)
    scroller =
      document
        .elementsFromPoint(c.left + c.width / 2, c.top - 200)
        .find((el) => /auto|scroll/.test(getComputedStyle(el).overflowY) && !el.contains(composer)) ?? null
  }
  window.__vscScroller = scroller
  const pane = scroller && box(scroller)

  const filled = (el) => box(el).height > 0 && (el.textContent.trim() || el.querySelector('img, video'))
  const split = (el) => {
    if (box(el).width < pane.width * 0.8) return [el]
    const kids = [...el.children].filter(filled).sort((a, b) => box(a).top - box(b).top)
    if (kids.length === 1) return split(kids[0])
    const stacked = kids.every((k, i) => !i || box(k).top >= box(kids[i - 1]).bottom - 1)
    return kids.length && stacked ? kids.flatMap(split) : [el]
  }

  const rows = []
  const range = document.createRange()
  for (const row of scroller ? split(scroller) : []) {
    const words = []
    let left = Infinity
    let right = -Infinity
    let small = false
    const grow = (r) => {
      left = Math.min(left, r.left)
      right = Math.max(right, r.right)
    }
    const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT)
    for (let node; (node = walker.nextNode()); ) {
      if (!node.data.trim() || !visible(node.parentElement)) continue
      if (!words.length) small = parseFloat(getComputedStyle(node.parentElement).fontSize) < 13
      range.selectNodeContents(node)
      grow(range.getBoundingClientRect())
      words.push(node.data.trim())
    }
    const media = [...row.querySelectorAll('img, video')].find((m) => box(m).width > 80)
    if (media) grow(box(media))
    if (!words.length && !media) continue
    const src = media?.currentSrc || media?.src || media?.poster || ''
    const gapLeft = left - pane.left
    const gapRight = pane.right - right
    const centred = Math.abs(gapLeft - gapRight) < pane.width * 0.1
    const avatar = [...row.querySelectorAll('a[href] img')].find((img) => box(img).width > 0 && box(img).width <= 48)
    rows.push({
      el: row,
      dx: (left + right) / 2 - box(row).left,
      top: box(row).top,
      side: centred || (small && !media) ? 'note' : gapLeft < gapRight ? 'recv' : 'send',
      text: words.length ? words.join(' ') : null,
      media: !!media,
      src: src.startsWith('https:') ? src : null,
      who: avatar?.closest('a[href]').getAttribute('href').match(/^\/([A-Za-z0-9._]+)\/?$/)?.[1] ?? null,
    })
  }
  rows.sort((a, b) => a.top - b.top)
  // Remember which element each row came from, so a code line can act on the real message (reply, etc.).
  window.__vscRowEls = rows.map((r) => ({ el: r.el, dx: r.dx }))
  for (const r of rows) {
    delete r.el
    delete r.dx
  }
  let who = null
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    delete row.top
    if (row.side === 'send') who = null
    else if (row.side === 'recv') who = row.who ?? who
    else if (who) {
      row.who = who
      who = null
      continue
    }
    row.who = row.side === 'recv' ? who : null
  }

  const peer = pane
    ? [...document.querySelectorAll('a[href]')]
        .filter((a) => {
          const r = box(a)
          return r.width > 0 && r.bottom <= pane.top + 1 && r.left >= pane.left - 1 && r.right <= pane.right + 1
        })
        .map((a) => a.getAttribute('href').match(/^\/([A-Za-z0-9._]+)\/?$/)?.[1])
        .find(Boolean) ?? null
    : null

  const edge = pane ? pane.left : 520
  const items = new Set()
  for (const img of document.querySelectorAll('img')) {
    let item = img
    while ((item = item.parentElement?.closest(CLICKABLE)) && box(item).width < 200);
    if (item && box(item).right <= edge + 1) items.add(item)
  }
  window.__vscThreads = [...items]
  const texts = [...items].map((el) => el.innerText.trim().split('\n'))

  // Instagram marks unread threads with a bold preview and/or a small blue dot.
  const blue = (color) => {
    const [r, g, b, a = 1] = (color.match(/[\d.]+/g) ?? []).map(Number)
    return a > 0.5 && b > 180 && b - r > 60 && b - g > 20
  }
  const unreadOf = (item) => {
    if (/Unread|읽지 않음/.test(item.getAttribute('aria-label') ?? '') || item.querySelector('[aria-label="Unread"], [aria-label="읽지 않음"]')) return true
    const parts = []
    const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT)
    for (let n; (n = walker.nextNode()); ) if (n.data.trim() && visible(n.parentElement)) parts.push(n.parentElement)
    if (parts.slice(1).some((el) => parseInt(getComputedStyle(el).fontWeight, 10) >= 600)) return true
    for (const el of item.querySelectorAll('div, span')) {
      const r = box(el)
      if (r.width < 4 || r.width > 16 || Math.abs(r.width - r.height) > 1 || el.childElementCount || el.textContent.trim()) continue
      const s = getComputedStyle(el)
      if (parseFloat(s.borderRadius) >= r.width / 2 - 1 && blue(s.backgroundColor)) return true
    }
    return false
  }

  let tray = composer
  while (tray && !tray.querySelector('input[type="file"]')) tray = tray.parentElement
  if (scroller && tray?.contains(scroller)) tray = null
  const pending = [...(tray?.querySelectorAll('img, video') ?? [])].filter((m) => box(m).width >= 40).length

  return {
    ok: !document.querySelector('[role="dialog"]') && (items.size > 0 || !!composer),
    threads: texts.map((t) => t[0]),
    previews: texts.map((t) => t.slice(1)),
    unread: [...items].map(unreadOf),
    current: [...items].findIndex((el) => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'),
    // true when the rendered rows are the top of the inbox (= the most recent chats, in order)
    atTop: (() => {
      for (let el = [...items][0]; el && el !== document.body; el = el.parentElement) if (/auto|scroll/.test(getComputedStyle(el).overflowY)) return el.scrollTop < 8
      return true
    })(),
    peer,
    rows,
    pending,
    canSend: !!composer,
  }
}

// Instagram only keeps ~10-30 inbox rows in the DOM and recycles them while scrolling (no per-thread links),
// so reaching an old chat means scrolling the list until its row is rendered.
function inboxTools() {
  const box = (el) => el.getBoundingClientRect()
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const items = () => {
    const edge = window.__vscScroller ? box(window.__vscScroller).left : 520
    const found = new Set()
    for (const img of document.querySelectorAll('img')) {
      let item = img
      while ((item = item.parentElement?.closest('a, [role="link"], [role="button"], [role="listitem"]')) && box(item).width < 200);
      if (item && box(item).right <= edge + 1) found.add(item)
    }
    return [...found].sort((a, b) => box(a).top - box(b).top)
  }
  const nameOf = (el) => el.innerText.trim().split('\n')[0]
  const scroller = () => {
    for (let el = items()[0]; el && el !== document.body; el = el.parentElement) {
      if (/auto|scroll/.test(getComputedStyle(el).overflowY)) return el
    }
    return null
  }
  // The app's hidden webview is 2400px tall, so the inbox list fits without a scrollbar and Instagram never
  // loads the rest. Give it a normal window height while we walk it, then put it back.
  const shrink = (sc) => {
    const was = sc.style.maxHeight
    sc.style.maxHeight = '700px'
    return () => {
      sc.style.maxHeight = was
    }
  }
  // Scroll down one screen; when stuck at the bottom give Instagram a moment to load more. false = really the end.
  const step = async (sc) => {
    const before = sc.scrollTop
    sc.scrollTop += sc.clientHeight * 0.8
    await sleep(350)
    if (sc.scrollTop !== before) return true
    await sleep(1200)
    sc.scrollTop += sc.clientHeight * 0.8
    await sleep(250)
    return sc.scrollTop !== before
  }
  return { items, nameOf, scroller, shrink, step, sleep }
}

const GUEST = (() => {
  const COMPOSER = '[role="textbox"][contenteditable="true"]'
  const TOOLS = `(${inboxTools})()`
  const UPLOAD = `(() => { let el = document.querySelector('${COMPOSER}'); while (el && !el.querySelector('input[type="file"]')) el = el.parentElement; return el?.querySelector('input[type="file"]') })()`
  return {
    scrape: `(${scrape})()`,
    focus: `(() => { const box = document.querySelector('${COMPOSER}'); box?.focus(); return !!box })()`,
    // Type and send entirely from inside the page without ever focusing it. Instagram's composer is a Lexical
    // editor: setting its editor state directly needs no focus, so the keyboard and the Korean IME stay on our
    // message line (focusing the hidden page broke Hangul composition and swallowed the next Enter, and text
    // typed into the page while it wasn't focused was silently dropped by Lexical).
    // Returns 'clicked' (nothing focused), 'clicked+focus' (old DOM path, had to focus the page), 'nobox' or 'fallback'.
    send: (text) => `(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
      const box = document.querySelector('${COMPOSER}')
      if (!box) return 'nobox'
      const text = ${JSON.stringify(String(text ?? ''))}
      const typed = () => box.innerText.replace(/\\s+/g, ' ').trim()
      const want = text.replace(/\\s+/g, ' ').trim().slice(0, 30)
      let focused = false
      const editor = box.__lexicalEditor
      if (text && editor?.setEditorState && editor.parseEditorState) {
        // Replaces whatever is in the composer (one paragraph per line).
        const node = (t) => ({ detail: 0, format: 0, mode: 'normal', style: '', text: t, type: 'text', version: 1 })
        const para = (line) => ({ children: line ? [node(line)] : [], direction: 'ltr', format: '', indent: 0, textFormat: 0, textStyle: '', type: 'paragraph', version: 1 })
        const state = { root: { children: text.split('\\n').map(para), direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
        try { editor.setEditorState(editor.parseEditorState(JSON.stringify(state))) } catch {}
      }
      if (text && !typed().includes(want)) {
        // Not Lexical (or it refused): type it the DOM way, which needs the page focused.
        focused = true
        box.focus()
        getSelection().selectAllChildren(box)
        document.execCommand('insertText', false, text)
        await sleep(60)
        if (!typed().includes(want)) return 'fallback'
      } else if (!text && typed()) {
        return 'fallback'
      }
      const near = (el) => { const a = el.getBoundingClientRect(), b = box.getBoundingClientRect(); return a.width > 0 && Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)) < 60 }
      // The Send control is either a text button ("Send"/"보내기") or an icon whose label sits on an inner <svg>.
      // It only appears once the composer has text, so give React a moment to render it.
      const label = (el) => [el.getAttribute('aria-label'), el.querySelector('svg[aria-label]')?.getAttribute('aria-label'), el.textContent].map((s) => (s || '').trim()).find(Boolean) || ''
      const find = () => [...document.querySelectorAll('[role="button"], button')].find((el) => near(el) && /^(send|보내기|전송)$/i.test(label(el)))
      let button = find()
      for (let i = 0; i < 10 && !button; i++) {
        await sleep(50)
        button = find()
      }
      if (button) {
        button.click()
      } else {
        // No button: press Enter *inside the page* (a real key event would pull the keyboard in here).
        const init = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true, composed: true }
        box.dispatchEvent(new KeyboardEvent('keydown', init))
        box.dispatchEvent(new KeyboardEvent('keypress', init))
        box.dispatchEvent(new KeyboardEvent('keyup', init))
      }
      return focused ? 'clicked+focus' : 'clicked'
    })()`,
    // Still text in the composer? (true = the click didn't send it)
    pending: `(() => !!document.querySelector('${COMPOSER}')?.innerText.trim())()`,
    pick: `${UPLOAD}?.click()`,
    open: (index) => `window.__vscThreads[${Number(index)}]?.click()`,
    // Every chat in the inbox, top (recent) to bottom: [{ name, preview }]. complete = reached the end of the list.
    crawl: `(async () => {
      const { items, nameOf, scroller, shrink, step, sleep } = ${TOOLS}
      const sc = scroller()
      if (!sc) return null
      const seen = new Map()
      const collect = () => { for (const el of items()) { const t = el.innerText.trim().split('\\n'); if (t[0] && !seen.has(t[0])) seen.set(t[0], t.slice(1)) } }
      window.__vscStop = false
      const restore = shrink(sc)
      let complete = false
      try {
        sc.scrollTop = 0
        await sleep(400)
        collect()
        for (let i = 0; i < 200; i++) {
          if (window.__vscStop) break
          if (!(await step(sc))) { complete = true; break }
          collect()
        }
        collect()
        sc.scrollTop = 0
      } finally {
        restore()
      }
      return { complete, threads: [...seen].map(([name, preview]) => ({ name, preview })) }
    })()`,
    // Scroll the inbox until the chat called \`name\` is rendered, then click it.
    seek: (name) => `(async () => {
      const { items, nameOf, scroller, shrink, step, sleep } = ${TOOLS}
      const want = ${JSON.stringify(String(name))}
      const hit = () => items().find((el) => nameOf(el) === want)
      const click = (el) => { el.click(); return true }
      if (hit()) return click(hit())
      const sc = scroller()
      if (!sc) return false
      const restore = shrink(sc)
      try {
        sc.scrollTop = 0
        await sleep(400)
        for (let i = 0; i < 200; i++) {
          if (hit()) return click(hit())
          if (!(await step(sc))) break
        }
        return hit() ? click(hit()) : false
      } finally {
        restore()
        // Put the inbox back at the top so the rows Instagram renders are the most recent chats again.
        setTimeout(() => (sc.scrollTop = 0), 300)
      }
    })()`,
    // Activity feed (likes, follows, comments...): { lastChecked, stories: [{ id, text, who, at, src }] } (seconds)
    alarms: `(async () => {
      const res = await fetch('/api/v1/news/inbox/', { headers: { 'X-IG-App-ID': '936619743392459' }, credentials: 'include' })
      if (!res.ok) return null
      const body = await res.json()
      const https = (u) => (typeof u === 'string' && u.startsWith('https:') ? u : null)
      const stories = [...(body.new_stories ?? []), ...(body.old_stories ?? [])].map((s) => ({
        id: String(s.pk ?? s.args?.tuuid ?? ''),
        text: String(s.args?.text ?? '').trim(),
        who: s.args?.profile_name ?? null,
        at: Number(s.args?.timestamp) || 0,
        src: https(s.args?.media?.[0]?.image) ?? https(s.args?.images?.[0]?.image),
      }))
      return { lastChecked: Number(body.last_checked) || 0, stories: stories.filter((s) => s.text) }
    })()`,
    page: (dir) => `window.__vscScroller?.scrollBy(0, ${dir < 0 ? -1 : 1} * innerHeight)`,
    message: `(() => {
      const button = [...document.querySelectorAll('[role="button"], button')].find((el) => /^(Message|메시지 보내기)$/.test(el.textContent.trim()))
      button?.click()
      return !!button
    })()`,
    people: `(async () => {
      const me = document.cookie.match(/ds_user_id=(\\d+)/)?.[1]
      if (!me) return []
      const seen = new Map()
      for (const list of ['following', 'followers']) {
        let next = ''
        for (let page = 0; page < 20; page++) {
          const res = await fetch('/api/v1/friendships/' + me + '/' + list + '/?count=100' + (next ? '&max_id=' + next : ''), { headers: { 'X-IG-App-ID': '936619743392459' }, credentials: 'include' })
          if (!res.ok) break
          const body = await res.json()
          for (const u of body.users ?? []) {
            const known = seen.get(u.username)
            if (known) known[list] = true
            else seen.set(u.username, { username: u.username, name: u.full_name || '', [list]: true })
          }
          next = body.next_max_id
          if (!next) break
        }
      }
      return [...seen.values()]
    })()`,
    attach: (files) => `(() => {
      const upload = ${UPLOAD}
      if (!upload) return false
      const dt = new DataTransfer()
      for (const f of ${JSON.stringify(files)})
        dt.items.add(new File([Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0))], f.name, { type: f.type }))
      upload.files = dt.files
      upload.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    })()`,
  }
})()

if (typeof module !== 'undefined') module.exports = GUEST
