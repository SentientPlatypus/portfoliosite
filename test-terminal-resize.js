import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('Navigating to localhost:8080...');
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000);

  console.log('Opening terminal with Ctrl+`...');
  await page.keyboard.press('Control+`');
  await page.waitForTimeout(1000);

  // Find the terminal panel
  const terminal = await page.locator('[data-panel-id]').filter({ hasText: 'bash' }).locator('..').locator('..');
  if (await terminal.count() === 0) {
    console.log('ERROR: Could not find terminal panel');
    await browser.close();
    process.exit(1);
  }

  const initialBox = await terminal.boundingBox();
  const initialHeight = initialBox.height;
  console.log(`Initial terminal height: ${initialHeight}px`);

  // Find the resize handle (should be above the terminal)
  const resizeHandle = await page.locator('[data-panel-resize-handle-id]').first();
  const handleBox = await resizeHandle.boundingBox();
  
  if (!handleBox) {
    console.log('ERROR: Could not find resize handle');
    await browser.close();
    process.exit(1);
  }

  console.log(`Resize handle found at y=${handleBox.y}`);
  console.log('Dragging resize handle up by 300px...');

  // Drag the handle up 300px
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  
  // Move in steps to simulate real drag
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(
      handleBox.x + handleBox.width / 2, 
      handleBox.y + handleBox.height / 2 - (i * 30)
    );
    await page.waitForTimeout(50);
  }
  
  await page.mouse.up();
  await page.waitForTimeout(500);

  const finalBox = await terminal.boundingBox();
  const finalHeight = finalBox.height;
  console.log(`Final terminal height: ${finalHeight}px`);
  console.log(`Height change: ${finalHeight - initialHeight}px`);

  if (finalHeight - initialHeight < 200) {
    console.log('ERROR: Terminal did not resize enough');
    await browser.close();
    process.exit(1);
  }

  // Check for blue text selection
  const selection = await page.evaluate(() => window.getSelection().toString());
  if (selection.length > 0) {
    console.log(`WARNING: Text selection detected: "${selection}"`);
  } else {
    console.log('SUCCESS: No text selection during resize');
  }

  // Take screenshots
  console.log('Taking screenshots...');
  
  // Reset and take before screenshot
  await page.keyboard.press('Control+`');
  await page.waitForTimeout(500);
  await page.keyboard.press('Control+`');
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: '/opt/cursor/artifacts/round4/terminal_before.png',
    fullPage: false 
  });
  console.log('Saved terminal_before.png');

  // Resize again for after screenshot
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(
      handleBox.x + handleBox.width / 2, 
      handleBox.y + handleBox.height / 2 - (i * 30)
    );
    await page.waitForTimeout(50);
  }
  await page.mouse.up();
  await page.waitForTimeout(500);

  await page.screenshot({ 
    path: '/opt/cursor/artifacts/round4/terminal_after.png',
    fullPage: false 
  });
  console.log('Saved terminal_after.png');

  console.log('\n=== TEST RESULTS ===');
  console.log(`Initial height: ${initialHeight}px`);
  console.log(`Final height: ${finalHeight}px`);
  console.log(`Height increase: ${finalHeight - initialHeight}px`);
  console.log(`Text selection: ${selection.length > 0 ? 'FAILED' : 'PASSED'}`);
  console.log(`Terminal resize: ${finalHeight - initialHeight >= 200 ? 'PASSED' : 'FAILED'}`);

  await browser.close();
})();
