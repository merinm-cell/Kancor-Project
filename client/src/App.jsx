import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './pages/About';
import Graph from './pages/Graph';
import History from './pages/History';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/graph" element={<Graph />} />
      <Route path="/history" element={<History />} />
    </Routes>
  </Router>
);

export default App;
