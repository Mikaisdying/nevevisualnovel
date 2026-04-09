import { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Manifest } from '@/types/manifest';

export function useEditorStore() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);

  return {
    nodes,
    setNodes,
    edges,
    setEdges,
    selectedNode,
    setSelectedNode,
    manifest,
    setManifest,
  };
}
