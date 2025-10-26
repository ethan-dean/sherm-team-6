import { NextRequest, NextResponse } from 'next/server'
import { analyzeFrame } from '@/backend/proctoring-analyzer'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize Supabase client if credentials exist
const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null

export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}

export async function POST(req: NextRequest){
    try {
        const body = await req.json()
        const {session_id, frame, timestamp, assessment_id } = body

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

        // Save frame to Supabase Storage and database
        if (supabase) {
            try {
                // Convert base64 to buffer
                const base64Data = frame.replace(/^data:image\/\w+;base64,/, '')
                const buffer = Buffer.from(base64Data, 'base64')

                // Generate unique filename
                const filename = `${session_id}/${timestamp}.jpg`

                // Upload to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('proctoring-frames')
                    .upload(filename, buffer, {
                        contentType: 'image/jpeg',
                        upsert: false
                    })

                if (uploadError) {
                    console.error('[Proctoring] Upload error:', uploadError)
                } else {
                    // Get public URL
                    const { data: urlData } = supabase.storage
                        .from('proctoring-frames')
                        .getPublicUrl(filename)

                    const imageUrl = urlData.publicUrl

                    // Save to database
                    const { error: dbError } = await supabase
                        .from('proctoring_frames')
                        .insert({
                            session_id,
                            assessment_id,
                            timestamp,
                            suspicion_score: result.suspicion_score || 0,
                            reasons: result.reasons || [],
                            image_url: imageUrl
                        })

                    if (dbError) {
                        console.error('[Proctoring] Database error:', dbError)
                    } else {
                        console.log(`[Proctoring] Saved frame for ${session_id}: score ${result.suspicion_score}`)
                    }
                }
            } catch (saveError) {
                console.error('[Proctoring] Failed to save frame:', saveError)
                // Don't fail the request if save fails
            }
        }

        return NextResponse.json(result, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
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