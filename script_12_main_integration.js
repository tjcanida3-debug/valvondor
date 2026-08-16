/* Valvondor PC v9.22 — WEST bridge / former goblin area visibility fix. */
(function(){
'use strict';
if(window.__VALVONDOR_V918_MAIN_INTEGRATION__)return;
window.__VALVONDOR_V918_MAIN_INTEGRATION__=true;

const AP='assets/approved_2026_08_14/';

// 1) Lock the approved directional walk frames into the live Knight/Archer engines.
try{
  if(typeof V847_KNIGHT!=='undefined'){
    V847_KNIGHT.walk.down=[1,2,3,4].map(n=>AP+'wolf_knight/walk_verified/down/down_'+n+'.png');
    V847_KNIGHT.walk.up=[1,2,3,4].map(n=>AP+'wolf_knight/walk_verified/up/up_'+n+'.png');
    V847_KNIGHT.walk.left=[1,2,3,4].map(n=>AP+'wolf_knight/walk_verified/left/left_'+n+'.png');
    V847_KNIGHT.walk.right=[1,2,3,4].map(n=>AP+'wolf_knight/walk_verified/right/right_'+n+'.png');
    // Approved walk frame 1 is also the safest complete-foot idle pose.
    V847_KNIGHT.idle.down=[V847_KNIGHT.walk.down[0]];
    V847_KNIGHT.idle.up=[V847_KNIGHT.walk.up[0]];
    V847_KNIGHT.idle.left=[V847_KNIGHT.walk.left[0]];
    V847_KNIGHT.idle.right=[V847_KNIGHT.walk.right[0]];
  }
  // Archer source paths are now locked directly in script_01.js so no late
  // runtime swap can flash retired animation frames on game entry.
  if(typeof HEROES!=='undefined' && HEROES.wolf_archer_female){
    HEROES.wolf_archer_female.portrait=AP+'wolf_archer/fullbody_locked.png';
  }
  if(typeof setAnimation==='function')setTimeout(()=>setAnimation('idle',true),30);
}catch(err){console.error('[v9.18] approved hero integration',err)}

// 2) Use the approved clean blacksmith gameplay reference for Bram in Oakhaven.
try{
  const bram=document.querySelector('.npc[data-id="blacksmith"] img');
  if(bram)bram.src=AP+'blacksmith/background_removed_reference.png';
}catch(err){console.error('[v9.18] blacksmith integration',err)}

// 3) Pests at the Gates: approved quest + Mara + starter enemies.
const QUEST_KEY='valvondor-pests-at-the-gates-v1';
let pests={status:'not_started',rats:0,boars:0,rewarded:false};
try{pests={...pests,...JSON.parse(localStorage.getItem(QUEST_KEY)||'{}')}}catch(_){ }

const MOB_DEFS={
 rat:{name:'Field Rat',maxHp:24,damage:3,xp:5,idle:'assets/starter_mobs/field_rat/idle/1.png'},
 boar:{name:'Young Boar',maxHp:36,damage:5,xp:8,idle:'assets/starter_mobs/young_boar/idle/1.png'}
};
const SPAWNS=[
 // v9.21: exact former Westwood goblin clearing positions.
 ['rat',430,535],['rat',590,505],['rat',745,555],
 ['boar',485,690],['boar',690,690]
];
const liveMobs=[];

function savePests(){try{localStorage.setItem(QUEST_KEY,JSON.stringify(pests))}catch(_){}}
function questDone(){return pests.rats>=3&&pests.boars>=2}
function trackerText(){return `Field Rats: ${Math.min(3,pests.rats)}/3 · Young Boars: ${Math.min(2,pests.boars)}/2`;}
function updateTracker(){
 const t=document.getElementById('pestsQuestTracker'); if(!t)return;
 if(pests.status==='not_started'){t.style.display='none';return}
 t.style.display='block';
 if(pests.status==='complete')t.innerHTML='<b>✓ Pests at the Gates — COMPLETE</b><br>Oakhaven’s south road is safer.';
 else t.innerHTML='<b>◆ Pests at the Gates</b><br>'+trackerText()+(questDone()?'<br><span style="color:#9fe1a7">Return to Mara.</span>':'');
}
function makeDialog(){
 if(document.getElementById('pestsQuestDialog'))return;
 const overlay=document.createElement('div');overlay.id='pestsQuestDialog';overlay.innerHTML=`
 <div id="pestsQuestCard">
  <img id="pestsQuestPortrait" src="${AP}mara_thornfield/dialogue_portrait_cropped.jpg" alt="Mara Thornfield">
  <div><h2>Mara Thornfield</h2><div class="pestsSub">Oakhaven Warden</div><div id="pestsQuestText" class="pestsText"></div><div id="pestsQuestButtons"></div></div>
 </div>`;
 document.body.appendChild(overlay);
 overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open')});
 const tracker=document.createElement('div');tracker.id='pestsQuestTracker';document.body.appendChild(tracker);
}
function dialogButton(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=fn;return b}
function showMara(){
 makeDialog();
 const d=document.getElementById('pestsQuestDialog'),text=document.getElementById('pestsQuestText'),buttons=document.getElementById('pestsQuestButtons');buttons.innerHTML='';
 if(pests.status==='not_started'){
  text.innerHTML="The road's getting worse by the day. Field Rats are nesting near the gates, and the young boars have started charging travelers.<br><br>Thin them out for me: <b>3 Field Rats and 2 Young Boars.</b><br><br><b>Reward:</b> 50 Bronze · 25 Combat XP · 2 Small Health Potions";
  buttons.append(dialogButton('ACCEPT QUEST',()=>{pests.status='active';savePests();updateTracker();d.classList.remove('open');try{toast('📜 Quest accepted: Pests at the Gates')}catch(_){}}));
  buttons.append(dialogButton('NOT YET',()=>d.classList.remove('open')));
 }else if(pests.status==='active'&&questDone()){
  text.innerHTML='Good work. The road should be safer now.<br><br><b>Reward:</b> 50 Bronze · 25 Combat XP · 2 Small Health Potions';
  buttons.append(dialogButton('CLAIM REWARD',()=>{
    if(!pests.rewarded){try{addItem('gold',50);addItem('health_potion',2);gainXP(25)}catch(_){ }pests.rewarded=true;}
    pests.status='complete';savePests();try{save(false)}catch(_){ }updateTracker();d.classList.remove('open');try{toast('🏆 Pests at the Gates complete! +50 Bronze · +25 XP · +2 Potions')}catch(_){ }
  }));
 }else if(pests.status==='active'){
  text.innerHTML='Keep at it. I still need those pests cleared.<br><br>'+trackerText().replace(' · ','<br>');
  buttons.append(dialogButton('BACK',()=>d.classList.remove('open')));
 }else{
  text.innerHTML='You did Oakhaven a service. Travelers can use the road without looking over their shoulders now.';
  buttons.append(dialogButton('CLOSE',()=>d.classList.remove('open')));
 }
 d.classList.add('open');
}
function spawnMara(){
 const town=document.getElementById('world');if(!town)return;
 let n=document.getElementById('maraThornfieldNpc');
 if(!n){
   n=document.createElement('div');n.id='maraThornfieldNpc';n.className='npc starterQuestNpc';n.dataset.id='mara_thornfield';n.dataset.talk='Mara Thornfield watches the south road.';n.style.left='1015px';n.style.top='1125px';
   n.innerHTML=`<div class="starterQuestMark">!</div><img src="${AP}mara_thornfield/npc_gameplay_locked.png" alt="Mara Thornfield"><span>Mara Thornfield</span>`;
   town.appendChild(n);
 }
 if(n.dataset.pestsBound==='1')return;
 n.dataset.pestsBound='1';
 n.addEventListener('click',e=>{e.stopPropagation();const x=1060,y=1220;if(typeof pos!=='undefined'&&Math.hypot(pos.x-x,pos.y-y)<=165)showMara();else{moveTarget={x:x,y:y+24};try{toast('Walking to Mara Thornfield...')}catch(_){}}});
}
function spawnStarterMobs(){
 const town=document.getElementById('world');if(!town)return;
 SPAWNS.forEach(([type,x,y],i)=>{
  const def=MOB_DEFS[type],el=document.createElement('div');el.className='starterMob';el.dataset.type=type;el.style.left=x+'px';el.style.top=y+'px';
  el.innerHTML=`<div class="starterHp"><i></i></div><img src="${def.idle}" alt="${def.name}"><div class="starterMobName">${def.name}</div>`;
  town.appendChild(el);
  const m={type,x,y,el,img:el.querySelector('img'),bar:el.querySelector('.starterHp i'),name:def.name,hp:def.maxHp,maxHp:def.maxHp,damage:def.damage,xpReward:def.xp,respawn:null};liveMobs.push(m);
  m.onDefeat=()=>defeatStarterMob(m);
  el.addEventListener('click',e=>{e.stopPropagation();if(m.hp<=0)return;const cx=m.x+43,cy=m.y+52;if(typeof pos!=='undefined'&&Math.hypot(pos.x-cx,pos.y-cy)<=175){if(typeof window.__startStarterPestTurnBattle==='function')window.__startStarterPestTurnBattle(m)}else{moveTarget={x:cx,y:cy+35};try{toast('Move closer, then click '+def.name+' to battle.')}catch(_){}}});
 });
}
function nearestStarterMob(max=185){
 if(typeof currentArea==='undefined'||currentArea!=='town')return null;let best=null,bd=max;
 liveMobs.forEach(m=>{if(m.hp<=0)return;const d=Math.hypot(pos.x-(m.x+43),pos.y-(m.y+52));if(d<bd){bd=d;best=m}});return best;
}
function defeatStarterMob(m){
 if(!m)return false;const def=MOB_DEFS[m.type];m.hp=0;m.el.classList.add('defeated');
 if(m.bar)m.bar.style.width='0%';
 if(pests.status==='active'){
   if(m.type==='rat'&&pests.rats<3)pests.rats++;
   if(m.type==='boar'&&pests.boars<2)pests.boars++;
   savePests();updateTracker();
 }
 clearTimeout(m.respawn);m.respawn=setTimeout(()=>{m.hp=m.maxHp;if(m.bar)m.bar.style.width='100%';m.el.classList.remove('defeated')},8500);
 return true;
}

makeDialog();spawnMara();spawnStarterMobs();updateTracker();

// Put Mara ahead of generic NPC handling.
try{
 const oldInteract=interact;
 interact=function(){
   if(typeof currentArea!=='undefined'&&currentArea==='town'){
     const mara=document.getElementById('maraThornfieldNpc');
     if(mara&&typeof pos!=='undefined'&&Math.hypot(pos.x-1060,pos.y-1220)<=170){showMara();return}
   }
   return oldInteract();
 };
 const ib=document.getElementById('interact');if(ib)ib.onclick=interact;
}catch(err){console.error('[v9.18] interact bridge',err)}

// Dev QA helpers: harmless and useful for console testing.
window.ValvondorV919={showMara,quest:()=>({...pests}),mobs:()=>liveMobs.map(m=>({type:m.type,hp:m.hp,x:m.x,y:m.y})),resetQuest:()=>{pests={status:'not_started',rats:0,boars:0,rewarded:false};savePests();updateTracker();}};
console.info('[Valvondor v9.23] Mara + starter pests wired into the approved turn-battle system.');
})();
