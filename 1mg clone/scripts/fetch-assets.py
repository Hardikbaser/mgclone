import json
import os

import requests

os.makedirs('public/assets', exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://www.1mg.com/pharmacy_api/v6/products/search?name=paracetamol'
products = []
try:
    res = requests.get(url, headers=headers, timeout=20)
    if res.status_code == 200:
        data = res.json()
        for item in data.get('data', {}).get('skus', []):
            products.append({
                'id': item.get('id'),
                'name': item.get('name'),
                'price': item.get('price'),
                'mrp': item.get('mrp'),
                'composition': item.get('short_composition', 'Paracetamol 650mg'),
                'image': item.get('image_url') or '/assets/product-placeholder.svg',
                'manufacturer': item.get('manufacturer_name', 'Generic'),
            })
        print('Asset fetch completed: Saved public/assets/1mg_data.json')
    else:
        print(f'Asset fetch warning: HTTP {res.status_code}')
except Exception as exc:
    print(f'Asset fetch warning: {exc}')

with open('public/assets/1mg_data.json', 'w', encoding='utf-8') as output:
    json.dump(products, output, indent=2)
