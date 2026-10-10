/* S Printer — Passport Photo Pro
 * Exact photo size in inch / cm / mm / px (default 1.2 × 1.5 in), crop with a face guide,
 * AI background removal with any background colour, adjustments, border, name & date,
 * several people on one sheet, and a sheet that is filled perfectly (spare space is filled
 * with turned photos). Everything runs in the browser. Designed & developed by Raj. */
(function () {
  'use strict';
  var MM = 25.4;
  var $ = function (id) { return document.getElementById(id); };
  var UNIT = { in: 25.4, cm: 10, mm: 1, px: 25.4 / 300 };
  var PRESETS = [
    ['pp12', 'Passport 1.2 × 1.5 in', 30.48, 38.1],
    ['in35', 'India passport / PAN · 3.5 × 4.5 cm', 35, 45],
    ['stamp', 'Stamp size · 2 × 2.5 cm', 20, 25],
    ['us', 'USA passport / visa · 2 × 2 in', 50.8, 50.8],
    ['eu', 'UK / Schengen / Australia · 35 × 45 mm', 35, 45],
    ['a4six', 'A4 six per row · 3.2 × 4.114 cm', 32, 41.14],
    ['ca', 'Canada · 50 × 70 mm', 50, 70],
    ['cn', 'China visa · 33 × 48 mm', 33, 48],
    ['my', 'Malaysia · 35 × 50 mm', 35, 50],
    ['ae', 'UAE / Saudi visa · 4 × 6 cm', 40, 60],
    ['tr', 'Turkey · 50 × 60 mm', 50, 60],
    ['br', 'Brazil · 5 × 7 cm', 50, 70]
  ];
  var PAPERS = { A4: [210, 297], '4x6': [101.6, 152.4], '5x7': [127, 177.8], A5: [148, 210], Letter: [215.9, 279.4], Legal: [215.9, 355.6], A3: [297, 420] };
  var SWATCH = ['#ffffff', '#e6f0fb', '#bfdcf5', '#6fb3e8', '#1d6fd1', '#0b3d91', '#d7263d', '#f1f1f1', '#c9ced6', '#fff5d6'];
  var PREF = 'sp-passport-v1';
  var st = { people: [], sel: null, size: { w: 30.48, h: 38.1 }, pages: [], page: 0 };
  var seq = 0;

  // ---------- small helpers ----------
  function num(id, d, lo, hi) { var v = parseFloat($(id).value); if (!isFinite(v)) v = d; if (lo != null) v = Math.max(lo, v); if (hi != null) v = Math.min(hi, v); return v; }
  function toast(t) { var e = $('pp-toast'); e.textContent = t; e.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { e.hidden = true; }, 2800); }
  function busy(on, t) { $('pp-busy').hidden = !on; if (t) $('pp-busy-t').textContent = t; }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function fmt(mm, unit) { var v = mm / UNIT[unit]; return unit === 'px' ? String(Math.round(v)) : String(Math.round(v * 1000) / 1000); }
  function dpi() { return parseInt($('pp-dpi').value, 10) || 300; }
  function px(mm, d) { return Math.round(mm / MM * (d || dpi())); }
  function save() {
    try {
      localStorage.setItem(PREF, JSON.stringify({ unit: $('pp-unit').value, w: st.size.w, h: st.size.h, preset: $('pp-preset').value,
        paper: $('pp-paper').value, orient: $('pp-orient').value, margin: $('pp-margin').value, gap: $('pp-gap').value, fill: $('pp-fill').checked,
        spare: $('pp-spare').checked, cut: $('pp-cut').checked, pos: $('pp-pos').value, dpi: $('pp-dpi').value, pw: $('pp-pw').value, ph: $('pp-ph').value, pu: $('pp-punit').value }));
    } catch (e) {}
  }
  function load() {
    try {
      var p = JSON.parse(localStorage.getItem(PREF) || 'null'); if (!p) return;
      ['unit', 'preset', 'paper', 'orient', 'margin', 'gap', 'pos', 'dpi', 'pw', 'ph'].forEach(function (k) { if (p[k] != null && $('pp-' + k)) $('pp-' + k).value = p[k]; });
      if (p.pu) $('pp-punit').value = p.pu;
      ['fill', 'spare', 'cut'].forEach(function (k) { if (p[k] != null) $('pp-' + k).checked = !!p[k]; });
      if (p.w > 5 && p.h > 5) st.size = { w: p.w, h: p.h };
    } catch (e) {}
  }

  // ---------- photo size ----------
  function showSize() {
    var u = $('pp-unit').value;
    $('pp-w').value = fmt(st.size.w, u); $('pp-h').value = fmt(st.size.h, u);
    $('pp-size-note').textContent = (st.size.w / 25.4).toFixed(2) + ' × ' + (st.size.h / 25.4).toFixed(2) + ' in  ·  ' + (st.size.w / 10).toFixed(2) + ' × ' + (st.size.h / 10).toFixed(2) + ' cm  ·  ' + px(st.size.w, 300) + ' × ' + px(st.size.h, 300) + ' px @300';
  }
  function setSizeFromInputs() {
    var u = $('pp-unit').value, w = parseFloat($('pp-w').value) * UNIT[u], h = parseFloat($('pp-h').value) * UNIT[u];
    if (!(w >= 5 && h >= 5 && w <= 400 && h <= 400)) return;
    st.size = { w: w, h: h };
    var match = PRESETS.find(function (p) { return Math.abs(p[2] - w) < 0.2 && Math.abs(p[3] - h) < 0.2; });
    $('pp-preset').value = match ? match[0] : 'custom';
    $('pp-size-note').textContent = '';
    showSizeNoteOnly(); sizeChanged();
  }
  function showSizeNoteOnly() { var u = $('pp-unit').value; $('pp-size-note').textContent = (st.size.w / 25.4).toFixed(2) + ' × ' + (st.size.h / 25.4).toFixed(2) + ' in  ·  ' + (st.size.w / 10).toFixed(2) + ' × ' + (st.size.h / 10).toFixed(2) + ' cm  ·  ' + px(st.size.w, 300) + ' × ' + px(st.size.h, 300) + ' px @300'; }
  function sizeChanged() {
    // existing crops keep their centre; the frame shape follows the new size
    st.people.forEach(function (p) { p.dirty = true; if (p.crop) p.crop = refit(p, p.crop); });
    save(); renderPeople(); update();
  }
  function refit(p, c) {
    var r = st.size.w / st.size.h, cx = c.x + c.width / 2, cy = c.y + c.height / 2, w = c.width, h = c.height;
    if (w / h > r) w = h * r; else h = w / r;
    return { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rotate: c.rotate || 0, scaleX: c.scaleX || 1 };
  }

  // ---------- people ----------
  async function decode(file) {
    try { if (window.createImageBitmap) { var b = await createImageBitmap(file, { imageOrientation: 'from-image' }); return toCanvas(b, b.width, b.height); } } catch (e) {}
    return await new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), i = new Image();
      i.onload = function () { res(toCanvas(i, i.naturalWidth, i.naturalHeight)); URL.revokeObjectURL(u); }; i.onerror = rej; i.src = u;
    });
  }
  function toCanvas(img, w, h) {
    var k = Math.min(1, 3200 / Math.max(w, h)), c = canvas(w * k, h * k), x = c.getContext('2d');
    x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, c.width, c.height); return c;
  }
  function defaultCrop(p) {
    var W = p.img.width, H = p.img.height, r = st.size.w / st.size.h, h = H * 0.92, w = h * r;
    if (w > W * 0.96) { w = W * 0.96; h = w / r; }
    return { x: (W - w) / 2, y: Math.max(0, (H - h) * 0.25), width: w, height: h, rotate: 0 };
  }
  async function addFiles(files) {
    files = [].slice.call(files || []).filter(function (f) { return /^image\//.test(f.type) || /\.(jpe?g|png|webp|bmp|gif)$/i.test(f.name); });
    if (!files.length) { toast('Choose a photo (JPG, PNG or WebP).'); return; }
    busy(true, 'Opening photo…');
    for (var i = 0; i < files.length; i++) {
      try {
        var img = await decode(files[i]);
        var p = { id: ++seq, name: files[i].name, img: img, mask: null, bg: null, adj: { b: 0, c: 0, s: 0 }, copies: 0, dirty: true };
        p.crop = defaultCrop(p);
        st.people.push(p); st.sel = p;
      } catch (e) { toast('Could not open ' + files[i].name); }
    }
    busy(false); renderPeople(); renderEditor(); update();
    if (st.sel) openCrop(st.sel);
  }
  function renderPeople() {
    var box = $('pp-people'); box.innerHTML = '';
    $('pp-people-wrap').hidden = !st.people.length;
    st.people.forEach(function (p, i) {
      var el = document.createElement('div'); el.className = 'pp-person' + (p === st.sel ? ' on' : '');
      var th = photoCanvas(p, 120 / Math.max(st.size.w, st.size.h) * MM);
      el.innerHTML = '<button type="button" class="pp-pick" aria-label="Edit this photo"></button><div class="pp-pmeta"><b></b><label class="pp-copies">Copies <input type="number" min="0" max="200" inputmode="numeric" title="0 = share the sheet"></label></div><button type="button" class="pp-del" aria-label="Remove">×</button>';
      el.querySelector('.pp-pick').appendChild(th);
      el.querySelector('b').textContent = 'Photo ' + (i + 1);
      var cp = el.querySelector('input'); cp.value = p.copies || '';
      cp.placeholder = 'auto';
      cp.oninput = function () { p.copies = Math.max(0, parseInt(cp.value, 10) || 0); update(); };
      el.querySelector('.pp-pick').onclick = function () { st.sel = p; renderPeople(); renderEditor(); };
      el.querySelector('.pp-del').onclick = function () { st.people = st.people.filter(function (x) { return x !== p; }); if (st.sel === p) st.sel = st.people[0] || null; renderPeople(); renderEditor(); update(); };
      box.appendChild(el);
    });
  }

  // ---------- one finished photo ----------
  function adjFilter(a) { return 'brightness(' + (100 + a.b) + '%) contrast(' + (100 + a.c) + '%) saturate(' + (100 + a.s) + '%)'; }
  function composed(p) {
    // original image with the chosen background (if the background was removed)
    if (!p.mask || !p.bg) return p.img;
    if (p._comp && p._compBg === p.bg && p._compSoft === p.soft) return p._comp;
    var W = p.img.width, H = p.img.height, c = canvas(W, H), x = c.getContext('2d');
    var person = canvas(W, H), px2 = person.getContext('2d');
    px2.drawImage(p.img, 0, 0);
    px2.globalCompositeOperation = 'destination-in';
    if (p.soft) px2.filter = 'blur(' + Math.max(0.6, W / 900) + 'px)';
    px2.drawImage(p.mask, 0, 0, W, H);
    px2.filter = 'none';
    x.fillStyle = p.bg; x.fillRect(0, 0, W, H); x.drawImage(person, 0, 0);
    p._comp = c; p._compBg = p.bg; p._compSoft = p.soft;
    return c;
  }
  function photoCanvas(p, d) {
    var W = px(st.size.w, d), H = px(st.size.h, d), c = canvas(W, H), x = c.getContext('2d');
    var cr = p.crop || defaultCrop(p), src = composed(p);
    x.fillStyle = p.bg || '#fff'; x.fillRect(0, 0, W, H);
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    if (p.adj.b || p.adj.c || p.adj.s) x.filter = adjFilter(p.adj);
    if (cr.rotate || cr.scaleX === -1) {
      // Cropper measures a turned photo inside its turned bounding box
      var rad = (cr.rotate || 0) * Math.PI / 180, sw = src.width, sh = src.height;
      var bw = Math.abs(sw * Math.cos(rad)) + Math.abs(sh * Math.sin(rad)), bh = Math.abs(sw * Math.sin(rad)) + Math.abs(sh * Math.cos(rad));
      x.save(); x.scale(W / cr.width, H / cr.height); x.translate(-cr.x, -cr.y); x.translate(bw / 2, bh / 2); x.rotate(rad);
      if (cr.scaleX === -1) x.scale(-1, 1);
      x.drawImage(src, -sw / 2, -sh / 2); x.restore();
    } else x.drawImage(src, cr.x, cr.y, cr.width, cr.height, 0, 0, W, H);
    x.filter = 'none';
    // name / date band
    var name = $('pp-name').value.trim(), date = $('pp-date').checked;
    if ($('pp-text').checked && (name || date)) {
      var lines = []; if (name) lines.push(name); if (date) { var t = new Date(); lines.push(('0' + t.getDate()).slice(-2) + '/' + ('0' + (t.getMonth() + 1)).slice(-2) + '/' + t.getFullYear()); }
      var fs = H * num('pp-tsize', 7, 4, 14) / 100, bh = fs * (lines.length * 1.18 + 0.5);
      x.fillStyle = '#fff'; x.fillRect(0, H - bh, W, bh);
      x.fillStyle = '#111'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      lines.forEach(function (l, i) { x.font = '700 ' + fs + 'px Arial, Helvetica, sans-serif'; while (x.measureText(l).width > W * 0.94 && fs > 4) { fs -= 0.5; x.font = '700 ' + fs + 'px Arial'; } x.fillText(l, W / 2, H - bh + fs * (1.05 + i * 1.18)); });
    }
    if ($('pp-border').checked) {
      var bw = Math.max(1, num('pp-bw', 2, 1, 40) * d / 300);
      x.lineWidth = bw; x.strokeStyle = $('pp-bc').value; x.strokeRect(bw / 2, bw / 2, W - bw, H - bw);
    }
    return c;
  }

  // ---------- crop window ----------
  var cropper = null, cropP = null;
  function openCrop(p) {
    cropP = p; var img = $('pp-crop-img');
    $('pp-crop').hidden = false; document.documentElement.style.overflow = 'hidden';
    $('pp-crop-title').textContent = 'Crop · ' + fmt(st.size.w, $('pp-unit').value) + ' × ' + fmt(st.size.h, $('pp-unit').value) + ' ' + $('pp-unit').value;
    if (cropper) { cropper.destroy(); cropper = null; }
    var src = composed(p);
    img.onload = function () {
      cropper = new Cropper(img, {
        viewMode: 1, dragMode: 'move', aspectRatio: st.size.w / st.size.h, autoCropArea: 0.9, background: false,
        checkOrientation: false, toggleDragModeOnDblclick: false, responsive: true,
        ready: function () {
          try { cropper.rotateTo(p.crop.rotate || 0); if (p.crop.scaleX === -1) cropper.scaleX(-1); cropper.setData(p.crop); } catch (e) {}
          var box = img.parentNode.querySelector('.cropper-crop-box');
          if (box && !box.querySelector('.pp-guide')) {
            var g = document.createElement('div'); g.className = 'pp-guide';
            g.innerHTML = '<svg viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="55" rx="30" ry="42" fill="none" stroke="#fff" stroke-width=".9" stroke-dasharray="3 2"/><path d="M4 125c3-14 15-21 30-23M96 125c-3-14-15-21-30-23" fill="none" stroke="#fff" stroke-width=".9" stroke-dasharray="3 2"/><line x1="0" y1="13" x2="100" y2="13" stroke="#22c1ee" stroke-width=".7"/><line x1="0" y1="97" x2="100" y2="97" stroke="#22c1ee" stroke-width=".7"/></svg>';
            box.appendChild(g);
          }
        }
      });
    };
    img.src = src.toDataURL('image/jpeg', 0.92);
  }
  function closeCrop() { $('pp-crop').hidden = true; document.documentElement.style.overflow = ''; if (cropper) { cropper.destroy(); cropper = null; } }
  function doneCrop() {
    if (!cropper || !cropP) return;
    var d = cropper.getData(); cropP.crop = { x: d.x, y: d.y, width: d.width, height: d.height, rotate: d.rotate || 0, scaleX: d.scaleX || 1 };
    closeCrop(); renderPeople(); renderEditor(); update();
  }

  // ---------- background removal (same AI model the other photo tools use) ----------
  var WORKER_SRC = "let engine=null;async function load(){if(!engine)engine=(async()=>{const lib=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2/dist/transformers.min.js');lib.env.allowLocalModels=false;lib.env.backends.onnx.wasm.numThreads=1;const options={revision:'fa2fa546052fba4c08921230a26cc69a333fca12'};const [model,processor]=await Promise.all([lib.AutoModel.from_pretrained('Xenova/modnet',{...options,dtype:'fp32',device:'wasm'}),lib.AutoProcessor.from_pretrained('Xenova/modnet',options)]);return {lib,model,processor};})().catch(e=>{engine=null;throw e;});return engine;}self.onmessage=async({data})=>{try{self.postMessage({stage:engine?'processing':'loading'});const {lib,model,processor}=await load();const input=new lib.RawImage(new Uint8ClampedArray(data.pixels),data.width,data.height,4);const {pixel_values}=await processor(input);let output;try{({output}=await model({input:pixel_values}));const mask=lib.RawImage.fromTensor(output[0].mul(255).to('uint8'));const bytes=new Uint8Array(mask.data);self.postMessage({mask:bytes.buffer,width:mask.width,height:mask.height},[bytes.buffer]);}finally{pixel_values&&pixel_values.dispose&&pixel_values.dispose();output&&output.dispose&&output.dispose();}}catch(e){self.postMessage({error:'Background removal failed. Check the internet connection and try again.'});}};";
  var worker = null;
  function getWorker() {
    if (window.__ppMatting) return null;                                     // test hook
    if (!worker) worker = new Worker(URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' })), { type: 'module' });
    return worker;
  }
  function maskFor(p) {
    return new Promise(function (res, rej) {
      var k = Math.min(1, 1024 / Math.max(p.img.width, p.img.height)), c = canvas(p.img.width * k, p.img.height * k), x = c.getContext('2d');
      x.drawImage(p.img, 0, 0, c.width, c.height);
      var data = x.getImageData(0, 0, c.width, c.height);
      if (window.__ppMatting) { window.__ppMatting(data).then(res, rej); return; }
      var w = getWorker();
      w.onmessage = function (e) {
        var m = e.data;
        if (m.stage) { busy(true, m.stage === 'loading' ? 'Loading the AI model (first time only)…' : 'Removing the background…'); return; }
        if (m.error) { rej(new Error(m.error)); return; }
        var u8 = new Uint8Array(m.mask), mc = canvas(m.width, m.height), mx = mc.getContext('2d'), id = mx.createImageData(m.width, m.height);
        for (var i = 0; i < u8.length; i++) { id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = 255; id.data[i * 4 + 3] = u8[i]; }
        mx.putImageData(id, 0, 0); res(mc);
      };
      w.onerror = function () { rej(new Error('Background removal could not start.')); };
      w.postMessage({ pixels: data.data.buffer, width: data.width, height: data.height }, [data.data.buffer]);
    });
  }
  async function removeBg(p) {
    busy(true, 'Removing the background…');
    try {
      p.mask = await maskFor(p);
      if (!p.bg) p.bg = '#ffffff';
      p.soft = true; p._comp = null;
      toast('Background removed. Pick any colour.');
    } catch (e) { toast(e.message || 'Background removal failed.'); }
    busy(false); renderEditor(); renderPeople(); update();
  }

  // ---------- editor panel for the selected photo ----------
  function renderEditor() {
    var p = st.sel, ed = $('pp-editor');
    ed.hidden = !p; if (!p) return;
    $('pp-b').value = p.adj.b; $('pp-c').value = p.adj.c; $('pp-s').value = p.adj.s;
    ['b', 'c', 's'].forEach(function (k) { $('pp-' + k + '-v').textContent = p.adj[k]; });
    $('pp-bgstate').textContent = p.mask ? 'Background removed — choose a colour' : 'Original background';
    $('pp-restore').hidden = !p.mask;
    [].forEach.call(document.querySelectorAll('.pp-sw'), function (b) { b.setAttribute('aria-pressed', String(!!p.mask && b.dataset.c === p.bg)); });
    $('pp-bgcolor').value = p.bg || '#ffffff';
    $('pp-soft').checked = p.soft !== false;
  }
  function setBg(color) {
    var p = st.sel; if (!p) return;
    p.bg = color; p._comp = null;
    if (!p.mask) { removeBg(p); return; }                                   // first colour pick removes the old background
    renderEditor(); renderPeople(); update();
  }

  // ---------- sheet layout: fill the paper perfectly ----------
  function paperDims() {
    if ($('pp-paper').value === 'custom') { var u = UNIT[$('pp-punit').value]; return [num('pp-pw', 210 / u, 1) * u, num('pp-ph', 297 / u, 1) * u]; }
    return PAPERS[$('pp-paper').value] || PAPERS.A4;
  }
  // slots for one page: a main grid plus a strip of turned photos in the spare space
  function slots(W, H, w, h, m, g, spare) {
    var aw = W - 2 * m, ah = H - 2 * m;
    function grid(cw, ch, x0, y0, AW, AH, rot) {
      var cols = Math.floor((AW + g) / (cw + g)), rows = Math.floor((AH + g) / (ch + g)), out = [];
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) out.push({ x: x0 + c * (cw + g), y: y0 + r * (ch + g), w: cw, h: ch, rot: rot });
      return { cols: Math.max(0, cols), rows: Math.max(0, rows), list: out };
    }
    var best = null;
    (spare ? [[w, h, false], [h, w, true]] : [[w, h, false]]).forEach(function (o) {
      var main = grid(o[0], o[1], 0, 0, aw, ah, o[2]);
      if (!main.list.length) return;
      var usedW = main.cols * (o[0] + g) - g, usedH = main.rows * (o[1] + g) - g;
      var variants = [main.list];
      if (spare) {
        var right = grid(o[1], o[0], usedW + g, 0, aw - usedW - g, ah, !o[2]);
        var bottom = grid(o[1], o[0], 0, usedH + g, aw, ah - usedH - g, !o[2]);
        variants.push(main.list.concat(right.list), main.list.concat(bottom.list));
      }
      // more photos wins, but upright photos are preferred (a turned photo counts a little less)
      var score = function (v) { return v.length - 0.1 * v.filter(function (s) { return s.rot; }).length; };
      variants.forEach(function (v) { if (!best || score(v) > score(best)) best = v; });
    });
    if (!best) return [];
    // centre the whole block on the paper
    var minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    best.forEach(function (s) { minX = Math.min(minX, s.x); maxX = Math.max(maxX, s.x + s.w); maxY = Math.max(maxY, s.y + s.h); });
    var dx = m + (aw - (maxX - minX)) / 2 - minX, dy = $('pp-pos').value === 'center' ? m + (ah - maxY) / 2 : m;
    return best.map(function (s) { return { x: s.x + dx, y: s.y + dy, w: s.w, h: s.h, rot: s.rot }; });
  }
  function buildPages() {
    var ready = st.people.filter(function (p) { return p.crop; }); if (!ready.length) return [];
    var P = paperDims(), m = num('pp-margin', 2, 0, 40), g = num('pp-gap', 1, 0, 30), w = st.size.w, h = st.size.h, spare = $('pp-spare').checked;
    var orient = $('pp-orient').value, opts = [];
    var Pw = Math.min(P[0], P[1]), Ph = Math.max(P[0], P[1]);
    if (orient !== 'landscape') opts.push([Pw, Ph]);
    if (orient !== 'portrait') opts.push([Ph, Pw]);
    var pick = null;
    opts.forEach(function (o) { var s = slots(o[0], o[1], w, h, m, g, spare); if (!pick || s.length > pick.s.length) pick = { W: o[0], H: o[1], s: s }; });
    if (!pick || !pick.s.length) { st.warn = 'This photo size does not fit on the paper.'; return []; }
    st.warn = '';
    var per = pick.s.length, list = [], fill = $('pp-fill').checked;
    var fixed = ready.filter(function (p) { return p.copies > 0; }), auto = ready.filter(function (p) { return !(p.copies > 0); });
    fixed.forEach(function (p) { for (var i = 0; i < p.copies; i++) list.push(p); });
    if (auto.length) {
      if (fill) {
        // share the rest of the (last) sheet between the photos without a copy count
        var used = list.length % per, left = (used ? per - used : (list.length ? 0 : per));
        if (!left && !list.length) left = per;
        if (!left) left = per;
        var each = Math.max(1, Math.floor(left / auto.length)), extra = left - each * auto.length;
        auto.forEach(function (p, i) { var n = each + (i < extra ? 1 : 0); for (var k = 0; k < n; k++) list.push(p); });
      } else auto.forEach(function (p) { list.push(p); });
    }
    var pages = [];
    for (var i = 0; i < list.length; i += per) pages.push({ W: pick.W, H: pick.H, items: list.slice(i, i + per).map(function (p, k) { var s = pick.s[k]; return { p: p, x: s.x, y: s.y, w: s.w, h: s.h, rot: s.rot }; }) });
    st.info = { per: per, rotated: pick.s.filter(function (s) { return s.rot; }).length };
    return pages;
  }
  function drawPage(page, d) {
    var c = canvas(px(page.W, d), px(page.H, d)), x = c.getContext('2d'), k = d / MM, cache = {};
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    page.items.forEach(function (it) {
      var ph = cache[it.p.id] || (cache[it.p.id] = photoCanvas(it.p, d));
      var X = it.x * k, Y = it.y * k, w = it.w * k, h = it.h * k;
      if (it.rot) { x.save(); x.translate(X + w, Y); x.rotate(Math.PI / 2); x.drawImage(ph, 0, 0, h, w); x.restore(); }
      else x.drawImage(ph, X, Y, w, h);
      if ($('pp-cut').checked) { x.lineWidth = Math.max(1, 0.15 * k); x.strokeStyle = '#9aa4b0'; x.strokeRect(X, Y, w, h); }
    });
    return c;
  }

  // ---------- preview / output ----------
  var ut;
  function update() { clearTimeout(ut); ut = setTimeout(doUpdate, 60); }
  function doUpdate() {
    st.pages = buildPages();
    if (st.page >= st.pages.length) st.page = Math.max(0, st.pages.length - 1);
    var has = st.pages.length > 0;
    ['pp-print', 'pp-pdf', 'pp-jpg', 'pp-single'].forEach(function (id) { $(id).disabled = !has; });
    $('pp-empty').hidden = has; $('pp-canvas').style.visibility = has ? 'visible' : 'hidden';
    $('pp-pager').hidden = st.pages.length < 2; $('pp-pageno').textContent = (st.page + 1) + ' / ' + st.pages.length;
    var info = $('pp-info');
    if (!has) { info.textContent = st.warn || ''; return; }
    var pg = st.pages[st.page], cv = $('pp-canvas'), maxW = Math.min(cv.parentNode.clientWidth - 24, 640);
    var d = Math.max(36, Math.min(110, maxW / (pg.W / MM)));
    var c = drawPage(pg, d); cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0);
    var pn = $('pp-paper').value === 'custom' ? 'Custom' : $('pp-paper').options[$('pp-paper').selectedIndex].text.split(' (')[0];
    var total = st.pages.reduce(function (a, p) { return a + p.items.length; }, 0);
    info.textContent = pn + ' · ' + (pg.W > pg.H ? 'landscape' : 'portrait') + ' · ' + st.info.per + ' photos fit per sheet' + (st.info.rotated ? ' (' + st.info.rotated + ' turned to use spare space)' : '') + ' · ' + total + ' in total · ' + st.pages.length + (st.pages.length > 1 ? ' sheets' : ' sheet');
  }
  async function renderAll() {
    var out = [], d = dpi();
    for (var i = 0; i < st.pages.length; i++) {
      busy(true, 'Preparing sheet ' + (i + 1) + ' of ' + st.pages.length + '…'); await new Promise(function (r) { setTimeout(r, 0); });
      var c = drawPage(st.pages[i], d); out.push({ W: st.pages[i].W, H: st.pages[i].H, url: c.toDataURL('image/jpeg', 0.95) }); c.width = c.height = 1;
    }
    busy(false); return out;
  }
  function saveFile(name, url) { var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 800); }
  function base() { return 'SPrinter-Passport-' + fmt(st.size.w, $('pp-unit').value) + 'x' + fmt(st.size.h, $('pp-unit').value) + $('pp-unit').value; }
  async function doPrint() {
    var out = await renderAll(); if (!out.length) return;
    var root = $('cp-print-root'); root.innerHTML = '';
    var W = out[0].W, H = out[0].H, style = $('cp-print-style') || document.createElement('style'); style.id = 'cp-print-style';
    style.textContent = '@media print{@page{size:' + W + 'mm ' + H + 'mm;margin:0}html,body{margin:0!important;padding:0!important}#cp-print-root img{width:' + W + 'mm;height:' + H + 'mm}}';
    document.head.appendChild(style);
    await Promise.all(out.map(function (p) { var im = new Image(); im.alt = ''; im.src = p.url; root.appendChild(im); return im.decode ? im.decode().catch(function () {}) : 0; }));
    document.body.classList.add('cp-printing');
    window.addEventListener('afterprint', function () { document.body.classList.remove('cp-printing'); setTimeout(function () { root.innerHTML = ''; }, 500); }, { once: true });
    setTimeout(function () { window.print(); }, 60);
  }
  async function doPdf() {
    var out = await renderAll(); if (!out.length) return;
    var J = window.jspdf && window.jspdf.jsPDF; if (!J) { toast('PDF maker did not load.'); return; }
    var o = function (p) { return p.W > p.H ? 'landscape' : 'portrait'; };
    var pdf = new J({ unit: 'mm', format: [out[0].W, out[0].H], orientation: o(out[0]) });
    out.forEach(function (p, i) { if (i) pdf.addPage([p.W, p.H], o(p)); pdf.addImage(p.url, 'JPEG', 0, 0, p.W, p.H, undefined, 'FAST'); });
    saveFile(base() + '.pdf', URL.createObjectURL(pdf.output('blob')));
  }
  async function doJpg() { var out = await renderAll(); out.forEach(function (p, i) { setTimeout(function () { saveFile(base() + (out.length > 1 ? '-' + (i + 1) : '') + '.jpg', p.url); }, i * 400); }); }
  function doSingle() {
    var p = st.sel || st.people[0]; if (!p) return;
    var c = photoCanvas(p, dpi());
    c.toBlob(function (b) { saveFile(base() + '-single.jpg', URL.createObjectURL(b)); }, 'image/jpeg', 0.95);
  }

  // ---------- init ----------
  function init() {
    var sel = $('pp-preset');
    PRESETS.forEach(function (p) { var o = document.createElement('option'); o.value = p[0]; o.textContent = p[1]; sel.appendChild(o); });
    var oc = document.createElement('option'); oc.value = 'custom'; oc.textContent = 'Custom size (type below)'; sel.appendChild(oc);
    sel.value = 'pp12';
    var sw = $('pp-swatches');
    SWATCH.forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.className = 'pp-sw'; b.dataset.c = c; b.style.background = c; b.title = c; b.setAttribute('aria-label', 'Background ' + c); b.onclick = function () { setBg(c); }; sw.appendChild(b); });
    load();
    if (sel.value !== 'custom') { var pr = PRESETS.find(function (p) { return p[0] === sel.value; }); if (pr) st.size = { w: pr[2], h: pr[3] }; }
    showSize();
    $('pp-cp').hidden = $('pp-paper').value !== 'custom';

    sel.addEventListener('change', function () { var pr = PRESETS.find(function (p) { return p[0] === sel.value; }); if (pr) { st.size = { w: pr[2], h: pr[3] }; showSize(); sizeChanged(); } else $('pp-w').focus(); });
    $('pp-unit').addEventListener('change', function () { showSize(); save(); });
    ['pp-w', 'pp-h'].forEach(function (id) { $(id).addEventListener('change', setSizeFromInputs); $(id).addEventListener('keydown', function (e) { if (e.key === 'Enter') setSizeFromInputs(); }); });
    $('pp-swap').onclick = function () { st.size = { w: st.size.h, h: st.size.w }; showSize(); sizeChanged(); };
    $('pp-file').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    var drop = $('pp-drop');
    ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.remove('drag'); }); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); addFiles(e.dataTransfer.files); });
    $('pp-crop-btn').onclick = function () { if (st.sel) openCrop(st.sel); };
    $('pp-crop-done').onclick = doneCrop; $('pp-crop-cancel').onclick = closeCrop; $('pp-crop-x').onclick = closeCrop;
    [].forEach.call(document.querySelectorAll('#pp-crop [data-act]'), function (b) {
      b.addEventListener('click', function () {
        if (!cropper) return; var a = b.dataset.act;
        if (a === 'rotl') cropper.rotate(-90); else if (a === 'rotr') cropper.rotate(90);
        else if (a === 'tl') cropper.rotate(-1); else if (a === 'tr') cropper.rotate(1);
        else if (a === 'zin') cropper.zoom(0.1); else if (a === 'zout') cropper.zoom(-0.1);
        else if (a === 'flip') { var dd = cropper.getData(); cropper.scaleX(dd.scaleX === -1 ? 1 : -1); }
        else if (a === 'reset') cropper.reset();
      });
    });
    $('pp-removebg').onclick = function () { if (st.sel) removeBg(st.sel); };
    $('pp-restore').onclick = function () { var p = st.sel; if (!p) return; p.mask = null; p.bg = null; p._comp = null; renderEditor(); renderPeople(); update(); };
    $('pp-bgcolor').addEventListener('input', function () { setBg(this.value); });
    $('pp-soft').onchange = function () { if (st.sel) { st.sel.soft = this.checked; st.sel._comp = null; renderPeople(); update(); } };
    ['b', 'c', 's'].forEach(function (k) { $('pp-' + k).addEventListener('input', function () { if (!st.sel) return; st.sel.adj[k] = +this.value; $('pp-' + k + '-v').textContent = this.value; renderPeopleSoon(); update(); }); });
    $('pp-adjreset').onclick = function () { if (st.sel) { st.sel.adj = { b: 0, c: 0, s: 0 }; renderEditor(); renderPeople(); update(); } };
    ['pp-border', 'pp-bw', 'pp-bc', 'pp-text', 'pp-name', 'pp-date', 'pp-tsize'].forEach(function (id) { $(id).addEventListener('input', function () { $('pp-textopts').hidden = !$('pp-text').checked; renderPeopleSoon(); update(); }); $(id).addEventListener('change', update); });
    ['pp-paper', 'pp-orient', 'pp-margin', 'pp-gap', 'pp-fill', 'pp-spare', 'pp-cut', 'pp-pos', 'pp-dpi', 'pp-pw', 'pp-ph', 'pp-punit'].forEach(function (id) {
      $(id).addEventListener('change', function () { $('pp-cp').hidden = $('pp-paper').value !== 'custom'; save(); update(); }); $(id).addEventListener('input', update);
    });
    $('pp-prev').onclick = function () { if (st.page > 0) { st.page--; update(); } };
    $('pp-next').onclick = function () { if (st.page < st.pages.length - 1) { st.page++; update(); } };
    $('pp-print').onclick = doPrint; $('pp-pdf').onclick = doPdf; $('pp-jpg').onclick = doJpg; $('pp-single').onclick = doSingle;
    window.addEventListener('resize', update);
    renderEditor(); update();
  }
  var rpT; function renderPeopleSoon() { clearTimeout(rpT); rpT = setTimeout(renderPeople, 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.__passport = st;
})();
