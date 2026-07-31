# 15 — Bakım: breakout

- Tarih: 2026-07-31 | Mod: AUTOPILOT
- Bu dosya ÜRÜNÜN teknik borcunu izler; fabrikanın eksikleri `AUTOFORGE-FEEDBACK.md`'ye.
- Not: LITE profilinde Faz 10 (Code Review) atlandı (AF-112) — aşağıdaki liste bağımsız review bulgusu içermez, yalnız `npm audit` + Faz 9/11/12/13/14 DL'lerindeki bilinen sınırlar kaynaklıdır.

## Bilinen sorunlar
Kod bağımsız denetimden geçmedi (Blocker/Critical kapısı bu profilde yok, DL kaydı: profil kararı 2026-07-26). Runtime davranışında bilinen hata yok — 54/54 test yeşil, coverage %97.15.

## Teknik borç (kalite kapısı: önceliklendirilmiş)
| # | Borç | Kaynak | Öncelik (P1/P2/P3) | Not |
|---|------|--------|--------------------|-----|
| TD-1 | `express@4.21.2` transitive bağımlılıkları (`body-parser`, `path-to-regexp`, `qs`) 4 CVE taşıyor (2 moderate, 2 high — ReDoS/DoS ailesi) | `npm audit` (bu faz) | P2 | Uygulama dinamik route parametresi kullanmıyor (yalnız `/health` + statik `express.static`) → gerçek saldırı yüzeyi düşük; yine de `npm audit fix --force` (express@4.22.2'ye yükseltir) bir sonraki bakım turunda uygulanmalı |
| TD-2 | Dockerfile `root` kullanıcı ile çalışıyor, `USER node` eklenmemiş | Faz 12 gözlemi | P3 | Defense-in-depth; runtime davranışını değiştirmez, tek satır ekleme |
| TD-3 | Ayrı E2E/gerçek-tarayıcı testi yok, yalnız fake-dom entegrasyon testleri | DL-11-001 | P3 | 60 FPS/görsel render doğruluğu otomatik kapsam dışı; manuel smoke ile telafi |
| TD-4 | Host-port-publish edilmiş Docker çalıştırması bu ortamda hiç test edilemedi | DL-12-001 | P3 | Prod SSH-deploy health-probe'u ile telafi edilecek; sandbox kısıtı, ürün koduyla ilgisiz |
| TD-5 | Uzak sunucuda önceki imaj SHA'sı elle takip edilmezse rollback için doğru tag bulmak gecikebilir | DL-13-001 | P3 | İmaj etiketleme/temizlik politikası tanımlanmadı |
| TD-6 | Otomatik uptime/alerting altyapısı yok, yalnız manuel `/health` kontrolü | DL-14-001 | P3 | LITE ölçeğinde kabul edilen risk |

## Bağımlılık güncelleme planı
Tek runtime bağımlılık (`express`); `package-lock.json` sabitli. Dependabot/otomasyon LITE kapsamında kurulmadı — sürüm başı `npm outdated` + `npm audit` elle çalıştırılır; TD-1 (mevcut CVE'ler) bir sonraki bakım turunda `npm audit fix --force` + regresyon (`npm test`) ile kapatılmalı.

## Bakım ritmi
Sürüm başı: `npm audit`, TD listesi gözden geçir (P1 varsa önce o; şu an 0 P1). Aylık ritim bu ölçekte gereksiz (solo/durgun trafik ürünü) — yalnız yeni ihtiyaç/geri besleme geldiğinde (↺ Yeni İhtiyaç fazı) tetiklenir.

## Kalite kapısı raporu
- "Teknik borç önceliklendirilmiş" → ✅ (6 borç, kaynak DL/audit referanslı; 0 P1, 1 P2, 5 P3)
