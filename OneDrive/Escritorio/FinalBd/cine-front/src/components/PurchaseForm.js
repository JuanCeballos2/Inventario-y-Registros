import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

function PurchaseForm() {
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [purchaseData, setPurchaseData] = useState({
    usuario_id: '',
    pelicula_nombre: '',
    hora: '',
    cantidad_entradas: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar usuarios
    fetch('http://localhost:5000/usuarios')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error loading users:', err));

    // Cargar películas
    fetch('http://localhost:5000/peliculas')
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.error('Error loading movies:', err));

     // Cargar películas
     fetch('http://localhost:5000/transacciones')
     .then((res) => res.json())
     .then((data) => setMovies(data))
     .catch((err) => console.error('Error loading transacciones:', err));
 }, []);
  
  

  const handleUserChange = (e) => {
    const userName = e.target.value; // El nombre del usuario
    setPurchaseData((prevData) => ({ ...prevData, usuario_id: userName }));
};


  const handleMovieChange = (event) => {
    const selectedTitle = event.target.value;
    
    const movie = movies.find((movie) => movie.titulo === selectedTitle);
    if (movie) {
      setSelectedMovie(movie); // Establece la película seleccionada
      setPurchaseData((prevData) => ({
        ...prevData,
        pelicula_nombre: movie.titulo, // Asigna el nombre de la película seleccionada
      }));
    } else {
      console.error("No se encontró la película con el título:", selectedTitle);
    }
  };

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
    setPurchaseData((prevData) => ({
      ...prevData,
      hora: event.target.value,
    }));
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

    const requiredFields = ['pelicula_nombre', 'hora', 'cantidad_entradas', 'usuario_id'];
    if (!requiredFields.every((field) => purchaseData[field])) {
      setError('Faltan datos obligatorios: pelicula_nombre, hora, cantidad_entradas, usuario_id');
      setIsLoading(false);
      return;
    }

    try {
      // Convertir la hora al formato adecuado para el backend (%d/%m/%Y %H:%M)
      const date = new Date(purchaseData.hora);
      const formattedHour = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

      // Actualizamos la hora con el formato adecuado
      const updatedData = { ...purchaseData, hora: formattedHour };

      console.log("Datos de la compra antes de enviar:", updatedData);  // Log para verificar

      const response = await fetch('http://localhost:5000/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
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

        <Form.Group controlId="formPelicula">
          <Form.Label>Película</Form.Label>
          <Form.Control as="select" onChange={handleMovieChange} required>
            <option value="">Selecciona una película</option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie.titulo}>
                {movie.titulo}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        {selectedMovie && (
          <Form.Group controlId="formHora">
            <Form.Label>Horario</Form.Label>
            <Form.Control
              as="select"
              value={purchaseData.hora}
              onChange={handleTimeChange}
              required
            >
              <option value="">Selecciona un horario</option>
              {selectedMovie.horarios.map((horario, index) => (
                <option key={index} value={horario.hora}>
                  {new Date(horario.hora).toLocaleString()} - {horario.precio_entrada}€
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        )}

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

        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? <Spinner animation="border" size="sm" /> : 'Comprar'}
        </Button>
      </Form>
    </div>
  );
}

export default PurchaseForm;
