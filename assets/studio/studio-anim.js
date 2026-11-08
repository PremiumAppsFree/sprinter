/* S Printer — Editing Tool S, part 4: animated stickers & emoji (moving, like chat-app stickers).
 * Animations: Google Noto Animated Emoji (free, CC BY 4.0), played with lottie-web (MIT).
 * They move on the page, in Play, and in MP4 / GIF downloads. PNG / JPG / PDF keep one still frame. */
(function () {
  'use strict';
  var ST = window.SPStudio, F = window.fabric, Pro = ST && ST.Pro;
  if (!Pro || !F) return;
  var S = null, cv = null;
  var BASE = 'https://fonts.gstatic.com/s/e/notoemoji/latest/';
  var LIBS = ['https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_canvas.min.js', 'https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie_canvas.min.js'];
  var CATS = [
    ['Smileys', '1f600 1f603 1f604 1f601 1f606 1f605 1f602 1f923 1f60a 1f607 1f970 1f60d 1f929 1f618 1f60b 1f61b 1f61c 1f92a 1f60e 1f913 1f973 1f60f 1f60c 1f644 1f62c 1f914 1f92d 1f92b 1f971 1f634 1f924'],
    ['Feelings', '1f97a 1f622 1f62d 1f631 1f633 1f621 1f620 1f92f 1f972 1f62e_200d_1f4a8 1f635_200d_1f4ab 1f976 1f975 1f912 1f637 1f911 1f920 1f608 1f47b 1f480 1f4a9 1f921 1f916 1f47d 1f440 1f9e0'],
    ['Love', '2764_fe0f 1f496 1f495 1f498 1f49d 1f49e 1f493 1f497 1f494 1f9e1 1f49b 1f49a 1f499 1f49c 1f5a4 1f90d 1f48b 1f339 1f48d'],
    ['Hands', '1f44d 1f44f 1f64f 1f44b 1f64c 1f4aa 270c_fe0f 1f91e 1f44c 1f918 1f91d'],
    ['Party', '1f389 1f38a 1f382 1f381 1f388 1f386 2728 1f525 1f4af 1f3c6 1f947 1f451 1f4a5 1f4ab 1f31f 2b50'],
    ['Festival', '1fa94 1f386 2728 1f383 1f31f 1f389 1f381'],
    ['Animals', '1f431 1f98a 1f43c 1f981 1f984 1f98b 1f41d 1f427 1f419 1f42c 1f433 1f422 1f996 1f989 1f985 1f413 1f40d'],
    ['Nature', '1f308 1f31e 26a1 2744_fe0f 1f30a 1f32a_fe0f 1f331 1f340 1f342 1f30d 1f30b 26c4 1f337 1f338 1f490'],
    ['Food', '1f355 1f37f 2615 1f37e 1f37b'],
    ['Things', '1f680 1f4a1 23f0 1f514 1f4b8 1f48e 1f6a8 1f3af 1f3b6 1f3b8 1f941 1f3b7 26bd 1f3c0 1f3cf 1f3c1 1f697 1f6b2 2708_fe0f 1f6f8']
  ];
  var names = {};

  // ---------- lottie-web loader ----------
  var libP = null;
  function lib() {
    if (window.lottie) return Promise.resolve(window.lottie);
    if (libP) return libP;
    libP = new Promise(function (res, rej) {
      var i = 0;
      (function next() {
        if (i >= LIBS.length) { libP = null; rej(new Error('lottie')); return; }
        var s = document.createElement('script'); s.src = LIBS[i++]; s.async = true;
        s.onload = function () { window.lottie ? res(window.lottie) : next(); };
        s.onerror = function () { s.remove(); next(); };
        document.head.appendChild(s);
      })();
    });
    return libP;
  }
  var jsonCache = {};
  function getJSON(code) {
    if (!jsonCache[code]) jsonCache[code] = fetch(BASE + code + '/lottie.json').then(function (r) { if (!r.ok) throw new Error('json'); return r.json(); }).catch(function (e) { delete jsonCache[code]; throw e; });
    return jsonCache[code].then(function (j) { return JSON.parse(JSON.stringify(j)); });
  }

  // ---------- clock: real time, or frame-by-frame while a GIF is being made ----------
  var clock = { gif: false, n: 0, fps: 12 };
  function now() { return clock.gif ? clock.n / clock.fps : performance.now() / 1000; }
  function wrapGif() {
    var G = window.gifenc; if (!G || G.__sxWrapped) return;
    var orig = G.GIFEncoder, NG = {}; Object.keys(G).forEach(function (k) { NG[k] = G[k]; }); NG.__sxWrapped = true; window.gifenc = NG;
    NG.GIFEncoder = function () {
      var enc = orig.apply(this, arguments), wf = enc.writeFrame, fin = enc.finish;
      clock.gif = true; clock.n = 0;
      enc.writeFrame = function (a, b, c, o) { var r = wf.apply(enc, arguments); clock.n++; if (o && o.delay) clock.fps = 1000 / o.delay; return r; };
      enc.finish = function () { clock.gif = false; return fin.apply(enc, arguments); };
      return enc;
    };
  }

  // ---------- the animated sticker object ----------
  var RES = 360;
  F.AnimSticker = F.util.createClass(F.Object, {
    type: 'animSticker',
    objectCaching: false,
    initialize: function (opts) {
      opts = opts || {};
      this.callSuper('initialize', opts);
      this.code = opts.code; this.speed = opts.speed || 1;
      this.width = opts.width || RES; this.height = opts.height || RES;
      this._still = new Image(); this._still.crossOrigin = 'anonymous'; this._still.src = BASE + this.code + '/emoji.svg';
      var self = this; this._still.onload = function () { if (self.canvas) self.canvas.requestRenderAll(); };
    },
    load: function () {
      var self = this;
      return Promise.all([lib(), getJSON(this.code)]).then(function (r) {
        var L = r[0], c = document.createElement('canvas'); c.width = RES; c.height = RES;
        self._cv = c;
        self._anim = L.loadAnimation({ renderer: 'canvas', loop: true, autoplay: false, animationData: r[1], rendererSettings: { context: c.getContext('2d'), clearCanvas: true, preserveAspectRatio: 'xMidYMid meet' } });
        self._anim.resize && self._anim.resize();
        self._lf = -1; return self;
      }).catch(function () { return self; });
    },
    _render: function (ctx) {
      var w = this.width, h = this.height;
      if (this._anim) {
        var a = this._anim, tot = Math.max(1, Math.floor(a.totalFrames) - 1), fr = Math.floor((now() * (a.frameRate || 30) * (this.speed || 1)) % tot);
        if (fr !== this._lf) { a.goToAndStop(fr, true); this._lf = fr; }
        ctx.drawImage(this._cv, -w / 2, -h / 2, w, h);
      } else if (this._still && this._still.complete && this._still.naturalWidth) {
        ctx.drawImage(this._still, -w / 2, -h / 2, w, h);
      }
    },
    toObject: function (p) { return F.util.object.extend(this.callSuper('toObject', p), { code: this.code, speed: this.speed }); },
    toSVG: function () { var w = this.width, h = this.height; return '<g transform="' + this.calcTransformMatrix().join(' ').replace(/^/, 'matrix(') + ')"><image href="' + BASE + this.code + '/emoji.svg" x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '"/></g>\n'; },
    dispose: function () { if (this._anim) { try { this._anim.destroy(); } catch (e) {} this._anim = null; } }
  });
  F.AnimSticker.fromObject = function (o, cb) { var s = new F.AnimSticker(o); s.load().then(function () { cb && cb(s); }); return s; };

  // ---------- keep animating while stickers are on the page ----------
  var looping = false;
  function hasAnim() { return cv && cv.getObjects().some(function (o) { return o.type === 'animSticker' || (o._objects && o._objects.some(function (k) { return k.type === 'animSticker'; })); }); }
  function loop() {
    if (!hasAnim()) { looping = false; return; }
    if (!document.hidden && !cv._isCurrentlyDrawing) cv.requestRenderAll();
    setTimeout(function () { requestAnimationFrame(loop); }, 28);
  }
  function kick() { if (!looping && hasAnim()) { looping = true; requestAnimationFrame(loop); } }

  function addSticker(code) {
    var s = new F.AnimSticker({ code: code });
    S.busy(true, 'Adding animated sticker…');
    s.load().then(function () {
      S.busy(false);
      var size = Math.min(S.doc.w, S.doc.h) * 0.28, k = size / RES;
      s.set({ scaleX: k, scaleY: k, left: (S.doc.w - size) / 2, top: (S.doc.h - size) / 2 });
      s.nm = 'Animated ' + (names[code] || 'sticker');
      S.addObj(s); S.showProps(); kick();
      if (!s._anim) S.toast('Could not load the animation — it will show as a still picture. Check your internet.');
      else S.toast('It moves! Download as MP4 or GIF to keep the animation.');
    });
  }

  // ---------- Elements panel section ----------
  var curCat = 0;
  function elsAnim(panel) {
    var box = document.createElement('div'); box.className = 'sx-animbox';
    box.innerHTML = '<section class="sx-sec sx-open" data-sec="anim"><div class="sx-sech"><h4>Animated stickers <span class="sx-new">NEW</span></h4></div>' +
      '<div class="st-chips sx-illc sx-animc">' + CATS.map(function (c, i) { return '<button class="st-chip" data-acat="' + i + '" aria-pressed="' + (i === curCat) + '">' + c[0] + '</button>'; }).join('') + '</div>' +
      '<div class="sx-shapes sx-emoji sx-animg"></div><p class="st-note">These move! Download as <b>MP4</b> or <b>GIF</b> to keep the animation. Animated emoji by Google Noto (free, CC BY 4.0).</p></section>';
    var plus = panel.querySelector('.sx-plus');
    if (plus) plus.insertBefore(box, plus.firstChild); else panel.insertBefore(box, panel.firstChild);
    var jump = panel.querySelector('.sx-jump');
    if (jump && !jump.querySelector('[data-jump3]')) {
      jump.insertAdjacentHTML('afterbegin', '<button class="st-chip" data-jump3="anim">✨ Animated</button>');
      jump.addEventListener('click', function (e) { if (e.target.closest('[data-jump3]')) box.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    }
    var grid = box.querySelector('.sx-animg');
    function draw() { grid.innerHTML = CATS[curCat][1].split(' ').map(function (c) { return '<button data-acode="' + c + '" title="Animated sticker"><img loading="lazy" alt="" src="' + BASE + c + '/emoji.svg"><i class="sx-play">▶</i></button>'; }).join(''); }
    draw();
    box.addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-acat]'))) { curCat = +b.dataset.acat; [].forEach.call(box.querySelectorAll('[data-acat]'), function (x) { x.setAttribute('aria-pressed', x === b); }); draw(); return; }
      if ((b = e.target.closest('[data-acode]'))) addSticker(b.dataset.acode);
    });
    // preview: hovering a sticker shows it moving
    grid.addEventListener('mouseover', function (e) { var b = e.target.closest('[data-acode]'); if (!b || b.__pv) return; b.__pv = 1; var im = b.querySelector('img'); im.src = BASE + b.dataset.acode + '/512.webp'; });
  }

  var css = '.sx-animg button{position:relative;background:#fff}.sx-play{position:absolute;right:3px;bottom:3px;font-size:8px;line-height:14px;width:14px;height:14px;border-radius:50%;background:#7c3aed;color:#fff;font-style:normal;text-align:center}.sx-new{display:inline-block;font:800 9px/1 \'SP Inter\',sans-serif;background:#f43f5e;color:#fff;border-radius:6px;padding:3px 5px;vertical-align:middle;margin-left:4px}.sx-animbox{margin-bottom:6px}';
  try { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); } catch (e) {}

  var baseInstall = Pro.install;
  Pro.install = function (studio) {
    baseInstall(studio); S = studio; cv = S.canvas;
    var prevEls = S.elsHook; S.elsHook = function (panel) { if (prevEls) prevEls(panel); elsAnim(panel); };
    cv.on('object:added', kick); cv.on('after:render', function () { if (!looping) kick(); });
    wrapGif();
    if (!window.gifenc) window.addEventListener('load', wrapGif);
    // preload the player quietly so the first sticker appears fast
    setTimeout(function () { lib().catch(function () {}); }, 4000);
  };
  CATS.forEach(function (c) { c[1].split(' ').forEach(function (k) { names[k] = c[0].toLowerCase().replace(/s$/, ''); }); });
  Pro.anim = { CATS: CATS, addSticker: addSticker, lib: lib, clock: clock };
})();
