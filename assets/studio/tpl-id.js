/* S Printer — ID card templates (front + back), original designs for schools, offices and events */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P;
  var BACK_TERMS = '1. This card is the property of {{ORG_NAME}}.\n2. Always carry this card and show it on request.\n3. If found, please return it to the address below.';
  function backPortrait(W, H, p, o) {
    var u = W / 638, out = [R(0, 0, W, 120 * u, o && o.grad ? K.G(0, p.a, p.b) : p.a), R(0, H - 70 * u, W, 70 * u, p.a)];
    out.push(T(40 * u, 36 * u, W - 80 * u, '{{ORG_NAME}}', 30 * u, { font: 'Montserrat', bold: 800, color: '#fff', align: 'center' }));
    out.push(T(40 * u, 150 * u, W - 80 * u, 'INSTRUCTIONS', 24 * u, { font: 'Montserrat', bold: 800, color: p.a, align: 'center', ls: 120 }));
    out.push(T(50 * u, 196 * u, W - 100 * u, BACK_TERMS, 20 * u, { color: '#334155', lh: 1.45 }));
    out = out.concat(K.rows(50 * u, 430 * u, W - 100 * u, [['Address', '{{ADDRESS}}'], ['Emergency', '{{EMERGENCY}}'], ['Valid till', '{{VALID}}']], 20 * u, { kw: 0.32, gap: 1.7 }));
    out.push(K.Q(50 * u, 640 * u, 190 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'));
    out.push(P(W - 290 * u, 690 * u, 240 * u, 80 * u, 'SIGN', { fill: '#f8fafc', label: 'Authority sign' }));
    out.push(T(W - 290 * u, 776 * u, 240 * u, 'Authorised signatory', 17 * u, { align: 'center', color: '#475569' }));
    out.push(T(30 * u, 870 * u, W - 60 * u, '{{ORG_ADDRESS}}\n☎ {{ORG_PHONE}}  ·  {{ORG_WEB}}', 18 * u, { align: 'center', color: '#334155', lh: 1.35 }));
    out.push(T(30 * u, H - 50 * u, W - 60 * u, 'If found, please return to the office', 18 * u, { align: 'center', color: '#fff', bold: 600 }));
    return out;
  }
  function backLand(W, H, p) {
    var u = W / 1012, out = [R(0, 0, W, 90 * u, p.a), R(0, H - 50 * u, W, 50 * u, p.b)];
    out.push(T(30 * u, 24 * u, W - 60 * u, '{{ORG_NAME}}', 34 * u, { font: 'Montserrat', bold: 800, color: '#fff', align: 'center' }));
    out.push(T(40 * u, 116 * u, 600 * u, BACK_TERMS, 20 * u, { color: '#334155', lh: 1.45 }));
    out = out.concat(K.rows(40 * u, 300 * u, 600 * u, [['Address', '{{ADDRESS}}'], ['Emergency', '{{EMERGENCY}}'], ['Valid till', '{{VALID}}']], 20 * u, { kw: 0.28, gap: 1.6 }));
    out.push(K.Q(W - 250 * u, 116 * u, 200 * u, '{{NAME}} | {{ID_NO}} | {{ORG_NAME}}'));
    out.push(P(W - 270 * u, 340 * u, 240 * u, 76 * u, 'SIGN', { fill: '#f8fafc', label: 'Authority sign' }));
    out.push(T(W - 270 * u, 420 * u, 240 * u, 'Authorised signatory', 17 * u, { align: 'center', color: '#475569' }));
    out.push(T(30 * u, H - 40 * u, W - 60 * u, '{{ORG_ADDRESS}}  ·  ☎ {{ORG_PHONE}}', 18 * u, { align: 'center', color: '#fff' }));
    return out;
  }
  var PN = ['Front', 'Back'];
  var layouts = [
    { id: 'curve', name: 'Corporate Curve', cat: 'Corporate', sizes: ['idp'], pals: ['blue', 'teal', 'slate', 'rose'], build: function (W, H, p) {
      var u = W / 638, o = [K.PATH('M0 ' + 260 * u + ' C ' + W * 0.3 + ' ' + 340 * u + ', ' + W * 0.7 + ' ' + 200 * u + ', ' + W + ' ' + 280 * u + ' L ' + W + ' 0 L 0 0 Z', K.G(20, p.a, p.b))];
      o.push(P(36 * u, 30 * u, 90 * u, 90 * u, 'LOGO', { shape: 'circle', fill: '#ffffff', sw: 0 }));
      o.push(T(140 * u, 38 * u, W - 170 * u, '{{ORG_NAME}}', 30 * u, { font: 'Montserrat', bold: 800, color: '#fff', lh: 1.05 }));
      o.push(T(140 * u, 96 * u, W - 170 * u, '{{ORG_TAG}}', 17 * u, { color: p.c }));
      o.push(C(W / 2, 330 * u, 140 * u, '#ffffff', { shadow: { y: 6, b: 18, c: 'rgba(0,0,0,.18)' } }));
      o.push(P(W / 2 - 128 * u, 202 * u, 256 * u, 256 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: p.b, sw: 6 * u }));
      o.push(T(30 * u, 488 * u, W - 60 * u, '{{NAME}}', 40 * u, { font: 'Poppins', bold: 800, color: p.a, align: 'center' }));
      o.push(T(30 * u, 542 * u, W - 60 * u, '{{ROLE|upper}}', 21 * u, { color: p.b, bold: 600, align: 'center', ls: 150 }));
      o = o.concat(K.rows(80 * u, 610 * u, W - 160 * u, [['ID No.', '{{ID_NO}}'], ['Dept.', '{{DEPT}}'], ['Blood', '{{BLOOD}}'], ['Phone', '{{PHONE}}']], 22 * u, { kw: 0.34, gap: 1.6 }));
      o.push(K.B(W / 2 - 170 * u, 830 * u, 340 * u, 110 * u, '{{ID_NO}}'));
      o.push(R(0, H - 26 * u, W, 26 * u, p.acc));
      return { pageNames: PN, pages: [{ bg: '#ffffff', objects: o }, { bg: '#ffffff', objects: backPortrait(W, H, p, { grad: true }) }] };
    } },
    { id: 'school', name: 'School Classic', cat: 'School', sizes: ['idp'], pals: ['maroon', 'green', 'navy', 'orange'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, W, 210 * u, p.a), R(0, 210 * u, W, 12 * u, p.d)];
      o.push(P(24 * u, 26 * u, 110 * u, 110 * u, 'LOGO', { shape: 'circle', fill: '#ffffff', sw: 0 }));
      o.push(T(150 * u, 26 * u, W - 170 * u, '{{ORG_NAME}}', 31 * u, { font: 'Oswald', bold: 700, color: '#ffffff', lh: 1.05 }));
      o.push(T(150 * u, 110 * u, W - 170 * u, '{{ORG_ADDRESS}}', 16 * u, { color: '#f1f5f9', lh: 1.25 }));
      o.push(T(0, 236 * u, W, 'IDENTITY CARD', 22 * u, { font: 'Montserrat', bold: 800, color: p.b, align: 'center', ls: 250 }));
      o.push(P(W / 2 - 115 * u, 280 * u, 230 * u, 280 * u, 'PHOTO', { r: 12 * u, fill: p.soft, stroke: p.a, sw: 5 * u }));
      o.push(T(30 * u, 578 * u, W - 60 * u, '{{NAME|upper}}', 34 * u, { font: 'Poppins', bold: 800, color: p.a, align: 'center' }));
      o = o.concat(K.rows(64 * u, 636 * u, W - 128 * u, [['Class', '{{ROLE}}'], ['Roll No.', '{{ID_NO}}'], ["Father", '{{FATHER}}'], ['D.O.B.', '{{DOB}}'], ['Phone', '{{PHONE}}']], 21 * u, { kw: 0.32, gap: 1.6 }));
      o.push(P(W - 230 * u, 868 * u, 200 * u, 64 * u, 'SIGN', { fill: '#ffffff', label: 'Principal sign' }));
      o.push(T(W - 230 * u, 932 * u, 200 * u, 'Principal', 17 * u, { align: 'center', color: '#334155', bold: 600 }));
      o.push(R(0, H - 22 * u, W, 22 * u, p.a));
      return { pageNames: PN, pages: [{ bg: '#ffffff', objects: o }, { bg: '#ffffff', objects: backPortrait(W, H, p) }] };
    } },
    { id: 'event', name: 'Event Pass', cat: 'Event', sizes: ['idp'], pals: ['purple', 'black', 'rose'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, W, H, K.G(135, p.a, p.b)), C(W, 0, 300 * u, 'rgba(255,255,255,0.08)'), C(0, H, 360 * u, 'rgba(255,255,255,0.06)')];
      o.push(R(W / 2 - 60 * u, 26 * u, 120 * u, 22 * u, 'rgba(255,255,255,0.85)', { r: 11 * u }));
      o.push(T(30 * u, 76 * u, W - 60 * u, '{{ORG_NAME}}', 40 * u, { font: 'Bebas Neue', color: '#fff', align: 'center', ls: 80 }));
      o.push(T(30 * u, 128 * u, W - 60 * u, '{{ORG_TAG}}', 19 * u, { color: p.c, align: 'center' }));
      o.push(P(W / 2 - 120 * u, 190 * u, 240 * u, 240 * u, 'PHOTO', { r: 30 * u, fill: 'rgba(255,255,255,0.2)', stroke: '#fff', sw: 5 * u }));
      o.push(T(30 * u, 456 * u, W - 60 * u, '{{NAME}}', 42 * u, { bold: 800, color: '#fff', align: 'center' }));
      o.push(R(80 * u, 524 * u, W - 160 * u, 66 * u, p.acc, { r: 33 * u }));
      o.push(T(80 * u, 538 * u, W - 160 * u, '{{ROLE|upper}}', 30 * u, { font: 'Montserrat', bold: 800, color: p.ink === '#111827' ? '#111827' : '#ffffff', align: 'center', ls: 200 }));
      o.push(R(W / 2 - 120 * u, 630 * u, 240 * u, 240 * u, '#ffffff', { r: 16 * u }));
      o.push(K.Q(W / 2 - 110 * u, 640 * u, 220 * u, '{{ID_NO}} {{NAME}}'));
      o.push(T(30 * u, 896 * u, W - 60 * u, 'Pass No. {{ID_NO}}  ·  {{VALID}}', 20 * u, { color: '#fff', align: 'center' }));
      return { pageNames: PN, pages: [{ bg: p.a, objects: o }, { bg: '#ffffff', objects: backPortrait(W, H, p, { grad: true }) }] };
    } },
    { id: 'mini', name: 'Minimal Badge', cat: 'Corporate', sizes: ['idp'], pals: ['slate', 'teal', 'blue'], build: function (W, H, p) {
      var u = W / 638, o = [R(0, 0, 26 * u, H, p.b), R(26 * u, 0, 10 * u, H, p.acc)];
      o.push(P(80 * u, 50 * u, 80 * u, 80 * u, 'LOGO', { r: 12 * u, fill: p.soft, sw: 0 }));
      o.push(T(176 * u, 54 * u, W - 200 * u, '{{ORG_NAME}}', 28 * u, { font: 'Montserrat', bold: 800, color: p.a }));
      o.push(T(176 * u, 94 * u, W - 200 * u, '{{ORG_TAG}}', 16 * u, { color: '#64748b' }));
      o.push(P(80 * u, 180 * u, 300 * u, 360 * u, 'PHOTO', { r: 20 * u, fill: p.soft, sw: 0 }));
      o.push(T(80 * u, 570 * u, W - 110 * u, '{{NAME}}', 42 * u, { font: 'Poppins', bold: 800, color: p.ink, lh: 1.05 }));
      o.push(T(80 * u, 630 * u, W - 110 * u, '{{ROLE}}', 24 * u, { color: p.b, bold: 600 }));
      o = o.concat(K.rows(80 * u, 700 * u, W - 120 * u, [['ID', '{{ID_NO}}'], ['Phone', '{{PHONE}}'], ['Blood', '{{BLOOD}}']], 21 * u, { kw: 0.26, gap: 1.6 }));
      o.push(K.Q(W - 200 * u, H - 210 * u, 160 * u, '{{ID_NO}}'));
      return { pageNames: PN, pages: [{ bg: '#ffffff', objects: o }, { bg: '#ffffff', objects: backPortrait(W, H, p) }] };
    } },
    { id: 'land', name: 'Corporate Landscape', cat: 'Corporate', sizes: ['idl'], pals: ['blue', 'teal', 'slate', 'rose'], build: function (W, H, p) {
      var u = W / 1012, o = [R(0, 0, 330 * u, H, K.G(90, p.a, p.b)), K.POLY([[330 * u, 0], [380 * u, 0], [330 * u, H]], p.b)];
      o.push(P(50 * u, 120 * u, 230 * u, 280 * u, 'PHOTO', { r: 14 * u, fill: p.c, stroke: '#fff', sw: 5 * u }));
      o.push(T(20 * u, 430 * u, 290 * u, '{{ROLE|upper}}', 21 * u, { color: '#fff', bold: 700, align: 'center', ls: 100 }));
      o.push(P(36 * u, 26 * u, 70 * u, 70 * u, 'LOGO', { shape: 'circle', fill: '#fff', sw: 0 }));
      o.push(T(410 * u, 30 * u, W - 440 * u, '{{ORG_NAME}}', 36 * u, { font: 'Montserrat', bold: 800, color: p.a }));
      o.push(T(410 * u, 78 * u, W - 440 * u, '{{ORG_TAG}}', 18 * u, { color: '#64748b' }));
      o.push(L(410 * u, 116 * u, W - 40 * u, 116 * u, p.c, 2 * u));
      o.push(T(410 * u, 140 * u, W - 440 * u, '{{NAME}}', 42 * u, { font: 'Poppins', bold: 800, color: p.ink }));
      o = o.concat(K.rows(410 * u, 214 * u, 420 * u, [['ID No.', '{{ID_NO}}'], ['Department', '{{DEPT}}'], ['D.O.B.', '{{DOB}}'], ['Blood group', '{{BLOOD}}'], ['Phone', '{{PHONE}}']], 21 * u, { kw: 0.4, gap: 1.6 }));
      o.push(K.Q(W - 190 * u, 220 * u, 150 * u, '{{ID_NO}} {{NAME}}'));
      o.push(K.B(410 * u, H - 120 * u, 330 * u, 90 * u, '{{ID_NO}}'));
      o.push(R(0, H - 16 * u, W, 16 * u, p.acc));
      return { pageNames: PN, pages: [{ bg: '#ffffff', objects: o }, { bg: '#ffffff', objects: backLand(W, H, p) }] };
    } },
    { id: 'schooll', name: 'School Landscape', cat: 'School', sizes: ['idl'], pals: ['maroon', 'green', 'navy'], build: function (W, H, p) {
      var u = W / 1012, o = [R(0, 0, W, 140 * u, p.a), R(0, 140 * u, W, 8 * u, p.d)];
      o.push(P(24 * u, 18 * u, 104 * u, 104 * u, 'LOGO', { shape: 'circle', fill: '#fff', sw: 0 }));
      o.push(T(146 * u, 18 * u, W - 170 * u, '{{ORG_NAME}}', 38 * u, { font: 'Oswald', bold: 700, color: '#fff' }));
      o.push(T(146 * u, 80 * u, W - 170 * u, '{{ORG_ADDRESS}}', 17 * u, { color: '#f1f5f9' }));
      o.push(P(40 * u, 180 * u, 220 * u, 270 * u, 'PHOTO', { r: 10 * u, fill: p.soft, stroke: p.a, sw: 4 * u }));
      o.push(T(290 * u, 176 * u, W - 320 * u, '{{NAME|upper}}', 36 * u, { font: 'Poppins', bold: 800, color: p.a }));
      o = o.concat(K.rows(290 * u, 238 * u, 470 * u, [['Class / Sec.', '{{ROLE}} {{DEPT}}'], ['Roll No.', '{{ID_NO}}'], ["Father's name", '{{FATHER}}'], ['D.O.B.', '{{DOB}}'], ['Phone', '{{PHONE}}']], 21 * u, { kw: 0.38, gap: 1.6 }));
      o.push(P(W - 250 * u, H - 150 * u, 210 * u, 66 * u, 'SIGN', { fill: '#fff', label: 'Principal sign' }));
      o.push(T(W - 250 * u, H - 82 * u, 210 * u, 'Principal', 17 * u, { align: 'center', bold: 600, color: '#334155' }));
      o.push(R(0, H - 26 * u, W, 26 * u, p.a));
      return { pageNames: PN, pages: [{ bg: '#ffffff', objects: o }, { bg: '#ffffff', objects: backLand(W, H, p) }] };
    } },
    { id: 'member', name: 'Membership Card', cat: 'Event', sizes: ['idl'], pals: ['gold', 'black', 'purple'], build: function (W, H, p) {
      var u = W / 1012, o = [R(0, 0, W, H, K.G(135, p.a, p.b)), C(W * 0.85, -60 * u, 320 * u, 'rgba(255,255,255,0.07)'), C(W * 0.1, H + 80 * u, 300 * u, 'rgba(255,255,255,0.06)')];
      o.push(T(50 * u, 40 * u, 600 * u, '{{ORG_NAME}}', 40 * u, { font: 'Cinzel', bold: 700, color: p.c }));
      o.push(T(50 * u, 96 * u, 600 * u, '{{ORG_TAG}}', 18 * u, { color: '#f8fafc' }));
      o.push(P(W - 270 * u, 50 * u, 220 * u, 260 * u, 'PHOTO', { r: 14 * u, fill: 'rgba(255,255,255,0.2)', stroke: p.d, sw: 4 * u }));
      o.push(T(50 * u, 250 * u, 640 * u, '{{NAME|upper}}', 44 * u, { font: 'Montserrat', bold: 800, color: '#fff' }));
      o.push(T(50 * u, 310 * u, 640 * u, '{{ROLE}}', 24 * u, { color: p.d, bold: 600 }));
      o.push(T(50 * u, 420 * u, 300 * u, 'MEMBER NO.\n{{ID_NO}}', 22 * u, { color: '#fff', lh: 1.3, bold: 600 }));
      o.push(T(380 * u, 420 * u, 300 * u, 'VALID TILL\n{{VALID}}', 22 * u, { color: '#fff', lh: 1.3, bold: 600 }));
      o.push(R(50 * u, 540 * u, 120 * u, 50 * u, p.d, { r: 8 * u, op: 0.9 }));
      return { pageNames: PN, pages: [{ bg: p.a, objects: o }, { bg: '#ffffff', objects: backLand(W, H, p) }] };
    } }
  ];
  ST.register(K.expand('id', layouts, ['blue']));
})();
