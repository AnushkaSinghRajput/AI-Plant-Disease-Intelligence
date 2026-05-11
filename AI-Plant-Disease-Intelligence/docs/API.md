# AI Plant Disease Intelligence Platform — API Specification

Base URL: `http://localhost:8000` (or deployment URL)

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Exchange Firebase ID token for JWT. Body: `{"id_token": "..."}` |

## Predictions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/predictions/upload` | Bearer | Upload image, run inference, return class + remedies |
| GET | `/api/predictions/history` | Bearer | User prediction history |
| GET | `/api/predictions/classes` | Optional | List disease classes |

## Semantic Search

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search?q=<query>&limit=20&crop=<crop>` | Bearer | Natural-language search over disease database |

## Explainability

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/explain/gradcam` | Bearer | Upload image, return Grad-CAM heatmap (base64 PNG) |
| GET | `/api/explain/feature-importance/{class_name}` | Bearer | Feature importance for a disease class |

## Recommendations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/recommendations?disease=<>&crop=<>&use_llm=false` | Bearer | Treatments, best practices, linked research |

## Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/analytics` | Admin | Total predictions, users, top diseases, by-day |
| GET | `/api/admin/predictions` | Admin | Recent predictions (all users) |
| POST | `/api/admin/model/upload` | Admin | Upload .h5 or .tflite model |
