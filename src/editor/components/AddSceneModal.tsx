import React from 'react';
import { loadManifest } from '../api/manifest.api';
import { Modal, Space, Input, Button, Select, Switch } from 'antd';
import type { Scene } from '@/types/scene';
import { exactLocalized, type LocalizedText } from '@/i18n/localize';
import { useEditorLanguage, withEditorText } from '../editorLanguage';

/** `name` giữ nguyên cả bản song ngữ của scene tham chiếu; `text` / lựa chọn là chữ của ngôn ngữ đang soạn. */
export type SceneFormState = {
  name: LocalizedText;
  text: string;
  characters: {
    id: string;
    focus: boolean;
    pose?: string;
    position?: 'left' | 'center' | 'right';
  }[];
  bg: string;
  choices: { text: string; next?: string }[];
};

/** Form mặc định cho scene mới: kế thừa tên người nói, nhân vật, nền từ scene tham chiếu. */
export function formFromScene(scene?: Scene): SceneFormState {
  return {
    name: scene?.textbox?.name || '',
    text: '',
    characters: (scene?.char ?? []).slice(0, 2).map((character) => ({
      id: character.name,
      focus: !!character.focus,
      pose: character.pose,
      position: character.position,
    })),
    bg: scene?.bg || '',
    choices: [],
  };
}

export function sceneFromForm(id: string, form: SceneFormState): Scene {
  return {
    id,
    textbox: {
      name: form.name,
      text: withEditorText(null, form.text),
    },
    bg: form.bg,
    char: form.characters.length
      ? form.characters.map((character) => ({
          name: character.id,
          pose: character.pose ?? 'normal',
          position: character.position ?? 'center',
          focus: character.focus,
        }))
      : undefined,
    choices: form.choices.length
      ? form.choices.map((c) => ({
          text: withEditorText(null, c.text),
          next: c.next ?? '',
        }))
      : undefined,
  };
}

export type CharacterOption = {
  id: string;
  name: string;
};

type SceneNodeModalProps = {
  open: boolean;
  form: SceneFormState;
  setForm: React.Dispatch<React.SetStateAction<SceneFormState>>;
  onSubmit: () => void;
  onCancel: () => void;
};

export function AddSceneModal({ open, form, setForm, onSubmit, onCancel }: SceneNodeModalProps) {
  const [characterList, setCharacterList] = React.useState<CharacterOption[]>([]);
  const [bgList, setBgList] = React.useState<string[]>([]);
  const lang = useEditorLanguage((s) => s.language);
  React.useEffect(() => {
    loadManifest().then((data) => {
      if (Array.isArray(data.characters)) {
        setCharacterList(data.characters.map((c: any) => ({ id: c.id, name: c.name ?? c.id })));
      }
      if (Array.isArray(data.backgrounds)) {
        setBgList(data.backgrounds.map((b: any) => b.id));
      }
    });
  }, []);
  return (
    <Modal
      title="Thêm đoạn hội thoại"
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Space orientation="vertical" style={{ width: '100%' }} size={12}>
        {/* NAME */}
        <Input
          placeholder={`Tên (${lang.toUpperCase()})`}
          value={exactLocalized(form.name, lang)}
          onChange={(e) => setForm((f) => ({ ...f, name: withEditorText(f.name, e.target.value) }))}
        />

        {/* TEXT */}
        <Input.TextArea
          placeholder={`Nội dung thoại (${lang.toUpperCase()})`}
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
        />

        {/* CHARACTERS */}
        <div>
          <div style={{ fontWeight: 500 }}>Nhân vật</div>

          <Space orientation="vertical" style={{ width: '100%' }}>
            {form.characters.map((char, i) => (
              <Space key={i} style={{ width: '100%' }}>
                {/* select character */}
                <Select
                  style={{ minWidth: 180, maxWidth: 260 }}
                  placeholder="Chọn nhân vật"
                  value={char.id}
                  onChange={(val) =>
                    setForm((f) => {
                      const next = [...f.characters];
                      next[i].id = val;
                      return { ...f, characters: next };
                    })
                  }
                  options={characterList.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                />

                {/* focus toggle */}
                <Switch
                  checked={char.focus}
                  onChange={(checked) =>
                    setForm((f) => {
                      const next = [...f.characters];
                      next[i].focus = checked;
                      return { ...f, characters: next };
                    })
                  }
                />

                {/* remove */}
                <Button
                  danger
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      characters: f.characters.filter((_, idx) => idx !== i),
                    }))
                  }
                >
                  x
                </Button>
              </Space>
            ))}

            {form.characters.length < 2 && (
              <Button
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    characters: [...f.characters, { id: '', focus: false }],
                  }))
                }
              >
                + Thêm nhân vật
              </Button>
            )}
          </Space>
        </div>

        {/* BACKGROUND */}
        <div>
          <div style={{ fontWeight: 500 }}>Background</div>

          <Select
            style={{ width: '100%' }}
            placeholder="Chọn background"
            value={form.bg}
            onChange={(val) => setForm((f) => ({ ...f, bg: val }))}
            options={bgList.map((bg) => ({
              label: bg,
              value: bg,
            }))}
          />
        </div>

        {/* CHOICES */}
        <div>
          <div style={{ fontWeight: 500 }}>Lựa chọn</div>

          <Space orientation="vertical" style={{ width: '100%' }}>
            {form.choices.map((choice, i) => (
              <Space key={i} style={{ width: '100%' }}>
                <Input
                  placeholder="Nội dung lựa chọn"
                  value={choice.text}
                  onChange={(e) =>
                    setForm((f) => {
                      const next = [...f.choices];
                      next[i].text = e.target.value;
                      return { ...f, choices: next };
                    })
                  }
                />

                <Button
                  danger
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      choices: f.choices.filter((_, idx) => idx !== i),
                    }))
                  }
                >
                  x
                </Button>
              </Space>
            ))}

            <Button
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  choices: [...f.choices, { text: '' }],
                }))
              }
            >
              + Thêm lựa chọn
            </Button>
          </Space>
        </div>
      </Space>
    </Modal>
  );
}
