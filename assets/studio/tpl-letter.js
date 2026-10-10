/* S Printer — Application letter templates (English & Hindi), original wording */
(function () {
  'use strict';
  var ST = window.SPStudio, K = ST.K, R = K.R, T = K.T, L = K.L, P = K.P;
  var EN = { to: 'To,', date: 'Date', sub: 'Subject', sal: 'Respected Sir / Madam,', close: 'Yours faithfully,', mob: 'Mobile', name: 'Name' };
  var HI = { to: 'सेवा में,', date: 'दिनांक', sub: 'विषय', sal: 'महोदय / महोदया,', close: 'भवदीय / प्रार्थी,', mob: 'मोबाइल', name: 'नाम' };
  var LETTERS = [
    // Request / leave
    ['leave-office', 'Leave application (office)', 'Request/Leave', 'en', 'Application for leave from {{FROM_DATE}} to {{TO_DATE}}',
      'I am {{FULL_NAME}}, working as {{POST}} (Employee ID: {{EMP_ID}}) in your esteemed organisation. I request you to kindly grant me leave for {{DAYS}} days from {{FROM_DATE}} to {{TO_DATE}} because {{REASON}}.\n\nI will complete my pending work before leaving and hand over urgent tasks to my colleague. I will be available on my mobile number for anything important.\n\nKindly grant me leave for the above period. I shall be thankful to you.'],
    ['leave-office-hi', 'अवकाश हेतु प्रार्थना पत्र (कार्यालय)', 'Request/Leave', 'hi', '{{FROM_DATE}} से {{TO_DATE}} तक अवकाश हेतु प्रार्थना पत्र',
      'सविनय निवेदन है कि मैं {{FULL_NAME}}, आपके कार्यालय में {{POST}} पद पर कार्यरत हूँ (कर्मचारी संख्या: {{EMP_ID}})। {{REASON}} के कारण मुझे {{FROM_DATE}} से {{TO_DATE}} तक कुल {{DAYS}} दिन का अवकाश चाहिए।\n\nमैं जाने से पहले अपना आवश्यक कार्य पूर्ण करके सहकर्मी को सौंप दूँगा/दूँगी। आवश्यकता होने पर मैं मोबाइल पर उपलब्ध रहूँगा/रहूँगी।\n\nअतः आपसे निवेदन है कि मुझे उपरोक्त अवधि का अवकाश प्रदान करने की कृपा करें। आपकी अति कृपा होगी।'],
    ['sick-school', 'Sick leave (school)', 'School/College', 'en', 'Application for sick leave',
      'With due respect, I beg to state that my ward {{STUDENT}}, student of class {{CLASS}} (Roll No. {{ROLL_NO}}), is suffering from {{REASON}} and the doctor has advised rest. Therefore, {{STUDENT}} will not be able to attend school from {{FROM_DATE}} to {{TO_DATE}}.\n\nKindly grant leave for {{DAYS}} days. The pending class work will be completed after joining.\n\nThanking you.'],
    ['sick-school-hi', 'बीमारी अवकाश (विद्यालय)', 'School/College', 'hi', 'बीमारी के कारण अवकाश हेतु प्रार्थना पत्र',
      'सविनय निवेदन है कि मेरा/मेरी पुत्र/पुत्री {{STUDENT}}, कक्षा {{CLASS}} (रोल नं. {{ROLL_NO}}) का विद्यार्थी है। {{REASON}} होने के कारण डॉक्टर ने आराम की सलाह दी है, इसलिए वह {{FROM_DATE}} से {{TO_DATE}} तक विद्यालय नहीं आ सकेगा/सकेगी।\n\nअतः कृपया {{DAYS}} दिन का अवकाश प्रदान करें। छूटा हुआ कार्य विद्यालय आने के बाद पूरा कर लिया जाएगा।\n\nधन्यवाद।'],
    ['tc', 'Transfer certificate (TC) request', 'School/College', 'en', 'Request for Transfer Certificate',
      'With due respect, I request you to kindly issue the Transfer Certificate of my ward {{STUDENT}}, student of class {{CLASS}} (Roll No. {{ROLL_NO}}) of {{SCHOOL}}. We are shifting to another place because {{REASON}}.\n\nAll school dues have been cleared. Kindly issue the Transfer Certificate and the character certificate at the earliest.\n\nThanking you.'],
    ['fee-concession', 'Fee concession request', 'School/College', 'en', 'Request for fee concession',
      'With due respect, I am the parent of {{STUDENT}}, student of class {{CLASS}} (Roll No. {{ROLL_NO}}). Due to {{REASON}}, our family income is very limited and it has become difficult to pay the full school fee.\n\n{{STUDENT}} is regular and sincere in studies. I humbly request you to grant a fee concession so that the studies can continue without a break.\n\nI shall be grateful to you.'],
    ['character', 'Character certificate request', 'School/College', 'en', 'Request for character certificate',
      'I, {{FULL_NAME}}, was a student of {{SCHOOL}} in class/course {{CLASS}} (Roll No. {{ROLL_NO}}). I need a character certificate for {{REASON}}.\n\nKindly issue my character certificate at the earliest. I shall be thankful to you.'],
    // Bank & post office
    ['atm-block', 'ATM / debit card block', 'Bank & Post', 'en', 'Request to block ATM / debit card — A/c No. {{ACCOUNT_NO}}',
      'I am {{FULL_NAME}}, holding savings account number {{ACCOUNT_NO}} at your {{BRANCH}} branch. My ATM / debit card has been {{REASON}} on {{FROM_DATE}}.\n\nI request you to block the card immediately so that no misuse can happen, and to issue a new card to my registered address.\n\nKindly do the needful.'],
    ['mobile-update', 'Mobile number update', 'Bank & Post', 'en', 'Request to update mobile number — A/c No. {{ACCOUNT_NO}}',
      'I, {{FULL_NAME}}, hold account number {{ACCOUNT_NO}} at {{BANK_NAME}}, {{BRANCH}} branch. Kindly update my registered mobile number to {{PHONE}} in place of the old number, which is no longer in use.\n\nA self-attested copy of my Aadhaar card is attached for KYC. Kindly update the number at the earliest.'],
    ['mobile-update-hi', 'मोबाइल नंबर बदलने हेतु (बैंक)', 'Bank & Post', 'hi', 'खाते में मोबाइल नंबर बदलने हेतु प्रार्थना पत्र — खाता सं. {{ACCOUNT_NO}}',
      'सविनय निवेदन है कि मेरा {{BANK_NAME}}, शाखा {{BRANCH}} में खाता संख्या {{ACCOUNT_NO}} है। मेरा पुराना मोबाइल नंबर अब बंद हो चुका है, अतः कृपया मेरे खाते में नया मोबाइल नंबर {{PHONE}} दर्ज करने की कृपा करें।\n\nकेवाईसी हेतु आधार कार्ड की स्वप्रमाणित प्रति संलग्न है। आपकी अति कृपा होगी।'],
    ['cheque', 'Cheque book request', 'Bank & Post', 'en', 'Request for a new cheque book — A/c No. {{ACCOUNT_NO}}',
      'I, {{FULL_NAME}}, hold account number {{ACCOUNT_NO}} at your {{BRANCH}} branch. Kindly issue me a new cheque book with {{DAYS}} leaves.\n\nKindly debit the charges, if any, from my account.'],
    ['statement', 'Bank statement request', 'Bank & Post', 'en', 'Request for account statement — A/c No. {{ACCOUNT_NO}}',
      'I, {{FULL_NAME}}, hold account number {{ACCOUNT_NO}} at {{BANK_NAME}}, {{BRANCH}} branch. Kindly provide my account statement from {{FROM_DATE}} to {{TO_DATE}}, as it is required for {{REASON}}.\n\nKindly debit the charges, if any, from my account.'],
    ['closure', 'Account closure request', 'Bank & Post', 'en', 'Request to close account — A/c No. {{ACCOUNT_NO}}',
      'I, {{FULL_NAME}}, hold account number {{ACCOUNT_NO}} at your {{BRANCH}} branch. I wish to close this account because {{REASON}}.\n\nKindly close the account and transfer / pay the remaining balance to me. The unused cheque leaves and debit card are returned herewith.'],
    ['po-address', 'Post office: address change', 'Bank & Post', 'en', 'Request to change address in my account — No. {{ACCOUNT_NO}}',
      'I, {{FULL_NAME}}, hold account / policy number {{ACCOUNT_NO}} at your post office. I have shifted to a new address: {{ADDRESS}}.\n\nKindly update the new address in my records. A self-attested copy of my address proof is attached.'],
    // Company
    ['job', 'Job application', 'Company', 'en', 'Application for the post of {{POST}}',
      'I came to know that your company {{COMPANY}} has a vacancy for the post of {{POST}}. I wish to apply for it.\n\nI have completed {{QUALIFICATION}} and have {{EXPERIENCE_YRS}} of experience. I am hard-working, punctual and good at working in a team. My resume is attached for your kind consideration.\n\nI request you to give me an opportunity for an interview. I assure you that I will work with full dedication.'],
    ['resign', 'Resignation letter', 'Company', 'en', 'Resignation from the post of {{POST}}',
      'I, {{FULL_NAME}} (Employee ID: {{EMP_ID}}), working as {{POST}}, hereby resign from my position because {{REASON}}. As per the notice period, my last working day will be {{TO_DATE}}.\n\nI thank you and the team for the support and learning I received here. I will complete a smooth handover of all my work before leaving.\n\nKindly accept my resignation.'],
    ['salary-cert', 'Salary certificate request', 'Company', 'en', 'Request for salary certificate',
      'I, {{FULL_NAME}} (Employee ID: {{EMP_ID}}), am working as {{POST}} in {{COMPANY}}. I need a salary certificate for {{REASON}}.\n\nKindly issue the salary certificate at the earliest. I shall be thankful to you.'],
    // Sarkari vibhag
    ['bijli', 'Electricity complaint (बिजली विभाग)', 'Sarkari Vibhag', 'hi', 'बिजली आपूर्ति बाधित होने की शिकायत',
      'सविनय निवेदन है कि हमारे क्षेत्र {{ADDRESS}} में {{FROM_DATE}} से बिजली की आपूर्ति ठीक से नहीं हो रही है। {{REASON}} के कारण क्षेत्रवासियों को बहुत परेशानी हो रही है।\n\nमेरा उपभोक्ता क्रमांक / के. नं. {{ACCOUNT_NO}} है। अतः आपसे निवेदन है कि शीघ्र आवश्यक कार्यवाही कर बिजली आपूर्ति सुचारू करवाने की कृपा करें।'],
    ['pani', 'Water supply complaint', 'Sarkari Vibhag', 'en', 'Complaint about irregular water supply',
      'I, {{FULL_NAME}}, resident of {{ADDRESS}}, wish to bring to your notice that the water supply in our area has been irregular since {{FROM_DATE}}. {{REASON}}.\n\nMy connection number is {{ACCOUNT_NO}}. Kindly take necessary action at the earliest so that regular water supply is restored.'],
    ['rti', 'RTI application (Section 6(1))', 'Sarkari Vibhag', 'en', 'Application under Section 6(1) of the Right to Information Act, 2005',
      'I, {{FULL_NAME}}, a citizen of India, request the following information under the RTI Act, 2005:\n\n{{REASON}}\n\nPeriod: {{FROM_DATE}} to {{TO_DATE}}.\n\nThe application fee has been paid by {{FEE_MODE}}. I request that the information be provided within the time limit prescribed under the Act.'],
    ['ration', 'Ration card: add a family member', 'Sarkari Vibhag', 'hi', 'राशन कार्ड में परिवार के सदस्य का नाम जोड़ने हेतु',
      'सविनय निवेदन है कि मेरा राशन कार्ड क्रमांक {{ACCOUNT_NO}} है। मेरे परिवार के सदस्य {{STUDENT}} का नाम राशन कार्ड में दर्ज नहीं है। {{REASON}}\n\nआवश्यक दस्तावेज (आधार कार्ड आदि) संलग्न हैं। अतः कृपया उक्त सदस्य का नाम राशन कार्ड में जोड़ने की कृपा करें।'],
    ['police-lost', 'Lost document / mobile report (police)', 'Sarkari Vibhag', 'en', 'Report of lost {{REASON}}',
      'I, {{FULL_NAME}}, son/daughter of {{FATHER}}, resident of {{ADDRESS}}, wish to report that my {{REASON}} was lost on {{FROM_DATE}} near {{TO_ADDRESS}}.\n\nI have searched for it but could not find it. Kindly register my report and give me a copy, so that I can apply for a duplicate and no one can misuse it.'],
    ['general-hi', 'सामान्य प्रार्थना पत्र', 'Sarkari Vibhag', 'hi', '{{SUBJECT}}',
      'सविनय निवेदन है कि {{REASON}}\n\nअतः आपसे निवेदन है कि उपरोक्त विषय पर शीघ्र आवश्यक कार्यवाही करने की कृपा करें। आपकी अति कृपा होगी।'],
    ['general-en', 'General application', 'Request/Leave', 'en', '{{SUBJECT}}',
      'With due respect, I wish to state that {{REASON}}\n\nKindly look into the matter and do the needful at the earliest. I shall be thankful to you.']
  ];

  var SAMPLE = {
    'leave-office': { TO_TITLE: 'The Manager', TO_OFFICE: 'Shree Traders Pvt. Ltd.', TO_ADDRESS: 'Jaipur', REASON: 'I have to attend my sister’s wedding', DAYS: '3' },
    'leave-office-hi': { TO_TITLE: 'प्रबंधक महोदय', TO_OFFICE: 'श्री ट्रेडर्स प्रा. लि.', TO_ADDRESS: 'जयपुर', REASON: 'बहन के विवाह', DAYS: '3' },
    'sick-school': { TO_TITLE: 'The Principal', TO_OFFICE: 'Sunrise Public School', TO_ADDRESS: 'Jaipur', REASON: 'viral fever', DAYS: '3' },
    'sick-school-hi': { TO_TITLE: 'प्रधानाचार्य महोदय', TO_OFFICE: 'सनराइज पब्लिक स्कूल', TO_ADDRESS: 'जयपुर', REASON: 'तेज बुखार', DAYS: '3' },
    'tc': { TO_TITLE: 'The Principal', TO_OFFICE: 'Sunrise Public School', TO_ADDRESS: 'Jaipur', REASON: 'my father has been transferred to Ajmer' },
    'fee-concession': { TO_TITLE: 'The Principal', TO_OFFICE: 'Sunrise Public School', TO_ADDRESS: 'Jaipur', REASON: 'loss in our small business this year' },
    'character': { TO_TITLE: 'The Principal', TO_OFFICE: 'Sunrise Public School', TO_ADDRESS: 'Jaipur', REASON: 'admission to college' },
    'atm-block': { TO_TITLE: 'The Branch Manager', TO_OFFICE: 'State Bank of India', TO_ADDRESS: 'Jaipur', REASON: 'lost' },
    'mobile-update': { TO_TITLE: 'The Branch Manager', TO_OFFICE: 'State Bank of India', TO_ADDRESS: 'Jaipur' },
    'mobile-update-hi': { TO_TITLE: 'शाखा प्रबंधक महोदय', TO_OFFICE: 'भारतीय स्टेट बैंक', TO_ADDRESS: 'जयपुर' },
    'cheque': { TO_TITLE: 'The Branch Manager', TO_OFFICE: 'State Bank of India', TO_ADDRESS: 'Jaipur', DAYS: '25' },
    'statement': { TO_TITLE: 'The Branch Manager', TO_OFFICE: 'State Bank of India', TO_ADDRESS: 'Jaipur', REASON: 'my loan application' },
    'closure': { TO_TITLE: 'The Branch Manager', TO_OFFICE: 'State Bank of India', TO_ADDRESS: 'Jaipur', REASON: 'I have shifted to another city' },
    'po-address': { TO_TITLE: 'The Postmaster', TO_OFFICE: 'Head Post Office', TO_ADDRESS: 'Jaipur' },
    'job': { TO_TITLE: 'The HR Manager', TO_OFFICE: 'Shree Traders Pvt. Ltd.', TO_ADDRESS: 'Jaipur' },
    'resign': { TO_TITLE: 'The Manager', TO_OFFICE: 'Shree Traders Pvt. Ltd.', TO_ADDRESS: 'Jaipur', REASON: 'I have received a better opportunity' },
    'salary-cert': { TO_TITLE: 'The HR Manager', TO_OFFICE: 'Shree Traders Pvt. Ltd.', TO_ADDRESS: 'Jaipur', REASON: 'my home loan application' },
    'bijli': { TO_TITLE: 'सहायक अभियंता महोदय', TO_OFFICE: 'विद्युत वितरण निगम', TO_ADDRESS: 'जयपुर', REASON: 'बार-बार बिजली कटौती और कम वोल्टेज' },
    'pani': { TO_TITLE: 'The Assistant Engineer', TO_OFFICE: 'Public Health Engineering Department', TO_ADDRESS: 'Jaipur', REASON: 'Water comes only for a few minutes and is often dirty' },
    'rti': { TO_TITLE: 'The Public Information Officer', TO_OFFICE: 'Office of the Municipal Corporation', TO_ADDRESS: 'Jaipur', REASON: '1. Copy of the sanction order and expenditure for the road work in Ward No. 12.\n2. Name of the contractor and the date of completion.' },
    'ration': { TO_TITLE: 'जिला रसद अधिकारी महोदय', TO_OFFICE: 'जिला रसद कार्यालय', TO_ADDRESS: 'जयपुर', REASON: 'उसका जन्म / विवाह के बाद परिवार में आगमन हुआ है।' },
    'police-lost': { TO_TITLE: 'The SHO', TO_OFFICE: 'Police Station, Vidhyadhar Nagar', TO_ADDRESS: 'the bus stand', REASON: 'Aadhaar card' },
    'general-hi': { TO_TITLE: 'माननीय अधिकारी महोदय', TO_OFFICE: 'नगर निगम कार्यालय', TO_ADDRESS: 'जयपुर', SUBJECT: 'गली में सफाई करवाने हेतु', REASON: 'हमारी गली में कई दिनों से सफाई नहीं हुई है, जिससे बीमारियाँ फैलने का खतरा है।' },
    'general-en': { TO_TITLE: 'The Officer', TO_OFFICE: 'Municipal Corporation', TO_ADDRESS: 'Jaipur', SUBJECT: 'Request for street light repair', REASON: 'the street lights in our lane have not been working for two weeks.' }
  };
  var STYLES = ['plain', 'head', 'border'];
  function build(W, H, p, letter, style) {
    var u = W / 794, lang = letter[3] === 'hi' ? HI : EN, f = letter[3] === 'hi' ? 'Hind' : 'Poppins', ink = '#111827', o = [], x = 80 * u, w = W - 160 * u, y = 70 * u;
    if (style === 'head') {
      o.push(R(0, 0, W, 120 * u, p.a)); o.push(R(0, 120 * u, W, 5 * u, p.acc));
      o.push(T(x, 28 * u, w, '{{FULL_NAME}}', 30 * u, { font: 'Montserrat', bold: 800, color: '#fff' }));
      o.push(T(x, 72 * u, w, '{{ADDRESS}}  ·  ☎ {{PHONE}}', 13.5 * u, { color: '#e2e8f0', font: f }));
      y = 160 * u;
    } else if (style === 'border') {
      o.push(R(36 * u, 36 * u, W - 72 * u, H - 72 * u, null, { stroke: p.a, sw: 2 * u })); o.push(R(44 * u, 44 * u, W - 88 * u, H - 88 * u, null, { stroke: p.d, sw: 0.8 * u }));
      y = 90 * u;
    }
    o.push(T(x, y, w * 0.6, lang.to + '\n{{TO_TITLE}}\n{{TO_OFFICE}}\n{{TO_ADDRESS}}', 15 * u, { font: f, color: ink, lh: 1.5 }));
    o.push(T(x + w * 0.6, y, w * 0.4, lang.date + ': {{DATE}}', 15 * u, { font: f, color: ink, align: 'right' }));
    o.push(T(x, y + 150 * u, w, lang.sub + ': ' + letter[4], 15.5 * u, { font: f, bold: 700, color: ink, lh: 1.4, u: false }));
    o.push(L(x, y + 200 * u, x + 120 * u, y + 200 * u, p.b, 2 * u));
    o.push(T(x, y + 220 * u, w, lang.sal, 15 * u, { font: f, color: ink }));
    o.push(T(x, y + 256 * u, w, letter[5], 16 * u, { font: f, color: ink, lh: 1.7, align: 'left' }));
    var cy = H - 260 * u;
    o.push(T(x + w - 300 * u, cy, 300 * u, lang.close, 15 * u, { font: f, color: ink }));
    o.push(P(x + w - 300 * u, cy + 30 * u, 220 * u, 62 * u, 'SIGN', { fill: '#ffffff', label: 'Signature' }));
    o.push(T(x + w - 300 * u, cy + 100 * u, 300 * u, '{{FULL_NAME}}\n{{ADDRESS}}\n' + lang.mob + ': {{PHONE}}', 14 * u, { font: f, color: ink, lh: 1.5 }));
    o.push(T(x, cy + 40 * u, w * 0.5, (letter[3] === 'hi' ? 'स्थान' : 'Place') + ': {{PLACE}}', 14 * u, { font: f, color: ink }));
    return { pages: [{ bg: '#ffffff', objects: o }] };
  }
  var out = [];
  LETTERS.forEach(function (lt, i) {
    var style = STYLES[i % 3], pk = ['blue', 'slate', 'teal', 'maroon'][i % 4];
    out.push({ id: 'ap-' + lt[0], name: lt[1], cat: lt[2], sizes: ['a4p'], pal: K.PAL[pk], vals: SAMPLE[lt[0]], build: function (W, H, p) { return build(W, H, p, lt, style); } });
  });
  ST.register(out);
})();
