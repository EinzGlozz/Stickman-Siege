(() => {
  'use strict';
  const C=window.SiegeCore, $=id=>document.getElementById(id);
  if(!C) throw new Error('SiegeCore fehlt');
  const canvas=$('game'),ctx=canvas.getContext('2d');
  const screens=['menu','levelsScreen','shopScreen','settingsScreen','tutorialScreen','pauseScreen','resultScreen'];
  let regular;
  try{regular=C.sanitizeSave(JSON.parse(localStorage.getItem('stickman-siege-v3')||localStorage.getItem('stickman-siege-v1')||'{}'));}
  catch{regular=C.defaultSave();}
  const admin=C.adminSave();admin.settings=regular.settings;
  let adminMode=false;
  try{adminMode=localStorage.getItem('stickman-siege-profile')==='admin';}catch{}
  let save=adminMode?admin:regular;
  function persist(){if(adminMode)return;try{localStorage.setItem('stickman-siege-v3',JSON.stringify(regular));}catch{}}
  function changeProfile(){adminMode=!adminMode;save=adminMode?admin:regular;try{localStorage.setItem('stickman-siege-profile',adminMode?'admin':'player');}catch{}renderSettings();renderMenu();toast(adminMode?'ADMIN-PROFIL AKTIV':'SPIELER-PROFIL AKTIV');}
  const state={mode:'menu',screen:'menu',level:1,info:C.levelInfo(1),wave:1,spawned:0,toSpawn:0,spawnTimer:0,waveWait:0,kills:0,earnedCoins:0,earnedXp:0,time:0,last:0,accumulator:0,shake:0,flash:0,toastTimer:0,hpDisplay:100,hpTrail:100,hudTimer:0,musicTimer:0,musicNote:0,shopTab:'upgrades',selectedMap:0,panelReturn:'menu',tutorialStep:0,tutorialStartsGame:false};
  const world={viewW:0,viewH:0,dpr:1,mapW:2200,mapH:2200,cameraX:0,cameraY:0,obstacles:[],decor:[]};
  let player=null,enemies=[],bullets=[],enemyBullets=[],particles=[],pickups=[],effects=[],nextEnemyId=1;
  const input={keys:new Set(),joyX:0,joyY:0,fire:false,mouseX:0,mouseY:0,mouseAim:false};
  const clamp=C.clamp,rand=(a,b)=>a+Math.random()*(b-a),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const enemyDefs={
    zombie:{hp:46,speed:70,r:17,damage:11,coin:13,xp:11,reach:38,attack:1.15,color:'#8cc27a'},
    skeleton:{hp:35,speed:65,r:15,damage:12,coin:17,xp:14,reach:0,attack:2.05,color:'#e9e4d0',ranged:true},
    ghoul:{hp:34,speed:120,r:15,damage:10,coin:18,xp:16,reach:36,attack:.9,color:'#b184c9'},
    golem:{hp:125,speed:42,r:25,damage:22,coin:30,xp:24,reach:54,attack:1.8,color:'#a5a3a2'},
    wraith:{hp:55,speed:85,r:19,damage:13,coin:23,xp:20,reach:0,attack:1.7,color:'#b5b6ee',ranged:true},
    demon:{hp:75,speed:82,r:19,damage:17,coin:28,xp:24,reach:0,attack:1.45,color:'#e98077',ranged:true},
    boss:{hp:660,speed:56,r:42,damage:25,coin:450,xp:280,reach:66,attack:1.3,color:'#ffb47d',ranged:true}
  };
  const audio={ctx:null};
  function activateAudio(){try{audio.ctx??=new (window.AudioContext||window.webkitAudioContext)();if(audio.ctx.state==='suspended')audio.ctx.resume();}catch{}}
  function tone(freq,duration=.1,wave='sine',gain=.2,music=false){
    const a=audio.ctx;if(!a||!freq)return;
    const volume=(save.settings.master/100)*(music?save.settings.music/100:save.settings.sfx/100);
    if(volume<=0)return;
    const oscillator=a.createOscillator(),node=a.createGain(),now=a.currentTime;
    oscillator.type=wave;oscillator.frequency.setValueAtTime(freq,now);
    node.gain.setValueAtTime(Math.max(.0001,gain*volume),now);node.gain.exponentialRampToValueAtTime(.0001,now+duration);
    oscillator.connect(node);node.connect(a.destination);oscillator.start(now);oscillator.stop(now+duration+.01);
  }
  function sfx(kind){
    if(kind==='shot')tone(320,.07,'triangle',.1);
    else if(kind==='hit')tone(130,.12,'sawtooth',.1);
    else if(kind==='coin')tone(760,.1,'sine',.14);
    else if(kind==='xp')tone(570,.08,'sine',.09);
    else if(kind==='power'){tone(440,.17,'sine',.15);setTimeout(()=>tone(660,.2,'sine',.12),75);}
    else if(kind==='hurt')tone(85,.2,'sawtooth',.16);
  }
  function updateMusic(dt){
    if(state.mode!=='playing'||!audio.ctx)return;
    state.musicTimer-=dt;if(state.musicTimer>0)return;
    const boss=state.info.boss&&state.wave===3;
    const notes=boss?[110,165,130,196,146,220,130,165]:[196,247,294,247,220,261,330,261];
    const n=notes[state.musicNote++%notes.length];tone(n,boss?.21:.48,boss?'sawtooth':'sine',boss?.038:.042,true);
    if(state.musicNote%4===1)tone(n/2,boss?.35:.7,'triangle',.025,true);
    state.musicTimer=boss?.27:.57;
  }
  function makeRng(seed){let v=seed>>>0;return()=>{v+=0x6d2b79f5;let t=v;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
  function circleRect(x,y,r,o){const px=clamp(x,o.x,o.x+o.w),py=clamp(y,o.y,o.y+o.h);return(x-px)**2+(y-py)**2<r*r;}
  function blocked(x,y,r){return world.obstacles.some(o=>circleRect(x,y,r,o));}
  function overlap(a,b,pad=0){return a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;}
  function generateArena(){
    world.mapW=2200;world.mapH=2200;world.obstacles=[];world.decor=[];
    const rng=makeRng((Date.now()^state.level*2654435761)>>>0),occupied=[],center=1100;
    const between=(a,b)=>a+rng()*(b-a);
    function place(w,h,shape){
      for(let tries=0;tries<100;tries++){
        const x=between(100,world.mapW-w-100),y=between(100,world.mapH-h-100),box={x,y,w,h};
        if(Math.hypot(x+w/2-center,y+h/2-center)<290+Math.max(w,h)*.35||occupied.some(o=>overlap(box,o,65)))continue;
        occupied.push(box);world.obstacles.push(...shape(x,y,w,h));return;
      }
    }
    for(let i=0;i<10;i++)place(between(125,205),between(115,190),(x,y,w,h)=>{
      const t=between(27,42),side=Math.floor(rng()*4);
      if(side===0)return[{x,y,w,h:t,kind:'wall'},{x,y:y+t,w:t,h:h-t,kind:'wall'}];
      if(side===1)return[{x,y,w,h:t,kind:'wall'},{x:x+w-t,y:y+t,w:t,h:h-t,kind:'wall'}];
      if(side===2)return[{x,y:y+h-t,w,h:t,kind:'wall'},{x,y,w:t,h:h-t,kind:'wall'}];
      return[{x,y:y+h-t,w,h:t,kind:'wall'},{x:x+w-t,y,w:t,h:h-t,kind:'wall'}];
    });
    for(let i=0;i<18;i++)place(between(58,105),between(50,105),(x,y,w,h)=>[{x,y,w,h,kind:'crate'}]);
    for(let i=0;i<220;i++){
      const x=between(25,2175),y=between(25,2175);
      if(Math.hypot(x-center,y-center)<120||blocked(x,y,16))continue;
      world.decor.push({x,y,kind:Math.floor(rng()*4),size:between(4,16),phase:between(0,6.28)});
    }
  }
  function moveCircle(body,dx,dy){
    body.x=clamp(body.x+dx,body.r+10,world.mapW-body.r-10);
    for(const o of world.obstacles)if(circleRect(body.x,body.y,body.r,o))body.x=dx>0?o.x-body.r:dx<0?o.x+o.w+body.r:body.x;
    body.y=clamp(body.y+dy,body.r+10,world.mapH-body.r-10);
    for(const o of world.obstacles)if(circleRect(body.x,body.y,body.r,o))body.y=dy>0?o.y-body.r:dy<0?o.y+o.h+body.r:body.y;
  }
  function segmentRectT(x1,y1,x2,y2,o,pad=0){
    let enter=0,exit=1;const dx=x2-x1,dy=y2-y1;
    for(const [p,d,min,max] of [[x1,dx,o.x-pad,o.x+o.w+pad],[y1,dy,o.y-pad,o.y+o.h+pad]]){
      if(Math.abs(d)<1e-9){if(p<min||p>max)return null;continue;}
      const a=(min-p)/d,b=(max-p)/d;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));if(enter>exit)return null;
    }return enter;
  }
  function segmentCircleT(x1,y1,x2,y2,x,y,r){
    const dx=x2-x1,dy=y2-y1,fx=x1-x,fy=y1-y,a=dx*dx+dy*dy;if(a<1e-10)return null;
    const c=fx*fx+fy*fy-r*r;if(c<=0)return 0;
    const b=2*(fx*dx+fy*dy),disc=b*b-4*a*c;if(disc<0)return null;
    const t=(-b-Math.sqrt(disc))/(2*a);return t>=0&&t<=1?t:null;
  }
  function firstCover(x1,y1,x2,y2,pad=0){let hit=null,tmin=Infinity;for(const o of world.obstacles){const t=segmentRectT(x1,y1,x2,y2,o,pad);if(t!==null&&t<tmin){tmin=t;hit=o;}}return hit;}
  function cameraToPlayer(dt=1){if(!player)return;const x=clamp(player.x-world.viewW/2,0,Math.max(0,world.mapW-world.viewW)),y=clamp(player.y-world.viewH/2,0,Math.max(0,world.mapH-world.viewH)),f=Math.min(1,dt*10);world.cameraX+=(x-world.cameraX)*f;world.cameraY+=(y-world.cameraY)*f;}
  function resize(){const r=canvas.getBoundingClientRect();world.viewW=Math.max(1,r.width);world.viewH=Math.max(1,r.height);world.dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(world.viewW*world.dpr);canvas.height=Math.round(world.viewH*world.dpr);ctx.setTransform(world.dpr,0,0,world.dpr,0,0);cameraToPlayer(1);}
  addEventListener('resize',resize);resize();
  function burst(x,y,color,count=8,power=120){for(let i=0;i<count;i++){const a=rand(0,Math.PI*2),v=rand(power*.25,power),life=rand(.25,.6);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life,max:life,r:rand(1.5,4),color});}}
  function flashEffect(kind,x,y,color,life=.35,extra={}){effects.push({kind,x,y,color,life,max:life,...extra});}
  function toast(message,duration=1.7){$('toast').textContent=message;$('toast').classList.remove('hidden');state.toastTimer=duration;}
  function showScreen(id){state.screen=id;for(const s of screens)$(s).classList.toggle('hidden',s!==id);$('hud').classList.toggle('hidden',!(state.mode==='playing'||state.mode==='paused')||!!id&&id!=='pauseScreen');$('mobileControls').classList.toggle('hidden',state.mode!=='playing'||!!id);$('rotateNote').classList.toggle('hidden',state.mode!=='playing'||!!id);}
  function renderMenu(){const info=C.levelInfo(Math.min(save.unlocked,C.MAX_LEVEL));$('menuCoins').textContent=adminMode?'∞':save.coins;$('shopCoins').textContent=adminMode?'∞':save.coins;$('progressText').textContent=`${info.map.name} · LEVEL ${String(info.local).padStart(2,'0')} / 30`;$('profileText').textContent=adminMode?'ADMIN ∞':'SPIELER';$('playBtn').firstElementChild.textContent=save.unlocked>1?`LEVEL ${info.local} STARTEN`:'SPIEL STARTEN';}
  function updateHud(){
    if(!player)return;
    $('hudMap').textContent=state.info.map.name;$('hudLevel').textContent=`${String(state.info.local).padStart(2,'0')} / 30`;$('hudWave').textContent=`WELLE ${state.wave}/3`;
    $('hudCoins').textContent=adminMode?'∞':save.coins;$('hpText').textContent=`${Math.ceil(Math.max(0,player.hp))} / ${player.maxHp}`;
    $('hpFill').style.transform=`scaleX(${clamp(state.hpDisplay/player.maxHp,0,1)})`;$('hpLag').style.transform=`scaleX(${clamp(state.hpTrail/player.maxHp,0,1)})`;$('healthWrap').classList.toggle('critical',player.hp/player.maxHp<.3);
    $('hudXpLevel').textContent=adminMode?'XP ∞':`XP ${save.xpLevel}`;$('xpFill').style.width=adminMode?'100%':`${clamp(save.xp/C.xpRequired(save.xpLevel)*100,0,100)}%`;
    const boss=enemies.find(e=>e.type==='boss');$('bossHud').classList.toggle('hidden',!boss);if(boss){$('bossName').textContent=state.info.map.boss;$('bossFill').style.width=`${Math.max(0,boss.hp/boss.maxHp*100)}%`;}
    $('buffBar').innerHTML=Object.entries(player.buffs).filter(([,v])=>v>0).map(([id,v])=>{const p=C.POWERUPS.find(p=>p.id===id);return `<span style="--buff:${p.color}">${p.icon} ${Math.ceil(v)}s</span>`;}).join('');
    const w=C.WEAPONS.find(w=>w.id===save.weapons[0])||C.WEAPONS[0],rate=w.rate*Math.pow(.9,save.upgrades.rate),left=player.cooldowns[w.id]||0;
    $('fireBtn').style.setProperty('--ready',`${player.buffs.rapid>0?100:Math.round(100*(1-clamp(left/Math.max(.05,rate),0,1)))}%`);
  }
  function beginWave(wave){state.wave=wave;state.spawned=0;state.toSpawn=wave===3&&state.info.boss?1:Math.min(5+Math.floor(state.info.local*.38)+state.info.mapIndex*2+wave*2,22);state.spawnTimer=.5;state.waveWait=0;toast(wave===3&&state.info.boss?`${state.info.map.boss} ERWACHT`:`WELLE ${wave} / 3`);updateHud();}
  function startLevel(level){
    state.level=C.levelInfo(level).global;state.info=C.levelInfo(level);state.wave=1;state.kills=0;state.earnedCoins=0;state.earnedXp=0;state.time=0;state.shake=0;state.flash=0;state.musicTimer=0;state.musicNote=0;
    enemies=[];bullets=[];enemyBullets=[];particles=[];pickups=[];effects=[];generateArena();
    const maxHp=100+save.upgrades.health*24;
    player={x:1100,y:1100,r:16,hp:maxHp,maxHp,angle:0,walk:0,attackAnim:0,specialAnim:0,specialCooldown:0,invuln:0,cooldowns:{},perkTimers:{},buffs:{rapid:0,invincible:0,double:0,magnet:0,slow:0}};
    state.hpDisplay=maxHp;state.hpTrail=maxHp;cameraToPlayer(1);beginWave(1);activateAudio();
    if(!save.tutorialDone){startTutorial(true);}else{state.mode='playing';showScreen(null);}updateHud();
  }
  function chooseEnemyType(){
    const roll=Math.random(),m=state.info.mapIndex,l=state.info.local;
    if(m>=3&&roll<.17)return'demon';if(m>=2&&roll<.31)return'wraith';
    if(l>=12&&roll<.42)return'golem';if(roll<.31)return'skeleton';if(roll<.53)return'ghoul';return'zombie';
  }
  function spawnEnemy(){
    const type=state.wave===3&&state.info.boss?'boss':chooseEnemyType(),d=enemyDefs[type];
    const scale=1+state.info.mapIndex*.48+(state.info.local-1)*.035;
    let x=1100,y=1100;
    for(let tries=0;tries<100;tries++){
      const a=rand(0,Math.PI*2),radius=rand(370,550);x=clamp(player.x+Math.cos(a)*radius,60,2140);y=clamp(player.y+Math.sin(a)*radius,60,2140);
      if(Math.hypot(x-player.x,y-player.y)>260&&!blocked(x,y,d.r+10))break;
    }
    const hp=d.hp*scale*(type==='boss'?1+state.info.mapIndex*.35:1);
    enemies.push({id:nextEnemyId++,x,y,type,r:d.r,hp,maxHp:hp,speed:d.speed*(1+state.info.mapIndex*.08),damage:d.damage*(1+state.info.mapIndex*.16),coin:Math.round(d.coin*(1+state.info.mapIndex*.4)),xp:Math.round(d.xp*(1+state.info.mapIndex*.35)),angle:0,phase:rand(0,6),walk:0,attackCd:rand(.6,1.5),attackAnim:0,hit:0,slow:0});
  }
  function nearestEnemy(x,y,max=Infinity,visible=false){let hit=null,best=max;for(const e of enemies){const d=Math.hypot(e.x-x,e.y-y);if(d<best&&(!visible||!firstCover(x,y,e.x,e.y,3))){hit=e;best=d;}}return hit;}
  function playerAngle(){const target=nearestEnemy(player.x,player.y,650,true);let a=target?Math.atan2(target.y-player.y,target.x-player.x):player.angle;if(input.mouseAim)a=Math.atan2(input.mouseY+world.cameraY-player.y,input.mouseX+world.cameraX-player.x);return a;}
  function projectile(owner,x,y,a,speed,damage,kind,color,extra={}){const p={owner,x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:extra.r||5,damage,kind,color,life:extra.life||1.5,pierce:extra.pierce||0,bounce:extra.bounce||0,splash:extra.splash||0,slow:extra.slow||0,hitIds:new Set()};(owner==='player'?bullets:enemyBullets).push(p);}
  function fireWeapon(w,a){
    if((player.cooldowns[w.id]||0)>0)return false;
    player.cooldowns[w.id]=C.weaponInterval(w,save.upgrades.rate,player.buffs.rapid>0);
    const mult=player.buffs.double>0?2:1,damage=(w.damage+save.upgrades.damage*4)*mult;
    const extra=w.id===save.weapons[0]?Math.floor(save.upgrades.multi/2):0;
    for(let i=0;i<w.shots+extra;i++){
      const count=w.shots+extra,off=(i-(count-1)/2)*(w.spread||.075),ang=a+off;
      projectile('player',player.x+Math.cos(ang)*25,player.y+Math.sin(ang)*25,ang,w.speed,damage,w.id,w.color,{r:w.id==='brick'?8:w.id==='football'?9:4,pierce:w.pierce||0,bounce:w.bounce||0,splash:w.splash||0,life:w.id==='shotgun'?.55:1.6});
    }
    player.attackAnim=.22;burst(player.x+Math.cos(a)*25,player.y+Math.sin(a)*25,w.color,3,65);sfx('shot');return true;
  }
  function damageEnemy(e,amount,x=e.x,y=e.y){if(!enemies.includes(e))return;e.hp-=amount;e.hit=.13;burst(x,y,enemyDefs[e.type].color,4,55);sfx('hit');if(e.hp<=0)enemyDead(e);}
  function areaDamage(x,y,r,amount){for(const e of [...enemies])if(Math.hypot(e.x-x,e.y-y)<r+e.r)damageEnemy(e,amount);}
  function specialAttack(a){
    if(player.specialCooldown>0)return;
    const skin=C.SKINS.find(s=>s.id===save.skin)||C.SKINS[0],p=skin.power;
    if(p==='normal')return;
    const dmg=(25+save.upgrades.damage*5)*(player.buffs.double>0?2:1);
    player.specialCooldown=p==='smash'?4.4:p==='lightning'?4.2:3.1;player.specialAnim=.48;
    if(p==='web')projectile('player',player.x,player.y,a,600,dmg*.8,'web','#d4faff',{r:10,slow:2.5,life:1.2});
    else if(p==='bat')projectile('player',player.x,player.y,a,690,dmg,'bat','#ffe586',{r:9,pierce:2,life:1.1});
    else if(p==='claw'){for(const e of [...enemies]){const d=dist(e,player),angle=Math.atan2(e.y-player.y,e.x-player.x);if(d<105+e.r&&Math.abs(Math.atan2(Math.sin(angle-a),Math.cos(angle-a)))<.9)damageEnemy(e,dmg*1.5);}flashEffect('slash',player.x,player.y,'#ffe47b',.3,{angle:a,r:110});}
    else if(p==='smash'){areaDamage(player.x,player.y,125,dmg*1.7);flashEffect('ring',player.x,player.y,'#9de27d',.45,{r:135});state.shake=8;}
    else if(p==='laser'){const endX=player.x+Math.cos(a)*520,endY=player.y+Math.sin(a)*520;for(const e of [...enemies])if(segmentCircleT(player.x,player.y,endX,endY,e.x,e.y,e.r+12)!==null)damageEnemy(e,dmg*1.35);flashEffect('beam',player.x,player.y,'#ffe082',.26,{x2:endX,y2:endY});}
    else if(p==='lightning'){let from=player,targets=[...enemies];for(let i=0;i<4;i++){targets.sort((x,y)=>dist(from,x)-dist(from,y));const e=targets[0];if(!e||dist(from,e)>320)break;flashEffect('beam',from.x,from.y,'#aeeaff',.25,{x2:e.x,y2:e.y});damageEnemy(e,dmg*1.1);targets.shift();from=e;}}
    else if(p==='shadow'){moveCircle(player,Math.cos(a)*88,Math.sin(a)*88);areaDamage(player.x,player.y,80,dmg*1.35);flashEffect('ring',player.x,player.y,'#c59cff',.4,{r:90});}
    tone(320,.24,'sawtooth',.16);
  }
  function playerShoot(){if(!player||bullets.length>480)return;const a=playerAngle();player.angle=a;let fired=false;for(const id of save.weapons){const w=C.WEAPONS.find(w=>w.id===id);if(w&&fireWeapon(w,a))fired=true;}if(fired)specialAttack(a);}
  function enemyShoot(e){
    const a=Math.atan2(player.y-e.y,player.x-e.x),n=e.type==='boss'?(e.hp/e.maxHp<.5?7:5):1;
    for(let i=0;i<n;i++){const ang=a+(i-(n-1)/2)*(e.type==='boss'?.22:0),kind=e.type==='skeleton'?'arrow':e.type==='wraith'?'spirit':e.type==='demon'?'fire':'boss';projectile('enemy',e.x+Math.cos(ang)*e.r,e.y+Math.sin(ang)*e.r,ang,e.type==='skeleton'?270:e.type==='boss'?280:230,e.damage,kind,enemyDefs[e.type].color,{r:e.type==='boss'?7:5,life:3});}
    e.attackAnim=.4;burst(e.x,e.y,enemyDefs[e.type].color,5,70);
  }
  function enemyDead(e){
    const i=enemies.indexOf(e);if(i<0)return;enemies.splice(i,1);state.kills++;
    const fortune=1+save.upgrades.fortune*.14;
    pickups.push({kind:'coin',x:e.x-11,y:e.y,r:9,value:Math.round(e.coin*fortune),life:15,t:0});
    pickups.push({kind:'xp',x:e.x+11,y:e.y,r:9,value:e.xp,life:15,t:0});
    const chance=.14+save.upgrades.fortune*.035;
    const count=e.type==='boss'?2:Math.random()<chance?1:0;
    for(let j=0;j<count;j++){const type=C.POWERUPS[Math.floor(rand(0,C.POWERUPS.length))];pickups.push({kind:'power',power:type.id,x:e.x+rand(-20,20),y:e.y+rand(-20,20),r:15,life:14,t:0});}
    burst(e.x,e.y,enemyDefs[e.type].color,e.type==='boss'?35:14,e.type==='boss'?220:130);state.shake=e.type==='boss'?10:2.5;
  }
  function collectPickup(p){
    const i=pickups.indexOf(p);if(i<0)return;pickups.splice(i,1);
    if(p.kind==='coin'){if(!adminMode){save.coins+=p.value;state.earnedCoins+=p.value;persist();}sfx('coin');burst(p.x,p.y,'#ffd678',7,75);}
    else if(p.kind==='xp'){if(!adminMode){save.xp+=p.value;state.earnedXp+=p.value;while(save.xp>=C.xpRequired(save.xpLevel)&&save.xpLevel<999){save.xp-=C.xpRequired(save.xpLevel);save.xpLevel++;save.skillPoints++;toast(`XP-STUFE ${save.xpLevel} · +1 PUNKT`);}persist();}sfx('xp');burst(p.x,p.y,'#9cdbff',7,75);}
    else{const power=C.POWERUPS.find(x=>x.id===p.power);if(power.id==='heal')player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.35);else player.buffs[power.id]=Math.max(player.buffs[power.id],power.duration);if(power.id==='rapid')for(const id in player.cooldowns)player.cooldowns[id]=0;toast(power.name);sfx('power');flashEffect('ring',p.x,p.y,power.color,.45,{r:72});}
    updateHud();
  }
  function hurt(amount){if(!player||player.invuln>0||player.buffs.invincible>0)return;const dmg=Math.max(1,amount*(1-save.upgrades.armor*.07));player.hp-=dmg;player.invuln=.55;state.shake=7;state.flash=.17;burst(player.x,player.y,'#8ae5e8',12,130);sfx('hurt');updateHud();if(player.hp<=0)finish(false);}
  function finish(won){
    if(state.mode!=='playing')return;
    if(won)for(const p of [...pickups])if(p.kind==='coin'||p.kind==='xp')collectPickup(p);
    state.mode='result';input.fire=false;
    if(won&&!adminMode){save.unlocked=Math.max(save.unlocked,Math.min(C.MAX_LEVEL,state.level+1));save.best=Math.max(save.best,state.level);persist();}
    $('resultKicker').textContent=won?'MISSION ABGESCHLOSSEN':'MISSION GESCHEITERT';$('resultTitle').innerHTML=won?'SIEG<span class="title-dot">.</span>':'NIEDERLAGE<span class="title-dot">.</span>';
    $('resultText').textContent=won?(state.info.boss&&state.level<C.MAX_LEVEL?'Boss besiegt! Die nächste Karte ist frei.':state.level===C.MAX_LEVEL?'Alle Karten erobert!':'Gut gekämpft. Die nächste Mission wartet.'): 'Sammle XP, rüste dich auf und versuche es erneut.';
    $('resultKills').textContent=state.kills;$('resultCoins').textContent=state.earnedCoins;$('resultXp').textContent=state.earnedXp;
    $('resultPrimary').innerHTML=won&&state.level<C.MAX_LEVEL?'NÄCHSTES LEVEL <span>↗</span>':won?'ERNEUT SPIELEN <span>↻</span>':'NOCHMAL VERSUCHEN <span>↻</span>';
    $('resultPrimary').onclick=()=>startLevel(won&&state.level<C.MAX_LEVEL?state.level+1:state.level);showScreen('resultScreen');renderMenu();
  }
  function updateEnemy(e,dt){
    e.hit=Math.max(0,e.hit-dt);e.attackCd-=dt;e.attackAnim=Math.max(0,e.attackAnim-dt);e.slow=Math.max(0,e.slow-dt);e.phase+=dt;
    const d=dist(e,player)||1,dx=(player.x-e.x)/d,dy=(player.y-e.y)/d;e.angle=Math.atan2(dy,dx);
    const cover=firstCover(e.x,e.y,player.x,player.y,e.r*.5);
    const ranged=enemyDefs[e.type].ranged,ideal=e.type==='boss'?190:190;
    let movement=ranged&&!cover?(d>ideal+35?1:d<ideal-35?-.6:0):1,tx=player.x,ty=player.y;
    if(cover){const gap=e.r+20,corners=[{x:cover.x-gap,y:cover.y-gap},{x:cover.x+cover.w+gap,y:cover.y-gap},{x:cover.x-gap,y:cover.y+cover.h+gap},{x:cover.x+cover.w+gap,y:cover.y+cover.h+gap}];corners.sort((a,b)=>(dist(e,a)+dist(a,player))-(dist(e,b)+dist(b,player)));const wp=corners.find(c=>!firstCover(e.x,e.y,c.x,c.y,e.r*.2))||corners[0];tx=wp.x;ty=wp.y;movement=1;}
    const td=Math.hypot(tx-e.x,ty-e.y)||1,slow=(e.slow>0?.46:1)*(player.buffs.slow>0?.55:1),ox=e.x,oy=e.y;
    moveCircle(e,(tx-e.x)/td*e.speed*movement*slow*dt,(ty-e.y)/td*e.speed*movement*slow*dt);
    e.walk+=Math.hypot(e.x-ox,e.y-oy)*.1;
    if(e.attackCd>0)return;
    const def=enemyDefs[e.type];
    if((!ranged||e.type==='boss')&&d<def.reach+player.r){e.attackAnim=.38;e.attackCd=def.attack;hurt(e.damage);flashEffect('slash',e.x,e.y,e.type==='boss'?'#ffa46e':'#d9efcf',.28,{angle:e.angle,r:def.reach+10});}
    else if(ranged&&d<530&&!cover){enemyShoot(e);e.attackCd=def.attack*(e.type==='boss'&&e.hp/e.maxHp<.5?.7:1);}
  }
  function updateProjectile(p,dt,list){
    const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;let first=1.01,hit=null;
    for(const o of world.obstacles){const t=segmentRectT(p.x,p.y,nx,ny,o,p.r);if(t!==null&&t<first){first=t;hit=o;}}
    if(p.owner==='player')for(const e of enemies){if(p.hitIds.has(e.id))continue;const t=segmentCircleT(p.x,p.y,nx,ny,e.x,e.y,p.r+e.r);if(t!==null&&t<first){first=t;hit=e;}}
    else{const t=segmentCircleT(p.x,p.y,nx,ny,player.x,player.y,p.r+player.r);if(t!==null&&t<first){first=t;hit=player;}}
    p.x+=(nx-p.x)*Math.min(first,1);p.y+=(ny-p.y)*Math.min(first,1);p.life-=dt;
    if(hit){
      if(hit===player){hurt(p.damage);p.life=0;}
      else if(enemies.includes(hit)){damageEnemy(hit,p.damage,p.x,p.y);p.hitIds.add(hit.id);if(p.slow)hit.slow=Math.max(hit.slow,p.slow);if(p.splash)areaDamage(p.x,p.y,p.splash,p.damage*.55);if(p.pierce>0){p.pierce--;p.x+=p.vx/Math.hypot(p.vx,p.vy)*8;p.y+=p.vy/Math.hypot(p.vx,p.vy)*8;}else p.life=0;}
      else if(p.bounce>0){p.bounce--;p.vx*=-1;p.vy*=-1;p.x+=p.vx/Math.hypot(p.vx,p.vy)*8;p.y+=p.vy/Math.hypot(p.vx,p.vy)*8;flashEffect('ring',p.x,p.y,p.color,.18,{r:18});}
      else{if(p.splash)areaDamage(p.x,p.y,p.splash,p.damage*.55);burst(p.x,p.y,p.color,4,55);p.life=0;}
    }
    if(p.life<=0||p.x<0||p.x>world.mapW||p.y<0||p.y>world.mapH){const i=list.indexOf(p);if(i>=0)list.splice(i,1);}
  }
  function updatePerks(dt){
    for(const id of save.perks){
      if(id==='orb'){const a=state.time*3.4,x=player.x+Math.cos(a)*64,y=player.y+Math.sin(a)*64;for(const e of enemies)if(Math.hypot(e.x-x,e.y-y)<e.r+13&&(!e.orbHit||state.time-e.orbHit>.45)){damageEnemy(e,13+save.upgrades.damage*2);e.orbHit=state.time;}continue;}
      player.perkTimers[id]=(player.perkTimers[id]||0)-dt;if(player.perkTimers[id]>0)continue;
      const perk=C.PERKS.find(p=>p.id===id),target=nearestEnemy(player.x,player.y,570,true);player.perkTimers[id]=perk.interval;if(!target)continue;
      const a=Math.atan2(target.y-player.y,target.x-player.x),kind=id==='arrows'?'arrow':id==='bricks'?'brick':'football';
      projectile('player',player.x,player.y,a,kind==='brick'?500:680,kind==='brick'?33:kind==='football'?25:23,kind,id==='arrows'?'#d8c3ff':id==='bricks'?'#ff9b7e':'#f6faff',{r:kind==='arrow'?4:8,pierce:kind==='arrow'?1:0,splash:kind==='brick'?48:0,bounce:kind==='football'?2:0});
    }
  }
  function update(dt){
    if(state.toastTimer>0){state.toastTimer-=dt;if(state.toastTimer<=0)$('toast').classList.add('hidden');}
    if(state.mode!=='playing')return;
    state.time+=dt;updateMusic(dt);state.shake=Math.max(0,state.shake-dt*30);state.flash=Math.max(0,state.flash-dt);
    player.invuln=Math.max(0,player.invuln-dt);player.attackAnim=Math.max(0,player.attackAnim-dt);player.specialAnim=Math.max(0,player.specialAnim-dt);player.specialCooldown=Math.max(0,player.specialCooldown-dt);
    for(const id in player.cooldowns)player.cooldowns[id]=Math.max(0,player.cooldowns[id]-dt);
    for(const id in player.buffs)player.buffs[id]=Math.max(0,player.buffs[id]-dt);
    const keys=save.settings.keys;let mx=input.joyX,my=input.joyY;
    if(input.keys.has(keys.left)||input.keys.has('arrowleft'))mx-=1;if(input.keys.has(keys.right)||input.keys.has('arrowright'))mx+=1;
    if(input.keys.has(keys.up)||input.keys.has('arrowup'))my-=1;if(input.keys.has(keys.down)||input.keys.has('arrowdown'))my+=1;
    const v=C.normalize(mx,my),speed=225+save.upgrades.speed*20,ox=player.x,oy=player.y;
    moveCircle(player,v.x*speed*dt,v.y*speed*dt);const moved=Math.hypot(player.x-ox,player.y-oy);if(moved>.1)player.walk+=moved*.13;else player.walk*=.93;
    cameraToPlayer(dt);state.hpDisplay+=(Math.max(0,player.hp)-state.hpDisplay)*Math.min(1,dt*13);state.hpTrail+=(Math.max(0,player.hp)-state.hpTrail)*Math.min(1,dt*2.5);
    if(input.fire||input.keys.has(keys.fire))playerShoot();
    if(state.spawned<state.toSpawn){state.spawnTimer-=dt;if(state.spawnTimer<=0){spawnEnemy();state.spawned++;state.spawnTimer=state.info.boss&&state.wave===3?2:clamp(.72-state.info.local*.009,.32,.72);}}
    for(const e of [...enemies])updateEnemy(e,dt);
    for(const p of [...bullets])updateProjectile(p,dt,bullets);for(const p of [...enemyBullets])updateProjectile(p,dt,enemyBullets);
    updatePerks(dt);
    for(const p of [...pickups]){p.t+=dt;p.life-=dt;const d=dist(p,player),magnet=95+save.upgrades.magnet*23+(player.buffs.magnet>0?190:0);if(d<magnet){p.x+=(player.x-p.x)*Math.min(1,dt*7);p.y+=(player.y-p.y)*Math.min(1,dt*7);}if(d<player.r+p.r+5)collectPickup(p);else if(p.life<=0)pickups.splice(pickups.indexOf(p),1);}
    for(const p of [...particles]){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.max(0,1-dt*2);p.vy*=Math.max(0,1-dt*2);p.life-=dt;if(p.life<=0)particles.splice(particles.indexOf(p),1);}
    for(const e of [...effects]){e.life-=dt;if(e.life<=0)effects.splice(effects.indexOf(e),1);}
    if(state.spawned>=state.toSpawn&&enemies.length===0){state.waveWait+=dt;if(state.waveWait>1.25){if(state.wave<3)beginWave(state.wave+1);else finish(true);}}else state.waveWait=0;
    state.hudTimer-=dt;if(state.hudTimer<=0){updateHud();state.hudTimer=.08;}
  }
  function line(x1,y1,x2,y2,color,width=3){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  function visible(x,y,pad=60){return x>=world.cameraX-pad&&x<=world.cameraX+world.viewW+pad&&y>=world.cameraY-pad&&y<=world.cameraY+world.viewH+pad;}
  function drawTerrain(){
    const m=state.info.map,left=Math.max(0,world.cameraX-5),top=Math.max(0,world.cameraY-5),right=Math.min(2200,world.cameraX+world.viewW+5),bottom=Math.min(2200,world.cameraY+world.viewH+5);
    ctx.fillStyle=m.ground;ctx.fillRect(left,top,right-left,bottom-top);
    const step=80;
    if(['grave','frost','neon'].includes(m.id)){
      for(let x=Math.floor(left/step)*step;x<right;x+=step)for(let y=Math.floor(top/step)*step;y<bottom;y+=step)if(((x/step+y/step)&1)===0){ctx.fillStyle=m.tile+'49';ctx.fillRect(x,y,step,step);}
      ctx.strokeStyle=m.line;ctx.lineWidth=1;ctx.beginPath();for(let x=Math.floor(left/step)*step;x<right;x+=step){ctx.moveTo(x,top);ctx.lineTo(x,bottom);}for(let y=Math.floor(top/step)*step;y<bottom;y+=step){ctx.moveTo(left,y);ctx.lineTo(right,y);}ctx.stroke();
    }else{
      const patch=150;for(let x=Math.floor(left/patch)*patch;x<right;x+=patch)for(let y=Math.floor(top/patch)*patch;y<bottom;y+=patch){
        const hash=(Math.imul(x+97,73856093)^Math.imul(y+193,19349663))>>>0,px=x+25+hash%85,py=y+20+(hash>>>8)%95;
        const radius=35+(hash>>>16)%45;ctx.fillStyle=m.id==='grass'?'#37624838':m.id==='desert'?'#ddad6830':'#ea63391c';ctx.beginPath();ctx.ellipse(px,py,radius,radius*.48,(hash%100)/100,0,6.29);ctx.fill();
        if(m.id==='desert'){ctx.strokeStyle='#eec18827';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,radius+14,.12,2.65);ctx.stroke();}
        if(m.id==='volcano'){ctx.strokeStyle='#fd7b4f55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px-radius*.6,py);ctx.lineTo(px,py-radius*.2);ctx.lineTo(px+radius*.5,py+radius*.3);ctx.stroke();}
      }
    }
    for(const d of world.decor){if(!visible(d.x,d.y,30))continue;const x=d.x,y=d.y,s=d.size;
      if(m.id==='grass'){line(x-s*.4,y,x+s*.3,y-s*.9,'#75b978',2);line(x,y,x+s*.55,y-s*.65,'#9bd184',2);if(d.kind===0)circle(x+s*.3,y-s*.8,2,'#f6d893');}
      else if(m.id==='desert'){ctx.strokeStyle='#c6a16b88';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,s*.9,.1,2.5);ctx.stroke();if(d.kind===0){line(x,y,x,y-s,'#6e976f',3);line(x,y-s*.4,x+s*.4,y-s*.65,'#6e976f',2);}}
      else if(m.id==='grave'){circle(x,y,s*.3,'#777c8a55');if(d.kind===0){ctx.fillStyle='#777989';ctx.fillRect(x-s*.25,y-s*.6,s*.5,s*.8);line(x,y-s*.3,x,y-s*.1,'#b6b6ba',1);}}
      else if(m.id==='volcano'){circle(x,y,s*.7,'#6a3632');circle(x,y,s*.27,'#f46b39');line(x-s,y+s*.5,x+s*.5,y-s*.4,'#ec824a66',1);}
      else if(m.id==='frost'){line(x-s*.5,y,x+s*.5,y,'#b0e8eb8c',1);line(x,y-s*.5,x,y+s*.5,'#b0e8eb8c',1);circle(x,y,1.5,'#e2ffff');}
      else{ctx.strokeStyle='#97a5e977';ctx.lineWidth=2;ctx.strokeRect(x-s*.4,y-s*.4,s*.8,s*.8);circle(x,y,2,'#a1c8ff');}
    }
    ctx.strokeStyle=m.edge;ctx.lineWidth=7;ctx.strokeRect(8,8,2184,2184);
  }
  function drawObstacles(){const m=state.info.map;for(const o of world.obstacles){if(o.x>world.cameraX+world.viewW+110||o.x+o.w<world.cameraX-110||o.y>world.cameraY+world.viewH+110||o.y+o.h<world.cameraY-110)continue;
    ctx.save();ctx.shadowColor='#050a12a8';ctx.shadowBlur=15;ctx.shadowOffsetY=8;ctx.fillStyle=m.cover;ctx.fillRect(o.x,o.y,o.w,o.h);ctx.restore();
    ctx.fillStyle=m.tile;ctx.fillRect(o.x+4,o.y+4,o.w-8,o.h-8);ctx.strokeStyle=m.edge;ctx.lineWidth=2;ctx.strokeRect(o.x+1,o.y+1,o.w-2,o.h-2);
    if(m.id==='grave'&&o.kind==='crate'){ctx.fillStyle='#77788a';ctx.fillRect(o.x+o.w*.3,o.y+8,o.w*.4,o.h-16);line(o.x+o.w*.5,o.y+17,o.x+o.w*.5,o.y+35,'#c6c2c5',2);}
    else if(m.id==='volcano'){line(o.x+7,o.y+7,o.x+o.w*.55,o.y+o.h*.6,'#ff804e88',2);line(o.x+o.w*.55,o.y+o.h*.6,o.x+o.w-8,o.y+o.h-8,'#ff804e88',2);}
    else if(m.id==='frost'){line(o.x+7,o.y+o.h-7,o.x+o.w-7,o.y+7,'#d8ffff99',2);}
    else if(m.id==='neon'){ctx.strokeStyle='#a9b4ff99';ctx.strokeRect(o.x+8,o.y+8,o.w-16,o.h-16);}
    else if(o.kind==='crate'){line(o.x+10,o.y+10,o.x+o.w-10,o.y+o.h-10,m.edge,2);line(o.x+o.w-10,o.y+10,o.x+10,o.y+o.h-10,m.edge,2);}
    else for(let x=o.x+16;x<o.x+o.w-8;x+=24)line(x,o.y+7,x+9,o.y+Math.min(o.h-7,18),m.edge,1);
  }}
  function drawProjectile(p){if(!visible(p.x,p.y,25))return;ctx.save();ctx.shadowColor=p.color;ctx.shadowBlur=14;
    if(p.kind==='arrow'||p.kind==='bow'){const a=Math.atan2(p.vy,p.vx);ctx.translate(p.x,p.y);ctx.rotate(a);line(-14,0,12,0,p.color,3);line(12,0,4,-5,p.color,2);line(12,0,4,5,p.color,2);}
    else if(p.kind==='brick'){ctx.translate(p.x,p.y);ctx.rotate(state.time*6);ctx.fillStyle=p.color;ctx.fillRect(-8,-6,16,12);ctx.strokeStyle='#fff8';ctx.strokeRect(-8,-6,16,12);}
    else if(p.kind==='football'){circle(p.x,p.y,p.r,'#f7fafb');ctx.shadowBlur=0;ctx.strokeStyle='#1a2635';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,p.r*.45,0,6.29);ctx.stroke();}
    else if(p.kind==='web'){circle(p.x,p.y,p.r,'#d6fcff');ctx.shadowBlur=0;line(p.x-8,p.y,p.x+8,p.y,'#4da7db',1);line(p.x,p.y-8,p.x,p.y+8,'#4da7db',1);}
    else if(p.kind==='bat'){ctx.translate(p.x,p.y);ctx.rotate(state.time*12);line(-10,0,0,-7,p.color,3);line(0,-7,10,0,p.color,3);line(-10,0,0,5,p.color,3);line(0,5,10,0,p.color,3);}
    else circle(p.x,p.y,p.r,p.color);
    ctx.restore();
  }
  function drawPickup(p){if(!visible(p.x,p.y,30))return;const y=p.y+Math.sin(p.t*5)*4,pulse=1+Math.sin(p.t*7)*.08;ctx.save();ctx.translate(p.x,y);ctx.scale(pulse,pulse);
    if(p.kind==='power'){const def=C.POWERUPS.find(x=>x.id===p.power);ctx.rotate(p.t*.8);ctx.strokeStyle=def.color;ctx.lineWidth=2;ctx.shadowColor=def.color;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(0,0,p.r+4+Math.sin(p.t*6)*3,0,6.29);ctx.stroke();circle(0,0,p.r,def.color);ctx.rotate(-p.t*.8);ctx.fillStyle='#10202c';ctx.font='bold 19px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(def.icon,0,1);}
    else{const color=p.kind==='coin'?'#ffd078':'#9bdcff';ctx.shadowColor=color;ctx.shadowBlur=15;circle(0,0,p.r,color);ctx.fillStyle='#193147';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.kind==='coin'?'◆':'✦',0,1);}
    ctx.restore();
  }
  function drawMonster(e){if(!visible(e.x,e.y,e.r+40))return;const def=enemyDefs[e.type],color=e.hit>0?'#ffffff':def.color,s=e.r/17,step=Math.sin(e.walk)*6,attack=e.attackAnim>0?Math.sin((.4-e.attackAnim)*13)*12:0;
    ctx.save();ctx.translate(e.x,e.y);circle(1,22*s,15*s,'#06151b77');ctx.lineCap='round';ctx.shadowColor=color;ctx.shadowBlur=e.type==='boss'?20:8;
    if(e.type==='wraith'){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-12*s,-10*s);ctx.quadraticCurveTo(0,-35*s,12*s,-10*s);ctx.lineTo(15*s,17*s);ctx.quadraticCurveTo(7*s,12*s,0,24*s);ctx.quadraticCurveTo(-9*s,14*s,-15*s,19*s);ctx.closePath();ctx.fill();circle(-4*s,-17*s,2*s,'#24293d');circle(5*s,-17*s,2*s,'#24293d');}
    else if(e.type==='golem'){ctx.fillStyle=color;ctx.fillRect(-13*s,-9*s,26*s,27*s);ctx.fillRect(-10*s,-28*s,20*s,16*s);line(-11*s,18*s,-13*s,29*s,color,8*s);line(11*s,18*s,13*s,29*s,color,8*s);line(-13*s,-4*s,-22*s,13*s,color,9*s);line(13*s,-4*s,22*s+attack,13*s,color,9*s);circle(-4*s,-21*s,2*s,'#ffb776');circle(5*s,-21*s,2*s,'#ffb776');}
    else{
      if(e.type==='demon'||e.type==='boss'){ctx.fillStyle=e.type==='boss'?state.info.map.accent:color;ctx.beginPath();ctx.moveTo(-10*s,-24*s);ctx.lineTo(-13*s,-39*s);ctx.lineTo(-3*s,-29*s);ctx.lineTo(3*s,-29*s);ctx.lineTo(13*s,-39*s);ctx.lineTo(10*s,-24*s);ctx.fill();}
      line(-5*s,10*s,(-8+step)*s,26*s,color,5*s);line(5*s,10*s,(8-step)*s,26*s,color,5*s);
      line(0,-10*s,0,11*s,color,e.type==='boss'?10*s:6*s);
      line(-2*s,-3*s,-15*s,7*s,color,5*s);line(2*s,-3*s,(14+attack)*s,7*s,color,5*s);
      if(e.type==='zombie'){circle(0,-21*s,10*s,color);circle(-4*s,-22*s,2*s,'#213b2c');circle(4*s,-22*s,2*s,'#213b2c');line((14+attack)*s,7*s,(23+attack)*s,9*s,'#d3d6b2',3*s);}
      else if(e.type==='skeleton'){circle(0,-21*s,10*s,'#f5f1dd');circle(-4*s,-22*s,2*s,'#28313c');circle(4*s,-22*s,2*s,'#28313c');for(let i=-1;i<=1;i++)line(-7*s,(-5+i*5)*s,7*s,(-5+i*5)*s,'#fff4',2*s);ctx.strokeStyle='#d7a77f';ctx.lineWidth=2*s;ctx.beginPath();ctx.arc(20*s,2*s,12*s,-1.2,1.2);ctx.stroke();line(24*s,-9*s,24*s,12*s,'#e9e4d0',1);}
      else if(e.type==='ghoul'){circle(0,-21*s,10*s,color);circle(-4*s,-23*s,2*s,'#ffecbd');circle(5*s,-23*s,2*s,'#ffecbd');for(let i=0;i<3;i++)line((18+attack)*s,(4+i*3)*s,(26+attack)*s,(i-1)*5*s,'#f2ccdf',1.5*s);}
      else if(e.type==='demon'){circle(0,-21*s,10*s,color);circle(-4*s,-22*s,2*s,'#ffe176');circle(4*s,-22*s,2*s,'#ffe176');}
      else{circle(0,-21*s,12*s,state.info.map.accent);circle(-5*s,-22*s,2*s,'#331c2d');circle(5*s,-22*s,2*s,'#331c2d');}
    }
    ctx.restore();
    if(e.hp<e.maxHp&&e.type!=='boss'){ctx.fillStyle='#1b1f2a';ctx.fillRect(e.x-20,e.y-e.r-30,40,4);ctx.fillStyle=color;ctx.fillRect(e.x-20,e.y-e.r-30,40*clamp(e.hp/e.maxHp,0,1),4);}
  }
  function drawPlayer(){if(!player||(!player.buffs.invincible&&player.invuln>0&&Math.floor(state.time*18)%2))return;
    const skin=C.SKINS.find(s=>s.id===save.skin)||C.SKINS[0],s=skin.id,b=skin.body,a=skin.accent,step=Math.sin(player.walk)*8,attack=player.attackAnim>0?Math.sin((.22-player.attackAnim)*15)*5:0;
    ctx.save();ctx.translate(player.x,player.y);circle(0,22,18,'#07161d88');ctx.lineCap='round';ctx.shadowColor=a;ctx.shadowBlur=12;
    if(s==='bat'||s==='thor'){ctx.fillStyle=s==='bat'?'#1a2030':'#b54c51';ctx.beginPath();ctx.moveTo(-8,-10);ctx.lineTo(-21,25);ctx.lineTo(0,18);ctx.lineTo(21,25);ctx.lineTo(8,-10);ctx.fill();}
    if(s==='hulk'){line(-5,8,-10+step,27,b,9);line(5,8,10-step,27,b,9);line(0,-10,0,10,b,11);}
    else{line(-5,8,-8+step,26,s==='spider'?'#4b88ed':b,5);line(5,8,8-step,26,s==='spider'?'#4b88ed':b,5);line(0,-10,0,10,b,6);}
    ctx.save();ctx.rotate(player.angle);line(-2,-3,-14,6,b,5);line(2,-3,15+attack,5,b,5);
    if(s==='wolverine'){for(let i=-1;i<=1;i++)line(17+attack,5+i*3,34+attack,5+i*3,'#f5f5e8',2);}
    else if(s==='thor'){line(18+attack,4,29+attack,4,'#a3abb5',4);ctx.fillStyle='#d6d9e0';ctx.fillRect(29+attack,-3,14,12);}
    else if(s==='hulk'){circle(19+attack,5,7,b);}
    else if(s==='bat'){line(17+attack,5,29+attack,5,'#f5d567',3);}
    else if(s==='iron'){circle(19+attack,5,6,'#f9e59d');}
    else{line(16+attack,5,29+attack,5,a,5);line(28+attack,5,35+attack,5,'#f2ffff',2);}
    ctx.restore();
    circle(0,-21,s==='hulk'?11:10,b);
    if(s==='spider'){line(-6,-23,-1,-21,'#fff',2);line(1,-21,6,-23,'#fff',2);}
    else if(s==='bat'){ctx.fillStyle=b;ctx.beginPath();ctx.moveTo(-9,-28);ctx.lineTo(-10,-39);ctx.lineTo(-3,-30);ctx.lineTo(3,-30);ctx.lineTo(10,-39);ctx.lineTo(9,-28);ctx.fill();line(-5,-22,-1,-22,'#fff',2);line(2,-22,6,-22,'#fff',2);}
    else if(s==='wolverine'){ctx.fillStyle=a;ctx.beginPath();ctx.moveTo(-9,-26);ctx.lineTo(-16,-34);ctx.lineTo(-3,-29);ctx.lineTo(3,-29);ctx.lineTo(16,-34);ctx.lineTo(9,-26);ctx.fill();}
    else if(s==='iron'){ctx.fillStyle=a;ctx.fillRect(-7,-25,14,7);circle(0,0,3,'#baffff');}
    else if(s==='thor'){line(-8,-26,8,-26,'#d9d9df',3);}
    else if(s==='ninja'){line(-10,-25,9,-25,a,3);line(8,-25,18,-28,a,2);}
    else{circle(-4,-22,2,a);circle(4,-22,2,a);}
    if(player.buffs.invincible>0||player.buffs.double>0){ctx.strokeStyle=player.buffs.invincible>0?'#86fff0':'#ff9f81';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,31+Math.sin(state.time*8)*2,0,6.29);ctx.stroke();}
    ctx.restore();
  }
  function drawEffects(){for(const e of effects){const f=clamp(e.life/e.max,0,1);ctx.save();ctx.globalAlpha=f;ctx.shadowColor=e.color;ctx.shadowBlur=14;
    if(e.kind==='ring'){ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,(e.r||60)*(1-f*.7),0,6.29);ctx.stroke();}
    else if(e.kind==='beam'){line(e.x,e.y,e.x2,e.y2,e.color,5*f+2);line(e.x,e.y,e.x2,e.y2,'#fff',2*f+1);}
    else if(e.kind==='slash'){ctx.strokeStyle=e.color;ctx.lineWidth=7*f+2;ctx.beginPath();ctx.arc(e.x,e.y,e.r||80,e.angle-1,e.angle+1);ctx.stroke();}
    ctx.restore();}}
  function draw(){
    const w=world.viewW,h=world.viewH;ctx.clearRect(0,0,w,h);ctx.fillStyle='#081725';ctx.fillRect(0,0,w,h);
    if(player&&state.mode!=='menu'){
      ctx.save();ctx.translate((state.shake?rand(-state.shake,state.shake):0)-world.cameraX,(state.shake?rand(-state.shake,state.shake):0)-world.cameraY);
      drawTerrain();drawObstacles();for(const p of pickups)drawPickup(p);for(const p of bullets)drawProjectile(p);for(const p of enemyBullets)drawProjectile(p);
      for(const e of enemies)drawMonster(e);
      if(save.perks.includes('orb')){const a=state.time*3.4,x=player.x+Math.cos(a)*64,y=player.y+Math.sin(a)*64;ctx.save();ctx.shadowColor='#8deaff';ctx.shadowBlur=18;circle(x,y,12,'#baf6ff');ctx.restore();}
      drawPlayer();drawEffects();for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);circle(p.x,p.y,p.r,p.color);}ctx.globalAlpha=1;ctx.restore();
    }
    if(state.flash>0){ctx.fillStyle=`rgba(255,78,73,${state.flash*.5})`;ctx.fillRect(0,0,w,h);}
  }
  function frame(t){const elapsed=Math.min((t-(state.last||t))/1000,.12);state.last=t;state.accumulator+=elapsed;let steps=0;while(state.accumulator>=1/60&&steps<8){update(1/60);state.accumulator-=1/60;steps++;}if(steps===8)state.accumulator=0;draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
  function renderLevels(){
    $('mapGrid').innerHTML='';
    C.MAPS.forEach((map,i)=>{const first=i*C.LEVELS_PER_MAP+1,unlocked=save.unlocked>=first,b=document.createElement('button');b.className=`map-card ${state.selectedMap===i?'selected':''}`;b.disabled=!unlocked;b.style.setProperty('--map-accent',map.accent);b.innerHTML=`<strong>${String(i+1).padStart(2,'0')} · ${map.name}</strong><small>${map.subtitle}</small><span>${unlocked?'30 LEVELS · BOSS AM ENDE':'GESPERRT'}</span>`;b.onclick=()=>{state.selectedMap=i;renderLevels();};$('mapGrid').append(b);});
    const map=C.MAPS[state.selectedMap];$('mapTitle').textContent=`${map.name} · 30 LEVELS`;$('mapTitle').style.color=map.accent;$('levelGrid').innerHTML='';
    for(let local=1;local<=C.LEVELS_PER_MAP;local++){
      const n=state.selectedMap*C.LEVELS_PER_MAP+local,b=document.createElement('button');b.className=`level-card ${local===30?'boss':''} ${n===save.unlocked?'current':''}`;b.disabled=n>save.unlocked;
      b.innerHTML=`<span class="number">${String(local).padStart(2,'0')}</span><span class="status">${n>save.unlocked?'GESPERRT':local===30?'BOSS':n<save.unlocked?'GESCHAFFT':'BEREIT'}</span>`;
      b.onclick=()=>startLevel(n);$('levelGrid').append(b);
    }
  }
  function openLevels(){state.selectedMap=C.levelInfo(Math.min(save.unlocked,C.MAX_LEVEL)).mapIndex;renderLevels();state.mode='menu';state.panelReturn='menu';showScreen('levelsScreen');}
  function createShopCard(icon,name,desc,level,buyText,disabled,onClick,accent){const card=document.createElement('article');card.className='shop-card';card.innerHTML=`<div class="shop-icon" style="${accent?`color:${accent};border-color:${accent}55`:''}">${icon}</div><div><div class="shop-title">${name}</div><p class="shop-desc">${desc}</p><div class="shop-level">${level}</div></div><button class="shop-buy" ${disabled?'disabled':''}>${buyText}</button>`;card.querySelector('button').onclick=onClick;return card;}
  function renderShop(){
    $('shopCoins').textContent=adminMode?'∞':save.coins;$('shopXp').textContent=adminMode?'XP ∞':`XP ${save.xpLevel} · ${save.xp}/${C.xpRequired(save.xpLevel)}`;$('shopPoints').textContent=adminMode?'∞ UPGRADE-PUNKTE':`${save.skillPoints} UPGRADE-PUNKTE`;
    document.querySelectorAll('#shopTabs button').forEach(b=>b.classList.toggle('selected',b.dataset.tab===state.shopTab));
    const grid=$('shopGrid');grid.innerHTML='';
    if(state.shopTab==='upgrades')for(const u of C.UPGRADES){const level=save.upgrades[u.id],price=C.upgradeCost(u,level),points=C.pointCost(level),maxed=level>=u.max,afford=adminMode||save.coins>=price&&save.skillPoints>=points;
      grid.append(createShopCard(u.icon,u.name,u.desc,`STUFE ${level} / ${u.max}`,maxed?'MAXIMUM':`◆ ${price} + ✦ ${points}`,maxed||!afford,()=>{if(maxed||!afford)return;save.coins-=price;save.skillPoints-=points;save.upgrades[u.id]++;persist();renderShop();renderMenu();}));}
    else if(state.shopTab==='weapons')for(const w of C.WEAPONS){const owned=save.ownedWeapons.includes(w.id),equipped=save.weapons.includes(w.id),text=!owned?`KAUFEN · ◆ ${w.cost}`:equipped?'ABLEGEN':'AUSRÜSTEN';
      grid.append(createShopCard(w.icon,w.name,w.desc,`${equipped?'AUSGERÜSTET · ':''}MAX. 3 WAFFEN`,text,!owned&&!adminMode&&save.coins<w.cost,()=>{if(!owned){if(save.coins<w.cost)return;save.coins-=w.cost;save.ownedWeapons.push(w.id);}else if(equipped){if(save.weapons.length===1){toast('MINDESTENS EINE WAFFE');return;}save.weapons=save.weapons.filter(id=>id!==w.id);}else{if(save.weapons.length>=3){toast('MAXIMAL 3 WAFFEN');return;}save.weapons.push(w.id);}persist();renderShop();renderMenu();},w.color));}
    else if(state.shopTab==='perks')for(const p of C.PERKS){const owned=save.ownedPerks.includes(p.id),equipped=save.perks.includes(p.id),text=!owned?`KAUFEN · ◆ ${p.cost}`:equipped?'ABLEGEN':'AUSRÜSTEN';
      grid.append(createShopCard(p.icon,p.name,p.desc,`${equipped?'AKTIV · ':''}MAX. 2 PERKS`,text,!owned&&!adminMode&&save.coins<p.cost,()=>{if(!owned){if(save.coins<p.cost)return;save.coins-=p.cost;save.ownedPerks.push(p.id);}else if(equipped)save.perks=save.perks.filter(id=>id!==p.id);else{if(save.perks.length>=2){toast('MAXIMAL 2 PERKS');return;}save.perks.push(p.id);}persist();renderShop();renderMenu();}));}
    else for(const skin of C.SKINS){const owned=save.ownedSkins.includes(skin.id),equipped=save.skin===skin.id,text=!owned?`KAUFEN · ◆ ${skin.cost}`:equipped?'AUSGERÜSTET':'AUSRÜSTEN';
      grid.append(createShopCard('✦',skin.name,`Eigene Attacke: ${skin.attack}. Individuelle Farben und Animationen.`,equipped?'AKTIV':'HELDEN-SKIN',text,equipped||!owned&&!adminMode&&save.coins<skin.cost,()=>{if(!owned){if(save.coins<skin.cost)return;save.coins-=skin.cost;save.ownedSkins.push(skin.id);}save.skin=skin.id;persist();renderShop();renderMenu();},skin.accent));}
  }
  function openShop(fromPause=false){if(fromPause){state.mode='paused';state.panelReturn='pauseScreen';}else{state.mode='menu';state.panelReturn='menu';}renderShop();showScreen('shopScreen');}
  function keyLabel(key){return key===' '?'LEERTASTE':key.startsWith('arrow')?key.replace('arrow','PFEIL ').toUpperCase():key.toUpperCase();}
  function applySettings(){const s=save.settings;const app=$('app');app.style.setProperty('--joy-left',`${s.joyX}%`);app.style.setProperty('--joy-bottom',`${s.joyY}%`);app.style.setProperty('--fire-right',`${s.fireX}%`);app.style.setProperty('--fire-bottom',`${s.fireY}%`);}
  const sliderDefs=[['master','GESAMTLAUTSTÄRKE','%'],['music','MUSIK','%'],['sfx','SFX','%'],['joyX','JOYSTICK: ABSTAND LINKS','%'],['joyY','JOYSTICK: ABSTAND UNTEN','%'],['fireX','FEUER: ABSTAND RECHTS','%'],['fireY','FEUER: ABSTAND UNTEN','%']];
  const keyDefs=[['up','NACH OBEN'],['down','NACH UNTEN'],['left','NACH LINKS'],['right','NACH RECHTS'],['fire','SCHIESSEN'],['pause','PAUSE']];
  let armedBinding=null;
  function renderSettings(){const grid=$('settingsGrid');grid.innerHTML='';
    const audioCard=document.createElement('div');audioCard.className='settings-card';audioCard.innerHTML='<h3>TON & MUSIK</h3>';
    const touchCard=document.createElement('div');touchCard.className='settings-card';touchCard.innerHTML='<h3>HANDY-STEUERUNG</h3><p>Verschiebe die Buttons über ihre Abstände zum Rand.</p>';
    for(const [id,label,unit] of sliderDefs){const box=document.createElement('label');box.className='setting-slider';box.innerHTML=`<span>${label}<strong>${save.settings[id]}${unit}</strong></span><input type="range" min="${id==='master'||id==='music'||id==='sfx'?0:1}" max="${id==='master'||id==='music'||id==='sfx'?100:36}" value="${save.settings[id]}">`;box.querySelector('input').oninput=e=>{const v=Number(e.target.value);save.settings[id]=v;regular.settings[id]=v;admin.settings=regular.settings;box.querySelector('strong').textContent=v+unit;applySettings();persist();};(id==='master'||id==='music'||id==='sfx'?audioCard:touchCard).append(box);}
    const keyCard=document.createElement('div');keyCard.className='settings-card';keyCard.innerHTML='<h3>COMPUTER-TASTEN</h3><p>Tippe eine Taste an und drücke die neue Taste.</p>';
    for(const [id,label] of keyDefs){const row=document.createElement('div');row.className='key-row';row.innerHTML=`<span>${label}</span><button type="button" data-bind="${id}">${keyLabel(save.settings.keys[id])}</button>`;row.querySelector('button').onclick=()=>{armedBinding=id;row.querySelector('button').textContent='TASTE DRÜCKEN';};keyCard.append(row);}
    grid.append(audioCard,touchCard,keyCard);$('profileBtn').innerHTML=adminMode?'SPIELER-PROFIL AKTIVIEREN <span>◆</span>':'ADMIN-PROFIL AKTIVIEREN <span>∞</span>';
  }
  function openSettings(){state.mode='menu';renderSettings();showScreen('settingsScreen');}
  const tutorialSteps=[
    {icon:'✛',title:'WILLKOMMEN.',body:'Du kämpfst dich durch sechs Karten mit je 30 Levels. Am Ende jeder Karte wartet ein Boss.'},
    {icon:'➤',title:'BEWEGEN.',body:'Auf dem Handy benutzt du den linken Joystick. Am Computer gelten die eingestellten Tasten oder die Pfeiltasten. X und Y sind gleich schnell.'},
    {icon:'◎',title:'SCHIESSEN.',body:'Halte rechts FEUER gedrückt. Jede Waffe hat eine kurze Schusspause. Zielen kannst du am Computer mit der Maus; auf dem Handy wird das nächste sichtbare Monster anvisiert.'},
    {icon:'◆',title:'SAMMELN.',body:'Besiegte Monster lassen Münzen und XP fallen. Leuchtende Powerups geben zum Beispiel vier Sekunden Dauerfeuer oder Unsterblichkeit.'},
    {icon:'✦',title:'AUFRÜSTEN.',body:'Mit XP steigst du Stufen auf und erhältst Upgrade-Punkte. Im Shop kaufst du Waffen, automatische Perks und Helden-Skins mit eigenen Attacken.'},
    {icon:'⚙',title:'ANPASSEN.',body:'In den Einstellungen regelst du Musik und SFX, änderst PC-Tasten und verschiebst die Handy-Buttons. Jetzt bist du bereit!'}
  ];
  function showTutorialStep(){const s=tutorialSteps[state.tutorialStep];$('tutorialCount').textContent=`${state.tutorialStep+1} / ${tutorialSteps.length}`;$('tutorialIcon').textContent=s.icon;$('tutorialTitle').textContent=s.title;$('tutorialBody').textContent=s.body;$('tutorialNext').innerHTML=state.tutorialStep===tutorialSteps.length-1?'SPIELEN <span>↗</span>':'WEITER <span>↗</span>';$('tutorialProgress').innerHTML=tutorialSteps.map((_,i)=>`<i class="${i<=state.tutorialStep?'active':''}"></i>`).join('');}
  function startTutorial(startsGame=false){state.tutorialStartsGame=startsGame;state.tutorialStep=0;state.mode='tutorial';showTutorialStep();showScreen('tutorialScreen');}
  function endTutorial(){save.tutorialDone=true;if(!adminMode)persist();if(state.tutorialStartsGame){state.mode='playing';state.last=performance.now();state.accumulator=0;showScreen(null);}else openMenu();}
  function openMenu(){state.mode='menu';input.fire=false;renderMenu();showScreen('menu');}
  function pause(){if(state.mode!=='playing')return;state.mode='paused';input.fire=false;showScreen('pauseScreen');}
  function resume(){if(state.mode!=='paused')return;state.mode='playing';state.last=performance.now();state.accumulator=0;showScreen(null);}
  function backFromPanel(){armedBinding=null;if(state.panelReturn==='pauseScreen'){state.mode='paused';showScreen('pauseScreen');}else openMenu();}
  $('playBtn').onclick=()=>startLevel(Math.min(save.unlocked,C.MAX_LEVEL));$('levelsBtn').onclick=openLevels;$('shopBtn').onclick=()=>openShop(false);$('settingsBtn').onclick=openSettings;$('tutorialBtn').onclick=()=>startTutorial(false);
  document.querySelectorAll('[data-back="menu"]').forEach(b=>b.onclick=backFromPanel);
  document.querySelectorAll('#shopTabs button').forEach(b=>b.onclick=()=>{state.shopTab=b.dataset.tab;renderShop();});
  $('profileBtn').onclick=changeProfile;$('tutorialAgainBtn').onclick=()=>startTutorial(false);$('tutorialNext').onclick=()=>{if(state.tutorialStep<tutorialSteps.length-1){state.tutorialStep++;showTutorialStep();}else endTutorial();};$('tutorialSkip').onclick=endTutorial;
  $('pauseBtn').onclick=pause;$('resumeBtn').onclick=resume;$('restartBtn').onclick=()=>startLevel(state.level);$('shopFromPause').onclick=()=>openShop(true);$('menuFromPause').onclick=openMenu;
  $('resultShop').onclick=()=>openShop(false);$('resultMenu').onclick=openMenu;
  function keyOf(e){return e.key.toLowerCase();}
  addEventListener('keydown',e=>{const k=keyOf(e);if(armedBinding){e.preventDefault();if(Object.entries(save.settings.keys).some(([action,key])=>action!==armedBinding&&key===k)){toast('TASTE BEREITS VERGEBEN');return;}save.settings.keys[armedBinding]=k;regular.settings.keys[armedBinding]=k;armedBinding=null;persist();renderSettings();return;}
    if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)||Object.values(save.settings.keys).includes(k))e.preventDefault();
    if(k===save.settings.keys.pause||k==='escape'){if(state.mode==='playing')pause();else if(state.mode==='paused')resume();}
    input.keys.add(k);
  });
  addEventListener('keyup',e=>input.keys.delete(keyOf(e)));
  addEventListener('blur',()=>{input.keys.clear();input.fire=false;if(state.mode==='playing')pause();});
  canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){const r=canvas.getBoundingClientRect();input.mouseX=e.clientX-r.left;input.mouseY=e.clientY-r.top;input.mouseAim=true;}});
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&state.mode==='playing'){const r=canvas.getBoundingClientRect();input.fire=true;input.mouseX=e.clientX-r.left;input.mouseY=e.clientY-r.top;input.mouseAim=true;activateAudio();}});
  addEventListener('pointerup',e=>{if(e.pointerType==='mouse')input.fire=false;});
  const stick=$('joystick'),knob=$('joystickKnob');let joyPointer=null;
  function moveJoy(e){const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,limit=r.width*.33,len=Math.hypot(dx,dy)||1,m=Math.min(limit,len);input.joyX=dx/len*m/limit;input.joyY=dy/len*m/limit;knob.style.transform=`translate(${dx/len*m}px,${dy/len*m}px)`;}
  stick.addEventListener('pointerdown',e=>{e.preventDefault();input.mouseAim=false;if(joyPointer!==null)return;joyPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveJoy(e);activateAudio();});
  stick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)moveJoy(e);});
  function endJoy(e){if(e.pointerId!==joyPointer)return;joyPointer=null;input.joyX=0;input.joyY=0;knob.style.transform='translate(0,0)';}
  stick.addEventListener('pointerup',endJoy);stick.addEventListener('pointercancel',endJoy);
  const fire=$('fireBtn'),firePointers=new Set();
  fire.addEventListener('pointerdown',e=>{e.preventDefault();input.mouseAim=false;firePointers.add(e.pointerId);fire.setPointerCapture(e.pointerId);input.fire=true;fire.classList.add('active');activateAudio();});
  function endFire(e){firePointers.delete(e.pointerId);input.fire=firePointers.size>0;fire.classList.toggle('active',input.fire);}
  fire.addEventListener('pointerup',endFire);fire.addEventListener('pointercancel',endFire);
  for(const control of [fire,stick]){for(const name of ['touchstart','touchmove','touchend'])control.addEventListener(name,e=>e.preventDefault(),{passive:false});control.addEventListener('dblclick',e=>e.preventDefault());control.addEventListener('contextmenu',e=>e.preventDefault());}
  $('app').addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});$('app').addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.mode==='playing')pause();});
  if(location.hostname==='localhost'||location.hostname==='127.0.0.1')window.__SIEGE_QA__={snapshot:()=>({mode:state.mode,level:state.level,map:state.info.map.id,player:player?{x:player.x,y:player.y,hp:player.hp,cooldowns:{...player.cooldowns},buffs:{...player.buffs}}:null,enemies:enemies.map(e=>({type:e.type,hp:e.hp,x:e.x,y:e.y})),pickups:pickups.map(p=>({kind:p.kind,power:p.power})),coins:save.coins,xp:save.xp,xpLevel:save.xpLevel}),startLevel,spawnEnemy,finish,collectPickup:kind=>{if(!player)return;const p={kind,power:kind==='power'?'rapid':undefined,x:player.x,y:player.y,r:9,value:100,life:10,t:0};pickups.push(p);collectPickup(p);},setPlayer:(x,y)=>{if(player){player.x=x;player.y=y;cameraToPlayer(1);}},step:update};
  applySettings();renderMenu();showScreen('menu');
})();
