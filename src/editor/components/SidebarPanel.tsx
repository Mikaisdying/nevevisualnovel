'use client';

import { useMemo, useState, type ComponentType } from 'react';
import { AlignLeft, ChevronDown, FolderOpen, Plus } from 'lucide-react';
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';

import { cn } from '@/lib/utils';

type NestedLink = {
  label: string;
  active?: boolean;
  icon?: ComponentType<{ className?: string }>;
};

type NestedGroup = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  initiallyOpened?: boolean;
  onAdd?: () => void;
  links: NestedLink[];
};

const mockdata: NestedGroup[] = [
  {
    label: 'Story',
    icon: AlignLeft,
    initiallyOpened: true,
    onAdd: () => {},
    links: Array.from({ length: 5 }, (_, index) => ({
      label: `Chapter ${index + 1}`,
      active: index === 0,
    })),
  },
  {
    label: 'Assets',
    icon: FolderOpen,
    initiallyOpened: true,
    links: [{ label: 'Backgrounds' }, { label: 'Characters' }, { label: 'Audio' }],
  },
];

const linkBase =
  'group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-normal transition-colors';

const linkHover = 'hover:bg-slate-100 hover:text-slate-900';

const sectionIconClass =
  'h-3 w-3 shrink-0 text-slate-400 transition-colors group-hover:text-slate-200';

function NestedLinksGroup({
  icon: Icon,
  label,
  opened,
  onToggle,
  onAdd,
  links,
}: NestedGroup & {
  opened: boolean;
  onToggle: () => void;
}) {
  return (
    <Box>
      <Button
        variant="subtle"
        color="gray"
        fullWidth
        radius={0}
        className="w-full px-0"
        onClick={onToggle}
      >
        <Group justify="space-between" px="sm" py={8} gap="xs" wrap="nowrap" className="w-full">
          <Group
            gap={6}
            wrap="nowrap"
            className="text-[11px] tracking-[0.18em] text-slate-400 uppercase"
          >
            <Icon className={sectionIconClass} />
            {label}
          </Group>

          <Group gap={4} wrap="nowrap">
            {onAdd && (
              <ActionIcon
                variant="subtle"
                size="sm"
                radius="md"
                onClick={(event) => {
                  event.stopPropagation();
                  onAdd();
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </ActionIcon>
            )}

            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 text-slate-400 transition-transform',
                opened && 'rotate-180',
              )}
            />
          </Group>
        </Group>
      </Button>

      <Collapse expanded={opened}>
        <Stack gap={4} py={4}>
          {links.map((link) => (
            <Button
              key={link.label}
              variant="subtle"
              color="gray"
              fullWidth
              justify="flex-start"
              radius="md"
              leftSection={undefined}
              rightSection={undefined}
              className={cn(
                linkBase,
                link.active ? 'bg-slate-200 text-slate-950' : cn('text-slate-600', linkHover),
              )}
            >
              <span className="flex-1 truncate text-left font-normal">{link.label}</span>
            </Button>
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
}

export default function SidebarPanel() {
  const [opened, setOpened] = useState<Record<string, boolean>>(() => {
    return Object.fromEntries(mockdata.map((item) => [item.label, item.initiallyOpened ?? false]));
  });

  const groups = useMemo(
    () =>
      mockdata.map((item) => ({
        ...item,
        opened: opened[item.label] ?? false,
      })),
    [opened],
  );

  return (
    <Paper
      radius={0}
      className="flex h-full w-[240px] flex-col border-r border-slate-200 bg-slate-50"
    >
      <Group px="sm" py={12} className="border-b border-slate-200">
        <Text size="xs" fw={600} className="tracking-[0.2em] text-slate-400 uppercase">
          Project
        </Text>
      </Group>

      <ScrollArea className="flex-1">
        <Box className="p-2">
          <Stack gap={4}>
            {groups.map((group) => (
              <NestedLinksGroup
                key={group.label}
                icon={group.icon}
                label={group.label}
                links={group.links}
                opened={group.opened}
                onToggle={() =>
                  setOpened((current) => ({
                    ...current,
                    [group.label]: !current[group.label],
                  }))
                }
                onAdd={group.onAdd}
              />
            ))}
          </Stack>
        </Box>
      </ScrollArea>
    </Paper>
  );
}
