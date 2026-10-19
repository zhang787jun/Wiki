/* Real content checks: full-text discovery, ranking, filters, empty states. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const core = require('../themes/simple/static/js/search-core.js');
const pages = core.prepare(JSON.parse(readFileSync('output/static/data/search-index.json', 'utf8')).pages);
assert(pages.length > 300);
assert(core.search(pages, '湖仓一体')[0].title === '湖仓一体');
assert(core.search(pages, 'ＬＡＫＥＨＯＵＳＥ').some(p => p.title === '湖仓一体'));
assert(core.search(pages, 'schema-on-read').some(p => p.title === '湖仓一体'));
assert(core.search(pages, 'python 性能').some(p => p.title.includes('程序性能分析')));
assert(core.search(pages, 'python', '10-').every(p => p.category.startsWith('10-')));
assert(core.search(pages, 'zzzz_no_such_knowledge_zzzz').length === 0);
assert(core.search(pages, '<img src=x onerror=alert(1)>').length === 0);
assert(core.search(pages, '   ').length === pages.length);
assert(core.search(pages, 'C++').length > 0);
console.log('Verified Chinese/English/full-width queries, full-text discovery, ranking, AND matching, filters and empty results.');
