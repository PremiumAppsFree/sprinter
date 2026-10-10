/* S Printer — Marriage invitation (shadi card) and marriage biodata templates (original designs) */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P;
  var EST_VENUE = 'Hotel Shree Palace, Station Road, Jaipur, Rajasthan', EST_EVENTS = 'Haldi — 20 Nov, 10:00 AM\nMehndi — 20 Nov, 5:00 PM\nBaraat — 21 Nov, 7:00 PM';
  function sc(W, H) { return Math.min(W / 794, H / 1123); }
  function marigold(W, y, n, col1, col2, s) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var x = W * (i + 0.5) / n, len = (3 + (i % 3)) * 1;
      out.push(L(x, 0, x, y + len * 26 * s, col2, 1.5 * s));
      for (var j = 0; j <= len; j++) out.push(C(x, y + j * 26 * s, 11 * s, j % 2 ? col2 : col1));
    }
    out.push(R(0, 0, W, y * 0.6, col1));
    return out;
  }
  function invite(W, H, p, o) {
    var s = sc(W, H), m = Math.min(W, H) * 0.05, out = [], x = m + W * 0.06, w = W - 2 * x;
    var items = [
      { text: o.top, size: 20 * s, font: o.topFont || 'Tiro Devanagari Hindi', color: p.d, gap: 12 },
      { text: o.head, size: 54 * s, font: o.headFont || 'Great Vibes', color: p.d, gap: 4, lh: 1.05 },
      { div: p.d, w: w * 0.5, gap: 14 },
      { text: '{{MESSAGE}}', size: 15 * s, color: o.ink, lh: 1.4, gap: 18, est: 'Together with their families, request the honour of your presence at the wedding of' },
      { text: '{{GROOM}}', size: 40 * s, font: o.nameFont || 'Cinzel', bold: 700, color: o.name, gap: 2 },
      { text: '{{GROOM_PARENTS}}', size: 13 * s, color: o.ink, gap: 10, lh: 1.35, est: 'S/o Shri Ramesh Sharma & Smt. Sunita Sharma' },
      { text: o.weds || 'weds', size: 30 * s, font: 'Great Vibes', color: p.d, gap: 6 },
      { text: '{{BRIDE}}', size: 40 * s, font: o.nameFont || 'Cinzel', bold: 700, color: o.name, gap: 2 },
      { text: '{{BRIDE_PARENTS}}', size: 13 * s, color: o.ink, gap: 18, lh: 1.35, est: 'D/o Shri Mahesh Verma & Smt. Kavita Verma' },
      { div: p.d, w: w * 0.3, gap: 12 },
      { text: '{{WEDDING_DATE}}  ·  {{WEDDING_TIME}}', size: 19 * s, bold: 700, color: o.name, gap: 6 },
      { text: '{{VENUE}}', size: 14 * s, color: o.ink, lh: 1.35, gap: 16, est: EST_VENUE },
      { text: '{{EVENTS|lines}}', size: 13 * s, color: o.ink, lh: 1.5, gap: 16, est: EST_EVENTS },
      { text: 'With best compliments: {{INVITER}}\nRSVP: {{RSVP}}', size: 12.5 * s, color: o.ink, lh: 1.4, gap: 0 }
    ];
    return K.stack(x, w, o.top0 || m + H * 0.1, H - m - H * 0.06, items);
  }
  var INV = ['a4p', 'sq', 'story', 'a4l'];
  var layouts = [
    { id: 'royal', name: 'Royal Maroon', cat: 'Hindu', sizes: INV, pals: ['maroon', 'purple', 'emerald'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H, K.G(90, p.a, p.b, p.a))].concat(K.frame(W, H, Math.min(W, H) * 0.035, p.d, p.c, true));
      o = o.concat(K.mandala(W / 2, Math.min(W, H) * 0.035 + 2, Math.min(W, H) * 0.09, p.d, p.c, 0.85));
      o = o.concat(invite(W, H, p, { top: '॥ श्री गणेशाय नमः ॥', head: 'Shubh Vivah', ink: '#fdf6e3', name: p.c, top0: Math.min(W, H) * 0.14 }));
      return { pages: [{ bg: p.a, objects: o }] };
    } },
    { id: 'marigold', name: 'Marigold Festive', cat: 'Hindu', sizes: INV, pals: ['orange', 'rose'], build: function (W, H, p) {
      var s = sc(W, H), o = marigold(W, H * 0.03, Math.round(W / (70 * s)), '#f59e0b', '#ea580c', s);
      o = o.concat(K.frame(W, H, Math.min(W, H) * 0.03, p.b, p.d, false));
      o.push(K.wave(W, H, H - H * 0.05, 18 * s, p.b, true, { op: 0.9 }));
      o = o.concat(invite(W, H, { d: p.b, c: p.a }, { top: '॥ श्री गणेशाय नमः ॥', head: 'शुभ विवाह', headFont: 'Yatra One', ink: '#3b2a1a', name: p.a, weds: 'संग', top0: H * 0.17 }));
      return { pages: [{ bg: '#fff8ec', objects: o }] };
    } },
    { id: 'nikah', name: 'Nikah Emerald', cat: 'Muslim', sizes: INV, pals: ['emerald', 'navy'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H) * 0.06, aw = W - 2 * m, ah = H - 2 * m;
      var arch = 'M ' + m + ' ' + (m + ah) + ' L ' + m + ' ' + (m + ah * 0.28) + ' Q ' + m + ' ' + m + ' ' + (W / 2) + ' ' + m + ' Q ' + (W - m) + ' ' + m + ' ' + (W - m) + ' ' + (m + ah * 0.28) + ' L ' + (W - m) + ' ' + (m + ah) + ' Z';
      var o = [R(0, 0, W, H, K.G(90, p.a, '#022c22')), K.PATH(arch, null, { stroke: p.d, sw: 4 * s }), K.PATH(arch.replace(/[\d.]+/g, function (n) { return n; }), 'rgba(255,255,255,0.04)')];
      for (var i = 0; i < 9; i++) o = o.concat([K.burst(m + aw * i / 8, H - m * 0.5, 9 * s, 4 * s, 8, p.d)]);
      o = o.concat(invite(W, H, p, { top: 'بسم الله الرحمن الرحيم', topFont: 'Noto Naskh Arabic', head: 'Nikah Ceremony', ink: '#ecfdf5', name: p.d, weds: 'with', top0: m + ah * 0.12 }));
      return { pages: [{ bg: p.a, objects: o }] };
    } },
    { id: 'anand', name: 'Anand Karaj', cat: 'Sikh', sizes: INV, pals: ['navy', 'orange'], build: function (W, H, p) {
      var s = sc(W, H), o = [R(0, 0, W, H * 0.16, p.d), K.wave(W, H, H * 0.16, 16 * s, p.d, false), R(0, H - H * 0.05, W, H * 0.05, p.d)];
      o = o.concat(K.frame(W, H, Math.min(W, H) * 0.03, p.a, p.d, true));
      o = o.concat(invite(W, H, { d: p.a, c: p.a }, { top: 'ੴ ਸਤਿ ਨਾਮੁ', topFont: 'Noto Sans Gurmukhi', head: 'Anand Karaj', ink: '#1f2937', name: p.a, weds: 'with', top0: H * 0.06 }));
      return { pages: [{ bg: '#fffdf7', objects: o }] };
    } },
    { id: 'floral', name: 'Modern Floral', cat: 'Modern/Creative', sizes: INV, pals: ['rose', 'purple', 'teal'], build: function (W, H, p) {
      var s = sc(W, H), o = [], R0 = Math.min(W, H) * 0.22;
      [[0, 0], [W, 0], [0, H], [W, H]].forEach(function (c, i) {
        o.push(C(c[0], c[1], R0, p.c)); o.push(C(c[0] + (i % 2 ? -1 : 1) * R0 * 0.55, c[1] + (i < 2 ? 1 : -1) * R0 * 0.2, R0 * 0.38, p.d, { op: 0.75 }));
        o.push(C(c[0] + (i % 2 ? -1 : 1) * R0 * 0.2, c[1] + (i < 2 ? 1 : -1) * R0 * 0.6, R0 * 0.28, p.b, { op: 0.35 }));
      });
      o.push(R(W * 0.1, H * 0.06, W * 0.8, H * 0.88, 'rgba(255,255,255,0.86)', { r: 30 * s, stroke: p.d, sw: 2 * s }));
      o = o.concat(invite(W, H, { d: p.b, c: p.a }, { top: 'Save the date', topFont: 'Montserrat', head: 'Wedding', ink: '#374151', name: p.a, nameFont: 'Playfair Display', top0: H * 0.1 }));
      return { pages: [{ bg: p.soft, objects: o }] };
    } },
    { id: 'mingold', name: 'Minimal Gold', cat: 'Modern/Creative', sizes: INV, pals: ['gold', 'slate'], build: function (W, H, p) {
      var s = sc(W, H), m = Math.min(W, H) * 0.06, o = [R(m, m, W - 2 * m, H - 2 * m, null, { stroke: p.b, sw: 1.5 * s }), R(m + 10 * s, m + 10 * s, W - 2 * m - 20 * s, H - 2 * m - 20 * s, null, { stroke: p.d, sw: 0.8 * s })];
      o.push(K.burst(W / 2, m + 46 * s, 18 * s, 7 * s, 8, p.b));
      o = o.concat(invite(W, H, { d: p.b, c: p.a }, { top: 'Together with their families', topFont: 'Montserrat', head: 'The Wedding of', headFont: 'Playfair Display', ink: '#44403c', name: p.a, nameFont: 'Cormorant Garamond', top0: m + 90 * s }));
      return { pages: [{ bg: '#fffefb', objects: o }] };
    } },
    // ---------- marriage biodata ----------
    { id: 'bio1', name: 'Biodata Classic', cat: 'Biodata', sizes: ['a4p'], pals: ['maroon', 'blue', 'emerald'], build: function (W, H, p) {
      var u = W / 794, o = K.frame(W, H, 22 * u, p.b, p.d, true);
      o.push(T(0, 50 * u, W, '॥ श्री गणेशाय नमः ॥', 18 * u, { font: 'Tiro Devanagari Hindi', align: 'center', color: p.b }));
      o.push(T(0, 84 * u, W, 'MARRIAGE BIODATA', 30 * u, { font: 'Cinzel', bold: 700, align: 'center', color: p.a, ls: 150 }));
      o = o.concat(K.divider(W / 2, 134 * u, 320 * u, p.d));
      o.push(P(W - 250 * u, 160 * u, 170 * u, 210 * u, 'PHOTO', { r: 8 * u, fill: p.soft, stroke: p.d, sw: 3 * u }));
      function head(t, y) { return [R(70 * u, y, W - 140 * u, 30 * u, p.soft, { r: 6 * u }), T(84 * u, y + 5 * u, 400 * u, t, 15 * u, { bold: 700, color: p.a, font: 'Poppins' })]; }
      o = o.concat(head('PERSONAL DETAILS', 160 * u).map(function (x) { if (x.t === 'rect') x.w = 420 * u; return x; }));
      o = o.concat(K.rows(84 * u, 204 * u, 420 * u, [['Name', '{{NAME}}'], ['Date of birth', '{{DOB}}'], ['Time of birth', '{{TOB}}'], ['Place of birth', '{{POB}}'], ['Height', '{{HEIGHT}}'], ['Complexion', '{{COMPLEXION}}'], ['Religion / Caste', '{{RELIGION}} / {{CASTE}}'], ['Gotra', '{{GOTRA}}'], ['Rashi / Nakshatra', '{{RASHI}} / {{NAKSHATRA}}'], ['Manglik', '{{MANGLIK}}']], 13.5 * u, { kw: 0.42, gap: 1.75 }));
      o = o.concat(head('EDUCATION & CAREER', 640 * u));
      o = o.concat(K.rows(84 * u, 684 * u, W - 168 * u, [['Education', '{{EDUCATION}}'], ['Occupation', '{{OCCUPATION}}'], ['Annual income', '{{INCOME}}']], 13.5 * u, { kw: 0.27, gap: 1.75 }));
      o = o.concat(head('FAMILY DETAILS', 790 * u));
      o = o.concat(K.rows(84 * u, 834 * u, W - 168 * u, [['Father', '{{FATHER}} ({{FATHER_OCC}})'], ['Mother', '{{MOTHER}} ({{MOTHER_OCC}})'], ['Siblings', '{{SIBLINGS}}'], ['Address', '{{ADDRESS}}'], ['Contact', '{{CONTACT}}']], 13.5 * u, { kw: 0.27, gap: 1.75 }));
      return { pages: [{ bg: '#fffdf8', objects: o }] };
    } },
    { id: 'bio2', name: 'Biodata Modern', cat: 'Biodata', sizes: ['a4p'], pals: ['rose', 'teal', 'purple', 'slate'], build: function (W, H, p) {
      var u = W / 794, o = [R(0, 0, W, 300 * u, K.G(20, p.a, p.b)), K.wave(W, H, 300 * u, 24 * u, p.a, false, { op: 0.0 })];
      o.push(P(W / 2 - 95 * u, 50 * u, 190 * u, 190 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: '#ffffff', sw: 6 * u }));
      o.push(T(0, 252 * u, W, '{{NAME}}', 30 * u, { font: 'Playfair Display', bold: 700, align: 'center', color: '#ffffff' }));
      function card(x, y, w, h, t, rows, kw) { return [R(x, y, w, h, '#ffffff', { r: 16 * u, shadow: { x: 0, y: 6 * u, b: 18 * u, c: 'rgba(15,23,42,.12)' } }), T(x + 22 * u, y + 18 * u, w - 44 * u, t, 15 * u, { font: 'Montserrat', bold: 800, color: p.b, ls: 120 }), R(x + 22 * u, y + 42 * u, 40 * u, 3 * u, p.acc)].concat(K.rows(x + 22 * u, y + 58 * u, w - 44 * u, rows, 12.5 * u, { kw: kw || 0.45, gap: 1.7 })); }
      o = o.concat(card(40 * u, 340 * u, 345 * u, 420 * u, 'ABOUT', [['Date of birth', '{{DOB}}'], ['Time / place', '{{TOB}}, {{POB}}'], ['Height', '{{HEIGHT}}'], ['Religion', '{{RELIGION}}'], ['Caste / Gotra', '{{CASTE}} / {{GOTRA}}'], ['Rashi', '{{RASHI}}'], ['Nakshatra', '{{NAKSHATRA}}'], ['Manglik', '{{MANGLIK}}'], ['Complexion', '{{COMPLEXION}}']]));
      o = o.concat(card(409 * u, 340 * u, 345 * u, 420 * u, 'FAMILY', [['Father', '{{FATHER}}'], ['Occupation', '{{FATHER_OCC}}'], ['Mother', '{{MOTHER}}'], ['Occupation', '{{MOTHER_OCC}}'], ['Siblings', '{{SIBLINGS}}']]));
      o = o.concat(card(40 * u, 790 * u, 714 * u, 260 * u, 'EDUCATION · CAREER · CONTACT', [['Education', '{{EDUCATION}}'], ['Occupation', '{{OCCUPATION}}'], ['Income', '{{INCOME}}'], ['Address', '{{ADDRESS}}'], ['Contact', '{{CONTACT}}']], 0.22));
      return { pages: [{ bg: p.soft, objects: o }] };
    } },
    { id: 'bio3', name: 'Biodata हिन्दी', cat: 'Biodata', sizes: ['a4p'], pals: ['orange', 'maroon'], build: function (W, H, p) {
      var u = W / 794, o = [R(0, 0, W, 16 * u, p.b), R(0, H - 16 * u, W, 16 * u, p.b)].concat(K.frame(W, H, 30 * u, p.b, p.d, false));
      o = o.concat(K.mandala(W / 2, 100 * u, 50 * u, p.d, p.b, 0.9));
      o.push(T(0, 160 * u, W, 'विवाह हेतु परिचय', 32 * u, { font: 'Yatra One', align: 'center', color: p.a }));
      o.push(P(W - 240 * u, 220 * u, 160 * u, 200 * u, 'PHOTO', { r: 10 * u, fill: p.soft, stroke: p.b, sw: 3 * u }));
      var f = 'Hind';
      o = o.concat(K.rows(80 * u, 230 * u, 430 * u, [['नाम', '{{NAME}}'], ['जन्म तिथि', '{{DOB}}'], ['जन्म समय', '{{TOB}}'], ['जन्म स्थान', '{{POB}}'], ['कद', '{{HEIGHT}}'], ['धर्म / जाति', '{{RELIGION}} / {{CASTE}}'], ['गोत्र', '{{GOTRA}}'], ['राशि / नक्षत्र', '{{RASHI}} / {{NAKSHATRA}}'], ['मांगलिक', '{{MANGLIK}}']], 15 * u, { kw: 0.36, gap: 1.75, font: f }));
      o.push(T(80 * u, 620 * u, 300 * u, 'शिक्षा एवं व्यवसाय', 19 * u, { font: 'Yatra One', color: p.b }));
      o = o.concat(K.rows(80 * u, 660 * u, W - 160 * u, [['शिक्षा', '{{EDUCATION}}'], ['व्यवसाय', '{{OCCUPATION}}'], ['वार्षिक आय', '{{INCOME}}']], 15 * u, { kw: 0.22, gap: 1.75, font: f }));
      o.push(T(80 * u, 770 * u, 300 * u, 'पारिवारिक विवरण', 19 * u, { font: 'Yatra One', color: p.b }));
      o = o.concat(K.rows(80 * u, 810 * u, W - 160 * u, [['पिता', '{{FATHER}} ({{FATHER_OCC}})'], ['माता', '{{MOTHER}} ({{MOTHER_OCC}})'], ['भाई / बहन', '{{SIBLINGS}}'], ['पता', '{{ADDRESS}}'], ['संपर्क', '{{CONTACT}}']], 15 * u, { kw: 0.22, gap: 1.75, font: f }));
      return { pages: [{ bg: '#fffaf0', objects: o }] };
    } }
  ];
  ST.register(K.expand('mc', layouts, ['maroon']));
})();
