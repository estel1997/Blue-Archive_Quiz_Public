-- 公開サイト運用時の書き込みロック用SQLです。
-- anon/authenticatedからのREST直書き込みを明示的に拒否します。
-- ランキング/合格者保存は security definer のRPCだけを通します。
-- メモロビ・ズームイン等の素材更新が終わった後にSupabase SQL Editorで実行してください。

revoke insert, update, delete on table
  public.students,
  public.pickup_banners,
  public.pickup_banner_students,
  public.pickup_title_corrections,
  public.story_questions,
  public.performance_icon_assets,
  public.performance_students,
  public.halo_assets,
  public.memolobby_zoom_assets,
  public.memolobby_answer_assets,
  public.combat_skill_questions,
  public.question_suggestions,
  public.endless_rankings,
  public.exam_passers,
  public.exam_passer_monthly_counts,
  public.quiz_syncs
from anon, authenticated;

grant select on table
  public.students,
  public.pickup_banners,
  public.pickup_banner_students,
  public.pickup_title_corrections,
  public.story_questions,
  public.performance_icon_assets,
  public.performance_students,
  public.halo_assets,
  public.memolobby_zoom_assets,
  public.memolobby_answer_assets,
  public.combat_skill_questions,
  public.endless_rankings,
  public.exam_passers,
  public.exam_passer_monthly_counts
to anon, authenticated;

grant execute on function public.submit_endless_score(text, integer, jsonb, text, text, timestamptz)
to anon, authenticated;

grant execute on function public.submit_exam_passer(text, integer, jsonb, text, text, timestamptz, text, text)
to anon, authenticated;

grant execute on function public.submit_question_suggestion(text, text, text, text, text, text, text)
to anon, authenticated;

revoke insert, update, delete on storage.objects
from anon, authenticated;

drop policy if exists "quiz assets are publicly writable" on storage.objects;
drop policy if exists "quiz assets are publicly updatable" on storage.objects;
drop policy if exists "quiz assets are publicly deletable" on storage.objects;

drop policy if exists "quiz assets are publicly readable" on storage.objects;
create policy "quiz assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'quiz-assets');
