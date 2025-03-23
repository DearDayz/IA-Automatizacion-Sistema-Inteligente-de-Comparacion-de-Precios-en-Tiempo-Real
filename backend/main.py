from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
import asyncpg
from app.database.tables import create_tables
from app.database.connection import (
    initialize_connection_pool,
    get_connection,
    release_connection,
    close_connection_pool,
)
@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_connection_pool()
    await create_tables()
    yield # Separa el código de inicio del código de cierre de la aplicación
    await close_connection_pool()

app = FastAPI(lifespan=lifespan) 

async def get_db():
    conn = await get_connection()
    try:
        yield conn
    finally:
        await release_connection(conn)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/version/")
async def read_items(conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch("SELECT version()")
    return rows