/* S Printer — premium card stickers / skins at exact card size (85.6 × 54 mm, CR80).
 * Original metal, carbon, marble and gradient designs; every word is editable. Front + back. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P, A = K.A;
  var PN = ['Front', 'Back'];
  // metal finishes: m = brushed metal colours [light, dark, sheen]; ink = engraving / text colour
  var FIN = {
    platinum: { m: ['#f4f5f7', '#b9bec7', '#ffffff'], ink: '#1f2937', sub: '#4b5563', chip: '#e8c766', name: 'Platinum' },
    gold: { m: ['#f8e7ad', '#b88a2c', '#fff6d6'], ink: '#3b2a06', sub: '#5c4512', chip: '#d9d9d9', name: 'Gold' },
    black: { m: ['#3b3b3d', '#0b0b0c', '#8a8a8a'], ink: '#d6d6d6', sub: '#a3a3a3', chip: '#e8c766', name: 'Black' },
    rose: { m: ['#f8dcd5', '#c58a7e', '#ffffff'], ink: '#4a2420', sub: '#6b3a33', chip: '#e8c766', name: 'Rose gold' },
    sapphire: { m: ['#6a8fd6', '#16295e', '#b8ccff'], ink: '#eef2ff', sub: '#c7d2fe', chip: '#e8c766', name: 'Sapphire' },
    emerald: { m: ['#45b391', '#09412f', '#a8f3d6'], ink: '#ecfdf5', sub: '#bbf7d0', chip: '#e8c766', name: 'Emerald' },
    titanium: { m: ['#c9ccd1', '#6b7078', '#f1f2f4'], ink: '#111827', sub: '#374151', chip: '#d9d9d9', name: 'Titanium' }
  };
  function chip(x, y, u, f) { return [A('chipreal', x, y, 120 * u, 92 * u, { cols: [f.chip] }), R(x - 8 * u, y - 8 * u, 136 * u, 108 * u, null, { r: 18 * u, stroke: 'rgba(120,120,120,0.55)', sw: 1.2 * u, dash: [6 * u, 5 * u], nm: 'Chip cut line (delete if not needed)' })]; }
  function micro(y, u, col) { return T(40 * u, y, 932 * u, '{{BRAND|upper}} · {{BRAND|upper}} · {{BRAND|upper}} · {{BRAND|upper}} · {{BRAND|upper}} · {{BRAND|upper}} · {{BRAND|upper}} · {{BRAND|upper}}', 8 * u, { font: 'Montserrat', bold: 600, color: col, ls: 60, op: 0.7 }); }
  function back(W, H, f, o) {
    o = o || {}; var u = W / 1012, out = [];
    out.push(o.bg || A('metal', 0, 0, W, H, { cols: f.m, fit: 'stretch' }));
    out.push(A('magstripe', 0, 64 * u, W, 112 * u, { cols: ['#111111'] }));
    out.push(A('signpanel', 50 * u, 226 * u, 560 * u, 84 * u, { cols: ['#ffffff', '#dfe3ea'] }), R(624 * u, 226 * u, 110 * u, 84 * u, '#ffffff'), T(632 * u, 252 * u, 94 * u, '{{SINCE}}', 30 * u, { font: 'Roboto Mono', bold: 700, color: '#111827', align: 'center', italic: true }));
    out.push(T(52 * u, 316 * u, 560 * u, 'AUTHORISED SIGNATURE', 11 * u, { font: 'Montserrat', bold: 700, color: f.sub, ls: 160 }));
    out.push(A('holo', W - 196 * u, 214 * u, 130 * u, 130 * u));
    out.push(T(52 * u, 380 * u, 700 * u, '{{BACK_NOTE}}', 15 * u, { font: 'Poppins', color: f.ink, lh: 1.45, op: 0.9 }));
    out.push(T(52 * u, H - 92 * u, 600 * u, '{{BRAND|upper}}', 26 * u, { font: o.brandFont || 'Montserrat', bold: 800, color: f.ink, ls: 120 }));
    out.push(T(W - 452 * u, H - 84 * u, 400 * u, '{{TIER|upper}} MEMBER', 14 * u, { font: 'Montserrat', bold: 700, color: f.sub, ls: 200, align: 'right' }));
    return out;
  }
  function pack(front, backObjs) { return { pageNames: PN, pages: [{ bg: '#ffffff', objects: front }, { bg: '#ffffff', objects: backObjs }] }; }

  // classic engraved metal card (medallion in the middle, ornate border)
  function classic(fk) { return function (W, H) {
    var f = FIN[fk], u = W / 1012, o = [A('metal', 0, 0, W, H, { cols: f.m, fit: 'stretch' }), A('guilloche', 0, 40 * u, W, H - 40 * u, { cols: [f.ink], op: 0.07 }), A('ornate', 0, 0, W, H, { cols: [f.ink] })];
    o.push(T(80 * u, 82 * u, W - 160 * u, '{{BRAND|upper}}', 46 * u, { font: 'Montserrat', bold: 800, color: f.ink, align: 'center', ls: 60 }));
    o.push(A('medallion', W / 2 - 92 * u, 150 * u, 184 * u, 233 * u, { cols: [f.ink, f.m[0]] }));
    o = o.concat(chip(90 * u, 238 * u, u, f));
    o.push(A('contactless', W - 210 * u, 268 * u, 42 * u, 50 * u, { cols: [f.ink] }));
    o.push(R(W - 330 * u, 350 * u, 230 * u, 40 * u, null, { r: 6 * u, stroke: f.ink, sw: 2 * u }), T(W - 330 * u, 359 * u, 230 * u, 'MEMBER SINCE', 15 * u, { font: 'Montserrat', bold: 700, color: f.ink, align: 'center', ls: 200 }));
    o.push(T(W - 330 * u, 398 * u, 230 * u, '{{SINCE}}', 40 * u, { font: 'Roboto Mono', bold: 500, color: f.ink, align: 'center' }));
    o.push(T(84 * u, 480 * u, 640 * u, '{{NAME|upper}}', 40 * u, { font: 'Roboto Mono', bold: 500, color: f.ink, ls: 40, shadow: { x: 1, y: 1, b: 0, c: 'rgba(255,255,255,0.35)' } }));
    o.push(micro(560 * u, u, f.sub), T(W - 230 * u, 580 * u, 160 * u, '{{TIER|upper}}', 14 * u, { font: 'Montserrat', bold: 700, color: f.sub, align: 'right', ls: 160 }));
    return pack(o, back(W, H, f));
  }; }
  // clean modern metal (no medallion): big tier word, chip, name
  function modern(fk) { return function (W, H) {
    var f = FIN[fk], u = W / 1012, o = [A('metal', 0, 0, W, H, { cols: f.m, fit: 'stretch' }), A('rosette', W - 420 * u, -120 * u, 520 * u, 520 * u, { cols: [f.ink], op: 0.08 })];
    o.push(T(64 * u, 56 * u, 600 * u, '{{BRAND|upper}}', 34 * u, { font: 'Montserrat', bold: 800, color: f.ink, ls: 80 }));
    o.push(T(W - 464 * u, 60 * u, 400 * u, '{{TIER|upper}}', 26 * u, { font: 'Cinzel', bold: 700, color: f.ink, align: 'right', ls: 160 }));
    o = o.concat(chip(70 * u, 214 * u, u, f));
    o.push(A('contactless', 220 * u, 236 * u, 40 * u, 48 * u, { cols: [f.ink] }));
    o.push(T(64 * u, 400 * u, 700 * u, '{{NAME|upper}}', 38 * u, { font: 'Roboto Mono', bold: 500, color: f.ink, ls: 40 }));
    o.push(T(64 * u, 458 * u, 500 * u, 'MEMBER SINCE {{SINCE}}', 16 * u, { font: 'Montserrat', bold: 700, color: f.sub, ls: 200 }));
    o.push(K.PATH('M' + (W - 230 * u) + ' ' + (H - 70 * u) + ' l40 ' + (-60 * u) + ' l40 ' + (60 * u) + ' l40 ' + (-60 * u) + ' l40 ' + (60 * u), null, { stroke: f.ink, sw: 6 * u, op: 0.5 }));
    return pack(o, back(W, H, f));
  }; }
  function carbon(W, H) {
    var u = W / 1012, f = { ink: '#e8c766', sub: '#cbd5e1', chip: '#e8c766', m: ['#3b3b3d', '#0b0b0c', '#8a8a8a'] }, o = [A('carbon', 0, 0, W, H, { cols: ['#141414', '#262626'] })];
    o.push(R(0, 0, 14 * u, H, K.G(90, '#f5e7b8', '#d4af37', '#8a6d1d')));
    o.push(T(64 * u, 56 * u, 600 * u, '{{BRAND|upper}}', 34 * u, { font: 'Montserrat', bold: 800, color: '#f5e7b8', ls: 120 }));
    o.push(T(W - 464 * u, 62 * u, 400 * u, '{{TIER|upper}}', 24 * u, { font: 'Cinzel', bold: 700, color: '#d4af37', align: 'right', ls: 200 }));
    o = o.concat(chip(70 * u, 214 * u, u, f));
    o.push(A('contactless', 220 * u, 236 * u, 40 * u, 48 * u, { cols: ['#d4af37'] }));
    o.push(T(64 * u, 420 * u, 700 * u, '{{NAME|upper}}', 38 * u, { font: 'Roboto Mono', bold: 500, color: '#f5f5f5', ls: 40 }));
    o.push(T(64 * u, 478 * u, 500 * u, 'MEMBER SINCE {{SINCE}}', 16 * u, { font: 'Montserrat', bold: 700, color: '#d4af37', ls: 200 }));
    return pack(o, back(W, H, { ink: '#f5f5f5', sub: '#d4af37' }, { bg: A('carbon', 0, 0, W, H, { cols: ['#141414', '#262626'] }) }));
  }
  function marble(W, H) {
    var u = W / 1012, f = { ink: '#3b2f1a', sub: '#8a6d1d', chip: '#e8c766' }, o = [A('marble', 0, 0, W, H, { cols: ['#fbfaf7', '#c9c4b8', '#d4af37'] }), R(26 * u, 26 * u, W - 52 * u, H - 52 * u, null, { r: 18 * u, stroke: '#c9a227', sw: 2.4 * u })];
    o.push(T(64 * u, 60 * u, 600 * u, '{{BRAND|upper}}', 34 * u, { font: 'Cinzel', bold: 700, color: '#3b2f1a', ls: 120 }));
    o.push(T(W - 464 * u, 64 * u, 400 * u, '{{TIER}}', 34 * u, { font: 'Great Vibes', color: '#b08d2c', align: 'right' }));
    o = o.concat(chip(70 * u, 214 * u, u, f));
    o.push(A('contactless', 220 * u, 236 * u, 40 * u, 48 * u, { cols: ['#8a6d1d'] }));
    o.push(T(64 * u, 420 * u, 700 * u, '{{NAME|upper}}', 38 * u, { font: 'Cinzel', bold: 700, color: '#3b2f1a', ls: 40 }));
    o.push(T(64 * u, 478 * u, 500 * u, 'MEMBER SINCE {{SINCE}}', 16 * u, { font: 'Montserrat', bold: 700, color: '#8a6d1d', ls: 200 }));
    return pack(o, back(W, H, { ink: '#3b2f1a', sub: '#8a6d1d' }, { bg: A('marble', 0, 0, W, H, { cols: ['#fbfaf7', '#c9c4b8', '#d4af37'] }), brandFont: 'Cinzel' }));
  }
  function neon(cols) { return function (W, H) {
    var u = W / 1012, f = { ink: '#ffffff', sub: 'rgba(255,255,255,0.85)', chip: '#e8c766' }, o = [R(0, 0, W, H, K.G(135, cols[0], cols[1], cols[2]))];
    o.push(A('blob', -200 * u, 200 * u, 700 * u, 560 * u, { cols: [cols[2]], op: 0.45 }), A('blob', 520 * u, -260 * u, 700 * u, 560 * u, { cols: [cols[0]], op: 0.4 }), C(W - 120 * u, H - 60 * u, 220 * u, 'rgba(255,255,255,0.08)'));
    o.push(T(64 * u, 56 * u, 600 * u, '{{BRAND}}', 38 * u, { font: 'Poppins', bold: 800, color: '#ffffff' }));
    o.push(T(W - 464 * u, 64 * u, 400 * u, '{{TIER|upper}}', 20 * u, { font: 'Montserrat', bold: 700, color: 'rgba(255,255,255,0.85)', align: 'right', ls: 200 }));
    o = o.concat(chip(70 * u, 214 * u, u, f));
    o.push(A('contactless', 220 * u, 236 * u, 40 * u, 48 * u, { cols: ['#ffffff'] }));
    o.push(T(64 * u, 420 * u, 700 * u, '{{NAME}}', 40 * u, { font: 'Poppins', bold: 700, color: '#ffffff' }));
    o.push(T(64 * u, 480 * u, 500 * u, 'Member since {{SINCE}}', 17 * u, { font: 'Poppins', bold: 500, color: 'rgba(255,255,255,0.85)' }));
    return pack(o, back(W, H, { ink: '#ffffff', sub: 'rgba(255,255,255,0.85)' }, { bg: R(0, 0, W, H, K.G(135, cols[0], cols[1], cols[2])), brandFont: 'Poppins' }));
  }; }
  function photo(W, H) {
    var u = W / 1012, f = { ink: '#ffffff', sub: 'rgba(255,255,255,0.85)', chip: '#e8c766' }, o = [P(0, 0, W, H, 'PHOTO', { fill: '#334155', sw: 0, label: 'Your photo' }), R(0, H * 0.4, W, H * 0.6, K.G(90, [0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.75)']))];
    o.push(R(0, 0, W, 140 * u, K.G(90, [0, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)'])));
    o.push(T(64 * u, 52 * u, 600 * u, '{{BRAND|upper}}', 34 * u, { font: 'Montserrat', bold: 800, color: '#ffffff', ls: 80, shadow: { x: 0, y: 2, b: 6, c: 'rgba(0,0,0,.4)' } }));
    o = o.concat(chip(70 * u, 214 * u, u, f));
    o.push(T(64 * u, 440 * u, 700 * u, '{{NAME|upper}}', 38 * u, { font: 'Roboto Mono', bold: 500, color: '#ffffff', ls: 40, shadow: { x: 0, y: 2, b: 6, c: 'rgba(0,0,0,.5)' } }));
    o.push(T(64 * u, 496 * u, 500 * u, 'MEMBER SINCE {{SINCE}}', 16 * u, { font: 'Montserrat', bold: 700, color: '#ffffff', ls: 200 }));
    return pack(o, back(W, H, FIN.black));
  }
  function vertical(fk) { return function (W, H) {
    var f = FIN[fk], u = W / 638, o = [A('metal', 0, 0, W, H, { cols: f.m, fit: 'stretch' }), A('guilloche', -200 * u, 300 * u, 1000 * u, 660 * u, { cols: [f.ink], op: 0.07 })];
    o.push(T(50 * u, 60 * u, W - 100 * u, '{{BRAND|upper}}', 34 * u, { font: 'Montserrat', bold: 800, color: f.ink, ls: 80 }));
    o.push(T(50 * u, 108 * u, W - 100 * u, '{{TIER|upper}}', 20 * u, { font: 'Cinzel', bold: 700, color: f.sub, ls: 200 }));
    o.push(A('medallion', W - 220 * u, 300 * u, 170 * u, 215 * u, { cols: [f.ink, f.m[0]], op: 0.9 }));
    o = o.concat(chip(56 * u, 330 * u, u, f));
    o.push(A('contactless', 56 * u, 470 * u, 40 * u, 48 * u, { cols: [f.ink] }));
    o.push(T(50 * u, H - 200 * u, W - 100 * u, '{{NAME|upper}}', 34 * u, { font: 'Roboto Mono', bold: 500, color: f.ink, ls: 30 }));
    o.push(T(50 * u, H - 140 * u, W - 100 * u, 'MEMBER SINCE {{SINCE}}', 15 * u, { font: 'Montserrat', bold: 700, color: f.sub, ls: 200 }));
    var bk = [A('metal', 0, 0, W, H, { cols: f.m, fit: 'stretch' }), R(60 * u, 0, 110 * u, H, K.G(0, '#2a2a2a', '#0b0b0b', '#2a2a2a')), T(220 * u, 80 * u, W - 270 * u, '{{BACK_NOTE}}', 15 * u, { font: 'Poppins', color: f.ink, lh: 1.45 }), A('holo', W - 180 * u, H - 200 * u, 120 * u, 120 * u), T(220 * u, H - 90 * u, W - 270 * u, '{{BRAND|upper}}', 24 * u, { font: 'Montserrat', bold: 800, color: f.ink, ls: 100 })];
    return pack(o, bk);
  }; }

  var D = [];
  ['platinum', 'gold', 'black', 'rose', 'sapphire', 'emerald'].forEach(function (k) { D.push(['classic-' + k, FIN[k].name + ' Classic', 'Metal classic', ['card'], classic(k)]); });
  ['titanium', 'black', 'gold', 'platinum', 'rose', 'sapphire'].forEach(function (k) { D.push(['modern-' + k, FIN[k].name + ' Modern', 'Metal modern', ['card'], modern(k)]); });
  D.push(['carbon', 'Carbon Gold', 'Special', ['card'], carbon], ['marble', 'Marble Gold', 'Special', ['card'], marble], ['photo', 'Your Photo', 'Special', ['card'], photo]);
  [['aurora', ['#7c3aed', '#db2777', '#f59e0b']], ['ocean', ['#0ea5e9', '#2563eb', '#7c3aed']], ['mint', ['#10b981', '#0d9488', '#0ea5e9']], ['sunset', ['#f43f5e', '#f97316', '#facc15']]].forEach(function (g) { D.push(['neon-' + g[0], g[0][0].toUpperCase() + g[0].slice(1) + ' Gradient', 'Gradient', ['card'], neon(g[1])]); });
  ['black', 'gold', 'platinum'].forEach(function (k) { D.push(['vert-' + k, FIN[k].name + ' Vertical', 'Vertical', ['cardp'], vertical(k)]); });
  ST.register(D.map(function (d) { return { id: 'cs-' + d[0], name: d[1], cat: d[2], sizes: d[3], pal: {}, build: d[4] }; }));
})();
