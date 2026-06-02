import unittest
import json
import os
import sys

# Add root folder to python path to resolve modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.app.models import db, User

class AgroMindAPITest(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_health_check(self):
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')

    def test_user_authentication_flow(self):
        # 1. Register User
        reg_payload = {
            'name': 'Test Farmer',
            'email': 'farmer_test@agromind.com',
            'password': 'password123',
            'role': 'farmer'
        }
        res_reg = self.client.post('/api/auth/register', 
                                    data=json.dumps(reg_payload),
                                    content_type='application/json')
        self.assertEqual(res_reg.status_code, 201)
        data_reg = json.loads(res_reg.data)
        self.assertIn('token', data_reg)

        # 2. Login User
        login_payload = {
            'email': 'farmer_test@agromind.com',
            'password': 'password123'
        }
        res_login = self.client.post('/api/auth/login', 
                                      data=json.dumps(login_payload),
                                      content_type='application/json')
        self.assertEqual(res_login.status_code, 200)
        data_login = json.loads(res_login.data)
        token = data_login['token']

        # 3. Fetch profile with token
        res_prof = self.client.get('/api/auth/profile', 
                                   headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res_prof.status_code, 200)
        data_prof = json.loads(res_prof.data)
        self.assertEqual(data_prof['email'], 'farmer_test@agromind.com')

    def test_crop_prediction(self):
        # Run prediction without authentication (optional auth supported)
        predict_payload = {
            'nitrogen': 90.0,
            'phosphorus': 42.0,
            'potassium': 43.0,
            'ph': 6.2,
            'temperature': 25.0,
            'humidity': 80.0,
            'rainfall': 220.0,
            'season': 'Kharif',
            'state': 'Maharashtra',
            'district': 'Pune'
        }
        response = self.client.post('/api/predictions/predict',
                                    data=json.dumps(predict_payload),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('crop', data)
        self.assertIn('confidence', data)
        self.assertIn('fertilizer_recommendation', data)
        self.assertIn('irrigation_recommendation', data)
        self.assertIn('feature_importance', data)

if __name__ == '__main__':
    unittest.main()
