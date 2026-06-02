from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

chatbot_bp = Blueprint('chatbot', __name__)

BOT_ANSWERS = {
    'crop_selection': (
        "To select the best crop, you should check your soil N-P-K (Nitrogen, Phosphorus, Potassium) levels "
        "and pH. Wet-loving crops like Rice and Jute need rainfall above 150mm. Pulses like Chickpeas and "
        "Lentils thrive in drier conditions (rainfall under 90mm) with high phosphorus. Fruit crops like Grapes "
        "and Apples require very high potassium levels (~200 mg/kg)."
    ),
    'fertilizer': (
        "For optimal fertilizing, remember:\n"
        "1. Nitrogen deficiencies are fixed using Urea (46% N), applied in 2-3 split doses to reduce leaching.\n"
        "2. Phosphorus deficiencies are corrected using DAP (18-46-0) applied as a basal dose near root zones.\n"
        "3. Potassium deficiencies are solved using Muriate of Potash (MOP 60% K) in split dressings.\n"
        "Always incorporate organic compost or Farm Yard Manure (FYM) at 4-5 tons/acre during field preparation."
    ),
    'irrigation': (
        "Smart irrigation saves water and prevents waterlogging. For heavy clay soils, water every 7-10 days. "
        "For sandy soils, water every 3-4 days in smaller quantities. Fruit crops like Pomegranate, Mango, and "
        "Grapes have deep root systems and prefer drip irrigation. Avoid overhead watering in humid conditions "
        "to prevent fungal diseases."
    ),
    'disease': (
        "Crop diseases are mostly fungal or bacterial. Leaf Blight (early/late) shows target-like spots, while "
        "Rust presents orange pustules. Treatment includes applying copper hydroxide or broad-spectrum organic "
        "fungicides. Prevention requires crop rotation, using clean disease-certified seeds, and removing crop "
        "residues after harvest."
    ),
    'best_practices': (
        "General farming best practices:\n"
        "- Rotate crops: Don't plant nightshades (tomato/potato) in the same soil back-to-back.\n"
        "- Soil testing: Perform soil chemical analysis once every two years.\n"
        "- Mulching: Cover soil with straw or plastic sheets to conserve moisture and suppress weeds.\n"
        "- Integrated Pest Management (IPM): Combine biological controls (neem oil) before using chemical pesticides."
    ),
    'greeting': (
        "Hello! I am AgroMind AI, your smart farming assistant. How can I help you today? "
        "You can ask me about crop selection, fertilizer quantities, irrigation schedules, disease remedies, or general farming best practices."
    ),
    'default': (
        "I'm here to help with agricultural topics. Could you please specify if your query relates to crop selection, "
        "fertilizers, irrigation, leaf diseases (Tomato, Potato, Rice, Wheat, Corn), or general best practices?"
    )
}

@chatbot_bp.route('/message', methods=['POST'])
def send_message():
    data = request.get_json() or {}
    message = (data.get('message', '')).lower()
    
    if not message.strip():
        return jsonify({'response': "Please type a message."}), 400

    # Keyword routing logic
    if any(k in message for k in ['hello', 'hi', 'hey', 'greetings', 'start']):
        response = BOT_ANSWERS['greeting']
    elif any(k in message for k in ['crop', 'recommend', 'predict', 'suit', 'cultivate', 'plant']):
        response = BOT_ANSWERS['crop_selection']
    elif any(k in message for k in ['fertilizer', 'urea', 'dap', 'potash', 'npk', 'manure', 'compost', 'nutrient']):
        response = BOT_ANSWERS['fertilizer']
    elif any(k in message for k in ['water', 'irrigate', 'irrigation', 'drip', 'sprinkler', 'frequency', 'wet']):
        response = BOT_ANSWERS['irrigation']
    elif any(k in message for k in ['disease', 'blight', 'rust', 'mildew', 'spot', 'rot', 'infect', 'fungi', 'bacteria', 'heal']):
        response = BOT_ANSWERS['disease']
    elif any(k in message for k in ['practice', 'best', 'rotation', 'mulch', 'pest', 'weed', 'soil test']):
        response = BOT_ANSWERS['best_practices']
    else:
        response = BOT_ANSWERS['default']

    return jsonify({
        'response': response
    }), 200
