# AgroMind AI Installation Guide

Follow these steps to set up the AgroMind AI system on a local development machine.

## Prerequisites
- **Python**: version 3.8 to 3.11.
- **Node.js**: version 18.x or above (with `npm`).
- **MySQL Database**: (Optional, system defaults to SQLite if not configured).

---

## 1. Machine Learning & Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   * **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Return to the project root and navigate to the `ml/` folder to prepare the training datasets:
   ```bash
   cd ../ml
   ```
5. Generate the sample dataset:
   ```bash
   python generate_data.py
   ```
6. Run the training script to split the dataset and optimize models:
   ```bash
   python train.py
   ```
   This will train Decision Tree, Random Forest, and XGBoost classifiers, saving the best one to `ml/best_model.joblib`.

---

## 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Tailwind CSS post-compiler and start the Vite local dev server:
   ```bash
   npm run dev
   ```
   This starts the frontend client on `http://localhost:3000`.

---

## 3. Launching the Services Locally

1. Set up terminal environment variables (optional, system defaults to SQLite in the backend folder):
   * **Windows PowerShell**:
     ```powershell
     $env:JWT_SECRET_KEY="myjwtsecret"
     $env:SECRET_KEY="myflasksecret"
     ```
   * **Bash (Linux/macOS)**:
     ```bash
     export JWT_SECRET_KEY="myjwtsecret"
     export SECRET_KEY="myflasksecret"
     ```
2. Start the backend Flask REST server:
   ```bash
   cd backend
   python run.py
   ```
   The backend API will listen on `http://localhost:5000`.

3. Access the browser at `http://localhost:3000` to register, log in, input soil chemistry parameters, diagnose leaf disease images, and export reports.
