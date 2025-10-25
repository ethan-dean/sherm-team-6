'use client'

import React, { useState } from 'react'
import { ProctoringMonitor } from '@/components/ProctoringMonitor'

export default function TestPage() {
  const [violations, setViolations] = useState<Array<{type: string, severity: string, time: string}>>([])

  const handleViolation = (type: string, severity: string) => {
    const time = new Date().toLocaleTimeString()
    setViolations(prev => [...prev, { type, severity, time }])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Proctoring & Grading Test Page</h1>

        {/* Proctoring Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Proctoring Monitor</h2>
          <ProctoringMonitor
            sessionId="test-session-123"
            onViolation={handleViolation}
            showPreview={true}
          />

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Detected Issues:</h3>
            <div className="space-y-2">
              {violations.length === 0 ? (
                <p className="text-gray-500">No issues detected yet</p>
              ) : (
                violations.map((v, i) => (
                  <div key={i} className="p-3 bg-gray-100 rounded">
                    <span className={`font-semibold ${
                      v.severity === 'high' ? 'text-red-600' :
                      v.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      [{v.severity.toUpperCase()}]
                    </span>
                    <span className="ml-2">{v.type}</span>
                    <span className="ml-2 text-gray-500 text-sm">{v.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Grading Test Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">LLM Grader Test</h2>
          <p className="text-gray-600 mb-4">
            Run the grader tests in your terminal:
          </p>
          <code className="block bg-gray-900 text-green-400 p-4 rounded">
            npm run test
          </code>
          <p className="text-gray-600 mt-4">
            This will test both normal grading and prompt injection detection.
          </p>
        </div>
      </div>
    </div>
  )
}
