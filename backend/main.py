from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
import pinecone
import requests
from io import BytesIO
import os
from transformers import CLIPProcessor, CLIPModel
import json
# === Setup ===
app = Flask(__name__)
CORS(app)

# Pinecone init
pinecone_api_key =  "pcsk_3uREgt_4HQhSbEi9hZjRkoURzXJQxG3MLagkb8u18hGtJUYkhFDS3yGTi41NUMwxFt2Ufy"
index_name = "fashion-products-clip"

pc = pinecone.Pinecone(api_key=pinecone_api_key)
index = pc.Index(index_name)

# CLIP init
device = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")




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



# === /search Route ===
@app.route("/search", methods=["POST"])
def search_image():
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
                        ] if 'colours' in item['data'] else [item['data']['baseColour']],
                        'description': item['data']['productDescriptors']['description']['value']
                    })
                    break
            except Exception as e:
                print("Error parsing item:", e)
                continue
    
    print("interested data", interested_data)
    return jsonify(interested_data)



# === Run Server ===
if __name__ == "__main__":
    app.run(debug=True)
