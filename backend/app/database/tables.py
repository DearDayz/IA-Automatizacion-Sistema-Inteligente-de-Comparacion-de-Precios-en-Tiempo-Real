from app.database.connection import get_connection, release_connection

async def create_tables():
    conn = await get_connection()
    try:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS Item (
                id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR(255),
                category VARCHAR(255),
                embedding TEXT,
                view_count INT
            );
        """)

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS Product (
                id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR(255),
                tendency VARCHAR(255),
                url VARCHAR(255),
                item_id INT,
                price FLOAT,
                sale_price FLOAT,
                image VARCHAR(255),
                FOREIGN KEY (item_id) REFERENCES Item(id)
            );
        """)

        print("Tablas creadas exitosamente.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await release_connection(conn)
        print("Conexión cerrada")
        