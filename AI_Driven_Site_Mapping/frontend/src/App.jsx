import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SoilDetection from "./components/SoilDetection";
import VegetationSegmentation from "./components/VegetationSegmentation";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<SoilDetection />} />
        <Route path="/vegetation" element={<VegetationSegmentation />} />
      </Routes>
    </Router>
  );
}
