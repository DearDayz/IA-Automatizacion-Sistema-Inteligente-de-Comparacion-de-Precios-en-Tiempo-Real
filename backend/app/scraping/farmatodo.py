import asyncio, json, time, re
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def scrape_farmatodo():
    start_time = time.time()
    select_dollar = True
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        all_products = []
        
        categories_urls = [
            'https://www.farmatodo.com.ve/categorias/alimentos-y-bebidas/alimentos/alimentos-basicos',
            'https://www.farmatodo.com.ve/categorias/alimentos-y-bebidas/bebidas',
            'https://www.farmatodo.com.ve/categorias/alimentos-y-bebidas/dulces-y-snacks',
        ]

        try:
            for url in categories_urls:
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                await page.wait_for_selector('app-product-card', timeout=60000)

                if select_dollar:
                    currency_exchange = await page.wait_for_selector('.currency-exchange__container', timeout=20000)
                    await currency_exchange.hover()
                    currency_option = await page.query_selector_all('.currency-exchange__selector')

                    if len(currency_option) > 1:
                        await currency_option[1].click(timeout=5000)
                        select_dollar = False
                        await asyncio.sleep(2)
                
                previous_count = 0
                current_count = 0
                max_attempts = 5
                attempts = 0
                
                while attempts < max_attempts:
                    previous_count = current_count
                    
                    try:
                        # Scroll + verificar botón
                        await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
                        await asyncio.sleep(2)
                        
                        button = await page.query_selector('#group-view-load-more:not([disabled])')
                        if button:
                            await button.click(timeout=5000)
                            await page.wait_for_selector('app-product-card', timeout=60000)
                        else:
                            break
                            
                    except Exception as e:
                        print(f"Error: {e}")
                        attempts += 1
                        continue
                    
                    current_count = len(await page.query_selector_all('app-product-card'))
                    if current_count == previous_count:
                        attempts += 1
                    else:
                        attempts = 0

                # Procesar HTML
                html = await page.content()
                soup = BeautifulSoup(html, 'html.parser')
                product_cards = soup.select('app-product-card')
                
                for card in product_cards:
                    title_elem = card.select_one('.text-title')
                    price_elem = card.select_one('.price__text-price')
                    image_elem = card.select_one('.product-image__image')
                    
                    product = {
                        'name': title_elem.get_text(strip=True) if title_elem else '',
                        'price': '',
                        'image': image_elem.get('src') or image_elem.get('data-src') if image_elem else ''
                    }

                    if price_elem:
                        # Extraemos el valor decimal del precio
                        price_text = price_elem.get_text(strip=True)
                        price_match = re.search(r"[+-]?\d+([.,]\d+)?", price_text)
                        if price_match:
                            product['price'] = price_match.group(0)
                    
                    if product['name'] and product['price']:
                        all_products.append(product)

            await browser.close()
            print(f'Time elapsed: {(time.time() - start_time) / 60} minutes')
            return all_products

        except Exception as e:
            print(f'Error: {e}')
            await browser.close()
            return [{'error': 'Scraping failed'}]

def save_to_json(data):
    with open('farmatodo.json', 'w') as f:
        json.dump(data, f)

if __name__ == "__main__":
    results = asyncio.run(scrape_farmatodo())
    save_to_json(results)
