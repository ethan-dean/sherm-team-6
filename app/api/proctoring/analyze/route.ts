import { NextRequest, NextResponse } from 'next/server'
import { analyzeFrame } from '@/backend/proctoring-analyzer'

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

        const result = await analyzeFrame({
            session_id,
            frame,
            timestamp
        })

        return NextResponse.json(result)
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