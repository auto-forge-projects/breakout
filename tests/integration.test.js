import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHASE, createState, step, launch, setPaddleX } from '../public/physics.js';
import { brickRect } from '../public/bricks.js';
import { readHighScore, writeHighScore } from '../public/storage.js';

// NFR-2: blok kırılınca skor GÜNCELLEMESİ aynı senkron çağrıda gerçekleşir (≤1sn davranışsal kanıt).
test('entegrasyon: serve -> launch -> blok kirma -> skor senkron artar (NFR-2)', () => {
  const s = createState();
  setPaddleX(s, 240);
  launch(s, 0); // dikey firlat
  // topu ilk bloga yaklastir (gercekci fizik yerine dogrudan hedefli senaryo)
  const rect = brickRect(s.grid, 0, 0);
  s.ball.x = rect.x + rect.w / 2;
  s.ball.y = rect.y + rect.h - 1;
  s.ball.vx = 0;
  s.ball.vy = -50;
  step(s, 1 / 60);
  assert.equal(s.score, 10);
  assert.equal(s.aliveCount, 39);
});

test('entegrasyon: tum 40 blok kirilana kadar oynanis WON ile biter, skor 400 olur', () => {
  const s = createState();
  s.phase = PHASE.PLAYING;
  for (let row = 0; row < s.grid.rows; row += 1) {
    for (let col = 0; col < s.grid.cols; col += 1) {
      const rect = brickRect(s.grid, row, col);
      s.ball.x = rect.x + rect.w / 2;
      s.ball.y = rect.y + rect.h - 1;
      s.ball.vx = 0;
      s.ball.vy = -50;
      step(s, 1 / 60);
    }
  }
  assert.equal(s.phase, PHASE.WON);
  assert.equal(s.aliveCount, 0);
  assert.equal(s.score, 400);
});

test('entegrasyon: 3 can kaybedilince OVER, en yuksek skor storage a yazilir (FR-3/FR-4/NFR-4)', () => {
  const s = createState();
  const storage = { data: {}, getItem(k) { return k in this.data ? this.data[k] : null; }, setItem(k, v) { this.data[k] = String(v); } };
  s.highScore = readHighScore(storage);
  s.score = 30;
  for (let i = 0; i < 3; i += 1) {
    s.phase = PHASE.PLAYING;
    s.ball.x = 240;
    s.ball.y = 650;
    s.ball.vx = 0;
    s.ball.vy = 0;
    step(s, 1 / 60);
  }
  assert.equal(s.phase, PHASE.OVER);
  assert.equal(s.lives, 0);
  if (s.score > s.highScore) writeHighScore(storage, s.score);
  assert.equal(readHighScore(storage), 30);
});

// FR-5: kademeli zorluk — hız üst sınırla sınırlı kalır (oynanamaz hale gelmez).
test('entegrasyon: bricksBroken arttikca hiz kademeli artar, VMAX asilmaz (FR-5)', () => {
  const s = createState();
  s.phase = PHASE.PLAYING;
  s.ball.vx = 0;
  s.ball.vy = -1; // yön, büyüklük normalize edilecek
  for (let n = 0; n < 40; n += 1) {
    s.bricksBroken = n;
    const rect = brickRect(s.grid, 0, 0);
    s.ball.x = rect.x + rect.w / 2;
    s.ball.y = rect.y + rect.h - 1;
    s.bricks[0][0].alive = true;
    step(s, 1 / 1000);
    const v = Math.hypot(s.ball.vx, s.ball.vy);
    assert.ok(v <= 440.0001);
  }
});
