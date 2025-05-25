# core.py
import json
import torch
import requests
from io import BytesIO
from PIL import Image
from typing import Optional, Dict, List
from pydantic import BaseModel, ValidationError
from transformers import CLIPProcessor, CLIPModel
from pinecone import Pinecone, ServerlessSpec
import requests
import json_repair  # For handling malformed JSON

# def llm(human_entered_imgsrc:str,human_entered_text:str):
# Configuration
def llm(human_entered_imgsrc: str = None, human_entered_text: str = "Analyse this image and give similar results."):
    PINECONE_API_KEY = "pcsk_3uREgt_4HQhSbEi9hZjRkoURzXJQxG3MLagkb8u18hGtJUYkhFDS3yGTi41NUMwxFt2Ufy"
    HF_API_KEY = "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"
    INDEX_NAME = "fashion-products-clip"
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

    # Initialize models and services
    pc = Pinecone(api_key=PINECONE_API_KEY)
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    base_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(DEVICE)

    if torch.cuda.device_count() > 1:
        base_model = torch.nn.DataParallel(base_model)

    # Hugging Face Endpoints (Free models)
    PARSE_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"
    RESPONSE_MODEL = "HuggingFaceH4/zephyr-7b-beta"

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


    class ProductResponse(BaseModel):
        id: int
        price: int
        discountedPrice: int
        productDisplayName: str
        landingPageUrl: str
        brand: str
        gender: str
        keywords: List[str]
        morelikethis: List[str]
        images_Urls: List[str]
        colors: List[Dict[str, str]]
        description: str

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
                # Handle malformed JSON
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
                return [0.6*t + 0.4*i for t,i in zip(text_emb, img_emb)]
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

        def search(self, query: Optional[str] = None, image_url: Optional[str] = None, top_k: int = 5):
            image = None
            if image_url:
                response = requests.get(image_url)
                image = Image.open(BytesIO(response.content)).convert("RGB")

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



            return({
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
        image_url = human_entered_imgsrc
        results = searcher.search(human_entered_text, image_url=image_url)
        print("Printing Searcher Results")
        ai_text = searcher.generate_response(results, f"{results[0]['keywords'][0]} alternatives")
        print(ai_text)
        print(results)

        return({
            'ai_text': ai_text or "Here Are Some Results..",
            'results':results
        })


response_llm = llm(human_entered_imgsrc="data:image/jpeg;base64,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",human_entered_text="Analyse and give similar results")
print(response_llm)