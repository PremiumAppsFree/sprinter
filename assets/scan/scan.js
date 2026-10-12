/* S Printer — Scan documents (camera, scanner file, gallery, PDF) */
(function () {
  'use strict';
  var E = window.SPScanEngine;
  var $ = function (id) { return document.getElementById(id); };
  var MOBILE = !!window.SPIsMobile;
  var MAXAREA = MOBILE ? 16e6 : 30e6;
  var st = { pages: [], mode: 'clean', paper: 'a4', target: 0, auto: true, seq: 0 };

  // ---------- small helpers ----------
  function toast(m) { var t = $('sc-toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 3200); }
  function busy(on, msg) { var b = $('sc-busy'); b.hidden = !on; if (msg) $('sc-busy-msg').textContent = msg; }
  function fmt(b) { return b >= 1048576 ? (b / 1048576).toFixed(2) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
  function blobOf(c, type, q) { return new Promise(function (r) { c.toBlob(function (b) { r(b); }, type, q); }); }
  function loadImg(blob) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(blob), i = new Image();
      i.onload = function () { (i.decode ? i.decode() : Promise.resolve()).catch(function () {}).then(function () { res(i); }); };
      i.onerror = function () { URL.revokeObjectURL(u); rej(new Error('decode')); };
      i.src = u;
    });
  }
  var tick = function () { return new Promise(function (r) { setTimeout(r, 16); }); };
  // a tiny step inwards so no sliver of the table is left on the edge
  function inset(q, f) { var cx = 0, cy = 0; q.forEach(function (p) { cx += p[0] / 4; cy += p[1] / 4; }); return q.map(function (p) { return [p[0] + (cx - p[0]) * f, p[1] + (cy - p[1]) * f]; }); }
  function whole(pg) { return [[0, 0], [pg.w, 0], [pg.w, pg.h], [0, pg.h]]; }

  // ---------- pages ----------
  async function addImage(blob, name, o) {
    o = o || {};
    var img; try { img = await loadImg(blob); } catch (e) { toast('This picture could not be opened (' + (name || 'file') + '). Save it as JPG or PNG.'); return; }
    var d = E.dims(img), pg = { id: ++st.seq, img: img, w: d.w, h: d.h, quad: null, auto: false, rot: 0, name: name || 'scan' };
    if (st.auto && !o.noAuto) {
      await tick();
      var r = null; try { r = E.detect(img); } catch (e) {}
      if (r) { pg.quad = inset(r.quad, 0.004); pg.auto = true; }
    }
    if (!pg.quad) pg.quad = whole(pg);
    if (pg.w > pg.h * 1.15 && !pg.auto && st.paper !== 'same') { /* landscape photo kept as it is; user can turn it */ }
    st.pages.push(pg); await preview(pg); render();
    return pg;
  }
  async function addPdf(file) {
    var lib = window.pdfjsLib; if (!lib) { toast('PDF reader did not load.'); return; }
    try { lib.GlobalWorkerOptions.workerSrc = '../assets/vendor/pdf.worker.min.js'; } catch (e) {}
    var data = new Uint8Array(await file.arrayBuffer()), task = lib.getDocument({ data: data });
    task.onPassword = function (update) { var pw = window.prompt('This PDF has a password. Enter it:'); if (pw == null) task.destroy(); else update(pw); };
    var pdf; try { pdf = await task.promise; } catch (e) { toast('Could not open this PDF.'); return; }
    var n = Math.min(pdf.numPages, 40);
    for (var i = 1; i <= n; i++) {
      busy(true, 'Reading page ' + i + ' of ' + n + '…');
      var page = await pdf.getPage(i), v1 = page.getViewport({ scale: 1 });
      var sc = Math.min(300 / 72, Math.sqrt(MAXAREA * 0.6 / (v1.width * v1.height))), vp = page.getViewport({ scale: sc });
      var c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: x, viewport: vp }).promise;
      var b = await blobOf(c, 'image/png'); c.width = c.height = 1;
      await addImage(b, file.name.replace(/\.pdf$/i, '') + ' p' + i, { noAuto: true });
    }
    if (pdf.numPages > n) toast('Only the first ' + n + ' pages were added.');
  }
  async function addFiles(files) {
    files = [].slice.call(files || []); if (!files.length) return;
    busy(true, 'Finding the page edges…');
    try {
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        busy(true, files.length > 1 ? 'Scanning ' + (i + 1) + ' of ' + files.length + '…' : 'Finding the page edges…');
        if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) await addPdf(f);
        else await addImage(f, f.name.replace(/\.[^.]+$/, ''));
      }
    } finally { busy(false); }
  }

  // the page as it will come out: straightened, scan look, turned
  function build(pg, opt) {
    opt = opt || {};
    var c = E.warp(pg.img, pg.quad, opt);
    if (!c) return null;
    c = E.enhance(c, st.mode);
    return E.rotate(c, pg.rot);
  }
  async function preview(pg) {
    var sz = E.outSize(pg.quad), s = Math.min(1, 1100 / Math.max(sz.w, sz.h));
    var c = build(pg, { scale: s, srcScale: s });
    pg.prev = c ? c.toDataURL('image/jpeg', 0.9) : '';
    pg.px = c ? [Math.round(sz.w), Math.round(sz.h)] : [0, 0];
  }
  async function refreshAll() { busy(true, 'Updating…'); await tick(); for (var i = 0; i < st.pages.length; i++) await preview(st.pages[i]); busy(false); render(); }

  var ICO = {
    crop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2"/></svg>',
    rl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    rr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    dn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>'
  };
  function render() {
    var list = $('sc-pages'), has = st.pages.length > 0;
    $('sc-out').hidden = !has; $('sc-count').textContent = st.pages.length + (st.pages.length === 1 ? ' page' : ' pages');
    list.innerHTML = '';
    st.pages.forEach(function (pg, i) {
      var el = document.createElement('div'); el.className = 'sc-page';
      el.innerHTML = '<div class="sc-pv"><img alt="Page ' + (i + 1) + '" src="' + pg.prev + '"><span class="sc-no">' + (i + 1) + '</span>' +
        '<span class="sc-tag ' + (pg.auto ? 'ok' : '') + '">' + (pg.auto ? 'Auto-cropped' : (pg.manual ? 'Cropped by hand' : 'Whole photo')) + '</span></div>' +
        '<div class="sc-tools">' +
        '<button type="button" class="sc-crop" title="Fix the corners by hand">' + ICO.crop + '<span>Crop</span></button>' +
        '<button type="button" data-a="rl" title="Turn left" aria-label="Turn left">' + ICO.rl + '</button>' +
        '<button type="button" data-a="rr" title="Turn right" aria-label="Turn right">' + ICO.rr + '</button>' +
        '<button type="button" data-a="up" title="Move earlier" aria-label="Move earlier"' + (i ? '' : ' disabled') + '>' + ICO.up + '</button>' +
        '<button type="button" data-a="dn" title="Move later" aria-label="Move later"' + (i < st.pages.length - 1 ? '' : ' disabled') + '>' + ICO.dn + '</button>' +
        '<button type="button" data-a="del" class="sc-del" title="Remove" aria-label="Remove page">' + ICO.del + '</button></div>';
      el.querySelector('.sc-crop').onclick = function () { openCrop(pg); };
      el.querySelector('.sc-pv').onclick = function () { openCrop(pg); };
      [].forEach.call(el.querySelectorAll('[data-a]'), function (b) {
        b.onclick = async function () {
          var a = b.getAttribute('data-a'), k = st.pages.indexOf(pg);
          if (a === 'rl' || a === 'rr') { pg.rot = (pg.rot + (a === 'rl' ? -90 : 90) + 360) % 360; await preview(pg); }
          else if (a === 'up' && k > 0) { st.pages.splice(k, 1); st.pages.splice(k - 1, 0, pg); }
          else if (a === 'dn' && k < st.pages.length - 1) { st.pages.splice(k, 1); st.pages.splice(k + 1, 0, pg); }
          else if (a === 'del') { st.pages.splice(k, 1); try { URL.revokeObjectURL(pg.img.src); } catch (e) {} }
          render();
        };
      });
      list.appendChild(el);
    });
    ['sc-pdf', 'sc-jpg', 'sc-print'].forEach(function (id) { $(id).disabled = !has; });
  }

  // ---------- manual crop: drag the 4 corners (with a magnifier) ----------
  var cr = null;
  function openCrop(pg) {
    var m = $('sc-crop'); m.hidden = false; document.body.classList.add('sc-noscroll');
    cr = { pg: pg, q: pg.quad.map(function (p) { return p.slice(); }) };
    var cv = $('sc-cv'), box = $('sc-cbox');
    var lay = function () {
      var bw = box.clientWidth, bh = box.clientHeight, s = Math.min(bw / pg.w, bh / pg.h) * 0.94;
      cr.s = s; cr.ox = (bw - pg.w * s) / 2; cr.oy = (bh - pg.h * s) / 2;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(pg.w * s * dpr); cv.height = Math.round(pg.h * s * dpr);
      cv.style.width = pg.w * s + 'px'; cv.style.height = pg.h * s + 'px'; cv.style.left = cr.ox + 'px'; cv.style.top = cr.oy + 'px';
      var x = cv.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(pg.img, 0, 0, cv.width, cv.height);
      draw();
    };
    cr.lay = lay; requestAnimationFrame(lay);
  }
  function scr(p) { return [cr.ox + p[0] * cr.s, cr.oy + p[1] * cr.s]; }
  function draw() {
    var svg = $('sc-csvg'), box = $('sc-cbox'); svg.setAttribute('viewBox', '0 0 ' + box.clientWidth + ' ' + box.clientHeight);
    var P = cr.q.map(scr), path = P.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ') + 'Z';
    var W = box.clientWidth, H = box.clientHeight;
    var h = '<path d="M0 0H' + W + 'V' + H + 'H0Z ' + path + '" fill="rgba(10,14,20,.55)" fill-rule="evenodd"/>' +
      '<path d="' + path + '" fill="rgba(0,152,216,.08)" stroke="#22c1ee" stroke-width="2.5" stroke-linejoin="round"/>';
    for (var i = 0; i < 4; i++) {
      var a = P[i], b = P[(i + 1) % 4], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      h += '<circle class="sc-mid" data-e="' + i + '" cx="' + mx + '" cy="' + my + '" r="9" fill="#fff" stroke="#0077c8" stroke-width="2.5"/>';
    }
    P.forEach(function (p, i) { h += '<circle class="sc-h" data-i="' + i + '" cx="' + p[0] + '" cy="' + p[1] + '" r="13" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="3"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" fill="#22c1ee" pointer-events="none"/>'; });
    svg.innerHTML = h;
  }
  function loupe(p, show) {
    var L = $('sc-loupe'); if (!show) { L.hidden = true; return; }
    L.hidden = false; var S = 120, z = 3, x = L.getContext('2d'), pg = cr.pg;
    var sx = p[0] - S / (2 * z * cr.s), sy = p[1] - S / (2 * z * cr.s), sw = S / (z * cr.s);
    L.width = S * 2; L.height = S * 2; x.fillStyle = '#111'; x.fillRect(0, 0, L.width, L.height);
    x.imageSmoothingQuality = 'high'; x.drawImage(pg.img, sx, sy, sw, sw, 0, 0, L.width, L.height);
    x.strokeStyle = '#22c1ee'; x.lineWidth = 2; x.beginPath(); x.moveTo(S, S - 22); x.lineTo(S, S + 22); x.moveTo(S - 22, S); x.lineTo(S + 22, S); x.stroke();
    var sp = scr(p), box = $('sc-cbox'); L.style.left = (sp[0] < box.clientWidth / 2 ? box.clientWidth - S - 14 : 14) + 'px'; L.style.top = '14px';
  }
  function cropEvents() {
    var svg = $('sc-csvg'), drag = null;
    var pos = function (e) { var r = svg.getBoundingClientRect(); return [(e.clientX - r.left - cr.ox) / cr.s, (e.clientY - r.top - cr.oy) / cr.s]; };
    var clamp = function (p) { return [Math.max(0, Math.min(cr.pg.w, p[0])), Math.max(0, Math.min(cr.pg.h, p[1]))]; };
    svg.addEventListener('pointerdown', function (e) {
      var t = e.target, i = t.getAttribute('data-i'), ed = t.getAttribute('data-e');
      if (i == null && ed == null) {
        // grab the nearest corner when the finger lands close to one
        var p = pos(e), best = -1, bd = 1e9; cr.q.forEach(function (c, k) { var d = Math.hypot(c[0] - p[0], c[1] - p[1]) * cr.s; if (d < bd) { bd = d; best = k; } });
        if (bd < 44) i = String(best); else return;
      }
      e.preventDefault(); svg.setPointerCapture(e.pointerId);
      var p0 = pos(e);
      drag = i != null ? { i: +i, off: [cr.q[+i][0] - p0[0], cr.q[+i][1] - p0[1]] } : { e: +ed, p0: p0, a: cr.q[+ed].slice(), b: cr.q[(+ed + 1) % 4].slice() };
      if (drag.i != null) loupe(cr.q[drag.i], true);
    });
    svg.addEventListener('pointermove', function (e) {
      if (!drag) return; e.preventDefault(); var p = pos(e);
      if (drag.i != null) { cr.q[drag.i] = clamp([p[0] + drag.off[0], p[1] + drag.off[1]]); loupe(cr.q[drag.i], true); }
      else { var dx = p[0] - drag.p0[0], dy = p[1] - drag.p0[1]; cr.q[drag.e] = clamp([drag.a[0] + dx, drag.a[1] + dy]); cr.q[(drag.e + 1) % 4] = clamp([drag.b[0] + dx, drag.b[1] + dy]); }
      draw();
    });
    var end = function () { drag = null; loupe(null, false); };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    window.addEventListener('resize', function () { if (cr && !$('sc-crop').hidden) cr.lay(); });
    $('sc-c-auto').onclick = async function () {
      busy(true, 'Finding the page edges…'); await tick();
      var r = null; try { r = E.detect(cr.pg.img); } catch (e) {} busy(false);
      if (r) { cr.q = inset(r.quad, 0.004); cr.autoNow = true; draw(); } else toast('No clear page edge found — drag the corners yourself.');
    };
    $('sc-c-all').onclick = function () { cr.q = whole(cr.pg); cr.autoNow = false; draw(); };
    $('sc-c-cancel').onclick = closeCrop;
    $('sc-c-ok').onclick = async function () {
      var pg = cr.pg, changed = JSON.stringify(cr.q) !== JSON.stringify(pg.quad);
      pg.quad = E.order(cr.q);
      if (changed) { pg.auto = !!cr.autoNow; pg.manual = !cr.autoNow; }
      closeCrop(); busy(true, 'Straightening…'); await tick(); await preview(pg); busy(false); render();
    };
  }
  function closeCrop() { $('sc-crop').hidden = true; document.body.classList.remove('sc-noscroll'); cr = null; }

  // ---------- live camera scanner ----------
  var cam = null;
  async function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { $('sc-capture').click(); return; }
    var m = $('sc-cam'); m.hidden = false; document.body.classList.add('sc-noscroll');
    $('sc-cam-n').textContent = '0'; cam = { n: 0, stop: false };
    try {
      try { cam.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 4096 }, height: { ideal: 3072 } } }); }
      catch (e1) {
        if (e1 && (e1.name === 'NotAllowedError' || e1.name === 'SecurityError')) throw e1;
        cam.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'environment' } });   // simpler request for picky phones
      }
    } catch (e) {
      if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) { closeCamera(); toast('Camera permission is off. Allow the camera for this site in the browser settings, or use “Take photo”.'); return; }
      closeCamera(); toast('The camera could not be opened. Allow camera access, or use “Take photo”.'); return;
    }
    var v = $('sc-video'); v.srcObject = cam.stream; try { await v.play(); } catch (e) {}
    var track = cam.stream.getVideoTracks()[0]; cam.track = track;
    try { if (window.ImageCapture) cam.ic = new ImageCapture(track); } catch (e) {}
    try { var caps = track.getCapabilities ? track.getCapabilities() : {}; $('sc-torch').hidden = !caps.torch; } catch (e) { $('sc-torch').hidden = true; }
    var ov = $('sc-ov'), small = document.createElement('canvas');
    var loop = function () {
      if (!cam || cam.stop) return;
      if (v.videoWidth) {
        var s = Math.min(1, 360 / Math.max(v.videoWidth, v.videoHeight)); small.width = Math.round(v.videoWidth * s); small.height = Math.round(v.videoHeight * s);
        small.getContext('2d').drawImage(v, 0, 0, small.width, small.height);
        var r = null; try { r = E.detect(small, 360, true); } catch (e) {}
        var rw = v.clientWidth, rh = v.clientHeight, vs = Math.max(rw / v.videoWidth, rh / v.videoHeight), ox = (rw - v.videoWidth * vs) / 2, oy = (rh - v.videoHeight * vs) / 2;
        ov.width = rw; ov.height = rh; var x = ov.getContext('2d'); x.clearRect(0, 0, rw, rh);
        if (r) {
          x.beginPath(); r.quad.forEach(function (p, i) { var X = ox + p[0] / s * vs, Y = oy + p[1] / s * vs; if (i) x.lineTo(X, Y); else x.moveTo(X, Y); }); x.closePath();
          x.fillStyle = 'rgba(34,193,238,.18)'; x.fill(); x.lineWidth = 4; x.strokeStyle = '#22c1ee'; x.stroke();
          $('sc-cam-hint').textContent = 'Page found — hold still and tap the button';
        } else $('sc-cam-hint').textContent = 'Point at the document — dark table helps';
      }
      cam.timer = setTimeout(loop, 280);
    };
    loop();
  }
  async function shoot() {
    if (!cam || !cam.stream) return;
    var v = $('sc-video'), blob = null;
    $('sc-shot').disabled = true; $('sc-flash').classList.remove('go'); void $('sc-flash').offsetWidth; $('sc-flash').classList.add('go');
    try { if (cam.ic && cam.ic.takePhoto) blob = await cam.ic.takePhoto(); } catch (e) { blob = null; }   // full camera resolution
    if (!blob) { var c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); blob = await blobOf(c, 'image/jpeg', 0.97); }
    cam.n++; $('sc-cam-n').textContent = String(cam.n);
    $('sc-shot').disabled = false;
    addImage(blob, 'scan ' + (st.pages.length + 1));
  }
  function closeCamera() {
    if (cam) { cam.stop = true; clearTimeout(cam.timer); if (cam.stream) cam.stream.getTracks().forEach(function (t) { t.stop(); }); }
    cam = null; $('sc-cam').hidden = true; document.body.classList.remove('sc-noscroll');
  }

  // ---------- scan straight from the printer (Windows helper on 127.0.0.1) ----------
  var HELPER = 'http://127.0.0.1:47321', pr = { open: false, poll: 0, st: null };
  var WIN = /Windows/i.test(navigator.userAgent) && !MOBILE;
  function prefs(v) { try { if (v) localStorage.setItem('sp-scan-pr', JSON.stringify(v)); else return JSON.parse(localStorage.getItem('sp-scan-pr') || '{}'); } catch (e) { return {}; } }
  async function hFetch(path, opt, ms) {
    var ctl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 2500);
    try { return await fetch(HELPER + path, Object.assign({ cache: 'no-store', signal: ctl && ctl.signal, targetAddressSpace: 'loopback' }, opt || {})); }
    finally { clearTimeout(t); }
  }
  async function helperStatus() {
    try { var r = await hFetch('/status'); if (!r.ok) return null; var j = await r.json(); return j && j.app === 'sprinter-scan' ? j : null; } catch (e) { return null; }
  }
  var NEED = '1.2';
  function older(v, w) { var a = String(v || '0').split('.'), b = String(w).split('.'); for (var i = 0; i < Math.max(a.length, b.length); i++) { var x = +a[i] || 0, y = +b[i] || 0; if (x !== y) return x < y; } return false; }
  function prShow(which) { ['setup', 'nowin', 'ready', 'busy', 'update'].forEach(function (k) { $('sc-pr-' + k).hidden = k !== which; }); }
  function prMsg(t, err) { var m = $('sc-pr-msg'); if (!t) { m.hidden = true; return; } m.hidden = false; m.className = 'sc-pr-msg' + (err ? ' err' : ''); m.textContent = t; }
  function prFill(j) {
    pr.st = j; $('sc-pr-dot').hidden = false;
    var sel = $('sc-pr-dev'), keep = sel.value || prefs().dev;
    sel.innerHTML = '';
    // the same printer often appears twice (Windows Scan + older WIA driver): show it once
    var seen = {};
    (j.scanners || []).forEach(function (d) {
      var key = String(d.name || '').toLowerCase().replace(/\(.*?\)|series|twain|usb|wia|escl/g, '').replace(/[^a-z0-9]/g, '');
      if (key && seen[key]) return; seen[key] = 1;
      var o = document.createElement('option'); o.value = d.id; o.textContent = (d.name || 'Scanner').replace(/\s*\((USB|WIA)\)\s*$/i, ''); sel.appendChild(o);
    });
    if (keep && [].some.call(sel.options, function (o) { return o.value === keep; })) sel.value = keep;
    $('sc-pr-startup').checked = !!j.startup;
    var none = !(j.scanners || []).length;
    $('sc-pr-go').disabled = none;
    if (j.error) prMsg(j.error, true);
    else if (none) prMsg('No scanner found. Turn the printer on and make sure it shows in Windows Settings → Bluetooth & devices → Printers & scanners. This list updates by itself.', true);
    else if (!$('sc-pr-msg').dataset.keep) prMsg('');
  }
  async function prTick() {
    if (!pr.open) return;
    if ($('sc-pr-busy').hidden) {
      var j = await helperStatus();
      if (!pr.open) return;
      if (j && older(j.version, NEED)) {
        // old helper: newer ones update themselves, 1.0 has to be downloaded once more
        if (!older(j.version, '1.1')) { if (!pr.updating) { pr.updating = true; prShow('update'); $('sc-pr-upd-txt').textContent = 'Updating the scanner helper…'; hFetch('/update', { method: 'POST' }, 30000).catch(function () {}); } }
        else prShow('update');
      } else if (j) { pr.updating = false; if ($('sc-pr-ready').hidden) prShow('ready'); prFill(j); }
      else { $('sc-pr-dot').hidden = true; if (WIN) prShow('setup'); else prShow('nowin'); }
    }
    pr.poll = setTimeout(prTick, pr.st ? 4000 : 1500);
  }
  function openPrinter() {
    pr.open = true; $('sc-pr').hidden = false; prMsg(''); $('sc-pr-msg').dataset.keep = '';
    var p = prefs();
    if (p.dpi) seg2('sc-pr-dpi', p.dpi); if (p.mode) seg2('sc-pr-mode', p.mode); if (p.src) seg2('sc-pr-src', p.src);
    prShow(WIN ? 'setup' : 'nowin');
    clearTimeout(pr.poll); prTick();
  }
  function closePrinter() { pr.open = false; clearTimeout(pr.poll); $('sc-pr').hidden = true; }
  function seg2(id, v) { [].forEach.call(document.querySelectorAll('#' + id + ' [data-v]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === String(v))); }); }
  function segVal(id) { var b = document.querySelector('#' + id + ' [aria-pressed=true]'); return b ? b.getAttribute('data-v') : ''; }
  async function prScan() {
    var dev = $('sc-pr-dev').value, dpi = segVal('sc-pr-dpi') || '300', mode = segVal('sc-pr-mode') || 'color', src = segVal('sc-pr-src') || 'flatbed';
    prefs({ dev: dev, dpi: dpi, mode: mode, src: src });
    prMsg(''); prDetails(null); prShow('busy');
    var t0 = Date.now(), tm = setInterval(function () { $('sc-pr-sec').textContent = Math.round((Date.now() - t0) / 1000) + ' s'; }, 1000); $('sc-pr-sec').textContent = '0 s';
    try {
      var r = await hFetch('/scan?id=' + encodeURIComponent(dev) + '&dpi=' + dpi + '&mode=' + mode + '&source=' + src, {}, 240000);
      var j = await r.json();
      if (!r.ok || !j.ok) { var er = new Error(j.error || 'The scan did not work.'); er.tries = j.tries; throw er; }
      var n = 0;
      for (var i = 0; i < j.pages.length; i++) {
        var pr2 = await hFetch('/page?t=' + encodeURIComponent(j.pages[i]), {}, 60000);
        if (!pr2.ok) continue;
        var blob = await pr2.blob();
        busy(true, 'Finding the page edges…');
        await addImage(blob, 'scan ' + (st.pages.length + 1));
        busy(false); n++;
      }
      clearInterval(tm); prShow('ready');
      $('sc-pr-msg').dataset.keep = '1';
      prMsg(n ? (n === 1 ? 'Page added ✓  Put the next page on the scanner and press Scan again, or press Done.' : n + ' pages added ✓') : 'Nothing came back from the scanner. Try again.', !n);
      setTimeout(function () { $('sc-pr-msg').dataset.keep = ''; }, 8000);
    } catch (e) {
      clearInterval(tm); busy(false); prShow('ready');
      prDetails(e && e.tries);
      var tr = (e && e.tries) || [];
      if (tr.length && tr.every(function (t) { return !t.ok && /offline|could not talk|driver|did not answer/i.test(t.error || ''); })) {
        e = new Error('Windows can’t talk to the scanner part of the printer right now (its HP scanner driver reports “offline / no communication”). Press “Repair Windows scanning” below and choose Yes. If it still fails: turn the printer off and on, plug the USB cable straight into the computer (another port), wait 30 seconds and press Scan again.');
      }
      var m = e && e.name === 'AbortError' ? 'The scanner took too long. Check it and try again.' : (e && e.message) || 'The scan did not work.';
      if (/Failed to fetch|NetworkError|Load failed/i.test(m)) m = 'The scanner helper stopped. Open SPrinter-Scanner again.';
      $('sc-pr-msg').dataset.keep = '1'; prMsg(m, true); setTimeout(function () { $('sc-pr-msg').dataset.keep = ''; }, 8000);
    }
  }
  // what was tried, so a problem can be seen and fixed
  function prDetails(tries) {
    var d = $('sc-pr-det'), fix = $('sc-pr-fix');
    if (!tries || !tries.length) { d.hidden = true; fix.hidden = true; return; }
    d.hidden = false;
    $('sc-pr-det-list').innerHTML = tries.map(function (t) { return '<li class="' + (t.ok ? 'ok' : 'no') + '"><b>' + String(t.way || '').replace(/[<>&]/g, '') + '</b>' + (t.ok ? ' — worked' : ' — ' + String(t.error || '').replace(/[<>&]/g, '') + (t.code ? ' <code>' + t.code + '</code>' : '')) + '</li>'; }).join('');
    fix.hidden = !tries.some(function (t) { return !t.ok && /offline|driver|exception|not available|did not answer/i.test(t.error || ''); });
  }
  function prInit() {
    $('sc-pr-cam').onclick = function () { closePrinter(); openCamera(); };
    $('sc-pr-fix').onclick = async function () {
      try { await hFetch('/repair', { method: 'POST' }, 15000); prMsg('Windows will ask for permission. Choose Yes, wait 10 seconds, then press Scan again.', false); $('sc-pr-msg').dataset.keep = '1'; }
      catch (e) { prMsg('Could not start the repair.', true); }
    };
    $('sc-open-pr').onclick = openPrinter;
    $('sc-pr-x').onclick = closePrinter; $('sc-pr-done').onclick = closePrinter;
    $('sc-pr').addEventListener('click', function (e) { if (e.target === $('sc-pr') && $('sc-pr-busy').hidden) closePrinter(); });
    ['sc-pr-dpi', 'sc-pr-mode', 'sc-pr-src'].forEach(function (id) { [].forEach.call(document.querySelectorAll('#' + id + ' [data-v]'), function (b) { b.onclick = function () { seg2(id, b.getAttribute('data-v')); }; }); });
    $('sc-pr-go').onclick = prScan;
    $('sc-pr-startup').addEventListener('change', async function () {
      var on = this.checked;
      try { var r = await hFetch('/startup?on=' + (on ? '1' : '0'), { method: 'POST' }, 8000); var j = await r.json(); this.checked = !!j.startup; toast(j.startup ? 'The helper will start with Windows.' : 'The helper will no longer start with Windows.'); }
      catch (e) { this.checked = !on; toast('Could not change that setting.'); }
    });
    // show "Connected" on the button when the helper is already running
    if (WIN) helperStatus().then(function (j) { if (j) $('sc-pr-dot').hidden = false; });
  }

  // ---------- output ----------
  var PAPER = { a4: [595.28, 841.89], letter: [612, 792] };
  // encode a page; with a size limit, quality first goes down a little, then the resolution
  async function encode(c, budget) {
    if (!budget) return await blobOf(c, 'image/jpeg', 0.95);
    var cur = c, best = null;
    for (var round = 0; round < 7; round++) {
      var lo = 0.5, hi = 0.93, okB = null;
      var top = await blobOf(cur, 'image/jpeg', hi); if (top.size <= budget) return top;
      for (var k = 0; k < 6; k++) { var q = (lo + hi) / 2, b = await blobOf(cur, 'image/jpeg', q); if (b.size <= budget) { okB = b; lo = q; } else hi = q; }
      if (okB && lo >= 0.68) return okB;
      best = okB || best;
      var low = await blobOf(cur, 'image/jpeg', 0.68), f = Math.sqrt(budget / low.size) * 0.97;
      if (f >= 1) return low;
      var n = document.createElement('canvas'); n.width = Math.max(64, Math.round(cur.width * f)); n.height = Math.max(64, Math.round(cur.height * f));
      var x = n.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(cur, 0, 0, n.width, n.height); cur = n;
    }
    return best || await blobOf(cur, 'image/jpeg', 0.5);
  }
  async function fullPages(budgetEach, label) {
    var out = [];
    for (var i = 0; i < st.pages.length; i++) {
      busy(true, (label || 'Making') + ' page ' + (i + 1) + ' of ' + st.pages.length + '…'); await tick();
      var c = build(st.pages[i], { maxArea: MAXAREA });
      var b = await encode(c, budgetEach);
      out.push({ blob: b, w: c.width, h: c.height }); c.width = c.height = 1;
    }
    return out;
  }
  async function makePdf(noLimit) {
    var PL = await window.SPPdfLib(), T = noLimit ? 0 : st.target, n = st.pages.length;
    var each = T ? Math.max(8000, (T - 3000 - n * 900) / n) : 0;
    var imgs = await fullPages(each, 'Making');
    busy(true, 'Putting the PDF together…');
    var doc = await PL.PDFDocument.create();
    for (var i = 0; i < imgs.length; i++) {
      var im = await doc.embedJpg(new Uint8Array(await imgs[i].blob.arrayBuffer())), land = im.width > im.height, pw, ph;
      if (st.paper === 'same') { var long = 841.89, sc = long / Math.max(im.width, im.height); pw = im.width * sc; ph = im.height * sc; }
      else { var P = PAPER[st.paper] || PAPER.a4; pw = land ? P[1] : P[0]; ph = land ? P[0] : P[1]; }
      var page = doc.addPage([pw, ph]), f = Math.min(pw / im.width, ph / im.height), w = im.width * f, h = im.height * f;
      page.drawImage(im, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    }
    doc.setTitle('Scanned document'); doc.setCreator('S Printer'); doc.setProducer('S Printer');
    return await doc.save();
  }
  function save(blob, name) { var u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 60000); }
  function stamp() { var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()); }
  function result(text, over) { var r = $('sc-result'); r.hidden = false; r.className = 'sc-result' + (over ? ' over' : ''); r.textContent = text; }
  async function doPdf() {
    if (!st.pages.length) return;
    try {
      var bytes = await makePdf(); busy(false);
      save(new Blob([bytes], { type: 'application/pdf' }), 'Scan-' + stamp() + '.pdf');
      var over = st.target && bytes.length > st.target;
      result('PDF saved · ' + st.pages.length + (st.pages.length > 1 ? ' pages' : ' page') + ' · ' + fmt(bytes.length) + (st.target ? (over ? ' (smallest possible — still above ' + fmt(st.target) + ')' : ' (limit ' + fmt(st.target) + ')') : ''), over);
    } catch (e) { busy(false); toast('Could not make the PDF.'); try { console.warn(e); } catch (_) {} }
  }
  async function doJpg() {
    if (!st.pages.length) return;
    try {
      var imgs = await fullPages(st.target || 0, 'Saving');
      if (imgs.length === 1) { save(imgs[0].blob, 'Scan-' + stamp() + '.jpg'); busy(false); result('JPG saved · ' + imgs[0].w + ' × ' + imgs[0].h + ' px · ' + fmt(imgs[0].blob.size)); return; }
      busy(true, 'Packing the pictures…');
      if (!window.JSZip) await new Promise(function (r, j) { var s = document.createElement('script'); s.src = '../assets/vendor/jszip.min.js'; s.onload = r; s.onerror = j; document.head.appendChild(s); });
      var z = new JSZip(), tot = 0; imgs.forEach(function (im, i) { z.file('Scan-page-' + (i + 1) + '.jpg', im.blob); tot += im.blob.size; });
      var zb = await z.generateAsync({ type: 'blob', compression: 'STORE' }); busy(false);
      save(zb, 'Scan-' + stamp() + '.zip'); result(imgs.length + ' JPG pages saved (ZIP) · ' + fmt(tot) + (st.target ? ' · up to ' + fmt(st.target) + ' each' : ''));
    } catch (e) { busy(false); toast('Could not save the pictures.'); }
  }
  async function printImages() {
    var imgs = await fullPages(0, 'Preparing'); busy(false);
    var f = document.createElement('iframe'); f.style.cssText = 'position:fixed;width:1px;height:1px;left:-9999px;border:0'; document.body.appendChild(f);
    var land = false, urls = imgs.map(function (im) { if (im.w > im.h) land = true; return URL.createObjectURL(im.blob); });
    var size = st.paper === 'letter' ? 'letter' : 'A4';
    f.contentDocument.write('<!doctype html><html><head><style>@page{size:' + size + ';margin:0}html,body{margin:0}div{width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;page-break-after:always;break-after:page}img{max-width:100%;max-height:100%}</style></head><body>' +
      urls.map(function (u) { return '<div><img src="' + u + '"></div>'; }).join('') + '</body></html>');
    f.contentDocument.close();
    var ims = [].slice.call(f.contentDocument.images); await Promise.all(ims.map(function (i) { return i.decode ? i.decode().catch(function () {}) : null; }));
    f.contentWindow.focus(); f.contentWindow.print();
    setTimeout(function () { f.remove(); urls.forEach(URL.revokeObjectURL); }, 120000);
  }
  async function doPrint(skip) {
    if (!st.pages.length) return;
    var mk = async function () { try { return await makePdf(true); } finally { busy(false); } };
    if (window.SPMobilePrint && skip !== true) { window.SPMobilePrint(mk, function () { doPrint(true); }, 'Scan-' + stamp()); return; }
    try {
      if (!MOBILE && window.SPPrintPdf) { var b = await mk(); if (b && await window.SPPrintPdf(b)) return; }
      await printImages();
    } catch (e) { busy(false); toast('Could not print.'); }
  }

  // ---------- settings ----------
  function seg(groupId, key, after) {
    [].forEach.call(document.querySelectorAll('#' + groupId + ' [data-v]'), function (b) {
      b.onclick = function () {
        [].forEach.call(document.querySelectorAll('#' + groupId + ' [data-v]'), function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        st[key] = b.getAttribute('data-v'); if (after) after();
      };
    });
  }
  function setTarget(kb) {
    st.target = kb > 0 ? Math.round(kb * 1024) : 0;
    [].forEach.call(document.querySelectorAll('#sc-size [data-kb]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-kb') === kb)); });
    $('sc-kb').value = kb > 0 ? kb : '';
  }

  function init() {
    if (!E) return;
    $('sc-file').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    $('sc-capture').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    $('sc-open-cam').onclick = openCamera;
    prInit();
    $('sc-shot').onclick = shoot; $('sc-cam-done').onclick = closeCamera; $('sc-cam-x').onclick = closeCamera;
    $('sc-torch').onclick = function () { if (!cam || !cam.track) return; cam.torch = !cam.torch; cam.track.applyConstraints({ advanced: [{ torch: cam.torch }] }).catch(function () {}); this.setAttribute('aria-pressed', String(cam.torch)); };
    var drop = $('sc-drop');
    ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
    drop.addEventListener('drop', function (e) { addFiles(e.dataTransfer.files); });
    document.addEventListener('paste', function (e) { var f = [].slice.call((e.clipboardData && e.clipboardData.files) || []); if (f.length) addFiles(f); });
    $('sc-auto').addEventListener('change', function () { st.auto = this.checked; });
    seg('sc-mode', 'mode', refreshAll);
    seg('sc-paper', 'paper');
    [].forEach.call(document.querySelectorAll('#sc-size [data-kb]'), function (b) { b.onclick = function () { setTarget(+b.getAttribute('data-kb')); }; });
    $('sc-kb').addEventListener('input', function () { var v = parseFloat(this.value); st.target = v > 0 ? Math.round(v * 1024) : 0; [].forEach.call(document.querySelectorAll('#sc-size [data-kb]'), function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-kb') === v || (!(v > 0) && b.getAttribute('data-kb') === '0'))); }); });
    $('sc-pdf').onclick = doPdf; $('sc-jpg').onclick = doJpg; $('sc-print').onclick = function () { doPrint(); };
    $('sc-clear').onclick = function () { st.pages = []; render(); $('sc-result').hidden = true; };
    cropEvents(); render();
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (cr) closeCrop(); else if (cam) closeCamera(); else if (pr.open && $('sc-pr-busy').hidden) closePrinter(); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.SPScan = { st: st, addFiles: addFiles };
})();
