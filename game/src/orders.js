// Ember Kitchen — the order board: tickets spawn, lose patience, and pay out
// when the matching dish is served. Recipes come from config.js.

import { RECIPES, TICKET_PATIENCE, MAX_TICKETS } from './config.js';
import { pick } from './random.js';

export function createOrders(rng) {
  const tickets = [];
  let nextId = 1;
  let spawnIn = 3; // first ticket arrives a few seconds into the shift
  let spawnGap = 14;

  function spawn() {
    if (tickets.length >= MAX_TICKETS) return;
    const recipe = pick(rng, RECIPES);
    tickets.push({
      id: nextId++,
      recipe,
      patience: TICKET_PATIENCE,
      maxPatience: TICKET_PATIENCE,
      age: 0,
    });
  }

  return {
    tickets,
    // Returns 'expired' ticket ids that ran out of patience this tick.
    update(dt, servedCount) {
      const expired = [];
      spawnIn -= dt;
      if (spawnIn <= 0) {
        spawn();
        // The rush builds: orders arrive faster as the shift goes on.
        spawnGap = Math.max(9, 14 - servedCount * 0.6);
        spawnIn = spawnGap;
      }
      for (const t of tickets) {
        t.patience -= dt;
        t.age += dt;
        if (t.patience <= 0) expired.push(t.id);
      }
      for (const id of expired) {
        const i = tickets.findIndex((t) => t.id === id);
        if (i >= 0) tickets.splice(i, 1);
      }
      return expired;
    },
    // Serve the ticket matching this dish, if any. Pays base price plus a tip
    // for patience left. Returns the payout or null when nothing matches.
    serveDish(dishId) {
      const i = tickets.findIndex((t) => t.recipe.id === dishId);
      if (i < 0) return null;
      const t = tickets[i];
      tickets.splice(i, 1);
      const tip = Math.round((t.patience / t.maxPatience) * 5);
      return { coins: t.recipe.price + tip, tip, name: t.recipe.name };
    },
    hasDish(dishId) {
      return tickets.some((t) => t.recipe.id === dishId);
    },
    addTicket(recipeId) {
      const recipe = RECIPES.find((r) => r.id === recipeId);
      if (!recipe || tickets.length >= MAX_TICKETS) return false;
      tickets.push({ id: nextId++, recipe, patience: TICKET_PATIENCE, maxPatience: TICKET_PATIENCE, age: 0 });
      return true;
    },
  };
}
