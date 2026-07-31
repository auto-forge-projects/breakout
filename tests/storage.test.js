import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readHighScore, writeHighScore } from '../public/storage.js';

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    _data: data,
  };
}

test('readHighScore: kayıt yoksa 0 döner', () => {
  const s = fakeStorage();
  assert.equal(readHighScore(s), 0);
});

test('readHighScore: geçerli tamsayı değeri okur', () => {
  const s = fakeStorage({ 'breakout.highscore.v1': '250' });
  assert.equal(readHighScore(s), 250);
});

test('readHighScore: bozuk/enjekte değer 0a düşer (SEC-8)', () => {
  const s = fakeStorage({ 'breakout.highscore.v1': '<script>alert(1)</script>' });
  assert.equal(readHighScore(s), 0);
});

test('readHighScore: aralık dışı (negatif/aşırı büyük) değer 0a düşer', () => {
  assert.equal(readHighScore(fakeStorage({ 'breakout.highscore.v1': '-5' })), 0);
  assert.equal(readHighScore(fakeStorage({ 'breakout.highscore.v1': '999999' })), 0);
});

test('readHighScore: storage erişilemezse (throw) 0 döner', () => {
  const s = {
    getItem() {
      throw new Error('erişim engellendi');
    },
  };
  assert.equal(readHighScore(s), 0);
});

test('writeHighScore: geçerli skoru yazar', () => {
  const s = fakeStorage();
  writeHighScore(s, 120);
  assert.equal(s._data['breakout.highscore.v1'], '120');
});

test('writeHighScore: aralık dışı değer clamplenir (SEC-9)', () => {
  const s = fakeStorage();
  writeHighScore(s, -10);
  assert.equal(s._data['breakout.highscore.v1'], '0');
});

test('writeHighScore: storage erişilemezse sessizce yok sayar (hata fırlatmaz)', () => {
  const s = {
    setItem() {
      throw new Error('kota aşıldı');
    },
  };
  assert.doesNotThrow(() => writeHighScore(s, 100));
});
