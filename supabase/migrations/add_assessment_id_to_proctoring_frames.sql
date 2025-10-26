-- Add assessment_id column to proctoring_frames table as UUID
-- (This migration may already be applied if column exists)
alter table public.proctoring_frames
add column if not exists assessment_id uuid;

-- Create index on assessment_id for faster queries
create index if not exists proctoring_frames_assessment_id_idx on public.proctoring_frames (assessment_id);
