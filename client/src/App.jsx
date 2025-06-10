import React, { useState } from "react";
import { FaUserFriends, FaChartLine, FaHistory } from "react-icons/fa";
import { FaSun, FaMoon } from "react-icons/fa";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import About from "./components/About";
import Graph from "./components/Graph";
import History from "./components/History";
import IotTempLogo from "./components/IotTempLogo";
import "./App.css";
import TemperatureHistory from "./componentsh/TemperatureHistory";


function Home({ darkMode, setDarkMode }) {
  return (
    <>
      {/* Background GIF */}
      <div className="background-gif" />

      {/* Top Header */}
      <div className="top-bar">
        <div className="logo-title">
          <IotTempLogo size={80} />
          <h1 className="title">TEMP NEXUS</h1>
        </div>
        <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun size={24} title="Switch to light mode" /> : <FaMoon size={24} title="Switch to dark mode" />}
        </button>
      </div>

      {/* Quote / Motto */}
      <div className="motto">
        <p className="quote floating-quote">
          Watching every degree<br />so you don't have to
        </p>
      </div>

      {/* Navigation Circles with Icons */}
      <div className="nav-circles">
        <Link to="/about" className="circle-link">
          <div className="circle">
            <FaUserFriends className="circle-icon" title="About Us" />
          </div>
        </Link>
        <Link to="/graph" className="circle-link">
          <div className="circle">
            <FaChartLine className="circle-icon" title="Graph" />
          </div>
        </Link>
        <Link to="/history" className="circle-link">
          <div className="circle">
            <FaHistory className="circle-icon" title="History" />
          </div>
        </Link>
      </div>
    </>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <Router>
      <div className={darkMode ? "app dark" : "app light"}>
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/about" element={<About />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;