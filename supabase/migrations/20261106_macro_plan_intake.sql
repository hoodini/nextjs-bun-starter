-- What the athlete told the season head coach (target time, limitations,
-- recent result, focus, notes, and for a revision what he asked to change).
-- Kept on the season so every phase plan built from it inherits the same
-- limits, and so the Season tab can show what the coach was told.
alter table runcoach.macro_plans add column if not exists intake jsonb;
