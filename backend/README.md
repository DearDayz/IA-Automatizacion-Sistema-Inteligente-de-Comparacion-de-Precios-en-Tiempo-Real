# Instalación de Dependencias

1. **Ubicarte en la carpeta del proyecto**:

  ```bash
  cd backend
  ```

2. **Crear un entorno virtual**:

  ```bash
    python -m venv venv
  ```

<<<<<<< HEAD
3. **Activar el entorno virtual**:

=======
2. **Activar el entorno virtual**:
>>>>>>> origin/Ale
- En **Windows**:

  ```bash
  venv\Scripts\activate
  ```

- En **Linux/Mac**:

  ```bash
  source venv/bin/activate
  ```

3. **Instalar las dependencias (Obligatoriamente en el mismo orden)**:

  ```bash
  pip install torch --index-url https://download.pytorch.org/whl/cpu
  pip install -r requirements.txt
  playwright install
  ```
  
## Ejecución del Servidor

Para ejecutar el servidor, sigue estos pasos:

1. **Ubicarte en la carpeta del proyecto**:

  ```bash
  cd backend
  ```

2. **Ejecutar el servidor**:

  ```bash
  fastapi dev main.py
  ```

## Acceso a la API

Una vez que el servidor esté en ejecución, puedes acceder a la API mediante la URL:

  ```bash
  http://127.0.0.1:8000/
  ```

Para ver la documentación automática de la API, visita:

  ```bash
  http://127.0.0.1:8000/docs
  ```
