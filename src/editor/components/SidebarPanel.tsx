'use client';

import { useEffect, useState } from 'react';
import { AlignLeft, FolderOpen } from 'lucide-react';
import type { MenuProps } from 'antd';
import { Button, Menu, Typography } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const menuItems: MenuProps['items'] = [
  {
    key: 'assets',
    icon: <FolderOpen className="h-1 w-1 shrink-0" />,
    label: 'Assets',
    children: [
      { key: 'assets-backgrounds', label: 'Backgrounds' },
      { key: 'assets-characters', label: 'Characters' },
      { key: 'assets-audio', label: 'Audio' },
    ],
  },
];

type SidebarPanelProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

function getActiveGroupKey(selectedKey: string | undefined) {
  if (selectedKey?.startsWith('assets-')) {
    return 'assets';
  }

  return undefined;
}

export default function SidebarPanel({ collapsed, onToggleCollapsed }: SidebarPanelProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['assets']);
  const [openKeys, setOpenKeys] = useState<string[]>(['assets']);

  const activeGroupKey = getActiveGroupKey(selectedKeys[0]);

  useEffect(() => {
    if (collapsed) {
      return;
    }

    setOpenKeys(activeGroupKey ? [activeGroupKey] : []);
  }, [collapsed, activeGroupKey]);

  return (
    <div className="flex h-full flex-col border-r bg-slate-50">
      <div className="flex h-12 items-center justify-between gap-2 border-b px-4">
        {!collapsed ? (
          <Typography.Text className="text-[11px] font-semibold tracking-[0.2em] uppercase">
            Project
          </Typography.Text>
        ) : (
          <span className="h-4" />
        )}

        <Button
          type="text"
          size="small"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          icon={
            collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          }
          onClick={onToggleCollapsed}
        />
      </div>

      <Menu
        mode="inline"
        items={menuItems}
        inlineCollapsed={collapsed}
        openKeys={collapsed ? undefined : openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
        selectedKeys={selectedKeys}
        onClick={({ key }) => setSelectedKeys([key])}
        triggerSubMenuAction="hover"
        className="flex-1 border-r-0 bg-transparent"
        style={{ background: 'transparent' }}
      />
    </div>
  );
}
