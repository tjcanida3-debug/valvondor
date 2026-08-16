
window.addEventListener('load',()=>{
 setTimeout(()=>{
   if(!localStorage.getItem('v778_shiv_test_gift')){
     inventoryData.goblin_shiv=(inventoryData.goblin_shiv||0)+1;
     localStorage.setItem('v778_shiv_test_gift','1');
     if(typeof save==='function')save(false);
     if(typeof toast==='function')toast('🎁 Test item received: Goblin Shiv!');
   }
 },500);
});
