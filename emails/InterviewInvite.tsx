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
  // STYLES - Matching Login & Card Components
  // ============================================

  const main = {
    backgroundColor: '#0a0a0a',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    padding: '40px 0',
  }

  const container = {
    backgroundColor: 'rgba(20, 21, 23, 0.9)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    margin: '0 auto',
    padding: '48px 40px',
    borderRadius: '16px',
    maxWidth: '600px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  }

  const h1 = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 32px',
    padding: '0',
    textAlign: 'center' as const,
    letterSpacing: '-0.02em',
  }

  const text = {
    color: '#e5e7eb',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
  }

  const box = {
    backgroundColor: 'rgba(30, 32, 35, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    margin: '24px 0',
    padding: '24px',
  }

  const boxTitle = {
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: '600',
    margin: '0 0 16px',
  }

  const list = {
    color: '#d1d5db',
    fontSize: '15px',
    lineHeight: '28px',
    margin: '0',
    paddingLeft: '20px',
  }

  const buttonContainer = {
    margin: '40px 0',
    textAlign: 'center' as const,
  }

  const button = {
    backgroundColor: '#3b82f6',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 48px',
    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
  }

  const hr = {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    margin: '40px 0',
  }

  const footer = {
    color: '#9ca3af',
    fontSize: '14px',
    lineHeight: '24px',
    margin: '12px 0',
  }

  const code = {
    backgroundColor: 'rgba(30, 32, 35, 0.8)',
    color: '#93c5fd',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'monospace',
    wordBreak: 'break-all' as const,
  }
  