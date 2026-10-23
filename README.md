# adrian-io.github.io

Personal site of Adrian Scholl — MSc Data Science, LMU Munich. Live at <https://adrian-io.github.io/>.
Static HTML/CSS/JS, no build step, no dependencies, no trackers.

## Structure

    index.html      one-page site (hero canvas, research, writing, filterable timeline, projects, about, contact)
    thesis.html     master's thesis: abstract, findings, embedded PDF
    privacy.html    Datenschutzerklärung (DE) + privacy notice (EN)
    404.html
    style.css       design tokens for light and dark, all layout
    main.js         theme toggle, timeline filters, hero canvas (GP posterior + flow transport)
    sitemap.xml     the two indexable pages; robots.txt points to it
    assets/fonts    self-hosted Archivo (variable) and IBM Plex Mono — no Google Fonts requests
    assets/img      favicon, og image, portrait
    assets/*.pdf    public CV, master's thesis, defence slides, course papers
    build/          og.html and the script that renders it to assets/img/og.png

## Deploy

Push to `main`. GitHub Pages serves the repository root at `https://adrian-io.github.io/`; there is no custom domain.

## Notes

* No cookies, no analytics, no third-party requests — the privacy notice depends on this staying true.
* The `google-site-verification` meta tag in `index.html` keeps the site verified in Google Search Console. Keep it.
* The hero canvas fits a Gaussian process (RBF kernel, Cholesky solve) in the browser and transports
  particles from Gaussian noise onto its posterior; particle spread equals the posterior standard deviation.
* The public CV is the two-page academic CV without the phone number. It deliberately omits phone number,
  postal address and date of birth.
