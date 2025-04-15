# Instalación de Dependencias

1. **Ubicarte en la carpeta del proyecto**:

  ```bash
  cd backend
  ```

2. **Crear un entorno virtual**:

  ```bash
    python -m venv venv
  ```

3. **Activar el entorno virtual**:

- En **Windows**:

  ```bash
  venv\Scripts\activate.bat
  ```

- En **Linux/Mac**:

  ```bash
  source venv/bin/activate
  ```

4. **Instalar las dependencias (Obligatoriamente en el mismo orden)**:

  ```bash
  pip install torch --index-url https://download.pytorch.org/whl/cpu
  pip install -r requirements.txt
  playwright install
  ```
  
## Ejecución del Servidor

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
