/* S Printer — Photo & PDF size changer (KB / MB)
 * Makes images and PDFs smaller (or bigger) to an exact size while keeping the best
 * possible quality: it lowers the resolution only as far as needed and keeps JPEG
 * quality high, so text stays sharp. Everything runs in the browser.
 * Designed & developed by Raj. */
(function () {
  'use strict';
  var KB = 1024;
  var $ = function (id) { return document.getElementById(id); };
  var items = [], seq = 0, running = false, rerun = false;

  // ---------- helpers ----------
  function fmt(b) {
    if (b == null) return '–';
    if (b < KB) return b + ' B';
    if (b < KB * KB) return (b / KB).toFixed(b < 10 * KB ? 1 : 0) + ' KB';
    return (b / KB / KB).toFixed(2) + ' MB';
  }
  function toast(msg) {
    var t = $('sz-toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 2800);
  }
  function targetBytes() {
    var v = parseFloat($('sz-target').value), u = $('sz-unit').value;
    if (!(v > 0)) return 0;
    return Math.max(1, Math.round(v * (u === 'MB' ? KB * KB : KB)));
  }
  function opts() {
    var dimMode = $('sz-dim').value;
    return {
      T: targetBytes(), exact: $('sz-mode').value === 'exact', fmt: $('sz-format').value,
      doc: $('sz-doc').checked, gray: $('sz-gray').checked,
      dimMode: dimMode, w: parseInt($('sz-w').value, 10) || 0, h: parseInt($('sz-h').value, 10) || 0, lock: $('sz-lock').checked
    };
  }
  function blobOf(canvas, type, q) {
    return new Promise(function (res) {
      canvas.toBlob(function (b) {
        if (b) return res(b);
        var d = canvas.toDataURL(type, q), bin = atob(d.split(',')[1]), u = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        res(new Blob([u], { type: type }));
      }, type, q);
    });
  }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }

  // high quality downscale: halve step by step, then the last step
  function drawScaled(src, sw, sh, w, h, white) {
    var cur = src, cw = sw, ch = sh;
    while (cw / 2 >= w * 1.1 && ch / 2 >= h * 1.1) {
      var t = canvas(cw / 2, ch / 2), x = t.getContext('2d');
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(cur, 0, 0, t.width, t.height); cur = t; cw = t.width; ch = t.height;
    }
    var out = canvas(w, h), o = out.getContext('2d');
    if (white) { o.fillStyle = '#fff'; o.fillRect(0, 0, out.width, out.height); }
    o.imageSmoothingEnabled = true; o.imageSmoothingQuality = 'high';
    o.drawImage(cur, 0, 0, out.width, out.height);
    return out;
  }
  // mild unsharp mask so text stays crisp after shrinking
  function sharpen(c, amount) {
    var w = c.width, h = c.height; if (w < 3 || h < 3 || w * h > 12e6) return c;
    var x = c.getContext('2d'), img = x.getImageData(0, 0, w, h), d = img.data, src = new Uint8ClampedArray(d), row = w * 4;
    for (var y = 1; y < h - 1; y++) for (var i = 1; i < w - 1; i++) {
      var p = (y * w + i) * 4;
      for (var k = 0; k < 3; k++) {
        var c0 = src[p + k], blur = (src[p + k - 4] + src[p + k + 4] + src[p + k - row] + src[p + k + row]) / 4;
        d[p + k] = c0 + amount * (c0 - blur);
      }
    }
    x.putImageData(img, 0, 0); return c;
  }
  function grayscale(c) {
    var x = c.getContext('2d'), img = x.getImageData(0, 0, c.width, c.height), d = img.data;
    for (var i = 0; i < d.length; i += 4) { var g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; d[i] = d[i + 1] = d[i + 2] = g; }
    x.putImageData(img, 0, 0); return c;
  }

  // ---------- exact-size padding (adds harmless comment bytes, the picture does not change) ----------
  var CRC = (function () { var t = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  async function padTo(blob, T) {
    var need = T - blob.size; if (need <= 0) return blob;
    var u8 = new Uint8Array(await blob.arrayBuffer()), type = blob.type, parts = [];
    if (type === 'image/jpeg' && u8[0] === 0xFF && u8[1] === 0xD8) {
      if (need < 4) return blob;
      var segs = [], left = need;
      while (left >= 4) {
        var take = Math.min(left, 65537), len = take - 2, payload = take - 4;   // FF FE + 2-byte length + payload
        if (left - take > 0 && left - take < 4) { take -= 4; len = take - 2; payload = take - 4; }
        var s = new Uint8Array(take); s[0] = 0xFF; s[1] = 0xFE; s[2] = (len >> 8) & 255; s[3] = len & 255;
        for (var i = 0; i < payload; i++) s[4 + i] = 0x20;
        segs.push(s); left -= take;
      }
      parts = [u8.subarray(0, 2)].concat(segs, [u8.subarray(2)]);
    } else if (type === 'image/png') {
      if (need < 12 + 8) return blob;
      var data = need - 12, key = 'Comment\0', chunk = new Uint8Array(need), dv = new DataView(chunk.buffer);
      dv.setUint32(0, data); chunk.set([116, 69, 88, 116], 4);
      for (var j = 0; j < data; j++) chunk[8 + j] = j < key.length ? key.charCodeAt(j) : 0x20;
      dv.setUint32(8 + data, crc32(chunk.subarray(4, 8 + data)));
      var iend = u8.length - 12;                                   // IEND chunk is the last 12 bytes
      parts = [u8.subarray(0, iend), chunk, u8.subarray(iend)];
    } else if (type === 'application/pdf') {
      var pad = new Uint8Array(need); pad[0] = 0x0A; pad[1] = 0x25;   // "\n%" comment after the end of file
      for (var q = 2; q < need - 1; q++) pad[q] = 0x20; pad[need - 1] = 0x0A;
      if (need < 3) return blob;
      parts = [u8, pad];
    } else return blob;
    return new Blob(parts, { type: type });
  }

  // ---------- images ----------
  async function decodeImage(file) {
    try { if (window.createImageBitmap) return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) {}
    return await new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), i = new Image();
      i.onload = function () { res(i); }; i.onerror = function () { rej(new Error('decode')); }; i.src = u;
    });
  }
  function outType(file, o) {
    if (o.fmt === 'jpg') return 'image/jpeg';
    if (o.fmt === 'png') return 'image/png';
    if (o.fmt === 'webp') return 'image/webp';
    return /png$/i.test(file.type) ? 'image/png' : /webp$/i.test(file.type) ? 'image/webp' : 'image/jpeg';
  }
  function hasAlpha(it, bmp) {
    if (it.alpha != null) return it.alpha;
    try {
      var c = canvas(Math.min(256, bmp.width), Math.min(256, bmp.height)), x = c.getContext('2d');
      x.drawImage(bmp, 0, 0, c.width, c.height);
      var d = x.getImageData(0, 0, c.width, c.height).data;
      for (var i = 3; i < d.length; i += 4) if (d[i] < 250) return (it.alpha = true);
    } catch (e) {}
    return (it.alpha = false);
  }
  async function processImage(it, o) {
    var bmp = it.bmp || (it.bmp = await decodeImage(it.file));
    var W = bmp.width, H = bmp.height, type = outType(it.file, o);
    // a PNG without transparency that has to shrink compresses far better as JPG (keeps more detail)
    if (type === 'image/png' && o.fmt === 'same' && it.file.size > o.T && !hasAlpha(it, bmp)) type = 'image/jpeg';
    var fixed = o.dimMode === 'custom' && o.w > 0;
    var baseW = W, baseH = H;
    if (fixed) { baseW = o.w; baseH = o.lock || !o.h ? Math.round(o.w * H / W) : o.h; }
    var cap = Math.min(1, 6000 / Math.max(baseW, baseH)); baseW = Math.round(baseW * cap); baseH = Math.round(baseH * cap);
    var same = !fixed && type === (it.file.type === 'image/jpg' ? 'image/jpeg' : it.file.type) && !o.gray;
    // already small enough and nothing to change: keep the original, best quality
    if (same && !o.exact && it.file.size <= o.T) return { blob: it.file, w: W, h: H, q: 1, kept: true };
    if (same && o.exact && it.file.size <= o.T) return { blob: await padTo(it.file, o.T), w: W, h: H, q: 1, kept: true };

    var cache = {};
    var at = function (s) {
      var key = s.toFixed(4); if (cache[key]) return cache[key];
      var w = Math.max(1, Math.round(baseW * s)), h = Math.max(1, Math.round(baseH * s));
      var c = drawScaled(bmp, W, H, w, h, type === 'image/jpeg');
      if (o.gray) grayscale(c);
      if (o.doc && (w < W * 0.9)) sharpen(c, 0.35);
      return (cache[key] = c);
    };
    var T = o.T, qHi = 0.92, qMin = o.doc ? 0.55 : 0.6, best = null, s = 1;
    if (type === 'image/png') {
      // PNG has no quality setting: find the largest size that fits
      var lo = 0.02, hi = 1, b1 = await blobOf(at(1), type);
      if (b1.size <= T) best = { blob: b1, s: 1 };
      else {
        for (var k = 0; k < 9; k++) {
          var mid = (lo + hi) / 2, b = await blobOf(at(mid), type);
          if (b.size <= T) { best = { blob: b, s: mid }; lo = mid; } else hi = mid;
        }
        if (!best) best = { blob: await blobOf(at(0.02), type), s: 0.02, over: true };
      }
      best.q = 1;
    } else {
      for (var iter = 0; iter < 14 && !best; iter++) {
        var c = at(s), hiB = await blobOf(c, type, qHi);
        if (hiB.size <= T) {
          best = { blob: hiB, q: qHi, s: s };
          if (o.exact) {                                   // use the spare room for even better quality
            var a = qHi, z = 0.99;
            for (var r = 0; r < 4; r++) { var m = (a + z) / 2, bm = await blobOf(c, type, m); if (bm.size <= T) { best = { blob: bm, q: m, s: s }; a = m; } else z = m; }
          }
          break;
        }
        var loB = await blobOf(c, type, qMin);
        if (loB.size <= T) {
          var a2 = qMin, z2 = qHi; best = { blob: loB, q: qMin, s: s };
          for (var r2 = 0; r2 < 6; r2++) { var m2 = (a2 + z2) / 2, b2 = await blobOf(c, type, m2); if (b2.size <= T) { best = { blob: b2, q: m2, s: s }; a2 = m2; } else z2 = m2; }
          break;
        }
        if (fixed || Math.max(c.width, c.height) <= 48) {
          var a3 = 0.02, z3 = qMin, f3 = null;
          for (var r3 = 0; r3 < 7; r3++) { var m3 = (a3 + z3) / 2, b3 = await blobOf(c, type, m3); if (b3.size <= T) { f3 = { blob: b3, q: m3, s: s }; a3 = m3; } else z3 = m3; }
          best = f3 || { blob: await blobOf(c, type, 0.02), q: 0.02, s: s, over: true };
          break;
        }
        s *= Math.min(0.95, Math.max(0.35, Math.sqrt(T / loB.size) * 0.96));
      }
    }
    var cv = at(best.s), blob = best.blob;
    if (o.exact && blob.size < T) blob = await padTo(blob, T);
    return { blob: blob, w: cv.width, h: cv.height, q: best.q, over: !!best.over || blob.size > T };
  }

  // ---------- PDF ----------
  function askPassword(name, retry) {
    return new Promise(function (res) {
      $('sz-pass-name').textContent = name; $('sz-pass-err').hidden = !retry;
      $('sz-pass').hidden = false; var i = $('sz-pass-input'); i.value = ''; setTimeout(function () { i.focus(); }, 50);
      $('sz-pass-form').onsubmit = function (e) { e.preventDefault(); $('sz-pass').hidden = true; res(i.value); };
      $('sz-pass-cancel').onclick = function () { $('sz-pass').hidden = true; res(null); };
    });
  }
  async function loadPdfPages(it) {
    if (it.pages) return it.pages;
    var lib = window.pdfjsLib; if (!lib) throw new Error('PDF reader did not load');
    try { lib.GlobalWorkerOptions.workerSrc = '../assets/vendor/pdf.worker.min.js'; } catch (e) {}
    var data = new Uint8Array(await it.file.arrayBuffer());
    var task = lib.getDocument({ data: data }), cancelled = false;
    task.onPassword = function (update, reason) {
      askPassword(it.file.name, reason === 2).then(function (pw) { if (pw === null) { cancelled = true; task.destroy(); } else update(pw); });
    };
    var pdf = await task.promise.catch(function (e) { throw new Error(cancelled ? 'cancelled' : 'Could not open this PDF'); });
    var pages = [], n = Math.min(pdf.numPages, 60);
    for (var i = 1; i <= n; i++) {
      setStatus(it, 'Reading page ' + i + ' of ' + n + '…');
      var p = await pdf.getPage(i), v1 = p.getViewport({ scale: 1 });
      var sc = Math.min(200 / 72, 2400 / Math.max(v1.width, v1.height));
      var vp = p.getViewport({ scale: sc }), c = canvas(vp.width, vp.height), x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      await p.render({ canvasContext: x, viewport: vp }).promise;
      pages.push({ c: c, wPt: v1.width, hPt: v1.height, dpi: sc * 72 });
    }
    it.pages = pages; it.numPages = pdf.numPages;
    return pages;
  }
  async function processPdf(it, o) {
    var T = o.T;
    if (!o.gray && !o.exact && it.file.size <= T) return { blob: it.file, kept: true, pages: it.numPages };
    if (!o.gray && o.exact && it.file.size <= T) return { blob: await padTo(it.file, T), kept: true, pages: it.numPages };
    var pages = await loadPdfPages(it);
    var J = window.jspdf && window.jspdf.jsPDF; if (!J) throw new Error('PDF writer did not load');
    var memo = {};
    var scaled = function (pg, dpi) {
      var k = pg.dpi + '|' + dpi + '|' + pages.indexOf(pg); if (memo[k]) return memo[k];
      var f = Math.min(1, dpi / pg.dpi), c = f < 0.999 ? drawScaled(pg.c, pg.c.width, pg.c.height, pg.c.width * f, pg.c.height * f, true) : pg.c;
      if (o.gray) { if (c === pg.c) { var cc = canvas(c.width, c.height); cc.getContext('2d').drawImage(c, 0, 0); c = cc; } grayscale(c); }
      if (o.doc && f < 0.75) sharpen(c, 0.3);
      return (memo[k] = c);
    };
    var jpegs = async function (dpi, q) { var out = []; for (var i = 0; i < pages.length; i++) out.push(await blobOf(scaled(pages[i], dpi), 'image/jpeg', q)); return out; };
    var est = function (bs) { return bs.reduce(function (a, b) { return a + b.size; }, 0) + 1800 + pages.length * 700; };
    var DPIS = [200, 170, 150, 130, 115, 100, 90, 80, 72, 60, 50, 40], qHi = 0.9, qMin = o.doc ? 0.55 : 0.6, pick = null;
    for (var di = 0; di < DPIS.length && !pick; di++) {
      var dpi = DPIS[di]; setStatus(it, 'Trying ' + dpi + ' dpi…');
      var hi = await jpegs(dpi, qHi);
      if (est(hi) <= T) {
        pick = { dpi: dpi, q: qHi, b: hi };
        if (o.exact) { var a = qHi, z = 0.98; for (var r = 0; r < 3; r++) { var m = (a + z) / 2, bm = await jpegs(dpi, m); if (est(bm) <= T) { pick = { dpi: dpi, q: m, b: bm }; a = m; } else z = m; } }
        break;
      }
      var lo = await jpegs(dpi, qMin);
      if (est(lo) <= T) {
        var a2 = qMin, z2 = qHi; pick = { dpi: dpi, q: qMin, b: lo };
        for (var r2 = 0; r2 < 5; r2++) { var m2 = (a2 + z2) / 2, b2 = await jpegs(dpi, m2); if (est(b2) <= T) { pick = { dpi: dpi, q: m2, b: b2 }; a2 = m2; } else z2 = m2; }
      }
    }
    if (!pick) { var lastDpi = DPIS[DPIS.length - 1], qq = 0.3; pick = { dpi: lastDpi, q: qq, b: await jpegs(lastDpi, qq), over: true }; }
    var build = async function (bs) {
      var first = pages[0], pdf = new J({ unit: 'pt', format: [first.wPt, first.hPt], orientation: first.wPt > first.hPt ? 'l' : 'p', compress: true });
      for (var i = 0; i < pages.length; i++) {
        var pg = pages[i];
        if (i) pdf.addPage([pg.wPt, pg.hPt], pg.wPt > pg.hPt ? 'l' : 'p');
        var u8 = new Uint8Array(await bs[i].arrayBuffer());
        pdf.addImage(u8, 'JPEG', 0, 0, pg.wPt, pg.hPt, undefined, 'NONE');
      }
      return pdf.output('blob');
    };
    var blob = await build(pick.b);
    for (var tries = 0; tries < 4 && blob.size > T && !pick.over; tries++) {          // estimate was a little low
      pick.q = Math.max(0.2, pick.q - 0.06); pick.b = await jpegs(pick.dpi, pick.q); blob = await build(pick.b);
    }
    if (o.exact && blob.size < T) blob = await padTo(new Blob([blob], { type: 'application/pdf' }), T);
    return { blob: blob, dpi: pick.dpi, q: pick.q, pages: pages.length, over: blob.size > T };
  }

  // ---------- UI ----------
  var ICON = {
    img: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><defs><linearGradient id="szgi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22c1ee"/><stop offset="1" stop-color="#0077c8"/></linearGradient></defs><rect x="2.5" y="4" width="19" height="16" rx="3" fill="url(#szgi)"/><circle cx="8.5" cy="9.5" r="2" fill="#fff"/><path d="M4 18l5-5 3 3 4-4 4 4v2H4z" fill="#fff" opacity=".9"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><defs><linearGradient id="szgp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="#d6247a"/></linearGradient></defs><path d="M6 2.5h8l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V4a1.5 1.5 0 0 1 1-1.5z" fill="url(#szgp)"/><path d="M14 2.5V7a.5.5 0 0 0 .5.5H19" fill="#fff" opacity=".55"/><text x="12" y="17.2" font-size="5.6" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff">PDF</text></svg>',
    dl: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  function qualityLabel(r, it) {
    if (r.kept) return ['ok', 'Original quality'];
    var q = r.q || 0;
    if (it.isPdf) {
      var d = r.dpi || 0, sc = Math.min(1, d / 150) * 0.45 + q * 0.55;
      return sc >= 0.8 ? ['ok', 'Excellent quality'] : sc >= 0.66 ? ['ok', 'Good quality'] : sc >= 0.52 ? ['warn', 'Fair — readable'] : ['bad', 'Low — choose a bigger size'];
    }
    var small = Math.max(r.w || 0, r.h || 0) < 300;
    var lab = q >= 0.85 ? ['ok', 'Excellent quality'] : q >= 0.72 ? ['ok', 'Good quality'] : q >= 0.52 ? ['warn', 'Fair quality'] : ['bad', 'Low — choose a bigger size'];
    if (small && lab[0] === 'ok') lab = ['warn', lab[1] + ' · small picture'];
    return lab;
  }
  function setStatus(it, text) { if (it.el) it.el.querySelector('.sz-state').textContent = text; }
  function outName(it, r, o) {
    var base = it.file.name.replace(/\.[^.]+$/, ''), t = r.blob.type;
    var ext = t === 'image/png' ? 'png' : t === 'image/webp' ? 'webp' : t === 'application/pdf' ? 'pdf' : 'jpg';
    var kb = Math.round(r.blob.size / KB);
    return base + '_' + (kb >= 1024 ? (r.blob.size / KB / KB).toFixed(1) + 'MB' : kb + 'KB') + '.' + ext;
  }
  function addFiles(list) {
    [].slice.call(list || []).forEach(function (f) {
      var isPdf = /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name), isImg = /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name);
      if (!isPdf && !isImg) { toast('Not supported: ' + f.name); return; }
      var it = { id: ++seq, file: f, isPdf: isPdf };
      var el = document.createElement('article'); el.className = 'sz-item'; it.el = el;
      el.innerHTML = '<div class="sz-thumb">' + (isPdf ? ICON.pdf : '<img alt="">') + '</div>' +
        '<div class="sz-meta"><b class="sz-name"></b><span class="sz-sizes"><span class="sz-from"></span><svg class="sz-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg><span class="sz-to">…</span></span>' +
        '<span class="sz-state">Waiting…</span><span class="sz-bar"><i></i></span></div>' +
        '<div class="sz-acts"><button type="button" class="cp-btn sz-cmp" disabled title="Compare">' + ICON.eye + '<span>Compare</span></button>' +
        '<button type="button" class="cp-btn cp-btn-main sz-dl" disabled>' + ICON.dl + '<span>Download</span></button>' +
        '<button type="button" class="sz-x" aria-label="Remove">' + ICON.x + '</button></div>';
      el.querySelector('.sz-name').textContent = f.name;
      el.querySelector('.sz-from').textContent = fmt(f.size);
      if (!isPdf) { var u = URL.createObjectURL(f); it.srcUrl = u; el.querySelector('img').src = u; }
      el.querySelector('.sz-x').onclick = function () { items = items.filter(function (x) { return x !== it; }); el.remove(); refreshBar(); };
      el.querySelector('.sz-dl').onclick = function () { if (it.result) save(it.result.blob, it.outName); };
      el.querySelector('.sz-cmp').onclick = function () { openCompare(it); };
      $('sz-list').appendChild(el); items.push(it);
    });
    $('sz-empty').hidden = !!items.length;
    refreshBar(); runAll();
  }
  function save(blob, name) {
    var a = document.createElement('a'), u = URL.createObjectURL(blob);
    a.href = u; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(u); }, 4000);
  }
  function refreshBar() {
    var done = items.filter(function (i) { return i.result; });
    $('sz-all').disabled = done.length < 2; $('sz-all').hidden = items.length < 2;
    $('sz-results').hidden = !items.length;
  }
  async function runAll() {
    if (running) { rerun = true; return; }
    var o = opts();
    if (!o.T) { toast('Enter the size you want.'); return; }
    running = true;
    for (var i = 0; i < items.length; i++) {
      var it = items[i], el = it.el;
      el.classList.add('busy'); el.classList.remove('done', 'over');
      el.querySelector('.sz-dl').disabled = el.querySelector('.sz-cmp').disabled = true;
      el.querySelector('.sz-to').textContent = '…';
      setStatus(it, 'Working…');
      try {
        var r = it.isPdf ? await processPdf(it, o) : await processImage(it, o);
        if (rerun) break;
        it.result = r; it.outName = outName(it, r, o);
        if (!it.isPdf) { it.w = it.bmp.width; }
        var ql = qualityLabel(r, it);
        el.querySelector('.sz-to').textContent = fmt(r.blob.size);
        var ch = Math.round((r.blob.size - it.file.size) / it.file.size * 100), sv = el.querySelector('.sz-save');
        if (!sv) { sv = document.createElement('span'); sv.className = 'sz-save'; el.querySelector('.sz-sizes').appendChild(sv); }
        sv.textContent = ch === 0 ? 'same' : (ch > 0 ? '+' : '−') + Math.abs(ch) + '%'; sv.classList.toggle('up', ch > 0);
        var det = it.isPdf ? (r.kept ? (r.pages || '') + ' page(s) · unchanged' : r.pages + ' page(s) · ' + r.dpi + ' dpi') : r.w + ' × ' + r.h + ' px';
        setStatus(it, det + ' · ' + ql[1] + (r.over ? ' · could not get this small' : ''));
        el.querySelector('.sz-state').className = 'sz-state q-' + ql[0];
        el.classList.add('done'); if (r.over) el.classList.add('over');
        var pct = Math.min(100, Math.round(r.blob.size / Math.max(it.file.size, r.blob.size) * 100));
        el.querySelector('.sz-bar i').style.width = pct + '%';
        el.querySelector('.sz-dl').disabled = false; el.querySelector('.sz-cmp').disabled = it.isPdf && !it.pages;
      } catch (e) {
        if (String(e.message) === 'cancelled') { setStatus(it, 'Password not entered'); }
        else setStatus(it, 'Could not process: ' + (e.message || e));
      }
      el.classList.remove('busy');
    }
    running = false; refreshBar();
    if (rerun) { rerun = false; runAll(); }
  }

  // ---------- compare (before / after slider) ----------
  async function openCompare(it) {
    if (!it.result) return;
    var m = $('sz-cmp'), before = $('sz-cmp-a'), after = $('sz-cmp-b');
    if (it.isPdf) {
      var pg = it.pages && it.pages[0]; if (!pg) return;
      before.src = pg.c.toDataURL('image/jpeg', 0.95);
      after.src = '';
      try {
        var lib = window.pdfjsLib, d = await lib.getDocument({ data: new Uint8Array(await it.result.blob.arrayBuffer()) }).promise;
        var p = await d.getPage(1), vp = p.getViewport({ scale: pg.c.width / p.getViewport({ scale: 1 }).width }), c = canvas(vp.width, vp.height);
        await p.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise; after.src = c.toDataURL('image/png');
      } catch (e) {}
    } else {
      before.src = it.srcUrl;
      if (it.afterUrl) URL.revokeObjectURL(it.afterUrl);
      it.afterUrl = URL.createObjectURL(it.result.blob); after.src = it.afterUrl;
    }
    $('sz-cmp-l').textContent = 'Original · ' + fmt(it.file.size);
    $('sz-cmp-r').textContent = 'New · ' + fmt(it.result.blob.size);
    $('sz-cmp-range').value = 50; setSplit(50);
    m.hidden = false; document.documentElement.style.overflow = 'hidden';
  }
  function setSplit(v) { $('sz-cmp-b').style.clipPath = 'inset(0 0 0 ' + v + '%)'; $('sz-cmp-line').style.left = v + '%'; }

  // ---------- init ----------
  function init() {
    $('sz-file').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    var drop = $('sz-drop');
    ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.remove('drag'); }); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); addFiles(e.dataTransfer.files); });
    [].forEach.call(document.querySelectorAll('.sz-chip'), function (b) {
      b.addEventListener('click', function () {
        $('sz-target').value = b.dataset.v; $('sz-unit').value = b.dataset.u;
        [].forEach.call(document.querySelectorAll('.sz-chip'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        go();
      });
    });
    var t; var go = function () { clearTimeout(t); t = setTimeout(function () { if (items.length) runAll(); }, 350); };
    ['sz-target', 'sz-unit', 'sz-mode', 'sz-format', 'sz-doc', 'sz-gray', 'sz-w', 'sz-h', 'sz-lock'].forEach(function (id) { $(id).addEventListener('change', go); });
    $('sz-target').addEventListener('input', function () { [].forEach.call(document.querySelectorAll('.sz-chip'), function (x) { x.setAttribute('aria-pressed', 'false'); }); });
    $('sz-dim').addEventListener('change', function () { $('sz-dims').hidden = $('sz-dim').value !== 'custom'; go(); });
    [].forEach.call(document.querySelectorAll('.sz-seg button'), function (b) {
      b.addEventListener('click', function () {
        $('sz-mode').value = b.dataset.mode;
        [].forEach.call(document.querySelectorAll('.sz-seg button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        go();
      });
    });
    $('sz-all').onclick = async function () {
      var done = items.filter(function (i) { return i.result; });
      if (window.JSZip) {
        var z = new JSZip(); done.forEach(function (i) { z.file(i.outName, i.result.blob); });
        save(await z.generateAsync({ type: 'blob' }), 'SPrinter-resized.zip');
      } else done.forEach(function (i, k) { setTimeout(function () { save(i.result.blob, i.outName); }, k * 500); });
    };
    $('sz-cmp-range').addEventListener('input', function () { setSplit(this.value); });
    var close = function () { $('sz-cmp').hidden = true; document.documentElement.style.overflow = ''; };
    $('sz-cmp-x').onclick = close; $('sz-cmp').addEventListener('click', function (e) { if (e.target === this) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('sz-cmp').hidden) close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.__sizer = { items: function () { return items; }, run: runAll };
})();
