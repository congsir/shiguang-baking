const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
(async()=>{
  const b = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox','--disable-gpu']
  });
  const p = await b.newPage({ viewport: { width: 256, height: 256 }, deviceScaleFactor: 2 });
  const mark = fs.readFileSync('/workspace/shiguang-baking/brand/logo-mark.svg','utf8');
  await p.setContent(`<html><body style="margin:0;background:transparent">${mark}</body></html>`);
  await p.waitForTimeout(200);
  await p.locator('svg').screenshot({ path: '/workspace/shiguang-baking/brand/logo-mark.png', omitBackground: true });
  // favicon 32
  await p.setViewportSize({ width: 32, height: 32 });
  await p.setContent(`<html><body style="margin:0">${fs.readFileSync('/workspace/shiguang-baking/brand/favicon.svg','utf8')}</body></html>`);
  await p.waitForTimeout(100);
  await p.screenshot({ path: '/workspace/shiguang-baking/brand/favicon-32.png' });
  // apple touch
  await p.setViewportSize({ width: 180, height: 180 });
  await p.setContent(`<html><body style="margin:0;background:#2A1F1A;display:flex;align-items:center;justify-content:center;height:100vh">${mark.replace('viewBox="0 0 80 80"','viewBox="0 0 80 80" width="160" height="160"')}</body></html>`);
  await p.waitForTimeout(100);
  await p.screenshot({ path: '/workspace/shiguang-baking/brand/apple-touch-icon.png' });
  // horizontal
  const hz = fs.readFileSync('/workspace/shiguang-baking/brand/logo-horizontal.svg','utf8');
  await p.setViewportSize({ width: 640, height: 160 });
  await p.setContent(`<html><body style="margin:0;background:#F7F1E8;display:flex;align-items:center;padding:20px">${hz.replace('viewBox="0 0 320 80"','viewBox="0 0 320 80" width="600" height="150"')}</body></html>`);
  await p.waitForTimeout(400);
  await p.screenshot({ path: '/workspace/shiguang-baking/brand/logo-horizontal.png' });
  await b.close();
  console.log('raster ok');
})().catch(e=>{console.error(e);process.exit(1)});
