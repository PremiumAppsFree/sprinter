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
      // signature dictionary around it: look for /SubFilter, /M, /Name, /Reason, /Location
      var from = Math.max(0, m.index - 4000), dict = text.slice(from, Math.min(text.length, br[2] + 2000));
      var pick = function (k) { var r = new RegExp('\\/' + k + '\\s*\\(((?:\\\\.|[^\\\\)])*)\\)').exec(dict); return r ? r[1] : ''; };
      var sf = /\/SubFilter\s*\/([A-Za-z0-9.]+)/.exec(dict);
      out.push({ byteRange: br, hex: hex, subFilter: sf ? sf[1] : '', m: pick('M'), name: pick('Name'), reason: pick('Reason'), location: pick('Location'), at: m.index });
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

  async function checkOne(u8, sig) {
    var r = { byteRange: sig.byteRange, at: sig.at, status: 'error', problems: [], signer: '', org: '', time: null, chain: [], reason: sig.reason, location: sig.location };
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
    if (attrs[OID.signingTime]) { try { r.time = forge.asn1.utcTimeToDate ? (attrs[OID.signingTime][0].type === forge.asn1.Type.UTCTIME ? forge.asn1.utcTimeToDate(attrs[OID.signingTime][0].value) : forge.asn1.generalizedTimeToDate(attrs[OID.signingTime][0].value)) : null; } catch (e) {} }
    if (!r.time) r.time = pdfDate(sig.m);
    r.timeSource = attrs[OID.signingTime] ? 'signature' : (sig.m ? 'pdf' : 'none');
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
    var res = [];
    for (var i = 0; i < sigs.length; i++) res.push(await checkOne(u8, sigs[i]));
    // a later revision may legitimately add another signature: the earlier one is then not "whole file"
    var last = res.slice().sort(function (a, b) { return (b.byteRange[2] + b.byteRange[3]) - (a.byteRange[2] + a.byteRange[3]); })[0];
    res.forEach(function (r) {
      if (r !== last && r.status === 'changed-after' && last.status === 'valid') { r.status = 'valid'; r.problems = []; r.laterSigned = true; }
    });
    var order = ['modified', 'changed-after', 'error', 'untrusted', 'valid'];
    var overall = res.map(function (r) { return r.status; }).sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); })[0];
    return { status: overall, signatures: res };
  }

  // ---------- drawing the validated signature box ----------
  function fmtDate(d) {
    if (!d) return '';
    var t = new Date(d.getTime() + 330 * 60000), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return t.getUTCFullYear() + '.' + p(t.getUTCMonth() + 1) + '.' + p(t.getUTCDate()) + ' ' + p(t.getUTCHours()) + ':' + p(t.getUTCMinutes()) + ':' + p(t.getUTCSeconds()) + ' IST';
  }
  function tick(ctx, x, y, s) {
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e9e3a'; ctx.lineWidth = s * 0.16;
    ctx.beginPath(); ctx.moveTo(x + s * 0.12, y + s * 0.55); ctx.lineTo(x + s * 0.4, y + s * 0.82); ctx.lineTo(x + s * 0.9, y + s * 0.18); ctx.stroke();
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
      ctx.fillStyle = '#fff'; ctx.fillRect(x, y, W, H);
      var ic = Math.min(H * 0.9, W * 0.32);
      // big faint tick behind the text (Adobe style) + solid tick on the left
      ctx.globalAlpha = 0.18; tick(ctx, x + (W - ic * 1.6) / 2, y + (H - ic * 1.6) / 2, ic * 1.6); ctx.globalAlpha = 1;
      tick(ctx, x + H * 0.05, y + (H - ic) / 2, ic);
      var tx = x + ic + H * 0.12, tw = W - (tx - x) - H * 0.06;
      var paras = [['Signature valid', 'bold'], ['Digitally signed by ' + s.signer, 'normal']];
      if (s.time) paras.push(['Date: ' + fmtDate(s.time), 'normal']);
      if (s.reason) paras.push(['Reason: ' + s.reason, 'normal']);
      if (s.location) paras.push(['Location: ' + s.location, 'normal']);
      var font = function (wt, f) { return wt + ' ' + f + 'px Arial, Helvetica, sans-serif'; };
      var wrap = function (f) {
        var out = [];
        paras.forEach(function (p) {
          ctx.font = font(p[1], f); var words = p[0].split(' '), line = '';
          words.forEach(function (w) {
            var t = line ? line + ' ' + w : w;
            if (line && ctx.measureText(t).width > tw) { out.push([line, p[1]]); line = w; } else line = t;
          });
          out.push([line, p[1]]);
        });
        return out;
      };
      var f = H / 3.2, rows;
      for (; f > 3; f -= 0.5) {
        rows = wrap(f);
        var wide = rows.some(function (r) { ctx.font = font(r[1], f); return ctx.measureText(r[0]).width > tw; });
        if (!wide && rows.length * f * 1.22 <= H * 0.94) break;
      }
      var fy = y + (H - rows.length * f * 1.22) / 2 + f;
      ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#111';
      rows.forEach(function (r) { ctx.font = font(r[1], f); ctx.fillText(r[0], tx, fy); fy += f * 1.22; });
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

  window.SPSig = { verify: verify, paint: paint, describe: describe, fmtDate: fmtDate };
})();
