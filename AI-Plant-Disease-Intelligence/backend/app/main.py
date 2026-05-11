"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.exceptions import global_exception_handler
from app.routes import auth_routes, prediction_routes, admin_routes, search_routes, explain_routes, recommendations_routes, model_comparison_routes

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version="2.0.0",
    description="AI Plant Disease Intelligence Platform — Enterprise API",
)
app.add_exception_handler(Exception, global_exception_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api")
app.include_router(prediction_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")
app.include_router(search_routes.router, prefix="/api")
app.include_router(explain_routes.router, prefix="/api")
app.include_router(recommendations_routes.router, prefix="/api")
app.include_router(model_comparison_routes.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "AI Plant Disease Intelligence Platform", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
