
window.addEventListener('load',()=>{
  const b=document.getElementById('attack');
  if(!b)return;
  b.addEventListener('pointerdown',()=>b.classList.add('attackPressed'));
  const release=()=>setTimeout(()=>b.classList.remove('attackPressed'),90);
  b.addEventListener('pointerup',release);
  b.addEventListener('pointercancel',release);
});
