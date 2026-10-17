import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:/Users/mONSEY/.gemini/antigravity/brain/ae509373-df2f-4614-a266-5074ee2ba371';
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function capture() {
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Desktop Viewport
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  await page.screenshot({
    path: path.join(artifactDir, 'storefront_desktop.png'),
    fullPage: false,
  });
  console.log('Saved storefront_desktop.png');

  // Full page desktop
  await page.screenshot({
    path: path.join(artifactDir, 'storefront_desktop_full.png'),
    fullPage: true,
  });
  console.log('Saved storefront_desktop_full.png');

  // 2. Click "Get Yours" button to add item and open drawer
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const addBtn = buttons.find(b => b.textContent && (b.textContent.includes('Get Yours') || b.textContent.includes('Add to')));
    if (addBtn) addBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(artifactDir, 'storefront_cart_drawer.png'),
  });
  console.log('Saved storefront_cart_drawer.png');

  // 3. Mobile Viewport (iPhone 14 / modern mobile)
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  await mobilePage.screenshot({
    path: path.join(artifactDir, 'storefront_mobile.png'),
    fullPage: false,
  });
  console.log('Saved storefront_mobile.png');

  await mobilePage.screenshot({
    path: path.join(artifactDir, 'storefront_mobile_full.png'),
    fullPage: true,
  });
  console.log('Saved storefront_mobile_full.png');

  // 4. Cancelled checkout state
  await mobilePage.goto('http://localhost:3000/?canceled=true', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'storefront_cancelled_return.png'),
  });
  console.log('Saved storefront_cancelled_return.png');

  // 5. Order confirmation page
  const confirmPage = await browser.newPage();
  await confirmPage.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
  await confirmPage.goto('http://localhost:3000/order-confirmation?session_id=test_preview_session', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));
  await confirmPage.screenshot({
    path: path.join(artifactDir, 'storefront_order_confirmation.png'),
  });
  console.log('Saved storefront_order_confirmation.png');

  await browser.close();
  console.log('All screenshots captured successfully.');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
