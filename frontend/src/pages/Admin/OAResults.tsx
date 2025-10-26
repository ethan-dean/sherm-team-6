import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { RadarChart } from "@mui/x-charts/RadarChart";
import { supabase } from "@/lib/supabase";
import ProctoringSuspicionChart from "@/components/admin/ProctoringSuspicionChart";

// ---- Types ----
interface AssessmentResult {
  id: string;
  applicant_email: string;
  problem_id: string;
  reliability: number;
  scalability: number;
  availability: number;
  communication: number;
  tradeoff_analysis: number; // mapped from DB `trade_off_analysis`
  suspicion: number;
  summary: string;
  transcript?: string;
  diagram?: any;
  completed_at: string;
}

export default function OAResults() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();

  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Disable overscroll on mount
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overscrollBehavior = "auto";
      document.documentElement.style.overscrollBehavior = "auto";
    };
  }, []);

  // Fetch assessment results from Supabase using interviewId (assessment_id)
  useEffect(() => {
    const fetchAssessmentResults = async () => {
      if (!interviewId) {
        console.error('No assessment ID provided');
        setLoading(false);
        return;
      }

      try {
        /**
         * We select from design_assessment_results and join the parent assessment via the FK `assessment_id`.
         * Route param `interviewId` corresponds to `design_assessments.id`.
         * We take the most recent result row for that assessment (order by created_at desc).
         */
        const { data, error: dbError } = await supabase
          .from("design_assessment_results")
          .select(
            `
              id,
              created_at,
              reliability,
              scalability,
              availability,
              communication,
              trade_off_analysis,
              suspicion,
              summary,
              transcript,
              diagram,
              design_assessments:assessment_id (
                id,
                applicant_email,
                problem_id,
                started_at,
                ended_at
              )
            `
          )
          .eq("assessment_id", interviewId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (dbError) {
          console.error("Error fetching assessment results:", dbError);
          setError(dbError.message);
          const mockResult =
            mockResults[interviewId] || mockResults["assessment-1"];
          setResults(mockResult);
        } else if (data) {
          const transformed: AssessmentResult = {
            id: data.id,
            applicant_email:
              data.design_assessments?.applicant_email ?? "unknown@applicant",
            problem_id: data.design_assessments?.problem_id ?? "",
            reliability: Number(data.reliability ?? 0),
            scalability: Number(data.scalability ?? 0),
            availability: Number(data.availability ?? 0),
            communication: Number(data.communication ?? 0),
            tradeoff_analysis: Number(data.trade_off_analysis ?? 0),
            suspicion: Number(data.suspicion ?? 0),
            summary: data.summary || "No summary available",
            transcript: data.transcript || "",
            diagram: data.diagram,
            completed_at: data.design_assessments?.ended_at ?? data.created_at,
          };
          setResults(transformed);
        } else {
          // No DB row; fallback
          const mockResult =
            mockResults[interviewId] || mockResults["assessment-1"];
          setResults(mockResult);
        }
      } catch (e: any) {
        console.error("Unexpected error:", e);
        setError(e?.message ?? "Unexpected error");
        const mockResult =
          mockResults[interviewId] || mockResults["assessment-1"];
        setResults(mockResult);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentResults();
  }, [interviewId]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1a0b14 0%, #0a0a0a 50%, #120520 100%)",
        }}
      >
        <Typography variant="h5" sx={{ color: "white" }}>
          Loading assessment results...
        </Typography>
      </Box>
    );
  }

  if (!results) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1a0b14 0%, #0a0a0a 50%, #120520 100%)",
        }}
      >
        <Typography variant="h5" sx={{ color: "white" }}>
          No assessment results found
        </Typography>
      </Box>
    );
  }

  // Average the 5 score pillars
  const overallScore = Math.round(
    (results.reliability +
      results.scalability +
      results.availability +
      results.communication +
      results.tradeoff_analysis) /
      5
  );

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
      {/* Subtle background pattern */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(98, 0, 69, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(98, 0, 69, 0.15) 0%, transparent 50%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 10 }}>
        <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/admin/dashboard")}
            sx={{
              mb: 3,
              bgcolor: "rgba(98, 0, 69, 0.8)",
              backdropFilter: "blur(10px)",
              borderRadius: 1.5,
              px: 3,
              fontWeight: 500,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(98, 0, 69, 1)",
                transform: "scale(1.05)",
              },
            }}
          >
            ← Back to Dashboard
          </Button>

          {!!error && (
            <Typography variant="body2" sx={{ color: "#ffb3c7", mb: 1 }}>
              {error}
            </Typography>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 4,
              background: "rgba(20, 20, 25, 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(98, 0, 69, 0.3)",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(98, 0, 69, 0.2)",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: "white", fontWeight: 600, letterSpacing: 0.5 }}
            >
              Assessment Results
            </Typography>

            <Divider sx={{ my: 3, borderColor: "rgba(98, 0, 69, 0.3)" }} />

            {/* Main Content: Two Columns */}
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexDirection: { xs: "column", md: "row" },
                mb: 3,
              }}
            >
              {/* Left Column */}
              <Box
                sx={{
                  flex: "0 0 42%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {/* Candidate Info + Overall */}
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "white", fontWeight: 500 }}
                    >
                      Candidate Information
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                      <strong>Email:</strong> {results.applicant_email}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                      <strong>Assessment Type:</strong> System Design
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                      <strong>Completed:</strong>{" "}
                      {new Date(results.completed_at).toLocaleString()}
                    </Typography>
                    <Divider
                      sx={{ my: 2, borderColor: "rgba(98, 0, 69, 0.3)" }}
                    />
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "white", fontWeight: 500 }}
                    >
                      Overall Score
                    </Typography>
                    <Typography
                      variant="h2"
                      sx={{ color: "rgba(98, 0, 69, 1)", fontWeight: 600 }}
                    >
                      {overallScore}/10
                    </Typography>
                  </CardContent>
                </Card>

                {/* Performance Breakdown */}
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        mb: 3,
                        color: "white",
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      Performance Breakdown
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 4,
                        "& .MuiChartsLegend-series text": {
                          fill: "white !important",
                        },
                        "& .MuiChartsLegend-label": {
                          fill: "white !important",
                        },
                        "& .MuiChartsLegend-root": {
                          "& text": { fill: "white !important" },
                        },
                      }}
                    >
                      <RadarChart
                        height={450}
                        series={[
                          {
                            label: "Candidate Score",
                            data: [
                              results.reliability,
                              results.scalability,
                              results.availability,
                              results.communication,
                              results.tradeoff_analysis,
                            ],
                            color: "rgba(200, 50, 150, 0.9)",
                          },
                        ]}
                        radar={{
                          max: 10,
                          metrics: [
                            "Reliability",
                            "Scala-\nbility",
                            "Availability",
                            "Communication",
                            "Tradeoff\nAnalysis",
                          ],
                        }}
                        legend={{ hidden: true }} // <— easiest way to kill the warnings
                        sx={{
                          "& .MuiChartsAxis-tickLabel": {
                            fill: "white !important",
                          },
                          "& .MuiChartsLegend-root text": {
                            fill: "white !important",
                          },
                          "& text": { fill: "white !important" },
                          "& .MuiChartsAxis-label": {
                            fill: "white !important",
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Right Column */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {/* Summary */}
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "white", fontWeight: 500 }}
                    >
                      Summary
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        maxHeight: 215,
                        overflow: "auto",
                        bgcolor: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(98, 0, 69, 0.2)",
                        borderRadius: 1,
                        "&::-webkit-scrollbar": { width: "8px" },
                        "&::-webkit-scrollbar-track": {
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: 2,
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "rgba(98, 0, 69, 0.5)",
                          borderRadius: 2,
                          "&:hover": { background: "rgba(98, 0, 69, 0.7)" },
                        },
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "rgba(255, 255, 255, 0.9)",
                          lineHeight: 1.6,
                        }}
                      >
                        {results.summary}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>

                {/* Suspicion Score Sparkline */}
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: "white",
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      Suspicion Score Over Time
                    </Typography>
                    <ProctoringSuspicionChart
                      assessmentId={interviewId}
                      height={510}
                      threshold={80}
                    />
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Bottom: Transcript */}
            {results.transcript && (
              <Box>
                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(98, 0, 69, 0.4) 0%, rgba(50, 20, 40, 0.5) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(98, 0, 69, 0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "white", fontWeight: 500 }}
                    >
                      Interview Transcript
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        maxHeight: 400,
                        overflow: "auto",
                        bgcolor: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(98, 0, 69, 0.2)",
                        borderRadius: 1,
                        "&::-webkit-scrollbar": { width: "8px" },
                        "&::-webkit-scrollbar-track": {
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: 2,
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "rgba(98, 0, 69, 0.5)",
                          borderRadius: 2,
                          "&:hover": { background: "rgba(98, 0, 69, 0.7)" },
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          whiteSpace: "pre-wrap",
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        {results.transcript}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
