from fastapi import APIRouter
from app.api.routes.v1 import users, login

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(login.router)
