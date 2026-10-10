/* S Printer — Card Print tool (Aadhaar / PAN / Voter / Ayushman / any ID)
 * Small (PVC) · Long (foldable) · Full page · Custom
 * Everything runs in the browser. Designed & developed by Raj. */
(function () {
  'use strict';

  var DPI = 300, MM = 25.4;
  var PVC = { w: 85.6, h: 54 };
  var LONG = { w: 171.2, h: 54 };
  var PAPERS = { A4: [210, 297], A3: [297, 420], Letter: [215.9, 279.4], Legal: [215.9, 355.6], A5: [148, 210], '4x6': [101.6, 152.4], '5x7': [127, 177.8], PVC: [54, 85.6] };
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
    size: 'small', sources: [], slots: {}, full: [], adj: {},
    page: 0, pages: [], warn: '', sigs: [], queue: []
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
        margin: $('cp-margin').value, gap: $('cp-gap').value, cut: $('cp-cut').checked, round: $('cp-round').checked, fold: $('cp-fold').checked,
        dpi: $('cp-dpi') && $('cp-dpi').value, pw: $('cp-pw') && $('cp-pw').value, ph: $('cp-ph') && $('cp-ph').value, mirror: $('cp-mirror') && $('cp-mirror').checked
      }));
    } catch (e) {}
  }
  function loadPrefs() {
    try {
      var p = JSON.parse(localStorage.getItem(PREF) || 'null'); if (!p) return;
      ['paper', 'orient', 'arrange', 'pos', 'margin', 'gap', 'dpi', 'pw', 'ph'].forEach(function (k) { if (p[k] != null && $('cp-' + k)) $('cp-' + k).value = p[k]; });
      ['cut', 'round', 'fold', 'mirror'].forEach(function (k) { if (p[k] != null && $('cp-' + k)) $('cp-' + k).checked = !!p[k]; });
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

  // ---------- several different cards on one sheet ----------
  function renderQueue() {
    var box = $('cp-queue'); if (!box) return;
    var cur = st.size !== 'full' ? currentSet(num('cp-gap', 4, 0, 30)) : null;
    $('cp-addcard').hidden = st.size === 'full';
    $('cp-addcard').disabled = !(cur && cur.ready);
    box.hidden = !st.queue.length || st.size === 'full'; box.innerHTML = '';
    if (!st.queue.length) return;
    var h = document.createElement('p'); h.className = 'cp-queue-h'; h.textContent = 'Already on the sheet (' + st.queue.length + ')'; box.appendChild(h);
    st.queue.forEach(function (q, i) {
      var el = document.createElement('div'); el.className = 'cp-qi';
      el.innerHTML = '<img alt=""><span></span><button type="button" aria-label="Remove this card">×</button>';
      el.querySelector('img').src = q.thumb; el.querySelector('span').textContent = q.label + ' · ' + q.copies + (q.copies > 1 ? ' copies' : ' copy');
      el.querySelector('button').onclick = function () { st.queue.splice(i, 1); renderQueue(); update(); };
      box.appendChild(el);
    });
  }
  function addAnotherCard() {
    var cur = currentSet(num('cp-gap', 4, 0, 30)); if (!cur || !cur.ready) return;
    var c = cur.unit.parts[0].c, t = document.createElement('canvas'), k = 120 / Math.max(c.width, c.height);
    t.width = Math.round(c.width * k); t.height = Math.round(c.height * k); t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
    var label = { small: 'Small card', long: 'Long size', custom: 'Custom' }[st.size] || 'Card';
    st.queue.push({ unit: cur.unit, copies: Math.round(num('cp-copies', 1, 1, 60)), duplex: cur.duplex, thumb: t.toDataURL('image/jpeg', 0.8), label: label });
    st.slots = {}; $('cp-copies').value = 1;
    renderSlots(); renderQueue(); update();
    toast('Added. Now add or crop the next card — it goes on the same sheet.');
    var next = slotDefs()[0]; if (next && st.sources.length) setTimeout(function () { openCrop(next); }, 300);
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
      el.innerHTML = '<img alt=""><div><button type="button" title="Rotate left">↶</button><button type="button" title="Rotate right">↷</button><button type="button" class="cp-fpcrop" title="Crop this page">' + (f.crop ? 'Re-crop' : 'Crop') + '</button></div><label><input type="checkbox"> Print</label>';
      var img = el.querySelector('img'); img.src = src.thumb; img.style.transform = 'rotate(' + f.rot + 'deg)';
      var b = el.querySelectorAll('button');
      b[0].onclick = function () { f.rot = (f.rot + 270) % 360; img.style.transform = 'rotate(' + f.rot + 'deg)'; update(); };
      b[1].onclick = function () { f.rot = (f.rot + 90) % 360; img.style.transform = 'rotate(' + f.rot + 'deg)'; update(); };
      b[2].onclick = function () { openFullCrop(f); };
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
        st.adj = {}; renderSources(); renderSlots(); update();
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
    var url = await canvasToURL(canvas, 'image/png');   // lossless — no quality is lost before printing
    var t = document.createElement('canvas'), k = 160 / Math.max(canvas.width, canvas.height);
    t.width = Math.max(1, Math.round(canvas.width * k)); t.height = Math.max(1, Math.round(canvas.height * k));
    t.getContext('2d').drawImage(canvas, 0, 0, t.width, t.height);
    st.sources.push({ id: ++srcSeq, name: name, url: url, thumb: t.toDataURL('image/jpeg', 0.8), w: canvas.width, h: canvas.height, cards: detectCards(canvas), mmW: extra && extra.mmW, mmH: extra && extra.mmH, fileKey: extra && extra.fileKey, signed: extra && extra.signed, sigBoxes: extra && extra.sigBoxes, pdfref: extra && extra.pdfref, orig: extra && extra.orig });
  }

  // original JPEG/PNG bytes can go into the PDF untouched when the picture needs no turning
  function origImage(u8) {
    if (u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4E && u8[3] === 0x47) return { bytes: u8, png: true };
    if (u8[0] !== 0xFF || u8[1] !== 0xD8) return null;
    var i = 2, orient = 1, comps = 0;
    while (i + 4 < u8.length) {
      if (u8[i] !== 0xFF) { i++; continue; }
      var m = u8[i + 1], len = (u8[i + 2] << 8) | u8[i + 3];
      if (m === 0xD9 || m === 0xDA) break;
      if (m === 0xE1 && u8[i + 4] === 0x45 && u8[i + 5] === 0x78 && u8[i + 6] === 0x69 && u8[i + 7] === 0x66) {   // EXIF orientation
        var t = i + 10, le = u8[t] === 0x49, rd = function (o, n) { return n === 2 ? (le ? u8[t + o] | (u8[t + o + 1] << 8) : (u8[t + o] << 8) | u8[t + o + 1]) : (le ? (u8[t + o] | (u8[t + o + 1] << 8) | (u8[t + o + 2] << 16) | (u8[t + o + 3] << 24)) : ((u8[t + o] << 24) | (u8[t + o + 1] << 16) | (u8[t + o + 2] << 8) | u8[t + o + 3])) >>> 0; };
        try { var ifd = rd(4, 4), n = rd(ifd, 2); for (var e = 0; e < n; e++) { var q = ifd + 2 + e * 12; if (rd(q, 2) === 0x0112) orient = rd(q + 8, 2); } } catch (er) {}
      }
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) comps = u8[i + 9];
      i += 2 + len;
    }
    return orient === 1 && (comps === 1 || comps === 3) ? { bytes: u8, png: false } : null;
  }
  async function addImageFile(file) {
    var raw = null; try { raw = origImage(new Uint8Array(await file.arrayBuffer())); } catch (e) {}
    var url = URL.createObjectURL(file), img = await loadImg(url);
    var MAX = window.SPMaxSide || 4800, k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
    var c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    await addCanvasSource(c, file.name, { orig: raw });
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
      var want = Math.max(300, (window.SPPaper && SPPaper.dpi()) || 300) / 72, scale = Math.min(want, (window.SPMaxSide || 4800) / Math.max(v1.width, v1.height), 8.4);
      var vp = page.getViewport({ scale: scale });
      var c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: x, viewport: vp }).promise;
      var painted = 0;
      var sigBoxes = null;
      if (sig && sig.status === 'valid') {
        try {
          painted = await SPSig.paint(x, page, vp, sig);
          if (painted && SPSig.sigWidgets) sigBoxes = (await SPSig.sigWidgets(page, sig)).map(function (w) {
            var r = vp.convertToViewportRectangle(w.rect), X = Math.min(r[0], r[2]), Y = Math.min(r[1], r[3]);
            return { fx: X / c.width, fy: Y / c.height, fw: Math.abs(r[2] - r[0]) / c.width, fh: Math.abs(r[3] - r[1]) / c.height, s: w.s };
          });
        } catch (e) {}
      }
      await addCanvasSource(c, file.name.replace(/\.pdf$/i, '') + (n > 1 ? ' · p' + i : ''),
        { mmW: v1.width / 72 * MM, mmH: v1.height / 72 * MM, fileKey: fileKey, signed: painted > 0, sigBoxes: sigBoxes,
          pdfref: { bytes: data, doc: pdf, page: i, sig: sig, key: fileKey, pw: usedPw, rotate: page.rotate || 0, locked: !!(usedPw || (sig && sig.encrypted)) } });
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
    if (st.sources.length > before) st.adj = {};
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
  function openFullCrop(f) {
    var src = st.sources.find(function (x) { return x.id === f.id; }); if (!src) return;
    openCrop({ key: '__full', label: 'page', w: Math.round(src.mmW || 210), h: Math.round(src.mmH || 297), full: f }, src);
  }
  function openCrop(def, src) {
    if (!st.sources.length) { toast('Add a document first.'); return; }
    cropDef = def;
    var prev = st.slots[def.key];
    cropSrc = src || (prev && st.sources.find(function (x) { return x.id === prev.srcId; })) || defaultSourceFor(def);
    $('cp-crop-title').textContent = 'Crop: ' + def.label + ' (' + def.w + ' × ' + def.h + ' mm)';
    $('cp-lock').checked = def.full ? false : !(prev && prev.free);
    var bar = $('cp-srcbar'); bar.innerHTML = '';
    if (def.full) $('cp-crop-title').textContent = 'Crop the page — keep only the part you want to print';
    if (st.sources.length > 1 && !def.full) st.sources.forEach(function (s) {
      var b = document.createElement('button'); b.type = 'button'; b.title = s.name;
      b.innerHTML = '<img alt="">'; b.querySelector('img').src = s.thumb;
      b.setAttribute('aria-pressed', String(s === cropSrc));
      b.onclick = function () { cropSrc = s; [].forEach.call(bar.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); startCropper(null); };
      bar.appendChild(b);
    });
    $('cp-crop').hidden = false; document.documentElement.style.overflow = 'hidden';
    startCropper(def.full ? (def.full.crop || { x: 0, y: 0, width: cropSrc.w, height: cropSrc.h }) : (prev && prev.srcId === cropSrc.id ? prev.data : null));
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
    if (cropDef && cropDef.full) {
      var dd = cropper.getData(), fs = cropSrc, x0 = Math.max(0, dd.x), y0 = Math.max(0, dd.y);
      var x1 = Math.min(fs.w, dd.x + dd.width), y1 = Math.min(fs.h, dd.y + dd.height);
      var whole = x0 < 2 && y0 < 2 && x1 > fs.w - 2 && y1 > fs.h - 2;
      cropDef.full.crop = whole || x1 - x0 < 8 || y1 - y0 < 8 ? null : { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
      if (dd.rotate) toast('Turn the page with ↶ ↷ instead — the crop keeps it straight.');
      st.adj = {}; closeCrop(); renderFull(); update(); return;
    }
    var def = cropDef, W = px(def.w), H = px(def.h);
    var free = !$('cp-lock').checked;
    var src = cropper.getCroppedCanvas({ fillColor: '#fff', imageSmoothingEnabled: true, imageSmoothingQuality: 'high', maxWidth: 6000, maxHeight: 6000 });
    if (!src || !src.width) { toast('Could not crop. Try again.'); return; }
    var out = document.createElement('canvas'); out.width = W; out.height = H;
    var x = out.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    x.imageSmoothingQuality = 'high';
    if (free) { var k = Math.min(W / src.width, H / src.height), w = src.width * k, h = src.height * k; x.drawImage(src, (W - w) / 2, (H - h) / 2, w, h); }
    else x.drawImage(src, 0, 0, W, H);
    out.__crop = { srcId: cropSrc.id, data: cropper.getData(), free: free };
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
  function paperDims() {
    if ($('cp-paper').value === 'custom') return [num('cp-pw', 210, 30, 1200), num('cp-ph', 297, 30, 1200)];
    return PAPERS[$('cp-paper').value] || PAPERS.A4;
  }
  function paperFor(orientChoice, unit) {
    var p = paperDims(), W = p[0], H = p[1];
    if ($('cp-paper').value === 'PVC') return { W: 85.6, H: 54 };
    if (orientChoice === 'portrait') return { W: Math.min(W, H), H: Math.max(W, H) };
    if (orientChoice === 'landscape') return { W: Math.max(W, H), H: Math.min(W, H) };
    return null; // auto → decided by caller
  }
  function grid(W, H, m, g, uw, uh) {
    var cols = Math.floor((W - 2 * m + g) / (uw + g)), rows = Math.floor((H - 2 * m + g) / (uh + g));
    return { cols: Math.max(0, cols), rows: Math.max(0, rows), n: Math.max(0, cols) * Math.max(0, rows) };
  }

  // moves and resizes made in the preview (keyed by page:item)
  function scaleUnit(u, k) {
    var o = Object.assign({}, u, { w: u.w * k, h: u.h * k, parts: u.parts.map(function (p) { return Object.assign({}, p, { x: p.x * k, y: p.y * k, w: p.w * k, h: p.h * k }); }) });
    if (u.fold != null) o.fold = u.fold * k;
    return o;
  }
  function buildPages() {
    var pages = buildPages0();
    pages.forEach(function (pg, pi) {
      pg.items.forEach(function (it, ii) {
        it._key = pi + ':' + ii;
        var a = st.adj[it._key]; if (!a) return;
        if (it.full) {
          var cx = it.x + it.w / 2 + a.dx, cy = it.y + it.h / 2 + a.dy;
          it.w *= a.k; it.h *= a.k; it.x = cx - it.w / 2; it.y = cy - it.h / 2;
        } else {
          var w0 = it.unit.w, h0 = it.unit.h;
          if (a.k !== 1) it.unit = scaleUnit(it.unit, a.k);
          it.x += a.dx + (w0 - it.unit.w) / 2; it.y += a.dy + (h0 - it.unit.h) / 2;
        }
      });
    });
    return pages;
  }
  function buildPages0() {
    st.warn = '';
    var pages = [], copies = Math.round(num('cp-copies', 1, 1, 60));
    var isPVC = $('cp-paper').value === 'PVC';
    var m = isPVC ? 0 : num('cp-margin', 8, 0, 40), g = num('cp-gap', 4, 0, 30), pos = $('cp-pos').value;
    var orient = $('cp-orient').value;

    if (st.size === 'full') {
      var items = st.full.filter(function (f) { return f.on; }).map(function (f) {
        var s = st.sources.find(function (x) { return x.id === f.id; }); return s && { src: s, rot: f.rot, crop: f.crop || null };
      }).filter(Boolean);
      if (!items.length) return [];
      var p0 = paperDims(), sameAsDoc = $('cp-paper').value === 'orig';
      items.forEach(function (it) {
        var cr = it.crop, rw = cr ? cr.width : it.src.w, rh = cr ? cr.height : it.src.h;
        var fmW = it.src.mmW && it.src.mmW * rw / it.src.w, fmH = it.src.mmH && it.src.mmH * rh / it.src.h;   // real size of the part kept
        var turned = it.rot % 180 !== 0, iw = turned ? rh : rw, ih = turned ? rw : rh;
        var land = orient === 'landscape' || (orient === 'auto' && iw > ih);
        var W = land ? Math.max(p0[0], p0[1]) : Math.min(p0[0], p0[1]), H = land ? Math.min(p0[0], p0[1]) : Math.max(p0[0], p0[1]);
        if (isPVC) { W = 85.6; H = 54; }
        var omw = turned ? fmH : fmW, omh = turned ? fmW : fmH;
        var pmw = turned ? it.src.mmH : it.src.mmW, pmh = turned ? it.src.mmW : it.src.mmH;
        if (sameAsDoc && pmw && pmh) { W = pmw; H = pmh; }      // paper = the document's own (uncropped) size, nothing shrunk
        var fit = ($('cp-fit') && $('cp-fit').value) || 'actual', sc = num('cp-scale', 100, 5, 400) / 100;
        var mm0 = sameAsDoc && omw ? 0 : m;
        var aw = W - 2 * mm0, ah = H - 2 * mm0, k = Math.min(aw / iw, ah / ih), w = iw * k, h = ih * k, y = pos === 'top' ? mm0 : (H - h) / 2;
        var mw = omw, mh = omh;
        if (fit === 'actual' && !isPVC && mw && mw <= W + 0.5 && mh <= H + 0.5) { w = mw; h = mh; y = (H - h) / 2; }   // real size (100%)
        else if (fit === 'fill') { var kc = Math.max(W / iw, H / ih); w = iw * kc; h = ih * kc; y = (H - h) / 2; }       // edge to edge, no white border
        else if (fit === 'stretch') { w = W; h = H; y = 0; }                                                             // exactly the paper
        if (sc !== 1) { var cy = y + h / 2; w *= sc; h *= sc; y = pos === 'top' && fit === 'fit' ? m : cy - h / 2; }
        for (var c = 0; c < copies; c++) pages.push({ W: W, H: H, items: [{ full: it, x: (W - w) / 2, y: y, w: w, h: h }] });
      });
      return pages;
    }

    var cur = currentSet(g);
    if (cur && cur.warn) st.warn = cur.warn;
    var sets = st.queue.slice();
    if (cur && cur.unit) sets.push({ unit: cur.unit, copies: copies, duplex: cur.duplex });
    if (!sets.length) return [];
    var list = [];
    sets.forEach(function (st2) { for (var i = 0; i < st2.copies; i++) list.push(st2.unit); });
    var duplex = sets.some(function (x) { return x.duplex; });
    var maxPP = Math.round(num('cp-maxpp', 0, 0, 200));

    // shelf packing: cards of different sizes fill rows, rows fill the page
    function pack(W, H, units) {
      var pagesOut = [], i = 0;
      while (i < units.length) {
        var rows = [], row = [], rowW = 0, rowH = 0, usedH = 0, count = 0;
        while (i < units.length) {
          var u = units[i];
          if (u.w > W - 2 * m + 0.01 || u.h > H - 2 * m + 0.01) return null;          // never fits
          if (maxPP && count >= maxPP) break;
          var needW = row.length ? rowW + g + u.w : u.w;
          if (needW > W - 2 * m + 0.01) {                                              // next row
            rows.push({ items: row, w: rowW, h: rowH }); usedH += (rows.length > 1 ? g : 0) + rowH;
            row = []; rowW = 0; rowH = 0; continue;
          }
          var hNeeded = usedH + (rows.length ? g : 0) + Math.max(rowH, u.h);
          if (hNeeded > H - 2 * m + 0.01) break;                                       // page full
          row.push(u); rowW = needW; rowH = Math.max(rowH, u.h); i++; count++;
        }
        if (row.length) { rows.push({ items: row, w: rowW, h: rowH }); }
        if (!rows.length) return null;
        pagesOut.push(rows);
      }
      return pagesOut;
    }
    function layout(W, H, rowsList, mirror) {
      var totalH = rowsList.reduce(function (a, r, k) { return a + r.h + (k ? g : 0); }, 0);
      var y = pos === 'top' ? m : (H - totalH) / 2, items = [];
      if (isPVC) y = (H - totalH) / 2;
      rowsList.forEach(function (r) {
        var x = (W - r.w) / 2;
        r.items.forEach(function (u) {
          var xx = mirror ? W - x - u.w : x;
          items.push({ unit: u, x: xx, y: y + (r.h - u.h) / 2, back: !!mirror });
          x += u.w + g;
        });
        y += r.h + g;
      });
      return { W: W, H: H, items: items };
    }
    var W, H, packed;
    if (isPVC) {
      W = 85.6; H = 54;
      if (list.some(function (u) { return u.w > W + 0.01 || u.h > H + 0.01; })) { st.warn = 'This size does not fit on a PVC card. Choose A4 paper.'; return []; }
      packed = list.map(function (u) { return [{ items: [u], w: u.w, h: u.h }]; });
    } else {
      var fixed = paperFor(orient);
      if (fixed) { W = fixed.W; H = fixed.H; packed = pack(W, H, list); }
      else {
        var p = paperDims(), Pw = Math.min(p[0], p[1]), Ph = Math.max(p[0], p[1]);
        var pp = pack(Pw, Ph, list), pl = pack(Ph, Pw, list);
        var cnt = function (x) { return x ? x.length : 1e9; };
        var first = function (x) { return x && x[0] ? x[0].reduce(function (a, r) { return a + r.items.length; }, 0) : 0; };
        if (cnt(pl) < cnt(pp) || (cnt(pl) === cnt(pp) && first(pl) > first(pp))) { W = Ph; H = Pw; packed = pl; } else { W = Pw; H = Ph; packed = pp; }
      }
      if (!packed) { st.warn = 'This size is too big for the paper. Try Landscape, a bigger paper or a smaller margin.'; return []; }
    }
    packed.forEach(function (rowsList) {
      pages.push(layout(W, H, rowsList, false));
      if (duplex && rowsList.some(function (r) { return r.items.some(function (u) { return u.back; }); })) pages.push(layout(W, H, rowsList, true));
    });
    var per = packed.length ? packed[0].reduce(function (a, r) { return a + r.items.length; }, 0) : 0;
    st.layoutInfo = { perPage: per, W: W, H: H, duplex: duplex, sets: sets.length };
    return pages;
  }

  // the card(s) being cropped right now, as one printable unit
  function currentSet(g) {
    var defs = slotDefs(), S = st.slots;
    var ready = defs.every(function (d) { return S[d.key] && S[d.key].canvas && Math.abs(S[d.key].w - d.w) < 0.01; });
    var front = defs[0] && S[defs[0].key] && S[defs[0].key].canvas && S[defs[0].key].w === defs[0].w ? S[defs[0].key] : null;
    if (!front) return null;
    var out = { warn: ready ? '' : 'Crop all sides to finish. Showing what is ready.', ready: ready, duplex: false };
    var mirror = $('cp-mirror') && $('cp-mirror').checked, rnd = $('cp-round').checked;
    if (st.size === 'long') {
      var sep = $('cp-longsep').checked, fold = $('cp-fold').checked;
      var u = { kind: 'long', w: LONG.w, h: LONG.h, parts: [], fold: fold ? LONG.w / 2 : null, mirror: mirror, round: rnd };
      if (sep) { u.parts.push({ c: S.lfront && S.lfront.canvas, x: 0, y: 0, w: PVC.w, h: PVC.h }); if (S.lback && S.lback.canvas) u.parts.push({ c: S.lback.canvas, x: PVC.w, y: 0, w: PVC.w, h: PVC.h }); }
      else u.parts.push({ c: S.strip.canvas, x: 0, y: 0, w: LONG.w, h: LONG.h });
      out.unit = u; return out;
    }
    var cs = cardSize(), cw = cs.w, ch = cs.h;
    var back = $('cp-back').checked && S.back && S.back.canvas && S.back.w === cw ? S.back.canvas : null;
    var arr = $('cp-arrange').value;
    if (back && $('cp-paper').value === 'PVC') arr = 'duplex';
    var base = { kind: 'card', mirror: mirror, round: rnd };
    if (!back) out.unit = Object.assign({ w: cw, h: ch, parts: [{ c: front.canvas, x: 0, y: 0, w: cw, h: ch }] }, base);
    else if (arr === 'side') out.unit = Object.assign({ w: 2 * cw + g, h: ch, parts: [{ c: front.canvas, x: 0, y: 0, w: cw, h: ch }, { c: back, x: cw + g, y: 0, w: cw, h: ch }] }, base);
    else if (arr === 'stack') out.unit = Object.assign({ w: cw, h: 2 * ch + g, parts: [{ c: front.canvas, x: 0, y: 0, w: cw, h: ch }, { c: back, x: 0, y: ch + g, w: cw, h: ch }] }, base);
    else { out.duplex = true; out.unit = Object.assign({ w: cw, h: ch, parts: [{ c: front.canvas, x: 0, y: 0, w: cw, h: ch }], back: back }, base); }
    return out;
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
    var cut = $('cp-cut').checked;
    var R = 3.18 * k;
    page.items.forEach(function (it) {
      if (it.full) {
        var s = it.full.src, rot = it.full.rot, img = s._img;
        if (!img) return;
        var X = it.x * k, Y = it.y * k, w = it.w * k, h = it.h * k;
        x.save(); x.translate(X + w / 2, Y + h / 2); x.rotate(rot * Math.PI / 180);
        var dw = rot % 180 ? h : w, dh = rot % 180 ? w : h;
        var cr = it.full.crop, SW = img.naturalWidth || img.width, SH = img.naturalHeight || img.height;
        var rg = cr ? { x: cr.x / s.w * SW, y: cr.y / s.h * SH, w: cr.width / s.w * SW, h: cr.height / s.h * SH } : { x: 0, y: 0, w: SW, h: SH };
        if (cr) { x.beginPath(); x.rect(-dw / 2, -dh / 2, dw, dh); x.clip(); }
        var kx = dw / rg.w, ky = dh / rg.h, ax = -dw / 2 - rg.x * kx, ay = -dh / 2 - rg.y * ky;   // whole picture placed so the region fills dw × dh
        x.drawImage(adjusted(img), ax, ay, SW * kx, SH * ky);
        // signature box again with the live date and time of this print
        if (s.sigBoxes && window.SPSig && SPSig.paintBox) s.sigBoxes.forEach(function (b) { try { SPSig.paintBox(x, ax + b.fx * SW * kx, ay + b.fy * SH * ky, b.fw * SW * kx, b.fh * SH * ky, b.s, new Date()); } catch (e) {} });
        x.restore();
        return;
      }
      var u = it.unit, ox = it.x * k, oy = it.y * k, isLong = u.kind === 'long', round = !!u.round;
      var parts = it.back ? [{ c: u.back, x: 0, y: 0, w: u.w, h: u.h }] : u.parts;
      var put = function (img, X, Y, w, h) {
        if (!u.mirror) { x.drawImage(adjusted(img), X, Y, w, h); return; }
        x.save(); x.translate(X + w, Y); x.scale(-1, 1); x.drawImage(adjusted(img), 0, 0, w, h); x.restore();
      };
      if (isLong && round) { x.save(); rr(x, ox, oy, u.w * k, u.h * k, R); x.clip(); }
      parts.forEach(function (p) {
        if (!p.c) return;
        var X = ox + (u.mirror ? (u.w - p.x - p.w) : p.x) * k, Y = oy + p.y * k, w = p.w * k, h = p.h * k;
        if (round && !isLong) { x.save(); rr(x, X, Y, w, h, R); x.clip(); put(p.c, X, Y, w, h); x.restore(); }
        else put(p.c, X, Y, w, h);
        if (cut && !isLong) { x.lineWidth = Math.max(1, 0.2 * k); x.strokeStyle = '#8C96A3'; if (round) { rr(x, X, Y, w, h, R); x.stroke(); } else x.strokeRect(X, Y, w, h); }
      });
      if (isLong && round) x.restore();
      if (isLong) {
        var W2 = u.w * k, H2 = u.h * k;
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
    try { renderQueue(); } catch (e) {}
    if (st.size === 'full') await ensureFullImages();
    st.pages = buildPages();
    if (st.page >= st.pages.length) st.page = Math.max(0, st.pages.length - 1);
    var has = st.pages.length > 0;
    ['cp-print', 'cp-pdf', 'cp-jpg', 'cp-edit'].forEach(function (id) { if ($(id)) $(id).disabled = !has; });
    $('cp-empty').hidden = has; $('cp-canvas').style.visibility = has ? 'visible' : 'hidden';
    $('cp-pager').hidden = st.pages.length < 2;
    $('cp-pageno').textContent = (st.page + 1) + ' / ' + st.pages.length;
    var info = $('cp-info');
    if (has) {
      var pg = st.pages[st.page];
      renderView(false);
      var pn = $('cp-paper').value === 'custom' ? 'Custom ' + Math.round(pg.W) + ' × ' + Math.round(pg.H) + ' mm' : $('cp-paper').options[$('cp-paper').selectedIndex].text.split(' (')[0];
      var t = pn + ' · ' + (pg.W > pg.H ? 'landscape' : 'portrait') + ' · ' + st.pages.length + (st.pages.length > 1 ? ' pages' : ' page');
      if (st.size !== 'full' && st.layoutInfo) t += (st.layoutInfo.sets > 1 ? ' · ' + st.layoutInfo.sets + ' different cards' : '') + ' · ' + st.layoutInfo.perPage + ' on page 1' + (st.layoutInfo.duplex ? ' · back pages follow each front page' : '');
      info.textContent = st.warn ? st.warn : t; info.className = 'cp-info' + (st.warn ? ' warn' : '');
    } else {
      info.textContent = st.warn || ''; info.className = 'cp-info' + (st.warn ? ' warn' : '');
      renderView(false);
    }
  }

  // ---------- big, sharp preview: zoom, pan, drag and resize on the paper ----------
  // The preview is drawn at the screen's real pixel density (and redrawn sharper when you zoom),
  // so what you see is what prints. Drag a document/card to move it, pull its corner to resize,
  // pinch / Ctrl+wheel / + − to zoom, double-tap to zoom in or back to fit.
  var V = { locked: true, z: 1, px: 0, py: 0, sel: null, fitK: 1, pad: 14, rT: 0, raf: 0 };
  var ICO = {
    minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11h6M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11h6M11 8v6M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    fit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    crop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2v16h16M2 6h16v16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.6" fill="url(#spIcoG)"/><path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9" fill="none" stroke="url(#spIcoG)" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="15.6" r="1.7" fill="#fff"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.6" fill="url(#spIcoG)"/><path d="M8 10.5V7.6a4 4 0 0 1 7.7-1.5" fill="none" stroke="url(#spIcoG)" stroke-width="2.2" stroke-linecap="round"/><path d="M10 15.8l1.6 1.6 3-3.2" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    center: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="7" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  function setupViewer() {
    var cv = $('cp-canvas'); if (!cv || $('cp-stage')) return;
    var wrap = cv.parentNode; wrap.classList.add('cp-view');
    var stage = document.createElement('div'); stage.id = 'cp-stage'; stage.className = 'cp-vstage';
    wrap.insertBefore(stage, cv); stage.appendChild(cv);
    var sel = document.createElement('div'); sel.id = 'cp-sel'; sel.className = 'cp-sel'; sel.hidden = true;
    sel.innerHTML = '<span class="cp-sel-tag"></span><i class="cp-h cp-h-nw" data-h="1"></i><i class="cp-h cp-h-ne" data-h="1"></i><i class="cp-h cp-h-sw" data-h="1"></i><i class="cp-h cp-h-se" data-h="1"></i>';
    stage.appendChild(sel);
    var bar = document.createElement('div'); bar.className = 'cp-vbar'; bar.id = 'cp-vbar';
    bar.innerHTML = '<div class="cp-vzoom"><button type="button" id="cp-zout" title="Zoom out" aria-label="Zoom out">' + ICO.minus + '</button>' +
      '<button type="button" id="cp-zlbl" class="cp-zlbl" title="Fit to screen">100%</button>' +
      '<button type="button" id="cp-zin" title="Zoom in" aria-label="Zoom in">' + ICO.plus + '</button>' +
      '<button type="button" id="cp-zfit" title="Fit to screen" aria-label="Fit to screen">' + ICO.fit + '</button></div>' +
      '<div class="cp-vtools"><button type="button" id="cp-vlock" class="cp-vlock" aria-pressed="true" title="Locked — the page scrolls normally. Tap to unlock and move / resize on the paper">' + ICO.lock + '<span>Locked</span></button><button type="button" id="cp-vcenter" title="Put the selected item in the middle of the page" hidden>' + ICO.center + '<span>Centre</span></button>' +
      '<button type="button" id="cp-vcrop" title="Crop the page" hidden>' + ICO.crop + '<span>Crop</span></button>' +
      '<button type="button" id="cp-vreset" title="Undo all moves and resizes" hidden>' + ICO.reset + '<span>Reset</span></button></div>';
    wrap.parentNode.insertBefore(bar, wrap);
    var hint = document.createElement('p'); hint.className = 'cp-vhint'; hint.id = 'cp-vhint';
    var setHint = function () { hint.textContent = V.locked ? 'Locked: scroll freely · pinch or + / − to zoom · tap Locked to move or resize on the paper' : 'Unlocked: drag to move · pull a corner to resize · pinch or + / − to zoom · tap again to lock'; };
    setHint();
    var setLock = function (on) {
      V.locked = on; wrap.classList.toggle('cp-locked', on);
      var b = $('cp-vlock'); b.setAttribute('aria-pressed', String(on)); b.classList.toggle('is-open', !on);
      b.innerHTML = (on ? ICO.lock : ICO.unlock) + '<span>' + (on ? 'Locked' : 'Unlocked') + '</span>';
      if (on) V.sel = null; placeSel(); setHint();
    };
    wrap.parentNode.insertBefore(hint, wrap.nextSibling);

    $('cp-vlock').onclick = function () { setLock(!V.locked); };
    wrap.classList.add('cp-locked');
    $('cp-zin').onclick = function () { zoomAt(V.z * 1.5); };
    $('cp-zout').onclick = function () { zoomAt(V.z / 1.5); };
    $('cp-zfit').onclick = $('cp-zlbl').onclick = function () { V.z = 1; V.px = V.py = 0; renderView(false); };
    $('cp-vreset').onclick = function () { st.adj = {}; V.sel = null; refreshPages(false); toast('Back to the automatic layout.'); };
    $('cp-vcenter').onclick = function () {
      var it = selItem(); if (!it) return; var pg = st.pages[st.page], a = adjOf(it._key), d = itemBox(it);
      a.dx += (pg.W - d.w) / 2 - d.x; a.dy += (pg.H - d.h) / 2 - d.y; refreshPages(false);
    };
    $('cp-vcrop').onclick = function () {
      var it = selItem() || (st.pages[st.page] && st.pages[st.page].items[0]);
      if (it && it.full) { var f = st.full.find(function (x) { return x.id === it.full.src.id; }); if (f) openFullCrop(f); }
    };

    // ---- gestures
    var ptrs = new Map(), g = null, lastTap = 0;
    var mmAt = function (cx, cy) { var r = stage.getBoundingClientRect(), pg = st.pages[st.page]; return { x: (cx - r.left) / r.width * pg.W, y: (cy - r.top) / r.height * pg.H }; };
    var two = function () { var a = Array.from(ptrs.values()); return { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1, x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 }; };
    wrap.addEventListener('pointerdown', function (e) {
      if (!st.pages.length || e.button > 0) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { wrap.setPointerCapture(e.pointerId); } catch (er) {}
      if (ptrs.size === 2) { var t = two(); g = { t: 'pinch', d0: t.d, z0: V.z }; e.preventDefault(); return; }
      if (ptrs.size > 2) return;
      var now = Date.now(), dbl = now - lastTap < 320; lastTap = now;
      if (V.locked) {      // locked: never move anything; the page scrolls, zoomed view pans
        if (dbl && e.pointerType !== 'mouse') { lastTap = 0; g = null; zoomAt(V.z > 1.05 ? 1 : 2.5, e.clientX, e.clientY); e.preventDefault(); return; }
        g = V.z > 1.001 ? { t: 'pan', x0: e.clientX, y0: e.clientY, px0: V.px, py0: V.py } : null;
        if (!g && hitTest(mmAt(e.clientX, e.clientY))) { if (e.pointerType === 'mouse') nudgeLock(); else g = { t: 'tap', x0: e.clientX, y0: e.clientY, t0: Date.now() }; }
        return;
      }
      if (e.target.dataset && e.target.dataset.h && selItem()) {
        var it0 = selItem(), b0 = itemBox(it0), r0 = stage.getBoundingClientRect(), k0 = r0.width / st.pages[st.page].W;
        var ccx = r0.left + (b0.x + b0.w / 2) * k0, ccy = r0.top + (b0.y + b0.h / 2) * k0;
        g = { t: 'resize', key: it0._key, cx: ccx, cy: ccy, d0: Math.hypot(e.clientX - ccx, e.clientY - ccy) || 1, k0: adjOf(it0._key).k, w0: b0.w, h0: b0.h };
        e.preventDefault(); return;
      }
      var p = mmAt(e.clientX, e.clientY), hit = hitTest(p);
      if (dbl && e.pointerType !== 'mouse') { lastTap = 0; g = null; zoomAt(V.z > 1.05 ? 1 : 2.5, e.clientX, e.clientY); e.preventDefault(); return; }
      if (hit) { V.sel = hit._key; g = { t: 'move', key: hit._key, last: p, moved: false }; placeSel(); e.preventDefault(); }
      else { V.sel = null; placeSel(); g = V.z > 1.001 ? { t: 'pan', x0: e.clientX, y0: e.clientY, px0: V.px, py0: V.py } : null; }
    });
    wrap.addEventListener('pointermove', function (e) {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!g) return;
      if (g.t === 'tap') { if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) > 8) g = null; return; }
      e.preventDefault();
      if (g.t === 'pinch' && ptrs.size >= 2) { var t = two(); zoomAt(g.z0 * t.d / g.d0, t.x, t.y, true); return; }
      if (g.t === 'pan') { V.px = g.px0 + e.clientX - g.x0; V.py = g.py0 + e.clientY - g.y0; layoutStage(); return; }
      if (g.t === 'move') {
        var p = mmAt(e.clientX, e.clientY), a = adjOf(g.key);
        a.dx += p.x - g.last.x; a.dy += p.y - g.last.y; g.last = p; g.moved = true;
        refreshPages(true); return;
      }
      if (g.t === 'resize') {
        var a2 = adjOf(g.key), k = g.k0 * Math.hypot(e.clientX - g.cx, e.clientY - g.cy) / g.d0;
        a2.k = Math.max(0.1, Math.min(6, k)); refreshPages(true);
      }
    });
    var up = function (e) {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      if (ptrs.size === 0) { var was = g; g = null; if (was && was.t === 'tap') { if (Date.now() - was.t0 < 350) nudgeLock(); return; } if (was && was.t !== 'pan') renderView(false); }
      else if (g && g.t === 'pinch') g = null;
    };
    wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
    wrap.addEventListener('dblclick', function (e) { if (e.target.dataset && e.target.dataset.h) return; zoomAt(V.z > 1.05 ? 1 : 2.5, e.clientX, e.clientY); });
    wrap.addEventListener('wheel', function (e) {
      if (!st.pages.length) return;
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoomAt(V.z * Math.exp(-e.deltaY * 0.0022), e.clientX, e.clientY, true); clearTimeout(V.rT); V.rT = setTimeout(function () { renderView(false); }, 160); }
      else if (V.z > 1.001) { e.preventDefault(); V.px -= e.deltaX; V.py -= e.deltaY; layoutStage(); }
    }, { passive: false });
    document.addEventListener('keydown', function (e) {
      var it = selItem(); if (!it || /INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) return;
      var dx = { ArrowLeft: -1, ArrowRight: 1 }[e.key] || 0, dy = { ArrowUp: -1, ArrowDown: 1 }[e.key] || 0;
      if (!dx && !dy) return;
      e.preventDefault(); var a = adjOf(it._key), step = e.shiftKey ? 5 : 0.5; a.dx += dx * step; a.dy += dy * step; refreshPages(false);
    });
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { renderView(false); }, 150); });
  }
  var nudged = 0;
  function nudgeLock() {
    var b = $('cp-vlock'); if (!b || Date.now() - nudged < 4000) return; nudged = Date.now();
    b.classList.remove('cp-nudge'); void b.offsetWidth; b.classList.add('cp-nudge');
  }
  function adjOf(key) { return st.adj[key] || (st.adj[key] = { dx: 0, dy: 0, k: 1 }); }
  function itemBox(it) { return it.full ? { x: it.x, y: it.y, w: it.w, h: it.h } : { x: it.x, y: it.y, w: it.unit.w, h: it.unit.h }; }
  function selItem() {
    var pg = st.pages[st.page]; if (!pg || !V.sel) return null;
    return pg.items.find(function (it) { return it._key === V.sel; }) || null;
  }
  function hitTest(p) {
    var pg = st.pages[st.page]; if (!pg) return null;
    for (var i = pg.items.length - 1; i >= 0; i--) { var b = itemBox(pg.items[i]); if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) return pg.items[i]; }
    return null;
  }
  // rebuild the layout after a move/resize; quick while the finger moves, sharp when it lifts
  function refreshPages(fast) {
    st.pages = buildPages();
    if (st.page >= st.pages.length) st.page = Math.max(0, st.pages.length - 1);
    if (!fast) { renderView(false); return; }
    if (V.raf) return;
    V.raf = requestAnimationFrame(function () { V.raf = 0; renderView(true); });
  }
  function viewSize() {
    var wrap = $('cp-canvas').closest('.cp-view'), pg = st.pages[st.page];
    V.pad = innerWidth < 600 ? 10 : 16;
    var aw = Math.max(120, wrap.clientWidth - 2 * V.pad), ah = Math.max(240, Math.min(innerHeight * (innerWidth < 900 ? 0.74 : 0.8), 1400) - 2 * V.pad);
    V.fitK = Math.min(aw / pg.W, ah / pg.H);
    return { wrap: wrap, aw: aw, fh: pg.H * V.fitK, sw: pg.W * V.fitK * V.z, sh: pg.H * V.fitK * V.z };
  }
  function topOff(m) { return Math.max(V.pad, (m.wrap.clientHeight - m.fh) / 2); }   // short pages sit in the middle
  function layoutStage() {
    var pg = st.pages[st.page], stage = $('cp-stage'); if (!pg || !stage) return;
    var m = viewSize(), W = m.wrap.clientWidth;
    m.wrap.style.height = Math.round(m.fh + 2 * V.pad) + 'px';
    var mx = Math.max(0, (m.sw - m.aw) / 2 + 24), my = Math.max(0, (m.sh - m.fh) / 2 + 24);
    V.px = Math.max(-mx, Math.min(mx, V.px)); V.py = Math.max(-my, Math.min(my, V.py));
    if (V.z <= 1.001) { V.px = 0; V.py = 0; }
    stage.style.width = m.sw + 'px'; stage.style.height = m.sh + 'px';
    stage.style.left = ((W - m.sw) / 2 + V.px) + 'px'; stage.style.top = (topOff(m) + (m.fh - m.sh) / 2 + V.py) + 'px';
    m.wrap.classList.toggle('cp-zoomed', V.z > 1.001);
    if ($('cp-zlbl')) $('cp-zlbl').textContent = Math.round(V.z * 100) + '%';
    placeSel();
  }
  function zoomAt(z, cx, cy, fast) {
    var stage = $('cp-stage'); if (!stage || !st.pages.length) return;
    z = Math.max(1, Math.min(8, z));
    var r = stage.getBoundingClientRect(), wr = stage.parentNode.getBoundingClientRect();
    if (cx == null) { cx = wr.left + wr.width / 2; cy = wr.top + wr.height / 2; }
    var fx = (cx - r.left) / r.width, fy = (cy - r.top) / r.height;
    V.z = z;
    var m = viewSize(), W = m.wrap.clientWidth;
    V.px = (cx - wr.left - fx * m.sw) - (W - m.sw) / 2;
    V.py = (cy - wr.top - fy * m.sh) - (topOff(m) + (m.fh - m.sh) / 2);
    if (fast) { layoutStage(); clearTimeout(V.rT); V.rT = setTimeout(function () { renderView(false); }, 180); }
    else renderView(false);
  }
  function placeSel() {
    var sel = $('cp-sel'); if (!sel) return;
    var it = selItem(), pg = st.pages[st.page];
    var anyAdj = Object.keys(st.adj).some(function (k) { var a = st.adj[k]; return a.dx || a.dy || a.k !== 1; });
    if ($('cp-vreset')) $('cp-vreset').hidden = !anyAdj;
    if ($('cp-vcenter')) $('cp-vcenter').hidden = !it;
    if ($('cp-vcrop')) $('cp-vcrop').hidden = !(st.size === 'full' && pg && pg.items.some(function (x) { return x.full; }));
    if (!it || V.locked) { sel.hidden = true; return; }
    var b = itemBox(it), k = parseFloat($('cp-stage').style.width) / pg.W;
    sel.hidden = false;
    sel.style.left = b.x * k + 'px'; sel.style.top = b.y * k + 'px'; sel.style.width = b.w * k + 'px'; sel.style.height = b.h * k + 'px';
    sel.querySelector('.cp-sel-tag').textContent = (Math.round(b.w * 10) / 10) + ' × ' + (Math.round(b.h * 10) / 10) + ' mm';
  }
  function renderView(fast) {
    var cv = $('cp-canvas'), stage = $('cp-stage'); if (!cv || !stage) return;
    var pg = st.pages[st.page];
    if (!pg) { stage.style.width = stage.style.height = '0px'; var w0 = cv.closest('.cp-view'); if (w0) w0.style.height = ''; return; }
    layoutStage();
    var m = viewSize(), dpr = window.devicePixelRatio || 1;
    var scale = fast ? Math.min(1, dpr) : dpr;
    scale = Math.min(scale, 6000 / Math.max(m.sw, m.sh), Math.sqrt(24e6 / (m.sw * m.sh)));    // stay inside phone canvas limits
    var dpi = m.sw * scale / (pg.W / MM), c;
    try { c = drawPage(pg, dpi); } catch (e) { c = drawPage(pg, 96); }
    if (cv.width !== c.width || cv.height !== c.height) { cv.width = c.width; cv.height = c.height; }
    var x = cv.getContext('2d'); x.drawImage(c, 0, 0); c.width = c.height = 1;
    placeSel();
  }


  // ---------- free layout editor (drag, pinch, resize on the paper) ----------
  function openLayoutEditor() {
    if (!window.SPSheet) { toast('Layout editor did not load.'); return; }
    var pages = buildPages(); if (!pages.length) { toast('Nothing to arrange yet.'); return; }
    var ov = document.createElement('div'); ov.className = 'sh-overlay';
    var host = document.createElement('div'); ov.appendChild(host); document.body.appendChild(ov);
    document.documentElement.style.overflow = 'hidden';
    var P = pages[0], pv = $('cp-paper').value, map = { A4: 'A4', A3: 'A3', A5: 'A5', Letter: 'Letter', Legal: 'Legal', '4x6': '4x6', '5x7': '5x7' };
    var ed = new SPSheet.Editor(host, {
      title: 'Edit layout', template: null, cut: false, margin: num('cp-margin', 8, 0, 40), gap: num('cp-gap', 4, 0, 30),
      paper: map[pv] || 'custom', custom: [Math.min(P.W, P.H), Math.max(P.W, P.H)], orient: P.W > P.H ? 'landscape' : 'portrait',
      onClose: function () { ov.remove(); document.documentElement.style.overflow = ''; }
    });
    pages.forEach(function (pg, pi) {
      pg.items.forEach(function (it) {
        var w = it.full ? it.w : it.unit.w, h = it.full ? it.h : it.unit.h;
        var one = it.full ? { W: w, H: h, items: [{ full: it.full, x: 0, y: 0, w: w, h: h }] } : { W: w, H: h, items: [{ unit: it.unit, x: 0, y: 0, back: it.back }] };
        ed.addCanvas(drawPage(one, DPI), { place: { page: pi, x: it.x, y: it.y, w: w, h: h }, real: [w, h] });
      });
    });
    ed.fit();
  }

  // ---------- output ----------
  async function renderAll() {
    if (st.size === 'full') await ensureFullImages();
    var pages = buildPages(), out = [];
    for (var i = 0; i < pages.length; i++) {
      busy(true, 'Preparing page ' + (i + 1) + ' of ' + pages.length + '…');
      await new Promise(function (r) { setTimeout(r, 0); });
      var dpi = (window.SPPaper && SPPaper.dpi()) || parseInt(($('cp-dpi') || {}).value, 10) || DPI, c;
      try { c = drawPage(pages[i], dpi); if (!c.width) throw 0; } catch (e) { c = drawPage(pages[i], 300); }
      if (window.SPPaper) SPPaper.tune(c);
      out.push({ W: pages[i].W, H: pages[i].H, url: c.toDataURL('image/jpeg', 0.98) });
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

  // ---------- original-quality PDF ----------
  // The PDF button never turns the document into a picture: PDF pages (also password-protected
  // e-Aadhaar, opened with qpdf) are placed as the original vector page with its own images,
  // fonts and colours; photos go in as the original JPEG/PNG file. Crops, rounded corners,
  // mirroring and rotation are done with PDF clipping and transforms, so nothing is re-encoded.
  function origMode() {
    return (!window.SPPaper || SPPaper.get().paper === 'exact') && !($('cp-bw') && $('cp-bw').checked) && !num('cp-bright', 0) && !num('cp-contrast', 0);
  }
  var ASSETS = (function () { var sc = document.querySelector('script[src*="cardprint/cardprint.js"]'); return sc ? sc.src.replace(/cardprint\/cardprint\.js.*$/, '') : '../assets/'; })();
  var qpdfP = null, decSeq = 0, plainPdf = {};
  function loadQpdf() {
    if (qpdfP) return qpdfP;
    qpdfP = new Promise(function (res, rej) {
      var go = function () { window.SPQpdfFactory({ locateFile: function () { return ASSETS + 'vendor/qpdf/qpdf.wasm'; } }).then(res, rej); };
      if (window.SPQpdfFactory) { go(); return; }
      var sc = document.createElement('script'); sc.src = ASSETS + 'vendor/qpdf/qpdf.js?v=1'; sc.onload = go; sc.onerror = rej; document.head.appendChild(sc);
    });
    qpdfP.catch(function () { qpdfP = null; });
    return qpdfP;
  }
  async function decryptPdf(bytes, pw) {
    var q = await loadQpdf(), n = ++decSeq, a = '/in' + n + '.pdf', b = '/out' + n + '.pdf', out = null;
    q.FS.writeFile(a, bytes);
    try { q.callMain(['--password=' + (pw || ''), '--decrypt', a, b]); } catch (e) {}
    try { out = q.FS.readFile(b); } catch (e) {}
    try { q.FS.unlink(a); } catch (e) {} try { q.FS.unlink(b); } catch (e) {}
    if (!out || !out.length) throw new Error('could not unlock the PDF');
    return out;
  }
  async function urlBytes(u) { return new Uint8Array(await (await fetch(u)).arrayBuffer()); }
  function canvasPng(c) { return new Promise(function (res) { c.toBlob(function (b) { b.arrayBuffer().then(function (x) { res(new Uint8Array(x)); }); }, 'image/png'); }); }

  async function vectorPdf() {
    var PL = window.PDFLib; if (!PL || !origMode()) return null;
    var pages = buildPages(); if (!pages.length) return null;
    var O = PL, PT = 72 / MM, out = await PL.PDFDocument.create(), docs = {}, bySrc = new Map(), byCanvas = new Map(), names = {}, now = new Date(), helv = null;
    var cm = function (a, b, c, d, e, f) { return O.concatTransformationMatrix(a, b, c, d, e, f); };
    var useObj = function (pg, obj) { var k = pg.ref.toString() + '|' + obj.ref.toString(); return names[k] || (names[k] = pg.node.newXObject('SPObj', obj.ref)); };

    // how to paint a source: XObject + matrix from its own space into the source picture's pixel space (y down)
    async function forSrc(src) {
      if (bySrc.has(src)) return bySrc.get(src);
      var r = null, ref = src.pdfref;
      if (ref && !ref.rotate) {
        try {
          var plain = plainPdf[ref.key] || (plainPdf[ref.key] = ref.locked ? await decryptPdf(ref.bytes, ref.pw) : ref.bytes.slice());
          var d = docs[ref.key] || (docs[ref.key] = await PL.PDFDocument.load(plain, { updateMetadata: false }));
          var sp = d.getPage(ref.page - 1);
          if (!sp.getRotation().angle) {
            var cb = sp.getCropBox();
            var e = await out.embedPage(sp, { left: cb.x, bottom: cb.y, right: cb.x + cb.width, top: cb.y + cb.height }, [1, 0, 0, 1, 0, 0]);
            var wl = [];
            if (src.signed && ref.sig && window.SPSig && SPSig.sigWidgets) { try { wl = await SPSig.sigWidgets(await ref.doc.getPage(ref.page), ref.sig); } catch (er) {} }
            var kx = src.w / cb.width, ky = src.h / cb.height;
            r = { obj: e, m: [kx, 0, 0, -ky, -cb.x * kx, (cb.y + cb.height) * ky], sig: wl, vector: true };
          }
        } catch (err) { try { console.warn('original page not used:', err); } catch (_) {} }
      }
      if (!r && src.orig) { try { var im = src.orig.png ? await out.embedPng(src.orig.bytes) : await out.embedJpg(src.orig.bytes); r = { obj: im, m: [src.w, 0, 0, -src.h, 0, src.h] }; } catch (err) {} }
      if (!r) { var b = await urlBytes(src.url), im2 = b[0] === 0x89 ? await out.embedPng(b) : await out.embedJpg(b); r = { obj: im2, m: [src.w, 0, 0, -src.h, 0, src.h] }; }
      bySrc.set(src, r); return r;
    }
    async function forCanvas(c) {
      if (byCanvas.has(c)) return byCanvas.get(c);
      var im = await out.embedPng(await canvasPng(c)), r = { obj: im, m: [c.width, 0, 0, -c.height, 0, c.height] };
      byCanvas.set(c, r); return r;
    }
    // signature box in the page's own space (PDF points)
    function sigOps(pg, w) {
      var r = w.rect, k = Math.min((r[2] - r[0]) / 50, (r[3] - r[1]) / 30);
      var spec = SPSig.boxSpec(w.s, now, function (t, z) { return helv.widthOfTextAtSize(t, z); });
      pg.pushOperators(O.pushGraphicsState(), cm(k, 0, 0, k, r[0], r[3] - 30 * k));
      pg.drawRectangle({ x: 0, y: 30 - (r[3] - r[1]) / k, width: (r[2] - r[0]) / k, height: (r[3] - r[1]) / k, color: O.rgb(1, 1, 1) });
      [[spec.tick.black, [0, 0, 0]], [spec.tick.green, spec.tick.rgb]].forEach(function (t) {
        var ops = [O.pushGraphicsState(), cm(spec.tick.k, 0, 0, spec.tick.k, spec.tick.x, spec.tick.y), O.setFillingRgbColor(t[1][0], t[1][1], t[1][2])];
        t[0].forEach(function (p, i) { ops.push(i ? O.lineTo(p[0], p[1]) : O.moveTo(p[0], p[1])); });
        ops.push(O.closePath(), O.fill(), O.popGraphicsState()); pg.pushOperators.apply(pg, ops);
      });
      spec.lines.forEach(function (l) { pg.drawText(l.text, { x: l.x, y: l.y, size: l.size, font: helv, color: O.rgb(0, 0, 0) }); });
      pg.drawText(spec.title.text, { x: spec.title.x, y: spec.title.y, size: spec.title.size, font: helv, color: O.rgb(0, 0, 0) });
      pg.pushOperators(O.popGraphicsState());
    }
    // paths (PDF points, y up)
    function rectPath(x, y, w, h) { return [O.rectangle(x, y, w, h)]; }
    function rrPath(x, y, w, h, r) {
      var c = r * 0.5523;
      return [O.moveTo(x + r, y), O.lineTo(x + w - r, y), O.appendBezierCurve(x + w - r + c, y, x + w, y + r - c, x + w, y + r),
        O.lineTo(x + w, y + h - r), O.appendBezierCurve(x + w, y + h - r + c, x + w - r + c, y + h, x + w - r, y + h),
        O.lineTo(x + r, y + h), O.appendBezierCurve(x + r - c, y + h, x, y + h - r + c, x, y + h - r),
        O.lineTo(x, y + r), O.appendBezierCurve(x, y + r - c, x + r - c, y, x + r, y), O.closePath()];
    }
    // put a region of a source (pixels of its picture) into dest (points), optionally turned / mirrored / clipped
    async function place(pg, R, region, dest, opt) {
      var rot = opt.rot || 0, th = -rot * Math.PI / 180, turned = rot % 180 !== 0;
      var dw = turned ? dest.h : dest.w, dh = turned ? dest.w : dest.h;
      var ops = [O.pushGraphicsState()];
      if (opt.clip) ops = ops.concat(opt.clip, [O.clip(), O.endPath()]);
      ops.push(cm(1, 0, 0, 1, dest.x + dest.w / 2, dest.y + dest.h / 2), cm(Math.cos(th), Math.sin(th), -Math.sin(th), Math.cos(th), 0, 0));
      if (opt.mirror) ops.push(cm(-1, 0, 0, 1, 0, 0));
      var a = dw / region.w, b = dh / region.h, cx = region.x + region.w / 2, cy = region.y + region.h / 2;
      ops.push(cm(a, 0, 0, -b, -cx * a, cy * b), cm.apply(null, R.m), O.drawObject(useObj(pg, R.obj)));
      pg.pushOperators.apply(pg, ops);
      if (R.sig && R.sig.length) R.sig.forEach(function (w) { sigOps(pg, w); });
      pg.pushOperators(O.popGraphicsState());
    }
    function strokeOps(path, rgb, lw, dash) {
      return [O.pushGraphicsState(), O.setStrokingRgbColor(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255), O.setLineWidth(lw)].concat(dash ? [O.setDashPattern(dash, 0)] : [], path, [O.stroke(), O.popGraphicsState()]);
    }

    helv = await out.embedFont(PL.StandardFonts.Helvetica);
    var cut = $('cp-cut') && $('cp-cut').checked, vectorUsed = false;
    for (var pi = 0; pi < pages.length; pi++) {
      busy(true, 'Saving page ' + (pi + 1) + ' of ' + pages.length + ' in original quality…');
      await new Promise(function (r) { setTimeout(r, 0); });
      var P = pages[pi], PH = P.H * PT, pg = out.addPage([P.W * PT, PH]);
      var box = function (X, Y, w, h) { return { x: X * PT, y: PH - (Y + h) * PT, w: w * PT, h: h * PT }; };
      for (var ii = 0; ii < P.items.length; ii++) {
        var it = P.items[ii];
        if (it.full) {
          var src = it.full.src, R = await forSrc(src); vectorUsed = vectorUsed || !!R.vector;
          var fc = it.full.crop, fb = box(it.x, it.y, it.w, it.h);
          await place(pg, R, fc ? { x: fc.x, y: fc.y, w: fc.width, h: fc.height } : { x: 0, y: 0, w: src.w, h: src.h }, fb, { rot: it.full.rot, clip: fc ? rectPath(fb.x, fb.y, fb.w, fb.h) : null });
          continue;
        }
        var u = it.unit, ox = it.x, oy = it.y, isLong = u.kind === 'long', round = !!u.round, RAD = 3.18;
        var parts = it.back ? [{ c: u.back, x: 0, y: 0, w: u.w, h: u.h }] : u.parts;
        var ub = box(ox, oy, u.w, u.h), unitClip = isLong && round ? rrPath(ub.x, ub.y, ub.w, ub.h, RAD * PT) : null;
        for (var pj = 0; pj < parts.length; pj++) {
          var p = parts[pj]; if (!p.c) continue;
          var X = ox + (u.mirror ? (u.w - p.x - p.w) : p.x), Y = oy + p.y, pb = box(X, Y, p.w, p.h);
          var clip = round && !isLong ? rrPath(pb.x, pb.y, pb.w, pb.h, RAD * PT) : (unitClip || rectPath(pb.x, pb.y, pb.w, pb.h));
          var cr = p.c.__crop, cs = cr && st.sources.find(function (x) { return x.id === cr.srcId; }), d = cr && cr.data;
          if (cs && d && !((d.rotate || 0) % 360) && (d.scaleX || 1) === 1 && (d.scaleY || 1) === 1 && d.width > 0 && d.height > 0) {
            var Rs = await forSrc(cs), dest = pb; vectorUsed = vectorUsed || !!Rs.vector;
            if (cr.free) { var kk = Math.min(pb.w / d.width, pb.h / d.height), ww = d.width * kk, hh = d.height * kk; dest = { x: pb.x + (pb.w - ww) / 2, y: pb.y + (pb.h - hh) / 2, w: ww, h: hh }; }
            await place(pg, Rs, { x: d.x, y: d.y, w: d.width, h: d.height }, dest, { clip: clip, mirror: u.mirror });
          } else {
            await place(pg, await forCanvas(p.c), { x: 0, y: 0, w: p.c.width, h: p.c.height }, pb, { clip: clip, mirror: u.mirror });
          }
          if (cut && !isLong) pg.pushOperators.apply(pg, strokeOps(round ? rrPath(pb.x, pb.y, pb.w, pb.h, RAD * PT) : rectPath(pb.x, pb.y, pb.w, pb.h), [140, 150, 163], 0.2 * PT));
        }
        if (isLong) {
          if (cut) pg.pushOperators.apply(pg, strokeOps(round ? rrPath(ub.x, ub.y, ub.w, ub.h, RAD * PT) : rectPath(ub.x, ub.y, ub.w, ub.h), [140, 150, 163], 0.2 * PT));
          if (u.fold != null) { var fx = (ox + u.fold) * PT; pg.pushOperators.apply(pg, strokeOps([O.moveTo(fx, ub.y - 2 * PT), O.lineTo(fx, ub.y + ub.h + 2 * PT)], [154, 164, 176], 0.25 * PT, [2 * PT, 1.5 * PT])); }
        }
      }
    }
    out.setProducer('S Printer'); out.setCreator('S Printer'); out.setTitle(DOC.name);
    st.lastVector = vectorUsed;
    return out.save({ useObjectStreams: true });
  }
  async function doPdf() {
    try {
      var bytes = await vectorPdf();
      if (bytes) { busy(false); var u = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })); save(fileBase() + '.pdf', u); setTimeout(function () { URL.revokeObjectURL(u); }, 20000); toast(st.lastVector ? 'PDF saved in original quality (sharp at any zoom).' : 'PDF saved — original photo quality.'); return; }
    } catch (e) { try { console.warn('vector pdf failed', e); } catch (_) {} } finally { busy(false); }
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
  // full-document mode defaults to "same size as the document" so nothing is shrunk or re-framed
  function fullPaper(on) {
    var sel = $('cp-paper'); if (!sel || !sel.querySelector('option[value=orig]')) return;
    if (on && sel.value === 'A4') sel.value = 'orig'; else if (!on && sel.value === 'orig') sel.value = 'A4';
    if ($('cp-custompaper')) $('cp-custompaper').hidden = sel.value !== 'custom';
  }
  function init() {
    loadPrefs();
    setupViewer();
    if (window.SPPaper && $('cp-paperbox')) SPPaper.mount($('cp-paperbox'));
    var ds = document.body.getAttribute('data-size'), dr = ds && document.querySelector('input[name=cp-size][value=' + ds + ']');
    if (dr) { dr.checked = true; st.size = ds; if (ds === 'full') { $('cp-margin').value = Math.min(num('cp-margin', 8), 5); fullPaper(true); } }
    [].forEach.call(document.querySelectorAll('input[name=cp-size]'), function (r) {
      r.addEventListener('change', function () { if (r.checked) { st.size = r.value; st.adj = {}; V.sel = null; if (st.size === 'full') $('cp-margin').value = Math.min(num('cp-margin', 8), 5); fullPaper(st.size === 'full'); renderSlots(); renderSig(); update(); } });
    });
    $('cp-file').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    var drop = $('cp-drop');
    ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.remove('drag'); }); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); addFiles(e.dataTransfer.files); });
    ['cp-back', 'cp-longsep', 'cp-cw', 'cp-ch'].forEach(function (id) { $(id).addEventListener('change', function () { renderSlots(); update(); }); });
    ['cp-fit', 'cp-scale'].forEach(function (id) { if ($(id)) { $(id).addEventListener('change', update); $(id).addEventListener('input', update); } });
    if ($('cp-addcard')) $('cp-addcard').addEventListener('click', addAnotherCard);
    ['cp-mirror', 'cp-maxpp', 'cp-pw', 'cp-ph'].forEach(function (id) { if ($(id)) { $(id).addEventListener('change', update); $(id).addEventListener('input', update); } });
    var cpv = function () { if ($('cp-custompaper')) $('cp-custompaper').hidden = $('cp-paper').value !== 'custom'; };
    $('cp-paper').addEventListener('change', cpv); cpv();
    ['cp-dpi', 'cp-mirror', 'cp-pw', 'cp-ph'].forEach(function (id) { if ($(id)) $(id).addEventListener('change', savePrefs); });
    ['cp-paper', 'cp-orient', 'cp-arrange', 'cp-pos', 'cp-margin', 'cp-gap', 'cp-cut', 'cp-round', 'cp-fold', 'cp-bw', 'cp-copies'].forEach(function (id) {
      $(id).addEventListener('change', function () { savePrefs(); update(); }); $(id).addEventListener('input', update);
    });
    ['cp-bright', 'cp-contrast'].forEach(function (id) { $(id).addEventListener('input', function () { $(id + '-v').textContent = $(id).value; update(); }); });
    [].forEach.call(document.querySelectorAll('.cp-stepper button'), function (b) {
      b.addEventListener('click', function () { var i = $('cp-copies'); i.value = Math.max(1, Math.min(60, (parseInt(i.value, 10) || 1) + (+b.dataset.step))); update(); });
    });
    $('cp-prev').onclick = function () { if (st.page > 0) { st.page--; V.sel = null; update(); } };
    $('cp-next').onclick = function () { if (st.page < st.pages.length - 1) { st.page++; V.sel = null; update(); } };
    $('cp-print').onclick = doPrint; $('cp-pdf').onclick = doPdf; $('cp-jpg').onclick = doJpg;
    if ($('cp-edit')) $('cp-edit').onclick = openLayoutEditor;
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
