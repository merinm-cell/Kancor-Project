import React from "react";
import { useNavigate } from "react-router-dom";
import { FaInfoCircle, FaChartLine, FaHistory } from "react-icons/fa";
import "../index.css"; // Make sure hover & responsive styles are here

const NavIcons = () => {
  const navigate = useNavigate();
  const iconSize = 50;

  return (
    <div
      className="nav-icons-container"
      style={{
        display: "flex",
        gap: "60px",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "40px"
      }}
    >
      <div className="nav-icon" onClick={() => navigate("/about")}>
        <FaInfoCircle size={iconSize} />
        <span>About</span>
      </div>
      <div className="nav-icon" onClick={() => navigate("/graph")}>
        <FaChartLine size={iconSize} />
        <span>Graph</span>
      </div>
      <div className="nav-icon" onClick={() => navigate("/history")}>
        <FaHistory size={iconSize} />
        <span>History</span>
      </div>
    </div>
  );
};

export default NavIcons;
