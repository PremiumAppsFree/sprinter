/* S Printer — even more templates for Editing Tool S: YouTube thumbnails, stories, menus, price lists,
 * quotes, sale posts, tickets, gift vouchers, infographics, planners, invoices, recipes, property,
 * coaching, fitness, thank-you cards, wallpapers, newsletters and event schedules.
 * Original designs by S Printer. All names, prices and numbers are sample text to replace. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, C = K.C, P = K.P, A = K.A, L = K.L;
  var PAL = {
    royal: { bg: '#f5f3ff', a: '#4c1d95', b: '#7c3aed', c: '#ddd6fe', ink: '#1e1b4b', acc: '#f59e0b', dk: '#1e1b4b' },
    teal: { bg: '#f0fdfa', a: '#115e59', b: '#14b8a6', c: '#ccfbf1', ink: '#042f2e', acc: '#f97316', dk: '#042f2e' },
    coral: { bg: '#fff5f2', a: '#c2410c', b: '#fb7185', c: '#ffe4e6', ink: '#3f1d12', acc: '#0ea5e9', dk: '#3f1d12' },
    gold: { bg: '#fffbeb', a: '#78350f', b: '#b45309', c: '#fde68a', ink: '#1c1917', acc: '#b91c1c', dk: '#1c1917' },
    navy: { bg: '#f1f5f9', a: '#0f172a', b: '#2563eb', c: '#dbeafe', ink: '#0f172a', acc: '#facc15', dk: '#0f172a' },
    blush: { bg: '#fff1f5', a: '#9d174d', b: '#ec4899', c: '#fce7f3', ink: '#3b0a24', acc: '#8b5cf6', dk: '#3b0a24' },
    forest: { bg: '#f0fdf4', a: '#14532d', b: '#16a34a', c: '#dcfce7', ink: '#052e16', acc: '#eab308', dk: '#052e16' },
    noir: { bg: '#111827', a: '#f9fafb', b: '#f59e0b', c: '#1f2937', ink: '#f9fafb', acc: '#f43f5e', dk: '#030712' },
    sun: { bg: '#fefce8', a: '#1c1917', b: '#facc15', c: '#fef08a', ink: '#1c1917', acc: '#dc2626', dk: '#1c1917' },
    red: { bg: '#fff1f2', a: '#7f1d1d', b: '#dc2626', c: '#fecaca', ink: '#1f1111', acc: '#facc15', dk: '#450a0a' }
  };
  var out = [];
  function add(id, name, cat, sizes, pals, build) { pals.forEach(function (k, i) { out.push({ id: 'plu-' + id + '-' + k, name: name + (i ? ' · ' + k[0].toUpperCase() + k.slice(1) : ''), cat: cat, sizes: sizes, pal: PAL[k], build: build }); }); }
  function g(W, H) { var m = Math.min(W, H); return { m: m, s: m / 1080, land: W / H > 1.25, tall: W / H < 0.7 }; }
  function stack(x, w, top, bot, items, s, o) { return K.stack(x, w, top, bot, items, Object.assign({ maxK: s * 1.15 }, o || {})); }
  function pill(x, y, w, h, fill, text, size, col, font) { return [R(x, y, w, h, fill, { r: h / 2 }), T(x, y + (h - size * 1.22) / 2, w, text, size, { font: font || 'Poppins', bold: 700, color: col, align: 'center', ls: 40 })]; }
  function dark(p) { return p.bg === '#111827'; }
  var SOC = ['sq', 'igp', 'story'];

  // ================= YOUTUBE THUMBNAILS =================
  add('ytbold', 'Bold Tips Thumbnail', 'YouTube Thumbnails', ['yt', 'hd'], ['sun', 'navy', 'red'], function (W, H, p) {
    var s = H / 720, o = [R(0, 0, W, H, p.a)];
    o.push(P(0, 0, W * 0.46, H, 'PHOTO', { sw: 0 }), K.POLY([[W * 0.42, 0], [W * 0.52, 0], [W * 0.46, H], [W * 0.36, H]], p.b));
    o = o.concat(stack(W * 0.52, W * 0.44, H * 0.12, H * 0.88, [{ text: '5 EASY', size: 120, font: 'Anton', color: '#ffffff', lh: 1, gap: 0, align: 'left' }, { text: 'TIPS', size: 190, font: 'Anton', color: p.b, lh: 1, gap: 6, align: 'left' }, { text: 'that nobody tells you', size: 38, font: 'Poppins', bold: 700, color: '#ffffff', align: 'left' }], s, { valign: 'top' }));
    o.push(C(W - 92 * s, 92 * s, 66 * s, p.acc), T(W - 158 * s, 66 * s, 132 * s, 'NEW', 44 * s, { font: 'Anton', color: '#ffffff', align: 'center' }));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('ytreact', 'Big Reaction Thumbnail', 'YouTube Thumbnails', ['yt', 'hd'], ['sun', 'coral', 'royal'], function (W, H, p) {
    var s = H / 720, o = [P(0, 0, W, H, 'PHOTO', { sw: 0 })];
    o.push(R(0, H * 0.45, W, H * 0.55, K.G(90, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.85)')));
    o.push(T(W * 0.04, H * 0.56, W * 0.75, 'I TRIED IT', 150 * s, { font: 'Anton', color: p.b === '#facc15' ? '#facc15' : '#ffffff', stroke: '#000000', sw: 10 * s, lh: 1 }));
    o.push(T(W * 0.04, H * 0.82, W * 0.7, 'for 30 days… and this happened', 40 * s, { font: 'Poppins', bold: 700, color: '#ffffff' }));
    o.push(R(W * 0.72, H * 0.08, W * 0.24, 70 * s, p.acc, { r: 14 * s, angle: -4 }), T(W * 0.72, H * 0.08 + 12 * s, W * 0.24, 'MUST WATCH', 38 * s, { font: 'Anton', color: '#ffffff', align: 'center', angle: -4 }));
    return { pages: [{ bg: '#000000', objects: o }] };
  });
  add('ytedu', 'Study Lesson Thumbnail', 'YouTube Thumbnails', ['yt', 'hd'], ['teal', 'royal', 'navy'], function (W, H, p) {
    var s = H / 720, o = [R(0, 0, W, H, p.c)];
    o.push(C(W * 0.78, H * 0.52, H * 0.46, p.b), P(W * 0.78 - H * 0.4, H * 0.12, H * 0.8, H * 0.8, 'PHOTO', { shape: 'circle' }));
    o = o.concat(pill(W * 0.05, H * 0.1, 260 * s, 64 * s, p.a, 'CLASS 10', 32 * s, '#ffffff'));
    o = o.concat(stack(W * 0.05, W * 0.48, H * 0.24, H * 0.86, [{ text: 'Learn Algebra', size: 96, font: 'Montserrat', bold: 800, color: p.ink, align: 'left', lh: 1.05 }, { text: 'in 10 minutes', size: 96, font: 'Montserrat', bold: 800, color: p.a, align: 'left', lh: 1.05, gap: 18 }, { text: 'Easy tricks · Full chapter · Free notes', size: 32, font: 'Poppins', bold: 600, color: p.ink, align: 'left' }], s, { valign: 'top' }));
    o.push(K.burst(W * 0.6, H * 0.18, 70 * s, 52 * s, 14, p.acc), T(W * 0.6 - 60 * s, H * 0.18 - 24 * s, 120 * s, 'FREE', 38 * s, { font: 'Anton', color: '#ffffff', align: 'center' }));
    return { pages: [{ bg: p.c, objects: o }] };
  });
  add('ytvs', 'Versus Thumbnail', 'YouTube Thumbnails', ['yt', 'hd'], ['red', 'navy', 'royal'], function (W, H, p) {
    var s = H / 720, o = [P(0, 0, W / 2, H, 'PHOTO', { sw: 0 }), P(W / 2, 0, W / 2, H, 'PHOTO', { sw: 0 })];
    o.push(R(0, H - 120 * s, W / 2, 120 * s, p.b), R(W / 2, H - 120 * s, W / 2, 120 * s, p.a));
    o.push(T(0, H - 100 * s, W / 2, 'PHONE A', 70 * s, { font: 'Anton', color: '#ffffff', align: 'center' }), T(W / 2, H - 100 * s, W / 2, 'PHONE B', 70 * s, { font: 'Anton', color: '#ffffff', align: 'center' }));
    o.push(C(W / 2, H * 0.45, 110 * s, '#ffffff', { shadow: { y: 10 * s, b: 30 * s } }), C(W / 2, H * 0.45, 94 * s, p.acc), T(W / 2 - 100 * s, H * 0.45 - 62 * s, 200 * s, 'VS', 100 * s, { font: 'Anton', color: '#ffffff', align: 'center', lh: 1 }));
    return { pages: [{ bg: '#000000', objects: o }] };
  });

  // ================= STORIES =================
  add('stnew', 'New Post Story', 'Stories', ['story'], ['blush', 'teal', 'sun'], function (W, H, p) {
    var s = W / 1080, o = [R(0, 0, W, H, p.c)];
    o.push(C(W * 0.9, H * 0.08, 260 * s, p.b, { op: 0.35 }), C(W * 0.05, H * 0.92, 300 * s, p.b, { op: 0.3 }));
    o.push(T(W * 0.08, H * 0.09, W * 0.84, 'NEW POST', 130 * s, { font: 'Anton', color: p.a, align: 'center', ls: 40 }));
    o.push(T(W * 0.08, H * 0.18, W * 0.84, 'just went live on my page', 44 * s, { font: 'Poppins', color: p.ink, align: 'center' }));
    o.push(R(W * 0.1 - 14 * s, H * 0.25 - 14 * s, W * 0.8 + 28 * s, H * 0.5 + 28 * s, '#ffffff', { r: 40 * s, shadow: { y: 18 * s, b: 50 * s, c: 'rgba(0,0,0,.18)' } }), P(W * 0.1, H * 0.25, W * 0.8, H * 0.5, 'PHOTO', { r: 30 * s }));
    o = o.concat(pill(W * 0.25, H * 0.82, W * 0.5, 110 * s, p.a, 'TAP TO SEE  →', 42 * s, '#ffffff'));
    return { pages: [{ bg: p.c, objects: o }] };
  });
  add('stthis', 'This or That Story', 'Stories', ['story'], ['royal', 'coral', 'navy'], function (W, H, p) {
    var s = W / 1080, o = [R(0, 0, W, H, p.a)];
    o.push(T(W * 0.06, H * 0.05, W * 0.88, 'THIS or THAT?', 110 * s, { font: 'Anton', color: '#ffffff', align: 'center' }));
    [0, 1].forEach(function (i) { var y = H * (0.15 + i * 0.41); o.push(P(W * 0.08, y, W * 0.84, H * 0.36, 'PHOTO', { r: 36 * s })); o = o.concat(pill(W * 0.3, y + H * 0.36 - 60 * s, W * 0.4, 100 * s, i ? p.acc : p.b, i ? 'THAT' : 'THIS', 46 * s, '#ffffff')); });
    o.push(C(W / 2, H * 0.535, 80 * s, '#ffffff'), T(W / 2 - 80 * s, H * 0.535 - 38 * s, 160 * s, 'OR', 60 * s, { font: 'Anton', color: p.a, align: 'center' }));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('stquote', 'Gradient Quote Story', 'Stories', ['story', 'igp'], ['royal', 'coral', 'teal'], function (W, H, p) {
    var s = W / 1080, o = [R(0, 0, W, H, K.G(160, p.b, p.a))];
    o.push(T(W * 0.08, H * 0.2, W * 0.4, '“', 420 * s, { font: 'Playfair Display', bold: 700, color: '#ffffff', op: 0.35, lh: 1 }));
    o = o.concat(stack(W * 0.1, W * 0.8, H * 0.3, H * 0.78, [{ text: 'Small steps every day add up to big results.', size: 92, font: 'Playfair Display', bold: 700, color: '#ffffff', lh: 1.2, gap: 40 }, { div: '#ffffff', w: W * 0.3 }, { text: 'YOUR NAME', size: 34, font: 'Montserrat', bold: 700, color: '#ffffff', ls: 300 }], s));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('stsale', 'Flash Sale Story', 'Stories', ['story', 'igp', 'sq'], ['red', 'sun', 'noir'], function (W, H, p) {
    var q = g(W, H), s = q.s, R0 = Math.min(W * 0.42, H * 0.25), k = R0 / 454, cy = H * 0.45, o = [R(0, 0, W, H, p.b)], cx = W / 2, ink = dark(p) ? '#111827' : '#ffffff';
    o.push(K.burst(cx, cy, R0, R0 * 0.86, 24, p.a), C(cx, cy, R0 * 0.78, p.acc));
    o.push(T(0, H * 0.06, W, 'FLASH SALE', 120 * s, { font: 'Anton', color: p.a, align: 'center', ls: 60 }));
    o.push(T(cx - R0 * 0.75, cy - 200 * k, R0 * 1.5, '50%', 230 * k, { font: 'Anton', color: '#ffffff', align: 'center', lh: 1 }), T(cx - R0 * 0.75, cy + 50 * k, R0 * 1.5, 'OFF', 120 * k, { font: 'Anton', color: '#ffffff', align: 'center', lh: 1 }));
    o.push(T(W * 0.08, cy + R0 + 40 * s, W * 0.84, 'On everything · Today only', 50 * s, { font: 'Poppins', bold: 700, color: p.a, align: 'center' }));
    o = o.concat(pill(cx - 260 * s, Math.min(H - 150 * s, cy + R0 + 130 * s), 520 * s, 100 * s, p.a, 'SHOP NOW', 46 * s, ink));
    return { pages: [{ bg: p.b, objects: o }] };
  });

  // ================= MENUS =================
  function menuRows(x, y, w, items, size, col, pcol) {
    var o = [];
    items.forEach(function (it, i) { var yy = y + i * size * 2.6; o.push(T(x, yy, w * 0.74, it[0], size, { font: 'Poppins', bold: 600, color: col }), T(x + w * 0.74, yy, w * 0.26, it[1], size, { font: 'Poppins', bold: 700, color: pcol, align: 'right' }), T(x, yy + size * 1.25, w * 0.74, it[2] || '', size * 0.7, { font: 'Poppins', color: col, op: 0.7 })); });
    return o;
  }
  add('menucl', 'Restaurant Menu', 'Menus', ['a4p', 'a5p'], ['gold', 'forest', 'noir'], function (W, H, p) {
    var s = W / 794, ink = dark(p) ? '#f9fafb' : p.ink, o = [R(0, 0, W, H, p.bg)].concat(K.frame(W, H, 22 * s, p.b, p.b, false));
    o.push(T(0, 60 * s, W, 'SPICE GARDEN', 46 * s, { font: 'Cinzel', bold: 700, color: dark(p) ? p.b : p.a, align: 'center', ls: 200 }), T(0, 118 * s, W, 'FAMILY RESTAURANT', 15 * s, { font: 'Montserrat', bold: 700, color: ink, align: 'center', ls: 500 }));
    o = o.concat(K.divider(W / 2, 156 * s, W * 0.4, p.b));
    var secs = [['Starters', [['Paneer Tikka', '₹220', 'Grilled cottage cheese, mint chutney'], ['Veg Spring Roll', '₹160', 'Crispy rolls with sweet chilli'], ['Chicken 65', '₹240', 'Spicy fried chicken bites']]], ['Main Course', [['Butter Chicken', '₹320', 'Creamy tomato gravy'], ['Dal Makhani', '₹210', 'Slow cooked black lentils'], ['Veg Biryani', '₹240', 'Fragrant rice with vegetables'], ['Butter Naan', '₹45', 'Soft tandoor bread']]], ['Desserts', [['Gulab Jamun', '₹90', 'Two pieces, warm'], ['Kulfi', '₹110', 'Pistachio']]]];
    var y = 190 * s;
    secs.forEach(function (sec) { o.push(T(70 * s, y, W - 140 * s, sec[0], 30 * s, { font: 'Playfair Display', bold: 700, italic: true, color: dark(p) ? p.b : p.b })); y += 50 * s; o = o.concat(menuRows(70 * s, y, W - 140 * s, sec[1], 17 * s, ink, dark(p) ? p.b : p.a)); y += sec[1].length * 17 * s * 2.6 + 20 * s; });
    o.push(T(0, H - 70 * s, W, 'Call for home delivery: 98765 43210', 15 * s, { font: 'Poppins', bold: 600, color: ink, align: 'center' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('menucafe', 'Cafe Menu', 'Menus', ['a4p', 'a5p'], ['coral', 'teal', 'royal'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff'), P(0, 0, W, H * 0.28, 'PHOTO', { sw: 0 }), R(0, H * 0.22, W, H * 0.08, p.a)];
    o.push(T(0, H * 0.225, W, 'Cafe Menu', 44 * s, { font: 'Pacifico', color: '#ffffff', align: 'center' }));
    var cw = (W - 150 * s) / 2, cols = [['Hot Coffee', [['Espresso', '₹90'], ['Cappuccino', '₹140'], ['Cafe Latte', '₹150'], ['Mocha', '₹170']]], ['Cold Drinks', [['Iced Latte', '₹160'], ['Cold Coffee', '₹150'], ['Lemon Iced Tea', '₹120'], ['Mango Shake', '₹140']]], ['Snacks', [['Veg Sandwich', '₹120'], ['Garlic Bread', '₹110'], ['French Fries', '₹100']]], ['Sweet Treats', [['Brownie', '₹110'], ['Choco Muffin', '₹90'], ['Cheesecake', '₹180']]]];
    cols.forEach(function (c, i) {
      var x = 60 * s + (i % 2) * (cw + 30 * s), y = H * 0.35 + Math.floor(i / 2) * H * 0.3;
      o.push(R(x, y, cw, 46 * s, p.c, { r: 23 * s }), T(x, y + 9 * s, cw, c[0].toUpperCase(), 20 * s, { font: 'Montserrat', bold: 800, color: p.a, align: 'center', ls: 150 }));
      c[1].forEach(function (it, j) { var yy = y + 70 * s + j * 40 * s; o.push(T(x + 10 * s, yy, cw * 0.65, it[0], 18 * s, { font: 'Poppins', color: p.ink }), T(x + cw * 0.65, yy, cw * 0.35 - 10 * s, it[1], 18 * s, { font: 'Poppins', bold: 700, color: p.a, align: 'right' }), L(x + 10 * s, yy + 30 * s, x + cw - 10 * s, yy + 30 * s, p.c, 1, { dash: [3, 4] })); });
    });
    o.push(T(0, H - 60 * s, W, 'Open daily 8 AM – 10 PM · Free Wi-Fi', 16 * s, { font: 'Poppins', bold: 600, color: p.a, align: 'center' }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('menuboard', 'Menu Board (screen)', 'Menus', ['hd'], ['noir', 'forest', 'navy'], function (W, H, p) {
    var s = H / 1080, bg = dark(p) ? '#1f2937' : p.a, o = [R(0, 0, W, H, bg)];
    o.push(T(0, 50 * s, W, 'TODAY’S SPECIALS', 80 * s, { font: 'Bebas Neue', color: dark(p) ? p.b : p.c, align: 'center', ls: 100 }));
    var cw = (W - 200 * s) / 3, data = [['Burgers', [['Classic Veg', '₹129'], ['Cheese Burst', '₹159'], ['Crispy Chicken', '₹179'], ['Double Patty', '₹219']]], ['Pizza', [['Margherita', '₹199'], ['Farm Fresh', '₹249'], ['Paneer Tikka', '₹279'], ['Chicken BBQ', '₹299']]], ['Drinks', [['Cold Coffee', '₹99'], ['Fresh Lime', '₹69'], ['Mango Shake', '₹119'], ['Soft Drinks', '₹49']]]];
    data.forEach(function (c, i) {
      var x = 60 * s + i * (cw + 40 * s), y = 190 * s;
      o.push(P(x, y, cw, 300 * s, 'PHOTO', { r: 20 * s }), T(x, y + 330 * s, cw, c[0].toUpperCase(), 56 * s, { font: 'Bebas Neue', color: '#ffffff', ls: 80 }));
      c[1].forEach(function (it, j) { var yy = y + 410 * s + j * 82 * s; o.push(T(x, yy, cw * 0.7, it[0], 36 * s, { font: 'Poppins', color: '#ffffff' }), T(x + cw * 0.7, yy, cw * 0.3, it[1], 36 * s, { font: 'Poppins', bold: 700, color: dark(p) ? p.b : p.c, align: 'right' })); });
    });
    return { pages: [{ bg: bg, objects: o }] };
  });

  // ================= PRICE LISTS =================
  add('salon', 'Salon Price List', 'Price Lists', ['a4p', 'sq', 'igp'], ['blush', 'gold', 'royal'], function (W, H, p) {
    var q = g(W, H), s = W / 1080, o = [R(0, 0, W, H, p.bg), C(W, 0, W * 0.32, p.c), C(0, H, W * 0.28, p.c)];
    o.push(T(0, H * 0.06, W, 'Glow Beauty Salon', 84 * s, { font: 'Great Vibes', color: p.a, align: 'center' }), T(0, H * 0.06 + 120 * s, W, 'PRICE LIST', 40 * s, { font: 'Montserrat', bold: 800, color: p.ink, align: 'center', ls: 600 }));
    var rows = [['Haircut & Styling', '₹299'], ['Hair Spa', '₹799'], ['Facial (Fruit)', '₹599'], ['Facial (Gold)', '₹1,199'], ['Eyebrow Threading', '₹50'], ['Manicure', '₹399'], ['Pedicure', '₹499'], ['Bridal Makeup', '₹9,999']];
    var top = H * 0.06 + 210 * s, lh = Math.min(96 * s, (H * 0.86 - top) / rows.length), x = W * 0.1, w = W * 0.8;
    rows.forEach(function (r, i) { var y = top + i * lh; if (i % 2 === 0) o.push(R(x - 20 * s, y - lh * 0.18, w + 40 * s, lh * 0.86, '#ffffff', { r: lh * 0.2, op: 0.9 })); o.push(T(x, y, w * 0.7, r[0], lh * 0.36, { font: 'Poppins', bold: 600, color: p.ink }), T(x + w * 0.7, y, w * 0.3, r[1], lh * 0.36, { font: 'Poppins', bold: 800, color: p.a, align: 'right' })); });
    o.push(T(0, H * 0.92, W, 'Book now: 98765 43210', 34 * s, { font: 'Poppins', bold: 700, color: p.b, align: 'center' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('fees', 'Coaching Fee Chart', 'Price Lists', ['a4p'], ['navy', 'teal', 'red'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff'), R(0, 0, W, 190 * s, p.a)];
    o.push(T(0, 50 * s, W, 'BRIGHT FUTURE CLASSES', 36 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'center', ls: 100 }), T(0, 110 * s, W, 'Fee Structure 2026–27', 22 * s, { font: 'Poppins', color: '#ffffff', align: 'center' }));
    var x = 60 * s, w = W - 120 * s, cols = [0.4, 0.2, 0.2, 0.2], hd = ['Course', 'Duration', 'Monthly', 'Yearly'], rows = [['Class 6–8 (All)', '12 months', '₹800', '₹8,500'], ['Class 9–10 Science', '12 months', '₹1,200', '₹13,000'], ['Class 11–12 Science', '12 months', '₹1,800', '₹19,000'], ['Class 11–12 Commerce', '12 months', '₹1,500', '₹16,000'], ['Spoken English', '3 months', '₹1,000', '—'], ['Computer Basics', '3 months', '₹900', '—']], y = 240 * s, rh = 56 * s;
    function row(cells, yy, head, z) { var cx = x; o.push(R(x, yy, w, rh, head ? p.b : z ? p.c : '#ffffff', { stroke: p.c, sw: 1 })); cells.forEach(function (c, i) { o.push(T(cx + 12 * s, yy + rh * 0.28, w * cols[i] - 24 * s, c, 17 * s, { font: 'Poppins', bold: head ? 700 : i === 0 ? 600 : 400, color: head ? '#ffffff' : p.ink, align: i ? 'center' : 'left' })); cx += w * cols[i]; }); }
    row(hd, y, true); rows.forEach(function (r, i) { row(r, y + (i + 1) * rh, false, i % 2); });
    o.push(T(x, y + (rows.length + 1) * rh + 40 * s, w, '• Admission fee ₹500 (one time)\n• 10% discount for sisters/brothers\n• Weekly tests and study material included', 17 * s, { font: 'Poppins', color: p.ink, lh: 1.7 }));
    o.push(R(0, H - 90 * s, W, 90 * s, p.a), T(0, H - 62 * s, W, 'Main Road, Near Bus Stand · 98765 43210', 18 * s, { font: 'Poppins', bold: 600, color: '#ffffff', align: 'center' }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });

  // ================= QUOTES =================
  add('qmin', 'Minimal Quote', 'Quotes', SOC, ['gold', 'navy', 'forest'], function (W, H, p) {
    var q = g(W, H), s = q.s, o = [R(0, 0, W, H, p.bg)];
    o.push(T(W * 0.1, H * 0.16, 200 * s, '“', 300 * s, { font: 'Playfair Display', bold: 700, color: p.b, lh: 1 }));
    o = o.concat(stack(W * 0.12, W * 0.76, H * 0.3, H * 0.82, [{ text: 'Be the reason someone smiles today.', size: 84, font: 'Playfair Display', italic: true, color: p.ink, align: 'left', lh: 1.25, gap: 40 }, { text: '— YOUR NAME', size: 30, font: 'Montserrat', bold: 700, color: p.b, align: 'left', ls: 250 }], s));
    o.push(R(W * 0.12, H * 0.88, W * 0.18, 6 * s, p.a));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('qbold', 'Bold Quote', 'Quotes', SOC, ['sun', 'red', 'royal'], function (W, H, p) {
    var q = g(W, H), s = q.s, o = [R(0, 0, W, H, p.a)];
    o.push(R(W * 0.07, H * 0.07, W * 0.86, H * 0.86, null, { stroke: p.b, sw: 6 * s }));
    o = o.concat(stack(W * 0.13, W * 0.74, H * 0.16, H * 0.84, [{ text: 'DON’T STOP', size: 150, font: 'Anton', color: '#ffffff', lh: 1, gap: 4 }, { text: 'UNTIL YOU’RE', size: 110, font: 'Anton', color: '#ffffff', lh: 1, gap: 4 }, { text: 'PROUD', size: 190, font: 'Anton', color: p.b, lh: 1, gap: 30 }, { text: '#MondayMotivation', size: 34, font: 'Poppins', bold: 600, color: '#ffffff' }], s));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('qphoto', 'Photo Quote', 'Quotes', SOC, ['noir', 'teal', 'blush'], function (W, H, p) {
    var q = g(W, H), s = q.s, o = [P(0, 0, W, H, 'PHOTO', { sw: 0 }), R(0, 0, W, H, '#000000', { op: 0.5 })];
    o = o.concat(stack(W * 0.1, W * 0.8, H * 0.2, H * 0.8, [{ text: 'Life is better when you’re laughing.', size: 96, font: 'Dancing Script', bold: 700, color: '#ffffff', lh: 1.15, gap: 30 }, { div: '#ffffff', w: W * 0.25 }, { text: 'GOOD MORNING', size: 32, font: 'Montserrat', bold: 700, color: '#ffffff', ls: 400 }], s));
    return { pages: [{ bg: '#000000', objects: o }] };
  });

  // ================= SALE & OFFERS =================
  add('mega', 'Mega Sale Post', 'Sale & Offers', SOC, ['red', 'royal', 'noir'], function (W, H, p) {
    var q = g(W, H), s = q.s, cx = W / 2, o = [R(0, 0, W, H, dark(p) ? K.G(135, '#1f2937', '#030712') : K.G(135, p.b, p.a))];
    for (var i = 0; i < 9; i++) o.push(C(W * ((i * 37) % 100) / 100, H * ((i * 53 + 11) % 100) / 100, (20 + (i * 13) % 40) * s, '#ffffff', { op: 0.12 }));
    o = o.concat(stack(W * 0.08, W * 0.84, H * 0.1, H * 0.62, [{ text: 'MEGA', size: 200, font: 'Anton', color: '#ffffff', lh: 1, gap: 0 }, { text: 'SALE', size: 260, font: 'Anton', color: p.acc, lh: 1, gap: 20 }, { text: 'UP TO 70% OFF', size: 70, font: 'Montserrat', bold: 800, color: '#ffffff' }], s));
    o = o.concat(pill(cx - 300 * s, H * 0.7, 600 * s, 100 * s, '#ffffff', '25 – 31 DECEMBER', 40 * s, dark(p) ? '#111827' : p.a));
    o.push(T(0, H * 0.84, W, 'STYLE HUB · MG Road', 36 * s, { font: 'Poppins', bold: 700, color: '#ffffff', align: 'center', ls: 100 }));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('arrival', 'New Arrivals Post', 'Sale & Offers', SOC, ['blush', 'gold', 'teal'], function (W, H, p) {
    var q = g(W, H), s = q.s, o = [R(0, 0, W, H, p.bg)];
    o.push(P(W * 0.08, H * 0.08, W * 0.84, H * 0.56, 'PHOTO', { r: 30 * s }));
    o.push(R(W * 0.62, H * 0.06, 300 * s, 300 * s, p.a, { r: 150 * s }), T(W * 0.62, H * 0.06 + 90 * s, 300 * s, '30%\nOFF', 60 * s, { font: 'Anton', color: '#ffffff', align: 'center', lh: 1 }));
    o = o.concat(stack(W * 0.08, W * 0.84, H * 0.68, H * 0.95, [{ text: 'NEW ARRIVALS', size: 110, font: 'Bebas Neue', color: p.a, ls: 80, gap: 6 }, { text: 'Fresh styles are here. Visit us or order on WhatsApp.', size: 36, font: 'Poppins', color: p.ink }], s));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('festoffer', 'Festival Offer Post', 'Sale & Offers', SOC, ['gold', 'red', 'royal'], function (W, H, p) {
    var q = g(W, H), s = q.s, cx = W / 2, o = [R(0, 0, W, H, p.a)];
    o = o.concat(K.mandala(cx, H * 0.3, q.m * 0.32, p.b, p.acc, 0.35));
    o.push(A('diya', cx - 130 * s, H * 0.3 - 110 * s, 260 * s));
    o = o.concat(stack(W * 0.08, W * 0.84, H * 0.52, H * 0.84, [{ text: 'Festive Dhamaka', size: 110, font: 'Shrikhand', color: '#ffffff', gap: 20 }, { text: 'FLAT 40% OFF', size: 90, font: 'Anton', color: p.c, gap: 14 }, { text: 'on all sarees, suits & kurtis', size: 38, font: 'Poppins', color: '#ffffff' }], s));
    o = o.concat(pill(cx - 280 * s, H * 0.87, 560 * s, 90 * s, p.c, 'LAKSHMI FASHION', 36 * s, p.a));
    return { pages: [{ bg: p.a, objects: o }] };
  });

  // ================= TICKETS & VOUCHERS =================
  add('ticket', 'Event Ticket', 'Tickets & Vouchers', ['fbpost'], ['royal', 'teal', 'noir'], function (W, H, p) {
    var s = H / 630, sx = W * 0.72, bg = dark(p) ? '#111827' : p.a, o = [R(0, 0, W, H, '#ffffff'), R(20 * s, 20 * s, W - 40 * s, H - 40 * s, bg, { r: 30 * s })];
    o.push(R(sx, 20 * s, W - 20 * s - sx, H - 40 * s, p.b, { r: 30 * s }), R(sx, 20 * s, 40 * s, H - 40 * s, p.b));
    o.push(C(sx, 20 * s, 30 * s, '#ffffff'), C(sx, H - 20 * s, 30 * s, '#ffffff'), L(sx, 60 * s, sx, H - 60 * s, '#ffffff', 4 * s, { dash: [12 * s, 12 * s] }));
    o.push(T(70 * s, 70 * s, sx - 120 * s, 'ADMIT ONE', 26 * s, { font: 'Montserrat', bold: 800, color: dark(p) ? p.b : p.c, ls: 400 }), T(70 * s, 110 * s, sx - 120 * s, 'MUSIC NIGHT 2026', 74 * s, { font: 'Anton', color: '#ffffff', lh: 1.05 }));
    o = o.concat(K.rows(70 * s, 300 * s, sx - 140 * s, [['DATE', 'Sat, 20 December'], ['TIME', '7:00 PM onwards'], ['VENUE', 'City Hall, Main Road']], 26 * s, { vc: '#ffffff', kc: dark(p) ? p.b : p.c, kw: 0.28, font: 'Poppins' }));
    o.push(T(sx + 50 * s, 80 * s, W - sx - 90 * s, 'SEAT', 26 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'center', ls: 300 }), T(sx + 50 * s, 120 * s, W - sx - 90 * s, 'A-12', 80 * s, { font: 'Anton', color: '#ffffff', align: 'center' }));
    o.push(K.B(sx + 60 * s, 300 * s, W - sx - 110 * s, 180 * s, '20261220012'));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('voucher', 'Gift Voucher', 'Tickets & Vouchers', ['fbpost', 'bcard'], ['gold', 'blush', 'forest'], function (W, H, p) {
    var s = H / 630, o = [R(0, 0, W, H, p.bg), R(24 * s, 24 * s, W - 48 * s, H - 48 * s, null, { stroke: p.b, sw: 4 * s, dash: [16 * s, 10 * s] })];
    o.push(R(W * 0.66, 0, 90 * s, H, p.a), R(0, H * 0.42, W, 90 * s, p.a), A('bow', W * 0.66 - 85 * s, H * 0.42 - 95 * s, 260 * s, 190 * s, { cols: [p.acc] }));
    o.push(T(70 * s, 70 * s, W * 0.55, 'GIFT', 120 * s, { font: 'Anton', color: p.a, lh: 1 }), T(70 * s, 190 * s, W * 0.55, 'VOUCHER', 60 * s, { font: 'Montserrat', bold: 800, color: p.b, ls: 200 }));
    o.push(T(70 * s, H * 0.42 + 18 * s, W * 0.55, 'WORTH ₹1,000', 46 * s, { font: 'Poppins', bold: 800, color: '#ffffff' }));
    o.push(T(70 * s, H * 0.66, W * 0.55, 'Valid till 31 March 2027\nCode: GIFT-2026-001', 24 * s, { font: 'Poppins', color: p.ink, lh: 1.5 }));
    o.push(T(W * 0.66 + 90 * s, H * 0.72, W * 0.34 - 110 * s, 'Your Shop Name', 30 * s, { font: 'Great Vibes', color: p.a, align: 'center' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('coupon', 'Discount Coupon', 'Tickets & Vouchers', ['fbpost', 'bcard'], ['red', 'sun', 'teal'], function (W, H, p) {
    var s = H / 630, o = [R(0, 0, W, H, '#ffffff'), R(20 * s, 20 * s, W - 40 * s, H - 40 * s, p.b, { r: 24 * s })];
    o.push(C(20 * s, H / 2, 50 * s, '#ffffff'), C(W - 20 * s, H / 2, 50 * s, '#ffffff'), L(W * 0.38, 50 * s, W * 0.38, H - 50 * s, '#ffffff', 4 * s, { dash: [10 * s, 10 * s] }));
    o.push(T(60 * s, H * 0.26, W * 0.3, '20%', 170 * s, { font: 'Anton', color: p.a === '#1c1917' ? '#1c1917' : '#ffffff', align: 'center', lh: 1 }), T(60 * s, H * 0.6, W * 0.3, 'OFF', 70 * s, { font: 'Anton', color: p.a === '#1c1917' ? '#1c1917' : '#ffffff', align: 'center' }));
    var ink = p.a === '#1c1917' ? '#1c1917' : '#ffffff';
    o.push(T(W * 0.42, 90 * s, W * 0.52, 'DISCOUNT COUPON', 44 * s, { font: 'Montserrat', bold: 800, color: ink, ls: 80 }), T(W * 0.42, 170 * s, W * 0.52, 'on your next purchase above ₹999', 28 * s, { font: 'Poppins', color: ink }));
    o = o.concat(pill(W * 0.42, 280 * s, 420 * s, 90 * s, '#ffffff', 'CODE: SAVE20', 36 * s, p.a === '#1c1917' ? '#1c1917' : p.b));
    o.push(T(W * 0.42, 430 * s, W * 0.52, 'Valid till 31 Jan · One coupon per bill', 22 * s, { font: 'Poppins', color: ink, op: 0.85 }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });

  // ================= INFOGRAPHICS =================
  add('steps', 'Steps Infographic', 'Infographics', ['a4p', 'story', 'igp'], ['teal', 'royal', 'coral'], function (W, H, p) {
    var s = W / 1080, o = [R(0, 0, W, H, p.bg)];
    o = o.concat(stack(W * 0.08, W * 0.84, H * 0.04, H * 0.17, [{ text: 'HOW TO APPLY', size: 100, font: 'Anton', color: p.a, gap: 8 }, { text: 'Get your card in 4 easy steps', size: 40, font: 'Poppins', color: p.ink }], s));
    var st = [['Fill the form', 'Write your name, address and phone number clearly.'], ['Add documents', 'Attach Aadhaar copy and two passport photos.'], ['Pay the fee', 'Pay at the counter or by UPI and keep the receipt.'], ['Collect your card', 'Your card is ready in 7 working days.']];
    var top = H * 0.21, step = (H * 0.92 - top) / st.length, r = Math.min(70 * s, step * 0.3), x = W * 0.1;
    o.push(L(x + r, top + r, x + r, top + step * (st.length - 1) + r, p.b, 8 * s, { dash: [16 * s, 12 * s] }));
    st.forEach(function (t, i) { var y = top + i * step; o.push(R(x + r * 1.4, y - 10 * s, W * 0.78 - r, step * 0.8, '#ffffff', { r: 26 * s, shadow: { y: 8 * s, b: 24 * s, c: 'rgba(0,0,0,.08)' } }), C(x + r, y + r, r, i % 2 ? p.a : p.b), T(x, y + r - r * 0.62, r * 2, String(i + 1), r * 1.1, { font: 'Anton', color: '#ffffff', align: 'center', lh: 1 }), T(x + r * 2.8, y + 14 * s, W * 0.66 - r * 1.6, t[0], Math.min(52 * s, step * 0.17), { font: 'Montserrat', bold: 800, color: p.ink }), T(x + r * 2.8, y + 14 * s + Math.min(52 * s, step * 0.17) * 1.4, W * 0.66 - r * 1.6, t[1], Math.min(32 * s, step * 0.11), { font: 'Poppins', color: p.ink, lh: 1.35 })); });
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('stats', 'Numbers Infographic', 'Infographics', ['a4p', 'sq', 'igp'], ['navy', 'forest', 'royal'], function (W, H, p) {
    var s = W / 1080, o = [R(0, 0, W, H, p.a)];
    o = o.concat(stack(W * 0.08, W * 0.84, H * 0.06, H * 0.26, [{ text: 'OUR YEAR IN NUMBERS', size: 90, font: 'Anton', color: '#ffffff', gap: 10 }, { text: 'Thank you for trusting us in 2026', size: 38, font: 'Poppins', color: p.c }], s));
    var nums = [['12,500+', 'Happy customers'], ['98%', 'Orders on time'], ['35', 'Cities served'], ['4.8 ★', 'Average rating']], top = H * 0.32, ch = (H * 0.9 - top) / 2, cw = W * 0.4;
    nums.forEach(function (n, i) { var x = W * 0.07 + (i % 2) * (cw + W * 0.06), y = top + Math.floor(i / 2) * ch; o.push(R(x, y, cw, ch * 0.86, i === 0 || i === 3 ? p.b : '#ffffff', { r: 40 * s, op: i === 0 || i === 3 ? 1 : 0.12 }), T(x, y + ch * 0.22, cw, n[0], Math.min(130 * s, ch * 0.28), { font: 'Anton', color: '#ffffff', align: 'center' }), T(x, y + ch * 0.56, cw, n[1], Math.min(40 * s, ch * 0.1), { font: 'Poppins', bold: 600, color: '#ffffff', align: 'center' })); });
    return { pages: [{ bg: p.a, objects: o }] };
  });

  // ================= PLANNERS =================
  add('weekly', 'Weekly Planner', 'Planners', ['a4p', 'a4l'], ['blush', 'teal', 'navy'], function (W, H, p) {
    var s = Math.min(W, H) / 794, land = W > H, o = [R(0, 0, W, H, '#ffffff')];
    o.push(T(50 * s, 40 * s, W * 0.6, 'Weekly Planner', 52 * s, { font: 'Dancing Script', bold: 700, color: p.a }), T(W * 0.55, 60 * s, W * 0.45 - 50 * s, 'WEEK OF ____________', 16 * s, { font: 'Montserrat', bold: 700, color: p.ink, align: 'right', ls: 100 }));
    var days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'NOTES'], cols = land ? 4 : 2, rows = 8 / cols, gx = 50 * s, top = 130 * s, cw = (W - gx * 2 - (cols - 1) * 20 * s) / cols, ch = (H - top - 50 * s - (rows - 1) * 20 * s) / rows;
    days.forEach(function (d, i) {
      var x = gx + (i % cols) * (cw + 20 * s), y = top + Math.floor(i / cols) * (ch + 20 * s), last = i === 7;
      o.push(R(x, y, cw, ch, last ? p.c : '#ffffff', { r: 16 * s, stroke: p.c, sw: 2 }), R(x, y, cw, 40 * s, last ? p.b : p.c, { r: 16 * s }), T(x + 14 * s, y + 10 * s, cw - 28 * s, d, 16 * s, { font: 'Montserrat', bold: 800, color: last ? '#ffffff' : p.a, ls: 200 }));
      for (var l = 1; l * 34 * s < ch - 50 * s; l++) o.push(L(x + 16 * s, y + 40 * s + l * 34 * s, x + cw - 16 * s, y + 40 * s + l * 34 * s, p.c, 1));
    });
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('todo', 'To-Do List', 'Planners', ['a4p', 'a5p', 'story'], ['royal', 'sun', 'forest'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, p.bg), C(W * 0.92, H * 0.05, W * 0.2, p.c), C(W * 0.05, H * 0.97, W * 0.16, p.c)];
    o.push(T(60 * s, H * 0.05, W - 120 * s, 'To-Do List', 70 * s, { font: 'Pacifico', color: p.a }), T(60 * s, H * 0.05 + 115 * s, W - 120 * s, 'DATE: ____________      PRIORITY: ★ ★ ★', 16 * s, { font: 'Montserrat', bold: 700, color: p.ink, ls: 80 }));
    var top = H * 0.05 + 175 * s, n = 14, rh = (H * 0.92 - top) / n;
    for (var i = 0; i < n; i++) { var y = top + i * rh; o.push(R(60 * s, y + rh * 0.2, rh * 0.5, rh * 0.5, '#ffffff', { r: 6 * s, stroke: p.b, sw: 2.5 }), L(60 * s + rh * 0.8, y + rh * 0.72, W - 60 * s, y + rh * 0.72, p.c, 1.5)); }
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('habit', 'Habit Tracker', 'Planners', ['a4p', 'a4l'], ['teal', 'blush', 'royal'], function (W, H, p) {
    var s = Math.min(W, H) / 794, o = [R(0, 0, W, H, '#ffffff')];
    o.push(T(0, 40 * s, W, 'HABIT TRACKER', 44 * s, { font: 'Montserrat', bold: 800, color: p.a, align: 'center', ls: 300 }), T(0, 100 * s, W, 'Month: ______________', 18 * s, { font: 'Poppins', color: p.ink, align: 'center' }));
    var habits = ['Drink 8 glasses of water', 'Exercise 30 minutes', 'Read 10 pages', 'Sleep before 11 PM', 'No junk food', 'Study 2 hours', 'Walk 5,000 steps', 'Gratitude journal'], days = 31, x0 = 50 * s, lw = W * 0.26, top = 160 * s, gw = (W - x0 * 2 - lw) / days, rh = Math.min(110 * s, (H - top - 60 * s) / (habits.length + 1));
    for (var d = 0; d < days; d++) o.push(T(x0 + lw + d * gw, top, gw, String(d + 1), Math.min(13 * s, gw * 0.6), { font: 'Poppins', bold: 700, color: p.b, align: 'center' }));
    habits.forEach(function (h, i) { var y = top + (i + 1) * rh; if (i % 2 === 0) o.push(R(x0 - 10 * s, y - rh * 0.2, W - x0 * 2 + 20 * s, rh, p.c, { r: 10 * s, op: 0.5 })); o.push(T(x0, y, lw - 10 * s, h, Math.min(16 * s, rh * 0.32), { font: 'Poppins', bold: 600, color: p.ink })); for (var d2 = 0; d2 < days; d2++) o.push(C(x0 + lw + d2 * gw + gw / 2, y + rh * 0.25, Math.min(gw * 0.36, rh * 0.25), '#ffffff', { stroke: p.b, sw: 1.5 })); });
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });

  // ================= INVOICE =================
  add('invoice', 'Invoice / Bill', 'Invoices', ['a4p'], ['navy', 'teal', 'royal'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff'), R(0, 0, W, 12 * s, p.b)];
    o.push(T(50 * s, 50 * s, W * 0.5, 'Your Business Name', 28 * s, { font: 'Montserrat', bold: 800, color: p.a }), T(50 * s, 92 * s, W * 0.5, 'Shop No. 12, Main Market, Your City\nPhone: 98765 43210\nGSTIN: __________________', 13 * s, { font: 'Poppins', color: p.ink, lh: 1.6 }));
    o.push(T(W * 0.5, 44 * s, W * 0.5 - 50 * s, 'INVOICE', 50 * s, { font: 'Anton', color: p.b, align: 'right', ls: 100 }), T(W * 0.5, 112 * s, W * 0.5 - 50 * s, 'Invoice No: INV-001\nDate: 01/01/2027\nDue date: 15/01/2027', 13 * s, { font: 'Poppins', color: p.ink, align: 'right', lh: 1.6 }));
    o.push(R(50 * s, 200 * s, W - 100 * s, 100 * s, p.c, { r: 10 * s, op: 0.6 }), T(70 * s, 214 * s, W * 0.5, 'BILL TO', 13 * s, { font: 'Montserrat', bold: 800, color: p.b, ls: 200 }), T(70 * s, 236 * s, W * 0.6, 'Customer Name\nAddress line, City – PIN', 14 * s, { font: 'Poppins', color: p.ink, lh: 1.5 }));
    var x = 50 * s, w = W - 100 * s, cols = [0.08, 0.46, 0.14, 0.16, 0.16], hd = ['#', 'Item / service', 'Qty', 'Rate', 'Amount'], rows = [['1', 'Item name', '2', '₹500', '₹1,000'], ['2', 'Item name', '1', '₹1,200', '₹1,200'], ['3', 'Service charge', '1', '₹300', '₹300'], ['4', '', '', '', ''], ['5', '', '', '', '']], y = 330 * s, rh = 44 * s;
    function row(c, yy, head, z) { var cx = x; o.push(R(x, yy, w, rh, head ? p.a : z ? '#f8fafc' : '#ffffff', { stroke: '#e2e8f0', sw: 1 })); c.forEach(function (t, i) { o.push(T(cx + 10 * s, yy + 13 * s, w * cols[i] - 20 * s, t, 14 * s, { font: 'Poppins', bold: head ? 700 : 400, color: head ? '#ffffff' : p.ink, align: i >= 2 ? 'right' : 'left' })); cx += w * cols[i]; }); }
    row(hd, y, true); rows.forEach(function (r, i) { row(r, y + (i + 1) * rh, false, i % 2); });
    var ty = y + (rows.length + 1) * rh + 20 * s;
    o = o.concat(K.rows(W * 0.56, ty, W * 0.44 - 50 * s, [['Subtotal', '₹2,500'], ['GST (18%)', '₹450']], 15 * s, { vc: p.ink, kc: p.ink, kw: 0.5, font: 'Poppins', colon: false }));
    o.push(R(W * 0.54, ty + 66 * s, W * 0.46 - 50 * s, 50 * s, p.b, { r: 8 * s }), T(W * 0.56, ty + 79 * s, W * 0.2, 'TOTAL', 17 * s, { font: 'Montserrat', bold: 800, color: '#ffffff' }), T(W * 0.7, ty + 77 * s, W * 0.3 - 66 * s, '₹2,950', 20 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'right' }));
    o.push(T(50 * s, H - 200 * s, W * 0.5, 'Payment details\nBank: ____________\nA/c No: ____________\nIFSC: ____________', 13 * s, { font: 'Poppins', color: p.ink, lh: 1.6 }), L(W - 260 * s, H - 120 * s, W - 50 * s, H - 120 * s, p.ink, 1), T(W - 260 * s, H - 110 * s, 210 * s, 'Authorised signature', 12 * s, { font: 'Poppins', color: p.ink, align: 'center' }));
    o.push(T(0, H - 50 * s, W, 'Thank you for your business!', 14 * s, { font: 'Poppins', bold: 600, color: p.b, align: 'center' }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });

  // ================= RECIPE =================
  add('recipe', 'Recipe Card', 'Recipes', ['a4p', 'a5p', 'igp'], ['coral', 'forest', 'gold'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, p.bg), P(0, 0, W, H * 0.32, 'PHOTO', { sw: 0 })];
    o.push(R(40 * s, H * 0.27, W - 80 * s, 110 * s, '#ffffff', { r: 20 * s, shadow: { y: 8 * s, b: 24 * s, c: 'rgba(0,0,0,.12)' } }), T(40 * s, H * 0.27 + 14 * s, W - 80 * s, 'Masala Chai', 46 * s, { font: 'Playfair Display', bold: 700, color: p.a, align: 'center' }), T(40 * s, H * 0.27 + 72 * s, W - 80 * s, 'Serves 2  ·  10 minutes  ·  Easy', 15 * s, { font: 'Poppins', bold: 600, color: p.ink, align: 'center', ls: 60 }));
    var y = H * 0.27 + 150 * s, cw = (W - 120 * s) / 2;
    o.push(T(40 * s, y, cw, 'INGREDIENTS', 18 * s, { font: 'Montserrat', bold: 800, color: p.b, ls: 200 }), T(40 * s, y + 36 * s, cw, '• 1 cup water\n• 1 cup milk\n• 2 tsp tea leaves\n• 2 tsp sugar\n• 2 cardamoms, crushed\n• Small piece of ginger', 19 * s, { font: 'Poppins', color: p.ink, lh: 1.9 }));
    o.push(T(80 * s + cw, y, cw, 'METHOD', 18 * s, { font: 'Montserrat', bold: 800, color: p.b, ls: 200 }), T(80 * s + cw, y + 36 * s, cw, '1. Boil water with ginger and cardamom.\n2. Add tea leaves and boil 2 minutes.\n3. Add milk and sugar.\n4. Simmer until it rises, then strain.\n5. Serve hot with biscuits.', 19 * s, { font: 'Poppins', color: p.ink, lh: 1.9 }));
    o.push(R(40 * s, H - 110 * s, W - 80 * s, 70 * s, p.c, { r: 14 * s }), T(60 * s, H - 90 * s, W - 120 * s, 'Tip: add a pinch of black pepper on cold days.', 15 * s, { font: 'Poppins', italic: true, color: p.a, align: 'center' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });

  // ================= PROPERTY =================
  add('rent', 'House For Rent / Sale', 'Property', ['a4p', 'sq', 'igp'], ['navy', 'forest', 'red'], function (W, H, p) {
    var q = g(W, H), s = W / 1080, o = [R(0, 0, W, H, '#ffffff'), P(0, 0, W, H * 0.48, 'PHOTO', { sw: 0 })];
    o.push(R(0, H * 0.44, W, H * 0.16, p.a), T(W * 0.06, H * 0.455, W * 0.88, 'HOUSE FOR RENT', Math.min(110 * s, H * 0.075), { font: 'Anton', color: '#ffffff', ls: 40 }), T(W * 0.06, H * 0.455 + Math.min(120 * s, H * 0.085), W * 0.88, '2 BHK · Semi furnished · Ready to move', Math.min(38 * s, H * 0.028), { font: 'Poppins', bold: 600, color: p.c }));
    var feats = [['ic-home', '950 sq ft'], ['ic-drop', '24 hr water'], ['ic-alert', 'Parking'], ['ic-globe', 'Near school']], fy = H * 0.65, fw = W * 0.88 / 4;
    feats.forEach(function (f, i) { var x = W * 0.06 + i * fw; o.push(C(x + fw / 2, fy + 40 * s, 44 * s, p.c), A(f[0], x + fw / 2 - 24 * s, fy + 16 * s, 48 * s, 48 * s, { cols: [p.a] }), T(x, fy + 100 * s, fw, f[1], 28 * s, { font: 'Poppins', bold: 600, color: p.ink, align: 'center' })); });
    o.push(T(W * 0.06, H * 0.8, W * 0.5, '₹12,000 / month', 56 * s, { font: 'Montserrat', bold: 800, color: p.b }));
    o = o.concat(pill(W * 0.06, H * 0.88, W * 0.88, Math.min(110 * s, H * 0.08), p.b, 'CALL: 98765 43210', Math.min(44 * s, H * 0.032), '#ffffff'));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });

  // ================= COACHING / ADMISSION =================
  add('admit', 'Admission Open Poster', 'Education', ['a4p', 'sq', 'igp'], ['royal', 'teal', 'red'], function (W, H, p) {
    var q = g(W, H), s = W / 1080, o = [R(0, 0, W, H, p.bg), R(0, 0, W, H * 0.4, p.a), K.wave(W, H, H * 0.4, 50 * s, p.a, false)];
    o = o.concat(stack(W * 0.06, W * 0.6, H * 0.05, H * 0.36, [{ text: 'ADMISSION', size: 120, font: 'Anton', color: '#ffffff', align: 'left', lh: 1, gap: 0 }, { text: 'OPEN', size: 150, font: 'Anton', color: p.acc, align: 'left', lh: 1, gap: 10 }, { text: 'Session 2026–27', size: 40, font: 'Poppins', bold: 600, color: '#ffffff', align: 'left' }], s));
    o.push(C(W * 0.8, H * 0.24, q.m * 0.17, '#ffffff'), P(W * 0.8 - q.m * 0.15, H * 0.24 - q.m * 0.15, q.m * 0.3, q.m * 0.3, 'PHOTO', { shape: 'circle' }));
    var courses = ['Nursery – Class 5', 'Class 6 – 10', 'Class 11 – 12 (Sci / Com)', 'Smart classes', 'Transport facility', 'Computer lab'], top = H * 0.52, ch = Math.min(90 * s, (H * 0.84 - top) / 3);
    courses.forEach(function (c, i) { var x = W * 0.06 + (i % 2) * W * 0.45, y = top + Math.floor(i / 2) * ch * 1.15; o.push(R(x, y, W * 0.43, ch, '#ffffff', { r: ch / 2, stroke: p.c, sw: 3 }), C(x + ch / 2, y + ch / 2, ch * 0.28, p.b), T(x + ch, y + ch * 0.28, W * 0.43 - ch * 1.2, c, ch * 0.34, { font: 'Poppins', bold: 600, color: p.ink })); });
    o.push(R(0, H * 0.9, W, H * 0.1, p.a), T(0, H * 0.92, W, 'Sunrise Public School · 98765 43210', Math.min(40 * s, H * 0.03), { font: 'Poppins', bold: 700, color: '#ffffff', align: 'center' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });

  // ================= FITNESS =================
  add('gym', 'Gym Offer Post', 'Fitness', ['sq', 'igp', 'story'], ['noir', 'red', 'sun'], function (W, H, p) {
    var q = g(W, H), s = q.s, o = [R(0, 0, W, H, dark(p) ? '#0b0f17' : p.a), P(W * 0.35, 0, W * 0.65, H, 'PHOTO', { sw: 0 }), K.POLY([[0, 0], [W * 0.6, 0], [W * 0.42, H], [0, H]], dark(p) ? '#0b0f17' : p.a)];
    o = o.concat(stack(W * 0.06, W * 0.42, H * 0.1, H * 0.74, [{ text: 'GET FIT', size: 150, font: 'Anton', color: '#ffffff', align: 'left', lh: 1, gap: 0 }, { text: 'IN 30 DAYS', size: 100, font: 'Anton', color: dark(p) ? p.b : p.c, align: 'left', lh: 1, gap: 30 }, { text: 'Gym · Cardio · Zumba · Yoga', size: 34, font: 'Poppins', bold: 600, color: '#ffffff', align: 'left', gap: 30 }, { text: '₹999 / month', size: 64, font: 'Montserrat', bold: 800, color: '#ffffff', align: 'left' }], s));
    o = o.concat(pill(W * 0.06, H * 0.82, 420 * s, 100 * s, dark(p) ? p.b : p.c, 'JOIN NOW', 44 * s, dark(p) ? '#111827' : p.a));
    return { pages: [{ bg: '#000000', objects: o }] };
  });

  // ================= THANK YOU =================
  add('thanks', 'Thank You Card', 'Cards', ['sq', 'inv', 'igp'], ['blush', 'gold', 'teal'], function (W, H, p) {
    var q = g(W, H), s = q.s, o = [R(0, 0, W, H, p.bg)].concat(K.frame(W, H, 40 * s, p.b, p.c, true));
    o.push(A('hearts', W / 2 - 120 * s, H * 0.14, 240 * s, null, { cols: [p.b, p.c] }));
    o = o.concat(stack(W * 0.14, W * 0.72, H * 0.3, H * 0.84, [{ text: 'Thank you', size: 190, font: 'Great Vibes', color: p.a, gap: 20 }, { text: 'for being part of our special day. Your love and blessings mean the world to us.', size: 40, font: 'Cormorant Garamond', bold: 600, color: p.ink, lh: 1.4, gap: 30 }, { text: 'ANAYA & RAHUL', size: 34, font: 'Montserrat', bold: 700, color: p.b, ls: 300 }], s));
    return { pages: [{ bg: p.bg, objects: o }] };
  });

  // ================= WALLPAPERS =================
  add('wall', 'Motivation Wallpaper', 'Wallpapers', ['hd', 'story'], ['royal', 'teal', 'noir'], function (W, H, p) {
    var q = g(W, H), s = q.s, o = [R(0, 0, W, H, K.G(135, dark(p) ? '#0f172a' : p.a, dark(p) ? '#1e293b' : p.b))];
    o.push(C(W * 0.85, H * 0.2, q.m * 0.3, '#ffffff', { op: 0.07 }), C(W * 0.1, H * 0.85, q.m * 0.4, '#ffffff', { op: 0.06 }));
    o = o.concat(stack(W * 0.1, W * 0.8, H * 0.22, H * 0.78, [{ text: 'DREAM BIG.', size: 170, font: 'Bebas Neue', color: '#ffffff', ls: 60, lh: 1, gap: 6 }, { text: 'WORK HARD.', size: 170, font: 'Bebas Neue', color: dark(p) ? p.b : p.c, ls: 60, lh: 1, gap: 6 }, { text: 'STAY HUMBLE.', size: 170, font: 'Bebas Neue', color: '#ffffff', ls: 60, lh: 1 }], s));
    return { pages: [{ bg: p.a, objects: o }] };
  });

  // ================= NEWSLETTER =================
  add('news', 'School Newsletter', 'Newsletters', ['a4p'], ['navy', 'forest', 'royal'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff'), R(0, 0, W, 150 * s, p.a)];
    o.push(T(50 * s, 36 * s, W - 100 * s, 'THE MONTHLY TIMES', 44 * s, { font: 'Playfair Display', bold: 800, color: '#ffffff', ls: 60 }), T(50 * s, 100 * s, W - 100 * s, 'Sunrise Public School  ·  Issue 07  ·  December 2026', 14 * s, { font: 'Poppins', color: p.c, ls: 60 }));
    o.push(P(50 * s, 180 * s, W - 100 * s, 300 * s, 'PHOTO', { r: 12 * s }), T(50 * s, 500 * s, W - 100 * s, 'Annual Sports Day was a big success!', 30 * s, { font: 'Playfair Display', bold: 700, color: p.a }));
    o.push(T(50 * s, 548 * s, W - 100 * s, 'More than 600 students took part in races, relays and games. The Blue House won the overall trophy. Thank you to all parents who came to cheer.', 14 * s, { font: 'Poppins', color: p.ink, lh: 1.7 }));
    var cw = (W - 130 * s) / 2;
    [['Toppers of the month', 'Congratulations to our students who scored full marks in the maths olympiad.'], ['Coming up next', 'Science fair on 15 January. Winter break from 25 December to 1 January.']].forEach(function (a, i) {
      var x = 50 * s + i * (cw + 30 * s), y = 660 * s;
      o.push(R(x, y, cw, 4 * s, p.b), P(x, y + 20 * s, cw, 170 * s, 'PHOTO', { r: 10 * s }), T(x, y + 205 * s, cw, a[0], 20 * s, { font: 'Montserrat', bold: 800, color: p.a }), T(x, y + 240 * s, cw, a[1], 13 * s, { font: 'Poppins', color: p.ink, lh: 1.6 }));
    });
    o.push(R(0, H - 50 * s, W, 50 * s, p.c), T(0, H - 36 * s, W, 'www.yourschool.in  ·  98765 43210', 13 * s, { font: 'Poppins', bold: 600, color: p.a, align: 'center' }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });

  // ================= EVENT SCHEDULE =================
  add('agenda', 'Event Schedule', 'Events', ['a4p', 'story', 'igp'], ['royal', 'coral', 'navy'], function (W, H, p) {
    var s = W / 1080, o = [R(0, 0, W, H, p.a)];
    o = o.concat(stack(W * 0.08, W * 0.84, H * 0.05, H * 0.2, [{ text: 'EVENT SCHEDULE', size: 100, font: 'Anton', color: '#ffffff', gap: 8 }, { text: 'Annual Function · 20 December 2026', size: 40, font: 'Poppins', color: p.c }], s));
    var it = [['9:00 AM', 'Welcome & lamp lighting'], ['9:30 AM', 'Prayer and school song'], ['10:00 AM', 'Chief guest speech'], ['10:30 AM', 'Dance & drama'], ['12:00 PM', 'Prize distribution'], ['1:00 PM', 'Lunch for everyone']], top = H * 0.25, rh = (H * 0.92 - top) / it.length;
    it.forEach(function (r, i) { var y = top + i * rh; o.push(R(W * 0.08, y, W * 0.84, rh * 0.8, '#ffffff', { r: 26 * s, op: i % 2 ? 0.1 : 0.16 }), R(W * 0.08, y, W * 0.26, rh * 0.8, p.b, { r: 26 * s }), T(W * 0.08, y + rh * 0.4 - Math.min(44 * s, rh * 0.22) * 0.62, W * 0.26, r[0], Math.min(44 * s, rh * 0.22), { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'center' }), T(W * 0.38, y + rh * 0.4 - Math.min(44 * s, rh * 0.22) * 0.62, W * 0.52, r[1], Math.min(44 * s, rh * 0.22), { font: 'Poppins', bold: 600, color: '#ffffff' })); });
    return { pages: [{ bg: p.a, objects: o }] };
  });

  [].unshift.apply(ST.templates, out);
})();
