from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from flask_cors import CORS
import logging
import hashlib

app = Flask(__name__)

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Habilitar CORS para todas las rutas
CORS(app)

# Conexión a MongoDB Atlas
client = MongoClient("mongodb+srv://juanceballos2:Solofutbol12.@cluster0.cdw9k.mongodb.net/")
db = client["cine"]

# Función para encriptar un ID (opcional)
def encrypt_id(user_id: str):
    hashed_id = hashlib.sha256(user_id.encode('utf-8')).hexdigest()
    return ObjectId(hashed_id[:24])

# Ruta para registrar un usuario
@app.route('/usuarios', methods=['POST'])
def registrar_usuario():
    datos = request.json
    encrypted_id = encrypt_id(datos["nombre"])  # Encriptar nombre como id
    nuevo_usuario = {
        "_id": encrypted_id,
        "nombre": datos["nombre"],
        "email": datos["email"],
        "historial_compras": [],
        "preferencias": datos.get("preferencias", [])
    }
    result = db.usuarios.insert_one(nuevo_usuario)
    return jsonify({"id": str(result.inserted_id), "message": "Usuario registrado con éxito"}), 201

# Ruta para listar usuarios
@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    usuarios = list(db.usuarios.find({}, {"_id": 0}))  # Excluir campo "_id"
    return jsonify(usuarios)

# Ruta para listar películas
@app.route('/peliculas', methods=['GET'])
def listar_peliculas():
    peliculas = list(db.peliculas.find({}, {"_id": 0}))  # Excluir campo "_id"
    return jsonify(peliculas)

# Ruta para registrar una película
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

# Ruta para obtener el historial de compras de un usuario
@app.route('/usuarios/<nombre_usuario>/historial', methods=['GET'])
def obtener_historial_compras(nombre_usuario):
    # Buscar al usuario por su nombre
    usuario = db.usuarios.find_one({"nombre": nombre_usuario})
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Retornar el historial de compras
    return jsonify({"historial_compras": usuario.get("historial_compras", [])})


# Ruta para realizar la compra de entradas
@app.route('/transacciones', methods=['POST'])
def comprar_entradas():
    datos = request.json
    logging.info(f"Datos recibidos: {datos}")

    # Validar datos obligatorios
    required_fields = ["usuario_nombre", "pelicula_nombre", "hora", "cantidad_entradas"]
    if not all(datos.get(field) for field in required_fields):
        return jsonify({"error": "Faltan datos obligatorios: usuario_nombre, pelicula_nombre, hora, cantidad_entradas"}), 400

    # Validar formato de la hora en el cliente
    HORA_FORMATO = "%d/%m/%Y %H:%M"
    try:
        compra_hora = datetime.strptime(datos["hora"].strip(), HORA_FORMATO)
    except ValueError:
        logging.error(f"Hora en formato inválido: {datos['hora']}")
        return jsonify({"error": f"Formato de hora inválido. Usa {HORA_FORMATO}."}), 400

    # Buscar al usuario por su nombre
    usuario = db.usuarios.find_one({"nombre": datos["usuario_nombre"]})
    if not usuario:
        logging.error(f"Usuario no encontrado: {datos['usuario_nombre']}")
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Buscar la película por su título
    pelicula = db.peliculas.find_one({"titulo": datos["pelicula_nombre"]})
    if not pelicula:
        logging.error(f"Película no encontrada: {datos['pelicula_nombre']}")
        return jsonify({"error": "Película no encontrada"}), 404

    # Buscar el horario específico en la película
    horario = next((h for h in pelicula.get("horarios", []) if h["hora"] == datos["hora"].strip()), None)
    if not horario:
        logging.error(f"Horario no encontrado: {datos['hora']}")
        return jsonify({"error": "Horario no encontrado o no coincide"}), 404

    # Validar asientos disponibles
    if horario["asientos_disponibles"] < int(datos["cantidad_entradas"]):
        logging.error(f"Asientos insuficientes para la hora {datos['hora']}")
        return jsonify({"error": "No hay suficientes asientos disponibles"}), 400

    # Registrar la transacción
    nueva_transaccion = {
        "usuario_id": str(usuario["_id"]),
        "usuario_nombre": usuario["nombre"],
        "pelicula_id": pelicula["titulo"],
        "pelicula_nombre": pelicula["titulo"],
        "horario": datos["hora"],
        "cantidad_entradas": int(datos["cantidad_entradas"]),
        "total_pagado": int(datos["cantidad_entradas"]) * horario["precio_entrada"],
        "fecha_transaccion": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
    }
    result = db.transacciones.insert_one(nueva_transaccion)

    # Actualizar los asientos disponibles
    db.peliculas.update_one(
        {"titulo": pelicula["titulo"], "horarios.hora": datos["hora"].strip()},
        {"$inc": {"horarios.$.asientos_disponibles": -int(datos["cantidad_entradas"])}}
    )
    # Agregar la compra al historial de compras del usuario
    compra_detalle = {
        "pelicula_nombre": pelicula["titulo"],
        "hora": datos["hora"],
        "cantidad_entradas": int(datos["cantidad_entradas"]),
        "total_pagado": int(datos["cantidad_entradas"]) * horario["precio_entrada"],
        "fecha_transaccion": nueva_transaccion["fecha_transaccion"]
    }

    db.usuarios.update_one(
        {"_id": usuario["_id"]},
        {"$push": {"historial_compras": compra_detalle}}  # Se agrega la compra al historial
    )

    

    logging.info("Compra realizada con éxito")
    return jsonify({
        "message": "Compra realizada con éxito",
        "id": str(result.inserted_id)
    }), 201

# Ruta principal
@app.route('/')
def home():
    return "¡Bienvenido al sistema de gestión de cine!"

# Ruta para favicon
@app.route('/favicon.ico')
def favicon():
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)
