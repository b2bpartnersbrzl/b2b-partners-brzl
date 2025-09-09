/* MENU, NAVEGAÇÃO, FORM */
(function(){
  /* MENU MOBILE */
  const btn = document.querySelector('.menu-toggle');
  const menuOverlay = document.getElementById('mobile-menu');
  const panel = menuOverlay?.querySelector('.mobile-menu-panel');
  const closeInside = menuOverlay?.querySelector('.mobile-menu-close');
  const linkNodes = menuOverlay ? menuOverlay.querySelectorAll('[data-menu-link]') : [];

  function setBtn(open){
    if(!btn) return;
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    const icon = btn.querySelector('.menu-icon');
    const label = btn.querySelector('.menu-label');
    if(icon) icon.textContent = open ? '✕' : '☰';
    if(label) label.textContent = open ? 'Fechar' : 'Menu';
    if(open){ btn.classList.remove('menu-pulse'); } else { btn.classList.add('menu-pulse'); }
  }

  function toggleMenu(force){
    const open = menuOverlay?.classList.contains('show');
    const want = (force !== undefined) ? force : !open;
    if(want){
      menuOverlay.classList.add('show');
      menuOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setBtn(true);
      try{ history.pushState({menu:true}, '', '#menu'); }catch(_){}
      const firstFocusable = menuOverlay.querySelector('a, button');
      setTimeout(()=> firstFocusable?.focus?.(), 0);
    } else {
      menuOverlay.classList.remove('show');
      menuOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setBtn(false);
    }
  }

  btn?.addEventListener('click', ()=> toggleMenu());
  closeInside?.addEventListener('click', ()=> toggleMenu(false));

  linkNodes.forEach(a => {
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const href = a.getAttribute('href') || '';
      if(href === '#top'){
        toggleMenu(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        try{ history.replaceState({}, '', '#'); }catch(_){}
        return;
      }
      const id = href.replace(/^#/, '');
      const target = document.getElementById(id);
      toggleMenu(false);
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
      try{ history.replaceState({}, '', '#'+id); }catch(_){}
    });
  });

  menuOverlay?.addEventListener('click', (e)=>{
    if(!panel) return;
    if(!panel.contains(e.target)) toggleMenu(false);
  });
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && menuOverlay?.classList.contains('show')) toggleMenu(false);
  });
  window.addEventListener('popstate', ()=> {
    if(menuOverlay?.classList.contains('show')) toggleMenu(false);
  });

  /* LINKS "Início" (desktop e logo) */
  const topLinks = document.querySelectorAll('a.top-link');
  topLinks.forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try{ history.replaceState({}, '', '#'); }catch(_){}
    });
  });

  /* FORM – status */
  const form = document.getElementById('briefing-form');
  const statusEl = document.getElementById('form-status');
  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const sbtn = form.querySelector('button[type="submit"]');
      const data = new FormData(form);
      const resetStatus = () => { statusEl.textContent=''; statusEl.className='form-status'; };
      resetStatus();

      // Honeypot
      if ((data.get('website') || '').trim() !== '') return;

      const consent = form.querySelector('#lgpd');
      if(!consent || !consent.checked){
        statusEl.textContent = 'Para enviar, marque o consentimento LGPD.';
        statusEl.classList.add('form-status--error');
        statusEl.scrollIntoView({behavior:'smooth', block:'nearest'});
        return;
      }
      if(!data.get('nome') || !data.get('email') || !data.get('mensagem')){
        statusEl.textContent = 'Preencha nome, e-mail e mensagem.';
        statusEl.classList.add('form-status--error');
        statusEl.scrollIntoView({behavior:'smooth', block:'nearest'});
        return;
      }

      data.append('timestamp', new Date().toISOString());

      sbtn.disabled = true;
      const prev = sbtn.textContent;
      sbtn.textContent = 'Enviando…';

      try{
        await fetch(form.action, { method: 'POST', body: data, mode: 'no-cors' });
        statusEl.textContent = 'Recebido. Entraremos em contato em breve.';
        statusEl.classList.add('form-status--success');
        statusEl.scrollIntoView({behavior:'smooth', block:'nearest'});
        form.reset();
      }catch(err){
        statusEl.textContent = 'Não foi possível enviar agora. Tente novamente.';
        statusEl.classList.add('form-status--error');
        statusEl.scrollIntoView({behavior:'smooth', block:'nearest'});
      }finally{
        sbtn.disabled = false;
        sbtn.textContent = prev;
      }
    });
  }
})();