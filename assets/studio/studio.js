/* S Printer — Design Studio engine
 * One editor for: Resume/CV, Marriage Biodata, ID cards (bulk), Posters, Application letters, Shop promotion.
 * Templates · smart details · text with Indian-language fonts · photos (crop, remove background,
 * background colour, signature clean) · shapes · QR · barcode · effects · layers · undo ·
 * drafts · AI prompt → paste design · JPG / PNG / PDF / Print / Share.
 * Everything runs in the browser; nothing is uploaded. Designed & developed by Raj. */
(function () {
  'use strict';
  var F = window.fabric;
  // fabric 5.3 sets an invalid textBaseline value; map it to the right one (avoids console spam and slowdowns)
  (function () { try { var P = CanvasRenderingContext2D.prototype, d = Object.getOwnPropertyDescriptor(P, 'textBaseline'); if (d && d.set) Object.defineProperty(P, 'textBaseline', { configurable: true, enumerable: d.enumerable, get: d.get, set: function (v) { d.set.call(this, v === 'alphabetical' ? 'alphabetic' : v); } }); } catch (e) {} })();
  var ST = window.SPStudio = window.SPStudio || {};
  var TPL = ST.templates = ST.templates || [];
  ST.register = function (list) { [].push.apply(TPL, list); };
  var PROPS = ['tpl', 'ph', 'phShape', 'qr', 'bc', 'srcOrig', 'phSrc', 'nm', 'rad', 'stLock'];

  // ---------- icons ----------
  var I = {
    tpl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    els: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><circle cx="7.5" cy="7.5" r="4"/><rect x="13" y="3.5" width="8" height="8" rx="1.5"/><path d="M12 21l4.5-8 4.5 8z"/><path d="M3 14h7v7H3z"/></svg>',
    ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
    page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    db: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4" stroke="#D6247A"/></svg>',
    jpg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2" fill="#F5C400" stroke="none"/><path d="M21 16l-5-5-9 9"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg>',
    zin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20 20l-4-4"/></svg>',
    zout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M20 20l-4-4"/></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 6V4h14v2M12 4v16M9 20h6"/></svg>',
    head: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 4v16M18 4v16M6 12h12"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M6 20c1-3 3.5-4.5 6-4.5s5 1.5 6 4.5"/></svg>',
    sign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17c3-1 4-9 6-9s0 9 2 9 2-5 4-5 1 4 3 4 2-1 3-2"/><path d="M3 21h18"/></svg>',
    rect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="2"/></svg>',
    circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>',
    line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 18L20 6"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.8-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.8z"/></svg>',
    tri: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 4l9 16H3z"/></svg>',
    qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14v2"/></svg>',
    bar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5v14M7 5v14M10 5v14M14 5v14M16 5v14M20 5v14"/></svg>',
    badge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 2l2.4 2.2 3.2-.4.6 3.2 2.8 1.6-1.4 2.9 1.4 2.9-2.8 1.6-.6 3.2-3.2-.4L12 22l-2.4-2.2-3.2.4-.6-3.2L3 15.4l1.4-2.9L3 9.6 5.8 8l.6-3.2 3.2.4z"/></svg>',
    del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    dup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l8 4.5-8 4.5-8-4.5z" fill="currentColor" opacity=".25"/><path d="M4 12l8 4.5 8-4.5M4 16.5l8 4.5 8-4.5"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l8 4.5-8 4.5-8-4.5z"/><path d="M4 12l8 4.5 8-4.5M4 16.5l8 4.5 8-4.5" opacity=".45"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    fx: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 21l9-9M14 4v3M18.5 5.5l-2 2M20 10h-3M12 7l5 5"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    crop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/></svg>',
    flip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3v18" stroke-dasharray="2 2"/><path d="M9 6L3 18h6zM15 6l6 12h-6z"/></svg>',
    center: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 12h18"/><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>',
    al: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M4 10h10M4 14h16M4 18h10"/></svg>',
    ac: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M7 10h10M4 14h16M7 18h10"/></svg>',
    ar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M10 10h10M4 14h16M10 18h10"/></svg>',
    aj: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2"/><path d="M20 4v5h-5M4 20v-5h5"/></svg>'
  };

  // ---------- fonts (English + Indian languages) ----------
  var FONTS = [
    ['English', [['Poppins', '400;600;700;800'], ['Montserrat', '400;700;800'], ['Roboto', '400;700'], ['Open Sans', '400;700'], ['Lato', '400;700'], ['Nunito', '400;700'], ['Raleway', '400;700'], ['Josefin Sans', '400;700'], ['Rubik', '400;700'], ['Oswald', '400;700'], ['Anton', ''], ['Bebas Neue', ''], ['Teko', '400;700'], ['Archivo Black', ''], ['Righteous', ''], ['Bungee', ''], ['Alfa Slab One', ''], ['Abril Fatface', ''], ['Playfair Display', '400;700'], ['Merriweather', '400;700'], ['Libre Baskerville', '400;700'], ['Cormorant Garamond', '400;700'], ['Cinzel', '400;700'], ['Lobster', ''], ['Pacifico', ''], ['Dancing Script', '400;700'], ['Great Vibes', ''], ['Satisfy', ''], ['Kaushan Script', ''], ['Caveat', '400;700']]],
    ['हिन्दी / मराठी', [['Noto Sans Devanagari', '400;700'], ['Hind', '400;700'], ['Mukta', '400;700;800'], ['Yantramanav', '400;700'], ['Martel', '400;700'], ['Khand', '400;700'], ['Rajdhani', '400;700'], ['Palanquin', '400;700'], ['Karma', '400;700'], ['Sura', '400;700'], ['Biryani', '400;700'], ['Sarpanch', '400;700'], ['Eczar', '400;700'], ['Laila', '400;700'], ['Kalam', '400;700'], ['Amita', '400;700'], ['Rozha One', ''], ['Yatra One', ''], ['Kurale', ''], ['Baloo 2', '400;700'], ['Tiro Devanagari Hindi', '']]],
    ['বাংলা', [['Hind Siliguri', '400;700'], ['Noto Sans Bengali', '400;700'], ['Baloo Da 2', '400;700'], ['Tiro Bangla', ''], ['Galada', ''], ['Atma', '400;700'], ['Mina', '400;700']]],
    ['ગુજરાતી', [['Hind Vadodara', '400;700'], ['Noto Sans Gujarati', '400;700'], ['Baloo Bhai 2', '400;700']]],
    ['ਪੰਜਾਬੀ', [['Noto Sans Gurmukhi', '400;700'], ['Baloo Paaji 2', '400;700']]],
    ['தமிழ்', [['Noto Sans Tamil', '400;700'], ['Hind Madurai', '400;700']]],
    ['తెలుగు', [['Noto Sans Telugu', '400;700'], ['Hind Guntur', '400;700']]],
    ['اردو', [['Noto Nastaliq Urdu', '400;700'], ['Noto Naskh Arabic', '400;700']]]
  ];
  var FONT_W = {}; FONTS.forEach(function (g) { g[1].forEach(function (f) { FONT_W[f[0]] = f[1]; }); });
  var fontLinks = {};
  function needFont(name) {
    if (!name || fontLinks[name] || !(name in FONT_W)) return;
    var w = FONT_W[name], l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name).replace(/%20/g, '+') + (w ? ':wght@' + w : '') + '&display=swap';
    document.head.appendChild(l); fontLinks[name] = l;
  }
  function fontsFor(objs) {
    var jobs = [];
    (function walk(list) {
      list.forEach(function (o) {
        if (o.objects) walk(o.objects);
        if (o.fontFamily) {
          var fam = String(o.fontFamily).split(',')[0].replace(/['"]/g, '').trim(); needFont(fam);
          if (document.fonts && document.fonts.load) jobs.push(document.fonts.load((o.fontWeight || 400) + ' 40px "' + fam + '"', (o.text || 'Aa') + ' अआ').catch(function () {}));
        }
      });
    })(objs || []);
    return Promise.race([Promise.all(jobs), new Promise(function (r) { setTimeout(r, 6000); })]).then(function () { try { F.util.clearFabricFontCache(); } catch (e) {} });
  }

  // ---------- helpers ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function canvasEl(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function loadImg(src) { return new Promise(function (res, rej) { var i = new Image(); i.crossOrigin = 'anonymous'; i.onload = function () { res(i); }; i.onerror = rej; i.src = src; }); }
  function fileToURL(f) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(f), i = new Image();
      i.onload = function () { var k = Math.min(1, (window.SPMaxSide || 4800) / Math.max(i.naturalWidth, i.naturalHeight)), c = canvasEl(i.naturalWidth * k, i.naturalHeight * k); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL(/png/i.test(f.type) ? 'image/png' : 'image/jpeg', 0.97)); };
      i.onerror = function () { URL.revokeObjectURL(u); rej(new Error('Not an image')); }; i.src = u;
    });
  }
  function pickFile(accept, multiple) {
    return new Promise(function (res) {
      var f = document.createElement('input'); f.type = 'file'; f.accept = accept || 'image/*'; if (multiple) f.multiple = true;
      f.style.display = 'none'; document.body.appendChild(f);
      f.onchange = function () { res([].slice.call(f.files || [])); f.remove(); };
      f.click();
    });
  }
  // {{KEY}} or {{KEY|bullets}} {{KEY|left}} {{KEY|right}} {{KEY|upper}} {{KEY|comma}} {{KEY|lines}}
  function lines(v) { v = String(v || '').replace(/\r/g, ''); var a = v.indexOf('\n') >= 0 ? v.split('\n') : v.split(/\s*,\s*/); return a.map(function (x) { return x.trim(); }).filter(Boolean); }
  function splitRate(l) { var m = l.match(/^(.*?)\s*(?:[-–—:=|]|\.{2,})\s*(₹?\s*[\d.,/]+.*|Rs\.?\s*[\d.,/]+.*|free|FREE|Free)$/); return m ? [m[1], m[2]] : [l, '']; }
  function modify(v, mod) {
    switch (mod) {
      case 'bullets': return lines(v).map(function (x) { return '•  ' + x; }).join('\n');
      case 'lines': return lines(v).join('\n');
      case 'comma': return lines(v).join(', ');
      case 'upper': return String(v).toUpperCase();
      case 'left': return String(v).split('\n').filter(function (x) { return x.trim(); }).map(function (x) { return splitRate(x.trim())[0]; }).join('\n');
      case 'right': return String(v).split('\n').filter(function (x) { return x.trim(); }).map(function (x) { return splitRate(x.trim())[1]; }).join('\n');
      case 'h1': case 'h2': { var a = lines(v), m = Math.ceil(a.length / 2); return (mod === 'h1' ? a.slice(0, m) : a.slice(m)).map(function (x) { return '•  ' + x; }).join('\n'); }
      case 'rl1': case 'rl2': case 'rr1': case 'rr2': { var b = String(v).split('\n').filter(function (x) { return x.trim(); }), m2 = Math.ceil(b.length / 2), part = mod[2] === '1' ? b.slice(0, m2) : b.slice(m2); return part.map(function (x) { return splitRate(x.trim())[mod[1] === 'l' ? 0 : 1]; }).join('\n'); }
      case 'num': return String(v).split('\n').filter(function (x) { return x.trim(); }).map(function (x, i) { return (i + 1) + '.  ' + x.trim(); }).join('\n');
    }
    return v;
  }
  function fillTags(s, vals) { return String(s).replace(/\{\{\s*([A-Z0-9_]+)(?:\|([a-z0-9]+))?\s*\}\}/g, function (m, k, mod) { var v = vals && vals[k] != null ? String(vals[k]) : ''; return mod ? modify(v, mod) : v; }); }
  ST.fillTags = fillTags;

  // QR / barcode images
  function qrURL(data, color, bg) {
    var q = window.qrcode(0, 'M'); q.addData(String(data || ' ').slice(0, 900), 'Byte'); q.make();
    var n = q.getModuleCount(), s = 10, pad = 2, c = canvasEl((n + pad * 2) * s, (n + pad * 2) * s), x = c.getContext('2d');
    x.fillStyle = bg || '#ffffff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = color || '#000000';
    for (var r = 0; r < n; r++) for (var cc = 0; cc < n; cc++) if (q.isDark(r, cc)) x.fillRect((cc + pad) * s, (r + pad) * s, s, s);
    return c.toDataURL('image/png');
  }
  function barURL(data, color, fmt) {
    var c = document.createElement('canvas');
    try { window.JsBarcode(c, String(data || '0000'), { format: fmt || 'CODE128', lineColor: color || '#000', width: 3, height: 90, displayValue: true, fontSize: 22, margin: 8, background: '#ffffff' }); }
    catch (e) { window.JsBarcode(c, '0000', { format: 'CODE128' }); }
    return c.toDataURL('image/png');
  }
  if (window.qrcode) { try { window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs['UTF-8']; } catch (e) {} }

  // ---------- template objects → fabric JSON ----------
  function grad(g, w, h) {
    if (!g || typeof g === 'string') return g;
    var a = (g.angle || 0) * Math.PI / 180, cx = w / 2, cy = h / 2, r = Math.abs(w / 2 * Math.cos(a)) + Math.abs(h / 2 * Math.sin(a));
    return new F.Gradient({ type: 'linear', gradientUnits: 'pixels', coords: { x1: cx - Math.cos(a) * r, y1: cy - Math.sin(a) * r, x2: cx + Math.cos(a) * r, y2: cy + Math.sin(a) * r },
      colorStops: g.stops.map(function (s, i) { return typeof s === 'string' ? { offset: i / (g.stops.length - 1), color: s } : { offset: s[0], color: s[1] }; }) });
  }
  function shadowOf(s) { return s ? new F.Shadow({ color: s.c || 'rgba(0,0,0,.3)', blur: s.b == null ? 12 : s.b, offsetX: s.x || 0, offsetY: s.y == null ? 6 : s.y }) : null; }
  function phBox(o) {
    var w = o.w, h = o.h, shape = o.shape || 'rect', r = shape === 'circle' ? Math.min(w, h) / 2 : (o.r || 0);
    var base = shape === 'circle' ? new F.Circle({ radius: Math.min(w, h) / 2, left: 0, top: 0, fill: o.fill || '#E4E9EF', stroke: o.stroke || '#9AA6B4', strokeWidth: o.sw == null ? 2 : o.sw, strokeDashArray: [8, 6] })
      : new F.Rect({ width: w, height: h, rx: r, ry: r, left: 0, top: 0, fill: o.fill || '#E4E9EF', stroke: o.stroke || '#9AA6B4', strokeWidth: o.sw == null ? 2 : o.sw, strokeDashArray: [8, 6] });
    var lbl = o.label || (o.ph === 'SIGN' ? 'Signature' : o.ph === 'LOGO' ? 'Logo' : 'Photo'), label = new F.Text(lbl, { fontFamily: 'Poppins', fontSize: Math.max(8, Math.min(Math.min(w, h) * 0.16, (shape === 'circle' ? Math.min(w, h) : w) * 1.5 / Math.max(4, lbl.length))), fill: '#7C8896', originX: 'center', originY: 'center', left: (shape === 'circle' ? Math.min(w, h) : w) / 2, top: (shape === 'circle' ? Math.min(w, h) : h) / 2, fontWeight: 600 });
    var g = new F.Group([base, label], { left: o.x, top: o.y, angle: o.angle || 0 });
    g.ph = o.ph || 'PHOTO'; g.phShape = shape; g.rad = r; g.nm = o.nm || g.ph.toLowerCase();
    return g;
  }
  function mkObj(o, W, H) {
    var f, common = { left: o.x || 0, top: o.y || 0, angle: o.angle || 0, opacity: o.op == null ? 1 : o.op };
    switch (o.t) {
      case 'rect': f = new F.Rect(Object.assign(common, { width: o.w, height: o.h, rx: o.r || 0, ry: o.r || 0, fill: grad(o.fill === undefined ? '#000' : (o.fill || ''), o.w, o.h), stroke: o.stroke || null, strokeWidth: o.sw || 0, strokeDashArray: o.dash || null, shadow: shadowOf(o.shadow) })); f.rad = o.r || 0; break;
      case 'circle': f = new F.Circle(Object.assign(common, { radius: o.rr, fill: grad(o.fill === undefined ? '#000' : (o.fill || ''), o.rr * 2, o.rr * 2), stroke: o.stroke || null, strokeWidth: o.sw || 0, strokeDashArray: o.dash || null, shadow: shadowOf(o.shadow) })); break;
      case 'ellipse': f = new F.Ellipse(Object.assign(common, { rx: o.rx, ry: o.ry, fill: grad(o.fill === undefined ? '#000' : (o.fill || ''), o.rx * 2, o.ry * 2), stroke: o.stroke || null, strokeWidth: o.sw || 0 })); break;
      case 'line': f = new F.Line([o.x1, o.y1, o.x2, o.y2], { stroke: o.stroke || '#000', strokeWidth: o.sw || 2, strokeDashArray: o.dash || null, opacity: common.opacity, strokeLineCap: o.cap || 'butt' }); break;
      case 'path': f = new F.Path(o.d, { fill: grad(o.fill === undefined ? '#000' : (o.fill || ''), o.gw || W, o.gh || H), stroke: o.stroke || null, strokeWidth: o.sw || 0, opacity: common.opacity, shadow: shadowOf(o.shadow) }); if (o.x != null) f.set({ left: o.x, top: o.y }); break;
      case 'poly': f = new F.Polygon(o.pts.map(function (p) { return { x: p[0], y: p[1] }; }), { fill: grad(o.fill === undefined ? '#000' : (o.fill || ''), W, H), stroke: o.stroke || null, strokeWidth: o.sw || 0, opacity: common.opacity, shadow: shadowOf(o.shadow) }); break;
      case 'text': {
        var tx = new F.Textbox(o.text || '', Object.assign(common, {
          width: o.w || 300, fontFamily: o.font || 'Poppins', fontSize: o.size || 24, fill: grad(o.color || '#1B2330', o.w || 300, (o.size || 24) * 1.3), fontWeight: o.bold ? (o.bold === true ? 700 : o.bold) : 400,
          fontStyle: o.italic ? 'italic' : 'normal', underline: !!o.u, textAlign: o.align || 'left', lineHeight: o.lh || 1.2, charSpacing: o.ls || 0,
          stroke: o.stroke || null, strokeWidth: o.sw || 0, paintFirst: 'stroke', shadow: shadowOf(o.shadow), backgroundColor: o.bg || '', splitByGrapheme: !!o.anyWrap
        }));
        tx.tpl = o.text || ''; f = tx; break;
      }
      case 'photo': f = phBox(o); break;
      case 'qr': f = { _async: 'qr', o: o }; break;
      case 'barcode': f = { _async: 'bc', o: o }; break;
      case 'image': f = { _async: 'img', o: o }; break;
      default: return null;
    }
    if (f && !f._async) { if (o.nm) f.nm = o.nm; if (o.lock) { f.stLock = true; } }
    return f;
  }
  function asyncObj(a, vals) {
    var o = a.o;
    if (a._async === 'qr') {
      var data = fillTags(o.data || 'S Printer', vals);
      return imgObj(qrURL(data, o.color, o.bgc), { x: o.x, y: o.y, w: o.s, h: o.s }).then(function (im) { im.qr = { data: o.data || '', color: o.color || '#000000', bgc: o.bgc || '#ffffff' }; im.nm = o.nm || 'QR code'; return im; });
    }
    if (a._async === 'bc') {
      var d2 = fillTags(o.data || '123456789012', vals);
      return imgObj(barURL(d2, o.color), { x: o.x, y: o.y, w: o.w, h: o.h, stretch: true }).then(function (im) { im.bc = { data: o.data || '', color: o.color || '#000000' }; im.nm = o.nm || 'Barcode'; return im; });
    }
    return imgObj(o.src, { x: o.x, y: o.y, w: o.w, h: o.h, fit: o.fit || 'cover', shape: o.shape, r: o.r }).then(function (im) { im.nm = o.nm || 'Image'; return im; });
  }
  // image placed in a frame: cover (crop to fill) or contain
  function imgObj(src, fr) {
    return new Promise(function (res, rej) {
      F.Image.fromURL(src, function (im) {
        if (!im || !im.width) { rej(new Error('image')); return; }
        var iw = im.width, ih = im.height;
        if (fr.stretch) im.set({ scaleX: fr.w / iw, scaleY: fr.h / ih });
        else if (fr.fit === 'contain') { var k = Math.min(fr.w / iw, fr.h / ih); im.set({ scaleX: k, scaleY: k }); fr.x += (fr.w - iw * k) / 2; fr.y += (fr.h - ih * k) / 2; }
        else {
          var s = Math.max(fr.w / iw, fr.h / ih), cw = fr.w / s, ch = fr.h / s;
          im.set({ cropX: (iw - cw) / 2, cropY: (ih - ch) / 2, width: cw, height: ch, scaleX: s, scaleY: s });
        }
        im.set({ left: fr.x, top: fr.y, angle: fr.angle || 0 });
        im.srcOrig = src;
        applyShape(im, fr.shape, fr.r);
        res(im);
      }, { crossOrigin: 'anonymous' });
    });
  }
  function applyShape(im, shape, r) {
    im.phShape = shape || 'rect'; im.rad = r || 0;
    if (shape === 'circle') im.clipPath = new F.Circle({ radius: Math.min(im.width, im.height) / 2, originX: 'center', originY: 'center' });
    else if (r) im.clipPath = new F.Rect({ width: im.width, height: im.height, rx: r / (im.scaleX || 1), ry: r / (im.scaleY || 1), originX: 'center', originY: 'center' });
    else im.clipPath = null;
  }
  ST.applyShape = applyShape;

  // build a whole design {w,h,mm,pages:[{bg, objects}]} into page JSONs that fabric can load
  function buildPages(design, vals) {
    var W = design.w, H = design.h;
    return Promise.all(design.pages.map(function (pg) {
      var list = (pg.objects || []).map(function (o) { return mkObj(o, W, H); }).filter(Boolean);
      return Promise.all(list.map(function (f) { return f._async ? asyncObj(f, vals).catch(function () { return null; }) : f; })).then(function (objs) {
        var sc = new F.StaticCanvas(null, { width: W, height: H, renderOnAddRemove: false });
        sc.backgroundColor = grad(pg.bg || '#ffffff', W, H);
        objs.forEach(function (o) { if (o) sc.add(o); });
        var json = sc.toJSON(PROPS); sc.dispose(); return json;
      });
    }));
  }
  ST.buildPages = buildPages;

  // render a page JSON to an image (exports and thumbnails)
  function renderJSON(json, W, H, mult, vals) {
    return new Promise(function (res) {
      var sc = new F.StaticCanvas(null, { width: W, height: H, renderOnAddRemove: false, enableRetinaScaling: false });
      var j = vals ? fillJSON(clone(json), vals) : json;
      fontsFor(j.objects).then(function () {
        sc.loadFromJSON(j, function () {
          var done = function () { if ((mult || 1) >= 1) sc.getObjects().filter(function (o) { return o.ph && o.type === 'group'; }).forEach(function (o) { sc.remove(o); }); sc.renderAll(); var c = sc.toCanvasElement(mult || 1); sc.dispose(); res(c); };
          if (vals) refreshCodes(sc, vals).then(done, done); else done();
        });
      });
    });
  }
  ST.renderJSON = renderJSON;
  // text tags in a page JSON
  function fillJSON(json, vals) {
    (function walk(list) { list.forEach(function (o) { if (o.objects) walk(o.objects); if (o.tpl != null && /\{\{/.test(o.tpl) && 'text' in o) o.text = fillTags(o.tpl, vals); }); })(json.objects || []);
    return json;
  }
  ST.fillJSON = fillJSON;
  // QR / barcode / photo placeholders that depend on the details
  function refreshCodes(cv, vals) {
    var jobs = [];
    cv.getObjects().slice().forEach(function (o) {
      if (o.qr && /\{\{/.test(o.qr.data)) jobs.push(swapSrc(o, qrURL(fillTags(o.qr.data, vals), o.qr.color, o.qr.bgc), true));
      if (o.bc && /\{\{/.test(o.bc.data)) jobs.push(swapSrc(o, barURL(fillTags(o.bc.data, vals), o.bc.color), true));
      if (o.ph && vals && vals['@' + o.ph] && (o.type === 'group' || o.phSrc !== vals['@' + o.ph])) jobs.push(fillPh(cv, o, vals['@' + o.ph]));
    });
    return Promise.all(jobs);
  }
  ST.refreshCodes = refreshCodes;
  function swapSrc(o, url, keepBox) {
    return new Promise(function (res) {
      var w = o.getScaledWidth(), h = o.getScaledHeight();
      o.setSrc(url, function () { if (keepBox) o.set({ scaleX: w / o.width, scaleY: h / o.height, cropX: 0, cropY: 0 }); o.dirty = true; res(o); }, { crossOrigin: 'anonymous' });
    });
  }
  // put a photo into a placeholder (or replace an existing photo keeping its frame)
  function fillPh(cv, target, url) {
    var fr = { x: target.left, y: target.top, w: target.getScaledWidth(), h: target.getScaledHeight(), angle: target.angle, shape: target.phShape, r: target.rad };
    if (target.phShape === 'circle') { var d = Math.min(fr.w, fr.h); fr.w = fr.h = d; }
    return imgObj(url, fr).then(function (im) {
      im.ph = target.ph; im.phSrc = url; im.nm = target.nm; im.shadow = target.shadow || null; im.stroke = target.type === 'image' ? target.stroke : null; im.strokeWidth = target.type === 'image' ? target.strokeWidth : 0;
      var idx = cv.getObjects().indexOf(target); cv.remove(target); cv.insertAt(im, Math.max(0, idx)); return im;
    });
  }
  ST.fillPh = fillPh;

  // ======================================================================
  function Studio(host, cfg) {
    var S = this; S.cfg = cfg;
    var sizes = cfg.sizes, size = sizes[0], vals = {}, pinned = {};
    var doc = { tool: cfg.tool, w: size.w, h: size.h, mm: size.mm || [size.w * 25.4 / 96, size.h * 25.4 / 96], pages: [], tplId: null, name: cfg.title };
    var cur = 0, zoom = 1, cv = null, hist = [], fut = [], muted = 0, dirty = false, sampleOf = {};
    try { vals = JSON.parse(localStorage.getItem('st-vals-' + cfg.tool) || '{}') || {}; } catch (e) {}
    (cfg.fields || []).forEach(function (f) { if (vals[f.k] == null) vals[f.k] = f.def || ''; });
    S.vals = vals;

    // ---------- DOM ----------
    host.innerHTML = '';
    var app = el('div', 'st-app'); host.appendChild(app);
    var top = el('div', 'st-top');
    top.innerHTML =
      '<button class="st-tb" data-a="undo" title="Undo">' + I.undo + '</button><button class="st-tb" data-a="redo" title="Redo">' + I.redo + '</button>' +
      '<span class="st-zoom"><button data-z="-1" aria-label="Zoom out">' + I.zout + '</button><button data-z="0">Fit</button><button data-z="1" aria-label="Zoom in">' + I.zin + '</button></span>' +
      '<span class="st-sp"></span>' +
      '<button class="st-tb" data-a="draft">' + I.save + '<span>Save draft</span></button>' +
      '<button class="st-tb" data-a="jpg">' + I.jpg + '<span>JPG</span></button>' +
      '<button class="st-tb" data-a="png">' + I.jpg + '<span>PNG</span></button>' +
      '<button class="st-tb" data-a="pdf">' + I.pdf + '<span>PDF</span></button>' +
      '<button class="st-tb" data-a="share">' + I.share + '<span>Share</span></button>' +
      '<button class="st-tb st-main" data-a="print">' + I.print + '<span>Print</span></button>';
    app.appendChild(top);
    var side = el('aside', 'st-side'), tabs = el('div', 'st-tabs'), panel = el('div', 'st-panel');
    var TABS = [['tpl', 'Templates', I.tpl], ['data', cfg.dataLabel || 'Details', I.data]].concat(cfg.id ? [['db', 'Database', I.db]] : []).concat([['els', 'Elements', I.els], ['ai', 'AI', I.ai], ['page', 'Page', I.page], ['layers', 'Layers', I.layers]]);
    tabs.innerHTML = TABS.map(function (t) { return '<button class="st-tab" role="tab" data-t="' + t[0] + '" aria-selected="false">' + t[2] + t[1] + '</button>'; }).join('');
    side.appendChild(tabs); side.appendChild(panel); app.appendChild(side);
    var stage = el('div', 'st-stage'), center = el('div', 'st-center'), box = el('div', 'st-canvasbox'), cnv = document.createElement('canvas');
    box.appendChild(cnv); center.appendChild(box); stage.appendChild(center); app.appendChild(stage);
    var pagesBar = el('div', 'st-pages'); app.appendChild(pagesBar);
    var props = el('div', 'st-props'); props.hidden = true; app.appendChild(props);
    var fx = el('div', 'st-fx'); fx.hidden = true; app.appendChild(fx);
    var busyEl = el('div', 'st-busy', '<span></span><b>Working…</b>'); busyEl.hidden = true; document.body.appendChild(busyEl);
    var toastEl = el('div', 'st-toast'); document.body.appendChild(toastEl);
    var printRoot = document.getElementById('st-print-root') || document.body.appendChild(el('div')); printRoot.id = 'st-print-root';
    function busy(on, t) { busyEl.hidden = !on; if (t) busyEl.querySelector('b').textContent = t; }
    function toast(t) { toastEl.textContent = t; toastEl.classList.add('on'); clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('on'); }, 2800); }
    S.toast = toast; S.busy = busy;
    var mobile = function () { return window.innerWidth <= 900; };

    // ---------- fabric canvas ----------
    F.Object.prototype.set({ transparentCorners: false, cornerColor: '#ffffff', cornerStrokeColor: '#0098D8', borderColor: '#0098D8', cornerStyle: 'circle', cornerSize: 12, touchCornerSize: 30, padding: 4, borderScaleFactor: 1.6 });
    cv = new F.Canvas(cnv, { preserveObjectStacking: true, enableRetinaScaling: true, allowTouchScrolling: true, selectionColor: 'rgba(0,152,216,.08)', selectionBorderColor: '#0098D8', stopContextMenu: true, fireRightClick: false });
    S.canvas = cv;
    function setZoom(z) {
      zoom = Math.max(0.08, Math.min(4, z));
      cv.setZoom(zoom); cv.setDimensions({ width: Math.round(doc.w * zoom), height: Math.round(doc.h * zoom) });
    }
    function fit() {
      var aw = stage.clientWidth - (mobile() ? 28 : 48), ah = stage.clientHeight - (mobile() ? 28 : 48);
      setZoom(Math.min(aw / doc.w, ah / doc.h));
    }
    S.fit = fit;
    top.querySelector('.st-zoom').addEventListener('click', function (e) { var b = e.target.closest('[data-z]'); if (!b) return; var d = +b.dataset.z; if (!d) fit(); else setZoom(zoom * (d > 0 ? 1.2 : 1 / 1.2)); });
    window.addEventListener('resize', function () { clearTimeout(S._rz); S._rz = setTimeout(fit, 150); });
    // pinch: zoom the page, or resize the selected object
    var pinch = null;
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 2) return;
      var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), a = cv.getActiveObject();
      pinch = { d: d, z: zoom, o: a && !a.stLock ? a : null, sx: a ? a.scaleX : 1, sy: a ? a.scaleY : 1 };
      e.preventDefault(); e.stopPropagation();
    }, { capture: true, passive: false });
    stage.addEventListener('touchmove', function (e) {
      if (!pinch || e.touches.length !== 2) return;
      var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), k = d / pinch.d;
      if (pinch.o) { var c = pinch.o.getCenterPoint(); pinch.o.set({ scaleX: pinch.sx * k, scaleY: pinch.sy * k }); pinch.o.setPositionByOrigin(c, 'center', 'center'); pinch.o.setCoords(); cv.requestRenderAll(); }
      else setZoom(pinch.z * k);
      e.preventDefault(); e.stopPropagation();
    }, { capture: true, passive: false });
    stage.addEventListener('touchend', function (e) { if (pinch && e.touches.length < 2) { if (pinch.o) { cv.fire('object:modified', { target: pinch.o }); } pinch = null; } }, { capture: true });
    stage.addEventListener('wheel', function (e) { if (!e.ctrlKey) return; e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)); }, { passive: false });

    // snapping to the page centre and edges
    var guides = [];
    function clearGuides() { guides.forEach(function (g) { g.remove(); }); guides = []; }
    function guide(x, y) { var g = el('div', 'st-guide'); g.style.cssText = x != null ? 'left:' + x * zoom + 'px;top:0;width:1px;height:100%' : 'top:' + y * zoom + 'px;left:0;height:1px;width:100%'; box.style.position = 'relative'; box.appendChild(g); guides.push(g); }
    cv.on('object:moving', function (e) {
      var o = e.target, b = o.getBoundingRect(true, true), t = 7 / zoom; clearGuides();
      var cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      if (Math.abs(cx - doc.w / 2) < t) { o.left += doc.w / 2 - cx; guide(doc.w / 2); }
      if (Math.abs(cy - doc.h / 2) < t) { o.top += doc.h / 2 - cy; guide(null, doc.h / 2); }
      if (Math.abs(b.left) < t) o.left -= b.left; if (Math.abs(b.top) < t) o.top -= b.top;
      if (Math.abs(b.left + b.width - doc.w) < t) o.left += doc.w - b.left - b.width;
      if (Math.abs(b.top + b.height - doc.h) < t) o.top += doc.h - b.top - b.height;
    });
    cv.on('mouse:up', clearGuides);

    // ---------- history ----------
    function snap() { return JSON.stringify(cv.toJSON(PROPS)); }
    function record() { if (muted) return; var sn = snap(); if (hist[hist.length - 1] === sn) return; hist.push(sn); if (hist.length > 50) hist.shift(); fut = []; dirty = true; syncUndo(); autosave(); }
    function syncUndo() { top.querySelector('[data-a=undo]').disabled = hist.length < 2; top.querySelector('[data-a=redo]').disabled = !fut.length; }
    function restore(json) { muted++; return new Promise(function (r) { var j = JSON.parse(json); fontsFor(j.objects).then(function () { cv.loadFromJSON(j, function () { lockAll(); cv.renderAll(); muted--; r(); }); }); }); }
    cv.on('object:modified', record); cv.on('object:added', function () { if (!muted) record(); }); cv.on('object:removed', function () { if (!muted) record(); });
    cv.on('text:changed', function (e) { e.target.tpl = e.target.text; });
    cv.on('text:editing:exited', record);
    function undo() { if (hist.length < 2) return; fut.push(hist.pop()); restore(hist[hist.length - 1]).then(function () { syncUndo(); showProps(); }); }
    function redo() { if (!fut.length) return; var s = fut.pop(); hist.push(s); restore(s).then(function () { syncUndo(); showProps(); }); }
    function lockAll() { cv.getObjects().forEach(function (o) { if (o.stLock) o.set({ lockMovementX: true, lockMovementY: true, lockScalingX: true, lockScalingY: true, lockRotation: true, hasControls: false }); }); }

    // ---------- pages ----------
    function saveCur() { if (doc.pages[cur]) doc.pages[cur] = cv.toJSON(PROPS); }
    function loadPage(i) {
      saveCur(); cur = i; muted++;
      return new Promise(function (r) {
        var j = doc.pages[i]; fontsFor(j.objects).then(function () {
          cv.loadFromJSON(j, function () { lockAll(); cv.discardActiveObject(); cv.renderAll(); muted--; applyVals(true); hist = [snap()]; fut = []; syncUndo(); showProps(); renderPagesBar(); if (curTab === 'layers') renderTab(); r(); });
        });
      });
    }
    S.loadPage = loadPage;
    function renderPagesBar() {
      var names = doc.pageNames || [];
      pagesBar.innerHTML = doc.pages.map(function (p, i) { return '<button class="st-pg" data-p="' + i + '" aria-pressed="' + (i === cur) + '">' + esc(names[i] || ('Page ' + (i + 1))) + '</button>'; }).join('') +
        (cfg.fixedPages ? '' : '<button class="st-pg" data-p="add">+ Page</button>' + (doc.pages.length > 1 ? '<button class="st-pg" data-p="del" title="Delete this page">− Page</button>' : '')) +
        '<span class="st-hint">' + Math.round(doc.mm[0] * 10) / 10 + ' × ' + Math.round(doc.mm[1] * 10) / 10 + ' mm · double-tap text to type · pinch to zoom</span>';
    }
    pagesBar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-p]'); if (!b) return; var p = b.dataset.p;
      if (p === 'add') { saveCur(); doc.pages.push({ version: F.version, objects: [], background: '#ffffff' }); loadPage(doc.pages.length - 1); return; }
      if (p === 'del') { if (!confirm('Delete this page?')) return; doc.pages.splice(cur, 1); cur = Math.min(cur, doc.pages.length - 1); muted++; cv.loadFromJSON(doc.pages[cur], function () { muted--; cv.renderAll(); renderPagesBar(); }); return; }
      if (+p !== cur) loadPage(+p);
    });

    // ---------- load a template ----------
    function tplById(id) { return TPL.find(function (t) { return t.id === id; }); }
    function sizeById(k) { return sizes.find(function (s) { return s.k === k; }) || sizes[0]; }
    function designOf(t, sz) { ST.curVals = withSample(t); var d = t.build(sz.w, sz.h, t.pal || {}, sz); d.w = sz.w; d.h = sz.h; return d; }
    function useDesign(design, meta) {
      busy(true, 'Opening design…');
      return buildPages(design, valsFull()).then(function (pages) {
        doc.pages = pages; doc.w = design.w; doc.h = design.h; doc.mm = design.mm || (meta && meta.mm) || [design.w * 25.4 / 96, design.h * 25.4 / 96];
        doc.pageNames = design.pageNames || null; doc.tplId = meta && meta.id || null; cur = 0;
        doc.pages[0] && (cur = 0); muted++;
        return new Promise(function (r) {
          var j = doc.pages[0]; fontsFor(j.objects).then(function () {
            cv.loadFromJSON(j, function () { lockAll(); fit(); muted--; hist = [snap()]; fut = []; syncUndo(); renderPagesBar(); applyVals(true).then(function () { busy(false); autosave(); r(); }); });
          });
        });
      }).catch(function (e) { busy(false); toast('Could not open this design.'); console.error(e); });
    }
    function isSample(k) { return !vals[k] || vals[k] === sampleOf[k] || (cfg.fields || []).some(function (f) { return f.k === k && f.def === vals[k]; }) || TPL.some(function (t) { return t.vals && t.vals[k] === vals[k]; }); }
    function withSample(t) { var v = Object.assign({}, vals); if (t && t.vals) Object.keys(t.vals).forEach(function (k) { if (isSample(k)) v[k] = t.vals[k]; }); return v; }
    S.useTemplate = function (id, sizeKey) {
      var t = tplById(id); if (!t) return Promise.resolve();
      var sz = sizeById(sizeKey || (t.sizes ? t.sizes[0] : sizes[0].k));
      if (t.sizes && t.sizes.indexOf(sz.k) < 0) sz = sizeById(t.sizes[0]);
      size = sz;
      if (t.vals) { var mv = withSample(t); Object.keys(t.vals).forEach(function (k) { if (mv[k] === t.vals[k]) sampleOf[k] = t.vals[k]; }); Object.assign(vals, mv); saveVals(); }
      return useDesign(designOf(t, sz), { id: id, mm: sz.mm });
    };
    S.useDesign = useDesign;

    // ---------- smart details ----------
    function valsFull() { var v = Object.assign({}, vals); return v; }
    function applyVals(quiet) {
      var objs = cv.getObjects();
      objs.forEach(function (o) { if (o.tpl != null && /\{\{/.test(o.tpl) && o.text !== undefined) { var t = fillTags(o.tpl, vals); if (t !== o.text) { o.set('text', t); o.initDimensions && o.initDimensions(); } } });
      return refreshCodes(cv, vals).then(function () { cv.requestRenderAll(); if (!quiet) { record(); } });
    }
    S.applyVals = applyVals;
    function saveVals() { try { localStorage.setItem('st-vals-' + cfg.tool, JSON.stringify(pickSaved())); } catch (e) {} }
    function pickSaved() { var o = {}; Object.keys(vals).forEach(function (k) { if (k[0] !== '@' || String(vals[k]).length < 400000) o[k] = vals[k]; }); return o; }
    S.setVals = function (v) { Object.assign(vals, v); return applyVals(true); };

    // ---------- autosave & drafts (IndexedDB) ----------
    var idb = null;
    function db() {
      if (idb) return idb;
      idb = new Promise(function (res, rej) { var r = indexedDB.open('sp-studio', 1); r.onupgradeneeded = function () { var d = r.result; ['drafts', 'records'].forEach(function (s) { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' }); }); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; });
      return idb;
    }
    function dbDo(store, mode, fn) { return db().then(function (d) { return new Promise(function (res, rej) { var tx = d.transaction(store, mode), st = tx.objectStore(store), out = fn(st); tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); }; tx.onerror = function () { rej(tx.error); }; }); }); }
    S.dbDo = dbDo;
    S.snapshot = function () { return docSnapshot(); };
    function docSnapshot() { saveCur(); return { tool: cfg.tool, w: doc.w, h: doc.h, mm: doc.mm, pages: doc.pages, pageNames: doc.pageNames, tplId: doc.tplId, cur: cur }; }
    var asT = null;
    function autosave() { clearTimeout(asT); asT = setTimeout(function () { if (!doc.pages.length) return; var s = docSnapshot(); s.id = 'auto-' + cfg.tool; s.at = Date.now(); dbDo('drafts', 'readwrite', function (st) { return st.put(s); }).catch(function () {}); }, 900); }
    function openSnapshot(s) {
      doc.w = s.w; doc.h = s.h; doc.mm = s.mm; doc.pages = s.pages; doc.pageNames = s.pageNames; doc.tplId = s.tplId; cur = Math.min(s.cur || 0, s.pages.length - 1);
      size = sizes.find(function (z) { return z.w === s.w && z.h === s.h; }) || size;
      muted++;
      return new Promise(function (r) { var j = doc.pages[cur]; fontsFor(j.objects).then(function () { cv.loadFromJSON(j, function () { lockAll(); fit(); cv.renderAll(); muted--; hist = [snap()]; fut = []; syncUndo(); renderPagesBar(); r(); }); }); });
    }
    function saveDraft() {
      var name = prompt('Name for this draft', (doc.tplId ? (tplById(doc.tplId) || {}).name : cfg.title) + ' — ' + new Date().toLocaleDateString());
      if (name == null) return;
      busy(true, 'Saving…');
      var s = docSnapshot(); s.id = 'd' + Date.now(); s.name = name || 'Draft'; s.at = Date.now();
      renderJSON(s.pages[0], s.w, s.h, 160 / Math.max(s.w, s.h)).then(function (c) {
        s.thumb = c.toDataURL('image/jpeg', 0.7);
        return dbDo('drafts', 'readwrite', function (st) { return st.put(s); });
      }).then(function () { busy(false); toast('Draft saved on this device.'); if (curTab === 'tpl') renderTab(); }).catch(function () { busy(false); toast('Could not save the draft (storage full?).'); });
    }
    function listDrafts() { return dbDo('drafts', 'readonly', function (st) { return st.getAll(); }).then(function (a) { return (a || []).filter(function (d) { return d.tool === cfg.tool && d.id.indexOf('auto-') !== 0; }).sort(function (a, b) { return b.at - a.at; }); }).catch(function () { return []; }); }

    // ---------- export ----------
    function dpi() { return (window.SPPaper && SPPaper.dpi()) || 300; }
    function exportPages(fmt, mode) {
      saveCur();
      var mult = mode === 'screen' ? Math.max(1, 1600 / Math.max(doc.w, doc.h)) : (doc.mm[0] / 25.4 * dpi()) / doc.w;
      mult = Math.min(mult, 8000 / Math.max(doc.w, doc.h));
      var out = [], i = 0;
      function next() {
        if (i >= doc.pages.length) return Promise.resolve(out);
        busy(true, 'Preparing page ' + (i + 1) + ' of ' + doc.pages.length + '…');
        return renderJSON(doc.pages[i], doc.w, doc.h, mult, vals).then(function (c) {
          if (fmt !== 'png' && mode === 'print' && window.SPPaper) SPPaper.tune(c);
          out.push({ c: c }); i++; return next();
        });
      }
      return next().then(function (r) { busy(false); return r; }, function (e) { busy(false); throw e; });
    }
    function fname(ext, i) { var n = (cfg.file || cfg.tool) + '-' + new Date().toISOString().slice(0, 10); return 'SPrinter-' + n + (i != null && doc.pages.length > 1 ? '-' + (i + 1) : '') + '.' + ext; }
    function saveURL(name, url) { var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 1000); }
    S.saveURL = saveURL;
    function toPDF(list, mmW, mmH) {
      var J = window.jspdf.jsPDF, pdf = null;
      list.forEach(function (p) {
        var w = p.mm ? p.mm[0] : mmW, h = p.mm ? p.mm[1] : mmH, o = w > h ? 'l' : 'p';
        if (!pdf) pdf = new J({ orientation: o, unit: 'mm', format: [w, h], compress: true }); else pdf.addPage([w, h], o);
        pdf.addImage(p.url || p.c.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, w, h, undefined, 'FAST');
      });
      return pdf;
    }
    S.toPDF = toPDF;
    function printImages(urls, mmW, mmH) {
      printRoot.innerHTML = '';
      var css = document.getElementById('st-page-css') || document.head.appendChild(el('style')); css.id = 'st-page-css';
      css.textContent = '@media print{@page{size:' + mmW + 'mm ' + mmH + 'mm;margin:0}#st-print-root img{width:' + mmW + 'mm;height:' + mmH + 'mm;object-fit:contain}}';
      var left = urls.length;
      urls.forEach(function (u) { var im = new Image(); im.onload = im.onerror = function () { if (--left === 0) go(); }; im.src = u; printRoot.appendChild(im); });
      function go() {
        document.body.classList.add('st-printing');
        var off = function () { document.body.classList.remove('st-printing'); window.removeEventListener('afterprint', off); };
        window.addEventListener('afterprint', off); setTimeout(function () { window.print(); setTimeout(off, 1500); }, 60);
      }
    }
    S.printImages = printImages;
    function doExport(a) {
      if (a === 'jpg' || a === 'png') return exportPages(a, 'file').then(function (list) { list.forEach(function (p, i) { setTimeout(function () { saveURL(fname(a, i), p.c.toDataURL(a === 'png' ? 'image/png' : 'image/jpeg', 0.98)); }, i * 400); }); toast('Saved ' + list.length + (list.length > 1 ? ' images.' : ' image.')); });
      if (a === 'pdf') return exportPages('jpg', 'print').then(function (list) { var pdf = toPDF(list, doc.mm[0], doc.mm[1]); pdf.save(fname('pdf')); toast('PDF saved.'); });
      if (a === 'print') return exportPages('jpg', 'print').then(function (list) { printImages(list.map(function (p) { return p.c.toDataURL('image/jpeg', 0.98); }), doc.mm[0], doc.mm[1]); });
      if (a === 'share') return exportPages('jpg', 'screen').then(function (list) {
        list[0].c.toBlob(function (b) {
          var f = new File([b], fname('jpg'), { type: 'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: cfg.title }).catch(function () {});
          else { saveURL(fname('jpg'), URL.createObjectURL(b)); toast('Sharing is not supported here — the image was saved instead.'); }
        }, 'image/jpeg', 0.92);
      });
    }
    top.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a;
      cv.discardActiveObject(); cv.requestRenderAll();
      if (a === 'undo') undo(); else if (a === 'redo') redo(); else if (a === 'draft') saveDraft();
      else { var p = doExport(a); if (p && p.catch) p.catch(function (er) { busy(false); toast('Could not export: ' + (er && er.message || er)); }); }
    });
    S.exportPages = exportPages; S.doc = doc;

    // ---------- keyboard ----------
    document.addEventListener('keydown', function (e) {
      var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      var a = cv.getActiveObject(); if (a && a.isEditing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      if (!a) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); act('del'); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); act('dup'); }
      else if (/^Arrow/.test(e.key) && !a.stLock) { e.preventDefault(); var st = e.shiftKey ? 10 : 1; if (e.key === 'ArrowLeft') a.left -= st; if (e.key === 'ArrowRight') a.left += st; if (e.key === 'ArrowUp') a.top -= st; if (e.key === 'ArrowDown') a.top += st; a.setCoords(); cv.requestRenderAll(); clearTimeout(S._kt); S._kt = setTimeout(record, 300); }
    });

    // ---------- selection properties bar ----------
    var SW = ['#000000', '#1B2330', '#ffffff', '#0098D8', '#D6247A', '#F5C400', '#16a34a', '#dc2626', '#ea580c', '#7c3aed', '#0f766e', '#b45309', '#9f1239', '#1e40af'];
    function fontSelect(cur) {
      return '<select data-p="font" title="Font">' + FONTS.map(function (g) { return '<optgroup label="' + g[0] + '">' + g[1].map(function (f) { return '<option' + (f[0] === cur ? ' selected' : '') + '>' + f[0] + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select>';
    }
    function colorOf(v) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : typeof v === 'string' && /^#[0-9a-f]{3}$/i.test(v) ? '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3] : '#000000'; }
    function showProps() {
      var o = cv.getActiveObject();
      if (!o) { props.hidden = true; fx.hidden = true; return; }
      var h = '', isText = o.type === 'textbox' || o.type === 'i-text' || o.type === 'text', isImg = o.type === 'image', isPh = !!(o.ph && o.type === 'group'), multi = o.type === 'activeSelection';
      if (isText) {
        h += '<button class="st-pb" data-p="edit">' + I.edit + 'Edit text</button>' + fontSelect(o.fontFamily) +
          '<button class="st-pb" data-p="fs-">A−</button><input type="number" data-p="fs" value="' + Math.round(o.fontSize) + '" min="4" max="600"><button class="st-pb" data-p="fs+">A+</button>' +
          '<button class="st-pb" data-p="b" aria-pressed="' + (o.fontWeight >= 600 || o.fontWeight === 'bold') + '"><b>B</b></button><button class="st-pb" data-p="i" aria-pressed="' + (o.fontStyle === 'italic') + '"><i>I</i></button><button class="st-pb" data-p="u" aria-pressed="' + !!o.underline + '"><u>U</u></button>' +
          '<button class="st-pb" data-p="align" title="Alignment">' + (I['a' + (o.textAlign || 'left')[0]] || I.al) + '</button>' +
          '<input type="color" data-p="color" value="' + colorOf(o.fill) + '" title="Text colour">';
      } else if (isImg && (o.qr || o.bc)) {
        h += '<button class="st-pb" data-p="code">' + I.edit + (o.qr ? 'QR content' : 'Barcode number') + '</button><input type="color" data-p="codecolor" value="' + colorOf((o.qr || o.bc).color) + '" title="Colour">';
      } else if (isImg || isPh) {
        h += '<button class="st-pb" data-p="photo">' + I.photo + (isPh ? 'Add photo' : 'Replace') + '</button>' + (isImg ? '<button class="st-pb" data-p="photoedit">' + I.crop + 'Crop & edit</button><button class="st-pb" data-p="flip">' + I.flip + 'Flip</button>' : '') +
          '<button class="st-pb" data-p="shape" title="Shape">' + (o.phShape === 'circle' ? I.circle : I.rect) + (o.phShape === 'circle' ? 'Round' : 'Square') + '</button>';
      } else if (!multi) {
        h += '<input type="color" data-p="fill" value="' + colorOf(o.fill) + '" title="Fill colour">' + (o.type === 'line' ? '<input type="color" data-p="stroke" value="' + colorOf(o.stroke) + '" title="Line colour">' : '');
      }
      h += '<button class="st-pb" data-p="fx">' + I.fx + 'Effects</button><span class="st-sep"></span>' +
        '<button class="st-pb" data-p="dup" title="Copy">' + I.dup + '</button><button class="st-pb" data-p="up" title="Bring forward">' + I.up + '</button><button class="st-pb" data-p="down" title="Send backward">' + I.down + '</button>' +
        '<button class="st-pb" data-p="center" title="Centre on page">' + I.center + '</button><button class="st-pb" data-p="lock" aria-pressed="' + !!o.stLock + '" title="Lock">' + I.lock + '</button><button class="st-pb st-danger" data-p="del" title="Delete">' + I.del + '</button>';
      props.innerHTML = h; props.hidden = false;
      if (!fx.hidden) renderFx();
    }
    cv.on('selection:created', showProps); cv.on('selection:updated', showProps); cv.on('selection:cleared', showProps);
    cv.on('mouse:dblclick', function (e) { var o = e.target; if (o && o.ph && o.type === 'group') act('photo'); else if (o && o.type === 'image' && !o.qr && !o.bc) act('photoedit'); else if (o && (o.qr || o.bc)) act('code'); });

    function act(p, val) {
      var o = cv.getActiveObject(); if (!o) return;
      var each = function (fn) { (o.type === 'activeSelection' ? o.getObjects() : [o]).forEach(fn); };
      switch (p) {
        case 'del': each(function (x) { cv.remove(x); }); cv.discardActiveObject(); break;
        case 'dup': o.clone(function (c) { c.set({ left: o.left + 20, top: o.top + 20 }); PROPS.forEach(function (k) { if (o[k] !== undefined) c[k] = clone(o[k]); }); cv.add(c); cv.setActiveObject(c); cv.requestRenderAll(); }, PROPS); return;
        case 'up': o.bringForward(); break;
        case 'down': o.sendBackwards(); break;
        case 'center': o.center(); o.setCoords(); break;
        case 'lock': each(function (x) { x.stLock = !x.stLock; x.set({ lockMovementX: x.stLock, lockMovementY: x.stLock, lockScalingX: x.stLock, lockScalingY: x.stLock, lockRotation: x.stLock, hasControls: !x.stLock }); }); break;
        case 'font': each(function (x) { if (x.fontFamily) { x.set('fontFamily', val); } }); needFont(val); fontsFor([o.type === 'activeSelection' ? { fontFamily: val, text: o.getObjects().map(function (x) { return x.text || ''; }).join(' ') } : o]).then(function () { each(function (x) { x.initDimensions && x.initDimensions(); }); cv.requestRenderAll(); record(); }); return;
        case 'fs': each(function (x) { if (x.fontSize) x.set('fontSize', Math.max(4, val)); }); break;
        case 'fs+': case 'fs-': each(function (x) { if (x.fontSize) x.set('fontSize', Math.max(4, Math.round(x.fontSize * (p === 'fs+' ? 1.1 : 0.9)))); }); break;
        case 'b': each(function (x) { x.set('fontWeight', x.fontWeight >= 600 || x.fontWeight === 'bold' ? 400 : 700); }); break;
        case 'i': each(function (x) { x.set('fontStyle', x.fontStyle === 'italic' ? 'normal' : 'italic'); }); break;
        case 'u': each(function (x) { x.set('underline', !x.underline); }); break;
        case 'align': var A = ['left', 'center', 'right', 'justify']; each(function (x) { x.set('textAlign', A[(A.indexOf(x.textAlign) + 1) % 4]); }); break;
        case 'color': case 'fill': each(function (x) { x.set('fill', val); }); break;
        case 'stroke': each(function (x) { x.set('stroke', val); }); break;
        case 'edit': editText(o); return;
        case 'photo': photoFlow(o, true); return;
        case 'photoedit': photoFlow(o, false); return;
        case 'flip': o.set('flipX', !o.flipX); break;
        case 'shape': { var nx = o.phShape === 'circle' ? 'rect' : 'circle'; if (o.type === 'image') { if (nx === 'circle') { var d = Math.min(o.width, o.height); o.set({ cropX: (o.cropX || 0) + (o.width - d) / 2, cropY: (o.cropY || 0) + (o.height - d) / 2, width: d, height: d, scaleY: o.scaleX }); } applyShape(o, nx, o.rad); } else { o.phShape = nx; } break; }
        case 'code': {
          var c0 = o.qr || o.bc, v = prompt(o.qr ? 'QR code content (text, link, UPI…). Use {{NAME}} style tags to fill from details.' : 'Barcode number / text', c0.data); if (v == null) return;
          c0.data = v; swapSrc(o, o.qr ? qrURL(fillTags(v, vals), c0.color, c0.bgc) : barURL(fillTags(v, vals), c0.color), true).then(function () { cv.requestRenderAll(); record(); }); return;
        }
        case 'codecolor': { var c1 = o.qr || o.bc; c1.color = val; swapSrc(o, o.qr ? qrURL(fillTags(c1.data, vals), val, c1.bgc) : barURL(fillTags(c1.data, vals), val), true).then(function () { cv.requestRenderAll(); record(); }); return; }
        case 'fx': fx.hidden = !fx.hidden; if (!fx.hidden) renderFx(); return;
      }
      if (o.setCoords) o.setCoords(); each(function (x) { x.initDimensions && x.initDimensions(); x.dirty = true; });
      cv.requestRenderAll(); record(); showProps();
    }
    props.addEventListener('click', function (e) { var b = e.target.closest('button[data-p]'); if (b) act(b.dataset.p); });
    props.addEventListener('change', function (e) { var t = e.target; if (!t.dataset.p) return; act(t.dataset.p, t.type === 'number' ? +t.value : t.value); });
    props.addEventListener('input', function (e) { var t = e.target; if (t.type === 'color') { var o = cv.getActiveObject(); if (!o || t.dataset.p === 'codecolor') return; var k = t.dataset.p === 'stroke' ? 'stroke' : 'fill'; (o.type === 'activeSelection' ? o.getObjects() : [o]).forEach(function (x) { x.set(k, t.value); }); cv.requestRenderAll(); } });

    // effects panel
    function rng(k, label, min, max, step, v) { return '<label class="st-rng">' + label + '<input type="range" data-fx="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '"><output>' + v + '</output></label>'; }
    function renderFx() {
      var o = cv.getActiveObject(); if (!o) { fx.hidden = true; return; }
      var isText = !!o.fontSize, sh = o.shadow || {}, h = '';
      if (isText) h += '<h4>Text</h4>' + rng('ls', 'Spacing', -100, 800, 10, o.charSpacing || 0) + rng('lh', 'Line height', 0.6, 3, 0.05, o.lineHeight || 1.16) +
        '<label class="st-rng">Highlight<input type="color" data-fx="tbg" value="' + colorOf(o.backgroundColor || '#ffffff') + '"><button class="st-clear" data-fxc="tbg">Clear</button></label>' +
        '<h4>Text outline <button class="st-clear" data-fxc="stroke">Clear</button></h4>' + rng('sw', 'Thickness', 0, 20, 0.5, o.strokeWidth || 0) + '<label class="st-rng">Colour<input type="color" data-fx="stc" value="' + colorOf(o.stroke || '#ffffff') + '"></label>';
      else h += '<h4>Shape &amp; image</h4>' + rng('rad', 'Corner radius', 0, 300, 1, o.rad || o.rx || 0) +
        '<h4>Border <button class="st-clear" data-fxc="stroke">Clear</button></h4>' + rng('sw', 'Thickness', 0, 40, 0.5, o.strokeWidth || 0) + '<label class="st-rng">Colour<input type="color" data-fx="stc" value="' + colorOf(o.stroke || '#1B2330') + '"></label>';
      h += '<h4>Drop shadow <button class="st-clear" data-fxc="shadow">Clear</button></h4>' + rng('shx', 'X offset', -60, 60, 1, sh.offsetX || 0) + rng('shy', 'Y offset', -60, 60, 1, sh.offsetY || 0) + rng('shb', 'Blur', 0, 80, 1, sh.blur || 0) +
        '<label class="st-rng">Colour<input type="color" data-fx="shc" value="' + colorOf(sh.color && sh.color[0] === '#' ? sh.color : '#000000') + '"></label>' +
        '<h4>Look</h4>' + rng('op', 'Opacity', 0.05, 1, 0.05, o.opacity == null ? 1 : o.opacity) + rng('ang', 'Rotate', -180, 180, 1, Math.round(o.angle || 0));
      fx.innerHTML = h;
    }
    function setFx(k, v) {
      var o = cv.getActiveObject(); if (!o) return;
      (o.type === 'activeSelection' ? o.getObjects() : [o]).forEach(function (x) {
        var sh = x.shadow || new F.Shadow({ color: 'rgba(0,0,0,.35)', blur: 0, offsetX: 0, offsetY: 0 });
        switch (k) {
          case 'ls': x.set('charSpacing', v); break; case 'lh': x.set('lineHeight', v); break; case 'tbg': x.set('backgroundColor', v); break;
          case 'sw': x.set({ strokeWidth: v, stroke: x.stroke || (x.fontSize ? '#ffffff' : '#1B2330'), paintFirst: 'stroke' }); break;
          case 'stc': x.set('stroke', v); break;
          case 'rad': if (x.type === 'rect') x.set({ rx: v, ry: v }); else if (x.type === 'image') applyShape(x, x.phShape === 'circle' ? 'circle' : 'rect', v); else if (x.type === 'group' && x.ph) { var b = x.getObjects()[0]; if (b.type === 'rect') b.set({ rx: v, ry: v }); } x.rad = v; break;
          case 'shx': sh.offsetX = v; x.set('shadow', sh); break; case 'shy': sh.offsetY = v; x.set('shadow', sh); break; case 'shb': sh.blur = v; x.set('shadow', sh); break;
          case 'shc': sh.color = v; x.set('shadow', sh); break;
          case 'op': x.set('opacity', v); break; case 'ang': x.rotate(v); break;
        }
        x.dirty = true; x.initDimensions && x.initDimensions(); x.setCoords();
      });
      cv.requestRenderAll();
    }
    fx.addEventListener('input', function (e) { var t = e.target; if (!t.dataset.fx) return; var v = t.type === 'range' ? +t.value : t.value; if (t.nextElementSibling && t.nextElementSibling.tagName === 'OUTPUT') t.nextElementSibling.textContent = v; setFx(t.dataset.fx, v); });
    fx.addEventListener('change', function () { record(); });
    fx.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fxc]'); if (!b) return; var o = cv.getActiveObject(); if (!o) return;
      (o.type === 'activeSelection' ? o.getObjects() : [o]).forEach(function (x) { if (b.dataset.fxc === 'shadow') x.set('shadow', null); else if (b.dataset.fxc === 'stroke') x.set({ stroke: null, strokeWidth: 0 }); else x.set('backgroundColor', ''); x.dirty = true; });
      cv.requestRenderAll(); record(); renderFx();
    });

    // ---------- modals ----------
    function modal(title, body, foot, small) {
      var m = el('div', 'st-modal', '<div class="st-box' + (small ? ' st-sm' : '') + '"><div class="st-boxtop"><b>' + title + '</b><button class="st-x" aria-label="Close">×</button></div><div class="st-boxbody"></div><div class="st-boxfoot"></div></div>');
      m.querySelector('.st-boxbody').innerHTML = body; m.querySelector('.st-boxfoot').innerHTML = foot || '';
      document.body.appendChild(m);
      m.close = function () { m.remove(); }; m.querySelector('.st-x').onclick = function () { m.close(); m.onclose && m.onclose(); };
      return m;
    }
    S.modal = modal;
    function editText(o) {
      var m = modal('Edit text', '<textarea class="st-in" rows="6" style="font-family:' + esc(o.fontFamily) + ',sans-serif">' + esc(o.text) + '</textarea><p class="st-note">Type in any language. Tags like {{NAME}} fill from Details.</p>', '<button class="st-btn" data-c="x">Cancel</button><button class="st-btn st-main" data-c="ok">Apply</button>', true);
      var ta = m.querySelector('textarea'); setTimeout(function () { ta.focus(); }, 50);
      m.querySelector('[data-c=x]').onclick = m.close;
      m.querySelector('[data-c=ok]').onclick = function () { o.tpl = ta.value; o.set('text', fillTags(ta.value, vals)); o.initDimensions(); fontsFor([o]).then(function () { o.initDimensions(); cv.requestRenderAll(); }); m.close(); record(); };
    }

    // ---------- photo workflow: crop → remove BG → BG colour → signature clean ----------
    function photoFlow(target, pickNew) {
      var start = pickNew || !target.srcOrig ? pickFile('image/*').then(function (fs) { return fs[0] ? fileToURL(fs[0]) : null; }) : Promise.resolve(target.srcOrig);
      start.then(function (url) {
        if (!url) return;
        var isSign = target.ph === 'SIGN' || /sign/i.test(target.nm || '');
        runPhotoSteps(url, { sign: isSign, ratio: target.getScaledWidth() / target.getScaledHeight() }).then(function (res) {
          if (!res) return;
          fillPh(cv, target, res).then(function (im) { im.srcOrig = url; cv.setActiveObject(im); cv.requestRenderAll(); record(); showProps();
            if (target.ph && cfg.photoFields && cfg.photoFields.indexOf(target.ph) >= 0) { vals['@' + target.ph] = res; saveVals(); }
          });
        });
      }).catch(function () { toast('That file is not a picture.'); });
    }
    S.photoFlow = photoFlow;
    function runPhotoSteps(url, o) {
      o = o || {};
      return new Promise(function (resolve) {
        var steps = ['Crop', 'Remove BG', 'BG colour', o.sign ? 'Signature clean' : 'Finish'];
        var m = modal('Edit photo', '<div class="st-steps">' + steps.map(function (s, i) { return '<span data-s="' + i + '">' + (i + 1) + '. ' + s + '</span>'; }).join('') + '</div><div class="st-stepbody"></div>', '', false);
        var body = m.querySelector('.st-stepbody'), foot = m.querySelector('.st-boxfoot'), cropped = null, cut = null, bg = null, out = null, cropper = null;
        m.onclose = function () { if (cropper) cropper.destroy(); resolve(null); };
        function mark(i) { [].forEach.call(m.querySelectorAll('.st-steps span'), function (s, j) { s.className = j < i ? 'done' : j === i ? 'on' : ''; }); }
        function step1() {
          mark(0);
          body.innerHTML = '<div class="st-cropzone"><img alt=""></div><div class="st-row" style="margin-top:10px"><button class="st-chip" data-r="free" aria-pressed="true">Free</button><button class="st-chip" data-r="frame">Fit frame</button><button class="st-chip" data-r="1">1:1</button><button class="st-chip" data-r="3">3:1 signature</button><button class="st-chip" data-r="rot">Rotate ⟳</button><button class="st-chip" data-r="mv">Move image</button></div>';
          foot.innerHTML = '<button class="st-btn" data-c="x">Cancel</button><button class="st-btn st-main" data-c="ok">Crop done</button>';
          var img = body.querySelector('img'); img.src = url;
          img.onload = function () { cropper = new window.Cropper(img, { viewMode: 1, autoCropArea: 1, background: false, dragMode: 'crop', responsive: true }); if (o.sign) cropper.setAspectRatio(NaN); };
          body.querySelector('.st-row').onclick = function (e) {
            var b = e.target.closest('[data-r]'); if (!b || !cropper) return; var r = b.dataset.r;
            if (r === 'rot') { cropper.rotate(90); return; } if (r === 'mv') { cropper.setDragMode('move'); return; }
            [].forEach.call(body.querySelectorAll('[data-r]'), function (x) { if (x.dataset.r !== 'rot' && x.dataset.r !== 'mv') x.setAttribute('aria-pressed', String(x === b)); });
            cropper.setDragMode('crop'); cropper.setAspectRatio(r === 'free' ? NaN : r === 'frame' ? (o.ratio || NaN) : +r);
          };
          foot.querySelector('[data-c=x]').onclick = function () { m.close(); m.onclose(); };
          foot.querySelector('[data-c=ok]').onclick = function () { var c = cropper.getCroppedCanvas({ maxWidth: 4800, maxHeight: 4800, imageSmoothingQuality: 'high' }); cropper.destroy(); cropper = null; cropped = c; step2(); };
        }
        function prev(c) { body.innerHTML = '<div class="st-prev"></div>'; var p = body.querySelector('.st-prev'); var im = new Image(); im.src = c.toDataURL('image/png'); p.appendChild(im); }
        function step2() {
          mark(1); prev(cropped);
          foot.innerHTML = '<button class="st-btn" data-c="skip">Skip</button><button class="st-btn st-main" data-c="rm">' + I.ai + 'Remove background</button>';
          foot.querySelector('[data-c=skip]').onclick = function () { cut = null; step3(); };
          foot.querySelector('[data-c=rm]').onclick = function () {
            if (o.sign) { cut = signClean(cropped, { clean: true, dark: 0, con: 0 }); step3(); return; }
            busy(true, 'Removing the background…');
            matte(cropped).then(function (c) { busy(false); cut = c; step3(); }, function (er) { busy(false); toast(er.message || 'Background removal failed.'); });
          };
        }
        function compose() { var src = cut || cropped, c = canvasEl(src.width, src.height), x = c.getContext('2d'); if (bg) { x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height); } x.drawImage(src, 0, 0); return c; }
        function step3() {
          mark(2); prev(compose());
          var sw = ['#ffffff', '#e8f1fb', '#2563eb', '#1d4ed8', '#dc2626', '#f5f5f5', '#c7d2fe', '#fde68a', '#bbf7d0', '#000000'];
          var row = el('div', 'st-sw'); row.style.marginTop = '10px';
          row.innerHTML = sw.map(function (c) { return '<button style="background:' + c + '" data-c="' + c + '" aria-pressed="' + (bg === c) + '"></button>'; }).join('') + '<input type="color" value="#ffffff" title="Any colour">';
          body.appendChild(row); body.appendChild(el('p', 'st-note', cut ? 'The colour fills only behind the photo.' : 'Remove the background first for a clean colour change — or pick a colour to fill transparent parts.'));
          row.onclick = function (e) { var b = e.target.closest('[data-c]'); if (!b) return; bg = b.dataset.c; step3(); };
          row.querySelector('input').oninput = function (e) { bg = e.target.value; var p = body.querySelector('.st-prev'); p.innerHTML = ''; var im = new Image(); im.src = compose().toDataURL('image/png'); p.appendChild(im); };
          foot.innerHTML = '<button class="st-btn" data-c="clear">Clear colour</button><button class="st-btn st-main" data-c="next">Next</button>';
          foot.querySelector('[data-c=clear]').onclick = function () { bg = null; step3(); };
          foot.querySelector('[data-c=next]').onclick = step4;
        }
        function step4() {
          mark(3); var base = compose(), so = { clean: !!o.sign, dark: o.sign ? 30 : 0, con: o.sign ? 20 : 0, bold: false, rot: 0 };
          function draw() { out = (so.clean || so.dark || so.con || so.bold || so.rot) ? signClean(base, so) : base; var p = body.querySelector('.st-prev'); p.innerHTML = ''; var im = new Image(); im.src = out.toDataURL('image/png'); p.appendChild(im); }
          body.innerHTML = '<div class="st-prev"></div><div style="margin-top:10px"><label class="st-rng">Clean (signature)<input type="checkbox" data-s="clean"' + (so.clean ? ' checked' : '') + '><span></span></label>' +
            rng('dark', 'Darken ink', 0, 100, 1, so.dark) + rng('con', 'Contrast', 0, 100, 1, so.con) + rng('rot', 'Rotate °', -45, 45, 0.5, 0) +
            '<label class="st-rng">Make text bolder<input type="checkbox" data-s="bold"><span></span></label></div>';
          body.addEventListener('input', function (e) { var t = e.target; var k = t.dataset.s || t.dataset.fx; if (!k) return; so[k] = t.type === 'checkbox' ? t.checked : +t.value; if (t.nextElementSibling && t.nextElementSibling.tagName === 'OUTPUT') t.nextElementSibling.textContent = t.value; draw(); });
          draw();
          foot.innerHTML = '<button class="st-btn" data-c="back">Back</button><button class="st-btn st-main" data-c="ok">Apply final</button>';
          foot.querySelector('[data-c=back]').onclick = step3;
          foot.querySelector('[data-c=ok]').onclick = function () { m.close(); resolve(out.toDataURL('image/png')); };
        }
        step1();
      });
    }
    S.runPhotoSteps = runPhotoSteps;
    // signature cleaner: white paper → transparent, darker ink, more contrast, bolder strokes, small rotation
    function signClean(src, o) {
      var rad = (o.rot || 0) * Math.PI / 180, W = src.width, H = src.height;
      var rw = Math.abs(W * Math.cos(rad)) + Math.abs(H * Math.sin(rad)), rh = Math.abs(W * Math.sin(rad)) + Math.abs(H * Math.cos(rad));
      var c = canvasEl(rw, rh), x = c.getContext('2d'); x.translate(rw / 2, rh / 2); x.rotate(rad); x.drawImage(src, -W / 2, -H / 2);
      var d = x.getImageData(0, 0, c.width, c.height), p = d.data, con = 1 + (o.con || 0) / 50, dk = (o.dark || 0) / 100;
      for (var i = 0; i < p.length; i += 4) {
        var r = p[i], g = p[i + 1], b = p[i + 2], a = p[i + 3];
        r = (r - 128) * con + 128; g = (g - 128) * con + 128; b = (b - 128) * con + 128;
        var l = 0.3 * r + 0.59 * g + 0.11 * b;
        if (o.clean) { var al = Math.max(0, Math.min(1, (225 - l) / 90)); a = Math.round(a * al); }
        r *= 1 - dk; g *= 1 - dk; b *= 1 - dk;
        p[i] = Math.max(0, Math.min(255, r)); p[i + 1] = Math.max(0, Math.min(255, g)); p[i + 2] = Math.max(0, Math.min(255, b)); p[i + 3] = a;
      }
      x.setTransform(1, 0, 0, 1, 0, 0); x.putImageData(d, 0, 0);
      if (o.bold) { var c2 = canvasEl(c.width, c.height), y = c2.getContext('2d'); [[-1, 0], [1, 0], [0, -1], [0, 1], [0, 0]].forEach(function (s) { y.drawImage(c, s[0], s[1]); }); return c2; }
      return c;
    }
    S.signClean = signClean;
    // background removal: same in-browser AI model as the passport tool
    var WORKER_SRC = "let engine=null;async function load(){if(!engine)engine=(async()=>{const lib=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2/dist/transformers.min.js');lib.env.allowLocalModels=false;lib.env.backends.onnx.wasm.numThreads=1;const options={revision:'fa2fa546052fba4c08921230a26cc69a333fca12'};const [model,processor]=await Promise.all([lib.AutoModel.from_pretrained('Xenova/modnet',{...options,dtype:'fp32',device:'wasm'}),lib.AutoProcessor.from_pretrained('Xenova/modnet',options)]);return {lib,model,processor};})().catch(e=>{engine=null;throw e;});return engine;}self.onmessage=async({data})=>{try{self.postMessage({stage:engine?'processing':'loading'});const {lib,model,processor}=await load();const input=new lib.RawImage(new Uint8ClampedArray(data.pixels),data.width,data.height,4);const {pixel_values}=await processor(input);let output;try{({output}=await model({input:pixel_values}));const mask=lib.RawImage.fromTensor(output[0].mul(255).to('uint8'));const bytes=new Uint8Array(mask.data);self.postMessage({mask:bytes.buffer,width:mask.width,height:mask.height},[bytes.buffer]);}finally{pixel_values&&pixel_values.dispose&&pixel_values.dispose();output&&output.dispose&&output.dispose();}}catch(e){self.postMessage({error:'Background removal failed. Check the internet connection and try again.'});}};";
    var worker = null;
    function matte(src) {
      return new Promise(function (res, rej) {
        var k = Math.min(1, 1024 / Math.max(src.width, src.height)), c = canvasEl(src.width * k, src.height * k), x = c.getContext('2d'); x.drawImage(src, 0, 0, c.width, c.height);
        var data = x.getImageData(0, 0, c.width, c.height);
        var done = function (mc) { var o = canvasEl(src.width, src.height), ox = o.getContext('2d'); ox.drawImage(mc, 0, 0, o.width, o.height); ox.globalCompositeOperation = 'source-in'; ox.drawImage(src, 0, 0); res(o); };
        if (window.__stMatting) { window.__stMatting(data).then(done, rej); return; }
        try { if (!worker) worker = new Worker(URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' })), { type: 'module' }); } catch (e) { rej(new Error('Background removal is not supported in this browser.')); return; }
        worker.onmessage = function (e) {
          var m = e.data; if (m.stage) { busy(true, m.stage === 'loading' ? 'Loading the AI model (first time only)…' : 'Removing the background…'); return; }
          if (m.error) { rej(new Error(m.error)); return; }
          var u8 = new Uint8Array(m.mask), mc = canvasEl(m.width, m.height), mx = mc.getContext('2d'), id = mx.createImageData(m.width, m.height);
          for (var i = 0; i < u8.length; i++) { id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = 255; id.data[i * 4 + 3] = u8[i]; }
          mx.putImageData(id, 0, 0); done(mc);
        };
        worker.onerror = function () { rej(new Error('Background removal could not start.')); };
        worker.postMessage({ pixels: data.data.buffer, width: data.width, height: data.height }, [data.data.buffer]);
      });
    }

    // ---------- side panels ----------
    var curTab = null, tplCat = 'All', tplPage = 0;
    function selectTab(t) {
      if (mobile() && curTab === t && !panel.hidden) { panel.hidden = true; [].forEach.call(tabs.children, function (b) { b.setAttribute('aria-selected', 'false'); }); return; }
      curTab = t; panel.hidden = false;
      [].forEach.call(tabs.children, function (b) { b.setAttribute('aria-selected', String(b.dataset.t === t)); });
      renderTab();
    }
    S.selectTab = selectTab;
    tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (b) selectTab(b.dataset.t); });
    stage.addEventListener('pointerdown', function () { if (mobile() && !panel.hidden) { panel.hidden = true; [].forEach.call(tabs.children, function (b) { b.setAttribute('aria-selected', 'false'); }); } });
    var thumbCache = {};
    function thumbOf(t, sz) {
      var key = t.id + '@' + sz.k; if (thumbCache[key]) return thumbCache[key];
      var tv = withSample(t); thumbCache[key] = buildPages(designOf(t, sz), tv).then(function (pages) { return renderJSON(pages[0], sz.w, sz.h, 260 / Math.max(sz.w, sz.h), tv); }).then(function (c) { return c.toDataURL('image/jpeg', 0.8); });
      return thumbCache[key];
    }
    function renderTab() {
      var t = curTab; panel.innerHTML = ''; panel.onclick = panel.oninput = panel.onchange = null; panel.scrollTop = 0;
      if (t === 'tpl') return tabTemplates();
      if (t === 'data') return tabData();
      if (t === 'db' && ST.idDatabase) return ST.idDatabase(S, panel);
      if (t === 'els') return tabElements();
      if (t === 'ai') return tabAI();
      if (t === 'page') return tabPage();
      if (t === 'layers') return tabLayers();
    }
    S.renderTab = renderTab;
    function tabTemplates() {
      var cats = ['All'].concat(cfg.cats || []), sz = size;
      panel.innerHTML = '<div class="st-drafts"></div><h3>Templates</h3><div class="st-chips">' + cats.map(function (c) { return '<button class="st-chip" data-c="' + esc(c) + '" aria-pressed="' + (c === tplCat) + '">' + esc(c) + '</button>'; }).join('') + '</div>' +
        '<label class="st-field">Size<select data-k="size">' + sizes.map(function (s) { return '<option value="' + s.k + '"' + (s.k === sz.k ? ' selected' : '') + '>' + esc(s.label) + '</option>'; }).join('') + '</select></label><div class="st-grid"></div><div class="st-pager"></div>';
      listDrafts().then(function (ds) {
        var box = panel.querySelector('.st-drafts'); if (!box || !ds.length) return;
        box.innerHTML = '<h3>My drafts</h3>' + ds.slice(0, 8).map(function (d) { return '<div class="st-draft" data-d="' + d.id + '"><img src="' + (d.thumb || '') + '" alt=""><em>' + esc(d.name) + '<br><small>' + new Date(d.at).toLocaleString() + '</small></em><button class="st-btn" data-o="open">Open</button><button class="st-btn" data-o="del" title="Delete">' + I.del + '</button></div>'; }).join('');
        box.onclick = function (e) {
          var b = e.target.closest('[data-o]'); if (!b) return; var id = b.closest('[data-d]').dataset.d, d = ds.find(function (x) { return x.id === id; });
          if (b.dataset.o === 'open') { busy(true, 'Opening…'); openSnapshot(d).then(function () { busy(false); toast('Draft opened.'); }); }
          else if (confirm('Delete this draft?')) dbDo('drafts', 'readwrite', function (st) { return st.delete(id); }).then(renderTab);
        };
      });
      var list = TPL.filter(function (x) { return (tplCat === 'All' || x.cat === tplCat) && (!x.sizes || x.sizes.indexOf(sz.k) >= 0); });
      var per = 20, pages = Math.max(1, Math.ceil(list.length / per)); tplPage = Math.min(tplPage, pages - 1);
      var grid = panel.querySelector('.st-grid');
      list.slice(tplPage * per, tplPage * per + per).forEach(function (x) {
        var b = el('button', 'st-thumb'); b.type = 'button'; b.innerHTML = '<i></i><div class="st-tim"></div><span>' + esc(x.name) + '</span>'; grid.appendChild(b);
        b.onclick = function () { if (dirty && !confirm('Open this template? Your current design stays saved as "last work" only until you change it.')) return; S.useTemplate(x.id, sz.k).then(function () { dirty = false; if (mobile()) { panel.hidden = true; } }); };
        thumbOf(x, sz).then(function (u) { var im = new Image(); im.alt = ''; im.src = u; b.querySelector('.st-tim').appendChild(im); var sk = b.querySelector('i'); sk && sk.remove(); });
      });
      if (!list.length) grid.innerHTML = '<p class="st-note">No template for this size yet — pick another size, or start from a blank page in “Page”.</p>';
      panel.querySelector('.st-pager').innerHTML = pages > 1 ? '<button class="st-btn" data-pg="-1">‹ Previous</button><span>' + (tplPage + 1) + ' / ' + pages + '</span><button class="st-btn" data-pg="1">Next ›</button>' : '<span>' + list.length + ' templates</span>';
      panel.onclick = function (e) {
        var c = e.target.closest('[data-c]'); if (c && c.classList.contains('st-chip')) { tplCat = c.dataset.c; tplPage = 0; renderTab(); return; }
        var pg = e.target.closest('[data-pg]'); if (pg) { tplPage += +pg.dataset.pg; renderTab(); }
      };
      panel.querySelector('[data-k=size]').onchange = function (e) { size = sizeById(e.target.value); tplPage = 0; renderTab(); };
    }
    function tabData() {
      var f = cfg.fields || [];
      var h = '<h3>' + esc(cfg.dataTitle || 'Your details') + '</h3><p class="st-note">' + esc(cfg.dataNote || 'Type once — every template fills in automatically. Saved only on this device.') + '</p>';
      var grp = null;
      f.forEach(function (x) {
        if (x.group && x.group !== grp) { grp = x.group; h += '<h4>' + esc(grp) + '</h4>'; }
        if (x.type === 'photo') { h += '<div class="st-field">' + esc(x.label) + '<div class="st-row"><button class="st-btn" data-ph="' + x.k + '">' + (x.k === 'SIGN' ? I.sign : I.photo) + 'Choose ' + esc(x.label.toLowerCase()) + '</button>' + (vals['@' + x.k] ? '<img src="' + vals['@' + x.k] + '" alt="" style="height:44px;border-radius:6px;background:#f3f5f8"><button class="st-btn" data-phx="' + x.k + '">' + I.del + '</button>' : '') + '</div></div>'; return; }
        var v = esc(vals[x.k] || '');
        h += '<label class="st-field">' + esc(x.label) + (x.type === 'textarea' ? '<textarea data-k="' + x.k + '" rows="' + (x.rows || 3) + '" placeholder="' + esc(x.ph || '') + '">' + v + '</textarea>' : x.type === 'select' ? '<select data-k="' + x.k + '">' + x.opts.map(function (o) { return '<option' + (o === vals[x.k] ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>' : '<input data-k="' + x.k + '" type="' + (x.type || 'text') + '" value="' + v + '" placeholder="' + esc(x.ph || '') + '">') + '</label>';
      });
      h += '<div class="st-row" style="margin-top:8px"><button class="st-btn" data-x="clear">' + I.del + 'Clear all</button><button class="st-btn" data-x="demo">Fill sample details</button></div>';
      panel.innerHTML = h;
      var t = null;
      panel.oninput = function (e) { var k = e.target.dataset.k; if (!k) return; vals[k] = e.target.value; clearTimeout(t); t = setTimeout(function () { saveVals(); applyVals(); }, 250); };
      panel.onclick = function (e) {
        var b = e.target.closest('[data-ph]');
        if (b) { var k = b.dataset.ph; pickFile('image/*').then(function (fs) { if (!fs[0]) return; fileToURL(fs[0]).then(function (u) { return runPhotoSteps(u, { sign: k === 'SIGN', ratio: k === 'SIGN' ? 3 : 0.8 }); }).then(function (r) { if (!r) return; vals['@' + k] = r; saveVals(); applyVals().then(renderTab); }); }); return; }
        var bx = e.target.closest('[data-phx]'); if (bx) { delete vals['@' + bx.dataset.phx]; saveVals(); toast('Removed. Re-open the template to show the empty frame.'); renderTab(); return; }
        var x = e.target.closest('[data-x]'); if (!x) return;
        if (x.dataset.x === 'clear') { if (!confirm('Clear all details?')) return; f.forEach(function (q) { vals[q.k] = ''; }); }
        else f.forEach(function (q) { if (q.def != null) vals[q.k] = q.def; });
        saveVals(); applyVals(); renderTab();
      };
    }
    function addObj(o, select) { cv.add(o); if (select !== false) { cv.setActiveObject(o); } cv.requestRenderAll(); if (mobile()) panel.hidden = true; }
    S.addObj = addObj;
    function tabElements() {
      var fm = cfg.fields || [];
      panel.innerHTML = '<h3>Add to the page</h3><div class="st-els">' +
        [['head', 'Heading', I.head], ['text', 'Text', I.text], ['photo', 'Photo', I.photo], ['sign', 'Signature', I.sign], ['logo', 'Logo / image', I.jpg], ['qr', 'QR code', I.qr], ['bar', 'Barcode', I.bar], ['rect', 'Box', I.rect], ['round', 'Round box', I.rect], ['circle', 'Circle', I.circle], ['line', 'Line', I.line], ['tri', 'Triangle', I.tri], ['star', 'Star', I.star], ['badge', 'Badge', I.badge]]
          .map(function (b) { return '<button class="st-el" data-e="' + b[0] + '">' + b[2] + b[1] + '</button>'; }).join('') + '</div>' +
        (fm.length ? '<h4>Data fields (fill from Details)</h4><div class="st-chips">' + fm.filter(function (x) { return x.type !== 'photo'; }).map(function (x) { return '<button class="st-chip" data-tag="' + x.k + '">' + esc(x.label) + '</button>'; }).join('') + '<button class="st-chip" data-tag="+">+ Custom field</button></div>' : '') +
        '<p class="st-note">Tip: double-tap any text on the page to type. Pinch with two fingers to resize the selected item.</p>';
      panel.onclick = function (e) {
        var tg = e.target.closest('[data-tag]');
        if (tg) {
          var k = tg.dataset.tag;
          if (k === '+') { var nm = prompt('Name of the new field (letters only), e.g. BLOOD_GROUP'); if (!nm) return; k = nm.toUpperCase().replace(/[^A-Z0-9]+/g, '_'); if (!fm.some(function (x) { return x.k === k; })) { fm.push({ k: k, label: nm, def: '' }); vals[k] = ''; } }
          var tb = mkObj({ t: 'text', x: doc.w * 0.1, y: doc.h * 0.4, w: doc.w * 0.6, text: '{{' + k + '}}', size: Math.round(doc.w / 28), font: 'Poppins', color: '#1B2330' }, doc.w, doc.h);
          tb.set('text', fillTags(tb.tpl, vals) || k); addObj(tb); return;
        }
        var b = e.target.closest('[data-e]'); if (!b) return; var k2 = b.dataset.e, W = doc.w, H = doc.h, s = Math.min(W, H);
        if (k2 === 'head' || k2 === 'text') { var t = mkObj({ t: 'text', x: W * 0.1, y: H * 0.42, w: W * 0.8, text: k2 === 'head' ? 'Your heading' : 'Your text here', size: Math.round(s / (k2 === 'head' ? 11 : 24)), bold: k2 === 'head', font: k2 === 'head' ? 'Montserrat' : 'Poppins', align: k2 === 'head' ? 'center' : 'left', color: '#1B2330' }, W, H); fontsFor([t]).then(function () { addObj(t); }); return; }
        if (k2 === 'photo' || k2 === 'sign' || k2 === 'logo') { var ph = phBox({ x: W * 0.35, y: H * 0.35, w: k2 === 'sign' ? s * 0.4 : s * 0.28, h: k2 === 'sign' ? s * 0.13 : s * 0.34, ph: k2 === 'sign' ? 'SIGN' : k2 === 'logo' ? 'LOGO' : 'PHOTO', nm: k2 }); addObj(ph); photoFlow(ph, true); return; }
        if (k2 === 'qr') { asyncObj({ _async: 'qr', o: { x: W * 0.4, y: H * 0.4, s: s * 0.22, data: prompt('QR code content (text, link, phone…)', 'https://') || 'S Printer' } }).then(addObj); return; }
        if (k2 === 'bar') { asyncObj({ _async: 'bc', o: { x: W * 0.3, y: H * 0.45, w: s * 0.4, h: s * 0.14, data: prompt('Barcode number', '123456789012') || '123456789012' } }).then(addObj); return; }
        var o;
        if (k2 === 'rect') o = new F.Rect({ left: W * 0.3, top: H * 0.3, width: s * 0.3, height: s * 0.2, fill: '#0098D8' });
        else if (k2 === 'round') { o = new F.Rect({ left: W * 0.3, top: H * 0.3, width: s * 0.3, height: s * 0.2, rx: s * 0.03, ry: s * 0.03, fill: '#D6247A' }); o.rad = s * 0.03; }
        else if (k2 === 'circle') o = new F.Circle({ left: W * 0.4, top: H * 0.4, radius: s * 0.1, fill: '#F5C400' });
        else if (k2 === 'line') o = new F.Line([W * 0.2, H * 0.5, W * 0.8, H * 0.5], { stroke: '#1B2330', strokeWidth: Math.max(2, s / 200) });
        else if (k2 === 'tri') o = new F.Triangle({ left: W * 0.4, top: H * 0.4, width: s * 0.2, height: s * 0.18, fill: '#16a34a' });
        else if (k2 === 'star' || k2 === 'badge') { var n = k2 === 'star' ? 5 : 12, R = s * 0.1, r = k2 === 'star' ? R * 0.45 : R * 0.82, pts = []; for (var i = 0; i < n * 2; i++) { var a = Math.PI / n * i - Math.PI / 2, rr = i % 2 ? r : R; pts.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr }); } o = new F.Polygon(pts, { left: W * 0.4, top: H * 0.4, fill: k2 === 'star' ? '#F5C400' : '#dc2626' }); }
        addObj(o);
      };
    }
    function tabPage() {
      var bgv = cv.backgroundColor;
      panel.innerHTML = '<h3>Page</h3><label class="st-field">Size<select data-k="psize">' + sizes.map(function (s) { return '<option value="' + s.k + '"' + (s.w === doc.w && s.h === doc.h ? ' selected' : '') + '>' + esc(s.label) + '</option>'; }).join('') + '<option value="custom">Custom size…</option></select></label>' +
        '<div class="st-row" data-custom hidden><label class="st-field">Width<input type="number" data-k="cw" value="' + Math.round(doc.mm[0] * 10) / 10 + '"></label><label class="st-field">Height<input type="number" data-k="ch" value="' + Math.round(doc.mm[1] * 10) / 10 + '"></label><label class="st-field">Unit<select data-k="cu"><option>mm</option><option>cm</option><option>in</option><option>px</option></select></label><button class="st-btn" data-k="capply">Apply</button></div>' +
        '<label class="st-check" style="display:flex;gap:8px;align-items:center;font-size:13px;margin:4px 0 10px"><input type="checkbox" data-k="keep" checked> Keep my design and resize it to fit</label>' +
        '<button class="st-btn" data-k="orient">' + I.swap + 'Turn page (portrait / landscape)</button>' +
        '<h4>Background</h4><div class="st-sw" data-k="bgsw">' + ['#ffffff', '#fffaf0', '#fdf2f8', '#eff6ff', '#f0fdf4', '#fefce8', '#1B2330', '#0f172a', '#7f1d1d', '#14532d', '#1e3a8a', '#000000'].map(function (c) { return '<button style="background:' + c + '" data-bg="' + c + '" aria-pressed="' + (bgv === c) + '"></button>'; }).join('') + '<input type="color" data-k="bgc" value="' + colorOf(typeof bgv === 'string' ? bgv : '#ffffff') + '"></div>' +
        '<h4>Gradient</h4><div class="st-row"><input type="color" data-k="g1" value="#0098D8"><input type="color" data-k="g2" value="#D6247A"><select data-k="ga" class="st-in" style="width:auto"><option value="90">Top → bottom</option><option value="0">Left → right</option><option value="45">Diagonal</option></select><button class="st-btn" data-k="gapply">Apply</button></div>' +
        '<h4>Background picture</h4><div class="st-row"><button class="st-btn" data-k="bgimg">' + I.jpg + 'Choose picture</button><button class="st-btn" data-k="bgclr">Remove</button></div>' +
        '<h4>Print paper &amp; quality</h4><div class="st-paperslot"></div>' +
        '<h4>Start over</h4><button class="st-btn" data-k="blank">' + I.page + 'Blank page</button>' +
        '<p class="st-note">Printed size: ' + Math.round(doc.mm[0] * 10) / 10 + ' × ' + Math.round(doc.mm[1] * 10) / 10 + ' mm (' + doc.w + ' × ' + doc.h + ' px).</p>';
      if (window.SPPaper) SPPaper.mount(panel.querySelector('.st-paperslot'));
      function setBg(v) { cv.setBackgroundColor(v, function () { cv.requestRenderAll(); record(); }); }
      function resizeTo(w, h, mm) {
        var keep = panel.querySelector('[data-k=keep]').checked, k = Math.min(w / doc.w, h / doc.h), dx = (w - doc.w * k) / 2, dy = (h - doc.h * k) / 2;
        saveCur();
        var jobs = doc.pages.map(function (j) {
          return new Promise(function (r) {
            var sc = new F.StaticCanvas(null, { width: doc.w, height: doc.h }); sc.loadFromJSON(j, function () {
              if (keep) sc.getObjects().forEach(function (o) { o.set({ left: o.left * k + dx, top: o.top * k + dy, scaleX: o.scaleX * k, scaleY: o.scaleY * k }); o.setCoords(); });
              else sc.clear();
              var out = sc.toJSON(PROPS); sc.dispose(); r(out);
            });
          });
        });
        Promise.all(jobs).then(function (pages) { doc.pages = pages; doc.w = Math.round(w); doc.h = Math.round(h); doc.mm = mm; muted++; cv.loadFromJSON(pages[cur], function () { lockAll(); fit(); muted--; cv.renderAll(); renderPagesBar(); hist = [snap()]; syncUndo(); autosave(); renderTab(); }); });
      }
      S.resizeTo = resizeTo;
      panel.onchange = function (e) {
        var k = e.target.dataset.k;
        if (k === 'psize') { if (e.target.value === 'custom') { panel.querySelector('[data-custom]').hidden = false; return; } var s = sizeById(e.target.value); size = s; resizeTo(s.w, s.h, s.mm || [s.w * 25.4 / 96, s.h * 25.4 / 96]); }
        if (k === 'bgc') setBg(e.target.value);
      };
      panel.onclick = function (e) {
        var b = e.target.closest('[data-bg],[data-k]'); if (!b) return;
        if (b.dataset.bg) { setBg(b.dataset.bg); return; }
        var k = b.dataset.k;
        if (k === 'capply') { var u = { mm: 1, cm: 10, in: 25.4, px: 25.4 / 96 }[panel.querySelector('[data-k=cu]').value], w = +panel.querySelector('[data-k=cw]').value * u, h = +panel.querySelector('[data-k=ch]').value * u; if (w < 10 || h < 10) { toast('Size is too small.'); return; } var pxw = w / 25.4 * 96, pxh = h / 25.4 * 96, f = Math.min(1, 4000 / Math.max(pxw, pxh)); resizeTo(pxw * f, pxh * f, [w, h]); }
        if (k === 'orient') resizeTo(doc.h, doc.w, [doc.mm[1], doc.mm[0]]);
        if (k === 'gapply') setBg(grad({ angle: +panel.querySelector('[data-k=ga]').value, stops: [panel.querySelector('[data-k=g1]').value, panel.querySelector('[data-k=g2]').value] }, doc.w, doc.h));
        if (k === 'bgimg') pickFile('image/*').then(function (fs) { if (!fs[0]) return; fileToURL(fs[0]).then(function (u) { imgObj(u, { x: 0, y: 0, w: doc.w, h: doc.h }).then(function (im) { im.nm = 'Background picture'; cv.add(im); im.sendToBack(); cv.requestRenderAll(); }); }); });
        if (k === 'bgclr') { cv.getObjects().filter(function (o) { return o.nm === 'Background picture'; }).forEach(function (o) { cv.remove(o); }); setBg('#ffffff'); }
        if (k === 'blank' && confirm('Start with a blank page? (Undo can bring it back.)')) { cv.clear(); setBg('#ffffff'); }
      };
    }
    function tabLayers() {
      var objs = cv.getObjects().slice().reverse(), a = cv.getActiveObject();
      var name = function (o) { return o.nm || (o.text ? o.text.slice(0, 30) : o.ph ? o.ph.toLowerCase() : o.type); };
      panel.innerHTML = '<h3>Layers</h3><p class="st-note">Top of the list is in front. Tap to select.</p>' + objs.map(function (o, i) { return '<div class="st-layer' + (o === a ? ' sel' : '') + '" data-i="' + (objs.length - 1 - i) + '"><em>' + esc(name(o)) + '</em><button data-l="vis" title="Show / hide">' + (o.visible === false ? '◌' : '●') + '</button><button data-l="lock" title="Lock">' + (o.stLock ? '🔒' : '🔓') + '</button><button data-l="up">↑</button><button data-l="down">↓</button></div>'; }).join('');
      panel.onclick = function (e) {
        var row = e.target.closest('[data-i]'); if (!row) return; var o = cv.getObjects()[+row.dataset.i], b = e.target.closest('[data-l]');
        if (!b) { if (o.visible !== false) { cv.setActiveObject(o); cv.requestRenderAll(); } renderTab(); return; }
        var l = b.dataset.l;
        if (l === 'vis') o.visible = o.visible === false; if (l === 'up') o.bringForward(); if (l === 'down') o.sendBackwards();
        if (l === 'lock') { o.stLock = !o.stLock; o.set({ lockMovementX: o.stLock, lockMovementY: o.stLock, lockScalingX: o.stLock, lockScalingY: o.stLock, lockRotation: o.stLock, hasControls: !o.stLock }); }
        cv.requestRenderAll(); record(); renderTab();
      };
    }
    cv.on('selection:created', function () { if (curTab === 'layers') renderTab(); });

    // ---------- AI designer: prompt → any AI chat → paste the design back ----------
    function tabAI() {
      var cats = cfg.cats || [];
      panel.innerHTML = '<h3>' + I.ai + ' AI Smart Designer</h3><p class="st-note">Free: make a prompt here, paste it into ChatGPT, Gemini or any AI chat, then paste its reply back. Nothing is sent from this page.</p>' +
        '<label class="st-field">Design mode<select data-k="mode"><option value="fresh">Create a fresh design</option><option value="edit">Edit / add data to my current design</option></select></label>' +
        '<label class="st-field">Category<select data-k="cat">' + cats.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '<option>Custom</option></select></label>' +
        '<label class="st-field">Size<select data-k="size">' + sizes.map(function (s) { return '<option value="' + s.k + '"' + (s.w === doc.w && s.h === doc.h ? ' selected' : '') + '>' + esc(s.label) + '</option>'; }).join('') + '</select></label>' +
        '<label class="st-field">Style<select data-k="style"><option>Professional & Corporate</option><option>Modern & Creative</option><option>Bold & Eye-Catching</option><option>Minimalist & Clean</option><option>Traditional & Festive</option></select></label>' +
        '<label class="st-field">Language of the design<select data-k="lang"><option>English</option><option>Hindi</option><option>Hinglish</option><option>Bengali</option><option>Marathi</option><option>Gujarati</option><option>Punjabi</option><option>Tamil</option><option>Telugu</option><option>Urdu</option></select></label>' +
        '<label class="st-field">What do you want?<textarea data-k="req" rows="4" placeholder="' + esc(cfg.aiHint || 'Describe the design: colours, text, what to show…') + '"></textarea></label>' +
        '<button class="st-btn st-main st-wide" data-k="gen">' + I.ai + 'Generate prompt</button>' +
        '<div data-k="out" hidden><label class="st-field" style="margin-top:10px">Prompt<textarea class="st-code" data-k="prompt" rows="6" readonly></textarea></label><div class="st-row"><button class="st-btn" data-k="copy">' + I.dup + 'Copy prompt</button><a class="st-btn" href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT</a><a class="st-btn" href="https://gemini.google.com/app" target="_blank" rel="noopener">Gemini</a><a class="st-btn" href="https://aistudio.google.com/" target="_blank" rel="noopener">AI Studio</a></div></div>' +
        '<h4>Paste the AI reply</h4><textarea class="st-in st-code" data-k="reply" rows="6" placeholder="Paste the whole reply here (the JSON code)"></textarea>' +
        '<div class="st-row" style="margin-top:8px"><button class="st-btn" data-k="paste">Paste</button><button class="st-btn" data-k="clr">Clear</button><button class="st-btn st-main" data-k="apply">Auto clean + apply</button></div>' +
        '<p class="st-note">AI can make mistakes — move or fix anything by hand afterwards.</p>';
      panel.onclick = function (e) {
        var b = e.target.closest('[data-k]'); if (!b || b.tagName === 'SELECT' || b.tagName === 'TEXTAREA') return; var k = b.dataset.k, q = function (x) { return panel.querySelector('[data-k=' + x + ']'); };
        if (k === 'gen') { q('prompt').value = makePrompt(q('mode').value, q('cat').value, sizeById(q('size').value), q('style').value, q('lang').value, q('req').value); q('out').hidden = false; }
        if (k === 'copy') { var ta = q('prompt'); ta.select(); (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).then(function () { toast('Prompt copied.'); }, function () { document.execCommand('copy'); toast('Prompt copied.'); }); }
        if (k === 'paste') { if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(function (t) { q('reply').value = t; }, function () { toast('Long-press the box and choose Paste.'); }); }
        if (k === 'clr') q('reply').value = '';
        if (k === 'apply') applyAI(q('reply').value);
      };
    }
    function makePrompt(mode, cat, sz, style, lang, req) {
      saveCur();
      var fieldsTxt = (cfg.fields || []).filter(function (f) { return f.type !== 'photo'; }).map(function (f) { return '{{' + f.k + '}} = ' + f.label; }).join(', ');
      var schema = 'Reply with ONLY one JSON object (no explanation) in this exact format:\n' +
        '{"w":' + sz.w + ',"h":' + sz.h + ',"pages":[{"bg":"#ffffff or {\\"angle\\":90,\\"stops\\":[\\"#hex\\",\\"#hex\\"]}","objects":[ ... ]}]}\n' +
        'Coordinates are pixels from the top-left of a ' + sz.w + '×' + sz.h + ' page. Allowed objects:\n' +
        '{"t":"rect","x":0,"y":0,"w":100,"h":50,"fill":"#hex or gradient","r":corner_radius,"stroke":"#hex","sw":border_width,"op":opacity}\n' +
        '{"t":"circle","x":0,"y":0,"rr":radius,"fill":"#hex"}\n' +
        '{"t":"line","x1":0,"y1":0,"x2":100,"y2":0,"stroke":"#hex","sw":2,"dash":[6,4]}\n' +
        '{"t":"poly","pts":[[x,y],[x,y],[x,y]],"fill":"#hex"}\n' +
        '{"t":"text","x":0,"y":0,"w":box_width,"text":"…","size":font_px,"font":"Google font name","color":"#hex","bold":true,"italic":false,"align":"left|center|right|justify","lh":1.2,"ls":0,"stroke":"#hex","sw":0,"bg":"#hex"}\n' +
        '{"t":"photo","x":0,"y":0,"w":120,"h":150,"ph":"PHOTO|SIGN|LOGO","shape":"rect|circle","r":radius}\n' +
        '{"t":"qr","x":0,"y":0,"s":size,"data":"text or {{TAG}}"}  {"t":"barcode","x":0,"y":0,"w":200,"h":70,"data":"123456"}\n' +
        'Any object may have "angle" (degrees) and "shadow":{"x":0,"y":6,"b":12,"c":"rgba(0,0,0,.3)"}.\n' +
        (fieldsTxt ? 'Use these tags inside text so the user\'s details fill in automatically: ' + fieldsTxt + '.\n' : '') +
        'Fonts you may use: Poppins, Montserrat, Oswald, Anton, Bebas Neue, Playfair Display, Cinzel, Great Vibes, Dancing Script, Roboto; Hindi: Noto Sans Devanagari, Mukta, Hind, Rozha One, Yatra One, Kalam; Bengali: Hind Siliguri, Noto Sans Bengali, Galada.\n' +
        'Keep every object fully inside the page, keep 4% margins, make text large enough to print, and never let text overlap.';
      var base = mode === 'edit' && doc.pages.length ? '\nHere is my current design as fabric.js JSON — keep its layout and colours, change only what I ask:\n' + JSON.stringify(simplify(doc.pages[cur])).slice(0, 12000) : '';
      return 'You are an expert graphic designer for Indian print shops. Design a ' + style + ' ' + (cat || cfg.title) + ' (' + cfg.title + ') in ' + lang + ', size ' + sz.label + '.\n' +
        'Requirement: ' + (req || 'A beautiful, print-ready design with all the usual sections.') + '\n' + schema + base;
    }
    function simplify(j) {
      return { bg: typeof j.background === 'string' ? j.background : '#ffffff', objects: (j.objects || []).map(function (o) {
        var b = { t: o.type === 'textbox' ? 'text' : o.type, x: Math.round(o.left), y: Math.round(o.top) };
        if (o.text != null) { b.text = o.tpl || o.text; b.size = Math.round(o.fontSize * (o.scaleX || 1)); b.font = o.fontFamily; b.color = o.fill; b.w = Math.round(o.width * (o.scaleX || 1)); b.align = o.textAlign; if (o.fontWeight >= 600) b.bold = true; }
        else { b.w = Math.round((o.width || 0) * (o.scaleX || 1)); b.h = Math.round((o.height || 0) * (o.scaleY || 1)); if (typeof o.fill === 'string') b.fill = o.fill; if (o.ph) { b.t = 'photo'; b.ph = o.ph; } }
        return b;
      }) };
    }
    function applyAI(txt) {
      var s = String(txt || '').trim(); if (!s) { toast('Paste the AI reply first.'); return; }
      s = s.replace(/^[\s\S]*?```(?:json|javascript|js)?\s*/i, function (m) { return /```/.test(m) ? '' : m; }).replace(/```[\s\S]*$/, '');
      var a = s.indexOf('{'), z = s.lastIndexOf('}'); if (a < 0 || z < a) { toast('No design code found in the reply.'); return; }
      s = s.slice(a, z + 1).replace(/,\s*([}\]])/g, '$1').replace(/[“”]/g, '"');
      var d; try { d = JSON.parse(s); } catch (e) { toast('The reply is not valid design code. Ask the AI to reply with JSON only.'); return; }
      if (!d.pages && d.objects) d = { w: d.w, h: d.h, pages: [{ bg: d.bg, objects: d.objects }] };
      if (!d.pages || !d.pages.length) { toast('No pages in the reply.'); return; }
      d.w = +d.w || doc.w; d.h = +d.h || doc.h;
      var sz = sizes.find(function (x) { return x.w === d.w && x.h === d.h; }); d.mm = sz && sz.mm || [d.w * 25.4 / 96, d.h * 25.4 / 96];
      d.pages.forEach(function (p) { p.objects = (p.objects || []).filter(function (o) { return o && typeof o === 'object' && o.t; }); });
      useDesign(d, {}).then(function () { toast('AI design applied — adjust anything by hand.'); });
    }
    S.applyAI = applyAI;

    // ---------- start ----------
    S.init = function () {
      ['Anton', 'Bebas Neue', 'Oswald', 'Montserrat', 'Playfair Display', 'Cinzel', 'Great Vibes', 'Hind', 'Yatra One', 'Kalam', 'Cormorant Garamond', 'Tiro Devanagari Hindi'].forEach(function (f) { needFont(f); if (document.fonts && document.fonts.load) document.fonts.load('400 30px "' + f + '"', 'Aa अ').catch(function () {}); });
      selectTab(mobile() ? 'tpl' : 'tpl'); if (mobile()) panel.hidden = true;
      if (mobile()) [].forEach.call(tabs.children, function (b) { b.setAttribute('aria-selected', 'false'); });
      var first = TPL.filter(function (t) { return !t.sizes || t.sizes.indexOf(sizes[0].k) >= 0; })[0];
      return dbDo('drafts', 'readonly', function (st) { return st.get('auto-' + cfg.tool); }).catch(function () { return null; }).then(function (auto) {
        if (auto && auto.pages && auto.pages.length && Date.now() - auto.at < 1000 * 60 * 60 * 24 * 30) return openSnapshot(auto).then(function () { toast('Your last design is back. Pick a template to start a new one.'); });
        return first ? S.useTemplate(first.id) : useDesign({ w: sizes[0].w, h: sizes[0].h, pages: [{ bg: '#ffffff', objects: [] }] }, {});
      }).then(function () { if (mobile()) setTimeout(function () { selectTab('tpl'); }, 300); });
    };
  }
  ST.Studio = Studio;
  ST.icons = I; ST.mkObj = mkObj; ST.qrURL = qrURL; ST.barURL = barURL; ST.fontsFor = fontsFor; ST.needFont = needFont; ST.imgObj = imgObj; ST.PROPS = PROPS; ST.pickFile = pickFile; ST.fileToURL = fileToURL; ST.loadImg = loadImg; ST.esc = esc;
})();
