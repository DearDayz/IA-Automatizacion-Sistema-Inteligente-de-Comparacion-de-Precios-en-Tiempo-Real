from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.routers import products, items, scraping

import asyncpg
from app.database.tables import create_tables
from app.database.dependencies import get_db
from app.database.connection import (
    initialize_connection_pool,
    close_connection_pool,
)

from app.scraping.scraping import scrape_pages

@asynccontextmanager
async def lifespan(app: FastAPI, conn: asyncpg.Connection = Depends(get_db)):
    await initialize_connection_pool()
    await create_tables()

    scheduler = AsyncIOScheduler()

    # Para testear el scraper
    # scheduler.add_job(scrape_pages, 'interval', minutes=60)

    # Cron job para produccion
    scheduler.add_job(scrape_pages, 'cron', day_of_week='sun', hour=2)
    scheduler.start()

    yield # Separa el código de inicio del código de cierre de la aplicación
    scheduler.shutdown()
    await close_connection_pool()

app = FastAPI(lifespan=lifespan) 

app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(items.router, prefix="/items", tags=["items"])
app.include_router(scraping.router, prefix="/scrape", tags=["scraping"])