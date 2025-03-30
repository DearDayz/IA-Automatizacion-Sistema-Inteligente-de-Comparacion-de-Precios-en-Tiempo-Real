from fastapi import APIRouter, Depends, HTTPException
import asyncpg
from app.database.dependencies import get_db

router = APIRouter()

@router.get("/")
async def get_items(conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch("SELECT id, name, category, view_count FROM Item")
    return rows

@router.get("/{item_id}/")
async def get_item_by_id(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    try:
        row = await conn.fetchrow("SELECT id, name, category, view_count FROM Item WHERE id = $1", item_id)

        if row:
            return row
        else:
            raise HTTPException(status_code=404, detail="Item not found")

    except asyncpg.exceptions.UndefinedColumnError:
        raise HTTPException(status_code=500, detail="view_count column does not exist")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Ruta para aumentar en uno el contador de vistas del Item según su ID
@router.patch("/{item_id}/view")
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

@router.get("/items+products/")
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