var Game = require('./game');
var utils = require('./utils');

var thousand = 1000;
var million = 1000 * thousand;
var billion = 1000 * million;
var trillion = 1000 * billion;

var maxPlayers = 8;
var maxTotalCash = 250 * trillion;

var g = module.exports = exports = Game();

g.addState('numPlayers', 4);
g.addState('roundStarted', 1);
g.addState('button', 4);
g.addState('lastRaiser', 4);
g.addState('turn', 4);
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

// TODO: make *private* actions
// TODO: need some way of indicating an action requires the authenticated player


g.addAction('deal',
  function () {
    console.log('dealing');

    var roundStarted, flop, turn, river;

    // we collect all of the bets and put them in the pot
    console.log('collecting bets');
    var pot = utils.getInt(this, 'pot', 6);
    for (var i = 0; i < maxPlayers; i++) {
      var playerBet = 'player' + i + 'Bet';
      pot += utils.getInt(this, playerBet, 6);
      utils.setInt(this, playerBet, 0, 6);
    }
    utils.setInt(this, 'pot', pot, 6);

    river = this.get('card4');
    // if river is out, it is the end of a round
    if (river) g.exec('_endRound', this);

    roundStarted = this.get('roundStarted');
    flop = this.get('card0');
    turn = this.get('card3');
    river = this.get('card4');

    if (!roundStarted) g.exec('_startRound', this);
    else if (!flop) g.exec('_dealFlop', this);
    else if (!turn) g.exec('_dealTurn', this);
    else if (!river) g.exec('_dealRiver', this);

  });

g.addAction('_startRound',
  function() {
    console.log('starting round');
    var usedCards = [];

    // mark those that are sitting as playing and deal to players
    for (var i = 0; i < maxPlayers; i++) {
      var player = 'player' + i;
      var sitting = this.get(player + 'Sitting');
      if (sitting) {
        this.set(player + 'Playing', 1);
        this.set(player + 'Card0', drawCard(usedCards));
        this.set(player + 'Card1', drawCard(usedCards));
      }
    }

    setFirstTurn(this);

    // if the current player is not the button advance the button
    this.set('button', this.get('turn'));

    // start round
    this.set('roundStarted', 1);
  });

g.addAction('_dealFlop',
  function() {
    console.log('dealing flop');
    var usedCards = [];

    // find the used cards in players hands
    for (var i = 0; i < maxPlayers; i++) {
      var player = 'player' + i;
      usedCards.push(this.get(player + 'Card0'));
      usedCards.push(this.get(player + 'Card1'));
    }

    // set the flop
    this.set('card0', drawCard(usedCards));
    this.set('card1', drawCard(usedCards));
    this.set('card2', drawCard(usedCards));

    setFirstTurn(this);
  });

g.addAction('_dealTurn',
  function() {
    console.log('dealing turn');
    var usedCards = [];

    // find the used cards in players hands
    for (var i = 0; i < maxPlayers; i++) {
      var player = 'player' + i;
      usedCards.push(this.get(player + 'Card0'));
      usedCards.push(this.get(player + 'Card1'));
    }

    // find the used cards in the flop
    usedCards.push(this.get('card0'));
    usedCards.push(this.get('card1'));
    usedCards.push(this.get('card2'));

    // set the turn
    this.set('card3', drawCard(usedCards));

    setFirstTurn(this);
  });

g.addAction('_dealRiver',
  function() {
    console.log('dealing river');
    var usedCards = [];

    // find the used cards in players hands
    for (var i = 0; i < maxPlayers; i++) {
      var player = 'player' + i;
      usedCards.push(this.get(player + 'Card0'));
      usedCards.push(this.get(player + 'Card1'));
    }

    // find the used cards in the flop
    usedCards.push(this.get('card0'));
    usedCards.push(this.get('card1'));
    usedCards.push(this.get('card2'));

    // find the used turn card
    usedCards.push(this.get('card3'));

    this.set('card4', drawCard(usedCards));

    setFirstTurn(this);
  });

g.addAction('_endRound',
  function() {
    console.log('ending round');

    var i, player;

    // get winners

    var community_cards = [
      cardMap[this.get('card0')],
      cardMap[this.get('card1')],
      cardMap[this.get('card2')],
      cardMap[this.get('card3')],
      cardMap[this.get('card4')]
    ];

    var players = [];

    for (i = 0; i < maxPlayers; i++) {
      player = 'player' + i;
      if (this.get(player + 'Playing')) {
        players.push({
          position: i,
          cards: [
            cardMap[this.get(player + 'Card0')],
            cardMap[this.get(player + 'Card1')]
          ]
        });
      }
    }

    var winners = findWinners(community_cards, players);

    // award pot

    var pot = utils.getInt(this, 'pot', 6);
    var prize = Math.floor(pot / winners.length);
    winners.forEach(function (winner) {
      var playerWallet = 'player' + winner.position;
      var wallet = utils.getInt(this, playerWallet, 6) + prize;
      utils.setInt(this, playerWallet, wallet, 6);
    });

    // reset pot

    utils.setInt(this, 'pot', 0, 6);

    // reset cards

    this.set('card0', 0);
    this.set('card1', 0);
    this.set('card2', 0);
    this.set('card3', 0);
    this.set('card4', 0);
    for (i = 0; i < maxPlayers; i++) {
      player = 'player' + i;
      this.set(player + 'Card0', 0);
      this.set(player + 'Card1', 0);
    }

    // start round

    this.set('roundStarted', 0);
  });

g.addAction('join',
  function (player) {
    // when a player joins we

    // increment the number of players
    this.set('numPlayers', this.get('numPlayers') + 1);

    // mark the position as occupied
    var occupied = 'player' + player.position + 'Occupied';
    this.set(occupied, 1);

    // set the player's wallet
    utils.setInt(this, 'player' + player.position + 'Wallet', player.wallet, 6);
  },
  function (player) {
    // a player may join at a given position at a table if
    // the table does not already have the max number of players
    // the position is not currently occupied
    // the player's wallet is not larger than the max
    var occupied = 'player' + player.position + 'Occupied';

    var pot = utils.getInt(this, 'pot', 6);
    var wallets = 0;
    var bets = 0;
    for (var i = 0; i < maxPlayers; i++) {
      var playerI = 'player' + i;
      wallets += utils.getInt(this, playerI + 'Wallet', 6);
      bets += utils.getInt(this, playerI + 'Bet', 6);
    }

    var totalCash = pot + wallets + bets + player.wallet;

    return this.get('numPlayers') < maxPlayers && !this.get(occupied) && totalCash <= maxTotalCash;
  });

// a player may sit at any time
g.addAction('sit',
  function (player) {
    var sitting = 'player' + player.position + 'Sitting';
    this.set(sitting, 1);
  });

// a player may stand at any time
// the stand will not take effect until the next round
g.addAction('stand',
  function (player) {
    var sitting = 'player' + player.position + 'Sitting';
    this.set(sitting, 0);
  });

g.addAction('check',
  function (player) {
    // when a player checks

    // it is the next playing player's turn
    advanceTurn(this, player.position);
  },
  function (player) {
    // a player may check if
    // the round has started
    // it is that player's turn
    // there are other playing players
    // the player doesn't need to bet
    // a player needs to bet if the previous playing player's bet is larger than his or her own
    if (!this.get('roundStarted')) return false;
    if (this.get('turn') != player.position) return false;
    var position = getPrevPlayingPlayerPosition(this, player.position);
    if (position == player.position) return false;
    var theirBet = utils.getInt(this, 'player' + position + 'Bet', 6);
    var myBet = utils.getInt(this, 'player' + player.position + 'Bet', 6);
    return myBet >= theirBet;
  });

g.addAction('fold',
  function (player) {
    // when a player folds

    // they are no longer playing
    var playing = 'player' + player.position + 'Playing';
    this.set(playing, 0);

    // their bet goes to the pot
    var pot = utils.getInt(this, 'pot', 6);
    var playerBet = 'player' + player.position + 'Bet';
    pot += utils.getInt(this, playerBet, 6);
    utils.setInt(this, playerBet, 0, 6);
    utils.setInt(this, 'pot', pot, 6);

    // it is the next playing player's turn
    advanceTurn(this, player.position);
  },
  function (player) {
    // a player may fold if
    // the round has started
    // it is that player's turn
    // there are other playing players
    // the player does need to bet
    // a player needs to bet if the previous playing player's bet is larger than his or her own
    if (!this.get('roundStarted')) return false;
    if (this.get('turn') != player.position) return false;
    var position = getPrevPlayingPlayerPosition(this, player.position);
    if (position == player.position) return false;
    var theirBet = utils.getInt(this, 'player' + position + 'Bet', 6);
    var myBet = utils.getInt(this, 'player' + player.position + 'Bet', 6);
    return theirBet > myBet;
  });

g.addAction('bet',
  function (player, amount) {
    // when a player bets

    var position = getPrevPlayingPlayerPosition(this, player.position);
    var prevBet = utils.getInt(this, 'player' + position + 'Bet', 6);

    // update their bet
    var bet = utils.getInt(this, 'player' + player.position + 'Bet', 6) + amount;
    utils.setInt(this, 'player' + player.position + 'Bet', bet, 6);

    // update wallet
    var wallet = utils.getInt(this, 'player' + player.position + 'Wallet', 6) - amount;
    utils.setInt(this, 'player' + player.position + 'Wallet', wallet, 6);

    // if raising, set last raiser
    if (bet > prevBet) this.set('lastRaiser', player.position);

    // it is the next playing player's turn
    advanceTurn(this, player.position);
  },
  function (player, amount) {
    // a player may bet if
    // the round has started
    // it is that player's turn
    // they are not the last raiser
    // there are other playing players
    // the total bet is greater than or equal to the previous playing player's bet
    // they have enough in their wallet
    if (!this.get('roundStarted')) return false;
    if (this.get('turn') != player.position) return false;
    if (this.get('lastRaiser') == player.position) return false;
    var position = getPrevPlayingPlayerPosition(this, player.position);
    if (position == player.position) return false;
    var theirBet = utils.getInt(this, 'player' + position + 'Bet', 6);
    var myBet = utils.getInt(this, 'player' + player.position + 'Bet', 6) + amount;
    var wallet = utils.getInt(this, 'player' + player.position + 'Wallet', 6);
    return wallet >= amount && myBet >= theirBet;
  });


function setFirstTurn(state) {
  var position = state.get('button');
  position = getPrevPlayingPlayerPosition(state, position);
  position = getNextPlayingPlayerPosition(state, position);
  state.set('turn', position);
}

function advanceTurn(state, position) {
  position = getNextPlayingPlayerPosition(state, position);

  if (state.get('lastRaiser') == position) g.exec('deal', state);
  else state.set('turn', position);
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

function findWinners(community_cards, players) {
  var hands = [];
  players.forEach(function (player) {
    var best_hand = findBestHand(community_cards.concat(player.cards));
    best_hand.position = player.position;
    hands.push(best_hand);
  });
  hands = hands.sort(byBestHandDesc);
  var winners = [hands.shift()];
  var next = hands.shift();
  while (next && byBestHandDesc(winners[0], next) === 0) {
    winners.push(next);
    next = hands.shift();
  }
  return winners;
}

function findBestHand(cards) {
  var combos = [
    [0, 1, 2, 3, 4],
    [0, 1, 2, 3, 5],
    [0, 1, 2, 3, 6],
    [0, 1, 2, 4, 5],
    [0, 1, 2, 4, 6],
    [0, 1, 2, 5, 6],
    [0, 1, 3, 4, 5],
    [0, 1, 3, 4, 6],
    [0, 1, 3, 5, 6],
    [0, 1, 4, 5, 6],
    [0, 2, 3, 4, 5],
    [0, 2, 3, 4, 6],
    [0, 2, 3, 5, 6],
    [0, 2, 4, 5, 6],
    [0, 3, 4, 5, 6],
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 6],
    [1, 2, 3, 5, 6],
    [1, 2, 4, 5, 6],
    [1, 3, 4, 5, 6],
    [2, 3, 4, 5, 6]
  ];

  var best_hand = null;

  combos.forEach(function (combo) {
    var hand = [
      cards[combo[0]],
      cards[combo[1]],
      cards[combo[2]],
      cards[combo[3]],
      cards[combo[4]]
    ];
    var this_hand = score(hand);

    if (!best_hand) {
      best_hand = this_hand;
      return;
    }

    if (byBestHandDesc(best_hand, this_hand) > 0) {
      best_hand = this_hand;
    }
  });

  return best_hand;

}

// Straight Flush:    [5]
// Four of a Kind:    [4, 1]
// Full House:        [3, 2]
// Flush:             [3, 1, 1, 2]
// Straight:          [3, 1, 1, 1]
// Three of a Kind:   [3, 1, 1]
// Two Pair:          [2, 2, 1]
// One Pair:          [2, 1, 1, 1]
// High card:         [1]

function score(hand) {
  var ranks = '__23456789TJQKA';
  var rank_counts = {};
  var score_rank_tuples = [];
  var o = {score: [], ranks: []};
  hand.forEach(function (card) {
    var rank = ranks.indexOf(card[0]);
    if (!rank_counts[rank]) rank_counts[rank] = 0;
    rank_counts[rank]++
  });
  for (var k in rank_counts) {
    if (rank_counts.hasOwnProperty(k)) {
      score_rank_tuples.push([rank_counts[k], +k]);
    }
  }
  score_rank_tuples = score_rank_tuples.sort(byDeepSortDesc);
  score_rank_tuples.forEach(function (score_rank) {
    o.score.push(score_rank[0]);
    o.ranks.push(score_rank[1]);
  });
  if (o.score.length === 5) {
    if (o.ranks[0] === 14 && o.ranks[1] === 5) { // adjust rank of 'A' for 5 high straight
      o.ranks = [5, 4, 3, 2, 1]
    }
    var straight = o.ranks[0] - o.ranks[4] === 4;
    var flush = true;
    var suit = hand[0][1];
    hand.forEach(function (card) {
      flush &= card[1] === suit;
    });
    o.score = [[[1], [3, 1, 1, 1]], [[3, 1, 1, 2], [5]]][+flush][+straight]
  }
  return o
}

function byBestHandDesc(a, b) {
  var score_comparison = byDeepSortDesc(a.score, b.score);
  var rank_comparison = byDeepSortDesc(a.ranks, b.ranks);

  if (score_comparison === 0 && rank_comparison === 0)
    return 0;
  if (score_comparison > 0 || (score_comparison === 0 && rank_comparison > 0))
    return 1;
  if (score_comparison < 0 || (score_comparison === 0 && rank_comparison < 0))
    return -1;
}

function byDeepSortDesc(a, b) {
  var i;
  var l = Math.max(a.length, b.length);
  for (i = 0; i < l; i++) {
    var valA = (a[i] || 0);
    var valB = (b[i] || 0);
    if (valA == valB) continue;
    return valB - valA;
  }
  return 0;
}

function drawCard(usedCards) {
  do {
    var card = Math.floor(Math.random * 52) + 1;
  } while (!!~usedCards.indexOf(card));
  usedCards.push(card);
  return card;
}

var cardMap = {
  1: '2S',
  2: '3S',
  3: '4S',
  4: '5S',
  5: '6S',
  6: '7S',
  7: '8S',
  8: '9S',
  9: 'TS',
  10: 'JS',
  11: 'QS',
  12: 'KS',
  13: 'AS',

  14: '2H',
  15: '3H',
  16: '4H',
  17: '5H',
  18: '6H',
  19: '7H',
  20: '8H',
  21: '9H',
  22: 'TH',
  23: 'JH',
  24: 'QH',
  25: 'KH',
  26: 'AH',

  27: '2C',
  28: '3C',
  29: '4C',
  30: '5C',
  31: '6C',
  32: '7C',
  33: '8C',
  34: '9C',
  35: 'TC',
  36: 'JC',
  37: 'QC',
  38: 'KC',
  39: 'AC',

  40: '2D',
  41: '3D',
  42: '4D',
  43: '5D',
  44: '6D',
  45: '7D',
  46: '8D',
  47: '9D',
  48: 'TD',
  49: 'JD',
  50: 'QD',
  51: 'KD',
  52: 'AD'
};
