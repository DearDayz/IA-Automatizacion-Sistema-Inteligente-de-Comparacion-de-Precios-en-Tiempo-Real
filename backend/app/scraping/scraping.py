from app.scraping.farmatodo import scrape_farmatodo
from app.scraping.tuzonamarket import scrape_tuzonamarket
from app.scraping.kromi import scrape_kromi
from app.scraping.promarket import scrape_promarket
from app.scraping.comparison import compare_units, get_embedding, normalize_name
from app.database.connection import get_connection, release_connection
import asyncio, time, json, traceback, asyncpg, itertools

async def scrape_pages():
    
    start_time = time.time()
    total_time = time.time()
    print("Inicio")

    scraped_products = await asyncio.gather(
        scrape_farmatodo(),
        # scrape_kromi(),
        scrape_tuzonamarket(),
        scrape_promarket()
    )
    print(f'Tiempo en scrapear todas las páginas: {(time.time() - start_time) / 60} minutos')
    start_time = time.time()

    if scraped_products:
        result = await save_to_db(scraped_products)
        print(f'Tiempo en en guardar todos los productos: {(time.time() - start_time) / 60} minutos')
        print(f'Tiempo total: {(time.time() - total_time) / 60} minutos')
        return result
    else:
        return ("Error al scrapear las páginas", scraped_products)


async def save_to_db(scraped_products: list):
    try:
        conn = await get_connection()
        SIMILARITY_THRESHOLD = 0.75
        COSINE_DISTANCE_THRESHOLD = 1 - SIMILARITY_THRESHOLD

        all_products = list(itertools.chain.from_iterable(scraped_products))
        print(f"Productos totales: ", len(all_products))
        BATCH_SIZE = 500

        for batch in itertools.batched(all_products, BATCH_SIZE):
            products_to_insert = []
            products_to_update = []
            products_to_add_to_history = []

            for product in batch:
                # Verificar si ya existe un producto con la misma imagen (indicativo de actualización)
                existing_product = await conn.fetchrow("SELECT id, item_id FROM Product WHERE image = $1", product['image'])

                if existing_product:
                    # Es una actualización del producto existente
                    products_to_update.append({**product, 'item_id': existing_product['item_id']})
                    products_to_add_to_history.append(product)
                    continue

                normalized_product_name = normalize_name(product["name"])
                product_embedding = get_embedding(normalized_product_name)
                matched_item = await conn.fetchrow("""
                    SELECT id, name, 1 - (embedding <-> $1::vector) AS similarity
                    FROM Item
                    WHERE (embedding <-> $1::vector) <= $2
                    ORDER BY embedding <-> $1::vector
                    LIMIT 1;
                """, str(product_embedding.tolist()), COSINE_DISTANCE_THRESHOLD)

                if matched_item and matched_item['similarity'] >= SIMILARITY_THRESHOLD and compare_units(matched_item['name'], product["name"])['are_equal']:
                    # Se encontró un item similar, crear un nuevo producto asociado a ese item
                    products_to_insert.append({**product, 'item_id': matched_item['id']})
                    products_to_add_to_history.append(product)
                else:
                    # No se encontró item similar, crear nuevo item y nuevo producto
                    item_id = await conn.fetchval("""
                        INSERT INTO Item (name, category, embedding)
                        VALUES ($1, $2, $3::vector)
                        RETURNING id;
                    """, normalized_product_name, product['category'], str(product_embedding.tolist()))
                    products_to_insert.append({**product, 'item_id': item_id})
                    products_to_add_to_history.append(product)

            # Insertar nuevos productos (usando los item_id obtenidos)
            product_insert_values = [(
                normalize_name(p['name']), "", p['url'], p['item_id'],
                float(p['price']), float(p['sale_price']) if p['sale_price'] != '' else 0.0, p['image']
            ) for p in products_to_insert]
            if product_insert_values:
                await conn.executemany("""
                    INSERT INTO Product (name, tendency, url, item_id, price, sale_price, image)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                """, product_insert_values)

            # Actualizar productos existentes
            update_values = [(
                float(p['price']), float(p['sale_price']) if p['sale_price'] != '' else 0.0, p['image']
            ) for p in products_to_update]
            if update_values:
                await conn.executemany("""
                    UPDATE Product
                    SET price = $1,
                        sale_price = $2
                    WHERE image = $3
                """, update_values)

            # Guardar el historial de precios (optimizado para múltiples productos)
            if products_to_add_to_history:
                product_images_to_query = [product['image'] for product in products_to_add_to_history]
                if product_images_to_query:
                    product_id_map = {}
                    product_rows = await conn.fetch("SELECT id, image FROM Product WHERE image = ANY($1)", product_images_to_query)
                    for row in product_rows:
                        product_id_map[row['image']] = row['id']

                    history_values = []
                    for product in products_to_add_to_history:
                        product_id = product_id_map.get(product['image'])
                        if product_id:
                            price = float(product["sale_price"] if product["sale_price"] and product["sale_price"].strip() else product["price"])
                            history_values.append((price, product_id))

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