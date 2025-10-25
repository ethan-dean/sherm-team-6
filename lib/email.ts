// lib/email.ts

import { Resend } from 'resend'
import InterviewInviteEmail from '@/emails/InterviewInvite'

const RESEND_API_KEY = process.env.RESEND_API_KEY

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables')
}

const resend = new Resend(RESEND_API_KEY)

const EMAIL_CONFIG = {
  from: 'Your Company <onboarding@resend.dev>',
  companyName: 'Your Company',
  baseUrl: 'http://localhost:3000',
}


export interface InterviewInviteData {
  candidateEmail: string
  candidateName: string
  assessmentId: string  // Changed from sessionId to assessmentId
  companyName?: string
}

export interface EmailResult {
  success: boolean
  emailId?: string
  error?: string
}


export async function sendInterviewInvite(
  data: InterviewInviteData
): Promise<EmailResult> {
  
  const { candidateEmail, candidateName, assessmentId, companyName } = data

  try {
    // Generate interview link using assessmentId
    const interviewLink = `${EMAIL_CONFIG.baseUrl}/interview/${assessmentId}`

    // Calculate expiration (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    const expirationString = expiresAt.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York'
    })

    console.log('📧 Sending email to:', candidateEmail)
    console.log('   Assessment ID:', assessmentId)

    // Send email
    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: candidateEmail,
      subject: `Your System Design Interview Link - ${companyName || EMAIL_CONFIG.companyName}`,
      react: InterviewInviteEmail({
        candidateName,
        interviewLink,
        companyName: companyName || EMAIL_CONFIG.companyName,
        expiresAt: expirationString,
      }),
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully! ID:', emailData?.id)

    // TODO: When you're ready to save email logs to database:
    // Create a separate email_logs table or add email_sent_at field to design_assessments
    // 
    // Option 1: Update design_assessments table
    // await supabase
    //   .from('design_assessments')
    //   .update({ 
    //     email_sent_at: new Date(),
    //     resend_email_id: emailData?.id 
    //   })
    //   .eq('id', assessmentId)
    //
    // Option 2: Create separate email_logs table
    // await supabase.from('email_logs').insert({
    //   assessment_id: assessmentId,
    //   email_id: emailData?.id,
    //   recipient: candidateEmail,
    //   sent_at: new Date()
    // })

    return { 
      success: true, 
      emailId: emailData?.id 
    }

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}