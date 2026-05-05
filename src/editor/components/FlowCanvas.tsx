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
import { loadStoryline, saveStoryline } from '../api/story.api';
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

  const createSceneId = React.useCallback(() => {
    const maxId = scenes.reduce((max, scene) => {
      const numericId = Number.parseInt(scene.id, 10);
      if (Number.isNaN(numericId)) return max;
      return Math.max(max, numericId);
    }, 0);

    return String(maxId + 1);
  }, [scenes]);

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

  const getNodeScenesById = React.useCallback(
    (nodeId: string) => {
      const node = nodes.find((item) => item.id === nodeId);
      return ((node?.data as { scenes?: Scene[] } | undefined)?.scenes ?? []) as Scene[];
    },
    [nodes],
  );

  const handleInsertScene = React.useCallback(
    (groupScenes: Scene[], index: number, newScene: Scene) => {
      const stripLegacyNext = <T extends Scene>(scene: T) => {
        const nextScene = { ...scene } as T & { next?: string };
        delete nextScene.next;
        return nextScene;
      };

      const nextScenes = [...scenes];

      if (!groupScenes.length) return;

      const current = groupScenes[index];
      const currentIndex = nextScenes.findIndex((s) => s.id === current.id);
      if (currentIndex === -1) return;

      const currentGlobal = nextScenes[currentIndex];
      const legacyNext = (currentGlobal as Scene & { next?: string }).next;

      const existingChoices = currentGlobal.choices ? [...currentGlobal.choices] : [];
      const autoChoices = existingChoices.filter((c) => c.text === null);
      const displayChoices = existingChoices.filter((c) => c.text !== null);

      const newSceneWithFlow: Scene = { ...newScene, choices: newScene.choices ?? [] };
      const updatedCurrentBase = {
        ...currentGlobal,
      };

      if (displayChoices.length === 0 && (autoChoices.length === 1 || legacyNext)) {
        const oldTarget = autoChoices[0]?.next ?? legacyNext;

        nextScenes[currentIndex] = stripLegacyNext({
          ...updatedCurrentBase,
          choices: [
            {
              text: null,
              next: newSceneWithFlow.id,
            },
          ],
        });

        newSceneWithFlow.choices = oldTarget
          ? [
              {
                text: null,
                next: oldTarget,
              },
            ]
          : [];

        nextScenes.splice(currentIndex + 1, 0, newSceneWithFlow);
        setScenes(nextScenes);
        void saveStoryline(nextScenes).catch((error) => {
          console.error('Failed to save storyline after insert:', error);
        });
        return;
      }

      if (displayChoices.length > 0) {
        nextScenes[currentIndex] = stripLegacyNext({
          ...updatedCurrentBase,
          choices: displayChoices.map((c) => ({
            ...c,
            next: newSceneWithFlow.id,
          })),
        });

        nextScenes.splice(currentIndex + 1, 0, newSceneWithFlow);
        setScenes(nextScenes);
        void saveStoryline(nextScenes).catch((error) => {
          console.error('Failed to save storyline after insert:', error);
        });
        return;
      }

      nextScenes[currentIndex] = stripLegacyNext({
        ...updatedCurrentBase,
        choices: [
          {
            text: null,
            next: newSceneWithFlow.id,
          },
        ],
      });

      nextScenes.splice(currentIndex + 1, 0, newSceneWithFlow);
      setScenes(nextScenes);
      void saveStoryline(nextScenes).catch((error) => {
        console.error('Failed to save storyline after insert:', error);
      });
    },
    [scenes],
  );

  const handleDeleteNode = React.useCallback(
    (groupScenes: Scene[]) => {
      if (!groupScenes.length) return;

      const deletedIds = new Set(groupScenes.map((scene) => scene.id));
      const lastScene = groupScenes[groupScenes.length - 1];
      const lastLegacyNext = (lastScene as Scene & { next?: string }).next;
      const outgoingTargets = Array.from(
        new Set(
          [
            ...(lastScene.choices?.map((choice) => choice.next).filter(Boolean) ?? []),
            lastLegacyNext,
          ].filter(Boolean) as string[],
        ),
      );
      const bridgeTarget = outgoingTargets[0];

      setScenes((prev) => {
        const remainingScenes = prev.filter((scene) => !deletedIds.has(scene.id));

        const nextScenes = remainingScenes.map((scene) => {
          const legacyNext = (scene as Scene & { next?: string }).next;
          let updatedScene = scene;
          let changed = false;

          if (legacyNext && deletedIds.has(legacyNext)) {
            if (!bridgeTarget) {
              const nextScene = { ...updatedScene } as Scene & { next?: string };
              delete nextScene.next;
              updatedScene = nextScene;
              changed = true;
            } else {
              const nextScene = {
                ...updatedScene,
                choices: [{ text: null, next: bridgeTarget }],
              } as Scene & {
                next?: string;
              };
              delete nextScene.next;
              updatedScene = nextScene;
              changed = true;
            }
          }

          if (updatedScene.choices?.some((choice) => deletedIds.has(choice.next))) {
            const nextChoices = updatedScene.choices.flatMap((choice) => {
              if (!deletedIds.has(choice.next)) return [choice];
              if (!bridgeTarget) return [];
              return [{ ...choice, next: bridgeTarget }];
            });

            updatedScene = {
              ...updatedScene,
              choices: nextChoices,
            };
            changed = true;
          }

          return changed ? updatedScene : scene;
        });

        void saveStoryline(nextScenes).catch((error) => {
          console.error('Failed to save storyline after delete:', error);
        });

        return nextScenes;
      });

      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      onSceneSelect(null);
    },
    [onSceneSelect],
  );

  const nodeTypes = React.useMemo(
    () => ({
      note: (props: any) => (
        <SceneNoteNode
          {...props}
          onInsertScene={(index, newScene) => handleInsertScene(props.data.scenes, index, newScene)}
          onDeleteNode={(nodeScenes) => handleDeleteNode(nodeScenes)}
          createSceneId={createSceneId}
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
          onDeleteNode={(nodeScenes) => handleDeleteNode(nodeScenes)}
          createSceneId={createSceneId}
          onSceneClick={(scene: Scene) => {
            setSelectedNodeId(props.id);
            onSceneSelect(scene);
          }}
        />
      ),
    }),
    [createSceneId, handleDeleteNode, handleInsertScene, onSceneSelect],
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

  const handleDeleteEdge = React.useCallback(
    (sourceId: string, targetId: string) => {
      const sourceScenes = getNodeScenesById(sourceId);
      const targetScenes = getNodeScenesById(targetId);

      if (!sourceScenes.length || !targetScenes.length) return;

      const sourceScene = sourceScenes[sourceScenes.length - 1];
      const targetSceneIds = new Set(targetScenes.map((scene) => scene.id));

      setScenes((prev) => {
        const nextScenes = prev.map((scene) => {
          if (scene.id !== sourceScene.id) return scene;

          let updatedScene = scene;
          let changed = false;

          const legacyNext = (scene as Scene & { next?: string }).next;
          if (legacyNext && targetSceneIds.has(legacyNext)) {
            const nextScene = { ...updatedScene } as Scene & { next?: string };
            delete nextScene.next;
            updatedScene = nextScene;
            changed = true;
          }

          if (updatedScene.choices?.some((choice) => targetSceneIds.has(choice.next))) {
            const nextChoices = updatedScene.choices.filter(
              (choice) => !targetSceneIds.has(choice.next),
            );
            updatedScene = {
              ...updatedScene,
              choices: nextChoices.length ? nextChoices : undefined,
            };
            changed = true;
          }

          return changed ? updatedScene : scene;
        });

        void saveStoryline(nextScenes).catch((error) => {
          console.error('Failed to save storyline after delete edge:', error);
        });

        return nextScenes;
      });
      setSelectedEdgeId(null);
    },
    [getNodeScenesById],
  );

  // Xử lý tạo choice mới khi kéo nối giữa các node
  const handleConnect = React.useCallback(
    (params: any) => {
      const { source, target } = params;
      if (!source || !target || source === target) return;

      const sourceScenes = getNodeScenesById(source);
      const targetScenes = getNodeScenesById(target);

      if (!sourceScenes.length || !targetScenes.length) return;

      const sourceScene = sourceScenes[sourceScenes.length - 1];
      const targetScene = targetScenes[0];

      setScenes((prev) => {
        const nextScenes = prev.map((scene) => {
          if (scene.id !== sourceScene.id) return scene;

          const isLinearNode = !scene.choices || scene.choices.length === 0;
          if (isLinearNode) {
            return {
              ...scene,
              next: targetScene.id,
            } as Scene & { next?: string };
          }

          if (scene.choices?.some((choice) => choice.next === targetScene.id)) return scene;

          return {
            ...scene,
            choices: [...(scene.choices ?? []), { text: '', next: targetScene.id }],
          };
        });

        void saveStoryline(nextScenes).catch((error) => {
          console.error('Failed to save storyline after connect:', error);
        });

        return nextScenes;
      });
    },
    [getNodeScenesById],
  );

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
