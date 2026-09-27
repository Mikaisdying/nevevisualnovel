import { useEffect, useState } from 'react';
import { useGameStore, defaultSettings, type Settings } from '@/engine/store';
import { useUiStore } from '@/store/ui';
import { Panel, Slider, Tabs, Toggle, VnButton, type TabItem } from '@/components/ui';
import { LANGUAGES, useI18n } from '@/i18n';
import { ScreenShell } from './ScreenShell';

type SettingsTab = 'audio' | 'display' | 'text' | 'language' | 'controls';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold tracking-[0.14em] text-[var(--vn-muted)] uppercase">
      {children}
    </p>
  );
}

function useFullscreen() {
  const [on, setOn] = useState(() => !!document.fullscreenElement);
  useEffect(() => {
    const sync = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const toggle = (next: boolean) => {
    const req = next
      ? document.documentElement.requestFullscreen?.()
      : document.exitFullscreen?.();
    req?.catch((error) => console.warn('Fullscreen not available:', error));
  };
  return [on, toggle] as const;
}

/**
 * Figma: "03 Settings" — sidebar tab + panel, chỉnh trên bản nháp, "Áp dụng" mới lưu.
 * Riêng Ngôn ngữ áp dụng ngay (giống nút VI/EN ở màn tiêu đề).
 */
export default function SettingsScreen() {
  const saved = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const back = useUiStore((s) => s.back);
  const askConfirm = useUiStore((s) => s.askConfirm);
  const showNotice = useUiStore((s) => s.showNotice);
  const [tab, setTab] = useState<SettingsTab>('audio');
  const [draft, setDraft] = useState<Settings>(saved);
  const [fullscreen, setFullscreen] = useFullscreen();
  const { t, lang, setLanguage } = useI18n();

  const tabs: TabItem<SettingsTab>[] = [
    { id: 'audio', label: t.settings.tabAudio },
    { id: 'display', label: t.settings.tabDisplay },
    { id: 'text', label: t.settings.tabText },
    { id: 'language', label: t.settings.tabLanguage },
    { id: 'controls', label: t.settings.tabControls },
  ];

  const dirty = (Object.keys(draft) as (keyof Settings)[]).some((k) => draft[k] !== saved[k]);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleBack = () => {
    if (!dirty) return back();
    askConfirm({
      title: t.settings.discardTitle,
      description: t.settings.discardDescription,
      confirmLabel: t.settings.discard,
      onConfirm: back,
    });
  };

  const apply = () => {
    updateSettings(draft);
    showNotice({ title: t.settings.applied, description: t.settings.appliedDescription });
  };

  return (
    <ScreenShell title={t.settings.title} onBack={handleBack}>
      <Tabs
        items={tabs}
        value={tab}
        onChange={setTab}
        variant="side"
        className="absolute top-[200px] left-[60px] w-[220px]"
      />

      <Panel className="absolute top-[176px] left-[320px] h-[500px] w-[900px] px-[48px] py-[40px]">
        {tab === 'audio' && (
          <div className="flex flex-col gap-[18px]">
            <SectionTitle>{t.settings.volume}</SectionTitle>
            <Slider label={t.settings.masterVolume} value={draft.masterVolume} onChange={(v) => set('masterVolume', v)} />
            <Slider label={t.settings.bgmVolume} value={draft.bgmVolume} onChange={(v) => set('bgmVolume', v)} />
            <Slider label={t.settings.sfxVolume} value={draft.sfxVolume} onChange={(v) => set('sfxVolume', v)} />
            <Slider label={t.settings.voiceVolume} value={draft.voiceVolume} onChange={(v) => set('voiceVolume', v)} />
          </div>
        )}

        {tab === 'display' && (
          <div className="flex flex-col gap-[18px]">
            <SectionTitle>{t.settings.screen}</SectionTitle>
            <Toggle label={t.settings.fullscreen} checked={fullscreen} onChange={setFullscreen} />
            <SectionTitle>{t.settings.dialogueBox}</SectionTitle>
            <Slider
              label={t.settings.dialogueOpacity}
              min={30}
              value={draft.dialogueOpacity}
              onChange={(v) => set('dialogueOpacity', v)}
            />
          </div>
        )}

        {tab === 'text' && (
          <div className="flex flex-col gap-[18px]">
            <SectionTitle>{t.settings.text}</SectionTitle>
            <Slider label={t.settings.textSpeed} value={draft.textSpeed} onChange={(v) => set('textSpeed', v)} />
            <Slider label={t.settings.autoSpeed} value={draft.autoSpeed} onChange={(v) => set('autoSpeed', v)} />
            <Toggle
              label={t.settings.skipUnread}
              checked={draft.skipUnread}
              onChange={(v) => set('skipUnread', v)}
            />
          </div>
        )}

        {tab === 'language' && (
          <div className="flex flex-col gap-[18px]">
            <SectionTitle>{t.settings.language}</SectionTitle>
            <Tabs
              variant="segment"
              items={LANGUAGES.map((l) => ({ id: l.id, label: l.label }))}
              value={lang}
              onChange={setLanguage}
              className="self-start"
            />
            <p className="max-w-[640px] text-[14px] leading-[1.6] text-[var(--vn-muted)]">
              {t.settings.languageHint}
            </p>
          </div>
        )}

        {tab === 'controls' && (
          <div className="flex flex-col gap-[18px]">
            <SectionTitle>{t.settings.shortcuts}</SectionTitle>
            {t.settings.controls.map(([key, action]) => (
              <div key={key} className="flex items-center gap-[20px] text-[16px]">
                <span className="w-[260px] shrink-0 text-[var(--vn-gold)]">{key}</span>
                <span className="text-[var(--vn-muted)]">{action}</span>
              </div>
            ))}
          </div>
        )}

        <div className="absolute right-[24px] bottom-[24px] flex gap-[12px]">
          <VnButton variant="secondary" onClick={() => setDraft(defaultSettings)}>
            {t.settings.defaults}
          </VnButton>
          <VnButton variant="primary" disabled={!dirty} onClick={apply}>
            {t.settings.apply}
          </VnButton>
        </div>
      </Panel>
    </ScreenShell>
  );
}
