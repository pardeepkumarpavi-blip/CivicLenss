import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.join(__dirname, 'presentation-assets');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('[Capture] Authenticating users via API...');

  // 1. Get Officer Auth
  const officerLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'sanitation.officer@civiclens.gov.pk',
      password: 'Municipal@2026'
    })
  });
  const officerAuth = await officerLoginRes.json();
  console.log('[Capture] Officer Auth:', officerAuth.success, officerAuth.user?.name);

  // 2. Get Citizen Auth
  const citizenLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ayesha.khan@citizen.pk',
      password: 'Citizen@2026'
    })
  });
  const citizenAuth = await citizenLoginRes.json();
  console.log('[Capture] Citizen Auth:', citizenAuth.success, citizenAuth.user?.name);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1600, height: 1000, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars']
  });

  const page = await browser.newPage();

  // 1. Capture Homepage
  console.log('[Capture] Capturing 01_homepage.png...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await wait(2500);
  await page.screenshot({ path: path.join(assetsDir, '01_homepage.png') });

  // 2. Capture Report Issue Page
  console.log('[Capture] Capturing 02_report_issue.png...');
  await page.goto('http://localhost:5173/report', { waitUntil: 'domcontentloaded' });
  await wait(2500);
  await page.screenshot({ path: path.join(assetsDir, '02_report_issue.png') });

  // 3. Capture Community Map Page
  console.log('[Capture] Capturing 03_community_map.png...');
  await page.goto('http://localhost:5173/map', { waitUntil: 'domcontentloaded' });
  await wait(3500);
  await page.screenshot({ path: path.join(assetsDir, '03_community_map.png') });

  // 4. Capture Authority Dashboard (with Officer Session)
  console.log('[Capture] Capturing 04_authority_dashboard.png with Officer Session...');
  await page.evaluate((auth) => {
    localStorage.setItem('civiclens_token', auth.token);
    localStorage.setItem('civiclens_user', JSON.stringify(auth.user));
  }, officerAuth);
  await page.goto('http://localhost:5173/authority', { waitUntil: 'domcontentloaded' });
  await wait(3000);
  await page.screenshot({ path: path.join(assetsDir, '04_authority_dashboard.png') });

  // 5. Capture Analytics Page
  console.log('[Capture] Capturing 05_analytics.png...');
  await page.goto('http://localhost:5173/analytics', { waitUntil: 'domcontentloaded' });
  await wait(3000);
  await page.screenshot({ path: path.join(assetsDir, '05_analytics.png') });

  // 6. Capture Citizen Dashboard (with Citizen Session)
  console.log('[Capture] Capturing 06_citizen_dashboard.png with Citizen Session...');
  await page.evaluate((auth) => {
    localStorage.setItem('civiclens_token', auth.token);
    localStorage.setItem('civiclens_user', JSON.stringify(auth.user));
  }, citizenAuth);
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded' });
  await wait(3000);
  await page.screenshot({ path: path.join(assetsDir, '06_citizen_dashboard.png') });

  // 7. Capture Complaint Detail Page (CL-2026-00001)
  console.log('[Capture] Capturing 07_report_detail.png...');
  await page.goto('http://localhost:5173/reports/CL-2026-00001', { waitUntil: 'domcontentloaded' });
  await wait(3000);
  await page.screenshot({ path: path.join(assetsDir, '07_report_detail.png') });

  await browser.close();
  console.log('[Capture] All 7 real screenshots captured successfully in presentation-assets/!');
}

main().catch(console.error);
