import React from 'react';
import { loadManifest } from '../api/manifest.api';
import { Modal, Space, Button, Select, Switch } from 'antd';
import type { Scene } from '@/types/scene';
import { hasText, type LocalizedText } from '@/i18n/localize';
import { BilingualField } from './BilingualField';

/** Mọi chữ soạn song ngữ; `name` kế thừa cả bản song ngữ của scene tham chiếu. */
export type SceneFormState = {
  name: LocalizedText;
  text: LocalizedText;
  characters: {
    id: string;
    focus: boolean;
    pose?: string;
    position?: 'left' | 'center' | 'right';
  }[];
  bg: string;
  choices: { text: LocalizedText; next?: string }[];
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
      text: form.text,
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
          text: hasText(c.text) ? c.text : '',
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
        <BilingualField
          placeholder="Tên người nói"
          value={form.name}
          onChange={(name) => setForm((f) => ({ ...f, name }))}
        />

        {/* TEXT */}
        <BilingualField
          multiline
          placeholder="Nội dung thoại"
          value={form.text}
          onChange={(text) => setForm((f) => ({ ...f, text }))}
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
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <BilingualField
                  placeholder="Nội dung lựa chọn"
                  value={choice.text}
                  onChange={(text) =>
                    setForm((f) => ({
                      ...f,
                      choices: f.choices.map((c, idx) => (idx === i ? { ...c, text } : c)),
                    }))
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
              </div>
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
