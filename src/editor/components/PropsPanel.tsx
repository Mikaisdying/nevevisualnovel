'use client';

import { Paper, Stack, Text, TextInput } from '@mantine/core';

export default function PropsPanel() {
  return (
    <Paper
      radius={0}
      className="flex h-full min-h-0 flex-col gap-4 border-l bg-white/95 p-4 backdrop-blur"
    >
      <Text size="lg" fw={700}>
        Properties
      </Text>

      <Stack gap="sm">
        <Text size="sm" fw={500} c="dimmed">
          Name
        </Text>
        <TextInput placeholder="Node name..." />
      </Stack>

      <Stack gap="sm">
        <Text size="sm" fw={500} c="dimmed">
          Value
        </Text>
        <TextInput placeholder="Some value..." />
      </Stack>
    </Paper>
  );
}
