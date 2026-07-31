# DL-07-002: Risk kabulü — istemci skoru ve `localStorage` rekoru güvenilmezdir (sunucu doğrulaması yok)

- Tarih: 2026-07-31
- Faz: 7 — Güvenlik Tasarımı
- Mod: AUTOPILOT
- Karar: Oyuncunun bellekteki skoru ve `localStorage`'daki en yüksek skoru serbestçe değiştirebilmesi
  **kabul edilen artık risk** olarak kayda geçirilir; sunucu tarafı doğrulama, imzalama veya anti-cheat
  eklenmez. Aynı şekilde uygulama düzeyinde rate limiting eklenmez (hacim koruması nginx/Cloudflare
  katmanına bırakılır). Kabulün sınırı nettir: kurcalanmış değer **yanlış bir rekor** üretebilir ama
  **güvenlik açığı üretemez** — çünkü SEC-8/SEC-10 depo değerini sayıya daraltır ve hiçbir yerde
  kod/HTML olarak yorumlanmasına izin vermez.
- Değerlendirilen alternatifler: (a) sunucu tarafı skor doğrulama ucu + depo; (b) HMAC/checksum ile
  kurcalama tespiti ve rekoru sıfırlama; (c) rekoru tamamen kaldırmak (FR-4'ü düşürmek);
  (d) uygulama içi `express-rate-limit` bağımlılığı.
- Gerekçe: Rekor anonim, yerel, paylaşılmayan bir sayıdır — ödül, sıralama veya otorite üretmez, yani
  hile eden yalnız kendi deneyimini bozar (etki: tek kullanıcı, tek tarayıcı). (a) ürünün sunucusuz/
  state'siz tasarımını bozar ve A01/A03/A07 yüzeyi açar; (b) doğrulama anahtarı da istemcide olacağı için
  kriptografik değeri sıfırdır, yalnız karmaşıklık ekler; (c) FR-4 zorunlu gereksinimdir, düşürülemez;
  (d) NFR-3'ün 0-bağımlılık hedefine aykırı ve statik dosya servisinde altyapı katmanı zaten daha etkili.
- Riskler: Ürün ileride **liderlik tablosu, isimli rekor veya skor gönderimi** kazanırsa bu kabul
  GEÇERSİZDİR — o durumda skor bir otorite verisi olur ve Faz 7 yeniden koşulmalıdır (A01/A02/A04/A07
  satırları). Rate limiting yokluğu, sunucu doğrudan internete açılırsa (nginx/CDN olmadan) bağlantı seli
  riskini yükseltir → deploy topolojisi `127.0.0.1` bağlama + nginx önü ile bu varsayımı korur (SEC-14).
- Geri alınabilirlik: Yüksek (kabul yalnız bir "eklemedik" kararıdır; doğrulama/limitleme sonradan
  eklenebilir, mevcut kodun hiçbir sözleşmesini kırmaz).
- İnsan onayı: Otomatik — kabul edilen risklerin ikisi de **düşük şiddet**: PII yok, kimlik yok, para/veri
  kaybı yok, çok-kullanıcılı etki yok ve kurcalama bir yetki yükselmesine dönüşemez (SEC-8 daraltması).
  Kritik bir risk kabulü OLMADIĞI için insan kapısı açılmadı; yeniden değerlendirme tetikleyicileri
  (liderlik tablosu / skor gönderimi / doğrudan internete açık sunucu) yukarıda yazılıdır.
- Varsayım mı?: Evet — AUTOPILOT varsayımı: ürün tek oyunculu ve yerel kalacak, rekor için rekabetçi/
  paylaşılan bir kullanım beklenmiyor (FR-4 yalnız "kendi rekorum kalıcı olsun" der).
