// iPad screenshot pass (IPAD_AUDIT_2026-10.md). Drives the local Chrome
// headless over CDP with a coarse pointer, emulates an iPad Pro 11"
// (834 x 1210 / 1210 x 834) and writes tiled page screenshots plus a
// metrics report (overflow, tap targets under 44px, first font sizes).
// The dev server must be running on :3001.
//   node scripts/ipad-shots.mjs <absOutDir> <portrait|landscape> <path...>
// From Git Bash prefix MSYS_NO_PATHCONV=1 so "/" is not turned into a path.
// W / H / CDP_PORT / SHOT_SCALE / SHOT_DPR override the defaults.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [outDir, orientation, ...paths] = process.argv.slice(2);
const BASE = "http://localhost:3001";
const PORT = Number(process.env.CDP_PORT || 9333);
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const SCALE = Number(process.env.SHOT_SCALE || 0.6);
const DPR = Number(process.env.SHOT_DPR || 1);
const W = Number(process.env.W) || (orientation === "portrait" ? 834 : 1210);
const H = Number(process.env.H) || (orientation === "portrait" ? 1210 : 834);
mkdirSync(outDir, { recursive: true });

const profile = join(outDir, `_profile-${PORT}-${Date.now()}`);
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--hide-scrollbars",
  "--no-first-run",
  "--disable-gpu",
  `--window-size=${W},${H}`,
  "--blink-settings=primaryPointerType=2,availablePointerTypes=2,primaryHoverType=1,availableHoverTypes=1",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForChrome() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error("chrome did not start");
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.events = [];
    ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && this.pending.has(m.id)) { const { res, rej } = this.pending.get(m.id); this.pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } else if (m.method) this.events.push(m); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async waitEvent(name, timeout = 20000) { const t0 = Date.now(); while (Date.now() - t0 < timeout) { const i = this.events.findIndex((e) => e.method === name); if (i >= 0) return this.events.splice(i, 1)[0]; await sleep(50); } throw new Error("timeout " + name); }
}

async function openTab(url) {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const t = await r.json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });
  return { cdp: new CDP(ws), id: t.id };
}
async function closeTab(id) { await fetch(`http://127.0.0.1:${PORT}/json/close/${id}`); }

const METRICS = `(() => {
  const iw = innerWidth, ih = innerHeight;
  const out = { innerWidth: iw, innerHeight: ih, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight,
    coarse: matchMedia('(pointer: coarse)').matches, hover: matchMedia('(hover: hover)').matches, dpr: devicePixelRatio, ua: navigator.userAgent, overflow: [], smallTaps: [], fonts: {} };
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  for (const el of document.querymeSelectorAll ? [] : document.querySelectorAll('body *')) {
    if (!vis(el) || el.closest('.mobile-menu')) continue; const r = el.getBoundingClientRect();
    if (r.right > iw + 1 && getComputedStyle(el).position !== 'fixed') { out.overflow.push({ tag: el.tagName, cls: String(el.className).slice(0, 80), right: Math.round(r.right), left: Math.round(r.left) }); if (out.overflow.length > 15) break; }
  }
  for (const el of document.querySelectorAll('a, button, [role=button], input, select')) {
    if (!vis(el)) continue; const r = el.getBoundingClientRect(); let ok = r.width >= 44 && r.height >= 44;
    if (!ok) { const b = getComputedStyle(el, '::before'); if (b.content !== 'none' && b.position === 'absolute') { const h = parseFloat(b.height); if (h >= 44) ok = true; } }
    if (!ok) out.smallTaps.push({ text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + scrollY) });
  }
  for (const sel of ['h1','h2','h3','p','.coord','.text-quote']) { const el = document.querySelector(sel); if (el) out.fonts[sel] = getComputedStyle(el).fontSize + ' / ' + getComputedStyle(el).lineHeight; }
  return out; })()`;

await waitForChrome();
const report = {};
for (const path of paths) {
  const url = BASE + path;
  const { cdp, id } = await openTab("about:blank");
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: DPR, mobile: true, screenOrientation: { type: orientation === "portrait" ? "portraitPrimary" : "landscapePrimary", angle: orientation === "portrait" ? 0 : 90 } });
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Emulation.setUserAgentOverride", { userAgent: "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" });
  await cdp.send("Page.navigate", { url });
  await cdp.waitEvent("Page.loadEventFired", 60000).catch(() => {});
  await sleep(2500);
  // scroll pass so reveals / lazy images fire
  const total = (await cdp.send("Runtime.evaluate", { expression: "document.documentElement.scrollHeight", returnByValue: true })).result.value;
  for (let y = 0; y < total; y += Math.round(H * 0.8)) { await cdp.send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` }); await sleep(350); }
  await sleep(800);
  await cdp.send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
  await sleep(1200);
  const m = (await cdp.send("Runtime.evaluate", { expression: METRICS, returnByValue: true })).result.value;
  const slug = path.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home";
  report[path] = m;
  // tiles of 2 viewport heights
  const fullH = m.scrollHeight;
  const tileH = H * 2;
  let n = 0;
  for (let y = 0; y < fullH; y += tileH) {
    const h = Math.min(tileH, fullH - y);
    const shot = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 82, captureBeyondViewport: true, clip: { x: 0, y, width: W, height: h, scale: SCALE } });
    writeFileSync(join(outDir, `${slug}-${orientation}-${n++}.jpg`), Buffer.from(shot.data, "base64"));
  }
  console.log(path, orientation, `${W}x${H}`, "scrollH", fullH, "tiles", n, "overflow", m.overflow.length, "smallTaps", m.smallTaps.length, "coarse", m.coarse);
  await closeTab(id);
}
writeFileSync(join(outDir, `report-${orientation}.json`), JSON.stringify(report, null, 2));
chrome.kill();
process.exit(0);
