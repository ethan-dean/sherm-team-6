import { NextRequest, NextResponse } from 'next/server'

export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}

export async function POST(
    req: NextRequest,
    { params }: { params: { interviewId: string } }
) {
    try {
        const { interviewId } = params
        const body = await req.json()
        const { status, endedAt, duration } = body

        console.log(`[Interview] Submission for ${interviewId}:`, { status, endedAt, duration })

        // TODO: Save to Supabase database
        // await supabase
        //   .from('interviews')
        //   .update({ status, ended_at: endedAt, duration })
        //   .eq('id', interviewId)

        return NextResponse.json(
            {
                success: true,
                interviewId,
                status,
            },
            {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            }
        )
    } catch (error: any) {
        console.error('[Interview] Submission error:', error)
        return NextResponse.json(
            {
                error: 'Failed to submit interview',
                details: error.message,
            },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            }
        )
    }
}
