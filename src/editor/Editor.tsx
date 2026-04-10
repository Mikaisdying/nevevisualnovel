import { AppShell, Box } from '@mantine/core';

import SidebarPanel from './components/SidebarPanel';
import FlowCanvas from './components/FlowCanvas';
import PropsPanel from './components/PropsPanel';

function EditorContent() {
  return (
    <Box className="relative h-full min-h-0 min-w-0 overflow-hidden">
      <Box className="relative h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        <FlowCanvas />
      </Box>

      <Box className="absolute top-0 right-0 h-full min-h-0 w-80 shrink-0 overflow-y-auto border-l bg-white/95 backdrop-blur">
        <PropsPanel />
      </Box>
    </Box>
  );
}

export default function Editor() {
  return (
    <AppShell
      header={{ height: 0 }}
      navbar={{ width: 240, breakpoint: 0 }}
      padding={0}
      className="h-screen overflow-hidden bg-slate-50"
    >
      <AppShell.Navbar p={0} withBorder={false}>
        <SidebarPanel />
      </AppShell.Navbar>

      <AppShell.Main className="h-screen min-h-0 min-w-0 overflow-hidden p-0">
        <EditorContent />
      </AppShell.Main>
    </AppShell>
  );
}
