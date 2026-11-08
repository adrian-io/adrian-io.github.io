/* Adrian Scholl — site behaviour. No dependencies, no network requests. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- theme ---------------- */
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) { stored = null; }
  if (stored === "dark" || stored === "light") root.setAttribute("data-theme", stored);

  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  var themer = document.getElementById("themer");
  if (themer) {
    themer.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      if (window.__fieldTheme) window.__fieldTheme();
    });
  }
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if (!root.getAttribute("data-theme") && window.__fieldTheme) window.__fieldTheme();
  });

  /* ---------------- year + email (kept out of the HTML source) ---------------- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = String(new Date().getFullYear());
  var user = "adrian.scholl99", host = "gmail" + "." + "com", addr = user + "@" + host;
  var mailline = document.getElementById("mailline");
  var mailbtn = document.getElementById("mailbtn");
  if (mailline) mailline.textContent = addr;
  if (mailbtn) mailbtn.setAttribute("href", "mailto:" + addr);

  /* ---------------- photo: use it as soon as the file exists ---------------- */
  var holder = document.getElementById("photo-holder");
  if (holder && !holder.querySelector("img")) {
    var probe = new Image();
    probe.onload = function () {
      holder.innerHTML = "";
      probe.alt = "Adrian Scholl";
      probe.loading = "lazy";
      holder.appendChild(probe);
    };
    probe.src = "assets/img/adrian.jpg";
  }

  /* ---------------- timeline filters ---------------- */
  var rows = [].slice.call(document.querySelectorAll("#rows .row"));
  var chips = [].slice.call(document.querySelectorAll(".f"));
  var count = document.getElementById("count");
  if (count && rows.length) count.textContent = rows.length + " of " + rows.length + " entries";
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var tag = chip.getAttribute("data-tag");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      var shown = 0;
      rows.forEach(function (r) {
        var hit = tag === "all" ||
          (" " + r.getAttribute("data-tags") + " ").indexOf(" " + tag + " ") > -1;
        r.classList.toggle("dim", !hit);
        r.classList.toggle("hit", hit && tag !== "all");
        if (hit) shown++;
      });
      if (count) count.textContent = shown + " of " + rows.length + " entries";
    });
  });

  /* ---------------- hero: flow transport onto a Gaussian process posterior ----------------
     Particles start as Gaussian noise and are transported left to right onto the posterior
     of a GP fitted to six observations. Their spread at the end of the path is the posterior
     standard deviation, so the picture shows both the transport and the uncertainty.        */
  var cvs = document.getElementById("field");
  if (!cvs) return;
  var ctx = cvs.getContext("2d", { alpha: false });
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var GRID = 180, mean = new Float64Array(GRID), sd = new Float64Array(GRID);
  var col = {};

  /* --- GP with an RBF kernel, solved once via Cholesky --- */
  var OBS_X = [0.30, 0.36, 0.42, 0.48, 0.55, 0.63];
  var OBS_Y = [0.24, -0.30, 0.34, -0.14, 0.30, -0.24];
  var ELL = 0.062, SIG2 = 0.55, NOISE = 0.004;
  var EXTENT = 1;                       /* filled after the fit: keeps the band inside the frame */
  function k(a, b) { var d = (a - b) / ELL; return SIG2 * Math.exp(-0.5 * d * d); }

  function fitGP() {
    var n = OBS_X.length, i, j, s, L = [], alpha = new Float64Array(n), v = new Float64Array(n);
    for (i = 0; i < n; i++) L.push(new Float64Array(n));
    for (i = 0; i < n; i++) {                       /* Cholesky of K + noise I */
      for (j = 0; j <= i; j++) {
        s = k(OBS_X[i], OBS_X[j]) + (i === j ? NOISE : 0);
        for (var m = 0; m < j; m++) s -= L[i][m] * L[j][m];
        L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j][j];
      }
    }
    function solve(b) {                              /* K^-1 b via the factor */
      var y = new Float64Array(n), x = new Float64Array(n), i2, j2, t;
      for (i2 = 0; i2 < n; i2++) { t = b[i2]; for (j2 = 0; j2 < i2; j2++) t -= L[i2][j2] * y[j2]; y[i2] = t / L[i2][i2]; }
      for (i2 = n - 1; i2 >= 0; i2--) { t = y[i2]; for (j2 = i2 + 1; j2 < n; j2++) t -= L[j2][i2] * x[j2]; x[i2] = t / L[i2][i2]; }
      return x;
    }
    alpha = solve(OBS_Y);
    for (var g = 0; g < GRID; g++) {
      var xs = g / (GRID - 1), ks = new Float64Array(n), mu = 0;
      for (i = 0; i < n; i++) { ks[i] = k(xs, OBS_X[i]); mu += ks[i] * alpha[i]; }
      v = solve(ks);
      var q = 0;
      for (i = 0; i < n; i++) q += ks[i] * v[i];
      mean[g] = mu;
      sd[g] = Math.sqrt(Math.max(SIG2 - q, 1e-6));
    }
    EXTENT = 0;
    for (var h = 0; h < GRID; h++) EXTENT = Math.max(EXTENT, Math.abs(mean[h]) + 2 * sd[h]);
  }
  fitGP();

  function at(arr, xNorm) {
    var g = xNorm * (GRID - 1), i = Math.max(0, Math.min(GRID - 2, Math.floor(g))), f = g - i;
    return arr[i] * (1 - f) + arr[i + 1] * f;
  }

  /* --- colours come from the stylesheet so both themes work --- */
  function readColours() {
    var cs = getComputedStyle(root);
    col.bg = cs.getPropertyValue("--canvas-bg").trim() || "#070A0F";
    col.lo = cs.getPropertyValue("--p-lo").trim() || "#38465C";
    col.hi = cs.getPropertyValue("--p-hi").trim() || "#A8C4FF";
    col.band = cs.getPropertyValue("--band").trim() || "168,196,255";
    col.rgbLo = hex(col.lo); col.rgbHi = hex(col.hi); col.rgbBg = hex(col.bg);
  }
  function hex(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  window.__fieldTheme = function () { readColours(); if (reduce) still(); };

  /* --- particles --- */
  var N = 900, P = [];
  function gauss() { var u = 1 - Math.random(), v2 = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v2); }
  function make(p) { return { p: p, sp: 0.05 + Math.random() * 0.075, n: gauss(), xi: gauss(), j: Math.random() * 6.28 }; }
  for (var i = 0; i < N; i++) P.push(make(Math.random()));

  function resize() {
    W = cvs.offsetWidth; H = cvs.offsetHeight;
    cvs.width = Math.max(1, Math.round(W * dpr));
    cvs.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = col.bg; ctx.fillRect(0, 0, W, H);
  }
  function smooth(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  var AMP = function () { return H * 0.34 / EXTENT; };
  var MID = function () { return H * 0.52; };

  function ribbon(kSig, alpha) {
    var amp = AMP(), mid = MID(), g, x;
    ctx.beginPath();
    for (g = 0; g < GRID; g++) { x = g / (GRID - 1) * W; ctx[g ? "lineTo" : "moveTo"](x, mid - (mean[g] + kSig * sd[g]) * amp); }
    for (g = GRID - 1; g >= 0; g--) { x = g / (GRID - 1) * W; ctx.lineTo(x, mid - (mean[g] - kSig * sd[g]) * amp); }
    ctx.closePath();
    ctx.fillStyle = "rgba(" + col.band + "," + alpha + ")";
    ctx.fill();
  }

  function drawPosterior() {
    var amp = AMP(), mid = MID(), g, x, i2;
    ribbon(2, 0.055);
    ribbon(1, 0.075);
    var cut = Math.round(OBS_X[OBS_X.length - 1] * (GRID - 1));
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(" + col.rgbHi.join(",") + ",0.34)";
    ctx.setLineDash([]);
    ctx.beginPath();
    for (g = 0; g <= cut; g++) { x = g / (GRID - 1) * W; ctx[g ? "lineTo" : "moveTo"](x, mid - mean[g] * amp); }
    ctx.stroke();
    ctx.strokeStyle = "rgba(" + col.rgbHi.join(",") + ",0.24)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (g = cut; g < GRID; g++) { x = g / (GRID - 1) * W; ctx[g === cut ? "moveTo" : "lineTo"](x, mid - mean[g] * amp); }
    ctx.stroke();
    ctx.setLineDash([]);
    for (i2 = 0; i2 < OBS_X.length; i2++) {
      ctx.beginPath();
      ctx.arc(OBS_X[i2] * W, mid - OBS_Y[i2] * amp, 2.6, 0, 6.2832);
      ctx.fillStyle = "rgba(" + col.rgbHi.join(",") + ",0.85)";
      ctx.fill();
    }
  }

  function paintParticles(time) {
    var amp = AMP(), mid = MID(), i2, q, w, x, mu, s, yNoise, yStruct, y, a, r, g2, b;
    for (i2 = 0; i2 < P.length; i2++) {
      q = P[i2];
      w = smooth(0.10, 0.94, q.p);
      x = q.p * W;
      mu = at(mean, q.p); s = at(sd, q.p);
      yNoise = mid + q.n * H * 0.30 + Math.sin(time * 0.7 + q.j) * (1 - w) * 5;
      yStruct = mid - (mu + s * q.xi * 1.15) * amp;
      y = (1 - w) * yNoise + w * yStruct;
      a = 0.18 + 0.55 * w;
      r = col.rgbLo[0] + (col.rgbHi[0] - col.rgbLo[0]) * w;
      g2 = col.rgbLo[1] + (col.rgbHi[1] - col.rgbLo[1]) * w;
      b = col.rgbLo[2] + (col.rgbHi[2] - col.rgbLo[2]) * w;
      ctx.fillStyle = "rgba(" + (r | 0) + "," + (g2 | 0) + "," + (b | 0) + "," + a + ")";
      ctx.fillRect(x, y, w > 0.8 ? 1.9 : 1.4, w > 0.8 ? 1.9 : 1.4);
    }
  }

  function still() {
    ctx.fillStyle = col.bg; ctx.fillRect(0, 0, W, H);
    drawPosterior();
    for (var k2 = 0; k2 < 3; k2++) paintParticles(0);
  }

  var live = true, t0 = 0;
  function frame(ts) {
    if (!t0) t0 = ts;
    var time = (ts - t0) / 1000;
    if (live) {
      ctx.fillStyle = "rgba(" + col.rgbBg.join(",") + ",0.15)";
      ctx.fillRect(0, 0, W, H);
      drawPosterior();
      for (var i2 = 0; i2 < P.length; i2++) {
        var q = P[i2];
        q.p += q.sp * 0.016;
        if (q.p > 1.05) P[i2] = make(0);
      }
      paintParticles(time);
    }
    requestAnimationFrame(frame);
  }

  readColours();
  resize();
  window.addEventListener("resize", function () { resize(); if (reduce) still(); });
  if (window.ResizeObserver) new ResizeObserver(function () { resize(); if (reduce) still(); }).observe(cvs);
  if (reduce) {
    still();
  } else {
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (e) { live = e[0].isIntersecting; }, { threshold: 0 }).observe(cvs);
    }
    requestAnimationFrame(frame);
  }
})();
