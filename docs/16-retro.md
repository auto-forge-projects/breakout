# 16 — Retrospektif: AutoForge pipeline'ı (breakout koşusu)

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Girdi: `AUTOFORGE-FEEDBACK.md` (AF-130, AF-131)
- Kapsam: FABRİKA değerlendirilir, ürün değil.

## Ne iyi gitti
- `/pipeline-resume` tanı akışı (doctor) hem `ORPHANED_RUN` hem `COMMIT_QUEUE_STUCK` bulgusunu net `fix` talimatıyla verdi; ikisi de tek oturumda güvenle kapatıldı (commit-queue path düzeltme + retry; profil-uyumsuz Faz 10'un temizlenmesi).
- Faz 11-15 boyunca LITE artefakt bütçesi (kısa/tablo ağırlıklı) korundu; her fazda `verify-gate.mjs --level all` gerçek koşumla (npm test, docker build, container-içi health probe) doğrulandı — beyan değil kanıt.
- JOIN kapısı (Faz 13) LITE'ın Faz 10 atlamasını (AF-112) doğru tanıdı, Release'i gereksiz bloklamadı.

## En önemli öğrenim
Doctor'ın `ORPHANED_RUN` sınıflandırması, bir fazın kesilmiş/yarım olduğunu doğru tespit ediyor ama fazın PROFİLE GÖRE hiç açılmaması gerektiğini (LITE'ta Faz 10 — AF-112) ayırt etmiyor. Bu proje AF-112 kararından (2026-07-26) SONRA oluşturulduğu halde bir önceki oturum yine de Faz 10'u açıp `code-reviewer`'a devretmişti; doctor bunu genel "iş yarım, devam et" olarak gösterdi. Körü körüne "iş listesinden devam et" talimatı izlenseydi, bilinçli olarak atlanması gereken bir kalite kapısı (Blocker/Critical=0) sessizce yeniden devreye girer ve LITE'ın hız/derinlik takası ihlal edilirdi. Ayrıca commit-queue'nun `git add` davranışı (tek gitignore'lu yol tüm batch'i reddediyor) bağımsız bir ikinci kör nokta olarak bulundu — ilgisiz gibi görünse de aynı kök tema: **kod-enforced kontroller, "kısmen doğru" durumları ya tam-geçer ya tam-reddeder, aradaki nüansı (bu faz aslında hiç olmamalıydı / bu batch'in üçte ikisi geçerliydi) yakalamıyor.**

## Kök-neden temaları
| Tema | İlgili AF | Özet |
|------|-----------|------|
| Doctor bulguları profil bağlamını (skipped fazlar) hesaba katmıyor | AF-130 | `ORPHANED_RUN`/`GATE_MISMATCH` profil-atlanan fazı ayırt etmiyor |
| Commit-queue tek-geçersiz-yol → tüm-batch-red | AF-131 | `git add -- <paths>` all-or-nothing; kısmi stage yok |
| Sandbox host-port kısıtı tekrarlayan bir desen | (ball-bounce/url-shortener DL-12-001 emsali) | Container-içi doğrulama artık standart telafi yöntemi, bu koşuda da aynen uygulandı |

## Somut süreç iyileştirmeleri (kalite kapısı: ≥1)
### Öneri 1 — `scripts/doctor.mjs`'e profil-atlanan-faz kontrolü ekle **[P2, seçildi — AF-130'da kaydedildi, henüz uygulanmadı]**
`ORPHANED_RUN`/`GATE_MISMATCH` bulgusu üretmeden önce `profiles.cjs:isSkipped(profile, phase)` çağrılsın; true dönerse ayrı bir bulgu türü (`PHASE_SHOULD_BE_SKIPPED`) üretilsin ve fix talimatı "üretme/kapı koşturma — yalnız state kaydını temizle + phase_skipped history'e düş + sıradaki faza geç" olsun. Bu, LITE gibi profillerin bilinçli kapı-gevşetme kararlarının (AF-112) resume akışında yanlışlıkla geri alınmasını koda bağlar.

### Öneri 2 — `commit-queue.mjs`'e kısmi-stage koruması **[P3, değerlendirildi — bu turda uygulanmadı]**
`executeJob`, `git add` öncesi her yolu `git check-ignore` ile filtrelesin; ignore'lu yollar sessizce atlanıp geçerli yollar yine de commit'lensin (tamamen ignore'lu batch zaten mevcut "empty" yoluyla zararsız kapanıyor).

## MASTER-PROMPT / CLAUDE.md / şablon değişiklik önerileri
1. `scripts/doctor.mjs` → profil-atlanan faz kontrolü (Öneri 1, AF-130).
2. `scripts/lib/commit-queue.cjs:executeJob` → `git check-ignore` ile kısmi-stage koruması (Öneri 2, AF-131).

## Kalite kapısı raporu
- "En az 1 somut süreç iyileştirmesi" → ✅ (Öneri 1: doctor profil-atlanan-faz kontrolü, kaynak AF-130)
