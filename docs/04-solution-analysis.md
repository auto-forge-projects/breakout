# 04 — Çözüm Analizi: breakout

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Profil: LITE
- Girdi: `docs/03-requirements.md` (FR-1..FR-6, NFR-1..NFR-4)

## Karar 1 — Oyun döngüsü & render katmanı (istemci)

### Alternatifler
- **A — (A1) Vanilla Canvas 2D + `requestAnimationFrame`:** tek `<canvas>`, elle yazılmış top/paddle/blok çizimi ve fiziği (~250 satır), sıfır bağımlılık.
- **B — (A2) Oyun motoru (Phaser 3 / kaboom.js):** hazır sahne, sprite, arcade fizik + çarpışma grupları; CDN veya bundle ile gelir.
- **C — (A3) DOM + CSS:** paddle/top/bloklar birer `<div>`, konum `transform: translate()` ile güncellenir.

### Trade-off matrisi
| Kriter | A1 Canvas 2D (vanilla) | A2 Oyun motoru | A3 DOM + CSS |
|---|---|---|---|
| Maliyet (geliştirme) | Orta — AABB çarpışma + blok grid'i elle | Düşük — `physics.arcade.collide` hazır | Orta-yüksek — 60+ düğüm yönetimi |
| Karmaşıklık (runtime) | Düşük, tek dosya | Yüksek — 200KB–1MB bağımlılık + build/CDN kararı | Orta — layout/reflow maliyeti |
| NFR-1 (~60 FPS) | ✅ rAF, ~40 blok + 1 top trivial yük | ✅ (motor optimize) ama ağır ilk yükleme | ⚠️ 40+ DOM düğümünde reflow riski, retro piksel ölçekleme zor |
| NFR-2 (skor ≤1 sn) | ✅ aynı frame'de güncellenir | ✅ | ✅ |
| NFR-3 (framework yok, ek derleme yok) | ✅ tam uyum | ❌ **doğrudan ihlal** (bağımlılık + genelde bundle adımı) | ✅ uyumlu |
| NFR-4 (`localStorage` kalıcılık) | ✅ nötr — render'dan bağımsız | ✅ nötr | ✅ nötr |
| FR-2 (blok/paddle/duvar sekme açısı) | ✅ çarpma noktası → sekme açısı tam kontrol | ✅ ama açı formülünü motorun içinden esnetmek dolaylı | ⚠️ frame-hassas temas anı CSS'te belirsiz |
| FR-5 (kademeli hız artışı) | ✅ hız vektörü katsayısı | ✅ motor parametresi | ⚠️ süregelen geçişi ortada hızlandırmak kırılgan |
| Retro piksel stil (00-idea) | ✅ `imageSmoothingEnabled=false` + tam sayı grid | ✅ | ⚠️ CSS ile taklit |
| Test edilebilirlik (Faz 9/11) | ✅ saf fizik/çarpışma fonksiyonları DOM'suz birim-test | ⚠️ motor mock'u gerekir | ❌ mantık CSS'e sızar |
| İlk yükleme (KPI-1 ≤5 sn) | ✅ tek HTML+JS, <50KB | ⚠️ kütüphane indirmesi | ✅ |
| Geri alınabilirlik | Yüksek — render katmanı izole, sonradan motor eklenebilir | Orta — kod motor API'sine bağlanır | Orta |

### Seçim: **A1 — Vanilla Canvas 2D + `requestAnimationFrame`**
- NFR-3 "framework'süz HTML/Canvas/JS, ek derleme yok" diyor → A2 gereksinim ihlalidir (göstermelik değil, gerçek eleme sebebi). Motorun asıl getirisi çok-sahneli/çok-seviyeli oyunlarda; v1 kapsamı **tek seviye, tek sabit blok düzeni**.
- FR-2'nin "çarpma noktasının paddle merkezine uzaklığına göre açı" kuralı Breakout'a özgü elle bir formüldür; A2'de motor davranışını override etmek A1'i yazmaktan kolay değil.
- A3, ~40 blok için DOM düğümü yönetimi + frame-hassas temas tespiti gerektirir; NFR-1 riskini bedavaya alır.
- Emsal doğrulaması: ball-bounce/snake-game aynı desende üretilip deploy edildi (kanıtlanmış hat).

## Karar 2 — Çarpışma tespiti & blok modeli

### Alternatifler & matris
| Kriter | B1 Statik grid dizisi + AABB | B2 Nesne listesi + her frame lineer tarama | B3 Fizik motoru (matter.js) |
|---|---|---|---|
| Model | `bricks[row][col] = {alive}`, konum indeksten türetilir | `bricks[]` nesneleri, her frame hepsiyle test | Rigid body + collision event |
| Karmaşıklık | Düşük — top konumundan aday satır/kolon doğrudan hesaplanır | Çok düşük ama O(n) tarama/frame | Yüksek — bağımlılık + NFR-3 ihlali |
| NFR-1 (60 FPS) | ✅ O(1)–O(4) aday kontrolü | ✅ n≈40'ta yeterli ama ölçeklenmez | ✅ ama fazla |
| FR-2 (doğru eksende yön değişimi) | ✅ giriş kenarı (üst/alt vs yan) indeksten netleşir | ⚠️ örtüşme derinliği elle çözülür | ✅ motor çözer |
| Kazanma koşulu (FR-3, tüm bloklar) | ✅ `aliveCount` sayacı | ✅ filtre | ✅ |
| Test edilebilirlik | ✅ saf fonksiyon: (top, grid) → çarpışma sonucu | ✅ | ⚠️ motor mock'u |
| Geri alınabilirlik | Yüksek — grid → liste dönüşümü lokal | Yüksek | Düşük (kod motora bağlanır) |

### Seçim: **B1 — Statik grid dizisi + AABB, alt-adımlı (sub-step) hareket**
- Tek sabit düzen (v1) grid modelini birebir karşılıyor; blok konumu veriden değil indeksten türeyince test kurulumu da sadeleşir.
- FR-5 hız artışı **tünelleme** (fast ball bloğun içinden geçmesi) riski doğurur; hareket alt-adımlara bölünerek çözülür — bu karar B1'in parçasıdır ve Faz 5'te mimariye yazılır.
- B3, NFR-3 nedeniyle Karar 1 ile aynı gerekçeyle elenir.

## Karar 3 — Statik içerik servisi (sunucu tarafı)

| Kriter | C1 Node + Express (minimal) | C2 nginx-only imaj | C3 Çıplak Node `http` |
|---|---|---|---|
| Bağımlılık / imaj | 1 npm paketi / ~130MB | 0 npm / ~25MB | 0 npm / ~130MB |
| Karmaşıklık | Çok düşük (~15 satır) | Ayrı `nginx.conf` + MIME kuralları | MIME/404 elle |
| Deploy uyumu (SSH-push → `127.0.0.1:<host_port>` + host nginx) | ✅ emsallerle birebir | ⚠️ nginx-içinde-nginx, şablondan sapar | ✅ |
| `/health` probe (kural 9) | ✅ tek route | ⚠️ statik dosyayla taklit | ✅ elle route |
| Test edilebilirlik (Faz 11/12) | ✅ fetch/supertest | ⚠️ konteyner gerekir | ✅ |
| Geri alınabilirlik | Yüksek — C2/C3'e geçiş saatlik iş | Yüksek | Yüksek |

### Seçim: **C1 — Node + Express minimal statik sunucu (+ `/health`)**
- Fabrika deploy hattı emsal projelerde C1 ile doğrulandı; sapma riski getirisinden büyük. NFR'lerde imaj boyutu hedefi yok → C2'nin tek avantajı bu üründe değer üretmiyor.
- C3'ün kazancı bir bağımlılık; karşılığı elle MIME/404/health kodu — takas değmez.

## Açık sorular / varsayımlar
- **Varsayım (AUTOPILOT):** Blok düzeni kod içinde sabit bir grid tanımı (satır×kolon + renk) olarak tutulur; harici seviye dosyası yok (v1 kapsamı "tek sabit düzen").
- **Varsayım (AUTOPILOT):** Skorlama blok başına sabit puan; satıra göre değişen puan v1 kapsamında değil.

## Kalite kapısı raporu
- "≥2 alternatif karşılaştırıldı" → ✅ Karar 1: 3 alternatif (A1/A2/A3) × 12 kriter; Karar 2: 3 alternatif (B1/B2/B3) × 7 kriter; Karar 3: 3 alternatif (C1/C2/C3) × 6 kriter — hepsi satır satır.
- "Seçim gerekçeli" → ✅ Eleme sebepleri somut: NFR-3 ihlali (A2/B3), NFR-1 reflow riski (A3), deploy hattı uyumu (C1).
- Decision Log: `decisions/DL-04-001-client-vanilla-canvas.md`, `decisions/DL-04-002-collision-grid-aabb.md`, `decisions/DL-04-003-static-server-express.md`
