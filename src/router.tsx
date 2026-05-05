import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Editor from './editor/Editor';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}
