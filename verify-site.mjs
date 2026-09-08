import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const errors = [];
for (const viewport of [{name:'desktop', width:1440, height:1000}, {name:'mobile', width:390, height:844}]) {
  const page = await browser.newPage({ viewport });
  page.on('console', message => { if (message.type() === 'error') errors.push(`${viewport.name}: ${message.text()}`); });
  page.on('pageerror', error => errors.push(`${viewport.name}: ${error.message}`));
  await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (overflow) errors.push(`${viewport.name}: horizontal overflow`);
  await page.locator('.schedule-open:visible').first().click();
  if (!(await page.locator('#scheduler-setup').isVisible())) errors.push(`${viewport.name}: scheduling fallback not visible`);
  if (!(await page.locator('a[href^="tel:"]').last().isVisible())) errors.push(`${viewport.name}: scheduling phone fallback not visible`);
  await page.locator('.modal .close').click();
  if (await page.locator('#schedule-modal').isVisible()) errors.push(`${viewport.name}: modal did not close`);
  console.log(`${viewport.name}: layout and scheduling flow passed`);
  await page.close();
}
await browser.close();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('No console errors, page errors, or horizontal overflow detected.');
