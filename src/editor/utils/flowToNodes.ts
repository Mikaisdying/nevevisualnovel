import * as dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import { Scene } from '@/types/scene';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 180;

export function flowToNodes(scenes: Scene[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'TB' });

  // 🔥 group by same structure (ignore text)
  const groupMap = new Map<string, Scene[]>();

  for (const scene of scenes) {
    const key = JSON.stringify({
      bg: scene.bg,
      char: scene.char,
      choices: scene.choices?.length || 0,
    });

    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(scene);
  }

  for (const [, group] of groupMap) {
    group.forEach((scene) => {
      graph.setNode(scene.id, { width: NODE_WIDTH, height: NODE_HEIGHT });

      nodes.push({
        id: scene.id,
        type: 'note',
        data: { scene },
        position: { x: 0, y: 0 },
      });

      if (scene.next) {
        edges.push({
          id: `${scene.id}-${scene.next}`,
          source: scene.id,
          target: scene.next,
        });

        graph.setEdge(scene.id, scene.next);
      }

      scene.choices?.forEach((c) => {
        edges.push({
          id: `${scene.id}-${c.next}`,
          source: scene.id,
          target: c.next,
          label: c.text,
        });

        graph.setEdge(scene.id, c.next);
      });
    });
  }

  dagre.layout(graph);

  nodes.forEach((node) => {
    const pos = graph.node(node.id);
    node.position = {
      x: pos.x - NODE_WIDTH / 2,
      y: pos.y - NODE_HEIGHT / 2,
    };
  });

  return { nodes, edges };
}
