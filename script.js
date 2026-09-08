const modal = document.querySelector('#schedule-modal');
const schedulerLoading = document.querySelector('#scheduler-loading');
const schedulerSetup = document.querySelector('#scheduler-setup');
const calBooking = document.querySelector('#cal-booking');
const menu = document.querySelector('.navlinks');
const menuButton = document.querySelector('.menu-button');
let lastFocus;
let schedulerStarted = false;

function startScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  const calLink = window.COLIBRI_SCHEDULING?.calLink?.trim().replace(/^https?:\/\/cal\.com\//, '').replace(/^\/+|\/+$/g, '');
  if (!calLink) {
    schedulerLoading.hidden = true;
    schedulerSetup.hidden = false;
    return;
  }

  calBooking.hidden = false;

  // Cal.com's embed loader queues these calls while its remote script loads.
  (function (C, A, L) {
    const queue = (api, args) => api.q.push(args);
    const document = C.document;
    C.Cal = C.Cal || function () {
      const cal = C.Cal;
      const args = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        const script = document.createElement('script');
        script.src = A;
        script.async = true;
        script.onerror = showSchedulerFallback;
        document.head.appendChild(script);
        cal.loaded = true;
      }
      if (args[0] === L) {
        const namespace = args[1];
        const api = function () { queue(api, arguments); };
        api.q = api.q || [];
        cal.ns[namespace] = api;
        queue(api, args);
        return;
      }
      queue(cal, args);
    };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');

  window.Cal('init', 'colibri', { origin: 'https://cal.com' });
  window.Cal.ns.colibri('inline', {
    elementOrSelector: '#cal-booking',
    calLink,
    config: { theme: 'light' }
  });
  window.Cal.ns.colibri('ui', {
    hideEventTypeDetails: false,
    styles: {
      branding: { brandColor: '#2e7568' },
      body: { background: '#fbfdf9' }
    }
  });

  // Keep a loading hint briefly; Cal.com replaces the target when ready.
  window.setTimeout(() => { schedulerLoading.hidden = true; }, 1200);
}

function showSchedulerFallback() {
  schedulerLoading.hidden = true;
  schedulerSetup.hidden = false;
}

function openSchedule(event) {
  if (event) event.preventDefault();
  lastFocus = document.activeElement;
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  startScheduler();
  setTimeout(() => modal.querySelector('.close')?.focus(), 0);
}
function closeSchedule() {
  modal.classList.remove('open');
  document.body.classList.remove('modal-open');
  lastFocus?.focus();
}
document.querySelectorAll('.schedule-open').forEach(el => el.addEventListener('click', openSchedule));
document.querySelector('.close').addEventListener('click', closeSchedule);
modal.addEventListener('click', e => { if (e.target === modal) closeSchedule(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeSchedule(); });
menuButton.addEventListener('click', () => { const open = menu.classList.toggle('open'); menuButton.setAttribute('aria-expanded', open); menuButton.textContent = open ? '×' : '☰'; });
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.textContent = '☰'; }));
