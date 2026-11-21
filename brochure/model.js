(() => {
  'use strict';
  const id = document.body.dataset.estate;
  const catalogue = window.RVG;
  const villa = catalogue?.models?.find(entry => entry.id === id);
  if (villa) {
    document.querySelector('[data-model-name]').textContent = villa.name;
    const selection = new URLSearchParams(location.search).get('package');
    const selected = villa.packages.find(item => item.id === selection) || villa.packages[0];
    const numbers = villa.packages.map(item => item.price).filter(value => Number.isFinite(value));
    const price = document.querySelector('[data-model-price]');
    price.textContent = numbers.length ? 'From ' + catalogue.price(Math.min(...numbers)) : 'Price to be confirmed';
    function carrySelection() {
      for (const link of document.querySelectorAll('[data-package-link], [data-site-header] a[href^="/reserva-verde/pricing/"], [data-site-footer] a[href^="/reserva-verde/pricing/"]')) {
        const dest = new URL(link.href);
        dest.searchParams.set('estate', villa.id);
        if (selected) dest.searchParams.set('package', selected.id);
        link.href = dest.toString();
      }
    }
    carrySelection();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', carrySelection);
  }
  // An original-vector link remains usable if dialog support or scripting is unavailable.
  const dialog = document.getElementById('model-zoom');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const frame = dialog.querySelector('.model-zoom-body');
  const picture = dialog.querySelector('#zoom-image');
  const sizeButton = dialog.querySelector('[data-size]');
  let opener;
  function setSize(actual) {
    frame.classList.toggle('is-actual', actual);
    sizeButton.setAttribute('aria-pressed', String(actual));
    frame.scrollTo(0, 0);
  }
  for (const link of document.querySelectorAll('[data-drawing-title]')) {
    link.addEventListener('click', evt => {
      if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey || evt.button !== 0) return;
      evt.preventDefault();
      opener = link;
      const original = link.closest('figure').querySelector('img');
      picture.src = link.href;
      picture.alt = original.alt;
      frame.style.setProperty('--drawing-width', original.getAttribute('width') + 'px');
      dialog.querySelector('#zoom-title').textContent = link.dataset.drawingTitle;
      setSize(false);
      dialog.showModal();
    });
  }
  sizeButton.addEventListener('click', () => setSize(sizeButton.getAttribute('aria-pressed') !== 'true'));
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus({preventScroll:true}); });
})();
