(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion\b/.test(location.search);
  const desktop = matchMedia('(min-width: 1024px)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Contact details live here: change them once, every button follows.
  const WA = '41783399901';
  const TEL = '+41783399901';
  $$('[data-wa-link]').forEach((a) => { a.href = `https://wa.me/${WA}`; });
  $$('a[href^="tel:"]').forEach((a) => { a.href = `tel:${TEL}`; });

  let lenis = null;
  const hdr = $('[data-hdr]');
  const hdrH = () => hdr.getBoundingClientRect().height;
  const scrollToEl = (el, offset = 0) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -hdrH() + offset, duration: 1.3 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - hdrH() + offset, behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- Header ---------- */
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    hdr.classList.toggle('is-scrolled', y > 8);
    const down = y > lastY + 4;
    const up = y < lastY - 4;
    if (!document.body.classList.contains('menu-open')) {
      if (down && y > window.innerHeight * 0.9) hdr.classList.add('is-hidden');
      else if (up || y < 200) hdr.classList.remove('is-hidden');
    }
    lastY = y;
    floating(y);
  };

  /* ---------- Floating contact + dock ---------- */
  const fab = $('[data-fab]');
  const dock = $('[data-dock]');
  const footer = $('.foot');
  let footerIn = false;
  const floating = (y) => {
    const past = y > window.innerHeight * 0.75;
    fab.classList.toggle('is-visible', past && !footerIn);
    dock.classList.toggle('is-visible', past);
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { footerIn = e.isIntersecting; floating(window.scrollY); }, { threshold: 0.05 }).observe(footer);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // current section in the nav
  const navLinks = $$('.hdr__nav a');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['institut', 'laser', 'carte', 'cabines', 'avis', 'reserver'].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const menu = $('#menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    hdr.classList.remove('is-hidden');
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ---------- In-page links ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#' || id === '#main') return;
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    if (!menu.hidden) setMenu(false);
    if (id === '#top') {
      if (lenis) lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    } else {
      scrollToEl(target);
    }
    history.replaceState(null, '', id);
  });

  /* ---------- Opening status (Europe/Zurich) ---------- */
  const now = (() => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), mins: +get('hour') * 60 + +get('minute') };
    } catch (_) {
      const d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  })();
  const weekday = now.day >= 1 && now.day <= 5;
  const isOpen = weekday && now.mins >= 540 && now.mins < 1200;
  let status;
  if (isOpen) status = 'Ouvert maintenant · jusqu’à 20h';
  else if (weekday && now.mins < 540) status = 'Fermé · ouvre aujourd’hui à 9h';
  else if (now.day >= 1 && now.day <= 4) status = 'Fermé · rouvre demain à 9h';
  else status = 'Fermé · rouvre lundi à 9h';
  const chip = $('[data-status-short]');
  if (chip) { chip.textContent = status; chip.parentElement.classList.toggle('is-open', isOpen); }
  const st = $('[data-status-text]');
  if (st) { st.textContent = status; st.parentElement.classList.toggle('is-open', isOpen); }
  const today = $(`[data-hours] [data-day="${now.day}"]`);
  if (today) today.classList.add('is-today');

  /* ---------- Carte tabs ---------- */
  const tabs = $$('[data-tab]');
  const selectTab = (key, focus) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === key;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) {
        if (focus) t.focus();
        const bar = t.parentElement;
        if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: t.offsetLeft - 24, behavior: 'smooth' });
      }
    });
    $$('[data-panel]').forEach((p) => {
      const on = p.dataset.panel === key;
      p.hidden = !on;
      if (on && !reduce) {
        p.classList.remove('is-entering');
        void p.offsetWidth;
        $$('.mlist li', p).forEach((li, i) => { li.style.animationDelay = `${Math.min(i, 12) * 0.035}s`; });
        p.classList.add('is-entering');
      }
    });
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t.dataset.tab));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      selectTab(n.dataset.tab, true);
    });
  });

  /* ---------- Booking form helpers ---------- */
  const form = $('[data-form]');
  const soinSel = form.elements.soin;
  const flash = (el) => {
    const f = el.closest('.field') || el;
    f.animate([{ backgroundColor: 'rgba(220,195,154,.45)' }, { backgroundColor: 'rgba(220,195,154,0)' }], { duration: 1600, easing: 'ease-out' });
  };
  const goToForm = (focusField) => {
    scrollToEl($('#reserver'), 10);
    setTimeout(() => { if (focusField) focusField.focus({ preventScroll: true }); }, lenis ? 1350 : 700);
  };

  // tap a soin in the carte → it lands in the form
  $$('.mi[data-soin]').forEach((b) => b.addEventListener('click', () => {
    soinSel.value = b.dataset.soin;
    if (/^Zones :/.test(form.elements.message.value) && !/^Laser/.test(b.dataset.soin)) form.elements.message.value = '';
    flash(soinSel);
    goToForm(form.elements.nom.value ? null : form.elements.nom);
  }));

  /* ---------- Laser composer ---------- */
  const zones = $$('.zone');
  const zCount = $('[data-composer-count]');
  const zPrice = $('[data-composer-price]');
  const zBook = $('[data-composer-book]');
  const picked = () => zones.filter((z) => z.getAttribute('aria-pressed') === 'true');
  const updateComposer = () => {
    const sel = picked();
    const total = sel.reduce((s, z) => s + +z.dataset.price, 0);
    const from = sel.some((z) => z.dataset.from === '1');
    if (!sel.length) {
      zCount.textContent = 'Aucune zone sélectionnée';
      zPrice.textContent = '—';
      zBook.disabled = true;
      return;
    }
    zCount.textContent = `${sel.length} ${sel.length > 1 ? 'zones sélectionnées' : 'zone sélectionnée'} · par séance`;
    zPrice.textContent = `${from ? 'dès ' : ''}CHF ${total}.–`;
    zBook.disabled = false;
  };
  zones.forEach((z) => z.addEventListener('click', () => {
    z.setAttribute('aria-pressed', String(z.getAttribute('aria-pressed') !== 'true'));
    updateComposer();
  }));
  zBook.addEventListener('click', () => {
    const sel = picked();
    if (!sel.length) return;
    const total = sel.reduce((s, z) => s + +z.dataset.price, 0);
    const from = sel.some((z) => z.dataset.from === '1');
    soinSel.value = 'Épilation laser · plusieurs zones';
    form.elements.message.value = `Zones : ${sel.map((z) => z.dataset.zone).join(', ')} (${from ? 'dès ' : ''}CHF ${total}.– par séance d’après la carte)`;
    flash(soinSel);
    flash(form.elements.message);
    goToForm(form.elements.nom.value ? null : form.elements.nom);
  });

  /* ---------- Form → WhatsApp ---------- */
  const err = $('[data-form-error]');
  const ok = $('[data-form-ok]');
  try {
    const d = new Date();
    form.elements.date.min = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  } catch (_) {}
  const fail = (msg, field) => {
    err.textContent = msg;
    err.hidden = false;
    if (field) { field.closest('.field').classList.add('is-invalid'); field.focus(); }
  };
  $$('input, select, textarea', form).forEach((f) => f.addEventListener('input', () => {
    const w = f.closest('.field');
    if (w) w.classList.remove('is-invalid');
    err.hidden = true;
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    $$('.is-invalid', form).forEach((x) => x.classList.remove('is-invalid'));
    ok.hidden = true;
    const nom = f.nom.value.trim();
    const tel = f.tel.value.trim();
    const soin = f.soin.value;
    if (nom.length < 2) return fail('Merci d’indiquer votre prénom et votre nom.', f.nom);
    if (tel.replace(/\D/g, '').length < 9) return fail('Merci d’indiquer un numéro de téléphone valide.', f.tel);
    if (!soin) return fail('Quel soin souhaitez-vous réserver ?', f.soin);
    err.hidden = true;

    const lines = ['Bonjour,', '', 'Je souhaiterais prendre rendez-vous à L’étoile Bleue.', '', `• Soin : ${soin}`];
    if (f.date.value) {
      const d = new Date(f.date.value + 'T12:00:00');
      lines.push(`• Date souhaitée : ${d.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' })}`);
    }
    const moment = form.querySelector('input[name="moment"]:checked');
    if (moment) lines.push(`• De préférence ${moment.value}`);
    if (f.premiere.checked) lines.push('• C’est ma première visite (offre −30 %)');
    if (f.message.value.trim()) lines.push('', f.message.value.trim());
    lines.push('', nom, tel);
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`;
    const w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url;
    ok.hidden = false;
  });

  /* ---------- Lightbox ---------- */
  const lb = $('[data-lb]');
  const shots = $$('[data-shot]');
  const lbImg = $('[data-lb-img]');
  const lbCap = $('[data-lb-cap]');
  let lbIndex = 0;
  const showShot = (i) => {
    lbIndex = (i + shots.length) % shots.length;
    const s = shots[lbIndex];
    lbImg.src = s.dataset.full;
    lbImg.alt = $('img', s).alt;
    lbCap.textContent = $('figcaption', s).lastChild.textContent.trim();
  };
  if (lb && typeof lb.showModal === 'function') {
    shots.forEach((s, i) => $('.shot__btn', s).addEventListener('click', () => {
      if (dragged) return;
      showShot(i);
      lb.showModal();
      if (lenis) lenis.stop();
    }));
    lb.addEventListener('close', () => { if (lenis) lenis.start(); });
    $('[data-lb-close]').addEventListener('click', () => lb.close());
    $('[data-lb-prev]').addEventListener('click', () => showShot(lbIndex - 1));
    $('[data-lb-next]').addEventListener('click', () => showShot(lbIndex + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'FIGURE') lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') showShot(lbIndex + 1);
      if (e.key === 'ArrowLeft') showShot(lbIndex - 1);
    });
    let tx = null;
    lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) showShot(lbIndex + (dx < 0 ? 1 : -1));
      tx = null;
    });
  } else {
    shots.forEach((s) => $('.shot__btn', s).addEventListener('click', () => window.open(s.dataset.full, '_blank')));
  }

  // mouse drag on the gallery rail when it is a native scroller (tablet/laptop without pin)
  const rail = $('[data-htrack]');
  let dragged = false;
  if (rail && finePointer) {
    let down = false, sx = 0, sl = 0;
    rail.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || $('.cabines').classList.contains('is-pinned')) return;
      down = true; dragged = false; sx = e.clientX; sl = rail.scrollLeft;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (!dragged && Math.abs(dx) > 6) { dragged = true; rail.style.scrollSnapType = 'none'; }
      if (dragged) rail.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      rail.style.scrollSnapType = '';
      setTimeout(() => { dragged = false; }, 0);
    });
  }

  /* ---------- Reviews reel (seamless loop) ---------- */
  const reel = $('[data-reel]');
  const track = $('[data-reel-track]');
  const buildReel = () => {
    if (!track || reduce) return;
    $$('[data-clone]', track).forEach((c) => c.remove());
    const originals = [...track.children];
    const gap = parseFloat(getComputedStyle(track).columnGap) || 22;
    const setW = originals.reduce((w, el) => w + el.getBoundingClientRect().width + gap, 0);
    const copies = Math.max(1, Math.ceil(window.innerWidth / setW));
    const addSet = () => originals.forEach((el) => {
      const c = el.cloneNode(true);
      c.setAttribute('data-clone', '');
      c.setAttribute('aria-hidden', 'true');
      if (c.tagName === 'A') c.tabIndex = -1;
      track.appendChild(c);
    });
    for (let i = 1; i < copies; i++) addSet();
    for (let i = 0; i < copies; i++) addSet();
    const unit = setW * copies;
    track.style.setProperty('--reel-shift', `-${unit}px`);
    reel.style.setProperty('--reel-dur', `${Math.round(unit / 38)}s`);
    reel.classList.add('is-running');
  };

  /* ---------- Night sky ---------- */
  const sky = $('[data-sky]');
  if (sky) {
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 64; i++) {
      const s = document.createElement('i');
      const big = rnd() > 0.88;
      s.style.cssText = `left:${(rnd() * 100).toFixed(2)}%;top:${(rnd() * 100).toFixed(2)}%;--s:${big ? 9 + rnd() * 6 : 2 + rnd() * 4}px;--o:${(0.2 + rnd() * 0.6).toFixed(2)};--d:${(3 + rnd() * 5).toFixed(1)}s;--dl:${(-rnd() * 6).toFixed(1)}s;${big || rnd() > 0.8 ? '--c:#DCC39A;' : ''}`;
      frag.appendChild(s);
    }
    sky.appendChild(frag);
  }

  /* ---------- Floating cards follow the pointer ---------- */
  const floaters = $$('.floater');
  const avis = $('#avis');
  if (finePointer && !reduce && avis) {
    avis.addEventListener('pointermove', (e) => {
      if (!desktop.matches) return;
      const r = avis.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      floaters.forEach((f) => { const d = +f.dataset.depth || 20; f.style.translate = `${(nx * d).toFixed(1)}px ${(ny * d).toFixed(1)}px`; });
    });
    avis.addEventListener('pointerleave', () => floaters.forEach((f) => { f.style.translate = ''; }));
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) {
    $$('[data-magnet]').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${((e.clientX - r.left) / r.width - 0.5) * 10}px ${((e.clientY - r.top) / r.height - 0.5) * 8}px`;
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }

  /* ---------- Floating Google review toast ---------- */
  const toast = $('[data-toast]');
  const quotes = [
    { t: '« Une expérience de qualité à chaque visite. »', n: 'Paulo Sergio D. S.' },
    { t: '« Après trois séances j’ai déjà remarqué la différence. »', n: 'Naoma B.' },
    { t: '« Super bien équipé et service de qualité. »', n: 'Camila M.' },
  ];
  let toastOff = false;
  try { toastOff = sessionStorage.getItem('eb-toast') === '1'; } catch (_) {}
  if (toast && !toastOff && desktop.matches) {
    const tText = $('[data-toast-text]');
    const tName = $('[data-toast-name]');
    let k = 0, timer = null, suppressed = false, started = false;
    const fill = () => { tText.textContent = quotes[k].t; tName.textContent = `${quotes[k].n} · Avis Google, 5 étoiles`; };
    const show = () => { if (suppressed) return; toast.hidden = false; requestAnimationFrame(() => toast.classList.add('is-in')); };
    const hide = () => toast.classList.remove('is-in');
    const cycle = () => { hide(); setTimeout(() => { k = (k + 1) % quotes.length; fill(); show(); }, 600); };
    const start = () => { if (started) return; started = true; fill(); setTimeout(() => { show(); timer = setInterval(cycle, 8000); }, 400); };
    addEventListener('scroll', function once() {
      if (window.scrollY > window.innerHeight * 0.8) { setTimeout(start, 1500); removeEventListener('scroll', once); }
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      const zonesIn = new Set();
      const tio = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? zonesIn.add(e.target) : zonesIn.delete(e.target)));
        suppressed = zonesIn.size > 0;
        if (suppressed) hide(); else if (started) show();
      }, { threshold: 0.12 });
      ['.hero', '.composer', '.carte__paper', '#avis', '#reserver', '.foot'].forEach((s) => { const el = $(s); if (el) tio.observe(el); });
    }
    $('[data-toast-close]').addEventListener('click', () => {
      clearInterval(timer);
      hide();
      setTimeout(() => { toast.hidden = true; }, 600);
      try { sessionStorage.setItem('eb-toast', '1'); } catch (_) {}
    });
  }

  /* ---------- Year ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ==========================================================================
     Motion
     ========================================================================== */
  const late = performance.now() - (window.__t0 || 0) > 2300;
  const hasGsap = window.gsap && window.ScrollTrigger;
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

  if (!hasGsap || reduce) {
    root.classList.remove('pre-intro');
    if (!reduce) $('[data-floaters]').classList.add('is-floating');
    fontsReady.then(buildReel);
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  // smooth scrolling (wheel only; touch keeps native momentum)
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.105, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const vh = window.innerHeight;
  const belowFold = (el) => el.getBoundingClientRect().top > vh * 0.92;

  /* hero intro */
  if (!late) {
    gsap.set('.hero__title .line > span', { y: 0, yPercent: 112 });
    gsap.set('[data-hero]', { opacity: 0, y: 26 });
    gsap.set('[data-hero-card]', { opacity: 0, y: 46 });
    gsap.set('.hero__status', { opacity: 0, y: -8 });
    gsap.set('.hero .veil', { scaleY: 1, transformOrigin: '50% 0%' });
    gsap.set('[data-hero-img] img', { scale: 1.22 });
    gsap.set(hdr, { opacity: 0, y: -16 });
    root.classList.remove('pre-intro');
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .to('.hero .veil', { scaleY: 0, duration: 1.35, ease: 'expo.inOut' }, 0.05)
      .to('[data-hero-img] img', { scale: 1, duration: 2.4 }, 0.3)
      .to('.hero__title .line > span', { yPercent: 0, duration: 1.4, stagger: 0.11 }, 0.2)
      .to(hdr, { opacity: 1, y: 0, duration: 1, clearProps: 'transform,opacity' }, 0.35)
      .to('[data-hero]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, clearProps: 'transform' }, 0.6)
      .to('[data-hero-card]', { opacity: 1, y: 0, duration: 1.3 }, 1.05)
      .to('.hero__status', { opacity: 1, y: 0, duration: 0.9 }, 1.25)
      .fromTo('.hero__glint', { rotate: -180, scale: 0 }, { rotate: 0, scale: 1, duration: 1.6, ease: 'back.out(2)' }, 0.75);
  } else {
    root.classList.remove('pre-intro');
    gsap.set('.hero__title .line > span, .hero .veil', { clearProps: 'transform' });
  }

  // hero drifts as you leave it
  gsap.to('[data-hero-img] img', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('[data-hero-card]', { yPercent: -45, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* split headings into lines and lift them */
  const splitLines = (el) => {
    const original = el.innerHTML;
    const words = el.textContent.trim().split(/ +/);
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    el.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
    const lines = [];
    let top = null;
    $$('.w', el).forEach((w) => {
      if (top === null || Math.abs(w.offsetTop - top) > 4) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    el.innerHTML = lines.map((l) => `<span class="split-line"><span>${esc(l.join(' '))}</span></span>`).join('');
    return original;
  };
  fontsReady.then(() => {
    $$('[data-split]').forEach((el) => {
      if (!belowFold(el)) return;
      const original = splitLines(el);
      const inner = $$('.split-line > span', el);
      gsap.set(inner, { yPercent: 108 });
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(inner, { yPercent: 0, duration: 1.25, ease: 'expo.out', stagger: 0.09, onComplete: () => { el.innerHTML = original; } }),
      });
    });
    buildReel();
    ScrollTrigger.refresh();
  });

  /* fade-up reveals */
  const items = $$('[data-reveal]').filter(belowFold);
  gsap.set(items, { opacity: 0, y: 34 });
  const reveal = (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08, overwrite: true, clearProps: 'transform' });
  ScrollTrigger.batch(items, { start: 'top 92%', onEnter: reveal, onEnterBack: reveal });

  /* image veils + parallax */
  $$('[data-veil]').forEach((fig) => {
    if (!belowFold(fig)) return;
    const veil = $('.veil', fig);
    const img = $('img', fig);
    gsap.set(veil, { scaleY: 1 });
    gsap.set(img, { scale: 1.18 });
    ScrollTrigger.create({
      trigger: fig, start: 'top 86%', once: true,
      onEnter: () => {
        gsap.to(veil, { scaleY: 0, duration: 1.3, ease: 'expo.inOut' });
        gsap.to(img, { scale: 1, duration: 2, ease: 'expo.out', delay: 0.15 });
      },
    });
  });
  $$('[data-parallax]').forEach((el) => {
    const v = +el.dataset.parallax || 6;
    gsap.fromTo(el, { yPercent: -v }, { yPercent: v, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* counters */
  $$('[data-count]').forEach((el) => {
    const to = +el.dataset.count;
    const dec = to < 10;
    const o = { v: 0 };
    const render = () => { el.textContent = dec ? o.v.toFixed(1).replace('.', ',') : Math.round(o.v); };
    if (!belowFold(el)) return;
    render();
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: render }) });
  });

  /* floaters drift in, then keep floating (CSS) */
  const floatWrap = $('[data-floaters]');
  gsap.from('.floater', {
    opacity: 0, y: 70, rotate: (i) => [-8, 6, -5][i], duration: 1.4, ease: 'expo.out', stagger: 0.14,
    scrollTrigger: { trigger: floatWrap, start: 'top 80%', once: true },
    onComplete: () => { gsap.set('.floater', { clearProps: 'transform' }); floatWrap.classList.add('is-floating'); },
  });

  /* horizontal gallery, pinned on desktop */
  const cab = $('.cabines');
  const htrack = $('[data-htrack]');
  gsap.matchMedia().add('(min-width: 1024px)', () => {
    cab.classList.add('is-pinned');
    htrack.scrollLeft = 0;
    const dist = () => Math.max(0, htrack.scrollWidth - window.innerWidth);
    const tween = gsap.to(htrack, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: cab, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    $$('.shot', htrack).forEach((s) => {
      gsap.fromTo($('img', s), { scale: 1.16, xPercent: 4 }, { scale: 1, xPercent: -4, ease: 'none', scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });
    return () => { cab.classList.remove('is-pinned'); gsap.set(htrack, { clearProps: 'transform' }); };
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
