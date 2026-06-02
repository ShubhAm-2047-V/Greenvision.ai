import os
import joblib
import pandas as pd
import numpy as np
import json

class CropPredictionPipeline:
    def __init__(self):
        self.model_path = 'ml/best_model.joblib'
        self.encoder_path = 'ml/label_encoder.joblib'
        self.metadata_path = 'ml/model_metadata.json'
        
        self.model = None
        self.encoder = None
        self.metadata = None
        self.load_resources()

    def load_resources(self):
        # Work paths relative to workspace root or absolute path
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        model_abs = os.path.join(base_dir, 'ml', 'best_model.joblib')
        encoder_abs = os.path.join(base_dir, 'ml', 'label_encoder.joblib')
        metadata_abs = os.path.join(base_dir, 'ml', 'model_metadata.json')

        if os.path.exists(model_abs) and os.path.exists(encoder_abs):
            try:
                self.model = joblib.load(model_abs)
                self.encoder = joblib.load(encoder_abs)
                if os.path.exists(metadata_abs):
                    with open(metadata_abs, 'r') as f:
                        self.metadata = json.load(f)
            except Exception as e:
                print(f"Error loading model resources: {e}")
        else:
            print("Model files not found. Run ml/train.py first.")

    def predict(self, N, P, K, temp, humidity, ph, rainfall):
        if self.model is None or self.encoder is None:
            # Fallback if model hasn't been trained yet
            return {
                'crop': 'rice',
                'confidence': 0.85,
                'feature_importance': {
                    'N': 0.15, 'P': 0.12, 'K': 0.14, 'temperature': 0.18, 
                    'humidity': 0.13, 'ph': 0.11, 'rainfall': 0.17
                },
                'is_fallback': True
            }

        # Create input df
        input_data = pd.DataFrame([[N, P, K, temp, humidity, ph, rainfall]], 
                                  columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])
        
        # Predict probability
        probabilities = self.model.predict_proba(input_data)[0]
        max_idx = np.argmax(probabilities)
        confidence = float(probabilities[max_idx])
        
        # Get label
        crop_label = self.encoder.inverse_transform([max_idx])[0]
        
        # Feature importances
        feature_importance = {}
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
            feature_names = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
            feature_importance = {name: float(imp) for name, imp in zip(feature_names, importances)}
        elif self.metadata and 'feature_importances' in self.metadata:
            feature_importance = self.metadata['feature_importances']
        else:
            feature_importance = {
                'N': 0.15, 'P': 0.12, 'K': 0.14, 'temperature': 0.18, 
                'humidity': 0.13, 'ph': 0.11, 'rainfall': 0.17
            }

        return {
            'crop': crop_label,
            'confidence': round(confidence, 4),
            'feature_importance': feature_importance,
            'is_fallback': False
        }

# Global singleton
pipeline = CropPredictionPipeline()

def predict_crop(N, P, K, temp, humidity, ph, rainfall):
    # Reload model resources if they were trained since startup
    if pipeline.model is None:
        pipeline.load_resources()
    return pipeline.predict(N, P, K, temp, humidity, ph, rainfall)
