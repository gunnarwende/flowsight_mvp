import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 120 }, deviceScaleFactor: 3 });
const filePath = path.join(__dirname, 'notification_overlay.html').replace(/\\/g, '/');
await page.goto('file:///' + filePath, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(__dirname, 'notification_overlay.png'), type: 'png', omitBackground: true });
console.log('✅ notification_overlay.png');
await browser.close();
