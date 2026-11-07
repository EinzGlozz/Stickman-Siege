(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  const screens = ['menu', 'levelsScreen', 'shopScreen', 'pauseScreen', 'resultScreen'];
  const upgrades = [
    {id:'damage',icon:'✷',name:'MEHR SCHADEN',desc:'Jeder Treffer verursacht mehr Schaden.',base:70,max:8},
    {id:'rate',icon:'⌁',name:'SCHNELLER SCHIESSEN',desc:'Kürzere Pause zwischen den Schüssen.',base:85,max:7},
    {id:'health',icon:'♥',name:'MEHR LEBEN',desc:'Starte mit mehr Lebenspunkten.',base:75,max:8},
    {id:'speed',icon:'➤',name:'MEHR TEMPO',desc:'Bewege dich schneller durch die Arena.',base:65,max:6},
    {id:'armor',icon:'◇',name:'PANZERUNG',desc:'Verringert Schaden durch Gegner.',base:100,max:6},
    {id:'multi',icon:'✹',name:'MEHR PROJEKTILE',desc:'Zwei Schüsse ab Stufe 1, drei ab Stufe 3.',base:140,max:3}
  ];
  const defaultSave = () => ({coins:0,unlocked:1,best:0,upgrades:Object.fromEntries(upgrades.map(u=>[u.id,0]))});
  let save;
  try { save = {...defaultSave(),...JSON.parse(localStorage.getItem('stickman-siege-v1') || '{}')}; } catch { save = defaultSave(); }
  save.upgrades = {...defaultSave().upgrades,...save.upgrades};
  const persist = () => { try { localStorage.setItem('stickman-siege-v1',JSON.stringify(save)); } catch {} };
  const state = {mode:'menu',level:1,wave:1,spawned:0,toSpawn:0,spawnTimer:0,waveWait:0,kills:0,earned:0,time:0,last:0,shake:0,flash:0,toastTimer:0,hpDisplay:100,hpTrail:100};
  const world = {w:0,h:0,dpr:1,mapW:1800,mapH:1400,cameraX:0,cameraY:0,obstacles:[]};
  let player = null;
  let enemies = [], bullets = [], enemyBullets = [], particles = [], pickups = [];
  const input = {keys:new Set(),joyX:0,joyY:0,fire:false,mouseX:0,mouseY:0,mouseAim:false};
  const rand = (a,b) => a + Math.random() * (b-a);
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const levelBoss = n => n % 4 === 0;
  const maxLevel = 12;

  const rectsOverlap = (a,b,pad=0) => a.x < b.x+b.w+pad && a.x+a.w+pad > b.x && a.y < b.y+b.h+pad && a.y+a.h+pad > b.y;
  function circleHitsRect(x,y,r,o){
    const px=clamp(x,o.x,o.x+o.w),py=clamp(y,o.y,o.y+o.h);
    return (x-px)**2+(y-py)**2<r*r;
  }
  function blocked(x,y,r){return world.obstacles.some(o=>circleHitsRect(x,y,r,o));}
  function generateArena(){
    world.mapW=Math.max(1700,Math.round(world.w*2.15));
    world.mapH=Math.max(1350,Math.round(world.h*2.15));
    world.obstacles=[];
    const occupied=[];
    const cx=world.mapW/2,cy=world.mapH/2;
    function place(w,h,make){
      for(let attempt=0;attempt<80;attempt++){
        const x=rand(90,world.mapW-w-90),y=rand(95,world.mapH-h-90);
        const bounds={x,y,w,h};
        if(Math.hypot(x+w/2-cx,y+h/2-cy)<250+Math.max(w,h)*.4)continue;
        if(occupied.some(other=>rectsOverlap(bounds,other,75)))continue;
        occupied.push(bounds);world.obstacles.push(...make(x,y,w,h));return;
      }
    }
    for(let i=0;i<8;i++){
      place(rand(110,180),rand(100,170),(x,y,w,h)=>{
        const t=rand(25,38),rotation=Math.floor(rand(0,4));
        if(rotation===0)return [{x,y,w,h:t,kind:'wall'},{x,y:y+t,w:t,h:h-t,kind:'wall'}];
        if(rotation===1)return [{x,y,w,h:t,kind:'wall'},{x:x+w-t,y:y+t,w:t,h:h-t,kind:'wall'}];
        if(rotation===2)return [{x,y:y+h-t,w,h:t,kind:'wall'},{x,y,w:t,h:h-t,kind:'wall'}];
        return [{x,y:y+h-t,w,h:t,kind:'wall'},{x:x+w-t,y,w:t,h:h-t,kind:'wall'}];
      });
    }
    for(let i=0;i<17;i++)place(rand(54,100),rand(46,90),(x,y,w,h)=>[{x,y,w,h,kind:'crate'}]);
  }
  function moveCircle(body,dx,dy){
    body.x=clamp(body.x+dx,body.r+8,world.mapW-body.r-8);
    for(const o of world.obstacles)if(circleHitsRect(body.x,body.y,body.r,o))body.x=dx>0?o.x-body.r:dx<0?o.x+o.w+body.r:body.x;
    body.y=clamp(body.y+dy,body.r+8,world.mapH-body.r-8);
    for(const o of world.obstacles)if(circleHitsRect(body.x,body.y,body.r,o))body.y=dy>0?o.y-body.r:dy<0?o.y+o.h+body.r:body.y;
  }
  function segmentRectT(x1,y1,x2,y2,o,pad=0){
    let enter=0,exit=1;const dx=x2-x1,dy=y2-y1;
    for(const [p,d,min,max] of [[x1,dx,o.x-pad,o.x+o.w+pad],[y1,dy,o.y-pad,o.y+o.h+pad]]){
      if(Math.abs(d)<1e-9){if(p<min||p>max)return null;continue;}
      const a=(min-p)/d,b=(max-p)/d;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));if(enter>exit)return null;
    }
    return enter;
  }
  function segmentCircleT(x1,y1,x2,y2,x,y,r){
    const dx=x2-x1,dy=y2-y1,len=dx*dx+dy*dy;if(!len)return null;
    const t=clamp(((x-x1)*dx+(y-y1)*dy)/len,0,1);
    return (x1+dx*t-x)**2+(y1+dy*t-y)**2<=r*r?t:null;
  }
  function firstCover(x1,y1,x2,y2,pad=0){
    let found=null,first=Infinity;
    for(const o of world.obstacles){const t=segmentRectT(x1,y1,x2,y2,o,pad);if(t!==null&&t<first){first=t;found=o;}}
    return found;
  }
  function cameraToPlayer(dt=1){
    if(!player)return;
    const targetX=clamp(player.x-world.w/2,0,Math.max(0,world.mapW-world.w));
    const targetY=clamp(player.y-world.h/2,0,Math.max(0,world.mapH-world.h));
    const blend=Math.min(1,dt*8);world.cameraX+=(targetX-world.cameraX)*blend;world.cameraY+=(targetY-world.cameraY)*blend;
  }

  function resize(){
    const r = canvas.getBoundingClientRect();
    world.w = r.width; world.h = r.height; world.dpr = Math.min(devicePixelRatio || 1,2);
    canvas.width = Math.round(r.width*world.dpr); canvas.height = Math.round(r.height*world.dpr);
    ctx.setTransform(world.dpr,0,0,world.dpr,0,0);
    if(player)cameraToPlayer();
  }
  addEventListener('resize',resize); resize();

  function show(screen){
    for(const id of screens) $(id).classList.toggle('hidden',id !== screen);
    $('hud').classList.toggle('hidden',state.mode !== 'playing' && state.mode !== 'paused');
    $('mobileControls').classList.toggle('hidden',state.mode !== 'playing');
    $('rotateNote').classList.toggle('hidden',state.mode !== 'playing');
    refreshMenu();
  }
  function refreshMenu(){
    $('menuCoins').textContent = save.coins;
    $('shopCoins').textContent = save.coins;
    $('progressText').textContent = `LEVEL ${String(Math.min(save.unlocked,maxLevel)).padStart(2,'0')} / 12`;
    $('playBtn').firstElementChild.textContent = save.unlocked > 1 ? `LEVEL ${String(Math.min(save.unlocked,maxLevel)).padStart(2,'0')} STARTEN` : 'SPIEL STARTEN';
  }
  function toast(message,duration=1.5){
    $('toast').textContent=message;$('toast').classList.remove('hidden');state.toastTimer=duration;
  }
  function updateHud(){
    $('hudLevel').textContent=String(state.level).padStart(2,'0');
    $('hudWave').textContent=`WELLE ${state.wave}/3`;
    $('hudCoins').textContent=save.coins+state.earned;
    const hp = player ? Math.max(0,Math.ceil(player.hp)) : 0;
    $('hpText').textContent=`${hp} / ${player?.maxHp || 100}`;
    const ratio=player?clamp(player.hp/player.maxHp,0,1):0;
    $('hpFill').style.transform=`scaleX(${player?clamp(state.hpDisplay/player.maxHp,0,1):0})`;
    $('hpLag').style.transform=`scaleX(${player?clamp(state.hpTrail/player.maxHp,0,1):0})`;
    $('healthWrap').classList.toggle('critical',ratio<.3);
    const boss=enemies.find(e=>e.type==='boss');
    $('bossHud').classList.toggle('hidden',!boss);
    if(boss){$('bossFill').style.width=`${Math.max(0,boss.hp/boss.maxHp*100)}%`;$('bossName').textContent=state.level===12?'DER KOMMANDANT':'ARENA-BOSS';}
  }
  function openMenu(){state.mode='menu';input.fire=false;show('menu');}
  function startLevel(level){
    state.mode='playing';state.level=level;state.wave=1;state.kills=0;state.earned=0;state.time=0;state.shake=0;state.flash=0;
    enemies=[];bullets=[];enemyBullets=[];particles=[];pickups=[];
    generateArena();
    const maxHp=100+save.upgrades.health*22;
    player={x:world.mapW/2,y:world.mapH/2,hp:maxHp,maxHp,r:15,angle:0,fireCooldown:0,invuln:0};
    state.hpDisplay=maxHp;state.hpTrail=maxHp;cameraToPlayer();
    beginWave(1); show('menu'); $('menu').classList.add('hidden'); $('hud').classList.remove('hidden'); $('mobileControls').classList.remove('hidden');$('rotateNote').classList.remove('hidden');
    updateHud();
  }
  function beginWave(wave){
    state.wave=wave;state.spawned=0;state.toSpawn=(wave===3&&levelBoss(state.level)) ? 1 : Math.min(4+state.level+wave*2,19);
    state.spawnTimer=.6;state.waveWait=0;
    toast(wave===3&&levelBoss(state.level)?'BOSS IN DER ARENA':`WELLE ${wave} / 3`,1.5);
    updateHud();
  }
  function spawnEnemy(){
    const boss=state.wave===3&&levelBoss(state.level);
    const roll=Math.random();
    const type=boss?'boss':roll<.18+state.level*.01?'shooter':roll<.34+state.level*.015?'tank':'runner';
    const levelScale=1+(state.level-1)*.14;
    const cfg={runner:{hp:28,speed:75,r:14,color:'#fd9275',damage:9,coin:9},shooter:{hp:38,speed:53,r:15,color:'#f7ba78',damage:11,coin:13},tank:{hp:82,speed:38,r:20,color:'#d980aa',damage:16,coin:19},boss:{hp:450+state.level*42,speed:42,r:38,color:'#ffb276',damage:20,coin:180+state.level*12}}[type];
    let x=player.x,y=player.y;
    const spawnRange=Math.max(300,Math.min(world.w,world.h)*.65);
    for(let attempt=0;attempt<90;attempt++){
      const a=rand(0,Math.PI*2),radius=rand(spawnRange,spawnRange+160);
      x=clamp(player.x+Math.cos(a)*radius,65,world.mapW-65);
      y=clamp(player.y+Math.sin(a)*radius,65,world.mapH-65);
      if(dist({x,y},player)>200&&!blocked(x,y,cfg.r+12))break;
    }
    enemies.push({x,y,type,r:cfg.r,hp:cfg.hp*levelScale,maxHp:cfg.hp*levelScale,speed:cfg.speed*(1+(state.level-1)*.025),color:cfg.color,damage:cfg.damage,coin:cfg.coin,shootTimer:rand(.8,1.8),hit:0,phase:0,angle:0});
  }
  function shoot(){
    if(!player || player.fireCooldown>0) return;
    let target=null,best=Infinity;
    for(const e of enemies){const d=dist(player,e);if(d<best&&!firstCover(player.x,player.y,e.x,e.y,3)){best=d;target=e;}}
    let angle=target?Math.atan2(target.y-player.y,target.x-player.x):player.angle;
    if(input.mouseAim && input.mouseX && input.mouseY) angle=Math.atan2(input.mouseY+world.cameraY-player.y,input.mouseX+world.cameraX-player.x);
    player.angle=angle;
    const rate=.29*Math.pow(.88,save.upgrades.rate);
    player.fireCooldown=Math.max(.085,rate);
    const damage=19+save.upgrades.damage*6;
    const spread=save.upgrades.multi>=3?.15:save.upgrades.multi>=1?.09:0;
    const offsets=save.upgrades.multi>=3?[-spread,0,spread]:save.upgrades.multi>=1?[-spread,spread]:[0];
    for(const off of offsets){const a=angle+off;bullets.push({x:player.x+Math.cos(a)*22,y:player.y+Math.sin(a)*22,vx:Math.cos(a)*680,vy:Math.sin(a)*680,r:4,life:1.2,damage:save.upgrades.multi ? damage*.74 : damage});}
    burst(player.x+Math.cos(angle)*23,player.y+Math.sin(angle)*23,'#ffdb91',4,70);
  }
  function enemyShoot(e){
    const angle=Math.atan2(player.y-e.y,player.x-e.x);
    const count=e.type==='boss' ? (e.hp/e.maxHp<.5?9:7) : 1;
    for(let i=0;i<count;i++){
      const a=e.type==='boss' ? angle + (i-(count-1)/2)*.22 : angle;
      enemyBullets.push({x:e.x+Math.cos(a)*e.r,y:e.y+Math.sin(a)*e.r,vx:Math.cos(a)*(e.type==='boss'?240:205),vy:Math.sin(a)*(e.type==='boss'?240:205),r:e.type==='boss'?7:5,damage:e.damage,life:4});
    }
    if(e.type==='boss')burst(e.x,e.y,'#ffbc7f',10,100);
  }
  function burst(x,y,color,count=8,power=120){for(let i=0;i<count;i++){const a=rand(0,Math.PI*2),s=rand(power*.25,power);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.2,.55),max:.55,r:rand(1.5,4),color});}}
  function dropCoin(e){pickups.push({x:e.x,y:e.y,r:e.type==='boss'?12:7,value:e.coin,life:10,t:0});}
  function enemyDead(e){
    const idx=enemies.indexOf(e);if(idx<0)return;
    enemies.splice(idx,1);state.kills++;dropCoin(e);burst(e.x,e.y,e.color,e.type==='boss'?40:14,e.type==='boss'?240:140);state.shake=e.type==='boss'?11:3;
  }
  function collect(p){state.earned+=p.value;pickups.splice(pickups.indexOf(p),1);burst(p.x,p.y,'#ffcd7c',6,65);updateHud();}
  function hurt(damage){
    if(player.invuln>0)return;
    const reduced=Math.max(1,damage*(1-save.upgrades.armor*.085));
    player.hp-=reduced;player.invuln=.65;state.shake=7;state.flash=.18;burst(player.x,player.y,'#72e4e5',12,130);updateHud();
    if(player.hp<=0) finish(false);
  }
  function finish(won){
    if(state.mode!=='playing')return;
    state.mode='result';input.fire=false;
    save.coins+=state.earned;
    if(won){save.unlocked=Math.max(save.unlocked,Math.min(maxLevel,state.level+1));save.best=Math.max(save.best,state.level);}
    persist();
    $('resultKicker').textContent=won?'MISSION ABGESCHLOSSEN':'MISSION GESCHEITERT';
    $('resultTitle').innerHTML=won?'SIEG<span class="title-dot">.</span>':'NIEDERLAGE<span class="title-dot">.</span>';
    $('resultText').textContent=won ? (levelBoss(state.level)?'Boss besiegt! Die Arena gehört dir.':'Stark gekämpft. Die nächste Mission wartet.') : 'Rüste dich im Shop auf und versuche es erneut.';
    $('resultKills').textContent=state.kills;
    $('resultCoins').textContent=state.earned;
    $('resultPrimary').innerHTML=won && state.level<maxLevel?'NÄCHSTES LEVEL <span>↗</span>':won?'ERNEUT SPIELEN <span>↻</span>':'NOCHMAL VERSUCHEN <span>↻</span>';
    $('resultPrimary').onclick=()=>startLevel(won&&state.level<maxLevel?state.level+1:state.level);
    show('resultScreen');
  }
  function pause(){if(state.mode!=='playing')return;state.mode='paused';input.fire=false;show('pauseScreen');}
  function resume(){if(state.mode!=='paused')return;state.mode='playing';show('menu');$('menu').classList.add('hidden');$('hud').classList.remove('hidden');$('mobileControls').classList.remove('hidden');$('rotateNote').classList.remove('hidden');state.last=performance.now();}

  function update(dt){
    if(state.toastTimer>0){state.toastTimer-=dt;if(state.toastTimer<=0)$('toast').classList.add('hidden');}
    if(state.mode!=='playing')return;
    state.time+=dt;state.shake=Math.max(0,state.shake-dt*34);state.flash=Math.max(0,state.flash-dt);player.invuln=Math.max(0,player.invuln-dt);player.fireCooldown=Math.max(0,player.fireCooldown-dt);
    let mx=input.joyX,my=input.joyY;
    if(input.keys.has('a')||input.keys.has('arrowleft'))mx-=1;
    if(input.keys.has('d')||input.keys.has('arrowright'))mx+=1;
    if(input.keys.has('w')||input.keys.has('arrowup'))my-=1;
    if(input.keys.has('s')||input.keys.has('arrowdown'))my+=1;
    const m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m;}
    const speed=210+save.upgrades.speed*23;
    moveCircle(player,mx*speed*dt,my*speed*dt);
    cameraToPlayer(dt);
    state.hpDisplay+=(Math.max(0,player.hp)-state.hpDisplay)*Math.min(1,dt*13);
    state.hpTrail+=(Math.max(0,player.hp)-state.hpTrail)*Math.min(1,dt*2.4);
    if(input.fire||input.keys.has(' ')||input.keys.has('j'))shoot();
    if(state.spawned<state.toSpawn){state.spawnTimer-=dt;if(state.spawnTimer<=0){spawnEnemy();state.spawned++;state.spawnTimer=(state.wave===3&&levelBoss(state.level))?2:clamp(.75-state.level*.025,.3,.75);}}
    for(const e of [...enemies]){
      e.hit=Math.max(0,e.hit-dt);e.phase+=dt;
      const d=dist(e,player)||1,dx=(player.x-e.x)/d,dy=(player.y-e.y)/d;e.angle=Math.atan2(dy,dx);
      const cover=firstCover(e.x,e.y,player.x,player.y,e.r+3);
      const ideal=e.type==='shooter'?185:e.type==='boss'?165:0;
      const movement=cover?1:e.type==='shooter'||e.type==='boss' ? (d>ideal+30?1:d<ideal-30?-.7:0) : 1;
      let tx=player.x,ty=player.y;
      if(cover){
        const gap=e.r+18;
        const corners=[{x:cover.x-gap,y:cover.y-gap},{x:cover.x+cover.w+gap,y:cover.y-gap},{x:cover.x-gap,y:cover.y+cover.h+gap},{x:cover.x+cover.w+gap,y:cover.y+cover.h+gap}];
        corners.sort((a,b)=>(dist(e,a)+dist(a,player))-(dist(e,b)+dist(b,player)));
        const waypoint=corners.find(c=>!firstCover(e.x,e.y,c.x,c.y,e.r*.4))||corners[0];tx=waypoint.x;ty=waypoint.y;
      }
      const td=Math.hypot(tx-e.x,ty-e.y)||1;
      moveCircle(e,(tx-e.x)/td*e.speed*movement*dt,(ty-e.y)/td*e.speed*movement*dt);
      if(dist(e,player)<e.r+player.r+1)hurt(e.damage);
      if(e.type==='shooter'||e.type==='boss'){e.shootTimer-=dt;if(e.shootTimer<=0){if(!cover)enemyShoot(e);e.shootTimer=e.type==='boss' ? (e.hp/e.maxHp<.5?.95:1.5) : rand(1.7,2.5);}}
    }
    for(const b of [...bullets]){
      const nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;
      let first=1.01,hit=null;
      for(const o of world.obstacles){const t=segmentRectT(b.x,b.y,nx,ny,o,b.r);if(t!==null&&t<first){first=t;hit='cover';}}
      for(const e of enemies){const t=segmentCircleT(b.x,b.y,nx,ny,e.x,e.y,b.r+e.r);if(t!==null&&t<first){first=t;hit=e;}}
      b.x+=(nx-b.x)*Math.min(first,1);b.y+=(ny-b.y)*Math.min(first,1);b.life-=dt;
      if(hit){if(hit!=='cover'){hit.hp-=b.damage;hit.hit=.12;burst(b.x,b.y,hit.color,4,60);if(hit.hp<=0)enemyDead(hit);}else burst(b.x,b.y,'#68afbd',4,55);b.life=0;}
      if(b.life<=0||b.x<0||b.x>world.mapW||b.y<0||b.y>world.mapH)bullets.splice(bullets.indexOf(b),1);
    }
    for(const b of [...enemyBullets]){
      const nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;
      let first=1.01,hit=null;
      for(const o of world.obstacles){const t=segmentRectT(b.x,b.y,nx,ny,o,b.r);if(t!==null&&t<first){first=t;hit='cover';}}
      const playerT=segmentCircleT(b.x,b.y,nx,ny,player.x,player.y,b.r+player.r);
      if(playerT!==null&&playerT<first){first=playerT;hit='player';}
      b.x+=(nx-b.x)*Math.min(first,1);b.y+=(ny-b.y)*Math.min(first,1);b.life-=dt;
      if(hit){if(hit==='player')hurt(b.damage);else burst(b.x,b.y,'#ffad78',4,55);b.life=0;}
      if(b.life<=0||b.x<0||b.x>world.mapW||b.y<0||b.y>world.mapH)enemyBullets.splice(enemyBullets.indexOf(b),1);
    }
    for(const p of [...pickups]){p.t+=dt;p.life-=dt;const d=dist(p,player);if(d<85){p.x+=(player.x-p.x)*dt*6;p.y+=(player.y-p.y)*dt*6;}if(d<player.r+p.r+5)collect(p);else if(p.life<=0)pickups.splice(pickups.indexOf(p),1);}
    for(const p of [...particles]){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt*2;p.vy*=1-dt*2;p.life-=dt;if(p.life<=0)particles.splice(particles.indexOf(p),1);}
    if(state.spawned>=state.toSpawn && enemies.length===0){state.waveWait+=dt;if(state.waveWait>1.3){if(state.wave<3)beginWave(state.wave+1);else finish(true);}}else state.waveWait=0;
    updateHud();
  }

  function line(x1,y1,x2,y2,color,width=3){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  function drawGrid(){
    const left=Math.max(0,world.cameraX-10),top=Math.max(0,world.cameraY-10);
    const right=Math.min(world.mapW,world.cameraX+world.w+10),bottom=Math.min(world.mapH,world.cameraY+world.h+10);
    ctx.fillStyle='#0b2030';ctx.fillRect(left,top,right-left,bottom-top);
    const grad=ctx.createRadialGradient(player?.x||world.mapW/2,player?.y||world.mapH/2,30,player?.x||world.mapW/2,player?.y||world.mapH/2,Math.max(world.w,world.h)*.8);
    grad.addColorStop(0,'#174252');grad.addColorStop(1,'#0b203000');ctx.fillStyle=grad;ctx.fillRect(left,top,right-left,bottom-top);
    const step=64;ctx.strokeStyle='#6bc8ce17';ctx.lineWidth=1;ctx.beginPath();
    for(let x=Math.floor(left/step)*step;x<right;x+=step){ctx.moveTo(x,top);ctx.lineTo(x,bottom);}
    for(let y=Math.floor(top/step)*step;y<bottom;y+=step){ctx.moveTo(left,y);ctx.lineTo(right,y);}ctx.stroke();
    ctx.strokeStyle='#43a4aa22';ctx.lineWidth=2;ctx.strokeRect(10,10,world.mapW-20,world.mapH-20);
    for(let x=Math.floor(left/256)*256;x<right;x+=256)for(let y=Math.floor(top/256)*256;y<bottom;y+=256){
      line(x-9,y,x+9,y,'#76c5c329',1);line(x,y-9,x,y+9,'#76c5c329',1);
    }
  }
  function drawObstacles(){
    const left=world.cameraX-130,top=world.cameraY-130,right=world.cameraX+world.w+130,bottom=world.cameraY+world.h+130;
    for(const o of world.obstacles){
      if(o.x>right||o.x+o.w<left||o.y>bottom||o.y+o.h<top)continue;
      ctx.save();ctx.shadowColor='#000b16';ctx.shadowBlur=18;ctx.shadowOffsetY=9;
      ctx.fillStyle=o.kind==='wall'?'#183e50':'#245063';ctx.fillRect(o.x,o.y,o.w,o.h);ctx.restore();
      ctx.fillStyle=o.kind==='wall'?'#2b6270':'#3e7880';ctx.fillRect(o.x+4,o.y+4,o.w-8,o.h-8);
      ctx.fillStyle='#6ecac343';ctx.fillRect(o.x+5,o.y+5,o.w-10,5);
      ctx.strokeStyle=o.kind==='wall'?'#6ab7bc':'#87c4bb';ctx.lineWidth=2;ctx.strokeRect(o.x+1,o.y+1,o.w-2,o.h-2);
      if(o.kind==='crate'){
        line(o.x+12,o.y+12,o.x+o.w-12,o.y+o.h-12,'#173f50',3);
        line(o.x+o.w-12,o.y+12,o.x+12,o.y+o.h-12,'#173f50',3);
        ctx.strokeStyle='#78bbb76a';ctx.lineWidth=1;ctx.strokeRect(o.x+10,o.y+10,o.w-20,o.h-20);
      }else{
        ctx.strokeStyle='#9ee3d858';ctx.lineWidth=1;ctx.beginPath();
        if(o.w>o.h){for(let x=o.x+16;x<o.x+o.w-10;x+=28){ctx.moveTo(x,o.y+8);ctx.lineTo(x+10,o.y+o.h-8);}}
        else for(let y=o.y+16;y<o.y+o.h-10;y+=28){ctx.moveTo(o.x+8,y);ctx.lineTo(o.x+o.w-8,y+10);}ctx.stroke();
      }
    }
  }
  function drawStick(x,y,r,color,angle,enemy=false,hit=0){
    const size=r/15;
    ctx.save();ctx.translate(x,y);
    const stroke=hit>0?'#fff':color;ctx.shadowColor=stroke;ctx.shadowBlur=enemy?8:15;
    line(-5*size,7*size,-8*size,23*size,stroke,4.5*size);line(5*size,7*size,10*size,23*size,stroke,4.5*size);
    line(0,-9*size,0,10*size,stroke,5*size);
    ctx.save();ctx.rotate(angle);
    line(0,-2*size,15*size,3*size,stroke,4.5*size);line(0,-2*size,-11*size,5*size,stroke,4.5*size);
    if(!enemy){line(12*size,3*size,27*size,3*size,'#5af4ec',5*size);line(26*size,3*size,34*size,3*size,'#e6fbf8',2*size);}
    else if(enemy){line(12*size,3*size,23*size,3*size,'#ffc187',4*size);}
    ctx.restore();
    ctx.beginPath();ctx.arc(0,-17*size,8*size,0,Math.PI*2);ctx.strokeStyle=stroke;ctx.lineWidth=4.5*size;ctx.stroke();
    ctx.restore();
  }
  function draw(){
    const w=world.w,h=world.h;ctx.clearRect(0,0,w,h);ctx.fillStyle='#071521';ctx.fillRect(0,0,w,h);ctx.save();
    if(state.mode==='playing'||state.mode==='paused'||state.mode==='result'){
      ctx.translate(rand(-state.shake,state.shake)-world.cameraX,rand(-state.shake,state.shake)-world.cameraY);drawGrid();drawObstacles();
      for(const p of pickups){ctx.save();ctx.shadowColor='#ffcc7c';ctx.shadowBlur=16;circle(p.x,p.y+Math.sin(p.t*5)*3,p.r,'#ffc16e');ctx.fillStyle='#58331d';ctx.font=`bold ${Math.max(9,p.r)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('◆',p.x,p.y+Math.sin(p.t*5)*3);ctx.restore();}
      for(const b of bullets){ctx.save();ctx.shadowColor='#74f5ed';ctx.shadowBlur=15;circle(b.x,b.y,b.r,'#d7fff5');ctx.restore();}
      for(const b of enemyBullets){ctx.save();ctx.shadowColor='#ffa26e';ctx.shadowBlur=14;circle(b.x,b.y,b.r,'#ff9b6b');ctx.restore();}
      for(const e of enemies){
        ctx.save();ctx.translate(e.x,e.y);ctx.strokeStyle=e.type==='boss'?'#ffaf7080':'#d0857660';ctx.lineWidth=e.type==='boss'?3:1.5;ctx.beginPath();ctx.arc(0,0,e.r+12+Math.sin(e.phase*4)*2,0,Math.PI*2);ctx.stroke();ctx.restore();
        drawStick(e.x,e.y,e.r,e.color,e.angle,e.type!=='runner',e.hit);
        if(e.hp<e.maxHp&&e.type!=='boss'){ctx.fillStyle='#522e3a';ctx.fillRect(e.x-18,e.y-e.r-24,36,4);ctx.fillStyle=e.color;ctx.fillRect(e.x-18,e.y-e.r-24,36*Math.max(0,e.hp/e.maxHp),4);}
        if(e.type==='boss'){ctx.strokeStyle='#ff9d65';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r+22,Math.PI*.05,Math.PI*.95);ctx.stroke();circle(e.x-14,e.y-26,4,'#ffb77b');}
      }
      if(player){
        if(player.invuln<=0||Math.floor(state.time*18)%2===0){circle(player.x,player.y+18,17,'#152d3bab');drawStick(player.x,player.y,15,'#e6f9f8',player.angle,false,0);}
        ctx.strokeStyle='#6be8e253';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(player.x,player.y,30,0,Math.PI*2);ctx.stroke();
      }
      for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);circle(p.x,p.y,p.r,p.color);}ctx.globalAlpha=1;
    }
    ctx.restore();
    if(state.flash>0){ctx.fillStyle=`rgba(255,83,77,${state.flash*.48})`;ctx.fillRect(0,0,w,h);}
  }
  function frame(t){const dt=Math.min((t-(state.last||t))/1000,.04);state.last=t;update(dt);draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);

  function renderLevels(){
    $('levelGrid').innerHTML='';
    for(let n=1;n<=maxLevel;n++){
      const b=document.createElement('button');b.className=`level-card ${levelBoss(n)?'boss':''} ${n===save.unlocked?'current':''}`;
      b.disabled=n>save.unlocked;
      b.innerHTML=`<span class="number">${String(n).padStart(2,'0')}</span><span class="status">${n>save.unlocked?'GESPERRT':levelBoss(n)?'BOSS LEVEL':n<save.unlocked?'GESCHAFFT':'BEREIT'}</span>`;
      b.onclick=()=>startLevel(n);$('levelGrid').append(b);
    }
  }
  function cost(u){return Math.round(u.base*Math.pow(1.55,save.upgrades[u.id]));}
  function renderShop(){
    $('shopCoins').textContent=save.coins;$('shopGrid').innerHTML='';
    for(const u of upgrades){
      const level=save.upgrades[u.id],price=cost(u),maxed=level>=u.max;
      const card=document.createElement('article');card.className='shop-card';
      card.innerHTML=`<div class="shop-icon">${u.icon}</div><div><div class="shop-title">${u.name}</div><p class="shop-desc">${u.desc}</p><div class="shop-level">STUFE ${level} / ${u.max}</div></div><button class="shop-buy" ${maxed||save.coins<price?'disabled':''}>${maxed?'MAXIMUM ERREICHT':`KAUFEN · ◆ ${price}`}</button>`;
      card.querySelector('button').onclick=()=>{if(save.coins<price||maxed)return;save.coins-=price;save.upgrades[u.id]++;persist();renderShop();refreshMenu();};
      $('shopGrid').append(card);
    }
  }
  $('playBtn').onclick=()=>startLevel(Math.min(save.unlocked,maxLevel));
  $('levelsBtn').onclick=()=>{renderLevels();show('levelsScreen');};
  $('shopBtn').onclick=()=>{renderShop();show('shopScreen');};
  document.querySelectorAll('[data-back="menu"]').forEach(b=>b.onclick=openMenu);
  $('pauseBtn').onclick=pause;$('resumeBtn').onclick=resume;$('restartBtn').onclick=()=>startLevel(state.level);$('menuFromPause').onclick=openMenu;
  $('resultShop').onclick=()=>{renderShop();show('shopScreen');};$('resultMenu').onclick=openMenu;
  addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();if(k==='escape'||k==='p'){if(state.mode==='playing')pause();else if(state.mode==='paused')resume();}input.keys.add(k);});
  addEventListener('keyup',e=>input.keys.delete(e.key.toLowerCase()));
  addEventListener('blur',()=>{input.keys.clear();input.fire=false;if(state.mode==='playing')pause();});
  canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){input.mouseX=e.clientX;input.mouseY=e.clientY;input.mouseAim=true;}});
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&state.mode==='playing'){input.fire=true;input.mouseX=e.clientX;input.mouseY=e.clientY;input.mouseAim=true;}});
  addEventListener('pointerup',e=>{if(e.pointerType==='mouse')input.fire=false;});
  const stick=$('joystick'),knob=$('joystickKnob');let joyPointer=null;
  function moveJoy(e){const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,limit=r.width*.33,len=Math.hypot(dx,dy)||1,m=Math.min(limit,len);input.joyX=dx/len*m/limit;input.joyY=dy/len*m/limit;knob.style.transform=`translate(${dx/len*m}px,${dy/len*m}px)`;}
  stick.addEventListener('pointerdown',e=>{e.preventDefault();joyPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveJoy(e);});
  stick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)moveJoy(e);});
  function endJoy(e){if(e.pointerId!==joyPointer)return;joyPointer=null;input.joyX=0;input.joyY=0;knob.style.transform='translate(0,0)';}
  stick.addEventListener('pointerup',endJoy);stick.addEventListener('pointercancel',endJoy);
  const fire=$('fireBtn');fire.addEventListener('pointerdown',e=>{e.preventDefault();fire.setPointerCapture(e.pointerId);input.fire=true;fire.classList.add('active');});
  const endFire=()=>{input.fire=false;fire.classList.remove('active');};fire.addEventListener('pointerup',endFire);fire.addEventListener('pointercancel',endFire);
  for(const control of [fire,stick]){
    for(const event of ['touchstart','touchmove','touchend'])control.addEventListener(event,e=>e.preventDefault(),{passive:false});
    control.addEventListener('dblclick',e=>e.preventDefault());
    control.addEventListener('contextmenu',e=>e.preventDefault());
  }
  $('app').addEventListener('gesturestart',e=>{if(state.mode==='playing')e.preventDefault();},{passive:false});
  $('app').addEventListener('gesturechange',e=>{if(state.mode==='playing')e.preventDefault();},{passive:false});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.mode==='playing')pause();});
  show('menu');
})();
