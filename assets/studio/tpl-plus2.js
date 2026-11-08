/* S Printer — templates part 3: brochures, letterheads, envelopes, labels, bookmarks, book covers,
 * LinkedIn banners, Pinterest pins, Instagram carousels, planners, report cards, name slips,
 * hiring posts, tribute cards, QR stands and more. New sizes: LinkedIn banner, Pinterest pin,
 * DL envelope, product label and bookmark. Original designs by S Printer; all text is sample text. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, C = K.C, P = K.P, A = K.A, L = K.L;
  var NS = {
    li: { k: 'li', label: 'LinkedIn banner (1584 × 396)', w: 1584, h: 396, short: 'LinkedIn banner', dim: '1584 × 396' },
    pin: { k: 'pin', label: 'Pinterest pin (1000 × 1500)', w: 1000, h: 1500, short: 'Pinterest pin', dim: '1000 × 1500' },
    dl: { k: 'dl', label: 'DL envelope (220 × 110 mm)', w: 1299, h: 650, mm: [220, 110], short: 'Envelope', dim: '220 × 110 mm' },
    label: { k: 'label', label: 'Product label (100 × 70 mm)', w: 1181, h: 827, mm: [100, 70], short: 'Product label', dim: '100 × 70 mm' },
    bmk: { k: 'bmk', label: 'Bookmark (2 × 6 in)', w: 600, h: 1800, mm: [51, 152], short: 'Bookmark', dim: '2 × 6 in' }
  };
  Object.keys(NS).forEach(function (k) { if (!K.SIZES[k]) K.SIZES[k] = NS[k]; });
  var PAL = {
    royal: { bg: '#f5f3ff', a: '#4c1d95', b: '#7c3aed', c: '#ddd6fe', ink: '#1e1b4b', acc: '#f59e0b' },
    teal: { bg: '#f0fdfa', a: '#115e59', b: '#14b8a6', c: '#ccfbf1', ink: '#042f2e', acc: '#f97316' },
    coral: { bg: '#fff5f2', a: '#c2410c', b: '#fb7185', c: '#ffe4e6', ink: '#3f1d12', acc: '#0ea5e9' },
    gold: { bg: '#fffbeb', a: '#78350f', b: '#b45309', c: '#fde68a', ink: '#1c1917', acc: '#b91c1c' },
    navy: { bg: '#f1f5f9', a: '#0f172a', b: '#2563eb', c: '#dbeafe', ink: '#0f172a', acc: '#facc15' },
    blush: { bg: '#fff1f5', a: '#9d174d', b: '#ec4899', c: '#fce7f3', ink: '#3b0a24', acc: '#8b5cf6' },
    forest: { bg: '#f0fdf4', a: '#14532d', b: '#16a34a', c: '#dcfce7', ink: '#052e16', acc: '#eab308' },
    slate: { bg: '#f8fafc', a: '#1e293b', b: '#475569', c: '#e2e8f0', ink: '#0f172a', acc: '#0ea5e9' },
    sun: { bg: '#fefce8', a: '#1c1917', b: '#eab308', c: '#fef08a', ink: '#1c1917', acc: '#dc2626' },
    red: { bg: '#fff1f2', a: '#7f1d1d', b: '#dc2626', c: '#fecaca', ink: '#1f1111', acc: '#facc15' }
  };
  var out = [];
  function add(id, name, cat, sizes, pals, build) { pals.forEach(function (k, i) { out.push({ id: 'pl2-' + id + '-' + k, name: name + (i ? ' · ' + k[0].toUpperCase() + k.slice(1) : ''), cat: cat, sizes: sizes, pal: PAL[k], build: build }); }); }
  function stack(x, w, top, bot, items, s, o) { return K.stack(x, w, top, bot, items, Object.assign({ maxK: s * 1.15 }, o || {})); }
  function pill(x, y, w, h, fill, text, size, col) { return [R(x, y, w, h, fill, { r: h / 2 }), T(x, y + (h - size * 1.22) / 2, w, text, size, { font: 'Poppins', bold: 700, color: col, align: 'center', ls: 40 })]; }
  function lines(x, y, w, n, gap, col) { var o = []; for (var i = 0; i < n; i++) o.push(L(x, y + i * gap, x + w, y + i * gap, col, 1)); return o; }

  // ================= BROCHURES (tri-fold, 2 pages) =================
  add('tri', 'Tri-fold Brochure', 'Brochures', ['a4l'], ['teal', 'navy', 'coral'], function (W, H, p) {
    var s = W / 1123, pw = W / 3, m = 34 * s;
    var o1 = [R(0, 0, W, H, '#ffffff')];
    // outside: inside flap | back | front
    o1.push(T(m, 60 * s, pw - 2 * m, 'WHY CHOOSE US', 24 * s, { font: 'Montserrat', bold: 800, color: p.a, ls: 120 }));
    ['Trained, friendly staff', 'Fair and clear prices', 'Fast service, same day', 'Clean and modern place', 'Open 7 days a week'].forEach(function (t, i) { o1.push(C(m + 12 * s, 140 * s + i * 62 * s, 12 * s, p.b), T(m + 36 * s, 128 * s + i * 62 * s, pw - 2 * m - 40 * s, t, 17 * s, { font: 'Poppins', color: p.ink })); });
    o1.push(P(m, 470 * s, pw - 2 * m, 260 * s, 'PHOTO', { r: 14 * s }));
    o1.push(R(pw, 0, pw, H, p.c), T(pw + m, 80 * s, pw - 2 * m, 'CONTACT US', 24 * s, { font: 'Montserrat', bold: 800, color: p.a, ls: 120, align: 'center' }));
    o1 = o1.concat(K.rows(pw + m, 150 * s, pw - 2 * m, [['Phone', '98765 43210'], ['E-mail', 'hello@yourname.in'], ['Address', 'Main Road, Your City'], ['Hours', '9 AM – 8 PM']], 16 * s, { vc: p.ink, kc: p.a, kw: 0.32, font: 'Poppins' }));
    o1.push(K.Q(pw + pw / 2 - 90 * s, 470 * s, 180 * s, 'https://example.com'), T(pw + m, 670 * s, pw - 2 * m, 'Scan to visit our website', 14 * s, { font: 'Poppins', color: p.ink, align: 'center' }));
    o1.push(R(2 * pw, 0, pw, H, p.a), P(2 * pw, 0, pw, H * 0.52, 'PHOTO', { sw: 0 }));
    o1 = o1.concat(stack(2 * pw + m, pw - 2 * m, H * 0.56, H * 0.9, [{ text: 'BRIGHT SMILE', size: 46, font: 'Anton', color: '#ffffff', ls: 40, gap: 8 }, { text: 'DENTAL CLINIC', size: 22, font: 'Montserrat', bold: 700, color: p.c, ls: 300, gap: 24 }, { text: 'Care for your whole family', size: 18, font: 'Poppins', color: '#ffffff' }], s));
    var o2 = [R(0, 0, W, H, '#ffffff')];
    [['Our services', 'Check-ups, cleaning, fillings, braces and painless root canal treatment for all ages.'], ['Our doctors', 'Experienced doctors with more than 15 years of practice. Friendly with children.'], ['Book a visit', 'Call or WhatsApp us to book a time. Walk-ins are welcome on weekdays.']].forEach(function (c, i) {
      var x = i * pw + m;
      o2.push(R(x, 50 * s, 60 * s, 6 * s, p.b), T(x, 74 * s, pw - 2 * m, c[0], 30 * s, { font: 'Playfair Display', bold: 700, color: p.a }), T(x, 130 * s, pw - 2 * m, c[1], 16 * s, { font: 'Poppins', color: p.ink, lh: 1.7 }), P(x, 330 * s, pw - 2 * m, 360 * s, 'PHOTO', { r: 16 * s }));
      if (i) o2.push(L(i * pw, 40 * s, i * pw, H - 40 * s, p.c, 1, { dash: [6, 6] }));
    });
    return { pages: [{ bg: '#ffffff', objects: o1 }, { bg: '#ffffff', objects: o2 }] };
  });
  add('trishop', 'Shop Brochure', 'Brochures', ['a4l'], ['gold', 'blush', 'forest'], function (W, H, p) {
    var s = W / 1123, pw = W / 3, m = 34 * s, o1 = [R(0, 0, W, H, p.bg)], o2 = [R(0, 0, W, H, '#ffffff')];
    o1.push(T(m, 70 * s, pw - 2 * m, 'Our story', 34 * s, { font: 'Great Vibes', color: p.a }), T(m, 130 * s, pw - 2 * m, 'We started as a small family shop in 2010. Today we bring handmade, fresh and honest products to thousands of happy homes.', 16 * s, { font: 'Poppins', color: p.ink, lh: 1.75 }), P(m, 380 * s, pw - 2 * m, 340 * s, 'PHOTO', { r: 120 * s }));
    o1.push(R(pw, 0, pw, H, p.c), T(pw + m, 300 * s, pw - 2 * m, 'Visit us', 40 * s, { font: 'Great Vibes', color: p.a, align: 'center' }), T(pw + m, 370 * s, pw - 2 * m, '12, Market Street\nYour City – 700001\n\n98765 43210\nhello@yourshop.in', 17 * s, { font: 'Poppins', color: p.ink, align: 'center', lh: 1.6 }));
    o1.push(P(2 * pw, 0, pw, H, 'PHOTO', { sw: 0 }), R(2 * pw + m, H * 0.6, pw - 2 * m, H * 0.3, '#ffffff', { r: 16 * s, op: 0.94 }), T(2 * pw + m, H * 0.63, pw - 2 * m, 'Nature’s Basket', 40 * s, { font: 'Playfair Display', bold: 700, color: p.a, align: 'center' }), T(2 * pw + m, H * 0.63 + 64 * s, pw - 2 * m, 'ORGANIC • HANDMADE • FRESH', 13 * s, { font: 'Montserrat', bold: 700, color: p.b, align: 'center', ls: 200 }));
    [['Spices', '₹99+'], ['Honey', '₹249+'], ['Pickles', '₹149+'], ['Snacks', '₹79+'], ['Tea', '₹199+'], ['Gift boxes', '₹499+']].forEach(function (it, i) {
      var col = Math.floor(i / 2), row = i % 2, x = col * pw + m, y = 60 * s + row * 360 * s;
      o2.push(P(x, y, pw - 2 * m, 230 * s, 'PHOTO', { r: 14 * s }), T(x, y + 248 * s, pw - 2 * m, it[0], 26 * s, { font: 'Playfair Display', bold: 700, color: p.a }), T(x, y + 252 * s, pw - 2 * m, it[1], 20 * s, { font: 'Poppins', bold: 700, color: p.b, align: 'right' }));
    });
    return { pages: [{ bg: p.bg, objects: o1 }, { bg: '#ffffff', objects: o2 }] };
  });

  // ================= LETTERHEADS =================
  add('lhbar', 'Business Letterhead', 'Letterheads', ['a4p'], ['navy', 'teal', 'red'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff'), R(0, 0, 14 * s, H, p.b), R(14 * s, 0, 6 * s, H, p.c)];
    o.push(C(90 * s, 84 * s, 34 * s, p.a), T(56 * s, 66 * s, 68 * s, 'YB', 28 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'center' }));
    o.push(T(140 * s, 56 * s, 400 * s, 'YOUR BUSINESS', 28 * s, { font: 'Montserrat', bold: 800, color: p.a, ls: 100 }), T(140 * s, 96 * s, 400 * s, 'Tagline or what you do', 14 * s, { font: 'Poppins', color: p.b }));
    o.push(T(W - 290 * s, 56 * s, 250 * s, '98765 43210\nhello@yourbusiness.in\nwww.yourbusiness.in', 12 * s, { font: 'Poppins', color: p.ink, align: 'right', lh: 1.6 }));
    o.push(L(56 * s, 150 * s, W - 40 * s, 150 * s, p.c, 2), T(56 * s, 190 * s, W - 110 * s, 'Date: __________\n\nTo,\nName\nAddress\n\nSubject: ________________________\n\nDear Sir / Madam,\n\nWrite your letter here.', 15 * s, { font: 'Poppins', color: p.ink, lh: 1.7 }));
    o.push(R(0, H - 60 * s, W, 60 * s, p.a), T(0, H - 40 * s, W, 'Office: 12, Main Road, Your City – 700001  ·  GSTIN: ______________', 12 * s, { font: 'Poppins', color: '#ffffff', align: 'center' }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('lhmin', 'Minimal Letterhead', 'Letterheads', ['a4p'], ['slate', 'gold', 'forest'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff')];
    o.push(T(0, 60 * s, W, 'Aarav Sharma', 34 * s, { font: 'Playfair Display', bold: 700, color: p.a, align: 'center' }), T(0, 108 * s, W, 'ADVOCATE  ·  HIGH COURT', 13 * s, { font: 'Montserrat', bold: 700, color: p.b, align: 'center', ls: 400 }));
    o = o.concat(K.divider(W / 2, 150 * s, W * 0.5, p.b));
    o.push(T(70 * s, 200 * s, W - 140 * s, 'Date: __________\n\nWrite your letter here.', 15 * s, { font: 'Poppins', color: p.ink, lh: 1.7 }));
    o.push(L(70 * s, H - 90 * s, W - 70 * s, H - 90 * s, p.c, 1), T(0, H - 70 * s, W, 'Chamber 4, Court Road, Your City  ·  98765 43210  ·  aarav@email.in', 12 * s, { font: 'Poppins', color: p.b, align: 'center' }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('lhschool', 'School Letterhead', 'Letterheads', ['a4p'], ['royal', 'navy', 'forest'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff'), R(0, 0, W, 160 * s, p.a), K.wave(W, H, 160 * s, 16 * s, p.a, false)];
    o.push(C(90 * s, 80 * s, 50 * s, '#ffffff'), A('ic-book', 60 * s, 52 * s, 60 * s, 60 * s, { cols: [p.b] }));
    o.push(T(160 * s, 40 * s, W - 200 * s, 'SUNRISE PUBLIC SCHOOL', 30 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', ls: 60 }), T(160 * s, 84 * s, W - 200 * s, 'Affiliated to Board · School code 12345\nStation Road, Your City · 98765 43210', 12 * s, { font: 'Poppins', color: p.c, lh: 1.6 }));
    o.push(T(60 * s, 220 * s, W - 120 * s, 'Ref. No: ________                                                     Date: __________\n\nWrite your notice or letter here.', 15 * s, { font: 'Poppins', color: p.ink, lh: 1.7 }));
    o.push(T(W - 280 * s, H - 150 * s, 220 * s, 'Principal', 14 * s, { font: 'Poppins', bold: 600, color: p.ink, align: 'center' }), L(W - 280 * s, H - 160 * s, W - 60 * s, H - 160 * s, p.ink, 1), R(0, H - 24 * s, W, 24 * s, p.b));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });

  // ================= ENVELOPES =================
  add('env', 'Business Envelope', 'Envelopes', ['dl'], ['navy', 'teal', 'gold'], function (W, H, p) {
    var s = H / 650, o = [R(0, 0, W, H, '#ffffff'), R(0, 0, 24 * s, H, p.b)];
    o.push(C(110 * s, 100 * s, 40 * s, p.a), T(70 * s, 80 * s, 80 * s, 'YB', 32 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'center' }), T(170 * s, 72 * s, 600 * s, 'YOUR BUSINESS', 30 * s, { font: 'Montserrat', bold: 800, color: p.a, ls: 80 }), T(170 * s, 114 * s, 600 * s, '12, Main Road, Your City – 700001 · 98765 43210', 18 * s, { font: 'Poppins', color: p.ink }));
    o.push(T(W * 0.5, H * 0.5, W * 0.42, 'To,\nName of the person\nHouse / Street\nCity – PIN', 26 * s, { font: 'Poppins', color: p.ink, lh: 1.6 }));
    o.push(R(W - 190 * s, 40 * s, 140 * s, 160 * s, null, { stroke: p.c, sw: 3, dash: [8, 6] }), T(W - 190 * s, 106 * s, 140 * s, 'STAMP', 16 * s, { font: 'Montserrat', bold: 700, color: p.c, align: 'center', ls: 200 }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('envwed', 'Wedding Envelope', 'Envelopes', ['dl'], ['gold', 'blush', 'red'], function (W, H, p) {
    var s = H / 650, o = [R(0, 0, W, H, p.bg)].concat(K.frame(W, H, 26 * s, p.b, p.c, true));
    o.push(K.POLY([[0, 0], [W, 0], [W / 2, H * 0.48]], p.c, { op: 0.6 }), C(W / 2, H * 0.46, 70 * s, p.a), T(W / 2 - 70 * s, H * 0.46 - 42 * s, 140 * s, 'A&R', 50 * s, { font: 'Great Vibes', color: '#ffffff', align: 'center' }));
    o.push(T(0, H * 0.66, W, 'Shri / Smt. ______________________', 30 * s, { font: 'Cormorant Garamond', bold: 600, color: p.a, align: 'center' }), T(0, H * 0.78, W, 'With best compliments', 22 * s, { font: 'Poppins', color: p.ink, align: 'center' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });

  // ================= PRODUCT LABELS =================
  add('honey', 'Jar Label', 'Labels & Stickers', ['label', 'sq'], ['gold', 'forest', 'coral'], function (W, H, p) {
    var s = Math.min(W, H) / 827, cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.46;
    var o = [R(0, 0, W, H, p.c), C(cx, cy, r, '#ffffff', { stroke: p.b, sw: 10 * s }), C(cx, cy, r - 28 * s, null, { stroke: p.b, sw: 3 * s, dash: [10, 8] })];
    o.push(T(cx - r * 0.8, cy - r * 0.62, r * 1.6, 'PURE & NATURAL', 26 * s, { font: 'Montserrat', bold: 800, color: p.b, align: 'center', ls: 200 }), T(cx - r * 0.8, cy - r * 0.38, r * 1.6, 'Wild Honey', 110 * s, { font: 'Great Vibes', color: p.a, align: 'center' }));
    o = o.concat(K.divider(cx, cy + r * 0.12, r * 1.0, p.b));
    o.push(T(cx - r * 0.8, cy + r * 0.24, r * 1.6, 'Net wt. 500 g  ·  Best before 12 months', 22 * s, { font: 'Poppins', color: p.ink, align: 'center' }), T(cx - r * 0.8, cy + r * 0.44, r * 1.6, 'NATURE’S BASKET', 24 * s, { font: 'Montserrat', bold: 800, color: p.a, align: 'center', ls: 300 }));
    return { pages: [{ bg: p.c, objects: o }] };
  });
  add('ship', 'Shipping Label', 'Labels & Stickers', ['label'], ['slate', 'navy', 'red'], function (W, H, p) {
    var s = H / 827, o = [R(0, 0, W, H, '#ffffff'), R(20 * s, 20 * s, W - 40 * s, H - 40 * s, null, { stroke: p.a, sw: 4 * s })];
    o.push(R(20 * s, 20 * s, W - 40 * s, 100 * s, p.a), T(50 * s, 44 * s, W - 100 * s, 'SHIP TO', 44 * s, { font: 'Anton', color: '#ffffff', ls: 100 }));
    o.push(T(60 * s, 150 * s, W * 0.6, 'Customer Name\nHouse / Flat, Street\nArea, City – PIN\nPhone: 98765 43210', 34 * s, { font: 'Poppins', color: p.ink, lh: 1.5 }));
    o.push(L(40 * s, 500 * s, W - 40 * s, 500 * s, p.c, 3), T(60 * s, 520 * s, W * 0.55, 'FROM: Your Shop, Main Road, Your City', 24 * s, { font: 'Poppins', color: p.ink }), T(60 * s, 600 * s, W * 0.5, 'Order #10234   ·   Weight 1.2 kg', 24 * s, { font: 'Poppins', bold: 700, color: p.a }));
    o.push(K.B(W * 0.6, 540 * s, W * 0.34, 220 * s, '10234567890'));
    o.push(R(W - 300 * s, 150 * s, 240 * s, 70 * s, p.b, { r: 10 * s }), T(W - 300 * s, 164 * s, 240 * s, 'FRAGILE', 36 * s, { font: 'Anton', color: '#ffffff', align: 'center', ls: 100 }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('thanksbuy', 'Thank You For Shopping Card', 'Labels & Stickers', ['bcard', 'label'], ['blush', 'teal', 'gold'], function (W, H, p) {
    var s = H / 602, o = [R(0, 0, W, H, p.bg), R(0, H - 90 * s, W, 90 * s, p.c)];
    o.push(A('hearts', W / 2 - 70 * s, 40 * s, 140 * s, null, { cols: [p.b, p.c] }), T(0, 150 * s, W, 'Thank you', 120 * s, { font: 'Great Vibes', color: p.a, align: 'center' }), T(0, 300 * s, W, 'FOR SHOPPING WITH US', 26 * s, { font: 'Montserrat', bold: 800, color: p.b, align: 'center', ls: 300 }));
    o.push(T(W * 0.1, 360 * s, W * 0.8, 'Your support means the world to our small business. Tag us @yourshop', 22 * s, { font: 'Poppins', color: p.ink, align: 'center', lh: 1.5 }), T(0, H - 64 * s, W, 'Use code THANKS10 for 10% off your next order', 20 * s, { font: 'Poppins', bold: 700, color: p.a, align: 'center' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });

  // ================= BOOKMARKS =================
  add('bmquote', 'Quote Bookmark', 'Bookmarks', ['bmk'], ['royal', 'teal', 'blush'], function (W, H, p) {
    var s = W / 600, o = [R(0, 0, W, H, K.G(180, p.c, p.bg))];
    o.push(C(W / 2, 110 * s, 34 * s, '#ffffff', { stroke: p.b, sw: 4 * s }), C(W / 2, 110 * s, 12 * s, p.b));
    o.push(A('lotus', W / 2 - 160 * s, 260 * s, 320 * s));
    o = o.concat(stack(60 * s, W - 120 * s, H * 0.42, H * 0.82, [{ text: 'A reader lives a thousand lives before he dies.', size: 64, font: 'Playfair Display', italic: true, color: p.a, lh: 1.35, gap: 40 }, { div: p.b, w: W * 0.4 }, { text: 'KEEP READING', size: 26, font: 'Montserrat', bold: 800, color: p.b, ls: 400 }], s));
    o.push(T(0, H - 120 * s, W, 'This book belongs to\n______________', 24 * s, { font: 'Poppins', color: p.ink, align: 'center', lh: 1.6 }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('bmphoto', 'Photo Bookmark', 'Bookmarks', ['bmk'], ['navy', 'forest', 'coral'], function (W, H, p) {
    var s = W / 600, o = [R(0, 0, W, H, p.a), P(0, 0, W, H * 0.62, 'PHOTO', { sw: 0 })];
    o.push(C(W / 2, 90 * s, 30 * s, '#ffffff'));
    o = o.concat(stack(50 * s, W - 100 * s, H * 0.66, H * 0.94, [{ text: 'STUDY', size: 120, font: 'Anton', color: '#ffffff', ls: 80, gap: 0 }, { text: 'HARD', size: 120, font: 'Anton', color: p.acc, ls: 80, gap: 30 }, { text: 'Small steps every day', size: 30, font: 'Poppins', color: p.c }], s));
    return { pages: [{ bg: p.a, objects: o }] };
  });

  // ================= BOOK COVERS =================
  add('novel', 'Novel Book Cover', 'Book Covers', ['a5p'], ['navy', 'red', 'forest'], function (W, H, p) {
    var s = W / 559, o = [P(0, 0, W, H, 'PHOTO', { sw: 0 }), R(0, 0, W, H, K.G(90, 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)'))];
    o.push(T(40 * s, 60 * s, W - 80 * s, 'A NOVEL', 16 * s, { font: 'Montserrat', bold: 700, color: '#ffffff', align: 'center', ls: 600 }));
    o = o.concat(stack(40 * s, W - 80 * s, H * 0.56, H * 0.82, [{ text: 'THE LAST', size: 64, font: 'Cinzel', bold: 700, color: '#ffffff', ls: 100, gap: 0 }, { text: 'MONSOON', size: 76, font: 'Cinzel', bold: 700, color: p.acc, ls: 100 }], s));
    o.push(T(0, H - 80 * s, W, 'AUTHOR NAME', 22 * s, { font: 'Montserrat', bold: 700, color: '#ffffff', align: 'center', ls: 400 }));
    return { pages: [{ bg: '#000000', objects: o }] };
  });
  add('notebook', 'Notebook Cover', 'Book Covers', ['a5p', 'a4p'], ['royal', 'teal', 'sun'], function (W, H, p) {
    var s = W / 559, o = [R(0, 0, W, H, p.b)];
    for (var i = 0; i < 12; i++) o.push(C(W * ((i * 37 + 9) % 100) / 100, H * ((i * 61 + 7) % 100) / 100, (16 + (i * 17) % 40) * s, '#ffffff', { op: 0.14 }));
    o.push(R(W * 0.12, H * 0.34, W * 0.76, H * 0.28, '#ffffff', { r: 18 * s }), T(W * 0.12, H * 0.37, W * 0.76, 'NOTEBOOK', 40 * s, { font: 'Montserrat', bold: 800, color: p.a, align: 'center', ls: 200 }));
    o = o.concat(K.rows(W * 0.18, H * 0.45, W * 0.64, [['Name', '____________'], ['Class', '______'], ['Subject', '__________']], 17 * s, { vc: p.ink, kc: p.b, kw: 0.32, font: 'Poppins' }));
    return { pages: [{ bg: p.b, objects: o }] };
  });
  add('kidsbook', 'Kids Story Book Cover', 'Book Covers', ['a5p', 'sq'], ['sun', 'blush', 'teal'], function (W, H, p) {
    var s = Math.min(W, H) / 559, o = [R(0, 0, W, H, p.c), K.wave(W, H, H * 0.72, 30 * s, p.b, true)];
    o.push(C(W * 0.8, H * 0.14, 50 * s, p.acc), A('star', W * 0.1, H * 0.1, 60 * s), A('star', W * 0.3, H * 0.2, 36 * s));
    o = o.concat(stack(30 * s, W - 60 * s, H * 0.26, H * 0.5, [{ text: 'Tara and the', size: 44, font: 'Lilita One', color: p.a, gap: 0 }, { text: 'Magic Kite', size: 66, font: 'Lilita One', color: p.b }], s));
    var pr = Math.min(W * 0.25, H * 0.17); o.push(P(W / 2 - pr, H * 0.52, pr * 2, pr * 2, 'PHOTO', { shape: 'circle' }), T(0, H - 60 * s, W, 'Written by Your Name', 20 * s, { font: 'Poppins', bold: 600, color: '#ffffff', align: 'center' }));
    return { pages: [{ bg: p.c, objects: o }] };
  });

  // ================= LINKEDIN BANNERS =================
  add('liprof', 'Professional LinkedIn Banner', 'LinkedIn Banners', ['li'], ['navy', 'teal', 'slate'], function (W, H, p) {
    var s = H / 396, o = [R(0, 0, W, H, K.G(90, p.a, p.b))];
    for (var i = 0; i < 6; i++) o.push(C(W * 0.55 + i * 150 * s, H * (i % 2 ? 0.2 : 0.9), (60 + i * 12) * s, '#ffffff', { op: 0.06 }));
    o = o.concat(stack(W * 0.36, W * 0.6, H * 0.2, H * 0.82, [{ text: 'Helping small businesses grow online', size: 52, font: 'Montserrat', bold: 800, color: '#ffffff', align: 'left', gap: 14 }, { text: 'Web design  ·  Social media  ·  Branding', size: 26, font: 'Poppins', color: p.c, align: 'left' }], s));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('listud', 'Student LinkedIn Banner', 'LinkedIn Banners', ['li'], ['royal', 'forest', 'coral'], function (W, H, p) {
    var s = H / 396, o = [R(0, 0, W, H, p.bg), R(W * 0.62, 0, W * 0.38, H, p.c), P(W * 0.66, 30 * s, W * 0.3, H - 60 * s, 'PHOTO', { r: 20 * s })];
    o = o.concat(stack(W * 0.3, W * 0.3, H * 0.18, H * 0.84, [{ text: 'B.Tech CSE · 2026', size: 22, font: 'Montserrat', bold: 700, color: p.b, align: 'left', ls: 100, gap: 10 }, { text: 'Learning, building & sharing', size: 42, font: 'Playfair Display', bold: 700, color: p.a, align: 'left', gap: 12 }, { text: 'Python  ·  Web  ·  Data', size: 22, font: 'Poppins', color: p.ink, align: 'left' }], s));
    return { pages: [{ bg: p.bg, objects: o }] };
  });

  // ================= PINTEREST PINS =================
  add('pintips', 'Tips Pin', 'Pinterest Pins', ['pin', 'story'], ['coral', 'teal', 'royal'], function (W, H, p) {
    var s = W / 1000, o = [R(0, 0, W, H, p.bg), P(0, 0, W, H * 0.42, 'PHOTO', { sw: 0 }), R(W * 0.08, H * 0.36, W * 0.84, 170 * s, p.a, { r: 20 * s })];
    o.push(T(W * 0.08, H * 0.36 + 30 * s, W * 0.84, '7 EASY WAYS', 50 * s, { font: 'Anton', color: '#ffffff', align: 'center', ls: 60 }), T(W * 0.08, H * 0.36 + 98 * s, W * 0.84, 'to save money every month', 34 * s, { font: 'Poppins', color: p.c, align: 'center' }));
    ['Make a simple budget', 'Cook at home more', 'Buy in bulk', 'Cancel unused apps', 'Use public transport', 'Wait 24 hours before buying', 'Save first, spend later'].forEach(function (t, i) { var y = H * 0.36 + 230 * s + i * 100 * s; o.push(C(W * 0.13, y + 24 * s, 28 * s, p.b), T(W * 0.13 - 28 * s, y + 4 * s, 56 * s, String(i + 1), 32 * s, { font: 'Anton', color: '#ffffff', align: 'center' }), T(W * 0.2, y + 2 * s, W * 0.7, t, 36 * s, { font: 'Poppins', bold: 600, color: p.ink })); });
    o.push(T(0, H - 60 * s, W, 'yourblog.in', 26 * s, { font: 'Poppins', bold: 700, color: p.b, align: 'center' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('pinrecipe', 'Recipe Pin', 'Pinterest Pins', ['pin'], ['gold', 'forest', 'red'], function (W, H, p) {
    var s = W / 1000, o = [P(0, 0, W, H * 0.48, 'PHOTO', { sw: 0 }), P(0, H * 0.52, W, H * 0.48, 'PHOTO', { sw: 0 }), R(0, H * 0.4, W, H * 0.2, p.bg)];
    o = o.concat(stack(W * 0.08, W * 0.84, H * 0.415, H * 0.585, [{ text: 'EASY 15-MINUTE', size: 32, font: 'Montserrat', bold: 800, color: p.b, ls: 200, gap: 6 }, { text: 'Paneer Butter Masala', size: 74, font: 'Playfair Display', bold: 700, color: p.a }], s));
    return { pages: [{ bg: p.bg, objects: o }] };
  });

  // ================= INSTAGRAM CAROUSEL (5 slides) =================
  function carousel(title, sub, items, p, W, H, fontH) {
    var s = W / 1080, pages = [];
    var c0 = [R(0, 0, W, H, p.a)];
    c0 = c0.concat(stack(W * 0.1, W * 0.8, H * 0.22, H * 0.72, [{ text: title, size: 120, font: fontH, bold: 800, color: '#ffffff', lh: 1.05, gap: 30 }, { text: sub, size: 40, font: 'Poppins', color: p.c }], s));
    c0.push(T(W * 0.1, H * 0.86, W * 0.8, 'SWIPE  →', 34 * s, { font: 'Montserrat', bold: 800, color: p.c, align: 'right', ls: 200 }));
    pages.push({ bg: p.a, objects: c0 });
    items.forEach(function (it, i) {
      var o = [R(0, 0, W, H, p.bg), T(W * 0.1, H * 0.1, W * 0.3, '0' + (i + 1), 160 * s, { font: 'Anton', color: p.c })];
      o = o.concat(stack(W * 0.1, W * 0.8, H * 0.32, H * 0.82, [{ text: it[0], size: 80, font: fontH, bold: 800, color: p.a, align: 'left', gap: 30 }, { text: it[1], size: 40, font: 'Poppins', color: p.ink, align: 'left', lh: 1.5 }], s));
      o.push(T(W * 0.1, H * 0.9, W * 0.8, (i + 2) + ' / ' + (items.length + 1), 28 * s, { font: 'Poppins', bold: 600, color: p.b, align: 'right' }));
      pages.push({ bg: p.bg, objects: o });
    });
    return { pages: pages };
  }
  add('carstudy', 'Study Tips Carousel', 'Instagram Carousels', ['sq', 'igp'], ['royal', 'teal', 'coral'], function (W, H, p) {
    return carousel('4 study tips that really work', 'Save this for exam time', [['Plan your day', 'Write 3 small goals each morning and tick them off.'], ['Use a timer', 'Study 25 minutes, rest 5. Repeat four times.'], ['Teach someone', 'Explain the topic to a friend in simple words.'], ['Sleep well', 'Your brain stores what you learned while you sleep.']], p, W, H, 'Montserrat');
  });
  add('carbiz', 'Business Tips Carousel', 'Instagram Carousels', ['sq', 'igp'], ['navy', 'gold', 'forest'], function (W, H, p) {
    return carousel('Grow your shop online', '4 simple steps for small businesses', [['Post every day', 'Show your products, your team and happy customers.'], ['Use WhatsApp', 'Share a catalogue and reply to customers quickly.'], ['Ask for reviews', 'Happy buyers bring new buyers. Just ask them!'], ['Give offers', 'Small festival offers keep people coming back.']], p, W, H, 'Playfair Display');
  });

  // ================= PLANNERS =================
  add('daily', 'Daily Planner', 'Planners', ['a4p', 'a5p'], ['blush', 'teal', 'sun'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff')];
    o.push(T(50 * s, 40 * s, W * 0.6, 'Daily Planner', 46 * s, { font: 'Dancing Script', bold: 700, color: p.a }), T(W * 0.5, 58 * s, W * 0.5 - 50 * s, 'DATE ___ / ___ / ______', 15 * s, { font: 'Montserrat', bold: 700, color: p.ink, align: 'right', ls: 80 }));
    var lx = 50 * s, lw = W * 0.5, rx = lx + lw + 30 * s, rw = W - rx - 50 * s, top = 130 * s;
    o.push(R(lx, top, lw, 40 * s, p.c, { r: 10 * s }), T(lx + 14 * s, top + 10 * s, lw, 'SCHEDULE', 15 * s, { font: 'Montserrat', bold: 800, color: p.a, ls: 200 }));
    for (var h = 0; h < 15; h++) { var y = top + 60 * s + h * ((H - top - 120 * s) / 15); o.push(T(lx, y, 60 * s, (h + 6 > 12 ? h - 6 : h + 6) + (h + 6 >= 12 ? ' pm' : ' am'), 13 * s, { font: 'Poppins', bold: 600, color: p.b }), L(lx + 64 * s, y + 18 * s, lx + lw, y + 18 * s, p.c, 1)); }
    [['TOP 3 PRIORITIES', 3], ['TO DO', 7], ['NOTES', 5]].forEach(function (b, i) {
      var y = top + [0, 220, 620][i] * s, hh = [200, 380, H / s - 120 - 620 - 130][i] * s;
      o.push(R(rx, y, rw, hh, '#ffffff', { r: 14 * s, stroke: p.c, sw: 2 }), T(rx + 16 * s, y + 14 * s, rw, b[0], 14 * s, { font: 'Montserrat', bold: 800, color: p.a, ls: 200 }));
      for (var k = 0; k < b[1]; k++) { var yy = y + 54 * s + k * 44 * s; if (yy > y + hh - 20 * s) break; if (i < 2) o.push(R(rx + 16 * s, yy, 18 * s, 18 * s, '#ffffff', { r: 4 * s, stroke: p.b, sw: 2 })); o.push(L(rx + (i < 2 ? 44 : 16) * s, yy + 18 * s, rx + rw - 16 * s, yy + 18 * s, p.c, 1)); }
    });
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('meal', 'Weekly Meal Planner', 'Planners', ['a4l'], ['forest', 'coral', 'gold'], function (W, H, p) {
    var s = H / 794, o = [R(0, 0, W, H, p.bg)];
    o.push(T(0, 30 * s, W, 'Weekly Meal Planner', 44 * s, { font: 'Pacifico', color: p.a, align: 'center' }));
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'], x0 = 40 * s, lw = 120 * s, top = 120 * s, cw = (W - x0 * 2 - lw) / 7, rh = (H - top - 140 * s) / 4;
    days.forEach(function (d, i) { o.push(R(x0 + lw + i * cw + 3 * s, top, cw - 6 * s, 40 * s, p.b, { r: 10 * s }), T(x0 + lw + i * cw, top + 9 * s, cw, d.toUpperCase(), 16 * s, { font: 'Montserrat', bold: 800, color: '#ffffff', align: 'center', ls: 100 })); });
    meals.forEach(function (m, j) { var y = top + 50 * s + j * rh; o.push(R(x0, y + 3 * s, lw - 8 * s, rh - 6 * s, p.c, { r: 10 * s }), T(x0, y + rh / 2 - 10 * s, lw - 8 * s, m, 15 * s, { font: 'Poppins', bold: 700, color: p.a, align: 'center' })); for (var i = 0; i < 7; i++) o.push(R(x0 + lw + i * cw + 3 * s, y + 3 * s, cw - 6 * s, rh - 6 * s, '#ffffff', { r: 10 * s, stroke: p.c, sw: 1.5 })); });
    o.push(T(x0, H - 70 * s, W - 2 * x0, 'Shopping list: ____________________________________________________________________', 15 * s, { font: 'Poppins', color: p.ink }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });

  // ================= SCHOOL =================
  add('report', 'Student Report Card', 'Education', ['a4p'], ['navy', 'royal', 'forest'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff'), R(20 * s, 20 * s, W - 40 * s, H - 40 * s, null, { stroke: p.b, sw: 3 })];
    o.push(T(0, 50 * s, W, 'SUNRISE PUBLIC SCHOOL', 28 * s, { font: 'Montserrat', bold: 800, color: p.a, align: 'center', ls: 80 }), T(0, 90 * s, W, 'PROGRESS REPORT  ·  2026–27', 15 * s, { font: 'Poppins', bold: 600, color: p.b, align: 'center', ls: 200 }));
    o.push(P(W - 170 * s, 140 * s, 110 * s, 130 * s, 'PHOTO', { r: 8 * s }));
    o = o.concat(K.rows(60 * s, 150 * s, W - 260 * s, [['Name', 'Student Name'], ['Class', 'VII  ·  Section A'], ['Roll no.', '21'], ['Father’s name', '____________']], 15 * s, { vc: p.ink, kc: p.a, kw: 0.32, font: 'Poppins' }));
    var x = 60 * s, w = W - 120 * s, cols = [0.4, 0.15, 0.15, 0.15, 0.15], hd = ['Subject', 'Term 1', 'Term 2', 'Total', 'Grade'], rows = [['English', '', '', '', ''], ['Bengali / Hindi', '', '', '', ''], ['Mathematics', '', '', '', ''], ['Science', '', '', '', ''], ['Social Science', '', '', '', ''], ['Computer', '', '', '', ''], ['Drawing', '', '', '', '']], y = 330 * s, rh = 44 * s;
    function row(c, yy, head) { var cx = x; o.push(R(x, yy, w, rh, head ? p.a : '#ffffff', { stroke: p.c, sw: 1 })); c.forEach(function (t, i) { if (i) o.push(L(cx, yy, cx, yy + rh, p.c, 1)); o.push(T(cx + 10 * s, yy + 12 * s, w * cols[i] - 20 * s, t, 15 * s, { font: 'Poppins', bold: head ? 700 : 500, color: head ? '#ffffff' : p.ink, align: i ? 'center' : 'left' })); cx += w * cols[i]; }); }
    row(hd, y, true); rows.forEach(function (r, i) { row(r, y + (i + 1) * rh); }); row(['Grand total', '', '', '', ''], y + (rows.length + 1) * rh);
    var ty = y + (rows.length + 2) * rh + 30 * s;
    o.push(T(x, ty, w, 'Attendance: _____ / _____        Result: PASS / PROMOTED\n\nTeacher’s remarks: ________________________________________', 15 * s, { font: 'Poppins', color: p.ink, lh: 1.7 }));
    ['Class teacher', 'Parent', 'Principal'].forEach(function (t, i) { var sx = x + i * w / 3; o.push(L(sx + 20 * s, H - 110 * s, sx + w / 3 - 20 * s, H - 110 * s, p.ink, 1), T(sx, H - 100 * s, w / 3, t, 13 * s, { font: 'Poppins', color: p.ink, align: 'center' })); });
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });
  add('slips', 'Name Slips for Books (8 per page)', 'Education', ['a4p'], ['sun', 'blush', 'teal'], function (W, H, p) {
    var s = W / 794, o = [R(0, 0, W, H, '#ffffff')], cw = (W - 90 * s) / 2, ch = (H - 110 * s) / 4;
    for (var i = 0; i < 8; i++) {
      var x = 30 * s + (i % 2) * (cw + 30 * s), y = 30 * s + Math.floor(i / 2) * (ch + 16 * s);
      o.push(R(x, y, cw, ch, p.c, { r: 22 * s }), R(x + 10 * s, y + 10 * s, cw - 20 * s, ch - 20 * s, '#ffffff', { r: 16 * s, stroke: p.b, sw: 2, dash: [6, 5] }), A('star', x + cw - 70 * s, y + 18 * s, 44 * s));
      o = o.concat(K.rows(x + 30 * s, y + 40 * s, cw - 60 * s, [['Name', '__________'], ['Class', '_____'], ['Subject', '________'], ['School', '________']], 15 * s, { vc: p.ink, kc: p.a, kw: 0.34, font: 'Poppins' }));
    }
    return { pages: [{ bg: '#ffffff', objects: o }] };
  });

  // ================= HIRING / TRIBUTE / QR STAND / EVENT =================
  add('hiring', 'We Are Hiring Post', 'Posters & Jobs', ['sq', 'igp', 'story'], ['navy', 'red', 'teal'], function (W, H, p) {
    var s = Math.min(W, H) / 1080, o = [R(0, 0, W, H, p.bg), R(0, 0, W, H * 0.42, p.a)];
    o = o.concat(stack(W * 0.08, W * 0.84, H * 0.06, H * 0.38, [{ text: 'WE ARE', size: 110, font: 'Anton', color: '#ffffff', gap: 0 }, { text: 'HIRING!', size: 170, font: 'Anton', color: p.acc }], s));
    o = o.concat(pill(W * 0.25, H * 0.39, W * 0.5, 100 * s, p.b, 'SALES EXECUTIVE', 40 * s, '#ffffff'));
    ['2+ years experience', 'Good communication', 'Two-wheeler with licence', 'Salary ₹15,000 – ₹22,000'].forEach(function (t, i) { var y = H * 0.52 + i * 90 * s; o.push(C(W * 0.14, y + 22 * s, 20 * s, p.b), T(W * 0.2, y, W * 0.7, t, 40 * s, { font: 'Poppins', bold: 600, color: p.ink })); });
    o.push(R(0, H - 140 * s, W, 140 * s, p.a), T(0, H - 108 * s, W, 'Send CV on WhatsApp: 98765 43210', 40 * s, { font: 'Poppins', bold: 700, color: '#ffffff', align: 'center' }));
    return { pages: [{ bg: p.bg, objects: o }] };
  });
  add('tribute', 'In Loving Memory Card', 'Cards', ['sq', 'a5p', 'igp'], ['slate', 'gold', 'navy'], function (W, H, p) {
    var s = Math.min(W, H) / 1080, o = [R(0, 0, W, H, '#fbfaf7')].concat(K.frame(W, H, 40 * s, p.b, p.c, false));
    o.push(T(0, H * 0.08, W, 'In Loving Memory', 80 * s, { font: 'Great Vibes', color: p.a, align: 'center' }));
    var r = Math.min(W, H) * 0.2;
    o.push(C(W / 2, H * 0.38, r + 12 * s, p.c), P(W / 2 - r, H * 0.38 - r, r * 2, r * 2, 'PHOTO', { shape: 'circle' }));
    o = o.concat(stack(W * 0.12, W * 0.76, H * 0.62, H * 0.9, [{ text: 'Late Shri Name Surname', size: 60, font: 'Cormorant Garamond', bold: 700, color: p.a, gap: 10 }, { text: '1950 – 2026', size: 36, font: 'Poppins', color: p.b, gap: 20 }, { text: 'Forever in our hearts', size: 34, font: 'Cormorant Garamond', italic: true, color: p.ink }], s));
    return { pages: [{ bg: '#fbfaf7', objects: o }] };
  });
  add('qrstand', 'Scan QR Table Stand', 'Shop & Business', ['a5p', 'a4p'], ['forest', 'coral', 'navy'], function (W, H, p) {
    var s = W / 559, o = [R(0, 0, W, H, p.a), R(30 * s, H * 0.25, W - 60 * s, H * 0.58, '#ffffff', { r: 30 * s })];
    o.push(T(0, H * 0.06, W, 'SCAN', 76 * s, { font: 'Anton', color: '#ffffff', align: 'center', ls: 120 }), T(0, H * 0.06 + 100 * s, W, 'to see our menu', 26 * s, { font: 'Poppins', color: p.c, align: 'center' }));
    o.push(K.Q(W / 2 - 150 * s, H * 0.29, 300 * s, 'https://example.com/menu'));
    o.push(T(30 * s, H * 0.29 + 320 * s, W - 60 * s, 'Point your phone camera at the code', 18 * s, { font: 'Poppins', color: p.ink, align: 'center' }));
    o = o.concat(pill(W * 0.2, H * 0.86, W * 0.6, 60 * s, p.acc, 'Free Wi-Fi: CAFE-GUEST', 18 * s, '#111827'));
    return { pages: [{ bg: p.a, objects: o }] };
  });
  add('concert', 'Concert Poster', 'Flyers & Posters', ['a3p', 'a4p', 'igp'], ['royal', 'red', 'navy'], function (W, H, p) {
    var s = W / 1123, o = [R(0, 0, W, H, '#0b0b14'), P(0, 0, W, H * 0.62, 'PHOTO', { sw: 0 }), R(0, H * 0.4, W, H * 0.22, K.G(90, 'rgba(11,11,20,0)', '#0b0b14'))];
    o.push(C(W * 0.85, H * 0.1, 90 * s, p.b, { op: 0.8 }), T(W * 0.85 - 90 * s, H * 0.1 - 46 * s, 180 * s, 'LIVE', 60 * s, { font: 'Anton', color: '#ffffff', align: 'center' }));
    o = o.concat(stack(W * 0.07, W * 0.86, H * 0.58, H * 0.8, [{ text: 'MONSOON', size: 190, font: 'Anton', color: '#ffffff', ls: 40, gap: 0 }, { text: 'MUSIC NIGHT', size: 120, font: 'Anton', color: p.acc, ls: 40 }], s));
    o.push(L(W * 0.07, H * 0.84, W * 0.93, H * 0.84, '#ffffff', 2 * s, { op: 0.4 }));
    o = o.concat(K.rows(W * 0.07, H * 0.86, W * 0.86, [['Date', 'Saturday, 20 December'], ['Venue', 'City Hall, Main Road'], ['Tickets', '₹299 onwards · 98765 43210']], 30 * s, { vc: '#ffffff', kc: p.acc, kw: 0.2, font: 'Poppins' }));
    return { pages: [{ bg: '#0b0b14', objects: o }] };
  });

  [].unshift.apply(ST.templates, out);
})();
