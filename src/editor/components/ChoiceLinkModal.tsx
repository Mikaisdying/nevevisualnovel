import React from 'react';
import { Input, Modal, Typography, type InputRef } from 'antd';

const { Text } = Typography;

export type ChoiceLinkRequest = {
  fromId: string;
  toId: string;
  /** Số lựa chọn (có chữ) scene nguồn đang có — khi > 0 bắt buộc nhập chữ. */
  existingChoices: number;
  /** Đích "nối tiếp" hiện tại của scene nguồn (sẽ bị thay thế). */
  currentAutoTarget?: string;
};

type ChoiceLinkModalProps = {
  request: ChoiceLinkRequest | null;
  onSubmit: (text: string | null) => void;
  onCancel: () => void;
};

/**
 * Hỏi cách nối card 1 → card 2:
 * - nhập chữ + Enter → tạo lựa chọn, bấm vào sẽ sang card 2;
 * - để trống + Enter → nối tiếp (thoại liên tục).
 */
export function ChoiceLinkModal({ request, onSubmit, onCancel }: ChoiceLinkModalProps) {
  const [text, setText] = React.useState('');
  const [error, setError] = React.useState(false);
  const inputRef = React.useRef<InputRef>(null);

  React.useEffect(() => {
    if (request) {
      setText('');
      setError(false);
    }
  }, [request]);

  const mustHaveText = (request?.existingChoices ?? 0) > 0;
  const replacesAuto =
    !!request?.currentAutoTarget && request.currentAutoTarget !== request.toId;

  const submit = () => {
    const value = text.trim();
    if (!value && mustHaveText) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    onSubmit(value || null);
  };

  return (
    <Modal
      title="Lựa chọn"
      open={!!request}
      onCancel={onCancel}
      onOk={submit}
      okText={text.trim() || mustHaveText ? 'Tạo lựa chọn' : 'Nối tiếp'}
      cancelText="Hủy"
      width={420}
      afterOpenChange={(open) => open && inputRef.current?.focus()}
      destroyOnHidden
    >
      {request && (
        <div className="flex flex-col gap-2">
          <Text type="secondary">
            <Text code>{request.fromId}</Text> → <Text code>{request.toId}</Text>
          </Text>
          <Input
            ref={inputRef}
            value={text}
            status={error ? 'error' : undefined}
            placeholder={mustHaveText ? 'Nhập chữ cho lựa chọn…' : 'Nhập lựa chọn, hoặc để trống = nối tiếp'}
            onChange={(e) => {
              setText(e.target.value);
              setError(false);
            }}
            onPressEnter={submit}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {text.trim()
              ? 'Enter: tạo nút lựa chọn — người chơi bấm vào sẽ sang card đích.'
              : mustHaveText
                ? `Card này đang có ${request.existingChoices} lựa chọn — cần nhập chữ để thêm lựa chọn mới.`
                : 'Enter khi để trống: nối tiếp, thoại chạy liên tục sang card đích.'}
          </Text>
          {replacesAuto && (
            <Text type="warning" style={{ fontSize: 12 }}>
              Nối tiếp hiện tại tới <Text code>{request.currentAutoTarget}</Text> sẽ được thay thế.
            </Text>
          )}
        </div>
      )}
    </Modal>
  );
}
