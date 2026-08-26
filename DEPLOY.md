# Deploying this site

Everything here is static. There is no build step for the site itself — the two
`node build/*.js` scripts only regenerate the CV PDF and the link-preview image.

## 1 · Create the repository and push

```bash
cd ~/Documents/cv-website                   # this folder
git init -b main
git add .
git commit -m "Personal site: hero canvas, filterable CV, thesis, privacy notice"

# with the GitHub CLI (creates the repo and pushes in one go):
gh repo create adrian-io.github.io --public --source=. --remote=origin --push

# or, if the repo already exists on github.com:
git remote add origin git@github.com:adrian-io/adrian-io.github.io.git
git push -u origin main
```

The repository **must** be named `adrian-io.github.io` for it to be served at the
root of your GitHub Pages user site.

> **Order matters.** This repo contains a `CNAME` file naming `adrianscholl.is-a.dev`.
> GitHub Pages then redirects `adrian-io.github.io` to that domain — which does not resolve
> until the is-a.dev pull request (step 3) is merged, so the site looks broken in between.
> Either do step 3 first, or push without the CNAME and add it afterwards:
>
> ```bash
> git rm --cached CNAME && echo "CNAME" >> .gitignore   # push without it for now
> # once adrianscholl.is-a.dev resolves:
> git checkout -- .gitignore && git add -f CNAME && git commit -m "Custom domain" && git push
> ```

## 2 · Turn on GitHub Pages

Repository → **Settings → Pages**

* Source: *Deploy from a branch* → `main` → `/ (root)`
* Custom domain: `adrianscholl.is-a.dev` (this repo already contains the `CNAME` file)
* Tick **Enforce HTTPS** once the certificate is issued (can take up to an hour)

The site is live at `https://adrian-io.github.io/` within a minute of the first push,
and at the custom domain once DNS resolves.

## 3 · Claim adrianscholl.is-a.dev

1. Fork <https://github.com/is-a-dev/register>
2. Copy `is-a-dev/adrianscholl.json` from this repo to `domains/adrianscholl.json` in the fork
3. Open a pull request. Check <https://docs.is-a.dev/domain-structure/> first in case the
   schema changed; do **not** add an email address to the file — that file is public.
4. When it is merged, DNS points `adrianscholl.is-a.dev` at `adrian-io.github.io`.

Keep `adrian-io.github.io` working as the fallback: the `<link rel="canonical">` in
every page already points at the is-a.dev address, so search engines see one site.

## 4 · Add the portrait

Drop a photo at `assets/img/adrian.jpg` (portrait orientation, ~800×1000 px, under 300 KB).
The About section picks it up automatically — no code change needed. Until then it shows
a dashed placeholder.

    # useful for shrinking a phone photo before committing it:
    sips -Z 1000 --setProperty format jpeg photo.jpg --out assets/img/adrian.jpg

## 5 · Regenerating the built files

```bash
npm i -D playwright          # only needed for these two scripts
node build/build-cv.js       # build/cv.html  -> assets/cv-adrian-scholl.pdf
node build/build-og.js       # build/og.html  -> assets/img/og.png
```

Edit `build/cv.html` when the CV changes. It deliberately contains **no** phone number,
no postal address, no date of birth and no grades — that is the public version.

## 6 · Things that must stay true

The privacy notice promises that the site makes no third-party requests. Before adding
anything, check it does not phone home:

* fonts stay in `assets/fonts/` — never link Google Fonts
* no CDN scripts, no embedded videos or maps, no analytics, no contact form
* if you ever add analytics, add it to `privacy.html` in the same commit

The site is treated as a **private, non-commercial page**, which is why it carries a
privacy notice but no Impressum. If you ever advertise freelance services, add ads or
affiliate links, that changes — you then need an Impressum with a court-serviceable address.
