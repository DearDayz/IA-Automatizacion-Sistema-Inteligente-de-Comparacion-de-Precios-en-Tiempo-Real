import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

db_pool = None

async def initialize_connection_pool():
    global db_pool
    try:
        db_pool = await asyncpg.create_pool(
            host=os.environ.get("DB_HOST"),
            database=os.environ.get("DB_DATABASE"),
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD"),
            min_size=1,
            max_size=10
        )
        print("Pool de conexiones a PostgreSQL inicializado")
    except Exception as e:
        print(f"Error al inicializar el pool de conexiones: {e}")

async def get_connection():
    global db_pool
    if db_pool:
        return await db_pool.acquire()
    else:
        print("Pool de conexiones a PostgreSQL no inicializado")
        return None

async def release_connection(conn: asyncpg.Connection):
    global db_pool
    if db_pool and conn:
        await db_pool.release(conn)

async def close_connection_pool():
    global db_pool
    if db_pool:
        await db_pool.close()
        print("Pool de conexiones a PostgreSQL cerrado")