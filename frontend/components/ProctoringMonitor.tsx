'use client'

import React, { useEffect, useRef, useState } from 'react';

interface ProctoringMonitorProps {
    sessionId: string
    onViolation: (type: string, severity: string ) => void
    showPreview?: boolean
}

export function ProctoringMonitor({
    sessionId,
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

                console.log('Proctoring started ')
            }   catch (err: any){
                console.error('Camera access denied: ', err)
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
        }, 10000)

        return () => clearInterval(interval)
    }, [stream, isActive, sessionId])

    useEffect(() => {
        function handleVisibilityChange() {
            if ( document.hidden){
                console.warn('Tab switch detected')

                fetch('/api/proctoring/violation', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        session_id: sessionId,
                        violation_type: 'tab_switch',
                        severity: 'low',
                        timestamp: Date.now()
                    })

                    
                }).catch(err =>console.error('Failed to log tab switch: ',err))

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

        console.log('Capturing frame for anaylsis...')

        try {
            const response = await fetch('/api/proctoring/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: sessionId,
                frame: frameBase64,
                timestamp: Date.now()
              })
            })

        const result = await response.json()

        if ( result.violations && result.violations.length > 0){
            console.warn('Violations Detected: ', result.violations)
            result.violations.forEach((v: any) => {
                onViolation(v.type, v.severity)
            })
        } else {
            console.log('No violations detected')
        }
    } catch(error){
        console.error('Failed to analyze frame:', error)
    }
  }

    return (
        <div className="proctoring-monitor">
          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={showPreview ? 'w-48 h-36 rounded-lg border-2 border-gray-300 object-cover' : 'hidden'}
          />
    
          {/* Canvas (always hidden) */}
          <canvas ref={canvasRef} className="hidden" />
    
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

