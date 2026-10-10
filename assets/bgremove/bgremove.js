/* S Printer — background removal for every photo tool.
 * Runs fully in the browser (MODNet portrait matting via transformers.js); the photo never leaves the device.
 * SPBg.mask(canvas) → alpha mask canvas · SPBg.compose(canvas, mask, colour|null) → canvas
 * On photo pages, choosing a photo first asks: keep the background, or remove it and pick a colour. */
(function () {
  'use strict';
  if (window.SPBg) return;
  var WORKER_SRC = "let engine=null;async function load(){if(!engine)engine=(async()=>{const lib=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2/dist/transformers.min.js');lib.env.allowLocalModels=false;lib.env.backends.onnx.wasm.numThreads=1;const options={revision:'fa2fa546052fba4c08921230a26cc69a333fca12'};const [model,processor]=await Promise.all([lib.AutoModel.from_pretrained('Xenova/modnet',{...options,dtype:'fp32',device:'wasm'}),lib.AutoProcessor.from_pretrained('Xenova/modnet',options)]);return {lib,model,processor};})().catch(e=>{engine=null;throw e;});return engine;}self.onmessage=async({data})=>{try{self.postMessage({stage:engine?'processing':'loading'});const {lib,model,processor}=await load();const input=new lib.RawImage(new Uint8ClampedArray(data.pixels),data.width,data.height,4);const {pixel_values}=await processor(input);let output;try{({output}=await model({input:pixel_values}));const mask=lib.RawImage.fromTensor(output[0].mul(255).to('uint8'));const bytes=new Uint8Array(mask.data);self.postMessage({mask:bytes.buffer,width:mask.width,height:mask.height},[bytes.buffer]);}finally{pixel_values&&pixel_values.dispose&&pixel_values.dispose();output&&output.dispose&&output.dispose();}}catch(e){self.postMessage({error:'Background removal failed. Check the internet connection and try again.'});}};";
  var worker = null, queue = Promise.resolve();
  function cv(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function getWorker() {
    if (!worker) worker = new Worker(URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' })), { type: 'module' });
    return worker;
  }
  function maskOnce(img, onStage) {
    return new Promise(function (res, rej) {
      var k = Math.min(1, 1024 / Math.max(img.width, img.height)), c = cv(img.width * k, img.height * k), x = c.getContext('2d');
      x.drawImage(img, 0, 0, c.width, c.height);
      var data = x.getImageData(0, 0, c.width, c.height);
      if (window.__spMatting) { window.__spMatting(data).then(res, rej); return; }   // test hook
      var w = getWorker();
      w.onmessage = function (e) {
        var m = e.data;
        if (m.stage) { if (onStage) onStage(m.stage); return; }
        if (m.error) { rej(new Error(m.error)); return; }
        var u8 = new Uint8Array(m.mask), mc = cv(m.width, m.height), mx = mc.getContext('2d'), id = mx.createImageData(m.width, m.height);
        for (var i = 0; i < u8.length; i++) { id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = 255; id.data[i * 4 + 3] = u8[i]; }
        mx.putImageData(id, 0, 0); res(mc);
      };
      w.onerror = function () { worker = null; rej(new Error('Background removal could not start. Check the internet connection.')); };
      w.postMessage({ pixels: data.data.buffer, width: data.width, height: data.height }, [data.data.buffer]);
    });
  }
  function mask(img, onStage) { var p = queue.then(function () { return maskOnce(img, onStage); }); queue = p.catch(function () {}); return p; }
  function compose(img, m, colour, soft) {
    var W = img.width, H = img.height, out = cv(W, H), x = out.getContext('2d');
    var person = cv(W, H), p = person.getContext('2d');
    p.drawImage(img, 0, 0);
    p.globalCompositeOperation = 'destination-in';
    if (soft !== false) p.filter = 'blur(' + Math.max(0.6, W / 900) + 'px)';
    p.drawImage(m, 0, 0, W, H); p.filter = 'none';
    if (colour) { x.fillStyle = colour; x.fillRect(0, 0, W, H); }
    x.drawImage(person, 0, 0);
    return out;
  }
  window.SPBg = { mask: mask, compose: compose };

  // ---------- ask before a photo goes into a photo tool ----------
  var PAGES = /\/(passport-photo|passport-photo-classic|photo-crop-resize)(\.html)?$/;
  if (!PAGES.test(location.pathname)) return;
  var KEY = 'sp-bg-choice', passed = new WeakSet();
  var COLOURS = [['#ffffff', 'White'], ['#dbeafe', 'Light blue'], ['#7dd3fc', 'Sky blue'], ['#2563eb', 'Blue'], ['#ef4444', 'Red'], ['#e5e7eb', 'Light grey']];
  var css = '.spbg-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);display:flex;align-items:flex-end;justify-content:center;padding:12px;font:15px/1.45 "SP Inter",Inter,system-ui,sans-serif;color:#1B2330}' +
    '@media(min-width:640px){.spbg-ov{align-items:center}}' +
    '.spbg-box{background:#fff;border-radius:18px;max-width:440px;width:100%;padding:18px 18px 16px;box-shadow:0 20px 50px rgba(0,0,0,.3);animation:spbgIn .22s ease-out}' +
    '@keyframes spbgIn{from{transform:translateY(18px);opacity:0}}' +
    '.spbg-box h3{margin:0 0 2px;font:800 18px/1.25 "SP Lexend",system-ui,sans-serif;display:flex;align-items:center;gap:9px}.spbg-box h3 svg{width:26px;height:26px;flex:none}' +
    '.spbg-box p{margin:0 0 12px;color:#5B6676;font-size:13.5px}' +
    '.spbg-sw{display:flex;flex-wrap:wrap;gap:9px;margin:4px 0 12px}.spbg-sw button{width:42px;height:42px;border-radius:12px;border:2px solid #d5dce6;cursor:pointer;padding:0;position:relative}' +
    '.spbg-sw button[aria-pressed=true]{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.25)}' +
    '.spbg-sw .spbg-tr{background:repeating-conic-gradient(#e5e7eb 0 25%,#fff 0 50%) 0 0/12px 12px}' +
    '.spbg-sw label{width:42px;height:42px;border-radius:12px;border:2px dashed #b6c0cd;display:grid;place-items:center;cursor:pointer;overflow:hidden;position:relative;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)}' +
    '.spbg-sw label input{position:absolute;opacity:0;inset:0;width:100%;height:100%;cursor:pointer}' +
    '.spbg-row{display:flex;gap:9px}.spbg-row button{flex:1;height:46px;border-radius:12px;font:700 15px/1 inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px}' +
    '.spbg-keep{background:#fff;border:1.5px solid #d5dce6;color:#1B2330}.spbg-go{background:#1B2330;border:0;color:#fff}.spbg-go svg,.spbg-keep svg{width:18px;height:18px}' +
    '.spbg-busy{display:none;align-items:center;gap:10px;margin-top:12px;font-size:13.5px;color:#334155}.spbg-busy i{width:18px;height:18px;border-radius:50%;border:3px solid #cbd5e1;border-top-color:#2563EB;animation:spbgR .8s linear infinite}' +
    '@keyframes spbgR{to{transform:rotate(1turn)}}.spbg-box.is-busy .spbg-busy{display:flex}.spbg-box.is-busy .spbg-row{opacity:.5;pointer-events:none}';
  var ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="spbgG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#6366f1"/></linearGradient><linearGradient id="spbgY" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd43b"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs><rect x="3" y="3" width="26" height="26" rx="6" fill="#eef2f7"/><circle cx="16" cy="13" r="5" fill="url(#spbgG)"/><path d="M7.5 29c.8-5.8 4.2-8.6 8.5-8.6s7.7 2.8 8.5 8.6z" fill="url(#spbgG)"/><path d="M25.5 2l1.1 2.7 2.7 1.1-2.7 1.1-1.1 2.7-1.1-2.7-2.7-1.1 2.7-1.1z" fill="url(#spbgY)"/></svg>';

  function choose(count) {
    return new Promise(function (resolve) {
      if (!document.getElementById('spbg-css')) { var s = document.createElement('style'); s.id = 'spbg-css'; s.textContent = css; document.head.appendChild(s); }
      var last = null; try { last = localStorage.getItem(KEY); } catch (e) {}
      var pick = last && last !== 'keep' ? last : '#ffffff';
      var ov = document.createElement('div'); ov.className = 'spbg-ov';
      ov.innerHTML = '<div class="spbg-box" role="dialog" aria-modal="true" aria-label="Photo background"><h3>' + ICON + 'Photo background</h3>' +
        '<p>Keep the photo as it is, or remove the background and put a clean colour behind ' + (count > 1 ? 'the ' + count + ' photos' : 'the person') + '. Works on this device — the photo is not uploaded.</p>' +
        '<div class="spbg-sw"></div>' +
        '<div class="spbg-row"><button type="button" class="spbg-keep"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.8"/><path d="M4 18l5-5 4 3 3-2 4 4"/></svg>Keep original</button>' +
        '<button type="button" class="spbg-go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>Remove background</button></div>' +
        '<div class="spbg-busy"><i></i><span>Removing the background…</span></div></div>';
      var sw = ov.querySelector('.spbg-sw');
      var mark = function () { [].forEach.call(sw.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === pick)); }); };
      COLOURS.concat([['transparent', 'Transparent (PNG)']]).forEach(function (c) {
        var b = document.createElement('button'); b.type = 'button'; b.dataset.c = c[0]; b.title = c[1]; b.setAttribute('aria-label', c[1]);
        if (c[0] === 'transparent') b.className = 'spbg-tr'; else b.style.background = c[0];
        b.onclick = function () { pick = c[0]; mark(); }; sw.appendChild(b);
      });
      var lab = document.createElement('label'); lab.title = 'Any colour'; lab.innerHTML = '<input type="color" value="#ffffff" aria-label="Any colour">';
      lab.querySelector('input').oninput = function (e) { pick = e.target.value; mark(); lab.style.background = pick; };
      sw.appendChild(lab); mark();
      document.body.appendChild(ov);
      var box = ov.querySelector('.spbg-box');
      var done = function (v) { try { localStorage.setItem(KEY, v === null ? 'keep' : v); } catch (e) {} resolve({ colour: v, ui: { box: box, close: function () { ov.remove(); }, text: function (t) { box.querySelector('.spbg-busy span').textContent = t; } } }); };
      ov.querySelector('.spbg-keep').onclick = function () { done(null); };
      ov.querySelector('.spbg-go').onclick = function () { box.classList.add('is-busy'); done(pick); };
      ov.addEventListener('click', function (e) { if (e.target === ov) done(null); });
    });
  }
  function loadImage(file) {
    return new Promise(function (res, rej) { var u = URL.createObjectURL(file), i = new Image(); i.onload = function () { var c = cv(i.naturalWidth, i.naturalHeight); c.getContext('2d').drawImage(i, 0, 0); URL.revokeObjectURL(u); res(c); }; i.onerror = function () { URL.revokeObjectURL(u); rej(new Error('Could not read the photo.')); }; i.src = u; });
  }
  function toFile(c, name, png) {
    return new Promise(function (res) {
      c.toBlob(function (b) { res(new File([b], name.replace(/\.[a-z0-9]+$/i, '') + (png ? '.png' : '.jpg'), { type: png ? 'image/png' : 'image/jpeg', lastModified: Date.now() })); }, png ? 'image/png' : 'image/jpeg', 0.96);
    });
  }
  function hand(input, files) {
    try { var dt = new DataTransfer(); files.forEach(function (f) { dt.items.add(f); }); input.files = dt.files; } catch (e) {}
    passed.add(input);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function intercept(e) {
    var input = e.target;
    if (!input || input.tagName !== 'INPUT' || input.type !== 'file') return;
    if (passed.has(input)) { if (e.type === 'change') passed.delete(input); return; }
    var files = [].slice.call(input.files || []).filter(function (f) { return /^image\/(jpeg|png|webp)$/.test(f.type); });
    if (!files.length || files.length !== (input.files || []).length) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (e.type !== 'change') return;              // the "input" event waits for the change handler below
    var all = [].slice.call(input.files);
    choose(all.length).then(async function (r) {
      if (!r.colour) { r.ui.close(); hand(input, all); return; }
      var out = [];
      try {
        for (var i = 0; i < all.length; i++) {
          r.ui.text('Removing the background' + (all.length > 1 ? ' — photo ' + (i + 1) + ' of ' + all.length : '') + '…');
          var img = await loadImage(all[i]);
          var m = await mask(img, function (s) { if (s === 'loading') r.ui.text('Loading the AI model (first time only, about 25 MB)…'); else r.ui.text('Removing the background…'); });
          var png = r.colour === 'transparent';
          out.push(await toFile(compose(img, m, png ? null : r.colour), all[i].name, png));
        }
      } catch (err) {
        r.ui.close(); alertBox(err.message || 'Background removal failed.'); hand(input, all); return;
      }
      r.ui.close(); hand(input, out);
    });
  }
  function alertBox(t) {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1B2330;color:#fff;padding:12px 16px;border-radius:12px;z-index:2147483001;font:600 14px/1.4 system-ui,sans-serif;max-width:90vw';
    d.textContent = t + ' The original photo is used.'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 4500);
  }
  window.addEventListener('input', intercept, true);
  window.addEventListener('change', intercept, true);
})();
