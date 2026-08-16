
/* ==========================================================================
   Valvondor v8.80 — REAL GAME TURN-BATTLE TEST
   Scope is deliberately limited:
     • West Wood Forest Goblin Scouts only.
     • Existing overworld combat remains unchanged for every other enemy.
     • Victory uses the real goblin kill counter, XP, auto-loot, tutorial
       progress, save system, and existing respawn function.
   ========================================================================== */
(function(){
'use strict';
if(window.__VALVONDOR_TURN_BATTLE_V880__) return;
window.__VALVONDOR_TURN_BATTLE_V880__=true;

let battleActive=false;
let battleTarget=null;
let battleReturnPos=null;
let battlePlayerHP=1;
let battlePlayerMax=1;
let battleEnemyHP=1;
let battleEnemyMax=1;
let battleMP=128;
const battleMPMax=128;
let battleCombo=0;
let battleTurn=1;
let battleGuard=false;
let battleTiming=false;
let battleNeedle=0;
let battleNeedleDir=1;
let battleRaf=0;
let battleBusy=false;
let battleFinished=false;
let battleOriginArea='forest';
let battleOriginPos=null;
let battleOriginDungeonRoom=null;
let battleBackgroundOverride='';
window.__turnBattleIsActive=()=>battleActive;

const FX={
 moon:['01','02','03','04','05','06'].map(n=>'assets/battle/effects/moon/moon_'+n+'.png'),
 wolf:['01','02','03','04','05','06'].map(n=>'assets/battle/effects/wolf/wolf_'+n+'.png'),
 guard:['01','02','03','04','05','06'].map(n=>'assets/battle/effects/guard/guard_'+n+'.png'),
 hit:['01','02','03'].map(n=>'assets/battle/effects/hit/hit_'+n+'.png')
};


function forceBattleBackground(kind){
 const arena=document.querySelector('.tbArena');
 if(!arena)return;
 if(kind==='dungeon'){
   arena.style.backgroundImage="url('assets/battle_backgrounds/dungeon_regular.jpg')";
 }else if(kind==='boss'){
   arena.style.backgroundImage="url('assets/battle_backgrounds/dungeon_boss.jpg')";
 }else if(kind==='oakhaven'||kind==='town'){
   arena.style.backgroundImage="url('assets/approved_2026_08_14/battle_backgrounds/oakhaven_outskirts_approved.png')";
 }else{
   arena.style.backgroundImage="url('assets/battle/west_wood_battle_bg.png')";
 }
 arena.style.backgroundSize='cover';
 arena.style.backgroundPosition='center';
 arena.style.backgroundRepeat='no-repeat';
}
window.__forceBattleBackground=forceBattleBackground;

function injectBattleUI(){
 if(document.getElementById('turnBattleOverlay')) return;

 const style=document.createElement('style');
 style.id='turnBattleStyles';
 style.textContent=`
 #turnBattleOverlay{position:fixed;inset:0;z-index:100000;background:#050505;display:none;opacity:0;transition:opacity .22s ease;color:#f3e5c5;font-family:Georgia,serif}
 #turnBattleOverlay.show{display:block;opacity:1}
 #turnBattleGame{width:100%;height:100%;position:relative;overflow:hidden;background:#080808}
 .tbTop{position:absolute;left:0;right:0;top:0;height:10%;min-height:58px;background:linear-gradient(#17120d,#080706);border-bottom:3px solid #896632;display:flex;align-items:center;justify-content:center;z-index:20}
 .tbTitle{font-size:clamp(22px,5vw,52px);letter-spacing:3px;color:#dfbd73;text-shadow:0 2px #000}
 .tbZone,.tbEnemyTag{position:absolute;top:8px;border:2px solid #6d522b;border-radius:7px;background:#080808e8;padding:6px 9px;font:clamp(9px,2vw,14px) Arial,sans-serif}
 .tbZone{left:8px}.tbEnemyTag{right:8px;text-align:right}
 .tbCrest{position:absolute;left:50%;bottom:-29px;transform:translateX(-50%);width:54px;height:54px;border-radius:50%;border:3px solid #8a6732;background:#111;overflow:hidden;display:flex;align-items:center;justify-content:center}
 .tbCrest img{width:86%;height:86%;object-fit:contain;filter:drop-shadow(0 0 4px #b58a43)}
 .tbArena{position:absolute;top:10%;left:0;right:0;height:57%;background:url('assets/battle/west_wood_battle_bg.png') center/cover no-repeat;overflow:hidden}
 .tbStat{position:absolute;top:5.5%;z-index:7;width:min(29vw,285px);padding:7px 9px;background:linear-gradient(145deg,#171717f3,#080808f3);border:2px solid #7d5d30;border-radius:8px;box-shadow:inset 0 0 0 1px #241b10;font-family:Arial,sans-serif}
 #tbHeroStat{left:1.5%}#tbEnemyStat{right:1.5%}
 .tbName{font:bold clamp(14px,3vw,24px) Georgia}.tbLv{color:#d6ad5f;margin:2px 0 5px}
 .tbRow{display:flex;align-items:center;gap:6px;margin-top:4px}
 .tbBar{flex:1;height:14px;border:1px solid #9b743e;background:#251717;border-radius:4px;overflow:hidden;position:relative}
 .tbFill{height:100%;transition:.3s}.tbHP{background:linear-gradient(90deg,#741010,#d33a2d)}.tbMP{background:linear-gradient(90deg,#0d3f77,#2781d5)}
 .tbBarText{position:absolute;inset:0;text-align:center;font:11px Arial;color:#fff;text-shadow:1px 1px #000}
 .tbUnit{position:absolute;bottom:5%;z-index:5;transition:.22s}.tbHero{left:18%}.tbEnemy{right:19%}
 .tbSprite{width:clamp(135px,23vw,220px);height:clamp(165px,27vw,255px);display:flex;align-items:flex-end;justify-content:center;filter:drop-shadow(0 9px 5px #000)}
 .tbSprite img{max-width:100%;max-height:100%;object-fit:contain;image-rendering:pixelated}
 .tbShadow{width:100px;height:13px;background:#0008;border-radius:50%;margin:-7px auto}
 .tbBottom{position:absolute;left:0;right:0;bottom:0;height:33%;display:grid;grid-template-columns:27% 48% 25%;background:#070707fa;border-top:3px solid #896632;z-index:25}
 .tbPane{border-right:2px solid #3b2e1c;padding:5px;overflow:auto}
 .tbMenu button{width:100%;height:20%;min-height:32px;background:linear-gradient(#1b2430,#0d1117);color:#f4e6c8;border:1px solid #344255;border-radius:5px;text-align:left;padding-left:9px;font:bold clamp(12px,2.8vw,20px) Georgia}
 .tbMenu button:active{background:linear-gradient(#1a527c,#10283d)}
 .tbCenter{display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center}
 .tbActionBox{display:none;width:96%}.tbActionBox.show{display:block}
 .tbSmall{font:12px Arial;color:#d0c8b4;margin:3px 0 7px}
 #tbMeter{height:29px;border:2px solid #8d6a35;border-radius:7px;background:linear-gradient(90deg,#7b281b,#ca5a22,#cda52a,#45a64d,#cda52a,#ca5a22,#7b281b);position:relative;overflow:hidden}
 #tbTarget{position:absolute;left:43%;width:14%;top:0;bottom:0;border:3px solid #8dff98;background:#5cff6b35}
 #tbNeedle{position:absolute;top:-4px;width:5px;height:37px;background:#fff;box-shadow:0 0 8px #fff}
 #tbStrike{margin-top:7px;width:92%;height:44px;border:2px solid #c9a45e;background:#173b20;color:#fff;border-radius:8px;font:bold 18px Arial}
 .tbSub button{width:95%;margin:4px auto;padding:8px 10px;background:linear-gradient(#1a2430,#0e1218);border:1px solid #42536a;color:#f4e6c8;border-radius:6px;font:bold 13px Georgia;text-align:left}
 .tbSub button span{float:right;color:#8fc5ff;font:12px Arial}
 .tbInfo{margin-top:8px;width:94%;display:flex;justify-content:space-around;gap:5px;font:12px Arial;color:#d8c9aa}
 .tbInfo div{border:1px solid #49361d;background:#111;padding:5px 7px;border-radius:4px}
 .tbSideTitle{text-align:center;color:#d6ad60;border-bottom:1px solid #4a371f;padding:4px;font:bold 12px Arial}
 .tbTurn{padding:8px 4px;margin:5px 0;border:1px solid #49361d;background:#151515;font:13px Arial}
 #tbFx{position:absolute;inset:0;z-index:15;pointer-events:none;overflow:hidden}
 .tbFrameFx{position:absolute;object-fit:contain;pointer-events:none;z-index:16;transform:translate(-50%,-50%)}
 .tbFxMoon{width:34%}.tbFxWolf{width:38%}.tbFxGuard{width:30%}.tbFxHit{width:22%}
 .tbDamage{position:absolute;z-index:18;font:bold clamp(24px,5vw,42px) Georgia;color:#ffd36a;text-shadow:0 2px #000,0 0 8px #ff8b00;animation:tbDamage .8s forwards;pointer-events:none}
 @keyframes tbDamage{0%{opacity:0;transform:translate(-50%,0) scale(.6)}20%{opacity:1;transform:translate(-50%,-10px) scale(1.2)}100%{opacity:0;transform:translate(-50%,-65px) scale(1)}}
 .tbHit{animation:tbShake .25s}.tbLunge{animation:tbLunge .42s}
 @keyframes tbShake{25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}
 @keyframes tbLunge{50%{transform:translateX(75px) scale(1.08)}}
 #tbResult{min-height:20px;margin-top:4px;font:bold 13px Arial}
 #tbMessage{display:none;position:absolute;z-index:40;left:50%;top:39%;transform:translate(-50%,-50%);background:#050505f2;border:2px solid #b48947;border-radius:8px;padding:14px 20px;text-align:center;font:bold clamp(18px,4vw,30px) Georgia;min-width:250px}
 #tbReturn{display:none;margin:10px auto 0;padding:9px 18px;background:#203b27;color:#fff;border:1px solid #d0ad67;border-radius:5px;font-weight:bold}
 @media (max-width:650px){
   .tbBottom{grid-template-columns:27% 48% 25%}
   .tbStat{width:31vw;top:5%}
   .tbHero{left:14%}.tbEnemy{right:15%}
   .tbSprite{width:clamp(120px,26vw,180px);height:clamp(150px,30vw,210px)}
   .tbZone,.tbEnemyTag{font-size:9px;padding:5px 7px}
 }
 `;
 document.head.appendChild(style);

 const overlay=document.createElement('div');
 overlay.id='turnBattleOverlay';
 overlay.innerHTML=`
 <div id="turnBattleGame">
   <div class="tbTop">
     <div class="tbZone">VALVONDOR<br><small>BATTLE</small></div>
     <div class="tbTitle">VALVONDOR</div>
     <div class="tbCrest"><img src="assets/owner_gear/owners_wolfplate.png" alt=""></div>
     <div class="tbEnemyTag">Battle 1 / 1<br><small>Goblin Scout</small></div>
   </div>

   <div class="tbArena">
     <div id="tbHeroStat" class="tbStat">
       <div id="tbHeroName" class="tbName">WALLY</div><div id="tbHeroLv" class="tbLv">Lv. 1</div>
       <div class="tbRow"><b>HP</b><div class="tbBar"><div id="tbHeroHP" class="tbFill tbHP"></div><div id="tbHeroHPText" class="tbBarText"></div></div></div>
       <div class="tbRow"><b>MP</b><div class="tbBar"><div id="tbHeroMP" class="tbFill tbMP"></div><div id="tbHeroMPText" class="tbBarText"></div></div></div>
     </div>
     <div id="tbEnemyStat" class="tbStat">
       <div id="tbEnemyName" class="tbName">Goblin Scout</div><div id="tbEnemyLevel" class="tbLv">West Wood</div>
       <div class="tbRow"><b>HP</b><div class="tbBar"><div id="tbEnemyHP" class="tbFill tbHP"></div><div id="tbEnemyHPText" class="tbBarText"></div></div></div>
     </div>
     <div id="tbFx"></div>
     <div id="tbHero" class="tbUnit tbHero"><div class="tbSprite"><img src="assets/player_wolf_knight_male/v2/idle_right_1.png" alt="Player"></div><div class="tbShadow"></div></div>
     <div id="tbEnemy" class="tbUnit tbEnemy"><div class="tbSprite"><img id="tbEnemyImage" src="assets/dungeon/v810/goblin_scout.png"></div><div class="tbShadow"></div></div>
   </div>

   <div id="tbMessage"><div id="tbMessageText"></div><button id="tbReturn">RETURN TO WEST WOOD</button></div>

   <div class="tbBottom">
     <div class="tbPane tbMenu">
       <button id="tbAttack">⚔️ Attack</button>
       <button id="tbSkills">✨ Skill</button>
       <button id="tbItems">🧪 Item</button>
       <button id="tbDefend">🛡️ Defend</button>
       <button id="tbRun">🥾 Run</button>
     </div>
     <div class="tbPane tbCenter">
       <div id="tbDesc">Choose an action.</div>
       <div id="tbTiming" class="tbActionBox">
         <b style="color:#7ee18b">TIMED ATTACK</b>
         <div class="tbSmall">Tap when the line is in the green.</div>
         <div id="tbMeter"><div id="tbTarget"></div><div id="tbNeedle"></div></div>
         <button id="tbStrike">TAP TO STRIKE</button>
         <div id="tbResult"></div>
       </div>
       <div id="tbSkillMenu" class="tbActionBox tbSub">
         <button data-skill="wolf">🐺 Wolf Fang <span>20 MP</span></button>
         <button data-skill="guard">💥 Guard Break <span>15 MP</span></button>
         <button data-skill="moon">🌙 Moon Slash <span>32 MP</span></button>
         <button data-back="1">↩ Back</button>
       </div>
       <div id="tbItemMenu" class="tbActionBox tbSub">
         <button data-item="health_potion">🧪 Health Potion <span id="tbPotionCount">x0</span></button>
         <button data-item="wolfheart_elixir">💙 Wolfheart Elixir <span id="tbElixirCount">x0</span></button>
         <button data-back="1">↩ Back</button>
       </div>
       <div class="tbInfo">
         <div><b>Combo</b> <span id="tbCombo">0</span></div>
         <div><b>Bonus</b> <span id="tbBonus">x1.00</span></div>
         <div><b>Turn</b> <span id="tbTurn">1</span></div>
       </div>
     </div>
     <div class="tbPane">
       <div class="tbSideTitle">TURN ORDER</div>
       <div id="tbTurnPlayer" class="tbTurn">Wally</div>
       <div id="tbTurnEnemy" class="tbTurn">Goblin Scout</div>
     </div>
   </div>
 </div>`;
 document.body.appendChild(overlay);

 document.getElementById('tbAttack').onclick=startTimedAttack;
 document.getElementById('tbSkills').onclick=showSkills;
 document.getElementById('tbItems').onclick=showItems;
 document.getElementById('tbDefend').onclick=defendBattle;
 document.getElementById('tbRun').onclick=runBattle;
 document.getElementById('tbStrike').onclick=resolveTimedAttack;
 document.getElementById('tbReturn').onclick=returnFromBattle;
 overlay.querySelectorAll('[data-back]').forEach(b=>b.onclick=showMainChoice);
 overlay.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>useSkill(b.dataset.skill));
 overlay.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>useBattleItem(b.dataset.item));
}

function q(id){return document.getElementById(id)}
function hideBattleActions(){
 ['tbTiming','tbSkillMenu','tbItemMenu'].forEach(id=>q(id)?.classList.remove('show'));
}
function showMainChoice(){
 if(!battleActive||battleBusy||battleFinished)return;
 hideBattleActions();
 q('tbDesc').textContent='Choose an action.';
}
function updateBattleUI(){
 if(!q('tbHeroHP'))return;
 q('tbHeroHP').style.width=(battlePlayerHP/battlePlayerMax*100)+'%';
 q('tbHeroHPText').textContent=Math.max(0,battlePlayerHP)+' / '+battlePlayerMax;
 q('tbEnemyHP').style.width=(battleEnemyHP/battleEnemyMax*100)+'%';
 q('tbEnemyHPText').textContent=Math.max(0,battleEnemyHP)+' / '+battleEnemyMax;
 q('tbHeroMP').style.width=(battleMP/battleMPMax*100)+'%';
 q('tbHeroMPText').textContent=battleMP+' / '+battleMPMax;
 q('tbCombo').textContent=battleCombo;
 q('tbBonus').textContent='x'+(1+Math.min(battleCombo,5)*.10).toFixed(2);
 q('tbTurn').textContent=battleTurn;
 q('tbPotionCount').textContent='x'+Math.max(0,inventoryData.health_potion||0);
 q('tbElixirCount').textContent='x'+Math.max(0,inventoryData.wolfheart_elixir||0);
 q('tbHeroName').textContent=String(characterData?.name||'Wally').toUpperCase();
 if(q('tbTurnPlayer'))q('tbTurnPlayer').textContent='Wally';
 q('tbHeroLv').textContent='Lv. '+Math.max(1,Number(playerLevel)||1);
}
function anchorPoint(targetId,xBias=0,yBias=0){
 const target=q(targetId), arena=document.querySelector('.tbArena');
 if(!target||!arena)return{x:0,y:0};
 const tr=target.getBoundingClientRect(),ar=arena.getBoundingClientRect();
 return{x:tr.left-ar.left+tr.width/2+xBias,y:tr.top-ar.top+tr.height*.68+yBias};
}
function playFrames(list,cls,frameMs=90,targetId='tbEnemy',xBias=0,yBias=0,travelFromHero=false){
 const img=document.createElement('img');
 img.className='tbFrameFx '+cls;
 q('tbFx').appendChild(img);
 const dest=anchorPoint(targetId,xBias,yBias);
 const start=travelFromHero?anchorPoint('tbHero',0,-4):dest;
 let i=0;
 function next(){
   img.src=list[i];
   const t=list.length<=1?1:i/(list.length-1);
   img.style.left=(start.x+(dest.x-start.x)*t)+'px';
   img.style.top=(start.y+(dest.y-start.y)*t)+'px';
   i++;
   if(i<list.length)setTimeout(next,frameMs);
   else setTimeout(()=>img.remove(),70);
 }
 next();
}
function damagePop(targetId,amount,color='#ffd36a'){
 const p=document.createElement('div');
 p.className='tbDamage';p.textContent=amount;p.style.color=color;
 const pt=anchorPoint(targetId,0,-30);
 p.style.left=pt.x+'px';p.style.top=pt.y+'px';
 q('tbFx').appendChild(p);setTimeout(()=>p.remove(),850);
}

function setSafeBattleEnemyPresentation(g){
 let name=g?.name||'Goblin Scout';
 let src='assets/dungeon/v810/goblin_scout.png';
 let subtitle='West Wood';
 let wide=false;

 if(g?.isBoss){
   name='Goblin Chieftain';
   src='assets/goblins/brute_rebuilt/idle_1.png';
   subtitle='Dungeon Boss';
 }else if(g?.isFieldRat){
   name='Field Rat';src='assets/starter_mobs/field_rat/idle/1.png';subtitle='Oakhaven Pest';wide=true;
 }else if(g?.isYoungBoar){
   name='Young Boar';src='assets/starter_mobs/young_boar/idle/1.png';subtitle='Oakhaven Pest';wide=true;
 }else if(g?.isBoar){
   name='Dire Boar';src='assets/dire_boar/idle_1.png';subtitle='West Wood Beast';wide=true;
 }else if(g?.isBrute){
   name='Goblin Brute';src='assets/goblins/brute_original/brute_clean_move.png';subtitle='Heavy Goblin';
 }else if(g?.isGuard){
   name='Goblin Guard';src='assets/goblins/guard/idle_right.png';subtitle='Armored Goblin';
 }else if(g?.isBasic){
   name='Goblin';src='assets/goblins/basic/battle_idle_clean.png';subtitle=(g?.isDungeon?'Dungeon Goblin':'West Wood Goblin');
 }else if(g?.isScout){
   name='Goblin Scout';src='assets/dungeon/v810/goblin_scout.png';subtitle=(g?.isDungeon?'Dungeon Scout':'West Wood Scout');
 }

 const img=q('tbEnemyImage');
 if(q('tbEnemyName'))q('tbEnemyName').textContent=name;
 if(q('tbEnemyLevel'))q('tbEnemyLevel').textContent=subtitle;
 if(q('tbTurnEnemy'))q('tbTurnEnemy').textContent=name;
 if(img){
   img.src=src;
   img.alt=name;
   if(wide){
     img.style.width='170px';img.style.height='125px';
   }else if(g?.isBoss){
     img.style.width='210px';img.style.height='210px';
   }else if(g?.isBrute){
     img.style.width='165px';img.style.height='165px';
   }else{
     img.style.width='';img.style.height='';
   }
   img.style.objectFit='contain';
 }
 return name;
}

function setBattleLocationBackground(g){
 const area=String(currentArea||'').toLowerCase();
 const inDungeon=area.includes('dungeon')||area.includes('boss')||!!g?.isDungeon||!!g?.dungeonMob||!!g?.inDungeon;
 const inOakhaven=area==='town'||area.includes('oakhaven')||!!g?.isFieldRat||!!g?.isYoungBoar;
 let kind='forest';
 if(inDungeon) kind=(area.includes('boss')||!!g?.isBoss||!!g?.scriptedBoss||!!g?.bossMob)?'boss':'dungeon';
 else if(inOakhaven) kind='oakhaven';
 forceBattleBackground(kind);

 const zone=document.querySelector('.tbZone');
 if(zone){
   if(kind==='oakhaven') zone.innerHTML='🏘️ OAKHAVEN OUTSKIRTS<br><small>PEST BATTLE</small>';
   else if(kind==='dungeon'||kind==='boss') zone.innerHTML='🕯️ GOBLIN DUNGEON<br><small>'+((kind==='boss')?'BOSS BATTLE':'DUNGEON BATTLE')+'</small>';
   else zone.innerHTML='🌲 WEST WOOD FOREST<br><small>FOREST BATTLE</small>';
 }
}

function setBattleHeroPresentation(){
 const heroImg=document.querySelector('#tbHero .tbSprite img');
 if(!heroImg)return;
 let src='assets/player_wolf_knight_male/v2/idle_right_1.png';
 try{
   if(typeof wolfFramePath==='function') src=wolfFramePath('idle','right',0)||src;
   else if(characterData?.hero==='wolf_archer_female') src='assets/approved_2026_08_14/wolf_archer/walk_verified/right/right_1.png';
 }catch(e){}
 heroImg.src=src;
 heroImg.alt=(typeof currentHero==='function'&&currentHero()?.name)?currentHero().name:'Player';
 heroImg.style.objectFit='contain';
 heroImg.style.imageRendering='auto';
}


function startDungeonTurnBattle(dungeonEnemy,onDungeonDefeat){
 if(!dungeonEnemy||dungeonEnemy.dead||battleActive)return false;
 const type=dungeonEnemy.type||'basic';
 const isBoss=type==='boss';

 battleBackgroundOverride=isBoss?'boss':'dungeon';
 forceBattleBackground(isBoss?'boss':'dungeon');

 const g={
   el:dungeonEnemy.el,
   img:dungeonEnemy.img,
   bar:dungeonEnemy.bar,
   x:dungeonEnemy.x,
   y:dungeonEnemy.y,
   name:dungeonEnemy.name||(isBoss?'Goblin Chieftain':'Goblin'),
   maxHp:dungeonEnemy.max||dungeonEnemy.maxHp||(isBoss?500:60),
   hp:dungeonEnemy.hp||dungeonEnemy.max||(isBoss?500:60),
   damage:isBoss?16:type==='brute'?12:type==='scout'?8:6,
   xpReward:isBoss?250:type==='brute'?60:type==='scout'?40:30,
   respawnDelay:0,
   isBasic:type==='basic',
   isScout:type==='scout',
   isBrute:type==='brute',
   isGuard:type==='guard',
   isBoss:isBoss,
   scriptedBoss:isBoss,
   dungeonMob:!isBoss,
   isDungeon:true,
   __dungeonEnemy:dungeonEnemy,
   __onDungeonDefeat:onDungeonDefeat,
   __noRespawn:true
 };
 startTurnBattle(g);
 return true;
}
window.__startDungeonTurnBattle=startDungeonTurnBattle;

function startTurnBattle(g){
 if(battleActive||!g||g.dead)return;
 injectBattleUI();
 setBattleLocationBackground(g);
 if(battleBackgroundOverride) forceBattleBackground(battleBackgroundOverride);
 setBattleHeroPresentation();
 battleActive=true;battleFinished=false;battleBusy=false;battleTiming=false;
 battleTarget=g;battleReturnPos={x:pos.x,y:pos.y};
 battleOriginArea=currentArea;
 battleOriginPos={x:pos.x,y:pos.y};
 try{battleOriginDungeonRoom=(typeof dungeonState!=='undefined'&&dungeonState)?(dungeonState.room||dungeonState.currentRoom||null):null}catch(e){battleOriginDungeonRoom=null}
 battleCombo=0;battleTurn=1;battleGuard=false;battleMP=battleMPMax;
 battlePlayerMax=Math.max(1,Math.round(playerMaxHP()));
 // OWNER/TEST BUILD compatibility: older saves can contain the old base HP (100)
 // even though owner gear raises max HP into the thousands. Treat that stale value
 // as full health when entering the new battle system.
 if(playerLevel>=80 && battlePlayerMax>100 && hp<=100){
   hp=battlePlayerMax;
   if(hpBar)hpBar.style.width='100%';
 }
 battlePlayerHP=Math.max(1,Math.min(battlePlayerMax,Math.round(hp)));
 battleEnemyMax=Math.max(1,Math.round(g.maxHp||g.hp||60));
 battleEnemyHP=Math.max(1,Math.min(battleEnemyMax,Math.round(g.hp||battleEnemyMax)));
 locked=true;moveTarget=null;
 Object.keys(keys).forEach(k=>keys[k]=false);
 try{setAnimation('idle',true)}catch(e){}
 hideBattleActions();
 const safeEnemyName=setSafeBattleEnemyPresentation(g);
 q('tbDesc').textContent='A '+safeEnemyName+' engages you!';
 q('tbMessage').style.display='none';q('tbReturn').style.display='none';
 if(q('tbReturn'))q('tbReturn').textContent=(battleOriginArea==='chieftainDungeon'?'RETURN TO DUNGEON':battleOriginArea==='town'?'RETURN TO OAKHAVEN':'RETURN TO WEST WOOD');
 updateBattleUI();
 const overlay=q('turnBattleOverlay');
 overlay.style.display='block';
 overlay.style.pointerEvents='auto';
 requestAnimationFrame(()=>overlay.classList.add('show'));
 setTimeout(()=>{if(battleActive&&!battleBusy)q('tbDesc').textContent='Choose an action.'},500);
}

window.__startStarterPestTurnBattle=function(pest){
 if(!pest||pest.hp<=0||battleActive)return false;
 const g={
   el:pest.el,img:pest.img||pest.el?.querySelector('img'),bar:pest.bar||pest.el?.querySelector('.starterHp i'),
   x:pest.x,y:pest.y,name:pest.name||((pest.type==='rat')?'Field Rat':'Young Boar'),
   maxHp:pest.maxHp||pest.max||1,hp:pest.hp||pest.maxHp||1,damage:pest.damage||1,xpReward:pest.xpReward||pest.xp||5,
   isFieldRat:pest.type==='rat',isYoungBoar:pest.type==='boar',__starterPest:pest,
   __onStarterPestDefeat:function(){ try{pest.hp=0;if(typeof pest.onDefeat==='function')pest.onDefeat();}catch(e){console.error(e)} }
 };
 startTurnBattle(g);
 return true;
};

function realBattlePlayerBaseDamage(){
 const testBoost=(playerLevel>=99?40:0);
 const attackBonus=(typeof getAttackBonus==='function'?getAttackBonus():0);
 return Math.max(1,25+attackBonus*2+testBoost);
}
function rollRealBattlePlayerDamage(multiplier=1,allowCrit=true){
 const base=realBattlePlayerBaseDamage();
 const critChance=(typeof getCritChance==='function'?getCritChance():0);
 const critical=allowCrit && Math.random()*100<critChance;
 let damage=Math.round(base*multiplier);
 if(critical)damage=Math.round(damage*1.5);
 return {damage:Math.max(1,damage),critical};
}

function startTimedAttack(){
 if(!battleActive||battleBusy||battleFinished)return;
 hideBattleActions();q('tbTiming').classList.add('show');q('tbDesc').textContent='Attack — time your strike.';
 q('tbResult').textContent='';battleTiming=true;battleNeedle=1;battleNeedleDir=1;
 cancelAnimationFrame(battleRaf);moveNeedle();
}
function moveNeedle(){
 if(!battleTiming)return;
 battleNeedle+=battleNeedleDir*(1.25+battleCombo*.05);
 if(battleNeedle>=98){battleNeedle=98;battleNeedleDir=-1}
 if(battleNeedle<=1){battleNeedle=1;battleNeedleDir=1}
 q('tbNeedle').style.left=battleNeedle+'%';
 battleRaf=requestAnimationFrame(moveNeedle);
}
function resolveTimedAttack(){
 if(!battleTiming||battleBusy||battleFinished)return;
 battleTiming=false;cancelAnimationFrame(battleRaf);battleBusy=true;
 let label,perfect=false,mult=.75;
 if(battleNeedle>=44&&battleNeedle<=56){mult=1.50;label='PERFECT!';perfect=true;battleCombo++}
 else if(battleNeedle>=33&&battleNeedle<=67){mult=1.15;label='GOOD!'}
 else{mult=.75;label='MISS-TIMED';battleCombo=0}
 const hit=rollRealBattlePlayerDamage(mult,true);
 let damage=Math.floor(hit.damage*(1+Math.min(battleCombo,5)*.10));
 if(hit.critical)label='CRITICAL '+label;
 q('tbResult').textContent=label+'  '+damage+' DAMAGE';
 q('tbHero').classList.add('tbLunge');
 setTimeout(()=>playFrames(FX.hit,'tbFxHit',85,'tbEnemy',0,4,false),210);
 setTimeout(()=>q('tbHero').classList.remove('tbLunge'),430);
 setTimeout(()=>damageEnemy(damage),320);
}
function battleHeroSkillSet(){
 const hero=(typeof characterData!=='undefined'&&characterData?.hero)||'wolf_knight_male';
 if(hero==='wolf_archer_female'){
   return {
     wolf:{name:'Quick Shot',cost:15,mult:1.20,fx:()=>playFrames(FX.wolf,'tbFxWolf',85,'tbEnemy',0,-4,true),delay:470},
     guard:{name:'Piercing Arrow',cost:22,mult:1.40,fx:()=>playFrames(FX.guard,'tbFxGuard',90,'tbEnemy',0,0,false),delay:520},
     moon:{name:'Moon Volley',cost:32,mult:1.65,fx:()=>playFrames(FX.moon,'tbFxMoon',85,'tbEnemy',0,-6,false),delay:580}
   };
 }
 return {
   wolf:{name:'Wolf Fang',cost:20,mult:1.30,fx:()=>playFrames(FX.wolf,'tbFxWolf',100,'tbEnemy',0,-4,true),delay:560},
   guard:{name:'Guard Break',cost:15,mult:1.10,fx:()=>playFrames(FX.guard,'tbFxGuard',95,'tbEnemy',0,0,false),delay:560},
   moon:{name:'Moon Slash',cost:32,mult:1.60,fx:()=>playFrames(FX.moon,'tbFxMoon',95,'tbEnemy',0,-6,false),delay:620}
 };
}
function refreshBattleSkillMenu(){
 const specs=battleHeroSkillSet();
 const labels={wolf:specs.wolf,guard:specs.guard,moon:specs.moon};
 Object.entries(labels).forEach(([key,spec])=>{
   const b=document.querySelector(`#tbSkillMenu [data-skill="${key}"]`);
   if(b)b.innerHTML=`${spec.name} <span>${spec.cost} MP</span>`;
 });
}
function showSkills(){
 if(!battleActive||battleBusy||battleFinished)return;
 refreshBattleSkillMenu();
 hideBattleActions();q('tbSkillMenu').classList.add('show');q('tbDesc').textContent='Choose a skill.';
}
function showItems(){
 if(!battleActive||battleBusy||battleFinished)return;
 hideBattleActions();q('tbItemMenu').classList.add('show');q('tbDesc').textContent='Choose an item.';updateBattleUI();
}
function useSkill(kind){
 if(!battleActive||battleBusy||battleFinished)return;
 const spec=battleHeroSkillSet()[kind];
 if(!spec)return;
 if(battleMP<spec.cost){q('tbDesc').textContent='Not enough MP.';return}
 battleMP-=spec.cost;battleBusy=true;hideBattleActions();q('tbDesc').textContent=spec.name+'!';
 updateBattleUI();spec.fx();
 const rolled=rollRealBattlePlayerDamage(spec.mult,true);
 const skillDamage=rolled.damage;
 if(rolled.critical)q('tbDesc').textContent=spec.name+' - CRITICAL!';
 setTimeout(()=>damageEnemy(skillDamage),spec.delay);
}
function useBattleItem(id){
 if(!battleActive||battleBusy||battleFinished)return;
 if((inventoryData[id]||0)<=0){q('tbDesc').textContent='You do not have that item.';return}
 battleBusy=true;hideBattleActions();
 if(id==='health_potion'){
   const heal=Math.max(1,Math.round(battlePlayerMax*.35));
   removeItem(id,1);battlePlayerHP=Math.min(battlePlayerMax,battlePlayerHP+heal);
   q('tbDesc').textContent='Health Potion restored '+heal+' HP.';
 }else{
   const heal=Math.max(1,Math.round(battlePlayerMax*.20));
   removeItem(id,1);battlePlayerHP=Math.min(battlePlayerMax,battlePlayerHP+heal);battleMP=Math.min(battleMPMax,battleMP+55);
   q('tbDesc').textContent='Wolfheart Elixir restored '+heal+' HP and MP.';
 }
 updateBattleUI();save(false);setTimeout(enemyTurn,650);
}
function defendBattle(){
 if(!battleActive||battleBusy||battleFinished)return;
 battleBusy=true;battleGuard=true;battleCombo=Math.max(0,battleCombo-1);hideBattleActions();
 q('tbDesc').textContent='Defending — incoming damage greatly reduced.';updateBattleUI();setTimeout(enemyTurn,620);
}
function runBattle(){
 if(!battleActive||battleBusy||battleFinished)return;
 battleBusy=true;hideBattleActions();
 if(Math.random()<.70){
   battleTarget.turnBattleCooldown=performance.now()+4500;
   battleFinished=true;
   showBattleMessage('ESCAPED!',true);
 }else{
   q('tbDesc').textContent='Could not escape!';
   setTimeout(enemyTurn,520);
 }
}
function damageEnemy(amount){
 if(!battleActive||battleFinished)return;
 battleEnemyHP=Math.max(0,battleEnemyHP-amount);
 if(battleTarget&&!battleTarget.dead){
   battleTarget.hp=Math.max(0,battleEnemyHP);
   if(battleTarget.__dungeonEnemy) battleTarget.__dungeonEnemy.hp=battleTarget.hp;
   if(battleTarget.bar)battleTarget.bar.style.width=Math.max(0,Math.min(100,battleEnemyHP/battleEnemyMax*100))+'%';
 }
 updateBattleUI();damagePop('tbEnemy',amount);
 q('tbEnemy').classList.add('tbHit');setTimeout(()=>q('tbEnemy').classList.remove('tbHit'),260);
 if(battleEnemyHP<=0){winBattle();return}
 setTimeout(enemyTurn,700);
}
function enemyTurn(){
 if(!battleActive||battleFinished)return;
 let damage=1;
 try{
   // Same calculation used by normal overworld goblin combat:
   // enemy base damage -> level mitigation -> equipment defense -> shield block.
   damage=Math.max(0,scaledEnemyDamage(battleTarget));
 }catch(e){
   damage=Math.max(1,Number(battleTarget?.damage)||6);
 }
 // A successful enemy hit always chips at least 1 HP.
 // Normal-level balance still comes from Valvondor's real enemy stats;
 // owner/max gear can legitimately reduce a Scout to chip damage.
 if(damage<=0) damage=1;
 if(battleGuard && damage>0){damage=Math.max(1,Math.floor(damage*.38));battleGuard=false}
 else if(battleGuard){battleGuard=false}
 battlePlayerHP=Math.max(0,battlePlayerHP-damage);updateBattleUI();damagePop('tbHero','-'+damage,'#ff7777');
 q('tbHero').classList.add('tbHit');setTimeout(()=>q('tbHero').classList.remove('tbHit'),260);
 if(battlePlayerHP<=0){loseBattle();return}
 battleTurn++;updateBattleUI();
 setTimeout(()=>{battleBusy=false;showMainChoice()},350);
}
function winBattle(){
 if(battleFinished)return;
 battleFinished=true;battleBusy=true;
 const g=battleTarget;
 if(g&&!g.dead){
   g.hp=0;g.dead=true;
   if(g.bar)g.bar.style.width='0%';

   // Starter quest pests use the same turn-battle UI, but their quest/respawn
   // lifecycle is owned by script_12 rather than the goblin controller.
   if(g.__starterPest){
     const reward=g.xpReward||5;
     gainXP(reward);
     const gained=[];
     try{
       if(g.isFieldRat){
         const bronze=2+Math.floor(Math.random()*5);
         addItem('gold',bronze);gained.push('+'+bronze+' Bronze');
         if(Math.random()<0.70){addItem('rat_tail',1);gained.push('+1 Rat Tail');}
         if(Math.random()<0.60){addItem('raw_rat_meat',1);gained.push('+1 Raw Rat Meat');}
         if(!gained.some(x=>x.includes('Rat Tail')||x.includes('Raw Rat Meat'))){
           if(Math.random()<0.5){addItem('rat_tail',1);gained.push('+1 Rat Tail');}
           else{addItem('raw_rat_meat',1);gained.push('+1 Raw Rat Meat');}
         }
       }else if(g.isYoungBoar){
         const bronze=4+Math.floor(Math.random()*7);
         addItem('gold',bronze);gained.push('+'+bronze+' Bronze');
         if(Math.random()<0.70){addItem('raw_boar_meat',1);gained.push('+1 Raw Boar Meat');}
         if(Math.random()<0.30){addItem('boar_hide',1);gained.push('+1 Boar Hide');}
         if(Math.random()<0.08){addItem('boar_tusk',1);gained.push('+1 Boar Tusk');}
       }
       if(!gained.length){addItem('gold',1);gained.push('+1 Bronze');}
       try{showLootPopup(gained.join('  '),g.x||pos.x,g.y||pos.y)}catch(_){ }
     }catch(err){console.error('starter pest loot',err)}
     try{ if(typeof g.__onStarterPestDefeat==='function') g.__onStarterPestDefeat(g); }catch(err){console.error('starter pest defeat',err)}
     save(false);
     const lootText=gained.length?'  LOOT: '+gained.join(', '):'';
     showBattleMessage('VICTORY!  +'+reward+' XP'+lootText,true);
     return;
   }

   // Dungeon-room enemies are owned by script_10, so hand the kill back to
   // that room controller instead of using overworld respawn logic.
   if(g.__dungeonEnemy){
     const e=g.__dungeonEnemy;
     e.hp=0;e.dead=true;
     try{e.el.classList.add('dead')}catch(_){ }
     const reward=g.xpReward||30;
     gainXP(reward);

     let gained=[];
     if(!g.isBoss){
       const bronze=(e.type==='brute'?18:e.type==='scout'?10:6)+Math.floor(Math.random()*7);
       addItem('gold',bronze);
       gained.push('+'+bronze+' Bronze');

       if(Math.random()<(e.type==='brute'?.85:.70)){
         addItem('goblin_ear',1);
         gained.push('+1 Goblin Ear');
       }
       if(Math.random()<.22){
         addItem('oak_log',1);
         gained.push('+1 Oak Log');
       }
       if(Math.random()<.14){
         addItem('health_potion',1);
         gained.push('+1 Health Potion');
       }
       if(e.type==='brute'&&Math.random()<.08){
         addItem('chest_key',1);
         gained.push('+1 Goblin Chest Key');
       }
     }

     try{g.__onDungeonDefeat&&g.__onDungeonDefeat(e)}catch(err){console.error('dungeon room clear',err)}
     save(false);

     if(g.isBoss){
       showBattleMessage('BOSS DEFEATED!  +'+reward+' XP  CHIEFTAIN CACHE UNLOCKED',true);
     }else{
       const lootText=gained.length?'  LOOT: '+gained.join(', '):'';
       showBattleMessage('VICTORY!  +'+reward+' XP'+lootText,true);
     }
     return;
   }

   g.state='die';g.frame=0;g.last=0;
   goblinKills++;
   const reward=g.xpReward||25;
   gainXP(reward);
   tutorialProgress('combat');
   let gained=[];
   try{gained=createGoblinLoot(g)||[]}catch(e){console.error('turn battle loot',e)}
   if(g.__dungeonBridge){
     try{ if(typeof g.__onDungeonBattleDefeated==='function') g.__onDungeonBattleDefeated(); }catch(e){console.error('dungeon clear bridge',e)}
   }else{
     respawnGoblin(g);
   }
   g.turnBattleCooldown=performance.now()+6000;
   save(false);
   const lootText=gained.length?'  LOOT: '+gained.join(', '):'';
   showBattleMessage('VICTORY!  +'+reward+' XP'+lootText,true);
 }
}

function battleHardReturnToOakhaven(){
 battleTiming=false;
 cancelAnimationFrame(battleRaf);
 battleActive=false;
 battleBusy=false;
 battleFinished=true;
 battleTarget=null;
 moveTarget=null;
 Object.keys(keys).forEach(k=>keys[k]=false);

 const overlay=q('turnBattleOverlay');
 if(overlay){
   overlay.classList.remove('show');
   overlay.style.display='none';
   overlay.style.pointerEvents='none';
 }

 try{hideDeathScreen()}catch(e){}
 dead=false;
 locked=false;
 mining=false;
 chopping=false;
 fishing=false;
 hp=Math.max(1,Math.round(playerMaxHP()));
 if(hpBar)hpBar.style.width='100%';

 try{
   if(currentArea!=='town') switchArea('town',SAFE_SPAWN);
   else{
     pos={...SAFE_SPAWN};
     moveTarget=null;
     camera();
   }
 }catch(e){
   console.error('v8.84 hard Oakhaven return',e);
   try{currentArea='town';pos={...SAFE_SPAWN};camera()}catch(_){}
 }

 try{setAnimation('idle',true)}catch(e){}
 try{save(false)}catch(e){}
 try{toast('⛲ You awaken at the Oakhaven fountain.')}catch(e){}
}
window.__battleHardReturnToOakhaven=battleHardReturnToOakhaven;

function loseBattle(){
 battleFinished=true;battleBusy=true;
 hp=0;if(hpBar)hpBar.style.width='0%';
 showBattleMessage('DEFEATED',false);
 setTimeout(()=>{
   battleTiming=false;
   cancelAnimationFrame(battleRaf);
   const overlay=q('turnBattleOverlay');
   if(overlay){
     overlay.classList.remove('show');
     overlay.style.display='none';
     overlay.style.pointerEvents='none';
   }
   battleActive=false;
   battleBusy=false;
   battleTarget=null;
   moveTarget=null;
   Object.keys(keys).forEach(k=>keys[k]=false);

   dead=true;
   locked=true;
   try{setAnimation('dead',true)}catch(e){}
   try{showDeathScreen()}catch(e){console.error('death screen',e)}
 },500);
}
function showBattleMessage(text,canReturn){
 q('tbMessageText').textContent=text;
 q('tbMessage').style.display='block';
 q('tbReturn').style.display=canReturn?'block':'none';
}
function returnFromBattle(){
 if(!battleActive||!battleFinished)return;
 if(battleEnemyHP>0 && battleTarget){
   battleTarget.turnBattleCooldown=performance.now()+4500;
 }
 const realMax=Math.max(1,Math.round(playerMaxHP()));
 hp=Math.max(1,Math.min(realMax,Math.round(battlePlayerHP)));

 const originArea=battleOriginArea;
 const originPos=battleOriginPos?{...battleOriginPos}:null;

 closeBattleOverlay();

 // Stay where the encounter actually happened.
 if(originArea==='chieftainDungeon'){
   try{
     currentArea='chieftainDungeon';
     if(originPos)pos={...originPos};
     moveTarget=null;
     if(typeof camera==='function')camera();
   }catch(e){console.error('dungeon battle return',e)}
 }else if(originArea==='forest'){
   try{
     currentArea='forest';
     if(originPos)pos={...originPos};
     moveTarget=null;
     if(typeof camera==='function')camera();
   }catch(e){}
 }else if(originArea==='town'){
   try{
     currentArea='town';
     if(originPos)pos={...originPos};
     moveTarget=null;
     if(typeof camera==='function')camera();
   }catch(e){}
 }

 locked=false;dead=false;moveTarget=null;
 try{setAnimation('idle',true)}catch(e){}
 save(false);
}
function closeBattleOverlay(){
 battleTiming=false;cancelAnimationFrame(battleRaf);
 const overlay=q('turnBattleOverlay');
 if(overlay){
   overlay.classList.remove('show');
   overlay.style.pointerEvents='none';
   setTimeout(()=>{if(!battleActive)overlay.style.display='none'},230);
 }
 battleActive=false;battleBusy=false;battleBackgroundOverride='';
}
function scoutCanStartBattle(g){
 if(dead||locked||battleActive)return false;
 if(!g||g.dead||g.editorDisabled||!g.el?.isConnected)return false;

 // Supported normal enemies only. Boss remains excluded from this pass.
 if(!g.isScout && !g.isBoar && !g.isBasic && !g.isGuard && !g.isBrute)return false;

 const inForest=!!g.el.closest('#forestWorld');
 const inDungeon=!!g.el.closest('#chieftainDungeonWorld') || !!g.el.closest('#dungeonWorld') || currentArea==='chieftainDungeon';

 if(currentArea==='forest' && !inForest)return false;
 if(currentArea==='chieftainDungeon' && !inDungeon)return false;
 if(currentArea!=='forest' && currentArea!=='chieftainDungeon')return false;

 if(g.turnBattleCooldown && performance.now()<g.turnBattleCooldown)return false;

 const gx=g.x+(g.isBoar?71:(g.isBrute?64:47));
 const gy=g.y+(g.isBoar?72:(g.isBrute?92:75));
 const d=Math.hypot(pos.x-gx,pos.y-gy);
 return d<=145;
}

// Pause overworld goblin updates while battle is active.
// Otherwise keep the original real-time enemy behavior.
const __v880OriginalUpdateGoblins=updateGoblins;
updateGoblins=function(now){
 if(battleActive)return;
 return __v880OriginalUpdateGoblins(now);
};

// Click/tap a nearby West Wood Goblin Scout to start the turn battle.
// This prevents simply walking past a Scout from forcing combat.

function updateScoutBattleAffordance(){
 if((currentArea!=='forest'&&currentArea!=='chieftainDungeon')||battleActive)return;
 try{
   goblins.forEach(g=>{
     if(!g||!g.el||g.dead||(!g.isScout&&!g.isBoar&&!g.isBasic&&!g.isGuard&&!g.isBrute))return;
     const gx=g.x+47,gy=g.y+75;
     const near=Math.hypot(pos.x-gx,pos.y-gy)<=135;
     g.el.style.filter=near?'drop-shadow(0 0 7px rgba(222,184,104,.95))':'';
     g.el.style.cursor=near?'pointer':'';
     if(near)g.el.title=g.isBoar?'Click Dire Boar to battle':
      g.isBrute?'Click Goblin Brute to battle':
      g.isGuard?'Click Goblin Guard to battle':
      g.isBasic?'Click Goblin to battle':
      'Click Goblin Scout to battle';
     else g.el.removeAttribute('title');
   });
 }catch(e){}
}
setInterval(updateScoutBattleAffordance,180);

function bindScoutBattleClick(g){
 if(!g||!g.el||g.__turnBattleClickBound)return;
 g.__turnBattleClickBound=true;
 try{
   g.el.style.cursor='pointer';
   g.el.title='Click to battle';
 }catch(e){}
 const handler=(ev)=>{
   if(!scoutCanStartBattle(g))return;
   ev.preventDefault();
   ev.stopPropagation();
   startTurnBattle(g);
 };
 g.el.addEventListener('click',handler,true);
 g.el.addEventListener('pointerdown',(ev)=>{
   if(ev.pointerType==='touch' && scoutCanStartBattle(g)){
     ev.preventDefault();
     ev.stopPropagation();
     startTurnBattle(g);
   }
 },true);
}

const __v881OriginalSpawnGoblin = (typeof spawnGoblin==='function') ? spawnGoblin : null;
if(__v881OriginalSpawnGoblin){
  spawnGoblin=function(...args){
    const g=__v881OriginalSpawnGoblin.apply(this,args);
    try{bindScoutBattleClick(g)}catch(e){}
    return g;
  };
}

// Bind any Scouts that already existed before this script loaded.
setTimeout(()=>{
  try{goblins.forEach(bindScoutBattleClick)}catch(e){}
},0);

document.addEventListener('keydown',e=>{
 if(!battleActive)return;
 if((e.code==='Space'||e.code==='Enter')&&battleTiming){e.preventDefault();resolveTimedAttack()}
 if(e.code==='Escape'&&!battleBusy&&!battleFinished){e.preventDefault();runBattle()}
},true);

injectBattleUI();
console.log('Valvondor v8.80 turn-battle test loaded: West Wood Goblin Scouts only.');
})();


// Dungeon rooms can reveal/create enemy elements after the initial page load.
// Re-bind supported mobs safely; bindScoutBattleClick is idempotent.
setInterval(()=>{
  if(battleActive)return;
  try{goblins.forEach(bindScoutBattleClick)}catch(e){}
},700);
