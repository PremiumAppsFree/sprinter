/* S Printer — illustration & sticker library for the Design Studio.
 * Every item is an original vector drawing made in code, re-colourable (cols = its colours).
 * SPStudio.ART[id] = { name, cat, w, h, cols: [...], svg: function (cols) → '<svg…>' }
 * SPStudio.artURL(id, cols) → data URL for an image. */
(function () {
  'use strict';
  var ST = window.SPStudio = window.SPStudio || {};
  var ART = ST.ART = {};
  var uid = 0;
  function n(v) { return Math.round(v * 10) / 10; }
  function svg(w, h, body, defs) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' + (defs ? '<defs>' + defs + '</defs>' : '') + body + '</svg>'; }
  function rg(id, a, b, c) { return '<radialGradient id="' + id + '" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="' + a + '"/>' + (c ? '<stop offset=".55" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/>' : '<stop offset="1" stop-color="' + b + '"/>') + '</radialGradient>'; }
  function lg(id, a, b, x2, y2) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
  function mix(a, b, t) { // blend two #rrggbb colours
    function p(c) { c = c.replace('#', ''); if (c.length === 3) c = c.replace(/./g, '$&$&'); return [0, 2, 4].map(function (i) { return parseInt(c.substr(i, 2), 16); }); }
    var x = p(a), y = p(b); return '#' + x.map(function (v, i) { return ('0' + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2); }).join('');
  }
  ST.mix = mix;
  var WC = '<filter id="wc" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7"/><feDisplacementMap in="SourceGraphic" scale="34"/><feGaussianBlur stdDeviation="1.6"/></filter>';
  var ROUGH = '<filter id="rough" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="14"/></filter>';

  // ---------- botanical pieces (drawn around 0,0 then placed with transform) ----------
  function leaf(len, w, fill, vein) {
    return '<path d="M0 0 Q ' + n(w) + ' ' + n(-len * 0.45) + ' 0 ' + n(-len) + ' Q ' + n(-w) + ' ' + n(-len * 0.45) + ' 0 0Z" fill="' + fill + '"/>' +
      (vein ? '<path d="M0 ' + n(-len * 0.06) + ' Q ' + n(w * 0.12) + ' ' + n(-len * 0.5) + ' 0 ' + n(-len * 0.92) + '" stroke="' + vein + '" stroke-width="' + n(Math.max(1, w * 0.08)) + '" fill="none" stroke-linecap="round" opacity=".7"/>' : '');
  }
  function at(x, y, rot, s, inner) { return '<g transform="translate(' + n(x) + ' ' + n(y) + ') rotate(' + n(rot || 0) + ') scale(' + (s == null ? 1 : s) + ')">' + inner + '</g>'; }
  function petalPath(len, w) { return 'M0 0 C ' + n(w) + ' ' + n(-len * 0.25) + ' ' + n(w * 1.05) + ' ' + n(-len * 0.85) + ' 0 ' + n(-len) + ' C ' + n(-w * 1.05) + ' ' + n(-len * 0.85) + ' ' + n(-w) + ' ' + n(-len * 0.25) + ' 0 0Z'; }
  function rose(r, c1, c2, c3) {   // r = radius; c1 light, c2 main, c3 dark
    var id = 'r' + (++uid), o = '<defs>' + rg(id, c1, c2, c3) + rg(id + 'b', mix(c1, '#ffffff', 0.3), c2) + '</defs>';
    for (var i = 0; i < 7; i++) o += at(0, 0, i * 51.4 + 10, 1, '<path d="' + petalPath(r, r * 0.62) + '" fill="url(#' + id + ')" stroke="' + c3 + '" stroke-width="' + n(r * 0.012) + '" stroke-opacity=".35"/>');
    for (i = 0; i < 5; i++) o += at(0, 0, i * 72 + 36, 1, '<path d="' + petalPath(r * 0.7, r * 0.48) + '" fill="url(#' + id + 'b)" stroke="' + c3 + '" stroke-width="' + n(r * 0.012) + '" stroke-opacity=".4"/>');
    o += '<circle r="' + n(r * 0.36) + '" fill="' + c2 + '"/>';
    o += '<path d="M' + n(-r * 0.3) + ' ' + n(r * 0.05) + ' C ' + n(-r * 0.3) + ' ' + n(-r * 0.32) + ' ' + n(r * 0.3) + ' ' + n(-r * 0.34) + ' ' + n(r * 0.28) + ' 0 C ' + n(r * 0.26) + ' ' + n(r * 0.24) + ' ' + n(-r * 0.14) + ' ' + n(r * 0.26) + ' ' + n(-r * 0.14) + ' ' + n(-r * 0.02) + ' C ' + n(-r * 0.14) + ' ' + n(-r * 0.18) + ' ' + n(r * 0.12) + ' ' + n(-r * 0.18) + ' ' + n(r * 0.1) + ' 0" fill="none" stroke="' + c3 + '" stroke-width="' + n(r * 0.05) + '" stroke-linecap="round" opacity=".75"/>';
    return o;
  }
  function blossom(r, c1, c2, cc) {   // 5-petal flower
    var id = 'b' + (++uid), o = '<defs>' + rg(id, c1, c2) + '</defs>';
    for (var i = 0; i < 5; i++) o += at(0, 0, i * 72, 1, '<path d="M0 0 C ' + n(r * 0.55) + ' ' + n(-r * 0.2) + ' ' + n(r * 0.62) + ' ' + n(-r * 0.95) + ' ' + n(r * 0.12) + ' ' + n(-r) + ' L 0 ' + n(-r * 0.9) + ' L ' + n(-r * 0.12) + ' ' + n(-r) + ' C ' + n(-r * 0.62) + ' ' + n(-r * 0.95) + ' ' + n(-r * 0.55) + ' ' + n(-r * 0.2) + ' 0 0Z" fill="url(#' + id + ')"/>');
    o += '<circle r="' + n(r * 0.2) + '" fill="' + cc + '"/>';
    for (i = 0; i < 8; i++) { var a = i * Math.PI / 4; o += '<circle cx="' + n(Math.cos(a) * r * 0.3) + '" cy="' + n(Math.sin(a) * r * 0.3) + '" r="' + n(r * 0.045) + '" fill="' + mix(cc, '#000000', 0.25) + '"/>'; }
    return o;
  }
  function daisy(r, pc, cc) {
    var o = '';
    for (var i = 0; i < 16; i++) o += at(0, 0, i * 22.5, 1, '<ellipse cx="0" cy="' + n(-r * 0.55) + '" rx="' + n(r * 0.14) + '" ry="' + n(r * 0.46) + '" fill="' + pc + '" stroke="' + mix(pc, '#000000', 0.12) + '" stroke-width="' + n(r * 0.015) + '"/>');
    return o + '<circle r="' + n(r * 0.26) + '" fill="' + cc + '"/><circle r="' + n(r * 0.26) + '" fill="none" stroke="' + mix(cc, '#000000', 0.2) + '" stroke-width="' + n(r * 0.04) + '" stroke-dasharray="' + n(r * 0.03) + ' ' + n(r * 0.05) + '"/>';
  }
  function tulip(h, c1, c2, lc) {
    var w = h * 0.22, id = 't' + (++uid);
    return '<defs>' + lg(id, c1, c2) + '</defs><path d="M0 0 Q ' + n(h * 0.04) + ' ' + n(-h * 0.4) + ' 0 ' + n(-h * 0.62) + '" stroke="' + lc + '" stroke-width="' + n(h * 0.03) + '" fill="none"/>' +
      at(0, -h * 0.05, -25, 1, leaf(h * 0.45, h * 0.1, lc)) +
      '<path d="M' + n(-w) + ' ' + n(-h * 0.8) + ' C ' + n(-w) + ' ' + n(-h * 0.6) + ' ' + n(w) + ' ' + n(-h * 0.6) + ' ' + n(w) + ' ' + n(-h * 0.8) + ' L ' + n(w * 0.95) + ' ' + n(-h) + ' L ' + n(w * 0.35) + ' ' + n(-h * 0.86) + ' L 0 ' + n(-h * 1.02) + ' L ' + n(-w * 0.35) + ' ' + n(-h * 0.86) + ' L ' + n(-w * 0.95) + ' ' + n(-h) + 'Z" fill="url(#' + id + ')"/>';
  }
  function sprig(len, c, n0, round) {   // stem with paired leaves
    var o = '<path d="M0 0 Q ' + n(len * 0.06) + ' ' + n(-len * 0.5) + ' 0 ' + n(-len) + '" stroke="' + mix(c, '#000000', 0.2) + '" stroke-width="' + n(len * 0.012 + 1) + '" fill="none"/>';
    var k = n0 || 7;
    for (var i = 0; i < k; i++) {
      var t = (i + 0.6) / (k + 0.5), y = -len * t, s = 1 - t * 0.55, lc = i % 2 ? c : mix(c, '#ffffff', 0.18);
      if (round) { o += '<ellipse cx="' + n(len * 0.07 * s) + '" cy="' + n(y) + '" rx="' + n(len * 0.075 * s) + '" ry="' + n(len * 0.06 * s) + '" fill="' + lc + '"/><ellipse cx="' + n(-len * 0.07 * s) + '" cy="' + n(y - len * 0.03) + '" rx="' + n(len * 0.075 * s) + '" ry="' + n(len * 0.06 * s) + '" fill="' + mix(lc, '#000000', 0.06) + '"/>'; }
      else { o += at(0, y, 52, s, leaf(len * 0.24, len * 0.065, lc)) + at(0, y - len * 0.03, -52, s, leaf(len * 0.24, len * 0.065, mix(lc, '#000000', 0.06))); }
    }
    return o + at(0, -len, 0, 0.8, leaf(len * 0.2, len * 0.06, c));
  }
  function berries(r, c, k) { var o = ''; for (var i = 0; i < (k || 5); i++) { var a = i * 2.4; o += '<circle cx="' + n(Math.cos(a) * r * (0.4 + i * 0.12)) + '" cy="' + n(Math.sin(a) * r * (0.4 + i * 0.12)) + '" r="' + n(r * 0.18) + '" fill="' + c + '"/><circle cx="' + n(Math.cos(a) * r * (0.4 + i * 0.12) - r * 0.05) + '" cy="' + n(Math.sin(a) * r * (0.4 + i * 0.12) - r * 0.05) + '" r="' + n(r * 0.05) + '" fill="#fff" opacity=".6"/>'; } return o; }
  function babysBreath(len, c) { var o = '<path d="M0 0 Q ' + n(len * 0.1) + ' ' + n(-len * 0.5) + ' ' + n(len * 0.02) + ' ' + n(-len) + '" stroke="#9aa78a" stroke-width="1.5" fill="none"/>'; for (var i = 0; i < 9; i++) { var y = -len * (0.35 + i * 0.075), x = Math.sin(i * 2.1) * len * 0.16; o += '<path d="M' + n(len * 0.04) + ' ' + n(y + len * 0.08) + ' L ' + n(x) + ' ' + n(y) + '" stroke="#9aa78a" stroke-width="1"/><circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(len * 0.03) + '" fill="' + c + '"/>'; } return o; }
  function butterfly(s, c1, c2, body) {
    var id = 'bf' + (++uid), d = '<defs>' + rg(id, c1, c2) + '</defs>';
    var up = 'M0 0 C ' + n(s * 0.2) + ' ' + n(-s * 0.9) + ' ' + n(s * 1.05) + ' ' + n(-s * 0.95) + ' ' + n(s * 0.95) + ' ' + n(-s * 0.35) + ' C ' + n(s * 0.9) + ' ' + n(-s * 0.05) + ' ' + n(s * 0.4) + ' ' + n(s * 0.02) + ' 0 0Z';
    var lo = 'M0 0 C ' + n(s * 0.45) + ' ' + n(s * 0.05) + ' ' + n(s * 0.75) + ' ' + n(s * 0.35) + ' ' + n(s * 0.55) + ' ' + n(s * 0.62) + ' C ' + n(s * 0.35) + ' ' + n(s * 0.85) + ' ' + n(s * 0.05) + ' ' + n(s * 0.5) + ' 0 0Z';
    var w = '<path d="' + up + '" fill="url(#' + id + ')" stroke="' + body + '" stroke-width="' + n(s * 0.03) + '"/><path d="' + lo + '" fill="url(#' + id + ')" stroke="' + body + '" stroke-width="' + n(s * 0.03) + '"/>' +
      '<circle cx="' + n(s * 0.62) + '" cy="' + n(-s * 0.5) + '" r="' + n(s * 0.09) + '" fill="#fff" opacity=".75"/><circle cx="' + n(s * 0.38) + '" cy="' + n(s * 0.36) + '" r="' + n(s * 0.06) + '" fill="#fff" opacity=".7"/>';
    return d + w + '<g transform="scale(-1 1)">' + w + '</g><ellipse cx="0" cy="' + n(s * 0.05) + '" rx="' + n(s * 0.06) + '" ry="' + n(s * 0.45) + '" fill="' + body + '"/>' +
      '<path d="M0 ' + n(-s * 0.35) + ' Q ' + n(-s * 0.15) + ' ' + n(-s * 0.7) + ' ' + n(-s * 0.3) + ' ' + n(-s * 0.75) + ' M0 ' + n(-s * 0.35) + ' Q ' + n(s * 0.15) + ' ' + n(-s * 0.7) + ' ' + n(s * 0.3) + ' ' + n(-s * 0.75) + '" stroke="' + body + '" stroke-width="' + n(s * 0.025) + '" fill="none" stroke-linecap="round"/>';
  }
  function sparkle(r, c) { return '<path d="M0 ' + n(-r) + ' C ' + n(r * 0.12) + ' ' + n(-r * 0.12) + ' ' + n(r * 0.12) + ' ' + n(-r * 0.12) + ' ' + n(r) + ' 0 C ' + n(r * 0.12) + ' ' + n(r * 0.12) + ' ' + n(r * 0.12) + ' ' + n(r * 0.12) + ' 0 ' + n(r) + ' C ' + n(-r * 0.12) + ' ' + n(r * 0.12) + ' ' + n(-r * 0.12) + ' ' + n(r * 0.12) + ' ' + n(-r) + ' 0 C ' + n(-r * 0.12) + ' ' + n(-r * 0.12) + ' ' + n(-r * 0.12) + ' ' + n(-r * 0.12) + ' 0 ' + n(-r) + 'Z" fill="' + c + '"/>'; }
  function heart(s, c, stroke) { return '<path d="M0 ' + n(s * 0.35) + ' C ' + n(-s * 0.9) + ' ' + n(-s * 0.2) + ' ' + n(-s * 0.45) + ' ' + n(-s * 0.85) + ' 0 ' + n(-s * 0.4) + ' C ' + n(s * 0.45) + ' ' + n(-s * 0.85) + ' ' + n(s * 0.9) + ' ' + n(-s * 0.2) + ' 0 ' + n(s * 0.35) + 'Z" ' + (stroke ? 'fill="none" stroke="' + c + '" stroke-width="' + n(s * 0.08) + '" stroke-linejoin="round"' : 'fill="' + c + '"') + '/>'; }
  function star5(r, c, rr) { var p = []; for (var i = 0; i < 10; i++) { var a = Math.PI / 5 * i - Math.PI / 2, q = i % 2 ? r * (rr || 0.45) : r; p.push(n(Math.cos(a) * q) + ',' + n(Math.sin(a) * q)); } return '<polygon points="' + p.join(' ') + '" fill="' + c + '" stroke="' + c + '" stroke-width="' + n(r * 0.18) + '" stroke-linejoin="round"/>'; }
  function lotus(r, c1, c2) {
    var id = 'l' + (++uid), o = '<defs>' + lg(id, c1, c2) + '</defs>';
    [[-62, 0.75], [62, 0.75], [-36, 0.92], [36, 0.92], [0, 1]].forEach(function (p) { o += at(0, 0, p[0], p[1], '<path d="' + petalPath(r, r * 0.34) + '" fill="url(#' + id + ')" stroke="' + c2 + '" stroke-width="' + n(r * 0.02) + '"/>'); });
    return o + '<path d="M' + n(-r * 0.9) + ' ' + n(r * 0.04) + ' Q 0 ' + n(r * 0.3) + ' ' + n(r * 0.9) + ' ' + n(r * 0.04) + '" stroke="' + c2 + '" stroke-width="' + n(r * 0.05) + '" fill="none" stroke-linecap="round"/>';
  }
  function marigold(r, c1, c2) { var o = ''; [1, 0.78, 0.56, 0.34].forEach(function (k, j) { for (var i = 0; i < 14; i++) o += at(0, 0, i * 25.7 + j * 12, 1, '<ellipse cx="0" cy="' + n(-r * k * 0.62) + '" rx="' + n(r * 0.16 * k) + '" ry="' + n(r * 0.36 * k) + '" fill="' + (j % 2 ? c2 : c1) + '"/>'); }); return o + '<circle r="' + n(r * 0.14) + '" fill="' + c2 + '"/>'; }

  function add(id, o) { ART[id] = o; }

  // ---------- florals ----------
  add('rose', { name: 'Rose', cat: 'Flowers', w: 300, h: 300, cols: ['#fde2e4', '#f4a6b7', '#d36a85'], svg: function (c) { return svg(300, 300, at(150, 150, 0, 1, rose(140, c[0], c[1], c[2]))); } });
  add('blossom', { name: 'Blossom', cat: 'Flowers', w: 300, h: 300, cols: ['#fff1f4', '#f9a8c4', '#f6c453'], svg: function (c) { return svg(300, 300, at(150, 156, 0, 1, blossom(140, c[0], c[1], c[2]))); } });
  add('daisy', { name: 'Daisy', cat: 'Flowers', w: 300, h: 300, cols: ['#ffffff', '#f7c948'], svg: function (c) { return svg(300, 300, at(150, 150, 0, 1, daisy(145, c[0], c[1]))); } });
  add('tulip', { name: 'Tulip', cat: 'Flowers', w: 200, h: 400, cols: ['#ffb3c7', '#e8557f', '#6aa56b'], svg: function (c) { return svg(200, 400, at(100, 395, 0, 1, tulip(390, c[0], c[1], c[2]))); } });
  add('lotus', { name: 'Lotus', cat: 'Flowers', w: 400, h: 300, cols: ['#ffe0ec', '#e2558a'], svg: function (c) { return svg(400, 300, at(200, 250, 0, 1, lotus(230, c[0], c[1]))); } });
  add('marigold', { name: 'Marigold', cat: 'Flowers', w: 300, h: 300, cols: ['#ffb300', '#f57c00'], svg: function (c) { return svg(300, 300, at(150, 150, 0, 1, marigold(145, c[0], c[1]))); } });
  add('sprig', { name: 'Leafy sprig', cat: 'Leaves', w: 200, h: 500, cols: ['#8fb996'], svg: function (c) { return svg(200, 500, at(100, 495, 0, 1, sprig(480, c[0], 8))); } });
  add('eucalyptus', { name: 'Eucalyptus', cat: 'Leaves', w: 220, h: 500, cols: ['#9cb8a8'], svg: function (c) { return svg(220, 500, at(110, 495, 4, 1, sprig(470, c[0], 9, true))); } });
  add('leaf', { name: 'Leaf', cat: 'Leaves', w: 160, h: 400, cols: ['#7fb685', '#e9f5ea'], svg: function (c) { return svg(160, 400, at(80, 395, 0, 1, leaf(385, 70, c[0], c[1]))); } });
  add('monstera', { name: 'Big leaf', cat: 'Leaves', w: 400, h: 400, cols: ['#5f9e6e'], svg: function (c) {
    var o = at(200, 390, 0, 1, '<path d="M0 0 C -40 -60 -190 -120 -150 -260 C -110 -380 110 -380 150 -260 C 190 -120 40 -60 0 0Z" fill="' + c[0] + '"/>');
    for (var i = 0; i < 5; i++) o += at(200, 390, 0, 1, '<path d="M0 ' + (-60 - i * 50) + ' L ' + (-150 + i * 8) + ' ' + (-120 - i * 45) + ' M0 ' + (-60 - i * 50) + ' L ' + (150 - i * 8) + ' ' + (-120 - i * 45) + '" stroke="#ffffff" stroke-width="7" opacity=".5"/>');
    return svg(400, 400, o + '<path d="M200 390 L200 60" stroke="#fff" stroke-width="6" opacity=".55"/>');
  } });
  add('babybreath', { name: 'Baby’s breath', cat: 'Leaves', w: 200, h: 400, cols: ['#f9d5e0'], svg: function (c) { return svg(200, 400, at(100, 395, 0, 1, babysBreath(390, c[0]))); } });
  function bouquet(c, wide) { // c: [rose light, rose main, rose dark, leaf, small flower, filler]
    var o = '';
    // long sprigs fanning from the corner
    [[100, 430, 0], [128, 470, 1], [152, 400, 0], [176, 440, 1], [62, 380, 1]].forEach(function (s) { o += at(40, 40, s[0], 1, s[2] ? sprig(s[1], c[3], 8, true) : sprig(s[1], mix(c[3], '#000000', 0.08), 7)); });
    o += at(250, 70, 0, 1, babysBreath(150, c[5])) + at(70, 260, -80, 1, babysBreath(150, c[5]));
    o += at(310, 120, 0, 1, blossom(52, mix(c[4], '#ffffff', 0.5), c[4], '#f6c453'));
    o += at(110, 315, 0, 1, blossom(48, mix(c[4], '#ffffff', 0.5), c[4], '#f6c453'));
    o += at(235, 245, 30, 1, rose(70, c[0], c[1], c[2]));
    o += at(150, 150, 0, 1, rose(110, c[0], c[1], c[2]));
    o += at(330, 230, 0, 1, berries(30, c[2], 5)) + at(220, 345, 0, 1, berries(26, c[2], 4));
    return o;
  }
  add('bouquet', { name: 'Floral corner', cat: 'Flowers', w: 520, h: 520, cols: ['#fde2e4', '#f4a6b7', '#d36a85', '#8fb996', '#f9c6d3', '#ffffff'], svg: function (c) { return svg(520, 520, bouquet(c)); } });
  add('swag', { name: 'Flower garland', cat: 'Flowers', w: 800, h: 260, cols: ['#fde2e4', '#f4a6b7', '#d36a85', '#8fb996', '#f9c6d3', '#ffffff'], svg: function (c) {
    var o = '';
    for (var i = 0; i < 9; i++) o += at(400 + (i - 4) * 70, 120, (i - 4) * 18 + 90 * (i < 4 ? -1 : 1) * 0 + (i < 4 ? -70 : 70), 1, sprig(200, i % 2 ? c[3] : mix(c[3], '#000000', 0.1), 6, i % 2));
    o += at(250, 120, 0, 1, blossom(40, mix(c[4], '#fff', 0.5), c[4], '#f6c453')) + at(550, 120, 0, 1, blossom(40, mix(c[4], '#fff', 0.5), c[4], '#f6c453'));
    o += at(320, 130, 0, 1, rose(62, c[0], c[1], c[2])) + at(480, 130, 0, 1, rose(62, c[0], c[1], c[2])) + at(400, 120, 0, 1, rose(88, c[0], c[1], c[2]));
    return svg(800, 260, o);
  } });
  add('wreath', { name: 'Flower wreath', cat: 'Frames', w: 500, h: 500, cols: ['#fde2e4', '#f4a6b7', '#d36a85', '#8fb996', '#f9c6d3'], svg: function (c) {
    var o = '<circle cx="250" cy="250" r="200" fill="none" stroke="' + mix(c[3], '#000', 0.25) + '" stroke-width="3"/>';
    for (var i = 0; i < 26; i++) { var a = i / 26 * 360; o += at(250 + Math.cos(a * Math.PI / 180) * 200, 250 + Math.sin(a * Math.PI / 180) * 200, a + 180 + 25, 1, leaf(70, 18, i % 2 ? c[3] : mix(c[3], '#ffffff', 0.2))); }
    o += at(250, 450, 0, 1, rose(58, c[0], c[1], c[2])) + at(180, 430, 0, 1, blossom(34, mix(c[4], '#fff', 0.5), c[4], '#f6c453')) + at(322, 432, 0, 1, blossom(34, mix(c[4], '#fff', 0.5), c[4], '#f6c453'));
    o += at(110, 120, 0, 1, blossom(26, mix(c[4], '#fff', 0.5), c[4], '#f6c453')) + at(250, 50, 0, 1, rose(38, c[0], c[1], c[2]));
    return svg(500, 500, o);
  } });
  add('archflowers', { name: 'Floral arch', cat: 'Frames', w: 500, h: 700, cols: ['#fde2e4', '#f4a6b7', '#d36a85', '#8fb996', '#f9c6d3'], svg: function (c) {
    var o = '<path d="M60 690 L60 250 A190 190 0 0 1 440 250 L440 690" fill="none" stroke="' + mix(c[3], '#000', 0.2) + '" stroke-width="4"/>';
    for (var i = 0; i < 18; i++) { var a = 180 + i * 10; o += at(250 + Math.cos(a * Math.PI / 180) * 190, 250 + Math.sin(a * Math.PI / 180) * 190, a + 90 + (i % 2 ? 40 : -40), 1, leaf(60, 16, i % 2 ? c[3] : mix(c[3], '#fff', 0.2))); }
    o += at(95, 170, 0, 1, rose(55, c[0], c[1], c[2])) + at(150, 100, 0, 1, blossom(30, mix(c[4], '#fff', 0.5), c[4], '#f6c453')) + at(60, 250, 0, 1, berries(20, c[2]));
    o += at(60, 690, -10, 1, sprig(200, c[3], 6)) + at(440, 690, 10, 1, sprig(200, c[3], 6, true)) + at(440, 640, 0, 1, rose(50, c[0], c[1], c[2])) + at(395, 680, 0, 1, blossom(28, mix(c[4], '#fff', 0.5), c[4], '#f6c453'));
    return svg(500, 700, o);
  } });

  // ---------- cute & doodles ----------
  add('butterfly', { name: 'Butterfly', cat: 'Cute', w: 300, h: 260, cols: ['#e9d5ff', '#a78bfa', '#4c1d95'], svg: function (c) { return svg(300, 260, at(150, 140, -8, 1, butterfly(130, c[0], c[1], c[2]))); } });
  add('sparkles', { name: 'Sparkles', cat: 'Cute', w: 300, h: 300, cols: ['#f6c453', '#f9a8c4'], svg: function (c) { return svg(300, 300, at(120, 150, 0, 1, sparkle(100, c[0])) + at(240, 70, 0, 1, sparkle(45, c[1])) + at(235, 230, 0, 1, sparkle(30, c[0])) + '<circle cx="60" cy="50" r="8" fill="' + c[1] + '"/><circle cx="270" cy="150" r="6" fill="' + c[0] + '"/>'); } });
  add('sparkle', { name: 'Sparkle', cat: 'Cute', w: 200, h: 200, cols: ['#f6c453'], svg: function (c) { return svg(200, 200, at(100, 100, 0, 1, sparkle(96, c[0]))); } });
  add('heart', { name: 'Heart', cat: 'Cute', w: 300, h: 280, cols: ['#f472b6'], svg: function (c) { return svg(300, 280, at(150, 160, 0, 1, heart(250, c[0]))); } });
  add('hearts', { name: 'Hearts', cat: 'Cute', w: 300, h: 260, cols: ['#f472b6', '#fbcfe8'], svg: function (c) { return svg(300, 260, at(110, 150, -12, 1, heart(170, c[0])) + at(225, 90, 14, 1, heart(90, c[1])) + at(230, 200, 8, 1, heart(60, c[0], true))); } });
  add('cloud', { name: 'Cloud', cat: 'Cute', w: 400, h: 240, cols: ['#ffffff', '#dbeafe'], svg: function (c) { return svg(400, 240, '<path d="M70 200 C 10 200 10 120 75 118 C 70 50 160 30 190 85 C 220 30 320 40 315 115 C 390 110 395 200 330 200 Z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="8"/>'); } });
  add('rainbow', { name: 'Rainbow', cat: 'Cute', w: 400, h: 230, cols: ['#fca5a5', '#fdba74', '#fde68a', '#a7f3d0', '#bfdbfe', '#ddd6fe'], svg: function (c) { var o = ''; c.forEach(function (col, i) { var r = 190 - i * 22; o += '<path d="M' + (200 - r) + ' 220 A' + r + ' ' + r + ' 0 0 1 ' + (200 + r) + ' 220" fill="none" stroke="' + col + '" stroke-width="22" stroke-linecap="round"/>'; }); return svg(400, 230, o); } });
  add('star', { name: 'Star', cat: 'Cute', w: 200, h: 200, cols: ['#fcd34d'], svg: function (c) { return svg(200, 200, at(100, 106, 0, 1, star5(86, c[0]))); } });
  add('moon', { name: 'Moon & stars', cat: 'Cute', w: 300, h: 300, cols: ['#fde68a', '#fbbf24'], svg: function (c) { return svg(300, 300, '<path d="M190 40 A120 120 0 1 0 260 220 A95 95 0 1 1 190 40Z" fill="' + c[0] + '"/>' + at(240, 70, 0, 1, sparkle(26, c[1])) + at(270, 140, 0, 1, sparkle(14, c[1]))); } });
  add('bow', { name: 'Bow', cat: 'Cute', w: 320, h: 240, cols: ['#f9a8c4', '#db2777'], svg: function (c) { return svg(320, 240, '<path d="M160 100 C 110 20 20 30 30 100 C 40 160 110 140 160 110Z M160 100 C 210 20 300 30 290 100 C 280 160 210 140 160 110Z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="6"/><path d="M150 112 L110 225 L140 205 L160 230 L160 112Z M170 112 L210 225 L180 205 L160 230 Z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="6" stroke-linejoin="round"/><rect x="140" y="85" width="40" height="40" rx="12" fill="' + c[1] + '"/>'); } });
  add('squiggle', { name: 'Squiggle line', cat: 'Doodles', w: 500, h: 80, cols: ['#f472b6'], svg: function (c) { return svg(500, 80, '<path d="M10 40 Q 40 10 70 40 T 130 40 T 190 40 T 250 40 T 310 40 T 370 40 T 430 40 T 490 40" fill="none" stroke="' + c[0] + '" stroke-width="9" stroke-linecap="round"/>'); } });
  add('underline', { name: 'Brush underline', cat: 'Doodles', w: 500, h: 70, cols: ['#fbbf24'], svg: function (c) { return svg(500, 70, '<path d="M15 45 C 120 20 300 18 485 30 C 486 38 470 44 460 44 C 300 40 140 48 22 58 C 12 58 8 48 15 45Z" fill="' + c[0] + '" filter="url(#rough)"/>', ROUGH); } });
  add('arrow', { name: 'Doodle arrow', cat: 'Doodles', w: 300, h: 200, cols: ['#334155'], svg: function (c) { return svg(300, 200, '<path d="M20 160 C 60 40 180 30 260 70 M260 70 L 222 46 M260 70 L 232 106" fill="none" stroke="' + c[0] + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'); } });
  add('swirl', { name: 'Swirl', cat: 'Doodles', w: 300, h: 200, cols: ['#a78bfa'], svg: function (c) { return svg(300, 200, '<path d="M20 120 C 60 30 140 30 150 100 C 158 150 110 160 100 125 C 92 95 130 80 160 100 C 200 125 230 150 285 70" fill="none" stroke="' + c[0] + '" stroke-width="8" stroke-linecap="round"/>'); } });
  add('circledoodle', { name: 'Circle doodle', cat: 'Doodles', w: 400, h: 200, cols: ['#f43f5e'], svg: function (c) { return svg(400, 200, '<path d="M200 20 C 340 18 395 70 380 115 C 360 175 120 190 40 140 C -10 105 40 30 210 28" fill="none" stroke="' + c[0] + '" stroke-width="7" stroke-linecap="round"/>'); } });
  add('confetti', { name: 'Confetti', cat: 'Doodles', w: 400, h: 300, cols: ['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa'], svg: function (c) { var o = ''; for (var i = 0; i < 40; i++) { var x = (i * 157 + i * i * 7) % 390 + 5, y = (i * 61 + i * i * 11) % 290 + 5, col = c[i % c.length]; o += i % 3 ? '<rect x="' + x + '" y="' + y + '" width="14" height="6" rx="3" fill="' + col + '" transform="rotate(' + (i * 37 % 180) + ' ' + x + ' ' + y + ')"/>' : '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + col + '"/>'; } return svg(400, 300, o); } });
  add('dots', { name: 'Dot pattern', cat: 'Doodles', w: 300, h: 300, cols: ['#f9a8c4'], svg: function (c) { var o = ''; for (var y = 15; y < 300; y += 30) for (var x = 15 + (y / 30 % 2) * 15; x < 300; x += 30) o += '<circle cx="' + x + '" cy="' + y + '" r="5" fill="' + c[0] + '"/>'; return svg(300, 300, o); } });

  // ---------- shapes, tapes, labels ----------
  add('blob', { name: 'Watercolour', cat: 'Shapes', w: 500, h: 400, cols: ['#fbcfe8'], svg: function (c) { return svg(500, 400, '<g filter="url(#wc)"><path d="M90 120 C 140 30 330 20 410 90 C 480 150 470 290 380 330 C 280 380 120 370 70 290 C 30 230 50 170 90 120Z" fill="' + c[0] + '" opacity=".85"/><path d="M140 150 C 200 90 320 100 360 160 C 400 220 330 290 250 290 C 170 290 110 220 140 150Z" fill="' + mix(c[0], '#ffffff', 0.35) + '" opacity=".6"/></g>', WC); } });
  add('brush', { name: 'Brush stroke', cat: 'Shapes', w: 700, h: 180, cols: ['#fbcfe8'], svg: function (c) { return svg(700, 180, '<g filter="url(#rough)"><path d="M30 60 C 200 30 480 25 670 45 C 690 70 680 120 660 135 C 470 150 210 155 40 140 C 15 120 12 80 30 60Z" fill="' + c[0] + '"/><path d="M50 70 C 250 50 450 50 650 60" stroke="#ffffff" stroke-width="4" opacity=".35" fill="none"/></g>', ROUGH); } });
  add('washi', { name: 'Washi tape', cat: 'Shapes', w: 300, h: 80, cols: ['#fbcfe8', '#ffffff'], svg: function (c) { var z = 'M0 0 L300 0 L292 10 L300 20 L292 30 L300 40 L292 50 L300 60 L292 70 L300 80 L0 80 L8 70 L0 60 L8 50 L0 40 L8 30 L0 20 L8 10 Z', st = ''; for (var x = -40; x < 340; x += 26) st += '<path d="M' + x + ' 0 L' + (x + 40) + ' 80" stroke="' + c[1] + '" stroke-width="9" opacity=".55"/>'; return svg(300, 80, '<clipPath id="wt"><path d="' + z + '"/></clipPath><g clip-path="url(#wt)" opacity=".88"><rect width="300" height="80" fill="' + c[0] + '"/>' + st + '</g>'); } });
  add('ribbon', { name: 'Ribbon banner', cat: 'Shapes', w: 700, h: 170, cols: ['#f9a8c4', '#db2777'], svg: function (c) { return svg(700, 170, '<path d="M10 40 L120 40 L120 150 L10 150 L50 95Z" fill="' + c[1] + '"/><path d="M690 40 L580 40 L580 150 L690 150 L650 95Z" fill="' + c[1] + '"/><path d="M120 150 L150 128 L150 150Z M580 150 L550 128 L550 150Z" fill="' + mix(c[1], '#000', 0.3) + '"/><path d="M90 20 Q 350 -5 610 20 L610 128 Q 350 103 90 128Z" fill="' + c[0] + '"/>'); } });
  add('label', { name: 'Label tag', cat: 'Shapes', w: 500, h: 160, cols: ['#ffffff', '#f9a8c4'], svg: function (c) { return svg(500, 160, '<path d="M40 10 H460 Q490 80 460 150 H40 Q10 80 40 10Z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="6"/><path d="M55 25 H445 Q468 80 445 135 H55 Q32 80 55 25Z" fill="none" stroke="' + c[1] + '" stroke-width="2" stroke-dasharray="8 6"/>'); } });
  add('scallop', { name: 'Scallop frame', cat: 'Frames', w: 400, h: 400, cols: ['#fce7f3', '#f472b6'], svg: function (c) { var o = '', k = 24; for (var i = 0; i < k; i++) { var a = i / k * Math.PI * 2; o += '<circle cx="' + n(200 + Math.cos(a) * 170) + '" cy="' + n(200 + Math.sin(a) * 170) + '" r="28" fill="' + c[0] + '"/>'; } return svg(400, 400, o + '<circle cx="200" cy="200" r="172" fill="' + c[0] + '"/><circle cx="200" cy="200" r="150" fill="none" stroke="' + c[1] + '" stroke-width="3" stroke-dasharray="6 7"/>'); } });
  add('archframe', { name: 'Arch frame', cat: 'Frames', w: 400, h: 560, cols: ['#fdf2f8', '#f9a8c4'], svg: function (c) { return svg(400, 560, '<path d="M20 550 L20 200 A180 180 0 0 1 380 200 L380 550Z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="6"/><path d="M40 532 L40 202 A160 160 0 0 1 360 202 L360 532Z" fill="none" stroke="' + c[1] + '" stroke-width="2"/>'); } });
  add('goldframe', { name: 'Ornate frame', cat: 'Frames', w: 600, h: 400, cols: ['#c9a227'], svg: function (c) {
    function cor() { return '<path d="M0 60 C 0 20 20 0 60 0 M10 80 C 10 30 30 10 80 10 M30 30 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M0 110 C 20 100 26 80 20 60 M110 0 C 100 20 80 26 60 20" fill="none" stroke="' + c[0] + '" stroke-width="4" stroke-linecap="round"/>'; }
    return svg(600, 400, '<rect x="20" y="20" width="560" height="360" fill="none" stroke="' + c[0] + '" stroke-width="3"/><rect x="34" y="34" width="532" height="332" fill="none" stroke="' + c[0] + '" stroke-width="1.2"/>' + at(8, 8, 0, 1, cor()) + at(592, 8, 90, 1, cor()) + at(592, 392, 180, 1, cor()) + at(8, 392, 270, 1, cor()));
  } });
  add('polaroid', { name: 'Polaroid', cat: 'Frames', w: 300, h: 360, cols: ['#ffffff', '#e5e7eb'], svg: function (c) { return svg(300, 360, '<rect x="6" y="6" width="288" height="348" rx="6" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="3"/><rect x="26" y="26" width="248" height="248" fill="' + c[1] + '"/>'); } });

  // ---------- school & study ----------
  add('books', { name: 'Books', cat: 'School', w: 360, h: 300, cols: ['#f9a8c4', '#93c5fd', '#fcd34d', '#1f2937'], svg: function (c) { return svg(360, 300, '<rect x="40" y="225" width="280" height="50" rx="8" fill="' + c[0] + '" stroke="' + c[3] + '" stroke-width="5"/><rect x="60" y="235" width="240" height="8" fill="#fff" opacity=".7"/><rect x="60" y="170" width="250" height="55" rx="8" fill="' + c[1] + '" stroke="' + c[3] + '" stroke-width="5"/><rect x="80" y="182" width="210" height="8" fill="#fff" opacity=".7"/><rect x="50" y="120" width="230" height="50" rx="8" fill="' + c[2] + '" stroke="' + c[3] + '" stroke-width="5"/><path d="M215 120 L215 160 L230 150 L245 160 L245 120" fill="' + c[0] + '" stroke="' + c[3] + '" stroke-width="4"/><path d="M250 115 C 255 60 300 40 330 40 C 320 80 290 110 250 115Z" fill="#86efac" stroke="' + c[3] + '" stroke-width="4"/>'); } });
  add('pencil', { name: 'Pencil', cat: 'School', w: 500, h: 110, cols: ['#fcd34d', '#f9a8c4', '#1f2937'], svg: function (c) { return svg(500, 110, '<rect x="70" y="25" width="330" height="60" fill="' + c[0] + '" stroke="' + c[2] + '" stroke-width="5"/><rect x="70" y="45" width="330" height="20" fill="#fff" opacity=".35"/><rect x="20" y="25" width="50" height="60" rx="10" fill="' + c[1] + '" stroke="' + c[2] + '" stroke-width="5"/><rect x="62" y="25" width="16" height="60" fill="#cbd5e1" stroke="' + c[2] + '" stroke-width="5"/><path d="M400 25 L480 55 L400 85Z" fill="#f5d0a9" stroke="' + c[2] + '" stroke-width="5" stroke-linejoin="round"/><path d="M455 45 L480 55 L455 65Z" fill="' + c[2] + '"/>'); } });
  add('globe', { name: 'Globe', cat: 'School', w: 300, h: 340, cols: ['#93c5fd', '#86efac', '#1f2937'], svg: function (c) { return svg(300, 340, '<circle cx="150" cy="140" r="115" fill="' + c[0] + '" stroke="' + c[2] + '" stroke-width="6"/><path d="M80 80 C 110 70 130 100 115 125 C 100 150 120 175 95 195 C 70 170 60 120 80 80Z M170 60 C 210 60 240 90 230 120 C 210 130 190 110 175 125 C 160 105 150 75 170 60Z M190 170 C 220 160 240 180 225 215 C 205 230 185 205 190 170Z" fill="' + c[1] + '" stroke="' + c[2] + '" stroke-width="4"/><path d="M28 140 A122 122 0 0 0 272 140" fill="none" stroke="' + c[2] + '" stroke-width="7"/><path d="M150 262 L150 300 M100 310 L200 310" stroke="' + c[2] + '" stroke-width="10" stroke-linecap="round"/>'); } });
  add('flask', { name: 'Science flask', cat: 'School', w: 280, h: 340, cols: ['#a7f3d0', '#c4b5fd', '#1f2937'], svg: function (c) { return svg(280, 340, '<path d="M110 30 L110 130 L40 280 C 30 305 45 320 70 320 L210 320 C 235 320 250 305 240 280 L170 130 L170 30Z" fill="#ffffff" stroke="' + c[2] + '" stroke-width="7" stroke-linejoin="round"/><path d="M75 210 L205 210 L240 285 C 246 300 238 312 215 312 L65 312 C 42 312 34 300 40 285Z" fill="' + c[0] + '"/><circle cx="110" cy="260" r="14" fill="#fff" opacity=".8"/><circle cx="160" cy="235" r="9" fill="#fff" opacity=".8"/><rect x="95" y="18" width="90" height="20" rx="8" fill="' + c[1] + '" stroke="' + c[2] + '" stroke-width="6"/><circle cx="200" cy="80" r="10" fill="' + c[1] + '"/><circle cx="225" cy="45" r="7" fill="' + c[0] + '"/>'); } });
  add('bulb', { name: 'Idea bulb', cat: 'School', w: 260, h: 340, cols: ['#fde68a', '#1f2937'], svg: function (c) { var r = ''; for (var i = 0; i < 7; i++) { var a = (-160 + i * 23.3) * Math.PI / 180; r += '<path d="M' + n(130 + Math.cos(a) * 115) + ' ' + n(130 + Math.sin(a) * 115) + ' L' + n(130 + Math.cos(a) * 92) + ' ' + n(130 + Math.sin(a) * 92) + '" stroke="' + c[0] + '" stroke-width="8" stroke-linecap="round"/>'; } return svg(260, 340, r + '<path d="M130 50 C 70 50 45 100 55 140 C 62 175 95 190 95 230 L165 230 C 165 190 198 175 205 140 C 215 100 190 50 130 50Z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="7"/><rect x="95" y="240" width="70" height="20" rx="6" fill="#cbd5e1" stroke="' + c[1] + '" stroke-width="6"/><rect x="100" y="265" width="60" height="20" rx="6" fill="#cbd5e1" stroke="' + c[1] + '" stroke-width="6"/><path d="M110 160 L130 130 L150 160" fill="none" stroke="' + c[1] + '" stroke-width="5"/>'); } });
  add('gradcap', { name: 'Graduation cap', cat: 'School', w: 340, h: 260, cols: ['#1f2937', '#fbbf24'], svg: function (c) { return svg(340, 260, '<path d="M170 30 L330 95 L170 160 L10 95Z" fill="' + c[0] + '"/><path d="M80 125 L80 190 C 120 225 220 225 260 190 L260 125 L170 162Z" fill="' + c[0] + '"/><path d="M170 95 L290 120 L290 200" stroke="' + c[1] + '" stroke-width="6" fill="none"/><circle cx="290" cy="210" r="14" fill="' + c[1] + '"/>'); } });
  add('atom', { name: 'Atom', cat: 'School', w: 300, h: 300, cols: ['#60a5fa', '#f472b6'], svg: function (c) { return svg(300, 300, ['0', '60', '120'].map(function (a) { return '<ellipse cx="150" cy="150" rx="130" ry="46" fill="none" stroke="' + c[0] + '" stroke-width="9" transform="rotate(' + a + ' 150 150)"/>'; }).join('') + '<circle cx="150" cy="150" r="24" fill="' + c[1] + '"/>'); } });
  add('apple', { name: 'Apple', cat: 'School', w: 260, h: 280, cols: ['#f87171', '#4ade80'], svg: function (c) { return svg(260, 280, '<path d="M130 70 C 70 40 20 80 30 150 C 40 220 90 270 130 245 C 170 270 220 220 230 150 C 240 80 190 40 130 70Z" fill="' + c[0] + '"/><path d="M130 70 C 128 50 132 30 145 15" stroke="#7c4a2d" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M140 50 C 160 20 200 20 215 30 C 200 60 165 65 140 50Z" fill="' + c[1] + '"/><ellipse cx="80" cy="120" rx="16" ry="30" fill="#fff" opacity=".4" transform="rotate(20 80 120)"/>'); } });

  // ---------- Indian & wedding ----------
  add('diya', { name: 'Diya', cat: 'Wedding', w: 300, h: 260, cols: ['#f59e0b', '#b45309', '#fde047'], svg: function (c) { return svg(300, 260, '<path d="M150 30 C 175 70 175 110 150 125 C 125 110 125 70 150 30Z" fill="' + c[2] + '"/><path d="M150 65 C 160 85 160 105 150 115 C 140 105 140 85 150 65Z" fill="#fb923c"/><path d="M20 140 L280 140 C 270 210 210 240 150 240 C 90 240 30 210 20 140Z" fill="' + c[0] + '"/><path d="M20 140 L280 140" stroke="' + c[1] + '" stroke-width="10" stroke-linecap="round"/><path d="M60 175 Q150 200 240 175" stroke="' + c[1] + '" stroke-width="6" fill="none" stroke-dasharray="4 10" stroke-linecap="round"/>'); } });
  add('paisley', { name: 'Paisley', cat: 'Wedding', w: 260, h: 340, cols: ['#b91c1c', '#f59e0b'], svg: function (c) { return svg(260, 340, '<path d="M150 320 C 40 320 20 200 70 140 C 110 90 190 100 200 170 C 205 210 170 230 150 215 C 230 260 250 120 190 60 C 160 30 120 20 120 20 C 260 40 290 320 150 320Z" fill="' + c[0] + '"/><path d="M150 290 C 80 290 60 210 95 165 C 120 135 165 140 172 180" fill="none" stroke="' + c[1] + '" stroke-width="6"/><circle cx="130" cy="230" r="22" fill="' + c[1] + '"/><circle cx="130" cy="230" r="10" fill="' + c[0] + '"/>'); } });
  add('mandala', { name: 'Mandala', cat: 'Wedding', w: 400, h: 400, cols: ['#f59e0b', '#b91c1c'], svg: function (c) { var o = ''; [[16, 180, 60, 0], [12, 130, 44, 1], [8, 85, 30, 0]].forEach(function (r) { for (var i = 0; i < r[0]; i++) o += at(200, 200, i * 360 / r[0], 1, '<path d="' + petalPath(r[1], r[2] * 0.5) + '" fill="' + (r[3] ? c[1] : c[0]) + '" opacity=".9"/>'); }); return svg(400, 400, o + '<circle cx="200" cy="200" r="40" fill="' + c[1] + '"/><circle cx="200" cy="200" r="22" fill="' + c[0] + '"/>'); } });
  add('rings', { name: 'Wedding rings', cat: 'Wedding', w: 320, h: 220, cols: ['#d4a017', '#f5d76e'], svg: function (c) { return svg(320, 220, '<circle cx="120" cy="125" r="80" fill="none" stroke="' + c[0] + '" stroke-width="16"/><circle cx="200" cy="125" r="80" fill="none" stroke="' + c[1] + '" stroke-width="16"/><path d="M200 45 L215 20 L230 45 L215 60Z" fill="#bfdbfe" stroke="#93c5fd" stroke-width="3"/>'); } });
  add('toran', { name: 'Toran', cat: 'Wedding', w: 800, h: 180, cols: ['#f59e0b', '#16a34a', '#dc2626'], svg: function (c) { var o = '<path d="M0 20 Q 400 60 800 20" stroke="' + c[2] + '" stroke-width="8" fill="none"/>'; for (var i = 0; i < 16; i++) { var x = 25 + i * 50, y = 20 + Math.sin(i / 15 * Math.PI) * 40 * 0.5; o += at(x, y, 180, 1, leaf(70 + (i % 2) * 30, 18, i % 2 ? c[1] : mix(c[1], '#fff', 0.2))); if (i % 2 === 0) o += at(x + 25, y + 60, 0, 1, marigold(16, c[0], mix(c[0], c[2], 0.4))); } return svg(800, 180, o); } });

  // ---------- ID card parts ----------
  function ico(id, name, glyph) {   // round-square icon: c[0] tile, c[1] glyph
    add(id, { name: name, cat: 'Icons', w: 100, h: 100, cols: ['#e0edff', '#1d4ed8'], svg: function (c) { return svg(100, 100, '<rect x="2" y="2" width="96" height="96" rx="28" fill="' + c[0] + '"/>' + glyph.replace(/FG/g, c[1])); } });
  }
  ico('ic-phone', 'Phone icon', '<path d="M36 26c3-3 7-3 9 0l5 7c2 3 1 6-1 8l-4 3c3 7 8 12 15 15l3-4c2-2 5-3 8-1l7 5c3 2 3 6 0 9l-5 5c-4 4-11 4-18 1-12-6-22-16-28-28-3-7-3-14 1-18z" fill="FG"/>');
  ico('ic-drop', 'Blood icon', '<path d="M50 18c11 15 22 27 22 40a22 22 0 0 1-44 0c0-13 11-25 22-40z" fill="FG"/><path d="M40 60a10 10 0 0 0 10 10" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>');
  ico('ic-cake', 'Birthday icon', '<rect x="24" y="50" width="52" height="28" rx="6" fill="FG"/><path d="M24 60c6 5 11 5 17 0s11-5 17 0 12 5 18 0" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/><rect x="47" y="34" width="6" height="16" rx="2" fill="FG"/><path d="M50 20c4 5 4 9 0 11-4-2-4-6 0-11z" fill="#f59e0b"/>');
  ico('ic-user', 'Person icon', '<circle cx="50" cy="38" r="14" fill="FG"/><path d="M24 78c2-15 13-22 26-22s24 7 26 22z" fill="FG"/>');
  ico('ic-home', 'Address icon', '<path d="M50 22 20 48h8v28h16V60h12v16h16V48h8z" fill="FG"/>');
  ico('ic-id', 'ID icon', '<rect x="20" y="30" width="60" height="42" rx="7" fill="FG"/><circle cx="37" cy="47" r="7" fill="#fff"/><path d="M27 64c2-6 6-8 10-8s8 2 10 8z" fill="#fff"/><rect x="53" y="42" width="20" height="5" rx="2.5" fill="#fff"/><rect x="53" y="53" width="14" height="5" rx="2.5" fill="#fff" opacity=".7"/>');
  ico('ic-book', 'Class icon', '<path d="M20 30c10-4 20-4 30 2v44c-10-6-20-6-30-2z" fill="FG"/><path d="M80 30c-10-4-20-4-30 2v44c10-6 20-6 30-2z" fill="FG" opacity=".75"/>');
  ico('ic-cal', 'Date icon', '<rect x="22" y="28" width="56" height="48" rx="8" fill="FG"/><rect x="22" y="28" width="56" height="13" rx="6" fill="FG"/><rect x="28" y="46" width="44" height="24" rx="3" fill="#fff" opacity=".9"/><path d="M36 22v12M64 22v12" stroke="FG" stroke-width="6" stroke-linecap="round"/><rect x="33" y="51" width="8" height="6" rx="1.5" fill="FG"/><rect x="46" y="51" width="8" height="6" rx="1.5" fill="FG" opacity=".6"/>');
  ico('ic-mail', 'Mail icon', '<rect x="20" y="30" width="60" height="42" rx="7" fill="FG"/><path d="M22 34l28 20 28-20" stroke="#fff" stroke-width="5" fill="none" stroke-linejoin="round"/>');
  ico('ic-globe', 'Web icon', '<circle cx="50" cy="50" r="27" fill="FG"/><path d="M23 50h54M50 23c-10 10-10 44 0 54M50 23c10 10 10 44 0 54" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/>');
  ico('ic-alert', 'Emergency icon', '<path d="M50 20 82 76H18z" fill="FG"/><path d="M50 40v18M50 66v1" stroke="#fff" stroke-width="7" stroke-linecap="round"/>');
  add('guilloche', { name: 'Security pattern', cat: 'ID card', w: 600, h: 400, cols: ['#2563eb'], svg: function (c) {
    var o = '';
    for (var k = 0; k < 16; k++) { var d = 'M0 ' + (200 + Math.sin(k) * 10); for (var x = 0; x <= 600; x += 10) { var y = 200 + Math.sin(x / 38 + k * 0.42) * (60 + k * 6) * Math.cos(x / 170 + k * 0.2); d += ' L' + x + ' ' + n(y); } o += '<path d="' + d + '" fill="none" stroke="' + c[0] + '" stroke-width="1.1" opacity=".55"/>'; }
    return svg(600, 400, o);
  } });
  add('rosette', { name: 'Security rosette', cat: 'ID card', w: 300, h: 300, cols: ['#2563eb'], svg: function (c) {
    var o = ''; for (var k = 0; k < 36; k++) o += '<ellipse cx="150" cy="150" rx="140" ry="46" fill="none" stroke="' + c[0] + '" stroke-width=".9" opacity=".5" transform="rotate(' + k * 5 + ' 150 150)"/>';
    return svg(300, 300, o);
  } });
  add('holo', { name: 'Hologram', cat: 'ID card', w: 120, h: 120, cols: ['#ffffff'], svg: function () {
    return svg(120, 120, '<defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".25" stop-color="#a5f3fc"/><stop offset=".5" stop-color="#f0abfc"/><stop offset=".75" stop-color="#bbf7d0"/><stop offset="1" stop-color="#c7d2fe"/></linearGradient></defs><circle cx="60" cy="60" r="56" fill="url(#hg)"/><circle cx="60" cy="60" r="56" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>' + at(60, 60, 0, 1, sparkle(30, '#ffffff')) + '<circle cx="60" cy="60" r="44" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 4" opacity=".8"/>');
  } });
  add('chip', { name: 'Card chip', cat: 'ID card', w: 120, h: 90, cols: ['#e6c35c'], svg: function (c) {
    return svg(120, 90, '<defs>' + lg('cg', mix(c[0], '#ffffff', 0.45), mix(c[0], '#000000', 0.15), 1, 1) + '</defs><rect x="4" y="4" width="112" height="82" rx="14" fill="url(#cg)" stroke="' + mix(c[0], '#000', 0.3) + '" stroke-width="2"/><path d="M4 32h36v26H4M116 32H80v26h36M40 4v24h40V4M40 86V62h40v24M40 32h40v26H40z" fill="none" stroke="' + mix(c[0], '#000', 0.3) + '" stroke-width="2.4"/>');
  } });
  ART.CATS = ['Flowers', 'Leaves', 'Cute', 'Doodles', 'Shapes', 'Frames', 'School', 'Wedding', 'Icons', 'ID card'];
  var cache = {};
  ST.artURL = function (id, cols) {
    var a = ART[id]; if (!a) return '';
    var c = (cols && cols.length ? cols : a.cols), key = id + '|' + c.join(',');
    if (!cache[key]) cache[key] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(a.svg(c));
    return cache[key];
  };
})();
