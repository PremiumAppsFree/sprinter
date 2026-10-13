/* S Printer — AI photo enhancer engine (runs entirely in the browser).
 * Real-ESRGAN (general-x4v3 / x4plus) for the whole picture, RetinaFace to find faces,
 * GFPGAN v1.4 to restore each face, pasted back with a soft edge. onnxruntime-web: WebGPU, or WASM. */
(function () {
  'use strict';
  var BASE = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/engine\.js.*$/, '') : '../assets/enhance/'; })();
  var MODELS = BASE + 'models/';
  var CACHE = 'sp-ai-models-v1';
  var sessions = {}, backend = null, started = false;

  function ort() { return window.ort; }
  function withTimeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); })]); }
  async function pickBackend() {
    if (backend) return backend;
    var O = ort();
    O.env.wasm.wasmPaths = BASE.replace(/enhance\/$/, 'vendor/ort/');
    var noThreads = false; try { noThreads = localStorage.getItem('sp-ort-1t') === '1' || /[?&]safe\b/.test(location.search); } catch (e) {}
    O.env.wasm.numThreads = (self.crossOriginIsolated && !noThreads ? Math.min(8, navigator.hardwareConcurrency || 4) : 1);
    O.env.wasm.simd = true;
    backend = 'wasm';
    try {
      if (navigator.gpu) {
        var ad = await withTimeout(navigator.gpu.requestAdapter({ powerPreference: 'high-performance' }), 4000);
        var info = ad && (ad.info || {});
        var soft = !ad || ad.isFallbackAdapter || (info && (info.isFallbackAdapter || /swiftshader|llvmpipe|software|basic render/i.test((info.description || '') + ' ' + (info.architecture || '') + ' ' + (info.device || ''))));
        if (!soft) backend = 'webgpu';
      }
    } catch (e) {}
    return backend;
  }

  // download (with progress) and keep in the browser's cache for next time
  async function getBytes(names, onProgress) {
    var cache = null; try { cache = await caches.open(CACHE); } catch (e) {}
    var parts = [], total = 0, loaded = 0, sizes = [];
    for (var i = 0; i < names.length; i++) {
      var url = MODELS + names[i], hit = cache && await cache.match(url);
      if (hit) { var b = new Uint8Array(await hit.arrayBuffer()); parts.push(b); loaded += b.length; total += b.length; continue; }
      var r = await fetch(url); if (!r.ok) throw new Error('Could not download the AI model (' + r.status + ').');
      var len = +r.headers.get('content-length') || 0; total += len; sizes.push(len);
      var reader = r.body.getReader(), chunks = [], got = 0;
      while (true) {
        var c = await reader.read(); if (c.done) break;
        chunks.push(c.value); got += c.value.length; loaded += c.value.length;
        if (onProgress) onProgress(loaded, Math.max(total, loaded));
      }
      var buf = new Uint8Array(got), o = 0; chunks.forEach(function (ch) { buf.set(ch, o); o += ch.length; });
      parts.push(buf);
      if (cache) { try { await cache.put(url, new Response(buf, { headers: { 'content-type': 'application/octet-stream' } })); } catch (e) {} }
    }
    if (parts.length === 1) return parts[0];
    var all = 0; parts.forEach(function (p) { all += p.length; });
    var out = new Uint8Array(all), off = 0; parts.forEach(function (p) { out.set(p, off); off += p.length; });
    return out;
  }
  async function isCached(names) {
    try { var cache = await caches.open(CACHE); for (var i = 0; i < names.length; i++) if (!(await cache.match(MODELS + names[i]))) return false; return true; } catch (e) { return false; }
  }
  async function session(key, files, onProgress) {
    if (sessions[key]) return sessions[key];
    var be = await pickBackend(), bytes = await getBytes(files, onProgress);
    var opts = { executionProviders: be === 'webgpu' ? ['webgpu', 'wasm'] : ['wasm'], graphOptimizationLevel: 'all' };
    // the very first start: if the multi-core engine does not come up, reload once in single-core mode
    var first = !started; started = true;
    if (first && ort().env.wasm.numThreads > 1) {
      try { await withTimeout(ort().InferenceSession.create(bytes, opts).then(function (s0) { sessions[key] = s0; }), 25000); }
      catch (e) {
        if (String(e && e.message) === 'timeout') { try { localStorage.setItem('sp-ort-1t', '1'); } catch (_) {} if (window.SPEnhanceOnReload) window.SPEnhanceOnReload(); location.reload(); return new Promise(function () {}); }
        throw e;
      }
    }
    try {
      if (!sessions[key]) sessions[key] = await withTimeout(ort().InferenceSession.create(bytes, opts), be === 'webgpu' ? 90000 : 600000);
      if (be === 'webgpu' && /^sr-/.test(key)) {
        // a quick test run: a graphics card that is too slow or broken falls back to the processor
        var t0 = performance.now();
        await withTimeout(sessions[key].run({ input: new (ort().Tensor)('float32', new Float32Array(3 * 32 * 32), [1, 3, 32, 32]) }), 20000);
        if (performance.now() - t0 > 8000) throw new Error('slow gpu');
      }
    }
    catch (e) {
      if (be !== 'webgpu') throw e;
      backend = 'wasm';                         // graphics card refused the model: use the processor
      Object.keys(sessions).forEach(function (k) { if (k !== key) delete sessions[k]; });
      sessions[key] = await ort().InferenceSession.create(bytes, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
    }
    return sessions[key];
  }

  var SR = {
    sharp: { file: 'photo-sharp.onnx', mb: 5 }, balanced: { file: 'photo-balanced.onnx', mb: 5 },
    clean: { file: 'photo-clean.onnx', mb: 5 }, max: { file: 'photo-max.onnx', mb: 34 }
  };
  var FACE_FILES = ['face.onnx.part0', 'face.onnx.part1'], FACE_MB = 170;

  function canvas(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function ctx2(c) { return c.getContext('2d', { willReadFrequently: true }); }
  var tick = function () { return new Promise(function (r) { setTimeout(r, 0); }); };

  // high-quality resize (step-down halving for big reductions)
  function resize(src, w, h) {
    var cur = src, cw = src.width, ch = src.height;
    while (cw / 2 >= w && ch / 2 >= h) { var t = canvas(cw / 2, ch / 2), x = t.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(cur, 0, 0, t.width, t.height); cur = t; cw = t.width; ch = t.height; }
    var o = canvas(w, h), ox = o.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(cur, 0, 0, w, h); return o;
  }

  // ---------- 1) upscale ×4 in overlapping tiles ----------
  async function upscale(srcCanvas, key, onTile) {
    var s = await session('sr-' + key, [SR[key].file]);
    var W = srcCanvas.width, H = srcCanvas.height, px = ctx2(srcCanvas).getImageData(0, 0, W, H).data;
    var gpu = backend === 'webgpu', TS = key === 'max' ? (gpu ? 128 : 96) : (gpu ? 256 : 160), PAD = key === 'max' ? 10 : 12;
    var OW = W * 4, OH = H * 4, out = new Uint8ClampedArray(OW * OH * 4);
    var tx = Math.ceil(W / TS), ty = Math.ceil(H / TS), n = 0, total = tx * ty;
    for (var j = 0; j < ty; j++) for (var i = 0; i < tx; i++) {
      var x0 = i * TS, y0 = j * TS, x1 = Math.min(W, x0 + TS), y1 = Math.min(H, y0 + TS);
      var ax = Math.max(0, x0 - PAD), ay = Math.max(0, y0 - PAD), bx = Math.min(W, x1 + PAD), by = Math.min(H, y1 + PAD);
      var tw = bx - ax, th = by - ay, plane = tw * th, inp = new Float32Array(3 * plane);
      for (var y = 0; y < th; y++) for (var x = 0; x < tw; x++) {
        var si = ((ay + y) * W + ax + x) * 4, di = y * tw + x;
        inp[di] = px[si] / 255; inp[plane + di] = px[si + 1] / 255; inp[2 * plane + di] = px[si + 2] / 255;
      }
      var res = await s.run({ input: new (ort().Tensor)('float32', inp, [1, 3, th, tw]) });
      var o = res.output, d = o.data instanceof Float32Array ? o.data : await o.getData(), ow = tw * 4, op = ow * th * 4;
      var ox0 = (x0 - ax) * 4, oy0 = (y0 - ay) * 4, cw = (x1 - x0) * 4, chh = (y1 - y0) * 4;
      for (var yy = 0; yy < chh; yy++) {
        var srow = (oy0 + yy) * ow + ox0, drow = ((y0 * 4 + yy) * OW + x0 * 4) * 4;
        for (var xx = 0; xx < cw; xx++) {
          var k = srow + xx, q = drow + xx * 4;
          out[q] = d[k] * 255 + 0.5; out[q + 1] = d[op + k] * 255 + 0.5; out[q + 2] = d[2 * op + k] * 255 + 0.5; out[q + 3] = 255;
        }
      }
      try { o.dispose && o.dispose(); } catch (e) {}
      n++;
      if (onTile) {
        var tc = null;
        if (onTile.length > 2) {   // the page wants to show this part as it is finished
          tc = canvas(cw, chh); var tim = new ImageData(cw, chh), td = tim.data;
          for (var r2 = 0; r2 < chh; r2++) td.set(out.subarray(((y0 * 4 + r2) * OW + x0 * 4) * 4, ((y0 * 4 + r2) * OW + x0 * 4 + cw) * 4), r2 * cw * 4);
          tc.getContext('2d').putImageData(tim, 0, 0);
        }
        onTile(n, total, tc, { x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
      }
      await tick();
    }
    var c = canvas(OW, OH); c.getContext('2d').putImageData(new ImageData(out, OW, OH), 0, 0); return c;
  }

  // ---------- 2) find faces (RetinaFace, 5 landmarks) ----------
  function priors(size) {
    var out = [], cfg = [[8, [16, 32]], [16, [64, 128]], [32, [256, 512]]];
    cfg.forEach(function (c) {
      var step = c[0], fm = Math.ceil(size / step);
      for (var i = 0; i < fm; i++) for (var j = 0; j < fm; j++) c[1].forEach(function (m) { out.push([(j + 0.5) * step / size, (i + 0.5) * step / size, m / size, m / size]); });
    });
    return out;
  }
  var PRI = null;
  async function findFaces(srcCanvas) {
    var s = await session('det', ['face-detect.onnx']);
    var S = 640, W = srcCanvas.width, H = srcCanvas.height, k = S / Math.max(W, H);
    var c = canvas(S, S), x = ctx2(c); x.fillStyle = 'rgb(123,117,104)'; x.fillRect(0, 0, S, S); x.drawImage(srcCanvas, 0, 0, W * k, H * k);
    var px = x.getImageData(0, 0, S, S).data, plane = S * S, inp = new Float32Array(3 * plane);
    for (var i = 0; i < plane; i++) { inp[i] = px[i * 4 + 2] - 104; inp[plane + i] = px[i * 4 + 1] - 117; inp[2 * plane + i] = px[i * 4] - 123; }
    var r = await s.run({ input: new (ort().Tensor)('float32', inp, [1, 3, S, S]) });
    var loc = r.loc.data, conf = r.conf.data, lm = r.landms.data;
    if (!PRI) PRI = priors(S);
    var faces = [];
    for (var p = 0; p < PRI.length; p++) {
      var sc = conf[p * 2 + 1]; if (sc < 0.85) continue;
      var pr = PRI[p], cx = pr[0] + loc[p * 4] * 0.1 * pr[2], cy = pr[1] + loc[p * 4 + 1] * 0.1 * pr[3], w = pr[2] * Math.exp(loc[p * 4 + 2] * 0.2), h = pr[3] * Math.exp(loc[p * 4 + 3] * 0.2);
      var pts = []; for (var q = 0; q < 5; q++) pts.push([(pr[0] + lm[p * 10 + q * 2] * 0.1 * pr[2]) * S / k, (pr[1] + lm[p * 10 + q * 2 + 1] * 0.1 * pr[3]) * S / k]);
      faces.push({ score: sc, box: [(cx - w / 2) * S / k, (cy - h / 2) * S / k, (cx + w / 2) * S / k, (cy + h / 2) * S / k], pts: pts });
    }
    faces.sort(function (a, b) { return b.score - a.score; });
    var keep = [];
    faces.forEach(function (f) { if (keep.every(function (g) { return iou(f.box, g.box) < 0.4; })) keep.push(f); });
    return keep.filter(function (f) { var e = f.pts[1][0] - f.pts[0][0], ey = f.pts[1][1] - f.pts[0][1]; return Math.hypot(e, ey) >= 7; });
  }
  function iou(a, b) {
    var x1 = Math.max(a[0], b[0]), y1 = Math.max(a[1], b[1]), x2 = Math.min(a[2], b[2]), y2 = Math.min(a[3], b[3]);
    var i = Math.max(0, x2 - x1) * Math.max(0, y2 - y1), u = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - i; return u > 0 ? i / u : 0;
  }

  // similarity transform (scale, rotation, shift) mapping src points onto dst points (least squares)
  function similarity(src, dst) {
    var n = src.length, mx = 0, my = 0, nx = 0, ny = 0;
    for (var i = 0; i < n; i++) { mx += src[i][0]; my += src[i][1]; nx += dst[i][0]; ny += dst[i][1]; }
    mx /= n; my /= n; nx /= n; ny /= n;
    var a = 0, b = 0, d = 0;
    for (i = 0; i < n; i++) {
      var sx = src[i][0] - mx, sy = src[i][1] - my, tx = dst[i][0] - nx, ty = dst[i][1] - ny;
      a += sx * tx + sy * ty; b += sx * ty - sy * tx; d += sx * sx + sy * sy;
    }
    a /= d; b /= d;   // matrix [[a,-b],[b,a]]
    return { a: a, b: b, e: nx - (a * mx - b * my), f: ny - (b * mx + a * my) };
  }
  var TEMPLATE = [[192.98138, 239.94708], [318.90277, 240.1936], [256.63416, 314.01935], [201.26117, 371.41043], [313.08905, 371.15118]];

  // ---------- 3) restore each face and paste it back ----------
  // faces are cut from the ORIGINAL photo (full detail, like the official GFPGAN pipeline) and pasted into the big one
  async function restoreFaces(big, faces, scale, strength, onFace, orig, origScale) {
    var s = await session('face', FACE_FILES);
    var mask = faceMask();
    for (var fi = 0; fi < faces.length; fi++) {
      var pts = faces[fi].pts.map(function (p) { return [p[0] * scale, p[1] * scale]; });
      var M = similarity(pts, TEMPLATE);
      var from = big, C = M;
      if (orig && origScale) { from = orig; C = similarity(faces[fi].pts.map(function (p) { return [p[0] * origScale, p[1] * origScale]; }), TEMPLATE); }
      // crop + align to 512 × 512
      var crop = canvas(512, 512), cx = ctx2(crop);
      cx.fillStyle = 'rgb(135,133,132)'; cx.fillRect(0, 0, 512, 512);
      cx.setTransform(C.a, C.b, -C.b, C.a, C.e, C.f); cx.imageSmoothingQuality = 'high'; cx.drawImage(from, 0, 0); cx.setTransform(1, 0, 0, 1, 0, 0);
      var px = cx.getImageData(0, 0, 512, 512), d = px.data, plane = 512 * 512, inp = new Float32Array(3 * plane);
      for (var i = 0; i < plane; i++) { inp[i] = d[i * 4] / 127.5 - 1; inp[plane + i] = d[i * 4 + 1] / 127.5 - 1; inp[2 * plane + i] = d[i * 4 + 2] / 127.5 - 1; }
      var r = await s.run({ input: new (ort().Tensor)('float32', inp, [1, 3, 512, 512]) });
      var o = r.output.data instanceof Float32Array ? r.output.data : await r.output.getData();
      var w = strength, iw = 1 - w;
      for (i = 0; i < plane; i++) {
        var R = (Math.max(-1, Math.min(1, o[i])) + 1) * 127.5, G = (Math.max(-1, Math.min(1, o[plane + i])) + 1) * 127.5, B = (Math.max(-1, Math.min(1, o[2 * plane + i])) + 1) * 127.5;
        d[i * 4] = R * w + d[i * 4] * iw; d[i * 4 + 1] = G * w + d[i * 4 + 1] * iw; d[i * 4 + 2] = B * w + d[i * 4 + 2] * iw; d[i * 4 + 3] = 255;
      }
      cx.putImageData(px, 0, 0);
      // soft edge, then back into the picture with the inverse transform
      cx.globalCompositeOperation = 'destination-in'; cx.drawImage(mask, 0, 0); cx.globalCompositeOperation = 'source-over';
      var det = M.a * M.a + M.b * M.b, ia = M.a / det, ib = -M.b / det;
      var ie = -(ia * M.e - ib * M.f), iff = -(ib * M.e + ia * M.f);
      var bx = big.getContext('2d'); bx.save(); bx.setTransform(ia, ib, -ib, ia, ie, iff); bx.imageSmoothingQuality = 'high'; bx.drawImage(crop, 0, 0); bx.restore();
      if (onFace && onFace(fi + 1, faces.length, faces[fi]) === false) break;
      await tick();
    }
  }
  function faceMask() {
    var m = canvas(512, 512), x = m.getContext('2d'), a = x.createImageData(512, 512), d = a.data, edge = 28, inset = 10;
    for (var y = 0; y < 512; y++) for (var xx = 0; xx < 512; xx++) {
      var dist = Math.min(xx - inset, y - inset, 511 - inset - xx, 511 - inset - y), v = Math.max(0, Math.min(1, dist / edge));
      v = v * v * (3 - 2 * v); var k = (y * 512 + xx) * 4; d[k] = d[k + 1] = d[k + 2] = 255; d[k + 3] = v * 255;
    }
    x.putImageData(a, 0, 0); return m;
  }

  // how long this device needs per picture pixel (ms), measured on a small test piece
  async function speed(key) {
    var s = await session('sr-' + key, [SR[key].file]), N = 96, x = new (ort().Tensor)('float32', new Float32Array(3 * N * N), [1, 3, N, N]);
    await s.run({ input: x });
    var t = performance.now(); var r = await s.run({ input: x }); try { r.output.getData && await r.output.getData(); } catch (e) {}
    return (performance.now() - t) / (N * N);
  }
  // studio finish: fine detail (small-radius sharpening) + clarity (gentle local contrast). Colours unchanged.
  function finish(c, amount) {
    if (!amount) return c;
    var W = c.width, H = c.height, x = c.getContext('2d', { willReadFrequently: true });
    var blur = function (px) {
      var b = canvas(W, H), bx = b.getContext('2d');
      if ('filter' in bx) { bx.filter = 'blur(' + px + 'px)'; bx.drawImage(c, 0, 0); bx.filter = 'none'; }
      else { var sm = canvas(Math.max(1, W / (px * 2)), Math.max(1, H / (px * 2))); sm.getContext('2d').drawImage(c, 0, 0, sm.width, sm.height); bx.imageSmoothingQuality = 'high'; bx.drawImage(sm, 0, 0, W, H); }
      return bx.getImageData(0, 0, W, H).data;
    };
    var img = x.getImageData(0, 0, W, H), d = img.data, fine = blur(Math.max(0.8, W / 3200)), wide = blur(Math.max(12, W / 140));
    var a1 = 0.55 * amount, a2 = 0.16 * amount;
    for (var i = 0; i < d.length; i += 4) {
      for (var ch = 0; ch < 3; ch++) {
        var v = d[i + ch], f = v - fine[i + ch], w = v - wide[i + ch];
        if (f > 18) f = 18; else if (f < -18) f = -18;          // no halos around strong edges
        d[i + ch] = v + a1 * f + a2 * w;
      }
    }
    x.putImageData(img, 0, 0); return c;
  }

  window.SPEnhance = {
    speed: speed, finish: finish,
    pickBackend: pickBackend, backend: function () { return backend; }, isCached: isCached, SR: SR, FACE_FILES: FACE_FILES, FACE_MB: FACE_MB,
    load: function (key, files, onProgress) { return session(key, files, onProgress); },
    upscale: upscale, findFaces: findFaces, restoreFaces: restoreFaces, resize: resize, canvas: canvas
  };
})();
