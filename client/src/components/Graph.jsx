import React from "react";
import "../App.css";

function About() {
  return (
    <div className="page-content">
      <h2 className="page-title">Graph</h2>
      <p className="page-text">
        {/* Add your about us text here */}
        Welcome to <span className="highlight">TEMP NEXUS</span>!<br />
        We are passionate about capturing and analyzing temperature data with cutting-edge technology.
      </p>
    </div>
  );
}

export default About;