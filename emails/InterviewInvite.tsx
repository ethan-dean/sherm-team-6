// emails/InterviewInvite.tsx

import React from 'react'
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
  } from '@react-email/components'
  
  interface InterviewInviteEmailProps {
    candidateName: string
    interviewLink: string
    companyName: string
    expiresAt: string
  }
  
  export default function InterviewInviteEmail({
    candidateName,
    interviewLink,
    companyName,
    expiresAt,
  }: InterviewInviteEmailProps) {
    return (
      <Html>
        <Head />
        <Preview>Your System Design Interview Link - {companyName}</Preview>
        <Body style={main}>
          <Container style={container}>
            
            {/* Header */}
            <Heading style={h1}>System Design Interview</Heading>
            
            {/* Greeting */}
            <Text style={text}>Hi {candidateName},</Text>
            
            {/* Introduction */}
            <Text style={text}>
              You've been invited to complete a system design interview for <strong>{companyName}</strong>.
            </Text>
  
            <Text style={text}>
              This is an online assessment where you'll design a system architecture and explain your approach.
            </Text>
  
            {/* What to Expect Box */}
            <Section style={box}>
              <Text style={boxTitle}>What to expect:</Text>
              <ul style={list}>
                <li>45-minute time limit</li>
                <li>Canvas for drawing your system design</li>
                <li>Voice explanation of your solution</li>
                <li>Automated proctoring for integrity</li>
              </ul>
            </Section>
  
            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={interviewLink}>
                Start Interview
              </Button>
            </Section>
  
            {/* Important Info Box */}
            <Section style={box}>
              <Text style={boxTitle}>Important reminders:</Text>
              <ul style={list}>
                <li>This link expires on <strong>{expiresAt}</strong></li>
                <li>You can only take this interview once</li>
                <li>Camera and microphone access required</li>
                <li>Find a quiet place with stable internet</li>
              </ul>
            </Section>
  
            {/* Footer */}
            <Hr style={hr} />
            
            <Text style={footer}>
              If you have any questions, please contact us.
            </Text>
  
            <Text style={footer}>
              Link not working? Copy and paste this URL into your browser:<br />
              <code style={code}>{interviewLink}</code>
            </Text>
  
          </Container>
        </Body>
      </Html>
    )
  }
  
  // ============================================
  // STYLES
  // ============================================
  
  const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  }
  
  const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '580px',
  }
  
  const h1 = {
    color: '#1f2937',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '40px 0 30px',
    padding: '0',
    textAlign: 'center' as const,
  }
  
  const text = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
    padding: '0 40px',
  }
  
  const box = {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    margin: '20px 40px',
    padding: '20px',
  }
  
  const boxTitle = {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 12px',
  }
  
  const list = {
    color: '#374151',
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0',
    paddingLeft: '20px',
  }
  
  const buttonContainer = {
    margin: '32px 0',
    textAlign: 'center' as const,
  }
  
  const button = {
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 40px',
  }
  
  const hr = {
    borderColor: '#e5e7eb',
    margin: '32px 40px',
  }
  
  const footer = {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '24px',
    margin: '8px 40px',
  }
  
  const code = {
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'monospace',
    wordBreak: 'break-all' as const,
  }
  