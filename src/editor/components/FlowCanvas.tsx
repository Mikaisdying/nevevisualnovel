import React from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MiniMap } from '@xyflow/react';

import { flowToNodes } from '../utils/flowToNodes';
import { mockScenes } from '../mockScenes';
import type { Scene } from '@/types/scene';
import { Card, Space, Tag, Typography } from 'antd';

const { Text } = Typography;

type SceneNodeData = {
  scenes: Scene[];
  nodeIdMap: Map<string, string>;
};

function SceneNoteNode({ data }: { data: SceneNodeData }) {
  const { scenes, nodeIdMap } = data;
  const first = scenes[0];

  const { setCenter, getNode, setNodes } = useReactFlow();

  const jumpToNode = (sceneId: string) => {
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
  };

  return (
    <div style={{ width: 300 }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <Card
        size="small"
        title={`${first.id} ${scenes.length > 1 ? `(+${scenes.length - 1})` : ''}`}
        extra={first.bg && <Tag>{first.bg}</Tag>}
      >
        <Space
          direction="vertical"
          size={8}
          style={{ maxHeight: 200, overflowY: 'auto', width: '100%' }}
        >
          {scenes.map((scene, i) => (
            <div key={scene.id}>
              {scene.textbox && (
                <Space direction="vertical" size={2}>
                  {scene.textbox.name && <Text type="secondary">{scene.textbox.name}</Text>}
                  <Text>{scene.textbox.text}</Text>
                </Space>
              )}

              {i < scenes.length - 1 && (
                <div
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    margin: '6px 0',
                  }}
                />
              )}
            </div>
          ))}
        </Space>

        <div style={{ marginTop: 12 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
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
                  <span>{c.text}</span>
                  <Tag>{c.next}</Tag>
                </Space>
              </Card>
            ))}

            {!scenes[scenes.length - 1].choices?.length && scenes[scenes.length - 1].next && (
              <Tag
                color="blue"
                style={{ cursor: 'pointer', textAlign: 'center' }}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToNode(scenes[scenes.length - 1].next!);
                }}
              >
                → {scenes[scenes.length - 1].next}
              </Tag>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
}

const nodeTypes = {
  note: SceneNoteNode,
  groupNode: SceneNoteNode,
};

export default function FlowCanvas() {
  const { nodes: initialNodes, edges: initialEdges, nodeIdMap } = flowToNodes(mockScenes);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
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
