import csv
import random
import os

# Define crops and their ranges for N, P, K, Temp, Humidity, pH, Rainfall
crop_ranges = {
    'rice': {'N': (80, 120), 'P': (35, 60), 'K': (35, 45), 'temp': (20.0, 27.0), 'hum': (80.0, 90.0), 'ph': (5.5, 6.5), 'rain': (200.0, 300.0)},
    'maize': {'N': (60, 100), 'P': (35, 60), 'K': (15, 25), 'temp': (18.0, 27.0), 'hum': (55.0, 70.0), 'ph': (5.5, 7.0), 'rain': (60.0, 110.0)},
    'chickpea': {'N': (20, 60), 'P': (55, 80), 'K': (75, 85), 'temp': (17.0, 21.0), 'hum': (15.0, 20.0), 'ph': (5.5, 8.5), 'rain': (65.0, 95.0)},
    'kidneybeans': {'N': (10, 40), 'P': (55, 80), 'K': (15, 25), 'temp': (15.0, 25.0), 'hum': (20.0, 25.0), 'ph': (5.5, 6.0), 'rain': (60.0, 150.0)},
    'pigeonpeas': {'N': (10, 40), 'P': (35, 60), 'K': (15, 25), 'temp': (18.0, 37.0), 'hum': (45.0, 70.0), 'ph': (4.5, 8.0), 'rain': (90.0, 200.0)},
    'mothbeans': {'N': (10, 40), 'P': (35, 60), 'K': (15, 25), 'temp': (24.0, 32.0), 'hum': (40.0, 65.0), 'ph': (3.5, 10.0), 'rain': (30.0, 75.0)},
    'mungbean': {'N': (10, 40), 'P': (35, 60), 'K': (15, 25), 'temp': (27.0, 36.0), 'hum': (80.0, 90.0), 'ph': (6.2, 7.2), 'rain': (30.0, 60.0)},
    'blackgram': {'N': (20, 60), 'P': (55, 80), 'K': (15, 25), 'temp': (25.0, 35.0), 'hum': (60.0, 70.0), 'ph': (6.5, 7.5), 'rain': (60.0, 75.0)},
    'lentil': {'N': (10, 40), 'P': (55, 80), 'K': (15, 25), 'temp': (16.0, 30.0), 'hum': (60.0, 70.0), 'ph': (5.9, 6.9), 'rain': (35.0, 55.0)},
    'pomegranate': {'N': (2, 40), 'P': (5, 30), 'K': (35, 45), 'temp': (18.0, 25.0), 'hum': (85.0, 95.0), 'ph': (5.5, 7.5), 'rain': (100.0, 110.0)},
    'banana': {'N': (80, 120), 'P': (75, 95), 'K': (45, 55), 'temp': (25.0, 30.0), 'hum': (75.0, 85.0), 'ph': (5.5, 6.5), 'rain': (90.0, 115.0)},
    'mango': {'N': (10, 40), 'P': (15, 40), 'K': (25, 35), 'temp': (27.0, 36.0), 'hum': (45.0, 55.0), 'ph': (4.5, 7.0), 'rain': (90.0, 100.0)},
    'grapes': {'N': (20, 40), 'P': (120, 145), 'K': (195, 205), 'temp': (8.0, 40.0), 'hum': (80.0, 85.0), 'ph': (5.5, 6.0), 'rain': (65.0, 75.0)},
    'watermelon': {'N': (80, 100), 'P': (5, 30), 'K': (45, 55), 'temp': (24.0, 27.0), 'hum': (80.0, 90.0), 'ph': (6.0, 7.0), 'rain': (40.0, 60.0)},
    'muskmelon': {'N': (80, 100), 'P': (5, 30), 'K': (45, 55), 'temp': (27.0, 30.0), 'hum': (90.0, 95.0), 'ph': (6.0, 6.8), 'rain': (20.0, 30.0)},
    'apple': {'N': (0, 40), 'P': (120, 145), 'K': (195, 205), 'temp': (21.0, 24.0), 'hum': (90.0, 95.0), 'ph': (5.5, 6.5), 'rain': (100.0, 125.0)},
    'orange': {'N': (0, 40), 'P': (5, 30), 'K': (5, 15), 'temp': (10.0, 35.0), 'hum': (90.0, 95.0), 'ph': (6.0, 8.0), 'rain': (100.0, 120.0)},
    'papaya': {'N': (30, 60), 'P': (45, 70), 'K': (45, 55), 'temp': (23.0, 45.0), 'hum': (90.0, 95.0), 'ph': (6.5, 7.0), 'rain': (240.0, 250.0)},
    'coconut': {'N': (0, 40), 'P': (5, 30), 'K': (25, 35), 'temp': (25.0, 30.0), 'hum': (90.0, 100.0), 'ph': (5.5, 6.5), 'rain': (130.0, 230.0)},
    'cotton': {'N': (100, 140), 'P': (35, 60), 'K': (15, 25), 'temp': (22.0, 26.0), 'hum': (75.0, 85.0), 'ph': (5.8, 8.0), 'rain': (60.0, 100.0)},
    'jute': {'N': (60, 100), 'P': (35, 60), 'K': (35, 45), 'temp': (23.0, 27.0), 'hum': (70.0, 90.0), 'ph': (6.0, 7.8), 'rain': (150.0, 200.0)},
    'coffee': {'N': (80, 120), 'P': (15, 40), 'K': (25, 35), 'temp': (23.0, 28.0), 'hum': (50.0, 60.0), 'ph': (6.0, 8.0), 'rain': (140.0, 200.0)}
}

def generate_dataset(file_path, num_samples_per_crop=100):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, mode='w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label'])
        
        for crop, ranges in crop_ranges.items():
            for _ in range(num_samples_per_crop):
                N = random.randint(ranges['N'][0], ranges['N'][1])
                P = random.randint(ranges['P'][0], ranges['P'][1])
                K = random.randint(ranges['K'][0], ranges['K'][1])
                temp = round(random.uniform(ranges['temp'][0], ranges['temp'][1]), 2)
                hum = round(random.uniform(ranges['hum'][0], ranges['hum'][1]), 2)
                ph = round(random.uniform(ranges['ph'][0], ranges['ph'][1]), 2)
                rain = round(random.uniform(ranges['rain'][0], ranges['rain'][1]), 2)
                writer.writerow([N, P, K, temp, hum, ph, rain, crop])

if __name__ == '__main__':
    generate_dataset('ml/data/crop_data.csv')
    print("Dataset generated successfully.")
