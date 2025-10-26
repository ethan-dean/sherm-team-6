// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import Login from './pages/Admin/Login';
import Register from './pages/Admin/Register';
import Dashboard from './pages/Admin/Dashboard';
import OAResults from './pages/Admin/OAResults';
import SystemDesignInterviewPage from './pages/Interview/SystemDesignInterviewPage';
///import SystemDesignInterview from './pages/Interview/SystemDesignInterview';
import AssessmentFinishedPage from './pages/Interview/AssessmentFinishedPage';
import PreInterview from './pages/Interview/PreInterview';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

import ProctoringSuspicionChart from './components/admin/ProctoringSuspicionChart';


const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// Root redirect based on auth state
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null; // or a loading spinner
  return user ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(20, 21, 23, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
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
          <Route path="/interview/:assessmentId" element={<PreInterview />} />
          <Route
            path="/interview/system-design/:interviewId"
            element={<SystemDesignInterviewPage />}
          />
          <Route path="/interview/finished" element={<AssessmentFinishedPage />} />
          <Route path="/test" element={<ProctoringSuspicionChart />} />

          {/* Default Redirect */}
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
