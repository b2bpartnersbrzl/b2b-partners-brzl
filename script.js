(function() {
  /* FORMULÁRIO */
  const form = document.getElementById('briefing-form');
  const formStatus = document.getElementById('form-status');
  const submitButton = document.getElementById('submit-button');

  if (form) {
    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      const lgpdCheckbox = document.getElementById('lgpd');
      if (!lgpdCheckbox.checked) {
        formStatus.textContent = 'Por favor, marque o campo de consentimento para continuar.';
        formStatus.style.color = 'red';
        formStatus.classList.add('show');
        return;
      }

      formStatus.textContent = 'Enviando...';
      formStatus.style.color = 'inherit';
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