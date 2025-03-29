import asyncio, json, re, time
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def scrape_promarket():
    start_time = time.time()
    base_url = 'https://www.promarketlatino.com'
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        all_products = []
        categories_suburls = {
            'alimentos': [
                'lacteos-y-huevos',
                'harinas-y-cereales',
                'pastas-y-granos',
                'salsas',
                'aceites-vinagres-y-condimentos',
                'azucar-reposteria-y-mezclas',
                'chocolates-y-dulces',
                'enlatados-y-envasados',
                'galletas-y-tortas',
                'cafe-e-infusiones',
                'caldos-y-sopas',
                'alimentacion'
            ],
            'bebidas': [
                'bebidas-gaseosas',
                'jugos-te-y-energizantes',
                'en-polvo',
                'aguas',
                'nutricionales'
            ],
            'dulces y snacks': [
                'snacks',
                'helados',
                'postres'
            ]
        }

        try:
            for category_name, suburls in categories_suburls.items():
                for suburl in suburls:
                    url = base_url + '/tienda/subcategories/' + suburl
                    await page.goto(url, wait_until='domcontentloaded', timeout=30000)
                    await page.wait_for_selector('app-producto-item', timeout=30000)

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

                    html = await page.content()
                    soup = BeautifulSoup(html, 'html.parser')
                    product_cards = soup.select('app-producto-item')

                    for card in product_cards:
                        title_elem = card.select_one('.item-nomb a')
                        price_elem = card.select_one('.Price__salePrice___3YEJa')
                        image_elem = card.select_one('.img-prin')
                        url_elem = card.select_one('.item-nomb a')
                        
                        product = {
                            'name': title_elem.get_text(strip=True) if title_elem else '',
                            'price': '',
                            'sale_price': '',
                            'image': image_elem.get('src') if image_elem else '',
                            'url': url_elem.get('href') if url_elem else '',
                            'category': category_name  
                        }

                        if price_elem:
                            price_text = price_elem.get_text(strip=True)
                            price_match = re.search(r'[+-]?\d+([.,]\d+)?', price_text)
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
    with open('kromi.json', 'w') as f:
        json.dump(data, f)

if __name__ == '__main__':
    results = asyncio.run(scrape_promarket())
    save_to_json(results)