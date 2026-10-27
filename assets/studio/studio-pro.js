/* S Printer — Editing Tool S: full editor layer on top of the Design Studio.
 * Adds: app-style layout, Text, Brand Kit, Photos (free stock), icons & stickers, Charts,
 * Magic Resize, Animations with MP4 / GIF export, one-click background removal.
 * Original code by S Printer. Free photos: Openverse (CC licences). Icons: Iconify (open-source sets). */
(function () {
  'use strict';
  var ST = window.SPStudio, F = window.fabric;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  var svg = function (p, fill) { return '<svg viewBox="0 0 24 24" fill="' + (fill ? 'currentColor' : 'none') + '" stroke="' + (fill ? 'none' : 'currentColor') + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
  var IC = {
    design: svg('<rect x="3" y="3" width="7.5" height="9" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.6"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.6"/><rect x="3" y="15" width="7.5" height="6" rx="1.6"/>'),
    els: svg('<circle cx="7.5" cy="7.5" r="4"/><path d="M14 4h6v6h-6z"/><path d="M7.5 13.5l4.5 7.5H3z"/><path d="M17 13.5c1.8 0 3.5 1.6 3.5 3.6 0 2.2-3.5 4.4-3.5 4.4s-3.5-2.2-3.5-4.4c0-2 1.7-3.6 3.5-3.6z"/>'),
    text: svg('<path d="M5 6V4h14v2"/><path d="M12 4v16"/><path d="M9 20h6"/>'),
    brand: svg('<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z"/>'),
    up: svg('<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>'),
    photos: svg('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
    charts: svg('<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>'),
    draw: svg('<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>'),
    anim: svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>'),
    ai: svg('<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'),
    page: svg('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 15l4.5-4 4 3.5L16 11l4 4"/>'),
    layers: svg('<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'),
    resize: svg('<path d="M4 9V4h5"/><path d="M20 15v5h-5"/><path d="M4 4l7 7"/><path d="M20 20l-7-7"/>'),
    down: svg('<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
    play: svg('<path d="M7 4.5v15l12-7.5z"/>', true),
    stop: svg('<rect x="6" y="6" width="12" height="12" rx="2"/>', true),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    magic: svg('<path d="M4 20L16 8"/><path d="M14 6l4 4"/><path d="M18 3v3M16.5 4.5h3M7 3v2M6 4h2M20 13v2M19 14h2"/>'),
    bg: svg('<circle cx="12" cy="9" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/><path d="M3 3l18 18" stroke-dasharray="2 2.5"/>')
  };

  // ---------- network helpers ----------
  function toDataURL(img, max, type) {
    var k = Math.min(1, (max || 1800) / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    var c = document.createElement('canvas'); c.width = Math.round((img.naturalWidth || img.width) * k); c.height = Math.round((img.naturalHeight || img.height) * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL(type || 'image/jpeg', 0.9);
  }
  function corsImage(urls) {
    urls = urls.filter(Boolean);
    return new Promise(function (res, rej) {
      (function next(i) {
        if (i >= urls.length) { rej(new Error('Could not load this picture.')); return; }
        var im = new Image(); im.crossOrigin = 'anonymous'; im.referrerPolicy = 'no-referrer';
        im.onload = function () { try { res(toDataURL(im)); } catch (e) { next(i + 1); } };
        im.onerror = function () { next(i + 1); };
        im.src = urls[i];
      })(0);
    });
  }
  function svgData(txt) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt); }

  // ---------- easing for animations ----------
  var E = {
    out: function (p) { return 1 - Math.pow(1 - p, 3); },
    back: function (p) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
    bounce: function (p) { var n = 7.5625, d = 2.75; if (p < 1 / d) return n * p * p; if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75; if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375; return n * (p -= 2.625 / d) * p + 0.984375; }
  };
  var ANIMS = [
    ['fade', 'Fade'], ['rise', 'Rise'], ['pan', 'Pan'], ['slideL', 'Slide in'], ['drop', 'Drop'], ['pop', 'Pop'],
    ['zoom', 'Zoom'], ['spin', 'Spin'], ['tumble', 'Tumble'], ['typer', 'Typewriter'], ['blur', 'Blur in'], ['wipe', 'Wipe'],
    ['breathe', 'Breathe'], ['pulse', 'Pulse'], ['wiggle', 'Wiggle'], ['float', 'Float']
  ];
  var LOOPS = { breathe: 1, pulse: 1, wiggle: 1, float: 1 };
  // state of one object at time t (seconds) for its animation
  function animState(a, base, t, W, H) {
    var st = { op: base.op, dx: 0, dy: 0, sc: 1, ang: 0, chars: null, blur: 0, clip: 1 };
    if (!a || !a.t) return st;
    var dur = a.d || 0.8, p = Math.max(0, Math.min(1, (t - (a.dl || 0)) / dur)), q = E.out(p), m = Math.min(W, H);
    switch (a.t) {
      case 'fade': st.op = base.op * q; break;
      case 'rise': st.op = base.op * q; st.dy = (1 - q) * m * 0.08; break;
      case 'pan': st.op = base.op * q; st.dx = -(1 - q) * m * 0.12; break;
      case 'slideL': st.dx = -(1 - q) * (base.right + 20); break;
      case 'drop': st.dy = -(1 - E.bounce(p)) * (base.bottom + 20); break;
      case 'pop': st.op = base.op * Math.min(1, p * 3); st.sc = 0.4 + 0.6 * E.back(p); break;
      case 'zoom': st.op = base.op * q; st.sc = 1.6 - 0.6 * q; break;
      case 'spin': st.op = base.op * q; st.ang = -(1 - q) * 180; st.sc = 0.6 + 0.4 * q; break;
      case 'tumble': st.op = base.op * q; st.ang = (1 - q) * 30; st.dy = (1 - q) * m * 0.06; break;
      case 'typer': st.op = base.op * (p > 0 ? 1 : 0); st.chars = p; break;
      case 'blur': st.op = base.op * q; st.blur = (1 - q); break;
      case 'wipe': st.clip = q; st.op = p > 0 ? base.op : 0; break;
      case 'breathe': st.op = base.op * Math.min(1, p * 3); st.sc = 1 + 0.045 * Math.sin((t - (a.dl || 0)) * Math.PI * 2 / 2.4); break;
      case 'pulse': st.op = base.op * Math.min(1, p * 3); st.sc = 1 + 0.08 * Math.max(0, Math.sin((t - (a.dl || 0)) * Math.PI * 2 / 1.2)); break;
      case 'wiggle': st.op = base.op * Math.min(1, p * 3); st.ang = 6 * Math.sin((t - (a.dl || 0)) * Math.PI * 2 / 0.9); break;
      case 'float': st.op = base.op * Math.min(1, p * 3); st.dy = m * 0.015 * Math.sin((t - (a.dl || 0)) * Math.PI * 2 / 2.6); break;
    }
    return st;
  }
  // prepare objects of a canvas for animation; returns function(t) that draws frame t
  function animator(cvs, W, H) {
    var items = cvs.getObjects().map(function (o) {
      var c = o.getCenterPoint(), b = o.getBoundingRect(true, true);
      return { o: o, a: o.anim, base: { op: o.opacity == null ? 1 : o.opacity, cx: c.x, cy: c.y, sx: o.scaleX, sy: o.scaleY, ang: o.angle || 0, text: o.text, right: b.left + b.width, bottom: b.top + b.height, clip: o.clipPath, filters: o.filters ? o.filters.slice() : null } };
    }).filter(function (x) { return x.a && x.a.t; });
    function frame(t) {
      items.forEach(function (it) {
        var o = it.o, b = it.base, s = animState(it.a, b, t, W, H);
        o.set({ opacity: s.op, scaleX: b.sx * s.sc, scaleY: b.sy * s.sc, angle: b.ang + s.ang });
        o.setPositionByOrigin(new F.Point(b.cx + s.dx, b.cy + s.dy), 'center', 'center');
        if (s.chars != null && b.text != null) { var n = Math.round(b.text.length * s.chars); if (o.text !== b.text.slice(0, n)) { o.set('text', b.text.slice(0, n) || ' '); o.initDimensions && o.initDimensions(); } }
        if (it.a.t === 'wipe') { var w = o.width, h = o.height; o.clipPath = s.clip >= 1 ? b.clip : new F.Rect({ left: -w / 2, top: -h / 2, width: Math.max(0.01, w * s.clip), height: h, originX: 'left', originY: 'top' }); o.dirty = true; }
        if (it.a.t === 'blur' && o.type === 'image' && o.filters) { o.filters = (b.filters || []).concat(s.blur > 0.02 ? [new F.Image.filters.Blur({ blur: s.blur * 0.5 })] : []); try { o.applyFilters(); } catch (e) {} }
        o.setCoords();
      });
      cvs.renderAll();
    }
    function reset() {
      items.forEach(function (it) {
        var o = it.o, b = it.base;
        o.set({ opacity: b.op, scaleX: b.sx, scaleY: b.sy, angle: b.ang });
        o.setPositionByOrigin(new F.Point(b.cx, b.cy), 'center', 'center');
        if (b.text != null && o.text !== b.text) { o.set('text', b.text); o.initDimensions && o.initDimensions(); }
        if (it.a.t === 'wipe') { o.clipPath = b.clip; o.dirty = true; }
        if (it.a.t === 'blur' && o.type === 'image') { o.filters = b.filters || []; try { o.applyFilters(); } catch (e) {} }
        o.setCoords();
      });
      cvs.renderAll();
    }
    var end = items.reduce(function (m, it) { return Math.max(m, (it.a.dl || 0) + (it.a.d || 0.8)); }, 0);
    return { frame: frame, reset: reset, end: end, count: items.length };
  }

  // ---------- charts ----------
  var CHART_PAL = {
    Ocean: ['#0ea5e9', '#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#84cc16'],
    Candy: ['#ec4899', '#a855f7', '#f97316', '#facc15', '#22c55e', '#06b6d4'],
    Earth: ['#b45309', '#15803d', '#0f766e', '#a16207', '#7c2d12', '#4d7c0f'],
    Mono: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
    Pastel: ['#f9a8d4', '#c4b5fd', '#93c5fd', '#86efac', '#fde68a', '#fdba74']
  };
  var CHART_TYPES = [['bar', 'Column'], ['hbar', 'Bar'], ['line', 'Line'], ['area', 'Area'], ['pie', 'Pie'], ['donut', 'Donut'], ['ring', 'Progress ring'], ['progress', 'Progress bars']];
  function defaultChart(type) {
    var pct = type === 'ring' || type === 'progress';
    return { type: type, title: pct ? 'Course progress' : 'Sales by month', labels: pct ? ['Design', 'Coding', 'Marketing'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], values: pct ? [82, 64, 45] : [30, 45, 38, 60, 52, 75], pal: 'Ocean', showVals: true, font: 'Poppins', ink: '#1B2330' };
  }
  function fmtV(v) { return Math.abs(v) >= 1000 ? (Math.round(v / 100) / 10) + 'k' : String(Math.round(v * 10) / 10); }
  function buildChart(spec, W) {
    var w = W, h = Math.round(W * (spec.type === 'progress' ? 0.5 : spec.type === 'ring' ? 0.62 : 0.72)), cols = CHART_PAL[spec.pal] || CHART_PAL.Ocean, ink = spec.ink || '#1B2330', fs = Math.max(10, w / 34), font = spec.font || 'Poppins';
    var out = [], vals = spec.values.map(function (v) { return +v || 0; }), labs = spec.labels, n = vals.length, max = Math.max.apply(null, vals.concat([1]));
    function T(x, y, txt, size, o) { return new F.Text(String(txt), Object.assign({ left: x, top: y, fontFamily: font, fontSize: size, fill: ink, originX: 'center', originY: 'top' }, o || {})); }
    var top = 0;
    if (spec.title) { out.push(T(w / 2, 0, spec.title, fs * 1.45, { fontWeight: 700 })); top = fs * 2.4; }
    var bh = h - top;
    if (spec.type === 'bar' || spec.type === 'line' || spec.type === 'area') {
      var L = fs * 2.2, B = fs * 2, gh = bh - B - fs, gw = w - L - fs * 0.5, x0 = L, y0 = top + fs + gh;
      for (var g = 0; g <= 4; g++) { var gy = y0 - gh * g / 4; out.push(new F.Line([x0, gy, x0 + gw, gy], { stroke: g ? '#e2e8f0' : '#94a3b8', strokeWidth: Math.max(1, w / 600) })); out.push(T(x0 - fs * 0.5, gy - fs * 0.6, fmtV(max * g / 4), fs * 0.8, { originX: 'right', fill: '#64748b' })); }
      var step = gw / n;
      labs.forEach(function (lb, i) { out.push(T(x0 + step * (i + 0.5), y0 + fs * 0.5, lb, fs * 0.9, { fill: '#475569' })); });
      if (spec.type === 'bar') {
        vals.forEach(function (v, i) {
          var bhh = gh * v / max, bw = step * 0.62, bx = x0 + step * i + (step - bw) / 2;
          out.push(new F.Rect({ left: bx, top: y0 - bhh, width: bw, height: Math.max(0.5, bhh), fill: cols[i % cols.length], rx: Math.min(bw * 0.18, 10), ry: Math.min(bw * 0.18, 10) }));
          if (spec.showVals) out.push(T(bx + bw / 2, y0 - bhh - fs * 1.3, fmtV(v), fs * 0.9, { fontWeight: 700 }));
        });
      } else {
        var pts = vals.map(function (v, i) { return { x: x0 + step * (i + 0.5), y: y0 - gh * v / max }; });
        if (spec.type === 'area') out.push(new F.Polygon([{ x: pts[0].x, y: y0 }].concat(pts).concat([{ x: pts[pts.length - 1].x, y: y0 }]), { fill: cols[0], opacity: 0.25 }));
        out.push(new F.Polyline(pts, { fill: '', stroke: cols[0], strokeWidth: Math.max(2, w / 160), strokeLineJoin: 'round', strokeLineCap: 'round' }));
        pts.forEach(function (p, i) { out.push(new F.Circle({ left: p.x, top: p.y, radius: Math.max(3, w / 120), fill: '#fff', stroke: cols[0], strokeWidth: Math.max(2, w / 220), originX: 'center', originY: 'center' })); if (spec.showVals) out.push(T(p.x, p.y - fs * 1.7, fmtV(vals[i]), fs * 0.85, { fontWeight: 700 })); });
      }
    } else if (spec.type === 'hbar') {
      var lw = w * 0.26, rowH = bh / n;
      vals.forEach(function (v, i) {
        var y = top + rowH * i + rowH * 0.18, bhh = rowH * 0.64, bw = (w - lw - fs * 3) * v / max;
        out.push(T(lw - fs * 0.5, y + bhh / 2 - fs * 0.6, labs[i] || '', fs, { originX: 'right', fill: '#475569' }));
        out.push(new F.Rect({ left: lw, top: y, width: w - lw - fs * 3, height: bhh, fill: '#f1f5f9', rx: bhh / 2, ry: bhh / 2 }));
        out.push(new F.Rect({ left: lw, top: y, width: Math.max(bhh, bw), height: bhh, fill: cols[i % cols.length], rx: bhh / 2, ry: bhh / 2 }));
        if (spec.showVals) out.push(T(lw + Math.max(bhh, bw) + fs * 0.4, y + bhh / 2 - fs * 0.6, fmtV(v), fs * 0.9, { originX: 'left', fontWeight: 700 }));
      });
    } else if (spec.type === 'pie' || spec.type === 'donut') {
      var tot = vals.reduce(function (a, b) { return a + b; }, 0) || 1, r = Math.min(bh * 0.46, w * 0.28), cx = w * 0.32, cy = top + bh / 2, a0 = -Math.PI / 2;
      vals.forEach(function (v, i) {
        var a1 = a0 + Math.PI * 2 * v / tot, large = a1 - a0 > Math.PI ? 1 : 0;
        var d = 'M ' + cx + ' ' + cy + ' L ' + (cx + r * Math.cos(a0)) + ' ' + (cy + r * Math.sin(a0)) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + (cx + r * Math.cos(a1)) + ' ' + (cy + r * Math.sin(a1)) + ' Z';
        if (v / tot >= 0.999) d = 'M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 1 1 ' + (cx + r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 1 1 ' + (cx - r) + ' ' + cy + ' Z';
        out.push(new F.Path(d, { fill: cols[i % cols.length], stroke: '#ffffff', strokeWidth: Math.max(1.5, w / 300) }));
        if (spec.showVals && v / tot > 0.06) { var am = (a0 + a1) / 2, rr = spec.type === 'donut' ? r * 0.78 : r * 0.62; out.push(T(cx + rr * Math.cos(am), cy + rr * Math.sin(am) - fs * 0.6, Math.round(v / tot * 100) + '%', fs * 0.9, { fill: '#ffffff', fontWeight: 700 })); }
        a0 = a1;
      });
      if (spec.type === 'donut') out.push(new F.Circle({ left: cx, top: cy, radius: r * 0.56, fill: '#ffffff', originX: 'center', originY: 'center' }));
      var ly = cy - (n * fs * 1.7) / 2;
      labs.forEach(function (lb, i) { out.push(new F.Rect({ left: w * 0.66, top: ly + i * fs * 1.7, width: fs, height: fs, rx: fs * 0.25, ry: fs * 0.25, fill: cols[i % cols.length] })); out.push(T(w * 0.66 + fs * 1.6, ly + i * fs * 1.7 - fs * 0.1, lb + (spec.showVals ? '  ' + fmtV(vals[i]) : ''), fs, { originX: 'left' })); });
    } else if (spec.type === 'ring') {
      var k = Math.min(n, 3), rw = w / k;
      vals.slice(0, k).forEach(function (v, i) {
        var cx2 = rw * (i + 0.5), r2 = Math.min(rw * 0.36, bh * 0.36), cy2 = top + r2 + fs * 0.5, sw = r2 * 0.22, pc = Math.max(0, Math.min(100, v)) / 100;
        out.push(new F.Circle({ left: cx2, top: cy2, radius: r2, fill: '', stroke: '#e2e8f0', strokeWidth: sw, originX: 'center', originY: 'center' }));
        if (pc > 0) { var e = -Math.PI / 2 + Math.PI * 2 * Math.min(pc, 0.9999); out.push(new F.Path('M ' + cx2 + ' ' + (cy2 - r2) + ' A ' + r2 + ' ' + r2 + ' 0 ' + (pc > 0.5 ? 1 : 0) + ' 1 ' + (cx2 + r2 * Math.cos(e)) + ' ' + (cy2 + r2 * Math.sin(e)), { fill: '', stroke: cols[i % cols.length], strokeWidth: sw, strokeLineCap: 'round' })); }
        out.push(T(cx2, cy2 - fs * 0.9, Math.round(pc * 100) + '%', fs * 1.5, { fontWeight: 700 }));
        out.push(T(cx2, cy2 + r2 + sw + fs * 0.3, labs[i] || '', fs, { fill: '#475569' }));
      });
    } else if (spec.type === 'progress') {
      var rh = bh / n;
      vals.forEach(function (v, i) {
        var y = top + rh * i, pc = Math.max(0, Math.min(100, v)) / 100, barH = Math.min(rh * 0.3, fs * 1.1);
        out.push(T(0, y + rh * 0.1, labs[i] || '', fs, { originX: 'left', fontWeight: 600 }));
        out.push(T(w, y + rh * 0.1, Math.round(pc * 100) + '%', fs, { originX: 'right', fontWeight: 700 }));
        out.push(new F.Rect({ left: 0, top: y + rh * 0.1 + fs * 1.5, width: w, height: barH, rx: barH / 2, ry: barH / 2, fill: '#e2e8f0' }));
        out.push(new F.Rect({ left: 0, top: y + rh * 0.1 + fs * 1.5, width: Math.max(barH, w * pc), height: barH, rx: barH / 2, ry: barH / 2, fill: cols[i % cols.length] }));
      });
    }
    var g = new F.Group(out, { subTargetCheck: false });
    g.chart = clone(spec); g.nm = 'Chart: ' + (spec.title || spec.type);
    return g;
  }

  // ---------- smart resize ----------
  function smartPage(json, W1, H1, W2, H2, PROPS) {
    return new Promise(function (res) {
      var sc = new F.StaticCanvas(null, { width: W1, height: H1, enableRetinaScaling: false });
      sc.loadFromJSON(json, function () {
        var k = Math.min(W2 / W1, H2 / H1), kx = W2 / W1, ky = H2 / H1;
        sc.getObjects().forEach(function (o) {
          var b = o.getBoundingRect(true, true), c = o.getCenterPoint(), fullW = b.width >= W1 * 0.9, fullH = b.height >= H1 * 0.9;
          var nsx = o.scaleX * (fullW ? kx : k), nsy = o.scaleY * (fullH ? ky : k);
          if (fullW && fullH) { nsx = o.scaleX * kx; nsy = o.scaleY * ky; }
          if (o.type === 'textbox' || o.type === 'i-text' || o.type === 'text' || o.type === 'image' && !fullW && !fullH) { nsx = nsy = o.scaleX * k; }
          o.set({ scaleX: nsx, scaleY: nsy });
          o.setPositionByOrigin(new F.Point(c.x / W1 * W2, c.y / H1 * H2), 'center', 'center');
          o.setCoords();
          var nb = o.getBoundingRect(true, true);
          if (!fullW && nb.width <= W2) { if (nb.left < 0) o.left -= nb.left; if (nb.left + nb.width > W2) o.left -= nb.left + nb.width - W2; }
          if (!fullH && nb.height <= H2) { if (nb.top < 0) o.top -= nb.top; if (nb.top + nb.height > H2) o.top -= nb.top + nb.height - H2; }
          o.setCoords();
        });
        var bgImg = sc.backgroundColor;
        if (bgImg && typeof bgImg === 'object' && bgImg.coords) { try { var cc = bgImg.coords; bgImg.coords = { x1: cc.x1 * kx, y1: cc.y1 * ky, x2: cc.x2 * kx, y2: cc.y2 * ky }; } catch (e) {} }
        var out = sc.toJSON(PROPS); sc.dispose(); res(out);
      });
    });
  }

  // ======================================================================
  var Pro = ST.Pro = {};
  var S = null, cv = null;

  // ---------- Text tab ----------
  var COMBOS = [
    [['MEGA SALE', 'Anton', 400, '#111827', 1, 40], ['Up to 50% off on everything', 'Montserrat', 600, '#db2777', 0.32, 0]],
    [['Happy', 'Great Vibes', 400, '#7c3aed', 0.7, 0], ['BIRTHDAY', 'Bebas Neue', 400, '#db2777', 1, 120]],
    [['The wedding of', 'Cormorant Garamond', 600, '#6b4f2a', 0.32, 120], ['Priya & Rahul', 'Great Vibes', 400, '#8c3b5e', 1, 0]],
    [['GRAND OPENING', 'Bebas Neue', 400, '#0f172a', 1, 80], ['Sunday · 10 AM · Main Market', 'Poppins', 500, '#0369a1', 0.3, 0]],
    [['good vibes', 'Pacifico', 400, '#db2777', 1, 0], ['ONLY', 'Montserrat', 800, '#1f2937', 0.42, 600]],
    [['Thank you', 'Sacramento', 400, '#1f2937', 1, 0], ['for your order', 'Poppins', 400, '#6b7280', 0.3, 200]],
    [['BREAKING', 'Oswald', 700, '#ffffff', 1, 40, '#dc2626'], ['NEWS', 'Oswald', 700, '#dc2626', 0.9, 40]],
    [['Coming', 'Playfair Display', 700, '#111827', 1, 0], ['SOON', 'Montserrat', 800, '#ca8a04', 0.55, 500]],
    [['WE ARE', 'Montserrat', 800, '#0369a1', 0.45, 300], ['Hiring!', 'Montserrat', 800, '#0f172a', 1, 0]],
    [['Save the date', 'Parisienne', 400, '#8c3b5e', 1, 0], ['21 · 11 · 2026', 'Cinzel', 600, '#6b4f2a', 0.45, 200]],
    [['শুভ জন্মদিন', 'Hind Siliguri', 700, '#db2777', 1, 0], ['অনেক ভালোবাসা', 'Hind Siliguri', 400, '#4b5563', 0.4, 0]],
    [['शुभ दीपावली', 'Yatra One', 400, '#b45309', 1, 0], ['आपको और आपके परिवार को', 'Hind', 500, '#7c2d12', 0.36, 0]],
    [['Summer', 'Dancing Script', 700, '#f97316', 1, 0], ['COLLECTION 2026', 'Montserrat', 700, '#0f766e', 0.3, 400]],
    [['Big', 'Archivo Black', 400, '#4f46e5', 1, 0], ['IDEAS', 'Archivo Black', 400, '#ec4899', 1, 0]],
    [['Yoga', 'Caveat', 700, '#15803d', 1, 0], ['Morning class · 6 AM', 'Poppins', 500, '#374151', 0.32, 0]],
    [['CERTIFICATE', 'Cinzel', 700, '#1e3a8a', 0.8, 200], ['of appreciation', 'Great Vibes', 400, '#b45309', 0.7, 0]]
  ];
  function addTexts(parts, label) {
    var W = S.doc.w, H = S.doc.h, base = Math.min(W, H) * 0.12, objs = [], y = 0;
    var fonts = parts.map(function (p) { return { fontFamily: p[1], fontWeight: p[2], text: p[0] }; });
    return S.fontsFor(fonts).then(function () {
      parts.forEach(function (p) {
        var fs = Math.round(base * p[4]), t = new F.Textbox(p[0], { left: W * 0.1, top: 0, width: W * 0.8, fontFamily: p[1], fontWeight: p[2], fill: p[3], fontSize: fs, textAlign: 'center', charSpacing: p[5] || 0, lineHeight: 1.1, backgroundColor: p[6] || '' });
        t.tpl = p[0]; t.nm = label || p[0]; t.top = y; y += t.height + fs * 0.12; objs.push(t);
      });
      var dy = (H - y) / 2; objs.forEach(function (t) { t.top += dy; t.setCoords(); cv.add(t); });
      cv.setActiveObject(objs.length > 1 ? new F.ActiveSelection(objs, { canvas: cv }) : objs[0]); cv.requestRenderAll(); S.record(); S.showProps();
    });
  }
  function tabText(panel) {
    panel.innerHTML = '<h3>Text</h3>' +
      '<button class="sx-addtext sx-h1" data-t="h1">Add a heading</button><button class="sx-addtext sx-h2" data-t="h2">Add a subheading</button><button class="sx-addtext sx-h3" data-t="h3">Add a little bit of body text</button>' +
      '<h4>Font combinations</h4><div class="sx-combos">' + COMBOS.map(function (c, i) {
        return '<button class="sx-combo" data-c="' + i + '">' + c.map(function (p) { return '<span style="font-family:\'' + p[1] + '\',sans-serif;font-weight:' + p[2] + ';color:' + (p[6] ? '#fff' : p[3]) + ';font-size:' + Math.round(22 * p[4] + 8) + 'px;letter-spacing:' + (p[5] / 1000) + 'em;' + (p[6] ? 'background:' + p[6] + ';padding:0 6px;' : '') + '">' + esc(p[0]) + '</span>'; }).join('') + '</button>';
      }).join('') + '</div>' +
      '<p class="st-note">Tip: select any text, then use Effects for shadow, outline, neon, curve and more.</p>';
    COMBOS.forEach(function (c) { c.forEach(function (p) { S.needFont(p[1]); }); });
    var b = store('sx-brand') || {};
    panel.onclick = function (e) {
      var t = e.target.closest('[data-t]'); if (t) {
        var k = t.dataset.t, hf = (b.fonts && b.fonts.h) || 'Montserrat', bf = (b.fonts && b.fonts.b) || 'Poppins';
        addTexts([k === 'h1' ? ['Add a heading', hf, 800, '#1B2330', 0.8, 0] : k === 'h2' ? ['Add a subheading', bf, 600, '#1B2330', 0.45, 0] : ['Add a little bit of body text', bf, 400, '#334155', 0.28, 0]]); return;
      }
      var c = e.target.closest('[data-c]'); if (c) addTexts(COMBOS[+c.dataset.c], 'Text');
    };
  }

  // ---------- Photos tab (free stock photos) ----------
  function withTimeout(pr, ms) { return Promise.race([pr, new Promise(function (_, no) { setTimeout(function () { no(new Error('timeout')); }, ms); })]); }
  var photoState = { q: '', page: 1, items: [], loading: false };
  var PHOTO_CHIPS = ['Nature', 'Flowers', 'Food', 'Business', 'People', 'Wedding', 'Festival', 'Sky', 'Texture', 'Abstract', 'City', 'Mountains', 'Beach', 'Coffee', 'Books', 'Technology'];
  function tabPhotos(panel) {
    panel.innerHTML = '<h3>Photos</h3><input class="st-in sx-search" type="search" placeholder="Search free photos — e.g. flowers, office, food" value="' + esc(photoState.q) + '">' +
      '<div class="st-chips sx-pchips">' + PHOTO_CHIPS.map(function (c) { return '<button class="st-chip" data-q="' + c + '">' + c + '</button>'; }).join('') + '</div>' +
      '<div class="sx-masonry"></div><div class="sx-more"></div><p class="st-note">Free photos from <b>Openverse</b> and <b>Wikimedia Commons</b> (Creative Commons). The photo credit is kept in the layer name. Tap a photo to add it, or select a photo frame first to fill it.</p>';
    var grid = panel.querySelector('.sx-masonry'), more = panel.querySelector('.sx-more'), inp = panel.querySelector('.sx-search');
    function draw() {
      grid.innerHTML = photoState.items.map(function (r, i) { return '<button class="sx-ph" data-i="' + i + '" title="' + esc(r.title || '') + '"><img loading="lazy" referrerpolicy="no-referrer" alt="" src="' + esc(r.thumbnail || r.url) + '"></button>'; }).join('') || (photoState.loading ? '' : '<p class="st-note">No photos found. Try another word.</p>');
      more.innerHTML = photoState.loading ? '<p class="st-note">Loading…</p>' : photoState.items.length && photoState.more ? '<button class="st-btn st-wide" data-more="1">Load more</button>' : '';
    }
    function search(q, page) {
      photoState.q = q; photoState.page = page; photoState.loading = true; if (page === 1) photoState.items = []; draw();
      var q2 = q || 'nature', done = function (list, more) {
        photoState.items = photoState.items.concat(list); photoState.more = more; photoState.loading = false; if (panel.isConnected) draw();
      }, fail = function () { photoState.loading = false; if (panel.isConnected) { draw(); grid.innerHTML = '<p class="st-note">Could not reach the free photo library. Check your internet and try again.</p>'; } };
      function commons() {
        photoState.src = 'wm';
        var u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=30&gsroffset=' + ((page - 1) * 30) +
          '&gsrsearch=' + encodeURIComponent(q2 + ' filetype:bitmap') + '&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=1280&iiextmetadatafilter=Artist|LicenseShortName|ObjectName';
        return withTimeout(fetch(u), 15000).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) {
          var pages = j.query ? Object.values(j.query.pages).sort(function (x, y) { return (x.index || 0) - (y.index || 0); }) : [];
          done(pages.map(function (pg) {
            var ii = (pg.imageinfo || [])[0] || {}, m = ii.extmetadata || {}, val = function (k) { return m[k] ? String(m[k].value).replace(/<[^>]*>/g, '').trim() : ''; };
            if (!/^image\/(jpeg|png|webp)/.test(ii.mime || '')) return null;
            var big = ii.thumburl || ii.url;
            return { url: big, thumbnail: big.replace(/\/\d+px-/, '/330px-'), title: val('ObjectName') || pg.title.replace(/^File:|\.\w+$/g, ''), creator: val('Artist').slice(0, 40), license: val('LicenseShortName') || 'cc', alt: [big, ii.url] };
          }).filter(Boolean), !!j.continue);
        });
      }
      if (photoState.src === 'wm' && page > 1) { commons().catch(fail); return; }
      photoState.src = 'ov';
      var url = 'https://api.openverse.org/v1/images/?q=' + encodeURIComponent(q2) + '&page=' + page + '&page_size=30&license_type=commercial&mature=false';
      withTimeout(fetch(url), 8000).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) {
        if (!(j.results || []).length && page === 1) return commons();
        done(j.results || [], (j.page_count || 1) > page);
      }).catch(function () { return commons().catch(fail); });
    }
    var t = null;
    inp.oninput = function () { clearTimeout(t); t = setTimeout(function () { search(inp.value.trim(), 1); }, 500); };
    panel.onclick = function (e) {
      var c = e.target.closest('[data-q]'); if (c) { inp.value = c.dataset.q; search(c.dataset.q, 1); return; }
      if (e.target.closest('[data-more]')) { search(photoState.q, photoState.page + 1); return; }
      var p = e.target.closest('[data-i]'); if (!p) return;
      var r = photoState.items[+p.dataset.i]; S.busy(true, 'Adding photo…');
      corsImage((r.alt || [r.url]).concat([r.thumbnail])).then(function (u) {
        S.busy(false); var nm = 'Photo: ' + (r.title || 'free photo').slice(0, 40) + (r.creator ? ' — ' + r.creator : '') + ' (' + (r.license || 'cc').toUpperCase() + ')';
        placePicture(u, nm);
      }).catch(function (er) { S.busy(false); S.toast(er.message); });
    };
    if (!photoState.items.length && !photoState.loading) search(photoState.q || 'nature', 1); else draw();
  }
  function placePicture(url, nm) {
    var a = cv.getActiveObject();
    if (a && a.ph && a.type === 'group') return ST.fillPh(cv, a, url).then(function (im) { im.srcOrig = url; im.nm = nm; cv.setActiveObject(im); cv.requestRenderAll(); S.record(); S.showProps(); });
    return ST.loadImg(url).then(function (im) {
      var W = S.doc.w, H = S.doc.h, k = Math.min(W * 0.7 / im.width, H * 0.7 / im.height), w = im.width * k, h = im.height * k;
      return S.imgObj(url, { x: (W - w) / 2, y: (H - h) / 2, w: w, h: h, fit: 'contain' }).then(function (o) { o.nm = nm; o.srcOrig = url; S.addObj(o); S.showProps(); });
    });
  }

  // ---------- Elements: icons & stickers from Iconify ----------
  var ICON_SETS = { color: 'fluent-emoji-flat,noto,twemoji,flat-color-icons,openmoji,streamline-emojis', line: 'ph,tabler,lucide,mdi,material-symbols,solar' };
  var EL_CHIPS = ['heart', 'star', 'flower', 'gift', 'cake', 'party', 'sun', 'moon', 'cloud', 'leaf', 'food', 'coffee', 'book', 'school', 'phone', 'mail', 'location', 'home', 'car', 'music', 'camera', 'check', 'arrow', 'fire', 'crown', 'money', 'shop', 'medal', 'diya', 'rose'];
  var elState = { q: 'heart', color: [], line: [] };
  function iconURL(id, color) { var p = id.split(':'); return 'https://api.iconify.design/' + p[0] + '/' + p[1] + '.svg?height=512' + (color ? '&color=' + encodeURIComponent(color) : ''); }
  function elsHook(panel) {
    var box = el('div', 'sx-elsearch', '<h3>Elements</h3><input class="st-in sx-search" type="search" placeholder="Search icons & stickers — heart, cake, phone…" value="' + esc(elState.q) + '"><div class="st-chips">' + EL_CHIPS.map(function (c) { return '<button class="st-chip" data-eq="' + c + '">' + c + '</button>'; }).join('') + '</div>' +
      '<h4>Stickers</h4><div class="sx-icons" data-set="color"></div><h4>Icons</h4><div class="sx-icons" data-set="line"></div><p class="st-note">Thousands of free open-source icons and stickers. Tap to add; change an icon\'s colour from the bar above the page.</p>');
    panel.insertBefore(box, panel.firstChild);
    var inp = box.querySelector('input'), t = null;
    function draw() {
      ['color', 'line'].forEach(function (k) {
        var g = box.querySelector('[data-set=' + k + ']'); if (!g) return;
        g.innerHTML = elState[k].length ? elState[k].map(function (id) { return '<button data-ic="' + id + '" data-k="' + k + '" title="' + id + '"><img loading="lazy" alt="" src="' + iconURL(id, k === 'line' ? '#1B2330' : null).replace('height=512', 'height=48') + '"></button>'; }).join('') : '<p class="st-note">Searching…</p>';
      });
    }
    function search(q) {
      elState.q = q; elState.color = []; elState.line = []; draw();
      ['color', 'line'].forEach(function (k) {
        fetch('https://api.iconify.design/search?query=' + encodeURIComponent(q) + '&limit=' + (k === 'color' ? 48 : 64) + '&prefixes=' + ICON_SETS[k]).then(function (r) { return r.json(); }).then(function (j) {
          elState[k] = j.icons || []; if (box.isConnected) { draw(); if (!elState[k].length) box.querySelector('[data-set=' + k + ']').innerHTML = '<p class="st-note">Nothing for “' + esc(q) + '”.</p>'; }
        }).catch(function () { if (box.isConnected) box.querySelector('[data-set=' + k + ']').innerHTML = '<p class="st-note">Could not reach the icon library — check your internet.</p>'; });
      });
    }
    inp.oninput = function () { clearTimeout(t); t = setTimeout(function () { if (inp.value.trim()) search(inp.value.trim()); }, 450); };
    box.addEventListener('click', function (e) {
      e.stopPropagation();
      var c = e.target.closest('[data-eq]'); if (c) { inp.value = c.dataset.eq; search(c.dataset.eq); return; }
      var b = e.target.closest('[data-ic]'); if (!b) return;
      addIcon(b.dataset.ic, b.dataset.k === 'line' ? '#1B2330' : null);
    });
    if (elState.color.length || elState.line.length) draw(); else search(elState.q);
  }
  function addIcon(id, color) {
    return fetch(iconURL(id, color)).then(function (r) { if (!r.ok) throw new Error('icon'); return r.text(); }).then(function (txt) {
      var W = S.doc.w, H = S.doc.h, s = Math.min(W, H) * 0.25;
      return S.imgObj(svgData(txt), { x: (W - s) / 2, y: (H - s) / 2, w: s, h: s, fit: 'contain' }).then(function (o) { o.icon = { id: id, color: color || null }; o.nm = id.split(':')[1].replace(/-/g, ' '); S.addObj(o); S.showProps(); });
    }).catch(function () { S.toast('Could not load that icon — check your internet.'); });
  }
  function recolorIcon(o, color) {
    fetch(iconURL(o.icon.id, color)).then(function (r) { return r.text(); }).then(function (txt) {
      var w = o.getScaledWidth(), h = o.getScaledHeight();
      o.setSrc(svgData(txt), function () { o.set({ scaleX: w / o.width, scaleY: h / o.height }); o.icon.color = color; cv.requestRenderAll(); S.record(); });
    });
  }

  // ---------- Charts tab ----------
  function chartPreview(type) {
    var c = '#6366f1', d = { bar: '<rect x="4" y="12" width="3" height="8" rx="1" fill="#0ea5e9"/><rect x="9" y="7" width="3" height="13" rx="1" fill="' + c + '"/><rect x="14" y="10" width="3" height="10" rx="1" fill="#14b8a6"/><rect x="19" y="4" width="3" height="16" rx="1" fill="#f59e0b"/>', hbar: '<rect x="3" y="4" width="16" height="3" rx="1.5" fill="#0ea5e9"/><rect x="3" y="10" width="11" height="3" rx="1.5" fill="' + c + '"/><rect x="3" y="16" width="18" height="3" rx="1.5" fill="#14b8a6"/>', line: '<path d="M3 18l5-6 5 3 8-10" fill="none" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>', area: '<path d="M3 18l5-6 5 3 8-10V21H3z" fill="#c7d2fe"/><path d="M3 18l5-6 5 3 8-10" fill="none" stroke="' + c + '" stroke-width="2"/>', pie: '<circle cx="12" cy="12" r="9" fill="#0ea5e9"/><path d="M12 12V3a9 9 0 0 1 8.5 12z" fill="' + c + '"/><path d="M12 12l8.5 3A9 9 0 0 1 9 20.5z" fill="#14b8a6"/>', donut: '<circle cx="12" cy="12" r="8" fill="none" stroke="#0ea5e9" stroke-width="5"/><path d="M12 4a8 8 0 0 1 7.6 10.5" fill="none" stroke="' + c + '" stroke-width="5"/>', ring: '<circle cx="12" cy="12" r="8" fill="none" stroke="#e2e8f0" stroke-width="3.5"/><path d="M12 4a8 8 0 1 1-7.6 10.5" fill="none" stroke="' + c + '" stroke-width="3.5" stroke-linecap="round"/>', progress: '<rect x="3" y="6" width="18" height="3" rx="1.5" fill="#e2e8f0"/><rect x="3" y="6" width="13" height="3" rx="1.5" fill="' + c + '"/><rect x="3" y="14" width="18" height="3" rx="1.5" fill="#e2e8f0"/><rect x="3" y="14" width="8" height="3" rx="1.5" fill="#14b8a6"/>' }[type];
    return '<svg viewBox="0 0 24 24">' + d + '</svg>';
  }
  function tabCharts(panel) {
    panel.innerHTML = '<h3>Charts</h3><div class="st-els">' + CHART_TYPES.map(function (t) { return '<button class="st-el" data-ch="' + t[0] + '">' + chartPreview(t[0]) + t[1] + '</button>'; }).join('') + '</div>' +
      '<h3 style="margin-top:16px">Tables</h3><div class="st-els"><button class="st-el" data-tb="plain"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M3 15h18M9 5v14M15 5v14"/></svg>Table</button></div>' +
      '<p class="st-note">After adding, tap “Edit chart” to type your own numbers, labels and colours.</p>';
    panel.onclick = function (e) {
      var b = e.target.closest('[data-ch]'); if (b) { var g = buildChart(defaultChart(b.dataset.ch), Math.min(S.doc.w, S.doc.h) * 0.7); g.set({ left: (S.doc.w - g.width) / 2, top: (S.doc.h - g.height) / 2 }); S.addObj(g); S.showProps(); editChart(g); return; }
      if (e.target.closest('[data-tb]')) { S.selectTab('els'); setTimeout(function () { var t = S.panel.querySelector('[data-e=table]'); if (t) t.click(); }, 50); }
    };
  }
  function editChart(o) {
    var sp = clone(o.chart);
    var m = S.modal('Edit chart', '<div class="sx-chartform"><label class="st-field">Chart type<select data-k="type">' + CHART_TYPES.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === sp.type ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select></label>' +
      '<label class="st-field">Title<input data-k="title" value="' + esc(sp.title) + '"></label>' +
      '<label class="st-field">Data — one per line: <i>Label, number</i><textarea data-k="data" rows="7">' + esc(sp.labels.map(function (l, i) { return l + ', ' + sp.values[i]; }).join('\n')) + '</textarea></label>' +
      '<div class="st-field">Colours<div class="sx-pals">' + Object.keys(CHART_PAL).map(function (k) { return '<button data-pal="' + k + '" aria-pressed="' + (k === sp.pal) + '">' + CHART_PAL[k].slice(0, 5).map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '<span>' + k + '</span></button>'; }).join('') + '</div></div>' +
      '<label class="st-check"><input type="checkbox" data-k="vals"' + (sp.showVals ? ' checked' : '') + '> Show numbers</label></div>', '<button class="st-btn" data-c="x">Cancel</button><button class="st-btn st-main" data-c="ok">Update chart</button>', true);
    var body = m.querySelector('.st-boxbody'), foot = m.querySelector('.st-boxfoot');
    body.addEventListener('click', function (e) { var p = e.target.closest('[data-pal]'); if (!p) return; sp.pal = p.dataset.pal; [].forEach.call(body.querySelectorAll('[data-pal]'), function (x) { x.setAttribute('aria-pressed', String(x === p)); }); });
    foot.querySelector('[data-c=x]').onclick = function () { m.close(); };
    foot.querySelector('[data-c=ok]').onclick = function () {
      sp.type = body.querySelector('[data-k=type]').value; sp.title = body.querySelector('[data-k=title]').value; sp.showVals = body.querySelector('[data-k=vals]').checked;
      var rows = body.querySelector('[data-k=data]').value.split('\n').map(function (l) { var p = l.split(/[,\t:]/); return [p[0].trim(), parseFloat((p[1] || '').replace(/[^\d.\-]/g, ''))]; }).filter(function (r) { return r[0] && !isNaN(r[1]); });
      if (!rows.length) { S.toast('Type at least one line like: Jan, 30'); return; }
      sp.labels = rows.map(function (r) { return r[0]; }); sp.values = rows.map(function (r) { return r[1]; });
      var w = o.width, g = buildChart(sp, w);
      g.set({ left: o.left, top: o.top, scaleX: o.scaleX, scaleY: o.scaleY, angle: o.angle, opacity: o.opacity }); if (o.anim) g.anim = o.anim;
      var i = cv.getObjects().indexOf(o); cv.remove(o); cv.insertAt(g, i); cv.setActiveObject(g); cv.requestRenderAll(); S.record(); S.showProps(); m.close();
    };
  }

  // ---------- Brand Kit tab ----------
  function brand() { var b = store('sx-brand') || {}; b.colors = b.colors || ['#1B2330', '#0098D8', '#D6247A', '#F5C400']; b.fonts = b.fonts || { h: 'Montserrat', b: 'Poppins' }; b.logos = b.logos || []; return b; }
  function fontOptions(cur) { return S.FONTS.map(function (g) { return '<optgroup label="' + esc(g[0]) + '">' + g[1].map(function (f) { return '<option' + (f[0] === cur ? ' selected' : '') + '>' + esc(f[0]) + '</option>'; }).join('') + '</optgroup>'; }).join(''); }
  function tabBrand(panel) {
    var b = brand();
    panel.innerHTML = '<h3>Brand Kit</h3><p class="st-note">Save your brand colours, fonts and logos once — use them in every design. Saved on this device.</p>' +
      '<h4>Brand colours</h4><div class="sx-bcols">' + b.colors.map(function (c, i) { return '<span class="sx-bcol"><button style="background:' + c + '" data-bc="' + c + '" title="Use ' + c + '"></button><i data-bx="' + i + '" title="Remove">×</i></span>'; }).join('') + '<label class="sx-badd" title="Add a colour">+<input type="color" data-badd value="#7c3aed"></label></div>' +
      '<p class="st-note">Tap a colour: it colours the selected item, or the page background when nothing is selected.</p>' +
      '<h4>Brand fonts</h4><label class="st-field">Headings<select data-bf="h">' + fontOptions(b.fonts.h) + '</select></label><label class="st-field">Body text<select data-bf="b">' + fontOptions(b.fonts.b) + '</select></label>' +
      '<div class="st-row"><button class="st-btn" data-badd-t="h">Add heading</button><button class="st-btn" data-badd-t="b">Add body text</button><button class="st-btn" data-bapply="1">Apply fonts to design</button></div>' +
      '<h4>Logos</h4><div class="st-upgrid">' + b.logos.map(function (u, i) { return '<div class="st-upi"><button data-bl="' + i + '"><img alt="" src="' + u + '"></button><button class="st-x" data-blx="' + i + '" title="Remove">×</button></div>'; }).join('') + '</div><button class="st-btn st-wide" data-blup="1" style="margin-top:8px">Upload logo</button>';
    function save() { store('sx-brand', b); tabBrand(panel); }
    panel.onchange = function (e) {
      var t = e.target;
      if (t.hasAttribute('data-badd')) { if (b.colors.indexOf(t.value) < 0) b.colors.push(t.value); save(); return; }
      if (t.dataset.bf) { b.fonts[t.dataset.bf] = t.value; S.needFont(t.value); save(); }
    };
    panel.onclick = function (e) {
      var c = e.target.closest('[data-bc]'); if (c) { applyColor(c.dataset.bc); return; }
      var x = e.target.closest('[data-bx]'); if (x) { b.colors.splice(+x.dataset.bx, 1); save(); return; }
      var at = e.target.closest('[data-badd-t]'); if (at) { var h = at.dataset.baddT === 'h'; addTexts([[h ? 'Your heading' : 'Your body text goes here', h ? b.fonts.h : b.fonts.b, h ? 800 : 400, b.colors[0] || '#1B2330', h ? 0.75 : 0.28, 0]]); return; }
      if (e.target.closest('[data-bapply]')) { var objs = cv.getObjects().filter(function (o) { return o.fontSize; }); if (!objs.length) { S.toast('No text on this page yet.'); return; } var big = objs.map(function (o) { return o.fontSize * o.scaleY; }).sort(function (p, q) { return q - p; })[Math.min(1, objs.length - 1)]; objs.forEach(function (o) { o.set('fontFamily', o.fontSize * o.scaleY >= big ? b.fonts.h : b.fonts.b); }); S.fontsFor(objs).then(function () { objs.forEach(function (o) { o.initDimensions(); }); cv.requestRenderAll(); S.record(); S.toast('Brand fonts applied.'); }); return; }
      var l = e.target.closest('[data-bl]'); if (l) { placePicture(b.logos[+l.dataset.bl], 'Logo'); return; }
      var lx = e.target.closest('[data-blx]'); if (lx) { b.logos.splice(+lx.dataset.blx, 1); save(); return; }
      if (e.target.closest('[data-blup]')) S.pickFile('image/*').then(function (fs) { if (!fs[0]) return; S.fileToURL(fs[0]).then(function (u) { return ST.loadImg(u); }).then(function (im) { b.logos.unshift(toDataURL(im, 900, 'image/png')); try { save(); } catch (er) { S.toast('Logo too big to store.'); } }); });
    };
  }
  function applyColor(c) {
    var o = cv.getActiveObject();
    if (!o) { cv.setBackgroundColor(c, function () { cv.requestRenderAll(); S.record(); }); return; }
    (o.type === 'activeSelection' ? o.getObjects() : [o]).forEach(function (x) {
      if (x.icon) recolorIcon(x, c);
      else if (x.type === 'group' && !x.ph) x.getObjects().forEach(function (y) { if (y.fill && typeof y.fill === 'string') y.set('fill', c); });
      else if (x.type !== 'image') x.set(x.type === 'line' ? 'stroke' : 'fill', c);
    });
    cv.requestRenderAll(); S.record(); S.showProps();
  }

  // ---------- Animate tab ----------
  var pageDur = 5;
  function tabAnim(panel) {
    var o = cv.getActiveObject(), single = o && o.type !== 'activeSelection' ? o : null, a = single && single.anim || {};
    panel.innerHTML = '<h3>Animate</h3>' +
      '<div class="st-row" style="margin-bottom:10px"><button class="st-btn st-main" data-ap="play">' + IC.play + 'Play</button><button class="st-btn" data-ap="mp4">' + IC.down + 'MP4 video</button><button class="st-btn" data-ap="gif">' + IC.down + 'GIF</button></div>' +
      '<label class="st-rng">Page length<input type="range" data-ad="page" min="2" max="15" step="0.5" value="' + pageDur + '"><output>' + pageDur + 's</output></label>' +
      '<h4>Animate the whole page</h4><div class="sx-anims" data-scope="all">' + ['rise', 'fade', 'pop', 'pan', 'drop', 'zoom', 'typer', 'wipe'].map(function (k) { return animCard(k, false); }).join('') + '<button class="sx-anim" data-an="none"><i class="sx-a-none"></i>None</button></div>' +
      '<h4>' + (single ? 'Selected item' : 'Select an item on the page to animate it on its own') + '</h4>' +
      (single ? '<div class="sx-anims" data-scope="one">' + ANIMS.map(function (x) { return animCard(x[0], a.t === x[0]); }).join('') + '<button class="sx-anim" data-an="none" aria-pressed="' + !a.t + '"><i class="sx-a-none"></i>None</button></div>' +
        rngA('d', 'Speed (s)', 0.2, 3, 0.1, a.d || 0.8) + rngA('dl', 'Start after (s)', 0, 10, 0.1, a.dl || 0) : '') +
      '<p class="st-note">Download MP4 for WhatsApp status, Reels and Shorts, or GIF for chats. Several pages play one after another.</p>';
    function rngA(k, l, mn, mx, st, v) { return '<label class="st-rng">' + l + '<input type="range" data-ad="' + k + '" min="' + mn + '" max="' + mx + '" step="' + st + '" value="' + v + '"><output>' + v + '</output></label>'; }
    panel.onclick = function (e) {
      var p = e.target.closest('[data-ap]'); if (p) { if (p.dataset.ap === 'play') preview(); else exportVideo(p.dataset.ap); return; }
      var c = e.target.closest('[data-an]'); if (!c) return;
      var k = c.dataset.an === 'none' ? null : c.dataset.an, scope = c.closest('[data-scope]').dataset.scope;
      if (scope === 'all') {
        var objs = cv.getObjects().filter(function (x) { return x.visible !== false; }), i = 0;
        objs.forEach(function (x) { var b = x.getBoundingRect(true, true), full = b.width >= S.doc.w * 0.9 && b.height >= S.doc.h * 0.9; if (!k || full) { delete x.anim; return; } x.anim = { t: k === 'typer' && !x.fontSize ? 'fade' : k, d: 0.8, dl: Math.round(i * 0.18 * 100) / 100 }; i++; });
      } else if (single) { if (k) single.anim = { t: k, d: (single.anim && single.anim.d) || 0.8, dl: (single.anim && single.anim.dl) || 0 }; else delete single.anim; }
      S.record(); tabAnim(panel); if (k) preview();
    };
    panel.oninput = function (e) {
      var t = e.target, k = t.dataset.ad; if (!k) return; var out = t.nextElementSibling;
      if (k === 'page') { pageDur = +t.value; if (out) out.textContent = pageDur + 's'; return; }
      if (single && single.anim) { single.anim[k] = +t.value; if (out) out.textContent = t.value; }
    };
    panel.onchange = function (e) { if (e.target.dataset.ad && e.target.dataset.ad !== 'page') S.record(); };
  }
  function animCard(k, on) { var n = (ANIMS.filter(function (x) { return x[0] === k; })[0] || [k, k])[1]; return '<button class="sx-anim" data-an="' + k + '" aria-pressed="' + !!on + '"><i class="sx-a-' + k + '"></i>' + n + '</button>'; }
  var playing = null;
  function preview() {
    if (playing) { playing.stop(); return; }
    cv.discardActiveObject();
    var an = animator(cv, S.doc.w, S.doc.h); if (!an.count) { S.toast('Choose an animation first.'); return; }
    var dur = Math.max(pageDur, an.end + 0.6), t0 = performance.now(), raf = 0;
    function stop() { cancelAnimationFrame(raf); an.reset(); playing = null; }
    function loop(now) { var t = (now - t0) / 1000; if (t > dur) { stop(); return; } an.frame(t); raf = requestAnimationFrame(loop); }
    playing = { stop: stop }; raf = requestAnimationFrame(loop);
  }

  // ---------- video & GIF export ----------
  function exportVideo(kind) {
    if (playing) playing.stop();
    S.saveCur(); var doc = S.doc, pages = doc.pages, W = doc.w, H = doc.h;
    var maxSide = kind === 'gif' ? 640 : 1920, k = Math.min(1, maxSide / Math.max(W, H)), ow = Math.round(W * k / 2) * 2, oh = Math.round(H * k / 2) * 2;
    var el0 = document.createElement('canvas'); el0.width = ow; el0.height = oh;
    var sc = new F.StaticCanvas(el0, { width: ow, height: oh, enableRetinaScaling: false, renderOnAddRemove: false }); sc.setZoom(ow / W);
    function loadPage(i) { return new Promise(function (r) { var j = S.fillJSON(clone(pages[i])); S.fontsFor(j.objects || []).then(function () { sc.loadFromJSON(j, function () { sc.getObjects().filter(function (o) { return o.ph && o.type === 'group'; }).forEach(function (o) { sc.remove(o); }); sc.setZoom(ow / W); sc.setDimensions({ width: ow, height: oh }); r(animator(sc, W, H)); }); }); }); }
    if (kind === 'gif') return gifExport(); return videoExport();
    function videoExport() {
      if (!window.MediaRecorder || !el0.captureStream) { S.toast('This browser cannot make videos — try Chrome.'); return; }
      var types = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'], mt = types.filter(function (t) { return MediaRecorder.isTypeSupported(t); })[0] || '';
      var stream = el0.captureStream(30), rec = new MediaRecorder(stream, { mimeType: mt, videoBitsPerSecond: 8e6 }), chunks = [];
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      var i = 0; S.busy(true, 'Making your video…');
      rec.onstop = function () { S.busy(false); var ext = /mp4/.test(mt) ? 'mp4' : 'webm', blob = new Blob(chunks, { type: mt.split(';')[0] || 'video/webm' }); S.saveURL(S.fname(ext), URL.createObjectURL(blob)); sc.dispose(); S.toast(ext === 'mp4' ? 'MP4 video saved.' : 'Video saved (WebM). WhatsApp and YouTube accept it; for MP4 use Chrome on a computer.'); };
      function playPage() {
        if (i >= pages.length) { setTimeout(function () { rec.stop(); }, 120); return; }
        S.busy(true, 'Recording page ' + (i + 1) + ' of ' + pages.length + '…');
        loadPage(i).then(function (an) {
          var dur = Math.max(pageDur, an.end + 0.8), t0 = performance.now();
          if (i === 0) rec.start(250);
          (function loop(now) { var t = (now - t0) / 1000; an.frame(Math.min(t, dur)); if (t < dur) requestAnimationFrame(loop); else { i++; playPage(); } })(t0);
        });
      }
      playPage();
    }
    function gifExport() {
      if (!window.gifenc) { S.toast('GIF maker did not load.'); return; }
      var G = window.gifenc, gif = G.GIFEncoder(), fps = 12, i = 0, ctx = el0.getContext('2d', { willReadFrequently: true });
      S.busy(true, 'Making your GIF…');
      function page() {
        if (i >= pages.length) { gif.finish(); S.busy(false); sc.dispose(); S.saveURL(S.fname('gif'), URL.createObjectURL(new Blob([gif.bytes()], { type: 'image/gif' }))); S.toast('GIF saved.'); return; }
        loadPage(i).then(function (an) {
          var dur = Math.max(Math.min(pageDur, 8), an.end + 0.6), n = Math.round(dur * fps), f = 0;
          (function step() {
            for (var c = 0; c < 3 && f < n; c++, f++) {
              an.frame(f / fps);
              var data = ctx.getImageData(0, 0, ow, oh).data, pal = G.quantize(data, 256, { format: 'rgb565' }), idx = G.applyPalette(data, pal, 'rgb565');
              gif.writeFrame(idx, ow, oh, { palette: pal, delay: Math.round(1000 / fps) });
            }
            S.busy(true, 'Making your GIF… ' + Math.round(((i + f / n) / pages.length) * 100) + '%');
            if (f < n) setTimeout(step, 0); else { i++; page(); }
          })();
        });
      }
      page();
    }
  }

  // ---------- Magic Resize ----------
  function magicResize() {
    var cur = S.doc, list = S.sizes.filter(function (z) { return !(z.w === cur.w && z.h === cur.h); });
    var m = S.modal('Magic Resize', '<p class="st-note" style="margin-top:0">Pick one or more sizes. Everything on your design is moved and scaled to fit the new shape.</p><div class="sx-rsz">' + list.map(function (z) { return '<label class="sx-rszi"><input type="checkbox" value="' + z.k + '"><b>' + esc(z.short || z.label) + '</b><small>' + esc(z.dim || (z.w + ' × ' + z.h)) + '</small></label>'; }).join('') + '</div>' +
      '<details class="st-custom"><summary>Custom size (pixels)</summary><div class="st-row"><label class="st-field">Width<input type="number" data-rw value="1080"></label><label class="st-field">Height<input type="number" data-rh value="1350"></label></div><label class="st-check"><input type="checkbox" data-rc> Use custom size</label></details>',
      '<button class="st-btn" data-c="x">Cancel</button><button class="st-btn" data-c="copy">Copy &amp; resize</button><button class="st-btn st-main" data-c="ok">Resize</button>', false);
    var body = m.querySelector('.st-boxbody'), foot = m.querySelector('.st-boxfoot');
    function targets() {
      var t = [].map.call(body.querySelectorAll('.sx-rsz input:checked'), function (i) { return S.sizeById(i.value); });
      if (body.querySelector('[data-rc]').checked) { var w = +body.querySelector('[data-rw]').value, h = +body.querySelector('[data-rh]').value; if (w >= 50 && h >= 50) t.push({ k: 'custom', w: Math.min(w, 4000), h: Math.min(h, 4000), short: 'Custom ' + w + '×' + h }); }
      return t;
    }
    foot.querySelector('[data-c=x]').onclick = function () { m.close(); };
    function run(copy) {
      var t = targets(); if (!t.length) { S.toast('Tick at least one size.'); return; }
      if (!copy && t.length > 1) { S.toast('“Resize” changes this design to one size. For several sizes use “Copy & resize”.'); return; }
      m.close(); S.saveCur(); S.busy(true, 'Resizing…');
      var src = clone(S.doc.pages), W1 = S.doc.w, H1 = S.doc.h, made = [];
      var chain = Promise.resolve();
      if (copy) chain = chain.then(function () { return saveAsDraft(S.docSnapshot(), 'Original ' + W1 + '×' + H1); });
      t.forEach(function (z) {
        chain = chain.then(function () { return Promise.all(src.map(function (p) { return smartPage(p, W1, H1, z.w, z.h, S.PROPS); })); }).then(function (pages) {
          var snap = { tool: S.cfg.tool, w: z.w, h: z.h, mm: z.mm || [z.w * 25.4 / 96, z.h * 25.4 / 96], pages: pages, pageNames: S.doc.pageNames, tplId: null, cur: 0 };
          made.push([z, snap]); if (copy) return saveAsDraft(snap, (z.short || z.label || 'Custom') + ' copy');
        });
      });
      chain.then(function () { return S.openSnapshot(made[0][1]); }).then(function () { S.setTouched(); S.autosave(); S.busy(false); S.renderTab(); S.toast(copy && made.length > 1 ? made.length + ' resized copies saved in “My drafts” (Templates tab). Showing the first.' : 'Resized to ' + (made[0][0].short || made[0][0].label) + '.'); })
        .catch(function (e) { S.busy(false); S.toast('Resize failed: ' + (e && e.message || e)); });
    }
    foot.querySelector('[data-c=ok]').onclick = function () { run(false); };
    foot.querySelector('[data-c=copy]').onclick = function () { run(true); };
  }
  function saveAsDraft(snap, name) {
    var s = clone(snap); s.id = 'd' + Date.now() + Math.random().toString(36).slice(2, 5); s.name = name; s.at = Date.now();
    return S.renderJSON(s.pages[0], s.w, s.h, 160 / Math.max(s.w, s.h)).then(function (c) { s.thumb = c.toDataURL('image/jpeg', 0.7); return S.dbDo('drafts', 'readwrite', function (st) { return st.put(s); }); });
  }

  // ---------- SVG export ----------
  function exportSVG() {
    S.saveCur(); var doc = S.doc;
    var sc0 = new F.StaticCanvas(null, { width: doc.w, height: doc.h });
    return new Promise(function (r) {
      sc0.loadFromJSON(S.fillJSON(clone(doc.pages[S.cur()])), function () {
        sc0.getObjects().filter(function (o) { return o.ph && o.type === 'group'; }).forEach(function (o) { sc0.remove(o); });
        var out = sc0.toSVG({ width: doc.mm[0] + 'mm', height: doc.mm[1] + 'mm', viewBox: { x: 0, y: 0, width: doc.w, height: doc.h } }); sc0.dispose();
        S.saveURL(S.fname('svg'), URL.createObjectURL(new Blob([out], { type: 'image/svg+xml' }))); S.toast('SVG saved.'); r(true);
      });
    });
  }

  // ---------- one-click background remover for pictures ----------
  function removeBg(o) {
    var src = o.getElement(); if (!src) return;
    var c = document.createElement('canvas'), cw = Math.round(o.width), ch = Math.round(o.height); c.width = cw; c.height = ch;
    c.getContext('2d').drawImage(src, o.cropX || 0, o.cropY || 0, cw, ch, 0, 0, cw, ch);
    S.busy(true, 'Removing the background…');
    S.matte(c).then(function (cut) {
      var url = cut.toDataURL('image/png'), sx = o.scaleX, sy = o.scaleY;
      o.setSrc(url, function () { o.set({ cropX: 0, cropY: 0, scaleX: sx * cw / o.width, scaleY: sy * ch / o.height }); if (o.filters && o.filters.length) try { o.applyFilters(); } catch (e) {} o.srcOrig = url; S.busy(false); cv.requestRenderAll(); S.record(); S.toast('Background removed.'); });
    }, function (er) { S.busy(false); S.toast((er && er.message) || 'Background removal failed.'); });
  }

  // ---------- install into a studio ----------
  Pro.tabs = [
    { k: 'text', label: 'Text', icon: IC.text, render: tabText },
    { k: 'brand', label: 'Brand', icon: IC.brand, render: tabBrand },
    { k: 'photos', label: 'Photos', icon: IC.photos, render: tabPhotos },
    { k: 'charts', label: 'Charts', icon: IC.charts, render: tabCharts },
    { k: 'anim', label: 'Animate', icon: IC.anim, render: tabAnim }
  ];
  Pro.order = ['tpl', 'els', 'text', 'brand', 'up', 'photos', 'charts', 'draw', 'anim', 'ai', 'page', 'layers'];
  Pro.icons = { tpl: IC.design, els: IC.els, up: IC.up, draw: IC.draw, ai: IC.ai, page: IC.page, layers: IC.layers };
  Pro.install = function (studio) {
    S = studio; cv = S.canvas;
    ['anim', 'chart', 'icon'].forEach(function (k) { if (S.PROPS.indexOf(k) < 0) S.PROPS.push(k); });
    // rail icons
    [].forEach.call(S.tabsEl.querySelectorAll('[data-t]'), function (b) { var ic = Pro.icons[b.dataset.t]; if (ic) b.innerHTML = ic + '<span>' + b.textContent + '</span>'; else { var s = b.querySelector('svg'); var txt = b.textContent; b.innerHTML = (s ? s.outerHTML : '') + '<span>' + txt + '</span>'; } if (b.dataset.t === 'tpl') b.querySelector('span').textContent = 'Design'; if (b.dataset.t === 'page') b.querySelector('span').textContent = 'Background'; });
    // top bar
    var top = S.top, name = store('sx-name') || 'Untitled design';
    top.classList.add('sx-top');
    top.innerHTML = '<a class="sx-home" href="../index.html" title="S Printer home"><span>S</span></a>' +
      '<div class="sx-menu"><button class="sx-tb" data-x="file">' + IC.menu + '<span>File</span></button><div class="sx-drop" hidden><button data-x="new">New design</button><button data-a="draft">Save as draft</button><button data-x="drafts">My drafts</button><button data-x="svg">Download SVG</button><button data-a="print">Print</button></div></div>' +
      '<button class="sx-tb" data-x="resize">' + IC.resize + '<span>Resize</span></button>' +
      '<button class="sx-tb sx-ic" data-a="undo" title="Undo (Ctrl+Z)">' + ST.icons.undo + '</button><button class="sx-tb sx-ic" data-a="redo" title="Redo (Ctrl+Y)">' + ST.icons.redo + '</button>' +
      '<span class="st-sp"></span><input class="sx-name" value="' + esc(name) + '" aria-label="Design name" maxlength="60">' +
      '<button class="sx-tb sx-ghost" data-x="play" title="Play animations">' + IC.play + '<span>Play</span></button>' +
      '<button class="sx-tb sx-ghost" data-a="share">' + ST.icons.share + '<span>Share</span></button>' +
      '<div class="sx-menu"><button class="sx-tb sx-cta" data-x="dl">' + IC.down + '<span>Download</span></button><div class="sx-drop sx-right" hidden>' +
      '<button data-a="png"><b>PNG</b><small>Best quality image</small></button><button data-a="jpg"><b>JPG</b><small>Small file size</small></button><button data-x="tpng"><b>PNG transparent</b><small>No background</small></button>' +
      '<button data-a="pdf"><b>PDF</b><small>For printing</small></button><button data-x="svg"><b>SVG</b><small>Vector</small></button><button data-x="mp4"><b>MP4 video</b><small>With animations</small></button><button data-x="gif"><b>GIF</b><small>Animated</small></button><button data-a="print"><b>Print</b><small>Print now</small></button></div></div>';
    S.cfg.file = name.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'Design';
    top.querySelector('.sx-name').oninput = function (e) { store('sx-name', e.target.value); S.cfg.file = e.target.value.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'Design'; };
    function closeMenus(ex) { [].forEach.call(top.querySelectorAll('.sx-drop'), function (d) { if (d !== ex) d.hidden = true; }); }
    top.addEventListener('click', function (e) {
      var x = e.target.closest('[data-x]'); if (!e.target.closest('.sx-drop')) closeMenus(x && x.nextElementSibling);
      if (e.target.closest('.sx-drop [data-a]')) closeMenus();
      if (!x) return; e.stopPropagation(); var k = x.dataset.x;
      if (k === 'file' || k === 'dl') { var d = x.nextElementSibling; d.hidden = !d.hidden; return; }
      closeMenus();
      if (k === 'resize') magicResize();
      else if (k === 'new' || k === 'drafts') { S.selectTab('tpl'); }
      else if (k === 'play') { S.selectTab('anim'); preview(); }
      else S.extExport(k);
    }, true);
    document.addEventListener('click', function (e) { if (!e.target.closest('.sx-menu')) closeMenus(); });
    // zoom bar
    var zb = el('div', 'sx-zoombar', '<button data-z="dup" title="Duplicate this page">+ Copy page</button><button data-z="fit" title="Fit to screen">Fit</button><input type="range" min="10" max="300" value="100" aria-label="Zoom"><b>100%</b>');
    S.stage.parentNode.appendChild(zb);
    var zr = zb.querySelector('input'), zl = zb.querySelector('b');
    function syncZoom() { var z = Math.round(S.zoom() * 100); zr.value = z; zl.textContent = z + '%'; }
    zr.oninput = function () { S.setZoom(zr.value / 100); syncZoom(); };
    zb.querySelector('[data-z=fit]').onclick = function () { S.fit(); syncZoom(); };
    zb.querySelector('[data-z=dup]').onclick = function () { S.saveCur(); var i = S.cur(); S.doc.pages.splice(i + 1, 0, clone(S.doc.pages[i])); if (S.doc.pageNames) S.doc.pageNames.splice(i + 1, 0, (S.doc.pageNames[i] || 'Page') + ' copy'); S.loadPage(i + 1).then(function () { S.autosave(); S.toast('Page copied.'); }); };
    setInterval(function () { if (document.activeElement !== zr) syncZoom(); }, 700);
    // panel collapse on desktop (like a real editor)
    S.tabsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-t]'); if (!b || S.mobile()) return;
      if (b.getAttribute('aria-selected') === 'true' && !S.app.classList.contains('sx-collapsed')) { S.app.classList.add('sx-collapsed'); e.stopPropagation(); setTimeout(S.fit, 260); return; }
      if (S.app.classList.contains('sx-collapsed')) { S.app.classList.remove('sx-collapsed'); setTimeout(S.fit, 260); }
    }, true);
    // hooks
    S.elsHook = elsHook;
    S.propsHook = function (o, h, info) {
      var add = '';
      if (o.icon && o.icon.color) add += '<input type="color" data-p="xicc" value="' + o.icon.color + '" title="Icon colour">';
      if (o.chart) add += '<button class="st-pb" data-p="xchart">' + ST.icons.edit + 'Edit chart</button>';
      if (info.isImg && !o.art && !o.qr && !o.bc && !o.icon) add += '<button class="st-pb" data-p="xbg">' + IC.bg + 'BG remover</button>';
      add += '<button class="st-pb" data-p="xanim">' + IC.anim + 'Animate</button>';
      return h.replace('<button class="st-pb" data-p="cstyle"', add + '<button class="st-pb" data-p="cstyle"');
    };
    S.extAct = function (p, o, val) {
      if (p === 'xbg') removeBg(o);
      else if (p === 'xchart') editChart(o);
      else if (p === 'xanim') S.selectTab('anim');
      else if (p === 'xicc' && o.icon) recolorIcon(o, val);
    };
    S.extExport = function (a) {
      if (a === 'mp4') { exportVideo('mp4'); return true; }
      if (a === 'gif') { exportVideo('gif'); return true; }
      if (a === 'svg') return exportSVG();
      if (a === 'tpng') { S.transparent = true; var p = S.doExport('png'); return Promise.resolve(p).then(function () { S.transparent = false; return true; }); }
      return null;
    };
    cv.on('mouse:dblclick', function (e) { if (e.target && e.target.chart) editChart(e.target); });
    cv.on('selection:created', function () { if (S.mobile() && !S.panel.hidden) { S.panel.hidden = true; [].forEach.call(S.tabsEl.children, function (b) { b.setAttribute('aria-selected', 'false'); }); } });
    cv.on('selection:created', function () { if (S.panel && S.tabsEl.querySelector('[data-t=anim][aria-selected=true]') && !S.panel.hidden) tabAnim(S.panel); });
    cv.on('selection:updated', function () { if (S.tabsEl.querySelector('[data-t=anim][aria-selected=true]') && !S.panel.hidden) tabAnim(S.panel); });
    setTimeout(S.fit, 300);
  };
  Pro.buildChart = buildChart; Pro.smartPage = smartPage; Pro.animator = animator;
})();
