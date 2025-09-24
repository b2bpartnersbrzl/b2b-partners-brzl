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

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData
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
})();