import React from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MiniMap } from '@xyflow/react';

import { flowToNodes } from '../utils/flowToNodes';
import { loadStoryline } from '../api/story.api';
import type { Scene } from '@/types/scene';
import { SceneNoteNode } from './SceneNode';

export interface FlowCanvasProps {
  onSceneSelect: (scene: Scene | null) => void;
}

export default function FlowCanvas({ onSceneSelect }: FlowCanvasProps) {
  const [scenes, setScenes] = React.useState<Scene[]>([]);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadStoryline();
        setScenes(data);
      } catch (error) {
        console.error('Failed to load storyline:', error);
      }
    };
    loadData();
  }, []);

  const { nodes: initialNodes, edges: initialEdges } = React.useMemo(
    () => flowToNodes(scenes),
    [scenes],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    const { nodes, edges } = flowToNodes(scenes);
    const styledNodes = nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        boxShadow: 'none',
      },
    }));
    setNodes(styledNodes);
    setEdges(edges);
  }, [scenes, setNodes, setEdges]);

  React.useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
        style: {
          ...node.style,
          border: node.id === selectedNodeId ? '3px solid #5e86c5' : 'none',
          borderRadius: 12,
        },
      })),
    );
  }, [selectedNodeId, setNodes]);

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
          onSceneClick={(scene: Scene) => {
            setSelectedNodeId(props.id);
            onSceneSelect(scene);
          }}
        />
      ),
      groupNode: (props: any) => (
        <SceneNoteNode
          {...props}
          onInsertScene={(index, newScene) => handleInsertScene(props.data.scenes, index, newScene)}
          onSceneClick={(scene: Scene) => {
            setSelectedNodeId(props.id);
            onSceneSelect(scene);
          }}
        />
      ),
    }),
    [handleInsertScene, onSceneSelect],
  );

  const handleSelectionChange = React.useCallback((params: any) => {
    const selectedNodes = params.nodes;
    if (selectedNodes.length > 0) {
      setSelectedNodeId(selectedNodes[0].id);
    } else {
      setSelectedNodeId(null);
    }
  }, []);

  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_45%,#e2e8f0_100%)]">
      <ReactFlow
        nodes={nodes}
        edges={edges.map((edge) => ({
          ...edge,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#64748b',
          },
          style: {
            ...(edge.style || {}),
            stroke: '#64748b',
            strokeWidth: 2,
          },
        }))}
        nodeTypes={nodeTypes}
        fitView
        onNodesChange={onNodesChange}
        onSelectionChange={handleSelectionChange}
        onPaneClick={() => {
          setSelectedNodeId(null);
          onSceneSelect(null);
        }}
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
      >
        <svg style={{ display: 'none' }}>
          <defs>
            <marker
              id="arrowVN"
              markerWidth="13"
              markerHeight="13"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
            </marker>
          </defs>
        </svg>
        <Background variant={BackgroundVariant.Dots} gap={24} />
        <Controls />
        <MiniMap position="bottom-right" pannable zoomable nodeStrokeWidth={3} />
      </ReactFlow>
    </div>
  );
}
