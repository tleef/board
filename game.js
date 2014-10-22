var Executor = require('./executor.js');
var State = require('./state.js');

var powerBytes = new Uint8Array(9);
powerBytes[0] = 0x00;
powerBytes[1] = 0x01;
powerBytes[2] = 0x03;
powerBytes[3] = 0x07;
powerBytes[4] = 0x0f;
powerBytes[5] = 0x1f;
powerBytes[6] = 0x3f;
powerBytes[7] = 0x7f;
powerBytes[8] = 0xff;

module.exports = exports = function() {

    var executor = Executor();
    var stateDefinitions = [];
    var stateBytes = [];
    var stateByteIndex = {};
    var initialized = false;

    var game = {

        init: function() {
            stateBytes = defineStateBytes(stateDefinitions.slice(0));
            for (var i = 0; i < stateDefinitions.length; i++) {
                var def = stateDefinitions[i];
                stateByteIndex[def.name] = def;
            }
            initialized = true;
        },

        addState: function (name, size, initialVal) {
            stateDefinitions.push({
                name: name,
                size: size,
                initialVal: initialVal
            })
        },

        addAction: function(name, fn, validator) {
            if (validator) fn.valid = validator;
            executor.actions[name] = fn;
        },

        exec: executor.exec,

        createState: function() {
            return State(stateBytes.length, stateByteIndex);
        },

        pack: function(bytes) {
            var chars = [];
            for(var i = 0, n = bytes.length; i < n;) {
                chars.push(((bytes[i++] & 0xff) << 8) | (bytes[i++] & 0xff));
            }
            return String.fromCharCode.apply(null, chars);
        },

        unpack: function(str) {
            var bytes = [];
            for(var i = 0, n = str.length; i < n; i++) {
                var char = str.charCodeAt(i);
                bytes.push(char >>> 8, char & 0xFF);
            }
            return bytes;
        }
    };

    return game;
};

function bits(byte) {

}

function pack(bytes) {

}

function unpack(str) {
    var bytes = [];
    for(var i = 0, n = str.length; i < n; i++) {
        var char = str.charCodeAt(i);
        bytes.push(char >>> 8, char & 0xFF);
    }
    return bytes;
}


function defineStateBytes(defs) {
    var bytes = [];
    while (defs.length) {
        var byte = [];
        var space = 8;
        do {
            var max = 0;
            var best = null;
            var index = 0;
            for (var i = 0; i < defs.length; i++) {
                var def = defs[i];
                if (space - def.size >= 0 && def.size > max) {
                    index = i;
                    best = def;
                    max = def.size;
                }
            }
            if (best) {
                best.byte = bytes.length;
                best.offset = 8 - space;
                best.mask = powerBytes[best.size] << best.offset;
                byte.push(best);
                defs.splice(index, 1);
                space -= best.size;
            }
        } while(best && space > 0 && defs.length);
        bytes.push(byte);
    }
    return bytes;
}
