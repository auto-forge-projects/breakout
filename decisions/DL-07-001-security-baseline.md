# DL-07-001: Güvenlik temeli — bağımlılıksız header/CSP katmanı + güvenilmez `localStorage` sınırı

- Tarih: 2026-07-31
- Faz: 7 — Güvenlik Tasarımı
- Mod: AUTOPILOT
- Karar: breakout'un güvenlik temeli iki hatta oturur. (1) **Sunucu:** ek bağımlılık (helmet) OLMADAN
  elle yazılmış bir header middleware'i (`default-src 'none'` temelli sıkı CSP, `nosniff`,
  `X-Frame-Options: DENY` + `frame-ancestors 'none'`, `no-referrer`, `Permissions-Policy`, HSTS),
  sertleştirilmiş `express.static` (sabit kök, `dotfiles:'ignore'`, `redirect:false`), gövde
  parser/CORS/cookie YOK, yalnız GET/HEAD, minimal `/health`, generic error handler. (2) **İstemci:**
  `localStorage['breakout.highscore.v1']` **güvenilmez girdi** olarak sınıflandırılır ve tek geçit olan
  `storage.js` içinde katı sayısal daraltmadan geçirilir (uzunluk kapısı → `Number.isInteger` →
  `0..400` clamp → aksi halde `0`), depo değeri hiçbir koşulda HTML/fonksiyon/URL'e çevrilmez
  (`innerHTML`/`eval` yasağı). Toplam 17 madde SEC-1..SEC-17 olarak Faz 9'a devredildi.
- Değerlendirilen alternatifler: (a) `helmet` paketi ile header yönetimi; (b) rekoru hiç kalıcılaştırmama
  (ball-bounce gibi kalıcılıksız kalıp); (c) rekoru imzalı/şifreli saklamak (HMAC ile kurcalama tespiti);
  (d) rekoru sunucuda tutmak (ucu + depo eklemek).
- Gerekçe: (a) NFR-3 "0 runtime bağımlılık / ek derleme yok" ilkesini bozar ve 6 header için tedarik
  zinciri yüzeyi ekler — header'lar elle 15 satırda yazılır. (b) FR-4 kalıcılığı zorunlu kılar, atılamaz.
  (c) İmza anahtarı da istemcide olurdu → kriptografik olarak faydasız güvenlik tiyatrosu; doğru cevap
  değeri gizlemek değil, ona **güvenmemek**tir. (d) Sunucu ucu + kimlik + depo eklemek A01/A03/A07
  yüzeylerini yoktan var eder; anonim yerel bir sayı için orantısız.
- Riskler: Elle yazılan CSP fazla sıkı olursa (ör. `script-src` ESM modüllerini kapsamazsa) oyun
  yüklenmez → Faz 11'de tarayıcı/duman kontrolü ile doğrulanır. `SCORE_MAX = 400` seviye büyüdüğünde
  bayatlar → sabit `LEVEL` gridinden türetilerek (satır×kolon×10) drift engellenir. Header'lar CI'da
  otomatik test edilmezse zamanla düşebilir → Faz 11'de `/health` yanıtı üzerinde header assertion'ı.
- Geri alınabilirlik: Yüksek (header middleware tek dosyada izole; depo doğrulaması yalnız `storage.js`
  içinde — ikisi de ürün mantığına dokunmadan değiştirilebilir).
- İnsan onayı: Otomatik
- Varsayım mı?: Evet — AUTOPILOT varsayımı: yayın HTTPS arkasında (wildcard TLS + nginx) yapılacağı için
  HSTS eklenmesi güvenlidir; düz HTTP yayın senaryosunda HSTS satırı kaldırılmalıdır.
