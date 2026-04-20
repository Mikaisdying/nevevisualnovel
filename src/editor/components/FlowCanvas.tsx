import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  EdgeToolbar,
  getBezierPath,
  type EdgeProps,
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

type ChoiceEdgeProps = EdgeProps & {
  onDeleteEdge: (sourceId: string, targetId: string) => void;
};

function ChoiceEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  style,
  selected,
  label,
  onDeleteEdge,
  source,
  target,
}: ChoiceEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {label !== null && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: 'white',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: 12,
              border: '1px solid #e2e8f0',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        )}
      </EdgeLabelRenderer>
      <EdgeToolbar edgeId={id} x={labelX} y={labelY} isVisible={selected}>
        <button
          type="button"
          style={{
            border: '1px solid #ef4444',
            color: '#ef4444',
            borderRadius: '50%',
            width: 20,
            height: 20,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            lineHeight: 1,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteEdge(source, target);
          }}
          title="Xóa mối nối"
        >
          ✕
        </button>
      </EdgeToolbar>
    </>
  );
}

export interface FlowCanvasProps {
  onSceneSelect: (scene: Scene | null) => void;
  storyVersion: number;
}

export default function FlowCanvas({ onSceneSelect, storyVersion }: FlowCanvasProps) {
  const [scenes, setScenes] = React.useState<Scene[]>([]);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = React.useState<string | null>(null);

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
  }, [storyVersion]);

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

        const currentIndex = prev.findIndex((s) => s.id === current.id);
        if (currentIndex === -1) return prev;

        const currentGlobal = prev[currentIndex];

        // copy choices hiện tại
        const existingChoices = currentGlobal.choices ? [...currentGlobal.choices] : [];

        // tách choice auto (text null) và choice hiển thị
        const autoChoices = existingChoices.filter((c) => c.text === null);
        const displayChoices = existingChoices.filter((c) => c.text !== null);

        const newSceneWithFlow: Scene = { ...newScene, choices: newScene.choices ?? [] };

        // Nếu hiện đang là chuỗi auto-next (1 auto choice) thì chèn newScene vào giữa:
        // current --auto--> oldTarget  =>  current --auto--> newScene --auto--> oldTarget
        if (autoChoices.length === 1 && displayChoices.length === 0) {
          const oldTarget = autoChoices[0].next;

          const updatedCurrent: Scene = {
            ...currentGlobal,
            choices: [
              {
                text: null,
                next: newSceneWithFlow.id,
              },
            ],
          };

          newSceneWithFlow.choices = [
            {
              text: null,
              next: oldTarget,
            },
          ];

          const newList = [...prev];
          newList[currentIndex] = updatedCurrent;
          newList.splice(currentIndex + 1, 0, newSceneWithFlow);
          return newList;
        }

        // Nếu đang có các choice hiển thị, coi việc chèn scene như chia nhánh:
        // tất cả choice từ current trỏ sang newScene
        if (displayChoices.length > 0) {
          const updatedCurrent: Scene = {
            ...currentGlobal,
            choices: displayChoices.map((c) => ({
              ...c,
              next: newSceneWithFlow.id,
            })),
          };

          const newList = [...prev];
          newList[currentIndex] = updatedCurrent;
          newList.splice(currentIndex + 1, 0, newSceneWithFlow);
          return newList;
        }

        // Nếu không có choice nào, tạo một auto-next từ current sang newScene
        const updatedCurrent: Scene = {
          ...currentGlobal,
          choices: [
            {
              text: null,
              next: newSceneWithFlow.id,
            },
          ],
        };

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

  // Xử lý click vào edge
  const handleEdgeClick = (_: any, edge: any) => {
    if (selectedEdgeId === edge.id) {
      handleDeleteEdge(edge.source, edge.target);
    } else {
      setSelectedEdgeId(edge.id);
    }
  };

  const handleDeleteEdge = React.useCallback((sourceId: string, targetId: string) => {
    setScenes((prev) =>
      prev.map((scene) => {
        if (scene.id !== sourceId || !scene.choices) return scene;
        return {
          ...scene,
          choices: scene.choices.filter((choice) => choice.next !== targetId),
        };
      }),
    );
    setSelectedEdgeId(null);
  }, []);

  // Xử lý tạo choice mới khi kéo nối giữa các node
  const handleConnect = (params: any) => {
    const { source, target } = params;
    if (!source || !target || source === target) return;
    setScenes((prev) => {
      return prev.map((scene) => {
        if (scene.id !== source) return scene;
        // Tránh tạo choice trùng
        if (scene.choices?.some((c) => c.next === target)) return scene;
        return {
          ...scene,
          choices: [...(scene.choices ?? []), { text: '', next: target }],
        };
      });
    });
  };

  // Derive edges with style/label before render
  const computedEdges = React.useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: 'choice',
        selected: selectedEdgeId === edge.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: selectedEdgeId === edge.id ? '#ef4444' : '#94a3b8',
        },
        style: {
          ...(edge.style || {}),
          stroke: selectedEdgeId === edge.id ? '#ef4444' : '#94a3b8',
          strokeWidth: selectedEdgeId === edge.id ? 3 : 2,
          opacity: selectedEdgeId === edge.id ? 1 : 0.7,
        },
      })),
    [edges, selectedEdgeId],
  );

  const edgeTypes = React.useMemo(
    () => ({
      choice: (props: EdgeProps) => <ChoiceEdge {...props} onDeleteEdge={handleDeleteEdge} />,
    }),
    [handleDeleteEdge],
  );

  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_45%,#e2e8f0_100%)]">
      <ReactFlow
        nodes={nodes}
        edges={computedEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        onNodesChange={onNodesChange}
        onSelectionChange={handleSelectionChange}
        onPaneClick={() => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
          onSceneSelect(null);
        }}
        onEdgeClick={handleEdgeClick}
        onConnect={handleConnect}
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
