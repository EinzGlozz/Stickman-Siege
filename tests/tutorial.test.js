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
  function el(id) {
    if (!elements.has(id)) elements.set(id, {
      id, textContent:'', innerHTML:'', firstElementChild:{textContent:''},
      classList:{add(){},remove(){},toggle(){},contains(){return false;}},
      style:{setProperty(){}},
      addEventListener(){}, setPointerCapture(){},
      getBoundingClientRect(){return {left:0,top:0,width:844,height:390};}
    });
    return elements.get(id);
  }
  el('game').getContext = () => ({setTransform(){}});
  const context = {
    SiegeCore:C, innerWidth:844, innerHeight:390, devicePixelRatio:1,
    document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    location:{hostname:'localhost',search:''}, screen:{orientation:{lock:()=>Promise.resolve()}},
    performance:{now:()=>0}, requestAnimationFrame(){}, setTimeout(){},
    addEventListener:(name,handler)=>listeners.set(name,handler),
    URLSearchParams, Math, console
  };
  context.window=context;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8'),context);
  const qa=context.__SIEGE_QA__;
  function key(name,down){listeners.get(down?'keydown':'keyup')({key:name,preventDefault(){}});}
  return {qa,key,el,storage};
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
