import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const AssessmentFinishedPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <CheckCircleOutlineIcon
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 3,
            }}
          />

          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Assessment Successfully Submitted.
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            You will be reached out to soon with your results.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default AssessmentFinishedPage;
