import json
from pathlib import Path

import numpy as np
import xgboost as xgb


FEATURE_COLUMNS = [
    "distanceKm",
    "trafficDurationMin",
    "weatherSeverity",
    "timeOfDay",
    "historicalDelayAvg",
    "eventImpactScore",
    "hoursUntilEvent"
]


def _to_number(value, field_name):
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field_name} must be numeric") from exc


def build_feature_row(payload):
    row = {
        "distanceKm": _to_number(payload["distanceKm"], "distanceKm"),
        "trafficDurationMin": _to_number(
            payload["trafficDurationMin"], "trafficDurationMin"
        ),
        "weatherSeverity": _to_number(payload["weatherSeverity"], "weatherSeverity"),
        "timeOfDay": _to_number(payload["timeOfDay"], "timeOfDay"),
        "historicalDelayAvg": _to_number(
            payload.get("historicalDelayAvg", 0), "historicalDelayAvg"
        ),
        "eventImpactScore": _to_number(
            payload.get("eventImpactScore", 0), "eventImpactScore"
        ),
        "hoursUntilEvent": _to_number(
            payload.get("hoursUntilEvent", 24), "hoursUntilEvent"
        ),
    }

    if row["distanceKm"] < 0:
        raise ValueError("distanceKm must be >= 0")
    if row["trafficDurationMin"] < 0:
        raise ValueError("trafficDurationMin must be >= 0")
    if not 0 <= row["weatherSeverity"] <= 10:
        raise ValueError("weatherSeverity must be between 0 and 10")
    if not 0 <= row["timeOfDay"] <= 23:
        raise ValueError("timeOfDay must be between 0 and 23")
    if row["historicalDelayAvg"] < 0:
        raise ValueError("historicalDelayAvg must be >= 0")

    row["timeOfDay"] = int(round(row["timeOfDay"]))
    return row


def get_risk_level(delay_probability):
    probability = max(0.0, min(float(delay_probability), 100.0))
    if probability < 30:
        return "Low"
    if probability < 70:
        return "Medium"
    return "High"


def build_explanation(features, delay_probability, risk_level):
    reasons = []

    if features["weatherSeverity"] >= 7:
        reasons.append("severe weather")
    elif features["weatherSeverity"] >= 4:
        reasons.append("rain exposure")

    if features["trafficDurationMin"] >= max(features["distanceKm"] * 1.4, 90):
        reasons.append("heavy traffic")

    if features["timeOfDay"] in {8, 9, 10, 17, 18, 19, 20}:
        reasons.append("peak-hour travel")

    if features["historicalDelayAvg"] >= 20:
        reasons.append("historical delay trend")

    if features["eventImpactScore"] >= 7 and features["hoursUntilEvent"] <= 6:
        reasons.append("major nearby event disruption")
    elif features["eventImpactScore"] >= 5:
        reasons.append("moderate event impact")

    if not reasons:
        reasons.append("stable route conditions")

    rounded_probability = round(float(delay_probability), 2)
    return (
        f"{risk_level} risk with {rounded_probability}% delay probability due to "
        f"{', '.join(reasons)}."
    )


def predict_delay_probability(model, features):
    if model is None:
        raise FileNotFoundError(
            "Model is not trained yet. Run train_model.py before calling /predict."
        )

    ordered = np.array([[features[column] for column in FEATURE_COLUMNS]], dtype=float)
    prediction = model.predict(ordered)[0]
    prediction = max(0.0, min(float(prediction), 100.0))
    return round(prediction, 2)


def load_artifacts(model_path, metadata_path):
    model_path = Path(model_path)
    metadata_path = Path(metadata_path)

    if not model_path.exists() or not metadata_path.exists():
        return None, {}

    model = xgb.XGBRegressor()
    model.load_model(model_path)

    with metadata_path.open("r", encoding="utf-8") as metadata_file:
        metadata = json.load(metadata_file)

    trained_columns = metadata.get("feature_columns") or []
    if list(trained_columns) != FEATURE_COLUMNS:
        return None, {
            **metadata,
            "artifact_error": (
                "Saved model feature schema does not match the current service. "
                "Retrain the model with train_model.py."
            ),
        }

    return model, metadata
