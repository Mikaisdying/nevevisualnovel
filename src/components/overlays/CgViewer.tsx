import { useGameStore } from '@/engine/store';
import { cgUrl } from '@/engine/assets';
import { useUiStore } from '@/store/ui';
import { Overlay, VnButton } from '@/components/ui';
import { useI18n } from '@/i18n';

/** Figma: "15 CG Viewer (overlay)" — ảnh 1040x585 (16:9), tên CG và nút Đóng. */
export default function CgViewer({ id }: { id: string }) {
  const cg = useGameStore((s) => s.manifest.cgs?.find((c) => c.id === id));
  const back = useUiStore((s) => s.back);
  const { t, tx } = useI18n();
  const name = cg ? tx(cg.name) : id;

  return (
    <Overlay dim={0.92} onClick={back} className="cursor-pointer">
      <img
        src={cgUrl(id)}
        alt={name}
        draggable={false}
        className="vn-fade-in absolute top-[40px] left-[120px] h-[585px] w-[1040px] rounded-[12px] object-contain"
      />
      <p className="vn-display absolute top-[648px] left-[120px] text-[24px] font-semibold">
        {name}
      </p>
      <VnButton variant="secondary" className="absolute top-[642px] right-[120px]" onClick={back}>
        {t.common.close}
      </VnButton>
    </Overlay>
  );
}
