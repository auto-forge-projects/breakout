# DL-15-001: Teknik borç önceliklendirme (P1=0, düzeltme dayatılmadı)

- Tarih: 2026-07-31
- Faz: 15 — Bakım
- Mod: AUTOPILOT
- Karar: `npm audit` bulgusu (TD-1, express transitive CVE'leri) + Faz 11/12/13/14 kararlarından çıkan riskler `docs/15-maintenance.md`'ye teknik borç (TD-1..TD-6) olarak kaydedildi; hiçbiri P1 değil, bu fazda kod düzeltmesi yapılmadı.
- Değerlendirilen alternatifler: (1) TD-1'i hemen `npm audit fix --force` ile düzeltmek — reddedildi, Faz 15 kapsamı "önceliklendirme" (kalite kapısı metni) + execution policy Faz 14-16'yı WORKSPACE_WRITE/READ_ONLY ile sınırlıyor (bağımlılık kurulumu Faz 9'a özgü). (2) Tüm bulguları P1 işaretleyip zorunlu kılmak — reddedildi, hiçbiri kullanılabilirliği acil riske atmıyor (uygulama dinamik route parametresi kullanmadığından CVE'lerin gerçek saldırı yüzeyi düşük).
- Gerekçe: Ürün solo/düşük-trafik ölçekte; P2/P3 borç birikimi kabul edilebilir risk, bir sonraki bakım turunda veya ↺ Yeni İhtiyaç fazında ele alınabilir.
- Riskler: TD-1 (bilinen CVE'ler) yamanmadan kalır — azaltım: liste izlenebilir kaldı (kaynak `npm audit` referanslı), P2 öncelikli, bir sonraki bakım turunda ilk sırada.
- Geri alınabilirlik: Yüksek (her TD kalemi bağımsız, küçük, geri alınabilir değişiklikler).
- İnsan onayı: Otomatik (AUTOPILOT, kalite kapısı yapısal geçti).
- Varsayım mı?: Evet — AUTOPILOT varsayımı: öncelik seviyeleri (P1/P2/P3) risk/etki değerlendirmesiyle atandı, hiçbir kalem Blocker/Critical eşiğine ulaşmadığı için kullanıcıya sorulmadı.
