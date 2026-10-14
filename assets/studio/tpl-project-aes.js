/* S Printer — aesthetic project papers (pastel, floral, cute — Canva style). Cover + certificate +
 * acknowledgement + index for every design. Original designs by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P, A = K.A, pp = K.pp;
  var W = 794, H = 1123;
  // pastel palettes: a = deep text, b = main, c = light, d = mid, soft, bg, acc, ink, f = flower colours for art
  var PAL = {
    blush: { a: '#8c3b5e', b: '#e486a6', c: '#fbd5e1', d: '#f3b3c8', soft: '#fff6f9', bg: '#fdeef3', acc: '#f2c46d', ink: '#4a2737', f: ['#fde2e4', '#f4a6b7', '#d36a85', '#8fb996', '#f9c6d3', '#ffffff'] },
    lavender: { a: '#5a3d8a', b: '#a78bfa', c: '#e6dcff', d: '#cbb8ff', soft: '#fbf9ff', bg: '#f3eeff', acc: '#f7a8cf', ink: '#33284a', f: ['#f3e8ff', '#c4b5fd', '#7c3aed', '#9fb7a2', '#fbcfe8', '#ffffff'] },
    peach: { a: '#9a4a2a', b: '#f29b74', c: '#ffdccb', d: '#fbbf9f', soft: '#fffaf6', bg: '#fff1e8', acc: '#f5c76a', ink: '#4a2c20', f: ['#ffe8d6', '#fdba8c', '#e07a4f', '#9cb58a', '#fde2e4', '#ffffff'] },
    mint: { a: '#2c6650', b: '#5fbf98', c: '#d2f0e3', d: '#a3dcc4', soft: '#f6fdf9', bg: '#ebf8f1', acc: '#f6a5bd', ink: '#1d3b2f', f: ['#fde2e4', '#f4a6b7', '#d36a85', '#6aa984', '#fff1c1', '#ffffff'] },
    sky: { a: '#2b4f80', b: '#79aef0', c: '#d6e8fd', d: '#aacdf6', soft: '#f8fbff', bg: '#ecf4ff', acc: '#f9cf5b', ink: '#1d3150', f: ['#e0f0ff', '#9cc7f5', '#3b75c4', '#8fb5a0', '#fef3c7', '#ffffff'] },
    butter: { a: '#7a5c0e', b: '#eebd3a', c: '#fbedb9', d: '#f5d983', soft: '#fffdf4', bg: '#fff9e3', acc: '#f294b0', ink: '#3b3112', f: ['#fff4c7', '#f7d06b', '#c99a1a', '#9cb58a', '#fde2e4', '#ffffff'] },
    beige: { a: '#6b5243', b: '#c49c82', c: '#eee1d4', d: '#dcc5b1', soft: '#fcf9f5', bg: '#f6efe7', acc: '#c9848f', ink: '#3b2f27', f: ['#f5e6da', '#dcb8a0', '#a87a63', '#9a9b7c', '#efd2cb', '#ffffff'] },
    rosegold: { a: '#7d3f4a', b: '#d39a8e', c: '#f6dfd9', d: '#e9bfb5', soft: '#fffaf8', bg: '#fbf0ec', acc: '#c9a227', ink: '#43262b', f: ['#fbe4de', '#e7a99c', '#b5636a', '#a3a98a', '#f6d1cb', '#ffffff'] }
  };
  function fl(p) { return p.f; }
  function spark(x, y, s, p) { return A('sparkles', x, y, s, s, { cols: [p.acc, p.b] }); }
  // details as "label : value" with a soft line under each value (like a filled form)
  function info(x, y, w, p, o) {
    o = o || {};
    var rows = o.rows || [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Subject', '{{SUBJECT}}'], ['Submitted to', '{{TEACHER}}']];
    var rh = o.rh || 44, lw = w * (o.lw || 0.36), out = [];
    rows.forEach(function (r, i) {
      var yy = y + i * rh;
      out.push(T(x, yy, lw, r[0], o.ls || 16, { font: o.lf || 'Poppins', bold: 600, color: o.lc || p.a }));
      out.push(T(x + lw, yy - 2, w - lw, r[1], o.vs || 18, { font: o.vf || 'Poppins', color: o.vc || p.ink }));
      out.push(L(x + lw, yy + (o.vs || 18) * 1.45, x + w, yy + (o.vs || 18) * 1.45, o.line || p.d, 1.4, { dash: o.dash ? [5, 5] : null }));
    });
    return out;
  }
  function card(x, y, w, h, p, o) { o = o || {}; return R(x, y, w, h, o.fill || 'rgba(255,255,255,0.88)', { r: o.r == null ? 26 : o.r, stroke: o.stroke, sw: o.sw || 0, shadow: o.shadow === false ? null : { y: 8, b: 26, c: 'rgba(80,40,60,.10)' } }); }
  function head(y, p, o) { // logo + school centred
    o = o || {};
    return [pp.logo(W / 2 - 40, y, 80, { fill: '#ffffff', stroke: p.d, sw: 2 })].concat(pp.school(110, W - 220, y + 88, y + 150, o.col || p.a, { size: o.size || 22, sub: 14, subCol: o.sub || p.b, font: o.font || 'Montserrat', ls: o.ls == null ? 60 : o.ls, bold: o.bold }));
  }
  function stack(top, bot, items, o) { return K.stack((o && o.x) || 90, (o && o.w) || W - 180, top, bot, items, Object.assign({ maxK: 1.15 }, o)); }
  // decorated inner pages that match each cover
  function innerFloral(Wp, Hp, p) { var f = fl(p); return { o: [R(0, 0, Wp, Hp, p.bg), A('blob', -90, -70, 360, 288, { cols: [p.c], op: 0.9 }), A('blob', Wp - 280, Hp - 220, 360, 288, { cols: [p.c], op: 0.9 }), A('bouquet', -20, -20, 230, 230, { cols: f }), A('bouquet', Wp - 210, Hp - 210, 230, 230, { cols: f, flipX: true, flipY: true }), card(70, 90, Wp - 140, Hp - 180, p, { r: 30 })], box: { x: 110, w: Wp - 220, top: 130, bot: Hp - 130 } }; }
  function innerSoft(Wp, Hp, p) { return { o: [R(0, 0, Wp, Hp, p.bg), C(Wp, 0, 220, p.c, { op: 0.9 }), C(0, Hp, 240, p.c, { op: 0.9 }), C(80, 120, 26, p.d, { op: 0.8 }), spark(Wp - 190, Hp - 170, 110, p), card(60, 70, Wp - 120, Hp - 140, p, { r: 34, fill: '#ffffff' })], box: { x: 105, w: Wp - 210, top: 115, bot: Hp - 115 } }; }
  function innerLeaf(Wp, Hp, p) { return { o: [R(0, 0, Wp, Hp, p.soft), A('eucalyptus', -10, -30, 150, 340, { cols: [p.b === '#5fbf98' ? '#7fae8a' : '#9cb8a8'], angle: -20 }), A('sprig', Wp - 130, Hp - 330, 140, 350, { cols: ['#8fb996'], angle: 160 }), R(40, 40, Wp - 80, Hp - 80, null, { stroke: p.d, sw: 1.5, r: 18 })], box: { x: 105, w: Wp - 210, top: 110, bot: Hp - 110 } }; }
  function innerCute(Wp, Hp, p) { return { o: [R(0, 0, Wp, Hp, p.bg), A('dots', 0, 0, 300, 300, { cols: [p.c], op: 0.8 }), A('dots', Wp - 300, Hp - 300, 300, 300, { cols: [p.c], op: 0.8 }), A('cloud', Wp - 220, 30, 190, 114, { cols: ['#ffffff', p.c] }), A('star', 40, Hp - 120, 70, 70, { cols: [p.acc] }), A('heart', Wp - 120, Hp - 140, 70, 65, { cols: [p.b] }), card(55, 120, Wp - 110, Hp - 210, p, { r: 30, fill: '#ffffff', stroke: p.d, sw: 3 })], box: { x: 100, w: Wp - 200, top: 160, bot: Hp - 135 } }; }
  function innerNote(Wp, Hp, p) {
    var o = [R(0, 0, Wp, Hp, '#fffefb')];
    for (var y = 120; y < Hp - 40; y += 34) o.push(L(0, y, Wp, y, '#e3ecf7', 1.1));
    o.push(L(80, 0, 80, Hp, '#f5b5c4', 1.6), A('washi', Wp / 2 - 110, 18, 220, 58, { cols: [p.c, '#ffffff'], angle: -3 }));
    return { o: o, box: { x: 120, w: Wp - 190, top: 110, bot: Hp - 90 } };
  }

  var D = [
    { id: 'bloom', name: 'Pastel Bloom', cat: 'Aesthetic', inner: innerFloral, pals: ['blush', 'lavender', 'peach', 'sky'], cover: function (p) {
      var f = fl(p), o = [R(0, 0, W, H, p.bg), A('blob', -110, -90, 470, 376, { cols: [p.c] }), A('blob', 450, 820, 470, 376, { cols: [p.c] })];
      o.push(A('bouquet', -30, -30, 380, 380, { cols: f }), A('bouquet', 444, 773, 380, 380, { cols: f, flipX: true, flipY: true }), spark(610, 300, 110, p), spark(70, 820, 80, p));
      o.push(pp.logo(W - 150, 60, 90, { fill: '#ffffff', stroke: p.d, sw: 2 }));
      o = o.concat(pp.school(380, 334, 162, 240, p.a, { align: 'right', size: 21, sub: 14, subCol: p.b, ls: 40 }));
      o = o.concat(stack(330, 600, [
        { text: 'PROJECT ON', size: 18, font: 'Josefin Sans', bold: 700, color: p.b, ls: 420, gap: 8 },
        { text: '{{TITLE}}', size: 88, font: 'Great Vibes', color: p.a, lh: 1, gap: 10 },
        { text: '{{SUBJECT|upper}}', size: 17, font: 'Montserrat', bold: 600, color: p.ink, ls: 260, gap: 0 }
      ]));
      o.push(C(W / 2, 700, 92, '#ffffff', { shadow: { y: 6, b: 20, c: 'rgba(0,0,0,.10)' } }), pp.photo(W / 2 - 82, 618, 164, 164, { shape: 'circle', fill: p.c, stroke: p.d, sw: 4 }));
      o.push(card(90, 820, 470, 240, p));
      return o.concat(info(120, 846, 410, p, { rh: 42, rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Submitted to', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'butterfly', name: 'Butterfly Dream', cat: 'Aesthetic', inner: innerSoft, pals: ['lavender', 'blush', 'sky', 'mint'], cover: function (p) {
      var o = [R(0, 0, W, H, K.G(160, p.bg, '#ffffff', p.c)), C(W + 40, 160, 260, p.c, { op: 0.8 }), C(-60, H - 120, 300, p.c, { op: 0.8 }), A('dots', 20, 380, 220, 220, { cols: [p.d], op: 0.5 })];
      o.push(A('butterfly', 520, 60, 210, 182, { cols: [p.c, p.b, p.a], angle: 12 }), A('butterfly', 90, 250, 120, 104, { cols: [p.c, p.d, p.a], angle: -18 }), A('butterfly', 600, 760, 140, 121, { cols: [p.c, p.b, p.a], angle: 20 }));
      o.push(spark(430, 90, 70, p), spark(160, 120, 60, p), spark(650, 650, 70, p));
      o.push(pp.logo(60, 56, 76, { fill: '#ffffff', stroke: p.d, sw: 2 }));
      o = o.concat(pp.school(150, 330, 58, 136, p.a, { align: 'left', size: 19, sub: 13, subCol: p.b, ls: 40 }));
      o = o.concat(stack(240, 560, [
        { text: '{{SUBJECT}}', size: 82, font: 'Sacramento', color: p.a, lh: 1, gap: 0 },
        { text: 'PROJECT', size: 50, font: 'Cormorant Garamond', bold: 700, color: p.b, ls: 500, gap: 16 },
        { text: '{{TITLE}}', size: 24, font: 'Poppins', bold: 500, color: p.ink, gap: 0, lh: 1.3 }
      ]));
      o.push(R(W / 2 - 106, 586, 212, 252, '#ffffff', { r: 106, shadow: { y: 6, b: 20, c: 'rgba(60,30,90,.12)' } }), pp.photo(W / 2 - 96, 596, 192, 232, { r: 96, sw: 0, fill: p.c }));
      o.push(card(110, 870, W - 220, 196, p, { r: 98, fill: 'rgba(255,255,255,0.9)' }));
      return o.concat(info(170, 892, W - 340, p, { rh: 38, ls: 15, vs: 17, rows: [['Name', '{{NAME}}'], ['Class · Roll', '{{CLASS}} – {{SECTION}} · {{ROLL}}'], ['Submitted to', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'arch', name: 'Floral Arch', cat: 'Aesthetic', inner: innerFloral, pals: ['beige', 'blush', 'rosegold', 'mint'], cover: function (p) {
      var f = fl(p), o = [R(0, 0, W, H, p.bg)];
      o.push(A('archframe', 117, 130, 560, 784, { cols: [p.soft, p.d] }), A('archflowers', 102, 100, 590, 826, { cols: f }));
      o = o.concat(head(240, p, { size: 20, font: 'Cormorant Garamond', bold: 700, ls: 120 }));
      o = o.concat(stack(410, 640, [
        { text: '{{TITLE}}', size: 66, font: 'Parisienne', color: p.a, lh: 1.05, gap: 14 },
        { div: p.b, w: 200, gap: 10 },
        { text: '{{SUBJECT|upper}} PROJECT', size: 16, font: 'Montserrat', bold: 600, color: p.b, ls: 260, gap: 0 }
      ], { x: 190, w: W - 380 }));
      o.push(pp.photo(W / 2 - 70, 660, 140, 160, { r: 70, fill: p.c, stroke: p.d, sw: 3 }));
      o = o.concat(stack(836, 905, [{ text: '{{NAME}}', size: 30, font: 'Cormorant Garamond', bold: 700, color: p.ink, gap: 2 }, { text: 'Class {{CLASS}} – {{SECTION}}  ·  Roll {{ROLL}}', size: 15, color: p.a, gap: 0 }], { x: 190, w: W - 380 }));
      o.push(T(90, 960, W - 180, 'Submitted to', 14, { font: 'Montserrat', bold: 600, color: p.b, align: 'center', ls: 300 }), T(90, 984, W - 180, '{{TEACHER}}  ·  {{SESSION}}', 19, { font: 'Cormorant Garamond', bold: 700, color: p.ink, align: 'center' }));
      return o;
    } },
    { id: 'coquette', name: 'Coquette Bows', cat: 'Cute', inner: innerCute, pals: ['blush', 'lavender', 'rosegold', 'sky'], cover: function (p) {
      var o = [R(0, 0, W, H, p.bg)];
      for (var i = 0; i < 9; i++) o.push(R(i * 96 - 10, 0, 48, H, '#ffffff', { op: 0.45 }));
      o.push(R(60, 70, W - 120, H - 140, '#ffffff', { r: 40, stroke: p.d, sw: 3, shadow: { y: 10, b: 30, c: 'rgba(120,40,70,.12)' } }), R(78, 88, W - 156, H - 176, null, { r: 30, stroke: p.c, sw: 2, dash: [8, 7] }));
      o.push(A('bow', W / 2 - 110, 20, 220, 165, { cols: [p.d, p.a] }), A('bow', 40, H - 190, 150, 112, { cols: [p.d, p.a], angle: -14 }), A('bow', W - 190, H - 200, 150, 112, { cols: [p.d, p.a], angle: 14 }));
      o.push(A('hearts', 610, 190, 110, 95, { cols: [p.b, p.c] }), A('hearts', 80, 240, 90, 78, { cols: [p.b, p.c], flipX: true }), spark(620, 520, 70, p));
      o = o.concat(head(190, p, { size: 20 }));
      o = o.concat(stack(370, 600, [
        { text: '{{TITLE}}', size: 76, font: 'Dancing Script', bold: 700, color: p.a, lh: 1.02, gap: 10 },
        { text: '♡  {{SUBJECT}} project  ♡', size: 20, font: 'Quicksand', bold: 700, color: p.b, gap: 0 }
      ], { x: 120, w: W - 240 }));
      o.push(C(W / 2, 700, 86, p.c), pp.photo(W / 2 - 76, 624, 152, 152, { shape: 'circle', stroke: '#ffffff', sw: 5 }));
      return o.concat(info(150, 820, W - 300, p, { rh: 42, lf: 'Quicksand', vf: 'Quicksand', dash: true, rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}  ·  Roll {{ROLL}}'], ['Submitted to', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'botanic', name: 'Botanical Minimal', cat: 'Aesthetic', inner: innerLeaf, pals: ['beige', 'mint', 'sky', 'peach'], cover: function (p) {
      var o = [R(0, 0, W, H, p.soft), A('eucalyptus', -70, 600, 170, 386, { cols: ['#9cb8a8'], angle: 12 }), A('sprig', 30, 720, 110, 275, { cols: ['#8fb996'], angle: 34 }), A('eucalyptus', W - 70, 520, 170, 386, { cols: ['#9cb8a8'], angle: 168 }), A('sprig', W + 10, -10, 110, 275, { cols: ['#8fb996'], angle: 150 }), A('eucalyptus', 60, -40, 120, 273, { cols: ['#9cb8a8'], angle: -70 })];
      o.push(R(50, 50, W - 100, H - 100, null, { stroke: p.d, sw: 1.5, r: 20 }));
      o = o.concat(head(110, p, { size: 20, font: 'Josefin Sans', ls: 200 }));
      o = o.concat(stack(300, 600, [
        { text: '{{SUBJECT}}', size: 30, font: 'Italiana', color: p.b, ls: 300, gap: 6 },
        { text: '{{TITLE}}', size: 72, font: 'DM Serif Display', color: p.ink, lh: 1.05, gap: 18 },
        { text: 'A PROJECT REPORT', size: 15, font: 'Josefin Sans', bold: 700, color: p.a, ls: 500, gap: 0 }
      ], { x: 120, w: W - 240 }));
      o.push(pp.photo(W / 2 - 85, 630, 170, 210, { fill: p.c, sw: 0 }), R(W / 2 - 97, 618, 194, 234, null, { stroke: p.b, sw: 1.5 }));
      return o.concat(info(150, 890, W - 300, p, { rh: 40, lf: 'Josefin Sans', vf: 'Josefin Sans', rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}  ·  Roll {{ROLL}}'], ['Submitted to', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'sky', name: 'Dreamy Sky', cat: 'Cute', inner: innerCute, pals: ['sky', 'lavender', 'blush', 'mint'], cover: function (p) {
      var o = [R(0, 0, W, H, K.G(180, p.c, '#ffffff'))];
      o.push(A('rainbow', W / 2 - 230, 120, 460, 265, { cols: ['#fca5a5', '#fdba74', '#fde68a', '#a7f3d0', '#bfdbfe', '#ddd6fe'] }));
      o.push(A('cloud', 60, 300, 260, 156, { cols: ['#ffffff', p.c] }), A('cloud', 480, 290, 260, 156, { cols: ['#ffffff', p.c] }), A('cloud', 580, 70, 170, 102, { cols: ['#ffffff', p.c] }), A('moon', 50, 50, 120, 120, { cols: ['#fde68a', '#fbbf24'] }));
      o.push(A('star', 680, 420, 50, 50, { cols: [p.acc] }), A('star', 90, 540, 40, 40, { cols: [p.acc] }), spark(620, 560, 60, p));
      o = o.concat(stack(470, 690, [
        { text: '{{TITLE}}', size: 64, font: 'Fredoka', bold: 700, color: p.a, lh: 1.05, gap: 10, shadow: { x: 3, y: 3, b: 0, c: 'rgba(255,255,255,0.9)' } },
        { text: '{{SUBJECT}} Project', size: 26, font: 'Caveat', bold: 700, color: p.b, gap: 0 }
      ], { x: 100, w: W - 200 }));
      o.push(R(W / 2 - 80, 710, 160, 180, '#ffffff', { r: 22, shadow: { y: 6, b: 18, c: 'rgba(30,50,90,.12)' } }), pp.photo(W / 2 - 70, 720, 140, 160, { r: 16, sw: 0, fill: p.c }));
      o.push(card(90, 910, W - 180, 170, p, { r: 30, fill: 'rgba(255,255,255,0.92)' }), pp.logo(110, 932, 60, { fill: '#ffffff', stroke: p.d, sw: 2 }));
      return o.concat(info(190, 928, W - 300, p, { rh: 36, ls: 15, vs: 16, lf: 'Fredoka', vf: 'Fredoka', rows: [['Name', '{{NAME}}'], ['Class · Roll', '{{CLASS}} – {{SECTION}} · {{ROLL}}'], ['School', '{{SCHOOL}}'], ['Teacher', '{{TEACHER}}']] }));
    } },
    { id: 'notebook', name: 'Washi Notebook', cat: 'Cute', inner: innerNote, pals: ['blush', 'mint', 'butter', 'lavender'], cover: function (p) {
      var o = [R(0, 0, W, H, '#fbfaf6')];
      for (var x = 0; x <= W; x += 30) o.push(L(x, 0, x, H, '#ececf3', 1));
      for (var y = 0; y <= H; y += 30) o.push(L(0, y, W, y, '#ececf3', 1));
      o.push(R(120, 150, 560, 380, p.c, { angle: -3, shadow: { y: 8, b: 18, c: 'rgba(0,0,0,.10)' } }), A('washi', 300, 120, 200, 54, { cols: [p.d, '#ffffff'], angle: -6 }));
      o = o.concat(stack(190, 500, [
        { text: '{{SUBJECT}} project', size: 34, font: 'Caveat', bold: 700, color: p.a, gap: 0 },
        { text: '{{TITLE}}', size: 80, font: 'Caveat', bold: 700, color: p.ink, lh: 0.95, gap: 6 },
        { text: '{{SUBTITLE}}', size: 20, font: 'Patrick Hand', color: p.a, gap: 0, est: 'A project on saving water for our future' }
      ], { x: 160, w: 470 }));
      o.push(R(450, 580, 260, 310, '#ffffff', { angle: 5, shadow: { y: 8, b: 18, c: 'rgba(0,0,0,.14)' } }), pp.photo(472, 600, 218, 230, { angle: 5, sw: 0, fill: '#eef2f6' }), A('washi', 530, 560, 120, 40, { cols: [p.b, '#ffffff'], angle: 10 }));
      o.push(T(458, 850, 240, '{{NAME}}', 30, { font: 'Caveat', bold: 700, color: p.ink, align: 'center', angle: 5 }));
      o.push(A('pencil', 70, 1010, 300, 66, { cols: [p.acc, p.d, '#1f2937'], angle: -8 }), A('hearts', 640, 960, 100, 87, { cols: [p.b, p.c] }), A('star', 90, 560, 50, 50, { cols: [p.acc] }));
      o.push(pp.logo(70, 40, 70, { fill: '#ffffff', stroke: p.d, sw: 2 }));
      o.push(T(160, 52, 520, '{{SCHOOL}}', 26, { font: 'Patrick Hand', color: p.ink }));
      return o.concat(info(80, 610, 330, p, { rh: 50, lw: 0.42, lf: 'Patrick Hand', vf: 'Patrick Hand', ls: 19, vs: 19, dash: true, rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Teacher', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'wreath', name: 'Flower Wreath', cat: 'Aesthetic', inner: innerFloral, pals: ['peach', 'blush', 'lavender', 'butter'], cover: function (p) {
      var f = fl(p), o = [R(0, 0, W, H, p.bg), A('dots', 0, 0, 794, 300, { cols: [p.c], op: 0.55 })];
      o = o.concat(head(50, p, { size: 21 }));
      o.push(C(W / 2, 480, 250, '#ffffff', { op: 0.85 }), A('wreath', W / 2 - 300, 180, 600, 600, { cols: f.slice(0, 5) }));
      o = o.concat(stack(330, 600, [
        { text: '{{SUBJECT|upper}}', size: 16, font: 'Montserrat', bold: 700, color: p.b, ls: 360, gap: 8 },
        { text: '{{TITLE}}', size: 66, font: 'Playfair Display', bold: 700, color: p.a, lh: 1.05, gap: 8 },
        { text: 'project file', size: 34, font: 'Great Vibes', color: p.b, gap: 0 }
      ], { x: 205, w: W - 410 }));
      o.push(pp.photo(110, 800, 170, 200, { r: 20, fill: p.c, stroke: '#ffffff', sw: 6 }));
      o.push(card(310, 790, W - 400, 230, p, { r: 24 }));
      return o.concat(info(336, 812, W - 452, p, { rh: 42, ls: 15, vs: 17, rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Teacher', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'science', name: 'Cute Science', cat: 'Subjects', inner: innerSoft, pals: ['mint', 'sky', 'lavender', 'blush'], cover: function (p) {
      var o = [R(0, 0, W, H, p.bg), C(W - 60, 140, 200, p.c), C(80, H - 160, 220, p.c)];
      o.push(A('flask', 520, 70, 200, 243, { cols: [p.d, p.acc, '#1f2937'], angle: 12 }), A('atom', 70, 120, 170, 170, { cols: [p.b, p.acc] }), A('bulb', 600, 700, 140, 183, { cols: ['#fde68a', '#1f2937'], angle: -10 }), A('books', 60, 760, 210, 175, { cols: [p.d, p.c, p.acc, '#1f2937'] }));
      o.push(spark(300, 80, 70, p), spark(470, 620, 50, p));
      o = o.concat(stack(330, 600, [
        { text: '{{SUBJECT}}', size: 86, font: 'Pacifico', color: p.a, lh: 1.1, gap: 0 },
        { text: 'P R O J E C T', size: 26, font: 'Fredoka', bold: 700, color: p.b, gap: 18 },
        { text: '{{TITLE}}', size: 26, font: 'Fredoka', bold: 500, color: p.ink, gap: 0, lh: 1.25 }
      ], { x: 100, w: W - 200 }));
      o.push(C(W / 2, 700, 84, p.d), pp.photo(W / 2 - 74, 626, 148, 148, { shape: 'circle', stroke: '#ffffff', sw: 5 }));
      o.push(card(260, 800, 330, 250, p, { r: 24, fill: '#ffffff', stroke: p.d, sw: 3 }));
      return o.concat(info(282, 822, 288, p, { rh: 44, ls: 14, vs: 16, lf: 'Fredoka', vf: 'Fredoka', lw: 0.38, rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['School', '{{SCHOOL}}'], ['Teacher', '{{TEACHER}}']] }));
    } },
    { id: 'brush', name: 'Brush Title', cat: 'Aesthetic', inner: innerSoft, pals: ['peach', 'blush', 'sky', 'butter'], cover: function (p) {
      var f = fl(p), o = [R(0, 0, W, H, '#ffffff'), A('blob', 420, -80, 460, 368, { cols: [p.c] }), A('blob', -140, 880, 460, 368, { cols: [p.c] })];
      o.push(A('rose', 600, 40, 150, 150, { cols: f.slice(0, 3) }), A('leaf', 590, 150, 60, 150, { cols: ['#8fb996', '#e9f5ea'], angle: -40 }), A('blossom', 700, 170, 70, 70, { cols: [f[5], f[4], '#f6c453'] }));
      o = o.concat(pp.school(70, 480, 70, 150, p.ink, { align: 'left', size: 22, sub: 14, subCol: p.b }));
      o.push(pp.logo(70, 160, 70, { fill: p.soft, stroke: p.d, sw: 2 }));
      o.push(A('brush', 30, 330, 740, 190, { cols: [p.d] }));
      o = o.concat(stack(345, 505, [{ text: '{{TITLE}}', size: 62, font: 'Lobster Two', bold: 700, color: '#ffffff', lh: 1.05, gap: 0, shadow: { x: 2, y: 2, b: 0, c: p.a } }], { x: 80, w: W - 160 }));
      o = o.concat(stack(540, 610, [{ text: '{{SUBJECT|upper}} · PROJECT FILE', size: 18, font: 'Montserrat', bold: 700, color: p.a, ls: 260, gap: 0 }]));
      o.push(R(470, 650, 240, 290, p.c, { r: 22 }), pp.photo(456, 636, 240, 290, { r: 22, sw: 0, fill: p.soft }));
      return o.concat(info(80, 670, 340, p, { rh: 52, lw: 0.4, rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Submitted to', '{{TEACHER}}'], ['Date', '{{DATE}}']] }));
    } }
    ,
    { id: 'daisy', name: 'Daisy Fresh', cat: 'Cute', inner: innerCute, pals: ['butter', 'mint', 'sky', 'blush'], cover: function (p) {
      var o = [R(0, 0, W, H, p.bg)];
      [[40, 40, 110], [640, 20, 90], [700, 330, 70], [20, 420, 60], [600, 880, 120], [60, 930, 100], [330, 1030, 70], [720, 620, 50], [210, 120, 50]].forEach(function (d, i) { o.push(A('daisy', d[0], d[1], d[2], d[2], { cols: ['#ffffff', i % 2 ? p.acc : '#f7c948'], angle: i * 23 })); });
      o.push(card(80, 170, W - 160, 780, p, { r: 40, fill: 'rgba(255,255,255,0.92)', stroke: p.d, sw: 3 }));
      o = o.concat(head(200, p, { size: 20, font: 'Fredoka', bold: 700, ls: 40 }));
      o = o.concat(stack(380, 600, [
        { text: '{{TITLE}}', size: 66, font: 'Sniglet', bold: 800, color: p.a, lh: 1.05, gap: 12 },
        { text: '{{SUBJECT}} Project', size: 30, font: 'Dancing Script', bold: 700, color: p.b, gap: 0 }
      ], { x: 120, w: W - 240 }));
      o.push(C(W / 2, 690, 80, p.c), pp.photo(W / 2 - 70, 620, 140, 140, { shape: 'circle', stroke: '#ffffff', sw: 5 }));
      return o.concat(info(150, 800, W - 300, p, { rh: 34, ls: 14, vs: 16, lf: 'Fredoka', vf: 'Fredoka', rows: [['Name', '{{NAME}}'], ['Class · Roll', '{{CLASS}} – {{SECTION}} · {{ROLL}}'], ['Submitted to', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'tulips', name: 'Tulip Garden', cat: 'Aesthetic', inner: innerSoft, pals: ['blush', 'peach', 'lavender', 'butter'], cover: function (p) {
      var o = [R(0, 0, W, H, K.G(180, '#ffffff', p.bg))];
      for (var i = 0; i < 9; i++) o.push(A('tulip', 10 + i * 88, 800 + (i % 3) * 40, 90, 180 + (i % 2) * 30, { cols: [i % 2 ? p.c : p.d, i % 2 ? p.b : p.a, '#6aa56b'], angle: (i - 4) * 3 }));
      o.push(R(0, H - 40, W, 40, '#a3c99a'), spark(100, 130, 70, p), spark(650, 260, 60, p), A('butterfly', 600, 80, 120, 104, { cols: [p.c, p.b, p.a], angle: 15 }));
      o = o.concat(head(70, p, { size: 21, font: 'Cormorant Garamond', bold: 700, ls: 140 }));
      o = o.concat(stack(260, 520, [
        { text: '{{SUBJECT}}', size: 30, font: 'Josefin Sans', bold: 600, color: p.b, ls: 200, gap: 2 },
        { text: '{{TITLE}}', size: 90, font: 'Allura', color: p.a, lh: 1, gap: 4 },
        { text: '— project file —', size: 18, font: 'Josefin Sans', color: p.ink, ls: 300, gap: 0 }
      ]));
      o.push(R(110, 548, 200, 240, '#ffffff', { r: 100, shadow: { y: 6, b: 18, c: 'rgba(0,0,0,.10)' } }), pp.photo(120, 558, 180, 220, { r: 90, sw: 0, fill: p.c }));
      return o.concat(info(350, 570, 340, p, { rh: 44, lw: 0.4, lf: 'Josefin Sans', vf: 'Josefin Sans', rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Teacher', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'scrapbook', name: 'Scrapbook', cat: 'Cute', inner: innerNote, pals: ['peach', 'blush', 'mint', 'sky'], cover: function (p) {
      var o = [R(0, 0, W, H, p.bg), A('dots', 0, 0, 794, 794, { cols: [p.c], op: 0.7 })];
      o.push(R(60, 90, 300, 360, '#ffffff', { angle: -6, shadow: { y: 8, b: 20, c: 'rgba(0,0,0,.14)' } }), pp.photo(82, 112, 250, 260, { angle: -6, sw: 0, fill: p.c }), A('washi', 120, 60, 170, 46, { cols: [p.d, '#ffffff'], angle: -14 }));
      o.push(T(70, 392, 280, '{{NAME}}', 30, { font: 'Caveat', bold: 700, color: p.ink, align: 'center', angle: -6 }));
      o.push(R(400, 120, 340, 330, p.c, { angle: 4, shadow: { y: 8, b: 20, c: 'rgba(0,0,0,.10)' } }), A('washi', 520, 96, 140, 40, { cols: [p.b, '#ffffff'], angle: 8 }));
      o = o.concat(K.stack(425, 290, 150, 420, [
        { text: 'My project on', size: 30, font: 'Caveat', bold: 700, color: p.a, gap: 2 },
        { text: '{{TITLE}}', size: 54, font: 'Gloria Hallelujah', color: p.ink, lh: 1.1, gap: 6 },
        { text: '{{SUBJECT}}', size: 22, font: 'Patrick Hand', color: p.a, gap: 0 }
      ], { maxK: 1.1 }).map(function (x) { x.angle = 4; return x; }));
      o.push(A('heart', 640, 470, 80, 75, { cols: [p.b] }), A('star', 330, 480, 60, 60, { cols: [p.acc] }), A('swirl', 80, 500, 200, 133, { cols: [p.b] })); 
      o.push(R(90, 620, W - 180, 330, '#ffffff', { r: 6, angle: -1, shadow: { y: 6, b: 16, c: 'rgba(0,0,0,.10)' } }), A('washi', W / 2 - 80, 600, 160, 42, { cols: [p.d, '#ffffff'], angle: -3 }));
      o.push(pp.logo(W - 200, 680, 80, { fill: p.soft, stroke: p.d, sw: 2 }));
      o.push(T(W - 270, 770, 220, '{{SCHOOL}}', 20, { font: 'Patrick Hand', color: p.a, align: 'center' }));
      o.push(A('pencil', 470, 1000, 260, 57, { cols: [p.acc, p.d, '#1f2937'], angle: -10 }), A('confetti', 40, 960, 300, 150, { cols: [p.b, p.acc, p.d, '#86efac'] }));
      return o.concat(info(130, 660, 400, p, { rh: 50, lw: 0.4, lf: 'Patrick Hand', vf: 'Patrick Hand', ls: 20, vs: 20, dash: true, rows: [['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Teacher', '{{TEACHER}}'], ['Session', '{{SESSION}}'], ['Date', '{{DATE}}']] }));
    } },
    { id: 'lotus', name: 'Lotus Calm', cat: 'Aesthetic', inner: innerSoft, pals: ['peach', 'rosegold', 'lavender', 'mint'], cover: function (p) {
      var o = [R(0, 0, W, H, K.G(180, p.soft, p.bg)), A('mandala', W / 2 - 330, 160, 660, 660, { cols: [p.c, p.d], op: 0.35 })];
      o = o.concat(head(60, p, { size: 21, font: 'Cinzel', bold: 700, ls: 100 }));
      o.push(A('lotus', W / 2 - 150, 250, 300, 225, { cols: [p.c, p.b] }));
      o = o.concat(stack(500, 720, [
        { text: '{{TITLE}}', size: 74, font: 'Cormorant Garamond', bold: 700, color: p.a, lh: 1.02, gap: 10 },
        { div: p.b, w: 220, gap: 10 },
        { text: '{{SUBJECT|upper}}  ·  PROJECT', size: 16, font: 'Montserrat', bold: 600, color: p.b, ls: 300, gap: 0 }
      ]));
      o.push(pp.photo(110, 780, 170, 200, { r: 85, fill: p.c, stroke: '#ffffff', sw: 6 }));
      o.push(card(310, 770, W - 400, 230, p, { r: 24 }));
      return o.concat(info(336, 792, W - 452, p, { rh: 42, ls: 15, vs: 17, lf: 'Cormorant Garamond', vf: 'Cormorant Garamond', rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Teacher', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'goldframe', name: 'Rose Gold Elegance', cat: 'Aesthetic', inner: innerFloral, pals: ['rosegold', 'beige', 'blush', 'lavender'], cover: function (p) {
      var f = fl(p), o = [R(0, 0, W, H, p.soft), A('goldframe', 30, 30, W - 60, H - 60, { cols: ['#c9a227'] })];
      o.push(A('swag', 50, 30, 694, 225, { cols: f }), A('swag', 120, H - 215, 554, 180, { cols: f, flipY: true }));
      o = o.concat(head(250, p, { size: 22, font: 'Cinzel', bold: 700, ls: 120, col: p.a }));
      o = o.concat(stack(410, 640, [
        { text: 'a project on', size: 34, font: 'Great Vibes', color: '#b08d2c', gap: 4 },
        { text: '{{TITLE|upper}}', size: 54, font: 'Cinzel', bold: 700, color: p.a, lh: 1.08, ls: 80, gap: 12 },
        { text: '{{SUBJECT}}', size: 20, font: 'Cormorant Garamond', bold: 700, italic: true, color: p.ink, gap: 0 }
      ], { x: 110, w: W - 220 }));
      o.push(C(W / 2, 718, 66, null, { stroke: '#c9a227', sw: 3 }), pp.photo(W / 2 - 58, 660, 116, 116, { shape: 'circle', sw: 0, fill: p.c }));
      return o.concat(stack(796, 880, [{ text: '{{NAME}}  ·  Class {{CLASS}} – {{SECTION}}  ·  Roll {{ROLL}}', size: 17, font: 'Cormorant Garamond', bold: 700, color: p.ink, gap: 2 }, { text: 'Submitted to {{TEACHER}}  ·  {{SESSION}}', size: 15, font: 'Cormorant Garamond', italic: true, color: p.a, gap: 0 }], { x: 110, w: W - 220 }));
    } },
    { id: 'hearts', name: 'Lovely Hearts', cat: 'Cute', inner: innerCute, pals: ['blush', 'lavender', 'peach', 'rosegold'], cover: function (p) {
      var o = [R(0, 0, W, H, p.bg)];
      for (var i = 0; i < 26; i++) { var x = (i * 173) % (W - 40), y = (i * 263) % (H - 40); o.push(A(i % 3 ? 'heart' : 'sparkle', x, y, 30 + (i % 4) * 8, 28 + (i % 4) * 8, { cols: [i % 2 ? p.d : p.c], angle: (i * 29) % 40 - 20, op: 0.9 })); }
      o.push(R(70, 150, W - 140, 840, '#ffffff', { r: 360, shadow: { y: 10, b: 30, c: 'rgba(140,50,90,.12)' } }));
      o = o.concat(head(190, p, { size: 19, font: 'Quicksand', bold: 700, ls: 60 }));
      o.push(A('heart', W / 2 - 190, 360, 380, 355, { cols: [p.c] }));
      o = o.concat(stack(420, 620, [
        { text: '{{TITLE}}', size: 64, font: 'Pacifico', color: p.a, lh: 1.15, gap: 6 },
        { text: '{{SUBJECT}} project', size: 22, font: 'Quicksand', bold: 700, color: p.ink, gap: 0 }
      ], { x: 180, w: W - 360 }));
      o.push(C(W / 2, 760, 70, '#ffffff'), pp.photo(W / 2 - 62, 698, 124, 124, { shape: 'circle', stroke: p.d, sw: 4 }));
      return o.concat(info(190, 850, W - 380, p, { rh: 32, ls: 13, vs: 15, lf: 'Quicksand', vf: 'Quicksand', rows: [['Name', '{{NAME}}'], ['Class · Roll', '{{CLASS}} – {{SECTION}} · {{ROLL}}'], ['Teacher', '{{TEACHER}}']] }));
    } },
    { id: 'literature', name: 'Book Lover', cat: 'Subjects', inner: innerLeaf, pals: ['beige', 'sky', 'blush', 'mint'], cover: function (p) {
      var o = [R(0, 0, W, H, p.soft), R(0, 0, W, 300, p.c), A('books', 470, 120, 270, 225, { cols: [p.d, p.b, p.acc, '#3b2f27'] }), A('pencil', 60, 250, 260, 57, { cols: [p.acc, p.d, '#3b2f27'], angle: -12 }), A('leaf', 420, 40, 60, 150, { cols: ['#8fb996', '#e9f5ea'], angle: -30 })];
      o.push(pp.logo(60, 60, 80, { fill: '#ffffff', stroke: p.d, sw: 2 }));
      o = o.concat(pp.school(155, 300, 62, 140, p.a, { align: 'left', size: 19, sub: 13, subCol: p.b, ls: 30 }));
      o = o.concat(stack(370, 650, [
        { text: '“', size: 120, font: 'Playfair Display', bold: 700, color: p.d, gap: -40, lh: 0.8 },
        { text: '{{TITLE}}', size: 70, font: 'Playfair Display', bold: 700, italic: true, color: p.ink, lh: 1.05, gap: 14 },
        { text: '{{SUBJECT|upper}}  PROJECT', size: 16, font: 'Josefin Sans', bold: 700, color: p.a, ls: 400, gap: 0 }
      ], { x: 100, w: W - 200 }));
      o.push(R(100, 700, 190, 230, p.c, { r: 14 }), pp.photo(86, 686, 190, 230, { r: 14, sw: 0, fill: '#ffffff' }));
      return o.concat(info(330, 705, W - 430, p, { rh: 44, lw: 0.4, lf: 'Josefin Sans', vf: 'Josefin Sans', rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Teacher', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'globe', name: 'Geo Explorer', cat: 'Subjects', inner: innerSoft, pals: ['sky', 'mint', 'peach', 'lavender'], cover: function (p) {
      var o = [R(0, 0, W, H, p.bg), C(W / 2, 360, 300, p.c), A('cloud', 30, 120, 180, 108, { cols: ['#ffffff', p.c] }), A('cloud', 590, 420, 170, 102, { cols: ['#ffffff', p.c] }), A('globe', W / 2 - 150, 160, 300, 340, { cols: ['#93c5fd', '#86efac', '#1f2937'] }), A('arrow', 560, 170, 150, 100, { cols: [p.a] }), A('star', 120, 420, 50, 50, { cols: [p.acc] })];
      o.push(pp.logo(40, 40, 70, { fill: '#ffffff', stroke: p.d, sw: 2 }));
      o.push(T(124, 54, 420, '{{SCHOOL}}', 20, { font: 'Fredoka', bold: 700, color: p.a }));
      o = o.concat(stack(540, 760, [
        { text: '{{SUBJECT}}', size: 30, font: 'Caveat', bold: 700, color: p.b, gap: 0 },
        { text: '{{TITLE}}', size: 66, font: 'Fredoka', bold: 700, color: p.a, lh: 1.05, gap: 0 }
      ]));
      o.push(R(100, 800, 180, 210, '#ffffff', { r: 18, shadow: { y: 6, b: 18, c: 'rgba(0,0,0,.10)' } }), pp.photo(110, 810, 160, 190, { r: 12, sw: 0, fill: p.c }));
      o.push(card(310, 790, W - 400, 230, p, { r: 24, fill: '#ffffff' }));
      return o.concat(info(336, 812, W - 452, p, { rh: 42, ls: 15, vs: 17, lf: 'Fredoka', vf: 'Fredoka', rows: [['Name', '{{NAME}}'], ['Class', '{{CLASS}} – {{SECTION}}'], ['Roll No.', '{{ROLL}}'], ['Teacher', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'maths', name: 'Maths Doodles', cat: 'Subjects', inner: innerNote, pals: ['lavender', 'sky', 'blush', 'butter'], cover: function (p) {
      var o = [R(0, 0, W, H, '#fdfdff')];
      for (var x = 0; x <= W; x += 28) o.push(L(x, 0, x, H, p.c, 1));
      for (var y = 0; y <= H; y += 28) o.push(L(0, y, W, y, p.c, 1));
      [['π', 60, 80], ['√x', 600, 60], ['x²', 120, 380], ['÷', 660, 330], ['∑', 50, 650], ['%', 680, 600], ['1 2 3', 520, 900], ['+ −', 80, 930], ['∞', 360, 40], ['△ ○ □', 270, 1020]].forEach(function (d, i) { o.push(T(d[1], d[2], 200, d[0], 54, { font: 'Gochi Hand', color: [p.b, p.acc, p.d][i % 3], angle: (i % 2 ? 1 : -1) * 10 })); });
      o.push(card(90, 160, W - 180, 760, p, { r: 30, fill: '#ffffff', stroke: p.d, sw: 3 }));
      o = o.concat(head(190, p, { size: 20, font: 'Fredoka', bold: 700, ls: 40 }));
      o = o.concat(stack(370, 600, [
        { text: '{{SUBJECT}}', size: 40, font: 'Gochi Hand', color: p.b, gap: 0 },
        { text: '{{TITLE}}', size: 66, font: 'Fredoka', bold: 700, color: p.a, lh: 1.05, gap: 0 }
      ], { x: 130, w: W - 260 }));
      o.push(C(W / 2, 680, 70, p.c), pp.photo(W / 2 - 62, 618, 124, 124, { shape: 'circle', stroke: '#ffffff', sw: 5 }));
      return o.concat(info(160, 775, W - 320, p, { rh: 32, ls: 14, vs: 16, lf: 'Fredoka', vf: 'Fredoka', rows: [['Name', '{{NAME}}'], ['Class · Roll', '{{CLASS}} – {{SECTION}} · {{ROLL}}'], ['Teacher', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'artsy', name: 'Art & Colours', cat: 'Subjects', inner: innerCute, pals: ['blush', 'butter', 'sky', 'mint'], cover: function (p) {
      var o = [R(0, 0, W, H, '#ffffff')];
      [['#fbcfe8', -80, -60], ['#bfdbfe', 520, -80], ['#fde68a', 560, 760], ['#bbf7d0', -100, 820], ['#ddd6fe', 300, 980]].forEach(function (b) { o.push(A('blob', b[1], b[2], 380, 304, { cols: [b[0]] })); });
      o.push(A('rainbow', 470, 300, 260, 150, { cols: ['#fca5a5', '#fdba74', '#fde68a', '#a7f3d0', '#bfdbfe', '#ddd6fe'] }), A('confetti', 40, 300, 260, 195, { cols: ['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa'] }));
      o.push(pp.logo(W / 2 - 40, 60, 80, { fill: '#ffffff', stroke: p.d, sw: 2 }));
      o = o.concat(pp.school(110, W - 220, 150, 220, p.ink, { size: 20, sub: 13, subCol: p.b }));
      o = o.concat(stack(470, 680, [
        { text: '{{TITLE}}', size: 72, font: 'Bagel Fat One', color: p.a, lh: 1.05, gap: 8 },
        { text: '{{SUBJECT}} project', size: 30, font: 'Caveat Brush', color: p.b, gap: 0 }
      ]));
      o.push(R(W / 2 - 90, 700, 180, 200, '#ffffff', { r: 20, angle: -3, shadow: { y: 6, b: 18, c: 'rgba(0,0,0,.12)' } }), pp.photo(W / 2 - 80, 710, 160, 160, { r: 14, sw: 0, angle: -3, fill: p.c }));
      return o.concat(stack(920, 1060, [{ text: '{{NAME}}', size: 30, font: 'Caveat Brush', color: p.ink, gap: 2 }, { text: 'Class {{CLASS}} – {{SECTION}}  ·  Roll {{ROLL}}  ·  {{TEACHER}}', size: 16, font: 'Poppins', bold: 500, color: p.a, gap: 0 }]));
    } },
    { id: 'night', name: 'Starry Night', cat: 'Aesthetic', inner: innerSoft, pals: ['lavender', 'sky', 'blush', 'rosegold'], cover: function (p) {
      var o = [R(0, 0, W, H, K.G(180, '#1e1b4b', '#3b2a6b', '#6d4c8e'))];
      for (var i = 0; i < 70; i++) o.push(C((i * 211) % W, (i * 397) % H, 1 + (i % 3), '#ffffff', { op: 0.5 + (i % 3) * 0.15 }));
      o.push(A('moon', 520, 50, 220, 220, { cols: ['#fde68a', '#fcd34d'] }), spark(80, 140, 90, { acc: '#fde68a', b: p.d }), spark(620, 760, 80, { acc: '#fde68a', b: p.d }), A('cloud', -40, 980, 340, 204, { cols: [p.c, p.d] }), A('cloud', 480, 1000, 360, 216, { cols: [p.c, p.d] }));
      o.push(pp.logo(60, 60, 80, { fill: '#ffffff', sw: 0 }));
      o = o.concat(pp.school(155, 330, 62, 140, '#ffffff', { align: 'left', size: 19, sub: 13, subCol: p.c, ls: 30 }));
      o = o.concat(stack(310, 580, [
        { text: '{{SUBJECT}}', size: 30, font: 'Josefin Sans', bold: 600, color: p.c, ls: 300, gap: 4 },
        { text: '{{TITLE}}', size: 92, font: 'Great Vibes', color: '#fde68a', lh: 1, gap: 6, shadow: { x: 0, y: 0, b: 18, c: 'rgba(253,230,138,.5)' } },
        { text: 'PROJECT FILE', size: 16, font: 'Josefin Sans', bold: 700, color: '#ffffff', ls: 500, gap: 0 }
      ]));
      o.push(C(W / 2, 690, 84, null, { stroke: '#fde68a', sw: 3 }), pp.photo(W / 2 - 76, 614, 152, 152, { shape: 'circle', sw: 0, fill: '#4c3a7a' }));
      o.push(card(120, 800, W - 240, 190, p, { r: 24, fill: 'rgba(255,255,255,0.12)', stroke: 'rgba(255,255,255,0.35)', sw: 1.5, shadow: false }));
      return o.concat(info(150, 822, W - 300, p, { rh: 38, ls: 15, vs: 17, lc: '#fde68a', vc: '#ffffff', line: 'rgba(255,255,255,0.35)', rows: [['Name', '{{NAME}}'], ['Class · Roll', '{{CLASS}} – {{SECTION}} · {{ROLL}}'], ['Teacher', '{{TEACHER}}'], ['Session', '{{SESSION}}']] }));
    } },
    { id: 'tag', name: 'Scallop Label', cat: 'Aesthetic', inner: innerSoft, pals: ['mint', 'blush', 'butter', 'lavender'], cover: function (p) {
      var o = [R(0, 0, W, H, p.bg)];
      for (var i = 0; i < 12; i++) o.push(R(0, i * 100, W, 50, '#ffffff', { op: 0.5 }));
      o.push(A('scallop', W / 2 - 300, 150, 600, 600, { cols: ['#ffffff', p.b] }), A('bow', W / 2 - 80, 100, 160, 120, { cols: [p.d, p.a] }));
      o = o.concat(head(240, p, { size: 18, font: 'Quicksand', bold: 700, ls: 60 }));
      o = o.concat(stack(410, 620, [
        { text: '{{TITLE}}', size: 60, font: 'Lobster Two', bold: 700, color: p.a, lh: 1.05, gap: 10 },
        { text: '{{SUBJECT|upper}}', size: 16, font: 'Quicksand', bold: 700, color: p.b, ls: 300, gap: 0 }
      ], { x: 200, w: W - 400 }));
      o.push(pp.photo(W / 2 - 60, 790, 120, 120, { shape: 'circle', stroke: '#ffffff', sw: 5 }));
      o.push(A('label', 120, 930, W - 240, 150, { cols: ['#ffffff', p.b] }));
      return o.concat(stack(950, 1060, [{ text: '{{NAME}}', size: 26, font: 'Lobster Two', bold: 700, color: p.ink, gap: 2 }, { text: 'Class {{CLASS}} – {{SECTION}}  ·  Roll {{ROLL}}  ·  {{TEACHER}}', size: 14, font: 'Quicksand', bold: 700, color: p.a, gap: 0 }], { x: 170, w: W - 340 }));
    } }
  ];

  var out = [];
  D.forEach(function (d) {
    d.pals.forEach(function (pk, pi) {
      var pal = Object.assign({ hf: 'Playfair Display', hs: true }, PAL[pk]);
      out.push({ id: 'pa-' + d.id + '-' + pk, name: d.name + (pi ? ' · ' + pk[0].toUpperCase() + pk.slice(1) : ''), cat: d.cat, sizes: ['a4p'], pal: pal, build: function (Wp, Hp, p) {
        var u = Wp / W, H0 = Hp / u, st = function (w, h, q) { return d.inner(w, h, q); };
        return { pageNames: pp.PN, pages: [
          { bg: p.bg, objects: pp.scale(d.cover(p), u) },
          { bg: p.bg, objects: pp.scale(pp.certPage(st, W, H0, p), u) },
          { bg: p.bg, objects: pp.scale(pp.ackPage(st, W, H0, p), u) },
          { bg: p.bg, objects: pp.scale(pp.indexPage(st, W, H0, p), u) }
        ] };
      } });
    });
  });
  [].unshift.apply(ST.templates, out);
  K.AES = { PAL: PAL, info: info, card: card, spark: spark };
})();
