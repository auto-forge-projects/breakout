# 11 — Test Planı: breakout

- Strateji: birim (Faz 9, `node --test`) + entegrasyon (aynı katman, gerçek modül grafiği; tarayıcı/E2E yok — framework'süz statik istemci, ürün tipi basit oyun)
- Kritik senaryolar (docs/03 kabul kriterlerinden):

| Senaryo | FR/NFR/SEC | Test | Katman |
|---------|-----------|------|--------|
| Fare paddleyi imleç x'ine taşır | FR-1 | game.input.test.js: "fare hareketi paddleyi imlec x konumuna tasir" | Birim |
| Sol/sağ ok paddle'ı sabit hızla hareket ettirir, duvarı aşmaz | FR-1 | game.input.test.js + physics.core.test.js: movePaddle | Birim |
| Top duvar/paddle'da açıyla sekar, paddle merkez-uzaklığı açıyı değiştirir | FR-2 | physics.step.test.js (duvar/paddle sekme testleri) | Birim |
| Bloğa çarpınca kırılır + yön değişir + skor artar | FR-2/FR-4 | physics.bricks.test.js | Birim |
| Top kaçınca can azalır, serve'e döner; can 0 → OVER | FR-3 | physics.step.test.js + integration.test.js | Birim+Entegrasyon |
| Tüm bloklar kırılınca WON | FR-3 | physics.bricks.test.js + integration.test.js | Birim+Entegrasyon |
| Skor ≤1sn içinde günceller (senkron artış doğrulanır) | FR-4/NFR-2 | integration.test.js: "skor senkron artar (NFR-2)" | Entegrasyon |
| En yüksek skor localStorage'a yazılır/okunur | FR-4/NFR-4 | storage.test.js + game.overlay.test.js + integration.test.js | Birim+Entegrasyon |
| Top hızı kademeli artar, VMAX aşılmaz | FR-5 | integration.test.js: "hiz kademeli artar, VMAX asilmaz" | Entegrasyon |
| Yeniden başlat → can/skor/blok/top/paddle sıfırlanır | FR-6 | game.overlay.test.js: "Yeniden Baslat tiklaninca ... sifirlanir" | Birim |
| Güvenlik header'ları + path traversal/dotfile/method reddi | SEC-1..5, SEC-13 | server.test.js | Entegrasyon |
| Skor/highscore enjeksiyon/aralık-dışı değer clamplenir | SEC-8/SEC-9 | storage.test.js | Birim |

- Kapsam dışı (bilinçli + gerekçeli):
  - NFR-1 (~60 FPS akıcılık): otomatik ölçülemez (rAF gerçek tarayıcı frame zamanlamasına bağlı) — manuel DevTools gözlemiyle doğrulanır (aşağıda not düşüldü, Faz 15 borcuna işlenmedi çünkü mimari zaten sub-step ile tünelleme/performans riskini azaltıyor).
  - NFR-3 (framework'süz uyumluluk): statik kod incelemesiyle doğrulanır — `package.json`'da yalnız `express` (server-side) bağımlılığı var, `public/` altında hiç üçüncü parti kütüphane/derleme adımı yok.
