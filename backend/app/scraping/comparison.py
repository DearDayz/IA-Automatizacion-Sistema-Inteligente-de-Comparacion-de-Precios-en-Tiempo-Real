from sentence_transformers import SentenceTransformer
import re

# Modelo
model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')

def normalize_name(name):
    name = name.lower()
    name = re.sub(r'[^\w\s\%]', ' ', name)  # Eliminar caracteres especiales
    name = re.sub(r'(\s*None\s*)', ' ', name)  # Eliminar None
    
    # Normalizar unidades
    name = re.sub(r'(\d+)\s*(gramos|gr|g)(?=\s|$)', r'\1g', name) 
    name = re.sub(r'(\d+)\s*(lt|lts|litro|litros|l)(?=\s|$)', r'\1l', name)  
    name = re.sub(r'(\d+)\s*(mililitros|ml)(?=\s|$)', r'\1ml', name)  
    name = re.sub(r'(\d+)\s*(und|unds|unidades|unidad)(?=\s|$)', r'\1und', name)  
    name = re.sub(r'(\d+)\s*(kilo|kilos|kilogramos|kilogramo|kg|kgs)(?=\s|$)', r'\1kg', name)  
    name = re.sub(r'\s+', ' ', name)  # Eliminar espacios extra
    return name.strip()

def compare_units(product, item):
    """
    Compara las unidades de dos productos.
    
    Args:
        product (str): Nombre del producto.
        item (str): Nombre del item.
    
    Returns:
        dict: Si son considerados iguales.
    """
    p1 = re.search(r'\d+[a-zA-Z]+', normalize_name(product))
    p2 = re.search(r'\d+[a-zA-Z]+', normalize_name(item))

    if p1 and p2:
        if p1.group(0) != p2.group(0):
            return {"are_equal": False}
    
    if (p1 and not p2) or (not p1 and p2):
        return {"are_equal": False}
    
    return {"are_equal": True}

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