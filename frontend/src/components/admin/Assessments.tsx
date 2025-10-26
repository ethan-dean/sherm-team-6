import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DesignAssessment } from '../../services/design.service';

interface Props {
  completed: DesignAssessment[];
  incomplete: DesignAssessment[];
}

export default function Assessments({ completed, incomplete }: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'completed' | 'incomplete'>('completed');

  const total = (completed?.length ?? 0) + (incomplete?.length ?? 0);

  const rows = useMemo(
    () => (tab === 'completed' ? completed : incomplete),
    [tab, completed, incomplete]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        background: 'rgba(20,20,25,0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(98,0,69,0.3)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(98,0,69,0.2)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2.5,
          flexWrap: 'nowrap',
          width: '100%',
          minWidth: 0,
        }}
      >
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Typography
            variant="h4"
            noWrap
            sx={{
              color: 'white',
              fontWeight: 600,
              letterSpacing: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Assessments
            <Typography
              component="span"
              sx={{ ml: 2, color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}
            >
              {total} total
            </Typography>
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="inherit"
          TabIndicatorProps={{ sx: { backgroundColor: 'rgba(98,0,69,1)' } }}
          sx={{
            minHeight: 40,
            '.MuiTab-root': {
              minHeight: 40,
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              '&.Mui-selected': { color: 'white' },
            },
          }}
        >
          <Tab value="completed" label={`Completed (${completed.length})`} />
          <Tab value="incomplete" label={`Incomplete (${incomplete.length})`} />
        </Tabs>
      </Box>

      {/* Table wrapper */}
      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(98,0,69,0.3)',
        }}
      >
        <TableContainer
          sx={{
            maxHeight: 520,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(98,0,69,0.5)',
              borderRadius: 8,
              '&:hover': { background: 'rgba(98,0,69,0.7)' },
            },
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thSx}>Applicant Email</TableCell>

                {tab === 'completed' ? (
                  <>
                    <TableCell sx={thSx} align="left">Ended At</TableCell>
                    <TableCell sx={thSx} align="left">Score</TableCell>
                    <TableCell sx={thSx} align="right">Actions</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={thSx} align="left">Expires At</TableCell>
                    <TableCell sx={thSx} align="right">Status</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((a) => (
                <TableRow
                  key={a.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: 'rgba(98,0,69,0.10)' },
                    transition: 'background 0.2s ease',
                    height: 56,
                  }}
                >
                  <TableCell sx={tdSx}>{a.applicant_email}</TableCell>

                  {tab === 'completed' ? (
                    <>
                      <TableCell sx={{ ...tdSx, color: 'rgba(255,255,255,0.8)' }}>
                        {formatDate(a.ended_at)}
                      </TableCell>

                      <TableCell sx={tdSx}>
                        {a.score !== undefined ? (
                          <Chip
                            label={a.score}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: 'rgba(98,0,69,0.9)',
                              color: 'white',
                              border: '1px solid rgba(98,0,69,1)',
                            }}
                          />
                        ) : (
                          <Typography sx={{ color: 'rgba(255,255,255,0.65)' }}>N/A</Typography>
                        )}
                      </TableCell>

                      <TableCell sx={tdSx} align="right">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/admin/results/${a.id}`)}
                          sx={{
                            bgcolor: 'rgba(98,0,69,0.95)',
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2,
                            '&:hover': {
                              bgcolor: 'rgba(98,0,69,1)',
                              transform: 'translateY(-1px)',
                            },
                          }}
                        >
                          View Results
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ ...tdSx, color: 'rgba(255,255,255,0.8)' }}>
                        {formatDate(a.expires_at)}
                      </TableCell>

                      <TableCell sx={tdSx} align="right">
                        <Chip
                          label="Pending"
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: 'rgba(255,152,0,0.25)',
                            color: '#ffb74d',
                            border: '1px solid rgba(255,152,0,0.35)',
                          }}
                        />
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}

              {!rows.length && (
                <TableRow>
                  <TableCell
                    colSpan={tab === 'completed' ? 4 : 3}
                    sx={{
                      py: 8,
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {tab === 'completed'
                      ? 'No completed assessments.'
                      : 'No incomplete assessments.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
}

/* ---------- Helpers & shared styles ---------- */

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
}

const thSx = {
  position: 'sticky' as const,
  top: 0,
  zIndex: 1,
  bgcolor: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(12px)',
  color: 'rgba(255,255,255,0.85)',
  fontWeight: 700,
  borderBottom: '1px solid rgba(98,0,69,0.35)',
};

const tdSx = {
  color: 'white',
  borderBottom: '1px solid rgba(98,0,69,0.2)',
};
