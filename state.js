
module.exports = exports = function(byteCount, byteIndex) {
    return new State(byteCount, byteIndex);
};

function State(byteCount, byteIndex) {
    this.byteIndex = byteIndex;
    this.bytes = new Uint8Array(byteCount);

}

State.prototype.get = function (name) {
    var def = this.byteIndex[name];
    return (this.bytes[def.byte] & def.mask) >>> def.offset;
};

State.prototype.set = function (name, val) {
    var def = this.byteIndex[name];
    this.bytes[def.byte] = (this.bytes[def.byte] | def.mask) & ((val << def.offset) | ~def.mask);
};