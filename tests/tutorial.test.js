const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../dist/core.js');

function gameHarness() {
  const elements = new Map();
  const listeners = new Map();
  const storage = new Map();
  const observers=[];
  let viewport={width:844,height:390};
  function el(id) {
    if (!elements.has(id)) {const eventHandlers=new Map();elements.set(id, {
      id, textContent:'', innerHTML:'', firstElementChild:{textContent:''},
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
    SiegeCore:C, innerWidth:844, innerHeight:390, devicePixelRatio:1,
    document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
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
