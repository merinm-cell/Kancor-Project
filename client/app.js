import React, { useEffect, useState, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function App() {
  const [data, setData] = useState([]);
  const socketRef = useRef(null);

  // Fetch historical data on mount
  useEffect(() => {
    fetch("wss://kancor-project.onrender.com/ws/temperature")
      .then((res) => res.json())
      .then((history) => {
        const formatted = history.map((item) => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          temperature: item.value,
        }));
        setData(formatted);
      });
  }, []);

  // Set up WebSocket connection
  useEffect(() => {
    socketRef.current = new WebSocket("wss://kancor-project.onrender.com/ws/temperature");

    socketRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data); // { value, timestamp }
        const newEntry = {
          time: new Date(msg.timestamp).toLocaleTimeString(),
          temperature: msg.value,
        };
        setData((prev) => [...prev.slice(-19), newEntry]); // keep last 20 points
      } catch (e) {
        console.error("WebSocket data error:", e);
      }
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  return (
    <div className="App" style={{ padding: "20px" }}>
      <h2>📈 Live Temperature Chart</h2>
      <LineChart width={800} height={400} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="time" />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip />
        <Line type="monotone" dataKey="temperature" stroke="#8884d8" dot={false} />
      </LineChart>
    </div>
  );
}

export default App;
