from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.users import router as users_router
from api.documents import router as documents_router
from api.sharing import router as sharing_router


app = FastAPI(
    title="Ajaia Docs API",
    description="Backend API for the Ajaia collaborative document editor.",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users_router)
app.include_router(documents_router)
app.include_router(sharing_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}