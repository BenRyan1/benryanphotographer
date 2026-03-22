// ============================================================
// REPLACE the submitInq / submitModal functions in BOTH
// gallery.html AND editions.html with these versions
// ============================================================

// ── FOR gallery.html — replace submitInq(event) ──
function submitInq(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.bsub');
  btn.textContent = 'Sending…'; btn.disabled = true;

  const w = W[curIdx];
  const form = e.target;

  const payload = {
    title:     w.t,
    series:    w.s + ' · ' + w.y,
    firstName: form.querySelector('input[type=text]').value,
    lastName:  form.querySelectorAll('input[type=text]')[1].value,
    email:     form.querySelector('input[type=email]').value,
    phone:     form.querySelector('input[type=tel]')?.value || '',
    size:      form.querySelector('#inqSz').options[form.querySelector('#inqSz').selectedIndex].text,
    framing:   form.querySelector('#inqFr').options[form.querySelector('#inqFr').selectedIndex].text,
    total:     document.getElementById('obTot').textContent,
    message:   form.querySelector('textarea').value,
  };

  fetch('https://benryan-photo-inquiry.YOUR-SUBDOMAIN.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      closeInq();
      toast('Inquiry sent! Ben will reply within 48 hours with a secure Stripe payment link.', 'g');
    } else {
      throw new Error('failed');
    }
  })
  .catch(() => {
    toast('Something went wrong — please email benryanphotographer@gmail.com directly.');
  })
  .finally(() => {
    btn.textContent = 'Send Acquisition Request →';
    btn.disabled = false;
    e.target.reset();
    recalc();
  });
}

// ── FOR editions.html — replace submitModal(event) ──
function submitModal(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.bsub');
  btn.textContent = 'Sending…'; btn.disabled = true;

  const d = ED[curEd] || ED[0];
  const form = e.target;

  const payload = {
    title:     d.t,
    series:    d.s,
    firstName: form.querySelector('input[type=text]').value,
    lastName:  form.querySelectorAll('input[type=text]')[1].value,
    email:     form.querySelector('input[type=email]').value,
    phone:     form.querySelector('input[type=tel]')?.value || '',
    size:      form.querySelector('#mSz').options[form.querySelector('#mSz').selectedIndex].text,
    framing:   form.querySelector('#mFr').options[form.querySelector('#mFr').selectedIndex].text,
    total:     document.getElementById('obTot').textContent,
    message:   form.querySelector('textarea').value,
  };

  fetch('https://benryan-photo-inquiry.YOUR-SUBDOMAIN.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      closeModal();
      toast('Acquisition request received! Ben will reply within 48 hours with a secure Stripe payment link.', 'g');
    } else {
      throw new Error('failed');
    }
  })
  .catch(() => {
    toast('Something went wrong — please email benryanphotographer@gmail.com directly.');
  })
  .finally(() => {
    btn.textContent = 'Send Acquisition Request — Stripe Invoice Follows →';
    btn.disabled = false;
    e.target.reset();
    recalc();
  });
}
