from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler

import asyncpg
from app.database.tables import create_tables
from app.database.connection import (
    initialize_connection_pool,
    get_connection,
    release_connection,
    close_connection_pool,
)

from app.scraping.scraping import scrape_pages

async def get_db():
    conn = await get_connection()
    try:
        yield conn
    finally:
        await release_connection(conn)

@asynccontextmanager
async def lifespan(app: FastAPI, conn: asyncpg.Connection = Depends(get_db)):
    await initialize_connection_pool()
    await create_tables()

    scheduler = AsyncIOScheduler()

    # Para testear el scraper
    # scheduler.add_job(scrape_pages, 'interval', minutes=1)

    # Cron job para produccion
    scheduler.add_job(scrape_pages, 'cron', day_of_week='sun', hour=2)
    scheduler.start()

    yield # Separa el código de inicio del código de cierre de la aplicación
    scheduler.shutdown()
    await close_connection_pool()

app = FastAPI(lifespan=lifespan) 

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/products/")
async def read_items(conn: asyncpg.Connection = Depends(get_db)):
    await scrape_pages()
    rows = await conn.fetch("SELECT * FROM Product")
    return rows

@app.get("/items/")
async def read_items(conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch("""
        SELECT
            Item.id AS item_id,
            Item.name AS item_name,
            Item.category AS item_category,
            Item.embedding AS item_embedding,
            Product.id AS product_id,
            Product.name AS product_name,
            Product.tendency AS product_tendency,
            Product.url AS product_url,
            Product.price AS product_price,
            Product.sale_price AS product_sale_price,
            Product.image AS product_image
        FROM Item
        LEFT JOIN Product ON Item.id = Product.item_id
    """)
    # Organizar los resultados para agrupar los productos por item
    items = {}
    for row in rows:
        item_id = row['item_id']
        if item_id not in items:
            items[item_id] = {
                'id': row['item_id'],
                'name': row['item_name'],
                'category': row['item_category'],
                'products': []
            }
        if row['product_id'] is not None:
            items[item_id]['products'].append({
                'id': row['product_id'],
                'name': row['product_name'],
                'tendency': row['product_tendency'],
                'url': row['product_url'],
                'price': row['product_price'],
                'sale_price': row['product_sale_price'],
                'image': row['product_image']
            })

    return list(items.values())