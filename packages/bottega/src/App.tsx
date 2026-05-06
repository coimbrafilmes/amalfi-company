import { Routes, Route, Navigate } from 'react-router-dom';
import { AtelierPage } from './pages/AtelierPage';
import { CriacaoPage } from './pages/CriacaoPage';
import { CatalogoPage } from './pages/CatalogoPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/atelier" replace />} />
      <Route path="/atelier" element={<AtelierPage />} />
      <Route path="/novo" element={<CriacaoPage />} />
      <Route path="/catalogo" element={<CatalogoPage />} />
      <Route path="/configuracoes" element={<ConfiguracoesPage />} />
      <Route path="*" element={<Navigate to="/atelier" replace />} />
    </Routes>
  );
}

export default App;
