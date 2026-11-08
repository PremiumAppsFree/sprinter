/* S Printer — Editing Tool S, part 3: gradients, illustrations, gradient text and photo effects
 * (sticker outline, duotone, vintage, black & white, fade edges). Original code by S Printer. */
(function () {
  'use strict';
  var ST = window.SPStudio, F = window.fabric, Pro = ST && ST.Pro;
  if (!Pro) return;
  var S = null, cv = null;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function W() { return S.doc.w; } function H() { return S.doc.h; } function SM() { return Math.min(W(), H()); }
  var svg = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };

  // =====================================================================
  //  GRADIENTS
  // =====================================================================
  var GRADS = [
    ['Sunset', 135, ['#ff7e5f', '#feb47b']], ['Peach', 135, ['#ffecd2', '#fcb69f']], ['Candy', 135, ['#f093fb', '#f5576c']], ['Berry', 135, ['#8e2de2', '#4a00e0']],
    ['Ocean', 135, ['#2193b0', '#6dd5ed']], ['Sky', 180, ['#a1c4fd', '#c2e9fb']], ['Mint', 135, ['#43e97b', '#38f9d7']], ['Lime', 135, ['#d4fc79', '#96e6a1']],
    ['Royal', 135, ['#141e30', '#243b55']], ['Night', 160, ['#0f2027', '#203a43', '#2c5364']], ['Fire', 135, ['#f12711', '#f5af19']], ['Gold', 135, ['#f7971e', '#ffd200']],
    ['Rose', 135, ['#ee9ca7', '#ffdde1']], ['Lavender', 135, ['#c471f5', '#fa71cd']], ['Aqua', 135, ['#13547a', '#80d0c7']], ['Purple dream', 135, ['#667eea', '#764ba2']],
    ['Rainbow', 90, ['#ff5f6d', '#ffc371', '#47e891', '#2cb5e8', '#9b59ff']], ['Saffron', 180, ['#ff9933', '#ffffff', '#138808']], ['Wedding', 135, ['#fdfcfb', '#e2d1c3']], ['Coffee', 135, ['#603813', '#b29f94']],
    ['Teal', 135, ['#0f766e', '#22d3ee']], ['Cherry', 135, ['#eb3349', '#f45c43']], ['Forest', 135, ['#134e5e', '#71b280']], ['Silver', 135, ['#bdc3c7', '#2c3e50']],
    ['Neon', 135, ['#00f260', '#0575e6']], ['Pink sky', 160, ['#ffafbd', '#ffc3a0']], ['Deep sea', 180, ['#000428', '#004e92']], ['Mango', 135, ['#ffe259', '#ffa751']],
    ['Grape', 135, ['#5f2c82', '#49a09d']], ['Ice', 135, ['#e0eafc', '#cfdef3']], ['Lemon', 180, ['#fffde4', '#fff176']], ['Charcoal', 135, ['#232526', '#414345']]
  ];
  function css(g) { return 'linear-gradient(' + g[1] + 'deg,' + g[2].join(',') + ')'; }
  function makeGrad(g) {
    var a = (g[1] - 90) * Math.PI / 180, dx = Math.cos(a) / 2, dy = Math.sin(a) / 2;
    return new F.Gradient({ type: 'linear', gradientUnits: 'percentage', coords: { x1: 0.5 - dx, y1: 0.5 - dy, x2: 0.5 + dx, y2: 0.5 + dy }, colorStops: g[2].map(function (c, i) { return { offset: i / (g[2].length - 1), color: c }; }) });
  }
  function isFullBg(o) { if (!o || o.type === 'image' || o.ph) return false; var b = o.getBoundingRect(true, true); return b.left <= 2 && b.top <= 2 && b.width >= W() * 0.98 && b.height >= H() * 0.98; }
  function applyGradient(i) {
    var g = GRADS[i], a = cv.getActiveObject();
    if (a && a.type !== 'image' && !a.ph && !a.isEditing) {
      (a.type === 'activeSelection' ? a.getObjects() : [a]).forEach(function (o) {
        if (o.type === 'image' || o.ph) return;
        if (o.type === 'line' || (!o.fill && o.stroke)) o.set('stroke', makeGrad(g)); else o.set('fill', makeGrad(g));
        o.dirty = true;
      });
      cv.requestRenderAll(); S.record(); S.toast(g[0] + ' gradient added to the selected item.'); return;
    }
    var first = cv.getObjects()[0];
    if (isFullBg(first)) { first.set('fill', makeGrad(g)); first.dirty = true; }
    else { var r = new F.Rect({ left: 0, top: 0, width: W(), height: H(), fill: makeGrad(g), strokeWidth: 0 }); r.nm = 'Gradient background'; S.muted(1); cv.insertAt(r, 0); S.muted(-1); }
    cv.requestRenderAll(); S.record(); S.toast(g[0] + ' gradient set as the page background. Select an item first to colour that item instead.');
  }

  // =====================================================================
  //  ILLUSTRATIONS (free colour icon sets, via the same icon service)
  // =====================================================================
  var ILL = [['Animals', 'cat'], ['Dogs', 'dog'], ['Birds', 'bird'], ['Food', 'food'], ['Cakes', 'cake'], ['Flowers', 'flower'], ['Nature', 'tree'], ['Weather', 'cloud'], ['Sun & sky', 'sun'], ['People', 'person'], ['Faces', 'face'], ['School', 'book'], ['Office', 'office'], ['Travel', 'airplane'], ['Sports', 'ball'], ['Music', 'music'], ['Party', 'party'], ['Love', 'heart'], ['Money', 'money'], ['Shopping', 'shopping'], ['Medical', 'medical'], ['Home', 'house'], ['Vehicles', 'car'], ['Phones', 'phone'], ['Stars', 'star'], ['Festival', 'lamp'], ['Hands', 'hand'], ['Fire', 'fire']];
  var illCache = {};
  function loadIll(q, grid) {
    grid.innerHTML = '<p class="st-note">Loading…</p>';
    var done = function (ids) {
      if (!ids.length) { grid.innerHTML = '<p class="st-note">Nothing found. Try another word.</p>'; return; }
      grid.innerHTML = ids.map(function (id) { var p = id.split(':'); return '<button data-ill="' + id + '" title="' + p[1].replace(/-/g, ' ') + '"><img loading="lazy" alt="" src="https://api.iconify.design/' + p[0] + '/' + p[1] + '.svg?height=48"></button>'; }).join('');
    };
    if (illCache[q]) return done(illCache[q]);
    fetch('https://api.iconify.design/search?query=' + encodeURIComponent(q) + '&limit=56&prefixes=fluent-emoji-flat,noto,twemoji,openmoji,flat-color-icons,streamline-emojis')
      .then(function (r) { return r.json(); }).then(function (j) { illCache[q] = j.icons || []; done(illCache[q]); })
      .catch(function () { grid.innerHTML = '<p class="st-note">Could not reach the free icon library. Check your internet.</p>'; });
  }

  function elsPlus2(panel) {
    var box = el('div', 'sx-plus2');
    box.innerHTML =
      '<section class="sx-sec sx-open" data-sec="ill"><div class="sx-sech"><h4>Illustrations</h4></div><div class="st-chips sx-illc">' + ILL.map(function (c, i) { return '<button class="st-chip" data-illq="' + c[1] + '"' + (i ? '' : ' aria-pressed="true"') + '>' + c[0] + '</button>'; }).join('') + '</div><div class="sx-shapes sx-emoji sx-illg"></div></section>' +
      '<section class="sx-sec" data-sec="grad"><div class="sx-sech"><h4>Gradients</h4><button class="sx-seeall" data-see2="grad">See all</button></div><p class="st-note">Select an item first to colour it, or tap with nothing selected to set the page background.</p><div class="sx-shapes sx-grads">' + GRADS.map(function (g, i) { return '<button data-grad="' + i + '" title="' + g[0] + '" style="background:' + css(g) + '"></button>'; }).join('') + '</div></section>';
    var plus = panel.querySelector('.sx-plus');
    if (plus) plus.appendChild(box); else panel.insertBefore(box, panel.firstChild);
    var jump = panel.querySelector('.sx-jump');
    if (jump && !jump.querySelector('[data-jump=ill]')) {
      jump.insertAdjacentHTML('beforeend', '<button class="st-chip" data-jump2="ill">Illustrations</button><button class="st-chip" data-jump2="grad">Gradients</button>');
      jump.addEventListener('click', function (e) { var j = e.target.closest('[data-jump2]'); if (!j) return; var t = box.querySelector('[data-sec=' + j.dataset.jump2 + ']'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    }
    var grid = box.querySelector('.sx-illg'), loaded = false;
    function first() { if (!loaded) { loaded = true; loadIll(ILL[0][1], grid); } }
    if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (en) { if (en.some(function (x) { return x.isIntersecting; })) { first(); io.disconnect(); } }); io.observe(grid); } else first();
    box.addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-illq]'))) { [].forEach.call(box.querySelectorAll('[data-illq]'), function (x) { x.setAttribute('aria-pressed', x === b); }); loaded = true; loadIll(b.dataset.illq, grid); return; }
      if ((b = e.target.closest('[data-ill]'))) { Pro.addIcon(b.dataset.ill, null); return; }
      if ((b = e.target.closest('[data-grad]'))) { applyGradient(+b.dataset.grad); return; }
      if ((b = e.target.closest('[data-see2]'))) { var sec = b.closest('.sx-sec'), op = !sec.classList.contains('sx-open'); sec.classList.toggle('sx-open', op); b.textContent = op ? 'Show less' : 'See all'; }
    });
  }

  // =====================================================================
  //  GRADIENT TEXT
  // =====================================================================
  var TGR = [0, 2, 3, 4, 6, 10, 11, 13, 15, 16, 20, 25];
  function gradText(o) {
    var list = o.type === 'activeSelection' ? o.getObjects() : [o];
    var n = ((o.__tg == null ? -1 : o.__tg) + 1) % (TGR.length + 1); o.__tg = n;
    list.forEach(function (t) {
      if (!/text/.test(t.type)) return;
      if (n === TGR.length) { t.set('fill', t.__solid || '#1B2330'); }
      else { if (typeof t.fill === 'string') t.__solid = t.fill; var g = GRADS[TGR[n]]; t.set('fill', makeGrad([g[0], 90, g[2]])); }
      t.dirty = true;
    });
    cv.requestRenderAll(); S.record();
    S.toast(n === TGR.length ? 'Back to a single colour.' : 'Gradient ' + (n + 1) + ' of ' + TGR.length + ' — tap again for the next one.');
  }

  // =====================================================================
  //  PHOTO EFFECTS
  // =====================================================================
  var DUO = [['Blue & pink', '#1e1b4b', '#f9a8d4'], ['Teal & yellow', '#134e4a', '#fde047'], ['Purple & orange', '#3b0764', '#fdba74'], ['Red & cream', '#7f1d1d', '#fef3c7'], ['Navy & mint', '#0c1e3e', '#99f6e4'], ['Green & lime', '#14532d', '#d9f99d'], ['Black & gold', '#111111', '#facc15'], ['Indigo & sky', '#312e81', '#bae6fd']];
  function srcCanvas(o) {
    var img = o.getElement(), cw = o.width, ch = o.height, k = Math.min(1, 2200 / Math.max(cw, ch));
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(cw * k)); c.height = Math.max(1, Math.round(ch * k));
    c.getContext('2d').drawImage(img, o.cropX || 0, o.cropY || 0, cw, ch, 0, 0, c.width, c.height);
    return { c: c, k: k };
  }
  function pixels(c, fn) {
    var x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (var i = 0; i < p.length; i += 4) fn(p, i);
    x.putImageData(d, 0, 0); return c;
  }
  function hexRGB(h) { var c = new F.Color(h).getSource(); return [c[0], c[1], c[2]]; }
  function fx(o, kind, opt) {
    if (!o.__orig) o.__orig = { src: o.getSrc(), cropX: o.cropX || 0, cropY: o.cropY || 0, w: o.width, h: o.height };
    var s; try { s = srcCanvas(o); } catch (e) { S.toast('This picture cannot be changed here.'); return; }
    var c = s.c, out = c, pad = 0;
    try {
      if (kind === 'duo') {
        var a = hexRGB(opt[1]), b = hexRGB(opt[2]);
        pixels(c, function (p, i) { var l = (0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]) / 255; p[i] = a[0] + (b[0] - a[0]) * l; p[i + 1] = a[1] + (b[1] - a[1]) * l; p[i + 2] = a[2] + (b[2] - a[2]) * l; });
      } else if (kind === 'bw') {
        pixels(c, function (p, i) { var l = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]; l = Math.max(0, Math.min(255, (l - 128) * 1.15 + 128)); p[i] = p[i + 1] = p[i + 2] = l; });
      } else if (kind === 'vintage') {
        pixels(c, function (p, i) { var r = p[i], g = p[i + 1], bb = p[i + 2]; p[i] = Math.min(255, r * 0.393 + g * 0.769 + bb * 0.189) * 0.92 + 18; p[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + bb * 0.168) * 0.9 + 12; p[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + bb * 0.131) * 0.85 + 10; });
        var vx = c.getContext('2d'), gr = vx.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.3, c.width / 2, c.height / 2, Math.max(c.width, c.height) * 0.72);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(40,20,0,0.45)'); vx.globalCompositeOperation = 'source-atop'; vx.fillStyle = gr; vx.fillRect(0, 0, c.width, c.height);
      } else if (kind === 'fade') {
        var fxc = c.getContext('2d'), rg = fxc.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.28, c.width / 2, c.height / 2, Math.max(c.width, c.height) * 0.62);
        rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); fxc.globalCompositeOperation = 'destination-in'; fxc.fillStyle = rg; fxc.fillRect(0, 0, c.width, c.height);
      } else if (kind === 'outline') {
        var t = Math.max(2, Math.round(Math.max(c.width, c.height) * opt.w / 100)); pad = t + 2;
        out = document.createElement('canvas'); out.width = c.width + pad * 2; out.height = c.height + pad * 2;
        var ox = out.getContext('2d');
        for (var n = 0; n < 36; n++) { var ang = n * Math.PI / 18; ox.drawImage(c, pad + Math.cos(ang) * t, pad + Math.sin(ang) * t); }
        for (var r2 = 1; r2 < t; r2 += Math.max(1, t / 4)) for (var m = 0; m < 16; m++) { var a2 = m * Math.PI / 8; ox.drawImage(c, pad + Math.cos(a2) * r2, pad + Math.sin(a2) * r2); }
        ox.globalCompositeOperation = 'source-in'; ox.fillStyle = opt.c; ox.fillRect(0, 0, out.width, out.height);
        ox.globalCompositeOperation = 'source-over'; ox.drawImage(c, pad, pad);
      }
    } catch (e) { S.toast('This picture cannot be changed here.'); return; }
    var url = out.toDataURL('image/png'), sw = o.getScaledWidth(), sh = o.getScaledHeight();
    var center = o.getCenterPoint(); o.__frac = (o.__frac || 1) * c.width / out.width;
    o.setSrc(url, function () {
      o.set({ cropX: 0, cropY: 0, scaleX: sw / c.width, scaleY: sh / c.height });
      o.setPositionByOrigin(center, 'center', 'center'); o.setCoords();
      if (o.filters && o.filters.length) o.applyFilters();
      o.fx2 = kind; cv.requestRenderAll(); S.record();
    });
  }
  function resetFx(o) {
    if (!o.__orig) { S.toast('This picture has no photo effect yet.'); return; }
    var or = o.__orig, sw = o.getScaledWidth() * (o.__frac || 1), sh = o.getScaledHeight() * (o.__frac || 1), center = o.getCenterPoint();
    o.setSrc(or.src, function () {
      o.set({ cropX: or.cropX, cropY: or.cropY, width: or.w, height: or.h, scaleX: sw / or.w, scaleY: sh / or.h }); o.setPositionByOrigin(center, 'center', 'center'); o.setCoords();
      if (o.filters && o.filters.length) o.applyFilters();
      delete o.__orig; delete o.__frac; o.fx2 = null; cv.requestRenderAll(); S.record();
    });
  }
  function photoFx(o) {
    var st = { c: '#ffffff', w: 2.5 };
    var m = S.modal('Photo effects', '<p class="st-note">Tap an effect. You can tap Undo or Original to go back.</p>' +
      '<h4>Sticker outline</h4><p class="st-note">Best after BG remover — it draws a border around the cut-out.</p><div class="st-row sx-fxrow"><label>Colour <input type="color" data-fo="c" value="#ffffff"></label><label>Thickness <input type="range" min="0.6" max="6" step="0.2" value="2.5" data-fo="w"></label><button class="st-btn st-cta" data-fx="outline">Add outline</button></div>' +
      '<h4>Duotone</h4><div class="sx-duo">' + DUO.map(function (d, i) { return '<button data-duo="' + i + '" title="' + d[0] + '" style="background:linear-gradient(135deg,' + d[1] + ' 50%,' + d[2] + ' 50%)"></button>'; }).join('') + '</div>' +
      '<h4>More looks</h4><div class="st-row sx-fxrow"><button class="st-btn" data-fx="bw">Black &amp; white</button><button class="st-btn" data-fx="vintage">Vintage</button><button class="st-btn" data-fx="fade">Soft edges</button></div>',
      '<button class="st-btn" data-fx="reset">Original</button><button class="st-btn st-cta" data-fx="close">Done</button>', true);
    m.addEventListener('input', function (e) { var k = e.target.dataset.fo; if (k) st[k] = k === 'w' ? +e.target.value : e.target.value; });
    m.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fx],[data-duo]'); if (!b) return;
      if (b.dataset.duo != null) return fx(o, 'duo', DUO[+b.dataset.duo]);
      var k = b.dataset.fx;
      if (k === 'close') return m.close();
      if (k === 'reset') return resetFx(o);
      fx(o, k, st);
    });
  }

  // =====================================================================
  //  INSTALL
  // =====================================================================
  var I = { grad: svg('<path d="M4 20 20 4"/><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M4 12 12 4M12 20l8-8"/>'), fx: svg('<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 15l.8 1.7 1.7.8-1.7.8L19 20l-.8-1.7-1.7-.8 1.7-.8z"/>') };
  try { var stl = document.createElement('style'); stl.textContent = ".sx-grads{grid-template-columns:repeat(6,1fr)}.sx-grads button{border:2px solid #fff;box-shadow:0 0 0 1px var(--line)}.sx-sec:not(.sx-open) .sx-grads>button:nth-child(n+13){display:none}.sx-illc{display:flex;gap:6px;overflow-x:auto;flex-wrap:nowrap;padding-bottom:6px;scrollbar-width:thin}.sx-illc .st-chip{flex-shrink:0}.sx-illc .st-chip[aria-pressed=true]{background:#7c3aed;color:#fff;border-color:#7c3aed}.sx-illg{min-height:120px;max-height:330px;overflow-y:auto}.sx-duo{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;margin-bottom:8px}.sx-duo button{aspect-ratio:1;border-radius:10px;border:2px solid #fff;box-shadow:0 0 0 1px #d6dbe3;cursor:pointer}.sx-duo button:hover{box-shadow:0 0 0 2px #7c3aed}.sx-fxrow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0 10px;font:600 12px 'SP Inter',sans-serif;color:var(--ink2)}.sx-fxrow label{display:flex;align-items:center;gap:6px}"; document.head.appendChild(stl); } catch (e) {}
  var baseInstall = Pro.install;
  Pro.install = function (studio) {
    baseInstall(studio); S = studio; cv = S.canvas;
    var prevEls = S.elsHook; S.elsHook = function (panel) { if (prevEls) prevEls(panel); elsPlus2(panel); };
    var prevProps = S.propsHook; S.propsHook = function (o, h, info) {
      h = (prevProps ? prevProps(o, h, info) : h) || h;
      var add = '';
      var texts = o && (o.type === 'activeSelection' ? o.getObjects().every(function (x) { return /text/.test(x.type); }) : info.isText);
      if (texts) add += '<button class="st-pb" data-p="ygrad">' + I.grad + 'Gradient</button>';
      if (info.isImg && !o.art && !o.qr && !o.bc && !o.icon) add += '<button class="st-pb" data-p="yfx">' + I.fx + 'Photo effects</button>';
      if (!add) return h;
      return h.indexOf('data-p="cstyle"') >= 0 ? h.replace('<button class="st-pb" data-p="cstyle"', add + '<button class="st-pb" data-p="cstyle"') : h + add;
    };
    var prevAct = S.extAct; S.extAct = function (p, o, val) {
      if (p === 'ygrad') return gradText(o);
      if (p === 'yfx') return photoFx(o);
      if (prevAct) prevAct(p, o, val);
    };
  };
  Pro.plus2 = { GRADS: GRADS, applyGradient: applyGradient, fx: fx, resetFx: resetFx, gradText: gradText, ILL: ILL };
})();
