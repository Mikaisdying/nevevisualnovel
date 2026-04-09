import { Node, Edge } from '@xyflow/react';
import { Scene } from '@/types/scene';

export function flowToNodes(scenes: Scene[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  scenes.forEach((scene, index) => {
    nodes.push({
      id: scene.id,
      position: { x: index * 250, y: 100 },
      data: {
        bg: scene.bg,
        char: scene.char,
        textbox: scene.textbox,
      },
    });

    if (scene.next) {
      edges.push({
        id: `${scene.id}-${scene.next}`,
        source: scene.id,
        target: scene.next,
      });
    }
  });

  return { nodes, edges };
}
