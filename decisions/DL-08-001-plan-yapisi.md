# DL-08-001: TDD sıralı 10-task backlog

- Tarih: 2026-07-31
- Faz: 8 — Planlama
- Mod: AUTOPILOT
- Karar: Backlog TASK-001..010 olarak, Faz 5 modül sınırlarına (physics/bricks/storage/game/server) birebir hizalı ve TDD sırayla (çekirdek→adaptör→sunucu→yüzey→entegrasyon) planlandı.
- Değerlendirilen alternatifler: Modül başına değil özellik başına task bölme (ör. "can sistemi" tüm modülleri kapsayan tek task) — elendi, test/impl commit çiftini modül sınırında tutmak izlenebilirliği artırıyor.
- Gerekçe: Her task ≤1 gün, tek modülü kapsıyor, bağımlılık grafı doğrusal ve çevrimsiz — ball-bounce'ta kanıtlanan desenle tutarlı.
- Riskler: TASK-002 (alt-adımlı hareket) en yüksek karmaşıklığa sahip — gerekirse ayrı alt-adımlara bölünebilir.
- Geri alınabilirlik: Yüksek (yalnız plan, kod henüz yazılmadı).
- İnsan onayı: Otomatik (AUTOPILOT, kritik risk yok).
- Varsayım mı?: Hayır.
