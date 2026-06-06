# Agrovision AI REST API Reference Documentation

All endpoints receive and return JSON unless noted otherwise.

---

## Authentication Endpoints

### 1. Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Request Body**:
```json
{
  "name": "Ramesh Patil",
  "email": "ramesh@gmail.com",
  "password": "password123",
  "role": "farmer"
}
```
* **Success Response (201 Created)**:
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Ramesh Patil",
    "email": "ramesh@gmail.com",
    "role": "farmer",
    "created_at": "2026-06-01T17:30:00"
  }
}
```

### 2. Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Request Body**:
```json
{
  "email": "ramesh@gmail.com",
  "password": "password123"
}
```
* **Success Response (200 OK)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Ramesh Patil",
    "email": "ramesh@gmail.com",
    "role": "farmer",
    "created_at": "2026-06-01T17:30:00"
  }
}
```

### 3. Fetch User Profile
* **URL**: `/api/auth/profile`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK)**:
```json
{
  "id": 2,
  "name": "Ramesh Patil",
  "email": "ramesh@gmail.com",
  "role": "farmer",
  "created_at": "2026-06-01T17:30:00"
}
```

---

## Crop Prediction Endpoints

### 1. Smart Crop Prediction
* **URL**: `/api/predictions/predict`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>` (Optional)
* **Request Body**:
```json
{
  "nitrogen": 80,
  "phosphorus": 45,
  "potassium": 40,
  "ph": 6.5,
  "temperature": 25.0,
  "humidity": 70.0,
  "rainfall": 120.0,
  "country": "India",
  "state": "Maharashtra",
  "district": "Pune",
  "season": "Kharif"
}
```
* **Success Response (200 OK)**:
```json
{
  "prediction_id": 12,
  "crop": "Rice",
  "confidence": 0.985,
  "season": "Kharif",
  "expected_yield": "1.8-2.5 tons/acre",
  "market_demand": "High",
  "estimated_profit": "$250-$400/acre",
  "explanation": "The model recommended Rice with 98.5% confidence because...",
  "feature_importance": {
    "N": 0.15,
    "P": 0.12,
    "K": 0.14,
    "temperature": 0.18,
    "humidity": 0.13,
    "ph": 0.11,
    "rainfall": 0.17
  },
  "fertilizer_recommendation": {
    "fertilizers": [
      {
        "name": "Urea (46% N)",
        "quantity": "43.4 kg/acre",
        "method": "Top dressing in 2-3 split applications.",
        "schedule": "1/3rd basal dose during transplanting...",
        "estimated_cost": "$15.19"
      }
    ],
    "ph_advice": "Soil pH is optimal. No chemical amendments needed."
  },
  "irrigation_recommendation": {
    "daily_water_requirement_liters": 18211.5,
    "weekly_water_requirement_liters": 127480.5,
    "irrigation_frequency": "Every 1-2 days (Requires moist/flooded conditions)",
    "watering_schedule": "A.M. (6:00 - 9:00 AM) or P.M. (5:00 - 7:00 PM)",
    "water_saving_tips": [
      "Adopt drip irrigation to save up to 45% water...",
      "Use plastic or organic straw mulching..."
    ]
  }
}
```

### 2. Fetch User Prediction History
* **URL**: `/api/predictions/history`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK)**:
```json
[
  {
    "id": 12,
    "crop": "Rice",
    "confidence": 0.985,
    "nitrogen": 80,
    "phosphorus": 45,
    "potassium": 40,
    "ph": 6.5,
    "temperature": 25.0,
    "humidity": 70.0,
    "rainfall": 120.0,
    "location": "Pune, Maharashtra",
    "season": "Kharif",
    "expected_yield": "1.8-2.5 tons/acre",
    "market_demand": "High",
    "estimated_profit": "$250-$400/acre",
    "created_at": "2026-06-01T17:32:00"
  }
]
```

### 3. Fetch Dashboard Analytics
* **URL**: `/api/predictions/stats`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (Farmer - 200 OK)**:
```json
{
  "total_predictions": 5,
  "recommended_crops_count": 2,
  "saved_reports": 2,
  "prediction_accuracy": 0.95,
  "soil_averages": {
    "nitrogen": 82.5,
    "phosphorus": 46.0,
    "potassium": 41.2,
    "ph": 6.45
  },
  "crop_distribution": {
    "Rice": 3,
    "Maize": 2
  }
}
```

---

## Leaf Disease Detection Endpoints

### 1. Scan Leaf
* **URL**: `/api/disease/detect`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>` (Optional)
* **Request Body**: `multipart/form-data` containing:
  - `image`: Leaf image file (PNG/JPG/JPEG)
  - `crop_type`: `tomato`, `potato`, `rice`, `wheat`, or `corn`
* **Success Response (200 OK)**:
```json
{
  "record_id": 5,
  "crop": "Tomato",
  "disease_name": "Tomato Early Blight",
  "confidence": 0.854,
  "symptoms": "Dark, concentric spots (target-like) appear first on older leaves...",
  "treatment": "Apply copper-based fungicides. Remove lower leaves to reduce soil splash.",
  "prevention": "Rotate crops, keep foliage dry with drip irrigation...",
  "image_url": "/api/disease/images/f3a74c..._leaf.jpg"
}
```

---

## AI Chatbot Endpoints

### 1. Send Message
* **URL**: `/api/chatbot/message`
* **Method**: `POST`
* **Request Body**:
```json
{
  "message": "How do I treat leaf early blight?"
}
```
* **Success Response (200 OK)**:
```json
{
  "response": "Crop diseases are mostly fungal or bacterial. Leaf Blight (early/late) shows target-like spots, while Rust presents orange pustules. Treatment includes applying copper hydroxide..."
}
```

---

## Report PDF Endpoints

### 1. Download PDF Report
* **URL**: `/api/reports/download/<prediction_id>`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK)**: Binary stream of the PDF file.
