const langs = (() => {
  const C_COMMENT = '//.*$|/\\*.*?\\*/'

  const CODE = {
    python: {
      label: '{} Python',
      exts: ['py', 'pyw'],
      mark: '#',
      indent: '    ',
      open: ['open(', ')'],
      header: ['import json', 'import logging', 'from pathlib import Path', '', 'logger = logging.getLogger(__name__)', ''],
      recv: [['print(', ')'], ['print(', ', flush=True)'], ['print(', ', end="\\n")']],
      send: [
        ['answer = input(', ')'],
        ['reply = input(', ')'],
        ['name = input(', ').strip()'],
        ['choice = input(', ').lower()'],
        ['query = input(', ')'],
        ['text = input(', ').strip()'],
        ['value = input(', ') or DEFAULT'],
        ['line = input(', ')'],
        ['command = input(', ').split()'],
        ['user_input = input(', ')'],
      ],
      names: ['handle_event', 'on_message', 'process', 'dispatch', 'sync_users', 'load_batch', 'refresh', 'run_job', 'consume', 'apply_patch', 'validate', 'export_rows'],
      wrappers: [
        'if __name__ == "__main__":\n    @',
        'with open(CONFIG_PATH) as f:\n    config = json.load(f)\n    @',
        'for attempt in range(3):\n    @\n    if attempt:\n        break',
        'try:\n    @\nexcept ValueError as err:\n    logger.warning("retrying: %s", err)',
        'if not CACHE:\n    @\nelse:\n    logger.debug("cache hit")',
        'def $f(event):\n    payload = json.loads(event["body"])\n    @\n    return payload.get("id")',
        'def $f(times=3):\n    while times > 0:\n        @\n        times -= 1',
        'async def $f(client, url):\n    resp = await client.get(url)\n    @\n    return resp.json()',
        'class Session:\n    def __init__(self, user):\n        self.user = user\n        @',
        'def $f(rows):\n    for row in rows:\n        if not row:\n            continue\n        @\n    return len(rows)',
      ],
      blocks: [
        'count += 1',
        'rows = [r for r in rows if r]',
        'logger.debug("tick")',
        'data = CACHE.get(key)',
        'index = (index + 1) % len(items)',
        'payload["seen"] = True',
        'queue.append(job)',
        'users = {u.id: u for u in session.query(User).all()}',
        'CONFIG_PATH = Path(__file__).parent / "config.json"',
        'CACHE = {}\nTIMEOUT = 30',
        '# TODO: move this into settings\nBASE_URL = "https://api.example.com/v1"',
        'total = sum(order.price * order.qty for order in orders)\nlogger.info("total=%s", total)',
        'def $f(rows):\n    return [r.strip().lower() for r in rows if r]',
        'def $f(path, data):\n    Path(path).write_text(json.dumps(data, indent=2))',
        'retries = 0\nwhile retries < TIMEOUT:\n    retries += 1',
        'def $f(items, size):\n    for i in range(0, len(items), size):\n        yield items[i:i + size]',
        'def $f(a, b):\n    merged = {**a, **b}\n    merged.pop("password", None)\n    return merged',
        '@dataclass\nclass Order:\n    id: int\n    price: float\n    qty: int = 1',
        'result = []\nfor row in rows:\n    if not row.get("active"):\n        continue\n    result.append(row["name"])',
        'def $f(value):\n    try:\n        return datetime.strptime(value, "%Y-%m-%d")\n    except ValueError:\n        return None',
        'def $f(text):\n    words = text.split()\n    counts = {}\n    for word in words:\n        counts[word] = counts.get(word, 0) + 1\n    return sorted(counts.items(), key=lambda kv: kv[1], reverse=True)',
      ],
      syntax: {
        comment: '#.*$',
        kw: 'import from return if elif else for while with as try except finally raise yield pass break continue await async',
        decl: 'def class lambda None True False and or not in is self',
      },
    },

    c: {
      label: 'C',
      exts: ['c', 'h'],
      mark: '//',
      indent: '    ',
      open: ['fopen(', ', "rb")'],
      header: ['#include <stdio.h>', '#include <stdlib.h>', '#include <string.h>', '#include <readline/readline.h>', '', '#define BUF_SIZE 256', ''],
      recv: [['puts(', ');'], ['printf("%s\\n", ', ');'], ['fprintf(stderr, "%s\\n", ', ');']],
      send: [['char *reply = readline(', ');'], ['char *line = readline(', ');'], ['char *input = readline(', ');'], ['const char *answer = readline(', ');'], ['char *cmd = readline(', ');']],
      names: ['handle_event', 'parse_args', 'load_config', 'process_buffer', 'init_queue', 'flush_log', 'read_packet', 'free_nodes', 'poll_device', 'reset_state'],
      wrappers: [
        'int main(int argc, char **argv) {\n    @\n    return 0;\n}',
        'for (int i = 0; i < 3; i++) {\n    @\n}',
        'if (argc > 1) {\n    @\n} else {\n    usage();\n}',
        'static void $f(void) {\n    @\n}',
        'while (running) {\n    @\n    if (errno) break;\n}',
        'static int $f(const char *path) {\n    FILE *fp = fopen(path, "r");\n    if (!fp) return -1;\n    @\n    fclose(fp);\n    return 0;\n}',
      ],
      blocks: [
        'static int count = 0;',
        'count++;',
        'char buf[BUF_SIZE];\nmemset(buf, 0, sizeof buf);',
        'typedef struct {\n    int id;\n    char name[32];\n} user_t;',
        'static size_t $f(const char *s) {\n    size_t n = 0;\n    while (s[n]) n++;\n    return n;\n}',
        'int *items = malloc(sizeof(int) * 16);\nif (!items) {\n    perror("malloc");\n    exit(1);\n}',
        '// TODO: handle partial reads\nssize_t n = read(fd, buf, sizeof buf);',
        'static void $f(node_t *head) {\n    while (head) {\n        node_t *next = head->next;\n        free(head);\n        head = next;\n    }\n}',
        'static volatile uint32_t ticks;',
        'void SysTick_Handler(void) {\n    ticks++;\n}',
      ],
      syntax: {
        comment: C_COMMENT,
        pre: true,
        kw: 'if else for while do switch case break continue return goto default sizeof',
        decl: 'int char void static const struct typedef unsigned signed long short float double enum extern volatile size_t ssize_t uint8_t uint16_t uint32_t NULL bool true false',
      },
    },

    cpp: {
      label: 'C++',
      exts: ['cpp', 'cc', 'cxx', 'hpp', 'hh', 'hxx'],
      mark: '//',
      indent: '    ',
      open: ['std::ifstream(', ', std::ios::binary)'],
      header: ['#include <iostream>', '#include <string>', '#include <vector>', '#include <unordered_map>', ''],
      recv: [['std::cout << ', ' << std::endl;'], ['std::cout << ', " << '\\n';"], ['std::clog << ', ' << std::endl;']],
      send: [['auto reply = prompt(', ');'], ['std::string line = prompt(', ');'], ['const auto answer = prompt(', ');'], ['auto input = read_line(', ');'], ['std::string cmd = read_line(', ');']],
      names: ['handle_event', 'load_assets', 'update', 'tick', 'dispatch', 'parse_config', 'flush', 'rebuild_index', 'on_hit', 'spawn'],
      wrappers: [
        'int main(int argc, char** argv) {\n    @\n    return 0;\n}',
        'for (const auto& item : items) {\n    @\n}',
        'void Session::$f() {\n    @\n}',
        'if (!cache.empty()) {\n    @\n}',
        'try {\n    @\n} catch (const std::exception& e) {\n    std::cerr << e.what() << std::endl;\n}',
        'template <typename T>\nvoid $f(const std::vector<T>& rows) {\n    for (const auto& row : rows) {\n        @\n    }\n}',
      ],
      blocks: [
        'std::vector<int> ids;\nids.reserve(64);',
        '++counter;',
        'auto it = cache.find(key);\nif (it != cache.end()) return it->second;',
        'struct Config {\n    std::string host = "127.0.0.1";\n    int port = 8080;\n};',
        'class Timer {\npublic:\n    void start();\n    double elapsed() const;\nprivate:\n    std::chrono::steady_clock::time_point begin_;\n};',
        'std::sort(items.begin(), items.end(), [](const auto& a, const auto& b) {\n    return a.id < b.id;\n});',
        'static std::unordered_map<std::string, int> $f(const std::string& text) {\n    std::unordered_map<std::string, int> counts;\n    std::istringstream in(text);\n    for (std::string word; in >> word;) ++counts[word];\n    return counts;\n}',
        '// TODO: make this thread-safe\nstatic std::mutex mtx;',
        'UPROPERTY(EditAnywhere, BlueprintReadWrite)\nfloat Health = 100.f;',
      ],
      syntax: {
        comment: C_COMMENT,
        pre: true,
        types: true,
        kw: 'if else for while do switch case break continue return try catch throw co_await default new delete',
        decl: 'int char void auto const static struct class public private protected template typename namespace using virtual override bool true false nullptr double float unsigned long this',
      },
    },

    csharp: {
      label: 'C#',
      exts: ['cs'],
      mark: '//',
      indent: '    ',
      open: ['File.ReadAllBytes(', ')'],
      header: ['using System;', 'using System.Collections.Generic;', 'using System.Linq;', 'using System.Threading.Tasks;', ''],
      recv: [['Console.WriteLine(', ');'], ['Debug.Log(', ');'], ['_logger.LogInformation(', ');']],
      send: [['var reply = Prompt(', ');'], ['string answer = Prompt(', ');'], ['var input = await PromptAsync(', ');'], ['var name = Prompt(', ').Trim();'], ["var command = Prompt(", ").Split(' ');"], ['string line = Prompt(', ') ?? string.Empty;']],
      names: ['HandleEvent', 'OnMessage', 'Process', 'Dispatch', 'SyncUsers', 'LoadBatch', 'Refresh', 'RunJob', 'Validate', 'ApplyPatch'],
      shell: (name) => [['namespace App;', '', `public class ${name}`, '{'], ['}']],
      wrappers: [
        'public void $f()\n{\n    @\n}',
        'foreach (var item in items)\n{\n    @\n}',
        'if (_cache.Count == 0)\n{\n    @\n}',
        'try\n{\n    @\n}\ncatch (InvalidOperationException ex)\n{\n    _logger.LogWarning(ex, "retrying");\n}',
        'private async Task $f(CancellationToken ct)\n{\n    await Task.Delay(100, ct);\n    @\n}',
        'void Update()\n{\n    if (Input.GetKeyDown(KeyCode.Space))\n    {\n        @\n    }\n}',
      ],
      blocks: [
        'private readonly Dictionary<string, int> _cache = new();',
        'private int _count;',
        'public record Order(int Id, decimal Price, int Qty = 1);',
        '[SerializeField] private float speed = 5f;\n[SerializeField] private Transform target;',
        'public int $f(IEnumerable<int> values)\n{\n    return values.Where(v => v > 0).Sum();\n}',
        '// TODO: move to appsettings.json\nprivate const int TimeoutSeconds = 30;',
        'protected override void OnDisable()\n{\n    _subscription?.Dispose();\n    base.OnDisable();\n}',
        'public List<User> $f(IEnumerable<User> users)\n{\n    return users.Where(u => u.IsActive).OrderBy(u => u.Name).ToList();\n}',
        'private void Start()\n{\n    _rigidbody = GetComponent<Rigidbody>();\n}',
      ],
      syntax: {
        comment: C_COMMENT,
        types: true,
        kw: 'if else for foreach while do switch case break continue return try catch finally throw await yield default new in',
        decl: 'var void int string bool float double decimal public private protected internal static readonly const class record struct interface namespace using async override virtual this base null true false',
      },
    },

    java: {
      label: 'Java',
      exts: ['java'],
      mark: '//',
      indent: '    ',
      open: ['Files.readAllBytes(Path.of(', '))'],
      header: ['package com.example.demo;', '', 'import java.util.List;', 'import java.util.Map;', 'import java.util.HashMap;', ''],
      recv: [['System.out.println(', ');'], ['log.info(', ');'], ['System.out.print(', ');']],
      send: [['String reply = console.readLine(', ');'], ['var answer = console.readLine(', ');'], ['String line = console.readLine(', ').trim();'], ['String input = console.readLine(', ');'], ['final var cmd = console.readLine(', ').split(" ");']],
      names: ['handleEvent', 'onMessage', 'process', 'dispatch', 'syncUsers', 'loadBatch', 'refresh', 'runJob', 'validate', 'exportRows'],
      shell: (name) => [[`public class ${name} {`, ''], ['}']],
      wrappers: [
        'public static void main(String[] args) {\n    @\n}',
        'for (var item : items) {\n    @\n}',
        'if (cache.isEmpty()) {\n    @\n}',
        'try {\n    @\n} catch (IOException e) {\n    log.warn("retrying", e);\n}',
        'public void $f() {\n    @\n}',
        '@Override\npublic void run() {\n    @\n}',
      ],
      blocks: [
        'private final Map<String, Integer> cache = new HashMap<>();',
        'private int count;',
        'public record Order(long id, BigDecimal price, int qty) {}',
        '@GetMapping("/health")\npublic ResponseEntity<String> health() {\n    return ResponseEntity.ok("ok");\n}',
        'private int $f(List<Integer> values) {\n    return values.stream().mapToInt(Integer::intValue).sum();\n}',
        '// TODO: externalize\nprivate static final int TIMEOUT = 30;',
        'public List<User> $f(List<User> users) {\n    return users.stream().filter(User::isActive).toList();\n}',
        '@Autowired\nprivate UserRepository userRepository;',
      ],
      syntax: {
        comment: C_COMMENT,
        types: true,
        kw: 'if else for while do switch case break continue return try catch finally throw default new',
        decl: 'var void int long boolean double float char public private protected static final class record interface enum extends implements package import this super null true false',
      },
    },

    javascript: {
      label: 'JavaScript',
      exts: ['js', 'jsx', 'mjs', 'cjs'],
      mark: '//',
      indent: '  ',
      open: ['fs.readFileSync(', ')'],
      header: ["import fs from 'node:fs'", "import path from 'node:path'", '', 'const logger = console', ''],
      recv: [['console.log(', ')'], ['logger.info(', ')'], ['console.debug(', ')']],
      send: [['const reply = await prompt(', ')'], ['const answer = prompt(', ')'], ['let input = await rl.question(', ')'], ['const name = (await prompt(', ')).trim()'], ['const query = prompt(', ') ?? DEFAULT']],
      names: ['handleEvent', 'onMessage', 'process', 'dispatch', 'syncUsers', 'loadBatch', 'refresh', 'runJob', 'validate', 'exportRows'],
      wrappers: [
        'export async function $f(req, res) {\n  @\n  res.sendStatus(204)\n}',
        'for (const item of items) {\n  @\n}',
        'if (!cache.size) {\n  @\n}',
        "try {\n  @\n} catch (err) {\n  logger.warn('retrying', err)\n}",
        "app.get('/api/status', (req, res) => {\n  @\n  res.json({ ok: true })\n})",
        'useEffect(() => {\n  @\n}, [])',
      ],
      blocks: [
        'const cache = new Map()',
        'count += 1',
        'const active = users.filter((u) => u.active).map((u) => u.id)',
        "export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'",
        'function $f(rows) {\n  return rows.filter(Boolean).map((r) => r.trim().toLowerCase())\n}',
        'const total = orders.reduce((sum, o) => sum + o.price * o.qty, 0)',
        "// TODO: debounce this\nwindow.addEventListener('resize', onResize)",
        'async function $f(url) {\n  const res = await fetch(url)\n  if (!res.ok) throw new Error(res.statusText)\n  return res.json()\n}',
      ],
      syntax: {
        comment: C_COMMENT,
        backtick: true,
        types: true,
        kw: 'if else for while do switch case break continue return try catch finally throw await yield default new of in import export from',
        decl: 'const let var function class async this null undefined true false typeof extends',
      },
    },

    typescript: {
      label: '{} TypeScript',
      exts: ['ts', 'tsx', 'mts'],
      mark: '//',
      indent: '  ',
      open: ['await readFile(', ')'],
      header: ["import { readFile } from 'node:fs/promises'", "import type { Request, Response } from 'express'", ''],
      recv: [['console.log(', ')'], ['logger.info(', ')'], ['console.debug(', ')']],
      send: [['const reply: string = await prompt(', ')'], ['const answer = await prompt(', ')'], ["let input = prompt(", ") ?? ''"], ['const name = (await prompt(', ')).trim()'], ['const query = await rl.question(', ')']],
      names: ['handleEvent', 'onMessage', 'process', 'dispatch', 'syncUsers', 'loadBatch', 'refresh', 'runJob', 'validate', 'exportRows'],
      wrappers: [
        'export async function $f(req: Request, res: Response): Promise<void> {\n  @\n}',
        'for (const item of items) {\n  @\n}',
        'if (!cache.size) {\n  @\n}',
        "try {\n  @\n} catch (err) {\n  logger.warn('retrying', err)\n}",
        'useEffect(() => {\n  @\n}, [])',
        'export class Session {\n  constructor(private readonly user: User) {\n    @\n  }\n}',
      ],
      blocks: [
        'interface User {\n  id: number\n  name: string\n  active?: boolean\n}',
        "type Status = 'idle' | 'loading' | 'error'",
        'const cache = new Map<string, number>()',
        'export const $f = (rows: string[]): string[] =>\n  rows.filter(Boolean).map((r) => r.trim())',
        "const [status, setStatus] = useState<Status>('idle')",
        '// TODO: move to env\nexport const TIMEOUT_MS = 30_000',
        'const total = orders.reduce((sum, o) => sum + o.price * o.qty, 0)',
        'export async function $f(url: string): Promise<User[]> {\n  const res = await fetch(url)\n  return res.json() as Promise<User[]>\n}',
      ],
      syntax: {
        comment: C_COMMENT,
        backtick: true,
        types: true,
        kw: 'if else for while do switch case break continue return try catch finally throw await yield default new of in import export from as',
        decl: 'const let var function class async this null undefined true false typeof extends interface type enum implements private public readonly string number boolean void any unknown',
      },
    },

    go: {
      label: 'Go',
      exts: ['go'],
      mark: '//',
      indent: '\t',
      open: ['os.ReadFile(', ')'],
      header: ['package main', '', 'import (', '\t"fmt"', '\t"log"', '\t"os"', ')', ''],
      recv: [['fmt.Println(', ')'], ['log.Println(', ')'], ['fmt.Printf("%s\\n", ', ')']],
      send: [['reply := prompt(', ')'], ['answer, _ := readLine(', ')'], ['input := strings.TrimSpace(prompt(', '))'], ['line := prompt(', ')'], ['cmd := strings.Fields(prompt(', '))']],
      names: ['handleEvent', 'process', 'dispatch', 'syncUsers', 'loadBatch', 'refresh', 'runJob', 'validate', 'flush', 'consume'],
      wrappers: [
        'func main() {\n\t@\n}',
        'for _, item := range items {\n\t@\n}',
        'if err != nil {\n\t@\n\treturn err\n}',
        'func (s *Server) $f(w http.ResponseWriter, r *http.Request) {\n\t@\n\tw.WriteHeader(http.StatusNoContent)\n}',
        'go func() {\n\tdefer wg.Done()\n\t@\n}()',
        'select {\ncase msg := <-ch:\n\t_ = msg\n\t@\ncase <-ctx.Done():\n\treturn\n}',
      ],
      blocks: [
        'var mu sync.Mutex',
        'type User struct {\n\tID     int    `json:"id"`\n\tName   string `json:"name"`\n\tActive bool   `json:"active"`\n}',
        'func $f(rows []string) []string {\n\tout := rows[:0]\n\tfor _, r := range rows {\n\t\tif r != "" {\n\t\t\tout = append(out, r)\n\t\t}\n\t}\n\treturn out\n}',
        'func $f(ctx context.Context) error {\n\tctx, cancel := context.WithTimeout(ctx, 30*time.Second)\n\tdefer cancel()\n\treturn s.db.PingContext(ctx)\n}',
        '// TODO: make configurable\nconst maxRetries = 3',
        'var (\n\tErrNotFound = errors.New("not found")\n\tErrConflict = errors.New("conflict")\n)',
      ],
      syntax: {
        comment: C_COMMENT,
        backtick: true,
        types: true,
        kw: 'if else for range switch case break continue return go defer select default fallthrough goto',
        decl: 'func var const type struct interface package import map chan nil true false string int bool error byte',
      },
    },

    rust: {
      label: 'Rust',
      exts: ['rs'],
      mark: '//',
      indent: '    ',
      open: ['std::fs::read(', ')?'],
      header: ['use std::collections::HashMap;', 'use std::io::{self, Write};', ''],
      recv: [['println!(', ');'], ['eprintln!(', ');'], ['log::info!(', ');']],
      send: [['let reply = prompt(', ')?;'], ['let answer = prompt(', ')?.trim().to_string();'], ['let input = read_line(', ')?;'], ['let line = prompt(', ').unwrap_or_default();']],
      names: ['handle_event', 'process', 'dispatch', 'sync_users', 'load_batch', 'refresh', 'run_job', 'validate', 'flush', 'consume'],
      wrappers: [
        'fn main() -> anyhow::Result<()> {\n    @\n    Ok(())\n}',
        'for item in &items {\n    @\n}',
        'if let Some(user) = cache.get(&id) {\n    @\n}',
        'match event {\n    Event::Message(msg) => {\n        @\n    }\n    _ => {}\n}',
        'impl Session {\n    pub fn $f(&mut self) {\n        @\n    }\n}',
        'loop {\n    @\n    if done {\n        break;\n    }\n}',
      ],
      blocks: [
        'static COUNTER: AtomicUsize = AtomicUsize::new(0);',
        '#[derive(Debug, Clone, Serialize, Deserialize)]\npub struct User {\n    pub id: u64,\n    pub name: String,\n}',
        'fn $f(rows: &[String]) -> Vec<String> {\n    rows.iter().filter(|r| !r.is_empty()).map(|r| r.to_lowercase()).collect()\n}',
        'pub fn $f(orders: &[Order]) -> f64 {\n    orders.iter().map(|o| o.price * o.qty as f64).sum()\n}',
        '// TODO: move into config\nconst TIMEOUT_SECS: u64 = 30;',
        'pub enum Event {\n    Message(String),\n    Tick,\n}',
      ],
      syntax: {
        comment: C_COMMENT,
        types: true,
        kw: 'if else for while loop match break continue return in as',
        decl: 'fn let mut pub struct enum impl trait use mod const static self Self true false Some None Ok Err where async await move ref',
      },
    },

    kotlin: {
      label: 'Kotlin',
      exts: ['kt', 'kts'],
      mark: '//',
      indent: '    ',
      open: ['File(', ').readBytes()'],
      header: ['package com.example.app', '', 'import android.util.Log', 'import kotlinx.coroutines.launch', ''],
      recv: [['println(', ')'], ['Log.d(TAG, ', ')'], ['print(', ')']],
      send: [['val reply = prompt(', ')'], ['val answer = prompt(', ').trim()'], ['var input = prompt(', ') ?: ""'], ['val line = readInput(', ')'], ['val command = prompt(', ').split(" ")']],
      names: ['handleEvent', 'onMessage', 'process', 'dispatch', 'syncUsers', 'loadBatch', 'refresh', 'runJob', 'validate', 'bind'],
      shell: (name) => [[`class ${name} {`, ''], ['}']],
      wrappers: [
        'fun main() {\n    @\n}',
        'for (item in items) {\n    @\n}',
        'override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    @\n}',
        'lifecycleScope.launch {\n    @\n}',
        'if (cache.isEmpty()) {\n    @\n}',
        'private fun $f(items: List<Item>) {\n    items.forEach {\n        @\n    }\n}',
      ],
      blocks: [
        'private val cache = mutableMapOf<String, Int>()',
        'data class User(val id: Long, val name: String, val active: Boolean = true)',
        'private fun $f(users: List<User>) = users.filter { it.active }.map { it.id }',
        'companion object {\n    private const val TAG = "MainActivity"\n}',
        'private fun $f(rows: List<String>): List<String> =\n    rows.filter { it.isNotBlank() }.map { it.trim() }',
        '// TODO: inject via Hilt\nprivate lateinit var repository: UserRepository',
      ],
      syntax: {
        comment: C_COMMENT,
        types: true,
        kw: 'if else for while when break continue return try catch finally throw in is as',
        decl: 'fun val var class data object companion override private public internal protected lateinit suspend package import this null true false',
      },
    },

    swift: {
      label: 'Swift',
      exts: ['swift'],
      mark: '//',
      indent: '    ',
      open: ['UIImage(named: ', ')'],
      header: ['import Foundation', 'import SwiftUI', ''],
      recv: [['print(', ')'], ['debugPrint(', ')'], ['logger.info(', ')']],
      send: [['let reply = prompt(', ')'], ['let answer = prompt(', ').trimmingCharacters(in: .whitespaces)'], ['var input = prompt(', ') ?? ""'], ['let line = await ask(', ')']],
      names: ['handleEvent', 'onMessage', 'process', 'dispatch', 'syncUsers', 'loadBatch', 'refresh', 'runJob', 'validate', 'configure'],
      shell: (name) => [[`final class ${name} {`, ''], ['}']],
      wrappers: [
        'func $f() {\n    @\n}',
        'for item in items {\n    @\n}',
        'if let user = cache[id] {\n    @\n}',
        'Task {\n    @\n}',
        'var body: some View {\n    VStack {\n        @\n    }\n}',
        'do {\n    @\n} catch {\n    logger.error("\\(error)")\n}',
      ],
      blocks: [
        'private var cache: [String: Int] = [:]',
        'struct User: Codable, Identifiable {\n    let id: Int\n    var name: String\n}',
        '@State private var isLoading = false',
        'private func $f(_ rows: [String]) -> [String] {\n    rows.filter { !$0.isEmpty }\n}',
        '// TODO: move to config\nlet timeout: TimeInterval = 30',
        'private func $f(_ users: [User]) -> [Int] {\n    users.filter(\\.isActive).map(\\.id)\n}',
      ],
      syntax: {
        comment: C_COMMENT,
        types: true,
        kw: 'if else for while repeat switch case break continue return guard do try catch throw defer in await',
        decl: 'func let var struct class enum protocol extension import private public static final self Self nil true false some async',
      },
    },

    dart: {
      label: 'Dart',
      exts: ['dart'],
      mark: '//',
      indent: '  ',
      open: ['Image.asset(', ')'],
      header: ["import 'dart:async';", '', "import 'package:flutter/material.dart';", ''],
      recv: [['print(', ');'], ['debugPrint(', ');'], ['log(', ');']],
      send: [['final reply = await prompt(', ');'], ['var answer = prompt(', ');'], ['final name = (await prompt(', ')).trim();'], ['String line = prompt(', ');']],
      names: ['handleEvent', 'onTap', 'process', 'dispatch', 'syncUsers', 'loadBatch', 'refresh', 'runJob', 'validate', 'fetchItems'],
      shell: (name) => [[`class ${name} {`], ['}']],
      wrappers: [
        'void main() {\n  @\n}',
        'for (final item in items) {\n  @\n}',
        '@override\nWidget build(BuildContext context) {\n  @\n  return const SizedBox.shrink();\n}',
        'Future<void> $f() async {\n  @\n}',
        'if (mounted) {\n  setState(() {\n    @\n  });\n}',
        "try {\n  @\n} on FormatException catch (e) {\n  debugPrint('$e');\n}",
      ],
      blocks: [
        'final _cache = <String, int>{};',
        'int _count = 0;',
        'final List<String> _items = [];',
        'List<String> $f(List<String> rows) =>\n    rows.where((r) => r.isNotEmpty).map((r) => r.trim()).toList();',
        '// TODO: move to theme\nstatic const kPadding = EdgeInsets.all(16);',
        'late final AnimationController _controller;',
        '@override\nvoid dispose() {\n  _controller.dispose();\n  super.dispose();\n}',
      ],
      syntax: {
        comment: C_COMMENT,
        types: true,
        kw: 'if else for while do switch case break continue return try catch on finally throw await yield in',
        decl: 'final var const void late class extends with required this super null true false async override int double String bool dynamic static',
      },
    },

    php: {
      label: 'PHP',
      exts: ['php'],
      mark: '//',
      indent: '    ',
      open: ['file_get_contents(', ')'],
      header: ['<?php', '', 'declare(strict_types=1);', '', 'namespace App\\Http\\Controllers;', ''],
      recv: [['echo ', ' . PHP_EOL;'], ['error_log(', ');'], ['print(', ');']],
      send: [['$reply = readline(', ');'], ['$answer = trim(readline(', '));'], ['$input = readline(', ') ?: DEFAULT;'], ['$line = readline(', ');']],
      names: ['handleEvent', 'store', 'index', 'update', 'destroy', 'syncUsers', 'refresh', 'validateInput', 'show', 'export'],
      shell: (name) => [[`class ${name}`, '{'], ['}']],
      wrappers: [
        'public function $f(Request $request)\n{\n    @\n}',
        'foreach ($items as $item) {\n    @\n}',
        'if (empty($cache)) {\n    @\n}',
        'try {\n    @\n} catch (\\Throwable $e) {\n    report($e);\n}',
        "Route::get('/status', function () {\n    @\n});",
      ],
      blocks: [
        'private array $cache = [];',
        "protected $guarded = ['id'];",
        'public function $f(array $rows): array\n{\n    return array_values(array_filter(array_map(\'trim\', $rows)));\n}',
        "// TODO: cache this\nprivate const TIMEOUT = 30;",
        'public function $f(): HasMany\n{\n    return $this->hasMany(Order::class);\n}',
      ],
      syntax: {
        comment: C_COMMENT + '|#.*$',
        vars: true,
        types: true,
        kw: 'if else foreach for while switch case break continue return try catch finally throw new as fn',
        decl: 'function public private protected static class namespace use array string int bool null true false declare echo',
      },
    },

    ruby: {
      label: 'Ruby',
      exts: ['rb', 'rake'],
      mark: '#',
      indent: '  ',
      open: ['File.read(', ')'],
      header: ["require 'json'", "require 'logger'", ''],
      recv: [['puts ', ''], ['puts(', ')'], ['logger.info(', ')']],
      send: [['reply = ask(', ')'], ['answer = prompt(', ').strip'], ['input = ask(', ') || DEFAULT'], ['name = ask(', ').chomp']],
      names: ['handle_event', 'process', 'dispatch', 'sync_users', 'load_batch', 'refresh', 'run_job', 'validate', 'normalize', 'notify'],
      wrappers: [
        'def $f\n  @\nend',
        'items.each do |item|\n  @\nend',
        'if cache.empty?\n  @\nend',
        'begin\n  @\nrescue StandardError => e\n  logger.warn(e.message)\nend',
        'def create\n  @\n  head :no_content\nend',
      ],
      blocks: [
        'CACHE = {}.freeze',
        'active = users.select(&:active?).map(&:id)',
        'def $f(rows)\n  rows.compact.map(&:strip).reject(&:empty?)\nend',
        'validates :email, presence: true, uniqueness: true',
        '# TODO: move to credentials\nTIMEOUT = 30',
        'has_many :orders, dependent: :destroy',
        'before_action :authenticate_user!',
      ],
      syntax: {
        comment: '#.*$',
        vars: true,
        types: true,
        kw: 'if elsif else unless while until for in do end begin rescue ensure return yield break next case when then',
        decl: 'def class module self nil true false require attr_reader attr_accessor',
      },
    },

    lua: {
      label: 'Lua',
      exts: ['lua'],
      mark: '--',
      indent: '  ',
      open: ['love.graphics.newImage(', ')'],
      header: ['local json = require("lib.json")', '', 'local M = {}', ''],
      recv: [['print(', ')'], ['log.info(', ')'], ['io.write(', ', "\\n")']],
      send: [['local reply = prompt(', ')'], ['local answer = ask(', ')'], ['local input = prompt(', ') or DEFAULT'], ['local line = readline(', ')']],
      names: ['handleEvent', 'update', 'draw', 'spawn', 'reset', 'load', 'onCollide', 'tick', 'move', 'shoot'],
      wrappers: [
        'function M.$f()\n  @\nend',
        'for _, item in ipairs(items) do\n  @\nend',
        'if not cache[id] then\n  @\nend',
        'function love.update(dt)\n  @\nend',
        'local ok, err = pcall(function()\n  @\nend)',
      ],
      blocks: [
        'local count = 0',
        'local cache = setmetatable({}, { __mode = "k" })',
        'local function $f(rows)\n  local out = {}\n  for _, r in ipairs(rows) do\n    if r ~= "" then out[#out + 1] = r end\n  end\n  return out\nend',
        '-- TODO: move to config\nlocal TIMEOUT = 30',
        'function M.$f(player, dt)\n  player.x = player.x + player.speed * dt\nend',
      ],
      syntax: {
        comment: '--.*$',
        kw: 'if then else elseif for while do end return break in repeat until not and or',
        decl: 'local function nil true false self',
      },
    },
  }

  const LITE = {
    markdown: { label: 'Markdown', exts: ['md', 'markdown'], syntax: {} },
    json: { label: '{} JSON', names: ['.prettierrc'], exts: ['json', 'jsonc', 'uproject', 'uplugin', 'asmdef', 'arb', 'inputactions', 'shadergraph'], syntax: { decl: 'true false null' } },
    yaml: { label: 'YAML', names: ['.clang-format'], exts: ['yml', 'yaml', 'unity', 'meta', 'prefab', 'asset', 'mat', 'anim', 'controller', 'mixer', 'physicmaterial', 'mako'], syntax: { comment: '#.*$', decl: 'true false null' } },
    xml: { label: 'XML', exts: ['xml', 'csproj', 'plist', 'storyboard', 'xib', 'props', 'resx', 'entitlements', 'xcscheme'], syntax: { comment: '<!--.*?-->', tags: true } },
    html: { label: 'HTML', exts: ['html', 'htm', 'erb', 'vue', 'svelte'], syntax: { comment: '<!--.*?-->', tags: true } },
    css: { label: 'CSS', exts: ['css', 'scss', 'sass', 'less'], syntax: { comment: '/\\*.*?\\*/' } },
    toml: { label: 'TOML', exts: ['toml', 'lock'], syntax: { comment: '#.*$', decl: 'true false' } },
    ini: { label: 'Properties', names: ['.editorconfig', '.env', '.env.local'], exts: ['ini', 'cfg', 'properties', 'env', 'example', 'editorconfig'], syntax: { comment: '[#;].*$', decl: 'true false' } },
    groovy: { label: 'Groovy', exts: ['gradle', 'groovy'], syntax: { comment: C_COMMENT, decl: 'true false def' } },
    sql: { label: 'SQL', exts: ['sql'], syntax: { comment: '--.*$', kw: 'SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE PRIMARY KEY NOT NULL DEFAULT REFERENCES INDEX ON' } },
    shell: { label: 'Shell Script', names: ['gradlew', 'mvnw'], exts: ['sh', 'bash', 'zsh', 'ps1'], syntax: { comment: '#.*$', kw: 'if then else fi for do done case esac in function return export' } },
    makefile: { label: 'Makefile', names: ['Makefile', 'makefile', 'GNUmakefile'], exts: ['mk', 'ld'], syntax: { comment: '#.*$' } },
    cmake: { label: 'CMake', names: ['CMakeLists.txt'], exts: ['cmake'], syntax: { comment: '#.*$' } },
    docker: { label: 'Dockerfile', names: ['Dockerfile'], syntax: { comment: '#.*$', kw: 'FROM AS RUN COPY ADD WORKDIR CMD EXPOSE ENV ARG ENTRYPOINT USER' } },
    ignore: { label: 'Ignore', names: ['.gitignore', '.dockerignore', '.npmignore', '.vscodeignore', '.gitattributes'], syntax: { comment: '#.*$' } },
    ruby: { label: 'Ruby', names: ['Gemfile', 'Rakefile', 'Podfile', 'config.ru'], syntax: CODE.ruby.syntax },
    php: { label: 'PHP', names: ['artisan'], syntax: CODE.php.syntax },
  }
  const TEXT = { id: 'text', label: 'Plain Text', syntax: {} }

  for (const [id, spec] of Object.entries(CODE)) Object.assign(spec, { id, code: true })
  for (const [id, spec] of Object.entries(LITE)) spec.id = id
  const ALL = [...Object.values(LITE).filter((s) => s.names), ...Object.values(CODE), ...Object.values(LITE)]

  const of = (p) => {
    const name = p.slice(p.lastIndexOf('/') + 1)
    const dot = name.lastIndexOf('.')
    const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
    return ALL.find((s) => s.names?.includes(name)) ?? ALL.find((s) => s.exts?.includes(ext)) ?? TEXT
  }
  const code = (id) => CODE[id] ?? CODE.python

  const VSCODE = {
    python: 'python', c: 'c', cpp: 'cpp', csharp: 'csharp', java: 'java', javascript: 'javascript', typescript: 'typescript',
    go: 'go', rust: 'rust', kotlin: 'kotlin', swift: 'swift', dart: 'dart', php: 'php', ruby: 'ruby', lua: 'lua',
    markdown: 'markdown', json: 'json', yaml: 'yaml', xml: 'xml', html: 'html', css: 'css', ini: 'properties',
    groovy: 'groovy', sql: 'sql', shell: 'shellscript', makefile: 'makefile', docker: 'dockerfile', ignore: 'ignore',
  }
  const VSCODE_EXT = {
    tsx: 'typescriptreact', jsx: 'javascriptreact', scss: 'scss', sass: 'sass', less: 'less', erb: 'erb', ps1: 'powershell', env: 'dotenv', gradle: 'gradle',
    unity: null, meta: null, prefab: null, asset: null, mat: null, anim: null, controller: null, mixer: null, inputactions: null, shadergraph: null, mako: null, uproject: null, uplugin: null, asmdef: null, arb: null, lock: null, ld: null, example: null,
  }
  const vscode = (p) => {
    const name = p.slice(p.lastIndexOf('/') + 1)
    const dot = name.lastIndexOf('.')
    const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
    return ext in VSCODE_EXT ? VSCODE_EXT[ext] : VSCODE[of(p).id] ?? null
  }

  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const words = (list) => (list ? `\\b(?:${list.split(/\s+/).map(esc).join('|')})\\b` : null)
  const compile = (s) =>
    new RegExp(
      [
        s.comment && `(?<com>${s.comment})`,
        s.pre && '(?<pre>^\\s*#\\s*\\w+)',
        s.tags && '(?<tag></?[\\w:.-]+|/?>)',
        `(?<str>(?:\\b[fFrRbB@$])?(?<q>["'${s.backtick ? '`' : ''}])(?:\\\\.|(?!\\k<q>).)*\\k<q>)`,
        '(?<num>\\b\\d+(?:\\.\\d+)?[fFLuU]?\\b)',
        s.kw && `(?<kw>${words(s.kw)})`,
        s.decl && `(?<decl>${words(s.decl)})`,
        s.vars && '(?<var>[$@]{1,2}\\w+)',
        '(?<ann>@\\w+|#\\[[^\\]]*\\])',
        '(?<fn>\\b[A-Za-z_]\\w*!?(?=\\())',
        s.types && '(?<type>\\b[A-Z][a-z]\\w*\\b)',
      ]
        .filter(Boolean)
        .join('|'),
      'g',
    )
  const compiled = new Map()
  const tokens = (text, id) => {
    const spec = CODE[id] ?? LITE[id] ?? TEXT
    if (!compiled.has(spec)) compiled.set(spec, compile(spec.syntax))
    const out = []
    let at = 0
    for (const m of text.matchAll(compiled.get(spec))) {
      const kind = Object.entries(m.groups).find(([k, v]) => v !== undefined && k !== 'q')[0]
      if (m.index > at) out.push([null, text.slice(at, m.index)])
      out.push([kind, m[0]])
      at = m.index + m[0].length
    }
    if (at < text.length || !out.length) out.push([null, text.slice(at)])
    return out
  }

  return { CODE, of, code, tokens, vscode }
})()

if (typeof module !== 'undefined') module.exports = langs

if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert')
  assert.strictEqual(langs.of('src/App.tsx').id, 'typescript')
  assert.strictEqual(langs.of('Assets/Scripts/Player.cs').id, 'csharp')
  assert.strictEqual(langs.of('CMakeLists.txt').id, 'cmake')
  assert.strictEqual(langs.of('.gitignore').id, 'ignore')
  assert.strictEqual(langs.of('notes.txt').id, 'text')
  assert.strictEqual(langs.vscode('src/App.tsx'), 'typescriptreact')
  assert.strictEqual(langs.vscode('Assets/Scenes/Main.unity'), null)
  assert.strictEqual(langs.vscode('Dockerfile'), 'dockerfile')
  const kinds = (text, id) => langs.tokens(text, id).filter(([k]) => k).map(([k, t]) => k + ':' + t)
  assert.deepStrictEqual(kinds('print("a # b")  # c', 'python'), ['fn:print', 'str:"a # b"', 'com:# c'])
  assert.deepStrictEqual(kinds('#include <stdio.h>', 'c'), ['pre:#include'])
  assert(kinds('Console.WriteLine("hi");', 'csharp').includes('fn:WriteLine'))
  assert(kinds('println!("x");', 'rust').includes('fn:println!'))
  assert.strictEqual(langs.tokens('', 'go').map(([, t]) => t).join(''), '')
  for (const spec of Object.values(langs.CODE)) {
    for (const key of ['header', 'recv', 'send', 'names', 'wrappers', 'blocks']) assert(spec[key].length, `${spec.id}.${key}`)
    for (const w of spec.wrappers) assert(w.split('\n').some((l) => l.trim() === '@'), `${spec.id} wrapper has a slot: ${w}`)
    const sample = 'x = "a" // b'
    assert.strictEqual(langs.tokens(sample, spec.id).map(([, t]) => t).join(''), sample, `${spec.id} keeps text`)
  }
  console.log('ok')
}
