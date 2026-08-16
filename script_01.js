
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


let W=3600,H=2100; let skyMode=false; const view=document.getElementById('view'),townWorld=document.getElementById('world'),forestWorld=document.getElementById('forestWorld'),shopWorld=document.getElementById('shopWorld'),mineWorld=document.getElementById('mineWorld'); let world=townWorld;
const playerWrap=document.getElementById('playerWrap'),player=document.getElementById('player'),weaponLayer=document.getElementById('weaponLayer');
const chieftainDungeonWorld=document.getElementById('chieftainDungeonWorld');
const toastEl=document.getElementById('toast'),panel=document.getElementById('panel'),hpBar=document.getElementById('hpBar');

const CHARACTER_KEY='valvondor-character-v2';
const HEROES={
 wolf_knight_male:{name:'Wolf Knight',portrait:'assets/embedded/asset_0001_b18d5e1eed4818f8.png',format:'portrait'},
 wolf_rogue_male:{name:'Wolf Rogue',portrait:'assets/embedded/asset_0002_8d266f54354d8a0e.png',format:'portrait'},
 wolf_mage_male:{name:'Wolf Mage',portrait:'assets/embedded/asset_0003_ca84f544406cf674.png',format:'portrait'},
 wolf_knight_female:{name:'Wolf Knight',portrait:'assets/embedded/asset_0004_190c510671650809.png',format:'portrait'},
 wolf_rogue_female:{name:'Wolf Rogue',portrait:'assets/embedded/asset_0005_64dcbadd02b919d7.png',format:'portrait'},
 wolf_archer_female:{name:'Wolf Archer',portrait:'assets/characters/female_wolf_archer/portrait.png',format:'portrait'},
 lpc:{name:'Valvondor Adventurer',portrait:'assets/embedded/asset_0001_b18d5e1eed4818f8.png',format:'lpc'}
};
let characterData={name:'Aren',hero:'wolf_knight_male',fur:'silver',created:false};
function loadCharacterData(){
 try{
  const raw=localStorage.getItem(CHARACTER_KEY)||localStorage.getItem('valvondor-character-v1');
  if(raw){const saved=JSON.parse(raw);characterData={...characterData,...saved};if(!saved.hero||!HEROES[saved.hero])characterData.hero='wolf_knight_male';if(!['silver','ember','frost','shadow','gold'].includes(characterData.fur))characterData.fur='silver'}
 }catch(e){}
 applyCharacterData();
}
function currentHero(){return HEROES[characterData.hero]||HEROES.wolf_knight_male}

const WOLF_FUR_STYLES={
 silver:{name:'Silver',filter:'none'},
 ember:{name:'Ember',filter:'sepia(.18) saturate(1.55) hue-rotate(325deg) contrast(1.05)'},
 frost:{name:'Frost',filter:'sepia(.12) saturate(1.35) hue-rotate(155deg) brightness(1.06)'},
 shadow:{name:'Shadow',filter:'saturate(.75) hue-rotate(215deg) brightness(.70) contrast(1.2)'},
 gold:{image:'assets/items/gold.png',name:'Gold',filter:'sepia(.45) saturate(1.6) hue-rotate(350deg) brightness(1.05)'}
};

function applyCharacterData(){
 const charName=(characterData.name||'Aren').trim().slice(0,16)||'Aren';characterData.name=charName;
 const nameEl=document.getElementById('name');if(nameEl)nameEl.textContent=charName;
 const hudName=document.querySelector('#hud b');if(hudName)hudName.innerHTML='⚔️ '+charName+' · Lv. '+playerLevel;
 player.style.filter=(characterData.hero==='wolf_knight_male'?'none':'drop-shadow(0 9px 5px #000a)');playerWrap.dataset.wolfFur=characterData.fur||'silver';playerWrap.dataset.hero=characterData.hero||'wolf_knight_male';
 if(typeof state!=='undefined')setAnimation(state,true);
}
function openCharacterCreator(firstTime=false){
 const creator=document.getElementById('characterCreator');
 document.getElementById('characterNameInput').value=characterData.name||'';
 document.querySelectorAll('.appearanceChoice').forEach(b=>b.classList.toggle('active',b.dataset.hero===characterData.hero));
 document.querySelectorAll('.furChoice').forEach(b=>b.classList.toggle('active',b.dataset.fur===characterData.fur));
 updateCreatorPreview();creator.classList.add('open');creator.dataset.firstTime=firstTime?'1':'0';keys={};
}
function closeCharacterCreator(){document.getElementById('characterCreator').classList.remove('open')}
function updateCreatorPreview(){
 const preview=document.getElementById('creatorKnight');
 const hero=currentHero();
 if(preview){
   preview.style.backgroundImage=`url("${hero.portrait}")`;
   preview.style.backgroundSize='contain';
   preview.style.backgroundPosition='center bottom';
   preview.style.backgroundRepeat='no-repeat';
   preview.style.filter=WOLF_FUR_STYLES[characterData.fur]?.filter||'none';
 }
 const furLabel=document.getElementById('creatorFurLabel');
 if(furLabel)furLabel.textContent=(WOLF_FUR_STYLES[characterData.fur]?.name||'Silver')+' Wolf';
}
function saveCharacterFromCreator(){
 const input=document.getElementById('characterNameInput');const entered=(input.value||'').trim();
 if(entered.length<2){toast('Character name must have at least 2 letters.');input.focus();return}
 characterData.name=entered.slice(0,16);characterData.created=true;
 localStorage.setItem(CHARACTER_KEY,JSON.stringify(characterData));applyCharacterData();setAnimation('idle',true);closeCharacterCreator();save(false);toast('Welcome to Valvondor, '+characterData.name+'!');
}
document.querySelectorAll('.appearanceChoice').forEach(b=>b.onclick=()=>{characterData.hero=b.dataset.hero;document.querySelectorAll('.appearanceChoice').forEach(x=>x.classList.toggle('active',x===b));updateCreatorPreview()});
document.querySelectorAll('.furChoice').forEach(b=>b.onclick=()=>{
 characterData.fur=b.dataset.fur;
 document.querySelectorAll('.furChoice').forEach(x=>x.classList.toggle('active',x===b));
 updateCreatorPreview();
});
document.getElementById('createCharacterBtn').onclick=saveCharacterFromCreator;
document.getElementById('cancelCharacterBtn').onclick=()=>{if(document.getElementById('characterCreator').dataset.firstTime==='1')return;closeCharacterCreator()};
document.getElementById('characterBtn').onclick=()=>openCharacterCreator(false);
document.getElementById('characterNameInput').addEventListener('keydown',e=>{if(e.key==='Enter')saveCharacterFromCreator()});

const chopBox=document.getElementById('chopBox'),chopFill=document.getElementById('chopFill'),chopText=document.getElementById('chopText');

const animations={
 idle:{heroFile:'idle.png',frames:2,fps:4,loop:true},
 walk:{heroFile:'walk.png',frames:9,fps:10,loop:true},
 run:{heroFile:'run.png',frames:8,fps:13,loop:true},
 attack1:{heroFile:'1h_slash.png',frames:13,fps:15,loop:false},
 attack2:{heroFile:'1h_slash.png',frames:13,fps:16,loop:false},
 attack3:{heroFile:'1h_slash.png',frames:13,fps:17,loop:false},
 hurt:{heroFile:'hurt.png',frames:6,fps:11,loop:false,singleRow:true},
 dead:{heroFile:'hurt.png',frames:6,fps:8,loop:false,hold:true,singleRow:true},
 jump:{heroFile:'jump.png',frames:5,fps:12,loop:false},
 defend:{heroFile:'combat.png',frames:2,fps:5,loop:true},
 run_attack:{heroFile:'1h_slash.png',frames:13,fps:16,loop:false}
};
const LPC_FRAME=96;
const LPC_DIR_ROW={up:0,left:1,down:2,right:3};
let facingDir='down';

const SAFE_SPAWN={x:2900,y:1180},FOREST_SPAWN={x:1100,y:1230},FOREST_RETURN={x:1140,y:1205},MINE_SPAWN={x:1000,y:1160},MINE_RETURN={x:1710,y:1835};
const MAP_VERSION="v72-general-store-door-fix";
let currentArea="town",townPosition={...SAFE_SPAWN};
const SHOP_SPAWN={x:500,y:535},SHOP_RETURN={x:2410,y:735};
const CHIEFTAIN_DUNGEON_SPAWN={x:600,y:650},CHIEFTAIN_DUNGEON_RETURN={x:405,y:835};
function inShopEntranceZone(){return currentArea==='town'&&pos.x>=2260&&pos.x<=2560&&pos.y>=585&&pos.y<=790;}
const shopCollision=[[0,0,1000,120],[0,0,55,700],[945,0,55,700],[0,680,410,20],[590,680,410,20],[55,135,190,190],[755,135,190,190]]; // Counter is visual only so the player can reach the shopkeeper
let pos={...SAFE_SPAWN},keys={},facing=1,speed=3.8,quest=0,inventory=['🗝️'],hp=100;
let moveTarget=null,cameraScale=1,cameraX=0,cameraY=0;
let state='idle',frame=0,lastFrame=0,locked=false,combo=0,comboTimer=0,dead=false;
let playerLevel=1;
let playerXP=0;
let xpToNext=100;
let woodcuttingLevel=1,woodcuttingXP=0,woodcuttingNext=100;
let miningLevel=1,miningXP=0,miningNext=100,mining=false;
let fishingLevel=1,fishingXP=0,fishingNext=100,fishing=false,fishingTarget=null;
let smithQuest={status:'not_started'};
let forgeTab='quest';
let chopping=false,chopTimer=null,chopTarget=null;
const TREE_RESPAWN_MS=20000;
const depletedTrees={};
let dailyQuestState={date:"",accepted:{},completed:{},claimed:{},explored:{}};
let tutorialState={started:false,step:0,complete:false};
const TUTORIAL_STEPS=[
 {title:'Welcome to Valvondor',text:'Move around Oakhaven using WASD or click/tap where you want to walk.',check:'move'},
 {title:'Meet Oakhaven',text:'Walk to the Mayor and press E / Interact to speak with him.',check:'interact'},
 {title:'Gather Supplies',text:'Chop an Oak Tree and collect your first Oak Log.',check:'woodcut'},
 {title:'Brimvault Training',text:'Mine your first ore in Brimvault.',check:'mine'},
 {title:'Silverwater Training',text:'Catch your first fish. The Silverwater Fisher can give you a rod.',check:'fish'},
 {title:'Defend Yourself',text:'Defeat your first Goblin in Westwood.',check:'combat'},
 {title:'Ready for Adventure',text:'Training complete. Explore Oakhaven, take quests, and prepare for the Chieftain.',check:'done'}
];

const DAILY_QUESTS=[
 {id:"logs",title:"Lumber for Oakhaven",text:"Gather 10 Oak Logs",reward:"150 Gold + 50 XP"},
 {id:"goblins",title:"West Forest Patrol",text:"Defeat 5 Goblins",reward:"220 Gold + 75 XP"},
 {id:"explore",title:"The Ancient Wolf",text:"Find the hidden Wolf Idol",reward:"100 Gold + 40 XP"}
];
function applyMaxTestLevels(){ /* public demo: disabled */ }
// v8.33 Demo pacing targets:
 // Fishing L1→2: about 6 successful minnows at a normal 100-XP starting threshold.
 // Woodcutting L1→2: about 7 oak logs at 100 XP.
 // Mining L1→2: about 6 copper ore at 100 XP.
 // Combat L1→2: about 4 basic goblin kills at ~25 XP each.

function renderTutorial(){
 let box=document.getElementById('tutorialGuide');
 if(!box)return;
 if(tutorialState.complete){box.classList.remove('show');return}
 const s=TUTORIAL_STEPS[Math.min(tutorialState.step,TUTORIAL_STEPS.length-1)];
 box.innerHTML=`<div class="tgTop"><b>🐺 BEGINNER'S PATH</b><span>${tutorialState.step+1}/${TUTORIAL_STEPS.length}</span></div>
 <h3>${s.title}</h3><p>${s.text}</p>`;
 box.classList.add('show');
}
function tutorialProgress(kind){
 if(tutorialState.complete)return;
 if(!tutorialState.started){tutorialState.started=true;tutorialState.step=0}
 const s=TUTORIAL_STEPS[tutorialState.step];
 if(!s||s.check!==kind)return;
 if(kind==='done'){finishTutorial();return}
 tutorialState.step++;
 if(tutorialState.step>=TUTORIAL_STEPS.length-1){
   tutorialState.step=TUTORIAL_STEPS.length-1;
   setTimeout(()=>tutorialProgress('done'),700);
 }else{
   toast('🐺 Beginner Path updated!');
 }
 renderTutorial();save(false);
}
function finishTutorial(){
 tutorialState.complete=true;tutorialState.started=true;
 document.getElementById('tutorialGuide')?.classList.remove('show');
 try{addItem('gold',100);addItem('health_potion',2)}catch(e){}
 toast('🏆 Beginner Path complete! +100 Gold +2 Health Potions');
 save(false);
}

function gainXP(amount){
  playerXP+=amount;
  while(playerXP>=xpToNext){
    playerXP-=xpToNext;
    playerLevel++;
    xpToNext=Math.floor(xpToNext*1.25);
    showLevelUpCelebration('Combat',playerLevel,'⚔️');
  }
  const xp=document.querySelector('.xp');
  if(xp) xp.style.width=(playerXP/xpToNext*100)+'%';
  const b=document.querySelector('#hud b');
  if(b) b.innerHTML='⚔️ '+(characterData.name||'Aren')+' · Lv. '+playerLevel;
}

let collision=[
[1650,155,270,215],[1070,455,188,165],[2270,440,250,170],[1020,940,252,170],[2320,955,182,165],
[1110,1310,150,150],[1430,1370,186,150],[1760,1295,150,150],[2050,1370,188,150],[2350,1305,150,150],
[1620,755,320,230],[1700,30,220,155],[2460,1240,224,170],[2730,1230,170,170],[2740,885,160,145],
[500,1750,210,145],
// Goblin Forest King's Road fences. Gaps at x 245-331, 520-606, and 800-886 are gates.
[0,1080,245,38],[331,1080,189,38],[606,1080,194,38],[886,1080,234,38],
[0,1278,245,38],[331,1278,189,38],[606,1278,194,38],[886,1278,234,38],
// Westwood remains freely walkable for now; decorative trees and camp props do not trap the player.
// Silverwater River banks; the bridge gap remains walkable.
[3045,0,310,650],[3045,870,310,1230]
];
const townCollision=collision.map(r=>[...r]);

const forestCollision=[[0,0,2200,55],[0,1445,2200,55],[0,0,55,1500],[2145,0,55,1500]];

const mineCollision=[
 [0,0,2000,90],[0,1310,2000,90],[0,0,70,1400],[1930,0,70,1400]
];

// Brimvault uses a snake-shaped walkable tunnel mask.
// The player may walk only inside these thick tunnel paths and chambers.
const MINE_TUNNEL_RADIUS=115;
const MINE_WALK_SEGMENTS=[
 [[1000,1180],[1000,865]],
 [[1000,865],[610,865]],
 [[1000,865],[1390,865]],
 [[1000,865],[1000,455]],
 [[1000,455],[620,455]],
 [[1000,455],[1400,455]]
];
const MINE_WALK_ROOMS=[
 [1000,1180,175],
 [1000,865,235],
 [575,865,205],
 [1425,865,205],
 [1000,455,230],
 [585,455,185],
 [1435,455,205]
];

function pointSegmentDistance(px,py,ax,ay,bx,by){
 const vx=bx-ax,vy=by-ay,wx=px-ax,wy=py-ay;
 const len2=vx*vx+vy*vy;
 if(!len2)return Math.hypot(px-ax,py-ay);
 const t=Math.max(0,Math.min(1,(wx*vx+wy*vy)/len2));
 const cx=ax+t*vx,cy=ay+t*vy;
 return Math.hypot(px-cx,py-cy);
}

function mineWalkable(x,y){
 if(x<72||x>1928||y<92||y>1308)return false;
 for(const [cx,cy,r] of MINE_WALK_ROOMS){
   if(Math.hypot(x-cx,y-cy)<=r)return true;
 }
 for(const [[ax,ay],[bx,by]] of MINE_WALK_SEGMENTS){
   if(pointSegmentDistance(x,y,ax,ay,bx,by)<=MINE_TUNNEL_RADIUS)return true;
 }
 return false;
}


function equippedWeaponLayerId(){
 const id=equipment&&equipment.weapon;
 return ['rusty_dagger','training_sword','copper_sword','iron_sword'].includes(id)?id:null;
}
function syncWeaponLayer(anim){
 if(!weaponLayer)return;
 const id=equippedWeaponLayerId();
 if(!id){playerWrap.classList.remove('hasBakedWeapon');weaponLayer.style.backgroundImage='none';return;}
 const file=anim.heroFile;
 weaponLayer.style.backgroundImage=`url("assets/weapon_layers/${id}/${file}")`;
 weaponLayer.style.backgroundSize='1248px 384px';
 playerWrap.classList.add('hasBakedWeapon');
}
const EMBEDDED_WOLF_FRAMES={
'idle_up':'assets/embedded/asset_0130_90a09e843c6638a9.png',
'walk_up_1':'assets/embedded/asset_0131_49d8b99129bf2c81.png',
'walk_up_2':'assets/embedded/asset_0132_a37bc48664a9c22b.png',
'walk_up_3':'assets/embedded/asset_0133_b86ac7c27de45d89.png',
'walk_up_4':'assets/embedded/asset_0134_0840fa7f9f45f695.png',
'walk_up_5':'assets/embedded/asset_0135_7fe4360a4f5d76eb.png',
'idle_down':'assets/embedded/asset_0126_098ad758e80ba9ff.png',
'walk_down_1':'assets/embedded/asset_0136_0c70200b37f071dd.png',
'walk_down_2':'assets/embedded/asset_0137_50a78843b51115f8.png',
'walk_down_3':'assets/embedded/asset_0138_855751fe97ca6c5c.png',
'walk_down_4':'assets/embedded/asset_0139_15cfc20a62fcc7e6.png',
'walk_down_5':'assets/embedded/asset_0140_2b18b798c792873b.png',
'idle_left':'assets/embedded/asset_0141_341131ca00eb412a.png',
'walk_left_1':'assets/embedded/asset_0142_85e25aff6853cab7.png',
'walk_left_2':'assets/embedded/asset_0143_6bec4e7d9cdb6fcf.png',
'walk_left_3':'assets/embedded/asset_0144_66f2adfe285b12ab.png',
'walk_left_4':'assets/embedded/asset_0145_05376fc2c2b07985.png',
'walk_left_5':'assets/embedded/asset_0146_5b59e789532624e1.png',
'idle_right':'assets/embedded/asset_0147_0b8ee919a12c9be9.png',
'walk_right_1':'assets/embedded/asset_0148_365520586f9aa6ba.png',
'walk_right_2':'assets/embedded/asset_0149_90f9b51f9925ae68.png',
'walk_right_3':'assets/embedded/asset_0150_d7ff2ea042ad9b80.png',
'walk_right_4':'assets/embedded/asset_0151_88ccc21b08a57c0b.png',
'walk_right_5':'assets/embedded/asset_0152_0306846e429635eb.png'
};
function wolfDirection(){
 return ['up','left','down','right'].includes(facingDir)?facingDir:'down';
}

// v9.19: approved Archer directional frames are now the live source of truth.
const APPROVED_ARCHER='assets/approved_2026_08_14/wolf_archer/walk_verified/';
const FEMALE_ARCHER_WALK={
 down:[1,2,3].map(n=>`${APPROVED_ARCHER}down/down_${n}.png`),
 up:[1,2,3,4].map(n=>`${APPROVED_ARCHER}up/up_${n}.png`),
 left:[1,2,3,4].map(n=>`${APPROVED_ARCHER}left/left_${n}.png`),
 right:[1,2,3].map(n=>`${APPROVED_ARCHER}right/right_${n}.png`)
};
const FEMALE_ARCHER_IDLE={
 down:FEMALE_ARCHER_WALK.down[0],
 up:FEMALE_ARCHER_WALK.up[0],
 left:FEMALE_ARCHER_WALK.left[0],
 right:FEMALE_ARCHER_WALK.right[0]
};
// Never fall back to the retired Archer run sprites. Running simply uses the
// approved directional walk cycle at a faster frame rate.
const FEMALE_ARCHER_RUN={
 down:FEMALE_ARCHER_WALK.down,
 up:FEMALE_ARCHER_WALK.up,
 left:FEMALE_ARCHER_WALK.left,
 right:FEMALE_ARCHER_WALK.right
};
const FEMALE_ARCHER_ATTACK={
 left:[1,2,3,4,5,6,7,8].map(n=>`assets/characters/female_wolf_archer/attack/left_${n}.png`),
 right:[1,2,3,4,5,6,7,8].map(n=>`assets/characters/female_wolf_archer/attack/right_${n}.png`)
};
const FEMALE_ARCHER_HURT=[1,2,3,4].map(n=>`assets/characters/female_wolf_archer/hurt/${n}.png`);
const FEMALE_ARCHER_DEATH=[1,2,3,4,5,6].map(n=>`assets/characters/female_wolf_archer/death/${n}.png`);
const FEMALE_ARCHER_FISH=[1,2,3,4,5,6,7,8].map(n=>`assets/characters/female_wolf_archer/fishing/${n}.png`);

function femaleArcherFrame(animName,dir,frameIndex){
 const d=(dir==='left'||dir==='right'||dir==='up'||dir==='down')?dir:'down';
 let key=animName;
 if(key==='attack1'||key==='attack2'||key==='attack3'||key==='run_attack')key='attack';
 if(key==='dead')key='death';
 if(key==='combat'||key==='defend')key='idle';

 if(key==='death')return FEMALE_ARCHER_DEATH[Math.min(frameIndex,FEMALE_ARCHER_DEATH.length-1)];
 if(key==='hurt')return FEMALE_ARCHER_HURT[frameIndex%FEMALE_ARCHER_HURT.length];
 if(key==='fishing')return FEMALE_ARCHER_FISH[frameIndex%FEMALE_ARCHER_FISH.length];
 if(key==='attack'){
   const lr=(d==='left')?'left':'right';
   return FEMALE_ARCHER_ATTACK[lr][frameIndex%FEMALE_ARCHER_ATTACK[lr].length];
 }
 if(key==='run'){
   return FEMALE_ARCHER_RUN[d][frameIndex%FEMALE_ARCHER_RUN[d].length];
 }
 if(key==='walk'){
   return FEMALE_ARCHER_WALK[d][frameIndex%FEMALE_ARCHER_WALK[d].length];
 }
 return FEMALE_ARCHER_IDLE[d]||FEMALE_ARCHER_IDLE.down;
}

function wolfFramePath(animName,dir,frameIndex){
 // v8.48: the selected Male Wolf Knight now uses his own real sprite pack.
 if(characterData.hero==='wolf_knight_male' && typeof V847_KNIGHT!=='undefined'){
   let key=animName;
   if(key==='run')key='walk';
   if(key==='attack1'||key==='attack2'||key==='attack3'||key==='run_attack')key='attack';
   if(key==='dead')key='death';
   if(key==='defend'||key==='combat')key='idle';

   const set=V847_KNIGHT[key];
   if(set){
     const frames=(key==='idle'||key==='walk') ? (set[dir]||set.down) : set;
     if(frames&&frames.length)return frames[Math.min(frameIndex,frames.length-1)%frames.length];
   }
   return (V847_KNIGHT.idle[dir]||V847_KNIGHT.idle.down)[0];
 }

 // v9.07 Female Wolf Archer uses its requested animation explicitly.
 if(characterData.hero==='wolf_archer_female'){
   return femaleArcherFrame(animName,dir,frameIndex);
 }

 // Existing generic wolf sprites remain the fallback for the other creator choices.
 const f=(frameIndex%5)+1;
 const key=(animName==='walk'||animName==='run')?`walk_${dir}_${f}`:`idle_${dir}`;
 const fur=characterData.fur||'silver';
 if(fur!=='silver'){
   return `assets/wolf_variants/${fur}/${key}.png`;
 }
 return EMBEDDED_WOLF_FRAMES[key]||EMBEDDED_WOLF_FRAMES.idle_down;
}
function setAnimation(name,force=false){
 if(dead && name!=='dead') return;
 if(!force && state===name) return;
 state=name; frame=0; lastFrame=performance.now();
 playerWrap.dataset.state=name;
 playerWrap.dataset.frame='0';

 const dir=wolfDirection();
 player.style.backgroundImage=`url("${wolfFramePath(name,dir,0)}")`;
 player.style.backgroundSize='contain';
 player.style.backgroundPosition='center bottom';

 /* The new Wolf Knight artwork already includes its weapon and armor. */
 if(weaponLayer) weaponLayer.style.display='none';
}
function animate(now){
 const dir=wolfDirection();
 const knight=(characterData.hero==='wolf_knight_male' && typeof V847_KNIGHT!=='undefined');

 if(knight){
   let key=state;
   if(key==='run')key='walk';
   if(key==='attack1'||key==='attack2'||key==='attack3'||key==='run_attack')key='attack';
   if(key==='dead')key='death';
   if(key==='defend'||key==='combat')key='idle';

   let set=V847_KNIGHT[key];
   let frames=null;
   if(set)frames=(key==='idle'||key==='walk')?(set[dir]||set.down):set;
   if(!frames||!frames.length)frames=V847_KNIGHT.idle[dir]||V847_KNIGHT.idle.down;

   const delay=key==='walk'?(state==='run'?90:135):
               key==='attack'?95:
               key==='hurt'?125:
               key==='death'?145:
               key==='jump'?110:
               key==='dodge'?95:
               key==='interact'?170:
               key==='rest'?240:220;

   if(key==='idle'){
     frame=0;
   }else if(now-lastFrame>=delay){
     if(key==='death'){
       frame=Math.min(frame+1,frames.length-1);
     }else{
       frame=(frame+1)%frames.length;
     }
     lastFrame=now;
   }
   if(mining && characterData.hero==='wolf_knight_male'){
     const mf=WOLF_KNIGHT_MINING;
     const mi=Math.floor((now/115)%mf.length);
     player.style.backgroundImage=`url("${mf[mi]}")`;
   }else{
     player.style.backgroundImage=`url("${frames[Math.min(frame,frames.length-1)]}")`;
   }
   player.style.backgroundSize='contain';
   player.style.backgroundPosition='center bottom';
   playerWrap.dataset.frame=String(frame);
   return;
 }

 // v9.07: Female Wolf Archer now uses the SAME dedicated animation-engine pattern
 // as the proven Male Wolf Knight instead of falling through generic wolf movement.
 const archer=(characterData.hero==='wolf_archer_female');

 if(archer){
   let key=state;
   if(key==='attack1'||key==='attack2'||key==='attack3'||key==='run_attack')key='attack';
   if(key==='dead')key='death';
   if(key==='defend'||key==='combat')key='idle';

   let frames=null;
   if(key==='idle'){
     frames=[FEMALE_ARCHER_IDLE[dir]||FEMALE_ARCHER_IDLE.down];
   }else if(key==='walk'){
     frames=FEMALE_ARCHER_WALK[dir]||FEMALE_ARCHER_WALK.down;
   }else if(key==='run'){
     frames=FEMALE_ARCHER_RUN[dir]||FEMALE_ARCHER_RUN.down;
   }else if(key==='attack'){
     const lr=(dir==='left')?'left':'right';
     frames=FEMALE_ARCHER_ATTACK[lr];
   }else if(key==='hurt'){
     frames=FEMALE_ARCHER_HURT;
   }else if(key==='death'){
     frames=FEMALE_ARCHER_DEATH;
   }else if(key==='fishing'){
     frames=FEMALE_ARCHER_FISH;
   }

   if(!frames||!frames.length){
     frames=[FEMALE_ARCHER_IDLE[dir]||FEMALE_ARCHER_IDLE.down];
     key='idle';
   }

   // Mirror the Knight's animation pacing.
   const delay=key==='walk'?135:
               key==='run'?90:
               key==='attack'?95:
               key==='hurt'?125:
               key==='death'?145:
               key==='fishing'?140:220;

   if(key==='idle'){
     frame=0;
   }else if(now-lastFrame>=delay){
     if(key==='death'){
       frame=Math.min(frame+1,frames.length-1);
     }else{
       frame=(frame+1)%frames.length;
     }
     lastFrame=now;
   }

   player.style.backgroundImage=`url("${frames[Math.min(frame,frames.length-1)]}")`;
   player.style.backgroundSize='contain';
   player.style.backgroundPosition='center bottom';
   playerWrap.dataset.frame=String(frame);
   return;
 }

 // Generic wolves keep the established movement behavior.
 const moving=(state==='walk'||state==='run');
 const delay=state==='run'?95:140;
 if(moving && now-lastFrame>=delay){
   frame=(frame+1)%5;
   player.style.backgroundImage=`url("${wolfFramePath(state,dir,frame)}")`;
   player.style.backgroundSize='contain';
   player.style.backgroundPosition='center bottom';
   playerWrap.dataset.frame=String(frame);
   lastFrame=now;
 }else if(!moving){
   frame=0;
   const idleSrc=wolfFramePath('idle',dir,0);
   player.style.backgroundImage=`url("${idleSrc}")`;
   player.style.backgroundSize='contain';
   player.style.backgroundPosition='center bottom';
   playerWrap.dataset.frame='0';
 }
}
function blocked(x,y){
 if(currentArea==='shop'){let r=18;return shopCollision.some(([a,b,w,h])=>x+r>a&&x-r<a+w&&y+r>b&&y-r<b+h);}
 if(currentArea==='chieftainDungeon'){
   const r=18;
   return x-r<82||x+r>1118||y-r<82||y+r>760;
 }
 if(currentArea==='mine') return !mineWalkable(x,y);
 if(currentArea==='forest'){
   let r=18;
   return forestCollision.some(([a,b,w,h])=>x+r>a&&x-r<a+w&&y+r>b&&y-r<b+h);
 }
 // v7.26: Silverwater collision.
 // Block the actual water while keeping the bridge crossing (y 650-870)
 // and the west-side dock approach usable.
 if(currentArea==='town'){
   const r=18;
   const silverwaterCollision=[
     [3045,0,310,650],
     [3045,870,310,1230]
   ];
   return silverwaterCollision.some(([a,b,w,h])=>x+r>a&&x-r<a+w&&y+r>b&&y-r<b+h);
 }
 return false;
}
function isSafeSpawn(x,y){
  if(!Number.isFinite(x)||!Number.isFinite(y)) return false;
  if(x<60||x>W-60||y<70||y>H-60) return false;
  if(blocked(x,y)) return false;
  return true;
}
function recoverSafePosition(){
  if(!isSafeSpawn(pos.x,pos.y)){
    pos={...SAFE_SPAWN};
    return true;
  }
  return false;
}
function camera(){
 let s,tx,ty;
 if(skyMode){s=Math.min(view.clientWidth/W,view.clientHeight/H)*0.98;tx=(view.clientWidth-W*s)/2;ty=(view.clientHeight-H*s)/2;}
 else{s=Math.max(view.clientWidth/W,view.clientHeight/H,.76);tx=view.clientWidth/2-pos.x*s;ty=view.clientHeight/2-pos.y*s;}
 let x=skyMode?tx:Math.min(0,Math.max(view.clientWidth-W*s,tx)),y=skyMode?ty:Math.min(0,Math.max(view.clientHeight-H*s,ty));
 cameraScale=s;cameraX=x;cameraY=y;
 world.style.transform=`translate(${x}px,${y}px) scale(${s})`;
 playerWrap.style.left=(pos.x-64)+'px';playerWrap.style.top=(pos.y-96)+'px';
 playerWrap.classList.toggle('facingLeft',facingDir==='left');
 player.style.zIndex='2';
 if(weaponLayer) weaponLayer.style.zIndex=(facingDir==='up'?'1':'5');
 updateMapMarker();
}
function isDown(...codes){return codes.some(code=>!!keys[code])}
function attack(){
 if(fishing){stopFishing('You stop fishing to attack.');return}
 if(dead)return;
 // Do not let a stale action lock kill the phone attack button.
 if(locked && !mining && !chopping){locked=false}
 if(locked)return;

 combo=(performance.now()-comboTimer<700)?(combo%3)+1:1;
 comboTimer=performance.now();
 locked=true;

 const moving=isDown('ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS');
 setAnimation(moving?'run_attack':'attack'+combo,true);

 // This wolf animation renderer does not emit an animation-end callback,
 // so explicitly release the combat lock after the swing.
 clearTimeout(window._attackUnlockTimer);
 window._attackUnlockTimer=setTimeout(()=>{
   if(!dead && !mining && !chopping && !fishing){
     locked=false;
     setAnimation('idle',true);
   }
 },520);
}
function showDeathScreen(){
 const screen=document.getElementById('deathScreen');
 const reviveBtn=document.getElementById('deathReviveBtn');
 const msg=document.getElementById('deathMessage');
 if(!screen)return;
 const hasElixir=(inventoryData.wolfheart_elixir||0)>0;
 reviveBtn.style.display=hasElixir?'block':'none';
 msg.textContent=hasElixir
   ? 'Use a Wolfheart Elixir to rise where you fell, or retreat to Oakhaven.'
   : 'You have no Wolfheart Elixir. Return to Oakhaven to continue your journey.';
 screen.classList.add('show');screen.setAttribute('aria-hidden','false');
}
function hideDeathScreen(){
 const screen=document.getElementById('deathScreen');
 if(screen){screen.classList.remove('show');screen.setAttribute('aria-hidden','true')}
}
function returnToOakhavenAfterDeath(){
 if(!dead)return;
 dead=false;locked=false;mining=false;chopping=false;fishing=false;
 hp=playerMaxHP();hpBar.style.width='100%';
 hideDeathScreen();
 if(currentArea!=='town')switchArea('town',SAFE_SPAWN);
 else{pos={...SAFE_SPAWN};moveTarget=null;camera()}
 setAnimation('idle',true);save(false);
 toast('⛲ You awaken at the Oakhaven fountain.');
}
function hurt(){
 if(dead||locked)return;
 hp=Math.max(0,hp-20);hpBar.style.width=(hp/playerMaxHP()*100)+'%';
 locked=true;
 if(hp<=0){dead=true;setAnimation('dead',true);showDeathScreen()}
 else{
   setAnimation('hurt',true);
   clearTimeout(window._hurtUnlockTimer);
   window._hurtUnlockTimer=setTimeout(()=>{if(!dead){locked=false;setAnimation('idle',true)}},430);
 }
}
function revive(){
 if(!dead)return;
 if((inventoryData.wolfheart_elixir||0)<=0){showDeathScreen();return}
 removeItem('wolfheart_elixir',1);
 dead=false;locked=false;
 hp=Math.max(1,Math.ceil(playerMaxHP()*.5));
 hpBar.style.width=(hp/playerMaxHP()*100)+'%';
 hideDeathScreen();setAnimation('idle',true);save(false);
 toast('❤️‍🔥 Wolfheart Elixir consumed — revived with 50% HP!');
}
function jump(){
 if(dead||locked)return;
 locked=true;setAnimation('jump',true);
 clearTimeout(window._jumpUnlockTimer);
 window._jumpUnlockTimer=setTimeout(()=>{if(!dead){locked=false;setAnimation('idle',true)}},460);
}
function loop(now){
 requestAnimationFrame(loop);
 let dx=(isDown('ArrowRight','KeyD','d','D')?1:0)-(isDown('ArrowLeft','KeyA','a','A')?1:0);
 let dy=(isDown('ArrowDown','KeyS','s','S')?1:0)-(isDown('ArrowUp','KeyW','w','W')?1:0);
 const keyboardMoving=dx!==0||dy!==0;
 if(keyboardMoving&&fishing)stopFishing('You move away from the fishing spot.');
 if(keyboardMoving)moveTarget=null;
 if(keyboardMoving)tutorialProgress('move');
 let moving=keyboardMoving,run=isDown('ShiftLeft','ShiftRight');
 if(!moving&&moveTarget&&!dead&&!locked){
   const tx=moveTarget.x-pos.x,ty=moveTarget.y-pos.y,dist=Math.hypot(tx,ty);
   if(dist<=8){moveTarget=null;}
   else{dx=tx/dist;dy=ty/dist;moving=true;run=dist>260;}
 }
 if(!dead){
   if(moving){
     // Directional input always cancels stale action locks.
     locked=false;mining=false;chopping=false;fishing=false;
     if(chopBox)chopBox.style.display='none';

     if(Math.abs(dx)>Math.abs(dy)){facing=dx<0?-1:1;facingDir=dx<0?'left':'right'}else if(dy){facingDir=dy<0?'up':'down'}
     const m=Math.hypot(dx,dy)||1;
     const sp=(run?6.2:speed)*(1+getMoveSpeedBonus()/100);
     const nx=pos.x+(dx/m)*sp;
     const ny=pos.y+(dy/m)*sp;
     const ox=pos.x,oy=pos.y;
     if(!blocked(nx,pos.y))pos.x=nx;
     if(!blocked(pos.x,ny))pos.y=ny;
     if(moveTarget&&Math.abs(pos.x-ox)<0.01&&Math.abs(pos.y-oy)<0.01){moveTarget=null;toast('That path is blocked.');}
     setAnimation(run?'run':'walk');
   }else if(isDown('KeyQ')){
     moveTarget=null;
     setAnimation('defend');
   }else{
     // v8.61: when there is no movement input/target, explicitly return to idle.
     // Clear stale movement/action state but preserve real gathering actions.
     if(!mining&&!chopping&&!fishing){
       moveTarget=null;
       locked=false;
       if(state!=='idle')setAnimation('idle',true);
       else setAnimation('idle');
       frame=0;
     }
   }
 }
 pos.x=Math.max(30,Math.min(W-30,pos.x));pos.y=Math.max(35,Math.min(H-35,pos.y));
 playerWrap.classList.toggle('toolActive',mining||chopping);
 try{camera()}catch(e){console.error('camera update',e)}
 try{animate(now)}catch(e){console.error('player animation',e)}
 try{updateEquipmentVisual()}catch(e){console.error('equipment visual',e)}
 try{updateGoblins(now)}catch(e){console.error('enemy update',e)}
}
function toast(t){toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(window.t);window.t=setTimeout(()=>toastEl.classList.remove('show'),2700)}
function treeCenter(el){
 const x=parseFloat(el.style.left)+(el.offsetWidth||parseFloat(el.style.width)||80)/2;
 const y=parseFloat(el.style.top)+(el.offsetHeight||100)*0.72;
 return {x,y};
}
function nearestTree(max=125){
 let best=null,bd=max;
 document.querySelectorAll('.tree.choppable').forEach(t=>{
   if(t.dataset.depleted==='1')return;
   const c=treeCenter(t),d=Math.hypot(pos.x-c.x,pos.y-c.y);
   if(d<bd){bd=d;best=t}
 });
 return best;
}
function gainWoodcuttingXP(amount){
 woodcuttingXP+=amount;
 while(woodcuttingXP>=woodcuttingNext){
   woodcuttingXP-=woodcuttingNext;woodcuttingLevel++;woodcuttingNext=Math.floor(woodcuttingNext*1.24);
   showLevelUpCelebration('Woodcutting',woodcuttingLevel,'🪓');
 }
}
function markTreeDepleted(tree,until=Date.now()+TREE_RESPAWN_MS){
 const id=tree.dataset.treeId;
 tree.dataset.depleted='1';tree.classList.remove('chopping');
 tree.dataset.originalSrc=tree.dataset.originalSrc||tree.getAttribute('src');
 tree.setAttribute('src','assets/embedded/asset_0056_b2b2f6e51e6fae3e.png');
 tree.style.width='52px';tree.style.marginLeft='24px';tree.style.marginTop='55px';
 depletedTrees[id]=until;
 const wait=Math.max(0,until-Date.now());
 setTimeout(()=>regrowTree(tree),wait);
}
function regrowTree(tree){
 const id=tree.dataset.treeId;
 if(!tree||!tree.isConnected)return;
 tree.dataset.depleted='0';
 tree.setAttribute('src',tree.dataset.originalSrc);
 tree.style.width=tree.dataset.originalWidth;tree.style.marginLeft='0px';tree.style.marginTop='0px';
 delete depletedTrees[id];save(false);
}
function completeChop(tree){
 chopping=false;locked=false;clearInterval(chopTimer);chopTimer=null;
 chopBox.style.display='none';chopFill.style.width='0%';
 tree.classList.remove('chopping');
 addItem('oak_log',1);gainWoodcuttingXP(15);gainXP(3);tutorialProgress('woodcut');
 showLootPopup('+1 Oak Log  +15 WC XP',parseFloat(tree.style.left),parseFloat(tree.style.top));
 markTreeDepleted(tree);save(false);toast('🪵 You chopped an Oak Tree.');setAnimation('idle',true);
}
function startChopping(tree){
 if(chopping||dead)return;
 if(!tree){toast('Move closer to an Oak Tree.');return}
 chopping=true;locked=true;chopTarget=tree;tree.classList.add('chopping');
 chopBox.style.display='block';chopFill.style.width='0%';chopText.textContent='0%';
 const duration=Math.max(1150,2300-(woodcuttingLevel-1)*35),started=performance.now();
 setAnimation('attack1',true);
 chopTimer=setInterval(()=>{
   const pct=Math.min(100,Math.floor((performance.now()-started)/duration*100));
   chopFill.style.width=pct+'%';chopText.textContent=pct+'%';
   if(pct>=100)completeChop(tree);
   else if(!locked)setAnimation('attack1',true);
 },80);
}
function setupWoodcutting(){
 let i=0;
 document.querySelectorAll('img.tree').forEach(t=>{
   const src=t.getAttribute('src')||'';
   if(!/tree_(large|small)\.png$/.test(src))return;
   t.classList.add('choppable');t.dataset.treeId='oak-'+(++i);t.dataset.originalSrc=src;t.dataset.originalWidth=t.style.width||'90px';t.dataset.depleted='0';
   t.title='Oak Tree — press Interact to chop';
   t.addEventListener('click',()=>{const c=treeCenter(t);if(Math.hypot(pos.x-c.x,pos.y-c.y)<=135)startChopping(t);else toast('Move closer to the Oak Tree.')});
 });
 Object.entries(depletedTrees).forEach(([id,until])=>{const t=document.querySelector(`[data-tree-id="${id}"]`);if(t&&until>Date.now())markTreeDepleted(t,until)});
}
function todayKey(){return new Date().toISOString().slice(0,10)}
function normalizeDailyQuestState(){
 if(!dailyQuestState||typeof dailyQuestState!=='object')dailyQuestState={};
 dailyQuestState.accepted=dailyQuestState.accepted||{};
 dailyQuestState.claimed=dailyQuestState.claimed||{};
 dailyQuestState.explored=dailyQuestState.explored||{};
 // Migrate saves from the old state model. "completed" used to mean two different things.
 if(dailyQuestState.completed&&typeof dailyQuestState.completed==='object'){
   if(dailyQuestState.completed.logs)dailyQuestState.claimed.logs=true;
   if(dailyQuestState.completed.goblins)dailyQuestState.claimed.goblins=true;
   if(dailyQuestState.completed.explore)dailyQuestState.explored.explore=true;
 }
 dailyQuestState.completed={};
}
function refreshDailyQuests(){
 const today=todayKey();
 normalizeDailyQuestState();
 if(dailyQuestState.date!==today) dailyQuestState={date:today,accepted:{},completed:{},claimed:{},explored:{}};
}
function dailyProgress(q){
 if(q.id==='logs')return Math.min(10,inventoryData.oak_log||0);
 if(q.id==='goblins')return Math.min(5,goblinKills||0);
 if(q.id==='explore')return dailyQuestState.explored.explore?1:0;
 return 0;
}
function dailyGoal(q){return q.id==='logs'?10:q.id==='goblins'?5:1}
function claimDaily(q){
 if(!q)return;
 refreshDailyQuests();
 const progress=dailyProgress(q),goal=dailyGoal(q);
 if(dailyQuestState.claimed[q.id]){toast('Reward already claimed today.');return}
 if(progress<goal){toast('Quest is not finished yet.');return}
 if(q.id==='logs'&&!removeItem('oak_log',10)){toast('You need 10 Oak Logs in your backpack.');return}
 dailyQuestState.claimed[q.id]=true;
 addItem('gold',q.id==='goblins'?220:q.id==='logs'?150:100);
 gainXP(q.id==='goblins'?75:q.id==='logs'?50:40);
 save(false);renderNoticeBoard();toast('✅ Reward claimed!');
}
function renderNoticeBoard(){
 refreshDailyQuests();
 panel.dataset.type='notice';panel.style.display='block';panel.classList.remove('inventoryPanel','bankPanel','mapPanel');
 panel.innerHTML='<h2>📜 Oakhaven Notice Board</h2><p>Fresh notices every day. Starter supplies remain available in town.</p>'+DAILY_QUESTS.map(q=>{
  const progress=dailyProgress(q),goal=dailyGoal(q),claimed=!!dailyQuestState.claimed[q.id],ready=progress>=goal;
  const label=claimed?'Completed':ready?'Claim Reward':'In Progress';
  return `<div class="dailyQuest ${claimed?'done':ready?'ready':''}"><h3>${q.title}</h3><p>${q.text} — <b>${progress}/${goal}</b></p><p>Reward: ${q.reward}</p><button type="button" class="btn" data-claim="${q.id}" ${claimed||!ready?'disabled':''}>${label}</button></div>`;
 }).join('');
 panel.querySelectorAll('[data-claim]').forEach(b=>b.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();
   claimDaily(DAILY_QUESTS.find(q=>q.id===b.dataset.claim));
 }));
}
function objectCenter(el){return {x:parseFloat(el.style.left)+(el.offsetWidth||100)/2,y:parseFloat(el.style.top)+(el.offsetHeight||100)*.75}}
function nearObject(el,max=145){const c=objectCenter(el);return Math.hypot(pos.x-c.x,pos.y-c.y)<=max}

function switchArea(area,spawn,announce=true){
  if(area===currentArea)return;
  if(currentArea==='town')townPosition={x:pos.x,y:pos.y};

  currentArea=area;
  skyMode=false;
  const sb=document.getElementById('skyView');
  if(sb) sb.textContent=area==='mine'?'🐍 Sky View':area==='forest'?'🌲 Sky View':area==='shop'?'🏪 Room View':'🐺 Sky View';

  townWorld.style.display='none';
  forestWorld.classList.remove('active');
  shopWorld.classList.remove('active');
  mineWorld.classList.remove('active');
  if(chieftainDungeonWorld)chieftainDungeonWorld.classList.remove('active');
  document.body.classList.remove('mineMode','forestMode','shopMode');

  if(area==='shop'){
    world=shopWorld;W=1000;H=700;collision=shopCollision.map(r=>[...r]);
    shopWorld.classList.add('active');document.body.classList.add('shopMode');
    shopWorld.appendChild(playerWrap);
    pos={x:500,y:525};
    dead=false;locked=false;moveTarget=null;
    mining=false;chopping=false;fishing=false;
    Object.keys(keys).forEach(k=>keys[k]=false);
    setAnimation('idle',true);
    document.querySelector('#title strong').textContent='GENERAL STORE';
    document.querySelector('#title small').textContent='Oakhaven Interior · v7.6';
    if(announce)toast('🏪 Entering Oakhaven General Store...');
  }else if(area==='chieftainDungeon'){
    world=chieftainDungeonWorld;W=1200;H=800;collision=[];
    chieftainDungeonWorld.classList.add('active');
    chieftainDungeonWorld.appendChild(playerWrap);pos={...(spawn||CHIEFTAIN_DUNGEON_SPAWN)};
    document.querySelector('#title strong').textContent="CHIEFTAIN'S DEN";
    document.querySelector('#title small').textContent='Westwood Boss Dungeon';
    if(announce)toast("👑 Entering the Goblin Chieftain's Den...");
  }else if(area==='mine'){
    world=mineWorld;W=2000;H=1400;collision=mineCollision.map(r=>[...r]);
    mineWorld.classList.add('active');document.body.classList.add('mineMode');
    document.getElementById('editorPanel')?.classList.remove('open');
    document.getElementById('townEditPanel')?.classList.remove('open');
    document.body.classList.remove('editorOpen','townEditing');
    mineWorld.appendChild(playerWrap);pos={...(spawn||MINE_SPAWN)};
    if(!mineWalkable(pos.x,pos.y))pos={...MINE_SPAWN};
    document.querySelector('#title strong').textContent='BRIMVAULT MINE';
    document.querySelector('#title small').textContent="Valvondor v7.49 · Reference Forest Rebuild";
    if(announce)toast('⛏️ Entering Brimvault Mine...');
  }else if(area==='forest'){
    world=forestWorld;W=2200;H=1500;collision=forestCollision.map(r=>[...r]);
    forestWorld.classList.add('active');document.body.classList.add('forestMode');
    forestWorld.appendChild(playerWrap);pos={...(spawn||FOREST_SPAWN)};
    document.querySelector('#title strong').textContent='WESTWOOD FOREST';
    document.querySelector('#title small').textContent="Valvondor v7.49 · Reference Forest Rebuild";
    if(announce)toast('🌲 Entering Westwood Forest...');
  }else{
    world=townWorld;W=4700;H=2100;collision=townCollision.map(r=>[...r]);
    townWorld.style.display='block';
    townWorld.appendChild(playerWrap);pos={...(spawn||SAFE_SPAWN)};
    document.querySelector('#title strong').textContent='OAKHAVEN';
    document.querySelector('#title small').textContent="Valvondor v7.49 · Reference Forest Rebuild";
    if(announce)toast('🏘️ Returned to Oakhaven.');
  }

  moveTarget=null;locked=false;mining=false;chopping=false;fishing=false;
  panel.style.display='none';Object.keys(keys).forEach(k=>keys[k]=false);camera();
}
function nearestOre(max=135){
 if(currentArea!=='mine')return null;let best=null,bd=max;
 document.querySelectorAll('.oreVein:not(.depleted)').forEach(el=>{const c=objectCenter(el),d=Math.hypot(pos.x-c.x,pos.y-c.y);if(d<bd){bd=d;best=el}});return best;
}
function gainMiningXP(amount){
 miningXP+=amount;while(miningXP>=miningNext){miningXP-=miningNext;miningLevel++;miningNext=Math.floor(miningNext*1.27);showLevelUpCelebration('Mining',miningLevel,'⛏️')}
}
function mineOre(el){
 if(mining||!el)return;const type=el.dataset.ore||'copper';const req={copper:1,iron:5,coal:10}[type]||1;
 if(miningLevel<req){toast('Mining level '+req+' required.');return}
 mining=true;locked=true;setAnimation('attack1',true);chopBox.style.display='block';chopBox.querySelector('b').textContent='⛏️ Mining '+type[0].toUpperCase()+type.slice(1);
 const pickaxeSpeed=(inventoryData.copper_pickaxe||0)>0?.72:1;
 const duration=({copper:1400,iron:1900,coal:2200}[type]||1500)*pickaxeSpeed,start=performance.now();
 const tick=()=>{const p=Math.min(1,(performance.now()-start)/duration);chopFill.style.width=(p*100)+'%';chopText.textContent=Math.floor(p*100)+'%';if(p<1){requestAnimationFrame(tick);return}
   mining=false;locked=false;chopBox.style.display='none';chopFill.style.width='0%';el.classList.add('depleted');
   const id=type+'_ore',xp={copper:18,iron:30,coal:40}[type]||15;addItem(id,1);gainMiningXP(xp);gainXP(3);tutorialProgress('mine');toast('⛏️ +1 '+ITEM_DB[id].name+' · +'+xp+' Mining XP');save(false);
   setTimeout(()=>{el.classList.remove('depleted'); if(currentArea==='mine') toast('⛏️ A '+type+' vein has respawned.');},7000+Math.random()*3000);
 };
 requestAnimationFrame(tick);
}

function gainFishingXP(amount){
 fishingXP+=amount;
 while(fishingXP>=fishingNext){fishingXP-=fishingNext;fishingLevel++;fishingNext=Math.floor(fishingNext*1.25);showLevelUpCelebration('Fishing',fishingLevel,'🎣')}
}
function nearestFishingSpot(max=165){
 if(currentArea!=='town'&&currentArea!=='forest')return null;let best=null,bd=max;
 document.querySelectorAll('.fishingSpot:not(.cooldown)').forEach(el=>{const c=objectCenter(el),d=Math.hypot(pos.x-c.x,pos.y-c.y);if(d<bd){bd=d;best=el}});return best;
}
function showFishingCatch(itemId,xp){
 const item=ITEM_DB[itemId]||{name:String(itemId||'a fish')};
 const card=document.createElement('div');card.className='fishingCatchCard';card.textContent=`🎣 You caught ${item.name}!  +${xp} Fishing XP`;document.body.appendChild(card);setTimeout(()=>card.remove(),1450);
}
function chooseFish(spot=null){
 const tier=Number(spot?.dataset?.tier||0);
 let unlocked=[];
 if(tier===15){
   unlocked=[['trout',26,42],['bluegill',34,43],['salmon',42,15]];
 }else if(tier===25){
   unlocked=[['bluegill',36,22],['salmon',48,58],['catfish',60,20]];
 }else{
   if(fishingLevel>=1)unlocked.push(['minnow',16,60]);
   if(fishingLevel>=5)unlocked.push(['trout',22,28]);
   if(fishingLevel>=10)unlocked.push(['bluegill',28,20]);
   if(fishingLevel>=20)unlocked.push(['salmon',36,14]);
   if(fishingLevel>=30)unlocked.push(['catfish',46,8]);
   if(fishingLevel>=40)unlocked.push(['golden_carp',65,3]);
 }
 let roll=Math.random()*unlocked.reduce((n,f)=>n+f[2],0);
 for(const fish of unlocked){roll-=fish[2];if(roll<=0)return [fish[0],fish[1]]}
 return unlocked[0]?[unlocked[0][0],unlocked[0][1]]:['minnow',16];
}
let fishingSession=0,fishingCastEl=null,fishingAttemptsLeft=0;
function fishingCatchChance(){return Math.min(.94,.58+(fishingLevel-1)*.022)}
function stopFishing(message='You stop fishing.'){
 if(!fishing)return;
 fishingSession++;fishing=false;locked=false;fishingTarget=null;fishingAttemptsLeft=0;
 chopBox.style.display='none';chopFill.style.width='0%';chopText.textContent='0%';
 if(fishingCastEl){fishingCastEl.remove();fishingCastEl=null}
 setAnimation('idle',true);
 if(message)toast('🎣 '+message);
}
function finishFishingSpot(spot){
 const session=fishingSession;
 stopFishing('The fishing spot has gone quiet.');
 spot.classList.add('cooldown');
 setTimeout(()=>{spot.classList.remove('cooldown');if(session<=fishingSession&&(currentArea==='town'||currentArea==='forest'))toast('🎣 Fish are gathering at the ripples again.');},5000+Math.random()*3500);
}
function runFishingAttempt(spot,session){
 if(!fishing||session!==fishingSession||spot.classList.contains('cooldown'))return;
 if(!(inventoryData.fishing_rod>0)){stopFishing('You need a fishing rod.');return}
 const duration=Math.max(1200,2350-(fishingLevel-1)*38),started=performance.now();
 chopBox.querySelector('b').textContent=`🎣 ${spot.dataset.tier?'Westwood Lv. '+spot.dataset.tier:'Fishing Silverwater'} · ${Math.round(fishingCatchChance()*100)}% catch chance`;
 chopFill.style.width='0%';chopText.textContent='0%';
 const tick=()=>{
   if(!fishing||session!==fishingSession)return;
   const p=Math.min(1,(performance.now()-started)/duration);chopFill.style.width=(p*100)+'%';chopText.textContent=Math.floor(p*100)+'%';
   if(p<1){requestAnimationFrame(tick);return}
   fishingAttemptsLeft--;
   try{
     if(Math.random()<fishingCatchChance()){
       const [itemId,xp]=chooseFish(spot);
       if(itemId&&ITEM_DB[itemId]){
         addItem(itemId,1);
         gainFishingXP(xp);
         gainXP(2);
         try{tutorialProgress('fish')}catch(e){console.warn('Fishing tutorial progress error:',e)}
         try{showFishingCatch(itemId,xp)}catch(e){toast('🎣 You caught '+(ITEM_DB[itemId]?.name||itemId)+'!')}
         try{save(false)}catch(e){console.warn('Fishing save error:',e)}
       }else{
         console.warn('Invalid fishing reward:',itemId);
         toast('🎣 The fish slipped away.');
       }
     }else{
       toast('🎣 The fish got away.');
     }
   }catch(e){
     console.error('Fishing attempt resolution error:',e);
     toast('🎣 Fishing continues...');
   }
   if(!fishing||session!==fishingSession)return;
   if(fishingAttemptsLeft<=0){finishFishingSpot(spot);return}
   chopFill.style.width='0%';chopText.textContent='0%';
   setTimeout(()=>{if(fishing&&session===fishingSession)runFishingAttempt(spot,session)},400);
 };
 requestAnimationFrame(tick);
}
function startFishing(spot){
 if(fishing){stopFishing();return}
 if(locked||dead)return;
 if(!spot){toast('Move closer to a fishing ripple.');return}
 const minLevel=Number(spot.dataset.minLevel||1);
 if(fishingLevel<minLevel){toast('🎣 You need Fishing level '+minLevel+' for this spot.');return}
 if(!(inventoryData.fishing_rod>0)){toast('You need a fishing rod. The Silverwater Fisher can give you one.');return}
 fishing=true;locked=true;fishingTarget=spot;fishingAttemptsLeft=8+Math.floor(Math.random()*7);fishingSession++;
 const session=fishingSession;
 moveTarget=null;setAnimation('idle',true);
 chopBox.style.display='block';chopBox.querySelector('b').textContent=spot.dataset.tier?('🎣 Westwood Fishing · Lv. '+spot.dataset.tier):'🎣 Fishing Silverwater';chopFill.style.width='0%';chopText.textContent='0%';
 const c=objectCenter(spot);fishingCastEl=document.createElement('div');fishingCastEl.className='fishingCast';fishingCastEl.style.left=(c.x-4)+'px';fishingCastEl.style.top=(c.y-4)+'px';(currentArea==='forest'?forestWorld:townWorld).appendChild(fishingCastEl);
 toast('🎣 Auto-fishing started. Move, attack, or press Interact to stop.');
 runFishingAttempt(spot,session);
}
function setupFishing(){
 document.querySelectorAll('.fishingSpot').forEach(spot=>spot.addEventListener('click',()=>{if(fishing){stopFishing();return}if(nearObject(spot,180))startFishing(spot);else toast('Move closer to the fishing spot.')}));
}

function interactLandmark(){
 const storeDoor=document.getElementById('shopDoor');
 if(currentArea==='town'&&storeDoor&&(nearObject(storeDoor,240)||inShopEntranceZone())){switchArea('shop',SHOP_SPAWN);return true}
 const storeExit=document.getElementById('shopExit');
 if(currentArea==='shop'){
   const inStoreExit=(pos.y>565&&pos.x>360&&pos.x<640);
   if((storeExit&&nearObject(storeExit,220))||inStoreExit){switchArea('town',SHOP_RETURN);return true}
 }
 const forestSign=document.getElementById('westwoodEntrance');
 if(currentArea==='town'&&forestSign&&nearObject(forestSign,210)){switchArea('forest',FOREST_SPAWN);return true}
 const bossEntrance=document.getElementById('chieftainDungeonEntrance');
 if(currentArea==='forest'&&bossEntrance&&nearObject(bossEntrance,240)){switchArea('chieftainDungeon',CHIEFTAIN_DUNGEON_SPAWN);return true}
 const bossExit=document.getElementById('chieftainDungeonExit');
 if(currentArea==='chieftainDungeon'&&bossExit){switchArea('forest',CHIEFTAIN_DUNGEON_RETURN);return true}
 const forestExit=document.getElementById('forestExit');
 if(currentArea==='forest'){
   const inForestExit=(pos.y>1170&&pos.x>850&&pos.x<1350);
   if((forestExit&&nearObject(forestExit,260))||inForestExit){switchArea('town',FOREST_RETURN);return true}
 }
 const board=document.getElementById('noticeBoard');
 if(board&&nearObject(board,160)){renderNoticeBoard();return true}
 const idol=currentArea==='forest'?document.getElementById('forestWolfIdol'):document.getElementById('wolfIdol');
 if(idol&&nearObject(idol,165)){
  refreshDailyQuests();dailyQuestState.explored.explore=true;save(false);
  toast('🐺 The Pack is strongest when it stands together.');return true
 }
 const mine=document.getElementById('mineEntrance');
 if(currentArea==='town'&&mine&&nearObject(mine,190)){switchArea('mine',MINE_SPAWN);return true}
 const exit=document.getElementById('mineExit');
 if(currentArea==='mine'){
   const inExitZone=(pos.y>1050 && pos.x>760 && pos.x<1240);
   if((exit&&nearObject(exit,360))||inExitZone){switchArea('town',MINE_RETURN);return true}
 }
 const ore=nearestOre();if(ore){mineOre(ore);return true}
 const farm=document.getElementById('farmHouse');
 if(farm&&nearObject(farm,190)){toast('🌾 Oakhaven Farms: farming plots are ready for the next skill update.');return true}
 const fishSpot=nearestFishingSpot();if(fishSpot){startFishing(fishSpot);return true}
 const dock=document.getElementById('fishingDock');
 if(dock&&nearObject(dock,240)){
   let closest=null,bd=9999;document.querySelectorAll('.fishingSpot:not(.cooldown)').forEach(el=>{const c=objectCenter(el),d=Math.hypot(pos.x-c.x,pos.y-c.y);if(d<bd){bd=d;closest=el}});
   if(closest){startFishing(closest);return true}
   toast('🎣 The nearby fish are hiding. Wait a few seconds for the ripples to return.');return true
 }
 return false
}

function smithQuestReady(){return (inventoryData.copper_ore||0)>=10}
function forgeStockHtml(){
 const ids=['copper_ore','iron_ore','coal_ore','copper_bar','iron_bar','silver_bar','gold_bar'];
 return ids.map(id=>`<span class="forgeBadge">${ITEM_DB[id].icon} ${ITEM_DB[id].name}: ${inventoryData[id]||0}</span>`).join('');
}
const SMELT_RECIPES=[
 {out:'copper_bar',amount:1,needs:{copper_ore:2,coal_ore:1}},
 {out:'iron_bar',amount:1,needs:{iron_ore:2,coal_ore:2}},
 {out:'silver_bar',amount:1,needs:{silver_ore:2,coal_ore:2}},
 {out:'gold_bar',amount:1,needs:{gold_ore:2,coal_ore:3}}
];
const CRAFT_RECIPES=[
 {out:'copper_pickaxe',needs:{copper_bar:5,oak_log:2}},
 {out:'copper_axe',needs:{copper_bar:4,oak_log:2}},
 {out:'copper_sword',needs:{copper_bar:6,oak_log:1}},
 {out:'iron_pickaxe',needs:{iron_bar:5,oak_log:2},level:5},
 {out:'iron_axe',needs:{iron_bar:4,oak_log:2},level:5},
 {out:'iron_sword',needs:{iron_bar:6,oak_log:1},level:5}
];
function needsText(needs){return Object.entries(needs).map(([id,n])=>`${n} ${ITEM_DB[id].name}`).join(' + ')}
function canPay(needs){return Object.entries(needs).every(([id,n])=>(inventoryData[id]||0)>=n)}
function payNeeds(needs){Object.entries(needs).forEach(([id,n])=>removeItem(id,n))}
function smeltRecipe(index){
 const r=SMELT_RECIPES[index];if(!r)return;
 if(!canPay(r.needs)){toast('You do not have the required ore and coal.');return}
 payNeeds(r.needs);addItem(r.out,r.amount);gainXP(4);save(false);renderForge('smelt');toast('🔥 Smelted '+ITEM_DB[r.out].name+'.');
}
function craftRecipe(index){
 const r=CRAFT_RECIPES[index];if(!r)return;
 if(r.level&&miningLevel<r.level){toast('Mining level '+r.level+' required.');return}
 if(!canPay(r.needs)){toast('You do not have the required materials.');return}
 payNeeds(r.needs);addItem(r.out,1);gainXP(8);save(false);renderForge('craft');toast('⚒️ Crafted '+ITEM_DB[r.out].name+'.');
}
function startSmithQuest(){smithQuest.status='started';save(false);renderForge('quest');toast("Quest started: A Miner’s Beginning");}
function completeSmithQuest(){
 if(smithQuest.status!=='started'){toast('Speak with Bram first.');return}
 if(!smithQuestReady()){toast('You still need '+(10-(inventoryData.copper_ore||0))+' Copper Ore.');return}
 removeItem('copper_ore',10);addItem('gold',100);addItem('copper_pickaxe',1);gainMiningXP(250);gainXP(50);smithQuest.status='completed';save(false);renderForge('quest');toast('Quest complete! Copper Pickaxe, 100 Gold, +250 Mining XP.');
}
function renderForge(tab=forgeTab){
 forgeTab=tab;panel.dataset.type='forge';panel.style.display='block';panel.classList.remove('inventoryPanel','bankPanel');panel.classList.add('forgePanel');
 let content='';
 if(tab==='quest'){
   const status=smithQuest.status;
   const progress=Math.min(10,inventoryData.copper_ore||0);
   content=`<div class="forgeQuest"><h3>📜 A Miner’s Beginning</h3>
   <p><b>Bram Coalwright:</b> “Brimvault still has copper if you’ve got the nerve to dig it out. Bring me 10 Copper Ore, and I’ll forge you a proper pick.”</p>
   <p>Objective: Mine 10 Copper Ore — <b>${progress}/10</b></p>
   <p>Reward: ⛏️ Copper Pickaxe · 🪙 100 Gold · ⭐ 250 Mining XP</p>
   ${status==='not_started'?'<button class="btn" id="startSmithQuest">Accept Quest</button>':status==='started'?`<button class="btn" id="completeSmithQuest" ${smithQuestReady()?'':'disabled'}>Turn In Ore</button>`:'<button class="btn" disabled>Quest Completed</button>'}</div>`;
 } else if(tab==='smelt'){
   content='<div class="recipeGrid">'+SMELT_RECIPES.map((r,i)=>`<div class="recipeCard"><h3>${ITEM_DB[r.out].icon} ${ITEM_DB[r.out].name}</h3><p>${needsText(r.needs)}</p><button class="btn" data-smelt="${i}">Smelt</button></div>`).join('')+'</div>';
 } else {
   content='<div class="recipeGrid">'+CRAFT_RECIPES.map((r,i)=>`<div class="recipeCard ${r.level&&miningLevel<r.level?'locked':''}"><h3>${ITEM_DB[r.out].icon} ${ITEM_DB[r.out].name}</h3><p>${needsText(r.needs)}</p>${r.level?`<p>Requires Mining ${r.level}</p>`:''}<button class="btn" data-craft="${i}">Craft</button></div>`).join('')+'</div>';
 }
 panel.innerHTML=`<div class="forgeHeader"><div><h2>⚒️ Bram Coalwright</h2><small>Master Blacksmith of Oakhaven</small></div></div><div class="forgeStock">${forgeStockHtml()}</div><div class="forgeTabs"><button class="forgeTab ${tab==='quest'?'active':''}" data-forge-tab="quest">Quest</button><button class="forgeTab ${tab==='smelt'?'active':''}" data-forge-tab="smelt">Smelt</button><button class="forgeTab ${tab==='craft'?'active':''}" data-forge-tab="craft">Craft</button></div>${content}`;
 panel.querySelectorAll('[data-forge-tab]').forEach(b=>b.onclick=()=>renderForge(b.dataset.forgeTab));
 panel.querySelectorAll('[data-smelt]').forEach(b=>b.onclick=()=>smeltRecipe(Number(b.dataset.smelt)));
 panel.querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>craftRecipe(Number(b.dataset.craft)));
 const start=document.getElementById('startSmithQuest');if(start)start.onclick=startSmithQuest;
 const finish=document.getElementById('completeSmithQuest');if(finish)finish.onclick=completeSmithQuest;
}
function openBlacksmith(){renderForge(smithQuest.status==='not_started'?'quest':forgeTab)}

function nearest(max=120){
 if(!['town','shop','forest'].includes(currentArea))return null;
 let best=null,bd=Infinity;
 document.querySelectorAll('.npc').forEach(n=>{
   const inShop=!!n.closest('#shopWorld');
   const inForest=!!n.closest('#forestWorld');
   if(currentArea==='shop'&&!inShop)return;
   if(currentArea==='forest'&&!inForest)return;
   if(currentArea==='town'&&(inShop||inForest))return;
   let x=parseFloat(n.style.left)+35,y=parseFloat(n.style.top)+65;
   if(n.dataset.id==='boar_hunter'){x=parseFloat(n.style.left)+55;y=parseFloat(n.style.top)+78;}
   if(currentArea==='shop'&&n.dataset.id==='merchant'){x=500;y=300;}
   const d=Math.hypot(pos.x-x,pos.y-y);
   const reach=(currentArea==='shop'&&n.dataset.id==='merchant')?360:max;
   if(d<=reach&&d<bd){bd=d;best=n}
 });
 return best
}
function updateQuest(){document.getElementById('questText').textContent=quest===0?'Talk to the Innkeeper — 0/1':quest===1?'Talk to the Blacksmith — 0/1':'Explore Oakhaven — 2/2'}
function interact(){
 tutorialProgress('interact');
 if(fishing){stopFishing();return}
 if(chopping)return;
 if(directKaelInteract())return;
 if(tryKaelInteract())return;
 if(interactLandmark())return;
 if(currentArea==='shop' && pos.y<560){openShop();return;}
 const tree=nearestTree();if(tree){startChopping(tree);return}
 let n=nearest();if(!n){toast(currentArea==='mine'?'Move closer to an ore vein or the mine exit.':currentArea==='forest'?'Move closer to Kael, a tree, goblin, Wolf Idol, or forest exit.':currentArea==='shop'?'Move closer to the shopkeeper or the exit.':'Move closer to an NPC, tree, fishing ripple, notice board, or landmark.');return}
 toast(n.dataset.talk);
 if(n.dataset.id==='banker'){openBank();return}
 if(n.dataset.id==='merchant'){openShop();return}
 if(n.dataset.id==='boar_hunter'){talkBoarHunter();return}
 if(n.dataset.id==='fisher'){if(!(inventoryData.fishing_rod>0)){addItem('fishing_rod',1);save(false);toast('🎣 The Fisher gives you a Silverwater Fishing Rod. Equip it from your Tool tab.');}else toast('Cast into the glowing ripples beside the dock.');return}
 if(n.dataset.id==='innkeeper'&&quest===0){quest=1;addItem('bread',1);addItem('gold',10);updateQuest();save(false);setTimeout(()=>toast('Quest updated: Talk to Bram Coalwright.'),1000);return}
 if(n.dataset.id==='blacksmith'){
   if(quest===1){quest=2;addItem('training_sword',1);updateQuest();save(false);toast('Bram gives you a training sword.');}
   openBlacksmith();return;
 }
}
function save(show=true){
  // Never move the live player during an autosave. Use a fallback only for corrupted coordinates.
  const savedPos=(currentArea==='mine'||currentArea==='shop')?{...(currentArea==='shop'?SHOP_RETURN:MINE_RETURN)}:(isSafeSpawn(pos.x,pos.y)?{x:pos.x,y:pos.y}:{...SAFE_SPAWN});
  localStorage.setItem('oakhaven-goblin-forest-v2',JSON.stringify({pos:savedPos,quest,inventory,hp,inventoryData,equipment,bankData,playerXP,playerLevel,xpToNext,woodcuttingLevel,woodcuttingXP,woodcuttingNext,depletedTrees,dailyQuestState,miningLevel,miningXP,miningNext,fishingLevel,fishingXP,fishingNext,smithQuest,boarQuestState,characterData,tutorialState,currentArea,mapVersion:MAP_VERSION}));
  if(show)toast('Game saved.');
}
function load(){
  let recovered=false;
  try{
    const s=JSON.parse(localStorage.getItem('oakhaven-goblin-forest-v2'));
    if(s){
      if(s.mapVersion!==MAP_VERSION){ pos={...SAFE_SPAWN}; recovered=true; }
      else if(s.pos && isSafeSpawn(Number(s.pos.x),Number(s.pos.y))){
        pos={x:Number(s.pos.x),y:Number(s.pos.y)};
      }else{
        pos={...SAFE_SPAWN};
        recovered=true;
      }
      quest=s.quest||0;
      inventory=Array.isArray(s.inventory)?s.inventory:inventory;if(s.inventoryData)inventoryData={...inventoryData,...s.inventoryData};inventoryData.goblin_fang_ring=Math.max(1,inventoryData.goblin_fang_ring||0);if(s.equipment)equipment={...equipment,...s.equipment};if(s.bankData){bankData={gold:Number(s.bankData.gold)||0,items:{...(s.bankData.items||{})}};}
      hp=Number.isFinite(s.hp)?Math.max(1,Math.min(playerMaxHP(),s.hp)):playerMaxHP();
      playerLevel=Number(s.playerLevel)||1;playerXP=Number(s.playerXP)||0;xpToNext=Number(s.xpToNext)||100;
      woodcuttingLevel=Number(s.woodcuttingLevel)||1;woodcuttingXP=Number(s.woodcuttingXP)||0;woodcuttingNext=Number(s.woodcuttingNext)||100;
      miningLevel=Number(s.miningLevel)||1;miningXP=Number(s.miningXP)||0;miningNext=Number(s.miningNext)||100;
      fishingLevel=Number(s.fishingLevel)||1;fishingXP=Number(s.fishingXP)||0;fishingNext=Number(s.fishingNext)||100;
      if(s.smithQuest&&typeof s.smithQuest==='object')smithQuest={...smithQuest,...s.smithQuest};
      if(s.tutorialState&&typeof s.tutorialState==='object')tutorialState={...tutorialState,...s.tutorialState};
      if(s.characterData&&typeof s.characterData==='object'){characterData={...characterData,...s.characterData};localStorage.setItem(CHARACTER_KEY,JSON.stringify(characterData));}
      if(s.depletedTrees&&typeof s.depletedTrees==='object')Object.assign(depletedTrees,s.depletedTrees);
      if(s.dailyQuestState&&typeof s.dailyQuestState==='object')dailyQuestState=s.dailyQuestState;
      if(s.boarQuestState&&typeof s.boarQuestState==='object')boarQuestState=Object.assign({accepted:false,kills:0,claimed:false},s.boarQuestState);
      refreshDailyQuests();updateBoarQuestMarker();
    }
  }catch(e){
    pos={...SAFE_SPAWN};
    recovered=true;
  }
  currentArea="town";
  world=townWorld;
  W=3600;
  H=2100;
  collision=townCollision.map(r=>[...r]);
  townWorld.style.display="block";
  forestWorld.classList.remove("active");
  shopWorld.classList.remove("active");
  mineWorld.classList.remove("active");
  document.body.classList.remove("mineMode","forestMode");

  // Hard movement recovery for v5.8.
  pos={...SAFE_SPAWN};
  townPosition={...SAFE_SPAWN};
  moveTarget=null;
  locked=false;
  dead=false;
  mining=false;
  chopping=false;
  fishing=false;
  Object.keys(keys).forEach(k=>keys[k]=false);
  recovered=true;

  hp=Math.max(1,hp||100);
  hpBar.style.width=hp+'%';
  updateQuest();
  if(recovered) setTimeout(()=>toast('Your character was moved to a safe spawn point.'),500);
}
addEventListener('keydown',e=>{
 if(document.getElementById('characterCreator').classList.contains('open')){if(e.code==='Enter'){e.preventDefault();saveCharacterFromCreator()}return}
 keys[e.code]=true;keys[e.key]=true;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
 if(e.repeat && ['Space','KeyE','KeyJ','KeyH','KeyK','KeyR','KeyT','KeyI'].includes(e.code))return;
 if(e.code==='Space')attack();
 if(e.code==='KeyE')interact();
 if(e.code==='KeyJ')jump();
 if(e.code==='KeyH')hurt();
 if(e.code==='KeyK'){hp=20;hurt()}
 if(e.code==='KeyR')revive();
 if(e.code==='KeyT'){
   if(currentArea==='mine')switchArea('town',SAFE_SPAWN);
   else if(currentArea==='shop')switchArea('town',SHOP_RETURN);
   else{
     pos={...SAFE_SPAWN};
     moveTarget=null;
     locked=false;
     dead=false;
     mining=false;
     chopping=false;
     fishing=false;
     Object.keys(keys).forEach(k=>keys[k]=false);
     toast('Movement reset at the safe town spawn.');
   }
 }
 if(e.code==='KeyI')showPanel('inventory');
 if(e.code==='KeyM')showPanel('map');
});
addEventListener('keyup',e=>{keys[e.code]=false;keys[e.key]=false});

document.getElementById('deathReviveBtn')?.addEventListener('click',()=>revive());
document.getElementById('deathOakhavenBtn')?.addEventListener('click',()=>{
 if(typeof window.__battleHardReturnToOakhaven==='function') window.__battleHardReturnToOakhaven();
 else returnToOakhavenAfterDeath();
});

// v8.82 defensive death-screen input fallback.
// Pointer/touch is handled directly so an old overlay can never trap this button.
const _deathOakBtn=document.getElementById('deathOakhavenBtn');
if(_deathOakBtn){
  const forceOakReturn=(e)=>{
    if(e){e.preventDefault();e.stopPropagation();}
    try{
      if(typeof window.__battleHardReturnToOakhaven==='function') window.__battleHardReturnToOakhaven();
      else{
        if(!dead) dead=true;
        returnToOakhavenAfterDeath();
      }
    }catch(err){console.error('death return fallback',err)}
  };
  _deathOakBtn.addEventListener('pointerup',forceOakReturn,true);
  _deathOakBtn.addEventListener('touchend',forceOakReturn,{capture:true,passive:false});
}

addEventListener('blur',()=>{Object.keys(keys).forEach(k=>keys[k]=false)});
const skyViewBtn=document.getElementById('skyView');
if(skyViewBtn) skyViewBtn.onclick=()=>{skyMode=!skyMode;skyViewBtn.textContent=skyMode?'🚶 Ground View':currentArea==='mine'?'🐍 Sky View':currentArea==='forest'?'🌲 Sky View':currentArea==='shop'?'🏪 Room View':'🐺 Sky View';toast(skyMode?(currentArea==='mine'?'🐍 Brimvault reveals the serpent.':currentArea==='forest'?'🌲 Westwood from above.':currentArea==='shop'?'🏪 Full store view.':'🐺 Oakhaven reveals the wolf.'):'Returned to ground view.');camera();};

document.addEventListener('visibilitychange',()=>{if(document.hidden)Object.keys(keys).forEach(k=>keys[k]=false)});
['up','down','left','right'].forEach(id=>{
 const k={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[id];
 const el=document.getElementById(id);
 const release=e=>{if(e)e.preventDefault();keys[k]=false};
 el.addEventListener('pointerdown',e=>{
   e.preventDefault();
   keys[k]=true;
   try{el.setPointerCapture(e.pointerId)}catch(_){}
 });
 el.addEventListener('pointerup',release);
 el.addEventListener('pointercancel',release);
 el.addEventListener('lostpointercapture',release);
});
const attackButton=document.getElementById('attack');
if(attackButton){
  attackButton.onclick=null;
  attackButton.addEventListener('pointerup',e=>{
    e.preventDefault();
    e.stopPropagation();
    attack();
  });
}
document.getElementById('interact').onclick=interact;
document.getElementById('save').onclick=()=>save();
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>showPanel(b.dataset.panel));

// Click/tap-to-move: tap open ground and the hero walks there.
view.addEventListener('pointerdown',e=>{
  if(e.button!==undefined&&e.button!==0)return;
  const target=e.target;
  if(target.closest('button,.panel,#hud,#questBox,#worldTime,#controls,#mobileControls,#toast,#chopBox,#characterCreator,.npc,.tree,.oreVein,.fishingSpot,#noticeBoard,#wolfIdol,#mineEntrance,#mineExit,#mineLeaveBtn,#shopDoor,#shopExit,[data-panel]'))return;
  if(document.getElementById('characterCreator').classList.contains('open'))return;
  const rect=view.getBoundingClientRect();
  const wx=(e.clientX-rect.left-cameraX)/cameraScale;
  const wy=(e.clientY-rect.top-cameraY)/cameraScale;
  if(fishing)stopFishing('You move away from the fishing spot.');
  const tx=Math.max(30,Math.min(W-30,wx));
  const ty=Math.max(35,Math.min(H-35,wy));
  if(blocked(tx,ty)){toast('You cannot walk there.');return;}
  moveTarget={x:tx,y:ty};
  e.preventDefault();
});

document.querySelectorAll('.npc').forEach(n=>{
  n.style.cursor='pointer';
  n.addEventListener('click',e=>{
    e.stopPropagation();
    const x=parseFloat(n.style.left)+27,y=parseFloat(n.style.top)+60;
    if(Math.hypot(pos.x-x,pos.y-y)<=130){interact();}
    else{moveTarget={x,y:y+28};toast('Walking to '+(n.querySelector('span')?.textContent||'NPC')+'...');}
  });
});

document.getElementById('noticeBoard').onclick=()=>{if(nearObject(document.getElementById('noticeBoard'),175))renderNoticeBoard();else toast('Move closer to the Notice Board.')};
document.getElementById('wolfIdol').onclick=()=>{if(nearObject(document.getElementById('wolfIdol'),155))interactLandmark();else toast('A strange wolf carving watches from deeper in the forest.')};

const mineExitButton=document.getElementById('mineExit');
if(mineExitButton){
  const leaveMine=()=>{
    if(currentArea!=='mine')return;
    switchArea('town',MINE_RETURN);
  };
  mineExitButton.onclick=leaveMine;
  mineExitButton.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();leaveMine();}};
}

const mineLeaveBtn=document.getElementById('mineLeaveBtn');
if(mineLeaveBtn){
  mineLeaveBtn.addEventListener('click',()=>{
    if(currentArea==='mine')switchArea('town',MINE_RETURN);
  });
}


['mineEntrance','mineSign','farmHouse','farmSign','fishingDock','riverSign'].forEach(id=>{
 const el=document.getElementById(id);
 if(!el)return;
 el.onclick=()=>{
   if(nearObject(el,210))interactLandmark();
   else toast('Travel closer to explore this area.');
 };
});


function pct(value,max){return Math.max(0,Math.min(100,(value/max)*100))}
function mapLandmarkHtml(x,y,icon,label,maxW=3600,maxH=2100){
 return `<div class="mapLandmark" style="left:${pct(x,maxW)}%;top:${pct(y,maxH)}%">${icon}<span>${label}</span></div>`;
}
function renderLiveMap(){
 panel.classList.add('mapPanel');
 const isMine=currentArea==='mine',isShop=currentArea==='shop';
 const maxW=isMine?2000:3600,maxH=isMine?1400:2100;
 let marks='';
 if(isMine){
  marks+=mapLandmarkHtml(1000,1180,'🚪','Exit',maxW,maxH);
  marks+=mapLandmarkHtml(500,760,'🟠','Copper Veins',maxW,maxH);
  marks+=mapLandmarkHtml(1100,330,'⚪','Iron Veins',maxW,maxH);
  marks+=mapLandmarkHtml(1130,600,'⚫','Coal Veins',maxW,maxH);
 }else{
  marks+=mapLandmarkHtml(1780,330,'🏛️','Town Hall');
  marks+=mapLandmarkHtml(1780,890,'🐺','Wolf Fountain');
  marks+=mapLandmarkHtml(1160,560,'⚒️','Bram’s Forge');
  marks+=mapLandmarkHtml(2390,545,'🛒','General Store');
  marks+=mapLandmarkHtml(1145,1035,'🏨','Wolf Inn');
  marks+=mapLandmarkHtml(2410,1045,'🏦','Bank');
  marks+=mapLandmarkHtml(590,1750,'⛏️','Brimvault Mine');
  marks+=mapLandmarkHtml(2750,1450,'🌾','Oakhaven Farms');
  marks+=mapLandmarkHtml(3200,780,'🌊','Silverwater River');
  marks+=mapLandmarkHtml(390,520,'👺',"Goblin Forest / King's Road");
 }
 panel.innerHTML=`<div class="mapShell">
  <div class="mapHeader"><h2>🗺️ ${isMine?'Brimvault Mine Map':isShop?'General Store Interior':'Valvondor World Map'}</h2><span class="mapMoveHint">Move while the map is open</span><div class="mapAreaBadge">${isMine?'UNDERGROUND · LEVEL 1':isShop?'OAKHAVEN · INTERIOR':'OAKHAVEN REGION'}</div><button class="mapClose" id="mapCloseBtn">✕</button></div>
  <div id="liveMap" class="liveMap ${isMine?'mineMap':'townMap'}">${marks}<div class="mapShade"></div><div id="playerMapMarker" class="playerMapMarker"><div id="mapHeroBody" class="mapHeroBody"></div><div id="mapHeroWeapon" class="mapHeroWeapon"></div></div></div>
  <div class="mapLegend"><span><b>Blue marker</b> = your live location</span><span>🏛️ Town</span><span>⛏️ Mine</span><span>🌾 Farms</span><span>🌊 River</span></div>
  <div id="mapCoords" class="mapCoords"></div>
 </div>`;
 document.getElementById('mapCloseBtn').onclick=()=>{panel.style.display='none'};
 updateMapMarker();
}
function updateMapMarker(){
 const marker=document.getElementById('playerMapMarker');
 if(!marker||panel.dataset.type!=='map'||panel.style.display!=='block')return;
 const maxW=currentArea==='mine'?2000:3600,maxH=currentArea==='mine'?1400:2100;
 marker.style.left=pct(pos.x,maxW)+'%';marker.style.top=pct(pos.y,maxH)+'%';
 const mapBody=document.getElementById('mapHeroBody'),mapWeapon=document.getElementById('mapHeroWeapon');
 const row=animations[state]?.singleRow?0:(LPC_DIR_ROW[facingDir]||0);
 const miniFrame=Math.max(0,Math.min(frame,(animations[state]?.frames||1)-1));
 if(mapBody){
   mapBody.style.backgroundImage=player.style.backgroundImage;
   mapBody.style.backgroundPosition=`-${miniFrame*32}px -${row*32}px`;
 }
 if(mapWeapon){
   const visible=playerWrap.classList.contains('hasBakedWeapon')&&weaponLayer.style.backgroundImage&&weaponLayer.style.backgroundImage!=='none';
   mapWeapon.style.display=visible?'block':'none';
   mapWeapon.style.backgroundImage=weaponLayer.style.backgroundImage;
   mapWeapon.style.backgroundPosition=`-${miniFrame*32}px -${row*32}px`;
 }
 const coords=document.getElementById('mapCoords');
 if(coords)coords.textContent=`${currentArea==='mine'?'Brimvault Mine · Level 1':'Oakhaven Region'} — Position ${Math.round(pos.x)}, ${Math.round(pos.y)}`;
}

const SKILL_UI={
 combat:{name:'Combat',badge:'assets/embedded/asset_0153_d5131536a0c8d15f.png',level:()=>playerLevel,xp:()=>playerXP,next:()=>xpToNext,desc:'Master weapons, survive dangerous enemies, and grow stronger through battle.',stats:()=>[['Attack','+'+Math.max(1,playerLevel*2)],['Enemies Defeated',inventoryData.goblin_ear||0],['Next Level',xpToNext-playerXP+' XP']],unlocks:[['Training Grounds',1,'⚔️'],['Goblin Hunter',5,'👺'],['Veteran Stance',10,'🛡️'],['Wolfguard Trial',20,'🐺'],['Champion Path',35,'🏆'],['Legendary Combat',50,'🔥']]},
 woodcutting:{name:'Woodcutting',badge:'assets/embedded/asset_0154_94331166486d24f5.png',level:()=>woodcuttingLevel,xp:()=>woodcuttingXP,next:()=>woodcuttingNext,desc:'Chop trees across Valvondor, gather logs, and unlock rarer forests.',stats:()=>[['Logs Owned',inventoryData.oak_log||0],['Trees Chopped',depletedTrees?.length||0],['Next Level',woodcuttingNext-woodcuttingXP+' XP']],assets:[['Normal Tree',1,'assets/embedded/asset_0155_23f98273bb056fa0.png'],['Oak Tree',10,'assets/embedded/asset_0156_0472ab612ea51848.png'],['Willow Tree',20,'assets/embedded/asset_0157_5a7892597cbbdfb7.png'],['Maple Tree',35,'assets/embedded/asset_0158_a6f948cb7571dc78.png'],['Yew Tree',50,'assets/embedded/asset_0159_482c49255dc1f39f.png'],['Magic Tree',75,'assets/embedded/asset_0160_69526f09a82dad63.png']]},
 mining:{name:'Mining',badge:'assets/embedded/asset_0161_eaea666cd6a5d319.png',level:()=>miningLevel,xp:()=>miningXP,next:()=>miningNext,desc:'Mine valuable stone and ore from Brimvault and future mines across the world.',stats:()=>[['Copper Owned',inventoryData.copper_ore||0],['Coal Owned',inventoryData.coal_ore||0],['Next Level',miningNext-miningXP+' XP']],assets:[['Copper Ore',1,'assets/embedded/asset_0162_fd9b402bb6ed7900.png'],['Iron Ore',10,'assets/embedded/asset_0163_2591cf703771f5f6.png'],['Coal',20,'assets/embedded/asset_0164_9f34db53c4d79854.png'],['Moonsteel Ore',35,'assets/embedded/asset_0165_e371395e5fcb196b.png'],['Bloodstone',50,'assets/embedded/asset_0166_c79ac48fd445546c.png'],['Starforged Crystal',75,'assets/embedded/asset_0167_3c6cb193895d6648.png']]},
 fishing:{name:'Fishing',badge:'assets/embedded/asset_0168_62d277bc904bd3ea.png',level:()=>fishingLevel,xp:()=>fishingXP,next:()=>fishingNext,desc:'Cast into rivers, lakes, reefs, and magical waters to discover rare catches.',stats:()=>[['Minnows',inventoryData.minnow||0],['Fish Caught',(inventoryData.minnow||0)+(inventoryData.trout||0)+(inventoryData.bluegill||0)+(inventoryData.salmon||0)+(inventoryData.catfish||0)+(inventoryData.golden_carp||0)],['Next Level',fishingNext-fishingXP+' XP']],assets:[['River',1,'assets/embedded/asset_0169_34feab0f867e0da3.png'],['Lake',10,'assets/embedded/asset_0170_55277c5920dbfa88.png'],['Deepwater',20,'assets/embedded/asset_0171_757273d25d007415.png'],['Shadow Marsh',35,'assets/embedded/asset_0172_40c6baf8daf7e0d8.png'],['Void Reef',50,'assets/embedded/asset_0173_8e0d7aa02bd31462.png'],['Celestial Depths',75,'assets/embedded/asset_0174_d8fa16aa76b1c90a.png']]},
 glyphcraft:{name:'Glyphcraft',badge:'assets/embedded/asset_0175_d72f7195a76a8752.png',level:()=>1,xp:()=>0,next:()=>100,desc:'Carve runes, bind essence, and forge powerful symbols tied to Valvondor lore.',stats:()=>[['Runes Carved',0],['Essence Bound',0],['Next Level','100 XP']],assets:[['Runestone Carving',1,'assets/embedded/asset_0176_1cd458be31917251.png'],['Essence Binding',10,'assets/embedded/asset_0177_b734648770a1b457.png'],['Sigil Weaving',20,'assets/embedded/asset_0178_fec0a8a5d1fc4d7e.png'],['Spirit Infusion',35,'assets/embedded/asset_0179_1cb0e9631b5e7c3b.png'],['Void Runes',50,'assets/embedded/asset_0180_7f5d001c42f86815.png'],['Soulforged Glyphs',75,'assets/embedded/asset_0181_4245e699020f5e93.png']]},
 herblore:{name:'Herblore',badge:'assets/embedded/asset_0182_82d4002a951c7510.png',level:()=>1,xp:()=>0,next:()=>100,desc:'Gather herbs, brew potions, and master the living essence of Valvondor.',stats:()=>[['Herbs Gathered',0],['Potions Brewed',0],['Next Level','100 XP']],assets:[['Herb Gathering',1,'assets/embedded/asset_0183_a845613f4f09c7b9.png'],['Potion Brewing',10,'assets/embedded/asset_0184_db4713b39fea99ff.png'],['Herb Cultivation',20,'assets/embedded/asset_0185_e8fdfe23714e5edb.png'],['Elixir Mastery',35,'assets/embedded/asset_0186_117633f30ca9711b.png'],['Nature Essence',50,'assets/embedded/asset_0187_ce0749d604419b0d.png'],['Celestial Herbology',75,'assets/embedded/asset_0188_dacadf95018fd41a.png']]}
};
let selectedSkill='woodcutting';
function skillCardHtml(key,data){const level=data.level(),xp=data.xp(),next=Math.max(1,data.next()),pct=Math.max(0,Math.min(100,xp/next*100));return `<button class="skillCard ${selectedSkill===key?'active':''}" data-skill="${key}"><img src="${data.badge}" alt="${data.name}"><div class="skillMeta"><strong>Level ${level}</strong><span>${xp} / ${next} XP</span><div class="miniXp"><i style="width:${pct}%"></i></div></div></button>`}
function renderSkillUnlocks(data,level){const items=data.assets||data.unlocks||[];return items.map(item=>{const [name,req,art]=item,ok=level>=req;return `<div class="unlockCard ${ok?'unlocked':'locked'}">${String(art).includes('/')?`<img src="${art}" alt="${name}">`:`<div style="font-size:70px;text-align:center;padding-top:25px">${art}</div>`}<span class="status">${ok?'✓ Unlocked':'🔒 Lv. '+req}</span><h4>${name}</h4><p>${ok?'Available now':'Requires level '+req}</p></div>`}).join('')}
function renderSkillsScreen(){
 panel.classList.add('skillsPanel');
 const total=Object.values(SKILL_UI).reduce((n,s)=>n+s.level(),0);
 const data=SKILL_UI[selectedSkill]||SKILL_UI.woodcutting,level=data.level(),xp=data.xp(),next=Math.max(1,data.next()),pct=Math.max(0,Math.min(100,xp/next*100));
 const nextUnlock=(data.assets||data.unlocks||[]).find(x=>x[1]>level);
 panel.innerHTML=`<div class="skillsScreen"><header class="skillsHeader"><img class="skillsCrest" src="assets/embedded/asset_0189_96c4eb2c3cc8c78e.png"><div class="skillsTitle"><h2>VALVONDOR SKILLS</h2><p>Train your skills. Master your destiny.</p></div><div class="skillsTotal"><div class="totalBadge"><img src="assets/embedded/asset_0190_238ad99995f1a0e9.png"><span class="levelNumber">${playerLevel}</span></div><div class="totalText">TOTAL LEVEL<b>${total}</b></div></div><button class="skillsClose" id="skillsClose">✕</button></header><section class="skillCards">${Object.entries(SKILL_UI).map(([k,v])=>skillCardHtml(k,v)).join('')}</section><main class="skillsBody"><section class="skillDetail"><div class="skillDetailTop"><div class="selectedLevelShield"><img src="assets/embedded/asset_0190_238ad99995f1a0e9.png"><span class="levelNumber">${level}</span></div><div><h3 class="detailName">${data.name}</h3><p class="detailDesc">${data.desc}</p></div></div><div class="bigXp"><i style="width:${pct}%"></i></div><div class="xpLine"><span>${xp} XP</span><span>${next} XP</span></div><div class="skillStats">${data.stats().map(x=>`<div class="skillStat"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('')}</div><div class="nextUnlock"><b>${nextUnlock?'Next unlock: '+nextUnlock[0]:'All current unlocks earned'}</b><small>${nextUnlock?'Reach level '+nextUnlock[1]:'More progression will arrive in future updates.'}</small></div></section><section class="unlockPanel"><div class="unlockHeader"><h3>${data.name} Guide</h3><span>Level ${level}</span></div><div class="unlockGrid">${renderSkillUnlocks(data,level)}</div></section></main><footer class="skillsFooter"><button class="active">Skills</button><button data-panel-jump="inventory">Inventory</button><button id="skillQuestJump">Quests</button><button data-panel-jump="map">Map</button><button id="skillCloseBottom">Close</button></footer></div>`;
 panel.querySelectorAll('[data-skill]').forEach(b=>b.addEventListener('click',()=>{selectedSkill=b.dataset.skill;renderSkillsScreen()}));
 const close=()=>{panel.style.display='none';panel.classList.remove('skillsPanel')};
 document.getElementById('skillsClose').onclick=close;document.getElementById('skillCloseBottom').onclick=close;
 panel.querySelectorAll('[data-panel-jump]').forEach(b=>b.onclick=()=>showPanel(b.dataset.panelJump));
 document.getElementById('skillQuestJump').onclick=()=>showPanel('quests');
}

function showPanel(type){
 if(panel.style.display==='block'&&panel.dataset.type===type){panel.style.display='none';return}
 panel.dataset.type=type;panel.style.display='block';panel.classList.remove('bankPanel','forgePanel','mapPanel','shopPanel','skillsPanel');if(type!=='inventory')panel.classList.remove('inventoryPanel');
 if(type==='inventory'){renderInventory();return;}
 if(type==='skills'){renderSkillsScreen();return;}
 if(type==='map'){renderLiveMap();return;}
 if(type==='quests'){
   const boarStatus=!boarQuestState.accepted?'Speak to Kael Ashfang in West Forest.':boarQuestState.claimed?'Completed — Westwood hunter reward claimed.':'Defeat 3 Dire Boars and bring Kael 1 Boar Tusk — '+boarQuestProgress();
   panel.innerHTML='<h2>Quests</h2><p><b>Welcome to Oakhaven</b><br>'+document.getElementById('questText').textContent+'</p><hr><p><b>A Miner’s Beginning</b><br>'+ (smithQuest.status==='not_started'?'Speak to Bram Coalwright.':smithQuest.status==='started'?'Mine 10 Copper Ore and return to Bram — '+Math.min(10,inventoryData.copper_ore||0)+'/10':'Completed — Copper Pickaxe earned.')+'</p><hr><p><b>Tusks on the Trail</b><br>'+boarStatus+'</p>';
 }
}


const ITEM_DB={
  rat_tail:{name:'Rat Tail',image:'assets/items/starter_mobs/rat_tail.webp',icon:'🐀',type:'material',description:'A tail taken from a Field Rat. A common starter creature drop.',stack:99,rarity:'COMMON'},
  raw_rat_meat:{name:'Raw Rat Meat',image:'assets/items/starter_mobs/raw_rat_meat.png',icon:'🥩',type:'food',description:'Raw meat from a Field Rat. Can be cooked later.',stack:99,rarity:'COMMON'},
  raw_boar_meat:{name:'Raw Boar Meat',image:'assets/dire_boar/loot/raw_boar_meat.png',icon:'🥩',type:'food',description:'Fresh meat from a Dire Boar. Can be cooked later; eating it raw restores a small amount of health.',heal:8,stack:99,rarity:'COMMON'},
  boar_hide:{name:'Boar Hide',image:'assets/dire_boar/loot/boar_hide.png',icon:'🟫',type:'material',description:'A thick hide taken from a Dire Boar. Useful for future leather crafting.',stack:99,rarity:'COMMON'},
  boar_tusk:{name:'Boar Tusk',image:'assets/dire_boar/loot/boar_tusk.png',icon:'🦷',type:'material',description:'A rare heavy tusk from a Dire Boar. Collectors and future crafters value it.',stack:99,rarity:'RARE'},

  owner_blade:{name:"Owner's Fangblade",image:'assets/owner_gear/owners_fangblade.png',icon:'⚔️',type:'weapon',description:'OWNER ONLY — forged for the creator of Valvondor. Maximum combat power.',attack:999,accuracy:99,crit:100,moveSpeed:10,maxHp:500,image:'assets/owner_gear/owners_fangblade.png',stack:1,equip:'weapon',rarity:'OWNER',combatReq:1,visualFile:'assets/embedded/asset_0200_bb748d47f57ed261.png'},
  owner_aegis:{name:"Owner's Aegis",image:'assets/owner_gear/owners_aegis.png',icon:'🛡️',type:'armor',description:'OWNER ONLY — nearly impenetrable shield.',defense:999,maxHp:999,block:.95,image:'assets/owner_gear/owners_aegis.png',stack:1,equip:'shield',rarity:'OWNER',combatReq:1},
  owner_crown:{name:"Owner's Crown",image:'assets/owner_gear/owners_crown.png',icon:'👑',type:'armor',description:'OWNER ONLY — helm of the ruler of Valvondor.',defense:999,maxHp:500,accuracy:25,crit:25,image:'assets/owner_gear/owners_crown.png',stack:1,equip:'helmet',rarity:'OWNER',combatReq:1},
  owner_plate:{name:"Owner's Wolfplate",image:'assets/owner_gear/owners_wolfplate.png',icon:'🛡️',type:'armor',description:'OWNER ONLY — unmatched armor bearing the Wolf Den crest.',defense:999,maxHp:1500,attack:100,image:'assets/owner_gear/owners_wolfplate.png',stack:1,equip:'chest',rarity:'OWNER',combatReq:1},
  owner_boots:{name:"Owner's Shadow Boots",image:'assets/owner_gear/owners_shadow_boots.png',icon:'🥾',type:'armor',description:'OWNER ONLY — impossible speed and protection.',defense:999,maxHp:500,moveSpeed:25,image:'assets/owner_gear/owners_shadow_boots.png',stack:1,equip:'boots',rarity:'OWNER',combatReq:1},
  owner_ring:{name:"Owner's Ring of Valvondor",image:'assets/owner_gear/owners_ring.png',icon:'💍',type:'armor',description:'OWNER ONLY — the final seal of the creator. Maxes every combat bonus.',attack:250,accuracy:99,crit:100,defense:250,maxHp:1000,moveSpeed:15,image:'assets/owner_gear/owners_ring.png',stack:1,equip:'ring',rarity:'OWNER',combatReq:1},
  town_key:{image:'assets/items/town_key.png',name:'Town Key',icon:'🗝️',type:'quest',description:'A key given to you in Oakhaven.',stack:1},
  bread:{image:'assets/items/bread.png',name:'Bread',icon:'🍞',type:'food',description:'Restores 15 HP.',heal:15,stack:20},
  gold:{name:'Bronze Coins',icon:'🪙',type:'currency',description:'The base coin of Valvondor. 100 Bronze = 1 Silver; 100 Silver = 1 Gold.',stack:999999},
  training_sword:{image:'assets/items/training_sword.png',name:'Training Sword',icon:'⚔️',type:'weapon',description:'A balanced starter sword from the Oakhaven blacksmith. Attack +4 · Accuracy +4 · Crit +1%.',attack:4,accuracy:4,crit:1,stack:1,equip:'weapon',rarity:'Common'},
  oak_log:{image:'assets/items/oak_log.png',name:'Oak Log',icon:'🪵',type:'material',description:'Useful for crafting and quests.',stack:99},
  goblin_ear:{image:'assets/items/goblin_ear.png',name:'Goblin Ear',icon:'👂',type:'quest',description:'Proof that a goblin was defeated.',stack:99},
  apple:{image:'assets/items/apple.png',name:'Apple',icon:'🍎',type:'food',description:'Restores 8 HP.',heal:8,stack:20},
  health_potion:{image:'assets/items/health_potion.png',name:'Health Potion',icon:'🧪',type:'potion',description:'Restores 35 HP.',heal:35,stack:10},
  wolfheart_elixir:{image:'assets/items/wolfheart_elixir.png',name:'Wolfheart Elixir',icon:'❤️‍🔥',type:'potion',description:'A rare crimson elixir. If you fall, consume it to revive on the spot with 50% HP.',revive:true,reviveHp:.5,stack:5,rarity:'Rare'},
  rusty_dagger:{image:'assets/items/rusty_dagger.png',name:'Rusty Dagger',icon:'🗡️',type:'weapon',description:'A worn goblin blade. Attack +4 · Accuracy +2 · Crit +2%.',attack:4,stack:1,equip:'weapon',visualFile:'assets/embedded/asset_0191_bb495605639faefc.png',accuracy:2,crit:2,rarity:'Common'},
  cracked_shield:{image:'assets/items/cracked_shield.png',name:'Cracked Wooden Shield',icon:'🛡️',type:'armor',description:'A battered goblin shield. Defense +3 · Max HP +5 · Block 3%.',defense:3,stack:1,equip:'shield',maxHp:5,block:3},
  goblin_shiv:{name:'Goblin Shiv',icon:'🔪',image:'assets/embedded/asset_0192_df3d9d6df943569b.png',type:'weapon',description:'A crude poisoned goblin blade. Attack +6 · Accuracy +3 · Crit +3%. Requires Combat 3.',attack:6,accuracy:3,crit:3,stack:1,equip:'weapon',rarity:'Uncommon',combatReq:3},
  goblin_fang_ring:{name:'Goblin Fang Ring',icon:'💍',image:'assets/items/goblin_fang_ring.png',type:'armor',description:'Crafted from the fang of a fallen goblin chieftain. It whispers of blood, speed, and survival.',attack:3,accuracy:5,crit:8,moveSpeed:5,maxHp:10,stack:1,equip:'ring',rarity:'Epic',combatReq:10},
  small_emerald:{image:'assets/items/small_emerald.png',name:'Small Emerald',icon:'💎',type:'material',description:'A rare green gem.',stack:99},
  goblin_map:{image:'assets/items/goblin_map.png',name:'Goblin Camp Map',icon:'📜',type:'quest',description:'A rough map of hidden goblin paths.',stack:1},
  chest_key:{image:'assets/items/chest_key.png',name:'Goblin Chest Key',icon:'🔑',type:'quest',description:'Opens a locked goblin chest.',stack:10},
  copper_ore:{image:'assets/items/copper_ore.png',name:'Copper Ore',icon:'🟠',type:'material',description:'A basic ore mined in Brimvault.',stack:99},
  iron_ore:{image:'assets/items/iron_ore.png',name:'Iron Ore',icon:'⚪',type:'material',description:'Strong ore requiring Mining level 5.',stack:99},
  coal_ore:{image:'assets/items/coal_ore.png',name:'Coal',icon:'⚫',type:'material',description:'Fuel used by Bram Coalwright’s forge.',stack:99},
  silver_ore:{image:'assets/items/silver_ore.png',name:'Silver Ore',icon:'◻️',type:'material',description:'Rare ore from deeper mine levels.',stack:99},
  gold_ore:{image:'assets/items/gold_ore.png',name:'Gold Ore',icon:'🟡',type:'material',description:'Valuable ore from deep caverns.',stack:99},
  copper_bar:{image:'assets/items/copper_bar.png',name:'Copper Bar',icon:'🟧',type:'material',description:'A bar smelted from copper ore.',stack:99},
  iron_bar:{image:'assets/items/iron_bar.png',name:'Iron Bar',icon:'⬜',type:'material',description:'A sturdy iron bar.',stack:99},
  silver_bar:{image:'assets/items/silver_bar.png',name:'Silver Bar',icon:'🔳',type:'material',description:'A refined silver bar.',stack:99},
  gold_bar:{image:'assets/items/gold_bar.png',name:'Gold Bar',icon:'🟨',type:'material',description:'A refined gold bar.',stack:99},
  copper_pickaxe:{image:'assets/items/copper_pickaxe.png',name:'Copper Pickaxe',icon:'⛏️',type:'tool',description:'Bram’s proper starter pickaxe. Mining speed +28%.',stack:1,equip:'tool',visual:'pickaxe'},
  copper_axe:{image:'assets/items/copper_axe.png',name:'Copper Axe',icon:'🪓',type:'tool',description:'A reliable copper woodcutting axe. Starter Woodcutting tool.',stack:1,equip:'tool',visual:'axe'},
  copper_sword:{image:'assets/items/copper_sword.png',name:'Copper Sword',icon:'🗡️',type:'weapon',description:'A forged copper sword. Attack +7 · Accuracy +5 · Crit +2%.',attack:7,accuracy:5,crit:2,stack:1,equip:'weapon',rarity:'Common',visualFile:'assets/embedded/asset_0193_2dcbf2134ffc9835.png'},
  iron_pickaxe:{image:'assets/items/iron_pickaxe.png',name:'Iron Pickaxe',icon:'⛏️',type:'tool',description:'A strong iron pickaxe made for tougher Brimvault ore.',stack:1,equip:'tool',visual:'pickaxe'},
  iron_axe:{image:'assets/items/iron_axe.png',name:'Iron Axe',icon:'🪓',type:'tool',description:'A strong iron axe for higher-level trees.',stack:1,equip:'tool',visual:'axe'},
  fishing_rod:{image:'assets/items/fishing_rod.png',name:'Silverwater Fishing Rod',icon:'🎣',type:'tool',description:'A Silverwater rod used at fishing ripples and Westwood fishing spots.',stack:1,equip:'tool',visual:'fishing_rod'},
  minnow:{name:'Minnow',icon:'🐟',image:'assets/embedded/asset_0194_a766c1ac73eba72b.png',type:'food',description:'A tiny Silverwater fish. Fishing level 1. Eat it to restore 4 HP.',heal:4,stack:99},
  trout:{name:'River Trout',icon:'🐟',image:'assets/embedded/asset_0195_c0d1b3b375cdd4ea.png',type:'food',description:'A colorful river trout. Fishing level 5. Restores 8 HP when eaten.',heal:8,stack:99},
  bluegill:{name:'Bluegill',icon:'🐟',image:'assets/embedded/asset_0196_5f3646ce13456c7a.png',type:'food',description:'A bright blue-and-gold lake fish. Fishing level 10. Restores 12 HP.',heal:12,stack:99},
  salmon:{name:'Salmon',icon:'🐟',image:'assets/embedded/asset_0197_d7ceae8ff92406c2.png',type:'food',description:'A strong Silverwater salmon. Fishing level 20. Restores 18 HP.',heal:18,stack:99},
  catfish:{name:'Catfish',icon:'🐟',image:'assets/embedded/asset_0198_58823d39d97deda6.png',type:'food',description:'A heavy Westwood catfish. Fishing level 25. Restores 26 HP.',heal:26,stack:99},
  golden_carp:{name:'Golden Carp',icon:'🐟',image:'assets/embedded/asset_0199_3d3d550f94ebfd34.png',type:'food',description:'A rare golden carp prized across Valvondor. Fishing level 40. Restores 40 HP.',heal:40,stack:99},
  iron_sword:{image:'assets/items/iron_sword.png',name:'Iron Sword',icon:'⚔️',type:'weapon',description:'A strong forged iron sword. Attack +11 · Accuracy +8 · Crit +4%. Requires Combat 5.',attack:11,accuracy:8,crit:4,stack:1,equip:'weapon',rarity:'Uncommon',combatReq:5,visualFile:'assets/embedded/asset_0200_bb748d47f57ed261.png'}
};

let inventoryData={
  owner_blade:1,
  owner_aegis:1,
  owner_crown:1,
  owner_plate:1,
  owner_boots:1,
  owner_ring:1,
  town_key:1,
  bread:0,
  rat_tail:0,raw_rat_meat:0,
  gold:0,
  training_sword:0,
  oak_log:0,
  goblin_ear:0,
  apple:0,
  health_potion:1,
  wolfheart_elixir:1,
  copper_ore:0,iron_ore:0,coal_ore:0,silver_ore:0,gold_ore:0,
  copper_bar:0,iron_bar:0,silver_bar:0,gold_bar:0,
  copper_pickaxe:0,copper_axe:0,copper_sword:0,iron_pickaxe:0,iron_axe:0,iron_sword:0,fishing_rod:0,minnow:0,trout:0,bluegill:0,salmon:0,catfish:0,golden_carp:0,goblin_fang_ring:1
};

let equipment={weapon:'owner_blade',tool:null,helmet:'owner_crown',chest:'owner_plate',shield:'owner_aegis',boots:'owner_boots',ring:'owner_ring'};
let selectedItem=null;
let inventoryFilter='all';

function addItem(id,amount=1){
  if(!(id in inventoryData)) inventoryData[id]=0;
  inventoryData[id]+=amount;
  if(document.getElementById('panel').dataset.type==='inventory') renderInventory();
}
function removeItem(id,amount=1){
  if(!(id in inventoryData)) return false;
  if(inventoryData[id]<amount) return false;
  inventoryData[id]-=amount;
  if(inventoryData[id]<=0) inventoryData[id]=0;
  if(document.getElementById('panel').dataset.type==='inventory') renderInventory();
  return true;
}
function getAttackBonus(){
 let total=0;
 Object.values(equipment).forEach(id=>{if(id&&ITEM_DB[id])total+=ITEM_DB[id].attack||0;});
 return total;
}
function getAccuracyBonus(){
 let total=0;
 Object.values(equipment).forEach(id=>{if(id&&ITEM_DB[id])total+=ITEM_DB[id].accuracy||0;});
 return total;
}
function getCritChance(){
 let total=0;
 Object.values(equipment).forEach(id=>{if(id&&ITEM_DB[id])total+=ITEM_DB[id].crit||0;});
 return total;
}
function getMoveSpeedBonus(){
 let total=0;
 Object.values(equipment).forEach(id=>{if(id&&ITEM_DB[id])total+=ITEM_DB[id].moveSpeed||0;});
 return total;
}
function getDefenseBonus(){
 let total=0;
 Object.values(equipment).forEach(id=>{if(id&&ITEM_DB[id])total+=ITEM_DB[id].defense||0;});
 return total;
}
function getMaxHpBonus(){
 let total=0;
 Object.values(equipment).forEach(id=>{if(id&&ITEM_DB[id])total+=ITEM_DB[id].maxHp||0;});
 return total;
}
function getBlockChance(){
 const s=equipment.shield?ITEM_DB[equipment.shield]:null;
 const raw=Number(s?.block||0);
 return raw>1?Math.min(.95,raw/100):Math.max(0,Math.min(.95,raw));
}
function playerMaxHP(){return 100+getMaxHpBonus();}

// LPC equipment anchors. The base hero is weaponless, so inventory gear is the only visible weapon.
const LPC_GEAR_ANCHORS={
 down:{idle:[73,69,-18,5],walk:[73,70,-18,5],run:[74,70,-20,5],attack:[76,65,-42,6],defend:[72,68,-12,5]},
 up:{idle:[56,59,18,1],walk:[56,59,18,1],run:[55,58,20,1],attack:[54,57,42,1],defend:[55,59,12,1]},
 left:{idle:[42,67,-66,4],walk:[41,68,-66,4],run:[40,68,-70,4],attack:[38,62,-105,5],defend:[42,65,-78,4]},
 right:{idle:[86,67,66,4],walk:[87,68,66,4],run:[88,68,70,4],attack:[90,62,105,5],defend:[86,65,78,4]}
};
function updateHeldGearPose(){
 const weaponEl=document.getElementById('visualWeapon');
 const shieldEl=document.getElementById('visualShield');
 const toolEl=document.getElementById('visualTool');
 if(!weaponEl||!shieldEl||!toolEl)return;
 const action=(state.startsWith('attack')||state==='run_attack')?'attack':(state==='defend'?'defend':(state==='run'?'run':(state==='walk'?'walk':'idle')));
 const dir=LPC_GEAR_ANCHORS[facingDir]||LPC_GEAR_ANCHORS.down;
 const [gx,gy,rot,z]=dir[action]||dir.idle;
 const ww=parseFloat(weaponEl.style.width)||27, wh=parseFloat(weaponEl.style.height)||27;
 weaponEl.style.left=(gx-ww*.18)+'px';weaponEl.style.top=(gy-wh*.84)+'px';weaponEl.style.right='auto';
 weaponEl.style.transformOrigin='18% 84%';weaponEl.style.transform=`rotate(${rot}deg)`;weaponEl.style.zIndex=String(z);
 const shieldPos={down:[42,67,5],up:[78,61,5],left:[72,66,5],right:[35,66,5]}[facingDir]||[42,67,5];
 shieldEl.style.left=(shieldPos[0]-12)+'px';shieldEl.style.top=(shieldPos[1]-12)+'px';shieldEl.style.transform='none';shieldEl.style.zIndex=String(shieldPos[2]);
 toolEl.style.left=(gx-9)+'px';toolEl.style.top=(gy-27)+'px';toolEl.style.right='auto';toolEl.style.transformOrigin='20% 82%';toolEl.style.transform=`rotate(${rot}deg)`;toolEl.style.zIndex=String(z);
}
function updateEquipmentVisual(){
  const wrap=document.getElementById('playerWrap');
  const weaponEl=document.getElementById('visualWeapon');
  const shieldEl=document.getElementById('visualShield');
  const toolEl=document.getElementById('visualTool');
  const armorEl=document.getElementById('visualArmor');
  if(!wrap||!weaponEl||!shieldEl||!toolEl||!armorEl)return;
  const weapon=equipment.weapon&&ITEM_DB[equipment.weapon];
  const shield=equipment.shield&&ITEM_DB[equipment.shield];
  const tool=equipment.tool&&ITEM_DB[equipment.tool];
  weaponEl.src=''; weaponEl.alt=''; weaponEl.style.display='none';
  // Daggers are shorter than swords; all weapon art is intentionally scaled down.
  const weaponSize=equipment.weapon==='rusty_dagger'?22:27;
  weaponEl.style.width=weaponSize+'px';
  weaponEl.style.height=weaponSize+'px';
  shieldEl.textContent=shield?shield.icon:'🛡️';
  if(tool){
    if(tool.visual==='axe'){
      toolEl.style.display='none';toolEl.dataset.emoji='🪓';toolEl.src='';toolEl.alt='🪓';toolEl.style.background='none';
    }else if(tool.visual==='fishing_rod'){
      toolEl.src='assets/embedded/asset_0201_f71dfe9e4b7ed048.png';toolEl.alt=tool.name;toolEl.style.width='22px';toolEl.style.height='34px';
    }else{
      toolEl.src='assets/embedded/asset_0040_c9a7559462c22d88.png';toolEl.alt=tool.name;
    }
  }
  wrap.classList.remove('showWeapon');
  syncWeaponLayer(animations[state]||animations.idle);
  wrap.classList.toggle('showShield',!!shield);
  wrap.classList.toggle('showTool',!!tool);
  wrap.classList.toggle('showArmor',!!equipment.chest||!!equipment.helmet);
  wrap.classList.toggle('facingLeft',facing<0);
  armorEl.style.borderColor=equipment.chest?'#d7b46a':'transparent';
  updateHeldGearPose();
}
function unequipSlot(slot){
  if(!equipment[slot])return;
  const item=ITEM_DB[equipment[slot]];
  equipment[slot]=null;
  hp=Math.min(hp,playerMaxHP());
  if(hpBar)hpBar.style.width=(hp/playerMaxHP()*100)+'%';
  updateEquipmentVisual();
  renderInventory();
  save(false);
  toast((item?item.name:'Item')+' unequipped.');
}
function equipItem(id){
  const item=ITEM_DB[id];
  if(!item||!item.equip||inventoryData[id]<=0) return;
  if(item.combatReq && playerLevel<item.combatReq){toast('Combat level '+item.combatReq+' required to equip '+item.name+'.');return}
  const beforeMax=playerMaxHP();
  equipment[item.equip]=id;
  selectedItem=id;
  const afterMax=playerMaxHP();
  if(afterMax>beforeMax)hp=Math.min(afterMax,hp+(afterMax-beforeMax));
  if(hpBar)hpBar.style.width=(hp/afterMax*100)+'%';
  updateEquipmentVisual();
  renderInventory();
  save(false);
  toast(item.name+' equipped and now visible.');
}
function useItem(id){
  const item=ITEM_DB[id];
  if(!item||inventoryData[id]<=0) return;
  if(item.revive){
    if(!dead){toast(item.name+' can only be used after you fall.');return}
    revive();
  }else if(item.heal){
    if(dead){toast('You cannot use normal healing while defeated.');return}
    if(hp>=playerMaxHP()){toast('Your health is already full.');return}
    hp=Math.min(playerMaxHP(),hp+item.heal);
    hpBar.style.width=(hp/playerMaxHP()*100)+'%';
    removeItem(id,1);
    toast('Used '+item.name+'.');
  }else if(item.equip){
    equipItem(id);
  }
}
function dropItem(id){
  const item=ITEM_DB[id];
  if(!item||inventoryData[id]<=0||item.type==='quest'||item.type==='currency') return;
  removeItem(id,1);
  toast('Dropped 1 '+item.name+'.');
}
function filteredItems(){
  return Object.keys(inventoryData).filter(id=>{
    if(inventoryData[id]<=0) return false;
    if(inventoryFilter==='all') return true;
    return ITEM_DB[id].type===inventoryFilter;
  });
}
function itemArt(item,cls=''){
 if(!item)return '?';
 return item.image?`<img class="${cls} itemArtImg" src="${item.image}" alt="${item.name}">`:item.icon;
}

const CURRENCY_ART={
 bronze:'assets/embedded/asset_0202_b045029198865987.png',
 silver:'assets/embedded/asset_0203_068f062d3fe9b155.png',
 gold:'assets/embedded/asset_0204_5c464c1197326cf2.png',
 crystal:'assets/embedded/asset_0205_98569739b0c2fe1d.png'
};
function coinWallet(total){
 total=Math.max(0,Math.floor(Number(total)||0));
 return {gold:Math.floor(total/10000),silver:Math.floor(total%10000/100),bronze:total%100};
}
function walletMarkup(){
 const c=coinWallet(inventoryData.gold||0);
 const crystals=Math.max(0,Number(localStorage.getItem('valvondor_crystals')||0));
 return `<span class="walletCurrency"><img src="${CURRENCY_ART.gold}">${c.gold}</span><span class="walletCurrency"><img src="${CURRENCY_ART.silver}">${c.silver}</span><span class="walletCurrency"><img src="${CURRENCY_ART.bronze}">${c.bronze}</span><span class="walletDivider"></span><span class="walletCurrency premium"><img src="${CURRENCY_ART.crystal}">${crystals}</span>`;
}

function renderInventory(){
 panel.classList.remove('forgePanel','bankPanel','mapPanel','shopPanel','skillsPanel');panel.classList.add('inventoryPanel');
 const items=filteredItems(),usedSlots=Object.keys(inventoryData).filter(id=>inventoryData[id]>0&&id!=='gold').length;
 const slots=items.map(id=>{const item=ITEM_DB[id];return `<div class="invGridSlot ${selectedItem===id?'selected':''}" data-item="${id}"><div><div class="icon">${itemArt(item,'invItemArt')}</div><small>${item.name}</small></div><span class="count">x${inventoryData[id]}</span></div>`}).join('');
 const eqSlot=(slot,label)=>{const id=equipment[slot],item=id?ITEM_DB[id]:null;return `<div class="invEquipSlot" data-equip-slot="${slot}"><div><div class="icon">${item?itemArt(item,'invItemArt'):'◇'}</div><small>${item?item.name:label}</small></div></div>`};
 const item=selectedItem?ITEM_DB[selectedItem]:null;
 panel.innerHTML=`<div class="inventoryScene"><header class="inventoryHeaderNew"><div class="invBrand"><div class="invBrandMark"><img src="assets/embedded/asset_0206_0ebdd9988f5fc646.png" alt="Valvondor wolf crest"></div><div><h2>VALVONDOR</h2><small>Adventurer's Pack</small></div></div><div class="invTitleNew">INVENTORY</div><div class="invWallet"><div class="currencyWallet">${walletMarkup()}</div><button class="invCloseNew" id="invCloseNew">✕</button></div></header>
 <nav class="invMobileTabs" aria-label="Inventory sections"><button class="invMobileTab active" data-mobile-inv="backpack">🎒 Backpack</button><button class="invMobileTab" data-mobile-inv="equipment">⚔ Equipment</button><button class="invMobileTab" data-mobile-inv="details">🔎 Details</button></nav>
 <main class="invBodyNew"><section class="invPane" data-mobile-pane="equipment"><div class="invPaneTitle">⚔ EQUIPMENT · ${characterData.name} — ${currentHero().name}</div><div class="invEquipmentBody"><div class="invCharacterStage"><img class="invCharacterPortrait" src="${currentHero().portrait}" alt="${currentHero().name}"></div><div class="invEquipGrid">${eqSlot('weapon','Weapon')}${eqSlot('tool','Tool')}${eqSlot('shield','Shield')}${eqSlot('helmet','Helmet')}${eqSlot('chest','Armor')}${eqSlot('boots','Boots')}${eqSlot('ring','Ring')}</div><div class="invStatsNew"><div class="invStatNew"><b>${4+getAttackBonus()}</b><span>ATTACK</span></div><div class="invStatNew"><b>${1+getDefenseBonus()}</b><span>DEFENSE</span></div><div class="invStatNew"><b>${hp}/${playerMaxHP()}</b><span>HEALTH</span></div></div></div></section>
 <section class="invPane invBackpackPane mobileActive" data-mobile-pane="backpack"><div class="invPaneTitle">🎒 BACKPACK</div><div class="invFiltersNew">${['all','weapon','tool','food','potion','material','quest'].map(t=>`<button class="invFilterNew ${inventoryFilter===t?'active':''}" data-filter="${t}">${t.toUpperCase()}</button>`).join('')}</div><div class="invGridNew">${slots||'<p style="grid-column:1/-1;color:#8f9aa1">No items in this category.</p>'}</div><div class="invMobileQuickAction">${item&&item.equip?`<button id="quickEquipBtn" class="invQuickEquip ${equipment[item.equip]===selectedItem?'unequip':''}">${equipment[item.equip]===selectedItem?'UNEQUIP':'EQUIP'} ${item.name}</button>`:item&&item.heal?`<button id="quickUseBtn" class="invQuickEquip">USE ${item.name}</button>`:''}</div><div class="invCapacity"><span>Capacity</span><b>${usedSlots} / 50</b></div></section>
 <section class="invPane invDetailPane" data-mobile-pane="details"><div class="invPaneTitle">ITEM DETAILS</div><div class="invPreviewNew">${item?itemArt(item,'invDetailArt'):'?'}</div><div class="invDetailText">${item?`<h3>${item.name}</h3><p>${item.description}</p><div class="invDetailRow"><span>Type</span><b>${(item.type||'item').toUpperCase()}</b></div>${item.rarity?`<div class="invDetailRow"><span>Rarity</span><b>${item.rarity}</b></div>`:''}<div class="invDetailRow"><span>Owned</span><b>${inventoryData[selectedItem]||0}</b></div>${item.attack?`<div class="invDetailRow"><span>Attack</span><b>+${item.attack}</b></div>`:''}${item.defense?`<div class="invDetailRow"><span>Defense</span><b>+${item.defense}</b></div>`:''}${item.maxHp?`<div class="invDetailRow"><span>Health</span><b>+${item.maxHp} HP</b></div>`:''}${item.block?`<div class="invDetailRow"><span>Block Chance</span><b>+${item.block}%</b></div>`:''}${item.accuracy?`<div class="invDetailRow"><span>Accuracy</span><b>+${item.accuracy}</b></div>`:''}${item.crit?`<div class="invDetailRow"><span>Critical</span><b>+${item.crit}%</b></div>`:''}${item.moveSpeed?`<div class="invDetailRow"><span>Movement Speed</span><b>+${item.moveSpeed}%</b></div>`:''}${item.combatReq?`<div class="invDetailRow"><span>Requires</span><b>Combat Lv. ${item.combatReq}</b></div>`:''}${item.heal?`<div class="invDetailRow"><span>Healing</span><b>+${item.heal} HP</b></div>`:''}`:'<h3>Select an item</h3><p>Choose something from your backpack to inspect it.</p>'}</div><div class="invActionsNew">${item?`${item.equip?`<button class="invAction equip full" id="useItemBtn">${equipment[item.equip]===selectedItem?'UNEQUIP':'EQUIP'}</button>`:item.heal?'<button class="invAction use full" id="useItemBtn">USE</button>':''}<button class="invAction drop full" id="dropItemBtn">DROP</button>`:''}</div></section></main>
 <footer class="invFooterNew"><button class="active">Inventory</button><button data-inv-jump="skills">Skills</button><button data-inv-jump="quests">Quests</button><button data-inv-jump="map">Map</button><button id="invCloseBottom">Close</button></footer></div>`;
 panel.querySelectorAll('[data-mobile-inv]').forEach(btn=>btn.onclick=()=>{const key=btn.dataset.mobileInv;panel.querySelectorAll('[data-mobile-inv]').forEach(b=>b.classList.toggle('active',b===btn));panel.querySelectorAll('[data-mobile-pane]').forEach(p=>p.classList.toggle('mobileActive',p.dataset.mobilePane===key));});panel.querySelectorAll('[data-item]').forEach(el=>el.onclick=()=>{selectedItem=el.dataset.item;renderInventory()});panel.querySelectorAll('[data-filter]').forEach(el=>el.onclick=()=>{inventoryFilter=el.dataset.filter;renderInventory()});panel.querySelectorAll('[data-equip-slot]').forEach(el=>el.onclick=()=>unequipSlot(el.dataset.equipSlot));panel.querySelectorAll('[data-inv-jump]').forEach(el=>el.onclick=()=>showPanel(el.dataset.invJump));
 const close=()=>{panel.style.display='none';panel.classList.remove('inventoryPanel')};document.getElementById('invCloseNew').onclick=close;document.getElementById('invCloseBottom').onclick=close;const useBtn=document.getElementById('useItemBtn');
 if(useBtn)useBtn.onclick=()=>{
   const it=selectedItem?ITEM_DB[selectedItem]:null;
   if(it?.equip && equipment[it.equip]===selectedItem)unequipSlot(it.equip);
   else useItem(selectedItem);
 };
 const quickEquip=document.getElementById('quickEquipBtn');
 if(quickEquip)quickEquip.onclick=()=>{
   const it=selectedItem?ITEM_DB[selectedItem]:null;
   if(!it?.equip)return;
   if(equipment[it.equip]===selectedItem)unequipSlot(it.equip);
   else equipItem(selectedItem);
 };
 const quickUse=document.getElementById('quickUseBtn');
 if(quickUse)quickUse.onclick=()=>useItem(selectedItem);
 const dropBtn=document.getElementById('dropItemBtn');if(dropBtn)dropBtn.onclick=()=>dropItem(selectedItem);
}
function showLootPopup(text,x,y){
  const p=document.createElement('div');
  p.className='lootPopup';
  p.textContent=text;
  p.style.left=x+'px';
  p.style.top=y+'px';
  world.appendChild(p);
  setTimeout(()=>p.remove(),1300);
}




/* =========================
   GENERAL STORE
   ========================= */
let shopTab='buy',shopSelected='bread',shopCategory='all',shopQuantity=1;
const SHOP_STOCK=[
  {id:'bread',price:5,label:'Freshly baked provisions',category:'food',rarity:'common'},
  {id:'apple',price:3,label:'A crisp road snack',category:'food',rarity:'common'},
  {id:'health_potion',price:25,label:'Restores 35 HP',category:'potions',rarity:'common'},
  {id:'fishing_rod',price:30,label:'Basic Silverwater fishing tool',category:'tools',rarity:'common'}
];
const SHOP_SELL_PRICES={bread:2,apple:1,health_potion:12,oak_log:4,goblin_ear:6,small_emerald:40,copper_ore:3,iron_ore:7,coal_ore:5,silver_ore:12,gold_ore:20,copper_bar:8,iron_bar:16,silver_bar:25,gold_bar:40,minnow:2,trout:6,salmon:12,rusty_dagger:10,cracked_shield:12};
function shopMaxQuantity(id,price,tab){
  if(tab==='buy') return Math.max(1,Math.min(99,Math.floor((inventoryData.gold||0)/price)));
  return Math.max(1,inventoryData[id]||0);
}
function shopBuy(id,price,qty=1){qty=Math.max(1,Math.floor(qty));const total=price*qty;if((inventoryData.gold||0)<total){toast('You need '+total+' gold.');return}inventoryData.gold-=total;addItem(id,qty);save(false);shopSelected=id;shopQuantity=1;renderShop('buy');toast('Bought '+qty+' '+ITEM_DB[id].name+(qty>1?'s':'')+'.')}
function shopSell(id,price,qty=1){qty=Math.max(1,Math.min(Math.floor(qty),inventoryData[id]||0));if(qty<=0){toast('You do not have that item.');return}if(equipment.weapon===id||equipment.tool===id||equipment.shield===id){toast('Unequip that item before selling it.');return}removeItem(id,qty);addItem('gold',price*qty);save(false);shopSelected=id;shopQuantity=1;renderShop('sell');toast('Sold '+qty+' '+ITEM_DB[id].name+(qty>1?'s':'')+' for '+(price*qty)+' gold.')}
function shopTypeCategory(item){const t=item?.type||'other';if(t==='food')return'food';if(t==='potion')return'potions';if(t==='tool')return'tools';if(t==='weapon'||t==='armor')return'weapons';if(t==='material')return'materials';return'other'}
function renderShop(tab=shopTab){
 shopTab=tab;panel.dataset.type='shop';panel.style.display='block';panel.classList.remove('inventoryPanel','bankPanel','forgePanel','mapPanel');panel.classList.add('shopPanel');
 let entries=tab==='buy'?SHOP_STOCK.map(x=>({...x,owned:inventoryData[x.id]||0})):Object.keys(SHOP_SELL_PRICES).filter(id=>(inventoryData[id]||0)>0&&ITEM_DB[id]).map(id=>({id,price:SHOP_SELL_PRICES[id],label:'Owned: '+inventoryData[id],owned:inventoryData[id],category:shopTypeCategory(ITEM_DB[id]),rarity:'common'}));
 if(shopCategory!=='all')entries=entries.filter(x=>(x.category||shopTypeCategory(ITEM_DB[x.id]))===shopCategory);
 if(!entries.some(x=>x.id===shopSelected))shopSelected=entries[0]?.id||'';
 const sel=entries.find(x=>x.id===shopSelected)||entries[0],it=sel?ITEM_DB[sel.id]:null;
 const maxQty=sel?shopMaxQuantity(sel.id,sel.price,tab):1;shopQuantity=Math.max(1,Math.min(shopQuantity,maxQty));
 const cards=entries.length?entries.map(x=>{const a=ITEM_DB[x.id];return `<div class="shopCard ${x.id===shopSelected?'selected':''}" data-shop-select="${x.id}"><div class="shopCardOwned">${inventoryData[x.id]||0}</div><div class="shopCardIcon">${a.icon}</div><div class="shopCardName">${a.name}</div><div class="shopCardPrice">🪙 ${x.price}</div></div>`}).join(''):'<div class="shopEmpty">No items are available in this category.</div>';
 const categories=[['all','▦ ALL'],['food','🍎 FOOD'],['potions','🧪 POTIONS'],['tools','⛏️ TOOLS'],['weapons','⚔️ WEAPONS'],['materials','🍂 MATERIALS']].map(([id,label])=>`<button class="shopCategory ${shopCategory===id?'active':''}" data-shop-category="${id}">${label}</button>`).join('');
 let detail='<div class="shopEmpty">Choose an item to inspect it.</div>';
 if(it){
   const stat=it.heal?`❤️ Restores <span class="shopGood">${it.heal} HP</span>`:it.attack?`⚔️ Attack <span class="shopGood">+${it.attack}</span>`:it.defense?`🛡️ Defense <span class="shopGood">+${it.defense}</span>`:it.type==='tool'?'🧰 Adventuring tool':'📦 Useful adventuring supply';
   const current=it.equip?equipment[it.equip]:null;const currentName=current&&ITEM_DB[current]?ITEM_DB[current].name:'Nothing';
   const buttonWord=tab==='buy'?'BUY':'SELL';
   detail=`<div class="shopDetailTitle">${it.name}</div><div class="shopItemShowcase"><div class="shopItemText"><p>${it.description||sel.label}</p><div class="shopStatBox">${stat}<br>Type: ${it.type||'Item'}<br>Rarity: <b>Common</b></div><div class="shopOwnedLine"><span>Owned</span><span>${inventoryData[sel.id]||0}</span></div></div><div class="shopPreviewIcon">${it.icon}</div></div><div class="shopCompare"><div class="shopCompareBox"><h4>Current Equipment</h4>${it.equip?currentName:'Not equippable'}</div><div class="shopCompareBox"><h4>After Purchase</h4><span class="shopGood">${stat}</span></div></div><div class="shopBuyBox"><div class="shopPriceLine"><span>🪙 PRICE</span><span>${sel.price*shopQuantity}</span></div><div class="shopQty"><button data-shop-qty="-1">−</button><div class="shopQtyValue">${shopQuantity}</div><button data-shop-qty="1">+</button></div><div class="shopBuyButtons"><button data-shop-action="${sel.id}" data-price="${sel.price}" data-qty="${shopQuantity}">${buttonWord} ${shopQuantity}</button><button data-shop-quick="5" data-shop-action="${sel.id}" data-price="${sel.price}">${buttonWord} 5</button><button class="wide" data-shop-max="1" data-shop-action="${sel.id}" data-price="${sel.price}">${buttonWord} MAX (${maxQty})</button></div></div>`;
 }
 const line=tab==='buy'?"Welcome to Oakhaven! I've got everything an adventurer like you might need.":'I pay fair coin for useful goods brought back from the road.';
 panel.innerHTML=`<div class="shopScene"><div class="shopTop"><div class="shopBrand"><div class="shopCrest">🐺</div><div><div class="shopTitle">Oakhaven General Store</div><div class="shopSubtitle">Quality goods for adventurers and travelers.</div></div></div><div class="shopTabs"><button class="shopTab ${tab==='buy'?'active':''}" data-shop-tab="buy">🛒 BUY</button><button class="shopTab ${tab==='sell'?'active':''}" data-shop-tab="sell">SELL</button></div><div class="shopGoldWrap"><div><div class="shopGoldLabel">GOLD</div><div class="shopGold">${inventoryData.gold||0}</div></div><button class="shopClose" id="shopCloseBtn">✕</button></div></div><div class="shopMain"><section class="shopCatalog"><div class="shopCategories">${categories}</div><div class="shopGrid">${cards}</div><div class="shopRarity"><button class="active">ALL</button><button>COMMON</button><button>UNCOMMON</button><button>RARE</button><button>EPIC</button><button>LEGENDARY</button></div></section><section class="shopDetail">${detail}</section></div><div class="shopDialogue"><div class="shopPortrait"><img src="assets/embedded/asset_0048_55efd98bc391807b.png"></div><div><div class="shopSpeechName">Rook</div><div class="shopSpeechRole">Oakhaven Shopkeeper</div><div class="shopSpeechText">${line}</div></div><div class="shopActions"><button class="shopUtility" data-shop-note="Fresh stock arrives every morning.">🔄<br>RESTOCK</button><button class="shopUtility" data-shop-note="Earn reputation to unlock discounts.">🪙<br>DISCOUNT</button><button class="shopUtility" data-shop-note="Repairs will be available later.">⚒️<br>REPAIR</button><button class="shopUtility leave" id="shopLeaveBtn">🚪<br>LEAVE</button></div></div></div>`;
 panel.querySelector('#shopCloseBtn').onclick=()=>panel.style.display='none';const leave=panel.querySelector('#shopLeaveBtn');if(leave)leave.onclick=()=>panel.style.display='none';
 panel.querySelectorAll('[data-shop-tab]').forEach(b=>b.onclick=()=>{shopCategory='all';shopQuantity=1;renderShop(b.dataset.shopTab)});
 panel.querySelectorAll('[data-shop-category]').forEach(b=>b.onclick=()=>{shopCategory=b.dataset.shopCategory;shopQuantity=1;renderShop(tab)});
 panel.querySelectorAll('[data-shop-select]').forEach(r=>r.onclick=()=>{shopSelected=r.dataset.shopSelect;shopQuantity=1;renderShop(tab)});
 panel.querySelectorAll('[data-shop-qty]').forEach(b=>b.onclick=()=>{shopQuantity=Math.max(1,Math.min(maxQty,shopQuantity+Number(b.dataset.shopQty)));renderShop(tab)});
 panel.querySelectorAll('[data-shop-note]').forEach(b=>b.onclick=()=>toast(b.dataset.shopNote));
 panel.querySelectorAll('[data-shop-action]').forEach(a=>a.onclick=()=>{let qty=Number(a.dataset.qty||a.dataset.shopQuick||1);if(a.dataset.shopMax)qty=maxQty;tab==='buy'?shopBuy(a.dataset.shopAction,Number(a.dataset.price),qty):shopSell(a.dataset.shopAction,Number(a.dataset.price),qty)});
}
function openShop(){shopSelected='bread';shopCategory='all';shopQuantity=1;renderShop('buy')}

const STARTER_BANK_ITEMS={
  town_key:1,
  bread:999,
  training_sword:25,
  oak_log:999,
  goblin_ear:999,
  apple:999,
  health_potion:999,
  rusty_dagger:25,
  cracked_shield:25,
  small_emerald:999,
  goblin_map:1,
  chest_key:25
};

let bankData={
  gold:0,
  items:{}
};

function bankableIds(){
  return Object.keys(inventoryData).filter(id=>id!=='town_key' && id!=='gold' && ITEM_DB[id]);
}
function ensureBankItem(id){
  if(!(id in bankData.items)) bankData.items[id]=0;
}
function unlockAllBankItems(){
  Object.keys(ITEM_DB).forEach(id=>{
    if(id==='gold') return;
    ensureBankItem(id);
    const starter=STARTER_BANK_ITEMS[id] ?? 999;
    if(bankData.items[id] < starter) bankData.items[id]=starter;
  });
  if(bankData.gold < 999999) bankData.gold=999999;
}
function depositItem(id,amount=1){
  ensureBankItem(id);
  const available=inventoryData[id]||0;
  const moved=Math.min(amount,available);
  if(moved<=0){toast('You do not have that item.');return}
  inventoryData[id]-=moved;
  bankData.items[id]+=moved;
  renderBank();
  save(false);
}
function withdrawItem(id,amount=1){
  ensureBankItem(id);
  const available=bankData.items[id]||0;
  const moved=Math.min(amount,available);
  if(moved<=0){toast('That item is not in the bank.');return}
  bankData.items[id]-=moved;
  addItem(id,moved);
  renderBank();
  save(false);
}
function depositGold(amount){
  const moved=Math.min(amount,inventoryData.gold||0);
  if(moved<=0){toast('You have no gold to deposit.');return}
  inventoryData.gold-=moved;
  bankData.gold+=moved;
  renderBank();
  save(false);
}
function withdrawGold(amount){
  const moved=Math.min(amount,bankData.gold||0);
  if(moved<=0){toast('There is no gold in the bank.');return}
  bankData.gold-=moved;
  addItem('gold',moved);
  renderBank();
  save(false);
}
function depositAll(){
  bankableIds().forEach(id=>{
    const amount=inventoryData[id]||0;
    if(amount>0){ensureBankItem(id);bankData.items[id]+=amount;inventoryData[id]=0}
  });
  renderBank();save(false);toast('All bankable items deposited.');
}
function withdrawAll(){
  Object.keys(bankData.items).forEach(id=>{
    const available=bankData.items[id]||0;
    if(available>0){
      const amount=Math.min(99,available);
      addItem(id,amount);
      bankData.items[id]-=amount;
    }
  });
  unlockAllBankItems();
  renderBank();
  save(false);
  toast('Withdrew a testing stack of every item.');
}
function itemCard(id,count,side){
  const item=ITEM_DB[id];
  if(!item||count<=0)return '';
  return `<div class="bankItem" data-bank-id="${id}" data-bank-side="${side}">
    <div><div class="icon">${itemArt(item,"invItemArt")}</div><small>${item.name}</small></div>
    <span class="count">x${count}</span>
  </div>`;
}
function renderBank(){
  panel.classList.remove('inventoryPanel','forgePanel');
  panel.classList.add('bankPanel');
  const backpack=bankableIds().map(id=>itemCard(id,inventoryData[id]||0,'inventory')).join('');
  const stored=Object.keys(bankData.items).map(id=>itemCard(id,bankData.items[id]||0,'bank')).join('');
  panel.innerHTML=`
    <div class="bankHeader">
      <h2>Oakhaven Bank — Unlimited Storage</h2>
      <div class="bankBalances">
        <div class="balanceBadge">Pouch 🪙 ${inventoryData.gold||0}</div>
        <div class="balanceBadge">Bank 🏦 ${bankData.gold||0}</div>
      </div>
    </div>
    <div class="bankGrid">
      <section class="bankSection">
        <h3>Backpack</h3>
        <div class="bankItems">${backpack||'<p>No bankable items.</p>'}</div>
        <div class="bankControls">
          <button class="btn" id="depositAllBtn">Deposit All</button>
          <button class="btn" id="depositGoldBtn">Deposit 10 Gold</button>
        </div>
      </section>
      <section class="bankSection">
        <h3>Bank Storage</h3>
        <div class="bankItems">${stored||'<p>The bank is empty.</p>'}</div>
        <div class="bankControls">
          <button class="btn" id="withdrawAllBtn">Withdraw All</button>
          <button class="btn" id="withdrawGoldBtn">Withdraw 1,000 Gold</button>
        </div>
      </section>
    </div>
    <div class="bankMessage">Unlimited storage is enabled. Every current item is stocked in the bank for testing.</div>`;

  panel.querySelectorAll('[data-bank-id]').forEach(el=>{
    el.onclick=()=>{
      const id=el.dataset.bankId;
      if(el.dataset.bankSide==='inventory') depositItem(id,1);
      else withdrawItem(id,1);
    };
  });
  document.getElementById('depositAllBtn').onclick=depositAll;
  document.getElementById('withdrawAllBtn').onclick=withdrawAll;
  document.getElementById('depositGoldBtn').onclick=()=>depositGold(10);
  document.getElementById('withdrawGoldBtn').onclick=()=>withdrawGold(1000);
}
function openBank(){
  panel.dataset.type='bank';
  panel.style.display='block';
  renderBank();
}

const G_IDLE=['goblin_idle_00.png', 'goblin_idle_01.png', 'goblin_idle_02.png', 'goblin_idle_03.png', 'goblin_idle_04.png', 'goblin_idle_05.png', 'goblin_idle_06.png', 'goblin_idle_07.png', 'goblin_idle_08.png', 'goblin_idle_09.png', 'goblin_idle_10.png', 'goblin_idle_11.png'],G_WALK=['goblin_walk_00.png', 'goblin_walk_01.png', 'goblin_walk_02.png', 'goblin_walk_03.png', 'goblin_walk_04.png', 'goblin_walk_05.png', 'goblin_walk_06.png', 'goblin_walk_07.png', 'goblin_walk_08.png', 'goblin_walk_09.png', 'goblin_walk_10.png', 'goblin_walk_11.png', 'goblin_walk_12.png', 'goblin_walk_13.png', 'goblin_walk_14.png', 'goblin_walk_15.png', 'goblin_walk_16.png', 'goblin_walk_17.png', 'goblin_walk_18.png', 'goblin_walk_19.png'],G_ATTACK=['goblin_attack_00.png', 'goblin_attack_01.png', 'goblin_attack_02.png', 'goblin_attack_03.png', 'goblin_attack_04.png', 'goblin_attack_05.png', 'goblin_attack_06.png', 'goblin_attack_07.png', 'goblin_attack_08.png', 'goblin_attack_09.png'],G_HURT=['goblin_hurt_00.png', 'goblin_hurt_01.png', 'goblin_hurt_02.png', 'goblin_hurt_03.png', 'goblin_hurt_04.png', 'goblin_hurt_05.png', 'goblin_hurt_06.png', 'goblin_hurt_07.png', 'goblin_hurt_08.png', 'goblin_hurt_09.png'],G_DIE=['goblin_die_00.png', 'goblin_die_01.png', 'goblin_die_02.png', 'goblin_die_03.png', 'goblin_die_04.png', 'goblin_die_05.png', 'goblin_die_06.png', 'goblin_die_07.png', 'goblin_die_08.png', 'goblin_die_09.png'];
const BG_IDLE={
 down:['assets/goblins/basic/idle_down.png'],
 up:['assets/goblins/basic/idle_up.png'],
 left:['assets/goblins/basic/idle_left.png'],
 right:['assets/goblins/basic/idle_right.png']
};
const BG_WALK={
 down:[1,2,3,4].map(n=>`assets/goblins/basic/walk_down_${n}.png`),
 up:[1,2,3,4].map(n=>`assets/goblins/basic/walk_up_${n}.png`),
 left:[1,2,3,4].map(n=>`assets/goblins/basic/walk_left_${n}.png`),
 right:[1,2,3,4].map(n=>`assets/goblins/basic/walk_right_${n}.png`)
};
const BG_ATTACK={
 down:[1,2,3,4].map(n=>`assets/goblins/basic/attack_down_${n}.png`),
 up:[1,2,3,4].map(n=>`assets/goblins/basic/attack_up_${n}.png`),
 left:[1,2,3,4].map(n=>`assets/goblins/basic/attack_left_${n}.png`),
 right:[1,2,3,4].map(n=>`assets/goblins/basic/attack_right_${n}.png`)
};
const BG_HURT={
 down:[1,2,3,4].map(n=>`assets/goblins/basic/hurt_down_${n}.png`),
 up:[1,2,3,4].map(n=>`assets/goblins/basic/hurt_up_${n}.png`),
 left:[1,2,3,4].map(n=>`assets/goblins/basic/hurt_left_${n}.png`),
 right:[1,2,3,4].map(n=>`assets/goblins/basic/hurt_right_${n}.png`)
};
const BG_DIE={
 down:[1,2,3,4].map(n=>`assets/goblins/basic/death_down_${n}.png`),
 up:[1,2,3,4].map(n=>`assets/goblins/basic/death_up_${n}.png`),
 left:[1,2,3,4].map(n=>`assets/goblins/basic/death_left_${n}.png`),
 right:[1,2,3,4].map(n=>`assets/goblins/basic/death_right_${n}.png`)
};
const S_IDLE=['assets/goblins/scout/idle_left.png','assets/goblins/scout/idle_right.png'];
const S_WALK_LEFT=[1,2,3,4,5,6].map(n=>`assets/goblins/scout/walk_left_${n}.png`);
const S_WALK_RIGHT=[1,2,3,4,5,6].map(n=>`assets/goblins/scout/walk_right_${n}.png`);
const S_ATTACK=[1,2,3,4,5,6].map(n=>`assets/goblins/scout/attack_${n}.png`);
const S_HURT=[1,2,3,4,5,6].map(n=>`assets/goblins/scout/hurt_${n}.png`);
const S_DIE=[1,2,3,4,5,6].map(n=>`assets/goblins/scout/death_${n}.png`);
const GD_IDLE_LEFT=['assets/goblins/guard/idle_left.png'];
const GD_IDLE_RIGHT=['assets/goblins/guard/idle_right.png'];
const GD_WALK_LEFT=[1,2,3,4,5,6,7].map(n=>`assets/goblins/guard/left_${n}.png`);
const GD_WALK_RIGHT=[1,2,3,4,5,6,7].map(n=>`assets/goblins/guard/right_${n}.png`);
const GD_ATTACK=[1,2,3,4,5,6,7].map(n=>`assets/goblins/guard/attack_${n}.png`);
const GD_HURT=[1,2,3,4,5,6,7].map(n=>`assets/goblins/guard/hurt_${n}.png`);
const GD_DIE=[1,2,3,4,5,6,7].map(n=>`assets/goblins/guard/death_${n}.png`);
const B_IDLE=['assets/goblins/brute_original/brute_clean_move.png'];
const B_WALK_DOWN=['assets/goblins/brute_original/brute_clean_move.png'];
const B_WALK_UP=['assets/goblins/brute_original/brute_clean_move.png'];
const B_WALK_LEFT=['assets/goblins/brute_original/brute_clean_move.png'];
const B_WALK_RIGHT=['assets/goblins/brute_original/brute_clean_move.png'];
const B_ATTACK=[1,2,3,4,5,6,7].map(n=>`assets/goblins/brute_original/attack_${n}.png`);
const B_HURT=[1,2,3,4,5,6,7].map(n=>`assets/goblins/brute_original/hurt_${n}.png`);
const B_DIE=[1,2,3,4,5,6,7].map(n=>`assets/goblins/brute_original/death_${n}.png`);
const goblins=[...document.querySelectorAll('.goblin')].map((el,i)=>{
 const label=(el.querySelector('.goblinLabel')?.textContent||el.textContent||'').trim();
 return ({
 el,img:el.querySelector('img'),bar:el.querySelector('.ghp div'),
 x:parseFloat(el.style.left),y:parseFloat(el.style.top),homeX:parseFloat(el.style.left),homeY:parseFloat(el.style.top),
 maxHp:Number(el.dataset.maxHp)||60,
 hp:Number(el.dataset.maxHp)||60,
 damage:Number(el.dataset.damage)||6,
 xpReward:Number(el.dataset.xp)||25,
 respawnDelay:Number(el.dataset.respawn)||3000,
 isBrute:el.dataset.brute==='1',
 isBoar:el.classList.contains('direBoar'),
 isScout:/Goblin Scout/i.test(label),
 isGuard:/Goblin Guard/i.test(label),
 isBasic:/^Goblin$/i.test(label),
 dead:false,state:'idle',frame:i%G_IDLE.length,last:0,attackAt:0,lastPlayerHit:0,dir:i%2?1:-1,deathHidden:false,respawnQueued:false,
 patrolAngle:Math.random()*Math.PI*2,patrolUntil:0,patrolPause:0,
 zoneSlot:i
})});
goblins.forEach(g=>{
 if(g.isBoar){
   g.img.style.width='138px';g.img.style.height='102px';g.img.style.objectFit='contain';
   g.img.style.position='absolute';g.img.style.left='50%';g.img.style.bottom='0';
   g.img.style.transform='translateX(-50%)';g.img.style.maxWidth='none';g.img.style.maxHeight='none';
   g.patrolRadius=105;
 }
 if(g.isBrute){
   g.img.style.width='144px';
   g.img.style.height='144px';
   g.img.style.objectFit='contain';
   g.img.style.position='absolute';
   g.img.style.left='50%';
   g.img.style.bottom='0px';
   g.img.style.transform='translateX(-50%)';
   g.img.style.maxWidth='none';
   g.img.style.maxHeight='none';
   g.img.style.transition='none';
 }
 if(g.isBasic){
   g.img.style.width='96px';
   g.img.style.height='96px';
   g.img.style.objectFit='contain';
   g.img.style.position='absolute';
   g.img.style.left='50%';
   g.img.style.bottom='0';
   g.img.style.transform='translateX(-50%)';
   g.img.style.maxWidth='none';
   g.img.style.maxHeight='none';
 }
 if(g.isScout||g.isGuard){
   g.img.style.width='128px';
   g.img.style.height='128px';
   g.img.style.objectFit='contain';
   g.img.style.position='absolute';
   g.img.style.left='50%';
   g.img.style.bottom='0';
   g.img.style.transform='translateX(-50%)';
   g.img.style.maxWidth='none';
   g.img.style.maxHeight='none';
 }
});
// Dedicated Westwood patrol zones keep enemy classes separated.
const WESTWOOD_PATROL_ZONES={
 basic:[
   {x:300,y:360,r:72},{x:760,y:370,r:72},{x:290,y:200,r:68},{x:760,y:190,r:68}
 ],
 scout:[
   {x:430,y:380,r:78},{x:330,y:250,r:72},{x:610,y:390,r:76},{x:710,y:250,r:70}
 ],
 guard:[
   {x:565,y:285,r:62},{x:455,y:215,r:58},{x:680,y:325,r:58}
 ],
 brute:[
   {x:235,y:430,r:48}
 ]
};

function assignGoblinPatrolZones(){
  let xi=0,si=0,gi=0,bi=0;
  goblins.forEach(g=>{
    let zone=null;
    if(g.isBrute){
      zone=WESTWOOD_PATROL_ZONES.brute[bi++%WESTWOOD_PATROL_ZONES.brute.length];
    }else if(g.isGuard){
      zone=WESTWOOD_PATROL_ZONES.guard[gi++%WESTWOOD_PATROL_ZONES.guard.length];
    }else if(g.isScout){
      zone=WESTWOOD_PATROL_ZONES.scout[si++%WESTWOOD_PATROL_ZONES.scout.length];
    }else if(g.isBasic){
      zone=WESTWOOD_PATROL_ZONES.basic[xi++%WESTWOOD_PATROL_ZONES.basic.length];
    }
    if(zone && g.el.closest('#forestWorld')){
      g.homeX=zone.x;
      g.homeY=zone.y;
      g.patrolRadius=zone.r;
      g.x=zone.x;
      g.y=zone.y;
      g.el.style.left=g.x+'px';
      g.el.style.top=g.y+'px';
    }
  });
}
assignGoblinPatrolZones();

let goblinKills=0,logs=0;

// v8.46 — Tusks on the Trail
let boarQuestState={accepted:false,kills:0,claimed:false};
try{
  boarQuestState=Object.assign(boarQuestState,JSON.parse(localStorage.getItem('valvondor_boar_quest')||'{}'));
}catch(e){}
function updateBoarQuestMarker(){
 const m=document.querySelector('.boarQuestNpc .questMark');
 if(!m)return;
 m.textContent=boarQuestState.claimed?'✓':boarQuestState.accepted?'?':'!';
}
function saveBoarQuest(){localStorage.setItem('valvondor_boar_quest',JSON.stringify(boarQuestState));updateBoarQuestMarker();}
function boarQuestProgress(){
  if(!boarQuestState.accepted)return 'Not started';
  if(boarQuestState.claimed)return 'Completed';
  return `${Math.min(3,boarQuestState.kills)}/3 Dire Boars · ${(inventoryData.boar_tusk||0)>0?'1/1':'0/1'} Boar Tusk`;
}
function refreshQuestPanelIfOpen(){if(panel&&panel.style.display==='block'&&panel.dataset.type==='quests')showPanel('quests'),showPanel('quests');}
function boarQuestReady(){
  return boarQuestState.accepted && boarQuestState.kills>=3 && (inventoryData.boar_tusk||0)>0 && !boarQuestState.claimed;
}
function openBoarQuestDialog(){
  // v8.71 save repair: if an older/broken build recorded all 3 kills but no quest tusk,
  // grant the proof item now so the player is never soft-locked.
  if(boarQuestState.accepted && !boarQuestState.claimed && boarQuestState.kills>=3 && (inventoryData.boar_tusk||0)<=0){
    addItem('boar_tusk',1);
    saveBoarQuest();
    save(false);
    toast('🦷 Kael quest repair: Boar Tusk restored.');
  }
  const dlg=document.getElementById('boarQuestDialog');
  const text=document.getElementById('boarQuestDialogText');
  const prog=document.getElementById('boarQuestDialogProgress');
  const action=document.getElementById('boarQuestAction');
  if(!dlg||!text||!prog||!action)return;

  if(!boarQuestState.accepted){
    text.textContent='Dire Boars have started pushing closer to the Westwood trails. Thin the herd and bring me a tusk as proof.';
    prog.textContent='Objective: Defeat 3 Dire Boars · Bring 1 Boar Tusk';
    action.textContent='ACCEPT QUEST';
    action.disabled=false;
  }else if(boarQuestState.claimed){
    text.textContent='Westwood is safer because of you. Keep your eyes open—there will be larger hunts ahead.';
    prog.textContent='QUEST COMPLETE ✓';
    action.textContent='CLOSE';
    action.disabled=false;
  }else{
    text.textContent=boarQuestReady()?'You have everything I asked for. Ready to turn it in?':'Keep hunting. Come back when the trail is clear and you have a tusk.';
    prog.textContent='Dire Boars: '+Math.min(3,boarQuestState.kills)+'/3 · Boar Tusk: '+((inventoryData.boar_tusk||0)>0?'1/1':'0/1');
    action.textContent=boarQuestReady()?'TURN IN QUEST':'KEEP HUNTING';
    action.disabled=false;
  }
  dlg.classList.add('open');dlg.setAttribute('aria-hidden','false');
}
function closeBoarQuestDialog(){
  const dlg=document.getElementById('boarQuestDialog');
  if(dlg){dlg.classList.remove('open');dlg.setAttribute('aria-hidden','true')}
}
function talkBoarHunter(){
  openBoarQuestDialog();
}


function facingDirForGoblin(g){
 if(g.faceDir)return g.faceDir;
 return g.dir<0?'left':'right';
}
const WOLF_KNIGHT_MINING=[1,2,3,4,5,6,7,8].map(n=>`assets/player_wolf_knight_male/mining/mine_${n}.png`);
const BOAR_IDLE=['assets/dire_boar/idle_1.png'];
const BOAR_WALK=['assets/dire_boar/walk_1.png'];
const BOAR_ATTACK=[1,2,3,4,5].map(n=>`assets/dire_boar/attack_${n}.png`);
const BOAR_HURT=[1,2,3,4,5].map(n=>`assets/dire_boar/hurt_${n}.png`);
const BOAR_DIE=[1,2,3,4,5].map(n=>`assets/dire_boar/death_${n}.png`);

function gFrames(g){
 if(g.isBoar){
   if(g.state==='walk')return BOAR_WALK;
   if(g.state==='attack')return BOAR_ATTACK;
   if(g.state==='hurt')return BOAR_HURT;
   if(g.state==='die')return BOAR_DIE;
   return BOAR_IDLE;
 }

 if(g.isBrute){
   if(g.state==='walk'||g.state==='idle')return B_IDLE;
   return g.state==='attack'?B_ATTACK:g.state==='hurt'?B_HURT:g.state==='die'?B_DIE:B_IDLE;
 }
 if(g.isBasic){
   const d=facingDirForGoblin(g);
   if(g.state==='walk')return BG_WALK[d];
   if(g.state==='attack')return BG_ATTACK[d];
   if(g.state==='hurt')return BG_HURT[d];
   if(g.state==='die')return BG_DIE[d];
   return BG_IDLE[d];
 }
 if(g.isGuard){
   if(g.state==='walk')return g.dir<0?GD_WALK_LEFT:GD_WALK_RIGHT;
   if(g.state==='attack')return GD_ATTACK;
   if(g.state==='hurt')return GD_HURT;
   if(g.state==='die')return GD_DIE;
   return g.dir<0?GD_IDLE_LEFT:GD_IDLE_RIGHT;
 }
 if(g.isScout){
   if(g.state==='walk')return g.dir<0?S_WALK_LEFT:S_WALK_RIGHT;
   if(g.state==='attack')return S_ATTACK;
   if(g.state==='hurt')return S_HURT;
   if(g.state==='die')return S_DIE;
   return [g.dir<0?S_IDLE[0]:S_IDLE[1]];
 }
 return g.state==='walk'?G_WALK:g.state==='attack'?G_ATTACK:g.state==='hurt'?G_HURT:g.state==='die'?G_DIE:G_IDLE
}

function isOnKingsRoad(x=pos.x,y=pos.y){
  return currentArea==='town' && x>=0 && x<=1120 && y>=1115 && y<=1280;
}
function sendGoblinHome(g){
  g.state='walk';
  const dx=g.homeX-g.x,dy=g.homeY-g.y,d=Math.hypot(dx,dy)||1;
  if(d>4){g.x+=dx/d*1.1;g.y+=dy/d*1.1;g.el.style.left=g.x+'px';g.el.style.top=g.y+'px'}
  else{g.x=g.homeX;g.y=g.homeY;g.state='idle'}
}

function patrolGoblin(g,now){
  const radius=g.patrolRadius || (g.isBrute?54:g.isGuard?62:78);
  const distHome=Math.hypot(g.x-g.homeX,g.y-g.homeY);

  // Hard return if somehow pushed out of assigned patrol zone.
  if(distHome>radius+10){
    const dx=g.homeX-g.x,dy=g.homeY-g.y,d=Math.hypot(dx,dy)||1;
    g.state='walk';
    g.dir=dx<0?-1:1;g.faceDir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
    const sp=g.isBrute?.48:g.isGuard?.56:.66;
    g.x+=dx/d*sp;
    g.y+=dy/d*sp;
    g.el.style.left=g.x+'px';
    g.el.style.top=g.y+'px';
    return;
  }

  if(now<(g.patrolPause||0)){
    g.state='idle';
    return;
  }

  if(now>(g.patrolUntil||0)){
    // Bias each route around its assigned center instead of crossing the whole camp.
    g.patrolAngle=Math.random()*Math.PI*2;
    g.patrolUntil=now+1000+Math.random()*1500;
    g.patrolPause=g.patrolUntil+450+Math.random()*850;
  }

  g.state='walk';
  const sp=g.isBrute?.40:g.isGuard?.44:.56;
  const dx=Math.cos(g.patrolAngle),dy=Math.sin(g.patrolAngle);
  const nx=g.x+dx*sp,ny=g.y+dy*sp;

  if(Math.hypot(nx-g.homeX,ny-g.homeY)<=radius){
    g.x=nx;
    g.y=ny;
    g.dir=dx<0?-1:1;g.faceDir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
  }else{
    // Turn inward when touching the edge of the patrol zone.
    const hx=g.homeX-g.x,hy=g.homeY-g.y;
    g.patrolAngle=Math.atan2(hy,hx)+(Math.random()-.5)*.5;
  }

  g.el.style.left=g.x+'px';
  g.el.style.top=g.y+'px';
}


function scaledEnemyDamage(g){
  const base=Math.max(1,Number(g?.damage)||6);
  const lvl=Math.max(1,Number(playerLevel)||1);
  const levelMitigation=Math.min(.92,(lvl-1)*.0095);
  let dmg=Math.max(1,Math.round(base*(1-levelMitigation)));

  // Equipment defense reduces incoming damage after level mitigation.
  dmg=Math.max(1,dmg-getDefenseBonus());

  // Shields can completely block a hit.
  if(getBlockChance()>0 && Math.random()*100<getBlockChance())return 0;

  if(g?.isBrute && lvl>=80)dmg=1;
  if(!g?.isBrute && lvl>=80)dmg=1;
  return dmg;
}

function resolveGoblinOverlaps(){
  const active=goblins.filter(g=>{
    if(g.dead||g.editorDisabled||!g.el.isConnected||g.el.style.display==='none')return false;
    const inForest=!!g.el.closest('#forestWorld');
    return (currentArea==='forest')===inForest;
  });

  // Several passes make the separation settle even when 3+ enemies are stacked.
  for(let pass=0;pass<5;pass++){
    for(let i=0;i<active.length;i++){
      for(let j=i+1;j<active.length;j++){
        const a=active[i],b=active[j];

        const ax=a.x+(a.isBrute?64:47), ay=a.y+(a.isBrute?92:75);
        const bx=b.x+(b.isBrute?64:47), by=b.y+(b.isBrute?92:75);

        let dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy);

        // Physical spacing by enemy size.
        const ar=a.isBrute?72:a.isGuard?54:48;
        const br=b.isBrute?72:b.isGuard?54:48;
        const minDist=ar+br+14;

        if(d>=minDist)continue;

        if(d<0.01){
          // Stable deterministic direction when two spawn on exactly the same pixel.
          const angle=((i+1)*1.73+(j+1)*2.11);
          dx=Math.cos(angle);dy=Math.sin(angle);d=1;
        }

        const overlap=(minDist-d);
        const nx=dx/d,ny=dy/d;

        // Brute is heavier, so smaller enemies move more.
        const aWeight=a.isBrute?.28:b.isBrute?.72:.5;
        const bWeight=1-aWeight;

        a.x-=nx*overlap*aWeight;
        a.y-=ny*overlap*aWeight;
        b.x+=nx*overlap*bWeight;
        b.y+=ny*overlap*bWeight;

        // Keep patrolers reasonably close to their own camp homes.
        const clampHome=(g)=>{
          const max=(g.patrolRadius||80)+8;
          const hx=g.x-g.homeX,hy=g.y-g.homeY,hd=Math.hypot(hx,hy);
          if(hd>max){
            g.x=g.homeX+hx/hd*max;
            g.y=g.homeY+hy/hd*max;
          }
        };
        clampHome(a);clampHome(b);
      }
    }
  }

  active.forEach(g=>{
    g.el.style.left=g.x+'px';
    g.el.style.top=g.y+'px';
  });
}

function updateGoblins(now){
 // Safe interiors and mines fully pause all overworld/forest goblin AI and damage.
 if(currentArea==='mine'||currentArea==='shop'||currentArea==='chieftainDungeon')return;
 goblins.forEach((g,i)=>{
  if(g.editorDisabled || !g.el.isConnected || g.el.style.display==='none') return;
  if(editorMode && g.el.closest('#forestWorld')) return;
  const belongsToForest=!!g.el.closest('#forestWorld');
  if((currentArea==='forest')!==belongsToForest)return;
  if(g.dead){
    if(g.state!=='die'){g.state='die';g.frame=0}
  } else {
    const centerX=g.x+(g.isBoar?71:(g.isBrute?64:47)),centerY=g.y+(g.isBoar?72:(g.isBrute?92:75));
    let dx=pos.x-centerX,dy=pos.y-centerY,dist=Math.hypot(dx,dy);
    const playerSafe=currentArea==='town'&&isOnKingsRoad();
    const goblinOnRoad=currentArea==='town'&&isOnKingsRoad(g.x+47,g.y+75);
    const outleveled=(playerLevel>=80 && !g.isBrute);
    if(playerSafe || goblinOnRoad){
      // The King's Road is protected. Goblins disengage and return to camp.
      sendGoblinHome(g);
    } else if(outleveled){
      // High-level players are ignored, but goblins still patrol naturally.
      patrolGoblin(g,now);
    } else if(dist<(g.isBoar?255:(g.isBrute?285:230))){
      if(dist>(g.isBoar?82:(g.isBrute?88:72))){
        g.state='walk';g.dir=dx<0?-1:1;g.faceDir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
        let sp=g.isBoar?.82:g.isBrute?.52:g.isGuard?.66:.75;
        const nxv=dx/dist,nyv=dy/dist;
        g.x+=nxv*sp;
        g.y+=nyv*sp;g.el.style.left=g.x+'px';g.el.style.top=g.y+'px';
      } else {
        g.state='attack';
        const swingDelay=g.isBoar?1400:g.isBrute?1450:1200;
        if(now-g.attackAt>swingDelay){g.attackAt=now;const incoming=scaledEnemyDamage(g);
          if(incoming===0){toast('🛡️ Blocked! Your shield stopped the attack.');}
          else{hp=Math.max(0,hp-incoming);hpBar.style.width=(hp/playerMaxHP()*100)+'%';toast((g.isBoar?'The Dire Boar':g.isBrute?'The Goblin Brute':'A goblin')+' hit you for '+incoming+' damage!');}if(hp<=0){dead=true;locked=true;setAnimation('dead',true)}}
      }
    } else {
      if(g.isBasic||g.isScout||g.isGuard||g.isBoar)patrolGoblin(g,now);
      else{
        g.state='idle';
        if(Math.abs(g.x-g.homeX)>80){g.x+=(g.homeX-g.x)*.01;g.y+=(g.homeY-g.y)*.01;g.el.style.left=g.x+'px';g.el.style.top=g.y+'px'}
      }
    }
  }
  let frames=gFrames(g),delay=g.isScout?(g.state==='attack'?125:g.state==='walk'?135:g.state==='hurt'?140:g.state==='die'?165:220):g.isGuard?(g.state==='attack'?135:g.state==='walk'?145:g.state==='hurt'?150:g.state==='die'?175:230):g.isBrute?(g.state==='attack'?150:g.state==='walk'?250:g.state==='hurt'?160:g.state==='die'?190:275):g.isBasic?(g.state==='attack'?115:g.state==='walk'?125:g.state==='hurt'?130:g.state==='die'?165:210):(g.state==='attack'?110:150);
  if(now-g.last>delay){g.frame++;if(g.frame>=frames.length){if(g.state==='die') g.frame=frames.length-1;else g.frame=0}g.img.src=(g.isBrute||g.isScout||g.isGuard||g.isBasic||g.isBoar)?frames[g.frame]:'assets/'+frames[g.frame];
    g.last=now}
 });
 resolveGoblinOverlaps();
}


function respawnGoblin(g){
  if(g.respawnQueued) return;
  g.respawnQueued=true;

  // Let the death animation finish, then hide the corpse once.
  setTimeout(()=>{
    if(g.dead){
      g.el.style.display='none';
      g.deathHidden=true;
    }
  },900);

  // Respawn cleanly after 2.5–3.5 seconds.
  setTimeout(()=>{
    g.hp=g.maxHp||60;
    g.dead=false;
    g.state='idle';
    g.frame=0;
    g.last=0;
    g.lastPlayerHit=0;
    g.deathHidden=false;
    g.respawnQueued=false;
    g.x=g.homeX+(Math.random()*50-25);
    g.y=g.homeY+(Math.random()*50-25);
    g.el.style.left=g.x+'px';
    g.el.style.top=g.y+'px';
    g.bar.style.width='100%';
    g.el.style.display='block';
  },(g.respawnDelay||3000)+Math.random()*1000);
}


function rollGoblinLoot(){
  const drops=[
    {id:'gold',amount:8+Math.floor(Math.random()*13),chance:1},
    {id:'goblin_ear',amount:1,chance:0.85},
    {id:'oak_log',amount:1,chance:0.25},
    {id:'apple',amount:1,chance:0.18},
    {id:'bread',amount:1,chance:0.12},
    {id:'health_potion',amount:1,chance:0.06},

    // Gear drops
    {id:'rusty_dagger',amount:1,chance:0.08},
    {id:'cracked_shield',amount:1,chance:0.05},
    {id:'goblin_shiv',amount:1,chance:0.03},

    // Rare utility drops
    {id:'small_emerald',amount:1,chance:0.012},
    {id:'goblin_map',amount:1,chance:0.008},
    {id:'chest_key',amount:1,chance:0.006}
  ];
  return drops.filter(d=>Math.random()<d.chance);
}

function createGoblinLoot(g){
  if(g?.isBoar){
    const drops=[];
    if(Math.random()<0.60)drops.push({id:'raw_boar_meat',amount:1});
    if(Math.random()<0.35)drops.push({id:'boar_hide',amount:1});
    if(Math.random()<0.80)drops.push({id:'gold',amount:10+Math.floor(Math.random()*26)});
    if(Math.random()<0.15)drops.push({id:'boar_tusk',amount:1});
    if(!drops.length)drops.push({id:'raw_boar_meat',amount:1});
    const gained=[];
    drops.forEach(drop=>{
      addItem(drop.id,drop.amount);
      const item=ITEM_DB[drop.id];
      gained.push(drop.id==='gold'?`+${drop.amount} Bronze`:`+${drop.amount} ${item?item.name:drop.id}`);
    });
    showLootPopup(gained.join('  '),g.x,g.y);
    save(false);
    toast('🐗 Dire Boar loot: '+gained.join(', '));
    return gained;
  }
  const drops=rollGoblinLoot();

  // Goblin Fang Ring: Epic drop. 1% from regular goblins, 4% from the Brute.
  if(Math.random()<(g?.isBrute?0.04:0.01))drops.push({id:'goblin_fang_ring',amount:1});

  if(g?.isBrute){
    drops.push({id:'gold',amount:35+Math.floor(Math.random()*26)});
    drops.push({id:'goblin_ear',amount:2});
    if(Math.random()<0.35)drops.push({id:'health_potion',amount:1});
  }
  if(!drops.length) drops.push({id:'gold',amount:2});

  // Auto-loot: immediately move every drop into the player's inventory.
  const gained=[];
  drops.forEach(drop=>{
    addItem(drop.id,drop.amount);
    const item=ITEM_DB[drop.id];
    const gearDrop=item?.equip;
    gained.push(drop.id==='gold'?`+${drop.amount} Bronze`:`+${drop.amount} ${item ? item.name : drop.id}`);
    if(gearDrop) setTimeout(()=>toast('✨ Gear drop: '+item.name+'!'),150);
  });

  showLootPopup(gained.join('  '),g.x,g.y);
  save(false);
  toast('Auto-loot: '+gained.join(', '));
  return gained;
}

function hitGoblin(){
  let best=null;
  let bestScore=Infinity;

  goblins.forEach(g=>{
    if(g.dead) return;

    const gx=g.x+(g.isBoar?71:(g.isBrute?64:47));
    const gy=g.y+(g.isBoar?72:(g.isBrute?88:72));
    const dx=gx-pos.x;
    const dy=gy-pos.y;
    const dist=Math.hypot(dx,dy);

    // Brute has a larger body/hitbox; give the sword a generous contact radius.
    if(dist>(g.isBoar?185:(g.isBrute?230:155))) return;

    // Prefer enemies in front of the player, but still allow close side hits.
    const inFront=(facing>0 && dx>-25) || (facing<0 && dx<25);
    const score=dist + (inFront?0:45);

    if(score<bestScore){
      bestScore=score;
      best=g;
    }
  });

  if(!best){
    toast('Your attack missed.');
    return;
  }

  const now=performance.now();
  if(now-best.lastPlayerHit<350) return;
  best.lastPlayerHit=now;

  const testBoost=(playerLevel>=99?40:0);
  const critChance=getCritChance();
  const critical=Math.random()*100<critChance;
  const baseHit=(25+getAttackBonus()*2+testBoost);
  const dealt=critical?Math.round(baseHit*1.5):baseHit;
  best.hp-=dealt;
  best.hp=Math.max(0,best.hp);
  best.bar.style.width=Math.max(0,Math.min(100,best.hp/(best.maxHp||60)*100))+'%';
  best.state='hurt';
  best.frame=0;
  best.last=0;

  if(best.hp<=0){
    best.dead=true;
    if(!best.isBoar)goblinKills++;
    else if(boarQuestState.accepted&&!boarQuestState.claimed){
      boarQuestState.kills=Math.min(3,boarQuestState.kills+1);
      if(boarQuestState.kills>=3 && (inventoryData.boar_tusk||0)<=0){
        addItem('boar_tusk',1);
        setTimeout(()=>toast('🦷 Quest drop: Boar Tusk acquired!'),500);
      }
      saveBoarQuest();save(false);
      setTimeout(()=>toast('📜 Tusks on the Trail: '+boarQuestProgress()),900);
    }
    respawnGoblin(best);

    setTimeout(()=>createGoblinLoot(best),700);

    const reward=best.xpReward||25;gainXP(reward);tutorialProgress('combat');toast((best.isBoar?'Dire Boar defeated!':best.isBrute?'Goblin Brute defeated!':'Goblin defeated!')+' +'+reward+' XP  Auto-looting...');
  }else{
    toast((critical?'CRITICAL! ':'')+(best.isBoar?'Dire Boar':best.isBrute?'Goblin Brute':'Goblin')+' hit for '+dealt+'! '+best.hp+' HP left.');
  }
}

const originalAttack=attack;
attack=function(){
  if(dead||locked) return;
  originalAttack();

  // Check twice during the swing so the hit is not lost to animation timing.
  setTimeout(hitGoblin,90);
  setTimeout(hitGoblin,230);
};



// ---------- v0.4: Living Town + Expanded World ----------
const dayTint=document.getElementById('dayTint');
const worldTime=document.getElementById('worldTime');
let townClock=7.25; // 7:15 AM
let townDay=1;
let lastClockTick=performance.now();

function updateTownClock(now){
  if(now-lastClockTick<1000) return;
  const elapsed=(now-lastClockTick)/1000;
  lastClockTick=now;
  townClock+=elapsed*0.018; // about one game day every 22 minutes
  if(townClock>=24){townClock-=24;townDay++}
  const h=Math.floor(townClock),m=Math.floor((townClock-h)*60);
  let phase='Night',icon='🌙',shade='rgba(22,34,78,.50)';
  if(h>=5&&h<8){phase='Dawn';icon='🌅';shade='rgba(75,55,78,.20)'}
  else if(h>=8&&h<12){phase='Morning';icon='☀️';shade='rgba(18,28,70,0)'}
  else if(h>=12&&h<17){phase='Afternoon';icon='☀️';shade='rgba(18,28,70,0)'}
  else if(h>=17&&h<20){phase='Sunset';icon='🌇';shade='rgba(92,45,48,.22)'}
  else if(h>=20||h<5){phase='Night';icon='🌙';shade='rgba(22,34,78,.50)'}
  dayTint.style.background=shade;
  worldTime.textContent=`${icon} ${phase} · Day ${townDay} · ${String(((h+11)%12)+1).padStart(2,'0')}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
}

const AMBIENT_NPCS=[
  {name:'Mira',img:'embedded/asset_0050_034a60a73aeccea2.png',talk:'Beautiful weather for a walk around the fountain.',points:[[1550,865],[1650,960],[1800,1000],[1950,960],[2040,865],[1950,760],[1800,930]]},
  {name:'Tomas',img:'embedded/asset_0051_a01fd0b61aeca902.png',talk:'The fields south of town will need helping hands soon.',points:[[1800,1160],[1800,1320],[1800,1480],[1600,1560],[1400,1660],[1600,1760],[1800,1600]]},
  {name:'Eldric',img:'embedded/asset_0048_55efd98bc391807b.png',talk:'I hear the General Store has fresh stock every morning.',points:[[2100,785],[2200,850],[2100,930],[1950,920],[1880,840],[2000,760]]},
  {name:'Rook',img:'embedded/asset_0020_8c11b7520f1367b9.png',talk:'Keep your weapon ready near the western road.',points:[[1870,170],[1800,300],[1680,470],[1500,620],[1250,760],[1050,820],[1250,860]]},
  {name:'Lina',img:'embedded/asset_0049_b8045d80263965a0.png',talk:'The Wolf Inn serves hot bread after sunset.',points:[[1450,1085],[1550,1050],[1650,1020],[1550,950],[1450,970],[1380,1040]]}
];

const ambientNpcs=AMBIENT_NPCS.map((cfg,i)=>{
  const el=document.createElement('div');
  el.className='npc ambientNpc';
  el.dataset.talk=cfg.talk;
  el.innerHTML=`<img src="assets/${cfg.img}"><span>${cfg.name}</span>`;
  world.appendChild(el);
  const p=cfg.points[0];
  el.style.left=p[0]+'px';el.style.top=p[1]+'px';
  return {cfg,el,x:p[0],y:p[1],target:1,pause:400+i*220,last:performance.now()};
});

function updateAmbientNpcs(now){
  ambientNpcs.forEach(n=>{
    if(now<n.pause){n.el.classList.remove('walking');return}
    const target=n.cfg.points[n.target];
    const dx=target[0]-n.x,dy=target[1]-n.y,dist=Math.hypot(dx,dy);
    if(dist<5){
      n.x=target[0];n.y=target[1];
      n.target=(n.target+1)%n.cfg.points.length;
      n.pause=now+900+Math.random()*1700;
      n.el.classList.remove('walking');
    }else{
      const sp=.48;
      n.x+=dx/dist*sp;n.y+=dy/dist*sp;
      n.el.classList.add('walking');
      n.el.querySelector('img').style.transform=dx<0?'scaleX(-1)':'';
    }
    n.el.style.left=n.x+'px';n.el.style.top=n.y+'px';
  });
}


// Kael Ashfang — Dire Boar quest giver.
const boarHunter=document.createElement('div');
boarHunter.className='npc ambientNpc boarQuestNpc';
boarHunter.dataset.id='boar_hunter';
boarHunter.dataset.talk='Tusks on the Trail';
boarHunter.innerHTML=`<img src="assets/player_wolf_knight_male/v2/idle_down_1.png"><span>Kael Ashfang</span><small class="questMark">!</small>`;
boarHunter.style.left='1010px';boarHunter.style.top='620px';
document.getElementById('forestWorld')?.appendChild(boarHunter);

function directKaelInteract(){
  if(currentArea!=='forest'||!boarHunter||!boarHunter.isConnected)return false;
  const bx=parseFloat(boarHunter.style.left||0)+90;
  const by=parseFloat(boarHunter.style.top||0)+120;
  if(Math.hypot(pos.x-bx,pos.y-by)<=300){talkBoarHunter();return true}
  return false;
}




function kaelDistance(){
  if(currentArea!=='forest'||!boarHunter||!boarHunter.isConnected)return Infinity;
  const bx=parseFloat(boarHunter.style.left||0)+90;
  const by=parseFloat(boarHunter.style.top||0)+125;
  return Math.hypot(pos.x-bx,pos.y-by);
}
function tryKaelInteract(){
  if(currentArea!=='forest')return false;
  const d=kaelDistance();
  if(d<=280){
    talkBoarHunter();
    return true;
  }
  return false;
}

updateBoarQuestMarker();
boarHunter.onclick=(e)=>{
  if(e){e.preventDefault();e.stopPropagation();}
  if(currentArea!=='forest')return;
  const bx=parseFloat(boarHunter.style.left||0)+90;
  const by=parseFloat(boarHunter.style.top||0)+120;
  const d=Math.hypot(pos.x-bx,pos.y-by);
  if(d<=300){talkBoarHunter();return;}
  moveTarget={x:bx,y:by+45};toast('Walking to Kael Ashfang...');
};

// Small roadside details placed beside paths and districts.
[
 ['assets/embedded/asset_0101_78924c802f17041f.png',1080,760,42],['assets/embedded/asset_0102_8e0b3ac0697fa458.png',2390,780,44],
 ['assets/embedded/asset_0103_940446d5bd193796.png',1160,1120,42],['assets/embedded/asset_0095_dd2a3bf34574b7a8.png',1010,810,28],
 ['assets/embedded/asset_0096_c39d3e58f7ad1ebd.png',2460,880,25],['assets/embedded/asset_0101_78924c802f17041f.png',1460,430,38],
 ['assets/embedded/asset_0095_dd2a3bf34574b7a8.png',2050,1180,25],['assets/embedded/asset_0102_8e0b3ac0697fa458.png',1880,1240,38]
].forEach(([src,x,y,w])=>{const e=document.createElement('img');e.className='townClutter';e.src=src;e.style.left=x+'px';e.style.top=y+'px';e.style.width=w+'px';world.appendChild(e)});

const baseLoop=loop;
loop=function(now){
  updateTownClock(now);
  updateAmbientNpcs(now);
  return baseLoop(now);
};



document.getElementById('westwoodEntrance').onclick=()=>{
 if(currentArea==='town'&&nearObject(document.getElementById('westwoodEntrance'),230))switchArea('forest',FOREST_SPAWN);
 else toast('Move closer to the Westwood sign.');
};
const chieftainDungeonEntrance=document.getElementById('chieftainDungeonEntrance');
if(chieftainDungeonEntrance)chieftainDungeonEntrance.onclick=()=>{if(currentArea==='forest')switchArea('chieftainDungeon',CHIEFTAIN_DUNGEON_SPAWN);};
const chieftainDungeonExit=document.getElementById('chieftainDungeonExit');
if(chieftainDungeonExit)chieftainDungeonExit.onclick=()=>{if(currentArea==='chieftainDungeon')switchArea('forest',CHIEFTAIN_DUNGEON_RETURN);};

document.getElementById('forestExit').onclick=()=>{
 if(currentArea==='forest')switchArea('town',FOREST_RETURN);
};

document.getElementById('mineExit').onclick=()=>{if(nearObject(document.getElementById('mineExit'),190))switchArea('town',MINE_RETURN);else toast('Move closer to the mine exit.')};
document.getElementById('shopDoor').onclick=()=>{if(currentArea==='town'&&(nearObject(document.getElementById('shopDoor'),260)||inShopEntranceZone()))switchArea('shop',SHOP_SPAWN);else toast('Stand on the ENTER marker in front of the General Store.');};
document.getElementById('shopExit').onclick=()=>{if(currentArea==='shop'&&nearObject(document.getElementById('shopExit'),230))switchArea('town',SHOP_RETURN);else toast('Move closer to the store exit.')};
const interiorShopkeeper=document.querySelector('#shopWorld .shopNpc[data-id="merchant"]');if(interiorShopkeeper)interiorShopkeeper.onclick=()=>{if(currentArea==='shop')openShop();};
document.querySelectorAll('.oreVein').forEach(el=>el.onclick=()=>{if(nearObject(el,145))mineOre(el);else toast('Move closer to the ore vein.')});
addEventListener('resize',camera);
refreshDailyQuests();
loadCharacterData();load();applyCharacterData();updateEquipmentVisual();setupWoodcutting();

const westwoodChest=document.querySelector('.westwoodChest');
if(westwoodChest){
 westwoodChest.addEventListener('click',()=>{
  const r=westwoodChest.getBoundingClientRect(),wr=world.getBoundingClientRect();
  const x=r.left-wr.left+r.width/2,y=r.top-wr.top+r.height/2;
  if(Math.hypot(pos.x-x,pos.y-y)>145){toast('The locked chest is deeper inside the goblin camp.');return}
  if((inventoryData.goblin_map||0)>0 || (inventoryData.chest_key||0)>0){
    addItem('gold',75);addItem('health_potion',1);
    toast('🔓 Goblin chest opened: 75 Gold and a Health Potion!');
    westwoodChest.style.opacity='.45';westwoodChest.style.pointerEvents='none';
    save(false);
  }else toast('🔒 The goblin chest needs a key or camp map.');
 });
}


// ===== v6.7 PAINT-STYLE WESTWOOD MAP EDITOR =====
const WESTWOOD_EDITOR_KEY='valvondor-westwood-editor-v3-finished';
const editorPanel=document.getElementById('editorPanel'),editorStatus=document.getElementById('editorStatus');
let editorMode=false,editorSelected=null,editorDrag=null,editorUndoStack=[],editorRedoStack=[];
let editorTool='select',editorBrush=null,editorPainting=false,editorLastPaint=null,editorRect=null;
const EDITOR_ASSET_MANIFEST=[{"name":"Attack1","src":"assets/embedded/asset_0247_40a80b50d18ea4bb.png","category":"Characters","width":180},{"name":"Attack2","src":"assets/embedded/asset_0248_bc2d8d8acefa213e.png","category":"Characters","width":180},{"name":"Attack3","src":"assets/embedded/asset_0249_6481484648e1804a.png","category":"Characters","width":180},{"name":"Bank","src":"assets/embedded/asset_0250_ce5998a998175f4d.png","category":"Buildings","width":90},{"name":"Barrel","src":"assets/embedded/asset_0010_01a6e37f1a49a18b.png","category":"Props","width":85},{"name":"Blacksmith","src":"assets/embedded/asset_0251_6b5623216535f857.png","category":"Buildings","width":70},{"name":"Blacksmith Npc","src":"assets/embedded/asset_0047_d3155b76529f25a6.png","category":"NPCs","width":54},{"name":"Bridge H","src":"assets/embedded/asset_0252_72e9d12f6fad1224.png","category":"Props","width":150},{"name":"Bridge V","src":"assets/embedded/asset_0253_f953584f1eaa75fa.png","category":"Props","width":75},{"name":"Brimvault Entrance","src":"assets/embedded/asset_0036_c4add12bbc7f7d09.png","category":"Mine","width":120},{"name":"Brimvault Level1","src":"assets/embedded/asset_0122_2d21bf34bbbe1ba4.png","category":"Mine","width":142},{"name":"Brimvault Snake Level1","src":"assets/embedded/asset_0118_be7b3e68801dec13.png","category":"Mine","width":142},{"name":"Barrel","src":"assets/embedded/asset_0039_b513cb2cd7fb1625.png","category":"Mine","width":100},{"name":"Cart Front","src":"assets/embedded/asset_0254_a3f3ae265ef321a3.png","category":"Mine","width":100},{"name":"Cart Side","src":"assets/embedded/asset_0037_3d8e99e5046c8d3d.png","category":"Mine","width":100},{"name":"Crate","src":"assets/embedded/asset_0038_5e7b455f5a8de22f.png","category":"Mine","width":100},{"name":"Lantern","src":"assets/embedded/asset_0119_b28134179648625b.png","category":"Mine","width":100},{"name":"Ore Blue","src":"assets/embedded/asset_0255_aca11d7a462df597.png","category":"Mine","width":100},{"name":"Ore Copper","src":"assets/embedded/asset_0041_f51ee915900da413.png","category":"Mine","width":100},{"name":"Ore Gold","src":"assets/embedded/asset_0042_9ce821d51283754e.png","category":"Mine","width":100},{"name":"Ore Green","src":"assets/embedded/asset_0256_a30cb4826820d928.png","category":"Mine","width":100},{"name":"Ore Red","src":"assets/embedded/asset_0257_81360468656a1494.png","category":"Mine","width":100},{"name":"Pebble","src":"assets/embedded/asset_0258_c87109385ad878a6.png","category":"Mine","width":100},{"name":"Pickaxe","src":"assets/embedded/asset_0040_c9a7559462c22d88.png","category":"Mine","width":100},{"name":"Rock Big","src":"assets/embedded/asset_0043_77e5152847889cc1.png","category":"Mine","width":100},{"name":"Rock Cluster","src":"assets/embedded/asset_0044_cef58a826f6fcb5e.png","category":"Mine","width":100},{"name":"Rock Dark","src":"assets/embedded/asset_0046_855714f4bda9196c.png","category":"Mine","width":100},{"name":"Rock Small","src":"assets/embedded/asset_0045_944d2e32e9224237.png","category":"Mine","width":100},{"name":"Sign","src":"assets/embedded/asset_0259_637e14ab18ce5b29.png","category":"Mine","width":100},{"name":"Support","src":"assets/embedded/asset_0260_aeb0f93b12d2af12.png","category":"Mine","width":100},{"name":"Tileset Cart","src":"assets/embedded/asset_0115_503661c16252bca2.png","category":"Mine","width":150},{"name":"Tileset Caves","src":"assets/embedded/asset_0261_0047813de0f61ae5.png","category":"Mine","width":120},{"name":"Tileset Objects","src":"assets/embedded/asset_0116_aee215a4529fe722.png","category":"Mine","width":180},{"name":"Tileset Rails","src":"assets/embedded/asset_0262_474e21e8492bb13f.png","category":"Mine","width":100},{"name":"Tileset Terrains","src":"assets/embedded/asset_0263_1c2dba16bfa0af82.png","category":"Mine","width":114},{"name":"Castle Gate","src":"assets/embedded/asset_0008_54a7bb196b2cd113.png","category":"Other","width":86},{"name":"Decor Cart","src":"assets/embedded/asset_0264_1d9780d45b420444.png","category":"Mine","width":106},{"name":"Decor Crates","src":"assets/embedded/asset_0021_0563be7e3820582a.png","category":"Props","width":51},{"name":"Decor Greenery","src":"assets/embedded/asset_0265_1caa8cc7a58a5253.png","category":"Props","width":114},{"name":"Farm House","src":"assets/embedded/asset_0266_17cd31ef6e3d16a3.png","category":"Buildings","width":116},{"name":"Fisher Hut","src":"assets/embedded/asset_0267_d155bb725e936c6b.png","category":"Other","width":76},{"name":"Forge Shed","src":"assets/embedded/asset_0268_5c5e343cd27dc48f.png","category":"Other","width":85},{"name":"Guild Hall","src":"assets/embedded/asset_0269_6852a4f5ccfda1d7.png","category":"Other","width":110},{"name":"Market Stall","src":"assets/embedded/asset_0270_aa8d7c2258af74d9.png","category":"Other","width":98},{"name":"Mine Hut","src":"assets/embedded/asset_0271_c096e7053b96c536.png","category":"Other","width":101},{"name":"Small Home","src":"assets/embedded/asset_0272_032c9b5cfff9ece7.png","category":"Other","width":83},{"name":"Well","src":"assets/embedded/asset_0273_61d35373acd3e50b.png","category":"Other","width":94},{"name":"Chicken","src":"assets/embedded/asset_0274_1dd199a0338a95bf.png","category":"Farming","width":100},{"name":"Cow","src":"assets/embedded/asset_0275_ca3bf9f3d4d4225d.png","category":"Farming","width":100},{"name":"Pig","src":"assets/embedded/asset_0276_1496de960d08dcd2.png","category":"Farming","width":100},{"name":"Sheep","src":"assets/embedded/asset_0277_8dc9655274086eb0.png","category":"Farming","width":100},{"name":"Skeleton","src":"assets/embedded/asset_0278_f43d0ef77d6f05d3.png","category":"Mobs","width":60},{"name":"Slime Green","src":"assets/embedded/asset_0279_54b0f54a65407048.png","category":"Mobs","width":180},{"name":"Bridge Wood","src":"assets/embedded/asset_0280_9508f32026450430.png","category":"Props","width":180},{"name":"Chest","src":"assets/embedded/asset_0281_c8bf3ff929169acf.png","category":"Props","width":100},{"name":"Fences","src":"assets/embedded/asset_0282_7c6f9bf4827003f8.png","category":"Props","width":100},{"name":"House 1 Wood Base Blue","src":"assets/embedded/asset_0283_55137860ad3f4ce3.png","category":"Buildings","width":75},{"name":"Oak Tree","src":"assets/embedded/asset_0284_75fa92e67827d785.png","category":"Nature","width":80},{"name":"Oak Tree Small","src":"assets/embedded/asset_0285_e25f1bcf6b6f4a40.png","category":"Nature","width":180},{"name":"Outdoor Decor Free","src":"assets/embedded/asset_0286_7d7390f95ff0617f.png","category":"Props","width":58},{"name":"Player","src":"assets/embedded/asset_0287_61a2d98ed35b9afb.png","category":"Characters","width":60},{"name":"Player Actions","src":"assets/embedded/asset_0288_c06af744a494ad5a.png","category":"Characters","width":36},{"name":"Beach Tile","src":"assets/embedded/asset_0289_15277ac7c3ad45d0.png","category":"Terrain","width":166},{"name":"Cliff Tile","src":"assets/embedded/asset_0290_148364402c98f6ba.png","category":"Terrain","width":50},{"name":"Farmland Tile","src":"assets/embedded/asset_0291_05362244f3b52d9a.png","category":"Farming","width":100},{"name":"Grass Middle","src":"assets/embedded/asset_0292_f7fecc90dfcf26f5.png","category":"Terrain","width":100},{"name":"Path Middle","src":"assets/embedded/asset_0293_bba80209ade146a3.png","category":"Terrain","width":100},{"name":"Path Tile","src":"assets/embedded/asset_0294_8dae0e4e1443ade4.png","category":"Terrain","width":50},{"name":"Water Middle","src":"assets/embedded/asset_0295_9694a3743d6b0fa2.png","category":"Terrain","width":100},{"name":"Water Tile","src":"assets/embedded/asset_0296_f5a97c61249c335c.png","category":"Terrain","width":50},{"name":"Dead","src":"assets/embedded/asset_0297_f9eccf8f08df9b39.png","category":"Characters","width":180},{"name":"Defend","src":"assets/embedded/asset_0298_747fcbdab6984be7.png","category":"Characters","width":180},{"name":"Copper Sword","src":"assets/embedded/asset_0193_2dcbf2134ffc9835.png","category":"Characters","width":100},{"name":"Iron Sword","src":"assets/embedded/asset_0200_bb748d47f57ed261.png","category":"Characters","width":100},{"name":"Rusty Dagger","src":"assets/embedded/asset_0191_bb495605639faefc.png","category":"Characters","width":100},{"name":"Training Sword","src":"assets/embedded/asset_0299_8e43b25e1c648e92.png","category":"Characters","width":100},{"name":"Fallen Tree","src":"assets/embedded/asset_0093_3f92241873a72cee.png","category":"Nature","width":100},{"name":"Farmer","src":"assets/embedded/asset_0051_a01fd0b61aeca902.png","category":"Farming","width":53},{"name":"Boat","src":"assets/embedded/asset_0300_c44c3a506db2ddba.png","category":"Other","width":180},{"name":"Fish 01","src":"assets/embedded/asset_0301_8cc2c5f5eeb4fba1.png","category":"Other","width":100},{"name":"Fish 02","src":"assets/embedded/asset_0302_b4710eed81c96950.png","category":"Other","width":100},{"name":"Fish 03","src":"assets/embedded/asset_0303_41c7641bc6960462.png","category":"Other","width":100},{"name":"Fish Barrel","src":"assets/embedded/asset_0304_81dfafa49db79504.png","category":"Props","width":145},{"name":"Fish Rod","src":"assets/embedded/asset_0201_f71dfe9e4b7ed048.png","category":"Other","width":61},{"name":"Fruit Tree","src":"assets/embedded/asset_0305_358f4543654ca22a.png","category":"Nature","width":100},{"name":"General Store","src":"assets/embedded/asset_0306_71b5a62ab05ba82d.png","category":"Buildings","width":70},{"name":"Goblin Attack 00","src":"assets/embedded/asset_0307_de1d05a292805310.png","category":"Mobs","width":100},{"name":"Goblin Attack 01","src":"assets/embedded/asset_0308_58f1f195d5235b07.png","category":"Mobs","width":100},{"name":"Goblin Attack 02","src":"assets/embedded/asset_0309_5a06a50e7e409583.png","category":"Mobs","width":100},{"name":"Goblin Attack 03","src":"assets/embedded/asset_0310_dfaa4033ed93fd11.png","category":"Mobs","width":100},{"name":"Goblin Attack 04","src":"assets/embedded/asset_0311_e2fead2c509830ad.png","category":"Mobs","width":100},{"name":"Goblin Attack 05","src":"assets/embedded/asset_0312_d43dc1775af0b5dc.png","category":"Mobs","width":100},{"name":"Goblin Attack 06","src":"assets/embedded/asset_0313_de485bc8ade7209e.png","category":"Mobs","width":100},{"name":"Goblin Attack 07","src":"assets/embedded/asset_0314_8ca922445439f001.png","category":"Mobs","width":100},{"name":"Goblin Attack 08","src":"assets/embedded/asset_0315_f0a633efff1b18e3.png","category":"Mobs","width":100},{"name":"Goblin Attack 09","src":"assets/embedded/asset_0316_3a050eb80f1304cf.png","category":"Mobs","width":100},{"name":"Goblin Die 00","src":"assets/embedded/asset_0317_a072645925c72697.png","category":"Mobs","width":100},{"name":"Goblin Die 01","src":"assets/embedded/asset_0318_b42804aad71b916e.png","category":"Mobs","width":100},{"name":"Goblin Die 02","src":"assets/embedded/asset_0319_6a398134ff9181f5.png","category":"Mobs","width":100},{"name":"Goblin Die 03","src":"assets/embedded/asset_0320_8985d5ff701f8c46.png","category":"Mobs","width":100},{"name":"Goblin Die 04","src":"assets/embedded/asset_0321_9d8f9ad60509972e.png","category":"Mobs","width":100},{"name":"Goblin Die 05","src":"assets/embedded/asset_0322_c0eb88f0f50a5625.png","category":"Mobs","width":100},{"name":"Goblin Die 06","src":"assets/embedded/asset_0323_381470c233526a86.png","category":"Mobs","width":100},{"name":"Goblin Die 07","src":"assets/embedded/asset_0324_3ea1883379afbaa2.png","category":"Mobs","width":100},{"name":"Goblin Die 08","src":"assets/embedded/asset_0325_76fa57070943db0f.png","category":"Mobs","width":100},{"name":"Goblin Die 09","src":"assets/embedded/asset_0326_e6a48a9ddbe3995a.png","category":"Mobs","width":100},{"name":"Goblin Hurt 00","src":"assets/embedded/asset_0327_3c95b1c61d45c55c.png","category":"Mobs","width":100},{"name":"Goblin Hurt 01","src":"assets/embedded/asset_0328_2cf59110e255e1ee.png","category":"Mobs","width":100},{"name":"Goblin Hurt 02","src":"assets/embedded/asset_0329_d5922d02327e644a.png","category":"Mobs","width":100},{"name":"Goblin Hurt 03","src":"assets/embedded/asset_0330_29f2a0def8292177.png","category":"Mobs","width":100},{"name":"Goblin Hurt 04","src":"assets/embedded/asset_0331_3818005ff60aaaef.png","category":"Mobs","width":100},{"name":"Goblin Hurt 05","src":"assets/embedded/asset_0332_0a0edd64bc289a8d.png","category":"Mobs","width":100},{"name":"Goblin Hurt 06","src":"assets/embedded/asset_0333_1d11edb2477229e9.png","category":"Mobs","width":100},{"name":"Goblin Hurt 07","src":"assets/embedded/asset_0334_c97e80dfa3f1b973.png","category":"Mobs","width":100},{"name":"Goblin Hurt 08","src":"assets/embedded/asset_0335_a57050016a49b907.png","category":"Mobs","width":100},{"name":"Goblin Hurt 09","src":"assets/embedded/asset_0336_28b95753daa26426.png","category":"Mobs","width":100},{"name":"Goblin Idle 00","src":"assets/embedded/asset_0337_10620395ab9dfa1c.png","category":"Mobs","width":100},{"name":"Goblin Idle 01","src":"assets/embedded/asset_0338_6fbf160409ecf6fa.png","category":"Mobs","width":100},{"name":"Goblin Idle 02","src":"assets/embedded/asset_0339_b41b1056b0adb75a.png","category":"Mobs","width":100},{"name":"Goblin Idle 03","src":"assets/embedded/asset_0340_20f7d0343ded28b0.png","category":"Mobs","width":100},{"name":"Goblin Idle 04","src":"assets/embedded/asset_0341_0f2aae96c5d498d2.png","category":"Mobs","width":100},{"name":"Goblin Idle 05","src":"assets/embedded/asset_0342_35cf08beb3af28c7.png","category":"Mobs","width":100},{"name":"Goblin Idle 06","src":"assets/embedded/asset_0343_81193964036a31c5.png","category":"Mobs","width":100},{"name":"Goblin Idle 07","src":"assets/embedded/asset_0344_14d6a61ec80bac57.png","category":"Mobs","width":100},{"name":"Goblin Idle 08","src":"assets/embedded/asset_0345_38173343ba360357.png","category":"Mobs","width":100},{"name":"Goblin Idle 09","src":"assets/embedded/asset_0344_14d6a61ec80bac57.png","category":"Mobs","width":100},{"name":"Goblin Idle 10","src":"assets/embedded/asset_0343_81193964036a31c5.png","category":"Mobs","width":100},{"name":"Goblin Idle 11","src":"assets/embedded/asset_0342_35cf08beb3af28c7.png","category":"Mobs","width":100},{"name":"Goblin Walk 00","src":"assets/embedded/asset_0346_df29a6de09cb38d6.png","category":"Mobs","width":100},{"name":"Goblin Walk 01","src":"assets/embedded/asset_0347_a8f3b518a3784e6e.png","category":"Mobs","width":100},{"name":"Goblin Walk 02","src":"assets/embedded/asset_0348_768f4bd3f3e637e1.png","category":"Mobs","width":100},{"name":"Goblin Walk 03","src":"assets/embedded/asset_0349_2b34e14550337e33.png","category":"Mobs","width":100},{"name":"Goblin Walk 04","src":"assets/embedded/asset_0350_3445f9a536148efc.png","category":"Mobs","width":100},{"name":"Goblin Walk 05","src":"assets/embedded/asset_0351_2d619fa7b2befc4a.png","category":"Mobs","width":100},{"name":"Goblin Walk 06","src":"assets/embedded/asset_0352_173aa89428091f9b.png","category":"Mobs","width":100},{"name":"Goblin Walk 07","src":"assets/embedded/asset_0353_b3971ccb1e8aa508.png","category":"Mobs","width":100},{"name":"Goblin Walk 08","src":"assets/embedded/asset_0354_6bbf3a1e3c293bf2.png","category":"Mobs","width":100},{"name":"Goblin Walk 09","src":"assets/embedded/asset_0355_3b6a91afa9de2510.png","category":"Mobs","width":100},{"name":"Goblin Walk 10","src":"assets/embedded/asset_0356_5db09b197dbe1668.png","category":"Mobs","width":100},{"name":"Goblin Walk 11","src":"assets/embedded/asset_0357_1280fa26c7119d96.png","category":"Mobs","width":100},{"name":"Goblin Walk 12","src":"assets/embedded/asset_0358_6ead0f026af28308.png","category":"Mobs","width":100},{"name":"Goblin Walk 13","src":"assets/embedded/asset_0359_6c0a1cc9ba6557e2.png","category":"Mobs","width":100},{"name":"Goblin Walk 14","src":"assets/embedded/asset_0360_a8f9d61706bb84ea.png","category":"Mobs","width":100},{"name":"Goblin Walk 15","src":"assets/embedded/asset_0361_2fa96071cd3a090e.png","category":"Mobs","width":100},{"name":"Goblin Walk 16","src":"assets/embedded/asset_0362_9df42e67cadc677a.png","category":"Mobs","width":100},{"name":"Goblin Walk 17","src":"assets/embedded/asset_0363_5fa461d01ca3efe7.png","category":"Mobs","width":100},{"name":"Goblin Walk 18","src":"assets/embedded/asset_0364_f21ee42878916ce0.png","category":"Mobs","width":100},{"name":"Goblin Walk 19","src":"assets/embedded/asset_0365_1af2b74bb25b1d08.png","category":"Mobs","width":100},{"name":"Guard","src":"assets/embedded/asset_0020_8c11b7520f1367b9.png","category":"NPCs","width":50},{"name":"Hero Sheet","src":"assets/embedded/asset_0366_b71a84cbfc7c2e01.png","category":"Characters","width":180},{"name":"Hero1 Attack","src":"assets/embedded/asset_0367_646196441a571e4c.png","category":"Characters","width":180},{"name":"Hero1 Dead","src":"assets/embedded/asset_0368_cd4c6981502dbe1c.png","category":"Characters","width":175},{"name":"Hero1 Hurt","src":"assets/embedded/asset_0369_2d9704075f40b23b.png","category":"Characters","width":125},{"name":"Hero1 Idle","src":"assets/embedded/asset_0370_6fdc8e36855e21ae.png","category":"Characters","width":180},{"name":"Hero1 Run","src":"assets/embedded/asset_0371_519bc14143679401.png","category":"Characters","width":180},{"name":"Hero1 Run Attack","src":"assets/embedded/asset_0372_4e2b8a9ccf332363.png","category":"Characters","width":180},{"name":"Hero1 Walk","src":"assets/embedded/asset_0373_87184e47b8346030.png","category":"Characters","width":150},{"name":"Hero2 Attack","src":"assets/embedded/asset_0374_289e8335c73cdf94.png","category":"Characters","width":180},{"name":"Hero2 Dead","src":"assets/embedded/asset_0375_2dfcf7a92cdf129b.png","category":"Characters","width":175},{"name":"Hero2 Hurt","src":"assets/embedded/asset_0376_394d172ed922bfae.png","category":"Characters","width":125},{"name":"Hero2 Idle","src":"assets/embedded/asset_0377_ca304a88703ecfa1.png","category":"Characters","width":180},{"name":"Hero2 Run","src":"assets/embedded/asset_0378_0875894e472a83b0.png","category":"Characters","width":180},{"name":"Hero2 Run Attack","src":"assets/embedded/asset_0379_a8fd007e02f5c97e.png","category":"Characters","width":180},{"name":"Hero2 Walk","src":"assets/embedded/asset_0380_33d12b2bb2170b8a.png","category":"Characters","width":150},{"name":"Hero3 Attack","src":"assets/embedded/asset_0381_3f25173218ff6154.png","category":"Characters","width":180},{"name":"Hero3 Dead","src":"assets/embedded/asset_0382_c12c993f7026eda0.png","category":"Characters","width":175},{"name":"Hero3 Hurt","src":"assets/embedded/asset_0383_f6ea06b121eae464.png","category":"Characters","width":125},{"name":"Hero3 Idle","src":"assets/embedded/asset_0384_311cfbdaece5ec1e.png","category":"Characters","width":180},{"name":"Hero3 Run","src":"assets/embedded/asset_0385_d24d5a53f1d1fef5.png","category":"Characters","width":180},{"name":"Hero3 Run Attack","src":"assets/embedded/asset_0386_68776190ef43f3c1.png","category":"Characters","width":180},{"name":"Hero3 Walk","src":"assets/embedded/asset_0387_ca5374fffd9de450.png","category":"Characters","width":150},{"name":"Hero1 Attack","src":"assets/embedded/asset_0388_94af67cce04bd27b.png","category":"Characters","width":180},{"name":"Hero1 Dead","src":"assets/embedded/asset_0389_b5a986508e0f58d0.png","category":"Characters","width":175},{"name":"Hero1 Hurt","src":"assets/embedded/asset_0390_1cc2755c17f89d1c.png","category":"Characters","width":125},{"name":"Hero1 Idle","src":"assets/embedded/asset_0391_cc44ba6950401b0d.png","category":"Characters","width":180},{"name":"Hero1 Run","src":"assets/embedded/asset_0392_8b76162c1182f672.png","category":"Characters","width":180},{"name":"Hero1 Run Attack","src":"assets/embedded/asset_0393_662feed763a8a4b9.png","category":"Characters","width":180},{"name":"Hero1 Walk","src":"assets/embedded/asset_0394_9daf81fc5fe7fde5.png","category":"Characters","width":150},{"name":"Hero2 Attack","src":"assets/embedded/asset_0395_44e68a63e9e8fe90.png","category":"Characters","width":180},{"name":"Hero2 Dead","src":"assets/embedded/asset_0396_8628163130d95914.png","category":"Characters","width":175},{"name":"Hero2 Hurt","src":"assets/embedded/asset_0397_55be5cfd1e075f0c.png","category":"Characters","width":125},{"name":"Hero2 Idle","src":"assets/embedded/asset_0398_1f1b26a2be12653e.png","category":"Characters","width":180},{"name":"Hero2 Run","src":"assets/embedded/asset_0399_8fd5bcf6bd52565e.png","category":"Characters","width":180},{"name":"Hero2 Run Attack","src":"assets/embedded/asset_0400_e9b2b6230b425a8c.png","category":"Characters","width":180},{"name":"Hero2 Walk","src":"assets/embedded/asset_0401_25a1e4cfa4314cb2.png","category":"Characters","width":150},{"name":"Hero3 Attack","src":"assets/embedded/asset_0402_93ea0a7a0cbe32c3.png","category":"Characters","width":180},{"name":"Hero3 Dead","src":"assets/embedded/asset_0403_ba0be6d1ebc898fd.png","category":"Characters","width":175},{"name":"Hero3 Hurt","src":"assets/embedded/asset_0404_552b92c40e21041e.png","category":"Characters","width":125},{"name":"Hero3 Idle","src":"assets/embedded/asset_0405_42df8817d714f424.png","category":"Characters","width":180},{"name":"Hero3 Run","src":"assets/embedded/asset_0406_8d6548ee5c8e007c.png","category":"Characters","width":180},{"name":"Hero3 Run Attack","src":"assets/embedded/asset_0407_7523d64abe8b9a3a.png","category":"Characters","width":180},{"name":"Hero3 Walk","src":"assets/embedded/asset_0408_00c2b7f29acf8544.png","category":"Characters","width":150},{"name":"Hurt","src":"assets/embedded/asset_0409_537148a4131fdc22.png","category":"Characters","width":180},{"name":"Idle","src":"assets/embedded/asset_0410_e57a4608c1174afb.png","category":"Characters","width":180},{"name":"Inn","src":"assets/embedded/asset_0411_90e0b781e00d1d51.png","category":"Buildings","width":89},{"name":"Innkeeper","src":"assets/embedded/asset_0049_b8045d80263965a0.png","category":"NPCs","width":50},{"name":"Jump","src":"assets/embedded/asset_0412_31cfcd9942714b63.png","category":"Characters","width":180},{"name":"Large House","src":"assets/embedded/asset_0413_ec1c1ee38492faad.png","category":"Buildings","width":86},{"name":"1H Slash","src":"assets/embedded/asset_0414_e270860d8760c18b.png","category":"Other","width":180},{"name":"Combat","src":"assets/embedded/asset_0415_d77ff3d7bb464cce.png","category":"Other","width":180},{"name":"Hurt","src":"assets/embedded/asset_0416_9e5781196271cf38.png","category":"Characters","width":180},{"name":"Idle","src":"assets/embedded/asset_0417_d90567c70ea504b0.png","category":"Characters","width":180},{"name":"Jump","src":"assets/embedded/asset_0418_7b92509a58a2d300.png","category":"Characters","width":180},{"name":"Run","src":"assets/embedded/asset_0419_e6c3d93c8f7e9ec1.png","category":"Characters","width":180},{"name":"Walk","src":"assets/embedded/asset_0420_cde39e02b16f9804.png","category":"Characters","width":180},{"name":"1H Slash","src":"assets/embedded/asset_0421_74b2fdd0534cbfd6.png","category":"Other","width":180},{"name":"Combat","src":"assets/embedded/asset_0422_453bd0b0035fa56e.png","category":"Other","width":180},{"name":"Hurt","src":"assets/embedded/asset_0423_5a51433a1b24c72e.png","category":"Characters","width":180},{"name":"Idle","src":"assets/embedded/asset_0120_5ad5af6c7b599a52.png","category":"Characters","width":180},{"name":"Jump","src":"assets/embedded/asset_0424_b305d47068e24db7.png","category":"Characters","width":180},{"name":"Run","src":"assets/embedded/asset_0425_b7234aa30b5639f0.png","category":"Characters","width":180},{"name":"Walk","src":"assets/embedded/asset_0426_72628d3980aaeb6b.png","category":"Characters","width":180},{"name":"Merchant","src":"assets/embedded/asset_0048_55efd98bc391807b.png","category":"NPCs","width":49},{"name":"Protect","src":"assets/embedded/asset_0427_a0faf57e40dbd30a.png","category":"Other","width":100},{"name":"Run","src":"assets/embedded/asset_0428_2787bdf07f201d14.png","category":"Characters","width":180},{"name":"Run Attack","src":"assets/embedded/asset_0429_3c12786bb94e7165.png","category":"Characters","width":180},{"name":"Small House","src":"assets/embedded/asset_0430_412799f43c4a82b9.png","category":"Buildings","width":70},{"name":"Stump","src":"assets/embedded/asset_0056_b2b2f6e51e6fae3e.png","category":"Nature","width":100},{"name":"Town Ground","src":"assets/embedded/asset_0431_adb517417349591a.png","category":"Terrain","width":140},{"name":"Town Ground Handcrafted","src":"assets/embedded/asset_0432_adcb81265fd44b28.png","category":"Terrain","width":140},{"name":"Town Ground West Forest","src":"assets/embedded/asset_0433_3590b63a2bf5cd03.png","category":"Mine","width":180},{"name":"Town Hall","src":"assets/embedded/asset_0434_1413f6f1d8993326.png","category":"Buildings","width":70},{"name":"Tree Autumn","src":"assets/embedded/asset_0435_397e4ca0e42463d8.png","category":"Nature","width":100},{"name":"Tree Large","src":"assets/embedded/asset_0017_4052d42d39faecba.png","category":"Nature","width":100},{"name":"Tree Small","src":"assets/embedded/asset_0022_e49b4f796e880d4e.png","category":"Nature","width":100},{"name":"Bridge   Day","src":"assets/embedded/asset_0436_ab6d2fd8d87d7ad9.png","category":"Props","width":180},{"name":"Church   Day","src":"assets/embedded/asset_0007_326ca2986ac5f5b4.png","category":"Buildings","width":114},{"name":"Fence 1   Day","src":"assets/embedded/asset_0123_04d32bf61651f0c6.png","category":"Props","width":100},{"name":"Fence 2   Day","src":"assets/embedded/asset_0437_8045ba5513e255a9.png","category":"Props","width":100},{"name":"Grass Tile   Day","src":"assets/embedded/asset_0438_2a30fafd50375e91.png","category":"Terrain","width":100},{"name":"Ground Tile   Day","src":"assets/embedded/asset_0439_f5fdddaa7cef2b3a.png","category":"Terrain","width":100},{"name":"House 1   Day","src":"assets/embedded/asset_0009_1bd34efc704fc408.png","category":"Buildings","width":71},{"name":"House 2   Day","src":"assets/embedded/asset_0011_7d1a4f0b410dbb5d.png","category":"Buildings","width":114},{"name":"Tree 1   Day","src":"assets/embedded/asset_0014_72fbb08adec7950a.png","category":"Nature","width":100},{"name":"Tree 2   Day","src":"assets/embedded/asset_0015_22d991678ad397ba.png","category":"Nature","width":100},{"name":"Tree 3   Day","src":"assets/embedded/asset_0016_95a5c9acf435e5e7.png","category":"Nature","width":100},{"name":"Water Tile   Day","src":"assets/embedded/asset_0440_63567ecc3ca9856c.png","category":"Terrain","width":100},{"name":"Villager Woman","src":"assets/embedded/asset_0050_034a60a73aeccea2.png","category":"NPCs","width":44},{"name":"Walk","src":"assets/embedded/asset_0441_3062e8150aeca5a3.png","category":"Characters","width":180},{"name":"Watchtower","src":"assets/embedded/asset_0019_39f7c475ca409448.png","category":"Props","width":76},{"name":"1H Slash","src":"assets/embedded/asset_0442_a91c5c66580bdb8c.png","category":"Characters","width":180},{"name":"Combat","src":"assets/embedded/asset_0443_d6f97d6ec102ec99.png","category":"Characters","width":180},{"name":"Hurt","src":"assets/embedded/asset_0444_f4951f2f5731688f.png","category":"Characters","width":180},{"name":"Idle","src":"assets/embedded/asset_0445_638a05dc282a0cee.png","category":"Characters","width":180},{"name":"Jump","src":"assets/embedded/asset_0446_1b328bba25c1a897.png","category":"Characters","width":180},{"name":"Run","src":"assets/embedded/asset_0447_17ff8bea809172e4.png","category":"Characters","width":180},{"name":"Walk","src":"assets/embedded/asset_0448_8fc81828e1ca2e69.png","category":"Characters","width":180},{"name":"1H Slash","src":"assets/embedded/asset_0449_e231680e59983de5.png","category":"Characters","width":180},{"name":"Combat","src":"assets/embedded/asset_0450_1d985e5bdca15839.png","category":"Characters","width":180},{"name":"Hurt","src":"assets/embedded/asset_0451_0523e327ecd2f3b3.png","category":"Characters","width":180},{"name":"Idle","src":"assets/embedded/asset_0452_ec293a932bc5be35.png","category":"Characters","width":180},{"name":"Jump","src":"assets/embedded/asset_0453_5589570fff0d9b33.png","category":"Characters","width":180},{"name":"Run","src":"assets/embedded/asset_0454_39a0007152e498f8.png","category":"Characters","width":180},{"name":"Walk","src":"assets/embedded/asset_0455_c2c618943552e86f.png","category":"Characters","width":180},{"name":"1H Slash","src":"assets/embedded/asset_0456_be3341f7a3158a32.png","category":"Other","width":180},{"name":"Combat","src":"assets/embedded/asset_0457_699944b62e094394.png","category":"Other","width":180},{"name":"Hurt","src":"assets/embedded/asset_0458_9a499927905f1b24.png","category":"Characters","width":180},{"name":"Idle","src":"assets/embedded/asset_0459_f51840afb363b0c1.png","category":"Characters","width":180},{"name":"Jump","src":"assets/embedded/asset_0460_b1755f88c40a8187.png","category":"Characters","width":180},{"name":"Run","src":"assets/embedded/asset_0461_d9e55a20cb95d148.png","category":"Characters","width":180},{"name":"Walk","src":"assets/embedded/asset_0462_34c881b6ad78436d.png","category":"Characters","width":180},{"name":"1H Slash","src":"assets/embedded/asset_0463_81511beaf6621c1e.png","category":"Characters","width":180},{"name":"Combat","src":"assets/embedded/asset_0464_a43520d9a8057b2a.png","category":"Characters","width":180},{"name":"Hurt","src":"assets/embedded/asset_0465_3c9850389628e6a2.png","category":"Characters","width":180},{"name":"Idle","src":"assets/embedded/asset_0466_b16090d33f9a6ffc.png","category":"Characters","width":180},{"name":"Jump","src":"assets/embedded/asset_0467_4e0ec8660faad856.png","category":"Characters","width":180},{"name":"Run","src":"assets/embedded/asset_0468_7c8cbce2b7778309.png","category":"Characters","width":180},{"name":"Walk","src":"assets/embedded/asset_0469_a9ea77ab3da3e825.png","category":"Characters","width":180},{"name":"Windmill","src":"assets/embedded/asset_0023_3146e72a956b0053.png","category":"Buildings","width":100},{"name":"Wolf Fountain","src":"assets/embedded/asset_0012_3262a8e69cbe3ffd.png","category":"Props","width":104},{"name":"World Rebuilt","src":"assets/embedded/asset_0470_9805532e8e4d08c9.png","category":"Other","width":171},{"name":"Birch 1","src":"assets/embedded/asset_0097_305b58eebdd8dca8.png","category":"Terrain","width":86},{"name":"Birch 2","src":"assets/embedded/asset_0098_365bfb716dd81ebb.png","category":"Terrain","width":78},{"name":"Bush 1","src":"assets/embedded/asset_0101_78924c802f17041f.png","category":"Nature","width":114},{"name":"Bush 4","src":"assets/embedded/asset_0102_8e0b3ac0697fa458.png","category":"Nature","width":112},{"name":"Bush 7","src":"assets/embedded/asset_0103_940446d5bd193796.png","category":"Nature","width":126},{"name":"Chanterelles","src":"assets/embedded/asset_0096_c39d3e58f7ad1ebd.png","category":"Nature","width":100},{"name":"Fir 1","src":"assets/embedded/asset_0099_9f65c88313e2135f.png","category":"Terrain","width":49},{"name":"Fir 3","src":"assets/embedded/asset_0100_796b8140ccd7faaf.png","category":"Terrain","width":48},{"name":"Luminous Tree","src":"assets/embedded/asset_0094_a498e28a808cf3fe.png","category":"Nature","width":100},{"name":"Mega Tree","src":"assets/embedded/asset_0471_7371b9f163e60e0a.png","category":"Nature","width":100},{"name":"Mushroom Red","src":"assets/embedded/asset_0095_dd2a3bf34574b7a8.png","category":"Nature","width":100},{"name":"Notice Board","src":"assets/embedded/asset_0013_d194b7b4f8e4a6e5.png","category":"Props","width":124},{"name":"Wolf Idol","src":"assets/embedded/asset_0018_ae906950b369e100.png","category":"Terrain","width":100},{"name":"World V04 Expanded","src":"assets/embedded/asset_0472_19080605dfddc9c7.png","category":"Terrain","width":171},{"name":"World V08 Clean","src":"assets/embedded/asset_0473_45e131ea16a3ed83.png","category":"Terrain","width":171},{"name":"World V09 Handcrafted","src":"assets/embedded/asset_0474_e57df443733d56a5.png","category":"Terrain","width":171},{"name":"World V10 Concept Layout","src":"assets/embedded/asset_0475_fdd90a9a8a4b2b31.png","category":"Terrain","width":171},{"name":"World V11 Handcrafted","src":"assets/embedded/asset_0476_a26f022334f16a86.png","category":"Terrain","width":171},{"name":"World V12 Cute Tiles","src":"assets/embedded/asset_0477_1d14e9494b3fca6f.png","category":"Terrain","width":171},{"name":"World V15 Village","src":"assets/embedded/asset_0478_84797a0bffc5032b.png","category":"Terrain","width":171},{"name":"World V16 Town Polish","src":"assets/embedded/asset_0479_825c80b74b37ee26.png","category":"Terrain","width":171},{"name":"World V17 Beautified","src":"assets/embedded/asset_0480_5e3a3c7853266486.png","category":"Terrain","width":171},{"name":"World V19 Natural Rebuild","src":"assets/embedded/asset_0121_d008252b543972e1.png","category":"Terrain","width":171},{"name":"World V51 Wolf Town","src":"assets/embedded/asset_0481_8d072dce21b2748f.png","category":"Terrain","width":171},{"name":"World V52 Wolf Town","src":"assets/embedded/asset_0482_1550db4ec6f85c4e.png","category":"Terrain","width":171},{"name":"World V53 Expanded Wolf","src":"assets/embedded/asset_0483_04f9c160336ee66d.png","category":"Terrain","width":164},{"name":"World V54 Wolf Roads","src":"assets/embedded/asset_0117_6e33e0b8e120310d.png","category":"Terrain","width":171}];
const editorAssetSearch=document.getElementById('editorAssetSearch'),editorAssetCategory=document.getElementById('editorAssetCategory'),editorAssetCount=document.getElementById('editorAssetCount');
const editorBrushBadge=document.getElementById('editorBrushBadge'),editorBrushSize=document.getElementById('editorBrushSize'),editorBrushSpacing=document.getElementById('editorBrushSpacing'),editorRandomize=document.getElementById('editorRandomize');
function goblinStateFor(el){return goblins.find(g=>g.el===el)}
function registerGoblinElement(el){
 let g=goblinStateFor(el);if(g)return g;
 const x=parseFloat(el.style.left)||0,y=parseFloat(el.style.top)||0;
 const maxHp=Number(el.dataset.maxHp)||60;
 g={el,img:el.querySelector('img'),bar:el.querySelector('.ghp div'),x,y,homeX:x,homeY:y,maxHp,hp:maxHp,damage:Number(el.dataset.damage)||6,xpReward:Number(el.dataset.xp)||25,respawnDelay:Number(el.dataset.respawn)||3000,isBrute:el.dataset.brute==='1',dead:false,state:'idle',frame:0,last:0,attackAt:0,lastPlayerHit:0,dir:1,deathHidden:false,respawnQueued:false,editorDisabled:false};
 goblins.push(g);return g;
}
function createEditorGoblin(name='Goblin',x=pos.x+120,y=pos.y){
 const el=document.createElement('div');el.className='goblin forestGoblin editorPlaced editorEditable';
 el.dataset.goblin='custom-'+Date.now()+'-'+Math.random().toString(16).slice(2);el.dataset.editorId='mob-'+el.dataset.goblin;el.dataset.editorName=name;
 el.style.left=x+'px';el.style.top=y+'px';el.innerHTML='<div class="ghp"><div></div></div><img src="assets/embedded/asset_0337_10620395ab9dfa1c.png"><span class="gname">'+name+'</span>';
 forestWorld.appendChild(el);registerGoblinElement(el);return el;
}
function editorEditableNodes(){return [...forestWorld.querySelectorAll('.obj,.forestRoad,.forestClearingMap,.forestAreaLabel,.forestCampFire,.forestGoblin,.editorPlaced,.editorTerrain,#westwoodV739Roads .realRoad,#westwoodV742Ground img,#westwoodV738 .pond,#westwoodV738 .decor,#westwoodV738 .label')].filter(el=>el.id!=='forestWolfIdol');}
function markEditorNodes(){editorEditableNodes().forEach((el,i)=>{el.classList.add('editorEditable');if(!el.dataset.editorId)el.dataset.editorId=(el.classList.contains('forestGoblin')?'mob-':'base-')+i;});}
function editorSnapshot(){return editorEditableNodes().map(el=>({id:el.dataset.editorId,placed:el.classList.contains('editorPlaced')||el.classList.contains('editorTerrain'),kind:el.classList.contains('forestGoblin')?'mob':(el.dataset.terrain?'terrain':'asset'),src:el.getAttribute('src')||'',name:el.dataset.editorName||el.querySelector?.('.gname')?.textContent||'',left:el.style.left,top:el.style.top,width:el.style.width,height:el.style.height,z:el.style.zIndex,transform:el.style.transform||'',terrain:el.dataset.terrain||'',display:el.style.display||''}));}
function pushEditorUndo(){editorUndoStack.push(JSON.stringify(editorSnapshot()));if(editorUndoStack.length>40)editorUndoStack.shift();editorRedoStack=[];}
function applyEditorSnapshot(data){
 forestWorld.querySelectorAll('.editorPlaced,.editorTerrain').forEach(e=>e.remove());
 const byId=new Map(editorEditableNodes().map(e=>[e.dataset.editorId,e]));
 data.forEach(o=>{let el=byId.get(o.id);if(!el&&o.placed){if(o.kind==='mob')el=createEditorGoblin(o.name||'Goblin');else if(o.terrain){el=document.createElement('div');el.className='editorTerrain '+o.terrain+' editorPlaced';el.dataset.terrain=o.terrain;forestWorld.appendChild(el)}else{el=document.createElement('img');el.className='editorPlaced obj';el.src=o.src;forestWorld.appendChild(el)}el.dataset.editorId=o.id;el.dataset.editorName=o.name||'';}
 if(!el)return;el.style.left=o.left;el.style.top=o.top;el.style.width=o.width;el.style.height=o.height;el.style.zIndex=o.z;el.style.transform=o.transform;el.style.display=o.display||'';
 if(o.kind==='mob'){const g=registerGoblinElement(el);g.x=g.homeX=parseFloat(o.left)||0;g.y=g.homeY=parseFloat(o.top)||0;g.editorDisabled=o.display==='none';}
 });markEditorNodes();selectEditor(null);
}
function saveWestwoodEditor(show=true){localStorage.setItem(WESTWOOD_EDITOR_KEY,JSON.stringify({version:2,objects:editorSnapshot()}));if(show)toast('🌲 Westwood map saved.');}
function loadWestwoodEditor(){try{const x=JSON.parse(localStorage.getItem(WESTWOOD_EDITOR_KEY)||localStorage.getItem('valvondor-westwood-editor-v1')||'null');if(x&&x.objects)applyEditorSnapshot(x.objects)}catch(e){console.warn(e)}}
function selectEditor(el){if(editorSelected)editorSelected.classList.remove('editorSelected');editorSelected=el;if(el){el.classList.add('editorSelected');editorStatus.textContent='Selected: '+(el.dataset.editorName||el.querySelector?.('.gname')?.textContent||el.dataset.editorId||'object')}else editorStatus.textContent='Nothing selected.';}
function enterEditor(){if(currentArea!=='forest')switchArea('forest',FOREST_SPAWN);editorMode=true;document.body.classList.add('mapEditing');markEditorNodes();skyMode=true;camera();setEditorTool('select');toast('🖌️ Paint Editor ready — choose an asset and drag to paint.');}
function leaveEditor(){saveWestwoodEditor(false);editorMode=false;document.body.classList.remove('mapEditing');selectEditor(null);skyMode=false;camera();toast('Westwood editor closed. Map saved.');}
function setEditorTool(tool){
 editorTool=tool;
 document.body.classList.toggle('paintTool',tool==='paint');
 document.body.classList.toggle('terrainTool',tool==='terrain');
 document.body.classList.toggle('eraseTool',tool==='erase');
 document.getElementById('editorSelectTool')?.classList.toggle('active',tool==='select');
 document.getElementById('editorPaintTool')?.classList.toggle('active',tool==='paint'||tool==='terrain');
 document.getElementById('editorEraseTool')?.classList.toggle('active',tool==='erase');
 if(tool==='select')editorStatus.textContent=editorSelected?'Selected: '+(editorSelected.dataset.editorName||'object'):'Select and drag an object.';
 else if(tool==='terrain')editorStatus.textContent=editorBrush?'Terrain Fill: drag a box and release to add '+editorBrush.name+'.':'Choose Grass, Dirt, or Dark Grass.';
 else if(tool==='paint')editorStatus.textContent=editorBrush?'Object Paint: click or drag to place '+editorBrush.name+'.':'Choose an object from the asset library.';
 else editorStatus.textContent='Rectangle Eraser: drag a box around objects to remove them.';
}
function chooseEditorBrush(brush,button){
 editorBrush=brush;
 document.querySelectorAll('.editorAsset,[data-terrain]').forEach(b=>b.classList.remove('active'));
 button?.classList.add('active');
 editorBrushBadge.textContent=(brush.terrain?'Terrain Fill: ':'Brush: ')+brush.name;
 setEditorTool(brush.terrain?'terrain':'paint');
}
function editorWorldPoint(e){const r=forestWorld.getBoundingClientRect();return{x:(e.clientX-r.left)*(W/r.width),y:(e.clientY-r.top)*(H/r.height)}}
function createPaintedObject(brush,x,y){
 const scale=(parseFloat(editorBrushSize.value)||100)/100,random=editorRandomize.checked;
 const jitter=random?Math.max(2,Math.min(28,(parseFloat(editorBrushSpacing.value)||80)*.18)):0;
 x+=random?(Math.random()-.5)*jitter:0;y+=random?(Math.random()-.5)*jitter:0;
 let el;
 if(brush.mob){el=createEditorGoblin(brush.name||'Goblin',x-47,y-54);el.classList.add('editorPlaced');}
 else if(brush.terrain){const size=Math.max(45,140*scale);el=document.createElement('div');el.className='editorTerrain '+brush.terrain+' editorEditable editorPlaced';el.dataset.terrain=brush.terrain;el.dataset.editorId='terrain-'+Date.now()+'-'+Math.random().toString(16).slice(2);el.dataset.editorName=brush.name;el.style.left=Math.round(x-size/2)+'px';el.style.top=Math.round(y-size*.36)+'px';el.style.width=Math.round(size)+'px';el.style.height=Math.round(size*.72)+'px';forestWorld.appendChild(el)}
 else{const w=Math.max(18,brush.width*scale*(random?(.88+Math.random()*.24):1));el=document.createElement('img');el.src=brush.src;el.className='editorPlaced obj editorEditable';el.dataset.editorId='paint-'+Date.now()+'-'+Math.random().toString(16).slice(2);el.dataset.editorName=brush.name;el.style.width=Math.round(w)+'px';el.style.left=Math.round(x-w/2)+'px';el.style.top=Math.round(y-w*.55)+'px';el.style.zIndex=String(brush.category==='Terrain'?6:26);if(random)el.style.transform='scaleX('+(Math.random()<.5?-1:1)+')';forestWorld.appendChild(el)}
 markEditorNodes();return el;
}
function paintAt(x,y){if(!editorBrush)return;createPaintedObject(editorBrush,x,y);editorLastPaint={x,y};}
function eraseElement(el){if(!el||!el.classList.contains('editorEditable')||el.id==='forestWolfIdol')return;const g=goblinStateFor(el);if(g){g.editorDisabled=true;el.style.display='none'}else if(el.classList.contains('editorPlaced')||el.classList.contains('editorTerrain'))el.remove();else el.style.display='none';if(editorSelected===el)selectEditor(null)}
function eraseAt(clientX,clientY){eraseElement(document.elementFromPoint(clientX,clientY)?.closest('.editorEditable'))}
function beginEditorRect(kind,p){
 const el=document.createElement('div');el.className='editorRectPreview'+(kind==='erase'?' erase':'');forestWorld.appendChild(el);
 editorRect={kind,start:p,preview:el,current:p};updateEditorRect(p);
}
function updateEditorRect(p){
 if(!editorRect)return;editorRect.current=p;const x=Math.min(editorRect.start.x,p.x),y=Math.min(editorRect.start.y,p.y),w=Math.max(8,Math.abs(p.x-editorRect.start.x)),h=Math.max(8,Math.abs(p.y-editorRect.start.y));
 Object.assign(editorRect.preview.style,{left:Math.round(x)+'px',top:Math.round(y)+'px',width:Math.round(w)+'px',height:Math.round(h)+'px'});
}
function rectBounds(r){
 let x=Math.min(r.start.x,r.current.x),y=Math.min(r.start.y,r.current.y),w=Math.abs(r.current.x-r.start.x),h=Math.abs(r.current.y-r.start.y);
 if(r.kind==='terrain'&&(w<18||h<18)){w=220;h=160;x=r.start.x-w/2;y=r.start.y-h/2}
 return{x:Math.max(0,x),y:Math.max(0,y),w:Math.max(18,Math.min(W-x,w)),h:Math.max(18,Math.min(H-y,h))}
}
function finishEditorRect(){
 if(!editorRect)return;
 const pending=editorRect,kind=pending.kind,r=rectBounds(pending);
 pending.preview.remove();editorRect=null;
 if(kind==='terrain'){
   if(!editorBrush||!editorBrush.terrain){toast('Choose Grass, Dirt, or Dark Grass first.');return}
   const type=editorBrush.terrain,el=document.createElement('div');el.className='editorTerrain '+type+' editorEditable editorPlaced';el.dataset.terrain=type;el.dataset.editorId='terrain-'+Date.now()+'-'+Math.random().toString(16).slice(2);el.dataset.editorName=editorBrush.name;
   Object.assign(el.style,{left:Math.round(r.x)+'px',top:Math.round(r.y)+'px',width:Math.round(r.w)+'px',height:Math.round(r.h)+'px',borderRadius:'10px',zIndex:'5',display:'block'});forestWorld.appendChild(el);markEditorNodes();selectEditor(el);toast('Terrain area added.');
 }else{
   const rr={left:r.x,top:r.y,right:r.x+r.w,bottom:r.y+r.h};editorEditableNodes().forEach(el=>{if(el.id==='forestWolfIdol'||el.style.display==='none')return;const x=parseFloat(el.style.left)||0,y=parseFloat(el.style.top)||0,w=parseFloat(el.style.width)||el.offsetWidth||40,h=parseFloat(el.style.height)||el.offsetHeight||40;if(x<rr.right&&x+w>rr.left&&y<rr.bottom&&y+h>rr.top)eraseElement(el)});
 }
 saveWestwoodEditor(false);
}
function addEditorAsset(name,src,w){chooseEditorBrush({name,src,width:w,category:'Other'},null)}
function addTerrain(type,button){chooseEditorBrush({name:type+' terrain',terrain:type,width:140,category:'Terrain'},button)}
function renderEditorAssets(){
 const q=(editorAssetSearch.value||'').trim().toLowerCase(),cat=editorAssetCategory.value||'All',box=document.getElementById('editorAssets');box.innerHTML='';
 const special=[{name:'Goblin Mob',category:'Mobs',mob:true}];let shown=0;
 [...special,...EDITOR_ASSET_MANIFEST].forEach(a=>{if(cat!=='All'&&a.category!==cat)return;if(q&&!((a.name+' '+a.src+' '+a.category).toLowerCase().includes(q)))return;
 const b=document.createElement('button');b.className='editorAsset';b.title=a.src||a.name;
 if(a.mob){b.innerHTML='<div class="editorMobThumb">👺</div><b>Goblin Mob</b>';b.onclick=()=>chooseEditorBrush({name:'Goblin Mob',mob:true,width:94,category:'Mobs'},b)}
 else{b.innerHTML='<img loading="lazy" src="'+a.src+'"><b>'+a.name+'</b>';b.onclick=()=>chooseEditorBrush(a,b)}box.appendChild(b);shown++;});
 editorAssetCount.textContent=shown+' assets shown · '+EDITOR_ASSET_MANIFEST.length+' image files available';
}
[...new Set(EDITOR_ASSET_MANIFEST.map(a=>a.category).concat(['Mobs']))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;editorAssetCategory.appendChild(o)});
editorAssetSearch.addEventListener('input',renderEditorAssets);editorAssetCategory.addEventListener('change',renderEditorAssets);renderEditorAssets();
document.getElementById('mapEditorBtn').onclick=()=>editorMode?leaveEditor():enterEditor();document.getElementById('editorClose').onclick=leaveEditor;
document.getElementById('editorSelectTool').onclick=()=>setEditorTool('select');document.getElementById('editorPaintTool').onclick=()=>setEditorTool('paint');document.getElementById('editorEraseTool').onclick=()=>setEditorTool('erase');
document.querySelectorAll('[data-terrain]').forEach(b=>b.onclick=()=>addTerrain(b.dataset.terrain,b));
editorBrushSize.oninput=()=>document.getElementById('editorBrushSizeValue').textContent=editorBrushSize.value+'%';editorBrushSpacing.oninput=()=>document.getElementById('editorBrushSpacingValue').textContent=editorBrushSpacing.value+' px';
forestWorld.addEventListener('pointerdown',e=>{
 if(!editorMode)return;e.preventDefault();
 if(editorTool==='terrain'){
   if(!editorBrush||!editorBrush.terrain){toast('Choose Grass, Dirt, or Dark Grass first.');return}
   pushEditorUndo();beginEditorRect('terrain',editorWorldPoint(e));forestWorld.setPointerCapture?.(e.pointerId);return
 }
 if(editorTool==='paint'){
   if(!editorBrush||editorBrush.terrain){toast('Choose an object from the asset library.');return}
   pushEditorUndo();const p=editorWorldPoint(e);editorPainting=true;editorLastPaint=null;paintAt(p.x,p.y);forestWorld.setPointerCapture?.(e.pointerId);return
 }
 if(editorTool==='erase'){pushEditorUndo();beginEditorRect('erase',editorWorldPoint(e));forestWorld.setPointerCapture?.(e.pointerId);return}
 const el=e.target.closest('.editorEditable');if(!el)return;pushEditorUndo();selectEditor(el);const r=forestWorld.getBoundingClientRect(),er=el.getBoundingClientRect();editorDrag={el,ox:(e.clientX-er.left)/(r.width/W),oy:(e.clientY-er.top)/(r.height/H)};el.setPointerCapture?.(e.pointerId)
});
forestWorld.addEventListener('pointermove',e=>{
 if(!editorMode)return;
 if(editorRect){updateEditorRect(editorWorldPoint(e));return}
 if(editorPainting&&editorTool==='paint'){const p=editorWorldPoint(e),spacing=parseFloat(editorBrushSpacing.value)||80;if(!editorLastPaint||Math.hypot(p.x-editorLastPaint.x,p.y-editorLastPaint.y)>=spacing)paintAt(p.x,p.y);return}
 if(!editorDrag)return;const r=forestWorld.getBoundingClientRect(),sx=W/r.width,sy=H/r.height;let x=(e.clientX-r.left)*sx-editorDrag.ox,y=(e.clientY-r.top)*sy-editorDrag.oy;editorDrag.el.style.left=Math.round(Math.max(0,Math.min(W-20,x)))+'px';editorDrag.el.style.top=Math.round(Math.max(0,Math.min(H-20,y)))+'px'
});
function finishEditorPointer(){if(editorRect)finishEditorRect();if(editorPainting){editorPainting=false;editorLastPaint=null;saveWestwoodEditor(false)}if(editorDrag){const g=goblinStateFor(editorDrag.el);if(g){g.x=g.homeX=parseFloat(editorDrag.el.style.left)||0;g.y=g.homeY=parseFloat(editorDrag.el.style.top)||0}editorDrag=null;saveWestwoodEditor(false)}}
forestWorld.addEventListener('pointerup',finishEditorPointer);forestWorld.addEventListener('pointercancel',finishEditorPointer);forestWorld.addEventListener('lostpointercapture',finishEditorPointer);
window.addEventListener('pointerup',()=>{if(editorMode&&(editorRect||editorPainting||editorDrag))finishEditorPointer()});
window.addEventListener('blur',()=>{if(editorMode&&(editorRect||editorPainting||editorDrag))finishEditorPointer()});
document.getElementById('editorDelete').onclick=()=>{if(!editorSelected)return;pushEditorUndo();const g=goblinStateFor(editorSelected);if(g){g.editorDisabled=true;editorSelected.style.display='none'}else if(editorSelected.classList.contains('editorPlaced')||editorSelected.classList.contains('editorTerrain'))editorSelected.remove();else editorSelected.style.display='none';selectEditor(null);saveWestwoodEditor(false)};
document.getElementById('editorDuplicate').onclick=()=>{if(!editorSelected)return;pushEditorUndo();const o=editorSelected;let el;if(o.classList.contains('forestGoblin'))el=createEditorGoblin(o.querySelector('.gname')?.textContent||'Goblin',(parseFloat(o.style.left)||0)+45,(parseFloat(o.style.top)||0)+45);else if(o.dataset.terrain){el=document.createElement('div');el.className=o.className+' editorPlaced';el.dataset.terrain=o.dataset.terrain;el.dataset.editorId='terrain-'+Date.now();el.style.cssText=o.style.cssText;el.style.left=((parseFloat(o.style.left)||0)+45)+'px';el.style.top=((parseFloat(o.style.top)||0)+45)+'px';forestWorld.appendChild(el)}else if(o.tagName==='IMG'){el=document.createElement('img');el.src=o.src;el.className='editorPlaced obj editorEditable';el.dataset.editorId='copy-'+Date.now();el.dataset.editorName=(o.dataset.editorName||'Copy');el.style.cssText=o.style.cssText;el.style.left=((parseFloat(o.style.left)||0)+45)+'px';el.style.top=((parseFloat(o.style.top)||0)+45)+'px';forestWorld.appendChild(el)}if(el){markEditorNodes();selectEditor(el);saveWestwoodEditor(false)}};
function editorResize(mult){if(!editorSelected)return;pushEditorUndo();const w=parseFloat(editorSelected.style.width)||editorSelected.offsetWidth||90;editorSelected.style.width=Math.max(20,Math.round(w*mult))+'px';if(editorSelected.dataset.terrain){const h=parseFloat(editorSelected.style.height)||180;editorSelected.style.height=Math.max(20,Math.round(h*mult))+'px'}saveWestwoodEditor(false)}
document.getElementById('editorBigger').onclick=()=>editorResize(1.15);document.getElementById('editorSmaller').onclick=()=>editorResize(.87);document.getElementById('editorFront').onclick=()=>{if(editorSelected){editorSelected.style.zIndex=(parseInt(editorSelected.style.zIndex||getComputedStyle(editorSelected).zIndex)||20)+1;saveWestwoodEditor(false)}};document.getElementById('editorBack').onclick=()=>{if(editorSelected){editorSelected.style.zIndex=Math.max(1,(parseInt(editorSelected.style.zIndex||getComputedStyle(editorSelected).zIndex)||20)-1);saveWestwoodEditor(false)}};
document.getElementById('editorSave').onclick=()=>saveWestwoodEditor(true);document.getElementById('editorUndo').onclick=()=>{if(!editorUndoStack.length)return;editorRedoStack.push(JSON.stringify(editorSnapshot()));applyEditorSnapshot(JSON.parse(editorUndoStack.pop()));saveWestwoodEditor(false)};document.getElementById('editorRedo').onclick=()=>{if(!editorRedoStack.length)return;editorUndoStack.push(JSON.stringify(editorSnapshot()));applyEditorSnapshot(JSON.parse(editorRedoStack.pop()));saveWestwoodEditor(false)};
document.getElementById('editorExport').onclick=()=>{const blob=new Blob([JSON.stringify({game:'Valvondor',map:'Westwood Forest',version:'v7.0',objects:editorSnapshot()},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Valvondor_Westwood_Map_v70.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('📤 Westwood map exported.')};
document.getElementById('editorImport').onclick=()=>document.getElementById('editorFile').click();document.getElementById('editorFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!Array.isArray(d.objects))throw Error();pushEditorUndo();applyEditorSnapshot(d.objects);saveWestwoodEditor()}catch(err){toast('That is not a valid Westwood map file.')}};
document.getElementById('editorReset').onclick=()=>{if(!confirm('Reset Westwood to the original layout?'))return;localStorage.removeItem(WESTWOOD_EDITOR_KEY);localStorage.removeItem('valvondor-westwood-editor-v1');location.reload()};
loadWestwoodEditor();

setupFishing();setAnimation('idle',true);requestAnimationFrame(loop);setTimeout(()=>{if(!characterData.created)openCharacterCreator(true)},250);

// v8.36 tutorial boot
setTimeout(()=>{
 if(!tutorialState.complete){
   tutorialState.started=true;
   renderTutorial();
 }
},900);


// ---------- v8.37 Oakhaven visual editor ----------
(function(){
 const btn=document.getElementById('townEditBtn');
 const panel=document.getElementById('townEditPanel');
 const done=document.getElementById('townEditDoneBtn');
 const saveBtn=document.getElementById('townSaveLayoutBtn');
 const resetBtn=document.getElementById('townResetLayoutBtn');
 const snapBtn=document.getElementById('townSnapBtn');
 const hint=document.getElementById('townEditHint');
 const town=document.getElementById('world');
 if(!btn||!panel||!town)return;

 const STORAGE='valvondor-oakhaven-editor-layout-v1';
 const selector='.obj,.districtSign,.marketCrates,.bench,.flowerBed,.townTree,.npc,.landmark';
 let active=false,selected=null,drag=null,snap=10;

 function editables(){
   return [...town.querySelectorAll(selector)].filter(el=>!el.closest('#playerWrap'));
 }
 function keyFor(el){
   if(el.dataset.editKey)return el.dataset.editKey;
   const all=editables(),idx=all.indexOf(el);
   const base=el.id?('#'+el.id):(el.dataset.label?('label:'+el.dataset.label):(el.dataset.id?('id:'+el.dataset.id):el.className.toString().split(/\s+/).slice(0,2).join('.')));
   el.dataset.editKey=base+'@'+idx;
   return el.dataset.editKey;
 }
 function mark(){
   editables().forEach(el=>{el.classList.add('townEditable');keyFor(el)});
 }
 function unmark(){
   editables().forEach(el=>el.classList.remove('townEditable','townSelected','townDragging'));
   selected=null;drag=null;
 }
 function px(v){return Number.parseFloat(v)||0}
 function pos(el){
   const s=getComputedStyle(el);
   return {left:px(el.style.left||s.left),top:px(el.style.top||s.top)};
 }
 function setPos(el,left,top){
   if(snap>0){left=Math.round(left/snap)*snap;top=Math.round(top/snap)*snap}
   el.style.left=left+'px';el.style.top=top+'px';
 }
 function select(el){
   if(selected)selected.classList.remove('townSelected');
   selected=el;
   if(el){
     el.classList.add('townSelected');
     const name=el.dataset.label||el.dataset.id||el.querySelector?.('span')?.textContent||el.id||el.className.toString().split(/\s+/)[0]||'object';
     hint.textContent='Selected: '+name+' — drag it where you want.';
   }else hint.textContent='Drag a building, tree, NPC, sign, or decoration.';
 }
 function saveLayout(show=true){
   const data={};
   editables().forEach(el=>{
     const p=pos(el);
     data[keyFor(el)]={left:p.left,top:p.top};
   });
   localStorage.setItem(STORAGE,JSON.stringify(data));
   if(show)try{toast('💾 Oakhaven layout saved.')}catch(e){}
 }
 function loadLayout(){
   try{
     const data=JSON.parse(localStorage.getItem(STORAGE)||'{}');
     mark();
     editables().forEach(el=>{
       const p=data[keyFor(el)];
       if(p&&Number.isFinite(p.left)&&Number.isFinite(p.top)){
         el.style.left=p.left+'px';el.style.top=p.top+'px';
       }
     });
   }catch(e){}
 }
 function resetLayout(){
   if(!confirm('Reset your Oakhaven editor changes back to the build layout?'))return;
   localStorage.removeItem(STORAGE);
   location.reload();
 }
 function setActive(on){
   active=on;
   document.body.classList.toggle('townEditMode',on);
   panel.classList.toggle('show',on);
   panel.setAttribute('aria-hidden',on?'false':'true');
   btn.textContent=on?'✏️ EDITING OAKHAVEN':'✏️ EDIT OAKHAVEN';
   if(on){mark();try{toast('✏️ Oakhaven Edit Mode: drag town objects.')}catch(e){}}
   else{saveLayout(false);unmark();try{toast('✓ Oakhaven layout saved.')}catch(e){}}
 }

 town.addEventListener('pointerdown',e=>{
   if(!active)return;
   const el=e.target.closest(selector);
   if(!el||!town.contains(el))return;
   e.preventDefault();e.stopPropagation();
   select(el);
   const p=pos(el);
   drag={el,startX:e.clientX,startY:e.clientY,left:p.left,top:p.top};
   el.classList.add('townDragging');
   try{el.setPointerCapture(e.pointerId)}catch(err){}
 },true);

 town.addEventListener('pointermove',e=>{
   if(!active||!drag)return;
   e.preventDefault();e.stopPropagation();
   // Convert screen pointer motion to world coordinates using current camera scale.
   const scale=(typeof cameraScale==='number'&&cameraScale>0)?cameraScale:1;
   const dx=(e.clientX-drag.startX)/scale;
   const dy=(e.clientY-drag.startY)/scale;
   setPos(drag.el,drag.left+dx,drag.top+dy);
 },true);

 function endDrag(e){
   if(!drag)return;
   drag.el.classList.remove('townDragging');
   try{drag.el.releasePointerCapture(e.pointerId)}catch(err){}
   drag=null;saveLayout(false);
 }
 town.addEventListener('pointerup',endDrag,true);
 town.addEventListener('pointercancel',endDrag,true);

 btn.addEventListener('click',()=>setActive(!active));
 done.addEventListener('click',()=>setActive(false));
 saveBtn.addEventListener('click',()=>saveLayout(true));
 resetBtn.addEventListener('click',resetLayout);
 snapBtn.addEventListener('click',()=>{
   snap=snap===10?1:snap===1?0:10;
   snapBtn.textContent='SNAP: '+(snap||'OFF');
   hint.textContent=snap===10?'Snap to 10px grid.':snap===1?'Fine 1px movement.':'Free movement.';
 });

 // Hide editor outside Oakhaven, but keep saved layout.
 const observer=new MutationObserver(()=>{
   const inTown=typeof currentArea==='undefined'||currentArea==='town';
   btn.style.display=inTown?'block':'none';
   if(!inTown&&active)setActive(false);
 });
 observer.observe(document.body,{attributes:true,subtree:false});

 loadLayout();
 window.__oakhavenEditor={save:saveLayout,reset:resetLayout,toggle:()=>setActive(!active)};
})();


// ---------- v8.38 Natural Road Painter ----------
(function(){
 const town=document.getElementById('world');
 const roadBtn=document.getElementById('townRoadBtn');
 const undoBtn=document.getElementById('townRoadUndoBtn');
 const editorBtn=document.getElementById('townEditBtn');
 const hint=document.getElementById('townEditHint');
 if(!town||!roadBtn)return;

 const ROAD_KEY='valvondor-oakhaven-roads-v1';
 let drawing=false, roadMode=false, current=[], roads=[];
 let svg=document.getElementById('townRoadLayer');
 if(!svg){
   svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.id='townRoadLayer';
   svg.setAttribute('viewBox','0 0 2200 1600');
   svg.setAttribute('preserveAspectRatio','none');
   svg.innerHTML=`<defs>
    <filter id="roadRough" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency=".018 .045" numOctaves="2" seed="8" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="8"/>
    </filter>
   </defs><g id="roadPaths"></g>`;
   town.insertBefore(svg,town.firstChild);
 }
 const group=svg.querySelector('#roadPaths');

 function screenToWorld(e){
   const r=town.getBoundingClientRect();
   const sx=2200/r.width, sy=1600/r.height;
   return {x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};
 }
 function simplify(points,min=18){
   if(points.length<3)return points;
   const out=[points[0]];let last=points[0];
   for(let i=1;i<points.length-1;i++){
     const p=points[i],d=Math.hypot(p.x-last.x,p.y-last.y);
     if(d>=min){out.push(p);last=p}
   }
   out.push(points[points.length-1]);return out;
 }
 function smoothPath(points){
   if(points.length<2)return '';
   if(points.length===2)return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
   let d=`M ${points[0].x} ${points[0].y}`;
   for(let i=1;i<points.length-1;i++){
     const p=points[i],n=points[i+1];
     const mx=(p.x+n.x)/2,my=(p.y+n.y)/2;
     d+=` Q ${p.x} ${p.y} ${mx} ${my}`;
   }
   const z=points[points.length-1];d+=` T ${z.x} ${z.y}`;
   return d;
 }
 function draw(){
   group.innerHTML='';
   roads.forEach((pts,i)=>{
     const d=smoothPath(pts);
     ['roadEdge','roadDust','roadMain'].forEach(cls=>{
       const p=document.createElementNS('http://www.w3.org/2000/svg','path');
       p.setAttribute('d',d);p.setAttribute('class',cls);p.dataset.road=i;
       group.appendChild(p);
     });
   });
 }
 function save(){localStorage.setItem(ROAD_KEY,JSON.stringify(roads))}
 function load(){
   try{const r=JSON.parse(localStorage.getItem(ROAD_KEY)||'[]');if(Array.isArray(r))roads=r}catch(e){}
   draw();
 }
 function toggleRoad(on){
   roadMode=on;
   document.body.classList.toggle('townRoadMode',on);
   roadBtn.classList.toggle('active',on);
   roadBtn.textContent=on?'🛣️ ROAD: ON':'🛣️ DRAW ROAD';
   if(hint)hint.textContent=on?'Drag across Oakhaven to paint a curved road. Release to finish it.':'Drag a building, tree, NPC, sign, or decoration.';
 }
 roadBtn.addEventListener('click',e=>{e.stopPropagation();toggleRoad(!roadMode)});
 undoBtn?.addEventListener('click',()=>{
   if(!roads.length)return;
   roads.pop();save();draw();
   try{toast('↶ Last road removed.')}catch(e){}
 });
 town.addEventListener('pointerdown',e=>{
   if(!roadMode)return;
   e.preventDefault();e.stopImmediatePropagation();
   drawing=true;current=[screenToWorld(e)];
   try{town.setPointerCapture(e.pointerId)}catch(err){}
 },true);
 town.addEventListener('pointermove',e=>{
   if(!roadMode||!drawing)return;
   e.preventDefault();e.stopImmediatePropagation();
   const p=screenToWorld(e),last=current[current.length-1];
   if(Math.hypot(p.x-last.x,p.y-last.y)>8)current.push(p);
 },true);
 function finish(e){
   if(!roadMode||!drawing)return;
   e.preventDefault();e.stopImmediatePropagation();
   drawing=false;
   const pts=simplify(current);
   if(pts.length>1){roads.push(pts);save();draw();try{toast('🛣️ Road added.')}catch(err){}}
   current=[];
 }
 town.addEventListener('pointerup',finish,true);
 town.addEventListener('pointercancel',finish,true);

 // Road painting is only intended while the town editor is open.
 editorBtn?.addEventListener('click',()=>setTimeout(()=>{
   if(!document.body.classList.contains('townEditMode'))toggleRoad(false);
 },0));
 document.getElementById('townEditDoneBtn')?.addEventListener('click',()=>toggleRoad(false));
 document.getElementById('townResetLayoutBtn')?.addEventListener('click',()=>{
   if(confirm('Also remove all roads you painted?')){localStorage.removeItem(ROAD_KEY);roads=[];draw()}
 });
 load();
 window.__oakhavenRoads={get:()=>roads,save,clear:()=>{roads=[];save();draw()}};
})();


// v8.47 Male Wolf Knight player sprite pack
var V847_KNIGHT_BASE='assets/player_wolf_knight_male/';
var V847_KNIGHT={
 idle:{
   down:['assets/player_wolf_knight_male/v2/idle_down_1.png'],
   up:['assets/player_wolf_knight_male/v2/idle_up_1.png'],
   left:['assets/player_wolf_knight_male/v2/idle_left_1.png'],
   right:['assets/player_wolf_knight_male/v2/idle_right_1.png']
 },
 walk:{
   down:[`assets/player_wolf_knight_male/v2/walk_down_1.png`],
   up:[`assets/player_wolf_knight_male/v2/walk_up_1.png`],
   left:[`assets/player_wolf_knight_male/v2/walk_left_1.png`],
   right:[`assets/player_wolf_knight_male/v2/walk_right_1.png`]
 },
 attack:[1,2,3,4,5].map(n=>`${V847_KNIGHT_BASE}attack_${n}.png`),
 hurt:[1,2,3].map(n=>`${V847_KNIGHT_BASE}hurt_${n}.png`),
 death:[1,2,3,4,5,6].map(n=>`${V847_KNIGHT_BASE}death_${n}.png`),
 jump:[1,2,3,4].map(n=>`${V847_KNIGHT_BASE}jump_${n}.png`),
 dodge:[1,2,3].map(n=>`${V847_KNIGHT_BASE}dodge_${n}.png`),
 interact:[1,2].map(n=>`${V847_KNIGHT_BASE}interact_${n}.png`),
 rest:[1,2,3].map(n=>`${V847_KNIGHT_BASE}rest_${n}.png`)
};
window.VALVONDOR_V847_KNIGHT=V847_KNIGHT;
setTimeout(()=>{
  try{
    if(characterData.hero==='wolf_knight_male'){
      frame=0;
      setAnimation('idle',true);
    }
  }catch(e){console.error('v8.77 movement refresh',e)}
},0);

setTimeout(()=>{
  try{
    if(characterData.hero==='wolf_knight_male')setAnimation('idle',true);
  }catch(e){console.error('Male Wolf Knight sprite refresh',e)}
},0);


// v8.48 detailed knight display sizing
(function(){
  const style=document.createElement('style');
  style.textContent=`
    #playerWrap[data-hero="wolf_knight_male"] #player{width:128px!important;height:128px!important}
  `;
  document.head.appendChild(style);
})();


// v8.59 movement-frame visibility safety
(function(){
  const originalWolfFramePath=wolfFramePath;
  window.__valvondorFrameFallbackCache={};
  wolfFramePath=function(animName,dir,frameIndex){
    const src=originalWolfFramePath(animName,dir,frameIndex);
    if(characterData.hero==='wolf_knight_male' && (animName==='walk'||animName==='run'||animName==='idle')){
      const key=(animName==='run'?'walk':animName);
      const safeSet=(typeof V847_KNIGHT!=='undefined' && V847_KNIGHT[key] && V847_KNIGHT[key][dir]) ? V847_KNIGHT[key][dir] : null;
      if(safeSet && safeSet.length){
        const safe=safeSet[0];
        const cached=window.__valvondorFrameFallbackCache[src];
        if(cached===false)return safe;
        if(cached===undefined){
          const probe=new Image();
          probe.onload=()=>{window.__valvondorFrameFallbackCache[src]=(probe.naturalWidth>0&&probe.naturalHeight>0)};
          probe.onerror=()=>{window.__valvondorFrameFallbackCache[src]=false};
          probe.src=src;
        }
      }
    }
    return src;
  };
})();


// v8.60 Male Wolf Knight stable idle.
// When stationary, always render frame 1 for the current facing direction.
(function(){
  const previousWolfFramePath = wolfFramePath;
  wolfFramePath = function(animName, dir, frameIndex){
    if(characterData.hero === 'wolf_knight_male' && animName === 'idle'){
      frameIndex = 0;
    }
    return previousWolfFramePath(animName, dir, frameIndex);
  };
})();


// v8.69 runtime asset safety log
window.valvondorAssetAudit={missing:[]};
document.addEventListener('error',e=>{const el=e.target;if(el&&el.tagName==='IMG'&&el.src){window.valvondorAssetAudit.missing.push(el.src);console.error('[Valvondor missing image]',el.src)}},true);


// v8.70 Brimvault audit: add missing Iron Veins and replace accidental sprite-sheet props.
(function(){
  const mine=document.getElementById('mineWorld');
  if(!mine)return;
  mine.querySelectorAll('.mineProp').forEach((el,i)=>{ if(i<2)el.classList.add('auditBadSheet'); });

  const props=[
    ['assets/dungeon/v816/barrel.png',720,930,58],
    ['assets/dungeon/v816/crate.png',790,900,62],
    ['assets/dungeon/v816/standing_brazier.png',1280,610,70],
    ['assets/dungeon/v816/pillar.png',1340,300,68],
    ['assets/dungeon/v816/bones.png',690,360,62],
    ['assets/dungeon/v816/rubble.png',1110,480,70]
  ];
  props.forEach(([src,x,y,w])=>{
    const im=document.createElement('img');im.className='auditMineProp';im.src=src;
    im.style.left=x+'px';im.style.top=y+'px';im.style.width=w+'px';mine.appendChild(im);
  });

  if(!mine.querySelector('.oreVein[data-ore="iron"]')){
    [[870,360],[1435,300]].forEach(([x,y])=>{
      const v=document.createElement('div');v.className='oreVein';v.dataset.ore='iron';
      v.style.left=x+'px';v.style.top=y+'px';
      v.innerHTML='<span class="rock">🪨</span><span class="gem">⚪</span><span class="oreLabel">Iron Vein</span>';
      mine.appendChild(v);
    });
  }
})();


// v8.71 Kael quest dialog controls.
// The quest dialog markup appears after script_01.js in index.html, so listeners must be bound
// after DOMContentLoaded instead of during script execution.
function handleBoarQuestAction(){
  if(!boarQuestState.accepted){
    boarQuestState.accepted=true;
    boarQuestState.kills=0;
    boarQuestState.claimed=false;
    saveBoarQuest();
    save(false);
    updateBoarQuestMarker();
    toast('📜 Tusks on the Trail started.');
    closeBoarQuestDialog();
    return;
  }

  if(boarQuestState.claimed){
    closeBoarQuestDialog();
    return;
  }

  if(boarQuestReady()){
    inventoryData.boar_tusk=Math.max(0,(inventoryData.boar_tusk||0)-1);
    addItem('gold',150);
    gainXP(125);
    boarQuestState.claimed=true;
    saveBoarQuest();
    save(false);
    updateBoarQuestMarker();
    refreshQuestPanelIfOpen();
    toast('🏆 Tusks on the Trail complete! +125 XP · +150 Bronze');
    closeBoarQuestDialog();
    return;
  }

  // "KEEP HUNTING" must always release the modal instead of trapping the player.
  closeBoarQuestDialog();
}

function bindBoarQuestDialogControls(){
  const dlg=document.getElementById('boarQuestDialog');
  const close=document.getElementById('boarQuestClose');
  const action=document.getElementById('boarQuestAction');
  if(!dlg||!close||!action)return;

  close.onclick=(e)=>{
    if(e){e.preventDefault();e.stopPropagation();}
    closeBoarQuestDialog();
  };

  action.onclick=(e)=>{
    if(e){e.preventDefault();e.stopPropagation();}
    handleBoarQuestAction();
  };

  // Click outside the card closes the dialog.
  dlg.onclick=(e)=>{
    if(e.target===dlg)closeBoarQuestDialog();
  };
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bindBoarQuestDialogControls,{once:true});
}else{
  bindBoarQuestDialogControls();
}

document.addEventListener('keydown',(e)=>{
  if(e.code==='Escape' && document.getElementById('boarQuestDialog')?.classList.contains('open')){
    e.preventDefault();
    closeBoarQuestDialog();
  }
});



function buildBrimvaultVisual(){
  const mine=document.getElementById('mineWorld');
  if(!mine)return;
  mine.querySelector('.brimvaultVisual')?.remove();

  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('class','brimvaultVisual');
  svg.setAttribute('viewBox','0 0 2000 1400');
  svg.setAttribute('preserveAspectRatio','none');

  const defs=document.createElementNS(NS,'defs');
  defs.innerHTML=`
    <filter id="mineGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="16" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="mineNoise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="3" seed="9" result="n"/>
      <feColorMatrix in="n" type="matrix" values=".22 0 0 0 0  0 .18 0 0 0  0 0 .13 0 0  0 0 0 .30 0"/>
    </filter>`;
  svg.appendChild(defs);

  const mk=(name,attrs={})=>{const e=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));return e};
  const pathLayer=mk('g');
  svg.appendChild(pathLayer);

  // Each collision segment becomes a layered cave corridor with rounded, organic edges.
  MINE_WALK_SEGMENTS.forEach(([[ax,ay],[bx,by]],i)=>{
    const d=`M ${ax} ${ay} L ${bx} ${by}`;
    pathLayer.appendChild(mk('path',{d,stroke:'#070605','stroke-width':250,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'}));
    pathLayer.appendChild(mk('path',{d,stroke:'#2c251f','stroke-width':220,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'}));
    pathLayer.appendChild(mk('path',{d,stroke:'#5a4a3b','stroke-width':166,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'}));
    pathLayer.appendChild(mk('path',{d,stroke:'#75604b','stroke-width':3,'stroke-linecap':'round','stroke-dasharray':'9 25',opacity:'.35',fill:'none'}));
  });

  // Organic chambers matching collision rooms. No perfect circular "map diagram" shapes.
  MINE_WALK_ROOMS.forEach(([cx,cy,r],i)=>{
    const pts=[];
    const n=14;
    for(let k=0;k<n;k++){
      const a=Math.PI*2*k/n;
      const wobble=1 + .08*Math.sin(k*2.3+i*1.7) + .045*Math.cos(k*3.1+i);
      const rx=r*(i===5?1.20:1.08)*wobble;
      const ry=r*(i===5?.88:1.00)*(1+.05*Math.cos(k*2.7+i));
      pts.push(`${cx+Math.cos(a)*rx},${cy+Math.sin(a)*ry}`);
    }
    const polygon=pts.join(' ');
    pathLayer.appendChild(mk('polygon',{points:polygon,fill:'#070605'}));
    // inset versions by scaling around center
    const inner=(scale,color)=>{
      const p=pts.map(s=>{const [x,y]=s.split(',').map(Number);return `${cx+(x-cx)*scale},${cy+(y-cy)*scale}`}).join(' ');
      pathLayer.appendChild(mk('polygon',{points:p,fill:color}));
    };
    inner(.90,'#302820');inner(.73,'#594a3b');
  });

  // Rocky floor grain.
  const grain=mk('rect',{x:0,y:0,width:2000,height:1400,filter:'url(#mineNoise)',opacity:'.32','pointer-events':'none'});
  svg.appendChild(grain);

  // Warm cave lamps in actual walkable chambers.
  [[1000,1160],[610,760],[900,650],[1160,650],[880,330],[1475,235]].forEach(([x,y],i)=>{
    const glow=mk('circle',{cx:x,cy:y,r:i===5?105:75,fill:'#ff9d28',opacity:'.09',filter:'url(#mineGlow)'});
    const ember=mk('circle',{cx:x,cy:y,r:7,fill:'#ffc45e',opacity:'.95'});
    svg.appendChild(glow);svg.appendChild(ember);
  });

  mine.insertBefore(svg,mine.firstChild);

  // Timber braces laid across selected corridor points.
  mine.querySelectorAll('.brimSupport').forEach(e=>e.remove());
  [
    [845,1080,-27],[510,885,-57],[650,630,-16],[805,557,-34],
    [1075,585,35],[1340,585,-40],[1420,455,-68],[1465,330,-86]
  ].forEach(([x,y,a])=>{
    const s=document.createElement('div');
    s.className='brimSupport';s.style.left=x+'px';s.style.top=y+'px';s.style.transform=`translate(-50%,-50%) rotate(${a}deg)`;
    mine.appendChild(s);
  });
}
setTimeout(buildBrimvaultVisual,0);


// v9.00 Female Wolf Archer player sizing
(function(){
  const style=document.createElement('style');
  style.textContent=`
    #playerWrap[data-hero="wolf_archer_female"] #player{
      width:128px!important;height:128px!important;
      background-size:contain!important;
      image-rendering:auto;
    }
  `;
  document.head.appendChild(style);
})();



/* v9.29 Mayor Alden Thorne test NPC — uses crops from approved user sheet. */
(function(){
 const BASE='assets/approved_2026_08_15/mayor_alden/';
 function spawnMayorAlden(){
   const town=document.getElementById('world');
   if(!town||document.getElementById('mayorAldenTestNpc'))return;
   const n=document.createElement('div');
   n.id='mayorAldenTestNpc';
   n.className='npc';
   n.dataset.id='mayor_alden_thorne';
   n.dataset.talk='Mayor Alden Thorne';
   n.style.cssText='position:absolute;left:1185px;top:455px;width:96px;height:120px;z-index:38;text-align:center;cursor:pointer;';
   n.innerHTML='<div style="position:absolute;left:35px;top:-23px;font:bold 23px Georgia;color:#ffd45d;text-shadow:0 2px 3px #000">!</div>'+
     '<img src="'+BASE+'idle_front.png" alt="Mayor Alden Thorne" style="width:96px;height:120px;object-fit:contain;image-rendering:auto;filter:drop-shadow(0 3px 2px #0008)">'+
     '<span style="position:absolute;left:50%;bottom:-18px;transform:translateX(-50%);white-space:nowrap;background:#17130de8;border:1px solid #b98936;border-radius:5px;padding:2px 7px;color:#f6e3b0;font:bold 11px Georgia">Mayor Alden</span>';
   town.appendChild(n);
   n.addEventListener('click',function(e){
     e.stopPropagation();
     let box=document.getElementById('mayorAldenTestDialog');
     if(!box){
       box=document.createElement('div');box.id='mayorAldenTestDialog';
       box.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:99999;width:min(680px,88vw);background:#100e0beF;border:2px solid #c89439;border-radius:14px;padding:22px;color:#f7ead0;font-family:Georgia;box-shadow:0 10px 40px #000c';
       box.innerHTML='<div style="font-size:28px;font-weight:bold;color:#e6bb61">Mayor Alden Thorne</div>'+
        '<div style="color:#a9c6a1;margin:3px 0 15px">Mayor of Oakhaven</div>'+
        '<div style="font-size:18px;line-height:1.45">Welcome to Oakhaven, traveler. This town has seen hard times, but we’re rebuilding—and with brave souls like you, we’ll be stronger than ever.</div>'+
        '<button id="mayorAldenClose" style="margin-top:18px;padding:9px 18px;background:#18251d;color:#f8e4ae;border:1px solid #c89439;border-radius:8px;font-weight:bold">GOODBYE</button>';
       document.body.appendChild(box);
       box.querySelector('#mayorAldenClose').onclick=()=>box.remove();
     }
   });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(spawnMayorAlden,700));
 else setTimeout(spawnMayorAlden,700);
})();
