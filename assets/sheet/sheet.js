/* S Printer — MultiSide Doc sheet editor
 * ADD documents / photos / PDF pages, pick a SHEET (A4, 4×6 …) and a TEMPLATE (1×1 … 3×3),
 * then drag, pinch-zoom, resize and turn every document right on the page.
 * Used by the "MultiSide Doc" tool and by "Edit layout" in the card tools.
 * Everything runs in the browser. Designed & developed by Raj. */
(function () {
  'use strict';
  var MM = 25.4, DPI = 300;
  var PAPERS = { A4: [210, 297], Letter: [215.9, 279.4], Legal: [215.9, 355.6], A5: [148, 210], A3: [297, 420], '4x6': [101.6, 152.4], '5x7': [127, 177.8] };
  var TEMPLATES = [[1, 1], [2, 1], [1, 2], [1, 3], [2, 2], [2, 3], [3, 2], [3, 3], [2, 4], [3, 4]];
  var SIZES = [['fit', 'Fit cell'], ['id', 'ID card 85.6 × 54 mm'], ['idv', 'ID card standing'], ['long', 'Long card 171.2 × 54'], ['pp', 'Photo 1.2 × 1.5 in'], ['a5', 'Half A4 (A5)'], ['page', 'Full page']];
  var IC = {
    add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
    sheet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M6 14h12" stroke-dasharray="2 2"/></svg>',
    tpl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M12 4v16M4 12h16"/></svg>',
    rot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/></svg>',
    crop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/></svg>',
    dup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    size: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="6" width="9" height="12" rx="1.5"/><rect x="12.5" y="6" width="9" height="12" rx="1.5"/></svg>',
    zin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20 20l-4-4"/></svg>',
    zout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M20 20l-4-4"/></svg>'
  };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function rotateCanvas(c, deg) {
    var t = (deg % 180) ? canvas(c.height, c.width) : canvas(c.width, c.height), x = t.getContext('2d');
    x.translate(t.width / 2, t.height / 2); x.rotate(deg * Math.PI / 180); x.drawImage(c, -c.width / 2, -c.height / 2); return t;
  }
  function thumb(c, max) { var k = Math.min(1, max / Math.max(c.width, c.height)), t = canvas(c.width * k, c.height * k); t.getContext('2d').drawImage(c, 0, 0, t.width, t.height); return t; }

  // ---------- automatic crop: the document is the big blob that differs from the table around it ----------
  function autoBox(c) {
    try {
      var k = Math.min(1, 360 / Math.max(c.width, c.height)), w = Math.round(c.width * k), h = Math.round(c.height * k);
      var t = canvas(w, h), x = t.getContext('2d'); x.drawImage(c, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data, i;
      // background colour = median of the outer ring
      var rs = [], gs = [], bs = [];
      for (i = 0; i < w; i++) { [0, h - 1].forEach(function (y) { var p = (y * w + i) * 4; rs.push(d[p]); gs.push(d[p + 1]); bs.push(d[p + 2]); }); }
      for (i = 0; i < h; i++) { [0, w - 1].forEach(function (xx) { var p = (i * w + xx) * 4; rs.push(d[p]); gs.push(d[p + 1]); bs.push(d[p + 2]); }); }
      var med = function (a) { a.sort(function (p, q) { return p - q; }); return a[a.length >> 1]; };
      var br = med(rs), bg = med(gs), bb = med(bs);
      var m = new Uint8Array(w * h);
      for (i = 0; i < w * h; i++) { var p = i * 4, dd = Math.abs(d[p] - br) + Math.abs(d[p + 1] - bg) + Math.abs(d[p + 2] - bb); m[i] = dd > 60 ? 1 : 0; }
      // largest connected blob
      var lab = new Int32Array(w * h), best = null, stack = [], id = 0;
      for (i = 0; i < w * h; i++) {
        if (!m[i] || lab[i]) continue; id++;
        var b = { x0: w, y0: h, x1: 0, y1: 0, n: 0 }; lab[i] = id; stack.push(i);
        while (stack.length) {
          var q = stack.pop(), qx = q % w, qy = (q - qx) / w; b.n++;
          if (qx < b.x0) b.x0 = qx; if (qx > b.x1) b.x1 = qx; if (qy < b.y0) b.y0 = qy; if (qy > b.y1) b.y1 = qy;
          [q - 1, q + 1, q - w, q + w].forEach(function (z, j) {
            if (z < 0 || z >= w * h || (j === 0 && qx === 0) || (j === 1 && qx === w - 1)) return;
            if (m[z] && !lab[z]) { lab[z] = id; stack.push(z); }
          });
        }
        if (!best || b.n > best.n) best = b;
      }
      if (!best) return null;
      var bw = best.x1 - best.x0 + 1, bh = best.y1 - best.y0 + 1;
      if (bw * bh < w * h * 0.12 || (bw > w * 0.97 && bh > h * 0.97)) return null;
      return { x: Math.max(0, best.x0 / k - 2), y: Math.max(0, best.y0 / k - 2), width: Math.min(c.width, bw / k + 4), height: Math.min(c.height, bh / k + 4) };
    } catch (e) { return null; }
  }
  // ID cards on a PDF page (e-Aadhaar, e-PAN …): blobs with the card shape
  function findCards(c) {
    var lines = lineCards(c), blobs = blobCards(c);
    return mergeBoxes(lines.concat(blobs)).slice(0, 8);
  }
  function blobCards(c) {
    var out = [];
    try {
      var k = Math.min(1, 420 / Math.max(c.width, c.height)), w = Math.round(c.width * k), h = Math.round(c.height * k);
      var t = canvas(w, h), x = t.getContext('2d'); x.drawImage(c, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data, ink = new Uint8Array(w * h), i, j, R = 2;
      for (i = 0; i < w * h; i++) { var r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2]; ink[i] = (0.3 * r + 0.59 * g + 0.11 * b < 205 || Math.max(r, g, b) - Math.min(r, g, b) > 45) ? 1 : 0; }
      var m = new Uint8Array(w * h);
      for (j = 0; j < h; j++) for (i = 0; i < w; i++) if (ink[j * w + i]) for (var yy = Math.max(0, j - R); yy <= Math.min(h - 1, j + R); yy++) for (var xx = Math.max(0, i - R); xx <= Math.min(w - 1, i + R); xx++) m[yy * w + xx] = 1;
      var lab = new Int32Array(w * h), id = 0, stack = [], boxes = [];
      for (i = 0; i < w * h; i++) {
        if (!m[i] || lab[i]) continue; id++;
        var bx = { x0: w, y0: h, x1: 0, y1: 0 }; lab[i] = id; stack.push(i);
        while (stack.length) {
          var q = stack.pop(), qx = q % w, qy = (q - qx) / w;
          if (qx < bx.x0) bx.x0 = qx; if (qx > bx.x1) bx.x1 = qx; if (qy < bx.y0) bx.y0 = qy; if (qy > bx.y1) bx.y1 = qy;
          if (qx > 0 && m[q - 1] && !lab[q - 1]) { lab[q - 1] = id; stack.push(q - 1); }
          if (qx < w - 1 && m[q + 1] && !lab[q + 1]) { lab[q + 1] = id; stack.push(q + 1); }
          if (qy > 0 && m[q - w] && !lab[q - w]) { lab[q - w] = id; stack.push(q - w); }
          if (qy < h - 1 && m[q + w] && !lab[q + w]) { lab[q + w] = id; stack.push(q + w); }
        }
        boxes.push(bx);
      }
      boxes.forEach(function (b) {
        var bw = (b.x1 - b.x0 + 1 - 2 * R) / k, bh = (b.y1 - b.y0 + 1 - 2 * R) / k, ratio = bw / bh;
        if (bw > c.width * 0.18 && bh > c.height * 0.05 && ratio > 1.35 && ratio < 1.9) out.push({ x: (b.x0 + R) / k, y: (b.y0 + R) / k, width: bw, height: bh });
      });
      out = out.filter(function (b) { return !out.some(function (o) { return o !== b && o.width * o.height > b.width * b.height && b.x >= o.x && b.y >= o.y && b.x + b.width <= o.x + o.width && b.y + b.height <= o.y + o.height; }); });
      out.sort(function (a, b) { return Math.abs(a.y - b.y) > a.height * 0.5 ? a.y - b.y : a.x - b.x; });
    } catch (e) {}
    return out.slice(0, 6);
  }

  function iou(a, b) {
    var x0 = Math.max(a.x, b.x), y0 = Math.max(a.y, b.y), x1 = Math.min(a.x + a.width, b.x + b.width), y1 = Math.min(a.y + a.height, b.y + b.height);
    if (x1 <= x0 || y1 <= y0) return 0; var i = (x1 - x0) * (y1 - y0); return i / (a.width * a.height + b.width * b.height - i);
  }
  function mergeBoxes(list) {
    var out = [];
    list.forEach(function (b) { if (!out.some(function (o) { return iou(o, b) > 0.55; })) out.push(b); });
    // drop a box that holds two or more others (a frame around both cards)
    out = out.filter(function (b) { return out.filter(function (o) { return o !== b && o.x >= b.x - 3 && o.y >= b.y - 3 && o.x + o.width <= b.x + b.width + 3 && o.y + o.height <= b.y + b.height + 3; }).length < 2; });
    out.sort(function (a, b) { return Math.abs(a.y - b.y) > a.height * 0.5 ? a.y - b.y : a.x - b.x; });
    return out;
  }
  // card outlines: thin printed borders (e-Aadhaar, e-PAN, PVC sheets), even with rounded corners
  function lineCards(c) {
    var out = [];
    try {
      var k = Math.min(1, 900 / Math.max(c.width, c.height)), w = Math.round(c.width * k), h = Math.round(c.height * k);
      var t = canvas(w, h), x = t.getContext('2d'); x.drawImage(c, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data, m = new Uint8Array(w * h), i, y;
      for (i = 0; i < w * h; i++) { var r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2]; m[i] = (0.3 * r + 0.59 * g + 0.11 * b < 222 || Math.max(r, g, b) - Math.min(r, g, b) > 50) ? 1 : 0; }
      var minH = Math.round(Math.min(w, h) * 0.16), hs = [];
      for (y = 0; y < h; y++) {
        var run = 0, gapN = 0, x0 = 0;
        for (var xx = 0; xx <= w; xx++) {
          var on = xx < w && m[y * w + xx];
          if (on) { if (!run) x0 = xx; run = xx - x0 + 1; gapN = 0; }
          else if (run) { if (++gapN > 3 || xx === w) { if (run >= minH) hs.push({ y: y, x0: x0, x1: x0 + run - 1 }); run = 0; gapN = 0; } }
        }
      }
      // merge neighbouring rows into one line
      var L = [];
      hs.forEach(function (s) {
        var o = L.find(function (l) { return s.y - l.y1 <= 2 && Math.abs(s.x0 - l.x0) < 6 && Math.abs(s.x1 - l.x1) < 6; });
        if (o) o.y1 = s.y; else L.push({ y0: s.y, y1: s.y, x0: s.x0, x1: s.x1 });
      });
      L = L.filter(function (l) { return l.y1 - l.y0 <= 6; });   // a border is thin; a filled bar is not
      if (L.length > 400) L = L.slice(0, 400);
      function colCover(cx, ya, yb) { var n = 0; for (var yy = ya; yy <= yb; yy++) if (m[yy * w + cx]) n++; return n / Math.max(1, yb - ya + 1); }
      // nearest column to the line's end that runs most of the height (not the neighbour card's border)
      function edge(from, to, ya, yb) { var st = from < to ? 1 : -1; for (var cx = from; st > 0 ? cx <= to : cx >= to; cx += st) { if (cx < 0 || cx >= w) continue; if (colCover(cx, ya, yb) > 0.72) { while (cx + st >= 0 && cx + st < w && colCover(cx + st, ya, yb) > 0.72) cx += st; return cx; } } return -1; }
      for (var a = 0; a < L.length; a++) for (var bI = a + 1; bI < L.length; bI++) {
        var A = L[a], B = L[bI], hh = B.y0 - A.y1; if (hh < h * 0.04) continue;
        if (Math.abs(A.x0 - B.x0) > 8 || Math.abs(A.x1 - B.x1) > 8) continue;
        var rr = Math.round(Math.min(w, h) * 0.035), ya = A.y1 + rr, yb = B.y0 - rr; if (yb - ya < 6) continue;
        var lx = edge(Math.min(A.x0, B.x0) + 3, Math.min(A.x0, B.x0) - rr - 2, ya, yb), rx = edge(Math.max(A.x1, B.x1) - 3, Math.max(A.x1, B.x1) + rr + 2, ya, yb);
        if (lx < 0 || rx < 0) continue;
        var bw = rx - lx + 1, bh = B.y1 - A.y0 + 1, ratio = bw / bh;
        if (!((ratio > 1.35 && ratio < 1.95) || (ratio > 0.51 && ratio < 0.75))) continue;
        out.push({ x: lx / k, y: A.y0 / k, width: bw / k, height: bh / k });
      }
      // inner/outer double borders → keep the outer one
      out = out.filter(function (b) { return !out.some(function (o) { return o !== b && o.width * o.height > b.width * b.height && iou(o, b) > 0.7; }); });
    } catch (e) {}
    return out;
  }
  function cut(src, r) { var c = canvas(r.width, r.height); c.getContext('2d').drawImage(src, r.x, r.y, r.width, r.height, 0, 0, c.width, c.height); return c; }

  // =====================================================================
  function Editor(host, opts) {
    opts = opts || {};
    var E = this, items = [], seq = 0, sel = null, view = { ppm: 2.4 }, paper = opts.paper || 'A4', orient = opts.orient || 'portrait';
    var margin = opts.margin != null ? opts.margin : 6, gap = opts.gap != null ? opts.gap : 4, tpl = 'template' in opts ? opts.template : [2, 2], cut$ = opts.cut != null ? opts.cut : true;
    var pages = 1, custom = opts.custom || [210, 297];
    E.items = items;

    // ---------- DOM ----------
    host.classList.add('sh-root'); host.innerHTML = '';
    var top = el('div', 'sh-top');
    top.innerHTML = '<div class="sh-title"><b>' + (opts.title || 'MultiSide Doc') + '</b><span class="sh-sub"></span></div>' +
      '<div class="sh-zoom"><button type="button" data-z="-1" aria-label="Zoom out">' + IC.zout + '</button><button type="button" data-z="0" class="sh-fitbtn">Fit</button><button type="button" data-z="1" aria-label="Zoom in">' + IC.zin + '</button></div>' +
      '<div class="sh-out"><button type="button" class="sh-btn sh-main" data-o="print">Print</button><button type="button" class="sh-btn" data-o="pdf">PDF</button><button type="button" class="sh-btn" data-o="jpg">JPG</button>' + (opts.onClose ? '<button type="button" class="sh-close" aria-label="Close">×</button>' : '') + '</div>';
    var stage = el('div', 'sh-stage'), pagesBox = el('div', 'sh-pages'); stage.appendChild(pagesBox);
    var ctx = el('div', 'sh-ctx'); ctx.hidden = true;
    ctx.innerHTML = [['rot', 'Turn', IC.rot], ['size', 'Size', IC.size], ['crop', 'Crop', IC.crop], ['cards', 'Find cards', IC.cards], ['dup', 'Copy', IC.dup], ['next', 'Next page', IC.next], ['del', 'Delete', IC.del]]
      .map(function (b) { return '<button type="button" data-a="' + b[0] + '"><span>' + b[2] + '</span>' + b[1] + '</button>'; }).join('');
    var bar = el('nav', 'sh-bar');
    bar.innerHTML = '<button type="button" data-p="add"><span>' + IC.add + '</span>ADD</button><button type="button" data-p="sheet"><span>' + IC.sheet + '</span>SHEET</button><button type="button" data-p="tpl"><span>' + IC.tpl + '</span>TEMPLATE</button>';
    var panel = el('div', 'sh-panel'); panel.hidden = true;
    var file = el('input'); file.type = 'file'; file.accept = 'image/*,application/pdf'; file.multiple = true; file.hidden = true;
    var tip = el('p', 'sh-tip', 'Drag to move · pinch or drag a corner to resize · scroll wheel to resize on PC');
    host.appendChild(top); host.appendChild(stage); host.appendChild(tip); host.appendChild(ctx); host.appendChild(panel); host.appendChild(bar); host.appendChild(file);
    var busyEl = el('div', 'sh-busy', '<span></span><b>Working…</b><button type="button" class="sh-btn sh-stop">Cancel</button>'); busyEl.hidden = true; host.appendChild(busyEl);
    var stopFlag = false;
    busyEl.querySelector('.sh-stop').onclick = function () { stopFlag = true; busy(false); };
    function busy(on, t) { busyEl.hidden = !on; if (t) busyEl.querySelector('b').textContent = t; if (on) busyEl.querySelector('.sh-stop').hidden = false; }
    // empty page: one big button to add photos or a PDF
    var empty = el('div', 'sh-empty', '<button type="button" class="sh-big sh-addnow"><span>' + IC.add + '</span>Add photos or PDF</button><p>Gallery, camera or PDF (password PDFs too). Small documents are cropped automatically.</p>');
    stage.appendChild(empty);
    empty.querySelector('button').onclick = function () { file.removeAttribute('capture'); file.click(); };

    function paperMM() {
      var p = paper === 'custom' ? custom : PAPERS[paper] || PAPERS.A4, W = Math.min(p[0], p[1]), H = Math.max(p[0], p[1]);
      return orient === 'landscape' ? [H, W] : [W, H];
    }

    // ---------- panels ----------
    function openPanel(which) {
      if (!panel.hidden && panel.dataset.p === which) { panel.hidden = true; [].forEach.call(bar.children, function (b) { b.classList.remove('on'); }); return; }
      panel.dataset.p = which; panel.hidden = false;
      [].forEach.call(bar.children, function (b) { b.classList.toggle('on', b.dataset.p === which); });
      if (which === 'add') {
        panel.innerHTML = '<div class="sh-addrow"><button type="button" class="sh-big" data-add="file"><span>' + IC.add + '</span>Photos or PDF</button><button type="button" class="sh-big" data-add="cam"><span>' + IC.crop + '</span>Take a photo</button></div>' +
          '<label class="sh-check"><input type="checkbox" id="sh-auto" checked> Auto-crop documents (you can crop again)</label>' +
          '<label class="sh-check"><input type="checkbox" id="sh-cards" checked> PDF: take out ID cards automatically (e-Aadhaar, e-PAN)</label>';
        panel.querySelector('[data-add=file]').onclick = function () { file.removeAttribute('capture'); file.click(); };
        panel.querySelector('[data-add=cam]').onclick = function () { file.setAttribute('capture', 'environment'); file.click(); };
      } else if (which === 'sheet') {
        panel.innerHTML = '<div class="sh-grid2">' +
          '<label>Paper<select data-k="paper">' + Object.keys(PAPERS).map(function (k) { return '<option value="' + k + '"' + (k === paper ? ' selected' : '') + '>' + (k === '4x6' ? '4 × 6 in' : k === '5x7' ? '5 × 7 in' : k) + '</option>'; }).join('') + '<option value="custom"' + (paper === 'custom' ? ' selected' : '') + '>Custom (mm)</option></select></label>' +
          '<label>Orientation<select data-k="orient"><option value="portrait"' + (orient === 'portrait' ? ' selected' : '') + '>Portrait</option><option value="landscape"' + (orient === 'landscape' ? ' selected' : '') + '>Landscape</option></select></label>' +
          '<label class="sh-cw"' + (paper === 'custom' ? '' : ' hidden') + '>Width mm<input type="number" data-k="cw" value="' + custom[0] + '"></label><label class="sh-cw"' + (paper === 'custom' ? '' : ' hidden') + '>Height mm<input type="number" data-k="ch" value="' + custom[1] + '"></label>' +
          '<label>Margin (mm)<input type="number" data-k="margin" min="0" max="40" step="0.5" value="' + margin + '"></label>' +
          '<label>Gap (mm)<input type="number" data-k="gap" min="0" max="40" step="0.5" value="' + gap + '"></label></div>' +
          '<label class="sh-check"><input type="checkbox" data-k="cut"' + (cut$ ? ' checked' : '') + '> Cut lines around each document</label>' +
          '<div class="sh-paperslot"></div><div class="sh-row"><button type="button" class="sh-btn" data-k="addpage">+ Add a page</button><button type="button" class="sh-btn" data-k="delpage">− Remove last page</button></div>';
        if (window.SPPaper) SPPaper.mount(panel.querySelector('.sh-paperslot'));
        panel.querySelectorAll('[data-k]').forEach(function (inp) {
          var k = inp.dataset.k;
          if (k === 'addpage') { inp.onclick = function () { pages++; render(); }; return; }
          if (k === 'delpage') { inp.onclick = function () { if (pages > 1 && !items.some(function (i) { return i.page === pages - 1; })) { pages--; render(); } else toast('The last page still has documents.'); }; return; }
          inp.addEventListener('change', function () {
            if (k === 'paper') { paper = inp.value; panel.querySelectorAll('.sh-cw').forEach(function (l) { l.hidden = paper !== 'custom'; }); }
            else if (k === 'orient') orient = inp.value;
            else if (k === 'cw') custom[0] = Math.max(30, +inp.value || 210);
            else if (k === 'ch') custom[1] = Math.max(30, +inp.value || 297);
            else if (k === 'margin') margin = Math.max(0, +inp.value || 0);
            else if (k === 'gap') gap = Math.max(0, +inp.value || 0);
            else if (k === 'cut') cut$ = inp.checked;
            if (k !== 'cut') applyTemplate(); fitView(); render();
          });
        });
      } else if (which === 'tpl') {
        panel.innerHTML = '<div class="sh-tpls">' + TEMPLATES.map(function (t) {
          var cells = ''; for (var r = 0; r < t[1]; r++) for (var c = 0; c < t[0]; c++) cells += '<i style="left:' + (c * 100 / t[0]) + '%;top:' + (r * 100 / t[1]) + '%;width:' + (100 / t[0]) + '%;height:' + (100 / t[1]) + '%"></i>';
          return '<button type="button" data-t="' + t[0] + 'x' + t[1] + '"' + (tpl && tpl[0] === t[0] && tpl[1] === t[1] ? ' aria-pressed="true"' : '') + '><span class="sh-tg">' + cells + '</span>' + t[0] + '×' + t[1] + '</button>';
        }).join('') + '<button type="button" data-t="free"' + (!tpl ? ' aria-pressed="true"' : '') + '><span class="sh-tg sh-free"></span>Free</button></div><p class="sh-note">Columns × rows. Free keeps every document where you put it.</p>';
        panel.querySelectorAll('[data-t]').forEach(function (b) {
          b.onclick = function () {
            var v = b.dataset.t; tpl = v === 'free' ? null : v.split('x').map(Number);
            panel.querySelectorAll('[data-t]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
            applyTemplate(); render();
          };
        });
      }
    }
    bar.addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (b) openPanel(b.dataset.p); });
    file.addEventListener('change', function () { addFiles(file.files); file.value = ''; });

    // ---------- template layout ----------
    function cellRect(idx) {
      var P = paperMM(), cols = tpl[0], rows = tpl[1], per = cols * rows, pg = Math.floor(idx / per), k = idx % per;
      var cw = (P[0] - 2 * margin - (cols - 1) * gap) / cols, ch = (P[1] - 2 * margin - (rows - 1) * gap) / rows;
      return { page: pg, x: margin + (k % cols) * (cw + gap), y: margin + Math.floor(k / cols) * (ch + gap), w: cw, h: ch };
    }
    function placeInCell(it, idx) {
      var r = cellRect(idx), a = it.c.width / it.c.height, w = r.w, h = w / a;
      if (h > r.h) { h = r.h; w = h * a; }
      if (it.real) { var rw = it.real[0], rh = it.real[1]; if (rw <= r.w + 0.5 && rh <= r.h + 0.5) { w = rw; h = rh; } }
      it.page = r.page; it.w = w; it.h = h; it.x = r.x + (r.w - w) / 2; it.y = r.y + (r.h - h) / 2;
      pages = Math.max(pages, r.page + 1);
    }
    function applyTemplate() {
      if (!tpl) return;
      items.forEach(function (it, i) { placeInCell(it, i); });
      var need = items.length ? Math.max.apply(null, items.map(function (i) { return i.page; })) + 1 : 1; pages = Math.max(1, need);
    }

    // ---------- items ----------
    function addItem(c, o) {
      o = o || {};
      var it = { id: ++seq, c: c, src: o.src || c, rect: o.rect || null, real: o.real || null, page: 0, x: 0, y: 0, w: 50, h: 50 };
      items.push(it);
      if (o.place) { it.page = o.place.page; it.x = o.place.x; it.y = o.place.y; it.w = o.place.w; it.h = o.place.h; pages = Math.max(pages, it.page + 1); }
      else if (tpl) placeInCell(it, items.length - 1);
      else { var P = paperMM(), a = c.width / c.height, w = Math.min(P[0] * 0.6, (o.real && o.real[0]) || P[0] * 0.6), h = w / a; it.page = pages - 1; it.w = w; it.h = h; it.x = (P[0] - w) / 2; it.y = (P[1] - h) / 2; }
      return it;
    }
    E.addCanvas = function (c, o) { var it = addItem(c, o); render(); return it; };

    function late(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); })]); }
    var SMALL = (window.innerWidth || 1000) < 820 || /Android|iPhone|iPad/i.test(navigator.userAgent);
    async function loadPdf(f, onPage) {
      var lib = window.pdfjsLib; if (!lib) { toast('PDF reader did not load.'); return 0; }
      try { if (!lib.GlobalWorkerOptions.workerSrc || lib.version === '2.16.105') lib.GlobalWorkerOptions.workerSrc = (opts.base || '../') + 'assets/vendor/pdf.worker.min.js'; } catch (e) {}
      var known = (window.SPPw && SPPw.list()) || [], tryAt = 0, cancelled = false;
      var task = lib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) });
      task.onPassword = function (upd, reason) {
        if (tryAt < known.length) { upd(known[tryAt++]); return; }   // passwords you already typed on this page
        busy(false);
        askPass(f.name, reason === 2 && tryAt === 0 ? true : reason === 2 && tryAt > known.length).then(function (pw) {
          if (pw == null) { cancelled = true; try { task.destroy(); } catch (e) {} }
          else { tryAt = known.length + 1; if (window.SPPw) SPPw.add(pw); busy(true, 'Opening…'); upd(pw); }
        });
      };
      var pdf; try { pdf = await task.promise; } catch (e) { if (!cancelled) toast('Could not open ' + f.name); return 0; }
      var n = Math.min(pdf.numPages, 30), got = 0, MAXPX = SMALL ? 1900 : 2600;
      for (var i = 1; i <= n && !stopFlag; i++) {
        busy(true, 'Reading page ' + i + (n > 1 ? ' of ' + n : '') + '…');
        try {
          var p = await late(pdf.getPage(i), 20000), v1 = p.getViewport({ scale: 1 }), c = null;
          for (var tryN = 0; tryN < 2 && !c && !stopFlag; tryN++) {
            var sc = Math.min(200 / 72, (tryN ? MAXPX * 0.6 : MAXPX) / Math.max(v1.width, v1.height)), vp = p.getViewport({ scale: sc });
            var cc = canvas(vp.width, vp.height), x = cc.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cc.width, cc.height);
            var rt = p.render({ canvasContext: x, viewport: vp });
            try { await late(rt.promise, tryN ? 30000 : 25000); c = cc; } catch (e) { try { rt.cancel(); } catch (e2) {} cc.width = cc.height = 1; }
          }
          if (c) { got++; onPage({ c: c, mm: [v1.width / 72 * MM, v1.height / 72 * MM] }); }
          else toast('Page ' + i + ' took too long and was skipped.');
          try { p.cleanup(); } catch (e) {}
        } catch (e) { toast('Page ' + i + ' could not be read.'); }
        await new Promise(function (r) { setTimeout(r, 0); });
      }
      try { pdf.destroy(); } catch (e) {}
      return got;
    }
    async function addFiles(list) {
      list = [].slice.call(list || []); if (!list.length) return;
      var auto = !panel.querySelector('#sh-auto') || panel.querySelector('#sh-auto').checked;
      var cardsOn = !panel.querySelector('#sh-cards') || panel.querySelector('#sh-cards').checked;
      stopFlag = false; busy(true, 'Opening…');
      panel.hidden = true; [].forEach.call(bar.children, function (b) { b.classList.remove('on'); });
      var first = !items.length;
      function show() { if (first) { fitView(); first = false; } render(); }
      for (var i = 0; i < list.length && !stopFlag; i++) {
        var f = list[i];
        if (list.length > 1) busy(true, 'Opening ' + (i + 1) + ' of ' + list.length + '…');
        try {
          if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) {
            await loadPdf(f, function (pg) {
              var cards = cardsOn ? findCards(pg.c) : [];
              if (cards.length) cards.forEach(function (r) { addItem(cut(pg.c, r), { src: pg.c, rect: r, real: realOf(r) }); });
              else addItem(pg.c, { real: pg.mm });
              show();
            });
          } else {
            var img = await late(decode(f), 30000), r = auto ? (autoBox(img) || null) : null;
            var cs = !r && auto ? findCards(img) : [];
            if (cs.length > 1) cs.forEach(function (q) { addItem(cut(img, q), { src: img, rect: q, real: realOf(q) }); });
            else addItem(r ? cut(img, r) : img, { src: img, rect: r });
            show();
          }
        } catch (e) { toast('Could not open ' + f.name); }
        await new Promise(function (r) { setTimeout(r, 0); });
      }
      busy(false); show();
    }
    function realOf(r) { return r.width >= r.height ? [85.6, 54] : [54, 85.6]; }
    async function decode(f) {
      var b;
      try { b = await createImageBitmap(f, { imageOrientation: 'from-image' }); } catch (e) {
        b = await new Promise(function (res, rej) { var u = URL.createObjectURL(f), i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = u; });
      }
      var w = b.width || b.naturalWidth, h = b.height || b.naturalHeight, k = Math.min(1, 3200 / Math.max(w, h)), c = canvas(w * k, h * k);
      c.getContext('2d').drawImage(b, 0, 0, c.width, c.height); return c;
    }
    E.addFiles = addFiles;

    // ---------- render ----------
    function render() {
      var P = paperMM(), ppm = view.ppm;
      pagesBox.innerHTML = '';
      for (var p = 0; p < pages; p++) {
        var pg = el('div', 'sh-page'); pg.style.width = P[0] * ppm + 'px'; pg.style.height = P[1] * ppm + 'px'; pg.dataset.page = p;
        if (tpl) {
          var guides = el('div', 'sh-cells');
          for (var k = 0; k < tpl[0] * tpl[1]; k++) { var r = cellRect(p * tpl[0] * tpl[1] + k), g = el('i'); g.style.cssText = 'left:' + r.x * ppm + 'px;top:' + r.y * ppm + 'px;width:' + r.w * ppm + 'px;height:' + r.h * ppm + 'px'; guides.appendChild(g); }
          pg.appendChild(guides);
        }
        var lbl = el('span', 'sh-pno', (p + 1) + ' / ' + pages); pg.appendChild(lbl);
        pagesBox.appendChild(pg);
      }
      items.forEach(function (it) {
        var pg = pagesBox.children[it.page]; if (!pg) return;
        var d = el('div', 'sh-item' + (it === sel ? ' sel' : '') + (cut$ ? ' cutl' : '')); d.dataset.id = it.id;
        d.style.cssText = 'left:' + it.x * ppm + 'px;top:' + it.y * ppm + 'px;width:' + it.w * ppm + 'px;height:' + it.h * ppm + 'px';
        if (!it._url || it._urlFor !== it.c) { it._url = thumb(it.c, 900).toDataURL('image/jpeg', 0.85); it._urlFor = it.c; }
        var im = el('img'); im.src = it._url; im.alt = ''; im.draggable = false; d.appendChild(im);
        if (it === sel) ['nw', 'ne', 'sw', 'se'].forEach(function (h) { var hd = el('b', 'sh-h sh-' + h); hd.dataset.h = h; d.appendChild(hd); });
        if (it === sel) { var sz = el('span', 'sh-dim', it.w.toFixed(1) + ' × ' + it.h.toFixed(1) + ' mm'); d.appendChild(sz); }
        pg.appendChild(d);
      });
      ctx.hidden = !sel; empty.hidden = items.length > 0;
      top.querySelector('.sh-sub').textContent = items.length + (items.length === 1 ? ' document' : ' documents') + ' · ' + pages + (pages > 1 ? ' pages' : ' page') + ' · ' + (paper === '4x6' ? '4×6 in' : paper) + ' ' + orient;
      if (opts.onChange) opts.onChange(items);
    }
    function fitView() {
      var P = paperMM(), avail = Math.max(200, stage.clientWidth - 28), availH = Math.max(260, (stage.clientHeight || window.innerHeight * 0.6) - 28);
      view.ppm = Math.max(0.6, Math.min(avail / P[0], availH / P[1] * 1.0, 6));
    }
    E.render = render; E.fit = function () { fitView(); render(); };

    // ---------- interaction: drag, corner resize, pinch, wheel ----------
    var ptrs = new Map(), gest = null;
    function itemOf(t) { var d = t.closest && t.closest('.sh-item'); return d ? items.find(function (i) { return i.id === +d.dataset.id; }) : null; }
    function snap(it) {
      var P = paperMM(), s = 1.6, cx = it.x + it.w / 2, cy = it.y + it.h / 2;
      if (Math.abs(cx - P[0] / 2) < s) it.x = P[0] / 2 - it.w / 2;
      if (Math.abs(cy - P[1] / 2) < s) it.y = P[1] / 2 - it.h / 2;
      if (Math.abs(it.x - margin) < s) it.x = margin; if (Math.abs(it.y - margin) < s) it.y = margin;
      if (Math.abs(it.x + it.w - (P[0] - margin)) < s) it.x = P[0] - margin - it.w;
      if (Math.abs(it.y + it.h - (P[1] - margin)) < s) it.y = P[1] - margin - it.h;
    }
    function moveDom(it) {
      var d = pagesBox.querySelector('.sh-item[data-id="' + it.id + '"]'); if (!d) return;
      var ppm = view.ppm; d.style.left = it.x * ppm + 'px'; d.style.top = it.y * ppm + 'px'; d.style.width = it.w * ppm + 'px'; d.style.height = it.h * ppm + 'px';
      var dim = d.querySelector('.sh-dim'); if (dim) dim.textContent = it.w.toFixed(1) + ' × ' + it.h.toFixed(1) + ' mm';
    }
    stage.addEventListener('pointerdown', function (e) {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      var it = itemOf(e.target), h = e.target.dataset && e.target.dataset.h;
      if (ptrs.size === 1) {
        if (it) {
          if (sel !== it) { sel = it; render(); }
          stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
          gest = { type: h ? 'resize' : 'move', it: it, h: h, sx: e.clientX, sy: e.clientY, o: { x: it.x, y: it.y, w: it.w, h: it.h } };
          e.preventDefault();
        } else if (!e.target.closest('.sh-ctx')) { if (sel) { sel = null; render(); } gest = null; }
      } else if (ptrs.size === 2) {
        var a = Array.from(ptrs.values()), dist = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        gest = sel ? { type: 'pinch', it: sel, d0: dist, o: { x: sel.x, y: sel.y, w: sel.w, h: sel.h } } : { type: 'vzoom', d0: dist, p0: view.ppm };
        e.preventDefault();
      }
    });
    stage.addEventListener('pointermove', function (e) {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!gest) return;
      var ppm = view.ppm, it = gest.it;
      if (gest.type === 'move') {
        it.x = gest.o.x + (e.clientX - gest.sx) / ppm; it.y = gest.o.y + (e.clientY - gest.sy) / ppm; snap(it); moveDom(it);
      } else if (gest.type === 'resize') {
        var dx = (e.clientX - gest.sx) / ppm, a = gest.o.w / gest.o.h, w = gest.o.w + (gest.h.indexOf('e') >= 0 ? dx : -dx);
        w = Math.max(8, w); var hh = w / a;
        it.w = w; it.h = hh;
        it.x = gest.h.indexOf('w') >= 0 ? gest.o.x + gest.o.w - w : gest.o.x;
        it.y = gest.h.indexOf('n') >= 0 ? gest.o.y + gest.o.h - hh : gest.o.y;
        moveDom(it);
      } else if (gest.type === 'pinch' && ptrs.size >= 2) {
        var b = Array.from(ptrs.values()), dist = Math.hypot(b[0].x - b[1].x, b[0].y - b[1].y), k = Math.max(0.1, dist / gest.d0);
        var cx = gest.o.x + gest.o.w / 2, cy = gest.o.y + gest.o.h / 2;
        it.w = Math.max(8, gest.o.w * k); it.h = it.w * gest.o.h / gest.o.w; it.x = cx - it.w / 2; it.y = cy - it.h / 2; moveDom(it);
      } else if (gest.type === 'vzoom' && ptrs.size >= 2) {
        var c2 = Array.from(ptrs.values()), d2 = Math.hypot(c2[0].x - c2[1].x, c2[0].y - c2[1].y);
        view.ppm = Math.max(0.6, Math.min(12, gest.p0 * d2 / gest.d0)); render();
      }
    });
    function endPtr(e) {
      ptrs.delete(e.pointerId);
      if (gest && (gest.type === 'move' || gest.type === 'resize' || gest.type === 'pinch') && ptrs.size === 0) { if (tpl && gest.type !== 'move') {} tplFreeIfMoved(); render(); }
      if (ptrs.size === 0) gest = null;
    }
    function tplFreeIfMoved() { /* once something is moved by hand, keep it where it is */ }
    stage.addEventListener('pointerup', endPtr); stage.addEventListener('pointercancel', endPtr);
    stage.addEventListener('wheel', function (e) {
      var it = itemOf(e.target);
      if (it && it === sel) { e.preventDefault(); var k = e.deltaY < 0 ? 1.04 : 1 / 1.04, cx = it.x + it.w / 2, cy = it.y + it.h / 2; it.w = Math.max(8, it.w * k); it.h = it.h * k; it.x = cx - it.w / 2; it.y = cy - it.h / 2; moveDom(it); }
      else if (e.ctrlKey) { e.preventDefault(); view.ppm = Math.max(0.6, Math.min(12, view.ppm * (e.deltaY < 0 ? 1.1 : 1 / 1.1))); render(); }
    }, { passive: false });
    document.addEventListener('keydown', function (e) {
      if (!sel || !host.isConnected || /INPUT|SELECT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName)) return;
      var st = e.shiftKey ? 5 : 0.5, hit = true;
      if (e.key === 'ArrowLeft') sel.x -= st; else if (e.key === 'ArrowRight') sel.x += st; else if (e.key === 'ArrowUp') sel.y -= st; else if (e.key === 'ArrowDown') sel.y += st;
      else if (e.key === 'Delete' || e.key === 'Backspace') { removeSel(); } else hit = false;
      if (hit) { e.preventDefault(); render(); }
    });
    top.querySelector('.sh-zoom').addEventListener('click', function (e) {
      var b = e.target.closest('[data-z]'); if (!b) return; var z = +b.dataset.z;
      if (z === 0) fitView(); else view.ppm = Math.max(0.6, Math.min(12, view.ppm * (z > 0 ? 1.2 : 1 / 1.2)));
      render();
    });

    // ---------- context toolbar ----------
    function removeSel() { if (!sel) return; items.splice(items.indexOf(sel), 1); sel = null; render(); }
    ctx.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b || !sel) return; var a = b.dataset.a, it = sel;
      if (a === 'rot') { var cx = it.x + it.w / 2, cy = it.y + it.h / 2; it.c = rotateCanvas(it.c, 90); var t = it.w; it.w = it.h; it.h = t; it.x = cx - it.w / 2; it.y = cy - it.h / 2; it.rot = ((it.rot || 0) + 90) % 360; render(); }
      else if (a === 'dup') { var n = addItem(it.c, { src: it.src, rect: it.rect, real: it.real, place: { page: it.page, x: it.x + 4, y: it.y + 4, w: it.w, h: it.h } }); n.rot = it.rot; sel = n; render(); }
      else if (a === 'del') removeSel();
      else if (a === 'next') { it.page++; if (it.page >= pages) pages = it.page + 1; render(); }
      else if (a === 'size') sizeMenu(it);
      else if (a === 'crop') cropItem(it);
      else if (a === 'cards') {
        var cs = findCards(it.src); if (!cs.length) { toast('No ID card found on this document.'); return; }
        var at = items.indexOf(it); items.splice(at, 1);
        cs.forEach(function (r) { addItem(cut(it.src, r), { src: it.src, rect: r, real: [85.6, 54] }); });
        sel = null; applyTemplate(); render(); toast(cs.length + ' card(s) found.');
      }
    });
    function sizeMenu(it) {
      var m = el('div', 'sh-sizemenu');
      m.innerHTML = '<b>Size of this document</b>' + SIZES.map(function (s) { return '<button type="button" data-s="' + s[0] + '">' + s[1] + '</button>'; }).join('') +
        '<div class="sh-grid2"><label>Width mm<input type="number" step="0.1" value="' + it.w.toFixed(1) + '" data-s2="w"></label><label>Height mm<input type="number" step="0.1" value="' + it.h.toFixed(1) + '" data-s2="h"></label></div>' +
        '<label class="sh-check"><input type="checkbox" checked data-s2="lock"> Keep shape</label><button type="button" class="sh-btn sh-main" data-s="ok">Done</button>';
      host.appendChild(m);
      var P = paperMM(), cx = it.x + it.w / 2, cy = it.y + it.h / 2;
      function set(w, h) { it.w = w; it.h = h; it.x = cx - w / 2; it.y = cy - h / 2; render(); m.querySelector('[data-s2=w]').value = w.toFixed(1); m.querySelector('[data-s2=h]').value = h.toFixed(1); }
      m.addEventListener('click', function (e) {
        var b = e.target.closest('[data-s]'); if (!b) return; var s = b.dataset.s, a = it.c.width / it.c.height;
        if (s === 'ok') { m.remove(); return; }
        if (s === 'fit') { if (tpl) { placeInCell(it, items.indexOf(it)); render(); } else { var w = P[0] - 2 * margin, h = w / a; if (h > P[1] - 2 * margin) { h = P[1] - 2 * margin; w = h * a; } set(w, h); } }
        else if (s === 'id') set(85.6, 54); else if (s === 'idv') set(54, 85.6); else if (s === 'long') set(171.2, 54); else if (s === 'pp') set(30.48, 38.1);
        else if (s === 'a5') { var w5 = 148, h5 = 210; if (a > 1) { w5 = 210; h5 = 148; } set(w5, h5); }
        else if (s === 'page') { cx = P[0] / 2; cy = P[1] / 2; set(P[0], P[1]); }
      });
      m.querySelectorAll('[data-s2=w],[data-s2=h]').forEach(function (inp) {
        inp.addEventListener('change', function () {
          var lock = m.querySelector('[data-s2=lock]').checked, w = +m.querySelector('[data-s2=w]').value, h = +m.querySelector('[data-s2=h]').value, a = it.w / it.h;
          if (lock) { if (inp.dataset.s2 === 'w') h = w / a; else w = h * a; }
          if (w > 3 && h > 3) set(w, h);
        });
      });
    }
    // re-crop from the original picture (rotate / straighten / free shape)
    function cropItem(it) {
      if (!window.Cropper) { toast('Crop tool did not load.'); return; }
      var m = el('div', 'sh-cropm');
      m.innerHTML = '<div class="sh-cropbox"><div class="sh-croptop"><b>Crop</b><button type="button" data-c="x" aria-label="Close">×</button></div><div class="sh-cropstage"><img alt=""></div>' +
        '<div class="sh-croptools"><button type="button" data-c="l">↶</button><button type="button" data-c="r">↷</button><button type="button" data-c="m1">−1°</button><button type="button" data-c="p1">+1°</button><button type="button" data-c="auto">Auto</button><button type="button" data-c="all">Whole</button><button type="button" data-c="id">ID card shape</button><button type="button" data-c="free">Free shape</button></div>' +
        '<div class="sh-cropfoot"><button type="button" class="sh-btn" data-c="x">Cancel</button><button type="button" class="sh-btn sh-main" data-c="ok">Done</button></div></div>';
      host.appendChild(m);
      var img = m.querySelector('img'), cr;
      img.onload = function () {
        cr = new Cropper(img, { viewMode: 1, dragMode: 'move', autoCropArea: 1, background: false, toggleDragModeOnDblclick: false, ready: function () { if (it.rect) cr.setData(it.rect); } });
      };
      img.src = it.src.toDataURL('image/jpeg', 0.92);
      m.addEventListener('click', function (e) {
        var b = e.target.closest('[data-c]'); if (!b) return; var c = b.dataset.c;
        if (c === 'x') { cr && cr.destroy(); m.remove(); return; }
        if (!cr) return;
        if (c === 'l') cr.rotate(-90); else if (c === 'r') cr.rotate(90); else if (c === 'm1') cr.rotate(-1); else if (c === 'p1') cr.rotate(1);
        else if (c === 'all') { cr.setAspectRatio(NaN); cr.setData({ x: 0, y: 0, width: it.src.width, height: it.src.height }); }
        else if (c === 'auto') { var r = autoBox(it.src) || findCards(it.src)[0]; if (r) { cr.setAspectRatio(NaN); cr.setData(r); } else toast('Could not find the edges — crop by hand.'); }
        else if (c === 'id') cr.setAspectRatio(85.6 / 54); else if (c === 'free') cr.setAspectRatio(NaN);
        else if (c === 'ok') {
          var d = cr.getData(), out = cr.getCroppedCanvas({ fillColor: '#fff', imageSmoothingQuality: 'high', maxWidth: 4000, maxHeight: 4000 });
          var cx = it.x + it.w / 2, cy = it.y + it.h / 2, area = it.w * it.h;
          it.rect = { x: d.x, y: d.y, width: d.width, height: d.height }; it.c = out; it.rot = 0;
          var a = out.width / out.height, h = Math.sqrt(area / a), w = h * a; it.w = w; it.h = h; it.x = cx - w / 2; it.y = cy - h / 2;
          if (tpl) placeInCell(it, items.indexOf(it));
          cr.destroy(); m.remove(); render();
        }
      });
    }

    // ---------- password ----------
    function askPass(name, retry) {
      return new Promise(function (res) {
        var m = el('div', 'sh-cropm');
        m.innerHTML = '<form class="sh-cropbox sh-small"><div class="sh-croptop"><b>PDF password</b></div><p class="sh-note" style="padding:0 16px">' + name.replace(/</g, '&lt;') + (retry ? ' — wrong password, try again.' : ' is protected.') + ' e-Aadhaar: first 4 letters of the name in CAPITALS + birth year · e-PAN: date of birth DDMMYYYY.</p><input type="text" class="sh-pass" autocomplete="off" autocapitalize="characters" placeholder="Password"><div class="sh-cropfoot"><button type="button" class="sh-btn" data-c="x">Cancel</button><button type="submit" class="sh-btn sh-main">Open</button></div></form>';
        host.appendChild(m); var inp = m.querySelector('input'); setTimeout(function () { inp.focus(); }, 50);
        m.querySelector('form').onsubmit = function (e) { e.preventDefault(); m.remove(); res(inp.value); };
        m.querySelector('[data-c=x]').onclick = function () { m.remove(); res(null); };
      });
    }
    function toast(t) {
      var x = host.querySelector('.sh-toast') || host.appendChild(el('div', 'sh-toast'));
      x.textContent = t; x.classList.add('on'); clearTimeout(x._t); x._t = setTimeout(function () { x.classList.remove('on'); }, 2600);
    }

    // ---------- output ----------
    function drawPage(p, dpi) {
      var P = paperMM(), k = dpi / MM, c = canvas(P[0] * k, P[1] * k), x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.imageSmoothingQuality = 'high';
      items.filter(function (i) { return i.page === p; }).forEach(function (it) {
        x.drawImage(it.c, it.x * k, it.y * k, it.w * k, it.h * k);
        if (cut$) { x.lineWidth = Math.max(1, 0.18 * k); x.strokeStyle = '#9aa4b0'; x.strokeRect(it.x * k, it.y * k, it.w * k, it.h * k); }
      });
      return c;
    }
    async function renderAll() {
      var P = paperMM(), out = [];
      for (var p = 0; p < pages; p++) {
        if (!items.some(function (i) { return i.page === p; })) continue;
        busy(true, 'Preparing page ' + (p + 1) + '…'); await new Promise(function (r) { setTimeout(r, 0); });
        var c = drawPage(p, (window.SPPaper && SPPaper.dpi()) || DPI); if (window.SPPaper) SPPaper.tune(c); out.push({ W: P[0], H: P[1], url: c.toDataURL('image/jpeg', 0.95) }); c.width = c.height = 1;
      }
      busy(false); return out;
    }
    function save(name, url) { var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 800); }
    top.querySelector('.sh-out').addEventListener('click', async function (e) {
      var b = e.target.closest('[data-o],.sh-close'); if (!b) return;
      if (b.classList.contains('sh-close')) { opts.onClose && opts.onClose(); return; }
      if (!items.length) { toast('Add a document first.'); return; }
      var out = await renderAll(); if (!out.length) return;
      var o = b.dataset.o, name = 'SPrinter-Sheet-' + (paper === '4x6' ? '4x6' : paper);
      if (o === 'jpg') out.forEach(function (p, i) { setTimeout(function () { save(name + (out.length > 1 ? '-' + (i + 1) : '') + '.jpg', p.url); }, i * 400); });
      else if (o === 'pdf') {
        var J = window.jspdf && window.jspdf.jsPDF; if (!J) { toast('PDF maker did not load.'); return; }
        var or = function (p) { return p.W > p.H ? 'landscape' : 'portrait'; }, pdf = new J({ unit: 'mm', format: [out[0].W, out[0].H], orientation: or(out[0]) });
        out.forEach(function (p, i) { if (i) pdf.addPage([p.W, p.H], or(p)); pdf.addImage(p.url, 'JPEG', 0, 0, p.W, p.H, undefined, 'FAST'); });
        save(name + '.pdf', URL.createObjectURL(pdf.output('blob')));
      } else {
        var root = document.getElementById('cp-print-root') || document.body.appendChild(Object.assign(el('div'), { id: 'cp-print-root' }));
        root.innerHTML = '';
        var style = document.getElementById('cp-print-style') || document.head.appendChild(Object.assign(el('style'), { id: 'cp-print-style' }));
        style.textContent = '#cp-print-root{display:none}@media print{@page{size:' + out[0].W + 'mm ' + out[0].H + 'mm;margin:0}html,body{margin:0!important;padding:0!important}body.cp-printing>*:not(#cp-print-root){display:none!important}body.cp-printing #cp-print-root{display:block!important}#cp-print-root img{display:block;width:' + out[0].W + 'mm;height:' + out[0].H + 'mm;break-after:page}#cp-print-root img:last-child{break-after:auto}}';
        await Promise.all(out.map(function (p) { var im = new Image(); im.src = p.url; root.appendChild(im); return im.decode ? im.decode().catch(function () {}) : 0; }));
        document.body.classList.add('cp-printing');
        window.addEventListener('afterprint', function () { document.body.classList.remove('cp-printing'); setTimeout(function () { root.innerHTML = ''; }, 500); }, { once: true });
        setTimeout(function () { window.print(); }, 60);
      }
    });

    window.addEventListener('resize', function () { if (host.isConnected) { fitView(); render(); } });
    E.state = function () { return { items: items, pages: pages, paper: paper, orient: orient, tpl: tpl, sel: sel }; };
    E.setTemplate = function (t) { tpl = t; applyTemplate(); render(); };
    E.setPaper = function (p, o) { paper = p; if (o) orient = o; fitView(); render(); };
    E.open = openPanel;
    requestAnimationFrame(function () { fitView(); render(); });
  }

  window.SPSheet = { Editor: Editor, findCards: findCards, autoBox: autoBox, lineCards: lineCards, blobCards: blobCards };
})();
