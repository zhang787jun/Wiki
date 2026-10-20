'use strict';
const { chromium, webkit } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const origin = 'https://zhang787jun.github.io';
const output = path.resolve('browser-qa-results');
const summary = { startedAt: new Date().toISOString(), target: origin, playwright: require('playwright/package.json').version, cases: [], technicalStack: [], articleAudit: null, limitations: ['Device emulation, not physical iPhone/Safari', 'No OS IME or on-screen keyboard test', '683px reflow is not actual 200% browser zoom', 'No exhaustive third-party or non-indexed historical URL audit'] };

async function get(url, method = 'GET') {
  const response = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(30000) });
  return { status: response.status, url: response.url, text: method === 'GET' ? await response.text() : '' };
}
async function pool(items, concurrency, fn) {
  const results = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) { const i = next++; try { results[i] = await fn(items[i]); } catch (error) { results[i] = { url: items[i], error: error.message }; } }
  }));
  return results;
}
async function screenshot(page, filename) { await page.screenshot({ path: path.join(output, filename), fullPage: true, animations: 'disabled' }); }
async function noOverflow(page) {
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  assert(dimensions.content <= dimensions.viewport + 1, `Horizontal overflow: ${JSON.stringify(dimensions)}`);
  return dimensions;
}
async function closeSearch(page) {
  await page.locator('#search-input').press('Escape');
  await page.waitForFunction(() => !document.querySelector('.search-dialog').open && !document.body.classList.contains('modal-open'));
  assert.equal(await page.locator('[data-search-open]').first().evaluate(el => el === document.activeElement), true, 'Search opener regains focus');
}
async function observeStack(page, label) {
  const dom = await page.evaluate(() => ({
    doctype: document.doctype?.name,
    scripts: [...document.scripts].map(s => ({ src: s.src, type: s.type || 'classic', inlineLength: s.src ? 0 : s.textContent.length })),
    canvases: document.querySelectorAll('canvas').length,
    svgElements: document.querySelectorAll('svg').length,
    font: getComputedStyle(document.body).fontFamily,
    heroGradient: document.querySelector('.sheet') ? getComputedStyle(document.querySelector('.sheet')).backgroundImage : null
  }));
  const scripts = [];
  for (const script of dom.scripts.filter(s => s.src && new URL(s.src).origin === origin)) {
    const result = await get(script.src);
    scripts.push({ url: script.src, status: result.status, sha256: crypto.createHash('sha256').update(result.text).digest('hex'), esmImportExport: /^\s*(?:import|export)\s/m.test(result.text), webGPU: /navigator\.gpu|WebGPURenderer|requestAdapter/.test(result.text), webGL: /getContext\(["']webgl|WebGLRenderer/.test(result.text), threeTSL: /three\/tsl|three\/webgpu|THREE\./.test(result.text), canvasAPI: /getContext\(["']2d/.test(result.text), framework: /ReactDOM|react\.production|vue\.global|createApp\(/.test(result.text) });
  }
  summary.technicalStack.push({ label, ...dom, scriptsEvidence: scripts });
}

async function runCase(browser, engine, width, scheme) {
  const mobile = width < 600;
  const context = await browser.newContext({ viewport: { width, height: mobile ? 844 : 936 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, colorScheme: scheme, locale: 'zh-CN', reducedMotion: 'reduce' });
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  const result = { engine, width, colorScheme: scheme, checks: [], errors: [], pageErrors: [], startedAt: new Date().toISOString() };
  page.on('pageerror', error => result.pageErrors.push(error.message));
  const prefix = `${engine}-${width}-${scheme}`;
  async function check(name, fn) { await fn(); result.checks.push(name); }
  try {
    let codeUrl;
    await check('Homepage HTTP 200, headings, navigation and viewport', async () => {
      const response = await page.goto(origin + '/', { waitUntil: 'networkidle' }); assert.equal(response.status(), 200);
      await page.locator('.hero h1').waitFor(); assert.equal(await page.locator('.main-nav a').count(), 3);
      for (const name of ['知识库', '作品', '关于']) assert(await page.getByRole('link', { name, exact: true }).first().isVisible());
      await noOverflow(page); codeUrl = await page.locator('.reading-row').nth(1).getAttribute('href');
      await screenshot(page, `${prefix}-home.png`);
      if (width === 390 && scheme === 'light' && engine === 'chromium') await observeStack(page, 'homepage');
    });
    await check('Chinese full-text search, modal layout and keyboard result navigation', async () => {
      await page.getByRole('button', { name: '搜索知识库', exact: true }).click();
      await page.locator('#search-input').fill('湖仓一体');
      await page.getByText('找到 1 篇相关笔记', { exact: true }).waitFor();
      await noOverflow(page); const box = await page.locator('.search-dialog').boundingBox();
      assert(box.x >= -1 && box.x + box.width <= width + 1, 'Search modal fits viewport');
      await screenshot(page, `${prefix}-search.png`);
      await page.locator('#search-input').press('ArrowDown'); await page.keyboard.press('Enter');
      await page.waitForURL(/\.html$/); assert.equal(await page.locator('.article-header h1').innerText(), '湖仓一体');
      await noOverflow(page); await screenshot(page, `${prefix}-article.png`);
      result.prose = await page.locator('.prose').evaluate(el => ({ size: getComputedStyle(el).fontSize, lineHeight: getComputedStyle(el).lineHeight, tocVisible: getComputedStyle(document.querySelector('.toc-sidebar')).display !== 'none', inlineToc: !!el.querySelector('.toc') }));
    });
    await check('Theme toggle and persistence', async () => {
      await page.locator('[data-theme-toggle]').click(); const opposite = scheme === 'light' ? 'dark' : 'light';
      assert.equal(await page.locator('html').getAttribute('data-theme'), opposite);
      await page.reload({ waitUntil: 'networkidle' }); assert.equal(await page.locator('html').getAttribute('data-theme'), opposite);
      await page.locator('[data-theme-toggle]').click(); assert.equal(await page.locator('html').getAttribute('data-theme'), scheme);
    });
    await check('Wiki search filters, empty results, Escape, focus and scroll recovery', async () => {
      await page.goto(origin + '/Wiki/', { waitUntil: 'networkidle' }); await noOverflow(page);
      await page.getByRole('button', { name: '搜索知识库', exact: true }).click();
      await page.locator('#search-input').fill('Python'); await page.locator('#search-status').filter({ hasText: '找到 105 篇' }).waitFor();
      await page.locator('[data-filter="40-"]').click(); await page.getByText('找到 4 篇相关笔记', { exact: true }).waitFor();
      await page.locator('#search-input').fill('QA-no-results-20261020'); await page.getByText('找到 0 篇相关笔记', { exact: true }).waitFor();
      await closeSearch(page);
      await page.locator('.catalog-folder summary').filter({ hasText: '02-Programming_Language' }).first().press('Enter');
      assert.equal(await page.locator('.catalog-folder summary').filter({ hasText: '02-Programming_Language' }).first().evaluate(el => el.parentElement.open), true);
      await screenshot(page, `${prefix}-wiki.png`);
      if (width === 390 && scheme === 'light' && engine === 'chromium') await observeStack(page, 'wiki');
    });
    await check('Root and Wiki custom 404 retain HTTP status and recovery', async () => {
      for (const root of ['', '/Wiki']) {
        const response = await page.goto(origin + root + '/qa-missing-20261020', { waitUntil: 'networkidle' }); assert.equal(response.status(), 404);
        await page.getByRole('heading', { name: '换条路，继续探索。', exact: true }).waitFor(); await noOverflow(page);
        if (root) await screenshot(page, `${prefix}-404.png`);
        await page.locator('main a').click(); await page.waitForURL(origin + '/Wiki/');
      }
    });
    await check('Code copy feedback and Chromium clipboard byte equality', async () => {
      await page.goto(new URL(codeUrl, origin).href, { waitUntil: 'networkidle' }); await noOverflow(page);
      if (engine === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
      const pre = page.locator('.prose pre').first();
      const expected = await pre.evaluate(el => { const copy = el.cloneNode(true); copy.querySelectorAll('button').forEach(b => b.remove()); return copy.textContent; });
      await pre.getByRole('button', { name: '复制代码', exact: true }).click(); await page.getByText('代码已复制', { exact: true }).waitFor();
      if (engine === 'chromium') { const actual = await page.evaluate(() => navigator.clipboard.readText()); assert.equal(actual, expected); result.clipboard = { bytesVerified: true, characters: actual.length }; }
      else result.clipboard = { bytesVerified: false, reason: 'WebKit clipboard-read permission not exposed; feedback only' };
      await screenshot(page, `${prefix}-code.png`);
    });
    assert.deepEqual(result.pageErrors, [], 'No uncaught page JavaScript errors'); result.passed = true;
  } catch (error) { result.passed = false; result.errors.push(error.stack || error.message); await screenshot(page, `${prefix}-failure.png`).catch(() => {}); }
  finally { summary.cases.push(result); console.log(JSON.stringify({ engine, width, scheme, passed: result.passed, checks: result.checks, errors: result.errors })); await context.close(); }
}

async function auditArticles() {
  const indexResponse = await get(origin + '/Wiki/static/data/search-index.json'); assert.equal(indexResponse.status, 200);
  const index = JSON.parse(indexResponse.text); assert.equal(index.pages.length, 390);
  const localImages = new Set(); let externalImages = 0;
  const pages = await pool(index.pages.map(p => new URL(p.url, origin).href), 6, async url => {
    const response = await get(url);
    if (response.status === 200) for (const tag of response.text.matchAll(/<img\b[^>]*>/gi)) {
      const source = tag[0].match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i); if (!source) continue;
      let value = (source[1] || source[2]).replaceAll('&amp;', '&');
      if (!/^(https?:)?\/\//i.test(value) && /(^|\/)attach\//.test(value)) value = '/Wiki/' + value.slice(value.indexOf('attach/'));
      try { const image = new URL(value, url); if (image.origin === origin) localImages.add(image.href); else if (/^https?:$/.test(image.protocol)) externalImages++; } catch {}
    }
    return { url, status: response.status };
  });
  const images = await pool([...localImages], 4, async url => { const response = await get(url, 'HEAD'); return { url, status: response.status }; });
  summary.articleAudit = { indexed: index.pages.length, pages, localImages: images, externalImageOccurrencesNotChecked: externalImages, failedPages: pages.filter(p => p.status !== 200), failedLocalImages: images.filter(p => p.status !== 200) };
  console.log('ARTICLE_AUDIT ' + JSON.stringify({ indexed: index.pages.length, passedPages: pages.filter(p => p.status === 200).length, localImages: images.length, failedPages: summary.articleAudit.failedPages, failedLocalImages: summary.articleAudit.failedLocalImages }));
}

(async () => {
  await fs.mkdir(output, { recursive: true });
  for (const [engine, type] of Object.entries({ chromium, webkit })) {
    const browser = await type.launch();
    try { for (const width of [320, 390, 768, 1366, 683]) for (const scheme of ['light', 'dark']) await runCase(browser, engine, width, scheme); }
    finally { await browser.close(); }
  }
  await auditArticles();
})().catch(error => { summary.fatalError = error.stack; console.error(error); }).finally(async () => {
  summary.finishedAt = new Date().toISOString();
  summary.passed = !summary.fatalError && summary.cases.every(c => c.passed) && summary.articleAudit && !summary.articleAudit.failedPages.length && !summary.articleAudit.failedLocalImages.length;
  await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log('FINAL_SUMMARY ' + JSON.stringify(summary));
  if (!summary.passed) process.exitCode = 1;
});
