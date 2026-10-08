import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

console.log('\n=== Test 1: Terminal size persistence ===');
await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// Open terminal
await page.keyboard.press('Control+Backquote');
// Wait for terminal to actually expand
await page.waitForFunction(() => {
  const p = document.querySelector('[data-panel-id="terminal-panel"]');
  return p && p.getBoundingClientRect().height > 50;
}, { timeout: 5000 }).catch(() => console.log('Terminal did not expand'));
await page.waitForTimeout(500);

const beforeDrag = await page.evaluate(() => {
  const p = document.querySelector('[data-panel-id="terminal-panel"]');
  return p ? Math.round(p.getBoundingClientRect().height) : 0;
});
console.log('Terminal height after open:', beforeDrag + 'px');

// Drag to specific size
const hb = await page.locator('[data-panel-resize-handle-id]').first().boundingBox();
await page.mouse.move(hb.x + hb.width/2, hb.y + 4);
await page.mouse.down();
await page.mouse.move(hb.x + hb.width/2, hb.y + 4 - 200, { steps: 15 });
await page.mouse.up();
await page.waitForTimeout(500);

const afterDrag = await page.evaluate(() => {
  const p = document.querySelector('[data-panel-id="terminal-panel"]');
  return { 
    height: p ? Math.round(p.getBoundingClientRect().height) : 0,
    size: p?.getAttribute('data-panel-size')
  };
});
console.log('Terminal height after drag:', afterDrag.height + 'px', '(' + afterDrag.size + '%)');

// Reload and check if size is maintained
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// Open terminal again
await page.keyboard.press('Control+Backquote');
await page.waitForFunction(() => {
  const p = document.querySelector('[data-panel-id="terminal-panel"]');
  return p && p.getBoundingClientRect().height > 50;
}, { timeout: 5000 }).catch(() => console.log('Terminal did not expand after reload'));
await page.waitForTimeout(500);

const afterReload = await page.evaluate(() => {
  const p = document.querySelector('[data-panel-id="terminal-panel"]');
  return {
    height: p ? Math.round(p.getBoundingClientRect().height) : 0,
    size: p?.getAttribute('data-panel-size')
  };
});
console.log('Terminal height after reload+open:', afterReload.height + 'px', '(' + afterReload.size + '%)');

const sizeMaintained = Math.abs(afterDrag.height - afterReload.height) < 10;
console.log('Size maintained:', sizeMaintained ? '✅ PASS' : '❌ FAIL');

await page.screenshot({ path: '/opt/cursor/artifacts/round6/reload_size_kept.png' });

console.log('\n=== Test 2: Landing on about.tsx ===');
// Set hasSeenWelcome and reload
await page.evaluate(() => sessionStorage.setItem('hasSeenWelcome', 'true'));
await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const landing = await page.evaluate(() => {
  // Find active tab by looking for the highlighted one
  const tabs = Array.from(document.querySelectorAll('[role="tab"], button, div')).filter(el => {
    const text = el.textContent?.trim();
    return text === 'me.rs' || text === 'about.tsx';
  });
  
  let activeTab = null;
  for (const tab of tabs) {
    const styles = window.getComputedStyle(tab);
    const parent = tab.closest('[class*="flex"]');
    // Check if tab has active styling (background color, border, etc.)
    if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
        tab.className.includes('bg-') ||
        parent?.className.includes('border-t')) {
      activeTab = tab.textContent?.trim();
      break;
    }
  }
  
  return {
    activeTab: activeTab,
    hasAboutContent: document.body.innerText.includes('Geneustace') || document.body.innerText.includes('Portfolio'),
    allTabs: tabs.map(t => t.textContent?.trim()),
    title: document.title
  };
});
console.log('Active tab:', landing.activeTab);
console.log('Has about content:', landing.hasAboutContent);
console.log('All tabs:', landing.allTabs);
console.log('Lands on about.tsx:', landing.activeTab === 'about.tsx' ? '✅ PASS' : '❌ FAIL');

await page.screenshot({ path: '/opt/cursor/artifacts/round6/reload_about.png' });

console.log('\n=== Test 3: Donut scaling ===');
await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// Open terminal at default size
await page.keyboard.press('Control+Backquote');
await page.waitForTimeout(800);

const terminalHeight = await page.evaluate(() => {
  const p = document.querySelector('[data-panel-id="terminal-panel"]');
  return p ? Math.round(p.getBoundingClientRect().height) : 0;
});
console.log('Terminal height:', terminalHeight + 'px');

// Run donut
const input = page.locator('[data-panel-id="terminal-panel"] input').first();
await input.click();
await input.fill('donut');
await input.press('Enter');
await page.waitForTimeout(1500);

const donutInfo = await page.evaluate(() => {
  const panel = document.querySelector('[data-panel-id="terminal-panel"]');
  const text = panel?.innerText || '';
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  return {
    hasDonutChars: /[@$#*!=;:~.,]{5,}/.test(text),
    lineCount: lines.length,
    sample: text.slice(-400)
  };
});
console.log('Donut visible:', donutInfo.hasDonutChars ? '✅ PASS' : '❌ FAIL');
console.log('Line count:', donutInfo.lineCount);

await page.screenshot({ path: '/opt/cursor/artifacts/round6/donut_default_height.png' });

// Stop donut
await page.keyboard.press('Control+c');
await page.waitForTimeout(500);

await browser.close();

console.log('\n=== All tests complete ===');
