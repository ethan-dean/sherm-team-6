import React from 'react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-4">System Design Interview Grader</h1>
        <p className="text-gray-600 mb-8">
          AI-powered grading system for system design interviews with proctoring capabilities.
        </p>

        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">Features:</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>AI-powered interview grading using Gemini</li>
            <li>Real-time proctoring with webcam monitoring</li>
            <li>Suspicion scoring system (0-100)</li>
            <li>Tab switch detection</li>
            <li>Prompt injection protection</li>
            <li>Email invitation system with Resend</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
