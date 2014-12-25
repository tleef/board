
var utils = module.exports = exports = {};

utils.intToBytes = function intToBytes(int, numBytes) {
  var hex = int.toString(16);
  numBytes = numBytes || Math.round(hex.length / 2);
  var pad = new Array(numBytes * 2 + 1).join('0');
  hex = pad.substring(0, pad.length - hex.length) + hex;
  var bytes = new Uint8Array(numBytes);
  var j = 0;
  for (var i = 0; i < numBytes; i++) {
    bytes[i] = parseInt(hex.substring(j, j += 2), 16);
  }
  return bytes;
};

utils.bytesToInt = function bytesToInt(bytes) {
  var hex = '';
  for (var i = 0, l = bytes.length; i < l; i++) {
    var byteHex = bytes[i].toString(16);
    hex += '00'.substring(0, 2 - byteHex.length) + byteHex;
  }
  return parseInt(hex, 16);
};

utils.getInt = function getInt(state, name, numBytes) {
  var intBytes = new Uint8Array(numBytes);
  for (var i = 0; i < numBytes; i++) {
    intBytes[i] = state.get(name + i);
  }
  return utils.bytesToInt(intBytes);
};

utils.setInt = function setInt(state, name, int, numBytes) {
  var intBytes = utils.intToBytes(int, numBytes);
  for (var i = 0, l = intBytes.length; i < l; i++) {
    state.set(name + i, intBytes[i]);
  }
};