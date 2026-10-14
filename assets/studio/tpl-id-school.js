/* S Printer — School / student identity cards (front + back). Original designs, portrait and landscape.
 * Class = {{ROLE}}, Section = {{DEPT}}, Roll / admission no. = {{ID_NO}}. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P;
  var PN = ['Front', 'Back'];
  var SHADOW = { y: 6, b: 18, c: 'rgba(15,23,42,.22)' };

  function hex(cx, cy, r, fill, o) { var p = []; for (var i = 0; i < 6; i++) { var a = Math.PI / 3 * i - Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return K.POLY(p, fill, o); }
  function sign(x, y, w, u, col, label) {
    return [P(x, y, w, 62 * u, 'SIGN', { fill: 'rgba(255,255,255,0.9)', label: 'Principal sign' }), L(x + 10 * u, y + 64 * u, x + w - 10 * u, y + 64 * u, col || '#334155', 1.5 * u),
      T(x, y + 68 * u, w, label || 'Principal', 16 * u, { align: 'center', bold: 700, color: col || '#334155' })];
  }
  // school header: logo + name + tagline (left aligned, after the logo)
  function head(x, y, W, u, o) {
    var ls = o.logo || 96 * u, out = [P(x, y, ls, ls, 'LOGO', { shape: 'circle', fill: o.logoBg || '#ffffff', sw: o.logoSw || 0, stroke: o.logoStroke })];
    var tx = x + ls + 16 * u, tw = W - tx - (o.right || 24 * u);
    out = out.concat(K.stack(tx, tw, y - 4 * u, y + ls + 8 * u, [
      { text: '{{ORG_NAME}}', size: o.size || 30 * u, font: o.font || 'Montserrat', bold: 800, color: o.color || '#fff', lh: 1.05, align: 'left', gap: 4 * u },
      { text: o.sub || '{{ORG_TAG}}', size: o.subSize || 15 * u, color: o.subColor || 'rgba(255,255,255,0.85)', align: 'left', gap: 0, lh: 1.2, est: 'Affiliated to CBSE · Since 1998' }
    ], { maxK: 1 }));
    return out;
  }
  // centred header (logo above the name)
  function headC(W, y, u, o) {
    var ls = o.logo || 92 * u, out = [P(W / 2 - ls / 2, y, ls, ls, 'LOGO', { shape: 'circle', fill: o.logoBg || '#ffffff', sw: o.logoSw || 0, stroke: o.logoStroke })];
    out = out.concat(K.stack(30 * u, W - 60 * u, y + ls + 6 * u, y + ls + (o.h || 96) * u, [
      { text: o.upper ? '{{ORG_NAME|upper}}' : '{{ORG_NAME}}', size: o.size || 30 * u, font: o.font || 'Montserrat', bold: o.bold || 800, color: o.color || '#fff', lh: 1.05, gap: 4 * u, ls: o.ls || 0 },
      { text: '{{ORG_TAG}}', size: o.subSize || 15 * u, color: o.subColor || 'rgba(255,255,255,0.85)', gap: 0, italic: o.italic, est: 'Affiliated to CBSE · Since 1998' }
    ], { maxK: 1 }));
    return out;
  }
  function pill(x, y, w, h, fill, text, size, col, o) {
    o = o || {};
    return [R(x, y, w, h, fill, { r: h / 2, shadow: o.shadow }), T(x, y + (h - size * 1.2) / 2, w, text, size, { bold: o.bold || 800, color: col, align: 'center', ls: o.ls == null ? 120 : o.ls, font: o.font || 'Poppins' })];
  }
  function rows(x, y, w, u, list, o) { o = o || {}; return K.rows(x, y, w, list, o.size || 20 * u, { kw: o.kw || 0.34, gap: o.gap || 1.62, kc: o.kc, vc: o.vc, zebra: o.zebra }); }
  var R5 = [['Roll No.', '{{ID_NO}}'], ["Father's name", '{{FATHER}}'], ['D.O.B.', '{{DOB}}'], ['Blood group', '{{BLOOD}}'], ['Phone', '{{PHONE}}']];
  var R6 = [['Class / Sec.', '{{ROLE}} – {{DEPT}}']].concat(R5);

  // ---------- backs ----------
  var RULES = '•  Wear this card every day in school.\n•  Report a lost card to the school office at once.\n•  This card is not transferable.';
  function backP(W, H, p) {
    var u = W / 638, o = [R(0, 0, W, 150 * u, K.G(20, p.a, p.b)), R(0, 150 * u, W, 8 * u, p.acc)];
    o = o.concat(head(26 * u, 26 * u, W, u, { logo: 96 * u, size: 28 * u }));
    o.push(T(0, 184 * u, W, 'STUDENT DETAILS', 20 * u, { font: 'Montserrat', bold: 800, color: p.a, align: 'center', ls: 200 }));
    o = o.concat(rows(50 * u, 232 * u, W - 100 * u, u, [["Mother's name", '{{MOTHER}}'], ['Session', '{{SESSION}}'], ['Valid till', '{{VALID}}'], ['Emergency', '{{EMERGENCY}}'], ['Address', '{{ADDRESS}}']], { kw: 0.36, gap: 1.75, zebra: p.soft }));
    o.push(R(40 * u, 470 * u, W - 80 * u, 150 * u, p.soft, { r: 14 * u }));
    o.push(T(60 * u, 486 * u, W - 120 * u, 'RULES', 16 * u, { bold: 800, color: p.b, ls: 200, font: 'Montserrat' }));
    o.push(T(60 * u, 516 * u, W - 120 * u, RULES, 16 * u, { lh: 1.45, color: '#334155' }));
    o.push(R(46 * u, 650 * u, 186 * u, 186 * u, '#fff', { r: 10 * u, stroke: p.c, sw: 2 * u }));
    o.push(K.Q(54 * u, 658 * u, 170 * u, '{{NAME}} | {{ROLE}}-{{DEPT}} | Roll {{ID_NO}} | {{ORG_NAME}} | {{PHONE}}'));
    o = o.concat(sign(W - 256 * u, 690 * u, 206 * u, u, p.a));
    o.push(T(30 * u, 862 * u, W - 60 * u, '{{ORG_ADDRESS}}\n☎ {{ORG_PHONE}}  ·  {{ORG_WEB}}', 17 * u, { align: 'center', color: '#334155', lh: 1.35 }));
    o.push(R(0, H - 56 * u, W, 56 * u, p.a));
    o.push(T(0, H - 40 * u, W, 'If found, please return to the school office', 16 * u, { align: 'center', color: '#fff', bold: 600 }));
    return o;
  }
  function backL(W, H, p) {
    var u = W / 1012, o = [R(0, 0, W, 108 * u, K.G(0, p.a, p.b)), R(0, 108 * u, W, 6 * u, p.acc)];
    o = o.concat(head(24 * u, 16 * u, W, u, { logo: 76 * u, size: 30 * u, right: 30 * u }));
    o = o.concat(rows(40 * u, 140 * u, 590 * u, u, [["Mother's name", '{{MOTHER}}'], ['Session', '{{SESSION}}'], ['Valid till', '{{VALID}}'], ['Emergency', '{{EMERGENCY}}'], ['Address', '{{ADDRESS}}']], { kw: 0.3, gap: 1.6, zebra: p.soft }));
    o.push(T(40 * u, 372 * u, 590 * u, RULES, 16 * u, { lh: 1.45, color: '#334155' }));
    o.push(K.Q(W - 240 * u, 134 * u, 190 * u, '{{NAME}} | {{ROLE}}-{{DEPT}} | Roll {{ID_NO}} | {{ORG_NAME}}'));
    o = o.concat(sign(W - 270 * u, 356 * u, 250 * u, u, p.a));
    o.push(R(0, H - 62 * u, W, 62 * u, p.a));
    o.push(T(30 * u, H - 52 * u, W - 60 * u, '{{ORG_ADDRESS}}  ·  ☎ {{ORG_PHONE}}\nIf found, please return to the school office', 15 * u, { align: 'center', color: '#fff', lh: 1.3 }));
    return o;
  }
  function pp(o, bg, p, back) { return { pageNames: PN, pages: [{ bg: bg, objects: o }, { bg: '#ffffff', objects: back(p) }] }; }

  var layouts = [
    // 1 — playful wave with a ringed round photo
    { id: 'kids', name: 'Kids Rainbow', cat: 'School', sizes: ['idp'], pals: ['blue', 'rose', 'green', 'purple'], build: function (W, H, p) {
      var u = W / 638, o = [K.wave(W, H, 236 * u, 26 * u, K.G(120, p.a, p.b), false)];
      o.push(C(W - 40 * u, 30 * u, 110 * u, 'rgba(255,255,255,0.10)'), C(70 * u, 214 * u, 46 * u, 'rgba(255,255,255,0.10)'));
      o.push(K.burst(W - 70 * u, 182 * u, 16 * u, 7 * u, 5, p.acc), K.burst(40 * u, 150 * u, 10 * u, 4 * u, 5, '#fff', { op: 0.8 }));
      o = o.concat(head(28 * u, 26 * u, W, u, {}));
      o.push(C(W / 2, 360 * u, 134 * u, null, { stroke: p.b, sw: 3 * u, dash: [10 * u, 8 * u] }));
      o.push(C(W / 2, 360 * u, 122 * u, p.acc));
      o.push(P(W / 2 - 112 * u, 248 * u, 224 * u, 224 * u, 'PHOTO', { shape: 'circle', fill: p.soft, stroke: '#ffffff', sw: 6 * u }));
      o.push(T(30 * u, 504 * u, W - 60 * u, '{{NAME}}', 38 * u, { bold: 800, color: p.a, align: 'center' }));
      o = o.concat(pill(W / 2 - 160 * u, 556 * u, 320 * u, 44 * u, p.b, '{{ROLE|upper}} · SEC. {{DEPT|upper}}', 18 * u, '#fff', { ls: 60 }));
      o = o.concat(rows(70 * u, 626 * u, W - 140 * u, u, R5, { size: 20 * u }));
      o.push(T(40 * u, 808 * u, 260 * u, 'SESSION\n{{SESSION}}', 17 * u, { bold: 700, color: p.a, lh: 1.3 }));
      o = o.concat(sign(W - 236 * u, 800 * u, 196 * u, u, p.a));
      o.push(K.wave(W, H, H - 62 * u, 16 * u, K.G(0, p.b, p.a), true));
      [0.12, 0.3, 0.55, 0.78, 0.92].forEach(function (k, i) { o.push(C(W * k, H - 26 * u - (i % 2) * 10 * u, 6 * u, i % 2 ? p.acc : '#fff', { op: 0.9 })); });
      return pp(o, '#ffffff', p, function (q) { return backP(W, H, q); });
    } },
    // 2 — wave header, centred logo, photo card with shadow
    { id: 'swave', name: 'School Wave', cat: 'School', sizes: ['idp'], pals: ['navy', 'teal', 'maroon', 'purple'], build: function (W, H, p) {
      var u = W / 638, o = [K.wave(W, H, 300 * u, 24 * u, K.G(160, p.a, p.b), false), C(W * 0.9, 40 * u, 120 * u, 'rgba(255,255,255,0.07)')];
      o = o.concat(headC(W, 18 * u, u, { logo: 88 * u, size: 28 * u, h: 100 }));
      o.push(R(W / 2 - 118 * u, 236 * u, 236 * u, 284 * u, '#fff', { r: 20 * u, shadow: SHADOW }));
      o.push(P(W / 2 - 108 * u, 246 * u, 216 * u, 264 * u, 'PHOTO', { r: 14 * u, fill: p.soft, sw: 0 }));
      o.push(T(30 * u, 540 * u, W - 60 * u, '{{NAME}}', 36 * u, { bold: 800, color: p.a, align: 'center' }));
      o.push(T(30 * u, 590 * u, W - 60 * u, '{{ROLE|upper}}  ·  SECTION {{DEPT|upper}}', 18 * u, { bold: 700, color: p.b, align: 'center', ls: 80 }));
      o = o.concat(rows(70 * u, 640 * u, W - 140 * u, u, R5, { size: 19 * u, zebra: p.soft }));
      o = o.concat(sign(W - 236 * u, 812 * u, 196 * u, u, p.a));
      o.push(T(40 * u, 830 * u, 280 * u, 'Session {{SESSION}}', 17 * u, { bold: 700, color: p.a }));
      o.push(K.wave(W, H, H - 58 * u, 16 * u, p.a, true));
      return pp(o, '#ffffff', p, function (q) { return backP(W, H, q); });
    } },
    // 3 — diagonal header, photo left with the name beside it
    { id: 'sdiag', name: 'Diagonal Modern', cat: 'School', sizes: ['idp'], pals: ['blue', 'green', 'orange', 'slate'], build: function (W, H, p) {
      var u = W / 638, o = [K.POLY([[0, 0], [W, 0], [W, 170 * u], [0, 250 * u]], K.G(30, p.a, p.b)), K.POLY([[0, 250 * u], [W, 170 * u], [W, 186 * u], [0, 266 * u]], p.acc)];
      o = o.concat(head(26 * u, 26 * u, W, u, {}));
      o.push(P(40 * u, 300 * u, 220 * u, 270 * u, 'PHOTO', { r: 14 * u, fill: p.soft, stroke: p.b, sw: 5 * u }));
      o = o.concat(K.stack(286 * u, W - 316 * u, 300 * u, 570 * u, [
        { text: 'STUDENT', size: 16 * u, bold: 800, color: p.b, ls: 300, align: 'left', gap: 6 * u },
        { text: '{{NAME}}', size: 36 * u, bold: 800, color: p.a, align: 'left', lh: 1.05, gap: 14 * u },
        { text: '{{ROLE}}', size: 20 * u, bold: 600, color: p.ink, align: 'left', gap: 4 * u },
        { text: 'Section  {{DEPT}}', size: 20 * u, bold: 600, color: p.ink, align: 'left', gap: 14 * u },
        { text: 'ROLL  {{ID_NO}}', size: 22 * u, bold: 800, color: '#fff', bg: p.b, align: 'left', gap: 0 }
      ], { maxK: 1, valign: 'top' }));
      o = o.concat(rows(50 * u, 610 * u, W - 100 * u, u, [["Father's name", '{{FATHER}}'], ["Mother's name", '{{MOTHER}}'], ['D.O.B.', '{{DOB}}'], ['Blood group', '{{BLOOD}}'], ['Phone', '{{PHONE}}']], { size: 19 * u }));
      o = o.concat(sign(W - 246 * u, 790 * u, 200 * u, u, p.a));
      o.push(T(50 * u, 812 * u, 260 * u, 'Session\n{{SESSION}}', 17 * u, { bold: 700, color: p.a, lh: 1.3 }));
      o.push(K.POLY([[0, H], [W, H], [W, H - 100 * u], [0, H - 36 * u]], K.G(30, p.a, p.b)));
      return pp(o, '#ffffff', p, function (q) { return backP(W, H, q); });
    } },
    // 4 — crest header with a name ribbon
    { id: 'sribbon', name: 'Ribbon Crest', cat: 'School', sizes: ['idp'], pals: ['maroon', 'navy', 'emerald', 'purple'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, W, 190 * u, K.G(90, p.a, p.b)), R(0, 190 * u, W, 6 * u, p.d)];
      o = o.concat(K.stack(30 * u, W - 60 * u, 16 * u, 130 * u, [
        { text: '{{ORG_NAME|upper}}', size: 30 * u, font: 'Cinzel', bold: 700, color: '#fff', lh: 1.05, gap: 6 * u },
        { text: '{{ORG_TAG}}', size: 15 * u, color: p.c, italic: true, gap: 0, est: 'Affiliated to CBSE · Since 1998' }
      ], { maxK: 1 }));
      o.push(C(W / 2, 196 * u, 62 * u, '#fff', { shadow: SHADOW }));
      o.push(P(W / 2 - 54 * u, 142 * u, 108 * u, 108 * u, 'LOGO', { shape: 'circle', fill: '#fff', sw: 0 }));
      o.push(P(W / 2 - 104 * u, 282 * u, 208 * u, 244 * u, 'PHOTO', { r: 10 * u, fill: p.soft, stroke: p.d, sw: 5 * u }));
      o.push(K.POLY([[18 * u, 556 * u], [70 * u, 556 * u], [70 * u, 620 * u], [18 * u, 620 * u], [40 * u, 588 * u]], p.a));
      o.push(K.POLY([[W - 18 * u, 556 * u], [W - 70 * u, 556 * u], [W - 70 * u, 620 * u], [W - 18 * u, 620 * u], [W - 40 * u, 588 * u]], p.a));
      o.push(R(50 * u, 544 * u, W - 100 * u, 64 * u, p.b, { shadow: { y: 3, b: 8, c: 'rgba(0,0,0,.2)' } }));
      o.push(T(60 * u, 556 * u, W - 120 * u, '{{NAME|upper}}', 32 * u, { bold: 800, color: '#fff', align: 'center' }));
      o = o.concat(rows(70 * u, 640 * u, W - 140 * u, u, R6.slice(0, 5), { size: 19 * u }));
      o = o.concat(sign(W - 236 * u, 812 * u, 196 * u, u, p.a));
      o.push(T(46 * u, 830 * u, 280 * u, 'Session {{SESSION}}', 17 * u, { bold: 700, color: p.a }));
      o.push(R(0, H - 30 * u, W, 30 * u, p.a), R(0, H - 36 * u, W, 6 * u, p.d));
      return pp(o, p.soft, p, function (q) { return backP(W, H, q); });
    } },
    // 5 — side band with vertical title
    { id: 'sside', name: 'Side Stripe', cat: 'School', sizes: ['idp'], pals: ['teal', 'blue', 'rose', 'orange'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, 112 * u, H, K.G(180, p.a, p.b)), R(112 * u, 0, 8 * u, H, p.acc)];
      o.push(T(36 * u, H - 50 * u, H - 100 * u, 'STUDENT IDENTITY CARD', 40 * u, { font: 'Bebas Neue', color: '#fff', ls: 300, align: 'center', angle: -90 }));
      o = o.concat(head(146 * u, 30 * u, W, u, { logo: 80 * u, size: 26 * u, color: p.a, subColor: '#64748b', logoBg: p.soft }));
      o.push(L(146 * u, 136 * u, W - 30 * u, 136 * u, p.c, 2 * u));
      o.push(P(146 * u, 160 * u, 230 * u, 280 * u, 'PHOTO', { r: 16 * u, fill: p.soft, sw: 0 }));
      o.push(R(396 * u, 160 * u, W - 426 * u, 280 * u, p.soft, { r: 16 * u }));
      o = o.concat(K.stack(406 * u, W - 446 * u, 172 * u, 430 * u, [
        { text: 'CLASS', size: 14 * u, bold: 700, color: '#64748b', ls: 200, gap: 0 }, { text: '{{ROLE}}', size: 26 * u, bold: 800, color: p.a, gap: 12 * u },
        { text: 'SECTION', size: 14 * u, bold: 700, color: '#64748b', ls: 200, gap: 0 }, { text: '{{DEPT}}', size: 28 * u, bold: 800, color: p.a, gap: 12 * u },
        { text: 'ROLL NO.', size: 14 * u, bold: 700, color: '#64748b', ls: 200, gap: 0 }, { text: '{{ID_NO}}', size: 24 * u, bold: 800, color: p.b, gap: 0 }
      ], { maxK: 1 }));
      o.push(T(146 * u, 466 * u, W - 176 * u, '{{NAME}}', 38 * u, { bold: 800, color: p.ink, lh: 1.05 }));
      o = o.concat(rows(146 * u, 560 * u, W - 186 * u, u, [["Father's name", '{{FATHER}}'], ['D.O.B.', '{{DOB}}'], ['Blood group', '{{BLOOD}}'], ['Phone', '{{PHONE}}'], ['Session', '{{SESSION}}']], { size: 19 * u, kw: 0.4 }));
      o.push(K.B(146 * u, 790 * u, 230 * u, 100 * u, '{{ID_NO}}'));
      o = o.concat(sign(W - 226 * u, 800 * u, 196 * u, u, p.a));
      return pp(o, '#ffffff', p, function (q) { return backP(W, H, q); });
    } },
    // 6 — hexagon pattern and a photo in a hexagon
    { id: 'shex', name: 'Hexagon Geo', cat: 'School', sizes: ['idp'], pals: ['purple', 'teal', 'navy', 'green'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, W, 200 * u, p.a)];
      [[W - 40, 20, 70, 0.14], [W - 150, 70, 46, 0.1], [W - 40, 150, 40, 0.18], [60, 180, 30, 0.12]].forEach(function (h) { o.push(hex(h[0] * u, h[1] * u, h[2] * u, '#fff', { op: h[3] })); });
      o = o.concat(head(26 * u, 26 * u, W, u, { right: 60 * u }));
      o.push(hex(W / 2, 360 * u, 170 * u, p.b, { shadow: SHADOW }));
      o.push(hex(W / 2, 360 * u, 156 * u, '#fff'));
      o.push(P(W / 2 - 118 * u, 242 * u, 236 * u, 236 * u, 'PHOTO', { shape: 'circle', fill: p.soft, stroke: p.d, sw: 4 * u }));
      o.push(T(30 * u, 544 * u, W - 60 * u, '{{NAME}}', 36 * u, { bold: 800, color: p.a, align: 'center' }));
      o = o.concat(pill(W / 2 - 150 * u, 594 * u, 300 * u, 40 * u, p.soft, '{{ROLE|upper}} · SEC. {{DEPT|upper}}', 17 * u, p.a, { ls: 60 }));
      o = o.concat(rows(70 * u, 660 * u, W - 140 * u, u, R5, { size: 19 * u }));
      o = o.concat(sign(W - 236 * u, 832 * u, 196 * u, u, p.a));
      o.push(T(46 * u, 850 * u, 260 * u, 'Session {{SESSION}}', 17 * u, { bold: 700, color: p.a }));
      o.push(R(0, H - 24 * u, W, 24 * u, p.a));
      [80, 200, 320, 440, 560].forEach(function (x, i) { o.push(hex(x * u, H - 24 * u, 14 * u, i % 2 ? p.b : p.d)); });
      return pp(o, '#ffffff', p, function (q) { return backP(W, H, q); });
    } },
    // 7 — royal double frame with flourishes
    { id: 'sroyal', name: 'Royal Frame', cat: 'School', sizes: ['idp'], pals: ['maroon', 'emerald', 'navy', 'gold'], build: function (W, H, p) {
      var u = W / 638, o = K.frame(W, H, 16 * u, p.b, p.d, true);
      o = o.concat(headC(W, 44 * u, u, { logo: 84 * u, size: 26 * u, font: 'Cinzel', bold: 700, color: p.a, subColor: p.b, italic: true, logoBg: p.soft, logoSw: 2 * u, logoStroke: p.d, h: 96, upper: true }));
      o = o.concat(K.divider(W / 2, 236 * u, 300 * u, p.d));
      o.push(R(W / 2 - 112 * u, 260 * u, 224 * u, 264 * u, null, { stroke: p.d, sw: 2 * u }));
      o.push(P(W / 2 - 102 * u, 270 * u, 204 * u, 244 * u, 'PHOTO', { fill: p.soft, stroke: p.b, sw: 3 * u }));
      o.push(T(40 * u, 544 * u, W - 80 * u, '{{NAME}}', 32 * u, { font: 'Cinzel', bold: 700, color: p.a, align: 'center' }));
      o.push(T(40 * u, 590 * u, W - 80 * u, '{{ROLE}}  ·  Section {{DEPT}}', 19 * u, { color: p.b, bold: 600, align: 'center' }));
      o = o.concat(rows(80 * u, 640 * u, W - 160 * u, u, R5, { size: 18 * u, kc: p.a }));
      o = o.concat(sign(W - 256 * u, 806 * u, 186 * u, u, p.a));
      o.push(T(76 * u, 824 * u, 240 * u, 'Session\n{{SESSION}}', 16 * u, { bold: 700, color: p.a, lh: 1.3 }));
      return pp(o, '#fffdf6', p, function (q) { return backP(W, H, q); });
    } },
    // 8 — gradient with a white glass panel
    { id: 'sglass', name: 'Gradient Glass', cat: 'School', sizes: ['idp'], pals: ['purple', 'blue', 'rose', 'teal'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, W, H, K.G(150, p.a, p.b)), C(W, 120 * u, 220 * u, 'rgba(255,255,255,0.10)'), C(0, H - 80 * u, 260 * u, 'rgba(255,255,255,0.08)')];
      o = o.concat(head(30 * u, 26 * u, W, u, { logo: 84 * u, size: 27 * u }));
      o.push(R(30 * u, 236 * u, W - 60 * u, H - 270 * u, 'rgba(255,255,255,0.95)', { r: 30 * u, shadow: { y: 10, b: 30, c: 'rgba(0,0,0,.25)' } }));
      o.push(C(W / 2, 236 * u, 112 * u, '#fff'));
      o.push(P(W / 2 - 102 * u, 134 * u, 204 * u, 204 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: p.b, sw: 5 * u }));
      o.push(T(50 * u, 360 * u, W - 100 * u, '{{NAME}}', 36 * u, { bold: 800, color: p.a, align: 'center' }));
      o = o.concat(pill(W / 2 - 150 * u, 410 * u, 300 * u, 42 * u, K.G(0, p.a, p.b), '{{ROLE|upper}} · SEC. {{DEPT|upper}}', 17 * u, '#fff', { ls: 60 }));
      o = o.concat(rows(70 * u, 486 * u, W - 140 * u, u, R5.concat([['Session', '{{SESSION}}']]), { size: 19 * u, zebra: p.soft }));
      o.push(K.Q(66 * u, 724 * u, 150 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'));
      o = o.concat(sign(W - 256 * u, 760 * u, 196 * u, u, p.a));
      o.push(T(0, H - 30 * u, W, '{{ORG_WEB}}', 15 * u, { align: 'center', color: '#fff', bold: 600 }));
      return pp(o, p.a, p, function (q) { return backP(W, H, q); });
    } },
    // 9 — ruled notebook, polaroid photo and a pencil
    { id: 'spencil', name: 'Pencil Notebook', cat: 'School', sizes: ['idp'], pals: ['blue', 'green', 'orange', 'rose'], build: function (W, H, p) {
      var u = W / 638, o = [];
      for (var y = 250; y < 940; y += 36) o.push(L(0, y * u, W, y * u, '#c7d7ee', 1.2 * u));
      o.push(L(56 * u, 200 * u, 56 * u, 940 * u, '#f87171', 1.5 * u));
      o.push(R(0, 0, W, 196 * u, p.b));
      for (var i = 0; i < 17; i++) o.push(C((i + 0.5) * W / 17, 196 * u, W / 34, p.b));
      o = o.concat(head(28 * u, 24 * u, W, u, { logo: 92 * u, size: 28 * u }));
      o.push(R(W / 2 - 132 * u, 250 * u, 264 * u, 316 * u, '#fff', { angle: -3, shadow: SHADOW }));
      o.push(P(W / 2 - 128 * u, 272 * u, 224 * u, 244 * u, 'PHOTO', { angle: -3, fill: p.soft, sw: 0 }));
      o.push(T(W / 2 - 120 * u, 520 * u, 240 * u, 'Hello! I am', 20 * u, { font: 'Caveat', bold: 700, color: '#64748b', align: 'center', angle: -3 }));
      o.push(T(30 * u, 584 * u, W - 60 * u, '{{NAME}}', 46 * u, { font: 'Caveat', bold: 700, color: p.a, align: 'center' }));
      o = o.concat(rows(80 * u, 652 * u, W - 130 * u, u, R6, { size: 19 * u, gap: 1.9 }));
      o = o.concat(sign(W - 230 * u, 878 * u, 190 * u, u, p.a));
      var py = H - 52 * u;
      o.push(R(60 * u, py, 400 * u, 34 * u, p.acc), R(60 * u, py + 11 * u, 400 * u, 4 * u, 'rgba(0,0,0,0.12)'), R(30 * u, py, 34 * u, 34 * u, '#f9a8d4', { r: 6 * u }), R(56 * u, py, 10 * u, 34 * u, '#cbd5e1'));
      o.push(K.POLY([[460 * u, py], [520 * u, py + 17 * u], [460 * u, py + 34 * u]], '#f5d0a9'), K.POLY([[502 * u, py + 12 * u], [520 * u, py + 17 * u], [502 * u, py + 22 * u]], '#334155'));
      return pp(o, '#fffef7', p, function (q) { return backP(W, H, q); });
    } },
    // 10 — minimal, big photo with a coloured offset block
    { id: 'sclean', name: 'Minimal Clean', cat: 'School', sizes: ['idp'], pals: ['slate', 'blue', 'green', 'rose'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, W, 10 * u, p.b)];
      o = o.concat(head(40 * u, 40 * u, W, u, { logo: 76 * u, size: 26 * u, color: p.a, subColor: '#64748b', logoBg: p.soft }));
      o.push(R(60 * u, 180 * u, 290 * u, 340 * u, p.c, { r: 18 * u }));
      o.push(P(40 * u, 160 * u, 290 * u, 340 * u, 'PHOTO', { r: 18 * u, fill: '#f1f5f9', stroke: p.b, sw: 2 * u }));
      o = o.concat(K.stack(380 * u, W - 410 * u, 160 * u, 520 * u, [
        { text: 'ROLL NO.', size: 14 * u, bold: 700, color: '#94a3b8', ls: 200, align: 'left', gap: 0 }, { text: '{{ID_NO}}', size: 26 * u, bold: 800, color: p.a, align: 'left', gap: 16 * u },
        { text: 'CLASS', size: 14 * u, bold: 700, color: '#94a3b8', ls: 200, align: 'left', gap: 0 }, { text: '{{ROLE}}', size: 26 * u, bold: 800, color: p.a, align: 'left', gap: 16 * u },
        { text: 'SECTION', size: 14 * u, bold: 700, color: '#94a3b8', ls: 200, align: 'left', gap: 0 }, { text: '{{DEPT}}', size: 26 * u, bold: 800, color: p.a, align: 'left', gap: 16 * u },
        { text: 'BLOOD', size: 14 * u, bold: 700, color: '#94a3b8', ls: 200, align: 'left', gap: 0 }, { text: '{{BLOOD}}', size: 26 * u, bold: 800, color: '#dc2626', align: 'left', gap: 0 }
      ], { maxK: 1, valign: 'top' }));
      o.push(T(40 * u, 548 * u, W - 80 * u, '{{NAME}}', 42 * u, { bold: 800, color: p.ink, lh: 1.05 }));
      o.push(R(40 * u, 610 * u, 60 * u, 6 * u, p.b));
      o = o.concat(rows(40 * u, 640 * u, W - 80 * u, u, [["Father's name", '{{FATHER}}'], ['D.O.B.', '{{DOB}}'], ['Phone', '{{PHONE}}'], ['Session', '{{SESSION}}']], { size: 19 * u, kw: 0.36 }));
      o.push(K.B(40 * u, 800 * u, 250 * u, 100 * u, '{{ID_NO}}'));
      o = o.concat(sign(W - 236 * u, 806 * u, 196 * u, u, p.a));
      o.push(R(0, H - 10 * u, W, 10 * u, p.b));
      return pp(o, '#ffffff', p, function (q) { return backP(W, H, q); });
    } },
    // ---------- landscape ----------
    { id: 'lwave', name: 'Landscape Wave', cat: 'School', sizes: ['idl'], pals: ['navy', 'teal', 'maroon', 'purple'], build: function (W, H, p) {
      var u = W / 1012, o = [K.wave(W, H, 140 * u, 18 * u, K.G(0, p.a, p.b), false), C(W - 60 * u, 10 * u, 120 * u, 'rgba(255,255,255,0.08)')];
      o = o.concat(head(26 * u, 16 * u, W, u, { logo: 92 * u, size: 34 * u, sub: '{{ORG_ADDRESS}}', right: 40 * u }));
      o.push(R(36 * u, 170 * u, 232 * u, 282 * u, '#fff', { r: 16 * u, shadow: SHADOW }));
      o.push(P(46 * u, 180 * u, 212 * u, 262 * u, 'PHOTO', { r: 12 * u, fill: p.soft, sw: 0 }));
      o.push(T(36 * u, 470 * u, 232 * u, 'STUDENT', 20 * u, { font: 'Montserrat', bold: 800, color: p.b, align: 'center', ls: 300 }));
      o.push(T(300 * u, 170 * u, 470 * u, '{{NAME|upper}}', 34 * u, { bold: 800, color: p.a, lh: 1.05 }));
      o = o.concat(rows(300 * u, 232 * u, 470 * u, u, R6, { size: 19 * u, kw: 0.36, gap: 1.55 }));
      o.push(R(W - 210 * u, 166 * u, 174 * u, 174 * u, '#fff', { r: 10 * u, stroke: p.c, sw: 2 * u }));
      o.push(K.Q(W - 202 * u, 174 * u, 158 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'));
      o = o.concat(sign(W - 226 * u, 400 * u, 196 * u, u, p.a));
      o.push(K.wave(W, H, H - 46 * u, 12 * u, p.a, true));
      o.push(T(30 * u, H - 34 * u, W - 60 * u, 'Session {{SESSION}}  ·  ☎ {{ORG_PHONE}}', 16 * u, { color: '#fff', align: 'center', bold: 600 }));
      return pp(o, '#ffffff', p, function (q) { return backL(W, H, q); });
    } },
    { id: 'lkids', name: 'Landscape Kids', cat: 'School', sizes: ['idl'], pals: ['blue', 'rose', 'green', 'orange'], build: function (W, H, p) {
      var u = W / 1012, o = [R(0, 0, 330 * u, H, K.G(160, p.a, p.b)), C(330 * u, H / 2, 70 * u, K.G(160, p.a, p.b))];
      [[60, 60, 14], [280, 90, 9], [50, 560, 10], [290, 520, 16]].forEach(function (s, i) { o.push(K.burst(s[0] * u, s[1] * u, s[2] * u, s[2] * 0.45 * u, 5, i % 2 ? '#fff' : p.acc, { op: 0.9 })); });
      o.push(C(165 * u, 260 * u, 124 * u, p.acc));
      o.push(P(51 * u, 146 * u, 228 * u, 228 * u, 'PHOTO', { shape: 'circle', fill: p.soft, stroke: '#fff', sw: 6 * u }));
      o.push(T(20 * u, 406 * u, 290 * u, '{{NAME}}', 30 * u, { bold: 800, color: '#fff', align: 'center', lh: 1.05 }));
      o.push(T(20 * u, 486 * u, 290 * u, 'Roll No. {{ID_NO}}', 18 * u, { bold: 600, color: p.c, align: 'center' }));
      o = o.concat(head(420 * u, 26 * u, W, u, { logo: 84 * u, size: 30 * u, color: p.a, subColor: '#64748b', logoBg: p.soft }));
      o = o.concat(pill(420 * u, 140 * u, 260 * u, 40 * u, p.b, 'STUDENT ID CARD', 17 * u, '#fff'));
      o = o.concat(rows(420 * u, 210 * u, W - 460 * u, u, [['Class / Sec.', '{{ROLE}} – {{DEPT}}'], ["Father's name", '{{FATHER}}'], ['D.O.B.', '{{DOB}}'], ['Blood group', '{{BLOOD}}'], ['Phone', '{{PHONE}}'], ['Session', '{{SESSION}}']], { size: 19 * u, kw: 0.32, gap: 1.55 }));
      o = o.concat(sign(W - 230 * u, 430 * u, 196 * u, u, p.a));
      ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'].forEach(function (c, i) { o.push(R(330 * u + i * (W - 330 * u) / 5, H - 18 * u, (W - 330 * u) / 5, 18 * u, c)); });
      return pp(o, '#ffffff', p, function (q) { return backL(W, H, q); });
    } },
    { id: 'lband', name: 'Landscape Band', cat: 'School', sizes: ['idl'], pals: ['emerald', 'navy', 'maroon', 'slate'], build: function (W, H, p) {
      var u = W / 1012, o = [R(0, 0, W, 116 * u, p.a), R(0, 116 * u, W, 6 * u, p.d), R(W - 230 * u, 122 * u, 230 * u, H - 122 * u, p.soft)];
      o.push(P(24 * u, 12 * u, 92 * u, 92 * u, 'LOGO', { shape: 'circle', fill: '#fff', sw: 0 }));
      o = o.concat(K.stack(130 * u, W - 260 * u, 8 * u, 110 * u, [
        { text: '{{ORG_NAME|upper}}', size: 36 * u, font: 'Oswald', bold: 700, color: '#fff', lh: 1.05, gap: 4 * u },
        { text: '{{ORG_ADDRESS}}', size: 15 * u, color: p.c, gap: 0, est: 'Near Bus Stand, Sikar Road, Jaipur 302013' }
      ], { maxK: 1 }));
      o.push(P(34 * u, 150 * u, 210 * u, 260 * u, 'PHOTO', { r: 10 * u, fill: p.soft, stroke: p.a, sw: 4 * u }));
      o = o.concat(pill(34 * u, 428 * u, 210 * u, 40 * u, p.b, 'STUDENT', 17 * u, '#fff', { ls: 300 }));
      o.push(T(270 * u, 146 * u, 470 * u, '{{NAME}}', 34 * u, { bold: 800, color: p.a, lh: 1.05 }));
      o = o.concat(rows(270 * u, 206 * u, 470 * u, u, R6, { size: 18 * u, kw: 0.36, gap: 1.6 }));
      o.push(T(W - 220 * u, 150 * u, 210 * u, 'ROLL NO.', 15 * u, { bold: 700, color: '#64748b', align: 'center', ls: 200 }));
      o.push(T(W - 220 * u, 172 * u, 210 * u, '{{ID_NO}}', 22 * u, { bold: 800, color: p.a, align: 'center' }));
      o.push(K.Q(W - 195 * u, 216 * u, 160 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'));
      o = o.concat(sign(W - 215 * u, 412 * u, 200 * u, u, p.a));
      o.push(R(0, H - 26 * u, W, 26 * u, p.a));
      return pp(o, '#ffffff', p, function (q) { return backL(W, H, q); });
    } },
    { id: 'lglass', name: 'Landscape Gradient', cat: 'School', sizes: ['idl'], pals: ['purple', 'teal', 'blue', 'rose'], build: function (W, H, p) {
      var u = W / 1012, o = [R(0, 0, W, H, K.G(135, p.a, p.b)), C(120 * u, H, 260 * u, 'rgba(255,255,255,0.08)'), C(W, 0, 220 * u, 'rgba(255,255,255,0.08)')];
      o.push(C(170 * u, 230 * u, 128 * u, 'rgba(255,255,255,0.25)'));
      o.push(P(52 * u, 112 * u, 236 * u, 236 * u, 'PHOTO', { shape: 'circle', fill: 'rgba(255,255,255,0.3)', stroke: '#fff', sw: 6 * u }));
      o.push(T(20 * u, 378 * u, 300 * u, '{{NAME}}', 30 * u, { bold: 800, color: '#fff', align: 'center', lh: 1.05 }));
      o.push(T(20 * u, 456 * u, 300 * u, '{{ROLE|upper}} · SEC. {{DEPT|upper}}', 17 * u, { bold: 700, color: p.c, align: 'center', ls: 60 }));
      o.push(R(350 * u, 30 * u, W - 380 * u, H - 60 * u, 'rgba(255,255,255,0.96)', { r: 24 * u, shadow: { y: 8, b: 24, c: 'rgba(0,0,0,.25)' } }));
      o = o.concat(head(380 * u, 54 * u, W, u, { logo: 76 * u, size: 28 * u, color: p.a, subColor: '#64748b', logoBg: p.soft, right: 60 * u }));
      o.push(L(380 * u, 150 * u, W - 60 * u, 150 * u, p.c, 2 * u));
      o = o.concat(rows(380 * u, 172 * u, W - 640 * u, u, [['Roll No.', '{{ID_NO}}'], ["Father's name", '{{FATHER}}'], ['D.O.B.', '{{DOB}}'], ['Blood group', '{{BLOOD}}'], ['Phone', '{{PHONE}}'], ['Session', '{{SESSION}}']], { size: 18 * u, kw: 0.42, gap: 1.6 }));
      o.push(K.Q(W - 220 * u, 172 * u, 150 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'));
      o = o.concat(sign(W - 246 * u, 420 * u, 190 * u, u, p.a));
      return pp(o, p.a, p, function (q) { return backL(W, H, q); });
    } }
  ];
  ST.register(K.expand('ids', layouts, ['blue']));
})();
