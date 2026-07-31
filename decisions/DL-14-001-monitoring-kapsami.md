# DL-14-001: Monitoring kapsamı — health check + container log (alerting altyapısı yok)

- Tarih: 2026-07-31
- Faz: 14 — Monitoring
- Mod: AUTOPILOT
- Karar: LITE profilde izleme, `/health` endpoint kontrolü + container log görünürlüğüne indirilir; otomatik alerting (PagerDuty/e-posta/Slack) kurulmaz.
- Değerlendirilen alternatifler: (1) Harici APM/log toplama (ör. Sentry) entegrasyonu — reddedildi, solo/tek-cihaz kullanım ölçeğinde operasyonel yük/maliyet faydayı aşıyor. (2) `/metrics` (Prometheus) endpoint'i — reddedildi, tek Express health check zaten kritik akışı (ayakta mı/değil mi) kapsıyor.
- Gerekçe: Ürünün tek kritik operasyonel riski "kullanılabilirlik" (container ayakta mı); veri kaybı/PII riski yok (`docs/07-security.md`). `deploy.json.healthcheck` + `docker logs` bu riski LITE ölçeğinde yeterince görünür kılıyor.
- Riskler: Sessiz crash-loop, operatör dashboard'u manuel kontrol etmezse gözden kaçabilir — azaltım: dashboard "Ürün" paneli `/health` linkini görünür tutar; ileride otomatik uptime-check `docs/15-maintenance.md`'ye teknik borç olarak not edilecek.
- Geri alınabilirlik: Yüksek (izleme altyapısı sonradan eklenebilir; kod/mimari değişikliği gerektirmiyor).
- İnsan onayı: Otomatik (AUTOPILOT, kalite kapısı yapısal geçti).
- Varsayım mı?: Evet — AUTOPILOT varsayımı: LITE profilin asgari izleme ilkesi web tipine health-check+log olarak uygulandı.
