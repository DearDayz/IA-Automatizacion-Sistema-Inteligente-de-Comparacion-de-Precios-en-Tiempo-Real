import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import json
import time

async def scrape_tuzonamarket():
    start_time = time.time()
    base_url = 'https://www.tuzonamarket.com/carabobo/supermercado'
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        all_products = []
        
        categories = [
            '/lacteos-y-huevos',
            '/pan-harinas-cereales',
            '/pasta-arroz-y-granos',
            '/salsas',
            '/aceites-vinagres-y-condimentos',
            '/azucar-reposteria-y-mezclas',
            '/chocolates-y-dulces',
            '/enlatados-y-envasados',
            '/galletas-y-ponques',
            '/snacks',
            '/cafe-e-infusiones',
            '/caldos-y-sopas',
            '/sabores-del-mundo',
        ]
        categories_urls = [base_url + categorie for categorie in categories]

        try:
            for url in categories_urls:
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                await page.wait_for_selector('app-producto-item', timeout=60000)
                
                previous_count = 0
                current_count = 0
                
                while True:
                    previous_count = current_count
                    
                    try:
                        await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
                        await asyncio.sleep(1)
                            
                    except Exception as e:
                        print(f"Error: {e}")
                        continue
                    
                    current_count = len(await page.query_selector_all('app-producto-item'))
                    if current_count == previous_count:
                        break

                # Procesar HTML
                html = await page.content()
                soup = BeautifulSoup(html, 'html.parser')
                product_cards = soup.select('app-producto-item')
                
                for card in product_cards:

                    title_elem = card.select_one('.item-nomb a')
                    price_elem = card.select_one('.prec-vent span')
                    image_elem = card.select_one('.img-prin')

                    product = {
                        'title': title_elem.get_text(strip=True) if title_elem else '',
                        'price': price_elem.get_text(strip=True) if price_elem else '',
                        'image': image_elem.get('src') if image_elem else ''
                    }
                    
                    if product['title'] and product['price']:
                        all_products.append(product)

            await browser.close()
            print(f'Time elapsed: {(time.time() - start_time) / 60} minutes')
            return all_products

        except Exception as e:
            print(f'Error: {e}')
            await browser.close()
            return [{'error': 'Scraping failed'}]

def save_to_json(data):
    with open('tuzonamarket.json', 'w') as f:
        json.dump(data, f)

if __name__ == "__main__":
    results = asyncio.run(scrape_tuzonamarket())
    save_to_json(results)
