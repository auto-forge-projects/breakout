# 00 — Fikir (Intake)

## Problem (tek cümle)
Kullanıcının tarayıcıda tek başına, fare veya klavye ile oynayabileceği klasik bir blok kırma (Breakout/Arkanoid tarzı) oyunu yok.

## Kim için
Tek oyunculu, kısa mola/eğlence arayan herhangi bir kullanıcı; masaüstü tarayıcıda fare veya klavye ile oynar (coinflip/ball-bounce emsalindeki gibi kurulumsuz, doğrudan açılan arcade oyunu).

## Kapsam (v1)
- Paddle hem fare hareketiyle hem de klavye (sol/sağ ok) ile yatayda kontrol edilir
- Top fiziksel olarak sekiyor; paddle'a/bloklara/duvarlara çarpma açısı hesaplanır
- 3 can; tüm bloklar kırılınca "kazandın", top paddle altından kaçıp canlar biterse "oyun bitti"
- Skor blok kırıldıkça artar, en yüksek skor `localStorage`'da kalıcı
- Top hızı oyun süresi ilerledikçe kademeli artar (zorluk artışı)
- Retro piksel görsel stil, framework'süz statik HTML/Canvas/JS
- Tek sabit blok düzeni/tek seviye (v1)
- Docker imajına paketlenir, mevcut SSH-push deploy akışına uyumlu

## Kapsam dışı (v1)
- Çok oyunculu / online skor tablosu
- Power-up'lar (çoklu top, geniş paddle vb.)
- Birden fazla seviye/harita düzeni
- Mobil dokunmatik kontrol

## Kaynak
Onaylı brief: `docs/00-refined-brief.md` (Q1–Q4 netleştirme turu uygulanmış)

## Kalite kapısı raporu
Problem tek cümlede tanımlı ✅ (yukarıda)
