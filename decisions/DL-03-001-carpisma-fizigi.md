# DL-03-001: Paddle-göreli sekme açısı ve blok-kırma modeli

- Tarih: 2026-07-31
- Faz: 3 — Requirement Analizi
- Mod: AUTOPILOT
- Karar: Top-paddle çarpışmasında sekme açısı, çarpma noktasının paddle merkezine olan yatay uzaklığına göre belirlenir (kenara çarpma daha dik açı verir); top-blok çarpışmasında blok kırılır ve ilgili eksende yön değişir (basit AABB çarpışma, karmaşık açı hesaplaması yok).
- Değerlendirilen alternatifler: Sabit açıyla yansıma (paddle'a nereye çarparsa çarpsın aynı açı) — oynanışı monotonlaştırdığı için elendi; tam fizik motoru (Box2D/Matter.js) — LITE kapsamı için gereksiz karmaşıklık, elendi.
- Gerekçe: Paddle-göreli açı klasik Breakout/Arkanoid hissini verir ve düşük implementasyon riskiyle (ball-bounce'taki temel çarpışma testleriyle aynı desen) uygulanabilir.
- Riskler: Köşe çarpışmalarında (blok kenarına teğet) çift-yön değişimi yanlış hesaplanabilir — Faz 9'da birim testle kapsanacak.
- Geri alınabilirlik: Yüksek (yalnız fizik formülü, kod değişmedi).
- İnsan onayı: Otomatik (AUTOPILOT, kritik risk yok).
- Varsayım mı?: Evet — AUTOPILOT varsayımı: brief bu düzeyde detay içermiyor, klasik tür konvansiyonu uygulandı.
