/* S Printer — PDF digital signature check (e-Aadhaar, e-PAN, DigiLocker and other signed PDFs)
 *
 * Runs fully in the browser. For every signature in the PDF it checks:
 *   1. the signed byte ranges still match the hash inside the signature (nothing was edited),
 *   2. the signature covers the whole file (nothing was added after signing),
 *   3. the RSA signature is correct for the signer certificate,
 *   4. the certificate chain ends at an official India PKI root (CCA India) and every
 *      certificate was valid at the time of signing.
 * Only when all four pass is the result "valid"; then paint() draws the green tick on the
 * signature box, the same way Adobe Reader does after it validates a signature.
 * If anything fails the original box (with its "?") is left untouched.
 * Needs forge.min.js and roots.js. Designed & developed by Raj. */
(function () {
  'use strict';
  var forge = window.forge;
  var OID = {
    signedData: '1.2.840.113549.1.7.2', data: '1.2.840.113549.1.7.1',
    contentType: '1.2.840.113549.1.9.3', messageDigest: '1.2.840.113549.1.9.4', signingTime: '1.2.840.113549.1.9.5',
    tsToken: '1.2.840.113549.1.9.16.2.14',
    sha1: '1.3.14.3.2.26', sha256: '2.16.840.1.101.3.4.2.1', sha384: '2.16.840.1.101.3.4.2.2', sha512: '2.16.840.1.101.3.4.2.3',
    rsa: '1.2.840.113549.1.1.1', sha1Rsa: '1.2.840.113549.1.1.5', sha256Rsa: '1.2.840.113549.1.1.11',
    sha384Rsa: '1.2.840.113549.1.1.12', sha512Rsa: '1.2.840.113549.1.1.13'
  };
  var HASH = {}; HASH[OID.sha1] = 'sha1'; HASH[OID.sha256] = 'sha256'; HASH[OID.sha384] = 'sha384'; HASH[OID.sha512] = 'sha512';
  HASH[OID.sha1Rsa] = 'sha1'; HASH[OID.sha256Rsa] = 'sha256'; HASH[OID.sha384Rsa] = 'sha384'; HASH[OID.sha512Rsa] = 'sha512';
  var SUBTLE = { sha1: 'SHA-1', sha256: 'SHA-256', sha384: 'SHA-384', sha512: 'SHA-512' };

  var roots = null;
  function trustedRoots() {
    if (roots) return roots;
    roots = [];
    (window.SP_TRUSTED_ROOTS || []).forEach(function (pem) { try { roots.push(forge.pki.certificateFromPem(pem)); } catch (e) {} });
    return roots;
  }

  // ---------- small helpers ----------
  var latin = function (u8, a, b) { var s = '', i, CH = 0x8000; for (i = a; i < b; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, Math.min(b, i + CH))); return s; };
  function bytesToBin(u8) { return latin(u8, 0, u8.length); }
  function binToBytes(s) { var u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; }
  async function digest(alg, parts) {
    var n = 0; parts.forEach(function (p) { n += p.length; });
    var all = new Uint8Array(n), o = 0; parts.forEach(function (p) { all.set(p, o); o += p.length; });
    if (window.crypto && crypto.subtle) {
      try { return bytesToBin(new Uint8Array(await crypto.subtle.digest(SUBTLE[alg], all))); } catch (e) {}
    }
    var md = forge.md[alg].create(); md.update(bytesToBin(all)); return md.digest().getBytes();
  }
  function mdOf(alg, bin) { var md = forge.md[alg].create(); md.update(bin); return md; }
  function attr(cert, short) { var a = cert && cert.subject.getField(short); return a ? String(a.value) : ''; }
  function issuerAttr(cert, short) { var a = cert && cert.issuer.getField(short); return a ? String(a.value) : ''; }
  function nameOf(cert) { return attr(cert, 'CN') || attr(cert, 'O') || 'Unknown'; }
  function sameName(a, b) { return !!(a && b && a.hash && a.hash === b.hash); }
  function derOf(cert) { return forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes(); }
  function within(cert, when) { return when >= cert.validity.notBefore && when <= cert.validity.notAfter; }
  function pdfDate(s) {
    var m = /D:(\d{4})(\d\d)?(\d\d)?(\d\d)?(\d\d)?(\d\d)?([Z+\-])?(\d\d)?'?(\d\d)?/.exec(s || '');
    if (!m) return null;
    var d = Date.UTC(+m[1], (+m[2] || 1) - 1, +m[3] || 1, +m[4] || 0, +m[5] || 0, +m[6] || 0);
    if (m[7] === '+' || m[7] === '-') d -= (m[7] === '+' ? 1 : -1) * ((+m[8] || 0) * 60 + (+m[9] || 0)) * 60000;
    return new Date(d);
  }


  // ---------- PDF strings (literal / hex) ----------
  function readPdfString(text, pos) {
    while (pos < text.length && /\s/.test(text[pos])) pos++;
    if (text[pos] === '(') {
      var out = '', depth = 1, i = pos + 1;
      while (i < text.length && depth > 0) {
        var c = text[i];
        if (c === '\\') {
          var n = text[i + 1];
          var map = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
          if (map[n] !== undefined) { out += map[n]; i += 2; continue; }
          if (n === '\r') { i += text[i + 2] === '\n' ? 3 : 2; continue; }
          if (n === '\n') { i += 2; continue; }
          var oct = /^[0-7]{1,3}/.exec(text.slice(i + 1, i + 4));
          if (oct) { out += String.fromCharCode(parseInt(oct[0], 8) & 255); i += 1 + oct[0].length; continue; }
          i++; continue;
        }
        if (c === '(') depth++;
        if (c === ')') { depth--; if (!depth) break; }
        out += c; i++;
      }
      return out;
    }
    if (text[pos] === '<' && text[pos + 1] !== '<') {
      var end = text.indexOf('>', pos), hx = text.slice(pos + 1, end).replace(/[^0-9a-fA-F]/g, '');
      if (hx.length % 2) hx += '0';
      return forge.util.hexToBytes(hx);
    }
    return null;
  }
  function dictString(dict, key) {
    var r = new RegExp('\\/' + key + '(?![A-Za-z0-9#])').exec(dict);
    return r ? readPdfString(dict, r.index + r[0].length) : null;
  }
  function decodeText(b) {
    if (b == null) return '';
    if (b.charCodeAt(0) === 0xfe && b.charCodeAt(1) === 0xff) { var o = ''; for (var i = 2; i + 1 < b.length; i += 2) o += String.fromCharCode((b.charCodeAt(i) << 8) | b.charCodeAt(i + 1)); return o; }
    if (b.charCodeAt(0) === 0xef && b.charCodeAt(1) === 0xbb && b.charCodeAt(2) === 0xbf) { try { return decodeURIComponent(escape(b.slice(3))); } catch (e) {} }
    return b;
  }
  function objectText(text, num, gen) {
    var re = new RegExp('(^|[^0-9])' + num + '\\s+' + gen + '\\s+obj'), m, last = -1, rx = new RegExp(re.source, 'g');
    while ((m = rx.exec(text))) last = m.index + m[1].length;
    if (last < 0) return null;
    var end = text.indexOf('endobj', last);
    return text.slice(last, end < 0 ? text.length : end);
  }

  // ---------- standard security handler (to read the date of a password-protected signed PDF) ----------
  var PAD = forge ? forge.util.hexToBytes('28BF4E5E4E758A4164004E56FFFA01082E2E00B6D0683E802F0CA9FE6453697A') : '';
  function md5(b) { var m = forge.md.md5.create(); m.update(b); return m.digest().getBytes(); }
  function shaN(n, b) { var m = forge.md['sha' + n].create(); m.update(b); return m.digest().getBytes(); }
  function rc4(key, data) {
    var S = [], i, j = 0, t, out = '';
    for (i = 0; i < 256; i++) S[i] = i;
    for (i = 0; i < 256; i++) { j = (j + S[i] + key.charCodeAt(i % key.length)) & 255; t = S[i]; S[i] = S[j]; S[j] = t; }
    i = j = 0;
    for (var k = 0; k < data.length; k++) {
      i = (i + 1) & 255; j = (j + S[i]) & 255; t = S[i]; S[i] = S[j]; S[j] = t;
      out += String.fromCharCode(data.charCodeAt(k) ^ S[(S[i] + S[j]) & 255]);
    }
    return out;
  }
  function aesRaw(encrypt, key, iv, data) {
    var c = encrypt ? forge.cipher.createCipher('AES-CBC', key) : forge.cipher.createDecipher('AES-CBC', key);
    c.start({ iv: iv }); c.update(forge.util.createBuffer(data)); c.finish(function () { return true; });
    return c.output.getBytes();
  }
  function aesStr(key, data) {
    if (data.length < 32) return null;
    var c = forge.cipher.createDecipher('AES-CBC', key);
    c.start({ iv: data.slice(0, 16) }); c.update(forge.util.createBuffer(data.slice(16)));
    return c.finish() ? c.output.getBytes() : null;
  }
  function le(n, bytes) { var o = ''; for (var i = 0; i < bytes; i++) o += String.fromCharCode((n >>> (8 * i)) & 255); return o; }
  function xorKey(k, x) { var o = ''; for (var i = 0; i < k.length; i++) o += String.fromCharCode(k.charCodeAt(i) ^ x); return o; }
  function hash2B(pw, salt, udata, R) {
    var K = shaN(256, pw + salt + udata);
    if (R < 6) return K;
    var i = 0, E = '';
    while (i < 64 || E.charCodeAt(E.length - 1) > i - 32) {
      var K1 = '', unit = pw + K + udata; for (var r = 0; r < 64; r++) K1 += unit;
      E = aesRaw(true, K.slice(0, 16), K.slice(16, 32), K1);
      var sum = 0; for (var q = 0; q < 16; q++) sum += E.charCodeAt(q);
      K = shaN([256, 384, 512][sum % 3], E); i++;
    }
    return K.slice(0, 32);
  }
  function readEncryption(text) {
    var m = /\/Encrypt\s+(\d+)\s+(\d+)\s+R/.exec(text), dict = null;
    if (m) dict = objectText(text, m[1], m[2]);
    else { var k = text.indexOf('/Encrypt'); if (k >= 0 && /^\/Encrypt\s*<</.test(text.slice(k, k + 20))) dict = text.slice(k, k + 4000); }
    if (!dict || !/\/Filter\s*\/Standard/.test(dict)) return null;
    var full = dict; dict = dict.replace(/\/CF\s*<<(?:[^<>]|<<(?:[^<>]|<<[^<>]*>>)*>>)*>>/, '');   // top-level keys only
    var num = function (k, d) { var r = new RegExp('\\/' + k + '\\s+(-?\\d+)').exec(dict); return r ? +r[1] : d; };
    var idm = /\/ID\s*\[\s*/.exec(text.slice(text.lastIndexOf('/ID')));
    var id0 = idm ? readPdfString(text, text.lastIndexOf('/ID') + idm.index + idm[0].length) : '';
    var cfm = /\/StdCF\s*<<[^>]*\/CFM\s*\/(\w+)/.exec(full);
    return {
      V: num('V', 0), R: num('R', 2), len: num('Length', 40), P: num('P', 0),
      O: dictString(dict, 'O') || '', U: dictString(dict, 'U') || '', OE: dictString(dict, 'OE') || '', UE: dictString(dict, 'UE') || '',
      encMeta: !/\/EncryptMetadata\s+false/.test(dict), cfm: cfm ? cfm[1] : (num('V', 0) >= 4 ? 'AESV2' : 'V2'), id0: id0 || ''
    };
  }
  function fileKey(E, password) {
    var pw = password || '';
    if (E.R >= 5) {
      var u = pw; try { u = unescape(encodeURIComponent(pw)); } catch (e) {} u = u.slice(0, 127);
      var U = E.U.slice(0, 48), O = E.O.slice(0, 48), zero = '\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0';
      if (hash2B(u, U.slice(32, 40), '', E.R) === U.slice(0, 32)) return aesRaw(false, hash2B(u, U.slice(40, 48), '', E.R), zero, E.UE.slice(0, 32));
      if (hash2B(u, O.slice(32, 40), U, E.R) === O.slice(0, 32)) return aesRaw(false, hash2B(u, O.slice(40, 48), U, E.R), zero, E.OE.slice(0, 32));
      return null;
    }
    var n = E.R === 2 ? 5 : Math.max(5, Math.min(16, (E.len || 40) / 8));
    var keyFrom = function (padded) {
      var h = md5(padded + E.O.slice(0, 32) + le(E.P, 4) + E.id0 + (E.R >= 4 && !E.encMeta ? '\xff\xff\xff\xff' : ''));
      if (E.R >= 3) for (var i = 0; i < 50; i++) h = md5(h.slice(0, n));
      return h.slice(0, n);
    };
    var userOk = function (key) {
      if (E.R === 2) return rc4(key, PAD) === E.U.slice(0, 32);
      var x = rc4(key, md5(PAD + E.id0));
      for (var i = 1; i <= 19; i++) x = rc4(xorKey(key, i), x);
      return x.slice(0, 16) === E.U.slice(0, 16);
    };
    var raw = pw; try { raw = unescape(encodeURIComponent(pw)); } catch (e) {}
    var padded = (raw + PAD).slice(0, 32), key = keyFrom(padded);
    if (userOk(key)) return key;
    // maybe it is the owner password
    var h = md5(padded); if (E.R >= 3) for (var i = 0; i < 50; i++) h = md5(h);
    var ok = h.slice(0, n), up = E.O.slice(0, 32);
    if (E.R === 2) up = rc4(ok, up); else for (var j = 19; j >= 0; j--) up = rc4(xorKey(ok, j), up);
    key = keyFrom(up);
    return userOk(key) ? key : null;
  }
  function decryptString(E, key, num, gen, data) {
    if (data == null) return null;
    if (E.R >= 5) return aesStr(key, data);
    if (E.cfm === 'None' || E.cfm === 'Identity') return data;
    var aes = E.V >= 4 && E.cfm === 'AESV2';
    var ok = md5(key + le(num, 3) + le(gen, 2) + (aes ? 'sAlT' : '')).slice(0, Math.min(key.length + 5, 16));
    return aes ? aesStr(ok, data) : rc4(ok, data);
  }

  // ---------- find the signatures in the raw file ----------
  function findSignatures(u8) {
    var text = latin(u8, 0, u8.length), re = /\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/g, m, out = [], seen = {};
    while ((m = re.exec(text))) {
      var br = [+m[1], +m[2], +m[3], +m[4]], key = br.join(',');
      if (seen[key]) continue; seen[key] = 1;
      var broken = br[0] + br[1] > u8.length || br[2] + br[3] > u8.length || br[2] <= br[0] + br[1];
      var lt = br[0] + br[1], gt = br[2] - 1;
      if (!broken && (u8[lt] !== 0x3c || u8[gt] !== 0x3e)) broken = true;   // the hole must be exactly <hex>
      if (broken) { out.push({ byteRange: br, broken: true, at: m.index }); continue; }
      var hex = latin(u8, lt + 1, gt).replace(/[^0-9a-fA-F]/g, '');
      // the signature dictionary that holds this /ByteRange
      var head = text.slice(Math.max(0, m.index - 20000), m.index), om, objm = null, orx = /(\d+)\s+(\d+)\s+obj\b/g;
      while ((om = orx.exec(head))) objm = om;
      var dStart = objm ? m.index - head.length + objm.index : Math.max(0, m.index - 4000);
      var dEnd = text.indexOf('endobj', br[2]); if (dEnd < 0) dEnd = Math.min(text.length, br[2] + 4000);
      var dict = text.slice(dStart, lt) + text.slice(br[2], dEnd);      // leave the huge /Contents out
      var sf = /\/SubFilter\s*\/([A-Za-z0-9.]+)/.exec(dict);
      out.push({ byteRange: br, hex: hex, subFilter: sf ? sf[1] : '', at: m.index,
        num: objm ? +objm[1] : 0, gen: objm ? +objm[2] : 0,
        raw: { M: dictString(dict, 'M'), Name: dictString(dict, 'Name'), Reason: dictString(dict, 'Reason'), Location: dictString(dict, 'Location') } });
    }
    return out;
  }

  // ---------- CMS / PKCS#7 ----------
  function parseCMS(hex) {
    var asn1 = forge.asn1, der = forge.util.hexToBytes(hex.length % 2 ? hex + '0' : hex);
    var ci = asn1.fromDer(der, { parseAllBytes: false, strict: false });
    if (asn1.derToOid(ci.value[0].value) !== OID.signedData) throw new Error('not signedData');
    var sd = ci.value[1].value[0].value, i = 0;
    i++;                                   // version
    i++;                                   // digestAlgorithms
    var encap = sd[i++], encapType = asn1.derToOid(encap.value[0].value), encapContent = null;
    if (encap.value[1]) {
      var c = encap.value[1].value[0];
      encapContent = c.constructed ? c.value.map(function (x) { return x.value; }).join('') : c.value;
    }
    var certs = [], signerInfos = null;
    for (; i < sd.length; i++) {
      var n = sd[i];
      if (n.tagClass === asn1.Class.CONTEXT_SPECIFIC && n.type === 0) {
        n.value.forEach(function (c) { try { certs.push(forge.pki.certificateFromAsn1(c)); } catch (e) { certs.push(null); } });
      } else if (n.tagClass === asn1.Class.UNIVERSAL && n.type === asn1.Type.SET) signerInfos = n.value;
    }
    if (!signerInfos || !signerInfos.length) throw new Error('no signer');
    var si = signerInfos[0].value, j = 0, s = {};
    j++;                                   // version
    s.sid = si[j++];
    s.digestAlg = asn1.derToOid(si[j++].value[0].value);
    if (si[j] && si[j].tagClass === asn1.Class.CONTEXT_SPECIFIC && si[j].type === 0) s.signedAttrs = si[j++];
    s.sigAlg = asn1.derToOid(si[j++].value[0].value);
    s.signature = si[j++].value;
    if (si[j] && si[j].tagClass === asn1.Class.CONTEXT_SPECIFIC && si[j].type === 1) s.unsignedAttrs = si[j++];
    return { certs: certs.filter(Boolean), badCerts: certs.some(function (c) { return !c; }), signer: s, encapType: encapType, encapContent: encapContent };
  }
  function attrsMap(node) {
    var asn1 = forge.asn1, map = {};
    (node ? node.value : []).forEach(function (a) { map[asn1.derToOid(a.value[0].value)] = a.value[1].value; });
    return map;
  }
  function findSignerCert(cms) {
    var asn1 = forge.asn1, sid = cms.signer.sid;
    if (sid.tagClass === asn1.Class.UNIVERSAL) {             // issuerAndSerialNumber
      var serial = forge.util.bytesToHex(sid.value[1].value).replace(/^0+/, '');
      var issuerDer = asn1.toDer(sid.value[0]).getBytes();
      return cms.certs.find(function (c) {
        return c.serialNumber.replace(/^0+/, '') === serial && asn1.toDer(forge.pki.distinguishedNameToAsn1(c.issuer)).getBytes() === issuerDer;
      }) || cms.certs.find(function (c) { return c.serialNumber.replace(/^0+/, '') === serial; });
    }
    var skid = sid.value;                                    // [0] subjectKeyIdentifier
    if (typeof skid !== 'string' && skid[0]) skid = skid[0].value;
    return cms.certs.find(function (c) { var e = c.getExtension('subjectKeyIdentifier'); return e && forge.util.hexToBytes(e.subjectKeyIdentifier) === skid; });
  }

  function verifyRsa(cert, alg, digestBin, sigBin) {
    if (!cert.publicKey || !cert.publicKey.verify) return false;
    try { return cert.publicKey.verify(digestBin, sigBin); } catch (e) { return false; }
  }

  function buildChain(leaf, pool, when) {
    var trusted = trustedRoots(), chain = [leaf], cur = leaf, guard = 0;
    var issuedBy = function (child, parent) {
      try { return sameName(child.issuer, parent.subject) && parent.verify(child); } catch (e) { return false; }
    };
    while (guard++ < 8) {
      var root = trusted.find(function (r) { return derOf(r) === derOf(cur) || issuedBy(cur, r); });
      if (root) {
        if (derOf(root) !== derOf(cur)) chain.push(root);
        var expired = chain.filter(function (c) { return !within(c, when); });
        return { ok: !expired.length, chain: chain, root: root, expired: expired };
      }
      var up = pool.find(function (p) { return p !== cur && derOf(p) !== derOf(cur) && issuedBy(cur, p); });
      if (!up) return { ok: false, chain: chain, root: null, reason: 'chain' };
      chain.push(up); cur = up;
    }
    return { ok: false, chain: chain, root: null, reason: 'chain' };
  }

  async function checkOne(u8, sig, enc) {
    var plain = function (k) { return enc || !sig.raw ? '' : decodeText(sig.raw[k]); };
    var r = { byteRange: sig.byteRange, at: sig.at, num: sig.num, gen: sig.gen, status: 'error', problems: [], signer: '', org: '', time: null, chain: [], reason: plain('Reason'), location: plain('Location') };
    if (sig.broken) { r.wholeFile = false; r.status = 'modified'; r.problems.push('The file was re-saved after signing, so the signature no longer matches its bytes.'); return r; }
    var br = sig.byteRange;
    var parts = [u8.subarray(br[0], br[0] + br[1]), u8.subarray(br[2], br[2] + br[3])];
    var tail = latin(u8, br[2] + br[3], u8.length).replace(/[\s\0%EOF]/g, '');
    r.wholeFile = br[0] === 0 && (br[2] + br[3] === u8.length || tail === '');
    var cms;
    try { cms = parseCMS(sig.hex); } catch (e) { r.problems.push('The signature data could not be read.'); return r; }
    var s = cms.signer, alg = HASH[s.digestAlg] || 'sha256';
    var cert = findSignerCert(cms);
    if (!cert) { r.problems.push(cms.badCerts ? 'The signer certificate uses a key type this checker does not support.' : 'The signer certificate is missing.'); return r; }
    r.signer = nameOf(cert); r.org = attr(cert, 'O'); r.issuer = issuerAttr(cert, 'CN') || issuerAttr(cert, 'O');
    var attrs = attrsMap(s.signedAttrs);
    var docHash = await digest(alg, parts), contentOk, signedBin;
    if (/sha1$/i.test(sig.subFilter) && cms.encapContent) {
      // adbe.pkcs7.sha1: the signed content is the SHA-1 of the byte ranges
      contentOk = cms.encapContent === await digest('sha1', parts);
      var inner = cms.encapContent;
      if (s.signedAttrs) contentOk = contentOk && attrs[OID.messageDigest] && attrs[OID.messageDigest][0].value === mdOf(alg, inner).digest().getBytes();
    } else {
      contentOk = s.signedAttrs ? !!(attrs[OID.messageDigest] && attrs[OID.messageDigest][0].value === docHash) : true;
    }
    var sigOk;
    if (s.signedAttrs) {
      var sa = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, s.signedAttrs.value);
      signedBin = forge.asn1.toDer(sa).getBytes();
      sigOk = verifyRsa(cert, alg, mdOf(alg, signedBin).digest().getBytes(), s.signature);
    } else if (cms.encapContent && /sha1$/i.test(sig.subFilter)) {
      sigOk = verifyRsa(cert, alg, mdOf(alg, cms.encapContent).digest().getBytes(), s.signature);
    } else {
      sigOk = verifyRsa(cert, alg, docHash, s.signature);
    }
    // the signing date shown in the box is the dictionary's /M (as Adobe shows it); CMS signingTime is the fallback
    var mDate = pdfDate(plain('M')), cmsDate = null;
    if (attrs[OID.signingTime]) { try { cmsDate = attrs[OID.signingTime][0].type === forge.asn1.Type.UTCTIME ? forge.asn1.utcTimeToDate(attrs[OID.signingTime][0].value) : forge.asn1.generalizedTimeToDate(attrs[OID.signingTime][0].value); } catch (e) {} }
    r.time = mDate || cmsDate; r.cmsTime = cmsDate;
    r.timeSource = mDate ? 'pdf' : (cmsDate ? 'signature' : 'none');
    var when = r.time || new Date();
    var chain = buildChain(cert, cms.certs, when);
    r.chain = chain.chain.map(function (c) { return { name: nameOf(c), org: attr(c, 'O'), from: c.validity.notBefore, to: c.validity.notAfter }; });
    r.root = chain.root ? nameOf(chain.root) : '';

    if (!contentOk) r.problems.push('The document was changed after it was signed (its content does not match the signature).');
    if (!sigOk) r.problems.push('The signature itself is not correct for the signer certificate.');
    if (!r.wholeFile) r.problems.push('Something was added to the file after it was signed.');
    if (!chain.root) r.problems.push('The signer certificate does not lead to an official India PKI (CCA India) root.');
    else if (!chain.ok) r.problems.push('A certificate in the chain was not valid at the signing time.');

    if (!contentOk || !sigOk) r.status = 'modified';
    else if (!r.wholeFile) r.status = 'changed-after';
    else if (!chain.ok) r.status = 'untrusted';
    else r.status = 'valid';
    return r;
  }

  async function verify(input) {
    if (!forge) return { status: 'error', signatures: [], message: 'Signature checker did not load.' };
    var u8 = input instanceof Uint8Array ? input : new Uint8Array(input);
    var sigs = findSignatures(u8);
    if (!sigs.length) return { status: 'unsigned', signatures: [] };
    var enc = null; try { enc = readEncryption(latin(u8, 0, u8.length)); } catch (e) {}
    var res = [];
    for (var i = 0; i < sigs.length; i++) res.push(await checkOne(u8, sigs[i], enc));
    // a later revision may legitimately add another signature: the earlier one is then not "whole file"
    var last = res.slice().sort(function (a, b) { return (b.byteRange[2] + b.byteRange[3]) - (a.byteRange[2] + a.byteRange[3]); })[0];
    res.forEach(function (r) {
      if (r !== last && r.status === 'changed-after' && last.status === 'valid') { r.status = 'valid'; r.problems = []; r.laterSigned = true; }
    });
    var order = ['modified', 'changed-after', 'error', 'untrusted', 'valid'];
    var overall = res.map(function (r) { return r.status; }).sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); })[0];
    var out = { status: overall, signatures: res, encrypted: !!enc, verifiedAt: new Date() };
    Object.defineProperty(out, '_enc', { value: { E: enc, raw: sigs.filter(function (x) { return !x.broken; }) } });
    if (enc) unlock(out, '');                 // owner-password-only files open without a password
    return out;
  }
  // Read the date / reason / location of a password-protected file once its password is known.
  function unlock(result, password) {
    try {
      var info = result && result._enc; if (!info || !info.E || result.unlocked) return false;
      var key = fileKey(info.E, password || ''); if (!key) return false;
      result.signatures.forEach(function (r) {
        var sg = info.raw.find(function (x) { return x.at === r.at; }); if (!sg || !sg.raw) return;
        var dec = function (k) { return decodeText(decryptString(info.E, key, sg.num, sg.gen, sg.raw[k])); };
        var d = pdfDate(dec('M'));
        if (d) { r.time = d; r.timeSource = 'pdf'; }
        r.reason = dec('Reason'); r.location = dec('Location');
      });
      result.unlocked = true;
      return true;
    } catch (e) { return false; }
  }

  // ---------- drawing the validated signature box ----------
  function fmtDate(d) {
    if (!d) return '';
    var t = new Date(d.getTime() + 330 * 60000), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return t.getUTCFullYear() + '.' + p(t.getUTCMonth() + 1) + '.' + p(t.getUTCDate()) + ' ' + p(t.getUTCHours()) + ':' + p(t.getUTCMinutes()) + ':' + p(t.getUTCSeconds()) + ' IST';
  }
  // Adobe Reader's "signature valid" check mark, traced from a real validated e-Aadhaar box:
  // a green polygon with a thin black outline and a black drop shadow to the lower right.
  // Points are in units of the box height, x measured from the box centre.
  var TICK = [[-0.330, 0.675], [-0.275, 0.569], [-0.117, 0.754], [0.163, 0.275], [0.261, 0.344], [-0.100, 0.890]];
  function adobeTick(ctx, cx, top, H) {
    var path = function (dx, dy) {
      ctx.beginPath();
      TICK.forEach(function (p, i) { var X = cx + p[0] * H + dx, Y = top + p[1] * H + dy; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
      ctx.closePath();
    };
    ctx.save(); ctx.lineJoin = 'miter';
    path(H * 0.017, H * 0.022); ctx.fillStyle = '#000'; ctx.fill();                       // shadow
    path(0, 0); ctx.fillStyle = '#00ae3a'; ctx.fill();                                   // green
    ctx.lineWidth = Math.max(1, H * 0.008); ctx.strokeStyle = '#000'; ctx.stroke();       // outline
    ctx.restore();
  }
  // Paint every *valid* signature widget on this page. Returns how many boxes were painted.
  async function paint(ctx, page, viewport, result) {
    if (!result || result.status !== 'valid' || !result.signatures) return 0;
    var good = result.signatures.filter(function (s) { return s.status === 'valid'; });
    if (!good.length) return 0;
    var annots; try { annots = await page.getAnnotations(); } catch (e) { return 0; }
    var widgets = annots.filter(function (a) { return a.fieldType === 'Sig' && a.rect && Math.abs(a.rect[2] - a.rect[0]) > 4 && Math.abs(a.rect[3] - a.rect[1]) > 4; });
    var n = 0;
    widgets.forEach(function (w, i) {
      var s = good[Math.min(i, good.length - 1)];
      var r = viewport.convertToViewportRectangle(w.rect);
      var x = Math.min(r[0], r[2]), y = Math.min(r[1], r[3]), W = Math.abs(r[2] - r[0]), H = Math.abs(r[3] - r[1]);
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, W, H); ctx.clip();
      ctx.fillStyle = '#fff'; ctx.fillRect(x, y, W, H);
      // 1) the tick sits underneath the text, exactly like Adobe's validated signature box
      adobeTick(ctx, x + W * 0.5, y, H);
      var font = function (f) { return f + 'px Arial, Helvetica, "Liberation Sans", sans-serif'; };
      ctx.fillStyle = '#000'; ctx.textBaseline = 'alphabetic';
      // 2) "Signature valid"
      var tf = H * 0.2125; ctx.font = font(tf);
      while (tf > 4 && ctx.measureText('Signature valid').width > W * 0.84) { tf -= 0.25; ctx.font = font(tf); }
      ctx.fillText('Signature valid', x + W * 0.1, y + H * 0.334);
      // 3) the signer text, wrapped the way the signature's own appearance is
      var paras = ['Digitally signed by ' + s.signer];
      if (s.time) paras.push('Date: ' + fmtDate(s.time));
      // exactly Adobe's two paragraphs (signer + signing date); the check time is shown on screen, not in the box
      var bx = x + W * 0.129, bw = W * 0.69;
      var wrap = function (f) {
        ctx.font = font(f); var out = [];
        paras.forEach(function (p) {
          var line = '';
          p.split(' ').forEach(function (w) { var t = line ? line + ' ' + w : w; if (line && ctx.measureText(t).width > bw) { out.push(line); line = w; } else line = t; });
          out.push(line);
        });
        return out;
      };
      var bf = H * 0.0981, pitch = H * 0.0993, rows = wrap(bf), first = H * 0.569;
      while (bf > 3 && (first + (rows.length - 1) * pitch > H * 0.985 || rows.some(function (r) { return ctx.measureText(r).width > W * 0.86; }))) {
        bf -= 0.25; pitch = bf * 1.012; rows = wrap(bf);
      }
      var by = y + first;
      rows.forEach(function (r) { ctx.fillText(r, bx, by); by += pitch; });
      ctx.restore(); n++;
    });
    return n;
  }

  // ---------- result card (HTML) ----------
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function describe(result, fileName) {
    var st = result.status, sig = (result.signatures || [])[0] || {};
    var head = {
      valid: ['ok', '✓', 'Digital signature valid', 'The document has not been changed since it was signed. The green tick is added to the signature box for printing.'],
      modified: ['bad', '?', 'Signature NOT valid — document edited', 'This file was changed after it was signed, so the tick is not added. Download a fresh copy from the official site.'],
      'changed-after': ['bad', '?', 'Changed after signing', 'Something was added to this PDF after it was signed, so the tick is not added.'],
      untrusted: ['warn', '?', 'Signature not verified', 'The content is intact, but the signer certificate does not lead to an official India PKI root (or was not valid at signing time).'],
      unsigned: ['none', '–', 'No digital signature', 'This PDF has no digital signature, so there is nothing to verify.'],
      'unsigned-official': ['bad', '?', 'This copy has lost its digital signature', 'An e-Aadhaar / e-PAN downloaded from the official site is always digitally signed. This file was saved again by another app or website (for example a "remove password" / unlock tool, a PDF editor or "Print to PDF"), which deletes the signature. Download a fresh copy from the official site and open that original file here, with its password.'],
      stripped: ['bad', '?', 'Signature removed', 'The signature box is there, but the signature data was removed when this file was saved again by another app. The tick cannot be added — open the original downloaded file.'],
      error: ['warn', '?', 'Could not check the signature', 'The signature in this file could not be read.']
    }[st] || ['warn', '?', 'Could not check', ''];
    var h = '<div class="sp-dsig sp-dsig-' + head[0] + '" role="status"><div class="sp-dsig-ic" aria-hidden="true">' + head[1] + '</div><div class="sp-dsig-tx"><b>' + head[2] + '</b><span>' + esc(head[3]) + '</span>';
    if (sig.signer) {
      h += '<details><summary>Details</summary><dl>';
      h += '<dt>Signed by</dt><dd>' + esc(sig.signer) + (sig.org && sig.org !== sig.signer ? ' · ' + esc(sig.org) : '') + '</dd>';
      if (sig.time) h += '<dt>Signed on</dt><dd>' + esc(fmtDate(sig.time)) + '</dd>';
      if (result.verifiedAt) h += '<dt>Verified on</dt><dd>' + esc(fmtDate(result.verifiedAt)) + '</dd>';
      if (sig.reason) h += '<dt>Reason</dt><dd>' + esc(sig.reason) + '</dd>';
      if (sig.location) h += '<dt>Location</dt><dd>' + esc(sig.location) + '</dd>';
      if (sig.chain && sig.chain.length) h += '<dt>Certificate chain</dt><dd>' + sig.chain.map(function (c) { return esc(c.name); }).join(' → ') + '</dd>';
      h += '<dt>Trusted root</dt><dd>' + (sig.root ? esc(sig.root) + ' (India PKI)' : 'Not found') + '</dd>';
      if (sig.problems && sig.problems.length) h += '<dt>Problems</dt><dd>' + sig.problems.map(esc).join('<br>') + '</dd>';
      if (result.signatures.length > 1) h += '<dt>Signatures</dt><dd>' + result.signatures.length + '</dd>';
      h += '<dt>Note</dt><dd>Checked offline in your browser. Certificate revocation (CRL/OCSP) is not checked.</dd>';
      h += '</dl></details>';
    }
    if (!sig.signer && result.producer && /unsigned|stripped/.test(st)) h += '<small class="sp-dsig-prod">This file was last saved with: ' + esc(result.producer) + '</small>';
    return h + '</div></div>';
  }

  window.SPSig = { verify: verify, unlock: unlock, paint: paint, describe: describe, fmtDate: fmtDate };
})();
