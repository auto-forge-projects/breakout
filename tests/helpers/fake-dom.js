// Minimal elle yazılmış DOM/window taklidi — public/game.js'i düz `node:test` altında test
// etmek için, sıfır bağımlılık (jsdom/canvas yok, SEC-6/NFR-3).

export class FakeElement {
  constructor() {
    this.hidden = false;
    this._text = '';
    this._listeners = new Map();
  }
  set textContent(v) {
    this._text = String(v);
  }
  get textContent() {
    return this._text;
  }
  addEventListener(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(fn);
  }
  dispatchEvent(evt) {
    const set = this._listeners.get(evt.type);
    if (set) for (const fn of set) fn(evt);
  }
}

function fakeContext2d() {
  return {
    imageSmoothingEnabled: true,
    fillStyle: '#000',
    font: '',
    textAlign: 'left',
    clearRect() {},
    fillRect() {},
    fillText() {},
  };
}

export class FakeCanvas extends FakeElement {
  constructor(width = 480, height = 640) {
    super();
    this.width = width;
    this.height = height;
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.width, height: this.height };
  }
  getContext() {
    return fakeContext2d();
  }
}

export function fakeLocalStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    _data: data,
  };
}

export function createFakeWindow() {
  const listeners = new Map();
  let nextId = 1;
  const pending = new Map();
  return {
    localStorage: fakeLocalStorage(),
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    dispatchEvent(evt) {
      const set = listeners.get(evt.type);
      if (set) for (const fn of set) fn(evt);
    },
    requestAnimationFrame(cb) {
      const id = nextId++;
      pending.set(id, cb);
      return id;
    },
    cancelAnimationFrame(id) {
      pending.delete(id);
    },
    // Test yardımcısı (gerçek window API'si değil): kuyruktaki tek bir rAF callback'i çalıştırır.
    __tick(ts = 0) {
      const entries = Array.from(pending.entries());
      pending.clear();
      for (const [, cb] of entries) cb(ts);
    },
  };
}

export function createFakeDoc(elements) {
  return {
    getElementById(id) {
      return elements[id];
    },
  };
}
