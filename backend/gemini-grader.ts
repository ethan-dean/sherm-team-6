import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyD-9-jec8yZmLVSzaVQjAHd6YFjipFFxm8";

interface GradingInput {
    problemDescription: string
    rubric: string
    transcript: string
    diagramJson: {
        nodes: Array<{id:string; label: string; type?: string }>
        edges: Array<{ source: string; target: string; label?: string }>
    }
}

interface GradingOutput {
    scores: {
        reliability: number
        scability: number
        availability: number
        communication: number
        tradeoff_analysis: number
    }
    overall_score: number
    summary: string
    strengths: string[]
    weaknesses: string[]
}