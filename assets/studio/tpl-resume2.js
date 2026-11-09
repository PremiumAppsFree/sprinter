/* S Printer — more Resume / CV and job Bio-Data templates (original designs by S Printer).
 * Same {{FIELDS}} as the Pro Resume Maker form, so every layout fills in from "Your resume details". */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, C = K.C, P = K.P;
  var EXP = '{{EXPERIENCE}}', EDU = '{{EDUCATION}}', INK = '#334155';
  function head(x, y, w, t, u, p, o) {
    o = o || {};
    return [T(x, y, w, t, (o.s || 14.5) * u, { font: o.f || 'Montserrat', bold: 800, color: o.c || p.a, ls: o.ls == null ? 140 : o.ls })];
  }
  function body(x, y, w, t, u, o) { o = o || {}; return T(x, y, w, t, (o.s || 12.3) * u, { font: o.f || 'Poppins', color: o.c || INK, lh: o.lh || 1.48, align: o.align }); }
  function signBlock(x, y, w, u, o) {
    o = o || {};
    return [P(x, y, w, 46 * u, 'SIGN', { fill: o.fill || '#ffffff' }), L(x, y + 52 * u, x + w, y + 52 * u, o.line || '#94a3b8', 1 * u), T(x, y + 58 * u, w, o.label || 'Signature', 10.5 * u, { align: 'center', color: '#64748b', font: o.f || 'Poppins' })];
  }

  var layouts = [
    // 1 ── timeline: experience & education on a vertical line
    { id: 'tline', name: 'Timeline Pro', cat: 'Professional', build: function (W, H, p) {
      var u = W / 794, o = [R(0, 0, W, 210 * u, p.soft), R(0, 206 * u, W, 4 * u, p.b)];
      o.push(P(48 * u, 40 * u, 132 * u, 132 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: p.b, sw: 4 * u }));
      o.push(T(206 * u, 48 * u, 540 * u, '{{NAME}}', 34 * u, { font: 'Montserrat', bold: 800, color: p.a, lh: 1.05 }));
      o.push(T(206 * u, 96 * u, 540 * u, '{{JOB_TITLE|upper}}', 13.5 * u, { font: 'Poppins', bold: 600, color: p.b, ls: 220 }));
      o.push(T(206 * u, 128 * u, 540 * u, '☎ {{PHONE}}     ✉ {{EMAIL}}\n⌂ {{ADDRESS}}', 11.5 * u, { color: INK, lh: 1.6 }));
      var x = 48 * u, w = 470 * u, lx = x + 8 * u, rx = 556 * u, rw = W - rx - 44 * u;
      o = o.concat(head(x, 236 * u, w, 'PROFILE', u, p)); o.push(body(x, 262 * u, w, '{{SUMMARY}}', u));
      o.push(L(lx, 402 * u, lx, 1010 * u, p.d, 2 * u));
      [[392, 'EXPERIENCE', EXP], [720, 'EDUCATION', EDU]].forEach(function (s) {
        o.push(C(lx, (s[0] + 10) * u, 8 * u, p.b, { stroke: '#ffffff', sw: 3 * u }));
        o = o.concat(head(x + 30 * u, s[0] * u, w - 30 * u, s[1], u, p));
        o.push(body(x + 30 * u, (s[0] + 28) * u, w - 30 * u, s[2], u, { s: 12 }));
      });
      o.push(R(rx - 18 * u, 230 * u, rw + 36 * u, 790 * u, p.soft, { r: 14 * u }));
      o = o.concat(head(rx, 252 * u, rw, 'SKILLS', u, p)); o.push(body(rx, 280 * u, rw, '{{SKILLS|bullets}}', u, { s: 12 }));
      o = o.concat(head(rx, 500 * u, rw, 'LANGUAGES', u, p)); o.push(body(rx, 528 * u, rw, '{{LANGUAGES|bullets}}', u, { s: 12 }));
      o = o.concat(head(rx, 640 * u, rw, 'PERSONAL', u, p)); o.push(body(rx, 668 * u, rw, 'DOB: {{DOB}}\nFather: {{FATHER}}\nGender: {{GENDER}}\nNationality: {{NATIONALITY}}\nMarital: {{MARITAL}}', u, { s: 11.5 }));
      o = o.concat(head(rx, 830 * u, rw, 'INTERESTS', u, p)); o.push(body(rx, 858 * u, rw, '{{HOBBIES|bullets}}', u, { s: 11.5 }));
      o.push(T(x, 1040 * u, 470 * u, '{{DECLARATION}}', 10.5 * u, { color: '#64748b', lh: 1.4 }));
      o = o.concat(signBlock(W - 214 * u, 1028 * u, 170 * u, u));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    // 2 ── corporate: dark left column + light right
    { id: 'corp', name: 'Corporate Two-Column', cat: 'Experienced', build: function (W, H, p) {
      var u = W / 794, sw = 290 * u, o = [R(0, 0, sw, H, p.a), R(sw, 0, 6 * u, H, p.acc)];
      o.push(P(60 * u, 50 * u, 170 * u, 200 * u, 'PHOTO', { r: 12 * u, fill: p.c, stroke: '#ffffff', sw: 4 * u }));
      var lx = 34 * u, lw = sw - 64 * u;
      function lh(y, t) { return [T(lx, y, lw, t, 13 * u, { font: 'Montserrat', bold: 800, color: '#ffffff', ls: 180 }), R(lx, y + 22 * u, lw, 1.5 * u, 'rgba(255,255,255,0.35)')]; }
      o = o.concat(lh(286 * u, 'CONTACT')); o.push(body(lx, 318 * u, lw, '{{PHONE}}\n{{EMAIL}}\n{{WEBSITE}}\n{{ADDRESS}}', u, { s: 11.5, c: '#e2e8f0', lh: 1.65 }));
      o = o.concat(lh(486 * u, 'KEY SKILLS')); o.push(body(lx, 518 * u, lw, '{{SKILLS|bullets}}', u, { s: 11.8, c: '#e2e8f0', lh: 1.6 }));
      o = o.concat(lh(716 * u, 'LANGUAGES')); o.push(body(lx, 748 * u, lw, '{{LANGUAGES|bullets}}', u, { s: 11.8, c: '#e2e8f0' }));
      o = o.concat(lh(850 * u, 'PERSONAL')); o.push(body(lx, 882 * u, lw, 'DOB: {{DOB}}\nFather: {{FATHER}}\n{{GENDER}} · {{MARITAL}}\n{{NATIONALITY}}', u, { s: 11.3, c: '#e2e8f0', lh: 1.6 }));
      var x = sw + 44 * u, w = W - x - 44 * u;
      o.push(T(x, 54 * u, w, '{{NAME|upper}}', 32 * u, { font: 'Oswald', bold: 700, color: p.a, ls: 60, lh: 1.05 }));
      o.push(T(x, 104 * u, w, '{{JOB_TITLE}}', 16 * u, { font: 'Poppins', bold: 600, color: p.b }));
      o.push(R(x, 140 * u, 60 * u, 4 * u, p.acc));
      function sec(y, t, b, s) { return [T(x, y, w, t, 14.5 * u, { font: 'Oswald', bold: 700, color: p.a, ls: 100 }), L(x, y + 26 * u, x + w, y + 26 * u, p.c, 1.5 * u), body(x, y + 38 * u, w, b, u, { s: s || 12.2 })]; }
      o = o.concat(sec(172 * u, 'PROFESSIONAL SUMMARY', '{{SUMMARY}}'));
      o = o.concat(sec(330 * u, 'WORK EXPERIENCE', EXP));
      o = o.concat(sec(650 * u, 'EDUCATION', EDU));
      o = o.concat(sec(840 * u, 'ACHIEVEMENTS & INTERESTS', '{{HOBBIES|bullets}}', 11.8));
      o.push(T(x, 994 * u, 260 * u, 'Place: {{PLACE}}\nDate: {{DATE}}', 11.5 * u, { color: INK, lh: 1.5 }));
      o = o.concat(signBlock(W - 214 * u, 984 * u, 170 * u, u));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    // 3 ── classic Indian job bio-data in bordered tables
    { id: 'govt', name: 'Bio-Data (Job / Govt)', cat: 'Bio-Data', build: function (W, H, p) {
      var u = W / 794, m = 40 * u, o = [R(m, m, W - 2 * m, H - 2 * m, null, { stroke: p.a, sw: 2.5 * u }), R(m + 6 * u, m + 6 * u, W - 2 * m - 12 * u, H - 2 * m - 12 * u, null, { stroke: p.d, sw: 1 * u })];
      o.push(T(0, 70 * u, W, 'BIO-DATA', 30 * u, { font: 'Cinzel', bold: 700, align: 'center', color: p.a, ls: 400 }));
      o = o.concat(K.divider(W / 2, 118 * u, 260 * u, p.b));
      o.push(P(W - 216 * u, 150 * u, 136 * u, 166 * u, 'PHOTO', { fill: p.soft, stroke: p.a, sw: 1.5 * u }));
      var x = 76 * u, tw = W - 152 * u, rows = [['Name', '{{NAME}}'], ['Father\'s name', '{{FATHER}}'], ['Date of birth', '{{DOB}}'], ['Gender', '{{GENDER}}'], ['Marital status', '{{MARITAL}}'], ['Nationality', '{{NATIONALITY}}'], ['Languages known', '{{LANGUAGES|comma}}'], ['Mobile', '{{PHONE}}'], ['E-mail', '{{EMAIL}}']];
      var y = 150 * u, rh = 30 * u, kw = 170 * u, vw = tw - 160 * u - kw;
      rows.forEach(function (r, i) {
        var rw = i < 6 ? kw + vw : tw, yy = y + i * rh;
        o.push(R(x, yy, rw, rh, i % 2 ? '#ffffff' : p.soft, { stroke: p.d, sw: 1 * u }));
        o.push(L(x + kw, yy, x + kw, yy + rh, p.d, 1 * u));
        o.push(T(x + 10 * u, yy + 7 * u, kw - 16 * u, r[0], 12 * u, { bold: 600, color: p.a }));
        o.push(T(x + kw + 10 * u, yy + 7 * u, rw - kw - 16 * u, r[1], 12 * u, { color: '#0f172a' }));
      });
      y += rows.length * rh;
      o.push(R(x, y, tw, 64 * u, '#ffffff', { stroke: p.d, sw: 1 * u })); o.push(L(x + kw, y, x + kw, y + 64 * u, p.d, 1 * u));
      o.push(T(x + 10 * u, y + 8 * u, kw - 16 * u, 'Address', 12 * u, { bold: 600, color: p.a }));
      o.push(T(x + kw + 10 * u, y + 8 * u, tw - kw - 16 * u, '{{ADDRESS}}', 12 * u, { color: '#0f172a', lh: 1.4 }));
      function band(yy, t) { return [R(x, yy, tw, 28 * u, p.a), T(x + 12 * u, yy + 6 * u, tw - 24 * u, t, 12.5 * u, { bold: 700, color: '#ffffff', ls: 120, font: 'Montserrat' })]; }
      y += 84 * u; o = o.concat(band(y, 'CAREER OBJECTIVE')); o.push(body(x + 6 * u, y + 36 * u, tw - 12 * u, '{{SUMMARY}}', u, { s: 12 }));
      y += 130 * u; o = o.concat(band(y, 'EDUCATIONAL QUALIFICATION')); o.push(body(x + 6 * u, y + 36 * u, tw - 12 * u, EDU, u, { s: 12 }));
      y += 120 * u; o = o.concat(band(y, 'WORK EXPERIENCE')); o.push(body(x + 6 * u, y + 36 * u, tw - 12 * u, EXP, u, { s: 11.6, lh: 1.42 }));
      y += 170 * u; o = o.concat(band(y, 'SKILLS')); o.push(body(x + 6 * u, y + 36 * u, tw - 12 * u, '{{SKILLS|comma}}', u, { s: 12 }));
      o.push(T(x, 1000 * u, tw, 'DECLARATION: {{DECLARATION}}', 11 * u, { color: INK, lh: 1.4 }));
      o.push(T(x, 1036 * u, 260 * u, 'Place: {{PLACE}}    Date: {{DATE}}', 11.5 * u, { color: INK }));
      o.push(P(W - 250 * u, 1020 * u, 170 * u, 40 * u, 'SIGN', { fill: '#ffffff' }));
      o.push(T(W - 250 * u, 1062 * u, 170 * u, '({{NAME}})', 10.5 * u, { align: 'center', color: '#475569' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    // 4 ── Bengali job bio-data
    { id: 'bn', name: 'জীবনবৃত্তান্ত (বাংলা)', cat: 'Bio-Data', build: function (W, H, p) {
      var u = W / 794, F = 'Hind Siliguri', o = [R(0, 0, W, 14 * u, p.b), R(0, H - 14 * u, W, 14 * u, p.b), R(30 * u, 30 * u, W - 60 * u, H - 60 * u, null, { stroke: p.d, sw: 1.5 * u })];
      o.push(T(0, 56 * u, W, 'জীবনবৃত্তান্ত', 34 * u, { font: 'Galada', align: 'center', color: p.a }));
      o = o.concat(K.divider(W / 2, 112 * u, 240 * u, p.b));
      o.push(P(W - 210 * u, 140 * u, 130 * u, 160 * u, 'PHOTO', { fill: p.soft, stroke: p.b, sw: 2 * u }));
      o.push(T(70 * u, 146 * u, 470 * u, '{{NAME}}', 26 * u, { font: F, bold: 700, color: p.a }));
      o.push(T(70 * u, 190 * u, 470 * u, 'মোবাইল: {{PHONE}}\nই-মেইল: {{EMAIL}}\nঠিকানা: {{ADDRESS}}', 13 * u, { font: F, color: INK, lh: 1.6 }));
      var x = 70 * u, w = W - 140 * u;
      function sh(y, t) { return [R(x, y, w, 32 * u, p.soft, { r: 6 * u }), R(x, y, 6 * u, 32 * u, p.b, { r: 3 * u }), T(x + 16 * u, y + 4 * u, w - 30 * u, t, 15 * u, { font: F, bold: 700, color: p.a })]; }
      var y = 326 * u;
      o = o.concat(sh(y, 'উদ্দেশ্য')); o.push(body(x + 6 * u, y + 42 * u, w - 12 * u, '{{SUMMARY}}', u, { f: F, s: 12.5 }));
      y = 446 * u; o = o.concat(sh(y, 'শিক্ষাগত যোগ্যতা')); o.push(body(x + 6 * u, y + 42 * u, w - 12 * u, EDU, u, { f: F, s: 12.5 }));
      y = 576 * u; o = o.concat(sh(y, 'কাজের অভিজ্ঞতা')); o.push(body(x + 6 * u, y + 42 * u, w - 12 * u, EXP, u, { f: F, s: 12 }));
      y = 760 * u; o = o.concat(sh(y, 'ব্যক্তিগত তথ্য'));
      o = o.concat(K.rows(x + 10 * u, y + 46 * u, w / 2 + 120 * u, [['পিতার নাম', '{{FATHER}}'], ['জন্ম তারিখ', '{{DOB}}'], ['লিঙ্গ', '{{GENDER}}'], ['বৈবাহিক অবস্থা', '{{MARITAL}}'], ['জাতীয়তা', '{{NATIONALITY}}'], ['ভাষা', '{{LANGUAGES|comma}}']], 12.5 * u, { font: F, kw: 0.36, gap: 1.62, kc: p.a }));
      o.push(T(x + w - 210 * u, y + 46 * u, 210 * u, 'দক্ষতা\n{{SKILLS|bullets}}', 11.5 * u, { font: F, color: INK, lh: 1.5 }));
      o.push(T(x, 1000 * u, w, 'ঘোষণা: আমি এই মর্মে ঘোষণা করছি যে উপরের সমস্ত তথ্য আমার জ্ঞান ও বিশ্বাস মতে সত্য।', 11.5 * u, { font: F, color: INK, lh: 1.4 }));
      o.push(T(x, 1040 * u, 280 * u, 'স্থান: {{PLACE}}    তারিখ: {{DATE}}', 12 * u, { font: F, color: INK }));
      o.push(P(W - 250 * u, 1022 * u, 170 * u, 40 * u, 'SIGN', { fill: '#ffffff' }));
      o.push(T(W - 250 * u, 1064 * u, 170 * u, 'স্বাক্ষর', 11 * u, { font: F, align: 'center', color: '#475569' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    // 5 ── Hindi job bio-data
    { id: 'hi', name: 'बायोडाटा (हिन्दी)', cat: 'Bio-Data', build: function (W, H, p) {
      var u = W / 794, F = 'Hind', o = [R(0, 0, W, 170 * u, K.G(0, p.a, p.b)), R(0, 170 * u, W, 5 * u, p.acc)];
      o.push(T(50 * u, 40 * u, 520 * u, 'बायोडाटा', 18 * u, { font: 'Yatra One', color: p.c }));
      o.push(T(50 * u, 70 * u, 520 * u, '{{NAME}}', 32 * u, { font: F, bold: 700, color: '#ffffff' }));
      o.push(T(50 * u, 118 * u, 520 * u, '{{JOB_TITLE}}', 15 * u, { font: F, color: '#ffffff' }));
      o.push(P(W - 196 * u, 26 * u, 140 * u, 168 * u, 'PHOTO', { r: 8 * u, fill: p.c, stroke: '#ffffff', sw: 4 * u }));
      var x = 50 * u, w = W - 100 * u;
      function sh(y, t) { return [T(x, y, w, t, 16 * u, { font: F, bold: 700, color: p.a }), L(x, y + 28 * u, x + w, y + 28 * u, p.d, 1.5 * u)]; }
      var y = 220 * u;
      o = o.concat(sh(y, 'संपर्क')); o.push(body(x, y + 38 * u, w, 'मोबाइल: {{PHONE}}     ई-मेल: {{EMAIL}}\nपता: {{ADDRESS}}', u, { f: F, s: 12.5 }));
      y = 330 * u; o = o.concat(sh(y, 'उद्देश्य')); o.push(body(x, y + 38 * u, w, '{{SUMMARY}}', u, { f: F, s: 12.5 }));
      y = 450 * u; o = o.concat(sh(y, 'शैक्षणिक योग्यता')); o.push(body(x, y + 38 * u, w, EDU, u, { f: F, s: 12.5 }));
      y = 580 * u; o = o.concat(sh(y, 'कार्य अनुभव')); o.push(body(x, y + 38 * u, w, EXP, u, { f: F, s: 12 }));
      y = 770 * u; o = o.concat(sh(y, 'व्यक्तिगत विवरण'));
      o = o.concat(K.rows(x + 4 * u, y + 44 * u, 440 * u, [['पिता का नाम', '{{FATHER}}'], ['जन्म तिथि', '{{DOB}}'], ['लिंग', '{{GENDER}}'], ['वैवाहिक स्थिति', '{{MARITAL}}'], ['राष्ट्रीयता', '{{NATIONALITY}}'], ['भाषाएँ', '{{LANGUAGES|comma}}']], 12.5 * u, { font: F, kw: 0.4, gap: 1.62, kc: p.a }));
      o.push(R(x + 470 * u, y + 40 * u, w - 470 * u, 170 * u, p.soft, { r: 10 * u }));
      o.push(T(x + 486 * u, y + 52 * u, w - 500 * u, 'कौशल\n{{SKILLS|bullets}}', 11.5 * u, { font: F, color: INK, lh: 1.5 }));
      o.push(T(x, 1000 * u, w, 'घोषणा: मैं घोषणा करता/करती हूँ कि ऊपर दी गई सभी जानकारी मेरी जानकारी के अनुसार सत्य है।', 11.5 * u, { font: F, color: INK, lh: 1.4 }));
      o.push(T(x, 1040 * u, 300 * u, 'स्थान: {{PLACE}}    दिनांक: {{DATE}}', 12 * u, { font: F, color: INK }));
      o.push(P(W - 230 * u, 1022 * u, 170 * u, 40 * u, 'SIGN', { fill: '#ffffff' }));
      o.push(T(W - 230 * u, 1064 * u, 170 * u, 'हस्ताक्षर', 11 * u, { font: F, align: 'center', color: '#475569' }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    // 6 ── elegant serif
    { id: 'eleg', name: 'Elegant Serif', cat: 'Professional', build: function (W, H, p) {
      var u = W / 794, o = [R(0, 0, W, H, p.soft)], x = 70 * u, w = W - 140 * u;
      o.push(P(W / 2 - 66 * u, 40 * u, 132 * u, 132 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: p.d, sw: 3 * u }));
      o.push(T(x, 186 * u, w, '{{NAME}}', 36 * u, { font: 'Playfair Display', bold: 700, color: p.ink, align: 'center' }));
      o.push(T(x, 236 * u, w, '{{JOB_TITLE|upper}}', 12.5 * u, { font: 'Montserrat', bold: 600, color: p.b, align: 'center', ls: 400 }));
      o = o.concat(K.divider(W / 2, 270 * u, 220 * u, p.d));
      o.push(T(x, 288 * u, w, '{{PHONE}}   ·   {{EMAIL}}   ·   {{WEBSITE}}', 11.3 * u, { color: '#475569', align: 'center' }));
      function sec(y, t, b, ww, xx, s) { xx = xx == null ? x : xx; ww = ww || w; return [T(xx, y, ww, t, 17 * u, { font: 'Playfair Display', bold: 700, color: p.a }), R(xx, y + 30 * u, 36 * u, 2 * u, p.d), body(xx, y + 42 * u, ww, b, u, { s: s || 12.2, f: 'Lora' })]; }
      o = o.concat(sec(334 * u, 'Profile', '{{SUMMARY}}'));
      var cw = (w - 40 * u) / 2;
      o = o.concat(sec(470 * u, 'Experience', EXP, cw, x, 11.6));
      o = o.concat(sec(470 * u, 'Education', EDU, cw, x + cw + 40 * u, 11.6));
      o = o.concat(sec(760 * u, 'Skills', '{{SKILLS|bullets}}', cw, x, 11.6));
      o = o.concat(sec(760 * u, 'Languages & Interests', '{{LANGUAGES|comma}}\n\n{{HOBBIES|bullets}}', cw, x + cw + 40 * u, 11.6));
      o.push(L(x, 980 * u, x + w, 980 * u, p.d, 1 * u));
      o.push(T(x, 996 * u, 420 * u, '{{DECLARATION}}\nPlace: {{PLACE}}   Date: {{DATE}}', 10.5 * u, { color: '#64748b', lh: 1.45, font: 'Lora' }));
      o = o.concat(signBlock(W - 240 * u, 990 * u, 170 * u, u, { fill: p.soft }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    // 7 ── tech / developer
    { id: 'tech', name: 'Tech Developer', cat: 'Creative', build: function (W, H, p) {
      var u = W / 794, o = [R(0, 0, W, H, '#0f172a'), R(0, 0, W, 200 * u, '#111c33')], M = 'Roboto Mono';
      o.push(T(50 * u, 40 * u, 520 * u, '<hello world />', 13 * u, { font: M, color: p.d }));
      o.push(T(50 * u, 66 * u, 540 * u, '{{NAME}}', 34 * u, { font: 'Poppins', bold: 800, color: '#ffffff' }));
      o.push(T(50 * u, 114 * u, 540 * u, '> {{JOB_TITLE}}', 15 * u, { font: M, color: p.acc }));
      o.push(T(50 * u, 146 * u, 560 * u, '{{EMAIL}}  |  {{PHONE}}  |  {{WEBSITE}}', 11 * u, { font: M, color: '#94a3b8' }));
      o.push(P(W - 186 * u, 36 * u, 134 * u, 134 * u, 'PHOTO', { r: 18 * u, fill: '#1e293b', stroke: p.d, sw: 3 * u }));
      var x = 50 * u, w = 440 * u, rx = 530 * u, rw = W - rx - 44 * u;
      function sec(xx, y, ww, t, b, s) { return [T(xx, y, ww, '// ' + t, 13.5 * u, { font: M, bold: 700, color: p.d }), body(xx, y + 28 * u, ww, b, u, { s: s || 12, c: '#cbd5e1' })]; }
      o = o.concat(sec(x, 236 * u, w, 'about', '{{SUMMARY}}'));
      o = o.concat(sec(x, 380 * u, w, 'experience', EXP, 11.6));
      o = o.concat(sec(x, 690 * u, w, 'education', EDU, 11.6));
      o.push(R(rx - 16 * u, 226 * u, rw + 30 * u, 760 * u, '#16213b', { r: 14 * u, stroke: '#1e3a5f', sw: 1 * u }));
      o = o.concat(sec(rx, 246 * u, rw, 'skills', '{{SKILLS|bullets}}', 11.6));
      o = o.concat(sec(rx, 520 * u, rw, 'languages', '{{LANGUAGES|bullets}}', 11.6));
      o = o.concat(sec(rx, 650 * u, rw, 'interests', '{{HOBBIES|bullets}}', 11.3));
      o = o.concat(sec(rx, 820 * u, rw, 'location', '{{ADDRESS}}', 11));
      o.push(T(x, 1020 * u, 460 * u, '{{DECLARATION}}', 10 * u, { color: '#64748b', lh: 1.4 }));
      o.push(P(W - 230 * u, 1010 * u, 170 * u, 44 * u, 'SIGN', { fill: '#0f172a' }));
      return { pages: [{ bg: '#0f172a', objects: o }] };
    } },
    // 8 ── fresher one-page cards
    { id: 'fresh', name: 'Fresher Cards', cat: 'Fresher', build: function (W, H, p) {
      var u = W / 794, o = [R(0, 0, W, H, p.soft), R(30 * u, 30 * u, W - 60 * u, 190 * u, K.G(0, p.a, p.b), { r: 22 * u })];
      o.push(P(58 * u, 56 * u, 138 * u, 138 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: '#ffffff', sw: 5 * u }));
      o.push(T(222 * u, 66 * u, 520 * u, '{{NAME}}', 32 * u, { font: 'Poppins', bold: 800, color: '#ffffff' }));
      o.push(T(222 * u, 112 * u, 520 * u, '{{JOB_TITLE}}', 15 * u, { color: p.c, bold: 600 }));
      o.push(T(222 * u, 144 * u, 520 * u, '☎ {{PHONE}}   ✉ {{EMAIL}}', 12 * u, { color: '#ffffff' }));
      function card(x, y, w, h, t, b, s) { return [R(x, y, w, h, '#ffffff', { r: 16 * u, shadow: { c: 'rgba(15,23,42,0.10)', b: 16 * u, y: 6 * u } }), T(x + 20 * u, y + 16 * u, w - 40 * u, t, 14 * u, { font: 'Poppins', bold: 800, color: p.a }), R(x + 20 * u, y + 40 * u, 32 * u, 3 * u, p.acc, { r: 2 }), body(x + 20 * u, y + 52 * u, w - 40 * u, b, u, { s: s || 12 })]; }
      var x1 = 30 * u, cw = (W - 60 * u - 20 * u) / 2, x2 = x1 + cw + 20 * u;
      o = o.concat(card(x1, 240 * u, W - 60 * u, 136 * u, 'CAREER OBJECTIVE', '{{SUMMARY}}'));
      o = o.concat(card(x1, 392 * u, cw, 250 * u, 'EDUCATION', EDU, 11.6));
      o = o.concat(card(x2, 392 * u, cw, 250 * u, 'SKILLS', '{{SKILLS|bullets}}', 11.6));
      o = o.concat(card(x1, 658 * u, cw, 210 * u, 'TRAINING / EXPERIENCE', EXP, 11.2));
      o = o.concat(card(x2, 658 * u, cw, 210 * u, 'PERSONAL DETAILS', 'Father: {{FATHER}}\nDOB: {{DOB}}\nGender: {{GENDER}}\nLanguages: {{LANGUAGES|comma}}\nAddress: {{ADDRESS}}', 11.2));
      o = o.concat(card(x1, 884 * u, W - 60 * u, 200 * u, 'DECLARATION', '{{DECLARATION}}\n\nPlace: {{PLACE}}        Date: {{DATE}}', 11.5));
      o.push(P(W - 250 * u, 1000 * u, 170 * u, 44 * u, 'SIGN', { fill: '#ffffff' }));
      o.push(T(W - 250 * u, 1048 * u, 170 * u, 'Signature', 10.5 * u, { align: 'center', color: '#64748b' }));
      return { pages: [{ bg: p.soft, objects: o }] };
    } },
    // 9 ── soft pastel (feminine)
    { id: 'blush', name: 'Soft Blush', cat: 'Creative', build: function (W, H, p) {
      var u = W / 794, o = [R(0, 0, W, H, '#fffaf9')];
      o.push(C(W - 40 * u, 40 * u, 170 * u, p.c, { op: 0.7 })); o.push(C(40 * u, H - 30 * u, 140 * u, p.c, { op: 0.55 }));
      o.push(C(W - 120 * u, 150 * u, 60 * u, p.d, { op: 0.35 }));
      o.push(P(60 * u, 60 * u, 170 * u, 170 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: '#ffffff', sw: 7 * u }));
      o.push(T(260 * u, 74 * u, 470 * u, '{{NAME}}', 40 * u, { font: 'Great Vibes', color: p.a, lh: 1.05 }));
      o.push(T(262 * u, 136 * u, 460 * u, '{{JOB_TITLE|upper}}', 13 * u, { font: 'Montserrat', bold: 600, color: p.b, ls: 260 }));
      o.push(T(262 * u, 170 * u, 460 * u, '{{PHONE}}  ·  {{EMAIL}}\n{{ADDRESS}}', 11.5 * u, { color: '#57534e', lh: 1.55 }));
      function pill(x, y, w, t) { return [R(x, y, w, 30 * u, p.c, { r: 15 * u }), T(x, y + 6 * u, w, t, 12.5 * u, { font: 'Montserrat', bold: 700, color: p.a, align: 'center', ls: 180 })]; }
      var x = 60 * u, w = 430 * u, rx = 530 * u, rw = W - rx - 50 * u;
      o = o.concat(pill(x, 270 * u, 160 * u, 'ABOUT ME')); o.push(body(x, 312 * u, W - 120 * u, '{{SUMMARY}}', u, { c: '#44403c' }));
      o = o.concat(pill(x, 420 * u, 180 * u, 'EXPERIENCE')); o.push(body(x, 462 * u, w, EXP, u, { s: 11.8, c: '#44403c' }));
      o = o.concat(pill(x, 720 * u, 180 * u, 'EDUCATION')); o.push(body(x, 762 * u, w, EDU, u, { s: 11.8, c: '#44403c' }));
      o.push(R(rx - 16 * u, 410 * u, rw + 32 * u, 560 * u, '#ffffff', { r: 20 * u, stroke: p.c, sw: 2 * u }));
      o = o.concat(pill(rx, 430 * u, rw, 'SKILLS')); o.push(body(rx + 6 * u, 472 * u, rw - 12 * u, '{{SKILLS|bullets}}', u, { s: 11.6, c: '#44403c' }));
      o = o.concat(pill(rx, 660 * u, rw, 'LANGUAGES')); o.push(body(rx + 6 * u, 702 * u, rw - 12 * u, '{{LANGUAGES|bullets}}', u, { s: 11.6, c: '#44403c' }));
      o = o.concat(pill(rx, 800 * u, rw, 'HOBBIES')); o.push(body(rx + 6 * u, 842 * u, rw - 12 * u, '{{HOBBIES|bullets}}', u, { s: 11.3, c: '#44403c' }));
      o.push(T(x, 1000 * u, 420 * u, '{{DECLARATION}}', 10.5 * u, { color: '#78716c', lh: 1.4 }));
      o = o.concat(signBlock(W - 230 * u, 996 * u, 170 * u, u, { fill: '#fffaf9', line: p.d }));
      return { pages: [{ bg: '#fffaf9', objects: o }] };
    } },
    // 10 ── teacher / academic
    { id: 'acad', name: 'Teacher / Academic', cat: 'Professional', build: function (W, H, p) {
      var u = W / 794, o = [R(0, 0, 22 * u, H, p.b), R(22 * u, 0, 6 * u, H, p.acc)];
      var x = 70 * u, w = W - 120 * u;
      o.push(T(x, 50 * u, 520 * u, '{{NAME}}', 34 * u, { font: 'Merriweather', bold: 700, color: p.a }));
      o.push(T(x, 100 * u, 520 * u, '{{JOB_TITLE}}', 15 * u, { font: 'Merriweather', color: p.b }));
      o.push(T(x, 134 * u, 540 * u, '{{PHONE}}  |  {{EMAIL}}\n{{ADDRESS}}', 11.5 * u, { color: '#475569', lh: 1.55 }));
      o.push(P(W - 180 * u, 40 * u, 130 * u, 156 * u, 'PHOTO', { fill: p.soft, stroke: p.b, sw: 2 * u }));
      o.push(L(x, 214 * u, x + w, 214 * u, p.a, 2 * u));
      function sec(y, t, b, s) { return [R(x, y + 3 * u, 10 * u, 10 * u, p.acc, { r: 2 }), T(x + 20 * u, y - 2 * u, w - 20 * u, t, 15 * u, { font: 'Merriweather', bold: 700, color: p.a }), body(x + 20 * u, y + 28 * u, w - 20 * u, b, u, { s: s || 12.2 })]; }
      o = o.concat(sec(240 * u, 'Teaching Philosophy / Objective', '{{SUMMARY}}'));
      o = o.concat(sec(372 * u, 'Academic Qualifications', EDU));
      o = o.concat(sec(510 * u, 'Teaching Experience', EXP, 11.8));
      o = o.concat(sec(720 * u, 'Subjects & Skills', '{{SKILLS|comma}}'));
      o = o.concat(sec(800 * u, 'Achievements & Activities', '{{HOBBIES|bullets}}', 11.8));
      o = o.concat(K.rows(x + 20 * u, 920 * u, 440 * u, [['Date of birth', '{{DOB}}'], ['Father\'s name', '{{FATHER}}'], ['Languages', '{{LANGUAGES|comma}}']], 11.5 * u, { kw: 0.34, gap: 1.6, kc: p.a }));
      o.push(T(x + 20 * u, 1010 * u, 420 * u, '{{DECLARATION}}', 10.5 * u, { color: '#64748b', lh: 1.4 }));
      o = o.concat(signBlock(W - 230 * u, 990 * u, 170 * u, u));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    // 11 ── ATS simple (no photo, plain)
    { id: 'ats', name: 'ATS Simple (no photo)', cat: 'Professional', build: function (W, H, p) {
      var u = W / 794, x = 64 * u, w = W - 128 * u, o = [];
      o.push(T(x, 54 * u, w, '{{NAME}}', 30 * u, { font: 'Roboto', bold: 700, color: '#111827' }));
      o.push(T(x, 96 * u, w, '{{JOB_TITLE}}', 14 * u, { font: 'Roboto', color: p.b, bold: 600 }));
      o.push(T(x, 122 * u, w, '{{PHONE}}  |  {{EMAIL}}  |  {{WEBSITE}}  |  {{ADDRESS}}', 11 * u, { font: 'Roboto', color: '#374151' }));
      function sec(y, t, b, s) { return [T(x, y, w, t, 13 * u, { font: 'Roboto', bold: 700, color: '#111827', ls: 120 }), L(x, y + 22 * u, x + w, y + 22 * u, '#111827', 1.2 * u), body(x, y + 32 * u, w, b, u, { f: 'Roboto', s: s || 12, c: '#1f2937' })]; }
      o = o.concat(sec(166 * u, 'SUMMARY', '{{SUMMARY}}'));
      o = o.concat(sec(290 * u, 'EXPERIENCE', EXP, 11.8));
      o = o.concat(sec(560 * u, 'EDUCATION', EDU));
      o = o.concat(sec(720 * u, 'SKILLS', '{{SKILLS|comma}}'));
      o = o.concat(sec(810 * u, 'LANGUAGES', '{{LANGUAGES|comma}}'));
      o = o.concat(sec(880 * u, 'ACHIEVEMENTS', '{{HOBBIES|bullets}}', 11.5));
      o.push(T(x, 1030 * u, w, '{{DECLARATION}}', 10.5 * u, { font: 'Roboto', color: '#4b5563', lh: 1.4 }));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } },
    // 12 ── modern geometric header
    { id: 'geo', name: 'Modern Geometric', cat: 'Creative', build: function (W, H, p) {
      var u = W / 794, o = [K.POLY([[0, 0], [W * 0.62, 0], [W * 0.48, 240 * u], [0, 240 * u]], p.a), K.POLY([[W * 0.62, 0], [W, 0], [W, 240 * u], [W * 0.48, 240 * u]], p.b), K.POLY([[W * 0.6, 0], [W * 0.64, 0], [W * 0.5, 240 * u], [W * 0.46, 240 * u]], p.acc)];
      o.push(T(48 * u, 60 * u, 400 * u, '{{NAME}}', 34 * u, { font: 'Raleway', bold: 800, color: '#ffffff', lh: 1.05 }));
      o.push(T(48 * u, 140 * u, 380 * u, '{{JOB_TITLE|upper}}', 13 * u, { font: 'Raleway', bold: 700, color: p.c, ls: 220 }));
      o.push(P(W - 218 * u, 40 * u, 160 * u, 160 * u, 'PHOTO', { shape: 'circle', fill: p.c, stroke: '#ffffff', sw: 6 * u }));
      var x = 48 * u, w = 440 * u, rx = 530 * u, rw = W - rx - 44 * u;
      function sec(xx, y, ww, t, b, s) { return [T(xx, y, ww, t, 14 * u, { font: 'Raleway', bold: 800, color: p.a, ls: 140 }), R(xx, y + 24 * u, ww, 1.5 * u, p.c), R(xx, y + 23 * u, 40 * u, 3.5 * u, p.b), body(xx, y + 36 * u, ww, b, u, { s: s || 12 })]; }
      o = o.concat(sec(x, 270 * u, w, 'PROFILE', '{{SUMMARY}}'));
      o = o.concat(sec(x, 410 * u, w, 'EXPERIENCE', EXP, 11.6));
      o = o.concat(sec(x, 720 * u, w, 'EDUCATION', EDU, 11.6));
      o = o.concat(sec(rx, 270 * u, rw, 'CONTACT', '☎ {{PHONE}}\n✉ {{EMAIL}}\n◉ {{WEBSITE}}\n⌂ {{ADDRESS}}', 11.2));
      o = o.concat(sec(rx, 470 * u, rw, 'SKILLS', '{{SKILLS|bullets}}', 11.6));
      o = o.concat(sec(rx, 700 * u, rw, 'LANGUAGES', '{{LANGUAGES|bullets}}', 11.6));
      o = o.concat(sec(rx, 830 * u, rw, 'PERSONAL', 'DOB: {{DOB}}\n{{GENDER}} · {{MARITAL}}', 11.2));
      o.push(R(0, H - 22 * u, W, 22 * u, p.a));
      o.push(T(x, 990 * u, 440 * u, '{{DECLARATION}}', 10.5 * u, { color: '#64748b', lh: 1.4 }));
      o = o.concat(signBlock(W - 230 * u, 980 * u, 170 * u, u));
      return { pages: [{ bg: '#ffffff', objects: o }] };
    } }
  ];
  var PALS = { tline: ['blue', 'teal', 'purple'], corp: ['navy', 'slate', 'green'], govt: ['blue', 'maroon', 'slate'], bn: ['teal', 'maroon', 'blue'], hi: ['orange', 'blue', 'maroon'], eleg: ['gold', 'slate', 'rose'], tech: ['blue', 'green', 'purple'], fresh: ['blue', 'purple', 'teal', 'rose'], blush: ['rose', 'purple', 'teal'], acad: ['green', 'blue', 'maroon'], ats: ['blue', 'slate'], geo: ['teal', 'purple', 'orange'] };
  layouts.forEach(function (l) { l.pals = PALS[l.id]; l.sizes = ['a4p']; });
  ST.register(K.expand('cv2', layouts));
})();
