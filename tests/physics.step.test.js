import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHASE, createState, step } from '../public/physics.js';

function playingState(ball, paddle) {
  const s = createState();
  s.phase = PHASE.PLAYING;
  Object.assign(s.ball, ball);
  if (paddle) Object.assign(s.paddle, paddle);
  return s;
}

test('step: top üst duvara çarpınca yansır (vy işareti değişir)', () => {
  const s = playingState({ x: 240, y: 12, vx: 0, vy: -200 });
  step(s, 1 / 60);
  assert.ok(s.ball.vy > 0);
});

test('step: top sol duvara çarpınca yansır (vx işareti değişir)', () => {
  const s = playingState({ x: 12, y: 300, vx: -200, vy: 0 });
  step(s, 1 / 60);
  assert.ok(s.ball.vx > 0);
});

test('step: paddleye merkeze çarpma düşük yatay hız, kenara çarpma daha dik açı verir', () => {
  const sCenter = playingState({ x: 240, y: 596, vx: 0, vy: 200 });
  step(sCenter, 1 / 1000);
  const centerVx = Math.abs(sCenter.ball.vx);

  const sEdge = playingState({ x: 210, y: 596, vx: 0, vy: 200 });
  step(sEdge, 1 / 1000);
  assert.ok(Math.abs(sEdge.ball.vx) > centerVx);
});

test('step: top paddle altından kaçarsa can azalır ve serve fazına döner', () => {
  const s = playingState({ x: 240, y: 639, vx: 0, vy: 300 });
  const before = s.lives;
  step(s, 1 / 10);
  assert.equal(s.lives, before - 1);
  assert.equal(s.phase, PHASE.SERVE);
});

test('step: can 0a düşerse over fazına geçer', () => {
  const s = playingState({ x: 240, y: 639, vx: 0, vy: 300 });
  s.lives = 1;
  step(s, 1 / 10);
  assert.equal(s.phase, PHASE.OVER);
});

test('step: alt-adımlı hareket yüksek hızda bile duvarı delip geçmez (tünelleme önlemi)', () => {
  const s = playingState({ x: 240, y: 20, vx: 0, vy: -1000 });
  step(s, 1 / 10);
  assert.ok(s.ball.y >= s.world.wall + s.ball.r - 0.01);
});

test('step: playing degilse (serve) hicbir sey yapmaz', () => {
  const s = createState();
  const before = { ...s.ball };
  step(s, 1 / 60);
  assert.deepEqual(s.ball, before);
});
