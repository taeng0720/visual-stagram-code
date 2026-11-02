const camo = (() => {
  const LANGS = typeof require !== 'undefined' ? require('./langs') : langs

  const LEVEL = {
    2: { wrap: 0.25, block: 0.12, fancy: 0.3 },
    4: { wrap: 0.45, block: 0.3, fancy: 0.5 },
    8: { wrap: 0.7, block: 0.6, fancy: 0.7 },
  }

  const hash = (text) => {
    let h = 2166136261
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
    return h >>> 0
  }
  const seeded = (text) => {
    let h = hash(text) | 0
    return () => {
      h = Math.imul(h ^ (h >>> 15), 2246822507)
      h = Math.imul(h ^ (h >>> 13), 3266489909)
      return ((h ^= h >>> 16) >>> 0) / 4294967296
    }
  }

  const quote = (s) => `"${s.replace(/[\\"]/g, '\\$&').replace(/\n/g, '\\n')}"`
  const file = (src) => new URL(src).pathname.split('/').pop()

  function camo(rows, level, draft, lang = 'python') {
    const L = LANGS.code(lang)
    const odds = LEVEL[level]
    const out = odds ? L.header.map((text) => ({ kind: 'code', text })) : []
    const code = (text) => out.push({ kind: 'code', text })
    const isBlank = (l) => l.kind === 'code' && l.text === ''
    let previous
    const blank = () => out.length && !isBlank(out.at(-1)) && code('')

    const place = (seed, forms, line) => {
      const rand = seeded(seed)
      const pick = (list) => list[Math.floor(rand() * list.length)]
      const [pre, post] = forms === L.send || (odds && rand() < odds.fancy) ? pick(forms) : forms[0]
      if (!odds) return out.push({ ...line, indent: '', pre, post })
      const snippet = (list) => {
        let i = Math.floor(rand() * list.length)
        if (list[i] === previous) i = (i + 1) % list.length
        previous = list[i]
        return list[i].replaceAll('$f', pick(L.names)).split('\n')
      }
      for (let n = 0; n < 2 && rand() < odds.block; n++) {
        blank()
        snippet(L.blocks).forEach(code)
        blank()
      }
      if (rand() < odds.wrap) {
        blank()
        for (const l of snippet(L.wrappers)) l.trim() === '@' ? out.push({ ...line, indent: l.slice(0, l.indexOf('@')), pre, post }) : code(l)
        blank()
      } else {
        out.push({ ...line, indent: '', pre, post })
      }
    }

    const style = { mark: L.mark, open: L.open }
    for (const row of rows) {
      const who = row.who ?? null
      if (row.side === 'note') out.push({ kind: 'note', indent: '', text: row.text ?? 'media', mark: L.mark, who })
      else place(row.side + '\n' + row.text, row.side === 'recv' ? L.recv : L.send, { kind: row.side, text: row.text, media: row.media, src: row.src, who, ...style })
    }
    if (draft) place('draft\n' + draft.seed, L.send, { kind: 'draft', text: draft.text ?? '', ...style })
    return out
  }

  camo.text = (l) => {
    if (l.kind === 'code') return l.text
    const mark = l.mark ?? '#'
    if (l.kind === 'note') return `${l.indent}${mark} ${l.text}`
    const [open, close] = l.open ?? ['open(', ')']
    const empty = l.kind === 'draft' && !l.text
    const args = [l.text != null && !empty && quote(l.text), l.src && open + quote(file(l.src)) + close].filter(Boolean)
    return l.indent + l.pre + args.join(', ') + l.post + (l.media && !l.src ? `  ${mark} media` : '')
  }

  camo.filler = (seed, lang = 'python', count = 6, name = 'Main') => {
    const L = LANGS.code(lang)
    const rand = seeded(seed)
    const pick = (list) => list[Math.floor(rand() * list.length)]
    const left = [...L.blocks]
    const body = []
    for (let n = 0; n < count && left.length; n++) {
      const [block] = left.splice(Math.floor(rand() * left.length), 1)
      if (n) body.push('')
      body.push(...block.replaceAll('$f', pick(L.names)).split('\n'))
    }
    if (!L.shell) return [...L.header, ...body]
    const [open, close] = L.shell(name)
    return [...L.header, ...open, ...body.map((l) => (l ? L.indent + l : l)), ...close]
  }

  camo.hash = hash
  camo.quote = quote
  camo.file = file
  camo.LEVELS = [0, ...Object.keys(LEVEL).map(Number)]
  return camo
})()

if (typeof module !== 'undefined') module.exports = camo

if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert')
  const LANGS = require('./langs')
  const rows = [
    { side: 'note', text: '오후 2:14' },
    { side: 'recv', text: '뭐해?' },
    { side: 'send', text: 'say "hi"\nok\\' },
    { side: 'recv', text: null, media: true, src: 'https://cdn.example.com/v/a/photo.jpg?sig=1' },
    { side: 'send', text: null, media: true, src: null },
    { side: 'recv', text: '하나' },
    { side: 'recv', text: '둘' },
  ]
  for (const lang of Object.keys(LANGS.CODE)) {
    for (const level of camo.LEVELS) {
      const at = `${lang} level ${level}`
      const lines = camo(rows, level, { seed: 'thread:7', text: '' }, lang)
      const text = lines.map(camo.text)
      assert.deepStrictEqual(lines.filter((l) => l.kind !== 'code').map((l) => l.kind), ['note', 'recv', 'send', 'recv', 'send', 'recv', 'recv', 'draft'], at)
      for (const [i, l] of lines.entries()) {
        assert(!text[i].includes('\n'), 'one line each')
        assert(!text[i].includes('$f'), 'names filled in')
        if (l.kind !== 'code') assert(!/^\s*@\s*$/.test(text[i]), 'placeholder replaced')
      }
      assert(text.some((t) => t.includes('"say \\"hi\\"\\nok\\\\"')), `${at}: escaped`)
      assert(text.some((t) => t.includes('"photo.jpg"')), `${at}: picture`)
      assert(text.some((t) => t.includes(LANGS.code(lang).mark + ' 오후 2:14')), `${at}: note uses the language's comment`)
      assert.deepStrictEqual(lines, camo(rows, level, { seed: 'thread:7', text: '' }, lang), 'same input, same file')
      if (!level) assert.strictEqual(lines.length, rows.length + 1, 'level 0 is messages only')
      const typed = camo(rows, level, { seed: 'thread:7', text: '안녕' }, lang)
      assert.deepStrictEqual(typed.map((l) => ({ ...l, text: l.kind === 'draft' ? '' : l.text })), lines, 'typing keeps the layout')
      assert(typed.map(camo.text).some((t) => t.includes('"안녕"')), 'quotes appear once there is text')
      assert.strictEqual(camo(rows, level, undefined, lang).filter((l) => l.kind === 'draft').length, 0, 'no draft unless asked')
    }
    const filler = camo.filler('src/a', lang, 5, 'Thing')
    assert.deepStrictEqual(filler, camo.filler('src/a', lang, 5, 'Thing'), 'filler is stable')
    assert(filler.every((l) => !l.includes('$f')))
    const many = camo.filler('x', lang, 99)
    const blocks = many.join('\n').split('\n\n')
    assert.strictEqual(new Set(blocks).size, blocks.length, `${lang}: no block twice in one file`)
  }
  const py = camo(rows, 2, { seed: 'thread:7', text: '' }).map(camo.text)
  assert(py.some((t) => /^\s*print\("뭐해\?"/.test(t)))
  assert(py.some((t) => t.includes('open("photo.jpg")')))
  assert(camo(rows, 2, null, 'csharp').map(camo.text).some((t) => t.includes('"뭐해?");')))
  const many = Array.from({ length: 60 }, (_, i) => ({ side: i % 2 ? 'recv' : 'send', text: 'message ' + i }))
  assert(camo(many, 8).length > camo(many, 4).length && camo(many, 4).length > camo(many, 2).length, 'higher level, more filler')
  console.log('ok')
}
