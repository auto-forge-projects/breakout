// I/O adaptörü — canvas render, girdi, HUD/overlay. Oyun kuralı bilmez (docs/05-architecture.md).
import { PHASE, createState, step, setPaddleX, movePaddle, launch } from './physics.js';
import { brickRect } from './bricks.js';
import { readHighScore, writeHighScore } from './storage.js';

const BRICK_COLORS = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a'];

export function pointFromEvent(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

export function createGame({ canvas, scoreEl, highScoreEl, livesEl, overlayEl, overlayMsgEl, restartBtn, win, storage }) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  let state = createState();
  state.highScore = readHighScore(storage);
  let rafId = null;
  let lastTs = null;
  const keys = { left: false, right: false };

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < state.grid.rows; row += 1) {
      for (let col = 0; col < state.grid.cols; col += 1) {
        const brick = state.bricks[row][col];
        if (!brick.alive) continue;
        const rect = brickRect(state.grid, row, col);
        ctx.fillStyle = BRICK_COLORS[row % BRICK_COLORS.length];
        ctx.fillRect(Math.round(rect.x), Math.round(rect.y), rect.w, rect.h);
      }
    }

    ctx.fillStyle = '#f1faee';
    ctx.fillRect(Math.round(state.paddle.x), Math.round(state.paddle.y), state.paddle.w, state.paddle.h);
    ctx.fillRect(
      Math.round(state.ball.x - state.ball.r),
      Math.round(state.ball.y - state.ball.r),
      state.ball.r * 2,
      state.ball.r * 2,
    );

    scoreEl.textContent = `SKOR: ${state.score}`;
    highScoreEl.textContent = `EN YÜKSEK: ${state.highScore}`;
    livesEl.textContent = `CAN: ${state.lives}`;
  }

  function finish(message) {
    if (state.score > state.highScore) {
      state.highScore = state.score;
      writeHighScore(storage, state.highScore);
    }
    overlayEl.hidden = false;
    overlayMsgEl.textContent = `${message} — SKOR: ${state.score}`;
  }

  function serve() {
    if (state.phase === PHASE.SERVE) launch(state, 1);
  }

  function loop(ts) {
    const dt = lastTs == null ? 1 / 60 : Math.min((ts - lastTs) / 1000, 1 / 30);
    lastTs = ts;
    if (keys.left) movePaddle(state, -1, dt);
    if (keys.right) movePaddle(state, 1, dt);
    step(state, dt);
    render();
    if (state.phase === PHASE.WON) {
      finish('KAZANDIN');
      return;
    }
    if (state.phase === PHASE.OVER) {
      finish('OYUN BİTTİ');
      return;
    }
    rafId = win.requestAnimationFrame(loop);
  }

  function reset() {
    state = createState();
    state.highScore = readHighScore(storage);
    overlayEl.hidden = true;
    lastTs = null;
    if (rafId != null) win.cancelAnimationFrame(rafId);
    rafId = win.requestAnimationFrame(loop);
  }

  canvas.addEventListener('mousemove', (evt) => {
    const p = pointFromEvent(canvas, evt);
    setPaddleX(state, p.x);
  });
  canvas.addEventListener('mousedown', serve);

  win.addEventListener('keydown', (evt) => {
    if (evt.code === 'ArrowLeft') keys.left = true;
    else if (evt.code === 'ArrowRight') keys.right = true;
    else if (evt.code === 'Space') {
      if (evt.preventDefault) evt.preventDefault();
      serve();
    }
  });
  win.addEventListener('keyup', (evt) => {
    if (evt.code === 'ArrowLeft') keys.left = false;
    else if (evt.code === 'ArrowRight') keys.right = false;
  });

  restartBtn.addEventListener('click', reset);

  rafId = win.requestAnimationFrame(loop);

  return { getState: () => state, reset };
}

export function boot(doc, win) {
  return createGame({
    canvas: doc.getElementById('game'),
    scoreEl: doc.getElementById('score'),
    highScoreEl: doc.getElementById('highscore'),
    livesEl: doc.getElementById('lives'),
    overlayEl: doc.getElementById('overlay'),
    overlayMsgEl: doc.getElementById('overlay-message'),
    restartBtn: doc.getElementById('restart'),
    win,
    storage: win.localStorage,
  });
}

/* c8 ignore next 3 */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  boot(document, window);
}
