from app.scraping.farmatodo import scrape_farmatodo
from app.scraping.tuzonamarket import scrape_tuzonamarket
from app.scraping.kromi import scrape_kromi
from app.scraping.promarket import scrape_promarket
from app.scraping.comparison import compare_products, get_embedding, normalize_name
from app.database.connection import get_connection, release_connection
import asyncio, time, json, traceback, asyncpg, itertools

async def scrape_pages():
    
    start_time = time.time()
    print("Inicio")

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
        items = await conn.fetch("SELECT * FROM Item")
        all_products = list(itertools.chain.from_iterable(scraped_products))
        BATCH_SIZE = 500

        for batch in itertools.batched(all_products, BATCH_SIZE):
            products_to_insert = []
            products_to_update = []
            products_to_add_to_history = []
            new_items = []

            for product in batch:
                product["embedding"] = get_embedding(product["name"])
                normalized_product_name = normalize_name(product["name"])
                matched_item = None

                for item in items:
                    item_embedding = json.loads(item["embedding"])
                    comparison_result = compare_products(
                        product["name"],
                        item["name"],
                        product["embedding"],
                        item_embedding,
                        threshold=0.75
                    )
                    if comparison_result["are_equal"]:
                        matched_item = item
                        break

                if matched_item:
                    # Producto coincide con un item existente - actualizar producto
                    products_to_update.append({**product, 'item_id': matched_item['id']})
                    products_to_add_to_history.append(product)
                else:
                    # Producto no coincide con ningún item - crear nuevo item y producto
                    new_item = {
                        'name': normalized_product_name,
                        'category': product['category'],
                        'embedding': json.dumps(product["embedding"].tolist())
                    }
                    new_items.append(new_item)
                    products_to_insert.append(product)
                    products_to_add_to_history.append(product)

            # Insertar nuevos items
            if new_items:
                new_item_records = await conn.fetchmany("""
                    INSERT INTO Item (name, category, embedding)
                    VALUES ($1, $2, $3)
                    RETURNING id, name, embedding
                """, [(item['name'], item['category'], item['embedding']) for item in new_items])
                for record in new_item_records:
                    items.append(dict(record))

            # Insertar nuevos productos y obtener sus IDs para el historial
            product_insert_values = []
            products_to_insert_with_temp_id = [] # Para relacionar con el item fácilmente
            for product in products_to_insert:
                normalized_name = normalize_name(product["name"])
                item_to_link = next((item for item in items if normalize_name(item['name']) == normalized_name and json.loads(item['embedding']) == product['embedding'].tolist()), None)
                if item_to_link:
                    product_insert_values.append((
                        normalized_name, "", product['url'], item_to_link['id'],
                        float(product['price']), float(product['sale_price']) if product['sale_price'] != '' else 0.0, product['image']
                    ))
                    products_to_insert_with_temp_id.append(product) # Mantener el producto original

            inserted_product_ids = []
            if product_insert_values:
                product_records = await conn.fetchmany("""
                    INSERT INTO Product (name, tendency, url, item_id, price, sale_price, image)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id, image
                """, product_insert_values)
                inserted_product_ids = {record['image']: record['id'] for record in product_records}

            # Actualizar productos existentes
            if products_to_update:
                update_values = [
                    (float(p['price']), float(p['sale_price']) if p['sale_price'] != '' else 0.0, p['image'])
                    for p in products_to_update
                ]
                await conn.executemany("""
                    UPDATE Product
                    SET price = $1,
                        sale_price = $2
                    WHERE image = $3
                """, update_values)

            # Guardar el historial de precios (ahora usando los IDs obtenidos)
            if products_to_add_to_history:
                history_values = []
                for product in products_to_add_to_history:
                    product_id_for_history = inserted_product_ids.get(product['image']) # Buscar si fue recién insertado
                    if not product_id_for_history:
                        # Si no fue recién insertado, buscar el ID por imagen (asumiendo que la imagen es única para el producto)
                        product_row = await conn.fetchrow("SELECT id FROM Product WHERE image = $1", product['image'])
                        if product_row:
                            product_id_for_history = product_row['id']

                    if product_id_for_history:
                        price = float(product["sale_price"] if product["sale_price"] and product["sale_price"].strip() else product["price"])
                        history_values.append((price, product_id_for_history)) # No incluimos la fecha aquí

                if history_values:
                    await conn.executemany("""
                        INSERT INTO ProductPriceHistory (date, price, product_id)
                        VALUES (CURRENT_DATE, $1, $2)
                    """, history_values)

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
        RETURNING *
    """,
    normalize_name(product["name"]),
    product["category"],
    json.dumps(product["embedding"].tolist())
    )
    if row:
        return row
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