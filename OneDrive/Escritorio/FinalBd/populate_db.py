from pymongo import MongoClient

# Conectar a MongoDB Atlas
client = MongoClient("mongodb+srv://juanceballos2:Solofutbol12.@cluster0.cdw9k.mongodb.net/")  # Conéctate a MongoDB Atlas
db = client["cine"]

# Insertar usuarios
db.usuarios.insert_many([
    {"nombre": "Juan Pérez", "email": "juan@example.com", "historial_compras": [], "preferencias": ["Acción", "Comedia"]},
    {"nombre": "Ana López", "email": "ana@example.com", "historial_compras": [], "preferencias": ["Drama", "Romance"]}
])

# Insertar películas
db.peliculas.insert_many([
    {
        "titulo": "Avengers: Endgame",
        "genero": "Accion",
        "duracion": 180,
        "horarios": [
            {"hora": "2024-11-18T15:00:00", "asientos_disponibles": 100, "precio_entrada": 10.0},
            {"hora": "2024-11-18T20:00:00", "asientos_disponibles": 50, "precio_entrada": 12.0}
        ]
    },
    {
        "titulo": "The Notebook",
        "genero": "Romance",
        "duracion": 123,
        "horarios": [
            {"hora": "2024-11-18T17:00:00", "asientos_disponibles": 80, "precio_entrada": 8.0}
        ]
    }
])
