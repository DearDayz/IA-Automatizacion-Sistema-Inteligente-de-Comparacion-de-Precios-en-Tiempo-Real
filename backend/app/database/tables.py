from app.database.connection import get_connection, release_connection, initialize_connection_pool

async def create_tables():
    conn = await get_connection()
    try:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS Item (
                id INT PRIMARY KEY,
                nombre VARCHAR(255),
                categoria VARCHAR(255),
                embedding TEXT
            );
        """)

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS Producto (
                id INT PRIMARY KEY,
                nombre VARCHAR(255),
                tendencia VARCHAR(255),
                url VARCHAR(255),
                item_id INT,
                precio FLOAT,
                precio_oferta FLOAT,
                imagen VARCHAR(255),
                FOREIGN KEY (item_id) REFERENCES Item(id)
            );
        """)

        print("Tablas creadas exitosamente.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await release_connection(conn)
        print("Conexión cerrada")
        