from fastapi import APIRouter, Depends
import asyncpg
from app.database.dependencies import get_db

router = APIRouter()

@router.get("/")
async def read_products(conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch("SELECT * FROM Product")
    return rows