# 🛍️ ShopSmarter: AI-Powered Personal Shopping Assistant for E-Commerce

ShopSmarter is a full-stack web application that integrates **AI-based multimodal search** using image and text inputs. It serves as a personal shopping assistant that helps users discover visually or contextually similar products based on an uploaded image or natural language query.

![AI System Flow](/public/flow2.png)

> 🔍 Powered by Computer Vision, NLP, and Vector Similarity Search.

---

## Demo Link
https://drive.google.com/file/d/1MhVI6TtNRrLm2TrWgALnt9uZsaCHJjUr/view?usp=sharing


## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:Dhruvjalan/Scared_To_Compile_Appian_Round2.git
cd Scared_To_Compile_Appian_Round2
```

---

### 2. Backend Setup (Flask + AI Models)

Navigate to the backend directory:

```bash
cd backend
```

#### Create and Activate a Virtual Environment

On **Windows**:

```bash
python -m venv venv
venv\Scripts\activate
```

On **macOS/Linux**:

```bash
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install flask flask-cors pillow torch pinecone requests transformers pyreadline3 whisper sounddevice scikit-learn pickle
```

#### Start the Backend Server

```bash
python main.py
```

Visit `http://localhost:5000` to confirm the backend is running.

---

### 3. Frontend Setup (Next.js)

Return to the project root:

```bash
cd ..
```

Install frontend dependencies:

```bash
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to view the app.

---

## 🧪 Using the App

Once both the **backend** and **frontend** are running:

1. **Upload an image** (drag-and-drop or upload `.jpg`, `.png`, or `.webp` files).
2. **Ask a question** related to the image or use the text input alone.
3. **Get AI-generated suggestions** for similar or complementary products.
4. Ask **follow-up questions** to refine recommendations.

---

## 🧠 Problem Statement

Leverage the power of **AI in Computer Vision and Recommendation Systems** to build a Personal Shopping Assistant.

> The challenge:  
> **Design and develop an AI-powered shopping assistant that personalizes e-commerce experiences by processing visual and textual inputs, and suggesting relevant products from the catalog.**

It should understand images of apparel, accessories, home décor, gadgets, etc., and provide recommendations from the store.

---

## 📂 Project Structure

```
├── backend/                # Flask API with AI models
│   └── main.py
├── public/                 # Static files (e.g., flowchart.png)
│   └── flowchart.png
├── pages/                  # Next.js pages
├── components/             # Reusable React components
├── styles/                 # Tailwind CSS or global styles
└── README.md
```

---

## 📸 Flowchart Overview

The AI system flow is illustrated in `public/flowchart.png` and covers:

- User interaction (image + query)
- Backend processing (image parsing, query embedding)
- Multimodal AI inference
- Vector database search
- AI response generation
- Frontend rendering

---

## 🤝 Contributing

PRs, suggestions, and issues are welcome! Please fork and submit a pull request.

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for more information.

---
