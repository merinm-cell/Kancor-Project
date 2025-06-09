import React from "react";

const Header = () => {
  return (
    <div
      className="header-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px"
      }}
    >
      <h1
        className="header-title"
        style={{
          fontSize: "3rem",
          color: "#ffffff",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
        }}
      >
        TEMP NEXUS
      </h1>

      <p
        className="header-quote"
        style={{
          fontSize: "1.2rem",
          color: "#dddddd",
          fontStyle: "italic",
          marginTop: "10px",
          textAlign: "center",
          maxWidth: "600px",
          textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
        }}
      >
        "Great things in business are never done by one person. They’re done by a team."
      </p>
    </div>
  );
};

export default Header;
