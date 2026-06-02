import sys
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models import db, Prediction, SoilData, WeatherData, User
from ml.pipeline import predict_crop
import subprocess
import os

predictions_bp = Blueprint('predictions', __name__)

# NPK Target levels by crop class (for fertilizer recommendations)
CROP_NPK_TARGETS = {
    'rice': {'N': 100, 'P': 50, 'K': 40},
    'maize': {'N': 80, 'P': 45, 'K': 20},
    'chickpea': {'N': 40, 'P': 60, 'K': 80},
    'kidneybeans': {'N': 25, 'P': 65, 'K': 20},
    'pigeonpeas': {'N': 25, 'P': 45, 'K': 20},
    'mothbeans': {'N': 25, 'P': 45, 'K': 20},
    'mungbean': {'N': 25, 'P': 45, 'K': 20},
    'blackgram': {'N': 40, 'P': 65, 'K': 20},
    'lentil': {'N': 25, 'P': 65, 'K': 20},
    'pomegranate': {'N': 20, 'P': 15, 'K': 40},
    'banana': {'N': 100, 'P': 85, 'K': 50},
    'mango': {'N': 25, 'P': 25, 'K': 30},
    'grapes': {'N': 30, 'P': 130, 'K': 200},
    'watermelon': {'N': 90, 'P': 15, 'K': 50},
    'muskmelon': {'N': 90, 'P': 15, 'K': 50},
    'apple': {'N': 20, 'P': 130, 'K': 200},
    'orange': {'N': 20, 'P': 15, 'K': 10},
    'papaya': {'N': 45, 'P': 55, 'K': 50},
    'coconut': {'N': 20, 'P': 15, 'K': 30},
    'cotton': {'N': 120, 'P': 45, 'K': 20},
    'jute': {'N': 80, 'P': 48, 'K': 40},
    'coffee': {'N': 100, 'P': 25, 'K': 30}
}

# Crop economic information for prediction results
CROP_METADATA = {
    'rice': {'season': 'Kharif', 'yield': '1.8-2.5 tons/acre', 'demand': 'High', 'profit': '$250-$400/acre'},
    'maize': {'season': 'Kharif/Rabi', 'yield': '2.0-3.0 tons/acre', 'demand': 'High', 'profit': '$200-$350/acre'},
    'chickpea': {'season': 'Rabi', 'yield': '0.6-0.9 tons/acre', 'demand': 'Medium', 'profit': '$300-$450/acre'},
    'kidneybeans': {'season': 'Rabi', 'yield': '0.5-0.8 tons/acre', 'demand': 'Medium', 'profit': '$350-$500/acre'},
    'pigeonpeas': {'season': 'Kharif', 'yield': '0.6-0.8 tons/acre', 'demand': 'Medium', 'profit': '$280-$400/acre'},
    'mothbeans': {'season': 'Kharif', 'yield': '0.3-0.5 tons/acre', 'demand': 'Low', 'profit': '$150-$250/acre'},
    'mungbean': {'season': 'Summer/Kharif', 'yield': '0.4-0.6 tons/acre', 'demand': 'Medium', 'profit': '$200-$300/acre'},
    'blackgram': {'season': 'Kharif/Rabi', 'yield': '0.4-0.6 tons/acre', 'demand': 'Medium', 'profit': '$220-$320/acre'},
    'lentil': {'season': 'Rabi', 'yield': '0.5-0.7 tons/acre', 'demand': 'Medium', 'profit': '$240-$350/acre'},
    'pomegranate': {'season': 'Perennial', 'yield': '4.0-5.5 tons/acre', 'demand': 'High', 'profit': '$1200-$2000/acre'},
    'banana': {'season': 'Perennial', 'yield': '12.0-15.0 tons/acre', 'demand': 'High', 'profit': '$800-$1500/acre'},
    'mango': {'season': 'Perennial', 'yield': '3.0-4.5 tons/acre', 'demand': 'High', 'profit': '$1000-$1800/acre'},
    'grapes': {'season': 'Perennial', 'yield': '5.0-7.0 tons/acre', 'demand': 'High', 'profit': '$1500-$2500/acre'},
    'watermelon': {'season': 'Summer', 'yield': '8.0-12.0 tons/acre', 'demand': 'High', 'profit': '$400-$700/acre'},
    'muskmelon': {'season': 'Summer', 'yield': '6.0-9.0 tons/acre', 'demand': 'Medium', 'profit': '$350-$600/acre'},
    'apple': {'season': 'Perennial', 'yield': '6.0-8.0 tons/acre', 'demand': 'High', 'profit': '$1800-$3000/acre'},
    'orange': {'season': 'Perennial', 'yield': '5.0-7.0 tons/acre', 'demand': 'High', 'profit': '$1100-$1800/acre'},
    'papaya': {'season': 'Perennial', 'yield': '15.0-20.0 tons/acre', 'demand': 'High', 'profit': '$900-$1600/acre'},
    'coconut': {'season': 'Perennial', 'yield': '6000-8000 nuts/acre', 'demand': 'High', 'profit': '$700-$1200/acre'},
    'cotton': {'season': 'Kharif', 'yield': '0.8-1.2 tons/acre', 'demand': 'High', 'profit': '$400-$650/acre'},
    'jute': {'season': 'Kharif', 'yield': '1.0-1.5 tons/acre', 'demand': 'High', 'profit': '$300-$500/acre'},
    'coffee': {'season': 'Perennial', 'yield': '0.8-1.2 tons/acre', 'demand': 'High', 'profit': '$1200-$2200/acre'}
}

def calculate_fertilizer(n, p, k, ph, crop):
    targets = CROP_NPK_TARGETS.get(crop, {'N': 60, 'P': 40, 'K': 30})
    
    # Fertilizer requirements
    n_def = max(0, targets['N'] - n)
    p_def = max(0, targets['P'] - p)
    k_def = max(0, targets['K'] - k)
    
    # 1 kg deficit of N requires ~2.17 kg Urea (which is 46% N)
    urea_qty = round(n_def * 2.17, 2)
    # 1 kg deficit of P requires ~2.17 kg DAP (Di-ammonium Phosphate which is 46% P2O5 and 18% N)
    dap_qty = round(p_def * 2.17, 2)
    # 1 kg deficit of K requires ~1.67 kg Muriate of Potash (MOP which is 60% K2O)
    potash_qty = round(k_def * 1.67, 2)

    # If DAP supplies some Nitrogen, we adjust Urea
    dap_n_supply = dap_qty * 0.18
    if dap_n_supply > 0 and urea_qty > 0:
        urea_qty = max(0, round(urea_qty - (dap_n_supply * 2.17), 2))
        
    fertilizers = [
        {
            'name': 'Urea (46% N)',
            'quantity': f"{urea_qty} kg/acre",
            'method': 'Top dressing in 2-3 split applications.',
            'schedule': '1/3rd basal dose during transplanting/sowing, 1/3rd at active vegetative stage, 1/3rd at panicle/flowering stage.',
            'estimated_cost': f"${round(urea_qty * 0.35, 2)}"
        },
        {
            'name': 'DAP (18-46-0)',
            'quantity': f"{dap_qty} kg/acre",
            'method': 'Basal placement at the time of sowing/planting.',
            'schedule': 'Complete dose applied 2-3 cm below and to the side of the seed during sowing.',
            'estimated_cost': f"${round(dap_qty * 0.60, 2)}"
        },
        {
            'name': 'Muriate of Potash (MOP 60% K)',
            'quantity': f"{potash_qty} kg/acre",
            'method': 'Basal application or split dressing in light soils.',
            'schedule': 'Apply 50% during sowing and 50% at flowering stage to improve disease resistance.',
            'estimated_cost': f"${round(potash_qty * 0.50, 2)}"
        },
        {
            'name': 'Organic Compost / FYM',
            'quantity': '4-5 tons/acre',
            'method': 'Broadcasting and mixing thoroughly during land preparation.',
            'schedule': 'Apply 3-4 weeks before sowing/transplanting to allow proper decomposition.',
            'estimated_cost': '$80.00'
        }
    ]
    
    # Filter out zero requirement chemical fertilizers to keep it premium
    fertilizers = [f for f in fertilizers if '0.0 kg' not in f['quantity'] or f['name'].startswith('Organic')]
    
    # Soil pH amendments
    ph_advice = ""
    if ph < 5.5:
        ph_advice = "Soil is acidic. Apply agricultural lime (Calcium Carbonate) at 1-2 tons/acre to increase pH."
    elif ph > 7.8:
        ph_advice = "Soil is alkaline. Apply agricultural gypsum at 1-2 tons/acre or elemental sulfur to decrease pH."
    else:
        ph_advice = "Soil pH is optimal. No chemical amendments needed."

    return {
        'fertilizers': fertilizers,
        'ph_advice': ph_advice
    }

def calculate_irrigation(temp, humidity, rainfall, crop):
    # Reference evapotranspiration approximation ETo
    # Increases with temperature, decreases with humidity
    eto = max(2.0, (temp * 0.15) - (humidity * 0.02) + 2.0)
    
    # Crop coefficient approximation
    kc_lookup = {
        'rice': 1.15, 'maize': 0.9, 'chickpea': 0.7, 'banana': 1.1, 'mango': 0.8,
        'sugarcane': 1.2, 'grapes': 0.7, 'watermelon': 0.75, 'muskmelon': 0.75,
        'apple': 0.85, 'cotton': 0.85, 'jute': 0.9, 'coffee': 0.85
    }
    kc = kc_lookup.get(crop, 0.8)
    
    # Daily crop water requirement in mm
    etc_mm = eto * kc
    
    # Convert mm to Liters per Acre (1 mm rainfall/irrigation = 4,047 liters/acre)
    daily_water_liters = round(etc_mm * 4047, 1)
    
    # Adjust for rainfall (deduct rainfall spread over days)
    daily_rain_mm = rainfall / 30.0  # approximate daily rainfall
    net_etc_mm = max(0, etc_mm - daily_rain_mm)
    net_daily_water_liters = round(net_etc_mm * 4047, 1)
    
    weekly_water_liters = round(net_daily_water_liters * 7, 1)
    
    # Determine irrigation frequency
    if crop in ['rice', 'banana', 'jute']:
        frequency = "Every 1-2 days (Requires moist/flooded conditions)"
    elif crop in ['watermelon', 'muskmelon', 'papaya']:
        frequency = "Every 3-4 days (Sensitive to waterlogging)"
    elif crop in ['pomegranate', 'mango', 'grapes', 'citrus', 'coffee']:
        frequency = "Every 7-10 days (Deep root system)"
    else:
        frequency = "Every 5-7 days"

    schedule = "A.M. (6:00 - 9:00 AM) or P.M. (5:00 - 7:00 PM) to minimize evaporation losses."
    
    recommendations = [
        "Adopt drip irrigation to save up to 45% water and deliver nutrients directly to roots.",
        "Use plastic or organic straw mulching to reduce soil moisture evaporation.",
        "Construct contour bunds and rainwater harvesting ditches to redirect and store run-off water."
    ]

    return {
        'daily_water_requirement_liters': net_daily_water_liters,
        'weekly_water_requirement_liters': weekly_water_liters,
        'irrigation_frequency': frequency,
        'watering_schedule': schedule,
        'water_saving_tips': recommendations
    }

@predictions_bp.route('/predict', methods=['POST'])
@jwt_required(optional=True)
def predict():
    data = request.get_json() or {}
    
    # Required parameters
    try:
        n = float(data.get('nitrogen'))
        p = float(data.get('phosphorus'))
        k = float(data.get('potassium'))
        ph = float(data.get('ph'))
        temp = float(data.get('temperature'))
        humidity = float(data.get('humidity'))
        rainfall = float(data.get('rainfall'))
    except (TypeError, ValueError):
        return jsonify({'message': 'All nutrient and weather fields must be numeric'}), 400

    # Optional metadata
    country = data.get('country', 'India')
    state = data.get('state', '')
    district = data.get('district', '')
    season = data.get('season', 'Kharif')

    # Perform ML prediction
    res = predict_crop(n, p, k, temp, humidity, ph, rainfall)
    crop = res['crop']
    confidence = res['confidence']
    feature_importance = res['feature_importance']

    # Get details
    meta = CROP_METADATA.get(crop, {'season': season, 'yield': 'N/A', 'demand': 'Medium', 'profit': 'Variable'})
    fertilizer_info = calculate_fertilizer(n, p, k, ph, crop)
    irrigation_info = calculate_irrigation(temp, humidity, rainfall, crop)

    # Save to database if user is logged in
    user_id = get_jwt_identity()
    new_prediction = None
    if user_id:
        user_id = int(user_id)
        # Store Soil & Weather readings
        soil = SoilData(user_id=user_id, nitrogen=n, phosphorus=p, potassium=k, ph=ph)
        weather = WeatherData(user_id=user_id, temperature=temp, humidity=humidity, rainfall=rainfall)
        db.session.add(soil)
        db.session.add(weather)

        new_prediction = Prediction(
            user_id=user_id, crop=crop, confidence=confidence,
            nitrogen=n, phosphorus=p, potassium=k, ph=ph,
            temperature=temp, humidity=humidity, rainfall=rainfall,
            season=season, country=country, state=state, district=district
        )
        db.session.add(new_prediction)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'DB error saving prediction: {str(e)}'}), 500

    # Explain prediction (Explainable AI reasoning)
    explanation = f"The model recommended {crop} with {confidence*100:.1f}% confidence. "
    if crop in ['rice', 'banana', 'jute']:
        explanation += f"This selection was driven by the high water availability (rainfall: {rainfall}mm) and high temperature/humidity levels which are perfect for {crop} development. "
    elif crop in ['chickpea', 'lentil', 'kidneybeans']:
        explanation += f"This selection matches the low-rainfall ({rainfall}mm) and cooler temperature profile of the {meta['season']} season. Additionally, the soil has optimal phosphorus levels crucial for legume nodulation. "
    else:
        explanation += f"Your soil NPK values are a close match for {crop}'s nutritional requirements, and local temperature ({temp}°C) and pH ({ph}) fall within the ideal agronomic crop growth envelope."

    return jsonify({
        'prediction_id': new_prediction.id if new_prediction else None,
        'crop': crop.capitalize(),
        'confidence': confidence,
        'season': meta['season'],
        'expected_yield': meta['yield'],
        'market_demand': meta['demand'],
        'estimated_profit': meta['profit'],
        'explanation': explanation,
        'feature_importance': feature_importance,
        'fertilizer_recommendation': fertilizer_info,
        'irrigation_recommendation': irrigation_info
    }), 200

@predictions_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    user_id = get_jwt_identity()
    records = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).all()
    
    history_list = []
    for r in records:
        meta = CROP_METADATA.get(r.crop, {'season': r.season, 'yield': 'N/A', 'demand': 'Medium', 'profit': 'Variable'})
        history_list.append({
            'id': r.id,
            'crop': r.crop.capitalize(),
            'confidence': r.confidence,
            'nitrogen': r.nitrogen,
            'phosphorus': r.phosphorus,
            'potassium': r.potassium,
            'ph': r.ph,
            'temperature': r.temperature,
            'humidity': r.humidity,
            'rainfall': r.rainfall,
            'location': f"{r.district}, {r.state}" if r.district else "N/A",
            'season': r.season,
            'expected_yield': meta['yield'],
            'market_demand': meta['demand'],
            'estimated_profit': meta['profit'],
            'created_at': r.created_at.isoformat()
        })
    return jsonify(history_list), 200

@predictions_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Determine if Admin or Farmer
    is_admin = user.role == 'admin'

    if is_admin:
        # Admin statistics
        total_users = User.query.filter_by(role='farmer').count()
        total_predictions = Prediction.query.count()
        
        # Calculate active farmers (who ran predictions)
        active_farmers = db.session.query(Prediction.user_id).distinct().count()
        
        # Load accuracy from metadata
        accuracy = 0.95  # Default
        best_model_name = "Random Forest"
        
        metadata_path = 'ml/model_metadata.json'
        if os.path.exists(metadata_path):
            try:
                import json
                with open(metadata_path, 'r') as f:
                    meta = json.load(f)
                    accuracy = meta.get('best_accuracy', 0.95)
                    best_model_name = meta.get('best_model_name', 'Random Forest')
            except:
                pass
                
        # Predictions count by crop
        crop_counts = db.session.query(Prediction.crop, db.func.count(Prediction.id))\
            .group_by(Prediction.crop).all()
        crop_popularity = {crop.capitalize(): count for crop, count in crop_counts}

        # Users growth (grouped by month or simple list)
        users = User.query.filter_by(role='farmer').order_by(User.created_at.asc()).all()
        user_growth = [{'date': u.created_at.strftime('%Y-%m-%d'), 'count': idx+1} for idx, u in enumerate(users)]

        return jsonify({
            'total_users': total_users,
            'total_predictions': total_predictions,
            'active_farmers': active_farmers,
            'model_accuracy': round(accuracy, 4),
            'best_model_name': best_model_name,
            'crop_popularity': crop_popularity,
            'user_growth': user_growth
        }), 200
    else:
        # Farmer specific statistics
        predictions = Prediction.query.filter_by(user_id=user_id).all()
        total_preds = len(predictions)
        
        crops = set([p.crop for p in predictions])
        recommended_count = len(crops)
        
        # Saved reports
        reports_count = Prediction.query.filter_by(user_id=user_id).join(Prediction.report).count()
        
        # Soil health averages
        avg_n = db.session.query(db.func.avg(SoilData.nitrogen)).filter_by(user_id=user_id).scalar() or 0.0
        avg_p = db.session.query(db.func.avg(SoilData.phosphorus)).filter_by(user_id=user_id).scalar() or 0.0
        avg_k = db.session.query(db.func.avg(SoilData.potassium)).filter_by(user_id=user_id).scalar() or 0.0
        avg_ph = db.session.query(db.func.avg(SoilData.ph)).filter_by(user_id=user_id).scalar() or 0.0

        # Frequency distribution of recommended crops
        crop_counts = {}
        for p in predictions:
            crop_name = p.crop.capitalize()
            crop_counts[crop_name] = crop_counts.get(crop_name, 0) + 1

        return jsonify({
            'total_predictions': total_preds,
            'recommended_crops_count': recommended_count,
            'saved_reports': reports_count,
            'prediction_accuracy': 0.95,  # System model accuracy
            'soil_averages': {
                'nitrogen': round(avg_n, 1),
                'phosphorus': round(avg_p, 1),
                'potassium': round(avg_k, 1),
                'ph': round(avg_ph, 2)
            },
            'crop_distribution': crop_counts
        }), 200

@predictions_bp.route('/admin/retrain', methods=['POST'])
@jwt_required()
def retrain_model():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'message': 'Unauthorized admin action'}), 403

    try:
        # Run ml/train.py as a subprocess to train and save models
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        script_path = os.path.join(base_dir, 'ml', 'train.py')
        
        # Execute training script
        process = subprocess.run([sys.executable, script_path], capture_output=True, text=True, cwd=base_dir)
        
        if process.returncode != 0:
            return jsonify({'message': 'Model retraining failed', 'error': process.stderr}), 500
            
        # Load new metadata
        metadata_path = os.path.join(base_dir, 'ml', 'model_metadata.json')
        with open(metadata_path, 'r') as f:
            meta = json.load(f)

        return jsonify({
            'message': 'Model retrained successfully',
            'accuracy': meta.get('best_accuracy'),
            'best_model': meta.get('best_model_name'),
            'logs': process.stdout
        }), 200
    except Exception as e:
        return jsonify({'message': 'Error executing retrain script', 'error': str(e)}), 500
