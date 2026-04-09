import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import React from 'react';

export default function FlowCanvas({ nodes, edges, setNodes, setEdges, onSelectNode }: any) {
  const [rfNodes, , onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  const onConnect = (connection: any) => {
    setRfEdges((eds) => addEdge(connection, eds));
  };

  const onNodeClick = (_: any, node: any) => {
    onSelectNode(node);
  };

  React.useEffect(() => setNodes(rfNodes), [rfNodes]);
  React.useEffect(() => setEdges(rfEdges), [rfEdges]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
