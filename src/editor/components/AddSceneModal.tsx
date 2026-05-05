import React from 'react';
import { loadManifest } from '../api/manifest.api';
import { Modal, Space, Input, Button, Select, Switch } from 'antd';

export type SceneFormState = {
  name: string;
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
        <Input
          placeholder="Tên"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />

        {/* TEXT */}
        <Input.TextArea
          placeholder="Nội dung thoại"
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
