import { useEffect } from 'react';
import FlowCanvas from './components/FlowCanvas';
import SidebarPanel from './components/SidebarPanel';
import NodePanel from './components/NodePanel';
import { useEditorStore } from './store/useEditorStore';
import { loadManifest } from './api/manifest.api';
import { convertToVNJson } from './utils/convertToVNJson';
import { downloadStory } from './api/story.api';

import { SidebarProvider } from '@/components/ui/sidebar';

export default function Editor() {
  const { nodes, setNodes, edges, setEdges, selectedNode, setSelectedNode, manifest, setManifest } =
    useEditorStore();

  useEffect(() => {
    loadManifest().then(setManifest);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* SIDEBAR */}
        <SidebarPanel manifest={manifest} setNodes={setNodes} setEdges={setEdges} />

        {/* CANVAS */}
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            onSelectNode={setSelectedNode}
          />

          <button
            className="absolute top-2 left-12 bg-green-500 px-3 py-1"
            onClick={() => {
              const data = convertToVNJson(nodes, edges);
              downloadStory('story.json', data);
            }}
          >
            Export
          </button>
        </div>

        {/* NODE PANEL */}
        <div className="w-80 shrink-0 overflow-auto border-l">
          <NodePanel
            node={selectedNode}
            manifest={manifest}
            onChange={(updated: any) =>
              setNodes((nds: any) => nds.map((n: any) => (n.id === updated.id ? updated : n)))
            }
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
