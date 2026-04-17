# ml_api.py
import os
import pandas as pd
import joblib
from flask import Flask, request, jsonify

app = Flask(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model_output')
CASHFLOW_MODEL_PATH = os.path.join(MODEL_DIR, 'cashflow_forecaster (1).pkl')
RISK_MODEL_PATH = os.path.join(MODEL_DIR, 'risk_classifier (1).pkl')

cashflow_model = None
risk_model = None

try:
    cashflow_model = joblib.load(CASHFLOW_MODEL_PATH)
    risk_model = joblib.load(RISK_MODEL_PATH)
    print("[OK] Models loaded successfully")
except Exception as e:
    print(f"[WARN] Could not load ML models: {e}")
    print("[INFO] Will use rule-based fallback for predictions")

def rule_based_predict(data):
    """Simple rule-based fallback when ML models are unavailable."""
    sales = float(data.get('sales', 0))
    expenses = float(data.get('expenses', 0))
    udhaar_given = float(data.get('udhaar_given', 0))
    inventory_value = float(data.get('inventory_value', 0))
    
    # Cashflow prediction: weighted estimate of tomorrow's cashflow
    cashflow_prediction = (sales * 0.95) - (expenses * 0.08) + (inventory_value * 0.01)
    
    # Risk: 0-1 score based on expense ratio and outstanding udhaar
    expense_ratio = expenses / (sales + 1)
    udhaar_ratio = udhaar_given / (sales + 1)
    risk_prediction = min(1.0, (expense_ratio * 0.6) + (udhaar_ratio * 0.4))
    
    return cashflow_prediction, risk_prediction

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        required_fields = ["sales", "expenses", "cash_balance", "udhaar_given", "udhaar_collected", "inventory_value"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Try ML models first, fall back to rules if unavailable
        if cashflow_model and risk_model:
            try:
                df = pd.DataFrame([data])
                df['expense_ratio'] = df['expenses'] / (df['sales'] + 1)
                df['net_cash'] = df['sales'] - df['expenses']
                cashflow_prediction = float(cashflow_model.predict(df)[0])
                risk_prediction = float(risk_model.predict(df)[0])
                source = "ml_model"
            except Exception as model_err:
                print(f"⚠️ Model prediction failed, using fallback: {model_err}")
                cashflow_prediction, risk_prediction = rule_based_predict(data)
                source = "rule_based_fallback"
        else:
            cashflow_prediction, risk_prediction = rule_based_predict(data)
            source = "rule_based_fallback"

        return jsonify({
            "cashflow_prediction": cashflow_prediction,
            "risk_prediction": risk_prediction,
            "source": source
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "models_loaded": cashflow_model is not None and risk_model is not None
    })

if __name__ == '__main__':
    app.run(port=8000, debug=False)
