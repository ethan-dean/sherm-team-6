import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { toast } from "sonner";
import { authService } from "../../services/auth.service";
import Problems from "../../components/admin/Problems";
import Assessments from "../../components/admin/Assessments";
import {
  DesignProblem,
  DesignAssessment,
  fetchProblems,
  fetchAssessments,
  createAssessment,
} from "../../services/design.service";

export default function Dashboard() {
  // Data
  const [problems, setProblems] = useState<DesignProblem[]>([]);
  const [assessments, setAssessments] = useState<DesignAssessment[]>([]);
  // UI
  const [problemSortBy, setProblemSortBy] = useState<"asc" | "desc">("asc");
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Disable overscroll on mount
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overscrollBehavior = 'auto';
      document.documentElement.style.overscrollBehavior = 'auto';
    };
  }, []);

  // Load data
  const reloadProblems = async () => setProblems(await fetchProblems());
  const reloadAssessments = async () =>
    setAssessments(await fetchAssessments());

  useEffect(() => {
    reloadProblems();
    reloadAssessments();
  }, []);

  // Sorted problems
  const sortedProblems = useMemo(() => {
    const copy = [...problems];
    copy.sort((a, b) =>
      problemSortBy === "asc"
        ? a.difficulty - b.difficulty
        : b.difficulty - a.difficulty
    );
    return copy;
  }, [problems, problemSortBy]);

  // Split assessments
  const completed = useMemo(
    () =>
      assessments
        .filter((a) => a.completed)
        .sort(
          (a, b) =>
            new Date(b.ended_at ?? 0).getTime() -
            new Date(a.ended_at ?? 0).getTime()
        ),
    [assessments]
  );
  const incomplete = useMemo(
    () =>
      assessments
        .filter((a) => !a.completed)
        .sort(
          (a, b) =>
            new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()
        ),
    [assessments]
  );

  // Actions
  const sendAssessment = async (problemId: string, email: string) => {
    setSendingId(problemId); // show loading state
    try {
      // Get current user (sender)
      const user = await authService.getUser();
      if (!user) throw new Error("Not authenticated");
      const senderId = user.id;

      // Create assessment in database and get the generated UUID
      const assessmentId = await createAssessment({
        problem_id: problemId,
        applicant_email: email,
        sender_id: senderId,
      });

      // Send email via backend API
      const response = await fetch('http://localhost:3000/api/send-interview-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateEmail: email,
          candidateName: email.split('@')[0], // Use email username as name
          assessmentId: assessmentId,
          company: 'Systema'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      // Reload assessments table
      await reloadAssessments();

      toast.success(`Assessment sent successfully to ${email}`, {
        description: `Assessment ID: ${assessmentId}`,
      });
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to send assessment', {
        description: e.message || String(e),
      });
    } finally {
      setSendingId(null); // reset loading state
    }
  };
  
  

  const handleLogout = () => authService.logout();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a0b14 0%, #0a0a0a 50%, #120520 100%)",
        position: "relative",
        overflow: "auto",
        overscrollBehavior: "none",
      }}
    >
      {/* bg */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(98,0,69,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(98,0,69,0.15) 0%, transparent 50%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 10 }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
                gap: 2,
              }}
            >
              <img
                src="/SystemaLogo.png"
                alt="Systema Logo"
                style={{ height: "45px", width: "auto" }}
              />
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, letterSpacing: 0.5 }}
                >
                  Systema
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Dashboard
                </Typography>
              </Box>
            </Box>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                px: 3,
                border: "1px solid rgba(255,255,255,0.2)",
                "&:hover": {
                  bgcolor: "rgba(98,0,69,0.3)",
                  borderColor: "rgba(98,0,69,0.5)",
                },
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 5, mb: 6, px: 4 }}>
          <Box
            sx={{
              display: "flex",
              gap: 4,
              flexDirection: { xs: "column", lg: "row" },
            }}
          >
            {/* Problems */}
            <Box sx={{ flex: 1 }}>
              <Problems
                problems={sortedProblems}
                total={problems.length}
                sortBy={problemSortBy}
                setSortBy={setProblemSortBy}
                onSendProblem={sendAssessment}
                sendingId={sendingId}
              />
            </Box>

            {/* Assessments */}
            <Box sx={{ flex: 1 }}>
              <Assessments completed={completed} incomplete={incomplete} />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}