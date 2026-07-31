import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHASE } from '../public/physics.js';
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
  return { canvas, win, game };
}

test('fare hareketi paddleyi imlec x konumuna tasir (FR-1)', () => {
  const { canvas, game } = setup();
  const before = game.getState().paddle.x;
  canvas.dispatchEvent({ type: 'mousemove', clientX: 300, clientY: 596 });
  assert.notEqual(game.getState().paddle.x, before);
});

test('sol/sag ok tuslari basili tutulunca paddle o yonde hareket eder (FR-1)', () => {
  const { win, game } = setup();
  const x0 = game.getState().paddle.x;
  win.dispatchEvent({ type: 'keydown', code: 'ArrowRight' });
  win.__tick(0);
  win.__tick(16);
  assert.ok(game.getState().paddle.x > x0);
  win.dispatchEvent({ type: 'keyup', code: 'ArrowRight' });
});

test('fare tikla/Space topu serve fazindan playinge firlatir (FR-1/FR-2)', () => {
  const { canvas, game } = setup();
  assert.equal(game.getState().phase, PHASE.SERVE);
  canvas.dispatchEvent({ type: 'mousedown' });
  assert.equal(game.getState().phase, PHASE.PLAYING);
});

test('bilinmeyen tuslar (allowlist disi) hicbir seyi tetiklemez (SEC-12)', () => {
  const { win, game } = setup();
  const before = { ...game.getState().paddle };
  win.dispatchEvent({ type: 'keydown', code: 'KeyA' });
  win.__tick(0);
  assert.deepEqual(game.getState().paddle.x, before.x);
});
