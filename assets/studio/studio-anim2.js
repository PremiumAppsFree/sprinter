/* S Printer — Editing Tool S, part 5: original animated stickers drawn by S Printer
 * (hearts, sparkles, butterflies, flowers, glitter, festive and shop stickers, and animated wishes text).
 * They plug into the animated sticker object from studio-anim.js, so they move on the page, in Play
 * and in MP4 / GIF downloads, and their colour can be changed. Original code and artwork by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, F = window.fabric, Pro = ST && ST.Pro;
  if (!Pro || !F || !F.AnimSticker) return;
  var TAU = Math.PI * 2;
  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function back(x) { var c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function hex(c, a) { var k = new F.Color(c); if (a != null) k.setAlpha(a); return k.toRgba(); }
  function shade(c, p) { var s = new F.Color(c).getSource(), f = function (v) { return Math.max(0, Math.min(255, Math.round(p < 0 ? v * (1 + p) : v + (255 - v) * p))); }; return 'rgb(' + f(s[0]) + ',' + f(s[1]) + ',' + f(s[2]) + ')'; }
  // ----- shapes -----
  function heart(x, ctx, cx, cy, s) { ctx.beginPath(); ctx.moveTo(cx, cy + s * 0.35); ctx.bezierCurveTo(cx - s * 0.9, cy - s * 0.25, cx - s * 0.45, cy - s * 0.95, cx, cy - s * 0.45); ctx.bezierCurveTo(cx + s * 0.45, cy - s * 0.95, cx + s * 0.9, cy - s * 0.25, cx, cy + s * 0.35); ctx.closePath(); }
  function fillHeart(ctx, cx, cy, s, c) {
    var g = ctx.createLinearGradient(cx - s, cy - s, cx + s, cy + s); g.addColorStop(0, shade(c, 0.35)); g.addColorStop(1, shade(c, -0.15));
    heart(0, ctx, cx, cy, s); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx - s * 0.3, cy - s * 0.42, s * 0.14, s * 0.08, -0.6, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.fill();
  }
  function sparkle(ctx, cx, cy, r, c) { ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.quadraticCurveTo(cx + r * 0.12, cy - r * 0.12, cx + r, cy); ctx.quadraticCurveTo(cx + r * 0.12, cy + r * 0.12, cx, cy + r); ctx.quadraticCurveTo(cx - r * 0.12, cy + r * 0.12, cx - r, cy); ctx.quadraticCurveTo(cx - r * 0.12, cy - r * 0.12, cx, cy - r); ctx.fillStyle = c; ctx.fill(); }
  function star5(ctx, cx, cy, r, rot, c) { ctx.beginPath(); for (var i = 0; i < 10; i++) { var a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = c; ctx.fill(); }
  function glow(ctx, cx, cy, r, c, a) { var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, hex(c, a)); g.addColorStop(1, hex(c, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); }
  function petal(ctx, len, wid) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(wid, -len * 0.3, wid * 0.8, -len * 0.9, 0, -len); ctx.bezierCurveTo(-wid * 0.8, -len * 0.9, -wid, -len * 0.3, 0, 0); }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function words(ctx, txt, cx, cy, size, font, c, opt) {
    opt = opt || {}; ctx.save(); ctx.font = (opt.w || 700) + ' ' + size + 'px "' + font + '", cursive, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (opt.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = opt.sw || size * 0.16; ctx.strokeStyle = opt.stroke; ctx.strokeText(txt, cx, cy); }
    if (opt.shadow) { ctx.shadowColor = opt.shadow; ctx.shadowBlur = size * 0.25; }
    ctx.fillStyle = c; ctx.fillText(txt, cx, cy); ctx.restore();
  }
  function bounceText(ctx, txt, cx, cy, size, font, c, t, opt) {
    opt = opt || {}; ctx.save(); ctx.font = (opt.w || 700) + ' ' + size + 'px "' + font + '", cursive, sans-serif'; ctx.textBaseline = 'middle';
    var chars = Array.from(txt), ws = chars.map(function (ch) { return ctx.measureText(ch).width; }), tot = ws.reduce(function (a, b) { return a + b; }, 0), x = cx - tot / 2;
    chars.forEach(function (ch, i) {
      var ph = (t * 1.2 - i * 0.07) % 1, dy = ph > 0 && ph < 0.3 ? -Math.sin(ph / 0.3 * Math.PI) * size * 0.28 : 0;
      if (opt.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.18; ctx.strokeStyle = opt.stroke; ctx.strokeText(ch, x, cy + dy); }
      ctx.fillStyle = opt.cols ? opt.cols[i % opt.cols.length] : c; ctx.fillText(ch, x, cy + dy); x += ws[i];
    });
    ctx.restore();
  }

  // ----- the stickers: d(ctx, t (seconds), S (=360 canvas), colour) -----
  var K = {
    hearts: { n: 'Floating hearts', c: '#ff4d8d', cat: 'pretty', d: function (x, t, S, c) {
      for (var i = 0; i < 9; i++) { var p = (t / 3 + rnd(i)) % 1, sx = S * (0.18 + 0.64 * rnd(i + 9)) + Math.sin(p * TAU * 1.5 + i) * S * 0.06, sy = S * (1.02 - p * 1.05), s = S * (0.07 + 0.08 * rnd(i + 3)) * (0.6 + 0.4 * Math.sin(p * Math.PI));
        x.globalAlpha = Math.min(1, Math.sin(p * Math.PI) * 1.6); fillHeart(x, sx, sy, s, i % 3 ? c : shade(c, 0.35)); }
      x.globalAlpha = 1; } },
    beat: { n: 'Beating heart', c: '#e11d48', cat: 'pretty', d: function (x, t, S, c) {
      var p = t % 1, k = 1 + (p < 0.15 ? Math.sin(p / 0.15 * Math.PI) * 0.16 : p > 0.25 && p < 0.4 ? Math.sin((p - 0.25) / 0.15 * Math.PI) * 0.1 : 0);
      glow(x, S / 2, S / 2, S * 0.5 * k, c, 0.35); fillHeart(x, S / 2, S * 0.56, S * 0.42 * k, c);
      for (var i = 0; i < 3; i++) sparkle(x, S * (0.2 + i * 0.3), S * (0.18 + (i % 2) * 0.62), S * 0.04 * (0.5 + 0.5 * Math.sin(t * 5 + i * 2)), '#fff'); } },
    sparkle: { n: 'Sparkles', c: '#f5c518', cat: 'pretty', d: function (x, t, S, c) {
      var pts = [[0.5, 0.48, 0.3], [0.24, 0.24, 0.13], [0.78, 0.26, 0.11], [0.74, 0.76, 0.15], [0.22, 0.74, 0.09], [0.5, 0.12, 0.06], [0.9, 0.52, 0.06]];
      pts.forEach(function (q, i) { var k = 0.55 + 0.45 * Math.sin(t * 4 + i * 1.7); glow(x, q[0] * S, q[1] * S, q[2] * S * 1.3 * k, c, 0.4); sparkle(x, q[0] * S, q[1] * S, q[2] * S * k, i % 2 ? '#ffffff' : c); }); } },
    glitter: { n: 'Glitter rain', c: '#f472b6', cat: 'pretty', d: function (x, t, S, c) {
      for (var i = 0; i < 40; i++) { var p = (t / 2.4 + rnd(i)) % 1, gx = S * rnd(i + 40), gy = S * p, r = S * (0.012 + 0.025 * rnd(i + 80)), tw = 0.5 + 0.5 * Math.sin(t * 8 + i);
        x.globalAlpha = tw; if (i % 3) sparkle(x, gx, gy, r * 1.6, i % 2 ? c : '#fde68a'); else { x.beginPath(); x.arc(gx, gy, r * 0.7, 0, TAU); x.fillStyle = '#ffffff'; x.fill(); } }
      x.globalAlpha = 1; } },
    butterfly: { n: 'Butterfly', c: '#a855f7', cat: 'pretty', d: function (x, t, S, c) {
      var cx = S / 2 + Math.sin(t * 1.3) * S * 0.08, cy = S / 2 + Math.sin(t * 2.6) * S * 0.06, f = 0.25 + 0.75 * Math.abs(Math.cos(t * 7));
      x.save(); x.translate(cx, cy); x.rotate(Math.sin(t * 1.3) * 0.15);
      [-1, 1].forEach(function (sd) { x.save(); x.scale(sd * f, 1);
        var g = x.createLinearGradient(0, -S * 0.3, S * 0.35, S * 0.2); g.addColorStop(0, shade(c, 0.45)); g.addColorStop(1, c);
        x.beginPath(); x.moveTo(0, -S * 0.02); x.bezierCurveTo(S * 0.18, -S * 0.36, S * 0.4, -S * 0.3, S * 0.32, -S * 0.06); x.bezierCurveTo(S * 0.28, S * 0.04, S * 0.1, S * 0.02, 0, 0); x.fillStyle = g; x.fill();
        x.beginPath(); x.moveTo(0, S * 0.01); x.bezierCurveTo(S * 0.2, S * 0.02, S * 0.28, S * 0.2, S * 0.16, S * 0.26); x.bezierCurveTo(S * 0.08, S * 0.3, S * 0.02, S * 0.14, 0, S * 0.02); x.fillStyle = shade(c, 0.2); x.fill();
        x.beginPath(); x.arc(S * 0.2, -S * 0.15, S * 0.04, 0, TAU); x.fillStyle = 'rgba(255,255,255,.7)'; x.fill(); x.restore(); });
      rr(x, -S * 0.018, -S * 0.12, S * 0.036, S * 0.3, S * 0.018); x.fillStyle = shade(c, -0.6); x.fill();
      x.strokeStyle = shade(c, -0.6); x.lineWidth = S * 0.008; x.beginPath(); x.moveTo(0, -S * 0.1); x.quadraticCurveTo(-S * 0.05, -S * 0.2, -S * 0.08, -S * 0.22); x.moveTo(0, -S * 0.1); x.quadraticCurveTo(S * 0.05, -S * 0.2, S * 0.08, -S * 0.22); x.stroke();
      x.restore(); } },
    bloom: { n: 'Blooming flower', c: '#fb7185', cat: 'pretty', d: function (x, t, S, c) {
      var p = (t % 3) / 3, open = p < 0.4 ? back(p / 0.4) : p > 0.85 ? 1 - ease((p - 0.85) / 0.15) * 0.15 : 1;
      x.save(); x.translate(S / 2, S / 2); x.rotate(t * 0.15);
      for (var ring = 0; ring < 2; ring++) for (var i = 0; i < 8; i++) { x.save(); x.rotate(i * TAU / 8 + ring * TAU / 16); x.scale(open * (ring ? 0.7 : 1), open * (ring ? 0.7 : 1));
        var g = x.createLinearGradient(0, 0, 0, -S * 0.4); g.addColorStop(0, ring ? shade(c, -0.1) : shade(c, 0.1)); g.addColorStop(1, ring ? c : shade(c, 0.55)); petal(x, S * 0.4, S * 0.13); x.fillStyle = g; x.fill(); x.restore(); }
      x.beginPath(); x.arc(0, 0, S * 0.08 * Math.max(0.3, open), 0, TAU); x.fillStyle = '#facc15'; x.fill();
      for (var d = 0; d < 8; d++) { var a = d * TAU / 8; x.beginPath(); x.arc(Math.cos(a) * S * 0.045, Math.sin(a) * S * 0.045, S * 0.01, 0, TAU); x.fillStyle = '#b45309'; x.fill(); }
      x.restore(); } },
    petals: { n: 'Falling petals', c: '#f9a8d4', cat: 'pretty', d: function (x, t, S, c) {
      for (var i = 0; i < 14; i++) { var p = (t / 4 + rnd(i)) % 1, px = S * rnd(i + 20) + Math.sin(p * TAU + i) * S * 0.08, py = S * (p * 1.2 - 0.1);
        x.save(); x.translate(px, py); x.rotate(p * TAU * 1.5 + i); x.scale(1, 0.5 + 0.5 * Math.abs(Math.sin(p * TAU * 2 + i))); petal(x, S * 0.09, S * 0.05); x.fillStyle = i % 2 ? c : shade(c, 0.35); x.fill(); x.restore(); } } },
    kiss: { n: 'Kiss', c: '#e11d48', cat: 'pretty', d: function (x, t, S, c) {
      var p = t % 1.6 / 1.6, k = p < 0.2 ? back(p / 0.2) : 1;
      x.save(); x.translate(S / 2, S * 0.48); x.scale(k, k); x.rotate(-0.15);
      x.beginPath(); x.moveTo(-S * 0.3, 0); x.bezierCurveTo(-S * 0.18, -S * 0.16, -S * 0.06, -S * 0.16, 0, -S * 0.08); x.bezierCurveTo(S * 0.06, -S * 0.16, S * 0.18, -S * 0.16, S * 0.3, 0); x.bezierCurveTo(S * 0.12, S * 0.03, -S * 0.12, S * 0.03, -S * 0.3, 0); x.fillStyle = c; x.fill();
      x.beginPath(); x.moveTo(-S * 0.3, 0); x.bezierCurveTo(-S * 0.15, S * 0.2, S * 0.15, S * 0.2, S * 0.3, 0); x.bezierCurveTo(S * 0.12, S * 0.05, -S * 0.12, S * 0.05, -S * 0.3, 0); x.fillStyle = shade(c, -0.15); x.fill();
      x.beginPath(); x.ellipse(-S * 0.08, S * 0.08, S * 0.06, S * 0.02, -0.2, 0, TAU); x.fillStyle = 'rgba(255,255,255,.45)'; x.fill(); x.restore();
      for (var i = 0; i < 3; i++) { var q = (t * 0.8 + i / 3) % 1; x.globalAlpha = 1 - q; fillHeart(x, S * (0.72 + i * 0.06), S * (0.4 - q * 0.3), S * 0.05, c); } x.globalAlpha = 1; } },
    crown: { n: 'Sparkly crown', c: '#f59e0b', cat: 'pretty', d: function (x, t, S, c) {
      var y = Math.sin(t * 2) * S * 0.03; x.save(); x.translate(0, y);
      var g = x.createLinearGradient(0, S * 0.3, 0, S * 0.7); g.addColorStop(0, shade(c, 0.45)); g.addColorStop(1, shade(c, -0.15));
      x.beginPath(); x.moveTo(S * 0.18, S * 0.66); x.lineTo(S * 0.14, S * 0.32); x.lineTo(S * 0.33, S * 0.48); x.lineTo(S * 0.5, S * 0.26); x.lineTo(S * 0.67, S * 0.48); x.lineTo(S * 0.86, S * 0.32); x.lineTo(S * 0.82, S * 0.66); x.closePath(); x.fillStyle = g; x.fill();
      rr(x, S * 0.17, S * 0.64, S * 0.66, S * 0.08, S * 0.03); x.fillStyle = shade(c, -0.2); x.fill();
      [[0.14, 0.32], [0.5, 0.26], [0.86, 0.32]].forEach(function (q) { x.beginPath(); x.arc(q[0] * S, q[1] * S, S * 0.035, 0, TAU); x.fillStyle = '#fff'; x.fill(); });
      [['#ec4899', 0.32], ['#8b5cf6', 0.5], ['#06b6d4', 0.68]].forEach(function (q) { x.beginPath(); x.arc(q[1] * S, S * 0.68, S * 0.022, 0, TAU); x.fillStyle = q[0]; x.fill(); });
      x.restore(); for (var i = 0; i < 4; i++) sparkle(x, S * [0.12, 0.88, 0.3, 0.72][i], S * [0.2, 0.18, 0.12, 0.1][i], S * 0.05 * (0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))), '#fff7cc'); } },
    bow: { n: 'Cute bow', c: '#ec4899', cat: 'pretty', d: function (x, t, S, c) {
      var w = 1 + Math.sin(t * 4) * 0.05; x.save(); x.translate(S / 2, S / 2); x.rotate(Math.sin(t * 2) * 0.08);
      [-1, 1].forEach(function (sd) { x.save(); x.scale(sd * w, 1); x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(S * 0.15, -S * 0.3, S * 0.42, -S * 0.22, S * 0.36, 0); x.bezierCurveTo(S * 0.42, S * 0.22, S * 0.15, S * 0.3, 0, 0); x.fillStyle = c; x.fill();
        x.beginPath(); x.moveTo(S * 0.04, S * 0.03); x.lineTo(S * 0.2, S * 0.38); x.lineTo(S * 0.12, S * 0.34); x.lineTo(S * 0.09, S * 0.42); x.lineTo(-S * 0.02, S * 0.05); x.fillStyle = shade(c, -0.12); x.fill();
        x.beginPath(); x.ellipse(S * 0.2, -S * 0.08, S * 0.06, S * 0.025, -0.5, 0, TAU); x.fillStyle = 'rgba(255,255,255,.5)'; x.fill(); x.restore(); });
      x.beginPath(); x.ellipse(0, 0, S * 0.07, S * 0.085, 0, 0, TAU); x.fillStyle = shade(c, -0.2); x.fill(); x.restore(); } },
    gem: { n: 'Shining diamond', c: '#38bdf8', cat: 'pretty', d: function (x, t, S, c) {
      x.save(); x.translate(S / 2, S / 2 + Math.sin(t * 2) * S * 0.02);
      var P = [[-0.32, -0.12], [-0.18, -0.28], [0.18, -0.28], [0.32, -0.12], [0, 0.32]];
      x.beginPath(); P.forEach(function (q, i) { x[i ? 'lineTo' : 'moveTo'](q[0] * S, q[1] * S); }); x.closePath(); x.fillStyle = shade(c, 0.2); x.fill();
      x.beginPath(); x.moveTo(-0.32 * S, -0.12 * S); x.lineTo(0.32 * S, -0.12 * S); x.lineTo(0, 0.32 * S); x.closePath(); x.fillStyle = c; x.fill();
      x.beginPath(); x.moveTo(-0.18 * S, -0.28 * S); x.lineTo(-0.08 * S, -0.12 * S); x.lineTo(0, -0.28 * S); x.lineTo(0.08 * S, -0.12 * S); x.lineTo(0.18 * S, -0.28 * S); x.closePath(); x.fillStyle = shade(c, 0.55); x.fill();
      x.beginPath(); x.moveTo(-0.08 * S, -0.12 * S); x.lineTo(0, 0.32 * S); x.lineTo(0.08 * S, -0.12 * S); x.closePath(); x.fillStyle = shade(c, -0.15); x.fill();
      var p = (t % 2) / 2; x.save(); x.beginPath(); P.forEach(function (q, i) { x[i ? 'lineTo' : 'moveTo'](q[0] * S, q[1] * S); }); x.closePath(); x.clip(); x.rotate(0.6); var gx = (p * 1.6 - 0.8) * S; var g = x.createLinearGradient(gx - S * 0.08, 0, gx + S * 0.08, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(-S, -S, 2 * S, 2 * S); x.restore();
      x.restore(); sparkle(x, S * 0.78, S * 0.2, S * 0.06 * Math.abs(Math.sin(t * 3)), '#fff'); sparkle(x, S * 0.2, S * 0.7, S * 0.045 * Math.abs(Math.cos(t * 3)), '#fff'); } },
    moon: { n: 'Moon & stars', c: '#fde047', cat: 'pretty', d: function (x, t, S, c) {
      glow(x, S * 0.45, S * 0.5, S * 0.4, c, 0.35);
      x.save(); x.beginPath(); x.arc(S * 0.45, S * 0.5, S * 0.26, 0, TAU); x.fillStyle = c; x.fill(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(S * 0.58, S * 0.42, S * 0.24, 0, TAU); x.fill(); x.restore();
      [[0.72, 0.2, 0.05], [0.82, 0.48, 0.035], [0.65, 0.75, 0.04], [0.2, 0.2, 0.03]].forEach(function (q, i) { star5(x, q[0] * S, q[1] * S, q[2] * S * (0.6 + 0.4 * Math.sin(t * 3 + i * 2)), t * 0.5 + i, '#fff7cc'); }); } },
    bubbles: { n: 'Bubbles', c: '#60a5fa', cat: 'pretty', d: function (x, t, S, c) {
      for (var i = 0; i < 12; i++) { var p = (t / 3.2 + rnd(i)) % 1, bx = S * (0.15 + 0.7 * rnd(i + 5)) + Math.sin(p * TAU * 2 + i) * S * 0.04, by = S * (1.05 - p * 1.1), r = S * (0.03 + 0.06 * rnd(i + 30));
        x.globalAlpha = Math.min(1, Math.sin(p * Math.PI) * 2); var g = x.createRadialGradient(bx - r * 0.3, by - r * 0.3, r * 0.1, bx, by, r); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.6, hex(c, 0.25)); g.addColorStop(1, hex(c, 0.6)); x.beginPath(); x.arc(bx, by, r, 0, TAU); x.fillStyle = g; x.fill(); }
      x.globalAlpha = 1; } },
    rainbow: { n: 'Rainbow', c: '#ffffff', cat: 'pretty', d: function (x, t, S, c) {
      var cols = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa'], p = Math.min(1, ((t % 4) / 4) / 0.35);
      x.save(); x.lineCap = 'round'; cols.forEach(function (col, i) { x.beginPath(); x.arc(S / 2, S * 0.68, S * (0.38 - i * 0.045), Math.PI, Math.PI + Math.PI * ease(p)); x.strokeStyle = col; x.lineWidth = S * 0.045; x.stroke(); }); x.restore();
      [[0.16, 0.68], [0.84, 0.68]].forEach(function (q, i) { var bob = Math.sin(t * 2 + i) * S * 0.015; x.fillStyle = c; [[0, 0, 0.08], [0.07, -0.03, 0.07], [-0.07, -0.02, 0.06], [0.03, 0.03, 0.07], [-0.04, 0.03, 0.06]].forEach(function (b) { x.beginPath(); x.arc((q[0] + b[0]) * S, (q[1] + b[1]) * S + bob, b[2] * S, 0, TAU); x.fill(); }); }); } },
    // ---------- celebrations ----------
    confetti: { n: 'Confetti', c: '#f43f5e', cat: 'party', d: function (x, t, S, c) {
      var cols = [c, '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#fb923c'];
      for (var i = 0; i < 36; i++) { var p = (t / 2.6 + rnd(i)) % 1, px = S * rnd(i + 3) + Math.sin(p * TAU + i) * S * 0.05, py = S * (p * 1.15 - 0.08);
        x.save(); x.translate(px, py); x.rotate(p * TAU * 2 + i); x.scale(1, Math.cos(p * TAU * 3 + i)); x.fillStyle = cols[i % cols.length]; if (i % 3) x.fillRect(-S * 0.02, -S * 0.008, S * 0.04, S * 0.016); else { x.beginPath(); x.arc(0, 0, S * 0.012, 0, TAU); x.fill(); } x.restore(); } } },
    balloons: { n: 'Balloons', c: '#f43f5e', cat: 'party', d: function (x, t, S, c) {
      [[0.32, '#a855f7', 0], [0.5, c, 1], [0.68, '#38bdf8', 2]].forEach(function (b) { var bx = b[0] * S + Math.sin(t * 1.5 + b[2]) * S * 0.03, by = S * 0.36 + Math.sin(t * 2 + b[2] * 2) * S * 0.04 + (b[2] === 1 ? -S * 0.06 : 0);
        x.strokeStyle = '#94a3b8'; x.lineWidth = S * 0.006; x.beginPath(); x.moveTo(bx, by + S * 0.15); x.quadraticCurveTo(bx + Math.sin(t * 3 + b[2]) * S * 0.04, by + S * 0.3, S * 0.5, S * 0.9); x.stroke();
        var g = x.createRadialGradient(bx - S * 0.04, by - S * 0.05, S * 0.01, bx, by, S * 0.15); g.addColorStop(0, shade(b[1], 0.5)); g.addColorStop(1, b[1]); x.beginPath(); x.ellipse(bx, by, S * 0.12, S * 0.15, 0, 0, TAU); x.fillStyle = g; x.fill();
        x.beginPath(); x.moveTo(bx - S * 0.02, by + S * 0.16); x.lineTo(bx + S * 0.02, by + S * 0.16); x.lineTo(bx, by + S * 0.14); x.fillStyle = b[1]; x.fill(); }); } },
    gift: { n: 'Gift box', c: '#ec4899', cat: 'party', d: function (x, t, S, c) {
      var p = (t % 2) / 2, hop = p < 0.3 ? Math.sin(p / 0.3 * Math.PI) : 0, lid = hop * S * 0.12;
      rr(x, S * 0.24, S * 0.48, S * 0.52, S * 0.36, S * 0.03); x.fillStyle = c; x.fill(); x.fillStyle = '#facc15'; x.fillRect(S * 0.46, S * 0.48, S * 0.08, S * 0.36);
      x.save(); x.translate(S / 2, S * 0.44 - lid); x.rotate(-hop * 0.15); rr(x, -S * 0.29, -S * 0.06, S * 0.58, S * 0.12, S * 0.03); x.fillStyle = shade(c, 0.12); x.fill(); x.fillStyle = '#facc15'; x.fillRect(-S * 0.04, -S * 0.06, S * 0.08, S * 0.12);
      [-1, 1].forEach(function (sd) { x.beginPath(); x.ellipse(sd * S * 0.08, -S * 0.12, S * 0.08, S * 0.05, sd * 0.5, 0, TAU); x.strokeStyle = '#facc15'; x.lineWidth = S * 0.03; x.stroke(); }); x.restore();
      if (hop > 0.1) for (var i = 0; i < 5; i++) sparkle(x, S * (0.3 + i * 0.1), S * (0.3 - hop * 0.15 - (i % 2) * 0.05), S * 0.035 * hop, i % 2 ? '#fde68a' : '#fff'); } },
    cake: { n: 'Birthday cake', c: '#f472b6', cat: 'party', d: function (x, t, S, c) {
      rr(x, S * 0.2, S * 0.56, S * 0.6, S * 0.26, S * 0.05); x.fillStyle = shade(c, -0.1); x.fill(); rr(x, S * 0.28, S * 0.38, S * 0.44, S * 0.2, S * 0.05); x.fillStyle = c; x.fill();
      x.fillStyle = '#fff'; for (var i = 0; i < 6; i++) { x.beginPath(); x.arc(S * (0.24 + i * 0.104), S * 0.57, S * 0.04, 0, Math.PI); x.fill(); }
      for (var j = 0; j < 4; j++) { x.beginPath(); x.arc(S * (0.32 + j * 0.12), S * 0.39, S * 0.035, 0, Math.PI); x.fill(); }
      [0.38, 0.5, 0.62].forEach(function (cx, k) { rr(x, cx * S - S * 0.012, S * 0.25, S * 0.024, S * 0.13, S * 0.01); x.fillStyle = ['#38bdf8', '#facc15', '#a78bfa'][k]; x.fill();
        var fl = 1 + Math.sin(t * 14 + k * 2) * 0.12, sw = Math.sin(t * 9 + k) * S * 0.006; glow(x, cx * S, S * 0.22, S * 0.06, '#fbbf24', 0.5);
        x.beginPath(); x.moveTo(cx * S + sw, S * (0.25 - 0.07 * fl)); x.quadraticCurveTo(cx * S + S * 0.025, S * 0.235, cx * S, S * 0.25); x.quadraticCurveTo(cx * S - S * 0.025, S * 0.235, cx * S + sw, S * (0.25 - 0.07 * fl)); x.fillStyle = '#f97316'; x.fill(); }); } },
    fireworks: { n: 'Fireworks', c: '#f59e0b', cat: 'party', d: function (x, t, S, c) {
      [[0.35, 0.35, 0, c], [0.68, 0.3, 0.45, '#ec4899'], [0.52, 0.62, 0.8, '#38bdf8']].forEach(function (f) { var p = ((t / 1.8) + f[2]) % 1; if (p > 0.85) return; var r = ease(Math.min(1, p / 0.6)) * S * 0.22;
        x.globalAlpha = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.25; for (var i = 0; i < 14; i++) { var a = i * TAU / 14; x.beginPath(); x.arc(f[0] * S + Math.cos(a) * r, f[1] * S + Math.sin(a) * r + p * S * 0.04, S * 0.012, 0, TAU); x.fillStyle = f[3]; x.fill(); x.beginPath(); x.moveTo(f[0] * S + Math.cos(a) * r * 0.5, f[1] * S + Math.sin(a) * r * 0.5); x.lineTo(f[0] * S + Math.cos(a) * r * 0.85, f[1] * S + Math.sin(a) * r * 0.85); x.strokeStyle = f[3]; x.lineWidth = S * 0.008; x.stroke(); } });
      x.globalAlpha = 1; } },
    diya: { n: 'Diya lamp', c: '#f97316', cat: 'party', d: function (x, t, S, c) {
      var fl = 1 + Math.sin(t * 11) * 0.08 + Math.sin(t * 17) * 0.05; glow(x, S / 2, S * 0.36, S * 0.3 * fl, '#fbbf24', 0.45);
      x.beginPath(); x.moveTo(S * 0.18, S * 0.56); x.quadraticCurveTo(S / 2, S * 0.92, S * 0.82, S * 0.56); x.quadraticCurveTo(S / 2, S * 0.64, S * 0.18, S * 0.56); var g = x.createLinearGradient(0, S * 0.56, 0, S * 0.8); g.addColorStop(0, shade(c, 0.2)); g.addColorStop(1, shade(c, -0.35)); x.fillStyle = g; x.fill();
      for (var i = 0; i < 5; i++) { x.beginPath(); x.arc(S * (0.32 + i * 0.09), S * 0.68, S * 0.014, 0, TAU); x.fillStyle = '#fde68a'; x.fill(); }
      x.save(); x.translate(S / 2, S * 0.56); x.scale(1, fl); x.rotate(Math.sin(t * 5) * 0.06); x.beginPath(); x.moveTo(0, -S * 0.26); x.bezierCurveTo(S * 0.1, -S * 0.12, S * 0.07, 0, 0, 0); x.bezierCurveTo(-S * 0.07, 0, -S * 0.1, -S * 0.12, 0, -S * 0.26); var gf = x.createLinearGradient(0, -S * 0.26, 0, 0); gf.addColorStop(0, '#fde047'); gf.addColorStop(1, '#f97316'); x.fillStyle = gf; x.fill(); x.beginPath(); x.ellipse(0, -S * 0.06, S * 0.025, S * 0.05, 0, 0, TAU); x.fillStyle = '#fffbeb'; x.fill(); x.restore(); } },
    sun: { n: 'Happy sun', c: '#facc15', cat: 'party', d: function (x, t, S, c) {
      x.save(); x.translate(S / 2, S / 2); x.rotate(t * 0.6); for (var i = 0; i < 12; i++) { x.rotate(TAU / 12); x.beginPath(); x.moveTo(-S * 0.035, -S * 0.3); x.lineTo(0, -S * 0.44); x.lineTo(S * 0.035, -S * 0.3); x.fillStyle = shade(c, -0.05); x.fill(); } x.restore();
      glow(x, S / 2, S / 2, S * 0.36, c, 0.4); x.beginPath(); x.arc(S / 2, S / 2, S * 0.24, 0, TAU); x.fillStyle = c; x.fill();
      var bl = (t % 3) > 2.85 ? 0.15 : 1; x.fillStyle = '#7c2d12'; [-1, 1].forEach(function (sd) { x.beginPath(); x.ellipse(S / 2 + sd * S * 0.08, S * 0.46, S * 0.025, S * 0.035 * bl, 0, 0, TAU); x.fill(); });
      x.beginPath(); x.arc(S / 2, S * 0.53, S * 0.08, 0.15 * Math.PI, 0.85 * Math.PI); x.strokeStyle = '#7c2d12'; x.lineWidth = S * 0.018; x.lineCap = 'round'; x.stroke();
      x.fillStyle = 'rgba(244,63,94,.35)'; [-1, 1].forEach(function (sd) { x.beginPath(); x.ellipse(S / 2 + sd * S * 0.15, S * 0.55, S * 0.04, S * 0.025, 0, 0, TAU); x.fill(); }); } },
    snow: { n: 'Snowfall', c: '#e0f2fe', cat: 'party', d: function (x, t, S, c) {
      for (var i = 0; i < 26; i++) { var p = (t / 4 + rnd(i)) % 1, sx = S * rnd(i + 11) + Math.sin(p * TAU + i) * S * 0.05, sy = S * (p * 1.1 - 0.05), r = S * (0.012 + 0.03 * rnd(i + 70));
        x.save(); x.translate(sx, sy); x.rotate(p * 4); x.strokeStyle = i % 2 ? '#ffffff' : c; x.lineWidth = Math.max(1, r * 0.25); x.lineCap = 'round'; for (var k = 0; k < 3; k++) { x.rotate(Math.PI / 3); x.beginPath(); x.moveTo(-r, 0); x.lineTo(r, 0); x.stroke(); } x.restore(); } } },
    // ---------- shop & social ----------
    sale: { n: 'SALE badge', c: '#ef4444', cat: 'shop', d: function (x, t, S, c) {
      var k = 1 + Math.sin(t * 5) * 0.05; x.save(); x.translate(S / 2, S / 2); x.rotate(t * 0.5);
      x.beginPath(); for (var i = 0; i < 32; i++) { var a = i * TAU / 32, r = i % 2 ? S * 0.37 : S * 0.43; x[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fillStyle = c; x.fill(); x.restore();
      x.save(); x.translate(S / 2, S / 2); x.scale(k, k); x.beginPath(); x.arc(0, 0, S * 0.31, 0, TAU); x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = S * 0.012; x.setLineDash([S * 0.02, S * 0.015]); x.stroke(); x.setLineDash([]);
      words(x, 'SALE', 0, -S * 0.03, S * 0.17, 'Anton', '#ffffff', { w: 400 }); words(x, 'UP TO 50% OFF', 0, S * 0.12, S * 0.05, 'Poppins', '#fff7cc', { w: 800 }); x.restore(); } },
    newb: { n: 'NEW badge', c: '#8b5cf6', cat: 'shop', d: function (x, t, S, c) {
      var p = (t % 2) / 2; x.save(); x.translate(S / 2, S / 2); x.rotate(-0.12); rr(x, -S * 0.36, -S * 0.15, S * 0.72, S * 0.3, S * 0.15); var g = x.createLinearGradient(-S * 0.36, 0, S * 0.36, 0); g.addColorStop(0, c); g.addColorStop(1, shade(c, 0.3)); x.fillStyle = g; x.fill();
      x.save(); rr(x, -S * 0.36, -S * 0.15, S * 0.72, S * 0.3, S * 0.15); x.clip(); var gx = (p * 2 - 0.6) * S; var sh = x.createLinearGradient(gx - S * 0.1, 0, gx + S * 0.1, 0); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,.7)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = sh; x.fillRect(-S, -S, 2 * S, 2 * S); x.restore();
      words(x, 'NEW', 0, S * 0.005, S * 0.17, 'Anton', '#ffffff', { w: 400 }); x.restore(); sparkle(x, S * 0.82, S * 0.3, S * 0.06 * Math.abs(Math.sin(t * 3)), '#facc15'); sparkle(x, S * 0.16, S * 0.68, S * 0.045 * Math.abs(Math.cos(t * 3)), '#facc15'); } },
    like: { n: 'Like heart pop', c: '#ef4444', cat: 'shop', d: function (x, t, S, c) {
      var p = (t % 1.8) / 1.8, k = p < 0.25 ? back(p / 0.25) * 1 : 1; glow(x, S / 2, S / 2, S * 0.42, c, 0.25 * k);
      if (p < 0.5) for (var i = 0; i < 8; i++) { var a = i * TAU / 8, r = S * (0.25 + p * 0.4); x.globalAlpha = 1 - p * 2; x.beginPath(); x.arc(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r, S * 0.022, 0, TAU); x.fillStyle = i % 2 ? '#facc15' : c; x.fill(); }
      x.globalAlpha = 1; fillHeart(x, S / 2, S * 0.56, S * 0.36 * k, c); } },
    follow: { n: 'Follow button', c: '#ec4899', cat: 'shop', d: function (x, t, S, c) {
      var p = (t % 2.4) / 2.4, pressed = p > 0.45 && p < 0.55, done = p >= 0.5;
      x.save(); x.translate(S / 2, S / 2); var k = pressed ? 0.94 : 1; x.scale(k, k); rr(x, -S * 0.38, -S * 0.11, S * 0.76, S * 0.22, S * 0.11); x.fillStyle = done ? '#e5e7eb' : c; x.fill();
      words(x, done ? 'Following ✓' : '+ Follow', 0, S * 0.005, S * 0.085, 'Poppins', done ? '#111827' : '#ffffff', { w: 700 }); x.restore();
      var hx = S * (0.85 - Math.min(1, p / 0.45) * 0.25), hy = S * (0.85 - Math.min(1, p / 0.45) * 0.25); if (p > 0.6) { hx = S * 0.6 + (p - 0.6) * S * 0.6; hy = S * 0.6 + (p - 0.6) * S * 0.6; }
      x.save(); x.translate(hx, hy); x.rotate(-0.4); x.fillStyle = '#fde4cf'; x.strokeStyle = '#7c2d12'; x.lineWidth = S * 0.008; rr(x, -S * 0.035, -S * 0.02, S * 0.07, S * 0.15, S * 0.035); x.fill(); x.stroke(); x.restore(); } },
    bell: { n: 'Subscribe bell', c: '#ef4444', cat: 'shop', d: function (x, t, S, c) {
      var p = (t % 2) / 2, ring = p < 0.4 ? Math.sin(p / 0.4 * Math.PI * 6) * (1 - p / 0.4) * 0.35 : 0;
      x.save(); x.translate(S / 2, S * 0.24); x.rotate(ring); x.beginPath(); x.moveTo(-S * 0.22, S * 0.4); x.quadraticCurveTo(-S * 0.2, S * 0.05, 0, S * 0.04); x.quadraticCurveTo(S * 0.2, S * 0.05, S * 0.22, S * 0.4); x.lineTo(S * 0.28, S * 0.46); x.lineTo(-S * 0.28, S * 0.46); x.closePath(); x.fillStyle = '#facc15'; x.fill();
      x.beginPath(); x.arc(0, S * 0.5, S * 0.06, 0, Math.PI); x.fillStyle = '#eab308'; x.fill(); x.beginPath(); x.arc(0, S * 0.03, S * 0.035, 0, TAU); x.fill(); x.restore();
      if (p < 0.4) { x.strokeStyle = '#facc15'; x.lineWidth = S * 0.015; x.lineCap = 'round'; [-1, 1].forEach(function (sd) { x.beginPath(); x.arc(S / 2, S * 0.42, S * 0.34, sd < 0 ? Math.PI * 1.1 : -Math.PI * 0.25, sd < 0 ? Math.PI * 1.25 : -Math.PI * 0.1); x.stroke(); }); }
      rr(x, S * 0.2, S * 0.78, S * 0.6, S * 0.14, S * 0.07); x.fillStyle = c; x.fill(); words(x, 'SUBSCRIBE', S / 2, S * 0.852, S * 0.06, 'Poppins', '#fff', { w: 800 }); } },
    arrow: { n: 'Tap here arrow', c: '#f97316', cat: 'shop', d: function (x, t, S, c) {
      var b = Math.abs(Math.sin(t * 4)) * S * 0.08; x.save(); x.translate(S / 2, S * 0.3 + b); x.beginPath(); x.moveTo(-S * 0.09, -S * 0.2); x.lineTo(S * 0.09, -S * 0.2); x.lineTo(S * 0.09, S * 0.02); x.lineTo(S * 0.19, S * 0.02); x.lineTo(0, S * 0.22); x.lineTo(-S * 0.19, S * 0.02); x.lineTo(-S * 0.09, S * 0.02); x.closePath(); x.fillStyle = c; x.fill(); x.restore();
      rr(x, S * 0.22, S * 0.72, S * 0.56, S * 0.14, S * 0.07); x.fillStyle = shade(c, -0.15); x.fill(); words(x, 'TAP HERE', S / 2, S * 0.792, S * 0.065, 'Poppins', '#fff', { w: 800 }); } },
    // ---------- animated wishes ----------
    hbd: { n: 'Happy Birthday', c: '#ec4899', cat: 'words', d: function (x, t, S, c) {
      var cols = [c, '#f59e0b', '#8b5cf6', '#06b6d4', '#22c55e'];
      bounceText(x, 'Happy', S / 2, S * 0.36, S * 0.17, 'Lilita One', c, t, { cols: cols, stroke: '#ffffff', w: 400 });
      bounceText(x, 'Birthday', S / 2, S * 0.58, S * 0.17, 'Lilita One', c, t + 0.4, { cols: cols.slice().reverse(), stroke: '#ffffff', w: 400 });
      for (var i = 0; i < 6; i++) sparkle(x, S * (0.1 + i * 0.16), S * (i % 2 ? 0.16 : 0.82), S * 0.035 * (0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))), cols[i % cols.length]); } },
    hbdbn: { n: 'শুভ জন্মদিন', c: '#e11d48', cat: 'words', d: function (x, t, S, c) {
      var k = 1 + Math.sin(t * 3) * 0.04; x.save(); x.translate(S / 2, S / 2); x.scale(k, k); words(x, 'শুভ', 0, -S * 0.12, S * 0.18, 'Hind Siliguri', c, { stroke: '#ffffff', w: 700 }); words(x, 'জন্মদিন', 0, S * 0.1, S * 0.18, 'Hind Siliguri', shade(c, -0.2), { stroke: '#ffffff', w: 700 }); x.restore();
      for (var i = 0; i < 3; i++) { var q = (t * 0.6 + i / 3) % 1; x.globalAlpha = 1 - q; fillHeart(x, S * (0.2 + i * 0.3), S * (0.92 - q * 0.25), S * 0.05, c); } x.globalAlpha = 1; } },
    gm: { n: 'Good Morning', c: '#f59e0b', cat: 'words', d: function (x, t, S, c) {
      var up = Math.min(1, (t % 4) / 1.2), sy = S * (0.62 - ease(up) * 0.22);
      x.save(); x.translate(S / 2, sy); x.rotate(t * 0.4); for (var i = 0; i < 10; i++) { x.rotate(TAU / 10); x.fillStyle = hex(c, 0.6); x.fillRect(-S * 0.012, -S * 0.2, S * 0.024, S * 0.06); } x.restore();
      x.beginPath(); x.arc(S / 2, sy, S * 0.12, 0, TAU); x.fillStyle = c; x.fill();
      words(x, 'Good Morning', S / 2, S * 0.74, S * 0.13, 'Dancing Script', shade(c, -0.35), { stroke: '#ffffff', w: 700 }); } },
    gn: { n: 'Good Night', c: '#6366f1', cat: 'words', d: function (x, t, S, c) {
      x.save(); x.beginPath(); x.arc(S * 0.5, S * 0.34, S * 0.15, 0, TAU); x.fillStyle = '#fde047'; x.fill(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(S * 0.58, S * 0.29, S * 0.13, 0, TAU); x.fill(); x.restore();
      [[0.22, 0.2], [0.78, 0.18], [0.7, 0.44], [0.3, 0.46]].forEach(function (q, i) { star5(x, q[0] * S, q[1] * S, S * 0.03 * (0.5 + 0.5 * Math.sin(t * 3 + i * 2)), 0, '#fde68a'); });
      words(x, 'Good Night', S / 2, S * 0.7, S * 0.14, 'Dancing Script', c, { stroke: '#ffffff', w: 700 });
      words(x, 'z', S * (0.68 + Math.sin(t * 2) * 0.02), S * (0.22 - (t % 2) * 0.04), S * 0.06, 'Poppins', hex(c, 1 - (t % 2) / 2), { w: 800 }); } },
    thanks: { n: 'Thank You', c: '#db2777', cat: 'words', d: function (x, t, S, c) {
      var p = (t % 2.4) / 2.4, k = p < 0.2 ? back(p / 0.2) : 1; x.save(); x.translate(S / 2, S / 2); x.scale(k, k); x.rotate(-0.08);
      words(x, 'Thank you', 0, -S * 0.02, S * 0.16, 'Great Vibes', c, { stroke: '#ffffff', sw: S * 0.03, w: 400 }); x.restore();
      fillHeart(x, S * 0.78, S * (0.28 + Math.sin(t * 3) * 0.02), S * 0.08, c); sparkle(x, S * 0.2, S * 0.7, S * 0.04 * Math.abs(Math.sin(t * 3)), '#f59e0b'); } },
    love: { n: 'Love You', c: '#e11d48', cat: 'words', d: function (x, t, S, c) {
      var k = 1 + Math.max(0, Math.sin(t * TAU)) * 0.08; fillHeart(x, S / 2, S * 0.56, S * 0.42 * k, shade(c, 0.6));
      words(x, 'Love', S / 2, S * 0.42, S * 0.14, 'Pacifico', c, { w: 400 }); words(x, 'you', S / 2, S * 0.56, S * 0.11, 'Pacifico', shade(c, -0.15), { w: 400 }); } },
    congrats: { n: 'Congratulations', c: '#7c3aed', cat: 'words', d: function (x, t, S, c) {
      K.confetti.d(x, t, S, '#f43f5e'); var k = 1 + Math.sin(t * 4) * 0.03; x.save(); x.translate(S / 2, S / 2); x.scale(k, k);
      rr(x, -S * 0.46, -S * 0.1, S * 0.92, S * 0.2, S * 0.1); x.fillStyle = c; x.fill(); words(x, 'Congratulations!', 0, S * 0.005, S * 0.085, 'Poppins', '#ffffff', { w: 800 }); x.restore(); } },
    miss: { n: 'Miss You', c: '#0ea5e9', cat: 'words', d: function (x, t, S, c) {
      words(x, 'Miss you', S / 2, S * 0.5, S * 0.15, 'Pacifico', c, { stroke: '#ffffff', w: 400 });
      for (var i = 0; i < 4; i++) { var q = (t * 0.5 + i / 4) % 1; x.globalAlpha = Math.sin(q * Math.PI); fillHeart(x, S * (0.15 + i * 0.23), S * (0.85 - q * 0.6), S * 0.045, i % 2 ? c : '#f472b6'); } x.globalAlpha = 1; } },
    wow: { n: 'WOW', c: '#f59e0b', cat: 'words', d: function (x, t, S, c) {
      var p = (t % 1.6) / 1.6, k = p < 0.25 ? back(p / 0.25) : 1 + Math.sin(t * 6) * 0.03;
      x.save(); x.translate(S / 2, S / 2); x.scale(k, k); x.beginPath(); for (var i = 0; i < 24; i++) { var a = i * TAU / 24, r = i % 2 ? S * 0.28 : S * 0.42; x[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fillStyle = c; x.fill();
      words(x, 'WOW!', 0, S * 0.01, S * 0.17, 'Anton', '#ffffff', { stroke: shade(c, -0.4), sw: S * 0.02, w: 400 }); x.restore(); } },
    diwali: { n: 'Happy Diwali', c: '#f97316', cat: 'words', d: function (x, t, S, c) {
      x.save(); x.translate(0, S * 0.12); x.scale(1, 0.8); K.diya.d(x, t, S, c); x.restore();
      words(x, 'Happy Diwali', S / 2, S * 0.22, S * 0.12, 'Dancing Script', shade(c, -0.25), { stroke: '#fff7ed', w: 700 });
      for (var i = 0; i < 4; i++) sparkle(x, S * (0.12 + i * 0.25), S * (i % 2 ? 0.08 : 0.36), S * 0.03 * Math.abs(Math.sin(t * 3 + i)), '#facc15'); } }
  };
  var CATS2 = [['✨ Pretty', 'pretty'], ['🎉 Party', 'party'], ['💬 Wishes', 'words'], ['🛍 Shop & social', 'shop']];
  var FONTS = ['Lilita One', 'Hind Siliguri', 'Dancing Script', 'Great Vibes', 'Pacifico', 'Poppins', 'Anton'];

  // plug the drawn stickers into the animated sticker object
  var P = F.AnimSticker.prototype, baseLoad = P.load, baseRender = P._render, baseObj = P.toObject, baseInit = P.initialize;
  P.initialize = function (o) { o = o || {}; if (o.kind) { this.kind = o.kind; this.col = o.col || (K[o.kind] && K[o.kind].c); F.Object.prototype.initialize.call(this, o); this.width = o.width || 360; this.height = o.height || 360; this.speed = o.speed || 1; return; } baseInit.call(this, o); };
  P.load = function () { if (this.kind) { warm(); return Promise.resolve(this); } return baseLoad.call(this); };
  P._render = function (ctx) {
    if (!this.kind) return baseRender.call(this, ctx);
    var k = K[this.kind]; if (!k) return; var w = this.width, h = this.height, clk = Pro.anim && Pro.anim.clock, t = (clk && clk.gif ? clk.n / clk.fps : performance.now() / 1000) * (this.speed || 1);
    ctx.save(); ctx.translate(-w / 2, -h / 2); ctx.scale(w / 360, h / 360); try { k.d(ctx, t, 360, this.col || k.c); } catch (e) {} ctx.restore();
  };
  var baseSVG = P.toSVG;
  P.toSVG = function () { if (!this.kind) return baseSVG.apply(this, arguments); var c = document.createElement('canvas'); c.width = c.height = 360; var g = c.getContext('2d'); try { K[this.kind].d(g, 0.6, 360, this.col || K[this.kind].c); } catch (e) {} var w = this.width, h = this.height; return '<g transform="matrix(' + this.calcTransformMatrix().join(' ') + ')"><image href="' + c.toDataURL() + '" x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '"/></g>\n'; };
  P.toObject = function (p) { var o = baseObj.call(this, p); if (this.kind) { o.kind = this.kind; o.col = this.col; delete o.code; } return o; };

  var S = null, cv = null, warmed = false;
  function warm() { if (warmed || !S) return; warmed = true; FONTS.forEach(function (f) { S.needFont(f); }); var go = function () { if (document.fonts && document.fonts.load) FONTS.forEach(function (f) { document.fonts.load('700 40px "' + f + '"', 'Aaশুভ').catch(function () {}); }); }; setTimeout(go, 600); setTimeout(go, 2500); }
  function addDrawn(kind) {
    var size = Math.min(S.doc.w, S.doc.h) * 0.36, s = new F.AnimSticker({ kind: kind });
    warm();
    s.load().then(function () { s.set({ scaleX: size / 360, scaleY: size / 360, left: (S.doc.w - size) / 2, top: (S.doc.h - size) / 2 }); s.nm = 'Animated ' + K[kind].n; S.addObj(s); S.showProps(); S.toast('It moves! Change its colour from the top bar. Download as MP4 or GIF to keep the animation.'); });
  }

  // previews in the panel (only the open category is drawn, about 20 times a second)
  var thumbs = [], raf = null;
  function tick() {
    raf = null; var t = performance.now() / 1000, live = thumbs.filter(function (c) { return c.isConnected; }); thumbs = live; if (!live.length) return;
    live.forEach(function (c) { var g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.save(); g.scale(c.width / 360, c.height / 360); try { K[c.dataset.k].d(g, t, 360, K[c.dataset.k].c); } catch (e) {} g.restore(); });
    setTimeout(function () { if (!raf) raf = requestAnimationFrame(tick); }, 45);
  }
  function panel2(panel) {
    var host = panel.querySelector('.sx-animbox .sx-sec'); if (!host) return;
    var box = document.createElement('div'); box.className = 'sx-drawn';
    box.innerHTML = '<div class="st-chips sx-illc">' + CATS2.map(function (c, i) { return '<button class="st-chip" data-dcat="' + c[1] + '" aria-pressed="' + (i === 0) + '">' + c[0] + '</button>'; }).join('') + '</div><div class="sx-shapes sx-dgrid"></div><h4 class="sx-emh">Animated emoji</h4>';
    host.insertBefore(box, host.querySelector('.sx-animc'));
    var grid = box.querySelector('.sx-dgrid');
    function draw(cat) {
      grid.innerHTML = Object.keys(K).filter(function (k) { return K[k].cat === cat; }).map(function (k) { return '<button data-dk="' + k + '" title="' + K[k].n + '"><canvas width="120" height="120" data-k="' + k + '"></canvas><span>' + K[k].n + '</span></button>'; }).join('');
      thumbs = [].slice.call(grid.querySelectorAll('canvas')); if (!raf) raf = requestAnimationFrame(tick);
    }
    warm();
    draw('pretty');
    box.addEventListener('click', function (e) {
      var b; if ((b = e.target.closest('[data-dcat]'))) { [].forEach.call(box.querySelectorAll('[data-dcat]'), function (x) { x.setAttribute('aria-pressed', x === b); }); draw(b.dataset.dcat); return; }
      if ((b = e.target.closest('[data-dk]'))) addDrawn(b.dataset.dk);
    });
  }
  var css = '.sx-dgrid{grid-template-columns:repeat(3,1fr)}.sx-dgrid button{aspect-ratio:auto;padding:6px 4px;background:linear-gradient(160deg,#fff,#fdf2f8)}.sx-dgrid canvas{width:100%;aspect-ratio:1;display:block}.sx-dgrid span{font:600 10.5px \'SP Inter\',sans-serif;color:var(--ink2);text-align:center;line-height:1.15}.sx-emh{margin:12px 0 6px}';
  try { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); } catch (e) {}

  var baseInstall = Pro.install;
  Pro.install = function (studio) {
    baseInstall(studio); S = studio; cv = S.canvas;
    var prevEls = S.elsHook; S.elsHook = function (panel) { if (prevEls) prevEls(panel); panel2(panel); };
    var prevProps = S.propsHook; S.propsHook = function (o, h, info) {
      h = (prevProps ? prevProps(o, h, info) : h) || h;
      if (o && o.type === 'animSticker' && o.kind) {
        var add = '<label class="st-pb" title="Colour"><input type="color" data-p="ydcol" value="' + new F.Color(o.col || K[o.kind].c).toHexa().slice(0, 6).replace(/^/, '#') + '"> Colour</label><button class="st-pb" data-p="ydspd">Speed ' + (o.speed || 1) + '×</button>';
        h = h.indexOf('data-p="cstyle"') >= 0 ? h.replace('<button class="st-pb" data-p="cstyle"', add + '<button class="st-pb" data-p="cstyle"') : h + add;
      }
      return h;
    };
    var prevAct = S.extAct; S.extAct = function (p, o, val) {
      if (p === 'ydcol' && o && o.kind) { o.col = val; cv.requestRenderAll(); S.record(); return; }
      if (p === 'ydspd' && o && o.kind) { var sp = [1, 1.5, 2, 0.5]; o.speed = sp[(sp.indexOf(o.speed || 1) + 1) % sp.length]; S.record(); S.showProps(); return; }
      if (prevAct) prevAct(p, o, val);
    };
  };
  Pro.anim2 = { K: K, addDrawn: addDrawn };
})();
