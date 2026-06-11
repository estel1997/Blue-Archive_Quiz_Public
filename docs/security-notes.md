# Security Notes

## 公開 repo に置かないもの

- `.env`
- Supabase service role key
- Cloudflare API token
- GitHub token
- private seed data
- 権利物の画像・音声・ゲーム素材
- 個人情報

## Supabase anon key

ブラウザから Supabase を使う場合、anon key は公開される前提で扱います。ただし、公開されてもよい操作だけを RLS / RPC で許可する必要があります。

## RLS

RLS は公開サイトの重要な境界です。

確認すること:

- SELECT できる範囲
- INSERT できる範囲
- UPDATE / DELETE が不要に許可されていないこと
- ranking や submission が spam に弱くないこと

## `.env.example`

`.env.example` には placeholder のみを書きます。実値は `.env` や Cloudflare / Supabase の管理画面で扱います。

## 公開対象外ファイル

- 本番の問題データ
- private seed SQL
- 管理用 token
- 生成済み一時ファイル

## README / docs の方針

技術構成や学習内容は説明しますが、API key、secret、token、service role key の実値は記載しません。
