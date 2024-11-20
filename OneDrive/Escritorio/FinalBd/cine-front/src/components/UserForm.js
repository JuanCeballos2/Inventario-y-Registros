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
  const [newPreference, setNewPreference] = useState('');

  // Maneja los cambios en los campos de texto
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddPreference = () => {
    if (newPreference.trim() && !userData.preferencias.includes(newPreference.trim())) {
      setUserData((prevData) => ({
        ...prevData,
        preferencias: [...prevData.preferencias, newPreference.trim()],
      }));
      setNewPreference(''); // Limpiar el campo de texto
    }
  };

  const handleRemovePreference = (index) => {
    const updatedPreferences = userData.preferencias.filter((_, i) => i !== index);
    setUserData((prevData) => ({
      ...prevData,
      preferencias: updatedPreferences,
    }));
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
          <div>
            <Form.Control
              type="text"
              value={newPreference}
              onChange={(e) => setNewPreference(e.target.value)}
              placeholder="Agregar preferencia"
            />
            <Button variant="secondary" onClick={handleAddPreference} disabled={!newPreference}>
              Agregar
            </Button>
            <ul>
              {userData.preferencias.map((pref, index) => (
                <li key={index}>
                  {pref} <Button variant="danger" onClick={() => handleRemovePreference(index)}>Eliminar</Button>
                </li>
              ))}
            </ul>
          </div>
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
