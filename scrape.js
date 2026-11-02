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
      top: box(row).top,
      side: centred || (small && !media) ? 'note' : gapLeft < gapRight ? 'recv' : 'send',
      text: words.length ? words.join(' ') : null,
      media: !!media,
      src: src.startsWith('https:') ? src : null,
      who: avatar?.closest('a[href]').getAttribute('href').match(/^\/([A-Za-z0-9._]+)\/?$/)?.[1] ?? null,
    })
  }
  rows.sort((a, b) => a.top - b.top)
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

  let tray = composer
  while (tray && !tray.querySelector('input[type="file"]')) tray = tray.parentElement
  if (scroller && tray?.contains(scroller)) tray = null
  const pending = [...(tray?.querySelectorAll('img, video') ?? [])].filter((m) => box(m).width >= 40).length

  return {
    ok: !document.querySelector('[role="dialog"]') && (items.size > 0 || !!composer),
    threads: texts.map((t) => t[0]),
    previews: texts.map((t) => t.slice(1)),
    current: [...items].findIndex((el) => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'),
    peer,
    rows,
    pending,
    canSend: !!composer,
  }
}

const GUEST = (() => {
  const COMPOSER = '[role="textbox"][contenteditable="true"]'
  const UPLOAD = `(() => { let el = document.querySelector('${COMPOSER}'); while (el && !el.querySelector('input[type="file"]')) el = el.parentElement; return el?.querySelector('input[type="file"]') })()`
  return {
    scrape: `(${scrape})()`,
    focus: `(() => { const box = document.querySelector('${COMPOSER}'); box?.focus(); return !!box })()`,
    pick: `${UPLOAD}?.click()`,
    open: (index) => `window.__vscThreads[${Number(index)}]?.click()`,
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
