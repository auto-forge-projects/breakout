# DL-12-001: Dockerfile — src/server.js hizası + sandbox host-port kısıtı

- Tarih: 2026-07-31
- Faz: 12 — CI/CD
- Mod: AUTOPILOT
- Karar: `node:22-alpine` tabanlı tek-stage `Dockerfile` eklendi (`npm ci --omit=dev` + `COPY src ./src` + `COPY public ./public` + `CMD ["node","src/server.js"]`). İmaj `docker build` ile başarıyla üretildi ve **container-içi** çağrıyla (host port bind ETMEDEN) `/health` (200, `{"status":"ok"}`) ve `/` (200, `index.html`, 838 byte) doğrulandı.
- Değerlendirilen alternatifler: `docker run -p <host>:3000 ...` ile host'tan gerçek HTTP isteği — bu ajan oturumunun sandbox izin sistemi host-port bind işlemini reddediyor (ball-bounce/url-shortener/dice-game fazlarında da görülen bilinen kısıt, bkz. DL-12-001 emsalleri).
- Gerekçe: Container-içi doğrulama (Node'un kendi `fetch` istemcisiyle container'ın kendi ağ ad alanında istek atmak) host port publish'e eşdeğer kanıt sağlar — asıl soru "imaj gerçekten çalışıyor mu ve `express.static`/`/health` doğru mu" sorusudur; host↔container port haritalaması Docker'ın kendi (bu sandbox'ta test edilemeyen) sorumluluğudur. Gerçek host-port erişimi SSH-deploy sonrası prod sunucuda `deploy/remote-deploy.sh`'in health-probe'uyla ayrıca doğrulanacak.
- Riskler: Host-port bind sandbox'ta hiç test edilemedi — kabul edildi, düşük risk (standart `-p host:container` haritalaması, imaj `EXPOSE 3000` zaten deklare ediyor).
- Geri alınabilirlik: Yüksek (Dockerfile 9 satır, kolayca değiştirilebilir).
- İnsan onayı: Otomatik (AUTOPILOT, kapı geçti)
- Varsayım mı?: Evet — AUTOPILOT varsayımı: container-içi doğrulama host-port erişiminin yerine yeterli kanıt kabul edildi (ball-bounce/url-shortener/DL-12-001 emsaliyle tutarlı).
