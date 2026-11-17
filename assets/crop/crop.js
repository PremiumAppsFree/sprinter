/* S Printer — image cropper, resizer and compressor (original design and code by S Printer).
 * window.SPCrop.open(options) -> Promise that resolves with {url, w, h, bytes, type} or null if cancelled.
 * Options: file, title, note, presets:[{label,w,h}], maxKB, format('jpeg'|'png'), bg, round,
 *          minPx:{w,h}, maxMB, accept. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var IC = {
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    zin: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/>',
    zout: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8 11h6"/>',
    rotl: '<path d="M4 9h9a6 6 0 0 1 0 12H9"/><path d="M8 5L4 9l4 4"/>',
    rotr: '<path d="M20 9h-9a6 6 0 0 0 0 12h4"/><path d="M16 5l4 4-4 4"/>',
    reset: '<path d="M4 4v6h6"/><path d="M4 10a8 8 0 1 1 1.6 6"/>',
    img: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l4.5-4.5 3.5 3.5 3-3L20 17"/>',
    warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.1"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  function pi(n, c) { return '<svg class="spc-i ' + (c || '') + '" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + IC[n] + '</g></svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function bytesOf(u) { var i = u.indexOf(','), s = u.slice(i + 1), p = s.charAt(s.length - 1) === '=' ? (s.charAt(s.length - 2) === '=' ? 2 : 1) : 0; return Math.floor(s.length * 3 / 4) - p; }
  function kb(b) { return b < 1024 ? b + ' B' : b < 1024 * 1024 ? (b / 1024).toFixed(b / 1024 < 10 ? 1 : 0) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
  var RAD = Math.PI / 180;

  function open(o) {
    o = o || {};
    var presets = (o.presets && o.presets.length ? o.presets : [{ label: 'Original shape', w: 800, h: 800 }]).map(function (p, i) { return { label: p.label || (p.w + '×' + p.h), w: p.w, h: p.h, i: i }; });
    var fmt = o.format === 'png' ? 'png' : 'jpeg', bg = o.bg || '#ffffff';
    var maxKB = o.maxKB || 0, maxMB = o.maxMB || 20, minPx = o.minPx || { w: 0, h: 0 };
    var accept = o.accept || 'image/jpeg,image/png,image/webp,image/bmp,image/gif';

    return new Promise(function (resolve) {
      var done = false, img = null, out = null;
      var P = presets[0];                       // chosen output size
      var st = { s: 1, a: 0, tx: 0, ty: 0 };    // scale, angle, offset of the image under the frame
      var F = { w: 10, h: 10, x: 0, y: 0 };     // crop frame inside the stage, in CSS px

      var ov = document.createElement('div');
      ov.className = 'spc-ov';
      ov.setAttribute('role', 'dialog');
      ov.setAttribute('aria-modal', 'true');
      ov.innerHTML =
        '<div class="spc">' +
          '<div class="spc-hd"><h2>' + esc(o.title || 'Crop your image') + '</h2>' +
            '<button type="button" class="spc-x" data-x aria-label="Close">' + pi('close') + '</button></div>' +
          '<div class="spc-bd">' +
            '<div class="spc-stage" data-stage><canvas data-c></canvas>' +
              '<div class="spc-drop" data-drop>' + pi('img') + '<b>Choose a photo to start</b>' +
                '<small>JPG, PNG or WEBP — up to ' + maxMB + ' MB. You can crop, zoom and rotate it here.</small>' +
                '<button type="button" class="spc-btn" data-pick>Choose file</button></div>' +
              '<div class="spc-busy" data-busy>Preparing your image…</div></div>' +
            '<div class="spc-side">' +
              '<div class="spc-msg" data-msg></div>' +
              '<div><div class="spc-lbl">Live preview</div>' +
                '<div class="spc-prev"><span class="spc-prevbox' + (o.round ? ' round' : '') + '" data-prevbox><canvas data-p></canvas></span>' +
                  '<span class="spc-meta"><b data-size>—</b><span data-info>Pick a photo to see the preview.</span></span></div></div>' +
              (presets.length > 1 ? '<div><div class="spc-lbl">Size</div><div class="spc-chips" data-presets>' +
                presets.map(function (p) { return '<button type="button" class="spc-chip" data-preset="' + p.i + '" aria-pressed="' + (p.i === 0) + '">' + esc(p.label) + '</button>'; }).join('') +
                '</div></div>' : '') +
              '<div><div class="spc-lbl">Crop tools</div>' +
                '<div class="spc-tools">' +
                  '<button type="button" class="spc-tb" data-zoom="-1" title="Zoom out" aria-label="Zoom out">' + pi('zout') + '</button>' +
                  '<button type="button" class="spc-tb" data-zoom="1" title="Zoom in" aria-label="Zoom in">' + pi('zin') + '</button>' +
                  '<button type="button" class="spc-tb" data-rot="-90" title="Rotate left" aria-label="Rotate left">' + pi('rotl') + '</button>' +
                  '<button type="button" class="spc-tb" data-rot="90" title="Rotate right" aria-label="Rotate right">' + pi('rotr') + '</button>' +
                  '<button type="button" class="spc-tb" data-reset title="Reset" aria-label="Reset">' + pi('reset') + '</button>' +
                '</div>' +
                '<input class="spc-range" type="range" min="1" max="400" value="1" data-zr aria-label="Zoom">' +
                '<p class="spc-note">Drag the photo to move it. Use two fingers or the mouse wheel to zoom.</p></div>' +
              (o.note ? '<p class="spc-note">' + esc(o.note) + '</p>' : '') +
            '</div>' +
          '</div>' +
          '<div class="spc-ft">' +
            '<button type="button" class="spc-btn" data-pick>Choose file</button>' +
            '<span class="spc-sp"></span>' +
            '<button type="button" class="spc-btn" data-x>Cancel</button>' +
            '<button type="button" class="spc-cta" data-done disabled>' + pi('check') + '<span>Use this image</span></button>' +
          '</div>' +
          '<input type="file" class="spc-file" accept="' + esc(accept) + '" data-file>' +
        '</div>';
      document.body.appendChild(ov);
      var prevOv = document.body.style.overflow; document.body.style.overflow = 'hidden';

      var cv = $('[data-c]', ov), ctx = cv.getContext('2d');
      var pv = $('[data-p]', ov), pctx = pv.getContext('2d');
      var stage = $('[data-stage]', ov), drop = $('[data-drop]', ov), busy = $('[data-busy]', ov);
      var msg = $('[data-msg]', ov), sizeEl = $('[data-size]', ov), infoEl = $('[data-info]', ov);
      var zr = $('[data-zr]', ov), doneBtn = $('[data-done]', ov), fileIn = $('[data-file]', ov);

      function say(kind, text) {
        msg.className = 'spc-msg' + (kind ? ' on ' + kind : '');
        msg.innerHTML = kind ? pi('warn') + '<span>' + esc(text) + '</span>' : '';
      }
      function close(val) { if (done) return; done = true; document.body.style.overflow = prevOv; removeEventListener('keydown', onKey); ov.remove(); resolve(val); }
      function onKey(e) { if (e.key === 'Escape') close(null); }
      addEventListener('keydown', onKey);
      ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(null); });

      // ---------- geometry ----------
      function frame() {
        var w = stage.clientWidth, h = stage.clientHeight, pad = w < 420 ? 16 : 28;
        var aw = w - pad * 2, ah = h - pad * 2, r = P.w / P.h;
        var fw = Math.min(aw, ah * r), fh = fw / r;
        F = { w: fw, h: fh, x: (w - fw) / 2, y: (h - fh) / 2 };
      }
      function halfFrameInImage() {          // frame half-extents measured along the image axes
        var c = Math.abs(Math.cos(st.a * RAD)), s = Math.abs(Math.sin(st.a * RAD));
        return { x: (c * F.w + s * F.h) / 2, y: (s * F.w + c * F.h) / 2 };
      }
      function minScale() { var h = halfFrameInImage(); return Math.max(2 * h.x / img.width, 2 * h.y / img.height); }
      function clamp() {
        var mn = minScale(), mx = mn * 6;
        st.s = Math.max(mn, Math.min(mx, st.s));
        var h = halfFrameInImage(), c = Math.cos(-st.a * RAD), s = Math.sin(-st.a * RAD);
        var p = st.tx * c - st.ty * s, q = st.tx * s + st.ty * c;          // offset in image axes
        var lx = Math.max(0, img.width * st.s / 2 - h.x), ly = Math.max(0, img.height * st.s / 2 - h.y);
        p = Math.max(-lx, Math.min(lx, p)); q = Math.max(-ly, Math.min(ly, q));
        c = Math.cos(st.a * RAD); s = Math.sin(st.a * RAD);
        st.tx = p * c - q * s; st.ty = p * s + q * c;
        zr.value = Math.round((st.s / mn - 1) / 5 * 399) + 1;
      }
      function paint(c2, W, H, k, cx, cy, fill) {
        c2.save();
        if (fill !== false) { c2.fillStyle = bg; c2.fillRect(0, 0, W, H); }
        c2.translate(cx + st.tx * k, cy + st.ty * k);
        c2.rotate(st.a * RAD);
        c2.scale(st.s * k, st.s * k);
        c2.drawImage(img, -img.width / 2, -img.height / 2);
        c2.restore();
      }
      var raf = 0;
      function draw() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; paintAll(); }); }
      function paintAll() {
        if (!img) return;
        var dpr = Math.min(2, devicePixelRatio || 1), w = stage.clientWidth, h = stage.clientHeight;
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.save(); ctx.beginPath(); ctx.rect(F.x, F.y, F.w, F.h); ctx.clip();
        ctx.fillStyle = bg; ctx.fillRect(F.x, F.y, F.w, F.h); ctx.restore();
        paint(ctx, w, h, 1, F.x + F.w / 2, F.y + F.h / 2, false);
        // dim everything outside the crop frame
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.rect(F.x, F.y, F.w, F.h);
        ctx.fillStyle = 'rgba(12,18,32,.62)'; ctx.fill('evenodd');
        ctx.restore();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(F.x + 1, F.y + 1, F.w - 2, F.h - 2);
        ctx.strokeStyle = 'rgba(255,255,255,.38)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (var i = 1; i < 3; i++) {
          ctx.moveTo(F.x + F.w * i / 3, F.y); ctx.lineTo(F.x + F.w * i / 3, F.y + F.h);
          ctx.moveTo(F.x, F.y + F.h * i / 3); ctx.lineTo(F.x + F.w, F.y + F.h * i / 3);
        }
        ctx.stroke();
        preview();
      }
      function preview() {
        var pw = stage.clientWidth < 760 ? 92 : 104, ph = Math.round(pw * P.h / P.w);
        if (ph > 150) { ph = 150; pw = Math.round(ph * P.w / P.h); }
        var box = $('[data-prevbox]', ov); box.style.width = pw + 'px'; box.style.height = ph + 'px';
        var dpr = Math.min(2, devicePixelRatio || 1);
        pv.width = Math.round(pw * dpr); pv.height = Math.round(ph * dpr);
        pv.style.height = ph + 'px';
        pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paint(pctx, pw, ph, pw / F.w, pw / 2, ph / 2);
      }

      // ---------- export: resize + compress ----------
      function render(w, h) {
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
        paint(g, w, h, w / F.w, w / 2, h / 2);
        return c;
      }
      function encode(c, q) { return c.toDataURL(fmt === 'png' ? 'image/png' : 'image/jpeg', q); }
      function build() {
        var c = render(P.w, P.h), limit = maxKB * 1024, url = encode(c, 0.92);
        if (!limit || bytesOf(url) <= limit) return { url: url, w: c.width, h: c.height, bytes: bytesOf(url) };
        if (fmt === 'png') { url = c.toDataURL('image/jpeg', 0.92); if (bytesOf(url) <= limit) return { url: url, w: c.width, h: c.height, bytes: bytesOf(url) }; }
        var lo = 0.35, hi = 0.92, best = null;
        for (var i = 0; i < 7; i++) {
          var q = (lo + hi) / 2, u = c.toDataURL('image/jpeg', q), b = bytesOf(u);
          if (b <= limit) { best = { url: u, w: c.width, h: c.height, bytes: b }; lo = q; } else hi = q;
        }
        if (best) return best;
        var w = P.w, h = P.h;
        for (var j = 0; j < 5; j++) {
          w = Math.round(w * 0.82); h = Math.round(h * 0.82);
          var c2 = render(w, h), u2 = c2.toDataURL('image/jpeg', 0.72), b2 = bytesOf(u2);
          if (b2 <= limit) return { url: u2, w: w, h: h, bytes: b2 };
        }
        var u3 = render(w, h).toDataURL('image/jpeg', 0.5);
        return { url: u3, w: w, h: h, bytes: bytesOf(u3) };
      }
      var reT;
      function refreshOut() {
        clearTimeout(reT);
        reT = setTimeout(function () {
          if (!img) return;
          out = build();
          sizeEl.textContent = out.w + ' × ' + out.h + ' px · ' + kb(out.bytes);
          infoEl.textContent = maxKB ? 'Saved under ' + maxKB + ' KB automatically.' : 'Ready to use.';
          doneBtn.disabled = false;
        }, 160);
      }
      function changed() { clamp(); draw(); refreshOut(); }

      // ---------- loading a file ----------
      function load(file) {
        if (!file) return;
        say('', '');
        if (!/^image\//.test(file.type || '') && !/\.(jpe?g|png|webp|bmp|gif)$/i.test(file.name || '')) {
          return say('err', 'That is not an image file. Please choose a JPG, PNG or WEBP photo.');
        }
        if (file.size > maxMB * 1024 * 1024) {
          return say('err', 'This file is ' + kb(file.size) + '. Please choose an image under ' + maxMB + ' MB.');
        }
        loadURL(URL.createObjectURL(file), true);
      }
      function loadURL(url, revoke) {
        busy.classList.add('on');
        var im = new Image();
        im.onload = function () {
          if (revoke) URL.revokeObjectURL(url);
          busy.classList.remove('on');
          if (!im.width || !im.height) return say('err', 'This image could not be opened. Please try another file.');
          img = im; drop.style.display = 'none';
          if (im.width < 90 || im.height < 90) { img = null; drop.style.display = ''; return say('err', 'This image is only ' + im.width + '×' + im.height + ' px — too small to use. Please choose a bigger photo.'); }
          frame(); st = { s: 1, a: 0, tx: 0, ty: 0 }; st.s = minScale();
          changed();
          if (im.width < minPx.w || im.height < minPx.h) say('warn', 'This photo is ' + im.width + '×' + im.height + ' px, smaller than the ' + minPx.w + '×' + minPx.h + ' px needed — it may look blurry when printed.');
          else say('', '');
        };
        im.onerror = function () {
          if (revoke) URL.revokeObjectURL(url);
          busy.classList.remove('on');
          say('err', 'This photo format cannot be opened on this device (HEIC photos from iPhone often fail). Please choose a JPG or PNG.');
        };
        im.src = url;
      }

      // ---------- input ----------
      ov.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.hasAttribute('data-x')) return close(null);
        if (b.hasAttribute('data-pick')) return fileIn.click();
        if (!img) return;
        if (b.dataset.zoom) { st.s *= (+b.dataset.zoom > 0 ? 1.18 : 1 / 1.18); changed(); }
        else if (b.dataset.rot) { st.a = (st.a + (+b.dataset.rot) + 360) % 360; st.s = Math.max(st.s, minScale()); changed(); }
        else if (b.hasAttribute('data-reset')) { st = { s: 1, a: 0, tx: 0, ty: 0 }; st.s = minScale(); changed(); }
        else if (b.dataset.preset != null) {
          P = presets[+b.dataset.preset];
          Array.prototype.forEach.call(ov.querySelectorAll('[data-preset]'), function (x) { x.setAttribute('aria-pressed', x === b); });
          frame(); st.s = Math.max(st.s, minScale()); changed();
        } else if (b.hasAttribute('data-done') && out) {
          close({ url: out.url, w: out.w, h: out.h, bytes: out.bytes, type: /^data:(.*?);/.exec(out.url)[1] });
        }
      });
      fileIn.addEventListener('change', function () { if (fileIn.files[0]) load(fileIn.files[0]); fileIn.value = ''; });
      zr.addEventListener('input', function () { if (!img) return; st.s = minScale() * (1 + (zr.value - 1) / 399 * 5); clamp(); draw(); refreshOut(); });
      cv.addEventListener('wheel', function (e) { if (!img) return; e.preventDefault(); st.s *= e.deltaY < 0 ? 1.08 : 1 / 1.08; changed(); }, { passive: false });

      var pts = {}, last = null, pinch = 0;
      cv.addEventListener('pointerdown', function (e) { if (!img) return; cv.setPointerCapture(e.pointerId); pts[e.pointerId] = { x: e.clientX, y: e.clientY }; last = { x: e.clientX, y: e.clientY }; pinch = dist(); });
      cv.addEventListener('pointermove', function (e) {
        if (!img || !pts[e.pointerId]) return;
        pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        var n = Object.keys(pts).length;
        if (n >= 2) { var d = dist(); if (pinch > 4 && d > 4) { st.s *= d / pinch; pinch = d; changed(); } return; }
        st.tx += e.clientX - last.x; st.ty += e.clientY - last.y;
        last = { x: e.clientX, y: e.clientY };
        clamp(); draw(); refreshOut();
      });
      function up(e) { delete pts[e.pointerId]; pinch = dist(); var k = Object.keys(pts)[0]; last = k ? pts[k] : null; }
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      function dist() { var k = Object.keys(pts); if (k.length < 2) return 0; var a = pts[k[0]], b = pts[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }

      stage.addEventListener('dragover', function (e) { e.preventDefault(); });
      stage.addEventListener('drop', function (e) { e.preventDefault(); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });

      var ro = null;
      if (window.ResizeObserver) { ro = new ResizeObserver(function () { if (img) { frame(); st.s = Math.max(st.s, minScale()); clamp(); draw(); } }); ro.observe(stage); }
      addEventListener('resize', function () { if (img) { frame(); st.s = Math.max(st.s, minScale()); clamp(); draw(); } });

      if (o.file) load(o.file);
      else if (o.src) loadURL(o.src, false);
      else setTimeout(function () { fileIn.click(); }, 60);
    });
  }

  window.SPCrop = { open: open };
})();
