# AI Plant Disease Intelligence Platform

**Enterprise-grade AI platform for plant disease identification and agritech insights.**  
Semantic search, Grad-CAM explainability, treatment recommendations, and interactive dashboards. Built for farmers, researchers, and agronomists—fully functional out of the box with demo mode (no sign-in required).

---

## Quick Start — Try It in 2 Minutes

You can use the platform **immediately** without Firebase, MongoDB, or any API keys:

```bash
# Terminal 1 — Backend
cd Plant-Disease-Identification-using-CNN-master
pip install fastapi uvicorn python-multipart Pillow pydantic pydantic-settings python-dotenv pymongo firebase-admin email-validator
uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend

# Terminal 2 — Frontend
cd Plant-Disease-Identification-using-CNN-master/frontend
npm install && npx next dev
```

Open **http://localhost:3000** and:

1. **Upload a leaf image** — Drag & drop or click the upload zone (JPG, PNG).
2. **Get instant diagnosis** — Disease name, confidence, severity, and remedy suggestions.
3. **Demo mode** — Works without signing in. Sign in (Firebase) to save history and access dashboard.

---

## Platform Overview

### What It Does

- **Leaf image analysis** — Upload a photo of a diseased leaf (e.g., pepper, tomato, potato, corn).
- **AI classification** — CNN-based model identifies 38 disease classes from the PlantVillage dataset.
- **Treatment recommendations** — Practical remedies from agronomic best practices.
- **Severity estimation** — Low, moderate, or high based on disease type and confidence.
- **Demo mode** — Try predictions without creating an account.

### Key Features

| Feature | Description |
|--------|-------------|
| **Demo Predictions** | Upload and analyze images without sign-in. |
| **Drag & Drop** | Mobile-friendly upload with drag-and-drop support. |
| **Treatment Suggestions** | Curated remedies for each disease. |
| **Dashboard** | Prediction history and charts (requires sign-in). |
| **Semantic Search** | Natural-language search over disease database (requires sign-in). |
| **Dark / Light Mode** | Toggle in navbar. |
| **Multilingual** | English and हिंदी (Hindi) UI. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser / PWA)                            │
│  Next.js │ Parallax Hero │ Smart Search │ Upload Zone │ Modular Cards   │
└────────────────────────────────────────────┬────────────────────────────┘
                                             │ REST / HTTPS
                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API (FastAPI)                                   │
│  /api/predictions/demo (no auth) │ /upload (auth) │ /search │ /admin     │
└──────┬──────────────────┬──────────────────┬────────────────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────────┐
│ ML Inference │  │ Remedies DB  │  │ MongoDB (optional, for history)      │
│ CNN / TFLite │  │ severity.json│  │ Firebase (optional, for auth/storage)│
│ or Demo      │  │ remedies.json│  │                                      │
└──────────────┘  └──────────────┘  └──────────────────────────────────────┘
```

### Demo vs. Full Mode

| Mode | Sign-in | Predictions | History | Storage |
|------|---------|-------------|---------|---------|
| **Demo** | Not required | ✅ | ❌ | Local only |
| **Full** | Firebase | ✅ | ✅ | S3 / Firebase |

---

## Detailed Setup Guide

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **npm** or **yarn**

### 1. Environment Configuration

```bash
cp .env.example .env
```

For **demo-only** use, you can leave `.env` as is. For full features:

- **Firebase** — Enable Email/Password and Google sign-in in Firebase Console. Add `NEXT_PUBLIC_FIREBASE_*` and `FIREBASE_*` keys.
- **MongoDB** — Local: `mongodb://localhost:27017` or MongoDB Atlas connection string.
- **AWS S3** (optional) — For image storage instead of local filesystem.

### 2. Backend Installation and Run

```bash
cd Plant-Disease-Identification-using-CNN-master/backend
pip install -r requirements.txt
```

From **project root**:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --app-dir backend
```

The backend serves:

- `http://localhost:8000` — API
- `http://localhost:8000/docs` — Swagger UI
- `http://localhost:8000/health` — Health check

### 3. Frontend Installation and Run

```bash
cd Plant-Disease-Identification-using-CNN-master/frontend
npm install
npx next dev
```

Open **http://localhost:3000**.

### 4. Training Your Own Model (Optional)

To train on PlantVillage:

```bash
# Download PlantVillage from Kaggle and place in dataset/
python model/train.py --data-dir dataset/train --backbone mobilenetv2 --epochs 15 --save-tflite
```

This produces:

- `model/saved_models/plant_disease_mobilenet.h5`
- `model/saved_models/plant_disease_mobilenet.tflite`
- `model/labels/class_names.json`

If no model is present, the platform uses a **demo fallback** that returns plausible disease classes and remedies for testing.

---

## API Reference

Base URL: `http://localhost:8000`

### Predictions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/predictions/demo` | None | Demo prediction (no sign-in). Form: `file`, `language` |
| POST | `/api/predictions/upload` | Bearer | Full prediction with history. Form: `file`, `use_ai_remedies`, `language` |
| GET | `/api/predictions/classes` | None | List of disease class names |
| GET | `/api/predictions/history` | Bearer | User prediction history |

### Response Format

```json
{
  "class_id": "19",
  "class_name": "Pepper,_bell___Bacterial_spot",
  "confidence": 0.85,
  "severity_estimate": "moderate",
  "remedies": [
    "Use copper sprays and resistant varieties",
    "Avoid working when plants are wet",
    "Remove infected plant debris"
  ]
}
```

---

## Supported Diseases (PlantVillage Classes)

The model recognizes 38 classes, including:

- **Tomato**: Bacterial spot, Early blight, Late blight, Leaf Mold, Septoria leaf spot, Spider mites, Target Spot, Yellow Leaf Curl Virus, mosaic virus, healthy
- **Potato**: Early blight, Late blight, healthy
- **Pepper**: Bacterial spot, healthy
- **Corn**: Cercospora leaf spot, Common rust, Northern Leaf Blight, healthy
- **Apple, Grape, Cherry, Peach, Strawberry, Squash, etc.**

For the leaf you shared (Cercospora-like symptoms on pepper), the platform may classify it as **Pepper Bacterial spot** or **Corn Cercospora leaf spot**, depending on the model or demo fallback.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Framer Motion, Recharts, Zustand |
| Backend | FastAPI, Uvicorn, Pydantic |
| Auth | Firebase Auth (Email/Google), JWT |
| Database | MongoDB (optional) |
| Storage | Local / S3 / Firebase Storage |
| ML | TensorFlow/Keras, MobileNetV2, TFLite |

---

## Folder Structure

```
AI-Plant-Disease-Intelligence/
├── backend/                 # FastAPI backend
├── frontend/                # Next.js client
├── model/                   # Saved model files + notebooks
│   ├── train.py
│   ├── labels/class_names.json
│   └── saved_models/        # .h5, .tflite
├── docs/
│   ├── architecture.png
│   ├── screenshots/
│   ├── roadmap.pdf
│   ├── ARCHITECTURE.md
│   └── API.md
├── .env.example
├── docker-compose.yml
├── .gitignore
├── README.md
├── requirements.txt
└── package.json
```

---

## Troubleshooting

### "Prediction failed" or "Please select an image file"

- Ensure you select a valid image (JPG, PNG).
- Confirm the backend is running at `http://localhost:8000`.
- Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in the frontend `.env.local`.

### "Please sign in to run prediction"

- For **demo mode** (no sign-in), the frontend should call `/api/predictions/demo`. Ensure you are on the latest version of the `UploadZone` component.
- If you see this message, try refreshing; the demo endpoint does not require auth.

### No remedies or "Unknown" disease

- Check that `backend/data/remedies.json` and `backend/data/severity.json` exist.
- The demo fallback returns one of several common diseases. Training a model improves accuracy.

### Backend fails to start

- Install dependencies: `pip install -r backend/requirements.txt`
- For TensorFlow issues, use Python 3.10–3.11.

### Frontend build errors

- Use Node 18+: `node -v`
- Clear cache: `rm -rf frontend/.next frontend/node_modules && npm install`

---

## License and Acknowledgments

- **Dataset**: PlantVillage (Kaggle)
- **Model**: Transfer learning with MobileNetV2 / ResNet50

---

For questions or contributions, open an issue or pull request.
