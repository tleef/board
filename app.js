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
    g.addState(player + 'Occupied', 1);
    g.addState(player + 'Sitting', 1);
    g.addState(player + 'Playing', 1);
    g.addState(player + 'Button', 1);
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

g.addAction('deal',
    function() {

    },
    function() {

    });

// need some way of indicating an action requires the authenticated player

g.addAction('join',
    function(player) {
        // when a player joins we

        // increment the number of players
        this.set('numPlayers', this.get('numPlayers') + 1);

        // mark the position as occupied
        var occupied = 'player' + player.position + 'Occupied';
        this.set(occupied, 1);

        // set the player's wallet
        setInt(this, 'player' + player.position + 'Wallet', player.wallet, 6);
    },
    function(player) {
        // a player may join at a given position at a table if
        // the table does not already have the max number of players
        // the position is not currently occupied
        // the player's wallet is not larger than the max
        var occupied = 'player' + player.position + 'Occupied';
        return this.get('numPlayers') < maxPlayers && !this.get(occupied) && player.wallet < maxWallet;
    });

// a player may sit at any time
g.addAction('sit',
    function(player) {
        var sitting = 'player' + player.position + 'Sitting';
        this.set(sitting, 1);
    });

// a player may stand at any time
// the stand will not take effect until the next round
g.addAction('stand',
    function(player) {
        var sitting = 'player' + player.position + 'Sitting';
        this.set(sitting, 0);
    });

g.addAction('check',
    function(player) {
        // when a player checks

        // it is the next playing player's turn
        advanceTurn(this, player.position);
    },
    function(player) {
        // a player may check if
        // it is that player's turn
        // the player doesn't need to bet
        // a player needs to bet is the previous playing player's bet is larger than his or her own
        var position = getPrevPlayingPlayerPosition(this, player.position);
        if (position == player.position) return false;
        var theirBet = getInt(this, 'player' + position + 'Bet', 6);
        var myBet = getInt(this, 'player' + player.position + 'Bet', 6);
        var needToBet = theirBet > myBet;
        var turn = 'player' + player.position + 'Turn';
        return !!this.get(turn) && !needToBet;
    });

g.addAction('bet',
    function(player) {

    },
    function(player) {

    });

g.addAction('fold',
    function(player) {

    },
    function(player) {

    });

var s = g.createState();

function advanceTurn(state, position) {
    var turn = 'player' + position + 'Turn';
    state.set(turn, 0);
    position = getNextPlayingPlayerPosition(position);
    turn = 'player' + position + 'Turn';
    state.set(turn, 1);
}

function getNextPlayingPlayerPosition(state, startingPosition) {
    var position = (startingPosition + 1) % maxPlayers;
    while (position != startingPosition && !state.get('player' + position + 'Playing')) {
        position = (position + 1) % maxPlayers;
    }
    return position;
}

function getPrevPlayingPlayerPosition(state, startingPosition) {
    var position = startingPosition - 1;
    if (position < 0) position = maxPlayers - 1;
    while (position != startingPosition && !state.get('player' + position + 'Playing')) {
        position -= 1;
        if (position < 0) position = maxPlayers - 1;
    }
    return position
}

function getInt(state, name, numBytes) {
    var intBytes = new Uint8Array(numBytes);
    for (var i = 0; i < numBytes; i++) {
        intBytes[i] = state.get(name + i);
    }
    return bytesToInt(intBytes);
}

function setInt(state, name, int, numBytes) {
    var intBytes = intToBytes(int, numBytes);
    for (var i = 0, l = intBytes.length; i < l; i++) {
        state.set(name + i, intBytes[i]);
    }
}

function intToBytes(int, numBytes) {
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
}

function bytesToInt(bytes) {
    var hex = '';
    for (var i = 0, l = bytes.length; i < l; i++) {
        var byteHex = bytes[i].toString(16);
        hex += '00'.substring(0, 2 - byteHex.length) + byteHex;
    }
    return parseInt(hex, 16);
}