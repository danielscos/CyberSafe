import React, { useEffect, useState } from "react";
import styles from "./App.module.css"; // Import CSS module

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/"); // Changed to fetch from the root endpoint
        const jsonData = await response.json();
        setData(jsonData.status); // Assuming you want to display the status
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div>Backend Status: {data || "Loading..."}</div> {/* Updated display message */}
    </div>
  );
}

export default App;