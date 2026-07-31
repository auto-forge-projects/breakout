# 11 — Sonuç Raporu: breakout

| Metrik | Değer |
|--------|-------|
| Toplam test | 54 |
| Geçti | 54 |
| Kaldı | 0 |
| Coverage (satır) | %97.15 |

- Koşum: `npm test` (`node --test`), workspace'te gerçek koşum — `node scripts/verify-gate.mjs 11 --level mechanical` bunu ayrıca doğrular (rapor beyanı değil).
- Kritik senaryolar (test-plan.md tablosu): 12/12 FR/NFR/SEC senaryosu birim veya entegrasyon testiyle kapatıldı, hepsi geçiyor.
- Başarısızlık analizi: yok — 0 test kaldı, Faz 9'a geri besleme gerekmiyor.
- Bilinçli kapsam dışı: NFR-1 (60 FPS) ve NFR-3 (framework'süz uyumluluk) otomatik test kapsamı dışında — manuel/statik inceleme ile doğrulandı (bkz. test-plan.md "Kapsam dışı").

## Kalite kapısı raporu
- "Test planı var" → ✅ (test-plan.md)
- "Sonuç raporu var" → ✅ (bu dosya)
- "Kritik senaryolar %100 geçti" → ✅ (54/54, 0 kaldı)
