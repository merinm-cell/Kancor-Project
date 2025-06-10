import React from "react";
import "../App.css";

function About() {
  return (
    <div className="about-bg-wrapper">
      <div className="about-bg-image" />
      <div className="page-content">
        <h2 className="page-title">About Us</h2>
        <p className="page-text">
          {/* Add your about us text here */}
          Welcome to <span className="highlight">TEMP NEXUS</span>!<br />
          We are passionate about capturing and analyzing temperature data with cutting-edge technology.
        </p>
      </div>
    </div>
  );
}

export default About;