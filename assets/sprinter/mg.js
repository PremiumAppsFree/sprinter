/* S Printer — hero motion graphic, choreographed like a short product film:
   photo arrives → face found and cropped to 3.5 × 4.5 cm → background cleaned → 8 copies fly onto an A4
   sheet → the pointer presses Print → ready. Loops; pauses off-screen; a still frame for reduced motion. */
(function () {
  'use strict';
  var mg = document.querySelector('.mg'); if (!mg || !mg.animate) return;
  var $ = function (s) { return mg.querySelector(s); };
  var photo = $('.mg-photo'), clean = $('.mg-clean'), scan = $('.mg-scan'), crop = $('.mg-crop'), size = $('.mg-size'),
      sheet = $('.mg-sheet'), slots = [].slice.call(mg.querySelectorAll('.mg-slots i')), bar = $('.mg-bar'), rules = [].slice.call(mg.querySelectorAll('.mg-rule')),
      btn = $('.mg-print'), cursor = $('.mg-cursor'), ring = $('.mg-cursor .ring'), badge = $('.mg-badge'), tilesBox = $('.mg-tiles'),
      steps = [].slice.call(mg.querySelectorAll('.mg-steps li'));
  var OUT = 'cubic-bezier(.16,1,.3,1)', BACK = 'cubic-bezier(.34,1.56,.64,1)', INOUT = 'cubic-bezier(.65,0,.35,1)';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anims = [], timers = [], running = false, visible = true;

  // eight copies of the cropped portrait
  var tiles = [];
  for (var i = 0; i < 8; i++) {
    var t = document.createElement('div'); t.className = 'mg-tile';
    t.innerHTML = '<svg viewBox="0 0 300 400"><use href="#mg-person"/></svg>';
    tilesBox.appendChild(t); tiles.push(t);
  }
  function rel(el) { var a = el.getBoundingClientRect(), b = mg.getBoundingClientRect(), s = b.width / mg.offsetWidth || 1; return { x: (a.left - b.left) / s, y: (a.top - b.top) / s, w: a.width / s, h: a.height / s }; }
  function A(el, kf, o) { var a = el.animate(kf, Object.assign({ fill: 'both' }, o)); anims.push(a); return a; }
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function step(n, dur) {
    steps.forEach(function (s, i) { s.classList.toggle('done', i < n); s.classList.toggle('on', i === n); });
    if (steps[n]) { steps[n].style.setProperty('--d', (dur || 1200) + 'ms'); var li = steps[n]; li.classList.remove('on'); void li.offsetWidth; li.classList.add('on'); }
  }
  function clear() { anims.forEach(function (a) { try { a.cancel(); } catch (e) {} }); anims = []; timers.forEach(clearTimeout); timers = []; }

  function play() {
    clear(); running = true;
    // measure where things are when nothing is transformed (tilt off for a moment)
    var tilt = mg.style.transform; mg.style.transition = 'none'; mg.style.transform = 'none';
    var sheetBox = rel(sheet), cropBox = rel(crop), slotBox = slots.map(rel);
    mg.style.transform = tilt; void mg.offsetWidth; mg.style.transition = '';
    var photoRot = -3;

    // 1 — the photo arrives
    step(0, 900);
    A(photo, [{ opacity: 0, transform: 'translate(70px,80px) rotate(10deg) scale(.86)', filter: 'blur(6px)' },
              { opacity: 1, transform: 'translate(0,0) rotate(' + photoRot + 'deg) scale(1)', filter: 'blur(0)' }], { duration: 900, easing: BACK });

    // 2 — face found, cropped to passport size
    at(950, function () { step(1, 1100); });
    A(scan, [{ opacity: 0, transform: 'translateY(-30%)' }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .85 }, { opacity: 0, transform: 'translateY(420%)' }], { delay: 950, duration: 900, easing: INOUT });
    A(crop, [{ opacity: 0, transform: 'scale(1.35)' }, { opacity: 1, transform: 'scale(1)' }], { delay: 1500, duration: 650, easing: OUT });
    A(size, [{ opacity: 0, transform: 'translate(-50%,8px) scale(.9)' }, { opacity: 1, transform: 'translate(-50%,0) scale(1)' }], { delay: 1900, duration: 450, easing: BACK });

    // 3 — background cleaned (a circular wipe from the face outwards)
    at(2250, function () { step(2, 900); });
    A(clean, [{ clipPath: 'circle(0% at 50% 42%)' }, { clipPath: 'circle(75% at 50% 42%)' }], { delay: 2300, duration: 850, easing: INOUT });

    // 4 — the A4 sheet swings in, the photo steps back, eight copies fly to their places
    at(3250, function () { step(3, 1500); });
    A(sheet, [{ opacity: 0, transform: 'translateX(40px) rotateY(-28deg) scale(.94)' }, { opacity: 1, transform: 'none' }], { delay: 3250, duration: 900, easing: OUT });
    A(photo, [{ opacity: 1, transform: 'rotate(' + photoRot + 'deg) scale(1)' }, { opacity: 1, transform: 'translate(-58%,-4%) rotate(-8deg) scale(.62)', offset: .55 }, { opacity: 0, transform: 'translate(-80%,0) rotate(-12deg) scale(.5)' }], { delay: 3300, duration: 1500, easing: INOUT });
    var c0 = cropBox, sx = c0.x + c0.w / 2, sy = c0.y + c0.h / 2;
    tiles.forEach(function (t, i) {
      var d = slotBox[i]; t.style.width = d.w + 'px'; t.style.height = d.h + 'px';
      var fromX = sx - d.w / 2 - 0.58 * c0.w, fromY = sy - d.h / 2, k = c0.w * 0.62 / d.w;
      A(t, [{ opacity: 0, transform: 'translate(' + fromX + 'px,' + fromY + 'px) scale(' + k + ') rotate(-8deg)' },
            { opacity: 1, offset: .2 },
            { opacity: 1, transform: 'translate(' + d.x + 'px,' + d.y + 'px) scale(1) rotate(0)' }],
        { delay: 3650 + i * 95, duration: 800, easing: BACK });
    });
    A(bar, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { delay: 4700, duration: 600, easing: OUT });
    rules.forEach(function (r, i) { A(r, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { delay: 4850 + i * 120, duration: 600, easing: OUT }); });

    // 5 — the pointer presses Print
    at(5300, function () {
      step(4, 1500);
      var b = rel(btn), tx = b.x + b.w * 0.55, ty = b.y + b.h * 0.55;
      A(cursor, [{ opacity: 0, transform: 'translate(' + (tx + 120) + 'px,' + (ty + 90) + 'px)' }, { opacity: 1, offset: .2 }, { opacity: 1, transform: 'translate(' + tx + 'px,' + ty + 'px)' }], { duration: 700, easing: OUT });
      A(cursor, [{ transform: 'translate(' + tx + 'px,' + ty + 'px) scale(1)' }, { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(.82)' }, { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(1)' }], { delay: 760, duration: 260, easing: INOUT });
      A(ring, [{ opacity: .9, transform: 'scale(.3)' }, { opacity: 0, transform: 'scale(1.6)' }], { delay: 820, duration: 520, easing: OUT });
      A(btn, [{ transform: 'scale(1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' }], { delay: 780, duration: 260, easing: INOUT });
      A(sheet, [{ transform: 'none', boxShadow: '0 34px 60px -18px rgba(27,35,48,.28),0 2px 6px rgba(27,35,48,.06)' },
                { transform: 'translateY(-8px) rotate(-1deg)', boxShadow: '0 50px 80px -20px rgba(27,35,48,.34),0 2px 6px rgba(27,35,48,.06)' }], { delay: 1000, duration: 700, easing: OUT });
      A(badge, [{ opacity: 0, transform: 'translateY(10px) scale(.9)' }, { opacity: 1, transform: 'none' }], { delay: 1150, duration: 500, easing: BACK });
      A(cursor, [{ opacity: 1 }, { opacity: 0 }], { delay: 1400, duration: 400 });
    });

    // hold, fade out, loop
    at(8600, function () {
      steps.forEach(function (s) { s.classList.add('done'); s.classList.remove('on'); });
      var parts = [sheet, badge].concat(tiles);
      parts.forEach(function (el) { A(el, [{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], { duration: 500, easing: 'ease-in' }); });
    });
    at(9300, function () { if (visible) play(); else running = false; });
  }

  // still frame for people who prefer less motion
  function still() {
    photo.style.opacity = 0; sheet.style.opacity = 1; bar.style.clipPath = 'none'; rules.forEach(function (r) { r.style.transform = 'none'; });
    badge.style.opacity = 1; var sl = slots.map(rel);
    tiles.forEach(function (t, i) { var d = sl[i]; t.style.width = d.w + 'px'; t.style.height = d.h + 'px'; t.style.opacity = 1; t.style.transform = 'translate(' + d.x + 'px,' + d.y + 'px)'; });
    steps.forEach(function (s) { s.classList.add('done'); });
  }

  // a little depth: the film tilts toward the pointer
  var hero = mg.closest('.hero') || document;
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = mg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      mg.style.transform = 'rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 5).toFixed(2) + 'deg)';
    });
    hero.addEventListener('pointerleave', function () { mg.style.transform = ''; });
    mg.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)'; mg.style.transformStyle = 'preserve-3d';
  }

  function start() {
    if (reduce) { still(); return; }
    mg.addEventListener('click', function () { play(); });
    var go = function () { if (!running) play(); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { visible = e.isIntersecting; if (visible) go(); }); }, { threshold: .25 }).observe(mg);
    } else go();
    document.addEventListener('visibilitychange', function () { if (document.hidden) { clear(); running = false; } else if (visible) go(); });
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (visible) play(); }, 250); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(start, 350); }); else setTimeout(start, 600);
})();
