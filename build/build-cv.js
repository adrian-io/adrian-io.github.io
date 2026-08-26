/* Render cv.html to assets/cv-adrian-scholl.pdf. Run: node cv-source/build-cv.js */
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.resolve(__dirname, 'cv.html'));
  await p.waitForTimeout(700);
  await p.pdf({ path: path.resolve(__dirname, '../assets/cv-adrian-scholl.pdf'),
                format: 'A4', printBackground: true });
  await b.close();
  console.log('cv written');
})();
