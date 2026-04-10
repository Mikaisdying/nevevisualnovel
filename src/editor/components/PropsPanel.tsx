'use client';

import { Card, Input, Space, Typography } from 'antd';

export default function PropsPanel() {
  return (
    <Card
      bordered={false}
      className="flex h-full min-h-0 flex-col gap-4 border-0 bg-white/95 p-4 backdrop-blur"
      styles={{ body: { height: '100%', padding: 0 } }}
    >
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Properties
      </Typography.Title>

      <Space direction="vertical" size={12} className="w-full">
        <div>
          <Typography.Text type="secondary">Name</Typography.Text>
          <Input className="mt-2" placeholder="Node name..." />
        </div>

        <div>
          <Typography.Text type="secondary">Value</Typography.Text>
          <Input className="mt-2" placeholder="Some value..." />
        </div>
      </Space>
    </Card>
  );
}
