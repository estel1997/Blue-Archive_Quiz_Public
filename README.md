# Blue Archive Fan Quiz Web

HTML / CSS / JavaScript と Supabase / PostgreSQL を使った、非公式ファンメイドの Web クイズアプリです。Cloudflare Pages で公開することを想定し、ランキング、合格者登録、投稿フォーム、静的ビルドを扱っています。

このリポジトリは、Web / Supabase / Cloudflare Pages のポートフォリオとして、実装範囲と公開 repo に置いてよい情報を整理しています。

## 制作目的

- HTML / CSS / JavaScript だけで動く Web アプリを作る
- Supabase / PostgreSQL を使ってランキングや投稿データを扱う
- Cloudflare Pages へ静的サイトとして deploy できる構成にする
- 公開 repo から除外すべきデータ、secret、権利物を分けて管理する
- README / docs で公開範囲と技術構成を説明できるようにする

## 使用技術

| 区分 | 技術 |
|---|---|
| Frontend | HTML / CSS / JavaScript |
| Backend | Supabase |
| Database | PostgreSQL / RLS / RPC |
| Hosting | Cloudflare Pages |
| Build | Node.js scripts |
| Tooling | npm scripts |
| Version Control | Git / GitHub |

## 主な機能

### 実装済み・土台あり

- クイズモード選択
- 練習 / ミニ試験 / 本番試験 / エンドレス形式の切り替え
- 問題データの取得・整形
- ランキング表示
- 合格者登録
- 投稿フォーム系 SQL の管理
- Cloudflare Pages 用の静的ビルド
- SEO 用ページ、sitemap、robots、headers の生成

### 検証中・改善予定

- 問題データの公開範囲整理
- ランキングの不正投稿対策
- Supabase RLS / RPC の見直し
- UI の読みやすさ改善
- テスト・チェック手順の整理

## データ取得フロー

```text
Browser
  -> JavaScript
  -> public API / Supabase anon access
  -> quiz state
  -> ranking / result UI
```

ビルド時には Node.js scripts で HTML / CSS / JavaScript をまとめ、Cloudflare Pages 用の `dist/` を生成します。

## Supabase / PostgreSQL

`supabase/` に schema、ranking、submission、RLS、RPC などの SQL を置いています。公開 repo には service role key や private seed data を置かない方針です。

詳しくは [docs/database-design.md](docs/database-design.md) を参照してください。

## Cloudflare Pages

```powershell
npm install
npm run check
npm run build
npm run deploy:pages
```

詳しくは [docs/deployment.md](docs/deployment.md) を参照してください。

## セキュリティ上の注意

- `.env` は commit しない
- service role key は公開 repo に置かない
- Supabase anon key を使う場合も RLS を前提にする
- 権利物の画像・音声・ゲーム素材は repo に追加しない
- 公開できない問題データや運用データは除外する

詳しくは [docs/security-notes.md](docs/security-notes.md) を参照してください。

## 工夫した点

- フロントエンドだけで動く範囲と Supabase に任せる範囲を分けた
- Node.js scripts で Cloudflare Pages 用の生成処理をまとめた
- 公開 repo と非公開データの境界を README に明記した
- Ranking / submission / RLS などの SQL を用途別に管理した

## 学んだこと

- 静的サイトでも Supabase と組み合わせることでランキングや投稿機能を作れる
- 公開 repo では secret と権利物の扱いを先に決める必要がある
- Cloudflare Pages へ deploy するには build output と headers / redirects の整理が重要
- README で公開範囲を明記すると、第三者が安心して repo を確認できる

## 注意事項

このリポジトリは学習・ポートフォリオ目的の非公式ファン制作物です。権利物や private data は公開対象外です。README / docs に API key、secret、token、service role key の実値は記載しません。
