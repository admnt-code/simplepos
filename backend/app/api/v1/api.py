"""
API Router Aggregation
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, members, products, sumup, transactions, guests, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(members.router, prefix="/members", tags=["members"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(sumup.router, prefix="/sumup", tags=["sumup"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(guests.router, prefix="/guests", tags=["guests"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
