import {
  Form,
  Input,
  Select,
  AutoComplete,
  Typography,
  Button,
  Space,
  Checkbox,
  Divider,
  Tooltip,
  Segmented,
  message,
} from 'antd';
import { CloseOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import type { Scene, CharacterPosition } from '@/types/scene';
import { loadManifest } from '../api/manifest.api';
import { loadStoryline, saveStoryline } from '../api/story.api';
import { useEditorLanguage } from '../editorLanguage';
import {
  LANGUAGES,
  exactLocalized,
  hasText,
  localize,
  setLocalized,
  type Language,
  type LocalizedText,
} from '@/i18n/localize';

const { TextArea } = Input;

type Character = {
  id: string;
  name?: string;
  pose?: string;
  position?: CharacterPosition;
  focus?: boolean;
};
type Choice = { id: string; text?: LocalizedText; next?: string };

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
  const [cg, setCg] = useState<string | undefined>(undefined);
  // Giữ nguyên bản song ngữ; ô nhập chỉ đọc-ghi bản dịch của ngôn ngữ đang soạn.
  const [speaker, setSpeaker] = useState<LocalizedText>('');
  const [text, setText] = useState<LocalizedText>('');
  const editLang = useEditorLanguage((s) => s.language);
  const setEditLang = useEditorLanguage((s) => s.setLanguage);
  const otherLang: Language = LANGUAGES.find((l) => l.id !== editLang)!.id;
  /** Gợi ý trong ô trống: bản dịch ngôn ngữ còn lại để người soạn dịch theo. */
  const hint = (value: LocalizedText | undefined, fallback: string) => {
    const other = exactLocalized(value, otherLang);
    return other ? `${otherLang.toUpperCase()}: ${other}` : fallback;
  };
  const [characters, setCharacters] = useState<Character[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [draggingCharId, setDraggingCharId] = useState<string | null>(null);

  const [sceneOptions, setSceneOptions] = useState<{ id: string; label: string }[]>([]);

  const [backgroundOptions, setBackgroundOptions] = useState<{ id: string; name: string }[]>([]);
  const [cgOptions, setCgOptions] = useState<{ id: string; name: string }[]>([]);
  const [characterOptions, setCharacterOptions] = useState<
    { id: string; name: string; poses: string[] }[]
  >([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadManifest();
        setBackgroundOptions(
          Array.isArray(data.backgrounds)
            ? data.backgrounds.map((b: any) => ({ id: b.id, name: localize(b.name, editLang) || b.id }))
            : [],
        );
        setCgOptions(
          Array.isArray(data.cgs)
            ? data.cgs.map((c: any) => ({ id: c.id, name: localize(c.name, editLang) || c.id }))
            : [],
        );
        setCharacterOptions(
          Array.isArray(data.characters)
            ? data.characters.map((c: any) => ({
                id: c.id,
                name: localize(c.name, editLang) || c.id,
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
  }, [editLang]);

  const syncFromScene = (source: Scene | null) => {
    if (!source) {
      setBg(undefined);
      setCg(undefined);
      setSpeaker('');
      setText('');
      setCharacters([]);
      setChoices([]);
      return;
    }

    setBg(source.bg);
    setCg(source.cg);
    setSpeaker(source.textbox?.name ?? '');
    setText(source.textbox?.text ?? '');

    setCharacters(
      source.char
        ? source.char.map((c) => ({
            id: crypto.randomUUID(),
            name: c.name,
            pose: c.pose,
            position: c.position,
            focus: c.focus,
          }))
        : [],
    );

    setChoices(
      source.choices
        ? source.choices.map((c) => ({
            id: crypto.randomUUID(),
            text: c.text ?? undefined,
            next: c.next,
          }))
        : [],
    );
  };

  useEffect(() => {
    syncFromScene(scene);
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
    try {
      await saveScene(scene);
    } catch (error) {
      console.error('Failed to save scene:', error);
      message.error(`Chưa lưu được scene: ${(error as Error).message}`);
    }
  };

  const saveScene = async (scene: Scene) => {
    // Lấy toàn bộ storyline hiện tại
    const storyline = await loadStoryline();
    if (!Array.isArray(storyline)) return;

    // Tạo scene mới từ state
    const newScene: Scene = {
      ...scene,
      bg,
      cg,
      textbox: { name: hasText(speaker) ? speaker : '', text },
      char: characters.map((c) => ({
        name: c.name ?? '',
        pose: c.pose ?? 'normal',
        position: c.position ?? 'center',
        focus: c.focus,
      })),
      choices: choices.map((c) => ({
        text: hasText(c.text) ? c.text! : null,
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
          {scene?.id ?? 'Properties'}
        </Typography.Text>
        <Tooltip title="Ngôn ngữ đang soạn: thoại, tên người nói và lựa chọn">
          <Segmented
            size="small"
            style={{ float: 'right' }}
            value={editLang}
            onChange={(v) => setEditLang(v as Language)}
            options={LANGUAGES.map((l) => ({ value: l.id, label: l.short }))}
          />
        </Tooltip>
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

          {/* CG */}
          <Form.Item
            label={sectionLabel('CG (tuỳ chọn)')}
            style={{ marginBottom: 20 }}
            labelCol={{ style: { paddingBottom: 2 } }}
            extra="Khi chọn, CG sẽ thay thế background/nhân vật và được mở khoá trong Library."
          >
            <Select
              placeholder="Không dùng CG"
              allowClear
              style={{ width: '100%' }}
              value={cg}
              onChange={(val) => setCg(val)}
            >
              {cgOptions.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
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
              <AutoComplete
                value={exactLocalized(speaker, editLang)}
                onChange={(val) => setSpeaker((s) => setLocalized(s, editLang, val ?? ''))}
                allowClear
                style={{ width: '100%' }}
                placeholder={hint(speaker, 'Tên người nói... (để trống = không hiện bảng tên)')}
                options={[
                  { value: '', label: '— Không hiện bảng tên (người kể chuyện) —' },
                  { value: '?', label: '? (Danh tính chưa rõ)' },
                  { value: 'Unknown', label: 'Unknown (Danh tính chưa rõ)' },
                  ...characterOptions.map((c) => ({ value: c.name, label: c.name })),
                ]}
                filterOption={(inputValue, option) =>
                  (option?.label as string).toLowerCase().includes(inputValue.toLowerCase())
                }
              />
              <TextArea
                rows={2}
                placeholder={hint(text, 'Nội dung hội thoại...')}
                style={{ resize: 'vertical' }}
                value={exactLocalized(text, editLang)}
                onChange={(e) => {
                  const val = e.target.value;
                  setText((t) => setLocalized(t, editLang, val));
                }}
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
                      placeholder={hint(choice.text, 'Nội dung lựa chọn...')}
                      value={exactLocalized(choice.text, editLang)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChoices((p) =>
                          p.map((c) =>
                            c.id === choice.id ? { ...c, text: setLocalized(c.text, editLang, val) } : c,
                          ),
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
          <Button
            icon={<ReloadOutlined />}
            style={{ flexShrink: 0 }}
            onClick={() => syncFromScene(scene)}
          />
        </Tooltip>

        <Button type="primary" style={{ flex: 1 }} onClick={handleSave}>
          Lưu
        </Button>
      </div>
    </div>
  );
}
