import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHASE, createState, step } from '../public/physics.js';
import { brickRect } from '../public/bricks.js';

test('createState: grid ile 40 canlı blok oluşturur (aliveCount=40)', () => {
  const s = createState();
  assert.equal(s.aliveCount, s.grid.rows * s.grid.cols);
  assert.equal(s.aliveCount, 40);
});

test('step: bloğa çarpınca skor+10 artar, blok kırılır, yön değişir', () => {
  const s = createState();
  s.phase = PHASE.PLAYING;
  const rect = brickRect(s.grid, 0, 0);
  s.ball.x = rect.x + rect.w / 2;
  s.ball.y = rect.y + rect.h - 1;
  s.ball.vx = 0;
  s.ball.vy = -50;
  step(s, 1 / 60);
  assert.equal(s.score, 10);
  assert.equal(s.bricksBroken, 1);
  assert.equal(s.aliveCount, 39);
  assert.equal(s.bricks[0][0].alive, false);
});

test('step: tüm bloklar kırılınca WON fazına geçer', () => {
  const s = createState();
  s.phase = PHASE.PLAYING;
  for (const row of s.bricks) for (const b of row) b.alive = false;
  s.aliveCount = 1;
  const lastRow = s.grid.rows - 1;
  const lastCol = s.grid.cols - 1;
  s.bricks[lastRow][lastCol].alive = true;
  const rect = brickRect(s.grid, lastRow, lastCol);
  s.ball.x = rect.x + rect.w / 2;
  s.ball.y = rect.y + rect.h - 1;
  s.ball.vx = 0;
  s.ball.vy = -50;
  step(s, 1 / 60);
  assert.equal(s.phase, PHASE.WON);
  assert.equal(s.aliveCount, 0);
});
