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
            {/* Landing page matching Screenshot 2 */}
            <Route path="/" element={<LandingPage />} />

            {/* Room Join / Generate matching Screenshot 1 */}
            <Route path="/Collaborate" element={<Collaborate />} />
            <Route path="/collaborate" element={<Navigate to="/Collaborate" replace />} />

            {/* Live Collaborative Editor Room */}
            <Route path="/editor/:roomId" element={<EditorPage />} />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
