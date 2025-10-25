import { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Edge,
  type Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import DnsIcon from '@mui/icons-material/Dns';
import ApiIcon from '@mui/icons-material/Api';
import CachedIcon from '@mui/icons-material/Cached';

const componentTypes = [
  { type: 'api-gateway', label: 'API Gateway', icon: <ApiIcon />, shape: 'diamond' },
  { type: 'database', label: 'Database', icon: <StorageIcon />, shape: 'cylinder' },
  { type: 'service', label: 'Service', icon: <DnsIcon />, shape: 'square' },
  { type: 'object-storage', label: 'Object Storage', icon: <CloudQueueIcon />, shape: 'cylinder' },
  { type: 'cdn', label: 'CDN', icon: <CloudQueueIcon />, shape: 'square' },
  { type: 'queue', label: 'Queue', icon: <CachedIcon />, shape: 'sideways-cylinder' },
  { type: 'cache', label: 'Cache', icon: <CachedIcon />, shape: 'square' },
];

interface SystemDesignCanvasProps {
  onSaveSnapshot?: (nodes: Node[], edges: Edge[]) => void;
}

export default function SystemDesignCanvas({ onSaveSnapshot }: SystemDesignCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(0);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addComponent = (componentType: string, label: string) => {
    const newNode: Node = {
      id: `${componentType}-${nodeIdCounter}`,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption">{label}</Typography>
          </Box>
        ),
      },
      style: {
        background: '#fff',
        border: '2px solid #1976d2',
        borderRadius: componentType === 'service' || componentType === 'cdn' || componentType === 'cache' ? '8px' : '50%',
        padding: 10,
        width: componentType.includes('cylinder') ? 100 : 120,
        height: componentType.includes('cylinder') ? 60 : 80,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter(nodeIdCounter + 1);
  };

  const handleSaveSnapshot = () => {
    if (onSaveSnapshot) {
      onSaveSnapshot(nodes, edges);
    }
    alert('Snapshot saved!');
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          System Design Components
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {componentTypes.map((comp) => (
            <Button
              key={comp.type}
              variant="outlined"
              startIcon={comp.icon}
              onClick={() => addComponent(comp.type, comp.label)}
              sx={{ mb: 1 }}
            >
              {comp.label}
            </Button>
          ))}
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleSaveSnapshot}>
            Save Snapshot
          </Button>
          <Button variant="outlined" color="error" onClick={handleClear}>
            Clear Canvas
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ flexGrow: 1, height: 'calc(100vh - 250px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </Paper>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Instructions:</strong> Click component buttons to add them to the canvas. Drag components to position them. 
          Click and drag from a component's edge to create connections. Save snapshots throughout your design process.
        </Typography>
      </Paper>
    </Box>
  );
}
