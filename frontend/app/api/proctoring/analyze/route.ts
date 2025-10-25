import { NextRequest, NextResponse } from 'next/server'
import { analyzeFrame } from '../../../../../backend/proctoring-analyzer'

export async function POST(req: NextRequest){
    try {
        const body = await req.json()
        const {session_id, frame, timestamp } = body

        if ( !session_id || !frame ){
            return NextResponse.json(
                {error: 'Missing required fields'},
                {status: 400}
            )
        }

        console.log(`Analyzing frame for session: ${session_id}`)

        const violations = await analyzeFrame({
            session_id,
            frame,
            timestamp
        })

        if (violations.length > 0){
            console.warn(`Violations detected for ${session_id}:`)
            violations.forEach(v=>{
                console.warn(`  - ${v.type} (${v.severity}, confidence: ${v.confidence}): ${v.details}`)
            })
        } else {
            console.log(`No violations for ${session_id}`)
        }

        return NextResponse.json({
            success: true,
            violations
        })
    } catch (error: any){
        console.error('Proctoring analysis error:', error)
        return NextResponse.json(
            {
                error: 'Analysis failed', details: error.message
            },
            {status: 500}
        )
    }
}