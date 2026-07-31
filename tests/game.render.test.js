import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../public/game.js';
import { FakeCanvas, FakeElement, createFakeWindow } from './helpers/fake-dom.js';

function setup() {
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
    storage: win.localStorage,
  });
  return { canvas, scoreEl, highScoreEl, livesEl, overlayEl, overlayMsgEl, restartBtn, win, game };
}

test('createGame: ilk karede HUD başlangıç değerlerini gösterir', () => {
  const { scoreEl, highScoreEl, livesEl, win } = setup();
  win.__tick(0);
  assert.equal(scoreEl.textContent, 'SKOR: 0');
  assert.equal(livesEl.textContent, 'CAN: 3');
  assert.match(highScoreEl.textContent, /EN YÜKSEK/);
});

test('createGame: her karede bir sonraki rAF planlanır (döngü sürer)', () => {
  const { win } = setup();
  win.__tick(0);
  assert.doesNotThrow(() => win.__tick(16));
});

test('createGame: getState() gecerli bir oyun state dondurur', () => {
  const { game } = setup();
  const s = game.getState();
  assert.ok(s.paddle && s.ball && s.grid);
});
