# Run from repo root: uvicorn app.main:app --reload --app-dir backend
# Or from backend/: uvicorn app.main:app --reload
import uvicorn
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
