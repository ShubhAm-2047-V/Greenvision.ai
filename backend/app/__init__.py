import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config
from backend.app.models import db, User

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)

    # Ensure upload and reports directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'reports'), exist_ok=True)

    # Register blueprints
    from backend.app.auth import auth_bp
    from backend.app.predictions import predictions_bp
    from backend.app.disease import disease_bp
    from backend.app.chatbot import chatbot_bp
    from backend.app.utils import utils_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(predictions_bp, url_prefix='/api/predictions')
    app.register_blueprint(disease_bp, url_prefix='/api/disease')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(utils_bp, url_prefix='/api/utils')

    # Create tables with database retry loop for production robustness
    with app.app_context():
        import time
        retries = 6
        success = False
        while retries > 0:
            try:
                db.create_all()
                success = True
                break
            except Exception as e:
                retries -= 1
                print(f"Database connection waiting... Retries left: {retries}. Error: {e}")
                time.sleep(3)

        if success:
            try:
                # Create a default admin user if not exists
                admin = User.query.filter_by(email='admin@agromind.com').first()
                if not admin:
                    new_admin = User(
                        name='AgroMind Admin',
                        email='admin@agromind.com',
                        role='admin'
                    )
                    new_admin.set_password('admin123')
                    db.session.add(new_admin)
                    db.session.commit()
                    print("Default admin created successfully.")
            except Exception as e:
                print(f"Error checking/creating default admin: {e}")
        else:
            print("Failed to connect to database after several retries.")

    from flask import render_template

    @app.route('/')
    @app.route('/<path:path>')
    def index(path=None):
        return render_template('index.html')

    @app.route('/health')
    def health():
        return {'status': 'healthy', 'message': 'AgroMind API is running'}, 200

    return app
