# truhydrate — landing page

Static landing page (HTML/CSS/JS, GSAP from CDN). No build step; Vercel serves the repo root as-is.
Product pages and checkout live on Shopify.

## Structure
```
index.html            page markup + inline SVG sprite (logos, bottle illustration)
assets/css/style.css  brand tokens + all styles
assets/js/main.js     Shopify links config + interactions
assets/img/           imagery from the brand book, bottle-mask.svg
assets/logo/          logomark, primary, secondary, wordmark (SVG, exact from brand book)
doc/                  brand book (local only, git-ignored)
```

## Connect Shopify
Edit the `SHOPIFY` object at the top of `assets/js/main.js`: set `store` and the product handles.
Every element with `data-shop="…"` picks up its link from there.

## Brand fonts
Mont Heavy / Logic Monospace are licensed fonts. Until the files are added, Outfit and IBM Plex Mono
(Google Fonts) stand in. Drop `.woff2` files into `assets/fonts/` and uncomment the `@font-face` block
at the top of `style.css`.

## Local preview
```
python -m http.server 5173
```
