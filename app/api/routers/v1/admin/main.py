from fastapi import APIRouter, Depends
from app.api.routers.v1.admin import users, credentials
from app.api.dependencies import get_current_active_superuser


admin_router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(get_current_active_superuser)],
)

admin_router.include_router(users.router)
admin_router.include_router(credentials.router)
