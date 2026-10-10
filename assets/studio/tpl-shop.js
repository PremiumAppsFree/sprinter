/* S Printer — Shop promotion templates: cyber café services, offers, festival greetings,
 * rate lists, letter pads and election banners (original designs, any size) */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P;
  function sc(W, H) { return Math.min(W / 794, H / 1123) * (W > H ? 1.18 : 1); }
  var WIDE = function (W, H) { return W > H * 1.2; };
  function contactBar(W, H, p, s, y, dark) {
    var h = H - y, o = [R(0, y, W, h, dark || p.a), R(0, y, W, 5 * s, p.acc)], qs = Math.min(h - 24 * s, 130 * s);
    o.push(R(W - qs - 30 * s, y + (h - qs) / 2 - 5 * s, qs + 10 * s, qs + 10 * s, '#fff', { r: 8 * s }));
    o.push(K.Q(W - qs - 25 * s, y + (h - qs) / 2, qs, 'upi://pay?pa={{UPI}}&pn={{SHOP_NAME}}'));
    o = o.concat(K.stack(34 * s, W - qs - 90 * s, y + 8 * s, H - 8 * s, [
      { text: '☎ {{SHOP_PHONE}}', size: 30 * s, bold: 800, color: '#fff', align: 'left', gap: 4, font: 'Poppins' },
      { text: '{{SHOP_ADDRESS}}', size: 16 * s, color: '#e2e8f0', align: 'left', gap: 4 },
      { text: '{{TIMING}}  ·  Scan to pay (UPI)', size: 14 * s, color: p.acc, align: 'left', gap: 0 }
    ], { maxK: 1.15 }));
    return o;
  }
  var A = ['a4p', 'sq', 'a4l', 'hd'];
  function count(k) { var v = (ST.curVals || {})[k] || ''; return String(v).split(/\n/).filter(function (x) { return x.trim(); }).length || 6; }
  function fit(h, n, max, lh) { return Math.max(10, Math.min(max, h / (n * (lh || 1.75) + 0.6))); }
  var layouts = [
    { id: 'cyber1', name: 'Cyber café — All services', cat: 'Cyber Cafe Shop', sizes: A, pals: ['blue', 'teal', 'purple'], build: function (W, H, p) {
      var s = sc(W, H), top = H * 0.25, foot = H - Math.max(130 * s, H * 0.15), o = [R(0, 0, W, top, K.G(25, p.a, p.b))];
      o.push(C(W * 0.92, top * 0.15, top * 0.8, 'rgba(255,255,255,0.07)'));
      o.push(P(30 * s, (top - 110 * s) / 2, 110 * s, 110 * s, 'LOGO', { shape: 'circle', fill: '#fff', sw: 0 }));
      o = o.concat(K.stack(160 * s, W - 190 * s, 16 * s, top - 10 * s, [
        { text: '{{SHOP_NAME}}', size: 50 * s, font: 'Anton', color: '#fff', align: 'left', gap: 6, lh: 1.05 },
        { text: '{{TAGLINE}}', size: 19 * s, color: p.c, align: 'left', gap: 0 }
      ]));
      o.push(T(30 * s, top + 26 * s, W - 60 * s, 'ALL ONLINE SERVICES AVAILABLE HERE', 26 * s, { font: 'Montserrat', bold: 800, align: 'center', color: p.a, ls: 60 }));
      var gy = top + 80 * s, gh = foot - gy - 20 * s, cols = WIDE(W, H) ? 2 : 2, cw = (W - 80 * s - 30 * s) / cols;
      o.push(R(30 * s, gy - 10 * s, W - 60 * s, gh, p.soft, { r: 18 * s }));
      var fs = fit(gh - 30 * s, Math.ceil(count('SERVICES') / 2), 34 * s, 1.8);
      o.push(T(50 * s, gy + 14 * s, cw - 20 * s, '{{SERVICES|h1}}', fs, { color: p.ink, lh: 1.8, bold: 600 }));
      o.push(T(50 * s + cw + 30 * s, gy + 14 * s, cw - 20 * s, '{{SERVICES|h2}}', fs, { color: p.ink, lh: 1.8, bold: 600 }));
      o = o.concat(contactBar(W, H, p, s, foot));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'cyber2', name: 'Cyber café — Bold call', cat: 'Cyber Cafe Shop', sizes: A, pals: ['black', 'navy'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, K.G(150, p.a, p.b))], foot = H - Math.max(130 * s, H * 0.15);
      o.push(K.burst(W - 130 * s, 130 * s, 110 * s, 90 * s, 20, p.acc));
      o.push(T(W - 220 * s, 92 * s, 180 * s, 'FAST\n& SAFE', 28 * s, { font: 'Anton', align: 'center', color: p.a, lh: 1 }));
      o = o.concat(K.stack(40 * s, W - 300 * s, 40 * s, H * 0.33, [
        { text: '{{SHOP_NAME}}', size: 58 * s, font: 'Bebas Neue', color: '#fff', align: 'left', gap: 6, lh: 1, cw: 0.45 },
        { text: '{{TAGLINE}}', size: 20 * s, color: p.acc, align: 'left', gap: 0 }
      ]));
      var list = WIDE(W, H) ? [['{{SERVICES|h1}}', 40 * s], ['{{SERVICES|h2}}', W / 2 + 10 * s]] : [['{{SERVICES|h1}}', 40 * s], ['{{SERVICES|h2}}', W / 2 + 10 * s]];
      var fs2 = fit(foot - H * 0.36 - 30 * s, Math.ceil(count('SERVICES') / 2), 34 * s, 1.8);
      list.forEach(function (l) { o.push(T(l[1], H * 0.36, W / 2 - 50 * s, l[0], fs2, { color: '#f8fafc', lh: 1.8, bold: 600 })); });
      o = o.concat(contactBar(W, H, p, s, foot, '#000000'));
      return { pages: [{ bg: p.a, objects: o }] };
    } },
    { id: 'offer', name: 'Offer banner', cat: 'Shop Promo', sizes: A, pals: ['rose', 'orange', 'green'], build: function (W, H, p) {
      var s = sc(W, H), foot = H - Math.max(130 * s, H * 0.15), o = [R(0, 0, W, H, K.G(120, p.b, p.a))];
      for (var i = 0; i < 6; i++) o.push(C(W * (i % 3) / 2.2 + 60 * s, H * (Math.floor(i / 3) * 0.5 + 0.1), 90 * s + i * 14 * s, 'rgba(255,255,255,0.06)'));
      var R0 = Math.min(W, foot) * 0.3, cx = W / 2, cy = foot * 0.5;
      o.push(K.burst(cx, cy, R0, R0 * 0.86, 28, p.acc));
      o.push(C(cx, cy, R0 * 0.78, '#ffffff'));
      o = o.concat(K.stack(cx - R0 * 0.7, R0 * 1.4, cy - R0 * 0.6, cy + R0 * 0.6, [
        { text: '{{OFFER}}', size: 70 * s, font: 'Anton', color: p.a, lh: 1, gap: 6, cw: 0.5 },
        { text: '{{OFFER_NOTE}}', size: 20 * s, color: '#334155', bold: 600, gap: 0 }
      ]));
      o = o.concat(K.stack(30 * s, W - 60 * s, 20 * s, cy - R0 - 10 * s, [
        { text: '{{SHOP_NAME}}', size: 46 * s, font: 'Montserrat', bold: 800, color: '#fff', gap: 4 },
        { text: '{{TAGLINE}}', size: 19 * s, color: '#fff', gap: 0 }
      ]));
      o = o.concat(K.stack(30 * s, W - 60 * s, cy + R0 + 10 * s, foot - 10 * s, [{ text: 'Offer valid till {{VALID_TILL}}', size: 22 * s, bold: 700, color: '#fff', gap: 0 }]));
      o = o.concat(contactBar(W, H, p, s, foot, '#111827'));
      return { pages: [{ bg: p.a, objects: o }] };
    } },
    { id: 'festival', name: 'Festival greeting', cat: 'Shop Promo', sizes: A, pals: ['maroon', 'purple', 'gold'], build: function (W, H, p) {
      var s = sc(W, H), foot = H - Math.max(130 * s, H * 0.15), o = [R(0, 0, W, H, K.G(90, p.a, '#1c0a0a'))];
      o = o.concat(K.mandala(W / 2, foot * 0.36, Math.min(W, foot) * 0.24, p.d, p.c, 0.16));
      for (var i = 0; i < 18; i++) o.push(C(((i * 137) % 100) / 100 * W, ((i * 61) % 100) / 100 * foot * 0.9, (2 + i % 3) * s, p.d, { op: 0.8 }));
      o = o.concat(K.stack(40 * s, W - 80 * s, foot * 0.12, foot - 20 * s, [
        { text: '{{GREETING}}', size: 70 * s, font: 'Great Vibes', color: '#fde68a', gap: 10, lh: 1.15, shadow: { x: 0, y: 3, b: 10, c: 'rgba(0,0,0,.5)' } },
        { text: '{{OFFER_NOTE}}', size: 22 * s, color: '#fff7ed', gap: 22 },
        { div: p.d, w: W * 0.4, gap: 16 },
        { text: 'Best wishes from', size: 18 * s, color: '#fde68a', gap: 4 },
        { text: '{{SHOP_NAME}}', size: 40 * s, font: 'Cinzel', bold: 700, color: '#fff', gap: 4 },
        { text: '{{OWNER}}', size: 20 * s, color: '#fde68a', gap: 0 }
      ]));
      o = o.concat(contactBar(W, H, Object.assign({}, p, { acc: p.d }), s, foot, '#000000'));
      return { pages: [{ bg: p.a, objects: o }] };
    } },
    { id: 'rate1', name: 'Rate list — Clean', cat: 'Service Rate List', sizes: A, pals: ['blue', 'teal', 'slate'], build: function (W, H, p) {
      var s = sc(W, H), top = H * 0.2, foot = H - Math.max(120 * s, H * 0.13), o = [R(0, 0, W, top, p.a), R(0, top, W, 6 * s, p.acc)];
      o = o.concat(K.stack(30 * s, W - 60 * s, 12 * s, top - 8 * s, [
        { text: '{{SHOP_NAME}}', size: 44 * s, font: 'Montserrat', bold: 800, color: '#fff', gap: 4 },
        { text: 'SERVICE RATE LIST  ·  रेट लिस्ट', size: 20 * s, color: p.acc, bold: 700, ls: 120, gap: 0 }
      ]));
      var two = WIDE(W, H), y0 = top + 40 * s, cw = two ? (W - 100 * s) / 2 : W - 80 * s;
      [['rl1', 'rr1', 40 * s], ['rl2', 'rr2', two ? 60 * s + cw : null]].forEach(function (c, i) {
        if (c[2] == null) return;
        var full = !two;
        o.push(R(c[2] - 10 * s, y0 - 10 * s, cw + 20 * s, foot - y0 - 20 * s, p.soft, { r: 14 * s }));
        var rf = fit(foot - y0 - 50 * s, full ? count('RATES') : Math.ceil(count('RATES') / 2), 32 * s, 1.75);
        o.push(T(c[2] + 10 * s, y0 + 8 * s, cw * 0.66, full ? '{{RATES|left}}' : '{{RATES|' + c[0] + '}}', rf, { color: p.ink, lh: 1.75, bold: 600 }));
        o.push(T(c[2] + cw * 0.66, y0 + 8 * s, cw * 0.32, full ? '{{RATES|right}}' : '{{RATES|' + c[1] + '}}', rf, { color: p.b, lh: 1.75, bold: 800, align: 'right' }));
      });
      o = o.concat(contactBar(W, H, p, s, foot));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'rate2', name: 'Rate list — Board', cat: 'Service Rate List', sizes: A, pals: ['black', 'green'], build: function (W, H, p) {
      var s = sc(W, H), foot = H - Math.max(120 * s, H * 0.13), o = [R(0, 0, W, H, '#14201a'), R(18 * s, 18 * s, W - 36 * s, foot - 30 * s, null, { stroke: '#b45309', sw: 10 * s, r: 10 * s })];
      o = o.concat(K.stack(40 * s, W - 80 * s, 40 * s, H * 0.2, [
        { text: '{{SHOP_NAME}}', size: 46 * s, font: 'Kalam', bold: 700, color: '#fde047', gap: 4 },
        { text: 'RATE LIST', size: 24 * s, font: 'Kalam', color: '#fff', ls: 200, gap: 0 }
      ]));
      var bf = fit(foot - H * 0.22 - 50 * s, count('RATES'), 34 * s, 1.6);
      o.push(T(60 * s, H * 0.22, W * 0.55, '{{RATES|left}}', bf, { font: 'Kalam', color: '#f8fafc', lh: 1.6 }));
      o.push(T(W * 0.6, H * 0.22, W * 0.4 - 60 * s, '{{RATES|right}}', bf, { font: 'Kalam', color: '#fde047', lh: 1.6, align: 'right', bold: 700 }));
      o = o.concat(contactBar(W, H, Object.assign({}, p, { acc: '#fde047' }), s, foot, '#0b120e'));
      return { pages: [{ bg: '#14201a', objects: o }] };
    } },
    { id: 'pad1', name: 'Letter pad — Modern', cat: 'Letter Pad', sizes: ['a4p'], pals: ['blue', 'teal', 'maroon', 'slate'], build: function (W, H, p) {
      var u = W / 794, o = [K.POLY([[0, 0], [W, 0], [W, 110 * u], [0, 150 * u]], K.G(0, p.a, p.b)), K.POLY([[0, 150 * u], [W, 110 * u], [W, 118 * u], [0, 158 * u]], p.acc)];
      o.push(P(40 * u, 22 * u, 96 * u, 96 * u, 'LOGO', { shape: 'circle', fill: '#fff', sw: 0 }));
      o.push(T(156 * u, 26 * u, 600 * u, '{{SHOP_NAME}}', 34 * u, { font: 'Montserrat', bold: 800, color: '#fff' }));
      o.push(T(156 * u, 72 * u, 600 * u, '{{TAGLINE}}', 15 * u, { color: p.c }));
      o.push(T(60 * u, 180 * u, 340 * u, 'Ref. No.: ________', 14 * u, { color: '#475569' }));
      o.push(T(W - 340 * u, 180 * u, 280 * u, 'Date: ________', 14 * u, { color: '#475569', align: 'right' }));
      o.push(T(W / 2 - 200 * u, 540 * u, 400 * u, '{{SHOP_NAME}}', 60 * u, { font: 'Montserrat', bold: 800, color: p.a, align: 'center', op: 0.05, angle: -30 }));
      o.push(R(0, H - 70 * u, W, 70 * u, p.a)); o.push(R(0, H - 76 * u, W, 6 * u, p.acc));
      o.push(T(30 * u, H - 54 * u, W - 60 * u, '⌂ {{SHOP_ADDRESS}}   ☎ {{SHOP_PHONE}}   ✉ {{EMAIL}}', 13.5 * u, { color: '#fff', align: 'center' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'pad2', name: 'Letter pad — Classic', cat: 'Letter Pad', sizes: ['a4p'], pals: ['navy', 'green', 'gold'], build: function (W, H, p) {
      var u = W / 794, o = [];
      o.push(P(W / 2 - 45 * u, 26 * u, 90 * u, 90 * u, 'LOGO', { shape: 'circle', fill: p.soft, sw: 0 }));
      o.push(T(40 * u, 124 * u, W - 80 * u, '{{SHOP_NAME|upper}}', 32 * u, { font: 'Cinzel', bold: 700, color: p.a, align: 'center', ls: 80 }));
      o.push(T(40 * u, 168 * u, W - 80 * u, '{{SHOP_ADDRESS}}  ·  ☎ {{SHOP_PHONE}}  ·  {{EMAIL}}', 13 * u, { color: '#475569', align: 'center' }));
      o.push(L(40 * u, 200 * u, W - 40 * u, 200 * u, p.a, 2.5 * u)); o.push(L(40 * u, 206 * u, W - 40 * u, 206 * u, p.d, 1 * u));
      o.push(L(40 * u, H - 60 * u, W - 40 * u, H - 60 * u, p.d, 1 * u));
      o.push(T(40 * u, H - 48 * u, W - 80 * u, 'Prop.: {{OWNER}}   ·   {{WEBSITE}}', 12.5 * u, { color: '#475569', align: 'center' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'vote1', name: 'Election banner — Photo', cat: 'Election Banner', sizes: ['hd', 'a4l', 'a4p', 'sq'], pals: ['orange', 'green', 'blue'], build: function (W, H, p) {
      var s = sc(W, H), wide = WIDE(W, H), o = [R(0, 0, W, H, K.G(wide ? 0 : 90, p.b, p.a))];
      for (var i = 0; i < 5; i++) o.push(R(-W * 0.2 + i * W * 0.3, -H * 0.2, W * 0.08, H * 1.6, 'rgba(255,255,255,0.05)', { angle: 25 }));
      var pw = wide ? H * 0.62 : W * 0.5, ph = pw * 1.15, px = wide ? W * 0.06 : (W - pw) / 2, py = wide ? (H - ph) / 2 : H * 0.05;
      o.push(R(px - 8 * s, py - 8 * s, pw + 16 * s, ph + 16 * s, '#fff', { r: 18 * s }));
      o.push(P(px, py, pw, ph, 'PHOTO', { r: 14 * s, fill: p.c, sw: 0, label: 'Candidate photo' }));
      var tx = wide ? px + pw + 50 * s : 40 * s, tw = wide ? W - tx - 40 * s : W - 80 * s, ty = wide ? 30 * s : py + ph + 20 * s;
      o = o.concat(K.stack(tx, tw, ty, H - 30 * s, [
        { text: '{{SLOGAN}}', size: 26 * s, color: p.c, bold: 700, gap: 10 },
        { text: '{{CANDIDATE}}', size: 66 * s, font: 'Anton', color: '#fff', lh: 1.05, gap: 6, cw: 0.5 },
        { text: '{{POST_NAME}} — {{WARD}}', size: 26 * s, color: '#fff', bold: 600, gap: 16 },
        { text: 'मतदान चिन्ह: {{SYMBOL}}   ·   क्रमांक {{BALLOT_NO}}', size: 26 * s, font: 'Hind', bold: 700, color: p.a, bg: '#ffffff', gap: 14 },
        { text: 'मतदान दिनांक: {{ELECTION_DATE}}', size: 24 * s, font: 'Hind', bold: 700, color: '#fff', gap: 0 }
      ]));
      return { pages: [{ bg: p.a, objects: o }] };
    } },
    { id: 'vote2', name: 'Election banner — Appeal', cat: 'Election Banner', sizes: ['hd', 'a4l', 'a4p', 'sq'], pals: ['maroon', 'navy'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, '#fffaf0'), R(0, 0, W, H * 0.16, p.a), R(0, H * 0.16, W, 8 * s, p.acc), R(0, H - H * 0.12, W, H * 0.12, p.a)];
      o = o.concat(K.stack(30 * s, W - 60 * s, 10 * s, H * 0.16 - 6 * s, [{ text: 'आपका कीमती वोट — {{CANDIDATE}} को', size: 34 * s, font: 'Hind', bold: 700, color: '#fff', gap: 0 }]));
      var r = Math.min(W, H) * 0.2, cx = W > H ? W * 0.22 : W / 2, cy = W > H ? H * 0.55 : H * 0.36;
      o.push(C(cx, cy, r + 10 * s, p.acc));
      o.push(P(cx - r, cy - r, r * 2, r * 2, 'PHOTO', { shape: 'circle', fill: p.c, sw: 0, label: 'Candidate photo' }));
      var tx = W > H ? W * 0.42 : 40 * s, tw = W > H ? W * 0.54 : W - 80 * s, ty = W > H ? H * 0.2 : cy + r + 30 * s;
      o = o.concat(K.stack(tx, tw, ty, H - H * 0.12 - 20 * s, [
        { text: '{{POST_NAME}} पद हेतु प्रत्याशी', size: 26 * s, font: 'Hind', color: p.b, bold: 700, gap: 6 },
        { text: '{{CANDIDATE}}', size: 62 * s, font: 'Yatra One', color: p.a, gap: 10, lh: 1.1 },
        { text: '{{SLOGAN}}', size: 24 * s, font: 'Hind', color: '#334155', gap: 14 },
        { text: 'चुनाव चिन्ह: {{SYMBOL}}', size: 32 * s, font: 'Hind', bold: 700, color: '#fff', bg: p.b, gap: 0 }
      ]));
      o = o.concat(K.stack(30 * s, W - 60 * s, H - H * 0.12 + 6 * s, H - 6 * s, [{ text: '{{WARD}}  ·  मतदान: {{ELECTION_DATE}}', size: 26 * s, font: 'Hind', bold: 700, color: '#fff', gap: 0 }]));
      return { pages: [{ bg: '#fffaf0', objects: o }] };
    } }
  ];
  ST.register(K.expand('sp', layouts, ['blue']));
})();
