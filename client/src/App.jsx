<<<<<<< HEAD
import React, { useState } from "react";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={darkMode ? "app dark" : "app light"}>
      {/* Background GIF */}
      <div className="background-gif" />

      {/* Top Header */}
      <div className="top-bar">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="title">TEMP NEXUS</h1>
        <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "light mode" : "night mode"}
        </button>
      </div>

      {/* Quote / Motto */}
      <div className="motto">
        <p className="quote">“We Capture What Moves”</p>
      </div>

      {/* Navigation Circles */}
      <div className="nav-circles">
        <div className="circle" onClick={() => window.location.href = "/about"} />
        <div className="circle" onClick={() => window.location.href = "/graph"} />
        <div className="circle" onClick={() => window.location.href = "/history"} />
      </div>
    </div>
  );
}

=======
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

>>>>>>> 0b098a8fa5321edf2a31aba99bd08be7dcdcca3e
export default App;
