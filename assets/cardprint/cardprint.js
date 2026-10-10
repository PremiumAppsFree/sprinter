/* S Printer — Card Print tool (Aadhaar / PAN / Voter / Ayushman / any ID)
 * Small (PVC) · Long (foldable) · Full page · Custom
 * Everything runs in the browser. Designed & developed by Raj. */
(function () {
  'use strict';

  var DPI = 300, MM = 25.4;
  var PVC = { w: 85.6, h: 54 };
  var LONG = { w: 171.2, h: 54 };
  var PAPERS = { A4: [210, 297], Letter: [215.9, 279.4], Legal: [215.9, 355.6], A5: [148, 210], '4x6': [101.6, 152.4], PVC: [54, 85.6] };
  var DOCS = {
    aadhaar: { name: 'Aadhaar', pass: 'e-Aadhaar password: first 4 letters of the name in CAPITALS + year of birth. Example: RAJE1995' },
    pan: { name: 'PAN', pass: 'e-PAN password: date of birth as DDMMYYYY. Example: 15081995' },
    voter: { name: 'Voter ID', pass: 'Enter the password for this PDF.' },
    ayushman: { name: 'Ayushman', pass: 'Enter the password for this PDF.' },
    card: { name: 'ID card', pass: 'Enter the password for this PDF.' },
    sign: { name: 'Document', pass: 'e-Aadhaar: first 4 letters of the name in CAPITALS + birth year · e-PAN: date of birth DDMMYYYY.' }
  };
  var docKey = document.body.getAttribute('data-doc') || 'card';
  var DOC = DOCS[docKey] || DOCS.card;

  var $ = function (id) { return document.getElementById(id); };
  var px = function (mm, dpi) { return Math.round(mm / MM * (dpi || DPI)); };

  // ---------- state ----------
  var st = {
    size: 'small', sources: [], slots: {}, full: [],
    page: 0, pages: [], warn: '', sigs: []
  };
  var srcSeq = 0;

  // ---------- small helpers ----------
  var toastT;
  function toast(msg, ms) {
    var t = $('cp-toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, ms || 2600);
  }
  function busy(on, text) { $('cp-busy').hidden = !on; if (text) $('cp-busy-t').textContent = text; }
  function num(id, def, min, max) {
    var v = parseFloat($(id).value); if (!isFinite(v)) v = def;
    if (min != null) v = Math.max(min, v); if (max != null) v = Math.min(max, v); return v;
  }
  function loadImg(url) {
    return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = url; });
  }
  function canvasToURL(c, type, q) {
    return new Promise(function (res) {
      if (c.toBlob) c.toBlob(function (b) { res(URL.createObjectURL(b)); }, type || 'image/jpeg', q || 0.92);
      else res(c.toDataURL(type || 'image/jpeg', q || 0.92));
    });
  }
  function save(name, url) {
    var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); }, 500);
  }
  var PREF = 'sp-cardprint-v1';
  function savePrefs() {
    try {
      localStorage.setItem(PREF, JSON.stringify({
        paper: $('cp-paper').value, orient: $('cp-orient').value, arrange: $('cp-arrange').value, pos: $('cp-pos').value,
        margin: $('cp-margin').value, gap: $('cp-gap').value, cut: $('cp-cut').checked, round: $('cp-round').checked, fold: $('cp-fold').checked
      }));
    } catch (e) {}
  }
  function loadPrefs() {
    try {
      var p = JSON.parse(localStorage.getItem(PREF) || 'null'); if (!p) return;
      ['paper', 'orient', 'arrange', 'pos', 'margin', 'gap'].forEach(function (k) { if (p[k] != null && $('cp-' + k)) $('cp-' + k).value = p[k]; });
      ['cut', 'round', 'fold'].forEach(function (k) { if (p[k] != null) $('cp-' + k).checked = !!p[k]; });
    } catch (e) {}
  }

  // ---------- sizes & slots ----------
  function cardSize() {
    if (st.size === 'custom') return { w: num('cp-cw', 85.6, 10, 400), h: num('cp-ch', 54, 10, 400) };
    return PVC;
  }
  function slotDefs() {
    var s = st.size, list = [];
    if (s === 'small' || s === 'custom') {
      var c = cardSize();
      list.push({ key: 'front', label: 'Front side', w: c.w, h: c.h });
      if ($('cp-back').checked) list.push({ key: 'back', label: 'Back side', w: c.w, h: c.h });
    } else if (s === 'long') {
      if ($('cp-longsep').checked) {
        list.push({ key: 'lfront', label: 'Front half', w: PVC.w, h: PVC.h });
        list.push({ key: 'lback', label: 'Back half', w: PVC.w, h: PVC.h });
      } else list.push({ key: 'strip', label: 'Long strip (front + back)', w: LONG.w, h: LONG.h });
    }
    return list;
  }

  function renderSlots() {
    var box = $('cp-slots'); box.innerHTML = '';
    var full = st.size === 'full';
    $('cp-fullnote').hidden = !full;
    if ($('cp-opts-full')) $('cp-opts-full').hidden = !full;
    $('cp-opts-back').hidden = !(st.size === 'small' || st.size === 'custom');
    $('cp-opts-long').hidden = st.size !== 'long';
    $('cp-custom').hidden = st.size !== 'custom';
    $('cp-fold-wrap').hidden = st.size !== 'long';
    $('cp-arrange-wrap').hidden = !((st.size === 'small' || st.size === 'custom') && $('cp-back').checked);
    if (full) { renderFull(); return; }
    var old = box.parentNode.querySelector('.cp-fullpages'); if (old) old.remove();
    slotDefs().forEach(function (d) {
      var s = st.slots[d.key];
      var ok = s && s.canvas && Math.abs(s.w - d.w) < 0.01 && Math.abs(s.h - d.h) < 0.01;
      var el = document.createElement('div'); el.className = 'cp-slot' + (ok ? ' ready' : '');
      el.innerHTML = '<div class="cp-slot-h"><span>' + d.label + '</span><span class="cp-badge">' + (ok ? 'Ready' : 'Not cropped') + '</span></div>' +
        '<div class="cp-thumb" style="aspect-ratio:' + d.w + '/' + d.h + '">' + (ok ? '<img alt="">' : '<em>' + (st.sources.length ? 'Tap Crop' : 'Add a document first') + '</em>') + '</div>' +
        '<button type="button" class="cp-btn' + (ok ? '' : ' cp-btn-main') + '">' + (ok ? 'Crop again' : 'Crop ' + d.label.toLowerCase()) + '</button>';
      if (ok) el.querySelector('img').src = s.thumb;
      el.querySelector('button').disabled = !st.sources.length;
      el.querySelector('button').onclick = function () { openCrop(d); };
      box.appendChild(el);
    });
  }

  function renderFull() {
    var host = $('cp-slots');
    var wrap = host.parentNode.querySelector('.cp-fullpages');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'cp-fullpages'; host.parentNode.insertBefore(wrap, $('cp-fullnote')); }
    wrap.innerHTML = '';
    st.sources.forEach(function (src) {
      var f = st.full.find(function (x) { return x.id === src.id; });
      if (!f) { f = { id: src.id, rot: 0, on: true }; st.full.push(f); }
      var el = document.createElement('div'); el.className = 'cp-fp';
      el.innerHTML = '<img alt=""><div><button type="button" title="Rotate left">↶</button><button type="button" title="Rotate right">↷</button></div><label><input type="checkbox"> Print</label>';
      var img = el.querySelector('img'); img.src = src.thumb; img.style.transform = 'rotate(' + f.rot + 'deg)';
      var b = el.querySelectorAll('button');
      b[0].onclick = function () { f.rot = (f.rot + 270) % 360; img.style.transform = 'rotate(' + f.rot + 'deg)'; update(); };
      b[1].onclick = function () { f.rot = (f.rot + 90) % 360; img.style.transform = 'rotate(' + f.rot + 'deg)'; update(); };
      var cb = el.querySelector('input'); cb.checked = f.on; cb.onchange = function () { f.on = cb.checked; update(); };
      wrap.appendChild(el);
    });
    if (!st.sources.length) wrap.innerHTML = '';
  }

  // ---------- sources (files) ----------
  function renderSig() {
    var box = $('cp-sig'); if (!box) return;
    st.sigs = st.sigs.filter(function (g) { return st.sources.some(function (s) { return s.fileKey === g.key; }); });
    var list = st.sigs.filter(function (g) { return g.res && (g.res.status !== 'unsigned' || docKey === 'sign'); });
    box.hidden = !list.length; box.innerHTML = '';
    list.forEach(function (g) {
      var el = document.createElement('div'); el.className = 'cp-sigitem';
      el.innerHTML = (list.length > 1 || st.sigs.length > 1 ? '<p class="cp-sigfile"></p>' : '') + SPSig.describe(g.res);
      if (el.querySelector('.cp-sigfile')) el.querySelector('.cp-sigfile').textContent = g.name;
      if (g.res.status !== 'unsigned' && st.size !== 'full') {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'cp-btn cp-sigfull'; b.textContent = 'Print the full document';
        b.onclick = function () { var r = document.querySelector('input[name=cp-size][value=full]'); r.checked = true; r.dispatchEvent(new Event('change')); };
        el.appendChild(b);
      }
      box.appendChild(el);
    });
  }
  function renderSources() {
    renderSig();
    var box = $('cp-sources'); box.innerHTML = ''; box.hidden = !st.sources.length;
    st.sources.forEach(function (s) {
      var el = document.createElement('div'); el.className = 'cp-src';
      el.innerHTML = '<img alt=""><span></span><button type="button" aria-label="Remove">×</button>';
      el.querySelector('img').src = s.thumb; el.querySelector('span').textContent = s.name;
      el.querySelector('button').onclick = function () {
        st.sources = st.sources.filter(function (x) { return x !== s; });
        Object.keys(st.slots).forEach(function (k) { if (st.slots[k] && st.slots[k].srcId === s.id) delete st.slots[k]; });
        st.full = st.full.filter(function (x) { return x.id !== s.id; });
        renderSources(); renderSlots(); update();
      };
      box.appendChild(el);
    });
  }


  // ---------- find the card(s) on a page so the crop frame starts in the right place ----------
  function detectCards(canvas) {
    try {
      var k = Math.min(1, 420 / Math.max(canvas.width, canvas.height));
      var w = Math.max(1, Math.round(canvas.width * k)), h = Math.max(1, Math.round(canvas.height * k));
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d'); x.drawImage(canvas, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data, ink = new Uint8Array(w * h), i, j;
      for (i = 0; i < w * h; i++) {
        var r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        ink[i] = (0.3 * r + 0.59 * g + 0.11 * b < 205 || mx - mn > 45) ? 1 : 0;
      }
      // join nearby ink (2 px) so a card with a border and text becomes one blob
      var R = 2, m = new Uint8Array(w * h);
      for (j = 0; j < h; j++) for (i = 0; i < w; i++) {
        if (!ink[j * w + i]) continue;
        for (var yy = Math.max(0, j - R); yy <= Math.min(h - 1, j + R); yy++)
          for (var xx = Math.max(0, i - R); xx <= Math.min(w - 1, i + R); xx++) m[yy * w + xx] = 1;
      }
      var lab = new Int32Array(w * h), boxes = [], stack = [];
      for (i = 0; i < w * h; i++) {
        if (!m[i] || lab[i]) continue;
        var id = boxes.length + 1, bx = { x0: w, y0: h, x1: 0, y1: 0, n: 0 };
        lab[i] = id; stack.push(i);
        while (stack.length) {
          var q = stack.pop(), qx = q % w, qy = (q - qx) / w; bx.n++;
          if (qx < bx.x0) bx.x0 = qx; if (qx > bx.x1) bx.x1 = qx; if (qy < bx.y0) bx.y0 = qy; if (qy > bx.y1) bx.y1 = qy;
          if (qx > 0 && m[q - 1] && !lab[q - 1]) { lab[q - 1] = id; stack.push(q - 1); }
          if (qx < w - 1 && m[q + 1] && !lab[q + 1]) { lab[q + 1] = id; stack.push(q + 1); }
          if (qy > 0 && m[q - w] && !lab[q - w]) { lab[q - w] = id; stack.push(q - w); }
          if (qy < h - 1 && m[q + w] && !lab[q + w]) { lab[q + w] = id; stack.push(q + w); }
        }
        boxes.push(bx);
      }
      var out = boxes.map(function (b) {
        return { x: (b.x0 + R) / k, y: (b.y0 + R) / k, w: (b.x1 - b.x0 + 1 - 2 * R) / k, h: (b.y1 - b.y0 + 1 - 2 * R) / k, fill: b.n / ((b.x1 - b.x0 + 1) * (b.y1 - b.y0 + 1)) };
      }).filter(function (b) {
        return b.w > canvas.width * 0.12 && b.h > canvas.height * 0.04 && b.w < canvas.width * 0.995 && b.h < canvas.height * 0.995 && b.w / b.h > 0.45 && b.w / b.h < 4;
      });
      // drop blobs that sit inside a bigger one
      out = out.filter(function (b) {
        return !out.some(function (o) { return o !== b && o.w * o.h > b.w * b.h && b.x >= o.x - 2 && b.y >= o.y - 2 && b.x + b.w <= o.x + o.w + 2 && b.y + b.h <= o.y + o.h + 2; });
      });
      out.sort(function (a, b) { return b.w * b.h - a.w * a.h; });
      return out.slice(0, 10);
    } catch (e) { return []; }
  }
  function cardPair(src) {
    var c = (src.cards || []).filter(function (b) { var r = b.w / b.h; return r > 1.3 && r < 1.95; });
    for (var i = 0; i < c.length; i++) for (var j = 0; j < c.length; j++) {
      if (i === j) continue;
      var a = c[i], b = c[j];
      if (Math.abs(a.w - b.w) > 0.18 * a.w || Math.abs(a.h - b.h) > 0.18 * a.h) continue;
      var vo = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y), ho = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      if (vo > 0.7 * a.h && b.x > a.x + a.w * 0.8 && b.x - (a.x + a.w) < a.w * 0.6) return [a, b];
      if (ho > 0.7 * a.w && b.y > a.y + a.h * 0.8 && b.y - (a.y + a.h) < a.h * 0.6) return [a, b];
    }
    return null;
  }
  function guessBox(def, src) {
    var ratio = def.w / def.h, pair = cardPair(src), twin = { back: 'front', lback: 'lfront' }[def.key];
    if (pair) {
      if (def.key === 'strip') {
        var a = pair[0], b = pair[1];
        if (b.x > a.x + a.w * 0.8) return { x: a.x, y: Math.min(a.y, b.y), width: b.x + b.w - a.x, height: Math.max(a.y + a.h, b.y + b.h) - Math.min(a.y, b.y) };
        return null;
      }
      var p = twin ? pair[1] : pair[0];
      return { x: p.x, y: p.y, width: p.w, height: p.h };
    }
    var used = twin && st.slots[twin] && st.slots[twin].srcId === src.id ? st.slots[twin].data : null;
    var best = null, bestScore = 1e9;
    (src.cards || []).forEach(function (b) {
      if (used && Math.min(b.x + b.w, used.x + used.width) - Math.max(b.x, used.x) > 0.5 * b.w &&
          Math.min(b.y + b.h, used.y + used.height) - Math.max(b.y, used.y) > 0.5 * b.h) return;
      var err = Math.abs(Math.log((b.w / b.h) / ratio));
      if (err > 0.28) return;
      var score = err - 0.15 * Math.log(b.w * b.h);
      if (score < bestScore) { bestScore = score; best = b; }
    });
    if (best) return { x: best.x, y: best.y, width: best.w, height: best.h };
    // a photo that is just the card
    if (Math.abs(Math.log((src.w / src.h) / ratio)) < 0.2 && !used) return { x: 0, y: 0, width: src.w, height: src.h };
    return null;
  }

  async function addCanvasSource(canvas, name, extra) {
    var url = await canvasToURL(canvas, 'image/jpeg', 0.92);
    var t = document.createElement('canvas'), k = 160 / Math.max(canvas.width, canvas.height);
    t.width = Math.max(1, Math.round(canvas.width * k)); t.height = Math.max(1, Math.round(canvas.height * k));
    t.getContext('2d').drawImage(canvas, 0, 0, t.width, t.height);
    st.sources.push({ id: ++srcSeq, name: name, url: url, thumb: t.toDataURL('image/jpeg', 0.8), w: canvas.width, h: canvas.height, cards: detectCards(canvas), mmW: extra && extra.mmW, mmH: extra && extra.mmH, fileKey: extra && extra.fileKey, signed: extra && extra.signed });
  }

  async function addImageFile(file) {
    var url = URL.createObjectURL(file), img = await loadImg(url);
    var MAX = 3600, k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
    var c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    await addCanvasSource(c, file.name);
  }

  function askPassword(retry) {
    return new Promise(function (res) {
      $('cp-pass-hint').textContent = DOC.pass; $('cp-pass-err').hidden = !retry;
      $('cp-pass').hidden = false; var inp = $('cp-pass-input'); inp.value = ''; setTimeout(function () { inp.focus(); }, 50);
      $('cp-pass-form').onsubmit = function (e) { e.preventDefault(); $('cp-pass').hidden = true; res(inp.value.trim()); };
      $('cp-pass-cancel').onclick = function () { $('cp-pass').hidden = true; res(null); };
    });
  }

  async function addPdfFile(file) {
    var lib = window.pdfjsLib;
    if (!lib) { toast('PDF reader could not load. Check the internet and refresh.'); return; }
    try { lib.GlobalWorkerOptions.workerSrc = '../assets/vendor/pdf.worker.min.js'; } catch (e) {}
    var data = new Uint8Array(await file.arrayBuffer());
    var fileKey = 'f' + (++srcSeq) + '-' + file.name, sig = null;
    if (window.SPSig) {
      busy(true, 'Checking digital signature…');
      try { sig = await SPSig.verify(data); } catch (e) { sig = { status: 'error', signatures: [] }; }
      st.sigs.push({ key: fileKey, name: file.name, res: sig });
    }
    var task = lib.getDocument({ data: data.slice() });
    var cancelled = false, usedPw = '';
    task.onPassword = function (update, reason) {
      busy(false);
      askPassword(reason === 2).then(function (pw) {
        if (pw === null) { cancelled = true; try { task.destroy(); } catch (e) {} return; }
        busy(true, 'Opening PDF…'); usedPw = pw; update(pw);
      });
    };
    var pdf;
    try { pdf = await task.promise; } catch (e) { st.sigs = st.sigs.filter(function (g) { return g.key !== fileKey; }); if (!cancelled) toast('Could not open this PDF.'); return; }
    if (sig && sig.encrypted && window.SPSig) SPSig.unlock(sig, usedPw);
    if (sig && sig.status === 'unsigned') {
      // explain *why* there is no signature: a signature box without data, or an official document that lost it
      try {
        var p1 = await pdf.getPage(1), an = await p1.getAnnotations(), hasSigBox = an.some(function (a) { return a.fieldType === 'Sig'; });
        var tc = await p1.getTextContent(), txt = tc.items.map(function (t) { return t.str; }).join(' ');
        var meta = await pdf.getMetadata().catch(function () { return {}; }), info = (meta && meta.info) || {};
        var official = /Unique\s*Identification\s*Authority|UIDAI|Aadhaar|आधार|Income\s*Tax\s*Department|Permanent\s*Account\s*Number|DigiLocker/i.test(txt + ' ' + (info.Title || '') + ' ' + (info.Author || '') + ' ' + (info.Subject || ''));
        if (hasSigBox) sig.status = 'stripped'; else if (official) sig.status = 'unsigned-official';
        sig.producer = info.Producer || info.Creator || '';
      } catch (e) {}
    }
    var n = Math.min(pdf.numPages, 20);
    for (var i = 1; i <= n; i++) {
      busy(true, 'Reading page ' + i + ' of ' + n + '…');
      var page = await pdf.getPage(i);
      var v1 = page.getViewport({ scale: 1 });
      var scale = Math.min(3508 / Math.max(v1.width, v1.height), 6);
      var vp = page.getViewport({ scale: scale });
      var c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: x, viewport: vp }).promise;
      var painted = 0;
      if (sig && sig.status === 'valid') { try { painted = await SPSig.paint(x, page, vp, sig); } catch (e) {} }
      await addCanvasSource(c, file.name.replace(/\.pdf$/i, '') + (n > 1 ? ' · p' + i : ''),
        { mmW: v1.width / 72 * MM, mmH: v1.height / 72 * MM, fileKey: fileKey, signed: painted > 0 });
    }
    if (pdf.numPages > 20) toast('Only the first 20 pages were added.');
  }

  async function addFiles(files) {
    files = [].slice.call(files || []); if (!files.length) return;
    var before = st.sources.length;
    busy(true, 'Opening…');
    try {
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) await addPdfFile(f);
        else if (/^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|bmp|heic)$/i.test(f.name)) await addImageFile(f);
        else toast('Unsupported file: ' + f.name);
      }
    } catch (e) { toast('Could not open the file.'); }
    busy(false);
    renderSources(); renderSlots(); update();
    if (st.sources.length > before && st.size !== 'full') {
      var next = slotDefs().find(function (d) { return !(st.slots[d.key] && st.slots[d.key].canvas); });
      if (next) openCrop(next, st.sources[before]);
    }
  }

  // ---------- crop window ----------
  var cropper = null, cropDef = null, cropSrc = null;
  function defaultSourceFor(def) {
    var s = st.slots;
    var twin = { back: 'front', lback: 'lfront' }[def.key];
    if (twin && s[twin] && s[twin].srcId) {
      var i = st.sources.findIndex(function (x) { return x.id === s[twin].srcId; });
      // two photos (front, back) → use the next one; one PDF page with both sides → same page
      if (i >= 0 && st.sources[i + 1] && st.sources.length >= 2 && !/· p\d+$/.test(st.sources[i].name)) return st.sources[i + 1];
      if (i >= 0) return st.sources[i];
    }
    return st.sources[0];
  }
  function openCrop(def, src) {
    if (!st.sources.length) { toast('Add a document first.'); return; }
    cropDef = def;
    var prev = st.slots[def.key];
    cropSrc = src || (prev && st.sources.find(function (x) { return x.id === prev.srcId; })) || defaultSourceFor(def);
    $('cp-crop-title').textContent = 'Crop: ' + def.label + ' (' + def.w + ' × ' + def.h + ' mm)';
    $('cp-lock').checked = !(prev && prev.free);
    var bar = $('cp-srcbar'); bar.innerHTML = '';
    if (st.sources.length > 1) st.sources.forEach(function (s) {
      var b = document.createElement('button'); b.type = 'button'; b.title = s.name;
      b.innerHTML = '<img alt="">'; b.querySelector('img').src = s.thumb;
      b.setAttribute('aria-pressed', String(s === cropSrc));
      b.onclick = function () { cropSrc = s; [].forEach.call(bar.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); startCropper(null); };
      bar.appendChild(b);
    });
    $('cp-crop').hidden = false; document.documentElement.style.overflow = 'hidden';
    startCropper(prev && prev.srcId === cropSrc.id ? prev.data : null);
  }
  function startCropper(data) {
    if (cropper) { cropper.destroy(); cropper = null; }
    var img = $('cp-crop-img'), def = cropDef;
    img.onload = function () {
      cropper = new Cropper(img, {
        viewMode: 1, dragMode: 'move', autoCropArea: 0.6, responsive: true, background: false, checkOrientation: false,
        toggleDragModeOnDblclick: false, aspectRatio: $('cp-lock').checked ? def.w / def.h : NaN,
        ready: function () {
          if (data) { try { cropper.rotateTo(data.rotate || 0); cropper.setData(data); } catch (e) {} return; }
          var g = guessBox(def, cropSrc);
          if (g && $('cp-lock').checked) {
            var rt = def.w / def.h, cx = g.x + g.width / 2, cy = g.y + g.height / 2;
            if (g.width / g.height > rt) g.height = g.width / rt; else g.width = g.height * rt;
            if (g.width > cropSrc.w) { g.width = cropSrc.w; g.height = g.width / rt; }
            if (g.height > cropSrc.h) { g.height = cropSrc.h; g.width = g.height * rt; }
            g.x = Math.max(0, Math.min(cropSrc.w - g.width, cx - g.width / 2));
            g.y = Math.max(0, Math.min(cropSrc.h - g.height, cy - g.height / 2));
          }
          if (g) { try { cropper.setData(g); return; } catch (e) {} }
          // back side on the same page as the front: start just to the right of the front crop
          var twin = { back: 'front', lback: 'lfront' }[def.key], t = twin && st.slots[twin];
          if (t && t.srcId === cropSrc.id && t.data && !t.data.rotate) {
            var d = t.data, nx = d.x + d.width * 1.06;
            if (nx + d.width <= cropSrc.w) cropper.setData({ x: nx, y: d.y, width: d.width, height: d.height });
          }
        }
      });
    };
    img.src = cropSrc.url;
  }
  function closeCrop() {
    $('cp-crop').hidden = true; document.documentElement.style.overflow = '';
    if (cropper) { cropper.destroy(); cropper = null; }
  }
  async function doneCrop() {
    if (!cropper) return;
    var def = cropDef, W = px(def.w), H = px(def.h);
    var free = !$('cp-lock').checked;
    var src = cropper.getCroppedCanvas({ fillColor: '#fff', imageSmoothingEnabled: true, imageSmoothingQuality: 'high', maxWidth: 6000, maxHeight: 6000 });
    if (!src || !src.width) { toast('Could not crop. Try again.'); return; }
    var out = document.createElement('canvas'); out.width = W; out.height = H;
    var x = out.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    x.imageSmoothingQuality = 'high';
    if (free) { var k = Math.min(W / src.width, H / src.height), w = src.width * k, h = src.height * k; x.drawImage(src, (W - w) / 2, (H - h) / 2, w, h); }
    else x.drawImage(src, 0, 0, W, H);
    st.slots[def.key] = { canvas: out, thumb: out.toDataURL('image/jpeg', 0.7), srcId: cropSrc.id, data: cropper.getData(), w: def.w, h: def.h, free: free };
    closeCrop(); renderSlots(); update();
    var next = slotDefs().find(function (d) { return !(st.slots[d.key] && st.slots[d.key].canvas && st.slots[d.key].w === d.w); });
    if (next) setTimeout(function () { openCrop(next); }, 250);
    else { toast('Ready — check the preview and print.'); var p = document.querySelector('.cp-preview-card'); if (p && innerWidth < 900) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }

  // ---------- image adjustments ----------
  var adjCache = new WeakMap();
  function adjusted(canvas) {
    var bw = $('cp-bw').checked, b = num('cp-bright', 0) / 100, c = num('cp-contrast', 0) / 100;
    if (!bw && !b && !c) return canvas;
    var key = bw + '|' + b + '|' + c, hit = adjCache.get(canvas);
    if (hit && hit.key === key) return hit.c;
    var o = document.createElement('canvas'); o.width = canvas.width; o.height = canvas.height;
    var x = o.getContext('2d'); x.drawImage(canvas, 0, 0);
    var d = x.getImageData(0, 0, o.width, o.height), p = d.data, cf = (1 + c), bo = b * 255;
    for (var i = 0; i < p.length; i += 4) {
      var r = p[i], g = p[i + 1], bl = p[i + 2];
      if (bw) { var l = 0.299 * r + 0.587 * g + 0.114 * bl; r = g = bl = l; }
      r = (r - 128) * cf + 128 + bo; g = (g - 128) * cf + 128 + bo; bl = (bl - 128) * cf + 128 + bo;
      p[i] = r < 0 ? 0 : r > 255 ? 255 : r; p[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g; p[i + 2] = bl < 0 ? 0 : bl > 255 ? 255 : bl;
    }
    x.putImageData(d, 0, 0);
    adjCache.set(canvas, { key: key, c: o });
    return o;
  }

  // ---------- layout ----------
  function paperFor(orientChoice, unit) {
    var p = PAPERS[$('cp-paper').value] || PAPERS.A4, W = p[0], H = p[1];
    if ($('cp-paper').value === 'PVC') return { W: 85.6, H: 54 };
    if (orientChoice === 'portrait') return { W: Math.min(W, H), H: Math.max(W, H) };
    if (orientChoice === 'landscape') return { W: Math.max(W, H), H: Math.min(W, H) };
    return null; // auto → decided by caller
  }
  function grid(W, H, m, g, uw, uh) {
    var cols = Math.floor((W - 2 * m + g) / (uw + g)), rows = Math.floor((H - 2 * m + g) / (uh + g));
    return { cols: Math.max(0, cols), rows: Math.max(0, rows), n: Math.max(0, cols) * Math.max(0, rows) };
  }

  function buildPages() {
    st.warn = '';
    var pages = [], copies = Math.round(num('cp-copies', 1, 1, 60));
    var isPVC = $('cp-paper').value === 'PVC';
    var m = isPVC ? 0 : num('cp-margin', 8, 0, 40), g = num('cp-gap', 4, 0, 30), pos = $('cp-pos').value;
    var orient = $('cp-orient').value;

    if (st.size === 'full') {
      var items = st.full.filter(function (f) { return f.on; }).map(function (f) {
        var s = st.sources.find(function (x) { return x.id === f.id; }); return s && { src: s, rot: f.rot };
      }).filter(Boolean);
      if (!items.length) return [];
      var p0 = PAPERS[$('cp-paper').value] || PAPERS.A4;
      items.forEach(function (it) {
        var turned = it.rot % 180 !== 0, iw = turned ? it.src.h : it.src.w, ih = turned ? it.src.w : it.src.h;
        var land = orient === 'landscape' || (orient === 'auto' && iw > ih);
        var W = land ? Math.max(p0[0], p0[1]) : Math.min(p0[0], p0[1]), H = land ? Math.min(p0[0], p0[1]) : Math.max(p0[0], p0[1]);
        if (isPVC) { W = 85.6; H = 54; }
        var aw = W - 2 * m, ah = H - 2 * m, k = Math.min(aw / iw, ah / ih), w = iw * k, h = ih * k, y = pos === 'top' ? m : (H - h) / 2;
        // a PDF page that fits the paper prints at its real size (100%)
        var mw = turned ? it.src.mmH : it.src.mmW, mh = turned ? it.src.mmW : it.src.mmH;
        if (!isPVC && mw && $('cp-actual') && $('cp-actual').checked && mw <= W + 0.5 && mh <= H + 0.5) { w = mw; h = mh; y = (H - h) / 2; }
        for (var c = 0; c < copies; c++) pages.push({ W: W, H: H, items: [{ full: it, x: (W - w) / 2, y: y, w: w, h: h }] });
      });
      return pages;
    }

    var defs = slotDefs(), S = st.slots;
    var ready = defs.every(function (d) { return S[d.key] && S[d.key].canvas && Math.abs(S[d.key].w - d.w) < 0.01; });
    var front = defs[0] && S[defs[0].key] && S[defs[0].key].canvas && S[defs[0].key].w === defs[0].w ? S[defs[0].key] : null;
    if (!front) return [];
    if (!ready) st.warn = 'Crop all sides to finish. Showing what is ready.';

    var units = [], duplex = false, cw, ch;
    if (st.size === 'long') {
      var sep = $('cp-longsep').checked;
      var fold = $('cp-fold').checked;
      var u = { w: LONG.w, h: LONG.h, parts: [], fold: fold ? LONG.w / 2 : null };
      if (sep) { u.parts.push({ c: S.lfront && S.lfront.canvas, x: 0, y: 0, w: PVC.w, h: PVC.h }); if (S.lback && S.lback.canvas) u.parts.push({ c: S.lback.canvas, x: PVC.w, y: 0, w: PVC.w, h: PVC.h }); }
      else u.parts.push({ c: S.strip.canvas, x: 0, y: 0, w: LONG.w, h: LONG.h });
      units.push(u);
    } else {
      var cs = cardSize(); cw = cs.w; ch = cs.h;
      var back = $('cp-back').checked && S.back && S.back.canvas && S.back.w === cw ? S.back.canvas : null;
      var arr = $('cp-arrange').value;
      if (back && isPVC) arr = 'duplex';
      if (!back) units.push({ w: cw, h: ch, parts: [{ c: front.canvas, x: 0, y: 0, w: cw, h: ch }] });
      else if (arr === 'side') units.push({ w: 2 * cw + g, h: ch, parts: [{ c: front.canvas, x: 0, y: 0, w: cw, h: ch }, { c: back, x: cw + g, y: 0, w: cw, h: ch }] });
      else if (arr === 'stack') units.push({ w: cw, h: 2 * ch + g, parts: [{ c: front.canvas, x: 0, y: 0, w: cw, h: ch }, { c: back, x: 0, y: ch + g, w: cw, h: ch }] });
      else { duplex = true; units.push({ w: cw, h: ch, parts: [{ c: front.canvas, x: 0, y: 0, w: cw, h: ch }], back: back }); }
    }
    var unit = units[0];
    var list = []; for (var i = 0; i < copies; i++) list.push(unit);

    // paper + orientation
    var W, H, gr;
    if (isPVC) {
      W = 85.6; H = 54;
      if (unit.w > W + 0.01 || unit.h > H + 0.01) { st.warn = 'This size does not fit on a PVC card. Choose A4 paper.'; return []; }
      gr = { cols: 1, rows: 1, n: 1 };
    } else {
      var fixed = paperFor(orient);
      if (fixed) { W = fixed.W; H = fixed.H; gr = grid(W, H, m, g, unit.w, unit.h); }
      else {
        var p = PAPERS[$('cp-paper').value] || PAPERS.A4, Pw = Math.min(p[0], p[1]), Ph = Math.max(p[0], p[1]);
        var gp = grid(Pw, Ph, m, g, unit.w, unit.h), gl = grid(Ph, Pw, m, g, unit.w, unit.h);
        if (gl.n > gp.n) { W = Ph; H = Pw; gr = gl; } else { W = Pw; H = Ph; gr = gp; }
      }
      if (!gr.n) { st.warn = 'This size is too big for the paper. Try Landscape, a bigger paper or a smaller margin.'; return []; }
    }

    function place(chunk, mirror) {
      var used = Math.min(gr.cols, chunk.length), rowsUsed = Math.ceil(chunk.length / gr.cols);
      var bw = used * unit.w + (used - 1) * g, bh = rowsUsed * unit.h + (rowsUsed - 1) * g;
      var x0 = (W - bw) / 2, y0 = pos === 'top' ? m : (H - bh) / 2;
      if (isPVC) { x0 = (W - unit.w) / 2; y0 = (H - unit.h) / 2; }
      var items = [];
      chunk.forEach(function (u, idx) {
        var col = idx % gr.cols, row = Math.floor(idx / gr.cols);
        if (mirror) col = used - 1 - col;
        items.push({ unit: u, x: x0 + col * (unit.w + g), y: y0 + row * (unit.h + g), back: !!mirror });
      });
      return { W: W, H: H, items: items };
    }
    for (var s = 0; s < list.length; s += gr.n) {
      var chunk = list.slice(s, s + gr.n);
      pages.push(place(chunk, false));
      if (duplex && unit.back) pages.push(place(chunk, true));
    }
    st.layoutInfo = { perPage: gr.n, W: W, H: H, duplex: duplex && !!unit.back };
    return pages;
  }

  // ---------- drawing ----------
  function rr(x, X, Y, w, h, r) {
    x.beginPath();
    if (x.roundRect) x.roundRect(X, Y, w, h, r);
    else { x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
  }
  function drawPage(page, dpi) {
    var c = document.createElement('canvas'); c.width = px(page.W, dpi); c.height = px(page.H, dpi);
    var x = c.getContext('2d'), k = dpi / MM;
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    var cut = $('cp-cut').checked, round = $('cp-round').checked && st.size !== 'full';
    var R = 3.18 * k;
    page.items.forEach(function (it) {
      if (it.full) {
        var s = it.full.src, rot = it.full.rot, img = s._img;
        if (!img) return;
        var X = it.x * k, Y = it.y * k, w = it.w * k, h = it.h * k;
        x.save(); x.translate(X + w / 2, Y + h / 2); x.rotate(rot * Math.PI / 180);
        var dw = rot % 180 ? h : w, dh = rot % 180 ? w : h;
        x.drawImage(adjusted(img), -dw / 2, -dh / 2, dw, dh); x.restore();
        return;
      }
      var u = it.unit, ox = it.x * k, oy = it.y * k;
      var parts = it.back ? [{ c: u.back, x: 0, y: 0, w: u.w, h: u.h }] : u.parts;
      parts.forEach(function (p) {
        if (!p.c) return;
        var X = ox + p.x * k, Y = oy + p.y * k, w = p.w * k, h = p.h * k;
        if (round && st.size !== 'long') { x.save(); rr(x, X, Y, w, h, R); x.clip(); x.drawImage(adjusted(p.c), X, Y, w, h); x.restore(); }
        else x.drawImage(adjusted(p.c), X, Y, w, h);
        if (cut && st.size !== 'long') { x.lineWidth = Math.max(1, 0.2 * k); x.strokeStyle = '#8C96A3'; if (round) { rr(x, X, Y, w, h, R); x.stroke(); } else x.strokeRect(X, Y, w, h); }
      });
      if (st.size === 'long') {
        var W2 = u.w * k, H2 = u.h * k;
        if (round) { x.save(); rr(x, ox, oy, W2, H2, R); x.globalCompositeOperation = 'destination-in'; x.fill(); x.restore(); x.save(); x.globalCompositeOperation = 'destination-over'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.restore(); }
        if (cut) { x.lineWidth = Math.max(1, 0.2 * k); x.strokeStyle = '#8C96A3'; if (round) { rr(x, ox, oy, W2, H2, R); x.stroke(); } else x.strokeRect(ox, oy, W2, H2); }
        if (u.fold != null) { x.save(); x.setLineDash([2 * k, 1.5 * k]); x.lineWidth = Math.max(1, 0.25 * k); x.strokeStyle = '#9AA4B0'; x.beginPath(); x.moveTo(ox + u.fold * k, oy - 2 * k); x.lineTo(ox + u.fold * k, oy + H2 + 2 * k); x.stroke(); x.restore(); }
      }
    });
    return c;
  }

  async function ensureFullImages() {
    for (var i = 0; i < st.sources.length; i++) if (!st.sources[i]._img) st.sources[i]._img = await loadImg(st.sources[i].url);
  }

  // ---------- preview ----------
  var updT;
  function update() { clearTimeout(updT); updT = setTimeout(doUpdate, 60); }
  async function doUpdate() {
    if (st.size === 'full') await ensureFullImages();
    st.pages = buildPages();
    if (st.page >= st.pages.length) st.page = Math.max(0, st.pages.length - 1);
    var has = st.pages.length > 0;
    ['cp-print', 'cp-pdf', 'cp-jpg'].forEach(function (id) { $(id).disabled = !has; });
    $('cp-empty').hidden = has; $('cp-canvas').style.visibility = has ? 'visible' : 'hidden';
    $('cp-pager').hidden = st.pages.length < 2;
    $('cp-pageno').textContent = (st.page + 1) + ' / ' + st.pages.length;
    var info = $('cp-info');
    if (has) {
      var pg = st.pages[st.page], cv = $('cp-canvas');
      var maxW = Math.min(cv.parentNode.clientWidth - 32, 760), dpi = Math.max(40, Math.min(120, maxW / (pg.W / MM)));
      var c = drawPage(pg, dpi); cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0);
      var pn = $('cp-paper').options[$('cp-paper').selectedIndex].text.split(' (')[0];
      var t = pn + ' · ' + (pg.W > pg.H ? 'landscape' : 'portrait') + ' · ' + st.pages.length + (st.pages.length > 1 ? ' pages' : ' page');
      if (st.size !== 'full' && st.layoutInfo) t += ' · up to ' + st.layoutInfo.perPage + ' per page' + (st.layoutInfo.duplex ? ' · back pages follow each front page' : '');
      info.textContent = st.warn ? st.warn : t; info.className = 'cp-info' + (st.warn ? ' warn' : '');
    } else {
      info.textContent = st.warn || ''; info.className = 'cp-info' + (st.warn ? ' warn' : '');
    }
  }

  // ---------- output ----------
  async function renderAll() {
    if (st.size === 'full') await ensureFullImages();
    var pages = buildPages(), out = [];
    for (var i = 0; i < pages.length; i++) {
      busy(true, 'Preparing page ' + (i + 1) + ' of ' + pages.length + '…');
      await new Promise(function (r) { setTimeout(r, 0); });
      var c = drawPage(pages[i], DPI);
      out.push({ W: pages[i].W, H: pages[i].H, url: c.toDataURL('image/jpeg', 0.95) });
      c.width = c.height = 1;
    }
    return out;
  }
  function fileBase() { return 'SPrinter-' + DOC.name.replace(/\s+/g, '') + '-' + st.size; }

  async function doPrint() {
    var out; try { out = await renderAll(); } finally { busy(false); }
    if (!out.length) return;
    var root = $('cp-print-root'); root.innerHTML = '';
    var W = out[0].W, H = out[0].H;
    var style = $('cp-print-style') || document.createElement('style'); style.id = 'cp-print-style';
    style.textContent = '@media print{@page{size:' + W + 'mm ' + H + 'mm;margin:0}html,body{margin:0!important;padding:0!important}#cp-print-root img{width:' + W + 'mm;height:' + H + 'mm}}';
    document.head.appendChild(style);
    var loads = out.map(function (p) {
      var im = new Image(); im.alt = ''; im.src = p.url; root.appendChild(im);
      return im.decode ? im.decode().catch(function () {}) : new Promise(function (r) { im.onload = r; });
    });
    await Promise.all(loads);
    document.body.classList.add('cp-printing');
    var cleaned = false;
    var clean = function () { if (cleaned) return; cleaned = true; document.body.classList.remove('cp-printing'); setTimeout(function () { root.innerHTML = ''; }, 500); };
    // Mobile browsers return from print() before the print preview is built,
    // so only tidy up once the browser says printing has finished.
    window.addEventListener('afterprint', clean, { once: true });
    setTimeout(function () { window.print(); }, 60);
  }
  async function doPdf() {
    var out; try { out = await renderAll(); } finally { busy(false); }
    if (!out.length) return;
    var J = window.jspdf && window.jspdf.jsPDF;
    if (!J) { toast('PDF maker could not load. Refresh the page.'); return; }
    var o = function (p) { return p.W > p.H ? 'landscape' : 'portrait'; };
    var pdf = new J({ unit: 'mm', format: [out[0].W, out[0].H], orientation: o(out[0]), compress: true });
    out.forEach(function (p, i) { if (i) pdf.addPage([p.W, p.H], o(p)); pdf.addImage(p.url, 'JPEG', 0, 0, p.W, p.H, undefined, 'FAST'); });
    pdf.save(fileBase() + '.pdf'); toast('PDF saved.');
  }
  async function doJpg() {
    var out; try { out = await renderAll(); } finally { busy(false); }
    out.forEach(function (p, i) { setTimeout(function () { save(fileBase() + (out.length > 1 ? '-' + (i + 1) : '') + '.jpg', p.url); }, i * 400); });
    if (out.length) toast(out.length > 1 ? out.length + ' JPG pages saved.' : 'JPG saved.');
  }

  // ---------- wiring ----------
  function init() {
    loadPrefs();
    var ds = document.body.getAttribute('data-size'), dr = ds && document.querySelector('input[name=cp-size][value=' + ds + ']');
    if (dr) { dr.checked = true; st.size = ds; if (ds === 'full') $('cp-margin').value = Math.min(num('cp-margin', 8), 5); }
    [].forEach.call(document.querySelectorAll('input[name=cp-size]'), function (r) {
      r.addEventListener('change', function () { if (r.checked) { st.size = r.value; if (st.size === 'full') $('cp-margin').value = Math.min(num('cp-margin', 8), 5); renderSlots(); renderSig(); update(); } });
    });
    $('cp-file').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    var drop = $('cp-drop');
    ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.remove('drag'); }); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); addFiles(e.dataTransfer.files); });
    ['cp-back', 'cp-longsep', 'cp-cw', 'cp-ch'].forEach(function (id) { $(id).addEventListener('change', function () { renderSlots(); update(); }); });
    if ($('cp-actual')) $('cp-actual').addEventListener('change', update);
    ['cp-paper', 'cp-orient', 'cp-arrange', 'cp-pos', 'cp-margin', 'cp-gap', 'cp-cut', 'cp-round', 'cp-fold', 'cp-bw', 'cp-copies'].forEach(function (id) {
      $(id).addEventListener('change', function () { savePrefs(); update(); }); $(id).addEventListener('input', update);
    });
    ['cp-bright', 'cp-contrast'].forEach(function (id) { $(id).addEventListener('input', function () { $(id + '-v').textContent = $(id).value; update(); }); });
    [].forEach.call(document.querySelectorAll('.cp-stepper button'), function (b) {
      b.addEventListener('click', function () { var i = $('cp-copies'); i.value = Math.max(1, Math.min(60, (parseInt(i.value, 10) || 1) + (+b.dataset.step))); update(); });
    });
    $('cp-prev').onclick = function () { if (st.page > 0) { st.page--; update(); } };
    $('cp-next').onclick = function () { if (st.page < st.pages.length - 1) { st.page++; update(); } };
    $('cp-print').onclick = doPrint; $('cp-pdf').onclick = doPdf; $('cp-jpg').onclick = doJpg;
    $('cp-crop-cancel').onclick = closeCrop; $('cp-crop-cancel2').onclick = closeCrop; $('cp-crop-done').onclick = doneCrop;
    $('cp-lock').onchange = function () { if (cropper) cropper.setAspectRatio($('cp-lock').checked ? cropDef.w / cropDef.h : NaN); };
    [].forEach.call(document.querySelectorAll('.cp-tools [data-act]'), function (b) {
      b.addEventListener('click', function () {
        if (!cropper) return; var a = b.dataset.act;
        if (a === 'rotl') cropper.rotate(-90); else if (a === 'rotr') cropper.rotate(90);
        else if (a === 'zin') cropper.zoom(0.2); else if (a === 'zout') cropper.zoom(-0.2);
        else if (a === 'all') { var cv = cropper.getCanvasData(); cropper.setCropBoxData({ left: cv.left, top: cv.top, width: cv.width, height: cv.height }); }
      });
    });
    document.addEventListener('keydown', function (e) {
      if ($('cp-crop').hidden) return;
      if (e.key === 'Escape') closeCrop(); else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') doneCrop();
    });
    window.addEventListener('resize', update);
    renderSlots(); update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.__cardprint = st; // for debugging
})();
