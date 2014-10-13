var Game = require('./game.js');

var thousand = 1000;
var million = 1000 * thousand;
var billion = 1000 * million;
var trillion = 1000 * billion;

var maxPlayers = 8;
var maxWallet = 250 * trillion;
var maxBet = 250 * trillion;
var maxPot = 250 * trillion;

var g = Game();

g.addState('numPlayers', 4);
g.addState('pot0', 8);
g.addState('pot1', 8);
g.addState('pot2', 8);
g.addState('pot3', 8);
g.addState('pot4', 8);
g.addState('pot5', 8);
g.addState('card0', 6);
g.addState('card1', 6);
g.addState('card2', 6);
g.addState('card3', 6);
g.addState('card4', 6);


for (var i = 0; i < maxPlayers; i++) {
    var player = 'player' + i;
    g.addState(player + 'Playing', 1);
    g.addState(player + 'Turn', 1);
    g.addState(player + 'Card0', 6);
    g.addState(player + 'Card1', 6);
    g.addState(player + 'Wallet0', 8);
    g.addState(player + 'Wallet1', 8);
    g.addState(player + 'Wallet2', 8);
    g.addState(player + 'Wallet3', 8);
    g.addState(player + 'Wallet4', 8);
    g.addState(player + 'Wallet5', 8);
    g.addState(player + 'Bet0', 8);
    g.addState(player + 'Bet1', 8);
    g.addState(player + 'Bet2', 8);
    g.addState(player + 'Bet3', 8);
    g.addState(player + 'Bet4', 8);
    g.addState(player + 'Bet5', 8);
}


g.init();

var s = g.createState();
console.log('num bytes:', s.bytes.length);
console.log('bytes before:', s.bytes);
console.log('bytes packed:', pack(s.bytes));
console.log('bytes after', unpack(pack(s.bytes)));


function bits(byte) {
    var pad = '00000000';
    byte = byte.toString('2');
    return pad.substring(0, pad.length - byte.length) + byte;
}

function pack(bytes) {
    var chars = [];
    for(var i = 0, n = bytes.length; i < n;) {
        chars.push(((bytes[i++] & 0xff) << 8) | (bytes[i++] & 0xff));
    }
    return String.fromCharCode.apply(null, chars);
}

function unpack(str) {
    var bytes = [];
    for(var i = 0, n = str.length; i < n; i++) {
        var char = str.charCodeAt(i);
        bytes.push(char >>> 8, char & 0xFF);
    }
    return bytes;
}