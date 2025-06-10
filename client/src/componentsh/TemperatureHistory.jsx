import React, { useEffect, useState } from "react";
import "./TemperatureHistory.css";

const ALERT_LOW = 7.0;
const ALERT_HIGH = 10.0;

const TemperatureHistory = () => {
  const [temperatures, setTemperatures] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/temperatures")  // Change URL if backend is hosted elsewhere
      .then((res) => res.json())
      .then((data) => {
        setTemperatures(data.reverse()); // show latest on top
        const latest = data[data.length - 1];
        if (latest?.value < ALERT_LOW || latest?.value > ALERT_HIGH) {
          setAlert(`🚨 Alert! Critical temperature: ${latest.value}°C`);
        } else {
          setAlert(null);
        }
      });
  }, []);

  return (
    <div className="history-container">
      <h2>📜 Temperature History</h2>
      {alert && <div className="alert">{alert}</div>}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Temperature (°C)</th>
          </tr>
        </thead>
        <tbody>
          {temperatures.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.timestamp).toLocaleString()}</td>
              <td className={t.value < ALERT_LOW || t.value > ALERT_HIGH ? "critical" : ""}>
                {t.value.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TemperatureHistory;
