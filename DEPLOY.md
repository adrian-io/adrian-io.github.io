# Deploying this site

Everything here is static. There is no build step for the site itself — the one
`node build/build-og.js` script only regenerates the link-preview image.

## 1 · Push

```bash
git push origin main
```

The repository **must** stay named `adrian-io.github.io` for it to be served at the
root of your GitHub Pages user site. Changes are live within a minute or two.

## 2 · GitHub Pages settings

Repository → **Settings → Pages**

* Source: *Deploy from a branch* → `main` → `/ (root)`
* Custom domain: leave empty. Canonical links, `og:url`, the sitemap and `robots.txt` all
  point at `https://adrian-io.github.io/`, so search engines see one address.
* HTTPS is always on for `github.io` addresses.

## 3 · Google Search Console

The site is a URL-prefix property for `https://adrian-io.github.io/`, verified by the
`google-site-verification` meta tag in `index.html`. Removing the tag unverifies the property.

1. *Sitemaps* → submit `sitemap.xml`
2. *URL inspection* → `https://adrian-io.github.io/` → *Request indexing*
3. After larger content changes, bump `<lastmod>` in `sitemap.xml`

## 4 · Replacing the portrait

`assets/img/adrian.jpg`: portrait orientation, ~800×1000 px, under 300 KB.

    # useful for shrinking a phone photo before committing it:
    sips -Z 1000 --setProperty format jpeg photo.jpg --out assets/img/adrian.jpg

## 5 · Regenerating the built files

```bash
npm i -D playwright          # only needed for this script
node build/build-og.js       # build/og.html  -> assets/img/og.png
```

`assets/cv-adrian-scholl.pdf` is the two-page academic CV, compiled from its LaTeX source
(kept outside this repo) with the phone number removed. Replace the PDF when the CV changes.

## 6 · Things that must stay true

The privacy notice promises that the site makes no third-party requests. Before adding
anything, check it does not phone home:

* fonts stay in `assets/fonts/` — never link Google Fonts
* no CDN scripts, no embedded videos or maps, no analytics, no contact form
* if you ever add analytics, add it to `privacy.html` in the same commit

The site is treated as a **private, non-commercial page**, which is why it carries a
privacy notice but no Impressum. If you ever advertise freelance services, add ads or
affiliate links, that changes — you then need an Impressum with a court-serviceable address.
