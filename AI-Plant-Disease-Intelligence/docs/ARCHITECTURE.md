# AI Plant Disease Intelligence Platform — Enterprise Architecture

## System Overview

```
                                    ┌───────────────────────────────────────────────────────────────────┐
                                    │                    CLIENT (PWA / Mobile / Desktop)                 │
                                    │  Next.js 14 │ Tailwind │ Framer Motion │ D3/Chart.js │ Zustand     │
                                    │  Parallax │ Smart Search │ AI Onboarding │ Modular Cards │ Dark/Light │
                                    └────────────────────────────────────────────┬──────────────────────────┘
                                                                                 │ HTTPS / REST / WebSocket
                                                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           API GATEWAY / FASTAPI                                                   │
│  /api/auth │ /api/predictions │ /api/search │ /api/analytics │ /api/explain │ /api/recommendations │ /api/admin  │
│  JWT (farmer, researcher, agronomist, admin) │ CORS │ Rate Limiting │ Prometheus Metrics                          │
└──────┬────────────┬────────────┬────────────┬────────────┬────────────┬────────────┬────────────┬────────────────┘
       │            │            │            │            │            │            │            │
       ▼            ▼            ▼            ▼            ▼            ▼            ▼            ▼
┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Firebase │ │ Redis Queue  │ │ ML       │ │ Semantic │ │ Grad-CAM │ │ Recommend│ │ Storage  │ │ Monitoring   │
│ Auth     │ │ (Celery/RQ)  │ │ Inference│ │ Search   │ │ Explain  │ │ Engine   │ │ S3       │ │ Prometheus   │
│ SMS/Email│ │ Background   │ │ CNN+ViT  │ │ Embedding│ │ Heatmaps │ │ LLM API  │ │ Firestore│ │ Grafana      │
└──────────┘ └──────────────┘ └────┬─────┘ └────┬─────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘
                                   │            │
                                   ▼            ▼
                            ┌─────────────────────────────────────┐
                            │     MongoDB / Firestore              │
                            │  users │ predictions │ crops │       │
                            │  diseases │ analytics │ embeddings   │
                            └─────────────────────────────────────┘
```

## User Roles

| Role       | Permissions |
|-----------|-------------|
| farmer    | Upload images, view predictions, crop history, reports, badges |
| researcher| + Search disease DB, export analytics, linked research |
| agronomist| + Recommendations, best practices, regional insights |
| admin     | + Manage diseases, models, users, metadata |

## Data Flow

1. **Image Upload**: Drag-n-drop or mobile → S3/Firebase → Preprocess → Queue inference job
2. **Prediction**: Worker loads CNN+ViT hybrid → Classification + optional segmentation mask
3. **Explainability**: Grad-CAM heatmap overlay → Feature importance → Confidence explanation
4. **Search**: Natural-language query → Embedding → Similarity search → Clustered results
5. **Analytics**: Aggregated by region, crop, time → Heatmaps, trends, D3/Chart.js dashboards
