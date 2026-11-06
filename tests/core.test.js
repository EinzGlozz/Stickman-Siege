const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../dist/core.js');

test('six maps contain thirty levels each and finish with a boss', () => {
  assert.equal(C.MAX_LEVEL, 180);
  assert.equal(new Set(C.MAPS.map(m => m.id)).size, 6);
  for (let index = 0; index < C.MAPS.length; index++) {
    const first = C.levelInfo(index * 30 + 1);
    const last = C.levelInfo(index * 30 + 30);
    assert.equal(first.map.id, C.MAPS[index].id);
    assert.equal(first.local, 1);
    assert.equal(first.boss, false);
    assert.equal(last.local, 30);
    assert.equal(last.boss, true);
  }
  assert.equal(C.levelInfo(31).map.id, 'desert');
  assert.equal(C.levelInfo(181).global, 180);
});

test('every map boss has a distinct normal and super attack with fair warning', () => {
  const normals = new Set();
  const supers = new Set();
  for (const map of C.MAPS) {
    const attack = C.BOSS_PATTERNS[map.id];
    assert.ok(attack);
    assert.ok(attack.normalWarn >= 0.6);
    assert.ok(attack.superWarn >= 0.9);
    assert.ok(attack.normal !== attack.super);
    normals.add(attack.normal);
    supers.add(attack.super);
  }
  assert.equal(normals.size, C.MAPS.length);
  assert.equal(supers.size, C.MAPS.length);
});

test('waves grow harder and a map boss finishes its third wave', () => {
  const early = C.levelInfo(1);
  const late = C.levelInfo(29);
  assert.ok(C.waveSize(early, 1) < C.waveSize(early, 2));
  assert.ok(C.waveSize(early, 1) >= 10);
  assert.ok(C.waveSize(early, 2) < C.waveSize(early, 3));
  assert.ok(C.waveSize(late, 1) > C.waveSize(early, 1));
  assert.equal(C.waveSize(C.levelInfo(30), 3), 1);
  assert.equal(C.waveSize(C.levelInfo(60), 3), 1);
});

test('movement is equally fast on both axes and diagonal movement is normalized', () => {
  const speed = 225;
  const x = C.normalize(1, 0);
  const y = C.normalize(0, 1);
  const diagonal = C.normalize(1, 1);
  assert.equal(x.x * speed, y.y * speed);
  assert.equal(x.y, 0);
  assert.equal(y.x, 0);
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) * speed - speed) < 1e-10);
});

test('upgrades become more expensive and XP requirements increase', () => {
  for (const upgrade of C.UPGRADES) {
    assert.ok(C.upgradeCost(upgrade, 1) > C.upgradeCost(upgrade, 0));
    assert.ok(upgrade.max > 0);
  }
  assert.ok(C.xpRequired(3) > C.xpRequired(2));
  assert.ok(C.pointCost(3) > C.pointCost(1));
});

test('normal shots have a cooldown and rapid fire has a safe fixed interval', () => {
  assert.equal(C.weaponInterval(C.WEAPONS.find(w => w.id === 'pistol'), 0, false), 0.43);
  for (const weapon of C.WEAPONS) {
    const normal = C.weaponInterval(weapon, 0, false);
    const rapid = C.weaponInterval(weapon, 0, true);
    assert.ok(normal >= 0.12);
    assert.equal(rapid, 0.085);
    assert.ok(rapid < normal);
    assert.ok(C.weaponInterval(weapon, 5, false) <= normal);
  }
});

test('saved data is bounded and cannot equip unowned items', () => {
  const save = C.sanitizeSave({
    coins: -500, unlocked: 9999, xp: Number.POSITIVE_INFINITY,
    upgrades: { damage: 999 }, skin: 'thor',
    ownedSkins: ['spider', 'invalid'], ownedWeapons: ['bow'],
    weapons: ['bow', 'rifle', 'invalid'], ownedPerks: ['arrows'], perks: ['bricks'],
    settings: { master: 999, joyX: -5, keys: { fire: 'f' } }
  });
  assert.equal(save.coins, 0);
  assert.equal(save.unlocked, 180);
  assert.equal(save.xp, 0);
  assert.equal(save.upgrades.damage, C.UPGRADES.find(u => u.id === 'damage').max);
  assert.equal(save.skin, 'soldier');
  assert.deepEqual(save.weapons, ['bow']);
  assert.deepEqual(save.perks, []);
  assert.equal(save.settings.master, 100);
  assert.equal(save.settings.joyX, 1);
  assert.equal(save.settings.keys.fire, 'f');
});

test('admin test profile has all maps, equipment and resources', () => {
  const admin = C.adminSave();
  assert.equal(admin.unlocked, C.MAX_LEVEL);
  assert.equal(admin.ownedSkins.length, C.SKINS.length);
  assert.equal(admin.ownedWeapons.length, C.WEAPONS.length);
  assert.equal(admin.ownedPerks.length, C.PERKS.length);
  assert.ok(admin.coins > 1_000_000);
  assert.ok(admin.skillPoints > 1_000);
});
