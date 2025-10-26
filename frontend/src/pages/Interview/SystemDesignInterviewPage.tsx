import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversation } from '@elevenlabs/react';
import SystemDesignInterview from './SystemDesignInterview';
import { interviewService } from '@/services/interview.service';

const INTERVIEW_DURATION_MS = 45 * 60 * 1000; // 45 minutes

const SystemDesignInterviewPage: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const conversation = useConversation();
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasSubmittedRef = useRef(false); // Prevent duplicate submissions
  const prevStatusRef = useRef<string>(conversation.status);

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

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

  // Handle conversation start/stop with microphone permissions
  const handleStartConversation = async () => {
    // Check and request microphone access
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error('[Microphone] Access denied:', error);
      alert('Please enable microphone access to start the interview.');
      return;
    }

    // Start the session with ElevenLabs agent
    try {
      await conversation.startSession({
        agentId: 'agent_5401k89w0ehgejy8z1bghfxrc5cm',
        connectionType: 'webrtc',
      });
    } catch (error) {
      console.error('[Conversation] Failed to start session:', error);
    }
  };

  const handleStopConversation = async () => {
    await conversation.endSession();
  };

  // Monitor conversation status to control timer
  useEffect(() => {
    // Capture timer state at the start, before any potential cleanup
    const hasTimer = timerIntervalRef.current !== null;
    const prevStatus = prevStatusRef.current;
    const currentStatus = conversation.status;

    const isSessionActive = currentStatus === 'connected' || currentStatus === 'connecting';
    const wasSessionActive = prevStatus === 'connected' || prevStatus === 'connecting' || prevStatus === 'disconnecting';

    // Session started (connected/connecting) - start timer
    if (isSessionActive && !hasTimer) {
      startTimer();
    }

    // Session ended (disconnecting/disconnected after being active) - stop timer and submit
    if (
      (currentStatus === 'disconnecting' || currentStatus === 'disconnected') &&
      wasSessionActive &&
      hasTimer &&
      !hasSubmittedRef.current
    ) {
      stopTimer();
      submitInterview();
    }

    // Update previous status
    prevStatusRef.current = currentStatus;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.status, interviewId]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-screen">
      {/* Timer - Bottom right corner, above interview controls */}
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

      {/* Interview Control Buttons - Bottom right */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3">
        {conversation.status === 'disconnected' ? (
          <button
            onClick={handleStartConversation}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-4 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-white rounded-full" />
              <span className="text-lg">Start Interview</span>
            </div>
          </button>
        ) : (
          <button
            onClick={handleStopConversation}
            disabled={conversation.status === 'disconnecting'}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
              <span className="text-lg">End Interview</span>
            </div>
          </button>
        )}

        {/* Status indicator */}
        {conversation.status !== 'disconnected' && (
          <div className="bg-black/80 text-white text-sm px-4 py-2 rounded-xl text-center">
            {conversation.isSpeaking ? '🎙️ AI is speaking...' : '👂 Listening...'}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div>
        <SystemDesignInterview sendContextualUpdate={conversation.sendContextualUpdate} />
      </div>
    </div>
  );
};

export default SystemDesignInterviewPage;
