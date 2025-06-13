import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css"; 

function History() {
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    axios.get("https://kancor-project.onrender.com/temperature-history")
      .then((response) => {
        const data = response.data;

        // Group by date
        const grouped = {};
        data.forEach(entry => {
          const date = entry.timestamp.split("T")[0];
          const time = new Date(entry.timestamp).toLocaleTimeString();
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push({ time, temperature: entry.value });
        });

        setGroupedData(grouped);
      })
      .catch((error) => {
        console.error("Error fetching history:", error);
      });
  }, []);

  return (
    <div className="history-container">
      <h2>📜 Temperature History</h2>
      {Object.keys(groupedData).length === 0 ? (
        <p>Loading history...</p>
      ) : (
        Object.entries(groupedData).map(([date, entries]) => (
          <div key={date} className="date-section">
            <h3>{date}</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Temperature (°C)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr
                  key={index}
                  className={entry.temperature < 7 || entry.temperature > 10 ? "alert-row" : ""}
                >
                  <td>{entry.time}</td>
                  <td>{entry.temperature}°C</td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

export default History;
