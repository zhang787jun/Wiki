/* Progressive enhancements: the catalog and articles are server-rendered HTML. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const announce = message => { const el = $('#announcement'); if (el) el.textContent = message; };
  const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && darkMedia.matches);
  const themeButton = $('[data-theme-toggle]');
  function updateThemeButton() { if (themeButton) { themeButton.setAttribute('aria-label', isDark() ? '切换为浅色主题' : '切换为深色主题'); themeButton.setAttribute('aria-pressed', String(isDark())); } }
  themeButton?.addEventListener('click', () => { const next = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = next; try { localStorage.setItem('jim-theme', next); } catch (_) {} updateThemeButton(); });
  darkMedia.addEventListener?.('change', updateThemeButton);
  updateThemeButton();

  const dialog = $('.search-dialog');
  const input = $('#search-input');
  const resultList = $('#search-results');
  const status = $('#search-status');
  let indexPromise, filter = 'all', selected = -1, renderVersion = 0, opener;
  function loadIndex() {
    if (!indexPromise) indexPromise = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(document.body.dataset.searchIndex || '/Wiki/static/data/search-index.json', { signal: controller.signal });
        if (!response.ok) throw new Error('Search index unavailable');
        const data = await response.json();
        if (!Array.isArray(data.pages)) throw new Error('Invalid search index');
        return window.JimSearch.prepare(data.pages);
      } finally { clearTimeout(timer); }
    })().catch(error => { indexPromise = null; throw error; });
    return indexPromise;
  }
  function highlight(text, query) {
    const fragment = document.createDocumentFragment();
    const terms = query.trim().split(/\s+/).filter(Boolean).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!terms.length) { fragment.append(document.createTextNode(text)); return fragment; }
    const pattern = new RegExp('(' + terms.join('|') + ')', 'gi');
    let last = 0;
    for (const match of text.matchAll(pattern)) { fragment.append(document.createTextNode(text.slice(last, match.index))); const mark = document.createElement('mark'); mark.textContent = match[0]; fragment.append(mark); last = match.index + match[0].length; }
    fragment.append(document.createTextNode(text.slice(last)));
    return fragment;
  }
  function snippet(page, query) {
    const text = page.text || '';
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const hits = terms.map(term => text.toLowerCase().indexOf(term)).filter(i => i >= 0);
    const start = hits.length ? Math.max(0, Math.min(...hits) - 35) : 0;
    return (start ? '…' : '') + text.slice(start, start + 140) + (text.length > start + 140 ? '…' : '');
  }
  async function renderResults() {
    if (!dialog?.open) return;
    const version = ++renderVersion;
    const query = input.value.slice(0, 160);
    status.textContent = '正在加载知识索引…';
    try {
      const pages = await loadIndex();
      if (version !== renderVersion || !dialog.open) return;
      const results = window.JimSearch.search(pages, query, filter);
      resultList.replaceChildren(); selected = -1;
      const visible = results.slice(0, query.trim() ? 40 : 8);
      status.textContent = query.trim() ? `找到 ${results.length} 篇相关笔记${results.length > 40 ? '，显示前 40 篇；可增加关键词缩小范围' : ''}` : `共 ${pages.length} 篇笔记 · 输入关键词搜索全文`;
      if (!results.length) { const empty = document.createElement('p'); empty.className = 'search-empty'; empty.textContent = '暂时没有找到。试试更短的关键词，或切换到「全部」。'; resultList.append(empty); }
      for (const page of visible) {
        // Only navigate to same-origin wiki documents, even if an index is malformed.
        const url = new URL(page.url, location.origin);
        if (url.origin !== location.origin || !url.pathname.startsWith('/Wiki/')) continue;
        const link = document.createElement('a'); link.href = url.pathname + url.search + url.hash; link.className = 'search-result';
        const category = document.createElement('small'); category.textContent = page.category.replace(/^\d+-/, '').replaceAll('/', ' / ');
        const title = document.createElement('h3'); title.append(highlight(page.title, query));
        const excerpt = document.createElement('p'); excerpt.append(highlight(snippet(page, query), query));
        link.append(category, title, excerpt); resultList.append(link);
      }
    } catch (_) {
      if (version !== renderVersion || !dialog.open) return;
      status.textContent = '搜索索引暂时无法加载，仍可浏览完整知识库。';
      resultList.replaceChildren(); const retry = document.createElement('button'); retry.className = 'search-retry'; retry.textContent = '重新加载'; retry.addEventListener('click', renderResults); resultList.append(retry);
    }
  }
  function openSearch(query = '') {
    if (!dialog || typeof dialog.showModal !== 'function') { location.href = '/Wiki/'; return; }
    if (!dialog.open) opener = document.activeElement; input.value = query;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open'); input.focus(); renderResults();
  }
  $$('[data-search-open]').forEach(button => button.addEventListener('click', () => openSearch()));
  $$('[data-query]').forEach(button => button.addEventListener('click', () => openSearch(button.dataset.query)));
  $('.close-search')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => { ++renderVersion; document.body.classList.remove('modal-open'); opener?.focus(); });
  dialog?.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  let debounce;
  input?.addEventListener('input', () => { clearTimeout(debounce); ++renderVersion; debounce = setTimeout(renderResults, 100); });
  $$('.search-filters button').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; $$('.search-filters button').forEach(b => b.setAttribute('aria-pressed', String(b === button))); renderResults(); input.focus(); }));
  document.addEventListener('keydown', event => {
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing && !dialog?.open)) { event.preventDefault(); openSearch(); }
  });
  dialog?.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key) || event.isComposing) return;
    const results = $$('.search-result', dialog); if (!results.length) return;
    const focused = results.indexOf(document.activeElement);
    if (event.key === 'Enter') { if (document.activeElement === input) { event.preventDefault(); results[Math.max(0, selected)].click(); } return; }
    if (document.activeElement !== input && focused < 0) return;
    event.preventDefault(); selected = focused < 0 ? (event.key === 'ArrowDown' ? 0 : results.length - 1) : focused + (event.key === 'ArrowDown' ? 1 : -1);
    if (selected < 0) { selected = -1; input.focus(); } else { selected = Math.min(selected, results.length - 1); results[selected].focus(); results[selected].scrollIntoView({ block: 'nearest' }); }
  });

  // Keep every folder open in plain HTML; condense only after controls work.
  $$('.catalog-section').forEach(section => {
    $$('details', section).forEach(detail => { detail.open = false; });
    const button = $('.collapse-topic', section); if (!button) return;
    button.hidden = !section.querySelector('details'); button.textContent = '展开目录';
    button.addEventListener('click', () => { const expand = !$$('details', section).every(d => d.open); $$('details', section).forEach(d => { d.open = expand; }); button.textContent = expand ? '收起目录' : '展开目录'; });
  });
  function revealHash() {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id); if (!target) return;
    let parent = target.parentElement;
    while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
    const ownDetail = target.querySelector(':scope > details'); if (ownDetail) ownDetail.open = true;
  }
  revealHash(); window.addEventListener('hashchange', revealHash);
  const content = $('.prose');
  if (content) {
    const readingTime = $('[data-reading-time]');
    if (readingTime) readingTime.textContent = `约 ${Math.max(1, Math.ceil(content.textContent.replace(/\s/g, '').length / 500))} 分钟阅读`;
    $$('img', content).forEach(image => {
      image.loading = 'lazy'; image.decoding = 'async';
      const source = image.getAttribute('src') || '';
      if (!/^(https?:)?\/\//i.test(source) && /(^|\/)attach\//.test(source)) image.src = '/Wiki/' + source.slice(source.indexOf('attach/'));
    });
    $$('pre', content).forEach(pre => {
      const button = document.createElement('button'); button.className = 'copy-code'; button.textContent = '复制'; button.setAttribute('aria-label', '复制代码');
      button.addEventListener('click', async () => { const copy = pre.cloneNode(true); $$('button', copy).forEach(b => b.remove()); try { await navigator.clipboard.writeText(copy.textContent); button.textContent = '已复制'; announce('代码已复制'); } catch (_) { button.textContent = '请手动复制'; announce('无法访问剪贴板，请选中代码后复制'); } setTimeout(() => { button.textContent = '复制'; }, 2200); });
      pre.append(button);
    });
    const headings = $$('h1, h2, h3', content); const toc = $('#article-toc');
    if (headings.length && toc) {
      headings.forEach((heading, i) => { if (!heading.id) { let id = `note-section-${i}`; while (document.getElementById(id)) id += '-'; heading.id = id; } const link = document.createElement('a'); link.href = '#' + encodeURIComponent(heading.id); link.textContent = heading.textContent; link.className = 'depth-' + heading.tagName.slice(1); toc.append(link); });
      $('.toc-sidebar').hidden = false; document.documentElement.classList.add('js-enhanced');
      if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { $$('a', toc).forEach(link => link.classList.toggle('is-active', link.hash === '#' + encodeURIComponent(entry.target.id))); } }, { rootMargin: '-90px 0px -65% 0px' }); headings.forEach(h => observer.observe(h)); }
    }
    let frame;
    function updateProgress() { frame = null; const max = document.documentElement.scrollHeight - innerHeight; const bar = $('.reading-progress span'); if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 1})`; }
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateProgress); }, { passive: true }); window.addEventListener('resize', updateProgress); updateProgress();
  }
})();
