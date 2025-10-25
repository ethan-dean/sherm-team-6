import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  AppBar,
  Toolbar,
} from '@mui/material';
import { authService } from '../../services/auth.service';
import { interviewService } from '../../services/interview.service';
import type { Problem, Interview } from '../../types/interview';

export default function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [pendingOAs, setPendingOAs] = useState<Interview[]>([]);
  const [completedOAs, setCompletedOAs] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [problemsData, pendingData, completedData] = await Promise.all([
        interviewService.getProblems(),
        interviewService.getPendingOAs(),
        interviewService.getCompletedOAs(),
      ]);
      setProblems(problemsData);
      setPendingOAs(pendingData);
      setCompletedOAs(completedData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSendOA = async () => {
    if (!selectedProblem || !candidateEmail) {
      alert('Please select a problem and enter candidate email');
      return;
    }

    setLoading(true);
    try {
      await interviewService.sendOA(selectedProblem, candidateEmail);
      alert('OA sent successfully!');
      setCandidateEmail('');
      setSelectedProblem('');
      loadData();
    } catch (error) {
      alert('Failed to send OA');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Interview OA - Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Send New OA
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>Select Problem</InputLabel>
                <Select
                  value={selectedProblem}
                  label="Select Problem"
                  onChange={(e) => setSelectedProblem(e.target.value)}
                >
                  {problems.map((problem) => (
                    <MenuItem key={problem.id} value={problem.id}>
                      {problem.title} ({problem.type}) - {problem.difficulty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Candidate Email"
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSendOA}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OA'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Pending OAs ({pendingOAs.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate Email</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingOAs.map((oa) => (
                  <TableRow key={oa.id}>
                    <TableCell>{oa.candidateEmail}</TableCell>
                    <TableCell>{oa.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={oa.status}
                        color={getStatusColor(oa.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(oa.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Completed OAs ({completedOAs.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate Email</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Completed Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completedOAs.map((oa) => (
                  <TableRow key={oa.id}>
                    <TableCell>{oa.candidateEmail}</TableCell>
                    <TableCell>{oa.type}</TableCell>
                    <TableCell>{oa.score || 'N/A'}</TableCell>
                    <TableCell>
                      {oa.completedAt
                        ? new Date(oa.completedAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/admin/results/${oa.id}`)}
                      >
                        View Results
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
}
