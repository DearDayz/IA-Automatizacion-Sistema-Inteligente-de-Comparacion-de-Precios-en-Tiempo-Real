from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re

# Modelo
model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')

def normalize_name(name):
    name = name.lower()
    name = re.sub(r'[^\w\s\%]', ' ', name)  # Eliminar caracteres especiales
    name = re.sub(r'(\s*None\s*)', ' ', name)  # Eliminar None
    name = re.sub(r'(\d+)\s*(gramos|gr|g)(?=\s|$)', r'\1g', name)  # Reemplazar gramos y gr por g, y unir
    name = re.sub(r'(\d+)\s*(lt|lts|litro|litros|l)(?=\s|$)', r'\1l', name)  # Reemplazar lt por l, y unir
    name = re.sub(r'(\d+)\s*(mililitros|ml)(?=\s|$)', r'\1ml', name)  # Reemplazar lt por l, y unir
    name = re.sub(r'(\d+)\s*(und|unds|unidades|unidad)(?=\s|$)', r'\1und', name)  # Reemplazar lt por l, y unir
    name = re.sub(r'(\d+)\s*(kilo|kilos|kilogramos|kilogramo|kg|kgs)(?=\s|$)', r'\1kg', name)  # Reemplazar gramos y gr por g, y unir
    name = re.sub(r'\s+', ' ', name)  # Eliminar espacios extra
    return name.strip()

def compare_products(product, item, product_embedding, item_embedding, threshold=0.8):
    """
    Compara los nombres de dos productos utilizando embeddings y cosine similarity.
    
    Args:
        product (str): Nombre del producto.
        item (str): Nombre del item.
        product_embedding (str): Embedding del producto.
        item_embedding (str): Embedding del item.
        threshold (float): Umbral para determinar si los productos son iguales (por defecto 0.8).
    
    Returns:
        dict: Resultado con la similitud y si son considerados iguales.
    """
    p1 = re.search(r'\d+[a-zA-Z]+', normalize_name(product))
    p2 = re.search(r'\d+[a-zA-Z]+', normalize_name(item))

    if p1 and p2:
        if p1.group(0) != p2.group(0):
            return {
                "similarity_score": 0,
                "are_equal": False,
            }
    
    if (p1 and not p2) or (not p1 and p2):
        return {
            "similarity_score": 0,
            "are_equal": False,
        }
    
    similarity = cosine_similarity([product_embedding], [item_embedding])[0][0]
    
    are_equal = similarity >= threshold

    return {
        "similarity_score": similarity,
        "are_equal": are_equal,
    }

def get_embedding(name):
    """
    Obtiene el embedding de un nombre.
    
    Args:
        name (str): Nombre del producto.
    
    Returns:
        list: Embedding del nombre.
    """
    match = re.search(r'\d+[a-zA-Z]+', name)
    if match:
        formatted_name = name.replace(match.group(0), '')
        return model.encode(normalize_name(formatted_name))
    else:
        return model.encode(normalize_name(name))