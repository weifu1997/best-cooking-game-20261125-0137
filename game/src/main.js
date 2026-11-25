// Ember Kitchen — boot and game loop: title, playing, paused, game over.
// Own code, written for this bounty: a wok-fire cooking rush in a 2D canvas.

import { VIEW_W, VIEW_H, SHIFT_SECONDS, MAX_HEARTS } from './config.js';
import { mulberry32 } from './random.js';
import { createInput } from './input.js';
import { createOrders } from './orders.js';
import { createChef } from './chef.js';
import { createAudio } from './audio.js';
import { drawGame } from './render.js';
import { applyShot } from './shots.js';

// Surface load errors in the document title so a headless screenshot run can
// report them; players never see this.
window.addEventListener('error', (event) => {
  document.title = `GAME ERROR: ${event.message}`;
});

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  canvas.style.width = `${VIEW_W * scale}px`;
  canvas.style.height = `${VIEW_H * scale}px`;
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '7');

const input = createInput(canvas);
const audio = createAudio();
const rng = mulberry32(seed);

const game = {
  phase: 'title',
  time: 0,
  timeLeft: SHIFT_SECONDS,
  coins: 0,
  hearts: MAX_HEARTS,
  combo: 0,
  bestCombo: 0,
  served: 0,
  chef: createChef(),
  orders: createOrders(rng),
};

function resetShift() {
  game.phase = 'playing';
  game.time = 0;
  game.timeLeft = SHIFT_SECONDS;
  game.coins = 0;
  game.hearts = MAX_HEARTS;
  game.combo = 0;
  game.bestCombo = 0;
  game.served = 0;
  game.chef = createChef();
  game.orders = createOrders(mulberry32((Math.random() * 1e9) | 0));
}

function applyEvents(events) {
  for (const e of events) {
    if (e.type === 'served') {
      const bonus = game.combo >= 1 ? game.combo : 0;
      game.coins += e.coins + bonus;
      game.combo += 1;
      game.bestCombo = Math.max(game.bestCombo, game.combo);
      game.served += 1;
    } else if (e.type === 'serve-miss') {
      game.combo = 0;
    }
  }
}

function update(dt) {
  game.time += dt;
  if (game.phase === 'title') {
    if (input.anyKey || input.usePressed) {
      audio.unlock();
      resetShift();
    }
    return;
  }
  if (game.phase === 'over') {
    if (input.keys.has('r')) resetShift();
    return;
  }
  if (game.phase === 'paused') {
    if (input.keys.has('p')) {
      game.phase = 'playing';
      input.keys.delete('p'); // edge-triggered: one press, one toggle
    }
    return;
  }
  if (input.keys.has('p')) {
    game.phase = 'paused';
    input.keys.delete('p');
    return;
  }
  if (input.keys.has('m')) {
    const muted = audio.toggleMute();
    game.chef.say(muted ? 'Sound off' : 'Sound on');
    input.keys.delete('m');
  }

  game.timeLeft -= dt;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.phase = 'over';
    return;
  }
  const expired = game.orders.update(dt, game.served);
  if (expired.length > 0) {
    game.hearts -= expired.length;
    game.combo = 0;
    game.chef.say('An order walked out — heart lost!', 2.5);
    audio.fail();
    if (game.hearts <= 0) {
      game.hearts = 0;
      game.phase = 'over';
      return;
    }
  }
  const events = game.chef.update(dt, input, game.orders, audio);
  applyEvents(events);
  // A low patience ticket ticks its last seconds.
  for (const t of game.orders.tickets) {
    if (t.patience < 5 && Math.floor(t.patience * 2) !== Math.floor((t.patience + dt) * 2)) {
      audio.tick();
    }
  }
}

// Screenshot scenes run the loop but freeze the clock, so the frame the
// browser captures is the staged moment, not a later one.
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shot) update(dt);
  drawGame(ctx, game);
  input.endFrame();
  requestAnimationFrame(frame);
}

if (shot) {
  applyShot(game, shot, seed);
  // Let one frame of orders settle, then hold the scene still.
  update(0);
} else {
  game.phase = 'title';
}
requestAnimationFrame(frame);
