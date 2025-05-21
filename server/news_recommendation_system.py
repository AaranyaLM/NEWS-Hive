#!/usr/bin/env python3
# news_recommendation_system.py
# AI News Recommendation System for MERN Project

import pymongo
import urllib.parse
import certifi
import pandas as pd
import numpy as np
import re
import random
from datetime import datetime
import contractions
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
#import nltk
#nltk.download('punkt_tab')
#nltk.download('punkt')        
# nltk.download('stopwords')
# nltk.download('wordnet')
# nltk.download('omw-1.4')

def connect_to_mongodb():
    """Connect to MongoDB and return database handle"""
    try:
        # Encode password to handle special characters
        password = urllib.parse.quote_plus("@aaranya01")

        # Update connection string with explicit TLS configuration
        connection_string = f"mongodb+srv://aaranyalmaskey:{password}@newshive.3ub8wnl.mongodb.net/?retryWrites=true&w=majority"

        # Create client with updated parameters
        client = pymongo.MongoClient(
            connection_string,
            tlsCAFile=certifi.where(),
            connectTimeoutMS=30000,
            socketTimeoutMS=30000,
            serverSelectionTimeoutMS=30000
        )

        # Test connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB!")

        # Get database handle
        db = client["news_hive"]
        return db
    except Exception as e:
        print(f" Error connecting to MongoDB: {e}")
        return None

def extract_interaction_data(db):
    """Extract user interactions from MongoDB"""
    interactions = list(db.interactions.find({}))

    # Convert to DataFrame
    interaction_df = pd.DataFrame(interactions)

    # Check if DataFrame is empty or missing key columns
    if interaction_df.empty or 'userId' not in interaction_df.columns:
        print("No interaction data found or missing required columns.")
        return None

    print(f"Loaded {len(interaction_df)} interaction records")
    return interaction_df

def extract_article_content(article_data):
    """Extract content from article data object"""
    if not article_data or not isinstance(article_data, dict):
        return ""

    content = []

    # Extract title
    if 'title' in article_data:
        content.append(article_data['title'])

    # Extract description
    if 'description' in article_data:
        content.append(article_data['description'])

    # Extract content
    if 'content' in article_data:
        content.append(article_data['content'])

    return " ".join([c for c in content if c])

def preprocess_text(text):
    """Preprocess article text"""
    if not isinstance(text, str):
        return ""

    # Convert to lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r'http\S+', '', text)

    # Remove mentions
    text = re.sub(r'@\w+', '', text)

    # Remove hashtags
    text = re.sub(r'#\S+', '', text)

    # Remove numbers
    text = re.sub(r'\d+', '', text)

    # Remove special characters
    text = re.sub(r'[^a-zA-Z\s]', '', text)

    # Fix contractions
    text = contractions.fix(text)

    # Tokenize
    tokens = word_tokenize(text)

    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words]

    # Lemmatize
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]

    # Join tokens back to text
    text = ' '.join(tokens)

    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    return text

def process_user_interactions(interaction_df):
    """Process user interactions and create a dictionary of user interactions"""
    # Dictionary to store user interactions
    user_interactions = {}

    # Define interaction strength weights
    weights = {
        'liked': 5.0,
        'saved': 4.0,
        'downloaded': 3.0,
        'commented': 2.0,
        'shares': 3.0,
        'readMore': 1.0
    }

    # Process each interaction
    for _, row in interaction_df.iterrows():
        user_id = row.get('userId')
        article_id = row.get('articleId')
        article_data = row.get('articleData', {})

        if not user_id or not article_id:
            continue

        # Initialize user entry if not exists
        if user_id not in user_interactions:
            user_interactions[user_id] = []

        # Extract article content
        content = extract_article_content(article_data)
        processed_content = preprocess_text(content)

        if not processed_content:
            continue

        # Calculate interaction score based on user actions
        interaction_score = 0

        # Process each interaction type
        for interaction_type in ['liked', 'saved', 'downloaded', 'readMore']:
            if row.get(interaction_type, False):
                interaction_score += weights.get(interaction_type, 1.0)

        # Process comments
        if 'comments' in row and isinstance(row['comments'], list):
            comments_count = len(row['comments'])
            if comments_count > 0:
                interaction_score += weights.get('commented', 2.0) * min(comments_count, 3)

        # Process shares
        if 'shares' in row and row['shares'] > 0:
            interaction_score += min(row['shares'], 5) * weights.get('shares', 3.0)

        # Store this interaction
        interaction_info = {
            'article_id': article_id,
            'content': content,
            'processed_content': processed_content,
            'interaction_score': interaction_score,
            'timestamp': row.get('createdAt', datetime.now())
        }

        user_interactions[user_id].append(interaction_info)

    return user_interactions

def extract_user_important_terms(user_interactions, max_features=500):
    """Extract important terms for each user based on their interactions"""
    user_term_profiles = {}
    user_vectorizers = {}

    for user_id, interactions in user_interactions.items():
        if len(interactions) < 2:
            print(f"User {user_id} has too few interactions for reliable term extraction")
            continue

        # Extract article contents
        articles = [interaction['processed_content'] for interaction in interactions]
        interaction_scores = [interaction['interaction_score'] for interaction in interactions]

        # Create and fit TF-IDF vectorizer for this user
        tfidf_vectorizer = TfidfVectorizer(max_features=max_features,
                                         min_df=1,
                                         max_df=0.9)

        tfidf_matrix = tfidf_vectorizer.fit_transform(articles)
        terms = tfidf_vectorizer.get_feature_names_out()

        # Weight the TF-IDF scores by interaction scores
        weighted_matrix = []
        for i, score in enumerate(interaction_scores):
            weighted_vector = tfidf_matrix[i].multiply(score)
            weighted_matrix.append(weighted_vector)

        # Combine weighted vectors
        user_profile = sum(weighted_matrix)

        # Normalize
        profile_sum = user_profile.sum()
        if profile_sum > 0:
            user_profile = user_profile / profile_sum

        # Store user profile
        user_term_profiles[user_id] = user_profile
        user_vectorizers[user_id] = tfidf_vectorizer

        # Store top terms for this user
        profile_array = user_profile.toarray()[0]
        top_indices = np.argsort(profile_array)[-20:][::-1]
        top_terms = [(terms[idx], profile_array[idx]) for idx in top_indices]

        print(f"\nTop terms for user {user_id}:")
        for term, score in top_terms:
            if score > 0:
                print(f"  - {term}: {score:.4f}")

    return user_term_profiles, user_vectorizers

def build_personalized_models(user_interactions, user_term_profiles, user_vectorizers):
    """Build individual prediction models for each user using PCA for dimensionality reduction and DBSCAN for clustering"""
    user_models = {}
    user_terms_db = {}  # Store predicted terms for database

    for user_id, interactions in user_interactions.items():
        if len(interactions) < 3:  # DBSCAN needs at least a few points
            print(f"User {user_id} has too few interactions ({len(interactions)}) for reliable modeling")
            continue

        print(f"\nBuilding personalized model for user {user_id} with {len(interactions)} interactions")

        # Get user vectorizer
        if user_id not in user_vectorizers:
            continue

        vectorizer = user_vectorizers[user_id]

        # Prepare data
        X = []  # Features: article content vectors
        interaction_scores = []  # Keep track of scores for later use
        article_ids = []  # Keep track of article IDs
        article_contents = []  # Keep track of article contents

        # Process each interaction
        for interaction in interactions:
            # Vectorize article content
            content_vector = vectorizer.transform([interaction['processed_content']])

            # Get interaction score
            score = interaction['interaction_score']

            X.append(content_vector)
            interaction_scores.append(score)
            article_ids.append(interaction['article_id'])
            article_contents.append(interaction['processed_content'])

        # Convert to arrays
        X = np.vstack([x.toarray() for x in X])

        # Apply PCA for dimensionality reduction
        n_components = min(X.shape[0] - 1, X.shape[1], 50)  # Use minimum of (n_samples-1, n_features, 50)
        if n_components < 2:
            n_components = 2  # Ensure at least 2 components

        print(f"  Applying PCA to reduce dimensions from {X.shape[1]} to {n_components}")
        pca = PCA(n_components=n_components)
        X_pca = pca.fit_transform(X)
        explained_variance = sum(pca.explained_variance_ratio_) * 100
        print(f"  PCA explained variance: {explained_variance:.2f}%")

        # Standardize features for better DBSCAN performance
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_pca)

        # Apply DBSCAN clustering with slightly randomized parameters
        # Vary eps slightly to get different clustering results
        eps_value = 3 + random.uniform(-0.1, 0.1)
        dbscan = DBSCAN(eps=eps_value, min_samples=2)
        clusters = dbscan.fit_predict(X_scaled)

        # Store the model components for prediction
        user_models[user_id] = {
            'dbscan': dbscan,
            'scaler': scaler,
            'pca': pca,  # Store PCA model
            'vectorizer': vectorizer,
            'X': X_scaled,
            'clusters': clusters,
            'article_ids': article_ids,
            'scores': interaction_scores
        }

        # Analyze the clusters
        n_clusters = len(set(clusters)) - (1 if -1 in clusters else 0)
        n_noise = list(clusters).count(-1)

        print(f"  DBSCAN found {n_clusters} clusters and {n_noise} noise points")

        # For each cluster, calculate the average interaction score
        cluster_scores = {}
        for i, cluster in enumerate(clusters):
            if cluster == -1:  # Skip noise
                continue

            if cluster not in cluster_scores:
                cluster_scores[cluster] = {'scores': [], 'indices': []}

            cluster_scores[cluster]['scores'].append(interaction_scores[i])
            cluster_scores[cluster]['indices'].append(i)

        # Print cluster information
        for cluster, data in cluster_scores.items():
            avg_score = sum(data['scores']) / len(data['scores'])
            print(f"  Cluster {cluster}: {len(data['scores'])} items, avg score: {avg_score:.4f}")

        # Extract terms from the clusters with diversity
        if n_clusters > 0:
            # Get terms from vectorizer
            terms = vectorizer.get_feature_names_out()

            # Sort clusters by average score
            sorted_clusters = sorted(
                cluster_scores.items(),
                key=lambda x: sum(x[1]['scores'])/len(x[1]['scores']) if x[1]['scores'] else 0,
                reverse=True
            )

            # Initialize candidate term pool
            candidate_terms = []
            term_scores = []

            # Process each cluster to build a candidate pool
            for cluster_id, data in sorted_clusters:
                # Get articles in this cluster
                cluster_indices = data['indices']
                cluster_docs = [article_contents[i] for i in cluster_indices]

                if cluster_docs:
                    # Create a TF-IDF matrix for just this cluster
                    cluster_tfidf = vectorizer.transform(cluster_docs)

                    # Get average TF-IDF scores for terms in this cluster
                    cluster_term_scores = cluster_tfidf.mean(axis=0).A1

                    # Get the top terms for this cluster
                    top_indices = np.argsort(cluster_term_scores)[-20:][::-1]  # Get top 20 terms per cluster

                    for idx in top_indices:
                        if cluster_term_scores[idx] > 0:
                            term = terms[idx]
                            score = float(cluster_term_scores[idx])

                            # Add term to candidate pool with cluster info
                            if term not in [t for t, _, _ in candidate_terms]:
                                candidate_terms.append((term, score, cluster_id))

            # If we have candidate terms, proceed with diversity selection
            if candidate_terms:
                # Sort candidates by score
                candidate_terms.sort(key=lambda x: x[1], reverse=True)

                # Select terms with diversity in mind
                final_terms = []
                final_scores = []
                cluster_counts = {}  # Track how many terms we've taken from each cluster

                # Take top 5 terms by score regardless of cluster (prioritize strongest signals)
                top_terms = candidate_terms[:5]
                for term, score, cluster_id in top_terms:
                    final_terms.append(term)
                    final_scores.append(score)
                    cluster_counts[cluster_id] = cluster_counts.get(cluster_id, 0) + 1

                # For remaining slots, balance between clusters
                remaining_candidates = [c for c in candidate_terms if c[0] not in final_terms]

                # Group remaining candidates by cluster
                cluster_candidates = {}
                for term, score, cluster_id in remaining_candidates:
                    if cluster_id not in cluster_candidates:
                        cluster_candidates[cluster_id] = []
                    cluster_candidates[cluster_id].append((term, score))

                # Rotate through clusters to pick terms (round-robin)
                while len(final_terms) < 20 and cluster_candidates:
                    # Sort clusters by current representation count (ascending)
                    sorted_clusters = sorted(
                        cluster_candidates.keys(),
                        key=lambda c: cluster_counts.get(c, 0)
                    )

                    for cluster_id in sorted_clusters:
                        if not cluster_candidates[cluster_id]:
                            continue

                        # Get the top-scoring term from this cluster
                        cluster_terms = sorted(cluster_candidates[cluster_id], key=lambda x: x[1], reverse=True)
                        selected_term, selected_score = cluster_terms[0]

                        # Add to final terms
                        final_terms.append(selected_term)
                        final_scores.append(selected_score)

                        # Update counts and remove term from candidates
                        cluster_counts[cluster_id] = cluster_counts.get(cluster_id, 0) + 1
                        cluster_candidates[cluster_id].remove((selected_term, selected_score))

                        if len(final_terms) >= 20:
                            break

                # Add some randomness - swap in a few random terms from candidates
                if len(remaining_candidates) > 5 and len(final_terms) >= 10:
                    # Remove 2-3 random terms from the bottom half
                    num_to_replace = random.randint(2, 3)
                    for _ in range(num_to_replace):
                        if len(final_terms) <= 10:  # Ensure we don't remove too many
                            break
                        idx_to_remove = random.randint(10, len(final_terms)-1)
                        final_terms.pop(idx_to_remove)
                        final_scores.pop(idx_to_remove)

                    # Add 2-3 random terms from candidates
                    candidates_for_random = [c for c in remaining_candidates if c[0] not in final_terms]
                    if candidates_for_random:
                        random_selections = random.sample(candidates_for_random, min(num_to_replace, len(candidates_for_random)))
                        for term, score, _ in random_selections:
                            final_terms.append(term)
                            final_scores.append(score)

                # Store in database-ready format
                user_terms_db[user_id] = {
                    'predictedTerms': final_terms[:20],  # Limit to top 20
                    'termScores': final_scores[:20],
                    'updatedAt': datetime.now()
                }

                print("  Top predicted terms with diversity:")
                for i, (term, score) in enumerate(zip(final_terms[:10], final_scores[:10])):
                    print(f"    - {term}: {score:.4f}")
            else:
                # Fallback to TF-IDF terms if no candidate terms found
                if user_id in user_term_profiles:
                    profile = user_term_profiles[user_id]
                    profile_array = profile.toarray()[0]
                    top_indices = np.argsort(profile_array)[-20:][::-1]
                    top_terms = [(terms[idx], float(profile_array[idx])) for idx in top_indices]

                    # Add randomness to TF-IDF terms
                    if len(top_terms) > 10:
                        # Keep top 10
                        selected_terms = top_terms[:10]
                        # Randomly select 10 from the rest
                        remaining = top_terms[10:]
                        random_selection = random.sample(remaining, min(10, len(remaining)))
                        selected_terms.extend(random_selection)
                    else:
                        selected_terms = top_terms

                    user_terms_db[user_id] = {
                        'predictedTerms': [term for term, _ in selected_terms],
                        'termScores': [float(score) for _, score in selected_terms],
                        'updatedAt': datetime.now()
                    }

                    print("  No cluster terms found. Using top TF-IDF terms instead:")
                    for term, score in selected_terms[:10]:
                        print(f"    - {term}: {score:.4f}")
        else:
            # No clusters found, use TF-IDF terms as fallback with randomness
            if user_id in user_term_profiles:
                profile = user_term_profiles[user_id]
                terms = vectorizer.get_feature_names_out()
                profile_array = profile.toarray()[0]
                top_indices = np.argsort(profile_array)[-30:][::-1]  # Get more terms for variety
                top_terms = [(terms[idx], float(profile_array[idx])) for idx in top_indices]

                # Keep top 10, randomly select the rest
                final_terms = [term for term, _ in top_terms[:10]]
                final_scores = [score for _, score in top_terms[:10]]

                # Randomly select up to 10 more from remaining candidates
                remaining = top_terms[10:]
                random_selection = random.sample(remaining, min(10, len(remaining)))
                final_terms.extend([term for term, _ in random_selection])
                final_scores.extend([score for _, score in random_selection])

                user_terms_db[user_id] = {
                    'predictedTerms': final_terms,
                    'termScores': final_scores,
                    'updatedAt': datetime.now()
                }

                print("  No clusters found. Using randomized TF-IDF terms:")
                for term, score in zip(final_terms[:10], final_scores[:10]):
                    print(f"    - {term}: {score:.4f}")

    return user_models, user_terms_db

def predict_user_interest(user_id, article_content, user_models, user_vectorizers):
    """Predict user interest in a new article using PCA and DBSCAN-based model"""
    if user_id not in user_models or user_id not in user_vectorizers:
        print(f"No model available for user {user_id}")
        return 0.0

    # Get the model components
    model_data = user_models[user_id]
    vectorizer = user_vectorizers[user_id]

    # Preprocess and vectorize article content
    processed_content = preprocess_text(article_content)
    content_vector = vectorizer.transform([processed_content])

    # Apply PCA transformation
    if 'pca' in model_data:
        X_pca = model_data['pca'].transform(content_vector.toarray())
    else:
        X_pca = content_vector.toarray()  # Fallback if no PCA model

    # Scale the features
    X_scaled = model_data['scaler'].transform(X_pca)

    # Find the nearest neighbors in the existing clusters
    distances = []
    for i, point in enumerate(model_data['X']):
        dist = np.linalg.norm(X_scaled - point.reshape(1, -1))
        distances.append((dist, i))

    # Sort by distance
    distances.sort()

    # Get the k nearest neighbors and their clusters
    k = min(3, len(distances))
    neighbor_scores = []

    for i in range(k):
        dist, idx = distances[i]
        cluster = model_data['clusters'][idx]
        score = model_data['scores'][idx]

        # Weight by inverse distance
        weight = 1.0 / (1.0 + dist)
        neighbor_scores.append(score * weight)

    # Calculate weighted average score
    if neighbor_scores:
        predicted_score = sum(neighbor_scores) / sum(1.0 / (1.0 + distances[i][0]) for i in range(k))
        return min(predicted_score / 15.0, 1.0)  # Normalize
    else:
        return 0.5  # Default score if no neighbors found

def generate_search_terms(user_id, user_terms_db, num_terms=5):
    """Generate optimized search terms for newsapi.org based on user preferences with randomness"""
    if user_id not in user_terms_db:
        print(f"No predicted terms available for user {user_id}")
        return []

    # Get terms for this user
    terms = user_terms_db[user_id]['predictedTerms']
    scores = user_terms_db[user_id].get('termScores', [1.0] * len(terms))

    # Skip very short terms or common English words that would return too many generic results
    common_words = {'the', 'and', 'was', 'for', 'are', 'not', 'but', 'had', 'has', 'with', 'from'}
    filtered_terms = [(term, score) for term, score in zip(terms, scores)
                     if len(term) > 3 and term.lower() not in common_words]

    if not filtered_terms:
        filtered_terms = list(zip(terms, scores))  # Fallback to original terms if all filtered out

    # Add weighted randomness to term selection
    # We'll select terms with probability proportional to their score
    if len(filtered_terms) > num_terms:
        # Extract terms and scores
        terms, scores = zip(*filtered_terms)

        # Normalize scores to sum to 1 (for probability)
        total_score = sum(scores)
        if total_score > 0:
            probs = [score/total_score for score in scores]

            # Always include the top term
            top_term_idx = scores.index(max(scores))
            selected_indices = [top_term_idx]

            # Randomly select the rest based on weighted probability
            remaining_indices = [i for i in range(len(terms)) if i != top_term_idx]
            remaining_probs = [probs[i] for i in remaining_indices]

            # Normalize remaining probs
            remaining_total = sum(remaining_probs)
            if remaining_total > 0:
                remaining_probs = [p/remaining_total for p in remaining_probs]

                # Select num_terms-1 from remaining
                additional_indices = random.choices(
                    remaining_indices,
                    weights=remaining_probs,
                    k=min(num_terms-1, len(remaining_indices))
                )
                selected_indices.extend(additional_indices)

            # Get selected terms
            search_queries = [terms[i] for i in selected_indices]
        else:
            # If all scores are 0, just randomly select
            search_queries = random.sample(terms, min(num_terms, len(terms)))
    else:
        # If we have fewer terms than needed, use all
        search_queries = [term for term, _ in filtered_terms]

    return search_queries

def store_predicted_terms(db, user_terms_db):
    """Store predicted terms in MongoDB"""
    if db is None:
        print("Database connection not available")
        return False

    # Create collection for predicted terms if not exists
    if 'userPredictedTerms' not in db.list_collection_names():
        db.create_collection('userPredictedTerms')

    # Update or insert terms for each user
    for user_id, terms_data in user_terms_db.items():
        # Add user ID to data
        terms_data['userId'] = user_id

        # Update if exists, insert if not
        result = db.userPredictedTerms.update_one(
            {'userId': user_id},
            {'$set': terms_data},
            upsert=True
        )

        print(f"Stored predicted terms for user {user_id}")

    return True

def generate_news_feed(user_id, user_terms_db, recent_articles=None):
    """Generate personalized news feed for a user"""
    if user_id not in user_terms_db:
        print(f"No predicted terms available for user {user_id}")
        return []

    # Get search terms
    search_terms = generate_search_terms(user_id, user_terms_db)

    print(f"\nRecommended search terms for user {user_id}:")
    for term in search_terms:
        print(f"  - {term}")

    # Mock function for newsapi.org query (replace with actual API call)
    def query_news_api(term):
        """Mock function to query newsapi.org"""
        print(f"  Querying newsapi.org with term: '{term}'")
        # In actual implementation, use:
        # import requests
        # response = requests.get(f"https://newsapi.org/v2/everything?q={term}&apiKey=c31a65d1df3d4f49a2b9fb548e99bb0b")
        # return response.json().get('articles', [])
        return []

    # Generate recommendations for each search term
    recommendations = []
    for term in search_terms:
        articles = query_news_api(term)
        recommendations.extend(articles)

    return recommendations

def run_recommendation_system():
    """Run the complete recommendation system"""
    # Connect to database
    db = connect_to_mongodb()

    if db is not None:
        # Extract interaction data from database
        interaction_df = extract_interaction_data(db)
    else:
        print("No database connection")
        return None, None, None

    if interaction_df is None or interaction_df.empty:
        print("No interaction data available. Exiting.")
        return None, None, None

    # Process user interactions
    user_interactions = process_user_interactions(interaction_df)
    print(f"Processed interactions for {len(user_interactions)} users")

    # Extract important terms for each user
    user_term_profiles, user_vectorizers = extract_user_important_terms(user_interactions)
    print(f"Created term profiles for {len(user_term_profiles)} users")

    # Build personalized models
    user_models, user_terms_db = build_personalized_models(user_interactions, user_term_profiles, user_vectorizers)
    print(f"Built prediction models for {len(user_models)} users")

    # Store predicted terms in database
    if db is not None:
        store_predicted_terms(db, user_terms_db)

    # Generate personalized feed for a sample user (optional)
    if user_terms_db:
        sample_user_id = list(user_terms_db.keys())[0]
        # Uncomment to test news feed generation
        # generate_news_feed(sample_user_id, user_terms_db)

    return user_models, user_terms_db, user_vectorizers

if __name__ == "__main__":
    user_models, user_terms_db, user_vectorizers = run_recommendation_system()
