import React, { useState } from "react";
import axios from "axios";
import "../App.css";

export default function VegetationSegmentation() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [annotatedImg, setAnnotatedImg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return alert("Upload an image first!");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/predict/vegetation/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnnotatedImg(`data:image/jpeg;base64,${res.data.annotated_image}`);
    } catch (err) {
      console.error(err);
      alert("Segmentation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>🌿 Vegetation Segmentation</h2>

      <div
        className="drop-area"
        onClick={() => document.getElementById("fileInput").click()}
      >
        {preview ? <img src={preview} alt="Preview" className="preview-img" /> : <p>Click to Upload</p>}
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={(e) => handleFileSelect(e.target.files[0])}
          accept="image/*"
        />
      </div>

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Segment Vegetation"}
      </button>

      {annotatedImg && (
        <div className="result-img">
          <h3>🌳 Segmentation Result:</h3>
          <img src={annotatedImg} alt="Segmented Vegetation" />
        </div>
      )}
    </div>
  );
}
