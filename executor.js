
module.exports = exports = function() {
    var executor = {

        actions: {},

        exec: function(name, state, cb) {
            var action = executor.actions[name];
            if (!action) return cb(null, false);
            if (action.valid && !action.valid(state)) return cb(null, false);
            action(state, cb);
        }
    };

    return executor;
};