/* Masterplan interface polish. Coordinates and mapping data remain in the original viewer. */
(() => {
  'use strict';
  const init = () => {
    const section = document.getElementById('masterplan');
    if (!section) return;
    const tabs = [...section.querySelectorAll('.survey109-tab-button')];
    const panel = document.getElementById('mp-panel');
    const stage = document.getElementById('mp-stage');
    const fullButton = document.getElementById('survey109-fullscreen-button');
    const modeButtons = [...section.querySelectorAll('.survey109-mode-button')];
    const imageLabel = document.getElementById('mp-image-label');
    const displayNote = document.getElementById('mp-display-note');
    const legend = document.getElementById('viewer-legend-container');
    const reset = document.getElementById('mp-reset');
    let previousOverflow = '', wasFullscreen = false, previousFocus = null;
    const syncTabs = () => {
      const selected = tabs.find(t => t.classList.contains('active')) || tabs[0];
      tabs.forEach(t => {t.tabIndex = t === selected ? 0 : -1; t.setAttribute('aria-selected',String(t === selected));});
      panel.setAttribute('aria-labelledby',selected.id);
    };
    tabs.forEach((tab,index) => {
      tab.addEventListener('click',()=>queueMicrotask(()=>{syncTabs();syncMode();}));
      tab.addEventListener('keydown',event => {
        let next;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index+1)%tabs.length;
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index+tabs.length-1)%tabs.length;
        else if(event.key === 'Home') next=0; else if(event.key === 'End') next=tabs.length-1;
        if (next !== undefined) { event.preventDefault(); tabs[next].focus(); tabs[next].click(); }
      });
    });
    const syncMode = () => {
      const concept = document.getElementById('btn-mode-3d').classList.contains('active');
      modeButtons.forEach(button => button.setAttribute('aria-pressed',String(button.classList.contains('active'))));
      section.dataset.viewMode=concept?'concept':'map';
      const boundary=tabs.find(t=>t.classList.contains('active'))?.dataset.tab==='boundary';
      imageLabel.textContent=concept?(boundary?'Preliminary boundary image · subject to verification':'Artist’s impression · conceptual planning reference'):'Preliminary map reference · subject to verification';
      displayNote.textContent=concept?(boundary?'Static boundary reference · not a certified survey':'Illustrated concept · not a live 3D survey'):'Interactive map · preliminary references';
      legend.hidden=concept; reset.disabled=concept;
      const active=tabs.find(t=>t.classList.contains('active'));
      document.getElementById('viewer-3d-mount').setAttribute('aria-label',(active?.querySelector('strong')?.textContent||'Estate')+' — conceptual illustration, subject to verification');
    };
    modeButtons.forEach(b=>b.addEventListener('click',syncMode));
    new MutationObserver(syncMode).observe(document.getElementById('btn-mode-3d'),{attributes:true,attributeFilter:['class']});
    const syncFullscreen = () => {
      const fullscreen=stage.classList.contains('fullscreen');
      if(fullscreen===wasFullscreen)return;
      if(fullscreen){previousOverflow=document.body.style.overflow;previousFocus=document.activeElement;document.body.style.overflow='hidden';document.body.classList.add('mp-fullscreen');stage.setAttribute('role','dialog');stage.setAttribute('aria-modal','true');fullButton.focus({preventScroll:true});}
      else{document.body.style.overflow=previousOverflow;document.body.classList.remove('mp-fullscreen');stage.removeAttribute('role');stage.removeAttribute('aria-modal');previousFocus?.focus?.({preventScroll:true});}
      fullButton.setAttribute('aria-expanded',String(fullscreen));fullButton.setAttribute('aria-label',fullscreen?'Close expanded masterplan view':'Expand masterplan view');
      fullButton.querySelector('span').textContent=fullscreen?'Close view':'Expand view';wasFullscreen=fullscreen;
    };
    new MutationObserver(syncFullscreen).observe(stage,{attributes:true,attributeFilter:['class']});
    document.addEventListener('keydown',event=>{
      if(!stage.classList.contains('fullscreen'))return;
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();window.toggleMapFullscreen?.();syncFullscreen();return;}
      if(event.key==='Tab'){
        const items=[...stage.querySelectorAll('button:not([disabled]),a[href],[tabindex="0"]')].filter(e=>e.getClientRects().length);
        const first=items[0],last=items.at(-1);if(!first)return;
        if(event.shiftKey&&(document.activeElement===first||!stage.contains(document.activeElement))){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&(document.activeElement===last||!stage.contains(document.activeElement))){event.preventDefault();first.focus();}
      }
    },true);
    reset.addEventListener('click',()=>window.resetEstateMap?.());
    syncTabs();syncMode();
  };
  if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init);else init();
})();
