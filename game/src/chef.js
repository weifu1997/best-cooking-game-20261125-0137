// Ember Kitchen — the chef: walking, carrying a tray, chopping at the board,
// cooking in the wok, plating at the counter, serving at the window.

import {
  INGREDIENTS, MAX_TRAY, CHOP_SECONDS, WOK_SECONDS, WOK_BURN_AFTER,
  choppedOf, cookedOf, baseOf, stateOf, recipeForItems,
} from './config.js';
import { moveCircle, nearestStation } from './kitchen.js';

const SPEED = 260;
const RADIUS = 22;

function isChoppable(item) {
  return stateOf(item) === 'raw' && INGREDIENTS[baseOf(item)].choppable;
}
function isCookable(item) {
  const base = baseOf(item);
  if (item === 'noodles') return true;
  if (item === 'chicken-chopped') return true;
  return false;
}

export function createChef() {
  const chef = {
    pos: { x: 640, y: 560 },
    facing: { x: 0, y: 1 },
    moving: false,
    tray: [], // ingredient ids, up to MAX_TRAY
    plate: null, // recipe id once a dish is plated
    chop: null, // { item, progress }
    wok: null, // { item, progress, dinged }
    moveTarget: null,
    pendingStation: null,
    hint: '',
    hintUntil: 0,
    shake: 0,
    popups: [], // { x, y, text, color, life }
    time: 0,
  };

  function say(text, seconds = 2) {
    chef.hint = text;
    chef.hintUntil = chef.time + seconds;
  }
  function popup(text, color = '#f2c14e') {
    chef.popups.push({ x: chef.pos.x, y: chef.pos.y - 66, text, color, life: 1.4 });
  }

  // One use of a station. Returns events for the game: { type, ... }.
  function useStation(station, orders, audio) {
    const events = [];
    if (!station) return events;
    if (chef.plate && station.kind !== 'serve' && station.kind !== 'trash') {
      say('Hands full — serve the plate first!');
      return events;
    }
    if (station.kind === 'supply') {
      if (chef.tray.length >= MAX_TRAY) {
        say('Tray is full — chop, cook or plate first');
        audio.fail();
        return events;
      }
      chef.tray.push(station.item);
      audio.pickup();
      events.push({ type: 'pickup', item: station.item });
      return events;
    }
    if (station.kind === 'board') {
      const i = chef.tray.findIndex(isChoppable);
      if (i < 0) {
        say('Nothing to chop — bring raw veg or chicken');
        return events;
      }
      if (!chef.chop) {
        chef.chop = { item: chef.tray[i], progress: 0 };
        audio.chop();
      }
      return events;
    }
    if (station.kind === 'wok') {
      if (!chef.wok) {
        const i = chef.tray.findIndex(isCookable);
        if (i < 0) {
          say('The wok takes noodles or chopped chicken');
          return events;
        }
        chef.wok = { item: chef.tray.splice(i, 1)[0], progress: 0, dinged: false };
        audio.wokIn();
        events.push({ type: 'wok-in', item: chef.wok.item });
        return events;
      }
      if (chef.wok.progress < WOK_SECONDS) {
        say('Still sizzling…');
        return events;
      }
      if (chef.tray.length >= MAX_TRAY) {
        say('Tray is full — make room first');
        return events;
      }
      const done = chef.wok.progress < WOK_SECONDS + WOK_BURN_AFTER;
      const item = done ? cookedOf(chef.wok.item) : `${chef.wok.item}-burnt`;
      chef.tray.push(item);
      chef.wok = null;
      audio.pickup();
      events.push({ type: 'wok-out', item, burnt: !done });
      return events;
    }
    if (station.kind === 'plate') {
      if (chef.tray.length === 0) {
        say('Bring ingredients to plate a dish');
        return events;
      }
      const recipe = recipeForItems(chef.tray);
      if (!recipe) {
        say('No recipe matches this tray — check the board');
        audio.fail();
        return events;
      }
      chef.plate = recipe.id;
      chef.tray = [];
      audio.done();
      popup(recipe.name, recipe.color);
      events.push({ type: 'plated', recipe: recipe.id });
      return events;
    }
    if (station.kind === 'serve') {
      if (!chef.plate) {
        say('Bring a plated dish to the window');
        return events;
      }
      const paid = orders.serveDish(chef.plate);
      if (!paid) {
        chef.shake = 0.4;
        say('No order wants this dish right now');
        audio.fail();
        events.push({ type: 'serve-miss' });
        return events;
      }
      chef.plate = null;
      audio.serve();
      popup(`+$${paid.coins}`, '#f2c14e');
      events.push({ type: 'served', ...paid });
      return events;
    }
    if (station.kind === 'trash') {
      if (chef.tray.length === 0 && !chef.plate) {
        say('Nothing to throw away');
        return events;
      }
      chef.tray = [];
      chef.plate = null;
      audio.fail();
      events.push({ type: 'trashed' });
      return events;
    }
    return events;
  }

  chef.update = function update(dt, input, orders, audio) {
    chef.time += dt;
    const events = [];
    input.pollMove();

    // Keyboard movement cancels a click destination.
    if (input.moveX !== 0 || input.moveY !== 0) chef.moveTarget = null;

    let dx = input.moveX;
    let dy = input.moveY;
    if (dx === 0 && dy === 0 && chef.moveTarget) {
      const tx = chef.moveTarget.x - chef.pos.x;
      const ty = chef.moveTarget.y - chef.pos.y;
      const d = Math.hypot(tx, ty);
      if (d < 8) {
        chef.moveTarget = null;
        if (chef.pendingStation) {
          const station = chef.pendingStation;
          chef.pendingStation = null;
          if (nearestStation(chef.pos)) events.push(...useStation(station, orders, audio));
        }
      } else {
        dx = tx / d;
        dy = ty / d;
      }
    }
    if (dx !== 0 || dy !== 0) {
      chef.facing = { x: dx, y: dy };
      chef.moving = true;
      moveCircle(chef.pos, RADIUS, dx * SPEED * dt, dy * SPEED * dt);
      // Walking away from the board cancels a chop in progress.
      if (chef.chop && nearestStation(chef.pos)?.id !== 'board') chef.chop = null;
    } else {
      chef.moving = false;
    }

    // Click: walk to the point, or to a station the player tapped.
    if (input.click) {
      const p = input.click;
      const station = nearestStation(p, 60);
      if (station) {
        chef.moveTarget = {
          x: Math.max(60, Math.min(1220, p.x)),
          y: Math.max(230, Math.min(760, p.y)),
        };
        chef.pendingStation = station;
      } else {
        chef.moveTarget = { x: p.x, y: Math.max(230, p.y) };
        chef.pendingStation = null;
      }
    }

    // Use key / click on a nearby station.
    if (input.usePressed && !input.click) {
      const station = nearestStation(chef.pos);
      if (station) {
        audio.unlock();
        events.push(...useStation(station, orders, audio));
      }
    }

    // Chopping finishes on its own once started.
    if (chef.chop) {
      const near = nearestStation(chef.pos);
      if (!near || near.id !== 'board') {
        chef.chop = null;
      } else {
        chef.chop.progress += dt;
        if (chef.chop.progress >= CHOP_SECONDS) {
          const i = chef.tray.indexOf(chef.chop.item);
          if (i >= 0) chef.tray[i] = choppedOf(chef.chop.item);
          audio.done();
          popup('Chopped!', '#58b368');
          events.push({ type: 'chopped', item: chef.chop.item });
          chef.chop = null;
        }
      }
    }

    // The wok cooks on its own; it dings once when done.
    if (chef.wok) {
      chef.wok.progress += dt;
      if (!chef.wok.dinged && chef.wok.progress >= WOK_SECONDS) {
        chef.wok.dinged = true;
        audio.done();
        popup('Wok ready!', '#f2c14e');
      }
    }

    if (chef.shake > 0) chef.shake -= dt;
    for (const p of chef.popups) {
      p.life -= dt;
      p.y -= 24 * dt;
    }
    chef.popups = chef.popups.filter((p) => p.life > 0);
    if (chef.hint && chef.time > chef.hintUntil) chef.hint = '';
    return events;
  };

  chef.nearStation = function nearStation() {
    return nearestStation(chef.pos);
  };
  chef.say = say;
  chef.popup = popup;
  return chef;
}
