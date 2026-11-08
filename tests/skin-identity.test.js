const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../dist/core.js');

const legacyIds = ['spider', 'bat', 'wolverine', 'hulk', 'iron', 'thor'];

test('v12 skin purchases and active selection survive the new identities', () => {
  const oldSave = C.defaultSave();
  oldSave.coins = 6423;
  oldSave.xp = 243;
  oldSave.xpLevel = 4;
  oldSave.upgrades.damage = 2;
  oldSave.ownedSkins = ['soldier', ...legacyIds];
  oldSave.skin = 'thor';
  oldSave.ownedWeapons = ['pistol', 'bow'];
  oldSave.weapons = ['pistol', 'bow'];
  oldSave.settings.music = 42;

  for (const save of [C.sanitizeSave(oldSave), C.readBackup(C.createBackup(oldSave))]) {
    assert.equal(save.coins, 6423);
    assert.equal(save.xp, 243);
    assert.equal(save.xpLevel, 4);
    assert.equal(save.upgrades.damage, 2);
    assert.deepEqual(save.ownedSkins, ['soldier', ...legacyIds]);
    assert.equal(save.skin, 'thor');
    assert.deepEqual(save.weapons, ['pistol', 'bow']);
    assert.equal(save.settings.music, 42);
  }
});

test('six purchasable identities have distinct labels and unchanged coin prices', () => {
  const skins = legacyIds.map(id => C.SKINS.find(s => s.id === id));
  assert.ok(skins.every(Boolean));
  assert.deepEqual(skins.map(s => s.cost), [2200, 2700, 3100, 3500, 3900, 4400]);
  assert.equal(new Set(skins.map(s => s.name)).size, skins.length);
  assert.equal(new Set(skins.map(s => s.icon)).size, skins.length);
  for (const skin of skins) {
    assert.ok(skin.name && skin.icon && skin.attack);
    assert.doesNotMatch(skin.name, /spider.man|batman|wolverine|hulk|iron.man|thor/i);
  }
});
