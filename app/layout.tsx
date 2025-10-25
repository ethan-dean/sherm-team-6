import React from 'react'
import './globals.css'

export const metadata = {
  title: 'System Design Interview Grader',
  description: 'AI-powered grading system for system design interviews',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
