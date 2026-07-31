# 07 — Güvenlik Tasarımı: breakout

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Profil: LITE
- Girdi: `docs/03-requirements.md`, `docs/05-architecture.md`

## Saldırı yüzeyi özeti
İki bileşen: (1) tarayıcıda çalışan statik istemci (Canvas 2D + düz ESM, 0 runtime bağımlılık),
(2) `server.js` — Express `static` + `GET /health`. **Sunucuya giden kullanıcı verisi yok**
(gövde parser yok, oyun/skor ucu yok, kimlik/DB/oturum yok). ball-bounce'tan **ayrışan tek nokta
FR-4'tür: `localStorage['breakout.highscore.v1']` ile kalıcı en yüksek skor.** Bu, üründeki tek
kalıcı depo ve tek **güvenilmez girdi kanalıdır** — değeri kullanıcı (DevTools) veya aynı origin'de
çalışan başka bir kod değiştirebilir; kod onu ASLA doğrulanmış saymamalıdır. Risk üç yerde yoğunlaşır:
**`localStorage` sınırı (storage.js)**, **statik servis + tarayıcı içerik politikası (header'lar)**,
**npm tedarik zinciri + imaj/CI hattı**.

## Varlıklar ve veri sınıflandırma
| Veri | Sınıf | Nerede duruyor | Koruma |
|------|-------|----------------|--------|
| Oyun state'i (`lives`, `score`, top/paddle, `bricks`, `events`) | Public / geçici | Yalnız tarayıcı belleği (tek obje) | Kalıcılık yok; yenileme sıfırlar. Skor otorite değil (bkz. A04) |
| En yüksek skor (`highScore`) | Public / **kalıcı, kullanıcı-yazılabilir** | `localStorage['breakout.highscore.v1']` — istemci diski, origin başına | Okumada katı sayısal doğrulama + clamp (SEC-8), yazmada yalnız clamp'li tamsayı (SEC-9), `try/catch` (NFR-4) |
| Statik varlıklar (`index.html`, `style.css`, `game.js`, `physics.js`, `bricks.js`, `storage.js`) | Public | Repo + imaj + `public/` | Salt okunur servis; yazma ucu yok; sabit statik kök (SEC-3) |
| `/health` yanıtı | Public | Bellek (sabit `{status:"ok"}`) | Sürüm/uptime/env/hostname sızdırmaz (SEC-5) |
| HTTP erişim logları (IP, UA, yol) | Internal (IP zayıf-PII) | Container stdout | Oyun/skor verisi loglanmaz, kısa saklama (SEC-16) |
| Deploy sırları (SSH key, registry token) | Confidential | GitHub Secrets + sunucu ortamı | Repoda/imajda düz sır YOK; `deploy.json` yalnız `env_ref` (SEC-15) |
| PII | — | Yok | Toplanmıyor: hesap, isim/nick girişi, form, çerez, analitik yok — en yüksek skor **anonim bir sayıdır** |

## Threat model (STRIDE)
| Bileşen | S (Spoofing) | T (Tampering) | R (Repudiation) | I (Info Disclosure) | D (DoS) | E (Elevation) | Önlemler |
|---------|---|---|---|---|---|---|----------|
| Oyun çekirdeği (`physics.js`, `bricks.js`) | – (kimlik yok) | Orta: konsoldan `lives`/`score`/`speedFor` değiştirilebilir | – (hiçbir işlem sunucuya gitmiyor) | Düşük: kod public | **Orta: bozuk `dt`/hız ile sınırsız alt-adım döngüsü sekmeyi kilitleyebilir** | – (tarayıcı sandbox'ı) | Hile etkisi oyuncunun kendi sekmesiyle sınırlı (liderlik tablosu yok); `DT_MAX` + `SUBSTEP_MAX≤8` sınırlı döngü garantisi (SEC-11) |
| Girdi adaptörü (`game.js`: pointermove/keydown/click) | – | Düşük: sentetik olay üretilebilir (kendi sekmesinde) | – | Düşük | Düşük: olay seli yalnız kendi karesini yavaşlatır | Düşük | Paddle `x` her zaman duvarlara clamp'lenir; yalnız ArrowLeft/ArrowRight/Space allowlist'i; olay verisi asla koda/HTML'e dönüşmez (SEC-12, SEC-7) |
| **`storage.js` ↔ `localStorage` sınırı** | – | **Yüksek olasılık, düşük etki: depodaki değer serbestçe düzenlenebilir (`"9e999"`, `"<img onerror>"`, `{}` , 10 MB metin)** | – | Düşük: yalnız kendi tarayıcısında duran anonim sayı | Orta: aşırı büyük/bozuk değer parse/render sırasında donma veya HUD bozulması | **Orta: değer HTML olarak basılırsa DOM-XSS'e yükselir** | Depo **güvenilmez girdi** sayılır: uzunluk kapısı → `Number()` → `Number.isInteger` → `0 ≤ v ≤ SCORE_MAX(400)`, aksi halde `0` (SEC-8); render `textContent`/`fillText` ile (SEC-7, SEC-10); `try/catch` ile oyun düşmez |
| Express statik servis | – | Düşük: sunucu salt okunur | Düşük | **Ana risk: path traversal / dotfile ifşası** | Orta: bağlantı seli | – | `express.static` sabit kök + `dotfiles:'ignore'` + `redirect:false`; yol kullanıcı girdisinden KURULMAZ (SEC-3); yalnız GET/HEAD (SEC-4) |
| `GET /health` | – | – | – | Düşük: sürüm/env sızıntısı | Düşük: ucuz sabit yanıt | – | Sabit gövde; `PORT` env güvenli tamsayı ayrıştırması (SEC-1, SEC-5) |
| npm zinciri (`express`) + Docker/CI hattı | Orta: paket adı ele geçirme | Orta: postinstall betiği, imaja müdahale | Düşük | Orta: sır çalan paket / imaja gömülü sır | Düşük | Yüksek: build ve container ana kullanıcısı | Sabit sürüm + lockfile + `npm ci` + `npm audit` (SEC-6); pinned `node:alpine` + `USER node` + `127.0.0.1` bağlama (SEC-14); CI minimum `permissions` + pinned action (SEC-17) |

## Auth / Authz stratejisi
**Kimlik doğrulama ve yetkilendirme YOKTUR — bu bilinçli bir tasarım kararıdır.** Oyun anonim,
tek oyunculu ve tamamen istemci-içidir; korunacak hesap, ayrıcalıklı işlem veya paylaşılan kaynak
yoktur. Sunucu tarafında **her istemci eşit ve yetkisizdir**; erişilebilen tek şey public statik
dosyalar + `/health`. Yazma ucu, admin paneli, oturum (çerez/JWT/sunucu oturumu) yok → oturum çalma
/sabitleme sınıfı tehditler doğmaz.

En yüksek skorun yetkilendirme sınırı **origin**'dir: `localStorage` yalnız
`https://breakout.<domain>` origin'i tarafından okunur/yazılır ve her proje kendi alt alan adında
yayınlandığı için başka bir AutoForge projesi bu anahtara erişemez. Aynı origin içinde ise kullanıcı
kendi verisinin sahibidir — yani "kendi rekorunu değiştirmek" bir yetki ihlali değil, kabul edilen
davranıştır (bkz. artık riskler). Clickjacking/iframe yoluyla üçüncü bir sitenin bu origin'i
kullanmasını `frame-ancestors 'none'` + `X-Frame-Options: DENY` engeller (SEC-2).
Sunucu tarafı skor gönderimi veya liderlik tablosu eklenirse bu bölüm ile A01/A02/A07 satırları
YENİDEN değerlendirilmelidir.

## OWASP Top 10 (2021) değerlendirmesi
| # | Risk | Uygulanabilir mi | Önlem / Neden uygulanamaz |
|---|------|------------------|----------------------------|
| A01 | Broken Access Control | **Kısmen** | Rol/kaynak sahipliği yok (korunan kaynak yok). Gerçek yüzey **statik servis**: sabit `path.join(__dirname,'public')` kökü, `dotfiles:'ignore'`, `redirect:false`, kullanıcı girdisinden dosya yolu türetilmez, `res.sendFile(req.*)` yasak (SEC-3); CORS açılmaz; dizin listeleme yok. Tarayıcı tarafında erişim sınırı origin'dir; `frame-ancestors 'none'` ile üçüncü-parti çerçevelemesi kesilir (SEC-2). |
| A02 | Cryptographic Failures | **Kısmen** | Şifrelenecek gizli veri yok — kalıcı tek değer **anonim bir tamsayı** (en yüksek skor); parola/token/PII yok, dolayısıyla at-rest şifreleme veya hash gereksiz (localStorage'ı şifrelemek de anlamsız: anahtar aynı istemcide olurdu). Transit güvenliği yine de gerekli: HTTPS + HTTP→HTTPS + `Strict-Transport-Security` (SEC-2). Kendi kripto yazılmaz; `Math.random` güvenlik amacıyla kullanılmaz (fizik deterministik, `LAUNCH_ANGLE` sabit). |
| A03 | Injection | **Düşük ama var** | SQL/NoSQL/ORM/shell yok; sunucu kullanıcı girdisi işlemez (gövde parser eklenmez — SEC-4) → klasik injection yolu kapalı. Kalan yüzey **DOM-XSS ve depo-kaynaklı injection**: HUD (can/skor/rekor) ve overlay metni `innerHTML` ile değil `textContent`/canvas `fillText` ile yazılır; `eval`/`new Function`/string-`setTimeout` yasak (SEC-7). `localStorage`'dan okunan değer **string olarak asla DOM'a/HTML'e verilmez**, önce sayıya indirgenir (SEC-8, SEC-10). |
| A04 | Insecure Design | **Evet** | Tasarım güvenlik lehine: state'siz sunucu, sunucuda sıfır kullanıcı verisi, 0 istemci bağımlılığı, saf çekirdek + tek `storage.js` kalıcılık sınırı (tek denetim noktası). Bilinçli güvensizlik: **istemci skoru ve `localStorage` rekoru güvenilmezdir**; kabul edilebilir çünkü hiçbir ödül/otorite/paylaşım üretmez (liderlik tablosu yok, DL-07-002). Skor sunucuya taşınırsa tasarım yeniden gözden geçirilir. |
| A05 | Security Misconfiguration | **Evet — bu mimarinin en somut riski** | `app.disable('x-powered-by')` (SEC-1); güvenlik header'ları bağımlılık eklemeden elle (helmet YOK, SEC-2): `Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy: geolocation=(), camera=(), microphone=()`, HSTS. Not: CSP `localStorage`'ı KAPSAMAZ → depo doğrulaması ayrı bir hat olarak zorunludur (SEC-8). Hata gövdesi stack/dosya yolu sızdırmaz (SEC-13), container non-root (SEC-14). |
| A06 | Vulnerable & Outdated Components | **Evet** | Tek runtime bağımlılık `express` (sabit sürüm — mimari kararı), istemcide **sıfır** bağımlılık/CDN/sprite dosyası. `package-lock.json` commit'lenir, kurulum `npm ci`, CI'da `npm audit --omit=dev --audit-level=high`; base imaj sabit etiketli (SEC-6, SEC-14). Yeni bağımlılık eklemek bilinçli karar + DL gerektirir. |
| A07 | Identification & Authentication Failures | **Hayır** | Kimlik/oturum/parola/token/"oyuncu adı" mekanizması hiç yok (bkz. Auth bölümü); en yüksek skor bir kimliğe bağlı DEĞİL → brute force, credential stuffing, oturum sabitleme sınıfı tehditler doğmaz. Auth veya isimli liderlik tablosu eklenirse bu satır geçersizdir. |
| A08 | Software & Data Integrity Failures | **Evet** | Dış script/CDN yüklenmez (SRI ihtiyacı doğmaz), auto-update yok, **deserialization yüzeyi yalnız `localStorage` okumasıdır**: `JSON.parse` ile rastgele şekilli obje kabul edilmez, ham string davranışa (fonksiyon/anahtar/URL) çevrilmez; yalnız sayısal daraltma yapılır (SEC-8). Zincir bütünlüğü: lockfile + `npm ci` + pinned base image + imaj yalnız kendi CI'ından push (SEC-6, SEC-14, SEC-17). |
| A09 | Security Logging & Monitoring Failures | **Kısmen** | Denetlenecek güvenlik olayı (giriş, yetki reddi, para hareketi) yok → denetim izi gereksiz. Operasyonel görünürlük gerekir: sunucu başlatma/çökme logu + `/health` probe (Faz 14); loga oyun/skor verisi, sorgu gövdesi veya sır YAZILMAZ, IP logları kısa saklanır (SEC-16). Alarm: `/health` yanıt vermiyorsa. |
| A10 | Server-Side Request Forgery (SSRF) | **Hayır** | Sunucu **hiçbir giden istek yapmaz** (`fetch`/`http.request`/proxy/webhook/URL parametresi yok) ve kullanıcının etkileyebileceği bir hedef URL kavramı yoktur; istemcide de `connect-src 'none'` ile ağ çıkışı kapalıdır. Kod incelemesiyle doğrulanır: `server.js` içinde giden ağ çağrısı olmamalı (SEC-17). |

## AI tedarik zinciri & fabrika tehditleri
| Tehdit | Uygulanabilir? | Önlem / Neden uygulanamaz |
|--------|----------------|----------------------------|
| Prompt injection | Hayır | Üründe LLM/model çağrısı yok; kullanıcı girdisi hiçbir prompt'a girmez |
| Repo/artefakt prompt poisoning | Düşük | Repo tek sahipli, fabrika üretimi; dış katkı/PR yolu yok |
| Dependency confusion | Düşük | Tek public paket (`express`), iç/özel scope paketi yok, registry varsayılan |
| Malicious package scripts | Evet | `npm ci` + lockfile; yeni bağımlılık eklenmez; CI'da `--ignore-scripts` değerlendirilir (SEC-6) |
| Shell komut güvenliği | Hayır | Uygulama `child_process` kullanmaz; kullanıcı içeriği/env kabuğa geçmez (SEC-1: `PORT` sayısal ayrıştırma) |
| Workspace / path & symlink escape | Evet | Statik kök sabit, `dotfiles:'ignore'`; sembolik link statik kök dışına çıkmamalı (SEC-3) |
| Secret leakage | Evet | Repoda/imajda düz sır yok; `.gitignore`/`.dockerignore` ile `.env`+`node_modules` hariç; log'a sır yazılmaz (SEC-15, SEC-16) |
| Docker build izolasyonu | Evet | Pinned `node:<sürüm>-alpine`, `USER node`, build-arg ile sır geçirilmez, imajda dev bağımlılık yok (SEC-14) |
| Üretilen CI güvenliği | Evet | Workflow minimum `permissions: contents:read`, `pull_request_target` yok, action'lar sabit sürümle (SEC-17) |
| MCP / tool izinleri | Hayır | Ürün ajan/araç yüzeyi içermez (fabrika tarafı kapsam dışı) |

## Faz 9'a devredilen güvenlik gereksinimleri (implementasyon listesi)
- [ ] **SEC-1:** `app.disable('x-powered-by')`; `PORT` env'i `Number.parseInt` + `Number.isInteger` + `1..65535` aralık kontrolüyle okunur, geçersizse sabit varsayılana düşer (env kabuğa/şablona interpolasyon YOK).
- [ ] **SEC-2:** Bağımlılık eklemeden (helmet YOK) elle güvenlik header middleware'i: A05'teki tam CSP + `X-Content-Type-Options: nosniff` + `X-Frame-Options: DENY` + `Referrer-Policy: no-referrer` + `Permissions-Policy` + `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- [ ] **SEC-3:** `express.static(path.join(__dirname,'public'), { dotfiles:'ignore', index:'index.html', redirect:false })`; kullanıcı girdisinden dosya yolu KURULMAZ, `res.sendFile(req.params/query)` kullanılmaz, statik kök dışına link/yol çözümü yok.
- [ ] **SEC-4:** Gövde parser (`express.json`/`urlencoded`), cookie parser ve CORS EKLENMEZ; yalnız GET/HEAD servis edilir, diğer metodlar 404/405 döner.
- [ ] **SEC-5:** `GET /health` yalnız `{"status":"ok"}` döner — sürüm, uptime, env, hostname, yol sızdırmaz.
- [ ] **SEC-6:** `express` sabit sürüm; `package-lock.json` commit'li; kurulum `npm ci`; CI'da `npm audit --omit=dev --audit-level=high` (Faz 12). İstemcide 0 bağımlılık/CDN korunur.
- [ ] **SEC-7:** İstemcide `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, string-`setTimeout/setInterval` **YASAK**; HUD (can/skor/rekor) ve overlay metni yalnız `textContent` veya canvas `fillText` ile yazılır. (Faz 10/11 statik grep ile doğrular.)
- [ ] **SEC-8:** `storage.js:readHighScore(storage)` depoyu **güvenilmez girdi** sayar: (a) ham değer `typeof === 'string'` ve uzunluk ≤ 16 değilse reddet, (b) `Number(raw)` → `Number.isInteger` değilse reddet (NaN/Infinity/`"9e999"`/`"1e3"` dışı gösterimler dahil), (c) `0 ≤ v ≤ SCORE_MAX (400 = 40 blok × 10)` aralığı dışındaysa reddet, (d) her reddin sonucu **`0`** (istisna fırlatmaz, oyunu düşürmez). `JSON.parse` ile rastgele şekilli obje kabul edilmez; ham string HTML'e, fonksiyona, obje anahtarına veya URL'e ÇEVRİLMEZ.
- [ ] **SEC-9:** `storage.js:writeHighScore(storage, score)` yalnız `Math.trunc` + `SCORE_MAX` clamp'li **tamsayıyı** ve yalnız sürümlü anahtara (`breakout.highscore.v1`) yazar; başka hiçbir veri (oyun state'i, zaman damgası, kimlik, UA) kalıcılaştırılmaz. Tüm depo erişimi `try/catch` içinde (gizli sekme / kota / `localStorage` erişilemez) — hata yutulur, oyun sürer, yalnız kalıcılık kaybolur (NFR-4).
- [ ] **SEC-10:** HUD'a basılan `highScore` her zaman doğrulanmış **sayıdır**; render `String(number)` ile yapılır ve basamak sayısı sınırlıdır → bozuk/aşırı uzun depo değeri ne layout bozar ne de metin olarak yorumlanır.
- [ ] **SEC-11:** Kendi kendine DoS koruması: `step()` alt-adım döngüsü `SUBSTEP_MAX = 8` ile ÜST SINIRLI, `dt` `DT_MAX = 1/30` ile clamp'li; fizikte koşulu duruma bağlı sınırsız `while` YOK; her yansımadan sonra hız `speedFor()` ile normalize edilir (hız kaçağı → donma yolu kapalı).
- [ ] **SEC-12:** Girdi bağlama sınırlı ve savunmalı: yalnız `pointermove`/`keydown`/`keyup`/`click` dinlenir; klavye allowlist'i `ArrowLeft`/`ArrowRight`/`Space` (diğer tuşlarda `preventDefault` çağrılmaz → tarayıcı kısayolları/erişilebilirlik bozulmaz); `setPaddleX`/`movePaddle` sonucu her çağrıda `[wall, w - wall - paddle.w]` aralığına clamp'lenir; olay verisi asla koda/HTML'e/depoya geçmez.
- [ ] **SEC-13:** Generic error handler: 404/500 gövdeleri stack trace, dosya yolu, iç hata mesajı veya modül adı içermez.
- [ ] **SEC-14:** Dockerfile (Faz 12): pinned `node:<sürüm>-alpine`, `USER node` (non-root), imajda sır/dev bağımlılık yok, container yalnız `127.0.0.1:<host_port>`'a bağlanır (TLS/nginx önde).
- [ ] **SEC-15:** `.gitignore` + `.dockerignore` ile `.env`, `node_modules`, yerel artıklar hariç; repoda/imajda düz sır bulunmaz (`deploy.json` yalnız `env_ref`).
- [ ] **SEC-16:** Log'a oyun state'i, skor/rekor değeri, sorgu gövdesi veya sır YAZILMAZ; yalnız başlatma/hata + minimal erişim logu (kısa saklama).
- [ ] **SEC-17:** `server.js` içinde giden ağ çağrısı (`fetch`/`http.request`/proxy) bulunmaz (A10 kanıtı); CI workflow'ları minimum `permissions` ile, action'lar sabit sürüm etiketiyle, sırlar üçüncü-parti action'a verilmez (Faz 12).

## Kabul edilen artık riskler (bloklamaz — DL-07-002)
| Risk | Şiddet | Neden kabul edildi | İzleme / yeniden değerlendirme |
|------|--------|--------------------|--------------------------------|
| Oyuncu `localStorage`'daki rekoru (ve bellekteki skoru) değiştirebilir | Düşük | Rekor anonim, yerel ve otorite/ödül üretmiyor; paylaşılmıyor, sunucuya gitmiyor → etki kullanıcının kendi tarayıcısıyla sınırlı. Sunucu doğrulaması eklemek ürünün "sunucusuz/state'siz" tasarımını bozar. Kod bu değeri güvenmez (SEC-8) — yani **bozuk değer güvenlik açığı değil, yalnız yanlış rekor** üretir | Liderlik tablosu / skor gönderimi / isimli rekor eklenirse Faz 7 yeniden koşulur (A01/A02/A04/A07 satırları) |
| Uygulama düzeyinde rate limiting yok | Düşük | Sunucu yalnız statik dosya servisi; hacim koruması altyapı katmanının (nginx/Cloudflare) işi — uygulamaya bağımlılık eklemenin maliyeti risk azalışını aşar | `/health` probe + Faz 14 alarmı; kötüye kullanımda nginx `limit_req` |

## Kalite kapısı raporu
- "OWASP Top 10 değerlendirildi" → ✅ A01–A10'un **onu da** tek tek ele alındı; uygulanamaz olanlar (A07, A10) gerekçelendirildi, uygulanabilir/kısmi olanlara somut SEC maddesi bağlandı.
- "Hassas veri sınıflandırması eksiksiz" → ✅ 7 varlık sınıflandırıldı (kalıcı `localStorage` rekoru dahil); PII toplanmadığı açıkça kayıtlı.
- "STRIDE bileşen bazında" → ✅ 6 bileşen × 6 kategori (`storage.js` sınırı ayrı bileşen olarak).
- "Auth/Authz stratejisi" → ✅ bilinçli "auth yok" kararı + origin sınırı + yeniden değerlendirme tetikleyicisi.
- "AI/tedarik zinciri tehditleri" → ✅ 10 tehdit değerlendirildi.
- "Faz 9'a devredilebilir gereksinim listesi" → ✅ SEC-1..SEC-17, hepsi kontrol edilebilir (grep/test/inceleme) ifadelerle.
- Decision Log: `decisions/DL-07-001-security-baseline.md`, `decisions/DL-07-002-client-trust-boundary.md`
