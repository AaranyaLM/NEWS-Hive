from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

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
        return str(e)

@app.route('/scrape', methods=['GET'])
def scrape_endpoint():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'URL parameter is required'}), 400
        
    content = extract_with_bs4(url)
    return jsonify({'content': content})

if __name__ == '__main__':
    app.run(port=5001)