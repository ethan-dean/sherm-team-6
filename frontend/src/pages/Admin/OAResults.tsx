import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';


// Mock result data based on schema
interface AssessmentResult {
  id: string;
  applicant_email: string;
  problem_id: string;
  reliability: number;
  scalability: number;
  availability: number;
  communication: number;
  tradeoff_analysis: number;
  suspicion: number;
  summary: string;
  transcript?: string;
  diagram?: any;
  completed_at: string;
}

// Mock results for different assessments with varied scores
const mockResults: Record<string, AssessmentResult> = {
  'assessment-1': {
    id: 'assessment-1',
    applicant_email: 'candidate1@example.com',
    problem_id: 'problem-5',
    reliability: 85,
    scalability: 78,
    availability: 82,
    communication: 92,
    tradeoff_analysis: 88,
    suspicion: 15,
    summary: 'Strong performance overall. Demonstrated excellent communication skills and system design understanding. Good grasp of scalability and availability concepts with some areas for improvement in reliability considerations. Tradeoff analysis showed mature decision-making.',
    transcript: `[00:00] Interviewer: Thank you for joining us today. Let's dive into the system design challenge. Today, we'll be designing a URL shortening service similar to bit.ly. Can you start by clarifying the requirements and constraints?

[00:45] Candidate: Absolutely. Let me start by asking a few clarifying questions. First, what's the expected scale of this system? How many URL shortenings do we expect per day, and what's the expected read-to-write ratio?

[01:15] Interviewer: Good questions. Let's assume we're expecting around 100 million new URL shortenings per month, and the read-to-write ratio is approximately 100:1. Most URLs will be read much more frequently than they're created.

[01:45] Candidate: Understood. So we're looking at roughly 3.3 million writes per day and about 330 million reads per day. That's significant scale. A few more questions: Do we need to support custom short URLs, or are auto-generated ones sufficient? Also, what's the expected lifespan of these shortened URLs? Do they expire?

[02:30] Interviewer: Let's support both custom and auto-generated short URLs. For expiration, let's say URLs can have a configurable TTL, with a default of never expiring unless the user specifies otherwise.

[03:00] Candidate: Perfect. And should we support analytics on these URLs? Things like click tracking, geographic data, referrer information?

[03:20] Interviewer: Yes, basic analytics would be valuable. Track clicks, timestamp, and basic request metadata.

[03:40] Candidate: Great. Let me summarize the functional requirements:
1. Generate short URLs from long URLs (both auto-generated and custom)
2. Redirect users from short URLs to original URLs
3. Support configurable URL expiration
4. Track basic analytics (clicks, timestamps, metadata)
5. Handle 3.3M writes/day and 330M reads/day

Non-functional requirements:
1. High availability - URL redirection should always work
2. Low latency - Redirects should be fast (< 100ms)
3. Scalability - Handle growing traffic
4. Durability - URLs shouldn't be lost

Does this align with your expectations?

[04:45] Interviewer: That's a comprehensive summary. Let's proceed with the design.

[05:00] Candidate: Excellent. Let me start with the high-level architecture. We'll need several key components:

1. API Gateway/Load Balancer - Entry point for all requests
2. Application Servers - Handle business logic for URL creation and retrieval
3. Database - Store URL mappings and metadata
4. Cache Layer - Cache frequently accessed URLs for low latency
5. Analytics Service - Process and store click analytics

Let me start by discussing the URL shortening algorithm. We need to generate short, unique identifiers. I'm thinking we use a base62 encoding scheme (a-z, A-Z, 0-9), which gives us 62 possible characters per position.

[06:30] If we use 7 characters, we get 62^7 ≈ 3.5 trillion possible combinations. This should be more than sufficient for our scale. We can use a hash function or a counter-based approach. I prefer a counter-based approach with base62 encoding because it's simpler and avoids hash collisions.

[07:15] Interviewer: How would you implement the counter-based approach at scale?

[07:30] Candidate: Great question. We need to ensure uniqueness across multiple application servers. I would use a distributed ID generation service, similar to Twitter's Snowflake. We could have a dedicated service that pre-generates ranges of IDs and distributes them to application servers. Each application server gets a range of IDs (say, 1 million at a time) and can generate short URLs from that range without coordination.

[08:30] This avoids the bottleneck of a centralized counter and eliminates the need for database locks during ID generation. When a server exhausts its range, it requests a new range from the ID generation service.

[09:00] Interviewer: That makes sense. What about the database design?

[09:15] Candidate: For the database, we have a few options. Given our read-heavy workload (100:1 read-to-write ratio) and the need for high availability, I would recommend a combination of SQL and NoSQL databases.

Primary Database (Write Path):
- Use a relational database like PostgreSQL for the write path
- Schema would include:
  * url_mappings table: (short_url, original_url, user_id, created_at, expires_at)
  * Custom indexes on short_url for fast lookups

[10:30] However, for reads, we'll rely heavily on caching. We can use Redis as a distributed cache layer. Here's why:
- Redis can handle millions of reads per second
- Low latency (sub-millisecond)
- Built-in TTL support for expiring URLs
- Can use Redis as a read-through cache

[11:15] Interviewer: How would you handle cache invalidation and consistency?

[11:30] Candidate: Excellent question. For URL shortening, we have an interesting property: URLs are immutable once created. A short URL always maps to the same long URL. This means we don't have traditional cache invalidation problems.

Our cache strategy would be:
1. When a short URL is created, write to the database first
2. On first read, if not in cache, fetch from database and populate cache with appropriate TTL
3. If URL has an expiration, set Redis TTL to match
4. For URLs without expiration, use a long TTL (say, 30 days) and refresh on access

[12:45] The only invalidation we need is for expired URLs. We can run a background job that periodically cleans up expired URLs from both the database and cache.

[13:15] Interviewer: What about the write path? How would you ensure high availability for URL creation?

[13:35] Candidate: For the write path, I would implement the following:

1. Database Replication:
   - Primary-replica setup with PostgreSQL
   - Writes go to primary, replicas handle read overflow if cache misses
   - Use synchronous replication for critical data, asynchronous for read replicas

2. Partition/Shard the Database:
   - As we scale beyond single database capacity, we can shard by hash of short_url
   - This ensures even distribution and allows horizontal scaling

3. Multi-region deployment:
   - For global availability, deploy in multiple regions
   - Use a distributed database like CockroachDB or DynamoDB for multi-region writes

[15:00] Interviewer: Let's talk about the analytics component. How would you handle tracking millions of clicks per day?

[15:20] Candidate: Analytics is a write-heavy workload, and we don't want it to impact our core URL redirection performance. I would decouple analytics using an event-driven architecture:

1. When a redirect happens, we asynchronously publish a click event to a message queue (Kafka or AWS Kinesis)
2. The click event includes: short_url, timestamp, IP address, user agent, referrer
3. Analytics consumers read from the queue and process events

For storage:
- Use a time-series database like ClickHouse or TimescaleDB
- This optimizes for write-heavy workloads and time-based queries
- Schema: (short_url, timestamp, ip, user_agent, referrer, country, device_type)

[17:00] We can pre-aggregate common queries (daily clicks, top countries) using a stream processing framework like Apache Flink or Kafka Streams.

[17:45] Interviewer: How would you ensure the system can handle traffic spikes?

[18:00] Candidate: Traffic spikes are a real concern, especially if a shortened URL goes viral. Here's my approach:

1. Auto-scaling:
   - Application servers in auto-scaling groups
   - Scale based on CPU, memory, and request rate metrics
   - Use Kubernetes HPA (Horizontal Pod Autoscaler) if using containers

2. Rate Limiting:
   - Implement rate limiting per user/IP to prevent abuse
   - Use token bucket algorithm with Redis
   - Return 429 (Too Many Requests) when limits exceeded

3. CDN Integration:
   - While we can't cache the redirect at CDN (need to track analytics), we can use CDN for static assets
   - Reduce load on application servers for non-core functionality

4. Circuit Breakers:
   - Implement circuit breakers between services
   - If analytics service is down, don't block redirects
   - Degrade gracefully by skipping non-critical features

[20:15] Interviewer: What about security considerations?

[20:30] Candidate: Security is crucial. Here are key considerations:

1. Malicious URL Detection:
   - Integrate with URL reputation services (Google Safe Browsing API)
   - Block known malicious URLs during creation
   - Periodic scanning of stored URLs

2. Spam Prevention:
   - Rate limiting on URL creation
   - CAPTCHA for anonymous users
   - Require authentication for high-volume users

3. DDoS Protection:
   - Use a service like Cloudflare for DDoS mitigation
   - Implement geo-blocking if needed
   - WAF (Web Application Firewall) rules

4. Data Protection:
   - Encrypt sensitive data at rest and in transit
   - Use HTTPS for all communications
   - Implement proper access controls

[22:00] Interviewer: Let's discuss monitoring and observability. How would you ensure system health?

[22:20] Candidate: Observability is critical for a high-traffic system. I would implement:

1. Metrics:
   - Request rate, latency (p50, p95, p99), error rate
   - Cache hit ratio - critical for performance
   - Database connection pool usage
   - Queue depth for analytics events

2. Logging:
   - Structured logging (JSON format)
   - Centralized logging with ELK stack or similar
   - Log correlation IDs for request tracing

3. Tracing:
   - Distributed tracing with OpenTelemetry or Jaeger
   - Track request flow across services

4. Alerting:
   - PagerDuty or similar for critical alerts
   - Alert on: high error rate, high latency, cache misses, database replication lag

[24:00] Interviewer: Excellent. One final question: How would you handle database migrations and schema changes with zero downtime?

[24:20] Candidate: Great question. For zero-downtime migrations:

1. Backward Compatible Changes:
   - Always make schema changes backward compatible
   - Add new columns as nullable
   - Deploy code that works with both old and new schema

2. Multi-phase Rollout:
   Phase 1: Add new column/table (nullable)
   Phase 2: Deploy code that writes to both old and new
   Phase 3: Backfill data
   Phase 4: Deploy code that reads from new
   Phase 5: Remove old column/table

3. Feature Flags:
   - Use feature flags to gradually enable new features
   - Allows quick rollback if issues detected

4. Blue-Green Deployment:
   - Maintain two production environments
   - Test migration on blue environment
   - Switch traffic gradually

[26:00] Interviewer: Thank you for the comprehensive design. That covers everything I wanted to discuss today.

[26:15] Candidate: Thank you for the opportunity. I enjoyed working through this problem!`,
    completed_at: '2025-01-15T11:30:00Z',
  },
  'assessment-2': {
    id: 'assessment-2',
    applicant_email: 'candidate2@example.com',
    problem_id: 'problem-3',
    reliability: 90,
    scalability: 88,
    availability: 85,
    communication: 95,
    tradeoff_analysis: 92,
    suspicion: 10,
    summary: 'Excellent performance across all areas. Strong technical depth and communication skills. Demonstrated advanced understanding of distributed systems and made well-reasoned tradeoff decisions.',
    transcript: 'Candidate started with a comprehensive analysis of the requirements...',
    completed_at: '2025-01-16T10:45:00Z',
  },
  'assessment-4': {
    id: 'assessment-4',
    applicant_email: 'candidate4@example.com',
    problem_id: 'problem-2',
    reliability: 70,
    scalability: 65,
    availability: 75,
    communication: 80,
    tradeoff_analysis: 72,
    suspicion: 20,
    summary: 'Adequate performance with room for improvement. Communication was clear but technical depth was lacking in some areas. Needs to strengthen understanding of scalability patterns and tradeoff analysis.',
    transcript: 'Candidate provided basic solutions but struggled with edge cases...',
    completed_at: '2025-01-18T12:15:00Z',
  },
  // Additional completed assessments with same problem_ids for averaging
  'assessment-5': {
    id: 'assessment-5',
    applicant_email: 'candidate5@example.com',
    problem_id: 'problem-5', // Same as assessment-1
    reliability: 80,
    scalability: 82,
    availability: 78,
    communication: 88,
    tradeoff_analysis: 85,
    suspicion: 12,
    summary: 'Good overall performance with consistent scores across metrics.',
    transcript: 'Candidate approached the problem systematically...',
    completed_at: '2025-01-19T14:30:00Z',
  },
  'assessment-6': {
    id: 'assessment-6',
    applicant_email: 'candidate6@example.com',
    problem_id: 'problem-5', // Same as assessment-1
    reliability: 88,
    scalability: 75,
    availability: 80,
    communication: 90,
    tradeoff_analysis: 82,
    suspicion: 18,
    summary: 'Strong communication and reliability understanding.',
    transcript: 'Candidate focused on fault tolerance and recovery...',
    completed_at: '2025-01-20T09:00:00Z',
  },
};

export default function OAResults() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [suspicionSnapshots, setSuspicionSnapshots] = useState<Array<{ time: string; suspicion: number }>>([]);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Disable overscroll on mount
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overscrollBehavior = 'auto';
      document.documentElement.style.overscrollBehavior = 'auto';
    };
  }, []);

  // Fetch assessment results from Supabase
  useEffect(() => {
    const fetchAssessmentResults = async () => {
      if (!interviewId) {
        setError('No assessment ID provided');
        setLoading(false);
        return;
      }

      try {
        // Query design_assessment_results joined with design_assessments
        const { data: resultData, error: resultError } = await supabase
          .from('design_assessment_results')
          .select(`
            *,
            design_assessments!inner(
              id,
              applicant_email,
              problem_id,
              started_at,
              ended_at
            )
          `)
          .eq('id', interviewId)
          .single();

        if (resultError) {
          console.error('Error fetching assessment results:', resultError);
          // Fall back to mock data
          const mockResult = mockResults[interviewId] || mockResults['assessment-1'];
          setResults(mockResult);
          setLoading(false);
          return;
        }

        if (resultData) {
          // Transform Supabase data to match AssessmentResult interface
          const transformedResult: AssessmentResult = {
            id: resultData.id,
            applicant_email: resultData.design_assessments.applicant_email,
            problem_id: resultData.design_assessments.problem_id,
            reliability: resultData.reliability || 0,
            scalability: resultData.scalability || 0,
            availability: resultData.availability || 0,
            communication: resultData.communication || 0,
            tradeoff_analysis: resultData.tradeoff_analysis || 0,
            suspicion: resultData.suspicion || 0,
            summary: resultData.summary || 'No summary available',
            transcript: resultData.transcript || '',
            diagram: resultData.diagram,
            completed_at: resultData.design_assessments.ended_at || resultData.created_at,
          };
          setResults(transformedResult);
        } else {
          // No data found, use mock
          const mockResult = mockResults[interviewId] || mockResults['assessment-1'];
          setResults(mockResult);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        const mockResult = mockResults[interviewId] || mockResults['assessment-1'];
        setResults(mockResult);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentResults();
  }, [interviewId]);

  // Set mock suspicion data
  useEffect(() => {
    const mockData = [
      { time: '0:00', suspicion: 8 },
      { time: '1:00', suspicion: 10 },
      { time: '2:00', suspicion: 12 },
      { time: '3:00', suspicion: 11 },
      { time: '4:00', suspicion: 13 },
      { time: '5:00', suspicion: 15 },
      { time: '6:00', suspicion: 14 },
      { time: '7:00', suspicion: 16 },
      { time: '8:00', suspicion: 18 },
      { time: '9:00', suspicion: 17 },
      { time: '10:00', suspicion: 19 },
      { time: '11:00', suspicion: 20 },
      { time: '12:00', suspicion: 18 },
      { time: '13:00', suspicion: 17 },
      { time: '14:00', suspicion: 16 },
      { time: '15:00', suspicion: 15 },
      { time: '16:00', suspicion: 14 },
      { time: '17:00', suspicion: 13 },
      { time: '18:00', suspicion: 12 },
      { time: '19:00', suspicion: 11 },
      { time: '20:00', suspicion: 10 },
      { time: '21:00', suspicion: 12 },
      { time: '22:00', suspicion: 14 },
      { time: '23:00', suspicion: 13 },
      { time: '24:00', suspicion: 15 },
      { time: '25:00', suspicion: 16 },
      { time: '26:00', suspicion: 15 },
      { time: '27:00', suspicion: 14 },
      { time: '28:00', suspicion: 15 },
      { time: '29:00', suspicion: 15 },
    ];
    setSuspicionSnapshots(mockData);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a0b14 0%, #0a0a0a 50%, #120520 100%)',
      }}>
        <Typography variant="h5" sx={{ color: 'white' }}>Loading assessment results...</Typography>
      </Box>
    );
  }

  // Show error if no results
  if (!results) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a0b14 0%, #0a0a0a 50%, #120520 100%)',
      }}>
        <Typography variant="h5" sx={{ color: 'white' }}>No assessment results found</Typography>
      </Box>
    );
  }

  // Calculate overall score from all 5 metrics
  const overallScore = Math.round(
    (results.reliability + results.scalability + results.availability + results.communication + results.tradeoff_analysis) / 5
  );


  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0b14 0%, #0a0a0a 50%, #120520 100%)',
      position: 'relative',
      overflow: 'auto',
      overscrollBehavior: 'none'
    }}>
      {/* Subtle background pattern */}
      <Box sx={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(98, 0, 69, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(98, 0, 69, 0.15) 0%, transparent 50%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <Box sx={{ position: 'relative', zIndex: 10 }}>
        <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/admin/dashboard')}
            sx={{
              mb: 3,
              bgcolor: 'rgba(98, 0, 69, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 1.5,
              px: 3,
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(98, 0, 69, 1)',
                transform: 'scale(1.05)'
              }
            }}
          >
            ← Back to Dashboard
          </Button>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(98, 0, 69, 0.3)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(98, 0, 69, 0.2)',
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 600, letterSpacing: 0.5 }}>
              Assessment Results
            </Typography>

            <Divider sx={{ my: 3, borderColor: 'rgba(98, 0, 69, 0.3)' }} />

        {/* Main Content: Two Columns */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, mb: 3 }}>
          {/* Left Column: Candidate Info + Overall Score and Radar Chart */}
          <Box sx={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Candidate Info and Overall Score */}
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(98, 0, 69, 0.3)',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 500 }}>
                  Candidate Information
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  <strong>Email:</strong> {results.applicant_email}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  <strong>Assessment Type:</strong> System Design
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  <strong>Completed:</strong>{' '}
                  {new Date(results.completed_at).toLocaleString()}
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(98, 0, 69, 0.3)' }} />
                <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 500 }}>
                  Overall Score
                </Typography>
                <Typography variant="h2" sx={{ color: 'rgba(98, 0, 69, 1)', fontWeight: 600 }}>
                  {overallScore}/100
                </Typography>
              </CardContent>
            </Card>

            {/* Performance Breakdown */}
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(98, 0, 69, 0.3)',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'white', fontWeight: 500, textAlign: 'center' }}>
                  Performance Breakdown
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  '& .MuiChartsLegend-series text': { fill: 'white !important' },
                  '& .MuiChartsLegend-label': { fill: 'white !important' },
                  '& .MuiChartsLegend-root': { '& text': { fill: 'white !important' } },
                }}>
                  <RadarChart
                    height={450}
                    series={[
                      {
                        label: 'Candidate Score',
                        data: [
                          results.reliability,
                          results.scalability,
                          results.availability,
                          results.communication,
                          results.tradeoff_analysis,
                        ],
                        color: 'rgba(200, 50, 150, 0.9)',
                      },
                    ]}
                    radar={{
                      max: 10,
                      metrics: [
                        'Reliability',
                        'Scalability',
                        'Availability',
                        'Communication',
                        'Tradeoff\nAnalysis',
                      ],
                    }}
                    slotProps={{
                      legend: {
                        itemMarkWidth: 10,
                        itemMarkHeight: 10,
                        labelStyle: {
                          fill: 'white',
                          fontSize: 14,
                        },
                      },
                    }}
                    sx={{
                      '& .MuiChartsAxis-tickLabel': { fill: 'white !important' },
                      '& .MuiChartsLegend-series text': { fill: 'white !important' },
                      '& .MuiChartsLegend-label': { fill: 'white !important' },
                      '& .MuiChartsLegend-root text': { fill: 'white !important' },
                      '& text': { fill: 'white !important' },
                      '& .MuiChartsAxis-label': { fill: 'white !important' },
                      '& .MuiChartsAxis-line': { stroke: 'rgba(255, 255, 255, 0.5) !important' },
                      '& .MuiChartsAxis-tick': { stroke: 'rgba(255, 255, 255, 0.5) !important' },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column: AI Summary */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* AI Summary */}
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(98, 0, 69, 0.3)',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 500 }}>
                  AI Summary
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    maxHeight: 215,
                    overflow: 'auto',
                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(98, 0, 69, 0.2)',
                    borderRadius: 1,
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(98, 0, 69, 0.5)', borderRadius: 2, '&:hover': { background: 'rgba(98, 0, 69, 0.7)' } }
                  }}
                >
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6 }}>
                    {results.summary}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>

            {/* Suspicion Score Sparkline */}
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(98, 0, 69, 0.3)',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 500, textAlign: 'center' }}>
                  Suspicion Score Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={510}>
                  <LineChart data={suspicionSnapshots} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                    <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.7)" />
                    <YAxis domain={[0, 100]} stroke="rgba(255, 255, 255, 0.7)" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', border: '1px solid rgba(98, 0, 69, 0.5)', borderRadius: '8px', color: 'white' }} />
                    <Line type="monotone" dataKey="suspicion" stroke="rgba(98, 0, 69, 1)" strokeWidth={3} dot={{ fill: 'rgba(98, 0, 69, 1)', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Bottom: Transcript Full Width */}
        {results.transcript && (
          <Box>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(98, 0, 69, 0.3)',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 500 }}>
                  Interview Transcript
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    maxHeight: 400,
                    overflow: 'auto',
                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(98, 0, 69, 0.2)',
                    borderRadius: 1,
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(98, 0, 69, 0.5)', borderRadius: 2, '&:hover': { background: 'rgba(98, 0, 69, 0.7)' } }
                  }}
                >
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {results.transcript}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
        </Container>
      </Box>
    </Box>
  );
}
