# DeskFocus Website

Landing page for [DeskFocus](https://github.com/bilgaaaaa/deskfocus), a macOS widget that combines today's tasks with a focus timer.

Live site: https://bilgaaaaa.github.io/DeskFocusWebsite/

Plain HTML, CSS and JavaScript — no build step, no dependencies.

## Structure

```
index.html                  Page markup
assets/css/styles.css       Design tokens, layout, components and sections
assets/js/main.js           Entry point that initialises every module
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

## Before launch

Replace these placeholders in `index.html`:

- `[MACOS VERSION]` — minimum supported macOS version (appears twice)
- `[CONTACT EMAIL]` — contact address in the footer

The download buttons point to `https://github.com/bilgaaaaa/deskfocus/releases/latest`.
