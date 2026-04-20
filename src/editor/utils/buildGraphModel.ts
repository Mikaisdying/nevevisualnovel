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

export function buildGraphModel(scenes: Scene[]) {
  const sceneMap = new Map(scenes.map((s) => [s.id, s]));

  const edges: {
    from: string;
    to: string;
    isAuto: boolean; // true nếu là auto-next (text null)
  }[] = [];

  const incoming = new Map<string, string[]>();

  // 🔥 build graph
  scenes.forEach((s) => {
    // legacy / linear next: nếu scene không có choices thì dùng next như auto-next
    const legacyNext = (s as any).next as string | undefined;
    if (legacyNext && (!s.choices || s.choices.length === 0)) {
      edges.push({
        from: s.id,
        to: legacyNext,
        isAuto: true,
      });

      if (!incoming.has(legacyNext)) incoming.set(legacyNext, []);
      incoming.get(legacyNext)!.push(s.id);
    }

    s.choices?.forEach((c) => {
      const isAuto = c.text === null;

      edges.push({
        from: s.id,
        to: c.next,
        isAuto,
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

  function hasNonAutoIncomingChoice(id: string) {
    return edges.some((e) => !e.isAuto && e.to === id);
  }
  // =========================
  // 3. BUILD GROUPS
  // =========================
  for (const scene of scenes) {
    if (visited.has(scene.id)) continue;

    let current = scene;
    const group: Scene[] = [current];
    visited.add(current.id);

    while (true) {
      const autoEdge = edges.find((e) => e.from === current.id && e.isAuto);
      if (!autoEdge) break;

      const next = sceneMap.get(autoEdge.to);
      if (!next) break;

      const isMergePoint = (incoming.get(next.id)?.length || 0) > 1;

      const valid =
        !visited.has(next.id) &&
        isSameContext(current, next) &&
        !isMergePoint &&
        !hasNonAutoIncomingChoice(next.id); // không merge khi là đích của choice có label

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

    // vẽ cạnh cho legacy next khi không có choices
    const legacyNext = (s as any).next as string | undefined;
    if (legacyNext && (!s.choices || s.choices.length === 0)) {
      const target = nodeIdMap.get(legacyNext);
      if (target && target !== source) {
        graphEdges.push({
          source,
          target,
        });
      }
    }

    s.choices?.forEach((c) => {
      const target = nodeIdMap.get(c.next);
      if (!target || source === target) return;

      const isAuto = c.text === null;
      graphEdges.push({
        source,
        target,
        label: isAuto ? undefined : (c.text ?? undefined),
      });
    });
  });

  return {
    nodes: graphNodes,
    edges: graphEdges,
    nodeIdMap,
  };
}
