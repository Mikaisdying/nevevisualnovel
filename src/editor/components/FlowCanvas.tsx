import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function FlowCanvas() {
  const nodes = [
    {
      id: '1',
      position: { x: 250, y: 100 },
      data: { label: 'Hello, React Flow!' },
      type: 'default',
    },
  ];
  const edges: never[] = [];

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
