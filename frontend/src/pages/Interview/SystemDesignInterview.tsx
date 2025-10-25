import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Button,
  Alert,
} from '@mui/material';
import SystemDesignCanvas from '../../components/canvas/SystemDesignCanvas';
import { interviewService } from '../../services/interview.service';
import type { Problem } from '../../types/interview';

export default function SystemDesignInterview() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    loadProblem();
    startTimer();
  }, []);

  const loadProblem = async () => {
    try {
      const mockProblem: Problem = {
        id: '1',
        title: 'Design a URL Shortener',
        description: 'Design a scalable URL shortening service like bit.ly. Your system should be able to handle millions of URLs and provide fast redirection. Consider aspects like database design, caching, and handling high traffic.',
        type: 'system-design',
        difficulty: 'medium',
      };
      setProblem(mockProblem);
    } catch (error) {
      console.error('Failed to load problem:', error);
    }
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSnapshot = async (nodes: any[], edges: any[]) => {
    try {
      if (interviewId) {
        await interviewService.saveDiagramSnapshot(interviewId, {
          components: nodes,
          connections: edges,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to save snapshot:', error);
    }
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit? This action cannot be undone.')) {
      try {
        setIsSubmitted(true);
        alert('Interview submitted successfully!');
      } catch (error) {
        console.error('Failed to submit interview:', error);
      }
    }
  };

  if (!problem) {
    return <Typography>Loading...</Typography>;
  }

  if (isSubmitted) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Interview Submitted!
          </Typography>
          <Typography variant="body1">
            Thank you for completing the system design interview. The recruiter will review your submission and get back to you soon.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" color={timeRemaining < 300 ? 'error' : 'primary'}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            System Design Interview
          </Typography>
          <Typography variant="h6" sx={{ mr: 2 }}>
            Time Remaining: {formatTime(timeRemaining)}
          </Typography>
          <Button color="inherit" variant="outlined" onClick={handleSubmit}>
            Submit
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {problem.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {problem.description}
          </Typography>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Tip:</strong> Consider scalability, latency, consistency, and fault tolerance. 
              Use the components to design your system architecture and explain your choices.
            </Typography>
          </Alert>
        </Paper>

        <Box sx={{ height: 'calc(100vh - 300px)' }}>
          <SystemDesignCanvas onSaveSnapshot={handleSaveSnapshot} />
        </Box>
      </Container>
    </>
  );
}
