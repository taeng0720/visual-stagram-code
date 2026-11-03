const net = require('net')
const fs = require('fs')
const os = require('os')
const path = require('path')
const GUEST = require('./scrape')

const where =
  process.env.VSC_BRIDGE ||
  (process.platform === 'win32'
    ? `\\\\.\\pipe\\visual-stagram-code-${os.userInfo().username}`
    : path.join(os.homedir(), '.visual-stagram-code.sock'))

const MAX_LINE = 64 * 1024 * 1024

module.exports = function bridge({ page, show, onClients }) {
  const clients = new Set()
  let last = ''

  const tick = async () => {
    const wc = page()
    if (!clients.size || !wc) return
    let state = { type: 'state', away: true, ok: false, threads: [], rows: [], pending: 0, canSend: false }
    try {
      if (new URL(wc.getURL()).pathname.startsWith('/direct')) {
        state = { ...state, away: false, ...(await wc.executeJavaScript(GUEST.scrape)) }
      }
    } catch {
      return
    }
    const json = JSON.stringify(state)
    if (json === last) return
    last = json
    for (const client of clients) client.write(json + '\n')
  }
  setInterval(tick, 1000)

  const run = (js) => page()?.executeJavaScript(js)
  const commands = {
    open: ({ index }) => run(GUEST.open(index)),
    page: ({ dir }) => run(GUEST.page(dir)),
    attach: ({ files }) =>
      Array.isArray(files) &&
      run(GUEST.attach(files.map((f) => ({ name: String(f.name), type: String(f.type), data: String(f.data) })))),
    show: () => show(),
    async send({ text }) {
      const wc = page()
      if (!wc || !(await wc.executeJavaScript(GUEST.focus))) return
      if (text) await wc.insertText(String(text))
      for (const type of ['keyDown', 'char', 'keyUp']) wc.sendInputEvent({ type, keyCode: 'Enter' })
    },
  }

  const server = net.createServer((socket) => {
    clients.add(socket)
    onClients(clients.size)
    last = ''
    tick()

    let buffer = ''
    socket.setEncoding('utf8')
    socket.on('data', (chunk) => {
      buffer += chunk
      if (buffer.length > MAX_LINE) return socket.destroy()
      for (let end; (end = buffer.indexOf('\n')) !== -1; ) {
        const text = buffer.slice(0, end)
        buffer = buffer.slice(end + 1)
        try {
          const message = JSON.parse(text)
          if (Object.hasOwn(commands, message.type)) Promise.resolve(commands[message.type](message)).catch(() => {})
        } catch {}
      }
    })
    socket.on('error', () => {})
    socket.on('close', () => {
      clients.delete(socket)
      onClients(clients.size)
    })
  })
  server.on('error', (err) => console.error('bridge:', err.message))

  const unix = process.platform !== 'win32'
  if (unix) fs.rmSync(where, { force: true })
  server.listen(where, () => unix && fs.chmodSync(where, 0o600))
  return () => {
    server.close()
    if (unix) fs.rmSync(where, { force: true })
  }
}
