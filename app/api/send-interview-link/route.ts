import { NextRequest, NextResponse } from 'next/server'
import { sendInterviewInvite } from '@/lib/email'

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
        const { candidateEmail, candidateName, assessmentId, company } = body

        if (!candidateEmail || !candidateName || !assessmentId) {
            return NextResponse.json(
                { error: 'Missing required fields: candidateEmail, candidateName, assessmentId'},
                { status: 400 }
            )
        }

        console.log('Sending interview link...')
        console.log('  → To:', candidateEmail)
        console.log('  → Name:', candidateName)
        console.log('  → Assessment ID:', assessmentId)

        const result = await sendInterviewInvite({
            candidateEmail,
            candidateName,
            assessmentId,
            companyName: company,
        })

        if (!result.success){
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            )
        }
        // TODO: When you're ready to use Supabase:
        // This is where you would create or update the design_assessments record
        // 
        // Option 1: If assessment already exists, just update it
        // await supabase
        //   .from('design_assessments')
        //   .update({ 
        //     applicant_email: candidateEmail,
        //     expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        //   })
        //   .eq('id', assessmentId)
        //
        // Option 2: If creating new assessment
        // const { data, error } = await supabase
        //   .from('design_assessments')
        //   .insert({
        //     id: assessmentId, // Or let Supabase generate UUID
        //     applicant_email: candidateEmail,
        //     problem_id: problemId, // You'll need to pass this in
        //     expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        //     created_at: new Date()
        //   })
        //   .select()
        //   .single()
        
        return NextResponse.json({
            success: true,
            emailid: result.emailId,
            assessmentId: assessmentId,
            message: 'Interview invitation sent successfully',
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        })

    } catch ( error: any ){
        console.error('API error: ', error )
        return NextResponse.json(
            { error: 'Failed to send invitation', details: error.message },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            }
        )
    }
}