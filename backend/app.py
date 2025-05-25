import tempfile
from flask import Flask, request, send_file, jsonify
from bs4 import BeautifulSoup
import requests
from openai import OpenAI
import json
from flask_cors import CORS
import tiktoken
from pydub import AudioSegment
import os
import tempfile
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
app = Flask(__name__)
CORS(app, origins=["http://localhost:4200"])

MAX_TOKENS_TEXT = 128000
MODEL_TEXT = "gpt-4.1-mini"

MAX_TOKENS_AUDIO = 1800
MODEL_AUDIO = "gpt-4o-mini-tts"

ENCODING = "cl100k_base"

SYSTEM_PROMPT = (
    "You are an HTML parser. I will give you the contents of a <body> tag "
    "from a news article page. I want a JSON like this: "
    "{'title': '', 'author': '', 'article': ''}. "
    "Include the article text exactly as it appears. Do not guess any values. "
    "If something is not present, leave the field as an empty string."
    "Ignore promotions, offers and image captions."
    "Be aware to not repeat any sentences"
)

# retorna a quantidade de tokens em um texto
def count_tokens(text):
    encoding = tiktoken.get_encoding(ENCODING)
    return len(encoding.encode(text))

# separa o texto em segmentos, dado um número máximo de tokens para cada segmento
def split_text_by_tokens(text, max_tokens=MAX_TOKENS_AUDIO):
    enc = tiktoken.get_encoding(ENCODING)
    tokens = enc.encode(text)
    chunks = []
    for i in range(0, len(tokens), max_tokens):
        chunk_tokens = tokens[i:i + max_tokens]
        chunk_text = enc.decode(chunk_tokens)
        chunks.append(chunk_text)
    return chunks

# remove elementos desnecessários do HTML
def clean_body_html(body_html):
    soup = BeautifulSoup(body_html, "html.parser")
    for tag in soup.find_all(["script", "style", "header", "footer", "nav", "aside", "form", "button"]):
        tag.decompose()
    for tag in soup.find_all(True):
        if not tag.get_text(strip=True):
            tag.decompose()
    return str(soup)

# dado uma URL, retorna o JSON com o texto do artigo, autor e título
@app.route('/extract', methods=['POST'])
def extract_article():
    try:
        data = request.get_json()
        article_url = data.get('url')

        if not article_url:
            return jsonify({"error": "Missing required parameter 'url'"}), 400

        # obtendo o texto do artigo
        response = requests.get(article_url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch article"}), 400

        # obtendo o texto formatado
        soup = BeautifulSoup(response.text, "html.parser")
        body_html = str(soup.body)
        cleaned_body = clean_body_html(body_html)

        # chacando limite de tokens
        system_tokens = count_tokens(SYSTEM_PROMPT)
        user_tokens = count_tokens(cleaned_body)
        if system_tokens + user_tokens > MAX_TOKENS_TEXT:
            return jsonify({"error": "Article content too large to process"}), 413

        # enviando o prompt para a OPENAI
        chat_response = client.chat.completions.create(
            model=MODEL_TEXT,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": cleaned_body}
            ],
            temperature=0,
        )

        try:
            artigo_json = json.loads(chat_response.choices[0].message.content)
        except Exception:
            return jsonify({"error": "Failed to parse model response"}), 500

        return jsonify(artigo_json)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# dado o JSON retornado pela /extract, gera e retorna o áudio
@app.route('/audio', methods=['POST'])
def article_to_audio():
    try:
        data = request.get_json()
        article_text = data.get("text")

        if not article_text:
            return jsonify({"error": "Campo 'text' obrigatório"}), 400

        text_chunks = split_text_by_tokens(article_text)

        # Dividindo o áudio em segmentos (para não esbarrar no limite de tokens)
        audio_segments = []
        for index, chunk in enumerate(text_chunks):
            speech_response = client.audio.speech.create(
                model=MODEL_AUDIO,
                voice="nova",
                input=chunk
            )

            # salvando cada segmento como arquivo temporário
            chunk_path = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3").name
            with open(chunk_path, "wb") as f:
                f.write(speech_response.content)

            audio = AudioSegment.from_file(chunk_path, format="mp3")
            audio_segments.append(audio)

            # apagando arquivo temporário
            os.remove(chunk_path)

        # Juntando todos os segmentos
        combined_audio = audio_segments[0]
        for segment in audio_segments[1:]:
            combined_audio += segment

        final_path = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3").name
        combined_audio.export(final_path, format="mp3")

        return send_file(final_path, mimetype="audio/mpeg", as_attachment=True, download_name="article.mp3")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
