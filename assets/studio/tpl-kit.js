/* S Printer — Design Studio template kit: small builders, palettes and ornaments
 * shared by every tool's templates. Original designs by S Printer. */
(function () {
  'use strict';
  var K = (window.SPStudio = window.SPStudio || {}).K = {};
  function ex(o, a) { if (a) for (var k in a) o[k] = a[k]; return o; }
  K.R = function (x, y, w, h, fill, o) { return ex({ t: 'rect', x: x, y: y, w: w, h: h, fill: fill }, o); };
  K.C = function (x, y, r, fill, o) { return ex({ t: 'circle', x: x - r, y: y - r, rr: r, fill: fill }, o); };   // centre x,y
  K.L = function (x1, y1, x2, y2, stroke, sw, o) { return ex({ t: 'line', x1: x1, y1: y1, x2: x2, y2: y2, stroke: stroke, sw: sw || 2 }, o); };
  K.T = function (x, y, w, text, size, o) { return ex({ t: 'text', x: x, y: y, w: w, text: text, size: size }, o); };
  K.P = function (x, y, w, h, ph, o) { return ex({ t: 'photo', x: x, y: y, w: w, h: h, ph: ph || 'PHOTO' }, o); };
  K.Q = function (x, y, s, data, o) { return ex({ t: 'qr', x: x, y: y, s: s, data: data }, o); };
  K.B = function (x, y, w, h, data, o) { return ex({ t: 'barcode', x: x, y: y, w: w, h: h, data: data }, o); };
  K.POLY = function (pts, fill, o) { return ex({ t: 'poly', pts: pts, fill: fill }, o); };
  K.PATH = function (d, fill, o) { return ex({ t: 'path', d: d, fill: fill }, o); };
  K.A = function (id, x, y, w, h, o) { var A = (window.SPStudio.ART || {})[id], hh = h; if (A && hh == null) hh = w * A.h / A.w; return ex({ t: 'art', art: id, x: x, y: y, w: w, h: hh }, o); };   // illustration / sticker
  K.G = function (angle) { return { angle: angle, stops: [].slice.call(arguments, 1) }; };

  // a wave across the page: fills above (top) or below (bottom) the wave line
  K.wave = function (W, H, y, amp, fill, bottom, o) {
    var d = 'M0 ' + y + ' C ' + W * 0.25 + ' ' + (y - amp) + ', ' + W * 0.5 + ' ' + (y + amp) + ', ' + W * 0.75 + ' ' + (y - amp * 0.4) + ' S ' + W + ' ' + (y + amp * 0.3) + ', ' + W + ' ' + y;
    d += bottom ? ' L ' + W + ' ' + H + ' L 0 ' + H + ' Z' : ' L ' + W + ' 0 L 0 0 Z';
    return K.PATH(d, fill, o);
  };
  // star / sun burst polygon
  K.burst = function (cx, cy, R, r, n, fill, o) { var p = []; for (var i = 0; i < n * 2; i++) { var a = Math.PI / n * i - Math.PI / 2, rr = i % 2 ? r : R; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return K.POLY(p, fill, o); };
  // mandala made of petals (rotated ellipses as polygons) and rings
  K.mandala = function (cx, cy, R, col, col2, op) {
    var out = [], n = 16;
    for (var ring = 0; ring < 3; ring++) {
      var rr = R * (1 - ring * 0.28), pw = rr * 0.22, m = n - ring * 4;
      for (var i = 0; i < m; i++) {
        var a = Math.PI * 2 / m * i, pts = [];
        for (var k = 0; k <= 12; k++) { var t = Math.PI * k / 12, px = Math.cos(t) * rr * 0.5, py = Math.sin(t) * pw; pts.push([px, py]); }
        for (k = 12; k >= 0; k--) { t = Math.PI * k / 12; pts.push([Math.cos(t) * rr * 0.5, -Math.sin(t) * pw]); }
        out.push(K.POLY(pts.map(function (p) { var x = p[0] + rr * 0.5, y = p[1]; return [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]; }), ring % 2 ? col2 : col, { op: op == null ? 0.9 : op }));
      }
    }
    out.push(K.C(cx, cy, R * 0.16, col2, { op: op }));
    out.push(K.C(cx, cy, R * 0.09, col, { op: op }));
    return out;
  };
  // corner flourish (quarter rings + dots) for a frame corner; sx/sy = +1/-1 direction
  K.corner = function (x, y, s, sx, sy, col) {
    var out = [];
    [1, 0.72, 0.46].forEach(function (k, i) {
      var r = s * k, d = 'M ' + x + ' ' + (y + sy * r) + ' A ' + r + ' ' + r + ' 0 0 ' + (sx * sy > 0 ? 1 : 0) + ' ' + (x + sx * r) + ' ' + y;
      out.push(K.PATH(d, null, { stroke: col, sw: i ? 1.5 : 3 }));
    });
    out.push(K.C(x + sx * s * 0.25, y + sy * s * 0.25, s * 0.07, col));
    out.push(K.C(x + sx * s * 1.12, y + sy * s * 0.1, s * 0.05, col));
    out.push(K.C(x + sx * s * 0.1, y + sy * s * 1.12, s * 0.05, col));
    return out;
  };
  // double border frame with corner flourishes
  K.frame = function (W, H, m, col, col2, flour) {
    var out = [K.R(m, m, W - 2 * m, H - 2 * m, null, { stroke: col, sw: Math.max(3, W / 200) }), K.R(m + W * 0.012, m + W * 0.012, W - 2 * m - W * 0.024, H - 2 * m - W * 0.024, null, { stroke: col2 || col, sw: 1.2 })];
    if (flour) { var s = Math.min(W, H) * 0.09, i = m + W * 0.02; out = out.concat(K.corner(i, i, s, 1, 1, col), K.corner(W - i, i, s, -1, 1, col), K.corner(i, H - i, s, 1, -1, col), K.corner(W - i, H - i, s, -1, -1, col)); }
    return out;
  };
  // dotted divider with a diamond in the middle
  K.divider = function (cx, y, w, col) {
    return [K.L(cx - w / 2, y, cx - 10, y, col, 1.5), K.L(cx + 10, y, cx + w / 2, y, col, 1.5), K.POLY([[cx, y - 6], [cx + 6, y], [cx, y + 6], [cx - 6, y]], col)];
  };
  // key: value rows (two text boxes per row)
  K.rows = function (x, y, w, rows, size, o) {
    o = o || {}; var out = [], lh = size * (o.gap || 1.75), kw = w * (o.kw || 0.38);
    rows.forEach(function (r, i) {
      var yy = y + i * lh;
      if (o.zebra && i % 2 === 0) out.push(K.R(x - 8, yy - size * 0.35, w + 16, lh, o.zebra, { r: 4 }));
      out.push(K.T(x, yy, kw, r[0], size, { font: o.font || 'Poppins', bold: 600, color: o.kc || '#334155' }));
      out.push(K.T(x + kw, yy, w - kw, (o.colon === false ? '' : ':  ') + r[1], size, { font: o.font || 'Poppins', color: o.vc || '#0f172a' }));
    });
    return out;
  };

  // the text a stack item will really show (typed details), else its estimate
  K.realText = function (it) {
    var ST = window.SPStudio, real = ST.curVals && ST.fillTags && it.text ? ST.fillTags(it.text, ST.curVals) : '';
    return (real && real.trim() ? real : (it.est || it.text)) || ' ';
  };
  // centred column of text lines that always fits between top and bottom (any page size)
  // items: {text,size,font,color,bold,italic,lh,ls,gap,align,stroke,sw,shadow} | {div:col,w} | {space:px}
  K.stack = function (x, w, top, bottom, items, o) {
    o = o || {};
    var mc = (K._mc = K._mc || document.createElement('canvas').getContext('2d'));
    function lines(it) {
      var txt = K.realText(it);
      mc.font = (it.bold ? (it.bold === true ? 700 : it.bold) : 400) + ' ' + it.size + 'px "' + (it.font || 'Poppins') + '", Poppins, sans-serif';
      var extra = (it.ls || 0) / 1000 * it.size, lim = w * 0.97;
      return String(txt).split('\n').reduce(function (n, para) {
        var c = 1, line = '';
        para.split(/\s+/).forEach(function (wd) { var t = line ? line + ' ' + wd : wd; if (line && mc.measureText(t).width + t.length * extra > lim) { c++; line = wd; } else line = t; });
        return n + c;
      }, 0);
    }
    function hOf(it, k) { if (it.space) return it.space * k; if (it.div) return 14 * k + (it.gap || 10) * k; return it.size * k * (it.lh || 1.2) * lines({ text: it.text, est: it.est, size: it.size * k, font: it.font, bold: it.bold, ls: it.ls }) * 1.04 + (it.gap == null ? 10 : it.gap) * k; }
    // the widest single word must fit too (a long word cannot wrap)
    function wordsFit(k) {
      return items.every(function (it) {
        if (it.space || it.div || !it.text) return true;
        var txt = K.realText(it), sz = it.size * k;
        mc.font = (it.bold ? (it.bold === true ? 700 : it.bold) : 400) + ' ' + sz + 'px "' + (it.font || 'Poppins') + '", Poppins, sans-serif';
        var extra = (it.ls || 0) / 1000 * sz;
        return String(txt).split(/\s+/).every(function (wd) { return mc.measureText(wd).width + wd.length * extra <= w * 0.86; });
      });
    }
    var k = 1, total = items.reduce(function (a, it) { return a + hOf(it, 1); }, 0);
    k = Math.min(o.maxK || 1.3, (bottom - top) / Math.max(1, total));
    for (var tries = 0; tries < 24; tries++) { total = items.reduce(function (a, it) { return a + hOf(it, k); }, 0); if (total <= bottom - top && wordsFit(k)) break; k *= 0.94; }
    var y = top + (o.valign === 'top' ? 0 : Math.max(0, (bottom - top - total) / 2)), out = [];
    items.forEach(function (it) {
      if (it.space) { y += it.space * k; return; }
      if (it.div) { out = out.concat(K.divider(x + w / 2, y + 7 * k, (it.w || w * 0.5), it.div)); y += 14 * k + (it.gap || 10) * k; return; }
      out.push(K.T(x, y, w, it.text, it.size * k, { font: it.font || 'Poppins', color: it.color || '#111', bold: it.bold, italic: it.italic, lh: it.lh || 1.2, ls: it.ls || 0, align: it.align || 'center', stroke: it.stroke, sw: it.sw, shadow: it.shadow, bg: it.bg }));
      y += hOf(it, k);
    });
    out.endY = y; out.k = k;
    return out;
  };
  K.PAL = {
    blue: { a: '#1e3a8a', b: '#2563eb', c: '#dbeafe', d: '#93c5fd', ink: '#0f172a', soft: '#eff6ff', acc: '#f59e0b' },
    teal: { a: '#134e4a', b: '#0d9488', c: '#ccfbf1', d: '#5eead4', ink: '#0f172a', soft: '#f0fdfa', acc: '#f97316' },
    rose: { a: '#881337', b: '#e11d48', c: '#ffe4e6', d: '#fda4af', ink: '#1f2937', soft: '#fff1f2', acc: '#f59e0b' },
    slate: { a: '#1e293b', b: '#475569', c: '#e2e8f0', d: '#94a3b8', ink: '#0f172a', soft: '#f8fafc', acc: '#0ea5e9' },
    green: { a: '#14532d', b: '#16a34a', c: '#dcfce7', d: '#86efac', ink: '#052e16', soft: '#f0fdf4', acc: '#eab308' },
    purple: { a: '#4c1d95', b: '#7c3aed', c: '#ede9fe', d: '#c4b5fd', ink: '#1e1b4b', soft: '#f5f3ff', acc: '#f472b6' },
    orange: { a: '#7c2d12', b: '#ea580c', c: '#ffedd5', d: '#fdba74', ink: '#1c1917', soft: '#fff7ed', acc: '#0ea5e9' },
    maroon: { a: '#7f1d1d', b: '#b91c1c', c: '#fde68a', d: '#d4a017', ink: '#3b0a0a', soft: '#fffbeb', acc: '#d4a017' },
    gold: { a: '#3b2f0b', b: '#b8860b', c: '#fef3c7', d: '#e6c35c', ink: '#1c1917', soft: '#fffdf5', acc: '#7f1d1d' },
    emerald: { a: '#064e3b', b: '#059669', c: '#d1fae5', d: '#c9a227', ink: '#022c22', soft: '#f0fdf9', acc: '#c9a227' },
    navy: { a: '#0b1d3a', b: '#1d4ed8', c: '#fde68a', d: '#f59e0b', ink: '#0b1d3a', soft: '#f8fafc', acc: '#f59e0b' },
    black: { a: '#111827', b: '#374151', c: '#fde047', d: '#facc15', ink: '#111827', soft: '#f9fafb', acc: '#facc15' }
  };
  K.SIZES = {
    a4p: { k: 'a4p', label: 'A4 portrait (210 × 297 mm)', w: 794, h: 1123, mm: [210, 297] },
    a4l: { k: 'a4l', label: 'A4 landscape (297 × 210 mm)', w: 1123, h: 794, mm: [297, 210] },
    sq: { k: 'sq', label: 'Square post (1080 × 1080)', w: 1080, h: 1080, mm: [152.4, 152.4] },
    story: { k: 'story', label: 'Story / Reel (1080 × 1920)', w: 1080, h: 1920, mm: [101.6, 180.6] },
    hd: { k: 'hd', label: 'HD banner (1920 × 1080)', w: 1920, h: 1080, mm: [508, 285.75] },
    card: { k: 'card', label: 'Card sticker / skin (85.6 × 54 mm)', w: 1012, h: 638, mm: [85.6, 54] },
    cardp: { k: 'cardp', label: 'Card sticker vertical (54 × 85.6 mm)', w: 638, h: 1012, mm: [54, 85.6] },
    idl: { k: 'idl', label: 'ID card landscape (85.6 × 54 mm)', w: 1012, h: 638, mm: [85.6, 54] },
    idp: { k: 'idp', label: 'ID card portrait (54 × 85.6 mm)', w: 638, h: 1012, mm: [54, 85.6] },
    a5p: { k: 'a5p', label: 'A5 portrait (148 × 210 mm)', w: 559, h: 794, mm: [148, 210] },
    igp: { k: 'igp', label: 'Instagram portrait post (1080 × 1350)', w: 1080, h: 1350, mm: [152.4, 190.5] },
    fbpost: { k: 'fbpost', label: 'Facebook post / link (1200 × 630)', w: 1200, h: 630, mm: [254, 133.35] },
    fbcover: { k: 'fbcover', label: 'Facebook cover (1640 × 624)', w: 1640, h: 624, mm: [434, 165] },
    yt: { k: 'yt', label: 'YouTube thumbnail (1280 × 720)', w: 1280, h: 720, mm: [338.7, 190.5] },
    ytbanner: { k: 'ytbanner', label: 'YouTube channel banner (2560 × 1440)', w: 2560, h: 1440, mm: [677.3, 381] },
    a3p: { k: 'a3p', label: 'A3 poster (297 × 420 mm)', w: 1123, h: 1587, mm: [297, 420] },
    bcard: { k: 'bcard', label: 'Business / visiting card (89 × 51 mm)', w: 1051, h: 602, mm: [89, 51] },
    logo: { k: 'logo', label: 'Logo (500 × 500)', w: 500, h: 500, mm: [132.3, 132.3] },
    inv: { k: 'inv', label: 'Invitation 5 × 7 in', w: 960, h: 1344, mm: [127, 177.8] }
  };
  var SH = { a4p: ['A4 document', '210 × 297 mm'], a4l: ['A4 landscape', '297 × 210 mm'], sq: ['Instagram post', '1080 × 1080'], story: ['Story / Reel / Status', '1080 × 1920'], hd: ['Presentation', '1920 × 1080'], card: ['Card sticker', '85.6 × 54 mm'], idl: ['ID card', '85.6 × 54 mm'], idp: ['ID card (tall)', '54 × 85.6 mm'], a5p: ['A5 flyer', '148 × 210 mm'], igp: ['Instagram portrait', '1080 × 1350'], fbpost: ['Facebook post', '1200 × 630'], fbcover: ['Facebook cover', '1640 × 624'], yt: ['YouTube thumbnail', '1280 × 720'], ytbanner: ['YouTube banner', '2560 × 1440'], a3p: ['A3 poster', '297 × 420 mm'], bcard: ['Visiting card', '89 × 51 mm'], logo: ['Logo', '500 × 500'], inv: ['Invitation', '5 × 7 in'] };
  Object.keys(SH).forEach(function (k) { K.SIZES[k].short = SH[k][0]; K.SIZES[k].dim = SH[k][1]; });
  // expand layouts × palettes into template entries
  K.expand = function (prefix, layouts, pals) {
    var out = [];
    layouts.forEach(function (L, li) {
      (L.pals || pals).forEach(function (pk, pi) {
        var pal = K.PAL[pk] || pk;
        out.push({ id: prefix + '-' + (L.id || li) + '-' + pk, name: L.name + (pi ? ' · ' + pk[0].toUpperCase() + pk.slice(1) : ''), cat: L.cat, sizes: L.sizes, pal: pal, build: L.build });
      });
    });
    return out;
  };
})();
