(function(){
  const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.site-nav');
  menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
  const popup=document.querySelector('[data-activity]'),copy=popup?.querySelector('[data-activity-copy]'),time=popup?.querySelector('[data-activity-time]');
  if(!popup||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const communityNames=['Liya','Dawit Alemu','Hana','Samuel','Selamawit','Mekdes','Yonas','Rahel Asfaw','Nahom'];
  let index=0;
  const show=()=>{const name=communityNames[index++%communityNames.length];copy.textContent=`Meet ${name} from the Ayat community.`;time.textContent='Community spotlight';popup.hidden=false;requestAnimationFrame(()=>popup.classList.add('show'));setTimeout(()=>popup.classList.remove('show'),5200)};
  setTimeout(show,3500);setInterval(show,11000);
})();
