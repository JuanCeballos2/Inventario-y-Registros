import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

function PurchaseForm() {
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);  // Estado para los horarios disponibles
  const [purchaseData, setPurchaseData] = useState({
    usuario_id: '',
    pelicula_id: '',
    hora: '',
    cantidad_entradas: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Cargar usuarios y películas al cargar la aplicación
  useEffect(() => {
    fetch('http://localhost:5000/usuarios')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error loading users:', err));

    fetch('http://localhost:5000/peliculas')
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        console.log('Películas cargadas:', data);  // Verifica las películas y sus horarios
      })
      .catch((err) => console.error('Error loading movies:', err));
  }, []);

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setPurchaseData((prevData) => ({ ...prevData, usuario_id: userId }));
  };

  const handleMovieChange = (e) => {
    const movieId = e.target.value;
    console.log('movieId seleccionado:', movieId);

    // Buscar la película por su ID
    const selected = movies.find((movie) => String(movie._id) === movieId);
    console.log('Película encontrada:', selected);

    if (!selected) {
      console.error('No se encontró la película con el ID:', movieId);
      return;
    }

    // Actualizar estado de la película seleccionada
    setSelectedMovie(selected);  // Actualizar selectedMovie

    // Asumiendo que los horarios están en la propiedad `horarios`
    const horariosDisponibles = selected.horarios || [];
    console.log('Horarios disponibles:', horariosDisponibles);

    // Actualizar los horarios en el estado
    setAvailableTimes(horariosDisponibles);  // setAvailableTimes es el setter para el estado de los horarios

    // Actualizar otros datos, como el ID de la película
    setPurchaseData((prevData) => ({ ...prevData, pelicula_id: movieId }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPurchaseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    // Validación de campos obligatorios
    const requiredFields = ['pelicula_id', 'hora', 'cantidad_entradas', 'usuario_id'];
    if (!requiredFields.every((field) => purchaseData[field])) {
      setError('Faltan datos obligatorios: pelicula_id, hora, cantidad_entradas, usuario_id');
      setIsLoading(false);
      return;
    }

    try {
      // Enviar la data al backend
      const response = await fetch('http://localhost:5000/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: purchaseData.usuario_id,  // Debe ser el ObjectId
          pelicula_id: purchaseData.pelicula_id,  // Debe ser el ObjectId
          hora: purchaseData.hora,
          cantidad_entradas: purchaseData.cantidad_entradas,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Ocurrió un error al procesar la compra.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Compra de Entradas</h1>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Selección de usuario */}
        <Form.Group controlId="formUsuario">
          <Form.Label>Usuario</Form.Label>
          <Form.Control as="select" onChange={handleUserChange} required>
            <option value="">Selecciona un usuario</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.nombre}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        {/* Selección de película */}
        <Form.Group controlId="formPelicula">
          <Form.Label>Película</Form.Label>
          <Form.Control as="select" onChange={handleMovieChange} required>
            <option value="">Selecciona una película</option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.titulo}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        {/* Verifica si se ha seleccionado una película */}
        {selectedMovie ? (
          availableTimes.length > 0 ? (
            <Form.Group controlId="formHora">
              <Form.Label>Horario</Form.Label>
              <Form.Control
                as="select"
                name="hora"
                value={purchaseData.hora}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona un horario</option>
                {availableTimes.map((horario, index) => (
                  <option key={index} value={horario}>
                    {new Date(horario).toLocaleString()}  {/* Mostrar el horario en formato local */}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          ) : (
            <p>No hay horarios disponibles para esta película.</p>
          )
        ) : (
          <p>Selecciona una película para ver los horarios.</p>
        )}

        {/* Entrada para cantidad de boletos */}
        <Form.Group controlId="formCantidadEntradas">
          <Form.Label>Cantidad de Entradas</Form.Label>
          <Form.Control
            type="number"
            name="cantidad_entradas"
            value={purchaseData.cantidad_entradas}
            onChange={handleInputChange}
            min="1"
            required
          />
        </Form.Group>

        {/* Botón de compra */}
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" /> Procesando...
            </>
          ) : (
            'Comprar'
          )}
        </Button>
      </Form>
    </div>
  );
}

export default PurchaseForm;
