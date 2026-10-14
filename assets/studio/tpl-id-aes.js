/* S Printer — cute pastel school ID cards (front + back). Original designs by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P, A = K.A;
  var PAL = {
    blush: { a: '#8c3b5e', b: '#e486a6', c: '#fbd5e1', d: '#f3b3c8', bg: '#fdeef3', acc: '#f2c46d', ink: '#4a2737', f: ['#fde2e4', '#f4a6b7', '#d36a85', '#8fb996', '#f9c6d3', '#ffffff'] },
    sky: { a: '#2b4f80', b: '#79aef0', c: '#d6e8fd', d: '#aacdf6', bg: '#ecf4ff', acc: '#f9cf5b', ink: '#1d3150', f: ['#e0f0ff', '#9cc7f5', '#3b75c4', '#8fb5a0', '#fef3c7', '#ffffff'] },
    mint: { a: '#2c6650', b: '#5fbf98', c: '#d2f0e3', d: '#a3dcc4', bg: '#ebf8f1', acc: '#f6a5bd', ink: '#1d3b2f', f: ['#fde2e4', '#f4a6b7', '#d36a85', '#6aa984', '#fff1c1', '#ffffff'] },
    lavender: { a: '#5a3d8a', b: '#a78bfa', c: '#e6dcff', d: '#cbb8ff', bg: '#f3eeff', acc: '#f7a8cf', ink: '#33284a', f: ['#f3e8ff', '#c4b5fd', '#7c3aed', '#9fb7a2', '#fbcfe8', '#ffffff'] },
    butter: { a: '#7a5c0e', b: '#eebd3a', c: '#fbedb9', d: '#f5d983', bg: '#fff9e3', acc: '#f294b0', ink: '#3b3112', f: ['#fff4c7', '#f7d06b', '#c99a1a', '#9cb58a', '#fde2e4', '#ffffff'] },
    peach: { a: '#9a4a2a', b: '#f29b74', c: '#ffdccb', d: '#fbbf9f', bg: '#fff1e8', acc: '#f5c76a', ink: '#4a2c20', f: ['#ffe8d6', '#fdba8c', '#e07a4f', '#9cb58a', '#fde2e4', '#ffffff'] }
  };
  var PN = ['Front', 'Back'];
  function rows(x, y, w, u, p, list, o) {
    o = o || {}; var out = [], rh = (o.rh || 36) * u, lw = w * (o.lw || 0.38);
    list.forEach(function (r, i) {
      var yy = y + i * rh;
      out.push(T(x, yy, lw, r[0], (o.ls || 17) * u, { font: o.f || 'Quicksand', bold: 700, color: p.b }), T(x + lw, yy, w - lw, r[1], (o.vs || 18) * u, { font: o.f || 'Quicksand', bold: 600, color: p.ink }));
    });
    return out;
  }
  function pill(x, y, w, h, fill, text, size, col, font) { return [R(x, y, w, h, fill, { r: h / 2 }), T(x, y + (h - size * 1.2) / 2, w, text, size, { font: font || 'Fredoka', bold: 700, color: col, align: 'center' })]; }
  function sign(x, y, w, u, p) { return [P(x, y, w, 58 * u, 'SIGN', { fill: 'rgba(255,255,255,0.7)', label: 'Principal sign' }), L(x + 8 * u, y + 60 * u, x + w - 8 * u, y + 60 * u, p.a, 1.4 * u), T(x, y + 64 * u, w, 'Principal', 15 * u, { font: 'Quicksand', bold: 700, color: p.a, align: 'center' })]; }
  function schoolHead(x, y, w, u, p, o) {
    o = o || {}; var ls = (o.logo || 84) * u;
    return [P(x, y, ls, ls, 'LOGO', { shape: 'circle', fill: '#ffffff', stroke: p.d, sw: 3 * u })].concat(K.stack(x + ls + 14 * u, w - ls - 14 * u, y - 4 * u, y + ls + 6 * u, [
      { text: '{{ORG_NAME}}', size: (o.size || 30) * u, font: o.font || 'Fredoka', bold: 700, color: o.col || p.a, align: 'left', lh: 1.05, gap: 4 },
      { text: '{{ORG_TAG}}', size: 14 * u, font: 'Quicksand', bold: 600, color: o.sub || p.b, align: 'left', gap: 0, est: 'Affiliated to CBSE · Since 1998' }
    ], { maxK: 1 }));
  }
  function backP(W, H, p) {
    var u = W / 638, o = [R(0, 0, W, H, p.bg), A('dots', 0, H - 260 * u, 260 * u, 260 * u, { cols: [p.c] }), A('cloud', W - 220 * u, 20 * u, 190 * u, 114 * u, { cols: ['#ffffff', p.c] })];
    o.push(R(30 * u, 150 * u, W - 60 * u, H - 210 * u, '#ffffff', { r: 30 * u, stroke: p.d, sw: 3 * u }));
    o = o.concat(schoolHead(34 * u, 34 * u, W - 250 * u, u, p, { logo: 80, size: 26 }));
    o.push(T(50 * u, 176 * u, W - 100 * u, 'Student details', 30 * u, { font: 'Fredoka', bold: 700, color: p.a, align: 'center' }));
    o = o.concat(rows(64 * u, 236 * u, W - 128 * u, u, p, [["Mother's name", '{{MOTHER}}'], ['Session', '{{SESSION}}'], ['Valid till', '{{VALID}}'], ['Emergency', '{{EMERGENCY}}'], ['Address', '{{ADDRESS}}']], { rh: 40, lw: 0.4 }));
    o.push(R(64 * u, 470 * u, W - 128 * u, 130 * u, p.bg, { r: 18 * u }), T(84 * u, 484 * u, W - 168 * u, '♡ Wear this card every day\n♡ Tell the office if it is lost\n♡ If found, please return it to school', 16 * u, { font: 'Quicksand', bold: 600, color: p.ink, lh: 1.5 }));
    o.push(R(64 * u, 630 * u, 180 * u, 180 * u, '#ffffff', { r: 14 * u, stroke: p.d, sw: 2 * u }), K.Q(72 * u, 638 * u, 164 * u, '{{NAME}} | {{ROLE}}-{{DEPT}} | Roll {{ID_NO}} | {{ORG_NAME}}'));
    o = o.concat(sign(W - 260 * u, 680 * u, 200 * u, u, p));
    o.push(T(50 * u, 850 * u, W - 100 * u, '{{ORG_ADDRESS}}\n☎ {{ORG_PHONE}}', 15 * u, { font: 'Quicksand', bold: 600, color: p.a, align: 'center', lh: 1.35 }));
    return o;
  }
  function backL(W, H, p) {
    var u = W / 1012, o = [R(0, 0, W, H, p.bg), R(24 * u, 24 * u, W - 48 * u, H - 48 * u, '#ffffff', { r: 28 * u, stroke: p.d, sw: 3 * u })];
    o = o.concat(schoolHead(50 * u, 46 * u, W - 330 * u, u, p, { logo: 70, size: 26 }));
    o = o.concat(rows(56 * u, 150 * u, 560 * u, u, p, [["Mother's name", '{{MOTHER}}'], ['Session', '{{SESSION}}'], ['Valid till', '{{VALID}}'], ['Emergency', '{{EMERGENCY}}'], ['Address', '{{ADDRESS}}']], { rh: 40, lw: 0.34 }));
    o.push(T(56 * u, 380 * u, 560 * u, '♡ Wear this card every day   ♡ If found, please return it to school', 15 * u, { font: 'Quicksand', bold: 600, color: p.ink }));
    o.push(K.Q(W - 240 * u, 60 * u, 180 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'));
    o = o.concat(sign(W - 260 * u, 330 * u, 220 * u, u, p));
    o.push(T(50 * u, H - 92 * u, W - 100 * u, '{{ORG_ADDRESS}}  ·  ☎ {{ORG_PHONE}}', 15 * u, { font: 'Quicksand', bold: 600, color: p.a, align: 'center' }));
    return o;
  }
  var R5 = [['Roll No.', '{{ID_NO}}'], ["Father", '{{FATHER}}'], ['Birthday', '{{DOB}}'], ['Blood', '{{BLOOD}}'], ['Phone', '{{PHONE}}']];
  var layouts = [
    { id: 'rainbow', name: 'Rainbow Kids', sizes: ['idp'], pals: ['sky', 'blush', 'mint', 'lavender'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, W, H, K.G(180, p.c, '#ffffff'))];
      o.push(A('rainbow', W - 250 * u, 150 * u, 230 * u, 132 * u, { cols: ['#fca5a5', '#fdba74', '#fde68a', '#a7f3d0', '#bfdbfe', '#ddd6fe'] }), A('cloud', W - 270 * u, 230 * u, 140 * u, 84 * u, { cols: ['#ffffff', p.d] }), A('cloud', 10 * u, 250 * u, 130 * u, 78 * u, { cols: ['#ffffff', p.d] }), A('star', 40 * u, 170 * u, 36 * u, 36 * u, { cols: [p.acc] }));
      o = o.concat(schoolHead(30 * u, 28 * u, W - 60 * u, u, p, {}));
      o.push(R(W / 2 - 128 * u, 228 * u, 256 * u, 296 * u, '#ffffff', { r: 36 * u, shadow: { y: 6, b: 18, c: 'rgba(30,50,90,.15)' } }), P(W / 2 - 116 * u, 240 * u, 232 * u, 272 * u, 'PHOTO', { r: 28 * u, fill: p.c, sw: 0 }));
      o.push(T(30 * u, 540 * u, W - 60 * u, '{{NAME}}', 40 * u, { font: 'Fredoka', bold: 700, color: p.a, align: 'center' }));
      o = o.concat(pill(W / 2 - 150 * u, 596 * u, 300 * u, 44 * u, p.b, '{{ROLE}} · Sec {{DEPT}}', 20 * u, '#ffffff'));
      o = o.concat(rows(80 * u, 664 * u, W - 160 * u, u, p, R5, { rh: 34 }));
      o = o.concat(sign(W - 230 * u, 846 * u, 190 * u, u, p));
      o.push(T(36 * u, 866 * u, 240 * u, 'Session\n{{SESSION}}', 17 * u, { font: 'Fredoka', bold: 700, color: p.a, lh: 1.25 }));
      o.push(R(0, H - 26 * u, W, 26 * u, p.b));
      return { pageNames: PN, pages: [{ bg: '#ffffff', objects: o }, { bg: p.bg, objects: backP(W, H, p) }] };
    } },
    { id: 'floral', name: 'Floral Pastel', sizes: ['idp'], pals: ['blush', 'lavender', 'peach', 'mint'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, W, H, p.bg), A('blob', -90 * u, -70 * u, 330 * u, 264 * u, { cols: [p.c] }), A('blob', W - 220 * u, H - 200 * u, 330 * u, 264 * u, { cols: [p.c] })];
      o.push(A('bouquet', -16 * u, -16 * u, 200 * u, 200 * u, { cols: p.f }), A('bouquet', W - 184 * u, H - 184 * u, 200 * u, 200 * u, { cols: p.f, flipX: true, flipY: true }));
      o.push(R(36 * u, 150 * u, W - 72 * u, H - 250 * u, 'rgba(255,255,255,0.92)', { r: 36 * u, shadow: { y: 6, b: 20, c: 'rgba(120,40,70,.10)' } }));
      o.push(P(W - 140 * u, 30 * u, 100 * u, 100 * u, 'LOGO', { shape: 'circle', fill: '#ffffff', stroke: p.d, sw: 3 * u }));
      o = o.concat(K.stack(200 * u, W - 360 * u, 30 * u, 130 * u, [{ text: '{{ORG_NAME}}', size: 28 * u, font: 'Playfair Display', bold: 700, color: p.a, align: 'right', lh: 1.05, gap: 4 }, { text: '{{ORG_TAG}}', size: 13 * u, font: 'Quicksand', bold: 600, color: p.b, align: 'right', gap: 0 }], { maxK: 1 }));
      o.push(C(W / 2, 312 * u, 122 * u, p.d), P(W / 2 - 112 * u, 200 * u, 224 * u, 224 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: '#ffffff', sw: 6 * u }));
      o.push(T(50 * u, 452 * u, W - 100 * u, '{{NAME}}', 46 * u, { font: 'Dancing Script', bold: 700, color: p.a, align: 'center' }));
      o.push(T(50 * u, 516 * u, W - 100 * u, '{{ROLE|upper}}  ·  SECTION {{DEPT|upper}}', 17 * u, { font: 'Quicksand', bold: 700, color: p.b, align: 'center', ls: 120 }));
      o = o.concat(rows(80 * u, 570 * u, W - 160 * u, u, p, R5, { rh: 36 }));
      o = o.concat(sign(W / 2 - 100 * u, 770 * u, 200 * u, u, p));
      return { pageNames: PN, pages: [{ bg: p.bg, objects: o }, { bg: p.bg, objects: backP(W, H, p) }] };
    } },
    { id: 'bfly', name: 'Butterfly Sweet', sizes: ['idp'], pals: ['lavender', 'sky', 'blush', 'mint'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, W, H, K.G(160, p.c, '#ffffff', p.c)), A('dots', 0, 0, 638 * u, 300 * u, { cols: ['#ffffff'], op: 0.7 })];
      o.push(A('butterfly', W - 190 * u, 210 * u, 150 * u, 130 * u, { cols: [p.c, p.b, p.a], angle: 16 }), A('butterfly', 30 * u, 380 * u, 100 * u, 87 * u, { cols: [p.c, p.d, p.a], angle: -16 }), A('sparkles', 60 * u, 190 * u, 80 * u, 80 * u, { cols: [p.acc, p.b] }));
      o = o.concat(schoolHead(30 * u, 28 * u, W - 60 * u, u, p, { font: 'Quicksand' }));
      o.push(R(W / 2 - 120 * u, 200 * u, 240 * u, 300 * u, '#ffffff', { r: 120 * u, shadow: { y: 6, b: 18, c: 'rgba(60,30,90,.15)' } }), P(W / 2 - 108 * u, 212 * u, 216 * u, 276 * u, 'PHOTO', { r: 108 * u, fill: p.c, sw: 0 }));
      o.push(T(30 * u, 520 * u, W - 60 * u, '{{NAME}}', 42 * u, { font: 'Pacifico', color: p.a, align: 'center' }));
      o = o.concat(pill(W / 2 - 150 * u, 590 * u, 300 * u, 42 * u, '#ffffff', '{{ROLE}} · Sec {{DEPT}}', 19 * u, p.a, 'Quicksand'));
      o.push(R(50 * u, 650 * u, W - 100 * u, 200 * u, 'rgba(255,255,255,0.85)', { r: 24 * u }));
      o = o.concat(rows(76 * u, 668 * u, W - 152 * u, u, p, R5, { rh: 34 }));
      o = o.concat(sign(W - 230 * u, 868 * u, 190 * u, u, p));
      o.push(T(40 * u, 890 * u, 240 * u, 'Session {{SESSION}}', 16 * u, { font: 'Quicksand', bold: 700, color: p.a }));
      return { pageNames: PN, pages: [{ bg: '#ffffff', objects: o }, { bg: p.bg, objects: backP(W, H, p) }] };
    } },
    { id: 'daisy', name: 'Daisy Days', sizes: ['idp'], pals: ['butter', 'mint', 'sky', 'peach'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, W, H, p.bg)];
      [[20, 20, 90], [520, 10, 100], [560, 470, 60], [10, 520, 70], [500, 900, 110], [30, 900, 90], [280, 950, 60]].forEach(function (d, i) { o.push(A('daisy', d[0] * u, d[1] * u, d[2] * u, d[2] * u, { cols: ['#ffffff', i % 2 ? p.acc : '#f7c948'] })); });
      o.push(R(40 * u, 120 * u, W - 80 * u, 770 * u, '#ffffff', { r: 40 * u, stroke: p.d, sw: 4 * u, dash: [12 * u, 8 * u] }));
      o.push(P(W / 2 - 46 * u, 76 * u, 92 * u, 92 * u, 'LOGO', { shape: 'circle', fill: '#ffffff', stroke: p.d, sw: 3 * u }));
      o = o.concat(K.stack(70 * u, W - 140 * u, 176 * u, 256 * u, [{ text: '{{ORG_NAME}}', size: 28 * u, font: 'Sniglet', bold: 800, color: p.a, lh: 1.05, gap: 2 }, { text: '{{ORG_TAG}}', size: 13 * u, font: 'Quicksand', bold: 600, color: p.b, gap: 0 }], { maxK: 1 }));
      o.push(R(W / 2 - 110 * u, 270 * u, 220 * u, 260 * u, p.c, { r: 24 * u }), P(W / 2 - 100 * u, 280 * u, 200 * u, 240 * u, 'PHOTO', { r: 18 * u, fill: '#ffffff', sw: 0 }));
      o.push(T(60 * u, 546 * u, W - 120 * u, '{{NAME}}', 38 * u, { font: 'Sniglet', bold: 800, color: p.ink, align: 'center' }));
      o = o.concat(pill(W / 2 - 140 * u, 600 * u, 280 * u, 40 * u, p.b, '{{ROLE}} · Sec {{DEPT}}', 18 * u, '#ffffff'));
      o = o.concat(rows(90 * u, 660 * u, W - 180 * u, u, p, [['Roll No.', '{{ID_NO}}'], ['Birthday', '{{DOB}}'], ['Blood', '{{BLOOD}}'], ['Phone', '{{PHONE}}']], { rh: 34 }));
      o = o.concat(sign(W / 2 - 95 * u, 790 * u, 190 * u, u, p));
      return { pageNames: PN, pages: [{ bg: p.bg, objects: o }, { bg: p.bg, objects: backP(W, H, p) }] };
    } },
    { id: 'cloudl', name: 'Cloud Landscape', sizes: ['idl'], pals: ['sky', 'blush', 'lavender', 'mint'], build: function (W, H, p) {
      var u = W / 1012, o = [R(0, 0, W, H, '#ffffff'), R(0, 0, 340 * u, H, K.G(180, p.c, p.bg))];
      o.push(A('rainbow', 30 * u, 26 * u, 180 * u, 104 * u, { cols: ['#fca5a5', '#fdba74', '#fde68a', '#a7f3d0', '#bfdbfe', '#ddd6fe'] }), A('cloud', 150 * u, 60 * u, 150 * u, 90 * u, { cols: ['#ffffff', p.d] }), A('cloud', 20 * u, H - 120 * u, 170 * u, 102 * u, { cols: ['#ffffff', p.d] }), A('star', 260 * u, H - 110 * u, 40 * u, 40 * u, { cols: [p.acc] }));
      o.push(R(60 * u, 150 * u, 220 * u, 270 * u, '#ffffff', { r: 30 * u, shadow: { y: 6, b: 18, c: 'rgba(30,50,90,.15)' } }), P(70 * u, 160 * u, 200 * u, 250 * u, 'PHOTO', { r: 24 * u, fill: p.c, sw: 0 }));
      o = o.concat(schoolHead(370 * u, 30 * u, W - 400 * u, u, p, { logo: 80, size: 30 }));
      o.push(T(370 * u, 140 * u, W - 400 * u, '{{NAME}}', 38 * u, { font: 'Fredoka', bold: 700, color: p.ink }));
      o = o.concat(pill(370 * u, 196 * u, 270 * u, 40 * u, p.b, '{{ROLE}} · Sec {{DEPT}}', 18 * u, '#ffffff'));
      o = o.concat(rows(370 * u, 256 * u, 420 * u, u, p, R5.slice(0, 4).concat([['Session', '{{SESSION}}']]), { rh: 34 }));
      o = o.concat(sign(W - 230 * u, 400 * u, 190 * u, u, p));
      o.push(R(340 * u, H - 18 * u, W - 340 * u, 18 * u, p.b));
      return { pageNames: PN, pages: [{ bg: '#ffffff', objects: o }, { bg: p.bg, objects: backL(W, H, p) }] };
    } }
  ];
  var out = [];
  layouts.forEach(function (L) { L.pals.forEach(function (k, i) { out.push({ id: 'ida-' + L.id + '-' + k, name: L.name + (i ? ' · ' + k[0].toUpperCase() + k.slice(1) : ''), cat: 'Cute School', sizes: L.sizes, pal: PAL[k], build: L.build }); }); });
  [].unshift.apply(ST.templates, out);
})();
