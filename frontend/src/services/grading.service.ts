// Grading Service
// Orchestrates the interview grading process by:
// 1. Fetching problem details from Supabase
// 2. Fetching conversation transcript from ElevenLabs
// 3. Calling Supabase Edge Function to grade with Gemini
// 4. Saving results to design_assessment_results table

import { supabase } from '@/lib/supabase'

const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_API_KEY || import.meta.env.PUBLIC_ELEVEN_API_KEY

interface DiagramJson {
  nodes: Array<{ id: string; label?: string; type?: string; data?: any }>
  edges: Array<{ source: string; target: string; label?: string }>
}

interface ProblemDetails {
  description: string
  rubric: string
}

interface TranscriptItem {
  role: string
  message: string
  time_in_call_secs: number
}

interface GradingInput {
  transcript: string
  diagramJson: DiagramJson
  assessment_id: string
  problemDescription: string
  rubric: string
}

interface GradingOutput {
  assessment_id: string
  scores: {
    reliability: number
    scalability: number
    availability: number
    communication: number
    trade_off_analysis: number
  }
  overall_score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
}

/**
 * Fetches problem description and rubric from Supabase
 * Uses assessment_id -> problem_id -> design_problems table
 */
export async function fetchProblemDetails(assessmentId: string): Promise<ProblemDetails> {
  console.log('[Grading] Fetching problem details for assessment:', assessmentId)

  // Step 1: Get problem_id from design_assessments
  const { data: assessment, error: assessmentError } = await supabase
    .from('design_assessments')
    .select('problem_id')
    .eq('id', assessmentId)
    .single()

  if (assessmentError || !assessment) {
    throw new Error(`Failed to fetch assessment: ${assessmentError?.message || 'Not found'}`)
  }

  console.log('[Grading] Found problem_id:', assessment.problem_id)

  // Step 2: Get description and rubric from design_problems
  const { data: problem, error: problemError } = await supabase
    .from('design_problems')
    .select('description, rubric')
    .eq('id', assessment.problem_id)
    .single()

  if (problemError || !problem) {
    throw new Error(`Failed to fetch problem: ${problemError?.message || 'Not found'}`)
  }

  console.log('[Grading] Problem details fetched successfully')
  return {
    description: problem.description,
    rubric: problem.rubric
  }
}

/**
 * Fetches conversation transcript from ElevenLabs API
 * Retries up to maxRetries times if transcript is not ready
 */
export async function fetchConversationTranscript(
  conversationId: string,
  maxRetries: number = 3,
  retryDelay: number = 3000
): Promise<string> {
  console.log('[Grading] Fetching transcript for conversation:', conversationId)

  if (!ELEVEN_LABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[Grading] Fetch attempt ${attempt}/${maxRetries}`)

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    console.log('[Grading] Conversation status:', data.status)

    // Convert transcript array to readable string
    if (data.transcript && Array.isArray(data.transcript) && data.transcript.length > 0) {
      const transcriptText = data.transcript
        .map((item: TranscriptItem) => `[${item.role}]: ${item.message}`)
        .join('\n')

      console.log('[Grading] Transcript fetched successfully, length:', transcriptText.length)
      return transcriptText
    }

    // If transcript is empty and we have retries left, wait and try again
    if (attempt < maxRetries) {
      console.log(`[Grading] Transcript not ready, waiting ${retryDelay}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }

  // All retries exhausted, return empty string
  console.warn('[Grading] No transcript found after all retries, using empty string')
  return ''
}

/**
 * Calls Supabase Edge Function to grade the interview using Gemini
 */
export async function gradeInterview(input: GradingInput): Promise<GradingOutput> {
  console.log('[Grading] Calling edge function to grade interview')

  const { data, error } = await supabase.functions.invoke('grade-interview', {
    body: input
  })

  if (error) {
    console.error('[Grading] Edge function error:', error)
    throw new Error(`Failed to grade interview: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from grading function')
  }

  console.log('[Grading] Interview graded successfully')
  return data as GradingOutput
}

/**
 * Saves grading results to design_assessment_results table
 */
export async function saveGradingResults(
  results: GradingOutput,
  transcript: string,
  diagramJson: DiagramJson
): Promise<void> {
  console.log('[Grading] Saving results to database')

  const { error } = await supabase
    .from('design_assessment_results')
    .insert({
      assessment_id: results.assessment_id,
      reliability: results.scores.reliability,
      scalability: results.scores.scalability,
      availability: results.scores.availability,
      communication: results.scores.communication,
      trade_off_analysis: results.scores.trade_off_analysis,
      summary: results.summary,
      transcript: transcript,
      diagram: diagramJson,
    })

  if (error) {
    console.error('[Grading] Database insert error:', error)
    throw new Error(`Failed to save results: ${error.message}`)
  }

  console.log('[Grading] Results saved successfully')
}

/**
 * Main orchestrator function that coordinates the entire grading process
 */
export async function orchestrateGrading(
  assessmentId: string,
  conversationId: string | null,
  diagramJson: DiagramJson
): Promise<void> {
  console.log('[Grading] Starting orchestration for assessment:', assessmentId)

  try {
    // Step 1: Fetch problem details from Supabase
    const problemDetails = await fetchProblemDetails(assessmentId)

    // Step 2: Fetch transcript from ElevenLabs (if conversation exists)
    let transcript = ''
    console.log('[Grading] Conversation ID received:', conversationId)
    if (conversationId) {
      try {
        // Fetch with retry logic (will wait up to 3 attempts with 3s delays)
        transcript = await fetchConversationTranscript(conversationId)
        console.log('[Grading] Final transcript length:', transcript.length, 'characters')
      } catch (error) {
        console.warn('[Grading] Failed to fetch transcript, continuing with empty:', error)
        // Continue with empty transcript rather than failing completely
      }
    } else {
      console.warn('[Grading] ⚠️  No conversation ID provided, using empty transcript')
    }

    // Step 3: Normalize diagram JSON to match expected format
    const normalizedDiagram: DiagramJson = {
      nodes: diagramJson.nodes.map(node => ({
        id: node.id,
        label: node.data?.label || node.label || 'Unlabeled',
        type: node.data?.kind || node.type || 'Component'
      })),
      edges: diagramJson.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        label: edge.label || undefined
      }))
    }

    // Step 4: Grade the interview via Edge Function
    const gradingInput: GradingInput = {
      transcript,
      diagramJson: normalizedDiagram,
      assessment_id: assessmentId,
      problemDescription: problemDetails.description,
      rubric: problemDetails.rubric
    }

    const results = await gradeInterview(gradingInput)

    // Step 5: Save results to database (including transcript and diagram)
    await saveGradingResults(results, transcript, normalizedDiagram)

    console.log('[Grading] Orchestration completed successfully')
  } catch (error) {
    console.error('[Grading] Orchestration failed:', error)
    throw error
  }
}
