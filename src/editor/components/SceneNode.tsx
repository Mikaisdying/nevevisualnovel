import React from 'react';
import { Handle, Position, useReactFlow, NodeToolbar, type NodeProps } from '@xyflow/react';
import type { Scene } from '@/types/scene';
import { Card, Space, Tag, Typography } from 'antd';
import { loadManifest } from '../api/manifest.api';
import { AddSceneModal, type SceneFormState } from './AddSceneModal';

const { Text } = Typography;

export type SceneNodeData = {
  scenes: Scene[];
  nodeIdMap: Map<string, string>;
};

export type SceneNoteNodeProps = NodeProps & {
  data: SceneNodeData;
  onInsertScene: (index: number, scene: Scene) => void;
  onSceneClick?: (scene: Scene) => void;
};

function InsertDivider({ onClick }: { onClick: () => void }) {
  return (
    <div className="group relative py-1">
      <div className="border-b" />

      <button
        type="button"
        className="absolute top-1/2 left-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-xs opacity-0 transition group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        +
      </button>
    </div>
  );
}

const SceneItem = React.memo(function SceneItem({
  scene,
  onClick,
}: {
  scene: Scene;
  onClick?: () => void;
}) {
  if (!scene.textbox) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={{
        all: 'unset',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <Space orientation="vertical" size={2}>
        {scene.textbox.name && <Text type="secondary">{scene.textbox.name}</Text>}
        <Text>{scene.textbox.text}</Text>
      </Space>
    </button>
  );
});

export function SceneNoteNode({ data, selected, onInsertScene, onSceneClick }: SceneNoteNodeProps) {
  const { scenes, nodeIdMap } = data;
  const first = scenes[0];

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalIndex, setModalIndex] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<SceneFormState>({
    name: '',
    text: '',
    characters: [],
    bg: '',
    choices: [],
  });

  const { setCenter, getNode, setNodes } = useReactFlow();

  const jumpToNode = React.useCallback(
    (sceneId: string) => {
      const targetNodeId = nodeIdMap?.get(sceneId) || sceneId;

      const node = getNode(targetNodeId);
      if (!node) return;

      setCenter(node.position.x + 150, node.position.y + 90, {
        zoom: 0.75,
        duration: 400,
      });

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === targetNodeId,
        })),
      );
    },
    [nodeIdMap, getNode, setCenter, setNodes],
  );

  const openModal = (index: number) => {
    const lastScene = scenes[scenes.length - 1];

    setModalIndex(index);
    setForm((prev) => ({
      ...prev,
      name: lastScene?.textbox?.name || '',
      text: '',
    }));
    setIsModalOpen(true);
  };

  return (
    <div className="drag-handle" style={{ width: 300 }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <NodeToolbar isVisible={!!selected} position={Position.Bottom}>
        <button
          type="button"
          className="rf-btn danger"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          delete
        </button>
      </NodeToolbar>

      <NodeToolbar isVisible={!!selected} position={Position.Right}>
        <button
          type="button"
          className="rf-btn primary"
          onClick={(e) => {
            e.stopPropagation();
            // mock add via modal after last scene in this node
            openModal(scenes.length - 1);
          }}
        >
          add
        </button>
      </NodeToolbar>

      <Card
        size="small"
        title={
          <div
            style={{
              cursor: 'grab',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>{first.id}</span>
            {scenes.length > 1 && (
              <span style={{ fontSize: 12, color: '#888' }}>+{scenes.length - 1}</span>
            )}
          </div>
        }
        extra={first.bg && <Tag>{first.bg}</Tag>}
      >
        <Space
          orientation="vertical"
          size={8}
          style={{
            maxHeight: 450,
            overflowY: 'auto',
            width: '100%',
            cursor: 'default',
            paddingBottom: 14,
          }}
        >
          {scenes.map((scene, i) => {
            return (
              <React.Fragment key={scene.id}>
                <SceneItem scene={scene} onClick={() => onSceneClick?.(scene)} />
                <InsertDivider onClick={() => openModal(i)} />
              </React.Fragment>
            );
          })}
        </Space>

        <div style={{ marginTop: 12 }}>
          <Space orientation="vertical" style={{ width: '100%' }}>
            {scenes[scenes.length - 1].choices?.map((c) => (
              <Card
                size="small"
                key={c.next}
                hoverable
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToNode(c.next);
                }}
              >
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>→ {c.text}</span>
                  <Tag>{c.next}</Tag>
                </Space>
              </Card>
            ))}

            {!scenes[scenes.length - 1].choices?.length && scenes[scenes.length - 1].next && (
              <Card
                size="small"
                hoverable
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToNode(scenes[scenes.length - 1].next!);
                }}
              >
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>
                    →{' '}
                    {isNaN(Number(scenes[scenes.length - 1].next))
                      ? 'next'
                      : scenes[scenes.length - 1].next}
                  </span>
                  <Tag>{scenes[scenes.length - 1].next}</Tag>
                </Space>
              </Card>
            )}
          </Space>
        </div>
      </Card>
      <AddSceneModal
        open={isModalOpen}
        form={form}
        setForm={setForm}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={() => {
          if (modalIndex === null) return;

          const newScene: Scene = {
            id: crypto.randomUUID(),
            textbox: {
              name: form.name,
              text: form.text,
            },
            bg: form.bg,
            choices: form.choices.length
              ? form.choices.map((c) => ({
                  text: c.text,
                  next: c.next ?? '',
                }))
              : undefined,
          };

          onInsertScene(modalIndex, newScene);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
