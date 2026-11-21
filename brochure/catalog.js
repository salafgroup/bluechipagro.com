// Shared by the public brochure and the enquiry API. Amounts are indicative crore.
// Original reference: lib/reserva-verde/pricing-data.ts at 4d85b0e.
// The 4BHK commercial schedule requires owner confirmation before publication.
(function (root, factory) {
  const catalog = factory();
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  else root.RVG = catalog;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const packages = [['cottage', 'Forest Cottage Villa'], ['valley', 'Jungle Valley Villa'], ['wellness', 'Premium Wellness Villa']];
  const entries = [
    ['2bhk','2BHK Forest Villa','2,500 sq ft','An open courtyard at the heart of a single-level home.','2bhk-compact-forest-estate',[1.95,2.25,2.55]],
    ['3bhk','3BHK Premium Estate','3,500 sq ft','An L-shaped home with a shaded verandah along the garden.','3bhk-premium-forest-estate',[2.35,2.65,2.90]],
    ['4bhk','4BHK Signature Retreat','4,500 sq ft','Three connected wings give guests and family their own space.','4bhk-signature-forest-estate',[null,null,null]],
    ['custom','Custom Founder Estate','Flexible built-up area','Shape the footprint and outdoor spaces around your brief.','customisable-founder-estate',[2.50,2.75,2.99]]
  ];
  const models = entries.map(([id,name,area,feature,slug,rates]) => ({
    id,name,area,feature,url:'/models/'+slug+'/',image:'/images/villa-concepts-20261023/'+id+'-exterior.webp',
    packages:packages.map(([pid,pname],i)=>({id:pid,name:pname,price:rates[i]}))
  }));
  const price = n => Number.isFinite(n) ? '₹'+n.toFixed(2)+' crore' : 'Price on request';
  return {models,price};
});
