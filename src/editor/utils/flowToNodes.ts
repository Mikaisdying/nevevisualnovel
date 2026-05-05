import * as dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import { Scene } from '@/types/scene';
import { buildGraphModel, GraphNode, GraphEdge } from './buildGraphModel';

export type FlowResult = {
  nodes: Node[];
  edges: Edge[];
  nodeIdMap: Map<string, string>;
};

export function flowToNodes(scenes: Scene[]): FlowResult {
  const { nodes: graphNodes, edges: graphEdges, nodeIdMap } = buildGraphModel(scenes);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'LR' });

  graphNodes.forEach((n: GraphNode) => {
    nodes.push({
      id: n.id,
      type: 'note',
      dragHandle: '.drag-handle',
      data: {
        scenes: n.scenes,
        nodeIdMap,
      },
      position: { x: 0, y: 0 },
    });

    graph.setNode(n.id, { width: 450, height: 180 });
  });

  graphEdges.forEach((e: GraphEdge, i: number) => {
    edges.push({
      id: `${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
    });

    graph.setEdge(e.source, e.target);
  });

  dagre.layout(graph);

  nodes.forEach((node) => {
    const pos = graph.node(node.id);
    node.position = {
      x: pos.x - 150,
      y: pos.y - 90,
    };
  });

  return {
    nodes,
    edges,
    nodeIdMap,
  };
}
