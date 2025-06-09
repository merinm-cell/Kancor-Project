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
        <div className="logo-title">
  <img src="/logoo.png" alt="logo" className="logo" />
  <h1 className="title">TEMP NEXUS</h1>
</div>

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

export default App;
