// Self-update from GitHub Releases with a single uploaded file.
// Upload just the installer (any *.exe) — or a *.zip containing it — to a release; no latest.yml needed.
// The version comes from the release tag or title ("v0.3.1", "Ver-0.3.1", "0.4" ...).
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn, execFile } = require('child_process')

const parse = (text) => {
  const m = String(text ?? '').match(/(\d+)\.(\d+)(?:\.(\d+))?/)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)] : null
}
const newer = (a, b) => {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i]
  return false
}
const pickAsset = (assets = []) =>
  assets.find((a) => /\.exe$/i.test(a.name) && /setup/i.test(a.name)) ||
  assets.find((a) => /\.exe$/i.test(a.name)) ||
  assets.find((a) => /\.zip$/i.test(a.name) && !/mac|darwin|arm64/i.test(a.name))

function createUpdater({ repo, version, fetch, onState = () => {}, dir = path.join(os.tmpdir(), 'visual-stagram-code-update') }) {
  let found = null // { version, url, name, notes, page }
  let ready = null // path of the downloaded installer
  let busy = false

  async function check() {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'visual-stagram-code' } })
    if (!res.ok) throw new Error('GitHub ' + res.status)
    const release = await res.json()
    const latest = parse(release.tag_name) ?? parse(release.name)
    const asset = pickAsset(release.assets)
    if (!latest || !asset || !newer(latest, parse(version))) return null
    found = { version: latest.join('.'), url: asset.browser_download_url, name: asset.name, size: asset.size, notes: release.body ?? '', page: release.html_url }
    return found
  }

  async function download() {
    if (!found) return null
    fs.mkdirSync(dir, { recursive: true })
    const target = path.join(dir, `${found.version}-${found.name.replace(/[^\w.-]/g, '_')}`)
    if (!(fs.existsSync(target) && found.size && fs.statSync(target).size === found.size)) {
      const res = await fetch(found.url, { headers: { 'User-Agent': 'visual-stagram-code' } })
      if (!res.ok || !res.body) throw new Error('download ' + res.status)
      const total = Number(res.headers.get('content-length')) || found.size || 0
      const part = target + '.part'
      const out = fs.createWriteStream(part)
      let got = 0
      let shown = -1
      for await (const chunk of res.body) {
        got += chunk.length
        if (!out.write(chunk)) await new Promise((r) => out.once('drain', r))
        const percent = total ? Math.floor((got / total) * 100) : null
        if (percent !== null && percent >= shown + 5) onState('progress', { version: found.version, percent: (shown = percent) })
      }
      await new Promise((resolve, reject) => out.end((err) => (err ? reject(err) : resolve())))
      fs.renameSync(part, target)
    }
    ready = /\.zip$/i.test(target) ? await unzip(target) : target
    return ready
  }

  // Windows 10+ ships bsdtar, which reads zip files.
  async function unzip(zip) {
    const into = zip.replace(/\.zip$/i, '')
    fs.rmSync(into, { recursive: true, force: true })
    fs.mkdirSync(into, { recursive: true })
    await new Promise((resolve, reject) => execFile('tar', ['-xf', zip, '-C', into], (err) => (err ? reject(err) : resolve())))
    const exes = []
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.exe$/i.test(e.name) && exes.push(path.join(d, e.name))))
    walk(into)
    const exe = exes.find((p) => /setup/i.test(path.basename(p))) ?? exes[0]
    if (!exe) throw new Error('no installer in zip')
    return exe
  }

  // Check, and if there is a newer release download it in the background.
  async function run({ manual = false } = {}) {
    if (busy) return
    if (ready) return onState('ready', { version: found?.version, notes: found?.notes, page: found?.page })
    busy = true
    try {
      const update = await check()
      if (!update) return manual && onState('latest', { version })
      onState('downloading', { version: update.version })
      await download()
      onState('ready', { version: update.version, notes: update.notes, page: update.page })
    } catch (err) {
      if (manual) onState('error', { message: String(err?.message ?? err) })
    } finally {
      busy = false
    }
  }

  // Silent install, then the installer starts the new version (--force-run). Returns false if nothing is ready.
  function install({ relaunch = true } = {}) {
    if (!ready || !fs.existsSync(ready)) return false
    const args = ['/S', '--updated', ...(relaunch ? ['--force-run'] : [])]
    spawn(ready, args, { detached: true, stdio: 'ignore', windowsHide: true }).unref()
    ready = null
    return true
  }

  return { run, check, download, install, get pending() { return !!ready }, get found() { return found } }
}

module.exports = { createUpdater, parse, newer, pickAsset }

if (require.main === module) {
  const assert = require('assert')
  assert.deepStrictEqual(parse('v0.3.1'), [0, 3, 1])
  assert.deepStrictEqual(parse('v0.2.0_on_publish'), [0, 2, 0])
  assert.deepStrictEqual(parse('Ver-0.4'), [0, 4, 0])
  assert.strictEqual(parse('latest'), null)
  assert(newer([0, 3, 1], [0, 3, 0]) && newer([1, 0, 0], [0, 9, 9]) && !newer([0, 3, 0], [0, 3, 0]) && !newer([0, 2, 9], [0, 3, 0]))
  assert.strictEqual(pickAsset([{ name: 'latest.yml' }, { name: 'Visual-Stagram-Code-Setup.exe' }]).name, 'Visual-Stagram-Code-Setup.exe')
  assert.strictEqual(pickAsset([{ name: 'Visual-Stagram-Code-mac-arm64.zip' }, { name: 'vsc-win.zip' }]).name, 'vsc-win.zip')
  assert.strictEqual(pickAsset([{ name: 'notes.txt' }]), undefined)
  console.log('ok')
}
