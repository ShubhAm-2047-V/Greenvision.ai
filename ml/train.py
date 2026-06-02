import pandas as pd
import numpy as np
import joblib
import os
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier

def train_models():
    data_path = 'ml/data/crop_data.csv'
    if not os.path.exists(data_path):
        print(f"Data file {data_path} not found.")
        return

    # Load data
    df = pd.read_csv(data_path)
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Save label encoder
    os.makedirs('ml', exist_ok=True)
    joblib.dump(le, 'ml/label_encoder.joblib')

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)

    models = {}
    
    # 1. Decision Tree
    models['Decision Tree'] = DecisionTreeClassifier(random_state=42)

    # 2. Random Forest
    models['Random Forest'] = RandomForestClassifier(n_estimators=100, random_state=42)

    # 3. XGBoost / Gradient Boosting Fallback
    try:
        from xgboost import XGBClassifier
        models['XGBoost'] = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
        print("XGBoost imported successfully.")
    except ImportError:
        print("XGBoost library not found. Falling back to Scikit-Learn Gradient Boosting.")
        models['XGBoost'] = GradientBoostingClassifier(random_state=42)

    results = {}
    best_accuracy = 0
    best_model_name = ""
    best_model = None

    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
        cm = confusion_matrix(y_test, y_pred).tolist()

        results[name] = {
            'accuracy': float(acc),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'confusion_matrix': cm
        }

        print(f"{name} Metrics: Accuracy: {acc:.4f}, F1: {f1:.4f}")

        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            best_model = model

    # Save the best model
    joblib.dump(best_model, 'ml/best_model.joblib')
    print(f"Best model selected: {best_model_name} with Accuracy: {best_accuracy:.4f}")

    # Calculate Feature Importances for the best model
    # Features order: N, P, K, temperature, humidity, ph, rainfall
    feature_names = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    importances = best_model.feature_importances_
    feature_importance_dict = {name: float(imp) for name, imp in zip(feature_names, importances)}

    # Save metadata
    metadata = {
        'best_model_name': best_model_name,
        'best_accuracy': float(best_accuracy),
        'all_metrics': results,
        'feature_importances': feature_importance_dict,
        'crops': list(le.classes_)
    }
    
    with open('ml/model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=4)
        
    print("Model metadata and feature importances saved.")

if __name__ == '__main__':
    train_models()
