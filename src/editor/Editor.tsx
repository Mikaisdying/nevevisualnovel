import { useState } from 'react';
import { Layout } from 'antd';

import SidebarPanel from './components/SidebarPanel';
import FlowCanvas from './components/FlowCanvas';
import PropsPanel from './components/PropsPanel';

function EditorContent() {
  return (
    <div className="relative h-full min-h-0 min-w-0 overflow-hidden">
      <div className="relative h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        <FlowCanvas />
      </div>

      {/* <div className="absolute top-0 right-0 h-full min-h-0 w-80 shrink-0 overflow-y-auto border-l bg-white/95 backdrop-blur">
        <PropsPanel />
      </div> */}
    </div>
  );
}

export default function Editor() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="h-screen overflow-hidden bg-slate-50">
      <Layout.Sider
        width={240}
        collapsedWidth={50}
        collapsed={collapsed}
        trigger={null}
        theme="light"
        className="overflow-hidden border-r border-slate-200"
      >
        <SidebarPanel
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
        />
      </Layout.Sider>

      <Layout.Content className="h-screen min-h-0 min-w-0 overflow-hidden p-0">
        <EditorContent />
      </Layout.Content>
    </Layout>
  );
}
