import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';

import { LandingPage } from './pages/LandingPage';
import { Collaborate } from './pages/Collaborate';
import { EditorPage } from './pages/EditorPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Landing page in Baby Pink */}
            <Route path="/" element={<LandingPage />} />

            {/* Room Lobby & Generator in Baby Pink */}
            <Route path="/Collaborate" element={<Collaborate />} />
            <Route path="/collaborate" element={<Navigate to="/Collaborate" replace />} />

            {/* Live Collaborative Editor Room with Lock & PIN */}
            <Route path="/editor/:roomId" element={<EditorPage />} />

            {/* Redirects */}
            <Route path="/dashboard" element={<Navigate to="/Collaborate" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
