
function __startDungeonEntityTurnBattle(entity, opts={}){
  if(typeof startTurnBattle!=='function' || !entity)return false;
  try{
    entity.__dungeonBridge=true;
    entity.__dungeonBridgeOwnsLoot=!!opts.ownsLoot;
    entity.__collectDungeonBattleLoot=opts.collectLoot||null;
    entity.__onDungeonBattleDefeated=opts.onDefeated||null;
    entity.isBoss=!!opts.isBoss;
    entity.scriptedBoss=!!opts.isBoss;
    entity.isDungeon=true;
    entity.dungeonMob=true;

    // Force correct background before opening battle.
    if(typeof battleBackgroundOverride!=='undefined')
      battleBackgroundOverride=opts.isBoss?'boss':'dungeon';
    if(typeof window.__forceBattleBackground==='function')
      window.__forceBattleBackground(opts.isBoss?'boss':'dungeon');

    startTurnBattle(entity);
    return true;
  }catch(err){
    console.error('Dungeon turn-battle bridge',err);
    return false;
  }
}

(function(){
 const box=document.getElementById('cdEnemies'),door=document.getElementById('cdDoor'),title=document.getElementById('cdRoomTitle'),goal=document.getElementById('cdRoomGoal'),fade=document.getElementById('cdFade'),msg=document.getElementById('chieftainBossMessage'),loot=document.getElementById('chieftainLoot'),hpbox=document.getElementById('chieftainBossHp'),hpfill=hpbox?.querySelector('.bar i'),hptext=hpbox?.querySelector('small');
 if(!box||!door)return;
 let room=1,enemies=[],lastHit=0,transitioning=false;
 const rooms={
  1:{title:'ROOM 1',goal:'Defeat 2 Goblins',mobs:[['Goblin','basic',420,330,70],['Goblin','basic',720,430,70]]},
  2:{title:'ROOM 2',goal:'Defeat the Goblin and Goblin Scout',mobs:[['Goblin','basic',430,420,80],['Goblin Scout','scout',735,315,95]]},
  3:{title:'ROOM 3',goal:'Defeat the Goblin Scout and Goblin Brute',mobs:[['Goblin Scout','scout',430,320,105],['Goblin Brute','brute',735,430,175]]},
  4:{title:'CHIEFTAIN\'S CHAMBER',goal:'Defeat the Goblin Chieftain',mobs:[['Goblin Chieftain','boss',650,355,500]]}
 };
 const paths={basic:'assets/dungeon/v812/goblin_basic_clean.png',scout:'assets/dungeon/v810/goblin_scout.png',brute:'assets/dungeon/v810/goblin_brute.png',boss:'assets/dungeon/v810/goblin_brute.png'};
 const idles={basic:['assets/dungeon/v812/goblin_basic_clean.png'],scout:['assets/dungeon/v810/goblin_scout.png'],brute:['assets/goblins/brute_rebuilt/idle_1.png','assets/goblins/brute_rebuilt/idle_2.png'],boss:['assets/goblins/brute_rebuilt/idle_1.png','assets/goblins/brute_cleaned/idle_2.png','assets/goblins/brute_cleaned/idle_3.png','assets/goblins/brute_cleaned/idle_4.png','assets/goblins/brute_cleaned/idle_4.png']};
 const walks={
 brute:{
  down:['assets/goblins/brute_rebuilt/down_1.png','assets/goblins/brute_rebuilt/down_2.png','assets/goblins/brute_rebuilt/down_3.png','assets/goblins/brute_rebuilt/down_4.png'],
  up:['assets/goblins/brute_rebuilt/up_1.png','assets/goblins/brute_rebuilt/up_2.png','assets/goblins/brute_rebuilt/up_3.png','assets/goblins/brute_rebuilt/up_4.png'],
  left:['assets/goblins/brute_rebuilt/left_1.png','assets/goblins/brute_rebuilt/left_2.png','assets/goblins/brute_rebuilt/left_3.png','assets/goblins/brute_rebuilt/left_4.png','assets/goblins/brute_rebuilt/left_5.png'],
  right:['assets/goblins/brute_rebuilt/right_1.png','assets/goblins/brute_rebuilt/right_2.png','assets/goblins/brute_rebuilt/right_3.png','assets/goblins/brute_rebuilt/right_4.png']
 }
};
 const attacks={basic:['assets/goblins/basic/attack_down_1.png','assets/goblins/basic/attack_down_2.png'],scout:['assets/goblins/scout/attack_1.png','assets/goblins/scout/attack_2.png'],brute:['assets/goblins/brute_rebuilt/attack_3.png','assets/goblins/brute_rebuilt/attack_4.png'],boss:['assets/goblins/brute_cleaned/overhead_1.png','assets/goblins/brute_cleaned/overhead_2.png','assets/goblins/brute_cleaned/overhead_3.png','assets/goblins/brute_cleaned/overhead_4.png']};
 function toast2(t){if(msg)msg.textContent=t;try{toast(t)}catch(e){}}
 function dungeonEnemyLevel(type){
   return type==='basic'?12:type==='scout'?20:type==='brute'?35:60;
 }
 function dungeonIncomingHitChance(type){
   const enemyLv=dungeonEnemyLevel(type);
   const lvl=(typeof playerLevel==='number'?playerLevel:1);
   const gearDef=(typeof getDefenseBonus==='function'?getDefenseBonus():0);
   let chance=.32+(enemyLv-lvl)*.006-(gearDef*.012);
   if(type==='boss') chance=Math.max(.28,chance);
   else if(type==='brute') chance=Math.max(.12,chance);
   else chance=Math.max(.08,chance);
   if(typeof state!=='undefined'&&state==='defend') chance*=.45;
   return Math.max(.05,Math.min(.72,chance));
 }
 function dungeonIncomingDamage(type){
   const base=type==='boss'?16:type==='brute'?12:type==='scout'?8:6;
   const lvl=(typeof playerLevel==='number'?playerLevel:1);
   const gearDef=(typeof getDefenseBonus==='function'?getDefenseBonus():0);
   const levelReduction=Math.floor(lvl/20);
   let dmg=Math.max(1,base-levelReduction-Math.floor(gearDef*.6));
   if(typeof state!=='undefined'&&state==='defend') dmg=Math.max(1,Math.ceil(dmg*.45));
   return dmg;
 }
 function dungeonPlayerDamage(){
   const lvl=(typeof playerLevel==='number'?playerLevel:1);
   const atk=(typeof getAttackBonus==='function'?getAttackBonus():0);
   const base=8+Math.floor(lvl*.24)+atk;
   return Math.max(4,base+Math.floor(Math.random()*9));
 }
 function dungeonPlayerAccuracy(type){
   const lvl=(typeof playerLevel==='number'?playerLevel:1);
   const acc=(typeof getAccuracyBonus==='function'?getAccuracyBonus():0);
   const enemyLv=dungeonEnemyLevel(type);
   return Math.max(.55,Math.min(.98,.78+(lvl-enemyLv)*.004+acc*.01));
 }

 function makeMob(m,i){const [name,type,x,y,hp]=m,d=document.createElement('div');d.className='cdEnemy '+(type==='brute'?'brute ':'')+(type==='boss'?'boss ':'');d.style.left=x+'px';d.style.top=y+'px';d.innerHTML='<div class="name">'+name+'</div><div class="ehp"><i></i></div><img src="'+paths[type]+'">';box.appendChild(d);let e={el:d,img:d.querySelector('img'),bar:d.querySelector('.ehp i'),name,type,x,y,max:hp,hp,dead:false,frame:0,last:0,lastAtk:0};d.onclick=()=>hit(e);return e}
 function loadRoom(n){room=n;const world=document.getElementById('chieftainDungeonWorld');if(world){world.classList.remove('room1','room2','room3','room4');world.classList.add('room'+n);}box.innerHTML='';enemies=[];door.className='locked';door.innerHTML='<span>🔒</span><b>'+(n===3?'BOSS DOOR':'SEALED DOOR')+'</b><small>Defeat all enemies</small>';loot.hidden=true;hpbox?.classList.remove('show');const r=rooms[n];title.textContent=r.title;goal.textContent=r.goal;r.mobs.forEach((m,i)=>enemies.push(makeMob(m,i)));pos={x:190,y:400};moveTarget=null;if(n===4){door.style.display='none';hpbox?.classList.add('show');loot.hidden=true;loot.classList.remove('ready','claimed');
 toast2('👑 Chieftain: “You made it this far, little wolf. Now die in my Den!”');
 setTimeout(()=>{if(room===4&&alive().length)toast2('⚔️ Aren: “Your reign ends here.”')},2200);
}else door.style.display='block'}
 function alive(){return enemies.filter(e=>!e.dead)}
 function checkClear(){if(alive().length)return;if(room===4){
 door.style.display='none';
 loot.hidden=false;
 loot.classList.add('ready');
 loot.innerHTML='<b>💰 CHIEFTAIN CACHE</b><small>Press E / Interact to claim the loot</small>';
 toast2('💀 Chieftain: “No... the Den was mine...”');
 return
}door.className='open';door.innerHTML='<b>DOOR OPEN</b><small>Enter next room</small>';toast2('🚪 Room cleared! The next door opens.')}
 function hit(e){if(currentArea!=='chieftainDungeon'||e.dead)return;const dist=Math.hypot(pos.x-e.x,pos.y-e.y);if(dist>230){toast2('Move closer to attack.');return}if(typeof window.__startDungeonTurnBattle==='function'){window.__startDungeonTurnBattle(e,()=>setTimeout(checkClear,120));return;}const now=performance.now();if(now-lastHit<330)return;lastHit=now;if(Math.random()>dungeonPlayerAccuracy(e.type)){toast2('MISS');return;}
 const dmg=dungeonPlayerDamage();e.hp=Math.max(0,e.hp-dmg);e.bar.style.width=(e.hp/e.max*100)+'%';e.el.classList.add('hurt');setTimeout(()=>e.el.classList.remove('hurt'),120);if(room===4){hpfill.style.width=(e.hp/5)+'%';hptext.textContent=e.hp+' / 500'}if(e.hp<=0){e.dead=true;e.el.classList.add('dead');setTimeout(checkClear,450)}}
 function nearestHit(){let a=alive(),best=null,bd=1e9;a.forEach(e=>{let d=Math.hypot(pos.x-e.x,pos.y-e.y);if(d<bd){bd=d;best=e}});if(best)hit(best)}
 function nextRoom(){if(transitioning||door.className!=='open')return;transitioning=true;fade.classList.add('on');setTimeout(()=>{loadRoom(room+1);fade.classList.remove('on');transitioning=false;toast2(room===4?'💀 The Chieftain awaits.':'⚔️ Room '+room+' — defeat every enemy.')},420)}

 let bossLootClaimed=false;
 function claimBossLoot(){
   if(currentArea!=='chieftainDungeon'||room!==4||bossLootClaimed||loot.hidden||!loot.classList.contains('ready'))return false;
   bossLootClaimed=true;
   let ring=false;
   try{
     addItem('gold',75);
     if(Math.random()<.35){addItem('goblin_fang_ring',1);ring=true}
     save(false);
   }catch(e){}
   loot.classList.remove('ready');loot.classList.add('claimed');
   loot.innerHTML='<b>✅ CACHE CLAIMED</b><small>75 Gold'+(ring?' + Goblin Fang Ring':'')+'</small>';
   toast2(ring?'🏆 Loot: 75 Gold + Goblin Fang Ring!':'🏆 Loot: 75 Gold');
   return true;
 }
 loot?.addEventListener('click',()=>claimBossLoot());

 door.onclick=()=>{if(currentArea==='chieftainDungeon'&&door.className==='open')nextRoom()};
 document.addEventListener('keydown',e=>{if(currentArea!=='chieftainDungeon')return;if(e.code==='Space')setTimeout(nearestHit,70);
 if((e.code==='KeyE'||e.code==='Enter')&&room===4&&loot.classList.contains('ready')){claimBossLoot();return}
 if((e.code==='KeyE'||e.code==='Enter')&&door.className==='open'&&Math.hypot(pos.x-1050,pos.y-390)<240)nextRoom()},true);
 document.getElementById('attack')?.addEventListener('click',()=>{if(currentArea==='chieftainDungeon')setTimeout(nearestHit,70)},true);
 document.getElementById('interact')?.addEventListener('click',()=>{if(currentArea==='chieftainDungeon'&&room===4)claimBossLoot()},true);
 function loop(t){requestAnimationFrame(loop);if(currentArea!=='chieftainDungeon'||dead)return;if(typeof window.__turnBattleIsActive==='function'&&window.__turnBattleIsActive())return;enemies.forEach(e=>{if(e.dead)return;
 const dx=pos.x-e.x,dy=pos.y-e.y,d=Math.hypot(dx,dy);
 let moving=false,dir='down';
 if(e.type==='brute'&&d<360&&d>105&&!e.el.classList.contains('hurt')){
   const speed=0.72;
   e.x+=dx/d*speed;e.y+=dy/d*speed;
   e.x=Math.max(115,Math.min(1015,e.x));e.y=Math.max(155,Math.min(575,e.y));
   e.el.style.left=e.x+'px';e.el.style.top=e.y+'px';moving=true;
   if(Math.abs(dx)>Math.abs(dy))dir=dx<0?'left':'right';else dir=dy<0?'up':'down';
 }
 if(t-e.last>185){e.last=t;
   const ia=(moving&&walks[e.type]?walks[e.type][dir]:idles[e.type])||[];
   if(ia.length&&!e.el.classList.contains('hurt'))e.img.src=ia[e.frame++%ia.length];
 }
if(d<280&&t-e.lastAtk>1900){e.lastAtk=t;const arr=attacks[e.type]||[];if(arr.length){e.img.src=arr[e.frame++%arr.length];setTimeout(()=>{if(!e.dead)e.img.src=(idles[e.type]&&idles[e.type][0])||paths[e.type]},180)}const block=(typeof getBlockChance==='function'?getBlockChance():0);
 if(Math.random()<block){toast2('🛡️ BLOCK');return;}
 if(Math.random()>dungeonIncomingHitChance(e.type)){toast2('DODGE');return;}
 const damage=dungeonIncomingDamage(e.type);
 hp=Math.max(0,hp-damage);hpBar.style.width=(hp/playerMaxHP()*100)+'%';
 if(hp<=0){dead=true;locked=true;setAnimation('dead',true);showDeathScreen()}}});}
 requestAnimationFrame(loop);
 const entrance=document.getElementById('chieftainDungeonEntrance');entrance?.addEventListener('click',()=>setTimeout(()=>{if(currentArea==='chieftainDungeon')loadRoom(1)},80));
 document.addEventListener('keydown',e=>{if(e.code==='KeyE'&&currentArea==='chieftainDungeon'&&room===1&&enemies.length===0)loadRoom(1)},true);
 // initialize when dungeon first becomes active
 new MutationObserver(()=>{if(document.getElementById('chieftainDungeonWorld')?.classList.contains('active')&&!enemies.length)loadRoom(1)}).observe(document.getElementById('chieftainDungeonWorld'),{attributes:true,attributeFilter:['class']});
 document.getElementById('chieftainDungeonExit')?.addEventListener('click',()=>{if(currentArea==='chieftainDungeon')switchArea('forest',CHIEFTAIN_DUNGEON_RETURN)});
 window.__chieftainRooms={loadRoom,getState:()=>({room,alive:alive().length})};
})();

// v8.09: crisp room decoration; deliberately avoids scaling tiny recovered room screenshots.
(function(){
 const world=document.getElementById('chieftainDungeonWorld'); if(!world)return;
 const sets={
  1:[['🔥',150,210,'fire'],['🔥',930,210,'fire'],['🦴',300,590,'rubble'],['🪨',760,590,'rubble'],['🕯️',560,180,'']],
  2:[['🔥',145,205,'fire'],['🔥',940,205,'fire'],['🛢️',270,570,'big'],['🛢️',850,555,'big'],['☠️',560,610,'rubble'],['📦',350,190,'big']],
  3:[['🕯️',145,205,''],['🕯️',940,205,''],['☠️',270,570,'rubble'],['☠️',850,570,'rubble'],['🔥',555,590,'fire'],['🪨',365,185,'rubble']],
  4:[['🔥',150,205,'fire'],['🔥',930,205,'fire'],['☠️',260,570,'rubble'],['☠️',850,570,'rubble'],['⚑',350,175,'big'],['⚑',780,175,'big']]
 };
 function decorate(n){world.querySelectorAll('.cdCrispProp').forEach(x=>x.remove());(sets[n]||[]).forEach(p=>{const e=document.createElement('div');e.className='cdCrispProp '+p[3];e.textContent=p[0];e.style.left=p[1]+'px';e.style.top=p[2]+'px';world.appendChild(e)})}
 const api=window.__chieftainRooms;if(api&&api.loadRoom){const old=api.loadRoom;api.loadRoom=function(n){old(n);decorate(n)}}
 new MutationObserver(()=>{const m=[...world.classList].find(x=>/^room[1-4]$/.test(x));if(m)decorate(+m.slice(4))}).observe(world,{attributes:true,attributeFilter:['class']});
})();

// v8.10 recovered-asset dungeon art pass
(function(){
 const w=document.getElementById('chieftainDungeonWorld'); if(!w)return;
 const A='assets/dungeon/v810/';
 const layouts={
 1:[['torch',120,170,62],['torch',1010,170,62],['bones',220,570,95],['rocks',880,560,105],['barrel',170,475,65],['crate',920,450,70],['pillar',300,145,70],['pillar',850,145,70]],
 2:[['brazier',130,180,85],['brazier',990,180,85],['barrel',220,520,70],['barrel',850,520,70],['crate',300,500,75],['skulls',760,545,100],['spikes',470,145,130],['banner',750,135,75]],
 3:[['torch',130,175,62],['torch',1000,175,62],['skulls',220,540,105],['bones',860,540,100],['pillar',270,150,75],['pillar',850,150,75],['banner',520,130,82],['spikes',430,565,150]],
 4:[['brazier',135,190,90],['brazier',985,190,90],['skulls',210,535,115],['skulls',850,535,115],['banner',300,140,90],['banner',800,140,90],['pillar',210,245,85],['pillar',900,245,85]]};
 function art(n){w.querySelectorAll('.v810prop').forEach(e=>e.remove());(layouts[n]||[]).forEach(q=>{let i=document.createElement('img');i.className='v810prop';i.src=A+q[0]+'.png';i.style.cssText=`left:${q[1]}px;top:${q[2]}px;width:${q[3]}px`;w.appendChild(i)});}
 new MutationObserver(()=>{let c=[...w.classList].find(x=>/^room[1-4]$/.test(x));if(c)art(+c.slice(4))}).observe(w,{attributes:true,attributeFilter:['class']});
})();

// v8.11 structural wall layer
(function(){
 const w=document.getElementById('chieftainDungeonWorld'); if(!w)return;
 ['top','bottom','left','right'].forEach(x=>{const e=document.createElement('div');e.className='cdWallStrip '+x;w.appendChild(e)});
 ['tl','tr','bl','br'].forEach(x=>{const e=document.createElement('div');e.className='cdCorner '+x;w.appendChild(e)});
})();

// v8.12 Room 1 visual construction from newly sliced assets.
(function(){
 const world=document.getElementById('chieftainDungeonWorld'); if(!world)return;
 const layer=document.createElement('div'); layer.className='v812room1';
 layer.innerHTML=`
   <div class="v812wall top"></div><div class="v812wall bottom"></div>
   <div class="v812wall left"></div><div class="v812wall right"></div>
   <img class="v812decor" src="assets/dungeon/v812/pillar_1.png" style="left:155px;top:185px;width:58px">
   <img class="v812decor" src="assets/dungeon/v812/pillar_2.png" style="right:205px;top:185px;width:58px">
   <img class="v812decor" src="assets/dungeon/v812/rubble_1.png" style="left:205px;bottom:155px;width:58px">
   <img class="v812decor" src="assets/dungeon/v812/bones_1.png" style="right:250px;bottom:145px;width:52px">
   <img class="v812decor" src="assets/dungeon/v812/prop_1.png" style="left:125px;bottom:170px;width:48px">
 `;
 world.insertBefore(layer,world.firstChild);
})();

// v8.14 visual layer — deliberately sparse center, decorated perimeter.
(function(){
 const w=document.getElementById('chieftainDungeonWorld'); if(!w)return;
 const old=w.querySelector('.v812room1'); if(old) old.style.display='none';
 const layer=document.createElement('div'); layer.className='v814room1';
 layer.innerHTML=`
  <div class="v814stone top"></div><div class="v814stone bottom"></div>
  <div class="v814stone left"></div><div class="v814stone right"></div>

  <div class="v814banner" style="left:330px;top:88px"></div>
  <div class="v814banner" style="right:350px;top:88px"></div>

  <img class="v814torchimg" src="assets/dungeon/v812/torch_real.png" style="left:235px;top:105px">
  <img class="v814torchimg" src="assets/dungeon/v812/torch_real.png" style="left:515px;top:105px">
  <img class="v814torchimg" src="assets/dungeon/v812/torch_real.png" style="right:265px;top:105px">
  <img class="v814torchimg" src="assets/dungeon/v812/torch_real.png" style="right:112px;top:335px">

  <img class="v814prop" src="assets/dungeon/v812/pillar_1.png" style="left:210px;top:205px;width:60px">
  <img class="v814prop" src="assets/dungeon/v812/pillar_2.png" style="right:235px;top:205px;width:60px">

  <img class="v814prop" src="assets/dungeon/v812/prop_1.png" style="left:145px;top:350px;width:48px">
  <img class="v814prop" src="assets/dungeon/v812/prop_2.png" style="left:195px;top:365px;width:44px">
  <img class="v814prop" src="assets/dungeon/v812/bones_1.png" style="left:170px;bottom:155px;width:58px">
  <img class="v814prop" src="assets/dungeon/v812/rubble_1.png" style="right:190px;bottom:150px;width:62px">
  <img class="v814prop" src="assets/dungeon/v812/rubble_2.png" style="left:485px;bottom:125px;width:48px">
  <img class="v814prop" src="assets/dungeon/v812/bones_2.png" style="right:340px;top:235px;width:48px">

  <div class="v814blood" style="left:325px;bottom:145px"></div>
  <div class="v814blood" style="right:300px;bottom:210px;transform:rotate(18deg)"></div>
 `;
 w.insertBefore(layer,w.firstChild);
})();

// v8.16 final asset-built Room 1 concept layer
(function(){
 const w=document.getElementById('chieftainDungeonWorld'); if(!w)return;
 const layer=document.createElement('div'); layer.className='v816room1';
 layer.innerHTML=`
   <div class="v816wall top"></div><div class="v816wall bottom"></div>
   <div class="v816wall left"></div><div class="v816wall right"></div>

   <img class="v816art v816banner" src="assets/dungeon/v816/red_banner.png" style="left:315px;top:95px">
   <img class="v816art v816banner" src="assets/dungeon/v816/red_banner_torn.png" style="right:335px;top:95px">

   <img class="v816art v816torch" src="assets/dungeon/v816/wall_torch.png" style="left:215px;top:105px">
   <img class="v816art v816torch" src="assets/dungeon/v816/wall_torch.png" style="left:500px;top:105px">
   <img class="v816art v816torch" src="assets/dungeon/v816/wall_torch.png" style="right:240px;top:105px">
   <img class="v816art v816torch" src="assets/dungeon/v816/wall_torch.png" style="right:95px;top:330px">

   <img class="v816art v816pillar" src="assets/dungeon/v816/pillar.png" style="left:210px;top:205px">
   <img class="v816art v816pillar" src="assets/dungeon/v816/pillar.png" style="right:225px;top:205px">

   <img class="v816art v816barrel" src="assets/dungeon/v816/barrel.png" style="left:145px;top:390px">
   <img class="v816art v816crate" src="assets/dungeon/v816/crate.png" style="left:195px;top:405px">
   <img class="v816art v816bones" src="assets/dungeon/v816/bones.png" style="left:165px;bottom:150px">
   <img class="v816art v816rubble" src="assets/dungeon/v816/rubble.png" style="right:185px;bottom:145px">
   <img class="v816art" src="assets/dungeon/v816/standing_brazier.png" style="right:145px;bottom:170px;width:40px">
 `;
 w.insertBefore(layer,w.firstChild);
})();

// v8.17 perimeter dressing, preserving open combat center
(function(){
 const w=document.getElementById('chieftainDungeonWorld');if(!w)return;
 const l=document.createElement('div');l.className='v817room1';
 l.innerHTML=`
  <img class="v817art" src="assets/dungeon/v817/chain.png" style="left:118px;top:235px;width:22px">
  <img class="v817art" src="assets/dungeon/v817/chain2.png" style="right:125px;top:205px;width:20px">

  <img class="v817art" src="assets/dungeon/v816/barrel.png" style="left:145px;top:440px;width:42px">
  <img class="v817art" src="assets/dungeon/v816/crate.png" style="left:185px;top:455px;width:40px">
  <img class="v817art" src="assets/dungeon/v817/propA.png" style="left:130px;top:490px;width:34px">

  <img class="v817art" src="assets/dungeon/v817/bones2.png" style="left:250px;bottom:135px;width:48px">
  <img class="v817art" src="assets/dungeon/v817/bones3.png" style="right:300px;top:190px;width:44px">
  <img class="v817art" src="assets/dungeon/v817/rubble2.png" style="right:150px;bottom:225px;width:52px">
  <img class="v817art" src="assets/dungeon/v817/rubble3.png" style="left:420px;bottom:120px;width:45px">

  <div class="v817blood" style="left:335px;bottom:155px"></div>
  <div class="v817blood" style="right:305px;bottom:245px;transform:rotate(18deg) scale(.75)"></div>

  <img class="v817floor" src="assets/dungeon/v817/special1.png" style="left:285px;top:205px;width:48px">
  <img class="v817floor" src="assets/dungeon/v817/special2.png" style="right:330px;bottom:125px;width:48px">

  <div class="v817rack" style="right:145px;top:465px"></div>
  <img class="v817art" src="assets/dungeon/v816/standing_brazier.png" style="left:110px;bottom:125px;width:42px">
 `;
 w.insertBefore(l,w.firstChild);
})();

// v8.19 deeper dressing — decorations extend inward while combat lanes stay clear.
(function(){
 const w=document.getElementById('chieftainDungeonWorld');if(!w)return;
 const l=document.createElement('div');l.className='v819room1';
 l.innerHTML=`
  <div class="v819brokenwall" style="left:115px;top:150px;width:185px"></div>
  <div class="v819brokenwall" style="right:170px;bottom:108px;width:210px;transform:rotate(180deg)"></div>

  <div class="v819crack" style="left:325px;top:205px;transform:rotate(12deg)"></div>
  <div class="v819crack" style="left:535px;top:455px;transform:rotate(-18deg) scale(.8)"></div>
  <div class="v819crack" style="right:285px;top:245px;transform:rotate(31deg) scale(.7)"></div>

  <div class="v819blood" style="left:410px;top:325px;width:70px;height:24px;transform:rotate(-16deg)"></div>
  <div class="v819blood" style="right:360px;top:405px;width:55px;height:20px;transform:rotate(22deg)"></div>

  <div class="v819chain" style="left:260px;top:120px;height:92px"></div>
  <div class="v819chain" style="right:290px;top:120px;height:78px"></div>

  <img class="v819art" src="assets/dungeon/v816/red_banner.png" style="left:465px;top:95px;width:30px">
  <img class="v819art" src="assets/dungeon/v816/red_banner_torn.png" style="right:470px;top:96px;width:28px">

  <img class="v819art" src="assets/dungeon/v816/rubble.png" style="left:330px;top:470px;width:52px">
  <img class="v819art" src="assets/dungeon/v817/rubble2.png" style="right:330px;top:490px;width:46px">
  <img class="v819art" src="assets/dungeon/v816/bones.png" style="left:555px;top:205px;width:44px">

  <img class="v819art" src="assets/dungeon/v816/barrel.png" style="right:180px;top:465px;width:39px">
  <img class="v819art" src="assets/dungeon/v816/crate.png" style="right:220px;top:480px;width:38px">
 `;
 w.insertBefore(l,w.firstChild);
})();

// v8.20 Room 2 visual layer: Goblin + Scout encounter.
(function(){
 const w=document.getElementById('chieftainDungeonWorld');if(!w)return;
 const l=document.createElement('div');l.className='v820room2';
 l.innerHTML=`
  <div class="v820wall top"></div><div class="v820wall bottom"></div>
  <div class="v820wall left"></div><div class="v820wall right"></div>

  <img class="v820art" src="assets/dungeon/v816/red_banner.png" style="left:300px;top:95px;width:32px">
  <img class="v820art" src="assets/dungeon/v816/red_banner_torn.png" style="right:305px;top:95px;width:30px">
  <img class="v820art" src="assets/dungeon/v816/wall_torch.png" style="left:210px;top:105px;width:32px">
  <img class="v820art" src="assets/dungeon/v816/wall_torch.png" style="right:215px;top:105px;width:32px">

  <img class="v820art" src="assets/dungeon/v816/pillar.png" style="left:225px;top:205px;width:48px">
  <img class="v820art" src="assets/dungeon/v816/pillar.png" style="right:245px;bottom:180px;width:48px">

  <div class="v820barricade" style="left:390px;top:235px"></div>
  <div class="v820barricade" style="right:345px;bottom:205px;transform:rotate(12deg)"></div>

  <img class="v820art" src="assets/dungeon/v816/barrel.png" style="left:150px;bottom:185px;width:42px">
  <img class="v820art" src="assets/dungeon/v816/crate.png" style="left:190px;bottom:175px;width:40px">
  <img class="v820art" src="assets/dungeon/v816/bones.png" style="left:350px;bottom:135px;width:50px">
  <img class="v820art" src="assets/dungeon/v817/rubble2.png" style="right:170px;top:215px;width:50px">
  <img class="v820art" src="assets/dungeon/v817/chain.png" style="right:125px;top:210px;width:20px">

  <div class="v820blood" style="left:520px;top:365px;width:70px;height:24px;transform:rotate(15deg)"></div>
 `;
 w.insertBefore(l,w.firstChild);
})();

// v8.21 runtime cleanup: remove legacy visual elements only in Room 2.
(function(){
 function cleanRoom2(){
   const w=document.getElementById('chieftainDungeonWorld');
   if(!w || !w.classList.contains('room2')) return;
   w.querySelectorAll('.cdWallStrip,.cdCorner,.v810prop,.v811wall,.v811decor,.v812wall,.v812decor').forEach(el=>{
      if(!el.closest('.v820room2')) el.style.display='none';
   });
 }
 const obs=new MutationObserver(cleanRoom2);
 const w=document.getElementById('chieftainDungeonWorld');
 if(w){obs.observe(w,{attributes:true,attributeFilter:['class'],childList:true,subtree:false});cleanRoom2();}
})();

// v8.22 Room 3 visual layer — closer to the Chieftain, heavier damage and red accents.
(function(){
 const w=document.getElementById('chieftainDungeonWorld');if(!w)return;
 const l=document.createElement('div');l.className='v822room3';
 l.innerHTML=`
  <div class="v822wall top"></div><div class="v822wall bottom"></div>
  <div class="v822wall left"></div><div class="v822wall right"></div>

  <img class="v822art" src="assets/dungeon/v816/red_banner.png" style="left:285px;top:95px;width:34px">
  <img class="v822art" src="assets/dungeon/v816/red_banner_torn.png" style="left:505px;top:95px;width:30px">
  <img class="v822art" src="assets/dungeon/v816/red_banner.png" style="right:290px;top:95px;width:34px">

  <img class="v822art" src="assets/dungeon/v816/wall_torch.png" style="left:195px;top:105px;width:32px">
  <img class="v822art" src="assets/dungeon/v816/wall_torch.png" style="right:200px;top:105px;width:32px">
  <img class="v822art" src="assets/dungeon/v816/standing_brazier.png" style="right:145px;bottom:165px;width:42px">

  <img class="v822art" src="assets/dungeon/v816/pillar.png" style="left:200px;top:210px;width:50px">
  <img class="v822art" src="assets/dungeon/v816/pillar.png" style="right:220px;top:210px;width:50px">

  <div class="v822barricade" style="left:360px;top:215px;transform:rotate(-10deg)"></div>
  <div class="v822barricade" style="right:300px;bottom:205px;transform:rotate(14deg)"></div>

  <div class="v822crack" style="left:300px;top:360px;transform:rotate(8deg)"></div>
  <div class="v822crack" style="right:335px;top:330px;transform:rotate(-21deg) scale(.85)"></div>

  <div class="v822blood" style="left:455px;top:300px;width:85px;height:28px;transform:rotate(-13deg)"></div>
  <div class="v822blood" style="right:305px;bottom:180px;width:65px;height:23px;transform:rotate(20deg)"></div>

  <img class="v822art" src="assets/dungeon/v816/bones.png" style="left:150px;bottom:145px;width:55px">
  <img class="v822art" src="assets/dungeon/v817/rubble2.png" style="left:290px;bottom:135px;width:50px">
  <img class="v822art" src="assets/dungeon/v817/rubble3.png" style="right:165px;top:230px;width:48px">
  <img class="v822art" src="assets/dungeon/v816/barrel.png" style="right:170px;bottom:230px;width:40px">
  <img class="v822art" src="assets/dungeon/v816/crate.png" style="right:210px;bottom:220px;width:38px">
  <img class="v822art" src="assets/dungeon/v817/chain.png" style="left:125px;top:225px;width:20px">
 `;
 w.insertBefore(l,w.firstChild);
})();
