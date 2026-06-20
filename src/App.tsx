import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { TripExperience } from '@/routes/TripExperience';
import { PlaneoView } from '@/routes/PlaneoView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* El regalo es el link secreto. Sin slug, mostramos el viaje demo. */}
        <Route path="/" element={<Navigate to="/viaje/demo" replace />} />
        <Route path="/viaje/:slug" element={<TripExperience />} />
        <Route path="/viaje/:slug/planeo" element={<PlaneoView />} />
        <Route path="*" element={<Navigate to="/viaje/demo" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
