# DL-04-002: Çarpışma tespiti & blok modeli — statik grid dizisi + AABB + alt-adımlı hareket

- Tarih: 2026-07-31
- Faz: 4 — Çözüm Analizi
- Mod: AUTOPILOT
- Karar: Bloklar `bricks[row][col]` biçiminde statik bir grid dizisinde tutulacak (konum satır/kolon indeksinden türetilir, veriden değil); çarpışma AABB (eksen hizalı dikdörtgen) testiyle yapılacak ve topun frame-başına hareketi, hızı blok boyutunun bir kesrini aşınca alt-adımlara (sub-step) bölünecek. Kırılan blok `alive=false` işaretlenir, `aliveCount` sayacı kazanma koşulunu (FR-3) belirler.
- Değerlendirilen alternatifler: (B2) Blokları nesne listesi olarak tutup her frame tüm listeyi lineer taramak; (B3) matter.js gibi bir 2D fizik motoruna rigid-body + collision event olarak devretmek.
- Gerekçe: v1'in tek sabit düzeni grid modeliyle birebir örtüşüyor; top konumundan aday satır/kolon O(1) hesaplanınca hem NFR-1 (60 FPS) rahatça karşılanır hem de FR-2'nin "doğru eksende yön değiştirme" kuralı giriş kenarından (üst/alt yüzey vs yan yüzey) netleşir. B2 n≈40'ta çalışır ama örtüşme derinliğini elle çözmeyi gerektirir ve ölçeklenmez; asıl kazancı (dinamik düzen) v1 kapsamında değil. B3, DL-04-001 ile aynı NFR-3 ihlali nedeniyle elenir ve kodun tamamını motor API'sine bağlayarak geri alınabilirliği düşürür. Alt-adımlı hareket, FR-5'in kademeli hız artışının doğurduğu tünelleme (topun bloğun içinden geçmesi) hatasını mimari düzeyde önler — bu, hız artışını gereksinim olarak kabul etmenin doğal bedeli.
- Riskler: Aynı frame'de birden fazla bloğa temas (köşe vuruşu) çift kırılma veya yanlış yansıma üretebilir → Faz 9'da alt-adım başına en fazla bir eksen yansıması kuralı + birim test. Alt-adım sayısı hız üst sınırıyla birlikte ayarlanmazsa frame maliyeti artar; hız üst sınırı (FR-5) bunu sınırlar.
- Geri alınabilirlik: Yüksek (grid → nesne listesi dönüşümü çarpışma modülüne lokaldir; çoklu seviye ihtiyacı doğarsa grid tanımı veri dosyasına taşınır, algoritma değişmez)
- İnsan onayı: Otomatik
- Varsayım mı?: Evet — AUTOPILOT varsayımı: blok düzeni kod içinde sabit bir grid tanımı olarak tutulur ve blok başına puan sabittir (00-idea "tek sabit blok düzeni/tek seviye (v1)" kapsamına dayanarak); harici seviye dosyası v1'de yok.
