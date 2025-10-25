'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ProctoringMonitor } from '@/components/ProctoringMonitor'

export default function InterviewPage() {
  const params = useParams()
  const assessmentId = params.assessmentId as string
  const [timeLeft, setTimeLeft] = useState(45 * 60) // 45 minutes in seconds
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [violations, setViolations] = useState<Array<{type: string, severity: string, time: string}>>([])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleViolation = (type: string, severity: string) => {
    const time = new Date().toLocaleTimeString()
    setViolations(prev => [...prev, { type, severity, time }])
  }

  const handleSubmit = async () => {
    // TODO: Submit interview data to backend
    alert('Interview submitted! (This will save your work in the actual implementation)')
  }

  const startRecording = () => {
    setIsRecording(true)
    // TODO: Implement actual voice recording
    alert('Voice recording started (implement with Web Audio API)')
  }

  const stopRecording = () => {
    setIsRecording(false)
    // TODO: Stop voice recording
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-gray-900">System Design Interview</h1>
            <div className="text-sm text-gray-600">
              ID: <span className="font-mono">{assessmentId}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Timer */}
            <div className={`text-2xl font-mono font-bold ${
              timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {formatTime(timeLeft)}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Submit Interview
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Proctoring & Instructions */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Proctoring */}
            <div>
              <h2 className="font-semibold text-sm text-gray-700 mb-2">Proctoring</h2>
              <ProctoringMonitor
                sessionId={assessmentId}
                onViolation={handleViolation}
                showPreview={true}
              />
            </div>

            {/* Voice Recording */}
            <div>
              <h2 className="font-semibold text-sm text-gray-700 mb-2">Voice Explanation</h2>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
              </button>
              {isRecording && (
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-red-600 font-medium">Recording...</span>
                </div>
              )}
            </div>

            {/* Violations Log */}
            <div>
              <h2 className="font-semibold text-sm text-gray-700 mb-2">Activity Log</h2>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {violations.length === 0 ? (
                  <p className="text-xs text-gray-500">No issues detected</p>
                ) : (
                  violations.slice(-10).reverse().map((v, i) => (
                    <div key={i} className="text-xs p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                      <div className={`font-semibold ${
                        v.severity === 'high' ? 'text-red-600' :
                        v.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {v.severity.toUpperCase()}
                      </div>
                      <div className="text-gray-700">{v.type}</div>
                      <div className="text-gray-500">{v.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="border-t pt-4">
              <h2 className="font-semibold text-sm text-gray-700 mb-2">Instructions</h2>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Draw your system design on the canvas</li>
                <li>• Explain your solution verbally</li>
                <li>• Consider scalability and reliability</li>
                <li>• Stay visible in the camera</li>
                <li>• Do not switch tabs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Problem Description */}
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <h2 className="font-semibold text-blue-900 mb-1">Problem</h2>
            <p className="text-blue-800">
              Design a URL shortening service like bit.ly that can handle 100 million URLs
              and 1000 requests per second with 99.9% availability.
            </p>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-white p-4">
            <div className="w-full h-full border-2 border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium mb-2">Drawing Canvas</p>
                <p className="text-sm">
                  (Canvas/drawing tool will be implemented here)
                </p>
                <p className="text-xs mt-4">
                  This would integrate with a library like Excalidraw, tldraw, or React Flow
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
