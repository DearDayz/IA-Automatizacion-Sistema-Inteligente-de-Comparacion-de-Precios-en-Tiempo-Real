from fastapi import APIRouter, Depends
import asyncpg
from app.database.dependencies import get_db
from app.scraping.scraping import scrape_pages

router = APIRouter()

@router.get("/")
async def read_products(conn: asyncpg.Connection = Depends(get_db)):
    result = await scrape_pages()
    return result