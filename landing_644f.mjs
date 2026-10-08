import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
await p.goto('http://localhost:8080/', {waitUntil:'networkidle'});
for (const s of [5,10,15,20]) { await p.waitForTimeout(5000); const t = await p.evaluate(()=>[...document.querySelectorAll('[class*="border-t-"], .h-9 div, div')].length && document.title + ' | activeTab=' + (Array.from(document.querySelectorAll('div')).find(d=>/^(me\.rs|about\.tsx)$/.test(d.innerText?.trim()) && d.closest('[class*="border"]'))?.innerText)); console.log(s+'s', t, (await p.evaluate(()=>document.body.innerText.includes('Geneustace')))); }
await p.screenshot({path:'landing_first_visit_20s.png'});
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(3000); await p.screenshot({path:'landing_reload.png'});
await b.close();
