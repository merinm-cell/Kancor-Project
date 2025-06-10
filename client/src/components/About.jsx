import React, { useState, useEffect } from "react";
import "../App.css";
import logoo from "../assets/logo.png";
import mk3 from "../assets/mk3.jpg";

const sections = {
  "ABOUT US": {
    heading: "ABOUT US",
    text: `Mane Kancor Ingredients Private Limited is a pioneer in Global Spice Extraction, whose roots can be traced back to 1857 Cochin. Mane Kancor specialises in complete natural food ingredient solutions from sustainable sourcing of raw materials, clean extracts, advanced research, and formulation. Mane Kancor has a presence in over 100 countries, regional distribution centres worldwide, and multi-locational factories in India.
The formula for the company’s success lies in its sense of unyielding commitment to excellence. With its global sourcing programmes, Mane Kancor makes sure to work closely with the farmers to enrich their work and livelihoods.
Our specialisations include a full range of Oleoresins, Essential oils, Floral extracts, Natural antioxidants, Natural Colours, Culinary ingredients, Delivery platforms, and Organic Ingredients. Every product adheres to global standards, and Mane Kancor is certified with FSSC 22000, ISO 9001, ISO 14001, ISO 45001, ISO 50001, HACCP & GMP, RSPO & FAMI – QS.
Our Products are also certified for Halal, Kosher, and Organic (NPOP, NOP & EOS). Mane Kancor has also partnered with SEDEX as an ethical and responsible supplier.
Mane Kancor’s labs are equipped with sophisticated equipment to meet the current food safety requirements and are accredited by NABL.`
  },
  "PROJECT OVERVIEW": {
    heading: "PROJECT OVERVIEW",
    text: `The Industrial Temperature Monitoring and Graphing System is an IoT-based solution designed to monitor and visualize environmental temperature in real time. The system continuously reads temperature data using a sensor connected to an ESP32 microcontroller and transmits this data to a backend server using WebSocket technology.
The backend processes and stores the data securely in a lightweight database, while a dynamic frontend displays live temperature updates as an interactive line graph. When temperature values fall below or rise above the safe range (7°C to 10°C), the system immediately sends an alert email to notify the concerned personnel.
This solution is especially useful for industries such as food storage, pharmaceuticals, and laboratories, where maintaining a controlled environment is critical. It offers:
• Real-time monitoring
• Live data graphing (Temperature vs Time)
• Automatic email alerts for abnormal readings
• Secure and efficient data handling
• Web deployment for remote access
The project is lightweight, cost-effective, and built using open-source technologies like ESP32, FastAPI, SQLite, and React. It demonstrates how IoT and modern web tools can come together to solve practical industrial problems efficiently.`
  },
  "OUR TEAM": {
    heading: "OUR TEAM",
    text: `
•Fathima Amrin
•Merin M Prakash
•Nora Antu
•Sandra Santhosh Kumar`
  },
  "CONTACT US": {
    heading: "CONTACT US",
    text: `
E-mail: fathimaamrin2003@gmail.com
Phone: +91 9995877250`
  },
};

function About() {
  const [activeSection, setActiveSection] = useState("ABOUT US");
  const [fadeImage, setFadeImage] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setFadeImage(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { heading, text } = sections[activeSection];

  return (
    <div className="about-page">
      {/* Banner image with logo at lower left corner */}
      <div className="about-banner-row">
        <div className={`mk3-banner-new ${fadeImage ? "fade-out" : ""}`}>
          <img src={mk3} alt="Main" className="mk3-full-new" />
          <img
            src={logoo}
            alt="Logo"
            className="vertical-logo logo-over-mk3"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="content-section">
        <div className="sidebar">
          {Object.keys(sections).map((section) => (
            <button
              key={section}
              className={`sidebar-button ${activeSection === section ? "active" : ""}`}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="text-section">
          <h2 className="section-heading">{heading}</h2>
          <p className="section-text" style={{ whiteSpace: "pre-line" }}>{text}</p>
        </div>
      </div>
    </div>
  );
}

export default About;