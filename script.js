(function() {
  const btn = document.querySelector('.menu-toggle');
  const menuOverlay = document.getElementById('mobile-menu');
  const linkNodes = menuOverlay ? menuOverlay.querySelectorAll('[data-menu-link]') : [];
  const closeInside = menuOverlay?.querySelector('.mobile-menu-close');
  const firstLink = linkNodes?.[0] || null;

  function setBtn(e) {
    if (!btn) return;
    btn.classList.toggle('is-open', e);
    btn.setAttribute('aria-expanded', e);
    btn.setAttribute('aria-label', e ? 'Fechar menu' : 'Abrir menu');
    const t = btn.querySelector('.menu-icon');
    const o = btn.querySelector('.menu-label');
    t && (t.textContent = e ? '✕' : '☰');
    o && (o.textContent = e ? 'Fechar' : 'Menu');
  }

  function openMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.add('show');
    menuOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setBtn(true);
    try {
      history.pushState({
        menu: true
      }, '', '#menu')
    } catch (e) {}
    setTimeout(() => {
      (firstLink || closeInside || btn).focus?.()
    }, 0)
  }

  function closeMenu(e = false) {
    if (!menuOverlay) return;
    menuOverlay.classList.remove('show');
    menuOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setBtn(false);
    e && setTimeout(() => btn?.focus?.(), 0)
  }

  function toggleMenu(e) {
    const t = menuOverlay?.classList.contains('show');
    const o = e !== undefined ? e : !t;
    o ? openMenu() : closeMenu(false)
  }

  btn?.addEventListener('click', () => toggleMenu());
  document.querySelectorAll('[data-menu-link]')?.forEach(e => {
    e.addEventListener('click', () => closeMenu(!0))
  });
  window.addEventListener('popstate', e => {
    const t = history.state;
    if (t && t.menu) {
      if (!menuOverlay?.classList.contains('show')) {
        toggleMenu(!0)
      }
    } else {
      closeMenu(!0)
    }
  });


  /* FORMULÁRIO */
  const form = document.getElementById('briefing-form');
  const formStatus = document.getElementById('form-status');
  const submitButton = document.getElementById('submit-button');

  if (form) {
    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      formStatus.textContent = 'Enviando...';
      formStatus.classList.add('show');
      submitButton.disabled = true;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          formStatus.textContent = 'Projeto enviado com sucesso! Entraremos em contato em breve.';
          formStatus.style.color = 'green';
          form.reset();
        } else {
          formStatus.textContent = 'Ocorreu um erro ao enviar o projeto. Por favor, tente novamente.';
          formStatus.style.color = 'red';
        }
      } catch (error) {
        formStatus.textContent = 'Ocorreu um erro de conexão. Verifique sua internet e tente novamente.';
        formStatus.style.color = 'red';
      } finally {
        submitButton.disabled = false;
        setTimeout(() => {
          formStatus.classList.remove('show');
        }, 5000);
      }
    });
  }

  /* DESKTOP ADVICE */
  const overlay = document.getElementById('desktop-advice');
  const isAckValid = () => {
    const e = localStorage.getItem('desktopAdviceAck');
    return !!e && Date.now() - e < 86400000
  };
  const setAck = () => localStorage.setItem('desktopAdviceAck', Date.now());

  function openOverlay() {
    if (!overlay) return;
    const e = document.getElementById('desktop-share-url');
    e && (e.value = window.location.href);
    overlay.hidden = !1;
    overlay.classList.add('show');
    document.body.classList.add('overlay-open')
  }

  function closeOverlay(e) {
    if (!overlay) return;
    e && setAck();
    overlay.classList.remove('show');
    overlay.hidden = !0;
    document.body.classList.remove('overlay-open')
  }

  function maybeShowOverlay() {
    const e = window.matchMedia('(min-width: 1024px)').matches;
    if (!e) return;
    if (isAckValid()) return;
    openOverlay()
  }

  document.getElementById('desktop-continue')?.addEventListener('click', () => closeOverlay(true));
  document.getElementById('desktop-open-mobile')?.addEventListener('click', () => {
    const e = document.getElementById('desktop-hint');
    const t = document.getElementById('desktop-share-url');
    e.hidden = !e.hidden;
    !e.hidden && t && (t.value = window.location.href, t.select())
  });
  document.getElementById('desktop-copy-url')?.addEventListener('click', async () => {
    const e = document.getElementById('desktop-share-url');
    try {
      await navigator.clipboard.writeText(e.value);
      const t = document.getElementById('desktop-copy-url');
      const o = t.textContent;
      t.textContent = 'Copiado!';
      setTimeout(() => t.textContent = o, 1200)
    } catch (e) {}
  });
  document.getElementById('desktop-advice')?.addEventListener('click', e => {
    (e.target.hasAttribute('data-close') || e.target.classList.contains('overlay__close')) && closeOverlay(false)
  });
  window.addEventListener('load', maybeShowOverlay);
  window.addEventListener('resize', () => {
    const e = document.getElementById('desktop-advice');
    if (!e || e.hidden) return;
    const t = window.matchMedia('(min-width: 1024px)').matches;
    if (!t) {
      closeOverlay(false)
    }
  });

})();