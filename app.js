var Game = require('./game.js');

var g = Game();
g.addState('one', 4);
g.addState('two', 3);
g.addState('three', 3);
g.addState('four', 4);
g.init();
