// Ember Kitchen — keyboard and mouse input: WASD/arrows to walk, E/Space to
// use a station, click to walk somewhere or use the station next to the chef.

export function createInput(canvas) {
  const keys = new Set();
  const state = {
    keys,
    moveX: 0,
    moveY: 0,
    // True for one frame when the player presses the use key or clicks.
    usePressed: false,
    click: null, // {x, y} in view pixels, consumed by the game loop
    anyKey: false,
  };

  function viewPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 800,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (event.repeat) return;
    keys.add(event.key.toLowerCase());
    state.anyKey = true;
    if (event.key === 'e' || event.key === 'E' || event.key === ' ') state.usePressed = true;
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  canvas.addEventListener('mousedown', (event) => {
    state.click = viewPoint(event);
    state.usePressed = true;
    state.anyKey = true;
  });
  window.addEventListener('blur', () => keys.clear());

  state.pollMove = function pollMove() {
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');
    const up = keys.has('w') || keys.has('arrowup');
    const down = keys.has('s') || keys.has('arrowdown');
    let x = (right ? 1 : 0) - (left ? 1 : 0);
    let y = (down ? 1 : 0) - (up ? 1 : 0);
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    state.moveX = x;
    state.moveY = y;
  };

  state.endFrame = function endFrame() {
    state.usePressed = false;
    state.click = null;
    state.anyKey = false;
  };

  return state;
}
