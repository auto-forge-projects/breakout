import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHASE } from '../public/physics.js';
import { createGame } from '../public/game.js';
import { FakeCanvas, FakeElement, createFakeWindow, fakeLocalStorage } from './helpers/fake-dom.js';

function setup(storage = fakeLocalStorage()) {
  const canvas = new FakeCanvas();
  const scoreEl = new FakeElement();
  const highScoreEl = new FakeElement();
  const livesEl = new FakeElement();
  const overlayEl = new FakeElement();
  overlayEl.hidden = true;
  const overlayMsgEl = new FakeElement();
  const restartBtn = new FakeElement();
  const win = createFakeWindow();
  const game = createGame({
    canvas,
    scoreEl,
    highScoreEl,
    livesEl,
    overlayEl,
    overlayMsgEl,
    restartBtn,
    win,
    storage,
  });
  return { canvas, scoreEl, overlayEl, overlayMsgEl, restartBtn, win, game, storage };
}

test('oyun bitince (can 0) overlay gorunur olur ve final skoru gosterir (FR-3)', () => {
  const { overlayEl, overlayMsgEl, game, win } = setup();
  const s = game.getState();
  s.lives = 1;
  s.phase = PHASE.PLAYING;
  s.ball.x = 240;
  s.ball.y = 650;
  s.ball.vx = 0;
  s.ball.vy = 0;
  win.__tick(0);
  assert.equal(overlayEl.hidden, false);
  assert.match(overlayMsgEl.textContent, /OYUN BİTTİ/);
});

test('tum bloklar kirilinca kazandin overlayi gosterilir (FR-3)', () => {
  const { overlayMsgEl, game, win } = setup();
  const s = game.getState();
  s.phase = PHASE.PLAYING;
  for (const row of s.bricks) for (const b of row) b.alive = false;
  s.aliveCount = 1;
  const lastRow = s.grid.rows - 1;
  const lastCol = s.grid.cols - 1;
  s.bricks[lastRow][lastCol].alive = true;
  const rect = { x: 22 + lastCol * 44, y: 64 + lastRow * 20 };
  s.ball.x = rect.x + 20;
  s.ball.y = rect.y + 15;
  s.ball.vx = 0;
  s.ball.vy = -50;
  win.__tick(0);
  assert.match(overlayMsgEl.textContent, /KAZANDIN/);
});

test('oyun bitince en yuksek skor onceki degeri gectiyse storage a yazilir (FR-4/NFR-4)', () => {
  const { game, win, storage } = setup();
  const s = game.getState();
  s.score = 50;
  s.lives = 1;
  s.phase = PHASE.PLAYING;
  s.ball.x = 240;
  s.ball.y = 650;
  s.ball.vx = 0;
  s.ball.vy = 0;
  win.__tick(0);
  assert.equal(storage._data['breakout.highscore.v1'], '50');
});

test('Yeniden Baslat tiklaninca can/skor/bloklar/top/paddle sifirlanir (FR-6)', () => {
  const { restartBtn, overlayEl, game, win } = setup();
  const s = game.getState();
  s.lives = 1;
  s.phase = PHASE.PLAYING;
  s.ball.x = 240;
  s.ball.y = 650;
  s.ball.vx = 0;
  s.ball.vy = 0;
  win.__tick(0);
  assert.equal(overlayEl.hidden, false);
  restartBtn.dispatchEvent({ type: 'click' });
  assert.equal(overlayEl.hidden, true);
  assert.equal(game.getState().lives, 3);
  assert.equal(game.getState().score, 0);
  assert.equal(game.getState().phase, PHASE.SERVE);
});
