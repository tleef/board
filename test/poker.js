var poker = require('../poker');
var assert = require('assert');

var thousand = 1000;
var million = 1000 * thousand;
var billion = 1000 * million;
var trillion = 1000 * billion;

var maxPlayers = 8;
var maxTotalCash = 250 * trillion;

suite('poker', function () {

  test('setup', function () {
    var s = poker.createState();

    assert.strictEqual(s.bytes.length, 126);
    for (var i = 0, l = s.bytes.length; i < l; i++) {
      assert.strictEqual(s.bytes[i], 0);
    }
  });

  test('join', function() {
    var s = poker.createState();
    var player, before, apply, expected;

    before = new Uint8Array(s.bytes);
    apply = applyChanges.bind(null, s.byteMap, before);
    player = { position: 0, wallet: Math.pow(2, 7) };
    poker.exec('join', s, player);
    expected = apply('player0Occupied', 1, 'player0Wallet5', 2 << 6, 'numPlayers', 1);
    verify(before, expected, diff(before, s.bytes));

    // position is already taken
    before = new Uint8Array(s.bytes);
    player = { position: 0, wallet: Math.pow(2, 7) };
    poker.exec('join', s, player);
    verify(before, before, diff(before, s.bytes));

    // exceeds max total cash
    before = new Uint8Array(s.bytes);
    player = { position: 1, wallet: (maxTotalCash + 1) };
    poker.exec('join', s, player);
    verify(before, before, diff(before, s.bytes));

    for (var i = 1; i < maxPlayers; i++) {
      before = new Uint8Array(s.bytes);
      apply = applyChanges.bind(null, s.byteMap, before);
      player = { position: i, wallet: Math.pow(2, (i % 6) * 8 + 7) };
      poker.exec('join', s, player);
      expected = apply('player' + i + 'Occupied', 1, 'player' + i + 'Wallet' + (5 - (i % 6)), 2 << 6, 'numPlayers', i + 1);
      verify(before, expected, diff(before, s.bytes));
    }

    // all positions are taken
    before = new Uint8Array(s.bytes);
    player = { position: maxPlayers - 1, wallet: Math.pow(2, 7) };
    poker.exec('join', s, player);
    verify(before, before, diff(before, s.bytes));
  });

  test('sit', function() {
    var s = poker.createState();
    var i, player, before, apply, expected;

    // setup
    for (i = 0; i < maxPlayers; i++) {
      player = { position: i, wallet: Math.pow(2, 23) };
      poker.exec('join', s, player);
    }

    for (i = 0; i < maxPlayers; i++) {
      before = new Uint8Array(s.bytes);
      apply = applyChanges.bind(null, s.byteMap, before);
      player = { position: i };
      poker.exec('sit', s, player);
      expected = apply('player' + i + 'Sitting', 1);
      verify(before, expected, diff(before, s.bytes));

      // already sitting
      before = new Uint8Array(s.bytes);
      poker.exec('sit', s, player);
      verify(before, before, diff(before, s.bytes));
    }
  });

  test('stand', function() {
    var s = poker.createState();
    var i, player, before, apply, expected;

    // setup
    for (i = 0; i < maxPlayers; i++) {
      player = { position: i, wallet: Math.pow(2, 23) };
      poker.exec('join', s, player);
    }

    for (i = 0; i < maxPlayers; i++) {
      // standing by default
      before = new Uint8Array(s.bytes);
      player = { position: i };
      poker.exec('stand', s, player);
      verify(before, before, diff(before, s.bytes));

      poker.exec('sit', s, player);

      before = new Uint8Array(s.bytes);
      apply = applyChanges.bind(null, s.byteMap, before);
      poker.exec('stand', s, player);
      expected = apply('player' + i + 'Sitting', 0);
      verify(before, expected, diff(before, s.bytes));
    }
  });

});

function verify(before, expectedAfter, actualDiff) {
  var expectedDiff = diff(before, expectedAfter);
  assert.deepEqual(actualDiff, expectedDiff);
}

/*
 * ByteDef
 * -name
 * -size
 * -byte
 * -offset
 * -mask
 */
function applyChanges(byteMap, bytes) {
  var args = Array.prototype.slice.call(arguments, 2);
  bytes = new Uint8Array(bytes);
  for (var i = 0, l = args.length; i < l;) {
    var key = args[i++];
    var val = args[i++];
    var def = byteMap[key];
    var byte = bytes[def.byte];
    bytes[def.byte] = (byte | def.mask) & ((val << def.offset) | ~def.mask)
  }
  return bytes;
}

function diff(before, after) {
  var diff = [];
  assert.strictEqual(before.length, after.length);
  for (var i = 0, l = before.length; i < l; i++) {
    if (before[i] ^ after[i]) diff[i] = {before: before[i], after: after[i]};
  }
  return diff;
}