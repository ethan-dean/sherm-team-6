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
  Card,
  CardContent,
  CardActions,
  Collapse,
} from '@mui/material';
import { authService } from '../../services/auth.service';

// Types based on schema
interface DesignProblem {
  id: string;
  created_at: string;
  name: string;
  description: string;
  difficulty: number; // 1-10
  rubric: string;
  agent_id: string;
  tags: any;
}

interface DesignAssessment {
  id: string;
  created_at: string;
  problem_id: string;
  started_at: string;
  ended_at: string | null;
  applicant_email: string;
  expires_at: string;
  score?: number; // Calculated from results
  completed: boolean;
}

// Mock data - 10 problems with difficulty 1-10
const mockProblems: DesignProblem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `problem-${i + 1}`,
  created_at: new Date().toISOString(),
  name: `Problem ${i + 1}`,
  description: `This is problem ${i + 1}`,
  difficulty: i + 1,
  rubric: '',
  agent_id: '',
  tags: {},
}));

// Mock assessments
const mockAssessments: DesignAssessment[] = [
  {
    id: 'assessment-1',
    created_at: '2025-01-15T10:00:00Z',
    problem_id: 'problem-5',
    started_at: '2025-01-15T10:00:00Z',
    ended_at: '2025-01-15T11:30:00Z',
    applicant_email: 'candidate1@example.com',
    expires_at: '2025-01-20T10:00:00Z',
    score: 85,
    completed: true,
  },
  {
    id: 'assessment-2',
    created_at: '2025-01-16T09:00:00Z',
    problem_id: 'problem-3',
    started_at: '2025-01-16T09:00:00Z',
    ended_at: '2025-01-16T10:45:00Z',
    applicant_email: 'candidate2@example.com',
    expires_at: '2025-01-21T09:00:00Z',
    score: 90,
    completed: true,
  },
  {
    id: 'assessment-3',
    created_at: '2025-01-17T14:00:00Z',
    problem_id: 'problem-8',
    started_at: '2025-01-17T14:00:00Z',
    ended_at: null,
    applicant_email: 'candidate3@example.com',
    expires_at: '2025-01-22T14:00:00Z',
    completed: false,
  },
  {
    id: 'assessment-4',
    created_at: '2025-01-18T11:00:00Z',
    problem_id: 'problem-2',
    started_at: '2025-01-18T11:00:00Z',
    ended_at: '2025-01-18T12:15:00Z',
    applicant_email: 'candidate4@example.com',
    expires_at: '2025-01-23T11:00:00Z',
    score: 72,
    completed: true,
  },
  {
    id: 'assessment-5',
    created_at: '2025-01-19T13:00:00Z',
    problem_id: 'problem-5',
    started_at: '2025-01-19T13:00:00Z',
    ended_at: '2025-01-19T14:30:00Z',
    applicant_email: 'candidate5@example.com',
    expires_at: '2025-01-24T13:00:00Z',
    score: 81,
    completed: true,
  },
  {
    id: 'assessment-6',
    created_at: '2025-01-20T08:00:00Z',
    problem_id: 'problem-5',
    started_at: '2025-01-20T08:00:00Z',
    ended_at: '2025-01-20T09:00:00Z',
    applicant_email: 'candidate6@example.com',
    expires_at: '2025-01-25T08:00:00Z',
    score: 83,
    completed: true,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<DesignProblem[]>(mockProblems);
  const [assessments, setAssessments] = useState<DesignAssessment[]>(mockAssessments);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [problemSortBy, setProblemSortBy] = useState<'asc' | 'desc'>('asc');
  const [assessmentSortBy, setAssessmentSortBy] = useState<'score'>('score');
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [problemEmail, setProblemEmail] = useState('');

  useEffect(() => {
    // Data is already loaded from mock data
  }, []);

  const handleSendOA = async () => {
    if (!selectedProblem || !candidateEmail) {
      alert('Please select a problem and enter candidate email');
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrate with Supabase to send OA
      alert('OA sent successfully!');
      setCandidateEmail('');
      setSelectedProblem('');
    } catch (error) {
      alert('Failed to send OA');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProblemExpand = (problemId: string) => {
    if (expandedProblem === problemId) {
      setExpandedProblem(null);
      setProblemEmail('');
    } else {
      setExpandedProblem(problemId);
      setProblemEmail('');
    }
  };

  const handleSendProblem = async (problemId: string) => {
    if (!problemEmail) {
      alert('Please enter candidate email');
      return;
    }

    try {
      // TODO: Integrate with Supabase
      alert(`Problem sent to ${problemEmail}`);
      setExpandedProblem(null);
      setProblemEmail('');
    } catch (error) {
      alert('Failed to send problem');
      console.error(error);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  // Sort problems by difficulty
  const sortedProblems = [...problems].sort((a, b) => {
    return problemSortBy === 'asc'
      ? a.difficulty - b.difficulty
      : b.difficulty - a.difficulty;
  });

  // Sort assessments by score (highest to lowest)
  const sortedAssessments = [...assessments].sort((a, b) => {
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    return scoreB - scoreA; // Highest to lowest
  });

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SystemUOA - Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Problem List Section */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                  Problem List ({problems.length})
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={problemSortBy}
                    label="Sort By"
                    onChange={(e) => setProblemSortBy(e.target.value as 'asc' | 'desc')}
                  >
                    <MenuItem value="asc">Difficulty: Low to High</MenuItem>
                    <MenuItem value="desc">Difficulty: High to Low</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {sortedProblems.map((problem) => (
                    <Card key={problem.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" component="div">
                            {problem.name}
                          </Typography>
                          <Chip
                            label={`Difficulty: ${problem.difficulty}`}
                            color={problem.difficulty <= 3 ? 'success' : problem.difficulty <= 7 ? 'warning' : 'error'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {problem.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => toggleProblemExpand(problem.id)}
                        >
                          {expandedProblem === problem.id ? 'Cancel' : 'Send'}
                        </Button>
                      </CardActions>
                      <Collapse in={expandedProblem === problem.id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            Enter candidate email:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              type="email"
                              placeholder="candidate@example.com"
                              value={problemEmail}
                              onChange={(e) => setProblemEmail(e.target.value)}
                            />
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleSendProblem(problem.id)}
                            >
                              Send
                            </Button>
                          </Box>
                        </Box>
                      </Collapse>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Assessment List Section */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Assessment List ({assessments.length})
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
                {/* Completed Assessments */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Completed ({sortedAssessments.filter(a => a.completed).length})
                  </Typography>
                  <TableContainer sx={{ maxHeight: '550px' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Applicant Email</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedAssessments
                          .filter(assessment => assessment.completed)
                          .map((assessment) => (
                            <TableRow key={assessment.id}>
                              <TableCell>{assessment.applicant_email}</TableCell>
                              <TableCell>
                                {assessment.score !== undefined ? (
                                  <Chip
                                    label={assessment.score}
                                    color={assessment.score >= 90 ? 'success' : assessment.score >= 70 ? 'warning' : 'error'}
                                    size="small"
                                  />
                                ) : (
                                  'N/A'
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => navigate(`/admin/results/${assessment.id}`)}
                                >
                                  See Results
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Incomplete Assessments */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Incomplete ({sortedAssessments.filter(a => !a.completed).length})
                  </Typography>
                  <TableContainer sx={{ maxHeight: '550px' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Applicant Email</TableCell>
                          <TableCell>Expires At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedAssessments
                          .filter(assessment => !assessment.completed)
                          .map((assessment) => (
                            <TableRow key={assessment.id}>
                              <TableCell>{assessment.applicant_email}</TableCell>
                              <TableCell>
                                {new Date(assessment.expires_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </>
  );
}
