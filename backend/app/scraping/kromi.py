import asyncio, json, re, time
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def scrape_kromi():
    start_time = time.time()
    base_url = 'https://www.kromionline.com'
    product_url_middle = '/Products.php?cat=VIV.'
    suffix_url = '&suc=UNI02'
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        all_products = []
        categories_suburls = {
            'alimentos': [
                'ACT', 'AIN', 'ARZ', 'AVN', 'AZU', 'CIG', 'CMA', 'CON', 'ECN', 'EDM',
                'ELT', 'ENC', 'LCH', 'LEC', 'MAR', 'MER', 'MIE', 'MTZ', 'MYN', 'PAN',
                'PAS', 'PST', 'REP', 'SAL', 'SLS', 'SOP', 'VIG', 'GRN', 'HRN'
            ],
            'bebidas': [
                'IFU', 'JUG', 'AGU', 'BEE', 'BEG', 'BEP', 'CAF'
            ],
            'dulces y snacks': [
                'CER', 'CHC', 'DUL', 'GLL', 'GLS', 'GLT', 'PSP'
            ]
        }

        try:
            for category_name, suburls in categories_suburls.items():
                for suburl in suburls:
                    url = base_url + product_url_middle + suburl + suffix_url
                    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                    await page.wait_for_selector('.itemProductoPasilloContainer', timeout=60000)

                    previous_count = 0
                    current_count = 0

                    while True:
                        previous_count = current_count
                        await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
                        try:
                            await page.wait_for_function(f'() => document.querySelectorAll(".itemProductoPasilloContainer").length > {current_count}', timeout=5000)
                        except Exception as e:
                            print('No more products in this url: ', url)
                            break
                        current_count = len(await page.query_selector_all('.itemProductoPasilloContainer'))
                        if current_count == previous_count:
                            break

                    html = await page.content()
                    soup = BeautifulSoup(html, 'html.parser')
                    product_cards = soup.select('.itemProductoPasilloContainer')

                    for card in product_cards:
                        title_elem = card.select_one('.product-name-carousel-pasillo a')
                        price_elem = card.select_one('.tag_precio_producto')
                        image_elem = card.select_one('.imagePasillo')
                        image_url = ''

                        pattern = r"(?:(\.\.\/\.\.\/\.\.))?(.+)"
                        match = re.search(pattern, image_elem.get('src') if image_elem else '')
                        product_id = None
                        if match:
                            image_url = base_url + match.group(2)
                            id_match = re.search(r"/(\d+)/", match.group(2))
                            if id_match:
                                product_id = id_match.group(1)
                        else:
                            image_url = 'No se ha encontrado la imagen'
                        
                        product = {
                            'name': title_elem.get_text(strip=True) if title_elem else '',
                            'price': '',
                            'sale_price': '',
                            'image': image_url,
                            'url': base_url + '/Product.php?code=' + product_id if product_id else '',
                            'category': category_name  
                        }

                        if price_elem:
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
            return all_products

def save_to_json(data):
    with open('kromi.json', 'w') as f:
        json.dump(data, f)

if __name__ == "__main__":
    results = asyncio.run(scrape_kromi())
    save_to_json(results)