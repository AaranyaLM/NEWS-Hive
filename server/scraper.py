# scraper.py

import sys
import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify

app = Flask(__name__)

def extract_with_bs4(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        article_tags = ['article', 'main', 'section']
        content = ""

        for tag in article_tags:
            article_content = soup.find(tag)
            if article_content:
                paragraphs = article_content.find_all('p')
                content += '\n'.join(p.get_text() for p in paragraphs)

        return content.strip() if content else "Content not found."

    except Exception as e:
        print(f"Error: {e}")
        return ""

@app.route('/scrape', methods=['GET'])
def scrape_news_content():
    news_url = request.args.get('url')
    if not news_url:
        return jsonify({"error": "URL parameter is required."}), 400
    
    content = extract_with_bs4(news_url)
    return jsonify({"content": content})

if __name__ == "__main__":
    app.run(debug=True, port=5001)  # Flask server runs on port 5001
