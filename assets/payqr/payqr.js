/* S Printer — Payment QR: UPI QR codes for your shop, with or without a fixed amount.
 * UPI IDs are saved only in this browser. Designed & developed by Raj. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'sp-upi-accounts', st = { accs: [], sel: 0, amt: '' };
  try { st.accs = JSON.parse(localStorage.getItem(KEY) || '[]') || []; st.sel = +(localStorage.getItem(KEY + '-sel') || 0); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st.accs)); localStorage.setItem(KEY + '-sel', st.sel); } catch (e) {} }
  function valid(id) { return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-]{1,64}$/.test(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function acc() { return st.accs[st.sel] || null; }
  function upiURL() {
    var a = acc(); if (!a) return '';
    var q = 'pa=' + encodeURIComponent(a.id).replace('%40', '@') + '&pn=' + encodeURIComponent(a.name) + '&cu=INR';
    var amt = parseFloat(st.amt); if (amt > 0) q += '&am=' + amt.toFixed(2);
    var note = $('pq-note').value.trim(); if (note) q += '&tn=' + encodeURIComponent(note.slice(0, 60));
    return 'upi://pay?' + q;
  }
  function qrCanvas(text, px) {
    try { window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs['UTF-8']; } catch (e) {}
    var q = window.qrcode(0, 'M'); q.addData(text, 'Byte'); q.make();
    var n = q.getModuleCount(), m = Math.floor(px / (n + 4)), c = document.createElement('canvas'); c.width = c.height = m * (n + 4);
    var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#111';
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect((k + 2) * m, (r + 2) * m, m, m);
    return c;
  }
  // the printable card: shop name, QR, amount, UPI ID
  function card(scale) {
    var a = acc(), W = 600 * scale, H = 860 * scale, c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d'), s = scale, col = $('pq-color').value || '#1B2330';
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    x.fillStyle = col; x.fillRect(0, 0, W, 150 * s);
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '800 ' + 40 * s + 'px Poppins, sans-serif';
    x.fillText(a.name.slice(0, 26), W / 2, 72 * s, W - 40 * s);
    x.font = '600 ' + 22 * s + 'px Poppins, sans-serif'; x.fillText('Scan & pay with any UPI app', W / 2, 116 * s, W - 40 * s);
    var qc = qrCanvas(upiURL(), 470 * s); x.drawImage(qc, (W - 470 * s) / 2, 180 * s, 470 * s, 470 * s);
    x.fillStyle = '#111'; var amt = parseFloat(st.amt);
    x.font = '800 ' + 44 * s + 'px Poppins, sans-serif'; x.fillText(amt > 0 ? '₹ ' + amt.toLocaleString('en-IN') : 'Any amount', W / 2, 712 * s);
    x.font = '500 ' + 22 * s + 'px Poppins, sans-serif'; x.fillStyle = '#475569'; x.fillText('UPI ID: ' + a.id, W / 2, 756 * s, W - 40 * s);
    var note = $('pq-note').value.trim(); if (note) { x.font = '500 ' + 20 * s + 'px Poppins, sans-serif'; x.fillText(note.slice(0, 40), W / 2, 790 * s, W - 40 * s); }
    x.fillStyle = col; x.fillRect(0, H - 30 * s, W, 30 * s);
    return c;
  }
  function render() {
    var list = $('pq-accs'), a = acc();
    list.innerHTML = st.accs.length ? st.accs.map(function (x, i) {
      return '<label class="pq-acc' + (i === st.sel ? ' on' : '') + '"><input type="radio" name="pqacc" value="' + i + '"' + (i === st.sel ? ' checked' : '') + '><span><b>' + esc(x.name) + '</b><small>' + esc(x.id) + '</small></span><button type="button" data-del="' + i + '" aria-label="Delete">✕</button></label>';
    }).join('') : '<p class="pq-empty">No UPI account yet — add one below.</p>';
    [].forEach.call(document.querySelectorAll('.pq-pre'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.a === st.amt)); });
    $('pq-badge').textContent = a ? (parseFloat(st.amt) > 0 ? 'FIXED ₹' + st.amt : 'READY') : 'WAITING';
    $('pq-badge').className = 'pq-badge' + (a ? ' ok' : '');
    var box = $('pq-preview');
    ['pq-dl', 'pq-share', 'pq-print'].forEach(function (id) { $(id).disabled = !a; });
    if (!a) { box.innerHTML = '<div class="pq-wait">Add a UPI account to create your QR</div>'; $('pq-open').removeAttribute('href'); return; }
    var c = card(1); c.style.width = '100%'; c.style.height = 'auto'; box.innerHTML = ''; box.appendChild(c);
    $('pq-open').href = upiURL();
  }
  function blob() { return new Promise(function (r) { card(2).toBlob(r, 'image/png'); }); }
  function fname() { return 'SPrinter-UPI-QR-' + (acc().name || 'shop').replace(/[^\w]+/g, '_') + (parseFloat(st.amt) > 0 ? '-Rs' + st.amt : '') + '.png'; }
  document.addEventListener('DOMContentLoaded', function () {
    $('pq-add').onsubmit = function (e) {
      e.preventDefault();
      var name = $('pq-name').value.trim(), id = $('pq-id').value.trim().replace(/\s+/g, '');
      if (!name) { $('pq-err').textContent = 'Enter the receiver / shop name.'; return; }
      if (!valid(id)) { $('pq-err').textContent = 'That does not look like a UPI ID (example: shopname@okaxis).'; return; }
      $('pq-err').textContent = ''; st.accs.push({ name: name, id: id }); st.sel = st.accs.length - 1; save(); $('pq-name').value = $('pq-id').value = ''; render();
    };
    $('pq-accs').onchange = function (e) { if (e.target.name === 'pqacc') { st.sel = +e.target.value; save(); render(); } };
    $('pq-accs').onclick = function (e) { var b = e.target.closest('[data-del]'); if (!b) return; e.preventDefault(); if (!confirm('Remove this UPI account from this browser?')) return; st.accs.splice(+b.dataset.del, 1); st.sel = 0; save(); render(); };
    document.querySelector('.pq-pres').onclick = function (e) { var b = e.target.closest('.pq-pre'); if (!b) return; st.amt = b.dataset.a; $('pq-amt').value = st.amt; render(); };
    $('pq-amt').oninput = function () { st.amt = String(Math.max(0, parseFloat(this.value) || 0) || ''); render(); };
    $('pq-clear').onclick = function () { st.amt = ''; $('pq-amt').value = ''; render(); };
    $('pq-note').oninput = render; $('pq-color').oninput = render;
    $('pq-dl').onclick = function () { blob().then(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = fname(); document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 800); }); };
    $('pq-share').onclick = function () {
      blob().then(function (b) {
        var f = new File([b], fname(), { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: 'Pay by UPI' }).catch(function () {});
        else $('pq-dl').onclick();
      });
    };
    $('pq-print').onclick = function () {
      var size = $('pq-psize').value, mm = { a4: [210, 297], a5: [148, 210], '4x6': [101.6, 152.4] }[size];
      var root = $('pq-print-root'); root.innerHTML = '';
      var im = new Image(); im.src = card(3).toDataURL('image/png'); root.appendChild(im);
      $('pq-page-css').textContent = '@media print{@page{size:' + mm[0] + 'mm ' + mm[1] + 'mm;margin:0}#pq-print-root img{width:' + mm[0] + 'mm;height:' + mm[1] + 'mm;object-fit:contain}}';
      im.onload = function () { document.body.classList.add('pq-printing'); setTimeout(function () { window.print(); setTimeout(function () { document.body.classList.remove('pq-printing'); }, 1500); }, 60); };
    };
    render();
  });
})();
