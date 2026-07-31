# DL-04-001: İstemci render & oyun döngüsü — Vanilla Canvas 2D + requestAnimationFrame

- Tarih: 2026-07-31
- Faz: 4 — Çözüm Analizi
- Mod: AUTOPILOT
- Karar: Breakout'un render ve oyun döngüsü katmanı, sıfır bağımlılıkla tek `<canvas>` üzerinde vanilla JavaScript + `requestAnimationFrame` ile yazılacak. Paddle/top/blok çizimi, girdi (fare + klavye) ve fizik güncellemesi tek frame döngüsünde yürütülür; retro piksel görünüm `imageSmoothingEnabled=false` + tam sayı koordinat grid'i ile sağlanır.
- Değerlendirilen alternatifler: (A2) Oyun motoru — Phaser 3 / kaboom.js (hazır sahne + arcade fizik + çarpışma grupları); (A3) DOM + CSS transform (paddle/top/bloklar `<div>` olarak, layout motoruyla animasyon).
- Gerekçe: NFR-3 açıkça "framework'süz HTML/Canvas/JS, ek derleme yok" diyor → A2 gereksinim ihlalidir (gerçek eleme sebebi, göstermelik değil). Motorun getirisi çok-seviyeli/çok-sahneli oyunlarda ortaya çıkar; v1 kapsamı tek seviye + tek sabit blok düzeni. FR-2'nin "çarpma noktasının paddle merkezine uzaklığına göre sekme açısı" kuralı Breakout'a özgü elle bir formüldür; motorda bunu override etmek sıfırdan yazmaktan kolay değil. A3, ~40 blok için DOM düğümü yönetimi + reflow maliyeti getirir ve frame-hassas temas anını belirsizleştirir (NFR-1 riski, FR-2/FR-5 kırılganlığı). A1 ayrıca fiziği saf fonksiyonlara ayırarak Faz 9/11 birim testini DOM'suz mümkün kılar; ball-bounce/snake-game emsalinde aynı desen uçtan uca kanıtlandı.
- Riskler: Çarpışma matematiği elle yazıldığı için köşe/kenar durumları (blok köşesine çarpma, paddle kenarı) hata üretebilir → Faz 9'da saf fonksiyon birim testleriyle kapsanacak. Yüksek hızda tünelleme riski DL-04-002'de alt-adımlı hareketle ele alınıyor.
- Geri alınabilirlik: Yüksek (render/girdi katmanı oyun durumundan izole tutulacak; ileride motor veya WebGL'e geçmek durum modeline dokunmadan render katmanını değiştirmekle sınırlı kalır)
- İnsan onayı: Otomatik
- Varsayım mı?: Hayır (NFR-3 bu seçimi doğrudan zorunlu kılıyor)
