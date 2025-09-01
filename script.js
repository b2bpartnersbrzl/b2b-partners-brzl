/* ===== MENU, NAVEGAÇÃO, FORM, OVERLAY ===== */
(function(){
  /* MENU MOBILE */
  const btn = document.querySelector('.menu-toggle');
  const menuOverlay = document.getElementById('mobile-menu');
  const panel = menuOverlay?.querySelector('.mobile-menu-panel');
  const closeInside = menuOverlay?.querySelector('.mobile-menu-close');
  const linkNodes = menuOverlay ? menuOverlay.querySelectorAll('[data-menu-link]') : [];
  const firstLink = linkNodes?.[0] || null;

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

  function openMenu(){
    if(!menuOverlay) return;
    menuOverlay.classList.add('show');
    menuOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setBtn(true);
    try{ history.pushState({menu:true}, '', '#menu'); }catch(_){}
    setTimeout(()=> { (firstLink || closeInside || btn).focus?.(); }, 0);
  }
  function closeMenu(fromHistory=false){
    if(!menuOverlay) return;
    menuOverlay.classList.remove('show');
    menuOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setBtn(false);
    if(fromHistory){ setTimeout(()=> btn?.focus?.(), 0); }
  }
  function toggleMenu(force){
    const open = menuOverlay?.classList.contains('show');
    const want = (force !== undefined) ? force : !open;
    want ? openMenu() : closeMenu();
  }

  btn?.addEventListener('click', ()=> toggleMenu());
  closeInside?.addEventListener('click', ()=> closeMenu());

  // Navegação do menu mobile (fecha + rola)
  linkNodes.forEach(a => {
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const href = a.getAttribute('href') || '';
      if(href === '#top'){
        closeMenu(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        try{ history.replaceState({}, '', '#'); }catch(_){}
        return;
      }
      const id = href.replace(/^#/, '');
      const target = document.getElementById(id);
      closeMenu(true);
      if(target) target.scrollIntoView({behavior:'smooth'});
      try{ history.replaceState({}, '', '#'+id); }catch(_){}
    });
  });

  // Clique fora fecha painel
  menuOverlay?.addEventListener('click', (e)=>{
    if(!panel) return;
    if(!panel.contains(e.target)) closeMenu();
  });
  // Esc fecha
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && menuOverlay?.classList.contains('show')) closeMenu(); });
  // Back fecha
  window.addEventListener('popstate', ()=> {
    if(menuOverlay?.classList.contains('show')) closeMenu(true);
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

      // LGPD / obrigatórios
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

      sbtn.disabled = true; const prev = sbtn.textContent; sbtn.textContent = 'Enviando…';
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
        sbtn.disabled = false; sbtn.textContent = prev;
      }
    });
  }

  /* AVISO DESKTOP */
  const OVERLAY_ID = 'desktop-advice';
  const KEY_TS = 'b2b_desktop_notice_ack_ts';
  const TTL_DAYS = 30;
  const overlay = document.getElementById(OVERLAY_ID);
  const shareInput = document.getElementById('desktop-share-url');

  function daysToMs(d){ return d*24*60*60*1000; }
  function isAckValid(){
    try{
      const ts = parseInt(localStorage.getItem(KEY_TS) || '0', 10);
      return ts && (Date.now() - ts) < daysToMs(TTL_DAYS);
    }catch(_){ return false; }
  }
  function setAck(){ try{ localStorage.setItem(KEY_TS, String(Date.now())); }catch(_){} }

  function openOverlay(){
    if(!overlay) return;
    if(shareInput) shareInput.value = window.location.href;
    overlay.hidden = false;
    overlay.classList.add('show');
    document.body.classList.add('overlay-open');
  }
  function closeOverlay(persist){
    if(!overlay) return;
    if(persist) setAck();
    overlay.classList.remove('show');
    overlay.hidden = true;
    document.body.classList.remove('overlay-open');
  }
  function maybeShowOverlay(){
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if(!isDesktop) return;
    if(isAckValid()) return;
    openOverlay();
  }

  document.getElementById('desktop-continue')?.addEventListener('click', ()=> closeOverlay(true));
  document.getElementById('desktop-open-mobile')?.addEventListener('click', ()=>{
    const hint = document.getElementById('desktop-hint');
    const input = document.getElementById('desktop-share-url');
    hint.hidden = !hint.hidden;
    if(!hint.hidden && input){ input.value = window.location.href; input.select(); }
  });
  document.getElementById('desktop-copy-url')?.addEventListener('click', async ()=>{
    const input = document.getElementById('desktop-share-url');
    try{
      await navigator.clipboard.writeText(input.value);
      const btn = document.getElementById('desktop-copy-url');
      const txt = btn.textContent;
      btn.textContent = 'Copiado!';
      setTimeout(()=> btn.textContent = txt, 1200);
    }catch(_){}
  });
  document.getElementById('desktop-advice')?.addEventListener('click', (e)=>{
    if(e.target.hasAttribute('data-close') || e.target.classList.contains('overlay__close')){
      closeOverlay(false);
    }
  });
  window.addEventListener('load', maybeShowOverlay);
  window.addEventListener('resize', ()=>{
    const o = document.getElementById('desktop-advice');
    if(!o || o.hidden) return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if(!isDesktop) closeOverlay(false);
  });
})();