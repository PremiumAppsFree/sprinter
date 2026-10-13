/* S Printer — AI photo enhancer page: live studio animation, background preloading,
   a time budget so a photo finishes in about a minute, HD finish. */
(function () {
  'use strict';
  var E = window.SPEnhance, $ = function (id) { return document.getElementById(id); };
  var SMALL = !!window.SPIsMobile || (navigator.deviceMemory && navigator.deviceMemory < 4);
  var SAVE = !!(navigator.connection && navigator.connection.saveData);
  var st = { file: null, src: null, model: 'auto', size: '4k', face: true, strength: 0.9, finish: true, out: null, busy: false };
  var prep = null;   // background preparation of the AI

  function toast(m) { var t = $('en-toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 4500); }
  function seg(id, key) {
    [].forEach.call(document.querySelectorAll('#' + id + ' [data-v]'), function (b) {
      b.onclick = function () { [].forEach.call(document.querySelectorAll('#' + id + ' [data-v]'), function (o) { o.setAttribute('aria-pressed', String(o === b)); }); st[key] = b.getAttribute('data-v'); };
    });
  }
  var RING = 2 * Math.PI * 15.5;
  function progress(stage, frac, detail) {
    var p = Math.round(Math.max(0, Math.min(1, frac)) * 100);
    $('en-stage').textContent = stage; $('en-detail').textContent = detail || '';
    $('en-pct').textContent = p + '%'; $('en-ringp').style.strokeDashoffset = String(RING * (1 - p / 100));
  }
  function srKey(be) { if (st.model !== 'auto') return st.model; return be === 'webgpu' && !SMALL ? 'max' : 'balanced'; }

  // ---------- get the AI ready in the background (no waiting later) ----------
  function prepare() {
    if (prep) return prep;
    prep = (async function () {
      var be = await E.pickBackend();
      await E.load('sr-' + srKey(be), [E.SR[srKey(be)].file]);
      await E.load('det', ['face-detect.onnx']);
      if (!SAVE || await E.isCached(E.FACE_FILES)) await E.load('face', E.FACE_FILES);
      $('en-engine').textContent = 'AI ready · ' + (E.backend() === 'webgpu' ? 'using the graphics card' : 'using the processor');
      return true;
    })().catch(function (e) { prep = null; throw e; });
    return prep;
  }

  // ---------- studio view ----------
  var view = { k: 1, base: null, sharp: null };
  function showStudio(src) {
    var box = $('en-stage-box'), maxW = Math.min(box.parentElement.clientWidth || 900, 980), maxH = Math.min(window.innerHeight * 0.68, 720);
    var k = Math.min(maxW / src.width, maxH / src.height, 1.6), dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.round(src.width * k), h = Math.round(src.height * k);
    ['en-base', 'en-sharp'].forEach(function (id) { var c = $(id); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.style.width = w + 'px'; c.style.height = h + 'px'; });
    box.style.width = w + 'px'; box.style.height = h + 'px';
    var bx = $('en-base').getContext('2d'); bx.imageSmoothingQuality = 'high'; bx.drawImage(src, 0, 0, $('en-base').width, $('en-base').height);
    $('en-sharp').getContext('2d').clearRect(0, 0, $('en-sharp').width, $('en-sharp').height);
    view.k = $('en-base').width / src.width; view.css = k;
    $('en-faces').innerHTML = ''; sparkles();
    $('en-studio').hidden = false; box.className = 'en-stage';
  }
  function sparkles() {
    var s = $('en-spark'); s.innerHTML = '';
    for (var i = 0; i < 26; i++) { var e = document.createElement('i'); e.style.left = (Math.random() * 100) + '%'; e.style.top = (Math.random() * 100) + '%'; e.style.animationDelay = (Math.random() * 3) + 's'; e.style.setProperty('--s', (0.5 + Math.random() * 0.9).toFixed(2)); s.appendChild(e); }
  }
  // a finished part of the picture appears sharp on the stage
  function paintTile(tile, rect, inScale) {
    if (!tile) return;
    var c = $('en-sharp'), x = c.getContext('2d'), k = view.k / inScale;
    x.imageSmoothingQuality = 'high'; x.drawImage(tile, rect.x * k, rect.y * k, rect.w * k, rect.h * k);
  }
  function faceRings(faces, inScale) {
    var f = $('en-faces'); f.innerHTML = '';
    faces.forEach(function (fc, i) {
      var r = document.createElement('i'), k = view.css / inScale, b = fc.box, pad = 0.18 * (b[2] - b[0]);
      r.style.left = ((b[0] - pad) * k) + 'px'; r.style.top = ((b[1] - pad) * k) + 'px';
      r.style.width = ((b[2] - b[0] + 2 * pad) * k) + 'px'; r.style.height = ((b[3] - b[1] + 2 * pad) * k) + 'px';
      r.style.animationDelay = (i * 0.12) + 's'; f.appendChild(r);
    });
  }
  function paintFace(big, face, inScale, i) {
    var b = face.box, w = b[2] - b[0], pad = 0.35 * w, x0 = Math.max(0, b[0] - pad), y0 = Math.max(0, b[1] - pad), x1 = b[2] + pad, y1 = b[3] + pad;
    var c = $('en-sharp'), x = c.getContext('2d'), k = view.k / inScale, s = 4;
    x.imageSmoothingQuality = 'high'; x.drawImage(big, x0 * s, y0 * s, (x1 - x0) * s, (y1 - y0) * s, x0 * k, y0 * k, (x1 - x0) * k, (y1 - y0) * k);
    var ring = $('en-faces').children[i]; if (ring) ring.classList.add('done');
  }

  async function loadFile(f) {
    if (!f || (!/^image\//.test(f.type) && !/\.(jpe?g|png|webp|bmp|gif|avif)$/i.test(f.name))) { toast('Choose a JPG, PNG or WebP photo.'); return; }
    var bmp;
    try { bmp = await createImageBitmap(f, { imageOrientation: 'from-image' }); }
    catch (e) { try { bmp = await createImageBitmap(f); } catch (e2) { toast('This photo could not be opened. Save it as JPG or PNG.'); return; } }
    var c = E.canvas(bmp.width, bmp.height); c.getContext('2d').drawImage(bmp, 0, 0);
    st.src = c; st.file = f;
    $('en-orig').hidden = false; $('en-orig-img').src = URL.createObjectURL(f);
    $('en-orig-info').textContent = bmp.width + ' × ' + bmp.height + ' px';
    $('en-go').disabled = false; $('en-result').hidden = true;
    showStudio(c); progress('Ready to enhance', 0, ''); $('en-stage-box').classList.add('idle');
    prepare().catch(function () {});
  }

  async function run() {
    if (!st.src || st.busy) return;
    st.busy = true; $('en-go').disabled = true; $('en-result').hidden = true;
    var t0 = performance.now(), src = st.src;
    showStudio(src); var box = $('en-stage-box'); box.className = 'en-stage working';
    $('en-studio').scrollIntoView({ behavior: 'smooth', block: 'center' });
    try {
      progress('Getting the AI ready…', 0.02);
      var be = await E.pickBackend(), key = srKey(be);
      var waiting = setInterval(function () { var p = +$('en-pct').textContent.replace('%', '') || 2; if (p < 9) progress('Getting the AI ready…', (p + 1) / 100); }, 900);
      try { await prepare(); } catch (e) { await E.load('sr-' + key, [E.SR[key].file]); }
      clearInterval(waiting);
      if (st.model === 'auto') key = srKey(E.backend());
      await E.load('sr-' + key, [E.SR[key].file]);

      // size the job so it finishes in about a minute on this device
      progress('Measuring this device…', 0.1);
      var msPx = await E.speed(key), gpu = E.backend() === 'webgpu';
      var budget = (gpu ? 22 : 30) * 1000, maxPx = budget / (msPx * 1.3);
      var capSide = gpu ? (SMALL ? 1100 : 1800) : (SMALL ? 720 : 1100);
      var area = src.width * src.height, inArea = Math.min(area, maxPx, capSide * capSide * 0.75);
      var k = Math.min(1, Math.sqrt(inArea / area));
      if (Math.max(src.width, src.height) * k < 320) k = Math.min(1, 320 / Math.max(src.width, src.height));
      var input = k < 0.999 ? E.resize(src, Math.round(src.width * k), Math.round(src.height * k)) : src;

      var faces = [];
      if (st.face) {
        progress('Finding faces…', 0.13);
        await E.load('det', ['face-detect.onnx']);
        faces = (await E.findFaces(input)).sort(function (a, b) { return (b.box[2] - b.box[0]) - (a.box[2] - a.box[0]); }).slice(0, 10);
        faceRings(faces, k);
      }

      box.classList.add('pass');
      var big = await E.upscale(input, key, function (n, tot, tile, rect) { paintTile(tile, rect, k); progress('Enhancing details…', 0.15 + 0.55 * n / tot, ''); });
      box.classList.remove('pass');

      if (faces.length) {
        progress('Restoring faces…', 0.72);
        box.classList.add('faces');
        await E.load('face', E.FACE_FILES, function (l, t) { progress('Getting the face AI ready…', 0.7 + 0.04 * l / t, ''); });
        var tf = performance.now(), faceBudget = Math.max(gpu ? 20000 : 15000, 58000 - (tf - t0)), done = 0;   // whatever is left of about a minute
        await E.restoreFaces(big, faces, 4, st.strength, function (n, tot, fc) {
          paintFace(big, fc, k, n - 1); done = n;
          progress('Restoring faces…', 0.72 + 0.2 * n / tot, tot > 1 ? n + ' of ' + tot : '');
          var per = (performance.now() - tf) / n;
          return n < 2 || (performance.now() - tf) + per <= faceBudget;   // the two largest always; more while time allows
        }, src, 1 / k);
        faces = faces.slice(0, done);
        box.classList.remove('faces');
      }

      progress('HD finish…', 0.94);
      var want = st.size === '4k' ? 3840 : Math.round(Math.max(src.width, src.height) * (+st.size));
      var bl = Math.max(big.width, big.height), f = want / bl;
      var out = Math.abs(f - 1) < 0.002 ? big : E.resize(big, Math.round(big.width * f), Math.round(big.height * f));
      if (st.finish) E.finish(out, 1);
      st.out = out;
      var blob = await new Promise(function (r) { out.toBlob(r, 'image/png'); });
      if (st.afterUrl) URL.revokeObjectURL(st.afterUrl);
      st.afterUrl = URL.createObjectURL(blob); st.png = blob;
      progress('Done', 1, ''); box.className = 'en-stage done';
      var full = $('en-sharp').getContext('2d'); full.imageSmoothingQuality = 'high'; full.drawImage(out, 0, 0, $('en-sharp').width, $('en-sharp').height);
      await new Promise(function (r) { setTimeout(r, 1100); });
      $('en-after').src = st.afterUrl; $('en-before').src = $('en-orig-img').src;
      var secs = Math.round((performance.now() - t0) / 1000);
      $('en-res-info').textContent = src.width + ' × ' + src.height + '  →  ' + out.width + ' × ' + out.height + ' px' + (faces.length ? ' · ' + faces.length + (faces.length > 1 ? ' faces restored' : ' face restored') : '') + ' · ' + secs + ' s';
      $('en-studio').hidden = true; $('en-result').hidden = false; setCompare(50);
      $('en-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      box.className = 'en-stage idle';
      var m = (e && e.message) || String(e);
      if (/memory|allocation|Out of/i.test(m)) m = 'This device ran out of memory. Choose “2× bigger”, or use a smaller photo.';
      progress('Could not finish', 0, ''); toast(m); try { console.error(e); } catch (_) {}
    } finally { st.busy = false; $('en-go').disabled = !st.src; }
  }

  // ---------- before / after ----------
  function setCompare(p) {
    p = Math.max(0, Math.min(100, p));
    $('en-before-wrap').style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
    $('en-handle').style.left = p + '%'; $('en-handle').setAttribute('aria-valuenow', Math.round(p));
  }
  function compareEvents() {
    var box = $('en-compare'), drag = false;
    var at = function (e) { var r = box.getBoundingClientRect(); setCompare((e.clientX - r.left) / r.width * 100); };
    box.addEventListener('pointerdown', function (e) { drag = true; box.setPointerCapture(e.pointerId); at(e); });
    box.addEventListener('pointermove', function (e) { if (drag) at(e); });
    box.addEventListener('pointerup', function () { drag = false; });
    $('en-handle').addEventListener('keydown', function (e) { var v = +this.getAttribute('aria-valuenow'); if (e.key === 'ArrowLeft') setCompare(v - 5); if (e.key === 'ArrowRight') setCompare(v + 5); });
    $('en-zoom').addEventListener('change', function () { box.classList.toggle('zoom', this.checked); });
  }
  function save(blob, ext) {
    var base = (st.file && st.file.name.replace(/\.[^.]+$/, '')) || 'photo';
    var u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = base + '-enhanced.' + ext; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
  }

  window.SPEnhanceOnReload = function () { try { sessionStorage.setItem('sp-enh-reloaded', '1'); } catch (e) {} };
  function init() {
    if (!E || !window.ort) { toast('The AI could not load in this browser.'); return; }
    try { if (sessionStorage.getItem('sp-enh-reloaded')) { sessionStorage.removeItem('sp-enh-reloaded'); setTimeout(function () { toast('The AI restarted in safe mode for this device. Add the photo again and press Enhance.'); }, 600); } } catch (e) {}
    $('en-file').addEventListener('change', function (e) { loadFile(e.target.files[0]); e.target.value = ''; });
    var drop = $('en-drop');
    ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
    drop.addEventListener('drop', function (e) { loadFile(e.dataTransfer.files[0]); });
    document.addEventListener('paste', function (e) { var f = (e.clipboardData && e.clipboardData.files || [])[0]; if (f) loadFile(f); });
    seg('en-model', 'model'); seg('en-size', 'size');
    $('en-face').addEventListener('change', function () { st.face = this.checked; $('en-strength-row').hidden = !st.face; });
    $('en-finish').addEventListener('change', function () { st.finish = this.checked; });
    $('en-strength').addEventListener('input', function () { st.strength = this.value / 100; $('en-strength-v').textContent = this.value + '%'; });
    $('en-go').onclick = run;
    $('en-png').onclick = function () { if (st.png) save(st.png, 'png'); };
    $('en-jpg').onclick = function () { if (st.out) st.out.toBlob(function (b) { save(b, 'jpg'); }, 'image/jpeg', 0.95); };
    $('en-again').onclick = function () { $('en-result').hidden = true; if (st.src) { showStudio(st.src); $('en-stage-box').classList.add('idle'); progress('Ready to enhance', 0, ''); } window.scrollTo({ top: 0, behavior: 'smooth' }); };
    compareEvents();
    $('en-engine').textContent = 'Preparing the AI in the background…';
    // start preparing as soon as the page is idle, so pressing Enhance starts at once
    var go = function () { prepare().catch(function () { $('en-engine').textContent = 'The AI will load when you press Enhance.'; }); };
    if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.SPEnh = st;
})();
