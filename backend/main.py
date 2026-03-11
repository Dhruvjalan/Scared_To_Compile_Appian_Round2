from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from PIL import Image
from io import BytesIO
import os
import json
import torch
import time
import threading
import queue
import sys
import tempfile
import requests
import numpy as np
import sounddevice as sd
import whisper
import pinecone
import json_repair
from scipy.io.wavfile import write
from typing import Optional, Dict, List
from pydantic import BaseModel, ValidationError
from transformers import CLIPProcessor, CLIPModel
from dotenv import load_dotenv
from feedback import FeedbackLearningSystem

load_dotenv()



# === Setup ===
app = Flask(__name__)
CORS(app)


# Pinecone init
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
INDEX_NAME = os.getenv("INDEX_NAME","fashion-products-clip")
pc = pinecone.Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# CLIP init
device = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


## LLM CONFIG
HF_API_KEY = os.getenv("HF_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("INDEX_NAME")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Initialize models and services
pc = pinecone.Pinecone(api_key=PINECONE_API_KEY)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
base_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(DEVICE)

if torch.cuda.device_count() > 1:
    base_model = torch.nn.DataParallel(base_model)

# Hugging Face Endpoints (Free models)
PARSE_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"
RESPONSE_MODEL = "HuggingFaceH4/zephyr-7b-beta"


def get_image_embedding_from_path_or_url(image_source):
    if image_source.startswith("http://") or image_source.startswith("https://"):
        response = requests.get(image_source)
        image = Image.open(BytesIO(response.content)).convert("RGB")
    else:
        image = Image.open(image_source).convert("RGB")

    inputs = processor(images=[image], return_tensors="pt", padding=True)
    pixel_values = inputs["pixel_values"].to(device)

    with torch.no_grad():
        if device == "cuda":
            with torch.amp.autocast(device_type='cuda'):
                outputs = model.get_image_features(pixel_values=pixel_values)
        else:
            outputs = model.get_image_features(pixel_values=pixel_values)

    embedding = outputs / (outputs.norm(p=2, dim=-1, keepdim=True) + 1e-8)
    return embedding.cpu().numpy()[0].tolist()


def get_image_embedding(image: Image.Image):
    inputs = processor(images=[image], return_tensors="pt", padding=True)
    pixel_values = inputs["pixel_values"].to(device)

    with torch.no_grad():
        if device == "cuda":
            with torch.amp.autocast(device_type='cuda'):
                outputs = model.get_image_features(pixel_values=pixel_values)
        else:
            outputs = model.get_image_features(pixel_values=pixel_values)

    embedding = outputs / (outputs.norm(p=2, dim=-1, keepdim=True) + 1e-8)
    return embedding.cpu().numpy()[0].tolist()

def search_pinecone(query_embedding, top_k=5):
    query_response = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    return query_response

def search_by_image(image_source, top_k=5):
    query_embedding = get_image_embedding_from_path_or_url(image_source)
    results = search_pinecone(query_embedding, top_k)
    return results


# === /search handles llm directly. ===
@app.route("/search", methods=["POST"])
def search_image():
    print("In search Image",request.files)
    if 'image' not in request.files:
        image_to_pass = None
    else:
        image_to_pass = request.files['image']

    text_to_pass = request.form.get('text', 'Analyse this image and give similar results.')




    def get_from_masterjson(product: str):
        url = f"http://127.0.0.1:5000/productsearch/{product}"
        response = requests.get(url)

        if response.status_code == 200:
            # print(response.json())
            return response.json()
        else:
            print("Error:", response.status_code, response.text)
            return None

    # Pydantic models for validation
    class SearchParams(BaseModel):
        search_type: str
        search_terms: List[str]
        modifiers: Dict[str, str]
        intent: str


    class FashionSearch:
        def __init__(self):
            self.index = pc.Index(INDEX_NAME)
            self.conversation_history = []

        def _hf_api_call(self, model: str, inputs: str, max_retries=3):
            headers = {"Authorization": f"Bearer {HF_API_KEY}"}
            API_URL = f"https://api-inference.huggingface.co/models/{model}"

            payload = {
                "inputs": inputs,
                "parameters": {"max_new_tokens": 500, "return_full_text": False}
            }

            for _ in range(max_retries):
                response = requests.post(API_URL, headers=headers, json=payload)
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 503:  # Model loading
                    print("Model loading, retrying...")
                    continue
            return None

        def _parse_query(self, query: str) -> SearchParams:
            prompt = f"""<s>[INST] Analyze this fashion query and return valid JSON:
                {{
                    "search_type": "text|image|multimodal",
                    "search_terms": ["list", "of", "keywords"],
                    "modifiers": {{
                        "color": "optional",
                        "price_max": "optional number",
                        "material": "optional"
                    }},
                    "intent": "similar_items|alternatives|complements"
                }}

                Query: {query} [/INST]"""

            response = self._hf_api_call(PARSE_MODEL, prompt)
            if not response:
                return SearchParams(
                    search_type="text",
                    search_terms=query.split(),
                    modifiers={},
                    intent="similar_items"
                )

            try:
                raw_json = json_repair.repair_json(response[0]['generated_text'])
                return SearchParams(**json.loads(raw_json))
            except (ValidationError, json.JSONDecodeError) as e:
                print(f"JSON parse error: {e}")
                return SearchParams(
                    search_type="text",
                    search_terms=query.split(),
                    modifiers={},
                    intent="similar_items"
                )

        def _get_embedding(self, text: Optional[str], image: Optional[Image.Image]):
            if text and image:
                text_emb = self._text_embedding(text)
                img_emb = self._image_embedding(image)
                return [0.6 * t + 0.4 * i for t, i in zip(text_emb, img_emb)]
            elif text:
                return self._text_embedding(text)
            elif image:
                return self._image_embedding(image)
            return None

        def _text_embedding(self, text: str):
            inputs = processor(text=[text], return_tensors="pt", padding=True)
            with torch.no_grad():
                outputs = base_model.get_text_features(**inputs.to(DEVICE))
            return outputs.cpu().numpy()[0].tolist()

        def _image_embedding(self, image: Image.Image):
            inputs = processor(images=[image], return_tensors="pt", padding=True)
            with torch.no_grad():
                outputs = base_model.get_image_features(inputs.pixel_values.to(DEVICE))
            return outputs.cpu().numpy()[0].tolist()

        def search(self, query: Optional[str] = None, pil_image: Optional[Image.Image] = None, top_k: int = 5):
            image = pil_image


            search_params = self._parse_query(query) if query else None

            filters = {}
            if search_params:
                if search_params.modifiers.get("color"):
                    filters["baseColour"] = {"$eq": search_params.modifiers["color"]}
                if search_params.modifiers.get("price_max"):
                    filters["discountedPrice"] = {"$lte": float(search_params.modifiers["price_max"])}

            embedding = self._get_embedding(
                text=" ".join(search_params.search_terms) if search_params else None,
                image=image
            )

            results = self.index.query(
                vector=embedding,
                filter=filters,
                top_k=top_k,
                include_metadata=True
            )

            return [self._format_product(match.metadata) for match in results.matches]

        def _format_product(self, stylesdata: dict):
            productName = stylesdata['productDisplayName']
            metadata = get_from_masterjson(productName)

            return ({
                "id": metadata["id"],
                "price": metadata["price"],
                "discountedPrice": metadata["discountedPrice"],
                "productDisplayName": metadata["productDisplayName"],
                "landingPageUrl": metadata["landingPageUrl"],
                "brand": metadata["brand"],
                "gender": metadata["gender"],
                "keywords": metadata["keywords"],
                "morelikethis": metadata["Morelikethis"],
                "images_Urls": metadata["images_Urls"],
                "colors": metadata["colors"],
                "description": metadata["description"]
            })

        def generate_response(self, products: List[Dict], intent: str) -> str:
            product_list = "\n".join([
                f"- {p['productDisplayName']} (${p['discountedPrice']})"
                for p in products
            ])

            prompt = f"""<s>[INST] Create a friendly response for {intent}:
                Products:
                {product_list}

                Guidelines:
                - Use natural, conversational language
                - Highlight key features and prices
                - Mention color options if available
                - Keep under 3 sentences [/INST]"""

            response = self._hf_api_call(RESPONSE_MODEL, prompt)
            return response[0]['generated_text'] if response else "Here are some options:"

    # Usage Example
    if __name__ == "__main__":
        searcher = FashionSearch()

        # Image + text search
        image_file = image_to_pass
        image = Image.open(image_file).convert("RGB")
        results = searcher.search(text_to_pass, pil_image=image)
        print("Printing Searcher Results")
        ai_text = searcher.generate_response(results, f"{results[0]['keywords'][0]} alternatives")
        print(ai_text)
        print(results)

        return jsonify({
            'ai_text': ai_text or "Here Are Some Results..",
            'results': results
        })

### commenting the extra search image for now
# @app.route("/nothing", methods=["POST"])
# def search_image_extra():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files['image']
    try:
        image = Image.open(image_file).convert("RGB")
    except:

        return jsonify({"error": "Invalid image format"}), 400

    embedding = get_image_embedding(image)
    image_results = search_pinecone(embedding, top_k=5)

    # Load reference metadata
    with open('masterfinal.json', 'r') as file:
        data = json.load(file)

    interested_data = []
    matched_product_names = [match['metadata']['productDisplayName'] for match in image_results['matches']]

    for product_name in matched_product_names:
        for item in data:
            try:
                if item['data']['productDisplayName'] == product_name:
                    interested_data.append({
                        'id': item['data']['id'],
                        'price': item['data']['price'],
                        'discountedPrice': item['data']['discountedPrice'],
                        'productDisplayName': item['data']['productDisplayName'],
                        'landingPageUrl': "https://myntra.com/" + item['data']['landingPageUrl'],
                        'brand': item['data']['brandName'],
                        'gender': item['data']['gender'],
                        'keywords': list(filter(None, [
                            item['data'].get('displayCategories', '').lower(),
                            item['data'].get('usage', '').lower(),
                            item['data'].get('masterCategory', {}).get('typeName', '').lower(),
                            item['data'].get('subCategory', {}).get('typeName', '').lower(),
                            item['data'].get('baseColour', '').lower(),
                            item['data'].get('gender', '').lower()
                        ])),
                        'Morelikethis': [
                            'https://myntra.com/' + crossLink['value']
                            for crossLink in item['data'].get('crossLinks', [])
                        ],
                        'images_Urls': [
                            item['data']['styleImages'][key]['imageURL']
                            for key in item['data']['styleImages'].keys()
                            if key != 'size_representation'
                        ],
                        'colors': [
                        {
                            "Color": item['data']['colours']['colors'][colorcode]['global_attr_base_colour'] +
                                     (f" and {item['data']['colours']['colors'][colorcode]['global_attr_colour1']}"
                                      if item['data']['colours']['colors'][colorcode]['global_attr_colour1'] != 'NA' else ''),
                            "BuyLink": 'https://myntra.com/' + item['data']['colours']['colors'][colorcode]['dre_landing_page_url'],
                            "ImgSrc": item['data']['colours']['colors'][colorcode]['search_image']
                        }
                        for colorcode in item['data']['colours']['colors'].keys()
                    ] if 'colours' in item['data'] else [{'Color': item['data']['baseColour'],'BuyLink':"https://myntra.com/" + item['data']['landingPageUrl'],'ImgSrc': item['data']['styleImages']['default']['imageURL']}],
                    'description': item['data']['productDescriptors']['description']['value']
                })
                    break
            except Exception as e:
                print("Error parsing item:", e)
                continue
    
    print("interested data", interested_data)




'''
Required in the llm model for easy data extraction.
Instead of referring to the masterjson again and again. just pass the product name 
for which you need the full json, and this server will extract and give it to you 
'''

@app.route("/productsearch/<productName>", methods=["GET"])
def get_json_by_productname(productName):
    print("Searched product", productName)

    with open('masterfinal.json', 'r') as file:
        data = json.load(file)

    for item in data:
        try:
            if item['data']['productDisplayName'] == productName:
                print(f"{productName} found")
                return jsonify({
                    'id': item['data']['id'],
                    'price': item['data']['price'],
                    'discountedPrice': item['data']['discountedPrice'],
                    'productDisplayName': item['data']['productDisplayName'],
                    'landingPageUrl': "https://myntra.com/" + item['data']['landingPageUrl'],
                    'brand': item['data']['brandName'],
                    'gender': item['data']['gender'],
                    'keywords': list(filter(None, [
                        item['data'].get('displayCategories', '').lower(),
                        item['data'].get('usage', '').lower(),
                        item['data'].get('masterCategory', {}).get('typeName', '').lower(),
                        item['data'].get('subCategory', {}).get('typeName', '').lower(),
                        item['data'].get('baseColour', '').lower(),
                        item['data'].get('gender', '').lower()
                    ])),
                    'Morelikethis': [
                        'https://myntra.com/' + crossLink['value']
                        for crossLink in item['data'].get('crossLinks', [])
                    ],
                    'images_Urls': [
                        item['data']['styleImages'][key]['imageURL']
                        for key in item['data']['styleImages'].keys()
                        if key != 'size_representation'
                    ],
                    'colors': [
                        {
                            "Color": item['data']['colours']['colors'][colorcode]['global_attr_base_colour'] +
                                     (f" and {item['data']['colours']['colors'][colorcode]['global_attr_colour1']}"
                                      if item['data']['colours']['colors'][colorcode]['global_attr_colour1'] != 'NA' else ''),
                            "BuyLink": 'https://myntra.com/' + item['data']['colours']['colors'][colorcode]['dre_landing_page_url'],
                            "ImgSrc": item['data']['colours']['colors'][colorcode]['search_image']
                        }
                        for colorcode in item['data']['colours']['colors'].keys()
                    ] if 'colours' in item['data'] else [{'Color': item['data']['baseColour'],'BuyLink':"https://myntra.com/" + item['data']['landingPageUrl'],'ImgSrc': item['data']['styleImages']['default']['imageURL']}],
                    'description': item['data']['productDescriptors']['description']['value']
                })
        except Exception as e:
            print("Error parsing item:", e)
            continue

    return jsonify({"error": "No such ProductName Found"})





# === Run Server ===
if __name__ == "__main__":
    app.run(debug=True)
