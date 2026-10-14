/* S Printer — School project paper / project file templates. Every design has 4 pages:
 * cover, certificate, acknowledgement and index. Original designs by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P;
  var PN = ['Cover', 'Certificate', 'Acknowledgement', 'Index'];
  var SH = { y: 8, b: 22, c: 'rgba(15,23,42,.20)' };
  var CERT = 'This is to certify that {{NAME}} of Class {{CLASS}} – {{SECTION}}, Roll No. {{ROLL}}, {{SCHOOL}}, has successfully completed the project titled “{{TITLE}}” in {{SUBJECT}} under my guidance during the academic session {{SESSION}}.\n\nThis project is the student’s own sincere work. I wish the student every success in the future.';
  var EST_ACK = 'I would like to express my special thanks of gratitude to my teacher Mrs. Neha Verma as well as our principal who gave me the golden opportunity to do this wonderful project on the topic Water Conservation, which also helped me in doing a lot of research, and I came to know about so many new things. I am really thankful to them. Secondly, I would also like to thank my parents and friends who helped me a lot in finalising this project within the limited time frame.';

  // ---------- small helpers ----------
  function ellipse(cx, cy, rx, ry, ang, o) {
    var pts = [], a = (ang || 0) * Math.PI / 180;
    for (var i = 0; i < 48; i++) { var t = Math.PI * 2 * i / 48, x = Math.cos(t) * rx, y = Math.sin(t) * ry; pts.push([cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]); }
    return K.POLY(pts, o && o.fill || null, Object.assign({ stroke: '#000', sw: 2 }, o));
  }
  function hexO(cx, cy, r, col, sw, op) { var p = []; for (var i = 0; i < 6; i++) { var a = Math.PI / 3 * i; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return K.POLY(p, null, { stroke: col, sw: sw, op: op }); }
  function leaf(cx, cy, len, ang, fill, op) {
    var a = ang * Math.PI / 180, w = len * 0.42;
    function pt(x, y) { return (cx + x * Math.cos(a) - y * Math.sin(a)).toFixed(1) + ' ' + (cy + x * Math.sin(a) + y * Math.cos(a)).toFixed(1); }
    return [K.PATH('M ' + pt(0, 0) + ' Q ' + pt(len * 0.5, -w) + ' ' + pt(len, 0) + ' Q ' + pt(len * 0.5, w) + ' ' + pt(0, 0) + ' Z', fill, { op: op == null ? 1 : op }),
      K.PATH('M ' + pt(len * 0.05, 0) + ' L ' + pt(len * 0.92, 0), null, { stroke: 'rgba(255,255,255,0.55)', sw: Math.max(1, len / 60), op: op == null ? 1 : op })];
  }
  function cloud(x, y, s, fill) { return [C(x, y, 30 * s, fill), C(x + 34 * s, y - 14 * s, 38 * s, fill), C(x + 72 * s, y, 30 * s, fill), R(x - 2 * s, y, 76 * s, 30 * s, fill, { r: 14 * s })]; }
  function photo(x, y, w, h, o) { return P(x, y, w, h, 'PHOTO', Object.assign({ fill: '#e8eef5', label: 'Student photo' }, o)); }
  function logo(x, y, s, o) { return P(x, y, s, s, 'LOGO', Object.assign({ shape: 'circle', fill: '#ffffff', sw: 0 }, o)); }
  function school(x, w, top, bot, col, o) {
    o = o || {};
    return K.stack(x, w, top, bot, [
      { text: o.upper === false ? '{{SCHOOL}}' : '{{SCHOOL|upper}}', size: o.size || 30, font: o.font || 'Montserrat', bold: o.bold || 800, color: col, lh: 1.08, ls: o.ls == null ? 30 : o.ls, align: o.align || 'center', gap: 6 },
      { text: '{{SCHOOL_TAG}}', size: o.sub || 16, color: o.subCol || col, italic: o.italic, align: o.align || 'center', gap: 0, est: 'Affiliated to CBSE · Jaipur' }
    ], { maxK: 1, valign: o.valign });
  }
  function title(x, w, top, bot, c, o) {
    o = o || {};
    var it = [];
    if (o.kicker !== false) it.push({ text: o.kicker || 'A PROJECT REPORT ON', size: o.ks || 17, bold: 700, ls: 320, color: c.k, align: o.align, gap: 14, font: o.kfont || 'Poppins' });
    it.push({ text: o.upper ? '{{TITLE|upper}}' : '{{TITLE}}', size: o.ts || 64, font: o.font || 'Playfair Display', bold: o.tb || 700, color: c.t, lh: 1.04, align: o.align, gap: 14, shadow: o.shadow });
    if (o.sub !== false) it.push({ text: '{{SUBTITLE}}', size: o.ss || 21, italic: true, color: c.s, align: o.align, gap: 18, lh: 1.3, est: 'A project on saving water for our future' });
    if (o.subj !== false) it.push({ text: o.subjText || 'Subject: {{SUBJECT}}', size: o.sjs || 20, bold: 700, color: c.j || c.k, align: o.align, gap: 0, bg: o.sjbg, font: o.sjfont });
    return K.stack(x, w, top, bot, it, { maxK: 1.15, valign: o.valign });
  }
  // "Submitted by / Submitted to" in two columns
  function byTo(x, y, w, p, o) {
    o = o || {};
    var out = [], g = 30, cw = (w - g) / 2, hc = o.head || p.b, kc = o.kc || '#475569', vc = o.vc || p.ink, x2 = x + cw + g, f = o.size || 16;
    if (o.card) { out.push(R(x - 18, y - 18, cw + 36, 200, o.card, { r: 16, shadow: o.shadow, stroke: o.stroke, sw: o.stroke ? 1.5 : 0 })); out.push(R(x2 - 18, y - 18, cw + 36, 200, o.card, { r: 16, shadow: o.shadow, stroke: o.stroke, sw: o.stroke ? 1.5 : 0 })); }
    out.push(T(x, y, cw, 'SUBMITTED BY', 15, { font: 'Montserrat', bold: 800, color: hc, ls: 200 }), R(x, y + 26, 46, 4, hc));
    out = out.concat(K.rows(x, y + 46, cw, [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Session', '{{SESSION}}']], f, { kw: 0.36, gap: 1.75, kc: kc, vc: vc }));
    out.push(T(x2, y, cw, 'SUBMITTED TO', 15, { font: 'Montserrat', bold: 800, color: hc, ls: 200 }), R(x2, y + 26, 46, 4, hc));
    out.push(T(x2, y + 44, cw, '{{TEACHER}}', 20, { bold: 700, color: vc }));
    out.push(T(x2, y + 76, cw, '{{TEACHER_ROLE}}', 15, { color: kc }));
    out.push(T(x2, y + 106, cw, 'Date: {{DATE}}', 15, { color: kc }));
    out.push(L(x2, y + 162, x2 + cw * 0.8, y + 162, kc, 1), T(x2, y + 166, cw, 'Teacher’s signature', 12, { color: kc }));
    return out;
  }
  // rows in one column (for narrow layouts)
  function byCol(x, y, w, p, o) {
    o = o || {};
    return [T(x, y, w, 'SUBMITTED BY', 15, { font: 'Montserrat', bold: 800, color: o.head || p.b, ls: 200 })].concat(
      K.rows(x, y + 34, w, [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Session', '{{SESSION}}'], ['Submitted to', '{{TEACHER}}'], ['Date', '{{DATE}}']], o.size || 16, { kw: 0.4, gap: 1.7, kc: o.kc || '#475569', vc: o.vc || p.ink }));
  }
  function scale(list, u) {
    // templates are drawn on a 794 × 1123 grid; scale every coordinate to the page
    if (u === 1) return list;
    var keys = ['x', 'y', 'w', 'h', 'rr', 'x1', 'y1', 'x2', 'y2', 'size', 'sw', 'r', 's', 'rx', 'ry'];
    return list.map(function (o) {
      var c = Object.assign({}, o);
      keys.forEach(function (k) { if (typeof c[k] === 'number') c[k] *= u; });
      if (c.pts) c.pts = c.pts.map(function (p) { return [p[0] * u, p[1] * u]; });
      if (c.d) c.d = c.d.replace(/-?\d+(\.\d+)?/g, function (n) { return String(+n * u); });
      if (c.dash) c.dash = c.dash.map(function (n) { return n * u; });
      if (c.shadow) c.shadow = Object.assign({}, c.shadow, { y: (c.shadow.y || 0) * u, b: (c.shadow.b || 0) * u });
      return c;
    });
  }

  // ---------- inner pages (certificate, acknowledgement, index) ----------
  function frameFor(st, W, H, p) {
    if (typeof st === 'function') return st(W, H, p);
    var o = [], box = { x: 90, w: W - 180, top: 90, bot: H - 90 };
    if (st === 'border') { o = K.frame(W, H, 28, p.b, p.d, true); box = { x: 100, w: W - 200, top: 96, bot: H - 100 }; }
    else if (st === 'band') { o = [R(0, 0, W, 112, K.G(0, p.a, p.b)), R(0, 112, W, 6, p.acc), R(0, H - 40, W, 40, p.a)]; box = { x: 80, w: W - 160, top: 140, bot: H - 70, onBand: true }; }
    else if (st === 'side') { o = [R(0, 0, 46, H, K.G(180, p.a, p.b)), R(46, 0, 8, H, p.acc)]; box = { x: 110, w: W - 170, top: 80, bot: H - 80 }; }
    else if (st === 'wave') { o = [K.wave(W, H, 100, 20, K.G(0, p.a, p.b), false), K.wave(W, H, H - 64, 16, K.G(0, p.b, p.a), true)]; box = { x: 80, w: W - 160, top: 150, bot: H - 110 }; }
    else if (st === 'corner') { o = [K.POLY([[0, 0], [230, 0], [0, 230]], p.a), K.POLY([[0, 0], [150, 0], [0, 150]], p.b), K.POLY([[W, H], [W - 230, H], [W, H - 230]], p.a), K.POLY([[W, H], [W - 150, H], [W, H - 150]], p.acc), R(30, 30, W - 60, H - 60, null, { stroke: p.c, sw: 2 })]; box = { x: 100, w: W - 200, top: 120, bot: H - 120 }; }
    else if (st === 'kids') {
      var cols = [p.b, p.acc, p.d, '#22c55e', '#ef4444'], n = 0;
      for (var x = 20; x < W; x += 44) { o.push(C(x, 22, 10, cols[n++ % 5]), C(x, H - 22, 10, cols[n++ % 5])); }
      for (var y = 66; y < H - 40; y += 44) { o.push(C(22, y, 10, cols[n++ % 5]), C(W - 22, y, 10, cols[n++ % 5])); }
      box = { x: 90, w: W - 180, top: 90, bot: H - 90 };
    } else if (st === 'grid') {
      for (var gx = 0; gx <= W; gx += 28) o.push(L(gx, 0, gx, H, p.c, 0.8));
      for (var gy = 0; gy <= H; gy += 28) o.push(L(0, gy, W, gy, p.c, 0.8));
      o.push(R(50, 50, W - 100, H - 100, '#ffffff', { r: 12, stroke: p.b, sw: 2, shadow: SH }));
      box = { x: 100, w: W - 200, top: 100, bot: H - 100 };
    }
    return { o: o, box: box };
  }
  function headSmall(b, p) { // logo + school at the top of an inner page
    return [logo(b.x + b.w / 2 - 40, b.top, 80, { fill: p.soft })].concat(school(b.x, b.w, b.top + 88, b.top + 160, p.a, { size: 24, sub: 14, subCol: p.b }));
  }
  function certPage(st, W, H, p) {
    var f = frameFor(st, W, H, p), b = f.box, o = f.o.concat(headSmall(b, p));
    o = o.concat(K.stack(b.x, b.w, b.top + 176, b.bot - 230, [
      { text: p.hs ? 'Certificate' : 'CERTIFICATE', size: p.hs ? 76 : 54, font: p.hf || 'Cinzel', bold: 700, color: p.a, ls: p.hs ? 0 : 200, gap: 6 },
      { div: p.d, w: 260, gap: 26 },
      { text: CERT, size: 19, lh: 1.8, color: '#1f2937', align: 'justify-left', gap: 0, font: 'Poppins' }
    ], { maxK: 1.1 }));
    var sy = b.bot - 120, cw = b.w / 3;
    o.push(T(b.x, sy - 70, b.w, 'Date: {{DATE}}', 16, { color: '#334155', bold: 600 }));
    ['Teacher’s signature', 'Examiner’s signature', 'Principal’s signature'].forEach(function (t, i) {
      var x = b.x + i * cw; o.push(L(x + 14, sy + 40, x + cw - 14, sy + 40, '#475569', 1.2), T(x, sy + 48, cw, t, 14, { align: 'center', color: '#475569', bold: 600 }));
    });
    return o;
  }
  function ackPage(st, W, H, p) {
    var f = frameFor(st, W, H, p), b = f.box, o = f.o;
    o = o.concat(K.stack(b.x, b.w, b.top + 20, b.bot - 20, [
      { text: p.hs ? 'Acknowledgement' : 'ACKNOWLEDGEMENT', size: p.hs ? 66 : 46, font: p.hf || 'Cinzel', bold: 700, color: p.a, ls: p.hs ? 0 : 120, gap: 6 },
      { div: p.d, w: 260, gap: 34 },
      { text: '{{ACK}}', size: 19, lh: 1.85, color: '#1f2937', align: 'justify-left', gap: 46, est: EST_ACK },
      { text: '{{NAME}}', size: 24, bold: 700, color: p.a, align: 'right', gap: 4, font: 'Playfair Display' },
      { text: 'Class {{CLASS}} – {{SECTION}}  ·  Roll No. {{ROLL}}', size: 16, color: '#475569', align: 'right', gap: 0 }
    ], { maxK: 1.05 }));
    return o;
  }
  function indexPage(st, W, H, p) {
    var f = frameFor(st, W, H, p), b = f.box, o = f.o;
    o.push(T(b.x, b.top + (p.hs ? 0 : 10), b.w, p.hs ? 'Index' : 'INDEX', p.hs ? 70 : 50, { font: p.hf || 'Cinzel', bold: 700, color: p.a, align: 'center', ls: p.hs ? 0 : 300 }));
    o = o.concat(K.divider(b.x + b.w / 2, b.top + 86, 220, p.d));
    var ty = b.top + 120, hh = 50, rp = 50, n = Math.min(14, Math.floor((b.bot - ty - hh - 10) / rp)), c1 = 76, c3 = 92, c4 = 96, x = b.x, w = b.w, tw = w - c1 - c3 - c4;
    o.push(R(x, ty, w, hh, p.a, { r: 6 }));
    [['S. No.', x, c1], ['TOPIC', x + c1, tw], ['PAGE', x + c1 + tw, c3], ['SIGN', x + c1 + tw + c3, c4]].forEach(function (h) { o.push(T(h[1], ty + 14, h[2], h[0], 16, { bold: 700, color: '#fff', align: 'center', ls: 100 })); });
    var y0 = ty + hh;
    for (var i = 0; i < n; i++) { if (i % 2) o.push(R(x, y0 + i * rp, w, rp, p.soft)); o.push(L(x, y0 + (i + 1) * rp, x + w, y0 + (i + 1) * rp, p.c, 1.2)); }
    [x, x + c1, x + c1 + tw, x + c1 + tw + c3, x + w].forEach(function (vx) { o.push(L(vx, ty, vx, y0 + n * rp, p.d, 1.2)); });
    var fs = 17, lh = rp / (fs * 1.13), tt = y0 + (rp - fs * 1.13) / 2 + 2, nums = [];
    for (i = 1; i <= n; i++) nums.push(i + '.');
    o.push(T(x, tt, c1, nums.join('\n'), fs, { align: 'center', lh: lh, color: p.a, bold: 700 }));
    o.push(T(x + c1 + 16, tt, tw - 24, '{{INDEX|lines}}', fs, { lh: lh, color: '#1f2937' }));
    return o;
  }

  // ---------- covers ----------
  var A4 = ['a4p'];
  var D = [
    { id: 'classic', name: 'Classic Border', cat: 'Classic', fr: 'border', pals: ['blue', 'maroon', 'green', 'purple', 'navy'], bg: '#fffdf8', cover: function (W, H, p) {
      var o = K.frame(W, H, 26, p.b, p.d, true);
      o.push(logo(W / 2 - 55, 74, 110, { fill: p.soft, stroke: p.d, sw: 2 }));
      o = o.concat(school(100, W - 200, 194, 290, p.a, { font: 'Cinzel', bold: 700, size: 32, subCol: p.b, italic: true }));
      o = o.concat(K.divider(W / 2, 306, 300, p.d));
      o = o.concat(title(100, W - 200, 330, 640, { k: p.b, t: p.a, s: '#475569', j: p.b }));
      o.push(C(W / 2, 750, 92, p.d), photo(W / 2 - 84, 666, 168, 168, { shape: 'circle', stroke: '#fff', sw: 4 }));
      return o.concat(byTo(110, 880, W - 220, p));
    } },
    { id: 'band', name: 'Bold Band', cat: 'Modern', fr: 'band', pals: ['blue', 'teal', 'rose', 'slate', 'purple'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [R(0, 0, W, 400, K.G(135, p.a, p.b)), C(W - 40, 40, 200, 'rgba(255,255,255,0.08)'), C(W - 160, 360, 90, 'rgba(255,255,255,0.07)'), R(0, 400, W, 10, p.acc)];
      o.push(logo(60, 50, 86));
      o = o.concat(school(164, W - 230, 48, 140, '#fff', { size: 26, align: 'left', subCol: p.c }));
      o = o.concat(title(60, W - 120, 170, 390, { k: p.c, t: '#ffffff', s: p.c, j: '#fff' }, { align: 'left', font: 'Montserrat', tb: 800, ts: 60, subj: false }));
      o.push(R(W - 290, 448, 230, 280, '#fff', { r: 18, shadow: SH }), photo(W - 280, 458, 210, 260, { r: 12, sw: 0 }));
      o = o.concat(K.stack(60, W - 400, 450, 730, [
        { text: 'SUBJECT', size: 16, bold: 700, ls: 300, color: '#64748b', align: 'left', gap: 4 },
        { text: '{{SUBJECT}}', size: 40, bold: 800, color: p.a, align: 'left', gap: 18, font: 'Montserrat' },
        { text: 'SESSION', size: 16, bold: 700, ls: 300, color: '#64748b', align: 'left', gap: 4 },
        { text: '{{SESSION}}', size: 30, bold: 800, color: p.b, align: 'left', gap: 0 }
      ], { maxK: 1, valign: 'top' }));
      o = o.concat(byTo(80, 800, W - 160, p, { card: p.soft }));
      o.push(R(0, H - 60, W, 60, p.a), T(0, H - 42, W, '{{SCHOOL}}  ·  {{SESSION}}', 17, { align: 'center', color: '#fff', bold: 600 }));
      return o;
    } },
    { id: 'side', name: 'Side Panel', cat: 'Modern', fr: 'side', pals: ['teal', 'blue', 'orange', 'purple', 'green'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [R(0, 0, 250, H, K.G(180, p.a, p.b)), R(250, 0, 10, H, p.acc), C(250, 220, 120, 'rgba(255,255,255,0.06)')];
      o.push(T(70, H - 70, H - 140, 'PROJECT FILE', 128, { font: 'Bebas Neue', color: '#ffffff', op: 0.95, ls: 200, angle: -90, align: 'center' }));
      o.push(logo(300, 60, 90, { fill: p.soft }));
      o = o.concat(school(406, W - 446, 52, 160, p.a, { size: 24, align: 'left', subCol: '#64748b' }));
      o.push(L(300, 180, W - 50, 180, p.c, 2));
      o = o.concat(title(300, W - 350, 210, 600, { k: p.b, t: p.a, s: '#475569', j: '#fff' }, { align: 'left', font: 'Montserrat', tb: 800, ts: 58, sjbg: p.b, subjText: '  {{SUBJECT}}  ' }));
      o.push(R(318, 648, 210, 250, p.c, { r: 16 }), photo(300, 630, 210, 250, { r: 16, stroke: p.b, sw: 2 }));
      return o.concat(byCol(300, 920, W - 350, p, { size: 15 }));
    } },
    { id: 'wave', name: 'Wave Flow', cat: 'Modern', fr: 'wave', pals: ['navy', 'teal', 'purple', 'rose', 'green'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [K.wave(W, H, 300, 30, K.G(160, p.a, p.b), false), C(80, 60, 140, 'rgba(255,255,255,0.07)'), C(W - 70, 230, 90, 'rgba(255,255,255,0.08)')];
      o.push(logo(W / 2 - 50, 38, 100));
      o = o.concat(school(80, W - 160, 148, 250, '#ffffff', { size: 30, subCol: p.c }));
      o = o.concat(title(90, W - 180, 330, 610, { k: p.b, t: p.a, s: '#475569', j: p.b }));
      o.push(C(W / 2, 728, 100, null, { stroke: p.b, sw: 3, dash: [10, 8] }), photo(W / 2 - 88, 640, 176, 176, { shape: 'circle', stroke: p.d, sw: 5 }));
      o = o.concat(byTo(100, 864, W - 200, p));
      o.push(K.wave(W, H, H - 50, 14, K.G(0, p.b, p.a), true));
      return o;
    } },
    { id: 'geo', name: 'Geometric', cat: 'Creative', fr: 'corner', pals: ['purple', 'blue', 'teal', 'rose', 'orange'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [K.POLY([[0, 0], [W * 0.62, 0], [0, H * 0.34]], p.a), K.POLY([[0, 0], [W * 0.38, 0], [0, H * 0.5]], p.b, { op: 0.85 }), K.POLY([[0, 0], [W * 0.18, 0], [0, H * 0.2]], p.acc),
        K.POLY([[W, H], [W * 0.6, H], [W, H * 0.78]], p.a), K.POLY([[W, H], [W * 0.82, H], [W, H * 0.66]], p.acc, { op: 0.9 })];
      o.push(logo(W - 160, 50, 100, { fill: p.soft }));
      o = o.concat(school(W * 0.42, W * 0.58 - 60, 160, 270, p.a, { size: 26, align: 'right', subCol: '#64748b' }));
      o = o.concat(title(110, W - 220, 310, 560, { k: p.b, t: p.a, s: '#475569', j: p.b }));
      o.push(K.POLY([[W / 2, 572], [W / 2 + 100, 672], [W / 2, 772], [W / 2 - 100, 672]], p.c), photo(W / 2 - 74, 598, 148, 148, { shape: 'circle', stroke: p.b, sw: 4 }));
      return o.concat(byTo(100, 800, W - 220, p));
    } },
    { id: 'circles', name: 'Bubbles', cat: 'Creative', fr: 'corner', pals: ['rose', 'teal', 'orange', 'blue', 'purple'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [C(W, 0, 300, p.b, { op: 0.95 }), C(W - 70, 170, 150, p.acc, { op: 0.75 }), C(W - 250, 40, 70, p.d, { op: 0.6 }), C(0, H, 200, p.a), C(150, H - 20, 90, p.d, { op: 0.7 }), C(60, H - 230, 30, p.acc, { op: 0.8 })];
      o.push(logo(70, 70, 90, { fill: p.soft }));
      o = o.concat(school(70, W - 400, 172, 270, p.a, { size: 26, align: 'left', subCol: '#64748b' }));
      o = o.concat(title(70, W - 140, 320, 580, { k: p.b, t: p.a, s: '#475569', j: p.b }, { align: 'left', ts: 66 }));
      o.push(R(W - 300, 586, 220, 260, p.c, { r: 110 }), photo(W - 290, 596, 200, 240, { r: 100, sw: 0 }));
      return o.concat(byCol(70, 610, W - 420, p, { size: 16 }));
    } },
    { id: 'kids', name: 'Crayon Kids', cat: 'Kids', fr: 'kids', pals: ['blue', 'rose', 'green', 'orange', 'purple'], bg: '#fffbea', cover: function (W, H, p) {
      var o = [R(0, 0, W, 280, K.G(180, '#bfe3ff', '#fffbea'))];
      o = o.concat(cloud(90, 90, 1.1, '#ffffff'), cloud(560, 60, 0.9, '#ffffff'));
      o.push(K.burst(W - 90, 90, 56, 40, 14, '#fbbf24'), C(W - 90, 90, 36, '#fde047'));
      o.push(logo(W / 2 - 50, 50, 100, { stroke: p.b, sw: 4 }));
      o = o.concat(school(90, W - 180, 160, 250, p.a, { size: 28, subCol: p.b, font: 'Righteous', bold: 400 }));
      o = o.concat(title(80, W - 160, 280, 560, { k: p.b, t: p.b, s: '#475569', j: p.a }, { kicker: 'MY PROJECT ON', font: 'Righteous', tb: 400, ts: 64, shadow: { x: 3, y: 3, b: 0, c: 'rgba(0,0,0,0.12)' } }));
      o.push(C(W / 2, 690, 112, p.acc), C(W / 2, 690, 112, null, { stroke: p.b, sw: 4, dash: [14, 10] }), photo(W / 2 - 98, 592, 196, 196, { shape: 'circle', stroke: '#fff', sw: 6 }));
      o = o.concat(byTo(100, 860, W - 200, p, { card: '#ffffff', stroke: p.d }));
      ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'].forEach(function (c, i) { o.push(R(60 + i * 115, H - 78, 100, 26, c, { r: 13 }), K.POLY([[160 + i * 115, H - 72], [178 + i * 115, H - 65], [160 + i * 115, H - 58]], c)); });
      return o;
    } },
    { id: 'notebook', name: 'Notebook Doodle', cat: 'Kids', fr: 'kids', pals: ['blue', 'green', 'rose', 'purple', 'orange'], bg: '#fffef6', cover: function (W, H, p) {
      var o = [];
      for (var y = 150; y < H; y += 34) o.push(L(0, y, W, y, '#cfe0f4', 1.2));
      o.push(L(110, 0, 110, H, '#fca5a5', 2));
      for (y = 60; y < H; y += 70) o.push(C(46, y, 13, '#e5e7eb', { stroke: '#cbd5e1', sw: 2 }));
      o.push(logo(150, 40, 86, { stroke: p.b, sw: 3 }));
      o = o.concat(school(250, W - 290, 36, 130, p.a, { size: 26, align: 'left', subCol: p.b }));
      o.push(R(170, 200, W - 260, 330, p.c, { angle: -2, shadow: SH }), R(W / 2 - 40, 186, 140, 36, 'rgba(255,255,255,0.6)', { angle: -6 }));
      o = o.concat(title(200, W - 330, 230, 500, { k: p.b, t: p.a, s: '#334155', j: p.b }, { kicker: 'PROJECT ON', font: 'Caveat', ts: 76 }));
      o.push(R(W - 330, 570, 230, 280, '#fff', { angle: 4, shadow: SH }), photo(W - 300, 586, 196, 214, { angle: 4, sw: 0 }));
      o.push(T(W - 316, 808, 200, '{{NAME}}', 26, { font: 'Caveat', bold: 700, color: '#334155', align: 'center', angle: 4 }));
      return o.concat(byCol(150, 610, W - 520, p, { size: 15 }));
    } },
    { id: 'science', name: 'Science Lab', cat: 'Science & Subjects', fr: 'band', pals: ['teal', 'blue', 'purple', 'green', 'navy'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [R(0, 0, W, H, K.G(180, p.soft, '#ffffff'))];
      [[80, 120], [131, 150], [80, 180], [182, 120], [131, 90], [W - 120, H - 160], [W - 69, H - 130], [W - 171, H - 130], [W - 120, H - 100]].forEach(function (h) { o.push(hexO(h[0], h[1], 30, p.d, 2.5, 0.8)); });
      var ax = W - 170, ay = 190;
      [0, 60, 120].forEach(function (a) { o.push(ellipse(ax, ay, 120, 40, a, { stroke: p.b, sw: 3 })); });
      o.push(C(ax, ay, 18, p.acc), C(ax + 112, ay - 20, 9, p.b), C(ax - 70, ay - 90, 9, p.b), C(ax - 40, ay + 110, 9, p.b));
      o.push(logo(60, 260, 90, { stroke: p.d, sw: 2 }));
      o = o.concat(school(166, W - 420, 256, 360, p.a, { size: 26, align: 'left', subCol: p.b }));
      o = o.concat(title(60, W - 120, 400, 660, { k: p.b, t: p.a, s: '#475569', j: '#fff' }, { align: 'left', font: 'Montserrat', tb: 800, sjbg: p.b, subjText: '  {{SUBJECT}}  ' }));
      o.push(R(W - 280, 690, 210, 250, '#fff', { r: 14, shadow: SH }), photo(W - 270, 700, 190, 230, { r: 10, sw: 0 }));
      return o.concat(byCol(60, 700, W - 400, p, { size: 16 }));
    } },
    { id: 'nature', name: 'Green Leaf', cat: 'Science & Subjects', fr: 'wave', pals: ['green', 'emerald', 'teal', 'orange', 'blue'], bg: '#fbfff8', cover: function (W, H, p) {
      var o = [C(W - 120, 120, 70, p.acc, { op: 0.9 }), K.burst(W - 120, 120, 100, 78, 18, p.acc, { op: 0.35 })];
      [[0, 0, 160, 40], [20, 40, 120, 70], [60, -10, 140, 10], [W, H, 170, 220], [W - 10, H - 50, 130, 190], [W - 60, H, 150, 250], [0, H, 150, -40], [10, H - 70, 110, -10]].forEach(function (l, i) { o = o.concat(leaf(l[0], l[1], l[2], l[3], i % 2 ? p.b : p.a, 0.92)); });
      o.push(logo(W / 2 - 50, 50, 100, { stroke: p.b, sw: 3 }));
      o = o.concat(school(120, W - 240, 160, 250, p.a, { size: 28, subCol: p.b }));
      o = o.concat(title(110, W - 220, 280, 560, { k: p.b, t: p.a, s: '#475569', j: p.b }, { font: 'Playfair Display' }));
      o.push(C(W / 2, 680, 100, p.c), photo(W / 2 - 90, 590, 180, 180, { shape: 'circle', stroke: p.b, sw: 5 }));
      return o.concat(byTo(110, 830, W - 220, p, { card: 'rgba(255,255,255,0.9)', stroke: p.d }));
    } },
    { id: 'math', name: 'Maths Grid', cat: 'Science & Subjects', fr: 'grid', pals: ['blue', 'purple', 'slate', 'teal', 'orange'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [];
      for (var x = 0; x <= W; x += 28) o.push(L(x, 0, x, H, p.c, x % 140 ? 0.7 : 1.4));
      for (var y = 0; y <= H; y += 28) o.push(L(0, y, W, y, p.c, y % 140 ? 0.7 : 1.4));
      [['π', 70, 80], ['√x', 640, 70], ['Σ', 60, 560], ['∞', 670, 520], ['÷', 120, 990], ['θ', 680, 980], ['x²', 360, 40], ['%', 380, 1040]].forEach(function (s) { o.push(T(s[1], s[2], 120, s[0], 64, { font: 'Playfair Display', bold: 700, color: p.b, op: 0.22 })); });
      o.push(R(80, 150, W - 160, H - 270, '#ffffff', { r: 18, stroke: p.b, sw: 3, shadow: SH }));
      o.push(logo(W / 2 - 46, 180, 92, { fill: p.soft }));
      o = o.concat(school(120, W - 240, 282, 370, p.a, { size: 26, subCol: p.b }));
      o = o.concat(title(120, W - 240, 390, 640, { k: p.b, t: p.a, s: '#475569', j: p.b }, { font: 'Montserrat', tb: 800 }));
      o.push(R(W / 2 - 80, 660, 160, 180, p.c, { r: 12 }), photo(W / 2 - 70, 670, 140, 160, { r: 8, sw: 0 }));
      return o.concat(byTo(120, 870, W - 240, p, { size: 15 }));
    } },
    { id: 'heritage', name: 'Heritage Scroll', cat: 'Classic', fr: 'border', pals: ['maroon', 'gold', 'orange', 'emerald', 'navy'], bg: '#f7efd9', cover: function (W, H, p) {
      var o = [R(0, 0, W, H, K.G(90, '#f9f1dc', '#efe0b8'))].concat(K.frame(W, H, 22, p.a, p.d, true));
      o = o.concat(K.mandala(W / 2, 120, 64, p.d, p.b, 0.85));
      o = o.concat(school(90, W - 180, 200, 300, p.a, { font: 'Cinzel', bold: 700, size: 30, subCol: p.b, italic: true }));
      o.push(R(70, 340, W - 140, 250, '#fffaf0', { r: 24, stroke: p.d, sw: 3, shadow: SH }), C(70, 465, 30, p.d), C(W - 70, 465, 30, p.d), C(70, 465, 16, p.a), C(W - 70, 465, 16, p.a));
      o = o.concat(title(120, W - 240, 356, 576, { k: p.b, t: p.a, s: '#57534e', j: p.b }, { font: 'Cinzel', ts: 54 }));
      o.push(R(W / 2 - 90, 620, 180, 210, null, { stroke: p.d, sw: 2 }), photo(W / 2 - 80, 630, 160, 190, { stroke: p.a, sw: 2 }));
      return o.concat(byTo(110, 870, W - 220, p, { head: p.a }));
    } },
    { id: 'minimal', name: 'Minimal Line', cat: 'Modern', fr: 'side', pals: ['slate', 'blue', 'rose', 'green', 'black'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [L(60, 60, 60, H - 60, p.ink, 2), R(60, 60, 60, 60, p.b)];
      o.push(logo(W - 150, 60, 86, { fill: p.soft }));
      o = o.concat(school(150, W - 330, 60, 150, p.ink, { size: 22, align: 'left', subCol: '#64748b', ls: 120 }));
      o.push(T(150, 220, 300, '01', 150, { font: 'Montserrat', bold: 800, color: p.c }));
      o = o.concat(title(150, W - 220, 360, 720, { k: '#64748b', t: p.ink, s: '#475569', j: p.b }, { align: 'left', font: 'Montserrat', tb: 800, ts: 76, kicker: 'PROJECT' }));
      o.push(R(150, 740, 90, 6, p.b));
      o.push(photo(W - 290, 800, 210, 250, { sw: 0, fill: '#f1f5f9' }));
      return o.concat(byCol(150, 800, W - 480, p, { size: 15, head: p.b }));
    } },
    { id: 'diag', name: 'Diagonal Split', cat: 'Creative', fr: 'corner', pals: ['blue', 'purple', 'teal', 'maroon', 'orange'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [K.POLY([[0, 0], [W, 0], [W, 520], [0, 640]], K.G(135, p.a, p.b)), K.POLY([[0, 640], [W, 520], [W, 536], [0, 656]], p.acc), C(W - 80, 80, 150, 'rgba(255,255,255,0.07)')];
      o.push(logo(60, 50, 84));
      o = o.concat(school(160, W - 220, 48, 140, '#fff', { size: 24, align: 'left', subCol: p.c }));
      o = o.concat(title(60, W - 120, 180, 490, { k: p.c, t: '#ffffff', s: p.c, j: '#fff' }, { align: 'left', font: 'Montserrat', tb: 800, ts: 64 }));
      o.push(C(W - 190, 600, 118, '#fff', { shadow: SH }), photo(W - 298, 492, 216, 216, { shape: 'circle', fill: p.c, sw: 0 }));
      return o.concat(byTo(90, 800, W - 180, p, { card: p.soft }));
    } },
    { id: 'ribbon', name: 'Ribbon Title', cat: 'Classic', fr: 'border', pals: ['maroon', 'navy', 'purple', 'green', 'blue'], bg: null, cover: function (W, H, p) {
      var o = [R(30, 30, W - 60, H - 60, '#ffffff', { stroke: p.d, sw: 2 }), R(44, 44, W - 88, H - 88, null, { stroke: p.c, sw: 1 })];
      o.push(logo(W / 2 - 56, 80, 112, { fill: p.soft, stroke: p.d, sw: 3 }));
      o = o.concat(school(90, W - 180, 204, 300, p.a, { size: 30, subCol: p.b }));
      o.push(K.POLY([[20, 380], [110, 380], [110, 520], [20, 520], [64, 450]], p.a), K.POLY([[W - 20, 380], [W - 110, 380], [W - 110, 520], [W - 20, 520], [W - 64, 450]], p.a));
      o.push(R(70, 350, W - 140, 150, K.G(90, p.b, p.a), { shadow: SH }));
      o = o.concat(title(100, W - 200, 360, 490, { k: p.c, t: '#ffffff', s: p.c }, { font: 'Playfair Display', ts: 48, sub: false, subj: false, kicker: 'PROJECT REPORT ON' }));
      o = o.concat(K.stack(100, W - 200, 520, 600, [{ text: '{{SUBTITLE}}', size: 20, italic: true, color: '#475569', gap: 8 }, { text: 'Subject: {{SUBJECT}}', size: 20, bold: 700, color: p.b, gap: 0 }], { maxK: 1 }));
      o.push(R(W / 2 - 96, 626, 192, 222, p.c, { r: 10 }), photo(W / 2 - 86, 636, 172, 202, { r: 6, sw: 0 }));
      return o.concat(byTo(110, 880, W - 220, p));
    } },
    { id: 'tech', name: 'Tech Circuit', cat: 'Science & Subjects', fr: 'band', pals: ['blue', 'teal', 'purple', 'green', 'orange'], bg: '#0b1220', cover: function (W, H, p) {
      var o = [R(0, 0, W, H, K.G(160, '#0b1220', p.a))];
      [[40, 200, 200, 200, 200, 120], [W - 40, 300, W - 180, 300, W - 180, 200], [300, 40, 300, 110, 420, 110], [40, 700, 120, 700, 120, 820], [W - 40, 640, W - 140, 640, W - 140, 760], [W / 2 - 200, H - 8, W / 2 - 200, H - 26, W / 2 + 200, H - 26]].forEach(function (c) {
        o.push(L(c[0], c[1], c[2], c[3], p.d, 2, { op: 0.6 }), L(c[2], c[3], c[4], c[5], p.d, 2, { op: 0.6 }), C(c[0], c[1], 6, p.d, { op: 0.8 }), C(c[4], c[5], 8, null, { stroke: p.d, sw: 2.5 }));
      });
      o.push(logo(W / 2 - 48, 150, 96));
      o = o.concat(school(90, W - 180, 260, 350, '#ffffff', { size: 28, subCol: p.d }));
      o = o.concat(title(90, W - 180, 380, 640, { k: p.d, t: '#ffffff', s: '#cbd5e1', j: p.d }, { font: 'Montserrat', tb: 800, ts: 62 }));
      o.push(R(W / 2 - 92, 660, 184, 204, null, { r: 16, stroke: p.d, sw: 3 }), photo(W / 2 - 80, 672, 160, 180, { r: 10, sw: 0, fill: '#1e293b' }));
      return o.concat(byTo(110, 900, W - 220, p, { head: p.d, kc: '#94a3b8', vc: '#f8fafc', card: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.12)' }));
    } },
    { id: 'arts', name: 'Watercolour', cat: 'Creative', fr: 'wave', pals: ['rose', 'purple', 'teal', 'orange', 'blue'], bg: '#fffdfb', cover: function (W, H, p) {
      var o = [];
      [[0, 0, 220, p.b], [140, -40, 160, p.acc], [W, 140, 200, p.d], [W - 60, -30, 140, p.b], [0, H - 120, 200, p.d], [120, H, 180, p.acc], [W, H, 240, p.b], [W - 220, H + 40, 140, p.d]].forEach(function (c) { o.push(C(c[0], c[1], c[2], c[3], { op: 0.22 }), C(c[0] + 30, c[1] + 20, c[2] * 0.6, c[3], { op: 0.2 })); });
      o.push(logo(W / 2 - 48, 70, 96, { fill: p.soft }));
      o = o.concat(school(110, W - 220, 178, 270, p.a, { size: 26, subCol: p.b, upper: false, font: 'Playfair Display', bold: 700, ls: 0 }));
      o = o.concat(title(100, W - 200, 290, 580, { k: p.b, t: p.a, s: '#57534e', j: p.b }, { kicker: 'A Project on', kfont: 'Dancing Script', ks: 34, font: 'Playfair Display', ts: 64 }));
      o.push(C(W / 2, 700, 106, '#ffffff', { shadow: SH }), photo(W / 2 - 96, 604, 192, 192, { shape: 'circle', sw: 0 }));
      return o.concat(byTo(110, 860, W - 220, p, { card: 'rgba(255,255,255,0.85)' }));
    } },
    { id: 'globe', name: 'Globe Social', cat: 'Science & Subjects', fr: 'band', pals: ['blue', 'teal', 'green', 'orange', 'navy'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [R(0, 0, W, 140, K.G(0, p.a, p.b))], gx = W / 2, gy = 340, gr = 150;
      o.push(logo(50, 26, 88));
      o = o.concat(school(156, W - 210, 22, 120, '#fff', { size: 26, align: 'left', subCol: p.c }));
      o.push(C(gx, gy, gr + 14, p.c), C(gx, gy, gr, K.G(135, p.d, p.b)));
      [0.35, 0.7, 1].forEach(function (k) { o.push(ellipse(gx, gy, gr * k, gr, 0, { stroke: 'rgba(255,255,255,0.7)', sw: 2 })); });
      [-0.6, -0.3, 0, 0.3, 0.6].forEach(function (k) { var yy = gy + gr * k, hw = Math.sqrt(1 - k * k) * gr; o.push(L(gx - hw, yy, gx + hw, yy, 'rgba(255,255,255,0.7)', 2)); });
      o.push(ellipse(gx, gy, gr + 46, 34, -18, { stroke: p.acc, sw: 4 }), C(gx + gr + 30, gy - 70, 10, p.acc));
      o = o.concat(title(90, W - 180, 520, 760, { k: p.b, t: p.a, s: '#475569', j: p.b }, { font: 'Montserrat', tb: 800, ts: 58 }));
      o.push(R(W - 240, 800, 170, 200, p.c, { r: 12 }), photo(W - 232, 808, 154, 184, { r: 8, sw: 0 }));
      return o.concat(byCol(90, 800, W - 380, p, { size: 15 }));
    } },
    { id: 'polaroid', name: 'Photo Frame', cat: 'Kids', fr: 'kids', pals: ['purple', 'rose', 'blue', 'green', 'orange'], bg: '#ffffff', cover: function (W, H, p) {
      var o = [R(0, 0, W, H, K.G(170, p.soft, '#ffffff'))];
      for (var i = 0; i < 26; i++) { var x = (i * 137) % W, y = (i * 263) % H; o.push(i % 3 ? C(x, y, 5 + (i % 4), [p.b, p.acc, p.d][i % 3], { op: 0.55 }) : R(x, y, 14, 6, [p.b, p.acc, p.d][i % 3], { angle: i * 25, op: 0.55 })); }
      o.push(logo(60, 50, 86, { stroke: p.b, sw: 3 }));
      o = o.concat(school(160, W - 220, 46, 140, p.a, { size: 26, align: 'left', subCol: p.b }));
      o = o.concat(title(80, W - 160, 170, 420, { k: p.b, t: p.a, s: '#475569', j: p.b }, { font: 'Righteous', tb: 400, ts: 60 }));
      o.push(R(W / 2 - 150, 440, 300, 360, '#ffffff', { angle: -3, shadow: SH }), photo(W / 2 - 132, 462, 264, 270, { angle: -3, sw: 0 }));
      o.push(R(W / 2 - 60, 424, 120, 34, p.d, { angle: -6, op: 0.75 }));
      o.push(T(W / 2 - 150, 744, 290, '{{NAME}}', 30, { font: 'Caveat', bold: 700, color: '#334155', align: 'center', angle: -3 }));
      return o.concat(byTo(110, 870, W - 220, p, { card: '#ffffff', stroke: p.c }));
    } },
    { id: 'elegant', name: 'Elegant Mandala', cat: 'Classic', fr: 'border', pals: ['gold', 'maroon', 'navy', 'emerald', 'purple'], bg: '#fffdf7', cover: function (W, H, p) {
      var o = [];
      [[0, 0], [W, 0], [0, H], [W, H]].forEach(function (c) { o = o.concat(K.mandala(c[0], c[1], 150, p.d, p.c, 0.5)); });
      o = o.concat([R(40, 40, W - 80, H - 80, null, { stroke: p.b, sw: 2 }), R(52, 52, W - 104, H - 104, null, { stroke: p.d, sw: 1 })]);
      o.push(logo(W / 2 - 54, 90, 108, { fill: p.soft, stroke: p.d, sw: 3 }));
      o = o.concat(school(110, W - 220, 212, 310, p.a, { font: 'Cinzel', bold: 700, size: 30, subCol: p.b, italic: true }));
      o = o.concat(K.divider(W / 2, 326, 280, p.d));
      o = o.concat(title(110, W - 220, 350, 620, { k: p.b, t: p.a, s: '#57534e', j: p.b }, { font: 'Cormorant Garamond', ts: 68 }));
      o.push(C(W / 2, 730, 92, null, { stroke: p.d, sw: 2 }), photo(W / 2 - 82, 648, 164, 164, { shape: 'circle', stroke: p.b, sw: 3 }));
      return o.concat(byTo(120, 870, W - 240, p, { head: p.a }));
    } }
  ];

  var out = [];
  D.forEach(function (d) {
    d.pals.forEach(function (pk, pi) {
      var pal = K.PAL[pk];
      out.push({ id: 'pp-' + d.id + '-' + pk, name: d.name + (pi ? ' · ' + pk[0].toUpperCase() + pk.slice(1) : ''), cat: d.cat, sizes: A4, pal: pal, build: function (W, H, p) {
        var u = W / 794, H0 = H / u;   // design grid is 794 wide; height follows the page
        var bg = d.bg || p.soft, inBg = '#ffffff';
        return { pageNames: PN, pages: [
          { bg: bg, objects: scale(d.cover(794, H0, p), u) },
          { bg: inBg, objects: scale(certPage(d.fr, 794, H0, p), u) },
          { bg: inBg, objects: scale(ackPage(d.fr, 794, H0, p), u) },
          { bg: inBg, objects: scale(indexPage(d.fr, 794, H0, p), u) }
        ] };
      } });
    });
  });
  ST.register(out);
  K.pp = { certPage: certPage, ackPage: ackPage, indexPage: indexPage, scale: scale, school: school, title: title, byTo: byTo, byCol: byCol, photo: photo, logo: logo, PN: PN };
})();
