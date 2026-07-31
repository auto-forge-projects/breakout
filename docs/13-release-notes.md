# breakout v0.1.0 — Release Notes

- Tarih: 2026-07-31 | SemVer: **v0.1.0** (0.x = API garanti yok) | Mod: AUTOPILOT

## Öne çıkanlar
İlk sürüm: tarayıcıda oynanan retro piksel stilinde Breakout (blok kırma) oyunu, framework'süz vanilla Canvas 2D istemci + minimal Express statik sunucu.

## Özellikler
- Paddle kontrolü: fare hareketi + sol/sağ ok tuşları (FR-1).
- Gerçekçi top fiziği: duvar/paddle/blok sekmesi, paddle merkez-uzaklığına göre açı değişimi, sub-step tünelleme önlemi (FR-2).
- 3 can, top kaçınca can azalır, can 0'da "Oyun bitti"; tüm bloklar kırılınca "Kazandın" (FR-3).
- Skor sayacı (≤1sn güncelleme) + `localStorage` ile kalıcı en yüksek skor (FR-4).
- Kademeli top hızı artışı, üst sınırla (VMAX) sınırlı (FR-5).
- Sayfa yenilemeden "Yeniden başlat" (FR-6).

## Güvenlik
- OWASP Top 10 değerlendirildi (docs/07-security.md); güvenlik header'ları (CSP, X-Content-Type-Options, X-Frame-Options, HSTS), path-traversal/dotfile reddi, yalnız GET/HEAD, `localStorage` girdisi clamp+güvenli parse (SEC-8/9), sunucu parmak izi gizleme (`x-powered-by` kapalı). Kod bağımsız denetimden geçmedi — LITE profilinde Faz 10 (Code Review) bilinçli olarak atlanır (AF-112).

## Bilinen sınırlar (docs/15-maintenance.md referanslı)
- ~60 FPS akıcılığı (NFR-1) ve framework'süz uyumluluk (NFR-3) yalnız manuel/statik incelemeyle doğrulandı — otomatik test kapsamı dışında.
- Docker imajı bu ortamda yalnız container-içi doğrulandı; host-port publish edilmiş erişim sandbox kısıtı nedeniyle test edilemedi (DL-12-001), gerçek doğrulama SSH-deploy sonrası health-probe ile yapılır.

## Kurulum
- Yerel: `npm ci && npm start` (varsayılan port 3000, `PORT` env ile değiştirilebilir).
- Docker: `docker build -t breakout .` → `docker run -p 3000:3000 breakout`.
- Deploy: `deploy.json.enabled:true` — push sonrası GHCR imajı + SSH deploy otomatik (host_port 5008, `https://breakout.apps.sametemek.com`).

## Rollback planı (kalite kapısı)
1. Kod: `git revert` ile bu sürümün commit'ine dönül veya bir önceki tag'e (`git checkout <önceki-tag>`) geçilir; imaj `deploy-image.yml` bir önceki SHA tag'iyle yeniden dağıtılır.
2. Veri uyumluluğu: Sunucu stateless, tek kalıcı veri istemci `localStorage`'daki `highscore` — downgrade veri kaybı yaratmaz (şema değişmedi, geriye dönük uyumlu).
3. Doğrulama: Rollback sonrası `/health` → `200 {"status":"ok"}` ve `/` → statik `index.html` servis edildiği kontrol edilir.
4. Dağıtım: `deploy/remote-deploy.sh` önceki imaj tag'iyle yeniden çalıştırılır; `nginx -t` geçmeden reload yapılmaz (kural korunur).

## Kalite kapısı raporu
- "Rollback prosedürü tanımlı" → ✅
- "Sürüm plana uygun" → ✅ (Faz 8 planında sürüm milestone'u yok — ilk sürüm `package.json` v0.1.0 ile tutarlı, LITE/solo proje)
