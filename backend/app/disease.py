import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from backend.app.models import db, DiseaseRecord
from ml.disease_classifier import predict_leaf_disease

disease_bp = Blueprint('disease', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@disease_bp.route('/detect', methods=['POST'])
@jwt_required(optional=True)
def detect_disease():
    if 'image' not in request.files:
        return jsonify({'message': 'No image file uploaded'}), 400
        
    file = request.files['image']
    crop_type = request.form.get('crop_type')
    
    if not crop_type:
        return jsonify({'message': 'Crop type is required (e.g. tomato, potato, rice, wheat, corn)'}), 400

    crop_type = crop_type.lower()
    if crop_type not in ['tomato', 'potato', 'rice', 'wheat', 'corn']:
        return jsonify({'message': 'Supported crops for disease detection are: tomato, potato, rice, wheat, corn'}), 400

    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'message': 'Supported image formats are: png, jpg, jpeg'}), 400

    try:
        filename = secure_filename(file.filename)
        # Create a unique filename to avoid overwrites
        import uuid
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_name)
        file.save(upload_path)

        # Predict leaf disease
        res = predict_leaf_disease(upload_path, crop_type)
        if 'error' in res:
            return jsonify({'message': res['error']}), 400

        # Save record to database if user is authenticated
        user_id = get_jwt_identity()
        record_id = None
        if user_id:
            user_id = int(user_id)
            # Create disease record
            record = DiseaseRecord(
                user_id=user_id,
                crop_type=crop_type,
                disease_name=res['disease_name'],
                confidence=res['confidence'],
                symptoms=res['symptoms'],
                treatment=res['treatment'],
                prevention=res['prevention'],
                image_path=unique_name
            )
            db.session.add(record)
            db.session.commit()
            record_id = record.id

        return jsonify({
            'record_id': record_id,
            'crop': crop_type.capitalize(),
            'disease_name': res['disease_name'],
            'confidence': res['confidence'],
            'symptoms': res['symptoms'],
            'treatment': res['treatment'],
            'prevention': res['prevention'],
            'image_url': f"/api/disease/images/{unique_name}"
        }), 200

    except Exception as e:
        return jsonify({'message': f"Failed to process image: {str(e)}"}), 500

# Endpoint to serve uploaded disease images
@disease_bp.route('/images/<filename>', methods=['GET'])
def get_image(filename):
    from flask import send_from_directory
    safe_filename = secure_filename(filename)
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], safe_filename)

@disease_bp.route('/records', methods=['GET'])
@jwt_required()
def get_records():
    user_id = get_jwt_identity()
    records = DiseaseRecord.query.filter_by(user_id=user_id).order_by(DiseaseRecord.created_at.desc()).all()
    return jsonify([r.to_dict() for r in records]), 200
