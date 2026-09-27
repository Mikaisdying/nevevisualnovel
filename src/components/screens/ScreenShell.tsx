import * as React from 'react';
import { GAME_CONFIG } from '@/config/game';
import Background from '@/components/layers/Background';
import { ScreenHeader } from '@/components/ui';

type ScreenShellProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  /** Độ tối phủ lên ảnh nền (Figma: 0.35 Thư viện, 0.45 Cài đặt / Lưu / Tải). */
  dim?: number;
  children: React.ReactNode;
};

/** Khung chung của các màn menu full-screen: ảnh nền + lớp tối + Screen Header. */
export function ScreenShell({ title, subtitle, onBack, dim = 0.45, children }: ScreenShellProps) {
  return (
    <div className="layer-modal vn-fade-in absolute inset-0">
      <Background src={GAME_CONFIG.menuBackground} />
      <div
        className="vn-dim absolute inset-0"
        style={{ '--vn-dim-alpha': dim } as React.CSSProperties}
      />
      <ScreenHeader title={title} subtitle={subtitle} onBack={onBack} />
      {children}
    </div>
  );
}
