# 14 — Monitoring: breakout

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Profil: LITE → basit health check + hata loglama

## Ürün tipine göre izleme (`state.product.type`: web)
| Tip | İzlenecekler |
|-----|--------------|
| Sunucu (Express) | `GET /health` durumu, process crash/exit, container restart sayısı |
| İstemci (vanilla Canvas/JS) | Tarayıcı konsol hataları (manuel smoke — otomatik JS-hata toplama servisi LITE kapsamı dışında) |

## Health check
| Kontrol | Sağlıklı | Sorunlu davranış |
|---------|----------|-------------------|
| `GET /health` (nginx üzerinden dış, `127.0.0.1:host_port` üzerinden iç) | `200 {"status":"ok"}` | Timeout / 5xx / bağlantı reddi → container down veya crash-loop |
| `docker ps` (container durumu) | `Up`, restart sayacı 0 | `Restarting` döngüsü → uygulama başlangıçta crash ediyor |
| Statik ana sayfa (`GET /`) | `200`, HTML dönüyor | 404/502 → nginx proxy veya statik dosya sorunu |

## Hata görünürlüğü / loglama
- Express stdout/stderr → container log (`docker logs breakout`); host'ta ek log dosyası tutulmuyor (durumsuz, kalıcı log altyapısı LITE kapsamı dışı).
- Hassas veri loglanmaz: uygulama kimlik/PII/oturum verisi işlemiyor (bkz. `docs/07-security.md`), skor yalnız istemci `localStorage`'ında.
- İstemci tarafı (`public/game.js`/`public/physics.js`) hata fırlatırsa yalnız tarayıcı konsoluna düşer; sunucuya raporlanmaz (ağ round-trip'siz tasarım kararıyla tutarlı, `docs/05-architecture.md`).

## Kritik akış izleme (kalite kapısı)
En kritik risk: **container ayakta ama uygulama yanıt vermiyor** (crash sonrası restart-loop veya nginx→container bağlantı kaybı). Görünürlük: `deploy/remote-deploy.sh` dağıtım sonrası `healthcheck` alanını (`deploy.json.healthcheck: /health`) kontrol eder; operatör dashboard "Ürün" panelinden `run` komutunu tetikleyip `/health`'i manuel doğrulayabilir. LITE'ta otomatik alerting (PagerDuty/e-posta) kapsam dışı — tek-cihaz/solo kullanım profili risk düzeyini düşürüyor (kimlik/veri kaybı riski yok, yalnız kullanılabilirlik riski var).

## Kalite kapısı raporu
- "Kritik akışlar için alert/hata görünürlüğü tanımlı" → ✅ (health check + container log + manuel doğrulama akışı; LITE ölçeğinde yeterli)
