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
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    transcript: 'Candidate began by discussing load balancing strategies...',
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

  // Get the current assessment result based on interviewId
  const results = mockResults[interviewId || 'assessment-1'] || mockResults['assessment-1'];

  // Calculate overall score from all 5 metrics
  const overallScore = Math.round(
    (results.reliability + results.scalability + results.availability + results.communication + results.tradeoff_analysis) / 5
  );

  // Calculate average scores from completed assessments with the SAME problem_id
  const completedAssessmentsWithSameProblem = Object.values(mockResults).filter(
    assessment => assessment.problem_id === results.problem_id
  );

  const averageScores = {
    reliability: Math.round(
      completedAssessmentsWithSameProblem.reduce((sum, a) => sum + a.reliability, 0) /
      completedAssessmentsWithSameProblem.length
    ),
    scalability: Math.round(
      completedAssessmentsWithSameProblem.reduce((sum, a) => sum + a.scalability, 0) /
      completedAssessmentsWithSameProblem.length
    ),
    availability: Math.round(
      completedAssessmentsWithSameProblem.reduce((sum, a) => sum + a.availability, 0) /
      completedAssessmentsWithSameProblem.length
    ),
    communication: Math.round(
      completedAssessmentsWithSameProblem.reduce((sum, a) => sum + a.communication, 0) /
      completedAssessmentsWithSameProblem.length
    ),
    tradeoff_analysis: Math.round(
      completedAssessmentsWithSameProblem.reduce((sum, a) => sum + a.tradeoff_analysis, 0) /
      completedAssessmentsWithSameProblem.length
    ),
  };

  // Data for Recharts charts - comparing current vs average
  const chartData = [
    { name: 'Reliability', current: results.reliability, average: averageScores.reliability },
    { name: 'Scalability', current: results.scalability, average: averageScores.scalability },
    { name: 'Availability', current: results.availability, average: averageScores.availability },
    { name: 'Communication', current: results.communication, average: averageScores.communication },
    { name: 'Tradeoff', current: results.tradeoff_analysis, average: averageScores.tradeoff_analysis },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0b14 0%, #0a0a0a 50%, #120520 100%)',
      position: 'relative',
      overflow: 'auto'
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
                <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'white', fontWeight: 500 }}>
                  Performance Breakdown
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  '& .MuiChartsLegend-series text': { fill: 'white !important' },
                  '& .MuiChartsLegend-label': { fill: 'white !important' },
                  '& .MuiChartsLegend-root': { '& text': { fill: 'white !important' } },
                }}>
                  <RadarChart
                    height={350}
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
                        color: 'rgba(98, 0, 69, 0.8)',
                      },
                    ]}
                    radar={{
                      max: 100,
                      metrics: [
                        'Reliability',
                        'Scalability',
                        'Availability',
                        'Communication',
                        'Tradeoff\nAnalysis',
                      ],
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

          {/* Right Column: AI Summary and Bar Chart */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* AI Summary */}
            <Card
              elevation={0}
              sx={{
                maxHeight: '1000px',
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
                <Box sx={{ maxHeight: '920px', overflow: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(98, 0, 69, 0.5)', borderRadius: 2, '&:hover': { background: 'rgba(98, 0, 69, 0.7)' } } }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6 }}>
                    {results.summary}
                  </Typography>

                  {results.suspicion > 50 && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 152, 0, 0.2)', border: '1px solid rgba(255, 152, 0, 0.4)', borderRadius: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ff9800' }}>
                        ⚠️ Suspicion Alert
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Suspicion level: {results.suspicion}% - This assessment may require manual review.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Performance Scores Bar Chart */}
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
                  Performance Comparison
                </Typography>
                <ResponsiveContainer width="100%" height={535}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(98, 0, 69, 0.2)" />
                    <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" />
                    <YAxis domain={[0, 100]} stroke="rgba(255, 255, 255, 0.7)" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', border: '1px solid rgba(98, 0, 69, 0.5)', borderRadius: '8px', color: 'white' }} />
                    <Legend wrapperStyle={{ color: 'white' }} />
                    <Bar dataKey="current" fill="rgba(98, 0, 69, 0.8)" name="Current Score" />
                    <Bar dataKey="average" fill="rgba(98, 0, 69, 0.4)" name="Problem Average" />
                  </BarChart>
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
