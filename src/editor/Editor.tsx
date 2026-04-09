'use client';

import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

import SidebarPanel from './components/SidebarPanel';
import FlowCanvas from './components/FlowCanvas';
import PropsPanel from './components/PropsPanel';

function EditorLayout() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside
        className={cn(
          'shrink-0 border-r transition-[width] duration-200 ease-linear',
          isCollapsed ? 'w-14' : 'w-[14rem]',
        )}
      >
        <SidebarPanel />
      </aside>

      <main className="min-w-0 flex-1">
        <FlowCanvas />
      </main>

      <aside className="w-80 shrink-0 border-l">
        <PropsPanel />
      </aside>
    </div>
  );
}

export default function Editor() {
  return (
    <SidebarProvider defaultOpen>
      <EditorLayout />
    </SidebarProvider>
  );
}
