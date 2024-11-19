import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

function UserForm({ setUser }) {
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    preferencias: [], // Preferencias como un array
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Maneja los cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si es el campo de 'preferencias', convertir la cadena en un array
    if (name === 'preferencias') {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value.split(',').map(item => item.trim()).filter(item => item), // Filtra cualquier valor vacío
      }));
    } else {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validación básica
    if (!userData.nombre || !userData.email || userData.preferencias.length === 0) {
      setError('Por favor, completa todos los campos.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Enviar los datos al servidor
      const response = await fetch('http://localhost:5000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ id: data.id, ...userData });
        setUserData({
          nombre: '',
          email: '',
          preferencias: [],
        });
      } else {
        setError(data.error || 'Error al registrar el usuario.');
      }
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      setError('No se pudo conectar al servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Regístrate</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formNombre">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={userData.nombre}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formPreferencias">
          <Form.Label>Preferencias</Form.Label>
          <Form.Control
            type="text"
            name="preferencias"
            value={userData.preferencias.join(', ')}  
            onChange={handleInputChange}
            placeholder="Acción, Comedia, Drama..."
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" /> Registrando...
            </>
          ) : (
            'Registrarse'
          )}
        </Button>
      </Form>
    </div>
  );
}

export default UserForm;
