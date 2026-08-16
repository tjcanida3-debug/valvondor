
/* v7.44 road snapping helpers */
(function(){
  let selectedRoad=null;

  function selectedEditorNode(){
    return document.querySelector('.editorSelected');
  }

  function updateSelectedRoad(){
    const node=selectedEditorNode();
    selectedRoad = node && node.matches('#westwoodV739Roads .realRoad') ? node : null;
    document.querySelectorAll('#westwoodV739Roads .realRoad').forEach(el=>{
      el.classList.toggle('roadSnapTarget', el===selectedRoad);
    });
  }

  function px(el,prop){
    return parseFloat(getComputedStyle(el)[prop]) || 0;
  }

  function saveEditor(){
    try{
      if(typeof saveMapEditorState==='function') saveMapEditorState();
      else if(typeof saveForestEditor==='function') saveForestEditor();
      else if(typeof saveGame==='function') saveGame();
    }catch(e){}
  }

  function move(dx,dy){
    updateSelectedRoad();
    if(!selectedRoad) return;
    selectedRoad.style.left=(px(selectedRoad,'left')+dx)+'px';
    selectedRoad.style.top=(px(selectedRoad,'top')+dy)+'px';
    saveEditor();
  }

  function scale(delta){
    updateSelectedRoad();
    if(!selectedRoad) return;
    const w=selectedRoad.getBoundingClientRect().width;
    const next=Math.max(24,w+delta);
    selectedRoad.style.width=next+'px';
    saveEditor();
  }

  function rotationOf(el){
    return Number(el.dataset.rotation||0);
  }

  function rotate(delta){
    updateSelectedRoad();
    if(!selectedRoad) return;
    const r=rotationOf(selectedRoad)+delta;
    selectedRoad.dataset.rotation=String(r);
    selectedRoad.style.transform='rotate('+r+'deg)';
    saveEditor();
  }

  function snapGrid(){
    updateSelectedRoad();
    if(!selectedRoad) return;
    const grid=8;
    selectedRoad.style.left=(Math.round(px(selectedRoad,'left')/grid)*grid)+'px';
    selectedRoad.style.top=(Math.round(px(selectedRoad,'top')/grid)*grid)+'px';
    saveEditor();
  }

  function z(delta){
    updateSelectedRoad();
    if(!selectedRoad) return;
    const current=parseInt(getComputedStyle(selectedRoad).zIndex)||3;
    selectedRoad.style.zIndex=String(Math.max(1,current+delta));
    saveEditor();
  }

  function reset(){
    updateSelectedRoad();
    if(!selectedRoad) return;
    selectedRoad.dataset.rotation='0';
    selectedRoad.style.transform='none';
    saveEditor();
  }

  const binds={
    roadNudgeLeft:()=>move(-4,0),
    roadNudgeUp:()=>move(0,-4),
    roadNudgeDown:()=>move(0,4),
    roadNudgeRight:()=>move(4,0),
    roadRotateLeft:()=>rotate(-90),
    roadRotateRight:()=>rotate(90),
    roadGrow:()=>scale(8),
    roadShrink:()=>scale(-8),
    roadSnapGrid:snapGrid,
    roadBringFront:()=>z(1),
    roadSendBack:()=>z(-1),
    roadResetTransform:reset
  };

  Object.entries(binds).forEach(([id,fn])=>{
    const el=document.getElementById(id);
    if(el) el.addEventListener('click',fn);
  });

  document.addEventListener('click',()=>setTimeout(updateSelectedRoad,0));
  document.addEventListener('pointerup',()=>setTimeout(updateSelectedRoad,0));
})();
