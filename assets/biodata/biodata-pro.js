/* S Printer — CV & Bio-Data Maker, studio layer (original design and code by S Printer).
 * Adds the editor workspace: template gallery with live previews, design controls, section manager,
 * skill bars, one-page fit, strength score, ready phrases, undo / redo, zoom, saved copies and backup. */
(function () {
  'use strict';
  var A = null, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var PH = 1123;
  var IC = {
    grid: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1.2-1-1.5-1-2.6 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.2" r="1"/><circle cx="14.6" cy="7.2" r="1"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    wand: '<path d="M4 20L15 9"/><path d="M14 4l.9 2.1L17 7l-2.1.9L14 10l-.9-2.1L11 7l2.1-.9z"/><path d="M19 12l.6 1.4L21 14l-1.4.6L19 16l-.6-1.4L17 14l1.4-.6z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.5 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    save: '<path d="M5 3h11l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    printer: '<path d="M7 9V3h10v6"/><path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    page: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  function pi(n) { return '<svg class="bd-i" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + IC[n] + '</g></svg>'; }
  function esc(s) { return A ? A.esc(s) : String(s); }

  // ---------- sections ----------
  var ORDER = {
    cv: ['summary', 'experience', 'projects', 'education', 'certs', 'skills', 'strengths', 'languages', 'achieve', 'interests', 'refs', 'personal', 'contact'],
    job: ['personal', 'objective', 'education', 'experience', 'certs', 'skills', 'strengths', 'hobbies', 'contact'],
    marriage: ['about', 'personal', 'family', 'hobbies', 'expect', 'contact']
  };
  function order(S) { S.order = S.order || {}; var o = S.order[S.type], def = ORDER[S.type]; if (!Array.isArray(o)) o = S.order[S.type] = def.slice(); def.forEach(function (k) { if (o.indexOf(k) < 0) o.push(k); }); return o; }
  function customs(S) { if (!Array.isArray(S.custom)) S.custom = []; return S.custom; }
  function bar(li, re) {
    var t = li.textContent.trim(), m = /^(.*?)\s*[:\-–—]\s*(\d{1,3})\s*(%|\/\s*5|\/\s*10)?$/.exec(t) || /^(.*?)\s+(\d{1,3})\s*(%|\/\s*5|\/\s*10)$/.exec(t); if (!m || !m[1]) return;
    var v = +m[2], u = (m[3] || '').replace(/\s/g, ''), f = u === '%' ? v / 100 : u === '/5' ? v / 5 : u === '/10' ? v / 10 : v <= 5 ? v / 5 : v <= 10 ? v / 10 : v <= 100 ? v / 100 : -1;
    if (f < 0 || f > 1) return;
    li.className = 'skl'; li.innerHTML = '<span>' + esc(m[1]) + '</span>' + ((u === '/5' || (!u && v <= 5)) ? '<i class="dots">' + [1, 2, 3, 4, 5].map(function (n) { return '<b class="' + (n <= Math.round(f * 5) ? 'on' : '') + '"></b>'; }).join('') + '</i>' : '<i class="bar"><b style="width:' + Math.round(f * 100) + '%"></b></i>');
  }
  function decorate(d, S, thumb) {
    if (!A) return;
    var T = A.T, keys = {}, o = order(S), hide = S.hide || {};
    ORDER[S.type].forEach(function (k) { keys[T(k)] = k; });
    d.style.setProperty('--fs', S.fs || 1); d.style.setProperty('--gap', S.gap || 1);
    if (S.photoShape && S.photoShape !== 'auto') d.classList.add('ph-' + S.photoShape);
    if (S.head && S.head !== 'auto') d.classList.add('hs-' + S.head);
    var secs = $$('.sec', d).filter(function (s) { return !s.classList.contains('decl'); });
    secs.forEach(function (s) { var h = s.querySelector('h3'), k = h && keys[h.textContent]; if (k) { s.dataset.k = k; if (hide[k]) s.parentNode.removeChild(s); else if (k === 'skills' || k === 'languages') $$('li', s).forEach(bar); } });
    // custom sections go to the main column
    var host = d.querySelector('.main') || d.querySelector('.body');
    if (host) customs(S).forEach(function (c, i) {
      if (!String(c[0] || '').trim() && !String(c[1] || '').trim()) return; var k = 'custom' + i; if (hide[k]) return;
      var el = document.createElement('section'); el.className = 'sec'; el.dataset.k = k; var ls = String(c[1] || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      el.innerHTML = '<h3>' + esc(c[0] || 'More') + '</h3>' + (ls.length > 1 ? '<ul>' + ls.map(function (x) { return '<li>' + esc(x.replace(/^[-•*]\s*/, '')) + '</li>'; }).join('') + '</ul>' : '<p>' + esc(ls[0] || '') + '</p>');
      var ft = host.querySelector(':scope > .foot'); host.insertBefore(el, ft || null);
    });
    // order inside each column
    var parents = []; $$('.sec[data-k]', d).forEach(function (s) { if (parents.indexOf(s.parentNode) < 0) parents.push(s.parentNode); });
    parents.forEach(function (p) {
      var kids = [].filter.call(p.children, function (c) { return c.classList.contains('sec') && c.dataset.k; }); if (kids.length < 2) return;
      var mark = document.createComment('o'); p.insertBefore(mark, kids[0]);
      kids.map(function (c, i) { var x = o.indexOf(c.dataset.k); return { c: c, x: x < 0 ? 500 + i : x, i: i }; }).sort(function (a, b) { return a.x - b.x || a.i - b.i; }).forEach(function (e) { p.insertBefore(e.c, mark); });
      p.removeChild(mark);
    });
    $$('.two', d).forEach(function (t) { if (!t.children.length) t.parentNode.removeChild(t); });
  }

  // ---------- pages, zoom ----------
  function fitted(k) {
    var doc = $('#bd-doc'), sz = $('#bd-sizer'); if (!doc || !sz) return;
    var h = doc.offsetHeight, n = Math.max(1, Math.ceil((h - 4) / PH));
    $$('.bdp-brk', sz).forEach(function (e) { e.remove(); });
    for (var i = 1; i < n; i++) { var b = document.createElement('div'); b.className = 'bdp-brk'; b.style.top = Math.round(i * PH * k) + 'px'; b.innerHTML = '<span>Page ' + (i + 1) + '</span>'; sz.appendChild(b); }
    var pg = $('#bdp-pages'); if (pg) { pg.innerHTML = pi('page') + '<span>' + n + (n > 1 ? ' pages' : ' page') + '</span>'; pg.classList.toggle('warn', n > 1); }
    var z = $('#bdp-zv'); if (z) z.textContent = Math.round(k * 100) + '%';
  }
  function zoom(dir) { var z = window.SPBioZoom || 1; z = dir === 0 ? 1 : Math.max(0.5, Math.min(2.4, +(z + dir * 0.15).toFixed(2))); window.SPBioZoom = z; A.fit(); }
  function fitOne() {
    var S = A.state(), doc = $('#bd-doc'), steps = [];
    [1, 0.84, 0.68, 0.54, 0.42].forEach(function (g) { [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72].forEach(function (f) { steps.push([f, g, (1 - f) * 2 + (1 - g)]); }); });
    steps.sort(function (a, b) { return a[2] - b[2]; });
    for (var i = 0; i < steps.length; i++) { S.fs = steps[i][0]; S.gap = steps[i][1]; A.render(); if (doc.offsetHeight <= PH + 2) { done(true); return; } }
    done(false);
    function done(ok) { A.save(); design(); A.toast(ok ? 'Fits on one page now.' : 'Still more than one page — remove a few lines or hide a section.'); }
  }

  // ---------- score ----------
  function score(S) {
    var f = S.f || {}, has = function (k) { return String(f[k] || '').trim().length > 0; }, rows = function (a) { return (a || []).filter(function (r) { return r.some(function (x) { return String(x).trim(); }); }).length; }, items;
    if (S.type === 'marriage') items = [['name', has('name'), 'Add the full name'], ['phone', has('phone'), 'Add a contact number'], ['dob', has('dob'), 'Add date of birth'], ['height', has('height'), 'Add height'], ['qual', has('qual'), 'Add education'], ['job', has('job'), 'Add occupation'], ['father', has('father'), "Add father's name"], ['mother', has('mother'), "Add mother's name"], ['fam', rows(S.family) > 0, 'Add family members'], ['about', has('summary'), 'Write 1–2 lines about yourself'], ['photo', !!S.photo, 'Add a photo']].map(function (x) { return [x[0], x[1], x[2], 9]; });
    else items = [['name', has('name'), 'Add your full name', 10], ['title', has('title'), 'Add the job title / post you want', 6], ['phone', has('phone'), 'Add your mobile number', 10], ['email', has('email'), 'Add an e-mail address', 9], ['sum', String(f.summary || '').trim().length >= 60, 'Write a 2–3 line profile (60+ letters)', 14], ['edu', rows(S.edu) > 0, 'Add your education', 14], ['exp', rows(S.exp) + rows(S.proj) > 0, 'Add work experience or a project', 14], ['skills', A.lines(f.skills).length >= 4, 'List at least 4 skills', 10], ['num', /\d/.test((S.exp || []).map(function (r) { return r[3]; }).join(' ') + (f.achieve || '')), 'Use numbers in your work points (e.g. “20+ clients”)', 5], ['photo', !!S.photo || S.tpl === 'minimal' || S.photoShape === 'none', 'Add a photo (or choose a no-photo design)', 4], ['extra', has('certs') || has('strengths') || has('achieve'), 'Add certificates, strengths or achievements', 4]];
    var tot = 0, got = 0, tips = []; items.forEach(function (x) { tot += x[3]; if (x[1]) got += x[3]; else tips.push(x[2]); });
    return { p: Math.round(got / tot * 100), tips: tips };
  }
  function ring(p) { var c = 2 * Math.PI * 15, col = p >= 80 ? '#16a34a' : p >= 50 ? '#f59e0b' : '#e11d48'; return '<svg viewBox="0 0 36 36" class="bdp-ring"><circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" stroke-width="3.5"/><circle cx="18" cy="18" r="15" fill="none" stroke="' + col + '" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="' + (c * p / 100).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 18 18)"/><text x="18" y="22" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1b2330">' + p + '</text></svg>'; }

  // ---------- phrases ----------
  var PHR = {
    'Fresher': ['Motivated graduate seeking an entry-level role where I can apply my knowledge, learn quickly and contribute to the team.', 'Hard-working fresher with good communication and computer skills, eager to start my career and grow with the organisation.'],
    'Office / Computer operator': ['Reliable office assistant with experience in data entry, MS Office and record keeping. Accurate, punctual and good with people.', 'Computer operator skilled in typing, billing software and online applications, with a habit of finishing work on time.'],
    'Teacher': ['Dedicated teacher with a clear, patient teaching style and a record of improving student results through activity-based learning.', 'Passionate educator skilled in lesson planning, classroom management and parent communication.'],
    'Sales / Marketing': ['Target-driven sales professional with a record of meeting monthly goals, building customer relationships and growing repeat business.', 'Energetic marketing executive experienced in field sales, lead generation and social media promotion.'],
    'Accountant': ['Detail-oriented accountant experienced in Tally, GST filing, bank reconciliation and monthly reports.', 'Accounts executive with strong knowledge of billing, ledgers and tax returns, known for accuracy and honesty.'],
    'Customer support': ['Friendly customer-support executive who resolves queries quickly over phone and chat and keeps satisfaction scores high.', 'Patient listener with clear communication in Bengali, Hindi and English and experience handling 60+ calls a day.'],
    'Engineer / IT': ['Software developer with hands-on experience in building and maintaining web applications, writing clean code and working in a team.', 'Engineer with strong problem-solving skills and practical project experience, keen to deliver reliable results.'],
    'Nurse / Health': ['Caring nursing professional experienced in patient care, medication, record keeping and assisting doctors in busy wards.', 'Healthcare worker with good clinical knowledge, calm under pressure and committed to patient safety.'],
    'Driver / Delivery': ['Experienced driver with a clean record, good knowledge of local routes and a habit of safe, on-time delivery.', 'Responsible delivery executive, polite with customers and careful with goods and cash.'],
    'Designer': ['Creative designer experienced in branding, social media posts and print layouts, with a strong eye for clean design.', 'Graphic designer skilled in Photoshop and Illustrator who turns ideas into clear, attractive visuals on deadline.']
  };
  var WORDS = ['Managed', 'Handled', 'Prepared', 'Improved', 'Increased', 'Reduced', 'Trained', 'Organised', 'Designed', 'Built', 'Led', 'Achieved', 'Supported', 'Maintained', 'Completed'];

  // ---------- panels ----------
  function seg(attr, opts, cur) { return '<div class="bd-seg">' + opts.map(function (o) { return '<button type="button" ' + attr + '="' + o[0] + '" aria-pressed="' + (String(cur) === String(o[0])) + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function gallery() {
    var g = $('#bdp-gal'); if (!g) return; var S = A.state();
    if (!g.children.length) g.innerHTML = A.TPL.map(function (t) { return '<button type="button" class="bdp-card" data-tpl="' + t[0] + '"><span class="bdp-th"><span class="doc"></span></span><b>' + esc(t[1]) + '</b></button>'; }).join('');
    $$('.bdp-card', g).forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.tpl === S.tpl); if (g.offsetParent) A.render(c.querySelector('.doc'), c.dataset.tpl); });
  }
  function design() {
    var p = $('#bdp-design'); if (!p) return; var S = A.state(), fs = S.fs || 1, gp = S.gap || 1;
    p.innerHTML = '<div class="bd-lbl">Text size</div>' + seg('data-fs', [[0.9, 'Small'], [1, 'Normal'], [1.08, 'Large']], [0.9, 1, 1.08].reduce(function (a, b) { return Math.abs(b - fs) < Math.abs(a - fs) ? b : a; })) +
      '<div class="bd-lbl">Spacing</div>' + seg('data-gap', [[0.62, 'Compact'], [1, 'Normal'], [1.3, 'Roomy']], [0.62, 1, 1.3].reduce(function (a, b) { return Math.abs(b - gp) < Math.abs(a - gp) ? b : a; })) +
      '<div class="bd-lbl">Photo</div>' + seg('data-ps', [['auto', 'Auto'], ['round', 'Round'], ['square', 'Square'], ['none', 'No photo']], S.photoShape || 'auto') +
      '<div class="bd-lbl">Heading style</div>' + seg('data-hs', [['auto', 'Auto'], ['line', 'Underline'], ['box', 'Filled'], ['tag', 'Side bar']], S.head || 'auto') +
      '<button type="button" class="bdp-wide" data-fitone>' + pi('fit') + '<span>Fit to one page</span></button><p class="bdp-hint">Skill bars: write a skill as “Photoshop - 80%” or “English - 4/5” and it becomes a bar or dots.</p>';
  }
  function sections() {
    var p = $('#bdp-sections'); if (!p) return; var S = A.state(), o = order(S), hide = S.hide || {}, T = A.T, cs = customs(S);
    p.innerHTML = '<p class="bdp-hint">Hide a section with the eye, or move it up / down. The order changes inside each column of the design.</p><div class="bdp-list">' + o.filter(function (k) { return ORDER[S.type].indexOf(k) >= 0; }).map(function (k) {
      return '<div class="bdp-item' + (hide[k] ? ' off' : '') + '"><button type="button" data-eye="' + k + '" title="Show / hide">' + pi(hide[k] ? 'eyeoff' : 'eye') + '</button><b>' + esc(T(k)) + '</b><button type="button" data-mv="' + k + '" data-d="-1" title="Move up">' + pi('up') + '</button><button type="button" data-mv="' + k + '" data-d="1" title="Move down">' + pi('down') + '</button></div>';
    }).join('') + '</div><div class="bd-lbl">Your own sections</div>' + cs.map(function (c, i) {
      return '<div class="bdp-cust"><input data-ct="' + i + '" placeholder="Section title (e.g. Publications)" value="' + esc(c[0] || '') + '"><textarea data-cb="' + i + '" rows="3" placeholder="One point per line">' + esc(c[1] || '') + '</textarea><button type="button" class="bd-mini" data-cdel="' + i + '">' + pi('trash') + 'Remove</button></div>';
    }).join('') + '<button type="button" class="bdp-wide" data-cadd>' + pi('plus') + '<span>Add a section</span></button>';
  }
  function files() { try { return JSON.parse(localStorage.getItem('sp-biodata-files') || '[]') || []; } catch (e) { return []; } }
  function putFiles(a) { try { localStorage.setItem('sp-biodata-files', JSON.stringify(a)); return true; } catch (e) { A.toast('Storage is full — download a backup file instead.'); return false; } }
  function tools() {
    var p = $('#bdp-tools'); if (!p) return; var S = A.state(), sc = score(S), fl = files();
    p.innerHTML = '<div class="bdp-score">' + ring(sc.p) + '<div><b>' + (sc.p >= 80 ? 'Strong — ready to send' : sc.p >= 50 ? 'Good start' : 'Needs more details') + '</b><small>Strength score</small></div></div>' +
      (sc.tips.length ? '<ul class="bdp-tips">' + sc.tips.slice(0, 5).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '<p class="bdp-hint">' + pi('check') + ' Everything important is filled in.</p>') +
      (S.type !== 'marriage' ? '<div class="bd-lbl">Ready profile lines — tap to use</div><select id="bdp-role">' + Object.keys(PHR).map(function (k) { return '<option' + (k === (p.dataset.role || 'Fresher') ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select><div class="bdp-phr">' + PHR[p.dataset.role || 'Fresher'].map(function (t, i) { return '<button type="button" data-phr="' + i + '">' + esc(t) + '</button>'; }).join('') + '</div><div class="bd-lbl">Strong words to start a work point</div><div class="bdp-words">' + WORDS.map(function (w) { return '<span>' + w + '</span>'; }).join('') + '</div>' : '') +
      '<div class="bd-lbl">My saved copies (on this device)</div><div class="bdp-save"><input id="bdp-fname" placeholder="Name this copy, e.g. Teacher CV" maxlength="40"><button type="button" class="bd-mini" data-fsave>' + pi('save') + 'Save copy</button></div>' +
      (fl.length ? '<div class="bdp-list">' + fl.map(function (x, i) { return '<div class="bdp-item"><b>' + esc(x.n) + '<small>' + esc(x.t || '') + '</small></b><button type="button" class="bd-mini" data-fopen="' + i + '">Open</button><button type="button" data-fdel="' + i + '" title="Delete">' + pi('trash') + '</button></div>'; }).join('') + '</div>' : '<p class="bdp-hint">Keep different versions, such as one CV for each job.</p>') +
      '<div class="bd-lbl">Backup file</div><div class="bdp-save"><button type="button" class="bd-mini" data-bak>' + pi('download') + 'Download backup</button><label class="bd-mini bdp-file">' + pi('upload') + 'Open backup<input type="file" accept=".json,application/json" id="bdp-restore"></label></div><p class="bdp-hint">A backup file lets you continue on another phone or computer.</p>';
  }
  function top() { var S = A.state(), sc = score(S), e = $('#bdp-score'); if (e) { e.innerHTML = ring(sc.p); e.title = 'Strength score ' + sc.p + '%'; } $('#bdp-undo').disabled = hi <= 0; $('#bdp-redo').disabled = hi >= hist.length - 1; }
  function panes() { gallery(); var t = document.body.dataset.tab; if (t === 'design') design(); if (t === 'sections') sections(); if (t === 'tools') tools(); top(); }

  // ---------- undo / redo ----------
  var hist = [], hi = -1;
  function changed(S) { var j = JSON.stringify(S); if (hist[hi] !== j) { hist = hist.slice(0, hi + 1); hist.push(j); if (hist.length > 40) hist.shift(); hi = hist.length - 1; } panes(); }
  function step(d) { var n = hi + d; if (n < 0 || n >= hist.length) return; hi = n; A.set(JSON.parse(hist[hi])); }

  function tab(t) {
    document.body.dataset.tab = t; document.body.dataset.view = t === 'preview' ? 'preview' : 'edit';
    $$('[data-tab]').forEach(function (b) { if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', b.dataset.tab === t); });
    $$('[data-pane]').forEach(function (p) { p.hidden = p.dataset.pane !== t; });
    try { sessionStorage.setItem('sp-biodata-tab', t); } catch (e) {}
    panes(); setTimeout(A.fit, 40);
  }
  function start(api) {
    A = api; var app = $('#bd-app'); if (!app) return;
    $$('[data-pi]').forEach(function (e) { e.insertAdjacentHTML('afterbegin', pi(e.dataset.pi)); });
    app.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var S = A.state(), d = b.dataset;
      if (d.tab) return tab(d.tab);
      if (d.fs) { S.fs = +d.fs; A.render(); A.save(); design(); }
      else if (d.gap) { S.gap = +d.gap; A.render(); A.save(); design(); }
      else if (d.ps) { S.photoShape = d.ps; A.render(); A.save(); design(); }
      else if (d.hs) { S.head = d.hs; A.render(); A.save(); design(); }
      else if (b.hasAttribute('data-fitone')) fitOne();
      else if (d.eye) { S.hide = S.hide || {}; S.hide[d.eye] = !S.hide[d.eye]; A.render(); A.save(); sections(); }
      else if (d.mv) { var o = order(S), vis = o.filter(function (k) { return ORDER[S.type].indexOf(k) >= 0; }), i = vis.indexOf(d.mv), j = i + (+d.d); if (j < 0 || j >= vis.length) return; var a = o.indexOf(vis[i]), c = o.indexOf(vis[j]); o[a] = vis[j]; o[c] = vis[i]; A.render(); A.save(); sections(); }
      else if (b.hasAttribute('data-cadd')) { customs(S).push(['', '']); sections(); var ins = $$('#bdp-sections [data-ct]'); if (ins.length) ins[ins.length - 1].focus(); }
      else if (d.cdel) { customs(S).splice(+d.cdel, 1); A.render(); A.save(); sections(); }
      else if (d.phr) { var role = $('#bdp-role').value; S.f.summary = PHR[role][+d.phr]; A.refresh(); A.toast('Profile line added — edit it in Details to make it yours.'); }
      else if (b.hasAttribute('data-fsave')) { var n = ($('#bdp-fname').value || '').trim() || (S.f.name || 'My') + ' — ' + S.type.toUpperCase(), fl = files(); fl.unshift({ n: n, t: new Date().toLocaleDateString(), d: JSON.parse(JSON.stringify(S)) }); if (putFiles(fl.slice(0, 12))) { A.toast('Saved “' + n + '”.'); tools(); } }
      else if (d.fopen) { var f = files()[+d.fopen]; if (f) { A.set(f.d); A.toast('Opened “' + f.n + '”.'); } }
      else if (d.fdel) { var l = files(); l.splice(+d.fdel, 1); putFiles(l); tools(); }
      else if (b.hasAttribute('data-bak')) { var blob = new Blob([JSON.stringify({ app: 'sprinter-biodata', v: 1, data: S })], { type: 'application/json' }), u = URL.createObjectURL(blob), a2 = document.createElement('a'); a2.href = u; a2.download = (S.f.name || 'my').replace(/[^\w]+/g, '-') + '-cv-backup.json'; document.body.appendChild(a2); a2.click(); a2.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 3000); }
      else if (b.id === 'bdp-undo') step(-1); else if (b.id === 'bdp-redo') step(1);
      else if (d.zoom) zoom(+d.zoom);
    });
    app.addEventListener('input', function (e) {
      var t = e.target, S = A.state();
      if (t.dataset.ct != null) { customs(S)[+t.dataset.ct][0] = t.value; A.render(); A.save(); }
      else if (t.dataset.cb != null) { customs(S)[+t.dataset.cb][1] = t.value; A.render(); A.save(); }
    });
    app.addEventListener('change', function (e) {
      var t = e.target;
      if (t.id === 'bdp-role') { $('#bdp-tools').dataset.role = t.value; tools(); }
      else if (t.id === 'bdp-restore' && t.files[0]) { var rd = new FileReader(); rd.onload = function () { try { var j = JSON.parse(rd.result), dta = j && j.data && j.data.f ? j.data : j; if (!dta || !dta.f) throw 0; A.set(dta); A.toast('Backup opened.'); } catch (x) { A.toast('This is not an S Printer CV backup file.'); } }; rd.readAsText(t.files[0]); }
    });
    document.addEventListener('keydown', function (e) { if (!(e.ctrlKey || e.metaKey) || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''))) return; var k = e.key.toLowerCase(); if (k === 'z') { e.preventDefault(); step(e.shiftKey ? 1 : -1); } else if (k === 'y') { e.preventDefault(); step(1); } });
    hist = [JSON.stringify(A.state())]; hi = 0;
    var t0 = 'tpl'; try { t0 = sessionStorage.getItem('sp-biodata-tab') || (A.state().f.name ? 'details' : 'tpl'); } catch (e) {}
    if (t0 === 'preview') t0 = 'details';
    A.render(); tab(t0);
    if (document.fonts) document.fonts.ready.then(function () { gallery(); });
  }
  window.SPBioPro = { start: start, decorate: decorate, fitted: fitted, changed: changed };
})();
