// Fuzzy matcher for all search boxes: prefixes, acronyms, Korean initials, romanized Korean.
const match = (() => {
  const R = typeof require !== 'undefined' ? require('./roman') : roman

  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
  const choseong = (s) => s.replace(/[가-힣]/g, (c) => CHO[Math.floor((c.charCodeAt(0) - 0xac00) / 588)])
  const onlyJamo = (q) => /^[ㄱ-ㅎ]+$/.test(q)

  // Start index of every word.
  const starts = (text) => {
    const out = []
    for (let i = 0; i < text.length; i++) {
      const c = text[i]
      const p = text[i - 1]
      if (!/[\p{L}\p{N}]/u.test(c)) continue
      if (!i || !/[\p{L}\p{N}]/u.test(p) || (/[a-z]/.test(p) && /[A-Z]/.test(c)) || (/\D/.test(p) && /\d/.test(c)) || (/[가-힣]/.test(c) !== /[가-힣]/.test(p))) out.push(i)
    }
    return out
  }

  const cache = new Map()
  const prepared = (text) => {
    let p = cache.get(text)
    if (p) return p
    if (cache.size > 20000) cache.clear()
    const lower = text.toLowerCase()
    const at = starts(text)
    let spelled = []
    try {
      spelled = /[가-힣]/.test(text) ? R.words(text, 8) : []
    } catch {}
    p = {
      lower,
      at,
      initials: at.map((i) => lower[i]).join(''),
      cho: choseong(lower),
      roman: spelled.join(''),
      romanInitials: spelled.map((w) => w[0]).join(''),
    }
    cache.set(text, p)
    return p
  }

  const range = (from, length) => Array.from({ length }, (_, i) => from + i)

  // Lower score = better. null = no match. hits = character indices in `text` to highlight.
  function one(q, text) {
    if (!q) return { score: 0, hits: [] }
    if (!text) return null
    const p = prepared(text)
    if (p.lower === q) return { score: 0, hits: range(0, q.length) }
    if (p.lower.startsWith(q)) return { score: 1, hits: range(0, q.length) }
    const word = p.at.find((i) => p.lower.startsWith(q, i))
    if (word !== undefined) return { score: 2, hits: range(word, q.length) }
    if (q.length >= 2 && p.initials.startsWith(q)) return { score: 3, hits: p.at.slice(0, q.length) }
    const sub = p.lower.indexOf(q)
    if (sub >= 0) return { score: 4, hits: range(sub, q.length) }
    if (onlyJamo(q)) {
      const c = p.cho.indexOf(q)
      if (c >= 0) return { score: c ? 5.5 : 5, hits: range(c, q.length) }
    }
    const squash = q.replace(/[\s_.\-]/g, '')
    if (squash && p.roman) {
      if (p.roman.startsWith(squash)) return { score: 5, hits: [] }
      if (squash.length >= 2 && p.romanInitials.startsWith(squash)) return { score: 6, hits: [] }
      if (p.roman.includes(squash)) return { score: 6.5, hits: [] }
    }
    if (q.length >= 2 && /[a-z0-9]/.test(q)) {
      const hits = []
      let gaps = 0
      for (let i = 0, j = 0; i < p.lower.length && j < q.length; i++) {
        if (p.lower[i] === q[j]) {
          if (hits.length && i !== hits.at(-1) + 1) gaps++
          hits.push(i)
          j++
        }
      }
      if (hits.length === q.length && gaps <= Math.max(2, q.length - 1)) return { score: 7 + gaps / 10, hits }
    }
    return null
  }

  // Best match of `query` against any of `texts`.
  function score(query, texts) {
    const q = String(query ?? '').trim().toLowerCase()
    const list = texts.map((t) => (t == null ? '' : String(t)))
    if (!q) return { score: 0, index: 0, hits: [] }
    const best = (part) => {
      let top = null
      list.forEach((text, index) => {
        const m = one(part, text)
        if (m && (!top || m.score < top.score)) top = { ...m, index }
      })
      return top
    }
    const whole = best(q)
    if (whole) return whole
    const parts = q.split(/\s+/).filter(Boolean)
    if (parts.length < 2) return null
    let total = 0
    const hits = []
    for (const part of parts) {
      const m = best(part)
      if (!m) return null
      total += m.score
      if (m.index === 0) hits.push(...m.hits)
    }
    return { score: 8 + total / parts.length, index: 0, hits: [...new Set(hits)].sort((a, b) => a - b) }
  }

  // Filter + sort items. `fields(item)` returns the strings to look at, most important first.
  function filter(query, items, fields, tie = () => 0) {
    return items
      .map((item, order) => ({ item, order, m: score(query, fields(item)) }))
      .filter((x) => x.m)
      .sort((a, b) => a.m.score - b.m.score || a.m.index - b.m.index || tie(a.item, b.item) || a.order - b.order)
      .map((x) => ({ item: x.item, hits: x.m.index === 0 ? x.m.hits : [] }))
  }

  // Split text into [plain, highlighted, plain, ...] runs for rendering.
  function runs(text, hits = []) {
    const set = new Set(hits)
    const out = []
    for (let i = 0; i < text.length; i++) {
      const on = set.has(i)
      if (out.length && out.at(-1).on === on) out.at(-1).text += text[i]
      else out.push({ text: text[i], on })
    }
    return out
  }

  return { score, filter, runs, choseong }
})()

if (typeof module !== 'undefined') module.exports = match

if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert')
  const hit = (q, ...texts) => match.score(q, texts) !== null
  assert(hit('vsc', 'Visual Stagram Code'), 'acronym')
  assert(hit('inst', 'Instagram'), 'prefix')
  assert(hit('gram', 'Instagram'), 'substring')
  assert(hit('km', 'kim_minsu.py'), 'snake acronym')
  assert(hit('km', 'KimMinsu.cs'), 'camel acronym')
  assert(hit('ㄱㅁㅅ', '김민수'), 'choseong')
  assert(hit('ㅁㅅ', '김민수'), 'choseong middle')
  assert(hit('minsu', '김민수'), 'romanized')
  assert(hit('km', '김민수'), 'romanized initials')
  assert(hit('min py', 'kim_minsu.py'), 'words in any order')
  assert(hit('tgtrm', 'View: Toggle Terminal'), 'subsequence')
  assert(!hit('zzz', 'Visual Stagram Code'))
  assert(!hit('ㅋ', '김민수'))
  assert(match.score('vis', ['Visual Stagram Code']).score < match.score('vsc', ['Visual Stagram Code']).score, 'prefix beats acronym')
  assert.deepStrictEqual(match.score('vsc', ['Visual Stagram Code']).hits, [0, 7, 15])
  const sorted = match.filter('ki', ['skip.py', 'kim_minsu.py', 'akita.py'], (x) => [x]).map((x) => x.item)
  assert.deepStrictEqual(sorted, ['kim_minsu.py', 'skip.py', 'akita.py'])
  assert.deepStrictEqual(match.runs('abc', [1]), [{ text: 'a', on: false }, { text: 'b', on: true }, { text: 'c', on: false }])
  console.log('ok')
}
