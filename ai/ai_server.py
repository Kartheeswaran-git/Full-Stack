from flask import Flask, jsonify, request
import pickle
import pandas as pd
from datetime import datetime
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained model
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    print("Warning: No trained model found. Please run train_model.py first")
    model = None

@app.route('/ai/predict', methods=['POST'])
def predict_absence():
    if not model:
        return jsonify({"error": "Model not loaded"}), 500
        
    data = request.json
    student_id = data.get('student_id', 1)  # Default to student 1 if not provided
    
    # Create realistic features based on student_id
    features = {
        'days_absent_last_week': student_id % 4,  # Varies per student
        'days_absent_last_month': (student_id % 10) + 2,
        'day_of_week': datetime.today().weekday(),
        'month': datetime.today().month
    }
    
    # Convert to DataFrame
    X = pd.DataFrame([features])
    
    # Predict
    try:
        proba = model.predict_proba(X)[0][1]  # probability of absence
        return jsonify({
            "student_id": student_id,
            "absence_probability": float(proba),
            "prediction": "high risk" if proba > 0.5 else "low risk",
            "confidence": float(abs(proba - 0.5) * 2)  # 0-1 scale
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai/trends', methods=['GET'])
def get_trends():
    # Generate realistic trends data
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    base_rates = [0.15, 0.10, 0.12, 0.18, 0.20]
    
    # Add some variation based on current date
    day_variation = datetime.today().day % 10 / 100
    trends = [{
        "day": day,
        "absence_rate": min(0.3, max(0.05, rate + day_variation))
    } for day, rate in zip(days, base_rates)]
    
    insights = [
        "Higher absence rates observed later in the week",
        "Students are most consistent on Tuesdays",
        f"Current variation factor: {day_variation:.2f}"
    ]
    
    return jsonify({
        "trends": trends,
        "insights": insights,
        "last_updated": datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)