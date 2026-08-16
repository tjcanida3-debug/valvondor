/* Oakhaven Editor Plus v2 — self-contained fallback/editor. */
(()=>{
'use strict';
const q=id=>document.getElementById(id);
const town=q('world'), btn=q('townEditBtn'), panel=q('townEditPanel');
if(!town||!btn||!panel){console.warn('Oakhaven editor: required elements missing');return;}
const hint=q('townEditHint');
const STORAGE='valvondor-oakhaven-editor-plus-v2';
const ROAD_KEY='valvondor-oakhaven-roads-v1';
const selector='.obj,.districtSign,.marketCrates,.bench,.flowerBed,.townTree,.npc,.landmark,.townEditorAdded';
let active=false, selected=null, drag=null, snap=10;
function toastSafe(t){try{if(typeof window.toast==='function')window.toast(t);else console.log(t)}catch(e){console.log(t)}}
function editables(){return [...town.querySelectorAll(selector)].filter(el=>!el.closest('#playerWrap'));}
function keyFor(el){if(el.dataset.editKey)return el.dataset.editKey;const all=editables(),idx=all.indexOf(el);const base=el.id||el.dataset.label||el.dataset.id||el.className.toString().split(/\s+/).slice(0,2).join('.');el.dataset.editKey=(base||'obj')+'@'+idx;return el.dataset.editKey;}
function mark(){editables().forEach(el=>{el.classList.add('townEditable');keyFor(el);});}
function unmark(){editables().forEach(el=>el.classList.remove('townEditable','townSelected','townDragging'));selected=null;drag=null;}
function setActive(on){active=!!on;document.body.classList.toggle('townEditMode',active);panel.classList.toggle('show',active);panel.setAttribute('aria-hidden',active?'false':'true');btn.textContent=active?'✏️ EDITING OAKHAVEN':'✏️ EDIT OAKHAVEN';if(active){mark();refreshCatalog();if(hint)hint.textContent='Drag a building, tree, NPC, sign, or decoration.';toastSafe('✏️ Oakhaven Edit Mode ON');}else{save(false);unmark();toastSafe('✓ Oakhaven layout saved.');}}
function select(el){if(selected)selected.classList.remove('townSelected');selected=el;if(el){el.classList.add('townSelected');if(hint)hint.textContent='Selected: '+(el.dataset.label||el.id||'object')+' — drag or use the edit buttons.';}}
function pos(el){const s=getComputedStyle(el);return {left:parseFloat(el.style.left||s.left)||0,top:parseFloat(el.style.top||s.top)||0};}
function setPos(el,left,top){if(snap>0){left=Math.round(left/snap)*snap;top=Math.round(top/snap)*snap;}el.style.left=left+'px';el.style.top=top+'px';}
function objData(el){const p=pos(el);return {id:keyFor(el),added:el.dataset.editorPlusAdded==='1',tag:el.tagName,src:el.getAttribute('src')||'',className:el.className,left:p.left,top:p.top,width:el.style.width,height:el.style.height,z:el.style.zIndex,transform:el.style.transform,display:el.style.display,label:el.dataset.label||''};}
function snapshot(){return {version:2,objects:editables().map(objData)};}
function save(show=true){try{localStorage.setItem(STORAGE,JSON.stringify(snapshot()));if(show)toastSafe('💾 Oakhaven layout saved.');}catch(e){console.error(e);}}
function load(){try{const d=JSON.parse(localStorage.getItem(STORAGE)||'null');if(!d||!Array.isArray(d.objects))return;mark();const byKey=new Map(editables().map(el=>[keyFor(el),el]));d.objects.forEach(o=>{let el=byKey.get(o.id);if(!el&&o.added&&o.tag==='IMG'){el=document.createElement('img');el.src=o.src;el.className=o.className||'obj townEditorAdded';el.dataset.editorPlusAdded='1';town.appendChild(el);}if(!el)return;el.style.left=o.left+'px';el.style.top=o.top+'px';if(o.width)el.style.width=o.width;if(o.height)el.style.height=o.height;if(o.z)el.style.zIndex=o.z;if(o.transform)el.style.transform=o.transform;if(o.display)el.style.display=o.display;if(o.label)el.dataset.label=o.label;});}catch(e){console.error('Oakhaven load failed',e);}}
function sizeBy(f){if(!selected)return toastSafe('Select something first.');const w=parseFloat(selected.style.width)||selected.getBoundingClientRect().width||100;selected.style.width=Math.max(18,Math.round(w*f))+'px';selected.style.height='auto';save(false);}
function zBy(n){if(!selected)return toastSafe('Select something first.');const z=parseInt(selected.style.zIndex||getComputedStyle(selected).zIndex)||20;selected.style.zIndex=String(Math.max(1,z+n));save(false);}
function rotate(){if(!selected)return toastSafe('Select something first.');const n=((Number(selected.dataset.editRot)||0)+15)%360;selected.dataset.editRot=n;selected.style.transform='rotate('+n+'deg)';save(false);}
function del(){if(!selected)return toastSafe('Select something first.');selected.style.display='none';save(false);selected=null;}
function duplicate(){if(!selected)return toastSafe('Select something first.');const c=selected.cloneNode(true);c.removeAttribute('id');c.dataset.editorPlusAdded='1';c.dataset.editKey='add-'+Date.now();c.classList.add('townEditorAdded','townEditable');const p=pos(selected);c.style.left=(p.left+35)+'px';c.style.top=(p.top+35)+'px';town.appendChild(c);select(c);save(false);}
function addFountain(){const c=document.createElement('img');c.src='assets/oakhaven_custom/wolf_fountain_clean.png';c.className='obj building townEditorAdded townEditable';c.dataset.editorPlusAdded='1';c.dataset.editKey='fountain-'+Date.now();c.dataset.label='Wolf Fountain';c.style.cssText='left:1520px;top:720px;width:220px;z-index:24';town.appendChild(c);select(c);save(false);toastSafe('⛲ Wolf fountain added.');}
function exportJSON(){const blob=new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Valvondor_Oakhaven_Layout.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}
function importJSON(d){if(!d||!Array.isArray(d.objects))throw new Error('bad layout');localStorage.setItem(STORAGE,JSON.stringify(d));location.reload();}
// Capture click so this works even if an earlier game script stopped before its own editor setup.
btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();setActive(!active);},true);
q('townEditDoneBtn')?.addEventListener('click',e=>{e.preventDefault();setActive(false);},true);
q('townSaveLayoutBtn')?.addEventListener('click',e=>{e.preventDefault();save(true);},true);
q('townResetLayoutBtn')?.addEventListener('click',e=>{e.preventDefault();if(confirm('Reset Oakhaven editor changes?')){localStorage.removeItem(STORAGE);localStorage.removeItem(ROAD_KEY);location.reload();}},true);
q('townSnapBtn')?.addEventListener('click',e=>{e.preventDefault();snap=snap===10?1:snap===1?0:10;e.currentTarget.textContent='SNAP: '+(snap||'OFF');},true);
q('townDupBtn')?.addEventListener('click',duplicate,true);q('townDeleteBtn')?.addEventListener('click',del,true);q('townSmallerBtn')?.addEventListener('click',()=>sizeBy(.9),true);q('townLargerBtn')?.addEventListener('click',()=>sizeBy(1.1),true);q('townRotateBtn')?.addEventListener('click',rotate,true);q('townBackBtn')?.addEventListener('click',()=>zBy(-1),true);q('townFrontBtn')?.addEventListener('click',()=>zBy(1),true);q('townExportBtn')?.addEventListener('click',exportJSON,true);q('townAddFountainBtn')?.addEventListener('click',addFountain,true);
q('townImportBtn')?.addEventListener('click',()=>q('townImportFile')?.click(),true);q('townImportFile')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{importJSON(JSON.parse(await f.text()));}catch(err){toastSafe('Invalid Oakhaven layout JSON.');}});
q('townOpenStoreRef')?.addEventListener('click',()=>window.open('extras/Oakhaven_General_Store_APPROVED.html','_blank'),true);q('townOpenInnRef')?.addEventListener('click',()=>window.open('extras/Oakhaven_Inn_APPROVED.html','_blank'),true);
town.addEventListener('pointerdown',e=>{if(!active)return;const el=e.target.closest(selector);if(!el||!town.contains(el))return;e.preventDefault();e.stopImmediatePropagation();select(el);const p=pos(el);drag={el,startX:e.clientX,startY:e.clientY,left:p.left,top:p.top};el.classList.add('townDragging');try{el.setPointerCapture(e.pointerId)}catch(_){}},true);
town.addEventListener('pointermove',e=>{if(!active||!drag)return;e.preventDefault();e.stopImmediatePropagation();const scale=(typeof window.cameraScale==='number'&&window.cameraScale>0)?window.cameraScale:1;setPos(drag.el,drag.left+(e.clientX-drag.startX)/scale,drag.top+(e.clientY-drag.startY)/scale);},true);
function endDrag(e){if(!drag)return;drag.el.classList.remove('townDragging');try{drag.el.releasePointerCapture(e.pointerId)}catch(_){}drag=null;save(false);}
town.addEventListener('pointerup',endDrag,true);town.addEventListener('pointercancel',endDrag,true);

// -------- v9.33 visible Oakhaven asset browser --------
const assetGrid=q('townAssetGrid'), assetSearch=q('townAssetSearch'), assetCategory=q('townAssetCategory'), assetCount=q('townAssetCount');
const CUSTOM_ASSETS = [
  {name:'NEW — Oakhaven Town Hall',cat:'NEW BUILDINGS',src:'assets/oakhaven_custom/editor_assets/buildings/new_town_hall.png',width:390},
  {name:'NEW — Oakhaven General Store',cat:'NEW BUILDINGS',src:'assets/oakhaven_custom/editor_assets/buildings/new_general_store.png',width:420},
  {name:'NEW — Oakhaven Inn',cat:'NEW BUILDINGS',src:'assets/oakhaven_custom/editor_assets/buildings/new_oakhaven_inn.png',width:420},
  {name:'Mayor Alden Thorne',cat:'NPCs',src:'assets/oakhaven_custom/editor_assets/npcs/mayor_alden.png',width:86},
  {name:'Mara Thornfield',cat:'NPCs',src:'assets/oakhaven_custom/editor_assets/npcs/mara.png',width:82},
  {name:'Eldon Hearthwell',cat:'NPCs',src:'assets/oakhaven_custom/editor_assets/npcs/eldon.png',width:82},
  {name:'Garrick Hearthwell',cat:'NPCs',src:'assets/oakhaven_custom/editor_assets/npcs/garrick.png',width:82},
  {name:'Wolf Fountain',cat:'Recent Builds',src:'assets/oakhaven_custom/wolf_fountain_clean.png',width:220},
  {name:'Inn Counter',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_counter.png',width:190},
  {name:'Inn Back Bar',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_backbar.png',width:180},
  {name:'Inn Fireplace',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_fireplace.png',width:105},
  {name:'Inn Door',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_door_SINGLE.png',width:80},
  {name:'Inn Stairs',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_stairs_SINGLE.png',width:100},
  {name:'Inn Table A',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_table_a.png',width:120},
  {name:'Inn Table B',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_table_b.png',width:120},
  {name:'Inn Table C',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_table_c.png',width:120},
  {name:'Inn Wolf Rug',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_wolf_rug.png',width:120},
  {name:'Inn Rug',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_rug.png',width:115},
  {name:'Inn Sign',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_inn_sign.png',width:100},
  {name:'Inn Plant',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_plants.png',width:70},
  {name:'Inn Lanterns',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_lanterns.png',width:90},
  {name:'Inn Barrels',cat:'Inn Assets',src:'assets/oakhaven_custom/editor_assets/inn/inn_barrels.png',width:100},
  {name:'Store Counter',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/counter_display.png',width:180},
  {name:'Store Shopkeeper Counter',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/counter_shopkeeper.png',width:180},
  {name:'Store Goods Shelf',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/shelf_goods.png',width:105},
  {name:'Store Produce Shelf',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/shelf_produce.png',width:105},
  {name:'Store Jar Shelf',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/shelf_jars_1.png',width:105},
  {name:'Weapon Shelf',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/weapon_shelf.png',width:100},
  {name:'Store Sign',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/store_sign.png',width:100},
  {name:'Wolf Wall Plaque',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/wolf_wall_plaque.png',width:80},
  {name:'Wolf Banner 1',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/wolf_banner_1.png',width:70},
  {name:'Wolf Banner 2',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/wolf_banner_2.png',width:70},
  {name:'Treasure Chest',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/treasure_chest.png',width:75},
  {name:'Store Crate',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/crate.png',width:70},
  {name:'Food Basket',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/food_basket.png',width:70},
  {name:'Large Barrel',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/barrel_large.png',width:62},
  {name:'Medium Barrel',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/barrel_medium.png',width:58},
  {name:'Small Barrel',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/barrel_small.png',width:52},
  {name:'Store Plant',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/plant.png',width:60},
  {name:'Blue Rug 1',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/blue_rug_1.png',width:100},
  {name:'Blue Rug 2',cat:'Store Assets',src:'assets/oakhaven_custom/editor_assets/store/blue_rug_2.png',width:100}
];
let assetCatalog=[];
function cleanClasses(el){return [...el.classList].filter(x=>!['townEditable','townSelected','townDragging','townEditorAdded'].includes(x)).join(' ')}
function guessCat(el,name){const c=cleanClasses(el).toLowerCase(),n=(name||'').toLowerCase();if(c.includes('building')||/hall|store|inn|bank|blacksmith/.test(n))return 'Buildings';if(c.includes('tree')||/tree|oak/.test(n))return 'Nature';if(c.includes('npc'))return 'NPCs';if(/fountain|idol|landmark/.test(n)||c.includes('landmark'))return 'Landmarks';if(c.includes('prop')||/crate|barrel|bench|flower|sign/.test(n))return 'Town Props';return 'Town Objects';}
function uniqueTownTemplates(){const seen=new Set(),out=[];editables().forEach(el=>{if(el.dataset.editorPlusAdded==='1')return;let name=el.dataset.label||el.dataset.editorName||el.id||el.querySelector?.('span')?.textContent?.trim()||'';if(!name){if(el.classList.contains('bench'))name='Town Bench';else if(el.classList.contains('flowerBed'))name='Flower Bed';else if(el.classList.contains('marketCrates'))name='Market Crates';else if(el.classList.contains('districtSign'))name='Town Sign';else return;}const src=el.tagName==='IMG'?el.getAttribute('src'):(el.querySelector?.('img')?.getAttribute('src')||'');const sig=[name,src,cleanClasses(el)].join('|');if(seen.has(sig))return;seen.add(sig);out.push({name,cat:guessCat(el,name),template:el,src});});return out;}
function refreshCatalog(){assetCatalog=[...CUSTOM_ASSETS,...uniqueTownTemplates()];const allCats=[...new Set(assetCatalog.map(a=>a.cat))];const cats=['All',...(['NEW BUILDINGS',...allCats.filter(c=>c!=='NEW BUILDINGS')].filter(c=>allCats.includes(c)))];if(assetCategory){const v=assetCategory.value||'All';assetCategory.innerHTML=cats.map(c=>'<option value="'+c.replace(/"/g,'&quot;')+'">'+c+'</option>').join('');assetCategory.value=cats.includes(v)?v:'All';}renderAssets();}
function playerPoint(){const p=q('playerWrap');if(p){const s=getComputedStyle(p);return {left:(parseFloat(p.style.left||s.left)||1600)+140,top:(parseFloat(p.style.top||s.top)||850)+90};}return {left:1700,top:900};}
function prepPlaced(el,name,width){el.removeAttribute('id');el.className=(cleanClasses(el)||'obj')+' townEditorAdded townEditable';el.dataset.editorPlusAdded='1';el.dataset.editKey='add-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);el.dataset.label=name;el.style.display='';el.style.position='absolute';const p=playerPoint();setPos(el,p.left,p.top);if(width)el.style.width=width+'px';if(el.tagName==='IMG')el.style.height='auto';el.style.zIndex='35';return el;}
function placeAsset(a){let el;if(a.template){el=a.template.cloneNode(true);prepPlaced(el,a.name,parseFloat(a.template.style.width)||0);}else{el=document.createElement('img');el.src=a.src;prepPlaced(el,a.name,a.width||90);}town.appendChild(el);mark();select(el);save(false);toastSafe('✓ Placed '+a.name+'. Drag it where you want.');}
function renderAssets(){if(!assetGrid)return;const term=(assetSearch?.value||'').trim().toLowerCase(),cat=assetCategory?.value||'All';const list=assetCatalog.filter(a=>(cat==='All'||a.cat===cat)&&(!term||(a.name+' '+a.cat).toLowerCase().includes(term)));assetGrid.innerHTML='';list.forEach(a=>{const b=document.createElement('button');b.type='button';b.className='townAssetCard';const thumb=document.createElement('div');thumb.className='townAssetThumb';if(a.src){const im=document.createElement('img');im.src=a.src;im.alt='';thumb.appendChild(im);}else{const e=document.createElement('div');e.className='townAssetEmoji';e.textContent=a.cat==='Buildings'?'🏠':a.cat==='NPCs'?'🧍':'📦';thumb.appendChild(e);}const n=document.createElement('div');n.className='townAssetName';n.textContent=a.name;const c=document.createElement('div');c.className='townAssetCat';c.textContent=a.cat;b.append(thumb,n,c);b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();placeAsset(a)});assetGrid.appendChild(b);});if(assetCount)assetCount.textContent=list.length+' assets shown — '+assetCatalog.length+' total available';}
assetSearch?.addEventListener('input',renderAssets);assetCategory?.addEventListener('change',renderAssets);

load();
refreshCatalog();
window.__oakhavenEditorPlus={toggle:()=>setActive(!active),save,snapshot,addFountain,isActive:()=>active};
console.log('Oakhaven Editor Plus v2 ready');
})();
