# adrianscholl.is-a.dev

Personal site of Adrian Scholl — MSc Data Science, LMU Munich.
Static HTML/CSS/JS, no build step, no dependencies, no trackers.

## Structure

    index.html      one-page site (hero canvas, research, filterable timeline, projects, about, contact)
    thesis.html     master's thesis: abstract, findings, embedded PDF
    privacy.html    Datenschutzerklärung (DE) + privacy notice (EN)
    404.html
    style.css       design tokens for light and dark, all layout
    main.js         theme toggle, timeline filters, hero canvas (GP posterior + flow transport)
    CNAME           custom domain for GitHub Pages
    assets/fonts    self-hosted Archivo (variable) and IBM Plex Mono — no Google Fonts requests
    assets/img      favicon, og image, portrait
    assets/*.pdf    public CV, master's thesis, defence slides

## Deploy

Push to `main`. GitHub Pages serves the repository root.
Settings → Pages → Custom domain: `adrianscholl.is-a.dev`, Enforce HTTPS on.

## Notes

* No cookies, no analytics, no third-party requests — the privacy notice depends on this staying true.
* The hero canvas fits a Gaussian process (RBF kernel, Cholesky solve) in the browser and transports
  particles from Gaussian noise onto its posterior; particle spread equals the posterior standard deviation.
* The public CV deliberately omits phone number, postal address, date of birth and grades.
