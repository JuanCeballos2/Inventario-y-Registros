import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom'; // Usamos useNavigate para redirigir
import '../App.css';  // Subir un nivel desde "components" a la carpeta "src"
import '../index.css';

function PurchaseForm() {
  const { id } = useParams(); // Obtiene el id de la URL
  const navigate = useNavigate(); // Usamos useNavigate para redirigir
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [purchaseData, setPurchaseData] = useState({
    usuario_nombre: '',
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

    if (id) {
      console.log('ID obtenido de la URL:', id);  // Log para verificar el id
    }
  }, [id]);

  const handleUserChange = (e) => {
    const userName = e.target.value;
    setPurchaseData((prevData) => ({ ...prevData, usuario_nombre: userName }));
  };

  const handleMovieChange = (event) => {
    const selectedTitle = event.target.value;

    const movie = movies.find((movie) => movie.titulo === selectedTitle);
    if (movie) {
      setSelectedMovie(movie);
      setPurchaseData((prevData) => ({
        ...prevData,
        pelicula_nombre: movie.titulo,
      }));
    } else {
      console.error('No se encontró la película con el título:', selectedTitle);
    }
  };

  const handleTimeChange = (event) => {
    const selectedTime = event.target.value;  // Solo obtenemos la hora seleccionada
    setPurchaseData((prevData) => ({
      ...prevData,
      hora: selectedTime,  // Solo almacenamos la hora seleccionada, no la fecha
    }));
  
    console.log('Hora seleccionada:', selectedTime);  // Log para verificar
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
  
    const requiredFields = ['pelicula_nombre', 'hora', 'cantidad_entradas', 'usuario_nombre'];
    if (!requiredFields.every((field) => purchaseData[field])) {
      setError('Faltan datos obligatorios: pelicula_nombre, hora, cantidad_entradas, usuario_nombre');
      setIsLoading(false);
      return;
    }
  
    try {
      // Verifica que la hora esté en el formato correcto (ya está combinada correctamente)
      const updatedData = { ...purchaseData };  // Ya tenemos la hora correctamente formateada
  
      console.log('Datos de la compra antes de enviar:', updatedData);  // Verifica el formato correcto de la hora
  
      // Enviar los datos al backend
      const response = await fetch('http://localhost:5000/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage(data.message);
        navigate(`/transacciones/${data.id}`);
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
              <option key={user._id} value={user.nombre}>
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

        {selectedMovie && selectedMovie.horarios && (
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
                {horario.hora} - {horario.precio_entrada}€
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
