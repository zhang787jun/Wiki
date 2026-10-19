/* Shared, dependency-free ranking; exported for build-time behavior checks. */
(function (root) {
  'use strict';
  function normalize(value) { return String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim(); }
  function prepare(pages) {
    return pages.map(page => ({ ...page, _title: normalize(page.title), _path: normalize(page.category), _text: normalize(page.text) }));
  }
  function search(pages, query, filter = 'all') {
    const terms = normalize(query).slice(0, 160).split(' ').filter(Boolean);
    return pages.filter(p => filter === 'all' || p.category.startsWith(filter)).map(page => {
      if (!terms.length) return { page, score: 1 };
      let score = 0;
      for (const term of terms) {
        if (page._title === term) score += 160;
        else if (page._title.includes(term)) score += 90;
        else if (page._path.includes(term)) score += 25;
        else if (page._text.includes(term)) score += 8;
        else return { page, score: 0 };
      }
      return { page, score };
    }).filter(hit => hit.score > 0).sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title, 'zh-CN')).map(hit => hit.page);
  }
  const api = { normalize, prepare, search };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JimSearch = api;
})(typeof window === 'undefined' ? globalThis : window);
