import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { Canvas } from "@/features/system-design/components/Canvas";

const SystemDesignInterview: React.FC = () => {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
};

export default SystemDesignInterview;
