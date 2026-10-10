/*!
 * S Printer runtime helper.
 * The tools were originally backed by a PHP server (sessions, quotas, logins).
 * This static build answers those calls locally, so every tool works on any
 * static host (GitHub Pages, Netlify, a USB stick served with any web server).
 */
(function () {
  'use strict';

  // Some tools pick their mode from the URL path (e.g. /tool/jpg-to-pdf).
  // Hosts like GitHub Pages serve "page.html" also at "page", so drop ".html".
  try {
    var p = location.pathname;
    if (/\/(tool|service)\/[^\/]+\.html$/.test(p)) {
      history.replaceState(history.state, '', p.replace(/\.html$/, '') + location.search + location.hash);
    }
  } catch (e) { /* file:// or sandboxed */ }

  // The original code only ran on its old domain (plus localhost). Let the
  // allow-lists accept whatever host S Printer is published on.
  (function () {
    var host = location.hostname;
    function isHostList(arr) {
      return arr && arr.length && arr.length < 12 &&
        Array.prototype.indexOf.call(arr, 'localhost') !== -1 &&
        Array.prototype.indexOf.call(arr, '127.0.0.1') !== -1;
    }
    var inc = Array.prototype.includes, idx = Array.prototype.indexOf, some = Array.prototype.some;
    Object.defineProperty(Array.prototype, 'includes', {
      configurable: true, writable: true,
      value: function (v) {
        if (v === host && isHostList(this)) return true;
        return inc.apply(this, arguments);
      }
    });
    Object.defineProperty(Array.prototype, 'indexOf', {
      configurable: true, writable: true,
      value: function (v) {
        var r = idx.apply(this, arguments);
        if (r === -1 && v === host && this && this.length < 12 && idx.call(this, 'localhost') !== -1 && idx.call(this, '127.0.0.1') !== -1) return 0;
        return r;
      }
    });
    Object.defineProperty(Array.prototype, 'some', {
      configurable: true, writable: true,
      value: function (fn, t) {
        if (isHostList(this)) return true;
        return some.apply(this, arguments);
      }
    });
  })();

  // No analytics in this build.
  window.akAnalytics = Object.freeze({ track: function () {} });
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {};

  function json(obj, status) {
    return new Response(JSON.stringify(obj), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  function fieldGetter(body) {
    var params = null;
    try {
      if (body instanceof URLSearchParams || body instanceof FormData) params = body;
      else if (typeof body === 'string') {
        if (body.charAt(0) === '{') {
          var o = JSON.parse(body);
          return function (k) { return o[k] == null ? null : String(o[k]); };
        }
        params = new URLSearchParams(body);
      }
    } catch (e) { params = null; }
    return function (k) { return params && params.get ? params.get(k) : null; };
  }

  var LEGACY_HOST = /(^|\.)akprinthub\.com$|hostingersite\.com$/i;
  var nativeFetch = window.fetch ? window.fetch.bind(window) : null;

  function localAnswer(url, method, body) {
    var u;
    try { u = new URL(url, location.href); } catch (e) { return null; }

    // Old cloud services are gone: report "unavailable" so tools use their
    // built-in browser fallbacks.
    if (LEGACY_HOST.test(u.hostname)) return json({ error: 'Service not available in S Printer', code: 'service_unavailable' }, 503);
    if (u.origin !== location.origin) return null;

    var get = fieldGetter(body);
    var path = u.pathname;

    // Photo print studio (A4 / 4x6 / notary / joint / remove background)
    if (/photo-print\.php$/.test(path)) {
      var a = get('action');
      if (a === 'session') return json({ success: true, csrf: 'local', accessKey: 'local' });
      if (a === 'begin') return json({ success: true, job: 'local-' + Date.now() });
      if (a === 'auth_return') return json({ success: true });
      return json({ error: 'Using in-browser processing', reason: 'service' }, 503);
    }

    // Document crop session checks
    if (u.searchParams.has('export_session')) return json({ loggedIn: true, csrf: 'local' });
    if (u.searchParams.has('auth_start')) return json({ loggedIn: true });

    if (method === 'POST') {
      var at = get('action_type') || get('action');
      if (u.searchParams.has('photo_direct_token')) return json({ error: 'Using in-browser processing' }, 503);
      if (at && /^(authorize_|check_|consume_|log_|record_|track_|increment_|use_)/.test(at)) {
        return json({ status: 'success', success: true, allowed: true, remaining: 999999, count: 0 });
      }
      if (at && /(_ai$|^analyze_|^issue_|token|ai_)/.test(at)) {
        return json({ status: 'error', code: 'service_unavailable', message: 'Automatic detection is not available. Please adjust manually.' }, 503);
      }
      if (at && /^save_|^delete_|^update_|^set_/.test(at)) return json({ status: 'success', success: true });
      return json({ status: 'success', success: true, allowed: true, count: 0, downloadsUsed: 0 });
    }

    // GET calls against the page itself with an "action" parameter
    if (u.searchParams.has('action') && /\/(service|tool)\//.test(path)) {
      return json({ status: 'success', success: true, data: [], items: [], templates: [] });
    }
    return null;
  }

  if (nativeFetch) {
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || String(input);
      var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      var body = init && init.body;
      var answer = null;
      try { answer = localAnswer(url, method, body); } catch (e) { answer = null; }
      if (answer) return Promise.resolve(answer);
      return nativeFetch(input, init);
    };
  }

  // Same for XMLHttpRequest based calls.
  var XO = window.XMLHttpRequest && XMLHttpRequest.prototype.open;
  var XS = window.XMLHttpRequest && XMLHttpRequest.prototype.send;
  if (XO && XS) {
    XMLHttpRequest.prototype.open = function (m, url) {
      this.__sp = { m: String(m || 'GET').toUpperCase(), url: url };
      return XO.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (body) {
      var info = this.__sp, ans = null, xhr = this;
      try { ans = info && localAnswer(info.url, info.m, body); } catch (e) { ans = null; }
      if (!ans) return XS.apply(this, arguments);
      ans.text().then(function (txt) {
        var st = ans.status;
        Object.defineProperty(xhr, 'readyState', { value: 4, configurable: true });
        Object.defineProperty(xhr, 'status', { value: st, configurable: true });
        Object.defineProperty(xhr, 'responseText', { value: txt, configurable: true });
        Object.defineProperty(xhr, 'response', { value: xhr.responseType === 'json' ? JSON.parse(txt) : txt, configurable: true });
        ['readystatechange', 'load', 'loadend'].forEach(function (t) {
          try { xhr.dispatchEvent(new Event(t)); } catch (e) {}
          if (typeof xhr['on' + t] === 'function') try { xhr['on' + t](); } catch (e) {}
        });
      });
    };
  }

  // Name downloaded files after S Printer.
  (function () {
    function rename(v) {
      return typeof v === 'string' ? v.replace(/ak[\s_-]?print[\s_-]?hub(\.com)?/ig, 'SPrinter') : v;
    }
    var d = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'download');
    if (d && d.set) {
      Object.defineProperty(HTMLAnchorElement.prototype, 'download', {
        configurable: true, enumerable: d.enumerable,
        get: d.get, set: function (v) { d.set.call(this, rename(v)); }
      });
    }
    var sa = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (n, v) {
      if (this instanceof HTMLAnchorElement && String(n).toLowerCase() === 'download') v = rename(v);
      return sa.call(this, n, v);
    };
    if (window.File) {
      var NF = window.File;
      try {
        window.File = function (bits, name, opts) { return new NF(bits, rename(name), opts); };
        window.File.prototype = NF.prototype;
      } catch (e) {}
    }
  })();

  // Clean up messages that still mention the old cloud service or brand.
  (function () {
    var BRAND = /Ak[\s_-]?Print[\s_-]?Hub(\.com)?|AKPRINTHUB/g;
    var GPU_NOTE = /GPU par save nahi hui|retry the GPU service|GPU service/i;
    function fixText(node) {
      var t = node.nodeValue;
      if (!t || t.length > 600) return;
      if (/GPU offline tha/i.test(t)) { node.nodeValue = t.replace(/GPU offline tha;?\s*browser ne photo ko automatically crop kiya\.?/i, 'Cropped automatically in your browser. Use Manual Crop to adjust.'); return; }
      if (BRAND.test(t)) { BRAND.lastIndex = 0; node.nodeValue = t.replace(BRAND, 'SPrinter'); }
      BRAND.lastIndex = 0;
      if (GPU_NOTE.test(t)) {
        if (/GPU par save nahi hui/i.test(t)) {
          node.nodeValue = 'Photo added to the sheet.';
        } else {
          node.nodeValue = t.replace(/ or retry the GPU service\.?/i, '.').replace(/GPU service/i, 'service');
        }
      }
    }
    function walk(root) {
      if (!root) return;
      if (root.nodeType === 3) return fixText(root);
      if (root.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(root.nodeName)) return;
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) fixText(n);
    }
    function start() {
      walk(document.body);
      new MutationObserver(function (list) {
        list.forEach(function (m) {
          if (m.type === 'characterData') fixText(m.target);
          else m.addedNodes.forEach(walk);
        });
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  })();

  // Mark the current page in the S Printer navigation.
  document.addEventListener('DOMContentLoaded', function () {
    var here = location.pathname.replace(/\.html$/, '').split('/').pop();
    document.querySelectorAll('.sp-nav a').forEach(function (a) {
      var t = (a.getAttribute('href') || '').replace(/\.html.*$/, '').split('/').pop();
      if (t && t === here) a.setAttribute('aria-current', 'page');
    });
  });
})();

/* Motion helpers: scroll progress, back-to-top, signature reveal. */
(function () {
  'use strict';
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var root = document.documentElement;
    var bar = document.createElement('div'); bar.className = 'sp-progress'; bar.setAttribute('aria-hidden', 'true');
    var top = document.createElement('button'); top.className = 'sp-top'; top.type = 'button'; top.setAttribute('aria-label', 'Back to top');
    top.innerHTML = '<svg class="ring" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/></svg><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    top.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(bar); document.body.appendChild(top);
    var ticking = false;
    function update() {
      ticking = false;
      var h = root.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
      root.style.setProperty('--sp-p', p.toFixed(4));
      top.classList.toggle('show', scrollY > 600);
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update); update();

    var sigs = document.querySelectorAll('.sp-sig');
    if (!sigs.length) return;
    if (!('IntersectionObserver' in window)) { sigs.forEach(function (s) { s.classList.add('draw'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('draw'); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    sigs.forEach(function (s) { io.observe(s); });
  });
})();

/* Crop & rotate fixes.
 * 1) After any rotate, re-fit the crop frame around the whole rotated photo
 *    (keeps a fixed aspect ratio when the tool uses one).
 * 2) Keep the floating "All tools" badge from covering tool buttons. */
(function () {
  'use strict';
  // Fit the whole (rotated) photo in view, then put the crop frame around it.
  function spFit(cr) {
    try {
      var k = cr.getContainerData(), c = cr.getCanvasData();
      if (c.width && c.height) {
        cr.setCropBoxData({ left: k.width / 2 - 10, top: k.height / 2 - 10, width: 20, height: 20 });
        c = cr.getCanvasData();
        var asp = c.width / c.height, w = Math.min(k.width, k.height * asp) * 0.98;
        cr.setCanvasData({ width: w });
        c = cr.getCanvasData();
        cr.setCanvasData({ left: (k.width - c.width) / 2, top: (k.height - c.height) / 2 });
      }
      spRefit(cr);
    } catch (e) {}
  }
  function spRefit(cr) {
    try {
      var c = cr.getCanvasData(), k = cr.getContainerData();
      var L = Math.max(c.left, 0), T = Math.max(c.top, 0);
      var R = Math.min(c.left + c.width, k.width), B = Math.min(c.top + c.height, k.height);
      var w = (R - L) * 0.96, h = (B - T) * 0.96, ar = cr.options.aspectRatio;
      if (ar > 0) { if (w / h > ar) w = h * ar; else h = w / ar; }
      if (w > 10 && h > 10) cr.setCropBoxData({ left: L + (R - L - w) / 2, top: T + (B - T - h) / 2, width: w, height: h });
    } catch (e) {}
  }
  window.__spRefitCropper = spRefit;
  function patchCropper(C) {
    if (!C || !C.prototype || C.prototype.__spPatched) return;
    var rotate = C.prototype.rotate;
    C.prototype.rotate = function (deg) {
      var r = rotate.apply(this, arguments);
      var self = this;
      if (this.ready && this.cropped) requestAnimationFrame(function () {
        spFit(self);
        try { self.element.dispatchEvent(new CustomEvent('sp:rotated', { detail: self })); } catch (e) {}
      });
      return r;
    };
    C.prototype.__spPatched = true;
  }
  if (window.Cropper) patchCropper(window.Cropper);
  else {
    var held;
    try {
      Object.defineProperty(window, 'Cropper', {
        configurable: true, enumerable: true,
        get: function () { return held; },
        set: function (v) { held = v; patchCropper(v); }
      });
    } catch (e) {}
  }

  // Badge avoidance: if the badge sits on top of something clickable, move it; if both corners are busy, hide it.
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var fab = document.querySelector('.sp-home-fab');
    if (!fab) return;
    var CLICKABLE = 'button,a,input,select,textarea,label,[role=button],[onclick],canvas';
    function blocked() {
      var r = fab.getBoundingClientRect(); if (!r.width) return false;
      var pts = [[r.left + 6, r.top + r.height / 2], [r.right - 6, r.top + r.height / 2], [r.left + r.width / 2, r.top + 4], [r.left + r.width / 2, r.bottom - 4]];
      fab.style.pointerEvents = 'none'; var prev = fab.style.visibility; fab.style.visibility = 'hidden';
      var hit = pts.some(function (p) { var e = document.elementFromPoint(p[0], p[1]); return e && e !== document.body && e.closest(CLICKABLE) && !e.closest('.sp-home-fab'); });
      fab.style.visibility = prev; fab.style.pointerEvents = '';
      return hit;
    }
    function place() {
      fab.classList.remove('sp-fab-left', 'sp-fab-hide');
      if (!blocked()) return;
      fab.classList.add('sp-fab-left');
      if (blocked()) { fab.classList.remove('sp-fab-left'); fab.classList.add('sp-fab-hide'); }
    }
    var t; function soon() { clearTimeout(t); t = setTimeout(place, 120); }
    new MutationObserver(soon).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    addEventListener('resize', soon); setInterval(place, 1500); place();
  });
})();

/* Easier manual cropping.
 * 1) Tap (or click) on the photo outside the crop frame: zoom in there and move the frame onto that spot.
 * 2) Cap PDF page renders at print quality (A4 @ 300 DPI) so phones can handle e-Aadhaar/PAN PDFs. */
(function () {
  'use strict';
  var down = null;
  document.addEventListener('pointerdown', function (e) {
    var area = e.target.closest && e.target.closest('.cropper-container');
    down = area ? { x: e.clientX, y: e.clientY, t: Date.now(), area: area, onBox: !!e.target.closest('.cropper-crop-box'), n: e.isPrimary } : null;
  }, true);
  document.addEventListener('pointerup', function (e) {
    var d = down; down = null;
    if (!d || d.onBox || !d.n || Date.now() - d.t > 400 || Math.abs(e.clientX - d.x) > 8 || Math.abs(e.clientY - d.y) > 8) return;
    var img = d.area.previousElementSibling, cr = img && img.cropper;
    if (!cr || !cr.ready || cr.disabled) return;
    try {
      var r = d.area.getBoundingClientRect(), px = d.x - r.left, py = d.y - r.top;
      var cv = cr.getCanvasData();
      if (px < cv.left || py < cv.top || px > cv.left + cv.width || py > cv.top + cv.height) return; // tapped outside the photo
      var k = cr.getContainerData(), im = cr.getImageData();
      var cur = cv.width / (cv.naturalWidth || im.naturalWidth || cv.width);
      var target = cur * 1.8, maxR = 8 * Math.min(k.width / (cv.naturalWidth || 1), k.height / (cv.naturalHeight || 1));
      if (cv.width < k.width * 3) cr.zoomTo(Math.min(target, maxR), { x: px, y: py });
      // bring the tapped spot to the middle of the view
      cr.move(k.width / 2 - px, k.height / 2 - py);
      px = k.width / 2; py = k.height / 2;
      // centre the crop frame there (same size, kept inside the photo)
      var cb = cr.getCropBoxData(); cv = cr.getCanvasData();
      var w = Math.min(cb.width, cv.width), h = Math.min(cb.height, cv.height);
      var left = Math.max(cv.left, Math.min(px - w / 2, cv.left + cv.width - w));
      var top = Math.max(cv.top, Math.min(py - h / 2, cv.top + cv.height - h));
      cr.setCropBoxData({ left: left, top: top, width: w, height: h });
    } catch (err) {}
  }, true);

  // PDF render cap
  var MAX_SIDE = 3508;
  // ---- automatic digital-signature check for every tool that opens a PDF ----
  var SP_BASE = (function () {
    var sc = document.currentScript && document.currentScript.src;
    if (!sc) { var all = document.querySelectorAll('script[src*="assets/sprinter/sprinter.js"]'); sc = all.length ? all[all.length - 1].src : ''; }
    return sc ? sc.replace(/assets\/sprinter\/sprinter\.js.*$/, '') : '';
  })();
  var sigLibs = null;
  function loadSigLibs() {
    if (window.SPSig && window.forge && window.SP_TRUSTED_ROOTS) return Promise.resolve();
    if (sigLibs) return sigLibs;
    var one = function (src) {
      return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = SP_BASE + src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    };
    sigLibs = (window.forge ? Promise.resolve() : one('assets/vendor/forge.min.js'))
      .then(function () { return window.SP_TRUSTED_ROOTS ? 0 : one('assets/sigverify/roots.js?v=15'); })
      .then(function () { return window.SPSig ? 0 : one('assets/sigverify/sigverify.js?v=15'); });
    return sigLibs;
  }
  function sigManaged() { return document.body && document.body.classList.contains('cp-body'); } // the card tool does its own check
  function bytesOf(src) {
    try {
      var d = src && (src.data !== undefined ? src.data : src);
      if (d instanceof ArrayBuffer) return Promise.resolve(new Uint8Array(d.slice(0)));
      if (ArrayBuffer.isView(d)) return Promise.resolve(new Uint8Array(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength)));
      var url = typeof src === 'string' ? src : (src && src.url) || (src instanceof URL ? String(src) : null);
      if (url) return fetch(String(url)).then(function (r) { return r.arrayBuffer(); }).then(function (b) { return new Uint8Array(b); });
    } catch (e) {}
    return Promise.resolve(null);
  }
  function sigToast(res) {
    var st = res && res.status; if (!st || st === 'unsigned' || st === 'error') return;
    var t = {
      valid: ['#16a34a', '✓', 'Digital signature valid — the green tick is added to the signature.'],
      modified: ['#dc2626', '?', 'Document was changed after signing — signature not valid, tick not added.'],
      'changed-after': ['#dc2626', '?', 'Something was added after signing — signature not valid, tick not added.'],
      untrusted: ['#b7791f', '?', 'Signature could not be verified (not an official India PKI certificate).']
    }[st]; if (!t) return;
    var el = document.getElementById('sp-sig-toast');
    if (!el) {
      el = document.createElement('div'); el.id = 'sp-sig-toast'; el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2147483000;max-width:min(92vw,560px);display:flex;gap:10px;align-items:center;padding:10px 14px 10px 10px;border-radius:14px;background:#fff;color:#1B2330;box-shadow:0 10px 30px rgba(0,0,0,.18);font:600 14px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer';
      el.onclick = function () { el.remove(); };
      document.body.appendChild(el);
    }
    el.innerHTML = '<span style="flex-shrink:0;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;color:#fff;font-size:16px;background:' + t[0] + '">' + t[1] + '</span><span></span>';
    el.lastChild.textContent = t[2];
    clearTimeout(el._t); el._t = setTimeout(function () { el.remove(); }, 7000);
  }
  function addSigPaint(pg, doc) {
    if (pg.__spSigPaint || !pg.render) return;
    var rr = pg.render.bind(pg);
    pg.render = function (params) {
      var task = rr.apply(null, arguments);
      try {
        var sig = doc && doc.__spSig;
        if (sig && sig.status === 'valid' && params && params.canvasContext && params.viewport && window.SPSig) {
          var done = task.promise.then(function (v) {
            var ctx = params.canvasContext; ctx.save();
            try { if (params.transform) ctx.transform.apply(ctx, params.transform); } catch (e) {}
            return window.SPSig.paint(ctx, pg, params.viewport, sig).then(function () { ctx.restore(); return v; }, function () { ctx.restore(); return v; });
          });
          Object.defineProperty(task, 'promise', { value: done, configurable: true });
        }
      } catch (e) {}
      return task;
    };
    pg.__spSigPaint = true;
  }
  function wrapPage(pg, doc) {
    if (pg && doc && doc.__spSig) addSigPaint(pg, doc);
    if (!pg || pg.__spCap) return pg;
    var gv = pg.getViewport.bind(pg);
    pg.getViewport = function (o) {
      var v = gv(o);
      try {
        var m = Math.max(v.width, v.height);
        if (o && o.scale && m > MAX_SIDE) return gv(Object.assign({}, o, { scale: o.scale * MAX_SIDE / m }));
      } catch (e) {}
      return v;
    };
    pg.__spCap = true; return pg;
  }
  function wrapDoc(doc) {
    if (!doc || doc.__spCap) return doc;
    var gp = doc.getPage.bind(doc);
    doc.getPage = function () { return gp.apply(null, arguments).then(function (pg) { return wrapPage(pg, doc); }); };
    doc.__spCap = true; return doc;
  }
  function wrapGetDocument(gd) {
    return function () {
      var check = null;
      if (!sigManaged()) {
        try {
          var got = bytesOf(arguments[0]);   // copy before pdf.js hands the buffer to its worker
          check = Promise.all([got, loadSigLibs()]).then(function (r) { return r[0] && window.SPSig ? window.SPSig.verify(r[0]) : null; }).catch(function () { return null; });
        } catch (e) { check = null; }
      }
      var task = gd.apply(this, arguments);
      // remember the password the tool hands to pdf.js, so the signature date of a protected file can be read
      var given = arguments[0] && typeof arguments[0] === 'object' && arguments[0].password ? arguments[0].password : '';
      if (check) {
        try {
          var userCb = null;
          Object.defineProperty(task, 'onPassword', { configurable: true, enumerable: true,
            get: function () { return userCb && function (update, reason) { return userCb(function (pw) { given = pw; return update(pw); }, reason); }; },
            set: function (fn) { userCb = fn; } });
        } catch (e) {}
      }
      try {
        var p = task.promise.then(function (doc) {
          if (!check) return wrapDoc(doc);
          var limit = new Promise(function (r) { setTimeout(function () { r(null); }, 9000); });
          return Promise.race([check, limit]).then(function (res) {
            if (res && res.encrypted && window.SPSig && window.SPSig.unlock) window.SPSig.unlock(res, given);
            if (res) { doc.__spSig = res; sigToast(res); }
            return wrapDoc(doc);
          });
        });
        Object.defineProperty(task, 'promise', { value: p, configurable: true });
      } catch (e) {}
      return task;
    };
  }
  var proxied = typeof WeakMap === 'function' ? new WeakMap() : null;
  function patchPdf(lib) {
    if (!lib || typeof lib !== 'object' || !lib.getDocument || typeof Proxy !== 'function') return lib;
    if (lib.__spProxy) return lib;
    if (proxied && proxied.has(lib)) return proxied.get(lib);
    var wrapped = wrapGetDocument(lib.getDocument);
    var px = new Proxy(lib, { get: function (t, k) { if (k === 'getDocument') return wrapped; if (k === '__spProxy') return true; return t[k]; } });
    if (proxied) proxied.set(lib, px);
    return px;
  }
  window.__spPatchPdf = patchPdf;   // for tools that import pdf.js as an ES module
  ['pdfjsLib', 'pdfjs-dist/build/pdf'].forEach(function (name) {
    var held = window[name] ? patchPdf(window[name]) : undefined;
    try {
      Object.defineProperty(window, name, { configurable: true, enumerable: true,
        get: function () { return held; }, set: function (v) { held = patchPdf(v); } });
    } catch (e) {}
  });
})();

/* Card print tools (Aadhaar/PAN/Voter/Ayushman): print without a pop-up window,
 * at the exact paper size chosen in "Page", so cards come out true-to-size. */
(function () {
  'use strict';
  var SIZES = { A4: [210, 297], A5: [148, 210], A3: [297, 420], '4x6': [101.6, 152.4], '5x7': [127, 177.8], Legal: [215.9, 355.6] };
  function isCardTool() { return document.getElementById('pageSizeSelect') && document.getElementById('outputModal'); }
  function paper() {
    var sel = document.getElementById('pageSizeSelect'), v = sel ? sel.value : 'A4';
    if (v === 'Custom') {
      var w = parseFloat((document.getElementById('customPageWidth') || {}).value), h = parseFloat((document.getElementById('customPageHeight') || {}).value);
      if (w > 20 && h > 20) return [w, h];
    }
    return SIZES[v] || SIZES.A4;
  }
  function printImages(srcs) {
    if (!srcs.length) return;
    var first = new Image();
    first.onload = function () {
      var p = paper(), w = p[0], h = p[1];
      if ((first.naturalWidth > first.naturalHeight) !== (w > h)) { var t = w; w = h; h = t; }
      var css = '@page{size:' + w + 'mm ' + h + 'mm;margin:0}html,body{margin:0;padding:0;background:#fff}' +
        'img{display:block;width:' + w + 'mm;height:' + h + 'mm;object-fit:contain;break-after:page;page-break-after:always}img:last-child{break-after:auto;page-break-after:auto}';
      var html = '<!doctype html><html><head><meta charset="utf-8"><title>S Printer</title><style>' + css + '</style></head><body>' +
        srcs.map(function (s) { return '<img src="' + s + '">'; }).join('') + '</body></html>';
      var f = document.createElement('iframe');
      f.setAttribute('aria-hidden', 'true');
      f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
      document.body.appendChild(f);
      var d = f.contentWindow.document; d.open(); d.write(html); d.close();
      var imgs = d.images, left = imgs.length;
      function go() {
        var doIt = function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) {} };
        if (window.SPPrintAnim) window.SPPrintAnim(doIt); else doIt();
        setTimeout(function () { f.remove(); }, 60000);
      }
      if (!left) go(); else [].forEach.call(imgs, function (im) { if (im.complete) { if (!--left) go(); } else im.onload = im.onerror = function () { if (!--left) go(); }; });
    };
    first.src = srcs[0];
  }
  var realOpen = window.open;
  window.open = function (url) {
    if (isCardTool() && (!url || url === 'about:blank')) {
      var buf = '', done = false, onload = null;
      var finish = function () {
        if (done) return; done = true;
        var srcs = [], re = /<img[^>]+src=["']([^"']+)["']/gi, m;
        while ((m = re.exec(buf))) srcs.push(m[1]);
        printImages(srcs);
      };
      var doc = { write: function (h) { buf += h; }, writeln: function (h) { buf += h + '\n'; }, open: function () { buf = ''; return doc; },
        close: function () { setTimeout(function () { if (onload) { try { onload(); } catch (e) {} } finish(); }, 50); },
        createElement: function (t) { return document.createElement(t); }, body: null, title: '' };
      var sink = { document: doc, closed: false, focus: function () {}, blur: function () {}, close: function () { sink.closed = true; },
        print: function () { finish(); }, addEventListener: function (t, fn) { if (t === 'load') onload = fn; }, removeEventListener: function () {},
        setTimeout: function (fn, ms) { return setTimeout(fn, ms); }, opener: window, location: { href: 'about:blank' } };
      Object.defineProperty(sink, 'onload', { get: function () { return onload; }, set: function (fn) { onload = fn; } });
      return sink;
    }
    return realOpen.apply(this, arguments);
  };
})();

/* ID Card Print: paper size follows the print sheet (no extra blank page). */
(function () {
  'use strict';
  function fit() {
    var pc = document.getElementById('printContainer'); if (!pc) return;
    var sheet = pc.querySelector('.print-sheet'); if (!sheet) return;
    var w = sheet.style.width, h = sheet.style.height; if (!w || !h) return;
    var st = document.getElementById('sp-print-page');
    if (!st) { st = document.createElement('style'); st.id = 'sp-print-page'; }
    st.textContent = '@media print{@page{size:' + w + ' ' + h + ';margin:0}' +
      'html,body{height:auto!important;overflow:visible!important;margin:0!important;padding:0!important}' +
      '#printContainer .print-sheet{height:calc(' + h + ' - 0.6mm)!important;overflow:hidden!important;break-after:page;page-break-after:always;margin:0!important}' +
      '#printContainer .print-sheet:last-child{break-after:auto;page-break-after:auto}}';
    document.body.appendChild(st); // last in the document so it wins
  }
  window.addEventListener('beforeprint', fit);
  var mq = window.matchMedia && matchMedia('print');
  if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) fit(); });
  var real = window.print;
  window.print = function () { try { fit(); } catch (e) {} return real.apply(this, arguments); };
})();

/* Premium icons instead of emoji / symbol characters.
 * Any emoji or arrow/symbol glyph that a tool puts into the page (buttons, labels, messages)
 * is swapped for a crisp SVG icon, so the whole site uses one consistent icon style. */
(function () {
  'use strict';
  var S = function (d, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + d + '</svg>'; };
  var G = function (id, a, b) { return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs>'; };
  var F = function (body) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + body + '</svg>'; };
  var ROT_R = S('<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/>');
  var ROT_L = S('<path d="M4 12a8 8 0 1 0 2.34-5.66"/><path d="M4 4v5h5"/>');
  var DOC = F(G('spgD', '#2fd0f5', '#0077c8') + '<path d="M6 2.5h8l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V4A1.5 1.5 0 0 1 6 2.5z" fill="url(#spgD)"/><path d="M14 2.5V7a.6.6 0 0 0 .6.6H19" fill="#fff" opacity=".55"/><path d="M8 12h8M8 15h8M8 18h5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>');
  var PHOTO = F(G('spgP', '#2fd0f5', '#0077c8') + '<rect x="2.5" y="4" width="19" height="16" rx="3" fill="url(#spgP)"/><circle cx="8.3" cy="9.3" r="2" fill="#fff"/><path d="M4 18.5l5-5 3 3 4-4 4 4v2z" fill="#fff" opacity=".9"/>');
  var FOLDER = F(G('spgF', '#ffe066', '#f59e0b') + '<path d="M2.5 6.5A1.5 1.5 0 0 1 4 5h5l2 2.2h9A1.5 1.5 0 0 1 21.5 8.7V18a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18z" fill="url(#spgF)"/><path d="M2.5 10h19" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/>');
  var MAP = {
    '↻': ROT_R, '↷': ROT_R, '↶': ROT_L,
    '↓': S('<path d="M12 4.5v13M6.5 12l5.5 5.5 5.5-5.5M5 20.5h14"/>'),
    '↑': S('<path d="M12 19.5v-13M6.5 12l5.5-5.5 5.5 5.5M5 3.5h14"/>'),
    '←': S('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    '→': S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    '➡': S('<path d="M4 12h15M13 6l6 6-6 6"/>'),
    '↗': S('<path d="M7 17 17 7M9 7h8v8"/>'),
    '⇄': S('<path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4"/>'),
    '‹': S('<path d="M15 5l-7 7 7 7"/>'), '›': S('<path d="M9 5l7 7-7 7"/>'),
    '✓': S('<path d="M5 12.5l4.5 4.5L19 7.5"/>', ' stroke-width="2.8"'),
    '✔': S('<path d="M5 12.5l4.5 4.5L19 7.5"/>', ' stroke-width="2.8"'),
    '○': S('<circle cx="12" cy="12" r="7"/>'),
    '☰': S('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    '✂': S('<circle cx="6" cy="6.5" r="2.8"/><circle cx="6" cy="17.5" r="2.8"/><path d="M8.3 8.3 20 18.5M8.3 15.7 20 5.5"/>'),
    '✦': F(G('spgS', '#ffe066', '#ff5fa2') + '<path d="M12 1.8l2.3 6.4 6.6 2.3-6.6 2.3L12 19.4l-2.3-6.6-6.6-2.3 6.6-2.3z" fill="url(#spgS)"/><path d="M19.5 15.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="#ffd43b"/>'),
    '✨': F(G('spgS2', '#ffe066', '#ff5fa2') + '<path d="M12 1.8l2.3 6.4 6.6 2.3-6.6 2.3L12 19.4l-2.3-6.6-6.6-2.3 6.6-2.3z" fill="url(#spgS2)"/>'),
    '✅': F(G('spgOK', '#4ade80', '#15803d') + '<circle cx="12" cy="12" r="10" fill="url(#spgOK)"/><path d="M7.2 12.4l3.2 3.2 6.4-6.6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'),
    '❌': F(G('spgNO', '#ff7a6b', '#dc2626') + '<circle cx="12" cy="12" r="10" fill="url(#spgNO)"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'),
    '⚠': F(G('spgW', '#ffd43b', '#f59e0b') + '<path d="M10.3 3.5a2 2 0 0 1 3.4 0l8 13.8A2 2 0 0 1 20 20.3H4a2 2 0 0 1-1.7-3z" fill="url(#spgW)"/><path d="M12 9v5M12 17h.01" stroke="#1B2330" stroke-width="2.2" stroke-linecap="round"/>'),
    '▣': F(G('spgCard', '#2fd0f5', '#0077c8') + '<rect x="2.5" y="5.5" width="19" height="13" rx="2.4" fill="url(#spgCard)"/><rect x="5" y="8.5" width="5" height="6.5" rx="1" fill="#fff"/><path d="M12.5 9.5h6M12.5 12h5M12.5 14.5h3.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>'),
    '▤': DOC,
    '📄': DOC, '📃': DOC, '🖼': PHOTO, '📷': PHOTO, '📂': FOLDER, '📁': FOLDER,
    '🚀': F(G('spgR', '#ff9a5a', '#d6247a') + '<path d="M13.5 3.5c3.6-1.2 6.4-.6 7 0 .6.6 1.2 3.4 0 7l-6.2 6.2-6.9-6.9z" fill="url(#spgR)"/><circle cx="15.4" cy="8.6" r="1.8" fill="#fff"/><path d="M7.4 9.8 4 10.3l-1.5 3 4.2.4M14.2 16.6l-.5 3.4-3 1.5-.4-4.2" fill="#f59e0b"/><path d="M6.3 15.6c-1.5 1-2 3-2.2 4.1 1.1-.2 3.1-.7 4.1-2.2" fill="#ffd43b"/>')
  };
  var keys = Object.keys(MAP).sort(function (a, b) { return b.length - a.length; });
  var RE = new RegExp('(' + keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')\\uFE0F?', 'g');
  var TEST = new RegExp(RE.source);
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, TITLE: 1, NOSCRIPT: 1, CODE: 1, PRE: 1 };
  function fixText(node) {
    var p = node.parentNode; if (!p || !TEST.test(node.nodeValue)) return;
    if (SKIP[p.nodeName] || p.closest && p.closest('svg,[contenteditable="true"],.sp-gi')) return;
    if (p.nodeName === 'OPTION') { node.nodeValue = node.nodeValue.replace(RE, '').replace(/\s{2,}/g, ' ').trim(); return; }
    var frag = document.createDocumentFragment(), s = node.nodeValue, last = 0, m;
    RE.lastIndex = 0;
    while ((m = RE.exec(s))) {
      if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      var span = document.createElement('span'); span.className = 'sp-gi'; span.setAttribute('aria-hidden', 'true');
      span.innerHTML = MAP[m[1]]; frag.appendChild(span); last = RE.lastIndex;
    }
    if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    p.replaceChild(frag, node);
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), list = [], n;
    while ((n = tw.nextNode())) if (TEST.test(n.nodeValue)) list.push(n);
    list.forEach(fixText);
  }
  var pending = [], queued = false;
  function flush() { queued = false; var l = pending; pending = []; l.forEach(walk); }
  function start() {
    walk(document.body);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === 'characterData') pending.push(m.target);
        else m.addedNodes.forEach(function (n) { if (!(n.nodeType === 1 && n.classList && n.classList.contains('sp-gi'))) pending.push(n); });
      });
      if (!queued && pending.length) { queued = true; (window.requestAnimationFrame || setTimeout)(flush); }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* Printing animation: a little printer prints the page before the print window opens,
 * and a "saved" tick appears when a file is downloaded. */
(function () {
  'use strict';
  var css = '' +
  '#sp-pa{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;background:rgba(238,241,244,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;transition:opacity .25s}' +
  '#sp-pa.on{opacity:1}' +
  '#sp-pa .box{background:#fff;border-radius:22px;padding:26px 34px 22px;box-shadow:0 30px 70px rgba(27,35,48,.22);text-align:center;transform:translateY(10px) scale(.96);transition:transform .35s cubic-bezier(.2,.8,.2,1);min-width:230px}' +
  '#sp-pa.on .box{transform:none}' +
  '#sp-pa svg{width:150px;height:150px;display:block;margin:0 auto 8px;overflow:visible}' +
  '#sp-pa b{display:block;font:700 17px/1.3 "SP Lexend",Lexend,system-ui,sans-serif;color:#1B2330}' +
  '#sp-pa small{display:block;margin-top:4px;font:500 13px/1.4 "SP Inter",Inter,system-ui,sans-serif;color:#667385}' +
  '#sp-pa .paper{animation:spPaOut 1.15s cubic-bezier(.4,0,.2,1) forwards}' +
  '#sp-pa .ln{transform-box:fill-box;transform-origin:left;transform:scaleX(0);animation:spPaLn .28s ease-out forwards}' +
  '#sp-pa .led{animation:spPaLed .5s steps(2) infinite}' +
  '#sp-pa .roll{transform-box:fill-box;transform-origin:center;animation:spPaRoll .6s linear infinite}' +
  '#sp-pa .bar{position:relative;height:4px;border-radius:9px;background:#EEF1F4;overflow:hidden;margin-top:14px}' +
  '#sp-pa .bar i{position:absolute;inset:0;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,#0098D8,#D6247A,#F5C400);animation:spPaBar 1.1s cubic-bezier(.4,0,.2,1) forwards}' +
  '@keyframes spPaOut{from{transform:translateY(-38px)}to{transform:translateY(0)}}' +
  '@keyframes spPaLn{to{transform:scaleX(1)}}' +
  '@keyframes spPaLed{50%{opacity:.25}}' +
  '@keyframes spPaRoll{to{transform:rotate(360deg)}}' +
  '@keyframes spPaBar{to{transform:scaleX(1)}}' +
  '#sp-saved{position:fixed;left:50%;bottom:24px;z-index:2147483500;display:flex;align-items:center;gap:10px;padding:10px 16px 10px 10px;border-radius:14px;background:#1B2330;color:#fff;font:600 14px/1.3 "SP Inter",Inter,system-ui,sans-serif;box-shadow:0 14px 34px rgba(0,0,0,.28);transform:translate(-50%,20px);opacity:0;transition:transform .35s cubic-bezier(.2,.8,.2,1),opacity .25s;max-width:calc(100% - 32px)}' +
  '#sp-saved.on{transform:translate(-50%,0);opacity:1}' +
  '#sp-saved svg{width:30px;height:30px;flex-shrink:0}' +
  '#sp-saved .ck{stroke-dasharray:24;stroke-dashoffset:24;animation:spCk .45s .15s ease-out forwards}' +
  '#sp-saved span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
  '@keyframes spCk{to{stroke-dashoffset:0}}' +
  '@media print{#sp-pa,#sp-saved{display:none!important}}' +
  '@media (prefers-reduced-motion:reduce){#sp-pa *,#sp-saved *{animation-duration:.01s!important}}';
  function addCss() { if (document.getElementById('sp-pa-css')) return; var st = document.createElement('style'); st.id = 'sp-pa-css'; st.textContent = css; (document.head || document.documentElement).appendChild(st); }
  var PRINTER = '<svg viewBox="0 0 120 120" aria-hidden="true">' +
    '<defs><linearGradient id="spPaB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4a60"/><stop offset="1" stop-color="#141b26"/></linearGradient>' +
    '<linearGradient id="spPaT" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0098D8"/><stop offset=".33" stop-color="#0098D8"/><stop offset=".33" stop-color="#D6247A"/><stop offset=".66" stop-color="#D6247A"/><stop offset=".66" stop-color="#F5C400"/><stop offset="1" stop-color="#F5C400"/></linearGradient>' +
    '<clipPath id="spPaC"><rect x="22" y="70" width="76" height="50"/></clipPath></defs>' +
    '<ellipse cx="60" cy="112" rx="40" ry="4" fill="#1B2330" opacity=".08"/>' +
    '<rect x="34" y="12" width="52" height="34" rx="3" fill="#fff" stroke="#D5DDE6" stroke-width="2"/>' +
    '<path d="M42 22h36M42 29h28" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>' +
    '<rect x="14" y="38" width="92" height="40" rx="11" fill="url(#spPaB)"/>' +
    '<rect x="14" y="38" width="92" height="5" rx="2.5" fill="url(#spPaT)"/>' +
    '<circle class="led" cx="92" cy="52" r="3.2" fill="#22c55e"/>' +
    '<rect x="26" y="49" width="40" height="5" rx="2.5" fill="#fff" opacity=".18"/>' +
    '<g class="roll"><circle cx="76" cy="52" r="4" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="4 3"/></g>' +
    '<rect x="24" y="68" width="72" height="5" rx="2.5" fill="#0b1018"/>' +
    '<g clip-path="url(#spPaC)"><g class="paper">' +
      '<rect x="30" y="70" width="60" height="44" rx="2" fill="#fff" stroke="#D5DDE6" stroke-width="1.5"/>' +
      '<rect class="ln" style="animation-delay:.35s" x="37" y="78" width="18" height="14" rx="2" fill="#2fb7ea"/>' +
      '<rect class="ln" style="animation-delay:.5s" x="59" y="79" width="24" height="3" rx="1.5" fill="#1B2330"/>' +
      '<rect class="ln" style="animation-delay:.6s" x="59" y="85" width="18" height="3" rx="1.5" fill="#94a3b8"/>' +
      '<rect class="ln" style="animation-delay:.72s" x="37" y="97" width="46" height="3" rx="1.5" fill="#D6247A"/>' +
      '<rect class="ln" style="animation-delay:.84s" x="37" y="103" width="36" height="3" rx="1.5" fill="#F5C400"/>' +
    '</g></g></svg>';
  var el = null, started = 0, hideT = null, printed = false;
  function show(text) {
    if (!document.body) return;
    addCss();
    if (!el) {
      el = document.createElement('div'); el.id = 'sp-pa'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      el.innerHTML = '<div class="box">' + PRINTER + '<b>' + (text || 'Preparing your print…') + '</b><small>Choose Scale 100% / Actual size</small><div class="bar"><i></i></div></div>';
      document.body.appendChild(el); started = Date.now(); printed = false;
      requestAnimationFrame(function () { if (el) el.classList.add('on'); });
    }
    clearTimeout(hideT); hideT = setTimeout(hide, 9000);          // safety: the tool never printed
  }
  function hide() {
    clearTimeout(hideT);
    var e = el; if (!e) return; el = null;
    e.classList.remove('on'); setTimeout(function () { e.remove(); }, 260);
  }
  function hideSoon() { clearTimeout(hideT); hideT = setTimeout(hide, Math.max(250, 1300 - (Date.now() - started))); }
  window.addEventListener('afterprint', function () { if (el) hideSoon(); });
  // used by tools that print through a hidden frame: animate first, then print
  window.SPPrintAnim = function (cb, text) {
    show(text);
    setTimeout(function () { try { cb(); } catch (e) {} if (el) hideSoon(); }, Math.max(0, 1100 - (Date.now() - started)));
  };
  // window.print() keeps working exactly as before (no delay); the animation just shows with it
  var base = window.print;
  window.print = function () {
    show(); printed = true;
    var r = base.apply(this, arguments);
    hideSoon();
    return r;
  };
  // start the animation the moment a Print button is pressed, while the tool prepares the pages
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('button,a,[role=button]');
    if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
    var label = ((b.id || '') + ' ' + (b.getAttribute('aria-label') || '') + ' ' + (b.textContent || '')).toLowerCase();
    if (/\bprint\b/.test(label) && !/preview|guide|how to|setting|size|layout/.test(label) && !b.closest('nav,header,footer')) show();
  }, true);
  // "Saved" confirmation for downloads
  var savedT;
  function saved(name) {
    addCss();
    var el = document.getElementById('sp-saved');
    if (!el) { el = document.createElement('div'); el.id = 'sp-saved'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = '<svg viewBox="0 0 30 30" aria-hidden="true"><defs><linearGradient id="spSvG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset="1" stop-color="#15803d"/></linearGradient></defs><circle cx="15" cy="15" r="14" fill="url(#spSvG)"/><path class="ck" d="M9 15.5l4 4 8-8.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span>';
    el.lastChild.textContent = 'Saved · ' + (name || 'file');
    requestAnimationFrame(function () { el.classList.add('on'); });
    clearTimeout(savedT); savedT = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }
  var aclick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    try { if (this.hasAttribute('download') && document.body) saved(this.getAttribute('download') || this.download); } catch (e) {}
    return aclick.apply(this, arguments);
  };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[download]');
    if (a && e.isTrusted) saved(a.getAttribute('download'));
  }, true);
})();

/* One-tap background colours next to every background colour picker
 * (Remove Background, photo tools, classic passport editor). */
(function () {
  'use strict';
  var COLORS = ['#ffffff', '#e6f0fb', '#bfdcf5', '#6fb3e8', '#1d6fd1', '#0b3d91', '#d7263d', '#f1f1f1', '#c9ced6', '#fff5d6', '#000000'];
  function add(input) {
    if (!input || input.dataset.spSw) return; input.dataset.spSw = '1';
    var row = document.createElement('div'); row.className = 'sp-swrow'; row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'Background colours');
    COLORS.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'sp-sw'; b.style.background = c; b.title = c; b.setAttribute('aria-label', 'Colour ' + c);
      b.addEventListener('click', function () {
        input.value = c;
        input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
        [].forEach.call(row.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
      row.appendChild(b);
    });
    var host = input.closest('label') || input;
    host.parentNode.insertBefore(row, host.nextSibling);
    var lab = input.id && document.querySelector('label[for="' + input.id + '"]');
    [lab, input.closest('label')].forEach(function (l) {
      if (l && /empty space/i.test(l.textContent)) l.childNodes.forEach(function (n) { if (n.nodeType === 3) n.nodeValue = n.nodeValue.replace(/Background\s*\/\s*empty space/i, 'Background colour'); });
    });
  }
  function scan() { ['#background', '#bgColorPicker', 'input[type=color][id*="bg" i]', 'input[type=color][id*="background" i]'].forEach(function (q) { [].forEach.call(document.querySelectorAll(q), function (i) { if (i.type === 'color') add(i); }); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  setTimeout(scan, 1500);
})();
