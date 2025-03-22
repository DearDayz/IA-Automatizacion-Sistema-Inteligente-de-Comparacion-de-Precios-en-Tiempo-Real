from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re
import time

# Modelo
model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')

def normalize_name(name):
    name = name.lower()
    name = re.sub(r'\s+', ' ', name)  # Eliminar espacios extra
    name = re.sub(r'[^\w\s]', ' ', name)  # Eliminar caracteres especiales
    name = re.sub(r'(\d+)\s*(gramos|gr|g)', r'\1g', name)  # Reemplazar gramos y gr por g, y unir
    name = re.sub(r'(\d+)\s*(lt)', r'\1l', name)  # Reemplazar lt por l, y unir
    return name.strip()

def compare_products(product1, product2, threshold=0.8):
    """
    Compara los nombres de dos productos utilizando embeddings y cosine similarity.
    
    Args:
        product1 (str): Nombre del primer producto.
        product2 (str): Nombre del segundo producto.
        threshold (float): Umbral para determinar si los productos son iguales (por defecto 0.8).
    
    Returns:
        dict: Resultado con la similitud y si son considerados iguales.
    """
    p1 = re.split(r'(\d+)\s*(\w+)', product1)
    p2 = re.split(r'(\d+)\s*(\w+)', product2)

    if p1[1] != p2[1]:
        return {
            "similarity_score": 0,
            "are_same": False
        }

    embedding1 = model.encode(normalize_name(p1[0]))
    embedding2 = model.encode(normalize_name(p2[0]))
    
    similarity = cosine_similarity([embedding1], [embedding2])[0][0]
    
    are_same = similarity >= threshold
    
    return {
        "similarity_score": similarity,
        "are_same": are_same
    }

