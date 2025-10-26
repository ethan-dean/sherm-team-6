-- Add status and duration_ms columns to design_assessments table
-- to track interview lifecycle and completion time

-- Add status column (defaults to 'incomplete')
alter table public.design_assessments
add column if not exists status text default 'incomplete' check (status in ('incomplete', 'complete'));

-- Add duration_ms column to store interview duration in milliseconds
alter table public.design_assessments
add column if not exists duration_ms bigint;

-- Create index on status for faster filtering
create index if not exists design_assessments_status_idx on public.design_assessments (status);

-- Add comment for documentation
comment on column public.design_assessments.status is 'Interview status: incomplete (not finished), complete (finished)';
comment on column public.design_assessments.duration_ms is 'Total duration of interview in milliseconds';
