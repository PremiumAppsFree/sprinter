(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); }, img = null, busy = false;
  function toast(t) { var e = $('ac-toast'); e.textContent = t; e.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { e.hidden = true; }, 4000); }
  function useFile(f) {
    if (!f || !/^image\//.test(f.type)) { toast('Please choose a photo (JPG, PNG or WebP).'); return; }
    var u = URL.createObjectURL(f), i = $('ac-img'); i.onload = function () { img = i; $('ac-go').disabled = false; $('ac-res').hidden = true; }; i.src = u; $('ac-prev').hidden = false;
  }
  $('ac-file').addEventListener('change', function (e) { useFile(e.target.files[0]); });
  var drop = $('ac-drop');
  ['dragover', 'dragenter'].forEach(function (n) { drop.addEventListener(n, function (e) { e.preventDefault(); drop.classList.add('cp-over'); }); });
  ['dragleave', 'drop'].forEach(function (n) { drop.addEventListener(n, function () { drop.classList.remove('cp-over'); }); });
  drop.addEventListener('drop', function (e) { e.preventDefault(); useFile(e.dataTransfer.files[0]); });
  window.addEventListener('paste', function (e) { var it = [].slice.call((e.clipboardData || {}).items || []).filter(function (x) { return /^image\//.test(x.type); })[0]; if (it) useFile(it.getAsFile()); });
  function prog(p, t) { $('ac-prog').hidden = false; $('ac-barf').style.width = Math.round(p * 100) + '%'; if (t) $('ac-stat').textContent = t; }
  $('ac-go').addEventListener('click', async function () {
    if (!img || busy) return; busy = true; var b = $('ac-go'); b.disabled = true; $('ac-res').hidden = true;
    try {
      prog(0, 'Downloading the AI model (only the first time)…');
      var r = await SPAICheck.check(img, function (p) { prog(p * 0.9, p >= 1 ? 'Checking the photo…' : 'Downloading the AI model (only the first time)… ' + Math.round(p * 100) + '%'); });
      prog(1, 'Done'); setTimeout(function () { $('ac-prog').hidden = true; }, 600);
      var p = r.p, v = $('ac-verdict'), pct = Math.round(p * 100);
      if (p >= 0.7) { v.className = 'ac-verdict ai'; v.textContent = 'Likely made by AI'; }
      else if (p >= r.threshold) { v.className = 'ac-verdict mid'; v.textContent = 'Possibly made by AI'; }
      else if (p >= 0.25) { v.className = 'ac-verdict mid'; v.textContent = 'Probably a real photo'; }
      else { v.className = 'ac-verdict real'; v.textContent = 'Likely a real photo'; }
      $('ac-mark').style.left = Math.max(1, Math.min(99, pct)) + '%';
      $('ac-pct').textContent = 'AI score: ' + pct + '% (above ' + Math.round(r.threshold * 100) + '% counts as AI). This is a guess, not proof.';
      $('ac-res').hidden = false; $('ac-first').hidden = true;
    } catch (e) {
      $('ac-prog').hidden = true; console.error(e);
      toast(/memory|alloc|RangeError/i.test(String(e)) ? 'This device ran out of memory. Please try on a computer.' : 'Could not check: ' + (e && e.message || e) + '. Check your internet and try again.');
    }
    busy = false; b.disabled = false;
  });
})();
