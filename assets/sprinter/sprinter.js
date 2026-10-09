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
  function wrapPage(pg) {
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
    doc.getPage = function () { return gp.apply(null, arguments).then(wrapPage); };
    doc.__spCap = true; return doc;
  }
  function wrapGetDocument(gd) {
    return function () {
      var task = gd.apply(this, arguments);
      try { var p = task.promise.then(wrapDoc); Object.defineProperty(task, 'promise', { value: p, configurable: true }); } catch (e) {}
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
        try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) {}
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
