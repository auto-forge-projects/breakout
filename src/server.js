import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// SEC-2 — bağımlılık eklemeden elle güvenlik header'ları (helmet yok, sıfır ek bağımlılık ilkesi).
const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; " +
  "connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

export function createServer() {
  const app = express();
  app.disable('x-powered-by'); // SEC-1

  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    next();
  });

  // SEC-4 — gövde parser yok; yalnız GET/HEAD servis edilir.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(404).end();
    next();
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' }); // SEC-5 — sürüm/uptime/env sızdırmaz
  });

  // SEC-3 — sabit kök, dotfile reddi, redirect yok; kullanıcı girdisinden yol kurulmaz.
  app.use(express.static(PUBLIC_DIR, {
    dotfiles: 'ignore',
    index: 'index.html',
    redirect: false,
  }));

  // SEC-13 — generic 404/500, stack trace/dosya yolu sızdırmaz.
  app.use((req, res) => {
    res.status(404).send('Not Found');
  });
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(500).send('Internal Server Error');
  });

  return app;
}

if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`breakout listening on :${port}`);
  });
}
