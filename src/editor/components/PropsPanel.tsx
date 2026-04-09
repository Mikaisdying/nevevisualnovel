'use client';

import { Input } from '@/components/ui/input';

export default function PropsPanel() {
  return (
    <div className="flex h-full flex-col gap-4 border-l p-4">
      <h2 className="text-lg font-semibold">Properties</h2>

      <div className="space-y-2">
        <a>Name</a>
        <Input placeholder="Node name..." />
      </div>

      <div className="space-y-2">
        <a>Value</a>
        <Input placeholder="Some value..." />
      </div>
    </div>
  );
}
