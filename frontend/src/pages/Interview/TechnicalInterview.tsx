import { Container, Typography, Paper } from '@mui/material';

export default function TechnicalInterview() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Technical Interview
        </Typography>
        <Typography variant="body1">
          This page will contain the coding interface for technical interviews.
          You can integrate Monaco Editor or CodeMirror here for a full coding experience.
        </Typography>
      </Paper>
    </Container>
  );
}
