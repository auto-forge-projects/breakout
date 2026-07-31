# DL-06-001: Retro piksel HUD ve tek-nokta girdi yönlendirmesi

- Tarih: 2026-07-31
- Faz: 6 — UI/UX
- Mod: AUTOPILOT
- Karar: Tüm paddle girdisi (fare `mousemove` + klavye `ArrowLeft`/`ArrowRight`) tek `setPaddleX()`/`movePaddle()` çağrısına yönlendirilir; HUD skor/en-yüksek-skor/can'ı tek `<div id="hud">` içinde gösterir; görsel stil yalnız `fillRect` + tam sayı ölçek (sprite/resim yok).
- Değerlendirilen alternatifler: Ayrı fare/klavye event handler'ları farklı state güncelleme yolları (elendi — iki yol arası tutarsızlık riski); sprite/resim tabanlı görsel (elendi — DL-05-003 retro piksel kararıyla `fillRect` yaklaşımı zaten sabitlenmişti).
- Gerekçe: Tek giriş noktası test edilebilirliği artırır (Faz 9/11 tek fonksiyonu birim test eder) ve ball-bounce'taki `hit()` deseniyle tutarlıdır.
- Riskler: Fare ve klavyenin aynı anda kullanılması durumunda son gelen olay kazanır — çakışma riski düşük (kullanıcı davranışı doğal olarak tek yöntem seçer).
- Geri alınabilirlik: Yüksek (yalnız UI/olay bağlama, çekirdek fizik etkilenmez).
- İnsan onayı: Otomatik (AUTOPILOT, kritik risk yok).
- Varsayım mı?: Hayır — DL-05-003'ün retro piksel kararının doğrudan devamı.
