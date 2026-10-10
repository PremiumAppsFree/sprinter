/* S Printer — Sarkari job / exam posters for cyber cafés (original designs, any size) */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C;
  var CATS = {
    'Job Vacancy': { tag: 'NEW VACANCY', hi: 'नई भर्ती', pal: ['blue', 'navy'], rows: [['Total posts', '{{TOTAL_POSTS}}'], ['Qualification', '{{QUALIFICATION}}'], ['Age limit', '{{AGE_LIMIT}}'], ['Application fee', '{{FEE}}'], ['Salary', '{{SALARY}}'], ['Last date', '{{LAST_DATE}}']] },
    'Admit Card': { tag: 'ADMIT CARD OUT', hi: 'एडमिट कार्ड जारी', pal: ['purple', 'black'], rows: [['Exam date', '{{EXAM_DATE}}'], ['Admit card from', '{{START_DATE}}'], ['Total posts', '{{TOTAL_POSTS}}'], ['Download at', '{{WEBSITE}}']] },
    'Result': { tag: 'RESULT DECLARED', hi: 'रिजल्ट जारी', pal: ['green', 'teal'], rows: [['Exam date', '{{EXAM_DATE}}'], ['Result date', '{{START_DATE}}'], ['Total posts', '{{TOTAL_POSTS}}'], ['Check at', '{{WEBSITE}}']] },
    'Admission': { tag: 'ADMISSION OPEN', hi: 'प्रवेश प्रारंभ', pal: ['orange', 'rose'], rows: [['Course / class', '{{QUALIFICATION}}'], ['Seats', '{{TOTAL_POSTS}}'], ['Age / eligibility', '{{AGE_LIMIT}}'], ['Fee', '{{FEE}}'], ['Last date', '{{LAST_DATE}}']] },
    'Answer Key': { tag: 'ANSWER KEY OUT', hi: 'उत्तर कुंजी जारी', pal: ['teal', 'slate'], rows: [['Exam date', '{{EXAM_DATE}}'], ['Answer key date', '{{START_DATE}}'], ['Objection last date', '{{LAST_DATE}}'], ['Check at', '{{WEBSITE}}']] }
  };
  function sc(W, H) { return Math.min(W / 794, H / 1123) * (W > H ? 1.15 : 1); }
  function shopFooter(W, H, p, s, y) {
    var h = H - y, o = [R(0, y, W, h, p.a)];
    o.push(R(0, y, W, 6 * s, p.acc));
    var qs = Math.min(h - 30 * s, 150 * s);
    o.push(R(W - qs - 34 * s, y + (h - qs) / 2 - 6 * s, qs + 12 * s, qs + 12 * s, '#fff', { r: 8 * s }));
    o.push(K.Q(W - qs - 28 * s, y + (h - qs) / 2, qs, '{{WEBSITE}}'));
    o = o.concat(K.stack(36 * s, W - qs - 100 * s, y + 10 * s, H - 10 * s, [
      { text: '{{SHOP_NAME}}', size: 34 * s, font: 'Montserrat', bold: 800, color: '#fff', align: 'left', gap: 4 },
      { text: '☎ {{SHOP_PHONE}}', size: 22 * s, bold: 700, color: p.acc, align: 'left', gap: 4 },
      { text: '{{SHOP_ADDRESS}}', size: 15 * s, color: '#e2e8f0', align: 'left', gap: 4, est: 'Main Market, Near SBI Bank, Jaipur' },
      { text: 'Online form · Photo · Print · Admit card — all services here', size: 14 * s, color: '#cbd5e1', align: 'left', gap: 0 }
    ], { maxK: 1.1 }));
    return o;
  }
  function infoGrid(x, y, w, h, rows, p, s, cols) {
    var o = [], rN = Math.ceil(rows.length / cols), g = 14 * s, cw = (w - (cols - 1) * g) / cols, ch = Math.min(120 * s, (h - (rN - 1) * g) / rN);
    rows.forEach(function (r, i) {
      var cx = x + (i % cols) * (cw + g), cy = y + Math.floor(i / cols) * (ch + g);
      o.push(R(cx, cy, cw, ch, '#ffffff', { r: 12 * s, stroke: p.d, sw: 2 * s, shadow: { x: 0, y: 4 * s, b: 10 * s, c: 'rgba(15,23,42,.10)' } }));
      o.push(R(cx, cy, 8 * s, ch, p.b, { r: 4 * s }));
      o.push(T(cx + 22 * s, cy + ch * 0.16, cw - 34 * s, r[0].toUpperCase(), Math.min(15 * s, ch * 0.17), { bold: 700, color: p.b, ls: 80 }));
      o.push(T(cx + 22 * s, cy + ch * 0.44, cw - 34 * s, r[1], Math.min(24 * s, ch * 0.24), { bold: 800, color: p.ink, font: 'Poppins', lh: 1.1, anyWrap: /https?:|www\./.test(r[1]) || r[1] === '{{WEBSITE}}' }));
    });
    return o;
  }
  var layouts = [];
  Object.keys(CATS).forEach(function (cat) {
    var c = CATS[cat];
    layouts.push({ id: 'band-' + cat, name: cat + ' — Bold band', cat: cat, pals: c.pal, build: function (W, H, p) {
      var s = sc(W, H), top = H * 0.27, foot = H - Math.max(150 * s, H * 0.17), o = [R(0, 0, W, top, K.G(30, p.a, p.b))];
      o.push(C(W, 0, top * 0.9, 'rgba(255,255,255,0.08)')); o.push(C(0, top, top * 0.5, 'rgba(255,255,255,0.06)'));
      o = o.concat(K.stack(40 * s, W - 80 * s, 26 * s, top - 18 * s, [
        { text: c.tag + '  ·  ' + c.hi, size: 20 * s, bold: 800, color: p.a, bg: p.acc, ls: 120, gap: 14, font: 'Poppins' },
        { text: '{{JOB_TITLE}}', size: 52 * s, font: 'Anton', color: '#fff', lh: 1.05, gap: 8, est: 'Rajasthan Police Constable Bharti 2026' },
        { text: '{{ORG}}', size: 20 * s, color: '#e0f2fe', gap: 0, est: 'Rajasthan Police Department' }
      ]));
      var cols = W > H * 1.2 ? 3 : 2;
      o = o.concat(infoGrid(40 * s, top + 34 * s, W - 80 * s, foot - top - 130 * s, c.rows, p, s, cols));
      o.push(T(40 * s, foot - 80 * s, W - 80 * s, '{{NOTE}}', 17 * s, { color: '#334155', align: 'center', lh: 1.3 }));
      o = o.concat(shopFooter(W, H, p, s, foot));
      return { pages: [{ bg: p.soft, objects: o }] };
    } });
    layouts.push({ id: 'notice-' + cat, name: cat + ' — Notice board', cat: cat, pals: c.pal, build: function (W, H, p) {
      var s = sc(W, H), o = [], st = 26 * s, n = Math.ceil(W / st) + 2;
      for (var i = 0; i < n; i++) o.push(K.POLY([[i * st * 2 - st * 2, 0], [i * st * 2 - st, 0], [i * st * 2 + 20 * s - st, 20 * s], [i * st * 2 + 20 * s - st * 2, 20 * s]], '#111827'));
      o.unshift(R(0, 0, W, 20 * s, '#facc15'));
      var foot = H - Math.max(150 * s, H * 0.17);
      o = o.concat(K.stack(40 * s, W - 80 * s, 40 * s, H * 0.3, [
        { text: c.hi + ' | ' + c.tag, size: 24 * s, font: 'Hind', bold: 700, color: '#b91c1c', gap: 10 },
        { text: '{{JOB_TITLE}}', size: 50 * s, font: 'Oswald', bold: 700, color: p.a, lh: 1.05, gap: 8, est: 'Rajasthan Police Constable Bharti 2026' },
        { text: '{{ORG}}', size: 20 * s, color: '#334155', gap: 0 }
      ]));
      o.push(R(40 * s, H * 0.31, W - 80 * s, foot - H * 0.31 - 30 * s, '#ffffff', { r: 14 * s, stroke: p.a, sw: 3 * s }));
      var rows = c.rows, rh = Math.min(64 * s, (foot - H * 0.31 - 140 * s) / rows.length);
      rows.forEach(function (r, i) {
        var y = H * 0.31 + 24 * s + i * rh;
        if (i % 2 === 0) o.push(R(52 * s, y - 6 * s, W - 104 * s, rh, p.soft, { r: 8 * s }));
        o.push(T(70 * s, y + rh * 0.12, (W - 140 * s) * 0.42, '▸ ' + r[0], Math.min(22 * s, rh * 0.42), { bold: 700, color: p.b }));
        o.push(T(70 * s + (W - 140 * s) * 0.42, y + rh * 0.12, (W - 140 * s) * 0.58, r[1], Math.min(22 * s, rh * 0.42), { bold: 600, color: p.ink, anyWrap: r[1] === '{{WEBSITE}}' }));
      });
      o.push(T(60 * s, foot - 100 * s, W - 120 * s, 'Documents: {{DOCS|comma}}', 16 * s, { color: '#334155', lh: 1.3 }));
      o = o.concat(shopFooter(W, H, p, s, foot));
      return { pages: [{ bg: '#fffbeb', objects: o }] };
    } });
    layouts.push({ id: 'burst-' + cat, name: cat + ' — Burst', cat: cat, pals: c.pal, build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, K.G(160, p.a, p.b))], foot = H - Math.max(150 * s, H * 0.17);
      o.push(C(W * 0.9, H * 0.1, 260 * s, 'rgba(255,255,255,0.07)')); o.push(C(W * 0.05, H * 0.55, 200 * s, 'rgba(255,255,255,0.05)'));
      var bx = W - 150 * s, by = 150 * s;
      o.push(K.burst(bx, by, 120 * s, 98 * s, 18, p.acc));
      o.push(T(bx - 90 * s, by - 46 * s, 180 * s, '{{TOTAL_POSTS}}', 44 * s, { font: 'Anton', align: 'center', color: p.a }));
      o.push(T(bx - 90 * s, by + 10 * s, 180 * s, cat === 'Admission' ? 'SEATS' : 'POSTS', 22 * s, { bold: 800, align: 'center', color: p.a, ls: 200 }));
      o = o.concat(K.stack(40 * s, W - 330 * s, 40 * s, H * 0.33, [
        { text: c.tag, size: 22 * s, bold: 800, color: p.acc, ls: 250, align: 'left', gap: 10 },
        { text: '{{JOB_TITLE}}', size: 54 * s, font: 'Bebas Neue', color: '#fff', lh: 1.08, align: 'left', gap: 20, cw: 0.75, est: 'Rajasthan Police Constable Bharti 2026' },
        { text: '{{ORG}}', size: 20 * s, color: '#e2e8f0', align: 'left', gap: 0 }
      ]));
      o = o.concat(infoGrid(40 * s, H * 0.36, W - 80 * s, foot - H * 0.36 - 40 * s, c.rows, Object.assign({}, p, { ink: '#0f172a' }), s, W > H * 1.2 ? 3 : 2));
      o = o.concat(shopFooter(W, H, Object.assign({}, p, { a: '#0f172a' }), s, foot));
      return { pages: [{ bg: p.a, objects: o }] };
    } });
  });
  ST.register(K.expand('ps', layouts, ['blue']).map(function (t) { t.sizes = ['a4p', 'sq', 'story', 'a4l']; return t; }));
})();
