"""Collect the certificates of India PKI's licensed CAs and their sub-CAs (runs in GitHub Actions).
Sources: the CCA India certificate pages, the CAs' public repositories and the AIA
"CA Issuers" links found in each certificate. Output: assets/sigverify/intermediates.js"""
import re, ssl, subprocess, sys, urllib.request, urllib.parse, tempfile, os, json, hashlib
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36'}
def get(u, n=8_000_000):
    u = urllib.parse.quote(u.strip(), safe=':/%?=&()#+,;@~')
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=25, context=ctx)
        return r.read(n)
    except Exception as e:
        print('  ! ', u, str(e)[:80]); return None
CCA_PAGES = ['https://cca.gov.in/display_cert_under.php', 'https://cca.gov.in/display_cert2011.php', 'https://cca.gov.in/display_cert2014.php',
             'https://cca.gov.in/display_cert2015.php', 'https://cca.gov.in/display_cert2022.php', 'https://cca.gov.in/display_cert2022_SPL.php',
             'https://cca.gov.in/root_certificate.html', 'https://cca.gov.in/eSign.html', 'https://cca.gov.in/service-providers.html']
REPO_PAGES = open(os.path.join(os.path.dirname(__file__), 'ca_repositories.txt')).read().split()
SEED_CERTS = open(os.path.join(os.path.dirname(__file__), 'ca_certs.txt')).read().split()
CERT_RE = re.compile(rb'href\s*=\s*["\']([^"\']+?\.(?:cer|crt|der|pem|p7b|p7c))["\']', re.I)
LINK_RE = re.compile(rb'href\s*=\s*["\']([^"\'#]+)["\']', re.I)
seen_urls, certs = set(), {}
# keep what earlier runs found (CA sites are sometimes down)
try:
    _old = open('assets/sigverify/intermediates.js').read()
    for _p in json.loads(_old[_old.index('['):_old.rindex(']') + 1]): certs[hashlib.sha256(_p.encode()).hexdigest()] = _p
except Exception: pass
def to_pems(data):
    out = []
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, 'x'); open(p, 'wb').write(data)
        for args in (['openssl', 'x509', '-inform', 'DER', '-in', p], ['openssl', 'x509', '-in', p]):
            r = subprocess.run(args, capture_output=True)
            if r.returncode == 0: return [r.stdout.decode()]
        for fmt in ('DER', 'PEM'):
            r = subprocess.run(['openssl', 'pkcs7', '-inform', fmt, '-in', p, '-print_certs'], capture_output=True)
            if r.returncode == 0:
                return re.findall(r'-----BEGIN CERTIFICATE-----.+?-----END CERTIFICATE-----\n?', r.stdout.decode(), re.S)
    return out
def info(pem):
    r = subprocess.run(['openssl', 'x509', '-noout', '-subject', '-ext', 'basicConstraints,authorityInfoAccess', '-nameopt', 'oneline'], input=pem.encode(), capture_output=True)
    t = r.stdout.decode(); return t, 'CA:TRUE' in t, re.findall(r'CA Issuers - URI:(\S+)', t)
def add_cert_url(u, depth=0):
    if u in seen_urls or depth > 6: return
    seen_urls.add(u); data = get(u)
    if not data: return
    for pem in to_pems(data):
        h = hashlib.sha256(pem.encode()).hexdigest()
        if h in certs: continue
        t, is_ca, aia = info(pem)
        if not is_ca: continue
        certs[h] = pem; print('  +', t.splitlines()[0][:120])
        for a in aia: add_cert_url(a, depth + 1)
def crawl(page, depth=0, host=None, budget=[0]):
    if page in seen_urls or depth > 2 or budget[0] > 400: return
    seen_urls.add(page); budget[0] += 1
    html = get(page, 3_000_000)
    if not html: return
    host = host or urllib.parse.urlparse(page).netloc
    for m in CERT_RE.findall(html):
        add_cert_url(urllib.parse.urljoin(page, m.decode('latin1').strip()))
    if depth < 2:
        for m in LINK_RE.findall(html):
            u = urllib.parse.urljoin(page, m.decode('latin1').strip())
            if urllib.parse.urlparse(u).netloc == host and re.search(r'repositor|certificat|download|root|ca[-_ ]?cert|chain|cps', u, re.I) and not re.search(r'\.(pdf|jpg|png|zip|exe|css|js)$', u, re.I):
                crawl(u, depth + 1, host, budget)
for p in CCA_PAGES: crawl(p, 1)
for u in SEED_CERTS: add_cert_url(u)
for p in REPO_PAGES: crawl(p, 0, None, [0])
pems = sorted(certs.values())
js = '/* Licensed CAs and sub-CAs of India PKI (CCA India), collected from cca.gov.in, the CAs\' repositories and AIA links.\n * Only used to complete a certificate chain; trust still comes from the CCA India roots. */\nwindow.SP_CA_POOL = ' + json.dumps(pems, indent=0) + ';\n'
open('assets/sigverify/intermediates.js', 'w').write(js)
print(len(pems), 'CA certificates')
