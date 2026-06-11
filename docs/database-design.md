# Database Design

## 方針

この repo では、Supabase / PostgreSQL の SQL を用途別に管理しています。実際の本番データや private seed data は公開 repo に含めません。

## questions

問題データを扱う想定の領域です。公開できない問題本文や権利物に由来する素材は、repo に含めない方針です。

## ranking

ユーザーのスコアや表示名を扱います。

主な観点:

- score 順の表示
- 登録名の制限
- 投稿頻度の制御
- RLS / RPC による公開範囲の制御

## submission

問題提案やフォーム投稿を扱う想定です。

主な観点:

- public insert の制限
- spam / macro 対策
- 管理者確認後の採用フロー

## users 相当のデータ

ログイン機能がない場合でも、表示名や一時的な識別情報を扱う可能性があります。個人情報を扱わない設計を優先します。

## RLS

公開サイトから Supabase を使う場合、anon key でアクセスされる前提になります。そのため、RLS と RPC で公開できる操作だけに絞る必要があります。

## 関連 SQL

- `supabase/schema.sql`
- `supabase/anti-macro-ranking.sql`
- `supabase/lock-public-writes.sql`
- `supabase/exam-pass-score-90-rpc.sql`
- `supabase/question-suggestions.sql`
