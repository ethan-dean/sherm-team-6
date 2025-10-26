import { supabase } from "@/lib/supabase";

// ---------- Types ----------
export interface DesignProblem {
  id: string;
  created_at: string;
  name: string;
  description: string;
  difficulty: number;
  rubric: string;
  agent_id: string | null;
  tags: any;
}

export interface DesignAssessmentDB {
  id: string;
  created_at: string;
  problem_id: string;
  started_at: string | null;
  ended_at: string | null;
  applicant_email: string;
  expires_at: string;
  sender_id: string;
  status: 'incomplete' | 'complete';
  duration_ms: number | null;
}

export interface DesignAssessment extends DesignAssessmentDB {
  completed: boolean; // derived
  score?: number; // optional future
}

// ---------- Helpers ----------
async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

// ---------- Queries ----------
export async function fetchProblems(): Promise<DesignProblem[]> {
  const { data, error } = await supabase
    .from("design_problems")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DesignProblem[];
}

export async function fetchAssessments(): Promise<DesignAssessment[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("design_assessments")
    .select(`
      *,
      design_assessment_results (
        reliability,
        scalability,
        availability,
        communication,
        trade_off_analysis
      )
    `)
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((a: any) => {
    const results = a.design_assessment_results?.[0];
    let overallScore: number | undefined = undefined;

    // Calculate average score from all metrics if results exist
    if (results) {
      const scores = [
        results.reliability,
        results.scalability,
        results.availability,
        results.communication,
        results.trade_off_analysis
      ].filter(s => s != null);

      if (scores.length > 0) {
        overallScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
      }
    }

    return {
      ...a,
      completed: !!a.ended_at,
      score: overallScore,
    };
  });
}

export async function createAssessment(params: {
  problem_id: string;
  applicant_email: string;
  sender_id: string;
  expiresInDays?: number;
}): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (params.expiresInDays ?? 7));

  const { data, error } = await supabase.from("design_assessments").insert([
    {
      problem_id: params.problem_id,
      applicant_email: params.applicant_email,
      sender_id: params.sender_id,
      started_at: null,
      ended_at: null,
      expires_at: expiresAt.toISOString(),
      status: 'incomplete',
      duration_ms: null,
    },
  ]).select('id').single();

  if (error) throw error;
  return data.id;
}