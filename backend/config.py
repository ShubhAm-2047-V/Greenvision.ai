import os
from datetime import timedelta

class Config:
    # Secret Key for session signing
    SECRET_KEY = os.environ.get('SECRET_KEY', 'agromind-ai-super-secret-key-987654321')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-agromind-ai-secret-key-123456789')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Database Configuration
    # Fallback to sqlite if mysql environment variables aren't provided
    db_user = os.environ.get('DB_USER', 'root')
    db_password = os.environ.get('DB_PASSWORD', '')
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_port = os.environ.get('DB_PORT', '3306')
    db_name = os.environ.get('DB_NAME', 'agromind_db')
    
    MYSQL_URI = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    # Check if mysql environment variables or a specific mysql URL is requested, else use sqlite
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    elif os.environ.get('USE_MYSQL') == 'true' or db_password != '':
        SQLALCHEMY_DATABASE_URI = MYSQL_URI
    else:
        # Local fallback
        base_dir = os.path.dirname(os.path.abspath(__file__))
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(base_dir, 'agromind.db')}"
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # File upload settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max limit
    
    # Weather API Configuration (prefill defaults if key not supplied)
    OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')
