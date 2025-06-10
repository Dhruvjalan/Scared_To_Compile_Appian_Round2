# !pip install pinecone-client transformers torch pillow requests

import os
import json
import time
import pinecone
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from torch.utils.data import Dataset, DataLoader

# --- Initialize Pinecone ---
pinecone_api_key = os.getenv("PINECONE_API_KEY") or "YOUR_PINECONE_API_KEY"  # Prefer env var
index_name = "deepfashion2-clip"

pc = pinecone.Pinecone(api_key=pinecone_api_key)

# Create Pinecone index if it doesn't exist
if index_name not in pc.list_indexes():
    pc.create_index(
        name=index_name,
        dimension=512,  # CLIP's output dimension
        metric="cosine",
        spec=pinecone.ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

# Wait until index is ready
while index_name not in pc.list_indexes():
    time.sleep(2)

index = pc.Index(index_name)

# --- Initialize CLIP ---
device = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# --- Custom Dataset Class ---
class DeepFashion2Dataset(Dataset):
    def _init_(self, root_dir, split="train"):
        self.root_dir = os.path.join(root_dir, split)
        self.image_dir = os.path.join(self.root_dir, "image")
        self.anno_dir = os.path.join(self.root_dir, "annos")

        assert os.path.exists(self.image_dir), f"Image directory not found: {self.image_dir}"
        assert os.path.exists(self.anno_dir), f"Annotation directory not found: {self.anno_dir}"

        self.image_files = sorted([
            f for f in os.listdir(self.image_dir) if f.endswith('.jpg')
        ])

    def _len_(self):
        return len(self.image_files)

    def _getitem_(self, idx):
        img_name = self.image_files[idx]
        img_path = os.path.join(self.image_dir, img_name)
        anno_path = os.path.join(self.anno_dir, img_name.replace('.jpg', '.json'))

        image = Image.open(img_path).convert("RGB")
        with open(anno_path, 'r') as f:
            annos = json.load(f)
        return image, annos, img_name

# --- Custom Collate Function ---
def collate_fn(batch):
    images, annos, filenames = zip(*batch)
    return list(images), list(annos), list(filenames)

# --- Preprocessing and Embedding Generation ---
def process_batch(images):
    inputs = processor(images=images, return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        image_embeds = model.get_image_features(**inputs)
        image_embeds = image_embeds / image_embeds.norm(p=2, dim=-1, keepdim=True)
    return image_embeds.cpu().numpy()

# --- DataLoader setup ---
dataset = DeepFashion2Dataset(root_dir="/path/to/DeepFashion2", split="train")  # Update path
dataloader = DataLoader(dataset, batch_size=32, num_workers=4, collate_fn=collate_fn)

# --- Helper for chunking ---
def chunked(iterable, n):
    for i in range(0, len(iterable), n):
        yield iterable[i:i + n]

# --- Process and Upload to Pinecone ---
for images, annos, filenames in dataloader:
    embeddings = process_batch(images)

    vectors = []
    for embedding, anno, filename in zip(embeddings, annos, filenames):
        for item_id, item in anno.items():
            if item_id.startswith('item'):
                metadata = {
                    "filename": filename,
                    "category": item.get('category_name', ''),
                    "category_id": item.get('category_id', ''),
                    "style": item.get('style', ''),
                    "bounding_box": item.get('bounding_box', []),
                    "source": anno.get('source', '')
                }
                vectors.append({
                    "id": f"{filename}-{item_id}",
                    "values": embedding.tolist(),
                    "metadata": metadata
                })

    for vec_batch in chunked(vectors, 100):
        index.upsert(vectors=vec_batch)
        print(f"Uploaded batch of {len(vec_batch)} vectors.")

print("All embeddings uploaded to Pinecone.")