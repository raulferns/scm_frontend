require("dotenv").config();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
const ML_HEALTH_URL = `${ML_SERVICE_URL}/health`;
const ML_PREDICT_URL = `${ML_SERVICE_URL}/predict`;
const ML_REQUEST_TIMEOUT_MS = Number(process.env.ML_REQUEST_TIMEOUT_MS) || 25000;
const ML_WAKE_RETRIES = Number(process.env.ML_WAKE_RETRIES) || 3;
const ML_RETRY_DELAY_MS = Number(process.env.ML_RETRY_DELAY_MS) || 4000;

function getRiskLevel(delayProbability) {
  const probability = Number(delayProbability) || 0;

  if (probability < 30) {
    return "Low";
  }

  if (probability < 70) {
    return "Medium";
  }

  return "High";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = ML_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function wakeMlService() {
  for (let attempt = 1; attempt <= ML_WAKE_RETRIES; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        ML_HEALTH_URL,
        {
          method: "GET",
        },
        ML_REQUEST_TIMEOUT_MS
      );

      if (response.ok) {
        return;
      }
    } catch (error) {
      if (attempt === ML_WAKE_RETRIES) {
        throw error;
      }
    }

    if (attempt < ML_WAKE_RETRIES) {
      await sleep(ML_RETRY_DELAY_MS);
    }
  }
}

async function requestPrediction(features) {
  return fetchWithTimeout(
    ML_PREDICT_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(features),
    },
    ML_REQUEST_TIMEOUT_MS
  );
}

async function predictShipmentDelay(features) {
  let response;

  try {
    response = await requestPrediction(features);
  } catch (error) {
    try {
      await wakeMlService();
      await sleep(1500);
      response = await requestPrediction(features);
    } catch (wakeError) {
      throw new Error(
        `Could not reach ML service at ${ML_SERVICE_URL}. It may still be waking from Render free-tier sleep.`
      );
    }
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status >= 500 && response.status < 600) {
      try {
        await wakeMlService();
        await sleep(1500);
        response = await requestPrediction(features);
        const retryPayload = await response.json().catch(() => ({}));

        if (response.ok) {
          return {
            delayProbability: Number(retryPayload.delayProbability) || 0,
            riskLevel:
              retryPayload.riskLevel || getRiskLevel(retryPayload.delayProbability),
            explanation: retryPayload.explanation || "",
            modelVersion: retryPayload.modelVersion || "xgboost-regressor-v1",
            features: retryPayload.features || features,
          };
        }
      } catch (retryError) {
        // Fall through to the standard error below.
      }
    }

    const message =
      payload.error || payload.message || "ML service prediction failed";
    throw new Error(message);
  }

  return {
    delayProbability: Number(payload.delayProbability) || 0,
    riskLevel: payload.riskLevel || getRiskLevel(payload.delayProbability),
    explanation: payload.explanation || "",
    modelVersion: payload.modelVersion || "xgboost-regressor-v1",
    features: payload.features || features,
  };
}

module.exports = {
  predictShipmentDelay,
};
