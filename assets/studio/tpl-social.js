/* S Printer — social media & everyday templates for Editing Tool S.
 * Every layout adapts to square, portrait, story and landscape sizes. Original designs by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, C = K.C, P = K.P, A = K.A;
  var SZ = ['sq', 'igp', 'story', 'fbpost', 'yt', 'hd'];
  var PAL = {
    candy: { bg: '#fff1f5', a: '#db2777', b: '#7c3aed', c: '#fbcfe8', ink: '#3b0a24', acc: '#facc15', f: ['#fde2e4', '#f9a8d4', '#db2777', '#86c5a4', '#fbcfe8', '#ffffff'] },
    ocean: { bg: '#eff8ff', a: '#0369a1', b: '#06b6d4', c: '#bae6fd', ink: '#0c2a43', acc: '#f97316', f: ['#e0f2fe', '#7dd3fc', '#0284c7', '#86c5a4', '#fef3c7', '#ffffff'] },
    sunset: { bg: '#fff7ed', a: '#c2410c', b: '#e11d48', c: '#fed7aa', ink: '#431407', acc: '#fde047', f: ['#ffedd5', '#fdba74', '#ea580c', '#9cb58a', '#fde2e4', '#ffffff'] },
    forest: { bg: '#f0fdf4', a: '#166534', b: '#0d9488', c: '#bbf7d0', ink: '#052e16', acc: '#f59e0b', f: ['#fde2e4', '#f4a6b7', '#d36a85', '#4d9a6a', '#fff1c1', '#ffffff'] },
    night: { bg: '#0b1020', a: '#a78bfa', b: '#22d3ee', c: '#1e1b4b', ink: '#f8fafc', acc: '#f472b6', f: ['#312e81', '#a78bfa', '#f472b6', '#22d3ee', '#c4b5fd', '#ffffff'] },
    lemon: { bg: '#fefce8', a: '#1f2937', b: '#ca8a04', c: '#fef08a', ink: '#111827', acc: '#ef4444', f: ['#fef9c3', '#fde047', '#ca8a04', '#84cc16', '#fde2e4', '#ffffff'] },
    lilac: { bg: '#faf5ff', a: '#6d28d9', b: '#c026d3', c: '#e9d5ff', ink: '#2e1065', acc: '#f59e0b', f: ['#f3e8ff', '#d8b4fe', '#9333ea', '#9fb7a2', '#fbcfe8', '#ffffff'] }
  };
  function geo(W, H) { var r = W / H; return { m: Math.min(W, H), s: Math.min(W, H) / 1080, land: r > 1.25, tall: r < 0.7, r: r }; }
  function pill(x, y, w, h, fill, text, size, col, o) { o = o || {}; return [R(x, y, w, h, fill, { r: h / 2, shadow: o.shadow }), T(x, y + (h - size * 1.2) / 2, w, text, size, { font: o.font || 'Poppins', bold: 700, color: col, align: 'center', ls: o.ls || 60 })]; }
  function photoBox(g, W, H, side) {   // where the photo goes for split layouts
    if (g.land) return side === 'r' ? { x: W * 0.52, y: 0, w: W * 0.48, h: H } : { x: 0, y: 0, w: W * 0.48, h: H };
    var ph = H * (g.tall ? 0.46 : 0.5);
    return { x: 0, y: 0, w: W, h: ph };
  }
  function textBox(g, W, H, side) {
    if (g.land) return side === 'r' ? { x: W * 0.05, w: W * 0.43, top: H * 0.1, bot: H * 0.9 } : { x: W * 0.53, w: W * 0.42, top: H * 0.1, bot: H * 0.9 };
    var ph = H * (g.tall ? 0.46 : 0.5);
    return { x: W * 0.08, w: W * 0.84, top: ph + H * 0.05, bot: H * (g.tall ? 0.9 : 0.94) };
  }
  var layouts = [
    { id: 'sale', name: 'Mega Sale', cat: 'Sale & Offers', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, K.G(135, p.a, p.b))];
      o.push(C(W * 0.88, H * 0.12, m * 0.32, '#ffffff', { op: 0.08 }), C(W * 0.1, H * 0.92, m * 0.38, '#ffffff', { op: 0.07 }));
      o.push(K.burst(W * 0.82, H * 0.2, m * 0.15, m * 0.12, 18, p.acc), T(W * 0.82 - m * 0.12, H * 0.2 - m * 0.06, m * 0.24, 'FLAT\n50%', 40 * s, { font: 'Anton', color: p.ink, align: 'center', lh: 1 }));
      var x = W * 0.08, w = g.land ? W * 0.58 : W * 0.84;
      o = o.concat(K.stack(x, w, H * (g.land ? 0.12 : 0.3), H * (g.land ? 0.72 : 0.72), [
        { text: 'LIMITED TIME', size: 34, font: 'Montserrat', bold: 800, color: p.acc, ls: 300, gap: 10, align: 'left' },
        { text: 'MEGA\nSALE', size: 210, font: 'Anton', color: '#ffffff', lh: 0.95, gap: 14, align: 'left', shadow: { y: 8, b: 0, c: 'rgba(0,0,0,.18)' } },
        { text: 'Up to 50% off on everything in store', size: 40, font: 'Poppins', bold: 500, color: '#ffffff', gap: 0, align: 'left' }
      ], { maxK: g.s * 1.1 }));
      var bh = 84 * s, by = H * (g.land ? 0.78 : 0.8);
      o = o.concat(pill(x, by, 330 * s, bh, '#ffffff', 'SHOP NOW', 34 * s, p.a, { shadow: { y: 10, b: 24, c: 'rgba(0,0,0,.2)' } }));
      o.push(T(x + 360 * s, by + bh * 0.28, W * 0.5, 'www.yourshop.com', 28 * s, { font: 'Poppins', color: '#ffffff', op: 0.9 }));
      return { pages: [{ bg: p.a, objects: o }] };
    } },
    { id: 'quote', name: 'Soft Quote', cat: 'Quotes', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, p.bg), A('blob', -m * 0.2, -m * 0.18, m * 0.75, m * 0.6, { cols: [p.c] }), A('blob', W - m * 0.5, H - m * 0.42, m * 0.7, m * 0.56, { cols: [p.c], op: 0.8 })];
      o.push(A('sparkle', W * 0.84, H * 0.1, 70 * s, 70 * s, { cols: [p.acc] }), A('sparkle', W * 0.08, H * 0.82, 50 * s, 50 * s, { cols: [p.b] }));
      o.push(T(W / 2 - 120 * s, H * 0.16, 240 * s, '“', 260 * s, { font: 'Playfair Display', bold: 700, color: p.a, align: 'center', lh: 1, op: 0.85 }));
      o = o.concat(K.stack(W * 0.12, W * 0.76, H * 0.3, H * 0.82, [
        { text: 'Be the reason someone smiles today.', size: 86, font: 'Playfair Display', italic: true, bold: 600, color: p.ink, lh: 1.25, gap: 30 },
        { div: p.a, w: 160 * s, gap: 18 },
        { text: '@yourname', size: 34, font: 'Montserrat', bold: 600, color: p.a, ls: 120, gap: 0 }
      ], { maxK: g.s * 1.1 }));
      return { pages: [{ bg: p.bg, objects: o }] };
    } },
    { id: 'launch', name: 'Coming Soon Neon', cat: 'Announcement', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, m = g.m, dark = '#0b1020', o = [R(0, 0, W, H, K.G(160, dark, '#1e1b4b'))];
      for (var i = 0; i < 26; i++) o.push(C((i * 337) % W, (i * 211) % H, (2 + i % 3) * s, '#ffffff', { op: 0.25 + (i % 4) * 0.12 }));
      o.push(R(m * 0.05, m * 0.05, W - m * 0.1, H - m * 0.1, null, { stroke: p.b, sw: 3 * s, r: 30 * s, shadow: { b: 24, c: p.b } }));
      o = o.concat(K.stack(W * 0.1, W * 0.8, H * 0.14, H * 0.86, [
        { text: 'SOMETHING NEW IS', size: 38, font: 'Montserrat', bold: 700, color: '#e2e8f0', ls: 400, gap: 18 },
        { text: 'Coming\nSoon', size: 200, font: 'Pacifico', color: '#ffffff', lh: 1.1, gap: 24, shadow: { b: 30, c: p.acc } },
        { text: 'Launching 25 December · Stay tuned', size: 38, font: 'Poppins', bold: 500, color: p.b, gap: 0 }
      ], { maxK: g.s * 1.1 }));
      return { pages: [{ bg: dark, objects: o }] };
    } },
    { id: 'bday', name: 'Birthday Wishes', cat: 'Wishes & Festivals', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, p.bg), A('confetti', 0, 0, W, H * 0.35, { cols: [p.a, p.b, p.acc, p.c], op: 0.9, fit: 'stretch' })];
      var r = m * (g.land ? 0.3 : 0.24), cx = g.land ? W * 0.27 : W / 2, cy = g.land ? H / 2 : H * (g.tall ? 0.3 : 0.32);
      o.push(C(cx, cy, r + 18 * s, p.c), A('wreath', cx - r * 1.32, cy - r * 1.32, r * 2.64, r * 2.64, { cols: p.f.slice(0, 5) }));
      o.push(P(cx - r, cy - r, r * 2, r * 2, 'PHOTO', { shape: 'circle', fill: '#ffffff', stroke: '#ffffff', sw: 8 * s, label: 'Photo' }));
      var x = g.land ? W * 0.52 : W * 0.08, w = g.land ? W * 0.42 : W * 0.84, top = g.land ? H * 0.14 : cy + r * 1.36, bot = g.land ? H * 0.86 : H * 0.94;
      o = o.concat(K.stack(x, w, top, bot, [
        { text: 'Happy', size: 120, font: 'Great Vibes', color: p.b, gap: -10 },
        { text: 'BIRTHDAY', size: 130, font: 'Anton', color: p.a, ls: 80, gap: 14 },
        { text: 'Riya', size: 90, font: 'Pacifico', color: p.ink, gap: 12 },
        { text: 'Wishing you a year full of love, laughter and cake!', size: 36, font: 'Poppins', color: p.ink, lh: 1.4, gap: 0 }
      ], { maxK: g.s * 1.1 }));
      o.push(A('heart', W * 0.86, H * 0.86, 60 * s, 60 * s, { cols: [p.a] }), A('star', W * 0.06, H * 0.44, 46 * s, 46 * s, { cols: [p.acc] }));
      return { pages: [{ bg: p.bg, objects: o }] };
    } },
    { id: 'food', name: 'Food Promo Split', cat: 'Business', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, pb = photoBox(g, W, H, 'l'), tb = textBox(g, W, H, 'l'), o = [R(0, 0, W, H, p.bg)];
      o.push(P(pb.x, pb.y, pb.w, pb.h, 'PHOTO', { fill: p.c, label: 'Food photo' }));
      o.push(K.burst(pb.x + pb.w - 110 * s, pb.y + pb.h - 90 * s, 92 * s, 78 * s, 16, p.acc), T(pb.x + pb.w - 190 * s, pb.y + pb.h - 128 * s, 160 * s, 'ONLY\n₹199', 34 * s, { font: 'Anton', color: p.ink, align: 'center', lh: 1 }));
      o = o.concat(K.stack(tb.x, tb.w, tb.top, tb.bot, [
        { text: 'TODAY’S SPECIAL', size: 34, font: 'Montserrat', bold: 800, color: p.b, ls: 260, gap: 12, align: 'left' },
        { text: 'Cheesy Veg\nBurger Combo', size: 120, font: 'Bebas Neue', color: p.a, lh: 1, gap: 16, align: 'left' },
        { text: 'Burger + fries + cold drink. Fresh, hot and made just for you.', size: 36, font: 'Poppins', color: p.ink, lh: 1.4, gap: 22, align: 'left' },
        { text: 'Order now  ·  98765 43210', size: 36, font: 'Poppins', bold: 700, color: p.a, gap: 0, align: 'left' }
      ], { maxK: g.s * 1.1 }));
      return { pages: [{ bg: p.bg, objects: o }] };
    } },
    { id: 'minimal', name: 'Bold Minimal', cat: 'Quotes', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, o = [R(0, 0, W, H, '#ffffff'), R(W * 0.06, H * 0.06, W * 0.88, H * 0.88, p.c, { r: 40 * s })];
      var st = K.stack(W * 0.14, W * 0.72, H * 0.14, H * 0.8, [
        { text: 'Start where\nyou are.', size: 170, font: 'Montserrat', bold: 800, color: p.ink, lh: 1.08, gap: 70, align: 'left' },
        { text: 'Use what you have. Do what you can.', size: 44, font: 'Poppins', color: p.a, lh: 1.3, gap: 0, align: 'left' }
      ], { maxK: g.s * 1.1 });
      o = o.concat(st);
      o.push(A('underline', W * 0.14, st.endY + 10 * s, W * 0.36, 40 * s, { cols: [p.a] }), T(W * 0.14, H * 0.84, W * 0.72, '@yourbrand', 30 * s, { font: 'Montserrat', bold: 700, color: p.ink, ls: 120 }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'event', name: 'Webinar / Event', cat: 'Announcement', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, p.bg), K.wave(W, H, H * (g.land ? 0.82 : 0.86), 40 * s, p.a, true)];
      var r = m * (g.land ? 0.27 : g.tall ? 0.2 : 0.15), cx = g.land ? W * 0.76 : W / 2, cy = g.land ? H * 0.46 : H * (g.tall ? 0.6 : 0.6);
      o.push(C(cx, cy, r + 26 * s, p.c), P(cx - r, cy - r, r * 2, r * 2, 'PHOTO', { shape: 'circle', fill: '#ffffff', label: 'Speaker' }));
      o.push(T(cx - r * 1.4, cy + r + 34 * s, r * 2.8, 'Dr. Ananya Rao', 40 * s, { font: 'Poppins', bold: 700, color: p.ink, align: 'center' }), T(cx - r * 1.4, cy + r + 84 * s, r * 2.8, 'Career coach', 28 * s, { font: 'Poppins', color: p.a, align: 'center' }));
      var x = g.land ? W * 0.07 : W * 0.08, w = g.land ? W * 0.5 : W * 0.84, top = g.land ? H * 0.1 : H * 0.06, bot = g.land ? H * 0.78 : cy - r - 40 * s;
      o = o.concat(K.stack(x, w, top, bot, [
        { text: 'FREE LIVE WEBINAR', size: 34, font: 'Montserrat', bold: 800, color: p.b, ls: 260, gap: 12, align: g.land ? 'left' : 'center' },
        { text: 'How to crack your first job interview', size: 96, font: 'Poppins', bold: 800, color: p.ink, lh: 1.08, gap: 16, align: g.land ? 'left' : 'center' },
        { text: 'Sunday, 15 Nov  ·  7:00 PM', size: 40, font: 'Poppins', bold: 600, color: p.a, gap: 0, align: g.land ? 'left' : 'center' }
      ], { maxK: g.s * 1.1 }));
      o.push(T(W * 0.08, H - (g.land ? 0.1 : 0.08) * H, W * 0.84, 'Register free · link in bio', 32 * s, { font: 'Poppins', bold: 700, color: '#ffffff', align: g.land ? 'left' : 'center' }));
      return { pages: [{ bg: p.bg, objects: o }] };
    } },
    { id: 'diwali', name: 'Festival Greeting', cat: 'Wishes & Festivals', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, m = g.m, bg = '#2a0a12', o = [R(0, 0, W, H, K.G(170, '#3b0d1a', bg))];
      o = o.concat(K.mandala(W / 2, g.land ? H * 0.5 : H * 0.3, m * 0.36, '#f59e0b', '#fde68a', 0.22));
      o.push(A('toran', 0, 0, W, W * 0.12, { fit: 'stretch' }));
      var dw = m * 0.22; o.push(A('diya', W / 2 - dw / 2, g.land ? H * 0.68 : H * 0.72, dw, dw * 0.7));
      o = o.concat(K.stack(W * 0.1, W * 0.8, g.land ? H * 0.18 : H * 0.38, g.land ? H * 0.66 : H * 0.7, [
        { text: 'Wishing you a very', size: 40, font: 'Poppins', color: '#fde68a', gap: 6 },
        { text: 'Happy Diwali', size: 170, font: 'Great Vibes', color: '#fbbf24', gap: 10, shadow: { b: 24, c: 'rgba(251,191,36,.6)' } },
        { text: 'May the festival of lights fill your home with joy', size: 36, font: 'Poppins', color: '#fff7ed', lh: 1.4, gap: 0 }
      ], { maxK: g.s * 1.1 }));
      o.push(T(W * 0.1, H * 0.93, W * 0.8, '— From the Sharma family', 30 * s, { font: 'Poppins', bold: 600, color: '#fde68a', align: 'center' }));
      return { pages: [{ bg: bg, objects: o }] };
    }, pals: ['sunset'] },
    { id: 'thumb', name: 'Thumbnail Punch', cat: 'YouTube & Video', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, o = [R(0, 0, W, H, p.ink === '#f8fafc' ? '#0b1020' : '#111827')];
      var pb = g.land ? { x: W * 0.5, y: 0, w: W * 0.5, h: H } : { x: 0, y: H * 0.44, w: W, h: H * 0.56 };
      o.push(P(pb.x, pb.y, pb.w, pb.h, 'PHOTO', { fill: '#374151', label: 'Your photo' }));
      var x = W * 0.05, w = g.land ? W * 0.52 : W * 0.9, top = H * 0.06, bot = g.land ? H * 0.94 : H * 0.42;
      o = o.concat(K.stack(x, w, top, bot, [
        { text: '10 TIPS', size: 120, font: 'Anton', color: '#111827', bg: p.acc, gap: 12, align: 'left' },
        { text: 'NOBODY\nTELLS YOU', size: 190, font: 'Anton', color: '#ffffff', stroke: '#000000', sw: 6, lh: 0.98, gap: 0, align: 'left', shadow: { x: 8, y: 8, b: 0, c: p.a } }
      ], { maxK: g.s * 1.2 }));
      return { pages: [{ bg: '#111827', objects: o }] };
    } },
    { id: 'hiring', name: 'We Are Hiring', cat: 'Business', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, p.bg), C(W, 0, m * 0.5, p.c), C(0, H, m * 0.4, p.c)];
      o.push(A('dots', W * 0.72, H * 0.06, m * 0.22, m * 0.22, { cols: [p.a], op: 0.5 }));
      var st = K.stack(W * 0.09, W * 0.82, H * 0.08, H * (g.land ? 0.6 : 0.56), [
        { text: 'JOIN OUR TEAM', size: 36, font: 'Montserrat', bold: 800, color: p.b, ls: 300, gap: 12, align: 'left' },
        { text: 'We are\nhiring!', size: 180, font: 'Montserrat', bold: 800, color: p.a, lh: 1, gap: 0, align: 'left' }
      ], { maxK: g.s * 1.1, valign: 'top' });
      o = o.concat(st);
      var roles = ['Graphic Designer', 'Sales Executive', 'Computer Operator'], ry = Math.max(st.endY + 30 * s, H * 0.6), rh = Math.min(84 * s, (H * 0.86 - ry) / roles.length);
      roles.forEach(function (r, i) { o.push(C(W * 0.11, ry + i * rh + rh * 0.4, 12 * s, p.acc), T(W * 0.14, ry + i * rh + rh * 0.4 - 24 * s, W * 0.7, r, 40 * s, { font: 'Poppins', bold: 600, color: p.ink })); });
      o.push(T(W * 0.09, H * 0.9, W * 0.82, 'Send CV: jobs@yourcompany.com', 32 * s, { font: 'Poppins', bold: 700, color: p.a }));
      return { pages: [{ bg: p.bg, objects: o }] };
    } },
    { id: 'aesthetic', name: 'Good Vibes Pastel', cat: 'Aesthetic', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, K.G(160, p.bg, p.c))];
      o.push(A('bouquet', -m * 0.04, -m * 0.04, m * 0.42, m * 0.42, { cols: p.f }), A('bouquet', W - m * 0.36, H - m * 0.36, m * 0.4, m * 0.4, { cols: p.f, flipX: true, flipY: true }));
      o.push(A('butterfly', W * 0.76, H * 0.16, 90 * s, 72 * s, { cols: [p.a, p.c] }), A('sparkles', W * 0.12, H * 0.74, 80 * s, 80 * s, { cols: [p.acc] }));
      o.push(R(W * 0.16, H * 0.3, W * 0.68, H * 0.4, 'rgba(255,255,255,0.78)', { r: 40 * s, shadow: { y: 10, b: 30, c: 'rgba(0,0,0,.08)' } }));
      o = o.concat(K.stack(W * 0.2, W * 0.6, H * 0.33, H * 0.67, [
        { text: 'good vibes', size: 120, font: 'Pacifico', color: p.a, gap: 4 },
        { text: 'ONLY', size: 50, font: 'Montserrat', bold: 800, color: p.ink, ls: 600, gap: 0 }
      ], { maxK: g.s * 1.1 }));
      return { pages: [{ bg: p.bg, objects: o }] };
    } },
    { id: 'product', name: 'Product Spotlight', cat: 'Sale & Offers', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, p.bg)];
      var cw = m * (g.land ? 0.66 : 0.56), cx = g.land ? W * 0.7 : W / 2, cy = g.land ? H / 2 : H * 0.36;
      o.push(C(cx, cy, cw * 0.62, p.c), A('scallop', cx - cw * 0.66, cy - cw * 0.66, cw * 1.32, cw * 1.32, { cols: [p.c], op: 0.6 }));
      o.push(P(cx - cw / 2, cy - cw / 2, cw, cw, 'PHOTO', { r: 28 * s, fill: '#ffffff', label: 'Product photo', shadow: { y: 16, b: 40, c: 'rgba(0,0,0,.15)' } }));
      var x = g.land ? W * 0.06 : W * 0.08, w = g.land ? W * 0.36 : W * 0.84, top = g.land ? H * 0.12 : cy + cw * 0.62, bot = g.land ? H * 0.88 : H * 0.95;
      o = o.concat(K.stack(x, w, top, bot, [
        { text: 'NEW ARRIVAL', size: 32, font: 'Montserrat', bold: 800, color: p.b, ls: 300, gap: 10, align: g.land ? 'left' : 'center' },
        { text: 'Handmade Silk Saree', size: 92, font: 'Playfair Display', bold: 700, color: p.ink, lh: 1.08, gap: 14, align: g.land ? 'left' : 'center' },
        { text: '₹1,499  ·  Free delivery', size: 44, font: 'Poppins', bold: 700, color: p.a, gap: 0, align: g.land ? 'left' : 'center' }
      ], { maxK: g.s * 1.1 }));
      return { pages: [{ bg: p.bg, objects: o }] };
    } },
    { id: 'tips', name: 'Carousel Tips', cat: 'Business', build: function (W, H, p) {
      var g = geo(W, H), s = g.s, mk = function (n, title, body) {
        var o = [R(0, 0, W, H, p.bg), R(0, 0, W, 16 * s, p.a), T(W * 0.08, H * 0.06, W * 0.4, n, 140 * s, { font: 'Anton', color: p.c, lh: 1 })];
        o = o.concat(K.stack(W * 0.08, W * 0.84, H * 0.26, H * 0.84, [
          { text: title, size: 100, font: 'Montserrat', bold: 800, color: p.ink, lh: 1.05, gap: 24, align: 'left' },
          { text: body, size: 44, font: 'Poppins', color: p.ink, lh: 1.45, gap: 0, align: 'left' }
        ], { maxK: g.s * 1.1 }));
        o.push(T(W * 0.08, H * 0.9, W * 0.5, '@yourbrand', 30 * s, { font: 'Montserrat', bold: 700, color: p.a }), T(W * 0.5, H * 0.9, W * 0.42, 'Swipe →', 30 * s, { font: 'Montserrat', bold: 700, color: p.a, align: 'right' }));
        return { bg: p.bg, objects: o };
      };
      return { pageNames: ['Slide 1', 'Slide 2', 'Slide 3'], pages: [
        mk('01', 'Plan your day the night before', 'Write your top 3 tasks. You wake up knowing exactly what matters.'),
        mk('02', 'Do the hardest task first', 'Your energy is highest in the morning — use it where it counts.'),
        mk('03', 'Take short breaks', 'Work 50 minutes, rest 10. Your focus will thank you.')
      ] };
    } }
  ];
  var PK = { sale: ['candy', 'ocean', 'sunset', 'lilac'], quote: ['candy', 'lilac', 'forest', 'ocean'], launch: ['lilac', 'candy', 'ocean'], bday: ['candy', 'lilac', 'ocean'], food: ['sunset', 'forest', 'lemon'], minimal: ['lemon', 'candy', 'ocean', 'forest'], event: ['ocean', 'lilac', 'forest'], diwali: ['sunset'], thumb: ['sunset', 'ocean', 'candy'], hiring: ['ocean', 'forest', 'lilac'], aesthetic: ['candy', 'lilac', 'forest'], product: ['candy', 'sunset', 'lilac'], tips: ['ocean', 'candy', 'lemon'] };
  var out = [];
  layouts.forEach(function (L) { PK[L.id].forEach(function (k, i) { out.push({ id: 'soc-' + L.id + '-' + k, name: L.name + (i ? ' · ' + k[0].toUpperCase() + k.slice(1) : ''), cat: L.cat, sizes: L.id === 'thumb' ? ['yt', 'hd', 'sq', 'story'] : SZ, pal: PAL[k], build: L.build }); }); });
  [].unshift.apply(ST.templates, out);
  ST.SOCIAL_CATS = ['Sale & Offers', 'Quotes', 'Announcement', 'Wishes & Festivals', 'Business', 'Aesthetic', 'YouTube & Video'];
})();
