/* Shared game rules. The small pure API is also used by the QA tests. */
(function (root, factory) {
  const core = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (root) root.SiegeCore = core;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const LEVELS_PER_MAP = 30;
  const MAPS = [
    {id:'grass',name:'GRASLAND',subtitle:'Wind über grünen Hügeln',ground:'#183c36',tile:'#245346',line:'#6ebc8550',accent:'#8de5a4',cover:'#466e43',edge:'#97ba77',boss:'DORNENKÖNIG'},
    {id:'desert',name:'WÜSTE',subtitle:'Ruinen im heißen Sand',ground:'#564333',tile:'#73583b',line:'#ddae6750',accent:'#ffd58b',cover:'#8b6841',edge:'#e7b06c',boss:'SANDKOLOSS'},
    {id:'grave',name:'FRIEDHOF',subtitle:'Nebel zwischen alten Gräbern',ground:'#252a35',tile:'#343b45',line:'#a2a5c450',accent:'#c2b7ef',cover:'#555365',edge:'#b3a6cc',boss:'GRABWÄCHTER'},
    {id:'volcano',name:'VULKANINSEL',subtitle:'Glut unter schwarzem Stein',ground:'#352928',tile:'#49312d',line:'#f16f4650',accent:'#ff9168',cover:'#5a3936',edge:'#f0784c',boss:'LAVAFÜRST'},
    {id:'frost',name:'FROSTFESTUNG',subtitle:'Eis und Sturm',ground:'#24404b',tile:'#315765',line:'#9ceaf050',accent:'#b6f7ff',cover:'#5a8090',edge:'#b6e3e9',boss:'EISKÖNIGIN'},
    {id:'neon',name:'NEONRUINEN',subtitle:'Die letzte Arena',ground:'#1d253c',tile:'#273651',line:'#7589f050',accent:'#a3b2ff',cover:'#3e4b70',edge:'#a7aaf5',boss:'NACHTTITAN'}
  ];
  const MAX_LEVEL = MAPS.length * LEVELS_PER_MAP;
  const TUTORIAL_REWARD = 300;

  const UPGRADES = [
    {id:'damage',icon:'✷',name:'SCHADEN',desc:'Mehr Schaden pro Treffer.',base:90,max:10},
    {id:'rate',icon:'⌁',name:'FEUERRATE',desc:'Kürzere Pause zwischen Schüssen.',base:110,max:8},
    {id:'health',icon:'♥',name:'LEBEN',desc:'Mehr maximale Lebenspunkte.',base:95,max:10},
    {id:'speed',icon:'➤',name:'TEMPO',desc:'Schneller in beide Richtungen.',base:90,max:8},
    {id:'armor',icon:'◇',name:'PANZERUNG',desc:'Weniger Schaden durch Monster.',base:130,max:8},
    {id:'multi',icon:'✹',name:'MEHRSCHUSS',desc:'Zusätzliche Projektile.',base:180,max:4},
    {id:'magnet',icon:'◎',name:'MAGNET',desc:'Größerer Sammelradius.',base:115,max:7},
    {id:'fortune',icon:'◆',name:'GLÜCK',desc:'Mehr Münzen und Powerups.',base:160,max:6}
  ];
  const WEAPONS = [
    {id:'pistol',icon:'✦',name:'BLASTER',desc:'Ausgewogen und zuverlässig.',cost:0,rate:.43,damage:18,speed:690,shots:1,spread:0,color:'#7ff8ef'},
    {id:'shotgun',icon:'✹',name:'SCHROTFLINTE',desc:'Fünf Kugeln auf kurze Distanz.',cost:500,rate:.82,damage:11,speed:610,shots:5,spread:.15,color:'#ffd18b'},
    {id:'rifle',icon:'⌁',name:'STURMGEWEHR',desc:'Schnelle präzise Salven.',cost:850,rate:.27,damage:13,speed:790,shots:1,spread:0,color:'#b6f9ad'},
    {id:'bow',icon:'➶',name:'JÄGERBOGEN',desc:'Pfeile durchdringen Monster.',cost:1100,rate:.72,damage:35,speed:750,shots:1,spread:0,color:'#dcc6ff',pierce:1},
    {id:'brick',icon:'▦',name:'ZIEGELWERFER',desc:'Schwere Steine mit Flächenschaden.',cost:1500,rate:1,damage:42,speed:500,shots:1,spread:0,color:'#ff9a83',splash:52},
    {id:'football',icon:'◉',name:'FUSSBALLKANONE',desc:'Prallende Bälle treffen mehrfach.',cost:1750,rate:.9,damage:31,speed:590,shots:1,spread:0,color:'#f9fcff',bounce:2}
  ];
  const BOSS_PATTERNS = {
    grass:{normal:'DORNENFÄCHER',super:'WURZELFALLE',normalWarn:.72,superWarn:1.05},
    desert:{normal:'SANDLANZEN',super:'SANDSTURM',normalWarn:.72,superWarn:1.05},
    grave:{normal:'GEISTERSICHEL',super:'GRABRUF',normalWarn:.72,superWarn:1.05},
    volcano:{normal:'LAVAKUGEL',super:'ERUPTION',normalWarn:.78,superWarn:1.1},
    frost:{normal:'EISSPLITTER',super:'FROSTNOVA',normalWarn:.72,superWarn:1.05},
    neon:{normal:'ENERGIESTRAHL',super:'KREUZBLITZ',normalWarn:.8,superWarn:1.1}
  };
  const PERKS = [
    {id:'arrows',icon:'➶',name:'AUTOPFEILE',desc:'Schießt selbstständig auf Monster.',cost:900,interval:1.35},
    {id:'bricks',icon:'▦',name:'ZIEGELREGEN',desc:'Wirft automatisch Ziegel.',cost:1300,interval:2.1},
    {id:'footballs',icon:'◉',name:'BALLHAGEL',desc:'Schießt springende Fußbälle.',cost:1550,interval:1.8},
    {id:'orb',icon:'◈',name:'SCHUTZORB',desc:'Kreist um dich und trifft Monster.',cost:1900,interval:0}
  ];
  const SKINS = [
    {id:'soldier',name:'SIEGE',cost:0,body:'#e6f9f8',accent:'#59e9e5',attack:'Pulsfeuer',power:'normal'},
    {id:'spider',name:'SPIDER-MAN',cost:2200,body:'#ec514d',accent:'#4b88ed',attack:'Netzschuss',power:'web'},
    {id:'bat',name:'BATMAN',cost:2700,body:'#31394c',accent:'#f4d45f',attack:'Batarang',power:'bat'},
    {id:'wolverine',name:'WOLVERINE',cost:3100,body:'#f6cf50',accent:'#3b5b9d',attack:'Klauenhieb',power:'claw'},
    {id:'hulk',name:'HULK',cost:3500,body:'#7bcb6c',accent:'#6a4c98',attack:'Schockwelle',power:'smash'},
    {id:'iron',name:'IRON MAN',cost:3900,body:'#d34e48',accent:'#f7c75d',attack:'Repulsorstrahl',power:'laser'},
    {id:'thor',name:'THOR',cost:4400,body:'#7c9dca',accent:'#f2cc80',attack:'Blitzkette',power:'lightning'},
    {id:'ninja',name:'SCHATTENNINJA',cost:5200,body:'#56557c',accent:'#ba7df7',attack:'Schattenklinge',power:'shadow'}
  ];
  const POWERUPS = [
    {id:'rapid',icon:'⚡',name:'DAUERFEUER',color:'#ffda76',duration:4},
    {id:'invincible',icon:'◆',name:'UNSTERBLICH',color:'#87f9ef',duration:5},
    {id:'double',icon:'✷',name:'DOPPELSCHADEN',color:'#ff9d8e',duration:7},
    {id:'magnet',icon:'◎',name:'SUPER-MAGNET',color:'#bca6ff',duration:8},
    {id:'slow',icon:'◷',name:'ZEITLUPE',color:'#a7e7ff',duration:6},
    {id:'heal',icon:'♥',name:'HEILUNG',color:'#9ef1ae',duration:0}
  ];

  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
  function normalize(x,y){const n=Math.hypot(x,y);return n>1?{x:x/n,y:y/n}:{x,y};}
  function levelInfo(level){
    const safe=clamp(Math.floor(Number(level)||1),1,MAX_LEVEL);
    const mapIndex=Math.floor((safe-1)/LEVELS_PER_MAP);
    const local=(safe-1)%LEVELS_PER_MAP+1;
    return {global:safe,mapIndex,local,map:MAPS[mapIndex],boss:local===LEVELS_PER_MAP};
  }
  function xpRequired(level){return Math.round(60+Math.pow(Math.max(0,level-1),1.35)*24);}
  function upgradeCost(upgrade,level){return Math.round(upgrade.base*Math.pow(1.52,level));}
  function pointCost(level){return 1+Math.floor(level/2);}
  function weaponInterval(weapon,rateLevel,rapid){return rapid?0.085:Math.max(.12,weapon.rate*Math.pow(.9,rateLevel));}
  function waveSize(info,wave){return info.boss&&wave===3?1:Math.min(7+Math.floor(info.local*.44)+info.mapIndex*2+wave*3,28);}
  const finiteInt=(value,fallback,min,max)=>Number.isFinite(Number(value))?clamp(Math.floor(Number(value)),min,max):fallback;
  function defaultSave(){
    return {coins:0,unlocked:1,best:0,xp:0,xpLevel:1,skillPoints:0,
      upgrades:Object.fromEntries(UPGRADES.map(u=>[u.id,0])),
      ownedSkins:['soldier'],skin:'soldier',ownedWeapons:['pistol'],weapons:['pistol'],ownedPerks:[],perks:[],tutorialDone:false,tutorialSkipped:false,tutorialRewardClaimed:false,
      settings:{master:70,music:38,sfx:75,joyX:6,joyY:7,fireX:6,fireY:8,keys:{up:'w',down:'s',left:'a',right:'d',fire:' ',pause:'p'}}};
  }
  function sanitizeSave(raw){
    const d=defaultSave(),s=raw&&typeof raw==='object'?raw:{};
    const settings=s.settings&&typeof s.settings==='object'?s.settings:{};
    const validIds=(list,defs)=>Array.isArray(list)?[...new Set(list.filter(id=>defs.some(d=>d.id===id)))]:[];
    const ownedSkins=[...new Set(['soldier',...validIds(s.ownedSkins,SKINS)])];
    const ownedWeapons=[...new Set(['pistol',...validIds(s.ownedWeapons,WEAPONS)])];
    const ownedPerks=validIds(s.ownedPerks,PERKS);
    const keys={...d.settings.keys};
    for(const id of Object.keys(keys))if(typeof settings.keys?.[id]==='string'&&settings.keys[id].length<=16&&settings.keys[id])keys[id]=settings.keys[id].toLowerCase();
    return {
      coins:finiteInt(s.coins,0,0,999999999),unlocked:finiteInt(s.unlocked,1,1,MAX_LEVEL),best:finiteInt(s.best,0,0,MAX_LEVEL),
      xp:finiteInt(s.xp,0,0,999999999),xpLevel:finiteInt(s.xpLevel,1,1,999),skillPoints:finiteInt(s.skillPoints,0,0,99999),
      upgrades:Object.fromEntries(UPGRADES.map(u=>[u.id,finiteInt(s.upgrades?.[u.id],0,0,u.max)])),
      ownedSkins,skin:ownedSkins.includes(s.skin)?s.skin:'soldier',ownedWeapons,
      weapons:validIds(s.weapons,WEAPONS).filter(id=>ownedWeapons.includes(id)).slice(0,3).length?validIds(s.weapons,WEAPONS).filter(id=>ownedWeapons.includes(id)).slice(0,3):['pistol'],
      ownedPerks,perks:validIds(s.perks,PERKS).filter(id=>ownedPerks.includes(id)).slice(0,2),
      tutorialDone:!!s.tutorialDone,tutorialSkipped:!!s.tutorialSkipped,tutorialRewardClaimed:!!s.tutorialRewardClaimed,
      settings:{master:finiteInt(settings.master,d.settings.master,0,100),music:finiteInt(settings.music,d.settings.music,0,100),sfx:finiteInt(settings.sfx,d.settings.sfx,0,100),
        joyX:finiteInt(settings.joyX,d.settings.joyX,1,36),joyY:finiteInt(settings.joyY,d.settings.joyY,1,36),
        fireX:finiteInt(settings.fireX,d.settings.fireX,1,36),fireY:finiteInt(settings.fireY,d.settings.fireY,1,36),keys}
    };
  }
  function adminSave(){
    const s=defaultSave();s.coins=999999999;s.unlocked=MAX_LEVEL;s.best=MAX_LEVEL;s.xpLevel=999;s.skillPoints=99999;
    for(const u of UPGRADES)s.upgrades[u.id]=u.max;
    s.ownedSkins=SKINS.map(x=>x.id);s.ownedWeapons=WEAPONS.map(x=>x.id);s.ownedPerks=PERKS.map(x=>x.id);
    s.weapons=['pistol','rifle','bow'];s.perks=['arrows','orb'];s.tutorialDone=true;s.tutorialRewardClaimed=true;
    return s;
  }
  function completeTutorial(save,adminMode=false){
    const awarded=!adminMode&&!save.tutorialRewardClaimed?TUTORIAL_REWARD:0;
    save.tutorialDone=true;save.tutorialSkipped=false;save.tutorialRewardClaimed=true;
    save.coins=clamp(save.coins+awarded,0,999999999);
    return awarded;
  }
  return {LEVELS_PER_MAP,MAPS,MAX_LEVEL,TUTORIAL_REWARD,UPGRADES,WEAPONS,PERKS,SKINS,POWERUPS,BOSS_PATTERNS,clamp,normalize,levelInfo,xpRequired,upgradeCost,pointCost,weaponInterval,waveSize,defaultSave,sanitizeSave,adminSave,completeTutorial};
});
