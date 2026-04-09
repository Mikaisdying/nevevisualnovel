'use client';

import React from 'react';
import { loadStoryList, loadStory } from '../api/story.api';
import { flowToNodes } from '../utils/flowToNodes';

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

import { FileText, Image } from 'lucide-react';

export default function SidebarPanel({ manifest, setNodes, setEdges }: any) {
  const [stories, setStories] = React.useState<string[]>([]);
  const [activeStory, setActiveStory] = React.useState<string | null>(null);

  // load story list
  React.useEffect(() => {
    loadStoryList().then((data) => {
      const list = Array.isArray(data?.stories) ? data.stories : [];
      setStories(list);
    });
  }, []);

  // load story
  const handleLoadStory = async (name: string) => {
    const data = await loadStory(name);
    const { nodes, edges } = flowToNodes(data);

    setNodes(nodes);
    setEdges(edges);
    setActiveStory(name);
  };

  return (
    <>
      <Sidebar variant="inset" collapsible="none" className="min-h-0 overflow-hidden">
        <SidebarContent className="p-2">
          {/* ===== STORY ===== */}
          <SidebarGroup>
            <SidebarGroupLabel>Story</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {/* Title */}
                <SidebarMenuItem>
                  <SidebarMenuButton className="gap-2" disabled>
                    <FileText size={16} />
                    Stories
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Story list */}
                {stories.map((story) => (
                  <SidebarMenuItem key={story}>
                    <SidebarMenuButton
                      onClick={() => handleLoadStory(story)}
                      isActive={activeStory === story}
                    >
                      {story}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ===== ASSETS ===== */}
          <SidebarGroup>
            <SidebarGroupLabel>Assets</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="gap-2" disabled>
                    <Image size={16} />
                    Library
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Backgrounds */}
                {manifest?.backgrounds?.map((bg: any) => (
                  <SidebarMenuItem key={bg.id}>
                    <SidebarMenuButton>🖼 {bg.name}</SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Characters */}
                {manifest?.characters?.map((char: any) => (
                  <SidebarMenuItem key={char.id}>
                    <SidebarMenuButton>👤 {char.name}</SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarTrigger className="absolute top-2 left-2 z-20" />
    </>
  );
}
