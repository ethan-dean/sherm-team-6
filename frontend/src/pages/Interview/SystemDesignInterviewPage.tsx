import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SystemDesignInterview from './SystemDesignInterview';
import { interviewService } from '@/services/interview.service';
import { ProctoringMonitor } from '../../../../components/ProctoringMonitor';

// Extend HTMLElement to include ElevenLabs widget properties
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'agent-id': string;
      };
    }
  }
}

const INTERVIEW_DURATION_MS = 45 * 60 * 1000; // 45 minutes

const SystemDesignInterviewPage: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const widgetRef = useRef<HTMLElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasSubmittedRef = useRef(false); // Prevent duplicate submissions

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [violations, setViolations] = useState<Array<{type: string, severity: string, timestamp: number}>>([]);

  // Format time as MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    if (timerIntervalRef.current) return; // Already running

    console.log('[Timer] Starting');
    startTimeRef.current = Date.now();
    hasSubmittedRef.current = false;

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const remaining = Math.max(0, INTERVIEW_DURATION_MS - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        stopTimer();
        submitInterview();
      }
    }, 1000);
  };

  // Stop timer
  const stopTimer = () => {
    console.log('[Timer] Stopping');
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimeRemaining(null);
  };

  // Handle proctoring violations
  const handleViolation = (type: string, severity: string) => {
    console.log(`[Proctoring] Violation detected: ${type} (${severity})`);
    setViolations(prev => [...prev, { type, severity, timestamp: Date.now() }]);
  };

  // Submit interview to backend
  const submitInterview = async () => {
    if (hasSubmittedRef.current || !interviewId) return;
    hasSubmittedRef.current = true;

    try {
      console.log('[Interview] Submitting:', interviewId);
      const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;

      await interviewService.submitInterview(interviewId, {
        status: 'completed',
        endedAt: new Date().toISOString(),
        duration,
      });

      console.log('[Interview] Submitted successfully');
    } catch (error) {
      console.error('[Interview] Submission error:', error);
      // Continue to redirect even if submission fails
    } finally {
      // Always redirect to finished page, regardless of success/failure
      console.log('[Interview] Redirecting to finished page');
      navigate('/interview/finished');
    }
  };

  // Load ElevenLabs script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Poll widget button to detect call state
  useEffect(() => {
    const pollInterval = setInterval(() => {
      const widget = widgetRef.current;
      if (!widget?.shadowRoot) return;

      const button = widget.shadowRoot.querySelector('button');
      const buttonText = button?.textContent?.trim() || '';

      // Call is active when button says "End Interview"
      if (buttonText === 'End Interview') {
        if (!timerIntervalRef.current) {
          console.log('[Poll] Call active - starting timer');
          startTimer();
        }
      }
      // Call ended when button says "Start Interview"
      else if (buttonText === 'Start Interview') {
        if (timerIntervalRef.current) {
          console.log('[Poll] Call ended - stopping timer');
          stopTimer();
          submitInterview();
        }
      }
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  return (
    <div className="relative h-screen">
      {/* Proctoring Monitor - Top right with status indicator */}
      {interviewId && (
        <div className="fixed top-4 right-4 z-50">
          <ProctoringMonitor
            sessionId={interviewId}
            onViolation={handleViolation}
            showPreview={false}
          />
        </div>
      )}

      {/* Timer - Floating above AI widget in bottom right */}
      <div className="fixed bottom-40 right-8 z-40">
        <div className="bg-black text-white shadow-md rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            {timeRemaining !== null && (
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
            <div className="text-right">
              <div className="text-xs opacity-70">Time Remaining</div>
              <div className={`text-xl font-mono font-bold ${
                timeRemaining !== null && timeRemaining < 5 * 60 * 1000 ? 'text-red-400 animate-pulse' : ''
              }`}>
                {formatTime(timeRemaining !== null ? timeRemaining : INTERVIEW_DURATION_MS)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ElevenLabs Widget - Bottom right (default position) */}
      <elevenlabs-convai
        ref={widgetRef as any}
        agent-id="agent_5401k89w0ehgejy8z1bghfxrc5cm"
      />

      {/* Main Content */}
      <div>
        <SystemDesignInterview />
      </div>
    </div>
  );
};

export default SystemDesignInterviewPage;
