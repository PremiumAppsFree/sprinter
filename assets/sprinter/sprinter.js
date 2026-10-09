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
