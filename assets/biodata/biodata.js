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
    certs: { en: 'Certifications & Training', bn: 'সার্টিফিকেট ও প্রশিক্ষণ', hi: 'प्रमाणपत्र और प्रशिक्षण' }, projects: { en: 'Projects', bn: 'প্রজেক্ট', hi: 'प्रोजेक्ट' },
    strengths: { en: 'Key Strengths', bn: 'বিশেষ গুণ', hi: 'मुख्य खूबियाँ' }, achieve: { en: 'Achievements', bn: 'অর্জন', hi: 'उपलब्धियाँ' }, refs: { en: 'References', bn: 'রেফারেন্স', hi: 'संदर्भ' }, interests: { en: 'Hobbies & Interests', bn: 'শখ', hi: 'शौक' },
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
    ['strengths', 'Key strengths (one per line)', 'বিশেষ গুণ (প্রতি লাইনে একটি)', 'मुख्य खूबियाँ (हर पंक्ति में एक)', 'a', 'cj', 'text'],
    ['certs', 'Certifications / training (one per line)', 'সার্টিফিকেট / প্রশিক্ষণ', 'प्रमाणपत्र / प्रशिक्षण', 'a', 'cj', 'text'],
    ['achieve', 'Achievements / awards (one per line)', 'অর্জন / পুরস্কার', 'उपलब्धियाँ / पुरस्कार', 'a', 'c', 'text'],
    ['hobbies', 'Hobbies / interests', 'শখ', 'शौक', 'a', 'cjm', 'text'],
    ['expect', 'Partner expectations', 'পাত্র/পাত্রীর প্রত্যাশা', 'जीवनसाथी से अपेक्षा', 'a', 'm', 'text'],
    ['refs', 'References (or “Available on request”)', 'রেফারেন্স', 'संदर्भ', 'a', 'c', 'end'],
    ['declaration', 'Declaration', 'ঘোষণা', 'घोषणा', 'a', 'cj', 'end'],
    ['place', 'Place', 'স্থান', 'स्थान', 't', 'cj', 'end'],
    ['date', 'Date', 'তারিখ', 'दिनांक', 't', 'cj', 'end']
  ].map(function (a) { return { k: a[0], l: { en: a[1], bn: a[2], hi: a[3] }, t: a[4], on: a[5], g: a[6] }; });
  var TY = { cv: 'c', job: 'j', marriage: 'm' };
  // names offered while typing (anyone can still type their own)
  var EXAMS = ['Madhyamik (10th)', 'Higher Secondary (12th)', 'Secondary (10th)', 'Senior Secondary (12th)', 'High Madrasah (10th)', 'Alim', 'Fazil', 'ITI', 'Diploma (Polytechnic)', 'Diploma in Engineering', 'B.A.', 'B.A. (Hons.)', 'B.Sc.', 'B.Sc. (Hons.)', 'B.Com.', 'B.Com. (Hons.)', 'BBA', 'BCA', 'B.Tech', 'B.E.', 'B.Pharm', 'D.Pharm', 'B.Ed.', 'D.El.Ed.', 'B.P.Ed.', 'LLB', 'MBBS', 'BDS', 'B.Sc. Nursing', 'GNM', 'ANM', 'M.A.', 'M.Sc.', 'M.Com.', 'MBA', 'MCA', 'M.Tech', 'M.Ed.', 'M.Phil.', 'Ph.D.', 'DCA', 'ADCA', 'PGDCA', 'Tally Certificate', 'NET', 'SET', 'CA', 'CS', 'CMA'];
  var BOARDS = ['WBBSE — West Bengal Board of Secondary Education', 'WBCHSE — West Bengal Council of Higher Secondary Education', 'WBBME — West Bengal Board of Madrasah Education', 'WBSCVET — West Bengal State Council of Vocational Education & Training', 'WBSCTE — West Bengal State Council of Technical Education', 'Rabindra Mukta Vidyalaya (WBCROS)', 'West Bengal Board of Primary Education', 'CBSE — Central Board of Secondary Education', 'CISCE (ICSE / ISC)', 'NIOS — National Institute of Open Schooling', 'NCVT / SCVT (ITI)', 'BSEB — Bihar School Examination Board', 'JAC — Jharkhand Academic Council', 'BSE Odisha', 'CHSE Odisha', 'ASSEB — Assam State School Education Board', 'UPMSP — Uttar Pradesh Board', 'MPBSE — Madhya Pradesh Board', 'CGBSE — Chhattisgarh Board', 'RBSE — Rajasthan Board', 'MSBSHSE — Maharashtra Board', 'GSEB — Gujarat Board', 'KSEAB — Karnataka Board', 'Kerala Board (KBPE / DHSE)', 'Tamil Nadu State Board', 'BSEAP / BIEAP — Andhra Pradesh', 'BSE Telangana / TSBIE', 'PSEB — Punjab Board', 'HBSE — Haryana Board', 'HPBOSE — Himachal Pradesh Board', 'JKBOSE — Jammu & Kashmir Board', 'UBSE — Uttarakhand Board', 'GBSHSE — Goa Board', 'TBSE — Tripura Board', 'BOSEM / COHSEM — Manipur', 'MBOSE — Meghalaya Board', 'MBSE — Mizoram Board', 'NBSE — Nagaland Board',
    'University of Calcutta', 'Jadavpur University', 'Presidency University', 'The University of Burdwan', 'Vidyasagar University', 'University of Kalyani', 'University of North Bengal', 'Rabindra Bharati University', 'Visva-Bharati', 'West Bengal State University', 'Bankura University', 'Sidho-Kanho-Birsha University', 'Kazi Nazrul University', 'University of Gour Banga', 'Raiganj University', 'Cooch Behar Panchanan Barma University', 'Diamond Harbour Women\'s University', 'Sadhu Ram Chand Murmu University of Jhargram', 'Harichand Guruchand University', 'Netaji Subhas Open University', 'Aliah University', 'MAKAUT — Maulana Abul Kalam Azad University of Technology', 'WBUHS — West Bengal University of Health Sciences', 'Baba Saheb Ambedkar Education University', 'Bidhan Chandra Krishi Viswavidyalaya', 'Uttar Banga Krishi Viswavidyalaya', 'WBNUJS — National University of Juridical Sciences', 'IIEST Shibpur', 'IIT Kharagpur', 'NIT Durgapur', 'ISI Kolkata', 'IIM Calcutta',
    'IGNOU — Indira Gandhi National Open University', 'University of Delhi', 'JNU — Jawaharlal Nehru University', 'BHU — Banaras Hindu University', 'AMU — Aligarh Muslim University', 'Jamia Millia Islamia', 'University of Mumbai', 'Savitribai Phule Pune University', 'University of Madras', 'Anna University', 'Osmania University', 'Bangalore University', 'VTU — Visvesvaraya Technological University', 'AKTU — Dr. A.P.J. Abdul Kalam Technical University', 'Gauhati University', 'Patna University', 'Ranchi University', 'Utkal University', 'Sambalpur University', 'Banasthali Vidyapith', 'Annamalai University', 'Amity University', 'Lovely Professional University', 'IIT', 'NIT', 'AIIMS'];

  var DECL = { en: 'I hereby declare that the information given above is true to the best of my knowledge and belief.', bn: 'আমি এই মর্মে ঘোষণা করছি যে উপরের সমস্ত তথ্য আমার জ্ঞান ও বিশ্বাস মতে সত্য।', hi: 'मैं घोषणा करता/करती हूँ कि ऊपर दी गई सभी जानकारी मेरी जानकारी के अनुसार सत्य है।' };

  var SAMPLE = {
    cv: { name: 'Riya Sen', title: 'Graphic Designer', phone: '+91 98300 12345', email: 'riya.sen@email.com', website: 'behance.net/riyasen', address: '22, Lake Road, Kolkata 700029', father: 'Amit Sen', dob: '12/04/1999', gender: 'Female', marital: 'Unmarried', nationality: 'Indian', langs: 'Bengali, English, Hindi',
      summary: 'Creative designer with 3 years of experience in branding, social media posts and print layouts. I love clean design and meeting deadlines.',
      skills: 'Adobe Photoshop\nIllustrator\nFigma\nPrint layout & pre-press\nMS Office', strengths: 'Creative thinking\nTime management\nClient communication', certs: 'Google UX Design Certificate (2023)\nAdvanced Photoshop — Coursera (2022)', achieve: 'Best Design award 2024', hobbies: 'Painting, Photography',
      edu: [['B.Des (Communication Design)', 'University of Calcutta', '2021', '7.8 CGPA'], ['12th (Arts)', 'WBCHSE', '2018', '82%'], ['10th', 'WBBSE', '2016', '86%']],
      exp: [['Graphic Designer', 'Pixel Studio, Kolkata', '2022 – Present', 'Designed brand kits and social media creatives for 20+ clients\nCut print turnaround time by 30% with ready templates\nTrained 2 junior designers'], ['Design Intern', 'Ad House', '2021 – 2022', 'Posters, flyers and packaging mock-ups']],
      proj: [['Café rebrand', 'Illustrator · 2024', 'New logo, menu and signage; footfall up 18% in 3 months']] },
    job: { name: 'Rahul Kumar', title: 'Office Assistant', phone: '+91 91234 56789', email: 'rahul.k@email.com', address: 'Vill. Rampur, P.O. Bishnupur, Dist. Bankura, West Bengal 722122', father: 'Suresh Kumar', mother: 'Sunita Devi', dob: '05/01/2000', gender: 'Male', marital: 'Unmarried', religion: 'Hindu', nationality: 'Indian', langs: 'Bengali, Hindi, English',
      summary: 'To work sincerely in a reputed organisation and grow with my skills in computer work and office management.', skills: 'MS Word, Excel\nTally Prime\nTyping (Bengali & English)\nInternet & e-mail',
      hobbies: 'Reading\nCricket', edu: [['B.A.', 'Bankura University', '2021', '61%'], ['12th', 'WBCHSE', '2018', '68%'], ['10th', 'WBBSE', '2016', '72%']], exp: [['Computer Operator', 'Sharma Traders', '2022 – Present', 'Billing, data entry and customer records.']] },
    marriage: { name: 'Priya Das', phone: '+91 90000 11111', email: 'dasfamily@email.com', address: '14/2, Station Road, Burdwan 713101', father: 'Mr. Subrata Das (Retd. Bank Officer)', mother: 'Mrs. Mita Das (Homemaker)', dob: '18/07/1998', btime: '6:40 AM', bplace: 'Burdwan', marital: 'Unmarried', height: "5' 3\"", complexion: 'Fair', religion: 'Hindu', caste: 'Kayastha', qual: 'M.Sc. (Chemistry)', job: 'School Teacher (Govt.)', income: '', langs: 'Bengali, English, Hindi',
      summary: 'Simple, family-oriented and cheerful. I enjoy teaching, music and cooking.', hobbies: 'Rabindra Sangeet\nCooking\nTravelling', expect: 'Well-educated, kind and settled groom from a good family.',
      family: [['Father', 'Subrata Das', 'Retired Bank Officer'], ['Mother', 'Mita Das', 'Homemaker'], ['Brother', 'Arnab Das', 'Software Engineer, Pune']] }
  };

  var TPL = [['executive', 'Executive'], ['timeline', 'Timeline'], ['classic', 'Classic'], ['sidebar', 'Modern sidebar'], ['elegant', 'Elegant'], ['bold', 'Bold header'], ['floral', 'Floral'], ['minimal', 'Minimal (no photo)'], ['onyx', 'Onyx dark'], ['ribbon', 'Ribbon'], ['compact', 'Compact pro']];
  var SIDE = ['sidebar', 'executive', 'onyx'], KICK = ['classic', 'floral', 'elegant'];
  var COLORS = ['#1e3a8a', '#0f766e', '#7c3aed', '#be185d', '#b91c1c', '#c2410c', '#15803d', '#334155', '#a16207', '#0e7490'];
  var FONTS = { en: ['Poppins', 'Playfair Display', 'Lora', 'Montserrat'], bn: ['Hind Siliguri', 'Noto Serif Bengali', 'Baloo Da 2'], hi: ['Hind', 'Martel', 'Mukta'] };

  var KEY = 'sp-biodata-v1', S;
  function blank(type) { return { type: type || 'cv', lang: 'en', tpl: type === 'marriage' ? 'floral' : type === 'job' ? 'classic' : 'executive', color: type === 'marriage' ? '#be185d' : '#1e3a8a', font: '', photo: '', sign: '', f: { declaration: DECL.en }, edu: [['', '', '', '']], exp: [['', '', '', '']], family: [['', '', '']], extra: [] }; }
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.f) return s; } catch (e) {} return null; }
  var saveT; function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); $('#bd-saved').textContent = 'Saved on this device'; if (window.SPBioPro) window.SPBioPro.changed(S); } catch (e) { $('#bd-saved').textContent = 'Photo too big to auto-save — download your file'; } }, 400); }
  function T(k) { return (W[k] || {})[S.lang] || (W[k] || {}).en || k; }
  function L(fd) { return fd.l[S.lang] || fd.l.en; }
  function on(fd) { return fd.on.indexOf(TY[S.type]) >= 0; }

  // ---------- icons (drawn by S Printer) ----------
  var IC = {
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2.4"/><path d="M5.8 16.5c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14.5 10h4M14.5 13.5h3"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
    bag: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12.5h18"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    family: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5M14 15.3c.9-.5 1.9-.8 3-.8 2.6 0 4.5 1.9 4.5 4.8"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    resume: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><circle cx="10" cy="11" r="1.8"/><path d="M7.8 16c.4-1.1 1.2-1.7 2.2-1.7s1.8.6 2.2 1.7M14 11h2M14 14h2"/>',
    clip: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V3h6v1M8.5 10h7M8.5 13.5h7M8.5 17h4"/>',
    rings: '<circle cx="9" cy="14.5" r="5"/><circle cx="15" cy="14.5" r="5"/><path d="M12 3.2l2 2.3-2 2.3-2-2.3z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9" r="1.8"/><path d="M3 17l5-5 4 4 3-3 6 6"/>',
    pdf: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8.5 17v-4h1.3a1.3 1.3 0 0 1 0 2.6H8.5M13 13v4h.8a1.6 1.6 0 0 0 1.6-1.6v-.8A1.6 1.6 0 0 0 13.8 13z"/>',
    printer: '<path d="M7 9V3h10v6"/><path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
    sign: '<path d="M3 16c2.5-.5 3.5-6 5.5-6s1 6 3 6 2.7-3.5 3.8-3.5 1 2 2.2 2H21"/><path d="M3 20.5h18"/>',
    sparkle: '<path d="M11 3l1.9 4.9L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-2.1z"/><path d="M18.5 14.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    zip: '<path d="M4 14l4-4 3 3 5-6 4 4"/><path d="M4 20h16"/><path d="M14 4h6v6"/>'
  };
  function ic(n) { return '<svg class="bd-i bd-i-' + n + '" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + IC[n].replace(/<(path|circle|rect) /g, '<$1 pathLength="1" ') + '</g></svg>'; }
  function tile(n) { return '<span class="bd-tile">' + ic(n) + '</span>'; }
  (function () { try { var d = document.createElement('div'); d.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="bdG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0098D8"/><stop offset=".55" stop-color="#6d5dfc"/><stop offset="1" stop-color="#D6247A"/></linearGradient></defs></svg>'; document.body.insertBefore(d.firstChild, document.body.firstChild); } catch (e) {} })();

  // ---------- the form ----------
  function rowsEditor(id, cols, data, ph, lists) {
    return '<div class="bd-rows" data-rows="' + id + '">' + data.map(function (r, i) {
      return '<div class="bd-row" data-i="' + i + '">' + cols.map(function (c, j) { return c === 'area' ? '<textarea rows="2" data-c="' + j + '" placeholder="' + esc(ph[j]) + '">' + esc(r[j]) + '</textarea>' : '<input data-c="' + j + '" value="' + esc(r[j]) + '" placeholder="' + esc(ph[j]) + '"' + (lists && lists[j] ? ' list="' + lists[j] + '" autocomplete="off"' : '') + '>'; }).join('') +
        '<div class="bd-rowbtn"><button type="button" data-up title="Move up">↑</button><button type="button" data-del title="Remove">✕</button></div></div>';
    }).join('') + '<button type="button" class="bd-add" data-addrow="' + id + '">+ Add row</button></div>';
  }
  function buildForm() {
    var f = $('#bd-form'), h = '';
    function grp(title, inner, open) { return '<details class="bd-grp"' + (open ? ' open' : '') + '><summary><span class="bd-sumt">' + title + '</span></summary><div class="bd-grid">' + inner + '</div></details>'; }
    function fld(fd) { var v = S.f[fd.k] || ''; return '<label class="' + (fd.t === 'a' ? 'bd-wide' : '') + '"><span>' + esc(L(fd)) + '</span>' + (fd.t === 'a' ? '<textarea rows="3" data-f="' + fd.k + '">' + esc(v) + '</textarea>' : '<input data-f="' + fd.k + '" value="' + esc(v) + '">') + '</label>'; }
    function pick(g) { return F.filter(function (fd) { return fd.g === g && on(fd); }).map(fld).join(''); }
    h += grp(tile('user') + T('fname') + ' & ' + T('contact'), pick('top') + pick('contact') +
      '<div class="bd-wide bd-photos"><label class="bd-up"><input type="file" accept="image/*" data-img="photo"><span>' + (S.photo ? '<img src="' + S.photo + '" alt="">' : ic('camera')) + '</span><b>Photo</b></label>' +
      (S.type !== 'marriage' ? '<label class="bd-up bd-sig"><input type="file" accept="image/*" data-img="sign"><span>' + (S.sign ? '<img src="' + S.sign + '" alt="">' : ic('sign')) + '</span><b>Signature</b></label>' : '') +
      '<button type="button" class="bd-mini" data-clearimg>' + ic('trash') + 'Remove photo / signature</button></div>', true);
    h += grp(tile('id') + T('personal'), pick('personal') + '<div class="bd-wide"><span class="bd-lbl">Add your own fields (e.g. Aadhaar no., Blood group)</span>' + rowsEditor('extra', ['t', 't'], S.extra.length ? S.extra : [], ['Field name', 'Value']) + '</div>');
    h += grp(tile('pen') + T(S.type === 'marriage' ? 'about' : S.type === 'job' ? 'objective' : 'summary'), F.filter(function (fd) { return fd.k === 'summary'; }).map(fld).join(''));
    if (S.type !== 'marriage') {
      h += grp(tile('cap') + T('education'), '<div class="bd-wide">' + rowsEditor('edu', ['t', 't', 't', 't'], S.edu, [T('exam') + ' — type or pick', T('board') + ' — type or pick', T('year'), T('marks')], ['bd-l-exam', 'bd-l-board']) + '</div>');
      h += grp(tile('bag') + T('experience'), '<div class="bd-wide"><span class="bd-lbl">Fresher? Leave it empty — it will not be printed. Tip: start each point with an action word (Managed, Built, Increased…) and add numbers.</span>' + rowsEditor('exp', ['t', 't', 't', 'area'], S.exp, ['Post / role', 'Company', 'From – To', 'What you did']) + '</div>');
      if (S.type === 'cv') h += grp(tile('layers') + T('projects'), '<div class="bd-wide"><span class="bd-lbl">Optional — college / work projects</span>' + rowsEditor('proj', ['t', 't', 'area'], S.proj && S.proj.length ? S.proj : [['', '', '']], ['Project name', 'Tools / link / year', 'What you did and the result']) + '</div>');
    } else {
      h += grp(tile('family') + T('family'), '<div class="bd-wide">' + rowsEditor('family', ['t', 't', 't'], S.family, [T('relation'), T('fname'), T('focc')]) + '</div>');
    }
    h += grp(tile('star') + (S.type === 'marriage' ? T('hobbies') + ' & ' + T('expect') : T('skills') + ' & ' + T('hobbies')), pick('text').replace(/<label class="bd-wide"><span>[^<]*<\/span><textarea rows="3" data-f="summary">[\s\S]*?<\/textarea><\/label>/, ''));
    if (S.type !== 'marriage') h += grp(tile('shield') + T('declaration'), pick('end'));
    f.innerHTML = h + '<datalist id="bd-l-exam">' + EXAMS.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist><datalist id="bd-l-board">' + BOARDS.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist>';
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
    if (b.dataset.addrow) { var id = b.dataset.addrow, n = { edu: 4, exp: 4, family: 3, extra: 2, proj: 3 }[id]; S[id] = readRows(id).concat([new Array(n).fill('')]); buildForm(); openGroupOf(id); render(); save(); return; }
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
  function kv(rows, cls) { return '<table class="kv' + (cls ? ' ' + cls : '') + '">' + rows.map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td>' + nl(r[1]) + '</td></tr>'; }).join('') + '</table>'; }
  function sec(title, body, cls) { return body ? '<section class="sec ' + (cls || '') + '"><h3>' + esc(title) + '</h3>' + body + '</section>' : ''; }
  function list(s) { var a = lines(s); return a.length ? '<ul>' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
  function filled(rows) { return (rows || []).filter(function (r) { return r.some(function (x) { return String(x).trim(); }); }); }
  function mix(c, p) { var m = /^#?([0-9a-f]{6})$/i.exec(c) || [0, '1e3a8a'], n = parseInt(m[1], 16), k = p / 100; return 'rgb(' + [n >> 16, (n >> 8) & 255, n & 255].map(function (v) { return Math.round(v * k + 255 * (1 - k)); }).join(',') + ')'; }
  function render(d0, tp0) {
    var f = S.f, d = d0 || $('#bd-doc'), tp = tp0 || S.tpl, type = S.type, lang = S.lang;
    var font = S.font || FONTS[lang][0], heading = type === 'marriage' ? T('marriage') : type === 'job' ? T('job') : T('cv');
    var personal = F.filter(function (fd) { return fd.g === 'personal' && on(fd) && String(f[fd.k] || '').trim(); }).map(function (fd) { return [L(fd), f[fd.k]]; });
    filled(S.extra).forEach(function (r) { personal.push([r[0], r[1]]); });
    var contact = ['phone', 'email', 'website', 'address'].filter(function (k) { return String(f[k] || '').trim() && on(F.filter(function (x) { return x.k === k; })[0]); }).map(function (k) { return [L(F.filter(function (x) { return x.k === k; })[0]), f[k]]; });
    var edu = filled(S.edu), exp = filled(S.exp), fam = filled(S.family), proj = type === 'cv' ? filled(S.proj) : [];
    var projH = proj.map(function (r) { return '<div class="job"><div class="jh"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>' + (r[2] ? '<p>' + nl(r[2]) + '</p>' : '') + '</div>'; }).join('');
    var eduH = edu.length ? '<table class="grid"><thead><tr><th>' + T('exam') + '</th><th>' + T('board') + '</th><th>' + T('year') + '</th><th>' + T('marks') + '</th></tr></thead><tbody>' + edu.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + esc(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' : '';
    var expH = exp.map(function (r) { var pts = lines(String(r[3] || '').replace(/,/g, '\u201a')).map(function (x) { return x.replace(/\u201a/g, ',').replace(/^[-•*]\s*/, ''); }); return '<div class="job"><div class="jh"><b>' + esc(r[0]) + '</b>' + (r[1] ? '<em>' + esc(r[1]) + '</em>' : '') + '<span>' + esc(r[2]) + '</span></div>' + (pts.length > 1 ? '<ul>' + pts.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : pts.length ? '<p>' + esc(pts[0]) + '</p>' : '') + '</div>'; }).join('');
    var famH = fam.length ? '<table class="grid"><thead><tr><th>' + T('relation') + '</th><th>' + T('fname') + '</th><th>' + T('focc') + '</th></tr></thead><tbody>' + fam.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + esc(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' : '';
    var sumT = T(type === 'marriage' ? 'about' : type === 'job' ? 'objective' : 'summary');
    var photo = tp !== 'minimal' ? '<div class="ph">' + (S.photo ? '<img src="' + S.photo + '" alt="">' : '<span>Photo</span>') + '</div>' : '';
    var sign = type !== 'marriage' ? '<div class="sign">' + (S.sign ? '<img src="' + S.sign + '" alt="">' : '') + '<i></i><span>' + T('signature') + '</span></div>' : '';
    var foot = type !== 'marriage' ? '<footer class="foot">' + (f.declaration ? sec(T('declaration'), '<p>' + nl(f.declaration) + '</p>', 'decl') : '') + '<div class="pd"><div>' + (f.place ? T('place') + ': ' + esc(f.place) : '') + '<br>' + (f.date ? T('date') + ': ' + esc(f.date) : '') + '</div>' + sign + '</div></footer>' : '';
    var main = sec(sumT, f.summary ? '<p>' + nl(f.summary) + '</p>' : '') +
      (type === 'marriage' ? '' : sec(T('experience'), expH) + sec(T('projects'), projH) + sec(T('education'), eduH) + sec(T('certs'), list(f.certs))) +
      (type === 'marriage' ? sec(T('personal'), kv(personal)) + sec(T('family'), famH) + sec(T('hobbies'), list(f.hobbies)) + sec(T('expect'), f.expect ? '<p>' + nl(f.expect) + '</p>' : '') + sec(T('contact'), kv(contact)) : '');
    var side = sec(T('skills'), list(f.skills)) + sec(T('strengths'), list(f.strengths)) + sec(T('languages'), f.langs && type === 'cv' ? list(f.langs) : '') + sec(T('achieve'), type === 'cv' ? list(f.achieve) : '') + sec(T(type === 'cv' ? 'interests' : 'hobbies'), type !== 'marriage' ? list(f.hobbies) : '') + sec(T('refs'), type === 'cv' && f.refs ? '<p>' + nl(f.refs) + '</p>' : '');
    var html, personalC = type === 'cv' ? personal.filter(function (r) { return r[0] !== L(F[21]); }) : personal;
    var name = '<h1>' + esc(f.name || 'Your Name') + '</h1>', title = f.title && type !== 'marriage' ? '<div class="ti">' + esc(f.title) + '</div>' : '';
    var cline = contact.map(function (r) { return '<span>' + esc(r[1]) + '</span>'; }).join('');
    if (SIDE.indexOf(tp) >= 0 && type !== 'marriage') {
      html = '<aside class="side">' + photo + sec(T('contact'), kv(contact), 'ct') + side + (type === 'job' ? '' : sec(T('personal'), kv(personalC))) + '</aside><div class="main"><header class="hd">' + name + title + '</header>' +
        (type === 'job' ? sec(T('personal'), kv(personal)) + sec(sumT, f.summary ? '<p>' + nl(f.summary) + '</p>' : '') + sec(T('education'), eduH) + sec(T('experience'), expH) + sec(T('certs'), list(f.certs)) : main) + foot + '</div>';
    } else {
      var kick = KICK.indexOf(tp) >= 0 ? '<div class="kick">' + esc(heading) + '</div>' : '';
      var centered = tp === 'floral' || tp === 'elegant';
      var showCl = type !== 'marriage' && !centered;
      var top = '<header class="hd">' + (centered ? kick + photo + name + title + (type !== 'marriage' ? '<div class="cl">' + cline + '</div>' : '') : '<div class="hl">' + kick + name + title + (showCl ? '<div class="cl">' + cline + '</div>' : '') + '</div>' + photo) + '</header>';
      var body;
      if (type === 'marriage') body = main;
      else if (type === 'job') body = sec(T('personal'), kv(personal)) + sec(sumT, f.summary ? '<p>' + nl(f.summary) + '</p>' : '') + sec(T('education'), eduH) + sec(T('experience'), expH) + sec(T('certs'), list(f.certs)) + '<div class="two">' + sec(T('skills'), list(f.skills)) + sec(T('strengths'), list(f.strengths)) + sec(T('hobbies'), list(f.hobbies)) + '</div>';
      else body = main + '<div class="two">' + side + '</div>' + sec(T('personal'), kv(personalC, 'k2'));
      html = (tp === 'floral' ? '<div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>' : '') + top + '<div class="body">' + body + '</div>' + foot;
    }
    d.className = 'doc t-' + tp + ' ty-' + type + ' lg-' + lang;
    d.style.setProperty('--a', S.color); [7, 8, 12, 20, 25, 35, 45, 50, 60].forEach(function (p) { d.style.setProperty('--a' + p, mix(S.color, p)); }); d.style.fontFamily = '"' + font + '", "Hind Siliguri", "Hind", sans-serif';
    d.innerHTML = html; if (window.SPBioPro) window.SPBioPro.decorate(d, S, !!d0); if (!d0) fit();
  }
  function fit() { var w = $('#bd-stage').clientWidth - 24; if (w <= 0) return; var k = Math.min(1, w / 794) * (window.SPBioZoom || 1); $('#bd-doc').style.transform = 'scale(' + k + ')'; $('#bd-sizer').style.height = Math.ceil($('#bd-doc').offsetHeight * k) + 'px'; $('#bd-sizer').style.width = Math.ceil(794 * k) + 'px'; if (window.SPBioPro) window.SPBioPro.fitted(k); }

  // ---------- controls ----------
  function buildControls() {
    $('#bd-type').innerHTML = [['cv', 'resume', 'Resume / CV'], ['job', 'clip', 'Job Bio-Data'], ['marriage', 'rings', 'Marriage Bio-Data']].map(function (t) { return '<button type="button" data-type="' + t[0] + '" aria-pressed="' + (S.type === t[0]) + '">' + ic(t[1]) + t[2] + '</button>'; }).join('');
    $('#bd-lang').innerHTML = [['en', 'English'], ['bn', 'বাংলা'], ['hi', 'हिन्दी']].map(function (t) { return '<button type="button" data-lang="' + t[0] + '" aria-pressed="' + (S.lang === t[0]) + '">' + t[1] + '</button>'; }).join('');
    $('#bd-tpl').innerHTML = TPL.map(function (t) { return '<button type="button" data-tpl="' + t[0] + '" aria-pressed="' + (S.tpl === t[0]) + '"><i class="mini m-' + t[0] + '"></i>' + t[1] + '</button>'; }).join('');
    $('#bd-col').innerHTML = COLORS.map(function (c) { return '<button type="button" data-col="' + c + '" style="background:' + c + '" aria-label="Colour ' + c + '" aria-pressed="' + (S.color === c) + '"></button>'; }).join('') + '<label class="bd-own" title="Any colour"><input type="color" value="' + S.color + '" data-colpick>🎨</label>';
    $('#bd-font').innerHTML = FONTS[S.lang].map(function (f) { return '<option' + ((S.font || FONTS[S.lang][0]) === f ? ' selected' : '') + '>' + f + '</option>'; }).join('');
  }
  function setType(t) { if (t === S.type) return; S.type = t; S.tpl = t === 'marriage' ? 'floral' : t === 'job' ? 'classic' : 'executive'; S.color = t === 'marriage' ? '#be185d' : '#1e3a8a'; if (!S.f.declaration) S.f.declaration = DECL[S.lang]; buildControls(); buildForm(); render(); save(); }
  function bind() {
    $('#bd-form').addEventListener('input', onInput);
    $('#bd-form').addEventListener('click', onClick);
    $('#bd-form').addEventListener('change', function (e) { var t = e.target; if (t.dataset.img && t.files[0]) readImg(t.files[0], t.dataset.img === 'photo' ? 700 : 600, function (u) { S[t.dataset.img] = u; buildForm(); render(); save(); }); });
    $('#bd-app').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.type) setType(b.dataset.type);
      else if (b.dataset.lang) { var old = S.lang; S.lang = b.dataset.lang; S.font = ''; if (!S.f.declaration || S.f.declaration === DECL[old]) S.f.declaration = DECL[S.lang]; buildControls(); buildForm(); render(); save(); }
      else if (b.dataset.tpl) { S.tpl = b.dataset.tpl; buildControls(); render(); save(); }
      else if (b.dataset.col) { S.color = b.dataset.col; buildControls(); render(); save(); }
    });
    $('#bd-app').addEventListener('input', function (e) { if (e.target.hasAttribute('data-colpick')) { S.color = e.target.value; render(); save(); } if (e.target.id === 'bd-font') { S.font = e.target.value; render(); save(); } });
    $('#bd-sample').addEventListener('click', function () { var s = SAMPLE[S.type]; S.f = Object.assign({ declaration: DECL[S.lang] }, s); S.proj = (s.proj || [['', '', '']]).map(function (r) { return r.slice(); }); S.edu = (s.edu || [['', '', '', '']]).map(function (r) { return r.slice(); }); S.exp = (s.exp || [['', '', '', '']]).map(function (r) { return r.slice(); }); S.family = (s.family || [['', '', '']]).map(function (r) { return r.slice(); }); buildForm(); render(); save(); });
    $('#bd-clear').addEventListener('click', function () { if (!window.confirm('Clear all details on this device?')) return; var t = S.type, l = S.lang; S = blank(t); S.lang = l; S.f.declaration = DECL[l]; buildControls(); buildForm(); render(); save(); });
    $('#bd-pdf').addEventListener('click', function () { openExport('pdf'); });
    $('#bd-jpg').addEventListener('click', function () { openExport('jpg'); });
    $('#bd-print').addEventListener('click', function () { window.print(); });
    $$('.bd-tabs button').forEach(function (b) { b.addEventListener('click', function () { document.body.dataset.view = b.dataset.view; $$('.bd-tabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); setTimeout(fit, 50); }); });
    window.addEventListener('resize', fit);
  }
  function fileName() { return (S.f.name || 'My').replace(/[^\wঀ-৿ऀ-ॿ]+/g, '-') + '-' + (S.type === 'cv' ? 'Resume' : 'BioData'); }
  // ---------- download: PDF / JPG / PNG with optional size limit ----------
  function snap() {
    if (!window.html2canvas) return Promise.reject(new Error('still loading, try again in a moment'));
    var clone = $('#bd-doc').cloneNode(true); clone.style.transform = 'none'; clone.id = '';
    var holder = document.createElement('div'); holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px'; holder.appendChild(clone); document.body.appendChild(holder);
    var PH = 1123;
    return (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
      var H = clone.offsetHeight, top0 = clone.getBoundingClientRect().top, cuts = [], breaks = [0], start = 0;
      $$('.sec,.job,tr,.foot,.two,.hd,li', clone).forEach(function (el) { var r = el.getBoundingClientRect(); cuts.push(Math.round(r.top - top0), Math.round(r.bottom - top0)); });
      while (H - start > PH + 2) { var lim = start + PH, best = 0; cuts.forEach(function (c) { if (c > start + 300 && c <= lim && c > best) best = c; }); start = best || lim; breaks.push(start); }
      return window.html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(function (cv) {
        holder.remove();
        var pages = breaks.map(function (y, i) { var y2 = i + 1 < breaks.length ? breaks[i + 1] : H, pc = document.createElement('canvas'); pc.width = 794 * 2; pc.height = PH * 2; var g = pc.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, pc.width, pc.height); g.drawImage(cv, 0, y * 2, cv.width, (y2 - y) * 2, 0, 0, cv.width, (y2 - y) * 2); return pc; });
        return { full: cv, pages: pages };
      });
    }, function (e) { holder.remove(); throw e; });
  }
  function shrink(c, k) { if (k >= 1) return c; var o = document.createElement('canvas'); o.width = Math.max(1, Math.round(c.width * k)); o.height = Math.max(1, Math.round(c.height * k)); var g = o.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, o.width, o.height); return o; }
  function jpgURL(c, q) { return c.toDataURL('image/jpeg', q); }
  function bytes(u) { return Math.round((u.length - u.indexOf(',') - 1) * 3 / 4); }
  var SCALES = [1, 0.85, 0.7, 0.58, 0.48, 0.4, 0.33, 0.27];
  // smallest loss that still fits: try each size step, pick the best quality that fits
  function fit2(limit, measure) {
    for (var i = 0; i < SCALES.length; i++) {
      var k = SCALES[i], lo = 0.3, hi = 0.95, best = null;
      if (measure(k, lo) > limit) continue;
      for (var n = 0; n < 7; n++) { var mid = (lo + hi) / 2; if (measure(k, mid) <= limit) { best = mid; lo = mid; } else hi = mid; }
      return { k: k, q: best || lo };
    }
    return { k: SCALES[SCALES.length - 1], q: 0.3 };
  }
  function makeFile(fmt, kb, snapR) {
    var limit = kb ? kb * 1024 : 0, name = fileName();
    if (fmt === 'pdf') {
      var JP = window.jspdf && window.jspdf.jsPDF; if (!JP) throw new Error('still loading, try again in a moment');
      var cache = {}, measure = function (k, q) { var key = k + '|' + q.toFixed(3); if (!cache[key]) cache[key] = snapR.pages.map(function (p) { return jpgURL(shrink(p, k), q); }); return cache[key].reduce(function (t, u) { return t + bytes(u); }, 0) + 4000 * snapR.pages.length; };
      var pick = limit ? fit2(limit, measure) : { k: 1, q: 0.93 };
      measure(pick.k, pick.q); var urls = cache[pick.k + '|' + pick.q.toFixed(3)];
      var pdf = new JP({ unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'], compress: true });
      urls.forEach(function (u, i) { if (i) pdf.addPage([794, 1123], 'portrait'); pdf.addImage(u, 'JPEG', 0, 0, 794, 1123, undefined, 'FAST'); });
      return { blob: pdf.output('blob'), name: name + '.pdf', pages: urls.length };
    }
    var src = snapR.pages.length > 1 && fmt !== 'pdf' ? snapR.full : snapR.pages[0], u;
    if (fmt === 'png') {
      for (var i = 0; i < SCALES.length; i++) { u = shrink(src, SCALES[i]).toDataURL('image/png'); if (!limit || bytes(u) <= limit) break; }
    } else {
      var p2 = limit ? fit2(limit, function (k, q) { return bytes(jpgURL(shrink(src, k), q)); }) : { k: 1, q: 0.93 };
      u = jpgURL(shrink(src, p2.k), p2.q);
    }
    var bin = atob(u.split(',')[1]), arr = new Uint8Array(bin.length); for (var j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
    return { blob: new Blob([arr], { type: fmt === 'png' ? 'image/png' : 'image/jpeg' }), name: name + (fmt === 'png' ? '.png' : '.jpg') };
  }
  function human(n) { return n >= 1048576 ? (n / 1048576).toFixed(2) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function openExport(fmt) {
    var m = $('#bd-exp'); if (!m) {
      m = document.createElement('div'); m.id = 'bd-exp'; m.className = 'bd-modal';
      m.innerHTML = '<div class="bd-sheet" role="dialog" aria-modal="true" aria-labelledby="bd-exp-h"><h2 id="bd-exp-h">Download your file</h2>' +
        '<div class="bd-lbl">File type</div><div class="bd-seg" id="bd-exp-fmt">' + [['pdf', 'PDF', 'pdf'], ['jpg', 'JPG', 'image'], ['png', 'PNG', 'image']].map(function (f) { return '<button type="button" data-fmt="' + f[0] + '">' + ic(f[2]) + f[1] + '</button>'; }).join('') + '</div>' +
        '<div class="bd-lbl">File size (compress)</div><div class="bd-seg" id="bd-exp-kb">' + [[0, 'Best quality'], [2048, 'Under 2 MB'], [1024, 'Under 1 MB'], [500, 'Under 500 KB'], [300, 'Under 300 KB'], [200, 'Under 200 KB'], [100, 'Under 100 KB'], [50, 'Under 50 KB']].map(function (k) { return '<button type="button" data-kb="' + k[0] + '">' + k[1] + '</button>'; }).join('') +
        '<label class="bd-kbin">' + ic('zip') + 'Other: <input type="number" min="20" max="10000" step="10" id="bd-exp-own" placeholder="KB"> KB</label></div>' +
        '<p class="bd-note" id="bd-exp-note"></p><div class="bd-exp-act"><button type="button" class="bd-mini" data-close>' + ic('x') + 'Cancel</button><button type="button" class="bd-go" id="bd-exp-go">' + ic('download') + '<span>Download</span></button></div></div>';
      document.body.appendChild(m);
      m.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (e.target === m || (b && b.hasAttribute('data-close'))) { m.hidden = true; return; }
        if (!b) return;
        if (b.dataset.fmt) { m.dataset.fmt = b.dataset.fmt; sync(); }
        else if (b.dataset.kb != null) { m.dataset.kb = b.dataset.kb; $('#bd-exp-own').value = ''; sync(); }
        else if (b.id === 'bd-exp-go') go();
      });
      $('#bd-exp-own').addEventListener('input', function () { m.dataset.kb = this.value || 0; sync(); });
    }
    var sync = function () {
      $$('#bd-exp-fmt button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.fmt === m.dataset.fmt); });
      $$('#bd-exp-kb button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.kb === String(m.dataset.kb) && !$('#bd-exp-own').value); });
      $('#bd-exp-note').textContent = m.dataset.fmt === 'png' ? 'PNG keeps every detail but is bigger. For small size choose JPG or PDF.' : (+m.dataset.kb ? 'The file is made as sharp as possible while staying under ' + human(+m.dataset.kb * 1024) + '.' : 'Sharpest file, best for printing.');
    };
    var go = function () {
      var btn = $('#bd-exp-go'), lab = btn.querySelector('span'); btn.disabled = true; btn.classList.add('busy'); lab.textContent = 'Making…';
      setTimeout(function () {
        snap().then(function (r) {
          var out = makeFile(m.dataset.fmt, +m.dataset.kb || 0, r), a = document.createElement('a'), url = URL.createObjectURL(out.blob);
          a.href = url; a.download = out.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
          $('#bd-exp-note').textContent = '✅ Saved ' + out.name + ' — ' + human(out.blob.size) + (out.pages > 1 ? ' (' + out.pages + ' pages)' : '');
          toast('Downloaded — ' + human(out.blob.size));
        }).catch(function (e) { $('#bd-exp-note').textContent = 'Could not make the file: ' + (e && e.message || e); })
          .then(function () { btn.disabled = false; btn.classList.remove('busy'); lab.textContent = 'Download'; });
      }, 30);
    };
    m.dataset.fmt = fmt; if (m.dataset.kb == null) m.dataset.kb = 0; m.hidden = false; sync();
  }
  var tt; function toast(m) { var e = $('#bd-toast'); e.textContent = m; e.hidden = false; clearTimeout(tt); tt = setTimeout(function () { e.hidden = true; }, 3500); }

  // ---------- start ----------
  var q = new URLSearchParams(location.search), qt = q.get('type'), ql = q.get('lang');
  S = load() || blank(qt || 'cv');
  if (qt && TY[qt] && qt !== S.type) { S.type = qt; S.tpl = qt === 'marriage' ? 'floral' : qt === 'job' ? 'classic' : 'executive'; S.color = qt === 'marriage' ? '#be185d' : '#1e3a8a'; }
  if (ql && FONTS[ql]) S.lang = ql;
  if (!S.f.declaration) S.f.declaration = DECL[S.lang];
  ['edu', 'exp', 'family', 'extra', 'proj'].forEach(function (k) { if (!Array.isArray(S[k])) S[k] = []; });
  [['#bd-pdf', 'download', 'Download'], ['#bd-jpg', 'image', 'JPG / PNG'], ['#bd-print', 'printer', 'Print'], ['#bd-sample', 'sparkle', 'Fill sample details'], ['#bd-clear', 'trash', 'Clear all'], ['.bd-tabs [data-view="edit"]', 'pen', 'Fill details'], ['.bd-tabs [data-view="preview"]', 'eye', 'Preview & download']].forEach(function (b) { var e = $(b[0]); if (e) e.innerHTML = ic(b[1]) + '<span>' + esc(b[2]) + '</span>'; });
  buildControls(); buildForm(); bind(); render();
  if (document.fonts) document.fonts.ready.then(fit);
  window.SPBioData = { state: function () { return S; }, render: render, fit: fit, save: save, T: T, ic: ic, esc: esc, lines: lines, toast: toast, openExport: openExport, TPL: TPL, sample: function () { $('#bd-sample').click(); },
    set: function (o) { if (!o || !o.f) return; S = o; if (!TY[S.type]) S.type = 'cv'; if (!FONTS[S.lang]) S.lang = 'en'; ['edu', 'exp', 'family', 'extra', 'proj'].forEach(function (k) { if (!Array.isArray(S[k])) S[k] = []; }); buildControls(); buildForm(); render(); save(); },
    refresh: function () { buildControls(); buildForm(); render(); save(); } };
  if (window.SPBioPro) window.SPBioPro.start(window.SPBioData);
})();
