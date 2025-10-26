'use client'

import React, { useEffect, useRef, useState } from 'react';

interface ProctoringMonitorProps {
    sessionId: string
    assessmentId?: string
    onViolation: (type: string, severity: string ) => void
    showPreview?: boolean
}

export function ProctoringMonitor({
    sessionId,
    assessmentId,
    onViolation,
    showPreview = false
}: ProctoringMonitorProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [ stream, setStream ] = useState<MediaStream | null>(null)
    const [isActive, setIsActive ] = useState(false)
    const [ error, setError ] = useState<string | null > (null)

    useEffect(() => {
        async function startWebcam() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: {ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    },
                    audio: false
                })
                setStream(mediaStream)
                setIsActive(true)
                setError(null)

                if (videoRef.current){
                    videoRef.current.srcObject = mediaStream
                }
            }   catch (err: any){
                console.error('Camera access denied:', err)
                setError('Camera access is required')
                setIsActive(false)
            }    
        }
        startWebcam()

        return () => {
            stream?.getTracks().forEach(track => track.stop())

        }
    }, [])

    useEffect(() => {
        if (!stream || !isActive)return

        const interval = setInterval(() => {
            captureAndAnalyze()
        }, 5000) // Changed from 10000ms (10 seconds) to 5000ms (5 seconds)

        return () => clearInterval(interval)
    }, [stream, isActive, sessionId])

    useEffect(() => {
        function handleVisibilityChange() {
            if ( document.hidden){
                fetch('http://localhost:3000/api/proctoring/violation', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        session_id: sessionId,
                        violation_type: 'tab_switch',
                        severity: 'low',
                        timestamp: Date.now()
                    })


                }).catch(err => console.error('Failed to log tab switch:', err))

                onViolation('tab_switch', 'low')
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)

    }, [sessionId, onViolation])

    async function captureAndAnalyze(){
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return 

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const frameBase64 = canvas.toDataURL('image/jpeg', 0.6)

        try {
            const response = await fetch('http://localhost:3000/api/proctoring/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: sessionId,
                assessment_id: assessmentId,
                frame: frameBase64,
                timestamp: Date.now()
              })
            })

        const result = await response.json()

        if (result.suspicion_score > 30) {
            onViolation(`suspicion_${result.suspicion_score}`, result.suspicion_score > 60 ? 'high' : 'medium')
        }
    } catch(error){
        console.error('Failed to analyze frame:', error)
    }
  }

    return (
        <div className="proctoring-monitor">
          {/* Video element - rendered but invisible to user */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none',
              zIndex: -1
            }}
          />

          {/* Canvas (always hidden) */}
          <canvas ref={canvasRef} className="hidden" style={{ display: 'none' }} />
    
          {/* Status indicator */}
          {!showPreview && (
            <div className="flex items-center gap-2">
              {isActive ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-green-600 font-medium">Proctoring Active</span>
                </>
              ) : error ? (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-red-600 font-medium">Camera Required</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-yellow-600 font-medium">Starting...</span>
                </>
              )}
            </div>
          )}
    
          {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
        </div>
      )
}

