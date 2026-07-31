# Faz 12 — CI/CD

## Var olan (scaffold'dan, dokunulmadı)
- `.github/workflows/ci.yml` — push/PR'da `npm test` koşar (54/54 test).
- `.github/workflows/deploy-image.yml` — GHCR'a build+push, ardından SSH ile `deploy/remote-deploy.sh` çalıştırır (`deploy.json.enabled:true` — bu projede zaten `true`, `host_port:5008`).
- `deploy.json` — `port:3000`, `healthcheck:/health` — bu faz için değiştirilmedi.

## Eklenen: `Dockerfile`
- Taban imaj: `node:22-alpine`.
- Tek-stage: `npm ci --omit=dev` (yalnız `express`, dev bağımlılık yok).
- `COPY src ./src` + `COPY public ./public` — Faz 5/9 dizin yapısıyla (DL-05-001) hizalı; `CMD ["node", "src/server.js"]`.
- Sunucu stateless (skor `localStorage`'da istemci tarafında tutulur, NFR-4) — volume/DB gerekmiyor.

## Doğrulama (lokalde çalıştırıldı)
- `docker build -t breakout:test .` → **başarılı**.
- Host-portu-publish edilmiş çalıştırma (`docker run -p ...`) sandbox izin sistemi tarafından reddedilir (ball-bounce/url-shortener/dice-game fazlarında da görülen bilinen kısıt). Bunun yerine imaj **container-içi doğrulandı**: `docker run --rm breakout:test node --input-type=module -e "..."` ile `src/server.js`'teki `createServer()` içeriden çağrıldı, `127.0.0.1`'e rastgele porta bind edildi; `GET /health` → `200 {"status":"ok"}`, `GET /` → `200 text/html` (838 byte, `index.html`) doğrulandı.
- Test imajı temizlendi (`docker rmi`) — yerel Docker ortamında kalıntı yok.

## Kalite kapısı raporu
- ✅ Pipeline artefaktları mevcut: `ci.yml` + `deploy-image.yml` (scaffold) + yeni `Dockerfile`.
- ✅ `Dockerfile` gerçekten build ediliyor (`docker build` başarılı).
- ✅ İmaj çalışıyor, `/health` 200 ve statik `index.html` servis ediliyor (container-içi doğrulandı).
- ⚠️ Host-portu-publish edilmiş dış erişim bu ortamda test edilemedi (sandbox `-p` kısıtı, DL-12-001'de not edildi) — gerçek doğrulama SSH-deploy sonrası `deploy/remote-deploy.sh`'in kendi health-probe'uyla yapılır.
- ✅ `state.product.commands.run` tanımlı (dashboard "Ürün" paneli).
