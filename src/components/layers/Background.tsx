import { useState } from 'react';
import { bgUrl, cgUrl } from '@/engine/assets';

type Props = {
  bg?: string;
  cg?: string;
  /** Đường dẫn ảnh trực tiếp (màn tiêu đề); ưu tiên hơn bg/cg. */
  src?: string;
};

function resolveUrl({ bg, cg, src }: Props) {
  if (src) return src;
  if (cg) return cgUrl(cg);
  if (bg) return bgUrl(bg);
  return '';
}

/**
 * Ảnh nền full canvas 1280x720, object-cover: ảnh raster đúng 16:9 (vd 1920x1080)
 * hiển thị trọn vẹn; ảnh khác tỉ lệ sẽ bị cắt mép thay vì méo. Thiếu ảnh thì
 * dùng nền gradient của theme.
 */
export default function Background(props: Props) {
  const url = resolveUrl(props);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  return (
    <div className="vn-scene-fallback layer-background pointer-events-none absolute inset-0">
      {url && failedUrl !== url && (
        <img
          key={url}
          src={url}
          alt=""
          draggable={false}
          className="vn-fade-in absolute inset-0 h-full w-full object-cover object-center"
          onError={() => setFailedUrl(url)}
        />
      )}
    </div>
  );
}
