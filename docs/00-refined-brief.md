# 00 — Rafine Proje Brief'i: breakout

> **Faz 0b çıktısı.** Ham fikir, kullanılabilen en iyi modelle yapılandırılmış brief'e dönüştürülür.
> Bu brief kullanıcıya HAM FİKİRLE YAN YANA sunulur; **onaylanmadan Faz 0 (00-idea.md) üretilmez.**
> Onay sonrası bu brief, Faz 0 ve sonraki tüm fazların girdisidir.

- Tarih: 2026-07-31 | Rafine eden model: sonnet (hızlı) | Onay durumu: **Onaylandı** (dashboard, 2026-07-31)

## Ham fikir (kullanıcının girdisi — değiştirilmez)
> Blok kırma oyunu yapar misin ?

## Rafine problem (tek cümle)
Kullanıcının tarayıcıda tek başına, fare veya klavye ile oynayabileceği klasik bir blok kırma (Breakout/Arkanoid tarzı) oyunu yok.

## Hedef kitle
Tek oyunculu, kısa mola/eğlence arayan herhangi bir kullanıcı; masaüstü tarayıcıda fare veya klavye ile oynar.

## Kısıtlar & varsayımlar (AF-001 kapanışı)
- Platform/runtime: Web (tarayıcı), istemci-taraflı; sunucu/backend gerekmez (statik site, Canvas/JS).
- Çevrimiçi/çevrimdışı, veri konumu: Tamamen çevrimdışı çalışabilir; en yüksek skor yalnız `localStorage`'da.
- Zaman/kota bütçesi: LITE profil, küçük artefakt bütçesi.
- Varsayımlar: Tek oyunculu (çok oyunculu yok), paddle HEM fare hareketiyle HEM de sol/sağ ok tuşlarıyla kontrol edilir (ikisi birden desteklenir), 3 can, görsel stil retro piksel, top zamanla hızlanır (zorluk artışı var), sabit blok düzeni/tek seviye v1, power-up'lar v1 kapsamı dışı.

## Başarı kriterleri (ölçülebilir)
1. Paddle hem fare hareketiyle hem de klavye (sol/sağ ok) ile yatayda hareket ettirilebiliyor, top fiziksel olarak sekiyor.
2. Oyuncu 3 canla başlıyor; tüm bloklar kırılınca "kazandın", top paddle'ın altından kaçarsa can azalıyor ve 3 can biterse "oyun bitti" gösteriliyor.
3. Skor blok kırıldıkça artıyor, en yüksek skor `localStorage`'da kalıcı; oyun 60 FPS civarı akıcı çalışıyor.
4. Top hızı oyun süresi ilerledikçe kademeli artıyor (zorluk artışı gözlemlenebilir).
5. Görsel stil retro piksel sanat (Faz 6 UI/UX bunu temel alır).

## Kapsam sınırı (v1'de yapılmayacaklar)
- Çok oyunculu / online skor tablosu yok.
- Power-up'lar (çoklu top, geniş paddle vb.) yok.
- Birden fazla seviye/harita düzeni yok (v1: tek sabit blok düzeni).
- Mobil dokunmatik kontrol v1 kapsamı dışı.

## Netleştirilen sorular
- [x] **Q1** 🔴 Paddle nasıl kontrol edilsin? → **Her ikisi de desteklensin (fare + klavye sol/sağ ok)**
- [x] **Q2** 🔴 Can (life) sistemi olsun mu? → **Evet, 3 can**
- [x] **Q3** ⚪ Görsel stil tercihi nedir? → **Retro piksel**
- [x] **Q4** ⚪ Zorluk artışı olsun mu (top hızı zamanla artsın mı)? → **Evet, top zamanla hızlansın**

## Önerilen profil ve ilk mod
- Profil: LITE · Gerekçe: Küçük, tek özellikli, solo/kişisel bir oyuncak proje — kurumsal süreçlere gerek yok.

---
## Onay kaydı
- 2026-07-31 — Beklemede
