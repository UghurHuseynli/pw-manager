from fastapi import FastAPI
from app.core.config import settings
from app.api import main

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.include_router(
    main.api_router,
    prefix=settings.API_V1_STR,
)
