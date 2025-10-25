export interface ProctoringViolation {
    type: 'multiple_faces' | 'no_face' | 'looking_away' | 'phone_visible' | 'tab_switch'
    severity: 'low' | 'medium' | 'high'
    confidence?: number
    details: string
    timestamp: number
  }

  export interface ProctoringFrame {
    session_id: string
    frame: string // base64 image
    timestamp: number
  }

  export interface ProctoringAnalysisResult {
    success: boolean
    suspicion_score: number // 0-100
    reasons: string[]
  }