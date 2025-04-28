import asyncio, time, json, re
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def scrape_tuzonamarket():
    start_time = time.time()
    base_url = 'https://www.tuzonamarket.com'
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        all_products = []

        categories = {
            "alimentos": [
                '/carabobo/supermercado/lacteos-y-huevos',
                '/carabobo/supermercado/pan-harinas-cereales',
                '/carabobo/supermercado/pasta-arroz-y-granos',
                '/carabobo/supermercado/salsas',
                '/carabobo/supermercado/aceites-vinagres-y-condimentos',
                '/carabobo/supermercado/azucar-reposteria-y-mezclas',
                '/carabobo/supermercado/enlatados-y-envasados',
                '/carabobo/supermercado/caldos-y-sopas',
                '/carabobo/supermercado/sabores-del-mundo',
            ],
            "dulces y snacks": [
                '/carabobo/supermercado/galletas-y-ponques',
                '/carabobo/supermercado/snacks',
                '/carabobo/supermercado/chocolates-y-dulces',
            ],
            "bebidas": [
                '/carabobo/supermercado/cafe-e-infusiones',
            ]
        }

        try:
            for category_name, category_urls in categories.items():
                for url in [base_url + cat_url for cat_url in category_urls]:
                    await page.goto(url, wait_until="domcontentloaded", timeout=80000)
                    await page.wait_for_selector('app-producto-item', timeout=80000)

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
                        sale_price_elem = card.select_one('.prec-tacha span')
                        image_elem = card.select_one('.img-prin')
                        url_elem = card.find('a')

                        product = {
                            'name': title_elem.get_text(strip=True) if title_elem else '',
                            'price': '',
                            'sale_price': '',
                            'image': image_elem.get('src') if image_elem else '',
                            'url': base_url + url_elem.get('href') if url_elem else '',
                            'category': category_name #Agregado la categoria
                        }

                        if price_elem:
                            price_text = price_elem.get_text(strip=True)
                            price_match = re.search(r"[+-]?\d+([.,]\d+)?", price_text)
                            if price_match and sale_price_elem:
                                product['sale_price'] = price_match.group(0).replace(',', '.')
                            elif price_match:
                                product['price'] = price_match.group(0).replace(',', '.')

                        if sale_price_elem:
                            price_text = sale_price_elem.get_text(strip=True)
                            price_match = re.search(r"[+-]?\d+([.,]\d+)?", price_text)
                            if price_match:
                                product['price'] = price_match.group(0).replace(',', '.')

                        if product['name'] and product['price'] and product['image'] != '' and product not in all_products:
                            all_products.append(product)

            await browser.close()
            print(f'Time elapsed: {(time.time() - start_time) / 60} minutes')
            return all_products

        except Exception as e:
            print(f'Error: {e}')
            await browser.close()
            print(f"Productos de TuZonaMarket: ", len(all_products))
            return all_products

def save_to_json(data):
    with open('tuzonamarket.json', 'w') as f:
        json.dump(data, f)

if __name__ == "__main__":
    results = asyncio.run(scrape_tuzonamarket())
    save_to_json(results)