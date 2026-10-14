/* S Printer — more wedding invitation designs: Bengali, Christian, temple, royal, botanical, arch, couple photo,
 * crescent night, reception, save-the-date and phulkari. Original designs by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P;
  var invite = K.invite, sc = K.mgScale, INV = ['a4p', 'sq', 'story', 'a4l'];
  function leaf(cx, cy, len, ang, fill, op) {
    var a = ang * Math.PI / 180, w = len * 0.4;
    function pt(x, y) { return (cx + x * Math.cos(a) - y * Math.sin(a)).toFixed(1) + ' ' + (cy + x * Math.sin(a) + y * Math.cos(a)).toFixed(1); }
    return K.PATH('M ' + pt(0, 0) + ' Q ' + pt(len * 0.5, -w) + ' ' + pt(len, 0) + ' Q ' + pt(len * 0.5, w) + ' ' + pt(0, 0) + ' Z', fill, { op: op == null ? 1 : op });
  }
  function sprig(x, y, s, ang, c1, c2) {   // a stem with leaves
    var out = [], a = ang * Math.PI / 180, len = 260 * s;
    out.push(L(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, c1, 3 * s));
    for (var i = 1; i <= 6; i++) {
      var t = i / 7, px = x + Math.cos(a) * len * t, py = y + Math.sin(a) * len * t, l = (70 - i * 5) * s;
      out.push(leaf(px, py, l, ang - 50, i % 2 ? c1 : c2, 0.95), leaf(px, py, l, ang + 50, i % 2 ? c2 : c1, 0.95));
    }
    out.push(leaf(x + Math.cos(a) * len, y + Math.sin(a) * len, 60 * s, ang, c1));
    return out;
  }
  function archPath(x, y, w, h) { return 'M ' + x + ' ' + (y + h) + ' L ' + x + ' ' + (y + w / 2) + ' A ' + (w / 2) + ' ' + (w / 2) + ' 0 0 1 ' + (x + w) + ' ' + (y + w / 2) + ' L ' + (x + w) + ' ' + (y + h) + ' Z'; }
  function lantern(x, y, s, col, len) {
    return [L(x, 0, x, y, col, 1.5 * s), K.POLY([[x - 16 * s, y + 12 * s], [x, y], [x + 16 * s, y + 12 * s]], col), R(x - 18 * s, y + 12 * s, 36 * s, 52 * s, col, { r: 8 * s, op: 0.9 }), R(x - 10 * s, y + 20 * s, 20 * s, 36 * s, '#fde68a', { r: 5 * s, op: 0.85 }), K.POLY([[x - 12 * s, y + 64 * s], [x + 12 * s, y + 64 * s], [x, y + 78 * s]], col)];
  }
  var layouts = [
    { id: 'bengali', name: 'শুভ বিবাহ Bengali', cat: 'Bengali', sizes: INV, pals: ['maroon', 'rose'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H) * 0.045, o = [R(0, 0, W, H, p.b), R(m, m, W - 2 * m, H - 2 * m, '#fffaf2')];
      for (var x = m / 2; x < W; x += 26 * s) o.push(C(x, m / 2, 4 * s, '#fff'), C(x, H - m / 2, 4 * s, '#fff'));
      for (var y = m * 1.5; y < H - m; y += 26 * s) o.push(C(m / 2, y, 4 * s, '#fff'), C(W - m / 2, y, 4 * s, '#fff'));
      [[m, m], [W - m, m], [m, H - m], [W - m, H - m]].forEach(function (c) { o = o.concat(K.mandala(c[0], c[1], Math.min(W, H) * 0.14, p.b, p.d, 0.28)); });
      o = o.concat(K.mandala(W / 2, m + Math.min(W, H) * 0.08, Math.min(W, H) * 0.06, p.b, p.d, 0.9));
      o = o.concat(invite(W, H, { d: p.b, c: p.a }, { top: 'শ্রী শ্রী প্রজাপতয়ে নমঃ', topFont: 'Hind Siliguri', head: 'শুভ বিবাহ', headFont: 'Galada', ink: '#3b1d12', name: p.a, weds: '&', top0: m + Math.min(W, H) * 0.16 }));
      return { pages: [{ bg: p.b, objects: o }] };
    } },
    { id: 'christian', name: 'Holy Matrimony', cat: 'Christian', sizes: INV, pals: ['navy', 'slate', 'gold'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H) * 0.05, o = [R(0, 0, W, H * 0.3, K.G(90, p.soft, '#ffffff')), R(m, m, W - 2 * m, H - 2 * m, null, { stroke: p.b, sw: 2 * s }), R(m + 8 * s, m + 8 * s, W - 2 * m - 16 * s, H - 2 * m - 16 * s, null, { stroke: p.d, sw: 1 * s })];
      var cx = W / 2, cy = m + 34 * s;
      o.push(R(cx - 5 * s, cy, 10 * s, 64 * s, p.d, { r: 2 * s }), R(cx - 22 * s, cy + 16 * s, 44 * s, 10 * s, p.d, { r: 2 * s }));
      o.push(C(W / 2 - 16 * s, H - m - 50 * s, 22 * s, null, { stroke: p.d, sw: 4 * s }), C(W / 2 + 16 * s, H - m - 50 * s, 22 * s, null, { stroke: p.b, sw: 4 * s }));
      o = o.concat(invite(W, H, { d: p.b, c: p.a }, { top: '“What God has joined together, let no one separate.” — Mark 10:9', topFont: 'Cormorant Garamond', head: 'Holy Matrimony', ink: '#334155', name: p.a, nameFont: 'Playfair Display', weds: 'and', top0: m + 116 * s }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'temple', name: 'Temple Toran', cat: 'Hindu', sizes: INV, pals: ['maroon', 'orange', 'purple'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, '#fff8ec')], n = Math.round(W / (46 * s)), bw = W / n;
      o.push(R(0, 0, W, 22 * s, p.a));
      for (var i = 0; i < n; i++) o.push(K.POLY([[i * bw, 22 * s], [(i + 1) * bw, 22 * s], [(i + 0.5) * bw, 62 * s]], [p.b, '#f59e0b', '#16a34a'][i % 3]));
      for (i = 0; i < n; i += 2) { var bx = (i + 0.5) * bw; o.push(L(bx, 62 * s, bx, 100 * s, p.d, 1.5 * s), C(bx, 108 * s, 9 * s, p.d)); }
      var aw = W * 0.8, ax = (W - aw) / 2, ay = H * 0.12, ah = H - ay - H * 0.05;
      o.push(K.PATH(archPath(ax, ay, aw, ah), '#fffdf8', { stroke: p.b, sw: 4 * s }), K.PATH(archPath(ax + 12 * s, ay + 12 * s, aw - 24 * s, ah - 12 * s), null, { stroke: p.d, sw: 1.5 * s }));
      o.push(R(0, H - H * 0.04, W, H * 0.04, p.a));
      o = o.concat(invite(W, H, { d: p.b, c: p.a }, { top: 'ॐ श्री गणेशाय नमः', head: 'Shubh Vivah', ink: '#3b2a1a', name: p.a, top0: ay + Math.min(aw * 0.32, ah * 0.2) }));
      return { pages: [{ bg: '#fff8ec', objects: o }] };
    } },
    { id: 'royalgold', name: 'Royal Gold Mandala', cat: 'Hindu', sizes: INV, pals: ['maroon', 'emerald', 'purple', 'navy'], build: function (W, H, p) {
      var s = sc(W, H), R0 = Math.min(W, H) * 0.42, o = [R(0, 0, W, H, K.G(150, p.a, p.b, p.a))];
      o = o.concat(K.mandala(W / 2, H / 2, R0, p.d, p.c, 0.08));
      for (var i = 0; i < 30; i++) o.push(K.burst((i * 167) % W, (i * 311) % H, 6 * s, 2.5 * s, 4, p.d, { op: 0.35 }));
      o = o.concat(K.frame(W, H, Math.min(W, H) * 0.04, p.d, p.c, true));
      o = o.concat(invite(W, H, p, { top: '॥ श्री गणेशाय नमः ॥', head: 'Wedding Invitation', headFont: 'Great Vibes', ink: '#fdf6e3', name: p.d, nameFont: 'Cinzel', top0: Math.min(W, H) * 0.12 }));
      return { pages: [{ bg: p.a, objects: o }] };
    } },
    { id: 'botanical', name: 'Botanical Leaves', cat: 'Modern/Creative', sizes: INV, pals: ['green', 'emerald', 'teal'], build: function (W, H, p) {
      var s = sc(W, H) * 1.1, o = [R(0, 0, W, H, '#fbfdf9')];
      o = o.concat(sprig(-10 * s, 120 * s, s, -10, p.a, p.b), sprig(30 * s, -10 * s, s * 0.8, 40, p.b, p.d), sprig(W + 10 * s, H - 120 * s, s, 170, p.a, p.b), sprig(W - 30 * s, H + 10 * s, s * 0.8, 220, p.b, p.d));
      o.push(C(W - 60 * s, 70 * s, 26 * s, p.acc, { op: 0.8 }), C(60 * s, H - 70 * s, 22 * s, p.acc, { op: 0.8 }));
      o = o.concat(invite(W, H, { d: p.b, c: p.a }, { top: 'Together with their families', topFont: 'Montserrat', head: 'We’re getting married', headFont: 'Great Vibes', ink: '#334155', name: p.a, nameFont: 'Playfair Display', top0: H * 0.15 }));
      return { pages: [{ bg: '#fbfdf9', objects: o }] };
    } },
    { id: 'arch', name: 'Elegant Arch', cat: 'Modern/Creative', sizes: INV, pals: ['rose', 'gold', 'slate', 'purple'], build: function (W, H, p) {
      var s = sc(W, H), aw = Math.min(W * 0.78, H * 0.62), ax = (W - aw) / 2, ay = H * 0.05, ah = H * 0.9;
      var o = [R(0, 0, W, H, K.G(160, p.c, p.soft))];
      o.push(K.PATH(archPath(ax, ay, aw, ah), '#ffffff', { shadow: { y: 10 * s, b: 30 * s, c: 'rgba(0,0,0,.10)' } }), K.PATH(archPath(ax + 14 * s, ay + 14 * s, aw - 28 * s, ah - 28 * s), null, { stroke: p.d, sw: 1.6 * s }));
      o.push(K.burst(W / 2, ay + 60 * s, 16 * s, 6 * s, 8, p.b));
      o = o.concat(invite(W, H, { d: p.b, c: p.a }, { top: 'The wedding of', topFont: 'Montserrat', head: 'Forever Begins', headFont: 'Great Vibes', ink: '#44403c', name: p.a, nameFont: 'Cormorant Garamond', top0: ay + Math.min(aw * 0.3, 150 * s) }).map(function (x) { if (x.t === 'text') { x.x = Math.max(x.x, ax + 30 * s); x.w = Math.min(x.w, aw - 60 * s); } return x; }));
      return { pages: [{ bg: p.soft, objects: o }] };
    } },
    { id: 'couple', name: 'Couple Photo', cat: 'Modern/Creative', sizes: INV, pals: ['rose', 'purple', 'teal'], build: function (W, H, p) {
      var s = sc(W, H), r = Math.min(W, H) * 0.15, cy = Math.min(W, H) * 0.06 + r, o = [R(0, 0, W, H, K.G(170, p.soft, '#ffffff'))];
      o.push(C(W * 0.12, H * 0.9, Math.min(W, H) * 0.2, p.c, { op: 0.8 }), C(W * 0.9, H * 0.12, Math.min(W, H) * 0.16, p.c, { op: 0.8 }));
      o.push(C(W / 2, cy, r + 12 * s, null, { stroke: p.d, sw: 2.5 * s, dash: [8 * s, 6 * s] }), C(W / 2, cy, r + 4 * s, p.b));
      o.push(P(W / 2 - r, cy - r, r * 2, r * 2, 'PHOTO', { shape: 'circle', fill: p.c, stroke: '#fff', sw: 5 * s, label: 'Couple photo' }));
      var it = invite(W, H, { d: p.b, c: p.a }, { top: 'Save our special day', topFont: 'Montserrat', head: 'Wedding', headFont: 'Great Vibes', ink: '#374151', name: p.a, nameFont: 'Playfair Display', top0: cy + r + 26 * s });
      return { pages: [{ bg: p.soft, objects: o.concat(it) }] };
    } },
    { id: 'crescent', name: 'Crescent Night', cat: 'Muslim', sizes: INV, pals: ['navy', 'emerald', 'purple'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, K.G(180, p.a, '#020617'))];
      for (var i = 0; i < 40; i++) o.push(C((i * 197) % W, (i * 389) % (H * 0.9), (1 + i % 3) * s, '#ffffff', { op: 0.5 }));
      var mx = W * 0.82, my = H * 0.1, mr = Math.min(W, H) * 0.07;
      o.push(C(mx, my, mr, p.d), C(mx + mr * 0.45, my - mr * 0.2, mr * 0.9, p.a));
      [0.12, 0.26, 0.74].forEach(function (k, i) { o = o.concat(lantern(W * k, H * (0.05 + (i % 2) * 0.04), s, p.d)); });
      o.push(K.burst(W * 0.66, H * 0.07, 9 * s, 4 * s, 5, p.d), K.burst(W * 0.9, H * 0.2, 6 * s, 2.5 * s, 5, p.d));
      o.push(R(W * 0.08, H * 0.2, W * 0.84, H * 0.75, 'rgba(255,255,255,0.05)', { r: 24 * s, stroke: p.d, sw: 1.5 * s }));
      o = o.concat(invite(W, H, p, { top: 'بسم الله الرحمن الرحيم', topFont: 'Noto Naskh Arabic', head: 'Nikah Mubarak', ink: '#e2e8f0', name: p.d, weds: 'with', top0: H * 0.23 }));
      return { pages: [{ bg: p.a, objects: o }] };
    } },
    { id: 'reception', name: 'Reception Night', cat: 'Modern/Creative', sizes: INV, pals: ['black', 'gold', 'navy'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, K.G(160, '#0a0a0a', p.a))];
      for (var i = 0; i < 46; i++) { var x = (i * 151) % W, y = (i * 277) % H; o.push(i % 2 ? C(x, y, (2 + i % 4) * s, p.d, { op: 0.7 }) : R(x, y, 10 * s, 4 * s, p.d, { angle: i * 33, op: 0.7 })); }
      o.push(R(W * 0.07, H * 0.05, W * 0.86, H * 0.9, null, { stroke: p.d, sw: 2 * s }));
      o = o.concat(invite(W, H, p, { top: 'Please join us for the', topFont: 'Montserrat', head: 'Wedding Reception', headFont: 'Great Vibes', ink: '#e5e7eb', name: p.d, nameFont: 'Cinzel', top0: H * 0.1 }));
      return { pages: [{ bg: '#0a0a0a', objects: o }] };
    } },
    { id: 'savedate', name: 'Save the Date', cat: 'Modern/Creative', sizes: INV, pals: ['rose', 'teal', 'slate', 'gold'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H) * 0.06, o = [R(0, 0, W, H, '#ffffff'), R(0, 0, W, H * 0.04, p.b), R(0, H * 0.96, W, H * 0.04, p.b)];
      o.push(C(W + Math.min(W, H) * 0.04, H * 0.5, Math.min(W, H) * 0.12, p.c, { op: 0.9 }), C(-Math.min(W, H) * 0.03, H * 0.7, Math.min(W, H) * 0.1, p.c, { op: 0.9 }));
      o = o.concat(K.stack(m * 1.5, W - m * 3, H * 0.08, H * 0.92, [
        { text: 'Save the Date', size: 82 * s, font: 'Great Vibes', color: p.b, gap: 10 },
        { text: 'FOR THE WEDDING OF', size: 16 * s, bold: 700, color: '#64748b', ls: 400, gap: 26 },
        { text: '{{GROOM|upper}}', size: 46 * s, font: 'Montserrat', bold: 800, color: p.a, gap: 0, ls: 100 },
        { text: '&', size: 56 * s, font: 'Great Vibes', color: p.b, gap: 0 },
        { text: '{{BRIDE|upper}}', size: 46 * s, font: 'Montserrat', bold: 800, color: p.a, gap: 30, ls: 100 },
        { div: p.d, w: 220 * s, gap: 20 },
        { text: '{{WEDDING_DATE|upper}}', size: 28 * s, font: 'Montserrat', bold: 800, color: p.ink, gap: 6, ls: 80 },
        { text: '{{WEDDING_TIME}}', size: 20 * s, color: '#475569', gap: 18 },
        { text: '{{VENUE}}', size: 18 * s, color: '#475569', gap: 24, lh: 1.35, est: 'Hotel Shree Palace, Station Road, Jaipur, Rajasthan' },
        { text: 'Formal invitation to follow  ·  {{RSVP}}', size: 15 * s, color: '#64748b', gap: 0 }
      ]));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'phulkari', name: 'Phulkari', cat: 'Sikh', sizes: INV, pals: ['orange', 'rose', 'navy'], build: function (W, H, p) {
      var s = sc(W, H), b = Math.min(W, H) * 0.07, o = [R(0, 0, W, H, p.a)], cols = ['#f59e0b', '#ec4899', '#facc15', '#22c55e', '#ffffff'], n = 0;
      function dia(x, y, r, c) { return K.POLY([[x, y - r], [x + r, y], [x, y + r], [x - r, y]], c); }
      for (var x = b / 2; x < W; x += b * 0.62) { o.push(dia(x, b / 2, b * 0.3, cols[n++ % 5]), dia(x, H - b / 2, b * 0.3, cols[n++ % 5])); }
      for (var y = b * 1.1; y < H - b; y += b * 0.62) { o.push(dia(b / 2, y, b * 0.3, cols[n++ % 5]), dia(W - b / 2, y, b * 0.3, cols[n++ % 5])); }
      o.push(R(b, b, W - 2 * b, H - 2 * b, '#fffaf0'), R(b + 8 * s, b + 8 * s, W - 2 * b - 16 * s, H - 2 * b - 16 * s, null, { stroke: p.b, sw: 2 * s }));
      o.push(dia(W / 2, b + 52 * s, 26 * s, '#f59e0b'), dia(W / 2, b + 52 * s, 14 * s, p.b));
      o = o.concat(invite(W, H, { d: p.b, c: p.a }, { top: 'ੴ ਸਤਿ ਨਾਮੁ', topFont: 'Noto Sans Gurmukhi', head: 'Anand Karaj', ink: '#1f2937', name: p.a, weds: 'with', top0: b + 110 * s }));
      return { pages: [{ bg: p.a, objects: o }] };
    } }
  ];
  ST.register(K.expand('mc2', layouts, ['maroon']));
})();
