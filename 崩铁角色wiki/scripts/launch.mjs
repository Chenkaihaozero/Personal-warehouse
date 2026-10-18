#!/usr/bin/env node
/**
 * 崩铁角色 Wiki · 本地启动器
 *
 * 双击项目根目录的「启动网站.bat」时实际跑的就是这个脚本。它做了四件事：
 *   1. 检查依赖：缺 node_modules 就用 pnpm / corepack pnpm / npm 装一次（本机 npm install 已知损坏，故排在最后）
 *   2. 挑端口：5173 已被本站在跑就直接开浏览器；否则从 5173 起找第一个空闲端口
 *   3. 用「当前这个 node」直接执行 node_modules/vite/bin/vite.js，不经过 npm run，避开 npm 的问题
 *   4. 轮询到服务器真的能返回页面之后再打开浏览器（比固定 sleep 可靠），并打印确切地址
 *
 * 关闭窗口（或在窗口里按 Ctrl+C）即停止网站。
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/** 起始端口；可用环境变量 WIKI_PORT 覆盖（仅调试/多开时用得到） */
const FIRST_PORT = Number(process.env.WIKI_PORT) || 5173;
const PORT_TRIES = 12;
/** 加 --no-open（或设 WIKI_NO_OPEN=1）就只启动、不弹浏览器（自动化截图/无头环境用） */
const NO_OPEN = process.argv.includes('--no-open') || process.env.WIKI_NO_OPEN === '1';
/** index.html 的标题片段，用来确认「这个端口上跑的确实是我们这个站」 */
const MARK = '崩铁角色 Wiki';

const log = (s = '') => process.stdout.write(`${s}\n`);
const ok = (s) => log(`  [OK]   ${s}`);
const warn = (s) => log(`  [提示] ${s}`);
const bad = (s) => log(`  [失败] ${s}`);
const rule = () => log('─'.repeat(64));

const viteBin = () => path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const hasDeps = () => existsSync(viteBin());

/** 命令是否存在（会真的执行一次 --version） */
function available(cmd) {
  const r = spawnSync(cmd, ['--version'], { stdio: 'ignore', shell: true });
  return r.status === 0;
}

function installDeps() {
  const plans = [
    ['pnpm', ['install']],
    ['corepack', ['pnpm', 'install']],
    ['npm', ['install']],
  ];
  for (const [cmd, args] of plans) {
    if (!available(cmd)) continue;
    log(`  用 ${cmd} ${args.join(' ')} 安装依赖（第一次会比较慢）…`);
    log();
    const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: true });
    if (r.status === 0 && hasDeps()) return true;
    log();
    warn(`${cmd} 没有装成功，换下一个包管理器再试…`);
    log();
  }
  return false;
}

/** 只认回环地址：分别测 IPv4 与 IPv6，避免「localhost 解析到哪一族」的不确定性 */
const LOOPBACKS = ['127.0.0.1', '::1'];
const hostUrl = (host, port) => `http://${host.includes(':') ? `[${host}]` : host}:${port}/`;

function tryBind(port, host) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, host);
  });
}

/** 两族回环都必须空闲，vite 才有可能绑上这个端口 */
async function portFree(port) {
  for (const host of LOOPBACKS) {
    if (!(await tryBind(port, host))) return false;
  }
  return true;
}

/** 探测端口：能连上吗？连上的是不是我们这个站？ */
async function probe(port) {
  let up = false;
  for (const host of LOOPBACKS) {
    try {
      const res = await fetch(hostUrl(host, port), { signal: AbortSignal.timeout(1800) });
      const html = await res.text();
      up = true;
      if (html.includes(MARK)) return { up: true, ours: true, host };
    } catch {
      /* 这一族没人监听，试下一族 */
    }
  }
  return { up, ours: false, host: null };
}

function openBrowser(url) {
  if (NO_OPEN) {
    log(`  （--no-open：跳过自动打开浏览器，请手动访问 ${url}）`);
    return;
  }
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  } else if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
  } else {
    spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 等服务器真的能把首页吐出来（最多等 timeout 毫秒） */
async function waitReady(port, timeout) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const { ours } = await probe(port);
    if (ours) return true;
    await sleep(400);
  }
  return false;
}

async function main() {
  rule();
  log('  崩铁角色 Wiki · 本地启动器');
  log('  《崩坏：星穹铁道》角色与剧情档案库');
  rule();
  log();

  if (!hasDeps()) {
    log('  没有找到依赖（node_modules），先安装一次…');
    log();
    if (!installDeps()) {
      bad('依赖安装失败。请在本文件夹里打开终端，手动执行下面任意一条：');
      log('      pnpm install');
      log('      corepack pnpm install');
      log('      bun install');
      log();
      log('  本机的 npm install 存在已知问题（cacache / minipass 报错），所以放在最后才试。');
      return 1;
    }
    ok('依赖已就绪。');
    log();
  }

  let port = 0;
  for (let i = 0; i < PORT_TRIES && !port; i += 1) {
    const p = FIRST_PORT + i;
    const info = await probe(p);
    if (info.ours) {
      ok(`网站已经在 ${p} 端口跑着了，直接打开浏览器。`);
      openBrowser(`http://localhost:${p}/`);
      await sleep(1200);
      return 0;
    }
    if (info.up) {
      warn(`${p} 端口被别的程序占用，换一个。`);
    } else if (await portFree(p)) {
      port = p;
    } else {
      warn(`${p} 端口占用了，换一个。`);
    }
  }
  if (!port) {
    bad(`从 ${FIRST_PORT} 起连续 ${PORT_TRIES} 个端口都被占用了，请先关掉别的程序再试。`);
    return 1;
  }

  const url = `http://localhost:${port}/`;
  log(`  正在启动开发服务器（端口 ${port}）…`);
  log();

  const child = spawn(
    process.execPath,
    [viteBin(), '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: ROOT, stdio: 'inherit' },
  );
  child.on('exit', (code) => {
    log();
    log(`  开发服务器已退出（code ${code}）。`);
    process.exit(code ?? 0);
  });

  if (await waitReady(port, 45000)) {
    log();
    rule();
    ok(`网站已就绪：${url}`);
    log('  浏览器应该已经自动打开了；如果没有，手动访问上面这个地址。');
    log('  关闭这个窗口（或按 Ctrl+C）= 停止网站。');
    rule();
    openBrowser(url);
  } else {
    warn('等了一会儿服务器还没就绪，请看上面的终端输出（可能有报错信息）。');
  }
  return null; // 返回 null = 保持运行，不退出
}

main().then((code) => {
  if (code !== null) process.exit(code);
});
