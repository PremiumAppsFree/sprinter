/* S Printer — pastel / floral certificates (A4 landscape or portrait). Original designs by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P, A = K.A;
  var EST = 'for securing First Position in the Annual Science Exhibition held on 15 November 2026. We appreciate the hard work and wish a bright future.';
  var PAL = {
    blush: { a: '#8c3b5e', b: '#d6809f', c: '#fbd5e1', d: '#c9a227', bg: '#fff8fa', ink: '#4a2737', f: ['#fde2e4', '#f4a6b7', '#d36a85', '#8fb996', '#f9c6d3', '#ffffff'] },
    lavender: { a: '#563c86', b: '#9b87d9', c: '#ebe4ff', d: '#c9a227', bg: '#fcfaff', ink: '#33284a', f: ['#f3e8ff', '#c4b5fd', '#7c3aed', '#9fb7a2', '#fbcfe8', '#ffffff'] },
    sky: { a: '#2c4a7a', b: '#7aa2d6', c: '#dfeaf8', d: '#b89a4a', bg: '#fafcff', ink: '#1d2d48', f: ['#e6f0fb', '#a9c6ea', '#4a72b0', '#8fb5a0', '#fef3c7', '#ffffff'] },
    mint: { a: '#2c6650', b: '#5fbf98', c: '#d2f0e3', d: '#b89a4a', bg: '#f8fdfa', ink: '#1d3b2f', f: ['#fde2e4', '#f4a6b7', '#d36a85', '#6aa984', '#fff1c1', '#ffffff'] },
    peach: { a: '#94482a', b: '#e59572', c: '#ffe2d3', d: '#c9a227', bg: '#fffaf6', ink: '#4a2c20', f: ['#ffe8d6', '#fdba8c', '#e07a4f', '#9cb58a', '#fde2e4', '#ffffff'] }
  };
  function sc(W, H) { return W > H ? Math.min(W / 1123, H / 794) : W / 860; }
  function body(x, w, top, bot, p, s, o) {
    o = o || {};
    return K.stack(x, w, top, bot, [
      { text: '{{ORG|upper}}', size: 18 * s, font: 'Montserrat', bold: 700, color: p.b, ls: 200, gap: 14 },
      { text: '{{CERT_TITLE}}', size: 54 * s, font: o.tf || 'Playfair Display', bold: 700, color: p.a, lh: 1.05, gap: 8 },
      { div: p.d, w: 220 * s, gap: 14 },
      { text: '{{CERT_SUB}}', size: 18 * s, font: 'Cormorant Garamond', italic: true, bold: 700, color: p.ink, gap: 2 },
      { text: '{{NAME}}', size: 84 * s, font: o.nf || 'Great Vibes', color: o.nc || p.a, lh: 1.1, gap: 8 },
      { text: '{{REASON}}', size: 18 * s, font: 'Cormorant Garamond', bold: 600, color: p.ink, lh: 1.5, gap: 0, est: EST }
    ], { maxK: 1.2 });
  }
  function sigs(x, w, y, s, p) {
    var lw = 220 * s, rx = x + w - lw, out = [];
    out.push(L(x, y, x + lw, y, p.a, 1.3 * s), T(x, y + 8 * s, lw, '{{SIGN1_NAME}}', 17 * s, { font: 'Cormorant Garamond', bold: 700, color: p.ink, align: 'center' }), T(x, y + 32 * s, lw, '{{SIGN1_ROLE}}', 14 * s, { font: 'Montserrat', color: p.b, align: 'center' }));
    out.push(P(rx + lw / 2 - 90 * s, y - 64 * s, 180 * s, 60 * s, 'SIGN', { fill: 'rgba(255,255,255,0.6)', label: 'Signature' }));
    out.push(L(rx, y, rx + lw, y, p.a, 1.3 * s), T(rx, y + 8 * s, lw, '{{SIGN2_NAME}}', 17 * s, { font: 'Cormorant Garamond', bold: 700, color: p.ink, align: 'center' }), T(rx, y + 32 * s, lw, '{{SIGN2_ROLE}}', 14 * s, { font: 'Montserrat', color: p.b, align: 'center' }));
    out.push(T(x + w / 2 - 140 * s, y + (w < 2 * lw + 300 * s ? 64 : 18) * s, 280 * s, '{{DATE}}  ·  {{PLACE}}', 14 * s, { font: 'Montserrat', color: p.b, align: 'center' }));
    return out;
  }
  function logo(W, y, s, p) { return P(W / 2 - 40 * s, y, 80 * s, 80 * s, 'LOGO', { shape: 'circle', fill: '#ffffff', stroke: p.d, sw: 2 * s }); }
  var SZ = ['a4l', 'a4p'];
  var layouts = [
    { id: 'cbloom', name: 'Floral Watercolour', build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H), o = [R(0, 0, W, H, p.bg), A('blob', -m * 0.14, -m * 0.12, m * 0.6, m * 0.48, { cols: [p.c] }), A('blob', W - m * 0.46, H - m * 0.36, m * 0.6, m * 0.48, { cols: [p.c] })];
      o.push(A('bouquet', -m * 0.03, -m * 0.03, m * 0.42, m * 0.42, { cols: p.f }), A('bouquet', W - m * 0.3, H - m * 0.3, m * 0.32, m * 0.32, { cols: p.f, flipX: true, flipY: true }));
      o.push(R(m * 0.04, m * 0.04, W - m * 0.08, H - m * 0.08, null, { stroke: p.d, sw: 1.5 * s }), logo(W, m * 0.06, s, p));
      var x = W * 0.16, w = W * 0.68;
      return { pages: [{ bg: p.bg, objects: o.concat(body(x, w, m * 0.06 + 92 * s, H - 190 * s, p, s), sigs(x, w, H - 120 * s, s, p)) }] };
    } },
    { id: 'cwreath', name: 'Wreath Award', build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H), o = [R(0, 0, W, H, '#ffffff'), A('goldframe', m * 0.025, m * 0.025, W - m * 0.05, H - m * 0.05, { cols: [p.d] })];
      var ws = 150 * s;
      o.push(A('wreath', W / 2 - ws / 2, m * 0.05, ws, ws, { cols: p.f.slice(0, 5) }), A('star', W / 2 - 22 * s, m * 0.05 + ws / 2 - 24 * s, 44 * s, 44 * s, { cols: [p.d] }));
      var x = W * 0.15, w = W * 0.7;
      return { pages: [{ bg: '#ffffff', objects: o.concat(body(x, w, m * 0.05 + ws + 4 * s, H - 190 * s, p, s, { tf: 'Cinzel' }), sigs(x, w, H - 120 * s, s, p)) }] };
    } },
    { id: 'cpastel', name: 'Pastel Stars', build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H), o = [R(0, 0, W, H, K.G(135, p.c, '#ffffff', p.c))];
      for (var i = 0; i < 18; i++) o.push(A(i % 3 ? 'sparkle' : 'star', (i * 197) % (W - 40 * s), ((i * 131) % (m * 0.16)) + (i % 2 ? H - m * 0.2 : 10 * s), (24 + (i % 3) * 10) * s, (24 + (i % 3) * 10) * s, { cols: [i % 2 ? p.d : p.b], op: 0.9 }));
      o.push(R(m * 0.06, m * 0.1, W - m * 0.12, H - m * 0.2, 'rgba(255,255,255,0.9)', { r: 30 * s, shadow: { y: 8, b: 26, c: 'rgba(0,0,0,.08)' } }), logo(W, m * 0.12, s, p));
      var x = W * 0.16, w = W * 0.68;
      return { pages: [{ bg: p.c, objects: o.concat(body(x, w, m * 0.12 + 90 * s, H - 200 * s, p, s, { tf: 'Fredoka', nf: 'Pacifico', nc: p.b }), sigs(x, w, H - m * 0.1 - 70 * s, s, p)) }] };
    } },
    { id: 'cgreen', name: 'Botanical Line', build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H), o = [R(0, 0, W, H, '#fdfcf8')];
      o.push(A('eucalyptus', -m * 0.02, -m * 0.05, m * 0.17, m * 0.39, { cols: ['#9cb8a8'] }), A('sprig', m * 0.09, -m * 0.07, m * 0.12, m * 0.3, { cols: ['#8fb996'], flipX: true }), A('eucalyptus', W - m * 0.15, H - m * 0.34, m * 0.17, m * 0.39, { cols: ['#9cb8a8'], flipX: true, flipY: true }), A('sprig', W - m * 0.21, H - m * 0.23, m * 0.12, m * 0.3, { cols: ['#8fb996'], flipY: true }));
      o.push(R(m * 0.05, m * 0.05, W - m * 0.1, H - m * 0.1, null, { stroke: p.b, sw: 1.3 * s }), logo(W, m * 0.08, s, p));
      var x = W * 0.18, w = W * 0.64;
      return { pages: [{ bg: '#fdfcf8', objects: o.concat(body(x, w, m * 0.08 + 92 * s, H - 190 * s, p, s, { tf: 'Cormorant Garamond', nf: 'Pinyon Script' }), sigs(x, w, H - 120 * s, s, p)) }] };
    } }
  ];
  var out = [], PK = { cbloom: ['blush', 'lavender', 'peach'], cwreath: ['blush', 'sky', 'mint'], cpastel: ['lavender', 'sky', 'blush'], cgreen: ['mint', 'peach', 'sky'] };
  layouts.forEach(function (L) { PK[L.id].forEach(function (k, i) { out.push({ id: 'cta-' + L.id + '-' + k, name: L.name + (i ? ' · ' + k[0].toUpperCase() + k.slice(1) : ''), cat: 'Pastel & Floral', sizes: SZ, pal: PAL[k], build: L.build }); }); });
  [].unshift.apply(ST.templates, out);
})();
