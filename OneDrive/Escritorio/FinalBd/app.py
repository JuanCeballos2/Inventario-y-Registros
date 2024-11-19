from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from flask_cors import CORS
import logging
import hashlib

app = Flask(__name__)

# Configura el logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Aplicar CORS globalmente a la aplicación
CORS(app)

# Conexión a MongoDB Atlas
client = MongoClient("mongodb+srv://juanceballos2:Solofutbol12.@cluster0.cdw9k.mongodb.net/")  # Conectar a MongoDB Atlas
db = client["cine"]

# Función para encriptar el ID antes de insertarlo
def encrypt_id(user_id: str):
    # Usamos hashlib para encriptar el ID (puedes elegir otro algoritmo de encriptación si lo prefieres)
    hashed_id = hashlib.sha256(user_id.encode('utf-8')).hexdigest()
    return ObjectId(hashed_id[:24])  # Mongo ObjectId debe ser de 24 caracteres hexadecimales

# Ruta para registrar un nuevo usuario
@app.route('/usuarios', methods=['POST'])
def registrar_usuario():
    datos = request.json
    encrypted_id = encrypt_id(datos["nombre"])  # Encriptamos el nombre del usuario para generar el id
    nuevo_usuario = {
        "_id": encrypted_id,  # Guardamos el id como ObjectId
        "nombre": datos["nombre"],
        "email": datos["email"],
        "historial_compras": [],
        "preferencias": datos.get("preferencias", [])
    }
    result = db.usuarios.insert_one(nuevo_usuario)
    return jsonify({"id": str(result.inserted_id), "message": "Usuario registrado con éxito"}), 201

# Ruta para listar todos los usuarios
@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    usuarios = list(db.usuarios.find({}, {"_id": 0}))  # Excluir el campo "_id"
    return jsonify(usuarios)

# Ruta para listar todas las películas
@app.route('/peliculas', methods=['GET'])
def listar_peliculas():
    peliculas = list(db.peliculas.find({}, {"_id": 0}))  # Excluir el campo "_id"
    return jsonify(peliculas)

# Ruta para registrar una nueva película
@app.route('/peliculas', methods=['POST'])
def registrar_pelicula():
    datos = request.json
    nueva_pelicula = {
        "titulo": datos["titulo"],
        "genero": datos["genero"],
        "duracion": datos["duracion"],
        "horarios": datos["horarios"]
    }
    result = db.peliculas.insert_one(nueva_pelicula)
    return jsonify({"id": str(result.inserted_id), "message": "Película registrada con éxito"}), 201


@app.route('/transacciones', methods=['POST'])
def comprar_entradas():
    datos = request.json
    logging.info(f"Datos recibidos: {datos}")

    # Validar datos obligatorios
    required_fields = ["usuario_nombre", "pelicula_nombre", "hora", "cantidad_entradas"]
    if not all(datos.get(field) for field in required_fields):
        return jsonify({"error": "Faltan datos obligatorios: usuario_nombre, pelicula_nombre, hora, cantidad_entradas"}), 400

    # Buscar al usuario por su nombre
    usuario_nombre = datos["usuario_nombre"]
    usuario = db.usuarios.find_one({"nombre": usuario_nombre})

    if not usuario:
        logging.info(f"Usuario no encontrado: {usuario_nombre}")
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Recuperar el ObjectId del usuario
    usuario_id = usuario["_id"]

    # Buscar la película por nombre
    pelicula_nombre = datos["pelicula_nombre"]
    pelicula = db.peliculas.find_one({"titulo": pelicula_nombre})

    if not pelicula:
        logging.info(f"Película no encontrada: {pelicula_nombre}")
        return jsonify({"error": "Película no encontrada"}), 404

    # Validar formato de la hora
    HORA_FORMATO = "%d/%m/%Y %H:%M"  # Formato esperado: 19/11/2024 15:30
    try:
        compra_hora = datetime.strptime(datos["hora"].strip(), HORA_FORMATO)  # Convertir a datetime
    except ValueError:
        return jsonify({"error": f"Formato de hora inválido. Usa {HORA_FORMATO}."}), 400

    # Log para la hora validada
    logging.info(f"Hora de la compra validada: {compra_hora}")

    # Buscar el horario específico en los horarios de la película
    horario = next((h for h in pelicula.get("horarios", []) if h["hora"] == datos["hora"].strip()), None)
    if not horario:
        logging.info(f"Horario no encontrado o no coincide: {datos['hora']}")
        return jsonify({"error": "Horario no encontrado o no coincide"}), 404

    # Validar asientos disponibles
    if horario["asientos_disponibles"] < datos["cantidad_entradas"]:
        return jsonify({"error": "No hay suficientes asientos disponibles"}), 400

    # Registrar la transacción
    nueva_transaccion = {
        "usuario_id": str(usuario_id),  # Guardar el ObjectId como string
        "pelicula_id": pelicula["titulo"],
        "horario": compra_hora.strftime(HORA_FORMATO),  # Guardar la hora en formato original
        "cantidad_entradas": datos["cantidad_entradas"],
        "total_pagado": datos["cantidad_entradas"] * horario["precio_entrada"],
        "fecha_transaccion": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
    }
    db.transacciones.insert_one(nueva_transaccion)

    # Actualizar asientos disponibles
    db.peliculas.update_one(
        {"titulo": pelicula["titulo"], "horarios.hora": datos["hora"].strip()},
        {"$inc": {"horarios.$.asientos_disponibles": -datos["cantidad_entradas"]}}
    )

    logging.info("Compra realizada con éxito")
    return jsonify({"message": "Compra realizada con éxito"}), 201
# Ruta principal
@app.route('/')
def home():
    return "¡Bienvenido al sistema de gestión de cine!"


# Ruta para favicon
@app.route('/favicon.ico')
def favicon():
    return '', 204  # Responde con un estado 204 No Content


if __name__ == '__main__':
    app.run(debug=True)
