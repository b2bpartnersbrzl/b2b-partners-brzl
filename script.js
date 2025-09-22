(function(){
  const btn=document.querySelector('.menu-toggle');
  const menuOverlay=document.getElementById('mobile-menu');
  const panel=menuOverlay?.querySelector('.mobile-menu-panel');
  const closeInside=menuOverlay?.querySelector('.mobile-menu-close');
  const linkNodes=menuOverlay?menuOverlay.querySelectorAll('[data-menu-link]'):[];
  const firstLink=linkNodes?.[0]||null;

  /* ALTURA DO HEADER → CSS VAR (--header-height) */
  const root = document.documentElement;
  const headerEl = document.querySelector('.main-header');

  function applyHeaderHeight() {
    if (!headerEl) return;
    const h = Math.ceil(headerEl.getBoundingClientRect().height);
    root.style.setProperty('--header-height', h + 'px');
  }

  // Aplica no carregamento
  window.addEventListener('load', applyHeaderHeight);

  // Reaplica quando fontes carregarem (evita “salto”)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(applyHeaderHeight).catch(() => {});
  }

  // Reaplica no resize/orientação
  let _hdrTO;
  window.addEventListener('resize', () => {
    clearTimeout(_hdrTO);
    _hdrTO = setTimeout(applyHeaderHeight, 120);
  });

  function setBtn(e){
    if(!btn)return;
    btn.classList.toggle('is-open',e);
    btn.setAttribute('aria-expanded',e);
    btn.setAttribute('aria-label',e?'Fechar menu':'Abrir menu');
    const t=btn.querySelector('.menu-icon');
    const o=btn.querySelector('.menu-label');
    t&&(t.textContent=e?'✕':'☰');
    o&&(o.textContent=e?'Fechar':'Menu');
    e?btn.classList.remove('menu-pulse'):btn.classList.add('menu-pulse')
  }

  function openMenu(){
    if(!menuOverlay)return;
    menuOverlay.classList.add('show');
    menuOverlay.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    setBtn(!0);
    try{history.pushState({menu:!0},'','#menu')}catch(e){}
    setTimeout(()=>{(firstLink||closeInside||btn).focus?.()},0)
  }

  function closeMenu(e=!1){
    if(!menuOverlay)return;
    menuOverlay.classList.remove('show');
    menuOverlay.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    setBtn(!1);
    e&&setTimeout(()=>btn?.focus?.(),0)
  }

  function toggleMenu(e){
    const t=menuOverlay?.classList.contains('show');
    const o=e!==undefined?e:!t;
    o?openMenu():closeMenu()
  }

  btn?.addEventListener('click',()=>toggleMenu());
  closeInside?.addEventListener('click',()=>closeMenu());
  linkNodes.forEach(e=>{
    e.addEventListener('click',t=>{
      t.preventDefault();
      const o=e.getAttribute('href')||'';
      if(o==='#top'){
        closeMenu(!0);
        window.scrollTo({top:0,behavior:'smooth'});
        try{history.replaceState({},'','#')}catch(e){}
        return
      }
      const n=o.replace(/^#/,'');
      const a=document.getElementById(n);
      closeMenu(!0);
      a&&a.scrollIntoView({behavior:'smooth',block:'start'});
      try{history.replaceState({},'','#'+n)}catch(e){}
    })
  });
  menuOverlay?.addEventListener('click',e=>{
    if(!panel)return;
    panel.contains(e.target)||closeMenu()
  });
  window.addEventListener('keydown',e=>{
    e.key==='Escape'&&menuOverlay?.classList.contains('show')&&closeMenu()
  });
  window.addEventListener('popstate',()=>{
    menuOverlay?.classList.contains('show')&&closeMenu(!0)
  });

  const topLinks=document.querySelectorAll('a.top-link');
  topLinks.forEach(e=>{
    e.addEventListener('click',t=>{
      t.preventDefault();
      window.scrollTo({top:0,behavior:'smooth'});
      try{history.replaceState({},'','#')}catch(e){}
    })
  });

  const form=document.getElementById('briefing-form');
  const statusEl=document.getElementById('form-status');
  if(form){
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const t=form.querySelector('button[type="submit"]');
      const o=new FormData(form);
      const n=()=>{
        statusEl.textContent='';
        statusEl.className='form-status'
      };
      n();
      if((o.get('website')||'').trim()!=='')return;
      const a=form.querySelector('#lgpd');
      if(!a||!a.checked){
        statusEl.textContent='Para enviar, marque o consentimento LGPD.';
        statusEl.classList.add('form-status--error');
        statusEl.scrollIntoView({behavior:'smooth',block:'nearest'});
        return
      }
      if(!o.get('nome')||!o.get('email')||!o.get('mensagem')){
        statusEl.textContent='Preencha nome, e-mail e mensagem.';
        statusEl.classList.add('form-status--error');
        statusEl.scrollIntoView({behavior:'smooth',block:'nearest'});
        return
      }
      o.append('timestamp',new Date().toISOString());
      t.disabled=!0;
      const i=t.textContent;
      t.textContent='Enviando…';
      try{
        await fetch(form.action,{method:'POST',body:o,mode:'no-cors'});
        statusEl.textContent='Recebido. Entraremos em contato em breve.';
        statusEl.classList.add('form-status--success');
        statusEl.scrollIntoView({behavior:'smooth',block:'nearest'});
        form.reset()
      }catch(e){
        statusEl.textContent='Não foi possível enviar agora. Tente novamente.';
        statusEl.classList.add('form-status--error');
        statusEl.scrollIntoView({behavior:'smooth',block:'nearest'})
      }finally{
        t.disabled=!1;
        t.textContent=i
      }
    })
  }

  const OVERLAY_ID='desktop-advice';
  const overlay=document.getElementById(OVERLAY_ID);
  const shareInput=document.getElementById('desktop-share-url');

  function openOverlay(){if(!overlay)return;shareInput&&(shareInput.value=window.location.href);overlay.hidden=!1;overlay.classList.add('show');document.body.classList.add('overlay-open')}
  function closeOverlay(){if(!overlay)return;overlay.classList.remove('show');overlay.hidden=!0;document.body.classList.remove('overlay-open')}
  function maybeShowOverlay(){const e=window.matchMedia('(min-width: 1024px)').matches;if(!e)return;openOverlay()}

  document.getElementById('desktop-continue')?.addEventListener('click',()=>closeOverlay());
  document.getElementById('desktop-open-mobile')?.addEventListener('click',()=>{
    const e=document.getElementById('desktop-hint');
    const t=document.getElementById('desktop-share-url');
    e.hidden=!e.hidden;
    !e.hidden&&t&&(t.value=window.location.href,t.select())
  });
  document.getElementById('desktop-copy-url')?.addEventListener('click',async()=>{
    const e=document.getElementById('desktop-share-url');
    try{
      await navigator.clipboard.writeText(e.value);
      const t=document.getElementById('desktop-copy-url');
      const o=t.textContent;
      t.textContent='Copiado!';
      setTimeout(()=>t.textContent=o,1200)
    }catch(e){}
  });
  document.getElementById('desktop-advice')?.addEventListener('click',e=>{␊
    (e.target.hasAttribute('data-close')||e.target.classList.contains('overlay__close'))&&closeOverlay()
  });␊
  window.addEventListener('load',maybeShowOverlay);␊
  window.addEventListener('resize',()=>{␊
    const e=document.getElementById('desktop-advice');␊
    if(!e||e.hidden)return;␊
    const t=window.matchMedia('(min-width: 1024px)').matches;␊
    !t&&closeOverlay()
  });␊
})();
