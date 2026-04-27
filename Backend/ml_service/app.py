from pathlib import Path

from flask import Flask, jsonify, request

from model_utils import (
    FEATURE_COLUMNS,
    build_explanation,
    build_feature_row,
    get_risk_level,
    load_artifacts,
    predict_delay_probability,
    
)


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "delay_model.json"
METADATA_PATH = BASE_DIR / "models" / "metadata.json"

app = Flask(__name__)

model = None
metadata = None


def refresh_model():
    global model, metadata
    model, metadata = load_artifacts(MODEL_PATH, METADATA_PATH)


refresh_model()


@app.get("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "service": "shipment-ml",
            "modelLoaded": model is not None,
            "modelVersion": metadata.get("model_version") if metadata else None,
            "artifactError": metadata.get("artifact_error") if metadata else None,
        }
    )


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    missing = [field for field in FEATURE_COLUMNS if field not in payload]
    if missing:
        return (
            jsonify({"error": f"Missing required fields: {', '.join(missing)}"}),
            400,
        )

    try:
        features = build_feature_row(payload)
        delay_probability = predict_delay_probability(model, features)
        risk_level = get_risk_level(delay_probability)

        response = {
            "delayProbability": delay_probability,
            "riskLevel": risk_level,
            "modelVersion": metadata.get("model_version"),
            "explanation": build_explanation(features, delay_probability, risk_level),
            "features": features,
        }
        return jsonify(response)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {exc}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
