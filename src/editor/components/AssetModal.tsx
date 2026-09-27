import { Modal, List, Typography, Image, Input, Tabs, Button, message, Tag } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAssetsByType, uploadAsset, type Asset, type AssetType } from '../api/asset.api';

type AssetModalProps = {
  open: boolean;
  onCancel: () => void;
  initialType?: AssetType;
};

const TYPE_LABEL: Record<AssetType, string> = {
  bg: 'Backgrounds',
  char: 'Characters',
  cg: 'CG',
  audio: 'Audio',
};

export default function AssetModal({ open, onCancel, initialType = 'bg' }: AssetModalProps) {
  const [activeType, setActiveType] = useState<AssetType>(initialType);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [characterId, setCharacterId] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setActiveType(initialType);
  }, [open, initialType]);

  const loadAssets = async (type: AssetType) => {
    setLoading(true);
    try {
      const data = await getAssetsByType(type);
      setAssets(data);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Failed to load assets:', error);
      message.error('Không tải được danh sách asset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadAssets(activeType);
  }, [open, activeType]);

  const filteredAssets = useMemo(
    () => assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase())),
    [assets, search],
  );
  const selected = filteredAssets[selectedIndex] ?? filteredAssets[0];

  const handlePickFile = () => {
    if (activeType === 'char' && !characterId.trim()) {
      message.warning('Nhập Character ID trước khi tải ảnh lên');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      await uploadAsset(file, activeType, activeType === 'char' ? characterId.trim() : undefined);
      message.success('Tải lên thành công');
      await loadAssets(activeType);
    } catch (error) {
      console.error('Failed to upload asset:', error);
      message.error(error instanceof Error ? error.message : 'Tải lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title={<span style={{ fontWeight: 600, fontSize: 16 }}>Assets</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={760}
      style={{ padding: 0, minHeight: 460 }}
    >
      <Tabs
        activeKey={activeType}
        onChange={(key) => setActiveType(key as AssetType)}
        items={(Object.keys(TYPE_LABEL) as AssetType[]).map((type) => ({
          key: type,
          label: TYPE_LABEL[type],
        }))}
        style={{ marginBottom: 8 }}
      />

      <div style={{ display: 'flex', height: 400 }}>
        {/* Left: List + Search + Upload */}
        <div
          style={{
            width: '32%',
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
            loading={loading}
            dataSource={filteredAssets}
            style={{ flex: 1, overflowY: 'auto' }}
            locale={{ emptyText: 'Chưa có asset nào' }}
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
                {item.type !== 'audio' && (
                  <Image
                    src={item.url}
                    width={32}
                    height={32}
                    style={{ objectFit: 'cover', borderRadius: 4, marginRight: 8 }}
                    preview={false}
                    fallback="https://via.placeholder.com/32x32?text=No+Img"
                  />
                )}
                <Typography.Text ellipsis style={{ maxWidth: 140 }}>
                  {item.name}
                </Typography.Text>
              </List.Item>
            )}
          />

          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeType === 'char' && (
              <Input
                placeholder="Character ID (vd: ame)"
                size="small"
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value)}
              />
            )}
            <Button
              icon={<UploadOutlined />}
              size="small"
              loading={uploading}
              onClick={handlePickFile}
              block
            >
              Tải lên
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={activeType === 'audio' ? 'audio/*' : 'image/*'}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
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
            padding: 16,
          }}
        >
          {selected ? (
            <>
              {selected.type === 'audio' ? (
                <audio controls src={selected.url} style={{ width: '80%', marginBottom: 16 }} />
              ) : (
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
              )}
              <Typography.Title level={4} style={{ margin: 0 }}>
                {selected.name}
              </Typography.Title>
              <Typography.Text type="secondary">{TYPE_LABEL[selected.type]}</Typography.Text>
              {selected.characterId && <Tag style={{ marginTop: 8 }}>{selected.characterId}</Tag>}
            </>
          ) : (
            <Typography.Text type="secondary">Không có asset nào</Typography.Text>
          )}
        </div>
      </div>
    </Modal>
  );
}
