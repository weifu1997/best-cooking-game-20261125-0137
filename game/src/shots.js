// Ember Kitchen — screenshot scenes: ?shot=start|play|serve|rush&seed=N sets up a
// fixed, lively moment of the game so the screenshots show a real, complete
// cooking game: kitchen, order board, ingredients, a dish mid-assembly, a
// timer and a plate ready to serve. Every scene is a real render of the game.

import { mulberry32 } from './random.js';

export function applyShot(game, shot, seed) {
  const rng = mulberry32(seed || 1);
  const { chef, orders } = game;
  game.phase = 'playing';
  game.timeLeft = 118;
  game.coins = 24;
  game.hearts = 3;
  game.served = 3;
  game.combo = 2;
  game.bestCombo = 3;
  orders.tickets.length = 0;

  if (shot === 'start') {
    game.phase = 'title';
    game.timeLeft = 150;
    game.coins = 0;
    game.served = 0;
    game.combo = 0;
    orders.addTicket('golden-noodles');
    orders.addTicket('ember-chicken');
    chef.pos = { x: 640, y: 560 };
    return;
  }

  if (shot === 'play') {
    // Mid-assembly: chef at the wok with noodles in, chopped veg on the tray,
    // two tickets waiting, timer running.
    orders.addTicket('golden-noodles');
    orders.addTicket('ember-chicken');
    chef.pos = { x: 1050, y: 370 };
    chef.facing = { x: 1, y: 0 };
    chef.tray = ['veg-chopped', 'sauce'];
    chef.wok = { item: 'noodles', progress: 2.4, dinged: false };
    return;
  }

  if (shot === 'serve') {
    // Plate ready: chef carries a finished stir-fry to the serving window,
    // coins popping, combo running.
    orders.addTicket('ember-chicken');
    orders.addTicket('crispy-chicken');
    chef.pos = { x: 1050, y: 600 };
    chef.facing = { x: 1, y: 0 };
    chef.plate = 'ember-chicken';
    chef.popup('+$17', '#f2c14e');
    game.coins = 41;
    game.combo = 3;
    return;
  }

  // rush: the dinner rush — four tickets, one nearly out of patience.
  orders.addTicket('golden-noodles');
  orders.addTicket('ember-chicken');
  orders.addTicket('crispy-chicken');
  orders.addTicket('golden-noodles');
  const low = orders.tickets[1];
  if (low) low.patience = 7;
  chef.pos = { x: 640, y: 520 };
  chef.tray = ['chicken-chopped', 'sauce'];
  chef.wok = { item: 'chicken-chopped', progress: 3.6, dinged: false };
  game.timeLeft = 64;
  game.combo = 4;
}
