(function () {
  document.documentElement.classList.add('js');
  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
  var q = document.getElementById('q'), groups = [].slice.call(document.querySelectorAll('section.group')),
      empty = document.getElementById('empty'), tabs = [].slice.call(document.querySelectorAll('.tabs button')),
      pill = document.querySelector('.tabs .pill'), filter = 'all';

  groups.forEach(function (g) { [].forEach.call(g.querySelectorAll('.tool'), function (t, i) { t.style.setProperty('--n', i); }); });

  function apply() {
    var t = q.value.trim().toLowerCase(), n = 0;
    groups.forEach(function (g) {
      var gOk = filter === 'all' || g.dataset.g === filter, any = false;
      [].forEach.call(g.querySelectorAll('.tool'), function (a) {
        var ok = gOk && (!t || (a.dataset.k + ' ' + a.textContent).toLowerCase().indexOf(t) > -1);
        a.style.display = ok ? '' : 'none'; if (ok) { any = true; n++; }
      });
      g.style.display = any ? '' : 'none';
      if (any) g.classList.add('in');
    });
    empty.style.display = n ? 'none' : 'block';
  }
  function movePill(btn) { if (!btn) return; pill.style.width = btn.offsetWidth + 'px'; pill.style.transform = 'translateX(' + (btn.offsetLeft - 4) + 'px)'; }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      filter = b.dataset.f; movePill(b); apply();
      var top = document.getElementById('tools').getBoundingClientRect().top + scrollY - 140;
      if (scrollY > top) scrollTo({ top: top, behavior: 'smooth' });
    });
  });
  q.addEventListener('input', apply);
  addEventListener('keydown', function (e) {
    var a = document.activeElement;
    if (e.key === '/' && a !== q && !/INPUT|TEXTAREA|SELECT/.test(a.tagName)) { e.preventDefault(); q.focus(); }
    if (e.key === 'Escape' && a === q) { q.value = ''; apply(); q.blur(); }
  });
  function sizePill() { movePill(document.querySelector('.tabs button[aria-selected=true]')); }
  addEventListener('resize', sizePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizePill);
  sizePill();

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px' }) : null;
  [].forEach.call(document.querySelectorAll('.reveal, .steps'), function (el) { io ? io.observe(el) : el.classList.add('in'); });

  var tb = document.getElementById('toolbar');
  addEventListener('scroll', function () { tb.classList.toggle('stuck', tb.getBoundingClientRect().top <= 64); }, { passive: true });

  var stage = document.querySelector('.stage');
  if (stage) stage.addEventListener('click', function () {
    var s = stage.querySelector('.sheet'); s.parentNode.replaceChild(s.cloneNode(true), s);
  });
})();

/* Motion extras: count-up, card spotlight, hero parallax, magnetic button, maker reveal. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // count-up when the stats come into view
  var nums = [].slice.call(document.querySelectorAll('[data-count]'));
  function count(el) {
    var end = +el.dataset.count, t0 = null, dur = 1200;
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    el.textContent = '0'; requestAnimationFrame(step);
  }
  if (!reduce) setTimeout(function () { nums.forEach(count); }, 700);

  // cursor spotlight on tool cards
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.tool'); if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // gentle parallax of ambient marks
  var hero = document.querySelector('.hero'), marks = [].slice.call(document.querySelectorAll('.ambient i'));
  if (hero && !reduce) hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    marks.forEach(function (m, i) { var d = (i % 3 + 1) * 10; m.style.transform = 'translate(' + (x * d) + 'px,' + (y * d) + 'px)'; });
  });

  // magnetic primary button
  var btn = document.querySelector('.btn-primary');
  if (btn && !reduce && matchMedia('(hover: hover)').matches) {
    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .15) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25 - 2) + 'px)';
    });
    btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
  }

  // maker card reveal
  var maker = document.querySelector('.maker');
  if (maker) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { maker.classList.add('in'); io.disconnect(); } }); }, { threshold: .4 });
      io.observe(maker);
    } else maker.classList.add('in');
  }
})();
