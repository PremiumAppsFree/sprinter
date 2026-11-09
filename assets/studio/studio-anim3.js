/* S Printer — Editing Tool S, part 6: more original animated stickers (beauty, love & flowers,
 * daily life, festival wishes). They join the animated stickers of studio-anim2.js, so they move on the
 * page, in Play and in MP4 / GIF downloads, and their colour and speed can be changed.
 * Original code and artwork by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, F = window.fabric, Pro = ST && ST.Pro;
  if (!Pro || !F || !Pro.anim2) return;
  var K = Pro.anim2.K, TAU = Math.PI * 2;
  function back(x) { var c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function rnd(i) { var x = Math.sin(i * 91.7 + 47.3) * 43758.5453; return x - Math.floor(x); }
  function hex(c, a) { var k = new F.Color(c); if (a != null) k.setAlpha(a); return k.toRgba(); }
  function shade(c, p) { var s = new F.Color(c).getSource(), f = function (v) { return Math.max(0, Math.min(255, Math.round(p < 0 ? v * (1 + p) : v + (255 - v) * p))); }; return 'rgb(' + f(s[0]) + ',' + f(s[1]) + ',' + f(s[2]) + ')'; }
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function heart(x, cx, cy, s, c) {
    x.beginPath(); x.moveTo(cx, cy + s * 0.35); x.bezierCurveTo(cx - s * 0.9, cy - s * 0.25, cx - s * 0.45, cy - s * 0.95, cx, cy - s * 0.45); x.bezierCurveTo(cx + s * 0.45, cy - s * 0.95, cx + s * 0.9, cy - s * 0.25, cx, cy + s * 0.35); x.closePath();
    var g = x.createLinearGradient(cx - s, cy - s, cx + s, cy + s); g.addColorStop(0, shade(c, 0.35)); g.addColorStop(1, shade(c, -0.15)); x.fillStyle = g; x.fill();
  }
  function spark(x, cx, cy, r, c) { x.beginPath(); x.moveTo(cx, cy - r); x.quadraticCurveTo(cx + r * 0.12, cy - r * 0.12, cx + r, cy); x.quadraticCurveTo(cx + r * 0.12, cy + r * 0.12, cx, cy + r); x.quadraticCurveTo(cx - r * 0.12, cy + r * 0.12, cx - r, cy); x.quadraticCurveTo(cx - r * 0.12, cy - r * 0.12, cx, cy - r); x.fillStyle = c; x.fill(); }
  function glow(x, cx, cy, r, c, a) { var g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, hex(c, a)); g.addColorStop(1, hex(c, 0)); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); }
  function twinkle(x, t, S, pts, c) { pts.forEach(function (q, i) { spark(x, q[0] * S, q[1] * S, S * (q[2] || 0.04) * Math.abs(Math.sin(t * 3 + i * 1.7)), c || '#fff'); }); }
  function words(x, txt, cx, cy, size, font, c, o) {
    o = o || {}; x.save(); x.font = (o.w || 400) + ' ' + size + 'px "' + font + '", cursive, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (o.stroke) { x.lineJoin = 'round'; x.lineWidth = o.sw || size * 0.16; x.strokeStyle = o.stroke; x.strokeText(txt, cx, cy); }
    x.fillStyle = c; x.fillText(txt, cx, cy); x.restore();
  }
  function petal(x, len, wid) { x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(wid, -len * 0.3, wid * 0.8, -len * 0.9, 0, -len); x.bezierCurveTo(-wid * 0.8, -len * 0.9, -wid, -len * 0.3, 0, 0); }
  function shine(x, t, S, clip, per) { var p = (t % (per || 2)) / (per || 2); x.save(); clip(); x.clip(); x.rotate(0.5); var gx = (p * 2.2 - 0.8) * S, g = x.createLinearGradient(gx - S * 0.08, 0, gx + S * 0.08, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(-S, -S * 2, S * 4, S * 4); x.restore(); }

  var ADD = {
    // ---------- beauty ----------
    lipstick: { n: 'Lipstick', c: '#e11d48', cat: 'beauty', d: function (x, t, S, c) {
      var up = 0.5 + 0.5 * Math.sin(t * 2), cx = S / 2;
      x.save(); x.translate(cx, S * 0.5); x.rotate(-0.25);
      var g = x.createLinearGradient(-S * 0.08, 0, S * 0.08, 0); g.addColorStop(0, shade(c, -0.25)); g.addColorStop(0.45, shade(c, 0.25)); g.addColorStop(1, shade(c, -0.2));
      x.beginPath(); x.moveTo(-S * 0.07, -S * 0.02 - up * S * 0.12); x.lineTo(-S * 0.07, -S * 0.2 - up * S * 0.12); x.quadraticCurveTo(S * 0.02, -S * 0.32 - up * S * 0.12, S * 0.07, -S * 0.26 - up * S * 0.12); x.lineTo(S * 0.07, -S * 0.02 - up * S * 0.12); x.closePath(); x.fillStyle = g; x.fill();
      var gg = x.createLinearGradient(-S * 0.1, 0, S * 0.1, 0); gg.addColorStop(0, '#b8860b'); gg.addColorStop(0.5, '#fde68a'); gg.addColorStop(1, '#a16207');
      rr(x, -S * 0.09, -S * 0.04, S * 0.18, S * 0.14, S * 0.02); x.fillStyle = gg; x.fill();
      rr(x, -S * 0.1, S * 0.1, S * 0.2, S * 0.26, S * 0.03); x.fillStyle = '#1f2937'; x.fill();
      x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(-S * 0.07, S * 0.12, S * 0.03, S * 0.22); x.restore();
      twinkle(x, t, S, [[0.72, 0.2, 0.05], [0.25, 0.3, 0.035], [0.75, 0.7, 0.03]], '#fde68a'); } },
    nails: { n: 'Nail polish', c: '#db2777', cat: 'beauty', d: function (x, t, S, c) {
      var cx = S / 2, by = S * 0.82; x.save(); x.translate(0, Math.sin(t * 2) * S * 0.015);
      rr(x, cx - S * 0.05, S * 0.12, S * 0.1, S * 0.24, S * 0.03); x.fillStyle = '#111827'; x.fill();
      var body = function () { x.beginPath(); x.moveTo(cx - S * 0.18, S * 0.42); x.quadraticCurveTo(cx - S * 0.2, S * 0.36, cx - S * 0.1, S * 0.36); x.lineTo(cx + S * 0.1, S * 0.36); x.quadraticCurveTo(cx + S * 0.2, S * 0.36, cx + S * 0.18, S * 0.42); x.lineTo(cx + S * 0.2, by - S * 0.04); x.quadraticCurveTo(cx + S * 0.2, by, cx + S * 0.14, by); x.lineTo(cx - S * 0.14, by); x.quadraticCurveTo(cx - S * 0.2, by, cx - S * 0.2, by - S * 0.04); x.closePath(); };
      body(); var g = x.createLinearGradient(cx - S * 0.2, 0, cx + S * 0.2, 0); g.addColorStop(0, shade(c, -0.2)); g.addColorStop(0.5, shade(c, 0.2)); g.addColorStop(1, shade(c, -0.25)); x.fillStyle = g; x.fill();
      x.translate(cx, 0); shine(x, t, S, function () { x.translate(-cx, 0); body(); x.translate(cx, 0); }, 2.4); x.restore();
      var dp = (t % 2.4) / 2.4; if (dp < 0.6) { x.beginPath(); x.ellipse(cx + S * 0.2, S * 0.5 + dp * S * 0.2, S * 0.02, S * 0.03, 0, 0, TAU); x.fillStyle = c; x.fill(); }
      twinkle(x, t, S, [[0.78, 0.2, 0.05], [0.2, 0.26, 0.04]], '#fff'); } },
    mirror: { n: 'Hand mirror', c: '#f9a8d4', cat: 'beauty', d: function (x, t, S, c) {
      x.save(); x.translate(S / 2, S * 0.42); x.rotate(Math.sin(t * 1.5) * 0.12);
      rr(x, -S * 0.04, S * 0.2, S * 0.08, S * 0.3, S * 0.04); x.fillStyle = shade(c, -0.25); x.fill();
      x.beginPath(); x.ellipse(0, 0, S * 0.24, S * 0.28, 0, 0, TAU); x.fillStyle = shade(c, -0.1); x.fill();
      var face = function () { x.beginPath(); x.ellipse(0, 0, S * 0.2, S * 0.24, 0, 0, TAU); };
      face(); var g = x.createLinearGradient(-S * 0.2, -S * 0.24, S * 0.2, S * 0.24); g.addColorStop(0, '#e0f2fe'); g.addColorStop(1, '#bae6fd'); x.fillStyle = g; x.fill();
      shine(x, t, S, face, 1.8); x.restore();
      twinkle(x, t, S, [[0.76, 0.16, 0.06], [0.24, 0.2, 0.04], [0.8, 0.6, 0.035]], '#fff7cc'); } },
    perfume: { n: 'Perfume', c: '#a855f7', cat: 'beauty', d: function (x, t, S, c) {
      for (var i = 0; i < 7; i++) { var q = (t * 0.7 + i / 7) % 1; x.globalAlpha = (1 - q) * 0.7; x.beginPath(); x.arc(S * (0.66 + q * 0.26 + Math.sin(i) * 0.02), S * (0.3 - q * 0.12 + (i % 3 - 1) * q * 0.08), S * (0.015 + q * 0.03), 0, TAU); x.fillStyle = shade(c, 0.5); x.fill(); }
      x.globalAlpha = 1;
      rr(x, S * 0.44, S * 0.24, S * 0.12, S * 0.1, S * 0.02); x.fillStyle = '#d4a017'; x.fill();
      x.beginPath(); x.arc(S * 0.62, S * 0.27, S * 0.035, 0, TAU); x.fillStyle = '#111827'; x.fill();
      var bot = function () { rr(x, S * 0.3, S * 0.34, S * 0.4, S * 0.46, S * 0.08); };
      bot(); var g = x.createLinearGradient(S * 0.3, S * 0.34, S * 0.7, S * 0.8); g.addColorStop(0, shade(c, 0.45)); g.addColorStop(1, shade(c, -0.15)); x.fillStyle = g; x.fill();
      rr(x, S * 0.38, S * 0.5, S * 0.24, S * 0.14, S * 0.02); x.fillStyle = 'rgba(255,255,255,.75)'; x.fill();
      words(x, 'PARFUM', S * 0.5, S * 0.57, S * 0.035, 'Montserrat', shade(c, -0.4), { w: 700 });
      shine(x, t, S, bot, 2.6); } },
    heels: { n: 'High heel', c: '#be123c', cat: 'beauty', d: function (x, t, S, c) {
      var p = (t % 1.4) / 1.4, hop = p < 0.35 ? Math.sin(p / 0.35 * Math.PI) : 0;
      x.save(); x.translate(0, -hop * S * 0.08); x.translate(S * 0.5, S * 0.6); x.rotate(-hop * 0.1); x.translate(-S * 0.5, -S * 0.6);
      x.beginPath(); x.moveTo(S * 0.16, S * 0.66); x.quadraticCurveTo(S * 0.2, S * 0.5, S * 0.34, S * 0.52); x.quadraticCurveTo(S * 0.5, S * 0.56, S * 0.62, S * 0.4); x.quadraticCurveTo(S * 0.72, S * 0.3, S * 0.8, S * 0.34); x.lineTo(S * 0.82, S * 0.44); x.lineTo(S * 0.78, S * 0.44); x.lineTo(S * 0.74, S * 0.72); x.lineTo(S * 0.7, S * 0.72); x.lineTo(S * 0.7, S * 0.5); x.quadraticCurveTo(S * 0.5, S * 0.68, S * 0.3, S * 0.7); x.lineTo(S * 0.16, S * 0.7); x.closePath();
      var g = x.createLinearGradient(S * 0.16, S * 0.3, S * 0.8, S * 0.72); g.addColorStop(0, shade(c, 0.3)); g.addColorStop(1, shade(c, -0.2)); x.fillStyle = g; x.fill();
      x.beginPath(); x.moveTo(S * 0.22, S * 0.6); x.quadraticCurveTo(S * 0.4, S * 0.58, S * 0.58, S * 0.46); x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = S * 0.012; x.stroke(); x.restore();
      x.fillStyle = 'rgba(15,23,42,' + (0.15 - hop * 0.08) + ')'; x.beginPath(); x.ellipse(S * 0.48, S * 0.76, S * 0.3 * (1 - hop * 0.2), S * 0.025, 0, 0, TAU); x.fill();
      twinkle(x, t, S, [[0.85, 0.22, 0.05], [0.2, 0.32, 0.04]], '#fde68a'); } },
    bag: { n: 'Handbag', c: '#f472b6', cat: 'beauty', d: function (x, t, S, c) {
      x.save(); x.translate(S / 2, S * 0.18); x.rotate(Math.sin(t * 2.2) * 0.14);
      x.beginPath(); x.arc(0, S * 0.18, S * 0.14, Math.PI, 0); x.strokeStyle = shade(c, -0.35); x.lineWidth = S * 0.03; x.stroke();
      x.beginPath(); x.moveTo(-S * 0.26, S * 0.2); x.lineTo(S * 0.26, S * 0.2); x.lineTo(S * 0.3, S * 0.58); x.quadraticCurveTo(S * 0.3, S * 0.64, S * 0.24, S * 0.64); x.lineTo(-S * 0.24, S * 0.64); x.quadraticCurveTo(-S * 0.3, S * 0.64, -S * 0.3, S * 0.58); x.closePath();
      var g = x.createLinearGradient(0, S * 0.2, 0, S * 0.64); g.addColorStop(0, shade(c, 0.25)); g.addColorStop(1, shade(c, -0.15)); x.fillStyle = g; x.fill();
      x.beginPath(); x.moveTo(-S * 0.27, S * 0.2); x.lineTo(S * 0.27, S * 0.2); x.lineTo(0, S * 0.36); x.closePath(); x.fillStyle = shade(c, -0.12); x.fill();
      rr(x, -S * 0.04, S * 0.33, S * 0.08, S * 0.06, S * 0.015); x.fillStyle = '#d4a017'; x.fill(); x.restore();
      twinkle(x, t, S, [[0.82, 0.3, 0.05], [0.18, 0.42, 0.04]], '#fff'); } },
    ring: { n: 'Diamond ring', c: '#d4a017', cat: 'beauty', d: function (x, t, S, c) {
      var sq = Math.cos(t * 1.6), cx = S / 2, cy = S * 0.6;
      glow(x, cx, S * 0.32, S * 0.2, '#e0f2fe', 0.6);
      x.save(); x.translate(cx, cy); x.scale(Math.max(0.35, Math.abs(sq)), 1); x.beginPath(); x.arc(0, 0, S * 0.2, 0, TAU); x.arc(0, 0, S * 0.15, 0, TAU, true);
      var g = x.createLinearGradient(-S * 0.2, -S * 0.2, S * 0.2, S * 0.2); g.addColorStop(0, shade(c, 0.5)); g.addColorStop(0.5, c); g.addColorStop(1, shade(c, -0.3)); x.fillStyle = g; x.fill(); x.restore();
      x.save(); x.translate(cx, S * 0.32); var gem = function () { x.beginPath(); x.moveTo(-S * 0.1, 0); x.lineTo(-S * 0.06, -S * 0.07); x.lineTo(S * 0.06, -S * 0.07); x.lineTo(S * 0.1, 0); x.lineTo(0, S * 0.12); x.closePath(); };
      gem(); x.fillStyle = '#bae6fd'; x.fill(); x.beginPath(); x.moveTo(-S * 0.1, 0); x.lineTo(S * 0.1, 0); x.lineTo(0, S * 0.12); x.closePath(); x.fillStyle = '#7dd3fc'; x.fill(); shine(x, t, S, gem, 1.6); x.restore();
      twinkle(x, t, S, [[0.72, 0.18, 0.06], [0.28, 0.22, 0.045], [0.66, 0.36, 0.03]], '#fff'); } },
    lashes: { n: 'Wink eye', c: '#7c3aed', cat: 'beauty', d: function (x, t, S, c) {
      var p = (t % 2.5) / 2.5, open = p > 0.8 && p < 0.92 ? Math.abs(Math.cos((p - 0.8) / 0.12 * Math.PI)) : 1, cx = S / 2, cy = S * 0.52;
      x.save(); x.beginPath(); x.moveTo(cx - S * 0.32, cy); x.quadraticCurveTo(cx, cy - S * 0.3 * open, cx + S * 0.32, cy); x.quadraticCurveTo(cx, cy + S * 0.24 * open, cx - S * 0.32, cy); x.closePath(); x.fillStyle = '#ffffff'; x.fill(); x.clip();
      x.beginPath(); x.arc(cx + Math.sin(t) * S * 0.04, cy, S * 0.13, 0, TAU); var g = x.createRadialGradient(cx, cy, S * 0.02, cx, cy, S * 0.13); g.addColorStop(0, shade(c, 0.3)); g.addColorStop(1, shade(c, -0.3)); x.fillStyle = g; x.fill();
      x.beginPath(); x.arc(cx + Math.sin(t) * S * 0.04, cy, S * 0.06, 0, TAU); x.fillStyle = '#111827'; x.fill();
      x.beginPath(); x.arc(cx + Math.sin(t) * S * 0.04 + S * 0.04, cy - S * 0.04, S * 0.025, 0, TAU); x.fillStyle = '#fff'; x.fill(); x.restore();
      x.beginPath(); x.moveTo(cx - S * 0.32, cy); x.quadraticCurveTo(cx, cy - S * 0.3 * open, cx + S * 0.32, cy); x.strokeStyle = '#111827'; x.lineWidth = S * 0.025; x.lineCap = 'round'; x.stroke();
      for (var i = 0; i < 7; i++) { var q = (i + 1) / 8, lx = cx - S * 0.32 + q * S * 0.64, ly = cy - S * 0.3 * open * 2 * q * (1 - q) * 1, a = -Math.PI / 2 + (q - 0.5) * 1.6; x.beginPath(); x.moveTo(lx, ly); x.quadraticCurveTo(lx + Math.cos(a) * S * 0.06, ly + Math.sin(a) * S * 0.06 - S * 0.01, lx + Math.cos(a) * S * 0.1 + S * 0.02, ly + Math.sin(a) * S * 0.1); x.stroke(); }
      twinkle(x, t, S, [[0.82, 0.24, 0.05], [0.18, 0.74, 0.04]], '#fde68a'); } },
    // ---------- love & flowers ----------
    rose: { n: 'Red rose', c: '#e11d48', cat: 'love', d: function (x, t, S, c) {
      x.save(); x.translate(S / 2, S * 0.92); x.rotate(Math.sin(t * 1.4) * 0.07);
      x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(S * 0.03, -S * 0.25, 0, -S * 0.5); x.strokeStyle = '#15803d'; x.lineWidth = S * 0.025; x.stroke();
      [[-1, -0.22], [1, -0.32]].forEach(function (l) { x.save(); x.translate(0, l[1] * S); x.rotate(l[0] * 0.9 + Math.sin(t * 2 + l[0]) * 0.08); x.scale(l[0], 1); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(S * 0.08, -S * 0.06, S * 0.16, 0); x.quadraticCurveTo(S * 0.08, S * 0.05, 0, 0); x.fillStyle = '#22c55e'; x.fill(); x.restore(); });
      x.translate(0, -S * 0.56); var k = 1 + Math.sin(t * 2) * 0.03; x.scale(k, k);
      for (var r = 3; r >= 0; r--) for (var i = 0; i < 5; i++) { x.save(); x.rotate(i * TAU / 5 + r * 0.6 + t * 0.05); var s = S * (0.06 + r * 0.045); x.beginPath(); x.ellipse(0, -s * 0.45, s * 0.75, s * 0.6, 0, 0, TAU); x.fillStyle = shade(c, -0.25 + r * 0.12); x.fill(); x.restore(); }
      x.beginPath(); x.arc(0, 0, S * 0.04, 0, TAU); x.fillStyle = shade(c, -0.4); x.fill(); x.restore();
      for (var j = 0; j < 3; j++) { var q = (t * 0.4 + j / 3) % 1; x.globalAlpha = Math.sin(q * Math.PI); x.save(); x.translate(S * (0.25 + j * 0.25) + Math.sin(q * TAU) * S * 0.04, S * (0.1 + q * 0.7)); x.rotate(q * 6); x.beginPath(); x.ellipse(0, 0, S * 0.022, S * 0.014, 0, 0, TAU); x.fillStyle = c; x.fill(); x.restore(); }
      x.globalAlpha = 1; } },
    hballoon: { n: 'Heart balloon', c: '#f43f5e', cat: 'love', d: function (x, t, S, c) {
      var bx = S / 2 + Math.sin(t * 1.3) * S * 0.05, by = S * 0.36 + Math.sin(t * 2) * S * 0.03;
      x.beginPath(); x.moveTo(bx, by + S * 0.2); x.bezierCurveTo(bx + Math.sin(t * 3) * S * 0.06, by + S * 0.35, bx - Math.sin(t * 3) * S * 0.06, by + S * 0.45, S / 2, S * 0.95); x.strokeStyle = '#94a3b8'; x.lineWidth = S * 0.006; x.stroke();
      heart(x, bx, by + S * 0.08, S * 0.4, c); x.beginPath(); x.ellipse(bx - S * 0.1, by - S * 0.06, S * 0.05, S * 0.03, -0.6, 0, TAU); x.fillStyle = 'rgba(255,255,255,.6)'; x.fill();
      twinkle(x, t, S, [[0.2, 0.2, 0.04], [0.82, 0.26, 0.05]], '#fde68a'); } },
    letter: { n: 'Love letter', c: '#ec4899', cat: 'love', d: function (x, t, S, c) {
      var p = (t % 3) / 3, op = Math.min(1, p / 0.25), hp = p > 0.25 ? Math.min(1, (p - 0.25) / 0.3) : 0;
      var ex = S * 0.18, ey = S * 0.44, ew = S * 0.64, eh = S * 0.4;
      x.fillStyle = shade(c, 0.6); x.fillRect(ex, ey, ew, eh);
      if (hp > 0) { var hy = ey + S * 0.1 - back(hp) * S * 0.26; heart(x, S / 2, hy, S * 0.24, c); }
      x.beginPath(); x.moveTo(ex, ey); x.lineTo(S / 2, ey + eh * 0.55); x.lineTo(ex + ew, ey); x.lineTo(ex + ew, ey + eh); x.lineTo(ex, ey + eh); x.closePath(); x.fillStyle = shade(c, 0.45); x.fill();
      x.beginPath(); x.moveTo(ex, ey + eh); x.lineTo(S / 2, ey + eh * 0.45); x.lineTo(ex + ew, ey + eh); x.strokeStyle = shade(c, 0.2); x.lineWidth = S * 0.006; x.stroke();
      x.beginPath(); x.moveTo(ex, ey); x.lineTo(S / 2, ey + (1 - 2 * op) * eh * 0.5); x.lineTo(ex + ew, ey); x.closePath(); x.fillStyle = shade(c, 0.3); x.fill();
      twinkle(x, t, S, [[0.16, 0.28, 0.04], [0.86, 0.3, 0.05]], '#fde68a'); } },
    tulips: { n: 'Tulips', c: '#f472b6', cat: 'love', d: function (x, t, S, c) {
      [[0.3, '#f472b6', 0.62, 0], [0.5, c, 0.5, 1], [0.7, '#fb923c', 0.6, 2]].forEach(function (f) {
        x.save(); x.translate(f[0] * S, S * 0.95); x.rotate(Math.sin(t * 1.5 + f[3]) * 0.08 + (f[0] - 0.5) * 0.3);
        x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -S * (0.95 - f[2])); x.strokeStyle = '#16a34a'; x.lineWidth = S * 0.018; x.stroke();
        x.beginPath(); x.moveTo(0, -S * 0.08); x.quadraticCurveTo(S * 0.1, -S * 0.2, S * 0.04, -S * 0.3); x.quadraticCurveTo(S * 0.02, -S * 0.16, 0, -S * 0.1); x.fillStyle = '#22c55e'; x.fill();
        x.translate(0, -S * (0.95 - f[2]));
        x.beginPath(); x.moveTo(-S * 0.07, 0); x.quadraticCurveTo(-S * 0.08, -S * 0.12, -S * 0.04, -S * 0.15); x.lineTo(-S * 0.02, -S * 0.09); x.lineTo(0, -S * 0.16); x.lineTo(S * 0.02, -S * 0.09); x.lineTo(S * 0.04, -S * 0.15); x.quadraticCurveTo(S * 0.08, -S * 0.12, S * 0.07, 0); x.quadraticCurveTo(0, S * 0.04, -S * 0.07, 0); x.fillStyle = f[1]; x.fill(); x.restore(); }); } },
    sunflower: { n: 'Sunflower', c: '#facc15', cat: 'love', d: function (x, t, S, c) {
      x.save(); x.translate(S / 2, S / 2); x.rotate(t * 0.4);
      for (var r = 0; r < 2; r++) for (var i = 0; i < 16; i++) { x.save(); x.rotate(i * TAU / 16 + r * TAU / 32); petal(x, S * (0.4 - r * 0.04), S * 0.07); x.fillStyle = r ? shade(c, -0.12) : c; x.fill(); x.restore(); }
      x.beginPath(); x.arc(0, 0, S * 0.16, 0, TAU); x.fillStyle = '#78350f'; x.fill();
      for (var j = 0; j < 40; j++) { var a = j * 2.399, d = Math.sqrt(j / 40) * S * 0.14; x.beginPath(); x.arc(Math.cos(a) * d, Math.sin(a) * d, S * 0.01, 0, TAU); x.fillStyle = '#a16207'; x.fill(); }
      x.restore(); } },
    hring: { n: 'Ring of hearts', c: '#fb7185', cat: 'love', d: function (x, t, S, c) {
      for (var i = 0; i < 10; i++) { var a = i * TAU / 10 + t * 0.6, k = 0.7 + 0.3 * Math.sin(t * 4 + i); heart(x, S / 2 + Math.cos(a) * S * 0.32, S / 2 + Math.sin(a) * S * 0.32 + S * 0.03, S * 0.1 * k, i % 2 ? c : shade(c, 0.35)); }
      heart(x, S / 2, S * 0.56, S * 0.26 * (1 + Math.max(0, Math.sin(t * TAU)) * 0.08), shade(c, -0.1)); } },
    cupcake: { n: 'Cupcake', c: '#f9a8d4', cat: 'love', d: function (x, t, S, c) {
      var b = Math.abs(Math.sin(t * 3)) * S * 0.03;
      x.beginPath(); x.moveTo(S * 0.26, S * 0.56); x.lineTo(S * 0.74, S * 0.56); x.lineTo(S * 0.68, S * 0.86); x.lineTo(S * 0.32, S * 0.86); x.closePath(); x.fillStyle = '#fbbf24'; x.fill();
      x.strokeStyle = '#d97706'; x.lineWidth = S * 0.008; for (var i = 1; i < 6; i++) { x.beginPath(); x.moveTo(S * (0.26 + i * 0.08), S * 0.56); x.lineTo(S * (0.32 + i * 0.06), S * 0.86); x.stroke(); }
      x.save(); x.translate(0, -b);
      [[0.5, 0.52, 0.26], [0.5, 0.42, 0.2], [0.5, 0.33, 0.13]].forEach(function (q, k) { x.beginPath(); x.ellipse(q[0] * S, q[1] * S, q[2] * S, S * 0.08, 0, 0, TAU); x.fillStyle = k % 2 ? shade(c, 0.2) : c; x.fill(); });
      var cols = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7'];
      for (var j = 0; j < 14; j++) { x.save(); x.translate(S * (0.32 + rnd(j) * 0.36), S * (0.36 + rnd(j + 9) * 0.18)); x.rotate(rnd(j + 3) * 3); x.fillStyle = cols[j % 5]; x.fillRect(-S * 0.012, -S * 0.004, S * 0.024, S * 0.008); x.restore(); }
      x.beginPath(); x.arc(S * 0.5, S * 0.22, S * 0.05, 0, TAU); x.fillStyle = '#dc2626'; x.fill(); x.beginPath(); x.moveTo(S * 0.5, S * 0.18); x.quadraticCurveTo(S * 0.52, S * 0.1, S * 0.58, S * 0.08); x.strokeStyle = '#15803d'; x.lineWidth = S * 0.01; x.stroke();
      x.beginPath(); x.arc(S * 0.485, S * 0.205, S * 0.014, 0, TAU); x.fillStyle = 'rgba(255,255,255,.7)'; x.fill(); x.restore(); } },
    hframe: { n: 'Heart frame', c: '#ec4899', cat: 'love', d: function (x, t, S, c) {
      x.save(); x.translate(S / 2, S * 0.54); var k = 1 + Math.sin(t * 2) * 0.03; x.scale(k, k);
      x.beginPath(); x.moveTo(0, S * 0.3); x.bezierCurveTo(-S * 0.75, -S * 0.2, -S * 0.38, -S * 0.8, 0, -S * 0.36); x.bezierCurveTo(S * 0.38, -S * 0.8, S * 0.75, -S * 0.2, 0, S * 0.3); x.closePath();
      x.lineWidth = S * 0.03; x.strokeStyle = c; x.setLineDash([S * 0.05, S * 0.03]); x.lineDashOffset = -t * S * 0.12; x.stroke(); x.setLineDash([]); x.restore();
      twinkle(x, t, S, [[0.18, 0.2, 0.05], [0.82, 0.2, 0.05], [0.5, 0.92, 0.04], [0.86, 0.62, 0.035], [0.14, 0.62, 0.035]], shade(c, 0.3)); } },
    // ---------- daily ----------
    coffee: { n: 'Hot coffee', c: '#92400e', cat: 'daily', d: function (x, t, S, c) {
      for (var i = 0; i < 3; i++) { var ph = t * 1.6 + i * 2; x.beginPath(); for (var k = 0; k <= 20; k++) { var q = k / 20, yy = S * (0.42 - q * 0.3), xx = S * (0.38 + i * 0.12) + Math.sin(ph + q * 6) * S * 0.03; if (k) x.lineTo(xx, yy); else x.moveTo(xx, yy); } x.strokeStyle = 'rgba(148,163,184,' + (0.45 + 0.2 * Math.sin(ph)) + ')'; x.lineWidth = S * 0.02; x.lineCap = 'round'; x.stroke(); }
      x.beginPath(); x.arc(S * 0.74, S * 0.6, S * 0.08, -Math.PI / 2, Math.PI / 2); x.strokeStyle = '#f8fafc'; x.lineWidth = S * 0.035; x.stroke();
      x.beginPath(); x.moveTo(S * 0.24, S * 0.46); x.lineTo(S * 0.76, S * 0.46); x.quadraticCurveTo(S * 0.74, S * 0.84, S * 0.5, S * 0.84); x.quadraticCurveTo(S * 0.26, S * 0.84, S * 0.24, S * 0.46); x.fillStyle = '#f8fafc'; x.fill();
      x.beginPath(); x.ellipse(S * 0.5, S * 0.47, S * 0.24, S * 0.04, 0, 0, TAU); x.fillStyle = c; x.fill();
      x.beginPath(); x.ellipse(S * 0.5, S * 0.88, S * 0.32, S * 0.04, 0, 0, TAU); x.fillStyle = '#e2e8f0'; x.fill();
      heart(x, S * 0.5, S * 0.66, S * 0.08, '#f472b6'); } },
    clock: { n: 'Ticking clock', c: '#0ea5e9', cat: 'daily', d: function (x, t, S, c) {
      var sh = Math.sin(t * 20) * 0.03 * (Math.floor(t) % 4 === 0 ? 1 : 0); x.save(); x.translate(S / 2, S / 2); x.rotate(sh);
      [-1, 1].forEach(function (sd) { x.beginPath(); x.arc(sd * S * 0.2, -S * 0.3, S * 0.09, 0, TAU); x.fillStyle = shade(c, -0.2); x.fill(); });
      x.beginPath(); x.arc(0, 0, S * 0.32, 0, TAU); x.fillStyle = c; x.fill(); x.beginPath(); x.arc(0, 0, S * 0.26, 0, TAU); x.fillStyle = '#fff'; x.fill();
      for (var i = 0; i < 12; i++) { var a = i * TAU / 12; x.beginPath(); x.arc(Math.cos(a) * S * 0.21, Math.sin(a) * S * 0.21, S * (i % 3 ? 0.008 : 0.015), 0, TAU); x.fillStyle = '#334155'; x.fill(); }
      var sec = Math.floor(t * 2) / 2, a1 = sec * TAU / 6 - Math.PI / 2, a2 = t * 0.2 - Math.PI / 2;
      x.lineCap = 'round'; x.strokeStyle = '#0f172a'; x.lineWidth = S * 0.02; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a2) * S * 0.12, Math.sin(a2) * S * 0.12); x.stroke();
      x.strokeStyle = '#ef4444'; x.lineWidth = S * 0.01; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a1) * S * 0.2, Math.sin(a1) * S * 0.2); x.stroke();
      x.beginPath(); x.arc(0, 0, S * 0.02, 0, TAU); x.fillStyle = '#0f172a'; x.fill(); x.restore(); } },
    rain: { n: 'Rain cloud', c: '#60a5fa', cat: 'daily', d: function (x, t, S, c) {
      for (var i = 0; i < 14; i++) { var q = (t * 1.4 + rnd(i)) % 1, dx = S * (0.24 + rnd(i + 5) * 0.52), dy = S * (0.5 + q * 0.45); x.globalAlpha = 1 - q * 0.6; x.beginPath(); x.moveTo(dx, dy); x.quadraticCurveTo(dx + S * 0.018, dy + S * 0.03, dx, dy + S * 0.04); x.quadraticCurveTo(dx - S * 0.018, dy + S * 0.03, dx, dy); x.fillStyle = c; x.fill(); }
      x.globalAlpha = 1; var bob = Math.sin(t * 1.5) * S * 0.015;
      [[0.36, 0.42, 0.13], [0.52, 0.34, 0.16], [0.68, 0.42, 0.12], [0.5, 0.46, 0.14]].forEach(function (b) { x.beginPath(); x.arc(b[0] * S, b[1] * S + bob, b[2] * S, 0, TAU); x.fillStyle = '#cbd5e1'; x.fill(); });
      [[0.36, 0.4, 0.11], [0.52, 0.32, 0.14], [0.68, 0.4, 0.1]].forEach(function (b) { x.beginPath(); x.arc(b[0] * S, b[1] * S + bob, b[2] * S, 0, TAU); x.fillStyle = '#e2e8f0'; x.fill(); }); } },
    shoot: { n: 'Shooting star', c: '#facc15', cat: 'daily', d: function (x, t, S, c) {
      var p = (t % 2.2) / 2.2, hx = S * (0.1 + p * 0.85), hy = S * (0.75 - p * 0.55);
      var g = x.createLinearGradient(hx - S * 0.4, hy + S * 0.26, hx, hy); g.addColorStop(0, hex(c, 0)); g.addColorStop(1, hex(c, 0.9));
      x.beginPath(); x.moveTo(hx - S * 0.4, hy + S * 0.26); x.lineTo(hx, hy - S * 0.03); x.lineTo(hx, hy + S * 0.03); x.closePath(); x.fillStyle = g; x.fill();
      glow(x, hx, hy, S * 0.12, c, 0.6);
      x.save(); x.translate(hx, hy); x.rotate(t * 3); x.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? S * 0.03 : S * 0.07; x[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fillStyle = '#fff7cc'; x.fill(); x.restore();
      twinkle(x, t, S, [[0.2, 0.2, 0.03], [0.8, 0.8, 0.03], [0.62, 0.14, 0.025]], '#fff'); } },
    done: { n: 'Done tick', c: '#22c55e', cat: 'daily', d: function (x, t, S, c) {
      var p = (t % 2.2) / 2.2, a = Math.min(1, p / 0.35), k = Math.min(1, Math.max(0, (p - 0.3) / 0.25));
      x.beginPath(); x.arc(S / 2, S / 2, S * 0.32, -Math.PI / 2, -Math.PI / 2 + TAU * ease(a)); x.strokeStyle = c; x.lineWidth = S * 0.05; x.lineCap = 'round'; x.stroke();
      if (a >= 1) { x.beginPath(); x.arc(S / 2, S / 2, S * 0.27 * back(Math.min(1, k * 1.2)), 0, TAU); x.fillStyle = hex(c, 0.15); x.fill(); }
      if (k > 0) { x.beginPath(); x.moveTo(S * 0.36, S * 0.5); var mx = S * 0.46, my = S * 0.6; if (k < 0.5) x.lineTo(S * 0.36 + (mx - S * 0.36) * k * 2, S * 0.5 + (my - S * 0.5) * k * 2); else { x.lineTo(mx, my); x.lineTo(mx + (S * 0.66 - mx) * (k - 0.5) * 2, my + (S * 0.38 - my) * (k - 0.5) * 2); } x.strokeStyle = c; x.lineWidth = S * 0.06; x.lineJoin = 'round'; x.stroke(); } } },
    phone: { n: 'Phone ringing', c: '#6366f1', cat: 'daily', d: function (x, t, S, c) {
      var p = (t % 1.5) / 1.5, sh = p < 0.5 ? Math.sin(p * 60) * 0.12 : 0;
      x.save(); x.translate(S / 2, S / 2); x.rotate(sh); rr(x, -S * 0.15, -S * 0.28, S * 0.3, S * 0.56, S * 0.05); x.fillStyle = '#111827'; x.fill();
      rr(x, -S * 0.13, -S * 0.24, S * 0.26, S * 0.46, S * 0.03); var g = x.createLinearGradient(0, -S * 0.24, 0, S * 0.22); g.addColorStop(0, shade(c, 0.3)); g.addColorStop(1, c); x.fillStyle = g; x.fill();
      heart(x, 0, -S * 0.02, S * 0.12, '#fff'); x.restore();
      if (p < 0.5) { x.strokeStyle = c; x.lineWidth = S * 0.018; x.lineCap = 'round'; [0.22, 0.3].forEach(function (r) { [-1, 1].forEach(function (sd) { x.beginPath(); x.arc(S / 2, S / 2, S * r, sd < 0 ? Math.PI * 0.85 : -Math.PI * 0.15, sd < 0 ? Math.PI * 1.15 : Math.PI * 0.15); x.stroke(); }); }); } } },
    pin: { n: 'Location pin', c: '#ef4444', cat: 'daily', d: function (x, t, S, c) {
      var p = (t % 1.2) / 1.2, hop = Math.abs(Math.sin(p * Math.PI)) * S * 0.12;
      x.fillStyle = 'rgba(15,23,42,' + (0.2 - hop / S) + ')'; x.beginPath(); x.ellipse(S / 2, S * 0.84, S * (0.12 - hop / S * 0.3), S * 0.03, 0, 0, TAU); x.fill();
      x.save(); x.translate(S / 2, S * 0.8 - hop); x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-S * 0.08, -S * 0.12, -S * 0.2, -S * 0.22, -S * 0.2, -S * 0.36); x.arc(0, -S * 0.36, S * 0.2, Math.PI, 0); x.bezierCurveTo(S * 0.2, -S * 0.22, S * 0.08, -S * 0.12, 0, 0); var g = x.createLinearGradient(-S * 0.2, -S * 0.56, S * 0.2, 0); g.addColorStop(0, shade(c, 0.3)); g.addColorStop(1, shade(c, -0.2)); x.fillStyle = g; x.fill();
      x.beginPath(); x.arc(0, -S * 0.36, S * 0.08, 0, TAU); x.fillStyle = '#fff'; x.fill(); x.restore(); } },
    typing: { n: 'Typing…', c: '#8b5cf6', cat: 'daily', d: function (x, t, S, c) {
      rr(x, S * 0.16, S * 0.3, S * 0.68, S * 0.34, S * 0.17); x.fillStyle = c; x.fill();
      x.beginPath(); x.moveTo(S * 0.26, S * 0.6); x.lineTo(S * 0.2, S * 0.74); x.lineTo(S * 0.38, S * 0.63); x.fill();
      for (var i = 0; i < 3; i++) { var b = Math.max(0, Math.sin(t * 6 - i * 0.9)); x.beginPath(); x.arc(S * (0.36 + i * 0.14), S * 0.47 - b * S * 0.05, S * 0.045, 0, TAU); x.fillStyle = 'rgba(255,255,255,' + (0.55 + b * 0.45) + ')'; x.fill(); } } },
    // ---------- festival & wishes ----------
    eid: { n: 'Eid Mubarak', c: '#059669', cat: 'wish2', d: function (x, t, S, c) {
      glow(x, S * 0.5, S * 0.3, S * 0.26, '#fde68a', 0.5);
      x.save(); x.beginPath(); x.arc(S * 0.5, S * 0.3, S * 0.17, 0, TAU); x.fillStyle = '#facc15'; x.fill(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(S * 0.58, S * 0.25, S * 0.15, 0, TAU); x.fill(); x.restore();
      [[0.68, 0.18], [0.3, 0.12], [0.78, 0.4]].forEach(function (q, i) { spark(x, q[0] * S, q[1] * S, S * 0.035 * (0.5 + 0.5 * Math.sin(t * 3 + i * 2)), '#fde68a'); });
      [0.2, 0.8].forEach(function (lx, i) { var sw = Math.sin(t * 2 + i) * 0.12; x.save(); x.translate(lx * S, 0); x.rotate(sw); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, S * 0.2); x.strokeStyle = '#d4a017'; x.lineWidth = S * 0.006; x.stroke(); rr(x, -S * 0.04, S * 0.2, S * 0.08, S * 0.12, S * 0.02); x.fillStyle = '#d4a017'; x.fill(); glow(x, 0, S * 0.26, S * 0.06, '#fde68a', 0.7); x.restore(); });
      words(x, 'Eid Mubarak', S / 2, S * 0.72, S * 0.12, 'Kaushan Script', c, { stroke: '#ffffff', sw: S * 0.025 }); } },
    newyear: { n: 'Happy New Year', c: '#7c3aed', cat: 'wish2', d: function (x, t, S, c) {
      K.fireworks.d(x, t, S, '#f59e0b');
      var k = 1 + Math.sin(t * 3) * 0.04; x.save(); x.translate(S / 2, S * 0.62); x.scale(k, k);
      words(x, 'Happy', 0, -S * 0.1, S * 0.1, 'Lobster', c, { stroke: '#ffffff', sw: S * 0.02 });
      words(x, 'New Year', 0, S * 0.04, S * 0.13, 'Lobster', shade(c, -0.15), { stroke: '#ffffff', sw: S * 0.022 }); x.restore(); } },
    anniv: { n: 'Happy Anniversary', c: '#be123c', cat: 'wish2', d: function (x, t, S, c) {
      [[0.42, 0], [0.58, 1]].forEach(function (q) { x.save(); x.translate(q[0] * S, S * 0.3); x.rotate((q[1] ? 1 : -1) * (0.3 + Math.sin(t * 2) * 0.05)); x.beginPath(); x.arc(0, 0, S * 0.1, 0, TAU); x.arc(0, 0, S * 0.08, 0, TAU, true); x.fillStyle = '#d4a017'; x.fill(); x.restore(); });
      spark(x, S * 0.5, S * 0.16, S * 0.04 * Math.abs(Math.sin(t * 3)), '#fff7cc');
      words(x, 'Happy', S / 2, S * 0.56, S * 0.1, 'Great Vibes', c, { stroke: '#ffffff', sw: S * 0.02 });
      words(x, 'Anniversary', S / 2, S * 0.72, S * 0.12, 'Great Vibes', shade(c, -0.1), { stroke: '#ffffff', sw: S * 0.02 });
      for (var i = 0; i < 3; i++) { var q = (t * 0.5 + i / 3) % 1; x.globalAlpha = Math.sin(q * Math.PI); heart(x, S * (0.2 + i * 0.3), S * (0.95 - q * 0.2), S * 0.05, c); } x.globalAlpha = 1; } },
    luck: { n: 'Best of Luck', c: '#16a34a', cat: 'wish2', d: function (x, t, S, c) {
      x.save(); x.translate(S / 2, S * 0.3); x.rotate(Math.sin(t * 1.5) * 0.15);
      for (var i = 0; i < 4; i++) { x.save(); x.rotate(i * Math.PI / 2 + Math.PI / 4); heart(x, 0, -S * 0.09, S * 0.13, c); x.restore(); }
      x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(S * 0.04, S * 0.12, S * 0.1, S * 0.18); x.strokeStyle = shade(c, -0.3); x.lineWidth = S * 0.015; x.stroke(); x.restore();
      twinkle(x, t, S, [[0.24, 0.2, 0.04], [0.76, 0.22, 0.045]], '#facc15');
      words(x, 'Best of Luck!', S / 2, S * 0.72, S * 0.11, 'Kaushan Script', shade(c, -0.2), { stroke: '#ffffff', sw: S * 0.022 }); } },
    getwell: { n: 'Get Well Soon', c: '#0ea5e9', cat: 'wish2', d: function (x, t, S, c) {
      var b = Math.sin(t * 2) * S * 0.02; x.save(); x.translate(S / 2, S * 0.32 + b); x.rotate(-0.6);
      rr(x, -S * 0.2, -S * 0.07, S * 0.4, S * 0.14, S * 0.07); x.fillStyle = '#fcd34d'; x.fill(); rr(x, -S * 0.07, -S * 0.07, S * 0.14, S * 0.14, S * 0.02); x.fillStyle = '#fde68a'; x.fill();
      for (var i = 0; i < 4; i++) { x.beginPath(); x.arc(-S * 0.03 + (i % 2) * S * 0.06, -S * 0.03 + Math.floor(i / 2) * S * 0.06, S * 0.008, 0, TAU); x.fillStyle = '#d97706'; x.fill(); } x.restore();
      heart(x, S * 0.76, S * 0.2 + b, S * 0.08, '#f43f5e');
      words(x, 'Get Well Soon', S / 2, S * 0.7, S * 0.11, 'Pacifico', c, { stroke: '#ffffff', sw: S * 0.022 }); } },
    xmas: { n: 'Merry Christmas', c: '#dc2626', cat: 'wish2', d: function (x, t, S, c) {
      x.save(); x.translate(S / 2, S * 0.08); [[0.2, 0.16], [0.28, 0.26], [0.36, 0.36]].forEach(function (q, i) { x.beginPath(); x.moveTo(0, i * S * 0.08); x.lineTo(-q[0] * S, q[1] * S + i * S * 0.05); x.lineTo(q[0] * S, q[1] * S + i * S * 0.05); x.closePath(); x.fillStyle = i % 2 ? '#15803d' : '#16a34a'; x.fill(); });
      rr(x, -S * 0.04, S * 0.46, S * 0.08, S * 0.08, S * 0.01); x.fillStyle = '#92400e'; x.fill();
      var cols = ['#facc15', '#ef4444', '#38bdf8', '#f472b6'];
      [[-0.1, 0.2], [0.08, 0.26], [-0.16, 0.34], [0.14, 0.4], [0, 0.32], [-0.04, 0.44], [0.2, 0.46]].forEach(function (q, i) { var on = Math.sin(t * 4 + i * 1.3) > 0; x.beginPath(); x.arc(q[0] * S, q[1] * S, S * 0.018, 0, TAU); x.fillStyle = on ? cols[i % 4] : shade(cols[i % 4], -0.4); x.fill(); if (on) glow(x, q[0] * S, q[1] * S, S * 0.04, cols[i % 4], 0.5); });
      x.beginPath(); for (var j = 0; j < 10; j++) { var a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? S * 0.025 : S * 0.055; x[j ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fillStyle = '#facc15'; x.fill(); x.restore();
      words(x, 'Merry Christmas', S / 2, S * 0.78, S * 0.1, 'Lobster', c, { stroke: '#ffffff', sw: S * 0.022 }); } },
    nobo: { n: 'শুভ নববর্ষ', c: '#ea580c', cat: 'wish2', d: function (x, t, S, c) {
      x.save(); x.translate(S / 2, S * 0.3); x.rotate(t * 0.3); for (var i = 0; i < 12; i++) { x.save(); x.rotate(i * TAU / 12); petal(x, S * 0.16, S * 0.05); x.fillStyle = i % 2 ? '#facc15' : c; x.fill(); x.restore(); } x.beginPath(); x.arc(0, 0, S * 0.05, 0, TAU); x.fillStyle = '#dc2626'; x.fill(); x.restore();
      var k = 1 + Math.sin(t * 3) * 0.04; x.save(); x.translate(S / 2, S * 0.68); x.scale(k, k);
      words(x, 'শুভ নববর্ষ', 0, 0, S * 0.13, 'Galada', shade(c, -0.15), { stroke: '#ffffff', sw: S * 0.025 }); x.restore();
      twinkle(x, t, S, [[0.16, 0.5, 0.04], [0.84, 0.5, 0.04]], '#facc15'); } },
    bijoya: { n: 'শুভ বিজয়া', c: '#b91c1c', cat: 'wish2', d: function (x, t, S, c) {
      glow(x, S / 2, S * 0.3, S * 0.22, '#fbbf24', 0.45);
      var fl = 1 + Math.sin(t * 11) * 0.08; x.save(); x.translate(S / 2, S * 0.36); x.beginPath(); x.moveTo(-S * 0.14, 0); x.quadraticCurveTo(0, S * 0.16, S * 0.14, 0); x.closePath(); x.fillStyle = '#c2410c'; x.fill();
      x.scale(1, fl); x.beginPath(); x.moveTo(0, -S * 0.16); x.bezierCurveTo(S * 0.06, -S * 0.08, S * 0.04, 0, 0, 0); x.bezierCurveTo(-S * 0.04, 0, -S * 0.06, -S * 0.08, 0, -S * 0.16); x.fillStyle = '#fbbf24'; x.fill(); x.restore();
      words(x, 'শুভ বিজয়া', S / 2, S * 0.7, S * 0.13, 'Galada', c, { stroke: '#fff7ed', sw: S * 0.025 });
      twinkle(x, t, S, [[0.2, 0.22, 0.04], [0.8, 0.22, 0.04]], '#facc15'); } }
  };
  Object.keys(ADD).forEach(function (k) { K[k] = ADD[k]; });
  var NEWCATS = [['💄 Beauty', 'beauty'], ['🌹 Love & flowers', 'love'], ['☕ Daily', 'daily'], ['🎊 Festivals', 'wish2']];
  var FONTS3 = ['Kaushan Script', 'Lobster', 'Galada', 'Montserrat'], S = null, warmed = false;
  function warm() { if (warmed || !S) return; warmed = true; FONTS3.forEach(function (f) { S.needFont(f); }); var go = function () { if (document.fonts && document.fonts.load) FONTS3.forEach(function (f) { document.fonts.load('400 40px "' + f + '"', 'Aaশুভ').catch(function () {}); }); }; setTimeout(go, 600); setTimeout(go, 2500); }
  var baseInstall = Pro.install;
  Pro.install = function (studio) {
    baseInstall(studio); S = studio;
    var prevEls = S.elsHook; S.elsHook = function (panel) {
      if (prevEls) prevEls(panel);
      var chips = panel.querySelector('.sx-drawn .st-chips'); if (!chips || chips.querySelector('[data-dcat="beauty"]')) return;
      chips.insertAdjacentHTML('beforeend', NEWCATS.map(function (c) { return '<button class="st-chip" data-dcat="' + c[1] + '" aria-pressed="false">' + c[0] + '</button>'; }).join(''));
      warm();
    };
    var load = F.AnimSticker.prototype.load; F.AnimSticker.prototype.load = function () { if (this.kind && ADD[this.kind]) warm(); return load.apply(this, arguments); };
  };
})();
