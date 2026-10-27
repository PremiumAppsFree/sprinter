/* S Printer — more everyday templates for Editing Tool S: logos, visiting cards, invitations,
 * flyers, presentations, channel banners and many social posts. Original designs by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, C = K.C, P = K.P, A = K.A, L = K.L;
  var PAL = {
    royal: { bg: '#f5f3ff', a: '#4c1d95', b: '#7c3aed', c: '#ddd6fe', ink: '#1e1b4b', acc: '#f59e0b', dk: '#1e1b4b', f: ['#ede9fe', '#c4b5fd', '#7c3aed', '#9fb7a2', '#fbcfe8', '#ffffff'] },
    teal: { bg: '#f0fdfa', a: '#115e59', b: '#14b8a6', c: '#ccfbf1', ink: '#042f2e', acc: '#f97316', dk: '#042f2e', f: ['#ccfbf1', '#5eead4', '#0d9488', '#86c5a4', '#fde68a', '#ffffff'] },
    coral: { bg: '#fff5f2', a: '#c2410c', b: '#fb7185', c: '#ffe4e6', ink: '#3f1d12', acc: '#0ea5e9', dk: '#3f1d12', f: ['#ffe4e6', '#fda4af', '#e11d48', '#8fb996', '#fed7aa', '#ffffff'] },
    gold: { bg: '#fffbeb', a: '#78350f', b: '#b45309', c: '#fde68a', ink: '#1c1917', acc: '#b91c1c', dk: '#1c1917', f: ['#fef3c7', '#fcd34d', '#b45309', '#8fb996', '#fde2e4', '#ffffff'] },
    navy: { bg: '#f1f5f9', a: '#0f172a', b: '#2563eb', c: '#dbeafe', ink: '#0f172a', acc: '#facc15', dk: '#0f172a', f: ['#dbeafe', '#93c5fd', '#1d4ed8', '#86c5a4', '#fef3c7', '#ffffff'] },
    blush: { bg: '#fff1f5', a: '#9d174d', b: '#ec4899', c: '#fce7f3', ink: '#3b0a24', acc: '#a78bfa', dk: '#3b0a24', f: ['#fde2e4', '#f9a8d4', '#db2777', '#8fb996', '#fbcfe8', '#ffffff'] },
    forest: { bg: '#f0fdf4', a: '#14532d', b: '#16a34a', c: '#dcfce7', ink: '#052e16', acc: '#eab308', dk: '#052e16', f: ['#fde2e4', '#f4a6b7', '#d36a85', '#4d9a6a', '#fff1c1', '#ffffff'] },
    noir: { bg: '#111827', a: '#f9fafb', b: '#f59e0b', c: '#1f2937', ink: '#f9fafb', acc: '#f43f5e', dk: '#030712', f: ['#374151', '#f59e0b', '#fbbf24', '#9ca3af', '#fde68a', '#ffffff'] }
  };
  function geo(W, H) { var r = W / H; return { m: Math.min(W, H), s: Math.min(W, H) / 1080, land: r > 1.25, tall: r < 0.7 }; }
  function stack(x, w, top, bot, items, s, o) { return K.stack(x, w, top, bot, items, Object.assign({ maxK: s * 1.12 }, o || {})); }
  function pill(x, y, w, h, fill, text, size, col, font) { return [R(x, y, w, h, fill, { r: h / 2 }), T(x, y + (h - size * 1.2) / 2, w, text, size, { font: font || 'Poppins', bold: 700, color: col, align: 'center', ls: 60 })]; }
  var SOC = ['sq', 'igp', 'story', 'fbpost'];
  var out = [];
  function add(id, name, cat, sizes, pals, build) { pals.forEach(function (k, i) { out.push({ id: 'mor-' + id + '-' + k, name: name + (i ? ' · ' + k[0].toUpperCase() + k.slice(1) : ''), cat: cat, sizes: sizes, pal: PAL[k], build: build }); }); }

  // ================= LOGOS (500 × 500) =================
  add('lbadge', 'Circle Badge Logo', 'Logos', ['logo', 'sq'], ['royal', 'teal', 'coral', 'noir'], function (W, H, p) {
    var m = Math.min(W, H), s = m / 500, cx = W / 2, cy = H / 2, o = [R(0, 0, W, H, '#ffffff')];
    o.push(C(cx, cy, m * 0.44, p.a), C(cx, cy, m * 0.4, null, { stroke: '#ffffff', sw: 3 * s, dash: [2 * s, 6 * s] }), C(cx, cy, m * 0.3, p.b));
    o.push(T(cx - m * 0.3, cy - m * 0.2, m * 0.6, 'S', 150 * s, { font: 'Playfair Display', bold: 700, color: '#ffffff', align: 'center', lh: 1 }));
    o.push(T(cx - m * 0.4, cy + m * 0.13, m * 0.8, 'STUDIO', 26 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'center', ls: 500 }));
    o.push(A('star', cx - m * 0.33, cy - 10 * s, 18 * s, 18 * s, { cols: [p.acc] }), A('star', cx + m * 0.33 - 18 * s, cy - 10 * s, 18 * s, 18 * s, { cols: [p.acc] }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('lmono', 'Monogram Logo', 'Logos', ['logo', 'sq'], ['gold', 'navy', 'blush', 'noir'], function (W, H, p) {
    var m = Math.min(W, H), s = m / 500, o = [R(0, 0, W, H, p.bg)];
    o.push(R(W / 2 - m * 0.3, H / 2 - m * 0.36, m * 0.6, m * 0.6, null, { stroke: p.a, sw: 3 * s }), R(W / 2 - m * 0.27, H / 2 - m * 0.33, m * 0.54, m * 0.54, null, { stroke: p.b, sw: 1.2 * s }));
    o.push(T(W / 2 - m * 0.3, H / 2 - m * 0.3, m * 0.6, 'A&R', 120 * s, { font: 'Cinzel', bold: 700, color: p.a, align: 'center', lh: 1 }));
    o.push(T(W / 2 - m * 0.45, H / 2 + m * 0.28, m * 0.9, 'ANAYA & RIDHI', 26 * s, { font: 'Cormorant Garamond', bold: 700, color: p.ink, align: 'center', ls: 300 }));
    o.push(T(W / 2 - m * 0.45, H / 2 + m * 0.36, m * 0.9, 'BOUTIQUE · EST. 2026', 15 * s, { font: 'Montserrat', bold: 600, color: p.b, align: 'center', ls: 300 }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('lleaf', 'Organic Leaf Logo', 'Logos', ['logo', 'sq'], ['forest', 'teal', 'gold'], function (W, H, p) {
    var m = Math.min(W, H), s = m / 500, o = [R(0, 0, W, H, '#ffffff')];
    o.push(C(W / 2, H * 0.36, m * 0.2, p.c), A('sprig', W / 2 - m * 0.1, H * 0.2, m * 0.2, m * 0.32, { cols: [p.a] }));
    o.push(T(W * 0.05, H * 0.6, W * 0.9, 'Green Leaf', 64 * s, { font: 'Playfair Display', bold: 700, color: p.a, align: 'center' }));
    o.push(T(W * 0.05, H * 0.76, W * 0.9, 'NATURAL · ORGANIC', 20 * s, { font: 'Montserrat', bold: 700, color: p.b, align: 'center', ls: 400 }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('lmodern', 'Bold Modern Logo', 'Logos', ['logo', 'sq'], ['royal', 'coral', 'navy', 'teal'], function (W, H, p) {
    var m = Math.min(W, H), s = m / 500, o = [R(0, 0, W, H, '#ffffff')];
    o.push(R(W / 2 - 90 * s, H * 0.18, 180 * s, 180 * s, K.G(135, p.b, p.a), { r: 44 * s, shadow: { y: 10 * s, b: 24 * s, c: 'rgba(0,0,0,.18)' } }));
    o.push(T(W / 2 - 90 * s, H * 0.18 + 22 * s, 180 * s, 'P', 120 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'center', lh: 1 }));
    o.push(T(W * 0.05, H * 0.6, W * 0.9, 'pixelwave', 62 * s, { font: 'Poppins', bold: 700, color: p.ink, align: 'center' }));
    o.push(T(W * 0.05, H * 0.76, W * 0.9, 'digital studio', 22 * s, { font: 'Poppins', color: p.b, align: 'center', ls: 200 }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('lcafe', 'Cafe Stamp Logo', 'Logos', ['logo', 'sq'], ['gold', 'noir', 'coral'], function (W, H, p) {
    var m = Math.min(W, H), s = m / 500, o = [R(0, 0, W, H, p.bg)];
    o = o.concat(K.burst(W / 2, H / 2, m * 0.45, m * 0.42, 36, p.a));
    o.push(C(W / 2, H / 2, m * 0.37, p.bg), C(W / 2, H / 2, m * 0.34, null, { stroke: p.a, sw: 2.5 * s }));
    o.push(T(W * 0.15, H * 0.3, W * 0.7, 'DAILY', 30 * s, { font: 'Montserrat', bold: 800, color: p.b, align: 'center', ls: 500 }));
    o.push(T(W * 0.12, H * 0.38, W * 0.76, 'Brew', 110 * s, { font: 'Pacifico', color: p.a, align: 'center', lh: 1 }));
    o.push(T(W * 0.15, H * 0.64, W * 0.7, 'COFFEE · SINCE 2026', 18 * s, { font: 'Montserrat', bold: 700, color: p.a, align: 'center', ls: 200 }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });

  // ================= VISITING CARDS (89 × 51 mm, front + back) =================
  function cardBack(W, H, p, s, dark) {
    var bg = dark ? p.a : '#ffffff', ink = dark ? '#ffffff' : p.ink;
    return { bg: bg, objects: [R(0, 0, W, H, bg), A('bouquet', -W * 0.02, H * 0.55, H * 0.5, H * 0.5, { cols: p.f, op: dark ? 0 : 0.0 }), T(W * 0.1, H * 0.34, W * 0.8, 'pixelwave', 74 * s, { font: 'Poppins', bold: 700, color: ink, align: 'center' }), T(W * 0.1, H * 0.54, W * 0.8, 'design · print · web', 26 * s, { font: 'Poppins', color: dark ? p.c : p.b, align: 'center', ls: 200 })] };
  }
  function contact(x, y, w, s, ink, acc) {
    var rows = [['ic-phone', '+91 98765 43210'], ['ic-mail', 'hello@pixelwave.in'], ['ic-globe', 'www.pixelwave.in'], ['ic-home', 'MG Road, Jaipur']], o = [];
    rows.forEach(function (r, i) { o.push(A(r[0], x, y + i * 46 * s, 30 * s, 30 * s, { cols: [acc] }), T(x + 44 * s, y + i * 46 * s + 2 * s, w - 44 * s, r[1], 24 * s, { font: 'Poppins', color: ink })); });
    return o;
  }
  add('vcorp', 'Corporate Visiting Card', 'Visiting Cards', ['bcard'], ['navy', 'teal', 'royal'], function (W, H, p) {
    var s = W / 1051, o = [R(0, 0, W, H, '#ffffff'), K.POLY([[W * 0.62, 0], [W, 0], [W, H], [W * 0.5, H]], p.a), K.POLY([[W * 0.58, 0], [W * 0.62, 0], [W * 0.5, H], [W * 0.46, H]], p.b)];
    o.push(T(60 * s, 70 * s, W * 0.45, 'Rohan Mehta', 56 * s, { font: 'Montserrat', bold: 800, color: p.ink }), T(60 * s, 140 * s, W * 0.45, 'Creative Director', 26 * s, { font: 'Poppins', color: p.b, ls: 80 }));
    o = o.concat(contact(60 * s, 250 * s, W * 0.45, s, p.ink, p.b));
    o.push(T(W * 0.62, H * 0.38, W * 0.34, 'pixelwave', 54 * s, { font: 'Poppins', bold: 700, color: '#ffffff', align: 'center' }), T(W * 0.62, H * 0.52, W * 0.34, 'DESIGN STUDIO', 20 * s, { font: 'Montserrat', bold: 700, color: p.c, align: 'center', ls: 300 }));
    return { pageNames: ['Front', 'Back'], pages: [{ bg: '#ffffff', objects: o }, cardBack(W, H, p, s, true)] };
  });
  add('vmin', 'Minimal Visiting Card', 'Visiting Cards', ['bcard'], ['noir', 'gold', 'forest'], function (W, H, p) {
    var s = W / 1051, bg = p.bg, o = [R(0, 0, W, H, bg), L(60 * s, H * 0.5, W - 60 * s, H * 0.5, p.b, 1.5 * s)];
    o.push(T(60 * s, H * 0.22, W * 0.6, 'Ananya Rao', 58 * s, { font: 'Playfair Display', bold: 700, color: p.ink }), T(60 * s, H * 0.36, W * 0.6, 'ARCHITECT', 20 * s, { font: 'Montserrat', bold: 700, color: p.b, ls: 500 }));
    o.push(T(60 * s, H * 0.58, W * 0.45, '+91 98765 43210\nananya@studio.in', 24 * s, { font: 'Poppins', color: p.ink, lh: 1.6 }), T(W * 0.5, H * 0.58, W * 0.5 - 60 * s, 'www.raostudio.in\nPune, India', 24 * s, { font: 'Poppins', color: p.ink, lh: 1.6, align: 'right' }));
    return { pageNames: ['Front', 'Back'], pages: [{ bg: bg, objects: o }, { bg: p.b, objects: [R(0, 0, W, H, p.b), T(0, H * 0.36, W, 'AR', 120 * s, { font: 'Playfair Display', bold: 700, color: bg, align: 'center', lh: 1 })] }] };
  });
  add('vgrad', 'Gradient Visiting Card', 'Visiting Cards', ['bcard'], ['royal', 'coral', 'teal'], function (W, H, p) {
    var s = W / 1051, o = [R(0, 0, W, H, K.G(120, p.b, p.a)), C(W * 0.95, H * 0.05, H * 0.5, '#ffffff', { op: 0.1 }), C(W * 0.05, H, H * 0.4, '#ffffff', { op: 0.08 })];
    o.push(T(70 * s, 80 * s, W * 0.7, 'Kabir Singh', 60 * s, { font: 'Poppins', bold: 700, color: '#ffffff' }), T(70 * s, 152 * s, W * 0.7, 'Photographer · Filmmaker', 26 * s, { font: 'Poppins', color: p.c }));
    o = o.concat(contact(70 * s, 250 * s, W * 0.7, s, '#ffffff', '#ffffff'));
    return { pageNames: ['Front', 'Back'], pages: [{ bg: p.a, objects: o }, { bg: '#ffffff', objects: [R(0, 0, W, H, '#ffffff'), C(W / 2, H * 0.42, H * 0.2, K.G(120, p.b, p.a)), T(0, H * 0.42 - 60 * s, W, 'K', 110 * s, { font: 'Poppins', bold: 700, color: '#ffffff', align: 'center', lh: 1 }), T(0, H * 0.72, W, 'KABIR SINGH PHOTOGRAPHY', 22 * s, { font: 'Montserrat', bold: 700, color: p.a, align: 'center', ls: 300 })] }] };
  });
  add('vflor', 'Floral Visiting Card', 'Visiting Cards', ['bcard'], ['blush', 'royal', 'forest'], function (W, H, p) {
    var s = W / 1051, o = [R(0, 0, W, H, p.bg), A('bouquet', W - H * 0.62, -H * 0.06, H * 0.66, H * 0.66, { cols: p.f, flipX: true }), A('sprig', -10 * s, H * 0.62, H * 0.28, H * 0.42, { cols: ['#8fb996'] })];
    o.push(T(80 * s, 90 * s, W * 0.6, 'Meera Kapoor', 64 * s, { font: 'Great Vibes', color: p.a }), T(80 * s, 175 * s, W * 0.6, 'MAKEUP ARTIST', 22 * s, { font: 'Montserrat', bold: 700, color: p.b, ls: 400 }));
    o = o.concat(contact(80 * s, 260 * s, W * 0.6, s, p.ink, p.b));
    return { pageNames: ['Front', 'Back'], pages: [{ bg: p.bg, objects: o }, { bg: p.c, objects: [R(0, 0, W, H, p.c), A('wreath', W / 2 - H * 0.35, H * 0.15, H * 0.7, H * 0.7, { cols: p.f.slice(0, 5) }), T(0, H * 0.4, W, 'MK', 80 * s, { font: 'Cinzel', bold: 700, color: p.a, align: 'center', lh: 1 })] }] };
  });

  // ================= INVITATIONS (5 × 7 in) =================
  add('ibday', 'Birthday Party Invitation', 'Invitations', ['inv', 'a5p', 'story'], ['blush', 'royal', 'teal'], function (W, H, p) {
    var g = geo(W, H), s = W / 960, o = [R(0, 0, W, H, p.bg), A('confetti', 0, 0, W, H * 0.3, { cols: [p.a, p.b, p.acc, p.c], fit: 'stretch' }), A('confetti', 0, H * 0.75, W, H * 0.25, { cols: [p.a, p.b, p.acc, p.c], fit: 'stretch', flipY: true })];
    o.push(R(W * 0.08, H * 0.16, W * 0.84, H * 0.68, '#ffffff', { r: 30 * s, shadow: { y: 10, b: 30, c: 'rgba(0,0,0,.08)' } }));
    o = o.concat(stack(W * 0.14, W * 0.72, H * 0.2, H * 0.8, [
      { text: "YOU'RE INVITED TO", size: 34, font: 'Montserrat', bold: 800, color: p.b, ls: 300, gap: 10 },
      { text: "Aarav's", size: 120, font: 'Pacifico', color: p.a, gap: 0 },
      { text: '5th Birthday', size: 96, font: 'Fredoka', bold: 700, color: p.ink, gap: 20 },
      { div: p.b, w: 200 * s, gap: 20 },
      { text: 'Saturday, 12 December 2026\n5:00 PM onwards', size: 40, font: 'Poppins', bold: 600, color: p.ink, lh: 1.4, gap: 16 },
      { text: 'Fun Zone, City Mall, Jaipur', size: 36, font: 'Poppins', color: p.b, gap: 14 },
      { text: 'RSVP: Neha · 98765 43210', size: 30, font: 'Poppins', color: p.ink, gap: 0 }
    ], s));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('ibaby', 'Baby Shower Invitation', 'Invitations', ['inv', 'a5p', 'story'], ['teal', 'blush', 'gold'], function (W, H, p) {
    var s = W / 960, o = [R(0, 0, W, H, K.G(180, p.c, '#ffffff')), A('cloud', W * 0.05, H * 0.06, W * 0.3, W * 0.18, { cols: ['#ffffff'] }), A('cloud', W * 0.62, H * 0.12, W * 0.32, W * 0.19, { cols: ['#ffffff'] }), A('moon', W * 0.42, H * 0.05, W * 0.16, W * 0.16, { cols: [p.acc] })];
    for (var i = 0; i < 9; i++) o.push(A('star', (i * 131) % (W - 40 * s), H * 0.25 + ((i * 97) % 120) * s, 24 * s, 24 * s, { cols: [p.b], op: 0.6 }));
    o = o.concat(stack(W * 0.1, W * 0.8, H * 0.32, H * 0.9, [
      { text: 'Oh baby!', size: 130, font: 'Great Vibes', color: p.a, gap: 6 },
      { text: 'BABY SHOWER', size: 56, font: 'Montserrat', bold: 800, color: p.ink, ls: 200, gap: 16 },
      { text: 'honouring Pooja Sharma', size: 40, font: 'Cormorant Garamond', italic: true, bold: 700, color: p.b, gap: 26 },
      { text: 'Sunday · 20 December 2026 · 11 AM', size: 36, font: 'Poppins', bold: 600, color: p.ink, gap: 12 },
      { text: 'Sharma Residence, 14 Lake View, Udaipur', size: 32, font: 'Poppins', color: p.ink, gap: 0 }
    ], s));
    return { pages: [{ bg: p.c, objects: o }] };
  });
  add('igriha', 'Griha Pravesh Invitation', 'Invitations', ['inv', 'a5p'], ['gold', 'coral'], function (W, H, p) {
    var s = W / 960, o = [R(0, 0, W, H, '#fff8ec'), A('toran', 0, 0, W, W * 0.14, { fit: 'stretch' }), A('goldframe', W * 0.05, H * 0.08, W * 0.9, H * 0.86, { cols: [p.b] })];
    o = o.concat(K.mandala(W / 2, H * 0.3, W * 0.16, p.b, p.c, 0.5));
    o.push(A('diya', W / 2 - 50 * s, H * 0.27, 100 * s, 70 * s));
    o = o.concat(stack(W * 0.12, W * 0.76, H * 0.42, H * 0.9, [
      { text: '॥ श्री गणेशाय नमः ॥', size: 34, font: 'Yatra One', color: p.acc, gap: 14 },
      { text: 'Griha Pravesh', size: 100, font: 'Great Vibes', color: p.a, gap: 8 },
      { text: 'With the blessings of the Almighty, we invite you to the house-warming ceremony of our new home', size: 32, font: 'Cormorant Garamond', bold: 700, color: p.ink, lh: 1.4, gap: 20 },
      { text: 'Thursday, 26 November 2026 · 10 AM', size: 28, font: 'Poppins', bold: 600, color: p.b, gap: 10 },
      { text: 'B-21, Shanti Nagar, Lucknow', size: 30, font: 'Poppins', color: p.ink, gap: 16 },
      { text: '— Verma Family', size: 32, font: 'Cormorant Garamond', italic: true, bold: 700, color: p.a, gap: 0 }
    ], s));
    return { pages: [{ bg: '#fff8ec', objects: o }] };
  });
  add('ieng', 'Engagement Invitation', 'Invitations', ['inv', 'a5p', 'story'], ['blush', 'royal', 'forest'], function (W, H, p) {
    var s = W / 960, o = [R(0, 0, W, H, '#ffffff'), A('archflowers', W * 0.06, H * 0.03, W * 0.88, H * 0.3, { cols: p.f }), A('rings', W / 2 - 60 * s, H * 0.33, 120 * s, 86 * s, { cols: [p.acc, p.b] })];
    o = o.concat(stack(W * 0.1, W * 0.8, H * 0.47, H * 0.93, [
      { text: 'Save the Date', size: 40, font: 'Montserrat', bold: 700, color: p.b, ls: 300, gap: 12 },
      { text: 'Ishaan & Kavya', size: 110, font: 'Great Vibes', color: p.a, lh: 1.2, gap: 30 },
      { text: 'ARE GETTING ENGAGED', size: 34, font: 'Montserrat', bold: 800, color: p.ink, ls: 200, gap: 18 },
      { text: '14 · 02 · 2027 · 7 PM\nThe Leela Palace, Delhi', size: 34, font: 'Poppins', color: p.ink, lh: 1.5, gap: 0 }
    ], s));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });

  // ================= FLYERS & POSTERS =================
  var FLY = ['a4p', 'a5p', 'igp', 'story'];
  add('fcoach', 'Coaching Admission Flyer', 'Flyers & Posters', FLY, ['navy', 'royal', 'teal'], function (W, H, p) {
    var g = geo(W, H), s = W / 794, o = [R(0, 0, W, H, '#ffffff'), K.wave(W, H, H * 0.36, 40 * s, p.a, false), K.wave(W, H, H * 0.38, 30 * s, p.b, false, { op: 0.35 })];
    o.push(A('gradcap', W * 0.74, H * 0.05, W * 0.2, W * 0.15, { cols: ['#ffffff', p.acc] }));
    o = o.concat(stack(W * 0.07, W * 0.66, H * 0.04, H * 0.3, [
      { text: 'ADMISSION OPEN 2026-27', size: 22, font: 'Montserrat', bold: 800, color: p.acc, ls: 200, gap: 8, align: 'left' },
      { text: 'Bright Future\nClasses', size: 64, font: 'Montserrat', bold: 800, color: '#ffffff', lh: 1, gap: 8, align: 'left' },
      { text: 'Class 6 – 12 · JEE · NEET · Foundation', size: 20, font: 'Poppins', color: '#e2e8f0', gap: 0, align: 'left' }
    ], s));
    var feats = ['Experienced faculty', 'Small batches · 25 students', 'Weekly tests & doubt classes', 'Smart classrooms', 'Scholarship up to 50%'];
    feats.forEach(function (f, i) { var y = H * 0.44 + i * H * 0.065; o.push(C(W * 0.09, y + 14 * s, 13 * s, p.b), T(W * 0.09 - 7 * s, y + 3 * s, 14 * s, '✓', 18 * s, { font: 'Poppins', bold: 700, color: '#ffffff', align: 'center' }), T(W * 0.13, y, W * 0.5, f, 22 * s, { font: 'Poppins', bold: 600, color: p.ink })); });
    o.push(P(W * 0.6, H * 0.42, W * 0.34, H * 0.33, 'PHOTO', { r: 20 * s, fill: p.c, label: 'Photo' }));
    o.push(R(0, H * 0.82, W, H * 0.18, p.a), T(W * 0.06, H * 0.845, W * 0.88, 'Call: 98765 43210 · Near City Hospital, Kota', 22 * s, { font: 'Poppins', bold: 700, color: '#ffffff', align: 'center' }));
    o = o.concat(pill(W * 0.3, H * 0.9, W * 0.4, 46 * s, p.acc, 'ENROLL NOW', 20 * s, p.ink, 'Montserrat'));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('fgym', 'Gym Offer Poster', 'Flyers & Posters', FLY, ['noir', 'coral', 'navy'], function (W, H, p) {
    var s = W / 794, dark = '#0b0f19', o = [R(0, 0, W, H, dark), P(0, 0, W, H * 0.55, 'PHOTO', { fill: '#1f2937', label: 'Gym photo' }), R(0, H * 0.4, W, H * 0.6, K.G(180, 'rgba(11,15,25,0)', dark, dark))];
    o.push(K.POLY([[0, H * 0.5], [W, H * 0.44], [W, H * 0.54], [0, H * 0.6]], p.b));
    o = o.concat(stack(W * 0.07, W * 0.86, H * 0.6, H * 0.86, [
      { text: 'NO PAIN NO GAIN', size: 26, font: 'Montserrat', bold: 800, color: p.b, ls: 400, gap: 6, align: 'left' },
      { text: 'JOIN THE\nPOWER GYM', size: 92, font: 'Anton', color: '#ffffff', lh: 0.95, gap: 12, align: 'left' },
      { text: 'Strength · Cardio · Zumba · Personal training', size: 22, font: 'Poppins', color: '#cbd5e1', gap: 0, align: 'left' }
    ], s));
    o = o.concat(K.burst(W * 0.82, H * 0.66, 88 * s, 76 * s, 18, p.b));
    o.push(T(W * 0.82 - 70 * s, H * 0.66 - 38 * s, 140 * s, '30%\nOFF', 32 * s, { font: 'Anton', color: '#ffffff', align: 'center', lh: 1 }));
    o.push(T(W * 0.07, H * 0.92, W * 0.86, 'Sector 15, Noida  ·  Call 98765 43210', 20 * s, { font: 'Poppins', bold: 600, color: '#ffffff' }));
    return { pages: [{ bg: dark, objects: o }] };
  });
  add('fmenu', 'Restaurant Menu', 'Flyers & Posters', ['a4p', 'a5p', 'story'], ['gold', 'noir', 'forest'], function (W, H, p) {
    var s = W / 794, bg = p.bg, o = [R(0, 0, W, H, bg), R(W * 0.04, H * 0.03, W * 0.92, H * 0.94, null, { stroke: p.b, sw: 2 * s })];
    o = o.concat(stack(W * 0.1, W * 0.8, H * 0.05, H * 0.2, [
      { text: 'Spice Garden', size: 64, font: 'Great Vibes', color: p.a, gap: 2 },
      { text: 'M E N U', size: 26, font: 'Cinzel', bold: 700, color: p.b, ls: 400, gap: 0 }
    ], s));
    var secs = [['Starters', [['Paneer Tikka', '₹220'], ['Veg Spring Roll', '₹160'], ['Hara Bhara Kebab', '₹180']]], ['Main Course', [['Dal Makhani', '₹240'], ['Shahi Paneer', '₹260'], ['Veg Biryani', '₹220'], ['Butter Naan', '₹50']]], ['Desserts & Drinks', [['Gulab Jamun', '₹90'], ['Masala Chai', '₹40'], ['Mango Lassi', '₹80']]]];
    var y = H * 0.22;
    secs.forEach(function (sc) {
      o.push(T(W * 0.1, y, W * 0.8, sc[0], 30 * s, { font: 'Playfair Display', bold: 700, color: p.a })); y += 46 * s;
      sc[1].forEach(function (it) { o.push(T(W * 0.12, y, W * 0.6, it[0], 22 * s, { font: 'Poppins', color: p.ink }), L(W * 0.12, y + 30 * s, W * 0.88, y + 30 * s, p.c, 1 * s, { dash: [3 * s, 4 * s] }), T(W * 0.6, y, W * 0.28, it[1], 22 * s, { font: 'Poppins', bold: 700, color: p.b, align: 'right' })); y += 40 * s; });
      y += 20 * s;
    });
    o.push(T(W * 0.1, H * 0.92, W * 0.8, 'Order on call: 98765 43210 · Free home delivery', 18 * s, { font: 'Poppins', bold: 600, color: p.a, align: 'center' }));
    return { pages: [{ bg: bg, objects: o }] };
  });
  add('fprop', 'Real Estate Flyer', 'Flyers & Posters', FLY, ['navy', 'teal', 'gold'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff'), P(0, 0, W, H * 0.46, 'PHOTO', { fill: p.c, label: 'House photo' }), R(0, H * 0.4, W * 0.62, H * 0.12, p.a)];
    o.push(T(W * 0.06, H * 0.415, W * 0.56, 'DREAM HOME FOR SALE', 30 * s, { font: 'Montserrat', bold: 800, color: '#ffffff' }), T(W * 0.06, H * 0.465, W * 0.56, '3 BHK Villa · Ready to move', 20 * s, { font: 'Poppins', color: p.c }));
    var feats = [['ic-home', '2,400 sq ft'], ['ic-user', '3 Bedrooms'], ['ic-drop', '3 Bathrooms'], ['ic-cal', 'Possession 2026']];
    feats.forEach(function (f, i) { var x = W * 0.06 + (i % 2) * W * 0.44, y = H * 0.57 + Math.floor(i / 2) * 70 * s; o.push(C(x + 24 * s, y + 24 * s, 24 * s, p.c), A(f[0], x + 10 * s, y + 10 * s, 28 * s, 28 * s, { cols: [p.a] }), T(x + 60 * s, y + 10 * s, W * 0.35, f[1], 24 * s, { font: 'Poppins', bold: 600, color: p.ink })); });
    o.push(T(W * 0.06, H * 0.76, W * 0.88, '₹ 1.25 Cr', 64 * s, { font: 'Montserrat', bold: 800, color: p.b }));
    o.push(R(0, H * 0.88, W, H * 0.12, p.a), T(W * 0.06, H * 0.91, W * 0.88, 'Rahul Properties · 98765 43210 · Gurugram', 22 * s, { font: 'Poppins', bold: 700, color: '#ffffff', align: 'center' }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('fmusic', 'Music Night Poster', 'Flyers & Posters', FLY, ['royal', 'coral', 'noir'], function (W, H, p) {
    var s = W / 794, dark = '#0f0a1f', o = [R(0, 0, W, H, K.G(160, dark, p.a))];
    for (var i = 0; i < 6; i++) o.push(C(W / 2, H * 0.38, (80 + i * 55) * s, null, { stroke: p.b, sw: 2 * s, op: 0.5 - i * 0.07 }));
    o.push(P(W / 2 - 120 * s, H * 0.38 - 120 * s, 240 * s, 240 * s, 'PHOTO', { shape: 'circle', fill: '#1f1640', label: 'Artist' }));
    o = o.concat(stack(W * 0.06, W * 0.88, H * 0.62, H * 0.92, [
      { text: 'LIVE IN CONCERT', size: 26, font: 'Montserrat', bold: 800, color: p.b, ls: 500, gap: 8 },
      { text: 'Sufi Night', size: 110, font: 'Pacifico', color: '#ffffff', gap: 10, shadow: { b: 30, c: p.b } },
      { text: 'SAT · 19 DEC · 8 PM · OPEN AIR THEATRE', size: 24, font: 'Montserrat', bold: 700, color: '#ffffff', ls: 100, gap: 10 },
      { text: 'Tickets ₹499 · BookMyShow', size: 22, font: 'Poppins', color: p.c, gap: 0 }
    ], s));
    return { pages: [{ bg: dark, objects: o }] };
  });

  // ================= PRESENTATIONS (1920 × 1080) =================
  function deck(id, name, pals, theme) {
    add(id, name, 'Presentations', ['hd'], pals, function (W, H, p) {
      var s = W / 1920, bgA = theme === 'grad' ? K.G(120, p.b, p.a) : '#ffffff', ink = theme === 'grad' ? '#ffffff' : p.ink;
      function frame(extra) { var o = [R(0, 0, W, H, theme === 'grad' ? '#ffffff' : p.bg)]; if (theme === 'grad') o.push(R(0, 0, W, 18 * s, K.G(0, p.b, p.a))); else o.push(R(0, 0, 18 * s, H, p.b)); return o.concat(extra); }
      var cover = { bg: theme === 'grad' ? p.a : '#ffffff', objects: [R(0, 0, W, H, bgA), C(W * 0.88, H * 0.1, H * 0.5, theme === 'grad' ? '#ffffff' : p.c, { op: theme === 'grad' ? 0.1 : 1 }), C(W * 0.75, H * 1.05, H * 0.35, theme === 'grad' ? '#ffffff' : p.c, { op: theme === 'grad' ? 0.08 : 0.6 })].concat(stack(W * 0.08, W * 0.6, H * 0.22, H * 0.8, [
        { text: 'COMPANY OVERVIEW 2026', size: 34, font: 'Montserrat', bold: 800, color: theme === 'grad' ? p.c : p.b, ls: 300, gap: 18, align: 'left' },
        { text: 'Growing together, one idea at a time', size: 110, font: 'Montserrat', bold: 800, color: ink, lh: 1.05, gap: 24, align: 'left' },
        { text: 'Presented by Neha Gupta · Marketing Head', size: 34, font: 'Poppins', color: theme === 'grad' ? '#e0e7ff' : '#475569', gap: 0, align: 'left' }
      ], s * 1.0)) };
      var agenda = { bg: '#ffffff', objects: frame([T(W * 0.08, H * 0.1, W * 0.8, 'Agenda', 90 * s, { font: 'Montserrat', bold: 800, color: p.ink })].concat(['Where we are today', 'What our customers say', 'Plan for next year', 'Questions'].reduce(function (a, t, i) { var y = H * 0.32 + i * 140 * s; return a.concat([C(W * 0.1, y + 40 * s, 40 * s, p.b), T(W * 0.1 - 40 * s, y + 14 * s, 80 * s, '0' + (i + 1), 40 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'center' }), T(W * 0.16, y + 12 * s, W * 0.6, t, 52 * s, { font: 'Poppins', bold: 600, color: p.ink })]); }, []))) };
      var stats = { bg: '#ffffff', objects: frame([T(W * 0.08, H * 0.1, W * 0.8, 'Our year in numbers', 80 * s, { font: 'Montserrat', bold: 800, color: p.ink })].concat([['12K+', 'Happy customers'], ['48%', 'Growth'], ['36', 'Cities']].reduce(function (a, st, i) { var x = W * 0.08 + i * W * 0.29; return a.concat([R(x, H * 0.35, W * 0.26, H * 0.42, i === 1 ? K.G(135, p.b, p.a) : p.c, { r: 30 * s }), T(x, H * 0.43, W * 0.26, st[0], 130 * s, { font: 'Montserrat', bold: 800, color: i === 1 ? '#ffffff' : p.a, align: 'center' }), T(x, H * 0.62, W * 0.26, st[1], 40 * s, { font: 'Poppins', bold: 600, color: i === 1 ? '#ffffff' : p.ink, align: 'center' })]); }, []))) };
      var photo = { bg: '#ffffff', objects: frame([P(W * 0.52, 0, W * 0.48, H, 'PHOTO', { fill: p.c, label: 'Photo' })].concat(stack(W * 0.08, W * 0.38, H * 0.18, H * 0.82, [
        { text: 'WHAT CUSTOMERS SAY', size: 30, font: 'Montserrat', bold: 800, color: p.b, ls: 200, gap: 16, align: 'left' },
        { text: '“The team understood exactly what we needed and delivered on time.”', size: 64, font: 'Playfair Display', italic: true, bold: 600, color: p.ink, lh: 1.25, gap: 24, align: 'left' },
        { text: '— Amit Verma, Owner, Verma Sweets', size: 34, font: 'Poppins', color: '#475569', gap: 0, align: 'left' }
      ], s))) };
      var end = { bg: p.a, objects: [R(0, 0, W, H, K.G(120, p.b, p.a)), T(0, H * 0.34, W, 'Thank you!', 160 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'center' }), T(0, H * 0.56, W, 'neha@company.in · 98765 43210', 44 * s, { font: 'Poppins', color: '#e0e7ff', align: 'center' })] };
      return { pageNames: ['Cover', 'Agenda', 'Numbers', 'Quote', 'Thanks'], pages: [cover, agenda, stats, photo, end] };
    });
  }
  deck('dclean', 'Clean Business Deck', ['navy', 'teal', 'royal'], 'clean');
  deck('dgrad', 'Bold Gradient Deck', ['royal', 'coral', 'teal'], 'grad');

  // ================= CHANNEL BANNERS & COVERS =================
  add('ytban', 'YouTube Channel Banner', 'Banners & Covers', ['ytbanner', 'fbcover'], ['royal', 'coral', 'noir'], function (W, H, p) {
    var s = H / 1440, o = [R(0, 0, W, H, K.G(110, p.a, p.b))], cx = W / 2, safeW = Math.min(W, 1546 * W / 2560);
    for (var i = 0; i < 14; i++) o.push(C((i * 397) % W, (i * 233) % H, (20 + (i % 4) * 30) * s, '#ffffff', { op: 0.06 }));
    o = o.concat(stack(cx - safeW / 2, safeW, H * 0.33, H * 0.67, [
      { text: 'Cooking with Priya', size: 140, font: 'Pacifico', color: '#ffffff', gap: 12 },
      { text: 'NEW RECIPES EVERY SUNDAY · SUBSCRIBE', size: 48, font: 'Montserrat', bold: 800, color: p.c, ls: 200, gap: 0 }
    ], s * 1.33));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('fbcov', 'Business Page Cover', 'Banners & Covers', ['fbcover', 'ytbanner', 'hd'], ['teal', 'navy', 'gold'], function (W, H, p) {
    var s = H / 624, o = [R(0, 0, W, H, p.bg), P(W * 0.55, 0, W * 0.45, H, 'PHOTO', { fill: p.c, label: 'Photo' }), K.POLY([[W * 0.5, 0], [W * 0.62, 0], [W * 0.55, H], [W * 0.43, H]], p.b)];
    o = o.concat(stack(W * 0.05, W * 0.42, H * 0.15, H * 0.85, [
      { text: 'SHREE GANESH CYBER CAFE', size: 26, font: 'Montserrat', bold: 800, color: p.b, ls: 200, gap: 10, align: 'left' },
      { text: 'All online services under one roof', size: 64, font: 'Montserrat', bold: 800, color: p.ink, lh: 1.05, gap: 14, align: 'left' },
      { text: 'Forms · Print · PAN · Aadhaar · Bills', size: 26, font: 'Poppins', color: '#475569', gap: 0, align: 'left' }
    ], s * 1.73));
    return { pages: [{ bg: p.bg, objects: o }] };
  });

  // ================= MORE SOCIAL POSTS =================
  add('spol', 'Polaroid Memories', 'Social Posts', SOC, ['blush', 'gold', 'teal'], function (W, H, p) {
    var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, p.bg)];
    for (var i = 0; i < 3; i++) { var w = m * 0.42, x = W * (0.12 + i * 0.27), y = H * 0.18 + (i % 2) * m * 0.06, ang = [-8, 4, -3][i]; var ra = ang * Math.PI / 180, dd = w * 0.06; o.push(R(x, y, w, w * 1.18, '#ffffff', { angle: ang, shadow: { y: 8, b: 20, c: 'rgba(0,0,0,.15)' } }), P(x + Math.cos(ra) * dd - Math.sin(ra) * dd, y + Math.sin(ra) * dd + Math.cos(ra) * dd, w * 0.88, w * 0.88, 'PHOTO', { angle: ang, fill: p.c, label: 'Photo' })); }
    o.push(A('washi', W * 0.42, H * 0.14, m * 0.18, m * 0.06, { cols: [p.b], op: 0.8 }));
    o = o.concat(stack(W * 0.08, W * 0.84, H * (g.tall ? 0.58 : 0.7), H * 0.95, [
      { text: 'Best Days', size: 120, font: 'Great Vibes', color: p.a, gap: 0 },
      { text: 'SUMMER 2026 · GOA', size: 34, font: 'Montserrat', bold: 800, color: p.ink, ls: 300, gap: 0 }
    ], s));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('stest', 'Customer Testimonial', 'Social Posts', SOC, ['navy', 'royal', 'forest'], function (W, H, p) {
    var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, p.c), R(W * 0.07, H * 0.1, W * 0.86, H * 0.8, '#ffffff', { r: 40 * s, shadow: { y: 14, b: 40, c: 'rgba(0,0,0,.08)' } })];
    o.push(P(W / 2 - 80 * s, H * 0.1 - 60 * s + 60 * s, 160 * s, 160 * s, 'PHOTO', { shape: 'circle', fill: p.c, label: 'Photo' }));
    for (var i = 0; i < 5; i++) o.push(A('star', W / 2 - 150 * s + i * 62 * s, H * 0.1 + 240 * s, 52 * s, 52 * s, { cols: [p.acc] }));
    o = o.concat(stack(W * 0.13, W * 0.74, H * 0.1 + 320 * s, H * 0.86, [
      { text: '“Best service in town! My documents were ready in 10 minutes and the staff was super helpful.”', size: 54, font: 'Playfair Display', italic: true, bold: 600, color: p.ink, lh: 1.3, gap: 26 },
      { text: 'Sunita Devi', size: 40, font: 'Poppins', bold: 700, color: p.a, gap: 4 },
      { text: 'Happy customer', size: 30, font: 'Poppins', color: '#64748b', gap: 0 }
    ], s));
    return { pages: [{ bg: p.c, objects: o }] };
  });
  add('sba', 'Before & After', 'Social Posts', SOC, ['coral', 'teal', 'noir'], function (W, H, p) {
    var g = geo(W, H), s = g.s, top = H * 0.16, bh = H * (g.tall ? 0.62 : 0.68), o = [R(0, 0, W, H, p.bg)];
    o.push(T(0, H * 0.04, W, 'The transformation', 70 * s, { font: 'Montserrat', bold: 800, color: p.ink, align: 'center' }));
    o.push(P(W * 0.05, top, W * 0.44, bh, 'PHOTO', { r: 24 * s, fill: p.c, label: 'Before' }), P(W * 0.51, top, W * 0.44, bh, 'PHOTO', { r: 24 * s, fill: p.c, label: 'After' }));
    o = o.concat(pill(W * 0.05 + 20 * s, top + 20 * s, 180 * s, 56 * s, '#ffffff', 'BEFORE', 26 * s, p.ink, 'Montserrat'), pill(W * 0.51 + 20 * s, top + 20 * s, 160 * s, 56 * s, p.b, 'AFTER', 26 * s, '#ffffff', 'Montserrat'));
    o.push(T(0, top + bh + 30 * s, W, 'Book your makeover · 98765 43210', 38 * s, { font: 'Poppins', bold: 600, color: p.a, align: 'center' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('sprice', 'Price List', 'Social Posts', SOC, ['blush', 'gold', 'navy'], function (W, H, p) {
    var g = geo(W, H), s = g.s, o = [R(0, 0, W, H, p.bg), A('bouquet', -g.m * 0.05, -g.m * 0.05, g.m * 0.3, g.m * 0.3, { cols: p.f })];
    o.push(T(0, H * 0.06, W, 'Price List', 120 * s, { font: 'Great Vibes', color: p.a, align: 'center' }), T(0, H * 0.06 + 150 * s, W, 'GLOW BEAUTY SALON', 34 * s, { font: 'Montserrat', bold: 800, color: p.ink, align: 'center', ls: 300 }));
    var items = [['Haircut & styling', '₹300'], ['Facial (gold)', '₹800'], ['Manicure', '₹400'], ['Pedicure', '₹500'], ['Bridal makeup', '₹8,000'], ['Hair spa', '₹600']], y0 = H * 0.06 + 240 * s, rh = Math.min(100 * s, (H * 0.9 - y0) / items.length);
    items.forEach(function (it, i) { var y = y0 + i * rh; o.push(R(W * 0.1, y, W * 0.8, rh * 0.82, i % 2 ? '#ffffff' : p.c, { r: 18 * s }), T(W * 0.14, y + rh * 0.41 - 24 * s, W * 0.5, it[0], 38 * s, { font: 'Poppins', color: p.ink }), T(W * 0.5, y + rh * 0.41 - 24 * s, W * 0.36, it[1], 40 * s, { font: 'Poppins', bold: 700, color: p.a, align: 'right' })); });
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  function festival(id, name, pals, bgc, title, sub, font, deco) {
    add(id, name, 'Festivals', SOC, pals, function (W, H, p) {
      var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, bgc(p))];
      o = o.concat(deco(W, H, p, m, s, g));
      o = o.concat(stack(W * 0.1, W * 0.8, H * (g.tall ? 0.4 : 0.36), H * 0.86, [
        { text: title, size: deco.size || 150, font: font, bold: deco.bold, color: deco.ink ? deco.ink(p) : '#ffffff', gap: 10, shadow: { b: 20, c: 'rgba(0,0,0,.25)' } },
        { text: sub, size: 40, font: 'Poppins', bold: 500, color: deco.sub ? deco.sub(p) : '#fef3c7', lh: 1.4, gap: 24 },
        { text: '— From all of us at Shree Ganesh Store', size: 32, font: 'Poppins', bold: 600, color: deco.sub ? deco.sub(p) : '#fde68a', gap: 0 }
      ], s));
      return { pages: [{ bg: p.a, objects: o }] };
    });
  }
  festival('feid', 'Eid Mubarak', ['forest', 'teal', 'navy'], function (p) { return K.G(170, p.a, p.dk); }, 'Eid Mubarak', 'May this Eid bring peace, joy and prosperity to your home', 'Great Vibes', function (W, H, p, m, s) {
    var o = [A('moon', W * 0.36, H * 0.07, m * 0.28, m * 0.28, { cols: ['#fde68a'] })]; for (var i = 0; i < 16; i++) o.push(A('sparkle', (i * 211) % W, (i * 137) % (H * 0.35), (16 + i % 3 * 10) * s, (16 + i % 3 * 10) * s, { cols: ['#fde68a'], op: 0.8 })); return o;
  });
  festival('fholi', 'Happy Holi', ['coral', 'royal', 'teal'], function () { return '#ffffff'; }, 'Happy Holi', 'Wishing you a colourful and joyful festival', 'Pacifico', (function () {
    var f = function (W, H, p, m, s) { var cols = ['#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'], o = []; for (var i = 0; i < 9; i++) o.push(A('blob', (i * 0.33 % 1) * W - m * 0.1, ((i * 0.41) % 1) * H - m * 0.1, m * 0.42, m * 0.34, { cols: [cols[i % 6]], op: 0.35, angle: i * 40 })); return o; };
    f.ink = function (p) { return p.a; }; f.sub = function () { return '#374151'; }; return f;
  })());
  festival('find', 'Independence Day', ['navy', 'teal'], function () { return '#ffffff'; }, 'Happy Independence Day', '15 August · Proud to be Indian', 'Montserrat', (function () {
    var f = function (W, H, p, m, s) { return [R(0, 0, W, H * 0.12, '#f97316'), R(0, H * 0.88, W, H * 0.12, '#16a34a'), C(W / 2, H * 0.24, m * 0.1, null, { stroke: '#1e3a8a', sw: 6 * s }), C(W / 2, H * 0.24, m * 0.015, '#1e3a8a')].concat(Array.apply(null, Array(24)).map(function (x, i) { var a = i * Math.PI / 12; return L(W / 2, H * 0.24, W / 2 + Math.cos(a) * m * 0.1, H * 0.24 + Math.sin(a) * m * 0.1, '#1e3a8a', 2 * s); })); };
    f.ink = function () { return '#1e3a8a'; }; f.sub = function () { return '#374151'; }; f.size = 104; f.bold = 800; return f;
  })());
  add('smorn', 'Good Morning', 'Wishes', SOC, ['gold', 'coral', 'teal'], function (W, H, p) {
    var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, K.G(180, p.c, '#ffffff')), C(W / 2, H * 0.92, m * 0.36, p.acc, { op: 0.25 }), C(W / 2, H * 0.92, m * 0.24, p.acc, { op: 0.5 })];
    o.push(A('cloud', W * 0.06, H * 0.12, m * 0.3, m * 0.18, { cols: ['#ffffff'] }), A('cloud', W * 0.6, H * 0.2, m * 0.34, m * 0.2, { cols: ['#ffffff'] }), A('sprig', W * 0.04, H * 0.66, m * 0.2, m * 0.32, { cols: ['#86c5a4'] }));
    o = o.concat(stack(W * 0.1, W * 0.8, H * 0.32, H * 0.62, [
      { text: 'Good Morning', size: 140, font: 'Great Vibes', color: p.a, gap: 8 },
      { text: 'Have a wonderful day ahead', size: 40, font: 'Poppins', color: p.ink, gap: 0 }
    ], s));
    return { pages: [{ bg: p.c, objects: o }] };
  });
  add('stravel', 'Travel Post', 'Social Posts', SOC, ['teal', 'coral', 'navy'], function (W, H, p) {
    var g = geo(W, H), s = g.s, o = [P(0, 0, W, H, 'PHOTO', { fill: p.c, label: 'Travel photo' }), R(0, H * 0.5, W, H * 0.5, K.G(180, 'rgba(0,0,0,0)', 'rgba(0,0,0,.65)'))];
    o = o.concat(stack(W * 0.07, W * 0.86, H * 0.6, H * 0.93, [
      { text: 'EXPLORE', size: 40, font: 'Montserrat', bold: 800, color: p.c, ls: 600, gap: 4, align: 'left' },
      { text: 'Ladakh', size: 170, font: 'Anton', color: '#ffffff', gap: 6, align: 'left' },
      { text: '7 days · Leh · Nubra · Pangong — ₹24,999', size: 36, font: 'Poppins', bold: 600, color: '#ffffff', gap: 0, align: 'left' }
    ], s));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('sfash', 'New Collection', 'Social Posts', SOC, ['noir', 'blush', 'gold'], function (W, H, p) {
    var g = geo(W, H), s = g.s, o = [R(0, 0, W, H, p.bg), P(W * 0.38, H * 0.06, W * 0.56, H * 0.72, 'PHOTO', { fill: p.c, label: 'Model photo' }), R(W * 0.06, H * 0.12, W * 0.04, H * 0.6, p.b)];
    o.push(T(W * 0.14, H * 0.12, W * 0.3, 'NEW', 120 * s, { font: 'Anton', color: p.a, lh: 1 }), T(W * 0.14, H * 0.12 + 130 * s, W * 0.24, 'collection', 60 * s, { font: 'Great Vibes', color: p.b }), T(W * 0.14, H * 0.12 + 230 * s, W * 0.22, 'Festive wear for women & girls', 30 * s, { font: 'Poppins', color: p.ink, lh: 1.4 }));
    o = o.concat(pill(W * 0.14, H * 0.84, W * 0.36, 70 * s, p.a, 'SHOP NOW', 30 * s, p.bg, 'Montserrat'));
    o.push(T(W * 0.52, H * 0.85, W * 0.42, '@riyaboutique', 32 * s, { font: 'Poppins', bold: 600, color: p.ink, align: 'right' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('stip', 'Tip of the Day', 'Social Posts', SOC, ['royal', 'forest', 'coral'], function (W, H, p) {
    var g = geo(W, H), s = g.s, o = [R(0, 0, W, H, p.a), C(W * 0.9, H * 0.08, g.m * 0.3, p.b, { op: 0.5 }), R(W * 0.07, H * 0.24, W * 0.86, H * 0.6, '#ffffff', { r: 36 * s })];
    o.push(A('bulb', W * 0.07, H * 0.06, 110 * s, 110 * s, { cols: [p.acc, '#ffffff'] }), T(W * 0.07 + 130 * s, H * 0.075, W * 0.7, 'TIP OF THE DAY', 54 * s, { font: 'Montserrat', bold: 800, color: '#ffffff' }));
    o = o.concat(stack(W * 0.12, W * 0.76, H * 0.27, H * 0.8, [
      { text: 'Save 20% of your salary first — spend the rest later.', size: 76, font: 'Montserrat', bold: 800, color: p.ink, lh: 1.15, gap: 24 },
      { text: 'Small savings every month grow into big dreams.', size: 38, font: 'Poppins', color: '#475569', gap: 0 }
    ], s));
    o.push(T(W * 0.07, H * 0.9, W * 0.86, '@moneysmart.hindi', 32 * s, { font: 'Poppins', bold: 600, color: '#ffffff', align: 'center' }));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('scount', 'Countdown', 'Social Posts', SOC, ['navy', 'coral', 'royal'], function (W, H, p) {
    var g = geo(W, H), s = g.s, o = [R(0, 0, W, H, K.G(150, p.a, p.dk))];
    for (var i = 0; i < 20; i++) o.push(A('sparkle', (i * 173) % W, (i * 241) % H, (14 + i % 4 * 8) * s, (14 + i % 4 * 8) * s, { cols: ['#ffffff'], op: 0.5 }));
    o = o.concat(stack(W * 0.08, W * 0.84, H * 0.14, H * 0.86, [
      { text: 'ONLY', size: 50, font: 'Montserrat', bold: 800, color: p.c, ls: 600, gap: 0 },
      { text: '3', size: 420, font: 'Anton', color: '#ffffff', lh: 1, gap: 0, shadow: { b: 40, c: p.b } },
      { text: 'DAYS TO GO', size: 80, font: 'Anton', color: p.acc, ls: 100, gap: 20 },
      { text: 'Grand opening · 1 January 2027', size: 38, font: 'Poppins', color: '#e2e8f0', gap: 0 }
    ], s));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('sgive', 'Giveaway', 'Social Posts', SOC, ['coral', 'royal', 'teal'], function (W, H, p) {
    var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, p.b), A('confetti', 0, 0, W, H * 0.4, { cols: ['#ffffff', p.acc, p.c], fit: 'stretch', op: 0.9 })];
    o.push(A('bow', W / 2 - m * 0.16, H * 0.12, m * 0.32, m * 0.22, { cols: [p.acc] }), R(W / 2 - m * 0.2, H * 0.12 + m * 0.18, m * 0.4, m * 0.28, '#ffffff', { r: 16 * s }), R(W / 2 - 18 * s, H * 0.12 + m * 0.18, 36 * s, m * 0.28, p.acc));
    o = o.concat(stack(W * 0.08, W * 0.84, H * 0.12 + m * 0.5, H * 0.95, [
      { text: 'GIVEAWAY', size: 150, font: 'Anton', color: '#ffffff', gap: 10 },
      { text: '1. Follow us  2. Like this post  3. Tag 3 friends', size: 40, font: 'Poppins', bold: 600, color: '#ffffff', gap: 14 },
      { text: 'Winner announced on Sunday!', size: 36, font: 'Poppins', color: p.c, gap: 0 }
    ], s));
    return { pages: [{ bg: p.b, objects: o }] };
  });
  add('swelcome', 'Welcome Board', 'Social Posts', ['sq', 'igp', 'a4p', 'story'], ['blush', 'forest', 'gold'], function (W, H, p) {
    var g = geo(W, H), s = g.s, m = g.m, o = [R(0, 0, W, H, '#ffffff'), A('archframe', W * 0.12, H * 0.08, W * 0.76, H * 0.84, { cols: [p.c], fit: 'stretch' }), A('bouquet', W * 0.06, H * 0.02, m * 0.36, m * 0.36, { cols: p.f }), A('bouquet', W * 0.94 - m * 0.36, H * 0.98 - m * 0.36, m * 0.36, m * 0.36, { cols: p.f, flipX: true, flipY: true })];
    o = o.concat(stack(W * 0.2, W * 0.6, H * 0.28, H * 0.78, [
      { text: 'Welcome', size: 150, font: 'Great Vibes', color: p.a, gap: 8 },
      { text: 'TO THE WEDDING OF', size: 32, font: 'Montserrat', bold: 700, color: p.ink, ls: 300, gap: 12 },
      { text: 'Priya & Rahul', size: 90, font: 'Cormorant Garamond', bold: 700, italic: true, color: p.a, gap: 12 },
      { text: '21 · 11 · 2026', size: 36, font: 'Cinzel', bold: 600, color: p.b, gap: 0 }
    ], s));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });

  [].unshift.apply(ST.templates, out);
})();
