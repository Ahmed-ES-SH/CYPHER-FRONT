import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

console.log('Navigating...');
await page.goto('http://localhost:3000/dashboard/products/new', { waitUntil: 'domcontentloaded', timeout: 20000 });

console.log('Final URL:', page.url());
console.log('Title:', await page.title());

await page.waitForTimeout(2000);

await page.screenshot({ path: '/tmp/opencode/screenshot-assessment-b.png', fullPage: true });
console.log('SCREENSHOT_SAVED');

const text = await page.evaluate(() => document.body.innerText.substring(0, 1500));
console.log('--- PAGE TEXT ---');
console.log(text);

await browser.close();
