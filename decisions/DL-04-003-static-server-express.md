# DL-04-003: Statik içerik servisi — Node + Express minimal sunucu (+ /health)

- Tarih: 2026-07-31
- Faz: 4 — Çözüm Analizi
- Mod: AUTOPILOT
- Karar: Oyun dosyaları (`index.html`, JS, varlıklar) minimal bir Node + Express sunucusuyla (~15 satır, `express.static` + `/health` route'u) servis edilecek; imaj `node:alpine` tabanlı olacak ve konteyner `127.0.0.1:<host_port>`'a bağlanarak mevcut host nginx reverse-proxy + SSH-push deploy hattına takılacak.
- Değerlendirilen alternatifler: (C2) nginx-only imaj (`nginx:alpine` + `nginx.conf`, ~25MB); (C3) çıplak Node `http` modülü (sıfır npm bağımlılığı, MIME/404 elle yazılır).
- Gerekçe: Fabrikanın deploy hattı (`deploy.json.host_port` → host nginx server bloğu → kural 9 `/health` probe'u) ball-bounce/snake-game/coinflip emsallerinde C1 ile uçtan uca doğrulandı; şablondan sapmanın riski getirisinden büyük. NFR listesinde imaj boyutu hedefi YOK, dolayısıyla C2'nin tek somut avantajı bu üründe değer üretmiyor; üstelik canlıda zaten host nginx olduğu için nginx-içinde-nginx işletim karmaşıklığı ekliyor. C3 bir bağımlılık kazandırır ama karşılığında MIME tipleri, 404 ve health route'u elle yazılır — sıfır-bağımlılık hedefi NFR-3'te İSTEMCİ için tanımlı, sunucu için değil; bu takas değmez.
- Riskler: Express bir npm bağımlılığıdır → tedarik zinciri/CVE yüzeyi (küçük): Faz 7 güvenlik değerlendirmesinde bağımlılık sürümü + `npm audit` kontrolü yapılacak. Node imajı ~130MB → deploy süresi biraz uzar, ölçülebilir bir NFR'yi ihlal etmiyor.
- Geri alınabilirlik: Yüksek (geçiş yalnız Dockerfile + sunucu dosyasını değiştirmektir, oyun kodu dokunulmaz; C2'ye veya C3'e geçiş saatlik iş)
- İnsan onayı: Otomatik
- Varsayım mı?: Hayır (emsal deploy hattıyla doğrulanmış seçim)
