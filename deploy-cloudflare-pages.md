# Cloudflare Pages 公開手順

この構成では、Web本体を Cloudflare Pages、クイズデータ・ランキング・投稿フォームを Supabase で管理します。

## 公開リポジトリの前提

このリポジトリには、以下を含めません。

- ゲーム内画像、音声、メモロビ画像などの権利物
- クイズ本文や大量の問題データを投入するseed SQL
- Supabase `service_role` key、Cloudflare API Token、X API Token
- X自動投稿など、公開不要な運用スクリプト

公開リポジトリ側は、アプリ本体、画面遷移、Supabase API/RPC連携、RLS/Policy系SQL、Cloudflare Pages向けビルドを見せるための構成です。

## 1. Supabase側の準備

Supabase SQL Editorで、必要なスキーマ・RLS・RPCを反映します。

公開してよい代表的なSQL:

1. `supabase/schema.sql`
2. `supabase/lock-public-writes.sql`
3. `supabase/question-suggestions.sql`
4. `supabase/ranking-retention-and-exam-months.sql`
5. `supabase/exam-passers-1000-and-name-lock.sql`

問題データや素材メタデータを含むseed系SQLはprivate管理にしてください。

## 2. 秘密情報

ローカル作業で秘密鍵が必要な場合は、`.env` に保存します。

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-your-local-service-role-key
```

`.env` と `supabase/service-role-key.txt` は `.gitignore` で除外しています。`service_role` keyは公開HTMLやGitHubに置かないでください。

## 3. Cloudflare Pages用HTMLを生成

```powershell
npm install
npm run check
npm run build
```

公開用ファイルは `dist/` に出力されます。

ローカルにfaviconやOG画像、ジャンルアイコンがある場合はコピーされます。無い場合は公開リポジトリでもビルドできるよう、最低限のプレースホルダーを生成します。

## 4. Cloudflare Pagesへ公開

```powershell
npm run deploy:pages
```

初回だけCloudflareログインまたはAPI Tokenの設定が必要です。

必要に応じて、社内プロキシや証明書環境では以下を使います。

```powershell
$env:NODE_OPTIONS="--use-system-ca"
```

## 5. 公開前チェック

- `git ls-files` に画像・音声・大量問題データが含まれていないこと
- `.env`、`service_role` key、Cloudflare API Token、X API Tokenが含まれていないこと
- Supabaseの書き込み系テーブルがRLS/RPCで制御されていること
- 既存のGit履歴に権利物や秘密情報がある場合は、既存リポジトリをpublic化せず、fresh repoまたはorphan branchで公開すること
