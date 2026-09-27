import { useTopPanel } from '@/store/ui';
import LibraryScreen from '@/components/screens/LibraryScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';
import SaveLoadScreen from '@/components/screens/SaveLoadScreen';
import PauseMenu from './PauseMenu';
import Backlog from './Backlog';
import CgViewer from './CgViewer';

/** Hiển thị panel trên cùng của ngăn xếp useUiStore().panels. */
export default function PanelHost() {
  const panel = useTopPanel();
  if (!panel) return null;

  switch (panel.type) {
    case 'library':
      return <LibraryScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'save':
    case 'load':
      return <SaveLoadScreen key={panel.type} mode={panel.type} />;
    case 'pause':
      return <PauseMenu />;
    case 'backlog':
      return <Backlog />;
    case 'cg':
      return <CgViewer id={panel.id} />;
  }
}
