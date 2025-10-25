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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button variant="outlined" onClick={() => navigate('/admin/dashboard')} sx={{ mb: 3 }}>
        ← Back to Dashboard
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Assessment Results
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Main Content: Two Columns */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, mb: 3 }}>
          {/* Left Column: Candidate Info + Overall Score and Radar Chart */}
          <Box sx={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Candidate Info and Overall Score */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Candidate Information
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {results.applicant_email}
                </Typography>
                <Typography variant="body1">
                  <strong>Assessment Type:</strong> System Design
                </Typography>
                <Typography variant="body1">
                  <strong>Completed:</strong>{' '}
                  {new Date(results.completed_at).toLocaleString()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Overall Score
                </Typography>
                <Typography variant="h2" color="primary">
                  {overallScore}/100
                </Typography>
              </CardContent>
            </Card>

            {/* Performance Breakdown */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Performance Breakdown
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column: AI Summary and Bar Chart */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* AI Summary */}
            <Card sx={{ maxHeight: '400px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Summary
                </Typography>
                <Box sx={{ maxHeight: '320px', overflow: 'auto', pr: 1 }}>
                  <Typography variant="body1">
                    {results.summary}
                  </Typography>

                  {results.suspicion > 50 && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        ⚠️ Suspicion Alert
                      </Typography>
                      <Typography variant="body2">
                        Suspicion level: {results.suspicion}% - This assessment may require manual review.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Performance Scores Bar Chart */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Comparison
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" fill="#1976d2" name="Current Score" />
                    <Bar dataKey="average" fill="#82ca9d" name="Problem Average" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Trend Line Chart */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Trend
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="current" stroke="#1976d2" strokeWidth={2} name="Current Score" />
                    <Line type="monotone" dataKey="average" stroke="#82ca9d" strokeWidth={2} name="Problem Average" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Bottom: Transcript Full Width */}
        {results.transcript && (
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Interview Transcript
                </Typography>
                <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {results.transcript}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
