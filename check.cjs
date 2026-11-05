const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = __dirname;
const {presetCode} = require(path.join(root, 'app.js'));
const context = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'catalog.js'), 'utf8'), context);
const catalog = context.window.RR_PRESETS;
assert(catalog.length > 0);
const ids = new Set();
for (const preset of catalog) {
  assert.match(preset.id, /^[a-z0-9-]+$/);
  assert(!ids.has(preset.id)); ids.add(preset.id);
  for (const field of ['name', 'author', 'mode', 'description']) assert(preset[field]?.trim());
  const code = presetCode(preset);
  assert(code.length <= 200000);
  const payload = JSON.parse(Buffer.from(code.slice(3), 'base64').toString('utf8'));
  assert.equal(payload.type, 'CardPriority'); assert.equal(payload.version, 1);
  assert.equal(JSON.stringify(payload.data), JSON.stringify(preset.data));
}
for (const data of [[], ['shield', 'shield'], [42], [''], ['a'.repeat(101)]])
  assert.throws(() => presetCode({type: 'CardPriority', data}));
assert.throws(() => presetCode({type: 'Settings', data: ['shield']}));
const unicode = {type: 'CardPriority', data: ['éclair']};
assert.deepEqual(JSON.parse(Buffer.from(presetCode(unicode).slice(3), 'base64')).data, unicode.data);
console.log(`Passed: ${catalog.length} presets, RR round trips, Unicode, invalid entries.`);

