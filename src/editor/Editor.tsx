import { useState } from 'react';
import { Layout } from 'antd';
import type { Scene } from '@/types/scene';

import SidebarPanel from './components/SidebarPanel';
import FlowCanvas from './components/FlowCanvas';
import PropsPanel from './components/PropsPanel';

function EditorContent({
  selectedScene,
  onSceneSelect,
  storyVersion,
  onStoryUpdated,
}: {
  selectedScene: Scene | null;
  onSceneSelect: (scene: Scene | null) => void;
  storyVersion: number;
  onStoryUpdated: (updated: Scene) => void;
}) {
  return (
    <div className="relative flex h-full min-h-0 min-w-0 overflow-hidden">
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <FlowCanvas onSceneSelect={onSceneSelect} storyVersion={storyVersion} />
      </div>

      {selectedScene && (
        <div className="flex h-full min-h-0 w-[320px] max-w-[30vw] shrink-0 flex-col border-l bg-white/95 py-3 pr-3 pl-4 backdrop-blur">
          <PropsPanel
            scene={selectedScene}
            onSceneUpdated={(scene) => {
              onSceneSelect(scene);
              onStoryUpdated(scene);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function Editor() {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [storyVersion, setStoryVersion] = useState(0);

  return (
    <Layout className="h-full overflow-hidden bg-slate-50">
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
        <EditorContent
          selectedScene={selectedScene}
          onSceneSelect={setSelectedScene}
          storyVersion={storyVersion}
          onStoryUpdated={() => setStoryVersion((v) => v + 1)}
        />
      </Layout.Content>
    </Layout>
  );
}
