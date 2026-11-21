(function(){
  function init(){
    const head=document.querySelector('[data-site-header]'),foot=document.querySelector('[data-site-footer]'),pricing='/reserva-verde/pricing/', path=location.pathname;
    const main=document.querySelector('main'); if(main && !main.id) main.id='main-content';
    if(head){
      head.innerHTML='<a class="rvg-skip" href="#'+(main?.id||'main-content')+'">Skip to content</a><div class="rvg-mast"><a class="rvg-brand" href="/" aria-label="Reserva Varde Goa, home"><svg class="rvg-mark" viewBox="0 0 34 40" fill="none" aria-hidden="true"><path d="M3 35V17a14 14 0 0 1 28 0v18H3Z M7 31l8-16 5 9 3-5 5 12 M11 26h6" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/></svg><span><b>Reserva Varde Goa</b><small>Bluechip Global Agro</small></span></a><button class="rvg-menu" type="button" aria-expanded="false" aria-controls="rvg-nav">Menu</button><nav class="rvg-nav" id="rvg-nav" aria-label="Primary"><a href="/#estate-models">Estates</a><a href="/#location">Location</a><a href="/#masterplan">Masterplan</a><a href="'+pricing+'">Villa pricing</a><a href="'+pricing+'#enquiry" class="rvg-contact">Request cost sheet</a></nav></div>';
      const menu=head.querySelector('button'),nav=head.querySelector('nav');if(path.includes('/pricing')) nav.querySelector('a[href="'+pricing+'"]').setAttribute('aria-current','page');
      function toggle(open){menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu';nav.classList.toggle('is-open',open)}
      menu.onclick=()=>toggle(menu.getAttribute('aria-expanded')!=='true');nav.addEventListener('click',()=>toggle(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){toggle(false);menu.focus()}});
    }
    if(foot)foot.innerHTML='<div class="rvg-foot"><div class="rvg-foot-main"><div><h2>Reserva Varde Goa</h2><p>A South Goa estate concept by Bluechip Global Agro.</p></div><nav aria-label="Footer"><a href="/#estate-models">The estates</a><a href="'+pricing+'#enquiry">Request a cost sheet</a><a href="/wellness.html">Wellness</a></nav></div><div class="rvg-foot-end"><p>Project enquiries: <a href="mailto:md.bluechipintl@gmail.com">md.bluechipintl@gmail.com</a><br><a href="tel:+919686111408">+91 96861 11408</a> &nbsp; / &nbsp; <a href="tel:+919445001237">+91 94450 01237</a></p><p>Illustrations and plans are conceptual. Final specifications, pricing and approvals require verification.</p></div></div>';
  } if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
