/* S Printer — AI image check.
 * Says how likely a picture is to be made by AI, on this device (nothing is uploaded).
 * Method and probe weights: "SynthID-detector" learned detector by peter119lee (MIT licence,
 * github.com/Rinne414/SynthID-detector): OpenAI CLIP ViT-L/14 image features + a logistic probe.
 * Probe weights licence (SynthID-detector):
 *   MIT License
 *   
 *   Copyright (c) 2026 peter119lee
 *   
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *   
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 *   
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 * The CLIP model (Xenova/clip-vit-large-patch14, ONNX) is downloaded once from Hugging Face and kept in the browser cache. */
(function () {
  'use strict';
  var COEF = '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', INTERCEPT = 0.04680592939257622, THRESHOLD = 0.4582911431789398, JPEG_Q = 0.88;
  var HF = 'https://huggingface.co/';
  var MODELS = {
    q8: { url: HF + 'Xenova/clip-vit-large-patch14/resolve/main/onnx/vision_model_quantized.onnx', mb: 307 },
    fp16: { url: HF + 'Xenova/clip-vit-large-patch14/resolve/main/onnx/vision_model_fp16.onnx', mb: 609 }
  };
  // final layer-norm of the CLIP image tower (the ONNX file stops just before it)
  var LN = [
    { url: HF + 'timm/vit_large_patch14_clip_224.openai/resolve/main/model.safetensors', w: 'norm.weight', b: 'norm.bias' },
    { url: HF + 'openai/clip-vit-large-patch14/resolve/main/model.safetensors', w: 'vision_model.post_layernorm.weight', b: 'vision_model.post_layernorm.bias' }
  ];
  var MEAN = [0.48145466, 0.4578275, 0.40821073], STD = [0.26862954, 0.26130258, 0.27577711], SIZE = 224, CACHE = 'sp-aicheck-v1';
  function b64f32(s) { var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Float32Array(u.buffer); }
  var coef = b64f32(COEF);
  var ME = (document.currentScript && document.currentScript.src) || location.href;
  function O() { return window.ort; }

  function h2f(h) { var s = (h & 0x8000) ? -1 : 1, e = (h >> 10) & 0x1f, f = h & 0x3ff; if (e === 0) return s * Math.pow(2, -14) * (f / 1024); if (e === 31) return f ? NaN : s * Infinity; return s * Math.pow(2, e - 15) * (1 + f / 1024); }
  function f2h(v) { var f = new Float32Array(1), u = new Uint32Array(f.buffer); f[0] = v; var x = u[0], s = (x >> 16) & 0x8000, e = ((x >> 23) & 0xff) - 112, m = x & 0x7fffff; if (e <= 0) return s; if (e >= 31) return s | 0x7c00; return s | (e << 10) | (m >> 13); }
  function toF32(data) { if (data instanceof Float32Array) return data; if (data instanceof Uint16Array) { var o = new Float32Array(data.length); for (var i = 0; i < data.length; i++) o[i] = h2f(data[i]); return o; } return Float32Array.from(data); }

  async function cached(url, onp, mb) {
    var c = null; try { c = await caches.open(CACHE); var hit = await c.match(url); if (hit) { onp && onp(1); return await hit.arrayBuffer(); } } catch (e) { c = null; }
    var r = await fetch(url, { mode: 'cors' }); if (!r.ok) throw new Error('download failed (' + r.status + ')');
    var tot = +r.headers.get('content-length') || mb * 1048576, got = 0, rd = r.body.getReader(), parts = [];
    for (;;) { var x = await rd.read(); if (x.done) break; parts.push(x.value); got += x.value.length; onp && onp(Math.min(0.999, got / tot)); }
    var buf = new Uint8Array(got), off = 0; parts.forEach(function (p) { buf.set(p, off); off += p.length; });
    if (c) { try { await c.put(url, new Response(buf, { headers: { 'content-type': 'application/octet-stream' } })); } catch (e) {} }
    onp && onp(1); return buf.buffer;
  }
  async function range(url, a, b) { var r = await fetch(url, { headers: { Range: 'bytes=' + a + '-' + b } }); if (!(r.status === 206 || r.status === 200)) throw new Error('range ' + r.status); var ab = await r.arrayBuffer(); return r.status === 200 ? ab.slice(a, b + 1) : ab; }
  function asF32(ab, dt) { if (dt === 'F32') return new Float32Array(ab); if (dt === 'F16') return toF32(new Uint16Array(ab)); if (dt === 'BF16') { var u = new Uint16Array(ab), o = new Float32Array(u.length), t = new Uint32Array(1), f = new Float32Array(t.buffer); for (var i = 0; i < u.length; i++) { t[0] = u[i] << 16; o[i] = f[0]; } return o; } throw new Error('dtype ' + dt); }
  async function lnWeights() {
    try { var s = localStorage.getItem('sp-aicheck-ln'); if (s) { var j = JSON.parse(s); return { w: b64f32(j.w), b: b64f32(j.b) }; } } catch (e) {}
    var last;
    for (var i = 0; i < LN.length; i++) {
      try {
        var L = LN[i], n = new DataView(await range(L.url, 0, 7)).getUint32(0, true);
        var hdr = JSON.parse(new TextDecoder().decode(await range(L.url, 8, 8 + n - 1))), base = 8 + n, tw = hdr[L.w], tb = hdr[L.b];
        if (!tw || !tb) throw new Error('keys');
        var w = asF32(await range(L.url, base + tw.data_offsets[0], base + tw.data_offsets[1] - 1), tw.dtype), b = asF32(await range(L.url, base + tb.data_offsets[0], base + tb.data_offsets[1] - 1), tb.dtype);
        if (w.length !== 1024 || b.length !== 1024) throw new Error('size');
        try { var enc = function (a) { var u = new Uint8Array(new Float32Array(a).buffer), s2 = ''; for (var k = 0; k < u.length; k++) s2 += String.fromCharCode(u[k]); return btoa(s2); }; localStorage.setItem('sp-aicheck-ln', JSON.stringify({ w: enc(w), b: enc(b) })); } catch (e) {}
        return { w: w, b: b };
      } catch (e) { last = e; }
    }
    throw last || new Error('layer norm');
  }

  var sess = null, ln = null, kind = null, f16in = false;
  async function gpuF16() { try { if (!navigator.gpu) return false; var a = await navigator.gpu.requestAdapter(); return !!(a && a.features && a.features.has('shader-f16')); } catch (e) { return false; } }
  async function prepare(onp) {
    if (sess) return sess;
    var ort = O(); ort.env.wasm.wasmPaths = new URL('../vendor/ort/', ME).href;
    ort.env.wasm.numThreads = (self.crossOriginIsolated && navigator.hardwareConcurrency) ? Math.min(4, navigator.hardwareConcurrency) : 1;
    var lnP = lnWeights();
    var useGpu = await gpuF16(); kind = useGpu ? 'fp16' : 'q8';
    var bytes;
    try { bytes = await cached(MODELS[kind].url, onp, MODELS[kind].mb); }
    catch (e) { if (kind === 'fp16') { kind = 'q8'; useGpu = false; bytes = await cached(MODELS.q8.url, onp, MODELS.q8.mb); } else throw e; }
    try { sess = await ort.InferenceSession.create(new Uint8Array(bytes), { executionProviders: useGpu ? ['webgpu', 'wasm'] : ['wasm'], graphOptimizationLevel: 'all' }); }
    catch (e) { if (!useGpu) throw e; kind = 'q8'; bytes = await cached(MODELS.q8.url, onp, MODELS.q8.mb); sess = await ort.InferenceSession.create(new Uint8Array(bytes), { executionProviders: ['wasm'], graphOptimizationLevel: 'all' }); }
    bytes = null; ln = await lnP; return sess;
  }

  // ----- picture → 224×224 CLIP input, matching the detector's training (JPEG q88, bicubic resize, centre crop) -----
  function loadImg(src) { return new Promise(function (ok, no) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { no(new Error('image')); }; i.src = src; }); }
  async function jpegRound(img) {
    var c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
    var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0);
    var blob = await new Promise(function (ok) { c.toBlob(ok, 'image/jpeg', JPEG_Q); }), u = URL.createObjectURL(blob);
    try { return await loadImg(u); } finally { setTimeout(function () { URL.revokeObjectURL(u); }, 1000); }
  }
  function resizeShort(img) {
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, k = SIZE / Math.min(w, h), tw = Math.max(SIZE, Math.round(w * k)), th = Math.max(SIZE, Math.round(h * k));
    var src = img, cw = w, ch = h;
    while (cw / 2 >= tw && ch / 2 >= th) { var s = document.createElement('canvas'); s.width = Math.round(cw / 2); s.height = Math.round(ch / 2); var sg = s.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(src, 0, 0, s.width, s.height); src = s; cw = s.width; ch = s.height; }
    var c = document.createElement('canvas'); c.width = SIZE; c.height = SIZE; var g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    var sx = (tw - SIZE) / 2 / tw * cw, sy = (th - SIZE) / 2 / th * ch; g.drawImage(src, sx, sy, SIZE / tw * cw, SIZE / th * ch, 0, 0, SIZE, SIZE);
    return g.getImageData(0, 0, SIZE, SIZE).data;
  }
  function toCHW(px) { var n = SIZE * SIZE, o = new Float32Array(3 * n); for (var i = 0; i < n; i++) for (var c = 0; c < 3; c++) o[c * n + i] = (px[i * 4 + c] / 255 - MEAN[c]) / STD[c]; return o; }

  async function check(img, onp) {
    await prepare(onp);
    var x = toCHW(resizeShort(await jpegRound(img))), ort = O(), inName = sess.inputNames[0], out;
    var run = function (half) { var t = half ? new ort.Tensor('float16', Uint16Array.from(x, f2h), [1, 3, SIZE, SIZE]) : new ort.Tensor('float32', x, [1, 3, SIZE, SIZE]); var f = {}; f[inName] = t; return sess.run(f); };
    try { out = await run(f16in); } catch (e) { f16in = !f16in; out = await run(f16in); }
    var feat;
    if (out.pooler_output) feat = toF32(out.pooler_output.data).slice(0, 1024);
    else {
      var hs = out.last_hidden_state || out[sess.outputNames.filter(function (n) { return /hidden/.test(n); })[0]]; if (!hs) throw new Error('no features in model output');
      var cls = toF32(hs.data).slice(0, 1024), mu = 0, v = 0, i; for (i = 0; i < 1024; i++) mu += cls[i]; mu /= 1024; for (i = 0; i < 1024; i++) v += (cls[i] - mu) * (cls[i] - mu); v /= 1024;
      var sd = Math.sqrt(v + 1e-5); feat = new Float32Array(1024); for (i = 0; i < 1024; i++) feat[i] = (cls[i] - mu) / sd * ln.w[i] + ln.b[i];
    }
    var nrm = 0; for (var k = 0; k < 1024; k++) nrm += feat[k] * feat[k]; nrm = Math.sqrt(nrm) + 1e-8;
    var logit = INTERCEPT; for (k = 0; k < 1024; k++) logit += feat[k] / nrm * coef[k];
    var p = 1 / (1 + Math.exp(-logit));
    return { p: p, ai: p >= THRESHOLD, threshold: THRESHOLD, engine: kind };
  }
  window.SPAICheck = { prepare: prepare, check: check, models: MODELS, _coef: coef };
})();
