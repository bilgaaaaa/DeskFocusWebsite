# Deskfocus Website

Landing page for [Deskfocus](https://github.com/bilgaaaaa/deskfocus), a macOS widget that combines today's tasks with a focus timer.

Live site: https://deskfocus.bilgalog.dev/ (the `CNAME` file sets this domain for GitHub Pages; its DNS is a CNAME record `deskfocus` → `bilgaaaaa.github.io` at Cloudflare, DNS only)

Plain HTML, CSS and JavaScript — no build step, no dependencies.

## Structure

```
index.html                  Landing page markup
privacy.html                Privacy policy (linked from the footer, and used for App Store, Paddle and Google verification)
assets/css/styles.css       Design tokens, layout, components and sections
assets/js/main.js           Landing page entry point that initialises every module
assets/js/legal.js          Entry point for legal pages (footer year only)
assets/js/clock.js          Footer year and preview menu bar clock, shared by both entry points
assets/js/widget.js         Interactive widget preview (tasks, timer, app silencing)
assets/js/effects.js        Scroll reveals, statement band, marquee, section nav
assets/js/github-stats.js   Live GitHub stars and downloads under the hero
assets/js/logger.js         Shared console logger
assets/img/favicon.svg      Site icon
```

The scripts are ES modules, so open the site through a local server rather than as a `file://` page.

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy with GitHub Pages

Settings → Pages → Source: **Deploy from a branch**, Branch: `main`, folder `/ (root)`.

## Legal pages

`privacy.html` and `terms.html` share the layout of the landing page and are linked from every footer. Contact address: hello@bilgalog.dev.

Keep `privacy.html` in sync with the apps: if they start using a new service (analytics, crash reporting, a new payment provider), add it there and update the effective date. Change prices, plans or the refund rule in `terms.html` the same way.

The download buttons point to `https://github.com/bilgaaaaa/deskfocus/releases/latest`.
