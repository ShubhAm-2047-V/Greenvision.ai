-- Database schema for Smart Crop Prediction System

CREATE DATABASE IF NOT EXISTS agromind_db;
USE agromind_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'farmer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Predictions Table
CREATE TABLE IF NOT EXISTS Predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    crop VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    nitrogen FLOAT NOT NULL,
    phosphorus FLOAT NOT NULL,
    potassium FLOAT NOT NULL,
    ph FLOAT NOT NULL,
    temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    rainfall FLOAT NOT NULL,
    season VARCHAR(50),
    country VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
);

-- 3. SoilData Table
CREATE TABLE IF NOT EXISTS SoilData (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    nitrogen FLOAT NOT NULL,
    phosphorus FLOAT NOT NULL,
    potassium FLOAT NOT NULL,
    ph FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 4. WeatherData Table
CREATE TABLE IF NOT EXISTS WeatherData (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    rainfall FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 5. DiseaseRecords Table
CREATE TABLE IF NOT EXISTS DiseaseRecords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    crop_type VARCHAR(100) NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    confidence FLOAT NOT NULL,
    symptoms TEXT,
    treatment TEXT,
    prevention TEXT,
    image_path VARCHAR(555),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 6. Reports Table
CREATE TABLE IF NOT EXISTS Reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    prediction_id INT,
    report_path VARCHAR(555) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (prediction_id) REFERENCES Predictions(id) ON DELETE SET NULL
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
