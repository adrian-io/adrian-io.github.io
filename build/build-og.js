/* Render build/og.html to assets/img/og.png (1200x630). Run: node build/build-og.js */
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve(__dirname, 'og.html'));
  await p.waitForTimeout(4000);
  await p.screenshot({ path: path.resolve(__dirname, '../assets/img/og.png') });
  await b.close();
  console.log('og written');
})();
