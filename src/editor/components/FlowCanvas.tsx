import React from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  useNodesState, // ✅ dùng cái này
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { flowToNodes } from '../utils/flowToNodes';
import { mockScenes } from '../mockScenes';
import type { Scene } from '@/types/scene';
import { Card, Space, Tag, Typography } from 'antd';

const { Text } = Typography;

type SceneNodeData = {
  scene: Scene;
};

function SceneNoteNode({ data }: { data: SceneNodeData }) {
  const { scene } = data;

  return (
    <div style={{ width: 300, cursor: 'grab' }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <Card
        size="small"
        title={scene.id}
        extra={scene.bg && <Tag>{scene.bg}</Tag>}
        styles={{
          body: { padding: 12 },
        }}
      >
        <div>
          {scene.textbox && (
            <Space direction="vertical" size={4}>
              {scene.textbox.name && <Text type="secondary">{scene.textbox.name}</Text>}
              <Text>{scene.textbox.text}</Text>
            </Space>
          )}

          {scene.char?.length && (
            <Space wrap style={{ marginTop: 8 }}>
              {scene.char.map((c, i) => (
                <Tag key={i} color="purple">
                  {c.name} {c.pose && `· ${c.pose}`}
                </Tag>
              ))}
            </Space>
          )}

          {scene.choices?.length ? (
            <Space direction="vertical" style={{ marginTop: 8 }}>
              {scene.choices.map((c) => (
                <Card size="small" key={c.next}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>{c.text}</span>
                    <Tag>{c.next}</Tag>
                  </Space>
                </Card>
              ))}
            </Space>
          ) : (
            scene.next && (
              <Tag color="blue" style={{ marginTop: 8 }}>
                {scene.next}
              </Tag>
            )
          )}
        </div>
      </Card>
    </div>
  );
}

const nodeTypes = {
  note: SceneNoteNode,
};

export default function FlowCanvas() {
  const { nodes: initialNodes, edges: initialEdges } = flowToNodes(mockScenes);
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
      </ReactFlow>
    </div>
  );
}
