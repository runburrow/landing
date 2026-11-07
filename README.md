# Burrow landing page

The site at [goburrow.net](https://goburrow.net). The app itself lives in
[runburrow/goburrow](https://github.com/runburrow/goburrow).

A static page: `index.html`, `styles.css`, `site.js`, and `assets/`. No build step and no
external requests (fonts, images, and scripts are all local). It follows the OS light/dark
setting, like the app.

## Before launch

- **Demo buttons are placeholders.** The three demo buttons say "Demo coming soon" and do
  nothing (dashed, muted, not focusable). Once the public demo runs, turn them into links in
  one go:

  ```sh
  sed -i 's#<span class="button soon" aria-disabled="true" data-demo>Demo coming soon</span>#<a class="button primary" href="https://YOUR-DEMO-URL">Try the demo</a>#g' index.html
  ```
  Then put "Open the demo, triage the sample projects, and resolve something." back as the
  closing section's lead.
- **Domain.** The canonical, Open Graph, Twitter and JSON-LD URLs use `https://goburrow.net/`
  (all in the `<head>` of `index.html`). Change them together if the domain changes:
  `sed -i 's#https://goburrow.net#https://NEW-DOMAIN#g' index.html`.
- **Social previews.** `og.png` (1200×630) is the card for links to the site. Check it with
  any link-preview debugger once the site is live. The app repository's preview is
  `brand/social/github-social.png` in [runburrow/goburrow](https://github.com/runburrow/goburrow); upload it under the repo's Settings → Social preview.
- **Hosting.** Any static host works. For GitHub Pages, publish this repository's root and add
  a `CNAME` file containing the domain.

## Screenshots

`assets/shots/` holds real screenshots of the dashboard taken from a local instance seeded
with synthetic data. Each has a `.json` sidecar recording how it was captured. Retake them
after visible dashboard changes so the page doesn't drift from the product.

## Preview locally

```sh
python3 -m http.server 8090
```
