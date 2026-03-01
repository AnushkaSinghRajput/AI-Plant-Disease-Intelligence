"""Minimal tests for API."""
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_login_missing_token():
    r = client.post("/api/auth/login", json={})
    assert r.status_code in (200, 422)  # 422 if validation fails


def test_predictions_unauthorized():
    r = client.get("/api/predictions/history")
    assert r.status_code == 401
