import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import IntelligencePage from './pages/IntelligencePage';
import AgentPage from './pages/AgentPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AgentPage />} />
      <Route path="/intelligence" element={<IntelligencePage />} />
    </Routes>
  );
};

export default App;