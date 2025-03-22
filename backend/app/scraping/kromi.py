import asyncio, json, re, time
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def scrape_kromi():
    start_time = time.time()
    base_url = 'https://www.kromionline.com/'
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        all_products = []
        categories_urls = []

        try:
            await page.goto(base_url, wait_until="domcontentloaded", timeout=60000)

            categories_button = await page.wait_for_selector('#categoriesButton', timeout=20000)
            await asyncio.sleep(4)
            await categories_button.click(timeout=5000)

            await page.wait_for_selector("a[href=\"Products.php?cat=VIV&suc=UNI02\"]")
            await page.hover("a[href=\"Products.php?cat=VIV&suc=UNI02\"]")
            await asyncio.sleep(2)

            categories = await page.query_selector('.groupsOpt')
            urls_html = await categories.inner_html()
            urls_soup = BeautifulSoup(urls_html, 'html.parser')
            for a in urls_soup.find_all('a'):
                href = a.get('href')
                if href:
                    categories_urls.append(base_url + href)
            print('Total categories:', len(categories_urls))

            for url in categories_urls:
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_selector('.itemProductoPasilloContainer', timeout=30000)

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

                    pattern = r"(?:(\.\.\/\.\.\/\.\.\/))?(.+)"
                    match = re.search(pattern, image_elem.get('src') if image_elem else '')
                    if match:
                        image_url = base_url + match.group(2)
                    else:
                        image_url = 'No se ha encontrado la imagen'
                    
                    product = {
                        'title': title_elem.get_text(strip=True) if title_elem else '',
                        'price': price_elem.get_text(strip=True) if price_elem else '',
                        'image': image_url
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
    with open('kromi.json', 'w') as f:
        json.dump(data, f)

if __name__ == "__main__":
    results = asyncio.run(scrape_kromi())
    save_to_json(results)