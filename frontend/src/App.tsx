import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Admin/Login';
import Register from './pages/Admin/Register';
import Dashboard from './pages/Admin/Dashboard';
import OAResults from './pages/Admin/OAResults';
import SystemDesignInterviewPage from './pages/Interview/SystemDesignInterviewPage';
import SystemDesignInterview from './pages/Interview/SystemDesignInterview';
import TechnicalInterview from './pages/Interview/TechnicalInterview';
import BehavioralInterview from './pages/Interview/BehavioralInterview';
import AssessmentFinishedPage from './pages/Interview/AssessmentFinishedPage';
import PracticeMode from './pages/Practice/PracticeMode';
import { authService } from './services/auth.service';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results/:interviewId"
            element={
              <ProtectedRoute>
                <OAResults />
              </ProtectedRoute>
            }
          />

          {/* Interview Routes */}
          <Route path="/interview/system-design/:interviewId" element={<SystemDesignInterviewPage />} />
          <Route path="/interview/technical/:interviewId" element={<TechnicalInterview />} />
          <Route path="/interview/behavioral/:interviewId" element={<BehavioralInterview />} />
          <Route path="/interview/finished" element={<AssessmentFinishedPage />} />

          <Route path="/test" element={<SystemDesignInterview />} />


          {/* Practice Mode */}
          <Route path="/practice" element={<PracticeMode />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
