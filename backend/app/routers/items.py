from fastapi import APIRouter, Depends, HTTPException
import asyncpg
from app.database.dependencies import get_db
from typing import List, Dict

router = APIRouter()


@router.get("/")
async def get_items(conn: asyncpg.Connection = Depends(get_db)) -> List[Dict]:
    rows = await conn.fetch("""
        SELECT
            i.id,
            i.name,
            i.category,
            i.view_count,
            MIN(p.price) AS min_price,
            MAX(p.price) AS max_price,
            AVG(p.price) AS avg_price,
            (SELECT image FROM Product WHERE item_id = i.id ORDER BY price ASC LIMIT 1) AS min_price_image,
            (SELECT image FROM Product WHERE item_id = i.id ORDER BY price DESC LIMIT 1) AS max_price_image
        FROM Item i
        LEFT JOIN Product p ON i.id = p.item_id
        GROUP BY i.id
    """)

    result = []
    for row in rows:
        min_price_image_url = row['min_price_image']
        max_price_image_url = row['max_price_image']

        min_price_page = extract_page_name(min_price_image_url)
        max_price_page = extract_page_name(max_price_image_url)

        item = {
            'id': row['id'],
            'name': row['name'],
            'category': row['category'],
            'view_count': row['view_count'],
            'min_price': row['min_price'],
            'max_price': row['max_price'],
            'avg_price': row['avg_price'],
            'min_price_image': min_price_image_url,
            'max_price_image': max_price_image_url,
            'min_price_page': min_price_page,
            'max_price_page': max_price_page
        }
        result.append(item)
    return result

@router.get("/id/{item_id}/")
async def get_item_with_products_by_id(item_id: int, conn: asyncpg.Connection = Depends(get_db)) -> Dict:
    try:
        rows = await conn.fetch("""
            SELECT
                Item.id AS item_id,
                Item.name AS item_name,
                Item.category AS item_category,
                Item.view_count AS item_view_count,
                Product.id AS product_id,
                Product.name AS product_name,
                Product.tendency AS product_tendency,
                Product.url AS product_url,
                Product.price AS product_price,
                Product.sale_price AS product_sale_price,
                Product.image AS product_image
            FROM Item
            LEFT JOIN Product ON Item.id = Product.item_id
            WHERE Item.id = $1
        """, item_id)

        if not rows:
            raise HTTPException(status_code=404, detail="Item not found")

        item = {
            'id': rows[0]['item_id'],
            'name': rows[0]['item_name'],
            'category': rows[0]['item_category'],
            'view_count': rows[0]['item_view_count'],
            'products': []
        }

        for row in rows:
            if row['product_id'] is not None:
                item['products'].append({
                    'id': row['product_id'],
                    'name': row['product_name'],
                    'tendency': row['product_tendency'],
                    'url': row['product_url'],
                    'price': row['product_price'],
                    'sale_price': row['product_sale_price'],
                    'image': row['product_image']
                })

        return item

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Ruta para aumentar en uno el contador de vistas del Item según su ID
@router.patch("/view/{item_id}/")
async def increment_view_count(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    try:
        await conn.execute("UPDATE Item SET view_count = view_count + 1 WHERE id = $1", item_id)

        row = await conn.fetchrow("SELECT id, name, category, view_count FROM Item WHERE id = $1", item_id)

        if row:
            return row
        else:
            raise HTTPException(status_code=404, detail="Item not found")

    except asyncpg.exceptions.UndefinedColumnError:
        raise HTTPException(status_code=500, detail="view_count column does not exist")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/")
async def get_items_and_products(conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch("""
        SELECT
            Item.id AS item_id,
            Item.name AS item_name,
            Item.category AS item_category,
            Item.embedding AS item_embedding,
            Item.view_count AS item_view_count,
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



def extract_page_name(image_url: str) -> str:
    if image_url is None:
        return "desconocido"  # O cualquier otro valor predeterminado que prefieras
    if "tuzonamarket" in image_url:
        return "tuzonamarket"
    elif "kromionline" in image_url:
        return "kromionline"
    elif "googleusercontent" in image_url:
        return "farmatodo"
    elif "promarketlatino" in image_url:
        return "promarketlatino"
    else:
        return "desconocido"