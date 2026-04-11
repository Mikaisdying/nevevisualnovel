import { Scene } from '@/types/scene';

export type GraphNode = {
  id: string;
  scenes: Scene[];
};

export type GraphEdge = {
  source: string;
  target: string;
  label?: string;
};

type EdgeType = 'next' | 'choice';

export function buildGraphModel(scenes: Scene[]) {
  const sceneMap = new Map(scenes.map((s) => [s.id, s]));

  const edges: {
    from: string;
    to: string;
    type: EdgeType;
  }[] = [];

  const incoming = new Map<string, string[]>();

  // 🔥 build graph
  scenes.forEach((s) => {
    if (s.next) {
      edges.push({
        from: s.id,
        to: s.next,
        type: 'next',
      });

      if (!incoming.has(s.next)) incoming.set(s.next, []);
      incoming.get(s.next)!.push(s.id);
    }

    s.choices?.forEach((c) => {
      edges.push({
        from: s.id,
        to: c.next,
        type: 'choice',
      });

      if (!incoming.has(c.next)) incoming.set(c.next, []);
      incoming.get(c.next)!.push(s.id);
    });
  });

  const visited = new Set<string>();
  const nodeIdMap = new Map<string, string>();
  const graphNodes: GraphNode[] = [];

  let groupIndex = 0;

  function isSameContext(a: Scene, b: Scene) {
    return a.bg === b.bg && JSON.stringify(a.char) === JSON.stringify(b.char);
  }

  function isChoiceTarget(id: string) {
    return edges.some((e) => e.type === 'choice' && e.to === id);
  }
  // =========================
  // 3. BUILD GROUPS
  // =========================
  for (const scene of scenes) {
    if (visited.has(scene.id)) continue;

    let current = scene;
    const group: Scene[] = [current];
    visited.add(current.id);

    while (current.next && !current.choices?.length) {
      const next = sceneMap.get(current.next);
      if (!next) break;

      const isMergePoint = (incoming.get(next.id)?.length || 0) > 1;

      const valid =
        !visited.has(next.id) &&
        isSameContext(current, next) &&
        !isMergePoint &&
        !isChoiceTarget(next.id); // 🔥 FIX QUAN TRỌNG NHẤT

      if (!valid) break;

      group.push(next);
      visited.add(next.id);
      current = next;
    }

    const nodeId = group.length === 1 ? scene.id : `group-${groupIndex++}`;

    graphNodes.push({
      id: nodeId,
      scenes: group,
    });

    group.forEach((s) => {
      nodeIdMap.set(s.id, nodeId);
    });
  }

  // =========================
  // 4. BUILD FINAL EDGES
  // =========================
  const graphEdges: GraphEdge[] = [];

  scenes.forEach((s) => {
    const source = nodeIdMap.get(s.id);
    if (!source) return;

    if (s.next) {
      const target = nodeIdMap.get(s.next);
      if (target && source !== target) {
        graphEdges.push({
          source,
          target,
        });
      }
    }

    s.choices?.forEach((c) => {
      const target = nodeIdMap.get(c.next);
      if (target && source !== target) {
        graphEdges.push({
          source,
          target,
          label: c.text,
        });
      }
    });
  });

  return {
    nodes: graphNodes,
    edges: graphEdges,
    nodeIdMap,
  };
}
