# Live Pages browser acceptance

This is a read-only test of the deployed homepage and Wiki, not a preview of PR
source. Run the **Live browser acceptance** workflow to collect reproducible
Chromium and WebKit results, screenshots, technical-stack observations, and a
check of the 390 published article URLs and their same-origin image assets.
It installs test-only dependencies in `/tmp`; the published site still has no
client framework or JavaScript bundler dependency.

The matrix covers 320, 390, 768 and 1366 CSS-pixel widths in light and dark
appearances. Narrow contexts emulate touch and mobile viewport behavior; they
are not physical iPhones or the shipping Safari application. WebKit is tested
as an engine. Chinese text entry is tested, but OS-level IME composition and
the on-screen keyboard are not simulated. The 683-pixel desktop reflow case
models the available CSS width of a 1366-pixel window at 200% zoom; it is not
evidence of actual browser UI zoom or accessibility text scaling.

The tests inspect real production search, navigation, theme persistence,
keyboard focus, 404 status/recovery, clipboard bytes in Chromium, and page
overflow. Screenshots require visual review in addition to machine checks.
The link audit does not certify third-party links/images, historical URLs not
present in the published 390-record index, article accuracy, or font rendering
on every operating system.

Run locally with Node 22 and Playwright 1.56.1 installed:

```sh
node scripts/browser-qa/acceptance.cjs
```

Results are in `browser-qa-results/summary.json`; the workflow uploads that file
and screenshots even on failure. A nonzero exit means at least one browser
case or published article/local-image URL needs investigation. HTTP/network
failures are recorded as observations rather than automatically attributed to
site code.
