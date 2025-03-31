from app.scraping.farmatodo import scrape_farmatodo
from app.scraping.tuzonamarket import scrape_tuzonamarket
from app.scraping.kromi import scrape_kromi
from app.scraping.promarket import scrape_promarket
from app.scraping.comparison import compare_products, get_embedding, normalize_name
from app.database.connection import get_connection, release_connection
import asyncio, time, json, traceback, asyncpg

async def scrape_pages():
    
    start_time = time.time()

    scraped_products = await asyncio.gather(
        # scrape_farmatodo(),
        # scrape_kromi(),
        scrape_tuzonamarket(),
        # scrape_promarket()
    )
    print(f'Tiempo en scrapear todas las páginas: {(time.time() - start_time) / 60} minutos')
    start_time = time.time()

    if scraped_products:
        result = await save_to_db(scraped_products)
        print(f'Tiempo en en guardar todos los productos: {(time.time() - start_time) / 60} minutos')
        return result
    else:
        return ("Error al scrapear las páginas", scraped_products)


async def save_to_db(scraped_products: list):
    try:
        conn = await get_connection()

        # Se itera sobre cada lista de productos de cada página
        for products in scraped_products:

            # Se itera sobre cada producto de la lista de productos
            for product in products:
                # Si ya existe en la bd se debería de solo actualizar el precio
                # y crear un registro en la tabla de historial de precios
                db_product = await verify_product(conn, product)
                if db_product:
                    print(f"Actualizando producto")
                    product_id = await update_product(conn, product)
                    await add_to_history(conn, product, product_id)
                    continue

                items = await conn.fetch("SELECT * FROM Item")
                product["embedding"] = get_embedding(product["name"])                
                product_saved = False

                # Se itera sobre cada item en bd
                for item in items:

                    # Se compara el producto con el item para ver si son el mismo producto
                    comparison_result = compare_products(
                        product["name"],
                        item["name"],
                        product["embedding"],
                        json.loads(item["embedding"])
                    )
                    if comparison_result["are_equal"]:
                        product_id = await save_product(conn, product, item["id"])
                        await add_to_history(conn, product, product_id)
                        product_saved = True
                        break
                    # Si no son el mismo producto se sigue iterando
                    else:
                        continue
                
                # Si no se encuentra un item que coincida con el producto
                # O si no hay items en la bd
                # Se crea tanto el item como el producto
                if not product_saved:
                    item_id = await save_item(conn, product)
                    product_id = await save_product(conn, product, item_id)
                    await add_to_history(conn, product, product_id)

        return "Scrapeo realizado exitosamente"
    except Exception as e:
        error_message = f"Error: {type(e).__name__}\n{traceback.format_exc()}"
        print(error_message)
        return "Ha ocurrido un error durante el scrapeo."
    finally:
        await release_connection(conn)

# ----------------------------------------------

# Funciones auxiliares para guardar productos en la base de datos

# ----------------------------------------------
    
async def save_product(conn, product, item_id):
    await conn.execute("""
        INSERT INTO Product (name, tendency, url, item_id, price, sale_price, image)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    """,
    normalize_name(product["name"]),
    "",
    product['url'],
    item_id,
    float(product['price']),
    float(product['sale_price']) if product['sale_price'] != '' else 0.0,
    product['image']
    )
    row = await conn.fetchrow("SELECT id FROM Product WHERE image = $1",
        product["image"]
    )
    if row:
        return row['id']
    else:
        raise Exception("Error al insertar el producto")

async def save_item(conn, product):
    row = await conn.fetchrow("""
        INSERT INTO Item (name, category, embedding)
        VALUES ($1, $2, $3)
        RETURNING id
    """,
    normalize_name(product["name"]),
    product["category"],
    json.dumps(product["embedding"].tolist())
    )
    if row:
        return row['id']
    else:
        raise Exception("Error al insertar el item")
    
async def add_to_history(conn: asyncpg.Connection, product: dict, product_id: int):
    try:
        price = float(product["sale_price"] if product["sale_price"] and product["sale_price"].strip() else product["price"])

        await conn.execute("""
            INSERT INTO ProductPriceHistory (date, price, product_id)
            VALUES (CURRENT_DATE, $1, $2)
        """, price, product_id)

    except (ValueError, KeyError) as e:
        raise ValueError(f"Error al procesar los datos del producto: {e}")
    except asyncpg.exceptions.PostgresError as e:
        raise asyncpg.exceptions.PostgresError(f"Error al insertar en el historial del producto: {e}")
    except Exception as e:
        raise Exception(f"Error inesperado al actualizar el historial: {e}")
    
async def verify_product(conn, product):
    # Esto no sé si cambiarlo o dejarlo así xd
    # Pero por ahora funciona usar la imagen ya que siempre es única
    # Aunque se podría usar también la url

    db_product = await conn.fetch("SELECT name FROM Product WHERE image = $1",
        product["image"]
    )
    if db_product:
        return True
    else:
        return False

async def update_product(conn: asyncpg.Connection, product: dict):
    try:
        updated_product = await conn.fetchrow("""
            UPDATE Product
            SET price = $1,
                sale_price = $2
            WHERE image = $3
            RETURNING id
        """,
        float(product['price']),
        float(product['sale_price']) if product['sale_price'] and product['sale_price'].strip() else 0.0,
        product['image']
        )

        if updated_product:
            return updated_product['id']
        else:
            return None 

    except (ValueError, KeyError) as e:
        raise ValueError(f"Error al procesar los datos del producto: {e}")
    except asyncpg.exceptions.PostgresError as e:
        raise asyncpg.exceptions.PostgresError(f"Error al actualizar el producto: {e}")
    except Exception as e:
        raise Exception(f"Error inesperado al actualizar el producto: {e}")