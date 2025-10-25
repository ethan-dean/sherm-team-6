import { Container, Typography, Paper } from '@mui/material';

export default function PracticeMode() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Practice Mode
        </Typography>
        <Typography variant="body1">
          This page will allow users to practice interviews without time limits or proctoring.
          Users can select different types of interviews and review their results.
        </Typography>
      </Paper>
    </Container>
  );
}
