/* S Printer — document scanner engine.
 * detect(image)  → the 4 corners of the paper (automatic, no upload)
 * warp(image, q) → the paper straightened to a flat rectangle at full resolution
 * enhance(canvas, mode) → scan look: 'original' | 'clean' | 'gray' | 'bw'  */
(function () {
  'use strict';

  function cnv(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function dims(img) { return { w: img.naturalWidth || img.videoWidth || img.width, h: img.naturalHeight || img.videoHeight || img.height }; }

  // ---------- small image helpers ----------
  function grayOf(rgba, n) { var g = new Float32Array(n); for (var i = 0, j = 0; i < n; i++, j += 4) g[i] = 0.299 * rgba[j] + 0.587 * rgba[j + 1] + 0.114 * rgba[j + 2]; return g; }
  function boxBlur(src, w, h, r) {
    var tmp = new Float32Array(w * h), out = new Float32Array(w * h), x, y, s, k = 2 * r + 1;
    for (y = 0; y < h; y++) {
      var row = y * w; s = 0;
      for (x = -r; x <= r; x++) s += src[row + Math.min(w - 1, Math.max(0, x))];
      for (x = 0; x < w; x++) { tmp[row + x] = s / k; s += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)]; }
    }
    for (x = 0; x < w; x++) {
      s = 0;
      for (y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (y = 0; y < h; y++) { out[y * w + x] = s / k; s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; }
    }
    return out;
  }
  function otsu(vals, n) {
    var hist = new Float64Array(256), i;
    for (i = 0; i < n; i++) hist[Math.max(0, Math.min(255, vals[i] | 0))]++;
    var sum = 0; for (i = 0; i < 256; i++) sum += i * hist[i];
    var sB = 0, wB = 0, best = 0, t = 128;
    for (i = 0; i < 256; i++) {
      wB += hist[i]; if (!wB) continue; var wF = n - wB; if (!wF) break;
      sB += i * hist[i]; var mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF);
      if (v > best) { best = v; t = i; }
    }
    return t;
  }
  function dilate(m, w, h, r) {
    var out = new Uint8Array(w * h), tmp = new Uint8Array(w * h), x, y, k;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { var v = 0; for (k = -r; k <= r && !v; k++) { var xx = x + k; if (xx >= 0 && xx < w && m[y * w + xx]) v = 1; } tmp[y * w + x] = v; }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { var u = 0; for (k = -r; k <= r && !u; k++) { var yy = y + k; if (yy >= 0 && yy < h && tmp[yy * w + x]) u = 1; } out[y * w + x] = u; }
    return out;
  }
  function erode(m, w, h, r) { var inv = new Uint8Array(w * h); for (var i = 0; i < w * h; i++) inv[i] = m[i] ? 0 : 1; var d = dilate(inv, w, h, r); for (i = 0; i < w * h; i++) d[i] = d[i] ? 0 : 1; return d; }
  // largest 4-connected component of mask==1 → {mask, area}
  function largest(m, w, h, avoidBorder) {
    var lab = new Int32Array(w * h), q = new Int32Array(w * h), best = 0, bestId = 0, id = 0;
    for (var s = 0; s < w * h; s++) {
      if (!m[s] || lab[s]) continue;
      id++; var head = 0, tail = 0, area = 0, touches = 0; q[tail++] = s; lab[s] = id;
      while (head < tail) {
        var p = q[head++], x = p % w, y = (p - x) / w; area++;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) touches++;
        if (x > 0 && m[p - 1] && !lab[p - 1]) { lab[p - 1] = id; q[tail++] = p - 1; }
        if (x < w - 1 && m[p + 1] && !lab[p + 1]) { lab[p + 1] = id; q[tail++] = p + 1; }
        if (y > 0 && m[p - w] && !lab[p - w]) { lab[p - w] = id; q[tail++] = p - w; }
        if (y < h - 1 && m[p + w] && !lab[p + w]) { lab[p + w] = id; q[tail++] = p + w; }
      }
      var score = avoidBorder ? area - touches * 40 : area;
      if (score > best) { best = score; bestId = id; }
    }
    var out = new Uint8Array(w * h), a = 0;
    if (bestId) for (var i = 0; i < w * h; i++) if (lab[i] === bestId) { out[i] = 1; a++; }
    return { mask: out, area: a };
  }
  function fillHoles(m, w, h) {
    // everything not reachable from the border through 0-pixels is inside → 1
    var seen = new Uint8Array(w * h), q = new Int32Array(w * h), t = 0, hd = 0, i;
    var push = function (p) { if (!m[p] && !seen[p]) { seen[p] = 1; q[t++] = p; } };
    for (i = 0; i < w; i++) { push(i); push((h - 1) * w + i); }
    for (i = 0; i < h; i++) { push(i * w); push(i * w + w - 1); }
    while (hd < t) { var p = q[hd++], x = p % w; if (x > 0) push(p - 1); if (x < w - 1) push(p + 1); if (p >= w) push(p - w); if (p < w * (h - 1)) push(p + w); }
    var out = new Uint8Array(w * h); for (i = 0; i < w * h; i++) out[i] = seen[i] ? 0 : 1; return out;
  }

  // ---------- geometry ----------
  function hull(pts) {
    pts = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); };
    var lo = [], up = [], i;
    for (i = 0; i < pts.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
    for (i = pts.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], pts[i]) <= 0) up.pop(); up.push(pts[i]); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  function polyArea(p) { var a = 0; for (var i = 0; i < p.length; i++) { var j = (i + 1) % p.length; a += p[i][0] * p[j][1] - p[j][0] * p[i][1]; } return Math.abs(a) / 2; }
  // Ramer–Douglas–Peucker on the closed outline: keeps the corners, drops the points along straight sides
  function simplify(poly) {
    var per = 0; for (var i = 0; i < poly.length; i++) { var j = (i + 1) % poly.length; per += Math.hypot(poly[j][0] - poly[i][0], poly[j][1] - poly[i][1]); }
    var eps = per * 0.008;
    var rdp = function (pts) {
      if (pts.length < 3) return pts;
      var a = pts[0], b = pts[pts.length - 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, best = 0, bi = 0;
      for (var k = 1; k < pts.length - 1; k++) { var dd = Math.abs((pts[k][0] - a[0]) * dy - (pts[k][1] - a[1]) * dx) / L; if (dd > best) { best = dd; bi = k; } }
      if (best <= eps) return [a, b];
      var l = rdp(pts.slice(0, bi + 1)), r = rdp(pts.slice(bi)); return l.slice(0, -1).concat(r);
    };
    // split the ring at its two farthest-apart points
    var far = 0, fi = 0; for (i = 1; i < poly.length; i++) { var dd = Math.hypot(poly[i][0] - poly[0][0], poly[i][1] - poly[0][1]); if (dd > far) { far = dd; fi = i; } }
    var A = rdp(poly.slice(0, fi + 1)), B = rdp(poly.slice(fi).concat([poly[0]]));
    return A.slice(0, -1).concat(B.slice(0, -1));
  }
  // the biggest 4-corner shape that fits the outline
  function bestQuad(h) {
    if (h.length < 4) return null;
    var pts = simplify(h);
    if (pts.length < 4) pts = h;
    if (pts.length > 28) { // keep the most important outline points
      var step = pts.length / 28, s = []; for (var k = 0; k < 28; k++) s.push(pts[Math.floor(k * step)]); pts = s;
    }
    var n = pts.length, best = 0, bq = null;
    for (var a = 0; a < n; a++) for (var b = a + 1; b < n; b++) for (var c = b + 1; c < n; c++) for (var d = c + 1; d < n; d++) {
      var q = [pts[a], pts[b], pts[c], pts[d]], ar = polyArea(q); if (ar > best) { best = ar; bq = q; }
    }
    return bq;
  }
  function order(q) {
    var cx = 0, cy = 0; q.forEach(function (p) { cx += p[0] / 4; cy += p[1] / 4; });
    q = q.slice().sort(function (a, b) { return Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx); });
    // start at top-left (smallest x+y), clockwise on screen: TL, TR, BR, BL
    var i0 = 0; for (var i = 1; i < 4; i++) if (q[i][0] + q[i][1] < q[i0][0] + q[i0][1]) i0 = i;
    return [q[i0], q[(i0 + 1) % 4], q[(i0 + 2) % 4], q[(i0 + 3) % 4]];
  }
  // straighten the sides: fit a line through the outline along each side, corners = where the lines meet
  function refine(q, mask, w, h) {
    var bpts = [];
    for (var y = 1; y < h - 1; y++) for (var x = 1; x < w - 1; x++) {
      var p = y * w + x; if (mask[p] && (!mask[p - 1] || !mask[p + 1] || !mask[p - w] || !mask[p + w])) bpts.push([x + 0.5, y + 0.5]);
    }
    var lines = [];
    for (var s = 0; s < 4; s++) {
      var A = q[s], B = q[(s + 1) % 4], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      var tol = Math.max(2, L * 0.02), sel = [];
      for (var i = 0; i < bpts.length; i++) {
        var px = bpts[i][0] - A[0], py = bpts[i][1] - A[1], t = (px * dx + py * dy) / (L * L), dist = Math.abs(px * nx + py * ny);
        if (t > 0.12 && t < 0.88 && dist < tol) sel.push(bpts[i]);
      }
      if (sel.length < 8) { lines.push(null); continue; }
      var mx = 0, my = 0; sel.forEach(function (p) { mx += p[0]; my += p[1]; }); mx /= sel.length; my /= sel.length;
      var sxx = 0, syy = 0, sxy = 0; sel.forEach(function (p) { var a = p[0] - mx, b = p[1] - my; sxx += a * a; syy += b * b; sxy += a * b; });
      var ang = 0.5 * Math.atan2(2 * sxy, sxx - syy); lines.push({ x: mx, y: my, dx: Math.cos(ang), dy: Math.sin(ang) });
    }
    var out = [];
    for (var c = 0; c < 4; c++) {
      var l1 = lines[(c + 3) % 4], l2 = lines[c];
      if (!l1 || !l2) { out.push(q[c]); continue; }
      var den = l1.dx * l2.dy - l1.dy * l2.dx; if (Math.abs(den) < 1e-6) { out.push(q[c]); continue; }
      var tt = ((l2.x - l1.x) * l2.dy - (l2.y - l1.y) * l2.dx) / den, X = l1.x + l1.dx * tt, Y = l1.y + l1.dy * tt;
      if (Math.hypot(X - q[c][0], Y - q[c][1]) > Math.max(w, h) * 0.08) { out.push(q[c]); continue; }
      out.push([Math.max(0, Math.min(w, X)), Math.max(0, Math.min(h, Y))]);
    }
    return out;
  }
  function candidate(mask, w, h) {
    var comp = largest(mask, w, h, false); if (comp.area < w * h * 0.08) return null;
    var filled = fillHoles(comp.mask, w, h), area = 0, pts = [];
    for (var y = 0; y < h; y++) {
      var l = -1, r = -1; for (var x = 0; x < w; x++) if (filled[y * w + x]) { area++; if (l < 0) l = x; r = x; }
      if (l >= 0) { pts.push([l, y]); pts.push([r + 1, y]); pts.push([l, y + 1]); pts.push([r + 1, y + 1]); }
    }
    var hl = hull(pts), q = bestQuad(hl); if (!q) return null;
    q = order(q);
    q = order(refine(q, filled, w, h));
    var qa = polyArea(q), frac = qa / (w * h), fit = Math.min(area, qa) / Math.max(area, qa);
    if (frac < 0.1 || fit < 0.8) return null;
    // convex & sensible angles only
    for (var i = 0; i < 4; i++) {
      var a = q[(i + 3) % 4], b = q[i], c = q[(i + 1) % 4];
      var v1x = a[0] - b[0], v1y = a[1] - b[1], v2x = c[0] - b[0], v2y = c[1] - b[1];
      var cos = (v1x * v2x + v1y * v2y) / (Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y) || 1);
      if (Math.abs(cos) > 0.6) return null; // corner angle outside ~53°–127°
    }
    return { q: q, frac: frac, fit: fit, score: fit * (frac > 0.97 ? 0.6 : 1) * (0.6 + 0.4 * Math.min(1, frac / 0.35)) };
  }

  // ---------- 1) find the paper ----------
  function detect(img, maxSide, fast) {
    var d = dims(img); if (!d.w || !d.h) return null;
    var S = Math.min(1, (maxSide || 520) / Math.max(d.w, d.h)), w = Math.max(16, Math.round(d.w * S)), h = Math.max(16, Math.round(d.h * S));
    var c = cnv(w, h), x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
    var px = x.getImageData(0, 0, w, h).data, n = w * h, i;
    // a white page on a white scanner lid (or a full-page PDF): nothing to cut away
    var bs = 0, bc = 0; for (i = 0; i < w; i++) { bs += px[i * 4 + 1] + px[((h - 1) * w + i) * 4 + 1]; bc += 2; } for (i = 0; i < h; i++) { bs += px[(i * w) * 4 + 1] + px[(i * w + w - 1) * 4 + 1]; bc += 2; }
    if (bs / bc > 222) return null;
    var g = boxBlur(grayOf(px, n), w, h, 2);
    // colour difference matters too (white paper on a beige / grey table)
    var sat = new Float32Array(n); for (i = 0; i < n; i++) { var r = px[i * 4], gg = px[i * 4 + 1], b = px[i * 4 + 2]; sat[i] = Math.max(r, gg, b) - Math.min(r, gg, b); }
    sat = boxBlur(sat, w, h, 2);
    var cands = [];
    // A — bright paper: Otsu on brightness minus colourfulness (paper is light and neutral)
    var paper = new Float32Array(n); for (i = 0; i < n; i++) paper[i] = Math.max(0, Math.min(255, g[i] - sat[i] * 0.6));
    var t = otsu(paper, n), mA = new Uint8Array(n); for (i = 0; i < n; i++) mA[i] = paper[i] > t ? 1 : 0;
    mA = erode(dilate(mA, w, h, 2), w, h, 2);
    var cA = candidate(mA, w, h); if (cA) { cA.how = 'paper'; cands.push(cA); }
    // B — edges: strong outlines, closed, then everything they enclose
    var mag = new Float32Array(n), y, xx;
    for (y = 1; y < h - 1; y++) for (xx = 1; xx < w - 1; xx++) {
      var p = y * w + xx;
      var gx = g[p + 1] - g[p - 1] + 0.5 * (g[p - w + 1] - g[p - w - 1] + g[p + w + 1] - g[p + w - 1]);
      var gy = g[p + w] - g[p - w] + 0.5 * (g[p + w - 1] - g[p - w - 1] + g[p + w + 1] - g[p - w + 1]);
      var sx = sat[p + 1] - sat[p - 1], sy = sat[p + w] - sat[p - w];
      mag[p] = Math.hypot(gx, gy) + 0.7 * Math.hypot(sx, sy);
    }
    var sorted = Array.prototype.slice.call(mag).sort(function (a, b) { return a - b; }), thr = Math.max(14, sorted[Math.floor(n * 0.86)]);
    var e = new Uint8Array(n); for (i = 0; i < n; i++) e[i] = mag[i] > thr ? 1 : 0;
    e = dilate(e, w, h, 1);
    var cB = candidate(fillHoles(e, w, h), w, h); if (cB) { cB.how = 'edges'; cands.push(cB); }
    if (!cands.length) return null;
    cands.sort(function (a, b) { return b.score - a.score; });
    var best = cands[0];
    if (best.frac > 0.975) return null;     // the paper already fills the picture (a flatbed scan) → keep it whole
    var k = 1 / S, quad = best.q.map(function (p) { return [p[0] * k, p[1] * k]; });
    if (!fast) { try { quad = sharpen(img, quad) || quad; } catch (er) {} }
    return { quad: quad, how: best.how, confidence: Math.round(best.score * 100) };
  }
  // second pass on a bigger copy: each side is moved onto the exact paper edge (sub-pixel), corners re-made
  function sharpen(img, quad) {
    var d = dims(img), S = Math.min(1, 1800 / Math.max(d.w, d.h)), w = Math.round(d.w * S), h = Math.round(d.h * S);
    var c = cnv(w, h), x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
    var g = boxBlur(grayOf(x.getImageData(0, 0, w, h).data, w * h), w, h, 1); c.width = c.height = 1;
    var at = function (X, Y) { X = Math.max(0, Math.min(w - 1.001, X)); Y = Math.max(0, Math.min(h - 1.001, Y)); var x0 = X | 0, y0 = Y | 0, fx = X - x0, fy = Y - y0, i = y0 * w + x0; return g[i] * (1 - fx) * (1 - fy) + g[i + 1] * fx * (1 - fy) + g[i + w] * (1 - fx) * fy + g[i + w + 1] * fx * fy; };
    var q = quad.map(function (p) { return [p[0] * S, p[1] * S]; }), cx = 0, cy = 0; q.forEach(function (p) { cx += p[0] / 4; cy += p[1] / 4; });
    var R = Math.max(6, Math.round(Math.max(w, h) * 0.012)), lines = [];
    for (var sd = 0; sd < 4; sd++) {
      var A = q[sd], B = q[(sd + 1) % 4], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      if ((A[0] + dx / 2 - cx) * nx + (A[1] + dy / 2 - cy) * ny < 0) { nx = -nx; ny = -ny; }   // normal points outwards
      var pts = [];
      for (var t = 0.1; t <= 0.9001; t += 0.8 / 40) {
        var px = A[0] + dx * t, py = A[1] + dy * t, bestV = 0, bestO = null;
        for (var o = -R; o <= R; o += 0.5) {
          var v = at(px + nx * (o - 1), py + ny * (o - 1)) - at(px + nx * (o + 1), py + ny * (o + 1));  // inside minus outside
          var av = Math.abs(v); if (av > bestV) { bestV = av; bestO = o; }
        }
        if (bestO != null && bestV > 6) pts.push([px + nx * bestO, py + ny * bestO]);
      }
      if (pts.length < 12) { lines.push(null); continue; }
      // robust line: drop the 25% farthest from a first fit, then fit again
      var fit = function (P) { var mx = 0, my = 0; P.forEach(function (p) { mx += p[0]; my += p[1]; }); mx /= P.length; my /= P.length; var a = 0, b2 = 0, c2 = 0; P.forEach(function (p) { var u = p[0] - mx, v2 = p[1] - my; a += u * u; b2 += v2 * v2; c2 += u * v2; }); var an = 0.5 * Math.atan2(2 * c2, a - b2); return { x: mx, y: my, dx: Math.cos(an), dy: Math.sin(an) }; };
      var l1 = fit(pts), dist = function (p, l) { return Math.abs((p[0] - l.x) * l.dy - (p[1] - l.y) * l.dx); };
      pts.sort(function (a, b) { return dist(a, l1) - dist(b, l1); }); lines.push(fit(pts.slice(0, Math.ceil(pts.length * 0.75))));
    }
    var out = [];
    for (var cI = 0; cI < 4; cI++) {
      var a1 = lines[(cI + 3) % 4], a2 = lines[cI];
      if (!a1 || !a2) { out.push(q[cI]); continue; }
      var den = a1.dx * a2.dy - a1.dy * a2.dx; if (Math.abs(den) < 1e-6) { out.push(q[cI]); continue; }
      var tt = ((a2.x - a1.x) * a2.dy - (a2.y - a1.y) * a2.dx) / den, X = a1.x + a1.dx * tt, Y = a1.y + a1.dy * tt;
      out.push(Math.hypot(X - q[cI][0], Y - q[cI][1]) > R * 2.5 ? q[cI] : [X, Y]);
    }
    return out.map(function (p) { return [Math.max(0, Math.min(d.w, p[0] / S)), Math.max(0, Math.min(d.h, p[1] / S))]; });
  }

  // ---------- 2) straighten ----------
  function solve(A, b) { // Gaussian elimination, 8×8
    var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var piv = c; for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      var tmp = M[c]; M[c] = M[piv]; M[piv] = tmp; if (Math.abs(M[c][c]) < 1e-12) return null;
      for (r = 0; r < n; r++) if (r !== c) { var f = M[r][c] / M[c][c]; for (var k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map(function (r, i) { return r[n] / r[i]; });
  }
  // homography mapping (u,v) of the output rectangle → (x,y) in the photo
  function homography(W, H, q) {
    var src = [[0, 0], [W, 0], [W, H], [0, H]], A = [], b = [];
    for (var i = 0; i < 4; i++) {
      var u = src[i][0], v = src[i][1], x = q[i][0], y = q[i][1];
      A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]); b.push(x);
      A.push([0, 0, 0, u, v, 1, -u * y, -v * y]); b.push(y);
    }
    var hh = solve(A, b); return hh ? hh.concat([1]) : null;
  }
  function outSize(q) {
    var L = function (a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); };
    return { w: Math.max(L(q[0], q[1]), L(q[3], q[2])), h: Math.max(L(q[0], q[3]), L(q[1], q[2])) };
  }
  // full-resolution, bilinear (smooth, no jagged letters)
  function warp(img, q, opt) {
    opt = opt || {};
    var d = dims(img), sz = outSize(q), scale = opt.scale || 1;
    var W = Math.max(1, Math.round(sz.w * scale)), H = Math.max(1, Math.round(sz.h * scale));
    var maxArea = opt.maxArea || 30e6; if (W * H > maxArea) { var f = Math.sqrt(maxArea / (W * H)); W = Math.round(W * f); H = Math.round(H * f); }
    // read only the part of the photo the paper covers (less memory)
    var minX = Math.max(0, Math.floor(Math.min(q[0][0], q[1][0], q[2][0], q[3][0])) - 2), minY = Math.max(0, Math.floor(Math.min(q[0][1], q[1][1], q[2][1], q[3][1])) - 2);
    var maxX = Math.min(d.w, Math.ceil(Math.max(q[0][0], q[1][0], q[2][0], q[3][0])) + 2), maxY = Math.min(d.h, Math.ceil(Math.max(q[0][1], q[1][1], q[2][1], q[3][1])) + 2);
    var sw = Math.max(1, maxX - minX), sh = Math.max(1, maxY - minY), ss = opt.srcScale || 1;
    var sc = cnv(sw * ss, sh * ss), sx = sc.getContext('2d', { willReadFrequently: true });
    sx.drawImage(img, minX, minY, sw, sh, 0, 0, sc.width, sc.height);
    var S = sx.getImageData(0, 0, sc.width, sc.height).data, SW = sc.width, SH = sc.height;
    sc.width = sc.height = 1;
    var qq = q.map(function (p) { return [(p[0] - minX) * ss, (p[1] - minY) * ss]; });
    var Hm = homography(W, H, qq); if (!Hm) return null;
    var out = cnv(W, H), ox = out.getContext('2d'), od = ox.createImageData(W, H), D = od.data;
    var h0 = Hm[0], h1 = Hm[1], h2 = Hm[2], h3 = Hm[3], h4 = Hm[4], h5 = Hm[5], h6 = Hm[6], h7 = Hm[7];
    var di = 0;
    for (var v = 0; v < H; v++) {
      var vv = v + 0.5;
      for (var u = 0; u < W; u++, di += 4) {
        var uu = u + 0.5, z = h6 * uu + h7 * vv + 1, X = (h0 * uu + h1 * vv + h2) / z - 0.5, Y = (h3 * uu + h4 * vv + h5) / z - 0.5;
        if (X < 0) X = 0; else if (X > SW - 1.001) X = SW - 1.001;
        if (Y < 0) Y = 0; else if (Y > SH - 1.001) Y = SH - 1.001;
        var x0 = X | 0, y0 = Y | 0, fx = X - x0, fy = Y - y0, i00 = (y0 * SW + x0) * 4, i10 = i00 + 4, i01 = i00 + SW * 4, i11 = i01 + 4;
        var w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
        D[di] = S[i00] * w00 + S[i10] * w10 + S[i01] * w01 + S[i11] * w11;
        D[di + 1] = S[i00 + 1] * w00 + S[i10 + 1] * w10 + S[i01 + 1] * w01 + S[i11 + 1] * w11;
        D[di + 2] = S[i00 + 2] * w00 + S[i10 + 2] * w10 + S[i01 + 2] * w01 + S[i11 + 2] * w11;
        D[di + 3] = 255;
      }
    }
    ox.putImageData(od, 0, 0);
    return out;
  }

  // ---------- 3) scan look ----------
  // 'clean' evens out shadows and makes the paper white while keeping ink, stamps and photos in colour
  function enhance(c, mode) {
    if (!mode || mode === 'original') return c;
    var W = c.width, H = c.height, x = c.getContext('2d', { willReadFrequently: true });
    var img = x.getImageData(0, 0, W, H), D = img.data, n = W * H, i;
    // paper brightness everywhere: a small copy, text removed (max filter), smoothed, scaled back up
    var f = Math.min(1, 160 / Math.max(W, H)), bw = Math.max(8, Math.round(W * f)), bh = Math.max(8, Math.round(H * f));
    var sm = cnv(bw, bh), sx = sm.getContext('2d', { willReadFrequently: true }); sx.imageSmoothingQuality = 'high'; sx.drawImage(c, 0, 0, bw, bh);
    var sd = sx.getImageData(0, 0, bw, bh), sp = sd.data, ch = [new Float32Array(bw * bh), new Float32Array(bw * bh), new Float32Array(bw * bh)];
    for (i = 0; i < bw * bh; i++) { ch[0][i] = sp[i * 4]; ch[1][i] = sp[i * 4 + 1]; ch[2][i] = sp[i * 4 + 2]; }
    var R = Math.max(2, Math.round(Math.max(bw, bh) / 28));
    ch = ch.map(function (a) {
      var m = a; for (var it = 0; it < 2; it++) { var o = new Float32Array(bw * bh); for (var yy = 0; yy < bh; yy++) for (var xx = 0; xx < bw; xx++) { var mx = 0; for (var dy = -R; dy <= R; dy++) { var y2 = yy + dy; if (y2 < 0 || y2 >= bh) continue; for (var dx = -R; dx <= R; dx++) { var x2 = xx + dx; if (x2 < 0 || x2 >= bw) continue; var vv = m[y2 * bw + x2]; if (vv > mx) mx = vv; } } o[yy * bw + xx] = mx; } m = o; }
      return boxBlur(m, bw, bh, R);
    });
    for (i = 0; i < bw * bh; i++) { sp[i * 4] = ch[0][i]; sp[i * 4 + 1] = ch[1][i]; sp[i * 4 + 2] = ch[2][i]; sp[i * 4 + 3] = 255; }
    sx.putImageData(sd, 0, 0);
    var big = cnv(W, H), bx = big.getContext('2d', { willReadFrequently: true }); bx.imageSmoothingQuality = 'high'; bx.drawImage(sm, 0, 0, W, H);
    var B = bx.getImageData(0, 0, W, H).data; big.width = big.height = 1;
    var lut = new Uint8ClampedArray(256); for (i = 0; i < 256; i++) { var t = i / 255; t = Math.min(1, Math.max(0, (t - 0.06) / 0.86)); lut[i] = Math.round(255 * Math.pow(t, 1.25)); }
    for (i = 0; i < n; i++) {
      var k = i * 4, r = Math.min(255, D[k] * 255 / Math.max(40, B[k])), g = Math.min(255, D[k + 1] * 255 / Math.max(40, B[k + 1])), b = Math.min(255, D[k + 2] * 255 / Math.max(40, B[k + 2]));
      if (mode === 'clean') { D[k] = lut[r | 0]; D[k + 1] = lut[g | 0]; D[k + 2] = lut[b | 0]; }
      else {
        var L = lut[(0.299 * r + 0.587 * g + 0.114 * b) | 0];
        if (mode === 'bw') L = L <= 120 ? 0 : L >= 190 ? 255 : Math.round((L - 120) * 255 / 70);   // crisp, edges stay smooth
        D[k] = D[k + 1] = D[k + 2] = L;
      }
    }
    x.putImageData(img, 0, 0);
    return c;
  }

  function rotate(c, deg) {
    deg = ((deg % 360) + 360) % 360; if (!deg) return c;
    var o = deg % 180 ? cnv(c.height, c.width) : cnv(c.width, c.height), x = o.getContext('2d');
    x.translate(o.width / 2, o.height / 2); x.rotate(deg * Math.PI / 180); x.drawImage(c, -c.width / 2, -c.height / 2);
    return o;
  }

  window.SPScanEngine = { detect: detect, warp: warp, enhance: enhance, rotate: rotate, outSize: outSize, order: order, dims: dims };
})();
