# DL-05-001: Modül yapısı — saf oyun çekirdeği + ince I/O adaptörü + izole kalıcılık sınırı

- Tarih: 2026-07-31
- Faz: 5 — Mimari Tasarım
- Mod: AUTOPILOT
- Karar: İstemci kodu dört ESM dosyasına ayrılır: **saf çekirdek** `public/physics.js` (state makinesi, hareket, alt-adım, çarpışma çözümü) + `public/bricks.js` (grid geometrisi ve blok isabet testi), **ince adaptör** `public/game.js` (rAF döngüsü, canvas render, fare/klavye girdisi, HUD/overlay) ve **kalıcılık sınırı** `public/storage.js` (enjekte edilen `storage` nesnesiyle `readHighScore`/`writeHighScore`). Çekirdek hiçbir tarayıcı API'si çağırmaz; adaptör hiçbir oyun kuralı bilmez. Çekirdek→adaptör iletişimi `state.events[]` listesiyle olur (her karede boşaltılır).
- Değerlendirilen alternatifler: (1) Tek dosya monolit (`game.js` içinde fizik + render + input, ~300 satır); (2) Sınıf hiyerarşisi (`Entity`/`Ball`/`Paddle`/`Brick` + `Game` orkestratörü); (3) Çekirdeğin adaptöre callback vermesi (`onBrickBreak` gibi) — `events[]` yerine.
- Gerekçe: Faz 9/11'in birim testleri DOM'suz koşabilsin diye fizik ve grid mantığının tarayıcıdan tam ayrık olması gerekiyor; monolitte `document`/`canvas` importu test kurulumunu jsdom'a bağlar (NFR-3'ün "ek derleme/araç yok" ruhuna da aykırı). Sınıf hiyerarşisi 3 varlık tipi ve tek seviye için gereksiz dolaylılık ekler; düz veri + saf fonksiyon aynı işi daha az kodla ve daha kolay assert edilir şekilde yapar. `events[]` callback'e tercih edildi: senkron kayıt kalıcı bir veri olduğu için testte `assert.deepEqual(state.events, [...])` ile davranış doğrulanabilir, callback'te mock gerekir. `storage.js`'in ayrı olması NFR-4'ü tek bir denetlenebilir noktaya indirir (statik incelemede `localStorage` kullanımı tek dosyada görünür).
- Riskler: Dosya sayısı arttıkça (4 istemci modülü) çok küçük bir modül dağınıklığı maliyeti var → hepsi `public/` altında, çekirdek/adaptör ayrımı açık isimlerle sabit. `events[]` her karede boşaltılmazsa bellek büyür → `step()` başında `length = 0` (Faz 9 birim testinde kontrol edilir).
- Geri alınabilirlik: Yüksek (birleştirme yönü ucuz: modülleri tek dosyada toplamak mekanik bir işlem, tersi değil; çekirdek saf olduğu için ileride WebGL/motor'a geçiş yalnız `game.js`'i değiştirir)
- İnsan onayı: Otomatik
- Varsayım mı?: Hayır (DL-04-001'in "fiziği saf fonksiyonlara ayırarak DOM'suz test" gerekçesinin somutlaştırılması)
