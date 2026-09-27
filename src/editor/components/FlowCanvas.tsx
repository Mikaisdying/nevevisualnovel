import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  ControlButton,
  EdgeToolbar,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  type OnConnectEnd,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { message } from 'antd';

import { MiniMap } from '@xyflow/react';

import { flowToNodes, type XY } from '../utils/flowToNodes';
import { loadStoryline, saveStoryline } from '../api/story.api';
import type { Scene } from '@/types/scene';
import { setLocalized, type LocalizedText } from '@/i18n/localize';
import { SceneNoteNode, type SceneNoteNodeProps } from './SceneNode';
import { AddSceneModal, formFromScene, sceneFromForm, type SceneFormState } from './AddSceneModal';
import { ChoiceLinkModal, type ChoiceLinkRequest, type ChoiceLinkText } from './ChoiceLinkModal';
import { EditorActionsContext, useEditorActions, type EditorActions } from '../editorActions';
import { EDITOR_SECONDARY, withEditorText } from '../editorLanguage';
import '../editor.css';

// ---------------------------------------------------------------------------
// Vị trí card: nhớ trong phiên + localStorage (không ghi vào file dữ liệu).
// ---------------------------------------------------------------------------
const LAYOUT_KEY = 'neve-editor-layout';
const HISTORY_LIMIT = 50;

function readLayout(): Record<string, XY> {
  try {
    return JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLayout(layout: Record<string, XY>) {
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  } catch {
    // localStorage không khả dụng → chỉ nhớ trong phiên.
  }
}

// ---------------------------------------------------------------------------
// Sửa dữ liệu storyline (thuần, không side effect) — dùng chung cho kéo nối.
// ---------------------------------------------------------------------------
type SceneWithNext = Scene & { next?: string };

/**
 * Nối scene `fromId` tới `toId`.
 * - `text` có chữ → lựa chọn (bấm vào sang toId); thay nối tiếp cũ nếu có, cập nhật chữ nếu đã có lựa chọn tới toId.
 * - `text` null → nối tiếp (thoại liên tục), thay đích nối tiếp cũ.
 * Bản tiếng Anh để trống thì giữ nguyên bản cũ (nếu có).
 */
function linkScenes(
  scenes: Scene[],
  fromId: string,
  toId: string,
  text: ChoiceLinkText | null,
): Scene[] {
  const withText = (prev: LocalizedText | null) => {
    const vi = withEditorText(prev, text!.vi);
    return text!.en ? setLocalized(vi, EDITOR_SECONDARY, text!.en) : vi;
  };
  return scenes.map((scene) => {
    if (scene.id !== fromId) return scene;
    let linked: SceneWithNext;
    if (text === null) {
      linked = { ...scene, choices: [{ text: null, next: toId }] };
    } else {
      const displayChoices = scene.choices?.filter((c) => c.text !== null) ?? [];
      linked = {
        ...scene,
        choices: displayChoices.some((c) => c.next === toId)
          ? displayChoices.map((c) => (c.next === toId ? { ...c, text: withText(c.text) } : c))
          : [...displayChoices, { text: withText(null), next: toId }],
      };
    }
    delete linked.next;
    return linked;
  });
}

/** Thông tin scene nguồn cho modal Lựa chọn. */
function linkRequest(from: Scene, toId: string): ChoiceLinkRequest {
  const existingChoices = from.choices?.filter((c) => c.text !== null).length ?? 0;
  const currentAutoTarget =
    existingChoices === 0
      ? (from.choices?.find((c) => c.text === null)?.next ?? (from as SceneWithNext).next)
      : undefined;
  return { fromId: from.id, toId, existingChoices, currentAutoTarget };
}

// ---------------------------------------------------------------------------
// Connector: sáng lên khi hover, nút ✕ hiện ngay tại giữa đường nối.
// ---------------------------------------------------------------------------
type ChoiceEdgeData = { hovered?: boolean };

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
  data,
}: EdgeProps) {
  const { deleteEdge, setEdgeHover } = useEditorActions();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const showDelete = selected || !!(data as ChoiceEdgeData | undefined)?.hovered;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} interactionWidth={24} />
      <EdgeLabelRenderer>
        {label && (
          <div
            className="flow-edge-label"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - (showDelete ? 22 : 0)}px)`,
            }}
          >
            {label}
          </div>
        )}
      </EdgeLabelRenderer>
      <EdgeToolbar edgeId={id} x={labelX} y={labelY} isVisible={showDelete}>
        <button
          type="button"
          className="flow-edge-delete"
          onMouseEnter={() => setEdgeHover(id)}
          onMouseLeave={() => setEdgeHover(null)}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            deleteEdge(id);
          }}
          title="Xóa mối nối (Delete)"
        >
          ✕
        </button>
      </EdgeToolbar>
    </>
  );
}

const nodeTypes = {
  note: (props: NodeProps) => <SceneNoteNode {...(props as SceneNoteNodeProps)} />,
};
const edgeTypes = { choice: ChoiceEdge };

// ---------------------------------------------------------------------------

export interface FlowCanvasProps {
  onSceneSelect: (scene: Scene | null) => void;
  storyVersion: number;
}

export default function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return (
    !!el &&
    (el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.isContentEditable ||
      !!el.closest('.ant-modal, .ant-select-dropdown'))
  );
}

function FlowCanvasInner({ onSceneSelect, storyVersion }: FlowCanvasProps) {
  const [scenes, setScenes] = React.useState<Scene[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = React.useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = React.useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [messageApi, messageHolder] = message.useMessage();
  const { screenToFlowPosition } = useReactFlow();

  const scenesRef = React.useRef<Scene[]>([]);
  scenesRef.current = scenes;
  const positionsRef = React.useRef<Record<string, XY>>(readLayout());
  const undoStack = React.useRef<Scene[][]>([]);
  const redoStack = React.useRef<Scene[][]>([]);
  const loadedOnce = React.useRef(false);
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  // --- Tải storyline (lần đầu + mỗi khi PropsPanel lưu) ---
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data: Scene[] = await loadStoryline();
        if (loadedOnce.current && JSON.stringify(data) !== JSON.stringify(scenesRef.current)) {
          // Sửa từ PropsPanel cũng hoàn tác được.
          undoStack.current = [...undoStack.current, scenesRef.current].slice(-HISTORY_LIMIT);
          redoStack.current = [];
        }
        loadedOnce.current = true;
        setScenes(data);
      } catch (error) {
        console.error('Failed to load storyline:', error);
        messageApi.open({
          key: 'api-error',
          type: 'error',
          duration: 0,
          content: `Không tải được storyline: ${(error as Error).message}`,
        });
      }
    };
    loadData();
  }, [storyVersion, messageApi]);

  // --- Dựng lại graph khi dữ liệu đổi, giữ nguyên vị trí card ---
  React.useEffect(() => {
    const { nodes: built, edges: builtEdges } = flowToNodes(scenes, positionsRef.current);
    built.forEach((n) => {
      positionsRef.current[n.id] = n.position;
    });
    writeLayout(positionsRef.current);
    setNodes((prev) => {
      const selected = new Set(prev.filter((n) => n.selected).map((n) => n.id));
      return built.map((n) => ({ ...n, selected: selected.has(n.id) }));
    });
    setEdges(builtEdges);
  }, [scenes, setNodes, setEdges]);

  const persist = React.useCallback(
    (next: Scene[]) => {
      saveStoryline(next)
        .then(() => messageApi.destroy('api-error'))
        .catch((error: Error) => {
          console.error('Failed to save storyline:', error);
          messageApi.open({
            key: 'api-error',
            type: 'error',
            duration: 0,
            content: `Chưa lưu được thay đổi: ${error.message}`,
          });
        });
    },
    [messageApi],
  );

  // --- Lịch sử hoàn tác ---
  const undo = React.useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(scenesRef.current);
    setScenes(prev);
    persist(prev);
    onSceneSelect(null);
    messageApi.open({ key: 'history', type: 'info', content: 'Đã hoàn tác', duration: 1.5 });
  }, [persist, onSceneSelect, messageApi]);

  const redo = React.useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(scenesRef.current);
    setScenes(next);
    persist(next);
    onSceneSelect(null);
    messageApi.open({ key: 'history', type: 'info', content: 'Đã làm lại', duration: 1.5 });
  }, [persist, onSceneSelect, messageApi]);

  /** Mọi thay đổi storyline đi qua đây: lưu lịch sử, ghi file, (tuỳ chọn) toast kèm Hoàn tác. */
  const commit = React.useCallback(
    (next: Scene[], toast?: string) => {
      undoStack.current = [...undoStack.current, scenesRef.current].slice(-HISTORY_LIMIT);
      redoStack.current = [];
      setScenes(next);
      persist(next);
      if (toast) {
        messageApi.open({
          key: 'history',
          type: 'success',
          duration: 4,
          content: (
            <span>
              {toast} ·{' '}
              <a
                onClick={() => {
                  messageApi.destroy('history');
                  undo();
                }}
              >
                Hoàn tác
              </a>{' '}
              <span className="flow-kbd">Ctrl+Z</span>
            </span>
          ),
        });
      }
    },
    [persist, messageApi, undo],
  );

  const createSceneId = React.useCallback(() => {
    const maxId = scenesRef.current.reduce((max, scene) => {
      const numericId = Number.parseInt(scene.id, 10);
      if (Number.isNaN(numericId)) return max;
      return Math.max(max, numericId);
    }, 0);
    return String(maxId + 1);
  }, []);

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

      const nextScenes = [...scenesRef.current];
      if (!groupScenes.length) return;

      const current = groupScenes[index];
      const currentIndex = nextScenes.findIndex((s) => s.id === current.id);
      if (currentIndex === -1) return;

      const currentGlobal = nextScenes[currentIndex];
      const legacyNext = (currentGlobal as SceneWithNext).next;

      const existingChoices = currentGlobal.choices ? [...currentGlobal.choices] : [];
      const autoChoices = existingChoices.filter((c) => c.text === null);
      const displayChoices = existingChoices.filter((c) => c.text !== null);

      const newSceneWithFlow: Scene = { ...newScene, choices: newScene.choices ?? [] };

      if (displayChoices.length === 0 && (autoChoices.length === 1 || legacyNext)) {
        const oldTarget = autoChoices[0]?.next ?? legacyNext;
        nextScenes[currentIndex] = stripLegacyNext({
          ...currentGlobal,
          choices: [{ text: null, next: newSceneWithFlow.id }],
        });
        newSceneWithFlow.choices = oldTarget ? [{ text: null, next: oldTarget }] : [];
      } else if (displayChoices.length > 0) {
        nextScenes[currentIndex] = stripLegacyNext({
          ...currentGlobal,
          choices: displayChoices.map((c) => ({ ...c, next: newSceneWithFlow.id })),
        });
      } else {
        nextScenes[currentIndex] = stripLegacyNext({
          ...currentGlobal,
          choices: [{ text: null, next: newSceneWithFlow.id }],
        });
      }

      nextScenes.splice(currentIndex + 1, 0, newSceneWithFlow);
      commit(nextScenes, `Đã thêm scene ${newSceneWithFlow.id}`);
    },
    [commit],
  );

  const handleDeleteNode = React.useCallback(
    (groupScenes: Scene[]) => {
      if (!groupScenes.length) return;

      const deletedIds = new Set(groupScenes.map((scene) => scene.id));
      const lastScene = groupScenes[groupScenes.length - 1];
      const lastLegacyNext = (lastScene as SceneWithNext).next;
      const outgoingTargets = Array.from(
        new Set(
          [
            ...(lastScene.choices?.map((choice) => choice.next).filter(Boolean) ?? []),
            lastLegacyNext,
          ].filter(Boolean) as string[],
        ),
      );
      const bridgeTarget = outgoingTargets[0];

      const remainingScenes = scenesRef.current.filter((scene) => !deletedIds.has(scene.id));
      const nextScenes = remainingScenes.map((scene) => {
        const legacyNext = (scene as SceneWithNext).next;
        let updatedScene = scene;
        let changed = false;

        if (legacyNext && deletedIds.has(legacyNext)) {
          const nextScene = (
            bridgeTarget
              ? { ...updatedScene, choices: [{ text: null, next: bridgeTarget }] }
              : { ...updatedScene }
          ) as SceneWithNext;
          delete nextScene.next;
          updatedScene = nextScene;
          changed = true;
        }

        if (updatedScene.choices?.some((choice) => deletedIds.has(choice.next))) {
          const nextChoices = updatedScene.choices.flatMap((choice) => {
            if (!deletedIds.has(choice.next)) return [choice];
            if (!bridgeTarget) return [];
            return [{ ...choice, next: bridgeTarget }];
          });
          updatedScene = { ...updatedScene, choices: nextChoices };
          changed = true;
        }

        return changed ? updatedScene : scene;
      });

      commit(
        nextScenes,
        groupScenes.length > 1
          ? `Đã xóa ${groupScenes.length} scene`
          : `Đã xóa scene ${lastScene.id}`,
      );
      setSelectedEdgeId(null);
      onSceneSelect(null);
    },
    [commit, onSceneSelect],
  );

  const handleDeleteEdge = React.useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;
      const sourceScenes = getNodeScenesById(edge.source);
      const targetScenes = getNodeScenesById(edge.target);
      if (!sourceScenes.length || !targetScenes.length) return;

      const sourceScene = sourceScenes[sourceScenes.length - 1];
      const targetSceneIds = new Set(targetScenes.map((scene) => scene.id));

      const nextScenes = scenesRef.current.map((scene) => {
        if (scene.id !== sourceScene.id) return scene;

        let updatedScene = scene;
        let changed = false;

        const legacyNext = (scene as SceneWithNext).next;
        if (legacyNext && targetSceneIds.has(legacyNext)) {
          const nextScene = { ...updatedScene } as SceneWithNext;
          delete nextScene.next;
          updatedScene = nextScene;
          changed = true;
        }

        if (updatedScene.choices?.some((choice) => targetSceneIds.has(choice.next))) {
          const nextChoices = updatedScene.choices.filter(
            (choice) => !targetSceneIds.has(choice.next),
          );
          updatedScene = { ...updatedScene, choices: nextChoices.length ? nextChoices : undefined };
          changed = true;
        }

        return changed ? updatedScene : scene;
      });

      commit(nextScenes, 'Đã xóa mối nối');
      setSelectedEdgeId(null);
      setHoveredEdgeId(null);
    },
    [edges, getNodeScenesById, commit],
  );

  // --- Nối card: luôn hỏi qua modal Lựa chọn (có chữ = lựa chọn, trống = nối tiếp) ---
  const [pendingLink, setPendingLink] = React.useState<
    (ChoiceLinkRequest & { newScene?: Scene; position?: XY }) | null
  >(null);

  // Kéo từ chấm nối sang card khác.
  const handleConnect = React.useCallback(
    (params: { source: string | null; target: string | null }) => {
      const { source, target } = params;
      if (!source || !target || source === target) return;
      const sourceScenes = getNodeScenesById(source);
      const targetScenes = getNodeScenesById(target);
      if (!sourceScenes.length || !targetScenes.length) return;

      setPendingLink(linkRequest(sourceScenes[sourceScenes.length - 1], targetScenes[0].id));
    },
    [getNodeScenesById],
  );

  const submitLink = (text: ChoiceLinkText | null) => {
    if (!pendingLink) return;
    const { fromId, toId, newScene, position } = pendingLink;
    if (newScene && position) positionsRef.current[newScene.id] = position;
    const base = newScene ? [...scenesRef.current, newScene] : scenesRef.current;
    const toast = newScene
      ? `Đã thêm scene ${toId}`
      : text
        ? `Đã tạo lựa chọn “${text.vi}”`
        : `Đã nối tiếp ${fromId} → ${toId}`;
    commit(linkScenes(base, fromId, toId, text), toast);
    setPendingLink(null);
  };

  // --- Kéo chấm nối ra chỗ trống → tạo scene mới tại điểm thả ---
  const [pendingCreate, setPendingCreate] = React.useState<{ fromId: string; position: XY } | null>(
    null,
  );
  const [createForm, setCreateForm] = React.useState<SceneFormState>(() => formFromScene());

  const handleConnectEnd: OnConnectEnd = React.useCallback(
    (event, connectionState) => {
      if (connectionState.isValid || !connectionState.fromNode) return;
      if (connectionState.fromHandle?.type !== 'source') return;
      const point = 'changedTouches' in event ? event.changedTouches[0] : event;
      const position = screenToFlowPosition({ x: point.clientX, y: point.clientY });
      const fromScenes = getNodeScenesById(connectionState.fromNode.id);
      const fromScene = fromScenes[fromScenes.length - 1];
      if (!fromScene) return;
      setCreateForm(formFromScene(fromScene));
      setPendingCreate({ fromId: fromScene.id, position: { x: position.x, y: position.y - 40 } });
    },
    [screenToFlowPosition, getNodeScenesById],
  );

  // Điền xong scene mới → hỏi tiếp cách nối (scene chỉ được thêm khi xác nhận ở modal Lựa chọn).
  const submitCreate = () => {
    if (!pendingCreate) return;
    const from = scenesRef.current.find((s) => s.id === pendingCreate.fromId);
    if (!from) return;
    const newScene = sceneFromForm(createSceneId(), createForm);
    setPendingLink({
      ...linkRequest(from, newScene.id),
      newScene,
      position: pendingCreate.position,
    });
    setPendingCreate(null);
  };

  // --- Chọn / hover ---
  const selectScene = React.useCallback(
    (nodeId: string, scene: Scene) => {
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
      setSelectedEdgeId(null);
      onSceneSelect(scene);
    },
    [setNodes, onSceneSelect],
  );

  const setEdgeHover = React.useCallback((edgeId: string | null) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (edgeId) {
      setHoveredEdgeId(edgeId);
    } else {
      // Trễ một chút để kịp đưa chuột từ đường nối lên nút ✕.
      hoverTimer.current = setTimeout(() => setHoveredEdgeId(null), 180);
    }
  }, []);

  // --- Phím tắt: Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y, Delete / Backspace ---
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEdgeId) {
          e.preventDefault();
          handleDeleteEdge(selectedEdgeId);
          return;
        }
        const selectedNode = nodes.find((n) => n.selected);
        if (selectedNode) {
          e.preventDefault();
          handleDeleteNode(getNodeScenesById(selectedNode.id));
        }
      } else if (e.key === 'Escape') {
        setSelectedEdgeId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo, selectedEdgeId, nodes, handleDeleteEdge, handleDeleteNode, getNodeScenesById]);

  const rearrange = () => {
    positionsRef.current = {};
    const { nodes: built } = flowToNodes(scenesRef.current, {});
    built.forEach((n) => {
      positionsRef.current[n.id] = n.position;
    });
    writeLayout(positionsRef.current);
    setNodes((prev) =>
      prev.map((n) => ({ ...n, position: positionsRef.current[n.id] ?? n.position })),
    );
  };

  const actions: EditorActions = React.useMemo(
    () => ({
      insertScene: handleInsertScene,
      deleteNode: handleDeleteNode,
      deleteEdge: handleDeleteEdge,
      createSceneId,
      selectScene,
      setEdgeHover,
    }),
    [
      handleInsertScene,
      handleDeleteNode,
      handleDeleteEdge,
      createSceneId,
      selectScene,
      setEdgeHover,
    ],
  );

  // Màu connector: chọn (đỏ) > hover connector (đỏ nhạt) > thuộc card đang hover (tím, chạy) > thường.
  const computedEdges = React.useMemo(
    () =>
      edges.map((edge) => {
        const selected = selectedEdgeId === edge.id;
        const hovered = hoveredEdgeId === edge.id;
        const related =
          !!hoveredNodeId && (edge.source === hoveredNodeId || edge.target === hoveredNodeId);
        const color = selected ? '#ef4444' : hovered ? '#f87171' : related ? '#6366f1' : '#94a3b8';
        return {
          ...edge,
          type: 'choice',
          selected,
          animated: related && !selected && !hovered,
          data: { hovered },
          zIndex: selected || hovered || related ? 10 : 0,
          markerEnd: { type: MarkerType.ArrowClosed, color },
          style: {
            ...(edge.style || {}),
            stroke: color,
            strokeWidth: selected || hovered || related ? 3 : 2,
            opacity: selected || hovered || related ? 1 : 0.7,
            transition: 'stroke 0.15s, stroke-width 0.15s, opacity 0.15s',
          },
        };
      }),
    [edges, selectedEdgeId, hoveredEdgeId, hoveredNodeId],
  );

  return (
    <EditorActionsContext.Provider value={actions}>
      {messageHolder}
      <div className="flow-editor h-full w-full bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_45%,#e2e8f0_100%)]">
        <ReactFlow
          nodes={nodes}
          edges={computedEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          onNodesChange={onNodesChange}
          onNodeDragStop={(_, __, dragged) => {
            dragged.forEach((n) => {
              positionsRef.current[n.id] = n.position;
            });
            writeLayout(positionsRef.current);
          }}
          onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
          onNodeMouseLeave={() => setHoveredNodeId(null)}
          onEdgeMouseEnter={(_, edge) => setEdgeHover(edge.id)}
          onEdgeMouseLeave={() => setEdgeHover(null)}
          onPaneClick={() => {
            setSelectedEdgeId(null);
            onSceneSelect(null);
          }}
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onConnect={handleConnect}
          onConnectEnd={handleConnectEnd}
          deleteKeyCode={null}
          snapToGrid
          snapGrid={[24, 24]}
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={true}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} />
          <Controls>
            <ControlButton onClick={rearrange} title="Sắp xếp lại (auto-layout)">
              ⇄
            </ControlButton>
          </Controls>
          <MiniMap position="bottom-right" pannable zoomable nodeStrokeWidth={3} />
        </ReactFlow>
      </div>
      <AddSceneModal
        open={!!pendingCreate}
        form={createForm}
        setForm={setCreateForm}
        onCancel={() => setPendingCreate(null)}
        onSubmit={submitCreate}
      />
      <ChoiceLinkModal
        request={pendingLink}
        onSubmit={submitLink}
        onCancel={() => setPendingLink(null)}
      />
    </EditorActionsContext.Provider>
  );
}
