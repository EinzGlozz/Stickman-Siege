const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../dist/core.js');

function gameHarness(options={}) {
  const elements = new Map();
  const listeners = new Map();
  const storage = options.storage||new Map();
  const observers=[];
  let viewport={width:844,height:390};
  let createdElements=0;
  function el(id) {
    if (!elements.has(id)) {const eventHandlers=new Map();elements.set(id, {
      id, textContent:'', innerHTML:'', firstElementChild:{textContent:''},
      children:[],append(child){this.children.push(child);},querySelector(selector){return el(`${id}:${selector}`);},
      classList:{add(){},remove(){},toggle(){},contains(){return false;}},
      style:{setProperty(){}},
      addEventListener(name,handler){eventHandlers.set(name,handler);},
      emit(name,event){eventHandlers.get(name)?.(event);},
      setPointerCapture(){},
      getBoundingClientRect(){return {left:0,top:0,...viewport};}
    });}
    return elements.get(id);
  }
  let transform=[];
  el('game').getContext = () => ({setTransform(...args){transform=args;}});
  const context = {
    SiegeCore:C, SiegeAndroid:options.androidBridge, innerWidth:844, innerHeight:390, devicePixelRatio:1,
    document:{getElementById:el,createElement:()=>el(`created-${createdElements++}`),querySelectorAll:()=>[],addEventListener(){},hidden:false},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>{if(options.rejectWrites)throw new Error('Storage blocked');storage.set(key,value);},removeItem:key=>storage.delete(key)},
    location:{hostname:'localhost',search:''}, screen:{orientation:{lock:()=>Promise.resolve()}},
    performance:{now:()=>0}, requestAnimationFrame(){}, setTimeout(){},
    ResizeObserver:class{constructor(handler){observers.push(handler);}observe(){}},
    addEventListener:(name,handler)=>listeners.set(name,handler),
    URLSearchParams, Math, console
  };
  context.window=context;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8'),context);
  const qa=context.__SIEGE_QA__;
  function key(name,down){listeners.get(down?'keydown':'keyup')({key:name,preventDefault(){}});}
  function resizeTo(width,height,dpr=1){viewport={width,height};context.innerWidth=width;context.innerHeight=height;context.devicePixelRatio=dpr;for(const notify of observers)notify();}
  return {qa,key,el,storage,resizeTo,transform:()=>transform};
}

function finishTraining(h) {
  const {qa,key,el}=h;
  qa.startTutorial(false);
  assert.equal(qa.snapshot().tutorialStep,0);
  key('d',true);qa.step(.52);key('d',false);
  assert.equal(qa.snapshot().tutorialStep,1);
  key(' ',true);
  for(let i=0;i<50&&qa.snapshot().tutorialStep===1;i++)qa.step(.08);
  key(' ',false);
  assert.equal(qa.snapshot().tutorialStep,2);
  const loot=qa.snapshot().pickups;
  for(const p of loot){qa.setPlayer(p.x,p.y);qa.step(.05);}
  assert.equal(qa.snapshot().tutorialStep,3);
  const spot=qa.snapshot().tutorial.coverSpot;
  qa.setPlayer(spot.x-50,spot.y);key('d',true);qa.step(.2);key('d',false);qa.step(1.1);
  assert.equal(qa.snapshot().tutorialStep,4);
  const power=qa.snapshot().pickups.find(p=>p.kind==='power');
  qa.setPlayer(power.x,power.y);qa.step(.05);
  assert.equal(qa.snapshot().tutorialStep,5);
  el('tutorialUpgradeBtn').onclick();qa.step(.05);
  assert.equal(qa.snapshot().tutorialStep,6);
  key(' ',true);
  for(let i=0;i<120&&qa.snapshot().mode==='tutorial';i++)qa.step(.08);
  key(' ',false);
  assert.equal(qa.snapshot().mode,'tutorialComplete');
}

test('training map requires actions and rewards one completed run only',()=>{
  const h=gameHarness();
  finishTraining(h);
  assert.equal(h.qa.snapshot().coins,300);
  assert.equal(h.qa.snapshot().rewardClaimed,true);
  finishTraining(h);
  assert.equal(h.qa.snapshot().coins,300);
});

test('skipping training grants no completion bonus',()=>{
  const h=gameHarness();h.qa.startTutorial(false);
  h.el('tutorialSkip').onclick();
  assert.equal(h.qa.snapshot().mode,'menu');
  assert.equal(h.qa.snapshot().coins,0);
  assert.equal(h.qa.snapshot().rewardClaimed,false);
});

test('admin invulnerability and one-hit mode affect only the separate test profile',()=>{
  const h=gameHarness();
  h.el('adminProfileBtn').onclick();
  h.el('adminInvincible').onchange({target:{checked:true}});
  h.el('adminOneHit').onchange({target:{checked:true}});
  h.qa.startLevel(1);
  const hp=h.qa.snapshot().player.hp;
  h.qa.hurtPlayer(1000);
  assert.equal(h.qa.snapshot().player.hp,hp);
  h.qa.spawnEnemy();
  assert.equal(h.qa.snapshot().enemies.length,1);
  h.qa.damageFirstEnemy(1);
  assert.equal(h.qa.snapshot().enemies.length,0);
  assert.equal(h.qa.snapshot().adminMode,true);
  assert.equal(h.storage.has('stickman-siege-v3'),false);
  assert.ok(h.storage.has('stickman-siege-admin-options'));
});

test('all maps start in a clear visible area and tutorial leaves room for guidance',()=>{
  const h=gameHarness();
  h.el('adminProfileBtn').onclick();
  for(const level of [1,30,31,60,61,90,91,120,121,150,151,180]){
    h.qa.startLevel(level);
    const {player,view}=h.qa.snapshot();
    assert.equal(view.spawnClear,true,`level ${level}`);
    assert.equal(player.x,view.mapW/2);
    assert.equal(player.y,view.mapH/2);
    assert.ok(Math.abs(player.x-view.cameraX-view.width/2)<1,`level ${level} horizontal camera`);
    assert.ok(Math.abs(player.y-view.cameraY-view.height/2)<1,`level ${level} vertical camera`);
  }
  h.qa.startTutorial(false);
  const {player,view}=h.qa.snapshot();
  assert.equal(view.spawnClear,true);
  assert.ok(Math.abs(player.y-view.cameraY-view.height*.38)<1);
});

test('the canvas tracks short landscape resizes without stretching game coordinates',()=>{
  const h=gameHarness();
  h.resizeTo(667,300,2);
  assert.equal(h.el('game').width,1334);
  assert.equal(h.el('game').height,600);
  assert.deepEqual(h.transform(),[2,0,0,2,0,0]);
  h.qa.startTutorial(false);
  let {player,view}=h.qa.snapshot();
  assert.ok(Math.abs(player.y-view.cameraY-view.height*.32)<1);
  h.resizeTo(568,320,2);
  assert.equal(h.el('game').width,1136);
  assert.equal(h.el('game').height,640);
  assert.deepEqual(h.transform(),[2,0,0,2,0,0]);
});

test('mobile movement stops when pointer capture is lost and after pausing',()=>{
  const h=gameHarness();
  h.el('adminProfileBtn').onclick();
  h.qa.startLevel(1);
  const stick=h.el('joystick');
  stick.getBoundingClientRect=()=>({left:0,top:0,width:100,height:100});
  const start=h.qa.snapshot().player.x;
  stick.emit('pointerdown',{pointerId:3,clientX:80,clientY:50,preventDefault(){}});
  h.qa.step(.1);
  const moved=h.qa.snapshot().player.x;
  assert.ok(moved>start);
  stick.emit('lostpointercapture',{pointerId:3});
  h.qa.step(.1);
  assert.equal(h.qa.snapshot().player.x,moved);
  stick.emit('pointerdown',{pointerId:4,clientX:53,clientY:50,preventDefault(){}});
  h.qa.step(.1);
  assert.equal(h.qa.snapshot().player.x,moved);
  stick.emit('pointermove',{pointerId:4,clientX:80,clientY:50});
  h.qa.step(.1);
  assert.ok(h.qa.snapshot().player.x>moved);
  h.el('pauseBtn').onclick();
  const paused=h.qa.snapshot().player.x;
  h.el('resumeBtn').onclick();
  h.qa.step(.1);
  assert.equal(h.qa.snapshot().player.x,paused);
});

test('at most one elite appears in a regular wave and drops exactly one powerup',()=>{
  const h=gameHarness();
  h.el('adminProfileBtn').onclick();
  h.qa.startLevel(5);
  h.qa.setEliteSlot(0);
  h.qa.spawnEnemy();
  assert.equal(h.qa.snapshot().enemies[0].elite,true);
  h.qa.damageFirstEnemy(1e9);
  assert.equal(h.qa.snapshot().pickups.filter(p=>p.kind==='power').length,1);
  h.qa.spawnEnemy();
  assert.equal(h.qa.snapshot().enemies[0].elite,false);
  h.qa.beginWave(2);
  h.qa.setEliteSlot(0);
  h.qa.spawnEnemy();
  assert.equal(h.qa.snapshot().enemies.at(-1).elite,true);
  h.qa.startLevel(30);
  h.qa.beginWave(3);
  assert.equal(h.qa.snapshot().eliteSlot,-1);
  h.qa.spawnEnemy();
  assert.equal(h.qa.snapshot().enemies[0].type,'boss');
  assert.equal(h.qa.snapshot().enemies[0].elite,false);
  h.qa.startTutorial(false);
  h.qa.setEliteSlot(0);
  h.qa.spawnEnemy();
  assert.equal(h.qa.snapshot().enemies[0].elite,false);
});

test('loot compass points only to an offscreen live powerup',()=>{
  const h=gameHarness();
  h.el('adminProfileBtn').onclick();
  h.qa.startLevel(1);
  const {player,view}=h.qa.snapshot();
  h.qa.dropPower('rapid',player.x+100,player.y);
  assert.equal(h.qa.snapshot().lootCompass,null);
  h.qa.dropPower('rapid',player.x+view.width/2+100,player.y);
  let hint=h.qa.snapshot().lootCompass;
  assert.equal(hint.power,'rapid');
  assert.ok(hint.x<=view.width-34&&hint.x>=34);
  assert.ok(hint.y>=90&&hint.y<=view.height-150);
  h.qa.expirePower();
  assert.equal(h.qa.snapshot().lootCompass,null);
});

test('browser reload retains earned progress, equipment, tutorial reward and settings',()=>{
  const original=C.defaultSave();
  original.settings.music=13;original.upgrades.armor=2;
  original.ownedSkins.push('bat');original.skin='bat';original.tutorialDone=true;original.tutorialRewardClaimed=true;
  const storage=new Map([['stickman-siege-v3',JSON.stringify(original)]]);
  const first=gameHarness({storage});first.qa.startLevel(1);
  first.qa.collectPickup('coin');first.qa.collectPickup('xp');first.qa.finish(true);
  const saved=JSON.parse(storage.get('stickman-siege-v3'));
  assert.equal(saved.coins,100);assert.equal(saved.unlocked,2);
  assert.equal(saved.settings.music,13);assert.equal(saved.skin,'bat');
  assert.equal(saved.upgrades.armor,2);assert.equal(saved.tutorialRewardClaimed,true);
  const second=gameHarness({storage});
  assert.equal(second.qa.snapshot().coins,saved.coins);
  assert.equal(second.qa.snapshot().xp,saved.xp);
  assert.equal(second.qa.snapshot().xpLevel,saved.xpLevel);
  assert.equal(second.qa.snapshot().rewardClaimed,true);
  assert.match(second.el('progressText').textContent,/LEVEL 02/);
  assert.equal(second.el('profileText').textContent,'SPIELER · LOKAL');
  assert.equal(storage.has('stickman-siege-storage-check'),false);
});

test('blocked local storage is visible and failed writes keep the old stored save',()=>{
  const original=C.defaultSave();original.coins=42;
  const raw=JSON.stringify(original),storage=new Map([['stickman-siege-v3',raw]]);
  const options={storage,rejectWrites:true},h=gameHarness(options);
  assert.equal(h.qa.snapshot().coins,42);
  assert.match(h.el('profileText').textContent,/UNGESICHERT/);
  assert.match(h.el('storageStatus').textContent,/blockiert/);
  h.qa.startLevel(1);h.qa.collectPickup('coin');
  assert.equal(storage.get('stickman-siege-v3'),raw);
  assert.match(h.el('profileText').textContent,/UNGESICHERT/);
  options.rejectWrites=false;h.qa.collectPickup('coin');
  assert.equal(JSON.parse(storage.get('stickman-siege-v3')).coins,242);
  assert.equal(h.el('profileText').textContent,'SPIELER · LOKAL');
});

test('shared settings persist from admin mode without storing admin resources',()=>{
  const original=C.defaultSave();original.coins=42;original.unlocked=3;
  const storage=new Map([['stickman-siege-v3',JSON.stringify(original)]]);
  const first=gameHarness({storage});first.el('adminProfileBtn').onclick();
  assert.equal(first.qa.snapshot().adminMode,true);
  first.el('settingsBtn').onclick();
  const settings=first.el('settingsGrid').children.at(-1);
  settings.children[1].querySelector('input').oninput({target:{value:'17'}});
  const stored=JSON.parse(storage.get('stickman-siege-v3'));
  assert.equal(stored.settings.music,17);
  assert.equal(stored.coins,42);assert.equal(stored.unlocked,3);
  assert.deepEqual(stored.ownedWeapons,original.ownedWeapons);
  const second=gameHarness({storage});second.el('adminProfileBtn').onclick();
  assert.equal(second.qa.snapshot().adminMode,false);
  assert.equal(second.qa.snapshot().coins,42);
  second.el('settingsBtn').onclick();
  assert.match(second.el('settingsGrid').children.at(-1).children[1].innerHTML,/value="17"/);
});

test('endless loot and real shop purchases cannot change campaign progress or upgrades',()=>{
  const original=C.defaultSave();original.coins=1234;original.unlocked=12;original.tutorialDone=true;
  original.upgrades.damage=7;original.upgrades.health=4;original.weapons=['rifle'];original.ownedWeapons.push('rifle');
  const raw=JSON.stringify(original),storage=new Map([['stickman-siege-v3',raw]]),h=gameHarness({storage});
  h.el('endlessBtn').onclick();
  assert.equal(h.qa.snapshot().endless,true);assert.equal(h.qa.snapshot().mode,'playing');
  assert.equal(h.qa.snapshot().map,'garden');assert.equal(h.qa.snapshot().coins,0);
  assert.equal(h.qa.snapshot().player.maxHp,100);assert.equal(h.qa.snapshot().upgrades.damage,0);
  assert.deepEqual([...h.qa.snapshot().weapons],['pistol']);
  for(let i=0;i<5;i++){h.qa.collectPickup('coin');h.qa.collectPickup('xp');}
  h.el('pauseBtn').onclick();h.el('shopFromPause').onclick();
  const cards=()=>h.el('shopGrid').children.slice(-C.UPGRADES.length);
  cards()[0].querySelector('button').onclick();
  cards()[2].querySelector('button').onclick();
  assert.equal(h.qa.snapshot().upgrades.damage,1);assert.equal(h.qa.snapshot().upgrades.health,1);
  assert.equal(h.qa.snapshot().player.maxHp,124);assert.equal(h.qa.snapshot().player.hp,124);
  assert.equal(h.el('hudCoins').textContent,h.qa.snapshot().coins);
  assert.equal(storage.get('stickman-siege-v3'),raw);
  h.el('menuFromPause').onclick();
  assert.equal(h.qa.snapshot().endless,false);assert.equal(h.qa.snapshot().coins,1234);
  assert.equal(h.qa.snapshot().upgrades.damage,7);assert.equal(h.qa.snapshot().upgrades.health,4);
  h.qa.startLevel(12);assert.equal(h.qa.snapshot().player.maxHp,196);
  assert.deepEqual([...h.qa.snapshot().weapons],['rifle']);
});

test('endless waves continue past campaign limits and pause for a round-only shop',()=>{
  const h=gameHarness();h.qa.startEndless();
  for(let wave=1;wave<=6;wave++){
    assert.equal(h.qa.snapshot().wave,wave);
    h.qa.endWaveForTest();h.qa.step(1.3);
    assert.equal(h.qa.snapshot().mode,'paused');assert.equal(h.qa.snapshot().completedWaves,wave);
    assert.match(h.el('resumeBtn').innerHTML,new RegExp(`WELLE ${wave+1} STARTEN`));
    h.el('resumeBtn').onclick();assert.equal(h.qa.snapshot().mode,'playing');
  }
  h.qa.beginWave(1000);h.qa.endWaveForTest();h.qa.step(1.3);h.el('resumeBtn').onclick();
  assert.equal(h.qa.snapshot().wave,1001);assert.equal(h.qa.snapshot().mode,'playing');
  assert.equal(h.qa.snapshot().endless,true);
  assert.equal(JSON.parse(h.storage.get('stickman-siege-endless-v1')).wave,1000);
  assert.equal(h.storage.has('stickman-siege-v3'),false);
  const best=JSON.parse(h.storage.get('stickman-siege-endless-v1'));
  h.qa.startEndless();h.qa.step(30);h.el('menuFromPause').onclick();
  assert.deepEqual(JSON.parse(h.storage.get('stickman-siege-endless-v1')),best,'a lower-wave run must not mix its longer time into the best run');
});

test('endless restart resets purchases and death leaves the campaign byte-for-byte intact',()=>{
  const original=C.defaultSave();original.coins=77;original.tutorialDone=true;
  const raw=JSON.stringify(original),storage=new Map([['stickman-siege-v3',raw]]),h=gameHarness({storage});
  h.qa.startEndless();h.qa.collectPickup('coin');h.qa.hurtPlayer(99999);
  assert.equal(h.qa.snapshot().mode,'result');assert.equal(storage.get('stickman-siege-v3'),raw);
  h.el('resultPrimary').onclick();assert.equal(h.qa.snapshot().coins,0);
  assert.equal(h.qa.snapshot().wave,1);assert.equal(h.qa.snapshot().player.hp,100);
  h.el('pauseBtn').onclick();h.qa.collectPickup('coin');h.el('restartBtn').onclick();
  assert.equal(h.qa.snapshot().coins,0);assert.equal(h.qa.snapshot().wave,1);
  h.el('menuFromPause').onclick();assert.equal(h.qa.snapshot().coins,77);
  const reloaded=gameHarness({storage});assert.equal(reloaded.qa.snapshot().coins,77);
  assert.equal(reloaded.qa.snapshot().endless,false);
});

test('endless disables admin advantages and keeps only shared settings across modes',()=>{
  const original=C.defaultSave();original.coins=42;
  const storage=new Map([['stickman-siege-v3',JSON.stringify(original)],['stickman-siege-profile','admin'],['stickman-siege-admin-options',JSON.stringify({invincible:true,oneHit:true})]]);
  const h=gameHarness({storage});assert.equal(h.qa.snapshot().adminMode,true);
  h.qa.startEndless();assert.equal(h.qa.snapshot().adminMode,false);h.qa.hurtPlayer(10);
  assert.equal(h.qa.snapshot().player.hp,90);
  h.el('pauseBtn').onclick();h.el('settingsFromPause').onclick();
  h.el('settingsGrid').children.at(-1).children[1].querySelector('input').oninput({target:{value:'19'}});
  const disk=JSON.parse(storage.get('stickman-siege-v3'));
  assert.equal(disk.coins,42);assert.equal(disk.settings.music,19);assert.equal(disk.upgrades.health,0);
  h.el('menuFromPause').onclick();assert.equal(h.qa.snapshot().adminMode,true);
  h.el('adminProfileBtn').onclick();assert.equal(h.qa.snapshot().coins,42);
});

test('night garden has safe travel lanes, a working boss and a bounded enemy population',()=>{
  const h=gameHarness();h.qa.startEndless();assert.equal(h.qa.snapshot().view.spawnClear,true);
  h.qa.setPlayer(1100,500);h.key('s',true);h.qa.step(1);h.key('s',false);
  assert.equal(h.qa.snapshot().player.y,725);
  h.qa.beginWave(5);h.qa.spawnEnemy();
  assert.equal(h.qa.snapshot().enemies.at(-1).type,'boss');
  h.qa.step(1.6);assert.equal(h.qa.snapshot().enemies.at(-1).charge.name,'GLASSAAT');
  h.qa.step(.9); // Resolve the actual garden attack without an unknown-pattern crash.
  h.qa.step(3.1);assert.equal(h.qa.snapshot().enemies.at(-1).charge.name,'WURZELBEETE');
  assert.equal(h.qa.snapshot().enemies.at(-1).charge.super,true);
  h.qa.step(1.3);assert.equal(h.qa.snapshot().mode,'playing');
  h.qa.startEndless();h.qa.beginWave(999);
  for(let i=0;i<C.ENDLESS.maxActiveEnemies;i++)h.qa.spawnEnemy();
  h.qa.step(.6);assert.equal(h.qa.snapshot().enemies.length,C.ENDLESS.maxActiveEnemies);
});

test('Android backup bridge exports the normal player profile, including from admin mode',()=>{
  const original=C.defaultSave();original.coins=42;original.upgrades.damage=3;
  const storage=new Map([['stickman-siege-v3',JSON.stringify(original)]]);
  let exported;
  const h=gameHarness({storage,androidBridge:{saveBackup:json=>{exported=JSON.parse(json);}}});
  h.el('adminProfileBtn').onclick();h.el('saveExportBtn').onclick();
  assert.equal(exported.format,'stickman-siege-save');assert.equal(exported.version,1);
  assert.equal(exported.save.coins,42);assert.equal(exported.save.upgrades.damage,3);
  assert.deepEqual(exported.save.ownedWeapons,['pistol']);
  assert.equal(C.readBackup(exported).coins,42);
  assert.match(h.el('saveStatus').textContent,/Android-Dateiauswahl/);
});
