
/* v7.32 — preload player sprites and prevent invisible idle state */
(function(){
  const dirs=['down','up','left','right'];
  dirs.forEach(dir=>{
    const idle=new Image();
    idle.src=`assets/player_wolf/idle_${dir}.png`;
    for(let i=1;i<=5;i++){
      const walk=new Image();
      walk.src=`assets/player_wolf/walk_${dir}_${i}.png`;
    }
  });

  const p=document.getElementById('player');
  if(p){
    p.addEventListener('error',function(){
      p.style.backgroundImage="url('assets/embedded/asset_0138_855751fe97ca6c5c.png')";
    },true);
  }
})();
