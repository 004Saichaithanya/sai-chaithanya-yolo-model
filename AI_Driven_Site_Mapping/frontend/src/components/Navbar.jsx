import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>🌍 AI Detection Dashboard</h2>
      <div className="nav-links">
        <Link to="/">Soil Detection</Link>
        <Link to="/vegetation">Vegetation Segmentation</Link>
      </div>
    </nav>
  );
}
