from app.database.connection import get_connection, release_connection

async def get_db():
    conn = await get_connection()
    try:
        yield conn
    finally:
        await release_connection(conn)