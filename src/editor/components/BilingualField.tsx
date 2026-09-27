import React from 'react';
import { Input } from 'antd';
import { exactLocalized, setLocalized, type Language, type LocalizedText } from '@/i18n/localize';
import { EDITOR_PRIMARY, EDITOR_SECONDARY } from '../editorLanguage';

type RenderInput = (props: {
  lang: Language;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}) => React.ReactNode;

type BilingualFieldProps = {
  value: LocalizedText | null | undefined;
  onChange: (value: LocalizedText) => void;
  placeholder?: string;
  multiline?: boolean;
  /** Thay ô nhập mặc định (vd AutoComplete cho tên người nói). */
  renderInput?: RenderInput;
};

const LangTag = ({ lang }: { lang: Language }) => (
  <span
    style={{
      fontSize: 10,
      fontWeight: 600,
      color: lang === EDITOR_PRIMARY ? '#2563eb' : '#94a3b8',
      minWidth: 18,
      paddingTop: 6,
      flexShrink: 0,
    }}
  >
    {lang.toUpperCase()}
  </span>
);

/** Soạn song song tiếng Việt và tiếng Anh; bỏ trống tiếng Anh thì game hiện tiếng Việt. */
export function BilingualField({
  value,
  onChange,
  placeholder = '',
  multiline,
  renderInput,
}: BilingualFieldProps) {
  const row = (lang: Language) => {
    const text = exactLocalized(value, lang);
    const handle = (next: string) => onChange(setLocalized(value, lang, next));
    const hint = lang === EDITOR_PRIMARY ? placeholder : 'English (để trống = dùng tiếng Việt)';
    let input: React.ReactNode;
    if (renderInput) {
      input = renderInput({ lang, value: text, onChange: handle, placeholder: hint });
    } else if (multiline) {
      input = (
        <Input.TextArea
          rows={2}
          style={{ resize: 'vertical' }}
          placeholder={hint}
          value={text}
          onChange={(e) => handle(e.target.value)}
        />
      );
    } else {
      input = <Input placeholder={hint} value={text} onChange={(e) => handle(e.target.value)} />;
    }
    return (
      <div key={lang} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <LangTag lang={lang} />
        <div style={{ flex: 1, minWidth: 0 }}>{input}</div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {row(EDITOR_PRIMARY)}
      {row(EDITOR_SECONDARY)}
    </div>
  );
}
