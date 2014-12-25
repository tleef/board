module.exports = exports = function () {
  var executor = {

    actions: {},

    exec: function (name, state) {
      var action = executor.actions[name];
      if (!action) return false;
      var args = Array.prototype.slice.call(arguments, 2);
      if (action.valid && !action.valid.apply(state, args)) return false;
      action.apply(state, args);
      return true;
    }
  };

  return executor;
};