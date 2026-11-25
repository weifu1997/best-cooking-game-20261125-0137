// Ember Kitchen — shared constants: recipes, ingredients, colours, layout.
// A wok-fire cooking rush: take orders, chop, wok, plate, serve before patience runs out.

export const VIEW_W = 1280;
export const VIEW_H = 800;

export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_TRAY = 3;
export const MAX_TICKETS = 4;

// Ingredient ids. A suffix marks the state: raw -> chopped -> cooked.
export const INGREDIENTS = {
  noodles: { name: 'Noodles', color: '#f2c14e', cookable: true, choppable: false },
  veg: { name: 'Veg', color: '#58b368', cookable: false, choppable: true },
  chicken: { name: 'Chicken', color: '#e08a4c', cookable: false, choppable: true },
  sauce: { name: 'Sauce', color: '#d94f3d', cookable: false, choppable: false },
};

export function choppedOf(id) { return `${id}-chopped`; }
export function cookedOf(id) { return `${id}-cooked`; }
export function baseOf(item) { return item.replace(/-(chopped|cooked)$/, ''); }
export function stateOf(item) {
  if (item.endsWith('-chopped')) return 'chopped';
  if (item.endsWith('-cooked')) return 'cooked';
  return 'raw';
}
export function displayName(item) {
  const base = INGREDIENTS[baseOf(item)];
  const state = stateOf(item);
  if (state === 'raw') return base.name;
  if (state === 'chopped') return `Chopped ${base.name}`;
  return `Wok ${base.name}`;
}

// Recipes: the exact set of items a plate must hold. Order matters not.
export const RECIPES = [
  {
    id: 'golden-noodles',
    name: 'Golden Noodle Bowl',
    items: ['noodles-cooked', 'veg-chopped', 'sauce'],
    price: 10,
    color: '#f2c14e',
  },
  {
    id: 'ember-chicken',
    name: 'Ember Chicken Stir-Fry',
    items: ['chicken-cooked', 'veg-chopped', 'sauce'],
    price: 12,
    color: '#e08a4c',
  },
  {
    id: 'crispy-chicken',
    name: 'Crispy Chicken Plate',
    items: ['chicken-cooked', 'sauce'],
    price: 8,
    color: '#d94f3d',
  },
];

export function recipeForItems(items) {
  const have = [...items].sort().join('|');
  return RECIPES.find((r) => [...r.items].sort().join('|') === have) ?? null;
}

// Kitchen layout: stations the chef walks between. x/y/w/h in view pixels.
export const STATIONS = [
  { id: 'noodles', kind: 'supply', label: 'Noodle Bin', item: 'noodles', x: 16, y: 206, w: 168, h: 92 },
  { id: 'veg', kind: 'supply', label: 'Veg Crate', item: 'veg', x: 16, y: 314, w: 168, h: 92 },
  { id: 'chicken', kind: 'supply', label: 'Chicken Fridge', item: 'chicken', x: 16, y: 422, w: 168, h: 92 },
  { id: 'sauce', kind: 'supply', label: 'Sauce Shelf', item: 'sauce', x: 16, y: 530, w: 168, h: 92 },
  { id: 'board', kind: 'board', label: 'Chopping Board', x: 1096, y: 206, w: 168, h: 92 },
  { id: 'wok', kind: 'wok', label: 'Wok Station', x: 1096, y: 314, w: 168, h: 108 },
  { id: 'plate', kind: 'plate', label: 'Plating Counter', x: 1096, y: 438, w: 168, h: 92 },
  { id: 'serve', kind: 'serve', label: 'Serving Window', x: 1096, y: 546, w: 168, h: 108 },
  { id: 'trash', kind: 'trash', label: 'Bin', x: 16, y: 668, w: 168, h: 76 },
];

// Centre island counter: decoration and an obstacle, not a station.
export const ISLAND = { x: 520, y: 400, w: 240, h: 96 };

export const CHOP_SECONDS = 1.2;
export const WOK_SECONDS = 4;
export const WOK_BURN_AFTER = 4; // seconds past done before the dish burns
export const TICKET_PATIENCE = 50;

export const COLORS = {
  floor: '#3a2a1e',
  floorTile: '#433325',
  wall: '#241a12',
  hud: '#1d130c',
  cream: '#f6ead2',
  gold: '#f2c14e',
  red: '#d94f3d',
  green: '#58b368',
  ink: '#241a12',
  muted: '#b9a586',
};
