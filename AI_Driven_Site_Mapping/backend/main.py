from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import uvicorn
import shutil
import os
import cv2
import base64

app = FastAPI(title="Soil and Vegetation Detection API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO models
soil_model = YOLO("models/best_bal.pt")
vegetation_model = YOLO("models/best_v1.pt")  # <- your vegetation segmentation model

# ----------------------------------------------------
# Soil Detection Route
# ----------------------------------------------------
@app.post("/predict/soil/")
async def predict_soil(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        results = soil_model.predict(temp_path, imgsz=640, conf=0.5, verbose=False)
        names = soil_model.names

        if len(results[0].boxes) > 0:
            cls_id = int(results[0].boxes.cls[0])
            conf = float(results[0].boxes.conf[0])
            predicted_class = f"{names[cls_id]} ({conf*100:.1f}%)"
        else:
            predicted_class = "Unknown"

        annotated_img = results[0].plot()
        _, buffer = cv2.imencode(".jpg", annotated_img)
        img_base64 = base64.b64encode(buffer).decode("utf-8")

        return {"predicted_class": predicted_class, "annotated_image": img_base64}

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ----------------------------------------------------
# Vegetation Segmentation Route
# ----------------------------------------------------
@app.post("/predict/vegetation/")
async def predict_vegetation(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        results = vegetation_model.predict(temp_path, imgsz=640, conf=0.4, verbose=False)

        # For segmentation masks
        annotated_img = results[0].plot()
        _, buffer = cv2.imencode(".jpg", annotated_img)
        img_base64 = base64.b64encode(buffer).decode("utf-8")

        return {
            "message": "Vegetation segmentation complete",
            "annotated_image": img_base64
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
