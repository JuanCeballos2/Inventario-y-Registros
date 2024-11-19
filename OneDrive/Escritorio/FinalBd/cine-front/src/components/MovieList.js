import React, { useState} from 'react';
import { Card, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Importar Link para la navegación

function MovieList({ movies, setMovies, setSelectedMovie }) {
  const [showModal, setShowModal] = useState(false);
  const [newMovie, setNewMovie] = useState({
    titulo: '',
    genero: '',
    duracion: '',
    horarios: [],
  });

  // Manejo del cambio de entrada en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovie((prevMovie) => ({
      ...prevMovie,
      [name]: value,
    }));
  };

  // Manejo de la adición de una nueva película
  const handleAddMovie = (e) => {
    e.preventDefault();
    newMovie.horarios = [
      {
        hora: '18/11/2024 15', // Ejemplo de hora
        asientos_disponibles: 100,
        precio_entrada: 10,
      },
    ];

    // Hacer POST a la API para agregar una nueva película
    fetch('http://localhost:5000/peliculas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMovie),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          setMovies((prevMovies) => [
            ...prevMovies,
            { _id: data.id, ...newMovie }, // Asegúrate de que 'data.id' se asigna correctamente
          ]);
          setShowModal(false); // Cerrar el modal
          setNewMovie({ titulo: '', genero: '', duracion: '', horarios: [] }); // Limpiar el formulario
        }
      })
      .catch((error) => console.error('Error adding movie:', error));
  };

  return (
    <div>
      <h2>Películas Disponibles</h2>
      <Row>
        {movies.map((movie, index) => (
          <Col key={movie._id || index} md={4} className="mb-4"> {/* Usamos index si _id no está presente */}
            <Card>
              <Card.Body>
                <Card.Title>{movie.titulo}</Card.Title>
                <Card.Text>
                  <strong>Género:</strong> {movie.genero}
                  <br />
                  <strong>Duración:</strong> {movie.duracion} min
                </Card.Text>
                {/* Redirige a la página de compra con el id de la película */}
                <Link to={`/compra/${movie._id}`}>
                  <Button variant="primary">
                    Ver Horarios y Comprar
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Button onClick={() => setShowModal(true)} variant="success" className="mt-4">
        Agregar Película
      </Button>

      {/* Modal para agregar nueva película */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nueva Película</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddMovie}>
            <Form.Group controlId="formTitulo">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={newMovie.titulo}
                onChange={handleInputChange}
                placeholder="Ingresa el título de la película"
                required
              />
            </Form.Group>
            <Form.Group controlId="formGenero">
              <Form.Label>Género</Form.Label>
              <Form.Control
                type="text"
                name="genero"
                value={newMovie.genero}
                onChange={handleInputChange}
                placeholder="Ingresa el género de la película"
                required
              />
            </Form.Group>
            <Form.Group controlId="formDuracion">
              <Form.Label>Duración (minutos)</Form.Label>
              <Form.Control
                type="number"
                name="duracion"
                value={newMovie.duracion}
                onChange={handleInputChange}
                placeholder="Ingresa la duración en minutos"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Guardar Película
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default MovieList;
