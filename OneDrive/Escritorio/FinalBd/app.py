from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from flask_cors import CORS
import logging

app = Flask(__name__)

# Configura el logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Aplicar CORS globalmente a la aplicación
CORS(app)

# Conexión a MongoDB Atlas
client = MongoClient("mongodb+srv://juanceballos2:Solofutbol12.@cluster0.cdw9k.mongodb.net/")  # Conectar a MongoDB Atlas
db = client["cine"]

# Ruta para registrar un nuevo usuario
@app.route('/usuarios', methods=['POST'])
def registrar_usuario():
    datos = request.json
    nuevo_usuario = {
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

# Ruta para realizar una compra
@app.route('/transacciones', methods=['POST'])
def comprar_entradas():
    datos = request.json
    logging.info(f"Datos recibidos: {datos}")

    # Validar datos obligatorios
    required_fields = ["pelicula_nombre", "hora", "cantidad_entradas", "usuario_id"]
    if not all(datos.get(field) for field in required_fields):
        return jsonify({"error": "Faltan datos obligatorios: pelicula_nombre, hora, cantidad_entradas, usuario_id"}), 400

    # Buscar la película por nombre
    pelicula_nombre = datos["pelicula_nombre"]
    pelicula = db.peliculas.find_one({"titulo": pelicula_nombre})

    if not pelicula:
        logging.info(f"Película no encontrada: {pelicula_nombre}")
        return jsonify({"error": "Película no encontrada"}), 404

    # Buscar al usuario por nombre
    usuario_nombre = datos["usuario_id"]
    logging.info(f"Buscando usuario con el nombre: {usuario_nombre}")
    usuario = db.usuarios.find_one({"nombre": usuario_nombre})

    if not usuario:
        logging.info(f"Usuario no encontrado: {usuario_nombre}")
        return jsonify({"error": "Usuario no encontrado"}), 404

    try:
        pelicula_id = pelicula["_id"]
        usuario_id = usuario["_id"]
    except Exception as e:
        logging.error(f"Error al obtener el ID de la película o usuario: {e}")
        return jsonify({"error": "ID inválido"}), 400

    # Validar formato de la hora
    HORA_FORMATO = "%d/%m/%Y %H:%M"
    try:
        compra_hora = datetime.strptime(datos["hora"], HORA_FORMATO)
    except ValueError:
        return jsonify({"error": f"Formato de hora inválido. Usa {HORA_FORMATO}."}), 400

    # Buscar el horario específico
    horario = next(
        (h for h in pelicula.get("horarios", []) if h["hora"] == datos["hora"]),
        None
    )
    if not horario:
        logging.info(f"Horario no encontrado o no coincide: {datos['hora']}")
        return jsonify({"error": "Horario no encontrado o no coincide"}), 404

    # Validar asientos disponibles
    if horario["asientos_disponibles"] < datos["cantidad_entradas"]:
        return jsonify({"error": "No hay suficientes asientos disponibles"}), 400

    # Actualizar los datos en la base de datos
    try:
        with client.start_session() as session:
            with session.start_transaction():
                # Reducir asientos disponibles
                horario["asientos_disponibles"] -= datos["cantidad_entradas"]
                db.peliculas.update_one(
                    {"_id": pelicula["_id"]},
                    {"$set": {"horarios": pelicula["horarios"]}},
                    session=session
                )

                # Registrar la transacción
                nueva_transaccion = {
                    "usuario_id": str(usuario_id),
                    "pelicula_id": str(pelicula["_id"]),
                    "titulo_pelicula": pelicula["titulo"],
                    "horario": datos["hora"],
                    "cantidad_entradas": datos["cantidad_entradas"],
                    "total_pagado": datos["cantidad_entradas"] * horario.get("precio_entrada", 10),
                    "fecha_transaccion": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                }
                db.transacciones.insert_one(nueva_transaccion, session=session)

                # Actualizar historial del usuario
                db.usuarios.update_one(
                    {"_id": usuario["_id"]},
                    {"$push": {"historial_compras": nueva_transaccion}},
                    session=session
                )

        logging.info("Compra realizada con éxito")
        return jsonify({"message": "Compra realizada con éxito"}), 201

    except Exception as e:
        logging.error(f"Error al realizar la compra: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500


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
