import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { Canvas } from "@/features/system-design/components/Canvas";

interface SystemDesignInterviewProps {
  sendContextualUpdate?: (message: string) => void;
}

const SystemDesignInterview: React.FC<SystemDesignInterviewProps> = ({ sendContextualUpdate }) => {
  return (
    <ReactFlowProvider>
      <Canvas sendContextualUpdate={sendContextualUpdate} />
    </ReactFlowProvider>
  );
};

export default SystemDesignInterview;
