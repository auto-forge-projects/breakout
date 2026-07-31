# DL-11-001: Test stratejisi — Faz 9 birim testlerini Faz 11 kapsamı olarak kabul + tarayıcı/E2E kapsam dışı

- Tarih: 2026-07-31
- Faz: 11 — Test
- Mod: AUTOPILOT
- Karar: Ayrı bir E2E/tarayıcı test katmanı eklenmedi; Faz 9'un TDD birim+entegrasyon testleri (54 test) Faz 11'in "kritik senaryo" kapısı için temel alındı, docs/03 kabul kriterlerine (FR-1..FR-6, ilgili SEC) birebir izlenebilirlik tablosuyla eşlendi ve mechanical kapı (`verify-gate 11 --level mechanical`) ile gerçek koşumda doğrulandı.
- Değerlendirilen alternatifler: Playwright/Puppeteer ile gerçek tarayıcı E2E eklemek.
- Gerekçe: Ürün framework'süz, tek-sayfa, sunucusu yalnız statik dosya servisi olan basit bir istemci oyunu (LITE profil, solo proje); mevcut testler DOM/Canvas'ı fake-dom yardımcılarıyla zaten gerçekçi simüle ediyor ve tüm FR/NFR/SEC kabul kriterlerini kapatıyor. Yeni bir tarayıcı-otomasyon bağımlılığı eklemek (framework-yok mimari kararına da aykırı, DL-04-001) kapsamına orantısız maliyet getirirdi.
- Riskler: Gerçek tarayıcı render/rAF zamanlaması (60 FPS akıcılığı) otomatik doğrulanmıyor — manuel/DevTools gözlemine kalıyor (test-plan.md'de kapsam dışı olarak not edildi).
- Geri alınabilirlik: Yüksek (E2E katmanı sonradan eklenebilir; mevcut birim/entegrasyon testleri değişmeden kalır).
- İnsan onayı: Otomatik (AUTOPILOT)
- Varsayım mı?: Evet — AUTOPILOT varsayımı: LITE/solo bir oyun projesinde ek E2E katmanının maliyeti kazancından yüksek; ölçeklenirse (STANDARD/FULL'e yükseltme) yeniden değerlendirilebilir.
