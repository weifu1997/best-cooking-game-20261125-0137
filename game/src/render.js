// Ember Kitchen — every pixel: the kitchen, the chef, the order board, the HUD,
// title and game-over screens. All art is drawn with canvas shapes; no images.

import {
  VIEW_W, VIEW_H, STATIONS, ISLAND, COLORS, RECIPES,
  INGREDIENTS, baseOf, stateOf, displayName,
} from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

// One ingredient, drawn as a little food icon. r is the icon radius.
export function drawIngredient(ctx, item, x, y, r) {
  const base = baseOf(item);
  const state = stateOf(item);
  const color = INGREDIENTS[base].color;
  ctx.save();
  ctx.translate(x, y);
  if (state === 'cooked') {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.4, -r * 0.4);
      ctx.quadraticCurveTo(i * r * 0.4 + 4, -r * 0.9, i * r * 0.4, -r * 1.3);
      ctx.stroke();
    }
  }
  if (item.endsWith('-burnt')) {
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.2, r * 0.3, 0, Math.PI * 2);
    ctx.arc(r * 0.3, r * 0.2, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (base === 'noodles') {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, r * 0.28);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.35 + i * 0.28), Math.PI * 0.15, Math.PI * 1.5);
      ctx.stroke();
    }
  } else if (base === 'veg') {
    ctx.fillStyle = color;
    const n = state === 'chopped' ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.4;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, r * (state === 'chopped' ? 0.3 : 0.45), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#2f7a3d';
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (base === 'chicken') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.62, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6d9b8';
    ctx.beginPath();
    ctx.ellipse(r * 0.35, -r * 0.15, r * 0.4, r * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    if (state === 'chopped') {
      ctx.strokeStyle = '#8a4b1f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.3);
      ctx.lineTo(r * 0.4, r * 0.3);
      ctx.moveTo(r * 0.4, -r * 0.3);
      ctx.lineTo(-r * 0.4, r * 0.3);
      ctx.stroke();
    }
  } else if (base === 'sauce') {
    ctx.fillStyle = color;
    rr(ctx, -r * 0.45, -r * 0.5, r * 0.9, r * 1.1, r * 0.2);
    ctx.fill();
    ctx.fillStyle = '#7a1f14';
    rr(ctx, -r * 0.22, -r * 1.05, r * 0.44, r * 0.6, r * 0.1);
    ctx.fill();
    ctx.fillStyle = COLORS.cream;
    ctx.font = `bold ${Math.round(r * 0.7)}px Verdana, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 0, r * 0.15);
  }
  ctx.restore();
}

function drawStation(ctx, s, near, game) {
  const isNear = near && near.id === s.id;
  ctx.save();
  if (isNear) {
    ctx.shadowColor = COLORS.gold;
    ctx.shadowBlur = 18;
  }
  ctx.fillStyle = s.kind === 'serve' ? '#5a3a22' : '#4a3423';
  rr(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = isNear ? COLORS.gold : '#6b4e33';
  ctx.lineWidth = isNear ? 3 : 2;
  ctx.stroke();
  ctx.restore();

  text(ctx, s.label, s.x + s.w / 2, s.y + 16, 15, COLORS.cream, 'bold', 'center');
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2 + 10;
  if (s.kind === 'supply') {
    drawIngredient(ctx, s.item, cx - 28, cy, 20);
    drawIngredient(ctx, s.item, cx + 8, cy + 4, 16);
    drawIngredient(ctx, s.item, cx + 34, cy - 6, 13);
  } else if (s.kind === 'board') {
    ctx.fillStyle = '#c9a06a';
    rr(ctx, cx - 52, cy - 18, 104, 36, 6);
    ctx.fill();
    drawIngredient(ctx, 'veg-chopped', cx - 20, cy, 13);
    drawIngredient(ctx, 'chicken-chopped', cx + 22, cy, 13);
    if (game.chef.chop) {
      const p = game.chef.chop.progress / 1.2;
      ctx.strokeStyle = COLORS.gold;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, 34, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
      ctx.stroke();
    }
  } else if (s.kind === 'wok') {
    const wok = game.chef.wok;
    ctx.fillStyle = '#1c1c22';
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 42, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 42, 0, Math.PI);
    ctx.stroke();
    if (wok) {
      drawIngredient(ctx, wok.item, cx, cy - 6, 20);
      const p = Math.min(1, wok.progress / 4);
      ctx.strokeStyle = wok.progress >= 8 ? '#d94f3d' : COLORS.gold;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 50, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
      ctx.stroke();
      if (wok.progress >= 4 && wok.progress < 8) text(ctx, 'READY!', cx, cy - 44, 14, COLORS.gold, 'bold', 'center');
      if (wok.progress >= 8) text(ctx, 'BURNT!', cx, cy - 44, 14, COLORS.red, 'bold', 'center');
    } else {
      ctx.fillStyle = '#e8862e';
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy + 26);
      ctx.quadraticCurveTo(cx, cy + 2, cx + 26, cy + 26);
      ctx.quadraticCurveTo(cx, cy + 14, cx - 26, cy + 26);
      ctx.fill();
    }
  } else if (s.kind === 'plate') {
    ctx.fillStyle = '#e8e2d4';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 46, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b9a586';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (s.kind === 'serve') {
    ctx.fillStyle = '#f6ead2';
    rr(ctx, cx - 58, cy - 14, 116, 30, 6);
    ctx.fill();
    ctx.fillStyle = '#8a6a45';
    ctx.beginPath();
    ctx.arc(cx + 44, cy - 18, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(cx + 44, cy - 18, 5, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, 'RING THE BELL', cx, cy + 26, 11, COLORS.muted, 'bold', 'center');
  } else if (s.kind === 'trash') {
    ctx.fillStyle = '#3c3c44';
    rr(ctx, cx - 26, cy - 16, 52, 40, 6);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (isNear) text(ctx, '[E] USE', cx, s.y + s.h + 16, 13, COLORS.gold, 'bold', 'center');
}

function drawTicket(ctx, t, x, y, w, h) {
  const ratio = Math.max(0, t.patience / t.maxPatience);
  const urgent = ratio < 0.3;
  ctx.save();
  if (urgent && Math.floor(t.age * 4) % 2 === 0) {
    ctx.shadowColor = COLORS.red;
    ctx.shadowBlur = 14;
  }
  ctx.fillStyle = '#f6ead2';
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = t.recipe.color;
  rr(ctx, x, y, 10, h, 8);
  ctx.fill();
  ctx.restore();
  text(ctx, `#${t.id} ${t.recipe.name}`, x + 20, y + 20, 15, COLORS.ink, 'bold');
  text(ctx, `$${t.recipe.price} + tip`, x + w - 12, y + 20, 13, '#7a5a2e', 'bold', 'right');
  let ix = x + 20;
  for (const item of t.recipe.items) {
    drawIngredient(ctx, item, ix + 12, y + 52, 13);
    ix += 34;
  }
  // Patience bar.
  ctx.fillStyle = '#d8cbb2';
  rr(ctx, x + 20, y + h - 20, w - 40, 10, 5);
  ctx.fill();
  ctx.fillStyle = urgent ? COLORS.red : ratio < 0.6 ? '#e8a13c' : COLORS.green;
  if (ratio > 0) {
    rr(ctx, x + 20, y + h - 20, (w - 40) * ratio, 10, 5);
    ctx.fill();
  }
}

function drawChef(ctx, chef, time) {
  const bob = chef.moving ? Math.sin(time * 14) * 3 : 0;
  const shakeX = chef.shake > 0 ? Math.sin(time * 50) * 4 : 0;
  ctx.save();
  ctx.translate(chef.pos.x + shakeX, chef.pos.y + bob);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body (apron) and head.
  ctx.fillStyle = '#f6ead2';
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d94f3d';
  rr(ctx, -14, 8, 28, 16, 6);
  ctx.fill();
  // Face.
  ctx.fillStyle = '#241a12';
  const fx = chef.facing.x * 4;
  const fy = chef.facing.y * 3;
  ctx.beginPath();
  ctx.arc(-6 + fx, -3 + fy, 2.4, 0, Math.PI * 2);
  ctx.arc(6 + fx, -3 + fy, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#241a12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(fx, 4 + fy, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Toque.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-10, -16, 9, 0, Math.PI * 2);
  ctx.arc(0, -20, 10, 0, Math.PI * 2);
  ctx.arc(10, -16, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-13, -18, 26, 7);
  // Tray items above the head, or the plated dish.
  if (chef.plate) {
    const recipe = RECIPES.find((r) => r.id === chef.plate);
    ctx.fillStyle = '#e8e2d4';
    ctx.beginPath();
    ctx.ellipse(0, -34, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    if (recipe) {
      drawIngredient(ctx, recipe.items[0], -8, -38, 8);
      drawIngredient(ctx, recipe.items[1], 8, -38, 8);
    }
  } else if (chef.tray.length > 0) {
    chef.tray.forEach((item, i) => {
      drawIngredient(ctx, item, (i - (chef.tray.length - 1) / 2) * 26, -36, 11);
    });
  }
  // Chop progress ring.
  if (chef.chop) {
    const p = chef.chop.progress / 1.2;
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 30, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
    ctx.stroke();
    text(ctx, 'CHOP!', 0, -44, 13, COLORS.gold, 'bold', 'center');
  }
  ctx.restore();
  // Floating popups.
  for (const p of chef.popups) {
    ctx.globalAlpha = Math.max(0, p.life);
    text(ctx, p.text, p.x, p.y, 20, p.color, 'bold', 'center');
    ctx.globalAlpha = 1;
  }
}

export function drawGame(ctx, game) {
  const { chef, orders, time } = game;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Floor tiles.
  ctx.fillStyle = COLORS.floorTile;
  for (let y = 200; y < VIEW_H; y += 64) {
    for (let x = ((y / 64) % 2) * 32; x < VIEW_W; x += 64) {
      ctx.fillRect(x, y, 60, 60);
    }
  }
  // Top wall and HUD band.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, VIEW_W, 190);
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(0, 0, VIEW_W, 56);

  // HUD: title, shift timer, coins, hearts, combo.
  text(ctx, 'EMBER KITCHEN', 20, 30, 24, COLORS.gold, 'bold');
  const timeLeft = Math.max(0, game.timeLeft);
  const mm = Math.floor(timeLeft / 60);
  const ss = String(Math.floor(timeLeft % 60)).padStart(2, '0');
  const timeColor = timeLeft < 30 ? COLORS.red : COLORS.cream;
  text(ctx, `⏱ ${mm}:${ss}`, 330, 30, 22, timeColor, 'bold');
  ctx.fillStyle = '#3a2a1e';
  rr(ctx, 430, 18, 220, 22, 11);
  ctx.fill();
  ctx.fillStyle = timeLeft < 30 ? COLORS.red : COLORS.gold;
  rr(ctx, 430, 18, 220 * (timeLeft / 150), 22, 11);
  ctx.fill();
  text(ctx, `💰 $${game.coins}`, 700, 30, 22, COLORS.gold, 'bold');
  text(ctx, '♥'.repeat(game.hearts) + '♡'.repeat(3 - game.hearts), 830, 30, 22, COLORS.red, 'bold');
  if (game.combo >= 2) text(ctx, `COMBO ×${game.combo}`, 960, 30, 20, '#ff9d5c', 'bold');
  text(ctx, `Served ${game.served}`, 1120, 30, 18, COLORS.cream, 'bold');

  // Order board.
  text(ctx, 'ORDER BOARD', 20, 76, 15, COLORS.muted, 'bold');
  text(ctx, 'Recipes: Noodle Bowl = wok noodles + chopped veg + sauce  •  Stir-Fry = wok chicken + chopped veg + sauce  •  Crispy Chicken = wok chicken + sauce', 170, 76, 13, COLORS.muted, 'normal');
  const tickets = orders.tickets;
  tickets.forEach((t, i) => drawTicket(ctx, t, 20 + i * 310, 92, 296, 92));
  if (tickets.length === 0) {
    ctx.fillStyle = 'rgba(246,234,210,0.5)';
    ctx.font = 'italic 16px Verdana, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('No orders yet — the dinner rush is coming…', 24, 140);
  }

  // Island counter.
  ctx.fillStyle = '#4a3423';
  rr(ctx, ISLAND.x, ISLAND.y, ISLAND.w, ISLAND.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#6b4e33';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawIngredient(ctx, 'veg', ISLAND.x + 50, ISLAND.y + 48, 16);
  drawIngredient(ctx, 'chicken', ISLAND.x + 120, ISLAND.y + 48, 16);
  drawIngredient(ctx, 'sauce', ISLAND.x + 190, ISLAND.y + 48, 16);
  text(ctx, 'PREP COUNTER', ISLAND.x + ISLAND.w / 2, ISLAND.y + 18, 12, COLORS.muted, 'bold', 'center');

  // Stations and chef.
  const near = chef.nearStation();
  for (const s of STATIONS) drawStation(ctx, s, near, game);
  drawChef(ctx, chef, time);

  // Hint and controls.
  if (chef.hint) {
    ctx.fillStyle = 'rgba(29,19,12,0.85)';
    rr(ctx, VIEW_W / 2 - 260, VIEW_H - 46, 520, 30, 15);
    ctx.fill();
    text(ctx, chef.hint, VIEW_W / 2, VIEW_H - 30, 15, COLORS.gold, 'bold', 'center');
  } else {
    text(ctx, 'WASD / arrows to walk  •  E or click to use a station  •  P pause  •  M mute', VIEW_W / 2, VIEW_H - 30, 13, COLORS.muted, 'normal', 'center');
  }
  if (near && !chef.hint) {
    text(ctx, `Near: ${near.label} — press E`, VIEW_W / 2, VIEW_H - 58, 13, COLORS.gold, 'bold', 'center');
  }

  // Title screen.
  if (game.phase === 'title') {
    ctx.fillStyle = 'rgba(20,12,6,0.82)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    text(ctx, '🔥 EMBER KITCHEN 🔥', VIEW_W / 2, 220, 56, COLORS.gold, 'bold', 'center');
    text(ctx, 'A wok-fire cooking rush', VIEW_W / 2, 280, 24, COLORS.cream, 'normal', 'center');
    text(ctx, 'Take orders from the board. Chop veg and chicken, wok the noodles,', VIEW_W / 2, 360, 20, COLORS.cream, 'normal', 'center');
    text(ctx, 'plate the dish, and ring the bell at the serving window — before patience runs out.', VIEW_W / 2, 392, 20, COLORS.cream, 'normal', 'center');
    text(ctx, 'Serve fast for tips. Miss an order and you lose a heart. Three hearts, one shift: 2:30.', VIEW_W / 2, 440, 18, COLORS.muted, 'normal', 'center');
    ctx.fillStyle = COLORS.gold;
    rr(ctx, VIEW_W / 2 - 160, 500, 320, 56, 12);
    ctx.fill();
    text(ctx, 'PRESS ENTER TO START', VIEW_W / 2, 529, 22, COLORS.ink, 'bold', 'center');
    text(ctx, 'WASD / arrows move  •  E use station  •  click also works', VIEW_W / 2, 600, 16, COLORS.muted, 'normal', 'center');
  }

  // Pause overlay.
  if (game.phase === 'paused') {
    ctx.fillStyle = 'rgba(20,12,6,0.7)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    text(ctx, 'PAUSED', VIEW_W / 2, 380, 48, COLORS.cream, 'bold', 'center');
    text(ctx, 'Press P to keep cooking', VIEW_W / 2, 440, 20, COLORS.muted, 'normal', 'center');
  }

  // Game-over screen.
  if (game.phase === 'over') {
    ctx.fillStyle = 'rgba(20,12,6,0.85)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    text(ctx, game.hearts > 0 ? 'SHIFT COMPLETE!' : 'KITCHEN CLOSED', VIEW_W / 2, 240, 48, COLORS.gold, 'bold', 'center');
    text(ctx, `Dishes served: ${game.served}    Coins earned: $${game.coins}    Best combo: ×${game.bestCombo}`, VIEW_W / 2, 320, 22, COLORS.cream, 'normal', 'center');
    const stars = game.served >= 12 ? '★★★' : game.served >= 8 ? '★★☆' : game.served >= 4 ? '★☆☆' : '☆☆☆';
    text(ctx, stars, VIEW_W / 2, 380, 40, COLORS.gold, 'bold', 'center');
    const verdict = game.served >= 12 ? 'Head Chef material!' : game.served >= 8 ? 'A solid shift — the regulars are happy.' : game.served >= 4 ? 'The kitchen survived. Barely.' : 'The rush won this time. Try again!';
    text(ctx, verdict, VIEW_W / 2, 440, 20, COLORS.cream, 'normal', 'center');
    text(ctx, 'Press R to cook another shift', VIEW_W / 2, 520, 18, COLORS.muted, 'normal', 'center');
  }
}
