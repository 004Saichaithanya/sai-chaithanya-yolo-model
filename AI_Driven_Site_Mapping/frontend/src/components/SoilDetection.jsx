  import React, { useState } from "react";
  import axios from "axios";
  import "../App.css";

  export default function SoilDetection() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [prediction, setPrediction] = useState("");
    const [annotatedImg, setAnnotatedImg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Handle file input from both drag and click
    const handleFileSelect = (selectedFile) => {
      if (!selectedFile) return;
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setPrediction("");
      setAnnotatedImg(null);
    };

    const handleFileChange = (e) => {
      handleFileSelect(e.target.files[0]);
    };

    // Drag-and-drop handlers
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      handleFileSelect(droppedFile);
    };

    // Send image to FastAPI
    const handleUpload = async () => {
      if (!file) return alert("Please upload an image first!");
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("http://127.0.0.1:8000/predict/soil/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setPrediction(res.data.predicted_class);
        setAnnotatedImg(`data:image/jpeg;base64,${res.data.annotated_image}`);
      } catch (err) {
        console.error(err);
        alert("Error during prediction");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="upload-container">
        <h2>🧪 Soil Type Detection</h2>

        <div
          className={`drop-area ${isDragging ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput").click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="preview-img" />
          ) : (
            <p>Drag & Drop or Click to Upload Image</p>
          )}
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Detecting..." : "Detect Soil"}
        </button>

        {prediction && (
          <div className="result">
            <h3>🌱 Predicted Class:</h3>
            <p>{prediction}</p>
          </div>
        )}

        {annotatedImg && (
          <div className="result-img">
            <h3>📷 Detection Output:</h3>
            <img src={annotatedImg} alt="Detected Output" />
          </div>
        )}
      </div>
    );
  }
