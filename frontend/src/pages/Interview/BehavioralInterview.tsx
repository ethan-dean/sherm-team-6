import { Container, Typography, Paper } from '@mui/material';

export default function BehavioralInterview() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Behavioral Interview
        </Typography>
        <Typography variant="body1">
          This page will contain the AI-powered behavioral interview interface.
          Integration with Eleven Labs for voice and speech recognition will go here.
        </Typography>
      </Paper>
    </Container>
  );
}
