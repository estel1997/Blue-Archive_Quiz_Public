# Deployment

## ローカル確認

```powershell
npm install
npm run check
npm run build
```

## Cloudflare Pages

```powershell
npm run deploy:pages
```

`package.json` では `wrangler pages deploy` を使う script を用意しています。

## Build output

```text
dist/
  index.html
  _headers
  _redirects
  sitemap.xml
  robots.txt
  404.html
```

## 注意事項

- `.env` は commit しない
- Cloudflare API token は GitHub に置かない
- Supabase service role key は公開 build に含めない
- deploy 前に `npm run check` を実行する
- 権利物や private data が `dist/` に含まれていないか確認する
