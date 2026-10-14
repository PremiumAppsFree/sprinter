/* S Printer — aesthetic wedding invitations: watercolour florals, arches, wreaths, greenery,
 * pastel Indian and Bengali designs. Original designs by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, A = K.A;
  var INV = ['a4p', 'sq', 'story', 'a4l'];
  var EST_VENUE = 'Hotel Shree Palace, Station Road, Jaipur, Rajasthan', EST_EVENTS = 'Haldi — 20 Nov, 10:00 AM\nMehndi — 20 Nov, 5:00 PM\nBaraat — 21 Nov, 7:00 PM';
  var PAL = {
    blush: { a: '#8c3b5e', b: '#d6809f', c: '#fbd5e1', d: '#c9a227', bg: '#fff8fa', ink: '#4a2737', f: ['#fde2e4', '#f4a6b7', '#d36a85', '#8fb996', '#f9c6d3', '#ffffff'] },
    sage: { a: '#3f5d4c', b: '#7f9c8a', c: '#e3ece4', d: '#b8a06a', bg: '#fbfbf7', ink: '#2c3a31', f: ['#f6efe6', '#e8d5c4', '#b98b73', '#8faa95', '#ffffff', '#ffffff'] },
    peach: { a: '#94482a', b: '#e59572', c: '#ffe2d3', d: '#c9a227', bg: '#fffaf6', ink: '#4a2c20', f: ['#ffe8d6', '#fdba8c', '#e07a4f', '#9cb58a', '#fde2e4', '#ffffff'] },
    lavender: { a: '#563c86', b: '#9b87d9', c: '#ebe4ff', d: '#c9a227', bg: '#fcfaff', ink: '#33284a', f: ['#f3e8ff', '#c4b5fd', '#7c3aed', '#9fb7a2', '#fbcfe8', '#ffffff'] },
    royal: { a: '#7a1c2c', b: '#b8475a', c: '#f7dfe2', d: '#c9a227', bg: '#fffaf5', ink: '#3e1219', f: ['#fde1e1', '#e88b98', '#a3283f', '#6f9a6b', '#fcd9a8', '#ffffff'] },
    blue: { a: '#2c4a7a', b: '#7aa2d6', c: '#dfeaf8', d: '#b89a4a', bg: '#fafcff', ink: '#1d2d48', f: ['#e6f0fb', '#a9c6ea', '#4a72b0', '#8fb5a0', '#ffffff', '#ffffff'] }
  };
  function sc(W, H) { return Math.min(W, H) / 794; }
  // the invitation text column
  function words(x, w, top, bot, p, o) {
    o = o || {};
    var s = o.s || 1, it = [];
    if (o.top) it.push({ text: o.top, size: 17 * s, font: o.topFont || 'Cormorant Garamond', bold: 700, color: p.b, gap: 10 });
    it.push({ text: '{{MESSAGE}}', size: 15 * s, font: o.body || 'Cormorant Garamond', italic: true, color: p.ink, lh: 1.4, gap: 14, est: 'Together with their families, request the honour of your presence at the wedding of' });
    it.push({ text: '{{GROOM}}', size: 66 * s, font: o.script || 'Great Vibes', color: p.a, gap: 0, lh: 1.05 });
    it.push({ text: '{{GROOM_PARENTS}}', size: 12.5 * s, font: o.body || 'Cormorant Garamond', color: p.ink, gap: 2, est: 'S/o Shri Ramesh Sharma & Smt. Sunita Sharma' });
    it.push({ text: o.weds || '&', size: 40 * s, font: o.script || 'Great Vibes', color: p.d, gap: 0 });
    it.push({ text: '{{BRIDE}}', size: 66 * s, font: o.script || 'Great Vibes', color: p.a, gap: 0, lh: 1.05 });
    it.push({ text: '{{BRIDE_PARENTS}}', size: 12.5 * s, font: o.body || 'Cormorant Garamond', color: p.ink, gap: 16, est: 'D/o Shri Mahesh Verma & Smt. Kavita Verma' });
    it.push({ div: p.d, w: 180 * s, gap: 12 });
    it.push({ text: '{{WEDDING_DATE|upper}}', size: 17 * s, font: o.caps || 'Montserrat', bold: 600, color: p.a, ls: 160, gap: 4 });
    it.push({ text: '{{WEDDING_TIME}}', size: 15 * s, font: o.body || 'Cormorant Garamond', bold: 700, color: p.ink, gap: 6 });
    it.push({ text: '{{VENUE}}', size: 15 * s, font: o.body || 'Cormorant Garamond', color: p.ink, lh: 1.35, gap: 14, est: EST_VENUE });
    if (o.events !== false) it.push({ text: '{{EVENTS|lines}}', size: 13 * s, font: o.body || 'Cormorant Garamond', bold: 700, color: p.b, lh: 1.5, gap: 12, est: EST_EVENTS });
    it.push({ text: 'With love: {{INVITER}}  ·  RSVP {{RSVP}}', size: 12 * s, font: o.body || 'Cormorant Garamond', color: p.ink, gap: 0 });
    return K.stack(x, w, top, bot, it, { maxK: 1.25 });
  }
  var layouts = [
    { id: 'wbloom', name: 'Watercolour Bloom', cat: 'Floral', sizes: INV, pals: ['blush', 'peach', 'lavender', 'blue'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H), o = [R(0, 0, W, H, p.bg)];
      o.push(A('blob', -m * 0.16, -m * 0.12, m * 0.62, m * 0.5, { cols: [p.c] }), A('blob', W - m * 0.46, H - m * 0.38, m * 0.62, m * 0.5, { cols: [p.c] }));
      o.push(A('bouquet', -m * 0.04, -m * 0.04, m * 0.46, m * 0.46, { cols: p.f }), A('bouquet', W - m * 0.42, H - m * 0.42, m * 0.46, m * 0.46, { cols: p.f, flipX: true, flipY: true }));
      o.push(A('sparkles', W - m * 0.2, m * 0.06, m * 0.12, m * 0.12, { cols: [p.d, p.b] }));
      var x = W > H ? W * 0.24 : W * 0.15, w = W - 2 * x;
      return { pages: [{ bg: p.bg, objects: o.concat(words(x, w, H * 0.12, H * 0.9, p, { s: s, top: '॥ Shubh Vivah ॥' })) }] };
    } },
    { id: 'warch', name: 'Floral Arch', cat: 'Floral', sizes: INV, pals: ['sage', 'blush', 'royal', 'lavender'], build: function (W, H, p) {
      var s = sc(W, H), ah = H * 0.94, aw = Math.min(W * 0.86, ah * 0.71), ax = (W - aw) / 2, ay = H * 0.03, o = [R(0, 0, W, H, p.c)];
      o.push(A('archframe', ax + aw * 0.03, ay + ah * 0.03, aw * 0.94, ah * 0.94, { cols: [p.bg, p.d] }), A('archflowers', ax, ay, aw, ah, { cols: p.f }));
      return { pages: [{ bg: p.c, objects: o.concat(words(ax + aw * 0.17, aw * 0.66, ay + ah * 0.2, ay + ah * 0.9, p, { s: s * 0.95, top: 'Together with their families' })) }] };
    } },
    { id: 'wwreath', name: 'Wreath Monogram', cat: 'Floral', sizes: INV, pals: ['blush', 'sage', 'peach', 'blue'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H), ws = m * 0.36, o = [R(0, 0, W, H, p.bg), R(m * 0.03, m * 0.03, W - m * 0.06, H - m * 0.06, null, { stroke: p.d, sw: 1.4 * s })];
      var wy = H * 0.05;
      o.push(A('wreath', W / 2 - ws / 2, wy, ws, ws, { cols: p.f.slice(0, 5) }), T(W / 2 - ws / 2, wy + ws * 0.3, ws, '&', 80 * s, { font: 'Great Vibes', color: p.a, align: 'center' }));
      return { pages: [{ bg: p.bg, objects: o.concat(words(W * 0.14, W * 0.72, wy + ws + 10 * s, H * 0.94, p, { s: s * 0.95, top: false })) }] };
    } },
    { id: 'wgarland', name: 'Rose Garland', cat: 'Floral', sizes: INV, pals: ['royal', 'blush', 'lavender', 'peach'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, p.bg), A('goldframe', W * 0.03, H * 0.02, W * 0.94, H * 0.96, { cols: [p.d] })];
      var gw = Math.min(W * 0.9, H * 0.9), gh = gw * 0.325;
      o.push(A('swag', (W - gw) / 2, H * 0.015, gw, gh, { cols: p.f }), A('swag', (W - gw * 0.8) / 2, H - gh * 0.8 - H * 0.015, gw * 0.8, gh * 0.8, { cols: p.f, flipY: true }));
      return { pages: [{ bg: p.bg, objects: o.concat(words(W * 0.16, W * 0.68, H * 0.02 + gh * 0.95, H - gh * 0.8 - H * 0.02, p, { s: s, top: '॥ Shri Ganeshaya Namah ॥' })) }] };
    } },
    { id: 'wgreen', name: 'Greenery Minimal', cat: 'Floral', sizes: INV, pals: ['sage', 'blue', 'peach'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H), o = [R(0, 0, W, H, '#fdfcf8')];
      o.push(A('eucalyptus', -m * 0.02, -m * 0.06, m * 0.17, m * 0.39, { cols: ['#9cb8a8'] }), A('sprig', m * 0.07, -m * 0.08, m * 0.12, m * 0.3, { cols: ['#8fb996'], flipX: true }), A('eucalyptus', W - m * 0.15, H - m * 0.34, m * 0.17, m * 0.39, { cols: ['#9cb8a8'], flipY: true, flipX: true }), A('sprig', W - m * 0.19, H - m * 0.22, m * 0.12, m * 0.3, { cols: ['#8fb996'], flipY: true }));
      o.push(A('blossom', m * 0.2, m * 0.16, m * 0.08, m * 0.08, { cols: ['#ffffff', p.f[1], '#f6c453'] }), A('blossom', W - m * 0.28, H - m * 0.22, m * 0.08, m * 0.08, { cols: ['#ffffff', p.f[1], '#f6c453'] }));
      return { pages: [{ bg: '#fdfcf8', objects: o.concat(words(W * 0.17, W * 0.66, H * 0.1, H * 0.92, p, { s: s, script: 'Pinyon Script', caps: 'Josefin Sans', top: 'SAVE THE DATE', topFont: 'Josefin Sans' })) }] };
    } },
    { id: 'wlotus', name: 'Pastel Lotus', cat: 'Hindu', sizes: INV, pals: ['peach', 'royal', 'blush', 'lavender'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H), o = [R(0, 0, W, H, K.G(180, p.bg, p.c)), A('mandala', W / 2 - m * 0.45, H / 2 - m * 0.45, m * 0.9, m * 0.9, { cols: [p.c, p.b], op: 0.18 })];
      o.push(A('toran', 0, 0, W, W * 0.225, { cols: ['#f59e0b', '#6aa56b', p.b] }));
      o.push(A('lotus', W / 2 - m * 0.13, W * 0.17, m * 0.26, m * 0.195, { cols: [p.c, p.b] }));
      o.push(A('diya', m * 0.05, H - m * 0.16, m * 0.16, m * 0.14, { cols: ['#f59e0b', '#b45309', '#fde047'] }), A('diya', W - m * 0.21, H - m * 0.16, m * 0.16, m * 0.14, { cols: ['#f59e0b', '#b45309', '#fde047'] }));
      return { pages: [{ bg: p.bg, objects: o.concat(words(W * 0.15, W * 0.7, W * 0.17 + m * 0.21, H * 0.86, p, { s: s, top: '॥ श्री गणेशाय नमः ॥', topFont: 'Tiro Devanagari Hindi', script: 'Parisienne' })) }] };
    } },
    { id: 'wbangla', name: 'শুভ বিবাহ Pastel', cat: 'Bengali', sizes: INV, pals: ['royal', 'peach', 'blush'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H), o = [R(0, 0, W, H, p.bg)];
      o.push(R(m * 0.03, m * 0.03, W - m * 0.06, H - m * 0.06, null, { stroke: p.b, sw: 6 * s }), R(m * 0.05, m * 0.05, W - m * 0.1, H - m * 0.1, null, { stroke: p.d, sw: 1.5 * s, dash: [4 * s, 6 * s] }));
      [[0, 0], [W, 0], [0, H], [W, H]].forEach(function (c, i) { o.push(A('paisley', c[0] - (i % 2 ? m * 0.14 : 0), c[1] - (i > 1 ? m * 0.19 : 0), m * 0.14, m * 0.18, { cols: [p.b, p.d], flipX: i % 2 === 1, flipY: i > 1, op: 0.85 })); });
      o.push(A('lotus', W / 2 - m * 0.12, m * 0.08, m * 0.24, m * 0.18, { cols: [p.c, p.b] }));
      o.push(T(W * 0.1, m * 0.27, W * 0.8, 'শুভ বিবাহ', 64 * s, { font: 'Galada', color: p.a, align: 'center' }));
      return { pages: [{ bg: p.bg, objects: o.concat(words(W * 0.16, W * 0.68, m * 0.27 + 90 * s, H * 0.93, p, { s: s, top: 'শ্রী শ্রী প্রজাপতয়ে নমঃ', topFont: 'Hind Siliguri', script: 'Great Vibes' })) }] };
    } },
    { id: 'wbutterfly', name: 'Butterfly Garden', cat: 'Modern/Creative', sizes: INV, pals: ['lavender', 'blue', 'blush'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H), o = [R(0, 0, W, H, K.G(170, '#ffffff', p.c))];
      o.push(A('butterfly', W - m * 0.3, m * 0.05, m * 0.22, m * 0.19, { cols: [p.c, p.b, p.a], angle: 14 }), A('butterfly', m * 0.06, m * 0.2, m * 0.13, m * 0.11, { cols: [p.c, p.b, p.a], angle: -16 }), A('butterfly', W - m * 0.2, H - m * 0.3, m * 0.14, m * 0.12, { cols: [p.c, p.b, p.a], angle: 20 }));
      o.push(A('tulip', m * 0.02, H - m * 0.36, m * 0.12, m * 0.26, { cols: [p.c, p.b, '#7fae8a'], angle: 8 }), A('tulip', m * 0.12, H - m * 0.3, m * 0.1, m * 0.22, { cols: [p.c, p.b, '#7fae8a'], angle: -6 }), A('sparkles', m * 0.3, m * 0.04, m * 0.1, m * 0.1, { cols: [p.d, p.b] }));
      return { pages: [{ bg: '#ffffff', objects: o.concat(words(W * 0.16, W * 0.68, H * 0.1, H * 0.92, p, { s: s, script: 'Alex Brush', top: 'Together with their families' })) }] };
    } }
  ];
  var out;
  out = [];
  layouts.forEach(function (L) { L.pals.forEach(function (k, i) { out.push({ id: 'mca-' + L.id + '-' + k, name: L.name + (i ? ' · ' + k[0].toUpperCase() + k.slice(1) : ''), cat: L.cat, sizes: L.sizes, pal: PAL[k], build: L.build }); }); });
  [].unshift.apply(ST.templates, out);
})();
