// Saf çekirdek — tarayıcı API'si bilmez (docs/05-architecture.md).
export const PHASE = { SERVE: 'serve', PLAYING: 'playing', OVER: 'over', WON: 'won' };

const WORLD = { w: 480, h: 640, wall: 8 };
const PADDLE = { w: 64, h: 12, y: 600, speed: 420 };
const BALL_R = 4;
const LIVES = 3;
const V0 = 260;
const VMAX = 440;
const SPEED_EVERY = 5;
const SPEED_STEP = 0.08;
const LAUNCH_ANGLE = Math.PI / 9; // 20°

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function speedFor(bricksBroken) {
  return Math.min(VMAX, V0 * (1 + Math.floor(bricksBroken / SPEED_EVERY) * SPEED_STEP));
}

function paddleCenterX(paddle) {
  return paddle.x + paddle.w / 2;
}

export function resetBall(state) {
  const cx = paddleCenterX(state.paddle);
  state.ball.x = cx;
  state.ball.y = state.paddle.y - state.ball.r - 1;
  state.ball.vx = 0;
  state.ball.vy = 0;
  state.phase = PHASE.SERVE;
}

export function createState() {
  const paddle = { x: (WORLD.w - PADDLE.w) / 2, y: PADDLE.y, w: PADDLE.w, h: PADDLE.h };
  const state = {
    phase: PHASE.SERVE,
    lives: LIVES,
    score: 0,
    highScore: 0,
    bricksBroken: 0,
    aliveCount: 0,
    world: { ...WORLD },
    paddle,
    ball: { x: 0, y: 0, vx: 0, vy: 0, r: BALL_R },
    grid: null,
    bricks: [],
    events: [],
  };
  resetBall(state);
  return state;
}

export function setPaddleX(state, x) {
  const { world, paddle } = state;
  paddle.x = clamp(x - paddle.w / 2, world.wall, world.w - world.wall - paddle.w);
}

export function movePaddle(state, dir, dt) {
  const { world, paddle } = state;
  paddle.x = clamp(paddle.x + dir * PADDLE.speed * dt, world.wall, world.w - world.wall - paddle.w);
}

export function launch(state, dir = 1) {
  if (state.phase !== PHASE.SERVE) return;
  const angle = LAUNCH_ANGLE * dir;
  const v = speedFor(state.bricksBroken);
  state.ball.vx = v * Math.sin(angle);
  state.ball.vy = -v * Math.cos(angle);
  state.phase = PHASE.PLAYING;
}
