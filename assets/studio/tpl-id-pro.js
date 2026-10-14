/* S Printer — premium ID cards (school + office): layered waves, security pattern, icons for every
 * detail, hologram and chip. Front + back. Original designs by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P, A = K.A;
  var PAL = {
    royal: { a: '#0b2a6f', b: '#2563eb', c: '#dbeafe', d: '#60a5fa', ink: '#0f172a', acc: '#f59e0b', tile: '#e8f0ff' },
    emerald: { a: '#064e3b', b: '#10b981', c: '#d1fae5', d: '#34d399', ink: '#052e16', acc: '#f59e0b', tile: '#e6f8f0' },
    crimson: { a: '#7f1d1d', b: '#e11d48', c: '#ffe4e6', d: '#fb7185', ink: '#1f1315', acc: '#f59e0b', tile: '#fff0f2' },
    purple: { a: '#3b0764', b: '#9333ea', c: '#f3e8ff', d: '#c084fc', ink: '#1e1033', acc: '#f472b6', tile: '#f5edff' },
    teal: { a: '#134e4a', b: '#0891b2', c: '#cffafe', d: '#22d3ee', ink: '#0f2a2e', acc: '#f97316', tile: '#e6f9fc' },
    orange: { a: '#7c2d12', b: '#f97316', c: '#ffedd5', d: '#fdba74', ink: '#1c1917', acc: '#0ea5e9', tile: '#fff4e8' },
    gold: { a: '#0b0f19', b: '#1f2937', c: '#f5e7b8', d: '#d4af37', ink: '#0b0f19', acc: '#d4af37', tile: '#f7f0d8', dark: true },
    navygold: { a: '#0a1a3a', b: '#1e3a8a', c: '#f5e7b8', d: '#d4af37', ink: '#0a1a3a', acc: '#d4af37', tile: '#eef2fb', dark: true }
  };
  var PN = ['Front', 'Back'];
  var SH = { y: 8, b: 22, c: 'rgba(15,23,42,.22)' };
  function G(p, ang) { return K.G(ang == null ? 135 : ang, p.a, p.b); }
  // one detail with an icon: small grey label above a bold value
  function irow(x, y, w, u, icon, label, val, p, o) {
    o = o || {}; var is = (o.is || 44) * u;
    return [A(icon, x, y, is, is, { cols: [o.tile || p.tile, o.fg || p.b] }),
      T(x + is + 12 * u, y + 1 * u, w - is - 12 * u, label, (o.ls || 12) * u, { font: 'Montserrat', bold: 700, color: o.lc || '#64748b', ls: 120 }),
      T(x + is + 12 * u, y + 18 * u, w - is - 12 * u, val, (o.vs || 19) * u, { font: 'Poppins', bold: 700, color: o.vc || p.ink })];
  }
  function pill(x, y, w, h, fill, text, size, col) { return [R(x, y, w, h, fill, { r: h / 2, shadow: { y: 4, b: 10, c: 'rgba(0,0,0,.15)' } }), T(x, y + (h - size * 1.2) / 2, w, text, size, { font: 'Montserrat', bold: 800, color: col, align: 'center', ls: 60 })]; }
  function photoRing(cx, cy, r, u, p, o) {
    o = o || {};
    return [C(cx, cy, r + 14 * u, '#ffffff', { shadow: SH }), C(cx, cy, r + 8 * u, o.ring || K.G(135, p.d, p.b)), P(cx - r, cy - r, r * 2, r * 2, 'PHOTO', { shape: 'circle', fill: p.c, stroke: '#ffffff', sw: 5 * u })];
  }
  function slot(W, y, u, col) { return R(W / 2 - 48 * u, y, 96 * u, 15 * u, col || 'rgba(255,255,255,0.45)', { r: 7.5 * u }); }
  function sign(x, y, w, u, col, label) {
    return [P(x, y, w, 54 * u, 'SIGN', { fill: 'rgba(255,255,255,0.0)', sw: 0, label: 'Sign' }), L(x + 6 * u, y + 56 * u, x + w - 6 * u, y + 56 * u, col, 1.4 * u),
      T(x, y + 61 * u, w, label || 'Principal', 14 * u, { font: 'Montserrat', bold: 700, color: col, align: 'center', ls: 80 })];
  }
  function head(x, y, w, u, col, sub, o) {
    o = o || {}; var ls = (o.logo || 72) * u;
    return [C(x + ls / 2, y + ls / 2, ls / 2 + 4 * u, 'rgba(255,255,255,0.95)'), P(x, y, ls, ls, 'LOGO', { shape: 'circle', fill: '#ffffff', sw: 0 })].concat(K.stack(x + ls + 14 * u, w - ls - 14 * u, y - 6 * u, y + ls + 6 * u, [
      { text: '{{ORG_NAME|upper}}', size: (o.size || 25) * u, font: 'Montserrat', bold: 800, color: col, align: o.align || 'left', lh: 1.05, ls: 20, gap: 4 },
      { text: '{{ORG_TAG}}', size: 13 * u, font: 'Poppins', bold: 500, color: sub, align: o.align || 'left', gap: 0, est: 'Affiliated to CBSE · Since 1998' }
    ], { maxK: 1 }));
  }
  // what the details mean for a school card vs an office card
  function F(kind) {
    return kind === 'office'
      ? { pill: '{{ROLE|upper}}', cells: [['ic-id', 'EMP. ID', '{{ID_NO}}'], ['ic-book', 'DEPARTMENT', '{{DEPT}}'], ['ic-drop', 'BLOOD', '{{BLOOD}}'], ['ic-cake', 'D.O.B.', '{{DOB}}']], wide: ['ic-phone', 'PHONE', '{{PHONE}}'], who: 'Authorised sign' }
      : { pill: '{{ROLE|upper}}  ·  SEC {{DEPT|upper}}', cells: [['ic-id', 'ROLL NO.', '{{ID_NO}}'], ['ic-drop', 'BLOOD', '{{BLOOD}}'], ['ic-cake', 'D.O.B.', '{{DOB}}'], ['ic-phone', 'PHONE', '{{PHONE}}']], wide: ['ic-user', "FATHER'S NAME", '{{FATHER}}'], who: 'Principal' };
  }
  function grid(x, y, w, u, p, f, o) {
    o = o || {}; var cw = (w - 16 * u) / 2, rh = (o.rh || 70) * u, out = [];
    f.cells.forEach(function (c, i) { out = out.concat(irow(x + (i % 2) * (cw + 16 * u), y + Math.floor(i / 2) * rh, cw, u, c[0], c[1], c[2], p, o)); });
    if (o.wide !== false) out = out.concat(irow(x, y + 2 * rh, w, u, f.wide[0], f.wide[1], f.wide[2], p, o));
    return out;
  }

  // ---------- backs ----------
  function backP(W, H, p) {
    var u = W / 638, dk = p.dark, ink = dk ? '#f8fafc' : p.ink, o = [R(0, 0, W, H, dk ? K.G(160, p.a, p.b) : '#ffffff'), A('guilloche', -40 * u, 120 * u, 720 * u, 480 * u, { cols: [dk ? p.d : p.b], op: dk ? 0.12 : 0.08 }), A('rosette', W - 260 * u, H - 330 * u, 300 * u, 300 * u, { cols: [dk ? p.d : p.b], op: dk ? 0.14 : 0.08 })];
    o.push(K.PATH('M0 0 H' + W + ' V' + 120 * u + ' C' + W * 0.7 + ' ' + 160 * u + ' ' + W * 0.3 + ' ' + 90 * u + ' 0 ' + 140 * u + ' Z', dk ? 'rgba(255,255,255,0.06)' : G(p)));
    o = o.concat(head(32 * u, 24 * u, W - 64 * u, u, dk ? p.d : '#ffffff', dk ? '#cbd5e1' : 'rgba(255,255,255,0.85)', { logo: 64, size: 22 }));
    o.push(T(40 * u, 176 * u, W - 80 * u, 'CARD HOLDER DETAILS', 15 * u, { font: 'Montserrat', bold: 800, color: dk ? p.d : p.b, ls: 260 }));
    var rows = [['ic-user', "MOTHER'S NAME", '{{MOTHER}}'], ['ic-cal', 'SESSION / VALID TILL', '{{SESSION}}  ·  {{VALID}}'], ['ic-alert', 'EMERGENCY CONTACT', '{{EMERGENCY}}'], ['ic-home', 'ADDRESS', '{{ADDRESS}}']];
    rows.forEach(function (r, i) { o = o.concat(irow(40 * u, (214 + i * 72) * u, W - 80 * u, u, r[0], r[1], r[2], p, { vc: ink, lc: dk ? '#94a3b8' : '#64748b', tile: dk ? 'rgba(255,255,255,0.1)' : p.tile, fg: dk ? p.d : p.b, is: 42 })); });
    o.push(R(40 * u, 516 * u, W - 80 * u, 112 * u, dk ? 'rgba(255,255,255,0.07)' : p.tile, { r: 16 * u }));
    o.push(T(60 * u, 530 * u, W - 120 * u, '•  This card is not transferable.\n•  If found, please return it to the address below.\n•  Report loss of the card immediately.', 14.5 * u, { font: 'Poppins', color: dk ? '#e2e8f0' : '#334155', lh: 1.5 }));
    o.push(R(40 * u, 650 * u, 170 * u, 170 * u, '#ffffff', { r: 16 * u, shadow: { y: 4, b: 12, c: 'rgba(0,0,0,.12)' } }), K.Q(48 * u, 658 * u, 154 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}} | {{PHONE}}'));
    o = o.concat(sign(W - 250 * u, 690 * u, 210 * u, u, dk ? p.d : p.a, 'Authorised signatory'));
    o.push(R(40 * u, 846 * u, W - 80 * u, 66 * u, '#ffffff', { r: 10 * u }), K.B(60 * u, 850 * u, W - 120 * u, 58 * u, '{{ID_NO}}'));
    o.push(R(0, H - 64 * u, W, 64 * u, dk ? p.d : G(p, 0)), T(30 * u, H - 52 * u, W - 60 * u, '{{ORG_ADDRESS}}\n☎ {{ORG_PHONE}}  ·  {{ORG_WEB}}', 13 * u, { font: 'Poppins', bold: 600, color: dk ? p.a : '#ffffff', align: 'center', lh: 1.35 }));
    return o;
  }
  function backL(W, H, p) {
    var u = W / 1012, dk = p.dark, ink = dk ? '#f8fafc' : p.ink, o = [R(0, 0, W, H, dk ? K.G(160, p.a, p.b) : '#ffffff'), A('guilloche', 0, 60 * u, W, H, { cols: [dk ? p.d : p.b], op: dk ? 0.12 : 0.08 })];
    o.push(R(0, 0, W, 104 * u, dk ? 'rgba(255,255,255,0.06)' : G(p, 0)));
    o = o.concat(head(30 * u, 18 * u, W - 300 * u, u, dk ? p.d : '#ffffff', dk ? '#cbd5e1' : 'rgba(255,255,255,0.85)', { logo: 66, size: 24 }));
    var rows = [['ic-user', "MOTHER'S NAME", '{{MOTHER}}'], ['ic-cal', 'VALID TILL', '{{VALID}}'], ['ic-alert', 'EMERGENCY', '{{EMERGENCY}}'], ['ic-home', 'ADDRESS', '{{ADDRESS}}']];
    rows.forEach(function (r, i) { o = o.concat(irow((40 + (i % 2) * 300) * u, (134 + Math.floor(i / 2) * 76) * u, 284 * u, u, r[0], r[1], r[2], p, { vc: ink, lc: dk ? '#94a3b8' : '#64748b', tile: dk ? 'rgba(255,255,255,0.1)' : p.tile, fg: dk ? p.d : p.b, is: 42, vs: 17 })); });
    o.push(T(40 * u, 300 * u, 580 * u, 'This card is not transferable. If found, please return it to the office address below.', 14 * u, { font: 'Poppins', color: dk ? '#e2e8f0' : '#475569', lh: 1.45 }));
    o.push(R(40 * u, 370 * u, 560 * u, 70 * u, '#ffffff', { r: 10 * u }), K.B(56 * u, 374 * u, 528 * u, 62 * u, '{{ID_NO}}'));
    o.push(R(W - 250 * u, 126 * u, 196 * u, 196 * u, '#ffffff', { r: 16 * u, shadow: { y: 4, b: 12, c: 'rgba(0,0,0,.12)' } }), K.Q(W - 242 * u, 134 * u, 180 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'));
    o = o.concat(sign(W - 262 * u, 350 * u, 220 * u, u, dk ? p.d : p.a, 'Authorised signatory'));
    o.push(R(0, H - 54 * u, W, 54 * u, dk ? p.d : G(p, 0)), T(30 * u, H - 40 * u, W - 60 * u, '{{ORG_ADDRESS}}  ·  ☎ {{ORG_PHONE}}  ·  {{ORG_WEB}}', 14 * u, { font: 'Poppins', bold: 600, color: dk ? p.a : '#ffffff', align: 'center' }));
    return o;
  }
  function out2(front, W, H, p, land) { return { pageNames: PN, pages: [{ bg: '#ffffff', objects: front }, { bg: '#ffffff', objects: land ? backL(W, H, p) : backP(W, H, p) }] }; }

  // ---------- fronts ----------
  function wave(kind) { return function (W, H, p) {
    var u = W / 638, f = F(kind), o = [R(0, 0, W, H, '#ffffff'), A('guilloche', -40 * u, 420 * u, 720 * u, 480 * u, { cols: [p.b], op: 0.07 })];
    o.push(K.PATH('M0 0 H' + W + ' V' + 330 * u + ' C' + W * 0.72 + ' ' + 380 * u + ' ' + W * 0.32 + ' ' + 280 * u + ' 0 ' + 350 * u + ' Z', p.c));
    o.push(K.PATH('M0 0 H' + W + ' V' + 300 * u + ' C' + W * 0.7 + ' ' + 350 * u + ' ' + W * 0.3 + ' ' + 250 * u + ' 0 ' + 318 * u + ' Z', p.d, { op: 0.9 }));
    o.push(K.PATH('M0 0 H' + W + ' V' + 268 * u + ' C' + W * 0.68 + ' ' + 318 * u + ' ' + W * 0.28 + ' ' + 214 * u + ' 0 ' + 284 * u + ' Z', G(p)));
    o.push(C(W - 40 * u, 40 * u, 140 * u, 'rgba(255,255,255,0.07)'), C(60 * u, 230 * u, 70 * u, 'rgba(255,255,255,0.06)'), slot(W, 20 * u, u));
    o = o.concat(head(36 * u, 56 * u, W - 72 * u, u, '#ffffff', 'rgba(255,255,255,0.85)', {}));
    o = o.concat(photoRing(W / 2, 312 * u, 104 * u, u, p));
    o.push(T(30 * u, 440 * u, W - 60 * u, '{{NAME}}', 38 * u, { font: 'Poppins', bold: 800, color: p.ink, align: 'center' }));
    o = o.concat(pill(W / 2 - 160 * u, 494 * u, 320 * u, 42 * u, G(p, 0), f.pill, 16 * u, '#ffffff'));
    o = o.concat(grid(46 * u, 566 * u, W - 92 * u, u, p, f, { rh: 70 }));
    o.push(A('holo', 46 * u, 800 * u, 64 * u, 64 * u), T(124 * u, 812 * u, 230 * u, 'VALID TILL\n{{VALID}}', 13 * u, { font: 'Montserrat', bold: 700, color: '#64748b', lh: 1.4, ls: 60 }));
    o = o.concat(sign(W - 240 * u, 790 * u, 196 * u, u, p.a, f.who));
    o.push(K.wave(W, H, H - 74 * u, 16 * u, p.c, true), K.wave(W, H, H - 58 * u, 14 * u, G(p, 0), true));
    o.push(T(30 * u, H - 36 * u, W - 60 * u, '☎ {{ORG_PHONE}}  ·  {{ORG_WEB}}', 14 * u, { font: 'Poppins', bold: 600, color: '#ffffff', align: 'center' }));
    return out2(o, W, H, p);
  }; }
  function hero(kind) { return function (W, H, p) {
    var u = W / 638, f = F(kind), o = [R(0, 0, W, H, '#ffffff')];
    o.push(P(0, 0, W, 520 * u, 'PHOTO', { fill: p.c, sw: 0, label: 'Photo' }));
    o.push(R(0, 250 * u, W, 272 * u, K.G(90, [0, 'rgba(0,0,0,0)'], [1, p.a]), { op: 0.92 }));
    o.push(R(28 * u, 28 * u, W - 56 * u, 92 * u, 'rgba(255,255,255,0.92)', { r: 46 * u, shadow: { y: 6, b: 16, c: 'rgba(0,0,0,.2)' } }));
    o = o.concat(head(40 * u, 38 * u, W - 90 * u, u, p.a, '#64748b', { logo: 72, size: 22 }));
    o.push(T(40 * u, 390 * u, W - 80 * u, '{{NAME}}', 44 * u, { font: 'Poppins', bold: 800, color: '#ffffff', shadow: { x: 0, y: 2, b: 8, c: 'rgba(0,0,0,.35)' } }));
    o = o.concat(pill(40 * u, 452 * u, 300 * u, 40 * u, p.acc, f.pill, 15 * u, '#111827'));
    o.push(R(0, 520 * u, W, 8 * u, G(p, 0)));
    o = o.concat(grid(40 * u, 556 * u, W - 222 * u, u, p, f, { rh: 70, wide: false, is: 38, vs: 16, ls: 11 }));
    o = o.concat(irow(40 * u, 696 * u, W - 230 * u, u, f.wide[0], f.wide[1], f.wide[2], p, { is: 38, vs: 17, ls: 11 }));
    o.push(R(W - 176 * u, 556 * u, 136 * u, 136 * u, '#ffffff', { r: 14 * u, stroke: p.c, sw: 2 * u }), K.Q(W - 170 * u, 562 * u, 124 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'));
    o.push(A('holo', W - 140 * u, 706 * u, 64 * u, 64 * u));
    o.push(R(40 * u, 790 * u, 330 * u, 86 * u, '#ffffff'), K.B(40 * u, 790 * u, 330 * u, 86 * u, '{{ID_NO}}'));
    o = o.concat(sign(W - 230 * u, 800 * u, 190 * u, u, p.a, f.who));
    o.push(R(0, H - 50 * u, W, 50 * u, G(p, 0)), T(30 * u, H - 36 * u, W - 60 * u, 'Valid till {{VALID}}  ·  ☎ {{ORG_PHONE}}', 14 * u, { font: 'Poppins', bold: 600, color: '#ffffff', align: 'center' }));
    return out2(o, W, H, p);
  }; }
  function glass(kind) { return function (W, H, p) {
    var u = W / 638, f = F(kind), o = [R(0, 0, W, H, G(p, 150))];
    o.push(A('blob', -160 * u, -120 * u, 520 * u, 416 * u, { cols: [p.d], op: 0.55 }), A('blob', 300 * u, 600 * u, 520 * u, 416 * u, { cols: [p.acc], op: 0.35 }), A('blob', 380 * u, -60 * u, 400 * u, 320 * u, { cols: [p.c], op: 0.25 }));
    o.push(slot(W, 20 * u, u));
    o = o.concat(head(40 * u, 54 * u, W - 80 * u, u, '#ffffff', 'rgba(255,255,255,0.85)', {}));
    o.push(R(30 * u, 250 * u, W - 60 * u, H - 290 * u, 'rgba(255,255,255,0.9)', { r: 36 * u, stroke: 'rgba(255,255,255,0.9)', sw: 2 * u, shadow: { y: 14, b: 40, c: 'rgba(0,0,0,.25)' } }));
    o = o.concat(photoRing(W / 2, 252 * u, 92 * u, u, p));
    o.push(T(50 * u, 372 * u, W - 100 * u, '{{NAME}}', 36 * u, { font: 'Poppins', bold: 800, color: p.ink, align: 'center' }));
    o = o.concat(pill(W / 2 - 150 * u, 424 * u, 300 * u, 40 * u, G(p, 0), f.pill, 15 * u, '#ffffff'));
    o = o.concat(grid(62 * u, 494 * u, W - 124 * u, u, p, f, { rh: 70 }));
    o.push(K.Q(62 * u, 724 * u, 120 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'), A('holo', 196 * u, 752 * u, 60 * u, 60 * u));
    o = o.concat(sign(W - 252 * u, 740 * u, 190 * u, u, p.a, f.who));
    o.push(T(30 * u, H - 34 * u, W - 60 * u, 'Valid till {{VALID}}  ·  {{ORG_WEB}}', 14 * u, { font: 'Poppins', bold: 600, color: '#ffffff', align: 'center' }));
    return out2(o, W, H, p);
  }; }
  function luxe(kind) { return function (W, H, p) {
    var u = W / 638, f = F(kind), o = [R(0, 0, W, H, K.G(160, p.a, p.b, p.a)), A('guilloche', -60 * u, 80 * u, 760 * u, 506 * u, { cols: [p.d], op: 0.16 }), A('rosette', W - 250 * u, H - 330 * u, 320 * u, 320 * u, { cols: [p.d], op: 0.18 })];
    o.push(R(18 * u, 18 * u, W - 36 * u, H - 36 * u, null, { r: 24 * u, stroke: p.d, sw: 2 * u }), slot(W, 30 * u, u, 'rgba(212,175,55,0.35)'));
    o = o.concat(head(44 * u, 66 * u, W - 88 * u, u, p.d, '#cbd5e1', {}));
    o.push(L(44 * u, 170 * u, W - 44 * u, 170 * u, p.d, 1.4 * u, { op: 0.6 }));
    o = o.concat(photoRing(W / 2, 300 * u, 100 * u, u, p, { ring: K.G(135, '#f5e7b8', p.d, '#a67c00') }));
    o.push(T(30 * u, 430 * u, W - 60 * u, '{{NAME|upper}}', 34 * u, { font: 'Cinzel', bold: 700, color: '#ffffff', align: 'center', ls: 60 }));
    o.push(T(30 * u, 480 * u, W - 60 * u, f.pill, 15 * u, { font: 'Montserrat', bold: 700, color: p.d, align: 'center', ls: 260 }));
    o = o.concat(grid(56 * u, 540 * u, W - 112 * u, u, p, f, { rh: 70, vc: '#ffffff', lc: '#94a3b8', tile: 'rgba(212,175,55,0.16)', fg: p.d }));
    o.push(A('chip', 56 * u, 790 * u, 84 * u, 63 * u, { cols: ['#d4af37'] }), A('holo', 156 * u, 790 * u, 62 * u, 62 * u));
    o = o.concat(sign(W - 246 * u, 784 * u, 190 * u, u, p.d, f.who));
    o.push(T(30 * u, H - 74 * u, W - 60 * u, 'VALID TILL {{VALID}}  ·  {{ORG_WEB}}', 13 * u, { font: 'Montserrat', bold: 700, color: p.d, align: 'center', ls: 120 }));
    return out2(o, W, H, p);
  }; }
  function stripe(kind) { return function (W, H, p) {
    var u = W / 638, f = F(kind), o = [R(0, 0, W, H, '#ffffff'), A('guilloche', -60 * u, 560 * u, 760 * u, 506 * u, { cols: [p.b], op: 0.06 })];
    o.push(K.POLY([[0, 0], [W, 0], [W, 150 * u], [0, 220 * u]], G(p)), K.POLY([[0, 220 * u], [W, 150 * u], [W, 168 * u], [0, 238 * u]], p.acc), slot(W, 18 * u, u));
    o = o.concat(head(36 * u, 46 * u, W - 72 * u, u, '#ffffff', 'rgba(255,255,255,0.85)', {}));
    o.push(R(40 * u, 220 * u, 236 * u, 290 * u, '#ffffff', { r: 22 * u, shadow: SH }), P(50 * u, 230 * u, 216 * u, 270 * u, 'PHOTO', { r: 16 * u, fill: p.c, sw: 0 }));
    o = o.concat(K.stack(300 * u, W - 330 * u, 262 * u, 506 * u, [
      { text: kind === 'office' ? 'EMPLOYEE' : 'STUDENT', size: 14 * u, font: 'Montserrat', bold: 800, color: p.b, ls: 360, align: 'left', gap: 6 },
      { text: '{{NAME}}', size: 38 * u, font: 'Poppins', bold: 800, color: p.ink, lh: 1.05, align: 'left', gap: 10 },
      { text: kind === 'office' ? '{{ROLE}}' : '{{ROLE}} · Section {{DEPT}}', size: 18 * u, font: 'Poppins', bold: 600, color: p.b, align: 'left', gap: 14 },
      { space: 46 }
    ], { maxK: 1, valign: 'top' }));
    o = o.concat(pill(300 * u, 446 * u, 260 * u, 40 * u, G(p, 0), (kind === 'office' ? 'ID ' : 'ROLL ') + '{{ID_NO}}', 15 * u, '#ffffff'));
    o = o.concat(grid(46 * u, 548 * u, W - 92 * u, u, p, { cells: f.cells.slice(kind === 'office' ? 1 : 1).concat([f.wide]), wide: f.wide }, { rh: 70, wide: false }));
    o.push(R(46 * u, 706 * u, W - 92 * u, 1.5 * u, p.c));
    o.push(R(46 * u, 726 * u, 300 * u, 84 * u, '#ffffff'), K.B(46 * u, 726 * u, 300 * u, 84 * u, '{{ID_NO}}'));
    o = o.concat(sign(W - 236 * u, 740 * u, 190 * u, u, p.a, f.who));
    o.push(K.POLY([[0, H], [W, H], [W, H - 110 * u], [0, H - 50 * u]], G(p, 0)), T(30 * u, H - 40 * u, W - 60 * u, 'Valid till {{VALID}}  ·  ☎ {{ORG_PHONE}}', 14 * u, { font: 'Poppins', bold: 600, color: '#ffffff', align: 'center' }));
    return out2(o, W, H, p);
  }; }
  // landscape
  function lwave(kind) { return function (W, H, p) {
    var u = W / 1012, f = F(kind), o = [R(0, 0, W, H, '#ffffff'), A('guilloche', 300 * u, 60 * u, 760 * u, 506 * u, { cols: [p.b], op: 0.07 })];
    o.push(K.PATH('M0 0 H' + 380 * u + ' C' + 300 * u + ' ' + H * 0.35 + ' ' + 420 * u + ' ' + H * 0.65 + ' ' + 340 * u + ' ' + H + ' H0Z', p.c));
    o.push(K.PATH('M0 0 H' + 350 * u + ' C' + 270 * u + ' ' + H * 0.35 + ' ' + 390 * u + ' ' + H * 0.65 + ' ' + 310 * u + ' ' + H + ' H0Z', G(p, 160)));
    o.push(C(40 * u, H - 40 * u, 120 * u, 'rgba(255,255,255,0.07)'));
    o = o.concat(photoRing(165 * u, 250 * u, 104 * u, u, p, { ring: K.G(135, '#ffffff', p.d) }));
    o.push(T(20 * u, 392 * u, 300 * u, kind === 'office' ? 'EMPLOYEE' : 'STUDENT', 15 * u, { font: 'Montserrat', bold: 800, color: 'rgba(255,255,255,0.85)', align: 'center', ls: 400 }));
    o.push(A('holo', 130 * u, 450 * u, 70 * u, 70 * u));
    o = o.concat(head(400 * u, 34 * u, W - 430 * u, u, p.a, '#64748b', { logo: 70, size: 26 }));
    o.push(T(400 * u, 132 * u, W - 430 * u, '{{NAME}}', 40 * u, { font: 'Poppins', bold: 800, color: p.ink }));
    o = o.concat(pill(400 * u, 190 * u, 300 * u, 38 * u, G(p, 0), f.pill, 14 * u, '#ffffff'));
    o = o.concat(grid(400 * u, 250 * u, 430 * u, u, p, f, { rh: 66, wide: false, is: 40, vs: 17 }));
    o = o.concat(irow(400 * u, 382 * u, 430 * u, u, f.wide[0], f.wide[1], f.wide[2], p, { is: 40, vs: 17 }));
    o.push(R(W - 160 * u, 250 * u, 124 * u, 124 * u, '#ffffff', { r: 12 * u, stroke: p.c, sw: 2 * u }), K.Q(W - 154 * u, 256 * u, 112 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'));
    o = o.concat(sign(W - 230 * u, 470 * u, 190 * u, u, p.a, f.who));
    o.push(T(400 * u, 500 * u, 360 * u, 'Valid till {{VALID}}', 15 * u, { font: 'Poppins', bold: 600, color: '#64748b' }));
    o.push(R(310 * u, H - 14 * u, W - 310 * u, 14 * u, G(p, 0)));
    return out2(o, W, H, p, true);
  }; }
  function lluxe(kind) { return function (W, H, p) {
    var u = W / 1012, f = F(kind), o = [R(0, 0, W, H, K.G(160, p.a, p.b, p.a)), A('guilloche', 0, 40 * u, W, H, { cols: [p.d], op: 0.16 }), R(16 * u, 16 * u, W - 32 * u, H - 32 * u, null, { r: 22 * u, stroke: p.d, sw: 2 * u })];
    o = o.concat(head(44 * u, 40 * u, W - 330 * u, u, p.d, '#cbd5e1', { logo: 70, size: 26 }));
    o.push(R(W - 284 * u, 40 * u, 230 * u, 280 * u, '#ffffff', { r: 18 * u, stroke: p.d, sw: 3 * u }), P(W - 276 * u, 48 * u, 214 * u, 264 * u, 'PHOTO', { r: 12 * u, fill: p.b, sw: 0 }));
    o.push(T(44 * u, 150 * u, 620 * u, '{{NAME|upper}}', 38 * u, { font: 'Cinzel', bold: 700, color: '#ffffff', ls: 40 }));
    o.push(T(44 * u, 204 * u, 620 * u, f.pill, 15 * u, { font: 'Montserrat', bold: 700, color: p.d, ls: 220 }));
    o = o.concat(grid(44 * u, 252 * u, 560 * u, u, p, f, { rh: 64, wide: false, is: 40, vs: 17, vc: '#ffffff', lc: '#94a3b8', tile: 'rgba(212,175,55,0.16)', fg: p.d }));
    o.push(A('chip', 44 * u, H - 130 * u, 96 * u, 72 * u, { cols: ['#d4af37'] }), A('holo', 156 * u, H - 130 * u, 70 * u, 70 * u));
    o = o.concat(sign(W - 284 * u, 360 * u, 230 * u, u, p.d, f.who));
    o.push(T(260 * u, H - 100 * u, 400 * u, 'VALID TILL  {{VALID}}', 14 * u, { font: 'Montserrat', bold: 700, color: p.d, ls: 160 }));
    return out2(o, W, H, p, true);
  }; }

  var D = [
    ['wave', 'Premium Wave', 'school', ['idp'], wave('school'), ['royal', 'emerald', 'crimson', 'purple']],
    ['hero', 'Photo Hero', 'school', ['idp'], hero('school'), ['royal', 'teal', 'crimson', 'orange']],
    ['glass', 'Frosted Glass', 'school', ['idp'], glass('school'), ['purple', 'royal', 'teal', 'crimson']],
    ['stripe', 'Modern Stripe', 'school', ['idp'], stripe('school'), ['royal', 'emerald', 'orange', 'purple']],
    ['luxe', 'Royal Luxe', 'school', ['idp'], luxe('school'), ['navygold', 'gold']],
    ['lwave', 'Landscape Premium', 'school', ['idl'], lwave('school'), ['royal', 'emerald', 'crimson', 'purple']],
    ['owave', 'Corporate Wave', 'office', ['idp'], wave('office'), ['royal', 'teal', 'crimson']],
    ['ohero', 'Corporate Photo Hero', 'office', ['idp'], hero('office'), ['royal', 'teal', 'purple']],
    ['ostripe', 'Corporate Stripe', 'office', ['idp'], stripe('office'), ['teal', 'royal', 'orange']],
    ['oluxe', 'Executive Luxe', 'office', ['idp'], luxe('office'), ['gold', 'navygold']],
    ['olwave', 'Corporate Landscape', 'office', ['idl'], lwave('office'), ['royal', 'teal', 'crimson']],
    ['olluxe', 'Executive Landscape', 'office', ['idl'], lluxe('office'), ['gold', 'navygold']],
    ['lluxe', 'Royal Landscape', 'school', ['idl'], lluxe('school'), ['navygold']]
  ];
  var out = [];
  D.forEach(function (d) { d[5].forEach(function (k, i) { out.push({ id: 'idp-' + d[0] + '-' + k, name: d[1] + (i ? ' · ' + k[0].toUpperCase() + k.slice(1) : ''), cat: d[2] === 'office' ? 'Premium Office' : 'Premium School', sizes: d[3], pal: PAL[k], build: d[4] }); }); });
  [].unshift.apply(ST.templates, out);
})();
