-- Create proctoring_frames table to store captured frames during interviews
create table public.proctoring_frames (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  session_id text not null,
  timestamp bigint not null,
  suspicion_score real not null default 0,
  reasons jsonb default '[]'::jsonb,
  image_url text,
  constraint proctoring_frames_pkey primary key (id)
);

-- Create index on session_id for faster queries
create index proctoring_frames_session_id_idx on public.proctoring_frames (session_id);

-- Create index on timestamp for ordering
create index proctoring_frames_timestamp_idx on public.proctoring_frames (timestamp);

-- Enable Row Level Security
alter table public.proctoring_frames enable row level security;

-- Create policy to allow service role to insert
create policy "Service role can insert proctoring frames"
  on public.proctoring_frames
  for insert
  to service_role
  with check (true);

-- Create policy to allow service role to select
create policy "Service role can select proctoring frames"
  on public.proctoring_frames
  for select
  to service_role
  using (true);
