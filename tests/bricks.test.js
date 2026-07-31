import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVEL, createGrid, brickRect, candidateCells, hitBrick } from '../public/bricks.js';

test('createGrid: LEVEL.rows x LEVEL.cols kadar canlı blok oluşturur', () => {
  const bricks = createGrid(LEVEL);
  assert.equal(bricks.length, LEVEL.rows);
  assert.equal(bricks[0].length, LEVEL.cols);
  for (const row of bricks) for (const b of row) assert.equal(b.alive, true);
});

test('brickRect: satır/kolon indeksinden konum türetir', () => {
  const r00 = brickRect(LEVEL, 0, 0);
  assert.equal(r00.x, LEVEL.offX);
  assert.equal(r00.y, LEVEL.offY);
  assert.equal(r00.w, LEVEL.w);
  assert.equal(r00.h, LEVEL.h);
  const r01 = brickRect(LEVEL, 0, 1);
  assert.equal(r01.x, LEVEL.offX + LEVEL.w + LEVEL.gapX);
});

test('candidateCells: topun konumuna göre birkaç aday hücre döner', () => {
  const cells = candidateCells(LEVEL, { x: LEVEL.offX + 2, y: LEVEL.offY + 2, r: 4 });
  assert.ok(cells.length >= 1 && cells.length <= 4);
  assert.ok(cells.some((c) => c.row === 0 && c.col === 0));
});

test('candidateCells: grid dışındaki top için boş döner', () => {
  const cells = candidateCells(LEVEL, { x: -100, y: -100, r: 4 });
  assert.equal(cells.length, 0);
});

test('hitBrick: canlı bloğa çarpınca alive=false yapar ve eksen bilgisi döner', () => {
  const bricks = createGrid(LEVEL);
  const rect = brickRect(LEVEL, 0, 0);
  const ball = { x: rect.x + rect.w / 2, y: rect.y + rect.h - 1, r: 4 };
  const hit = hitBrick(bricks, LEVEL, ball);
  assert.ok(hit);
  assert.equal(hit.row, 0);
  assert.equal(hit.col, 0);
  assert.equal(bricks[0][0].alive, false);
});

test('hitBrick: ölü bloğa tekrar çarpılmaz (null döner)', () => {
  const bricks = createGrid(LEVEL);
  bricks[0][0].alive = false;
  const rect = brickRect(LEVEL, 0, 0);
  const ball = { x: rect.x + rect.w / 2, y: rect.y + rect.h - 1, r: 4 };
  const hit = hitBrick(bricks, LEVEL, ball);
  assert.equal(hit, null);
});

test('hitBrick: çarpışma yoksa null döner', () => {
  const bricks = createGrid(LEVEL);
  const hit = hitBrick(bricks, LEVEL, { x: 0, y: 0, r: 4 });
  assert.equal(hit, null);
});
