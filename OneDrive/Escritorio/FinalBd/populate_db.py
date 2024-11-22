from pymongo import MongoClient
from datetime import datetime

# Conectar a MongoDB Atlas
client = MongoClient("mongodb+srv://juanceballos2:Solofutbol12.@cluster0.cdw9k.mongodb.net/")  # Conéctate a MongoDB Atlas
db = client["cine"]

# Función para convertir el formato de fecha
def convertir_fecha(fecha_str):
    # Convertir la cadena de fecha al formato datetime
    fecha_obj = datetime.strptime(fecha_str, "%Y/%m/%d %H:%M")
    # Devolver la fecha en el formato deseado
    return fecha_obj.strftime("%d/%m/%Y %H:%M")

# Insertar usuarios
db.usuarios.insert_many([
    {"nombre": "Juan Pérez", "email": "juan@example.com", "historial_compras": [], "preferencias": ["Acción", "Comedia"]},
    {"nombre": "Ana López", "email": "ana@example.com", "historial_compras": [], "preferencias": ["Drama", "Romance"]}
])

# Insertar películas con fechas convertidas
db.peliculas.insert_many([
    {
        "titulo": "Avengers: Endgame",
        "genero": "Accion",
        "duracion": 180,
        "horarios": [
            {"hora": convertir_fecha("2024/11/18 15:00"), "asientos_disponibles": 100, "precio_entrada": 10.0},
            {"hora": convertir_fecha("2024/11/18 20:00"), "asientos_disponibles": 50, "precio_entrada": 12.0}
        ]
    },
    {
        "titulo": "The Notebook",
        "genero": "Romance",
        "duracion": 123,
        "horarios": [
            {"hora": convertir_fecha("2024/11/18 17:00"), "asientos_disponibles": 80, "precio_entrada": 8.0}
        ]
    },
    {
        "titulo": "The Dark Knight",
        "genero": "Accion",
        "duracion": 152,
        "horarios": [
            {"hora": convertir_fecha("2024/11/19 13:30"), "asientos_disponibles": 150, "precio_entrada": 10.0},
            {"hora": convertir_fecha("2024/11/19 19:00"), "asientos_disponibles": 70, "precio_entrada": 12.0}
        ]
    },
    {
        "titulo": "Inception",
        "genero": "Ciencia Ficcion",
        "duracion": 148,
        "horarios": [
            {"hora": convertir_fecha("2024/11/20 14:00"), "asientos_disponibles": 120, "precio_entrada": 11.0},
            {"hora": convertir_fecha("2024/11/20 21:00"), "asientos_disponibles": 60, "precio_entrada": 13.0}
        ]
    },
    {
        "titulo": "Titanic",
        "genero": "Drama",
        "duracion": 195,
        "horarios": [
            {"hora": convertir_fecha("2024/11/21 16:00"), "asientos_disponibles": 100, "precio_entrada": 9.0},
            {"hora": convertir_fecha("2024/11/21 22:00"), "asientos_disponibles": 50, "precio_entrada": 12.5}
        ]
    },
    {
        "titulo": "Spider-Man: No Way Home",
        "genero": "Accion",
        "duracion": 148,
        "horarios": [
            {"hora": convertir_fecha("2024/11/22 12:00"), "asientos_disponibles": 180, "precio_entrada": 11.0},
            {"hora": convertir_fecha("2024/11/22 18:00"), "asientos_disponibles": 85, "precio_entrada": 13.0}
        ]
    },
    {
        "titulo": "Lilo y Stich",
        "genero": "Animado",
        "duracion": 150,
        "horarios": [
            {"hora": convertir_fecha("2024/12/25 17:00"), "asientos_disponibles": 150, "precio_entrada": 12.0},
            {"hora": convertir_fecha("2024/11/22 18:00"), "asientos_disponibles": 50, "precio_entrada": 20.0}
        ]
    }
])

def registrar_transaccion(usuario_nombre, pelicula_titulo, horario, cantidad_entradas):
    # Buscar al usuario por nombre
    usuario = db.usuarios.find_one({"nombre": usuario_nombre})
    if not usuario:
        print("Usuario no encontrado")
        return
    
    # Buscar la película
    pelicula = db.peliculas.find_one({"titulo": pelicula_titulo})
    if not pelicula:
        print("Película no encontrada")
        return
    
    # Buscar el horario de la película
    horario_data = None
    for h in pelicula["horarios"]:
        if h["hora"] == horario:
            horario_data = h
            break
    
    if not horario_data:
        print("Horario no encontrado")
        return
    
    # Verificar si hay asientos disponibles
    if horario_data["asientos_disponibles"] < cantidad_entradas:
        print("No hay suficientes asientos disponibles")
        return
    
    # Calcular el total pagado
    total_pagado = cantidad_entradas * horario_data["precio_entrada"]
    
    # Crear la transacción
    transaccion = {
        "usuario_id": usuario["_id"],
        "pelicula_titulo": pelicula["titulo"],
        "horario": horario_data["hora"],
        "cantidad_entradas": cantidad_entradas,
        "total_pagado": total_pagado,
        "fecha_transaccion": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    }

    # Insertar la transacción en la base de datos
    db.transacciones.insert_one(transaccion)

    # Actualizar la cantidad de asientos disponibles
    db.peliculas.update_one(
        {"titulo": pelicula["titulo"], "horarios.hora": horario},
        {"$inc": {"horarios.$.asientos_disponibles": -cantidad_entradas}}
    )
    
    print(f"Transacción registrada con éxito: {transaccion}")

