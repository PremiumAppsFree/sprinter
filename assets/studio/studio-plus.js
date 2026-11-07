/* S Printer — Editing Tool S, part 2: more editor features.
 * Elements: 48 shapes, lines & arrows, photo grids (collages), device mockups, pattern backgrounds, emoji.
 * Styles: one-click colour palettes and font sets for the whole design, change-a-colour-everywhere.
 * Apps: calendar maker, smart QR codes (link, WhatsApp, Wi-Fi, phone, e-mail, UPI), find & replace,
 * page manager, rulers / grid / safe-area guides, keyboard shortcuts. Multi-select: align & space evenly.
 * Original code and designs by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, F = window.fabric, Pro = ST && ST.Pro;
  if (!Pro) return;
  var S = null, cv = null;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  var svg = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
  var IC = {
    styles: svg('<circle cx="12" cy="12" r="9"/><circle cx="8" cy="9.5" r="1.4"/><circle cx="12.5" cy="7.5" r="1.4"/><circle cx="16" cy="11" r="1.4"/><path d="M12 21c-1.5 0-2-1-2-2s1-1.6 2-1.6h1.4c1.6 0 2.6-1 2.6-2.4"/>'),
    apps: svg('<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><path d="M17 13.5v7M13.5 17h7"/>')
  };
  function W() { return S.doc.w; } function H() { return S.doc.h; } function SM() { return Math.min(W(), H()); }
  function brandCol(i) { var b = store('sx-brand') || {}; return (b.colors && b.colors[i]) || null; }

  // =====================================================================
  //  SHAPES — every shape is a path in a 100 × 100 box
  // =====================================================================
  function poly(n, rot, r2) { var p = [], k; for (k = 0; k < n * (r2 ? 2 : 1); k++) { var a = (rot || -90) * Math.PI / 180 + Math.PI * 2 * k / (n * (r2 ? 2 : 1)), r = r2 && k % 2 ? r2 : 50; p.push((50 + Math.cos(a) * r).toFixed(2) + ' ' + (50 + Math.sin(a) * r).toFixed(2)); } return 'M' + p.join('L') + 'Z'; }
  function wavy(n, amp) { var p = [], k; for (k = 0; k <= 180; k++) { var a = Math.PI * 2 * k / 180, r = 50 - amp + amp * Math.cos(a * n); p.push((50 + Math.cos(a) * r).toFixed(2) + ' ' + (50 + Math.sin(a) * r).toFixed(2)); } return 'M' + p.join('L') + 'Z'; }
  function ring(cx, cy, r) { return 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0Z'; }
  var SHAPES = [
    ['Square', 'M0 0H100V100H0Z'], ['Rounded square', 'M16 0H84Q100 0 100 16V84Q100 100 84 100H16Q0 100 0 84V16Q0 0 16 0Z'], ['Circle', ring(50, 50, 50)], ['Triangle', 'M50 0L100 100H0Z'],
    ['Right triangle', 'M0 0L100 100H0Z'], ['Diamond', 'M50 0L100 50L50 100L0 50Z'], ['Pentagon', poly(5)], ['Hexagon', poly(6, 0)],
    ['Octagon', poly(8, 22.5)], ['Parallelogram', 'M28 0H100L72 100H0Z'], ['Trapezoid', 'M22 0H78L100 100H0Z'], ['Star', poly(5, -90, 21)],
    ['Star 6', poly(6, -90, 28)], ['Star 8', poly(8, -90, 32)], ['Seal', poly(16, -90, 40)], ['Burst', poly(24, -90, 36)],
    ['Sparkle', 'M50 0C54 36 64 46 100 50C64 54 54 64 50 100C46 64 36 54 0 50C36 46 46 36 50 0Z'], ['Heart', 'M50 92C20 70 0 52 0 30C0 12 14 0 29 0C39 0 46 5 50 12C54 5 61 0 71 0C86 0 100 12 100 30C100 52 80 70 50 92Z'], ['Plus', 'M35 0H65V35H100V65H65V100H35V65H0V35H35Z'], ['Cross', 'M20 0L50 30L80 0L100 20L70 50L100 80L80 100L50 70L20 100L0 80L30 50L0 20Z'],
    ['Cloud', 'M25 85C10 85 0 74 0 61C0 48 10 38 23 38C24 22 37 10 53 10C67 10 78 19 82 32C93 34 100 44 100 56C100 72 88 85 72 85Z'], ['Speech bubble', 'M50 0C78 0 100 18 100 40C100 62 78 80 50 80C44 80 38 79 33 77L12 95L18 72C7 64 0 53 0 40C0 18 22 0 50 0Z'], ['Chat box', 'M10 0H90Q100 0 100 10V65Q100 75 90 75H42L20 96L23 75H10Q0 75 0 65V10Q0 0 10 0Z'], ['Thought bubble', 'M28 68C14 68 4 59 4 47C4 36 12 28 23 27C25 13 37 4 51 4C63 4 73 11 77 22C89 23 98 32 98 44C98 57 88 68 74 68Z' + ring(22, 82, 7) + ring(9, 95, 4)],
    ['Arrow right', 'M0 30H58V4L100 50L58 96V70H0Z'], ['Arrow left', 'M100 30H42V4L0 50L42 96V70H100Z'], ['Arrow up', 'M30 100V42H4L50 0L96 42H70V100Z'], ['Double arrow', 'M0 50L30 12V34H70V12L100 50L70 88V66H30V88Z'],
    ['Chevron', 'M0 0H70L100 50L70 100H0L30 50Z'], ['Ribbon', 'M0 22H100L86 50L100 78H0L14 50Z'], ['Banner', 'M0 0H100V100L50 80L0 100Z'], ['Tag', 'M0 0H68L100 50L68 100H0Z' + ring(74, 50, 7)],
    ['Shield', 'M50 0L100 15V45C100 75 78 93 50 100C22 93 0 75 0 45V15Z'], ['Moon', 'M60 0C30 5 10 30 10 55C10 82 33 100 60 100C75 100 88 94 96 85C88 88 80 90 72 90C45 90 25 70 25 45C25 25 38 8 60 0Z'], ['Drop', 'M50 0C50 0 90 45 90 68C90 88 72 100 50 100C28 100 10 88 10 68C10 45 50 0 50 0Z'], ['Leaf', 'M0 100C0 40 40 0 100 0C100 60 60 100 0 100Z'],
    ['Lightning', 'M60 0L10 58H45L35 100L90 38H55Z'], ['Location pin', 'M50 0C28 0 12 17 12 38C12 66 50 100 50 100C50 100 88 66 88 38C88 17 72 0 50 0Z' + ring(50, 38, 15)], ['Blob', 'M48 4C66 0 86 10 94 28C102 46 96 64 84 78C72 92 54 100 36 94C18 88 4 72 2 54C0 36 10 18 24 10C32 6 40 6 48 4Z'], ['Blob 2', 'M30 6C46 -2 70 4 84 16C98 28 100 50 92 66C84 82 68 96 48 98C28 100 8 88 3 70C-2 52 6 36 14 24C18 16 22 10 30 6Z'],
    ['Blob 3', 'M58 2C78 6 96 22 98 44C100 62 90 76 80 86C68 98 46 100 30 92C14 84 2 66 2 48C2 28 14 12 30 6C38 2 48 0 58 2Z'], ['Flower', wavy(8, 9)], ['Scallop', wavy(16, 4)], ['Half circle', 'M0 100A50 50 0 0 1 100 100Z'],
    ['Quarter circle', 'M0 0A100 100 0 0 1 100 100H0Z'], ['Arch', 'M0 100V50A50 50 0 0 1 100 50V100Z'], ['Ring', ring(50, 50, 50) + ring(50, 50, 30)], ['Frame', 'M0 0H100V100H0Z M12 12V88H88V12Z'],
    ['Ticket', 'M0 0H100V35A15 15 0 0 0 100 65V100H0V65A15 15 0 0 0 0 35Z'], ['Check mark', 'M8 52L22 38L40 56L80 14L94 28L40 84Z'], ['Cylinder', 'M0 14C0 6 22 0 50 0C78 0 100 6 100 14V86C100 94 78 100 50 100C22 100 0 94 0 86Z'], ['Cube', 'M50 0L100 25V75L50 100L0 75V25Z']
  ];
  var SH_COLS = ['#0098D8', '#D6247A', '#F5C400', '#16a34a', '#7c3aed', '#ea580c'];
  var shapeN = 0;
  function addShape(i) {
    var d = SHAPES[i][1], s = SM() * 0.3, col = brandCol(shapeN % 3) || SH_COLS[shapeN % SH_COLS.length]; shapeN++;
    var p = new F.Path(d, { fill: col, fillRule: 'evenodd', strokeUniform: true });
    var k = s / Math.max(p.width, p.height);
    p.set({ scaleX: k, scaleY: k, left: (W() - p.width * k) / 2, top: (H() - p.height * k) / 2 }); p.nm = SHAPES[i][0];
    S.addObj(p); S.showProps();
  }

  // =====================================================================
  //  LINES & ARROWS
  // =====================================================================
  var LINES = [['Line', 'line'], ['Thick line', 'thick'], ['Dashed', 'dash'], ['Dotted', 'dot'], ['Arrow', 'arrow'], ['Both ends', 'both'], ['Open arrow', 'open'], ['Dot ends', 'dots'], ['Curved arrow', 'curve'], ['Elbow arrow', 'elbow'], ['Wavy line', 'wave'], ['Double line', 'double']];
  function lineIcon(k) {
    var m = { line: '<path d="M3 12h18"/>', thick: '<path d="M3 12h18" stroke-width="4"/>', dash: '<path d="M3 12h18" stroke-dasharray="4 3"/>', dot: '<path d="M3 12h18" stroke-dasharray="0.1 3.6"/>', arrow: '<path d="M3 12h16"/><path d="M15 7l5 5-5 5" fill="currentColor"/>', both: '<path d="M5 12h14"/><path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>', open: '<path d="M3 12h17M14 6l6 6-6 6"/>', dots: '<path d="M6 12h12"/><circle cx="4.5" cy="12" r="2" fill="currentColor"/><circle cx="19.5" cy="12" r="2" fill="currentColor"/>', curve: '<path d="M3 17Q12 2 20 14"/><path d="M16 13l4 1.5 1-4.5"/>', elbow: '<path d="M3 6h9v12h8"/><path d="M17 15l3 3-3 3"/>', wave: '<path d="M2 12q2.5-5 5 0t5 0 5 0 5 0"/>', double: '<path d="M3 9.5h18M3 14.5h18"/>' };
    return svg(m[k]);
  }
  function head(x, y, ang, sz, col, open) {
    if (open) return new F.Polyline([{ x: -sz, y: -sz }, { x: 0, y: 0 }, { x: -sz, y: sz }], { left: x, top: y, originX: 'right', originY: 'center', angle: ang, fill: '', stroke: col, strokeWidth: sz / 2.6, strokeLineCap: 'round', strokeLineJoin: 'round' });
    return new F.Triangle({ left: x, top: y, width: sz * 2, height: sz * 2, angle: ang + 90, originX: 'center', originY: 'center', fill: col });
  }
  function addLine(k) {
    var s = SM(), L = s * 0.45, sw = Math.max(3, s / 150), col = '#1B2330', x0 = (W() - L) / 2, y0 = H() / 2, o, parts;
    var base = { stroke: col, strokeWidth: sw, strokeLineCap: 'round', fill: '' };
    if (k === 'line' || k === 'thick' || k === 'dash' || k === 'dot') {
      o = new F.Line([x0, y0, x0 + L, y0], Object.assign({}, base, { strokeWidth: k === 'thick' ? sw * 3 : sw, strokeDashArray: k === 'dash' ? [sw * 4, sw * 3] : k === 'dot' ? [0.1, sw * 2.6] : null }));
      o.nm = k === 'dot' ? 'Dotted line' : k === 'dash' ? 'Dashed line' : 'Line';
    } else if (k === 'double') {
      o = new F.Group([new F.Line([0, 0, L, 0], base), new F.Line([0, sw * 3, L, sw * 3], base)], { left: x0, top: y0 }); o.nm = 'Double line';
    } else if (k === 'wave') {
      var d = 'M0 0', n = 8, st = L / n; for (var i = 0; i < n; i++) d += ' q' + st / 2 + ' ' + (i % 2 ? st * 0.6 : -st * 0.6) + ' ' + st + ' 0';
      o = new F.Path(d, Object.assign({}, base, { left: x0, top: y0 })); o.nm = 'Wavy line';
    } else {
      var hs = sw * 2.4; parts = [];
      if (k === 'curve') {
        parts.push(new F.Path('M0 ' + L * 0.3 + ' Q' + L / 2 + ' ' + -L * 0.15 + ' ' + L + ' ' + L * 0.3, base));
        parts.push(head(L, L * 0.3, Math.atan2(L * 0.45, L / 2) * 180 / Math.PI, hs, col, true));
      } else if (k === 'elbow') {
        parts.push(new F.Polyline([{ x: 0, y: 0 }, { x: L * 0.5, y: 0 }, { x: L * 0.5, y: L * 0.35 }, { x: L, y: L * 0.35 }], Object.assign({}, base, { strokeLineJoin: 'round' })));
        parts.push(head(L, L * 0.35, 0, hs, col, false));
      } else {
        parts.push(new F.Line([k === 'both' ? hs * 1.6 : k === 'dots' ? hs : 0, 0, k === 'open' || k === 'dots' ? L - (k === 'dots' ? hs : 0) : L - hs * 1.6, 0], base));
        if (k === 'dots') parts.push(new F.Circle({ left: 0, top: 0, radius: hs, originX: 'center', originY: 'center', fill: col }), new F.Circle({ left: L, top: 0, radius: hs, originX: 'center', originY: 'center', fill: col }));
        else { parts.push(head(L - (k === 'open' ? 0 : hs), 0, 0, hs, col, k === 'open')); if (k === 'both') parts.push(head(hs, 0, 180, hs, col, false)); }
      }
      o = new F.Group(parts, { left: x0, top: y0 - L * 0.1 }); o.nm = 'Arrow';
    }
    S.addObj(o); S.showProps();
  }

  // =====================================================================
  //  PHOTO GRIDS (collages)
  // =====================================================================
  var T3 = 1 / 3;
  var GRIDS = [
    [[0, 0, 1, 1]], [[0, 0, .5, 1], [.5, 0, .5, 1]], [[0, 0, 1, .5], [0, .5, 1, .5]], [[0, 0, T3, 1], [T3, 0, T3, 1], [2 * T3, 0, T3, 1]],
    [[0, 0, 1, T3], [0, T3, 1, T3], [0, 2 * T3, 1, T3]], [[0, 0, .5, 1], [.5, 0, .5, .5], [.5, .5, .5, .5]], [[0, 0, .5, .5], [0, .5, .5, .5], [.5, 0, .5, 1]], [[0, 0, 1, .5], [0, .5, .5, .5], [.5, .5, .5, .5]],
    [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]], [[0, 0, 1, .6], [0, .6, T3, .4], [T3, .6, T3, .4], [2 * T3, .6, T3, .4]], [[0, 0, .6, 1], [.6, 0, .4, T3], [.6, T3, .4, T3], [.6, 2 * T3, .4, T3]], [[0, 0, .6, .6], [.6, 0, .4, .3], [.6, .3, .4, .3], [0, .6, .3, .4], [.3, .6, .3, .4], [.6, .6, .4, .4]],
    [[0, 0, .5, T3], [.5, 0, .5, T3], [0, T3, .5, T3], [.5, T3, .5, T3], [0, 2 * T3, .5, T3], [.5, 2 * T3, .5, T3]], [[0, 0, T3, .5], [T3, 0, T3, .5], [2 * T3, 0, T3, .5], [0, .5, T3, .5], [T3, .5, T3, .5], [2 * T3, .5, T3, .5]],
    (function () { var g = []; for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) g.push([c * T3, r * T3, T3, T3]); return g; })(), [[0, 0, .25, 1], [.25, 0, .25, 1], [.5, 0, .25, 1], [.75, 0, .25, 1]]
  ];
  function gridIcon(g) { return '<svg viewBox="-2 -2 104 104">' + g.map(function (c) { return '<rect x="' + (c[0] * 100 + 2) + '" y="' + (c[1] * 100 + 2) + '" width="' + Math.max(1, c[2] * 100 - 4) + '" height="' + Math.max(1, c[3] * 100 - 4) + '" rx="3" fill="#E4E9EF" stroke="#9AA6B4" stroke-width="2"/>'; }).join('') + '</svg>'; }
  function addGrid(i, gapOn) {
    var g = GRIDS[i], w = W(), h = H(), gp = gapOn ? SM() * 0.015 : 0, made = [];
    g.forEach(function (c) {
      var o = ST.mkObj({ t: 'photo', x: c[0] * (w - gp) + gp, y: c[1] * (h - gp) + gp, w: c[2] * (w - gp) - gp, h: c[3] * (h - gp) - gp, ph: 'PHOTO', nm: 'Grid photo' }, w, h);
      made.push(o);
    });
    selectMany(made, 'Grid added — tap a box to put your photo in it.');
  }
  function selectMany(made, msg) {
    S.muted(1); made.forEach(function (x) { cv.add(x); }); S.muted(-1);
    if (made.length > 1) cv.setActiveObject(new F.ActiveSelection(made, { canvas: cv })); else if (made[0]) cv.setActiveObject(made[0]);
    cv.requestRenderAll(); S.record(); if (msg) S.toast(msg); if (S.mobile()) S.panel.hidden = true; S.showProps();
  }

  // =====================================================================
  //  MOCKUPS (simple device frames drawn by S Printer)
  // =====================================================================
  // each: [box w, box h, items]; items in box units: [kind, x, y, w, h, fill, radius]
  var MOCK = {
    Phone: [50, 100, [['r', 0, 0, 50, 100, '#111827', 8], ['r', 1.2, 1.2, 47.6, 97.6, '#1f2937', 7], ['p', 3, 3, 44, 94, '', 5.5], ['r', 18, 4.2, 14, 2.6, '#111827', 1.3]]],
    Tablet: [76, 100, [['r', 0, 0, 76, 100, '#1f2937', 6], ['p', 4, 4, 68, 92, '', 2], ['c', 38, 2, .8, 0, '#374151']]],
    Laptop: [120, 76, [['r', 10, 0, 100, 66, '#1f2937', 4], ['p', 14, 4, 92, 58, '', 1], ['r', 0, 66, 120, 6, '#cbd5e1', 2], ['r', 0, 70.5, 120, 3, '#94a3b8', 1.5], ['r', 50, 66, 20, 2.2, '#94a3b8', 1]]],
    Monitor: [120, 100, [['r', 0, 0, 120, 74, '#111827', 4], ['p', 3.5, 3.5, 113, 63, '', 1], ['r', 52, 74, 16, 16, '#9ca3af', 0], ['r', 36, 88, 48, 6, '#6b7280', 3]]],
    Browser: [120, 80, [['r', 0, 0, 120, 80, '#ffffff', 3, 1], ['r', 0, 0, 120, 9, '#e5e7eb', 3], ['c', 5, 4.5, 1.6, 0, '#ef4444'], ['c', 10, 4.5, 1.6, 0, '#f59e0b'], ['c', 15, 4.5, 1.6, 0, '#22c55e'], ['r', 22, 2.2, 76, 4.6, '#ffffff', 2.3], ['p', 0, 9, 120, 71, '', 0]]],
    Polaroid: [80, 96, [['r', 0, 0, 80, 96, '#ffffff', 1, 1], ['p', 5, 5, 70, 70, '', 0], ['t', 0, 80, 80, 8, 'Memories', 'Caveat']]],
    'Framed poster': [80, 104, [['r', 0, 0, 80, 104, '#3f2a1d', 0, 1], ['r', 3, 3, 74, 98, '#ffffff', 0], ['p', 11, 11, 58, 82, '', 0]]],
    'Photo card': [100, 70, [['r', 0, 0, 100, 70, '#ffffff', 5, 1], ['p', 4, 4, 92, 46, '', 3], ['t', 4, 53, 92, 6, 'Your title here', 'Poppins'], ['t', 4, 61, 92, 4, 'A short line of text', 'Poppins', 1]]]
  };
  function mockIcon(k) {
    var m = MOCK[k], s = 100 / Math.max(m[0], m[1]), ox = (100 - m[0] * s) / 2, oy = (100 - m[1] * s) / 2;
    return '<svg viewBox="-2 -2 104 104">' + m[2].map(function (it) {
      var x = ox + it[1] * s, y = oy + it[2] * s;
      if (it[0] === 'c') return '<circle cx="' + x + '" cy="' + y + '" r="' + it[3] * s + '" fill="' + it[5] + '"/>';
      if (it[0] === 't') return '<rect x="' + (x + it[3] * s * .2) + '" y="' + y + '" width="' + it[3] * s * .6 + '" height="' + it[4] * s * .5 + '" rx="1" fill="#9AA6B4"/>';
      return '<rect x="' + x + '" y="' + y + '" width="' + it[3] * s + '" height="' + it[4] * s + '" rx="' + (it[6] || 0) * s + '" fill="' + (it[0] === 'p' ? '#E4E9EF' : it[5]) + '"' + (it[0] === 'p' ? ' stroke="#9AA6B4" stroke-dasharray="3 2"' : it[7] ? ' stroke="#d1d5db"' : '') + '/>';
    }).join('') + '</svg>';
  }
  function addMock(k) {
    var m = MOCK[k], w = W(), h = H(), s = Math.min(w * 0.8 / m[0], h * 0.75 / m[1]), ox = (w - m[0] * s) / 2, oy = (h - m[1] * s) / 2, made = [];
    m[2].forEach(function (it) {
      var x = ox + it[1] * s, y = oy + it[2] * s, o;
      if (it[0] === 'r') o = ST.mkObj({ t: 'rect', x: x, y: y, w: it[3] * s, h: it[4] * s, fill: it[5], r: (it[6] || 0) * s, shadow: it[7] ? { y: s * 1.2, b: s * 3, c: 'rgba(15,23,42,.22)' } : null, nm: k + ' frame' }, w, h);
      else if (it[0] === 'c') o = ST.mkObj({ t: 'circle', x: x - it[3] * s, y: y - it[3] * s, rr: it[3] * s, fill: it[5], nm: k + ' frame' }, w, h);
      else if (it[0] === 't') { o = ST.mkObj({ t: 'text', x: x, y: y, w: it[3] * s, text: it[5], size: it[4] * s * (it[7] ? 0.9 : 0.85), font: it[6], color: it[7] ? '#64748b' : '#1B2330', bold: it[7] ? 400 : 700, align: it[6] === 'Caveat' ? 'center' : 'left' }, w, h); S.needFont(it[6]); }
      else o = ST.mkObj({ t: 'photo', x: x, y: y, w: it[3] * s, h: it[4] * s, r: (it[6] || 0) * s, ph: 'PHOTO', nm: k + ' screen' }, w, h);
      made.push(o);
    });
    var txt = made.filter(function (o) { return o.type === 'textbox'; });
    (txt.length ? S.fontsFor(txt) : Promise.resolve()).then(function () { txt.forEach(function (t) { t.initDimensions(); }); selectMany(made, k + ' mockup added — tap the screen to add your picture.'); });
  }

  // =====================================================================
  //  PATTERN BACKGROUNDS
  // =====================================================================
  var PATS = {
    Dots: function (t, c) { return '<circle cx="' + t / 2 + '" cy="' + t / 2 + '" r="' + t * .12 + '" fill="' + c + '"/>'; },
    'Big dots': function (t, c) { return '<circle cx="' + t / 4 + '" cy="' + t / 4 + '" r="' + t * .14 + '" fill="' + c + '"/><circle cx="' + t * .75 + '" cy="' + t * .75 + '" r="' + t * .14 + '" fill="' + c + '"/>'; },
    Grid: function (t, c) { return '<path d="M' + t + ' 0V' + t + 'H0" fill="none" stroke="' + c + '" stroke-width="' + t * .04 + '"/>'; },
    Stripes: function (t, c) { return '<rect width="' + t + '" height="' + t / 2 + '" fill="' + c + '"/>'; },
    Diagonal: function (t, c) { return '<path d="M0 ' + t + 'L' + t + ' 0M' + -t / 2 + ' ' + t / 2 + 'L' + t / 2 + ' ' + -t / 2 + 'M' + t / 2 + ' ' + t * 1.5 + 'L' + t * 1.5 + ' ' + t / 2 + '" stroke="' + c + '" stroke-width="' + t * .18 + '"/>'; },
    Checks: function (t, c) { return '<rect width="' + t / 2 + '" height="' + t / 2 + '" fill="' + c + '"/><rect x="' + t / 2 + '" y="' + t / 2 + '" width="' + t / 2 + '" height="' + t / 2 + '" fill="' + c + '"/>'; },
    Waves: function (t, c) { return '<path d="M0 ' + t / 2 + 'Q' + t / 4 + ' ' + t * .2 + ' ' + t / 2 + ' ' + t / 2 + 'T' + t + ' ' + t / 2 + '" fill="none" stroke="' + c + '" stroke-width="' + t * .07 + '"/>'; },
    Zigzag: function (t, c) { return '<path d="M0 ' + t * .65 + 'L' + t / 2 + ' ' + t * .35 + 'L' + t + ' ' + t * .65 + '" fill="none" stroke="' + c + '" stroke-width="' + t * .08 + '"/>'; },
    Plus: function (t, c) { return '<path d="M' + t / 2 + ' ' + t * .3 + 'V' + t * .7 + 'M' + t * .3 + ' ' + t / 2 + 'H' + t * .7 + '" stroke="' + c + '" stroke-width="' + t * .07 + '" stroke-linecap="round"/>'; },
    Rings: function (t, c) { return '<circle cx="' + t / 2 + '" cy="' + t / 2 + '" r="' + t * .3 + '" fill="none" stroke="' + c + '" stroke-width="' + t * .06 + '"/>'; },
    Triangles: function (t, c) { return '<path d="M' + t / 2 + ' ' + t * .2 + 'L' + t * .8 + ' ' + t * .75 + 'H' + t * .2 + 'Z" fill="' + c + '"/>'; },
    Hearts: function (t, c) { var k = t / 100 * .5, o = t * .25; return '<path transform="translate(' + o + ' ' + o + ') scale(' + k + ')" d="M50 92C20 70 0 52 0 30C0 12 14 0 29 0C39 0 46 5 50 12C54 5 61 0 71 0C86 0 100 12 100 30C100 52 80 70 50 92Z" fill="' + c + '"/>'; },
    Stars: function (t, c) { var k = t / 100 * .45, o = t * .27; return '<path transform="translate(' + o + ' ' + o + ') scale(' + k + ')" d="' + poly(5, -90, 21) + '" fill="' + c + '"/>'; },
    Bricks: function (t, c) { return '<path d="M0 0H' + t + 'M0 ' + t / 2 + 'H' + t + 'M' + t / 2 + ' 0V' + t / 2 + 'M0 ' + t / 2 + 'V' + t + '" stroke="' + c + '" stroke-width="' + t * .05 + '" fill="none"/>'; },
    Confetti: function (t, c, c2) { return '<rect x="' + t * .1 + '" y="' + t * .15 + '" width="' + t * .18 + '" height="' + t * .06 + '" rx="' + t * .03 + '" transform="rotate(30 ' + t * .2 + ' ' + t * .18 + ')" fill="' + c + '"/><circle cx="' + t * .7 + '" cy="' + t * .3 + '" r="' + t * .05 + '" fill="' + c2 + '"/><rect x="' + t * .55 + '" y="' + t * .7 + '" width="' + t * .16 + '" height="' + t * .06 + '" rx="' + t * .03 + '" transform="rotate(-40 ' + t * .63 + ' ' + t * .73 + ')" fill="' + c2 + '"/><path d="M' + t * .2 + ' ' + t * .7 + 'l' + t * .06 + ' ' + -t * .1 + 'l' + t * .06 + ' ' + t * .1 + 'z" fill="' + c + '"/>'; },
    Memphis: function (t, c, c2) { return '<path d="M' + t * .1 + ' ' + t * .25 + 'q' + t * .07 + ' ' + -t * .1 + ' ' + t * .14 + ' 0t' + t * .14 + ' 0t' + t * .14 + ' 0" fill="none" stroke="' + c + '" stroke-width="' + t * .04 + '" stroke-linecap="round"/><circle cx="' + t * .75 + '" cy="' + t * .7 + '" r="' + t * .09 + '" fill="none" stroke="' + c2 + '" stroke-width="' + t * .04 + '"/><path d="M' + t * .2 + ' ' + t * .8 + 'l' + t * .1 + ' ' + -t * .16 + 'l' + t * .1 + ' ' + t * .16 + 'z" fill="' + c2 + '"/><circle cx="' + t * .78 + '" cy="' + t * .2 + '" r="' + t * .035 + '" fill="' + c + '"/>'; }
  };
  var patState = store('sx-pat') || { bg: '#fdf2f8', fg: '#f9a8d4', fg2: '#a78bfa', size: 1 };
  function patternSVG(k, w, h, t) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><defs><pattern id="p" width="' + t + '" height="' + t + '" patternUnits="userSpaceOnUse">' + PATS[k](t, patState.fg, patState.fg2) + '</pattern></defs><rect width="100%" height="100%" fill="' + patState.bg + '"/><rect width="100%" height="100%" fill="url(#p)"/></svg>';
  }
  function addPattern(k) {
    var w = W(), h = H(), t = SM() / 12 * patState.size, url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(patternSVG(k, w, h, t));
    S.busy(true, 'Adding pattern…');
    var im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h);
      var png; try { png = c.toDataURL('image/png'); } catch (e) { png = url; }
      F.Image.fromURL(png, function (img) {
        S.busy(false); img.set({ left: 0, top: 0, scaleX: w / img.width, scaleY: h / img.height }); img.nm = k + ' pattern';
        var objs = cv.getObjects(), idx = 0, b0 = objs[0] && objs[0].getBoundingRect(true, true);
        if (b0 && b0.width >= w * 0.98 && b0.height >= h * 0.98 && objs[0].type !== 'image') idx = 1;
        S.muted(1); cv.insertAt(img, idx); S.muted(-1); cv.setActiveObject(img); cv.requestRenderAll(); S.record(); S.showProps();
        S.toast('Pattern added behind your design. Change its transparency from Position.'); if (S.mobile()) S.panel.hidden = true;
      });
    };
    im.onerror = function () { S.busy(false); S.toast('Could not make this pattern.'); };
    im.src = url;
  }
  function patIcon(k) { return '<img alt="" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(patternSVG(k, 120, 120, 30)) + '">'; }

  // =====================================================================
  //  EMOJI (open-source Noto emoji, via the same free icon service)
  // =====================================================================
  var EMOJI = ['grinning-face', 'face-with-tears-of-joy', 'smiling-face-with-heart-eyes', 'star-struck', 'smiling-face-with-sunglasses', 'winking-face', 'thinking-face', 'partying-face', 'red-heart', 'sparkling-heart', 'thumbs-up', 'clapping-hands', 'folded-hands', 'handshake', 'fire', 'sparkles', 'hundred-points', 'party-popper', 'confetti-ball', 'birthday-cake', 'wrapped-gift', 'balloon', 'crown', 'gem-stone', 'rose', 'sunflower', 'cherry-blossom', 'sun', 'crescent-moon', 'rainbow', 'diya-lamp', 'trophy', 'graduation-cap', 'books', 'pencil', 'light-bulb', 'rocket', 'money-bag', 'shopping-bags', 'loudspeaker', 'megaphone', 'mobile-phone', 'telephone-receiver', 'e-mail', 'round-pushpin', 'alarm-clock', 'calendar', 'check-mark-button', 'warning', 'hot-beverage', 'pizza', 'musical-notes', 'camera', 'airplane', 'house', 'ring', 'bouquet', 'globe-showing-asia-australia'];
  function addEmoji(id) { if (Pro.addIcon) Pro.addIcon('noto:' + id, null); }

  // =====================================================================
  //  ELEMENTS TAB — extra sections
  // =====================================================================
  var openSec = store('sx-elsec') || {};
  function section(id, title, inner, many) {
    var open = openSec[id] || !many;
    return '<section class="sx-sec' + (open ? ' sx-open' : '') + '" data-sec="' + id + '"><div class="sx-sech"><h4>' + title + '</h4>' + (many ? '<button class="sx-seeall" data-see="' + id + '">' + (open ? 'Show less' : 'See all') + '</button>' : '') + '</div>' + inner + '</section>';
  }
  function elsPlus(panel) {
    var box = el('div', 'sx-plus');
    var jump = el('div', 'st-chips sx-jump');
    jump.innerHTML = '' + [['shapes', 'Shapes'], ['lines', 'Lines & arrows'], ['grids', 'Grids'], ['mock', 'Mockups'], ['pats', 'Patterns'], ['emoji', 'Emoji'], ['stk', 'Stickers'], ['frames', 'Frames'], ['more', 'Tables & QR']].map(function (c) { return '<button class="st-chip" data-jump="' + c[0] + '">' + c[1] + '</button>'; }).join('');
    box.innerHTML = section('shapes', 'Shapes', '<div class="sx-shapes">' + SHAPES.map(function (s, i) { return '<button data-shape="' + i + '" title="' + s[0] + '"><svg viewBox="-3 -3 106 106"><path d="' + s[1] + '" fill="#64748b" fill-rule="evenodd"/></svg></button>'; }).join('') + '</div>', true) +
      section('lines', 'Lines &amp; arrows', '<div class="sx-shapes sx-lines">' + LINES.map(function (l) { return '<button data-line="' + l[1] + '" title="' + l[0] + '">' + lineIcon(l[1]) + '</button>'; }).join('') + '</div>', true) +
      section('grids', 'Grids (photo collage)', '<label class="sx-tog"><input type="checkbox" data-gap ' + (store('sx-gridgap') === false ? '' : 'checked') + '> Space between photos</label><div class="sx-shapes sx-grids">' + GRIDS.map(function (g, i) { return '<button data-grid="' + i + '" title="' + g.length + ' photos">' + gridIcon(g) + '</button>'; }).join('') + '</div>', true) +
      section('mock', 'Mockups', '<div class="sx-shapes sx-mocks">' + Object.keys(MOCK).map(function (k) { return '<button data-mock="' + k + '" title="' + k + '">' + mockIcon(k) + '<span>' + k + '</span></button>'; }).join('') + '</div>', true) +
      section('pats', 'Pattern backgrounds', '<div class="st-row sx-patc"><label>Back <input type="color" data-pc="bg" value="' + patState.bg + '"></label><label>Shape <input type="color" data-pc="fg" value="' + patState.fg + '"></label><label>Shape 2 <input type="color" data-pc="fg2" value="' + patState.fg2 + '"></label><label>Size <input type="range" min="0.4" max="2.5" step="0.1" data-pc="size" value="' + patState.size + '"></label></div><div class="sx-shapes sx-pats">' + Object.keys(PATS).map(function (k) { return '<button data-pat="' + k + '" title="' + k + '">' + patIcon(k) + '</button>'; }).join('') + '</div>', true) +
      section('emoji', 'Emoji', '<div class="sx-shapes sx-emoji">' + EMOJI.map(function (k) { return '<button data-emo="' + k + '" title="' + k.replace(/-/g, ' ') + '"><img loading="lazy" alt="" src="https://api.iconify.design/noto/' + k + '.svg?height=40"></button>'; }).join('') + '</div>', true);
    var first = panel.querySelector('.sx-elsearch');
    panel.insertBefore(box, first ? first.nextSibling : panel.firstChild);
    panel.insertBefore(jump, panel.firstChild);
    var h3 = first && first.querySelector('h3'); if (h3) panel.insertBefore(h3, jump);
    var sIn = first && first.querySelector('.sx-search'); if (sIn) panel.insertBefore(sIn, jump);
    jump.addEventListener('click', function (e) { var j = e.target.closest('[data-jump]'); if (!j) return; var k = j.dataset.jump, tgt = box.querySelector('[data-sec=' + k + ']') || document.getElementById('sxj-' + k) || (k === 'stk' ? panel.querySelector('.sx-elsearch') : null); if (tgt) tgt.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    // mark the existing sections so the jump chips can find them
    var hs = panel.querySelectorAll('h3, h4');
    [].forEach.call(hs, function (h) { var t = h.textContent; if (/^Stickers/.test(t) && !h.id) h.id = 'sxj-stk'; if (/^Photo frames/.test(t)) h.id = 'sxj-frames'; if (/^Shapes &/.test(t)) { h.id = 'sxj-more'; h.textContent = 'Text boxes, tables, QR & barcodes'; } });
    function refreshPats() { [].forEach.call(box.querySelectorAll('[data-pat]'), function (b) { b.innerHTML = patIcon(b.dataset.pat); }); }
    box.addEventListener('input', function (e) {
      var pc = e.target.dataset.pc; if (!pc) return;
      patState[pc] = pc === 'size' ? +e.target.value : e.target.value; store('sx-pat', patState); clearTimeout(box._pt); box._pt = setTimeout(refreshPats, 120);
    });
    box.addEventListener('change', function (e) { if (e.target.hasAttribute('data-gap')) store('sx-gridgap', e.target.checked); });
    box.addEventListener('click', function (e) {
      var see = e.target.closest('[data-see]');
      if (see) { var sec = see.closest('.sx-sec'), op = !sec.classList.contains('sx-open'); sec.classList.toggle('sx-open', op); see.textContent = op ? 'Show less' : 'See all'; openSec[see.dataset.see] = op; store('sx-elsec', openSec); return; }
      var b;
      if ((b = e.target.closest('[data-shape]'))) return addShape(+b.dataset.shape);
      if ((b = e.target.closest('[data-line]'))) return addLine(b.dataset.line);
      if ((b = e.target.closest('[data-grid]'))) return addGrid(+b.dataset.grid, box.querySelector('[data-gap]').checked);
      if ((b = e.target.closest('[data-mock]'))) return addMock(b.dataset.mock);
      if ((b = e.target.closest('[data-pat]'))) return addPattern(b.dataset.pat);
      if ((b = e.target.closest('[data-emo]'))) return addEmoji(b.dataset.emo);
    });
  }

  // =====================================================================
  //  COLOUR + FONT HELPERS
  // =====================================================================
  function parseCol(c) { if (!c || typeof c !== 'string' || c === 'transparent') return null; try { var k = new F.Color(c); var s = k.getSource(); if (!s) return null; return { hex: '#' + k.toHex().toLowerCase(), a: k.getAlpha() }; } catch (e) { return null; } }
  function withAlpha(hex, a) { if (a == null || a >= 1) return hex; var k = new F.Color(hex); k.setAlpha(a); return k.toRgba(); }
  function lum(hex) { var k = new F.Color(hex).getSource(); return (0.299 * k[0] + 0.587 * k[1] + 0.114 * k[2]) / 255; }
  function sat(hex) { var k = new F.Color(hex).getSource(), mx = Math.max(k[0], k[1], k[2]), mn = Math.min(k[0], k[1], k[2]); return mx ? (mx - mn) / mx : 0; }
  function kids(o) { return o._objects || o.objects || null; }
  function skip(o) { return o.type === 'image' || o.ph || o.qr || o.bc || o.icon || o.art || o.chart; }
  // visit every colour slot: fn(get, set)
  function eachColour(objs, fn) {
    (objs || []).forEach(function (o) {
      if (!o || skip(o)) return;
      var ks = kids(o); if (ks && o.type === 'group') { eachColour(ks, fn); if (o._objects) o.dirty = true; return; }
      ['fill', 'stroke', 'backgroundColor', 'textBackgroundColor'].forEach(function (p) {
        var v = o[p];
        if (typeof v === 'string') { fn(v, function (nv) { if (o.set) o.set(p, nv); else o[p] = nv; }); }
        else if (v && v.colorStops) v.colorStops.forEach(function (st) { fn(st.color, function (nv) { st.color = nv; }); if (o.set) o.dirty = true; });
      });
    });
  }
  function usedColours(objs, bg) {
    var m = {};
    function add(c) { var p = parseCol(c); if (p) m[p.hex] = (m[p.hex] || 0) + 1; }
    if (typeof bg === 'string') add(bg);
    eachColour(objs, function (c) { add(c); });
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; });
  }
  function isWhite(h) { return lum(h) > 0.94 && sat(h) < 0.08; }
  function buildMap(cols, pal, shift) {
    var use = cols.filter(function (h) { return !isWhite(h); }).sort(function (a, b) { return lum(a) - lum(b); }), map = {};
    var P = pal.slice().sort(function (a, b) { return lum(a) - lum(b); });
    for (var i = 0; i < shift % P.length; i++) P.push(P.shift());
    use.forEach(function (h, i) { map[h] = P[use.length === 1 ? Math.min(1, P.length - 1) : Math.round(i * (P.length - 1) / (use.length - 1))]; });
    return map;
  }
  function applyMap(objs, getBg, setBg, map) {
    eachColour(objs, function (c, set) { var p = parseCol(c); if (p && map[p.hex]) set(withAlpha(map[p.hex], p.a)); });
    var b = getBg(); if (typeof b === 'string') { var p = parseCol(b); if (p && map[p.hex]) setBg(withAlpha(map[p.hex], p.a)); }
    else if (b && b.colorStops) b.colorStops.forEach(function (st) { var q = parseCol(st.color); if (q && map[q.hex]) st.color = withAlpha(map[q.hex], q.a); });
  }
  function textsOf(objs, out) { out = out || []; (objs || []).forEach(function (o) { if (!o) return; var ks = kids(o); if (ks && o.type === 'group' && !o.ph) textsOf(ks, out); if (/text/.test(o.type)) out.push(o); }); return out; }
  function fontRoles(texts) {
    var sz = texts.map(function (t) { return (t.fontSize || 20) * (t.scaleY || 1); }), mx = Math.max.apply(null, sz.concat([1]));
    return texts.map(function (t, i) { return sz[i] >= mx * 0.55 ? 'h' : 'b'; });
  }
  function hasFont(n) { return S.FONTS.some(function (g) { return g[1].some(function (f) { return f[0] === n; }); }); }

  // =====================================================================
  //  STYLES TAB
  // =====================================================================
  var PALS = [
    ['Fresh mint', ['#0b3b36', '#0f766e', '#2dd4bf', '#ccfbf1', '#f59e0b']], ['Royal', ['#1e1b4b', '#4c1d95', '#8b5cf6', '#ede9fe', '#f472b6']], ['Sunset', ['#3b0a24', '#be123c', '#fb7185', '#ffe4e6', '#f59e0b']], ['Ocean', ['#0c1e3e', '#1d4ed8', '#38bdf8', '#e0f2fe', '#facc15']],
    ['Forest', ['#052e16', '#15803d', '#86efac', '#f0fdf4', '#eab308']], ['Coffee', ['#2b1a12', '#7c4a2d', '#c08457', '#f5ebe0', '#d97706']], ['Candy', ['#4a044e', '#c026d3', '#f0abfc', '#fdf4ff', '#22d3ee']], ['Citrus', ['#3f2d00', '#ca8a04', '#fde047', '#fefce8', '#16a34a']],
    ['Monochrome', ['#0a0a0a', '#404040', '#a3a3a3', '#f5f5f5', '#ef4444']], ['Navy & gold', ['#0b1d3a', '#1e3a8a', '#c9a227', '#fdf8e8', '#b91c1c']], ['Blush', ['#3b0a24', '#9d174d', '#f9a8d4', '#fff1f5', '#a78bfa']], ['Terracotta', ['#3f1d12', '#c2410c', '#fdba74', '#fff7ed', '#0f766e']],
    ['Lavender', ['#2e1065', '#6d28d9', '#c4b5fd', '#f5f3ff', '#10b981']], ['Retro', ['#1f2937', '#e76f51', '#f4a261', '#fefae0', '#2a9d8f']], ['Festive', ['#3b0a0a', '#b91c1c', '#f59e0b', '#fff7e6', '#15803d']], ['Pastel', ['#334155', '#93c5fd', '#fbcfe8', '#fefce8', '#a7f3d0']],
    ['Neon night', ['#030712', '#7c3aed', '#22d3ee', '#1f2937', '#f472b6']], ['Earth', ['#1c1917', '#57534e', '#a8a29e', '#f5f5f4', '#65a30d']], ['Wedding', ['#3b2f0b', '#8a6d1f', '#e6c35c', '#fffbf0', '#9f1239']], ['Tech', ['#0f172a', '#2563eb', '#06b6d4', '#f1f5f9', '#f97316']],
    ['Berry', ['#2a0a1f', '#831843', '#db2777', '#fce7f3', '#facc15']], ['Sage', ['#1f2a1f', '#4d7c5a', '#a3c4a8', '#f3f7f2', '#d97757']], ['Peacock', ['#062a3a', '#0e7490', '#14b8a6', '#ecfeff', '#7c3aed']], ['Bold pop', ['#111827', '#ef4444', '#facc15', '#ffffff', '#3b82f6']]
  ];
  var FSETS = [['Montserrat', 'Poppins'], ['Playfair Display', 'Lato'], ['Bebas Neue', 'Open Sans'], ['Cinzel', 'Cormorant Garamond'], ['Anton', 'Roboto'], ['Pacifico', 'Nunito'], ['Great Vibes', 'Lora'], ['Righteous', 'Raleway'], ['Archivo Black', 'Poppins'], ['Lilita One', 'Nunito'], ['Merriweather', 'Open Sans'], ['Dancing Script', 'Montserrat'], ['Teko', 'Roboto'], ['Caveat', 'Patrick Hand'], ['Hind Siliguri', 'Hind Siliguri'], ['Baloo Da 2', 'Noto Sans Bengali']];
  var palShift = {};
  function styleApply(fn, allPages) {
    if (!allPages) { fn(cv.getObjects(), function () { return cv.backgroundColor; }, function (v) { cv.backgroundColor = v; }); cv.requestRenderAll(); S.record(); return Promise.resolve(); }
    var s = S.docSnapshot();
    s.pages.forEach(function (pg) { fn(pg.objects || [], function () { return pg.background; }, function (v) { pg.background = v; }); });
    return S.openSnapshot(s).then(function () { S.autosave(); });
  }
  function applyPalette(i, all) {
    var pal = PALS[i][1], sh = palShift[i] = palShift[i] == null ? 0 : palShift[i] + 1;
    var pages = all ? (S.saveCur(), S.doc.pages) : [{ objects: cv.getObjects(), background: cv.backgroundColor }];
    var cols = []; pages.forEach(function (pg) { usedColours(pg.objects, pg.background).forEach(function (c) { if (cols.indexOf(c) < 0) cols.push(c); }); });
    if (!cols.length) { S.toast('Add something to the page first.'); return; }
    var map = buildMap(cols, pal, sh);
    styleApply(function (objs, g, st) { applyMap(objs, g, st, map); }, all).then(function () { S.toast(PALS[i][0] + ' colours applied' + (all ? ' to all pages' : '') + '. Tap again to shuffle.'); });
  }
  function applyFonts(i, all) {
    var fs = FSETS[i]; S.needFont(fs[0]); S.needFont(fs[1]);
    S.fontsFor([{ fontFamily: fs[0], fontWeight: 700 }, { fontFamily: fs[0] }, { fontFamily: fs[1] }, { fontFamily: fs[1], fontWeight: 700 }]).then(function () {
      styleApply(function (objs) {
        var t = textsOf(objs), r = fontRoles(t);
        t.forEach(function (x, j) { var f = r[j] === 'h' ? fs[0] : fs[1]; if (x.set) { x.set('fontFamily', f); if (x.initDimensions) x.initDimensions(); } else x.fontFamily = f; });
      }, all).then(function () { S.toast('Fonts changed: ' + fs[0] + ' + ' + fs[1] + '.'); });
    });
  }
  function tabStyles(panel) {
    var fsets = FSETS.filter(function (f) { return hasFont(f[0]) && hasFont(f[1]); });
    fsets.forEach(function (f) { S.needFont(f[0]); S.needFont(f[1]); });
    var all = store('sx-styall') || false;
    var cols = usedColours(cv.getObjects(), cv.backgroundColor);
    panel.innerHTML = '<h3>Styles</h3><p class="st-note">One tap changes the colours or fonts of your whole design. Tap the same style again to shuffle the colours.</p>' +
      '<label class="sx-tog"><input type="checkbox" data-all ' + (all ? 'checked' : '') + '> Apply to all pages</label>' +
      '<h4>Colour palettes</h4><div class="sx-spal">' + PALS.map(function (p, i) { return '<button data-pal="' + i + '" title="' + p[0] + '"><span>' + p[1].map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span><small>' + p[0] + '</small></button>'; }).join('') + '</div>' +
      (store('sx-brand') && (store('sx-brand').colors || []).length >= 2 ? '<button class="st-btn st-wide" data-pal="brand">Use my Brand Kit colours</button>' : '') +
      '<h4>Font sets</h4><div class="sx-fsets">' + fsets.map(function (f) { var i = FSETS.indexOf(f); return '<button data-fs="' + i + '"><b style="font-family:\'' + f[0] + '\'">' + f[0] + '</b><span style="font-family:\'' + f[1] + '\'">' + f[1] + ' for body text</span></button>'; }).join('') + '</div>' +
      '<h4>Colours used on this page</h4><p class="st-note">Tap a colour to change it everywhere on this page.</p><div class="sx-used">' + (cols.length ? cols.slice(0, 24).map(function (c) { return '<label title="' + c + '" style="background:' + c + '"><input type="color" data-used="' + c + '" value="' + c + '"></label>'; }).join('') : '<p class="st-note">No colours yet.</p>') + '</div>' +
      ('EyeDropper' in window ? '<button class="st-btn st-wide" data-eye="1">Pick a colour from the screen for the selected item</button>' : '');
    panel.onchange = function (e) {
      if (e.target.hasAttribute('data-all')) { store('sx-styall', e.target.checked); return; }
      var u = e.target.dataset.used; if (!u) return;
      var m = {}; m[u] = e.target.value; applyMap(cv.getObjects(), function () { return cv.backgroundColor; }, function (v) { cv.backgroundColor = v; }, m); cv.requestRenderAll(); S.record();
      e.target.dataset.used = e.target.value; e.target.parentNode.style.background = e.target.value;
    };
    panel.onclick = function (e) {
      var a = panel.querySelector('[data-all]').checked, b;
      if ((b = e.target.closest('[data-pal]'))) {
        if (b.dataset.pal === 'brand') { var bc = store('sx-brand').colors.slice(0, 5); PALS.push(['My brand', bc]); applyPalette(PALS.length - 1, a); PALS.pop(); delete palShift[PALS.length]; return; }
        applyPalette(+b.dataset.pal, a); return;
      }
      if ((b = e.target.closest('[data-fs]'))) { applyFonts(+b.dataset.fs, a); return; }
      if (e.target.closest('[data-eye]')) {
        var o = cv.getActiveObject(); if (!o) { S.toast('Select an item first.'); return; }
        new window.EyeDropper().open().then(function (r) { (o._objects && o.type === 'activeSelection' ? o._objects : [o]).forEach(function (x) { if (x.type === 'image') return; if (x.type === 'line' || (x.fill === '' && x.stroke)) x.set('stroke', r.sRGBHex); else x.set('fill', r.sRGBHex); }); cv.requestRenderAll(); S.record(); S.showProps(); }).catch(function () {});
      }
    };
  }

  // =====================================================================
  //  APPS TAB
  // =====================================================================
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var APPS = [
    ['cal', 'Calendar', 'Add a month calendar', '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'],
    ['qr', 'QR codes', 'Link, WhatsApp, Wi-Fi, UPI…', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>'],
    ['find', 'Find & replace', 'Change words on every page', '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>'],
    ['pages', 'Pages', 'Reorder, copy, rename pages', '<rect x="4" y="3" width="12" height="15" rx="2"/><path d="M8 21h10a2 2 0 0 0 2-2V7"/>'],
    ['view', 'Rulers & guides', 'Grid, margins, print bleed', '<path d="M3 3h18v5H8v13H3z"/><path d="M7 3v2M11 3v2M15 3v2M3 12h2M3 16h2"/>'],
    ['keys', 'Shortcuts', 'Keyboard shortcuts', '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>']
  ];
  var appCur = null;
  function tabApps(panel, fromStudio) {
    if (fromStudio) appCur = null;
    if (!appCur) {
      panel.innerHTML = '<h3>Apps</h3><p class="st-note">Handy free tools for your design.</p><div class="sx-apps">' + APPS.map(function (a) { return '<button data-app="' + a[0] + '">' + svg(a[3]) + '<b>' + a[1] + '</b><small>' + a[2] + '</small></button>'; }).join('') + '</div>' +
        '<h4>More in Elements</h4><div class="st-chips"><button class="st-chip" data-goel="grids">Photo grids</button><button class="st-chip" data-goel="mock">Mockups</button><button class="st-chip" data-goel="pats">Patterns</button><button class="st-chip" data-goel="more">Tables</button></div>';
      panel.onclick = function (e) {
        var b = e.target.closest('[data-app]'); if (b) { appCur = b.dataset.app; tabApps(panel); return; }
        var g = e.target.closest('[data-goel]'); if (g) { S.selectTab('els'); setTimeout(function () { var c = S.panel.querySelector('[data-jump=' + g.dataset.goel + ']'); if (c) c.click(); }, 60); }
      };
      panel.oninput = panel.onchange = null; return;
    }
    var a = APPS.filter(function (x) { return x[0] === appCur; })[0];
    panel.innerHTML = '<button class="sx-back" data-back="1">‹ All apps</button><h3>' + a[1] + '</h3><div class="sx-app"></div>';
    var body = panel.querySelector('.sx-app');
    panel.onclick = function (e) { if (e.target.closest('[data-back]')) { appCur = null; tabApps(panel); } };
    panel.oninput = panel.onchange = null;
    ({ cal: appCalendar, qr: appQR, find: appFind, pages: appPages, view: appView, keys: appKeys })[appCur](body, panel);
  }

  // ---------- Calendar ----------
  function appCalendar(body) {
    var now = new Date(), st = store('sx-cal') || { m: now.getMonth(), y: now.getFullYear(), mon: false, pal: 0, box: true };
    body.innerHTML = '<div class="st-row"><select class="st-in" data-c="m">' + MONTHS.map(function (m, i) { return '<option value="' + i + '"' + (i === +st.m ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select><input class="st-in" type="number" data-c="y" min="1900" max="2200" value="' + st.y + '" style="width:90px"></div>' +
      '<label class="sx-tog"><input type="checkbox" data-c="mon" ' + (st.mon ? 'checked' : '') + '> Week starts on Monday</label><label class="sx-tog"><input type="checkbox" data-c="box" ' + (st.box ? 'checked' : '') + '> Boxes around days</label>' +
      '<h4>Colours</h4><div class="sx-spal sx-mini">' + PALS.slice(0, 12).map(function (p, i) { return '<button data-cp="' + i + '" aria-pressed="' + (i === st.pal) + '"><span>' + p[1].map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span></button>'; }).join('') + '</div>' +
      '<button class="st-btn st-cta st-wide" data-make="1">Add calendar</button><button class="st-btn st-wide" data-make="12">Add 12 months (one per page)</button><p class="st-note">Sundays are shown in red. Every date is a text box you can change.</p>';
    function read() { st.m = +body.querySelector('[data-c=m]').value; st.y = +body.querySelector('[data-c=y]').value || now.getFullYear(); st.mon = body.querySelector('[data-c=mon]').checked; st.box = body.querySelector('[data-c=box]').checked; store('sx-cal', st); }
    body.onclick = function (e) {
      var p = e.target.closest('[data-cp]'); if (p) { st.pal = +p.dataset.cp; [].forEach.call(body.querySelectorAll('[data-cp]'), function (x) { x.setAttribute('aria-pressed', x === p); }); store('sx-cal', st); return; }
      var mk = e.target.closest('[data-make]'); if (!mk) return; read();
      if (mk.dataset.make === '1') { selectMany(calObjs(st.m, st.y, st), MONTHS[st.m] + ' ' + st.y + ' calendar added.'); return; }
      if (!confirm('This adds 12 new pages (one calendar each) after this page. Continue?')) return;
      S.saveCur(); var s = S.docSnapshot(), base = s.cur, made = [];
      var sc = new F.StaticCanvas(null, { width: W(), height: H() });
      for (var m = 0; m < 12; m++) {
        sc.clear(); calObjs(m, st.y, st, true).forEach(function (o) { sc.add(o); });
        var j = sc.toJSON(S.PROPS); j.background = '#ffffff'; made.push(j);
      }
      sc.dispose();
      [].splice.apply(s.pages, [base + 1, 0].concat(made));
      if (s.pageNames) [].splice.apply(s.pageNames, [base + 1, 0].concat(MONTHS.map(function (x) { return x.slice(0, 3) + ' ' + st.y; })));
      else { s.pageNames = s.pages.map(function (_, i) { return i > base && i <= base + 12 ? MONTHS[i - base - 1].slice(0, 3) + ' ' + st.y : 'Page ' + (i + 1); }); }
      s.cur = base + 1; S.openSnapshot(s).then(function () { S.autosave(); S.toast('12 calendar pages added.'); });
    };
  }
  function calObjs(m, y, st, full) {
    var w = W(), h = H(), pal = PALS[st.pal || 0][1], dk = pal[0], pr = pal[1], lt = pal[3], mn = Math.min(w, h);
    var cw = w * (full ? 0.86 : 0.8), x0 = (w - cw) / 2, cell = cw / 7, rows = 6, titleH = cell * 1.1, ch = Math.min(cell * 0.86, (h * (full ? 0.78 : 0.7) - titleH - cell * 0.6) / rows);
    var totalH = titleH + cell * 0.6 + rows * ch, y0 = full ? (h - totalH) / 2 : Math.max(mn * 0.04, (h - totalH) / 2), o = [];
    var days = st.mon ? DAYS.slice(1).concat(DAYS[0]) : DAYS, first = new Date(y, m, 1).getDay(), off = st.mon ? (first + 6) % 7 : first, n = new Date(y, m + 1, 0).getDate();
    var font = hasFont('Montserrat') ? 'Montserrat' : 'Poppins'; S.needFont(font);
    o.push(ST.mkObj({ t: 'text', x: x0, y: y0, w: cw, text: MONTHS[m] + ' ' + y, size: Math.round(cell * 0.5), font: font, bold: 800, color: dk, align: 'center', nm: 'Calendar title' }, w, h));
    var hy = y0 + titleH;
    o.push(ST.mkObj({ t: 'rect', x: x0, y: hy, w: cw, h: cell * 0.5, fill: pr, r: cell * 0.1, nm: 'Calendar header' }, w, h));
    days.forEach(function (d, i) { o.push(ST.mkObj({ t: 'text', x: x0 + i * cell, y: hy + cell * 0.12, w: cell, text: d.toUpperCase(), size: Math.round(cell * 0.2), font: font, bold: 700, color: '#ffffff', align: 'center', ls: 80 }, w, h)); });
    var gy = hy + cell * 0.6;
    for (var d = 1; d <= n; d++) {
      var idx = off + d - 1, r = Math.floor(idx / 7), c = idx % 7, cx = x0 + c * cell, cy = gy + r * ch, sun = days[c] === 'Sun';
      if (st.box) o.push(ST.mkObj({ t: 'rect', x: cx + cell * 0.03, y: cy + ch * 0.03, w: cell * 0.94, h: ch * 0.94, fill: lt, r: cell * 0.08, nm: 'Calendar day box' }, w, h));
      o.push(ST.mkObj({ t: 'text', x: cx + cell * 0.08, y: cy + ch * (st.box ? 0.1 : 0.3), w: cell * (st.box ? 0.84 : 0.84), text: String(d), size: Math.round(Math.min(cell, ch) * 0.3), font: font, bold: 600, color: sun ? '#dc2626' : dk, align: st.box ? 'left' : 'center' }, w, h));
    }
    return o;
  }

  // ---------- Smart QR codes ----------
  var QRK = [['link', 'Website link'], ['wa', 'WhatsApp'], ['wifi', 'Wi-Fi'], ['tel', 'Phone call'], ['mail', 'E-mail'], ['upi', 'UPI payment'], ['text', 'Plain text']];
  function appQR(body) {
    var st = store('sx-qr') || { k: 'link', col: '#111827', bg: '#ffffff' };
    function form() {
      var f = {
        link: [['url', 'Website link', 'https://']], wa: [['num', 'WhatsApp number with country code', '91'], ['msg', 'Message (optional)', 'Hello!']], wifi: [['ssid', 'Wi-Fi name', ''], ['pw', 'Wi-Fi password', ''], ['enc', 'Security (WPA / WEP / none)', 'WPA']],
        tel: [['num', 'Phone number', '+91']], mail: [['to', 'E-mail address', ''], ['sub', 'Subject (optional)', '']], upi: [['pa', 'UPI ID (example: shopname@bank)', ''], ['pn', 'Name shown to the payer', ''], ['am', 'Amount in ₹ (optional)', '']], text: [['t', 'Text', '']]
      }[st.k];
      return f.map(function (x) { return '<label class="st-field st-wide">' + x[1] + '<input class="st-in" data-q="' + x[0] + '" value="' + esc((st[st.k + x[0]]) != null ? st[st.k + x[0]] : x[2]) + '"></label>'; }).join('');
    }
    function draw() {
      body.innerHTML = '<div class="st-chips">' + QRK.map(function (q) { return '<button class="st-chip" data-qk="' + q[0] + '" aria-pressed="' + (q[0] === st.k) + '">' + q[1] + '</button>'; }).join('') + '</div>' + form() +
        '<div class="st-row"><label>Colour <input type="color" data-qc="col" value="' + st.col + '"></label><label>Back <input type="color" data-qc="bg" value="' + st.bg + '"></label></div>' +
        '<button class="st-btn st-cta st-wide" data-addqr="1">Add QR code</button><p class="st-note">Scan it with any phone camera to check before printing.</p>';
    }
    function data() {
      var v = function (k) { var i = body.querySelector('[data-q=' + k + ']'); return i ? i.value.trim() : ''; };
      switch (st.k) {
        case 'link': return v('url');
        case 'wa': return 'https://wa.me/' + v('num').replace(/\D/g, '') + (v('msg') ? '?text=' + encodeURIComponent(v('msg')) : '');
        case 'wifi': var e = (v('enc') || 'WPA').toUpperCase(); return 'WIFI:T:' + (/NONE|OPEN/.test(e) ? 'nopass' : e) + ';S:' + v('ssid').replace(/([\\;,:"])/g, '\\$1') + ';P:' + v('pw').replace(/([\\;,:"])/g, '\\$1') + ';;';
        case 'tel': return 'tel:' + v('num').replace(/[^\d+]/g, '');
        case 'mail': return 'mailto:' + v('to') + (v('sub') ? '?subject=' + encodeURIComponent(v('sub')) : '');
        case 'upi': return 'upi://pay?pa=' + encodeURIComponent(v('pa')) + (v('pn') ? '&pn=' + encodeURIComponent(v('pn')) : '') + (v('am') ? '&am=' + encodeURIComponent(v('am')) : '') + '&cu=INR';
        default: return v('t');
      }
    }
    draw();
    body.oninput = function (e) { var q = e.target.dataset.q, c = e.target.dataset.qc; if (q) st[st.k + q] = e.target.value; if (c) st[c] = e.target.value; store('sx-qr', st); };
    body.onclick = function (e) {
      var k = e.target.closest('[data-qk]'); if (k) { st.k = k.dataset.qk; store('sx-qr', st); draw(); return; }
      if (!e.target.closest('[data-addqr]')) return;
      var d = data(); if (!d || /^(https?:\/\/|tel:|mailto:)?$/.test(d) || (st.k === 'upi' && !/pa=[^&]+/.test(d)) || (st.k === 'wifi' && /S:;/.test(d))) { S.toast('Please fill in the details first.'); return; }
      var s = SM() * 0.3;
      ST.imgObj(ST.qrURL(d, st.col, st.bg), { x: (W() - s) / 2, y: (H() - s) / 2, w: s, h: s }).then(function (im) { im.qr = { data: d, color: st.col, bgc: st.bg }; im.nm = 'QR · ' + QRK.filter(function (q) { return q[0] === st.k; })[0][1]; S.addObj(im); S.record(); S.showProps(); S.toast('QR code added.'); });
    };
  }

  // ---------- Find & replace ----------
  function appFind(body) {
    body.innerHTML = '<label class="st-field st-wide">Find<input class="st-in" data-f="a" placeholder="Word to find"></label><label class="st-field st-wide">Replace with<input class="st-in" data-f="b" placeholder="New word"></label><label class="sx-tog"><input type="checkbox" data-f="case"> Match capital letters</label><label class="sx-tog"><input type="checkbox" data-f="all" checked> All pages</label><div class="st-row"><button class="st-btn" data-fa="count">Count</button><button class="st-btn st-cta" data-fa="go">Replace all</button></div><p class="st-note sx-fres"></p>';
    function rx() { var a = body.querySelector('[data-f=a]').value; if (!a) return null; return new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), body.querySelector('[data-f=case]').checked ? 'g' : 'gi'); }
    body.onclick = function (e) {
      var b = e.target.closest('[data-fa]'); if (!b) return; var re = rx(), res = body.querySelector('.sx-fres'); if (!re) { res.textContent = 'Type a word to find.'; return; }
      var rep = body.querySelector('[data-f=b]').value, all = body.querySelector('[data-f=all]').checked, go = b.dataset.fa === 'go', n = 0, cur = S.cur();
      textsOf(cv.getObjects()).forEach(function (t) { var m = String(t.text).match(re); if (m) { n += m.length; if (go) { t.set('text', String(t.text).replace(re, rep)); t.tpl = t.text; if (t.initDimensions) t.initDimensions(); } } });
      if (all) { S.saveCur(); S.doc.pages.forEach(function (pg, i) { if (i === cur) return; textsOf(pg.objects).forEach(function (t) { var m = String(t.text).match(re); if (m) { n += m.length; if (go) { t.text = String(t.text).replace(re, rep); t.tpl = t.text; t.styles = {}; } } }); }); }
      if (go) { cv.requestRenderAll(); S.record(); S.saveCur(); S.autosave(); }
      res.textContent = n ? (go ? 'Replaced ' + n + ' time' + (n > 1 ? 's' : '') + '.' : 'Found ' + n + ' time' + (n > 1 ? 's' : '') + '.') : 'Not found.';
    };
  }

  // ---------- Pages ----------
  function appPages(body) {
    S.saveCur();
    var d = S.doc, names = d.pageNames || [], cur = S.cur();
    body.innerHTML = '<p class="st-note">' + d.pages.length + ' page' + (d.pages.length > 1 ? 's' : '') + '. Use the arrows to change the order.</p><div class="sx-pglist">' + d.pages.map(function (p, i) {
      return '<div class="sx-pgrow' + (i === cur ? ' sx-on' : '') + '"><span class="sx-pgn">' + (i + 1) + '</span><input class="st-in" data-pn="' + i + '" value="' + esc(names[i] || 'Page ' + (i + 1)) + '"><button data-pg="go" data-i="' + i + '" title="Open">Open</button><button data-pg="up" data-i="' + i + '" title="Move up"' + (i ? '' : ' disabled') + '>↑</button><button data-pg="down" data-i="' + i + '" title="Move down"' + (i < d.pages.length - 1 ? '' : ' disabled') + '>↓</button><button data-pg="copy" data-i="' + i + '" title="Copy">⧉</button><button data-pg="del" data-i="' + i + '" title="Delete"' + (d.pages.length > 1 ? '' : ' disabled') + '>✕</button></div>';
    }).join('') + '</div><button class="st-btn st-wide" data-pg="add">+ Add a blank page</button>';
    body.onchange = function (e) { var i = e.target.dataset.pn; if (i == null) return; var s = S.docSnapshot(); s.pageNames = s.pages.map(function (_, j) { return (s.pageNames && s.pageNames[j]) || 'Page ' + (j + 1); }); s.pageNames[+i] = e.target.value.slice(0, 30) || 'Page ' + (+i + 1); d.pageNames = s.pageNames; S.renderPagesBar(); S.autosave(); };
    body.onclick = function (e) {
      var b = e.target.closest('[data-pg]'); if (!b || b.disabled) return; var k = b.dataset.pg, i = +b.dataset.i, s = S.docSnapshot(), c = s.cur;
      s.pageNames = s.pages.map(function (_, j) { return (s.pageNames && s.pageNames[j]) || 'Page ' + (j + 1); });
      function mv(a, z) { [s.pages, s.pageNames].forEach(function (L) { var x = L.splice(a, 1)[0]; L.splice(z, 0, x); }); if (c === a) c = z; else if (a < c && z >= c) c--; else if (a > c && z <= c) c++; }
      if (k === 'go') { S.loadPage(i).then(function () { appPages(body); }); return; }
      if (k === 'up') mv(i, i - 1); else if (k === 'down') mv(i, i + 1);
      else if (k === 'copy') { s.pages.splice(i + 1, 0, JSON.parse(JSON.stringify(s.pages[i]))); s.pageNames.splice(i + 1, 0, s.pageNames[i] + ' copy'); if (c > i) c++; }
      else if (k === 'del') { if (!confirm('Delete page ' + (i + 1) + '?')) return; s.pages.splice(i, 1); s.pageNames.splice(i, 1); if (c > i || c >= s.pages.length) c = Math.max(0, c - 1); }
      else if (k === 'add') { s.pages.push({ version: F.version, objects: [], background: '#ffffff' }); s.pageNames.push('Page ' + s.pages.length); c = s.pages.length - 1; }
      s.cur = c; S.openSnapshot(s).then(function () { S.autosave(); appPages(body); });
    };
  }

  // ---------- Rulers, grid & guides ----------
  var view = store('sx-view') || {};
  var VIEW = [['rulers', 'Rulers'], ['grid', 'Square grid'], ['thirds', 'Rule of thirds'], ['center', 'Centre lines'], ['margin', 'Margins (safe area)'], ['bleed', 'Print bleed (3 mm)']];
  function overlay() {
    var box = S.box; if (!box) return; box.style.position = 'relative';
    var ov = box.querySelector('.sx-ov'); if (!ov) { ov = el('div', 'sx-ov'); box.appendChild(ov); }
    var d = S.doc, mmx = 100 / d.mm[0], mmy = 100 / d.mm[1], h = '';
    if (view.grid) { var g = Math.max(5, Math.round(Math.min(d.mm[0], d.mm[1]) / 12)); h += '<div class="sx-ovg" style="background-size:' + g * mmx + '% ' + g * mmy + '%"></div>'; }
    if (view.thirds) h += '<i style="left:33.333%;top:0;bottom:0;width:0;border-left-width:1px"></i><i style="left:66.666%;top:0;bottom:0;width:0;border-left-width:1px"></i><i style="top:33.333%;left:0;right:0;height:0;border-top-width:1px"></i><i style="top:66.666%;left:0;right:0;height:0;border-top-width:1px"></i>';
    if (view.center) h += '<i class="sx-c" style="left:50%;top:0;bottom:0;width:0;border-left-width:1px"></i><i class="sx-c" style="top:50%;left:0;right:0;height:0;border-top-width:1px"></i>';
    if (view.margin) { var mg = Math.min(d.mm[0], d.mm[1]) * 0.06; h += '<b class="sx-m" style="left:' + mg * mmx + '%;right:' + mg * mmx + '%;top:' + mg * mmy + '%;bottom:' + mg * mmy + '%"></b>'; }
    if (view.bleed) h += '<b class="sx-b" style="left:' + 3 * mmx + '%;right:' + 3 * mmx + '%;top:' + 3 * mmy + '%;bottom:' + 3 * mmy + '%"></b>';
    if (view.rulers) { var stp = d.mm[0] > 400 ? 50 : d.mm[0] > 150 ? 20 : 10, t = '', l = ''; for (var x = 0; x <= d.mm[0]; x += stp) t += '<span style="left:' + x * mmx + '%">' + x + '</span>'; for (var y = 0; y <= d.mm[1]; y += stp) l += '<span style="top:' + y * mmy + '%">' + y + '</span>'; h += '<div class="sx-rt">' + t + '</div><div class="sx-rl">' + l + '</div>'; }
    ov.innerHTML = h; ov.hidden = !h;
  }
  function appView(body) {
    body.innerHTML = VIEW.map(function (v) { return '<label class="sx-tog"><input type="checkbox" data-v="' + v[0] + '" ' + (view[v[0]] ? 'checked' : '') + '> ' + v[1] + '</label>'; }).join('') + '<p class="st-note">These lines only help you line things up. They are never printed or downloaded. Rulers are in millimetres.</p>';
    body.onchange = function (e) { var k = e.target.dataset.v; if (!k) return; view[k] = e.target.checked; store('sx-view', view); overlay(); };
  }

  // ---------- Shortcuts ----------
  var KEYS = [['Ctrl + Z', 'Undo'], ['Ctrl + Y  /  Ctrl + Shift + Z', 'Redo'], ['Ctrl + C, Ctrl + V', 'Copy and paste'], ['Ctrl + D', 'Duplicate'], ['Ctrl + A', 'Select everything'], ['Ctrl + G', 'Group / ungroup'], ['Delete', 'Delete the selected item'], ['Arrow keys (+ Shift)', 'Move a little (or more)'], ['Ctrl + ]  /  Ctrl + [', 'Bring forward / send backward'], ['Ctrl + Shift + L', 'Lock / unlock'], ['T', 'Add a text box'], ['R', 'Add a rectangle'], ['C', 'Add a circle'], ['L', 'Add a line'], ['Ctrl + +  /  Ctrl + −', 'Zoom in / out'], ['Ctrl + 0', 'Fit the page to the screen'], ['Esc', 'Deselect']];
  function appKeys(body) { body.innerHTML = '<table class="sx-keys">' + KEYS.map(function (k) { return '<tr><td><kbd>' + esc(k[0]) + '</kbd></td><td>' + esc(k[1]) + '</td></tr>'; }).join('') + '</table><p class="st-note">On a Mac use ⌘ instead of Ctrl.</p>'; }
  function keyHandler(e) {
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    var a = cv.getActiveObject(); if (a && a.isEditing) return;
    var mod = e.ctrlKey || e.metaKey, k = e.key;
    if (mod && (k === '=' || k === '+')) { e.preventDefault(); S.setZoom(Math.min(3, S.zoom() * 1.15)); return; }
    if (mod && (k === '-' || k === '_')) { e.preventDefault(); S.setZoom(Math.max(0.1, S.zoom() / 1.15)); return; }
    if (mod && k === '0') { e.preventDefault(); S.fit(); return; }
    if (mod && a && k === ']') { e.preventDefault(); e.shiftKey ? a.bringToFront() : a.bringForward(); cv.requestRenderAll(); S.record(); return; }
    if (mod && a && k === '[') { e.preventDefault(); e.shiftKey ? a.sendToBack() : a.sendBackwards(); cv.requestRenderAll(); S.record(); return; }
    if (mod && e.shiftKey && a && k.toLowerCase() === 'l') { e.preventDefault(); S.act('lock'); return; }
    if (mod || e.altKey) return;
    var lk = k.toLowerCase();
    if (lk === 't') { e.preventDefault(); var s = SM(), tb = ST.mkObj({ t: 'text', x: W() * 0.1, y: H() * 0.42, w: W() * 0.8, text: 'Your text here', size: Math.round(s / 18), font: 'Poppins', color: '#1B2330', align: 'center' }, W(), H()); S.addObj(tb); S.showProps(); }
    else if (lk === 'r') { e.preventDefault(); addShape(0); }
    else if (lk === 'c') { e.preventDefault(); addShape(2); }
    else if (lk === 'l') { e.preventDefault(); addLine('line'); }
  }

  // =====================================================================
  //  ALIGN & SPACE EVENLY (several items selected)
  // =====================================================================
  function arrange(kind) {
    var sel = cv.getActiveObject(); if (!sel || sel.type !== 'activeSelection') return;
    var list = sel.getObjects().slice(); cv.discardActiveObject();
    var bs = list.map(function (o) { o.setCoords(); return o.getBoundingRect(true, true); });
    var L = Math.min.apply(null, bs.map(function (b) { return b.left; })), T = Math.min.apply(null, bs.map(function (b) { return b.top; }));
    var R = Math.max.apply(null, bs.map(function (b) { return b.left + b.width; })), B = Math.max.apply(null, bs.map(function (b) { return b.top + b.height; }));
    function mv(i, dx, dy) { list[i].set({ left: list[i].left + dx, top: list[i].top + dy }); list[i].setCoords(); }
    if (kind === 'hd' || kind === 'vd') {
      var hz = kind === 'hd', ord = list.map(function (_, i) { return i; }).sort(function (a, b) { return hz ? bs[a].left - bs[b].left : bs[a].top - bs[b].top; });
      var tot = ord.reduce(function (s, i) { return s + (hz ? bs[i].width : bs[i].height); }, 0), gap = ((hz ? R - L : B - T) - tot) / Math.max(1, ord.length - 1), pos = hz ? L : T;
      ord.forEach(function (i) { if (hz) mv(i, pos - bs[i].left, 0); else mv(i, 0, pos - bs[i].top); pos += (hz ? bs[i].width : bs[i].height) + gap; });
    } else bs.forEach(function (b, i) {
      if (kind === 'l') mv(i, L - b.left, 0); else if (kind === 'r') mv(i, R - b.left - b.width, 0); else if (kind === 'c') mv(i, (L + R) / 2 - b.left - b.width / 2, 0);
      else if (kind === 't') mv(i, 0, T - b.top); else if (kind === 'b') mv(i, 0, B - b.top - b.height); else if (kind === 'm') mv(i, 0, (T + B) / 2 - b.top - b.height / 2);
    });
    cv.setActiveObject(new F.ActiveSelection(list, { canvas: cv })); cv.requestRenderAll(); S.record();
  }
  var AR = [['l', 'Align left', '<path d="M4 3v18M8 7h10M8 15h6"/>'], ['c', 'Align centres', '<path d="M12 3v18M6 7h12M8 15h8"/>'], ['r', 'Align right', '<path d="M20 3v18M6 7h10M10 15h6"/>'], ['t', 'Align top', '<path d="M3 4h18M7 8v10M15 8v6"/>'], ['m', 'Align middle', '<path d="M3 12h18M7 6v12M15 8v8"/>'], ['b', 'Align bottom', '<path d="M3 20h18M7 6v10M15 10v6"/>'], ['hd', 'Space evenly across', '<path d="M3 4v16M21 4v16M8 8h3v8H8zM13 8h3v8h-3z"/>'], ['vd', 'Space evenly down', '<path d="M4 3h16M4 21h16M8 8h8v3H8zM8 13h8v3H8z"/>']];

  // =====================================================================
  //  INSTALL
  // =====================================================================
  Pro.tabs.push({ k: 'styles', label: 'Styles', icon: IC.styles, render: tabStyles }, { k: 'apps', label: 'Apps', icon: IC.apps, render: tabApps });
  var o = Pro.order; o.splice(o.indexOf('brand') + 1, 0, 'styles'); o.splice(o.indexOf('anim') + 1, 0, 'apps');
  var baseInstall = Pro.install;
  Pro.install = function (studio) {
    baseInstall(studio); S = studio; cv = S.canvas;
    var prevEls = S.elsHook; S.elsHook = function (panel) { if (prevEls) prevEls(panel); elsPlus(panel); };
    var prevProps = S.propsHook; S.propsHook = function (ob, h, info) {
      h = (prevProps ? prevProps(ob, h, info) : h) || h;
      if (ob && ob.type === 'activeSelection') {
        var add = '<span class="sx-arr">' + AR.map(function (a) { return '<button class="st-pb sx-ic" data-p="yar' + a[0] + '" title="' + a[1] + '">' + svg(a[2]) + '</button>'; }).join('') + '</span>';
        h = h.indexOf('data-p="cstyle"') >= 0 ? h.replace('<button class="st-pb" data-p="cstyle"', add + '<button class="st-pb" data-p="cstyle"') : h + add;
      }
      return h;
    };
    var prevAct = S.extAct; S.extAct = function (p, ob, val) { if (/^yar/.test(p)) { arrange(p.slice(3)); return; } if (prevAct) prevAct(p, ob, val); };
    document.addEventListener('keydown', keyHandler);
    overlay();
    var rf = function () { clearTimeout(rf.t); rf.t = setTimeout(overlay, 50); };
    window.addEventListener('resize', rf); cv.on('after:render', function () { if (!S.box.querySelector('.sx-ov') && Object.keys(view).some(function (k) { return view[k]; })) overlay(); });
  };
  Pro.plus = { SHAPES: SHAPES, GRIDS: GRIDS, MOCK: MOCK, PATS: PATS, PALS: PALS, FSETS: FSETS, calObjs: calObjs, arrange: arrange, overlay: overlay };
})();
