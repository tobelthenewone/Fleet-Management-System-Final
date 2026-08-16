from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask import Flask
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
# Load your trained model
model = joblib.load(open('maintenance_model.pkl', 'rb'))

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        input_df = pd.DataFrame([{
            'age': data['age'],
            'mileage': data['mileage'],
            'last_service_km': data['last_service_km'],
            'recent_breakdown': data['recent_breakdown'],
            'maintenance_last_month': data['maintenance_last_month']
        }])

        prediction = model.predict(input_df)[0]

        return jsonify({'maintenance_required': int(prediction)})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
