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

    // Find the problem details
    const problem = problems.find(p => p.id === problemId);
    if (!problem) {
      alert('Problem not found');
      return;
    }

    try {
      // Generate unique assessment ID
      const assessmentId = `assessment-${Date.now()}`;

      // Call backend API to send email
      const response = await fetch('http://localhost:3000/api/send-interview-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateEmail: problemEmail,
          candidateName: problemEmail.split('@')[0], // Use email username as name
          assessmentId: assessmentId,
          company: 'Systema'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      alert(`✅ Assessment sent successfully to ${problemEmail}!\n\nAssessment ID: ${assessmentId}`);
      setExpandedProblem(null);
      setProblemEmail('');
    } catch (error: any) {
      alert(`❌ Failed to send assessment: ${error.message}`);
      console.error('Send email error:', error);
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
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
              <img
                src="/SystemaLogo.png"
                alt="Systema Logo"
                style={{ height: '45px', width: 'auto' }}
              />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                  Systema
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Admin Dashboard
                </Typography>
              </Box>
            </Box>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                px: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(98, 0, 69, 0.3)',
                  borderColor: 'rgba(98, 0, 69, 0.5)'
                }
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 5, mb: 6, px: 4 }}>
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Problem List Section */}
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                background: 'rgba(20, 20, 25, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(98, 0, 69, 0.3)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(98, 0, 69, 0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600, letterSpacing: 0.5 }}>
                  Problem Library
                  <Typography component="span" sx={{ ml: 2, color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                    {problems.length} total
                  </Typography>
                </Typography>
                <FormControl
                  size="small"
                  sx={{
                    minWidth: 180,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'rgba(0, 0, 0, 0.3)'
                    }
                  }}
                >
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sort By</InputLabel>
                  <Select
                    value={problemSortBy}
                    label="Sort By"
                    onChange={(e) => setProblemSortBy(e.target.value as 'asc' | 'desc')}
                    sx={{
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98, 0, 69, 0.5)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98, 0, 69, 0.8)' },
                      '.MuiSvgIcon-root': { color: 'white' }
                    }}
                  >
                    <MenuItem value="asc">Difficulty: Low to High</MenuItem>
                    <MenuItem value="desc">Difficulty: High to Low</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(98, 0, 69, 0.5)', borderRadius: 2, '&:hover': { background: 'rgba(98, 0, 69, 0.7)' } } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {sortedProblems.map((problem) => (
                    <Card
                      key={problem.id}
                      elevation={0}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(20, 0, 15, 0.6) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(98, 0, 69, 0.3)',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'rgba(98, 0, 69, 0.6)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(98, 0, 69, 0.3)'
                        }
                      }}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 500 }}>
                            {problem.name}
                          </Typography>
                          <Chip
                            label={`Level ${problem.difficulty}`}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              bgcolor: 'rgba(98, 0, 69, 0.8)',
                              color: 'white',
                              border: '1px solid rgba(98, 0, 69, 1)'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
                          {problem.description}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => toggleProblemExpand(problem.id)}
                          sx={{
                            bgcolor: 'rgba(98, 0, 69, 0.8)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 1.5,
                            px: 2.5,
                            fontWeight: 500,
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: 'rgba(98, 0, 69, 1)',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          {expandedProblem === problem.id ? 'Cancel' : 'Send to Candidate'}
                        </Button>
                      </CardActions>
                      <Collapse in={expandedProblem === problem.id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: 'rgba(0, 0, 0, 0.4)', borderTop: '1px solid rgba(98, 0, 69, 0.3)' }}>
                          <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>
                            Enter candidate email:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <TextField
                              size="small"
                              fullWidth
                              type="email"
                              placeholder="candidate@example.com"
                              value={problemEmail}
                              onChange={(e) => setProblemEmail(e.target.value)}
                              sx={{
                                '& .MuiInputBase-root': {
                                  borderRadius: 1.5,
                                  bgcolor: 'rgba(255, 255, 255, 0.05)'
                                },
                                '& .MuiInputBase-input': { color: 'white' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98, 0, 69, 0.4)' },
                                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98, 0, 69, 0.6)' },
                                '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.3)', opacity: 1 }
                              }}
                            />
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleSendProblem(problem.id)}
                              sx={{
                                bgcolor: 'rgba(98, 0, 69, 0.8)',
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
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                background: 'rgba(20, 20, 25, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(98, 0, 69, 0.3)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(98, 0, 69, 0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              <Typography variant="h4" sx={{ mb: 3, color: 'white', fontWeight: 600, letterSpacing: 0.5 }}>
                Assessments
                <Typography component="span" sx={{ ml: 2, color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                  {assessments.length} total
                </Typography>
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
                {/* Completed Assessments */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                    Completed ({sortedAssessments.filter(a => a.completed).length})
                  </Typography>
                  <TableContainer sx={{ maxHeight: '500px', pr: 1, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(98, 0, 69, 0.5)', borderRadius: 2, '&:hover': { background: 'rgba(98, 0, 69, 0.7)' } } }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, borderBottom: '1px solid rgba(98, 0, 69, 0.3)' }}>Applicant Email</TableCell>
                          <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, borderBottom: '1px solid rgba(98, 0, 69, 0.3)' }}>Score</TableCell>
                          <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, borderBottom: '1px solid rgba(98, 0, 69, 0.3)' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedAssessments
                          .filter(assessment => assessment.completed)
                          .map((assessment) => (
                            <TableRow
                              key={assessment.id}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'rgba(98, 0, 69, 0.1)'
                                }
                              }}
                            >
                              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(98, 0, 69, 0.2)' }}>{assessment.applicant_email}</TableCell>
                              <TableCell sx={{ borderBottom: '1px solid rgba(98, 0, 69, 0.2)' }}>
                                {assessment.score !== undefined ? (
                                  <Chip
                                    label={assessment.score}
                                    size="small"
                                    sx={{
                                      fontWeight: 600,
                                      bgcolor: 'rgba(98, 0, 69, 0.8)',
                                      color: 'white',
                                      border: '1px solid rgba(98, 0, 69, 1)'
                                    }}
                                  />
                                ) : (
                                  'N/A'
                                )}
                              </TableCell>
                              <TableCell sx={{ borderBottom: '1px solid rgba(98, 0, 69, 0.2)' }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => navigate(`/admin/results/${assessment.id}`)}
                                  sx={{
                                    bgcolor: 'rgba(98, 0, 69, 0.8)',
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    '&:hover': {
                                      bgcolor: 'rgba(98, 0, 69, 1)',
                                      transform: 'scale(1.05)'
                                    }
                                  }}
                                >
                                  View Results
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
                  <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff9800' }} />
                    Incomplete ({sortedAssessments.filter(a => !a.completed).length})
                  </Typography>
                  <TableContainer sx={{ maxHeight: '500px', pr: 1, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(98, 0, 69, 0.5)', borderRadius: 2, '&:hover': { background: 'rgba(98, 0, 69, 0.7)' } } }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, borderBottom: '1px solid rgba(98, 0, 69, 0.3)' }}>Applicant Email</TableCell>
                          <TableCell sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, borderBottom: '1px solid rgba(98, 0, 69, 0.3)' }}>Expires At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedAssessments
                          .filter(assessment => !assessment.completed)
                          .map((assessment) => (
                            <TableRow
                              key={assessment.id}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'rgba(98, 0, 69, 0.1)'
                                }
                              }}
                            >
                              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(98, 0, 69, 0.2)' }}>{assessment.applicant_email}</TableCell>
                              <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', borderBottom: '1px solid rgba(98, 0, 69, 0.2)' }}>
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
      </Box>
    </Box>
  );
}
