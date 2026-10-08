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
