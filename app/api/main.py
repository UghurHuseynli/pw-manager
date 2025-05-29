from fastapi import APIRouter
from app.api.routes.v1 import users, login, credentials
from app.api.routes.v1.admin import main as admin

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(login.router)
api_router.include_router(credentials.router)
api_router.include_router(admin.admin_router)
