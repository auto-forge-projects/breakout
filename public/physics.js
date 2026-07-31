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
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60°
const DT_MAX = 1 / 30;
const MAX_STEP_PX = 4;
const SUBSTEP_MAX = 8;

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

function normalizeSpeed(state) {
  const { ball } = state;
  const v = speedFor(state.bricksBroken);
  const mag = Math.hypot(ball.vx, ball.vy) || v;
  const scale = v / mag;
  ball.vx *= scale;
  ball.vy *= scale;
}

function reflectWalls(state) {
  const { world, ball } = state;
  const left = world.wall + ball.r;
  const right = world.w - world.wall - ball.r;
  const top = world.wall + ball.r;
  if (ball.x < left) {
    ball.x = left;
    ball.vx = Math.abs(ball.vx);
    state.events.push('wall');
  } else if (ball.x > right) {
    ball.x = right;
    ball.vx = -Math.abs(ball.vx);
    state.events.push('wall');
  }
  if (ball.y < top) {
    ball.y = top;
    ball.vy = Math.abs(ball.vy);
    state.events.push('wall');
  }
}

function reflectPaddle(state) {
  const { paddle, ball } = state;
  if (ball.vy <= 0) return false;
  const top = paddle.y;
  const withinX = ball.x + ball.r > paddle.x && ball.x - ball.r < paddle.x + paddle.w;
  const withinY = ball.y + ball.r > top && ball.y - ball.r < top + paddle.h;
  if (!withinX || !withinY) return false;
  const cx = paddleCenterX(paddle);
  const off = clamp((ball.x - cx) / (paddle.w / 2), -1, 1);
  const v = speedFor(state.bricksBroken);
  ball.vx = v * Math.sin(off * MAX_BOUNCE_ANGLE);
  ball.vy = -v * Math.cos(off * MAX_BOUNCE_ANGLE);
  ball.y = top - ball.r - 0.01;
  state.events.push('paddle');
  return true;
}

function loseLife(state) {
  state.lives -= 1;
  state.events.push('life');
  if (state.lives <= 0) {
    state.phase = PHASE.OVER;
    state.events.push('over');
  } else {
    resetBall(state);
  }
}

function substep(state, dt) {
  const { ball } = state;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  reflectWalls(state);

  if (!reflectPaddle(state) && state.aliveCount > 0) {
    hitBrickIfAny(state);
  }

  if (ball.y - ball.r > state.world.h) {
    loseLife(state);
  }
}

// bricks.js henüz devrede değilse (TASK-001/002) no-op — TASK-003'te gerçek implementasyona bağlanır.
let hitBrickIfAny = () => {};

export function _setBrickHitHandler(fn) {
  hitBrickIfAny = fn;
}

export function step(state, rawDt) {
  state.events.length = 0;
  if (state.phase !== PHASE.PLAYING) return state;
  const dt = Math.min(rawDt, DT_MAX);
  const v = Math.hypot(state.ball.vx, state.ball.vy) || speedFor(state.bricksBroken);
  const dist = v * dt;
  const n = Math.min(SUBSTEP_MAX, Math.max(1, Math.ceil(dist / MAX_STEP_PX)));
  const subDt = dt / n;
  for (let i = 0; i < n && state.phase === PHASE.PLAYING; i++) {
    substep(state, subDt);
  }
  return state;
}
