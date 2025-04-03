from fastapi import APIRouter, Depends, HTTPException
import asyncpg
from app.database.dependencies import get_db

router = APIRouter()

@router.get("/")
async def get_products(conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch("SELECT * FROM Product")
    return rows

@router.get("/history/{product_id}")
async def get_product_price_history(product_id: int, conn: asyncpg.Connection = Depends(get_db)):
    try:
        rows = await conn.fetch("""
            SELECT date, price
            FROM ProductPriceHistory
            WHERE product_id = $1
            AND date >= CURRENT_DATE - INTERVAL '6 days'
            ORDER BY date
            LIMIT 7;
        """, product_id)

        if rows:
            return rows
        else:
            raise HTTPException(status_code=404, detail="Item not found")

    except asyncpg.exceptions.UndefinedColumnError:
        raise HTTPException(status_code=500, detail="view_count column does not exist")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))