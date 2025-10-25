import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProctoringFrame, ProctoringViolation } from '../frontend/types/proctoring'

const GEMINI_API_KEY = 'AIzaSyD-9-jec8yZmLVSzaVQjAHd6YFjipFFxm8'

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export async function analyzeFrame(frame:ProctoringFrame): Promise<ProctoringViolation[]> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
        }
    })

    const imageData = frame.frame.replace(/^data:image\/\w+;base64,/, '')
    
    const prompt = `You are a proctoring system analyzing a webcam frame from an online interview.

    Analyze this image and detect any violations:
    
    **Violations to check:**
    1. **multiple_faces** - More than one person visible (HIGH severity)
    2. **no_face** - No person visible in frame (MEDIUM severity)
    3. **looking_away** - Person not facing the camera/screen (LOW severity)
    4. **phone_visible** - Mobile phone visible in frame (HIGH severity)
    
    **Instructions:**
    - Be strict but fair
    - Only flag clear violations (confidence > 0.7)
    - If image quality is poor, ignore low-confidence detections
    
    **Output ONLY valid JSON:**
    
    {
      "violations": [
        {
          "type": "multiple_faces|no_face|looking_away|phone_visible",
          "severity": "low|medium|high",
          "confidence": <number 0.0-1.0>,
          "details": "<brief description of what you see>"
        }
      ]
    }
    
    If NO violations detected, return:
    {
      "violations": []
    }
    
    Output ONLY the JSON, nothing else.`

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
        console.log('Gemini proctoring response:', jsonText)

        const analysis = JSON.parse(jsonText)

        const violations = (analysis.violations || []).map((v:any) => ({
            ...v,
            timestamp: frame.timestamp
        }))

        return violations
    } catch (error: any) {
        console.error("Frame analysis error: ", error)
        return []
    }
}