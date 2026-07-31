// Saf/enjekte edilebilir kalıcılık sınırı — tek localStorage erişim noktası (docs/05-architecture.md).
import { LEVEL } from './bricks.js';

const KEY = 'breakout.highscore.v1';
const SCORE_MAX = LEVEL.rows * LEVEL.cols * 10;

// SEC-8: bozuk/enjekte/aralık-dışı değere karşı güvenli okuma.
export function readHighScore(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (raw === null) return 0;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > SCORE_MAX) return 0;
    return n;
  } catch {
    return 0;
  }
}

// SEC-9: her zaman geçerli tamsayı aralığına clamp'ler, erişim hatasında sessizce yok sayar.
export function writeHighScore(storage, score) {
  const n = Math.max(0, Math.min(SCORE_MAX, Math.trunc(Number(score) || 0)));
  try {
    storage.setItem(KEY, String(n));
  } catch {
    // depo erişilemez (gizli mod/kota) — oyun düşmez, yalnız kalıcılık kaybolur.
  }
}
