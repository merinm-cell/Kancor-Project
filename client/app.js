import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const socket = io("http://localhost:8000"); // FastAPI WebSocket endpoint

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    socket.on("new_data", (payload) => {
      // Append new data point
      setData((prev) => [...prev, payload]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="App">
      <h1>Live MQTT Chart</h1>
      <LineChart width={800} height={400} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
      </LineChart>
    </div>
  );
}

export default App;
