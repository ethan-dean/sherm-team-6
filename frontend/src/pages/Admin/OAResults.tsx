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
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { interviewService } from '../../services/interview.service';
import type { InterviewResult } from '../../types/interview';

export default function OAResults() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [interviewId]);

  const loadResults = async () => {
    try {
      if (interviewId) {
        const data = await interviewService.getInterviewResults(interviewId);
        setResults(data);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const radarData = [
    { category: 'Technical Skills', score: 85, fullMark: 100 },
    { category: 'Problem Solving', score: 78, fullMark: 100 },
    { category: 'Communication', score: 92, fullMark: 100 },
    { category: 'System Design', score: 75, fullMark: 100 },
    { category: 'Code Quality', score: 88, fullMark: 100 },
  ];

  if (loading) {
    return <Typography>Loading results...</Typography>;
  }

  if (!results) {
    return <Typography>No results found</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button variant="outlined" onClick={() => navigate('/admin/dashboard')} sx={{ mb: 3 }}>
        ← Back to Dashboard
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Interview Results
        </Typography>
        
        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Candidate Information
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {results.candidateEmail}
                </Typography>
                <Typography variant="body1">
                  <strong>Interview Type:</strong> {results.type}
                </Typography>
                <Typography variant="body1">
                  <strong>Completed:</strong>{' '}
                  {new Date(results.completedAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Score
                </Typography>
                <Typography variant="h2" color="primary">
                  {results.score}/100
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#1976d2"
                      fill="#1976d2"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Feedback
                </Typography>
                <Typography variant="body1" paragraph>
                  {results.feedback}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {results.transcript && (
            <Grid item xs={12}>
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
            </Grid>
          )}

          {results.videoRecordingUrl && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Video Recording
                  </Typography>
                  <video
                    controls
                    style={{ width: '100%', maxHeight: '500px' }}
                    src={results.videoRecordingUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}
