# 03 — Requirement Analizi: breakout

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Profil: LITE

## Açık soruların çözümü (0b brief'inden)
- Kontrol: paddle hem fare hareketiyle hem de klavye (sol/sağ ok) ile kontrol edilir — ikisi birden aktif.
- Can sistemi: 3 can; top paddle altından kaçınca can azalır, 3. canın bitişinde oyun biter.
- Görsel stil: retro piksel.
- Zorluk: top hızı zamanla kademeli artar.

## Fonksiyonel gereksinimler

### FR-1: Paddle kontrolü
- **User story:** Oyuncu olarak, paddle'ı fare hareketiyle veya klavye sol/sağ ok tuşlarıyla yatayda hareket ettirmek istiyorum.
- **Kabul kriterleri:**
  - Given oyun sürüyor, when fare imleci yatayda hareket eder, then paddle imlecin x konumunu (ekran/duvar sınırları içinde) takip eder.
  - Given oyun sürüyor, when sol/sağ ok tuşuna basılı tutulur, then paddle o yönde sabit hızla hareket eder ve duvarları aşmaz.
- **Öncelik:** Must

### FR-2: Top fiziği ve sekme
- **User story:** Oyuncu olarak, topun duvarlara/paddle'a/bloklara gerçekçi açıyla sekmesini istiyorum.
- **Kabul kriterleri:**
  - Given top üst/sol/sağ duvara çarpar, then yansıma açısıyla (gelme açısı = gitme açısı) sekmeye devam eder.
  - Given top paddle'a çarpar, then çarpma noktasının paddle merkezine uzaklığına göre yatay sekme açısı değişir (kenara çarpma daha dik açı verir).
  - Given top bir bloğa çarpar, then blok kırılır ve top ilgili eksende yön değiştirir.
- **Öncelik:** Must

### FR-3: Can sistemi ve oyun bitişi
- **User story:** Oyuncu olarak, topu kaçırdığımda can kaybetmek ve canlarım bitince oyunun bittiğini görmek istiyorum.
- **Kabul kriterleri:**
  - Given top paddle'ın altından ekran dışına çıkar, then can 1 azalır ve top/paddle başlangıç konumundan yeniden başlar (can kaldıysa).
  - Given can 0'a düşer, then oyun durur ve "Oyun bitti" ekranı final skorla gösterilir.
  - Given tüm bloklar kırılır, then oyun durur ve "Kazandın" ekranı final skorla gösterilir.
- **Öncelik:** Must

### FR-4: Skor sayacı ve en yüksek skor kalıcılığı
- **User story:** Oyuncu olarak, kırdığım her blokla skorumun artmasını ve en yüksek skorumun kalıcı olmasını istiyorum.
- **Kabul kriterleri:**
  - Given bir blok kırılır, then skor sayacı ≤1 sn içinde güncellenir.
  - Given oyun biter (kazandın/oyun bitti), when güncel skor önceki en yüksek skoru geçer, then yeni en yüksek skor `localStorage`'a yazılır ve ekranda gösterilir.
  - Given sayfa yeniden açılır, then en yüksek skor `localStorage`'dan okunup gösterilir.
- **Öncelik:** Must

### FR-5: Kademeli zorluk artışı
- **User story:** Oyuncu olarak, oyun ilerledikçe topun hızlanmasını istiyorum, böylece meydan okuma hissedeyim.
- **Kabul kriterleri:**
  - Given oyun sürüyor, when belirli bir süre/blok-kırma eşiği geçilir, then top hızı kademeli artar (üst sınırla sınırlı, oynanamaz hale gelmez).
- **Öncelik:** Should

### FR-6: Yeniden başlatma
- **User story:** Oyuncu olarak, oyun bitince sayfayı yenilemeden tekrar oynamak istiyorum.
- **Kabul kriterleri:**
  - Given "Oyun bitti"/"Kazandın" ekranı, when "Yeniden başlat" tıklanır, then can/skor/bloklar/top/paddle başlangıç durumuna döner.
- **Öncelik:** Must

## Fonksiyonel olmayan gereksinimler (kalite kapısı: ölçülebilir)
| ID | Kategori | Gereksinim | Ölçüt / Hedef |
|----|----------|------------|----------------|
| NFR-1 | Performans | Oyun döngüsü akıcılığı | ~60 FPS (rAF tabanlı, manuel/DevTools gözlem) |
| NFR-2 | Performans | Blok kırılıp skor güncellenmesi gecikmesi | ≤ 1 sn |
| NFR-3 | Uyumluluk | Güncel masaüstü tarayıcılarda çalışmalı | Framework'süz HTML/Canvas/JS, ek derleme yok |
| NFR-4 | Kalıcılık | En yüksek skor kalıcı olmalı | `localStorage`, sayfa yenilenince korunur (statik kod incelemesiyle doğrulanır) |

## İzlenebilirlik
| FR | Karşıladığı KPI / iş hedefi |
|----|------------------------------|
| FR-1 | Başarı kriteri 1 (paddle kontrolü) |
| FR-2 | Başarı kriteri 1 (top fiziksel sekme) |
| FR-3 | Başarı kriteri 2 (can sistemi + oyun bitişi/kazandın) |
| FR-4 | Başarı kriteri 3 (skor + en yüksek skor kalıcılığı + FPS) |
| FR-5 | Başarı kriteri 4 (top hızı zamanla artıyor) |
| FR-6 | Kapsam sınırı dışı kalmayan kullanılabilirlik gereksinimi |

## Kalite kapısı raporu
- "Her FR'nin kabul kriteri var" → ✅ (FR-1..FR-6, Given/When/Then kriterleriyle)
- "NFR'ler ölçülebilir" → ✅ (NFR-1..NFR-4, ölçüt/hedef sütunuyla)
