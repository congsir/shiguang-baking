const { chromium } = require('playwright-core');
const OUT = '/workspace/shiguang-baking/handoff/';
const URL = 'http://127.0.0.1:8794/';
const fs = require('fs');
fs.mkdirSync(OUT, { recursive: true });

async function settle(page){
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1400);
  await page.evaluate(async ()=>{
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    document.querySelectorAll('.hero-title .line > span, .hero-sub, .hero-actions, .eyebrow, .hero-foot, .hero-hud').forEach(el=>{
      el.style.opacity='1'; el.style.transform='none'; el.style.visibility='visible';
    });
    document.querySelectorAll('.reveal, .reveal-img, .reveal-stagger > *').forEach(el=>{
      el.style.opacity='1'; el.style.transform='none';
    });
  });
  await page.waitForTimeout(1000);
}

(async()=>{
  const b = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
  });
  const errs = [];

  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await p.goto(URL + 'brand/brand-board.html', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1800);
    await p.screenshot({ path: '/workspace/shiguang-baking/brand/brand-board.png' });
    await p.screenshot({ path: OUT + 'brand-board.png' });
    await p.close();
  }

  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    p.on('pageerror', e => errs.push(String(e)));
    p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
    await settle(p);
    await p.screenshot({ path: OUT + 'desktop-hero-1440.png' });
    for (const [sel, name] of [
      ['#about','desktop-about'],
      ['#products','desktop-products'],
      ['#craft','desktop-craft'],
      ['#gallery','desktop-gallery'],
      ['#contact','desktop-contact'],
    ]) {
      await p.evaluate((s)=>{ const el=document.querySelector(s); if(el) el.scrollIntoView({block:'start'}); }, sel);
      await p.waitForTimeout(700);
      await p.screenshot({ path: OUT + name + '-1440.png' });
    }
    await p.evaluate(()=>window.scrollTo(0,0));
    await p.waitForTimeout(400);
    errs.push('scrollW '+await p.evaluate(()=>document.documentElement.scrollWidth));
    errs.push('webgl '+await p.evaluate(()=>document.documentElement.className));
    await p.close();
  }

  {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await settle(p);
    await p.screenshot({ path: OUT + 'phone-hero-390.png' });
    await p.evaluate(()=>{ const el=document.querySelector('#products'); if(el) el.scrollIntoView(); });
    await p.waitForTimeout(500);
    await p.screenshot({ path: OUT + 'phone-products-390.png' });
    await p.evaluate(()=>{ const el=document.querySelector('#contact'); if(el) el.scrollIntoView(); });
    await p.waitForTimeout(500);
    await p.screenshot({ path: OUT + 'phone-contact-390.png' });
    await p.close();
  }

  {
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    await settle(p);
    await p.screenshot({ path: OUT + 'desktop-hero-1920.png' });
    await p.close();
  }

  console.log('errs:', errs);
  await b.close();
})().catch(e=>{ console.error(e); process.exit(1); });
