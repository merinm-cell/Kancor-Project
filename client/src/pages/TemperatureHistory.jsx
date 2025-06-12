import React from 'react';
import '../styles/TemperatureHistory.css';

const TemperatureHistory = () => {
  return (
    <div className="history-container">
      <h2>Temperature History</h2>
      {/* Example notification */}
      <div className="notification normal">
        Temperature: 25°C | Date: 10-06-2025 | Time: 10:30 AM
      </div>
      <div className="notification alert">
        ⚠️ Alert! Temperature: 48°C | Date: 10-06-2025 | Time: 10:45 AM
      </div>
    </div>
  );
};

export default TemperatureHistory;
