import React from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MiniMap } from '@xyflow/react';

import { flowToNodes } from '../utils/flowToNodes';
import { mockScenes } from '../mockScenes';
import type { Scene } from '@/types/scene';
import { SceneNoteNode } from './SceneNoteNode';

export default function FlowCanvas() {
  const [scenes, setScenes] = React.useState<Scene[]>(mockScenes);

  const { nodes: initialNodes, edges: initialEdges } = React.useMemo(
    () => flowToNodes(scenes),
    [scenes],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    const { nodes, edges } = flowToNodes(scenes);
    setNodes(nodes);
    setEdges(edges);
  }, [scenes, setNodes, setEdges]);

  const handleInsertScene = React.useCallback(
    (groupScenes: Scene[], index: number, newScene: Scene) => {
      setScenes((prev) => {
        if (!groupScenes.length) return prev;

        const current = groupScenes[index];
        const next = groupScenes[index + 1];

        const currentIndex = prev.findIndex((s) => s.id === current.id);
        if (currentIndex === -1) return prev;

        const newSceneWithFlow: Scene = { ...newScene };

        const currentGlobal = prev[currentIndex];
        let updatedCurrent: Scene = {
          ...currentGlobal,
          choices: currentGlobal.choices ? currentGlobal.choices.map((c) => ({ ...c })) : undefined,
        };

        if (updatedCurrent.next) {
          newSceneWithFlow.next = updatedCurrent.next;
          updatedCurrent = {
            ...updatedCurrent,
            next: newSceneWithFlow.id,
          };
        }

        if (updatedCurrent.choices && updatedCurrent.choices.length > 0) {
          updatedCurrent = {
            ...updatedCurrent,
            choices: updatedCurrent.choices.map((c) => ({
              ...c,
              next: newSceneWithFlow.id,
            })),
          };

          if (next) {
            newSceneWithFlow.next = next.id;
          }
        }

        const newList = [...prev];
        newList[currentIndex] = updatedCurrent;
        newList.splice(currentIndex + 1, 0, newSceneWithFlow);

        return newList;
      });
    },
    [],
  );

  const nodeTypes = React.useMemo(
    () => ({
      note: (props: any) => (
        <SceneNoteNode
          {...props}
          onInsertScene={(index, newScene) => handleInsertScene(props.data.scenes, index, newScene)}
        />
      ),
      groupNode: (props: any) => (
        <SceneNoteNode
          {...props}
          onInsertScene={(index, newScene) => handleInsertScene(props.data.scenes, index, newScene)}
        />
      ),
    }),
    [handleInsertScene],
  );

  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_45%,#e2e8f0_100%)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onNodesChange={onNodesChange}
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
      >
        <Background variant={BackgroundVariant.Lines} color="#e2e8f0" gap={24} />
        <Controls />
        <MiniMap position="bottom-right" pannable zoomable nodeStrokeWidth={3} />
      </ReactFlow>
    </div>
  );
}
