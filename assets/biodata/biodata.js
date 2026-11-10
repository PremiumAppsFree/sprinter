/* S Printer — CV & Bio-Data Maker. Original design and code by S Printer.
 * Fill a simple form once; pick a look; download PDF / JPG or print. Everything stays on this device. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function lines(s) { return String(s || '').split(/\n|,(?![^(]*\))/).map(function (x) { return x.trim(); }).filter(Boolean); }

  // ---------- words in three languages ----------
  var W = {
    cv: { en: 'Resume', bn: 'জীবনবৃত্তান্ত', hi: 'रिज़्यूमे' }, job: { en: 'Bio-Data', bn: 'বায়োডাটা', hi: 'बायोडाटा' }, marriage: { en: 'Marriage Bio-Data', bn: 'বিবাহের বায়োডাটা', hi: 'विवाह बायोडाटा' },
    personal: { en: 'Personal Details', bn: 'ব্যক্তিগত তথ্য', hi: 'व्यक्तिगत विवरण' }, contact: { en: 'Contact', bn: 'যোগাযোগ', hi: 'संपर्क' },
    summary: { en: 'Profile', bn: 'পরিচিতি', hi: 'परिचय' }, objective: { en: 'Career Objective', bn: 'উদ্দেশ্য', hi: 'उद्देश्य' }, about: { en: 'About', bn: 'নিজের সম্পর্কে', hi: 'मेरे बारे में' },
    education: { en: 'Education', bn: 'শিক্ষাগত যোগ্যতা', hi: 'शैक्षणिक योग्यता' }, experience: { en: 'Work Experience', bn: 'কাজের অভিজ্ঞতা', hi: 'कार्य अनुभव' },
    skills: { en: 'Skills', bn: 'দক্ষতা', hi: 'कौशल' }, languages: { en: 'Languages', bn: 'ভাষা', hi: 'भाषाएँ' }, hobbies: { en: 'Hobbies & Achievements', bn: 'শখ ও অর্জন', hi: 'शौक और उपलब्धियाँ' },
    family: { en: 'Family Details', bn: 'পারিবারিক তথ্য', hi: 'पारिवारिक विवरण' }, expect: { en: 'Partner Expectations', bn: 'পাত্র/পাত্রীর প্রত্যাশা', hi: 'जीवनसाथी से अपेक्षा' },
    declaration: { en: 'Declaration', bn: 'ঘোষণা', hi: 'घोषणा' }, place: { en: 'Place', bn: 'স্থান', hi: 'स्थान' }, date: { en: 'Date', bn: 'তারিখ', hi: 'दिनांक' }, signature: { en: 'Signature', bn: 'স্বাক্ষর', hi: 'हस्ताक्षर' },
    exam: { en: 'Exam / Degree', bn: 'পরীক্ষা / ডিগ্রি', hi: 'परीक्षा / डिग्री' }, board: { en: 'Board / University', bn: 'বোর্ড / বিশ্ববিদ্যালয়', hi: 'बोर्ड / विश्वविद्यालय' }, year: { en: 'Year', bn: 'সাল', hi: 'वर्ष' }, marks: { en: 'Marks / Grade', bn: 'নম্বর / গ্রেড', hi: 'अंक / ग्रेड' },
    relation: { en: 'Relation', bn: 'সম্পর্ক', hi: 'संबंध' }, fname: { en: 'Name', bn: 'নাম', hi: 'नाम' }, focc: { en: 'Occupation', bn: 'পেশা', hi: 'व्यवसाय' }
  };
  // fields: k, labels, type, which documents use it, group
  var F = [
    ['name', 'Full name', 'পুরো নাম', 'पूरा नाम', 't', 'cjm', 'top'],
    ['title', 'Job title / post applied for', 'পদ / পেশা', 'पद / व्यवसाय', 't', 'cj', 'top'],
    ['phone', 'Mobile', 'মোবাইল', 'मोबाइल', 't', 'cjm', 'contact'],
    ['email', 'E-mail', 'ই-মেইল', 'ई-मेल', 't', 'cjm', 'contact'],
    ['website', 'LinkedIn / website', 'লিংকডইন / ওয়েবসাইট', 'लिंक्डइन / वेबसाइट', 't', 'c', 'contact'],
    ['address', 'Address', 'ঠিকানা', 'पता', 'a', 'cjm', 'contact'],
    ['father', "Father's name", 'পিতার নাম', 'पिता का नाम', 't', 'cjm', 'personal'],
    ['mother', "Mother's name", 'মাতার নাম', 'माता का नाम', 't', 'jm', 'personal'],
    ['dob', 'Date of birth', 'জন্ম তারিখ', 'जन्म तिथि', 't', 'cjm', 'personal'],
    ['btime', 'Time of birth', 'জন্মের সময়', 'जन्म समय', 't', 'm', 'personal'],
    ['bplace', 'Place of birth', 'জন্মস্থান', 'जन्म स्थान', 't', 'm', 'personal'],
    ['gender', 'Gender', 'লিঙ্গ', 'लिंग', 't', 'cj', 'personal'],
    ['marital', 'Marital status', 'বৈবাহিক অবস্থা', 'वैवाहिक स्थिति', 't', 'cjm', 'personal'],
    ['height', 'Height', 'উচ্চতা', 'ऊंचाई', 't', 'm', 'personal'],
    ['complexion', 'Complexion', 'গায়ের রং', 'रंग', 't', 'm', 'personal'],
    ['religion', 'Religion', 'ধর্ম', 'धर्म', 't', 'jm', 'personal'],
    ['caste', 'Caste / Gotra (optional)', 'জাতি / গোত্র (ইচ্ছামতো)', 'जाति / गोत्र (वैकल्पिक)', 't', 'jm', 'personal'],
    ['nationality', 'Nationality', 'জাতীয়তা', 'राष्ट्रीयता', 't', 'cj', 'personal'],
    ['qual', 'Highest education', 'সর্বোচ্চ শিক্ষা', 'उच्चतम शिक्षा', 't', 'm', 'personal'],
    ['job', 'Occupation / job', 'পেশা / চাকরি', 'व्यवसाय / नौकरी', 't', 'm', 'personal'],
    ['income', 'Income (optional)', 'আয় (ইচ্ছামতো)', 'आय (वैकल्पिक)', 't', 'm', 'personal'],
    ['langs', 'Languages known', 'জানা ভাষা', 'ज्ञात भाषाएँ', 't', 'cjm', 'personal'],
    ['summary', 'Profile / objective (2–3 lines)', 'নিজের সম্পর্কে / উদ্দেশ্য', 'परिचय / उद्देश्य', 'a', 'cjm', 'text'],
    ['skills', 'Skills (one per line)', 'দক্ষতা (প্রতি লাইনে একটি)', 'कौशल (हर पंक्ति में एक)', 'a', 'cj', 'text'],
    ['hobbies', 'Hobbies / achievements', 'শখ / অর্জন', 'शौक / उपलब्धियाँ', 'a', 'cjm', 'text'],
    ['expect', 'Partner expectations', 'পাত্র/পাত্রীর প্রত্যাশা', 'जीवनसाथी से अपेक्षा', 'a', 'm', 'text'],
    ['declaration', 'Declaration', 'ঘোষণা', 'घोषणा', 'a', 'cj', 'end'],
    ['place', 'Place', 'স্থান', 'स्थान', 't', 'cj', 'end'],
    ['date', 'Date', 'তারিখ', 'दिनांक', 't', 'cj', 'end']
  ].map(function (a) { return { k: a[0], l: { en: a[1], bn: a[2], hi: a[3] }, t: a[4], on: a[5], g: a[6] }; });
  var TY = { cv: 'c', job: 'j', marriage: 'm' };
  var DECL = { en: 'I hereby declare that the information given above is true to the best of my knowledge and belief.', bn: 'আমি এই মর্মে ঘোষণা করছি যে উপরের সমস্ত তথ্য আমার জ্ঞান ও বিশ্বাস মতে সত্য।', hi: 'मैं घोषणा करता/करती हूँ कि ऊपर दी गई सभी जानकारी मेरी जानकारी के अनुसार सत्य है।' };

  var SAMPLE = {
    cv: { name: 'Riya Sen', title: 'Graphic Designer', phone: '+91 98300 12345', email: 'riya.sen@email.com', website: 'behance.net/riyasen', address: '22, Lake Road, Kolkata 700029', father: 'Amit Sen', dob: '12/04/1999', gender: 'Female', marital: 'Unmarried', nationality: 'Indian', langs: 'Bengali, English, Hindi',
      summary: 'Creative designer with 3 years of experience in branding, social media posts and print layouts. I love clean design and meeting deadlines.',
      skills: 'Adobe Photoshop\nIllustrator\nCanva-style social posts\nPrint layout & pre-press\nMS Office', hobbies: 'Painting\nPhotography\nBest Design award 2024',
      edu: [['B.Des (Communication Design)', 'University of Calcutta', '2021', '7.8 CGPA'], ['12th (Arts)', 'WBCHSE', '2018', '82%'], ['10th', 'WBBSE', '2016', '86%']],
      exp: [['Graphic Designer', 'Pixel Studio, Kolkata', '2022 – Present', 'Brand kits, social media creatives and print ads for 20+ clients.'], ['Design Intern', 'Ad House', '2021 – 2022', 'Posters, flyers and packaging mock-ups.']] },
    job: { name: 'Rahul Kumar', title: 'Office Assistant', phone: '+91 91234 56789', email: 'rahul.k@email.com', address: 'Vill. Rampur, P.O. Bishnupur, Dist. Bankura, West Bengal 722122', father: 'Suresh Kumar', mother: 'Sunita Devi', dob: '05/01/2000', gender: 'Male', marital: 'Unmarried', religion: 'Hindu', nationality: 'Indian', langs: 'Bengali, Hindi, English',
      summary: 'To work sincerely in a reputed organisation and grow with my skills in computer work and office management.', skills: 'MS Word, Excel\nTally Prime\nTyping (Bengali & English)\nInternet & e-mail',
      hobbies: 'Reading\nCricket', edu: [['B.A.', 'Bankura University', '2021', '61%'], ['12th', 'WBCHSE', '2018', '68%'], ['10th', 'WBBSE', '2016', '72%']], exp: [['Computer Operator', 'Sharma Traders', '2022 – Present', 'Billing, data entry and customer records.']] },
    marriage: { name: 'Priya Das', phone: '+91 90000 11111', email: 'dasfamily@email.com', address: '14/2, Station Road, Burdwan 713101', father: 'Mr. Subrata Das (Retd. Bank Officer)', mother: 'Mrs. Mita Das (Homemaker)', dob: '18/07/1998', btime: '6:40 AM', bplace: 'Burdwan', marital: 'Unmarried', height: "5' 3\"", complexion: 'Fair', religion: 'Hindu', caste: 'Kayastha', qual: 'M.Sc. (Chemistry)', job: 'School Teacher (Govt.)', income: '', langs: 'Bengali, English, Hindi',
      summary: 'Simple, family-oriented and cheerful. I enjoy teaching, music and cooking.', hobbies: 'Rabindra Sangeet\nCooking\nTravelling', expect: 'Well-educated, kind and settled groom from a good family.',
      family: [['Father', 'Subrata Das', 'Retired Bank Officer'], ['Mother', 'Mita Das', 'Homemaker'], ['Brother', 'Arnab Das', 'Software Engineer, Pune']] }
  };

  var TPL = [['classic', 'Classic'], ['sidebar', 'Modern sidebar'], ['elegant', 'Elegant'], ['bold', 'Bold header'], ['floral', 'Floral'], ['minimal', 'Minimal (no photo)']];
  var COLORS = ['#1e3a8a', '#0f766e', '#7c3aed', '#be185d', '#b91c1c', '#c2410c', '#15803d', '#334155', '#a16207', '#0e7490'];
  var FONTS = { en: ['Poppins', 'Playfair Display', 'Lora', 'Montserrat'], bn: ['Hind Siliguri', 'Noto Serif Bengali', 'Baloo Da 2'], hi: ['Hind', 'Martel', 'Mukta'] };

  var KEY = 'sp-biodata-v1', S;
  function blank(type) { return { type: type || 'cv', lang: 'en', tpl: type === 'marriage' ? 'floral' : type === 'job' ? 'classic' : 'sidebar', color: type === 'marriage' ? '#be185d' : '#1e3a8a', font: '', photo: '', sign: '', f: { declaration: DECL.en }, edu: [['', '', '', '']], exp: [['', '', '', '']], family: [['', '', '']], extra: [] }; }
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.f) return s; } catch (e) {} return null; }
  var saveT; function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); $('#bd-saved').textContent = 'Saved on this device'; } catch (e) { $('#bd-saved').textContent = 'Photo too big to auto-save — download your file'; } }, 400); }
  function T(k) { return (W[k] || {})[S.lang] || (W[k] || {}).en || k; }
  function L(fd) { return fd.l[S.lang] || fd.l.en; }
  function on(fd) { return fd.on.indexOf(TY[S.type]) >= 0; }

  // ---------- the form ----------
  function rowsEditor(id, cols, data, ph) {
    return '<div class="bd-rows" data-rows="' + id + '">' + data.map(function (r, i) {
      return '<div class="bd-row" data-i="' + i + '">' + cols.map(function (c, j) { return c === 'area' ? '<textarea rows="2" data-c="' + j + '" placeholder="' + esc(ph[j]) + '">' + esc(r[j]) + '</textarea>' : '<input data-c="' + j + '" value="' + esc(r[j]) + '" placeholder="' + esc(ph[j]) + '">'; }).join('') +
        '<div class="bd-rowbtn"><button type="button" data-up title="Move up">↑</button><button type="button" data-del title="Remove">✕</button></div></div>';
    }).join('') + '<button type="button" class="bd-add" data-addrow="' + id + '">+ Add row</button></div>';
  }
  function buildForm() {
    var f = $('#bd-form'), h = '';
    function grp(title, inner, open) { return '<details class="bd-grp"' + (open ? ' open' : '') + '><summary>' + title + '</summary><div class="bd-grid">' + inner + '</div></details>'; }
    function fld(fd) { var v = S.f[fd.k] || ''; return '<label class="' + (fd.t === 'a' ? 'bd-wide' : '') + '"><span>' + esc(L(fd)) + '</span>' + (fd.t === 'a' ? '<textarea rows="3" data-f="' + fd.k + '">' + esc(v) + '</textarea>' : '<input data-f="' + fd.k + '" value="' + esc(v) + '">') + '</label>'; }
    function pick(g) { return F.filter(function (fd) { return fd.g === g && on(fd); }).map(fld).join(''); }
    h += grp('👤 ' + T('fname') + ' & ' + T('contact'), pick('top') + pick('contact') +
      '<div class="bd-wide bd-photos"><label class="bd-up"><input type="file" accept="image/*" data-img="photo"><span>' + (S.photo ? '<img src="' + S.photo + '" alt="">' : '📷') + '</span><b>Photo</b></label>' +
      (S.type !== 'marriage' ? '<label class="bd-up bd-sig"><input type="file" accept="image/*" data-img="sign"><span>' + (S.sign ? '<img src="' + S.sign + '" alt="">' : '✍') + '</span><b>Signature</b></label>' : '') +
      '<button type="button" class="bd-mini" data-clearimg>Remove photo / signature</button></div>', true);
    h += grp('🪪 ' + T('personal'), pick('personal') + '<div class="bd-wide"><span class="bd-lbl">Add your own fields (e.g. Aadhaar no., Blood group)</span>' + rowsEditor('extra', ['t', 't'], S.extra.length ? S.extra : [], ['Field name', 'Value']) + '</div>');
    h += grp('📝 ' + T(S.type === 'marriage' ? 'about' : S.type === 'job' ? 'objective' : 'summary'), F.filter(function (fd) { return fd.k === 'summary'; }).map(fld).join(''));
    if (S.type !== 'marriage') {
      h += grp('🎓 ' + T('education'), '<div class="bd-wide">' + rowsEditor('edu', ['t', 't', 't', 't'], S.edu, [T('exam'), T('board'), T('year'), T('marks')]) + '</div>');
      h += grp('💼 ' + T('experience'), '<div class="bd-wide"><span class="bd-lbl">Fresher? Leave it empty — it will not be printed.</span>' + rowsEditor('exp', ['t', 't', 't', 'area'], S.exp, ['Post / role', 'Company', 'From – To', 'What you did']) + '</div>');
    } else {
      h += grp('👨‍👩‍👧 ' + T('family'), '<div class="bd-wide">' + rowsEditor('family', ['t', 't', 't'], S.family, [T('relation'), T('fname'), T('focc')]) + '</div>');
    }
    h += grp('⭐ ' + (S.type === 'marriage' ? T('hobbies') + ' & ' + T('expect') : T('skills') + ' & ' + T('hobbies')), pick('text').replace(/<label class="bd-wide"><span>[^<]*<\/span><textarea rows="3" data-f="summary">[\s\S]*?<\/textarea><\/label>/, ''));
    if (S.type !== 'marriage') h += grp('✅ ' + T('declaration'), pick('end'));
    f.innerHTML = h;
  }
  function readRows(id) { return $$('[data-rows="' + id + '"] .bd-row').map(function (r) { return $$('[data-c]', r).map(function (i) { return i.value; }); }); }
  function onInput(e) {
    var t = e.target;
    if (t.dataset.f) { S.f[t.dataset.f] = t.value; }
    else if (t.closest('[data-rows]')) { var id = t.closest('[data-rows]').dataset.rows; S[id] = readRows(id); }
    render(); save();
  }
  function onClick(e) {
    var b = e.target.closest('button'); if (!b) return;
    var box = b.closest('[data-rows]');
    if (b.dataset.addrow) { var id = b.dataset.addrow, n = { edu: 4, exp: 4, family: 3, extra: 2 }[id]; S[id] = readRows(id).concat([new Array(n).fill('')]); buildForm(); openGroupOf(id); render(); save(); return; }
    if (box && (b.hasAttribute('data-del') || b.hasAttribute('data-up'))) {
      var rid = box.dataset.rows, rows = readRows(rid), i = +b.closest('.bd-row').dataset.i;
      if (b.hasAttribute('data-del')) rows.splice(i, 1); else if (i > 0) rows.splice(i - 1, 0, rows.splice(i, 1)[0]);
      S[rid] = rows; buildForm(); openGroupOf(rid); render(); save(); return;
    }
    if (b.hasAttribute('data-clearimg')) { S.photo = ''; S.sign = ''; buildForm(); render(); save(); }
  }
  function openGroupOf(id) { var r = $('[data-rows="' + id + '"]'); if (r) r.closest('details').open = true; }
  function readImg(file, max, cb) {
    var rd = new FileReader(); rd.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', 0.88)); }; im.src = rd.result; }; rd.readAsDataURL(file);
  }

  // ---------- the document ----------
  function kv(rows) { return '<table class="kv">' + rows.map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td>' + nl(r[1]) + '</td></tr>'; }).join('') + '</table>'; }
  function sec(title, body, cls) { return body ? '<section class="sec ' + (cls || '') + '"><h3>' + esc(title) + '</h3>' + body + '</section>' : ''; }
  function list(s) { var a = lines(s); return a.length ? '<ul>' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
  function filled(rows) { return (rows || []).filter(function (r) { return r.some(function (x) { return String(x).trim(); }); }); }
  function mix(c, p) { var m = /^#?([0-9a-f]{6})$/i.exec(c) || [0, '1e3a8a'], n = parseInt(m[1], 16), k = p / 100; return 'rgb(' + [n >> 16, (n >> 8) & 255, n & 255].map(function (v) { return Math.round(v * k + 255 * (1 - k)); }).join(',') + ')'; }
  function render() {
    var f = S.f, d = $('#bd-doc'), type = S.type, lang = S.lang;
    var font = S.font || FONTS[lang][0], heading = type === 'marriage' ? T('marriage') : type === 'job' ? T('job') : T('cv');
    var personal = F.filter(function (fd) { return fd.g === 'personal' && on(fd) && String(f[fd.k] || '').trim(); }).map(function (fd) { return [L(fd), f[fd.k]]; });
    filled(S.extra).forEach(function (r) { personal.push([r[0], r[1]]); });
    var contact = ['phone', 'email', 'website', 'address'].filter(function (k) { return String(f[k] || '').trim() && on(F.filter(function (x) { return x.k === k; })[0]); }).map(function (k) { return [L(F.filter(function (x) { return x.k === k; })[0]), f[k]]; });
    var edu = filled(S.edu), exp = filled(S.exp), fam = filled(S.family);
    var eduH = edu.length ? '<table class="grid"><thead><tr><th>' + T('exam') + '</th><th>' + T('board') + '</th><th>' + T('year') + '</th><th>' + T('marks') + '</th></tr></thead><tbody>' + edu.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + esc(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' : '';
    var expH = exp.map(function (r) { return '<div class="job"><div class="jh"><b>' + esc(r[0]) + '</b>' + (r[1] ? ' — ' + esc(r[1]) : '') + '<span>' + esc(r[2]) + '</span></div>' + (r[3] ? '<p>' + nl(r[3]) + '</p>' : '') + '</div>'; }).join('');
    var famH = fam.length ? '<table class="grid"><thead><tr><th>' + T('relation') + '</th><th>' + T('fname') + '</th><th>' + T('focc') + '</th></tr></thead><tbody>' + fam.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + esc(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' : '';
    var sumT = T(type === 'marriage' ? 'about' : type === 'job' ? 'objective' : 'summary');
    var photo = S.tpl !== 'minimal' ? '<div class="ph">' + (S.photo ? '<img src="' + S.photo + '" alt="">' : '<span>Photo</span>') + '</div>' : '';
    var sign = type !== 'marriage' ? '<div class="sign">' + (S.sign ? '<img src="' + S.sign + '" alt="">' : '') + '<i></i><span>' + T('signature') + '</span></div>' : '';
    var foot = type !== 'marriage' ? '<footer class="foot">' + (f.declaration ? sec(T('declaration'), '<p>' + nl(f.declaration) + '</p>', 'decl') : '') + '<div class="pd"><div>' + (f.place ? T('place') + ': ' + esc(f.place) : '') + '<br>' + (f.date ? T('date') + ': ' + esc(f.date) : '') + '</div>' + sign + '</div></footer>' : '';
    var main = sec(sumT, f.summary ? '<p>' + nl(f.summary) + '</p>' : '') +
      (type === 'marriage' ? '' : sec(T('experience'), expH) + sec(T('education'), eduH)) +
      (type === 'marriage' ? sec(T('personal'), kv(personal)) + sec(T('family'), famH) + sec(T('hobbies'), list(f.hobbies)) + sec(T('expect'), f.expect ? '<p>' + nl(f.expect) + '</p>' : '') + sec(T('contact'), kv(contact)) : '');
    var side = sec(T('skills'), list(f.skills)) + sec(T('languages'), f.langs && type === 'cv' ? list(f.langs) : '') + sec(T('hobbies'), type !== 'marriage' ? list(f.hobbies) : '');
    var html, personalC = type === 'cv' ? personal.filter(function (r) { return r[0] !== L(F[21]); }) : personal;
    var name = '<h1>' + esc(f.name || 'Your Name') + '</h1>', title = f.title && type !== 'marriage' ? '<div class="ti">' + esc(f.title) + '</div>' : '';
    var cline = contact.map(function (r) { return '<span>' + esc(r[1]) + '</span>'; }).join('');
    if (S.tpl === 'sidebar' && type !== 'marriage') {
      html = '<aside class="side">' + photo + sec(T('contact'), kv(contact), 'ct') + side + (type === 'job' ? '' : sec(T('personal'), kv(personalC))) + '</aside><div class="main"><header class="hd">' + name + title + '</header>' +
        (type === 'job' ? sec(T('personal'), kv(personal)) + sec(sumT, f.summary ? '<p>' + nl(f.summary) + '</p>' : '') + sec(T('education'), eduH) + sec(T('experience'), expH) : main) + foot + '</div>';
    } else {
      var kick = S.tpl === 'classic' || S.tpl === 'floral' || S.tpl === 'elegant' ? '<div class="kick">' + esc(heading) + '</div>' : '';
      var centered = S.tpl === 'floral' || S.tpl === 'elegant';
      var showCl = type !== 'marriage' && !centered;
      var top = '<header class="hd">' + (centered ? kick + photo + name + title + (type !== 'marriage' ? '<div class="cl">' + cline + '</div>' : '') : '<div class="hl">' + kick + name + title + (showCl ? '<div class="cl">' + cline + '</div>' : '') + '</div>' + photo) + '</header>';
      var body;
      if (type === 'marriage') body = main;
      else if (type === 'job') body = sec(T('personal'), kv(personal)) + sec(sumT, f.summary ? '<p>' + nl(f.summary) + '</p>' : '') + sec(T('education'), eduH) + sec(T('experience'), expH) + '<div class="two">' + sec(T('skills'), list(f.skills)) + sec(T('hobbies'), list(f.hobbies)) + '</div>';
      else body = main + '<div class="two">' + side + '</div>' + sec(T('personal'), kv(personalC));
      html = (S.tpl === 'floral' ? '<div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>' : '') + top + '<div class="body">' + body + '</div>' + foot;
    }
    d.className = 'doc t-' + S.tpl + ' ty-' + type + ' lg-' + lang;
    d.style.setProperty('--a', S.color); [7, 8, 12, 20, 25, 35, 45, 50, 60].forEach(function (p) { d.style.setProperty('--a' + p, mix(S.color, p)); }); d.style.fontFamily = '"' + font + '", "Hind Siliguri", "Hind", sans-serif';
    d.innerHTML = html; fit();
  }
  function fit() { var w = $('#bd-stage').clientWidth - 24, k = Math.min(1, w / 794); $('#bd-doc').style.transform = 'scale(' + k + ')'; $('#bd-sizer').style.height = Math.ceil($('#bd-doc').offsetHeight * k) + 'px'; $('#bd-sizer').style.width = Math.ceil(794 * k) + 'px'; }

  // ---------- controls ----------
  function buildControls() {
    $('#bd-type').innerHTML = [['cv', '📄 Resume / CV'], ['job', '🗂 Job Bio-Data'], ['marriage', '💍 Marriage Bio-Data']].map(function (t) { return '<button type="button" data-type="' + t[0] + '" aria-pressed="' + (S.type === t[0]) + '">' + t[1] + '</button>'; }).join('');
    $('#bd-lang').innerHTML = [['en', 'English'], ['bn', 'বাংলা'], ['hi', 'हिन्दी']].map(function (t) { return '<button type="button" data-lang="' + t[0] + '" aria-pressed="' + (S.lang === t[0]) + '">' + t[1] + '</button>'; }).join('');
    $('#bd-tpl').innerHTML = TPL.map(function (t) { return '<button type="button" data-tpl="' + t[0] + '" aria-pressed="' + (S.tpl === t[0]) + '"><i class="mini m-' + t[0] + '"></i>' + t[1] + '</button>'; }).join('');
    $('#bd-col').innerHTML = COLORS.map(function (c) { return '<button type="button" data-col="' + c + '" style="background:' + c + '" aria-label="Colour ' + c + '" aria-pressed="' + (S.color === c) + '"></button>'; }).join('') + '<label class="bd-own" title="Any colour"><input type="color" value="' + S.color + '" data-colpick>🎨</label>';
    $('#bd-font').innerHTML = FONTS[S.lang].map(function (f) { return '<option' + ((S.font || FONTS[S.lang][0]) === f ? ' selected' : '') + '>' + f + '</option>'; }).join('');
  }
  function setType(t) { if (t === S.type) return; S.type = t; S.tpl = t === 'marriage' ? 'floral' : t === 'job' ? 'classic' : 'sidebar'; S.color = t === 'marriage' ? '#be185d' : '#1e3a8a'; if (!S.f.declaration) S.f.declaration = DECL[S.lang]; buildControls(); buildForm(); render(); save(); }
  function bind() {
    $('#bd-form').addEventListener('input', onInput);
    $('#bd-form').addEventListener('click', onClick);
    $('#bd-form').addEventListener('change', function (e) { var t = e.target; if (t.dataset.img && t.files[0]) readImg(t.files[0], t.dataset.img === 'photo' ? 700 : 600, function (u) { S[t.dataset.img] = u; buildForm(); render(); save(); }); });
    $('.bd-ctl').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.type) setType(b.dataset.type);
      else if (b.dataset.lang) { var old = S.lang; S.lang = b.dataset.lang; S.font = ''; if (!S.f.declaration || S.f.declaration === DECL[old]) S.f.declaration = DECL[S.lang]; buildControls(); buildForm(); render(); save(); }
      else if (b.dataset.tpl) { S.tpl = b.dataset.tpl; buildControls(); render(); save(); }
      else if (b.dataset.col) { S.color = b.dataset.col; buildControls(); render(); save(); }
    });
    $('.bd-ctl').addEventListener('input', function (e) { if (e.target.hasAttribute('data-colpick')) { S.color = e.target.value; render(); save(); } if (e.target.id === 'bd-font') { S.font = e.target.value; render(); save(); } });
    $('#bd-sample').addEventListener('click', function () { var s = SAMPLE[S.type]; S.f = Object.assign({ declaration: DECL[S.lang] }, s); S.edu = (s.edu || [['', '', '', '']]).map(function (r) { return r.slice(); }); S.exp = (s.exp || [['', '', '', '']]).map(function (r) { return r.slice(); }); S.family = (s.family || [['', '', '']]).map(function (r) { return r.slice(); }); buildForm(); render(); save(); });
    $('#bd-clear').addEventListener('click', function () { if (!window.confirm('Clear all details on this device?')) return; var t = S.type, l = S.lang; S = blank(t); S.lang = l; S.f.declaration = DECL[l]; buildControls(); buildForm(); render(); save(); });
    $('#bd-pdf').addEventListener('click', function () { exportDoc('pdf'); });
    $('#bd-jpg').addEventListener('click', function () { exportDoc('jpg'); });
    $('#bd-print').addEventListener('click', function () { window.print(); });
    $$('.bd-tabs button').forEach(function (b) { b.addEventListener('click', function () { document.body.dataset.view = b.dataset.view; $$('.bd-tabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); setTimeout(fit, 50); }); });
    window.addEventListener('resize', fit);
  }
  function fileName() { return (S.f.name || 'My').replace(/[^\wঀ-৿ऀ-ॿ]+/g, '-') + '-' + (S.type === 'cv' ? 'Resume' : 'BioData'); }
  function exportDoc(kind) {
    if (!window.html2pdf) { toast('Still loading, try again in a moment.'); return; }
    var src = $('#bd-doc'), clone = src.cloneNode(true); clone.style.transform = 'none'; clone.id = '';
    var holder = document.createElement('div'); holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px'; holder.appendChild(clone); document.body.appendChild(holder);
    toast(kind === 'pdf' ? 'Making your PDF…' : 'Making your JPG…');
    var opt = { margin: 0, filename: fileName() + '.pdf', image: { type: 'jpeg', quality: 0.96 }, html2canvas: { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'] }, pagebreak: { mode: ['css', 'avoid-all'], avoid: ['.sec', '.job', 'tr', '.foot'] } };
    var done = function () { holder.remove(); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
      var w = html2pdf().set(opt).from(clone);
      if (kind === 'pdf') return w.save().then(done, function (e) { done(); toast('Could not make the PDF: ' + e); });
      return w.toCanvas().get('canvas').then(function (c) { var a = document.createElement('a'); a.download = fileName() + '.jpg'; a.href = c.toDataURL('image/jpeg', 0.95); a.click(); done(); }, function (e) { done(); toast('Could not make the JPG: ' + e); });
    });
  }
  var tt; function toast(m) { var e = $('#bd-toast'); e.textContent = m; e.hidden = false; clearTimeout(tt); tt = setTimeout(function () { e.hidden = true; }, 3500); }

  // ---------- start ----------
  var q = new URLSearchParams(location.search), qt = q.get('type'), ql = q.get('lang');
  S = load() || blank(qt || 'cv');
  if (qt && TY[qt] && qt !== S.type) { S.type = qt; S.tpl = qt === 'marriage' ? 'floral' : qt === 'job' ? 'classic' : 'sidebar'; S.color = qt === 'marriage' ? '#be185d' : '#1e3a8a'; }
  if (ql && FONTS[ql]) S.lang = ql;
  if (!S.f.declaration) S.f.declaration = DECL[S.lang];
  ['edu', 'exp', 'family', 'extra'].forEach(function (k) { if (!Array.isArray(S[k])) S[k] = []; });
  buildControls(); buildForm(); bind(); render();
  if (document.fonts) document.fonts.ready.then(fit);
  window.SPBioData = { state: function () { return S; }, render: render };
})();
