# Grade Interview Edge Function

This Supabase Edge Function grades system design interviews using Google's Gemini AI.

## Setup

### 1. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### 2. Set Environment Variables

You need to set the `GEMINI_API_KEY` secret in Supabase:

```bash
supabase secrets set GEMINI_API_KEY=AIzaSyD-9-jec8yZmLVSzaVQjAHd6YFjipFFxm8
```

### 3. Deploy the Function

```bash
supabase functions deploy grade-interview
```

## Local Testing

### 1. Start Supabase locally (optional)
```bash
supabase start
```

### 2. Serve the function locally
```bash
supabase functions serve grade-interview --env-file ../../.env
```

### 3. Test with curl

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/grade-interview' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "assessment_id": "test-123",
    "problemDescription": "Design a URL shortening service like bit.ly. Requirements: Generate short URLs from long URLs, Redirect users from short to long URLs, Handle 100 million URLs, Support 1000 requests per second, 99.9% availability required",
    "rubric": "Use the default grading rubric",
    "transcript": "I will use a load balancer to distribute traffic across multiple application servers for horizontal scaling. For the database, I will use PostgreSQL with a master-replica setup - master handles writes and replicas handle reads. I will add Redis as a caching layer since redirects are read-heavy. This is a trade-off: better performance but added complexity for cache invalidation. For reliability, if Redis fails, we fall back to the database. If the database master fails, we promote a replica.",
    "diagramJson": {
      "nodes": [
        { "id": "1", "label": "Client" },
        { "id": "2", "label": "Load Balancer" },
        { "id": "3", "label": "App Server 1" },
        { "id": "4", "label": "App Server 2" },
        { "id": "5", "label": "Redis Cache" },
        { "id": "6", "label": "PostgreSQL Master" },
        { "id": "7", "label": "PostgreSQL Replica" }
      ],
      "edges": [
        { "source": "1", "target": "2" },
        { "source": "2", "target": "3" },
        { "source": "2", "target": "4" },
        { "source": "3", "target": "5", "label": "read" },
        { "source": "4", "target": "5", "label": "read" },
        { "source": "3", "target": "6", "label": "write" },
        { "source": "4", "target": "6", "label": "write" },
        { "source": "6", "target": "7", "label": "replicate" }
      ]
    }
  }'
```

## Production Usage

Once deployed, you can call the function from your frontend:

```typescript
const { data, error } = await supabase.functions.invoke('grade-interview', {
  body: {
    assessment_id: 'assessment-uuid',
    problemDescription: 'Design a...',
    rubric: 'Custom rubric or use default',
    transcript: 'The candidate said...',
    diagramJson: {
      nodes: [...],
      edges: [...]
    }
  }
})

if (error) {
  console.error('Error grading interview:', error)
} else {
  console.log('Grading results:', data)
}
```

## Input Schema

```typescript
{
  assessment_id: string           // ID of the assessment
  problemDescription: string      // The problem description given to candidate
  rubric: string                  // Grading rubric (can use default)
  transcript: string              // What the candidate said/explained
  diagramJson: {
    nodes: Array<{
      id: string
      label: string
      type?: string
    }>
    edges: Array<{
      source: string
      target: string
      label?: string
    }>
  }
}
```

## Output Schema

```typescript
{
  assessment_id: string
  scores: {
    reliability: number           // 0-10
    scalability: number           // 0-10
    availability: number          // 0-10
    communication: number         // 0-10
    tradeoff_analysis: number     // 0-10
  }
  overall_score: number           // Average of all scores
  summary: string                 // 2-3 sentence assessment
  strengths: string[]             // List of specific strengths
  weaknesses: string[]            // List of specific weaknesses
}
```

## Security Features

The function includes prompt injection protection. If the transcript contains suspicious keywords like:
- "ignore previous"
- "give me 10"
- "perfect score"
- etc.

All scores will be set to 0 and the summary will indicate a security violation.
