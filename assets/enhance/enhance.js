/* S Printer — AI photo enhancer page */
(function () {
  'use strict';
  var E = window.SPEnhance, $ = function (id) { return document.getElementById(id); };
  var SMALL = !!window.SPIsMobile || (navigator.deviceMemory && navigator.deviceMemory < 4);
  var st = { file: null, src: null, model: 'balanced', size: '4k', face: true, strength: 0.8, out: null, busy: false };

  function toast(m) { var t = $('en-toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 4000); }
  function fmtMB(b) { return (b / 1048576).toFixed(b > 10485760 ? 0 : 1) + ' MB'; }
  function seg(id, key, cb) {
    [].forEach.call(document.querySelectorAll('#' + id + ' [data-v]'), function (b) {
      b.onclick = function () { [].forEach.call(document.querySelectorAll('#' + id + ' [data-v]'), function (o) { o.setAttribute('aria-pressed', String(o === b)); }); st[key] = b.getAttribute('data-v'); if (cb) cb(); };
    });
  }
  function progress(stage, frac, detail) {
    $('en-stage').textContent = stage; $('en-detail').textContent = detail || '';
    $('en-bar').style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%';
  }

  async function loadFile(f) {
    if (!f || !/^image\//.test(f.type) && !/\.(jpe?g|png|webp|bmp|gif|avif)$/i.test(f.name)) { toast('Choose a JPG, PNG or WebP photo.'); return; }
    var bmp;
    try { bmp = await createImageBitmap(f, { imageOrientation: 'from-image' }); }
    catch (e) { try { bmp = await createImageBitmap(f); } catch (e2) { toast('This photo could not be opened. Save it as JPG or PNG.'); return; } }
    var c = E.canvas(bmp.width, bmp.height); c.getContext('2d').drawImage(bmp, 0, 0);
    st.src = c; st.file = f;
    $('en-orig').hidden = false; $('en-orig-img').src = URL.createObjectURL(f);
    $('en-orig-info').textContent = bmp.width + ' × ' + bmp.height + ' px · ' + fmtMB(f.size);
    $('en-go').disabled = false; $('en-result').hidden = true;
  }

  // how big a picture this device can enhance in one go
  function limits(be, model) {
    var gpu = be === 'webgpu';
    if (model === 'max') return gpu ? (SMALL ? 640 : 1000) : (SMALL ? 360 : 520);
    return gpu ? (SMALL ? 1000 : 1700) : (SMALL ? 640 : 900);
  }

  async function run() {
    if (!st.src || st.busy) return;
    st.busy = true; $('en-go').disabled = true; $('en-work').hidden = false; $('en-result').hidden = true;
    var t0 = performance.now();
    try {
      progress('Preparing the AI…', 0.02);
      var be = await E.pickBackend();
      $('en-engine').textContent = be === 'webgpu' ? 'Running on the graphics card (fast).' : 'Running on the processor' + (window.ort && ort.env.wasm.numThreads > 1 ? ' (all cores)' : '') + '. A graphics card would be faster.';
      var src = st.src, L = Math.max(src.width, src.height);
      var want = st.size === '4k' ? 3840 : Math.round(L * (+st.size));
      var capIn = limits(be, st.model), inL = Math.min(L, capIn);
      if (want > inL * 4 * 1.0001 && st.size !== '4k') want = Math.min(want, inL * 4);   // can't promise more than the AI made
      var k = inL / L, input = k < 1 ? E.resize(src, Math.round(src.width * k), Math.round(src.height * k)) : src;

      // download models (first time only)
      var srInfo = E.SR[st.model];
      progress('Loading the picture AI…', 0.04, srInfo.mb + ' MB, first time only');
      await E.load('sr-' + st.model, [srInfo.file], function (l, t) { progress('Downloading the picture AI…', 0.04 + 0.08 * l / t, fmtMB(l) + ' of ' + fmtMB(t) + ' (first time only)'); });

      var faces = [];
      if (st.face) {
        progress('Looking for faces…', 0.12);
        await E.load('det', ['face-detect.onnx']);
        faces = await E.findFaces(input);
        faces = faces.sort(function (a, b) { return (b.box[2] - b.box[0]) - (a.box[2] - a.box[0]); }).slice(0, 8);
      }

      progress('Enhancing the picture…', 0.14, '');
      var big = await E.upscale(input, st.model, function (n, tot) { progress('Enhancing the picture…', 0.14 + 0.56 * n / tot, 'part ' + n + ' of ' + tot); });

      if (faces.length) {
        var cached = await E.isCached(E.FACE_FILES);
        progress(cached ? 'Loading the face AI…' : 'Downloading the face AI…', 0.72, cached ? '' : E.FACE_MB + ' MB, first time only');
        await E.load('face', E.FACE_FILES, function (l, t) { progress('Downloading the face AI…', 0.72 + 0.12 * l / t, fmtMB(l) + ' of ' + fmtMB(t) + ' (first time only)'); });
        await E.restoreFaces(big, faces, 4, st.strength, function (n, tot) { progress('Restoring faces…', 0.84 + 0.1 * n / tot, 'face ' + n + ' of ' + tot); });
      }

      progress('Finishing…', 0.96);
      var bl = Math.max(big.width, big.height), outL = want, f = outL / bl;
      var out = Math.abs(f - 1) < 0.002 ? big : E.resize(big, Math.round(big.width * f), Math.round(big.height * f));
      st.out = out;
      var blob = await new Promise(function (r) { out.toBlob(r, 'image/png'); });
      if (st.afterUrl) URL.revokeObjectURL(st.afterUrl);
      st.afterUrl = URL.createObjectURL(blob); st.png = blob;
      $('en-after').src = st.afterUrl; $('en-before').src = $('en-orig-img').src;
      var secs = Math.round((performance.now() - t0) / 1000);
      $('en-res-info').textContent = src.width + ' × ' + src.height + '  →  ' + out.width + ' × ' + out.height + ' px' + (faces.length ? ' · ' + faces.length + (faces.length > 1 ? ' faces restored' : ' face restored') : '') + ' · ' + secs + ' s';
      $('en-work').hidden = true; $('en-result').hidden = false; setCompare(50);
      $('en-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      $('en-work').hidden = true;
      var m = (e && e.message) || String(e);
      if (/memory|allocation|Out of/i.test(m)) m = 'This device ran out of memory. Choose “Auto” and “2× bigger”, or use a smaller photo.';
      toast(m); try { console.error(e); } catch (_) {}
    } finally { st.busy = false; $('en-go').disabled = !st.src; }
  }

  // before / after slider
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
    $('en-face').addEventListener('change', function () { st.face = this.checked; $('en-strength-row').hidden = !st.face; $('en-face-note').hidden = !st.face; });
    $('en-strength').addEventListener('input', function () { st.strength = this.value / 100; $('en-strength-v').textContent = this.value + '%'; });
    $('en-go').onclick = run;
    $('en-png').onclick = function () { if (st.png) save(st.png, 'png'); };
    $('en-jpg').onclick = function () { if (st.out) st.out.toBlob(function (b) { save(b, 'jpg'); }, 'image/jpeg', 0.95); };
    $('en-again').onclick = function () { $('en-result').hidden = true; window.scrollTo({ top: 0, behavior: 'smooth' }); };
    compareEvents();
    E.isCached(E.FACE_FILES).then(function (c) { if (c) $('en-face-note').textContent = 'The face AI is already on this device.'; });
    E.pickBackend().then(function (be) { $('en-engine').textContent = be === 'webgpu' ? 'This device can use its graphics card (fast).' : 'This device will use its processor' + (window.ort && ort.env.wasm.numThreads > 1 ? ' (all cores)' : '') + '.'; }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.SPEnh = st;
})();
