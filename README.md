# Blue Archive Fan Quiz

ブルーアーカイブの各種知識を題材にした、学習目的のファンメイド総合クイズアプリです。

このリポジトリでは、Webアプリ本体の実装、Supabase連携、ランキング/合格者登録、セキュリティヘッダー、Cloudflare Pages向けビルドなどのコードを公開しています。

## 公開範囲

この公開リポジトリには、以下のような権利物・運用データは含めません。

- ゲーム内画像、音声、メモロビ画像などの素材
- クイズ本文や大量の問題データ
- 外部サイトから取得したHTML/JSONキャッシュ
- Supabase `service_role` key、Cloudflare API Token、X API Tokenなどの秘密情報
- X自動投稿など、公開する必要のない運用スクリプト

実際の公開サイトでは、クイズデータやランキングはSupabase側で管理し、画像などの必要素材はSupabase Storageまたは外部公開URLから参照します。

## 技術要素

- HTML / CSS / JavaScript
- Supabase REST API / PostgreSQL / RLS / RPC
- Cloudflare Pages
- Google Search Console / Google Analytics
- ランキング、合格者登録、投稿フォーム、レート制限
- CSPなどのHTTPセキュリティヘッダー
- レスポンシブUI、モーダル、クイズ画面遷移

## ローカル確認

```powershell
npm install
npm run check
npm run build
```

`dist/` がCloudflare Pagesへデプロイする静的ファイル出力です。

## Supabase

公開可能なスキーマやポリシー系SQLは `supabase/` に置いています。

問題データや素材メタデータを含むseed系SQLは公開対象外です。ローカルで運用する場合は `.env` に以下を設定し、必要なprivate seedを別管理で反映します。

```powershell
SUPABASE_URL=https://your-project-ref.supabase.co/rest/v1/
SUPABASE_SERVICE_ROLE_KEY=replace-with-your-local-service-role-key
```

`.env` と `supabase/service-role-key.txt` は `.gitignore` で除外しています。

## Cloudflare Pages

```powershell
npm run build
npx wrangler pages deploy .\dist --project-name blue-archive-quiz
```

必要に応じて `NODE_OPTIONS=--use-system-ca` を指定します。

## 免責

このプロジェクトは非公式のファンメイドクイズです。
ブルーアーカイブおよび関連する名称・画像・音声等の権利は各権利者に帰属します。
