# DL-13-001: Release v0.1.0 — sürüm/rollback stratejisi

- Tarih: 2026-07-31
- Faz: 13 — Release
- Mod: AUTOPILOT
- Karar: İlk sürüm `v0.1.0` olarak etiketlenir (Faz 8 planında ayrı bir sürüm milestone'u yok — `package.json` v0.1.0 ile tutarlı, FR-1..FR-6 tamamı kapsandı). Rollback, sunucunun durumsuz olmasından (skor yalnız istemci `localStorage`'ında, NFR-4) yararlanarak yalnız kod/imaj seviyesinde tanımlanır.
- Değerlendirilen alternatifler: (1) Ayrı git tag oluşturup rollback'i tag'e bağlamak — reddedildi, `deploy-image.yml` zaten SHA bazlı imaj etiketliyor, ek katman gereksiz. (2) `1.0.0` ile başlamak — reddedildi, ürün API garantisi taşımıyor (solo/LITE oyun projesi).
- Gerekçe: SHA-etiketli imaj + durumsuz mimari, rollback'i "önceki imajı yeniden çalıştır" kadar basitleştiriyor.
- Riskler: Uzak sunucuda önceki imaj SHA'sı elle takip edilmezse rollback gecikebilir — azaltım: `docs/15-maintenance.md`'de imaj etiketleme politikası önerilecek.
- Geri alınabilirlik: Yüksek (git revert + yeniden build/push; kalıcı sunucu-tarafı veri yok).
- İnsan onayı: Otomatik (AUTOPILOT, kalite kapısı yapısal geçti; kritik risk kabulü yok).
- Varsayım mı?: Evet — AUTOPILOT varsayımı: ilk sürüm numarası `package.json`'daki v0.1.0 ile birebir eşleştirildi (Faz 8 planında ayrı milestone yok).
