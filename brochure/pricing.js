(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const catalogue = window.RVG;
  if (!catalogue || !Array.isArray(catalogue.models) || !catalogue.models.length) {
    $('pc-result').textContent = 'The villa collection could not be loaded. Refresh to try again or contact the estate team.';
    return;
  }
  const models = catalogue.models;
  const qs = new URLSearchParams(location.search);
  let estate = models.find(m => m.id === qs.get('estate')) || models[0];
  let pkg = estate.packages.find(p => p.id === qs.get('package')) || estate.packages[0];
  let busy = false;
  const safeValue = p => typeof p.price === 'number' && Number.isFinite(p.price) && p.price > 0 ? p.price : null;
  const showPrice = p => safeValue(p) === null ? 'Price on request' : catalogue.price(p.price);
  const selected = () => estate.name + ' · ' + pkg.name + ' · ' + showPrice(pkg);
  const form = $('pc-form');
  const upgradeOptions = [
    ['Plunge pool',18,30], ['Private pool',35,55], ['Outdoor jacuzzi',8,18],
    ['Spa room',15,35], ['Yoga or meditation deck',8,20], ['Premium furniture',15,50],
    ['Smart home controls',7,25], ['Solar package',8,18], ['Staff room',12,25],
    ['Extra built-up area (per 100 sq ft)',5.5,7.5]
  ];
  const stages = [
    ['Booking',5],['Agreement signing',15],['Land or estate allocation',20],
    ['Infrastructure start',15],['Foundation or plinth',15],['Structure completion',10],
    ['Interior finishing',15],['Handover',5]
  ];
  const rupees = new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0,minimumFractionDigits:0});
  const make = (tag, options = {}) => Object.assign(document.createElement(tag), options);
  const selectedUpgrades = new Set();
  const value = (name) => String(new FormData(form).get(name) || '').trim();
  function asRadio(group, id, label, checked, inputLabel, cls, change) {
    const wrap = make('label',{className:cls});
    const radio = make('input',{type:'radio',name:group,value:id,checked});
    radio.setAttribute('aria-label',inputLabel);
    const span = make('span');
    if (label instanceof Node) span.append(label); else span.textContent = label;
    wrap.append(radio,span);
    radio.addEventListener('change',() => {if(radio.checked) change();});
    return wrap;
  }
  const concepts = {
    cottage:'Timber finishes and a forest-facing courtyard',
    valley:'An observation deck and open living spaces',
    wellness:'A spa-ready layout with space for yoga'
  };
  function navSelection() {
    const links=document.querySelectorAll('[data-site-header] a[href*="/reserva-verde/pricing"], [data-site-footer] a[href*="/reserva-verde/pricing"]');
    for(const link of links){
      const dest=new URL(link.href);
      dest.searchParams.set('estate',estate.id);dest.searchParams.set('package',pkg.id);
      link.href=dest.toString();
    }
  }
  function showPackages(){
    const wrap = $('pc-packages'); wrap.replaceChildren();
    for(const p of estate.packages){
      const label = document.createDocumentFragment();
      const desc=make('span',{textContent:p.name});
      if(concepts[p.id]) desc.append(make('small',{textContent:concepts[p.id]}));
      label.append(desc,make('strong',{textContent:showPrice(p)}));
      wrap.append(asRadio('package-choice',p.id,label,p === pkg,p.name+' · '+showPrice(p),'pc-pick',() => {
        pkg = p; sync(true);
      }));
    }
  }
  function updateUpgradeSummary(){
    let low = 0, high = 0;
    for(const i of selectedUpgrades){low += upgradeOptions[i][1]; high += upgradeOptions[i][2];}
    $('pc-addon-summary').textContent = selectedUpgrades.size ? 'Estimated additions: ₹'+low+'–'+high+' lakh. A separate quote will confirm the scope.' : 'No upgrades selected.';
  }
  function showSchedule(){
    const body = $('pc-schedule'); body.replaceChildren();
    const total = safeValue(pkg) === null ? null : Math.round(pkg.price * 10000000);
    let paid = 0;
    for(const [i,[name,percent]] of stages.entries()){
      const amt = total === null ? null : i === stages.length-1 ? total-paid : Math.round(total*percent/100);
      if(amt !== null) paid += amt;
      const row = make('tr');
      row.append(make('td',{textContent:name}),make('td',{textContent:percent+'%'}),make('td',{textContent:amt === null?'To confirm':rupees.format(amt)}));
      body.append(row);
    }
    $('pc-total').textContent = total === null ? 'On request' : rupees.format(total);
    $('pc-plan-summary').textContent = selected()+(total === null ? '. The schedule shows milestone shares until the estate team confirms the price.' : '');
  }
  function sync(updateUrl){
    $('pc-model-title').textContent = estate.name;
    $('pc-model-meta').textContent = [estate.area,estate.feature].filter(Boolean).join(' · ');
    $('pc-villa-img').src = estate.image;
    $('pc-villa-img').alt = estate.name + ', concept exterior';
    const detailUrl = new URL(estate.url,location.href);
    detailUrl.searchParams.set('package',pkg.id);
    $('pc-estate-link').href = detailUrl.toString();
    navSelection();
    $('pc-request-summary').textContent = selected();
    if(safeValue(pkg)===null){
      $('pc-coverage').textContent='The price for this configuration awaits confirmation. Request a cost sheet for the base scope, taxes and optional additions.';
    }else{
      $('pc-coverage').textContent='Indicative base price for this configuration. Request a cost sheet to confirm the scope, taxes, registration and optional additions.';
    }
    if(updateUrl){
      const url = new URL(location.href);
      url.searchParams.set('estate',estate.id); url.searchParams.set('package',pkg.id);
      history.replaceState(history.state,'',url.href);
      if(form.hidden){form.hidden=false; $('pc-submit').disabled=false;}
      $('pc-result').textContent='';
    }
    showSchedule();
  }
  const shortNames = { '2bhk':'2BHK Forest', '3bhk':'3BHK Premium', '4bhk':'4BHK Signature', 'custom':'Custom Founder' };
  for(const m of models){
    $('pc-models').append(asRadio('estate-choice',m.id,shortNames[m.id] || m.name,m === estate,m.name,'pc-pill',()=>{
      const packageId = pkg.id;
      estate=m; pkg=m.packages.find(p=>p.id===packageId)||m.packages[0];
      showPackages(); sync(true);
    }));
  }
  for(const [i,[name,low,high]] of upgradeOptions.entries()){
    const label=make('label',{className:'pc-extra'});
    const input=make('input',{type:'checkbox',value:String(i)});
    const title=make('span',{textContent:name});
    title.append(make('small',{textContent:'₹'+low+'–'+high+' lakh'}));
    label.append(input,title);$('pc-upgrades').append(label);
    input.addEventListener('change',()=>{
      if(input.checked) selectedUpgrades.add(i);else selectedUpgrades.delete(i);
      updateUpgradeSummary();
    });
  }
  const cachedContacts = {email:'',phone:''};
  function showContactField(){
    const input = $('pc-contact'), isEmail = $('pc-method').value === 'email';
    const curType=input.name;
    cachedContacts[curType]=input.value;
    input.name=isEmail?'email':'phone'; input.type=isEmail?'email':'tel';
    input.value=cachedContacts[input.name];
    input.maxLength=isEmail?120:30;
    input.autocomplete=isEmail?'email':'tel';
    $('pc-contact-label').textContent = isEmail?'Email address':$('pc-method').value==='whatsapp'?'WhatsApp number':'Phone number';
    input.placeholder=isEmail?'':'Include country code';
    input.setCustomValidity('');
  }
  $('pc-method').addEventListener('change',showContactField);
  $('pc-contact').addEventListener('input',e=>e.target.setCustomValidity(''));
  $('pc-print').addEventListener('click',()=>window.print());
  showPackages(); sync(false); updateUpgradeSummary();
  document.addEventListener('DOMContentLoaded',navSelection,{once:true});
  $('pc-submit').disabled = false;
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(busy || !form.reportValidity())return;
    const chosenContact=$('pc-method').value, contact=$('pc-contact').value.trim();
    if(chosenContact!=='email' && !/^\d{8,15}$/.test(contact.replace(/[^\d]/g,''))){
      $('pc-contact').setCustomValidity('Enter a valid phone number with its country code.');
      $('pc-contact').reportValidity();return;
    }
    const refNode=$('pc-result');
    refNode.textContent='';refNode.classList.remove('pc-error');
    const extraNames=[...selectedUpgrades].map(i=>upgradeOptions[i][0]);
    const message=[value('message'),extraNames.length?'Optional upgrades: '+extraNames.join(', '):''].filter(Boolean).join('\n');
    const payload={
      source:'estate_brochure',fullName:value('fullName'),contactMethod:chosenContact,
      [chosenContact==='email'?'email':'phone']:contact,estateId:estate.id,packageId:pkg.id,
      displayedPrice:safeValue(pkg),consent:form.elements.consent.checked,message,website_hp:value('website_hp')
    };
    const submittedChoice=selected();
    busy=true;$('pc-submit').disabled=true;$('pc-submit').textContent='Sending request…';
    const choiceInputs=[...document.querySelectorAll('input[name="estate-choice"], input[name="package-choice"]')];
    choiceInputs.forEach(r=>{r.disabled=true;});
    try{
      const res=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      let data={};try{data=await res.json();}catch{}
      if(!res.ok || !data.success || typeof data.referenceId!=='string' || !/^RVG-\d{8}-[A-Z0-9]+$/i.test(data.referenceId)){
        const err=new Error(res.status===409?'The package has changed. Refresh this page to review the current selection before sending.':res.status===429?'Too many recent requests. Please try again later.':res.status===400 && typeof data.error==='string'?data.error:'Your request could not be confirmed. Your details are still here; please try again.');
        throw err;
      }
      form.hidden=true;
      refNode.textContent=(data.isDuplicate?'Your request is already saved.':'Your cost-sheet request has been saved.')+' Reference: '+data.referenceId+'. '+submittedChoice+'.';
      refNode.focus();
    }catch(error){
      refNode.textContent=error instanceof TypeError?'We could not reach the estate team. Your details are still here; check your connection and try again.':error.message;
      refNode.classList.add('pc-error');
    }finally{
      busy=false;$('pc-submit').disabled=false;$('pc-submit').textContent='Send cost-sheet request';
      choiceInputs.forEach(r=>{r.disabled=false;});
    }
  });
  // Keep existing inbound section links useful after the pricing layout changes.
  const oldTargets={'#public-pricing':'compare','#installments':'payment-plan','#pricing-models':'compare','#lead-capture':'enquiry','#optional-upgrades':'pc-extras-panel'};
  const target=oldTargets[location.hash];
  if(target){const el=$(target);if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView();}
})();
