/* S Printer — Resume / CV templates (original designs) */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P;
  var EXP = '{{EXPERIENCE}}', EDU = '{{EDUCATION}}';
  function sec(x, y, w, title, body, u, p, o) {
    o = o || {};
    var out = [T(x, y, w, title, 15 * u, { font: o.hf || 'Montserrat', bold: 800, color: o.hc || p.a, ls: 120 })];
    if (o.rule !== false) out.push(R(x, y + 24 * u, o.ruleW || 44 * u, 3 * u, o.rc || p.b, { r: 2 }));
    out.push(T(x, y + 36 * u, w, body, (o.bs || 12.5) * u, { font: o.bf || 'Poppins', color: o.bc || '#334155', lh: o.lh || 1.45 }));
    return out;
  }
  var layouts = [
    { id: 'side', name: 'Sidebar Pro', cat: 'Professional', build: function (W, H, p) {
      var u = W / 794, sw = 268 * u, o = [R(0, 0, sw, H, p.a), R(sw, 0, W - sw, 150 * u, p.soft)];
      o.push(P(64 * u, 46 * u, 140 * u, 140 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: '#ffffff', sw: 5 * u }));
      o.push(T(30 * u, 214 * u, sw - 60 * u, 'CONTACT', 14 * u, { font: 'Montserrat', bold: 800, color: '#ffffff', ls: 150 }));
      o.push(R(30 * u, 238 * u, 40 * u, 3 * u, p.acc));
      o.push(T(30 * u, 252 * u, sw - 56 * u, '☎  {{PHONE}}\n✉  {{EMAIL}}\n⌂  {{ADDRESS}}\n◉  {{WEBSITE}}', 12 * u, { color: '#e2e8f0', lh: 1.6 }));
      o = o.concat(sec(30 * u, 420 * u, sw - 56 * u, 'SKILLS', '{{SKILLS|bullets}}', u, p, { hc: '#fff', rc: p.acc, bc: '#e2e8f0' }));
      o = o.concat(sec(30 * u, 640 * u, sw - 56 * u, 'LANGUAGES', '{{LANGUAGES|bullets}}', u, p, { hc: '#fff', rc: p.acc, bc: '#e2e8f0' }));
      o = o.concat(sec(30 * u, 780 * u, sw - 56 * u, 'HOBBIES', '{{HOBBIES|bullets}}', u, p, { hc: '#fff', rc: p.acc, bc: '#e2e8f0' }));
      var x = sw + 36 * u, w = W - x - 40 * u;
      o.push(T(x, 40 * u, w, '{{NAME}}', 36 * u, { font: 'Montserrat', bold: 800, color: p.a, lh: 1.05 }));
      o.push(T(x, 92 * u, w, '{{JOB_TITLE}}', 16 * u, { font: 'Poppins', bold: 600, color: p.b, ls: 60 }));
      o = o.concat(sec(x, 180 * u, w, 'PROFILE', '{{SUMMARY}}', u, p));
      o = o.concat(sec(x, 320 * u, w, 'WORK EXPERIENCE', EXP, u, p));
      o = o.concat(sec(x, 620 * u, w, 'EDUCATION', EDU, u, p));
      o = o.concat(sec(x, 840 * u, w, 'DECLARATION', '{{DECLARATION}}', u, p, { bs: 11.5 }));
      o.push(T(x, 1010 * u, w * 0.5, 'Place: {{PLACE}}\nDate: {{DATE}}', 12 * u, { color: '#334155', lh: 1.5 }));
      o.push(P(x + w - 170 * u, 990 * u, 170 * u, 50 * u, 'SIGN', { fill: '#f8fafc' }));
      o.push(T(x + w - 170 * u, 1046 * u, 170 * u, '({{NAME}})', 11 * u, { align: 'center', color: '#475569' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'band', name: 'Header Band', cat: 'Professional', build: function (W, H, p) {
      var u = W / 794, o = [R(0, 0, W, 190 * u, K.G(0, p.a, p.b)), R(0, 190 * u, W, 6 * u, p.acc)];
      o.push(T(44 * u, 46 * u, 520 * u, '{{NAME}}', 38 * u, { font: 'Montserrat', bold: 800, color: '#ffffff' }));
      o.push(T(44 * u, 98 * u, 520 * u, '{{JOB_TITLE}}', 16 * u, { color: p.c, bold: 600, ls: 80 }));
      o.push(T(44 * u, 130 * u, 540 * u, '☎ {{PHONE}}   ✉ {{EMAIL}}', 12 * u, { color: '#ffffff' }));
      o.push(P(W - 186 * u, 30 * u, 132 * u, 150 * u, 'PHOTO', { r: 10 * u, fill: p.c, stroke: '#ffffff', sw: 4 * u }));
      var lx = 44 * u, lw = 450 * u, rx = 530 * u, rw = W - rx - 40 * u;
      o = o.concat(sec(lx, 230 * u, lw, 'ABOUT ME', '{{SUMMARY}}', u, p));
      o = o.concat(sec(lx, 370 * u, lw, 'EXPERIENCE', EXP, u, p));
      o = o.concat(sec(lx, 660 * u, lw, 'EDUCATION', EDU, u, p));
      o.push(R(rx - 18 * u, 216 * u, 1.5 * u, 760 * u, p.c));
      o = o.concat(sec(rx, 230 * u, rw, 'SKILLS', '{{SKILLS|bullets}}', u, p));
      o = o.concat(sec(rx, 470 * u, rw, 'PERSONAL', 'Date of birth: {{DOB}}\nFather: {{FATHER}}\nGender: {{GENDER}}\nNationality: {{NATIONALITY}}\nMarital status: {{MARITAL}}', u, p, { bs: 12 }));
      o = o.concat(sec(rx, 660 * u, rw, 'LANGUAGES', '{{LANGUAGES|bullets}}', u, p));
      o = o.concat(sec(rx, 800 * u, rw, 'ADDRESS', '{{ADDRESS}}', u, p, { bs: 12 }));
      o.push(L(44 * u, 1000 * u, W - 44 * u, 1000 * u, p.c, 1.5 * u));
      o.push(T(44 * u, 1014 * u, 460 * u, '{{DECLARATION}}', 11 * u, { color: '#475569', lh: 1.4 }));
      o.push(P(W - 210 * u, 1010 * u, 160 * u, 48 * u, 'SIGN', { fill: '#f8fafc' }));
      o.push(T(W - 210 * u, 1062 * u, 160 * u, 'Signature', 11 * u, { align: 'center', color: '#475569' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'classic', name: 'Classic Bio-Data', cat: 'Fresher', build: function (W, H, p) {
      var u = W / 794, o = [R(28 * u, 28 * u, W - 56 * u, H - 56 * u, null, { stroke: p.a, sw: 2 * u })];
      o.push(T(0, 52 * u, W, 'RESUME', 30 * u, { font: 'Cinzel', bold: 700, color: p.a, align: 'center', ls: 300 }));
      o = o.concat(K.divider(W / 2, 104 * u, 300 * u, p.b));
      o.push(T(60 * u, 130 * u, 480 * u, '{{NAME}}', 24 * u, { font: 'Poppins', bold: 700, color: p.ink }));
      o.push(T(60 * u, 168 * u, 480 * u, 'Mobile: {{PHONE}}\nE-mail: {{EMAIL}}\nAddress: {{ADDRESS}}', 13 * u, { color: '#334155', lh: 1.55 }));
      o.push(P(W - 200 * u, 124 * u, 130 * u, 160 * u, 'PHOTO', { fill: p.soft, stroke: p.b, sw: 2 * u }));
      var x = 60 * u, w = W - 120 * u, y = 310 * u;
      function head(t, yy) { return [R(x, yy, w, 30 * u, p.c, { r: 4 * u }), T(x + 12 * u, yy + 5 * u, w - 24 * u, t, 14 * u, { bold: 700, color: p.a, font: 'Poppins' })]; }
      o = o.concat(head('CAREER OBJECTIVE', y), [T(x + 4 * u, y + 40 * u, w - 8 * u, '{{SUMMARY}}', 12.5 * u, { color: '#334155', lh: 1.5 })]);
      y = 430 * u; o = o.concat(head('EDUCATIONAL QUALIFICATION', y), [T(x + 4 * u, y + 40 * u, w - 8 * u, EDU, 12.5 * u, { color: '#334155', lh: 1.5 })]);
      y = 600 * u; o = o.concat(head('SKILLS & EXPERIENCE', y), [T(x + 4 * u, y + 40 * u, w / 2 - 10 * u, '{{SKILLS|bullets}}', 12.5 * u, { color: '#334155', lh: 1.5 }), T(x + w / 2, y + 40 * u, w / 2 - 4 * u, EXP, 12 * u, { color: '#334155', lh: 1.45 })]);
      y = 780 * u; o = o.concat(head('PERSONAL DETAILS', y));
      o = o.concat(K.rows(x + 6 * u, y + 44 * u, w - 12 * u, [['Father\'s name', '{{FATHER}}'], ['Date of birth', '{{DOB}}'], ['Gender', '{{GENDER}}'], ['Marital status', '{{MARITAL}}'], ['Languages', '{{LANGUAGES|comma}}'], ['Nationality', '{{NATIONALITY}}']], 12.5 * u, { kw: 0.32, gap: 1.6 }));
      o.push(T(x, 960 * u, w, 'DECLARATION: {{DECLARATION}}', 11.5 * u, { color: '#334155', lh: 1.45 }));
      o.push(T(x, 1020 * u, 300 * u, 'Place: {{PLACE}}\nDate: {{DATE}}', 12 * u, { lh: 1.5, color: '#334155' }));
      o.push(P(W - 240 * u, 1004 * u, 170 * u, 46 * u, 'SIGN', { fill: '#ffffff' }));
      o.push(T(W - 240 * u, 1054 * u, 170 * u, '({{NAME}})', 11 * u, { align: 'center', color: '#334155' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'diag', name: 'Creative Angle', cat: 'Creative', build: function (W, H, p) {
      var u = W / 794, o = [K.POLY([[0, 0], [W, 0], [W, 120 * u], [0, 250 * u]], K.G(20, p.a, p.b)), K.POLY([[0, 250 * u], [W, 120 * u], [W, 140 * u], [0, 270 * u]], p.acc)];
      o.push(P(56 * u, 60 * u, 150 * u, 150 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: '#ffffff', sw: 6 * u }));
      o.push(T(232 * u, 54 * u, 520 * u, '{{NAME}}', 34 * u, { font: 'Poppins', bold: 800, color: '#ffffff' }));
      o.push(T(232 * u, 100 * u, 520 * u, '{{JOB_TITLE|upper}}', 14 * u, { color: p.c, bold: 600, ls: 200 }));
      var x = 56 * u, w = 430 * u, rx = 530 * u, rw = W - rx - 44 * u;
      o = o.concat(sec(x, 300 * u, w, 'HELLO!', '{{SUMMARY}}', u, p, { hf: 'Poppins' }));
      o.push(L(x + 6 * u, 470 * u, x + 6 * u, 900 * u, p.d, 2 * u));
      o.push(C(x + 6 * u, 470 * u, 7 * u, p.b)); o.push(C(x + 6 * u, 690 * u, 7 * u, p.b));
      o = o.concat(sec(x + 26 * u, 456 * u, w - 26 * u, 'EXPERIENCE', EXP, u, p, { hf: 'Poppins' }));
      o = o.concat(sec(x + 26 * u, 676 * u, w - 26 * u, 'EDUCATION', EDU, u, p, { hf: 'Poppins' }));
      o.push(R(rx - 16 * u, 290 * u, rw + 32 * u, 640 * u, p.soft, { r: 16 * u }));
      o = o.concat(sec(rx, 310 * u, rw, 'CONTACT', '☎ {{PHONE}}\n✉ {{EMAIL}}\n⌂ {{ADDRESS}}', u, p, { hf: 'Poppins', bs: 11.5 }));
      o = o.concat(sec(rx, 500 * u, rw, 'SKILLS', '{{SKILLS|bullets}}', u, p, { hf: 'Poppins' }));
      o = o.concat(sec(rx, 720 * u, rw, 'LANGUAGES', '{{LANGUAGES|bullets}}', u, p, { hf: 'Poppins' }));
      o.push(K.wave(W, H, H - 70 * u, 20 * u, p.a, true));
      o.push(T(x, 960 * u, 460 * u, '{{DECLARATION}}', 11 * u, { color: '#475569', lh: 1.4 }));
      o.push(P(W - 220 * u, 950 * u, 170 * u, 46 * u, 'SIGN', { fill: '#ffffff' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'mini', name: 'Minimal Clean', cat: 'Professional', build: function (W, H, p) {
      var u = W / 794, x = 70 * u, w = W - 140 * u, o = [];
      o.push(T(x, 60 * u, w, '{{NAME|upper}}', 34 * u, { font: 'Playfair Display', bold: 700, color: p.ink, align: 'center', ls: 120 }));
      o.push(T(x, 112 * u, w, '{{JOB_TITLE}}', 15 * u, { color: p.b, align: 'center', ls: 200 }));
      o.push(T(x, 146 * u, w, '{{PHONE}}  ·  {{EMAIL}}  ·  {{ADDRESS}}', 11.5 * u, { color: '#475569', align: 'center' }));
      o.push(L(x, 186 * u, x + w, 186 * u, p.ink, 1.2 * u));
      function row(t, body, y, bs) { return [T(x, y, 150 * u, t, 12 * u, { bold: 700, color: p.b, ls: 150, font: 'Montserrat' }), T(x + 170 * u, y, w - 170 * u, body, (bs || 12.5) * u, { color: '#334155', lh: 1.5 })]; }
      o = o.concat(row('PROFILE', '{{SUMMARY}}', 214 * u));
      o.push(L(x, 340 * u, x + w, 340 * u, '#e2e8f0', 1 * u));
      o = o.concat(row('EXPERIENCE', EXP, 362 * u));
      o.push(L(x, 640 * u, x + w, 640 * u, '#e2e8f0', 1 * u));
      o = o.concat(row('EDUCATION', EDU, 662 * u));
      o.push(L(x, 840 * u, x + w, 840 * u, '#e2e8f0', 1 * u));
      o = o.concat(row('SKILLS', '{{SKILLS|comma}}', 862 * u));
      o.push(L(x, 930 * u, x + w, 930 * u, '#e2e8f0', 1 * u));
      o = o.concat(row('LANGUAGES', '{{LANGUAGES|comma}}', 952 * u));
      o.push(T(x, 1010 * u, 400 * u, '{{DECLARATION}}', 10.5 * u, { color: '#64748b', lh: 1.4 }));
      o.push(P(x + w - 160 * u, 1000 * u, 160 * u, 46 * u, 'SIGN', { fill: '#ffffff' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    { id: 'exec', name: 'Executive', cat: 'Experienced', build: function (W, H, p) {
      var u = W / 794, o = [R(0, 0, W, 16 * u, p.acc), R(0, 16 * u, W, 170 * u, p.a), R(0, H - 30 * u, W, 30 * u, p.a)];
      o.push(P(W - 190 * u, 40 * u, 130 * u, 130 * u, 'PHOTO', { r: 65 * u, shape: 'circle', fill: p.c, stroke: p.acc, sw: 4 * u }));
      o.push(T(50 * u, 50 * u, 520 * u, '{{NAME}}', 36 * u, { font: 'Oswald', bold: 700, color: '#ffffff', ls: 40 }));
      o.push(T(50 * u, 104 * u, 520 * u, '{{JOB_TITLE|upper}}', 15 * u, { color: p.acc, ls: 250, bold: 600 }));
      o.push(T(50 * u, 136 * u, 560 * u, '{{PHONE}}   |   {{EMAIL}}   |   {{WEBSITE}}', 11.5 * u, { color: '#e2e8f0' }));
      var lx = 50 * u, lw = 210 * u, rx = 300 * u, rw = W - rx - 50 * u;
      o.push(R(0, 186 * u, 280 * u, H - 216 * u, p.soft));
      o = o.concat(sec(lx, 220 * u, lw, 'SKILLS', '{{SKILLS|bullets}}', u, p, { hf: 'Oswald' }));
      o = o.concat(sec(lx, 470 * u, lw, 'LANGUAGES', '{{LANGUAGES|bullets}}', u, p, { hf: 'Oswald' }));
      o = o.concat(sec(lx, 610 * u, lw, 'PERSONAL', 'DOB: {{DOB}}\nFather: {{FATHER}}\n{{NATIONALITY}} · {{MARITAL}}', u, p, { hf: 'Oswald', bs: 11.5 }));
      o = o.concat(sec(lx, 760 * u, lw, 'ADDRESS', '{{ADDRESS}}', u, p, { hf: 'Oswald', bs: 11.5 }));
      o = o.concat(sec(rx, 220 * u, rw, 'SUMMARY', '{{SUMMARY}}', u, p, { hf: 'Oswald' }));
      o = o.concat(sec(rx, 360 * u, rw, 'PROFESSIONAL EXPERIENCE', EXP, u, p, { hf: 'Oswald' }));
      o = o.concat(sec(rx, 680 * u, rw, 'EDUCATION', EDU, u, p, { hf: 'Oswald' }));
      o = o.concat(sec(rx, 880 * u, rw, 'ACHIEVEMENTS', '{{HOBBIES|bullets}}', u, p, { hf: 'Oswald' }));
      o.push(P(W - 220 * u, 1020 * u, 160 * u, 46 * u, 'SIGN', { fill: '#ffffff' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } }
  ];
  ST.register(K.expand('cv', layouts, ['blue', 'teal', 'slate', 'rose']).map(function (t) { t.sizes = ['a4p']; return t; }));
})();
