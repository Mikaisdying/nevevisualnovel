import { Modal, List, Typography, Image, Input } from 'antd';
import { useState, useMemo } from 'react';

type AssetModalProps = {
  open: boolean;
  onCancel: () => void;
};

const assets = [
  { name: 'bg_school.png', type: 'background', url: '/assets/bg/bg_school.png' },
  { name: 'char_ame.png', type: 'character', url: '/assets/char/ame/char_ame.png' },
];

export default function AssetModal({ open, onCancel }: AssetModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState('');

  // Reset selection when modal opens
  useMemo(() => {
    if (open) setSelectedIndex(0);
  }, [open]);

  const filteredAssets = useMemo(
    () => assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  const selected = filteredAssets[selectedIndex] || filteredAssets[0] || assets[0];

  return (
    <Modal
      title={<span style={{ fontWeight: 600, fontSize: 16 }}>Assets</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      style={{ padding: 0, minHeight: 400 }}
    >
      <div style={{ display: 'flex', height: 400 }}>
        {/* Left: List + Search */}
        <div
          style={{
            width: '28%',
            borderRight: '1px solid #eee',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Input.Search
            placeholder="Tìm asset..."
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            style={{ marginBottom: 12 }}
            size="small"
          />
          <List
            size="small"
            dataSource={filteredAssets}
            style={{ flex: 1, overflowY: 'auto' }}
            renderItem={(item, idx) => (
              <List.Item
                style={{
                  cursor: 'pointer',
                  background: idx === selectedIndex ? '#e6f4ff' : undefined,
                  borderRadius: 6,
                  marginBottom: 4,
                  padding: 6,
                }}
                onClick={() => setSelectedIndex(idx)}
              >
                <Image
                  src={item.url}
                  width={32}
                  height={32}
                  style={{ objectFit: 'cover', borderRadius: 4, marginRight: 8 }}
                  preview={false}
                  fallback="https://via.placeholder.com/32x32?text=No+Img"
                />
                <Typography.Text ellipsis style={{ maxWidth: 120 }}>
                  {item.name}
                </Typography.Text>
              </List.Item>
            )}
          />
        </div>
        {/* Right: Detail */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          {selected ? (
            <>
              <Image
                src={selected.url}
                width={260}
                height={260}
                style={{
                  objectFit: 'contain',
                  borderRadius: 12,
                  marginBottom: 16,
                  background: '#f6f6f6',
                }}
                preview={true}
                fallback="https://via.placeholder.com/260x260?text=No+Img"
              />
              <Typography.Title level={4} style={{ margin: 0 }}>
                {selected.name}
              </Typography.Title>
              <Typography.Text type="secondary">{selected.type}</Typography.Text>
            </>
          ) : (
            <Typography.Text type="secondary">Không có asset nào</Typography.Text>
          )}
        </div>
      </div>
    </Modal>
  );
}
