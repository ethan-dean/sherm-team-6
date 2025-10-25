import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest){
    try{
        const body = await req.json()
        const { session_id, violation_type, severity, timestamp } = body

        console.log(`Violation logged: ${violation_type} (${severity}) for session ${session_id}`)

        // TODO: Save to database when you add Supabase
        // await supabase.from('proctoring_events').insert({
        //   session_id,
        //   violation_type,
        //   severity,
        //   timestamp: new Date(timestamp)
        // })

        return NextResponse.json({ success: true })
    } catch ( error: any ){
        console.error ('Failed to log violation: ', error)
        return NextResponse.json(
            { error: 'Failed to log violation' },
            { status: 500 }
        )
    }
    
}