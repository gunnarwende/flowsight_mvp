/**
 * render_screens.mjs — Render all video screens to PNG via Playwright
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const browser = await chromium.launch();
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html') && f.startsWith('S'));

  console.log(`🎨 Rendering ${files.length} screens...\n`);

  for (const file of files.sort()) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
    const filePath = path.join(__dirname, file);
    await page.goto(`file://${filePath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // wait for fonts

    const pngName = file.replace('.html', '.png');
    const pngPath = path.join(__dirname, pngName);
    await page.screenshot({ path: pngPath, type: 'png' });

    const sizeKB = Math.round(fs.statSync(pngPath).size / 1024);
    console.log(`  ✅ ${pngName} (${sizeKB} KB)`);
    await page.close();
  }

  await browser.close();
  console.log(`\n🎯 All ${files.length} screens rendered at 3x resolution (1170×2532px).`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
