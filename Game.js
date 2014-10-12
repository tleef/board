var Executor = require('./executor.js');

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

        exec: executor.exec
    };

    return game;
};


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
                byte.push(best);
                defs.splice(index, 1);
                space -= best.size;
            }
        } while(best && space > 0 && defs.length);
        bytes.push(byte);
    }
    return bytes;
}
