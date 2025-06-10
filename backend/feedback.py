import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
import pickle
import threading
import time




class FeedbackLearningSystem:
    def __init__(self):
        self.negative_feedback = defaultdict(list)  # product_id -> list of query embeddings that were negative
        self.positive_feedback = defaultdict(list)  # product_id -> list of query embeddings that were positive
        self.feedback_weights = defaultdict(float)  # product_id -> adjustment weight
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.model_updated = False
        self.load_feedback_model()
    
    def save_feedback_model(self):
        """Save the feedback model to disk"""
        try:
            model_data = {
                'negative_feedback': dict(self.negative_feedback),
                'positive_feedback': dict(self.positive_feedback),
                'feedback_weights': dict(self.feedback_weights),
                'vectorizer': self.vectorizer
            }
            with open('feedback_model.pkl', 'wb') as f:
                pickle.dump(model_data, f)
            print("Feedback model saved successfully")
        except Exception as e:
            print(f"Error saving feedback model: {e}")
    
    def load_feedback_model(self):
        """Load the feedback model from disk"""
        try:
            with open('feedback_model.pkl', 'rb') as f:
                model_data = pickle.load(f)
                self.negative_feedback = defaultdict(list, model_data.get('negative_feedback', {}))
                self.positive_feedback = defaultdict(list, model_data.get('positive_feedback', {}))
                self.feedback_weights = defaultdict(float, model_data.get('feedback_weights', {}))
                self.vectorizer = model_data.get('vectorizer', TfidfVectorizer(max_features=1000, stop_words='english'))
            print("Feedback model loaded successfully")
        except FileNotFoundError:
            print("No existing feedback model found, starting fresh")
        except Exception as e:
            print(f"Error loading feedback model: {e}")
    
    def add_feedback(self, product_id, user_query, is_relevant=True, embedding=None):
        """Add feedback for a product"""
        try:
            # Convert query to vector representation
            if embedding is None:
                query_vector = self.vectorizer.fit_transform([user_query]).toarray()[0]
            else:
                query_vector = embedding
            
            if is_relevant:
                self.positive_feedback[product_id].append(query_vector)
                # Increase weight for positive feedback
                self.feedback_weights[product_id] += 0.1
            else:
                self.negative_feedback[product_id].append(query_vector)
                # Decrease weight for negative feedback
                self.feedback_weights[product_id] -= 0.2
            
            # Cap the weights to prevent extreme values
            self.feedback_weights[product_id] = max(-1.0, min(1.0, self.feedback_weights[product_id]))
            
            self.model_updated = True
            print(f"Feedback added for product {product_id}: {'positive' if is_relevant else 'negative'}")
            
        except Exception as e:
            print(f"Error adding feedback: {e}")
    
    def get_adjusted_score(self, product_id, query_embedding, original_score):
        """Get adjusted similarity score based on feedback"""
        try:
            base_adjustment = self.feedback_weights.get(product_id, 0.0)
            
            # Calculate similarity with negative feedback
            negative_penalty = 0.0
            if product_id in self.negative_feedback and self.negative_feedback[product_id]:
                neg_vectors = np.array(self.negative_feedback[product_id])
                if len(query_embedding) == neg_vectors.shape[1]:
                    similarities = cosine_similarity([query_embedding], neg_vectors)[0]
                    # Higher similarity with negative feedback = more penalty
                    negative_penalty = np.mean(similarities) * 0.3
            
            # Calculate bonus from positive feedback
            positive_bonus = 0.0
            if product_id in self.positive_feedback and self.positive_feedback[product_id]:
                pos_vectors = np.array(self.positive_feedback[product_id])
                if len(query_embedding) == pos_vectors.shape[1]:
                    similarities = cosine_similarity([query_embedding], pos_vectors)[0]
                    # Higher similarity with positive feedback = more bonus
                    positive_bonus = np.mean(similarities) * 0.2
            
            # Combine all adjustments
            adjusted_score = original_score + base_adjustment + positive_bonus - negative_penalty
            
            return max(0.0, min(1.0, adjusted_score))  # Keep score between 0 and 1
            
        except Exception as e:
            print(f"Error calculating adjusted score: {e}")
            return original_score
