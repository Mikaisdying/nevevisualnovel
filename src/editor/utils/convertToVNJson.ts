import { Edge, Node } from '@xyflow/react';

export function convertToVNJson(nodes: Node[], edges: Edge[]) {
  const edgeMap = new Map<string, string>();

  edges.forEach((e) => {
    edgeMap.set(e.source, e.target);
  });

  return nodes.map((node) => ({
    id: node.id,
    bg: node.data.bg,
    characters: node.data.characters,
    text: node.data.text,
    next: edgeMap.get(node.id) || null,
  }));
}
