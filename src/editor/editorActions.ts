import React from 'react';
import type { Scene } from '@/types/scene';

/**
 * Các thao tác FlowCanvas cung cấp cho card / connector. Truyền qua context
 * (thay vì props) để nodeTypes / edgeTypes khai báo một lần ở cấp module —
 * React Flow không phải dựng lại node khi callback đổi.
 */
export type EditorActions = {
  insertScene: (groupScenes: Scene[], index: number, scene: Scene) => void;
  deleteNode: (groupScenes: Scene[]) => void;
  deleteEdge: (edgeId: string) => void;
  createSceneId: () => string;
  selectScene: (nodeId: string, scene: Scene) => void;
  /** Giữ nút ✕ của connector hiện khi chuột đang ở trên nút đó. */
  setEdgeHover: (edgeId: string | null) => void;
};

export const EditorActionsContext = React.createContext<EditorActions | null>(null);

export function useEditorActions() {
  const ctx = React.useContext(EditorActionsContext);
  if (!ctx) throw new Error('useEditorActions must be used inside FlowCanvas');
  return ctx;
}
