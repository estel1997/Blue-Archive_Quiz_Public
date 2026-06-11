# Learning Notes

## 学習テーマ

- HTML / CSS / JavaScript の基本構成
- DOM 更新と状態管理
- Supabase / PostgreSQL の使い方
- RLS / RPC の考え方
- Cloudflare Pages への deploy
- 公開 repo と private data の分離

## 詰まった点

- 静的サイトで ranking などの動的機能をどう扱うか
- Supabase の公開 API と RLS の関係
- Cloudflare Pages 用の build output 整理
- 公開できないデータと公開できるコードの境界

## 改善した点

- build scripts を `scripts/` に分けた
- Supabase SQL を用途別に管理した
- README に公開範囲とセキュリティ方針を明記した
- `.env.example` を placeholder のみの内容にした

## 面接で説明できるポイント

- なぜ静的サイト + Supabase にしたか
- RLS が必要な理由
- Cloudflare Pages deploy の流れ
- 公開 repo に置いてはいけない情報の判断
