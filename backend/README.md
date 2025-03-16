## Instalación de Dependencias

1. **Crear un entorno virtual**:

  ```
    python -m venv venv
  ```

2. **Activar el entorno virtual**:
- En **Windows**:
  ```
  venv\Scripts\activate
  ```
- En **Linux/Mac**:
  ```
  source venv/bin/activate
  ```

3. **Instalar las dependencias**:

  ```
  pip install -r requirements.txt
  ```
  
## Ejecución del Servidor

Para ejecutar el servidor, sigue estos pasos:

1. **Ubicarte en la carpeta del proyecto**:

  ```
  cd backend
  ```

2. **Ejecutar el servidor con Uvicorn**:

  ```
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
  ```

## Acceso a la API

Una vez que el servidor esté en ejecución, puedes acceder a la API mediante la URL:

  ```
  http://localhost:8000
  ```

Para ver la documentación automática de la API, visita:

  ```
  http://localhost:8000/docs
  ```