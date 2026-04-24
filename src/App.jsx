import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import LogInteraction from './LogInteraction';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/log-interaction" element={<LogInteraction />} />
      </Routes>
    </Router>
  );
}

export default App;
