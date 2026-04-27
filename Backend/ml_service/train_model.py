import json
from datetime import datetime, timezone
from pathlib import Path
import numpy as np

import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
import xgboost as xgb

from generate_synthetic_data import generate_dataset
from model_utils import FEATURE_COLUMNS


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DATASET_PATH = DATA_DIR / "synthetic_shipments.csv"
MODEL_PATH = MODELS_DIR / "delay_model.json"
METADATA_PATH = MODELS_DIR / "metadata.json"


def ensure_dataset():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if not DATASET_PATH.exists():
        dataset = generate_dataset()
        dataset.to_csv(DATASET_PATH, index=False)

    return pd.read_csv(DATASET_PATH)


def main():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    dataset = ensure_dataset()

    event_scores = np.random.randint(0, 10, size=len(dataset))

    hours_until = np.random.uniform(0, 24, size=len(dataset))
    dataset["eventImpactScore"] = event_scores
    dataset["hoursUntilEvent"] = hours_until

    dataset["delayProbability"] += (
        event_scores * (1 - (hours_until / 24)) * 2
    )

    dataset["delayProbability"] = dataset["delayProbability"].clip(0, 100)

    features = dataset[FEATURE_COLUMNS]
    target = dataset["delayProbability"]

    x_train, x_test, y_train, y_test = train_test_split(
        features, target, test_size=0.2, random_state=42
    )

    model = xgb.XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="reg:squarederror",
        random_state=42,
    )

    model.fit(x_train, y_train)

    predictions = model.predict(x_test)
    predictions = predictions.clip(0, 100)

    rmse = mean_squared_error(y_test, predictions) ** 0.5
    metadata = {
        "model_version": "xgboost-regressor-v2",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "feature_columns": FEATURE_COLUMNS,
        "metrics": {
            "rmse": round(float(rmse), 4),
            "mae": round(float(mean_absolute_error(y_test, predictions)), 4),
            "r2": round(float(r2_score(y_test, predictions)), 4),
        },
        "train_rows": int(len(x_train)),
        "test_rows": int(len(x_test)),
    }

    model.save_model(MODEL_PATH)

    with METADATA_PATH.open("w", encoding="utf-8") as metadata_file:
        json.dump(metadata, metadata_file, indent=2)

    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved metadata to {METADATA_PATH}")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
