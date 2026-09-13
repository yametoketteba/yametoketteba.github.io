const toggle=document.querySelector('.nav-toggle');
const menu=document.querySelector('.nav-menu');
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const open=document.querySelector('details[open]');if(open){open.open=false;open.querySelector('summary').focus();}else if(toggle.getAttribute('aria-expanded')==='true'){toggle.click();toggle.focus();}}});
document.addEventListener('click',event=>{for(const d of document.querySelectorAll('details[open]'))if(!d.contains(event.target))d.open=false;});
