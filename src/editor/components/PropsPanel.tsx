import { Form, Input, Select, Typography, Button, Space, Checkbox, Divider, Tooltip } from 'antd';
import { CloseOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import type { Scene, CharacterPosition } from '@/types/scene';
import { loadManifest } from '../api/manifest.api';
import { loadStoryline, saveStoryline } from '../api/story.api';

const { TextArea } = Input;

type Character = {
  id: string;
  name?: string;
  pose?: string;
  position?: CharacterPosition;
  focus?: boolean;
};
type Choice = { id: string; text?: string; next?: string };

const sectionLabel = (text: string) => (
  <span
    style={{
      fontWeight: 500,
      letterSpacing: '0.06em',
      color: 'var(--color-text-tertiary)',
    }}
  >
    {text}
  </span>
);

export default function PropsPanel({
  scene,
  onSceneUpdated,
}: {
  scene: Scene | null;
  onSceneUpdated?: (scene: Scene) => void;
}) {
  const [bg, setBg] = useState<string | undefined>(undefined);
  const [speaker, setSpeaker] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [draggingCharId, setDraggingCharId] = useState<string | null>(null);

  const [sceneOptions, setSceneOptions] = useState<{ id: string; label: string }[]>([]);

  const [backgroundOptions, setBackgroundOptions] = useState<{ id: string; name: string }[]>([]);
  const [characterOptions, setCharacterOptions] = useState<
    { id: string; name: string; poses: string[] }[]
  >([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadManifest();
        setBackgroundOptions(
          Array.isArray(data.backgrounds)
            ? data.backgrounds.map((b: any) => ({ id: b.id, name: b.name ?? b.id }))
            : [],
        );
        setCharacterOptions(
          Array.isArray(data.characters)
            ? data.characters.map((c: any) => ({
                id: c.id,
                name: c.name ?? c.id,
                poses: Array.isArray(c.poses) && c.poses.length > 0 ? c.poses : ['normal'],
              }))
            : [],
        );

        const storyline = await loadStoryline();
        if (Array.isArray(storyline)) {
          setSceneOptions(
            (storyline as Scene[]).map((s) => ({
              id: s.id,
              label: s.id,
            })),
          );
        }
      } catch (e) {
        console.error('Failed to load manifest:', e);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!scene) {
      setBg(undefined);
      setSpeaker('');
      setText('');
      setCharacters([]);
      setChoices([]);
      return;
    }

    setBg(scene.bg);
    setSpeaker(scene.textbox?.name ?? '');
    setText(scene.textbox?.text ?? '');

    setCharacters(
      scene.char
        ? scene.char.map((c) => ({
            id: crypto.randomUUID(),
            name: c.name,
            pose: c.pose,
            position: c.position,
            focus: c.focus,
          }))
        : [],
    );

    setChoices(
      scene.choices
        ? scene.choices.map((c) => ({
            id: crypto.randomUUID(),
            text: c.text ?? undefined,
            next: c.next,
          }))
        : [],
    );
  }, [scene]);

  const addCharacter = () => {
    if (characters.length >= 2) return;
    setCharacters([...characters, { id: crypto.randomUUID(), focus: true }]);
  };
  const removeCharacter = (id: string) => setCharacters((p) => p.filter((c) => c.id !== id));
  const updateCharacter = (id: string, key: keyof Character, value: any) =>
    setCharacters((p) => p.map((c) => (c.id === id ? { ...c, [key]: value } : c)));

  const addChoice = () => {
    if (choices.length >= 4) return;
    setChoices([...choices, { id: crypto.randomUUID() }]);
  };
  const removeChoice = (id: string) => setChoices((p) => p.filter((c) => c.id !== id));

  // Lưu scene vào backend
  const handleSave = async () => {
    if (!scene) return;
    // Lấy toàn bộ storyline hiện tại
    const storyline = await loadStoryline();
    if (!Array.isArray(storyline)) return;

    // Tạo scene mới từ state
    const newScene: Scene = {
      ...scene,
      bg,
      textbox: { name: speaker, text },
      char: characters.map((c) => ({
        name: c.name ?? '',
        pose: c.pose ?? 'normal',
        position: c.position ?? 'center',
        focus: c.focus,
      })),
      choices: choices.map((c) => ({
        text: c.text === undefined || c.text === '' ? null : c.text,
        next: c.next ?? '',
      })),
    };

    // Ghi đè scene theo id
    const idx = storyline.findIndex((s) => s.id === scene.id);
    let newStoryline;
    if (idx !== -1) {
      newStoryline = [...storyline];
      newStoryline[idx] = newScene;
    } else {
      newStoryline = [...storyline, newScene];
    }
    await saveStoryline(newStoryline);
    onSceneUpdated?.(newScene);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* ── Header ── */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <Typography.Text
          style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', letterSpacing: '0.02em' }}
        >
          Properties
        </Typography.Text>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
        <Form layout="vertical" size="small">
          {/* Background */}
          <Form.Item
            label={sectionLabel('Background')}
            style={{ marginBottom: 20 }}
            labelCol={{ style: { paddingBottom: 2 } }}
          >
            <Select
              placeholder="Chọn background"
              allowClear
              style={{ width: '100%' }}
              value={bg}
              onChange={(val) => setBg(val)}
            >
              {backgroundOptions.map((b) => (
                <Select.Option key={b.id} value={b.id}>
                  {b.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider style={{ margin: '0 0 20px', borderColor: '#f0f0f0' }} />

          {/* Hộp hội thoại */}
          <Form.Item
            label={sectionLabel('Dialogue')}
            style={{ marginBottom: 20 }}
            labelCol={{ style: { paddingBottom: 2 } }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Input
                placeholder="Tên nhân vật..."
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
              />
              <TextArea
                rows={2}
                placeholder="Nội dung hội thoại..."
                style={{ resize: 'vertical' }}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </Form.Item>

          <Divider style={{ margin: '0 0 20px', borderColor: '#f0f0f0' }} />

          {/* Nhân vật */}
          <Form.Item
            label={sectionLabel('Character')}
            style={{ marginBottom: 20 }}
            labelCol={{ style: { paddingBottom: 2 } }}
          >
            <Space orientation="vertical" style={{ width: '100%' }} size={8}>
              {characters.map((char) => (
                <div
                  key={char.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '6px 10px',
                    cursor: characters.length === 2 ? 'grab' : 'default',
                  }}
                  draggable={characters.length === 2}
                  onDragStart={() => setDraggingCharId(char.id)}
                  onDragOver={(e) => {
                    if (characters.length !== 2) return;
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    if (!draggingCharId || draggingCharId === char.id) return;
                    e.preventDefault();
                    setCharacters((prev) => {
                      const fromIndex = prev.findIndex((c) => c.id === draggingCharId);
                      const toIndex = prev.findIndex((c) => c.id === char.id);
                      if (fromIndex === -1 || toIndex === -1) return prev;
                      const next = [...prev];
                      const [moved] = next.splice(fromIndex, 1);
                      next.splice(toIndex, 0, moved);
                      return next;
                    });
                    setDraggingCharId(null);
                  }}
                  onDragEnd={() => setDraggingCharId(null)}
                >
                  {/* Character select */}
                  <Select
                    style={{ flex: 1 }}
                    placeholder="Chọn nhân vật"
                    size="small"
                    variant="borderless"
                    value={char.name}
                    onChange={(val) => updateCharacter(char.id, 'name', val)}
                  >
                    {characterOptions.map((c) => (
                      <Select.Option key={c.id} value={c.id}>
                        {c.name}
                      </Select.Option>
                    ))}
                  </Select>

                  {/* Pose select */}
                  <Select
                    style={{ width: 120 }}
                    placeholder="Pose"
                    size="small"
                    variant="borderless"
                    value={char.pose}
                    onChange={(val) => updateCharacter(char.id, 'pose', val)}
                  >
                    {(characterOptions.find((c) => c.id === char.name)?.poses ?? ['normal']).map(
                      (pose) => (
                        <Select.Option key={pose} value={pose}>
                          {pose}
                        </Select.Option>
                      ),
                    )}
                  </Select>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Checkbox
                      checked={char.focus}
                      onChange={(e) => updateCharacter(char.id, 'focus', e.target.checked)}
                    />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>focus</span>
                  </div>

                  <CloseOutlined
                    style={{ fontSize: 10, color: '#cbd5e1', cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => removeCharacter(char.id)}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#f87171')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#cbd5e1')}
                  />
                </div>
              ))}
              {characters.length < 2 && (
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={addCharacter}
                  block
                  type="dashed"
                  style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                >
                  Thêm nhân vật
                </Button>
              )}
            </Space>
          </Form.Item>

          <Divider style={{ margin: '0 0 20px', borderColor: '#f0f0f0' }} />

          {/* Choices */}
          <Form.Item label={sectionLabel('Lựa chọn')} style={{ marginBottom: 20 }}>
            <Space orientation="vertical" style={{ width: '100%' }} size={8}>
              {choices.map((choice, i) => (
                <div
                  key={choice.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '6px 10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: '#94a3b8',
                        fontWeight: 600,
                        minWidth: 14,
                      }}
                    >
                      {i + 1}
                    </span>
                    <Input
                      size="middle"
                      variant="borderless"
                      style={{ flex: 1, padding: 0 }}
                      placeholder="Nội dung lựa chọn..."
                      value={choice.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChoices((p) =>
                          p.map((c) => (c.id === choice.id ? { ...c, text: val } : c)),
                        );
                      }}
                    />
                    <CloseOutlined
                      style={{
                        fontSize: 10,
                        color: '#cbd5e1',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      onClick={() => removeChoice(choice.id)}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = '#f87171')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = '#cbd5e1')
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      paddingLeft: 18,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: '#94a3b8',
                        minWidth: 60,
                      }}
                    >
                      Cảnh kế
                    </span>
                    <Select
                      size="small"
                      variant="borderless"
                      style={{
                        minWidth: 140,
                        maxWidth: 180,
                        background: 'transparent',
                        color: '#6d7d94',
                        fontSize: 12,
                      }}
                      placeholder="Cảnh tiếp theo"
                      value={choice.next}
                      onChange={(val) => {
                        setChoices((p) =>
                          p.map((c) => (c.id === choice.id ? { ...c, next: val } : c)),
                        );
                      }}
                      showSearch
                    >
                      {sceneOptions.map((s) => (
                        <Select.Option key={s.id} value={s.id}>
                          {s.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              ))}
              {choices.length < 4 && (
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={addChoice}
                  block
                  type="dashed"
                  style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                >
                  Thêm lựa chọn
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </div>

      <Divider style={{ margin: '0 0 20px', borderColor: '#f0f0f0' }} />

      {/* ── Footer ── */}
      <div
        style={{
          flexShrink: 0,
          borderTop: '1px solid #f0f0f0',
          padding: '12px 20px',
          display: 'flex',
          gap: 8,
          background: '#fff',
        }}
      >
        <Tooltip title="Phục hồi">
          <Button icon={<ReloadOutlined />} style={{ flexShrink: 0 }} />
        </Tooltip>

        <Button type="primary" style={{ flex: 1 }} onClick={handleSave}>
          Lưu
        </Button>
      </div>
    </div>
  );
}
