from fastapi import APIRouter

from app.api.v1.endpoints import auth, branches, notifications, queue, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users / Profil"])
api_router.include_router(branches.router, prefix="/branches", tags=["Xizmatlar (Branches)"])
api_router.include_router(queue.router, prefix="/queue", tags=["Navbat (Queue)"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Push Notifications"])
