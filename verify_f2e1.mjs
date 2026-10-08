import { chromium } from 'playwright';
const URL = 'http://localhost:8080/';
const out = {}; const errors = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addInitScript(() => { try { sessionStorage.setItem('hasSeenWelcome','true'); } catch {} });
const page = await ctx.newPage();
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0,200)); });

const termPanel = () => page.locator('[data-panel-id="terminal-panel"], #terminal-panel').first();
const handle = () => page.locator('[data-panel-resize-handle-id]').first();
async function info(label) {
  const r = await page.evaluate(() => {
    const p = document.querySelector('[data-panel-id="terminal-panel"]') || document.getElementById('terminal-panel');
    const e = document.querySelector('[data-panel-id="editor-panel"]') || document.getElementById('editor-panel');
    const h = document.querySelector('[data-panel-resize-handle-id]');
    const r = el => el ? (({top,height})=>({top:Math.round(top),height:Math.round(height)}))(el.getBoundingClientRect()) : null;
    return { terminal: r(p), terminalFlex: p?.style.flex, terminalSize: p?.getAttribute('data-panel-size'),
      editor: r(e), handle: r(h), handleAttrs: h ? {state: h.getAttribute('data-resize-handle-state'), enabled: h.getAttribute('data-panel-resize-handle-enabled'), dir: h.getAttribute('data-panel-group-direction')} : null,
      hasTermText: document.body.innerText.includes('Portfolio Terminal'), selection: window.getSelection().toString() };
  });
  out[label] = r; console.log(label, JSON.stringify(r));
  return r;
}
async function openTerminal() {
  await page.keyboard.press('Control+Backquote');
  await page.waitForTimeout(800);
  let r = await info('afterCtrlBackquote');
  if (!r.terminal || r.terminal.height < 30) {
    // close via toggle again, then try activity bar button
    await page.keyboard.press('Control+Backquote'); await page.waitForTimeout(500);
    const btn = page.locator('button[title="Terminal"], button[aria-label="Terminal"]').first();
    out.activityBtnCount = await btn.count();
    if (out.activityBtnCount) { await btn.click(); await page.waitForTimeout(800); r = await info('afterActivityClick'); }
  }
  return r;
}
async function drag(dy, label) {
  const hb = await handle().boundingBox();
  const x = hb.x + hb.width/2, y = hb.y + hb.height/2;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x, y + dy, { steps: 15 }); await page.mouse.up();
  await page.waitForTimeout(400);
  return info(label);
}

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await info('initialClosed');
await openTerminal();
await page.screenshot({ path: 'resize_before.png' });
await info('beforeDrag');
await drag(-250, 'afterUp');
await page.screenshot({ path: 'resize_after_up.png' });
await drag(150, 'afterDown');
await page.screenshot({ path: 'resize_after_down.png' });

// reload
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
await info('afterReloadClosed');
await openTerminal();
await info('afterReloadOpened');

// help / donut
const input = page.locator('[data-panel-id="terminal-panel"] input').first();
await info('beforeHelp');
out.inputCount = await input.count();
if (out.inputCount) {
  const txtBefore = (await termPanel().innerText()).length;
  await input.click(); await input.fill('help'); await input.press('Enter'); await page.waitForTimeout(800);
  const txt = await termPanel().innerText();
  out.help = { grewBy: txt.length - txtBefore, hasDonut: /donut/i.test(txt), sample: txt.slice(-600) };
  await page.screenshot({ path: 'help.png' });
  await input.fill('donut'); await input.press('Enter'); await page.waitForTimeout(1500);
  const a = await termPanel().innerText(); await page.waitForTimeout(500); const b = await termPanel().innerText();
  out.donut = { running: a !== b, hasDonutChars: /[@$#*!=;:~.,]{5,}/.test(a), inputVisible: await input.isVisible().catch(()=>false) };
  await page.screenshot({ path: 'donut.png' });
  await page.keyboard.press('Control+c'); await page.waitForTimeout(800);
  const c = await termPanel().innerText(); await page.waitForTimeout(600); const d = await termPanel().innerText();
  const input2 = page.locator('[data-panel-id="terminal-panel"] input').first();
  out.afterCtrlC = { stillChanging: c !== d, inputVisible: await input2.isVisible().catch(()=>false), tail: d.slice(-200) };
  await page.screenshot({ path: 'donut_stopped.png' });
}
out.errors = errors;
console.log('RESULT', JSON.stringify(out, null, 1));
await browser.close();
