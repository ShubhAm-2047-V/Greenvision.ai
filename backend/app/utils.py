import os
import requests
import random
from flask import Blueprint, request, jsonify
from backend.config import Config

utils_bp = Blueprint('utils', __name__)

def generate_mock_weather(state, district):
    # Base parameters on simple state names if present
    state = (state or "").lower()
    
    # Defaults
    temp = 28.5
    humidity = 65.0
    rainfall = 120.0
    
    if "kashmir" in state or "himachal" in state or "shimla" in state:
        temp = 16.2
        humidity = 50.0
        rainfall = 90.0
    elif "rajasthan" in state or "thar" in state or "jaipur" in state:
        temp = 38.0
        humidity = 30.0
        rainfall = 25.0
    elif "kerala" in state or "goa" in state or "cochin" in state:
        temp = 29.5
        humidity = 85.0
        rainfall = 250.0
    elif "maharashtra" in state or "mumbai" in state or "pune" in state:
        temp = 27.8
        humidity = 75.0
        rainfall = 180.0

    # Generate 7 days forecast around these bases
    forecast = []
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    for i, day in enumerate(days):
        t_offset = round(random.uniform(-3.0, 3.0), 1)
        h_offset = round(random.uniform(-10.0, 10.0), 1)
        rain_prob = round(random.uniform(10, 95), 1) if rainfall > 50 else round(random.uniform(0, 30), 1)
        
        forecast.append({
            'day': day,
            'temp': round(temp + t_offset, 1),
            'humidity': round(min(max(humidity + h_offset, 10), 100), 1),
            'rain_probability': rain_prob,
            'description': 'Showers' if rain_prob > 60 else ('Partly Cloudy' if rain_prob > 30 else 'Sunny')
        })

    return {
        'current': {
            'temp': temp,
            'humidity': humidity,
            'rainfall_monthly_avg': rainfall,
            'wind_speed': 12.5,
            'description': 'Light Rain' if rainfall > 100 else 'Sunny'
        },
        'forecast': forecast,
        'source': 'mock_agromind_engine'
    }

@utils_bp.route('/weather', methods=['GET'])
def get_weather():
    state = request.args.get('state', '')
    district = request.args.get('district', '')
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    api_key = Config.OPENWEATHER_API_KEY
    
    if api_key and (lat and lon):
        try:
            # Current weather API
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
            r = requests.get(url, timeout=5)
            data = r.json()
            
            # Forecast API (Mock forecast from current due to OpenWeather API plan limitations, or use standard One Call if supported)
            if r.status_code == 200:
                temp = data['main']['temp']
                humidity = data['main']['humidity']
                description = data['weather'][0]['description']
                wind_speed = data['wind']['speed']
                # OpenWeather returns rain in past 1h/3h in mm, we default rainfall value
                rain = data.get('rain', {}).get('1h', 0) or data.get('rain', {}).get('3h', 0)
                # Convert short-term rain to a monthly average approximation
                rainfall_approx = rain * 60 + 50 if rain > 0 else random.uniform(30, 80)
                
                # Mock forecast around real coordinates
                mock_data = generate_mock_weather(state, district)
                return jsonify({
                    'current': {
                        'temp': temp,
                        'humidity': humidity,
                        'rainfall_monthly_avg': round(rainfall_approx, 1),
                        'wind_speed': wind_speed,
                        'description': description.capitalize()
                    },
                    'forecast': mock_data['forecast'],
                    'source': 'openweather'
                }), 200
        except Exception as e:
            # Fallback to mock on connection errors
            pass

    # Use simulated weather dataset if coordinates/API not present
    mock_data = generate_mock_weather(state, district)
    return jsonify(mock_data), 200
