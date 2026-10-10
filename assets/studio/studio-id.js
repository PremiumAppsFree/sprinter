/* S Printer — bulk ID cards: records database (batches, Excel import, photos) and bulk print
 * (A4 sheets, front/back pairs or duplex, mirror, rotate back 180°, PVC front/back ZIP).
 * Records stay in this browser (IndexedDB). Designed & developed by Raj. */
(function () {
  'use strict';
  var ST = window.SPStudio, I = ST.icons, esc = ST.esc;
  var BASE = (function () { var s = document.querySelector('script[src*="assets/studio/studio.js"]'); return s ? s.src.replace(/assets\/studio\/studio\.js.*$/, '') : '../'; })();
  function load(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = BASE + src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function needXLSX() { return window.XLSX ? Promise.resolve() : load('assets/vendor/studio/xlsx.full.min.js'); }
  function needZip() { return window.JSZip ? Promise.resolve() : load('assets/vendor/jszip.min.js'); }
  var state = { batch: localStorage.getItem('st-id-batch') || 'Batch 1', pins: {} };

  function recFields(S) { return (S.cfg.fields || []).filter(function (f) { return f.rec; }); }
  function all(S) { return S.dbDo('records', 'readonly', function (st) { return st.getAll(); }).then(function (a) { return (a || []).filter(function (r) { return r.tool === S.cfg.tool; }).sort(function (a, b) { return a.at - b.at; }); }).catch(function () { return []; }); }
  function put(S, r) { return S.dbDo('records', 'readwrite', function (st) { return st.put(r); }); }
  function del(S, id) { return S.dbDo('records', 'readwrite', function (st) { return st.delete(id); }); }
  function batches(list) { var b = []; list.forEach(function (r) { if (b.indexOf(r.batch) < 0) b.push(r.batch); }); if (b.indexOf(state.batch) < 0) b.unshift(state.batch); return b; }

  ST.idDatabase = function (S, panel) {
    all(S).then(function (list) {
      var bs = batches(list), shown = state.batch === '*' ? list : list.filter(function (r) { return r.batch === state.batch; });
      panel.innerHTML = '<h3>' + I.db + ' Database</h3><p class="st-note">Add every person once, then print all cards together. Stored only in this browser.</p>' +
        '<div class="st-row"><label class="st-field" style="flex:1">Batch / group<select data-k="batch">' + bs.map(function (b) { return '<option' + (b === state.batch ? ' selected' : '') + '>' + esc(b) + '</option>'; }).join('') + '<option value="*"' + (state.batch === '*' ? ' selected' : '') + '>Show all batches</option></select></label><button class="st-btn" data-k="newb" style="margin-top:12px">+ Batch</button></div>' +
        '<div class="st-row" style="margin:4px 0 10px"><button class="st-btn st-main" data-k="add">+ Add record</button><button class="st-btn" data-k="import">' + I.data + 'Import Excel</button><button class="st-btn" data-k="demo">Demo Excel</button><button class="st-btn" data-k="photos">' + I.photo + 'Match photos</button></div>' +
        '<button class="st-btn st-main st-wide" data-k="print">' + I.print + 'Print / export cards (' + shown.length + ')</button>' +
        '<h4>' + shown.length + ' record' + (shown.length === 1 ? '' : 's') + (shown.length ? ' <button class="st-clear" data-k="delall">Delete all shown</button>' : '') + '</h4>' +
        (shown.length ? '<table class="st-table"><thead><tr><th></th><th>Name</th><th>ID</th><th></th></tr></thead><tbody>' + shown.map(function (r) {
          return '<tr data-id="' + r.id + '"><td>' + (r.vals['@PHOTO'] ? '<img src="' + r.vals['@PHOTO'] + '" alt="">' : '') + '</td><td>' + esc(r.vals.NAME || '—') + (state.batch === '*' ? '<br><small>' + esc(r.batch) + '</small>' : '') + '</td><td>' + esc(r.vals.ID_NO || '') + '</td><td style="white-space:nowrap"><button class="st-btn" data-r="view" title="Preview on card">👁</button> <button class="st-btn" data-r="edit" title="Edit">' + I.edit + '</button> <button class="st-btn" data-r="del" title="Delete">' + I.del + '</button></td></tr>';
        }).join('') + '</tbody></table>' : '<p class="st-note">No records yet. Tap “Add record” or import an Excel / CSV file (download the demo to see the columns).</p>');
      panel.onchange = function (e) { if (e.target.dataset.k === 'batch') { state.batch = e.target.value; if (state.batch !== '*') localStorage.setItem('st-id-batch', state.batch); S.renderTab(); } };
      panel.onclick = function (e) {
        var b = e.target.closest('[data-k],[data-r]'); if (!b || b.tagName === 'SELECT') return;
        var k = b.dataset.k, row = b.closest('[data-id]'), rec = row && list.find(function (r) { return r.id === row.dataset.id; });
        if (k === 'newb') { var n = prompt('Name of the new batch (e.g. Class 5-A, Sales team)'); if (n) { state.batch = n.trim(); localStorage.setItem('st-id-batch', state.batch); S.renderTab(); } }
        if (k === 'add') editRecord(S, null);
        if (k === 'import') importExcel(S);
        if (k === 'demo') demoExcel(S);
        if (k === 'photos') matchPhotos(S, shown);
        if (k === 'print') bulkPrint(S, list);
        if (k === 'delall' && confirm('Delete all ' + shown.length + ' records shown?')) Promise.all(shown.map(function (r) { return del(S, r.id); })).then(function () { S.renderTab(); });
        if (b.dataset.r === 'view' && rec) { S.setVals(rec.vals).then(function () { S.toast('Showing ' + (rec.vals.NAME || 'record') + ' on the card.'); }); }
        if (b.dataset.r === 'edit' && rec) editRecord(S, rec);
        if (b.dataset.r === 'del' && rec && confirm('Delete ' + (rec.vals.NAME || 'this record') + '?')) del(S, rec.id).then(function () { S.renderTab(); });
      };
    });
  };

  function editRecord(S, rec) {
    var f = recFields(S), v = rec ? Object.assign({}, rec.vals) : {};
    if (!rec) f.forEach(function (x) { if (state.pins[x.k] != null) v[x.k] = state.pins[x.k]; });
    var body = '<p class="st-note">Batch: <b>' + esc(rec ? rec.batch : state.batch === '*' ? 'Batch 1' : state.batch) + '</b>. Tap 📌 to keep a value for the next record.</p>' + f.map(function (x) {
      if (x.type === 'photo') return '<div class="st-field">' + esc(x.label) + '<div class="st-row"><button class="st-btn" type="button" data-ph="' + x.k + '">' + I.photo + 'Choose</button><img data-pv="' + x.k + '" alt="" style="height:52px;border-radius:6px;' + (v['@' + x.k] ? '' : 'display:none') + '" src="' + (v['@' + x.k] || '') + '"></div></div>';
      return '<label class="st-field"><span>' + esc(x.label) + ' <button type="button" class="st-pin" data-pin="' + x.k + '" aria-pressed="' + (state.pins[x.k] != null) + '">📌</button></span><input data-k="' + x.k + '" value="' + esc(v[x.k] || '') + '"></label>';
    }).join('');
    var m = S.modal(rec ? 'Edit record' : 'Add record', body, '<button class="st-btn" data-c="x">Cancel</button>' + (rec ? '' : '<button class="st-btn" data-c="next">Save &amp; add next</button>') + '<button class="st-btn st-main" data-c="ok">Save record</button>');
    m.addEventListener('click', function (e) {
      var pin = e.target.closest('[data-pin]');
      if (pin) { var k = pin.dataset.pin, inp = m.querySelector('[data-k=' + k + ']'); if (state.pins[k] != null) { delete state.pins[k]; pin.setAttribute('aria-pressed', 'false'); } else { state.pins[k] = inp.value; pin.setAttribute('aria-pressed', 'true'); } return; }
      var ph = e.target.closest('[data-ph]');
      if (ph) { var key = ph.dataset.ph; ST.pickFile('image/*').then(function (fs) { if (!fs[0]) return; return ST.fileToURL(fs[0]).then(function (u) { return S.runPhotoSteps(u, { sign: key === 'SIGN', ratio: key === 'SIGN' ? 3 : 0.8 }); }).then(function (r) { if (!r) return; v['@' + key] = r; var im = m.querySelector('[data-pv=' + key + ']'); im.src = r; im.style.display = ''; }); }); return; }
      var c = e.target.closest('[data-c]'); if (!c) return;
      if (c.dataset.c === 'x') { m.close(); return; }
      [].forEach.call(m.querySelectorAll('input[data-k]'), function (i) { v[i.dataset.k] = i.value.trim(); if (state.pins[i.dataset.k] != null) state.pins[i.dataset.k] = i.value; });
      if (!v.NAME) { S.toast('Enter at least the name.'); return; }
      var r = rec || { id: 'r' + Date.now() + Math.random().toString(36).slice(2, 6), tool: S.cfg.tool, batch: state.batch === '*' ? 'Batch 1' : state.batch, at: Date.now() };
      r.vals = v;
      put(S, r).then(function () { m.close(); S.toast('Saved.'); S.renderTab(); if (c.dataset.c === 'next') editRecord(S, null); });
    });
  }

  function headerMap(S) { var map = {}; recFields(S).forEach(function (f) { map[f.k.toLowerCase()] = f.k; map[f.label.toLowerCase()] = f.k; }); map.photo = '@PHOTO'; map['photo url'] = '@PHOTO'; map['photo file'] = '@PHOTO'; map.sign = '@SIGN'; map.signature = '@SIGN'; return map; }
  function importExcel(S) {
    ST.pickFile('.xlsx,.xls,.csv,.ods', false).then(function (fs) {
      if (!fs[0]) return;
      S.busy(true, 'Reading the file…');
      needXLSX().then(function () { return fs[0].arrayBuffer(); }).then(function (buf) {
        var wb = window.XLSX.read(buf, { type: 'array' }), sh = wb.Sheets[wb.SheetNames[0]], rows = window.XLSX.utils.sheet_to_json(sh, { defval: '', raw: false });
        var map = headerMap(S), batch = state.batch === '*' ? 'Batch 1' : state.batch, jobs = [], n = 0;
        rows.forEach(function (row, i) {
          var v = {}; Object.keys(row).forEach(function (h) { var k = map[String(h).trim().toLowerCase()]; if (k) v[k] = String(row[h]).trim(); });
          if (!v.NAME) return;
          ['@PHOTO', '@SIGN'].forEach(function (pk) { if (v[pk] && !/^data:/.test(v[pk])) { v[pk.replace('@', '#')] = v[pk]; delete v[pk]; } });   // URL or file name: matched later
          n++; jobs.push(put(S, { id: 'r' + Date.now() + '-' + i, tool: S.cfg.tool, batch: batch, at: Date.now() + i, vals: v }));
        });
        return Promise.all(jobs).then(function () { S.busy(false); S.toast(n ? 'Imported ' + n + ' records into “' + batch + '”.' : 'No rows with a name were found.'); S.renderTab(); return fetchURLPhotos(S); });
      }).catch(function (e) { S.busy(false); S.toast('Could not read this file.'); console.error(e); });
    });
  }
  // photo columns with web links: try to download them (works when the site allows it)
  function fetchURLPhotos(S) {
    return all(S).then(function (list) {
      var todo = list.filter(function (r) { return /^https?:/i.test(r.vals['#PHOTO'] || '') || /^https?:/i.test(r.vals['#SIGN'] || ''); });
      if (!todo.length) return;
      S.busy(true, 'Downloading photos…'); var ok = 0;
      return Promise.all(todo.map(function (r) {
        return Promise.all(['PHOTO', 'SIGN'].map(function (k) {
          var u = r.vals['#' + k]; if (!/^https?:/i.test(u || '')) return null;
          return ST.loadImg(u).then(function (im) { var c = document.createElement('canvas'), s = Math.min(1, 900 / Math.max(im.width, im.height)); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); r.vals['@' + k] = c.toDataURL('image/jpeg', 0.9); delete r.vals['#' + k]; ok++; }).catch(function () {});
        })).then(function () { return put(S, r); });
      })).then(function () { S.busy(false); S.toast(ok ? 'Downloaded ' + ok + ' photos.' : 'Photo links could not be downloaded — use “Match photos” with the image files.'); S.renderTab(); });
    });
  }
  function demoExcel(S) {
    needXLSX().then(function () {
      var f = recFields(S).filter(function (x) { return x.type !== 'photo'; }), head = f.map(function (x) { return x.k; }).concat(['PHOTO', 'SIGN']);
      var demo = (S.cfg.demoRows || []).map(function (r) { return head.map(function (h) { return r[h] || ''; }); });
      var ws = window.XLSX.utils.aoa_to_sheet([head].concat(demo)), wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'Records');
      var help = window.XLSX.utils.aoa_to_sheet([['How to fill'], ['Keep the first row (column names) as it is.'], ['One person per row. NAME is required.'], ['PHOTO / SIGN: a web link to the picture, or the picture file name (e.g. 101.jpg). Then use “Match photos” and pick those files.'], ['Save as .xlsx or .csv and use “Import Excel”.']]);
      window.XLSX.utils.book_append_sheet(wb, help, 'Help');
      window.XLSX.writeFile(wb, 'SPrinter-ID-cards-demo.xlsx');
    });
  }
  // pick many image files; match each to a record by file name = PHOTO column, ID number or name
  function matchPhotos(S, shown) {
    ST.pickFile('image/*', true).then(function (fs) {
      if (!fs.length) return;
      var norm = function (s) { return String(s || '').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, ''); };
      S.busy(true, 'Matching photos…'); var hit = 0, signHit = 0;
      Promise.all(fs.map(function (f) {
        var n = norm(f.name), isSign = /sign/.test(n), base = n.replace(/sign(ature)?/, '');
        var r = shown.find(function (x) { return [x.vals['#PHOTO'], x.vals['#SIGN'], x.vals.ID_NO, x.vals.NAME].some(function (c) { return c && (norm(c) === n || norm(c) === base); }); });
        if (!r) return null;
        return ST.fileToURL(f).then(function (u) {
          var k = isSign || (r.vals['#SIGN'] && norm(r.vals['#SIGN']) === n) ? 'SIGN' : 'PHOTO';
          r.vals['@' + k] = u; delete r.vals['#' + k]; if (k === 'SIGN') signHit++; else hit++; return put(S, r);
        });
      })).then(function () { S.busy(false); S.toast('Matched ' + hit + ' photos' + (signHit ? ' and ' + signHit + ' signatures' : '') + ' of ' + fs.length + ' files.'); S.renderTab(); });
    });
  }

  // ---------- bulk print ----------
  function bulkPrint(S, list) {
    var bs = batches(list);
    var body = '<label class="st-field">Batch<select data-k="b"><option value="*">All batches (' + list.length + ')</option>' + bs.map(function (b) { var n = list.filter(function (r) { return r.batch === b; }).length; return '<option value="' + esc(b) + '"' + (b === state.batch ? ' selected' : '') + '>' + esc(b) + ' (' + n + ')</option>'; }).join('') + '<option value="@">Only the card on screen (Details)</option></select></label>' +
      '<label class="st-field">Output<select data-k="fmt"><option value="a4pdf">A4 sheet — PDF</option><option value="a4print">A4 sheet — Print now</option><option value="a4zip">A4 sheets — ZIP of PNG pages</option><option value="pvc">PVC separate — ZIP of front &amp; back PNG</option><option value="single">A4 single card, centred — PDF</option></select></label>' +
      '<label class="st-field">Sides<select data-k="side"><option value="both">Front and back</option><option value="front">Front only</option><option value="back">Back only</option></select></label>' +
      '<label class="st-field">Front &amp; back layout<select data-k="lay"><option value="pair">Side by side (front | back)</option><option value="duplex">Fronts on one page, backs on the next (double-sided)</option></select></label>' +
      '<label class="st-check" style="display:flex;gap:8px;font-size:13.5px;margin:6px 0"><input type="checkbox" data-k="mirror"> Apply mirror print (for PVC / transfer sheets)</label>' +
      '<label class="st-check" style="display:flex;gap:8px;font-size:13.5px;margin:6px 0"><input type="checkbox" data-k="r180"> Rotate back side 180°</label>' +
      '<label class="st-check" style="display:flex;gap:8px;font-size:13.5px;margin:6px 0"><input type="checkbox" data-k="r90"> Rotate 90° (fit more cards on A4)</label>' +
      '<label class="st-check" style="display:flex;gap:8px;font-size:13.5px;margin:6px 0"><input type="checkbox" data-k="cut" checked> Cut lines</label>' +
      '<p class="st-note">Cards are printed at their true size: ' + S.doc.mm.map(function (x) { return Math.round(x * 10) / 10; }).join(' × ') + ' mm. Print at 100% / “Actual size”. Portrait cards: tick “Rotate 90°” to fit 5 front/back pairs (10 cards) on one A4.</p>';
    var m = S.modal('Print bulk ID cards', body, '<button class="st-btn" data-c="x">Cancel</button><button class="st-btn st-main" data-c="go">' + I.print + 'Process cards</button>', true);
    m.querySelector('[data-c=x]').onclick = m.close;
    m.querySelector('[data-c=go]').onclick = function () {
      var q = function (k) { var e = m.querySelector('[data-k=' + k + ']'); return e.type === 'checkbox' ? e.checked : e.value; };
      var b = q('b'), recs = b === '@' ? [{ vals: {} }] : b === '*' ? list : list.filter(function (r) { return r.batch === b; });
      if (!recs.length) { S.toast('No records in this batch.'); return; }
      var opt = { fmt: q('fmt'), side: q('side'), lay: q('lay'), mirror: q('mirror'), r180: q('r180'), r90: q('r90'), cut: q('cut') };
      m.close(); run(S, recs, opt).catch(function (e) { S.busy(false); S.toast('Could not make the cards: ' + (e && e.message || e)); console.error(e); });
    };
  }
  function cardCanvases(S, recs, opt) {
    var d = S.snapshot(), dpi = (window.SPPaper && SPPaper.dpi()) || 300, mult = (d.mm[0] / 25.4 * dpi) / d.w, out = [], i = 0;
    var sides = opt.side === 'both' ? [0, 1] : opt.side === 'front' ? [0] : [1];
    sides = sides.filter(function (s) { return d.pages[s]; });
    function one() {
      if (i >= recs.length) return Promise.resolve(out);
      S.busy(true, 'Making card ' + (i + 1) + ' of ' + recs.length + '…');
      var v = Object.assign({}, S.vals, recs[i].vals), item = { rec: recs[i], c: [] };
      return sides.reduce(function (p, s) { return p.then(function () { return ST.renderJSON(d.pages[s], d.w, d.h, mult, v).then(function (c) { item.c.push(post(c, s === 1, opt)); }); }); }, Promise.resolve()).then(function () { out.push(item); i++; return one(); });
    }
    return one().then(function (r) { r.mm = opt.r90 ? [d.mm[1], d.mm[0]] : d.mm; r.dpi = dpi; return r; });
  }
  function post(c, isBack, opt) {
    var rot = (opt.r90 ? 90 : 0) + (isBack && opt.r180 ? 180 : 0);
    var w = rot % 180 ? c.height : c.width, h = rot % 180 ? c.width : c.height, o = document.createElement('canvas'); o.width = w; o.height = h;
    var x = o.getContext('2d'); x.translate(w / 2, h / 2); x.rotate(rot * Math.PI / 180); if (opt.mirror) x.scale(-1, 1); x.drawImage(c, -c.width / 2, -c.height / 2);
    if (window.SPPaper && opt.fmt !== 'pvc') SPPaper.tune(o);
    return o;
  }
  function sheets(cards, opt) {
    var mm = cards.mm, dpi = cards.dpi, px = function (v) { return Math.round(v / 25.4 * dpi); }, A4 = [210, 297], M = 7, G = 3;
    var pages = [], unit = opt.lay === 'pair' && cards[0].c.length > 1 ? [mm[0] * 2 + G, mm[1]] : mm;
    var cols = Math.max(1, Math.floor((A4[0] - 2 * M + G) / (unit[0] + G))), rows = Math.max(1, Math.floor((A4[1] - 2 * M + G) / (unit[1] + G))), per = cols * rows;
    var ox = (A4[0] - (cols * unit[0] + (cols - 1) * G)) / 2, oy = M;
    function newPage() { var c = document.createElement('canvas'); c.width = px(A4[0]); c.height = px(A4[1]); var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); return c; }
    function draw(pg, img, xm, ym) { var x = pg.getContext('2d'); x.drawImage(img, px(xm), px(ym), px(mm[0]), px(mm[1])); if (opt.cut) { x.strokeStyle = '#9aa4b0'; x.lineWidth = Math.max(1, dpi / 300); x.strokeRect(px(xm), px(ym), px(mm[0]), px(mm[1])); } }
    var two = cards[0].c.length > 1;
    if (!two || opt.lay === 'pair') {
      for (var i = 0; i < cards.length; i += per) {
        var pg = newPage();
        cards.slice(i, i + per).forEach(function (cd, j) { var cx = ox + (j % cols) * (unit[0] + G), cy = oy + Math.floor(j / cols) * (unit[1] + G); draw(pg, cd.c[0], cx, cy); if (two) draw(pg, cd.c[1], cx + mm[0] + G, cy); });
        pages.push(pg);
      }
    } else {
      for (var k = 0; k < cards.length; k += per) {
        var f = newPage(), b = newPage();
        cards.slice(k, k + per).forEach(function (cd, j) { var col = j % cols, row = Math.floor(j / cols), cy = oy + row * (unit[1] + G); draw(f, cd.c[0], ox + col * (unit[0] + G), cy); draw(b, cd.c[1], ox + (cols - 1 - col) * (unit[0] + G), cy); });
        pages.push(f, b);
      }
    }
    return pages;
  }
  function stamp() { return new Date().toISOString().slice(0, 10); }
  function run(S, recs, opt) {
    return cardCanvases(S, recs, opt).then(function (cards) {
      if (opt.fmt === 'pvc') return needZip().then(function () {
        var z = new window.JSZip(), names = {};
        cards.forEach(function (cd, i) { var n = String(cd.rec.vals.ID_NO || cd.rec.vals.NAME || 'card-' + (i + 1)).replace(/[^\w\-]+/g, '_'); if (names[n]) n += '-' + i; names[n] = 1; cd.c.forEach(function (c, s) { z.file(n + (cd.c.length > 1 ? (s ? '-back' : '-front') : '') + '.png', c.toDataURL('image/png').split(',')[1], { base64: true }); }); });
        S.busy(true, 'Packing ZIP…'); return z.generateAsync({ type: 'blob' }).then(function (b) { S.busy(false); S.saveURL('SPrinter-PVC-cards-' + stamp() + '.zip', URL.createObjectURL(b)); S.toast('ZIP saved: ' + cards.length + ' cards.'); });
      });
      if (opt.fmt === 'single') {
        var list = []; cards.forEach(function (cd) { cd.c.forEach(function (c) { var pg = document.createElement('canvas'), px = function (v) { return Math.round(v / 25.4 * cards.dpi); }; pg.width = px(210); pg.height = px(297); var x = pg.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, pg.width, pg.height); x.drawImage(c, px((210 - cards.mm[0]) / 2), px((297 - cards.mm[1]) / 2), px(cards.mm[0]), px(cards.mm[1])); if (opt.cut) { x.strokeStyle = '#9aa4b0'; x.strokeRect(px((210 - cards.mm[0]) / 2), px((297 - cards.mm[1]) / 2), px(cards.mm[0]), px(cards.mm[1])); } list.push({ c: pg }); }); });
        S.busy(false); S.toPDF(list, 210, 297).save('SPrinter-ID-cards-single-' + stamp() + '.pdf'); S.toast('PDF saved.'); return;
      }
      S.busy(true, 'Arranging on A4…');
      var pages = sheets(cards, opt);
      if (opt.fmt === 'a4zip') return needZip().then(function () { var z = new window.JSZip(); pages.forEach(function (p, i) { z.file('A4-page-' + (i + 1) + '.png', p.toDataURL('image/png').split(',')[1], { base64: true }); }); return z.generateAsync({ type: 'blob' }); }).then(function (b) { S.busy(false); S.saveURL('SPrinter-ID-A4-pages-' + stamp() + '.zip', URL.createObjectURL(b)); S.toast(pages.length + ' A4 pages saved.'); });
      var urls = pages.map(function (p) { return p.toDataURL('image/jpeg', 0.95); });
      S.busy(false);
      if (opt.fmt === 'a4print') { S.printImages(urls, 210, 297); return; }
      S.toPDF(urls.map(function (u) { return { url: u }; }), 210, 297).save('SPrinter-ID-cards-A4-' + stamp() + '.pdf'); S.toast('PDF saved: ' + cards.length + ' cards on ' + pages.length + ' page' + (pages.length > 1 ? 's' : '') + '.');
    });
  }
  ST.idBulk = run;
})();
