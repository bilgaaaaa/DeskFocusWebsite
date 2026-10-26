# DeskFocus Website

Landing page for [DeskFocus](https://github.com/bilgaaaaa/deskfocus), a macOS widget that combines today's tasks with a focus timer.

Plain HTML, CSS and JavaScript — no build step, no dependencies.

## Structure

```
index.html              Page markup
assets/css/styles.css   Design tokens, layout and components
assets/js/main.js       Interactive widget preview in the hero
assets/img/favicon.svg  Site icon
```

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
