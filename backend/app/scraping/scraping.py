from app.scraping.farmatodo import scrape_farmatodo
from app.scraping.tuzonamarket import scrape_tuzonamarket
from app.scraping.kromi import scrape_kromi
from app.scraping.promarket import scrape_promarket
from app.scraping.comparison import compare_products, get_embedding, normalize_name
import asyncio, time, json
from app.database.connection import get_connection, release_connection

async def scrape_pages():
    
    start_time = time.time()

    scraped_products = await asyncio.gather(
        scrape_farmatodo(),
        # scrape_kromi(),
        scrape_tuzonamarket(),
        scrape_promarket()
    )

    if scraped_products:
        await save_to_db(scraped_products)
    else:
        print("Error al scrapear las páginas", scraped_products)

    print(f'Tiempo total transcurrido en scrapear todas las páginas: {(time.time() - start_time) / 60} minutos')

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
                    print(f"Actualizando producto {product['name']}")
                    await update_product(conn, product)
                    continue

                items = await conn.fetch("SELECT * FROM Item")
                product["embedding"] = get_embedding(product["name"])

                # Si no hay items en bd, se inserta el producto como item y producto
                if len(items) == 0:
                    item_id = await save_item(conn, product)
                    await save_product(conn, product, item_id)
                    continue
                
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
                        await save_product(conn, product, item["id"])
                        product_saved = True
                        break
                    # Si no son el mismo producto se sigue iterando
                    else:
                        continue
                
                if not product_saved:
                    item_id = await save_item(conn, product)
                    await save_product(conn, product, item_id)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await release_connection(conn)

# ----------------------------------------------

# Funciones auxiliares para guardar productos en la base de datos

# ----------------------------------------------
    
async def save_product(conn, product, item_id):
    print(f"Insertando producto {product['name']}")
    await conn.execute("""
        INSERT INTO Product (name, tendency, url, item_id, price, sale_price, image)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    """,
    normalize_name(product["name"]),
    "",
    product['url'],
    item_id,
    float(product['price']),
    float(product['sale_price']),
    product['image']
    )

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
    
async def update_product(conn, product):
    # Lo mismo aquí
    await conn.execute("""
        UPDATE Product
        SET price = $1,
        sale_price = $2
        WHERE image = $3
    """,
    float(product['price']),
    float(product['sale_price']),
    product['image']
    )