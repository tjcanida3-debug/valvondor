
(function(){
  const dirs={
    ArrowLeft:[-1,0],KeyA:[-1,0],
    ArrowRight:[1,0],KeyD:[1,0],
    ArrowUp:[0,-1],KeyW:[0,-1],
    ArrowDown:[0,1],KeyS:[0,1]
  };
  let lastFallback=0;
  document.addEventListener('keydown',function(e){
    if(currentArea!=='shop'||!dirs[e.code])return;
    const [dx,dy]=dirs[e.code],sx=pos.x,sy=pos.y;
    setTimeout(function(){
      if(currentArea!=='shop'||dead)return;
      if(Math.abs(pos.x-sx)>1||Math.abs(pos.y-sy)>1)return; // normal loop worked
      const now=performance.now();
      if(now-lastFallback<45)return;
      lastFallback=now;
      const step=e.shiftKey?12:7;
      const nx=pos.x+dx*step,ny=pos.y+dy*step;
      if(!blocked(nx,pos.y))pos.x=nx;
      if(!blocked(pos.x,ny))pos.y=ny;
      if(dx){facing=dx<0?-1:1;facingDir=dx<0?'left':'right'}
      if(dy)facingDir=dy<0?'up':'down';
      locked=false;
      try{setAnimation('walk',true);camera()}catch(err){console.error(err)}
    },120);
  });
})();
