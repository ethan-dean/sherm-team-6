# Proctoring Setup Instructions

## 1. Create Supabase Storage Bucket

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name it: `proctoring-frames`
5. Set it to **Public** (so you can access image URLs)
6. Click **Create bucket**

## 2. Run Database Migration

Run the SQL migration to create the `proctoring_frames` table:

```bash
# In Supabase SQL Editor, run the file:
supabase/migrations/create_proctoring_frames_table.sql
```

Or copy and paste the SQL directly into your Supabase SQL Editor.

## 3. Add Environment Variable

Add your Supabase Service Role Key to `.env`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

You can find this in:
- Supabase Dashboard → Settings → API → `service_role` secret key

**⚠️ IMPORTANT:** Never commit this key to git - it's already in `.gitignore`

## 4. Verify Setup

When a proctoring session runs, you should see:
- Images uploaded to Storage bucket `proctoring-frames/{session_id}/{timestamp}.jpg`
- Records in `proctoring_frames` table with suspicion scores and image URLs
- Console logs: `[Proctoring] Saved frame for {session_id}: score {suspicion_score}`

## 5. Query Proctoring Data

To view all frames for a session:

```sql
SELECT * FROM proctoring_frames
WHERE session_id = 'demo-1761432401'
ORDER BY timestamp ASC;
```

To calculate average suspicion score:

```sql
SELECT
  session_id,
  AVG(suspicion_score) as avg_suspicion,
  MAX(suspicion_score) as max_suspicion,
  COUNT(*) as frame_count
FROM proctoring_frames
WHERE session_id = 'demo-1761432401'
GROUP BY session_id;
```
