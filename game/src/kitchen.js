// Ember Kitchen — the kitchen itself: station rectangles, walls, collision,
// and finding the station the chef stands next to.

import { STATIONS, ISLAND, VIEW_W, VIEW_H } from './config.js';

const WALL_TOP = 190;
const WALL_BOTTOM = VIEW_H - 8;
const WALL_LEFT = 8;
const WALL_RIGHT = VIEW_W - 8;

export function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function solidRects() {
  return [...STATIONS.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h })), { ...ISLAND }];
}

// Move a circle (the chef) against walls and solid rectangles, axis by axis.
export function moveCircle(pos, radius, dx, dy) {
  const solids = solidRects();
  const next = { x: pos.x + dx, y: pos.y + dy };
  const hits = (p) => {
    if (p.x - radius < WALL_LEFT || p.x + radius > WALL_RIGHT) return true;
    if (p.y - radius < WALL_TOP || p.y + radius > WALL_BOTTOM) return true;
    const box = { x: p.x - radius, y: p.y - radius, w: radius * 2, h: radius * 2 };
    return solids.some((r) => rectsOverlap(box, r));
  };
  const stepX = { x: next.x, y: pos.y };
  if (!hits(stepX)) pos.x = next.x;
  const stepY = { x: pos.x, y: next.y };
  if (!hits(stepY)) pos.y = next.y;
  return pos;
}

// The station whose edge is closest to the chef, within reach, or null.
export function nearestStation(pos, reach = 96) {
  let best = null;
  let bestDist = Infinity;
  for (const s of STATIONS) {
    const cx = Math.max(s.x, Math.min(pos.x, s.x + s.w));
    const cy = Math.max(s.y, Math.min(pos.y, s.y + s.h));
    const d = Math.hypot(pos.x - cx, pos.y - cy);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return bestDist <= reach ? best : null;
}
