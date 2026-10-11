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
    '.spbg-turn{display:flex;gap:12px;align-items:center;margin:2px 0 12px}.spbg-prev{width:96px;height:96px;flex:none;border-radius:12px;background:repeating-conic-gradient(#eef2f7 0 25%,#fff 0 50%) 0 0/14px 14px;display:grid;place-items:center;overflow:hidden;border:1px solid #e3e8ef}' +
    '.spbg-prev img{max-width:100%;max-height:100%;transition:transform .25s}.spbg-tools{flex:1;display:flex;flex-direction:column;gap:8px}.spbg-tb{display:flex;gap:6px;flex-wrap:wrap}' +
    '.spbg-tb button{height:36px;min-width:40px;padding:0 10px;border-radius:10px;border:1.5px solid #d5dce6;background:#fff;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font:600 13px inherit;color:#1B2330}.spbg-tb button svg{width:18px;height:18px}' +
    '.spbg-tilt{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#5B6676}.spbg-tilt input{flex:1;accent-color:#4f46e5}.spbg-lbl{font:700 12px/1 inherit;letter-spacing:.04em;text-transform:uppercase;color:#4f46e5;margin:4px 0 6px}' +
    '@keyframes spbgR{to{transform:rotate(1turn)}}.spbg-box.is-busy .spbg-busy{display:flex}.spbg-box.is-busy .spbg-row{opacity:.5;pointer-events:none}';
  var ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="spbgG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#6366f1"/></linearGradient><linearGradient id="spbgY" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd43b"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs><rect x="3" y="3" width="26" height="26" rx="6" fill="#eef2f7"/><circle cx="16" cy="13" r="5" fill="url(#spbgG)"/><path d="M7.5 29c.8-5.8 4.2-8.6 8.5-8.6s7.7 2.8 8.5 8.6z" fill="url(#spbgG)"/><path d="M25.5 2l1.1 2.7 2.7 1.1-2.7 1.1-1.1 2.7-1.1-2.7-2.7-1.1 2.7-1.1z" fill="url(#spbgY)"/></svg>';

  var TI = {
    l: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.34-5.66"/><path d="M4 4v5h5"/></svg>',
    r: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/></svg>',
    f: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>'
  };
  // the dialog: turn / straighten the photo and choose the background
  function choose(files) {
    var count = files.length;
    return new Promise(function (resolve) {
      if (!document.getElementById('spbg-css')) { var s = document.createElement('style'); s.id = 'spbg-css'; s.textContent = css; document.head.appendChild(s); }
      var last = null; try { last = localStorage.getItem(KEY); } catch (e) {}
      var pick = last && last !== 'keep' ? last : '#ffffff', rot = 0, tilt = 0, flip = false;
      var ov = document.createElement('div'); ov.className = 'spbg-ov';
      ov.innerHTML = '<div class="spbg-box" role="dialog" aria-modal="true" aria-label="Photo"><h3>' + ICON + 'Photo — turn &amp; background</h3>' +
        '<p>Turn or straighten ' + (count > 1 ? 'the ' + count + ' photos' : 'the photo') + ' if needed, then keep the background or replace it with a clean colour. Everything stays on this device.</p>' +
        '<div class="spbg-lbl">Turn / straighten</div><div class="spbg-turn"><div class="spbg-prev"><img alt=""></div><div class="spbg-tools"><div class="spbg-tb">' +
        '<button type="button" data-a="l" title="Turn left 90°">' + TI.l + '</button><button type="button" data-a="r" title="Turn right 90°">' + TI.r + '</button><button type="button" data-a="f" title="Mirror">' + TI.f + '</button></div>' +
        '<label class="spbg-tilt">Tilt <input type="range" min="-20" max="20" step="0.5" value="0"><b>0°</b></label></div></div>' +
        '<div class="spbg-lbl">Background</div><div class="spbg-sw"></div>' +
        '<div class="spbg-row"><button type="button" class="spbg-keep"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.8"/><path d="M4 18l5-5 4 3 3-2 4 4"/></svg>Keep background</button>' +
        '<button type="button" class="spbg-go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>Remove background</button></div>' +
        '<div class="spbg-busy"><i></i><span>Working…</span></div></div>';
      var img = ov.querySelector('.spbg-prev img'), u = URL.createObjectURL(files[0]); img.src = u;
      var show = function () { img.style.transform = 'rotate(' + (rot + tilt) + 'deg) scaleX(' + (flip ? -1 : 1) + ')'; ov.querySelector('.spbg-tilt b').textContent = tilt + '°'; };
      [].forEach.call(ov.querySelectorAll('.spbg-tb button'), function (b) { b.onclick = function () { if (b.dataset.a === 'l') rot = (rot + 270) % 360; else if (b.dataset.a === 'r') rot = (rot + 90) % 360; else flip = !flip; show(); }; });
      ov.querySelector('.spbg-tilt input').oninput = function (e) { tilt = +e.target.value; show(); };
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
      var done = function (v) {
        try { localStorage.setItem(KEY, v === null ? 'keep' : v); } catch (e) {}
        URL.revokeObjectURL(u);
        resolve({ colour: v, turn: { rot: rot, tilt: tilt, flip: flip }, ui: { box: box, close: function () { ov.remove(); }, text: function (t) { box.querySelector('.spbg-busy span').textContent = t; } } });
      };
      ov.querySelector('.spbg-keep').onclick = function () { box.classList.add('is-busy'); done(null); };
      ov.querySelector('.spbg-go').onclick = function () { box.classList.add('is-busy'); done(pick); };
      ov.addEventListener('click', function (e) { if (e.target === ov) done(null); });
    });
  }
  function turned(c, t) {
    if (!t || (!t.rot && !t.tilt && !t.flip)) return c;
    var a = (t.rot + t.tilt) * Math.PI / 180, co = Math.abs(Math.cos(a)), si = Math.abs(Math.sin(a));
    var W = Math.round(c.width * co + c.height * si), H = Math.round(c.width * si + c.height * co), o = cv(W, H), x = o.getContext('2d');
    if (t.tilt) { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); }
    x.imageSmoothingQuality = 'high'; x.translate(W / 2, H / 2); x.rotate(a); if (t.flip) x.scale(-1, 1);
    x.drawImage(c, -c.width / 2, -c.height / 2); return o;
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
    lastInput = input; lastFiles = all;
    process(input, all);
  }
  var lastInput = null, lastFiles = null;
  function process(input, all) {
    choose(all).then(async function (r) {
      var t = r.turn, moved = t.rot || t.tilt || t.flip;
      if (!r.colour && !moved) { r.ui.close(); hand(input, all); return; }
      var out = [];
      try {
        for (var i = 0; i < all.length; i++) {
          r.ui.text((r.colour ? 'Removing the background' : 'Turning the photo') + (all.length > 1 ? ' — photo ' + (i + 1) + ' of ' + all.length : '') + '…');
          var img = turned(await loadImage(all[i]), t);
          if (r.colour) {
            var m = await mask(img, function (s) { if (s === 'loading') r.ui.text('Loading the AI model (first time only, about 25 MB)…'); else r.ui.text('Removing the background…'); });
            img = compose(img, m, r.colour === 'transparent' ? null : r.colour);
          }
          out.push(await toFile(img, all[i].name, true));      // PNG: lossless, the photo keeps its full quality
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
  // classic passport editor: turn the photo again and switch the frame between portrait and landscape
  function classicTools() {
    var zc = document.getElementById('manualZoomContainer'), sel = document.getElementById('photoSizeSelectCrop');
    if (!zc || !sel || document.getElementById('spbg-classic')) return;
    var bar = document.createElement('div'); bar.id = 'spbg-classic';
    bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 4px';
    var btn = 'flex:1;min-width:130px;height:42px;border-radius:12px;border:1.5px solid #c7d2fe;background:linear-gradient(145deg,#f8faff,#f5f3ff);display:inline-flex;align-items:center;justify-content:center;gap:8px;font:700 13.5px inherit;color:#1B2330;cursor:pointer';
    bar.innerHTML = '<button type="button" data-a="turn" style="' + btn + '">' + TI.r.replace('stroke="currentColor"', 'stroke="url(#spIcoG)"').replace('<svg ', '<svg width="20" height="20" ') + 'Turn / straighten</button>' +
      '<button type="button" data-a="frame" style="' + btn + '"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#spIcoG)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="12" height="15" rx="2"/><rect x="9" y="3" width="12" height="9" rx="2" opacity=".6"/></svg>Portrait ⇄ landscape</button>';
    zc.parentNode.insertBefore(bar, zc);
    bar.querySelector('[data-a=turn]').onclick = function () {
      if (!lastInput || !lastFiles) { alertBox0('Choose a photo first.'); return; }
      process(lastInput, lastFiles);
    };
    bar.querySelector('[data-a=frame]').onclick = function () {
      var w = parseFloat((document.getElementById('customWidth') || {}).value), h = parseFloat((document.getElementById('customHeight') || {}).value);
      if (sel.value !== 'custom' || !(w > 0 && h > 0)) {
        var m = /([\d.]+)\s*x\s*([\d.]+)\s*(cm|mm|inch|in)/i.exec(sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '');
        if (!m) { w = 3.5; h = 4.5; } else { var k = /mm/i.test(m[3]) ? 0.1 : /in/i.test(m[3]) ? 2.54 : 1; w = +m[1] * k; h = +m[2] * k; }
      }
      sel.value = 'custom'; sel.dispatchEvent(new Event('change', { bubbles: true }));
      var cw = document.getElementById('customWidth'), ch = document.getElementById('customHeight');
      if (cw && ch) { cw.value = (+h).toFixed(3).replace(/\.?0+$/, ''); ch.value = (+w).toFixed(3).replace(/\.?0+$/, ''); ['input', 'change'].forEach(function (ev) { cw.dispatchEvent(new Event(ev, { bubbles: true })); ch.dispatchEvent(new Event(ev, { bubbles: true })); }); }
    };
  }
  function alertBox0(t) { var d = document.createElement('div'); d.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1B2330;color:#fff;padding:12px 16px;border-radius:12px;z-index:2147483001;font:600 14px/1.4 system-ui,sans-serif'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 3000); }
  if (/passport-photo-classic/.test(location.pathname)) { var tries = 0, iv = setInterval(function () { classicTools(); if (document.getElementById('spbg-classic') || ++tries > 60) clearInterval(iv); }, 500); }
  window.addEventListener('input', intercept, true);
  window.addEventListener('change', intercept, true);
})();
