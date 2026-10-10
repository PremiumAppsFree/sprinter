// Build step (runs in GitHub Actions only): the published site gets compacted, obfuscated
// copies of S Printer's own scripts. The readable sources stay in the repository.
const fs = require('fs'), path = require('path');
const JO = require('javascript-obfuscator');
const root = process.argv[2] || '_site';
const files = [
  'assets/sprinter/sprinter.js', 'assets/sprinter/home.js', 'assets/cardprint/cardprint.js',
  'assets/sigverify/sigverify.js', 'assets/bgremove/bgremove.js', 'assets/passport/passport.js',
  'assets/sheet/sheet.js', 'assets/sizer/sizer.js', 'assets/payqr/payqr.js',
  'assets/studio/studio.js', 'assets/studio/studio-id.js'
];
const opts = {
  compact: true, simplify: true, target: 'browser',
  identifierNamesGenerator: 'hexadecimal', renameGlobals: false,
  stringArray: true, stringArrayThreshold: 0.75, stringArrayEncoding: ['base64'],
  stringArrayRotate: true, stringArrayShuffle: true, stringArrayWrappersCount: 1,
  splitStrings: false, controlFlowFlattening: false, deadCodeInjection: false,
  selfDefending: false, debugProtection: false, transformObjectKeys: false,
  unicodeEscapeSequence: false, numbersToExpressions: false
};
let n = 0;
for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { console.log('skip', f); continue; }
  const src = fs.readFileSync(p, 'utf8');
  const out = JO.obfuscate(src, opts).getObfuscatedCode();
  fs.writeFileSync(p, '/* S Printer · (c) RAJ */\n' + out);
  n++; console.log('protected', f, src.length, '→', out.length);
}
console.log(n, 'scripts protected');
