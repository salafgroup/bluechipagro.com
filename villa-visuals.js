/* Delegated tab handling: the original inline setup runs before the modal markup. */
(() => {
  'use strict';
  const modal = document.getElementById('rvArchModal');
  if (!modal) return;
  let lastFocused = null;
  modal.querySelectorAll('.rv-m-tab').forEach(tab => {
    tab.type = 'button';
    tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
  });
  modal.addEventListener('click', event => {
    const tab = event.target.closest('.rv-m-tab');
    if (!tab || !modal.contains(tab)) return;
    const panel = document.getElementById('panel-' + tab.dataset.tab);
    if (!panel) return;
    modal.querySelectorAll('.rv-m-tab').forEach(item => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    modal.querySelectorAll('.rv-m-panel').forEach(item => item.classList.toggle('active', item === panel));
  });
  const observer = new MutationObserver(records => {
    if (!records.some(record => record.attributeName === 'class')) return;
    if (modal.classList.contains('active')) {
      lastFocused = document.activeElement;
      modal.querySelectorAll('.rv-m-tab').forEach(tab => tab.setAttribute('aria-selected', String(tab.classList.contains('active'))));
      requestAnimationFrame(() => document.getElementById('rvModalClose')?.focus({ preventScroll: true }));
    } else if (lastFocused?.isConnected) {
      lastFocused.focus({ preventScroll: true });
    }
  });
  observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  modal.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const nodes = [...modal.querySelectorAll('button, a[href], summary, input, select, textarea, [tabindex="0"]')].filter(el => el.getClientRects().length && !el.disabled);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();
