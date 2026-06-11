# Architecture

## 全体構成

```text
index.html
  -> styles.css
  -> script.js
      -> quiz state
      -> public API / Supabase
      -> ranking / submission UI

scripts/
  -> build-single-html.js
  -> build-cloudflare-pages.js
```

## Frontend

HTML / CSS / JavaScript で UI とクイズ進行を構成しています。framework なしで、DOM、state、event handler を直接扱う学習用の構成です。

## Supabase

Supabase では、ranking、submission、合格者登録、RLS、RPC などを SQL ファイルとして管理しています。

## Build

Node.js scripts で Cloudflare Pages 用の静的ファイルを生成します。

主な出力:

- `dist/index.html`
- `_headers`
- `_redirects`
- `sitemap.xml`
- `robots.txt`

## 学習ポイント

- 静的サイトと BaaS の責務分離
- JavaScript だけでの state / UI 更新
- Supabase RLS と公開 API の考え方
- Cloudflare Pages 向け build output の整理
