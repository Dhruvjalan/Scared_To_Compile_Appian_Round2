# ShopSmarter: AI-Powered Personal Shopping Assistant for E-Commerce

## Background

Online shopping is rapidly evolving, but customers still face significant challenges in discovering products that truly match their preferences [1]. This is especially true when users struggle to describe exactly what they are looking for [1]. Often, users wish they could simply show an item – perhaps a picture from social media, a snapshot of an outfit they saw, or an image of a product – and instantly receive personalized recommendations [1].

## Problem Statement

Leveraging the power of AI in computer vision and recommendation systems, the vision is to create a Personal Shopping Assistant [2]. The challenge is to **design and develop an AI-powered Personal Shopping Assistant that personalizes the shopping experience for an e-commerce website and automates the process** [2]. The system should be capable of understanding visual inputs (such as apparel, accessories, home decor, gadgets, etc.) and suggesting similar or complementary products available in the store [2].

## Assistant Requirements

The AI-powered Personal Shopping Assistant must fulfill the following requirements:

*   **Accept image uploads** as the primary input [3].
*   **Analyze the uploaded image** to identify key features (e.g., color, texture, category, style, brand-like attributes) [3].
*   **Recommend visually similar products and/or complementary products** available on the platform [3].
*   **Personalize suggestions** based on user preferences, behavior history, or optional style choices (if available) [3].
*   Allow users to **use prompts to interact** with the agent and suggest further modifications or share other inputs [3]. Based on these interactions, the agent should be able to resolve queries [3].
*   **Automate the checkout process** (It can also be able to automate the checkout process) [4].
*   Provide a **seamless and intuitive user interface experience** [4].

## Example Use Cases

Here are some examples of how the ShopSmarter assistant could be used:

*   A user uploads a photo of a jacket they saw on Instagram and gets 10 similar jackets available on the platform [4, 5].
*   A user snaps a photo of their living room and gets recommended matching lamps and decor [5].
*   A user uploads a photo of sneakers and is shown similar sneakers along with matching socks and athletic wear [5].

## Technical Possibilities & Approaches

Participants are encouraged to explore various technical avenues:

*   **Implement impactful AI**: Utilize machine learning/computer vision models (e.g., CNNs, Vision Transformers) and agentic AI [5].
*   **Real-World Feels**: Ensure the solution has high e-commerce relevance, making it relatable and instantly testable [5].
*   **Creative Freedom**: Projects can personalize recommendations across various categories like fashion, home decor, electronics, or any other category [5, 6].
*   **Beginner to Pro Friendly**: The theme offers an easy entry point for beginners while allowing deep exploration of AI/ML or UX layers for more advanced participants [6].
*   **Scalable Backend**: Design backend services capable of efficiently retrieving and ranking product recommendations [6].
*   **Multimodal Challenge**: Implement multi-modal recommendations (combining image and text search) and augment with natural language input (e.g., "show me similar jackets" after uploading a picture) [6].

## Project Criteria

Projects will be evaluated based on the following criteria:

*   **Accuracy and relevance** of recommendations [4].
*   **User-friendliness** of the upload and recommendation process [4].
*   **Innovation** and trying something new which doesn’t exist in the market [4].
*   **Scalability and performance** of the system [4].
*   **Use of different technologies** to solve the problem and make it market ready [4].

## Suggested Tools and Frameworks

While participants are free to use any tools/technologies [7, 8], here are some suggestions:

*   **Image Input**: OpenAI CLIP, Google Vision API, YOLOv8, CLIP Interrogator [7]
*   **NLP Interaction**: OpenCV, PySceneDetect, scikit-learn, spaCy [7]
*   **Recommendations**: LangChain, OpenAI GPT APIs, Hugging Face Transformers, LlamaIndex [7]
*   **Frontend**: axe-core, WAVE, Lighthouse [7]
*   **Frontend Development**: HTML, CSS, JavaScript, React, Vue.js, Angular, ARIA roles [7]
*   **Backend Development & Databases**: Flask, Firebase, Nodejs, Spring Boot, PostgreSQL, MariaDB, SQLite [7]
*   **AI/Cloud Services**: AWS AI Services, Google Cloud AI Platform, Azure Cognitive Services [7]
*   **Checkout Automation**: Puppeteer (for demo automation), Stripe (for mock checkout), Paypal [9]

## Project Submission Guidelines

*   **Presentation**: Submit in .pptx or .pdf format, with a suggestion of max 10 to 12 slides [1].
*   **Prototype**: Develop in the language of the participant's choice [1].
*   **Demo Video**: Include a demo video demonstrating how the solution works [1].
*   **Codebase**: Provide a Github link for the codebase [1].

## To run:

1. ../> <pre> ``` git clone git@github.com:Dhruvjalan/Scared_To_Compile_Appian_Round2.git ``` </pre>

### I. Backend

1. ..\Appian_Round2\backend> <pre> ```python -m venv venv``` </pre>

2. ..\Appian_Round2\backend> <pre> ```venv\Scripts\activate``` </pre>

3. ..\Appian_Round2\backend> <pre> ```pip install flask flask-cors pillow torch pinecone requests transformers pyreadline3``` </pre>

4. (venv)..\Appian_Round2\backend> <pre> ```python main.py``` </pre>

5. Click on the link displayed afterwards in the terminal, or open localhost:5000 on your browser

### II. Frontend

1. ..\Appian_Round2> <pre> ```npm install``` </pre>

2. ..\Appian_Round2> <pre> ```npm run dev``` </pre>

3. Click on the link displayed afterwards in the terminal, or open localhost:3000 on your browser

### III. Explore the app
Once the server (backend) as well as the front-end is running, you can finally use the app. 

1. Drag-and-Drop any image directly from your browser, or add an attachment of any `.jpg`,`.png` or `.webp` file from your system.

2. Add any question about the image in the searchbar. (You can search only by the searchbar if you don't have any image reference)

3. The AI Powered Chatbot will give you the desired results. You can then also ask follow-up questions if you like.


## Citation

Dataset from:

Param Aggarwal. (2019). Fashion Product Images Dataset [Data set]. Kaggle. https://doi.org/10.34740/KAGGLE/DS/139630


