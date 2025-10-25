import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProctoringFrame, ProctoringAnalysisResult } from '../types/proctoring'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export async function analyzeFrame(frame:ProctoringFrame): Promise<ProctoringAnalysisResult> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
        }
    })

    const imageData = frame.frame.replace(/^data:image\/\w+;base64,/, '')
    
    const prompt = `You are a proctoring AI analyzing a webcam frame from an online interview.

Analyze this image and provide a SUSPICION SCORE from 0-100:
- 0 = No issues, normal behavior
- 1-30 = Minor concerns (slight movements, brief distractions)
- 31-60 = Moderate suspicion (looking away, phone nearby, distracted)
- 61-90 = High suspicion (multiple people, phone in hand, not looking at screen)
- 91-100 = Critical violation (cheating detected, external assistance)

Consider these factors:
- Are they looking at the camera/screen?
- Is anyone else visible?
- Are there phones or devices visible?
- Are they engaged or distracted?
- Is their behavior appropriate for an interview?

Output ONLY valid JSON:
{
  "suspicion_score": <number 0-100>,
  "reasons": ["<reason 1>", "<reason 2>", ...]
}

If everything looks normal (score 0-30), reasons can be empty: {"suspicion_score": 0, "reasons": []}`

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageData
                }
            }
        ])
        const jsonText = result.response.text()
        console.log('Gemini response:', jsonText)

        const analysis = JSON.parse(jsonText)

        console.log('Suspicion score:', analysis.suspicion_score)

        return {
            success: true,
            suspicion_score: analysis.suspicion_score || 0,
            reasons: analysis.reasons || []
        }
    } catch (error: any) {
        console.error("Frame analysis error:", error.message)
        return {
            success: false,
            suspicion_score: 0,
            reasons: ['Analysis failed']
        }
    }
}