'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { Button } from '@/components/ui/button';

export default function SidebarPanel() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div
      data-slot="sidebar"
      className={cn(
        'bg-sidebar text-sidebar-foreground flex h-full flex-col overflow-hidden',
        isCollapsed ? 'items-center justify-start p-2' : 'p-2',
      )}
    >
      <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'justify-between')}>
        {!isCollapsed && <span className="px-2 text-sm font-medium">Editor</span>}
        <SidebarTrigger className="shrink-0" />
      </div>

      {!isCollapsed && (
        <SidebarContent className="mt-3 flex h-full flex-col">
          {/* Story */}
          <SidebarGroup>
            <SidebarGroupLabel>Story</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-col gap-1 px-1">
                {Array.from({ length: 5 }, (_, i) => `Chapter ${i + 1}`).map((chapter) => (
                  <Button key={chapter} variant="ghost" className="w-full justify-start">
                    {chapter}
                  </Button>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Asset */}
          <SidebarGroup>
            <SidebarGroupLabel>Asset</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-col gap-1 px-1">
                {['Background', 'Characters', 'Audio'].map((item) => (
                  <Button key={item} variant="ghost" className="w-full justify-start">
                    {item}
                  </Button>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      )}
    </div>
  );
}
