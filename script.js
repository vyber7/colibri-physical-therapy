const modal = document.querySelector('#contact-modal');
const form = document.querySelector('#contact-form');
const submit = document.querySelector('#contact-submit');
const error = document.querySelector('#contact-error');
const success = document.querySelector('#contact-success');
const emailStep = document.querySelector('#contact-email-step');
const emailLink = document.querySelector('#contact-email-link');
const menu = document.querySelector('.navlinks');
const menuButton = document.querySelector('.menu-button');
const config = window.COLIBRI_CONTACT || {};
const emailjs = config.emailjs || {};
const emailjsReady = ['publicKey', 'serviceId', 'templateId'].every(key => emailjs[key]?.trim());
const email = config.email || 'contact@keysphysicaltherapy.com';
let lastFocus;
let sending = false;

if (emailjsReady) {
  submit.textContent = 'Send request →';
  document.querySelector('#contact-delivery-note').hidden = true;
}
document.querySelector('.contact-email-address').textContent = email;
document.querySelector('.contact-email-address').href = `mailto:${email}`;
const submitLabel = submit.textContent;

function closeMenu() {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = '☰';
}

function openContact(event) {
  event.preventDefault();
  lastFocus = document.activeElement;
  closeMenu();
  if (!success.hidden) {
    form.reset();
    form.hidden = false;
    success.hidden = true;
  }
  modal.showModal();
  modal.scrollTop = 0;
  document.body.classList.add('modal-open');
  if (!form.hidden) document.querySelector('#contact-name').focus();
  else emailLink.focus();
}

function closeContact() {
  modal.close();
}

modal.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  // The mobile menu is collapsed while the dialog is open.
  if (lastFocus?.getClientRects().length) lastFocus.focus();
  else menuButton.focus();
});
document.querySelectorAll('.contact-open').forEach(el => el.addEventListener('click', openContact));
document.querySelector('.close').addEventListener('click', closeContact);
document.querySelector('#contact-done').addEventListener('click', closeContact);
modal.addEventListener('click', event => { if (event.target === modal) closeContact(); });
modal.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...modal.querySelectorAll('a[href], button, input, textarea, [tabindex]')]
    .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
document.querySelector('#contact-edit').addEventListener('click', () => {
  emailStep.hidden = true;
  form.hidden = false;
  document.querySelector('#contact-name').focus();
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || !form.reportValidity()) return;
  error.hidden = true;
  const details = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
  if (!details.name) {
    error.textContent = 'Please enter your name.';
    error.hidden = false;
    document.querySelector('#contact-name').focus();
    return;
  }

  if (!emailjsReady) {
    const body = `Visit request for Colibri Physical Therapy\n\nName: ${details.name}\nEmail: ${details.email}\nPhone: ${details.phone || 'Not provided'}\nZIP code: ${details.zip}\n\nMessage: ${details.message || 'Not provided'}`;
    emailLink.href = `mailto:${email}?subject=${encodeURIComponent('Visit request — Colibri Physical Therapy')}&body=${encodeURIComponent(body)}`;
    form.hidden = true;
    emailStep.hidden = false;
    emailLink.focus();
    emailLink.click();
    return;
  }

  sending = true;
  submit.disabled = true;
  submit.textContent = 'Sending…';
  form.setAttribute('aria-busy', 'true');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: emailjs.serviceId.trim(),
        template_id: emailjs.templateId.trim(),
        user_id: emailjs.publicKey.trim(),
        template_params: { ...details, reply_to: details.email }
      }),
      signal: controller.signal
    });
    if (!response.ok || (await response.text()).trim() !== 'OK') throw new Error('Request not accepted');
    form.hidden = true;
    emailStep.hidden = true;
    success.hidden = false;
    if (modal.open) success.focus();
  } catch {
    error.textContent = 'We couldn’t send your request. Please try again or email us using the link below.';
    const link = document.createElement('a');
    link.href = `mailto:${email}`;
    link.textContent = email;
    error.append(document.createElement('br'), link);
    error.hidden = false;
  } finally {
    clearTimeout(timeout);
    sending = false;
    submit.disabled = false;
    submit.textContent = submitLabel;
    form.removeAttribute('aria-busy');
  }
});

menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open);
  menuButton.textContent = open ? '×' : '☰';
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
