# 01-02 — Değer & Fizibilite (LITE birleşik faz): breakout

> LITE profil: yarım sayfa hedefi, paydaş analizi yok.

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Profil: LITE

## Değer önerisi
Kurulum gerektirmeyen, tarayıcıda anında açılan klasik bir blok kırma (Breakout) oyunu; kullanıcı hesap/indirme olmadan fare veya klavye ile paddle'ı kontrol eder, topu sektirip blokları kırar ve en yüksek skorunu takip eder.

## KPI'lar (kalite kapısı: en az 3, ölçülebilir)
1. Sayfa yüklenmesinden ilk paddle hareketine kadar geçen süre ≤ 5 sn (manuel ölçüm, tarayıcı DevTools).
2. Blok kırıldığında skor sayacı ≤ 1 sn içinde güncellenir (otomatik test).
3. Top paddle'ın altından kaçtığında can azalır ve 3. canın bitişinde "oyun bitti" ekranı ≤ 1 sn içinde görüntülenir; tüm bloklar kırılınca "kazandın" ekranı çıkar (otomatik test).
4. Oyun 60 FPS civarı akıcı çalışır (rAF tabanlı döngü, manuel gözlem).

## Fizibilite
- Teknik: Canvas/JS ile 2D çarpışma fiziği (paddle/blok/duvar sekmesi + kademeli hız artışı) — kanıtlanmış, düşük risk, ball-bounce/snake-game emsali. ✅
- Ekonomik: Sıfır altyapı maliyeti (statik barındırma + mevcut SSH-push deploy akışı yeterli). ✅
- Zaman: LITE MVP kapsamı (tek seviye, tek oyuncu, backend yok) 1 günden az geliştirme gerektirir. ✅

## GO / NO-GO önerisi: **GO**
Gerekçe: Teknik risk yok (standart 2D canvas fiziği, ball-bounce'ta kanıtlanmış), maliyet sıfıra yakın, kapsam brief'in Q1–Q4 netleştirmesiyle net ve küçük. Dört ölçülebilir KPI ile ilerlemek uygun.

## Kalite kapısı raporu
- "En az 3 ölçülebilir KPI" → ✅ (yukarıda 4 KPI, hedef + ölçüm yöntemiyle)
- "GO/NO-GO kararı gerekçeli" → ✅ (GO, teknik/ekonomik/zaman gerekçesiyle)
