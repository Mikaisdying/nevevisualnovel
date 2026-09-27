import * as dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import { Scene } from '@/types/scene';
import { buildGraphModel, GraphNode, GraphEdge } from './buildGraphModel';

export type XY = { x: number; y: number };

export type FlowResult = {
  nodes: Node[];
  edges: Edge[];
  nodeIdMap: Map<string, string>;
};

/** Kích thước ước lượng của một card, dùng để tránh đặt card mới đè lên card cũ. */
const CARD_W = 300;
const CARD_H = 220;
const GAP_X = 80;
const GAP_Y = 40;

function overlaps(a: XY, b: XY) {
  return Math.abs(a.x - b.x) < CARD_W + 20 && Math.abs(a.y - b.y) < CARD_H;
}

/**
 * Dựng node/edge cho React Flow. Vị trí card ưu tiên:
 * 1. `saved` (vị trí đã có / đã kéo tay) — card không nhảy khi graph đổi;
 * 2. card mới có card nguồn đã có vị trí → đặt ngay bên phải card nguồn, dịch xuống nếu đè;
 * 3. còn lại dùng auto-layout dagre.
 */
export function flowToNodes(scenes: Scene[], saved: Record<string, XY> = {}): FlowResult {
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

  const resolved = new Map<string, XY>();
  nodes.forEach((node) => {
    if (saved[node.id]) resolved.set(node.id, saved[node.id]);
  });

  nodes.forEach((node) => {
    if (resolved.has(node.id)) return;

    const sourceId = graphEdges.find((e) => e.target === node.id && resolved.has(e.source))?.source;
    let pos: XY;
    if (sourceId) {
      const src = resolved.get(sourceId)!;
      pos = { x: src.x + CARD_W + GAP_X, y: src.y };
      while ([...resolved.values()].some((p) => overlaps(p, pos))) pos = { ...pos, y: pos.y + CARD_H + GAP_Y };
    } else {
      const d = graph.node(node.id);
      pos = { x: d.x - 150, y: d.y - 90 };
    }
    resolved.set(node.id, pos);
  });

  nodes.forEach((node) => {
    node.position = resolved.get(node.id)!;
  });

  return {
    nodes,
    edges,
    nodeIdMap,
  };
}
