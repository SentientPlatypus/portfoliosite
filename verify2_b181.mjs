import { chromium } from 'playwright';
const out = {}; const errors = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addInitScript(() => { try { sessionStorage.setItem('hasSeenWelcome','true'); } catch {} });
const page = await ctx.newPage();
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0,160)); });
const h = () => page.evaluate(() => { const p = document.querySelector('[data-panel-id="terminal-panel"]'); return { h: Math.round(p.getBoundingClientRect().height), size: p.getAttribute('data-panel-size'), text: document.body.innerText.includes('Portfolio Terminal') }; });
await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
// Activity bar terminal (4th button in activity bar = 'terminal')
const btns = page.locator('button:has(svg.lucide-terminal)');
out.activityBtnCount = await btns.count();
if (out.activityBtnCount) { await btns.first().click(); await page.waitForTimeout(800); out.afterActivityClick = await h(); }
// Status bar terminal
// Expand via drag so we can use the terminal
const hb = await page.locator('[data-panel-resize-handle-id]').first().boundingBox();
await page.mouse.move(hb.x+hb.width/2, hb.y+4); await page.mouse.down(); await page.mouse.move(hb.x+hb.width/2, hb.y+4-300, {steps:15}); await page.mouse.up(); await page.waitForTimeout(500);
out.afterDragExpand = await h();
const panel = page.locator('[data-panel-id="terminal-panel"]');
const input = panel.locator('input').first();
out.inputCount = await input.count();
const t0 = (await panel.innerText()).length;
await input.click(); await input.fill('help'); await input.press('Enter'); await page.waitForTimeout(800);
let t = await panel.innerText();
out.help = { grewBy: t.length - t0, mentionsDonut: /donut/.test(t), tail: t.slice(-500) };
await page.screenshot({ path: 'help.png' });
await input.fill('donut'); await input.press('Enter'); await page.waitForTimeout(1500);
const a = await panel.innerText(); await page.waitForTimeout(400); const b = await panel.innerText();
out.donut = { frameChanging: a !== b, inputVisible: await input.isVisible().catch(()=>false), sample: a.slice(-700) };
await page.screenshot({ path: 'donut.png' });
await page.keyboard.press('Control+c'); await page.waitForTimeout(800);
const c = await panel.innerText(); await page.waitForTimeout(500); const d = await panel.innerText();
out.afterCtrlC = { stillChanging: c !== d, inputVisible: await panel.locator('input').first().isVisible().catch(()=>false), tail: d.slice(-200) };
await page.screenshot({ path: 'donut_stopped.png' });
out.selection = await page.evaluate(() => window.getSelection().toString());
out.errors = errors;
console.log(JSON.stringify(out, null, 1));
await browser.close();
