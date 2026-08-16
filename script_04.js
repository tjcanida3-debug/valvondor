
/* v7.53 mobile fishing interaction fix */
(function(){
  function getPlayerState(){
    try { return {x: Number(pos?.x||0), y: Number(pos?.y||0), area: currentArea}; }
    catch(e){ return {x:0,y:0,area:''}; }
  }

  const oldNearestFishingSpot = window.nearestFishingSpot;
  window.nearestFishingSpot = function(max=165){
    try{
      const s = getPlayerState();
      if(s.area==='forest'){
        const westSpots=[...document.querySelectorAll('[data-fish-id="westwood-15"],[data-fish-id="westwood-25"]')]
          .filter(el=>!el.classList.contains('cooldown'));
        if(westSpots.length){
          let best=null, bd=Infinity;
          for(const el of westSpots){
            const c=objectCenter(el), d=Math.hypot(s.x-c.x,s.y-c.y);
            if(d<bd){bd=d;best=el;}
          }
          /* generous mobile interaction radius around the pond */
          if(best && (bd < 360 || (s.x>1500 && s.x<2200 && s.y>120 && s.y<720))) return best;
        }
      }
    }catch(e){}
    return typeof oldNearestFishingSpot==='function' ? oldNearestFishingSpot(max) : null;
  };

  const oldStartFishing = window.startFishing;
  window.startFishing = function(spot){
    try{
      /* test build: make sure the player has a rod so pond testing cannot dead-end */
      if(typeof inventoryData!=='undefined' && !(inventoryData.fishing_rod>0)){
        inventoryData.fishing_rod=1;
        try{ save(false); }catch(e){}
      }
    }catch(e){}
    return oldStartFishing(spot);
  };

  /* Make tapping the ripple itself work from a wider distance on mobile. */
  document.querySelectorAll('[data-fish-id="westwood-15"],[data-fish-id="westwood-25"]').forEach(function(spot){
    spot.style.pointerEvents='auto';
    spot.addEventListener('click', function(ev){
      ev.stopPropagation();
      try{ startFishing(spot); }catch(e){ console.error(e); }
    });
    spot.addEventListener('touchend', function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      try{ startFishing(spot); }catch(e){ console.error(e); }
    }, {passive:false});
  });
})();
