'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function PreInterviewPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.assessmentId as string
  const [isReady, setIsReady] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)
  const [hasMicrophone, setHasMicrophone] = useState(false)
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const checkPermissions = async () => {
    setIsCheckingPermissions(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setHasCamera(true)
      setHasMicrophone(true)
      stream.getTracks().forEach(track => track.stop())
    } catch (err) {
      console.error('Permission denied:', err)
      alert('Camera and microphone access are required for this interview. Please allow permissions and try again.')
    } finally {
      setIsCheckingPermissions(false)
    }
  }

  const startInterview = () => {
    if (hasCamera && hasMicrophone && isReady) {
      router.push(`/interview/${assessmentId}/start`)
    }
  }

  const allRequirementsMet = hasCamera && hasMicrophone && isReady

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .float-in {
          animation: floatIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
        }

        .checkbox-simple {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 1.5px solid #666;
          border-radius: 3px;
          background: #000;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .checkbox-simple:checked {
          background: #fff;
          border-color: #fff;
        }

        .checkbox-simple:checked::after {
          content: '';
          position: absolute;
          top: 1px;
          left: 5px;
          width: 4px;
          height: 9px;
          border: solid #000;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-simple:hover {
          border-color: #999;
        }
      `}</style>

      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          {/* Header */}
          <div
            className={`bg-black border border-white/20 rounded-t-lg p-6 ${mounted ? 'float-in' : 'opacity-0'}`}
            style={{ animationDelay: '0ms' }}
          >
            <div className="text-center">
              <svg className="w-10 h-10 text-white mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-3xl font-bold text-white mb-2">
                System Design Interview
              </h1>
              <div className="inline-flex items-center space-x-2 border border-white/20 px-3 py-1.5 rounded">
                <span className="text-xs text-gray-400">Assessment ID:</span>
                <span className="font-mono text-xs text-white">{assessmentId}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div
            className={`bg-black border-x border-white/20 p-6 space-y-5 ${mounted ? 'float-in' : 'opacity-0'}`}
            style={{ animationDelay: '100ms' }}
          >
            {/* Welcome Message */}
            <div className="border border-white/20 rounded p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-4 h-4 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h2 className="font-semibold text-white text-sm mb-1">Before You Begin</h2>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Please complete the checklist below to ensure the best interview experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div
              className={`space-y-4 ${mounted ? 'float-in' : 'opacity-0'}`}
              style={{ animationDelay: '250ms' }}
            >
              <h3 className="text-base font-semibold text-white flex items-center">
                <span className="bg-white text-black w-6 h-6 rounded flex items-center justify-center text-xs font-bold mr-2">
                  ✓
                </span>
                System Requirements
              </h3>

              <div className="space-y-3">
                {/* Camera & Mic */}
                <div className={`border rounded p-4 transition-all ${
                  hasCamera && hasMicrophone
                    ? 'border-white bg-white/5'
                    : 'border-white/20'
                }`}>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <div className="flex-shrink-0 mt-0.5">
                      {hasCamera && hasMicrophone ? (
                        <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <input
                          type="checkbox"
                          checked={hasCamera && hasMicrophone}
                          onChange={checkPermissions}
                          disabled={isCheckingPermissions}
                          className="checkbox-simple"
                        />
                      )}
                    </div>
                    <div className="flex-1" onClick={!hasCamera || !hasMicrophone ? checkPermissions : undefined}>
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-white text-sm">Camera & Microphone Access</span>
                        {hasCamera && hasMicrophone && (
                          <span className="text-xs bg-white text-black px-2 py-0.5 rounded font-medium">
                            Granted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Required for proctoring and voice explanation
                      </p>
                    </div>
                  </label>
                </div>

                {/* Ready */}
                <div className={`border rounded p-4 transition-all ${
                  isReady
                    ? 'border-white bg-white/5'
                    : 'border-white/20'
                }`}>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <div className="flex-shrink-0 mt-0.5">
                      {isReady ? (
                        <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isReady}
                          onChange={(e) => setIsReady(e.target.checked)}
                          className="checkbox-simple"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-white text-sm">I am ready to begin</span>
                        {isReady && (
                          <span className="text-xs bg-white text-black px-2 py-0.5 rounded font-medium">
                            Confirmed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Quiet environment with stable internet
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div
              className={`border border-white/20 rounded p-4 ${mounted ? 'float-in' : 'opacity-0'}`}
              style={{ animationDelay: '400ms' }}
            >
              <div className="flex items-start space-x-3">
                <svg className="w-4 h-4 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-2">Important Guidelines</h3>
                  <ul className="space-y-1.5 text-xs text-gray-400">
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      <span><strong className="text-white">45-minute time limit</strong> - Auto-submit when expired</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      <span><strong className="text-white">Single attempt</strong> - Cannot retake assessment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      <span><strong className="text-white">Stay in frame</strong> - Face clearly visible</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      <span><strong className="text-white">No tab switching</strong> - Stay in window</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      <span><strong className="text-white">Work alone</strong> - No others in camera</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`bg-black border border-white/20 rounded-b-lg p-6 ${mounted ? 'float-in' : 'opacity-0'}`}
            style={{ animationDelay: '550ms' }}
          >
            <button
              onClick={startInterview}
              disabled={!allRequirementsMet}
              className={`w-full py-3.5 px-6 rounded font-semibold text-sm transition-all ${
                allRequirementsMet
                  ? 'bg-white text-black hover:bg-gray-200 cursor-pointer'
                  : 'bg-gray-900 text-gray-600 cursor-not-allowed border border-white/10'
              }`}
            >
              {allRequirementsMet ? (
                <span className="flex items-center justify-center space-x-2">
                  <span>Start Interview</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              ) : (
                'Complete all requirements to continue'
              )}
            </button>

            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Need help? Contact support</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
