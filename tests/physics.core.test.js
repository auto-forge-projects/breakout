import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHASE, createState, setPaddleX, movePaddle, launch, speedFor } from '../public/physics.js';

test('createState: başlangıç değerleri (serve fazı, 3 can, skor 0)', () => {
  const s = createState();
  assert.equal(s.phase, PHASE.SERVE);
  assert.equal(s.lives, 3);
  assert.equal(s.score, 0);
  assert.equal(s.bricksBroken, 0);
  assert.ok(s.paddle && s.ball && s.world);
});

test('setPaddleX: paddle imleç x konumuna gider, duvar içinde clamp edilir', () => {
  const s = createState();
  setPaddleX(s, 240);
  assert.equal(s.paddle.x, 240 - s.paddle.w / 2);
  setPaddleX(s, -1000);
  assert.equal(s.paddle.x, s.world.wall);
  setPaddleX(s, 10000);
  assert.equal(s.paddle.x, s.world.w - s.world.wall - s.paddle.w);
});

test('movePaddle: klavye ile sabit hızla hareket eder, duvarı aşmaz', () => {
  const s = createState();
  const x0 = s.paddle.x;
  movePaddle(s, 1, 0.1);
  assert.ok(s.paddle.x > x0);
  movePaddle(s, -1, 10); // büyük dt → sol duvara tosluyor
  assert.equal(s.paddle.x, s.world.wall);
});

test('launch: yalnız serve fazındayken topu fırlatır, hız speedFor(0)a eşit', () => {
  const s = createState();
  launch(s, 1);
  assert.equal(s.phase, PHASE.PLAYING);
  const v = Math.hypot(s.ball.vx, s.ball.vy);
  assert.ok(Math.abs(v - speedFor(0)) < 1e-6);
});

test('launch: playing fazındayken tekrar çağrılırsa etkisizdir', () => {
  const s = createState();
  launch(s, 1);
  const vx = s.ball.vx;
  launch(s, -1);
  assert.equal(s.ball.vx, vx);
});

test('speedFor: kademeli artış, üst sınırla sınırlı', () => {
  assert.equal(speedFor(0), 260);
  assert.ok(speedFor(5) > speedFor(0));
  assert.ok(speedFor(1000) <= 440);
});
