/* S Printer — certificates for schools, sports, events and offices (A4 landscape or portrait). Original designs. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P;
  var EST_REASON = 'for securing First Position in the Annual Science Exhibition held on 15 November 2026. We appreciate the hard work and wish a bright future.';
  function sc(W, H) { return W > H ? Math.min(W / 1123, H / 794) : W / 860; }
  function body(W, H, p, b, s, o) {
    o = o || {};
    var it = [];
    if (o.org !== false) it.push({ text: '{{ORG|upper}}', size: 22 * s, bold: 800, font: 'Montserrat', color: o.orgc || p.a, ls: 120, gap: 2 }, { text: '{{ORG_TAG}}', size: 14 * s, color: o.sub || '#64748b', gap: 18, est: 'Affiliated to CBSE · Jaipur' });
    it.push({ text: '{{CERT_TITLE|upper}}', size: (o.ts || 50) * s, font: o.tf || 'Cinzel', bold: 700, color: o.tc || p.a, ls: o.tls == null ? 140 : o.tls, gap: 4, lh: 1.05 });
    it.push({ div: o.dc || p.d, w: 260 * s, gap: 16 });
    it.push({ text: '{{CERT_SUB}}', size: 18 * s, italic: true, color: o.ink || '#475569', gap: 6 });
    it.push({ text: '{{NAME}}', size: (o.ns || 78) * s, font: o.nf || 'Great Vibes', color: o.nc || p.b, gap: 8, lh: 1.1, bold: o.nb });
    it.push({ text: '{{REASON}}', size: 19 * s, color: o.ink || '#334155', lh: 1.55, gap: 0, est: EST_REASON });
    return K.stack(b.x, b.w, b.top, b.bot, it, { maxK: H > W ? 1.5 : 1.1 });
  }
  function sigs(b, s, p, o) {
    o = o || {};
    var lw = 230 * s, y = b.bot + 70 * s, lx = b.x + 10 * s, rx = b.x + b.w - 10 * s - lw, ink = o.ink || '#1f2937', sub = o.sub || '#64748b', out = [];
    out.push(L(lx, y, lx + lw, y, o.line || ink, 1.4 * s), T(lx, y + 8 * s, lw, '{{SIGN1_NAME}}', 17 * s, { bold: 700, color: ink, align: 'center' }), T(lx, y + 32 * s, lw, '{{SIGN1_ROLE}}', 14 * s, { color: sub, align: 'center' }));
    out.push(P(rx + lw / 2 - 95 * s, y - 66 * s, 190 * s, 62 * s, 'SIGN', { fill: 'rgba(255,255,255,0.6)', label: 'Signature' }));
    out.push(L(rx, y, rx + lw, y, o.line || ink, 1.4 * s), T(rx, y + 8 * s, lw, '{{SIGN2_NAME}}', 17 * s, { bold: 700, color: ink, align: 'center' }), T(rx, y + 32 * s, lw, '{{SIGN2_ROLE}}', 14 * s, { color: sub, align: 'center' }));
    if (o.date === 'left') out.push(T(lx, y - 46 * s, lw, 'Date: {{DATE}}', 14 * s, { color: sub, align: 'center' }));
    else if (o.date !== false) out.push(T(b.x + b.w / 2 - 150 * s, y + (b.w < 2 * lw + 320 * s ? 66 : 20) * s, 300 * s, 'Date: {{DATE}}  ·  {{PLACE}}', 14 * s, { color: sub, align: 'center' }));
    return out;
  }
  function seal(cx, cy, r, p, o) {
    o = o || {};
    var out = [K.POLY([[cx - r * 0.55, cy + r * 0.3], [cx - r * 0.15, cy + r * 0.4], [cx - r * 0.35, cy + r * 1.5], [cx - r * 0.52, cy + r * 1.25], [cx - r * 0.75, cy + r * 1.35]], o.rib || p.b),
      K.POLY([[cx + r * 0.55, cy + r * 0.3], [cx + r * 0.15, cy + r * 0.4], [cx + r * 0.35, cy + r * 1.5], [cx + r * 0.52, cy + r * 1.25], [cx + r * 0.75, cy + r * 1.35]], o.rib || p.b)];
    out.push(K.burst(cx, cy, r, r * 0.86, 28, p.d), C(cx, cy, r * 0.78, o.fill || p.a), C(cx, cy, r * 0.68, null, { stroke: p.d, sw: Math.max(1, r * 0.03), dash: [r * 0.06, r * 0.04] }));
    out.push(K.burst(cx, cy - r * 0.08, r * 0.3, r * 0.13, 5, p.d), T(cx - r * 0.7, cy + r * 0.26, r * 1.4, o.text || 'AWARD', r * 0.16, { bold: 800, color: '#fff', align: 'center', ls: 200, font: 'Montserrat' }));
    return out;
  }
  function medal(cx, cy, r, p) {
    return [K.POLY([[cx - r * 0.9, cy - r * 2.6], [cx - r * 0.3, cy - r * 2.6], [cx + r * 0.25, cy - r * 0.7], [cx - r * 0.35, cy - r * 0.7]], p.acc), K.POLY([[cx + r * 0.9, cy - r * 2.6], [cx + r * 0.3, cy - r * 2.6], [cx - r * 0.25, cy - r * 0.7], [cx + r * 0.35, cy - r * 0.7]], p.b),
      C(cx, cy, r, '#f59e0b', { shadow: { y: 4, b: 10, c: 'rgba(0,0,0,.25)' } }), C(cx, cy, r * 0.8, '#fbbf24'), C(cx, cy, r * 0.8, null, { stroke: '#d97706', sw: Math.max(1, r * 0.04) }), K.burst(cx, cy, r * 0.5, r * 0.22, 5, '#fff7d6')];
  }
  function trophy(cx, cy, s, col, col2) {   // a simple cup
    return [K.PATH('M ' + (cx - 60 * s) + ' ' + (cy - 90 * s) + ' L ' + (cx + 60 * s) + ' ' + (cy - 90 * s) + ' Q ' + (cx + 60 * s) + ' ' + (cy + 10 * s) + ' ' + cx + ' ' + (cy + 20 * s) + ' Q ' + (cx - 60 * s) + ' ' + (cy + 10 * s) + ' ' + (cx - 60 * s) + ' ' + (cy - 90 * s) + ' Z', col),
      C(cx - 66 * s, cy - 56 * s, 24 * s, null, { stroke: col, sw: 8 * s }), C(cx + 66 * s, cy - 56 * s, 24 * s, null, { stroke: col, sw: 8 * s }),
      R(cx - 10 * s, cy + 16 * s, 20 * s, 36 * s, col), R(cx - 46 * s, cy + 50 * s, 92 * s, 22 * s, col2, { r: 4 * s }), R(cx - 60 * s, cy + 70 * s, 120 * s, 18 * s, col, { r: 4 * s }), K.burst(cx, cy - 46 * s, 22 * s, 9 * s, 5, '#fff', { op: 0.85 })];
  }
  function logoTop(W, y, s, o) { return P(W / 2 - 42 * s, y, 84 * s, 84 * s, 'LOGO', Object.assign({ shape: 'circle', fill: '#ffffff', sw: 0 }, o)); }
  var SZ = ['a4l', 'a4p'];
  var layouts = [
    { id: 'classic', name: 'Classic Gold', cat: 'Classic', sizes: SZ, pals: ['gold', 'maroon', 'navy', 'emerald'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H) * 0.035, o = [R(0, 0, W, H, K.G(90, '#fffdf5', '#fbf3dc'))].concat(K.frame(W, H, m, p.b, p.d, true));
      var b = { x: W * 0.12, w: W * 0.76, top: H * 0.06 + 96 * s, bot: H - 170 * s };
      o.push(logoTop(W, H * 0.06, s, { stroke: p.d, sw: 2 * s }));
      o = o.concat(body(W, H, p, b, s), seal(W / 2, H - 130 * s, 52 * s, p), sigs(b, s, p, { date: 'left' }));
      return { pages: [{ bg: '#fffdf5', objects: o }] };
    } },
    { id: 'corner', name: 'Corner Ribbons', cat: 'Modern', sizes: SZ, pals: ['blue', 'rose', 'teal', 'purple'], build: function (W, H, p) {
      var s = sc(W, H), o = [K.POLY([[0, 0], [190 * s, 0], [0, 190 * s]], p.a), K.POLY([[0, 210 * s], [210 * s, 0], [240 * s, 0], [0, 240 * s]], p.acc), K.POLY([[0, 252 * s], [252 * s, 0], [264 * s, 0], [0, 264 * s]], p.b),
        K.POLY([[W, H], [W - 190 * s, H], [W, H - 190 * s]], p.a), K.POLY([[W, H - 210 * s], [W - 210 * s, H], [W - 240 * s, H], [W, H - 240 * s]], p.acc), K.POLY([[W, H - 252 * s], [W - 252 * s, H], [W - 264 * s, H], [W, H - 264 * s]], p.b)];
      o.push(R(24 * s, 24 * s, W - 48 * s, H - 48 * s, null, { stroke: p.c, sw: 2 * s }));
      var b = { x: W * 0.16, w: W * 0.68, top: 60 * s + 96 * s, bot: H - 180 * s };
      o.push(logoTop(W, 60 * s, s, { fill: p.soft }));
      o = o.concat(body(W, H, p, b, s, { tf: 'Montserrat', ts: 52, nf: 'Great Vibes' }), sigs(b, s, p));
      o = o.concat(seal(W - 130 * s, 120 * s, 52 * s, p, { text: 'BEST' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'waves', name: 'Modern Waves', cat: 'Modern', sizes: SZ, pals: ['navy', 'teal', 'purple', 'green'], build: function (W, H, p) {
      var s = sc(W, H), o = [K.wave(W, H, 110 * s, 22 * s, K.G(0, p.a, p.b), false), K.wave(W, H, H - 90 * s, 18 * s, K.G(0, p.b, p.a), true), K.wave(W, H, H - 110 * s, 14 * s, p.acc, true, { op: 0.35 })];
      o.push(P(40 * s, 18 * s, 76 * s, 76 * s, 'LOGO', { shape: 'circle', fill: '#fff', sw: 0 }));
      o.push(T(130 * s, 26 * s, W * 0.6, '{{ORG|upper}}', 26 * s, { font: 'Montserrat', bold: 800, color: '#fff', ls: 80 }), T(130 * s, 62 * s, W * 0.6, '{{ORG_TAG}}', 15 * s, { color: p.c }));
      var b = { x: W * 0.12, w: W * 0.76, top: 150 * s, bot: H - 200 * s };
      o = o.concat(body(W, H, p, b, s, { org: false, tf: 'Montserrat', ts: 56, tls: 200 }), sigs(b, s, p));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'premium', name: 'Dark Premium', cat: 'Classic', sizes: SZ, pals: ['black', 'navy', 'maroon', 'emerald'], build: function (W, H, p) {
      var s = sc(W, H), m = 30 * s, o = [R(0, 0, W, H, K.G(135, p.a, '#020617'))];
      o.push(R(m, m, W - 2 * m, H - 2 * m, '#fffdf7', { shadow: { y: 6, b: 20, c: 'rgba(0,0,0,.4)' } }), R(m + 14 * s, m + 14 * s, W - 2 * m - 28 * s, H - 2 * m - 28 * s, null, { stroke: p.d, sw: 2.5 * s }), R(m + 22 * s, m + 22 * s, W - 2 * m - 44 * s, H - 2 * m - 44 * s, null, { stroke: p.d, sw: 0.8 * s }));
      o.push(K.POLY([[W / 2 - 110 * s, m], [W / 2 + 110 * s, m], [W / 2 + 90 * s, m + 40 * s], [W / 2 - 90 * s, m + 40 * s]], p.a));
      o.push(T(W / 2 - 100 * s, m + 8 * s, 200 * s, '★ ★ ★', 18 * s, { color: p.d, align: 'center' }));
      var b = { x: W * 0.14, w: W * 0.72, top: m + 60 * s + 90 * s, bot: H - 190 * s };
      o.push(logoTop(W, m + 60 * s, s, { stroke: p.d, sw: 2 * s }));
      o = o.concat(body(W, H, { a: p.a, b: p.ink === '#111827' ? '#a16207' : p.b, d: p.d }, b, s, { nc: p.ink === '#111827' ? '#a16207' : p.a, tc: '#111827' }));
      o = o.concat(seal(W / 2, H - 150 * s, 50 * s, { a: p.a, b: p.a, d: p.d }), sigs(b, s, p, { date: 'left' }));
      return { pages: [{ bg: p.a, objects: o }] };
    } },
    { id: 'geo', name: 'Geometric Side', cat: 'Corporate', sizes: SZ, pals: ['blue', 'slate', 'orange', 'teal'], build: function (W, H, p) {
      var s = sc(W, H), sw = Math.min(W * 0.24, 270 * s), o = [R(0, 0, sw, H, p.a)];
      for (var i = 0; i < 6; i++) o.push(K.POLY([[0, i * H / 6], [sw, i * H / 6 + H / 12], [0, (i + 1) * H / 6]], i % 2 ? p.b : 'rgba(255,255,255,0.06)'));
      o.push(R(sw, 0, 10 * s, H, p.acc));
      o.push(C(sw / 2, H * 0.22, 66 * s, '#fff'), P(sw / 2 - 58 * s, H * 0.22 - 58 * s, 116 * s, 116 * s, 'LOGO', { shape: 'circle', fill: '#fff', sw: 0 }));
      o.push(T(20 * s, H * 0.22 + 84 * s, sw - 40 * s, '{{ORG}}', 20 * s, { font: 'Montserrat', bold: 800, color: '#fff', align: 'center', lh: 1.15 }));
      o = o.concat(medal(sw / 2, H * 0.74, 56 * s, p));
      var b = { x: sw + 70 * s, w: W - sw - 130 * s, top: 70 * s, bot: H - 190 * s };
      o = o.concat(body(W, H, p, b, s, { org: false, tf: 'Montserrat', ts: 54, tls: 160 }), sigs(b, s, p));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'kids', name: 'Kids Stars', cat: 'Kids', sizes: SZ, pals: ['purple', 'blue', 'rose', 'green'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, K.G(160, '#fff7e6', '#f0f9ff'))], cols = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
      for (var i = 0; i < 18; i++) { var x = (i * 173) % W, y = (i * 97) % (H * 0.25) + (i % 2 ? H * 0.75 : 0); o.push(K.burst(x, y, (10 + i % 4 * 4) * s, (4 + i % 4 * 2) * s, 5, cols[i % 6], { op: 0.85 })); }
      [[W * 0.07, H * 0.35, 0], [W * 0.12, H * 0.28, 3], [W * 0.9, H * 0.33, 1], [W * 0.95, H * 0.27, 4]].forEach(function (bl) { o.push(L(bl[0], bl[1] + 40 * s, bl[0] + 6 * s, bl[1] + 150 * s, '#94a3b8', 1.5 * s), C(bl[0], bl[1], 32 * s, cols[bl[2]]), C(bl[0] - 10 * s, bl[1] - 10 * s, 8 * s, '#fff', { op: 0.5 })); });
      o.push(R(30 * s, 30 * s, W - 60 * s, H - 60 * s, null, { stroke: p.b, sw: 5 * s, dash: [18 * s, 10 * s] }));
      var b = { x: W * 0.17, w: W * 0.66, top: 70 * s + 96 * s, bot: H - 180 * s };
      o.push(logoTop(W, 70 * s, s, { stroke: p.b, sw: 3 * s }));
      o = o.concat(body(W, H, p, b, s, { tf: 'Righteous', ts: 56, tls: 60, tc: p.b, nf: 'Pacifico', ns: 62, nc: p.a }), sigs(b, s, p));
      return { pages: [{ bg: '#fff7e6', objects: o }] };
    } },
    { id: 'sports', name: 'Sports Trophy', cat: 'Sports & Medal', sizes: SZ, pals: ['blue', 'orange', 'green', 'black'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, '#ffffff')];
      for (var i = 0; i < 5; i++) o.push(K.POLY([[W - (420 - i * 60) * s, 0], [W - (380 - i * 60) * s, 0], [W - (680 - i * 60) * s, H], [W - (720 - i * 60) * s, H]], i % 2 ? p.b : p.a, { op: 0.08 + i * 0.03 }));
      o.push(R(0, 0, W, 14 * s, p.a), R(0, H - 14 * s, W, 14 * s, p.a), R(0, 14 * s, W, 6 * s, p.acc), R(0, H - 20 * s, W, 6 * s, p.acc));
      o = o.concat(trophy(W - 170 * s, 180 * s, s * 0.95, '#f59e0b', p.a));
      o.push(P(60 * s, 50 * s, 80 * s, 80 * s, 'LOGO', { shape: 'circle', fill: p.soft, sw: 0 }));
      o.push(T(156 * s, 58 * s, W * 0.5, '{{ORG|upper}}', 24 * s, { font: 'Montserrat', bold: 800, color: p.a, ls: 60 }), T(156 * s, 92 * s, W * 0.5, '{{ORG_TAG}}', 15 * s, { color: '#64748b' }));
      var b = { x: 70 * s, w: W - 400 * s, top: 160 * s, bot: H - 190 * s };
      o = o.concat(K.stack(b.x, b.w, b.top, b.bot, [
        { text: '{{CERT_TITLE|upper}}', size: 58 * s, font: 'Bebas Neue', color: p.a, ls: 80, align: 'left', gap: 6, lh: 1 },
        { text: '{{CERT_SUB}}', size: 18 * s, italic: true, color: '#475569', align: 'left', gap: 6 },
        { text: '{{NAME|upper}}', size: 58 * s, font: 'Montserrat', bold: 800, color: p.b, align: 'left', gap: 12, lh: 1.05 },
        { text: '{{REASON}}', size: 19 * s, color: '#334155', align: 'left', lh: 1.55, gap: 0, est: EST_REASON }
      ], { maxK: H > W ? 1.5 : 1.1 }));
      o = o.concat(sigs({ x: 60 * s, w: W - 120 * s, bot: b.bot }, s, p));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'mandala', name: 'Mandala Elegant', cat: 'Classic', sizes: SZ, pals: ['maroon', 'purple', 'teal', 'gold'], build: function (W, H, p) {
      var s = sc(W, H), o = [];
      [[0, 0], [W, 0], [0, H], [W, H]].forEach(function (c) { o = o.concat(K.mandala(c[0], c[1], 170 * s, p.d, p.c, 0.45)); });
      o.push(R(40 * s, 40 * s, W - 80 * s, H - 80 * s, null, { stroke: p.b, sw: 2 * s }), R(50 * s, 50 * s, W - 100 * s, H - 100 * s, null, { stroke: p.d, sw: 1 * s }));
      var b = { x: W * 0.16, w: W * 0.68, top: 70 * s + 96 * s, bot: H - 180 * s };
      o.push(logoTop(W, 70 * s, s, { fill: p.soft, stroke: p.d, sw: 2 * s }));
      o = o.concat(body(W, H, p, b, s, { tf: 'Cormorant Garamond', ts: 58, tls: 120 }), sigs(b, s, p));
      return { pages: [{ bg: '#fffdf8', objects: o }] };
    } },
    { id: 'minimal', name: 'Minimal Line', cat: 'Corporate', sizes: SZ, pals: ['slate', 'blue', 'green', 'rose'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(60 * s, 60 * s, 8 * s, H - 120 * s, p.b), R(W - 260 * s, 60 * s, 200 * s, 8 * s, p.b)];
      o.push(P(W - 160 * s, 90 * s, 100 * s, 100 * s, 'LOGO', { shape: 'circle', fill: p.soft, sw: 0 }));
      o = o.concat(K.stack(110 * s, W - 400 * s, 70 * s, 200 * s, [{ text: '{{ORG|upper}}', size: 22 * s, bold: 800, font: 'Montserrat', color: p.ink, ls: 120, align: 'left', gap: 4 }, { text: '{{ORG_TAG}}', size: 15 * s, color: '#64748b', align: 'left', gap: 0 }], { maxK: 1, valign: 'top' }));
      var b = { x: 110 * s, w: W - 220 * s, top: 190 * s, bot: H - 190 * s };
      o = o.concat(K.stack(b.x, b.w, b.top, b.bot, [
        { text: '{{CERT_TITLE}}', size: 52 * s, font: 'Montserrat', bold: 800, color: p.ink, align: 'left', gap: 18, lh: 1.05 },
        { text: '{{CERT_SUB|upper}}', size: 15 * s, bold: 700, color: '#64748b', ls: 200, align: 'left', gap: 6 },
        { text: '{{NAME}}', size: 70 * s, font: 'Playfair Display', bold: 700, color: p.b, align: 'left', gap: 12, lh: 1.1 },
        { text: '{{REASON}}', size: 19 * s, color: '#334155', align: 'left', lh: 1.6, gap: 0, est: EST_REASON }
      ], { maxK: H > W ? 1.5 : 1.1 }));
      o = o.concat(sigs(b, s, p));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'band', name: 'Vertical Band', cat: 'Corporate', sizes: SZ, pals: ['navy', 'purple', 'maroon', 'teal'], build: function (W, H, p) {
      var s = sc(W, H), bx = 90 * s, bw = 170 * s, o = [R(bx, 0, bw, H, K.G(180, p.a, p.b)), K.POLY([[bx, H], [bx + bw / 2, H - 60 * s], [bx + bw, H]], '#ffffff')];
      o.push(T(bx + 50 * s, H - 110 * s, H - 360 * s, 'CERTIFICATE', 80 * s, { font: 'Bebas Neue', color: '#ffffff', ls: 300, angle: -90, op: 0.95 }));
      o.push(C(bx + bw / 2, 140 * s, 64 * s, '#fff'), P(bx + bw / 2 - 56 * s, 84 * s, 112 * s, 112 * s, 'LOGO', { shape: 'circle', fill: '#fff', sw: 0 }));
      var b = { x: bx + bw + 70 * s, w: W - bx - bw - 130 * s, top: 70 * s, bot: H - 190 * s };
      o = o.concat(body(W, H, p, b, s, { tf: 'Cinzel', ts: 46 }), sigs(b, s, p));
      o.push(R(0, H - 10 * s, W, 10 * s, p.d));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'scallop', name: 'Vintage Scallop', cat: 'Classic', sizes: SZ, pals: ['emerald', 'blue', 'maroon', 'purple'], build: function (W, H, p) {
      var s = sc(W, H), m = 40 * s, r = 16 * s, o = [R(0, 0, W, H, p.b)];
      o.push(R(m, m, W - 2 * m, H - 2 * m, '#fffdf6'));
      for (var x = m; x <= W - m; x += r * 2) o.push(C(x, m, r, '#fffdf6'), C(x, H - m, r, '#fffdf6'));
      for (var y = m; y <= H - m; y += r * 2) o.push(C(m, y, r, '#fffdf6'), C(W - m, y, r, '#fffdf6'));
      o.push(R(m + 30 * s, m + 30 * s, W - 2 * m - 60 * s, H - 2 * m - 60 * s, null, { stroke: p.b, sw: 2 * s, dash: [6 * s, 5 * s] }));
      var b = { x: W * 0.15, w: W * 0.7, top: 100 * s + 90 * s, bot: H - 190 * s };
      o.push(logoTop(W, 100 * s, s, { fill: p.soft, stroke: p.b, sw: 2 * s }));
      o = o.concat(body(W, H, p, b, s, { tf: 'Abril Fatface', tls: 80, ts: 50 }), sigs(b, s, p, { date: 'left' }), seal(W / 2, H - 150 * s, 46 * s, p));
      return { pages: [{ bg: p.b, objects: o }] };
    } },
    { id: 'medal', name: 'Gold Medal', cat: 'Sports & Medal', sizes: SZ, pals: ['navy', 'purple', 'teal', 'rose'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, K.G(135, p.soft, '#ffffff')), C(W, 0, 260 * s, p.c, { op: 0.8 }), C(0, H, 220 * s, p.c, { op: 0.8 }), R(26 * s, 26 * s, W - 52 * s, H - 52 * s, null, { stroke: p.b, sw: 3 * s })];
      o = o.concat(medal(W - 190 * s, 290 * s, 74 * s, p));
      o.push(P(70 * s, 60 * s, 80 * s, 80 * s, 'LOGO', { shape: 'circle', fill: '#fff', sw: 0 }));
      o.push(T(166 * s, 68 * s, W * 0.55, '{{ORG|upper}}', 24 * s, { font: 'Montserrat', bold: 800, color: p.a, ls: 60 }), T(166 * s, 102 * s, W * 0.55, '{{ORG_TAG}}', 15 * s, { color: '#64748b' }));
      var b = { x: 80 * s, w: W - 420 * s, top: 170 * s, bot: H - 190 * s };
      o = o.concat(K.stack(b.x, b.w, b.top, b.bot, [
        { text: '{{CERT_TITLE|upper}}', size: 50 * s, font: 'Cinzel', bold: 700, color: p.a, ls: 80, align: 'left', gap: 14, lh: 1.05 },
        { text: '{{CERT_SUB}}', size: 18 * s, italic: true, color: '#475569', align: 'left', gap: 6 },
        { text: '{{NAME}}', size: 74 * s, font: 'Great Vibes', color: p.b, align: 'left', gap: 10, lh: 1.1 },
        { text: '{{REASON}}', size: 19 * s, color: '#334155', align: 'left', lh: 1.55, gap: 0, est: EST_REASON }
      ], { maxK: H > W ? 1.5 : 1.1 }));
      o = o.concat(sigs({ x: 70 * s, w: W - 140 * s, bot: b.bot }, s, p));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } }
  ];
  ST.register(K.expand('ct', layouts, ['blue']));
})();
